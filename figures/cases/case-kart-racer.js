window.TOPIC_PART = [
  {
    "id": "case-kart-racer",
    "title": "Case study: Kart racer",
    "minutes": 18,
    "summary": "How an arcade kart racer is built, from raycast suspension and spline-based race progress to AI, items, split-screen and online prediction, and why each choice keeps the game fun and fair.",
    "lesson": [
      {
        "type": "p",
        "text": "Eight karts leave the grid on a 1.8 km track. Lap one is clean. On lap two a player cuts across a grass strip, falls off the edge, and respawns 300 m further along the track than where they left it. A second player finishes in 3rd on their screen and 5th on the server's. A third reports that the last-place kart \"cheats\" by catching up on every straight. None of these are rendering bugs. A kart racer is a small set of systems (suspension, track data, AI, items, camera, netcode) that each make a deliberate trade between realism and fun, and each fails in a specific way. This teardown walks through them in the order data flows."
      },
      {
        "type": "h",
        "text": "Components"
      },
      {
        "type": "p",
        "text": "Every fixed tick (50 or 60 Hz) input becomes forces on a rigid body. The body's position is projected onto a track spline to get progress, progress sorts the karts into positions, and positions feed back into AI speed and item odds. Cameras and the network read the result; they never drive it."
      },
      {
        "type": "list",
        "items": [
          "**Vehicle physics.** One rigid body, four raycasts, forces for suspension, grip, drive and drift. Runs in `FixedUpdate`.",
          "**Track data.** A closed spline centerline, per-point width and banking, ordered checkpoints, a kill plane below the track.",
          "**Race state.** Progress per kart, lap count, finish order, wrong-way flag, respawn requests.",
          "**AI drivers.** Produce the same input struct a human does: steer, throttle, drift, item. They get no special physics.",
          "**Items.** Position-weighted rolls, plus projectiles that follow the spline.",
          "**Camera and view.** One spring-arm camera per local player, split-screen viewports.",
          "**Network layer.** Input upload, authoritative server state, prediction for the local kart, interpolation for the rest."
        ]
      },
      {
        "type": "h",
        "text": "Arcade physics, not simulation"
      },
      {
        "type": "p",
        "text": "A simulation kart models tyre slip curves, weight transfer and a drivetrain. It is accurate and hard to drive: small steering errors at the limit cause spins. An arcade kart is a single rigid body with a low centre of mass and four **raycast wheels**. Each wheel casts a ray down from a mount point, and if it hits the ground the code applies a spring force, a lateral grip force and (on driven wheels) a drive force at the contact point. There are no wheel colliders to tune, the handling is a handful of numbers a designer can read, and the cost is four raycasts per kart per tick."
      },
      {
        "type": "figure",
        "id": "kart-suspension-bump",
        "caption": "Over the bump the front spring compresses and pushes harder, the rear spring extends, and the body rises and pitches; the dampers take the energy out so it does not bounce.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"Side view of a kart with a spring at each wheel. A bump slides under the front wheel and then the rear wheel; the spring over the bump compresses, the other spring extends, and the body rises and pitches.\"><style>.kart-suspension-bump-t{font-size:13px;fill:var(--fig-muted)}.kart-suspension-bump-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.kart-suspension-bump-e{text-anchor:end}.kart-suspension-bump-gr{stroke:var(--fig-ink);stroke-width:2;stroke-linecap:round}.kart-suspension-bump-bump{fill:var(--fig-panel);stroke:var(--fig-ink);stroke-width:2;animation:kart-suspension-bump-bump 6s linear infinite}.kart-suspension-bump-body{fill:var(--fig-panel);stroke:var(--fig-accent);stroke-width:2.5}.kart-suspension-bump-w{fill:var(--fig-panel);stroke:var(--fig-ink);stroke-width:3}.kart-suspension-bump-hub{fill:var(--fig-ink)}.kart-suspension-bump-sp{fill:none;stroke:var(--fig-accent2);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}.kart-suspension-bump-wf{animation:kart-suspension-bump-wf 6s ease-in-out infinite}.kart-suspension-bump-wr{animation:kart-suspension-bump-wr 6s ease-in-out infinite}.kart-suspension-bump-bd{transform-origin:270px 190px;animation:kart-suspension-bump-bd 6s ease-in-out infinite}.kart-suspension-bump-sf{transform-origin:340px 190px;animation:kart-suspension-bump-sf 6s ease-in-out infinite}.kart-suspension-bump-sr{transform-origin:200px 190px;animation:kart-suspension-bump-sr 6s ease-in-out infinite}.kart-suspension-bump-s{font-size:12px;fill:var(--fig-ink)}@keyframes kart-suspension-bump-bump{0%{transform:translateX(620px)}100%{transform:translateX(20px)}}@keyframes kart-suspension-bump-wf{0%,40%{transform:translateY(0)}46.7%{transform:translateY(-24px)}53.4%,100%{transform:translateY(0)}}@keyframes kart-suspension-bump-wr{0%,63.3%{transform:translateY(0)}70%{transform:translateY(-24px)}76.7%,100%{transform:translateY(0)}}@keyframes kart-suspension-bump-bd{0%,40%{transform:translateY(0) rotate(0deg)}46.7%{transform:translateY(-8px) rotate(-2deg)}53.4%,63.3%{transform:translateY(0) rotate(0deg)}70%{transform:translateY(-8px) rotate(2deg)}76.7%,100%{transform:translateY(0) rotate(0deg)}}@keyframes kart-suspension-bump-sf{0%,40%{transform:scaleY(1)}46.7%{transform:scaleY(.68)}53.4%,63.3%{transform:scaleY(1)}70%{transform:scaleY(1.13)}76.7%,100%{transform:scaleY(1)}}@keyframes kart-suspension-bump-sr{0%,40%{transform:scaleY(1)}46.7%{transform:scaleY(1.13)}53.4%,63.3%{transform:scaleY(1)}70%{transform:scaleY(.68)}76.7%,100%{transform:scaleY(1)}}</style><text class=\"kart-suspension-bump-h\" x=\"24\" y=\"28\">Raycast suspension, side view</text><text class=\"kart-suspension-bump-t kart-suspension-bump-e\" x=\"616\" y=\"28\">F = k · compression − c · velocity</text><text class=\"kart-suspension-bump-t\" x=\"24\" y=\"52\">Two of four wheels shown. A bump passes the front wheel, then the rear.</text><g transform=\"translate(0,-40)\"><line class=\"kart-suspension-bump-gr\" x1=\"16\" y1=\"250\" x2=\"624\" y2=\"250\"/><path class=\"kart-suspension-bump-bump\" transform=\"translate(620,0)\" d=\"M-40 250C-20 250 -16 226 0 226C16 226 20 250 40 250Z\"/><g class=\"kart-suspension-bump-wr\"><circle class=\"kart-suspension-bump-w\" cx=\"200\" cy=\"232\" r=\"18\"/><circle class=\"kart-suspension-bump-hub\" cx=\"200\" cy=\"232\" r=\"4\"/></g><g class=\"kart-suspension-bump-wf\"><circle class=\"kart-suspension-bump-w\" cx=\"340\" cy=\"232\" r=\"18\"/><circle class=\"kart-suspension-bump-hub\" cx=\"340\" cy=\"232\" r=\"4\"/></g><g class=\"kart-suspension-bump-bd\"><rect class=\"kart-suspension-bump-body\" x=\"185\" y=\"150\" width=\"170\" height=\"40\" rx=\"12\"/><circle class=\"kart-suspension-bump-hub\" cx=\"212\" cy=\"170\" r=\"4\"/><text class=\"kart-suspension-bump-s\" x=\"222\" y=\"174\">low CoM</text><path class=\"kart-suspension-bump-sp kart-suspension-bump-sr\" d=\"M200 190v4l-7 4l14 6l-14 6l14 6l-14 6l7 4v6\"/><path class=\"kart-suspension-bump-sp kart-suspension-bump-sf\" d=\"M340 190v4l-7 4l14 6l-14 6l14 6l-14 6l7 4v6\"/></g></g><text class=\"kart-suspension-bump-t\" x=\"24\" y=\"262\">Over the bump the spring compresses and pushes up harder; the body rises and pitches.</text></svg>"
      },
      {
        "type": "p",
        "text": "The **spring-damper** is the core. Let `compression = restLength - hitDistance`, clamped at 0. Then `F = k * compression - c * compressionSpeed`, applied along the ground normal. The first term holds the kart up; the second removes energy so it does not bounce. Sizing it is simple: for a 120 kg kart on four wheels, each wheel carries about 295 N. To sit at 0.08 m of compression, `k = 295 / 0.08`, about 3,700 N/m. Critical damping is `2 * sqrt(k * m)` with m = 30 kg per wheel, about 670 N·s/m; a damping ratio of 0.5 to 0.7 (c of roughly 330 to 470 N·s/m) settles in about one bounce. Too stiff and the kart skips over small bumps; too soft and it bottoms out on landings."
      },
      {
        "type": "p",
        "text": "**Lateral grip** is what makes it feel like a kart rather than a hovercraft. At each wheel, take the velocity at that point, project it on the wheel's sideways axis, and apply an impulse that cancels a fraction `grip` of it. `grip = 1` is a rail, `grip = 0` is ice. Steering uses a **speed curve**: a maximum steer angle of about 30 degrees at standstill falling to about 8 degrees at top speed (28 m/s, roughly 100 km/h), so the kart is nimble when slow and stable when fast."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "void ApplyWheel(Wheel w, float dt)\n{\n    if (!Physics.Raycast(w.mount, -transform.up, out var hit, w.rest + w.radius)) return;\n    float compression = w.rest - (hit.distance - w.radius);\n    float compSpeed = (compression - w.lastCompression) / dt;\n    w.lastCompression = compression;\n    float spring = Mathf.Max(0f, k * compression - c * compSpeed);\n    rb.AddForceAtPosition(hit.normal * spring, hit.point);\n\n    // Lateral grip: cancel a fraction of sideways speed at this wheel.\n    Vector3 v = rb.GetPointVelocity(hit.point);\n    float side = Vector3.Dot(v, w.transform.right);\n    float impulse = -side * w.grip * (rb.mass * 0.25f);\n    rb.AddForceAtPosition(w.transform.right * impulse / dt, hit.point);\n}"
      },
      {
        "type": "p",
        "text": "Keeping the kart upright is mostly tuning. Lower the **centre of mass** (`rb.centerOfMass`, about 0.3 m below the mesh centre) so lateral forces create little roll. Add an **anti-roll** force that pushes the more compressed side up. Add **downforce** that grows with speed so jumps and crests do not unload the tyres. While airborne, apply a **self-righting torque** that aligns the kart's up vector with the last ground normal, and if it is upside down for about 2 seconds, treat it as a respawn."
      },
      {
        "type": "h",
        "text": "Drift and mini-turbo"
      },
      {
        "type": "p",
        "text": "Drift is a state, not a different physics model. Holding the drift button while steering switches the kart into a state where the rear grip drops (for example from 1.0 to 0.6), the steering is biased into the turn, and a **charge timer** starts. The tiers are time thresholds. Example values: 0.7 s gives a small boost, 1.5 s a medium one, 2.5 s a large one. On release the kart gets a **mini-turbo**: a speed multiplier (for example 1.3x) for 0.6, 1.0 or 1.5 s. The loop is risk and reward: a long drift costs steering precision and lap time on the corner, and pays back on the straight."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "void TickDrift(float dt, bool held, float steer)\n{\n    if (held && speed > 10f) {\n        driftTime += dt;                      // seconds, so it is tick-rate independent\n        tier = driftTime >= 2.5f ? 3 : driftTime >= 1.5f ? 2 : driftTime >= 0.7f ? 1 : 0;\n        rearGrip = 0.6f;\n    } else {\n        if (driftTime > 0f && tier > 0) boostLeft = BoostSeconds[tier - 1]; // 0.6, 1.0, 1.5\n        driftTime = 0f; tier = 0; rearGrip = 1f;\n    }\n    boostLeft = Mathf.Max(0f, boostLeft - dt);\n    maxSpeed = boostLeft > 0f ? baseMax * 1.3f : baseMax;\n}"
      },
      {
        "type": "h",
        "text": "Track representation and race progress"
      },
      {
        "type": "p",
        "text": "The track is a closed **spline centerline**, sampled once at build time into points about every 2 m (about 900 points for 1.8 km) with an arc-length table, plus a width, a banking angle and a tangent at each point. Everything about the race hangs on one function: given a kart position, find the **nearest point on the centerline** and read its distance along the track, `s`. Then `progress = lap * L + s`, where `L` is the lap length. That single float orders the karts, drives the wrong-way check and feeds the AI."
      },
      {
        "type": "figure",
        "id": "kart-track-progress",
        "caption": "The kart projects onto the nearest centerline point; that gives s, and s plus lap times L is progress. Gates C0 to C5 must be crossed in order for a lap to count.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"Top-down oval track with a centerline and six numbered checkpoint gates. A kart drives around it; a dashed line projects the kart onto the nearest centerline point, and a bar on the right fills with the distance s along the spline for this lap. Race progress equals lap times lap length plus s.\"><style>.kart-track-progress-t{font-size:12px;fill:var(--fig-muted)}.kart-track-progress-m{text-anchor:middle}.kart-track-progress-e{text-anchor:end}.kart-track-progress-tr{fill:none;stroke:var(--fig-line);stroke-opacity:.55;stroke-width:34}.kart-track-progress-cl{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:5 5}.kart-track-progress-g{stroke:var(--fig-ink);stroke-width:2.5;stroke-linecap:round}.kart-track-progress-p{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.kart-track-progress-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.kart-track-progress-f{font-size:14px;fill:var(--fig-ink)}.kart-track-progress-s{font-size:13px;fill:var(--fig-muted)}.kart-track-progress-pr{stroke:var(--fig-ink);stroke-width:1.5;stroke-dasharray:3 3}.kart-track-progress-pd{fill:var(--fig-ink)}.kart-track-progress-kd{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2}.kart-track-progress-bt{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5}.kart-track-progress-bf{fill:var(--fig-accent2);transform-box:fill-box;transform-origin:0 50%;animation:kart-track-progress-bf 8s linear infinite}.kart-track-progress-k{animation:kart-track-progress-k 8s linear infinite;transform:translate(210px,72px) rotate(-90deg)}@keyframes kart-track-progress-k{0%{transform:translate(210px,72px) rotate(-90deg)}2.8%{transform:translate(236px,73.3px) rotate(-84.1deg)}5.6%{transform:translate(261.3px,77.3px) rotate(-77.9deg)}8.3%{transform:translate(285px,83.8px) rotate(-71.3deg)}11.1%{transform:translate(306.4px,92.6px) rotate(-63.8deg)}13.9%{transform:translate(324.9px,103.4px) rotate(-55deg)}16.7%{transform:translate(339.9px,116px) rotate(-44.5deg)}19.4%{transform:translate(351px,129.9px) rotate(-31.8deg)}22.2%{transform:translate(357.7px,144.7px) rotate(-16.7deg)}25%{transform:translate(360px,160px) rotate(0deg)}27.8%{transform:translate(357.7px,175.3px) rotate(16.7deg)}30.6%{transform:translate(351px,190.1px) rotate(31.8deg)}33.3%{transform:translate(339.9px,204px) rotate(44.5deg)}36.1%{transform:translate(324.9px,216.6px) rotate(55deg)}38.9%{transform:translate(306.4px,227.4px) rotate(63.8deg)}41.7%{transform:translate(285px,236.2px) rotate(71.3deg)}44.4%{transform:translate(261.3px,242.7px) rotate(77.9deg)}47.2%{transform:translate(236px,246.7px) rotate(84.1deg)}50%{transform:translate(210px,248px) rotate(90deg)}52.8%{transform:translate(184px,246.7px) rotate(95.9deg)}55.6%{transform:translate(158.7px,242.7px) rotate(102.1deg)}58.3%{transform:translate(135px,236.2px) rotate(108.7deg)}61.1%{transform:translate(113.6px,227.4px) rotate(116.2deg)}63.9%{transform:translate(95.1px,216.6px) rotate(125deg)}66.7%{transform:translate(80.1px,204px) rotate(135.5deg)}69.4%{transform:translate(69px,190.1px) rotate(148.2deg)}72.2%{transform:translate(62.3px,175.3px) rotate(163.3deg)}75%{transform:translate(60px,160px) rotate(180deg)}77.8%{transform:translate(62.3px,144.7px) rotate(196.7deg)}80.6%{transform:translate(69px,129.9px) rotate(211.8deg)}83.3%{transform:translate(80.1px,116px) rotate(224.5deg)}86.1%{transform:translate(95.1px,103.4px) rotate(235deg)}88.9%{transform:translate(113.6px,92.6px) rotate(243.8deg)}91.7%{transform:translate(135px,83.8px) rotate(251.3deg)}94.4%{transform:translate(158.7px,77.3px) rotate(257.9deg)}97.2%{transform:translate(184px,73.3px) rotate(264.1deg)}100%{transform:translate(210px,72px) rotate(270deg)}}@keyframes kart-track-progress-bf{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}</style><ellipse class=\"kart-track-progress-tr\" cx=\"210\" cy=\"160\" rx=\"150\" ry=\"88\"/><ellipse class=\"kart-track-progress-cl\" cx=\"210\" cy=\"160\" rx=\"150\" ry=\"88\"/><line class=\"kart-track-progress-g\" x1=\"210\" y1=\"89\" x2=\"210\" y2=\"55\"/><line class=\"kart-track-progress-g\" x1=\"327.8\" y1=\"127.9\" x2=\"352\" y2=\"104.1\"/><line class=\"kart-track-progress-g\" x1=\"327.8\" y1=\"192.1\" x2=\"352\" y2=\"215.9\"/><line class=\"kart-track-progress-g\" x1=\"210\" y1=\"231\" x2=\"210\" y2=\"265\"/><line class=\"kart-track-progress-g\" x1=\"92.2\" y1=\"192.1\" x2=\"68\" y2=\"215.9\"/><line class=\"kart-track-progress-g\" x1=\"92.2\" y1=\"127.9\" x2=\"68\" y2=\"104.1\"/><text class=\"kart-track-progress-t kart-track-progress-m\" x=\"210\" y=\"45\">C0 start / finish</text><text class=\"kart-track-progress-t\" x=\"362\" y=\"98.3\">C1</text><text class=\"kart-track-progress-t\" x=\"362\" y=\"229.7\">C2</text><text class=\"kart-track-progress-t kart-track-progress-m\" x=\"210\" y=\"283\">C3</text><text class=\"kart-track-progress-t kart-track-progress-e\" x=\"58\" y=\"229.7\">C4</text><text class=\"kart-track-progress-t kart-track-progress-e\" x=\"58\" y=\"98.3\">C5</text><g class=\"kart-track-progress-k\"><line class=\"kart-track-progress-pr\" x1=\"0\" y1=\"0\" x2=\"10\" y2=\"0\"/><circle class=\"kart-track-progress-pd\" cx=\"0\" cy=\"0\" r=\"3.5\"/><circle class=\"kart-track-progress-kd\" cx=\"10\" cy=\"0\" r=\"6\"/></g><rect class=\"kart-track-progress-p\" x=\"432\" y=\"60\" width=\"192\" height=\"188\" rx=\"12\"/><text class=\"kart-track-progress-h\" x=\"448\" y=\"88\">race progress</text><text class=\"kart-track-progress-f\" x=\"448\" y=\"112\">= lap × L + s</text><text class=\"kart-track-progress-s\" x=\"448\" y=\"136\">L: lap length, 1,800 m</text><text class=\"kart-track-progress-s\" x=\"448\" y=\"158\">s: distance along the</text><text class=\"kart-track-progress-s\" x=\"448\" y=\"176\">spline, at the nearest</text><text class=\"kart-track-progress-s\" x=\"448\" y=\"194\">point to the kart</text><rect class=\"kart-track-progress-bt\" x=\"448\" y=\"208\" width=\"160\" height=\"10\" rx=\"5\"/><rect class=\"kart-track-progress-bf\" x=\"448\" y=\"208\" width=\"160\" height=\"10\" rx=\"5\"/><text class=\"kart-track-progress-t\" x=\"448\" y=\"238\">0</text><text class=\"kart-track-progress-t kart-track-progress-e\" x=\"608\" y=\"238\">L</text><text class=\"kart-track-progress-s\" x=\"24\" y=\"308\">Gates must be crossed in order, C0 to C5, before C0 counts a lap.</text></svg>"
      },
      {
        "type": "p",
        "text": "A global nearest-point search over 900 points for 12 karts is about 11,000 distance checks per tick, which is cheap. The problem is correctness: where a road passes over or next to itself, the globally nearest point can be on the other road, and progress jumps by hundreds of metres. Search a **window** instead: start at the kart's last index and check about 30 samples either side (60 m each way), then wrap the index at the end of the lap."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "int FindIndex(Vector3 p, int last)\n{\n    int best = last; float bestD = float.MaxValue;\n    for (int o = -30; o <= 30; o++) {\n        int i = (last + o + n) % n;\n        float d = (pts[i] - p).sqrMagnitude;\n        if (d < bestD) { bestD = d; best = i; }\n    }\n    // Seam wrap keeps progress continuous. The official lap count comes from the gates.\n    if (last > n - 40 && best < 40) progressLap++;\n    else if (last < 40 && best > n - 40) progressLap--;\n    return best;\n}"
      },
      {
        "type": "p",
        "text": "Progress alone is not enough to count a lap, because it can be gamed. Place **ordered checkpoints** (gate planes across the road, here six) and require that each kart crosses them in sequence. A lap counts only when the finish gate is crossed with all gates seen in order, so cutting a corner through the infield skips a gate and does not score. **Wrong-way detection** compares velocity with the spline tangent: if `dot(velocity, tangent)` is negative for more than about 1 second, show the warning. **Respawn** on a fall (kill plane below the track) or a stuck timer places the kart at the **last checkpoint it passed**, facing the tangent, with a short invulnerability. Respawning at the nearest spline point looks better but lets a player fall off, land beside a later section and skip track."
      },
      {
        "type": "p",
        "text": "**Position ranking** is a sort of 8 to 12 floats by progress every tick. Use a stable sort so ties do not flicker, lock the order when a kart finishes, and consider a small hysteresis on the HUD (a kart must lead by about 1 m before the number changes) so positions do not flash when two karts run side by side."
      },
      {
        "type": "h",
        "text": "AI drivers"
      },
      {
        "type": "p",
        "text": "AI karts are not scripted paths. They run the same physics as the player and produce the same input struct. Each point on the spline stores a **racing line** as a lateral offset from the centerline (inside on corners, wide on entry). The AI uses **pure pursuit**: pick a target point on the line a **lookahead** distance ahead, `lookahead = 6 m + 0.4 * speed`, steer toward it, and control speed from the curvature ahead (`vMax = sqrt(aLat / curvature)` with a lateral limit around 12 m/s squared, below which the kart brakes before the corner). The lookahead grows with speed because a short one oscillates at high speed and a long one cuts corners."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "Input Drive(Kart k)\n{\n    float look = 6f + 0.4f * k.speed;\n    Vector3 target = line.PointAt(k.s + look) + line.Normal(k.s + look) * (offset + noise);\n    Vector3 local = k.transform.InverseTransformPoint(target);\n    float steer = Mathf.Clamp(Mathf.Atan2(local.x, local.z) * Mathf.Rad2Deg / 30f, -1f, 1f);\n    float vTarget = Mathf.Min(topSpeed * skill, Mathf.Sqrt(aLat / line.Curvature(k.s + look * 2f)));\n    float throttle = k.speed < vTarget ? 1f : -0.5f; // brake when too fast for the corner\n    return new Input(steer, throttle);\n}"
      },
      {
        "type": "p",
        "text": "Identical AI looks robotic, so each driver gets variation: a `skill` scale on top speed (for example 0.92 to 1.0), a constant line offset of up to 1.5 m, a slow noise term on that offset, a reaction delay on braking, and a small chance of a mistake (a wide turn) that is higher on harder corners. All of it is data on a per-driver asset, so designers tune difficulty without touching code."
      },
      {
        "type": "h",
        "text": "Rubber banding and items"
      },
      {
        "type": "p",
        "text": "**Rubber banding** scales AI speed by the gap to the human player. Example: when an AI kart is 100 m behind, its top speed is scaled by up to 1.10; when 100 m ahead, by 0.95, with linear interpolation between and hard caps. It keeps races close for the whole pack, which is what makes a mid-race item hit matter. It is also **controversial**: players who build a lead feel punished, and visible cheating (an AI kart that passes a boosting player on a straight) breaks the sense that skill matters. The mitigations are to keep the caps small, scale smoothly instead of switching on, apply it to AI only, and never let it bend the rules of the physics a human sees."
      },
      {
        "type": "figure",
        "id": "kart-rubber-items",
        "caption": "Left: AI speed scale against the gap to the player, capped at +10% and -5%. Right: example item weights by position; the leader rolls mostly traps, the last kart mostly boosts and homing items.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"Left: AI speed scale against the gap to the human player. The scale rises from 0.95 when the AI is 100 metres ahead to 1.00 at zero gap and 1.10 when it is 100 metres behind; a dot slides along the curve. Right: example item weights for 1st, 4th and 8th place; the leader mostly rolls traps and the last place mostly rolls boosts and homing items.\"><style>.kart-rubber-items-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.kart-rubber-items-s{font-size:13px;fill:var(--fig-muted)}.kart-rubber-items-m{text-anchor:middle}.kart-rubber-items-e{text-anchor:end}.kart-rubber-items-p{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.kart-rubber-items-ax{stroke:var(--fig-line);stroke-width:1.5}.kart-rubber-items-gd{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 5}.kart-rubber-items-cv{fill:none;stroke:var(--fig-accent);stroke-width:3;stroke-linejoin:round}.kart-rubber-items-dt{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:kart-rubber-items-dt 6s linear infinite alternate;transform:translate(56px,194px)}.kart-rubber-items-wa{fill:var(--fig-warn);fill-opacity:.4;stroke:var(--fig-warn);stroke-width:1.5}.kart-rubber-items-ok{fill:var(--fig-ok);fill-opacity:.4;stroke:var(--fig-ok);stroke-width:1.5}.kart-rubber-items-bd{fill:var(--fig-bad);fill-opacity:.4;stroke:var(--fig-bad);stroke-width:1.5}.kart-rubber-items-v{font-size:12px;fill:var(--fig-ink);text-anchor:middle}@keyframes kart-rubber-items-dt{0%{transform:translate(56px,194px)}5%{transform:translate(68px,191.4px)}10%{transform:translate(80px,188.8px)}15%{transform:translate(92px,186.2px)}20%{transform:translate(104px,183.6px)}25%{transform:translate(116px,181px)}30%{transform:translate(128px,178.4px)}35%{transform:translate(140px,175.8px)}40%{transform:translate(152px,173.2px)}45%{transform:translate(164px,170.6px)}50%{transform:translate(176px,168px)}55%{transform:translate(188px,162.8px)}60%{transform:translate(200px,157.6px)}65%{transform:translate(212px,152.4px)}70%{transform:translate(224px,147.2px)}75%{transform:translate(236px,142px)}80%{transform:translate(248px,136.8px)}85%{transform:translate(260px,131.6px)}90%{transform:translate(272px,126.4px)}95%{transform:translate(284px,121.2px)}100%{transform:translate(296px,116px)}}</style><rect class=\"kart-rubber-items-p\" x=\"16\" y=\"16\" width=\"296\" height=\"258\" rx=\"14\"/><text class=\"kart-rubber-items-h\" x=\"32\" y=\"44\">AI speed scale</text><text class=\"kart-rubber-items-s\" x=\"32\" y=\"64\">boost behind, brake ahead</text><line class=\"kart-rubber-items-ax\" x1=\"56\" y1=\"90\" x2=\"56\" y2=\"220\"/><line class=\"kart-rubber-items-ax\" x1=\"56\" y1=\"220\" x2=\"296\" y2=\"220\"/><line class=\"kart-rubber-items-gd\" x1=\"56\" y1=\"168\" x2=\"296\" y2=\"168\"/><text class=\"kart-rubber-items-s kart-rubber-items-e\" x=\"50\" y=\"119.99999999999997\">1.10</text><text class=\"kart-rubber-items-s kart-rubber-items-e\" x=\"50\" y=\"172\">1.00</text><text class=\"kart-rubber-items-s kart-rubber-items-e\" x=\"50\" y=\"198.00000000000003\">0.95</text><text class=\"kart-rubber-items-s kart-rubber-items-m\" x=\"56\" y=\"238\">−100</text><text class=\"kart-rubber-items-s kart-rubber-items-m\" x=\"176\" y=\"238\">0</text><text class=\"kart-rubber-items-s kart-rubber-items-m\" x=\"296\" y=\"238\">+100</text><text class=\"kart-rubber-items-s kart-rubber-items-m\" x=\"176\" y=\"258\">gap to player (m), + = AI behind</text><polyline class=\"kart-rubber-items-cv\" points=\"56,194.00000000000003 176,168 296,115.99999999999997\"/><text class=\"kart-rubber-items-s kart-rubber-items-e\" x=\"296\" y=\"106\">cap +10%</text><text class=\"kart-rubber-items-s\" x=\"62\" y=\"212\">cap −5%</text><circle class=\"kart-rubber-items-dt\" r=\"6\"/><rect class=\"kart-rubber-items-p\" x=\"328\" y=\"16\" width=\"296\" height=\"258\" rx=\"14\"/><text class=\"kart-rubber-items-h\" x=\"344\" y=\"44\">Item roll by race position</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"88\">1st</text><rect class=\"kart-rubber-items-wa\" x=\"380\" y=\"70\" width=\"132\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"446\" y=\"88\">60</text><rect class=\"kart-rubber-items-ok\" x=\"512\" y=\"70\" width=\"77\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"550.5\" y=\"88\">35</text><rect class=\"kart-rubber-items-bd\" x=\"589\" y=\"70\" width=\"11\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"594.5\" y=\"88\">5</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"126\">4th</text><rect class=\"kart-rubber-items-wa\" x=\"380\" y=\"108\" width=\"55\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"407.5\" y=\"126\">25</text><rect class=\"kart-rubber-items-ok\" x=\"435\" y=\"108\" width=\"88\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"479\" y=\"126\">40</text><rect class=\"kart-rubber-items-bd\" x=\"523\" y=\"108\" width=\"77\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"561.5\" y=\"126\">35</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"164\">8th</text><rect class=\"kart-rubber-items-wa\" x=\"380\" y=\"146\" width=\"11\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"385.5\" y=\"164\">5</text><rect class=\"kart-rubber-items-ok\" x=\"391\" y=\"146\" width=\"99\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"440.5\" y=\"164\">45</text><rect class=\"kart-rubber-items-bd\" x=\"490\" y=\"146\" width=\"110\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"545\" y=\"164\">50</text><rect class=\"kart-rubber-items-wa\" x=\"344\" y=\"190\" width=\"10\" height=\"10\"/><text class=\"kart-rubber-items-s\" x=\"359\" y=\"200\">trap</text><rect class=\"kart-rubber-items-ok\" x=\"420\" y=\"190\" width=\"10\" height=\"10\"/><text class=\"kart-rubber-items-s\" x=\"435\" y=\"200\">boost</text><rect class=\"kart-rubber-items-bd\" x=\"504\" y=\"190\" width=\"10\" height=\"10\"/><text class=\"kart-rubber-items-s\" x=\"519\" y=\"200\">homing</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"234\">example weights, percent per roll</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"254\">trailing karts roll stronger items</text></svg>"
      },
      {
        "type": "p",
        "text": "**Items** are the second catch-up system, and it is honest because humans get it too. When a kart drives through an item box, roll a weighted random choice from a table indexed by its race position. The weights are data: the leader gets defensive or weak items, the last kart gets boosts and homing attacks. Roll on the server in multiplayer, and make the roll a pure function of `(position, rng)` so it can be tested. A **homing item** does not path-find. It follows the spline: its own `s` increases at about 1.4 times the leader's top speed, it steers toward the target when within a short range, and it falls back to the spline if the target is lost. Following the spline means it cannot get stuck on walls."
      },
      {
        "type": "h",
        "text": "Camera and split-screen"
      },
      {
        "type": "p",
        "text": "The **spring-arm camera** targets a point behind and above the kart (for example 5 m back, 2.2 m up), moves toward it with the frame-rate independent smoothing from earlier lessons, and lags its rotation more than its position so turns feel heavy. It raycasts from the kart to the desired position and pulls in if a wall is hit. **FOV rises with speed**, from about 60 degrees at rest to about 80 on a boost, with speed lines at the edges; the wider view is the cheapest way to sell speed. Rotation should follow the kart's velocity direction during a drift, not its facing, or the player sees the scene swing sideways."
      },
      {
        "type": "p",
        "text": "**Split-screen** is a CPU problem more than a pixel problem. Four viewports each cover a quarter of the screen, so total pixels shaded stays about the same. But the scene is culled and drawn four times, so draw calls, culling and shadow passes cost roughly four times as much. At 60 fps there is 16.6 ms per frame, so each view gets about 4 ms of CPU. The standard moves are a lower LOD bias per view, no or cheaper shadows on the secondary views, fewer particles and a shared static batch, because resolution is not the bottleneck."
      },
      {
        "type": "h",
        "text": "Online play"
      },
      {
        "type": "p",
        "text": "Online karts at 60 Hz physics cannot wait for the server before turning. **Client prediction** runs the player's own kart locally the moment input is read and tags each input with a tick number. The server simulates authoritatively and sends snapshots at about 20 Hz. When a snapshot for tick 600 arrives and the client is at tick 605, the client sets its kart to the server state for tick 600, **replays the stored inputs 601 to 605**, and blends away any visible difference over a few frames. Other players' karts are not predicted. The client **interpolates** them between two buffered snapshots about 100 ms in the past (two snapshot intervals at 20 Hz), which is smooth and tolerates one lost packet. Extrapolating forward on a turn is a guess that visibly pops when wrong."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "void OnServerState(int tick, KartState s)\n{\n    // Discard acknowledged inputs, then rewind to the authoritative state.\n    while (pending.Count > 0 && pending.Peek().tick <= tick) pending.Dequeue();\n    Vector3 shownPos = kart.Position + visualError;   // what the player sees now\n    kart.Restore(s);\n    foreach (var input in pending)          // 601..605 in the example\n        kart.Step(input, fixedDt);\n    // Show the corrected state smoothly: error decays instead of snapping.\n    visualError = shownPos - kart.Position;\n}\nvoid LateUpdate()\n{\n    visualError *= Mathf.Exp(-10f * Time.deltaTime);   // about 63% gone in 0.1 s\n    visual.position = kart.Position + visualError;\n}"
      },
      {
        "type": "p",
        "text": "Collisions between karts are the hard part: the local kart's prediction does not include other karts' true positions (they are 100 ms in the past on your screen). The practical answer is **lenient collisions**. Kart-to-kart contact is a soft push resolved on the server with small impulses, the local view does not predict it, and item hits use generous radii and are decided server side. The result is that the player sees a hit that matches what they saw, rather than a physically exact one that was wrong on their screen."
      },
      {
        "type": "h",
        "text": "Decisions and why they work"
      },
      {
        "type": "list",
        "items": [
          "**Raycast wheels, not wheel colliders.** Four raycasts and two numbers per wheel (k, c) give predictable handling designers can reason about. Full tyre models are more realistic and much harder to make forgiving.",
          "**Grip as a tunable fraction, not friction.** Cancelling a fraction of sideways speed lets you make drift, ice and boost pads by changing one number. A friction-coefficient model gives the same results only after hours of tuning.",
          "**One progress float per kart.** Position order, wrong-way, AI targets and respawns all read the same value. Computing them separately lets them disagree.",
          "**Windowed nearest-point search.** It costs about 60 checks per kart and cannot jump to a different road. Global search is simpler and fails exactly on overpasses.",
          "**Respawn at the last checkpoint.** It is slightly less tidy than the nearest point, and it cannot skip track. Exploits found in playtest cost more than the tidiness.",
          "**AI uses the player's input struct.** It exercises the same physics, so tracks that work for humans work for AI. A separate AI movement model needs its own debugging and breaks on new items.",
          "**Small, smooth rubber band plus item odds.** Two soft catch-up systems keep races close without one big visible cheat. A hard speed-up for trailing karts reads as cheating.",
          "**Predict the local kart, interpolate the rest.** The player gets zero-latency control and a world that never visibly rewinds. Waiting for the server feels like driving through mud."
        ]
      },
      {
        "type": "callout",
        "kind": "agent",
        "text": "Agents write the data-driven parts of a kart racer well: the spline sampler, the arc-length table, the item weight table, the lap and checkpoint state machine. Give them the invariants as tests. For example: a kart driven by recorded inputs finishes three laps with progress strictly non-decreasing; skipping any gate never increments the lap; respawn never reduces progress below the last gate; two runs from the same seed give the same finish order. Have the agent write an editor gizmo that draws the spline, windows, gates and AI target. Verify yourself the things only a human can judge: how the suspension and drift feel, whether the rubber band is visible, and netcode behaviour under 100 ms of latency and 3 percent packet loss. Do not accept a physics change without playing a lap."
      },
      {
        "type": "callout",
        "kind": "warn",
        "text": "The classic pitfalls: counting time or boost in frames instead of seconds, so the mini-turbo differs between 30 and 60 fps; using the global nearest spline point, which jumps on overpasses and near shortcuts; making rubber banding so strong that a human who drives a perfect lap still sees AI karts glued to their bumper; and letting the client decide item hits, which any modified client can abuse."
      },
      {
        "type": "patterns",
        "patterns": [
          {
            "signal": "Kart bounces for seconds after landing from a jump, or bottoms out on every big drop",
            "use": "Add damping along the ray, then tune k",
            "why": "F = k*compression - c*velocity. k carries the weight and c removes energy. A damping ratio of about 0.5 to 0.7 settles in one bounce; raising k alone only makes the oscillation faster."
          },
          {
            "signal": "Kart slides like on ice at speed, or the steering is twitchy and spins out on the straight",
            "use": "Cancel sideways speed and use a steer curve",
            "why": "Grip is the fraction of lateral velocity removed per tick, so it is one number. Cut steering from about 30 degrees to about 8 as speed rises so high-speed input stays controllable."
          },
          {
            "signal": "A kart's race progress jumps by hundreds of metres where the road crosses or runs beside itself",
            "use": "Search a window near the last index",
            "why": "A global nearest-point search can pick the other road. Checking about 30 samples either side of the last index is cheaper and cannot jump, as long as the index wraps at the seam."
          },
          {
            "signal": "Players skip track by cutting through the infield or by falling off at a good spot",
            "use": "Require ordered gates, respawn at the last",
            "why": "A lap counts only if every gate was crossed in order, and respawn restores the last gate. Progress then cannot be gained by leaving the road, whatever the geometry allows."
          },
          {
            "signal": "AI drivers all take the same line and brake at the same spots, so the field looks like a train",
            "use": "Add per-driver line offset and skill",
            "why": "A skill scale on top speed, a constant line offset and slow noise on it make each driver differ in data, with no new code. Identical AI also stack up behind one another and never overtake."
          },
          {
            "signal": "Trailing players quit because the leader is never caught, and the leader holds items that stay strong",
            "use": "Weight item rolls by race position",
            "why": "A table of weights per position gives the last kart boosts and homing items and the leader weak ones. It keeps the pack close with a system every player can see and use, unlike hidden AI speed."
          },
          {
            "signal": "Remote karts jitter at a 20 Hz snapshot rate, and fast turns snap when a packet is late",
            "use": "Interpolate remote karts 100 ms in the past",
            "why": "Blending between two buffered snapshots is smooth and survives one lost packet. Extrapolating guesses where the kart will be, and a turn makes the guess visibly wrong."
          },
          {
            "signal": "Four-player split-screen drops below 60 fps while every single view alone runs fine",
            "use": "Cut per-view CPU cost, not resolution",
            "why": "Each view repeats culling, draw calls and shadow passes, so CPU cost is about 4x while total pixels stay the same. Lower LOD, shadows and particles on the extra views instead of lowering resolution."
          }
        ]
      }
    ],
    "keyPoints": [
      "Arcade handling uses one rigid body with four raycast wheels: spring-damper F = k * compression - c * velocity, and lateral grip as a fraction of sideways speed cancelled.",
      "Stability comes from tuning: a low centre of mass, anti-roll, speed-based downforce, a steering angle that shrinks with speed and a self-righting torque.",
      "Race progress is lap * L + s, where s is the distance along the spline of the nearest point, found in a window around the last index; ordered checkpoints stop shortcuts, and respawn uses the last gate.",
      "AI drivers use pure pursuit on a stored racing line, with lookahead that grows with speed and per-driver skill, offset and mistake data; they use the same inputs as the player.",
      "Catch-up should be small and visible: capped smooth rubber banding on AI plus item odds weighted by position, rather than a large hidden speed boost.",
      "Online, the local kart is predicted and reconciled by replaying inputs, remote karts are interpolated about 100 ms in the past, and collisions and item hits are lenient and resolved on the server."
    ],
    "quiz": [
      {
        "q": "After landing from a jump, a kart's suspension keeps oscillating for several seconds before settling. The spring force is `k * compression`. What is the right fix?",
        "options": [
          "Increase k so the springs push back harder after the landing",
          "Add a damping term, c times compression speed, along the ray",
          "Lower the rest length so the springs have less travel to use",
          "Raise the fixed tick rate so the spring is evaluated sooner"
        ],
        "answer": 1,
        "explain": "A pure spring has no way to lose energy, so it rings. The c * velocity term removes it, and a damping ratio of 0.5 to 0.7 settles in about one bounce. A larger k makes the ringing faster, a shorter travel makes bottoming out more likely, and a higher tick rate only samples the same oscillation more often."
      },
      {
        "q": "On a track with an overpass, one kart's race progress suddenly jumps ahead by about 400 m while it drives on the lower road. What is the cause and fix?",
        "options": [
          "The lap counter ran twice, so reset the lap when crossing the finish",
          "Floating point error at large distances, so use doubles for progress",
          "A global nearest-point search chose the upper road, so search a window",
          "The checkpoint was missed, so add more gates along the track"
        ],
        "answer": 2,
        "explain": "The upper road is physically close to the kart, so a global nearest-point search can pick it and return an s hundreds of metres away. Searching about 30 samples either side of the last index cannot jump. Float precision is not an issue at 1.8 km, and extra gates do not change which spline point is nearest."
      },
      {
        "q": "Playtesters say AI karts zoom back to the pack and cheat. The rubber band scales AI speed by up to 40 percent. What is the best change?",
        "options": [
          "Cap the scale near +10% and -5% and ramp it smoothly with the gap",
          "Remove all catch-up so every AI kart has one fixed speed",
          "Raise the cap to 60% so the gap closes faster and ends sooner",
          "Apply the same scaling to the human so the rules are fair"
        ],
        "answer": 0,
        "explain": "A small, smooth, capped scale keeps races close and is hard to notice. Removing it leaves pack spread that no item can fix, a bigger cap is more visible cheating, and scaling the human changes the physics the player is tuning their driving to."
      },
      {
        "q": "Remote karts in an online race stutter even though snapshots arrive every 50 ms. The client draws each remote kart at the newest snapshot position. What is the fix?",
        "options": [
          "Predict remote karts with their last input so they never wait",
          "Raise the server tick rate to 120 Hz and send every tick",
          "Extrapolate remote karts forward by the round-trip time",
          "Interpolate between snapshots, rendering about 100 ms behind"
        ],
        "answer": 3,
        "explain": "Drawing the newest snapshot moves the kart in 50 ms jumps. Interpolating between two buffered snapshots is smooth and survives a lost packet. We do not have the remote player's input in time to predict, and extrapolation guesses wrong whenever the kart turns."
      },
      {
        "q": "A four-player split-screen mode drops to 40 fps. GPU time is 6 ms, CPU render thread time is 25 ms. Which change helps most?",
        "options": [
          "Lower the resolution of each of the four viewports",
          "Cut per-view CPU work: LOD, shadow casters, particles",
          "Add MSAA so the smaller viewports look sharper",
          "Enable a larger shadow cascade count for the leading view"
        ],
        "answer": 1,
        "explain": "The frame is CPU bound: each view repeats culling and draw submission, so cost is about four times a single view. Lowering resolution reduces GPU pixels, which are not the limit. More MSAA or more cascades add work without cutting the CPU cost."
      },
      {
        "q": "Last-place players in your kart racer say they never get a chance, because the item box gives them the same items as the leader. Which move from the patterns applies?",
        "options": [
          "Add damping along the ray, then tune k",
          "Search a window near the last index",
          "Interpolate remote karts 100 ms in the past",
          "Weight item rolls by race position"
        ],
        "answer": 3,
        "explain": "A position-indexed weight table gives trailing karts stronger items and the leader weaker ones, a visible comeback mechanic. The other moves address suspension, progress projection and netcode, none of which change who gets which item."
      }
    ]
  }
];
