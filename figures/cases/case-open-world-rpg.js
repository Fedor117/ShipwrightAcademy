window.TOPIC_PART = [
  {
    "id": "case-open-world-rpg",
    "title": "Case study: Open-world RPG",
    "minutes": 18,
    "summary": "How an open-world RPG streams a world too big to hold, keeps float precision and simulation cost under control, and stores content, rules and saves as data.",
    "lesson": [
      {
        "type": "p",
        "text": "A player gallops across a valley. Twenty seconds ago the town behind them had 200 NPCs, 3,000 props and a half-finished quest. Now none of it is in memory. Yet the shopkeeper they insulted must still be angry when they ride back an hour later, and the barrel they moved must still sit where they left it. An open-world RPG is built around that promise: the world is far larger than the machine can hold or simulate, and the player must never see the seams. This teardown follows one such game, described generically, from the streaming grid down to the save file."
      },
      {
        "type": "h",
        "text": "Components"
      },
      {
        "type": "list",
        "items": [
          "**Streaming.** A grid of cells around the player. Cells load and unload within a memory budget.",
          "**Rendering LOD.** LODs, HLOD proxies, impostors and terrain tiles keep distant scenery cheap.",
          "**World space.** A floating origin keeps coordinates small enough for single-precision floats.",
          "**Simulation LOD.** Full AI near the player, coarse schedules further out, plain records far away.",
          "**Content database.** Items, NPCs, quests and dialogue are data assets that designers edit without code.",
          "**Rules layer.** A stat modifier pipeline, inventory, quest state machines and dialogue conditions over shared world facts.",
          "**Event bus.** Typed events let systems react to each other without direct references.",
          "**Save system.** Stable object IDs, diffs from the authored baseline, versioned files, background writes."
        ]
      },
      {
        "type": "p",
        "text": "Data flows one way. The streamer decides which cells exist. Each loaded cell builds its objects from data assets and applies the saved diff for that cell. Gameplay changes objects and publishes events. The quest system turns events into facts, facts feed dialogue and quest conditions, and a change tracker records what differs from the baseline. That record is the save."
      },
      {
        "type": "h",
        "text": "World streaming: cells and two radii"
      },
      {
        "type": "p",
        "text": "The world is cut into a square grid of cells, here 128 m on a side. A cell is the unit of loading: its terrain tile, static props, lights, navmesh patch, NPC spawn records and vegetation. Every few frames the streamer measures the player's distance to each cell centre. Inside the **load radius** (3 cells, 384 m) a cell is requested. Outside the **unload radius** (4 cells, 512 m) a loaded cell is released. Between the two radii nothing changes. That gap is **hysteresis**. With one shared radius, a player pacing along a border makes a cell load, unload and load again. Each load costs disk reads, decompression, instantiation and usually a hitch, so the same price is paid repeatedly for nothing. A one-cell band makes the border free."
      },
      {
        "type": "figure",
        "id": "rpg-stream-grid",
        "caption": "The ring is the load radius and the dashed ring the unload radius: cells turn on ahead of the player and turn off only once they are well behind. Drawn at 2 and 3 cells to fit; the game in the text uses 3 and 4.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Top-down view of a cell grid around a player moving right. Cells inside the inner load ring turn from empty to loading to loaded; cells leave only when they fall outside the larger unload ring, so the gap between the rings prevents thrashing.\"><style>.rpg-stream-grid-t{font-size:12px;fill:var(--fig-muted)}.rpg-stream-grid-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.rpg-stream-grid-c{fill-opacity:.5;fill:var(--fig-panel)}.rpg-stream-grid-on{fill:var(--fig-accent)}.rpg-stream-grid-l{fill:var(--fig-accent)}.rpg-stream-grid-e{fill:var(--fig-panel)}.rpg-stream-grid-a{animation-duration:8s;animation-timing-function:step-end;animation-iteration-count:infinite}.rpg-stream-grid-g{fill:none;stroke:var(--fig-line);stroke-width:1}.rpg-stream-grid-rl{fill:none;stroke:var(--fig-accent);stroke-width:2.5}.rpg-stream-grid-ru{fill:none;stroke:var(--fig-muted);stroke-width:2;stroke-dasharray:6 5}.rpg-stream-grid-pd{fill:var(--fig-ink);stroke:var(--fig-bg);stroke-width:2}.rpg-stream-grid-pl{animation:rpg-stream-grid-mv 8s linear infinite}@keyframes rpg-stream-grid-mv{0%{transform:translateX(136px)}80%,100%{transform:translateX(296px)}}.rpg-stream-grid-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.rpg-stream-grid-sw{stroke:var(--fig-line);stroke-width:1}@keyframes rpg-stream-grid-k1{0%{fill:var(--fig-accent)}26.6%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k2{0%{fill:var(--fig-accent)}30.1%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k3{0%{fill:var(--fig-accent)}46.6%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k4{0%{fill:var(--fig-accent)}50.1%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k5{0%{fill:var(--fig-panel)}10%{fill:var(--fig-warn)}17%{fill:var(--fig-accent)}54.8%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k6{0%{fill:var(--fig-accent)}66.6%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k7{0%{fill:var(--fig-accent)}70.1%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k8{0%{fill:var(--fig-panel)}30%{fill:var(--fig-warn)}37%{fill:var(--fig-accent)}74.8%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k9{0%{fill:var(--fig-panel)}50%{fill:var(--fig-warn)}57.1%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k10{0%{fill:var(--fig-panel)}15.4%{fill:var(--fig-warn)}22.4%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k11{0%{fill:var(--fig-panel)}10%{fill:var(--fig-warn)}17%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k12{0%{fill:var(--fig-panel)}70%{fill:var(--fig-warn)}77%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k13{0%{fill:var(--fig-panel)}35.4%{fill:var(--fig-warn)}42.4%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k14{0%{fill:var(--fig-panel)}30%{fill:var(--fig-warn)}37%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k15{0%{fill:var(--fig-panel)}55.4%{fill:var(--fig-warn)}62.5%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k16{0%{fill:var(--fig-panel)}75.4%{fill:var(--fig-warn)}82.5%{fill:var(--fig-accent)}}</style><path class=\"rpg-stream-grid-c rpg-stream-grid-e\" d=\"M16 40h40v40h-40zM16 80h40v40h-40zM16 120h40v40h-40zM16 160h40v40h-40zM16 200h40v40h-40zM56 40h40v40h-40zM56 200h40v40h-40zM96 40h40v40h-40zM96 200h40v40h-40zM296 40h40v40h-40zM296 200h40v40h-40zM336 40h40v40h-40zM336 200h40v40h-40zM376 40h40v40h-40zM376 80h40v40h-40zM376 120h40v40h-40zM376 160h40v40h-40zM376 200h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k1\" d=\"M56 80h40v40h-40zM56 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k2\" d=\"M56 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k3\" d=\"M96 80h40v40h-40zM96 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k4\" d=\"M96 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k5\" d=\"M136 40h40v40h-40zM136 200h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k6\" d=\"M136 80h40v40h-40zM136 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k7\" d=\"M136 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k8\" d=\"M176 40h40v40h-40zM176 200h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-l\" d=\"M176 80h40v40h-40zM176 120h40v40h-40zM176 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k9\" d=\"M216 40h40v40h-40zM216 200h40v40h-40zM296 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k10\" d=\"M216 80h40v40h-40zM216 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k11\" d=\"M216 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k12\" d=\"M256 40h40v40h-40zM256 200h40v40h-40zM336 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k13\" d=\"M256 80h40v40h-40zM256 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k14\" d=\"M256 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k15\" d=\"M296 80h40v40h-40zM296 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k16\" d=\"M336 80h40v40h-40zM336 160h40v40h-40z\"/><path class=\"rpg-stream-grid-g\" d=\"M16 40v200M56 40v200M96 40v200M136 40v200M176 40v200M216 40v200M256 40v200M296 40v200M336 40v200M376 40v200M416 40v200M16 40h400M16 80h400M16 120h400M16 160h400M16 200h400M16 240h400\"/><g class=\"rpg-stream-grid-pl\" transform=\"translate(136,0)\"><circle class=\"rpg-stream-grid-ru\" cy=\"140\" r=\"120\"/><circle class=\"rpg-stream-grid-rl\" cy=\"140\" r=\"80\"/><circle class=\"rpg-stream-grid-pd\" cy=\"140\" r=\"7\"/></g><rect class=\"rpg-stream-grid-pn\" x=\"436\" y=\"24\" width=\"188\" height=\"252\" rx=\"12\"/><text class=\"rpg-stream-grid-h\" x=\"452\" y=\"50\">Streaming grid</text><rect class=\"rpg-stream-grid-c rpg-stream-grid-l rpg-stream-grid-sw\" x=\"452\" y=\"64\" width=\"16\" height=\"16\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"77\">loaded</text><rect class=\"rpg-stream-grid-c rpg-stream-grid-sw\" style=\"fill:var(--fig-warn)\" x=\"452\" y=\"88\" width=\"16\" height=\"16\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"101\">loading</text><rect class=\"rpg-stream-grid-c rpg-stream-grid-e rpg-stream-grid-sw\" x=\"452\" y=\"112\" width=\"16\" height=\"16\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"125\">unloaded</text><line class=\"rpg-stream-grid-rl\" x1=\"452\" y1=\"144\" x2=\"468\" y2=\"144\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"148\">load ring</text><line class=\"rpg-stream-grid-ru\" x1=\"452\" y1=\"164\" x2=\"468\" y2=\"164\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"168\">unload ring</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"190\">A cell loads inside the</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"204\">inner ring, unloads only</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"218\">outside the outer ring.</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"232\">The gap is hysteresis:</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"246\">stepping back and forth</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"260\">on a border is free.</text><text class=\"rpg-stream-grid-t\" x=\"16\" y=\"280\">rings drawn at 2 and 3 cells to fit; player moves right</text></svg>"
      },
      {
        "type": "p",
        "text": "Loading is asynchronous. File reads and decompression run on worker threads. Only the last step, creating objects and uploading GPU data, touches the main thread. Requests wait in a priority queue, scored by distance weighted by view direction, so a cell 300 m ahead loads before one 200 m behind. A request that leaves the load radius before it starts is cancelled. A hard **memory budget** bounds the whole system. Peak residency is set by the unload radius: about pi x 4² = 50 cells. If the platform leaves about 1.5 GB for streamed content and a cell averages about 30 MB, that matches the budget. The radii come out of the budget, not the other way round. If cell sizes vary, the streamer tracks bytes instead of counts and evicts the worst-priority loaded cell first."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "float Priority(Cell c, Vector3 player, Vector3 view)   // lower = load first\n{\n    Vector3 to = c.Center - player;\n    float d = to.magnitude;\n    float ahead = Mathf.Max(0f, Vector3.Dot(view, to / d));  // 0 behind .. 1 ahead\n    return d * (1.5f - ahead);                              // ahead x0.5, behind x1.5\n}\n\nvoid UpdateStreaming(Vector3 player, Vector3 view)\n{\n    foreach (Cell c in grid.CellsNear(player, unloadRadius + cellSize))\n    {\n        float d = Vector3.Distance(c.Center, player);\n        if (c.State == CellState.Unloaded && d <= loadRadius)\n            Enqueue(c, Priority(c, player, view));\n        else if (c.State == CellState.Loaded && d > unloadRadius)\n            Release(c);\n    }\n}"
      },
      {
        "type": "callout",
        "kind": "warn",
        "text": "The expensive part of a cell load is instantiation, not the file read. Creating a thousand objects in one frame is a hitch of tens of milliseconds however fast the disk is. Give the main thread a per-frame budget (for example 2 ms), spread a cell over several frames in a fixed order (terrain, collision, props, NPCs) and mark it Loaded only when it is complete. Judge the result by the worst frame on the slowest target device, not the average."
      },
      {
        "type": "h",
        "text": "Drawing far things cheaply"
      },
      {
        "type": "p",
        "text": "Streaming decides what exists. Level of detail decides what each thing costs. Three layers stack. **LOD** swaps a mesh for a cheaper one as its projected size on screen falls, for example LOD0 above 30% of screen height, LOD1 down to 10%, LOD2 below that, with a dithered cross-fade of about 0.3 s to hide the swap. **HLOD** handles groups: a village of 80 buildings is baked offline into one merged mesh with one atlas material, so beyond about 300 m it costs a few draws instead of hundreds. **Impostors** replace complex shapes such as trees with camera-facing quads captured from many angles (for example 8 x 8 views): a few triangles that still shade plausibly. Each layer trades disk space and bake time for runtime draw calls."
      },
      {
        "type": "p",
        "text": "Terrain is its own case. It is a heightmap, a grid of 16-bit heights stored in tiles. A tile of 513 x 513 samples covers 512 m at 1 m spacing and takes about 0.5 MB. The 2^n + 1 size lets neighbouring tiles share an edge row, so there are no gaps. Each tile has a chain of LODs that halve the resolution per step (513, 257, 129, 65 samples), and the last step has about 60 times fewer vertices. Where two LODs meet, skirts or edge stitching hide the cracks. Ground textures come from a per-tile splat map. Grass and rocks are scattered at load time from density masks with a fixed seed, so they look identical every time the cell loads and never need saving."
      },
      {
        "type": "h",
        "text": "Floating origin"
      },
      {
        "type": "p",
        "text": "A 32-bit float has a 24-bit significand, so the gap between neighbouring values grows with magnitude. For a value in [2^e, 2^(e+1)) the gap is 2^(e-23). At 1 km from the origin it is about 0.06 mm. Between 4 and 8 km it is about 0.5 mm, at 16 to 32 km about 2 mm and near 100 km about 8 mm. Those are rounding steps for a single number. Transform chains, physics solvers and skinning combine several such numbers, so jitter in shadows, animation and contacts shows up long before the raw gap looks large. A 10 km world is already uncomfortable in plain floats."
      },
      {
        "type": "figure",
        "id": "rpg-float-origin",
        "caption": "The gap doubles every time the distance doubles. The marker shows what the shift does: the player never climbs past 1 km, so the gap never exceeds 0.06 mm.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"Log-log chart of the gap between adjacent 32-bit float positions against distance from the world origin: about 0.06 mm at 1 km, 0.5 mm at 5 km and 8 mm at 100 km. A marker climbs the curve to 1 km, then the world origin shifts and the marker returns near zero.\"><style>.rpg-float-origin-t{font-size:12px;fill:var(--fig-muted)}.rpg-float-origin-k{font-size:11px;fill:var(--fig-muted)}.rpg-float-origin-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.rpg-float-origin-g{fill:none;stroke:var(--fig-line);stroke-width:1}.rpg-float-origin-ax{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.rpg-float-origin-cv{fill:none;stroke:var(--fig-accent2);stroke-width:2.5;stroke-linejoin:round}.rpg-float-origin-zn{fill:var(--fig-ok);fill-opacity:.12}.rpg-float-origin-dl{stroke:var(--fig-ok);stroke-width:1.5;stroke-dasharray:5 4}.rpg-float-origin-da{fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2}.rpg-float-origin-dw{fill:var(--fig-warn);stroke:var(--fig-bg);stroke-width:2}.rpg-float-origin-db{fill:var(--fig-bad);stroke:var(--fig-bg);stroke-width:2}.rpg-float-origin-mk{fill:var(--fig-ink);stroke:var(--fig-bg);stroke-width:2;animation:rpg-float-origin-mv 6s linear infinite}@keyframes rpg-float-origin-mv{0%{transform:translate(76px,226.9px)}3%{transform:translate(86.2px,226.9px)}6%{transform:translate(96.4px,226.9px)}9%{transform:translate(106.6px,214.9px)}12%{transform:translate(116.8px,214.9px)}15%{transform:translate(127px,202.9px)}18%{transform:translate(137.2px,202.9px)}21%{transform:translate(147.4px,190.8px)}24%{transform:translate(157.6px,190.8px)}27%{transform:translate(167.8px,178.8px)}30%{transform:translate(178px,178.8px)}33%{transform:translate(188.2px,166.7px)}36%{transform:translate(198.4px,166.7px)}39%{transform:translate(208.6px,154.7px)}42%{transform:translate(218.8px,154.7px)}45%{transform:translate(229px,142.7px)}48%{transform:translate(239.2px,142.7px)}51%{transform:translate(249.4px,130.6px)}54%{transform:translate(259.6px,130.6px)}57%{transform:translate(269.8px,118.6px)}60%{transform:translate(280px,118.6px)}60%{transform:translate(280px,118.6px)}70%{transform:translate(280px,118.6px)}71%,100%{transform:translate(76px,226.9px)}}.rpg-float-origin-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}</style><rect class=\"rpg-float-origin-zn\" x=\"76\" y=\"30\" width=\"204\" height=\"200\"/><path class=\"rpg-float-origin-g\" d=\"M76 230H416M76 190H416M76 150H416M76 110H416M76 70H416M76 30H416\"/><path class=\"rpg-float-origin-ax\" d=\"M76 30V230H416\"/><line class=\"rpg-float-origin-dl\" x1=\"280\" y1=\"30\" x2=\"280\" y2=\"230\"/><polyline class=\"rpg-float-origin-cv\" points=\"76,226.9 96.5,226.9 96.5,214.9 116.9,214.9 116.9,202.9 137.4,202.9 137.4,190.8 157.9,190.8 157.9,178.8 178.4,178.8 178.4,166.7 198.8,166.7 198.8,154.7 219.3,154.7 219.3,142.7 239.8,142.7 239.8,130.6 260.2,130.6 260.2,118.6 280.7,118.6 280.7,106.5 301.2,106.5 301.2,94.5 321.6,94.5 321.6,82.5 342.1,82.5 342.1,70.4 362.6,70.4 362.6,58.4 383.1,58.4 383.1,46.3 403.5,46.3 403.5,34.3 416,34.3\"/><circle class=\"rpg-float-origin-da\" cx=\"280\" cy=\"118.6\" r=\"5.5\"/><circle class=\"rpg-float-origin-dw\" cx=\"327.5\" cy=\"82.5\" r=\"5.5\"/><circle class=\"rpg-float-origin-db\" cx=\"416\" cy=\"34.3\" r=\"5.5\"/><circle class=\"rpg-float-origin-mk\" r=\"6\" transform=\"translate(76,226.9)\"/><text class=\"rpg-float-origin-k\" x=\"70\" y=\"234\" text-anchor=\"end\">0.0001 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"194\" text-anchor=\"end\">0.001 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"154\" text-anchor=\"end\">0.01 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"114\" text-anchor=\"end\">0.1 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"74\" text-anchor=\"end\">1 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"34\" text-anchor=\"end\">10 mm</text><text class=\"rpg-float-origin-k\" x=\"76\" y=\"250\" text-anchor=\"middle\">1 m</text><text class=\"rpg-float-origin-k\" x=\"144\" y=\"250\" text-anchor=\"middle\">10 m</text><text class=\"rpg-float-origin-k\" x=\"212\" y=\"250\" text-anchor=\"middle\">100 m</text><text class=\"rpg-float-origin-k\" x=\"280\" y=\"250\" text-anchor=\"middle\">1 km</text><text class=\"rpg-float-origin-k\" x=\"348\" y=\"250\" text-anchor=\"middle\">10 km</text><text class=\"rpg-float-origin-k\" x=\"416\" y=\"250\" text-anchor=\"middle\">100 km</text><text class=\"rpg-float-origin-t\" x=\"246\" y=\"270\" text-anchor=\"middle\">distance from world origin (log scale)</text><text class=\"rpg-float-origin-t\" x=\"16\" y=\"22\">float32 position gap</text><text class=\"rpg-float-origin-t\" x=\"416\" y=\"22\" text-anchor=\"end\">no shift: about 8 mm at 100 km</text><text class=\"rpg-float-origin-t\" x=\"288\" y=\"46\">shift at 1 km</text><text class=\"rpg-float-origin-t\" x=\"288\" y=\"134\">1 km: 0.06 mm</text><text class=\"rpg-float-origin-t\" x=\"330\" y=\"102\">5 km: 0.5 mm</text><text class=\"rpg-float-origin-t\" x=\"276\" y=\"218\" text-anchor=\"end\">kept below 0.06 mm</text><rect class=\"rpg-float-origin-pn\" x=\"440\" y=\"30\" width=\"184\" height=\"200\" rx=\"12\"/><text class=\"rpg-float-origin-h\" x=\"454\" y=\"56\">Floating origin</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"82\">Keep the player near 0,0.</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"100\">Past 1 km, subtract the</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"118\">player offset from every</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"136\">root and the camera,</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"154\">and add it to a 64-bit</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"172\">world offset instead.</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"206\">marker: player after shifts</text></svg>"
      },
      {
        "type": "p",
        "text": "The fix is the **floating origin**. In engine coordinates the player stays near (0, 0, 0) and the world moves. When the player gets farther than a threshold (say 1 km) from the origin, the game subtracts the player's position from every root object, the camera and world-space particles, and adds it to a 64-bit offset. True world position is that double plus the float local position, and it is what streaming, saving and the map use. The shift happens between frames, when no streaming job holds raw positions, and fires an event so everything with cached world coordinates (trails, navmesh agent destinations, audio sources) subtracts the same delta. The alternatives cost more. Doubles everywhere double memory and bandwidth, and GPUs and most physics engines handle them poorly or not at all. Per-cell local coordinates work for static scenery but make cross-cell physics and AI paths awkward."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "const float ShiftThreshold = 1000f;\npublic Vector3d Origin;                  // 64-bit world position of engine (0,0,0)\n\nvoid LateUpdate()\n{\n    Vector3 p = player.position;\n    if (p.sqrMagnitude < ShiftThreshold * ShiftThreshold) return;\n\n    foreach (Transform root in worldRoots) root.position -= p;  // cells and dynamic roots\n    camera.transform.position -= p;\n    Origin += new Vector3d(p.x, p.y, p.z);\n    Physics.SyncTransforms();            // keep colliders in step\n    Events.Publish(new OriginShifted(-p)); // trails, agents, audio subtract this delta\n}"
      },
      {
        "type": "h",
        "text": "Simulation LOD and schedules"
      },
      {
        "type": "p",
        "text": "Rendering LOD saves GPU time. Simulation LOD saves CPU time and is where open worlds are won. NPCs live in three tiers. **Full**, inside the player's active area (about 50 to 100 m): perception, behaviour trees, animation, navmesh steering and physics. **Coarse**, loaded but out of sight: no animation and no perception, just a position that advances along a route at walking speed, updated once or twice a second. **Frozen**, in an unloaded cell: no objects at all, only a record of ID, location and schedule slot. Suppose the AI budget is 2 ms per frame and a full agent costs about 40 µs. Then about 50 full agents fit. 1,000 coarse agents at 2 Hz and about 2 µs per update cost about 0.13 ms per frame at 30 fps. Population can grow ten times while the frame stays flat."
      },
      {
        "type": "p",
        "text": "Schedules are data: a list of (start hour, place, activity) such as 06:00 wake, 08:00 open the shop, 18:00 tavern, 23:00 home. The day and night clock runs at a timescale; a value of 20 means one game day lasts 72 real minutes. The key trick is **catch-up instead of simulation**. A frozen NPC is not walked around for hours while unloaded. When their cell loads, the game reads the clock, finds the schedule slot that is current, and places the NPC where that slot says they are now, mid-route if the route is short, at the destination otherwise. The player sees consistent behaviour and the cost is one lookup. The price is that off-screen life is an approximation, so anything the player can verify (a shop that must be open at noon) must come from the schedule, not from chance."
      },
      {
        "type": "h",
        "text": "Data-driven content, stats and inventory"
      },
      {
        "type": "p",
        "text": "Items, NPCs, spells, quests and dialogue are **data assets**, not classes: ScriptableObjects, database rows or JSON validated at build time. An iron sword is a row with an ID (`item.sword.iron`), a mesh reference, a weight, a base damage and a list of modifiers. Designers add the 2,000th item without a programmer and without a compile. Code defines a few dozen behaviours (weapon, armour, potion, key) and data composes them. The alternative, a subclass per item, grows to thousands of types, forces a rebuild for every balance tweak and blocks modding. The rules: IDs are stable strings and are never renamed (add an alias instead), references between assets use IDs, and a build step fails on missing references and out-of-range values."
      },
      {
        "type": "p",
        "text": "A stat such as move speed is never one number that code increments and decrements. That drifts. Start at 5.0, equip boots (+0.5), drink a potion (x1.2) to get 6.6, then unequip the boots by subtracting 0.5, and you hold 6.1 instead of 5.0 x 1.2 = 6.0. Instead each stat keeps a **base value** and a list of **modifiers**, each tagged with a stage and a source. The final value is rebuilt from scratch: start from the base, add all additive modifiers, multiply by all multiplicative ones, then clamp. Removing a source removes its modifiers exactly. Modifiers are sorted by stage and source, so the result is deterministic in any equip order. It is cached and recomputed only when a modifier changes (a dirty flag), not every frame."
      },
      {
        "type": "figure",
        "id": "rpg-stat-pipeline",
        "caption": "Values flow through fixed stages: base 5.0, plus 0.5, times 1.3 and 1.2, clamped to 8. Any change just marks the stat dirty.",
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"A stat pipeline for move speed: base 5.0, additive modifiers give 5.5, multiplicative modifiers give 8.58, a clamp to a maximum of 8 gives 8.0. A marker moves through the four stages in order. Below, an equip or buff change marks the stat dirty and the value is recomputed on the next read.\"><style>.rpg-stat-pipeline-t{font-size:12px;fill:var(--fig-muted)}.rpg-stat-pipeline-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.rpg-stat-pipeline-r{font-size:16px;font-weight:600;fill:var(--fig-ink)}.rpg-stat-pipeline-bx{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.rpg-stat-pipeline-gl{fill:var(--fig-accent);fill-opacity:.4;opacity:0;animation:rpg-stat-pipeline-gl 6s linear infinite}@keyframes rpg-stat-pipeline-gl{0%{opacity:1}15%,100%{opacity:0}}.rpg-stat-pipeline-ar{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.rpg-stat-pipeline-tr{stroke:var(--fig-line);stroke-width:2}.rpg-stat-pipeline-dt{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:rpg-stat-pipeline-dt 6s linear infinite}@keyframes rpg-stat-pipeline-dt{0%{transform:translateX(80px)}70%,100%{transform:translateX(560px)}}</style><rect class=\"rpg-stat-pipeline-bx\" x=\"16\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><rect class=\"rpg-stat-pipeline-gl\" style=\"animation-delay:0.0s\" x=\"16\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><text class=\"rpg-stat-pipeline-h\" x=\"80\" y=\"68\" text-anchor=\"middle\">Base</text><text class=\"rpg-stat-pipeline-t\" x=\"80\" y=\"94\" text-anchor=\"middle\">walk speed</text><text class=\"rpg-stat-pipeline-t\" x=\"80\" y=\"112\" text-anchor=\"middle\">from data asset</text><text class=\"rpg-stat-pipeline-r\" x=\"80\" y=\"142\" text-anchor=\"middle\">= 5.0</text><path class=\"rpg-stat-pipeline-ar\" d=\"M148 100h20m-6 -5l6 5l-6 5\"/><rect class=\"rpg-stat-pipeline-bx\" x=\"176\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><rect class=\"rpg-stat-pipeline-gl\" style=\"animation-delay:1.4s\" x=\"176\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><text class=\"rpg-stat-pipeline-h\" x=\"240\" y=\"68\" text-anchor=\"middle\">Additive</text><text class=\"rpg-stat-pipeline-t\" x=\"240\" y=\"94\" text-anchor=\"middle\">+0.5 boots</text><text class=\"rpg-stat-pipeline-t\" x=\"240\" y=\"112\" text-anchor=\"middle\">(sum all adds)</text><text class=\"rpg-stat-pipeline-r\" x=\"240\" y=\"142\" text-anchor=\"middle\">= 5.5</text><path class=\"rpg-stat-pipeline-ar\" d=\"M308 100h20m-6 -5l6 5l-6 5\"/><rect class=\"rpg-stat-pipeline-bx\" x=\"336\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><rect class=\"rpg-stat-pipeline-gl\" style=\"animation-delay:2.8s\" x=\"336\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><text class=\"rpg-stat-pipeline-h\" x=\"400\" y=\"68\" text-anchor=\"middle\">Multiplicative</text><text class=\"rpg-stat-pipeline-t\" x=\"400\" y=\"94\" text-anchor=\"middle\">x1.3 haste</text><text class=\"rpg-stat-pipeline-t\" x=\"400\" y=\"112\" text-anchor=\"middle\">x1.2 potion</text><text class=\"rpg-stat-pipeline-r\" x=\"400\" y=\"142\" text-anchor=\"middle\">= 8.58</text><path class=\"rpg-stat-pipeline-ar\" d=\"M468 100h20m-6 -5l6 5l-6 5\"/><rect class=\"rpg-stat-pipeline-bx\" x=\"496\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><rect class=\"rpg-stat-pipeline-gl\" style=\"animation-delay:4.2s\" x=\"496\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><text class=\"rpg-stat-pipeline-h\" x=\"560\" y=\"68\" text-anchor=\"middle\">Clamp</text><text class=\"rpg-stat-pipeline-t\" x=\"560\" y=\"94\" text-anchor=\"middle\">min 0</text><text class=\"rpg-stat-pipeline-t\" x=\"560\" y=\"112\" text-anchor=\"middle\">max 8 (cap)</text><text class=\"rpg-stat-pipeline-r\" x=\"560\" y=\"142\" text-anchor=\"middle\">= 8.0</text><rect class=\"rpg-stat-pipeline-bx\" x=\"16\" y=\"198\" width=\"176\" height=\"36\" rx=\"10\"/><text class=\"rpg-stat-pipeline-t\" x=\"104\" y=\"221\" text-anchor=\"middle\">equip, buff, expiry</text><rect class=\"rpg-stat-pipeline-bx\" x=\"216\" y=\"198\" width=\"140\" height=\"36\" rx=\"10\"/><text class=\"rpg-stat-pipeline-t\" x=\"286\" y=\"221\" text-anchor=\"middle\">mark stat dirty</text><rect class=\"rpg-stat-pipeline-bx\" x=\"380\" y=\"198\" width=\"244\" height=\"36\" rx=\"10\"/><text class=\"rpg-stat-pipeline-t\" x=\"502\" y=\"221\" text-anchor=\"middle\">recompute on next read, cache</text><path class=\"rpg-stat-pipeline-ar\" d=\"M196 216h16m-6 -5l6 5l-6 5M360 216h16m-6 -5l6 5l-6 5\"/><line class=\"rpg-stat-pipeline-tr\" x1=\"80\" y1=\"176\" x2=\"560\" y2=\"176\"/><circle class=\"rpg-stat-pipeline-dt\" cy=\"176\" r=\"6\" transform=\"translate(80,0)\"/><text class=\"rpg-stat-pipeline-h\" x=\"16\" y=\"28\">Move speed (m/s): one pipeline per stat</text><text class=\"rpg-stat-pipeline-t\" x=\"320\" y=\"262\" text-anchor=\"middle\">Fixed stage order and sorted modifiers: same inputs, same result.</text></svg>"
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "enum Stage { Additive = 0, Multiplicative = 1 }\nstruct Modifier { public Stage Stage; public float Value; public int SourceId; }\n\npublic float Get()\n{\n    if (!dirty) return cached;\n    float add = 0f, mul = 1f;\n    foreach (var m in modifiers)                 // kept sorted by (Stage, SourceId)\n        if (m.Stage == Stage.Additive) add += m.Value; else mul *= m.Value;\n    cached = Mathf.Clamp((baseValue + add) * mul, min, max);\n    dirty = false;\n    return cached;\n}\npublic void Remove(int sourceId) { modifiers.RemoveAll(m => m.SourceId == sourceId); dirty = true; }"
      },
      {
        "type": "p",
        "text": "Inventory follows from the same split. A stack is a record: definition ID, count and, for unique items, an instance ID with its own state (durability, enchantment). Equipping adds modifiers with the item instance as the source, and unequipping removes them by source. Carry weight is another stat, and the UI only calls `Get()`. For tooltips the stat can also return its list of contributions (\"base 5.0, boots +0.5, potion x1.2\") from the same data, so the explanation can never disagree with the number."
      },
      {
        "type": "h",
        "text": "Quests, dialogue and the event bus"
      },
      {
        "type": "p",
        "text": "A quest is a **state machine** whose current stage is stored as one world fact, such as `quest.guild.stage = 30`. **World facts** are a flat key-value store of integers: `killed.bandit_leader = 1`, `faction.guild.rep = 3`, `time.day = 12`. Systems write facts and conditions read them. A quest moves from stage 30 to 40 when its condition over facts becomes true. **Dialogue trees** use the same conditions. Each line carries a condition list, the NPC speaks the first line whose conditions pass, and choosing a reply runs effects that write facts. Because quests, dialogue and the world share only facts, a designer adds a reaction (guards mention the stolen ledger) by adding a line with a condition, with no change to quest code."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "struct Condition { public string Fact; public Op Op; public int Value; }\n\nbool Passes(Condition c, Facts f)\n{\n    int v = f.Get(c.Fact);                       // a missing fact reads as 0\n    switch (c.Op)\n    {\n        case Op.Eq: return v == c.Value;\n        case Op.Ge: return v >= c.Value;\n        case Op.Lt: return v <  c.Value;\n        default:    return v != c.Value;\n    }\n}\n\nDialogueLine Pick(DialogueNode n, Facts f)\n{\n    foreach (var line in n.Lines)                // authored in priority order\n        if (line.Conditions.All(c => Passes(c, f))) return line;\n    return n.Fallback;\n}"
      },
      {
        "type": "p",
        "text": "Facts have to come from somewhere. Gameplay code publishes typed events (`EnemyKilled`, `ItemAdded`, `LocationEntered`, `HourChanged`) on an **event bus**, and the quest system, achievements, UI and audio subscribe. The publisher does not know who listens, so adding a system means adding a subscriber. The costs are real: control flow is harder to read, ordering between subscribers matters, and a forgotten unsubscribe keeps a dead object alive. Contain them. Events are plain structs, dispatch happens at one fixed point per frame and never re-entrantly inside the publisher, and development builds log every event so you can answer \"why did this quest advance?\""
      },
      {
        "type": "h",
        "text": "Saving a world you cannot save"
      },
      {
        "type": "p",
        "text": "The player can change anything: move a barrel, empty a chest, kill a merchant. The authored world is gigabytes, so saving all of it would be too big and too slow. The save holds only the **diff** from the authored baseline. Every placed object carries a **stable unique ID** assigned at authoring time, a GUID stored with the object. It is never derived from the name, the position or the index in a list, because designers change all three. A change tracker marks an object dirty when it moves, is destroyed or has its contents changed, so saving costs in proportion to what the player did, not to world size. Loading a cell instantiates the baseline and then applies the diff for that cell's IDs. Objects spawned at runtime take IDs from a counter that is itself saved. A save can stay at a few MB even after tens of hours, plus global state: facts, clock, player and quest stages."
      },
      {
        "type": "code",
        "lang": "csharp",
        "text": "[Serializable] class SaveFile\n{\n    public int Version = 7;                       // bump on every format change\n    public double PlayTime; public Vector3d PlayerWorldPos;\n    public Dictionary<string, int> Facts;         // all world facts\n    public List<ObjectDelta> Deltas;              // only objects that differ from baseline\n}\n[Serializable] struct ObjectDelta { public Guid Id; public bool Destroyed; public byte[] State; }\n\nvoid OnCellLoaded(Cell cell)\n{\n    foreach (var obj in cell.SpawnBaseline())     // authored objects, each with its Guid\n        if (deltas.TryGetValue(obj.Id, out var d)) obj.Apply(d);  // moved, emptied, destroyed\n}"
      },
      {
        "type": "p",
        "text": "Saves outlive patches. The file starts with a version number and loads through a chain of **migrations**: v5 to v6, then v6 to v7, each a small pure function that rewrites the data (rename a fact, split a field, drop a removed object). Old migrations are never edited, and test fixtures keep a real save from every shipped version. An ID that no longer exists in the baseline is skipped with a warning, not a crash. **Autosave** must not hitch. On the main thread, copy the dirty records into a buffer, which takes a millisecond or two. On a worker thread, serialise, compress and write a temporary file, then rename it over the target so a crash mid-write cannot damage the previous save. Keep three or more rotating slots, and delay autosave during combat and cell loads."
      },
      {
        "type": "h",
        "text": "Decisions and why they work"
      },
      {
        "type": "list",
        "items": [
          "**Streamed cells, not one big level.** Memory and load time are bounded by the radii, not by world size. Loading screens between zones are cheaper to build and break the premise.",
          "**Unload radius larger than load radius.** The one-cell gap makes border pacing free. Equal radii are simpler but thrash I/O and hitch.",
          "**Priority by distance and view direction.** What the player is about to see arrives first. Plain distance order loads cells behind the camera while the horizon is still empty.",
          "**Floating origin over doubles everywhere.** The GPU and physics engine stay in fast float32, and the world is rebased cheaply once per kilometre. Doubles everywhere cost memory and bandwidth and most of the pipeline cannot use them.",
          "**Simulation LOD with schedule catch-up.** CPU cost follows what is near the player, not the population. Simulating every NPC always cannot fit in a frame. The price is that off-screen life is an approximation.",
          "**Data assets over code for content.** Designers iterate without builds and tools validate everything. The price is a schema to maintain and tooling to write.",
          "**Stats derived from base plus modifiers.** Any equip order gives the same answer and tooltips come for free. Incrementing stats in place drifts and is nearly impossible to debug.",
          "**Facts plus events between systems.** Quests, dialogue and UI never reference each other, so they change independently. The price is indirection, paid back with event logging.",
          "**Diff saves with stable IDs.** Size follows play, not world size, and patches that move things do not corrupt saves. The price is discipline: IDs at authoring, change tracking on every mutable object, a migration for every format change."
        ]
      },
      {
        "type": "callout",
        "kind": "warn",
        "text": "Never derive save IDs from names, positions or list indices. A designer renames a prop or nudges a chest, and every save that touched it now points at nothing or at the wrong object. Generate the GUID once, store it with the object, and add a build validator that fails on duplicate IDs and on any ID that disappears between releases without an alias."
      },
      {
        "type": "callout",
        "kind": "agent",
        "text": "Delegate what is specified and testable: data schemas and the build-time validator (missing references, duplicate IDs, out-of-range values), the modifier pipeline with property tests (any permutation of equip order gives the same value, add then remove returns to base), the fact store and condition evaluator, the migration chain with golden saves from each version, and editor tooling such as a cell-grid debug view. State the invariants as rules: no gameplay state in statics, no object lookup by name, every mutable object registers with the change tracker, world positions are 64-bit. Verify yourself what the agent cannot see: hitches and memory on target hardware in the profiler, whether streaming holds up at horse speed, whether save and load round-trip (save, load, save again, diff the files) and whether IDs survive a level edit. Agents default to singletons, FindObjectOfType and per-frame recomputation, so ask for a review pass that greps for them."
      },
      {
        "type": "patterns",
        "patterns": [
          {
            "signal": "Frame time spikes whenever the player crosses a cell border, even when walking back and forth",
            "use": "Add hysteresis between load and unload radii",
            "why": "One shared radius reloads the same cell on every crossing. An unload radius a cell larger makes the border free and leaves the cost of a real load for real travel."
          },
          {
            "signal": "Meshes and contacts jitter far from the world origin, and the effect grows with distance",
            "use": "Shift the origin, keep true position as double",
            "why": "Float gaps double each time distance doubles. Rebasing the world around the player keeps single-precision math near zero, and the 64-bit offset keeps streaming and saves exact."
          },
          {
            "signal": "A distant town costs hundreds of draw calls although it covers a few pixels",
            "use": "Bake HLOD proxies and impostors",
            "why": "Merged meshes and billboards turn per-object cost into per-group cost. You pay in bake time and disk space once, not in draw calls every frame."
          },
          {
            "signal": "NPCs far from the player burn AI time, and nobody can see or hear them",
            "use": "Demote to coarse ticks or schedule catch-up",
            "why": "CPU cost should follow what the player can observe. Coarse routes and a clock lookup on cell load give consistent behaviour without running behaviour trees for hours."
          },
          {
            "signal": "A balance tweak or a new item needs a programmer and a new build",
            "use": "Move the value into a data asset",
            "why": "Designers iterate in minutes when content is rows validated by tools. Code keeps the few reusable behaviours, and data composes the thousands of variants."
          },
          {
            "signal": "A stat is wrong after equipping and unequipping items in a different order",
            "use": "Rebuild from base through a sorted pipeline",
            "why": "In-place increments depend on history. Recomputing base, additive, multiplicative and clamp from the current modifier list depends only on state, so the order cannot matter."
          },
          {
            "signal": "Quest, dialogue and guard scripts call each other, and every new reaction touches all three",
            "use": "Route state through facts and an event bus",
            "why": "Systems that share only facts and events can change independently. A designer adds a reaction as a conditioned line, and the quest code stays untouched."
          },
          {
            "signal": "Saves grow with world size or break after a patch moves authored objects",
            "use": "Save stable-ID diffs against the baseline",
            "why": "IDs fixed at authoring survive edits, and diffs scale with what the player changed. Versioned migrations upgrade old files instead of invalidating them."
          }
        ]
      }
    ],
    "keyPoints": [
      "Stream a cell grid with a load radius smaller than the unload radius; the gap is hysteresis that stops thrashing at borders.",
      "Load asynchronously, prioritised by distance and view direction, and bound residency by a byte budget and per-frame instantiation time.",
      "Float32 gaps grow from about 0.06 mm at 1 km to about 8 mm near 100 km, so shifting the origin keeps the player near zero.",
      "Simulation LOD runs full AI near the player, coarse ticks when loaded but unseen, and clock-based catch-up for unloaded NPCs.",
      "Content is data, and stats are rebuilt from base plus sorted modifiers, so equip order never changes the result.",
      "Quests and dialogue read shared facts, an event bus decouples systems, and saves hold stable-ID diffs through versioned migrations."
    ],
    "quiz": [
      {
        "q": "Playtesters riding along a cell border report a hitch every few seconds. The streamer uses one radius of 384 m for both loading and unloading. What is the right fix?",
        "options": [
          "Raise the shared radius to 512 m so the border is farther away",
          "Unload at a larger radius than the load radius, such as 512 m",
          "Unload cells on a timer instead of testing the distance",
          "Load cells synchronously so a cell is never half-finished"
        ],
        "answer": 1,
        "explain": "A gap between the radii is hysteresis: a cell loads at 384 m but stays until 512 m, so pacing at the edge changes nothing. A bigger single radius only moves the border and keeps the thrash. A timer can unload a cell the player is standing next to. Synchronous loads turn every crossing into a bigger hitch."
      },
      {
        "q": "At about 20 km from the world origin, roughly how large is the gap between adjacent 32-bit float positions?",
        "options": [
          "About 0.01 mm, which is far below anything visible",
          "About 0.2 mm, which is smaller than a hair's width",
          "About 0.5 mm, the same gap as at 5 km",
          "About 2 mm, four times the gap at 5 km"
        ],
        "answer": 3,
        "explain": "20 km lies in [16384, 32768) = [2^14, 2^15), so the gap is 2^(14-23) m, about 2 mm. About 0.5 mm is the gap for 4 to 8 km, two powers of two lower. The smaller options ignore that the gap grows with magnitude."
      },
      {
        "q": "A baker's cell stays unloaded all night. The player returns at 07:30 and the schedule opens the shop at 06:00. What should happen when the cell loads?",
        "options": [
          "Look up the current schedule slot and place the baker in the shop",
          "Run the baker's AI for the missed hours on a worker thread",
          "Spawn the baker at the home position and let the AI walk to the shop",
          "Keep the cell loaded all night so the schedule keeps running"
        ],
        "answer": 0,
        "explain": "Catch-up is one lookup: the clock and the schedule give the NPC's state now. Replaying hours of AI costs CPU nobody sees, spawning at home shows a baker walking to work at 07:30, and keeping cells loaded all night breaks the memory budget."
      },
      {
        "q": "A move-speed stat has base 10, one +4 additive modifier, one x1.5 multiplicative modifier and a clamp of 0 to 20. What does the pipeline return?",
        "options": [
          "15",
          "19",
          "20",
          "21"
        ],
        "answer": 2,
        "explain": "Additive first: 10 + 4 = 14, then multiplicative: 14 x 1.5 = 21, then the clamp limits it to 20. 19 comes from multiplying before adding (10 x 1.5 + 4). 15 ignores the additive modifier. 21 skips the clamp."
      },
      {
        "q": "Patch 1.2 moves 300 authored chests a few metres. Which save design keeps existing saves valid?",
        "options": [
          "Key each saved object by its world position in the cell",
          "Key each saved object by an authored GUID and store only diffs",
          "Key each saved object by its index in the cell's object list",
          "Store a full snapshot of every object in the loaded cells"
        ],
        "answer": 1,
        "explain": "A GUID assigned at authoring survives moves, renames and reordering, and a diff against the baseline stays small. Positions and list indices change with the edit, so saves would attach to the wrong object. A snapshot of loaded cells loses changes in every other cell and is large."
      },
      {
        "q": "A designer wants guards to mention the player's theft. The guard script calls the thieves-guild quest class, and that class calls back into dialogue, so each new reaction means editing both. What is the move?",
        "options": [
          "Merge guards, quests and dialogue into one manager class",
          "Give each system a singleton so that they can call each other",
          "Copy the theft flag into every guard script when it spawns",
          "Write the theft as a world fact and gate a dialogue line on it"
        ],
        "answer": 3,
        "explain": "A fact plus a condition on a dialogue line lets the designer add the reaction without touching quest or guard code. A big manager and singletons deepen the coupling, and copied flags go stale and are not saved in one place."
      }
    ]
  }
];
