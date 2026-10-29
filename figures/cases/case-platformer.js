window.TOPIC_PART = [
  {
    "id": "case-platformer",
    "title": "Case study: 2D platformer",
    "minutes": 18,
    "summary": "How a tight 2D platformer is built: a fixed-step kinematic controller, per-axis tile collision, jump physics derived from designer values, forgiveness windows and a smoothed camera.",
    "lesson": [
      {
        "type": "p",
        "text": "A player sprints toward a ledge, steps off it, and presses jump 90 ms later. On screen the character is already falling. The game jumps anyway, and the player never notices that it cheated. A tight 2D platformer is built from dozens of small decisions like this one, each tuned in milliseconds and pixels. This case study takes the genre apart: the loop that keeps it deterministic, the collision code that keeps a character on a tile grid, the numbers behind a jump, the forgiveness that makes it fair, and the camera that follows. The examples use 16 px tiles and a 60 Hz simulation, and the code is Unity-flavoured C#, but nothing here depends on an engine."
      },
      {
        "type": "h",
        "text": "Components"
      },
      {
        "type": "list",
        "items": [
          "**Input** samples the device every frame and turns it into intent: move axis, jump pressed, jump held, dash pressed.",
          "**Simulation** runs at a fixed 60 Hz: the player state machine, velocity, gravity and the forgiveness timers.",
          "**Collision** moves a box through the tilemap one axis at a time and reports contacts: floor, wall, ceiling.",
          "**World** holds the room's tilemap, its entities (enemies, moving platforms, hazards) and the active checkpoint.",
          "**Camera** reads the player after each tick and follows with a dead zone and smoothing.",
          "**Presentation** draws the previous and current tick blended by alpha, and plays animation and effects."
        ]
      },
      {
        "type": "p",
        "text": "Data flows one way: input, then simulation (which calls collision), then camera, then render. Rendering never writes back into the simulation. That one rule is what makes replays, automated tests and exact tuning possible."
      },
      {
        "type": "h",
        "text": "Fixed timestep and render interpolation"
      },
      {
        "type": "p",
        "text": "Jump height must not depend on frame rate. With a variable `dt`, the integrator `y += v * dt` accumulates different error at 30, 60 and 144 fps, and a jump tuned to clear a 4-tile gap at 60 fps can fall short at 30. The fix is the fixed timestep from the game loop section: simulate in constant 1/60 s ticks (16.7 ms) and let the renderer run at any rate. An accumulator collects real time and the loop spends it in whole ticks. Clamp the accumulator to about 0.1 s so one long hitch cannot trigger a spiral of catch-up ticks."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "const float Dt = 1f / 60f;\nfloat acc;\n\nvoid Update() {\n  acc += Mathf.Min(Time.unscaledDeltaTime, 0.1f);  // clamp hitches\n  while (acc >= Dt) {\n    prev = curr;                                   // last tick's state\n    curr = Simulate(curr, input.Consume(), Dt);    // one 16.7 ms tick\n    acc -= Dt;\n  }\n  float alpha = acc / Dt;                          // 0..1 between ticks\n  sprite.position = Vector2.Lerp(prev.pos, curr.pos, alpha);\n}"
      },
      {
        "type": "p",
        "text": "The renderer then draws the state between the last two ticks. This costs up to one tick (16.7 ms) of display latency, and it removes the stutter you get when 60 Hz motion is shown on a 144 Hz display, where some frames would otherwise repeat the same position. Inside the tick, integrate with semi-implicit Euler: update velocity first, then move by the new velocity."
      },
      {
        "type": "h",
        "text": "Why a kinematic controller, not a rigidbody"
      },
      {
        "type": "p",
        "text": "A dynamic rigidbody moves because forces and impulses act on it. It has mass, friction, bounce and rotation, and a solver decides where it ends up. A platformer character is the opposite case. The designer wants to say 'run speed 90 px/s, reached in 6 ticks, apex 56 px', and get exactly that every time. Mario-style feel needs things a physics engine avoids: instant mid-air direction changes, different gravity going up and down, a wall jump that sets both velocities at once, and no sliding or being shoved by a crate. With a dynamic body you fight the solver for each of these, and the result depends on the physics step (Unity's default is 0.02 s) and the solver's iteration count."
      },
      {
        "type": "p",
        "text": "In a **kinematic controller** your code owns velocity and position, and collision only stops the box at solid tiles. The price is writing that collision yourself: roughly 200 to 400 lines for tile AABB tests, one-way platforms and moving platforms. That is a small price for code that is deterministic, cheap and easy to unit test. In Unity you can still keep a kinematic `Rigidbody2D` for triggers, or skip the physics engine and test directly against the tile array."
      },
      {
        "type": "h",
        "text": "Tilemap collision with AABB"
      },
      {
        "type": "p",
        "text": "The tile grid is already a spatial partition. The world is a 2D array of tile ids, 16 x 16 px each. A box with edges `left, right, top, bottom` can only touch columns `floor(left / 16)` to `floor((right - 1) / 16)` and the matching rows. A 14 x 24 px character spans at most 2 columns and 3 rows, so a collision query reads at most 6 array cells. There is no tree and no hash: the lookup is one multiply and one index per cell."
      },
      {
        "type": "figure",
        "id": "plat-tile-resolve",
        "caption": "Watch the two snaps: the box stops at the wall face after the X move, then at the floor face after the Y move.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"A box moves diagonally toward a floor and wall corner on a tile grid. The collision code moves it along X until it touches the wall and snaps it, then moves it along Y until it touches the floor and snaps it. Four numbered steps on the right highlight in turn.\"><style>.plat-tile-resolve-t{font-size:13px;fill:var(--fig-ink)}.plat-tile-resolve-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.plat-tile-resolve-s{font-size:12px;fill:var(--fig-muted)}.plat-tile-resolve-c{text-anchor:middle}.plat-tile-resolve-e{text-anchor:end}.plat-tile-resolve-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.plat-tile-resolve-gr{fill:none;stroke:var(--fig-line);stroke-width:1}.plat-tile-resolve-sol{fill:var(--fig-ink);fill-opacity:.22;stroke:var(--fig-muted);stroke-width:1.5}.plat-tile-resolve-gh{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 4}.plat-tile-resolve-bx{fill:var(--fig-accent);fill-opacity:.85;stroke:var(--fig-ink);stroke-width:1.5;animation:plat-tile-resolve-kb 9s linear infinite}.plat-tile-resolve-hw{fill:var(--fig-bad);animation:plat-tile-resolve-kw 9s linear infinite}.plat-tile-resolve-hf{fill:var(--fig-bad);animation:plat-tile-resolve-kf 9s linear infinite}.plat-tile-resolve-s1{animation:plat-tile-resolve-a1 9s linear infinite}.plat-tile-resolve-s2{animation:plat-tile-resolve-a2 9s linear infinite}.plat-tile-resolve-s3{animation:plat-tile-resolve-a3 9s linear infinite}.plat-tile-resolve-s4{animation:plat-tile-resolve-a4 9s linear infinite}.plat-tile-resolve-sep{stroke:var(--fig-line);stroke-width:1.5}@keyframes plat-tile-resolve-kb{0%,5%{transform:translate(0px,0px);opacity:1}35%,45%{transform:translate(204px,0px)}75%,94%{transform:translate(204px,116px);opacity:1}97%{transform:translate(204px,116px);opacity:0}99.9%{transform:translate(0px,0px);opacity:0}100%{transform:translate(0px,0px);opacity:1}}@keyframes plat-tile-resolve-kw{0%,34%{opacity:0}36%,96%{opacity:1}97%,100%{opacity:0}}@keyframes plat-tile-resolve-kf{0%,74%{opacity:0}76%,96%{opacity:1}97%,100%{opacity:0}}@keyframes plat-tile-resolve-a1{0%,34%{opacity:1}38%,100%{opacity:.5}}@keyframes plat-tile-resolve-a2{0%,32%{opacity:.5}36%,46%{opacity:1}50%,100%{opacity:.5}}@keyframes plat-tile-resolve-a3{0%,44%{opacity:.5}48%,76%{opacity:1}80%,100%{opacity:.5}}@keyframes plat-tile-resolve-a4{0%,74%{opacity:.5}78%,92%{opacity:1}96%,100%{opacity:.5}}</style><text class=\"plat-tile-resolve-s\" x=\"40\" y=\"28\">One move: velocity right and down, into a corner</text><rect class=\"plat-tile-resolve-sol\" x=\"40\" y=\"232\" width=\"320\" height=\"32\"/><rect class=\"plat-tile-resolve-sol\" x=\"296\" y=\"104\" width=\"64\" height=\"128\"/><path class=\"plat-tile-resolve-gr\" d=\"M40 40V264M72 40V264M104 40V264M136 40V264M168 40V264M200 40V264M232 40V264M264 40V264M296 40V264M328 40V264M360 40V264M40 40H360M40 72H360M40 104H360M40 136H360M40 168H360M40 200H360M40 232H360M40 264H360\"/><rect class=\"plat-tile-resolve-gh\" x=\"64\" y=\"88\" width=\"28\" height=\"28\"/><text class=\"plat-tile-resolve-s plat-tile-resolve-c\" x=\"78\" y=\"80\">start</text><path class=\"plat-tile-resolve-gh\" d=\"M92 102H268M282 116V204\"/><rect class=\"plat-tile-resolve-gh\" x=\"268\" y=\"204\" width=\"28\" height=\"28\"/><rect class=\"plat-tile-resolve-hw\" x=\"293\" y=\"104\" width=\"4\" height=\"12\"/><rect class=\"plat-tile-resolve-hf\" x=\"268\" y=\"229\" width=\"28\" height=\"4\"/><rect class=\"plat-tile-resolve-bx\" x=\"64\" y=\"88\" width=\"28\" height=\"28\"/><text class=\"plat-tile-resolve-s\" x=\"40\" y=\"290\">tile = 16 px, drawn at 2x</text><text class=\"plat-tile-resolve-h\" x=\"392\" y=\"56\">Resolve one axis at a time</text><text class=\"plat-tile-resolve-t plat-tile-resolve-s1\" x=\"392\" y=\"88\">1  move X by vx * dt</text><text class=\"plat-tile-resolve-t plat-tile-resolve-s2\" x=\"392\" y=\"112\">2  hit: snap to wall, vx = 0</text><text class=\"plat-tile-resolve-t plat-tile-resolve-s3\" x=\"392\" y=\"136\">3  move Y by vy * dt</text><text class=\"plat-tile-resolve-t plat-tile-resolve-s4\" x=\"392\" y=\"160\">4  hit: snap to floor, vy = 0</text><text class=\"plat-tile-resolve-s\" x=\"392\" y=\"186\">grounded = hit while moving down</text><line class=\"plat-tile-resolve-sep\" x1=\"392\" y1=\"204\" x2=\"620\" y2=\"204\"/><text class=\"plat-tile-resolve-h\" x=\"392\" y=\"228\">Why not both at once?</text><text class=\"plat-tile-resolve-s\" x=\"392\" y=\"250\">A diagonal hit on a corner does</text><text class=\"plat-tile-resolve-s\" x=\"392\" y=\"268\">not say which face was struck.</text><text class=\"plat-tile-resolve-s\" x=\"392\" y=\"290\">Fast moves: sub-step at tile / 2</text></svg>"
      },
      {
        "type": "p",
        "text": "Move on X first and fix it, then move on Y and fix it. Each pass is one-dimensional: if the box overlaps a solid tile, snap its edge to the tile's edge and zero the velocity on that axis. There are no contact normals and no penetration-depth maths. The passes also answer the questions gameplay asks. A hit while moving down means the character is grounded. A hit while moving up is a head bump. A hit on X is a wall, which is what wall-slide needs. Resolving both axes at once cannot tell which face of a corner was struck, and the usual result is a character that sticks to walls."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "void MoveX(float amount) {\n  xRem += amount;                       // keep the sub-pixel remainder\n  int move = (int)MathF.Round(xRem);\n  xRem -= move;\n  int sign = Math.Sign(move);\n  while (move != 0) {                   // step 1 px at a time: no tunneling\n    if (map.Overlaps(box.Shifted(sign, 0))) { vel.x = 0; xRem = 0; break; }\n    box.x += sign; move -= sign;\n  }\n}\n// MoveY is the same on the other axis. A hit while moving down sets onGround."
      },
      {
        "type": "p",
        "text": "**Tunneling** happens when one tick moves the box farther than the geometry is thick, so the final position is already past the wall and no overlap is found. At 60 Hz a 240 px/s fall is 4 px per tick, and a 16 px tile cannot be skipped. A 480 px/s dash is 8 px per tick, still safe. A knockback at 2400 px/s is 40 px per tick and can skip a whole tile. The cheap fix is the loop above: step one pixel (or at most half a tile) at a time and test after every step. A swept test against tiles expanded by the box size gives the same answer in fewer queries, at the cost of more code. Unity's `BoxCast` sweeps for you at the price of a physics query."
      },
      {
        "type": "list",
        "items": [
          "**One-way platforms.** Solid only when the box is moving down (or still) and its bottom edge was at or above the platform's top on the previous tick. Jumping up through it, or pressing down to drop, skips the test.",
          "**Slopes.** Treat a slope tile as a height function. While grounded, sample the surface under the box's centre and place the feet on it. Going downhill, snap down by a few pixels so the character does not hop off every step. Integer height tables for 45 degree slopes are the robust option; arbitrary angles multiply the edge cases.",
          "**Moving platforms.** Move the platform first, then move each rider by the same delta through the normal `MoveX` and `MoveY`, so a rider is stopped by walls instead of being carried into them."
        ]
      },
      {
        "type": "h",
        "text": "Deriving the jump from designer values"
      },
      {
        "type": "p",
        "text": "Designers think in heights and times, not in gravity. 'The jump peaks at 3.5 tiles after 0.35 s.' Derive the engine values from that. Under constant gravity the rising speed falls linearly from `v0` to 0 at the apex, so `v0 = g * t`. The distance covered is the average speed times the time, `h = (v0 / 2) * t`. Solve the pair: **g = 2h / t²** and **v0 = 2h / t**. With h = 56 px and t = 0.35 s, g is about 914 px/s² and v0 is 320 px/s. Change the designer's numbers and the physics follows; nobody hunts for a magic `-9.81`."
      },
      {
        "type": "p",
        "text": "The 60 Hz integrator lands a few pixels under the analytic apex (about 53 px here), because each tick uses the new velocity for a whole step. Treat the equations as the starting point and tune the final value by playing. What matters is that the tuning knobs are the height and time the level designer already reasons about."
      },
      {
        "type": "h",
        "text": "Variable height, fall speed and apex hang"
      },
      {
        "type": "p",
        "text": "A tap should hop and a hold should leap. When the button is released while the character is still rising, cut the upward velocity (multiply by 0.5). Height scales with v², so releasing on the first tick leaves `(v0 / 2)² / 2g = h / 4`: a 14 px hop against a 56 px jump. The alternatives are extra gravity while the button is up, which is smoother but makes the peak less predictable, and a minimum hold time, which adds input latency."
      },
      {
        "type": "p",
        "text": "Two more tweaks shape the arc. A **fall gravity multiplier** of 1.5 to 2 makes the way down faster than the way up: at 1.6x the fall from the apex takes 0.28 s against 0.35 s rising, which reads as snappy instead of floaty. **Apex hang** halves gravity while the button is held and `|vy|` is below about 40 px/s, which adds roughly 70 ms of airtime at the top (with the 1.6x fall gravity) for precise landings. Cap the fall speed (for example 360 px/s) so the character stays readable and the tunneling bound above holds."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "float g  = 2f * h / (t * t);              // h = 56 px, t = 0.35 s -> 914\nfloat v0 = 2f * h / t;                    // 320 px/s\n\nif (intent.jumpReleased && vel.y > 0) vel.y *= 0.5f;   // variable height\n\nfloat scale = vel.y < 0 ? 1.6f : 1f;                   // heavier fall\nif (intent.jumpHeld && Mathf.Abs(vel.y) < 40f) scale *= 0.5f;  // apex hang\nvel.y = Mathf.Max(vel.y - g * scale * dt, -maxFall);   // maxFall = 360"
      },
      {
        "type": "figure",
        "id": "plat-jump-arc",
        "caption": "Left: the same launch speed gives a full hop when held and about a quarter of the height when tapped. Right: the jump pressed inside the coyote window still launches.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Two panels. Left: a full jump arc when the button is held and a much lower short hop when it is released early. Right: a character runs off a ledge, a 0.1 second coyote window follows the edge, and a jump pressed inside it still launches and lands on the next platform.\"><style>.plat-jump-arc-t{font-size:13px;fill:var(--fig-ink)}.plat-jump-arc-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.plat-jump-arc-s{font-size:12px;fill:var(--fig-muted)}.plat-jump-arc-c{text-anchor:middle}.plat-jump-arc-e{text-anchor:end}.plat-jump-arc-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.plat-jump-arc-g{stroke:var(--fig-ink);stroke-width:2}.plat-jump-arc-sol{fill:var(--fig-ink);fill-opacity:.15;stroke:var(--fig-line);stroke-width:1.5}.plat-jump-arc-pa{fill:none;stroke:var(--fig-accent);stroke-width:2;stroke-opacity:.55;stroke-dasharray:5 5}.plat-jump-arc-pb{fill:none;stroke:var(--fig-accent2);stroke-width:2;stroke-opacity:.7;stroke-dasharray:5 5}.plat-jump-arc-win{fill:var(--fig-warn);fill-opacity:.2;stroke:var(--fig-warn);stroke-width:1.5;stroke-dasharray:4 4}.plat-jump-arc-mk{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:3 4}.plat-jump-arc-la{stroke:var(--fig-accent);stroke-width:2.5}.plat-jump-arc-lb{stroke:var(--fig-accent2);stroke-width:2.5}.plat-jump-arc-d1{transform:translate(150px,144px);fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:plat-jump-arc-k1 7s linear infinite}.plat-jump-arc-d2{transform:translate(110px,219px);fill:var(--fig-accent2);stroke:var(--fig-bg);stroke-width:2;animation:plat-jump-arc-k2 7s linear infinite}.plat-jump-arc-d3{transform:translate(520px,147.5px);fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2;animation:plat-jump-arc-k3 7s linear infinite}@keyframes plat-jump-arc-k1{0%{transform:translate(70px,244px);opacity:1}2.5%{transform:translate(80px,220.6px)}5%{transform:translate(90px,200.3px)}7.5%{transform:translate(100px,183.1px)}10%{transform:translate(110px,169px)}12.5%{transform:translate(120px,158.1px)}15%{transform:translate(130px,150.3px)}17.5%{transform:translate(140px,145.6px)}20%{transform:translate(150px,144px)}22.5%{transform:translate(160px,145.6px)}25%{transform:translate(170px,150.3px)}27.5%{transform:translate(180px,158.1px)}30%{transform:translate(190px,169px)}32.5%{transform:translate(200px,183.1px)}35%{transform:translate(210px,200.3px)}37.5%{transform:translate(220px,220.6px)}40%{transform:translate(230px,244px)}94%{transform:translate(230px,244px);opacity:1}97%,100%{transform:translate(230px,244px);opacity:0}}@keyframes plat-jump-arc-k2{0%,50%{transform:translate(70px,244px);opacity:1}52.5%{transform:translate(80px,233.1px)}55%{transform:translate(90px,225.3px)}57.5%{transform:translate(100px,220.6px)}60%{transform:translate(110px,219px)}62.5%{transform:translate(120px,220.6px)}65%{transform:translate(130px,225.3px)}67.5%{transform:translate(140px,233.1px)}70%{transform:translate(150px,244px)}94%{transform:translate(150px,244px);opacity:1}97%,100%{transform:translate(150px,244px);opacity:0}}@keyframes plat-jump-arc-k3{0%{transform:translate(360px,204px);opacity:1}30%{transform:translate(440px,204px)}31.8%{transform:translate(447px,204.6px)}33.5%{transform:translate(454px,206.5px)}35.3%{transform:translate(461px,209.6px)}37%{transform:translate(468px,214px)}39.4%{transform:translate(475.4px,197px)}41.7%{transform:translate(482.9px,182.4px)}44.1%{transform:translate(490.3px,170.4px)}46.4%{transform:translate(497.7px,160.9px)}48.8%{transform:translate(505.1px,153.9px)}51.1%{transform:translate(512.6px,149.5px)}53.5%{transform:translate(520px,147.5px)}55.9%{transform:translate(527.4px,148px)}58.2%{transform:translate(534.9px,151.1px)}60.6%{transform:translate(542.3px,156.7px)}62.9%{transform:translate(549.7px,164.7px)}65.3%{transform:translate(557.1px,175.3px)}67.6%{transform:translate(564.6px,188.4px)}70%{transform:translate(572px,204px)}94%{transform:translate(572px,204px);opacity:1}97%,100%{transform:translate(572px,204px);opacity:0}}</style><rect class=\"plat-jump-arc-b\" x=\"16\" y=\"16\" width=\"296\" height=\"268\" rx=\"14\"/><rect class=\"plat-jump-arc-b\" x=\"328\" y=\"16\" width=\"296\" height=\"268\" rx=\"14\"/><text class=\"plat-jump-arc-h\" x=\"32\" y=\"42\">Variable jump height</text><text class=\"plat-jump-arc-s\" x=\"32\" y=\"62\">release early: vy *= 0.5</text><line class=\"plat-jump-arc-g\" x1=\"32\" y1=\"250\" x2=\"296\" y2=\"250\"/><path class=\"plat-jump-arc-pa\" d=\"M70 244 Q150 44 230 244\"/><path class=\"plat-jump-arc-pb\" d=\"M70 244 Q110 194 150 244\"/><text class=\"plat-jump-arc-s plat-jump-arc-c\" x=\"150\" y=\"130\">apex h</text><line class=\"plat-jump-arc-la\" x1=\"32\" y1=\"270\" x2=\"50\" y2=\"270\"/><text class=\"plat-jump-arc-s\" x=\"56\" y=\"274\">hold: full hop</text><line class=\"plat-jump-arc-lb\" x1=\"170\" y1=\"270\" x2=\"188\" y2=\"270\"/><text class=\"plat-jump-arc-s\" x=\"194\" y=\"274\">tap: h / 4</text><circle class=\"plat-jump-arc-d1\" cx=\"0\" cy=\"0\" r=\"6\"/><circle class=\"plat-jump-arc-d2\" cx=\"0\" cy=\"0\" r=\"6\"/><text class=\"plat-jump-arc-h\" x=\"344\" y=\"42\">Coyote time</text><text class=\"plat-jump-arc-s\" x=\"344\" y=\"62\">jump allowed ~0.1 s past the edge</text><rect class=\"plat-jump-arc-win\" x=\"440\" y=\"96\" width=\"36\" height=\"114\"/><text class=\"plat-jump-arc-s plat-jump-arc-c\" x=\"458\" y=\"88\">coyote</text><text class=\"plat-jump-arc-s plat-jump-arc-c\" x=\"458\" y=\"112\">0.1 s</text><rect class=\"plat-jump-arc-sol\" x=\"344\" y=\"210\" width=\"96\" height=\"48\"/><rect class=\"plat-jump-arc-sol\" x=\"556\" y=\"210\" width=\"56\" height=\"48\"/><line class=\"plat-jump-arc-mk\" x1=\"468\" y1=\"222\" x2=\"468\" y2=\"262\"/><path class=\"plat-jump-arc-pb\" d=\"M360 204 L440 204 Q452 204 468 214 Q520 86 572 204\"/><text class=\"plat-jump-arc-s plat-jump-arc-e\" x=\"440\" y=\"276\">edge</text><text class=\"plat-jump-arc-s\" x=\"462\" y=\"276\">jump pressed</text><circle class=\"plat-jump-arc-d3\" cx=\"0\" cy=\"0\" r=\"6\"/></svg>"
      },
      {
        "type": "h",
        "text": "Forgiveness: coyote time, buffering, corner correction"
      },
      {
        "type": "p",
        "text": "Humans press jump a few frames early or late, and the game should treat both as correct. **Coyote time**: after the character walks off a ledge, jump stays legal for about 0.1 s (6 ticks). **Jump buffering**: a press up to about 0.1 s before landing is remembered and fires at touchdown. Both are countdown timers, and a jump fires when both are positive. Typical windows sit between 0.05 and 0.15 s: shorter is not felt, longer starts to look like jumping in mid-air."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "coyote = (onGround && vel.y <= 0) ? 0.1f : coyote - dt;   // refill on ground\nbuffer = intent.jumpPressed ? 0.1f : buffer - dt;           // remember a press\n\nif (buffer > 0 && coyote > 0) {\n  vel.y = v0;\n  coyote = buffer = 0;      // consume both, or one press can jump twice\n}"
      },
      {
        "type": "p",
        "text": "**Corner correction** fixes the most irritating failure: jumping straight at a platform and clipping its corner by a pixel. If the head hits a ceiling tile but only the outer 3 or 4 px of the box overlap it, nudge the character sideways by that amount and continue the move instead of stopping. Applied to the feet, the same trick lets a jump land on a ledge's lip. None of these three change what the game looks like. They change which inputs count, and they cost a few lines each."
      },
      {
        "type": "h",
        "text": "The player state machine"
      },
      {
        "type": "list",
        "items": [
          "**Idle and run.** Horizontal speed accelerates toward the stick direction (for example 90 px/s reached in 6 ticks) and slows faster on the ground than in the air. Many teams treat idle and run as one state with an animation switch.",
          "**Jump and fall.** Jump is rising with the release cut; fall is descending with the heavier gravity. Both use reduced air acceleration and read the coyote and buffer timers.",
          "**Wall-slide.** Entered when airborne, falling and pushing into a wall. Fall speed is clamped (about 40 px/s) and a wall jump sets velocity on both axes at once.",
          "**Dash.** A fixed velocity for 0.15 s (for example 320 px/s, so 48 px or 3 tiles), gravity off, input ignored, then back to fall. One charge, restored on the ground."
        ]
      },
      {
        "type": "p",
        "text": "Each state is a small class or function with `Enter`, `Update` and `Exit`. Transitions are checked after the tick's movement from facts collision reported (`onGround`, `wallDir`), never from animation frames. One state at a time means a combination such as dashing while wall-sliding cannot exist by accident."
      },
      {
        "type": "h",
        "text": "The camera"
      },
      {
        "type": "p",
        "text": "The camera is a second small simulation, and each rule answers a specific complaint from playtesters."
      },
      {
        "type": "list",
        "items": [
          "**Dead zone.** A window around the camera centre (here 80 px wide). Focus movement inside it is ignored, so small steps do not shake the screen.",
          "**Look-ahead.** The focus is the player plus about 30 px in the facing direction, so the screen shows more of where the player is heading.",
          "**Vertical snap.** Follow vertically only when grounded, and snap to the current platform's height. Following every jump makes the screen heave at each hop.",
          "**Smoothing.** Move toward the target with exponential decay, `1 - exp(-k * dt)`, with k about 6 to 8. It does not depend on frame rate and cannot overshoot."
        ]
      },
      {
        "type": "figure",
        "id": "plat-camera",
        "caption": "The viewport holds still while the focus diamond is inside the dead zone, then eases after it; turning around flips the look-ahead.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A side view of a ground strip with a camera viewport rectangle and a dashed dead zone inside it. A player circle runs right, then left. A focus diamond leads the player by 30 pixels in the facing direction. The viewport stays still while the focus is inside the dead zone and then eases after it.\"><style>.plat-camera-t{font-size:13px;fill:var(--fig-ink)}.plat-camera-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.plat-camera-s{font-size:12px;fill:var(--fig-muted)}.plat-camera-c{text-anchor:middle}.plat-camera-e{text-anchor:end}.plat-camera-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.plat-camera-gr{fill:var(--fig-ink);fill-opacity:.15;stroke:var(--fig-ink);stroke-width:2}.plat-camera-vp{fill:var(--fig-accent);fill-opacity:.06;stroke:var(--fig-accent);stroke-width:2.5}.plat-camera-dz{fill:var(--fig-accent2);fill-opacity:.18;stroke:var(--fig-accent2);stroke-width:1.5;stroke-dasharray:5 4}.plat-camera-pl{fill:var(--fig-ink);stroke:var(--fig-bg);stroke-width:2}.plat-camera-fc{fill:var(--fig-warn);stroke:var(--fig-bg);stroke-width:1.5}.plat-camera-all{animation:plat-camera-ko 8s linear infinite}.plat-camera-cm{transform:translateX(80px);animation:plat-camera-kc 8s linear infinite}.plat-camera-pp{transform:translateX(170px);animation:plat-camera-kp 8s linear infinite}.plat-camera-ff{transform:translateX(200px);animation:plat-camera-kf 8s linear infinite}@keyframes plat-camera-ko{0%,94%{opacity:1}97%,100%{opacity:0}}@keyframes plat-camera-kc{0%{transform:translateX(80px)}2.5%{transform:translateX(80px)}5%{transform:translateX(80px)}7.5%{transform:translateX(80px)}10%{transform:translateX(80px)}12.5%{transform:translateX(84px)}15%{transform:translateX(98px)}17.5%{transform:translateX(117px)}20%{transform:translateX(136px)}22.5%{transform:translateX(156px)}25%{transform:translateX(176px)}27.5%{transform:translateX(196px)}30%{transform:translateX(216px)}32.5%{transform:translateX(236px)}35%{transform:translateX(256px)}37.5%{transform:translateX(276px)}40%{transform:translateX(296px)}42.5%{transform:translateX(316px)}45%{transform:translateX(332px)}47.5%{transform:translateX(338px)}50%{transform:translateX(339px)}52.5%{transform:translateX(340px)}55%{transform:translateX(340px)}57.5%{transform:translateX(340px)}60%{transform:translateX(336px)}62.5%{transform:translateX(322px)}65%{transform:translateX(303px)}67.5%{transform:translateX(284px)}70%{transform:translateX(264px)}72.5%{transform:translateX(244px)}75%{transform:translateX(224px)}77.5%{transform:translateX(204px)}80%{transform:translateX(184px)}82.5%{transform:translateX(164px)}85%{transform:translateX(144px)}87.5%{transform:translateX(124px)}90%{transform:translateX(114px)}92.5%{transform:translateX(111px)}95%{transform:translateX(110px)}97.5%{transform:translateX(110px)}100%{transform:translateX(110px)}}@keyframes plat-camera-kp{0%{transform:translateX(170px)}2.5%{transform:translateX(170px)}5%{transform:translateX(170px)}7.5%{transform:translateX(182px)}10%{transform:translateX(202px)}12.5%{transform:translateX(222px)}15%{transform:translateX(242px)}17.5%{transform:translateX(262px)}20%{transform:translateX(282px)}22.5%{transform:translateX(302px)}25%{transform:translateX(322px)}27.5%{transform:translateX(342px)}30%{transform:translateX(362px)}32.5%{transform:translateX(382px)}35%{transform:translateX(402px)}37.5%{transform:translateX(422px)}40%{transform:translateX(442px)}42.5%{transform:translateX(462px)}45%{transform:translateX(470px)}47.5%{transform:translateX(470px)}50%{transform:translateX(470px)}52.5%{transform:translateX(470px)}55%{transform:translateX(470px)}57.5%{transform:translateX(458px)}60%{transform:translateX(438px)}62.5%{transform:translateX(418px)}65%{transform:translateX(398px)}67.5%{transform:translateX(378px)}70%{transform:translateX(358px)}72.5%{transform:translateX(338px)}75%{transform:translateX(318px)}77.5%{transform:translateX(298px)}80%{transform:translateX(278px)}82.5%{transform:translateX(258px)}85%{transform:translateX(238px)}87.5%{transform:translateX(220px)}90%{transform:translateX(220px)}92.5%{transform:translateX(220px)}95%{transform:translateX(220px)}97.5%{transform:translateX(220px)}100%{transform:translateX(220px)}}@keyframes plat-camera-kf{0%{transform:translateX(200px)}2.5%{transform:translateX(200px)}5%{transform:translateX(200px)}7.5%{transform:translateX(212px)}10%{transform:translateX(232px)}12.5%{transform:translateX(252px)}15%{transform:translateX(272px)}17.5%{transform:translateX(292px)}20%{transform:translateX(312px)}22.5%{transform:translateX(332px)}25%{transform:translateX(352px)}27.5%{transform:translateX(372px)}30%{transform:translateX(392px)}32.5%{transform:translateX(412px)}35%{transform:translateX(432px)}37.5%{transform:translateX(452px)}40%{transform:translateX(472px)}42.5%{transform:translateX(492px)}45%{transform:translateX(500px)}47.5%{transform:translateX(500px)}50%{transform:translateX(500px)}52.5%{transform:translateX(500px)}55%{transform:translateX(500px)}57.5%{transform:translateX(428px)}60%{transform:translateX(408px)}62.5%{transform:translateX(388px)}65%{transform:translateX(368px)}67.5%{transform:translateX(348px)}70%{transform:translateX(328px)}72.5%{transform:translateX(308px)}75%{transform:translateX(288px)}77.5%{transform:translateX(268px)}80%{transform:translateX(248px)}82.5%{transform:translateX(228px)}85%{transform:translateX(208px)}87.5%{transform:translateX(190px)}90%{transform:translateX(190px)}92.5%{transform:translateX(190px)}95%{transform:translateX(190px)}97.5%{transform:translateX(190px)}100%{transform:translateX(190px)}}</style><text class=\"plat-camera-s\" x=\"24\" y=\"30\">The camera moves only when the focus leaves the dead zone</text><rect class=\"plat-camera-gr\" x=\"16\" y=\"214\" width=\"608\" height=\"24\"/><g class=\"plat-camera-all\"><g class=\"plat-camera-cm\"><rect class=\"plat-camera-vp\" x=\"0\" y=\"56\" width=\"240\" height=\"176\" rx=\"6\"/><rect class=\"plat-camera-dz\" x=\"80\" y=\"100\" width=\"80\" height=\"114\"/></g><circle class=\"plat-camera-pl plat-camera-pp\" cx=\"0\" cy=\"204\" r=\"10\"/><polygon class=\"plat-camera-fc plat-camera-ff\" points=\"0,197 7,204 0,211 -7,204\"/></g><circle class=\"plat-camera-pl\" cx=\"30\" cy=\"276\" r=\"7\"/><text class=\"plat-camera-s\" x=\"44\" y=\"280\">player</text><polygon class=\"plat-camera-fc\" points=\"110,269 117,276 110,283 103,276\"/><text class=\"plat-camera-s\" x=\"124\" y=\"280\">focus: player + 30 px ahead</text><rect class=\"plat-camera-dz\" x=\"322\" y=\"269\" width=\"16\" height=\"14\"/><text class=\"plat-camera-s\" x=\"344\" y=\"280\">dead zone, 80 px</text><rect class=\"plat-camera-vp\" x=\"466\" y=\"269\" width=\"16\" height=\"14\"/><text class=\"plat-camera-s\" x=\"488\" y=\"280\">viewport</text></svg>"
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "Vector2 focus = player.pos + new Vector2(facing * 30f, 0);\nfloat dx = focus.x - cam.x;\nif (Mathf.Abs(dx) > 40f) target.x = focus.x - Mathf.Sign(dx) * 40f;  // dead zone\nif (player.grounded) target.y = player.platformY;                    // vertical snap\ncam = Vector2.Lerp(cam, target, 1f - Mathf.Exp(-6f * dt));           // frame-rate safe"
      },
      {
        "type": "p",
        "text": "Update the camera after the tick, using the same interpolated position the sprite uses, or the camera and sprite jitter against each other. Pixel-art games also round the final camera position to whole pixels of the render target."
      },
      {
        "type": "h",
        "text": "Levels, enemies and input"
      },
      {
        "type": "p",
        "text": "A level is a set of rooms. A room is a tilemap (for example 40 x 22 tiles, which is 640 x 352 px at 16 px per tile and 880 bytes at one byte per tile) plus a list of entities with positions and properties. Tile ids index a tileset: empty, solid, one-way, slope, spike. A **checkpoint** stores a room id and a spawn point. Death reloads the room from authored data instead of patching live state, and respawn should take well under a second, because players will die many times."
      },
      {
        "type": "p",
        "text": "Enemies reuse the player's collision code and run small state machines. A patroller walks at constant speed, turns when the tile ahead of its front foot is empty or the tile in front is solid, pauses in **Idle** for about 0.5 s, then walks again. A chaser adds a **Notice** state when the player enters a radius. Reuse means one collision system to debug, and enemies obey one-way and moving platforms for free. Damage tests are overlaps against hitboxes a few pixels smaller than the sprite, which feels fair."
      },
      {
        "type": "p",
        "text": "Input goes through a rebinding layer and produces one `Intent` per tick: move axis, jump pressed, held and released, dash pressed. Analog sticks get a dead zone of about 0.2. Presses are latched in the frame loop and cleared when a tick consumes them, so a tap that starts and ends between two ticks is not lost."
      },
      {
        "type": "h",
        "text": "Decisions and why they work"
      },
      {
        "type": "list",
        "items": [
          "**Fixed 60 Hz tick with interpolation.** The same jump on every device, and replays and tests are exact. Variable `dt` makes jump heights and gap clearances depend on hardware. The cost is up to one tick of display latency.",
          "**Kinematic controller with your own collision.** Direct control of every velocity. A dynamic rigidbody fights you over mass, friction, bounce and solver steps.",
          "**Per-axis, pixel-stepped tile collision.** Contacts are unambiguous, nothing tunnels at platformer speeds, and it is easy to debug. Swept collision against arbitrary shapes handles any geometry but costs far more code and edge cases.",
          "**Jump derived from height and time.** Designers edit numbers they can see on the level grid. Hand-tuned gravity and impulse values break whenever a gap in the level changes.",
          "**Forgiveness windows.** Coyote time, buffering and corner nudges cost a few lines each and turn near misses into hits. Strict windows read as an unfair game.",
          "**A state machine instead of flags.** Exactly one state at a time. A pile of booleans such as `isJumping` and `isDashing` multiplies impossible combinations.",
          "**Camera as its own smoothed system.** Parenting the camera to the player copies every small step and every hop onto the screen.",
          "**Rooms rebuilt from data on death.** Resets are deterministic. Patching entity state back by hand leaks bugs between attempts."
        ]
      },
      {
        "type": "callout",
        "kind": "warn",
        "text": "Do not drive gameplay from `Time.deltaTime`, and do not read button events inside `FixedUpdate`. Both are works-on-my-machine bugs: jump heights differ between a 60 Hz and a 144 Hz monitor, and presses vanish or repeat when a frame runs zero or two ticks. Latch input in `Update`, consume it in the tick, and test at several frame rates by forcing `Application.targetFrameRate`."
      },
      {
        "type": "callout",
        "kind": "agent",
        "text": "Agents are good at the mechanical parts: the tile array, the per-axis collision pass, state-machine boilerplate, unit tests and a room editor. Give them the numbers (tile size, tick rate, h and t) and ask for pure functions with no engine types, so tests run headless. Verify what they cannot feel. Ask for tests such as 'a held jump with h = 56 peaks within 4 px of it, a tap peaks near 14', 'a 40 px move never ends inside a wall' and 'a press 5 ticks before landing fires, 8 ticks does not'. Then play it yourself. Passing tests do not prove the feel is right, and an agent that 'simplifies' the fixed step into `deltaTime` has broken the game."
      },
      {
        "type": "h",
        "text": "Reading the symptoms"
      },
      {
        "type": "patterns",
        "patterns": [
          {
            "signal": "Testers say a jump pressed just before landing does nothing and the game eats inputs",
            "use": "Add a 0.1 s jump buffer",
            "why": "Remember the press for about 0.1 s and fire the jump on the tick the character lands. Humans mistime by a few frames, and the buffer converts that error into the jump they meant."
          },
          {
            "signal": "Players say they pressed jump at the ledge but fell; the press came a few frames after leaving it",
            "use": "Add 0.1 s of coyote time",
            "why": "Start a timer when the ground is lost without a jump, and allow a jump while it is positive. Clear it on takeoff so one press cannot jump twice."
          },
          {
            "signal": "A jump straight up clips a ceiling or platform corner by 1 to 3 px and the player bonks",
            "use": "Nudge sideways with corner correction",
            "why": "If only the outer few pixels of the box overlap the corner, shift the box sideways and continue the move. It removes a frustrating failure without changing level geometry."
          },
          {
            "signal": "Jump height or gap clearance differs between a 60 Hz and a 144 Hz machine",
            "use": "Run gameplay on a fixed timestep",
            "why": "Variable dt changes integration error and tick-order effects. Simulate in constant 1/60 s ticks and keep rendering separate."
          },
          {
            "signal": "Motion hitches on a 144 Hz display while the 60 Hz simulation is correct",
            "use": "Interpolate between previous and current tick",
            "why": "At 144 fps some frames get no new tick and repeat a position. Drawing Lerp(prev, curr, alpha) fills them in, for up to one tick of extra latency."
          },
          {
            "signal": "A dash or knockback passes through a thin wall at high speed",
            "use": "Step the move in sub-steps of half a tile",
            "why": "Testing only the final position skips geometry thinner than the per-tick displacement. Stepping 1 px, or at most half a tile, and testing after each step cannot skip it."
          },
          {
            "signal": "A designer asks for 'a jump 4 tiles high that peaks in 0.4 s'",
            "use": "Derive g and v0 from height and time",
            "why": "From h = v0 t / 2 and v0 = g t you get g = 2h / t² and v0 = 2h / t. Designers keep editing readable numbers and the physics follows."
          },
          {
            "signal": "The screen shakes with every small step and heaves with every hop",
            "use": "Add a dead zone and grounded-only vertical follow",
            "why": "Ignore focus movement inside a window around the camera and follow vertically only when grounded. The camera then moves for real changes in position, not for noise."
          }
        ]
      }
    ],
    "keyPoints": [
      "Simulate at a fixed 60 Hz and render interpolated between the last two ticks, so jump height never depends on frame rate or display.",
      "A kinematic controller owns velocity and position; collision only stops it. That gives exact, deterministic feel that a dynamic rigidbody fights.",
      "Resolve tile collision one axis at a time and step in sub-steps of at most half a tile: contacts are unambiguous and fast moves cannot tunnel.",
      "Derive jump physics from designer values: g = 2h / t² and v0 = 2h / t. Add a velocity cut on release, heavier fall gravity and a short apex hang.",
      "Coyote time and jump buffering (about 0.1 s each) plus corner correction turn near misses into hits. Consume both timers when the jump fires.",
      "The camera is a smoothed system: dead zone, look-ahead, grounded-only vertical snap and exponential decay with `1 - exp(-k * dt)`."
    ],
    "quiz": [
      {
        "q": "A designer asks for a jump that peaks 48 px high after 0.3 s. Which gravity and launch speed does that give?",
        "options": [
          "g = 533 px/s², v0 = 160 px/s",
          "g = 1067 px/s², v0 = 160 px/s",
          "g = 1067 px/s², v0 = 320 px/s",
          "g = 160 px/s², v0 = 533 px/s"
        ],
        "answer": 2,
        "explain": "From h = (v0 / 2) t and v0 = g t you get g = 2h / t² = 96 / 0.09 = 1067 and v0 = 2h / t = 96 / 0.3 = 320. The first option forgets the factor of 2 in both formulas. The second mixes a correct g with that half-size v0, which would peak at only 12 px. The fourth swaps the two values."
      },
      {
        "q": "Why does the controller move and resolve the X axis completely before it moves on Y?",
        "options": [
          "Each pass is one-dimensional, so the face that was hit is unambiguous",
          "It lets the box skip tiles that it would overlap at high speed",
          "It removes the need for a grounded flag because gravity handles the floor",
          "Tile maps cannot store collision data for diagonal movement at all"
        ],
        "answer": 0,
        "explain": "A single-axis pass needs only a snap to the tile edge and a zero velocity, and the axis tells you what was hit: down is floor, up is ceiling, sideways is wall. It does not prevent tunneling (that needs sub-steps), it does not replace the grounded flag (a downward hit sets it), and tile maps can represent any move; the issue is ambiguity at corners, not storage."
      },
      {
        "q": "The jump code multiplies upward velocity by 0.5 when the button is released. If the player releases on the first tick, how high is the hop compared with a full jump?",
        "options": [
          "About half as high, because the speed is halved",
          "About one eighth as high, because gravity also doubles",
          "No hop at all, because the cut cancels the launch",
          "About a quarter, because height goes with v squared"
        ],
        "answer": 3,
        "explain": "Rise height is v² / 2g. Halving v leaves one quarter of the height, so a 56 px jump becomes about 14 px. Half height would hold only if height were linear in speed. Gravity is unchanged by the cut, so there is no eighth. The character still moves up at half speed, so it does hop."
      },
      {
        "q": "A camera smooths with `cam = Lerp(cam, target, 0.1f)` each frame and trails by different amounts at 30 and 144 fps. What is the fix?",
        "options": [
          "Multiply by Time.deltaTime and clamp the result between 0 and 1",
          "Blend by `1 - Mathf.Exp(-k * dt)` using each frame's dt",
          "Move the camera into FixedUpdate and keep the 0.1 constant",
          "Cap the frame rate at 60 and keep the constant"
        ],
        "answer": 1,
        "explain": "The exponential form removes the same fraction of the remaining distance per second at any frame rate, and it cannot overshoot. Multiplying by deltaTime is only a first-order approximation and misbehaves on long frames. A camera in FixedUpdate jitters against an interpolated sprite. Capping the frame rate hides the bug on one device and leaves it on others."
      },
      {
        "q": "The simulation ticks at 60 Hz and the display runs at 144 Hz. Jump height is right but motion visibly hitches. What is the standard fix?",
        "options": [
          "Raise the tick rate to 144 Hz so every frame gets its own tick",
          "Multiply movement by Time.deltaTime inside the simulation",
          "Draw Lerp(prev, curr, alpha) using the leftover accumulator time",
          "Turn vsync off so frames are not repeated"
        ],
        "answer": 2,
        "explain": "Interpolating between the last two ticks gives every frame a distinct position for about one tick of extra latency, at any refresh rate. Raising the tick rate costs more simulation, changes every timer that counts ticks (coyote, buffer), shifts the tuned feel and still fails at 240 Hz. Variable dt in the simulation is exactly what breaks jump height. Turning vsync off adds tearing and does not change repeated positions."
      },
      {
        "q": "Testers on a patch build say jumps pressed just before landing are ignored. Coyote time already exists. What is the right move?",
        "options": [
          "Raise the coyote window from 0.1 s to 0.3 s so presses count longer",
          "Remember the press for about 0.1 s and fire the jump at landing",
          "Increase jump height so players land later and have more time",
          "Poll the jump button twice per frame to catch fast presses"
        ],
        "answer": 1,
        "explain": "The failure is an early press, which is what jump buffering fixes: store the press and fire when grounded. Coyote time covers late presses after leaving a ledge, so widening it does nothing here and 0.3 s would feel like jumping from air. Higher jumps do not change the timing error, and polling more often cannot recover a press that happened before the character landed."
      }
    ]
  }
];
