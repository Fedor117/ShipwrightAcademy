window.TOPIC_PART = [
  {
    "id": "case-debugging-games",
    "title": "Case study: Debugging a game",
    "minutes": 18,
    "summary": "One investigation from a once-in-three-hours \"fell through the floor\" report to a fix: replayable runs, debug tools, logs and invariants, tunneling, desync bisection, release crashes, frame capture and soak tests.",
    "lesson": [
      {
        "type": "p",
        "text": "A tester writes: 'Fell through the floor in the cargo bay. About three hours into a session, right after a jump pad. Could not do it again.' Over 400 hours of playtests, three people saw it. There is no video and no save file. The player was alive, standing on solid ground one moment, and 40 m below the map the next. This case study follows that report from symptom to fix, then a shorter online desync and a release-build crash. The code is C#-flavoured pseudocode and nothing depends on an engine. The real subject is the set of decisions that make a game possible to debug at all."
      },
      {
        "type": "h",
        "text": "Why games resist debugging"
      },
      {
        "type": "list",
        "items": [
          "**Real time.** A breakpoint stops the clock, so the bug that depends on timing moves or vanishes. Networked peers time out while you stare at one frame.",
          "**Nondeterminism.** Frame time, thread scheduling, input timing, random numbers and iteration order differ on every run. The same build does not do the same thing twice.",
          "**Huge state.** A level holds thousands of entities and gigabytes of memory. Most of the state is irrelevant, and you do not know which part is.",
          "**Seen once.** The bug happens on a tester's machine, in a build you no longer have open, and it comes back as one sentence."
        ]
      },
      {
        "type": "h",
        "text": "Components"
      },
      {
        "type": "list",
        "items": [
          "**Replay recorder** stores the inputs, the seed and the frame times so a run can be played back exactly.",
          "**Bug-report button** bundles the replay, log tail, screenshot, build id and seed into one file.",
          "**Debug draw** shows invisible things in the world: colliders, rays, nav paths and AI state.",
          "**Developer console** teleports, spawns, sets the time of day and changes the time scale.",
          "**Logger** writes categorised, frame-stamped lines into a ring buffer that is dumped on failure.",
          "**Assertions** check invariants every frame in development builds.",
          "**Crash reporter** collects minidumps from release builds and groups them by callstack.",
          "**Automation** runs replays and bot players on a build server and reports pass or fail."
        ]
      },
      {
        "type": "h",
        "text": "Stage 1: the report"
      },
      {
        "type": "p",
        "text": "The one-line report is useless alone. What the team wants is a bug-report button (or a hotkey) that works in every development and playtest build. One press freezes the game for a moment and writes a small bundle. The tester types a sentence and keeps playing. Without the button the team gets prose. With it, the team gets a run."
      },
      {
        "type": "code",
        "lang": "json",
        "text": "{\n  \"build\": \"0.9.4+8123 (dev)\",\n  \"seed\": \"0x5EED1F42\",\n  \"platform\": \"PC, 16 GB, GPU driver 551.23\",\n  \"level\": \"cargo_bay\", \"tick\": 41872,\n  \"replay\": \"cargo_bay.rpl\",\n  \"log_tail\": \"ring.log\",\n  \"screenshot\": \"f41872.png\",\n  \"note\": \"fell through floor after jump pad\"\n}"
      },
      {
        "type": "h",
        "text": "Stage 2: determinism, make a run replayable"
      },
      {
        "type": "p",
        "text": "A replay does not record video. It records the inputs and replays them through the simulation. That works only if the simulation is a pure function of its previous state, its inputs and a seed. Each leak in that purity breaks the replay: reading the wall clock, drawing random numbers from one global generator that rendering also uses, iterating a hash set keyed by pointer, letting a worker thread finish in a different order, or reading anything from the render side. The fixes are mechanical. Run gameplay at a fixed 60 Hz. Give each system its own seeded RNG stream. Iterate in a stable order, such as entity id. Make input the only thing that enters from outside. The recorder starts a new file at each level load, beginning with a state snapshot, and keeps at most the last 15 minutes. The report's tick 41,872 counts from the cargo bay load."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "const float Dt = 1f / 60f;\n\nvoid Frame(float realDt) {\n  acc += Mathf.Min(realDt, 0.1f);\n  int n = 0;\n  while (acc >= Dt && n < 5) {              // cap catch-up at 5 ticks\n    InputFrame f = replaying ? replay.Next() : input.Sample();\n    if (recording) replay.Write(tick, f);   // the only external data\n    Simulate(f, Dt);                        // state + input + seed -> state\n    tick++; acc -= Dt; n++;\n  }\n  if (n == 5 && acc >= Dt) { acc = 0; Log.Cat(\"sim\").Warn(\"dropped catch-up\"); }\n}\n\nvoid Simulate(InputFrame f, float dt) {\n  var rng = streams.Get(System.Ai);         // PCG32: seed + stream id\n  ...\n}"
      },
      {
        "type": "figure",
        "id": "dbg-replay",
        "caption": "A replay is a log of inputs plus a seed. Watch the playhead run from tick 0 and stop at the failing tick, with snapshots to jump to.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A replay pipeline. Recorded inputs feed a deterministic fixed-step simulation, which feeds a debug view. Below, a timeline of 54,000 ticks with a snapshot every 1,800 ticks. A playhead runs from tick 0 and stops at tick 41,872, where the player falls through the floor.\"><style>.dbg-replay-t{font-size:13px;fill:var(--fig-ink)}.dbg-replay-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.dbg-replay-s{font-size:12px;fill:var(--fig-muted)}.dbg-replay-c{text-anchor:middle}.dbg-replay-e{text-anchor:end}.dbg-replay-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.dbg-replay-ar{stroke:var(--fig-muted);stroke-width:2;fill:none}.dbg-replay-ah{fill:var(--fig-muted)}.dbg-replay-pk{fill:var(--fig-accent);animation:dbg-replay-kp 4s linear infinite}.dbg-replay-tl{stroke:var(--fig-line);stroke-width:3}.dbg-replay-sn{stroke:var(--fig-line);stroke-width:1.5}.dbg-replay-pr{stroke:var(--fig-accent);stroke-width:3;stroke-dasharray:459;stroke-dashoffset:0;animation:dbg-replay-kd 8s linear infinite}.dbg-replay-mk{stroke:var(--fig-bad);stroke-width:2}.dbg-replay-mt{fill:var(--fig-bad);font-size:12px}.dbg-replay-ph{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:1.5;animation:dbg-replay-kh 8s linear infinite}@keyframes dbg-replay-kp{0%{transform:translateX(-16px);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(16px);opacity:0}}@keyframes dbg-replay-kd{0%{stroke-dashoffset:459}75%,100%{stroke-dashoffset:0}}@keyframes dbg-replay-kh{0%{transform:translateX(-459px)}75%,100%{transform:translateX(0)}}</style><text class=\"dbg-replay-s\" x=\"24\" y=\"26\">Same inputs + same seed + fixed step = the same run, every time</text><rect class=\"dbg-replay-b\" x=\"24\" y=\"44\" width=\"170\" height=\"68\" rx=\"10\"/><text class=\"dbg-replay-h dbg-replay-c\" x=\"109\" y=\"68\">Recorded inputs</text><text class=\"dbg-replay-s dbg-replay-c\" x=\"109\" y=\"88\">tick, stick, buttons</text><text class=\"dbg-replay-s dbg-replay-c\" x=\"109\" y=\"104\">8 bytes per tick</text><line class=\"dbg-replay-ar\" x1=\"194\" y1=\"78\" x2=\"229\" y2=\"78\"/><polygon class=\"dbg-replay-ah\" points=\"235,78 227,73 227,83\"/><circle class=\"dbg-replay-pk\" cx=\"214.5\" cy=\"78\" r=\"4\"/><rect class=\"dbg-replay-b\" x=\"235\" y=\"44\" width=\"170\" height=\"68\" rx=\"10\"/><text class=\"dbg-replay-h dbg-replay-c\" x=\"320\" y=\"68\">Deterministic sim</text><text class=\"dbg-replay-s dbg-replay-c\" x=\"320\" y=\"88\">60 Hz fixed step</text><text class=\"dbg-replay-s dbg-replay-c\" x=\"320\" y=\"104\">seed 0x5EED1F42</text><line class=\"dbg-replay-ar\" x1=\"405\" y1=\"78\" x2=\"440\" y2=\"78\"/><polygon class=\"dbg-replay-ah\" points=\"446,78 438,73 438,83\"/><circle class=\"dbg-replay-pk\" cx=\"425.5\" cy=\"78\" r=\"4\"/><rect class=\"dbg-replay-b\" x=\"446\" y=\"44\" width=\"170\" height=\"68\" rx=\"10\"/><text class=\"dbg-replay-h dbg-replay-c\" x=\"531\" y=\"68\">Debug view</text><text class=\"dbg-replay-s dbg-replay-c\" x=\"531\" y=\"88\">draw, console, step</text><text class=\"dbg-replay-s dbg-replay-c\" x=\"531\" y=\"104\">stop at any tick</text><text class=\"dbg-replay-t\" x=\"24\" y=\"152\">Replay since level load, capped at 15 min = 54,000 ticks</text><path class=\"dbg-replay-sn\" d=\"M24.0 183V197M43.7 183V197M63.5 183V197M83.2 183V197M102.9 183V197M122.7 183V197M142.4 183V197M162.1 183V197M181.9 183V197M201.6 183V197M221.3 183V197M241.1 183V197M260.8 183V197M280.5 183V197M300.3 183V197M320.0 183V197M339.7 183V197M359.5 183V197M379.2 183V197M398.9 183V197M418.7 183V197M438.4 183V197M458.1 183V197M477.9 183V197M497.6 183V197M517.3 183V197M537.1 183V197M556.8 183V197M576.5 183V197M596.3 183V197M616.0 183V197\"/><line class=\"dbg-replay-tl\" x1=\"24\" y1=\"190\" x2=\"616\" y2=\"190\"/><line class=\"dbg-replay-pr\" x1=\"24\" y1=\"190\" x2=\"483\" y2=\"190\"/><line class=\"dbg-replay-mk\" x1=\"483\" y1=\"172\" x2=\"483\" y2=\"208\"/><text class=\"dbg-replay-mt dbg-replay-e\" x=\"475\" y=\"170\">tick 41,872: player below floor</text><polygon class=\"dbg-replay-ph\" points=\"483,200 476,214 490,214\"/><text class=\"dbg-replay-s\" x=\"24\" y=\"230\">tick 0</text><text class=\"dbg-replay-s dbg-replay-e\" x=\"616\" y=\"230\">tick 54,000</text><text class=\"dbg-replay-s\" x=\"24\" y=\"258\">Small ticks: a state snapshot every 1,800 ticks (30 s). Seeking = load one, re-simulate.</text><text class=\"dbg-replay-s\" x=\"24\" y=\"278\">The bug report adds: build id, seed, log tail, screenshot.</text></svg>"
      },
      {
        "type": "p",
        "text": "Size is small. At 8 bytes per tick, 15 minutes is 54,000 ticks and about 430 KB raw. Storing only the ticks where an input changes brings that well under 100 KB. Add a full state snapshot every 30 s (1,800 ticks) and seeking is cheap: load the nearest snapshot, then re-simulate at most 1,800 ticks headless, which takes well under a second. The build that produced the report was not fully fixed-step: its physics world took the whole frame time, clamped at 0.1 s. That was the bug, and a variable step is replayable only if you also record the frame time of every frame. The replay did, so the bug came back exactly. The replay from the report was loaded in the editor and run to tick 41,872. The player fell on the first try, and again on the second and the hundredth. Reproduction went from 0 in 300 manual attempts to 100 percent, which changes the work completely: the bug is now a deterministic test, and every experiment (add a log, change a value, rerun) is a rerun of the same 11 minutes and 38 seconds."
      },
      {
        "type": "h",
        "text": "Stage 3: look. Debug draw, console and time control"
      },
      {
        "type": "p",
        "text": "**Debug draw** puts invisible data into the world: collider shapes, raycasts, contact points and normals, navigation paths, AI state labels, velocity vectors. Calls take a duration in ticks, so a ray drawn on tick 100 stays visible on tick 101. Draw calls are compiled out of shipping builds or cost nothing when off. The **console** gives designers and testers direct control: teleport to a place, spawn an actor, set the time of day, set a seed, switch a system's debug view. A tester who can type `tp cargo_bay_lift` reaches a bug in seconds."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "Debug.Capsule(p.pos, 0.3f, 1.8f, Color.green);\nDebug.Line(p.pos, p.pos + p.vel * Dt, Color.red, ticks: 60);\nDebug.Text(p.pos, $\"vy {p.vel.y:F1} {p.state}\");\n\nConsole.Register(\"tp\",        (x, y, z) => player.Teleport(x, y, z));\nConsole.Register(\"spawn\",     (name, n) => world.Spawn(name, n));\nConsole.Register(\"timescale\", s => Sim.TimeScale = s);\nConsole.Register(\"step\",      n => Sim.StepTicks(n));  // while paused\nConsole.Register(\"seed\",      s => Rng.Reseed(s));"
      },
      {
        "type": "p",
        "text": "**Time control** is the debugger for real-time systems. Slow motion (time scale 0.1) stretches a one-tick glitch over ten rendered frames. Pause plus single-step moves the sim one tick per key press. Freeze-frame stops the simulation but keeps the free camera and debug draw alive, so you can fly around a frozen scene and inspect it from any angle. In the replay, the team paused at tick 41,860 and stepped forward. The capsule collider hung above the floor slab, then in the next drawn frame the capsule was 2.2 m lower, already under the slab, with no contact point drawn."
      },
      {
        "type": "h",
        "text": "Stage 4: logs and assertions"
      },
      {
        "type": "p",
        "text": "Logging every frame to a file is slow and unreadable. The structure that works: **categories** (physics, ai, net, audio) with levels, so you can turn one system up; a **frame number and time stamp** on every line, so lines from different systems line up; and a **ring buffer** in memory (for example the last 8,192 lines, about 1 MB) written without allocation or file I/O. The buffer is dumped when an assertion fires, when the player presses the report button, or when the process crashes. Verbose detail is free until the moment it matters."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "Log.Cat(\"phys\").Warn(\"step dt={0:F3} clamp hit\", dt);\n// [f41869 t697.82 phys WARN] step dt=0.100 clamp hit\n// [f41869 t697.82 player INFO] vy=-22.0 y=0.90 state=Falling\n// [f41870 t697.92 ASSERT] player below floor: y=-1.30\n\nvoid CheckInvariants() {\n#if DEV_BUILD\n  Assert(IsFinite(p.pos), \"player position is NaN\");\n  Assert(p.pos.y > level.FloorUnder(p.pos) - 0.5f, \"player below floor\");\n  Assert(Abs(p.vel.y) < MaxFall + 1f, \"speed over cap\");\n  Assert(world.entities.Count <= 4096, \"entity count\");\n#endif\n}"
      },
      {
        "type": "p",
        "text": "An **invariant** is something that must always be true. Checked every frame in development builds, invariants turn a symptom seen three minutes later into a failure on the exact tick it starts. Here the assertion fired at tick 41,870, and the log tail above it already told the story: a physics step with `dt=0.100` just before. A frame of 118 ms is a normal streaming hitch. The engine clamped the physics step to 0.1 s and ran one big step."
      },
      {
        "type": "h",
        "text": "Root cause: tunneling"
      },
      {
        "type": "p",
        "text": "At the moment of the fall the player was descending at 22 m/s after a jump pad. In one normal tick that is 22 / 60 = 0.37 m. In the single 0.1 s step it was 2.2 m. The cargo bay floor is a 0.1 m thick box, and the player's capsule is 1.8 m tall. A discrete test asks only 'do the shapes overlap at the end of the step?' Falling straight down, the capsule overlaps the slab only during 0.1 + 1.8 = 1.9 m of its travel. A 0.37 m step cannot jump over a 1.9 m window. A 2.2 m step can, whenever its start lies in the last 0.3 m before the window, so the end position overlapped nothing and the capsule kept falling."
      },
      {
        "type": "figure",
        "id": "dbg-tunnel",
        "caption": "Discrete tests look only at where each step ends. A step longer than the floor plus the shape skips it. A sweep finds the first contact along the whole path.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Two panels, not to scale. Left: a falling capsule is tested only at the end of each step; the step is longer than the floor is thick, so it lands below the floor with no overlap and falls through. Right: the whole path of the step is swept, the floor is hit and the capsule stops on top of it.\"><style>.dbg-tunnel-t{font-size:13px;fill:var(--fig-ink)}.dbg-tunnel-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.dbg-tunnel-s{font-size:12px;fill:var(--fig-muted)}.dbg-tunnel-c{text-anchor:middle}.dbg-tunnel-e{text-anchor:end}.dbg-tunnel-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.dbg-tunnel-fl{fill:var(--fig-ink);fill-opacity:.3;stroke:var(--fig-ink);stroke-width:1.5}.dbg-tunnel-gh{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:3 3}.dbg-tunnel-lv{fill:var(--fig-bad);stroke:var(--fig-bg);stroke-width:2;animation:dbg-tunnel-ka 8s linear infinite}.dbg-tunnel-ls{fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2;animation:dbg-tunnel-kb 8s linear infinite}.dbg-tunnel-dl{stroke:var(--fig-warn);stroke-width:2;stroke-dasharray:4 3}.dbg-tunnel-sw{stroke:var(--fig-ok);stroke-width:5;stroke-opacity:.35;stroke-linecap:round}@keyframes dbg-tunnel-ka{0%,22%{transform:translateY(-168px);opacity:1}25%,47%{transform:translateY(-112px)}50%,72%{transform:translateY(-56px)}75%,92%{transform:translateY(0);opacity:1}96%,100%{transform:translateY(0);opacity:0}}@keyframes dbg-tunnel-kb{0%{transform:translateY(-72px);opacity:1}45%,92%{transform:translateY(0);opacity:1}96%,100%{transform:translateY(0);opacity:0}}</style><rect class=\"dbg-tunnel-b\" x=\"16\" y=\"16\" width=\"296\" height=\"268\" rx=\"14\"/><rect class=\"dbg-tunnel-b\" x=\"328\" y=\"16\" width=\"296\" height=\"268\" rx=\"14\"/><text class=\"dbg-tunnel-h\" x=\"32\" y=\"42\">Discrete: test step ends</text><text class=\"dbg-tunnel-s\" x=\"32\" y=\"60\">hitch frame: 22 m/s x 0.1 s = 2.2 m</text><text class=\"dbg-tunnel-h\" x=\"344\" y=\"42\">Swept: test the whole path</text><text class=\"dbg-tunnel-s\" x=\"344\" y=\"60\">same step, time of impact found</text><rect class=\"dbg-tunnel-fl\" x=\"44\" y=\"176\" width=\"240\" height=\"6\"/><rect class=\"dbg-tunnel-fl\" x=\"356\" y=\"176\" width=\"240\" height=\"6\"/><text class=\"dbg-tunnel-s\" x=\"48\" y=\"168\">floor 0.1 m</text><circle class=\"dbg-tunnel-gh\" cx=\"164\" cy=\"96\" r=\"8\"/><circle class=\"dbg-tunnel-gh\" cx=\"164\" cy=\"152\" r=\"8\"/><circle class=\"dbg-tunnel-gh\" cx=\"164\" cy=\"208\" r=\"8\"/><circle class=\"dbg-tunnel-gh\" cx=\"164\" cy=\"264\" r=\"8\"/><circle class=\"dbg-tunnel-gh\" cx=\"476\" cy=\"96\" r=\"8\"/><circle class=\"dbg-tunnel-gh\" cx=\"476\" cy=\"152\" r=\"8\"/><line class=\"dbg-tunnel-dl\" x1=\"164\" y1=\"160\" x2=\"164\" y2=\"200\"/><text class=\"dbg-tunnel-s dbg-tunnel-e\" x=\"152\" y=\"196\">2.2 m step</text><text class=\"dbg-tunnel-s\" x=\"182\" y=\"156\">no overlap</text><text class=\"dbg-tunnel-s\" x=\"182\" y=\"212\">no overlap</text><text class=\"dbg-tunnel-s\" x=\"182\" y=\"268\">fell through</text><line class=\"dbg-tunnel-sw\" x1=\"476\" y1=\"152\" x2=\"476\" y2=\"168\"/><text class=\"dbg-tunnel-s\" x=\"494\" y=\"156\">sweep starts</text><text class=\"dbg-tunnel-s\" x=\"494\" y=\"198\">hit: stop on top</text><circle class=\"dbg-tunnel-ls\" cx=\"476\" cy=\"168\" r=\"8\"/><circle class=\"dbg-tunnel-lv\" cx=\"164\" cy=\"264\" r=\"8\"/></svg>"
      },
      {
        "type": "p",
        "text": "Why only once in a few hours? Three conditions had to line up, and then only about one try in seven (0.3 m of a 2.2 m step) skips the window. The hitch (about one every few minutes), a fast fall (only jump pads reach 22 m/s), and a thin floor (every other floor in the level was a slab 1 m thick, where deep penetration is pushed out upward). Each is common. All three together happen rarely, and testers could never combine them on demand. There is a second effect inside this class of bug. If a step ends partly inside a thin collider, **penetration resolution** pushes the shape out along the shortest way. Past the middle of the slab the shortest way is down, so the capsule is ejected through the bottom. The same thing happens at the seam of two boxes, where the edge contacts point sideways instead of up."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "// 1. Fixed step: a 118 ms hitch is clamped to 100 ms: 6 ticks wanted, 5 run.\n//    A tick never exceeds 16.7 ms, so a 22 m/s fall moves 0.37 m.\n\n// 2. Sweep the capsule instead of testing where it ends up.\nHit hit;\nVector3 move = p.vel * Dt;\nif (world.CapsuleSweep(p.capsule, move, out hit)) {\n  p.pos += move * hit.fraction;           // stop at time of impact\n  p.vel = Slide(p.vel, hit.normal);       // keep the tangent part\n} else {\n  p.pos += move;\n}"
      },
      {
        "type": "p",
        "text": "**Continuous collision detection** is the engine-side name for the sweep, and most engines can turn it on per body. It costs more per body, so it is used for fast and important shapes: the player, projectiles and vehicles. Further layers in the fix: a level validator that rejects colliders thinner than 0.25 m and finds gaps between touching boxes (it found 14 thin floors and the 1 mm seam in the cargo bay), and the dev-build invariant above. A safety net that teleports a fallen player back to the last good position is a good idea for the shipped game, as long as it also logs loudly. The replay becomes the regression test. The build server loads the recorded file, runs it headless at 20x speed, and asserts that the player stands on the cargo bay floor at tick 41,872 and is above `level.minY` at the end of the file. The fix changes the step, so the file no longer replays bit for bit; that is why the test checks an invariant and not a state hash. A second, scripted test forces a 118 ms hitch during a jump-pad fall onto the thin floor. Both fail on the old build and pass on the fixed one. It will fail if someone later removes the sweep, even if nobody remembers why it is there. A bug report turned into a test is how a game stops reintroducing its own old bugs."
      },
      {
        "type": "h",
        "text": "Threads and jobs"
      },
      {
        "type": "p",
        "text": "Moving work onto a job system or worker threads adds a class of bugs that logs make worse. A **data race** is two threads touching the same memory with at least one writing and no ordering between them. The symptoms are state that is corrupted rarely, results that differ between runs, a bug that appears only in release builds, and one that vanishes when you add a log line, because the log changes the timing. The tools are ThreadSanitizer (compiler instrumentation that reports the two conflicting accesses and their stacks), and the engine's own job safety checks in development builds, which throw when two jobs declare conflicting access to the same array. The design rules prevent most of it: one writer per piece of data per phase, read-only inputs to parallel jobs, and double-buffered results. Floating-point sums are also not associative, so reduce parallel results in a fixed order or the replay will drift."
      },
      {
        "type": "h",
        "text": "Second investigation: an online desync"
      },
      {
        "type": "p",
        "text": "Four players in a lockstep match report that after about two minutes their scores differ and units stand in different places. In lockstep each client simulates the whole world from the same inputs, so the clients must stay bit-identical. The tool is a **state checksum**: every tick, hash the simulation state (entity ids, quantised positions, health, RNG state) and compare across clients. Production builds exchange it once per second. Development builds compute it every tick and every system separately. Once hashes differ, they stay different, so the first bad frame can be found by bisection."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "uint Checksum(World w) {\n  uint h = 0;\n  foreach (var e in w.entities.OrderBy(e => e.id))   // stable order\n    h = Crc32.Add(h, e.id, Quantize(e.pos), e.health);\n  return Crc32.Add(h, w.rng.State);\n}\n// dev builds: one hash per system per tick\n// sums[Sys.Physics], sums[Sys.Ai], sums[Sys.Rng], sums[Sys.Economy]"
      },
      {
        "type": "figure",
        "id": "dbg-bisect",
        "caption": "Each probe halves the unknown range. Two minutes of play is 7,200 frames, and 13 probes find the first frame where the clients differ.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 340\" role=\"img\" aria-label=\"A checksum bisection over 7,200 frames, two minutes at 60 Hz. Each row is one probe of the state hash on two clients. The unknown range halves each time: matches at 3,600 and 5,400, differences at 6,300 and 5,850, a match at 5,625, and after eight more probes the first differing frame is 5,812.\"><style>.dbg-bisect-t{font-size:13px;fill:var(--fig-ink)}.dbg-bisect-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.dbg-bisect-s{font-size:12px;fill:var(--fig-muted)}.dbg-bisect-c{text-anchor:middle}.dbg-bisect-e{text-anchor:end}.dbg-bisect-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.dbg-bisect-ok{fill:var(--fig-ok);fill-opacity:.4}.dbg-bisect-bd{fill:var(--fig-bad);fill-opacity:.4}.dbg-bisect-un{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.dbg-bisect-pb{fill:var(--fig-warn);stroke:var(--fig-bg);stroke-width:1.5}.dbg-bisect-r0{animation:dbg-bisect-kr 9s linear infinite;animation-delay:0s;animation-fill-mode:backwards}.dbg-bisect-r1{animation:dbg-bisect-kr 9s linear infinite;animation-delay:1s;animation-fill-mode:backwards}.dbg-bisect-r2{animation:dbg-bisect-kr 9s linear infinite;animation-delay:2s;animation-fill-mode:backwards}.dbg-bisect-r3{animation:dbg-bisect-kr 9s linear infinite;animation-delay:3s;animation-fill-mode:backwards}.dbg-bisect-r4{animation:dbg-bisect-kr 9s linear infinite;animation-delay:4s;animation-fill-mode:backwards}.dbg-bisect-r5{animation:dbg-bisect-kr 9s linear infinite;animation-delay:5s;animation-fill-mode:backwards}@keyframes dbg-bisect-kr{0%{opacity:.25}8%,88%{opacity:1}96%,100%{opacity:.25}}</style><text class=\"dbg-bisect-s\" x=\"40\" y=\"26\">Frames 0 to 7,200 (2 min at 60 Hz). Probe = compare the state hash of client A and B.</text><g class=\"dbg-bisect-r0\"><text class=\"dbg-bisect-t\" x=\"40\" y=\"54\">probe 3,600: match</text><rect class=\"dbg-bisect-un\" x=\"40\" y=\"60\" width=\"560\" height=\"14\"/><polygon class=\"dbg-bisect-pb\" points=\"320.0,57 326.0,67 320.0,77 314.0,67\"/></g><g class=\"dbg-bisect-r1\"><text class=\"dbg-bisect-t\" x=\"40\" y=\"96\">probe 5,400: match</text><rect class=\"dbg-bisect-un\" x=\"40\" y=\"102\" width=\"560\" height=\"14\"/><rect class=\"dbg-bisect-ok\" x=\"40\" y=\"102\" width=\"280.0\" height=\"14\"/><polygon class=\"dbg-bisect-pb\" points=\"460.0,99 466.0,109 460.0,119 454.0,109\"/></g><g class=\"dbg-bisect-r2\"><text class=\"dbg-bisect-t\" x=\"40\" y=\"138\">probe 6,300: differ</text><rect class=\"dbg-bisect-un\" x=\"40\" y=\"144\" width=\"560\" height=\"14\"/><rect class=\"dbg-bisect-ok\" x=\"40\" y=\"144\" width=\"420.0\" height=\"14\"/><polygon class=\"dbg-bisect-pb\" points=\"530.0,141 536.0,151 530.0,161 524.0,151\"/></g><g class=\"dbg-bisect-r3\"><text class=\"dbg-bisect-t\" x=\"40\" y=\"180\">probe 5,850: differ</text><rect class=\"dbg-bisect-un\" x=\"40\" y=\"186\" width=\"560\" height=\"14\"/><rect class=\"dbg-bisect-ok\" x=\"40\" y=\"186\" width=\"420.0\" height=\"14\"/><rect class=\"dbg-bisect-bd\" x=\"530.0\" y=\"186\" width=\"70.0\" height=\"14\"/><polygon class=\"dbg-bisect-pb\" points=\"495.0,183 501.0,193 495.0,203 489.0,193\"/></g><g class=\"dbg-bisect-r4\"><text class=\"dbg-bisect-t\" x=\"40\" y=\"222\">probe 5,625: match</text><rect class=\"dbg-bisect-un\" x=\"40\" y=\"228\" width=\"560\" height=\"14\"/><rect class=\"dbg-bisect-ok\" x=\"40\" y=\"228\" width=\"420.0\" height=\"14\"/><rect class=\"dbg-bisect-bd\" x=\"495.0\" y=\"228\" width=\"105.0\" height=\"14\"/><polygon class=\"dbg-bisect-pb\" points=\"477.5,225 483.5,235 477.5,245 471.5,235\"/></g><g class=\"dbg-bisect-r5\"><text class=\"dbg-bisect-t\" x=\"40\" y=\"264\">8 more probes: first bad frame is 5,812</text><rect class=\"dbg-bisect-un\" x=\"40\" y=\"270\" width=\"560\" height=\"14\"/><rect class=\"dbg-bisect-ok\" x=\"40\" y=\"270\" width=\"452.0\" height=\"14\"/><rect class=\"dbg-bisect-bd\" x=\"492.0\" y=\"270\" width=\"108.0\" height=\"14\"/><polygon class=\"dbg-bisect-pb\" points=\"492.0,267 498.0,277 492.0,287 486.0,277\"/></g><text class=\"dbg-bisect-h\" x=\"40\" y=\"308\">13 probes, not 7,200. At 5,812: physics hash matches, AI differs.</text><rect class=\"dbg-bisect-ok\" x=\"40\" y=\"322\" width=\"14\" height=\"10\"/><text class=\"dbg-bisect-s\" x=\"60\" y=\"331\">match</text><rect class=\"dbg-bisect-un\" x=\"120\" y=\"322\" width=\"14\" height=\"10\"/><text class=\"dbg-bisect-s\" x=\"140\" y=\"331\">unknown</text><rect class=\"dbg-bisect-bd\" x=\"220\" y=\"322\" width=\"14\" height=\"10\"/><text class=\"dbg-bisect-s\" x=\"240\" y=\"331\">differ</text></svg>"
      },
      {
        "type": "p",
        "text": "With both clients' replays, each probe is a fast-forward to a tick and a hash. Thirteen probes find frame 5,812, since 2^13 = 8,192 is above 7,200. At that frame the per-system hashes narrow it further: physics, RNG and economy match, AI differs. A diff of the AI entities finds unit 213 choosing a different target. The AI picked from a hash set of unit pointers, so its iteration order depended on memory addresses, which differ per machine, and it ran a cheaper update for units far from the local camera, which is local data. The fix is to iterate by entity id and to base update rates on simulation state only. Across platforms, add one more suspect: float results can differ between CPU architectures (fused multiply-add, different math libraries), so cross-play lockstep needs fixed-point maths or strict compiler settings."
      },
      {
        "type": "h",
        "text": "Third case: a crash in a release build"
      },
      {
        "type": "p",
        "text": "Crashes in the shipped game arrive from players, with no debugger. The crash reporter writes a **minidump**: a few hundred KB holding each thread's stack, the registers and the list of loaded modules. A raw dump shows only addresses. **Symbolication** maps them to function and line using the symbol files (PDB on Windows, dSYM on Apple platforms, debug `.so` files on Android) that match that exact build's id. The build pipeline must upload them for every shipped build to a symbol server, because nobody can rebuild identical symbols later. A service such as Sentry, Backtrace or Firebase Crashlytics then groups reports into **buckets** by normalised callstack. A day with 6,000 crash reports might be 31 buckets, and one bucket holding 60 percent of them is the fix to make first."
      },
      {
        "type": "p",
        "text": "Release-only crashes have causes that development builds hide. Optimisation inlines and reorders code. Debug builds fill fresh memory with a known pattern (such as 0xCD) or zeros, so a read of uninitialised memory gives the same value on every run there, and leftover garbage in release. Struct padding, memory ordering on ARM compared with x86, and one phone's GPU driver all differ per platform. Reproduce with the release configuration, add AddressSanitizer or UBSan builds in CI, and keep the crash buckets labelled by device model and OS version so a bug that exists on one chip stands out."
      },
      {
        "type": "h",
        "text": "Graphics: capture a frame"
      },
      {
        "type": "p",
        "text": "A crate that is invisible on one GPU is not a gameplay bug if the object exists in the simulation. Capture one frame with RenderDoc (Vulkan, D3D11, D3D12, OpenGL), PIX (D3D12 and Xbox) or Xcode's GPU capture (Metal). Then read the frame like a log: is there a draw call for the crate in the event list? Is the vertex output sane in the mesh viewer, or all NaN? Does the pixel history show the fragment rejected by the depth test, the stencil, the scissor or a blend state? Each answer points at a different system: culling, skinning, sorting or shader state. Capture the failing frame from a replay, and the same frame is available again tomorrow."
      },
      {
        "type": "h",
        "text": "Regressions: bisect over builds"
      },
      {
        "type": "p",
        "text": "'It worked in 0.9.2 and it is broken in 0.9.7' is the best case, because bisection finds the first bad build in log2(n) probes: 6 for 40 builds. It needs a pass or fail that a machine can decide. A replay with a gameplay invariant (for example 'at least two units reach flank positions within 90 s') is exactly that. Run it over cached CI artifacts instead of rebuilding when you can, and skip builds that do not compile."
      },
      {
        "type": "code",
        "lang": "bash",
        "text": "git bisect start 0.9.7 0.9.2      # bad first, then good\ngit bisect run ./ci/replay_test.sh flank.rpl\n\n# replay_test.sh:\n#   fetch cached build or build it   (cannot build -> exit 125 = skip)\n#   run the replay headless at 20x\n#   exit 0 = invariant holds (good), exit 1 = fails (bad)"
      },
      {
        "type": "h",
        "text": "Soak tests and bots"
      },
      {
        "type": "p",
        "text": "Some bugs need hours: a leak of 140 MB per hour passes a 3-minute smoke test and kills a device with a 3 GB budget and a 1.1 GB baseline after about 13 hours. A **bot player** drives the game through the same input interface the replay uses, so it can run headless on a build server at 10x to 30x time scale. A **soak test** runs bots for the equivalent of a day and asserts on slopes, not on crashes: memory in MB per hour, entity count, p99 frame time, number of assertion failures. Random input (a monkey) finds the unexpected. Scripted bots cover the critical path. Every bot session records a replay, so any failure arrives with its own reproduction."
      },
      {
        "type": "h",
        "text": "Decisions and why they work"
      },
      {
        "type": "list",
        "items": [
          "**Record inputs and frame times in every dev and playtest build.** A bug seen once becomes a bug seen on demand. The alternative is asking testers to remember: it costs days per bug and finds few of them.",
          "**Fixed 60 Hz simulation with a catch-up cap.** Deterministic, no giant steps after a hitch, and a bounded cost per frame. A variable step needs every dt recorded and lets physics tunnel on a hitch.",
          "**Per-system RNG streams and stable iteration.** A new random call in one system cannot shift another system's numbers. Global RNG and pointer-keyed sets make every replay and every lockstep match fragile.",
          "**Debug draw and a console from the first week.** They cost a day to build and are used daily. Built late, they are built under pressure and for one bug.",
          "**Time scale, pause and frame step.** The simulation becomes inspectable. A breakpoint stops the whole process and the bug with it.",
          "**A ring buffer of categorised, frame-stamped logs.** Detail without cost and a timeline you can line up across systems. Always-on verbose logging costs frame time and buries the signal.",
          "**Invariants asserted every frame in dev builds.** Failures show up at their origin. Release builds skip them, so make the checks cheap and keep a logged safety net for shipping.",
          "**Sweeps for fast and important shapes.** Correct for any speed. The cost is a more expensive query, so limit it to the player, projectiles and vehicles.",
          "**Checksums by system, bisected.** A desync becomes a search with a known answer, at about 4 bytes per tick per system. Eyeballing two clients' screens never terminates.",
          "**Symbols stored per build id and crashes bucketed by callstack.** The team fixes the biggest bucket first. Without symbols, a crash dump is a list of numbers.",
          "**Replays as automated tests and bot soak runs.** Every fixed bug stays fixed, and slow degradation is caught overnight. Manual regression passes miss both."
        ]
      },
      {
        "type": "callout",
        "kind": "warn",
        "text": "Do not fix a rare bug where it surfaced. A rule such as 'if y < -100, teleport the player up' stops the report and leaves the cause alone: the same step still tunnels projectiles, enemies and thrown crates. Keep the safety net, but make it log an error and fail the dev build, so it points at the cause instead of hiding it. The second trap: shipping the console, cheats and replay upload enabled. Gate them behind a development flag, since they are also an exploit surface and a privacy question (a replay holds a player's inputs)."
      },
      {
        "type": "callout",
        "kind": "agent",
        "text": "Give an agent artifacts it can read: the replay, the log tail, checksum logs, a crash bucket with its symbolicated stack. Good tasks: write the replay recorder and test harness, a script that diffs two checksum logs and prints the first differing frame and system, a bisect script, a level validator for thin colliders, and a first pass at grouping crash buckets. Ask for hypotheses ranked by evidence before any fix, and require a failing replay test first, then the same test passing. Verify what it cannot see. Agents like to 'fix' by adding a clamp, a try-catch, a sleep or a loosened assertion, and by seeding the RNG with a constant in the test only. Each of those hides the bug. Check that the fix touches the cause, that the test fails without it, and that determinism still holds with the change in place."
      },
      {
        "type": "h",
        "text": "Reading the symptoms"
      },
      {
        "type": "patterns",
        "patterns": [
          {
            "signal": "A tester saw a bug once and 300 manual attempts do not reproduce it",
            "use": "Add replay capture to the bug report",
            "why": "Record inputs, seed and frame times from the first minute, and attach the last 15 minutes, the log tail, build id and screenshot to every report. A deterministic replay turns 'once' into 'every time'."
          },
          {
            "signal": "Two online clients drift apart: scores or positions differ after a few minutes",
            "use": "Bisect per-frame checksums to the first frame",
            "why": "Hash the sim state every frame, split by system. Bisect to the first frame where the hashes differ, then diff that system's entities. Everything after that frame is a symptom."
          },
          {
            "signal": "An object is missing or wrong on one GPU or platform while the game state is correct",
            "use": "Capture the frame in RenderDoc or PIX",
            "why": "The simulation is fine, so the fault is in the render pipeline. Walk the event list: is the draw issued, is the vertex output sane, does depth, stencil or blend state reject it?"
          },
          {
            "signal": "Release crash reports show hex addresses instead of function names",
            "use": "Upload symbols per build id and symbolicate",
            "why": "Keep the symbol files of every shipped build, indexed by build id, on a symbol server. The crash service then names the functions and buckets reports by callstack."
          },
          {
            "signal": "Fast objects end up behind thin geometry, but only on frame hitches or at high speed",
            "use": "Use swept collision and cap the physics step",
            "why": "Discrete tests miss geometry thinner than the move per step. Run fixed ticks with a catch-up cap and sweep the shape along its move, so the time of impact is found."
          },
          {
            "signal": "It worked in build 0.9.2, it is broken in 0.9.7, and 40 builds sit in between",
            "use": "git bisect with an automated replay as the test",
            "why": "Bisection finds the first bad build in log2(n) probes, 6 for 40 builds. A replay with an invariant check gives the pass or fail, and exit code 125 skips builds that do not compile."
          },
          {
            "signal": "Memory or frame time degrades after hours of play, and short tests pass",
            "use": "Run soak tests with bots and leak counters",
            "why": "Drive a headless build with bots at 10x to 30x time scale. Assert on slopes such as MB per hour and p99 frame time, so the test fails long before a real device runs out of memory."
          },
          {
            "signal": "State corrupts rarely, and the bug moves or vanishes when you add logging or breakpoints",
            "use": "Suspect a data race; run a thread sanitizer",
            "why": "A log line changes thread timing, which is typical for a race. Run ThreadSanitizer or the engine's job safety checks, and give each piece of data one writer per phase."
          }
        ]
      }
    ],
    "keyPoints": [
      "Debug by reproducing: record inputs, seed and frame times, run the simulation at a fixed step, and a bug seen once becomes a replay that fails every time.",
      "Make the invisible visible: debug draw, a console, time scale, pause and frame stepping. A breakpoint stops the clock and often the bug with it.",
      "Log by category with frame stamps into a ring buffer that is dumped on failure, and assert invariants every frame in dev builds so failures show up at their origin.",
      "Fast shapes tunnel when a step is longer than the geometry: cap the step, run fixed ticks, sweep the shape, and reject thin colliders in the level validator.",
      "Hash simulation state per system every tick; once clients differ they stay different, so bisect to the first diverging frame and diff that system.",
      "Keep symbols per build id, bucket crashes by callstack, and turn replays into regression tests and bot soak runs so fixed bugs stay fixed."
    ],
    "quiz": [
      {
        "q": "A character falls at 22 m/s onto a 0.1 m thick floor. The capsule is 1.8 m tall, and the physics tests overlap only at the end of each step. The step is 1/60 s normally and 0.1 s on a hitch frame. Which statement is true?",
        "options": [
          "Both steps are safe, because the capsule is taller than the floor is thick",
          "Both steps tunnel, because 22 m/s is far faster than the floor is thick",
          "The 0.37 m step is caught; the 2.2 m step can skip the 1.9 m window",
          "Only the 0.37 m step tunnels, because shorter steps skip more geometry"
        ],
        "answer": 2,
        "explain": "Falling straight down, the capsule overlaps the slab during only 0.1 + 1.8 = 1.9 m of its travel. A 0.37 m step must land inside that window. A 2.2 m step can jump over it. The first option forgets that the shape is tested only at step ends. The second ignores the step length, which matters rather than the speed alone. The fourth has it backwards: shorter steps are safer."
      },
      {
        "q": "A replay recorded and played on the same build and PC drifts at tick 9,000, though every input matches. What is the most likely cause?",
        "options": [
          "The simulation reads wall-clock time or an RNG stream that rendering shares",
          "The input log was sampled at 60 Hz instead of the display refresh rate",
          "The replay file is long, so its later ticks are cut off when it loads",
          "The simulation uses a fixed timestep, which cannot be replayed exactly"
        ],
        "answer": 0,
        "explain": "Any value that enters the simulation from outside the input log breaks the replay: the wall clock, or a random draw made by a render effect that shifts the shared stream. Input sampled per tick is exactly what a fixed-step replay wants, so the second option is not a cause. A truncated file would stop or fail, not drift quietly. A fixed timestep is what makes replays work at all."
      },
      {
        "q": "The state hash is known to match at tick 0 and to differ at tick 7,200. Each probe needs a re-simulation. About how many probes find the first differing tick by bisection?",
        "options": [
          "About 7,200, one for each tick",
          "About 720, one for every tenth tick",
          "About 85, the square root of the range",
          "About 13, since the range halves each probe"
        ],
        "answer": 3,
        "explain": "Once the state diverges it stays diverged, so each probe rules out half of the remaining range: log2(7,200) is about 12.8, which is 13 probes. Checking every tick or every tenth tick is a linear scan. The square root belongs to a different search strategy and is not what bisection does."
      },
      {
        "q": "A release crash dump from build 0.9.4 shows only hex addresses in its stack. What is missing?",
        "options": [
          "A debug build of the game, which must be run under a debugger on the player's PC",
          "The symbol files for that exact build, uploaded to the symbol server by build id",
          "A larger dump that also contains the whole heap and every loaded texture",
          "A log file, because a callstack cannot be read without matching log lines"
        ],
        "answer": 1,
        "explain": "Addresses become function names only through the symbol files produced by the same build, found by its build id. Symbols from a newer build do not match. Running a debug build elsewhere does not name addresses in the player's dump. A bigger dump adds data, not names. Logs help with context but do not translate addresses."
      },
      {
        "q": "Why keep verbose logs in a ring buffer of the last few thousand lines and dump it on an assertion or a bug report?",
        "options": [
          "It sorts the lines by severity so that errors come first in the file",
          "It writes every line to disk at once, so nothing is lost if the game dies",
          "Detail is cheap until needed, and the lines before the failure come with it",
          "It lowers the log level so that warnings are never recorded in memory"
        ],
        "answer": 2,
        "explain": "A ring buffer in memory has no file I/O, so full detail is cheap, and when something fails the most recent history is exactly what you need. It does not sort by severity, it does not write to disk immediately (that is the cost it avoids), and it keeps warnings rather than dropping them."
      },
      {
        "q": "Build 0.9.7 shows AI units no longer flanking. Build 0.9.2 was fine, 40 builds apart. A 90 s replay shows the failure every time. What do you do first?",
        "options": [
          "Capture the frame in RenderDoc or PIX",
          "Bisect per-frame checksums to the first frame",
          "Run soak tests with bots and leak counters",
          "git bisect with an automated replay as the test"
        ],
        "answer": 3,
        "explain": "Two known builds plus a replay that fails reliably is the setup for bisecting builds: about 6 probes for 40 builds, each decided by the replay. Frame capture is for rendering faults. Checksum bisection compares two clients within one run, and here there is one behaviour change across builds. A soak test looks for slow degradation, not a clear regression."
      }
    ]
  }
];
