window.TOPIC_PART = [
  {
    "id": "case-profiling-games",
    "title": "Case study: Profiling a game",
    "minutes": 18,
    "summary": "One investigation from symptom to fix: budget the frame, read percentiles, find the bound lane, fix CPU spikes and GPU cost, and keep the gain with replay-based CI budgets.",
    "lesson": [
      {
        "type": "p",
        "text": "An action game runs at 60 fps on every dev PC. In one arena it shows about 45 fps on the target console and a mid-range phone, plus a hitch of 40 to 70 ms every few seconds. QA files it as 'arena 3 feels bad'. Nobody can say whether the code, the art or the hardware is at fault. This case study follows that one investigation from symptom to fix, and the answer turns out to be two separate problems: a steady GPU cost and a periodic CPU spike. The method is engine-agnostic. The tools named (Tracy, Superluminal, Unreal Insights, PIX, RenderDoc, Instruments, Android profilers) exist for most engines and platforms, and the numbers are illustrative."
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
        "text": "In the case study the arena 3 run gives: average 22.2 ms, p50 21 ms, p99 38 ms, max 71 ms, 1% low about 22 fps. The graph shows two things at once. Most frames sit just above the budget line (a steady cost), and a few tall bars rise out of the pack (spikes). Then measure the interval between spikes: they come every 4 seconds, give or take. A regular period points at something driven by a timer or a counter filling up, such as a garbage collector, an autosave, a periodic AI replan or a streaming tick. Random spikes point at content: the first use of an effect, a cell loading."
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
];
