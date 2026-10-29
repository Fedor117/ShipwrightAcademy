window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "engines",
  "track": "Game Development",
  "title": "Game Engines",
  "tagline": "The loop, the data and the systems every engine is built from.",
  "intro": "Every engine, from a hand-rolled C++ loop to Unity or Unreal, is built from the same handful of systems: a loop that spends a fixed time budget, data laid out for the cache, spatial structures that skip work, and simulation, animation, AI, audio and networking that run inside that budget. Knowing how these systems work is what lets you read a profiler capture, choose the right tool for a problem and judge whether code an agent wrote will hold up at 60 fps on real hardware.",
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
          "type": "h",
          "text": "Loading and streaming"
        },
        {
          "type": "p",
          "text": "Synchronous loading blocks the main thread: loading a 40 MB bundle from flash at 150 MB/s is about 270 ms, which is 16 dropped frames at 60 fps. Load asynchronously, with decompression and deserialization on worker threads and only the final object instantiation or GPU upload on the main thread, ideally time-sliced to a per-frame budget (for example 2 ms). **Streaming** extends this to the world: divide levels into cells or sublevels, load those near the player based on distance and predicted movement, and unload those behind. **Texture streaming** keeps only the mip levels needed for the current screen size: a texture covering 100 pixels does not need its 2048 level. The system tracks a memory budget and lowers mips when over it, which is why a texture can look blurry for a moment after a camera cut."
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
    }
  ]
});
