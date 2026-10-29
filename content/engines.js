window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "engines",
  "track": "Game Development",
  "title": "Game Engines",
  "tagline": "The loop, the data and the systems every engine is built from.",
  "intro": "Every engine, from a hand-rolled C++ loop to Unity or Unreal, is built from the same handful of systems: a loop that spends a fixed time budget, data laid out for the cache, spatial structures that skip work, and simulation, animation, AI, audio and networking that run inside that budget. The last two topics follow a real bug hunt and a real frame-rate investigation through a shipped game, using those systems to find and fix what went wrong. Knowing how these systems work is what lets you read a profiler capture, choose the right tool for a problem and judge whether code an agent wrote will hold up at 60 fps on real hardware.",
  "topics": [
    {
      "id": "engines-game-loop",
      "title": "The game loop and time",
      "minutes": 12,
      "summary": "How a game turns input, simulation and rendering into a steady stream of frames, and why time handling decides whether it feels smooth.",
      "lesson": [
        {
          "type": "p",
          "text": "A shipped mobile racing game plays perfectly on the developer's laptop at 240 fps. On a mid-range phone locked to 60 Hz, cars drive through walls, jump physics feels floaty, and a replay recorded on one device desyncs on another. Nothing is wrong with the track or the car. The bug is in how the game measures and spends time. The **game loop** is the small piece of code at the heart of every engine that decides when to read input, when to advance the simulation, and when to draw."
        },
        {
          "type": "h",
          "text": "The minimal loop and the frame budget"
        },
        {
          "type": "p",
          "text": "Strip away the engine and every game is this: repeat forever { read input; update the world; render; present }. One pass is a **frame**. Unlike a web page or a business app, a game does not wait for events. It keeps producing frames whether or not anything happened, because the world (animation, AI, particles) is always moving."
        },
        {
          "type": "p",
          "text": "The key number is the **frame budget**: the time one frame may take. At 60 fps it is 1000 / 60 = 16.6 ms. At 30 fps it is 33.3 ms, at 120 fps it is 8.3 ms, and a 144 Hz monitor leaves 6.9 ms. Everything must fit: input, gameplay scripts, animation, physics, culling, command building for the GPU, audio mixing and engine overhead on the CPU, plus the GPU's own work, which runs in parallel but also has to finish inside the budget. Miss it by one millisecond and a frame is shown twice, which the player perceives as a hitch. Budgets are always spoken about in milliseconds, never in fps, because milliseconds add up and fps do not: going from 60 to 55 fps costs 1.5 ms, while going from 30 to 25 fps costs 6.7 ms."
        },
        {
          "type": "figure",
          "id": "engines-loop-frame-budget",
          "caption": "The 60 fps budget is half of 30 fps and twice 120 fps; every CPU stage of a frame has to fit inside its 16.6 ms, and the rest is idle.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 326\" role=\"img\" aria-label=\"Frame budgets drawn to scale: 33.3 ms at 30 fps, 16.6 ms at 60 fps, 8.3 ms at 120 fps, 6.9 ms at 144 Hz, and one 16.6 ms frame split into input, scripts, animation, physics, culling, GPU commands and idle time\"><style>.engines-loop-frame-budget-t{font-size:13px;fill:var(--fig-ink)}.engines-loop-frame-budget-m{font-size:13px;fill:var(--fig-muted)}.engines-loop-frame-budget-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-loop-frame-budget-c{text-anchor:middle}.engines-loop-frame-budget-e{text-anchor:end}.engines-loop-frame-budget-ph{animation:engines-loop-frame-budget-run 5s linear infinite}@keyframes engines-loop-frame-budget-run{0%{transform:translateX(0);opacity:0}4%{opacity:1}80%{transform:translateX(514.6px);opacity:1}88%,100%{transform:translateX(514.6px);opacity:0}}</style><text class=\"engines-loop-frame-budget-h\" x=\"24\" y=\"26\">Frame budget per target, to scale</text><text class=\"engines-loop-frame-budget-t\" x=\"24\" y=\"57\">30 fps</text><rect x=\"100\" y=\"42\" width=\"432.9\" height=\"20\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-m\" x=\"540.9\" y=\"57\">33.3 ms</text><text class=\"engines-loop-frame-budget-t\" x=\"24\" y=\"87\">60 fps</text><rect x=\"100\" y=\"72\" width=\"215.8\" height=\"20\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.45\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-t\" x=\"323.8\" y=\"87\">16.6 ms</text><text class=\"engines-loop-frame-budget-t\" x=\"24\" y=\"117\">120 fps</text><rect x=\"100\" y=\"102\" width=\"107.9\" height=\"20\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-m\" x=\"215.9\" y=\"117\">8.3 ms</text><text class=\"engines-loop-frame-budget-t\" x=\"24\" y=\"147\">144 Hz</text><rect x=\"100\" y=\"132\" width=\"89.7\" height=\"20\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-m\" x=\"197.7\" y=\"147\">6.9 ms</text><text class=\"engines-loop-frame-budget-h\" x=\"24\" y=\"190\">One 60 fps frame, example split</text><rect x=\"61\" y=\"212\" width=\"29\" height=\"34\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.3\"/><line x1=\"75.5\" y1=\"250\" x2=\"75.5\" y2=\"253\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-t engines-loop-frame-budget-c\" x=\"75.5\" y=\"266\">input</text><rect x=\"92\" y=\"212\" width=\"122\" height=\"34\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.5\"/><line x1=\"153\" y1=\"250\" x2=\"153\" y2=\"275\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-t engines-loop-frame-budget-c\" x=\"153\" y=\"288\">scripts</text><rect x=\"216\" y=\"212\" width=\"60\" height=\"34\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.3\"/><line x1=\"246\" y1=\"250\" x2=\"246\" y2=\"253\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-t engines-loop-frame-budget-c\" x=\"246\" y=\"266\">animation</text><rect x=\"278\" y=\"212\" width=\"91\" height=\"34\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.5\"/><line x1=\"323.5\" y1=\"250\" x2=\"323.5\" y2=\"275\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-t engines-loop-frame-budget-c\" x=\"323.5\" y=\"288\">physics</text><rect x=\"371\" y=\"212\" width=\"44.5\" height=\"34\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.3\"/><line x1=\"393.3\" y1=\"250\" x2=\"393.3\" y2=\"253\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-t engines-loop-frame-budget-c\" x=\"393.3\" y=\"266\">culling</text><rect x=\"417.5\" y=\"212\" width=\"75.5\" height=\"34\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\"/><line x1=\"455.3\" y1=\"250\" x2=\"455.3\" y2=\"275\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-t engines-loop-frame-budget-c\" x=\"455.3\" y=\"288\">GPU commands</text><rect x=\"495\" y=\"213\" width=\"78.6\" height=\"32\" rx=\"6\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"534.3\" y1=\"250\" x2=\"534.3\" y2=\"253\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-loop-frame-budget-m engines-loop-frame-budget-c\" x=\"534.3\" y=\"266\">idle</text><line x1=\"574.6\" y1=\"204\" x2=\"574.6\" y2=\"254\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/><text class=\"engines-loop-frame-budget-t engines-loop-frame-budget-e\" x=\"568.6\" y=\"202\">present at 16.6 ms</text><text class=\"engines-loop-frame-budget-m\" x=\"60\" y=\"314\">0 ms</text><text class=\"engines-loop-frame-budget-m engines-loop-frame-budget-e\" x=\"574.6\" y=\"314\">CPU stages fill the frame in order; what is left is idle</text><line class=\"engines-loop-frame-budget-ph\" x1=\"60\" y1=\"206\" x2=\"60\" y2=\"252\" stroke=\"var(--fig-ink)\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
        },
        {
          "type": "h",
          "text": "Update and render are separate concerns"
        },
        {
          "type": "p",
          "text": "A common beginner design ties them together: one function moves the player by a fixed amount, then draws. This makes game speed depend on frame rate. Two corrections exist. The first is to multiply movement by **delta time** (`dt`, the seconds since the previous frame): `position += velocity * dt`. This is the **variable timestep**. It is simple, and fine for animation, camera, UI and most gameplay motion."
        },
        {
          "type": "p",
          "text": "Variable timestep has real problems for simulation. Integration error grows with `dt`, so the same jump reaches a different height at 30 fps and at 144 fps. Stacked physics becomes unstable when a big `dt` arrives after a hitch. A one-second stall (debugger break, app resumed from background) produces one `dt` of 1.0 s and every fast object teleports. And nothing is reproducible, because the sequence of `dt` values differs on every run."
        },
        {
          "type": "h",
          "text": "Fixed timestep and the accumulator"
        },
        {
          "type": "p",
          "text": "The fix is to simulate in constant steps, for example 1/50 s or 1/60 s, and decouple that from how often you render. The standard implementation is the **accumulator pattern** (popularised by Glenn Fiedler's article 'Fix Your Timestep'). Real elapsed time is added to a bucket; the simulation drains the bucket in fixed chunks; whatever is left over is the fraction of a step the renderer should interpolate."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "const double Step = 1.0 / 60.0;\ndouble accumulator = 0;\ndouble previous = Now();\n\nwhile (running)\n{\n    double current = Now();\n    double frameTime = Math.Min(current - previous, 0.25); // clamp\n    previous = current;\n    accumulator += frameTime;\n\n    PollInput();\n    while (accumulator >= Step)\n    {\n        SavePreviousState();   // state[n-1]\n        Simulate(Step);        // state[n], always the same dt\n        accumulator -= Step;\n    }\n\n    double alpha = accumulator / Step;       // 0..1\n    Render(Lerp(prevState, currState, alpha));\n    Present();\n}"
        },
        {
          "type": "p",
          "text": "Three details matter. First, the **clamp** on `frameTime` (0.25 s here) prevents the **spiral of death**: if a simulation step costs more than its step length, each frame owes more steps than it can pay and the game never catches up. Capping the debt means the game slows down instead of freezing. Second, **interpolation**: rendering is almost never aligned with a simulation tick, so drawing the latest state makes motion judder (a 60 Hz sim shown on a 144 Hz display repeats positions unevenly). Blending the previous and current states by `alpha` makes motion smooth at the cost of showing the world one tick in the past. Third, **extrapolation** (predicting forward instead) avoids the delay but overshoots when things change direction, so most engines interpolate."
        },
        {
          "type": "figure",
          "id": "engines-loop-accumulator",
          "caption": "Render frames vary, but the accumulator always drains in whole 1/60 s steps: a 38 ms frame runs three ticks, a 12 ms frame may run none, and the remainder becomes alpha.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 404\" role=\"img\" aria-label=\"Accumulator timeline: five render frames of 20, 12, 38, 12 and 15 ms; the accumulator collects each frameTime and drains it in fixed 16.7 ms steps, so frames run 1, 0, 3, 0 and 1 simulation steps and the remainder becomes the interpolation alpha\"><style>.engines-loop-accumulator-t{font-size:13px;fill:var(--fig-ink)}.engines-loop-accumulator-m{font-size:13px;fill:var(--fig-muted)}.engines-loop-accumulator-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-loop-accumulator-c{text-anchor:middle}.engines-loop-accumulator-e{text-anchor:end}.engines-loop-accumulator-b0{animation:engines-loop-accumulator-kb0 7s linear infinite}@keyframes engines-loop-accumulator-kb0{0%{opacity:1}3%,20%{opacity:0}20.1%,100%{opacity:1}}.engines-loop-accumulator-c0{animation:engines-loop-accumulator-kc0 7s linear infinite}@keyframes engines-loop-accumulator-kc0{0%{fill-opacity:0}3%,22.1%{fill-opacity:0.6}27.1%,100%{fill-opacity:0}}.engines-loop-accumulator-f0{animation:engines-loop-accumulator-kf0 7s linear infinite}@keyframes engines-loop-accumulator-kf0{0%{opacity:1}3%,22.1%{opacity:0.15}27.1%,100%{opacity:1}}.engines-loop-accumulator-b1{animation:engines-loop-accumulator-kb1 7s linear infinite}@keyframes engines-loop-accumulator-kb1{0%{opacity:1}3%,29.6%{opacity:0}29.7%,100%{opacity:1}}.engines-loop-accumulator-b2{animation:engines-loop-accumulator-kb2 7s linear infinite}@keyframes engines-loop-accumulator-kb2{0%{opacity:1}3%,60.2%{opacity:0}60.3%,100%{opacity:1}}.engines-loop-accumulator-c2{animation:engines-loop-accumulator-kc2 7s linear infinite}@keyframes engines-loop-accumulator-kc2{0%{fill-opacity:0}3%,62.3%{fill-opacity:0.6}67.3%,100%{fill-opacity:0}}.engines-loop-accumulator-f2{animation:engines-loop-accumulator-kf2 7s linear infinite}@keyframes engines-loop-accumulator-kf2{0%{opacity:1}3%,62.3%{opacity:0.15}67.3%,100%{opacity:1}}.engines-loop-accumulator-b3{animation:engines-loop-accumulator-kb3 7s linear infinite}@keyframes engines-loop-accumulator-kb3{0%{opacity:1}3%,69.8%{opacity:0}69.9%,100%{opacity:1}}.engines-loop-accumulator-b4{animation:engines-loop-accumulator-kb4 7s linear infinite}@keyframes engines-loop-accumulator-kb4{0%{opacity:1}3%,81.9%{opacity:0}82%,100%{opacity:1}}.engines-loop-accumulator-c4{animation:engines-loop-accumulator-kc4 7s linear infinite}@keyframes engines-loop-accumulator-kc4{0%{fill-opacity:0}3%,84%{fill-opacity:0.6}89%,100%{fill-opacity:0}}.engines-loop-accumulator-f4{animation:engines-loop-accumulator-kf4 7s linear infinite}@keyframes engines-loop-accumulator-kf4{0%{opacity:1}3%,84%{opacity:0.15}89%,100%{opacity:1}}.engines-loop-accumulator-ph{animation:engines-loop-accumulator-run 7s linear infinite}@keyframes engines-loop-accumulator-run{0%,3%{transform:translateX(0);opacity:0}4%{opacity:1}82%{transform:translateX(543.2px);opacity:1}88%,100%{transform:translateX(543.2px);opacity:0}}</style><text class=\"engines-loop-accumulator-h\" x=\"40\" y=\"24\">Render frames, variable frameTime</text><rect x=\"41\" y=\"34\" width=\"110\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"96\" y=\"53\">20 ms</text><rect x=\"153\" y=\"34\" width=\"65.2\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.45\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"185.6\" y=\"53\">12 ms</text><rect x=\"220.2\" y=\"34\" width=\"210.8\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"325.6\" y=\"53\">38 ms</text><rect x=\"433\" y=\"34\" width=\"65.2\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.45\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"465.6\" y=\"53\">12 ms</text><rect x=\"500.2\" y=\"34\" width=\"82\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"541.2\" y=\"53\">15 ms</text><text class=\"engines-loop-accumulator-h\" x=\"40\" y=\"92\">Simulate(Step), fixed Step = 1/60 s = 16.7 ms</text><rect class=\"engines-loop-accumulator-f0\" x=\"41\" y=\"102\" width=\"91.3\" height=\"26\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c engines-loop-accumulator-f0\" x=\"86.7\" y=\"120\">tick 1</text><rect class=\"engines-loop-accumulator-f2\" x=\"134.3\" y=\"102\" width=\"91.3\" height=\"26\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c engines-loop-accumulator-f2\" x=\"180\" y=\"120\">tick 2</text><rect class=\"engines-loop-accumulator-f2\" x=\"227.7\" y=\"102\" width=\"91.3\" height=\"26\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c engines-loop-accumulator-f2\" x=\"273.3\" y=\"120\">tick 3</text><rect class=\"engines-loop-accumulator-f2\" x=\"321\" y=\"102\" width=\"91.3\" height=\"26\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c engines-loop-accumulator-f2\" x=\"366.7\" y=\"120\">tick 4</text><rect class=\"engines-loop-accumulator-f4\" x=\"414.3\" y=\"102\" width=\"91.3\" height=\"26\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\"/><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c engines-loop-accumulator-f4\" x=\"460\" y=\"120\">tick 5</text><text class=\"engines-loop-accumulator-h\" x=\"40\" y=\"160\">Accumulator at each frame end</text><line x1=\"40\" y1=\"306\" x2=\"600\" y2=\"306\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 4\"/><text class=\"engines-loop-accumulator-m\" x=\"40\" y=\"301\">1 Step</text><line x1=\"40\" y1=\"256\" x2=\"600\" y2=\"256\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 4\"/><text class=\"engines-loop-accumulator-m\" x=\"40\" y=\"251\">2 Steps</text><line x1=\"40\" y1=\"206\" x2=\"600\" y2=\"206\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 4\"/><text class=\"engines-loop-accumulator-m\" x=\"40\" y=\"201\">3 Steps</text><line x1=\"40\" y1=\"356\" x2=\"600\" y2=\"356\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"152\" y1=\"30\" x2=\"152\" y2=\"66\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"152\" y1=\"98\" x2=\"152\" y2=\"132\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"152\" y1=\"170\" x2=\"152\" y2=\"356\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><g class=\"engines-loop-accumulator-b0\"><rect x=\"141\" y=\"346\" width=\"22\" height=\"10\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.85\"/><rect x=\"142\" y=\"297\" width=\"20\" height=\"48\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"3 2\" class=\"engines-loop-accumulator-c0\"/></g><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"152\" y=\"376\">α .20</text><text class=\"engines-loop-accumulator-m engines-loop-accumulator-c\" x=\"152\" y=\"394\">1 step</text><line x1=\"219.2\" y1=\"30\" x2=\"219.2\" y2=\"66\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"219.2\" y1=\"98\" x2=\"219.2\" y2=\"132\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"219.2\" y1=\"170\" x2=\"219.2\" y2=\"356\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><g class=\"engines-loop-accumulator-b1\"><rect x=\"208.2\" y=\"310\" width=\"22\" height=\"46\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.85\"/></g><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"219.2\" y=\"376\">α .92</text><text class=\"engines-loop-accumulator-m engines-loop-accumulator-c\" x=\"219.2\" y=\"394\">0 steps</text><line x1=\"432\" y1=\"30\" x2=\"432\" y2=\"66\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"432\" y1=\"98\" x2=\"432\" y2=\"132\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"432\" y1=\"170\" x2=\"432\" y2=\"356\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><g class=\"engines-loop-accumulator-b2\"><rect x=\"421\" y=\"346\" width=\"22\" height=\"10\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.85\"/><rect x=\"422\" y=\"297\" width=\"20\" height=\"48\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"3 2\" class=\"engines-loop-accumulator-c2\"/><rect x=\"422\" y=\"247\" width=\"20\" height=\"48\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"3 2\" class=\"engines-loop-accumulator-c2\"/><rect x=\"422\" y=\"197\" width=\"20\" height=\"48\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"3 2\" class=\"engines-loop-accumulator-c2\"/></g><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"432\" y=\"376\">α .20</text><text class=\"engines-loop-accumulator-m engines-loop-accumulator-c\" x=\"432\" y=\"394\">3 steps</text><line x1=\"499.2\" y1=\"30\" x2=\"499.2\" y2=\"66\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"499.2\" y1=\"98\" x2=\"499.2\" y2=\"132\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"499.2\" y1=\"170\" x2=\"499.2\" y2=\"356\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><g class=\"engines-loop-accumulator-b3\"><rect x=\"488.2\" y=\"310\" width=\"22\" height=\"46\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.85\"/></g><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"499.2\" y=\"376\">α .92</text><text class=\"engines-loop-accumulator-m engines-loop-accumulator-c\" x=\"499.2\" y=\"394\">0 steps</text><line x1=\"583.2\" y1=\"30\" x2=\"583.2\" y2=\"66\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"583.2\" y1=\"98\" x2=\"583.2\" y2=\"132\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><line x1=\"583.2\" y1=\"170\" x2=\"583.2\" y2=\"356\" stroke=\"var(--fig-muted)\" stroke-width=\"1\" stroke-dasharray=\"2 3\"/><g class=\"engines-loop-accumulator-b4\"><rect x=\"572.2\" y=\"315\" width=\"22\" height=\"41\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.85\"/><rect x=\"573.2\" y=\"266\" width=\"20\" height=\"48\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"3 2\" class=\"engines-loop-accumulator-c4\"/></g><text class=\"engines-loop-accumulator-t engines-loop-accumulator-c\" x=\"583.2\" y=\"376\">α .82</text><text class=\"engines-loop-accumulator-m engines-loop-accumulator-c\" x=\"583.2\" y=\"394\">1 step</text><line class=\"engines-loop-accumulator-ph\" x1=\"40\" y1=\"30\" x2=\"40\" y2=\"356\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/></svg>"
        },
        {
          "type": "list",
          "items": [
            "Run in fixed steps: physics, character controllers that need stability, networked or replayed gameplay, deterministic AI ticks.",
            "Run per rendered frame with variable dt: camera, animation sampling, UI, audio fades, visual-only effects.",
            "Read input once per frame, but apply it inside the fixed step; otherwise two ticks in one frame may both consume the same press, or a press between ticks may be lost.",
            "Never store gameplay-critical timers as frame counts unless the step is fixed."
          ]
        },
        {
          "type": "h",
          "text": "Vsync, swap chains and frame pacing"
        },
        {
          "type": "p",
          "text": "Displays refresh at fixed intervals. If you present a frame while the display is mid-scan you get **tearing**, so with **vsync** the GPU waits for the next refresh. The swap chain holds a small queue of buffers (double or triple buffering). With vsync on a 60 Hz display, a frame that takes 17 ms instead of 16.6 ms misses its slot and is shown for two refreshes, so effective output drops to 30 fps for that frame. Average fps hides this: a game at 'average 58 fps' can feel terrible if every few frames one takes 33 ms instead of 16 ms."
        },
        {
          "type": "figure",
          "id": "engines-loop-vsync-miss",
          "caption": "Frame B takes 17 ms and misses its vsync by 0.4 ms, so frame A stays on screen for 33.3 ms: a one-millisecond overrun costs a whole refresh.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 216\" role=\"img\" aria-label=\"Vsync timeline at 60 Hz: frame B takes 17 ms, misses its vsync by 0.4 ms, so frame A stays on screen for two refreshes, 33.3 ms\"><style>.engines-loop-vsync-miss-t{font-size:13px;fill:var(--fig-ink)}.engines-loop-vsync-miss-m{font-size:13px;fill:var(--fig-muted)}.engines-loop-vsync-miss-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-loop-vsync-miss-c{text-anchor:middle}.engines-loop-vsync-miss-e{text-anchor:end}.engines-loop-vsync-miss-ph{animation:engines-loop-vsync-miss-scan 6s linear infinite}@keyframes engines-loop-vsync-miss-scan{0%{transform:translateX(0);opacity:0}3%{opacity:1}85%{transform:translateX(550px);opacity:1}90%,100%{transform:translateX(550px);opacity:0}}.engines-loop-vsync-miss-rep{animation:engines-loop-vsync-miss-blink 6s linear infinite}@keyframes engines-loop-vsync-miss-blink{0%,30%{fill-opacity:0.35}34%,48%{fill-opacity:0.7}52%,100%{fill-opacity:0.35}}</style><text class=\"engines-loop-vsync-miss-h\" x=\"50\" y=\"24\">Frame work (CPU + GPU), vsync on at 60 Hz</text><line x1=\"50\" y1=\"32\" x2=\"50\" y2=\"70\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"50\" y1=\"130\" x2=\"50\" y2=\"168\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"141.7\" y1=\"32\" x2=\"141.7\" y2=\"70\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"141.7\" y1=\"130\" x2=\"141.7\" y2=\"168\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"233.3\" y1=\"32\" x2=\"233.3\" y2=\"70\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"233.3\" y1=\"130\" x2=\"233.3\" y2=\"168\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"325\" y1=\"32\" x2=\"325\" y2=\"70\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"325\" y1=\"130\" x2=\"325\" y2=\"168\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"416.7\" y1=\"32\" x2=\"416.7\" y2=\"70\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"416.7\" y1=\"130\" x2=\"416.7\" y2=\"168\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"508.3\" y1=\"32\" x2=\"508.3\" y2=\"70\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"508.3\" y1=\"130\" x2=\"508.3\" y2=\"168\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"600\" y1=\"32\" x2=\"600\" y2=\"70\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><line x1=\"600\" y1=\"130\" x2=\"600\" y2=\"168\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><text class=\"engines-loop-vsync-miss-m engines-loop-vsync-miss-e\" x=\"600\" y=\"24\">dashed lines: vsync</text><rect x=\"51\" y=\"36\" width=\"80.5\" height=\"30\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.3\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"91.3\" y=\"56\">A 15 ms</text><rect x=\"142.7\" y=\"36\" width=\"91.5\" height=\"30\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.3\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"188.4\" y=\"56\">B 17 ms</text><rect x=\"326\" y=\"36\" width=\"75\" height=\"30\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.3\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"363.5\" y=\"56\">C 14 ms</text><rect x=\"417.7\" y=\"36\" width=\"80.5\" height=\"30\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.3\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"457.9\" y=\"56\">D 15 ms</text><rect x=\"233.3\" y=\"36\" width=\"1.8\" height=\"30\" fill=\"var(--fig-bad)\"/><text class=\"engines-loop-vsync-miss-m engines-loop-vsync-miss-c\" x=\"279\" y=\"56\">waits</text><path d=\"M237.3 78 l10 10\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" fill=\"none\"/><text class=\"engines-loop-vsync-miss-t\" x=\"249.3\" y=\"98\" style=\"fill:var(--fig-bad)\">misses vsync by 0.4 ms</text><text class=\"engines-loop-vsync-miss-h\" x=\"50\" y=\"124\">Display shows</text><rect x=\"52\" y=\"134\" width=\"87.7\" height=\"30\" rx=\"6\" fill=\"var(--fig-line)\" fill-opacity=\"0.3\"/><text class=\"engines-loop-vsync-miss-m engines-loop-vsync-miss-c\" x=\"95.8\" y=\"154\">prev</text><rect x=\"143.7\" y=\"134\" width=\"87.7\" height=\"30\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.3\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"187.5\" y=\"154\">A</text><rect class=\"engines-loop-vsync-miss-rep\" x=\"235.3\" y=\"134\" width=\"87.7\" height=\"30\" rx=\"6\" fill=\"var(--fig-bad)\" fill-opacity=\"0.35\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"279.2\" y=\"154\">A again</text><rect x=\"327\" y=\"134\" width=\"87.7\" height=\"30\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.3\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"370.8\" y=\"154\">B</text><rect x=\"418.7\" y=\"134\" width=\"87.7\" height=\"30\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.3\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"462.5\" y=\"154\">C</text><rect x=\"510.3\" y=\"134\" width=\"87.7\" height=\"30\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.3\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"554.2\" y=\"154\">D</text><path d=\"M143.7 176 v8 H323 v-8\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" fill=\"none\"/><text class=\"engines-loop-vsync-miss-t engines-loop-vsync-miss-c\" x=\"233.3\" y=\"202\" style=\"fill:var(--fig-bad)\">A on screen for 33.3 ms: a hitch</text><path d=\"M418.7 176 v8 H506.3 v-8\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" fill=\"none\"/><text class=\"engines-loop-vsync-miss-m engines-loop-vsync-miss-c\" x=\"462.5\" y=\"202\">16.6 ms</text><line class=\"engines-loop-vsync-miss-ph\" x1=\"50\" y1=\"30\" x2=\"50\" y2=\"168\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/></svg>"
        },
        {
          "type": "p",
          "text": "**Frame pacing** is about the evenness of frame delivery, not the average. Stutter is judged by the 1% low or by the frame-time graph, not by fps. Variable refresh rate (G-Sync, FreeSync, ProMotion) lets the display wait for the frame, which tolerates fluctuation. Mobile platforms add their own pacing libraries (Android Frame Pacing, Apple's CADisplayLink) so the engine can target a consistent 30 or 60 instead of oscillating. Capping to 30 deliberately on mobile for thermal reasons is often better than an uncapped 45 that bounces."
        },
        {
          "type": "h",
          "text": "CPU-bound, GPU-bound and the pipeline"
        },
        {
          "type": "p",
          "text": "The CPU prepares frame N+1 while the GPU draws frame N, so the frame rate is set by the slower of the two stages, plus latency from queued frames. If the CPU takes 14 ms and the GPU 9 ms, you are CPU-bound at about 14 ms and lowering resolution does nothing. If the GPU takes 20 ms, you are GPU-bound and cutting scripts does nothing. Always find out which side is the bottleneck before optimising, using a profiler rather than guessing."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Do not 'fix' a frame spike by lowering the fixed step length. A smaller step means more simulation steps per frame, which raises CPU cost and can start the spiral of death. Change the step only for accuracy reasons, and measure steps-per-frame."
        },
        {
          "type": "list",
          "items": [
            "Misconception: delta time makes a game frame-rate independent. It makes motion roughly independent, but not collisions, jump heights, or determinism.",
            "Misconception: uncapped fps is always better. It burns battery, heats mobile devices and can expose bugs that only appear at extreme dt values.",
            "Pitfall: `Time.deltaTime` style values are often smoothed or clamped by the engine; do not assume they equal the raw measured interval.",
            "Pitfall: loading a level inside a frame produces a single dt of several seconds; clamp or reset the clock after a load."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "AI agents love to write `transform.position += direction * speed` with no time term, or to apply forces in the per-frame update because that is where tutorials put it. Tell the agent which code path runs at which rate (fixed vs per-frame) and ask it to state the units of every time value. Verify by running the game at 30, 60 and 144 fps (or with a forced frame cap) and checking that jump height, travel distance and timers match. Agents also rarely add the clamp that prevents the spiral of death."
        },
        {
          "type": "p",
          "text": "The loop is where every later topic plugs in: physics runs in the fixed part, rendering and culling in the variable part, and entity architecture decides how cheaply you can iterate thousands of objects inside the 16.6 ms you have."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Physics or jump height changes with frame rate; a replay recorded at 144 fps desyncs when played at 60 fps",
              "use": "Fixed timestep with an accumulator",
              "why": "Simulation advances in constant `dt` steps drained from accumulated frame time, so results stop depending on fps. Costs several steps on slow frames and needs render interpolation to look smooth."
            },
            {
              "signal": "Motion judders on a 144 Hz display although the 60 Hz simulation itself is smooth",
              "use": "Render interpolation between sim states",
              "why": "Draw `lerp(previous, current, accumulator / dt)` so rendering samples a continuous path. Adds up to one step of visual latency; extrapolation avoids that but mispredicts on sudden turns."
            },
            {
              "signal": "After a stall or app resume the game freezes for seconds while it runs hundreds of catch-up steps",
              "use": "Clamp frame time (spiral-of-death guard)",
              "why": "Cap the time fed to the accumulator (for example 0.25 s) and drop the rest. The game briefly runs slower than real time instead of locking up; lockstep games must handle the dropped time explicitly."
            },
            {
              "signal": "Average fps looks fine but players report stutter; the frame-time graph shows 33.3 ms spikes among 16.6 ms frames",
              "use": "Measure frame pacing and 1% lows",
              "why": "With vsync a frame that misses its slot costs a whole refresh, so evenness matters more than the mean. Budget in ms, find the spike's cause, or lock to a lower rate that you can always hit."
            },
            {
              "signal": "A frame is slow and someone wants to optimise shaders, but nobody knows which processor is the bottleneck",
              "use": "Identify CPU-bound vs GPU-bound first",
              "why": "Frame time is set by the slower of CPU and GPU, which run in parallel. Halving GPU cost on a CPU-bound frame gains nothing; check main-thread time against GPU time in the profiler first."
            },
            {
              "signal": "Thousands of objects each need a little behaviour every frame and the profiler shows a huge count of tiny Update calls",
              "use": "Update Method via one manager loop",
              "why": "Giving each object an `Update(dt)` is the Update Method pattern; driving them from one manager over an array removes per-call engine overhead and fixes the order. Lose the convenience of per-object callbacks."
            },
            {
              "signal": "Objects updated earlier in a frame see neighbours' new state while later ones see old state, so results depend on order",
              "use": "Double Buffer",
              "why": "Read from the current state and write to a next buffer, then swap once all updates finish. Every object sees a consistent snapshot. Doubles memory for that state and adds one step of latency."
            },
            {
              "signal": "Gameplay code calls audio or VFX directly and a burst of events causes spikes or reentrancy bugs mid-update",
              "use": "Event Queue",
              "why": "Push events into a queue and process them at a fixed point in the frame, decoupling sender and receiver in time and allowing merging or throttling. Receivers may act on stale state; guard against feedback loops."
            },
            {
              "signal": "A pause menu sets the time scale to 0 and its own animations and timers freeze as well",
              "use": "Separate scaled and unscaled clocks",
              "why": "Gameplay reads scaled time (pause, slow motion, hit-stop); UI, audio fades and network timeouts read real time. Mixing them breaks pause and makes timeouts fire wrongly during slow motion."
            }
          ]
        }
      ],
      "keyPoints": [
        "Frame budget is 1000 / fps in ms: 16.6 at 60, 8.3 at 120. Think and measure in milliseconds, not fps.",
        "Variable dt is fine for visuals; simulation wants a fixed step driven by an accumulator, with the leftover fraction used to interpolate rendering.",
        "Clamp the frame time fed to the accumulator, or one hitch causes a spiral of death.",
        "Smoothness is frame pacing (evenness, 1% lows), not average fps; a missed vsync slot costs a whole refresh.",
        "The slower of CPU and GPU sets frame time; identify the bound side before optimising."
      ],
      "quiz": [
        {
          "q": "A game targets 120 Hz. Profiling shows 7.9 ms of CPU work and 9.4 ms of GPU work per frame. What happens, and what is the right first move?",
          "options": [
            "It holds 120 fps because the CPU fits; reduce nothing.",
            "It is GPU-bound and misses 8.3 ms; reduce GPU work such as resolution or shading cost.",
            "It is CPU-bound; move gameplay code onto worker threads to recover time.",
            "It runs at 120 fps because CPU and GPU times add up to under 17 ms."
          ],
          "answer": 1,
          "explain": "The CPU and GPU overlap, so the slower stage (9.4 ms) sets frame time, exceeding the 8.3 ms budget. Optimising the CPU, which already fits, would not change the result."
        },
        {
          "q": "Why does an accumulator-based fixed timestep interpolate between the previous and current simulation states when rendering?",
          "options": [
            "Because the physics solver needs interpolated states in order to remain stable across steps.",
            "Because render frames land between ticks, so drawing the latest tick alone makes motion judder.",
            "Because interpolation allows the simulation itself to run fewer steps per second overall.",
            "Because the GPU cannot read any state that the CPU wrote during the current tick."
          ],
          "answer": 1,
          "explain": "Render and simulation rates do not align, so the leftover accumulator fraction is the position between ticks. Interpolation only affects what is drawn, never the simulation itself."
        },
        {
          "q": "After a 3-second stall (the app was backgrounded), a game with a fixed 1/60 s step and no clamp becomes unresponsive for several seconds. Which change fixes it?",
          "options": [
            "Shorten the fixed step so each iteration is cheaper.",
            "Switch the whole game to a variable timestep.",
            "Cap the frame time added to the accumulator, for example at 0.25 s.",
            "Enable vsync so the stall is absorbed by the swap chain."
          ],
          "answer": 2,
          "explain": "Without a cap the loop owes 180 steps and if each costs more than its step length it never catches up. A smaller step makes the debt larger, and vsync does not affect simulation catch-up."
        },
        {
          "q": "A 60 Hz game with vsync averages 55 fps but players report stutter. The frame-time graph shows mostly 16.6 ms frames with frequent 33.3 ms spikes. What explains this?",
          "options": [
            "Some frames miss a vsync slot and stay on screen for two refreshes, which makes pacing uneven.",
            "The average fps is below the refresh rate, which stops vsync from functioning correctly.",
            "The fixed timestep is running too many simulation steps on every rendered frame.",
            "Tearing appears because vsync switches itself off at random whenever the load rises."
          ],
          "answer": 0,
          "explain": "A frame finishing just after a refresh waits for the next one, doubling its on-screen time. The average hides the unevenness, which is why frame-time graphs and 1% lows matter."
        },
        {
          "q": "A character jumps 2.1 m high at 60 fps but 2.4 m at 144 fps. The jump is integrated each rendered frame with `velocity += gravity * dt`. What is the best fix?",
          "options": [
            "Multiply gravity by a tuned constant for high refresh rates.",
            "Cap the game at 60 fps on all devices.",
            "Interpolate the character's rendered position more aggressively.",
            "Integrate the jump in a fixed-step update so the same dt is used every tick."
          ],
          "answer": 3,
          "explain": "Explicit integration error depends on dt, so different frame rates give different trajectories. Fixed steps remove that dependency; capping fps or tuning constants hides the symptom on only some devices."
        },
        {
          "q": "A bullet-hell scene has 20,000 bullets, each a script with its own `Update`. The profiler shows the frame dominated by tiny per-object calls, not by the work inside them. Which approach fits best?",
          "options": [
            "A fixed timestep driven by a time accumulator",
            "One manager that loops over an array of bullet data",
            "A double buffer holding the bullet states per frame",
            "An event queue handling the bullet spawn requests"
          ],
          "answer": 1,
          "explain": "A single update loop over contiguous data removes per-object call overhead and engine dispatch. A fixed timestep fixes frame-rate dependence and double buffering fixes update-order bias, neither of which reduces call count."
        }
      ]
    },
    {
      "id": "engines-entity-architecture",
      "title": "Entity architecture: components to ECS",
      "minutes": 13,
      "summary": "How engines organise game objects, from inheritance trees to components to data-oriented ECS, and what memory layout has to do with it.",
      "lesson": [
        {
          "type": "p",
          "text": "A designer asks for a flying explosive barrel that can be picked up, shot, and ridden. In a classic object-oriented design the programmer looks at the class tree: Barrel derives from Prop, Enemy from Character, Vehicle from Actor. A flying barrel that is also rideable needs behaviour from three branches. Developers hit this wall in every engine generation, which is why the industry moved from inheritance to composition and, for high object counts, to data-oriented design."
        },
        {
          "type": "h",
          "text": "Deep inheritance and its limits"
        },
        {
          "type": "p",
          "text": "Early engines modelled the world as a class hierarchy: `Entity > Actor > Character > Enemy > FlyingEnemy > BossFlyingEnemy`. The appeal is obvious, shared code lives in base classes. The failures are structural. Behaviour can only be shared along one axis, so cross-cutting features (can be damaged, can burn, can be carried) get hoisted into ever-bigger base classes until `Entity` is a thousand-line god object. Changing a base class risks every descendant. Designers cannot make new combinations without a programmer. The diamond problem pushes people toward multiple inheritance, which most languages in games avoid."
        },
        {
          "type": "h",
          "text": "Component-based design"
        },
        {
          "type": "p",
          "text": "The mainstream answer is **composition**: an entity is little more than an identity, and its behaviour comes from attached **components**, each of which does one thing (`Health`, `Rigidbody`, `Pickup`, `FlightController`). A flying rideable barrel becomes a barrel mesh plus those components. Unity's GameObject/MonoBehaviour model and Unreal's Actor/ActorComponent model both follow this pattern. The wins: designers combine behaviours in the editor, code is reused without hierarchy, and new features are added as new components instead of edits to base classes."
        },
        {
          "type": "figure",
          "id": "engines-ecs-inherit-vs-compose",
          "caption": "A class tree shares behaviour along one axis, so the flying rideable barrel needs three parents; composition just attaches the components it needs to one entity.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 314\" role=\"img\" aria-label=\"Left: a class tree Actor, Prop, Character, Vehicle, Barrel, Enemy where a flying rideable barrel would need three parents. Right: entity 42 built by attaching Mesh, Health, Rigidbody, Pickup and FlightController components\"><style>.engines-ecs-inherit-vs-compose-t{font-size:13px;fill:var(--fig-ink)}.engines-ecs-inherit-vs-compose-m{font-size:13px;fill:var(--fig-muted)}.engines-ecs-inherit-vs-compose-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-ecs-inherit-vs-compose-c{text-anchor:middle}.engines-ecs-inherit-vs-compose-e{text-anchor:end}.engines-ecs-inherit-vs-compose-k0{animation:engines-ecs-inherit-vs-compose-a0 7s ease-out infinite}@keyframes engines-ecs-inherit-vs-compose-a0{0%{opacity:1;transform:translateX(0)}4%,16%{opacity:0;transform:translateX(36px)}23%,100%{opacity:1;transform:translateX(0)}}.engines-ecs-inherit-vs-compose-k1{animation:engines-ecs-inherit-vs-compose-a1 7s ease-out infinite}@keyframes engines-ecs-inherit-vs-compose-a1{0%{opacity:1;transform:translateX(0)}4%,28%{opacity:0;transform:translateX(36px)}35%,100%{opacity:1;transform:translateX(0)}}.engines-ecs-inherit-vs-compose-k2{animation:engines-ecs-inherit-vs-compose-a2 7s ease-out infinite}@keyframes engines-ecs-inherit-vs-compose-a2{0%{opacity:1;transform:translateX(0)}4%,40%{opacity:0;transform:translateX(36px)}47%,100%{opacity:1;transform:translateX(0)}}.engines-ecs-inherit-vs-compose-k3{animation:engines-ecs-inherit-vs-compose-a3 7s ease-out infinite}@keyframes engines-ecs-inherit-vs-compose-a3{0%{opacity:1;transform:translateX(0)}4%,52%{opacity:0;transform:translateX(36px)}59%,100%{opacity:1;transform:translateX(0)}}.engines-ecs-inherit-vs-compose-k4{animation:engines-ecs-inherit-vs-compose-a4 7s ease-out infinite}@keyframes engines-ecs-inherit-vs-compose-a4{0%{opacity:1;transform:translateX(0)}4%,64%{opacity:0;transform:translateX(36px)}71%,100%{opacity:1;transform:translateX(0)}}.engines-ecs-inherit-vs-compose-q{animation:engines-ecs-inherit-vs-compose-qp 7s ease-in-out infinite}@keyframes engines-ecs-inherit-vs-compose-qp{0%,100%{opacity:1}50%{opacity:0.45}}</style><text class=\"engines-ecs-inherit-vs-compose-h\" x=\"20\" y=\"24\">Inheritance: one axis of reuse</text><line x1=\"165\" y1=\"72\" x2=\"60\" y2=\"110\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><line x1=\"165\" y1=\"72\" x2=\"165\" y2=\"110\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><line x1=\"165\" y1=\"72\" x2=\"270\" y2=\"110\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><line x1=\"60\" y1=\"142\" x2=\"60\" y2=\"180\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><line x1=\"165\" y1=\"142\" x2=\"165\" y2=\"180\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><rect x=\"117\" y=\"40\" width=\"96\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t engines-ecs-inherit-vs-compose-c\" x=\"165\" y=\"61\">Actor</text><rect x=\"12\" y=\"110\" width=\"96\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t engines-ecs-inherit-vs-compose-c\" x=\"60\" y=\"131\">Prop</text><rect x=\"117\" y=\"110\" width=\"96\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t engines-ecs-inherit-vs-compose-c\" x=\"165\" y=\"131\">Character</text><rect x=\"222\" y=\"110\" width=\"96\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t engines-ecs-inherit-vs-compose-c\" x=\"270\" y=\"131\">Vehicle</text><rect x=\"12\" y=\"180\" width=\"96\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t engines-ecs-inherit-vs-compose-c\" x=\"60\" y=\"201\">Barrel</text><rect x=\"117\" y=\"180\" width=\"96\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t engines-ecs-inherit-vs-compose-c\" x=\"165\" y=\"201\">Enemy</text><g class=\"engines-ecs-inherit-vs-compose-q\"><path d=\"M100 252 L66 216 M165 252 L165 216 M230 252 L268 146\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" stroke-dasharray=\"5 4\" fill=\"none\"/><rect x=\"70\" y=\"252\" width=\"190\" height=\"36\" rx=\"10\" fill=\"var(--fig-bad)\" fill-opacity=\"0.12\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" stroke-dasharray=\"5 4\"/><text class=\"engines-ecs-inherit-vs-compose-t engines-ecs-inherit-vs-compose-c\" x=\"165\" y=\"275\">Flying rideable barrel ?</text></g><text class=\"engines-ecs-inherit-vs-compose-m engines-ecs-inherit-vs-compose-c\" x=\"165\" y=\"305\" style=\"fill:var(--fig-bad)\">needs 3 parents</text><line x1=\"330\" y1=\"16\" x2=\"330\" y2=\"300\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-h\" x=\"352\" y=\"24\">Composition: attach components</text><rect x=\"352\" y=\"40\" width=\"268\" height=\"258\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-h\" x=\"370\" y=\"66\">Entity #42</text><text class=\"engines-ecs-inherit-vs-compose-m engines-ecs-inherit-vs-compose-e\" x=\"604\" y=\"66\">just an identity</text><g class=\"engines-ecs-inherit-vs-compose-k0\"><rect x=\"370\" y=\"80\" width=\"232\" height=\"34\" rx=\"8\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t\" x=\"386\" y=\"102\">Mesh: barrel</text></g><g class=\"engines-ecs-inherit-vs-compose-k1\"><rect x=\"370\" y=\"122\" width=\"232\" height=\"34\" rx=\"8\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t\" x=\"386\" y=\"144\">Health</text></g><g class=\"engines-ecs-inherit-vs-compose-k2\"><rect x=\"370\" y=\"164\" width=\"232\" height=\"34\" rx=\"8\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t\" x=\"386\" y=\"186\">Rigidbody</text></g><g class=\"engines-ecs-inherit-vs-compose-k3\"><rect x=\"370\" y=\"206\" width=\"232\" height=\"34\" rx=\"8\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t\" x=\"386\" y=\"228\">Pickup</text></g><g class=\"engines-ecs-inherit-vs-compose-k4\"><rect x=\"370\" y=\"248\" width=\"232\" height=\"34\" rx=\"8\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-inherit-vs-compose-t\" x=\"386\" y=\"270\">FlightController</text></g></svg>"
        },
        {
          "type": "p",
          "text": "But classic component systems, including Unity's MonoBehaviour model, are still object-oriented underneath. Each component is a separately allocated heap object with its own `Update` method, invoked individually by the engine (in Unity, one native-to-managed call per object per callback), and a typical gameplay component touches other components through pointers. Scaling that to tens of thousands of objects runs into the hardware, not the design."
        },
        {
          "type": "h",
          "text": "Why memory layout dominates"
        },
        {
          "type": "p",
          "text": "A modern CPU runs at several GHz, but reading from main memory takes on the order of 100 ns, hundreds of cycles. To hide that, the CPU loads memory in **cache lines** of 64 bytes (128 on some Apple designs) and keeps recently used lines in L1, L2 and L3 caches. L1 is a few cycles away, L2 about ten, L3 tens, RAM hundreds. So the speed of a loop is determined less by instruction count than by how many cache lines it touches and whether the hardware prefetcher can predict the next ones. Linear, contiguous reads are the fastest possible access pattern. Chasing pointers to scattered heap objects is the slowest, because each hop is a potential cache miss."
        },
        {
          "type": "code",
          "lang": "cpp",
          "text": "// Array of Structures: each Enemy is 120 bytes\nstruct Enemy {\n    Vec3 pos, vel;      // 24 bytes used by movement\n    float health;\n    char  name[32];     // cold data\n    AIState ai;         // more cold data\n    /* ... */\n};\nstd::vector<Enemy> enemies;\nfor (auto& e : enemies) e.pos += e.vel * dt;\n// Each iteration reads 24 useful bytes but drags in a whole\n// 64-byte line; only ~20-40% of fetched bytes are used.\n\n// Structure of Arrays: only the data movement needs\nstd::vector<Vec3> pos, vel;\nfor (size_t i = 0; i < pos.size(); ++i) pos[i] += vel[i] * dt;\n// Contiguous, prefetch-friendly, SIMD-friendly: often 3-10x faster."
        },
        {
          "type": "figure",
          "id": "engines-ecs-aos-soa",
          "caption": "Drawn at one pixel per byte: AoS drags in 7 cache lines to move 5 enemies, while SoA arrays move 42 enemies with 16 lines and use nearly every fetched byte.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 316\" role=\"img\" aria-label=\"Memory drawn to scale at one pixel per byte: an array of 120-byte Enemy structs needs 7 cache lines to move 5 enemies and uses 27 percent of the fetched bytes, while separate pos and vel arrays move 42 enemies with 16 lines and use nearly all of them\"><style>.engines-ecs-aos-soa-t{font-size:13px;fill:var(--fig-ink)}.engines-ecs-aos-soa-m{font-size:13px;fill:var(--fig-muted)}.engines-ecs-aos-soa-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-ecs-aos-soa-c{text-anchor:middle}.engines-ecs-aos-soa-e{text-anchor:end}.engines-ecs-aos-soa-L0{animation:engines-ecs-aos-soa-l0 6s linear infinite}@keyframes engines-ecs-aos-soa-l0{0%{opacity:1}3%,8%{opacity:0}9%{opacity:1;fill-opacity:1}14%,92%{opacity:1;fill-opacity:0.5}100%{opacity:1}}.engines-ecs-aos-soa-L1{animation:engines-ecs-aos-soa-l1 6s linear infinite}@keyframes engines-ecs-aos-soa-l1{0%{opacity:1}3%,17%{opacity:0}18%{opacity:1;fill-opacity:1}23%,92%{opacity:1;fill-opacity:0.5}100%{opacity:1}}.engines-ecs-aos-soa-L2{animation:engines-ecs-aos-soa-l2 6s linear infinite}@keyframes engines-ecs-aos-soa-l2{0%{opacity:1}3%,26%{opacity:0}27%{opacity:1;fill-opacity:1}32%,92%{opacity:1;fill-opacity:0.5}100%{opacity:1}}.engines-ecs-aos-soa-L3{animation:engines-ecs-aos-soa-l3 6s linear infinite}@keyframes engines-ecs-aos-soa-l3{0%{opacity:1}3%,35%{opacity:0}36%{opacity:1;fill-opacity:1}41%,92%{opacity:1;fill-opacity:0.5}100%{opacity:1}}.engines-ecs-aos-soa-L4{animation:engines-ecs-aos-soa-l4 6s linear infinite}@keyframes engines-ecs-aos-soa-l4{0%{opacity:1}3%,44%{opacity:0}45%{opacity:1;fill-opacity:1}50%,92%{opacity:1;fill-opacity:0.5}100%{opacity:1}}.engines-ecs-aos-soa-L5{animation:engines-ecs-aos-soa-l5 6s linear infinite}@keyframes engines-ecs-aos-soa-l5{0%{opacity:1}3%,53%{opacity:0}54%{opacity:1;fill-opacity:1}59%,92%{opacity:1;fill-opacity:0.5}100%{opacity:1}}.engines-ecs-aos-soa-L6{animation:engines-ecs-aos-soa-l6 6s linear infinite}@keyframes engines-ecs-aos-soa-l6{0%{opacity:1}3%,62%{opacity:0}63%{opacity:1;fill-opacity:1}68%,92%{opacity:1;fill-opacity:0.5}100%{opacity:1}}.engines-ecs-aos-soa-L7{animation:engines-ecs-aos-soa-l7 6s linear infinite}@keyframes engines-ecs-aos-soa-l7{0%{opacity:1}3%,71%{opacity:0}72%{opacity:1;fill-opacity:1}77%,92%{opacity:1;fill-opacity:0.5}100%{opacity:1}}</style><text class=\"engines-ecs-aos-soa-h\" x=\"24\" y=\"24\">Array of Structures: 120-byte Enemy, loop reads pos + vel</text><text class=\"engines-ecs-aos-soa-m engines-ecs-aos-soa-e\" x=\"616\" y=\"44\">1 px = 1 byte, 64-byte cache lines</text><defs><clipPath id=\"engines-ecs-aos-soa-clip\"><rect x=\"64\" y=\"40\" width=\"512\" height=\"260\"/></clipPath></defs><path d=\"M64 48v5M64 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M128 48v5M128 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M192 48v5M192 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M256 48v5M256 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M320 48v5M320 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M384 48v5M384 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M448 48v5M448 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M512 48v5M512 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M576 48v5M576 89v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L0\" x=\"65\" y=\"50\" width=\"62\" height=\"42\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L1\" x=\"129\" y=\"50\" width=\"62\" height=\"42\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L2\" x=\"193\" y=\"50\" width=\"62\" height=\"42\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L3\" x=\"257\" y=\"50\" width=\"62\" height=\"42\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L4\" x=\"321\" y=\"50\" width=\"62\" height=\"42\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L5\" x=\"385\" y=\"50\" width=\"62\" height=\"42\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L7\" x=\"513\" y=\"50\" width=\"62\" height=\"42\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><g clip-path=\"url(#engines-ecs-aos-soa-clip)\"><rect x=\"64.75\" y=\"54\" width=\"22.5\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.75\"/><rect x=\"88.75\" y=\"54.75\" width=\"94.5\" height=\"32.5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-aos-soa-m engines-ecs-aos-soa-c\" x=\"136\" y=\"76\">Enemy 0</text><rect x=\"184.75\" y=\"54\" width=\"22.5\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.75\"/><rect x=\"208.75\" y=\"54.75\" width=\"94.5\" height=\"32.5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-aos-soa-m engines-ecs-aos-soa-c\" x=\"256\" y=\"76\">Enemy 1</text><rect x=\"304.75\" y=\"54\" width=\"22.5\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.75\"/><rect x=\"328.75\" y=\"54.75\" width=\"94.5\" height=\"32.5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-aos-soa-m engines-ecs-aos-soa-c\" x=\"376\" y=\"76\">Enemy 2</text><rect x=\"424.75\" y=\"54\" width=\"22.5\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.75\"/><rect x=\"448.75\" y=\"54.75\" width=\"94.5\" height=\"32.5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-aos-soa-m engines-ecs-aos-soa-c\" x=\"496\" y=\"76\">Enemy 3</text><rect x=\"544.75\" y=\"54\" width=\"22.5\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.75\"/><rect x=\"568.75\" y=\"54.75\" width=\"94.5\" height=\"32.5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/></g><rect x=\"64\" y=\"104\" width=\"12\" height=\"12\" rx=\"2\" fill=\"var(--fig-accent)\" fill-opacity=\"0.75\"/><text class=\"engines-ecs-aos-soa-t\" x=\"82\" y=\"115\">pos + vel, 24 B used</text><rect x=\"254\" y=\"104\" width=\"12\" height=\"12\" rx=\"2\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-aos-soa-t\" x=\"272\" y=\"115\">name, ai, ... 96 B cold</text><rect x=\"450\" y=\"104\" width=\"12\" height=\"12\" rx=\"2\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><text class=\"engines-ecs-aos-soa-t\" x=\"468\" y=\"115\">line loaded</text><text class=\"engines-ecs-aos-soa-t\" x=\"64\" y=\"140\">7 lines (448 B) fetched to move 5 enemies: 120 B useful, <tspan style=\"fill:var(--fig-bad)\">27%</tspan></text><text class=\"engines-ecs-aos-soa-h\" x=\"24\" y=\"180\">Structure of Arrays: only pos[] and vel[]</text><text class=\"engines-ecs-aos-soa-t engines-ecs-aos-soa-e\" x=\"54\" y=\"213\">pos[]</text><path d=\"M64 188v5M64 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M128 188v5M128 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M192 188v5M192 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M256 188v5M256 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M320 188v5M320 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M384 188v5M384 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M448 188v5M448 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M512 188v5M512 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M576 188v5M576 223v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L0\" x=\"65\" y=\"190\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L1\" x=\"129\" y=\"190\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L2\" x=\"193\" y=\"190\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L3\" x=\"257\" y=\"190\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L4\" x=\"321\" y=\"190\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L5\" x=\"385\" y=\"190\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L6\" x=\"449\" y=\"190\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L7\" x=\"513\" y=\"190\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect x=\"64\" y=\"194\" width=\"512\" height=\"28\" fill=\"var(--fig-accent)\" fill-opacity=\"0.85\"/><path d=\"M76 194v28M88 194v28M100 194v28M112 194v28M124 194v28M136 194v28M148 194v28M160 194v28M172 194v28M184 194v28M196 194v28M208 194v28M220 194v28M232 194v28M244 194v28M256 194v28M268 194v28M280 194v28M292 194v28M304 194v28M316 194v28M328 194v28M340 194v28M352 194v28M364 194v28M376 194v28M388 194v28M400 194v28M412 194v28M424 194v28M436 194v28M448 194v28M460 194v28M472 194v28M484 194v28M496 194v28M508 194v28M520 194v28M532 194v28M544 194v28M556 194v28M568 194v28\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-aos-soa-t engines-ecs-aos-soa-e\" x=\"54\" y=\"257\">vel[]</text><path d=\"M64 232v5M64 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M128 232v5M128 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M192 232v5M192 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M256 232v5M256 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M320 232v5M320 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M384 232v5M384 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M448 232v5M448 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M512 232v5M512 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><path d=\"M576 232v5M576 267v5\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L0\" x=\"65\" y=\"234\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L1\" x=\"129\" y=\"234\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L2\" x=\"193\" y=\"234\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L3\" x=\"257\" y=\"234\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L4\" x=\"321\" y=\"234\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L5\" x=\"385\" y=\"234\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L6\" x=\"449\" y=\"234\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect class=\"engines-ecs-aos-soa-L7\" x=\"513\" y=\"234\" width=\"62\" height=\"36\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\"/><rect x=\"64\" y=\"238\" width=\"512\" height=\"28\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.85\"/><path d=\"M76 238v28M88 238v28M100 238v28M112 238v28M124 238v28M136 238v28M148 238v28M160 238v28M172 238v28M184 238v28M196 238v28M208 238v28M220 238v28M232 238v28M244 238v28M256 238v28M268 238v28M280 238v28M292 238v28M304 238v28M316 238v28M328 238v28M340 238v28M352 238v28M364 238v28M376 238v28M388 238v28M400 238v28M412 238v28M424 238v28M436 238v28M448 238v28M460 238v28M472 238v28M484 238v28M496 238v28M508 238v28M520 238v28M532 238v28M544 238v28M556 238v28M568 238v28\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-aos-soa-t\" x=\"64\" y=\"300\">16 lines (1 KB) fetched to move 42 enemies: <tspan style=\"fill:var(--fig-ok)\">~100%</tspan> useful, prefetch-friendly</text></svg>"
        },
        {
          "type": "h",
          "text": "Data-oriented design and ECS"
        },
        {
          "type": "p",
          "text": "**Data-oriented design** starts from the question 'what data does this transformation read and write, and in what quantity?' rather than 'what object is this?'. **ECS** (Entity Component System) is its common game architecture: **entities** are just IDs; **components** are plain data with no behaviour (`Position`, `Velocity`); **systems** are functions that run over all entities having a particular set of components. A `MovementSystem` iterates every entity with Position and Velocity in one tight loop."
        },
        {
          "type": "p",
          "text": "Many production ECS implementations (Unity Entities, Bevy, flecs) store data in **archetypes**; others, such as EnTT, use per-component sparse sets instead, which make adding and removing components cheaper but iteration over several components less linear. In the archetype model there is one archetype per unique combination of component types. All entities with exactly {Position, Velocity, Health} live in one archetype table, split into fixed-size **chunks** (Unity Entities uses 16 KB chunks) in which each component type is a contiguous array. A query for Position and Velocity visits only matching archetypes and walks each chunk linearly. Adding or removing a component changes the entity's archetype, which means copying its data to another table: a **structural change** that costs far more than writing a value and is deferred through command buffers to stay thread-safe."
        },
        {
          "type": "figure",
          "id": "engines-ecs-archetype-chunks",
          "caption": "The query walks only archetypes that have Position and Velocity, one contiguous array at a time; adding Health moves the entity into another table, a structural change.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 380\" role=\"img\" aria-label=\"Three archetype tables, each a chunk with one contiguous array per component. A Position plus Velocity query walks the first two linearly and skips the Position plus Render table; adding Health to an entity copies its row into the other table\"><style>.engines-ecs-archetype-chunks-t{font-size:13px;fill:var(--fig-ink)}.engines-ecs-archetype-chunks-m{font-size:13px;fill:var(--fig-muted)}.engines-ecs-archetype-chunks-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-ecs-archetype-chunks-c{text-anchor:middle}.engines-ecs-archetype-chunks-e{text-anchor:end}.engines-ecs-archetype-chunks-q0{opacity:0;animation:engines-ecs-archetype-chunks-w0 8s linear infinite}@keyframes engines-ecs-archetype-chunks-w0{0%,5%{opacity:0;transform:translateX(0)}6%{opacity:1;transform:translateX(0)}26%{opacity:1;transform:translateX(132px)}27%,100%{opacity:0;transform:translateX(132px)}}.engines-ecs-archetype-chunks-q1{opacity:0;animation:engines-ecs-archetype-chunks-w1 8s linear infinite}@keyframes engines-ecs-archetype-chunks-w1{0%,29%{opacity:0;transform:translateX(0)}30%{opacity:1;transform:translateX(0)}46%{opacity:1;transform:translateX(110px)}47%,100%{opacity:0;transform:translateX(110px)}}.engines-ecs-archetype-chunks-mv{animation:engines-ecs-archetype-chunks-m 8s ease-in-out infinite}@keyframes engines-ecs-archetype-chunks-m{0%{transform:translate(0,0);opacity:1}3%{transform:translate(0,0);opacity:0}3.5%,52%{transform:translate(22px,-110px);opacity:0}56%,62%{transform:translate(22px,-110px);opacity:1}80%,100%{transform:translate(0,0);opacity:1}}.engines-ecs-archetype-chunks-hp{animation:engines-ecs-archetype-chunks-h 8s linear infinite}@keyframes engines-ecs-archetype-chunks-h{0%{opacity:1}3%,80%{opacity:0}84%,100%{opacity:1}}</style><text class=\"engines-ecs-archetype-chunks-h\" x=\"24\" y=\"24\">Query: Position + Velocity</text><text class=\"engines-ecs-archetype-chunks-m engines-ecs-archetype-chunks-e\" x=\"616\" y=\"24\">each archetype stores 16 KB chunks</text><rect x=\"16\" y=\"40\" width=\"608\" height=\"88\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-archetype-chunks-h\" x=\"30\" y=\"64\">{Position, Velocity}</text><text class=\"engines-ecs-archetype-chunks-t engines-ecs-archetype-chunks-e\" x=\"610\" y=\"64\" style=\"fill:var(--fig-ok)\">matches: walked linearly</text><text class=\"engines-ecs-archetype-chunks-t\" x=\"30\" y=\"89\">Position</text><rect x=\"141\" y=\"74\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"163\" y=\"74\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"185\" y=\"74\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"207\" y=\"74\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"229\" y=\"74\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"251\" y=\"74\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"273\" y=\"74\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"295.75\" y=\"74.75\" width=\"194.5\" height=\"18.5\" rx=\"3\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><text class=\"engines-ecs-archetype-chunks-t\" x=\"30\" y=\"113\">Velocity</text><rect x=\"141\" y=\"98\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"163\" y=\"98\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"185\" y=\"98\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"207\" y=\"98\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"229\" y=\"98\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"251\" y=\"98\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"273\" y=\"98\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"295.75\" y=\"98.75\" width=\"194.5\" height=\"18.5\" rx=\"3\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><rect class=\"engines-ecs-archetype-chunks-q0\" x=\"139\" y=\"70\" width=\"24\" height=\"52\" rx=\"4\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/><rect x=\"16\" y=\"150\" width=\"608\" height=\"112\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-ecs-archetype-chunks-h\" x=\"30\" y=\"174\">{Position, Velocity, Health}</text><text class=\"engines-ecs-archetype-chunks-t engines-ecs-archetype-chunks-e\" x=\"610\" y=\"174\" style=\"fill:var(--fig-ok)\">matches: walked linearly</text><text class=\"engines-ecs-archetype-chunks-t\" x=\"30\" y=\"199\">Position</text><rect x=\"141\" y=\"184\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"163\" y=\"184\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"185\" y=\"184\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"207\" y=\"184\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"229\" y=\"184\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"251\" y=\"184\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.55\"/><rect x=\"295.75\" y=\"184.75\" width=\"194.5\" height=\"18.5\" rx=\"3\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><text class=\"engines-ecs-archetype-chunks-t\" x=\"30\" y=\"223\">Velocity</text><rect x=\"141\" y=\"208\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"163\" y=\"208\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"185\" y=\"208\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"207\" y=\"208\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"229\" y=\"208\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"251\" y=\"208\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><rect x=\"295.75\" y=\"208.75\" width=\"194.5\" height=\"18.5\" rx=\"3\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><text class=\"engines-ecs-archetype-chunks-t\" x=\"30\" y=\"247\">Health</text><rect x=\"141\" y=\"232\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.18\"/><rect x=\"163\" y=\"232\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.18\"/><rect x=\"185\" y=\"232\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.18\"/><rect x=\"207\" y=\"232\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.18\"/><rect x=\"229\" y=\"232\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.18\"/><rect x=\"251\" y=\"232\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.18\"/><rect x=\"295.75\" y=\"232.75\" width=\"194.5\" height=\"18.5\" rx=\"3\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><rect class=\"engines-ecs-archetype-chunks-q1\" x=\"139\" y=\"180\" width=\"24\" height=\"76\" rx=\"4\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/><rect x=\"16\" y=\"278\" width=\"608\" height=\"88\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"5 4\"/><text class=\"engines-ecs-archetype-chunks-h\" x=\"30\" y=\"302\">{Position, Render}</text><text class=\"engines-ecs-archetype-chunks-m engines-ecs-archetype-chunks-e\" x=\"610\" y=\"302\">no Velocity: skipped</text><text class=\"engines-ecs-archetype-chunks-m\" x=\"30\" y=\"327\">Position</text><rect x=\"141\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"163\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"185\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"207\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"229\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"251\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"273\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"295\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"317\" y=\"312\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\"/><rect x=\"339.75\" y=\"312.75\" width=\"150.5\" height=\"18.5\" rx=\"3\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><text class=\"engines-ecs-archetype-chunks-m\" x=\"30\" y=\"351\">Render</text><rect x=\"141\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"163\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"185\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"207\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"229\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"251\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"273\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"295\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"317\" y=\"336\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-ink)\" fill-opacity=\"0.12\"/><rect x=\"339.75\" y=\"336.75\" width=\"150.5\" height=\"18.5\" rx=\"3\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><rect class=\"engines-ecs-archetype-chunks-hp\" x=\"273\" y=\"232\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.6\"/><g class=\"engines-ecs-archetype-chunks-mv\"><rect x=\"273\" y=\"184\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.6\"/><rect x=\"273\" y=\"208\" width=\"20\" height=\"20\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.6\"/></g><text class=\"engines-ecs-archetype-chunks-t\" x=\"506\" y=\"199\" style=\"fill:var(--fig-warn)\">AddComponent</text><text class=\"engines-ecs-archetype-chunks-t\" x=\"506\" y=\"217\" style=\"fill:var(--fig-warn)\">(Health):</text><text class=\"engines-ecs-archetype-chunks-m\" x=\"506\" y=\"235\">row copied to</text><text class=\"engines-ecs-archetype-chunks-m\" x=\"506\" y=\"253\">another table</text></svg>"
        },
        {
          "type": "list",
          "items": [
            "Pros of ECS: cache-friendly iteration, trivially parallel systems when read/write sets do not overlap, batch-friendly for SIMD and job systems, and easier serialisation of pure data.",
            "Cons: more boilerplate for one-off behaviours, harder debugging of 'who changed this', awkward for rare unique objects such as a single boss, and entity-to-entity references are IDs that can go stale.",
            "Hybrid is normal: GameObjects for authoring and unique objects, ECS for bulk simulation like crowds, bullets, particles-with-logic.",
            "The ECS win is proportional to entity count. At 200 objects, the architecture hardly matters; at 200,000 it is the project."
          ]
        },
        {
          "type": "h",
          "text": "Worked estimate"
        },
        {
          "type": "p",
          "text": "Say you move 100,000 agents each frame. With scattered heap objects at roughly one cache miss per agent at about 100 ns, you spend 10 ms on memory stalls alone, over half of a 16.6 ms frame. With SoA/archetype layout, positions and velocities are 12 bytes each, so 100,000 agents is 2.4 MB read linearly, a few hundred microseconds at memory bandwidth, and the loop can be vectorised and split across cores. The same logical operation can differ by 20x depending only on layout."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Before rewriting anything as ECS, profile. If the cost is in rendering, physics or a single slow algorithm, architecture will not help. ECS pays when you have many similar entities doing the same cheap work every frame."
        },
        {
          "type": "list",
          "items": [
            "Misconception: components alone equal ECS. MonoBehaviour components hold data and behaviour together and live as scattered objects; ECS separates them and packs the data.",
            "Misconception: ECS is always faster. Random access by entity ID, frequent structural changes and tiny entity counts can make it slower or no better.",
            "Pitfall: putting large or rarely used data in a hot component bloats every chunk; keep hot components small and split cold data out."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents default to object-oriented patterns: a `List<Enemy>` with per-object `Update()`, `GetComponent` calls inside loops, LINQ in hot paths. If you need scale, tell the agent the entity count target, the framework (GameObjects vs Entities), and ask for the memory layout reasoning explicitly. Verify claims of speedup with a profiler capture, since agents tend to assert 'ECS is faster' without measurement, and check generated ECS code for structural changes inside iteration."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A new feature needs behaviour from two branches of the class tree, or the base class is a thousand-line god object",
              "use": "Component (composition over inheritance)",
              "why": "Entities become containers of small single-purpose components that designers combine freely. Costs indirection and cross-component lookups; inter-component dependencies must be explicit."
            },
            {
              "signal": "Tens of thousands of similar entities are updated each frame and the profiler shows the loop is memory-bound",
              "use": "Entity-Component-System",
              "why": "Separating identity, data and systems lets each system stream over packed component arrays and parallelise. Overkill for a few hundred unique authored objects, and debugging is less direct."
            },
            {
              "signal": "A hot loop touches only position and velocity but walks 128-byte objects or pointers scattered across the heap",
              "use": "Data Locality (structure of arrays)",
              "why": "Store each field contiguously so every 64-byte cache line is full of data the loop needs and the prefetcher can run ahead. Can give an order of magnitude; makes per-object access and insertion more awkward."
            },
            {
              "signal": "A struct mixes fields read every frame with large fields read rarely, like names, debug info or spawn data",
              "use": "Hot/cold data splitting",
              "why": "Move rarely used fields into a separate array or side table so hot iteration loads fewer cache lines. Adds an index or lookup when the cold data is needed."
            },
            {
              "signal": "A system adds or removes components on thousands of entities while it is iterating them",
              "use": "Deferred structural changes (command buffer)",
              "why": "Record add, remove and destroy operations and play them back at a sync point, so archetype moves do not invalidate iteration or happen one by one. Changes are not visible until playback."
            },
            {
              "signal": "A game mixes 300 unique hand-authored props with a 150,000-bullet boss pattern",
              "use": "Hybrid: GameObjects plus ECS for hot spots",
              "why": "Keep authored, one-off objects in the familiar component model and move only the massive, uniform populations to ECS. Needs a clear boundary and sync between the two worlds."
            },
            {
              "signal": "Every new enemy kind is a new subclass that only changes numbers like health, speed and loot",
              "use": "Type Object",
              "why": "Make the kind a data asset (for example a ScriptableObject or table row) that instances reference, so designers add kinds without code. Behaviour that differs in logic still needs code or a scripting layer."
            },
            {
              "signal": "Designers want to spawn many configured copies of an authored object, with per-level variants",
              "use": "Prototype (prefabs and variants)",
              "why": "Clone a fully configured template instead of building objects in code; variants inherit from a base and override fields. Deep variant chains become hard to reason about, so keep them shallow."
            },
            {
              "signal": "Dozens of ability subclasses each call engine systems in their own way and coupling to physics, audio and VFX keeps spreading",
              "use": "Subclass Sandbox",
              "why": "A base class exposes a small protected set of operations (play sound, spawn effect, move) and subclasses implement one `Activate` using only those. Coupling is concentrated in the base, which can grow large."
            },
            {
              "signal": "Several systems must react when an entity dies, and the health code should not reference UI, audio or quests",
              "use": "Observer / event bus",
              "why": "The source raises an event and listeners subscribe, so new reactions need no change to the source. Order and flow get harder to trace, and listeners that outlive their targets leak unless they unsubscribe."
            },
            {
              "signal": "Gameplay code calls `AudioManager.Instance` everywhere and tests cannot swap the real service out",
              "use": "Service Locator over singleton",
              "why": "Code asks a registry for an interface, so you can provide a null, logging or test implementation. Still a global dependency in disguise; constructor injection is clearer where you control creation."
            },
            {
              "signal": "Designers keep asking programmers for small rule changes to abilities or quests, each needing a rebuild",
              "use": "Bytecode / data-driven behaviour",
              "why": "Express behaviour as data (graphs, tables, a small instruction set or a scripting language) interpreted at runtime, so content changes ship without code changes. Interpreters are slower and need tooling and validation."
            }
          ]
        }
      ],
      "keyPoints": [
        "Deep inheritance trees fail on cross-cutting behaviour; composition of components is the mainstream fix.",
        "Cache lines (64 bytes) and prefetching mean contiguous, tightly packed data beats pointer chasing, often by an order of magnitude.",
        "ECS separates identity (entity), data (components) and logic (systems); archetypes store each component type contiguously in chunks.",
        "Structural changes (adding or removing components) move data between archetypes and are expensive.",
        "Use ECS for large counts of similar entities; keep hybrid designs for unique, authored objects."
      ],
      "quiz": [
        {
          "q": "A team has an inheritance tree Character > Enemy > FlyingEnemy, and now needs a flying ally that can also be carried. Which problem is this showing?",
          "options": [
            "Virtual function overhead makes any deep class tree too slow to use for entities.",
            "Cache lines are too large to hold the data of a big Character base class.",
            "Sharing runs along one axis, so cross-cutting features push logic into base classes.",
            "Inheritance makes it impossible for objects to be allocated in contiguous memory."
          ],
          "answer": 2,
          "explain": "Features that cut across branches cannot be shared cleanly in a single-inheritance tree, and composition solves exactly that. The performance concerns are real but are not what this scenario shows."
        },
        {
          "q": "A loop updates `pos += vel * dt` over 50,000 structs of 128 bytes each, and it is memory-bound. Which change most likely gives the biggest speedup?",
          "options": [
            "Make the update function virtual so that each enemy type can override it freely.",
            "Store positions and velocities in separate contiguous arrays so only needed data is read.",
            "Add more fields to each struct so that all related data sits together in one place.",
            "Call the loop from several threads and put a lock around every individual struct."
          ],
          "answer": 1,
          "explain": "The loop uses 24 of 128 bytes per element, so most of each cache line is wasted. Splitting hot data into contiguous arrays reads only what is needed; locks and virtual calls add cost."
        },
        {
          "q": "In an archetype-based ECS, a gameplay system adds a `Burning` component to 5,000 entities in the middle of iterating them. What is the main concern?",
          "options": [
            "The query will hand back the matching entities in a random and unstable order each time.",
            "Adding data to components makes each entity larger than a single 64-byte cache line.",
            "Systems are never allowed to read components that they did not write themselves in a frame.",
            "Each add is a structural change moving the entity to another archetype, so defer it via a command buffer."
          ],
          "answer": 3,
          "explain": "Changing an entity's component set relocates its data and invalidates the chunks being iterated. Command buffers batch these changes safely after the iteration."
        },
        {
          "q": "A game has 300 unique, hand-authored interactive props and a 150,000-bullet pattern in a boss fight. How should you apply ECS?",
          "options": [
            "Convert everything to ECS for consistency, including the props.",
            "Avoid ECS entirely because the prop count is low.",
            "Use ECS only for the 300 props since they carry the most gameplay logic.",
            "Keep props as authored GameObjects and simulate the bullets as ECS entities."
          ],
          "answer": 3,
          "explain": "ECS benefits scale with the number of similar entities, which is the bullets. The few unique props gain little from conversion and are easier to author as objects."
        },
        {
          "q": "Why is 'we use components, so we already have ECS' a misconception?",
          "options": [
            "Object components bundle data with behaviour on the heap, while ECS separates data and packs it by archetype.",
            "ECS components cannot hold any real data and are used only as marker flags on entities.",
            "Object-based components can never be attached to an entity once the game is running.",
            "ECS has no systems at all and consists only of components that run themselves."
          ],
          "answer": 0,
          "explain": "Composition is shared by both, but the memory layout and the separation of data from logic are what give ECS its cache and parallelism advantages. The other options misstate how ECS works."
        },
        {
          "q": "Designers add a new enemy kind every week. Each is a new C# subclass whose only difference is its health, speed and loot table, and there are already 40 such classes. What should you reach for?",
          "options": [
            "An Entity-Component-System with archetype chunk storage",
            "A Subclass Sandbox with protected helper methods",
            "A data-defined enemy type object that one class reads",
            "An observer event bus between the enemy classes"
          ],
          "answer": 2,
          "explain": "Type Object moves the differences into data, so designers add kinds without code or rebuilds. ECS addresses throughput, not subclass proliferation, and a sandbox helps subclasses that differ in behaviour, not in numbers."
        }
      ]
    },
    {
      "id": "engines-scenes-culling",
      "title": "Scenes, spatial partitioning and culling",
      "minutes": 13,
      "summary": "How engines organise a world as transform trees and spatial structures so they can skip everything the player cannot see or touch.",
      "lesson": [
        {
          "type": "p",
          "text": "An open-world level holds 80,000 renderable objects and 20,000 physics colliders. The camera sees perhaps 1,500 of them. If the engine submits all 80,000 to the GPU, the CPU spends its entire frame issuing draw calls for geometry that ends up off-screen. The first rule of engine performance is: the fastest work is work you never start. **Spatial data structures** and **culling** are how engines decide what to skip, and they underlie rendering, physics queries, AI perception and audio."
        },
        {
          "type": "h",
          "text": "The scene graph and transform hierarchy"
        },
        {
          "type": "p",
          "text": "A **scene** is the collection of entities in a level. Most are arranged in a **transform hierarchy**: a tree where each node has a local transform (position, rotation, scale relative to its parent) and a world transform (the product of all ancestors). A sword is a child of a hand, which is a child of an arm. Moving the arm moves the sword automatically. Each transform is a 4x4 matrix (64 bytes) or an equivalent position/quaternion/scale triple; the world matrix is `parentWorld * local`."
        },
        {
          "type": "p",
          "text": "Maintaining that is not free. When a parent moves, all descendants' world matrices go dirty. Engines mark them with **dirty flags** and recompute lazily or in a batch pass, ideally parents before children and in a cache-friendly order (Unity stores transform hierarchies in contiguous arrays and updates them with jobs). Deep hierarchies and very large numbers of independently moving children are a known cost, and a flat structure is cheaper. Non-uniform scale in a parent with rotated children causes shear, which a TRS triple cannot represent."
        },
        {
          "type": "figure",
          "id": "engines-scene-transform-tree",
          "caption": "Rotating the arm carries the hand and sword with it; their world matrices go dirty and are recomputed parents first.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"An arm, hand and sword in a transform hierarchy. Rotating the arm carries the hand and sword with it; their world matrices are marked dirty and recomputed parent first, then children\"><style>.engines-scene-transform-tree-t{font-size:13px;fill:var(--fig-ink)}.engines-scene-transform-tree-m{font-size:13px;fill:var(--fig-muted)}.engines-scene-transform-tree-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-scene-transform-tree-c{text-anchor:middle}.engines-scene-transform-tree-e{text-anchor:end}.engines-scene-transform-tree-arm{transform-box:view-box;transform-origin:100px 200px;animation:engines-scene-transform-tree-rot 7s ease-in-out infinite}@keyframes engines-scene-transform-tree-rot{0%,10%{transform:rotate(0deg)}24%,56%{transform:rotate(-28deg)}70%,100%{transform:rotate(0deg)}}.engines-scene-transform-tree-hand{transform-box:view-box;transform-origin:220px 200px;animation:engines-scene-transform-tree-rot2 7s ease-in-out infinite}@keyframes engines-scene-transform-tree-rot2{0%,30%{transform:rotate(0deg)}40%,62%{transform:rotate(20deg)}74%,100%{transform:rotate(0deg)}}.engines-scene-transform-tree-d0{animation:engines-scene-transform-tree-k0 7s linear infinite}@keyframes engines-scene-transform-tree-k0{0%{opacity:0}9.5%{opacity:0}10%,26%{opacity:1}26.5%{opacity:0}55.5%{opacity:0}56%,74%{opacity:1}74.5%{opacity:0}100%{opacity:0}}.engines-scene-transform-tree-d1{animation:engines-scene-transform-tree-k1 7s linear infinite}@keyframes engines-scene-transform-tree-k1{0%{opacity:0}9.5%{opacity:0}10%,30%{opacity:1}30.5%{opacity:0}39.5%{opacity:0}40%,44%{opacity:1}44.5%{opacity:0}55.5%{opacity:0}56%,78%{opacity:1}78.5%{opacity:0}100%{opacity:0}}.engines-scene-transform-tree-d2{animation:engines-scene-transform-tree-k2 7s linear infinite}@keyframes engines-scene-transform-tree-k2{0%{opacity:0}9.5%{opacity:0}10%,34%{opacity:1}34.5%{opacity:0}39.5%{opacity:0}40%,48%{opacity:1}48.5%{opacity:0}55.5%{opacity:0}56%,82%{opacity:1}82.5%{opacity:0}100%{opacity:0}}</style><rect x=\"40\" y=\"170\" width=\"44\" height=\"120\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"engines-scene-transform-tree-arm\"><rect x=\"92\" y=\"191\" width=\"128\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.35\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-scene-transform-tree-t\" x=\"130\" y=\"228\">Arm</text><g class=\"engines-scene-transform-tree-hand\"><rect x=\"216\" y=\"193\" width=\"74\" height=\"14\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.35\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><circle cx=\"296\" cy=\"200\" r=\"11\" fill=\"var(--fig-accent)\" fill-opacity=\"0.35\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"engines-scene-transform-tree-t\" x=\"240\" y=\"228\">Hand</text><path d=\"M308 186v28\" stroke=\"var(--fig-accent2)\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M312 195L400 200L312 205Z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.4\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><text class=\"engines-scene-transform-tree-t\" x=\"340\" y=\"228\">Sword</text></g><circle cx=\"220\" cy=\"200\" r=\"4\" fill=\"var(--fig-ink)\"/></g><circle cx=\"100\" cy=\"200\" r=\"5\" fill=\"var(--fig-ink)\"/><text class=\"engines-scene-transform-tree-m\" x=\"24\" y=\"24\">Move a parent and every child follows</text><path d=\"M448 84V128H456M468 150V194H476\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" fill=\"none\"/><rect x=\"436\" y=\"40\" width=\"180\" height=\"44\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-scene-transform-tree-t\" x=\"450\" y=\"59\">Arm</text><text class=\"engines-scene-transform-tree-m\" x=\"450\" y=\"76\">world = local</text><circle cx=\"602\" cy=\"55\" r=\"6\" fill=\"var(--fig-ok)\"/><circle class=\"engines-scene-transform-tree-d0\" cx=\"602\" cy=\"55\" r=\"6\" fill=\"var(--fig-warn)\"/><rect x=\"456\" y=\"106\" width=\"160\" height=\"44\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-scene-transform-tree-t\" x=\"470\" y=\"125\">Hand</text><text class=\"engines-scene-transform-tree-m\" x=\"470\" y=\"142\">parentWorld × local</text><circle cx=\"602\" cy=\"121\" r=\"6\" fill=\"var(--fig-ok)\"/><circle class=\"engines-scene-transform-tree-d1\" cx=\"602\" cy=\"121\" r=\"6\" fill=\"var(--fig-warn)\"/><rect x=\"476\" y=\"172\" width=\"140\" height=\"44\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-scene-transform-tree-t\" x=\"490\" y=\"191\">Sword</text><text class=\"engines-scene-transform-tree-m\" x=\"490\" y=\"208\">parentWorld × local</text><circle cx=\"602\" cy=\"187\" r=\"6\" fill=\"var(--fig-ok)\"/><circle class=\"engines-scene-transform-tree-d2\" cx=\"602\" cy=\"187\" r=\"6\" fill=\"var(--fig-warn)\"/><circle cx=\"444\" cy=\"252\" r=\"6\" fill=\"var(--fig-warn)\"/><text class=\"engines-scene-transform-tree-t\" x=\"456\" y=\"257\">dirty</text><circle cx=\"514\" cy=\"252\" r=\"6\" fill=\"var(--fig-ok)\"/><text class=\"engines-scene-transform-tree-t\" x=\"526\" y=\"257\">recomputed</text><text class=\"engines-scene-transform-tree-m\" x=\"436\" y=\"284\">parents before children</text></svg>"
        },
        {
          "type": "h",
          "text": "Why hierarchy is not enough"
        },
        {
          "type": "p",
          "text": "A transform tree represents **ownership and relative placement**, not **where things are**. Two objects spatially next to each other may be in unrelated branches. Questions like 'what is within 10 m of this explosion?' or 'which objects touch the camera frustum?' would require testing every object, an O(n) scan, and for pairwise questions (collision) O(n^2). With 20,000 colliders, all pairs is 200 million tests. Spatial structures reduce this to roughly O(log n) per query by grouping nearby objects."
        },
        {
          "type": "h",
          "text": "Spatial partitioning structures"
        },
        {
          "type": "list",
          "items": [
            "**Uniform grid**: divide the world into equal cells; each object is registered in the cells it overlaps. Lookup is O(1) and simple, ideal for evenly spread, similarly sized objects (bullets, crowd agents, tile maps). It wastes memory on sparse worlds and struggles when sizes vary wildly. Use a hash of the cell coordinates to store only occupied cells.",
            "**Quadtree (2D) and octree (3D)**: recursively split space into four or eight children, subdividing only where objects are dense. Adapts to uneven distributions, such as a city with an empty field next to it. Objects that straddle a boundary either sit in the parent or are stored in several leaves.",
            "**BVH (bounding volume hierarchy)**: a tree where each node holds a bounding box enclosing its children, and the partitioning follows the objects rather than fixed space. Queries descend only into boxes that overlap the query. BVHs handle objects of mixed sizes well, support cheap refit when objects move (grow or shrink boxes up the tree), and are the dominant structure in physics broad phases and ray tracing.",
            "**BSP trees and portals/PVS**: older but still relevant for indoor levels, where precomputed visibility sets say which rooms can possibly be seen from where."
          ]
        },
        {
          "type": "figure",
          "id": "engines-scene-grid-quadtree",
          "caption": "The grid keeps 64 equal cells however the objects are spread; the quadtree splits only where the cluster is dense.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 346\" role=\"img\" aria-label=\"The same objects inserted into a uniform 8 by 8 grid and into a quadtree with capacity 2: the grid keeps 64 equal cells while the quadtree subdivides only around the dense cluster\"><style>.engines-scene-grid-quadtree-t{font-size:13px;fill:var(--fig-ink)}.engines-scene-grid-quadtree-m{font-size:13px;fill:var(--fig-muted)}.engines-scene-grid-quadtree-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-scene-grid-quadtree-c{text-anchor:middle}.engines-scene-grid-quadtree-e{text-anchor:end}.engines-scene-grid-quadtree-p0{animation:engines-scene-grid-quadtree-k0 8s linear infinite}@keyframes engines-scene-grid-quadtree-k0{0%{opacity:1}3%,5.9%{opacity:0}6%,100%{opacity:1}}.engines-scene-grid-quadtree-p1{animation:engines-scene-grid-quadtree-k1 8s linear infinite}@keyframes engines-scene-grid-quadtree-k1{0%{opacity:1}3%,11.4%{opacity:0}11.5%,100%{opacity:1}}.engines-scene-grid-quadtree-p2{animation:engines-scene-grid-quadtree-k2 8s linear infinite}@keyframes engines-scene-grid-quadtree-k2{0%{opacity:1}3%,16.9%{opacity:0}17%,100%{opacity:1}}.engines-scene-grid-quadtree-p3{animation:engines-scene-grid-quadtree-k3 8s linear infinite}@keyframes engines-scene-grid-quadtree-k3{0%{opacity:1}3%,22.4%{opacity:0}22.5%,100%{opacity:1}}.engines-scene-grid-quadtree-p4{animation:engines-scene-grid-quadtree-k4 8s linear infinite}@keyframes engines-scene-grid-quadtree-k4{0%{opacity:1}3%,27.9%{opacity:0}28%,100%{opacity:1}}.engines-scene-grid-quadtree-p5{animation:engines-scene-grid-quadtree-k5 8s linear infinite}@keyframes engines-scene-grid-quadtree-k5{0%{opacity:1}3%,33.4%{opacity:0}33.5%,100%{opacity:1}}.engines-scene-grid-quadtree-p6{animation:engines-scene-grid-quadtree-k6 8s linear infinite}@keyframes engines-scene-grid-quadtree-k6{0%{opacity:1}3%,38.9%{opacity:0}39%,100%{opacity:1}}.engines-scene-grid-quadtree-p7{animation:engines-scene-grid-quadtree-k7 8s linear infinite}@keyframes engines-scene-grid-quadtree-k7{0%{opacity:1}3%,44.4%{opacity:0}44.5%,100%{opacity:1}}.engines-scene-grid-quadtree-p8{animation:engines-scene-grid-quadtree-k8 8s linear infinite}@keyframes engines-scene-grid-quadtree-k8{0%{opacity:1}3%,49.9%{opacity:0}50%,100%{opacity:1}}.engines-scene-grid-quadtree-p9{animation:engines-scene-grid-quadtree-k9 8s linear infinite}@keyframes engines-scene-grid-quadtree-k9{0%{opacity:1}3%,55.4%{opacity:0}55.5%,100%{opacity:1}}.engines-scene-grid-quadtree-p10{animation:engines-scene-grid-quadtree-k10 8s linear infinite}@keyframes engines-scene-grid-quadtree-k10{0%{opacity:1}3%,60.9%{opacity:0}61%,100%{opacity:1}}.engines-scene-grid-quadtree-p11{animation:engines-scene-grid-quadtree-k11 8s linear infinite}@keyframes engines-scene-grid-quadtree-k11{0%{opacity:1}3%,66.4%{opacity:0}66.5%,100%{opacity:1}}.engines-scene-grid-quadtree-p12{animation:engines-scene-grid-quadtree-k12 8s linear infinite}@keyframes engines-scene-grid-quadtree-k12{0%{opacity:1}3%,71.9%{opacity:0}72%,100%{opacity:1}}.engines-scene-grid-quadtree-p13{animation:engines-scene-grid-quadtree-k13 8s linear infinite}@keyframes engines-scene-grid-quadtree-k13{0%{opacity:1}3%,77.4%{opacity:0}77.5%,100%{opacity:1}}</style><text class=\"engines-scene-grid-quadtree-h\" x=\"24\" y=\"24\">Uniform grid</text><text class=\"engines-scene-grid-quadtree-m engines-scene-grid-quadtree-e\" x=\"296\" y=\"24\">64 fixed cells</text><text class=\"engines-scene-grid-quadtree-h\" x=\"344\" y=\"24\">Quadtree</text><text class=\"engines-scene-grid-quadtree-m engines-scene-grid-quadtree-e\" x=\"616\" y=\"24\">13 leaves, split if &gt; 2</text><rect class=\"engines-scene-grid-quadtree-p0\" x=\"24\" y=\"40\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p1\" x=\"58\" y=\"74\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p3\" x=\"92\" y=\"40\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p4\" x=\"92\" y=\"74\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p5\" x=\"24\" y=\"108\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p6\" x=\"58\" y=\"108\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p8\" x=\"92\" y=\"108\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p9\" x=\"194\" y=\"74\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p10\" x=\"228\" y=\"210\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p11\" x=\"160\" y=\"210\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p12\" x=\"58\" y=\"244\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><rect class=\"engines-scene-grid-quadtree-p13\" x=\"126\" y=\"142\" width=\"34\" height=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\"/><path d=\"M58 40v272M24 74h272M92 40v272M24 108h272M126 40v272M24 142h272M160 40v272M24 176h272M194 40v272M24 210h272M228 40v272M24 244h272M262 40v272M24 278h272\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><rect x=\"24\" y=\"40\" width=\"272\" height=\"272\" rx=\"4\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\"/><path class=\"engines-scene-grid-quadtree-p2\" d=\"M480 40v272M344 176h272\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><path class=\"engines-scene-grid-quadtree-p2\" d=\"M412 40v136M344 108h136\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><path class=\"engines-scene-grid-quadtree-p2\" d=\"M378 40v68M344 74h68\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><path class=\"engines-scene-grid-quadtree-p7\" d=\"M446 40v68M412 74h68\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><rect x=\"344\" y=\"40\" width=\"272\" height=\"272\" rx=\"4\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\"/><g class=\"engines-scene-grid-quadtree-p0\"><circle cx=\"54\" cy=\"70\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"374\" cy=\"70\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p1\"><circle cx=\"76\" cy=\"80\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"396\" cy=\"80\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p2\"><circle cx=\"64\" cy=\"102\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"384\" cy=\"102\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p3\"><circle cx=\"92\" cy=\"62\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"412\" cy=\"62\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p4\"><circle cx=\"104\" cy=\"98\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"424\" cy=\"98\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p5\"><circle cx=\"48\" cy=\"130\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"368\" cy=\"130\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p6\"><circle cx=\"82\" cy=\"124\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"402\" cy=\"124\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p7\"><circle cx=\"120\" cy=\"74\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"440\" cy=\"74\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p8\"><circle cx=\"114\" cy=\"132\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"434\" cy=\"132\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p9\"><circle cx=\"224\" cy=\"100\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"544\" cy=\"100\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p10\"><circle cx=\"254\" cy=\"240\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"574\" cy=\"240\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p11\"><circle cx=\"174\" cy=\"220\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"494\" cy=\"220\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p12\"><circle cx=\"84\" cy=\"270\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"404\" cy=\"270\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><g class=\"engines-scene-grid-quadtree-p13\"><circle cx=\"134\" cy=\"160\" r=\"4.5\" fill=\"var(--fig-ink)\"/><circle cx=\"454\" cy=\"160\" r=\"4.5\" fill=\"var(--fig-ink)\"/></g><text class=\"engines-scene-grid-quadtree-m\" x=\"24\" y=\"336\">a few cells crowded, most empty</text><text class=\"engines-scene-grid-quadtree-m\" x=\"344\" y=\"336\">cells subdivide only where objects are</text></svg>"
        },
        {
          "type": "p",
          "text": "Choosing among them is a trade between build cost, update cost and query cost. Static geometry can use an expensive, high-quality build (a surface-area-heuristic BVH) once. Dynamic objects need structures that update cheaply, a loose grid or refit BVH, or are re-inserted every frame. Rebuilding an octree for 10,000 moving objects each frame is a classic mistake."
        },
        {
          "type": "h",
          "text": "Frustum culling"
        },
        {
          "type": "p",
          "text": "The camera's view volume is a truncated pyramid, the **frustum**, defined by six planes. **Frustum culling** tests each object's bounding volume (sphere or axis-aligned box, wrapping the real mesh) against these planes and discards anything fully outside. Testing the proxy volume is far cheaper than the mesh: an AABB-versus-plane test needs a few multiplies and compares. Done hierarchically, a whole BVH node outside the frustum rejects all its children at once, turning 80,000 tests into a few hundred."
        },
        {
          "type": "code",
          "lang": "cpp",
          "text": "// Sphere vs frustum: planes have normals pointing inward\nbool InsideFrustum(const Sphere& s, const Plane planes[6]) {\n    for (int i = 0; i < 6; ++i) {\n        float dist = Dot(planes[i].normal, s.center) + planes[i].d;\n        if (dist < -s.radius) return false; // fully outside this plane\n    }\n    return true; // inside or intersecting: render it\n}"
        },
        {
          "type": "h",
          "text": "Occlusion culling"
        },
        {
          "type": "p",
          "text": "Frustum culling only removes what is off-screen. Objects inside the frustum may be hidden behind a wall. **Occlusion culling** removes them. Approaches differ: **precomputed** visibility divides the level into cells and stores, offline, which objects are potentially visible from each cell (Unity's built-in Occlusion Culling works this way and is tied to baked static data); **software rasterisation** draws large occluders into a small depth buffer on the CPU and tests bounding boxes against it; **GPU-driven** methods reuse the previous frame's depth buffer, often organised as a depth pyramid (Hi-Z), and test objects in compute shaders. Unity 6 adds a GPU occlusion culling option in URP and HDRP, which works with the GPU Resident Drawer. Occlusion culling costs time to evaluate, so it pays off in dense occluded scenes (cities, interiors) and may lose in open terrain."
        },
        {
          "type": "figure",
          "id": "engines-scene-frustum-occlusion",
          "caption": "Frustum culling drops the four objects outside the view volume; occlusion culling then drops the two hidden behind the wall, leaving 3 of 9 to draw.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 376\" role=\"img\" aria-label=\"Top-down view of a camera frustum with nine objects: four outside the frustum are culled, two inside it are hidden behind a wall and removed by occlusion culling, and three are drawn\"><style>.engines-scene-frustum-occlusion-t{font-size:13px;fill:var(--fig-ink)}.engines-scene-frustum-occlusion-m{font-size:13px;fill:var(--fig-muted)}.engines-scene-frustum-occlusion-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-scene-frustum-occlusion-c{text-anchor:middle}.engines-scene-frustum-occlusion-e{text-anchor:end}.engines-scene-frustum-occlusion-f{animation:engines-scene-frustum-occlusion-kf 7s ease-in-out infinite}@keyframes engines-scene-frustum-occlusion-kf{0%{opacity:0}3%,24%{opacity:1}32%,100%{opacity:0}}.engines-scene-frustum-occlusion-o{animation:engines-scene-frustum-occlusion-ko 7s ease-in-out infinite}@keyframes engines-scene-frustum-occlusion-ko{0%{opacity:0}3%,50%{opacity:1}58%,100%{opacity:0}}.engines-scene-frustum-occlusion-sh{animation:engines-scene-frustum-occlusion-ks 7s ease-in-out infinite}@keyframes engines-scene-frustum-occlusion-ks{0%{opacity:1}3%,42%{opacity:0}50%,100%{opacity:1}}</style><path d=\"M50 196L540 56L540 336Z\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><line x1=\"80\" y1=\"187.4\" x2=\"80\" y2=\"204.6\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><path class=\"engines-scene-frustum-occlusion-sh\" d=\"M330 156L540 126L540 248.5L330 226Z\" fill=\"var(--fig-warn)\" fill-opacity=\"0.14\"/><rect x=\"326\" y=\"156\" width=\"10\" height=\"70\" rx=\"3\" fill=\"var(--fig-ink)\"/><text class=\"engines-scene-frustum-occlusion-t\" x=\"344\" y=\"150\">wall (occluder)</text><path d=\"M32 184h22l10 12l-10 12h-22z\" fill=\"var(--fig-ink)\"/><text class=\"engines-scene-frustum-occlusion-t engines-scene-frustum-occlusion-c\" x=\"50\" y=\"236\">camera</text><circle cx=\"250\" cy=\"170\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><circle cx=\"380\" cy=\"246\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><circle cx=\"470\" cy=\"104\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><circle cx=\"300\" cy=\"80\" r=\"10.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><circle class=\"engines-scene-frustum-occlusion-f\" cx=\"300\" cy=\"80\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><circle cx=\"440\" cy=\"330\" r=\"10.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><circle class=\"engines-scene-frustum-occlusion-f\" cx=\"440\" cy=\"330\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><circle cx=\"596\" cy=\"200\" r=\"10.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><circle class=\"engines-scene-frustum-occlusion-f\" cx=\"596\" cy=\"200\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><circle cx=\"150\" cy=\"300\" r=\"10.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><circle class=\"engines-scene-frustum-occlusion-f\" cx=\"150\" cy=\"300\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><circle cx=\"450\" cy=\"200\" r=\"10.25\" fill=\"none\" stroke=\"var(--fig-warn)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><circle class=\"engines-scene-frustum-occlusion-o\" cx=\"450\" cy=\"200\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><circle cx=\"500\" cy=\"168\" r=\"10.25\" fill=\"none\" stroke=\"var(--fig-warn)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><circle class=\"engines-scene-frustum-occlusion-o\" cx=\"500\" cy=\"168\" r=\"11\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><text class=\"engines-scene-frustum-occlusion-t\" x=\"24\" y=\"24\"><tspan style=\"font-weight:600\">9 objects</tspan> → 5 inside the frustum → <tspan style=\"fill:var(--fig-ok)\">3 drawn</tspan></text><circle cx=\"34\" cy=\"360\" r=\"7\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><text class=\"engines-scene-frustum-occlusion-t\" x=\"48\" y=\"365\">drawn</text><circle cx=\"124\" cy=\"360\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><text class=\"engines-scene-frustum-occlusion-t\" x=\"138\" y=\"365\">frustum culled</text><circle cx=\"264\" cy=\"360\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-warn)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><text class=\"engines-scene-frustum-occlusion-t\" x=\"278\" y=\"365\">occluded behind the wall</text></svg>"
        },
        {
          "type": "h",
          "text": "Level of detail"
        },
        {
          "type": "p",
          "text": "Once an object is known to be visible, it should still cost proportional to its on-screen size. **LOD** swaps in cheaper representations with distance or screen coverage: a 50,000-triangle hero mesh at 5 m becomes 5,000 at 30 m and a 300-triangle impostor or billboard at 200 m. Selection is usually by projected screen-space size rather than raw distance, so a zoomed camera behaves correctly. Cross-fading or dithered transitions hide the pop. LOD also applies to animation update rate, shadow casting, physics and AI tick rate, not only meshes. The extreme version is virtualised geometry (Unreal's Nanite) where clustering and selection happen on the GPU per cluster."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Bounding volumes must be correct. An animated or vertex-displaced mesh whose AABB stays at its bind pose gets culled while still visible, a bug that shows as objects popping out at screen edges. Check bounds for skinned meshes, shader-driven vertex motion and procedural geometry."
        },
        {
          "type": "list",
          "items": [
            "Misconception: culling makes the GPU faster. It mostly saves CPU submission time and vertex work; fill-rate cost is governed by overdraw and resolution.",
            "Misconception: more partitioning is always better. Every structure has a maintenance cost, and with a few hundred objects a linear scan can win.",
            "Pitfall: culling and LOD thresholds tuned on a dev PC fail on low-end hardware; tune per quality tier."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "When an agent builds a spatial system it often picks an octree by reflex, rebuilds it every frame, or loops over all objects for 'nearby' queries inside Update. Tell it the object count, how many move per frame, and whether queries are range, nearest-neighbour or raycast. Ask it to justify the structure against those numbers. Verify with a profiler and a stress scene, and test edge cases: objects on cell boundaries, objects larger than a cell, and objects moving fast enough to skip cells."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Many same-size objects spread evenly over a level all move every frame and each needs its nearby neighbours",
              "use": "Uniform grid / spatial hash",
              "why": "Bucket objects by cell and check only the surrounding cells; insert and remove are O(1), so rebuilding each frame is cheap. Wastes memory on empty space and degrades when objects vary greatly in size."
            },
            {
              "signal": "Object density is very uneven: dense towns, sparse wilderness, and queries should skip empty regions",
              "use": "Octree / quadtree",
              "why": "Space subdivides only where objects cluster, so queries descend just into occupied nodes. Objects straddling boundaries complicate placement, and moving many objects means frequent node updates."
            },
            {
              "signal": "Colliders or renderers range from pebbles to buildings, many move, and queries are mostly box or ray overlaps",
              "use": "Bounding volume hierarchy (BVH)",
              "why": "Boxes follow the objects, handle mixed sizes well and refit cheaply when objects move. Refits degrade tree quality over time, so rebuild periodically; dominant in physics broad phases and ray tracing."
            },
            {
              "signal": "A hand-written spatial structure for 100 objects made frame time worse than the plain loop",
              "use": "Linear scan for small N",
              "why": "Below a few hundred items a contiguous array scan beats tree traversal thanks to cache locality and no maintenance cost. Measure before adding a structure; partition when counts or query rates grow."
            },
            {
              "signal": "Moving a parent recomputes every descendant's world matrix immediately, even if nothing reads them this frame",
              "use": "Dirty Flag",
              "why": "Mark derived data stale when inputs change and recompute lazily or in one batch pass, parents before children. Saves repeated work; the risk is forgetting to set or check the flag and reading stale data."
            },
            {
              "signal": "The CPU issues draw calls for thousands of objects that end up off-screen",
              "use": "Hierarchical frustum culling",
              "why": "Test cheap bounding volumes against the six frustum planes and reject whole nodes of a spatial tree at once. Bounds must be conservative or visible objects pop out."
            },
            {
              "signal": "Inside a dense city most in-frustum objects sit behind buildings, yet they are still drawn",
              "use": "Occlusion culling",
              "why": "Precomputed visibility or a depth-based test removes hidden objects. It has its own CPU or GPU cost and bake time, so it pays off mainly in dense, enclosed scenes, not open fields."
            },
            {
              "signal": "Distant objects cost as many triangles and draw calls as nearby ones but cover only a few pixels",
              "use": "Level of detail (LOD)",
              "why": "Swap to simpler meshes, materials or impostors by screen size so cost scales with what is seen. Costs authoring and memory, and visible popping without cross-fades or hysteresis."
            },
            {
              "signal": "A tall or animated mesh disappears near screen edges although part of it should still be visible",
              "use": "Conservative bounds for deforming geometry",
              "why": "Culling trusts the bounding volume, so bounds must cover animation, vertex displacement and skinning. Enlarge or update bounds; overly large bounds just cull less."
            },
            {
              "signal": "A deep transform hierarchy with hundreds of independently moving children shows high transform update cost",
              "use": "Flatten the transform hierarchy",
              "why": "Parent only when objects truly move together; independent movers at the root avoid cascading dirty propagation and allow parallel updates. Loses automatic relative placement."
            }
          ]
        }
      ],
      "keyPoints": [
        "A transform hierarchy encodes parenting and relative placement, not spatial proximity; spatial questions need separate structures.",
        "Grids suit uniform dense objects, octrees suit uneven density, and BVHs suit mixed sizes and cheap refits of dynamic objects.",
        "Frustum culling tests simple bounding volumes against six planes, and hierarchical tests reject whole subtrees at once.",
        "Occlusion culling removes objects hidden behind others, at an evaluation cost that pays off mainly in dense scenes.",
        "LOD scales cost with screen size; bounding volumes must remain correct for animated or displaced geometry."
      ],
      "quiz": [
        {
          "q": "A crowd sim has 20,000 same-size agents spread evenly over a flat arena, all moving every frame, and each needs nearby neighbours. Which structure is the best fit?",
          "options": [
            "A hash grid, rebuilt cheaply each frame by cell coordinates.",
            "A deep octree rebuilt each frame with a surface-area heuristic.",
            "A BSP tree precomputed offline for the arena.",
            "The transform hierarchy, since agents are children of one crowd node."
          ],
          "answer": 0,
          "explain": "Uniform, evenly spread, same-size, fast-moving objects are the grid's best case, with O(1) insert. The transform tree gives no spatial proximity, and expensive rebuilds suit static data."
        },
        {
          "q": "A tall tower mesh occasionally vanishes when its base is near a screen edge, though part of it should be visible. Which cause is most likely?",
          "options": [
            "The occlusion depth pyramid was built at too low a resolution for the tower.",
            "The LOD selection switched to a flat impostor much too early for this distance.",
            "Its bounding volume is too small or misplaced, so frustum culling rejects it while visible.",
            "The depth buffer lacks enough precision to represent tall objects near the edges."
          ],
          "answer": 2,
          "explain": "Culling tests the proxy volume, so an incorrect bound rejects a mesh whose real geometry is still in view. Edge-dependent disappearance points at frustum tests rather than occlusion or LOD."
        },
        {
          "q": "A scene has 100 objects. A developer replaces a linear scan for 'objects in range' with a hand-written octree and finds frame time rose. What is the most plausible reason?",
          "options": [
            "Octrees are unable to answer range queries correctly for objects of any kind.",
            "At such small counts, build and maintenance overhead exceeds the tests the structure saves.",
            "Octrees need a GPU in order to run efficiently, and this code ran on the CPU.",
            "Range queries are always faster with a linear scan, whatever the object count is."
          ],
          "answer": 1,
          "explain": "Acceleration structures trade maintenance for fewer tests, which only pays when n is large enough. The claim that linear scans always win is false at scale."
        },
        {
          "q": "In a dense city, frustum culling leaves 12,000 visible-in-frustum objects, but the player is in a street and sees only 800. Which technique addresses the remaining waste?",
          "options": [
            "Add more LOD levels to the far meshes so that each costs less to draw.",
            "Increase the number of frustum planes so the view volume fits more tightly.",
            "Rebuild the octree every single frame so that its results are always accurate.",
            "Use occlusion culling, with baked visibility data or a depth-based visibility test."
          ],
          "answer": 3,
          "explain": "Those objects are inside the frustum but hidden behind buildings, which is the case occlusion culling targets. More LODs lower cost per object but still submit all of them."
        },
        {
          "q": "A character's sword is parented to its hand. The artist moves the root of the character, and 300 such children across the level update their world matrices. What does the hierarchy guarantee, and what does it not?",
          "options": [
            "It guarantees fast spatial queries for finding nearby objects across the whole level.",
            "It guarantees children are always culled together with their parents by the camera.",
            "Children's world transforms follow the parent, but it says nothing about which objects are close.",
            "It guarantees that non-uniform scale can never introduce shear into rotated children."
          ],
          "answer": 2,
          "explain": "A transform tree propagates placement from parent to child. Proximity needs a separate spatial structure, and non-uniform parent scale with rotated children can in fact cause shear."
        },
        {
          "q": "A street scene draws lamp posts and cars 5 km away with their full 8,000-triangle meshes. They are inside the frustum, not occluded, and each covers only a few pixels, yet they cost as much as near ones. Which approach fits best?",
          "options": [
            "A level-of-detail chain with a distance cut-off",
            "Occlusion culling against the nearby buildings in view",
            "Hierarchical frustum culling over a BVH of objects",
            "A dirty flag on each object's cached world matrix"
          ],
          "answer": 0,
          "explain": "LOD cuts triangle and draw cost where detail is invisible. Frustum and occlusion culling remove only objects outside the view or hidden, and these are visible, so they would still be drawn at full cost."
        }
      ]
    },
    {
      "id": "engines-physics-collision",
      "title": "Physics and collision",
      "minutes": 14,
      "summary": "How engines simulate rigid bodies, find collisions in two phases, avoid tunnelling, and why all of it runs at a fixed rate.",
      "lesson": [
        {
          "type": "p",
          "text": "A player fires a rocket launcher at 120 m/s. On the developer's machine the rocket explodes against walls. On a slow device the rocket flies straight through a thin fence and detonates on the far side. This is **tunnelling**, and it is one of the failures a physics engine is built to prevent. Physics engines are the part of the game that has to be right under the worst conditions, because every other system relies on its output."
        },
        {
          "type": "h",
          "text": "Rigid bodies and integration"
        },
        {
          "type": "p",
          "text": "Most game physics is **rigid body dynamics**: objects have mass, position, orientation, linear and angular velocity, and never deform. Each step the engine applies forces (gravity, thrust, contacts), updates velocities, then positions. The update rule is the **integrator**. The simplest, **explicit Euler**, does `v += a*dt; x += v*dt`. **Semi-implicit (symplectic) Euler** updates velocity first and then uses the new velocity for position, which is nearly as cheap and conserves energy far better, so it is the default in most game engines. **Verlet** and **RK4** are used in cloth, particles or specialised simulations. Explicit Euler with a big `dt` gains energy and explodes, while semi-implicit remains stable for typical game steps."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Semi-implicit Euler for one body, run at a fixed dt\nvoid Integrate(ref Body b, float dt)\n{\n    b.velocity += (b.force * b.invMass + gravity) * dt;\n    b.velocity *= 1f / (1f + b.linearDamping * dt);\n    b.position += b.velocity * dt;\n    b.force = Vector3.zero;\n}"
        },
        {
          "type": "figure",
          "id": "engines-phys-euler",
          "caption": "Same spring, same dt of 0.05 s: semi-implicit Euler tracks the exact curve, while explicit Euler gains energy every cycle until it leaves the chart.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 342\" role=\"img\" aria-label=\"Position of a spring over 3 seconds integrated with dt 0.05 s: semi-implicit Euler stays bounded near the exact curve while explicit Euler grows each cycle and leaves the chart\"><style>.engines-phys-euler-t{font-size:13px;fill:var(--fig-ink)}.engines-phys-euler-m{font-size:13px;fill:var(--fig-muted)}.engines-phys-euler-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-phys-euler-c{text-anchor:middle}.engines-phys-euler-e{text-anchor:end}.engines-phys-euler-ex{animation:engines-phys-euler-dex 6s linear infinite}@keyframes engines-phys-euler-dex{0%{stroke-dashoffset:0}3%{stroke-dashoffset:516}40%,100%{stroke-dashoffset:0}}.engines-phys-euler-se{animation:engines-phys-euler-dse 6s linear infinite}@keyframes engines-phys-euler-dse{0%{stroke-dashoffset:0}3%{stroke-dashoffset:671}80%,100%{stroke-dashoffset:0}}</style><line x1=\"60\" y1=\"288\" x2=\"600\" y2=\"288\" stroke=\"var(--fig-line)\" stroke-width=\"1\" stroke-dasharray=\"3 4\"/><text class=\"engines-phys-euler-m engines-phys-euler-e\" x=\"52\" y=\"292\">-4</text><line x1=\"60\" y1=\"228\" x2=\"600\" y2=\"228\" stroke=\"var(--fig-line)\" stroke-width=\"1\" stroke-dasharray=\"3 4\"/><text class=\"engines-phys-euler-m engines-phys-euler-e\" x=\"52\" y=\"232\">-2</text><line x1=\"60\" y1=\"168\" x2=\"600\" y2=\"168\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"engines-phys-euler-m engines-phys-euler-e\" x=\"52\" y=\"172\">0</text><line x1=\"60\" y1=\"108\" x2=\"600\" y2=\"108\" stroke=\"var(--fig-line)\" stroke-width=\"1\" stroke-dasharray=\"3 4\"/><text class=\"engines-phys-euler-m engines-phys-euler-e\" x=\"52\" y=\"112\">+2</text><line x1=\"60\" y1=\"48\" x2=\"600\" y2=\"48\" stroke=\"var(--fig-line)\" stroke-width=\"1\" stroke-dasharray=\"3 4\"/><text class=\"engines-phys-euler-m engines-phys-euler-e\" x=\"52\" y=\"52\">+4</text><text class=\"engines-phys-euler-m engines-phys-euler-c\" x=\"60\" y=\"310\">0 s</text><text class=\"engines-phys-euler-m engines-phys-euler-c\" x=\"240\" y=\"310\">1 s</text><text class=\"engines-phys-euler-m engines-phys-euler-c\" x=\"420\" y=\"310\">2 s</text><text class=\"engines-phys-euler-m engines-phys-euler-c\" x=\"600\" y=\"310\">3 s</text><polyline points=\"60,138 63,138.2 66,138.7 69,139.5 72,140.6 75,142 78,143.7 81,145.7 84,147.9 87,150.4 90,153 93,155.8 96,158.7 99,161.8 102,164.9 105,168 108,171.1 111,174.2 114,177.3 117,180.2 120,183 123,185.6 126,188.1 129,190.3 132,192.3 135,194 138,195.4 141,196.5 144,197.3 147,197.8 150,198 153,197.8 156,197.3 159,196.5 162,195.4 165,194 168,192.3 171,190.3 174,188.1 177,185.6 180,183 183,180.2 186,177.3 189,174.2 192,171.1 195,168 198,164.9 201,161.8 204,158.7 207,155.8 210,153 213,150.4 216,147.9 219,145.7 222,143.7 225,142 228,140.6 231,139.5 234,138.7 237,138.2 240,138 243,138.2 246,138.7 249,139.5 252,140.6 255,142 258,143.7 261,145.7 264,147.9 267,150.4 270,153 273,155.8 276,158.7 279,161.8 282,164.9 285,168 288,171.1 291,174.2 294,177.3 297,180.2 300,183 303,185.6 306,188.1 309,190.3 312,192.3 315,194 318,195.4 321,196.5 324,197.3 327,197.8 330,198 333,197.8 336,197.3 339,196.5 342,195.4 345,194 348,192.3 351,190.3 354,188.1 357,185.6 360,183 363,180.2 366,177.3 369,174.2 372,171.1 375,168 378,164.9 381,161.8 384,158.7 387,155.8 390,153 393,150.4 396,147.9 399,145.7 402,143.7 405,142 408,140.6 411,139.5 414,138.7 417,138.2 420,138 423,138.2 426,138.7 429,139.5 432,140.6 435,142 438,143.7 441,145.7 444,147.9 447,150.4 450,153 453,155.8 456,158.7 459,161.8 462,164.9 465,168 468,171.1 471,174.2 474,177.3 477,180.2 480,183 483,185.6 486,188.1 489,190.3 492,192.3 495,194 498,195.4 501,196.5 504,197.3 507,197.8 510,198 513,197.8 516,197.3 519,196.5 522,195.4 525,194 528,192.3 531,190.3 534,188.1 537,185.6 540,183 543,180.2 546,177.3 549,174.2 552,171.1 555,168 558,164.9 561,161.8 564,158.7 567,155.8 570,153 573,150.4 576,147.9 579,145.7 582,143.7 585,142 588,140.6 591,139.5 594,138.7 597,138.2 600,138\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><polyline class=\"engines-phys-euler-ex\" points=\"60,138 69,138 78,141 87,146.9 96,155.5 105,166.1 114,178.1 123,190.2 132,201.3 141,210.2 150,215.8 159,217.3 168,214 177,205.9 186,193.3 195,176.9 204,158 213,138.2 222,119.4 231,103.6 240,92.6 249,87.9 258,90.6 267,101.3 276,119.6 285,144.5 294,174.1 303,206.1 312,237.5 321,265.1 330,285.9\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-dasharray=\"516\" /><polyline class=\"engines-phys-euler-se\" points=\"60,138 69,141 78,146.6 87,154.3 96,163.4 105,173 114,182 123,189.7 132,195.2 141,198.1 150,197.9 159,194.9 168,189.1 177,181.3 186,172.2 195,162.6 204,153.6 213,146 222,140.6 231,137.9 240,138.1 249,141.3 258,147.2 267,155 276,164.2 285,173.7 294,182.7 303,190.2 312,195.6 321,198.2 330,197.8 339,194.5 348,188.5 357,180.6 366,171.4 375,161.9 384,152.9 393,145.5 402,140.3 411,137.8 420,138.3 429,141.7 438,147.7 447,155.8 456,165 465,174.5 474,183.4 483,190.8 492,195.9 501,198.2 510,197.6 519,194.1 528,188 537,179.9 546,170.6 555,161.1 564,152.3 573,145 582,140 591,137.7 600,138.5\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-dasharray=\"671\"/><circle cx=\"60\" cy=\"138\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"78\" cy=\"146.6\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"96\" cy=\"163.4\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"114\" cy=\"182\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"132\" cy=\"195.2\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"150\" cy=\"197.9\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"168\" cy=\"189.1\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"186\" cy=\"172.2\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"204\" cy=\"153.6\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"222\" cy=\"140.6\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"240\" cy=\"138.1\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"258\" cy=\"147.2\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"276\" cy=\"164.2\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"294\" cy=\"182.7\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"312\" cy=\"195.6\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"330\" cy=\"197.8\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"348\" cy=\"188.5\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"366\" cy=\"171.4\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"384\" cy=\"152.9\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"402\" cy=\"140.3\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"420\" cy=\"138.3\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"438\" cy=\"147.7\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"456\" cy=\"165\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"474\" cy=\"183.4\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"492\" cy=\"195.9\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"510\" cy=\"197.6\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"528\" cy=\"188\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"546\" cy=\"170.6\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"564\" cy=\"152.3\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"582\" cy=\"140\" r=\"2.2\" fill=\"var(--fig-accent)\"/><circle cx=\"600\" cy=\"138.5\" r=\"2.2\" fill=\"var(--fig-accent)\"/><text class=\"engines-phys-euler-t\" x=\"340\" y=\"66\" style=\"fill:var(--fig-bad)\">explicit Euler gains energy: off the chart by 1.6 s</text><line x1=\"24\" y1=\"20\" x2=\"44\" y2=\"20\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"engines-phys-euler-t\" x=\"50\" y=\"25\">semi-implicit: v += a·dt, then x += v·dt</text><line x1=\"340\" y1=\"20\" x2=\"360\" y2=\"20\" stroke=\"var(--fig-bad)\" stroke-width=\"2\"/><text class=\"engines-phys-euler-t\" x=\"366\" y=\"25\">explicit: x uses the old v</text><text class=\"engines-phys-euler-m\" x=\"60\" y=\"332\">Spring, 1 Hz, dt = 0.05 s (20 steps per cycle); dashed = exact</text></svg>"
        },
        {
          "type": "p",
          "text": "After integration comes **collision handling**. Contacts are resolved either by impulses (sequential impulse or projected Gauss-Seidel solvers, the basis of Box2D, PhysX, Havok and Bullet) or by position-based methods (XPBD), which have become popular for stable stacking and soft effects. Solvers iterate several times per step over all contacts and **joints**, and the quality of stacking depends on iteration counts. Defaults are small single-digit counts and differ by engine (Box2D v2 recommends 8 velocity and 3 position iterations; Unity's PhysX integration defaults to 6 solver iterations and 1 velocity iteration), and raising them is the usual first knob for wobbly stacks or stretchy joints."
        },
        {
          "type": "h",
          "text": "Collider shapes"
        },
        {
          "type": "p",
          "text": "A physics body does not collide using its render mesh. It uses simplified **colliders**. Primitives (sphere, box, capsule) are the cheapest and have analytic tests. **Convex hulls** are more general but cost grows with vertex count. **Mesh colliders** (arbitrary triangle soup) are legal only for static geometry in most engines because concave meshes lack the volume info needed for stable dynamic response. For complex dynamic shapes, authors approximate with **compound** colliders: several convex pieces on one body. Characters usually use a capsule, since a rounded bottom climbs steps and slides along walls. Sensors or **triggers** report overlap without producing a physical response."
        },
        {
          "type": "h",
          "text": "Broad phase and narrow phase"
        },
        {
          "type": "p",
          "text": "Testing every pair of 5,000 bodies is about 12.5 million pair tests per step. Engines split detection into two stages. The **broad phase** uses cheap bounding volumes (AABBs) and a spatial structure to produce a short list of **candidate pairs** that might touch: sweep and prune along an axis, a dynamic BVH (as in Box2D's dynamic tree or Bullet's DBVT), or a grid. It is conservative, accepting false positives but never false negatives. The **narrow phase** runs exact tests on each candidate pair, using algorithms such as **SAT** (separating axis theorem) for boxes and **GJK** with **EPA** for general convex shapes, and produces a **contact manifold**: contact points, normal and penetration depth. The solver consumes that manifold."
        },
        {
          "type": "figure",
          "id": "engines-phys-broad-narrow",
          "caption": "The broad phase cuts 21 pairs to 3 by AABB overlap; the narrow phase rejects two false positives and returns one contact with a normal and depth.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Seven bodies with dashed AABBs. The broad phase finds three overlapping AABB pairs; the narrow phase exact test confirms only one, the two circles at top left, and outputs a contact normal and penetration depth\"><style>.engines-phys-broad-narrow-t{font-size:13px;fill:var(--fig-ink)}.engines-phys-broad-narrow-m{font-size:13px;fill:var(--fig-muted)}.engines-phys-broad-narrow-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-phys-broad-narrow-c{text-anchor:middle}.engines-phys-broad-narrow-e{text-anchor:end}.engines-phys-broad-narrow-ab{animation:engines-phys-broad-narrow-a 7s ease-in-out infinite}@keyframes engines-phys-broad-narrow-a{0%{opacity:1}3%,10%{opacity:0}20%,100%{opacity:1}}.engines-phys-broad-narrow-ok,.engines-phys-broad-narrow-fp{animation:engines-phys-broad-narrow-o 7s ease-in-out infinite}@keyframes engines-phys-broad-narrow-o{0%{opacity:1}3%,28%{opacity:0}36%,100%{opacity:1}}.engines-phys-broad-narrow-fp{animation-name:engines-phys-broad-narrow-f}@keyframes engines-phys-broad-narrow-f{0%{opacity:0.25}3%,28%{opacity:0}36%,54%{opacity:1}62%,100%{opacity:0.25}}.engines-phys-broad-narrow-ct{animation:engines-phys-broad-narrow-c 7s ease-in-out infinite}@keyframes engines-phys-broad-narrow-c{0%{opacity:1}3%,56%{opacity:0}64%,100%{opacity:1}}.engines-phys-broad-narrow-x{animation:engines-phys-broad-narrow-c 7s ease-in-out infinite}.engines-phys-broad-narrow-k0{animation:engines-phys-broad-narrow-g0 7s ease-in-out infinite}@keyframes engines-phys-broad-narrow-g0{0%,3%{fill-opacity:0.12}7%,18%{fill-opacity:0.35}24%,100%{fill-opacity:0.12}}.engines-phys-broad-narrow-k1{animation:engines-phys-broad-narrow-g1 7s ease-in-out infinite}@keyframes engines-phys-broad-narrow-g1{0%,28%{fill-opacity:0.12}32%,44%{fill-opacity:0.35}50%,100%{fill-opacity:0.12}}.engines-phys-broad-narrow-k2{animation:engines-phys-broad-narrow-g2 7s ease-in-out infinite}@keyframes engines-phys-broad-narrow-g2{0%,56%{fill-opacity:0.12}60%,72%{fill-opacity:0.35}78%,100%{fill-opacity:0.12}}</style><text class=\"engines-phys-broad-narrow-h\" x=\"24\" y=\"24\">7 bodies, 21 possible pairs</text><g class=\"engines-phys-broad-narrow-ab\"><rect x=\"56\" y=\"76\" width=\"68\" height=\"68\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><rect x=\"110\" y=\"105\" width=\"60\" height=\"60\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><rect x=\"220\" y=\"60\" width=\"80\" height=\"80\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><rect x=\"294\" y=\"124\" width=\"52\" height=\"52\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><rect x=\"80\" y=\"210\" width=\"60\" height=\"60\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><rect x=\"136\" y=\"170\" width=\"72\" height=\"72\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><rect x=\"306\" y=\"228\" width=\"48\" height=\"48\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/></g><rect class=\"engines-phys-broad-narrow-ok\" x=\"110\" y=\"105\" width=\"14\" height=\"39\" fill=\"var(--fig-warn)\" fill-opacity=\"0.7\"/><rect class=\"engines-phys-broad-narrow-fp\" x=\"294\" y=\"124\" width=\"6\" height=\"16\" fill=\"var(--fig-warn)\" fill-opacity=\"0.7\"/><rect class=\"engines-phys-broad-narrow-fp\" x=\"136\" y=\"210\" width=\"4\" height=\"32\" fill=\"var(--fig-warn)\" fill-opacity=\"0.7\"/><circle cx=\"90\" cy=\"110\" r=\"34\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><circle cx=\"140\" cy=\"135\" r=\"30\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><path d=\"M260 60L300 100L260 140L220 100Z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><circle cx=\"320\" cy=\"150\" r=\"26\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><circle cx=\"110\" cy=\"240\" r=\"30\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><path d=\"M172 170L208 206L172 242L136 206Z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><circle cx=\"330\" cy=\"252\" r=\"24\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><g class=\"engines-phys-broad-narrow-ct\"><line x1=\"120.4\" y1=\"125.2\" x2=\"152\" y2=\"141\" stroke=\"var(--fig-bad)\" stroke-width=\"2\"/><path d=\"M156 143l-9.5-0.5l3.6-6.8z\" fill=\"var(--fig-bad)\"/><circle cx=\"120.4\" cy=\"125.2\" r=\"3.5\" fill=\"var(--fig-bad)\"/><text class=\"engines-phys-broad-narrow-t\" x=\"40\" y=\"60\" style=\"fill:var(--fig-bad)\">contact: normal + depth</text></g><g class=\"engines-phys-broad-narrow-x\"><text class=\"engines-phys-broad-narrow-m engines-phys-broad-narrow-c\" x=\"320\" y=\"198\">AABBs overlap, no contact</text><text class=\"engines-phys-broad-narrow-m engines-phys-broad-narrow-c\" x=\"140\" y=\"292\">AABBs overlap, no contact</text></g><rect class=\"engines-phys-broad-narrow-k0\" x=\"416\" y=\"44\" width=\"204\" height=\"62\" rx=\"10\" fill=\"var(--fig-muted)\" fill-opacity=\"0.12\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"engines-phys-broad-narrow-t\" x=\"432\" y=\"70\">All pairs</text><text class=\"engines-phys-broad-narrow-h\" x=\"432\" y=\"91\">21 tests</text><path d=\"M518 110v12m-5 -5l5 5l5 -5\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" fill=\"none\"/><rect class=\"engines-phys-broad-narrow-k1\" x=\"416\" y=\"126\" width=\"204\" height=\"62\" rx=\"10\" fill=\"var(--fig-warn)\" fill-opacity=\"0.12\" stroke=\"var(--fig-warn)\" stroke-width=\"1.5\"/><text class=\"engines-phys-broad-narrow-t\" x=\"432\" y=\"152\">Broad phase (AABB)</text><text class=\"engines-phys-broad-narrow-h\" x=\"432\" y=\"173\">3 candidate pairs</text><path d=\"M518 192v12m-5 -5l5 5l5 -5\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" fill=\"none\"/><rect class=\"engines-phys-broad-narrow-k2\" x=\"416\" y=\"208\" width=\"204\" height=\"62\" rx=\"10\" fill=\"var(--fig-bad)\" fill-opacity=\"0.12\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\"/><text class=\"engines-phys-broad-narrow-t\" x=\"432\" y=\"234\">Narrow phase (exact)</text><text class=\"engines-phys-broad-narrow-h\" x=\"432\" y=\"255\">1 contact manifold</text></svg>"
        },
        {
          "type": "list",
          "items": [
            "Broad phase cost scales with body count and movement, and narrow phase with candidate pairs times shape complexity.",
            "Collision layers and masks prune pairs before the narrow phase, so decide early which categories ever interact.",
            "Sleeping bodies at rest are excluded until something wakes them, which makes large piles of static debris almost free."
          ]
        },
        {
          "type": "h",
          "text": "Tunnelling and continuous collision detection"
        },
        {
          "type": "p",
          "text": "Discrete collision tests positions only at step boundaries. A bullet at 120 m/s with a 1/60 s step moves 2 m per step. A fence 0.1 m thick is simply stepped over: at step n the bullet is before it, at n+1 after, and no overlap is ever observed. Fixes: **continuous collision detection (CCD)**, which sweeps the shape along its motion path and finds the **time of impact**, then stops or resolves there; **speculative contacts**, which create contacts for near-future overlaps and let the solver limit velocity so objects cannot pass; thicker colliders; or, for projectiles, a **raycast** along the movement segment each step, which is the cheapest and most common solution. CCD costs extra, so engines apply it selectively to fast bodies only."
        },
        {
          "type": "figure",
          "id": "engines-phys-tunnelling",
          "caption": "At 2 m per step the bullet is before the 0.1 m fence at n and past it at n+1, so no overlap is ever seen; a swept test finds the hit at about 0.46 of the step.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 270\" role=\"img\" aria-label=\"A bullet moving 2 m per step jumps from before a 0.1 m fence to after it and is never seen overlapping it; with continuous collision detection the swept path hits the fence at about 0.46 of the step\"><style>.engines-phys-tunnelling-t{font-size:13px;fill:var(--fig-ink)}.engines-phys-tunnelling-m{font-size:13px;fill:var(--fig-muted)}.engines-phys-tunnelling-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-phys-tunnelling-c{text-anchor:middle}.engines-phys-tunnelling-e{text-anchor:end}.engines-phys-tunnelling-db{animation:engines-phys-tunnelling-d 6s linear infinite}@keyframes engines-phys-tunnelling-d{0%{transform:translateX(480px)}3%,24.9%{transform:translateX(0)}25%,49.9%{transform:translateX(160px)}50%,74.9%{transform:translateX(320px)}75%,100%{transform:translateX(480px)}}.engines-phys-tunnelling-cb{animation:engines-phys-tunnelling-b 6s linear infinite}@keyframes engines-phys-tunnelling-b{0%{transform:translateX(233px)}3%{transform:translateX(0)}39.4%,100%{transform:translateX(233px)}}.engines-phys-tunnelling-hit{transform-box:fill-box;transform-origin:center;animation:engines-phys-tunnelling-h 6s ease-out infinite}@keyframes engines-phys-tunnelling-h{0%{opacity:1;transform:scale(1)}3%,39.4%{opacity:0;transform:scale(0.4)}42.4%{opacity:1;transform:scale(1.2)}47.4%,100%{opacity:1;transform:scale(1)}}</style><text class=\"engines-phys-tunnelling-h\" x=\"24\" y=\"24\">Discrete: test only at step positions</text><text class=\"engines-phys-tunnelling-t engines-phys-tunnelling-e\" x=\"616\" y=\"24\" style=\"fill:var(--fig-bad)\">never overlaps: tunnels</text><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"304\" y=\"42\">fence 0.1 m</text><line x1=\"40\" y1=\"74\" x2=\"600\" y2=\"74\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"2 4\"/><rect x=\"300\" y=\"48\" width=\"8\" height=\"52\" rx=\"2\" fill=\"var(--fig-ink)\"/><circle cx=\"60\" cy=\"74\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"60\" y=\"100\">n-1</text><circle cx=\"220\" cy=\"74\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"220\" y=\"100\">n</text><circle cx=\"380\" cy=\"74\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"380\" y=\"100\">n+1</text><circle cx=\"540\" cy=\"74\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"540\" y=\"100\">n+2</text><circle class=\"engines-phys-tunnelling-db\" cx=\"60\" cy=\"74\" r=\"7\" fill=\"var(--fig-bad)\"/><path d=\"M220 110v6H380v-6\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" fill=\"none\"/><text class=\"engines-phys-tunnelling-t engines-phys-tunnelling-c\" x=\"300\" y=\"132\">2 m per 1/60 s step at 120 m/s</text><text class=\"engines-phys-tunnelling-h\" x=\"24\" y=\"164\">CCD: sweep the motion, find time of impact</text><text class=\"engines-phys-tunnelling-t engines-phys-tunnelling-e\" x=\"616\" y=\"164\" style=\"fill:var(--fig-ok)\">hit at t ≈ 0.46 of the step</text><line x1=\"40\" y1=\"210\" x2=\"600\" y2=\"210\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"2 4\"/><rect x=\"300\" y=\"184\" width=\"8\" height=\"52\" rx=\"2\" fill=\"var(--fig-ink)\"/><rect x=\"220\" y=\"203\" width=\"160\" height=\"14\" rx=\"7\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><rect x=\"213\" y=\"203\" width=\"87\" height=\"14\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\"/><circle cx=\"60\" cy=\"210\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"60\" y=\"236\">n-1</text><circle cx=\"220\" cy=\"210\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"220\" y=\"236\">n</text><circle cx=\"380\" cy=\"210\" r=\"6.25\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"380\" y=\"236\">n+1</text><circle class=\"engines-phys-tunnelling-hit\" cx=\"300\" cy=\"210\" r=\"14\" fill=\"none\" stroke=\"var(--fig-ok)\" stroke-width=\"2\"/><circle class=\"engines-phys-tunnelling-cb\" cx=\"60\" cy=\"210\" r=\"7\" fill=\"var(--fig-accent)\"/><text class=\"engines-phys-tunnelling-m engines-phys-tunnelling-c\" x=\"293\" y=\"254\">time of impact</text></svg>"
        },
        {
          "type": "h",
          "text": "Raycasts and queries"
        },
        {
          "type": "p",
          "text": "Besides simulation, physics provides **scene queries**: a **raycast** (first hit along a ray), **shape casts** or sweeps (a sphere or capsule swept along a path, ideal for character ground checks and melee), and **overlap tests** (what is inside this volume). These reuse the broad-phase structure and are the backbone of hit-scan weapons, line of sight, ground detection and AI perception. Their cost depends on layer masks and ray length, so a cast against everything out to 1,000 m every frame for 500 agents adds up. Queries run against the state at the last simulation step, so call them from the same stage that owns that data."
        },
        {
          "type": "h",
          "text": "Why physics runs at a fixed rate, and determinism"
        },
        {
          "type": "p",
          "text": "The accumulator loop itself is covered in 'The game loop and time'; here is why physics in particular insists on it. Integrators and solvers are tuned for a specific step size. Stacks stable at 1/60 s may jitter or explode at 1/20 s, and warm-starting contact impulses across frames assumes similar steps. A fixed step (Unity defaults to 0.02 s, i.e. 50 Hz; Box2D docs recommend 1/60 s) gives bounded cost per step and an easy knob for accuracy against CPU load. It is also required for **determinism**: the same inputs producing the same results, needed for replays, lockstep multiplayer and reproducible bugs. True determinism is harder than a fixed step: floating-point results can differ across CPUs, compilers and instruction sets (fused multiply-add, SIMD), body and contact ordering must be stable, and threading must not reorder solver work. Engines advertise cross-platform determinism only in specific modes, so verify rather than assume."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Never move a physics body by setting its transform directly every frame. This teleports it and bypasses collision, so it tunnels and breaks contacts. Drive bodies with velocities or forces, or use kinematic movement that the engine sweeps properly."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents routinely mix transform writes with rigidbody physics, apply forces in per-frame update, and raycast in loops with no layer masks. Tell the agent which code runs at the physics rate, which collision layers exist, and the top speed of the fastest object. Verify with a test that fires the fastest projectile at the thinnest wall at several frame rates, and check for tunnelling and jitter. Treat any claim of 'deterministic physics' with suspicion until you have replayed the same inputs on two machines."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A rocket or ball passes through thin walls on slow devices or at high speed",
              "use": "Continuous collision detection (CCD)",
              "why": "Swept tests or speculative contacts catch collisions between discrete steps. Costs more per body, so enable it only on fast objects; thickening colliders or smaller steps are partial fixes."
            },
            {
              "signal": "Bullets are simulated as tiny rigidbodies and sometimes miss targets they visibly crossed",
              "use": "Swept raycast for projectiles",
              "why": "Each step, cast a ray or shape from the previous to the new position and resolve the first hit. Exact and cheap for fast projectiles; you lose free physical bouncing unless you add it yourself."
            },
            {
              "signal": "Raycasts hit the shooter's own collider, and debris, bullets and ragdolls test against each other needlessly",
              "use": "Collision layers and layer masks",
              "why": "Assign layers and disable pairs in the collision matrix, and pass masks to queries. Fewer pairs in the broad phase and fewer false hits; the matrix becomes shared config that must be documented."
            },
            {
              "signal": "Code needs to know when the player enters a zone or pickup, without anything being pushed",
              "use": "Trigger volumes",
              "why": "Trigger colliders report overlaps but produce no contact response. Most engines need a body on at least one side to raise events, and fast movers can skip a thin trigger between steps."
            },
            {
              "signal": "Physics cost stays high in a scene where hundreds of crates have stopped moving",
              "use": "Let resting bodies sleep",
              "why": "Bodies below a velocity threshold for a while are skipped until something wakes them. Applying tiny forces each frame keeps them awake; teleporting a body without waking neighbours leaves things floating."
            },
            {
              "signal": "A dynamic object uses a detailed concave mesh collider and collisions are slow or unreliable",
              "use": "Compound of convex primitives",
              "why": "Approximate the shape with boxes, spheres, capsules or convex hulls; these are fast and robust for dynamic bodies. Keep arbitrary concave meshes for static level geometry."
            },
            {
              "signal": "Forces or velocity changes are applied in the per-frame update, so acceleration differs between 30 and 144 fps",
              "use": "Apply forces in the fixed physics step",
              "why": "Run force and velocity code where the physics step runs, and read input per frame into state the step consumes. Keeps physics rate-independent; one-shot impulses need care not to apply twice or be missed."
            },
            {
              "signal": "A custom spring or orbit integrated with `v += a*dt; x += v*dt` in the wrong order gains energy and explodes",
              "use": "Semi-implicit Euler integration",
              "why": "Update velocity first, then position with the new velocity; nearly free and far more stable at game step sizes. For stiff springs use smaller substeps; Verlet or RK4 fit cloth or high-precision cases."
            },
            {
              "signal": "The player capsule is a dynamic rigidbody and jitters on slopes, bounces off steps and gets shoved by props",
              "use": "Kinematic character controller",
              "why": "Move the character yourself with sweeps and resolve slopes and steps explicitly, keeping full control of feel. You must implement pushing and being pushed, so physics interaction is less automatic."
            },
            {
              "signal": "A ledge-grab or ground check with one thin ray misses edges that the capsule clearly overlaps",
              "use": "Shape cast query",
              "why": "Sweep or overlap the actual capsule or sphere so the query matches the body's volume. More expensive than a ray; filter with layer masks and keep the cast distance short."
            },
            {
              "signal": "The profiler shows garbage allocations from physics queries called every frame",
              "use": "Non-allocating query buffers",
              "why": "Use the query variants that write hits into a preallocated array and reuse it. Removes GC spikes; size the buffer for the worst case or detect when it fills."
            }
          ]
        }
      ],
      "keyPoints": [
        "Semi-implicit Euler is the cheap, stable default integrator; explicit Euler gains energy at larger steps.",
        "Collision runs in two phases: a conservative broad phase finds candidate pairs, and a narrow phase produces exact contact manifolds.",
        "Dynamic bodies use primitive, convex or compound colliders; arbitrary concave meshes are for static geometry.",
        "Tunnelling comes from discrete tests on fast or thin objects; use CCD, speculative contacts or swept raycasts.",
        "Fixed-rate physics gives stability, bounded cost and the prerequisite for determinism, which also needs stable ordering and consistent floating-point behaviour."
      ],
      "quiz": [
        {
          "q": "A 0.05 m thick glass pane is passed through by a ball moving at 30 m/s with a 0.02 s physics step. Which fix targets the root cause?",
          "options": [
            "Increase solver iterations so contacts resolve more accurately.",
            "Switch the ball's collider from a sphere to a mesh collider.",
            "Enable continuous collision detection for the ball so its motion is swept.",
            "Lower the gravity so the ball moves more slowly."
          ],
          "answer": 2,
          "explain": "The ball moves 0.6 m per step, far more than the pane thickness, so no overlap is ever observed. Sweeping detects the time of impact; more solver iterations only act on contacts that exist."
        },
        {
          "q": "What does the broad phase guarantee?",
          "options": [
            "Every pair that it reports is guaranteed to be actually in contact right now.",
            "It never misses a pair that could touch, though it may report pairs that do not.",
            "It computes the exact penetration depth and contact normal for every reported pair.",
            "It removes the need for a narrow phase whenever the shapes involved are convex."
          ],
          "answer": 1,
          "explain": "The broad phase is conservative: false positives are filtered by the narrow phase, but false negatives would mean missed collisions. Exact contact data comes from the narrow phase."
        },
        {
          "q": "A stack of crates is stable in the editor at 60 fps but jitters and collapses on a slow device when physics runs once per variable-length frame. What is the best fix?",
          "options": [
            "Run physics at a fixed step with an accumulator, and cap the steps allowed per frame.",
            "Increase the mass of every crate so that they resist being moved by contacts.",
            "Switch the crates to concave mesh colliders in order to gain accuracy at contacts.",
            "Run physics on a separate thread but keep passing it the variable frame time."
          ],
          "answer": 0,
          "explain": "Solver stability and warm-starting depend on a consistent step, which variable frame times break. A thread alone still passes in inconsistent dt, and mass or collider tweaks do not address the cause."
        },
        {
          "q": "A dev wants a ledge-grab check that works for a capsule character. Which query is most appropriate?",
          "options": [
            "A single raycast fired from the centre of the character toward the ledge.",
            "A mesh collider overlap test run against the entire level geometry each frame.",
            "A trigger volume placed by hand on every single ledge in the level.",
            "A capsule or sphere cast, which accounts for the width of the character body."
          ],
          "answer": 3,
          "explain": "A zero-width ray can slip through gaps that the character's body cannot, so a shape cast matches the real volume. Level-wide mesh overlaps and per-ledge triggers are heavier and more error-prone."
        },
        {
          "q": "A lockstep multiplayer game uses a fixed physics step, yet two players' simulations drift apart after a few minutes. Which factor could still cause it?",
          "options": [
            "The fixed step is too small to keep both machines in agreement over time.",
            "Different floating-point behaviour or contact ordering on each machine could do it.",
            "The broad phase uses AABBs, which are not exact enough for lockstep play.",
            "The integrator is semi-implicit rather than explicit, so results differ per player."
          ],
          "answer": 1,
          "explain": "A fixed step is necessary but not sufficient: differing instruction sets, compilers or processing order change results bit-for-bit, and errors compound. The choice of integrator is not what breaks cross-machine agreement."
        },
        {
          "q": "A hitscan raycast keeps hitting the shooter's own collider, and shell casings, debris and ragdoll limbs all test against each other, wasting physics time. What should you reach for?",
          "options": [
            "Collision layers with layer masks on queries and bodies",
            "Continuous collision detection on every single rigidbody",
            "Trigger volumes placed around the shooter's body",
            "Letting every resting body fall asleep after a delay"
          ],
          "answer": 0,
          "explain": "Layers and masks decide which pairs and queries are tested at all, removing self-hits and debris-on-debris work. CCD fixes tunnelling and sleeping helps only motionless bodies, so neither changes which colliders are considered."
        }
      ]
    },
    {
      "id": "engines-animation",
      "title": "Animation",
      "minutes": 13,
      "summary": "How engines turn keyframes into skinned, blended, IK-corrected characters at 60 fps, and how animation data is compressed.",
      "lesson": [
        {
          "type": "p",
          "text": "A hero character has 70 bones, 40 animation clips (idle, walk, run, jump, a dozen attacks) and must transition smoothly between them in response to a controller that gives no warning. Meanwhile 30 enemies on screen do the same. Animation is a runtime system that samples data, blends it, corrects it, and hands a pose to the renderer, all inside a budget of maybe 1-3 ms of CPU per frame for the whole scene. Understanding the pipeline is what lets you diagnose foot sliding, popping transitions and memory bloat."
        },
        {
          "type": "h",
          "text": "Keyframes and curves"
        },
        {
          "type": "p",
          "text": "An animation clip is a set of **curves**, one per animated channel (for example `bone_17.position.x`, or a quaternion component). Artists author sparse **keyframes**; the runtime interpolates between them. Linear interpolation is cheap but gives visible corners; Bezier or Hermite tangents give smooth motion at the cost of storing tangents. Rotations are stored as unit quaternions and interpolated with nlerp (normalized linear) or slerp, never as independently interpolated Euler angles, which cause gimbal artifacts and non-uniform speed. Sampling a clip at time `t` means: find the surrounding keys for each curve (binary search or a cached cursor), interpolate, write the result into a pose."
        },
        {
          "type": "figure",
          "id": "engines-keyframe-curves",
          "caption": "Linear interpolation leaves corners at each key; Hermite tangents pass through the same keys smoothly. Sampling at t only needs the two surrounding keys.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 270\" role=\"img\" aria-label=\"Animation curve with four keyframes: a dashed linear interpolation with corners and a smooth Hermite curve; a playhead sweeps time, highlighting the two surrounding keys and sampling the curve.\"><style>.engines-keyframe-curves-t{font-size:14px;fill:var(--fig-ink)}.engines-keyframe-curves-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-keyframe-curves-s{font-size:13px;fill:var(--fig-muted)}.engines-keyframe-curves-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-keyframe-curves-c{text-anchor:middle}.engines-keyframe-curves-e{text-anchor:end}.engines-keyframe-curves-ax{stroke:var(--fig-line);stroke-width:1.5}.engines-keyframe-curves-lin{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:5 5}.engines-keyframe-curves-cv{fill:none;stroke:var(--fig-accent);stroke-width:2.5}.engines-keyframe-curves-k{fill:var(--fig-bg);stroke:var(--fig-ink);stroke-width:2}.engines-keyframe-curves-r{fill:none;stroke:var(--fig-accent2);stroke-width:2.5}.engines-keyframe-curves-ph{stroke:var(--fig-accent2);stroke-width:1.5}.engines-keyframe-curves-d{fill:var(--fig-accent2)}.engines-keyframe-curves-hd{animation:engines-keyframe-curves-hd 6s linear infinite}.engines-keyframe-curves-dt{animation:engines-keyframe-curves-dt 6s linear infinite}@keyframes engines-keyframe-curves-hd{0%{transform:translateX(70px)}90%,100%{transform:translateX(570px)}}@keyframes engines-keyframe-curves-dt{0%{transform:translate(70px,210.8px)}4.5%{transform:translate(95px,202.6px)}9%{transform:translate(120px,181.9px)}13.5%{transform:translate(145px,154.7px)}18%{transform:translate(170px,127px)}22.5%{transform:translate(195px,104.8px)}27%{transform:translate(220px,94px)}31.5%{transform:translate(245px,97.6px)}36%{transform:translate(270px,111.4px)}40.5%{transform:translate(295px,130.6px)}45%{transform:translate(320px,150.6px)}49.5%{transform:translate(345px,166.6px)}54%{transform:translate(370px,174px)}58.5%{transform:translate(395px,172.6px)}63%{transform:translate(420px,166.4px)}67.5%{transform:translate(445px,157px)}72%{transform:translate(470px,145.9px)}76.5%{transform:translate(495px,134.6px)}81%{transform:translate(520px,124.6px)}85.5%{transform:translate(545px,117.5px)}90%{transform:translate(570px,114.8px)}100%{transform:translate(570px,114.8px)}}.engines-keyframe-curves-r0{animation:engines-keyframe-curves-r0 6s linear infinite}@keyframes engines-keyframe-curves-r0{0%,26.5%{opacity:1}27%,100%{opacity:0}}.engines-keyframe-curves-r1{animation:engines-keyframe-curves-r1 6s linear infinite}@keyframes engines-keyframe-curves-r1{0%,53.5%{opacity:1}54%,100%{opacity:0}}.engines-keyframe-curves-r2{animation:engines-keyframe-curves-r2 6s linear infinite}@keyframes engines-keyframe-curves-r2{0%,26.5%{opacity:0}27%,100%{opacity:1}}.engines-keyframe-curves-r3{animation:engines-keyframe-curves-r3 6s linear infinite}@keyframes engines-keyframe-curves-r3{0%,53.5%{opacity:0}54%,100%{opacity:1}}</style><line class=\"engines-keyframe-curves-ax\" x1=\"70\" y1=\"60\" x2=\"70\" y2=\"230\"/><line class=\"engines-keyframe-curves-ax\" x1=\"70\" y1=\"230\" x2=\"590\" y2=\"230\"/><text class=\"engines-keyframe-curves-s\" x=\"78\" y=\"40\">curve: bone_17.position.x</text><line class=\"engines-keyframe-curves-lin\" x1=\"370\" y1=\"36\" x2=\"394\" y2=\"36\"/><text class=\"engines-keyframe-curves-s\" x=\"400\" y=\"40\">linear</text><line class=\"engines-keyframe-curves-cv\" x1=\"460\" y1=\"36\" x2=\"484\" y2=\"36\"/><text class=\"engines-keyframe-curves-s\" x=\"490\" y=\"40\">Hermite</text><polyline class=\"engines-keyframe-curves-lin\" points=\"70,210.8 220,94 370,174 570,114.8\"/><path class=\"engines-keyframe-curves-cv\" d=\"M70 210.8C120 210.8 170 100.1 220 94C270 87.9 320 171 370 174C436.7 178 503.3 114.8 570 114.8\"/><g class=\"engines-keyframe-curves-hd\" transform=\"translate(295,0)\"><line class=\"engines-keyframe-curves-ph\" x1=\"0\" y1=\"62\" x2=\"0\" y2=\"230\"/><text class=\"engines-keyframe-curves-s engines-keyframe-curves-c\" x=\"0\" y=\"252\">sample t</text></g><circle class=\"engines-keyframe-curves-r engines-keyframe-curves-r0\" cx=\"70\" cy=\"210.8\" r=\"11\" opacity=\"0\"/><circle class=\"engines-keyframe-curves-k\" cx=\"70\" cy=\"210.8\" r=\"6\"/><circle class=\"engines-keyframe-curves-r engines-keyframe-curves-r1\" cx=\"220\" cy=\"94\" r=\"11\" opacity=\"1\"/><circle class=\"engines-keyframe-curves-k\" cx=\"220\" cy=\"94\" r=\"6\"/><circle class=\"engines-keyframe-curves-r engines-keyframe-curves-r2\" cx=\"370\" cy=\"174\" r=\"11\" opacity=\"1\"/><circle class=\"engines-keyframe-curves-k\" cx=\"370\" cy=\"174\" r=\"6\"/><circle class=\"engines-keyframe-curves-r engines-keyframe-curves-r3\" cx=\"570\" cy=\"114.8\" r=\"11\" opacity=\"0\"/><circle class=\"engines-keyframe-curves-k\" cx=\"570\" cy=\"114.8\" r=\"6\"/><text class=\"engines-keyframe-curves-s\" x=\"220\" y=\"76\" text-anchor=\"middle\">key</text><g class=\"engines-keyframe-curves-dt\" transform=\"translate(295,130.6)\"><circle class=\"engines-keyframe-curves-d\" r=\"6\"/></g><text class=\"engines-keyframe-curves-s engines-keyframe-curves-e\" x=\"590\" y=\"252\">time</text><text class=\"engines-keyframe-curves-s\" x=\"64\" y=\"56\" text-anchor=\"end\">v</text></svg>"
        },
        {
          "type": "h",
          "text": "Skeletons and skinning"
        },
        {
          "type": "p",
          "text": "A **skeleton** is a hierarchy of bones. Each bone stores a local transform relative to its parent. A **pose** is the array of local transforms for all bones. To render, the engine walks the hierarchy once, multiplying each local transform by its parent's world transform to get a model-space matrix per bone. Because a mesh is authored in a bind pose, each bone also has an **inverse bind matrix**; the skinning matrix is `world_bone * inverse_bind`."
        },
        {
          "type": "p",
          "text": "**Linear blend skinning** gives each vertex up to 4 (sometimes 8) bone indices and weights summing to 1. The vertex shader computes the weighted sum of the bone matrices applied to the bind-pose position. Cost is per vertex, so a 50k-vertex character with 4 influences does 200k matrix-vector products per frame, which is trivial on GPU and expensive on CPU. Modern engines skin on the GPU (vertex shader or compute) and upload a palette of bone matrices (for 70 bones, about 70 x 48 bytes = 3.4 KB per character instance). The known artifact of linear blending is the candy-wrapper collapse at twisting joints; fixes are dual-quaternion skinning, corrective blend shapes, or extra twist bones."
        },
        {
          "type": "figure",
          "id": "engines-skinning-weights",
          "caption": "Vertices weighted 0.25, 0.5 and 0.75 to the forearm move only part of the way as the elbow bends, so the skin stays connected across the joint.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"An arm made of an upper-arm bone and a forearm bone bends at the elbow. Skin vertices weighted fully to one bone follow it rigidly; vertices near the elbow with weights 0.25, 0.5 and 0.75 move only part of the way, which keeps the skin connected.\"><style>.engines-skinning-weights-t{font-size:14px;fill:var(--fig-ink)}.engines-skinning-weights-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-skinning-weights-s{font-size:13px;fill:var(--fig-muted)}.engines-skinning-weights-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-skinning-weights-c{text-anchor:middle}.engines-skinning-weights-e{text-anchor:end}.engines-skinning-weights-bind{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 5}.engines-skinning-weights-ua{stroke:var(--fig-accent);stroke-width:5;stroke-linecap:round}.engines-skinning-weights-fa{stroke:var(--fig-accent2);stroke-width:5;stroke-linecap:round}.engines-skinning-weights-j{fill:var(--fig-bg);stroke:var(--fig-ink);stroke-width:2}.engines-skinning-weights-v0{fill:var(--fig-accent)}.engines-skinning-weights-v1{fill:var(--fig-accent2)}.engines-skinning-weights-vm{fill:var(--fig-bg);stroke:var(--fig-ink);stroke-width:2}.engines-skinning-weights-arm{transform-box:view-box;transform-origin:325px 210px;animation:engines-skinning-weights-arm 5s linear infinite}@keyframes engines-skinning-weights-arm{0%{transform:rotate(0deg)}10%{transform:rotate(-8.6deg)}20%{transform:rotate(-27.5deg)}30%{transform:rotate(-46.4deg)}40%{transform:rotate(-55deg)}60%{transform:rotate(-55deg)}70%{transform:rotate(-46.4deg)}80%{transform:rotate(-27.5deg)}90%{transform:rotate(-8.6deg)}100%{transform:rotate(0deg)}}.engines-skinning-weights-m0{animation:engines-skinning-weights-m0 5s linear infinite}@keyframes engines-skinning-weights-m0{0%{transform:translate(0px,0px)}10%{transform:translate(-1px,1.2px)}20%{transform:translate(-2.6px,4.3px)}30%{transform:translate(-3.1px,7.8px)}40%{transform:translate(-2.9px,9.3px)}60%{transform:translate(-2.9px,9.3px)}70%{transform:translate(-3.1px,7.8px)}80%{transform:translate(-2.6px,4.3px)}90%{transform:translate(-1px,1.2px)}100%{transform:translate(0px,0px)}}.engines-skinning-weights-m1{animation:engines-skinning-weights-m1 5s linear infinite}@keyframes engines-skinning-weights-m1{0%{transform:translate(0px,0px)}10%{transform:translate(1.2px,1px)}20%{transform:translate(4.3px,2.6px)}30%{transform:translate(7.8px,3.1px)}40%{transform:translate(9.3px,2.9px)}60%{transform:translate(9.3px,2.9px)}70%{transform:translate(7.8px,3.1px)}80%{transform:translate(4.3px,2.6px)}90%{transform:translate(1.2px,1px)}100%{transform:translate(0px,0px)}}.engines-skinning-weights-m2{animation:engines-skinning-weights-m2 5s linear infinite}@keyframes engines-skinning-weights-m2{0%{transform:translate(0px,0px)}10%{transform:translate(-2.2px,0.2px)}20%{transform:translate(-6.9px,1.7px)}30%{transform:translate(-10.9px,4.7px)}40%{transform:translate(-12.3px,6.4px)}60%{transform:translate(-12.3px,6.4px)}70%{transform:translate(-10.9px,4.7px)}80%{transform:translate(-6.9px,1.7px)}90%{transform:translate(-2.2px,0.2px)}100%{transform:translate(0px,0px)}}.engines-skinning-weights-m3{animation:engines-skinning-weights-m3 5s linear infinite}@keyframes engines-skinning-weights-m3{0%{transform:translate(0px,0px)}10%{transform:translate(2.2px,-0.2px)}20%{transform:translate(6.9px,-1.7px)}30%{transform:translate(10.9px,-4.7px)}40%{transform:translate(12.3px,-6.4px)}60%{transform:translate(12.3px,-6.4px)}70%{transform:translate(10.9px,-4.7px)}80%{transform:translate(6.9px,-1.7px)}90%{transform:translate(2.2px,-0.2px)}100%{transform:translate(0px,0px)}}.engines-skinning-weights-m4{animation:engines-skinning-weights-m4 5s linear infinite}@keyframes engines-skinning-weights-m4{0%{transform:translate(0px,0px)}10%{transform:translate(-3.6px,-3.1px)}20%{transform:translate(-12.9px,-7.8px)}30%{transform:translate(-23.3px,-9.3px)}40%{transform:translate(-28px,-8.8px)}60%{transform:translate(-28px,-8.8px)}70%{transform:translate(-23.3px,-9.3px)}80%{transform:translate(-12.9px,-7.8px)}90%{transform:translate(-3.6px,-3.1px)}100%{transform:translate(0px,0px)}}.engines-skinning-weights-m5{animation:engines-skinning-weights-m5 5s linear infinite}@keyframes engines-skinning-weights-m5{0%{transform:translate(0px,0px)}10%{transform:translate(3.1px,-3.6px)}20%{transform:translate(7.8px,-12.9px)}30%{transform:translate(9.3px,-23.3px)}40%{transform:translate(8.8px,-28px)}60%{transform:translate(8.8px,-28px)}70%{transform:translate(9.3px,-23.3px)}80%{transform:translate(7.8px,-12.9px)}90%{transform:translate(3.1px,-3.6px)}100%{transform:translate(0px,0px)}}</style><polygon class=\"engines-skinning-weights-bind\" points=\"150,180 190,180 230,180 265,180 295,180 325,180 355,180 390,180 430,180 470,180 505,180 505,240 470,240 430,240 390,240 355,240 325,240 295,240 265,240 230,240 190,240 150,240\"/><text class=\"engines-skinning-weights-s\" x=\"150\" y=\"264\">bind pose</text><line class=\"engines-skinning-weights-ua\" x1=\"130\" y1=\"210\" x2=\"325\" y2=\"210\"/><g class=\"engines-skinning-weights-arm\" transform=\"rotate(-55)\"><line class=\"engines-skinning-weights-fa\" x1=\"325\" y1=\"210\" x2=\"505\" y2=\"210\"/><circle class=\"engines-skinning-weights-v1\" cx=\"390\" cy=\"180\" r=\"5\"/><circle class=\"engines-skinning-weights-v1\" cx=\"390\" cy=\"240\" r=\"5\"/><circle class=\"engines-skinning-weights-v1\" cx=\"430\" cy=\"180\" r=\"5\"/><circle class=\"engines-skinning-weights-v1\" cx=\"430\" cy=\"240\" r=\"5\"/><circle class=\"engines-skinning-weights-v1\" cx=\"470\" cy=\"180\" r=\"5\"/><circle class=\"engines-skinning-weights-v1\" cx=\"470\" cy=\"240\" r=\"5\"/><circle class=\"engines-skinning-weights-v1\" cx=\"505\" cy=\"180\" r=\"5\"/><circle class=\"engines-skinning-weights-v1\" cx=\"505\" cy=\"240\" r=\"5\"/><circle class=\"engines-skinning-weights-j\" cx=\"505\" cy=\"210\" r=\"6\"/></g><circle class=\"engines-skinning-weights-v0\" cx=\"150\" cy=\"180\" r=\"5\"/><circle class=\"engines-skinning-weights-v0\" cx=\"150\" cy=\"240\" r=\"5\"/><circle class=\"engines-skinning-weights-v0\" cx=\"190\" cy=\"180\" r=\"5\"/><circle class=\"engines-skinning-weights-v0\" cx=\"190\" cy=\"240\" r=\"5\"/><circle class=\"engines-skinning-weights-v0\" cx=\"230\" cy=\"180\" r=\"5\"/><circle class=\"engines-skinning-weights-v0\" cx=\"230\" cy=\"240\" r=\"5\"/><circle class=\"engines-skinning-weights-v0\" cx=\"265\" cy=\"180\" r=\"5\"/><circle class=\"engines-skinning-weights-v0\" cx=\"265\" cy=\"240\" r=\"5\"/><circle class=\"engines-skinning-weights-vm engines-skinning-weights-m0\" cx=\"295\" cy=\"180\" r=\"5\" transform=\"translate(-2.9,9.3)\"/><circle class=\"engines-skinning-weights-vm engines-skinning-weights-m1\" cx=\"295\" cy=\"240\" r=\"5\" transform=\"translate(9.3,2.9)\"/><circle class=\"engines-skinning-weights-vm engines-skinning-weights-m2\" cx=\"325\" cy=\"180\" r=\"5\" transform=\"translate(-12.3,6.4)\"/><circle class=\"engines-skinning-weights-vm engines-skinning-weights-m3\" cx=\"325\" cy=\"240\" r=\"5\" transform=\"translate(12.3,-6.4)\"/><circle class=\"engines-skinning-weights-vm engines-skinning-weights-m4\" cx=\"355\" cy=\"180\" r=\"5\" transform=\"translate(-28,-8.8)\"/><circle class=\"engines-skinning-weights-vm engines-skinning-weights-m5\" cx=\"355\" cy=\"240\" r=\"5\" transform=\"translate(8.8,-28)\"/><circle class=\"engines-skinning-weights-j\" cx=\"130\" cy=\"210\" r=\"7\"/><circle class=\"engines-skinning-weights-j\" cx=\"325\" cy=\"210\" r=\"7\"/><circle class=\"engines-skinning-weights-v0\" cx=\"30\" cy=\"36\" r=\"6\"/><text class=\"engines-skinning-weights-t\" x=\"44\" y=\"41\">upper arm, weight 1</text><circle class=\"engines-skinning-weights-vm\" cx=\"30\" cy=\"64\" r=\"6\"/><text class=\"engines-skinning-weights-t\" x=\"44\" y=\"69\">blended</text><circle class=\"engines-skinning-weights-v1\" cx=\"30\" cy=\"92\" r=\"6\"/><text class=\"engines-skinning-weights-t\" x=\"44\" y=\"97\">forearm, weight 1</text><text class=\"engines-skinning-weights-s engines-skinning-weights-e\" x=\"136\" y=\"290\">forearm weight</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"150\" y=\"290\">0</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"190\" y=\"290\">0</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"230\" y=\"290\">0</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"265\" y=\"290\">0</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"295\" y=\"290\">.25</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"325\" y=\"290\">.5</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"355\" y=\"290\">.75</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"390\" y=\"290\">1</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"430\" y=\"290\">1</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"470\" y=\"290\">1</text><text class=\"engines-skinning-weights-s engines-skinning-weights-c\" x=\"505\" y=\"290\">1</text></svg>"
        },
        {
          "type": "code",
          "lang": "hlsl",
          "text": "// Linear blend skinning (vertex shader)\nfloat4x4 skin = 0;\n[unroll] for (int i = 0; i < 4; i++)\n    skin += _BonePalette[In.boneIdx[i]] * In.boneWeight[i];\nfloat4 posModel = mul(skin, float4(In.posBind, 1));\nfloat3 nrmModel = mul((float3x3)skin, In.nrmBind);"
        },
        {
          "type": "h",
          "text": "Blending and blend trees"
        },
        {
          "type": "p",
          "text": "Transitions and locomotion variety come from **blending**: producing a pose as the weighted mix of several poses, per bone (lerp translation, nlerp rotation, with the shortest-arc check on the quaternion dot product). A **blend tree** is a graph of blend nodes driven by parameters. The classic example is locomotion: a 1D blend on `speed` between idle, walk and run, or a 2D blend on `(velocity.x, velocity.z)` among strafing clips. Clips in a blend must be **phase aligned** (foot-down at the same normalized time) or the blend creates sliding and floating; engines sync by normalizing clip length and matching foot-phase markers. **Additive animation** stores a difference from a reference pose (a lean, a breathing cycle, a hit reaction) and adds it on top; **layered** or masked blending applies an upper-body clip over lower-body locomotion using a per-bone mask."
        },
        {
          "type": "figure",
          "id": "engines-blend-1d",
          "caption": "As speed rises from 0 to 6 m/s, weight flows from idle to walk to run; at any speed at most two clips are blended and the weights sum to 1.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 284\" role=\"img\" aria-label=\"A 1D blend tree on speed: idle, walk and run each have a triangular weight curve. As the speed marker slides from 0 to 6 m/s and back, the weight bars for the three clips shift so they always sum to 1.\"><style>.engines-blend-1d-t{font-size:14px;fill:var(--fig-ink)}.engines-blend-1d-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-blend-1d-s{font-size:13px;fill:var(--fig-muted)}.engines-blend-1d-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-blend-1d-c{text-anchor:middle}.engines-blend-1d-e{text-anchor:end}.engines-blend-1d-ax{stroke:var(--fig-line);stroke-width:1.5}.engines-blend-1d-tr{fill:var(--fig-panel)}.engines-blend-1d-mk{fill:var(--fig-ink)}.engines-blend-1d-ml{stroke:var(--fig-ink);stroke-width:1.5}.engines-blend-1d-c0{fill:none;stroke:var(--fig-muted);stroke-width:2.5;stroke-linejoin:round}.engines-blend-1d-f0{fill:var(--fig-muted)}.engines-blend-1d-c1{fill:none;stroke:var(--fig-accent);stroke-width:2.5;stroke-linejoin:round}.engines-blend-1d-f1{fill:var(--fig-accent)}.engines-blend-1d-c2{fill:none;stroke:var(--fig-accent2);stroke-width:2.5;stroke-linejoin:round}.engines-blend-1d-f2{fill:var(--fig-accent2)}.engines-blend-1d-m{animation:engines-blend-1d-m 6s linear infinite}@keyframes engines-blend-1d-m{0%{transform:translateX(90px)}10%{transform:translateX(90px)}21.667%{transform:translateX(240px)}45%{transform:translateX(540px)}55%{transform:translateX(540px)}78.333%{transform:translateX(240px)}90%{transform:translateX(90px)}100%{transform:translateX(90px)}}.engines-blend-1d-w0{transform-box:fill-box;transform-origin:0 50%;animation:engines-blend-1d-w0 6s linear infinite}@keyframes engines-blend-1d-w0{0%{transform:scaleX(1)}10%{transform:scaleX(1)}21.667%{transform:scaleX(0)}45%{transform:scaleX(0)}55%{transform:scaleX(0)}78.333%{transform:scaleX(0)}90%{transform:scaleX(1)}100%{transform:scaleX(1)}}.engines-blend-1d-w1{transform-box:fill-box;transform-origin:0 50%;animation:engines-blend-1d-w1 6s linear infinite}@keyframes engines-blend-1d-w1{0%{transform:scaleX(0)}10%{transform:scaleX(0)}21.667%{transform:scaleX(1)}45%{transform:scaleX(0)}55%{transform:scaleX(0)}78.333%{transform:scaleX(1)}90%{transform:scaleX(0)}100%{transform:scaleX(0)}}.engines-blend-1d-w2{transform-box:fill-box;transform-origin:0 50%;animation:engines-blend-1d-w2 6s linear infinite}@keyframes engines-blend-1d-w2{0%{transform:scaleX(0)}10%{transform:scaleX(0)}21.667%{transform:scaleX(0)}45%{transform:scaleX(1)}55%{transform:scaleX(1)}78.333%{transform:scaleX(0)}90%{transform:scaleX(0)}100%{transform:scaleX(0)}}</style><polyline class=\"engines-blend-1d-c0\" points=\"90,60 240,140\"/><polyline class=\"engines-blend-1d-c1\" points=\"90,140 240,60 540,140\"/><polyline class=\"engines-blend-1d-c2\" points=\"240,140 540,60\"/><line class=\"engines-blend-1d-ax\" x1=\"90\" y1=\"140\" x2=\"580\" y2=\"140\"/><line class=\"engines-blend-1d-ax\" x1=\"90\" y1=\"140\" x2=\"90\" y2=\"146\"/><line class=\"engines-blend-1d-ax\" x1=\"165\" y1=\"140\" x2=\"165\" y2=\"146\"/><line class=\"engines-blend-1d-ax\" x1=\"240\" y1=\"140\" x2=\"240\" y2=\"146\"/><line class=\"engines-blend-1d-ax\" x1=\"315\" y1=\"140\" x2=\"315\" y2=\"146\"/><line class=\"engines-blend-1d-ax\" x1=\"390\" y1=\"140\" x2=\"390\" y2=\"146\"/><line class=\"engines-blend-1d-ax\" x1=\"465\" y1=\"140\" x2=\"465\" y2=\"146\"/><line class=\"engines-blend-1d-ax\" x1=\"540\" y1=\"140\" x2=\"540\" y2=\"146\"/><text class=\"engines-blend-1d-s engines-blend-1d-c\" x=\"90\" y=\"164\">0</text><text class=\"engines-blend-1d-s engines-blend-1d-c\" x=\"240\" y=\"164\">2</text><text class=\"engines-blend-1d-s engines-blend-1d-c\" x=\"390\" y=\"164\">4</text><text class=\"engines-blend-1d-s engines-blend-1d-c\" x=\"540\" y=\"164\">6 m/s</text><text class=\"engines-blend-1d-t\" x=\"90\" y=\"48\">idle</text><text class=\"engines-blend-1d-t engines-blend-1d-c\" x=\"240\" y=\"48\">walk</text><text class=\"engines-blend-1d-t engines-blend-1d-e\" x=\"540\" y=\"48\">run</text><text class=\"engines-blend-1d-s\" x=\"20\" y=\"65\">w = 1</text><text class=\"engines-blend-1d-s\" x=\"20\" y=\"145\">speed</text><g class=\"engines-blend-1d-m\" transform=\"translate(315,0)\"><line class=\"engines-blend-1d-ml\" x1=\"0\" y1=\"56\" x2=\"0\" y2=\"140\"/><path class=\"engines-blend-1d-mk\" d=\"M0 140l7 11h-14z\"/></g><text class=\"engines-blend-1d-t\" x=\"90\" y=\"197\">idle</text><rect class=\"engines-blend-1d-tr\" x=\"160\" y=\"184\" width=\"300\" height=\"16\" rx=\"8\"/><rect class=\"engines-blend-1d-f0 engines-blend-1d-w0\" x=\"160\" y=\"184\" width=\"300\" height=\"16\" rx=\"8\" transform=\"scale(0,1)\"/><text class=\"engines-blend-1d-t\" x=\"90\" y=\"227\">walk</text><rect class=\"engines-blend-1d-tr\" x=\"160\" y=\"214\" width=\"300\" height=\"16\" rx=\"8\"/><rect class=\"engines-blend-1d-f1 engines-blend-1d-w1\" x=\"160\" y=\"214\" width=\"300\" height=\"16\" rx=\"8\" transform=\"scale(0.75,1)\"/><text class=\"engines-blend-1d-t\" x=\"90\" y=\"257\">run</text><rect class=\"engines-blend-1d-tr\" x=\"160\" y=\"244\" width=\"300\" height=\"16\" rx=\"8\"/><rect class=\"engines-blend-1d-f2 engines-blend-1d-w2\" x=\"160\" y=\"244\" width=\"300\" height=\"16\" rx=\"8\" transform=\"scale(0.25,1)\"/><text class=\"engines-blend-1d-s\" x=\"476\" y=\"197\">weight per clip</text><text class=\"engines-blend-1d-s\" x=\"476\" y=\"227\">always sums to 1</text></svg>"
        },
        {
          "type": "interactive",
          "id": "engines-blend-explorer",
          "caption": "Slide the speed: only the two clips either side of it get weight, t = (speed − lower) / (upper − lower), and the weights always sum to 1.",
          "height": 360,
          "html": "<style>\n.w { display: flex; flex-direction: column; height: 100%; gap: 8px; }\nsvg { flex: 1; min-height: 0; width: 100%; display: block; }\n.g { stroke: var(--fig-line); stroke-width: 1; }\n.ax { stroke: var(--fig-muted); stroke-width: 1.5; }\n.cv { fill: none; stroke-width: 3; stroke-linejoin: round; }\n.k0 { stroke: var(--fig-muted); } .k1 { stroke: var(--fig-accent); } .k2 { stroke: var(--fig-accent2); }\n.f0 { fill: var(--fig-muted); } .f1 { fill: var(--fig-accent); } .f2 { fill: var(--fig-accent2); }\n.mk { stroke: var(--fig-warn); stroke-width: 2.5; }\n.t { fill: var(--fig-ink); font-size: 14px; }\n.m { fill: var(--fig-muted); font-size: 12px; }\n.mid { text-anchor: middle; } .end { text-anchor: end; }\n.tr { fill: var(--fig-panel); }\n.c { display: grid; grid-template-columns: auto 1fr auto; gap: 4px 10px; align-items: center; }\n.c input { width: 100%; }\noutput { font-variant-numeric: tabular-nums; color: var(--fig-muted); }\n</style>\n<div class=\"w\">\n<svg viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A 1D blend tree on speed with idle at 0, walk at 2 and run at 6 metres per second. Each clip has a triangular weight curve; the marker at the chosen speed reads off the weights, which always sum to 1.\">\n  <line class=\"g\" x1=\"70\" y1=\"40\" x2=\"550\" y2=\"40\"/>\n  <line class=\"ax\" x1=\"70\" y1=\"140\" x2=\"550\" y2=\"140\"/>\n  <text class=\"m end\" x=\"62\" y=\"44\">1</text><text class=\"m end\" x=\"62\" y=\"144\">0</text>\n  <g id=\"ticks\"></g>\n  <path class=\"cv k0\" d=\"M70 40 L230 140 L550 140\"/>\n  <path class=\"cv k1\" d=\"M70 140 L230 40 L550 140\"/>\n  <path class=\"cv k2\" d=\"M70 140 L230 140 L550 40\"/>\n  <text class=\"t f0\" x=\"78\" y=\"32\">idle</text><text class=\"t f1 mid\" x=\"230\" y=\"32\">walk</text><text class=\"t f2 end\" x=\"550\" y=\"32\">run</text>\n  <line id=\"mk\" class=\"mk\" y1=\"34\" y2=\"146\"/>\n  <circle id=\"c0\" class=\"f0\" r=\"5\"/><circle id=\"c1\" class=\"f1\" r=\"5\"/><circle id=\"c2\" class=\"f2\" r=\"5\"/>\n  <g id=\"bars\"></g>\n  <text id=\"eq\" class=\"m\" x=\"70\" y=\"290\"></text>\n</svg>\n<div class=\"c\">\n  <label for=\"sp\">Speed</label><input id=\"sp\" type=\"range\" min=\"0\" max=\"6\" step=\"0.1\" value=\"3\"><output id=\"spo\" for=\"sp\"></output>\n</div>\n</div>\n<script>\n(function () {\n  var $ = function (id) { return document.getElementById(id); };\n  var clips = [{ n: 'idle', at: 0 }, { n: 'walk', at: 2 }, { n: 'run', at: 6 }];\n  var X = function (s) { return 70 + s * 80; }, Y = function (w) { return 140 - w * 100; };\n  var ticks = '';\n  for (var i = 0; i <= 6; i++) ticks += '<text class=\"m mid\" x=\"' + X(i) + '\" y=\"160\">' + i + (i === 6 ? ' m/s' : '') + '</text>';\n  $('ticks').innerHTML = ticks;\n  function weights(s) {\n    var w = [0, 0, 0];\n    for (var k = 0; k < clips.length - 1; k++) {\n      var a = clips[k].at, b = clips[k + 1].at;\n      if (s <= b || k === clips.length - 2) { var t = Math.min(1, Math.max(0, (s - a) / (b - a))); w[k] = 1 - t; w[k + 1] = t; return { w: w, k: k, t: t }; }\n    }\n  }\n  function draw() {\n    var s = +$('sp').value, r = weights(s), w = r.w;\n    $('mk').setAttribute('x1', X(s)); $('mk').setAttribute('x2', X(s));\n    var bars = '';\n    clips.forEach(function (c, i) {\n      $('c' + i).setAttribute('cx', X(s)); $('c' + i).setAttribute('cy', Y(w[i]));\n      var y = 184 + i * 26;\n      bars += '<text class=\"t\" x=\"70\" y=\"' + (y + 13) + '\">' + c.n + '</text><rect class=\"tr\" x=\"130\" y=\"' + y + '\" width=\"360\" height=\"16\" rx=\"8\"/>' +\n        '<rect class=\"f' + i + '\" x=\"130\" y=\"' + y + '\" width=\"' + (360 * w[i]).toFixed(1) + '\" height=\"16\" rx=\"8\"/><text class=\"t end\" x=\"550\" y=\"' + (y + 13) + '\">' + w[i].toFixed(2) + '</text>';\n    });\n    $('bars').innerHTML = bars;\n    var a = clips[r.k], b = clips[r.k + 1];\n    $('eq').textContent = a.n + ' (' + a.at + ') to ' + b.n + ' (' + b.at + '): t = (' + s.toFixed(1) + ' − ' + a.at + ') / ' + (b.at - a.at) + ' = ' + r.t.toFixed(2) +\n      ', so ' + a.n + ' ' + w[r.k].toFixed(2) + ' + ' + b.n + ' ' + w[r.k + 1].toFixed(2) + ' = 1';\n    $('spo').textContent = s.toFixed(1) + ' m/s';\n  }\n  $('sp').addEventListener('input', draw);\n  draw();\n})();\n</script>"
        },
        {
          "type": "h",
          "text": "Animation state machines"
        },
        {
          "type": "p",
          "text": "Blend trees handle continuous variation. **Animation state machines** handle discrete modes: Grounded, Jumping, Falling, Landing, Attacking. Each state holds a clip or a blend tree; transitions have conditions (parameter thresholds, triggers, 'exit time') and a **cross-fade duration**, during which both states are evaluated and blended. During a cross-fade you are paying for two (or more) full evaluations, so long fades with many interruptions are a performance trap. State machines are also a classic source of bugs: transition explosion (every state connects to every other), missing interruption rules, and race conditions between gameplay code setting triggers and the machine consuming them."
        },
        {
          "type": "h",
          "text": "Inverse kinematics"
        },
        {
          "type": "p",
          "text": "Forward kinematics computes the end of a chain from joint angles. **Inverse kinematics (IK)** solves the reverse: given a target (a ledge, a foot placement point, a weapon aim direction), find joint rotations. For two-bone chains (arm, leg) an analytic solver with the law of cosines is exact, fast and stable, and needs a **pole vector** to choose the knee or elbow direction. For longer chains, iterative solvers (CCD, FABRIK) converge in a few iterations. IK runs after the animation pose is evaluated and before skinning, typically blended by a weight so it can fade in. Common uses are foot planting on uneven terrain (raycast, move the foot, lower the pelvis), look-at for head and eyes, and hand attachment to props."
        },
        {
          "type": "h",
          "text": "Root motion"
        },
        {
          "type": "p",
          "text": "In a walk clip the character's root bone advances through space. Either the clip stays in place and gameplay code moves the capsule at a chosen speed (**in-place**), or the root's motion is extracted from the clip and applied to the character (**root motion**). In-place is responsive and predictable, which suits action games with instant direction changes, but feet slide if code speed and clip speed disagree. Root motion matches the feet exactly and suits melee attacks, vaults and climbs, but gives up some control: the character moves only as far as the artist authored, and in networked games the extracted motion must be applied deterministically or be reconciled. Many shipped games use a hybrid: root motion for attacks and traversal, in-place with speed-scaled playback for locomotion."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Foot sliding is a measurable bug: compare the planted foot's world velocity to zero. If it slides, the movement speed and clip speed are out of sync. Fix by scaling playback rate by `actualSpeed / authoredSpeed`, using stride warping, or switching that state to root motion."
        },
        {
          "type": "h",
          "text": "Animation compression and cost"
        },
        {
          "type": "p",
          "text": "Uncompressed, 70 bones x 10 floats (position 3, rotation 4, scale 3) x 30 fps x 2 seconds x 4 bytes is about 168 KB per clip. Forty clips is 6.7 MB for one character; multiply by a roster and memory is a problem, and streaming that data costs bandwidth. Compression strategies: **keyframe reduction** (drop keys that a linear or curve fit reproduces within an error tolerance), **quantization** (quaternions stored as 3 components in 16 bits each, using the fact that unit length determines the fourth; positions in fixed-point ranges per clip), constant-track elimination (channels that never change collapse to one value; scale is usually constant 1), and sample-rate reduction. Typical lossy compression achieves 5-10x with errors below a visible threshold, but the error tolerance must be tighter on bones that magnify error: errors at the hip propagate to every child, so tolerances are applied in an error-at-the-end-effector sense. Over-aggressive compression shows up as foot jitter and finger twitching."
        },
        {
          "type": "p",
          "text": "Runtime cost is dominated by the number of animated bones times the number of evaluated clips. Levers: **animation LOD** (distant characters update at lower rates, skip IK and fingers, or use a lower bone count), **culling** (skip evaluation when off-screen, balancing against needing root motion), multithreaded or job-based evaluation, and GPU skinning. Visible budgets: 100 characters at 70 bones with 3 blended clips is about 21,000 bone-evaluations per frame, fine on a modern core, but 10x the count at 120 bones on mobile is not."
        },
        {
          "type": "h",
          "text": "Common misconceptions"
        },
        {
          "type": "list",
          "items": [
            "'Blending two animations averages their positions.' It blends per-bone local transforms; rotations need quaternion handling, and mismatched phase produces sliding regardless of math.",
            "'More keyframes means smoother motion.' Smoothness comes from curve quality and interpolation; dense keys mostly cost memory.",
            "'IK replaces animation.' IK corrects a pose that animation provides; with no good base pose, the result looks robotic.",
            "'Root motion is always better.' It trades control for fidelity and complicates networking and physics interaction."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "When an AI agent writes animation code or sets up animator graphs, tell it the specifics: bone count, target platform, whether locomotion is in-place or root-motion, and the networking model. Verify that it does not interpolate Euler angles, does not allocate per frame in the animation update, handles quaternion double-cover (flip when dot < 0), and does not create fully connected state machines. Agents tend to add a transition per request and never prune; ask for a diagram of the state graph and review transition conditions for conflicts and missing exits. Always check the result in motion, not just in code."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Pose blend with shortest-arc rotation\nstatic void BlendPose(Pose a, Pose b, float w, Pose result)\n{\n    for (int i = 0; i < a.Count; i++)\n    {\n        result.pos[i] = Vector3.Lerp(a.pos[i], b.pos[i], w);\n        Quaternion qb = b.rot[i];\n        if (Quaternion.Dot(a.rot[i], qb) < 0f)\n            qb = new Quaternion(-qb.x, -qb.y, -qb.z, -qb.w);\n        result.rot[i] = Quaternion.Slerp(a.rot[i], qb, w);\n    }\n}"
        },
        {
          "type": "p",
          "text": "The whole pipeline per character per frame is: update state machine and parameters, evaluate active clips and blend trees into a local pose, apply layers and additive offsets, run IK, compute model-space matrices, extract root motion for the gameplay side, then skin on the GPU. Knowing the order tells you where to intervene when something is wrong."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A character has discrete modes like grounded, jumping, attacking, and switching between them pops",
              "use": "Animation state machine with cross-fades",
              "why": "States hold clips or blend trees and transitions blend over a duration. During a cross-fade both states are evaluated; fully connected graphs become unmaintainable, so group states and use sub-machines."
            },
            {
              "signal": "Locomotion must cover a continuous range of speeds and directions without separate states for each",
              "use": "Blend tree on continuous parameters",
              "why": "Blend phase-aligned clips by parameters like speed and direction (1D or 2D). Smooth coverage with few clips; clips must share phase and timing or feet slide and float."
            },
            {
              "signal": "The character must reload or wave while legs keep running independently",
              "use": "Masked animation layers",
              "why": "A layer with a bone mask overrides or blends only upper-body bones on top of the base locomotion. Each layer costs evaluation, and mismatched poses at the mask seam can look broken."
            },
            {
              "signal": "Breathing, leaning or hit reactions need to apply on top of any base animation without authoring every combination",
              "use": "Additive animation",
              "why": "Store a clip as a difference from a reference pose and add it to whatever is playing. Cuts the clip count; additives authored against the wrong reference pose produce distorted results."
            },
            {
              "signal": "Feet float or clip on slopes and stairs, or hands miss a weapon grip or ledge",
              "use": "IK pass after pose evaluation",
              "why": "Run foot, hand or look-at IK on the blended pose to hit real targets. Corrects contact cheaply; needs reliable targets from raycasts and weighting to avoid knee pops and jitter."
            },
            {
              "signal": "An attack lunge or vault must move the character exactly as authored with feet locked to the floor",
              "use": "Root motion",
              "why": "Extract the root bone's motion from the clip and apply it to the character. Exact contact and timing, at the cost of gameplay control; blend with code-driven movement where responsiveness matters."
            },
            {
              "signal": "Feet slide during in-place locomotion because gameplay moves the capsule faster than the clip was authored",
              "use": "Stride-matched playback rate",
              "why": "Scale the clip's playback rate by `actualSpeed / authoredSpeed`, or blend between walk and run, so stride matches ground speed. Extreme rates look unnatural; add clips for distant speed ranges."
            },
            {
              "signal": "Animation CPU cost is dominated by distant characters that cover a few pixels",
              "use": "Animation LOD and reduced update rate",
              "why": "Update far characters at lower rates, skip IK and layers, or use fewer bones by distance; off-screen ones can stop evaluating. Large savings with little visible loss; watch for root motion and events that still need updating."
            },
            {
              "signal": "Blending two rotations makes a limb spin the long way round",
              "use": "Quaternion hemisphere check before blending",
              "why": "`q` and `-q` are the same rotation; if `dot(a, b) < 0` negate one before nlerp or slerp so blending takes the shortest arc. Missing it is a classic artefact of hand-written blending code."
            },
            {
              "signal": "Blending walk and run makes the legs scissor because the clips have different lengths",
              "use": "Phase sync with foot markers",
              "why": "Normalize clip time and align on foot-contact markers so blended clips are at the same phase of the cycle. Requires marked-up clips; clips without matching cycles cannot be synced cleanly."
            },
            {
              "signal": "Damage or footstep sounds are timed with gameplay timers that drift from the animation",
              "use": "Animation events / notifies",
              "why": "Fire gameplay hooks from markers in the clip so timing follows the animation. Events can be skipped or doubled during cross-fades and reduced update rates, so make handlers idempotent and robust."
            },
            {
              "signal": "Feet jitter visibly after animation compression was raised to save memory",
              "use": "Compression error measured at end effectors",
              "why": "Key reduction and quantization errors accumulate down the bone chain, so measure error at feet and hands, not per joint. Tighten tolerance on long chains; costs some memory back."
            }
          ]
        }
      ],
      "keyPoints": [
        "A pose is an array of local bone transforms; skinning multiplies world bone matrices by inverse bind matrices and weights up to 4 influences per vertex.",
        "Blending works per bone with quaternion shortest-arc handling, and only looks right if the clips are phase aligned.",
        "State machines manage discrete modes with cross-fades; blend trees manage continuous parameters like speed and direction.",
        "IK corrects a base pose (feet, aim, hands) after evaluation; root motion trades control for exact foot contact.",
        "Compression uses key reduction, quantized quaternions and constant-track removal, with error measured where it is visible."
      ],
      "quiz": [
        {
          "q": "A character's feet slide on the ground while running even though the run clip looks fine in the preview. Movement is in-place and gameplay moves the capsule at 7 m/s, while the clip was authored at 5 m/s. What is the most direct fix?",
          "options": [
            "Scale the clip playback rate by 7/5 or warp the stride",
            "Enable stronger animation compression on the legs",
            "Increase the number of bone influences per vertex",
            "Switch the pose blend from slerp to plain lerp"
          ],
          "answer": 0,
          "explain": "Sliding means the ground speed and the clip's authored speed disagree, so matching playback rate or stride to actual speed fixes it. Compression, skinning weights and interpolation type do not change ground contact speed."
        },
        {
          "q": "Blending a clip with a second clip that has a quaternion on the opposite hemisphere makes a limb spin the long way round. Which step is missing?",
          "options": [
            "Converting quaternions to Euler angles before blending",
            "Flipping one quaternion's sign when the dot product is negative",
            "Normalizing the bone's translation vector",
            "Raising the animation sampling rate to 60 fps"
          ],
          "answer": 1,
          "explain": "q and -q represent the same rotation, so interpolation must take the shortest arc by negating when the dot is negative. Euler blending introduces its own artifacts and does not solve this."
        },
        {
          "q": "A boss has 25 attack animations that must move the character exactly as authored, including lunges and vaults over obstacles, with feet locked to the floor. Which approach fits best?",
          "options": [
            "In-place clips with a constant capsule speed set by code",
            "Root motion extracted from clips and applied to the character",
            "Pure IK solving every limb with no authored clips",
            "Dual-quaternion skinning applied on the mesh"
          ],
          "answer": 1,
          "explain": "Root motion applies the authored displacement so feet stay planted through lunges and vaults. In-place plus constant speed re-introduces sliding, and skinning type is unrelated to locomotion."
        },
        {
          "q": "A crowd of 200 characters costs 4 ms of CPU in animation evaluation, mostly for characters far from the camera. Which change gives the largest saving with the least visible loss?",
          "options": [
            "Convert all clips to uncompressed data for speed",
            "Add more transitions so that states can exit sooner",
            "Add animation LOD: lower rate, skip IK and fingers far away",
            "Move every crowd character over to root motion"
          ],
          "answer": 2,
          "explain": "Cost scales with bones times evaluated clips, and distant characters do not need full fidelity. Uncompressed data and extra transitions do not reduce evaluation work; root motion changes control, not cost."
        },
        {
          "q": "An animation looks perfect except for visible foot jitter after compression was raised to save memory. What explains this most plausibly?",
          "options": [
            "Constant tracks were removed, which breaks foot contact",
            "Hip error was tolerated and propagated down to the foot",
            "The inverse bind matrices were quantized to 4 bone influences",
            "The state machine's cross-fade duration was set too short"
          ],
          "answer": 1,
          "explain": "Error in parent bones accumulates down the chain and is magnified at the foot, so tolerances should be measured at end effectors. Constant-track removal is lossless, and cross-fade length does not cause per-frame jitter in a steady clip."
        },
        {
          "q": "On stairs and slopes, the character's feet clip into steps or hover above them, and its hands miss ledge grips, even though the clips look correct on flat ground. Which approach fits best?",
          "options": [
            "Root motion extracted from the authored locomotion clips",
            "Stride-matched playback rate for the run clip",
            "An IK pass after pose evaluation to place feet and hands",
            "Additive layers for lean and hit reactions on top"
          ],
          "answer": 2,
          "explain": "The authored clips know nothing about the surface, so IK corrects end effectors against ground or grip targets after the pose is computed. Root motion and playback rate affect travel speed, not where feet land."
        }
      ]
    },
    {
      "id": "engines-game-math-feel",
      "title": "Game math and game feel",
      "minutes": 14,
      "summary": "The small pieces of math behind smooth motion, curves, randomness and juice, and why every one of them must be tuned against frame time rather than frames.",
      "lesson": [
        {
          "type": "p",
          "text": "A platformer feels tight on the developer's 144 Hz monitor. On a Switch-class device locked to 30 fps the camera lags far behind the player, the screen shake looks like a different effect, and a level generated from seed 1234 on a tester's machine does not match the bug report. None of these are rendering or physics bugs. They come from a handful of small formulas that run every frame: smoothing, curves, springs, random numbers and the \"juice\" layered on top. Each one either respects frame time or quietly depends on frame rate."
        },
        {
          "type": "h",
          "text": "Interpolation and the lerp trap"
        },
        {
          "type": "p",
          "text": "`Lerp(a, b, t) = a + (b - a) * t` is the most used function in gameplay code. Used with `t = elapsed / duration` it is exact and frame-rate independent: the result depends only on elapsed time. The trap is the smoothing idiom `x = Lerp(x, target, k)` called once per frame with a constant `k`. Each call removes a fraction `k` of the remaining distance, so after one second the remaining fraction is `(1 - k)^fps`. With `k = 0.1` that is 0.9^30 = 4% left at 30 fps but 0.9^144 = 0.00025% left at 144 fps: the same code is a lazy camera on one device and a rigid one on another. Multiplying by `Time.deltaTime` (`k = 6 * dt`) is closer but only a first-order approximation, and once `6 * dt` exceeds 1 during a hitch `Vector3.Lerp` clamps and snaps straight onto the target (an unclamped lerp overshoots)."
        },
        {
          "type": "figure",
          "id": "engines-gm-lerp-fps",
          "caption": "On the left the same per-frame k reaches the target far sooner at 144 fps than at 30 fps; on the right the dt-derived k puts the 30 fps steps on the 144 fps curve.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"Two plots of position over 0.8 seconds approaching a target. Left: lerping 10 percent of the way every frame reaches the target far sooner at 144 fps than at 30 fps. Right: with k equal to 1 minus exp of minus 6 times dt, the 30 fps steps sit on the same curve as 144 fps.\"><style>.engines-gm-lerp-fps-t{font-size:14px;fill:var(--fig-ink)}.engines-gm-lerp-fps-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-gm-lerp-fps-s{font-size:13px;fill:var(--fig-muted)}.engines-gm-lerp-fps-c{text-anchor:middle}.engines-gm-lerp-fps-e{text-anchor:end}.engines-gm-lerp-fps-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-gm-lerp-fps-ax{stroke:var(--fig-line);stroke-width:1.5}.engines-gm-lerp-fps-tg{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 5}.engines-gm-lerp-fps-a{fill:none;stroke:var(--fig-accent);stroke-width:2.5;stroke-linejoin:round}.engines-gm-lerp-fps-b2{fill:none;stroke:var(--fig-accent2);stroke-width:2;stroke-linejoin:round}.engines-gm-lerp-fps-da{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2}.engines-gm-lerp-fps-db{fill:var(--fig-accent2);stroke:var(--fig-bg);stroke-width:2}.engines-gm-lerp-fps-x0{animation:engines-gm-lerp-fps-x0 5s linear infinite}@keyframes engines-gm-lerp-fps-x0{0%{transform:translateX(56px)}80%,100%{transform:translateX(286px)}}.engines-gm-lerp-fps-f0{animation:engines-gm-lerp-fps-f0 5s linear infinite}@keyframes engines-gm-lerp-fps-f0{0%{transform:translateY(256px)}4%{transform:translateY(194.1px)}8%{transform:translateY(160.4px)}12%{transform:translateY(142px)}16%{transform:translateY(132px)}20%{transform:translateY(126.5px)}24%{transform:translateY(123.6px)}28%{transform:translateY(121.9px)}32%{transform:translateY(121.1px)}36%{transform:translateY(120.6px)}40%{transform:translateY(120.3px)}44%{transform:translateY(120.2px)}48%{transform:translateY(120.1px)}52%{transform:translateY(120.1px)}56%{transform:translateY(120px)}60%{transform:translateY(120px)}64%{transform:translateY(120px)}68%{transform:translateY(120px)}72%{transform:translateY(120px)}76%{transform:translateY(120px)}80%,100%{transform:translateY(120px)}}.engines-gm-lerp-fps-g0{animation:engines-gm-lerp-fps-g0 5s step-end infinite}@keyframes engines-gm-lerp-fps-g0{0%{transform:translateY(256px)}3.33%{transform:translateY(242.4px)}6.67%{transform:translateY(230.2px)}10%{transform:translateY(219.1px)}13.33%{transform:translateY(209.2px)}16.67%{transform:translateY(200.3px)}20%{transform:translateY(192.3px)}23.33%{transform:translateY(185px)}26.67%{transform:translateY(178.5px)}30%{transform:translateY(172.7px)}33.33%{transform:translateY(167.4px)}36.67%{transform:translateY(162.7px)}40%{transform:translateY(158.4px)}43.33%{transform:translateY(154.6px)}46.67%{transform:translateY(151.1px)}50%{transform:translateY(148px)}53.33%{transform:translateY(145.2px)}56.67%{transform:translateY(142.7px)}60%{transform:translateY(140.4px)}63.33%{transform:translateY(138.4px)}66.67%{transform:translateY(136.5px)}70%{transform:translateY(134.9px)}73.33%{transform:translateY(133.4px)}76.67%{transform:translateY(132.1px)}80%,100%{transform:translateY(130.8px)}}.engines-gm-lerp-fps-x1{animation:engines-gm-lerp-fps-x1 5s linear infinite}@keyframes engines-gm-lerp-fps-x1{0%{transform:translateX(368px)}80%,100%{transform:translateX(598px)}}.engines-gm-lerp-fps-f1{animation:engines-gm-lerp-fps-f1 5s linear infinite}@keyframes engines-gm-lerp-fps-f1{0%{transform:translateY(256px)}4%{transform:translateY(227px)}8%{transform:translateY(204.2px)}12%{transform:translateY(186.2px)}16%{transform:translateY(172.1px)}20%{transform:translateY(161px)}24%{transform:translateY(152.2px)}28%{transform:translateY(145.3px)}32%{transform:translateY(139.9px)}36%{transform:translateY(135.7px)}40%{transform:translateY(132.3px)}44%{transform:translateY(129.7px)}48%{transform:translateY(127.6px)}52%{transform:translateY(126px)}56%{transform:translateY(124.7px)}60%{transform:translateY(123.7px)}64%{transform:translateY(122.9px)}68%{transform:translateY(122.3px)}72%{transform:translateY(121.8px)}76%{transform:translateY(121.4px)}80%,100%{transform:translateY(121.1px)}}.engines-gm-lerp-fps-g1{animation:engines-gm-lerp-fps-g1 5s step-end infinite}@keyframes engines-gm-lerp-fps-g1{0%{transform:translateY(256px)}3.33%{transform:translateY(231.3px)}6.67%{transform:translateY(211.2px)}10%{transform:translateY(194.6px)}13.33%{transform:translateY(181.1px)}16.67%{transform:translateY(170px)}20%{transform:translateY(161px)}23.33%{transform:translateY(153.5px)}26.67%{transform:translateY(147.5px)}30%{transform:translateY(142.5px)}33.33%{transform:translateY(138.4px)}36.67%{transform:translateY(135.1px)}40%{transform:translateY(132.3px)}43.33%{transform:translateY(130.1px)}46.67%{transform:translateY(128.3px)}50%{transform:translateY(126.8px)}53.33%{transform:translateY(125.5px)}56.67%{transform:translateY(124.5px)}60%{transform:translateY(123.7px)}63.33%{transform:translateY(123px)}66.67%{transform:translateY(122.5px)}70%{transform:translateY(122px)}73.33%{transform:translateY(121.7px)}76.67%{transform:translateY(121.4px)}80%,100%{transform:translateY(121.1px)}}</style><rect class=\"engines-gm-lerp-fps-b\" x=\"16\" y=\"16\" width=\"296\" height=\"288\" rx=\"14\"/><text class=\"engines-gm-lerp-fps-h\" x=\"36\" y=\"44\">k = 0.1 every frame</text><text class=\"engines-gm-lerp-fps-s\" x=\"36\" y=\"64\">same k at any frame rate</text><line class=\"engines-gm-lerp-fps-a\" x1=\"36\" y1=\"88\" x2=\"56\" y2=\"88\"/><text class=\"engines-gm-lerp-fps-s\" x=\"64\" y=\"92\">144 fps</text><line class=\"engines-gm-lerp-fps-b2\" x1=\"136\" y1=\"88\" x2=\"156\" y2=\"88\"/><text class=\"engines-gm-lerp-fps-s\" x=\"164\" y=\"92\">30 fps</text><line class=\"engines-gm-lerp-fps-ax\" x1=\"56\" y1=\"114\" x2=\"56\" y2=\"256\"/><line class=\"engines-gm-lerp-fps-ax\" x1=\"56\" y1=\"256\" x2=\"286\" y2=\"256\"/><line class=\"engines-gm-lerp-fps-tg\" x1=\"56\" y1=\"120\" x2=\"286\" y2=\"120\"/><text class=\"engines-gm-lerp-fps-s engines-gm-lerp-fps-e\" x=\"286\" y=\"112\">target</text><text class=\"engines-gm-lerp-fps-s engines-gm-lerp-fps-c\" x=\"56\" y=\"280\">0</text><text class=\"engines-gm-lerp-fps-s engines-gm-lerp-fps-c\" x=\"171\" y=\"280\">0.4</text><text class=\"engines-gm-lerp-fps-s engines-gm-lerp-fps-e\" x=\"286\" y=\"280\">0.8 s</text><polyline class=\"engines-gm-lerp-fps-b2\" points=\"56,256 65.6,256 65.6,242.4 75.2,242.4 75.2,230.2 84.8,230.2 84.8,219.1 94.3,219.1 94.3,209.2 103.9,209.2 103.9,200.3 113.5,200.3 113.5,192.3 123.1,192.3 123.1,185 132.7,185 132.7,178.5 142.3,178.5 142.3,172.7 151.8,172.7 151.8,167.4 161.4,167.4 161.4,162.7 171,162.7 171,158.4 180.6,158.4 180.6,154.6 190.2,154.6 190.2,151.1 199.8,151.1 199.8,148 209.3,148 209.3,145.2 218.9,145.2 218.9,142.7 228.5,142.7 228.5,140.4 238.1,140.4 238.1,138.4 247.7,138.4 247.7,136.5 257.3,136.5 257.3,134.9 266.8,134.9 266.8,133.4 276.4,133.4 276.4,132.1 286,132.1\"/><polyline class=\"engines-gm-lerp-fps-a\" points=\"56,256 59.6,232.5 63.2,213.1 66.8,197 70.4,183.7 74,172.7 77.6,163.6 81.2,156.1 84.8,149.8 88.3,144.7 91.9,140.4 95.5,136.9 99.1,134 102.7,131.6 106.3,129.6 109.9,127.9 113.5,126.5 117.1,125.4 120.7,124.5 124.3,123.7 127.9,123.1 131.5,122.5 135.1,122.1 138.7,121.7 142.3,121.4 145.8,121.2 149.4,121 153,120.8 156.6,120.7 160.2,120.6 163.8,120.5 167.4,120.4 171,120.3 174.6,120.3 178.2,120.2 181.8,120.2 185.4,120.1 189,120.1 192.6,120.1 196.2,120.1 199.8,120.1 203.3,120.1 206.9,120 210.5,120 214.1,120 217.7,120 221.3,120 224.9,120 228.5,120 232.1,120 235.7,120 239.3,120 242.9,120 246.5,120 250.1,120 253.7,120 257.3,120 260.8,120 264.4,120 268,120 271.6,120 275.2,120 278.8,120 282.4,120 286,120\"/><g class=\"engines-gm-lerp-fps-x0\" transform=\"translate(56,0)\"><circle class=\"engines-gm-lerp-fps-db engines-gm-lerp-fps-g0\" r=\"5.5\" transform=\"translate(0,256)\"/><circle class=\"engines-gm-lerp-fps-da engines-gm-lerp-fps-f0\" r=\"5.5\" transform=\"translate(0,256)\"/></g><rect class=\"engines-gm-lerp-fps-b\" x=\"328\" y=\"16\" width=\"296\" height=\"288\" rx=\"14\"/><text class=\"engines-gm-lerp-fps-h\" x=\"348\" y=\"44\">k = 1 − exp(−6·dt)</text><text class=\"engines-gm-lerp-fps-s\" x=\"348\" y=\"64\">k derived from frame time</text><line class=\"engines-gm-lerp-fps-a\" x1=\"348\" y1=\"88\" x2=\"368\" y2=\"88\"/><text class=\"engines-gm-lerp-fps-s\" x=\"376\" y=\"92\">144 fps</text><line class=\"engines-gm-lerp-fps-b2\" x1=\"448\" y1=\"88\" x2=\"468\" y2=\"88\"/><text class=\"engines-gm-lerp-fps-s\" x=\"476\" y=\"92\">30 fps</text><line class=\"engines-gm-lerp-fps-ax\" x1=\"368\" y1=\"114\" x2=\"368\" y2=\"256\"/><line class=\"engines-gm-lerp-fps-ax\" x1=\"368\" y1=\"256\" x2=\"598\" y2=\"256\"/><line class=\"engines-gm-lerp-fps-tg\" x1=\"368\" y1=\"120\" x2=\"598\" y2=\"120\"/><text class=\"engines-gm-lerp-fps-s engines-gm-lerp-fps-e\" x=\"598\" y=\"112\">target</text><text class=\"engines-gm-lerp-fps-s engines-gm-lerp-fps-c\" x=\"368\" y=\"280\">0</text><text class=\"engines-gm-lerp-fps-s engines-gm-lerp-fps-c\" x=\"483\" y=\"280\">0.4</text><text class=\"engines-gm-lerp-fps-s engines-gm-lerp-fps-e\" x=\"598\" y=\"280\">0.8 s</text><polyline class=\"engines-gm-lerp-fps-b2\" points=\"368,256 377.6,256 377.6,231.3 387.2,231.3 387.2,211.2 396.8,211.2 396.8,194.6 406.3,194.6 406.3,181.1 415.9,181.1 415.9,170 425.5,170 425.5,161 435.1,161 435.1,153.5 444.7,153.5 444.7,147.5 454.3,147.5 454.3,142.5 463.8,142.5 463.8,138.4 473.4,138.4 473.4,135.1 483,135.1 483,132.3 492.6,132.3 492.6,130.1 502.2,130.1 502.2,128.3 511.8,128.3 511.8,126.8 521.3,126.8 521.3,125.5 530.9,125.5 530.9,124.5 540.5,124.5 540.5,123.7 550.1,123.7 550.1,123 559.7,123 559.7,122.5 569.3,122.5 569.3,122 578.8,122 578.8,121.7 588.4,121.7 588.4,121.4 598,121.4\"/><polyline class=\"engines-gm-lerp-fps-a\" points=\"368,256 371.6,246.2 375.2,237.1 378.8,228.6 382.4,220.8 386,213.5 389.6,206.7 393.2,200.5 396.8,194.6 400.3,189.2 403.9,184.2 407.5,179.6 411.1,175.3 414.7,171.3 418.3,167.6 421.9,164.2 425.5,161 429.1,158 432.7,155.3 436.3,152.7 439.9,150.3 443.5,148.2 447.1,146.1 450.7,144.2 454.3,142.5 457.8,140.9 461.4,139.3 465,138 468.6,136.7 472.2,135.5 475.8,134.3 479.4,133.3 483,132.3 486.6,131.4 490.2,130.6 493.8,129.9 497.4,129.1 501,128.5 504.6,127.9 508.2,127.3 511.8,126.8 515.3,126.3 518.9,125.8 522.5,125.4 526.1,125 529.7,124.7 533.3,124.3 536.9,124 540.5,123.7 544.1,123.4 547.7,123.2 551.3,123 554.9,122.8 558.5,122.6 562.1,122.4 565.7,122.2 569.3,122 572.8,121.9 576.4,121.8 580,121.6 583.6,121.5 587.2,121.4 590.8,121.3 594.4,121.2 598,121.1\"/><g class=\"engines-gm-lerp-fps-x1\" transform=\"translate(368,0)\"><circle class=\"engines-gm-lerp-fps-db engines-gm-lerp-fps-g1\" r=\"5.5\" transform=\"translate(0,256)\"/><circle class=\"engines-gm-lerp-fps-da engines-gm-lerp-fps-f1\" r=\"5.5\" transform=\"translate(0,256)\"/></g></svg>"
        },
        {
          "type": "p",
          "text": "The correct form is **exponential decay**: choose a rate in 1/s (or a half-life) and derive the per-frame fraction from the frame time, `k = 1 - exp(-rate * dt)`. Two half frames now compose into exactly one full frame, so the curve is identical at any frame rate, and `k` stays in [0, 1) no matter how long a hitch is. To port a value tuned at a known frame rate, `rate = -ln(1 - k) * fps`; `k = 0.1` tuned at 60 fps becomes a rate of about 6.3/s. The same idea applies to rotations with `Quaternion.Slerp` and to colours or volumes."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Frame-rate independent smoothing toward a moving target.\n[SerializeField] float sharpness = 6f;           // 1/s; higher = snappier\n\nvoid LateUpdate()\n{\n    float k = 1f - Mathf.Exp(-sharpness * Time.deltaTime);\n    transform.position = Vector3.Lerp(transform.position, target.position, k);\n}\n\n// Half-life form: distance halves every halfLife seconds.\nstatic float DecayK(float halfLife, float dt) => 1f - Mathf.Pow(0.5f, dt / halfLife);"
        },
        {
          "type": "h",
          "text": "Easing and tweening"
        },
        {
          "type": "p",
          "text": "An **easing function** maps normalized time `u` in [0, 1] to progress, usually also in [0, 1]. Ease-out (fast start, gentle stop, for example `1 - (1 - u)^3`) suits things arriving, such as a panel sliding in; ease-in suits things leaving; ease-in-out suits camera moves between two framings. \"Back\" curves overshoot past 1 and return, and elastic curves oscillate, which reads as springy and playful. A **tween** is just from, to, duration and an easing function evaluated on elapsed time, so it is frame-rate independent by construction. The practical bugs are elsewhere: two tweens fighting over the same property, tweens running on scaled time while the game is paused, and tweens that keep a destroyed object alive. Unity's `AnimationCurve` lets designers draw an easing curve in the Inspector and code calls `curve.Evaluate(u)`; third-party tween libraries add sequencing and ownership rules, and their APIs differ, so check their docs rather than assuming."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "static float EaseOutCubic(float u) { u = 1f - u; return 1f - u * u * u; }\nstatic float EaseInOutQuad(float u) => u < 0.5f ? 2f * u * u : 1f - 2f * (1f - u) * (1f - u);\n\nIEnumerator SlideIn(RectTransform panel, Vector2 from, Vector2 to, float duration)\n{\n    for (float t = 0f; t < duration; t += Time.unscaledDeltaTime) // works while paused\n    {\n        panel.anchoredPosition = Vector2.LerpUnclamped(from, to, EaseOutCubic(t / duration));\n        yield return null;\n    }\n    panel.anchoredPosition = to; // land exactly on the end value\n}"
        },
        {
          "type": "h",
          "text": "Splines and constant speed"
        },
        {
          "type": "p",
          "text": "Camera rails, racing lines, patrol paths and projectile arcs are **splines**: piecewise cubic curves. A cubic **Bezier** segment has two endpoints and two handles that the curve does not pass through, which gives artists precise tangent control. A **Catmull-Rom** spline passes through every control point and derives tangents from the neighbours, so designers just drop points along a path. The standard (uniform) Catmull-Rom can overshoot or form small loops when points are unevenly spaced; the **centripetal** variant (parameter spacing by the square root of the chord length) avoids cusps and self-intersections and is the safer default for paths."
        },
        {
          "type": "p",
          "text": "The spline parameter `t` is not distance. Each segment spans the same range of `t` whatever its length, so moving `t` at a constant rate makes an object rush through long segments and crawl through short ones. For constant speed, **reparameterise by arc length**: sample the curve densely once, store cumulative length in a table, and at runtime convert a distance travelled into `t` by binary search and linear interpolation in the table. Then advance distance by `speed * dt`. Unity's Splines package ships evaluation and length utilities, but the exact API depends on the package version, so read its documentation for the version you use."
        },
        {
          "type": "figure",
          "id": "engines-gm-arclength",
          "caption": "The same 16 steps: in t they bunch around the close control points and stretch along the long segment, so the marker surges and stalls; by arc length they are evenly spaced.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 364\" role=\"img\" aria-label=\"The same Catmull-Rom spline through five unevenly spaced control points, drawn twice. Top: 16 equal steps in the parameter t bunch up where points are close and spread out on the long segment, and the moving marker speeds up and slows down. Bottom: 16 equal steps in arc length are evenly spaced and the marker moves at constant speed.\"><style>.engines-gm-arclength-t{font-size:14px;fill:var(--fig-ink)}.engines-gm-arclength-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-gm-arclength-s{font-size:13px;fill:var(--fig-muted)}.engines-gm-arclength-c{text-anchor:middle}.engines-gm-arclength-e{text-anchor:end}.engines-gm-arclength-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-gm-arclength-ax{stroke:var(--fig-line);stroke-width:1.5}.engines-gm-arclength-cv{fill:none;stroke:var(--fig-ink);stroke-width:2;stroke-opacity:.35}.engines-gm-arclength-k{fill:var(--fig-bg);stroke:var(--fig-muted);stroke-width:1.5}.engines-gm-arclength-tk{fill:var(--fig-ink)}.engines-gm-arclength-mw{fill:var(--fig-warn);stroke:var(--fig-bg);stroke-width:2}.engines-gm-arclength-mo{fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2}.engines-gm-arclength-m0{animation:engines-gm-arclength-m0 6s linear infinite}@keyframes engines-gm-arclength-m0{0%{transform:translate(44px,74px)}2.13%{transform:translate(51.6px,68px)}4.25%{transform:translate(59.4px,61.2px)}6.38%{transform:translate(67.1px,54.1px)}8.5%{transform:translate(74.9px,46.9px)}10.63%{transform:translate(82.6px,39.9px)}12.75%{transform:translate(90.3px,33.3px)}14.87%{transform:translate(97.9px,27.6px)}17%{transform:translate(105.4px,22.9px)}19.13%{transform:translate(112.8px,19.6px)}21.25%{transform:translate(120px,18px)}23.38%{transform:translate(126.2px,18.6px)}25.5%{transform:translate(131px,21.6px)}27.63%{transform:translate(134.9px,26.3px)}29.75%{transform:translate(138.6px,32.2px)}31.88%{transform:translate(142.5px,38.6px)}34%{transform:translate(147.3px,45.1px)}36.13%{transform:translate(153.4px,51.1px)}38.25%{transform:translate(161.6px,55.9px)}40.38%{transform:translate(172.2px,59.1px)}42.5%{transform:translate(186px,60px)}44.63%{transform:translate(203.5px,58.2px)}46.75%{transform:translate(224.7px,54.1px)}48.87%{transform:translate(248.6px,48.3px)}51%{transform:translate(274.5px,41.3px)}53.13%{transform:translate(301.8px,33.9px)}55.25%{transform:translate(329.5px,26.5px)}57.38%{transform:translate(356.9px,19.8px)}59.5%{transform:translate(383.3px,14.4px)}61.63%{transform:translate(408px,11px)}63.75%{transform:translate(430px,10px)}65.88%{transform:translate(449.8px,11.5px)}68%{transform:translate(468.2px,15px)}70.13%{transform:translate(485.5px,19.9px)}72.25%{transform:translate(502px,26.1px)}74.38%{transform:translate(517.9px,33.1px)}76.5%{transform:translate(533.3px,40.7px)}78.63%{transform:translate(548.7px,48.5px)}80.75%{transform:translate(564px,56.2px)}82.88%{transform:translate(579.8px,63.5px)}85%,100%{transform:translate(596px,70px)}}.engines-gm-arclength-m1{animation:engines-gm-arclength-m1 6s linear infinite}@keyframes engines-gm-arclength-m1{0%{transform:translate(44px,74px)}2.13%{transform:translate(55.8px,64.4px)}4.25%{transform:translate(67px,54.2px)}6.38%{transform:translate(78.1px,43.9px)}8.5%{transform:translate(89.6px,34px)}10.63%{transform:translate(101.8px,25px)}12.75%{transform:translate(115.6px,18.8px)}14.87%{transform:translate(130px,20.8px)}17%{transform:translate(139px,32.9px)}19.13%{transform:translate(147.5px,45.4px)}21.25%{transform:translate(159.3px,54.8px)}23.38%{transform:translate(173.7px,59.3px)}25.5%{transform:translate(188.9px,59.9px)}27.63%{transform:translate(204px,58.2px)}29.75%{transform:translate(218.9px,55.4px)}31.88%{transform:translate(233.7px,52px)}34%{transform:translate(248.4px,48.3px)}36.13%{transform:translate(263.1px,44.5px)}38.25%{transform:translate(277.7px,40.5px)}40.38%{transform:translate(292.3px,36.5px)}42.5%{transform:translate(307px,32.5px)}44.63%{transform:translate(321.6px,28.5px)}46.75%{transform:translate(336.3px,24.8px)}48.87%{transform:translate(351.1px,21.2px)}51%{transform:translate(365.9px,17.8px)}53.13%{transform:translate(380.7px,14.9px)}55.25%{transform:translate(395.7px,12.4px)}57.38%{transform:translate(410.8px,10.7px)}59.5%{transform:translate(425.9px,10px)}61.63%{transform:translate(441.1px,10.6px)}63.75%{transform:translate(456.1px,12.5px)}65.88%{transform:translate(471px,15.6px)}68%{transform:translate(485.5px,19.9px)}70.13%{transform:translate(499.8px,25.2px)}72.25%{transform:translate(513.7px,31.2px)}74.38%{transform:translate(527.4px,37.7px)}76.5%{transform:translate(540.9px,44.6px)}78.63%{transform:translate(554.4px,51.5px)}80.75%{transform:translate(568.1px,58.2px)}82.88%{transform:translate(581.9px,64.4px)}85%,100%{transform:translate(596px,70px)}}</style><text class=\"engines-gm-arclength-h\" x=\"24\" y=\"36\">Equal steps in t</text><text class=\"engines-gm-arclength-s engines-gm-arclength-e\" x=\"616\" y=\"36\">speed follows control-point spacing</text><g transform=\"translate(0,70)\"><path class=\"engines-gm-arclength-cv\" d=\"M44 74C69.3 55.3 96.3 20.3 120 18C143.7 15.7 134.3 61.3 186 60C237.7 58.7 361.7 8.3 430 10C498.3 11.7 540.7 50 596 70\"/><rect class=\"engines-gm-arclength-k\" x=\"39\" y=\"69\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"engines-gm-arclength-k\" x=\"115\" y=\"13\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"engines-gm-arclength-k\" x=\"181\" y=\"55\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"engines-gm-arclength-k\" x=\"425\" y=\"5\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"engines-gm-arclength-k\" x=\"591\" y=\"65\" width=\"10\" height=\"10\" rx=\"2\"/><circle class=\"engines-gm-arclength-tk\" cx=\"44\" cy=\"74\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"63.2\" cy=\"57.7\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"82.6\" cy=\"39.9\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"101.7\" cy=\"25.1\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"120\" cy=\"18\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"133\" cy=\"23.8\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"142.5\" cy=\"38.6\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"157.2\" cy=\"53.7\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"186\" cy=\"60\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"236.3\" cy=\"51.4\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"301.8\" cy=\"33.9\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"370.3\" cy=\"16.9\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"430\" cy=\"10\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"477\" cy=\"17.3\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"517.9\" cy=\"33.1\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"556.3\" cy=\"52.4\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"596\" cy=\"70\" r=\"3.5\"/><circle class=\"engines-gm-arclength-mw engines-gm-arclength-m0\" r=\"7\" transform=\"translate(44,74)\"/></g><text class=\"engines-gm-arclength-h\" x=\"24\" y=\"202\">Equal steps in arc length</text><text class=\"engines-gm-arclength-s engines-gm-arclength-e\" x=\"616\" y=\"202\">constant speed along the curve</text><g transform=\"translate(0,236)\"><path class=\"engines-gm-arclength-cv\" d=\"M44 74C69.3 55.3 96.3 20.3 120 18C143.7 15.7 134.3 61.3 186 60C237.7 58.7 361.7 8.3 430 10C498.3 11.7 540.7 50 596 70\"/><rect class=\"engines-gm-arclength-k\" x=\"39\" y=\"69\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"engines-gm-arclength-k\" x=\"115\" y=\"13\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"engines-gm-arclength-k\" x=\"181\" y=\"55\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"engines-gm-arclength-k\" x=\"425\" y=\"5\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"engines-gm-arclength-k\" x=\"591\" y=\"65\" width=\"10\" height=\"10\" rx=\"2\"/><circle class=\"engines-gm-arclength-tk\" cx=\"44\" cy=\"74\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"72.6\" cy=\"49.1\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"101.8\" cy=\"25\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"135\" cy=\"26.5\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"159.3\" cy=\"54.8\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"196.4\" cy=\"59.2\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"233.7\" cy=\"52\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"270.4\" cy=\"42.5\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"307\" cy=\"32.5\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"343.7\" cy=\"22.9\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"380.7\" cy=\"14.9\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"418.4\" cy=\"10.2\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"456.1\" cy=\"12.5\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"492.7\" cy=\"22.4\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"527.4\" cy=\"37.7\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"561.2\" cy=\"54.9\" r=\"3.5\"/><circle class=\"engines-gm-arclength-tk\" cx=\"596\" cy=\"70\" r=\"3.5\"/><circle class=\"engines-gm-arclength-mo engines-gm-arclength-m1\" r=\"7\" transform=\"translate(44,74)\"/></g><rect class=\"engines-gm-arclength-k\" x=\"24\" y=\"337\" width=\"10\" height=\"10\" rx=\"2\"/><text class=\"engines-gm-arclength-s\" x=\"42\" y=\"347\">control point</text><circle class=\"engines-gm-arclength-tk\" cx=\"160\" cy=\"342\" r=\"3.5\"/><text class=\"engines-gm-arclength-s\" x=\"172\" y=\"347\">one of 16 equal steps</text></svg>"
        },
        {
          "type": "h",
          "text": "Springs and SmoothDamp"
        },
        {
          "type": "p",
          "text": "A damped spring pulls a value toward a target with acceleration `-stiffness * (x - target) - damping * velocity`. The **damping ratio** decides the character: below 1 (under-damped) it overshoots and wobbles, which suits UI pops and bouncy pickups; exactly 1 (**critically damped**) reaches the target as fast as possible without overshoot, which suits cameras and aim assist; above 1 it creeps. Unlike exponential decay, a spring has velocity, so a moving target is followed without the visible \"snap\" in speed when it starts or stops. Integrating a stiff spring with explicit Euler blows up when `dt` is large; use semi-implicit Euler with a capped step, or a closed-form solution. Unity's `Mathf.SmoothDamp` and `Vector3.SmoothDamp` are a critically damped spring with a stable approximation: you pass the velocity by `ref` and keep it between frames, and `smoothTime` is roughly the time to reach the target."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "public class FollowCamera : MonoBehaviour\n{\n    [SerializeField] Transform target;\n    [SerializeField] float smoothTime = 0.15f;   // seconds, not frames\n    [SerializeField] float lookAhead = 2.5f;     // metres in the movement direction\n    [SerializeField] Vector2 deadZone = new Vector2(1.5f, 1f);\n    Vector3 focus, velocity;\n\n    void Start() => focus = target.position;\n\n    void LateUpdate()\n    {\n        // Move the focus only when the target leaves the dead zone box.\n        Vector3 d = target.position - focus;\n        focus.x += Mathf.Sign(d.x) * Mathf.Max(0f, Mathf.Abs(d.x) - deadZone.x);\n        focus.y += Mathf.Sign(d.y) * Mathf.Max(0f, Mathf.Abs(d.y) - deadZone.y);\n\n        Vector3 goal = focus + Vector3.right * (lookAhead * facing);\n        goal.z = transform.position.z;\n        transform.position = Vector3.SmoothDamp(transform.position, goal, ref velocity, smoothTime);\n    }\n\n    public float facing = 1f; // +1 or -1, set by the player controller\n}"
        },
        {
          "type": "h",
          "text": "Seeds, determinism and noise"
        },
        {
          "type": "p",
          "text": "A **pseudo-random number generator** is a deterministic function of its state: the same seed gives the same sequence. That is what makes replays, daily challenges, procedural levels and bug reports reproducible, and it breaks the moment two systems share one generator. `UnityEngine.Random` is a single global stream, so if a particle effect draws three extra numbers, every later \"random\" choice in level generation shifts. Give each consumer its own generator (`System.Random(seed)`, a small xorshift or PCG struct, or `Unity.Mathematics.Random`, which must not be seeded with 0), derive sub-seeds from a master seed (`hash(worldSeed, chunkX, chunkY)`), and prefer **stateless hashing** for content addressed by position so chunk (12, -3) is identical no matter which chunks generated first. Integer arithmetic is reproducible everywhere; floating point results can differ across compilers, CPUs and platforms, so lockstep multiplayer usually needs fixed-point or tightly controlled floats."
        },
        {
          "type": "p",
          "text": "Random values are uncorrelated: neighbouring samples jump arbitrarily, which looks like TV static. **Noise** gives smooth, controllable randomness. **Value noise** assigns random values to lattice points and interpolates them, which shows blocky grid artefacts. **Gradient noise** (Perlin) assigns random gradients instead, giving smoother features; **simplex** noise uses a triangular lattice, is cheaper in higher dimensions and has fewer axis-aligned artefacts. Layering octaves at doubling frequency and halving amplitude (**fBm**) produces terrain-like detail. `Mathf.PerlinNoise(x, y)` returns roughly 0 to 1 (it can slightly exceed the range), and gradient noise is the same value at every integer lattice point, so sampling at whole-number coordinates returns a constant; scale and offset the inputs, and use a seed-derived offset to get different worlds."
        },
        {
          "type": "h",
          "text": "Game feel: camera, shake and timing"
        },
        {
          "type": "p",
          "text": "\"Game feel\" or **juice** is the layer of small responses that make input feel physical. The camera is the biggest one. A **dead zone** lets the player move inside a box without the camera moving, which removes jitter from small corrections; **look-ahead** shifts the framing in the movement or aim direction so the player sees where they are going; platformers often lock vertical follow to the last grounded height so jumps do not bob the screen. Smoothing on top of that uses the dt-correct decay or SmoothDamp from above, with separate settings per axis."
        },
        {
          "type": "p",
          "text": "Good **screen shake** is driven by **trauma**, a value in [0, 1] that hits add to (clamped) and that decays linearly over time. The shake amount is `trauma²` (or cubed), so small hits barely register and big ones dominate, and the fall-off feels natural. The offset and a small roll angle come from **smooth noise** sampled at time times a frequency, not from `Random.insideUnitCircle` each frame: per-frame random jitter changes character with frame rate (more frames, more jumps) and reads as noise rather than impact. Apply the shake to a child offset of the camera so it never disturbs the follow logic, and offer a setting to reduce or disable it for players sensitive to motion."
        },
        {
          "type": "figure",
          "id": "engines-gm-trauma-shake",
          "caption": "Each hit adds trauma that decays linearly; squaring it makes the shake fall off faster, and the noise-driven camera offset settles smoothly instead of jittering.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"Trauma-driven screen shake. Two hits add trauma, which then decays linearly to zero; shake is trauma squared, so it falls off faster. A camera view frame is offset and rotated by smooth noise scaled by shake, and settles back onto its rest position.\"><style>.engines-gm-trauma-shake-t{font-size:14px;fill:var(--fig-ink)}.engines-gm-trauma-shake-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-gm-trauma-shake-s{font-size:13px;fill:var(--fig-muted)}.engines-gm-trauma-shake-c{text-anchor:middle}.engines-gm-trauma-shake-e{text-anchor:end}.engines-gm-trauma-shake-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-gm-trauma-shake-ax{stroke:var(--fig-line);stroke-width:1.5}.engines-gm-trauma-shake-tr{fill:none;stroke:var(--fig-accent2);stroke-width:2;stroke-linejoin:round}.engines-gm-trauma-shake-sh{fill:none;stroke:var(--fig-accent);stroke-width:2.5;stroke-linejoin:round}.engines-gm-trauma-shake-hit{fill:var(--fig-bad)}.engines-gm-trauma-shake-ph{stroke:var(--fig-ink);stroke-width:1.5;stroke-opacity:.5}.engines-gm-trauma-shake-rest{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:5 5}.engines-gm-trauma-shake-cam{fill:var(--fig-panel);fill-opacity:.85;stroke:var(--fig-accent);stroke-width:2}.engines-gm-trauma-shake-gr{stroke:var(--fig-ink);stroke-width:1.5;stroke-opacity:.6}.engines-gm-trauma-shake-sun{fill:var(--fig-warn)}.engines-gm-trauma-shake-hz{stroke:var(--fig-ok);stroke-width:2}.engines-gm-trauma-shake-dot{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2}.engines-gm-trauma-shake-px{animation:engines-gm-trauma-shake-px 6s linear infinite}@keyframes engines-gm-trauma-shake-px{0%{transform:translateX(56px)}75%,100%{transform:translateX(356px)}}.engines-gm-trauma-shake-py{animation:engines-gm-trauma-shake-py 6s linear infinite}@keyframes engines-gm-trauma-shake-py{0%{transform:translateY(166.5px)}1%{transform:translateY(170.6px)}2%{transform:translateY(174.7px)}3%{transform:translateY(178.6px)}4%{transform:translateY(182.3px)}5%{transform:translateY(186px)}6%{transform:translateY(189.5px)}7%{transform:translateY(193px)}8%{transform:translateY(196.3px)}9%{transform:translateY(199.4px)}10%{transform:translateY(202.5px)}11%{transform:translateY(205.4px)}12%{transform:translateY(208.3px)}13%{transform:translateY(211px)}14%{transform:translateY(213.5px)}15%{transform:translateY(90px)}15%{transform:translateY(216px)}15%{transform:translateY(90px)}17.5%{transform:translateY(104.6px)}20%{transform:translateY(118.5px)}22.5%{transform:translateY(131.6px)}25%{transform:translateY(144px)}27.5%{transform:translateY(155.6px)}30%{transform:translateY(166.5px)}32.5%{transform:translateY(176.6px)}35%{transform:translateY(186px)}37.5%{transform:translateY(194.6px)}40%{transform:translateY(202.5px)}42.5%{transform:translateY(209.6px)}45%{transform:translateY(216px)}47.5%{transform:translateY(221.6px)}50%{transform:translateY(226.5px)}52.5%{transform:translateY(230.6px)}55%{transform:translateY(234px)}57.5%{transform:translateY(236.6px)}60%{transform:translateY(238.5px)}62.5%{transform:translateY(239.6px)}65%{transform:translateY(240px)}67.5%{transform:translateY(240px)}70%{transform:translateY(240px)}72.5%{transform:translateY(240px)}75%{transform:translateY(240px)}75%,100%{transform:translateY(240px)}}.engines-gm-trauma-shake-cg{transform-box:fill-box;transform-origin:50% 50%}.engines-gm-trauma-shake-cm{animation:engines-gm-trauma-shake-cm 6s linear infinite}@keyframes engines-gm-trauma-shake-cm{0%{transform:translate(6.6px,7.6px) rotate(1.3deg)}1%{transform:translate(5.3px,4.2px) rotate(0.5deg)}2%{transform:translate(1.5px,-5.2px) rotate(0.3deg)}3%{transform:translate(0.7px,-7.1px) rotate(0.5deg)}4%{transform:translate(0.7px,-2.4px) rotate(0.5deg)}5%{transform:translate(-2.2px,-1.5px) rotate(-0.2deg)}6%{transform:translate(-5.6px,-3.1px) rotate(-1.1deg)}7%{transform:translate(-4px,0.6px) rotate(-1.2deg)}8%{transform:translate(1.9px,5.8px) rotate(-0.5deg)}9%{transform:translate(5.7px,4.5px) rotate(0.2deg)}10%{transform:translate(3.7px,0.1px) rotate(0.4deg)}11%{transform:translate(-0.7px,-0.4px) rotate(0.2deg)}12%{transform:translate(-2.6px,0.3px) rotate(0.2deg)}13%{transform:translate(-1.6px,-2px) rotate(0.4deg)}14%{transform:translate(-0.6px,-3.8px) rotate(0.5deg)}15%{transform:translate(-4.5px,-9px) rotate(1.8deg)}16%{transform:translate(-2.3px,8.3px) rotate(-1.2deg)}17%{transform:translate(8.7px,7.3px) rotate(-3.2deg)}18%{transform:translate(16.6px,3.4px) rotate(-2.6deg)}19%{transform:translate(8.4px,11.2px) rotate(-0.9deg)}20%{transform:translate(-8.9px,13px) rotate(0deg)}21%{transform:translate(-16.4px,-1.8px) rotate(-0.4deg)}22%{transform:translate(-8px,-12.6px) rotate(-0.4deg)}23%{transform:translate(3.9px,-7.3px) rotate(0.8deg)}24%{transform:translate(6.9px,-2.6px) rotate(2.3deg)}25%{transform:translate(3.6px,-6.4px) rotate(2.4deg)}26%{transform:translate(2.8px,-3.9px) rotate(0.8deg)}27%{transform:translate(4.1px,7.6px) rotate(-0.8deg)}28%{transform:translate(0.7px,11.3px) rotate(-1.3deg)}29%{transform:translate(-6.9px,3.6px) rotate(-0.7deg)}30%{transform:translate(-9.6px,-0.6px) rotate(-0.4deg)}31%{transform:translate(-2.7px,1.5px) rotate(-0.7deg)}32%{transform:translate(6.4px,-1.4px) rotate(-1deg)}33%{transform:translate(8px,-7.9px) rotate(-0.5deg)}34%{transform:translate(2.5px,-6.6px) rotate(0.7deg)}35%{transform:translate(-2.3px,0.6px) rotate(1.4deg)}36%{transform:translate(-2.5px,2.8px) rotate(1deg)}37%{transform:translate(-1.4px,0.9px) rotate(0.2deg)}38%{transform:translate(-2.1px,2.5px) rotate(-0.2deg)}39%{transform:translate(-2.4px,5.1px) rotate(-0.1deg)}40%{transform:translate(0.3px,2px) rotate(0deg)}41%{transform:translate(4px,-2.8px) rotate(-0.3deg)}42%{transform:translate(4px,-2.9px) rotate(-0.7deg)}43%{transform:translate(0.2px,-0.9px) rotate(-0.6deg)}44%{transform:translate(-3px,-1.5px) rotate(-0.1deg)}45%{transform:translate(-2.7px,-2px) rotate(0.3deg)}46%{transform:translate(-0.5px,0.5px) rotate(0.4deg)}47%{transform:translate(0.7px,2.6px) rotate(0.2deg)}48%{transform:translate(0.5px,1.6px) rotate(0.1deg)}49%{transform:translate(0.5px,0.1px) rotate(0.1deg)}50%{transform:translate(0.9px,0.3px) rotate(0.1deg)}51%{transform:translate(0.7px,0.3px) rotate(0deg)}52%{transform:translate(-0.3px,-0.9px) rotate(-0.2deg)}53%{transform:translate(-1.2px,-1.2px) rotate(-0.2deg)}54%{transform:translate(-0.8px,-0.3px) rotate(-0.1deg)}55%{transform:translate(0.1px,0.3px) rotate(0deg)}56%{transform:translate(0.6px,0.1px) rotate(0deg)}57%{transform:translate(0.3px,0.1px) rotate(0deg)}58%{transform:translate(0px,0.3px) rotate(0deg)}59%{transform:translate(-0.1px,0.2px) rotate(0deg)}60%{transform:translate(0px,0px) rotate(0deg)}61%{transform:translate(0px,-0.1px) rotate(0deg)}62%{transform:translate(0px,0px) rotate(0deg)}63%{transform:translate(0px,0px) rotate(0deg)}64%{transform:translate(0px,0px) rotate(0deg)}65%{transform:translate(0px,0px) rotate(0deg)}66%{transform:translate(0px,0px) rotate(0deg)}67%{transform:translate(0px,0px) rotate(0deg)}68%{transform:translate(0px,0px) rotate(0deg)}69%{transform:translate(0px,0px) rotate(0deg)}70%{transform:translate(0px,0px) rotate(0deg)}71%{transform:translate(0px,0px) rotate(0deg)}72%{transform:translate(0px,0px) rotate(0deg)}73%{transform:translate(0px,0px) rotate(0deg)}74%{transform:translate(0px,0px) rotate(0deg)}75%,100%{transform:translate(0px,0px) rotate(0deg)}}</style><line class=\"engines-gm-trauma-shake-tr\" x1=\"56\" y1=\"32\" x2=\"76\" y2=\"32\"/><text class=\"engines-gm-trauma-shake-s\" x=\"84\" y=\"36\">trauma</text><line class=\"engines-gm-trauma-shake-sh\" x1=\"160\" y1=\"32\" x2=\"180\" y2=\"32\"/><text class=\"engines-gm-trauma-shake-s\" x=\"188\" y=\"36\">shake = trauma²</text><line class=\"engines-gm-trauma-shake-ax\" x1=\"56\" y1=\"90\" x2=\"56\" y2=\"240\"/><line class=\"engines-gm-trauma-shake-ax\" x1=\"56\" y1=\"240\" x2=\"356\" y2=\"240\"/><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-e\" x=\"46\" y=\"95\">1</text><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-e\" x=\"46\" y=\"245\">0</text><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-c\" x=\"56\" y=\"262\">0</text><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-c\" x=\"156\" y=\"262\">0.5</text><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-c\" x=\"256\" y=\"262\">1</text><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-e\" x=\"356\" y=\"262\">1.5 s</text><path class=\"engines-gm-trauma-shake-hit\" d=\"M56 86l-6 -10h12z\"/><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-c\" x=\"56\" y=\"70\">hit</text><path class=\"engines-gm-trauma-shake-hit\" d=\"M116 86l-6 -10h12z\"/><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-c\" x=\"116\" y=\"70\">hit</text><polyline class=\"engines-gm-trauma-shake-tr\" points=\"56,135 116,180 116,90 316,240 356,240\"/><polyline class=\"engines-gm-trauma-shake-sh\" points=\"56,166.5 58,168.6 60,170.6 62,172.7 64,174.7 66,176.6 68,178.6 70,180.5 72,182.3 74,184.2 76,186 78,187.8 80,189.5 82,191.3 84,193 86,194.6 88,196.3 90,197.9 92,199.4 94,201 96,202.5 98,204 100,205.4 102,206.9 104,208.3 106,209.6 108,211 110,212.3 112,213.5 114,214.8 116,90 116,90 122,98.9 128,107.5 134,115.8 140,123.8 146,131.6 152,139.1 158,146.4 164,153.4 170,160.1 176,166.5 182,172.7 188,178.6 194,184.2 200,189.5 206,194.6 212,199.4 218,204 224,208.3 230,212.3 236,216 242,219.5 248,222.7 254,225.6 260,228.2 266,230.6 272,232.7 278,234.6 284,236.2 290,237.5 296,238.5 302,239.3 308,239.8 314,240 320,240 326,240 332,240 338,240 344,240 350,240 356,240\"/><g class=\"engines-gm-trauma-shake-px\" transform=\"translate(56,0)\"><line class=\"engines-gm-trauma-shake-ph\" x1=\"0\" y1=\"86\" x2=\"0\" y2=\"240\"/><circle class=\"engines-gm-trauma-shake-dot engines-gm-trauma-shake-py\" r=\"5.5\" transform=\"translate(0,166.5)\"/></g><text class=\"engines-gm-trauma-shake-h engines-gm-trauma-shake-c\" x=\"504\" y=\"36\">camera view</text><rect class=\"engines-gm-trauma-shake-rest\" x=\"404\" y=\"85\" width=\"200\" height=\"130\" rx=\"12\"/><g class=\"engines-gm-trauma-shake-cg engines-gm-trauma-shake-cm\"><rect class=\"engines-gm-trauma-shake-cam\" x=\"404\" y=\"85\" width=\"200\" height=\"130\" rx=\"12\"/><line class=\"engines-gm-trauma-shake-hz\" x1=\"418\" y1=\"180\" x2=\"590\" y2=\"180\"/><circle class=\"engines-gm-trauma-shake-sun\" cx=\"560\" cy=\"119\" r=\"12\"/><line class=\"engines-gm-trauma-shake-gr\" x1=\"492\" y1=\"150\" x2=\"516\" y2=\"150\"/><line class=\"engines-gm-trauma-shake-gr\" x1=\"504\" y1=\"138\" x2=\"504\" y2=\"162\"/></g><text class=\"engines-gm-trauma-shake-s engines-gm-trauma-shake-c\" x=\"504\" y=\"247\">offset = max · shake · noise(t)</text></svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "public class CameraShake : MonoBehaviour   // on a child of the follow camera\n{\n    [SerializeField] float decayPerSecond = 1f, maxOffset = 0.4f, maxRoll = 3f, frequency = 18f;\n    float trauma, seed;\n\n    void Awake() => seed = Random.value * 1000f; // cosmetic, so the global stream is fine\n    public void AddTrauma(float amount) => trauma = Mathf.Clamp01(trauma + amount);\n\n    void LateUpdate()\n    {\n        trauma = Mathf.Max(0f, trauma - decayPerSecond * Time.unscaledDeltaTime);\n        float shake = trauma * trauma;\n        float t = Time.unscaledTime * frequency;\n        float nx = Mathf.PerlinNoise(seed, t) * 2f - 1f;\n        float ny = Mathf.PerlinNoise(seed + 1f, t) * 2f - 1f;\n        float nr = Mathf.PerlinNoise(seed + 2f, t) * 2f - 1f;\n        transform.localPosition = new Vector3(nx, ny, 0f) * (maxOffset * shake);\n        transform.localRotation = Quaternion.Euler(0f, 0f, nr * maxRoll * shake);\n    }\n}"
        },
        {
          "type": "p",
          "text": "Three more tools complete the kit. **Hit-stop** freezes the action for 40-120 ms on a heavy hit so the impact registers; setting `Time.timeScale = 0` freezes everything driven by scaled time (and stops `FixedUpdate`), so the timer that ends the freeze, UI and shake must use unscaled time, and a hit-stop during another hit-stop must not restore the wrong scale. **Squash and stretch** scales a sprite or mesh along the motion axis while preserving volume: stretch y by s and scale x by 1/s in 2D, or x and z by 1/sqrt(s) in 3D, then spring back. **Input buffering** and **coyote time**, covered with input handling, forgive presses that arrive slightly early or late. Every one of these is a duration or a rate in seconds. \"Freeze for 4 frames\" is 133 ms at 30 fps and 28 ms at 144 fps, which is the difference between a crunchy hit and an invisible one."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Test feel at two frame rates on purpose. Set `Application.targetFrameRate = 30` (and disable vSync) in a debug build, play the same moment, then repeat at your maximum. If the camera, shake or hit-stop feels different, some value is counted in frames. Keep tunables in seconds or 1/s in one ScriptableObject so designers can tweak them live in Play Mode."
        },
        {
          "type": "h",
          "text": "Common misconceptions"
        },
        {
          "type": "list",
          "items": [
            "'Multiplying the lerp factor by Time.deltaTime makes it frame-rate independent.' It is only a first-order approximation; use 1 - exp(-rate * dt).",
            "'Spline t is a percentage of the distance.' It is a parameter; constant speed needs an arc-length table.",
            "'A seed makes my generation deterministic.' Only if nothing else draws from that stream and the math is reproducible on every target.",
            "'Shake is random offsets each frame.' Good shake is smooth noise scaled by trauma squared, decaying over seconds.",
            "'Juice is polish for the end of the project.' Camera, hit-stop and input forgiveness define how controls feel and should be in the first playable."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents reach for `Vector3.Lerp(current, target, speed * Time.deltaTime)` in Update by default, so state the rule up front: every smoothing, timer and effect duration is expressed in seconds or 1/s and is frame-rate independent. Then make it testable: ask for an EditMode test that runs the smoothing or spring for one simulated second at dt = 1/30 and dt = 1/144 and asserts the results match within a small epsilon, and a test that the same seed produces the same level hash twice in a row. Ask the agent to grep the project for `UnityEngine.Random` in generation code and for frame counters used as timers. For feel itself, have the agent expose every tunable in a ScriptableObject and draw debug gizmos (dead zone box, look-ahead point, trauma value) so you can tune in Play Mode; whether it feels right is your call, not the agent's."
        },
        {
          "type": "p",
          "text": "The common thread is that the simulation should describe motion as a function of time, and the frame loop only samples it. Smoothing with decay rates, tweens on elapsed time, arc-length splines, springs with persisted velocity, seeded streams and trauma-driven shake all follow that rule, which is why they look the same on a 30 fps handheld and a 144 Hz monitor."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "`pos = Lerp(pos, target, 0.15f)` runs each frame and the camera lags at 30 fps but feels rigid at 144 fps",
              "use": "Exponential smoothing with 1 - exp(-rate * dt)",
              "why": "Using `k = 1 - exp(-rate * dt)` (or a half-life) removes the same fraction per second at any frame rate and never overshoots on hitches. Still lags a moving target; use a spring when you need to track velocity."
            },
            {
              "signal": "A UI element or door must move from A to B over a fixed duration with a chosen feel",
              "use": "Elapsed-time tween with easing",
              "why": "Compute `t = elapsed / duration`, apply an easing curve and `Lerp(a, b, ease(t))`. Exact and frame-rate independent by construction; restarting mid-tween needs care to avoid jumps."
            },
            {
              "signal": "A camera or follower must chase a moving target smoothly, without overshoot or sudden velocity changes",
              "use": "Critically damped spring (SmoothDamp)",
              "why": "Tracks target and velocity together, settling fastest without oscillation. Keep the velocity variable between frames; resetting it every frame or sharing it between objects breaks the motion."
            },
            {
              "signal": "An object moving along a spline by increasing `t` at a fixed rate speeds up on long segments and slows in tight clusters",
              "use": "Arc-length parameterization",
              "why": "Precompute a table from distance to `t` and move by distance, giving constant speed. Costs a lookup table per spline that must be rebuilt when points change."
            },
            {
              "signal": "A Catmull-Rom path through unevenly spaced points loops or overshoots at sharp corners",
              "use": "Centripetal Catmull-Rom",
              "why": "Using alpha 0.5 knot spacing avoids cusps and self-intersections while still passing through every point. Slightly more math than uniform; use Bezier when artists need direct tangent control."
            },
            {
              "signal": "A seeded level differs between runs because particles or other systems draw from the same global random stream",
              "use": "Per-system seeded RNG",
              "why": "Give each consumer its own generator instance seeded from the master seed, so unrelated code cannot shift its sequence. Seeds must be derived deterministically and generators kept out of shared global state."
            },
            {
              "signal": "Content must be random but identical whenever the same tile or chunk is revisited, in any order",
              "use": "Position hash for stateless randomness",
              "why": "Hash `(seed, x, y)` into a value instead of advancing a stream, so results do not depend on visit order. Hash quality matters: weak hashes show patterns."
            },
            {
              "signal": "Screen shake uses a new random offset every frame, looks like jitter and gets stronger at higher fps",
              "use": "Trauma-based noise shake",
              "why": "Sample smooth noise over time scaled by `trauma^2`, and decay trauma per second. Frame-rate independent and readable; offer a reduced-shake accessibility option."
            },
            {
              "signal": "A hit-stop counts frames, so it lasts 133 ms on a 30 fps handheld but 28 ms on a 144 Hz monitor",
              "use": "Durations in seconds, never frames",
              "why": "Express hit-stop, flashes and windows as real time so feel is the same on every device. Use unscaled time for the hit-stop timer itself, or a frozen time scale will never end it."
            },
            {
              "signal": "The camera jerks with every small player motion and the player cannot see what is ahead",
              "use": "Camera dead zone and look-ahead",
              "why": "Ignore movement inside a dead zone and offset the camera toward the velocity or aim direction with smoothing. Tune per genre; too much look-ahead feels detached."
            },
            {
              "signal": "Jumps and landings feel stiff and weightless even though the physics is correct",
              "use": "Squash and stretch",
              "why": "Briefly scale the sprite or mesh along motion on takeoff and impact, preserving volume, and ease back over a fraction of a second. Purely visual; keep colliders unchanged."
            }
          ]
        }
      ],
      "keyPoints": [
        "Per-frame Lerp(x, target, k) with constant k depends on frame rate; use k = 1 - exp(-rate * dt) or a half-life instead.",
        "Easing maps normalized time to progress, and tweens driven by elapsed time are frame-rate independent by construction.",
        "Spline t is not distance; constant speed needs an arc-length table, and centripetal Catmull-Rom avoids loops on uneven points.",
        "Critically damped springs such as SmoothDamp follow moving targets without overshoot; keep their velocity between frames.",
        "Give each system its own seeded generator or position hash, and use smooth noise, not per-frame random values, for shake and terrain.",
        "Dead zones, look-ahead, trauma-squared shake, hit-stop and squash and stretch are all tuned in seconds, never in frames."
      ],
      "quiz": [
        {
          "q": "A camera uses `pos = Vector3.Lerp(pos, target, 0.15f)` in Update. Testers on 30 fps devices say it lags; on 144 Hz monitors it feels rigid. What is the right fix?",
          "options": [
            "Move the code into FixedUpdate so it runs at a constant rate",
            "Multiply 0.15 by Time.deltaTime and keep the rest unchanged",
            "Use k = 1 - exp(-rate * Time.deltaTime) with a rate in 1/s",
            "Clamp the frame rate to 60 fps on every platform we ship"
          ],
          "answer": 2,
          "explain": "Exponential decay derived from dt gives the same curve at any frame rate. FixedUpdate makes the smoothing stutter against rendering, dt-scaling is only approximate and snaps on hitches, and a frame cap hides the bug."
        },
        {
          "q": "A rail-shooter camera moves along a Catmull-Rom path by increasing t at a fixed rate. It speeds up on long straights and slows in tight clusters of points. What should change?",
          "options": [
            "Convert distance travelled to t through an arc-length table",
            "Add more control points so that every segment has more of them",
            "Switch the path to a Bezier spline with the same points",
            "Ease the t value with an ease-in-out curve across the path"
          ],
          "answer": 0,
          "explain": "Each segment spans the same range of t regardless of length, so constant speed needs reparameterisation by arc length. More points or a different spline type still has t unrelated to distance, and easing only adds more speed variation."
        },
        {
          "q": "A daily-challenge dungeon uses `Random.InitState(dailySeed)` and `UnityEngine.Random` for layout. Players report different layouts for the same day. What is the most likely cause?",
          "options": [
            "Perlin noise returns different values on each platform",
            "Other systems also draw from the global stream mid-generation",
            "Random.InitState only accepts seeds below 65,536",
            "The seed must be re-applied before every single draw"
          ],
          "answer": 1,
          "explain": "UnityEngine.Random is one shared stream, so any extra draw (particles, AI, a coroutine finishing earlier) shifts later values. A dedicated generator or position hashing per system fixes it. The other options are not how the API behaves."
        },
        {
          "q": "Your screen shake uses `Random.insideUnitCircle * strength` every frame. It looks like jitter, and stronger at 144 fps. Which redesign fixes both problems?",
          "options": [
            "Run the shake from FixedUpdate at the physics rate",
            "Divide strength by the frame rate to normalize it",
            "Lerp toward a new random offset with a constant k each frame",
            "Scale smooth noise sampled over time by trauma squared"
          ],
          "answer": 3,
          "explain": "Noise sampled from time is smooth and independent of how often you sample it, and trauma squared shapes the decay. Fixed-rate random offsets still jitter, scaling by frame rate does not create smoothness, and constant-k lerp reintroduces frame-rate dependence."
        },
        {
          "q": "A heavy attack triggers a \"4-frame hit-stop\" by setting timeScale to 0 and counting frames. Players on handhelds call it crunchy; PC players at 144 fps barely notice it. What is the best change?",
          "options": [
            "Raise the hit-stop to 10 frames on every platform",
            "Freeze for a duration in seconds, timed with unscaled time",
            "Run the hit-stop counter inside FixedUpdate instead",
            "Slow time to 0.5 instead of freezing it fully"
          ],
          "answer": 1,
          "explain": "Four frames is 133 ms at 30 fps and 28 ms at 144 fps. A duration in seconds measured on unscaled time behaves the same everywhere; FixedUpdate does not even run while timeScale is 0."
        },
        {
          "q": "A third-person camera is already smoothed, but it twitches with every small strafe, and players cannot see enough of the path ahead when sprinting. What should you reach for?",
          "options": [
            "Exponential smoothing with `1 - exp(-rate * dt)` on position",
            "A camera dead zone combined with look-ahead on velocity",
            "Trauma-based noise shake applied to the camera",
            "Squash and stretch applied to the character mesh"
          ],
          "answer": 1,
          "explain": "A dead zone ignores small movements and look-ahead shifts framing toward where the player is heading. More smoothing would add lag without showing the path ahead, and shake or squash do not affect framing."
        }
      ]
    },
    {
      "id": "engines-assets-memory",
      "title": "Assets, memory and streaming",
      "minutes": 14,
      "summary": "How source art becomes platform-ready data, how references survive renames, and how budgets, streaming and pooling keep memory and frame time stable.",
      "lesson": [
        {
          "type": "p",
          "text": "A mobile game ships with 1.5 GB of uncompressed source art and must run in roughly 1-1.5 GB of RAM shared with the OS, with the process killed silently if it goes over. A console title may have 8-13 GB usable and a 100 GB open world. The work of an engine's asset system is to move data from authoring formats into compact, fast-loading, platform-specific forms, to keep references stable, and to get exactly the right data into memory at the right time without hitches."
        },
        {
          "type": "h",
          "text": "Import and cooking pipelines"
        },
        {
          "type": "p",
          "text": "Source assets (PSD, FBX, WAV, authored files) are optimized for editing, not for loading. An **import** step converts them into engine-internal representations: a texture becomes mip chains with a chosen compression format, a mesh becomes vertex and index buffers with an optimized vertex cache order, audio is encoded. **Cooking** (or building) is the platform-specific pass: ASTC on mobile, BCn (DXT) on desktop and consoles, endianness conversion where needed, packing into archives, and dependency resolution. The output is designed so that loading is mostly a memcpy and pointer fix-up rather than parsing."
        },
        {
          "type": "p",
          "text": "Two properties matter. **Determinism**: the same inputs and settings produce the same outputs, so build caches work. **Incrementality**: a change to one texture reimports only that texture and its dependents, using content hashes plus settings hashes. Teams with 100k assets live or die by a shared cache server that avoids reimporting on every machine."
        },
        {
          "type": "h",
          "text": "References, GUIDs and dependencies"
        },
        {
          "type": "p",
          "text": "A prefab references a material, which references textures and a shader. If references were file paths, renaming a folder would break the project. Engines instead give each asset a persistent **GUID** (stored in a sidecar such as a `.meta` file in Unity, or in the asset header) and serialize references as GUIDs. Paths are a lookup index; identity is the GUID. This has consequences. Moving files inside the editor keeps references; moving them outside the editor (a script, a git operation that drops sidecar files) orphans them. Duplicating a sidecar causes GUID collisions. References form a **dependency graph**, and building a bundle must include everything reachable, which is where accidental bloat comes from: one reference from a menu to a high-resolution cinematic pulls the cinematic into the menu's bundle."
        },
        {
          "type": "list",
          "items": [
            "Hard references load their targets together with the referrer; they are simple and cause loading chains.",
            "Soft or lazy references store only the ID; you request the load explicitly and receive an async handle.",
            "Reference counting on handles lets the system unload an asset when the last user releases it; leaks happen when someone forgets to release."
          ]
        },
        {
          "type": "h",
          "text": "Memory budgets per platform"
        },
        {
          "type": "p",
          "text": "Memory is a design constraint, set early and per platform. A plausible mobile budget on a mid-tier phone: 700 MB total app, with textures 250-350 MB, meshes 50 MB, audio 40 MB, animation 30 MB, scripts and managed heap 100 MB, and the remainder for rendering targets and engine. A texture's GPU size is `width x height x bytes-per-pixel x 1.33` (the mip chain adds one third). A 2048 x 2048 RGBA32 texture is 16 MB, plus mips about 21 MB. With ASTC 6x6 (about 3.56 bits per pixel) the same texture is about 1.9 MB base, 2.5 MB with mips, close to an 8x saving. That is why compression format choice is the cheapest memory win in a project."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "2048x2048 texture, with mips (x1.33)\nRGBA32       : 2048*2048*4  = 16.0 MB -> 21.3 MB\nBC7 (8 bpp)  : 2048*2048*1  =  4.0 MB ->  5.3 MB\nASTC 6x6     : ~3.56 bpp    =  1.9 MB ->  2.5 MB\nASTC 8x8     : 2 bpp        =  1.0 MB ->  1.3 MB"
        },
        {
          "type": "figure",
          "id": "engines-texture-memory",
          "caption": "Drawn to scale: the same 2048 x 2048 texture is 21.3 MB as RGBA32 and 2.5 MB as ASTC 6x6, and mips add a third on top of every format.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 264\" role=\"img\" aria-label=\"Bars drawn to scale for one 2048 by 2048 texture with mips: RGBA32 21.3 MB, BC7 5.3 MB, ASTC 6x6 2.5 MB, ASTC 8x8 1.3 MB; the mip chain adds one third on top of each base level.\"><style>.engines-texture-memory-t{font-size:14px;fill:var(--fig-ink)}.engines-texture-memory-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-texture-memory-s{font-size:13px;fill:var(--fig-muted)}.engines-texture-memory-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-texture-memory-c{text-anchor:middle}.engines-texture-memory-e{text-anchor:end}.engines-texture-memory-a{fill:var(--fig-accent)}.engines-texture-memory-m{fill:var(--fig-accent);fill-opacity:.4}.engines-texture-memory-g{transform-box:fill-box;transform-origin:0 50%;animation:engines-texture-memory-g 6s cubic-bezier(.2,.7,.3,1) infinite}.engines-texture-memory-v{animation:engines-texture-memory-v 6s linear infinite}.engines-texture-memory-ax{stroke:var(--fig-line);stroke-width:1.5}@keyframes engines-texture-memory-g{0%,50%{transform:scaleX(1)}56%{transform:scaleX(0)}86%,100%{transform:scaleX(1)}}@keyframes engines-texture-memory-v{0%,50%{opacity:1}54%,80%{opacity:0}86%,100%{opacity:1}}</style><text class=\"engines-texture-memory-h\" x=\"24\" y=\"34\">2048 x 2048 texture in GPU memory</text><rect class=\"engines-texture-memory-a\" x=\"380\" y=\"23\" width=\"14\" height=\"14\" rx=\"3\"/><text class=\"engines-texture-memory-s\" x=\"400\" y=\"34\">base level</text><rect class=\"engines-texture-memory-m\" x=\"486\" y=\"23\" width=\"14\" height=\"14\" rx=\"3\"/><text class=\"engines-texture-memory-s\" x=\"506\" y=\"34\">+ mips (x1.33)</text><line class=\"engines-texture-memory-ax\" x1=\"180\" y1=\"52\" x2=\"180\" y2=\"252\"/><text class=\"engines-texture-memory-t\" x=\"24\" y=\"85\">RGBA32</text><text class=\"engines-texture-memory-s\" x=\"104\" y=\"85\">32 bpp</text><g class=\"engines-texture-memory-g\"><rect class=\"engines-texture-memory-a\" x=\"180\" y=\"66\" width=\"288\" height=\"28\" rx=\"4\"/><rect class=\"engines-texture-memory-m\" x=\"468\" y=\"66\" width=\"95.4\" height=\"28\" rx=\"4\"/></g><text class=\"engines-texture-memory-t engines-texture-memory-v\" x=\"573.4\" y=\"85\">21.3 MB</text><text class=\"engines-texture-memory-t\" x=\"24\" y=\"133\">BC7</text><text class=\"engines-texture-memory-s\" x=\"104\" y=\"133\">8 bpp</text><g class=\"engines-texture-memory-g\"><rect class=\"engines-texture-memory-a\" x=\"180\" y=\"114\" width=\"72\" height=\"28\" rx=\"4\"/><rect class=\"engines-texture-memory-m\" x=\"252\" y=\"114\" width=\"23.4\" height=\"28\" rx=\"4\"/></g><text class=\"engines-texture-memory-t engines-texture-memory-v\" x=\"285.4\" y=\"133\">5.3 MB</text><text class=\"engines-texture-memory-t\" x=\"24\" y=\"181\">ASTC 6x6</text><text class=\"engines-texture-memory-s\" x=\"104\" y=\"181\">3.56 bpp</text><g class=\"engines-texture-memory-g\"><rect class=\"engines-texture-memory-a\" x=\"180\" y=\"162\" width=\"34.2\" height=\"28\" rx=\"4\"/><rect class=\"engines-texture-memory-m\" x=\"214.2\" y=\"162\" width=\"10.8\" height=\"28\" rx=\"4\"/></g><text class=\"engines-texture-memory-t engines-texture-memory-v\" x=\"235\" y=\"181\">2.5 MB</text><text class=\"engines-texture-memory-t\" x=\"24\" y=\"229\">ASTC 8x8</text><text class=\"engines-texture-memory-s\" x=\"104\" y=\"229\">2 bpp</text><g class=\"engines-texture-memory-g\"><rect class=\"engines-texture-memory-a\" x=\"180\" y=\"210\" width=\"18\" height=\"28\" rx=\"4\"/><rect class=\"engines-texture-memory-m\" x=\"198\" y=\"210\" width=\"5.4\" height=\"28\" rx=\"4\"/></g><text class=\"engines-texture-memory-t engines-texture-memory-v\" x=\"213.4\" y=\"229\">1.3 MB</text></svg>"
        },
        {
          "type": "h",
          "text": "Loading and streaming"
        },
        {
          "type": "p",
          "text": "Synchronous loading blocks the main thread: loading a 40 MB bundle from flash at 150 MB/s is about 270 ms, which is 16 dropped frames at 60 fps. Load asynchronously, with decompression and deserialization on worker threads and only the final object instantiation or GPU upload on the main thread, ideally time-sliced to a per-frame budget (for example 2 ms). **Streaming** extends this to the world: divide levels into cells or sublevels, load those near the player based on distance and predicted movement, and unload those behind. **Texture streaming** keeps only the mip levels needed for the current screen size: a texture covering 100 pixels does not need its 2048 level. The system tracks a memory budget and lowers mips when over it, which is why a texture can look blurry for a moment after a camera cut."
        },
        {
          "type": "figure",
          "id": "engines-streaming",
          "caption": "Cells ahead of the player start loading before the player reaches them, and cells left behind unload once they fall outside the unload distance.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"A top-down world split into cells. As the player moves right, cells inside the load ring become loaded, cells in the prefetch ring ahead of the player start loading, and cells left behind unload.\"><style>.engines-streaming-t{font-size:14px;fill:var(--fig-ink)}.engines-streaming-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-streaming-s{font-size:13px;fill:var(--fig-muted)}.engines-streaming-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-streaming-c{text-anchor:middle}.engines-streaming-e{text-anchor:end}.engines-streaming-U{fill:var(--fig-panel);fill-opacity:1}.engines-streaming-P{fill:var(--fig-warn);fill-opacity:.3}.engines-streaming-L{fill:var(--fig-accent);fill-opacity:.32}.engines-streaming-cl{stroke:var(--fig-line);stroke-width:1.5;animation-duration:7s;animation-timing-function:linear;animation-iteration-count:infinite}.engines-streaming-rl{fill:none;stroke:var(--fig-accent);stroke-width:2}.engines-streaming-rp{fill:none;stroke:var(--fig-warn);stroke-width:2;stroke-dasharray:6 5}.engines-streaming-pl{fill:var(--fig-ink)}.engines-streaming-mv{animation:engines-streaming-mv 7s linear infinite}@keyframes engines-streaming-mv{0%{transform:translate(96px,152px);opacity:1}80%,88%{transform:translate(544px,152px);opacity:1}92%{opacity:0}94%{transform:translate(544px,152px);opacity:0}94.1%{transform:translate(96px,152px);opacity:0}97%{opacity:0}100%{transform:translate(96px,152px);opacity:1}}@keyframes engines-streaming-k0{0%,18.5%{fill:var(--fig-accent);fill-opacity:.32}20%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-accent);fill-opacity:.32}}@keyframes engines-streaming-k1{0%,29.8%{fill:var(--fig-accent);fill-opacity:.32}31.3%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-accent);fill-opacity:.32}}@keyframes engines-streaming-k2{0%,8.8%{fill:var(--fig-warn);fill-opacity:.3}10.3%,41.3%{fill:var(--fig-accent);fill-opacity:.32}42.8%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-warn);fill-opacity:.3}}@keyframes engines-streaming-k3{0%,20.3%{fill:var(--fig-warn);fill-opacity:.3}21.8%,52.8%{fill:var(--fig-accent);fill-opacity:.32}54.3%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-warn);fill-opacity:.3}}@keyframes engines-streaming-k4{0%,5%{fill:var(--fig-panel);fill-opacity:1}6.5%,31.5%{fill:var(--fig-warn);fill-opacity:.3}33%,64.3%{fill:var(--fig-accent);fill-opacity:.32}65.8%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k5{0%,16.3%{fill:var(--fig-panel);fill-opacity:1}17.8%,43%{fill:var(--fig-warn);fill-opacity:.3}44.5%,75.5%{fill:var(--fig-accent);fill-opacity:.32}77%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k6{0%,27.8%{fill:var(--fig-panel);fill-opacity:1}29.3%,54.5%{fill:var(--fig-warn);fill-opacity:.3}56%,92.5%{fill:var(--fig-accent);fill-opacity:.32}94%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k7{0%,39.3%{fill:var(--fig-panel);fill-opacity:1}40.8%,65.8%{fill:var(--fig-warn);fill-opacity:.3}67.3%,92.5%{fill:var(--fig-accent);fill-opacity:.32}94%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k8{0%,21.5%{fill:var(--fig-accent);fill-opacity:.32}23%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-accent);fill-opacity:.32}}@keyframes engines-streaming-k9{0%,33%{fill:var(--fig-accent);fill-opacity:.32}34.5%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-accent);fill-opacity:.32}}@keyframes engines-streaming-k10{0%,4.3%{fill:var(--fig-warn);fill-opacity:.3}5.8%,44.3%{fill:var(--fig-accent);fill-opacity:.32}45.8%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-warn);fill-opacity:.3}}@keyframes engines-streaming-k11{0%,15.8%{fill:var(--fig-warn);fill-opacity:.3}17.3%,55.8%{fill:var(--fig-accent);fill-opacity:.32}57.3%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-warn);fill-opacity:.3}}@keyframes engines-streaming-k12{0%,3.3%{fill:var(--fig-panel);fill-opacity:1}4.8%,27.2%{fill:var(--fig-warn);fill-opacity:.3}28.7%,67.3%{fill:var(--fig-accent);fill-opacity:.32}68.8%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k13{0%,14.8%{fill:var(--fig-panel);fill-opacity:1}16.3%,38.5%{fill:var(--fig-warn);fill-opacity:.3}40%,92.5%{fill:var(--fig-accent);fill-opacity:.32}94%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k14{0%,26%{fill:var(--fig-panel);fill-opacity:1}27.5%,50%{fill:var(--fig-warn);fill-opacity:.3}51.5%,92.5%{fill:var(--fig-accent);fill-opacity:.32}94%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k15{0%,37.5%{fill:var(--fig-panel);fill-opacity:1}39%,61.5%{fill:var(--fig-warn);fill-opacity:.3}63%,92.5%{fill:var(--fig-accent);fill-opacity:.32}94%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k16{0%,18.5%{fill:var(--fig-accent);fill-opacity:.32}20%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-accent);fill-opacity:.32}}@keyframes engines-streaming-k17{0%,29.8%{fill:var(--fig-accent);fill-opacity:.32}31.3%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-accent);fill-opacity:.32}}@keyframes engines-streaming-k18{0%,8.8%{fill:var(--fig-warn);fill-opacity:.3}10.3%,41.3%{fill:var(--fig-accent);fill-opacity:.32}42.8%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-warn);fill-opacity:.3}}@keyframes engines-streaming-k19{0%,20.3%{fill:var(--fig-warn);fill-opacity:.3}21.8%,52.8%{fill:var(--fig-accent);fill-opacity:.32}54.3%,92.5%{fill:var(--fig-panel);fill-opacity:1}94%,100%{fill:var(--fig-warn);fill-opacity:.3}}@keyframes engines-streaming-k20{0%,5%{fill:var(--fig-panel);fill-opacity:1}6.5%,31.5%{fill:var(--fig-warn);fill-opacity:.3}33%,64.3%{fill:var(--fig-accent);fill-opacity:.32}65.8%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k21{0%,16.3%{fill:var(--fig-panel);fill-opacity:1}17.8%,43%{fill:var(--fig-warn);fill-opacity:.3}44.5%,75.5%{fill:var(--fig-accent);fill-opacity:.32}77%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k22{0%,27.8%{fill:var(--fig-panel);fill-opacity:1}29.3%,54.5%{fill:var(--fig-warn);fill-opacity:.3}56%,92.5%{fill:var(--fig-accent);fill-opacity:.32}94%,100%{fill:var(--fig-panel);fill-opacity:1}}@keyframes engines-streaming-k23{0%,39.3%{fill:var(--fig-panel);fill-opacity:1}40.8%,65.8%{fill:var(--fig-warn);fill-opacity:.3}67.3%,92.5%{fill:var(--fig-accent);fill-opacity:.32}94%,100%{fill:var(--fig-panel);fill-opacity:1}}</style><defs><clipPath id=\"engines-streaming-clip\"><rect x=\"64\" y=\"56\" width=\"512\" height=\"192\"/></clipPath></defs><rect class=\"engines-streaming-cl engines-streaming-U\" style=\"animation-name:engines-streaming-k0\" x=\"67\" y=\"59\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-U\" style=\"animation-name:engines-streaming-k1\" x=\"131\" y=\"59\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k2\" x=\"195\" y=\"59\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k3\" x=\"259\" y=\"59\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k4\" x=\"323\" y=\"59\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-P\" style=\"animation-name:engines-streaming-k5\" x=\"387\" y=\"59\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-P\" style=\"animation-name:engines-streaming-k6\" x=\"451\" y=\"59\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-U\" style=\"animation-name:engines-streaming-k7\" x=\"515\" y=\"59\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-U\" style=\"animation-name:engines-streaming-k8\" x=\"67\" y=\"123\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k9\" x=\"131\" y=\"123\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k10\" x=\"195\" y=\"123\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k11\" x=\"259\" y=\"123\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k12\" x=\"323\" y=\"123\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-P\" style=\"animation-name:engines-streaming-k13\" x=\"387\" y=\"123\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-P\" style=\"animation-name:engines-streaming-k14\" x=\"451\" y=\"123\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-U\" style=\"animation-name:engines-streaming-k15\" x=\"515\" y=\"123\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-U\" style=\"animation-name:engines-streaming-k16\" x=\"67\" y=\"187\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-U\" style=\"animation-name:engines-streaming-k17\" x=\"131\" y=\"187\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k18\" x=\"195\" y=\"187\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k19\" x=\"259\" y=\"187\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-L\" style=\"animation-name:engines-streaming-k20\" x=\"323\" y=\"187\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-P\" style=\"animation-name:engines-streaming-k21\" x=\"387\" y=\"187\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-P\" style=\"animation-name:engines-streaming-k22\" x=\"451\" y=\"187\" width=\"58\" height=\"58\" rx=\"8\"/><rect class=\"engines-streaming-cl engines-streaming-U\" style=\"animation-name:engines-streaming-k23\" x=\"515\" y=\"187\" width=\"58\" height=\"58\" rx=\"8\"/><g clip-path=\"url(#engines-streaming-clip)\"><g class=\"engines-streaming-mv\" transform=\"translate(288,152)\"><path class=\"engines-streaming-rp\" d=\"M0 -230A230 230 0 0 1 0 230\"/><circle class=\"engines-streaming-rl\" cx=\"0\" cy=\"0\" r=\"96\"/><circle class=\"engines-streaming-pl\" r=\"9\"/><path class=\"engines-streaming-pl\" d=\"M14 -7l10 7l-10 7z\"/></g></g><text class=\"engines-streaming-s\" x=\"64\" y=\"36\">player moves right</text><line class=\"engines-streaming-rl\" x1=\"330\" y1=\"31\" x2=\"354\" y2=\"31\"/><text class=\"engines-streaming-s\" x=\"362\" y=\"36\">load radius</text><line class=\"engines-streaming-rp\" x1=\"458\" y1=\"31\" x2=\"482\" y2=\"31\"/><text class=\"engines-streaming-s\" x=\"490\" y=\"36\">prefetch ahead</text><rect class=\"engines-streaming-L\" x=\"64\" y=\"272\" width=\"18\" height=\"18\" rx=\"5\" style=\"stroke:var(--fig-line);stroke-width:1.5\"/><text class=\"engines-streaming-t\" x=\"90\" y=\"286\">loaded</text><rect class=\"engines-streaming-P\" x=\"234\" y=\"272\" width=\"18\" height=\"18\" rx=\"5\" style=\"stroke:var(--fig-line);stroke-width:1.5\"/><text class=\"engines-streaming-t\" x=\"260\" y=\"286\">loading (prefetch)</text><rect class=\"engines-streaming-U\" x=\"404\" y=\"272\" width=\"18\" height=\"18\" rx=\"5\" style=\"stroke:var(--fig-line);stroke-width:1.5\"/><text class=\"engines-streaming-t\" x=\"430\" y=\"286\">unloaded</text></svg>"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Streaming problems rarely show up on a developer machine with an NVMe drive. Test on the slowest target storage (a phone with a full flash, a console on its hard-drive install mode) and with a cold cache. Hitches that appear only when turning quickly are usually missed prefetch, not slow code."
        },
        {
          "type": "h",
          "text": "Object pooling"
        },
        {
          "type": "p",
          "text": "Instantiating a bullet, a particle burst or an enemy costs allocation, component setup and later garbage collection. A **pool** preallocates N instances, hands them out on `Get()` by activating and resetting them, and takes them back on `Release()`. It makes cost predictable: no allocation during gameplay and no garbage. Key rules: pooled objects must be fully reset (velocity, timers, event subscriptions, particle state), pool size needs a cap with a defined policy on exhaustion (grow, recycle the oldest, or refuse), and the pool should be warmed up during a loading screen rather than on first use. Unity ships a ready-made generic pool, `UnityEngine.Pool.ObjectPool<T>`, so a hand-written one like the sketch below is mainly for understanding or for engine-agnostic code."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "public sealed class Pool<T> where T : class\n{\n    readonly Stack<T> free = new Stack<T>();\n    readonly Func<T> create;\n    readonly Action<T> onGet, onRelease;\n\n    public Pool(Func<T> create, Action<T> onGet, Action<T> onRelease, int warm)\n    {\n        this.create = create; this.onGet = onGet; this.onRelease = onRelease;\n        for (int i = 0; i < warm; i++) free.Push(create());\n    }\n    public T Get()\n    {\n        T t = free.Count > 0 ? free.Pop() : create();\n        onGet(t);\n        return t;\n    }\n    public void Release(T t) { onRelease(t); free.Push(t); }\n}"
        },
        {
          "type": "h",
          "text": "Fragmentation"
        },
        {
          "type": "p",
          "text": "Free memory is not always usable memory. Allocating blocks of mixed sizes and freeing them in a different order leaves holes: 200 MB free total but no contiguous 32 MB block, so an allocation fails or the heap grows. Symptoms: memory climbs over a long session though live data is stable, and out-of-memory crashes appear after hours. Mitigations are to allocate by lifetime (per-frame linear arenas reset every frame, per-level arenas freed together, long-lived pools), to use fixed-size block allocators, to keep large buffers resident rather than repeatedly freed and reallocated, and to avoid growing managed collections without bound. In a garbage-collected runtime, the GC heap can fragment too, and large-object allocations may be handled differently, so reuse big arrays."
        },
        {
          "type": "figure",
          "id": "engines-fragmentation",
          "caption": "Same allocations, same 200 MB free: interleaved lifetimes leave only 25 MB holes, while a per-level arena frees one contiguous block.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 308\" role=\"img\" aria-label=\"Two 256 MB heaps receive the same allocations. In the mixed heap, freeing the 25 MB level blocks leaves 200 MB free in holes too small for a 32 MB request; with arenas by lifetime the same 200 MB is one contiguous block and the request fits.\"><style>.engines-fragmentation-t{font-size:14px;fill:var(--fig-ink)}.engines-fragmentation-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-fragmentation-s{font-size:13px;fill:var(--fig-muted)}.engines-fragmentation-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-fragmentation-c{text-anchor:middle}.engines-fragmentation-e{text-anchor:end}.engines-fragmentation-lv{fill:var(--fig-accent)}.engines-fragmentation-lt{fill:var(--fig-accent2);fill-opacity:.5}.engines-fragmentation-hole{fill:none;stroke:var(--fig-muted);stroke-width:1;stroke-dasharray:3 3}.engines-fragmentation-tk{fill:var(--fig-panel)}.engines-fragmentation-ol{fill:none;stroke:var(--fig-line);stroke-width:1.5}.engines-fragmentation-bad{fill:var(--fig-bad);fill-opacity:.12;stroke:var(--fig-bad);stroke-width:2}.engines-fragmentation-ok{fill:var(--fig-ok);fill-opacity:.2;stroke:var(--fig-ok);stroke-width:2}.engines-fragmentation-rb{fill:var(--fig-bad);font-size:14px}.engines-fragmentation-rk{fill:var(--fig-ok);font-size:14px}.engines-fragmentation-cv{transform-box:fill-box;transform-origin:100% 50%;animation-name:engines-fragmentation-cv;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-fragmentation-cv{0%,8%{transform:scaleX(0)}9%,14%{transform:scaleX(1)}34%,100%{transform:scaleX(0)}}.engines-fragmentation-lt{animation-name:engines-fragmentation-lt;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-fragmentation-lt{0%,8%{opacity:0}9%,40%{opacity:1}46%,100%{opacity:0}}.engines-fragmentation-st{animation-name:engines-fragmentation-st;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-fragmentation-st{0%,8%{opacity:1}10%,46%{opacity:0}49%,100%{opacity:1}}.engines-fragmentation-q1{animation-name:engines-fragmentation-q1;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-fragmentation-q1{0%,8%{opacity:1;transform:translateX(0)}10%,50%{opacity:0;transform:translateX(-448px)}53%{opacity:1;transform:translateX(-448px)}72%,100%{opacity:1;transform:translateX(0)}}.engines-fragmentation-f1{animation-name:engines-fragmentation-f1;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-fragmentation-f1{0%,8%{opacity:1}10%,72%{opacity:0}74%,100%{opacity:1}}.engines-fragmentation-q2{animation-name:engines-fragmentation-q2;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-fragmentation-q2{0%,8%{opacity:1;transform:translateY(0)}10%,50%{opacity:0;transform:translateY(-38px)}53%,58%{opacity:1;transform:translateY(-38px)}66%,100%{opacity:1;transform:translateY(0)}}.engines-fragmentation-f2{animation-name:engines-fragmentation-f2;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-fragmentation-f2{0%,8%{opacity:1}10%,66%{opacity:0}68%,100%{opacity:1}}</style><text class=\"engines-fragmentation-h\" x=\"64\" y=\"34\">One heap, mixed lifetimes</text><rect class=\"engines-fragmentation-lv\" x=\"388\" y=\"23\" width=\"14\" height=\"14\" rx=\"3\"/><text class=\"engines-fragmentation-s\" x=\"408\" y=\"34\">long-lived 7 MB</text><rect class=\"engines-fragmentation-lt\" style=\"animation:none;opacity:1\" x=\"516\" y=\"23\" width=\"14\" height=\"14\" rx=\"3\"/><text class=\"engines-fragmentation-s\" x=\"536\" y=\"34\">level 25 MB</text><rect class=\"engines-fragmentation-tk\" x=\"64\" y=\"84\" width=\"512\" height=\"36\" rx=\"6\"/><rect class=\"engines-fragmentation-hole\" x=\"79\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-hole\" x=\"143\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-hole\" x=\"207\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-hole\" x=\"271\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-hole\" x=\"335\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-hole\" x=\"399\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-hole\" x=\"463\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-hole\" x=\"527\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"65\" y=\"87\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"129\" y=\"87\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"193\" y=\"87\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"257\" y=\"87\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"321\" y=\"87\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"385\" y=\"87\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"449\" y=\"87\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"513\" y=\"87\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lt\" x=\"79\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"143\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"207\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"271\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"335\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"399\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"463\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"527\" y=\"87\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-tk engines-fragmentation-cv\" x=\"65\" y=\"85\" width=\"510\" height=\"34\" transform=\"scale(0,1)\"/><rect class=\"engines-fragmentation-ol\" x=\"64\" y=\"84\" width=\"512\" height=\"36\" rx=\"6\"/><g class=\"engines-fragmentation-q1\"><rect class=\"engines-fragmentation-bad\" x=\"519\" y=\"48\" width=\"64\" height=\"26\" rx=\"6\"/><text class=\"engines-fragmentation-t engines-fragmentation-c\" x=\"551\" y=\"66\">32 MB</text></g><text class=\"engines-fragmentation-s engines-fragmentation-st\" x=\"64\" y=\"142\">200 MB free in 8 holes of 25 MB</text><text class=\"engines-fragmentation-rb engines-fragmentation-e engines-fragmentation-f1\" x=\"576\" y=\"142\">32 MB request fails</text><text class=\"engines-fragmentation-h\" x=\"64\" y=\"186\">Arenas by lifetime: level data freed together</text><rect class=\"engines-fragmentation-tk\" x=\"64\" y=\"236\" width=\"512\" height=\"36\" rx=\"6\"/><rect class=\"engines-fragmentation-hole\" x=\"177\" y=\"239\" width=\"398\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"65\" y=\"239\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"79\" y=\"239\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"93\" y=\"239\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"107\" y=\"239\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"121\" y=\"239\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"135\" y=\"239\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"149\" y=\"239\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lv\" x=\"163\" y=\"239\" width=\"12\" height=\"30\" rx=\"3\"/><rect class=\"engines-fragmentation-lt\" x=\"177\" y=\"239\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"227\" y=\"239\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"277\" y=\"239\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"327\" y=\"239\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"377\" y=\"239\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"427\" y=\"239\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"477\" y=\"239\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-lt\" x=\"527\" y=\"239\" width=\"48\" height=\"30\" rx=\"3\" opacity=\"0\"/><rect class=\"engines-fragmentation-tk engines-fragmentation-cv\" x=\"65\" y=\"237\" width=\"510\" height=\"34\" transform=\"scale(0,1)\"/><rect class=\"engines-fragmentation-ol\" x=\"64\" y=\"236\" width=\"512\" height=\"36\" rx=\"6\"/><g class=\"engines-fragmentation-q2\"><rect class=\"engines-fragmentation-ok\" x=\"180\" y=\"241\" width=\"64\" height=\"26\" rx=\"6\"/><text class=\"engines-fragmentation-t engines-fragmentation-c\" x=\"212\" y=\"259\">32 MB</text></g><text class=\"engines-fragmentation-s engines-fragmentation-st\" x=\"64\" y=\"294\">200 MB free in one block</text><text class=\"engines-fragmentation-rk engines-fragmentation-e engines-fragmentation-f2\" x=\"576\" y=\"294\">32 MB request fits</text></svg>"
        },
        {
          "type": "h",
          "text": "Misconceptions"
        },
        {
          "type": "list",
          "items": [
            "'Unloading the scene frees its memory.' Only if nothing still references the assets; a static field or a cached handle keeps them alive.",
            "'Texture size on disk is its memory size.' PNG or JPG sizes are irrelevant; GPU memory depends on dimensions and the GPU format.",
            "'Pooling is always a win.' A small pool of rarely used objects wastes memory; pooling pays off for frequent, short-lived, uniform objects."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents love `Instantiate`, `Destroy`, `Resources.Load` and string-path lookups because they are short and work in a demo. Tell the agent the memory budget, the target platform and that assets are loaded by async handle or GUID reference. Verify there are no per-frame allocations (LINQ, string concatenation, new lists in Update), that every load has a matching release, and that hard references do not drag large assets into small bundles. Ask the agent to produce a memory-report check, such as a profiler capture comparison before and after a level transition, rather than claiming it is fine."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Projectiles or effects are created and destroyed hundreds of times per second and GC or allocation spikes appear",
              "use": "Object Pool",
              "why": "Preallocate instances and reuse them, resetting state on spawn. Allocation becomes predictable; costs resident memory, and stale state from an incompletely reset object causes subtle bugs."
            },
            {
              "signal": "Thousands of trees or rocks each hold their own copy of the same mesh, material and settings",
              "use": "Flyweight (shared data, GPU instancing)",
              "why": "Share the intrinsic data and keep only per-instance state (transform, colour), which also lets the GPU draw instances in one call. Changing shared data changes every instance, so per-instance edits must stay separate."
            },
            {
              "signal": "Systems hold raw pointers or object references to entities that may be destroyed and their slots reused",
              "use": "Generational handles instead of pointers",
              "why": "Store an index plus generation number; a lookup detects a stale handle instead of touching freed or reused memory. Adds one indirection per access and a central table to manage."
            },
            {
              "signal": "A level transition drops frames while the profiler shows file reads and deserialization on the main thread",
              "use": "Async load with time-sliced integration",
              "why": "Read and decode on worker threads, then integrate on the main thread a few objects per frame within a ms budget. Removes hitches; content appears over several frames, so plan loading screens or placeholders."
            },
            {
              "signal": "An open world does not fit in memory, but the player only needs what is near them",
              "use": "Distance-based streaming against a budget",
              "why": "Load cells, LODs and texture mips by distance and priority within a fixed memory budget, evicting what is far. Needs prediction for fast travel and fallbacks for data that arrives late."
            },
            {
              "signal": "A menu bundle is unexpectedly huge because one reference pulls in a cinematic and its textures",
              "use": "Soft references for rarely used assets",
              "why": "Store only the asset ID and load explicitly when needed, cutting the dependency chain. You must handle load latency and release, and missing references fail at runtime instead of build time."
            },
            {
              "signal": "Textures dominate memory and are stored as RGBA32 on a memory-tight mobile target",
              "use": "Platform block compression (ASTC/BCn)",
              "why": "GPU-compressed formats cut texture memory by roughly 4-8x and stay compressed in memory. Quality loss is visible on gradients and normal maps, so choose block sizes per texture type."
            },
            {
              "signal": "Memory grows across level loads because loaded assets are never released",
              "use": "Explicit load/release with reference counting",
              "why": "Pair every load with a release and unload when the count reaches zero. Leaks become traceable; an extra release unloads assets still in use, so tie handles to owner lifetime."
            },
            {
              "signal": "Each frame makes many short-lived temporary allocations for lists, strings and scratch data",
              "use": "Per-frame linear (arena) allocator",
              "why": "Bump-allocate from a block and reset it at frame end, so allocation is a pointer add with no fragmentation. Nothing may keep pointers into it past the frame."
            },
            {
              "signal": "The game crashes on allocation after hours of play although free memory looks sufficient",
              "use": "Lifetime-based allocators and buffer reuse",
              "why": "Fragmentation leaves no contiguous block large enough. Group allocations by lifetime (level, frame, permanent) and reuse large buffers instead of reallocating."
            }
          ]
        }
      ],
      "keyPoints": [
        "Cooking converts editor formats into platform-specific, load-ready data; deterministic, incremental builds depend on hashing inputs and settings.",
        "GUID references make identity independent of path, but they form a dependency graph that can silently bloat bundles.",
        "Texture compression format dominates memory: the same 2048x2048 texture can be 21 MB or about 2.5 MB depending on format.",
        "Load asynchronously and time-slice main-thread work; stream by distance and mip level against a fixed budget.",
        "Pools make allocation predictable, and lifetime-based allocators plus reuse of large buffers fight fragmentation."
      ],
      "quiz": [
        {
          "q": "A designer reorganizes folders using the OS file manager and the sidecar metadata files are left behind. Prefabs now show missing references. What is the underlying cause?",
          "options": [
            "Cooking changed the endianness of the cooked assets",
            "Texture compression invalidated the whole dependency graph",
            "GUIDs carrying identity were lost when assets moved without sidecars",
            "Async loading raced with the move on disk"
          ],
          "answer": 2,
          "explain": "References are serialized as GUIDs held in sidecar data; moving the file without it creates new identities. Cooking, compression and async loading are not involved at author time."
        },
        {
          "q": "A mobile game is at 900 MB with a 700 MB budget, and textures are 520 MB in RGBA32. Which single change is most likely to bring it under budget with the least content work?",
          "options": [
            "Switch to ASTC with an appropriate block size",
            "Convert PNG sources to JPG",
            "Pool the textures at runtime",
            "Load textures synchronously to avoid duplicates"
          ],
          "answer": 0,
          "explain": "GPU memory is set by the in-memory format; ASTC cuts the size several times over RGBA32. Source file format does not change runtime size, and pooling or synchronous loading do not reduce texture bytes."
        },
        {
          "q": "After 3 hours of play the game crashes on allocation although a memory capture shows 250 MB free and live data steady. Which diagnosis fits?",
          "options": [
            "A mip streaming budget that was set far too high",
            "A GUID collision between two different prefabs",
            "Garbage collection running far too frequently",
            "Fragmentation: free memory exists but in blocks too small"
          ],
          "answer": 3,
          "explain": "Enough total free memory but failed allocation with stable live data points to holes in the heap. GC frequency and GUID collisions produce different symptoms, and a streaming budget would degrade quality rather than crash."
        },
        {
          "q": "A bullet-hell game spawns 300 projectiles per second, each living about 2 seconds, and shows periodic frame spikes with garbage collection in the profiler. What is the best fix?",
          "options": [
            "Use `Instantiate` with a lower spawn rate",
            "Preallocate a pool of about 700 projectiles and reset them on reuse",
            "Load the bullet prefab synchronously each time",
            "Destroy bullets on the next frame instead of after 2 seconds"
          ],
          "answer": 1,
          "explain": "Peak concurrency is about 600, so a warmed pool with a margin removes allocation and GC entirely. Lowering the spawn rate changes gameplay, and the other options keep the allocations."
        },
        {
          "q": "A level transition drops 16 frames. The profiler shows a 40 MB bundle read and deserialization on the main thread. What change addresses the cause?",
          "options": [
            "Increase the target frame rate to 120 fps",
            "Switch all of the audio over to a lossy format",
            "Add a hard reference from the main menu to the level scene",
            "Load async with worker decode, time-sliced instantiation"
          ],
          "answer": 3,
          "explain": "The stall is blocking work on the main thread, so moving it to async loading with a per-frame budget removes the hitch. A hard reference makes loading even more coupled, and the other changes are unrelated."
        },
        {
          "q": "Homing missiles store references to enemies by array slot. Enemies die and new ones reuse the freed slot, so a missile sometimes retargets a brand-new enemy it was never aimed at. Which approach fits best?",
          "options": [
            "An object pool that recycles the enemy instances",
            "Reference counting with explicit load and release calls",
            "Distance-based streaming of enemy data against a budget",
            "Generational handles that fail when the slot is reused"
          ],
          "answer": 3,
          "explain": "A handle stores slot plus generation, so a stale handle is detected when the slot is recycled. An object pool is what recycles the slots here and would not fix stale references, and the other two manage asset lifetime."
        }
      ]
    },
    {
      "id": "engines-game-ai-navigation",
      "title": "Game AI and navigation",
      "minutes": 13,
      "summary": "How enemies decide (state machines, behaviour trees, utility AI) and move (A*, navigation meshes, steering) within a frame budget.",
      "lesson": [
        {
          "type": "p",
          "text": "Thirty enemies must decide what to do, find a route through a level, and move without bumping into each other, all within perhaps 1-2 ms of CPU per frame. Game AI is not machine learning for most shipped titles; it is a collection of cheap, authorable, debuggable techniques whose goal is believable behaviour that designers can tune. Three layers recur: **decision making** (what do I want), **pathfinding** (how do I get there) and **steering** (how do I move this frame)."
        },
        {
          "type": "h",
          "text": "Finite state machines"
        },
        {
          "type": "p",
          "text": "A **finite state machine (FSM)** has a set of states (Patrol, Chase, Attack, Flee), one active at a time, and transitions triggered by conditions (player seen, health below 20%). It is simple, fast and easy to visualize, and it is the right tool for small behaviours. The problem is scale: with N states, transitions grow toward N squared, and adding 'investigate a noise' means touching every state that should be interruptible. Hierarchical FSMs (a Combat super-state containing Attack and Take Cover) reduce this but the structure remains rigid."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "enum State { Patrol, Chase, Attack }\nState state = State.Patrol;\n\nvoid Tick(float dt)\n{\n    switch (state)\n    {\n        case State.Patrol:\n            Patrol(dt);\n            if (CanSee(player)) state = State.Chase;\n            break;\n        case State.Chase:\n            MoveToward(player.position, dt);\n            if (Distance(player) < attackRange) state = State.Attack;\n            else if (!CanSee(player) && lostTimer > 3f) state = State.Patrol;\n            break;\n        case State.Attack:\n            Attack(dt);\n            if (Distance(player) > attackRange * 1.2f) state = State.Chase; // hysteresis\n            break;\n    }\n}"
        },
        {
          "type": "p",
          "text": "Note the `1.2f` hysteresis. Without it, an agent standing exactly on the boundary flips between Chase and Attack every frame. Hysteresis and minimum state durations are the standard cure for flicker."
        },
        {
          "type": "h",
          "text": "Behaviour trees"
        },
        {
          "type": "p",
          "text": "A **behaviour tree (BT)** is a tree of nodes ticked from the root each update (or event-driven). Each node returns Success, Failure or Running. Composite nodes control flow: a **Selector** tries children in order until one succeeds (fallback), a **Sequence** runs children in order until one fails (all conditions and actions must pass). Decorators modify a child (invert, repeat, cooldown, condition gate), and leaves are conditions or actions. Compared to FSMs, BTs make priorities explicit (left-to-right order), are modular (subtrees are reusable), and avoid transition spaghetti. The costs: reactive behaviour requires re-evaluating conditions from the top, which wastes cycles unless you use event-driven invalidation, and the 'Running' state needs careful handling so that a higher-priority branch can abort a lower one cleanly."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Selector\n  Sequence [Flee]     : IsHealthLow -> HasCoverNearby -> MoveToCover\n  Sequence [Attack]   : CanSeeTarget -> InRange -> Fire\n  Sequence [Chase]    : HasTargetLastKnown -> MoveTo(lastKnown)\n  Patrol"
        },
        {
          "type": "figure",
          "id": "engines-bt-tick",
          "caption": "One tick, left to right: Flee fails at its first condition, Attack succeeds twice and returns Running at Fire, so lower-priority branches never run.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 348\" role=\"img\" aria-label=\"A behaviour tree tick: the Selector tries the Flee sequence, whose IsHealthLow check fails; it then tries Attack, where CanSeeTarget and InRange succeed and Fire returns Running, so the selector returns Running and Chase and Patrol are never ticked.\"><style>.engines-bt-tick-t{font-size:14px;fill:var(--fig-ink)}.engines-bt-tick-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-bt-tick-s{font-size:13px;fill:var(--fig-muted)}.engines-bt-tick-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-bt-tick-c{text-anchor:middle}.engines-bt-tick-e{text-anchor:end}.engines-bt-tick-ln{stroke:var(--fig-line);stroke-width:1.5}.engines-bt-tick-dim{opacity:.45}.engines-bt-tick-ok{fill:var(--fig-ok);fill-opacity:.16;stroke:var(--fig-ok);stroke-width:2.5}.engines-bt-tick-bad{fill:var(--fig-bad);fill-opacity:.16;stroke:var(--fig-bad);stroke-width:2.5}.engines-bt-tick-warn{fill:var(--fig-warn);fill-opacity:.16;stroke:var(--fig-warn);stroke-width:2.5}.engines-bt-tick-accent{fill:var(--fig-accent);fill-opacity:.16;stroke:var(--fig-accent);stroke-width:2.5}.engines-bt-tick-selw{animation-name:engines-bt-tick-selw;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-selw{0%,12%{opacity:0}14%,75%{opacity:1}76%,100%{opacity:0}}.engines-bt-tick-flw{animation-name:engines-bt-tick-flw;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-flw{0%,18%{opacity:0}20%,33%{opacity:1}34%,100%{opacity:0}}.engines-bt-tick-atw{animation-name:engines-bt-tick-atw;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-atw{0%,38%{opacity:0}40%,69%{opacity:1}70%,100%{opacity:0}}.engines-bt-tick-iha{animation-name:engines-bt-tick-iha;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-iha{0%,8%{opacity:1}10%,28%{opacity:0}30%,100%{opacity:1}}.engines-bt-tick-fla{animation-name:engines-bt-tick-fla;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-fla{0%,8%{opacity:1}10%,34%{opacity:0}36%,100%{opacity:1}}.engines-bt-tick-csa{animation-name:engines-bt-tick-csa;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-csa{0%,8%{opacity:1}10%,46%{opacity:0}48%,100%{opacity:1}}.engines-bt-tick-ira{animation-name:engines-bt-tick-ira;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-ira{0%,8%{opacity:1}10%,54%{opacity:0}56%,100%{opacity:1}}.engines-bt-tick-fia{animation-name:engines-bt-tick-fia;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-fia{0%,8%{opacity:1}10%,62%{opacity:0}64%,100%{opacity:1}}.engines-bt-tick-ata{animation-name:engines-bt-tick-ata;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-ata{0%,8%{opacity:1}10%,70%{opacity:0}72%,100%{opacity:1}}.engines-bt-tick-sela{animation-name:engines-bt-tick-sela;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-bt-tick-sela{0%,8%{opacity:1}10%,76%{opacity:0}78%,100%{opacity:1}}</style><line class=\"engines-bt-tick-ln\" x1=\"320\" y1=\"52\" x2=\"90\" y2=\"92\"/><line class=\"engines-bt-tick-ln\" x1=\"320\" y1=\"52\" x2=\"242\" y2=\"92\"/><line class=\"engines-bt-tick-ln\" x1=\"320\" y1=\"52\" x2=\"394\" y2=\"92\"/><line class=\"engines-bt-tick-ln\" x1=\"320\" y1=\"52\" x2=\"546\" y2=\"92\"/><line class=\"engines-bt-tick-ln\" x1=\"90\" y1=\"124\" x2=\"90\" y2=\"238\"/><line class=\"engines-bt-tick-ln\" x1=\"242\" y1=\"124\" x2=\"242\" y2=\"238\"/><line class=\"engines-bt-tick-ln\" x1=\"394\" y1=\"124\" x2=\"394\" y2=\"194\"/><rect class=\"engines-bt-tick-b\" x=\"250\" y=\"20\" width=\"140\" height=\"32\" rx=\"8\"/><rect class=\"engines-bt-tick-accent engines-bt-tick-selw\" x=\"250\" y=\"20\" width=\"140\" height=\"32\" rx=\"8\" opacity=\"0\"/><rect class=\"engines-bt-tick-warn engines-bt-tick-sela\" x=\"250\" y=\"20\" width=\"140\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-h engines-bt-tick-c\" x=\"320\" y=\"41\">Selector</text><g><rect class=\"engines-bt-tick-b\" x=\"18\" y=\"92\" width=\"144\" height=\"32\" rx=\"8\"/><rect class=\"engines-bt-tick-accent engines-bt-tick-flw\" x=\"18\" y=\"92\" width=\"144\" height=\"32\" rx=\"8\" opacity=\"0\"/><rect class=\"engines-bt-tick-bad engines-bt-tick-fla\" x=\"18\" y=\"92\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"90\" y=\"113\">Sequence: Flee</text></g><g><rect class=\"engines-bt-tick-b\" x=\"170\" y=\"92\" width=\"144\" height=\"32\" rx=\"8\"/><rect class=\"engines-bt-tick-accent engines-bt-tick-atw\" x=\"170\" y=\"92\" width=\"144\" height=\"32\" rx=\"8\" opacity=\"0\"/><rect class=\"engines-bt-tick-warn engines-bt-tick-ata\" x=\"170\" y=\"92\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"242\" y=\"113\">Sequence: Attack</text></g><g class=\"engines-bt-tick-dim\"><rect class=\"engines-bt-tick-b\" x=\"322\" y=\"92\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"394\" y=\"113\">Sequence: Chase</text></g><g class=\"engines-bt-tick-dim\"><rect class=\"engines-bt-tick-b\" x=\"474\" y=\"92\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"546\" y=\"113\">Patrol</text></g><g><rect class=\"engines-bt-tick-b\" x=\"18\" y=\"150\" width=\"144\" height=\"32\" rx=\"8\"/><rect class=\"engines-bt-tick-bad engines-bt-tick-iha\" x=\"18\" y=\"150\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"90\" y=\"171\">IsHealthLow</text></g><g class=\"engines-bt-tick-dim\"><rect class=\"engines-bt-tick-b\" x=\"18\" y=\"194\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"90\" y=\"215\">HasCoverNearby</text></g><g class=\"engines-bt-tick-dim\"><rect class=\"engines-bt-tick-b\" x=\"18\" y=\"238\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"90\" y=\"259\">MoveToCover</text></g><g><rect class=\"engines-bt-tick-b\" x=\"170\" y=\"150\" width=\"144\" height=\"32\" rx=\"8\"/><rect class=\"engines-bt-tick-ok engines-bt-tick-csa\" x=\"170\" y=\"150\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"242\" y=\"171\">CanSeeTarget</text></g><g><rect class=\"engines-bt-tick-b\" x=\"170\" y=\"194\" width=\"144\" height=\"32\" rx=\"8\"/><rect class=\"engines-bt-tick-ok engines-bt-tick-ira\" x=\"170\" y=\"194\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"242\" y=\"215\">InRange</text></g><g><rect class=\"engines-bt-tick-b\" x=\"170\" y=\"238\" width=\"144\" height=\"32\" rx=\"8\"/><rect class=\"engines-bt-tick-warn engines-bt-tick-fia\" x=\"170\" y=\"238\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"242\" y=\"259\">Fire</text></g><g class=\"engines-bt-tick-dim\"><rect class=\"engines-bt-tick-b\" x=\"322\" y=\"150\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"394\" y=\"171\">HasTargetLastKnown</text></g><g class=\"engines-bt-tick-dim\"><rect class=\"engines-bt-tick-b\" x=\"322\" y=\"194\" width=\"144\" height=\"32\" rx=\"8\"/><text class=\"engines-bt-tick-t engines-bt-tick-c\" x=\"394\" y=\"215\">MoveTo(lastKnown)</text></g><rect class=\"engines-bt-tick-accent\" x=\"40\" y=\"290\" width=\"18\" height=\"18\" rx=\"5\"/><text class=\"engines-bt-tick-t\" x=\"66\" y=\"304\">ticking</text><rect class=\"engines-bt-tick-ok\" x=\"190\" y=\"290\" width=\"18\" height=\"18\" rx=\"5\"/><text class=\"engines-bt-tick-t\" x=\"216\" y=\"304\">Success</text><rect class=\"engines-bt-tick-bad\" x=\"340\" y=\"290\" width=\"18\" height=\"18\" rx=\"5\"/><text class=\"engines-bt-tick-t\" x=\"366\" y=\"304\">Failure</text><rect class=\"engines-bt-tick-warn\" x=\"490\" y=\"290\" width=\"18\" height=\"18\" rx=\"5\"/><text class=\"engines-bt-tick-t\" x=\"516\" y=\"304\">Running</text><text class=\"engines-bt-tick-s\" x=\"40\" y=\"334\">Attack returns Running, so Chase and Patrol are not ticked this frame.</text></svg>"
        },
        {
          "type": "h",
          "text": "Utility AI"
        },
        {
          "type": "p",
          "text": "When many options are plausible and the best depends on a mix of factors, **utility AI** scores each candidate action with a function of the world and picks the highest. A score is typically the product (or weighted combination) of **considerations**, each mapping an input (distance, health, ammo) through a response curve to 0-1. 'Heal' might score high when health is low and no enemy is close; 'Attack' when ammo is plentiful and the target is near. Utility gives smooth, context-sensitive behaviour and avoids hard thresholds, which is why life-simulation and strategy games use it heavily. Its weakness is tuning: curves interact, and a designer cannot easily answer 'why did it do that' without a debugger that shows the scores. Always build a visualization of the considered scores."
        },
        {
          "type": "list",
          "items": [
            "FSM: few states, clear modes, tiny cost, brittle as it grows.",
            "Behaviour tree: prioritized, modular, designer-friendly, good default for action game enemies.",
            "Utility AI: many competing options, graded responses, needs tooling and tuning.",
            "Combine them: a BT whose selector uses utility scores, or an FSM per high-level mode with BTs inside."
          ]
        },
        {
          "type": "h",
          "text": "A* pathfinding"
        },
        {
          "type": "p",
          "text": "**A-star (A*)** finds a least-cost path on a graph. It keeps an open set ordered by `f(n) = g(n) + h(n)`, where `g` is the cost from the start and `h` is a heuristic estimate of the cost to the goal. If `h` never overestimates (is **admissible**), A* returns an optimal path, and the closer `h` is to the true cost, the fewer nodes are expanded. On a 4-connected grid, use Manhattan distance; on an 8-connected grid, octile distance; in continuous space, Euclidean. With `h = 0` it degrades to Dijkstra; an overweighted `h` is faster but gives suboptimal paths, an acceptable trade in games. Real costs: a naive search over a 256 x 256 grid might expand thousands of nodes; an open-set binary heap makes each push and pop O(log n), and a per-node generation stamp avoids clearing arrays between searches."
        },
        {
          "type": "figure",
          "id": "engines-astar",
          "caption": "The Manhattan heuristic pulls expansion toward the goal; the open set spreads around the wall only where it has to before the path is found.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 314\" role=\"img\" aria-label=\"A* on a 4-connected grid with a wall between start and goal. The open set grows as nodes are discovered and the closed set fills as they are expanded, biased toward the goal by the Manhattan heuristic, until the path around the wall is found.\"><style>.engines-astar-t{font-size:14px;fill:var(--fig-ink)}.engines-astar-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-astar-s{font-size:13px;fill:var(--fig-muted)}.engines-astar-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-astar-c{text-anchor:middle}.engines-astar-e{text-anchor:end}.engines-astar-gr{stroke:var(--fig-line);stroke-width:1}.engines-astar-o{fill:var(--fig-accent);stroke:var(--fig-accent);stroke-width:4;stroke-linejoin:round;opacity:.22}.engines-astar-x{fill:var(--fig-accent);stroke:var(--fig-accent);stroke-width:4;stroke-linejoin:round;opacity:.6}.engines-astar-w{fill:var(--fig-muted);stroke:var(--fig-muted);stroke-width:4;stroke-linejoin:round}.engines-astar-pa{fill:none;stroke:var(--fig-ok);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:468;animation-name:engines-astar-pa;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-pa{0%,8%{stroke-dashoffset:0}10%,72%{stroke-dashoffset:468}84%,100%{stroke-dashoffset:0}}.engines-astar-sg{fill:var(--fig-bg);stroke:var(--fig-ink);stroke-width:2}.engines-astar-L{font-size:14px;font-weight:700;fill:var(--fig-ink);text-anchor:middle}.engines-astar-s0{animation-name:engines-astar-s0;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s0{0%,8%{visibility:visible}10%,12%{visibility:hidden}14%,100%{visibility:visible}}.engines-astar-s1{animation-name:engines-astar-s1;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s1{0%,8%{visibility:visible}10%,15.2%{visibility:hidden}17.2%,100%{visibility:visible}}.engines-astar-s2{animation-name:engines-astar-s2;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s2{0%,8%{visibility:visible}10%,18.4%{visibility:hidden}20.4%,100%{visibility:visible}}.engines-astar-s3{animation-name:engines-astar-s3;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s3{0%,8%{visibility:visible}10%,21.7%{visibility:hidden}23.7%,100%{visibility:visible}}.engines-astar-s4{animation-name:engines-astar-s4;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s4{0%,8%{visibility:visible}10%,24.9%{visibility:hidden}26.9%,100%{visibility:visible}}.engines-astar-s5{animation-name:engines-astar-s5;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s5{0%,8%{visibility:visible}10%,28.1%{visibility:hidden}30.1%,100%{visibility:visible}}.engines-astar-s6{animation-name:engines-astar-s6;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s6{0%,8%{visibility:visible}10%,31.3%{visibility:hidden}33.3%,100%{visibility:visible}}.engines-astar-s7{animation-name:engines-astar-s7;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s7{0%,8%{visibility:visible}10%,34.6%{visibility:hidden}36.6%,100%{visibility:visible}}.engines-astar-s8{animation-name:engines-astar-s8;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s8{0%,8%{visibility:visible}10%,37.8%{visibility:hidden}39.8%,100%{visibility:visible}}.engines-astar-s9{animation-name:engines-astar-s9;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s9{0%,8%{visibility:visible}10%,41%{visibility:hidden}43%,100%{visibility:visible}}.engines-astar-s10{animation-name:engines-astar-s10;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s10{0%,8%{visibility:visible}10%,44.2%{visibility:hidden}46.2%,100%{visibility:visible}}.engines-astar-s11{animation-name:engines-astar-s11;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s11{0%,8%{visibility:visible}10%,47.4%{visibility:hidden}49.4%,100%{visibility:visible}}.engines-astar-s12{animation-name:engines-astar-s12;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s12{0%,8%{visibility:visible}10%,50.7%{visibility:hidden}52.7%,100%{visibility:visible}}.engines-astar-s13{animation-name:engines-astar-s13;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s13{0%,8%{visibility:visible}10%,53.9%{visibility:hidden}55.9%,100%{visibility:visible}}.engines-astar-s14{animation-name:engines-astar-s14;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s14{0%,8%{visibility:visible}10%,57.1%{visibility:hidden}59.1%,100%{visibility:visible}}.engines-astar-s15{animation-name:engines-astar-s15;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s15{0%,8%{visibility:visible}10%,60.3%{visibility:hidden}62.3%,100%{visibility:visible}}.engines-astar-s16{animation-name:engines-astar-s16;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s16{0%,8%{visibility:visible}10%,63.6%{visibility:hidden}65.6%,100%{visibility:visible}}.engines-astar-s17{animation-name:engines-astar-s17;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s17{0%,8%{visibility:visible}10%,66.8%{visibility:hidden}68.8%,100%{visibility:visible}}.engines-astar-s18{animation-name:engines-astar-s18;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-astar-s18{0%,8%{visibility:visible}10%,70%{visibility:hidden}72%,100%{visibility:visible}}</style><rect class=\"engines-astar-b\" x=\"24\" y=\"40\" width=\"432\" height=\"252\" rx=\"6\"/><path class=\"engines-astar-gr\" d=\"M60 40v252M96 40v252M132 40v252M168 40v252M204 40v252M240 40v252M276 40v252M312 40v252M348 40v252M384 40v252M420 40v252M24 76h432M24 112h432M24 148h432M24 184h432M24 220h432M24 256h432\"/><path class=\"engines-astar-o engines-astar-s0\" d=\"M101 153h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s1\" d=\"M137 153h26v26h-26zM101 189h26v26h-26zM65 153h26v26h-26zM101 117h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s2\" d=\"M173 153h26v26h-26zM137 189h26v26h-26zM137 117h26v26h-26zM209 153h26v26h-26zM173 189h26v26h-26zM173 117h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s3\" d=\"M209 189h26v26h-26zM209 117h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s4\" d=\"M209 81h26v26h-26zM173 81h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s5\" d=\"M137 81h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s6\" d=\"M65 117h26v26h-26zM101 81h26v26h-26zM209 45h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s7\" d=\"M209 225h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s8\" d=\"M173 45h26v26h-26zM173 225h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s9\" d=\"M137 45h26v26h-26zM137 225h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s10\" d=\"M29 117h26v26h-26zM65 81h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s11\" d=\"M101 45h26v26h-26zM101 225h26v26h-26zM65 189h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s12\" d=\"M29 153h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s13\" d=\"M245 225h26v26h-26zM209 261h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s14\" d=\"M281 225h26v26h-26zM245 261h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s15\" d=\"M317 225h26v26h-26zM281 261h26v26h-26zM281 189h26v26h-26zM353 225h26v26h-26zM317 261h26v26h-26zM317 189h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s16\" d=\"M389 225h26v26h-26zM353 261h26v26h-26zM353 189h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s17\" d=\"M425 225h26v26h-26zM389 261h26v26h-26zM389 189h26v26h-26zM425 189h26v26h-26zM389 153h26v26h-26z\"/><path class=\"engines-astar-o engines-astar-s18\" d=\"M425 153h26v26h-26zM353 153h26v26h-26zM389 117h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s1\" d=\"M101 153h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s2\" d=\"M137 153h26v26h-26zM173 153h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s3\" d=\"M209 153h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s4\" d=\"M209 117h26v26h-26zM173 117h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s5\" d=\"M137 117h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s6\" d=\"M101 117h26v26h-26zM209 81h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s7\" d=\"M209 189h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s8\" d=\"M173 81h26v26h-26zM173 189h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s9\" d=\"M137 81h26v26h-26zM137 189h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s10\" d=\"M65 117h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s11\" d=\"M101 81h26v26h-26zM101 189h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s12\" d=\"M65 153h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s13\" d=\"M209 45h26v26h-26zM209 225h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s14\" d=\"M245 225h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s15\" d=\"M281 225h26v26h-26zM317 225h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s16\" d=\"M353 225h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s17\" d=\"M389 225h26v26h-26zM389 189h26v26h-26z\"/><path class=\"engines-astar-x engines-astar-s18\" d=\"M389 153h26v26h-26zM389 117h26v26h-26z\"/><path class=\"engines-astar-w\" d=\"M245 45h26v26h-26zM245 81h26v26h-26zM245 117h26v26h-26zM245 153h26v26h-26zM245 189h26v26h-26z\"/><polyline class=\"engines-astar-pa\" points=\"114,166 150,166 186,166 222,166 222,202 222,238 258,238 294,238 330,238 366,238 402,238 402,202 402,166 402,130\"/><circle class=\"engines-astar-sg\" cx=\"114\" cy=\"166\" r=\"12\"/><text class=\"engines-astar-L\" x=\"114\" y=\"171\">S</text><circle class=\"engines-astar-sg\" cx=\"402\" cy=\"130\" r=\"12\"/><text class=\"engines-astar-L\" x=\"402\" y=\"135\">G</text><rect class=\"engines-astar-o\" x=\"482\" y=\"52\" width=\"16\" height=\"16\" rx=\"2\"/><text class=\"engines-astar-t\" x=\"508\" y=\"65\">open set</text><rect class=\"engines-astar-x\" x=\"482\" y=\"84\" width=\"16\" height=\"16\" rx=\"2\"/><text class=\"engines-astar-t\" x=\"508\" y=\"97\">closed set</text><rect class=\"engines-astar-w\" x=\"482\" y=\"116\" width=\"16\" height=\"16\" rx=\"2\"/><text class=\"engines-astar-t\" x=\"508\" y=\"129\">wall</text><line x1=\"482\" y1=\"156\" x2=\"498\" y2=\"156\" style=\"stroke:var(--fig-ok);stroke-width:4;stroke-linecap:round\"/><text class=\"engines-astar-t\" x=\"508\" y=\"161\">path</text><text class=\"engines-astar-t\" x=\"482\" y=\"220\">f = g + h</text><text class=\"engines-astar-s\" x=\"482\" y=\"242\">h = Manhattan</text><text class=\"engines-astar-s\" x=\"482\" y=\"262\">4-connected grid</text><text class=\"engines-astar-s\" x=\"482\" y=\"282\">28 nodes expanded</text></svg>"
        },
        {
          "type": "interactive",
          "id": "engines-astar-stepper",
          "caption": "Step A* by hand: each step expands the open node with the lowest f = g + h, and the Manhattan heuristic keeps the search leaning toward G until the wall forces it around.",
          "height": 400,
          "html": "<style>\n.w { display: flex; flex-direction: column; height: 100%; gap: 8px; }\nsvg { flex: 1; min-height: 0; width: 100%; display: block; }\n.cell { fill: var(--fig-bg); stroke: var(--fig-line); stroke-width: 1; }\n.wall { fill: var(--fig-ink); fill-opacity: .7; }\n.open { fill: var(--fig-accent); fill-opacity: .28; }\n.closed { fill: var(--fig-muted); fill-opacity: .3; }\n.path { fill: var(--fig-ok); fill-opacity: .55; }\n.cur { fill: none; stroke: var(--fig-warn); stroke-width: 3.5; }\n.nx { fill: none; stroke: var(--fig-accent); stroke-width: 2.5; stroke-dasharray: 4 3; }\n.L { fill: var(--fig-ink); font-size: 18px; font-weight: 700; text-anchor: middle; }\n.f { fill: var(--fig-ink); font-size: 11px; text-anchor: middle; font-variant-numeric: tabular-nums; }\n.t { fill: var(--fig-ink); font-size: 13px; }\n.m { fill: var(--fig-muted); font-size: 12px; }\n.c { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }\noutput { color: var(--fig-muted); font-variant-numeric: tabular-nums; }\n</style>\n<div class=\"w\">\n<svg viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A* on a 12 by 7 four-connected grid with a wall between start S and goal G. Each step expands the open node with the lowest f = g + h, moves it to the closed set and adds its neighbours to the open set, until the goal is expanded and the path is traced back.\">\n  <g id=\"grid\"></g>\n  <rect class=\"open\" x=\"500\" y=\"20\" width=\"14\" height=\"14\" rx=\"2\"/><text class=\"t\" x=\"522\" y=\"32\">open set</text>\n  <rect class=\"closed\" x=\"500\" y=\"42\" width=\"14\" height=\"14\" rx=\"2\"/><text class=\"t\" x=\"522\" y=\"54\">closed set</text>\n  <rect class=\"cur\" x=\"501\" y=\"65\" width=\"12\" height=\"12\" rx=\"2\"/><text class=\"t\" x=\"522\" y=\"76\">just expanded</text>\n  <rect class=\"nx\" x=\"501\" y=\"87\" width=\"12\" height=\"12\" rx=\"2\"/><text class=\"t\" x=\"522\" y=\"98\">next (lowest f)</text>\n  <rect class=\"path\" x=\"500\" y=\"108\" width=\"14\" height=\"14\" rx=\"2\"/><text class=\"t\" x=\"522\" y=\"120\">path</text>\n  <text class=\"t\" x=\"500\" y=\"152\">f = g + h</text>\n  <text class=\"m\" x=\"500\" y=\"170\">g: steps from S</text>\n  <text class=\"m\" x=\"500\" y=\"186\">h: Manhattan to G</text>\n  <text class=\"m\" x=\"500\" y=\"202\">ties: lower h first</text>\n  <text id=\"s1\" class=\"t\" x=\"500\" y=\"232\"></text>\n  <text id=\"s2\" class=\"m\" x=\"500\" y=\"252\"></text>\n  <text id=\"s3\" class=\"m\" x=\"500\" y=\"270\"></text>\n  <text id=\"s4\" class=\"m\" x=\"500\" y=\"288\"></text>\n</svg>\n<div class=\"c\">\n  <button id=\"step\" type=\"button\">Step</button>\n  <button id=\"run\" type=\"button\">Run</button>\n  <button id=\"reset\" type=\"button\">Reset</button>\n  <output id=\"say\" aria-live=\"polite\"></output>\n</div>\n</div>\n<script>\n(function () {\n  var $ = function (id) { return document.getElementById(id); };\n  var W = 12, H = 7, C = 40, S = [2, 3], G = [10, 2];\n  var walls = {}; [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [7, 1], [8, 1]].forEach(function (p) { walls[p] = 1; });\n  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n  var st, timer = null;\n  var h = function (p) { return Math.abs(p[0] - G[0]) + Math.abs(p[1] - G[1]); };\n  function reset() {\n    stop();\n    st = { open: [{ p: S, g: 0, h: h(S), from: null, seq: 0 }], closed: {}, nodes: {}, cur: null, done: false, path: [], expanded: 0, seq: 1 };\n    st.nodes[S] = st.open[0];\n    draw('Ready: S is in the open set with g 0, h ' + h(S) + ', f ' + h(S) + '.');\n  }\n  var better = function (a, b) { return a.g + a.h - (b.g + b.h) || a.h - b.h || a.seq - b.seq; };\n  function best() { return st.open.slice().sort(better)[0]; }\n  function step() {\n    if (st.done) return;\n    if (!st.open.length) { st.done = true; draw('Open set empty: no path.'); return; }\n    var n = best();\n    st.open.splice(st.open.indexOf(n), 1);\n    st.closed[n.p] = n; st.cur = n; st.expanded++;\n    if (n.p[0] === G[0] && n.p[1] === G[1]) {\n      st.done = true;\n      for (var q = n; q; q = q.from) st.path.push(q.p);\n      stop();\n      draw('Goal expanded after ' + st.expanded + ' steps. Path cost ' + n.g + '.');\n      return;\n    }\n    var added = 0;\n    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {\n      var p = [n.p[0] + d[0], n.p[1] + d[1]];\n      if (p[0] < 0 || p[1] < 0 || p[0] >= W || p[1] >= H || walls[p] || st.closed[p]) return;\n      var g = n.g + 1, o = st.nodes[p];\n      if (!o) { o = st.nodes[p] = { p: p, g: g, h: h(p), from: n, seq: st.seq++ }; st.open.push(o); added++; }\n      else if (g < o.g) { o.g = g; o.from = n; }\n    });\n    draw('Expanded (' + n.p + '): g ' + n.g + ' + h ' + n.h + ' = f ' + (n.g + n.h) + '. Added ' + added + ' to open.');\n  }\n  function stop() { if (timer) clearInterval(timer); timer = null; $('run').textContent = 'Run'; }\n  function run() {\n    if (timer) return stop();\n    if (reduce) { while (!st.done) step(); return; }\n    $('run').textContent = 'Pause';\n    timer = setInterval(function () { step(); if (st.done) stop(); }, 220);\n  }\n  function draw(msg) {\n    var nx = st.done ? null : best(), onPath = {}, out = '';\n    st.path.forEach(function (p) { onPath[p] = 1; });\n    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {\n      var k = [x, y], X = 10 + x * C, Y = 10 + y * C, n = st.nodes[k];\n      var cls = walls[k] ? 'wall' : onPath[k] ? 'path' : st.closed[k] ? 'closed' : n ? 'open' : '';\n      out += '<rect class=\"cell\" x=\"' + X + '\" y=\"' + Y + '\" width=\"' + C + '\" height=\"' + C + '\"/>';\n      if (cls) out += '<rect class=\"' + cls + '\" x=\"' + X + '\" y=\"' + Y + '\" width=\"' + C + '\" height=\"' + C + '\"/>';\n      var lab = x === S[0] && y === S[1] ? 'S' : x === G[0] && y === G[1] ? 'G' : '';\n      if (lab) out += '<text class=\"L\" x=\"' + (X + 20) + '\" y=\"' + (Y + (n ? 21 : 27)) + '\">' + lab + '</text>';\n      if (n && !walls[k]) out += '<text class=\"f\" x=\"' + (X + 20) + '\" y=\"' + (Y + (lab ? 35 : 25)) + '\">' + (n.g + n.h) + '</text>';\n    }\n    if (st.cur) out += '<rect class=\"cur\" x=\"' + (12 + st.cur.p[0] * C) + '\" y=\"' + (12 + st.cur.p[1] * C) + '\" width=\"' + (C - 4) + '\" height=\"' + (C - 4) + '\"/>';\n    if (nx) out += '<rect class=\"nx\" x=\"' + (14 + nx.p[0] * C) + '\" y=\"' + (14 + nx.p[1] * C) + '\" width=\"' + (C - 8) + '\" height=\"' + (C - 8) + '\"/>';\n    $('grid').innerHTML = out;\n    $('s1').textContent = 'Expanded: ' + st.expanded;\n    $('s2').textContent = 'Open: ' + st.open.length + '   Closed: ' + Object.keys(st.closed).length;\n    $('s3').textContent = st.cur ? 'Last: g ' + st.cur.g + ' + h ' + st.cur.h + ' = f ' + (st.cur.g + st.cur.h) : 'Last: none';\n    $('s4').textContent = nx ? 'Next: f ' + (nx.g + nx.h) + ' (h ' + nx.h + ')' : st.path.length ? 'Path length: ' + (st.path.length - 1) : '';\n    $('say').textContent = msg;\n    $('step').disabled = $('run').disabled = st.done;\n  }\n  $('step').addEventListener('click', function () { stop(); step(); });\n  $('run').addEventListener('click', run);\n  $('reset').addEventListener('click', reset);\n  reset();\n})();\n</script>"
        },
        {
          "type": "p",
          "text": "Games rarely run A* on a raw grid for large worlds. Techniques to stay in budget: hierarchical pathfinding (plan across regions first, then refine), time-sliced searches spread over frames, path caching and sharing between agents going to the same target, and requesting a path only when the target moved far enough to matter."
        },
        {
          "type": "h",
          "text": "Navigation meshes"
        },
        {
          "type": "p",
          "text": "A **navigation mesh (navmesh)** represents the walkable surface as convex polygons (often triangles merged into convex polys) with adjacency across shared edges. It is generated from level geometry by voxelizing the world at the agent's radius, height, step height and maximum slope, finding walkable spans, and building contours and polygons (the approach popularized by Recast). The graph for A* is then polygon centres or edge midpoints, which is far smaller than a grid: a large level might have 5,000 polys instead of 500,000 cells. The path through polygons is converted to a smooth route with the **funnel algorithm**, which finds the shortest line through the sequence of shared edges. Navmeshes are baked per agent type (a large monster needs a different mesh from a human), and dynamic obstacles are handled either by runtime carving or by local avoidance rather than a rebake."
        },
        {
          "type": "figure",
          "id": "engines-navmesh",
          "caption": "A* over seven polygons gives a zigzag through their centres; the funnel algorithm turns the same corridor into a straight path that bends only at corners.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"A navmesh of seven convex polygons around two obstacles. The dashed route through polygon centres zigzags; the funnel algorithm pulls it into a straight path that bends only at the two inner corners, and an agent follows it.\"><style>.engines-navmesh-t{font-size:14px;fill:var(--fig-ink)}.engines-navmesh-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-navmesh-s{font-size:13px;fill:var(--fig-muted)}.engines-navmesh-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-navmesh-c{text-anchor:middle}.engines-navmesh-e{text-anchor:end}.engines-navmesh-pg{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5;stroke-linejoin:round}.engines-navmesh-pt{stroke:var(--fig-accent2);stroke-width:3;stroke-linecap:round}.engines-navmesh-cr{fill:none;stroke:var(--fig-muted);stroke-width:2;stroke-dasharray:5 5}.engines-navmesh-fn{fill:none;stroke:var(--fig-accent);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.engines-navmesh-ag{fill:var(--fig-accent)}.engines-navmesh-cn{fill:var(--fig-ink)}.engines-navmesh-mv{animation:engines-navmesh-mv 6s linear infinite}@keyframes engines-navmesh-mv{0%,10%{transform:translate(62px,250px);opacity:1}33.6%{transform:translate(250px,210px);opacity:1}50.1%{transform:translate(340px,110px);opacity:1}80%{transform:translate(580px,70px);opacity:1}88%{transform:translate(580px,70px);opacity:1}94%{transform:translate(580px,70px);opacity:0}94.1%{transform:translate(62px,250px);opacity:0}100%{transform:translate(62px,250px);opacity:1}}</style><polygon class=\"engines-navmesh-pg\" points=\"30,210 150,210 130,290 30,290\"/><polygon class=\"engines-navmesh-pg\" points=\"150,210 250,210 250,290 130,290\"/><polygon class=\"engines-navmesh-pg\" points=\"250,210 340,210 340,290 250,290\"/><polygon class=\"engines-navmesh-pg\" points=\"250,110 340,110 340,210 250,210\"/><polygon class=\"engines-navmesh-pg\" points=\"250,30 340,30 340,110 250,110\"/><polygon class=\"engines-navmesh-pg\" points=\"340,30 470,30 450,110 340,110\"/><polygon class=\"engines-navmesh-pg\" points=\"470,30 610,30 610,110 450,110\"/><line class=\"engines-navmesh-pt\" x1=\"150\" y1=\"210\" x2=\"130\" y2=\"290\"/><line class=\"engines-navmesh-pt\" x1=\"250\" y1=\"210\" x2=\"250\" y2=\"290\"/><line class=\"engines-navmesh-pt\" x1=\"250\" y1=\"210\" x2=\"340\" y2=\"210\"/><line class=\"engines-navmesh-pt\" x1=\"250\" y1=\"110\" x2=\"340\" y2=\"110\"/><line class=\"engines-navmesh-pt\" x1=\"340\" y1=\"30\" x2=\"340\" y2=\"110\"/><line class=\"engines-navmesh-pt\" x1=\"470\" y1=\"30\" x2=\"450\" y2=\"110\"/><polyline class=\"engines-navmesh-cr\" points=\"62,250 195,250 295,250 295,160 295,70 400,70 580,70\"/><polyline class=\"engines-navmesh-fn\" points=\"62,250 250,210 340,110 580,70\"/><circle class=\"engines-navmesh-cn\" cx=\"250\" cy=\"210\" r=\"4\"/><circle class=\"engines-navmesh-cn\" cx=\"340\" cy=\"110\" r=\"4\"/><circle class=\"engines-navmesh-cn\" cx=\"62\" cy=\"250\" r=\"6\"/><text class=\"engines-navmesh-s\" x=\"52\" y=\"278\">start</text><circle class=\"engines-navmesh-cn\" cx=\"580\" cy=\"70\" r=\"6\"/><text class=\"engines-navmesh-s engines-navmesh-e\" x=\"588\" y=\"100\">goal</text><g class=\"engines-navmesh-mv\" transform=\"translate(295,160)\"><circle class=\"engines-navmesh-ag\" r=\"8\"/></g><line class=\"engines-navmesh-cr\" x1=\"30\" y1=\"54\" x2=\"56\" y2=\"54\"/><text class=\"engines-navmesh-t\" x=\"66\" y=\"59\">polygon-centre route</text><line class=\"engines-navmesh-fn\" x1=\"30\" y1=\"84\" x2=\"56\" y2=\"84\"/><text class=\"engines-navmesh-t\" x=\"66\" y=\"89\">funnel path</text><line class=\"engines-navmesh-pt\" x1=\"30\" y1=\"114\" x2=\"56\" y2=\"114\"/><text class=\"engines-navmesh-t\" x=\"66\" y=\"119\">portal (shared edge)</text><text class=\"engines-navmesh-s\" x=\"372\" y=\"190\">A* searches 7 polygons,</text><text class=\"engines-navmesh-s\" x=\"372\" y=\"210\">then the funnel pulls the</text><text class=\"engines-navmesh-s\" x=\"372\" y=\"230\">route tight to the corners</text></svg>"
        },
        {
          "type": "h",
          "text": "Steering and avoidance"
        },
        {
          "type": "p",
          "text": "The path is a list of waypoints; **steering behaviours** turn it into per-frame velocity. Core primitives from Reynolds: seek, arrive (decelerate to a stop), pursue (aim at the predicted position), separation, alignment and cohesion for flocks. Each produces a desired velocity or force; you combine them with weights and clamp by max speed and turn rate, so motion respects the character's physical limits. For crowds, **local avoidance** such as RVO or ORCA treats nearby agents as moving obstacles and picks a velocity that avoids collision for the next couple of seconds. This is why 50 agents can cross a plaza without a global replan. Typical failure modes: agents jittering at corners (path corners too tight, no arrival radius), deadlock in doorways (no priority or yielding rules), and agents stuck because the navmesh and physics collider disagree."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Separate what the AI decides from how often it decides. Decisions can run at 5-10 Hz and be staggered across agents, while steering runs every frame. This single change often cuts AI cost by 5-10x with no visible loss."
        },
        {
          "type": "h",
          "text": "Budgets and misconceptions"
        },
        {
          "type": "p",
          "text": "Spend budget where the player notices: agents on screen or near the player get full logic, distant ones get a coarse tick or a simplified simulation (an 'AI LOD'). Perception is the hidden cost: line-of-sight raycasts per agent per target per frame add up (50 agents x 10 targets x 60 Hz is 30,000 raycasts a second), so stagger and cache them. A common misconception is that smarter AI is better; players read intent, so telegraphed, fair, readable behaviour (an enemy that announces its attack) beats clever hidden behaviour."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "When asking an AI agent for enemy AI, specify the technique (BT, FSM or utility), the tick rate, the navigation system in use and the agent's physical size. Verify that it does not run A* every frame, does not allocate paths per query (reuse buffers), has hysteresis or cooldowns on state changes, and exposes debug visualization (current state, scores, path). Agents often write an FSM as a giant switch with duplicated conditions or call pathfinding from Update unconditionally; request a repath-only-on-change rule and test with 100 agents to see the cost."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "An enemy at exactly attack range flips between Chase and Attack every frame",
              "use": "FSM with hysteresis",
              "why": "Use different enter and exit thresholds (for example exit at 1.2x the range) and minimum state durations. Cures flicker cheaply; FSM transitions still grow toward N squared as states are added."
            },
            {
              "signal": "An FSM has many states that all need the same 'flee when hurt' or 'stunned' transition",
              "use": "Hierarchical state machine",
              "why": "Group states under super-states (Combat contains Attack and Cover) so shared transitions live once at the parent. Reduces duplication; the structure is still rigid when priorities change often."
            },
            {
              "signal": "After an interruption such as a cutscene or stun the agent should resume exactly what it was doing",
              "use": "Pushdown automaton (state stack)",
              "why": "Push the interrupting state and pop back to the previous one, so the FSM remembers history. Watch for stacks that grow unboundedly when interruptions nest."
            },
            {
              "signal": "Designers need explicit priorities like flee over attack over patrol and want to reuse branches across enemy types",
              "use": "Behaviour tree",
              "why": "Selectors give left-to-right priority and subtrees are reusable modules. Re-evaluating from the root costs cycles unless conditions use event-driven aborts; long Running actions need clean interruption."
            },
            {
              "signal": "An agent has many options whose desirability depends on graded factors like health, ammo, distance and threat",
              "use": "Utility AI",
              "why": "Score each option with response curves and pick the best, giving nuanced behaviour without transition spaghetti. Hard to tune and explain, so build debug views showing every score."
            },
            {
              "signal": "Agents must chain actions toward a goal (get key, open door, reach target) in combinations designers cannot script",
              "use": "Goal-oriented action planning (GOAP)",
              "why": "Actions declare preconditions and effects and a planner searches for a sequence reaching the goal. Emergent and flexible; planning is costly and behaviour is harder to direct, so replan sparingly."
            },
            {
              "signal": "Agents need the shortest route through a level graph quickly and with optimal results",
              "use": "A* with an admissible heuristic",
              "why": "A heuristic that never overestimates keeps A* optimal, and a tighter one expands fewer nodes. Weighting the heuristic trades optimality for speed; time-slice long searches across frames."
            },
            {
              "signal": "Grid pathfinding over 500,000 cells is slow and paths zigzag between cell centres",
              "use": "Navmesh with funnel smoothing",
              "why": "Convex polygons cover walkable space with far fewer nodes, and the funnel algorithm straightens the corridor into a taut path. Baked per agent radius; dynamic obstacles need carving or rebakes."
            },
            {
              "signal": "Hundreds of units must reach the same destination, such as the player base in an RTS",
              "use": "Flow field",
              "why": "Compute one integration field from the goal and let every unit follow its local gradient, so cost no longer scales with unit count. Expensive for many distinct goals and needs local avoidance for crowding."
            },
            {
              "signal": "Agents follow their paths correctly but bump into each other and pile up in doorways",
              "use": "Steering with RVO/ORCA local avoidance",
              "why": "Steering turns waypoints into limited acceleration, and velocity-obstacle avoidance resolves local collisions without global replanning. Dense crowds can still deadlock; add priorities or yielding."
            },
            {
              "signal": "AI decision logic and line-of-sight checks take most of the frame for 80 agents while steering is cheap",
              "use": "Staggered low-rate decision ticks",
              "why": "Run decisions and perception at 5-10 Hz spread across frames, while steering runs every frame. Huge savings with slight reaction delay; raise the rate for agents near the player."
            },
            {
              "signal": "Several behaviours read and write the same facts about targets, last-known positions and alerts",
              "use": "Blackboard",
              "why": "A shared key-value store per agent or squad decouples who senses a fact from who uses it. Easy to overuse; untyped keys and stale entries need naming rules and timestamps."
            }
          ]
        }
      ],
      "keyPoints": [
        "FSMs suit few modes, behaviour trees give explicit priority and modularity, utility AI handles many graded options but needs debug tooling.",
        "A* with an admissible heuristic is optimal; games often accept a weighted heuristic and time-slicing for speed.",
        "Navmeshes represent walkable space as convex polygons baked per agent size, searched with A* and smoothed by the funnel algorithm.",
        "Steering turns waypoints into physically limited motion, and local avoidance like RVO or ORCA resolves crowds without global replanning.",
        "Decisions can run at low rate and staggered while steering runs each frame; hysteresis prevents state flicker."
      ],
      "quiz": [
        {
          "q": "An enemy standing exactly at attack range flips between Chase and Attack every frame, producing stutter. Which fix addresses the cause?",
          "options": [
            "Add hysteresis: use a larger exit range than entry range",
            "Replace the FSM with A* pathfinding for the enemy",
            "Run the state machine at a much higher tick rate",
            "Increase the navmesh agent radius for this enemy"
          ],
          "answer": 0,
          "explain": "The conditions flip across a single threshold, so separate enter and exit thresholds stop oscillation. A higher tick rate makes flicker worse, and pathfinding and agent radius are unrelated."
        },
        {
          "q": "A designer wants guard AI where 'flee when low health' always outranks 'attack', which outranks 'patrol', and wants to reuse the attack branch for other enemy types. Which structure fits best?",
          "options": [
            "A flat FSM with a transition from every state to every other",
            "A behaviour tree whose selector orders the branches by priority",
            "A grid-based A* search over the actions",
            "A steering behaviour blend with equal weights"
          ],
          "answer": 1,
          "explain": "A selector tries children in priority order, and subtrees are reusable modules. A flat FSM makes priorities implicit across many transitions, and A* and steering solve different problems."
        },
        {
          "q": "A* on a 4-connected grid uses Euclidean distance as its heuristic. Compared to Manhattan distance, what is the result?",
          "options": [
            "It returns non-optimal paths because it overestimates",
            "It becomes Dijkstra and expands everything",
            "It stays optimal but expands more nodes because it is less informed",
            "It cannot handle obstacles"
          ],
          "answer": 2,
          "explain": "Euclidean never overestimates on a 4-connected grid, so it is admissible and optimal, but it underestimates more than Manhattan and so searches more nodes. It is not h = 0, so it does not degenerate to Dijkstra."
        },
        {
          "q": "A large level has 500,000 walkable grid cells and pathfinding takes 12 ms per query. Which change most directly reduces search size while keeping accurate routes?",
          "options": [
            "Switch to a convex-polygon navmesh with funnel smoothing",
            "Lower the steering max speed of every agent",
            "Use Dijkstra instead of A* for each query",
            "Increase the number of agents sharing one search"
          ],
          "answer": 0,
          "explain": "A navmesh collapses open areas into a few thousand polygons, so the graph being searched is orders of magnitude smaller. Dijkstra expands more nodes, and speed and agent count do not shrink the graph."
        },
        {
          "q": "Profiling 80 agents shows AI at 6 ms per frame, with most time in decision logic and line-of-sight checks, while steering is cheap. What change should come first?",
          "options": [
            "Remove local avoidance from all of the agents",
            "Switch from a navmesh over to a uniform grid",
            "Stagger decisions and sight checks to about 8 Hz, caching results",
            "Replace behaviour trees with one larger switch statement"
          ],
          "answer": 2,
          "explain": "Decisions and sight checks do not need 60 Hz; staggering them cuts cost several-fold while steering stays smooth every frame. Avoidance and the navigation representation are not where the time goes."
        },
        {
          "q": "In an RTS, a player orders 400 units to move to the same base. Running a separate A* query per unit causes frame spikes. What should you reach for?",
          "options": [
            "A* with an admissible heuristic run for each unit",
            "A navmesh with funnel smoothing run for each unit",
            "A flow field computed once from the destination",
            "Staggered low-rate decision ticks for the units"
          ],
          "answer": 2,
          "explain": "One flow field gives every cell a direction toward the shared goal, so each unit just reads its cell. Per-unit A*, even optimal or smoothed, repeats the same search 400 times, and staggering only spreads the cost."
        }
      ]
    },
    {
      "id": "engines-input-audio-net",
      "title": "Input, audio and multiplayer networking",
      "minutes": 14,
      "summary": "How engines abstract and buffer input, mix audio within a voice budget, and keep multiplayer responsive using authority, prediction, rollback and lag compensation.",
      "lesson": [
        {
          "type": "p",
          "text": "A player presses jump 40 ms before landing and expects the jump to happen. A gunshot plays with a hundred other sounds and still has to cut through the mix. Two players 80 ms apart each see themselves react instantly, and neither can cheat. These three systems share a theme: they hide the gap between what the player did and what the machine can show, on a strict clock."
        },
        {
          "type": "h",
          "text": "Input abstraction and buffering"
        },
        {
          "type": "p",
          "text": "Hardcoding `if (key == Space)` breaks on gamepads, remapping and touch. Engines add a layer: raw devices produce **actions** ('Jump', 'Move', 'Fire') through **bindings**, with processing such as dead zones, sensitivity curves and composite bindings (WASD to a 2D vector). Gameplay reads actions, never devices; rebinding, context switching (menu vs. gameplay) and multiple players on one machine then come for free. Analog sticks need a radial dead zone (for example 0.15-0.25) because worn sticks never rest at exactly zero, and rescaling the remainder so output still reaches 1."
        },
        {
          "type": "p",
          "text": "Input is sampled at some rate and consumed on a different one. If you poll in a fixed 50 Hz physics step but events arrive at 60 Hz, a short press can fall between ticks and be lost, so capture presses as edge events with timestamps and consume them in the step. **Input buffering** extends this for feel: store a press for a short window (typically 80-150 ms) and consume it when the action becomes legal, such as a queued jump just before landing or combo input during the end of an attack animation. **Coyote time** is the mirror: allow a jump for about 100 ms after leaving a ledge. Both are tuned to match what players believe they did."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "const float JumpBuffer = 0.12f, Coyote = 0.10f;\nfloat lastPress = -99f, lastGrounded = -99f;\n\nvoid OnJumpPressed() { lastPress = Time.time; }\n\nvoid FixedTick()\n{\n    if (grounded) lastGrounded = Time.time;\n    bool buffered = Time.time - lastPress <= JumpBuffer;\n    bool canJump = Time.time - lastGrounded <= Coyote;\n    if (buffered && canJump) { Jump(); lastPress = -99f; lastGrounded = -99f; }\n}"
        },
        {
          "type": "figure",
          "id": "engines-jump-buffer",
          "caption": "To scale: a press 40 ms before landing still jumps inside the 120 ms buffer, and a press 60 ms after leaving a ledge still jumps inside the 100 ms coyote window.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 244\" role=\"img\" aria-label=\"Two timelines drawn to scale in milliseconds. Top: a jump pressed 40 ms before landing is held in a 120 ms buffer and fires on landing. Bottom: after leaving a ledge, a press at +60 ms falls inside the 100 ms coyote window and jumps, while a press at +140 ms is too late.\"><style>.engines-jump-buffer-t{font-size:14px;fill:var(--fig-ink)}.engines-jump-buffer-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-jump-buffer-s{font-size:13px;fill:var(--fig-muted)}.engines-jump-buffer-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-jump-buffer-c{text-anchor:middle}.engines-jump-buffer-e{text-anchor:end}.engines-jump-buffer-ai{fill:var(--fig-panel)}.engines-jump-buffer-gd{fill:var(--fig-ok);fill-opacity:.18}.engines-jump-buffer-wn{fill:var(--fig-warn);fill-opacity:.35}.engines-jump-buffer-ax{stroke:var(--fig-line);stroke-width:1.5}.engines-jump-buffer-z{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 4}.engines-jump-buffer-pr{fill:var(--fig-accent)}.engines-jump-buffer-ok{fill:var(--fig-ok)}.engines-jump-buffer-bd{fill:var(--fig-bad)}.engines-jump-buffer-cu{stroke:var(--fig-accent2);stroke-width:2}.engines-jump-buffer-ring{fill:none;stroke-width:2;opacity:0;transform-box:fill-box;transform-origin:50% 50%}.engines-jump-buffer-cur{animation:engines-jump-buffer-cur 5s linear infinite}@keyframes engines-jump-buffer-cur{0%,5%{transform:translateX(20px)}85%,100%{transform:translateX(620px)}}.engines-jump-buffer-p0{animation:engines-jump-buffer-p0 5s ease-out infinite}@keyframes engines-jump-buffer-p0{0%,34.3%{opacity:0;transform:scale(1)}35.3%{opacity:.9;transform:scale(1)}44.3%,100%{opacity:0;transform:scale(2.6)}}.engines-jump-buffer-p1{animation:engines-jump-buffer-p1 5s ease-out infinite}@keyframes engines-jump-buffer-p1{0%,45%{opacity:0;transform:scale(1)}46%{opacity:.9;transform:scale(1)}55%,100%{opacity:0;transform:scale(2.6)}}.engines-jump-buffer-p2{animation:engines-jump-buffer-p2 5s ease-out infinite}@keyframes engines-jump-buffer-p2{0%,61%{opacity:0;transform:scale(1)}62%{opacity:.9;transform:scale(1)}71%,100%{opacity:0;transform:scale(2.6)}}.engines-jump-buffer-p3{animation:engines-jump-buffer-p3 5s ease-out infinite}@keyframes engines-jump-buffer-p3{0%,82.3%{opacity:0;transform:scale(1)}83.3%{opacity:.9;transform:scale(1)}92.3%,100%{opacity:0;transform:scale(2.6)}}</style><text class=\"engines-jump-buffer-h\" x=\"20\" y=\"30\">Jump buffer: press 40 ms before landing</text><rect class=\"engines-jump-buffer-ai\" x=\"20\" y=\"56\" width=\"300\" height=\"28\" rx=\"6\"/><rect class=\"engines-jump-buffer-gd\" x=\"320\" y=\"56\" width=\"300\" height=\"28\" rx=\"6\"/><rect class=\"engines-jump-buffer-wn\" x=\"240\" y=\"60\" width=\"240\" height=\"20\" rx=\"5\"/><text class=\"engines-jump-buffer-s\" x=\"30\" y=\"75\">airborne</text><text class=\"engines-jump-buffer-s engines-jump-buffer-e\" x=\"610\" y=\"75\">grounded</text><text class=\"engines-jump-buffer-t engines-jump-buffer-c\" x=\"400\" y=\"75\">buffer 120 ms</text><text class=\"engines-jump-buffer-h\" x=\"20\" y=\"128\">Coyote time: press after leaving a ledge</text><rect class=\"engines-jump-buffer-gd\" x=\"20\" y=\"146\" width=\"300\" height=\"28\" rx=\"6\"/><rect class=\"engines-jump-buffer-ai\" x=\"320\" y=\"146\" width=\"300\" height=\"28\" rx=\"6\"/><rect class=\"engines-jump-buffer-wn\" x=\"320\" y=\"150\" width=\"200\" height=\"20\" rx=\"5\"/><text class=\"engines-jump-buffer-s\" x=\"30\" y=\"165\">grounded</text><text class=\"engines-jump-buffer-s\" x=\"528\" y=\"165\">airborne</text><text class=\"engines-jump-buffer-t engines-jump-buffer-c\" x=\"376\" y=\"165\">coyote 100 ms</text><line class=\"engines-jump-buffer-z\" x1=\"320\" y1=\"46\" x2=\"320\" y2=\"182\"/><circle class=\"engines-jump-buffer-pr\" cx=\"240\" cy=\"70\" r=\"6\"/><circle class=\"engines-jump-buffer-ok\" cx=\"320\" cy=\"70\" r=\"7\"/><circle class=\"engines-jump-buffer-ok\" cx=\"440\" cy=\"160\" r=\"7\"/><circle class=\"engines-jump-buffer-bd\" cx=\"600\" cy=\"160\" r=\"6\"/><circle class=\"engines-jump-buffer-ring engines-jump-buffer-p0\" cx=\"240\" cy=\"70\" r=\"8\" style=\"stroke:var(--fig-accent)\"/><circle class=\"engines-jump-buffer-ring engines-jump-buffer-p1\" cx=\"320\" cy=\"70\" r=\"8\" style=\"stroke:var(--fig-ok)\"/><circle class=\"engines-jump-buffer-ring engines-jump-buffer-p2\" cx=\"440\" cy=\"160\" r=\"8\" style=\"stroke:var(--fig-ok)\"/><circle class=\"engines-jump-buffer-ring engines-jump-buffer-p3\" cx=\"600\" cy=\"160\" r=\"8\" style=\"stroke:var(--fig-bad)\"/><text class=\"engines-jump-buffer-s engines-jump-buffer-c\" x=\"240\" y=\"102\">press at -40 ms</text><text class=\"engines-jump-buffer-t\" x=\"330\" y=\"102\">Jump() on landing</text><text class=\"engines-jump-buffer-s engines-jump-buffer-e\" x=\"314\" y=\"192\">left ledge</text><text class=\"engines-jump-buffer-t engines-jump-buffer-c\" x=\"440\" y=\"192\">+60 ms: Jump()</text><text class=\"engines-jump-buffer-s engines-jump-buffer-e\" x=\"620\" y=\"192\">+140 ms: too late</text><line class=\"engines-jump-buffer-ax\" x1=\"20\" y1=\"212\" x2=\"620\" y2=\"212\"/><line class=\"engines-jump-buffer-ax\" x1=\"20\" y1=\"212\" x2=\"20\" y2=\"218\"/><text class=\"engines-jump-buffer-s engines-jump-buffer-c\" x=\"34\" y=\"234\">-150</text><line class=\"engines-jump-buffer-ax\" x1=\"120\" y1=\"212\" x2=\"120\" y2=\"218\"/><text class=\"engines-jump-buffer-s engines-jump-buffer-c\" x=\"120\" y=\"234\">-100</text><line class=\"engines-jump-buffer-ax\" x1=\"220\" y1=\"212\" x2=\"220\" y2=\"218\"/><text class=\"engines-jump-buffer-s engines-jump-buffer-c\" x=\"220\" y=\"234\">-50</text><line class=\"engines-jump-buffer-ax\" x1=\"320\" y1=\"212\" x2=\"320\" y2=\"218\"/><text class=\"engines-jump-buffer-s engines-jump-buffer-c\" x=\"320\" y=\"234\">0</text><line class=\"engines-jump-buffer-ax\" x1=\"420\" y1=\"212\" x2=\"420\" y2=\"218\"/><text class=\"engines-jump-buffer-s engines-jump-buffer-c\" x=\"420\" y=\"234\">+50</text><line class=\"engines-jump-buffer-ax\" x1=\"520\" y1=\"212\" x2=\"520\" y2=\"218\"/><text class=\"engines-jump-buffer-s engines-jump-buffer-c\" x=\"520\" y=\"234\">+100</text><line class=\"engines-jump-buffer-ax\" x1=\"620\" y1=\"212\" x2=\"620\" y2=\"218\"/><text class=\"engines-jump-buffer-s engines-jump-buffer-c\" x=\"600\" y=\"234\">+150 ms</text><g class=\"engines-jump-buffer-cur\" transform=\"translate(-100,0)\"><line class=\"engines-jump-buffer-cu\" x1=\"0\" y1=\"44\" x2=\"0\" y2=\"212\"/></g></svg>"
        },
        {
          "type": "h",
          "text": "Audio mixing and voices"
        },
        {
          "type": "p",
          "text": "Audio runs on its own real-time thread, producing buffers (commonly 512 or 1024 samples at 48 kHz, roughly 10-21 ms) that must be filled every time or the player hears a crackle. Sources feed **voices**: each playing sound occupies a voice, and each voice costs decoding, resampling, spatialization and effects. Platforms have voice limits (tens to a few hundred), and engines enforce a **voice budget** by priority: when 64 footsteps and explosions compete, the system culls the quietest or lowest-priority instance. Short, frequent sounds are decompressed into memory; long music streams from disk to save RAM; mid-length sounds use compressed-in-memory formats, trading CPU for memory."
        },
        {
          "type": "p",
          "text": "A **mixer** organizes sounds into a tree of buses (Master, Music, SFX, Dialogue, UI). Each bus carries its own volume and effects (EQ, compression, reverb sends). Two techniques make a mix legible: **ducking** (sidechain compression lowers music when dialogue plays) and **dynamic range management** so quiet footsteps and loud explosions are both audible at the player's volume. Volume sliders must map perceptually: a linear slider from 0 to 1 sounds wrong because loudness is logarithmic, so convert with `dB = 20 * log10(v)` and clamp at about -80 dB for silence. 3D audio adds distance attenuation, panning or HRTF binaural rendering, Doppler and occlusion."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Hitches in audio usually mean the mixer thread missed its deadline, from long main-thread stalls, cold-loading a compressed clip, or too many voices with heavy effects. Preload and pool common sounds, and move reverbs to shared sends instead of per-voice instances."
        },
        {
          "type": "h",
          "text": "Networking: client-server authority"
        },
        {
          "type": "p",
          "text": "In a networked game, someone decides what is true. In the usual **client-server** model, the server is **authoritative**: clients send inputs, the server simulates and broadcasts state, so a modified client cannot declare 'I have 999 health'. Peer-to-peer without authority is fast to build but invites cheating and needs NAT traversal or relays to connect players. A dedicated or host server sets the rule: **clients propose, the server disposes**. The core difficulty is latency. At 60 ms round trip, naive waiting makes your own character respond 60 ms late, which feels bad."
        },
        {
          "type": "h",
          "text": "Lockstep"
        },
        {
          "type": "p",
          "text": "**Deterministic lockstep** sends only inputs; every machine runs the identical simulation and advances turn N once it has everyone's inputs for N. Bandwidth is tiny (a few bytes per player per tick, which is why RTS games with thousands of units use it), but it requires bit-exact determinism (fixed-point or carefully controlled floating point, deterministic iteration order, seeded random numbers) and the game runs at the speed of the slowest player; typically input is applied a few ticks in the future to hide latency."
        },
        {
          "type": "h",
          "text": "Client-side prediction and reconciliation"
        },
        {
          "type": "p",
          "text": "In action games the client does not wait. **Client-side prediction** applies your own input locally at once. The input, tagged with a sequence number, goes to the server; the server simulates it and returns the authoritative state with the last input sequence it processed. **Reconciliation**: the client compares that state with its predicted state at that sequence; if they differ, it rewinds to the server state and **replays** all inputs not yet acknowledged. Usually the difference is zero and the player notices nothing; after a collision with something unpredicted, the correction is smoothed visually rather than snapped. Other players are not predicted but **interpolated**: remote entities are displayed about 100 ms in the past between two received snapshots so motion is smooth despite packet jitter."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "client: tick 100 input#57 -> apply locally, send to server, store in pending[]\nserver: processes #57 -> sends state {pos, lastProcessed=57}\nclient: on state: drop pending <= 57, set state=server, replay pending (#58,#59,#60)\n        if |predicted - corrected| small: smooth; else snap"
        },
        {
          "type": "figure",
          "id": "engines-net-prediction",
          "caption": "The client never waits: when the server's state for #57 arrives, it drops #57 and replays #58 to #60 on top of the authoritative state.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 284\" role=\"img\" aria-label=\"Client and server timelines. The client applies inputs #57 to #60 immediately and keeps them pending. The server simulates #57 and returns state with lastProcessed = 57; on arrival the client drops #57 and replays #58, #59 and #60 on top of the server state.\"><style>.engines-net-prediction-t{font-size:14px;fill:var(--fig-ink)}.engines-net-prediction-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-net-prediction-s{font-size:13px;fill:var(--fig-muted)}.engines-net-prediction-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-net-prediction-c{text-anchor:middle}.engines-net-prediction-e{text-anchor:end}.engines-net-prediction-ax{stroke:var(--fig-ink);stroke-width:1.5}.engines-net-prediction-in{fill:var(--fig-accent)}.engines-net-prediction-up{stroke:var(--fig-accent);stroke-width:1.5;stroke-dasharray:4 4}.engines-net-prediction-up0{stroke:var(--fig-accent);stroke-width:2}.engines-net-prediction-dl{stroke:var(--fig-accent2);stroke-width:2}.engines-net-prediction-sv{fill:var(--fig-accent2)}.engines-net-prediction-pk{opacity:0}.engines-net-prediction-a2{fill:var(--fig-accent2);font-size:13px}.engines-net-prediction-halo{paint-order:stroke;stroke:var(--fig-bg);stroke-width:5px;stroke-linejoin:round}.engines-net-prediction-rc{fill:none;stroke:var(--fig-accent2);stroke-width:2.5}.engines-net-prediction-rp{fill:var(--fig-warn);fill-opacity:.2;stroke:var(--fig-warn);stroke-width:2}.engines-net-prediction-x{stroke:var(--fig-bad);stroke-width:2}.engines-net-prediction-dr{opacity:.4}.engines-net-prediction-Ai0{animation-name:engines-net-prediction-Ai0;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Ai0{0%,8%{opacity:1}10%,14%{opacity:0}16%,100%{opacity:1}}.engines-net-prediction-Ai1{animation-name:engines-net-prediction-Ai1;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Ai1{0%,8%{opacity:1}10%,22%{opacity:0}24%,100%{opacity:1}}.engines-net-prediction-Ai2{animation-name:engines-net-prediction-Ai2;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Ai2{0%,8%{opacity:1}10%,30%{opacity:0}32%,100%{opacity:1}}.engines-net-prediction-Ai3{animation-name:engines-net-prediction-Ai3;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Ai3{0%,8%{opacity:1}10%,38%{opacity:0}40%,100%{opacity:1}}.engines-net-prediction-Asv{animation-name:engines-net-prediction-Asv;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Asv{0%,8%{opacity:1}10%,30%{opacity:0}32%,100%{opacity:1}}.engines-net-prediction-Adn{animation-name:engines-net-prediction-Adn;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Adn{0%,8%{opacity:1}10%,32%{opacity:0}34%,100%{opacity:1}}.engines-net-prediction-Arc{animation-name:engines-net-prediction-Arc;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Arc{0%,8%{opacity:1}10%,50%{opacity:0}52%,100%{opacity:1}}.engines-net-prediction-Adx{animation-name:engines-net-prediction-Adx;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Adx{0%,8%{opacity:1}10%,54%{opacity:0}56%,100%{opacity:1}}.engines-net-prediction-Ar1{animation-name:engines-net-prediction-Ar1;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Ar1{0%,8%{opacity:1}10%,58%{opacity:0}60%,100%{opacity:1}}.engines-net-prediction-Ar2{animation-name:engines-net-prediction-Ar2;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Ar2{0%,8%{opacity:1}10%,62%{opacity:0}64%,100%{opacity:1}}.engines-net-prediction-Ar3{animation-name:engines-net-prediction-Ar3;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-Ar3{0%,8%{opacity:1}10%,66%{opacity:0}68%,100%{opacity:1}}.engines-net-prediction-d0{animation-name:engines-net-prediction-d0;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-d0{0%,8%{opacity:.4}10%,54%{opacity:1}56%,100%{opacity:.4}}.engines-net-prediction-k0{animation-name:engines-net-prediction-k0;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-k0{0%,14%{opacity:0;transform:translate(110px,100px)}14.5%{opacity:1;transform:translate(110px,100px)}30%{opacity:1;transform:translate(210px,230px)}31%,100%{opacity:0;transform:translate(210px,230px)}}.engines-net-prediction-k1{animation-name:engines-net-prediction-k1;animation-duration:7s;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes engines-net-prediction-k1{0%,32%{opacity:0;transform:translate(210px,230px)}32.5%{opacity:1;transform:translate(210px,230px)}50%{opacity:1;transform:translate(330px,100px)}51%,100%{opacity:0;transform:translate(330px,100px)}}</style><text class=\"engines-net-prediction-h\" x=\"20\" y=\"105\">Client</text><text class=\"engines-net-prediction-h\" x=\"20\" y=\"235\">Server</text><line class=\"engines-net-prediction-ax\" x1=\"80\" y1=\"100\" x2=\"620\" y2=\"100\"/><line class=\"engines-net-prediction-ax\" x1=\"80\" y1=\"230\" x2=\"620\" y2=\"230\"/><line class=\"engines-net-prediction-up0 engines-net-prediction-Ai0\" x1=\"110\" y1=\"100\" x2=\"210\" y2=\"230\"/><line class=\"engines-net-prediction-up engines-net-prediction-Ai1\" x1=\"170\" y1=\"100\" x2=\"270\" y2=\"230\"/><line class=\"engines-net-prediction-up engines-net-prediction-Ai2\" x1=\"230\" y1=\"100\" x2=\"330\" y2=\"230\"/><line class=\"engines-net-prediction-up engines-net-prediction-Ai3\" x1=\"290\" y1=\"100\" x2=\"390\" y2=\"230\"/><g class=\"engines-net-prediction-Adn\"><line class=\"engines-net-prediction-dl\" x1=\"210\" y1=\"230\" x2=\"330\" y2=\"100\"/></g><g class=\"engines-net-prediction-Ai0\"><circle class=\"engines-net-prediction-in\" cx=\"110\" cy=\"100\" r=\"6\"/><text class=\"engines-net-prediction-t engines-net-prediction-c\" x=\"110\" y=\"86\">#57</text></g><g class=\"engines-net-prediction-Ai1\"><circle class=\"engines-net-prediction-in\" cx=\"170\" cy=\"100\" r=\"6\"/><text class=\"engines-net-prediction-t engines-net-prediction-c\" x=\"170\" y=\"86\">#58</text></g><g class=\"engines-net-prediction-Ai2\"><circle class=\"engines-net-prediction-in\" cx=\"230\" cy=\"100\" r=\"6\"/><text class=\"engines-net-prediction-t engines-net-prediction-c\" x=\"230\" y=\"86\">#59</text></g><g class=\"engines-net-prediction-Ai3\"><circle class=\"engines-net-prediction-in\" cx=\"290\" cy=\"100\" r=\"6\"/><text class=\"engines-net-prediction-t engines-net-prediction-c\" x=\"290\" y=\"86\">#60</text></g><g class=\"engines-net-prediction-Asv\"><circle class=\"engines-net-prediction-sv\" cx=\"210\" cy=\"230\" r=\"7\"/><text class=\"engines-net-prediction-s engines-net-prediction-c\" x=\"210\" y=\"254\">simulate #57</text></g><text class=\"engines-net-prediction-a2 engines-net-prediction-halo engines-net-prediction-Adn\" x=\"352\" y=\"170\">state + lastProcessed = 57</text><g class=\"engines-net-prediction-Arc\"><circle class=\"engines-net-prediction-rc\" cx=\"330\" cy=\"100\" r=\"9\"/><text class=\"engines-net-prediction-t\" x=\"344\" y=\"124\">reconcile</text></g><text class=\"engines-net-prediction-s engines-net-prediction-e\" x=\"300\" y=\"42\">pending</text><g class=\"engines-net-prediction-Ai0\"><g class=\"engines-net-prediction-dr engines-net-prediction-d0\"><rect class=\"engines-net-prediction-b\" x=\"312\" y=\"22\" width=\"52\" height=\"30\" rx=\"8\"/><text class=\"engines-net-prediction-t engines-net-prediction-c\" x=\"338\" y=\"42\">#57</text></g></g><g class=\"engines-net-prediction-Ai1\"><g><rect class=\"engines-net-prediction-b\" x=\"372\" y=\"22\" width=\"52\" height=\"30\" rx=\"8\"/><rect class=\"engines-net-prediction-rp engines-net-prediction-Ar1\" x=\"372\" y=\"22\" width=\"52\" height=\"30\" rx=\"8\"/><text class=\"engines-net-prediction-t engines-net-prediction-c\" x=\"398\" y=\"42\">#58</text></g></g><g class=\"engines-net-prediction-Ai2\"><g><rect class=\"engines-net-prediction-b\" x=\"432\" y=\"22\" width=\"52\" height=\"30\" rx=\"8\"/><rect class=\"engines-net-prediction-rp engines-net-prediction-Ar2\" x=\"432\" y=\"22\" width=\"52\" height=\"30\" rx=\"8\"/><text class=\"engines-net-prediction-t engines-net-prediction-c\" x=\"458\" y=\"42\">#59</text></g></g><g class=\"engines-net-prediction-Ai3\"><g><rect class=\"engines-net-prediction-b\" x=\"492\" y=\"22\" width=\"52\" height=\"30\" rx=\"8\"/><rect class=\"engines-net-prediction-rp engines-net-prediction-Ar3\" x=\"492\" y=\"22\" width=\"52\" height=\"30\" rx=\"8\"/><text class=\"engines-net-prediction-t engines-net-prediction-c\" x=\"518\" y=\"42\">#60</text></g></g><line class=\"engines-net-prediction-x engines-net-prediction-Adx\" x1=\"318\" y1=\"48\" x2=\"358\" y2=\"26\"/><text class=\"engines-net-prediction-s engines-net-prediction-Ar1\" x=\"556\" y=\"42\">replay</text><circle class=\"engines-net-prediction-in engines-net-prediction-pk engines-net-prediction-k0\" r=\"5\"/><circle class=\"engines-net-prediction-sv engines-net-prediction-pk engines-net-prediction-k1\" r=\"5\"/><text class=\"engines-net-prediction-s engines-net-prediction-e\" x=\"620\" y=\"272\">time</text></svg>"
        },
        {
          "type": "h",
          "text": "Rollback netcode"
        },
        {
          "type": "p",
          "text": "Fighting games need frame-exact responsiveness. **Rollback** predicts the remote player's input (assume it repeats), simulates immediately, and when the real input arrives and differs, **rolls back** to the last confirmed frame, applies the correct input and **re-simulates** forward to the present within a single frame. This needs a deterministic, fast, snapshot-able simulation: restoring and resimulating 6-8 frames in 16.6 ms leaves little room for anything else. Delay-based netcode in contrast waits and adds fixed input delay, which feels worse above about 3 frames."
        },
        {
          "type": "h",
          "text": "Lag compensation"
        },
        {
          "type": "p",
          "text": "You aim at an enemy you see 100 ms in the past (interpolation) with another 50 ms of travel to the server, so the server sees them elsewhere. **Lag compensation** lets the server rewind: it stores a short history of hitbox positions, and when a shot arrives, it rewinds target positions to the time the shooter saw them (client timestamp minus interpolation delay) and then resolves the hit. The price is that victims sometimes get hit 'behind cover', which designers limit by capping how far the server will rewind (a few hundred milliseconds is common)."
        },
        {
          "type": "figure",
          "id": "engines-lag-comp",
          "caption": "The server keeps a short hitbox history and rewinds the target 150 ms, 100 ms of interpolation plus 50 ms of travel, to test the shot where the shooter saw it.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"Lag compensation on the server: the target hitbox is recorded every 50 ms. When a shot arrives, the server rewinds the hitbox 150 ms (100 ms interpolation plus 50 ms travel) to where the shooter saw it, and the ray hits there.\"><style>.engines-lag-comp-t{font-size:14px;fill:var(--fig-ink)}.engines-lag-comp-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.engines-lag-comp-s{font-size:13px;fill:var(--fig-muted)}.engines-lag-comp-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.engines-lag-comp-c{text-anchor:middle}.engines-lag-comp-e{text-anchor:end}.engines-lag-comp-gh{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 4}.engines-lag-comp-now{fill:var(--fig-panel);stroke:var(--fig-ink);stroke-width:2}.engines-lag-comp-rw{fill:var(--fig-accent2);fill-opacity:.15;stroke:var(--fig-accent2);stroke-width:2.5}.engines-lag-comp-ray{stroke:var(--fig-bad);stroke-width:2;stroke-linecap:round}.engines-lag-comp-sh{fill:var(--fig-ink)}.engines-lag-comp-ip{fill:var(--fig-accent2);fill-opacity:.35}.engines-lag-comp-tr{fill:var(--fig-accent);fill-opacity:.35}.engines-lag-comp-hit{fill:var(--fig-ok)}.engines-lag-comp-ht{fill:var(--fig-ok);font-size:14px;font-weight:600}.engines-lag-comp-br{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.engines-lag-comp-ar{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.engines-lag-comp-mv{animation:engines-lag-comp-mv 6s ease-in-out infinite}@keyframes engines-lag-comp-mv{0%,10%{transform:translateX(300px)}35%,70%{transform:translateX(0)}85%,100%{transform:translateX(300px)}}.engines-lag-comp-hf{animation:engines-lag-comp-hf 6s linear infinite}@keyframes engines-lag-comp-hf{0%,35%{opacity:0}37%,68%{opacity:1}70%,100%{opacity:0}}</style><text class=\"engines-lag-comp-h\" x=\"24\" y=\"34\">Shot arrives at the server now</text><text class=\"engines-lag-comp-s\" x=\"24\" y=\"56\">rewind hitboxes 150 ms, test the ray, restore</text><path class=\"engines-lag-comp-br\" d=\"M240 94v-6h340v6\"/><text class=\"engines-lag-comp-s engines-lag-comp-c\" x=\"410\" y=\"78\">server hitbox history (target moving right)</text><rect class=\"engines-lag-comp-gh\" x=\"240\" y=\"116\" width=\"40\" height=\"64\" rx=\"8\"/><text class=\"engines-lag-comp-s engines-lag-comp-c\" x=\"260\" y=\"204\">-150 ms</text><rect class=\"engines-lag-comp-gh\" x=\"340\" y=\"116\" width=\"40\" height=\"64\" rx=\"8\"/><text class=\"engines-lag-comp-s engines-lag-comp-c\" x=\"360\" y=\"204\">-100 ms</text><rect class=\"engines-lag-comp-gh\" x=\"440\" y=\"116\" width=\"40\" height=\"64\" rx=\"8\"/><text class=\"engines-lag-comp-s engines-lag-comp-c\" x=\"460\" y=\"204\">-50 ms</text><rect class=\"engines-lag-comp-now\" x=\"540\" y=\"116\" width=\"40\" height=\"64\" rx=\"8\"/><text class=\"engines-lag-comp-h engines-lag-comp-c\" x=\"560\" y=\"204\">now</text><path class=\"engines-lag-comp-ar\" d=\"M590 148h24m-7 -6l7 6l-7 6\"/><g class=\"engines-lag-comp-mv\"><rect class=\"engines-lag-comp-rw\" x=\"240\" y=\"116\" width=\"40\" height=\"64\" rx=\"8\"/></g><line class=\"engines-lag-comp-ray\" x1=\"68\" y1=\"286\" x2=\"262\" y2=\"150\"/><circle class=\"engines-lag-comp-sh\" cx=\"60\" cy=\"292\" r=\"9\"/><text class=\"engines-lag-comp-t\" x=\"78\" y=\"318\">shooter</text><g class=\"engines-lag-comp-hf\"><circle class=\"engines-lag-comp-hit\" cx=\"262\" cy=\"150\" r=\"5\"/><text class=\"engines-lag-comp-ht engines-lag-comp-c\" x=\"260\" y=\"108\">hit</text></g><rect class=\"engines-lag-comp-ip\" x=\"260\" y=\"234\" width=\"200\" height=\"18\" rx=\"4\"/><rect class=\"engines-lag-comp-tr\" x=\"460\" y=\"234\" width=\"100\" height=\"18\" rx=\"4\"/><text class=\"engines-lag-comp-s engines-lag-comp-c\" x=\"360\" y=\"272\">100 ms interpolation</text><text class=\"engines-lag-comp-s engines-lag-comp-c\" x=\"510\" y=\"272\">50 ms travel</text></svg>"
        },
        {
          "type": "h",
          "text": "Bandwidth and tick rate"
        },
        {
          "type": "p",
          "text": "Tick rate is how often the server simulates and sends snapshots: 20-30 Hz in many shooters, 60-128 Hz in competitive ones, 10 Hz or less in slower games. Bandwidth is roughly `players x entities_state_bytes x rate`: 64 players x 40 bytes x 30 Hz is about 77 KB/s per client downstream before compression. Reduce it with **delta compression** against the last acknowledged snapshot, quantization (a position in 16 bits per axis within bounds), **interest management** (send only what is relevant to this player), and prioritization of nearby entities. Mobile players on cellular budgets want under 10-20 KB/s; packet loss means that you must design for it using UDP-based protocols with selective reliability rather than reliable ordering of everything."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Lockstep and rollback inherit every determinism hazard described in 'Physics and collision' (floating-point differences, unstable ordering), and they fail silently as desyncs. Detect them by hashing the game state each frame and comparing across peers."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "AI agents tend to write networking that trusts the client: 'client sends its position' or 'client reports damage'. Tell the agent the authority model (server-authoritative), the tick rate, the latency target and cheat model, and require that every client message be validated as an input or intent. Verify sequence numbers on inputs, that the replay uses the same code path as the simulation, that remote entities are interpolated, not teleported, and that you test with simulated latency (100-200 ms), jitter and 5% packet loss; code that works on localhost proves nothing."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Input handling is wired straight to actions and now you need rebinding, replays, undo or sending input over the network",
              "use": "Command pattern",
              "why": "Turn each input into a command object or struct with its tick; you can queue, record, replay, undo or transmit it. Adds a layer of indirection and requires commands to be deterministic to replay."
            },
            {
              "signal": "Code checks `key == Space` and breaks on gamepads, remapping and touch",
              "use": "Action mapping with bindings",
              "why": "Gameplay reads named actions like Jump and Move fed by bindings with processing such as radial dead zones. Rebinding, context switching and local multiplayer come for free; more setup up front."
            },
            {
              "signal": "Players say a jump pressed just before landing was ignored, or presses in a fixed step get lost",
              "use": "Input buffering",
              "why": "Record presses as timestamped edge events and honour them for a short window (80-150 ms) when the action becomes legal. Too long a window causes unintended actions."
            },
            {
              "signal": "Players fall off ledges while pressing jump and swear they were still on the ground",
              "use": "Coyote time",
              "why": "Allow a jump for about 100 ms after leaving the ground, then clear it so it cannot double-jump. Matches perceived intent; too generous a window feels floaty."
            },
            {
              "signal": "Important sounds like gunshots disappear when a hundred effects play at once",
              "use": "Voice priority and bus ducking",
              "why": "Limit voices per category, steal the least important, and duck music or ambience buses when key sounds play. Keeps the mix readable; mis-set priorities silence the wrong sounds."
            },
            {
              "signal": "A volume slider is nearly silent over half its travel and then jumps loud near the top",
              "use": "Perceptual (decibel) volume mapping",
              "why": "Hearing is logarithmic, so map slider position to decibels (for example -80 to 0 dB) instead of linear gain. Clamp the bottom to true silence."
            },
            {
              "signal": "A multiplayer game trusts positions and hits reported by clients, and cheaters teleport or one-shot others",
              "use": "Server authority",
              "why": "Clients send inputs, the server simulates and owns truth, and only results go out. Prevents most cheats; needs prediction to hide latency and costs server CPU and bandwidth."
            },
            {
              "signal": "In a server-authoritative game, your own movement feels sluggish because it waits for server confirmation",
              "use": "Client-side prediction and reconciliation",
              "why": "Apply your input locally at once, keep unacknowledged inputs, and on each server state rewind and replay them. Feels instant; mispredictions cause corrections that must be smoothed."
            },
            {
              "signal": "Remote players move in jerky steps because snapshots arrive irregularly over the network",
              "use": "Snapshot interpolation",
              "why": "Render remote entities about 100 ms in the past between two buffered snapshots, so jitter and loss are hidden. Adds visible latency for others, which lag compensation must account for."
            },
            {
              "signal": "An RTS has thousands of units and syncing their state would exceed the bandwidth budget",
              "use": "Deterministic lockstep",
              "why": "Send only inputs and have every peer run the same deterministic simulation. Tiny bandwidth; any float or ordering difference desyncs, and the slowest connection sets input delay."
            },
            {
              "signal": "A fighting game needs instant local response despite remote input arriving several frames late",
              "use": "Rollback netcode",
              "why": "Predict remote input, simulate, and on mismatch restore a saved state and re-simulate to the present. Needs a fast, deterministic, snapshot-able sim; long rollbacks cause visible teleports."
            },
            {
              "signal": "Shots that clearly hit on the shooter's screen do not register on the server, especially for high-ping players",
              "use": "Lag compensation (server rewind)",
              "why": "The server keeps hitbox history and rewinds targets to what the shooter saw (latency plus interpolation delay). Fair for shooters; victims get hit behind cover, so cap the rewind window."
            }
          ]
        }
      ],
      "keyPoints": [
        "Map devices to named actions with dead zones, and add input buffering and coyote time to match player intent.",
        "Audio is a real-time thread with a voice budget; buses, ducking and perceptual volume mapping keep the mix readable.",
        "Server authority prevents cheating; clients predict their own input and reconcile by replaying unacknowledged inputs.",
        "Lockstep sends only inputs but needs determinism; rollback predicts remote input and re-simulates on mismatch.",
        "Lag compensation rewinds target positions on the server; bandwidth is tuned with tick rate, delta compression and interest management."
      ],
      "quiz": [
        {
          "q": "Players complain that jumping right before landing is ignored, though the code only checks for a press on the frame the character is grounded. Which fix matches player intent?",
          "options": [
            "Raise the character's jump height by some margin",
            "Lower the physics tick rate to save time",
            "Add a radial dead zone to the jump button",
            "Store the press for about 100 ms, consume it on landing"
          ],
          "answer": 3,
          "explain": "An input buffer remembers a slightly early press and applies it when the action becomes legal. Jump height, physics rate and dead zones do not address the timing window."
        },
        {
          "q": "A volume slider sounds almost silent over the lower half of its travel and then jumps loud near the top. The slider writes a linear 0-1 value straight to the mixer gain. What is the right correction?",
          "options": [
            "Map the value to decibels with a logarithmic curve",
            "Add a reverb send to each of the buses",
            "Increase the audio buffer size to 4096 samples",
            "Lower the voice limit on every platform"
          ],
          "answer": 0,
          "explain": "Perceived loudness is logarithmic, so a linear gain-to-slider mapping feels wrong; converting to dB spreads the change evenly. Reverb, buffer size and voices do not change the slider curve."
        },
        {
          "q": "In a server-authoritative shooter with 80 ms latency, your own movement feels sluggish because it waits for server confirmation. What should change?",
          "options": [
            "Let the client decide its own position without server checks",
            "Apply input locally with prediction, then reconcile against server state",
            "Increase the tick rate to 240 Hz",
            "Switch to deterministic lockstep with a 200 ms input delay"
          ],
          "answer": 1,
          "explain": "Prediction gives immediate local response while the server stays authoritative, and reconciliation corrects mismatches. Trusting the client allows cheating, and the other options keep or add delay."
        },
        {
          "q": "A fighting game uses rollback. The remote player's input arrives 4 frames late and differs from the prediction. What happens?",
          "options": [
            "The game pauses until all peers agree on input",
            "The server resolves the conflict and sends a fresh state",
            "The game restores the last confirmed state and re-simulates 4 frames",
            "Local prediction is kept and the late remote input is ignored"
          ],
          "answer": 2,
          "explain": "Rollback rewinds to the last confirmed frame and replays forward within a frame, which requires a fast deterministic simulation. Pausing is delay-based netcode, and there is no authoritative server step in peer-to-peer rollback."
        },
        {
          "q": "Players report that shots that clearly hit on their screen do not register on the server, especially from 150 ms ping players. Which server-side mechanism addresses this?",
          "options": [
            "Lag compensation: rewind target hitboxes to the shooter's view time",
            "Lower the snapshot delta compression ratio on the server",
            "Increase the audio voice budget on the server",
            "Reduce the interpolation delay to zero on all clients"
          ],
          "answer": 0,
          "explain": "The shooter aimed at where the target appeared in the past, so the server must test against historical positions, within a capped rewind. Compression and audio are unrelated, and zero interpolation delay causes jitter without fixing the time mismatch."
        },
        {
          "q": "Remote players in a server-authoritative game look jerky because snapshots arrive about 20 times per second at irregular intervals, and the client draws the newest one as soon as it lands. Which approach fits best?",
          "options": [
            "Snapshot interpolation, rendering remote players slightly in the past",
            "Client-side prediction with server reconciliation on inputs",
            "Lag compensation that rewinds the server world state for every shot",
            "Deterministic lockstep for every player in the match"
          ],
          "answer": 0,
          "explain": "Buffering snapshots and interpolating between two of them turns irregular arrivals into smooth motion. Prediction is for your own inputs, lag compensation is a hit-detection fix, and lockstep would change the whole netcode model."
        }
      ]
    },
    {
      "id": "engines-debugging",
      "title": "Debugging a game",
      "minutes": 18,
      "summary": "One investigation from a once-in-three-hours \"fell through the floor\" report to a fix: replayable runs, debug tools, logs and invariants, tunneling, desync bisection, release crashes, frame capture and soak tests.",
      "lesson": [
        {
          "type": "p",
          "text": "A tester writes: 'Fell through the floor in the cargo bay. About three hours into a session, right after a jump pad. Could not do it again.' Over 400 hours of playtests, three people saw it. There is no video and no save file. The player was alive, standing on solid ground one moment, and 40 m below the map the next. This lesson follows that report from symptom to fix, then a shorter online desync and a release-build crash. The code is C#-flavoured pseudocode and nothing depends on an engine. The real subject is the set of decisions that make a game possible to debug at all."
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
    },
    {
      "id": "engines-profiling",
      "title": "Profiling a game",
      "minutes": 18,
      "summary": "One investigation from symptom to fix: budget the frame, read percentiles, find the bound lane, fix CPU spikes and GPU cost, and keep the gain with replay-based CI budgets.",
      "lesson": [
        {
          "type": "p",
          "text": "An action game runs at 60 fps on every dev PC. In one arena it shows about 45 fps on the target console and a mid-range phone, plus a hitch of 40 to 70 ms every few seconds. QA files it as 'arena 3 feels bad'. Nobody can say whether the code, the art or the hardware is at fault. This lesson follows that one investigation from symptom to fix, and the answer turns out to be two separate problems: a steady GPU cost and a periodic CPU spike. The method is engine-agnostic. The tools named (Tracy, Superluminal, Unreal Insights, PIX, RenderDoc, Instruments, Android profilers) exist for most engines and platforms, and the numbers are illustrative."
        },
        {
          "type": "h",
          "text": "Components"
        },
        {
          "type": "list",
          "items": [
            "**Frame-time overlay.** A debug HUD showing frame time, a short history graph, draw calls, memory per category and the main/render/GPU split. It costs almost nothing and is always on in non-shipping builds.",
            "**Capture and log.** Every frame time written to a file or a ring buffer, so percentiles come from data and not from impressions.",
            "**CPU profiler.** An instrumentation profiler (Tracy, Unreal Insights, Optick) for exact zones and frames, and a sampling profiler (Superluminal, Instruments Time Profiler, VTune, Android Simpleperf) for where the time goes inside zones.",
            "**GPU capture.** A frame debugger with per-pass timings: PIX on Xbox and Windows, RenderDoc, Xcode GPU capture on Apple platforms, vendor tools on mobile (Snapdragon Profiler, Arm Streamline).",
            "**Memory tracking.** Allocations tagged by category with a budget for each, so a leak or a blow-up names its owner.",
            "**Replay and perf harness.** A deterministic input replay or camera flythrough, run by a script on real devices, producing the same numbers every time."
          ]
        },
        {
          "type": "p",
          "text": "The rule that ties these together: one scene, one replay, one number. Without a repeatable run, a change that 'feels faster' is noise. The earlier lessons covered what the Unity tools look like. This one is about the questions you ask of any tool, and in what order."
        },
        {
          "type": "h",
          "text": "The frame budget"
        },
        {
          "type": "p",
          "text": "A budget is just division. At 60 fps a frame has 1000 / 60 = 16.67 ms. At 30 fps it has 33.3 ms. Every system borrows from that one number: gameplay, animation, physics, culling, command submission, audio, UI, and the GPU work that all of it produces. Aim to finish at about 85 percent of the budget (about 14 ms at 60 fps), because content grows, other devices are slower and the OS takes its share."
        },
        {
          "type": "p",
          "text": "With vsync, a frame that misses the deadline by 1 ms is not shown 1 ms late. It waits for the next refresh and appears at 33.3 ms. If one frame in three misses, the average is (2 x 16.7 + 33.3) / 3 = 22.2 ms, or 45 fps, the same number as in the ticket. Such a game is not 25 percent too slow. It is a few percent too slow in a third of its frames, and the display quantises that into a large drop."
        },
        {
          "type": "list",
          "items": [
            "**Gameplay and animation:** about 5 ms. **Physics:** about 2 ms. **AI:** about 1 ms.",
            "**Render submission (culling, command building):** about 3 ms, usually on a separate thread.",
            "**Audio, UI, streaming:** about 1.5 ms. **Headroom:** about 4 ms, deliberately unspent.",
            "**GPU:** its own 16.7 ms lane, running one frame behind the CPU."
          ]
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Profile on the target device, in a release-like build, after a warm-up. Editor and debug builds disable inlining, keep asserts and logging, and can be several times slower in code that has nothing wrong with it. Phones also throttle: a chip that holds peak clocks for the first minute may run at 20 to 40 percent lower sustained clocks after ten, so soak the device for 10 to 15 minutes before you trust a number. A profiler that adds 1 ms per frame is fine for ranking costs, but it must not be on for the final A/B."
        },
        {
          "type": "h",
          "text": "Step 1: averages lie"
        },
        {
          "type": "p",
          "text": "The ticket says 45 fps. An average fps number is 1000 divided by the mean frame time, and a mean cannot tell a steady 22 ms from a smooth 16 ms with a 70 ms hitch. Players feel the worst frames, not the mean. So the first capture is a frame-time graph (one bar per frame, with the budget line drawn on it) and a table of percentiles. **p50** is the typical frame. **p99** is the frame time that 99 percent of frames beat. The **1% low** is the average fps of the slowest 1 percent of frames. Tools differ slightly in how they define it, so write down which one you use. Capture with vsync off, so each bar is the real cost of the frame and not a multiple of the refresh interval."
        },
        {
          "type": "figure",
          "id": "prof-frame-graph",
          "caption": "The average hides the three red frames. The p99 of the whole run, 38 ms, is more than twice the 16.7 ms budget, even though most frames miss it by only a few ms.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"A bar chart of 45 frame times. Most bars are about 21 ms, above the 16.7 ms budget line. Three red spike bars reach 36 to 41 ms. A dashed line marks the run's p99 at 38 ms and a dotted line the average at 22 ms.\"><style>.prof-frame-graph-t{font-size:13px;fill:var(--fig-ink)}.prof-frame-graph-s{font-size:11px;fill:var(--fig-muted)}.prof-frame-graph-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.prof-frame-graph-g{stroke:var(--fig-line);stroke-width:1}.prof-frame-graph-bar{fill:var(--fig-accent);fill-opacity:.65}.prof-frame-graph-sp{fill:var(--fig-bad);animation:prof-frame-graph-pu 6s ease-in-out infinite}.prof-frame-graph-bl{stroke:var(--fig-ok);stroke-width:2}.prof-frame-graph-pl{stroke:var(--fig-warn);stroke-width:2;stroke-dasharray:6 4}.prof-frame-graph-al{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:2 3}.prof-frame-graph-cu{fill:var(--fig-ink);fill-opacity:.12;animation:prof-frame-graph-sc 6s linear infinite}@keyframes prof-frame-graph-pu{0%,100%{opacity:1}50%{opacity:.45}}@keyframes prof-frame-graph-sc{0%{transform:translateX(0)}100%{transform:translateX(528px)}}</style><text class=\"prof-frame-graph-h\" x=\"60\" y=\"22\">Frame time per frame, target console, arena 3</text><line class=\"prof-frame-graph-bl\" x1=\"60\" y1=\"46\" x2=\"80\" y2=\"46\"/><text class=\"prof-frame-graph-s\" x=\"86\" y=\"50\">16.7 ms budget (60 fps)</text><line class=\"prof-frame-graph-pl\" x1=\"252\" y1=\"46\" x2=\"272\" y2=\"46\"/><text class=\"prof-frame-graph-s\" x=\"278\" y=\"50\">run p99: 38 ms</text><line class=\"prof-frame-graph-al\" x1=\"374\" y1=\"46\" x2=\"394\" y2=\"46\"/><text class=\"prof-frame-graph-s\" x=\"400\" y=\"50\">average 22 ms (45 fps)</text><line class=\"prof-frame-graph-g\" x1=\"44\" y1=\"240\" x2=\"604\" y2=\"240\"/><text class=\"prof-frame-graph-s\" x=\"8\" y=\"244\">0</text><text class=\"prof-frame-graph-s\" x=\"8\" y=\"177.2\">16.7</text><text class=\"prof-frame-graph-s\" x=\"8\" y=\"110.80000000000001\">33.3</text><line class=\"prof-frame-graph-g\" x1=\"44\" y1=\"106.80000000000001\" x2=\"604\" y2=\"106.80000000000001\"/><rect class=\"prof-frame-graph-cu\" x=\"60\" y=\"60\" width=\"12\" height=\"180\"/><rect class=\"prof-frame-graph-bar\" x=\"60\" y=\"160\" width=\"10\" height=\"80\"/><rect class=\"prof-frame-graph-bar\" x=\"72\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-bar\" x=\"84\" y=\"152.8\" width=\"10\" height=\"87.2\"/><rect class=\"prof-frame-graph-bar\" x=\"96\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-bar\" x=\"108\" y=\"154.6\" width=\"10\" height=\"85.4\"/><rect class=\"prof-frame-graph-bar\" x=\"120\" y=\"160\" width=\"10\" height=\"80\"/><rect class=\"prof-frame-graph-bar\" x=\"132\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-bar\" x=\"144\" y=\"152.8\" width=\"10\" height=\"87.2\"/><rect class=\"prof-frame-graph-bar\" x=\"156\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-sp\" x=\"168\" y=\"88\" width=\"10\" height=\"152\"/><rect class=\"prof-frame-graph-bar\" x=\"180\" y=\"160\" width=\"10\" height=\"80\"/><rect class=\"prof-frame-graph-bar\" x=\"192\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-bar\" x=\"204\" y=\"152.8\" width=\"10\" height=\"87.2\"/><rect class=\"prof-frame-graph-bar\" x=\"216\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-bar\" x=\"228\" y=\"154.6\" width=\"10\" height=\"85.4\"/><rect class=\"prof-frame-graph-bar\" x=\"240\" y=\"160\" width=\"10\" height=\"80\"/><rect class=\"prof-frame-graph-bar\" x=\"252\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-bar\" x=\"264\" y=\"152.8\" width=\"10\" height=\"87.2\"/><rect class=\"prof-frame-graph-bar\" x=\"276\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-bar\" x=\"288\" y=\"154.6\" width=\"10\" height=\"85.4\"/><rect class=\"prof-frame-graph-bar\" x=\"300\" y=\"160\" width=\"10\" height=\"80\"/><rect class=\"prof-frame-graph-bar\" x=\"312\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-sp\" x=\"324\" y=\"96\" width=\"10\" height=\"144\"/><rect class=\"prof-frame-graph-bar\" x=\"336\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-bar\" x=\"348\" y=\"154.6\" width=\"10\" height=\"85.4\"/><rect class=\"prof-frame-graph-bar\" x=\"360\" y=\"160\" width=\"10\" height=\"80\"/><rect class=\"prof-frame-graph-bar\" x=\"372\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-bar\" x=\"384\" y=\"152.8\" width=\"10\" height=\"87.2\"/><rect class=\"prof-frame-graph-bar\" x=\"396\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-bar\" x=\"408\" y=\"154.6\" width=\"10\" height=\"85.4\"/><rect class=\"prof-frame-graph-bar\" x=\"420\" y=\"160\" width=\"10\" height=\"80\"/><rect class=\"prof-frame-graph-bar\" x=\"432\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-bar\" x=\"444\" y=\"152.8\" width=\"10\" height=\"87.2\"/><rect class=\"prof-frame-graph-bar\" x=\"456\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-bar\" x=\"468\" y=\"154.6\" width=\"10\" height=\"85.4\"/><rect class=\"prof-frame-graph-sp\" x=\"480\" y=\"76\" width=\"10\" height=\"164\"/><rect class=\"prof-frame-graph-bar\" x=\"492\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-bar\" x=\"504\" y=\"152.8\" width=\"10\" height=\"87.2\"/><rect class=\"prof-frame-graph-bar\" x=\"516\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-bar\" x=\"528\" y=\"154.6\" width=\"10\" height=\"85.4\"/><rect class=\"prof-frame-graph-bar\" x=\"540\" y=\"160\" width=\"10\" height=\"80\"/><rect class=\"prof-frame-graph-bar\" x=\"552\" y=\"156.4\" width=\"10\" height=\"83.6\"/><rect class=\"prof-frame-graph-bar\" x=\"564\" y=\"152.8\" width=\"10\" height=\"87.2\"/><rect class=\"prof-frame-graph-bar\" x=\"576\" y=\"158.2\" width=\"10\" height=\"81.8\"/><rect class=\"prof-frame-graph-bar\" x=\"588\" y=\"154.6\" width=\"10\" height=\"85.4\"/><line class=\"prof-frame-graph-al\" x1=\"44\" y1=\"152\" x2=\"604\" y2=\"152\"/><line class=\"prof-frame-graph-pl\" x1=\"44\" y1=\"88\" x2=\"604\" y2=\"88\"/><line class=\"prof-frame-graph-bl\" x1=\"44\" y1=\"173.2\" x2=\"604\" y2=\"173.2\"/><text class=\"prof-frame-graph-s\" x=\"60\" y=\"264\">ms per frame, 45-frame excerpt, vsync off. Red: hitch frames.</text></svg>"
        },
        {
          "type": "code",
          "lang": "python",
          "text": "import csv\n\nms = sorted(float(r[0]) for r in csv.reader(open('frametimes.csv')))\nn = len(ms)\navg = sum(ms) / n\np50, p99 = ms[n // 2], ms[int(n * 0.99)]\nworst = ms[int(n * 0.99):]                  # slowest 1% of frames\nlow1 = 1000 / (sum(worst) / len(worst))     # '1% low' in fps\nhitches = [m for m in ms if m > 2 * p50]    # frames over 2x the median\n\nprint(f'avg {avg:.1f} ms ({1000 / avg:.0f} fps)  p50 {p50:.1f}  p99 {p99:.1f}')\nprint(f'1% low {low1:.0f} fps  max {ms[-1]:.1f} ms  hitches {len(hitches)}')"
        },
        {
          "type": "p",
          "text": "In this investigation the arena 3 run gives: average 22.2 ms, p50 21 ms, p99 38 ms, max 71 ms, 1% low about 22 fps. The graph shows two things at once. Most frames sit just above the budget line (a steady cost), and a few tall bars rise out of the pack (spikes). Then measure the interval between spikes: they come every 4 seconds, give or take. A regular period points at something driven by a timer or a counter filling up, such as a garbage collector, an autosave, a periodic AI replan or a streaming tick. Random spikes point at content: the first use of an effect, a cell loading."
        },
        {
          "type": "h",
          "text": "Step 2: CPU-bound or GPU-bound?"
        },
        {
          "type": "p",
          "text": "Before any optimisation, answer one question: who is the slowest? A frame is produced by a pipeline of three workers: the **main thread** (gameplay, animation, physics), the **render thread** (culling, building command buffers) and the **GPU** (executing them). They overlap in time, so frame time is not their sum. It is set by the longest lane, and the others wait for it. Making a lane that is not the longest faster changes nothing you can measure."
        },
        {
          "type": "figure",
          "id": "prof-bound-timeline",
          "caption": "The GPU lane is the only one with no gaps. Both CPU lanes spend most of the frame waiting, so shaving CPU milliseconds would change nothing.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"A timeline with three lanes over three frames: main thread, render thread and GPU. The main thread works 6 ms then waits for the GPU. The render thread works 4.5 ms then waits. The GPU lane is busy for 20 ms per frame with no gaps, longer than the 16.7 ms budget, so the frame is GPU bound.\"><style>.prof-bound-timeline-t{font-size:13px;fill:var(--fig-ink)}.prof-bound-timeline-s{font-size:11px;fill:var(--fig-muted)}.prof-bound-timeline-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.prof-bound-timeline-c{text-anchor:middle}.prof-bound-timeline-lane{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1}.prof-bound-timeline-cpu{fill:var(--fig-accent);fill-opacity:.8}.prof-bound-timeline-gpu{fill:var(--fig-accent2);fill-opacity:.8}.prof-bound-timeline-w{fill:var(--fig-warn);fill-opacity:.2;stroke:var(--fig-warn);stroke-width:1.5;stroke-dasharray:4 3;animation:prof-bound-timeline-wp 4s ease-in-out infinite}.prof-bound-timeline-vs{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:3 4}.prof-bound-timeline-ph{fill:var(--fig-ink);fill-opacity:.7;animation:prof-bound-timeline-sw 5s linear infinite}.prof-bound-timeline-wt{font-size:12px;fill:var(--fig-ink)}.prof-bound-timeline-bt{font-size:12px;fill:var(--fig-bg);font-weight:600}.prof-bound-timeline-box{fill:var(--fig-panel);stroke:var(--fig-bad);stroke-width:1.5}@keyframes prof-bound-timeline-wp{0%,100%{fill-opacity:.2}50%{fill-opacity:.4}}@keyframes prof-bound-timeline-sw{0%{transform:translateX(0)}100%{transform:translateX(480px)}}</style><text class=\"prof-bound-timeline-h\" x=\"12\" y=\"24\">Steady state, 3 frames, target 60 fps (16.7 ms)</text><rect class=\"prof-bound-timeline-lane\" x=\"112\" y=\"70\" width=\"480\" height=\"40\"/><text class=\"prof-bound-timeline-t\" x=\"12\" y=\"95\">Main thread</text><rect class=\"prof-bound-timeline-lane\" x=\"112\" y=\"124\" width=\"480\" height=\"40\"/><text class=\"prof-bound-timeline-t\" x=\"12\" y=\"149\">Render thread</text><rect class=\"prof-bound-timeline-lane\" x=\"112\" y=\"178\" width=\"480\" height=\"40\"/><text class=\"prof-bound-timeline-t\" x=\"12\" y=\"203\">GPU</text><rect class=\"prof-bound-timeline-cpu\" x=\"112\" y=\"74\" width=\"48\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"136\" y=\"94\">6 ms</text><rect class=\"prof-bound-timeline-cpu\" x=\"272\" y=\"74\" width=\"48\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"296\" y=\"94\">6 ms</text><rect class=\"prof-bound-timeline-cpu\" x=\"432\" y=\"74\" width=\"48\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"456\" y=\"94\">6 ms</text><rect class=\"prof-bound-timeline-w\" x=\"160\" y=\"74\" width=\"112\" height=\"32\"/><text class=\"prof-bound-timeline-wt prof-bound-timeline-c\" x=\"216\" y=\"94\">wait for GPU</text><rect class=\"prof-bound-timeline-w\" x=\"320\" y=\"74\" width=\"112\" height=\"32\"/><text class=\"prof-bound-timeline-wt prof-bound-timeline-c\" x=\"376\" y=\"94\">wait for GPU</text><rect class=\"prof-bound-timeline-w\" x=\"480\" y=\"74\" width=\"112\" height=\"32\"/><text class=\"prof-bound-timeline-wt prof-bound-timeline-c\" x=\"536\" y=\"94\">wait for GPU</text><rect class=\"prof-bound-timeline-cpu\" x=\"160\" y=\"128\" width=\"36\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"178\" y=\"148\">4.5</text><rect class=\"prof-bound-timeline-cpu\" x=\"320\" y=\"128\" width=\"36\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"338\" y=\"148\">4.5</text><rect class=\"prof-bound-timeline-cpu\" x=\"480\" y=\"128\" width=\"36\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"498\" y=\"148\">4.5</text><rect class=\"prof-bound-timeline-w\" x=\"196\" y=\"128\" width=\"76\" height=\"32\"/><text class=\"prof-bound-timeline-wt prof-bound-timeline-c\" x=\"234\" y=\"148\">wait</text><rect class=\"prof-bound-timeline-w\" x=\"356\" y=\"128\" width=\"76\" height=\"32\"/><text class=\"prof-bound-timeline-wt prof-bound-timeline-c\" x=\"394\" y=\"148\">wait</text><rect class=\"prof-bound-timeline-w\" x=\"516\" y=\"128\" width=\"76\" height=\"32\"/><text class=\"prof-bound-timeline-wt prof-bound-timeline-c\" x=\"554\" y=\"148\">wait</text><rect class=\"prof-bound-timeline-gpu\" x=\"112\" y=\"182\" width=\"160\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"192\" y=\"202\">GPU 20 ms, frame N-1</text><rect class=\"prof-bound-timeline-gpu\" x=\"272\" y=\"182\" width=\"160\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"352\" y=\"202\">GPU 20 ms, frame N</text><rect class=\"prof-bound-timeline-gpu\" x=\"432\" y=\"182\" width=\"160\" height=\"32\"/><text class=\"prof-bound-timeline-bt prof-bound-timeline-c\" x=\"512\" y=\"202\">GPU 20 ms, frame N+1</text><line class=\"prof-bound-timeline-vs\" x1=\"245.4\" y1=\"58\" x2=\"245.4\" y2=\"222\"/><text class=\"prof-bound-timeline-s prof-bound-timeline-c\" x=\"245.4\" y=\"54\">16.7 ms</text><line class=\"prof-bound-timeline-vs\" x1=\"378.7\" y1=\"58\" x2=\"378.7\" y2=\"222\"/><text class=\"prof-bound-timeline-s prof-bound-timeline-c\" x=\"378.7\" y=\"54\">33.3 ms</text><line class=\"prof-bound-timeline-vs\" x1=\"512.1\" y1=\"58\" x2=\"512.1\" y2=\"222\"/><text class=\"prof-bound-timeline-s prof-bound-timeline-c\" x=\"512.1\" y=\"54\">50 ms</text><rect class=\"prof-bound-timeline-ph\" x=\"112\" y=\"62\" width=\"2\" height=\"156\"/><rect class=\"prof-bound-timeline-box\" x=\"12\" y=\"236\" width=\"616\" height=\"62\" rx=\"8\"/><text class=\"prof-bound-timeline-t\" x=\"28\" y=\"260\">Main 6 ms and render 4.5 ms: the CPU sits idle for over half of each frame.</text><text class=\"prof-bound-timeline-t\" x=\"28\" y=\"282\">GPU 20 ms is the longest lane, so the frame is GPU-bound at about 50 fps.</text></svg>"
        },
        {
          "type": "list",
          "items": [
            "**Resolution test.** Drop render resolution from 100 to 70 percent on each axis. That removes about half the pixels. If fps rises, the GPU (fill rate, pixel shading, bandwidth) was the limit. If it does not move, the pixels were never the problem.",
            "**Wait markers.** A main thread that spends most of its time in 'wait for GPU', 'present' or 'swap' is waiting for the GPU. A GPU lane with gaps in it is waiting for the CPU to submit work.",
            "**GPU timestamps.** Per-pass GPU times from a capture or from timestamp queries. If the GPU frame is 20 ms and the CPU frame is 11 ms, that is the whole answer.",
            "**Shrink the CPU.** Temporarily disable the AI or the animation of far characters. If fps does not rise on a GPU-bound frame, you have confirmed the bound without touching the renderer."
          ]
        },
        {
          "type": "p",
          "text": "Arena 3 gave a split answer. At 70 percent resolution the average fell from 22.2 ms to 15.5 ms, so the steady 45 fps is GPU-bound. The spikes stayed exactly where they were, at 38 to 71 ms, and their main-thread capture showed work that does not scale with resolution. Two bugs, two lanes. Fix each with its own evidence, not by guessing."
        },
        {
          "type": "h",
          "text": "Frame pacing"
        },
        {
          "type": "p",
          "text": "Frame pacing is how evenly frames arrive, not how many arrive. A steady 33.3 ms (locked 30) looks smoother than a game that mixes 16.7 and 33.3 ms frames and averages 45 fps, because the eye sees the judder. If you cannot reach 60 with margin, locking to 30 with even pacing, or using dynamic resolution to hold 60, beats an unlocked 45. Check the present intervals in the capture, and when a platform offers a frame-limiter or a variable refresh display, set the cap below the display's maximum rate so the queue never builds."
        },
        {
          "type": "h",
          "text": "Step 3: the CPU side, instrumentation and sampling"
        },
        {
          "type": "p",
          "text": "Two kinds of CPU profiler answer different questions. An **instrumentation** profiler (Tracy, Unreal Insights, Optick, engine markers) records the start and end of zones you placed. It gives exact durations per frame, names that mean something (`AI::Replan`), and the ability to open the one 71 ms frame and see what ran in it. Each zone costs a few to tens of nanoseconds, so put them on systems and not inside inner loops. A **sampling** profiler (Superluminal, Instruments, VTune, Simpleperf) interrupts the program about 1000 to 10000 times a second and records the call stack. It needs no code changes and sees into engine, driver and library code, but it is statistical: it ranks where time goes over many frames and can miss a single short spike."
        },
        {
          "type": "code",
          "lang": "cpp",
          "text": "void World::Tick(float dt) {\n  ZoneScopedN(\"World::Tick\");              // Tracy zone, closes at scope end\n  { ZoneScopedN(\"AI::Update\");  ai.Update(dt); }\n  { ZoneScopedN(\"Physics::Step\"); physics.Step(dt); }\n\n  TracyPlot(\"AliveEnemies\", (int64_t)enemies.size());\n  TracyPlot(\"FrameAllocKB\", frameAllocBytes / 1024.0);  // allocation counter\n}\n\nvoid Engine::Frame() {\n  Input(); world.Tick(dt); Render();\n  FrameMark;                                // ends the frame on the timeline\n}"
        },
        {
          "type": "p",
          "text": "Use them in that order. Sample first for the big picture ('this build spends 18 percent in animation blending'). Then instrument the suspects and capture the bad frames. Plots next to the zones matter: a counter for allocations per frame, enemies alive or active contacts often explains a zone before you open any code."
        },
        {
          "type": "h",
          "text": "Typical CPU culprits"
        },
        {
          "type": "p",
          "text": "In the 71 ms frame, one zone stands out. The usual suspects are a short list, and each has a standard fix."
        },
        {
          "type": "list",
          "items": [
            "**Per-frame allocations and GC spikes.** In a managed runtime, 40 KB of garbage per frame is 2.4 MB per second. With a collection triggered around 10 MB, that is a pause about every 4 seconds, the same period as the hitches. Typical sources are string formatting, closures, boxed values and temporary lists. Fix with pooling, preallocated buffers and reusing collections. In native code the same bug shows up as heap churn and lock contention, and the fix is a per-frame arena that is reset each frame.",
            "**Too many update calls.** 3,000 enemies each running a 5 microsecond `Tick` is 15 ms. Most of them are far away or idle. Tick by distance or priority, put idle entities to sleep, and process like data in contiguous arrays instead of virtual calls on scattered objects.",
            "**Physics with too many contacts.** A pile of 400 debris bodies can generate thousands of contacts, and solver time grows with contacts and iterations. Let bodies sleep, cap and recycle debris, use simple colliders and a tight layer matrix, and run cosmetic debris on the GPU.",
            "**Pathfinding spikes.** A single A* query across a big navigation graph can cost 12 ms, and a crowd that all replans on the same frame costs far more. This one is arena 3's spike, and the fix is the next technique."
          ]
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Do not optimise from a sampling profile of the editor or a debug build. The ranking there is often different from a release build: inlined code, removed asserts and compiled-out logging move whole subsystems up and down the list. Repeat the capture on the shipping configuration before you change code."
        },
        {
          "type": "h",
          "text": "Time-slicing: spread one spike across frames"
        },
        {
          "type": "p",
          "text": "A spike is rarely work that must happen on one frame. A replan, a navigation rebuild, a visibility update for 3,000 entities or a save serialisation can usually take a few frames longer. **Time-slicing** (amortising) turns a 12 ms job into a job that gets a small budget each frame, say 2 ms, and resumes where it stopped. The total work is the same. What changes is the worst frame, which falls from 22 ms to 12 ms in the example. The cost is latency: the result arrives about 6 frames (100 ms) later, which is invisible for a path replan and wrong for something the next frame depends on."
        },
        {
          "type": "figure",
          "id": "prof-time-slice",
          "caption": "The same 12 ms of work, paid once or paid in six pieces. The total is unchanged. The worst frame drops from 22 ms to 12 ms.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 340\" role=\"img\" aria-label=\"Two bar charts of eight frames each against a 16.7 ms budget line. Top: frame 3 has a red 12 ms spike on top of 10 ms of regular work, 22 ms in total, over budget. Bottom: the same job is split into six 2 ms slices on frames 3 to 8, so every frame stays at 12 ms, under budget.\"><style>.prof-time-slice-t{font-size:13px;fill:var(--fig-ink)}.prof-time-slice-s{font-size:11px;fill:var(--fig-muted)}.prof-time-slice-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.prof-time-slice-c{text-anchor:middle}.prof-time-slice-g{stroke:var(--fig-line);stroke-width:1}.prof-time-slice-bar{fill:var(--fig-accent);fill-opacity:.65}.prof-time-slice-sp{fill:var(--fig-bad);fill-opacity:.85;animation:prof-time-slice-pu 6s ease-in-out infinite}.prof-time-slice-sl{fill:var(--fig-accent2);fill-opacity:.9;animation:prof-time-slice-sq 6s ease-in-out infinite}.prof-time-slice-bl{stroke:var(--fig-ok);stroke-width:2}@keyframes prof-time-slice-pu{0%,100%{opacity:1}50%{opacity:.5}}@keyframes prof-time-slice-sq{0%,100%{opacity:1}30%{opacity:.35}}</style><text class=\"prof-time-slice-h\" x=\"16\" y=\"18\">Before: one 12 ms job lands in frame 3, which takes 22 ms</text><text class=\"prof-time-slice-h\" x=\"16\" y=\"172\">After: 2 ms per frame over frames 3 to 8, worst frame 12 ms</text><line class=\"prof-time-slice-g\" x1=\"70\" y1=\"140\" x2=\"570\" y2=\"140\"/><line class=\"prof-time-slice-g\" x1=\"70\" y1=\"290\" x2=\"570\" y2=\"290\"/><rect class=\"prof-time-slice-bar\" x=\"90\" y=\"90\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"110\" y=\"156\">1</text><rect class=\"prof-time-slice-bar\" x=\"90\" y=\"240\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"110\" y=\"306\">1</text><rect class=\"prof-time-slice-bar\" x=\"150\" y=\"90\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"170\" y=\"156\">2</text><rect class=\"prof-time-slice-bar\" x=\"150\" y=\"240\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"170\" y=\"306\">2</text><rect class=\"prof-time-slice-bar\" x=\"210\" y=\"90\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"230\" y=\"156\">3</text><rect class=\"prof-time-slice-bar\" x=\"210\" y=\"240\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"230\" y=\"306\">3</text><rect class=\"prof-time-slice-sl\" style=\"animation-delay:0s\" x=\"210\" y=\"230\" width=\"40\" height=\"10\"/><rect class=\"prof-time-slice-bar\" x=\"270\" y=\"90\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"290\" y=\"156\">4</text><rect class=\"prof-time-slice-bar\" x=\"270\" y=\"240\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"290\" y=\"306\">4</text><rect class=\"prof-time-slice-sl\" style=\"animation-delay:0.5s\" x=\"270\" y=\"230\" width=\"40\" height=\"10\"/><rect class=\"prof-time-slice-bar\" x=\"330\" y=\"90\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"350\" y=\"156\">5</text><rect class=\"prof-time-slice-bar\" x=\"330\" y=\"240\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"350\" y=\"306\">5</text><rect class=\"prof-time-slice-sl\" style=\"animation-delay:1s\" x=\"330\" y=\"230\" width=\"40\" height=\"10\"/><rect class=\"prof-time-slice-bar\" x=\"390\" y=\"90\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"410\" y=\"156\">6</text><rect class=\"prof-time-slice-bar\" x=\"390\" y=\"240\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"410\" y=\"306\">6</text><rect class=\"prof-time-slice-sl\" style=\"animation-delay:1.5s\" x=\"390\" y=\"230\" width=\"40\" height=\"10\"/><rect class=\"prof-time-slice-bar\" x=\"450\" y=\"90\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"470\" y=\"156\">7</text><rect class=\"prof-time-slice-bar\" x=\"450\" y=\"240\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"470\" y=\"306\">7</text><rect class=\"prof-time-slice-sl\" style=\"animation-delay:2s\" x=\"450\" y=\"230\" width=\"40\" height=\"10\"/><rect class=\"prof-time-slice-bar\" x=\"510\" y=\"90\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"530\" y=\"156\">8</text><rect class=\"prof-time-slice-bar\" x=\"510\" y=\"240\" width=\"40\" height=\"50\"/><text class=\"prof-time-slice-s prof-time-slice-c\" x=\"530\" y=\"306\">8</text><rect class=\"prof-time-slice-sl\" style=\"animation-delay:2.5s\" x=\"510\" y=\"230\" width=\"40\" height=\"10\"/><rect class=\"prof-time-slice-sp\" x=\"210\" y=\"30\" width=\"40\" height=\"60\"/><line class=\"prof-time-slice-bl\" x1=\"70\" y1=\"56.5\" x2=\"570\" y2=\"56.5\"/><line class=\"prof-time-slice-bl\" x1=\"70\" y1=\"206.5\" x2=\"570\" y2=\"206.5\"/><text class=\"prof-time-slice-s\" x=\"450\" y=\"50\">16.7 ms budget</text><text class=\"prof-time-slice-s\" x=\"450\" y=\"200\">16.7 ms budget</text><rect class=\"prof-time-slice-bar\" x=\"16\" y=\"320\" width=\"12\" height=\"12\"/><text class=\"prof-time-slice-s\" x=\"34\" y=\"331\">regular work, 10 ms</text><rect class=\"prof-time-slice-sp\" x=\"200\" y=\"320\" width=\"12\" height=\"12\"/><text class=\"prof-time-slice-s\" x=\"218\" y=\"331\">spike job, 12 ms at once</text><rect class=\"prof-time-slice-sl\" x=\"400\" y=\"320\" width=\"12\" height=\"12\"/><text class=\"prof-time-slice-s\" x=\"418\" y=\"331\">same job, 2 ms slice</text></svg>"
        },
        {
          "type": "code",
          "lang": "cpp",
          "text": "void PathService::Tick(double budgetMs) {          // budgetMs = 2.0\n  Timer t;\n  while (!queue.empty() && t.ElapsedMs() < budgetMs) {\n    PathJob& job = queue.front();\n    for (int i = 0; i < 64 && !job.done; ++i)       // 64 nodes, then check the clock\n      job.done = astar.Step(job.state);\n    if (job.done) { Deliver(job); queue.pop_front(); }\n  }                                                 // unfinished job resumes next frame\n}"
        },
        {
          "type": "p",
          "text": "Two details keep it safe. The job state must be resumable (A* keeps its open list, so it is). And a result that arrives 100 ms late must be validated on delivery: the target may have moved, so stamp requests with a version and drop or repair stale ones. For spikes you cannot slice, move them off the main thread, but only if the data is not touched while they run."
        },
        {
          "type": "h",
          "text": "Loading and shader-compilation hitches"
        },
        {
          "type": "p",
          "text": "Spikes that happen once per new thing are content hitches. The first frame that shows the boss's lightning effect asks the driver to compile a pipeline state for it, which costs 20 to 200 ms on the render thread. Disk reads and decompression do the same if they run on the main thread. The fixes are mechanical. **Pipeline-state precaching**: gather the pipeline states your game uses from play sessions, compile them at load or in the background (Unreal's PSO precaching, Vulkan pipeline caches, D3D12 pipeline libraries, Metal binary archives), and ship the cache for each GPU family. **Async loading**: request assets early by area, read and decompress on worker threads, and give the main thread a per-frame cap for the final hookup, such as 1 ms for object creation."
        },
        {
          "type": "h",
          "text": "Step 4: the GPU side"
        },
        {
          "type": "p",
          "text": "The 20 ms GPU frame needs a frame capture (PIX, RenderDoc, Xcode or the mobile vendor's tool). It lists every draw with its GPU time, grouped by pass. In arena 3 the passes add up as follows."
        },
        {
          "type": "list",
          "items": [
            "**Shadows (4 cascades):** 4.2 ms. **Opaque geometry:** 5.0 ms. **Lighting:** 3.6 ms.",
            "**Particles and transparents:** 4.8 ms. **UI:** 0.9 ms. **Post-processing:** 1.5 ms."
          ]
        },
        {
          "type": "p",
          "text": "Particles and transparents are the outlier for the area. Transparent surfaces are drawn over each other, so each pixel is shaded and blended once per layer: that is **overdraw**. Ten full-screen layers of smoke at 1920 x 1080 is 2.07 million pixels x 10 layers x 16 bytes (an RGBA16F target read and written for blending), up to 330 MB of traffic per frame, or 20 GB/s at 60 fps, before caches help. That is a large share of a console's bandwidth. A tile-based phone GPU blends in on-chip tile memory, so there the same overdraw costs fragment shading and texture reads instead, but it still grows with pixels x layers. The remedies: fewer and smaller particle quads (trim the transparent corners of the texture), half-resolution rendering for smoke, LOD and distance culling for effects, and an overdraw view in the capture to confirm."
        },
        {
          "type": "list",
          "items": [
            "**Shader cost.** Look at the most expensive draws, not the most numerous. A material that samples 12 textures and does a dependent read per pixel will dominate. Cheaper variants for distant or low-tier devices fix it.",
            "**Draw calls and state changes.** Thousands of small draws are a CPU submission cost first, a GPU cost second. Batch, instance or merge. Sorting by pipeline state reduces switches.",
            "**Bandwidth.** Large render targets, high-precision formats, uncompressed textures and many full-screen passes. Use compressed formats and lower-precision buffers where the image allows.",
            "**Shadow cascades.** Each cascade renders the scene again. Going from 4 to 3 cascades with a shorter shadow distance often saves a third to a half of the shadow pass, with a small visible change at the far edge.",
            "**Resolution scaling.** Dynamic resolution lowers the render size when GPU time crosses a threshold and upsamples with a good filter. It converts rare spikes into a mild blur, and it is the safety net after the real fixes."
          ]
        },
        {
          "type": "h",
          "text": "Memory: budgets, fragmentation, streaming"
        },
        {
          "type": "p",
          "text": "Memory failures arrive as crashes, not as slow frames, so the budget needs to be set before the problem appears. Split the console's available memory into categories (textures, meshes, audio, animation, gameplay, UI, streaming pool) and assign each a number, then alert when a category passes it. Fragmentation is the quiet failure: after hours of allocation and free, there is enough total free memory but no single block large enough. The defences are pools and arenas for same-sized objects, a per-level or per-frame arena that is reset wholesale, and a streaming system that works inside a fixed pool and evicts by distance instead of calling the general allocator. Streaming also needs a bandwidth budget: if textures arrive from disk faster than the pool can take them, the result is blurry textures and, worse, frame hitches while a sync wait blocks the main thread."
        },
        {
          "type": "h",
          "text": "Method: one change, one replay"
        },
        {
          "type": "p",
          "text": "Optimisation that works is a loop of single changes. Record a deterministic replay (the same inputs, the same random seed, a scripted camera flythrough over the worst 90 seconds of arena 3). Capture a baseline with at least 3 runs. Make one change. Capture again. Keep the change only if p99 and average improve beyond the run-to-run noise (here about 2 percent). Changing two things at once leaves you unable to say which did the work, or which one made something else worse."
        },
        {
          "type": "code",
          "lang": "yaml",
          "text": "scene: arena_03\nreplay: replays/arena_03_flythrough.rec   # same inputs, same seed\ndevices: [console_devkit, phone_midrange]\nwarmup_seconds: 20\nduration_seconds: 120\nruns: 3                                     # compare the median run\nbudgets:\n  avg_ms: 14.5\n  p99_ms: 16.7\n  max_ms: 40\n  gpu_ms_p95: 14.0\n  memory_peak_mb: { console_devkit: 5200, phone_midrange: 2200 }\nalert:\n  p99_regression_pct: 10                    # vs the last green build on main"
        },
        {
          "type": "p",
          "text": "Then make it permanent. A CI job runs the replay on real devices for each scene, stores the numbers per build and fails the build when a budget is exceeded or when p99 gets 10 percent worse than the last good build. Performance regresses one reasonable-looking commit at a time, and a chart over the last 100 builds finds the commit. Without the job, you do this investigation again in six months."
        },
        {
          "type": "h",
          "text": "The fix list"
        },
        {
          "type": "p",
          "text": "The measured result for arena 3, with illustrative numbers, one change per row. Order is by gain per day of work."
        },
        {
          "type": "list",
          "items": [
            "**Particle overdraw:** smoke rendered at half resolution, fewer layers, trimmed quads. GPU -4.5 ms.",
            "**Shadows:** 4 cascades to 3, shorter distance. GPU -2.0 ms. The GPU frame goes from 20 ms to 13.5 ms.",
            "**Allocations:** pooled the hit-effect and damage-number objects, removed per-frame string formatting. The 4-second GC spike of 8 ms is gone.",
            "**AI replan:** time-sliced, 12 ms in one frame becomes 2 ms over 6 frames.",
            "**Pipeline states:** precached 340 states for the arena at load. Three first-use hitches of 60 ms or more are gone.",
            "**Result:** average 14.4 ms uncapped (about 69 fps; it ships locked to 60), p99 16.2 ms, max 21 ms. Dynamic resolution stays as a safety net and rarely triggers."
          ]
        },
        {
          "type": "h",
          "text": "Decisions and why they work"
        },
        {
          "type": "list",
          "items": [
            "**Measure on target hardware in a release-like build.** The bottleneck on a dev PC is not the one on a console. The alternative, profiling in the editor, ranks the wrong things and costs a week of optimising code that was never slow.",
            "**Look at frame-time graphs and percentiles, not average fps.** Players feel spikes. An average hides them. The alternative is a green dashboard and a bad game.",
            "**Decide CPU-bound or GPU-bound before touching code.** The longest lane sets the frame time. The alternative is optimising a lane that is not the limit, which wastes effort and changes nothing.",
            "**Instrument systems, sample for the ranking.** Instrumentation finds which frame and which system. Sampling finds why inside it. Either alone leaves gaps: zones you forgot, or spikes you sampled past.",
            "**Time-slice work that does not need to finish this frame.** It caps the worst frame at a known cost. The alternative, moving the spike to another thread, adds synchronisation bugs. Slicing costs latency and resumable state.",
            "**Precache pipelines and stream asynchronously.** Compile and load before the player needs it. The alternative is hitches on first use that testers notice once and never reproduce.",
            "**Set memory budgets per category.** An owner is named when the number is crossed. A single global limit finds the problem only when the game crashes.",
            "**Use a deterministic replay and CI budgets.** A repeatable run makes an A/B result real, and an automated gate keeps the gain. The alternative is manual playtest numbers that vary by 10 percent."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents are useful here for the mechanical parts: writing the frame-log parser and percentile report, adding zones and counters to a system, generating the replay runner and the CI job, and drafting a pooling or time-slicing change for a function you name. Give them the capture data and a budget, and ask for one change at a time. Verify what they cannot see: run the A/B on the real device, check the profile after the change and not only the diff, and read pooled or sliced code for stale references and ordering bugs. An agent that has no profile will optimise by guessing, and it will often pick a function that is not hot. Never accept 'this should be faster' without a measurement."
        },
        {
          "type": "h",
          "text": "Reading the symptoms"
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Average fps looks fine but players report stutter every few seconds",
              "use": "Graph frame time and read the spikes",
              "why": "An average hides outliers. Plot every frame against the budget line and compute p99 and the 1% low. Check whether the spikes repeat at a fixed interval, which points to a timer or counter."
            },
            {
              "signal": "Fps rises noticeably when render resolution is cut",
              "use": "Treat it as GPU-bound: capture a GPU frame",
              "why": "A resolution drop removes pixel work only. If it helps, the limit is fill rate, shading or bandwidth. Read per-pass GPU times and attack the largest pass first."
            },
            {
              "signal": "Fps does not change with resolution and the main thread is busy for most of the frame",
              "use": "Go CPU-side: sample, then instrument",
              "why": "The pixels are not the limit. Sample to rank the systems, instrument the top ones, and open the worst frames in the timeline."
            },
            {
              "signal": "Hitches repeat every few seconds while an allocation counter climbs",
              "use": "Remove per-frame allocations",
              "why": "Garbage accumulates until a collection runs. Divide the threshold by bytes per frame to predict the period, then pool objects and reuse buffers until the counter is flat."
            },
            {
              "signal": "One system costs 10 ms or more on a single frame and almost nothing otherwise",
              "use": "Time-slice the job over several frames",
              "why": "Give it a budget of about 2 ms per frame and make its state resumable. The worst frame falls to the budget. Validate stale results when they arrive."
            },
            {
              "signal": "The first appearance of an effect or enemy freezes for 50 to 200 ms and is smooth afterwards",
              "use": "Precache pipelines and preload assets",
              "why": "The cost is a first-use shader compile or a load on the critical path. Compile pipeline states and load assets before the player needs them, on worker threads."
            },
            {
              "signal": "Two runs of the same scene differ by 10 percent, so nobody can tell if a change helped",
              "use": "Record a deterministic replay and A/B it",
              "why": "Same inputs and seed, fixed camera path, warm-up, three runs. Variance falls below the effect size and a real gain of a few percent becomes visible."
            },
            {
              "signal": "A fix worked last quarter and the scene is slow again, with no idea which commit did it",
              "use": "Gate builds with CI perf budgets",
              "why": "Run the replay on real devices per build, store p99 and GPU time, and fail when a budget is crossed. A chart over builds points straight at the commit."
            }
          ]
        }
      ],
      "keyPoints": [
        "A frame budget is division: 16.67 ms at 60 fps, 33.3 ms at 30. Aim for about 85 percent, and with vsync a small miss shows as a full missed refresh.",
        "Averages lie. Graph every frame and read p50, p99 and the 1% low. A fixed interval between spikes points at a timer or a filling counter.",
        "Decide CPU-bound or GPU-bound first. Frame time is set by the longest lane, and a resolution drop that raises fps proves a GPU limit.",
        "Sample to rank systems, instrument to inspect the bad frames, and profile a release-like build on the target device after a thermal warm-up.",
        "Spikes have standard fixes: pool allocations, tick less, cap contacts, time-slice jobs (2 ms for 6 frames instead of 12 ms once) and precache pipelines.",
        "Change one thing at a time against a deterministic replay, then lock the gain in with per-scene CI budgets and regression alerts."
      ],
      "quiz": [
        {
          "q": "On a 60 Hz display with vsync, one frame in three takes slightly over 16.7 ms and is shown at 33.3 ms, and the rest finish in time. What does the fps counter show?",
          "options": [
            "About 58 fps, since each miss is only a millisecond",
            "About 30 fps, since a missed frame halves the rate",
            "About 45 fps, since the mean frame time is 22.2 ms",
            "About 50 fps, since two of three frames hit 60"
          ],
          "answer": 2,
          "explain": "The mean frame time is (2 x 16.7 + 33.3) / 3 = 22.2 ms, which is 45 fps. The first option ignores that vsync turns a small miss into a whole refresh. 30 fps would need every frame to miss. 50 fps averages rates instead of times, and fps must be derived from the mean frame time."
        },
        {
          "q": "A capture has 1000 frames: 980 take 16 ms and 20 take 90 ms. Which reading is correct?",
          "options": [
            "p99 is about 16 ms, because 98 percent of frames are fast ones",
            "Average is about 57 fps, yet p99 is 90 ms and the 1% low is 11 fps",
            "You need at least 10,000 frames before any p99 means anything",
            "The average and p99 agree, because the outliers cancel out"
          ],
          "answer": 1,
          "explain": "The mean is 17.5 ms, about 57 fps, which looks healthy. But 2 percent of frames are slow, so the 99th percentile lands inside them at 90 ms, and the slowest 1 percent averages 90 ms, about 11 fps. The first option misplaces the 99th frame. A 1000-frame sample is enough for p99. Outliers never cancel in a mean."
        },
        {
          "q": "Dropping render resolution from 100 to 70 percent leaves the frame at 21 ms, and the main thread is busy for 20 ms of it. What is the next step?",
          "options": [
            "Cut shadow cascades from 4 to 3 to save GPU time",
            "Switch to a faster GPU driver setting and measure again",
            "Halve texture sizes to relieve memory bandwidth",
            "Sample, then instrument the main thread"
          ],
          "answer": 3,
          "explain": "A resolution cut removes only pixel work. No change means the GPU was not the limit, and the main thread, busy for 20 of 21 ms, is the bound lane. Cascades, driver settings and texture sizes are all GPU-side changes and would leave the frame at 21 ms."
        },
        {
          "q": "A navigation replan costs 12 ms once every 4 s, on top of 10 ms of regular work, in a 16.7 ms frame. Which change removes the hitch and keeps the same plan?",
          "options": [
            "Run it in 2 ms slices over 6 frames, with a resumable search",
            "Run it every frame at low priority so the plan is always fresh",
            "Raise the frame budget to 33 ms so the spike fits",
            "Move it to the start of the frame, before input is read"
          ],
          "answer": 0,
          "explain": "Slicing caps the worst frame at 10 + 2 = 12 ms, under the budget, with the same total work. Running it every frame multiplies the cost. Raising the budget halves the frame rate for everyone. Reordering inside the frame leaves the 22 ms frame as it is."
        },
        {
          "q": "A managed game allocates 40 KB per frame at 60 fps, and the collector runs when about 10 MB is waiting. About how often does the pause hit?",
          "options": [
            "About every 0.4 s",
            "About every 40 s",
            "About every 4 s",
            "About every 10 s"
          ],
          "answer": 2,
          "explain": "40 KB x 60 = 2.4 MB per second, and 10 MB / 2.4 MB per second is about 4.2 s. That matches a spike with a regular period, which is the clue. The other values come from slipping a factor of ten, or from dividing by the wrong unit."
        },
        {
          "q": "The first time a boss casts lightning, the game freezes about 120 ms and the render thread shows the stall. Later casts are smooth. Which move fits?",
          "options": [
            "Time-slice the job over several frames",
            "Precache pipelines and preload assets",
            "Remove per-frame allocations",
            "Treat it as GPU-bound: capture a GPU frame"
          ],
          "answer": 1,
          "explain": "A one-time freeze that disappears on repeat is the signature of a first-use pipeline compile. Compile pipeline states at load, on worker threads. Time-slicing treats a job that recurs, removing allocations treats periodic GC pauses, and a GPU capture investigates steady GPU cost, not a one-time driver compile."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "Your game drops to 40 fps on a mid-range phone. The profiler shows a 24 ms main thread, of which 10 ms is physics running three fixed steps every frame, and 11 ms of GPU time. What should you do first?",
      "options": [
        "Lower the render resolution, since the GPU is the stage that sets frame time",
        "Shorten the fixed timestep so that each physics step has less work to do",
        "Cut the cost of each physics step and cap the number of steps per frame",
        "Turn vsync off so the main thread no longer waits for the display"
      ],
      "answer": 2,
      "explain": "The CPU (24 ms) is the bound side, and physics is paying for several catch-up steps per frame, the start of a spiral of death. Reducing per-step cost (layers, sleeping, simpler colliders) and capping steps addresses it. A shorter step adds steps, and the GPU already fits."
    },
    {
      "q": "A designer adds a new enemy twice as wide as the player. It follows its paths, but scrapes through wall corners and gets stuck in narrow corridors the player passes easily. What is the most likely cause?",
      "options": [
        "It uses a navmesh baked for the player's radius instead of its own size",
        "Its behaviour tree selector has the patrol and chase branches swapped",
        "A* is using an admissible heuristic, which forces paths along the walls",
        "Its local avoidance treats the walls as other moving agents to dodge"
      ],
      "answer": 0,
      "explain": "Navmeshes are baked per agent radius, height and step, so a mesh built for a small agent leads a wide one through gaps it cannot fit. Decision logic and heuristic admissibility do not change where the walkable surface is."
    },
    {
      "q": "After the main menu is moved into its own downloadable bundle, the bundle grows from 5 MB to 180 MB. The menu has a button that plays the intro cinematic. What most likely happened?",
      "options": [
        "Texture compression was turned off when the bundle was first created",
        "A hard reference to the cinematic pulled it and its dependencies in",
        "The asset GUIDs were regenerated, which duplicated every texture used",
        "Asynchronous loading stored a second copy of each asset in the bundle"
      ],
      "answer": 1,
      "explain": "Bundling includes everything reachable through hard references, so one direct reference drags in a large dependency tree. A soft reference loaded on demand keeps the cinematic out of the menu bundle."
    },
    {
      "q": "The profiler shows 5 ms of animation for 60 enemies. Their animators are almost always mid cross-fade because the AI keeps switching between Chase and Attack every few frames. What is the best fix?",
      "options": [
        "Raise the compression on all clips so each one samples faster",
        "Switch every enemy to GPU skinning so evaluation leaves the CPU",
        "Replace the blend trees with single clips for all of the states",
        "Add hysteresis or a minimum duration to the AI state changes"
      ],
      "answer": 3,
      "explain": "During a cross-fade the animator evaluates two or more states, so constant re-triggering doubles evaluation cost. The root cause is state flicker in the AI, which hysteresis or minimum durations remove. GPU skinning does not move pose evaluation off the CPU."
    },
    {
      "q": "Replays recorded on a PC drift out of sync after about a minute when played on ARM phones, even though both run a fixed 60 Hz step. What is the most useful next step?",
      "options": [
        "Hash the game state every tick on both machines and find the first mismatch",
        "Raise the fixed step to 120 Hz so that the error per step becomes smaller",
        "Switch the simulation to a variable timestep that matches each device",
        "Record positions at a lower rate so that the replay files are smaller"
      ],
      "answer": 0,
      "explain": "A fixed step is necessary but not sufficient for determinism; floating-point differences or ordering diverge somewhere. Per-tick state hashes pinpoint the first divergent tick and system. A smaller step does not make results bit-exact."
    },
    {
      "q": "On a 144 Hz monitor the camera moves smoothly but physics objects visibly stutter. Physics runs at 50 Hz and the renderer draws each body at its latest simulated position. What fixes it?",
      "options": [
        "Run physics at 144 Hz so that a step lines up with every frame drawn",
        "Render each body interpolated between its last two physics states",
        "Lock the camera update to the physics rate so both move together",
        "Increase the solver iterations so that the bodies move more smoothly"
      ],
      "answer": 1,
      "explain": "With 50 ticks shown over 144 frames, bodies hold still for two or three frames and then jump. Interpolating by the accumulator fraction gives smooth motion at a one-tick delay. Tying physics to refresh rate costs CPU and breaks on other displays."
    },
    {
      "q": "Each time a player goes from a level back to the menu, memory grows by about 40 MB, although the level scene is unloaded. Which cause fits best?",
      "options": [
        "The texture streaming budget is raised automatically after every load",
        "The menu scene keeps its own duplicate of every asset the level used",
        "A static field or event subscription still references level objects",
        "Fragmentation means the freed memory is not reported in the capture"
      ],
      "answer": 2,
      "explain": "Unloading frees assets only when nothing references them, and a static or a forgotten event handler keeps the whole graph alive. A memory snapshot diff before and after the transition will show what is retaining them."
    },
    {
      "q": "An open-world game shows blurry textures for about half a second after every camera cut, but never during normal play. Which explanation and fix fit?",
      "options": [
        "The anisotropic filtering level is too low; raise it to the highest level",
        "The textures were compressed with ASTC; switch them back to RGBA32",
        "Occlusion culling hides the objects; rebake its data for the new cameras",
        "Texture streaming must load higher mips; prefetch at the cut's position"
      ],
      "answer": 3,
      "explain": "Streaming keeps only the mips the current view needs, so a sudden view change waits for higher mips to load. Telling the streamer about the upcoming camera position lets it load them in advance. Format and filtering do not cause a delay that clears by itself."
    },
    {
      "q": "A team ports a 100,000-entity system to an archetype ECS, and it ends up slower than before. The profiler shows most time outside the movement loop. Which practice most likely explains it?",
      "options": [
        "Adding and removing a tag component on many entities every frame",
        "Storing positions and velocities as separate component types",
        "Running the movement system as a parallel job over all chunks",
        "Querying for entities that have both Position and Velocity"
      ],
      "answer": 0,
      "explain": "Each add or remove is a structural change that copies the entity to another archetype, which is expensive at volume. An enabled flag or a value field avoids moving data. The other practices are what make ECS fast."
    },
    {
      "q": "An artist reports that a character's forearm collapses into a thin twisted shape whenever the wrist rotates close to 180 degrees. What is the standard explanation?",
      "options": [
        "The animation compression dropped too many keys on the wrist bone",
        "Linear blend skinning averages matrices, which collapses under twist",
        "The wrist IK chain lacks a pole vector, so it flips the forearm over",
        "The clips were blended in Euler angles instead of using quaternions"
      ],
      "answer": 1,
      "explain": "This is the candy-wrapper artifact of linear blend skinning: averaging two strongly rotated matrices shrinks the volume. Twist bones, dual-quaternion skinning or corrective shapes fix it. The pose itself is correct, so compression and blending are not the cause."
    },
    {
      "q": "In a server-authoritative shooter, which client message can the server safely accept as input?",
      "options": [
        "\"I hit player 7 in the head for 80 damage at time 12.4\"",
        "\"My position is now (104.2, 0, 33.8) after this movement\"",
        "\"Input 512: move stick at (0.7, 0.2), fire button held\"",
        "\"I collected the item with ID 44 and now carry 30 rounds\""
      ],
      "answer": 2,
      "explain": "Clients send intents and inputs; the server simulates them and decides the outcome. Reported hits, positions and inventory are results, and accepting them lets a modified client claim anything."
    },
    {
      "q": "Why do real-time strategy games with thousands of units per player often choose deterministic lockstep over sending entity state?",
      "options": [
        "It removes the need for any input delay, even on slow connections",
        "It allows each player's machine to use different floating-point code",
        "It makes cheating impossible because no client runs the simulation",
        "Bandwidth depends on the inputs sent, not on the number of units"
      ],
      "answer": 3,
      "explain": "Lockstep sends only player commands, so traffic stays small however many units exist. The cost is bit-exact determinism and input delay set by the slowest peer. Every client runs the full simulation, so it also exposes hidden information to cheaters."
    },
    {
      "q": "The profiler shows 2.5 ms per frame in raycasts. 400 agents each cast a line-of-sight ray against all layers out to 1,000 m every frame. Which change gives the biggest saving?",
      "options": [
        "Use layer masks, realistic ranges and staggered checks at a few Hz",
        "Replace every raycast with a sphere cast of the same length and mask",
        "Move the raycasts from the fixed update into the per-frame update",
        "Add continuous collision detection to all of the agents' colliders"
      ],
      "answer": 0,
      "explain": "Query cost depends on how many objects the broad phase must consider and how often you ask. Masks and shorter rays cut candidates, and perception rarely needs 60 Hz. Sphere casts cost more, and CCD affects simulation, not queries."
    },
    {
      "q": "A game is GPU-bound at 4K during a battle, with full-screen smoke and fire effects covering most of the view. A teammate proposes adding occlusion culling. Why is that unlikely to help much?",
      "options": [
        "Occlusion culling can only be used with fully static level geometry",
        "The cost is pixel overdraw from visible effects, not hidden objects",
        "Occlusion culling runs on the GPU and so adds to the bottleneck",
        "Culling only applies to shadows and not to the main camera view"
      ],
      "answer": 1,
      "explain": "Culling removes objects that are not visible; layered transparent effects that are on screen still shade every pixel they cover. Reducing particle overdraw, effect resolution or render resolution targets the actual cost."
    },
    {
      "q": "During large fights, players hear crackles. The audio profiler shows 180 active voices, each with its own reverb, and the audio thread missing its deadline. What should change?",
      "options": [
        "Increase the master volume so that the quieter voices stay audible",
        "Decompress all of the music into memory before the fight starts",
        "Limit voices by priority and route reverb through shared sends",
        "Move the audio mixing work onto the main thread to synchronise it"
      ],
      "answer": 2,
      "explain": "Crackles mean the mixer did not fill its buffer in time. A priority-based voice limit culls inaudible instances, and one shared reverb replaces 180 copies. Music decoding is minor here, and the main thread would make deadlines worse."
    },
    {
      "q": "A designer reports that quick taps on the dash button are sometimes ignored. The game renders at 120 fps, and the dash code checks 'button pressed this frame' inside a 50 Hz fixed step. What is the fix?",
      "options": [
        "Raise the fixed step to 120 Hz so that it runs on every rendered frame",
        "Add a larger radial dead zone to the stick that is used for dashing",
        "Read the button state only in the per-frame update and dash there",
        "Record the press each frame, then consume it in the next fixed step"
      ],
      "answer": 3,
      "explain": "A press that begins and ends between two fixed steps is never seen by a per-step check. Latching the press as an event and consuming it in the next step keeps gameplay in the fixed step without losing input. Matching the step to the refresh rate is costly and device-dependent."
    },
    {
      "q": "A homing missile turns with `rot = Quaternion.Slerp(rot, desired, turnRate * Time.deltaTime)`. During a 200 ms hitch it snaps straight onto the target heading, and it turns differently at 30 and 144 fps. What is the most robust fix?",
      "options": [
        "Use t = 1 - exp(-turnRate * dt) so t never exceeds 1",
        "Switch from Slerp to Lerp so the result is normalized",
        "Move the turning code into LateUpdate after animation",
        "Double turnRate and halve the speed of the missile"
      ],
      "answer": 0,
      "explain": "With a long dt the factor turnRate * dt can exceed 1, and Quaternion.Slerp clamps t, so the missile snaps straight onto the desired heading in one frame. Exponential decay keeps the factor below 1 and gives the same motion at any frame rate. Lerp, update order and retuning do not address the dt dependence."
    },
    {
      "q": "An open-world game generates terrain chunks as the player explores, using one seeded generator advanced chunk by chunk. Two players with the same seed see different terrain. What design fixes this?",
      "options": [
        "Generate every chunk on a background thread in parallel",
        "Store the generator state in the save file after each chunk",
        "Use a larger seed so collisions between worlds become rare",
        "Derive each chunk from hash(worldSeed, chunkX, chunkY)"
      ],
      "answer": 3,
      "explain": "A sequential generator makes each chunk depend on visit order. Hashing the seed with chunk coordinates makes every chunk a pure function of its position. Saving state only fixes one player, and threading makes ordering worse."
    },
    {
      "q": "A designer wants a UI badge to pop in, overshoot slightly and settle, and to retarget smoothly if a new value arrives mid-animation. Which approach fits best?",
      "options": [
        "A fixed ease-out tween restarted each time from the start",
        "An under-damped spring that keeps its velocity across retargets",
        "Exponential decay toward the target with a high rate in 1/s",
        "A critically damped SmoothDamp with a very short smoothTime"
      ],
      "answer": 1,
      "explain": "An under-damped spring overshoots and settles, and because it carries velocity a new target blends in without a jump. Restarting a tween pops, while exponential decay and critical damping never overshoot."
    },
    {
      "q": "Two clients desync. Bisection gives frame 5,812 as the first mismatch. At that frame physics, RNG state and economy hashes match and the AI hash differs. The AI picks targets from a hash set of unit pointers and runs a cheaper update for units far from the local camera. Which fix addresses the root cause on every platform?",
      "options": [
        "Send the AI hash every frame and let the host overwrite each client's AI state",
        "Iterate AI by entity id and base update rates on simulation state, not on the camera",
        "Give each client a different RNG stream for the AI so differences average out",
        "Lower the tick rate to 30 Hz so the AI has more time per tick to converge"
      ],
      "answer": 1,
      "explain": "Pointer-keyed iteration order and camera-based update rates are both inputs that differ per machine, and both enter the simulation. Stable ordering and sim-only rules remove them. Overwriting state from the host hides the difference and costs bandwidth every frame. Different RNG streams create more divergence, not less. A lower tick rate changes timing, not the source of the divergence."
    },
    {
      "q": "A game leaks about 140 MB per hour of play. The device budget is 3.0 GB, and the baseline after loading is 1.1 GB. The 3-minute smoke test passes. CI has a 40 minute window, and the build is deterministic and can run headless with bots. Which plan finds the leak before release?",
      "options": [
        "Run 40 real minutes and wait for the out-of-memory crash",
        "Raise the device budget to 8 GB so the leak stops mattering",
        "Repeat the 3-minute test 15 times so the leaks add up",
        "Run bots at 30x for 30 min and fail on memory slope"
      ],
      "answer": 3,
      "explain": "The budget leaves 1.9 GB, which is about 13.6 hours of leaking. Thirty minutes at 30x is 15 hours of play, and a slope check (MB per hour) fails long before memory runs out. Forty real minutes grows only about 93 MB and never crashes. A bigger budget postpones the failure to players with long sessions. Each repeated test restarts the process, so the leak never accumulates."
    },
    {
      "q": "A flank regression sits among 200 commits between a known good and a known bad build. A probe costs 6 min (4 min to fetch or build, 2 min to run the replay at 20x). The replay was recorded on the newest build and desyncs on older builds, because AI tuning changed in between. What is the plan?",
      "options": [
        "8 probes, about 48 min, with a test that asserts a gameplay invariant, not a state hash",
        "8 probes, about 48 min, comparing the final state hash with the newest build's hash",
        "100 probes, about 10 h, testing every second commit in order from the good build",
        "7 probes, about 42 min, since 2^7 is close enough to 200 commits"
      ],
      "answer": 0,
      "explain": "2^8 = 256 covers 200 commits, so 8 probes of 6 min is 48 min. The test must pass or fail on behaviour (for example, two units reach flank positions in 90 s), because an exact state hash will differ on older builds for reasons unrelated to the bug and mark every probe bad. Testing every second commit is a linear scan. Seven probes cover only 128 commits, so the answer could be missed."
    },
    {
      "q": "A phone build holds 60 fps for the first minute. After ten minutes the same scene runs at 40 fps. GPU time per frame rose from 12 ms to 17 ms and CPU time did not change. What is the most likely cause and the right response?",
      "options": [
        "A memory leak; add allocation tracking and reduce garbage per frame",
        "Thermal throttling; test after a soak and budget for sustained clocks",
        "Shader compilation; ship a pipeline cache to every device",
        "Driver bug; pin the quality settings to the lowest preset"
      ],
      "answer": 1,
      "explain": "Unchanged scene and CPU time with GPU time rising over minutes is the signature of clocks dropping as the chip heats up. Budget for sustained clocks, test after a 10 to 15 minute soak, and keep dynamic resolution as a guard. A leak would show growing memory and CPU time. Shader compilation hitches appear on first use, not as a gradual rise. Pinning the lowest preset hides the cause and lowers quality everywhere."
    },
    {
      "q": "You set up a CI perf test for a scene. Single runs on one device vary by about 6 percent. Which gate catches real regressions of 10 percent without constant false alarms?",
      "options": [
        "Fail if the average fps of one single run is below 60 on the device",
        "Fail if any single frame in the run exceeds the 16.7 ms budget",
        "Fail if median-of-3 replay p99 is 10 percent above the last green build",
        "Fail if the build size grows, since size tends to predict frame time"
      ],
      "answer": 2,
      "explain": "A deterministic replay, three runs and the median shrink the 6 percent noise, and comparing p99 against the last green build catches spikes and relative drift. A single-run average is noisy and hides spikes. A hard per-frame limit fails on any hitch the hardware produces on its own. Build size is unrelated to frame time."
    },
    {
      "q": "A 12 ms crowd-AI update will be time-sliced at 2 ms per frame at 60 fps. Agents use the result to steer. What is the side effect to plan for?",
      "options": [
        "Results arrive about 100 ms late, so validate or repair stale ones on delivery",
        "The total CPU cost drops to 2 ms, so the budget can be spent elsewhere",
        "Results arrive on the same frame, so no changes are needed in consumers",
        "The job must move to the GPU, because slices run only on the render thread"
      ],
      "answer": 0,
      "explain": "Six slices of 2 ms take 6 frames, about 100 ms, so a target may have moved. Stamp requests with a version and check on delivery. Slicing spreads the same 12 ms and does not reduce it. The result is not available the same frame. Slices run wherever the job runs, so no GPU move is needed."
    }
  ]
});
