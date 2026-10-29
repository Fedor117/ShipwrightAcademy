window.TOPIC_PART = [
  {
    "id": "case-fps",
    "title": "Case study: FPS shooter",
    "minutes": 19,
    "summary": "How a first-person shooter fits movement, aim, weapons, hit detection, AI, netcode and level visibility into one 16 ms frame, and why each choice was made.",
    "lesson": [
      {
        "type": "p",
        "text": "A player peeks a corner on an 80 ms connection, puts the crosshair on a head and clicks. On his screen the target flinches and a hit marker flashes. On the server the target stepped behind the wall 90 ms earlier, so the answer depends entirely on how the team built hit detection. Meanwhile a campaign level has 12 enemies, a 16.6 ms frame budget, and a designer who wants every firefight to feel fair. A first-person shooter is a stack of small systems that all have to agree on one thing: what the player saw, when he saw it, and what he was allowed to do about it."
      },
      {
        "type": "h",
        "text": "Components"
      },
      {
        "type": "p",
        "text": "Think of one server tick (15.6 ms at 64 Hz) as a pipeline. Input commands come in, movement runs, weapons fire, hit detection resolves, damage applies, and snapshots go out. The client runs a copy of the first stages ahead of time so the player never waits for the network."
      },
      {
        "type": "list",
        "items": [
          "**Input and camera.** Raw mouse deltas and key state become a command per tick: move axes, view angles, buttons, a timestamp.",
          "**Character controller.** A kinematic capsule moved by shared code, identical on client and server so prediction works.",
          "**Weapons.** Data assets (rate, damage, spread, recoil) read by one fire routine; hitscan or projectile.",
          "**Hit detection.** Rays or sweeps against per-bone hitboxes, after the server rewinds them to the shooter's view time.",
          "**Feedback.** Hit markers, sounds, decals and tracers, mostly cosmetic and driven from events, not polled.",
          "**AI.** Perception, navigation, a decision layer and a token system. Runs on the server only; clients see the result as replicated entities.",
          "**Level and audio.** Visibility data, sightlines and occlusion that serve rendering, AI and sound at once."
        ]
      },
      {
        "type": "h",
        "text": "Player movement"
      },
      {
        "type": "p",
        "text": "Shooter movement is not physics simulation. It is a hand-tuned velocity model on a kinematic capsule. The classic Quake family model has two steps per tick. First apply **friction**: reduce speed by `max(speed, stopSpeed) * friction * dt`. Then **accelerate** toward the wish direction (the direction the keys ask for). Quake 3 uses about 320 units/s run speed, friction 6, ground acceleration 10 and air acceleration 1, with the stop speed at 100 units/s so low speeds decay quickly instead of creeping."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "// Quake-style acceleration. Same code and same dt on client and server.\nVector3 Accelerate(Vector3 vel, Vector3 wishDir, float wishSpeed, float accel, float dt)\n{\n    float current = Vector3.Dot(vel, wishDir);   // speed already along wishDir\n    float add = wishSpeed - current;             // room left in that direction\n    if (add <= 0f) return vel;\n    float gain = Mathf.Min(accel * wishSpeed * dt, add);\n    return vel + wishDir * gain;\n}\n\nvoid GroundMove(ref Vector3 vel, Vector3 wishDir, float dt)\n{\n    float speed = vel.magnitude;\n    if (speed > 0.01f)                           // friction first\n    {\n        float drop = Mathf.Max(speed, stopSpeed) * friction * dt;\n        vel *= Mathf.Max(speed - drop, 0f) / speed;\n    }\n    vel = Accelerate(vel, wishDir, maxSpeed, groundAccel, dt);\n}"
      },
      {
        "type": "p",
        "text": "The clamp is on the speed **along the wish direction**, not on total speed. That one choice creates **air control**. In the air there is no friction, and turning the mouse while holding a strafe key rotates the wish direction, so each tick there is fresh room to add speed. Players gain speed beyond the run limit (strafe jumping, bunny hopping). Source engine games clamp the wish speed to 30 units/s in the air but allow a large air acceleration, which keeps the effect while limiting its size. Modern console shooters usually cap horizontal speed and give limited, slower air steering. Keeping the quirk gives a skill ceiling and a movement subculture. Removing it makes the game easier to learn and the maps easier to balance."
      },
      {
        "type": "p",
        "text": "Around that sits the **character controller**. It is a capsule (about 0.4 m radius, 1.8 m tall for a standing player) swept through the world, not a rigid body. Each tick the controller sweeps the capsule along the velocity, and on contact projects the remaining motion onto the hit plane and sweeps again, up to about four times. Unity's `CharacterController` does this for you, with defaults of a 45 degree slope limit and a 0.3 m step offset. Three details decide how the movement feels:"
      },
      {
        "type": "list",
        "items": [
          "**Step-up.** Raise the capsule by the step height, sweep forward, then sweep down to the floor. If the landing surface is walkable and within the step limit, keep the result. Stairs then feel like flat ground.",
          "**Crouch.** Shrink the capsule (about 1.8 m to 1.0 m) and lower the eye. To stand, first test the tall capsule for overlap, or the player pops into the ceiling.",
          "**Ground check.** Treat a slope as ground only below the slope limit. Above it the player slides, which stops wall climbing without invisible walls."
        ]
      },
      {
        "type": "h",
        "text": "Camera, input and the view model"
      },
      {
        "type": "p",
        "text": "Aim is the one place where the game must not be clever. Read **raw mouse deltas** (the Input System's `Mouse.delta` or the OS raw-input API), never the cursor position, so OS pointer acceleration and screen edges cannot change the result. Convert counts to angle linearly: `yaw += counts * sensitivity * 0.022` degrees, the constant used by Quake and Source. At 800 DPI and sensitivity 1.0 that is 360 degrees per about 20 inches, which is why players can carry a sensitivity value between games. No smoothing and no acceleration: both add latency or make the same hand motion produce different angles. Apply look every rendered frame (at 240 fps the view updates every 4.2 ms instead of every 15.6 ms tick) and put the angles into the next command. **Field of view** is a gameplay setting. Players expect a horizontal FOV of around 90 degrees, adjustable up to 100 to 120. Unity's `Camera.fieldOfView` is vertical, so convert: `vfov = 2 * atan(tan(hfov / 2) / aspect)`. A 90 degree horizontal FOV at 16:9 is about 58.7 degrees vertical. Define the slider at 16:9 and keep that vertical FOV on wider screens (Hor+), so an ultrawide shows more at the sides instead of cropping the top and bottom."
      },
      {
        "type": "p",
        "text": "The weapon in the player's hands is a **view model**. If it lives in the world camera, it clips into walls when you stand close, and raising the world FOV to 110 stretches it. The fix is a second camera that renders only the view-model layer with its own FOV (about 60 to 70 degrees), its own near and far planes, and a cleared depth buffer, so the gun is always drawn on top. In URP this is an overlay camera in the base camera's stack. The costs are one more camera and some draw calls, and the gun will not receive world shadows correctly without extra work. The alternatives, pushing the gun back when a wall is near or squashing its depth in a vertex shader, each cost animation work or shader complexity."
      },
      {
        "type": "h",
        "text": "Weapons as data"
      },
      {
        "type": "p",
        "text": "A weapon is a row of numbers read by one fire routine. Designers tune a `ScriptableObject`; engineers do not touch code to rebalance. The important fields are fire interval, damage, a **range falloff** curve, **spread** (a cone that grows with continuous fire and movement and recovers over time), a **recoil pattern**, and whether the weapon is hitscan or projectile. Store the rate as RPM and convert once: 600 RPM is one shot per 0.1 s."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "[CreateAssetMenu]\npublic class WeaponDef : ScriptableObject\n{\n    public float rpm = 600f;              // interval = 60 / rpm = 0.1 s\n    public float damage = 28f;\n    public AnimationCurve falloff;        // x = metres, y = damage multiplier\n    public float spreadBase = 0.2f;       // degrees\n    public float spreadPerShot = 0.35f;   // added per shot, recovers at spreadRecover deg/s\n    public float spreadRecover = 4f;\n    public Vector2[] recoil;              // (pitch, yaw) kick per shot index, degrees\n    public int pellets = 1;               // 8-12 for a shotgun\n    public bool hitscan = true;\n    public float projectileSpeed;         // m/s, used when !hitscan\n    public float[] boneMultiplier;        // by hitbox id: head 2.0, torso 1.0, limbs 0.75\n}"
      },
      {
        "type": "p",
        "text": "Fire timing deserves care on a tick-based server. At 64 Hz a tick is 15.625 ms, so 600 RPM is 6.4 ticks per shot. If the code rounds the cooldown to whole ticks it fires at 6 ticks (640 RPM) or 7 ticks (549 RPM), and the weapon is quietly rebalanced. Keep a fractional `nextFireTime` and add the interval to it on each shot instead of resetting it to now. The same value on the client and server also keeps predicted shots from being rejected. **Recoil** comes in two flavours. A fixed **pattern** (shot 1 kicks up, shot 7 drifts right, and so on) can be learned, so skill comes from compensating a known curve. Random **spread** cannot be learned, so skill comes from burst control and positioning. Most competitive shooters mix them: a deterministic pattern for the view kick, and a small random cone on top. The random cone must be seeded from the shot index and the command tick so the client and server agree on where the bullet went."
      },
      {
        "type": "p",
        "text": "**Hitscan or projectile** is decided by travel time. A rifle bullet at 900 m/s covers about 14 m per 15.6 ms tick, so over typical combat ranges simulating flight adds cost and bugs for no gameplay gain: one raycast resolves the shot instantly. A rocket at 20 to 40 m/s is a different weapon: players dodge it, lead targets and bounce it off walls. Projectiles must be spawned by the server, predicted on the client, and swept (a capsule or ray cast per tick from last to new position) so a fast projectile does not tunnel through thin walls."
      },
      {
        "type": "p",
        "text": "Hits are tested against **hitboxes, not the render mesh**. A character mesh has 20,000 to 60,000 triangles skinned on the GPU, so its true vertex positions are usually not even available on the CPU. Hitboxes are 10 to 20 simple capsules and spheres attached to skeleton bones (head, chest, pelvis, upper and lower arms and legs). A ray against a capsule is a few multiplications, and the shape is stable and tuned: head slightly generous, hands often not tested at all. Each hitbox carries its own damage multiplier, so a head shot is `base * 2.0 * falloff` and a leg shot `base * 0.75 * falloff`. One ray tests world geometry and hitboxes together, so the nearest surface wins, and penetrable materials may pass the bullet through at reduced damage."
      },
      {
        "type": "figure",
        "id": "fps-hitboxes",
        "caption": "The ray scans head, torso and legs: each capsule has its own multiplier, and the first hitbox the ray reaches decides the damage.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A hitscan ray fired from the left tests simple capsule hitboxes on a character. The ray scans a head hit worth 2 times damage, a torso hit worth 1 times and a leg hit worth 0.75 times, with a base damage of 20.\"><style>\n.fps-hitboxes-t{font-size:14px;fill:var(--fig-ink)}.fps-hitboxes-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.fps-hitboxes-s{font-size:13px;fill:var(--fig-muted)}\n.fps-hitboxes-hd{fill:var(--fig-bad);fill-opacity:.18;stroke:var(--fig-bad);stroke-width:2}\n.fps-hitboxes-tr{fill:var(--fig-accent);fill-opacity:.18;stroke:var(--fig-accent);stroke-width:2}\n.fps-hitboxes-lg{fill:var(--fig-ok);fill-opacity:.18;stroke:var(--fig-ok);stroke-width:2}\n.fps-hitboxes-gr{stroke:var(--fig-line);stroke-width:2}\n.fps-hitboxes-ray{stroke:var(--fig-warn);stroke-width:2.5}.fps-hitboxes-mz{fill:var(--fig-ink)}.fps-hitboxes-imp{fill:var(--fig-warn);stroke:var(--fig-bg);stroke-width:2}\n.fps-hitboxes-hl{fill:var(--fig-warn);fill-opacity:.15;stroke:var(--fig-warn);stroke-width:1.5}\n.fps-hitboxes-a{animation:fps-hitboxes-a 6s step-end infinite}\n@keyframes fps-hitboxes-a{0%{transform:translateY(0px)}33%{transform:translateY(62px)}66%{transform:translateY(152px)}100%{transform:translateY(0px)}}\n</style>\n<text class=\"fps-hitboxes-h\" x=\"24\" y=\"28\">A ray tests hitboxes, not the render mesh</text>\n<text class=\"fps-hitboxes-h\" x=\"452\" y=\"28\">base damage 20</text>\n<circle class=\"fps-hitboxes-hd\" cx=\"330\" cy=\"70\" r=\"18\"/>\n<rect class=\"fps-hitboxes-tr\" x=\"306\" y=\"94\" width=\"48\" height=\"76\" rx=\"14\"/>\n<rect class=\"fps-hitboxes-lg\" x=\"308\" y=\"176\" width=\"20\" height=\"88\" rx=\"9\"/>\n<rect class=\"fps-hitboxes-lg\" x=\"332\" y=\"176\" width=\"20\" height=\"88\" rx=\"9\"/>\n<line class=\"fps-hitboxes-gr\" x1=\"250\" y1=\"268\" x2=\"410\" y2=\"268\"/>\n<text class=\"fps-hitboxes-s\" x=\"60\" y=\"104\">first hit wins</text>\n<g class=\"fps-hitboxes-a\"><rect class=\"fps-hitboxes-hl\" x=\"440\" y=\"55\" width=\"184\" height=\"30\" rx=\"6\"/><rect class=\"fps-hitboxes-mz\" x=\"40\" y=\"64\" width=\"18\" height=\"12\" rx=\"3\"/><line class=\"fps-hitboxes-ray\" x1=\"58\" y1=\"70\" x2=\"312\" y2=\"70\"/><circle class=\"fps-hitboxes-imp\" cx=\"312\" cy=\"70\" r=\"6\"/></g>\n<text class=\"fps-hitboxes-t\" x=\"452\" y=\"75\">head ×2 → 40</text>\n<text class=\"fps-hitboxes-t\" x=\"452\" y=\"137\">torso ×1 → 20</text>\n<text class=\"fps-hitboxes-t\" x=\"452\" y=\"227\">legs ×0.75 → 15</text>\n<text class=\"fps-hitboxes-s\" x=\"24\" y=\"290\">damage = base × bone multiplier × range falloff; hitboxes follow the skeleton</text>\n</svg>"
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "// Server-side fire. Cooldown accumulates; it never resets to 'now'.\nvoid Fire(Player p, WeaponDef w, float now)\n{\n    if (now < p.nextFire) return;\n    // At most one tick of slack, so idle time cannot bank extra shots.\n    p.nextFire = Mathf.Max(p.nextFire, now - tickDt) + 60f / w.rpm;\n    Vector3 dir = ApplyRecoilAndSpread(p, w);       // seeded by shot index + tick\n\n    lagComp.Rewind(p.viewTime);                      // hitboxes as the shooter saw them\n    if (Physics.Raycast(p.eye, dir, out var hit, w.maxRange, hitMask))\n        if (hit.collider.TryGetComponent(out Hitbox hb))\n            hb.owner.ApplyDamage(\n                w.damage * w.falloff.Evaluate(hit.distance) * hb.multiplier, p);\n    lagComp.Restore();\n}"
      },
      {
        "type": "p",
        "text": "**Hit feedback** is what the player trusts. The **hit marker** is a 100 to 150 ms flash plus a short sound, with a different sound for a head shot or a kill. Show it from the client's own prediction at once, and let the server correct the damage numbers and the kill later: waiting a full round trip makes every shot feel dead. Impact **decals** and effects are pooled: allocate 100 to 200 decal quads and 20 to 40 impact effects at load, and reuse the oldest in a ring buffer. Calling `Instantiate` per bullet produces allocation spikes and garbage collection hitches during sustained fire, exactly when frame time matters. Choose the effect and sound from the surface material of the hit, tracers and muzzle flashes are cosmetic, and none of them is replicated bullet by bullet."
      },
      {
        "type": "h",
        "text": "Enemy AI"
      },
      {
        "type": "p",
        "text": "AI in a shooter has to look smart for a few seconds at a time while costing under 1 ms per frame in total. The pieces are perception, navigation, a decision layer and fairness rules."
      },
      {
        "type": "p",
        "text": "**Perception.** Sight is a cone (for example 120 degrees wide, 40 m range) plus raycasts from the eye to several points on the target (head, chest, feet), so a half-hidden player is partly seen. Awareness is a number that rises while visible (0 to 1 over 0.5 to 1.5 s, faster when close or moving) and decays when not, so enemies take time to react instead of snapping to you. Hearing uses **events**: a gunshot broadcasts a radius (say 30 m unsuppressed) to AI in range, measured along the navmesh instead of through walls. Budget it: 40 agents with 3 rays each every frame is 7,200 rays per second at 60 fps, so spread agents over frames and update perception at 5 to 10 Hz after a cheap distance and angle test."
      },
      {
        "type": "p",
        "text": "**Navigation.** A **navmesh** stores walkable polygons. A* finds a polygon path, the funnel algorithm pulls the string tight into corner points, and the agent radius is baked in so paths clear walls. **Cover points** are authored or generated along obstacles. Score each candidate: blocked from the threat's direction (raycast from crouch height), 10 to 25 m from the player, a peek position with a line of sight, not next to a squadmate. A utility score (weighted sum) picks the best point and avoids all enemies choosing the same one. **Decisions.** A **behaviour tree** is a priority list that designers can read and debug: the first branch whose conditions hold runs. **Utility AI** scores every action and runs the best, which blends smoothly but is harder to debug. Many shooters use a tree for the overall flow and utility scores inside it, for example for cover choice."
      },
      {
        "type": "code",
        "lang": "text",
        "text": "Selector                                   // first child that succeeds wins\n  Sequence  [HealthLow, CoverExists]       -> MoveToCover(farFromThreat); Wait(2-4 s)\n  Sequence  [SeesTarget, AcquireToken]     -> StepOut(); Aim(0.4 s);\n                                              FireBurst(3-5 shots); ReleaseToken()\n  Sequence  [SeesTarget, NoToken]          -> StayInCover(); Suppress or Reload\n  Sequence  [KnowsLastPosition]            -> Flank(); MoveToLastKnown()\n  Sequence  [HeardNoise]                   -> Investigate(noisePos)\n  Patrol()"
      },
      {
        "type": "p",
        "text": "**Tokens** solve the fairness problem. Without them, six enemies in sight all shoot at once, the player dies in a second, and the fight looks like noise. A token pool of 2 to 3 (scaled by difficulty) lets only the holders fire. The others flank, reload, suppress or reposition. A holder releases its token after a burst or a timeout, or when it dies. Add an aim delay of 0.3 to 0.5 s before the first shot, and make early shots less accurate. Attacks are then readable, the player can answer one threat at a time, and the number of enemies becomes a tuning value, not a death sentence. The alternative, lowering accuracy for everyone, keeps the clumping and just makes enemies look blind."
      },
      {
        "type": "figure",
        "id": "fps-attack-tokens",
        "caption": "Five enemies surround the player, but the token pool of two means only two attack at once; the tokens pass around so each enemy gets turns.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Five enemies surround the player but a pool of two attack tokens lets only two fire at a time. The tokens pass from enemy to enemy over time while the others flank, reload or take cover.\"><style>\n.fps-attack-tokens-t{font-size:13px;fill:var(--fig-ink)}.fps-attack-tokens-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.fps-attack-tokens-s{font-size:13px;fill:var(--fig-muted)}.fps-attack-tokens-c{text-anchor:middle}\n.fps-attack-tokens-pl{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2}\n.fps-attack-tokens-en{fill:var(--fig-panel);stroke:var(--fig-bad);stroke-width:2}\n.fps-attack-tokens-ring{fill:none;stroke:var(--fig-warn);stroke-width:3}\n.fps-attack-tokens-ln{stroke:var(--fig-bad);stroke-width:2.5;stroke-dasharray:6 6;animation:fps-attack-tokens-fl .5s linear infinite}\n@keyframes fps-attack-tokens-fl{to{stroke-dashoffset:-12}}\n.fps-attack-tokens-k0{animation:fps-attack-tokens-k0 5s linear infinite}.fps-attack-tokens-k1{animation:fps-attack-tokens-k1 5s linear infinite}.fps-attack-tokens-k2{animation:fps-attack-tokens-k2 5s linear infinite}.fps-attack-tokens-k3{animation:fps-attack-tokens-k3 5s linear infinite}.fps-attack-tokens-k4{animation:fps-attack-tokens-k4 5s linear infinite}@keyframes fps-attack-tokens-k0{0%{opacity:1}5%{opacity:1}10%{opacity:1}15%{opacity:1}20%{opacity:1}25%{opacity:1}30%{opacity:1}35%{opacity:1}40%{opacity:0}45%{opacity:0}50%{opacity:0}55%{opacity:0}60%{opacity:0}65%{opacity:0}70%{opacity:0}75%{opacity:0}80%{opacity:0}85%{opacity:0}90%{opacity:0}95%{opacity:0}100%{opacity:1}}@keyframes fps-attack-tokens-k1{0%{opacity:0}5%{opacity:0}10%{opacity:0}15%{opacity:0}20%{opacity:1}25%{opacity:1}30%{opacity:1}35%{opacity:1}40%{opacity:1}45%{opacity:1}50%{opacity:1}55%{opacity:1}60%{opacity:0}65%{opacity:0}70%{opacity:0}75%{opacity:0}80%{opacity:0}85%{opacity:0}90%{opacity:0}95%{opacity:0}100%{opacity:0}}@keyframes fps-attack-tokens-k2{0%{opacity:0}5%{opacity:0}10%{opacity:0}15%{opacity:0}20%{opacity:0}25%{opacity:0}30%{opacity:0}35%{opacity:0}40%{opacity:1}45%{opacity:1}50%{opacity:1}55%{opacity:1}60%{opacity:1}65%{opacity:1}70%{opacity:1}75%{opacity:1}80%{opacity:0}85%{opacity:0}90%{opacity:0}95%{opacity:0}100%{opacity:0}}@keyframes fps-attack-tokens-k3{0%{opacity:0}5%{opacity:0}10%{opacity:0}15%{opacity:0}20%{opacity:0}25%{opacity:0}30%{opacity:0}35%{opacity:0}40%{opacity:0}45%{opacity:0}50%{opacity:0}55%{opacity:0}60%{opacity:1}65%{opacity:1}70%{opacity:1}75%{opacity:1}80%{opacity:1}85%{opacity:1}90%{opacity:1}95%{opacity:1}100%{opacity:0}}@keyframes fps-attack-tokens-k4{0%{opacity:1}5%{opacity:1}10%{opacity:1}15%{opacity:1}20%{opacity:0}25%{opacity:0}30%{opacity:0}35%{opacity:0}40%{opacity:0}45%{opacity:0}50%{opacity:0}55%{opacity:0}60%{opacity:0}65%{opacity:0}70%{opacity:0}75%{opacity:0}80%{opacity:1}85%{opacity:1}90%{opacity:1}95%{opacity:1}100%{opacity:1}}\n</style>\n<text class=\"fps-attack-tokens-h\" x=\"24\" y=\"28\">Token pool: 2 of 5 enemies may fire</text>\n<circle class=\"fps-attack-tokens-pl\" cx=\"320\" cy=\"150\" r=\"16\"/>\n<text class=\"fps-attack-tokens-s fps-attack-tokens-c\" x=\"320\" y=\"190\">player</text>\n<g class=\"fps-attack-tokens-k0\"><line class=\"fps-attack-tokens-ln\" x1=\"125.2\" y1=\"85.1\" x2=\"299.1\" y2=\"143.0\"/><circle class=\"fps-attack-tokens-ring\" cx=\"110\" cy=\"80\" r=\"20\"/></g><g class=\"fps-attack-tokens-k1\"><line class=\"fps-attack-tokens-ln\" x1=\"204.3\" y1=\"207.8\" x2=\"300.3\" y2=\"159.8\"/><circle class=\"fps-attack-tokens-ring\" cx=\"190\" cy=\"215\" r=\"20\"/></g><g class=\"fps-attack-tokens-k2\"><line class=\"fps-attack-tokens-ln\" x1=\"435.7\" y1=\"207.8\" x2=\"339.7\" y2=\"159.8\"/><circle class=\"fps-attack-tokens-ring\" cx=\"450\" cy=\"215\" r=\"20\"/></g><g class=\"fps-attack-tokens-k3\"><line class=\"fps-attack-tokens-ln\" x1=\"514.8\" y1=\"85.1\" x2=\"340.9\" y2=\"143.0\"/><circle class=\"fps-attack-tokens-ring\" cx=\"530\" cy=\"80\" r=\"20\"/></g><g class=\"fps-attack-tokens-k4\"><line class=\"fps-attack-tokens-ln\" x1=\"320.0\" y1=\"72.0\" x2=\"320.0\" y2=\"128.0\"/><circle class=\"fps-attack-tokens-ring\" cx=\"320\" cy=\"56\" r=\"20\"/></g><circle class=\"fps-attack-tokens-en\" cx=\"110\" cy=\"80\" r=\"13\"/><circle class=\"fps-attack-tokens-en\" cx=\"190\" cy=\"215\" r=\"13\"/><circle class=\"fps-attack-tokens-en\" cx=\"450\" cy=\"215\" r=\"13\"/><circle class=\"fps-attack-tokens-en\" cx=\"530\" cy=\"80\" r=\"13\"/><circle class=\"fps-attack-tokens-en\" cx=\"320\" cy=\"56\" r=\"13\"/>\n<circle class=\"fps-attack-tokens-ring\" cx=\"36\" cy=\"270\" r=\"8\"/>\n<text class=\"fps-attack-tokens-s\" x=\"52\" y=\"275\">holds a token, may fire</text>\n<circle class=\"fps-attack-tokens-en\" cx=\"262\" cy=\"270\" r=\"6\"/>\n<text class=\"fps-attack-tokens-s\" x=\"276\" y=\"275\">no token: flank, reload, take cover</text>\n</svg>"
      },
      {
        "type": "h",
        "text": "Netcode, briefly"
      },
      {
        "type": "p",
        "text": "The deep dive on competitive play is a separate topic. For an FPS the shape is this. The server is **authoritative**: it runs the real simulation at a fixed **tick rate** (commonly 20 to 128 Hz; 64 Hz is 15.6 ms per tick) and decides every hit. Clients send input commands each tick and get **snapshots** back, delta-compressed against the last one they acknowledged. Three techniques hide the latency."
      },
      {
        "type": "list",
        "items": [
          "**Client-side prediction.** The client applies its own commands at once with the shared movement code, so moving feels instant. It keeps the unacknowledged commands in a buffer.",
          "**Reconciliation.** When a snapshot arrives, start from the server's state for that tick, replay the unacknowledged commands, and compare with what was predicted. Small errors are blended away over about 100 ms; large ones snap.",
          "**Entity interpolation.** Other players are drawn about 100 ms in the past (two snapshots at 20 Hz), blending between two real snapshots. They move smoothly, but the shooter is aiming at where they were."
        ]
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "void OnSnapshot(Snapshot s)\n{\n    pending.DiscardUpTo(s.lastProcessedCmd);       // server has seen these\n    PlayerState state = s.localState;              // authoritative at that tick\n    foreach (var cmd in pending)                   // replay the rest on top\n        state = Movement.Step(state, cmd, tickDt);\n\n    float err = Vector3.Distance(predicted.pos, state.pos);\n    if (err > 1.0f)       renderOffset = Vector3.zero;                 // large: snap\n    else if (err > 0.01f) renderOffset += predicted.pos - state.pos;   // small: smooth\n    predicted = state;                                                  // offset decays per frame\n}"
      },
      {
        "type": "p",
        "text": "Interpolation creates the shooting problem. The shooter's screen is about 150 ms old (50 ms of one-way latency plus 100 ms of interpolation), and the shot takes another 50 ms to arrive. If the server tested the ray against current positions, the player would have to lead every target by 200 ms. **Lag compensation** fixes that. The server keeps a short history of every hitbox, about 250 ms: with 16 players, 15 hitboxes and 28 bytes per pose per tick that is around 100 KB. When a shot arrives, the server rewinds all other players to the shooter's view time (command timestamp minus interpolation delay), runs the raycast, then restores the present."
      },
      {
        "type": "figure",
        "id": "fps-lag-comp",
        "caption": "The shooter aims at a target that the server already moved behind cover; the server rewinds the hitbox to the shooter's view time, so the shot counts.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Lag compensation timeline. The shooter's screen shows the target about 150 milliseconds behind the server. By the time the shot arrives the target is behind cover on the server, so the server rewinds its hitbox to the position the shooter saw and counts a hit.\"><style>\n.fps-lag-comp-t{font-size:13px;fill:var(--fig-ink)}.fps-lag-comp-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.fps-lag-comp-s{font-size:13px;fill:var(--fig-muted)}.fps-lag-comp-c{text-anchor:middle}.fps-lag-comp-e{text-anchor:end}\n.fps-lag-comp-lane{stroke:var(--fig-line);stroke-width:2;stroke-dasharray:3 5}\n.fps-lag-comp-wall{fill:var(--fig-panel);stroke:var(--fig-muted);stroke-width:1.5}\n.fps-lag-comp-da{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2}\n.fps-lag-comp-db{fill:var(--fig-accent2);stroke:var(--fig-bg);stroke-width:2}\n.fps-lag-comp-shot{stroke:var(--fig-warn);stroke-width:2.5;fill:none}.fps-lag-comp-shotf{fill:var(--fig-warn)}\n.fps-lag-comp-rw{fill:var(--fig-ok);fill-opacity:.15;stroke:var(--fig-ok);stroke-width:2;stroke-dasharray:4 3}\n.fps-lag-comp-ok{font-size:14px;font-weight:600;fill:var(--fig-ok)}\n.fps-lag-comp-ma{animation:fps-lag-comp-ma 6s linear infinite}\n@keyframes fps-lag-comp-ma{0%,10%{transform:translateX(180px)}60%,100%{transform:translateX(440px)}}\n.fps-lag-comp-mb{animation:fps-lag-comp-mb 6s linear infinite}\n@keyframes fps-lag-comp-mb{0%{transform:translateX(180px)}50%,100%{transform:translateX(440px)}}\n.fps-lag-comp-o1{animation:fps-lag-comp-o1 6s linear infinite}\n@keyframes fps-lag-comp-o1{0%,50%{opacity:0}54%,70%{opacity:1}76%,100%{opacity:0}}\n.fps-lag-comp-o2{animation:fps-lag-comp-o2 6s linear infinite}\n@keyframes fps-lag-comp-o2{0%,56%{opacity:0}60%,88%{opacity:1}94%,100%{opacity:0}}\n</style>\n<text class=\"fps-lag-comp-h\" x=\"24\" y=\"28\">One target, two timelines</text>\n<text class=\"fps-lag-comp-s\" x=\"24\" y=\"66\">Shooter's screen (the past)</text>\n<line class=\"fps-lag-comp-lane\" x1=\"170\" y1=\"96\" x2=\"560\" y2=\"96\"/>\n<text class=\"fps-lag-comp-s\" x=\"24\" y=\"170\">Server (the present)</text>\n<line class=\"fps-lag-comp-lane\" x1=\"170\" y1=\"200\" x2=\"560\" y2=\"200\"/>\n<g class=\"fps-lag-comp-ma\" transform=\"translate(180,0)\"><circle class=\"fps-lag-comp-da\" cx=\"0\" cy=\"96\" r=\"9\"/></g>\n<g class=\"fps-lag-comp-mb\" transform=\"translate(180,0)\"><circle class=\"fps-lag-comp-db\" cx=\"0\" cy=\"200\" r=\"9\"/></g>\n<rect class=\"fps-lag-comp-wall\" x=\"420\" y=\"74\" width=\"40\" height=\"44\" rx=\"4\"/>\n<rect class=\"fps-lag-comp-wall\" x=\"420\" y=\"178\" width=\"40\" height=\"44\" rx=\"4\"/>\n<text class=\"fps-lag-comp-s fps-lag-comp-c\" x=\"440\" y=\"68\">cover</text>\n<text class=\"fps-lag-comp-s fps-lag-comp-c\" x=\"440\" y=\"172\">cover</text>\n<g class=\"fps-lag-comp-o1\"><line class=\"fps-lag-comp-shot\" x1=\"409\" y1=\"116\" x2=\"409\" y2=\"176\"/><path class=\"fps-lag-comp-shotf\" d=\"M409 184l-6 -12h12z\"/><text class=\"fps-lag-comp-t fps-lag-comp-e\" x=\"399\" y=\"150\">shot + view time</text></g>\n<g class=\"fps-lag-comp-o2\"><circle class=\"fps-lag-comp-rw\" cx=\"409\" cy=\"200\" r=\"15\"/><text class=\"fps-lag-comp-ok fps-lag-comp-c\" x=\"409\" y=\"246\">rewound: HIT</text></g>\n<text class=\"fps-lag-comp-s\" x=\"24\" y=\"284\">rewind = RTT 100 ms + interpolation 100 ms, about 200 ms</text>\n</svg>"
      },
      {
        "type": "p",
        "text": "The price is the **shot around the corner**. The target ran behind cover on the server 200 ms ago, and still dies. Favouring the shooter means the player who acts gets the benefit of the doubt, and the player being shot pays. Teams cap the rewind (a few hundred ms at most) so a 300 ms ping cannot reach far into the past, and accept that victims sometimes die slightly behind cover: at 6 m/s, a 0.1 s rewind puts them about 0.6 m past the corner. The alternative, favouring the defender, makes shots miss on screen whenever the shooter has latency."
      },
      {
        "type": "h",
        "text": "Level design, culling and audio"
      },
      {
        "type": "p",
        "text": "The 16.6 ms budget (8.3 ms at 120 Hz) is spent in the worst view of the level, not the average. **Occlusion culling** decides what is hidden. Quake-style engines precompute a **PVS**, a bit set per BSP leaf listing which leaves can see each other, so visibility becomes a lookup. **Portal** systems split the level into cells connected by doors and clip the frustum through each opening. Unity's baked occlusion culling (Umbra) stores cell data and tests objects against occluders at run time. GPU depth-based culling needs no bake but costs a depth pass and often tests against the previous frame's depth. Without any of them you pay for every hidden room in vertex and overdraw cost. This makes level design a performance tool. A turn, a door or a height change every 20 to 30 m cuts long sightlines. That keeps the potentially visible set small and, at the same time, controls where sniping is possible and where enemies can see you. Long sightlines should be deliberate, with cheaper geometry and LODs set up for them. The same geometry feeds **audio occlusion**: one to three raycasts from listener to source (updated around 10 Hz, not per frame) lower volume and apply a low-pass filter when walls are in the way, and reverb zones per room give space. Cap the number of real voices (32 to 64 is typical) and let quieter ones be virtual. In a competitive game, correct footsteps are information, not decoration."
      },
      {
        "type": "h",
        "text": "Decisions and why they work"
      },
      {
        "type": "list",
        "items": [
          "**Authoritative server.** Clients cannot invent hits, positions or damage, which is the base of cheat resistance. It costs a round trip of latency, which prediction, interpolation and lag compensation then hide.",
          "**One shared movement function.** Prediction only works if client and server run the same step on the same inputs. Two implementations drift apart and the player rubber-bands. The cost is that movement must be deterministic enough, with no use of frame time or random values.",
          "**Raw, unsmoothed input.** One count of mouse movement always gives the same angle, so muscle memory transfers. Smoothing adds lag and acceleration changes the angle, and both make aim feel unreliable.",
          "**Hitboxes, not meshes.** Capsules are cheap, stable and tunable, and a ray test costs almost nothing. Mesh tests cost far more and tie fairness to art changes. The cost is a mismatch (shots through visible limbs) that artists and designers must tune.",
          "**Hitscan for bullets, projectiles for slow weapons.** Where flight time is a few ticks at most, simulating it adds netcode work and no feel. Projectiles stay for weapons whose travel time is the gameplay.",
          "**Lag compensation favouring the shooter.** What you see is what you hit, so high-ping players are not locked out. The price is shots around corners, bounded by a rewind cap.",
          "**Weapons as data, recoil seeded from the shot index.** Designers can balance without code, and the client and server compute the same bullet path. The alternative, random recoil on each side, produces hits the client does not see.",
          "**Tokens and telegraphs for AI.** Limiting simultaneous attackers and adding aim delay makes fights readable and difficulty a number. The cost is that enemies sometimes wait, so they need cover and flank behaviours that keep them looking active.",
          "**Separate view-model camera.** The gun never clips and does not stretch with the FOV slider. It costs one extra camera and some shadow work."
        ]
      },
      {
        "type": "callout",
        "kind": "warn",
        "text": "The server must pose hitboxes the same way the client sees them. If a dedicated server skips animation to save CPU, hitboxes stay at the bind pose and players report shots that hit the visible body but do nothing. Likewise, do not read the mouse in `FixedUpdate` or use `Time.deltaTime` inside shared movement code: movement must be a function of the command and the fixed tick time. Check both with a replay test, not by feel."
      },
      {
        "type": "callout",
        "kind": "agent",
        "text": "Delegate the plumbing and keep the feel for yourself. Agents are good at: ScriptableObject weapon schemas, hitbox setup from a skeleton, object pools for decals, behaviour tree and token manager scaffolding, and EditMode tests. Ask for tests that assert things you can compute: a step function that gives the same result on 1,000 replayed command sequences, a fire-rate test that checks 600 RPM yields 60 shots over 6 s at 64 Hz, falloff and bone-multiplier arithmetic, and a token manager that never grants more than the pool size. Verify by hand: recoil and spread feel, FOV and sensitivity, the cost of the rewind, and how cover and AI timings play. Agents tend to smooth input, use `Time.deltaTime` in shared code and call `Instantiate` in the fire path, so list those as rules up front and ask them to grep for each."
      },
      {
        "type": "patterns",
        "patterns": [
          {
            "signal": "Shots hit on the shooter's screen but the server calls them misses, and the miss rate grows with ping",
            "use": "Server-side lag compensation (rewind hitboxes)",
            "why": "The server tests the ray against hitboxes at the shooter's view time (the command's time minus the interpolation delay). What you see is what you hit. Cap the rewind so very high ping cannot reach far back."
          },
          {
            "signal": "Your own movement rubber-bands or feels delayed by ping in an online game",
            "use": "Client prediction plus server reconciliation",
            "why": "Apply inputs immediately with the shared movement code and keep unacknowledged commands. On each snapshot, restart from the server state and replay them, so only real disagreement shows as a correction."
          },
          {
            "signal": "Other players look choppy or teleport between snapshots at 20 to 64 Hz",
            "use": "Entity interpolation, about 100 ms behind",
            "why": "Blending between two buffered snapshots gives smooth motion and absorbs a lost packet. The price is that you see the past, which lag compensation then accounts for. Shrink the buffer at higher snapshot rates."
          },
          {
            "signal": "The gun clips into walls up close, or raising the FOV slider stretches the weapon model",
            "use": "Separate view-model camera, own FOV and depth",
            "why": "A second camera with its own FOV, near and far planes and a cleared depth buffer draws the gun on top. It no longer clips, and the weapon looks the same at FOV 90 or 110."
          },
          {
            "signal": "Four or more enemies fire at the player together; fights feel unfair and unreadable",
            "use": "Attack tokens, 2 or 3 at once",
            "why": "Only token holders may fire, the others flank, reload or take cover. Add an aim delay before the first shot. Threat becomes readable, and difficulty becomes a pool size rather than enemy damage."
          },
          {
            "signal": "Frame time spikes in big open rooms, although most views of the level are cheap",
            "use": "Break sightlines and bake occlusion",
            "why": "Cost is set by the worst view. Turns, doors and height changes every 20 to 30 m, plus PVS, portals or baked occlusion, shrink the visible set. Long sightlines are kept on purpose, with LODs prepared."
          },
          {
            "signal": "Hit tests against the character mesh are slow, and every art change shifts what counts as a hit",
            "use": "Per-bone hitbox capsules with multipliers",
            "why": "Cheap capsules on skeleton bones give a stable, tunable shape, and each carries a damage multiplier. A ray against them is far cheaper than a mesh test, and fairness no longer depends on art."
          },
          {
            "signal": "Sustained automatic fire causes hitches from decals and impact effects being instantiated",
            "use": "Pooled ring buffer of decals and effects",
            "why": "Preallocate 100 to 200 decals and reuse the oldest. No allocation or garbage collection happens during fire, and the oldest bullet holes are the ones the player has stopped looking at."
          }
        ]
      }
    ],
    "keyPoints": [
      "Movement is a hand-tuned velocity model (friction, then clamped acceleration) on a kinematic capsule, shared by client and server so prediction works.",
      "Aim uses raw, unsmoothed mouse deltas, a separate view-model camera, and a horizontal FOV the player can change.",
      "Weapons are data: fire rate stored as RPM with a fractional cooldown, falloff curves, seeded recoil, and per-bone hitbox multipliers.",
      "Hits are rays against simple per-bone hitboxes, never the render mesh; hitscan fits bullets, projectiles fit slow weapons.",
      "Server authority with prediction, interpolation and lag compensation makes online play feel instant, at the price of shots around corners.",
      "AI combines perception, navmesh, cover and a decision layer, and attack tokens limit simultaneous attackers; level sightlines and occlusion decide the frame budget."
    ],
    "quiz": [
      {
        "q": "In the Quake-style `Accelerate` function, why can a player in the air gain speed beyond the run limit by turning the mouse while holding a strafe key?",
        "options": [
          "Air friction is zero, so every speed limit is skipped in the air",
          "The clamp is along the wish direction, which turning rotates",
          "Air acceleration is always larger than ground acceleration in Quake",
          "The velocity is scaled by the camera's yaw each tick, adding speed"
        ],
        "answer": 1,
        "explain": "The limit is `wishSpeed - dot(velocity, wishDir)`. Rotating the wish direction makes the old velocity project to less than the limit, so there is room to add more speed. Missing friction alone only stops decay, and Quake's air acceleration is lower than ground acceleration, not higher."
      },
      {
        "q": "A rifle is 600 RPM on a 64 Hz server. What is the safest way to enforce its fire rate?",
        "options": [
          "Wait 6 ticks between shots, since 6 is the closest whole number",
          "Wait 7 ticks between shots so the weapon never fires too fast",
          "Fire on the client and let the server accept any shot it receives",
          "Keep a fractional next-fire time and add 0.1 s on each shot"
        ],
        "answer": 3,
        "explain": "At 64 Hz, 600 RPM is 6.4 ticks per shot. Six ticks gives 640 RPM and seven ticks gives 549 RPM, which silently rebalances the gun. Accumulating 0.1 s keeps the exact rate, and the server must still check it, so trusting the client breaks authority."
      },
      {
        "q": "What is the real cost of server-side lag compensation that favours the shooter?",
        "options": [
          "A defender can be hit shortly after reaching cover, by about the rewind time",
          "Shooters with high ping must lead their targets by their round trip time",
          "The tick rate must be doubled, or hit detection becomes unreliable",
          "The shooter's own movement is delayed by the interpolation buffer"
        ],
        "answer": 0,
        "explain": "The server tests against the world the shooter saw, so a target that already moved behind cover on the server can still be hit. Leading targets is what you get without compensation. Own movement is handled by prediction, and the tick rate is not tied to compensation."
      },
      {
        "q": "Why do FPS games raycast against per-bone capsule hitboxes and not the character's render mesh?",
        "options": [
          "Render meshes cannot be placed on a collision layer in Unity",
          "Unity raycasts ignore mesh colliders on moving characters",
          "Capsules are cheap and stable, with a multiplier per body part",
          "Hitboxes make the weapon's range falloff curve unnecessary"
        ],
        "answer": 2,
        "explain": "A skinned mesh has tens of thousands of triangles whose true positions live on the GPU, and fairness would change with every art edit. Capsules are a handful of arithmetic per test and carry damage multipliers. Layers are not the issue, raycasts do hit moving mesh colliders, and falloff still applies."
      },
      {
        "q": "A client predicted its position for tick 120. A snapshot for tick 120 arrives while the client is on tick 126, and the positions differ by 4 cm. What should it do?",
        "options": [
          "Restart from the server state and replay inputs 121 to 126, then smooth",
          "Replace its position with the server's tick 120 position directly",
          "Ignore the snapshot, since the client is six ticks ahead anyway",
          "Pause input until the server confirms ticks 121 to 126 as well"
        ],
        "answer": 0,
        "explain": "Reconciliation restarts from the authoritative state and replays the commands the server has not processed, so the result is consistent with the server and still ahead in time. Snapping to the old tick 120 position undoes six ticks of movement, ignoring it lets errors grow, and pausing input adds latency."
      },
      {
        "q": "Playtesters say that six enemies shooting at the same moment feels unfair and the fights are chaos. Which move from the patterns fits?",
        "options": [
          "Halve every enemy's accuracy so their shots miss more often",
          "Randomise each enemy's fire delay between 0 and 2 seconds",
          "Use attack tokens so only two or three enemies may fire at once",
          "Add more player health so the player survives the first volley"
        ],
        "answer": 2,
        "explain": "A token pool caps simultaneous attackers and gives the rest other jobs, so the threat becomes readable. Lower accuracy keeps the clumping and makes enemies look blind. Random delays still allow overlap, and more health only delays the same chaos."
      }
    ]
  }
];
