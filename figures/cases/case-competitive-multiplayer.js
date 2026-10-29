window.TOPIC_PART = [
  {
    "id": "case-competitive-multiplayer",
    "title": "Case study: Competitive multiplayer game",
    "minutes": 18,
    "summary": "How a 1v1 fighting game and a 5v5 arena game stay fair and in sync: deterministic simulation, rollback, lockstep, server authority, matchmaking, and anti-cheat.",
    "lesson": [
      {
        "type": "p",
        "text": "Two players are 1,200 km apart with an 80 ms round trip. They are playing a 1v1 fighting game at 60 Hz, where a frame is 16.7 ms and a jab has 4 frames of startup. One-way latency is 40 ms, about 2.4 frames, so a naive game that waits for the opponent's input before simulating each frame puts every button press 2 to 3 frames late and stalls whenever a packet is delayed. Down the hall, ten players are in a 5v5 arena match and one of them runs a tool that draws enemy positions through walls. The tool works because the server sent those positions to every client. Competitive multiplayer is two problems: keeping players' views of one match consistent under latency, and making sure nobody can bend the result. Everything below is a choice between those two forces."
      },
      {
        "type": "h",
        "text": "Components"
      },
      {
        "type": "p",
        "text": "A competitive game splits into a **simulation** that decides what happens, a **netcode** layer that moves inputs or state between machines, and **services** around the match that decide who plays whom and keep the result honest. The simulation design determines which netcode is possible, and the netcode determines how much you must trust each client."
      },
      {
        "type": "list",
        "items": [
          "**Client:** samples input, runs the simulation (or a prediction of it), renders. Rendering never feeds back into the simulation.",
          "**Netcode layer:** peer-to-peer input exchange with rollback (fighting games), lockstep command exchange (RTS), or server snapshots with client prediction (MOBA, shooters).",
          "**Authoritative server (when used):** owns the true state, validates every input, filters what each client may see.",
          "**Matchmaker and rating service:** queues, rating updates, party and region rules.",
          "**Fleet and session allocator:** starts match servers or relays near the players and hands out signed connect tokens.",
          "**Replay store and anti-cheat pipeline:** match records, reports, statistical detection and review."
        ]
      },
      {
        "type": "h",
        "text": "Deterministic simulation"
      },
      {
        "type": "p",
        "text": "Rollback and lockstep both rest on one property: **the same inputs, applied in the same order to the same starting state, produce bit-identical results on every machine.** If that holds, you only ever send inputs, and a replay is just an input log. The rules are strict but few."
      },
      {
        "type": "list",
        "items": [
          "**Fixed timestep.** The simulation advances in whole frames at a fixed rate (60 Hz for fighting games), decoupled from rendering. The fixed-timestep loop from the engines section applies unchanged.",
          "**Controlled arithmetic.** Use integers or fixed-point (for example positions in 1/256 pixel) for everything that affects outcomes. Floats are deterministic only when the compiler, CPU flags and library functions match; `sin`, `pow` and other library functions, x87 versus SSE paths, and fused multiply-add contraction can differ across platforms. If you must use floats, ship one binary per platform family and test cross-play heavily.",
          "**Owned randomness.** The simulation owns a seeded generator stored inside the game state, for example xorshift32. Never call `UnityEngine.Random` or read `Time.time` in simulation code.",
          "**Fixed iteration order.** Iterate arrays by index. Dictionary or HashSet enumeration order, and sorting with unstable comparers or ties, can differ between runs and machines.",
          "**No outside inputs.** No physics engine with its own hidden state, no reading the frame rate, no threads that finish in varying order."
        ]
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "public struct Fighter { public int X, VX, Hp, Stun; }   // X in 1/256 px\npublic struct GameState {                           // plain data: copying it is saving it\n    public int Frame; public uint Rng;\n    public Fighter P1, P2;\n}\nstatic class Sim {\n    public static void Step(ref GameState s, ushort in1, ushort in2) {\n        s.Frame++;\n        Apply(ref s.P1, in1);                       // fixed order: P1 first, then P2\n        Apply(ref s.P2, in2);\n        if (Hit(s.P1, s.P2))\n            s.P2.Hp -= 80 + (int)(Rand(ref s.Rng) % 11);   // damage 80-90\n    }\n    static uint Rand(ref uint x) { x ^= x << 13; x ^= x >> 17; x ^= x << 5; return x; }\n}"
      },
      {
        "type": "p",
        "text": "Determinism fails quietly, so **detect desync** instead of hoping. Every peer computes a checksum of the game state each frame (a hash of the state struct, 4 bytes) and exchanges it with the inputs, or every 30 to 60 frames to save bandwidth. When checksums for the same frame differ, the peers know which frame diverged. Dump both states at the first bad frame, diff them field by field, and the culprit is usually a float function, an uninitialised field, an unordered collection or a stray `Random` call."
      },
      {
        "type": "h",
        "text": "Delay-based versus rollback netcode"
      },
      {
        "type": "p",
        "text": "The simple design is **delay-based**: do not simulate frame `f` until both players' inputs for `f` have arrived. Locally you hide latency by delaying your own input by `d` frames, and if the remote input for `f` is still in flight when frame `f` is due, the game freezes. With 40 ms one-way latency you need about 3 frames of delay, and with 120 ms one-way (a transatlantic link) about 7 frames, which is unplayable for a game whose moves are 3 to 5 frames long. Jitter makes it worse: one slow packet is a visible stutter for both players."
      },
      {
        "type": "p",
        "text": "**Rollback** (GGPO-style) never waits. Each frame the game does this:"
      },
      {
        "type": "list",
        "items": [
          "Sample local input and schedule it for frame `f + d`, where `d` is a small fixed input delay of 1 to 3 frames.",
          "For the remote player, use the real input if it has arrived. Otherwise **predict** it by repeating their last input. People hold directions and buttons for many frames, so most predictions are right and nothing has to be redone.",
          "Save a snapshot of the state, then simulate frame `f` and render it immediately.",
          "When a real remote input arrives for an old frame `g` and it differs from the prediction, **load the snapshot of frame `g`, then resimulate `g` to `f` with the corrected input**, all before drawing the next picture.",
          "Never roll back further than a limit of about 7 to 8 frames (roughly 120 to 130 ms). Past it the game pauses until the remote input catches up."
        ]
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "void Tick() {                                         // once per 16.7 ms\n    net.Poll();                                       // receive remote inputs\n    inputs.SetLocal(frame + inputDelay, pad.Sample());\n    if (frame - net.ConfirmedFrame > MaxRollback) return;   // stall, wait for the peer\n\n    int bad = inputs.FirstMispredicted();             // -1 if every guess was right\n    if (bad >= 0) {\n        state = ring[bad % Ring];                     // state before frame 'bad'\n        for (int f = bad; f < frame; f++) {\n            ring[f % Ring] = state;                   // re-save as we go\n            Sim.Step(ref state, inputs.Get(f, 0), inputs.Get(f, 1)); // real or predicted\n        }\n    }\n    ring[frame % Ring] = state;\n    Sim.Step(ref state, inputs.Get(frame, 0), inputs.Get(frame, 1));\n    frame++;\n    Render(state);                                    // draw once per tick, never mid-resim\n}"
      },
      {
        "type": "figure",
        "id": "mp-rollback",
        "caption": "The rollback is invisible to the player: the corrected frames F13 to F16 are recomputed in the same 16.7 ms window as the new frame, and the picture only ever shows the latest result.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 240\" role=\"img\" aria-label=\"Rollback timeline at 60 Hz. Frames F10 to F12 are confirmed, F13 to F16 were simulated with predicted remote input. A late real input for F13 arrives, differs from the prediction, the game restores the F13 snapshot and resimulates F13 to F16 in one frame.\"><style>.mp-rollback-t{font-size:13px;fill:var(--fig-ink)}.mp-rollback-s{font-size:12px;fill:var(--fig-muted)}.mp-rollback-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.mp-rollback-c{text-anchor:middle}.mp-rollback-e{text-anchor:end}.mp-rollback-ok{fill:var(--fig-ok);fill-opacity:.25;stroke:var(--fig-ok);stroke-width:1.5}.mp-rollback-pr{fill:var(--fig-warn);fill-opacity:.25;stroke:var(--fig-warn);stroke-width:1.5;stroke-dasharray:4 3}.mp-rollback-fu{fill:none;stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 4}.mp-rollback-bad{fill:var(--fig-bad);fill-opacity:.4;stroke:var(--fig-bad);stroke-width:2}.mp-rollback-pk{fill:var(--fig-panel);stroke:var(--fig-accent);stroke-width:2}.mp-rollback-rw{fill:none;stroke:var(--fig-accent);stroke-width:2.5;stroke-dasharray:1;stroke-dashoffset:0}.mp-rollback-ah{fill:var(--fig-accent)}.mp-rollback-ov{opacity:0;animation:mp-rollback-ov 7s ease infinite}@keyframes mp-rollback-ov{0%,58%{opacity:0}68%,88%{opacity:1}96%,100%{opacity:0}}.mp-rollback-mi{opacity:1;animation:mp-rollback-mi 7s ease infinite}@keyframes mp-rollback-mi{0%,18%{opacity:0}26%,56%{opacity:1}64%,100%{opacity:0}}.mp-rollback-in{opacity:1;animation:mp-rollback-in 7s ease infinite}@keyframes mp-rollback-in{0%,12%{opacity:0}20%,88%{opacity:1}96%,100%{opacity:0}}.mp-rollback-r1{animation:mp-rollback-r1 7s ease infinite}@keyframes mp-rollback-r1{0%,36%{stroke-dashoffset:1}56%,88%{stroke-dashoffset:0}96%,100%{stroke-dashoffset:0}}.mp-rollback-a1{opacity:1;animation:mp-rollback-a1 7s ease infinite}@keyframes mp-rollback-a1{0%,54%{opacity:0}58%,88%{opacity:1}96%,100%{opacity:0}}</style><text class=\"mp-rollback-h\" x=\"40\" y=\"20\">Local timeline at 60 Hz, one box = 16.7 ms</text><text class=\"mp-rollback-s mp-rollback-c\" x=\"140\" y=\"40\">confirmed: real inputs</text><text class=\"mp-rollback-s mp-rollback-c\" x=\"385\" y=\"40\">predicted: remote input = last input</text><text class=\"mp-rollback-s mp-rollback-c\" x=\"565\" y=\"40\">next</text><rect class=\"mp-rollback-ok\" x=\"40\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"70\" y=\"73\">F10</text><rect class=\"mp-rollback-ok\" x=\"110\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"140\" y=\"73\">F11</text><rect class=\"mp-rollback-ok\" x=\"180\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"210\" y=\"73\">F12</text><rect class=\"mp-rollback-pr\" x=\"250\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"280\" y=\"73\">F13</text><rect class=\"mp-rollback-pr\" x=\"320\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"350\" y=\"73\">F14</text><rect class=\"mp-rollback-pr\" x=\"390\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"420\" y=\"73\">F15</text><rect class=\"mp-rollback-pr\" x=\"460\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"490\" y=\"73\">F16</text><rect class=\"mp-rollback-fu\" x=\"530\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"560\" y=\"73\">F17</text><rect class=\"mp-rollback-bad mp-rollback-mi\" x=\"250\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><rect class=\"mp-rollback-ok mp-rollback-ov\" x=\"250\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><rect class=\"mp-rollback-ok mp-rollback-ov\" x=\"320\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><rect class=\"mp-rollback-ok mp-rollback-ov\" x=\"390\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><rect class=\"mp-rollback-ok mp-rollback-ov\" x=\"460\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><path class=\"mp-rollback-rw mp-rollback-r1\" pathLength=\"1\" d=\"M490 90C490 130 280 130 280 96\"/><path class=\"mp-rollback-ah mp-rollback-a1\" d=\"M280 91l-6 9h12z\"/><g class=\"mp-rollback-in\"><text class=\"mp-rollback-s mp-rollback-e\" x=\"440\" y=\"157\">input for F13 arrives while sim is at F16</text><rect class=\"mp-rollback-pk\" x=\"448\" y=\"140\" width=\"84\" height=\"24\" rx=\"6\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"490\" y=\"157\">F13: Punch</text></g><text class=\"mp-rollback-t\" x=\"40\" y=\"198\">Restore F13, replay F13 to F16 (4 steps), then run F17: 5 steps in one frame.</text><text class=\"mp-rollback-s\" x=\"40\" y=\"218\">At 1.5 ms per step that is 7.5 ms, so the frame budget of 16.7 ms still holds.</text></svg>"
      },
      {
        "type": "p",
        "text": "The numbers work out as follows. If one-way latency is `L` frames and input delay is `d`, an input arrives on time when `L <= d`, and you roll back about `L - d` frames otherwise. At 80 ms RTT (`L` = 2.4) with `d` = 2, a typical rollback is 0 to 1 frames. At 150 ms RTT (`L` = 4.5) it is 2 to 3 frames. A rollback of `n` frames costs `n + 1` simulation steps in one tick, so with a step cost of 1.5 ms and a render and engine budget of 8 ms, `n` = 4 uses 7.5 + 8 = 15.5 ms of 16.7. That is why fighting-game simulations are written to be tiny and allocation-free."
      },
      {
        "type": "p",
        "text": "Rollback needs **cheap save and load**. Keep the state in flat, blittable structs or arrays with no object references, so a snapshot is one `memcpy`. A ring buffer of 8 to 10 snapshots of 20 to 100 KB each costs about 1 MB at most and a few microseconds per save. State with pointers, GC objects or an engine scene graph is the thing that makes rollback hard to retrofit."
      },
      {
        "type": "callout",
        "kind": "warn",
        "text": "Anything with a side effect is outside the simulation and must tolerate being replayed. If a hit sound or particle burst is triggered inside `Step`, every resimulation of that frame plays it again, and a few consecutive rollbacks play it several times. Emit presentation events with a frame number and an id, deduplicate them, and cancel or retarget effects whose triggering frame was rolled back. Also keep animation state inside the rollback state, or characters will visibly pop on every correction."
      },
      {
        "type": "h",
        "text": "Lockstep for RTS-like games"
      },
      {
        "type": "p",
        "text": "When a game has thousands of units, state is too large to snapshot every frame and too large to send. **Deterministic lockstep** keeps the same determinism rules and sends only **commands** (select, move, build), a few bytes each. Time is divided into **turns** of about 100 to 200 ms. Commands issued during turn `N` are scheduled for turn `N + 2`, and each peer simulates turn `N` only after it has every player's command bundle for it. The wait for the next bundle is hidden behind the turn delay and by rendering with interpolation between simulation steps, which for RTS-scale games often run at only 8 to 20 Hz."
      },
      {
        "type": "p",
        "text": "Bandwidth is the point of the design. A state broadcast of 1,000 units at 20 bytes each and 20 Hz is about 400 KB/s per client. Lockstep with 8 players sending a handful of commands per second is a few hundred bytes per second, and it does not grow with unit count. The costs are that the whole game **runs at the pace of the slowest peer** (one lagging player slows everyone, or the game pauses), that any desync is fatal to the match, and that **every client holds the full true state**, so a map-hack can read hidden units from memory. That last cost is why games with hidden information choose a server instead."
      },
      {
        "type": "h",
        "text": "Server-authoritative state sync for a MOBA"
      },
      {
        "type": "p",
        "text": "In a 5v5 arena game the server runs the one true simulation at a fixed tick (about 30 Hz is common), and clients send **intents** (move here, cast ability 2 at this target), never results. The server validates each intent, advances the world and sends clients snapshots or deltas at 20 to 30 Hz within a budget of roughly 10 to 20 KB/s per client. The local hero is **predicted** on the client and reconciled when the server's state arrives, so movement feels instant, and other entities are drawn by **interpolation** about 100 ms in the past. For hit validation against rewound positions, see the FPS lag compensation case study; the same server-rewind idea applies to targeted abilities."
      },
      {
        "type": "p",
        "text": "Server authority costs one thing rollback does not: a dedicated machine per match, and a round trip before the server confirms things you cannot predict. It buys the one thing rollback cannot offer, which is **control over what each client knows**."
      },
      {
        "type": "h",
        "text": "Interest management and fog of war"
      },
      {
        "type": "p",
        "text": "**Interest management** means a client only receives the entities it is allowed to see. For fog of war the server keeps a **visibility grid per team**: a bitset with one bit per cell, such as 256 x 256 cells in 8 KB. Each tick it clears the grid, then for every vision source (hero, minion, ward, tower) it marks the cells in a circle around the source, skipping cells blocked by walls or terrain the source cannot see past. A circle of radius 10 cells is about 314 cells, so 60 sources cost around 19,000 bit writes: microseconds. An enemy entity is included in a team's snapshot only if its cell bit is set."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "void UpdateVision(Team t) {\n    t.Visible.ClearAll();                              // 256 x 256 bits = 8 KB\n    foreach (var u in t.Units)\n        MarkCircleWithLineOfSight(t.Visible, u.Cell, u.VisionRadiusCells);\n}\nIEnumerable<Entity> Replicable(Client c) {\n    foreach (var e in world.Entities)\n        if (e.Team == c.Team || c.Team.Visible.Get(e.Cell))\n            yield return e;                           // hidden enemies are never serialised\n}"
      },
      {
        "type": "p",
        "text": "The important property is that hidden data **never leaves the server**. Encrypting packets or obfuscating IDs does not stop a wallhack, because the client has to decrypt what it uses. Filtering has side effects to design for. Entities pop into existence at the edge of vision, so send a short pre-reveal margin for smooth fade-in only if the hidden position is not exploitable. The same filter must cover events: a spell cast, a footstep sound or a ping marker carries a position, and broadcasting it to everyone leaks what the entity filter hides. Keep a per-client last-seen memory (a ghost marker) on the client, built only from information it was allowed to see."
      },
      {
        "type": "h",
        "text": "Ratings: Elo and its successors"
      },
      {
        "type": "p",
        "text": "A rating system turns match results into a number that predicts results. **Elo** gives player A an expected score `E = 1 / (1 + 10^((Rb - Ra) / 400))`, which is the win probability (draws count half), and updates `R' = R + K * (S - E)`, where `S` is 1 for a win, 0.5 for a draw and 0 for a loss. The constant 400 sets the scale: a 400-point gap means E of about 0.91. With `K` = 32, a 1600 player beating a 1400 player (`E` = 0.76) gains only 7.7 points, while losing costs 24.3. Updates are zero-sum between the two players, and they correct themselves: results that match expectation barely move ratings, and upsets move them a lot."
      },
      {
        "type": "figure",
        "id": "mp-elo-curve",
        "caption": "The curve is steepest near equal ratings, where every game is informative; far from the middle the outcome is almost known, so the favourite gains little for a win and loses a lot for a loss.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 296\" role=\"img\" aria-label=\"Elo expected score curve. The expected score of player A rises from about 0.09 at minus 400 rating points to 0.5 at equal rating and 0.91 at plus 400. At plus 200 it is 0.76, so with K equal to 32 a win gains 7.7 points and a loss costs 24.3.\"><style>.mp-elo-curve-t{font-size:13px;fill:var(--fig-ink)}.mp-elo-curve-s{font-size:12px;fill:var(--fig-muted)}.mp-elo-curve-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.mp-elo-curve-c{text-anchor:middle}.mp-elo-curve-e{text-anchor:end}.mp-elo-curve-ax{stroke:var(--fig-line);stroke-width:1.5}.mp-elo-curve-gd{stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 5}.mp-elo-curve-cv{fill:none;stroke:var(--fig-accent);stroke-width:2.5;stroke-linejoin:round}.mp-elo-curve-mk{fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2}.mp-elo-curve-dt{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:mp-elo-curve-dt 8s linear infinite}.mp-elo-curve-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.mp-elo-curve-w{font-size:14px;font-weight:600;fill:var(--fig-ok)}.mp-elo-curve-l{font-size:14px;font-weight:600;fill:var(--fig-bad)}@keyframes mp-elo-curve-dt{0%{transform:translate(70px,221.8px)}5%{transform:translate(86.5px,217.6px)}10%{transform:translate(103px,212.6px)}15%{transform:translate(119.5px,206.7px)}20%{transform:translate(136px,199.8px)}25%{transform:translate(152.5px,191.9px)}30%{transform:translate(169px,183.1px)}35%{transform:translate(185.5px,173.2px)}40%{transform:translate(202px,162.6px)}45%{transform:translate(218.5px,151.5px)}50%{transform:translate(235px,140px)}55%{transform:translate(251.5px,128.5px)}60%{transform:translate(268px,117.4px)}65%{transform:translate(284.5px,106.8px)}70%{transform:translate(301px,96.9px)}75%{transform:translate(317.5px,88.1px)}80%{transform:translate(334px,80.2px)}85%{transform:translate(350.5px,73.3px)}90%{transform:translate(367px,67.4px)}95%{transform:translate(383.5px,62.4px)}100%{transform:translate(400px,58.2px)}}</style><text class=\"mp-elo-curve-h\" x=\"70\" y=\"22\">Expected score of A, E = 1 / (1 + 10^(-diff / 400))</text><line class=\"mp-elo-curve-gd\" x1=\"70\" y1=\"140\" x2=\"400\" y2=\"140\"/><line class=\"mp-elo-curve-gd\" x1=\"235\" y1=\"40\" x2=\"235\" y2=\"240\"/><line class=\"mp-elo-curve-ax\" x1=\"70\" y1=\"40\" x2=\"70\" y2=\"240\"/><line class=\"mp-elo-curve-ax\" x1=\"70\" y1=\"240\" x2=\"400\" y2=\"240\"/><text class=\"mp-elo-curve-s mp-elo-curve-e\" x=\"62\" y=\"44\">1</text><text class=\"mp-elo-curve-s mp-elo-curve-e\" x=\"62\" y=\"144\">0.5</text><text class=\"mp-elo-curve-s mp-elo-curve-e\" x=\"62\" y=\"244\">0</text><text class=\"mp-elo-curve-s mp-elo-curve-c\" x=\"70\" y=\"260\">-400</text><text class=\"mp-elo-curve-s mp-elo-curve-c\" x=\"235\" y=\"260\">0</text><text class=\"mp-elo-curve-s mp-elo-curve-c\" x=\"400\" y=\"260\">+400</text><text class=\"mp-elo-curve-s mp-elo-curve-c\" x=\"235\" y=\"282\">rating difference, A minus B</text><polyline class=\"mp-elo-curve-cv\" points=\"70,221.8 78.3,219.8 86.5,217.6 94.8,215.2 103,212.6 111.3,209.8 119.5,206.7 127.8,203.4 136,199.8 144.3,196 152.5,191.9 160.8,187.6 169,183.1 177.3,178.2 185.5,173.2 193.8,168 202,162.6 210.3,157.1 218.5,151.5 226.8,145.8 235,140 243.3,134.2 251.5,128.5 259.8,122.9 268,117.4 276.3,112 284.5,106.8 292.8,101.8 301,96.9 309.3,92.4 317.5,88.1 325.8,84 334,80.2 342.3,76.6 350.5,73.3 358.8,70.2 367,67.4 375.3,64.8 383.5,62.4 391.8,60.2 400,58.2\"/><line class=\"mp-elo-curve-gd\" x1=\"317.5\" y1=\"88.1\" x2=\"317.5\" y2=\"240\"/><line class=\"mp-elo-curve-gd\" x1=\"70\" y1=\"88.1\" x2=\"317.5\" y2=\"88.1\"/><circle class=\"mp-elo-curve-mk\" cx=\"317.5\" cy=\"88.1\" r=\"5.5\"/><text class=\"mp-elo-curve-t\" x=\"326.5\" y=\"110.1\">E = 0.76</text><circle class=\"mp-elo-curve-dt\" cx=\"0\" cy=\"0\" r=\"5\" transform=\"translate(70,221.8)\"/><rect class=\"mp-elo-curve-pn\" x=\"424\" y=\"40\" width=\"200\" height=\"200\" rx=\"12\"/><text class=\"mp-elo-curve-h\" x=\"440\" y=\"66\">A 1600 vs B 1400</text><text class=\"mp-elo-curve-s\" x=\"440\" y=\"86\">diff +200, so E(A) = 0.76</text><text class=\"mp-elo-curve-t\" x=\"440\" y=\"118\">K = 32</text><text class=\"mp-elo-curve-w\" x=\"440\" y=\"144\">A wins: +7.7</text><text class=\"mp-elo-curve-l\" x=\"440\" y=\"168\">A loses: -24.3</text><text class=\"mp-elo-curve-s\" x=\"440\" y=\"200\">The favourite risks more</text><text class=\"mp-elo-curve-s\" x=\"440\" y=\"218\">than it can gain.</text></svg>"
      },
      {
        "type": "p",
        "text": "Plain Elo treats a new player and a veteran with 2,000 games identically, so new accounts take many games to converge and returning players are misrated. **Glicko** adds a **rating deviation** (RD), a measure of uncertainty that is large for new or inactive players and shrinks as they play, so their rating moves fast at first. **Glicko-2** also tracks volatility. **TrueSkill** models each player as a Gaussian with mean and deviation, which also handles teams and free-for-alls; matchmaking can use a conservative estimate such as mean minus 3 standard deviations. For 5v5 you need a team rating (an average, or a model that learns each player's contribution), and ranked ladders usually show a coarser tier derived from the hidden rating."
      },
      {
        "type": "h",
        "text": "Matchmaking: queues, windows, regions and parties"
      },
      {
        "type": "p",
        "text": "A matchmaker balances **match quality** (close ratings, low ping) against **wait time**. The standard mechanism is a **search window around each queued player that widens with time**. A new ticket accepts only rating differences of about 50 and ping under 60 ms. Every few seconds the window grows, and it is capped so that a 1500 player never gets a 2300 opponent. Two tickets match when each one's window contains the other. This is the cheapest way to be fast when the queue is full and still finish when it is empty."
      },
      {
        "type": "figure",
        "id": "mp-mm-window",
        "caption": "At peak hours the match is found in the first few steps; off-peak the window keeps growing until a candidate fits, but a candidate with bad ping is rejected at any width.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"Matchmaking search window for a 1500 rated player. The accepted rating band starts at plus or minus 50 and widens by 25 every 5 seconds up to 300. A candidate at 1720 is found at 35 seconds, while a candidate at 1560 with 180 ms ping is skipped.\"><style>.mp-mm-window-t{font-size:13px;fill:var(--fig-ink)}.mp-mm-window-s{font-size:12px;fill:var(--fig-muted)}.mp-mm-window-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.mp-mm-window-c{text-anchor:middle}.mp-mm-window-e{text-anchor:end}.mp-mm-window-ax{stroke:var(--fig-line);stroke-width:1.5}.mp-mm-window-gd{stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 5}.mp-mm-window-bd{fill:var(--fig-accent);fill-opacity:.08;stroke:var(--fig-accent);stroke-opacity:.7;stroke-width:1.5}.mp-mm-window-st{fill:var(--fig-accent);fill-opacity:.3;opacity:0;animation:mp-mm-window-st 6s ease infinite}@keyframes mp-mm-window-st{0%{opacity:0}10%,70%{opacity:1}88%,100%{opacity:0}}.mp-mm-window-ok{fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2}.mp-mm-window-rg{fill:none;stroke:var(--fig-ok);stroke-width:2;transform-box:fill-box;transform-origin:center;animation:mp-mm-window-rg 2.4s ease-out infinite}@keyframes mp-mm-window-rg{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.4);opacity:0}}.mp-mm-window-x{stroke:var(--fig-bad);stroke-width:2.5;stroke-linecap:round}</style><text class=\"mp-mm-window-h\" x=\"70\" y=\"20\">Search window for a 1500-rated player</text><text class=\"mp-mm-window-s\" x=\"70\" y=\"36\">starts at ±50, grows 25 every 5 s, capped at ±300 (example numbers)</text><rect class=\"mp-mm-window-st\" style=\"animation-delay:0s\" x=\"70\" y=\"133\" width=\"44.2\" height=\"34\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:0.3s\" x=\"114.2\" y=\"124.5\" width=\"44.2\" height=\"51\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:0.6s\" x=\"158.3\" y=\"116\" width=\"44.2\" height=\"68\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:0.9s\" x=\"202.5\" y=\"107.5\" width=\"44.2\" height=\"85\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:1.2s\" x=\"246.7\" y=\"99\" width=\"44.2\" height=\"102\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:1.5s\" x=\"290.8\" y=\"90.5\" width=\"44.2\" height=\"119\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:1.8s\" x=\"335\" y=\"82\" width=\"44.2\" height=\"136\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:2.1s\" x=\"379.2\" y=\"73.5\" width=\"44.2\" height=\"153\"/><path class=\"mp-mm-window-bd\" d=\"M70 133 L114.2 133 L114.2 124.5 L158.3 124.5 L158.3 116 L202.5 116 L202.5 107.5 L246.7 107.5 L246.7 99 L290.8 99 L290.8 90.5 L335 90.5 L335 82 L379.2 82 L379.2 73.5 L423.3 73.5 L423.3 65 L467.5 65 L467.5 56.5 L511.7 56.5 L511.7 48 L555.8 48 L555.8 48 L600 48 L600 252 L555.8 252 L555.8 252 L511.7 252 L511.7 243.5 L467.5 243.5 L467.5 235 L423.3 235 L423.3 226.5 L379.2 226.5 L379.2 218 L335 218 L335 209.5 L290.8 209.5 L290.8 201 L246.7 201 L246.7 192.5 L202.5 192.5 L202.5 184 L158.3 184 L158.3 175.5 L114.2 175.5 L114.2 167 L70 167Z\"/><line class=\"mp-mm-window-gd\" x1=\"70\" y1=\"150\" x2=\"600\" y2=\"150\"/><line class=\"mp-mm-window-ax\" x1=\"70\" y1=\"48\" x2=\"70\" y2=\"262\"/><line class=\"mp-mm-window-ax\" x1=\"70\" y1=\"262\" x2=\"600\" y2=\"262\"/><text class=\"mp-mm-window-s mp-mm-window-e\" x=\"62\" y=\"154\">1500</text><text class=\"mp-mm-window-s mp-mm-window-e\" x=\"62\" y=\"52\">1800</text><text class=\"mp-mm-window-s mp-mm-window-e\" x=\"62\" y=\"256\">1200</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"70\" y=\"278\">0</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"202.5\" y=\"278\">15</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"335\" y=\"278\">30</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"467.5\" y=\"278\">45</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"600\" y=\"278\">60</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"335\" y=\"296\">seconds in queue</text><circle class=\"mp-mm-window-rg\" cx=\"379.2\" cy=\"75.2\" r=\"6\"/><circle class=\"mp-mm-window-ok\" cx=\"379.2\" cy=\"75.2\" r=\"6\"/><text class=\"mp-mm-window-t\" x=\"383.2\" y=\"98\">found at 35 s: rating 1720</text><line class=\"mp-mm-window-x\" x1=\"171\" y1=\"124.6\" x2=\"181\" y2=\"134.6\"/><line class=\"mp-mm-window-x\" x1=\"181\" y1=\"124.6\" x2=\"171\" y2=\"134.6\"/><text class=\"mp-mm-window-s\" x=\"188\" y=\"133.6\">rating fits, ping 180 ms: skipped</text></svg>"
      },
      {
        "type": "list",
        "items": [
          "**Region and ping.** Hard-constrain latency (for rollback, a cap around 100 to 120 ms RTT so rollback stays under the limit). Relax the cap slowly, or never, but widen rating first since it harms fairness less than a 250 ms game.",
          "**Parties.** A premade group coordinates by voice, so rate a party above the average of its members, queue it against parties of similar size, and use the highest member as an input rather than the mean.",
          "**Team balance.** For 10 solo players there are 252 ways to choose a team of 5, which is 126 distinct 5v5 splits. Enumerate them and pick the split with the smallest rating gap, with a penalty for role clashes.",
          "**Roles and modes.** A role queue is a separate queue per role, so wait is set by the scarcest role."
        ]
      },
      {
        "type": "h",
        "text": "Server fleet and session allocation"
      },
      {
        "type": "p",
        "text": "When the matchmaker has a full lobby it asks a **session allocator** for a server. The allocator picks the region that minimises the worst player's ping, takes a **pre-warmed** server process from a pool (starting a process and loading a map can take 10 to 30 seconds, too long to put in front of players), marks it busy and returns an address. Each player gets a **signed connect token**, valid for about 30 seconds and bound to match id, player id and team, so only the ten intended players can join. One match is one process, often one or two cores for a 5v5 at 30 Hz, so capacity planning is: concurrent matches times cores, plus 10 to 20 percent of warm headroom for spikes."
      },
      {
        "type": "p",
        "text": "Region choice uses measured ping, not geography. At login each client probes the regional endpoints with a few UDP echo packets and reports the results with its queue ticket. For 1v1 rollback games, a direct peer-to-peer connection saves a server hop, but players behind strict NAT need a relay, and a relay is also how a service can see and arbitrate the input stream."
      },
      {
        "type": "h",
        "text": "Anti-cheat and ranked integrity"
      },
      {
        "type": "p",
        "text": "The first principle is **never trust the client**. The client is code on a machine the player controls, so anything it reports (position, damage, cooldown, \"I hit him\") is a claim, not a fact. The design response is to make the client send **intents** and let the server compute outcomes. The rest follows from that."
      },
      {
        "type": "list",
        "items": [
          "**Server validation.** Reject movement faster than max speed times elapsed time plus a small tolerance, abilities used while on cooldown or without mana, and targets that are not in range or not visible to the caster.",
          "**Rate checks.** Cap command rates (say 20 to 30 per second), and flag inhuman patterns such as perfectly regular 1-frame timing or reaction times under 100 ms sustained.",
          "**Less to steal.** Interest management, covered above, removes the wallhack target. Peer-to-peer rollback cannot hide state, so fighting games accept it and rely on there being no hidden information.",
          "**Replay review.** Store every ranked match so a report can be checked by automated detectors and, for borderline cases, by humans.",
          "**Client-side anti-cheat** (integrity checks, kernel drivers) raises the cost of cheating but is an extra layer, never the foundation."
        ]
      },
      {
        "type": "p",
        "text": "**Replays** are the pay-off of determinism. For a lockstep or rollback game, a replay is the build version, the initial state and seed, and the input of every player for every frame: 2 players, 2 bytes each, 60 frames per second is 240 bytes per second, about 43 KB for a 3-minute match before compression. Store a full snapshot every 10 seconds so the viewer can seek. A replay only plays on the build that recorded it unless you keep old simulation versions, so tag every file with its version. Server-authoritative games usually record the server's event stream instead. **Spectating** works on the same data but is **delayed** (30 seconds to a few minutes in ranked) because a live feed with full information lets a teammate or stream viewer relay enemy positions."
      },
      {
        "type": "p",
        "text": "Ranked integrity also needs rules around the people. **Leavers**: allow a reconnect window (for example 60 to 120 seconds), then count an abandon, penalise it with queue lockouts that escalate, and shield teammates by reducing their rating loss. **Smurfs** are experienced players on new accounts. Signals are an unusually high win rate and kill share in the first 20 games, rating that climbs 300 points quickly, and links by device or payment account. The system response is not a ban but faster convergence: because a new account starts with high uncertainty, its rating moves quickly and it leaves the beginners' pool in a few games."
      },
      {
        "type": "callout",
        "kind": "warn",
        "text": "Peer-to-peer ranked play has an arbitration hole. If checksums diverge at frame 3,000, each peer's state says the other one is wrong and you cannot tell which machine cheated or just had a bug. Have clients report checksums to a service, or route inputs through a relay that can replay them, and define up front that an unresolved desync is a no-contest with no rating change. Otherwise either side can force it to cost the opponent rating."
      },
      {
        "type": "h",
        "text": "Decisions and why they work"
      },
      {
        "type": "list",
        "items": [
          "**Rollback for 1v1, not delay-based.** Local inputs are never delayed by the network, so the game feels like offline play up to a cap of about 7 to 8 frames. The cost is a simulation that is deterministic, cheap to copy and fast enough to replay up to 9 times a frame.",
          "**60 Hz fixed simulation, decoupled from rendering.** Frames are the unit of input, rollback and replay. Tying to the render loop makes monitors and frame drops change the game.",
          "**Integers or fixed-point in the simulation.** Bit-identical results on every platform without relying on compiler flags. The alternative is floats plus a test matrix and a desync hunt for each new platform.",
          "**Predict by repeating the last input.** Held inputs dominate human play, so most predictions are correct and no rollback happens. More elaborate predictors add complexity for little gain.",
          "**1 to 3 frames of fixed input delay.** It converts some rollbacks into on-time inputs and caps resim cost. Zero delay maximises visible corrections, and too much delay is the old delay-based problem.",
          "**Lockstep for RTS.** Bandwidth is independent of unit count. The alternative, state sync with thousands of units, needs aggressive prioritisation and costs tens to hundreds of KB/s.",
          "**Server authority and visibility filtering for MOBAs.** It removes whole cheat classes by construction. Client-side checks are always bypassable, since the cheater controls the client.",
          "**Send intents, not results.** A server can validate a command; it cannot validate \"I dealt 400 damage\".",
          "**Widening window plus hard ping cap.** Queues stay short for most players and everyone eventually matches, while the worst-ping matches are never made.",
          "**Pre-warmed server pool and signed tokens.** Players see no boot time, and only their own match's players can connect.",
          "**Delayed spectating.** It keeps a live information feed from becoming a ghosting tool."
        ]
      },
      {
        "type": "callout",
        "kind": "agent",
        "text": "Delegate the mechanical, testable parts: the snapshot ring buffer, input queue and misprediction detection, a network conditioner that injects latency, jitter and loss, a replay recorder and player, and unit tests for Elo or Glicko updates. Verify the properties a model gets subtly wrong. Run the same input log twice, and on two platforms, and compare per-frame checksums. Run a randomised test where a session with random delays and rollbacks must end in the same state as a zero-latency one. Grep the simulation assembly for `float`, `Dictionary`, `UnityEngine.Random`, `Time.` and LINQ, and check in the Profiler that `Step` allocates nothing. Ask for the simulation in its own assembly definition so presentation code cannot reach in. Keep matchmaking and anti-cheat thresholds (windows, penalties, tolerances) in config that you tune from real data, not constants the agent picked."
      },
      {
        "type": "p",
        "text": "The through-line is to decide first what the simulation can be: small and deterministic (rollback), large and deterministic (lockstep) or secret (server authority). Latency hiding, trust, bandwidth, replays and cheating all follow from that one choice."
      },
      {
        "type": "patterns",
        "patterns": [
          {
            "signal": "1v1 game, state under ~100 KB, players notice any input lag, ping to peers around 40 to 120 ms",
            "use": "Rollback netcode with 1-3 frames of input delay",
            "why": "Local input is never held back, and a wrong prediction is repaired by replaying a few frames inside one frame budget. It needs deterministic, cheap-to-copy state."
          },
          {
            "signal": "Thousands of units, state too big to snapshot or send, bandwidth is the limit",
            "use": "Deterministic lockstep, send commands only",
            "why": "Bandwidth depends on commands per second, not on unit count. The game then runs at the slowest peer's pace and every client holds the full state."
          },
          {
            "signal": "Players report wallhacks, and enemy positions outside vision are present in packets",
            "use": "Filter replication by team visibility, server-side",
            "why": "Hidden data that never leaves the server cannot be read. Encryption and obfuscation fail because the client must decode what it uses. Filter events and sounds too."
          },
          {
            "signal": "Checksums differ at frame N although both peers logged identical inputs",
            "use": "Dump both states at the first bad frame and diff",
            "why": "The first mismatching field names the cause: a float function, an unordered collection, an uninitialised value or a stray random call. Later frames only show knock-on damage."
          },
          {
            "signal": "Top-rated players wait minutes off-peak while mid-ladder players match in seconds",
            "use": "Widen the rating window as queue time grows",
            "why": "A window that starts tight and relaxes in steps gives close matches when the pool is deep and still finishes when it is thin. Cap the width and keep the ping limit fixed."
          },
          {
            "signal": "A client message says what happened: damage dealt, position reached, item gained",
            "use": "Accept only inputs and validate on the server",
            "why": "The server cannot verify a claimed result, but it can compute the result from an intent and reject impossible ones: too fast, on cooldown, out of range, not visible."
          },
          {
            "signal": "Support needs to reproduce a disputed match from last week or review a cheating report",
            "use": "Record versioned inputs and replay them",
            "why": "A deterministic simulation turns the build id, seed and per-frame inputs into the whole match, about 240 B/s for 2 players. Without the version tag, patches break old replays."
          },
          {
            "signal": "New accounts win 85 percent of games and gain 300 rating points in their first 20 matches",
            "use": "Flag a likely smurf and converge its rating fast",
            "why": "High uncertainty makes a rating move quickly, so the player leaves the beginner pool in a few games. Combine with device and behaviour signals before any sanction."
          }
        ]
      }
    ],
    "keyPoints": [
      "Rollback and lockstep need a deterministic simulation: fixed timestep, integer or fixed-point math, owned seeded RNG, fixed iteration order, and per-frame state checksums to catch desync.",
      "Rollback predicts remote input by repeating the last one, restores a saved snapshot when the real input differs and resimulates up to about 7 to 8 frames in one frame budget, using 1 to 3 frames of input delay.",
      "Lockstep sends only commands, so bandwidth ignores unit count, but the game runs at the slowest peer and every client holds the full state.",
      "A server-authoritative MOBA accepts intents, validates them and filters replication by per-team visibility so hidden enemies are never sent.",
      "Elo updates R' = R + K(S - E) with E = 1/(1+10^((Rb-Ra)/400)); Glicko and TrueSkill add uncertainty, and a queue window that widens with wait time trades quality for speed.",
      "Replays are versioned input logs, spectating is delayed, and ranked integrity covers desync arbitration, leaver penalties and smurf detection."
    ],
    "quiz": [
      {
        "q": "A rollback build passes tests on one platform, but a Windows and Android match desyncs after ~20 s. Inputs match, and the first bad checksum lands on a frame where a projectile uses `Mathf.Sin`. What is the right fix?",
        "options": [
          "Raise input delay from 2 to 4 frames so peers stay in step",
          "Use fixed-point or table-based trig in the simulation",
          "Send the full state to the guest every second to resync",
          "Lower MaxRollback so that fewer frames can diverge"
        ],
        "answer": 1,
        "explain": "Float transcendental functions can differ between CPUs and runtimes, so the same inputs yield different bits. Fixed-point or integer tables make every platform agree. More delay and a lower rollback cap change timing, not arithmetic, and periodic resync hides a bug that corrupts the match anyway."
      },
      {
        "q": "The simulation is at frame 134 using predicted input. The real remote input for frame 130 arrives and differs from the guess. What does a rollback client do?",
        "options": [
          "Teleport the opponent to where they should be at frame 134",
          "Pause and wait until all inputs up to frame 134 are confirmed",
          "Replay frame 130 to 134 on top of the current state",
          "Restore the frame 130 snapshot and resimulate to 134"
        ],
        "answer": 3,
        "explain": "The snapshot of the state before frame 130 plus corrected inputs reproduces what should have happened, and all five steps fit in one tick. Teleporting the character ignores knock-on effects such as hits and RNG draws, waiting is delay-based netcode, and replaying onto the current state applies frames twice."
      },
      {
        "q": "Players of a 5v5 arena game use a tool that shows enemy heroes behind fog. The server broadcasts the same snapshot to all ten clients. Which change closes the hole?",
        "options": [
          "Filter snapshots per team by server-side visibility",
          "Encrypt the snapshot with a per-match key held by the client",
          "Randomise entity IDs each tick so tools cannot track heroes",
          "Have the client hide fogged heroes and trust it to do so"
        ],
        "answer": 0,
        "explain": "Data that is never sent cannot be read from memory or traffic. Encryption and ID shuffling fail because the client must decode and use the data, and a client-side hide is exactly what a cheat patches out."
      },
      {
        "q": "Using R' = R + K(S - E) with K = 20, a 1700 player beats a 1500 player. E for the winner is about 0.76. How many points does the winner gain?",
        "options": [
          "+10.0",
          "+15.2",
          "+4.8",
          "+0.8"
        ],
        "answer": 2,
        "explain": "The gain is K times (1 - 0.76) = 20 x 0.24 = 4.8. +10 would be the gain for an evenly matched game, and +15.2 is what the favourite would lose with a defeat. A win against a weaker player moves the rating little."
      },
      {
        "q": "An RTS has 3,000 units and 8 players. The team wants the lowest possible bandwidth and accepts a deterministic simulation. Which tradeoff comes with the lockstep design they pick?",
        "options": [
          "Snapshots of every unit must be sent to keep clients in sync",
          "The game advances only as fast as the slowest peer's commands arrive",
          "The server must filter units so that hidden ones are never sent",
          "Each client may run a different tick rate, set by its own CPU"
        ],
        "answer": 1,
        "explain": "A turn cannot execute until every player's command bundle for it has arrived, so the slowest peer sets the pace. Lockstep sends commands, not unit snapshots, needs identical ticks on all machines, and gives each client the full state, so filtering is not possible."
      },
      {
        "q": "Ranked queue data: at 4 am the top 1 percent wait 6 minutes while average players match in 20 seconds. Designers do not want top players matched with beginners. Which move fits?",
        "options": [
          "Lower K so that ratings change less and look closer together",
          "Remove the ping limit so that more players qualify at 4 am",
          "Widen the rating window in steps as queue time grows, with a cap",
          "Move to lockstep so that fewer server resources are needed"
        ],
        "answer": 2,
        "explain": "A capped window that widens with wait time keeps matches close when the pool is deep and still finishes when it is thin. K changes how fast ratings move, not who is in the queue, lockstep is a netcode choice, and dropping the ping limit creates bad games for everyone."
      }
    ]
  }
];
