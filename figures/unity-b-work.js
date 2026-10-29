window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "unity",
  "track": "Game Development",
  "title": "Unity",
  "tagline": "Unity 6 from the inside: lifecycle, memory, rendering, performance and shipping.",
  "intro": "Unity hides a native C++ engine behind a friendly C# API, and most hard Unity bugs live in that gap: call order, fake nulls, serialized overrides, garbage collection hitches, batching breaks and builds that differ from Play Mode. This section explains what the engine actually does at each of those seams in Unity 6, so you can profile on device, fix the real bottleneck and ship reliably. It also covers how to let AI agents change a Unity project safely, through the Editor rather than around it.",
  "topics": [
    {
      "id": "unity-fundamentals",
      "title": "Unity Fundamentals: Objects, Components, Scenes and Prefabs",
      "minutes": 12,
      "summary": "How Unity models a game as GameObjects composed of Components, organised into Scenes and reused through Prefabs, variants and overrides.",
      "lesson": [
        {
          "type": "p",
          "text": "A team ships a mobile racer with 40 tracks. Every track has a pit lane, and every pit lane has the same mechanic NPC, the same tool rack and the same lighting rig. A designer tweaks the NPC's animation speed on track 12, an engineer fixes a collider on the original, and two weeks later nobody can explain why track 12 still has the old collider. This is not a scripting bug. It is a misunderstanding of how Unity stores objects, references and overrides, and it is the single most common source of \"it works on my scene\" problems. This lesson builds the data model you need before any code matters."
        },
        {
          "type": "h",
          "text": "The Editor is a data editor"
        },
        {
          "type": "p",
          "text": "The Unity Editor is a tool for authoring serialized data. The **Hierarchy** lists the objects in the open scenes, the **Inspector** shows the serialized fields of the selected object, the **Project** window is a view of the `Assets/` folder, and the **Scene** and **Game** views render the result. Every asset on disk has a sidecar `.meta` file holding its **GUID**; references between assets are stored as GUID plus local file ID, not as paths. That is why moving a file inside the Editor is safe and moving it in Finder without its `.meta` silently breaks every reference to it. The version-control lesson at the end of this section covers GUIDs, the YAML format and merging in depth."
        },
        {
          "type": "list",
          "items": [
            "Scenes (`.unity`) and prefabs (`.prefab`) are YAML text when Asset Serialization is set to Force Text, which you want for version control and for AI agents that read files.",
            "Each object in that YAML has a local file ID (`&1234567`) and references look like `{fileID: 1234567}` or `{fileID: 11400000, guid: ..., type: 2}` for another asset."
          ]
        },
        {
          "type": "h",
          "text": "GameObjects and Components"
        },
        {
          "type": "p",
          "text": "A **GameObject** is almost nothing: a name, a tag, a layer, an active flag and a list of Components. All behaviour and data live in **Components**: `MeshRenderer`, `Rigidbody`, `AudioSource`, and your own `MonoBehaviour` scripts. This is composition over inheritance: a door is a GameObject with a `MeshFilter`, `MeshRenderer`, `BoxCollider`, `Animator` and a `Door` script, not a subclass of some `Door` base object. Under the hood each GameObject and Component is a native C++ object owned by the engine, with a thin C# wrapper pointing at it. Keep that split in mind; it explains the fake-null behaviour covered in a later lesson."
        },
        {
          "type": "p",
          "text": "Activation has two levels. `gameObject.SetActive(false)` deactivates the object and, effectively, all its children (`activeInHierarchy` becomes false even though each child's own `activeSelf` is unchanged). `component.enabled = false` turns off a single Behaviour: it stops receiving `Update`, but the GameObject and its other components keep running."
        },
        {
          "type": "h",
          "text": "Transforms and the hierarchy"
        },
        {
          "type": "p",
          "text": "Every GameObject has exactly one **Transform** (or `RectTransform` for UI), and the Transform is what makes the hierarchy: parenting is a Transform relationship. A Transform stores local position, rotation (a quaternion) and scale relative to its parent; world values are derived by walking up the chain. Reading `transform.position` composes parent matrices, and writing it marks the whole subtree dirty, because every child's world matrix just changed."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Two writes, two dirty propagations through the subtree\ntransform.position = p;\ntransform.rotation = r;\n\n// One write, one propagation\ntransform.SetPositionAndRotation(p, r);\n\n// Local space avoids composing parent matrices when you already work locally\ntransform.localPosition += velocity * Time.deltaTime;"
        },
        {
          "type": "p",
          "text": "Unity stores each root hierarchy in a contiguous `TransformHierarchy` buffer so it can update and dispatch change notifications efficiently, and so jobs can process transforms in parallel per root. The practical consequence: a single giant root containing 5,000 moving objects serialises work that could have been parallel, and reparenting objects at runtime forces buffer reallocation. Flat hierarchies of moderate depth are faster than a tidy \"folder\" tree of empty GameObjects that move every frame."
        },
        {
          "type": "h",
          "text": "Scenes"
        },
        {
          "type": "p",
          "text": "A **Scene** is a serialized collection of root GameObjects plus per-scene settings such as lighting data. You can load scenes additively (`SceneManager.LoadSceneAsync(name, LoadSceneMode.Additive)`) to split a world into a persistent core (player, managers, UI) and streamed content chunks. Cross-scene references are not serialized: a field in scene A cannot point at an object in scene B in saved data, so you wire those up at runtime through registries, ScriptableObject channels or lookups."
        },
        {
          "type": "h",
          "text": "Prefabs, nesting, variants and overrides"
        },
        {
          "type": "p",
          "text": "A **Prefab** is a GameObject hierarchy saved as an asset. Placing it in a scene creates a **prefab instance**, which is stored not as a copy but as a reference to the prefab asset plus a list of **property modifications**: `propertyPath`, target and new value. When the asset changes, every instance re-derives itself, except for the properties it overrides."
        },
        {
          "type": "list",
          "items": [
            "**Nested prefabs**: a prefab can contain instances of other prefabs, and those keep their link. Fixing the wheel prefab updates every car prefab that contains it.",
            "**Prefab variants**: a prefab that inherits from a base prefab and stores only its differences. `EnemyFast` is a variant of `Enemy` with a higher speed; changes to `Enemy` flow into it unless overridden.",
            "**Overrides** come in four kinds: modified properties, added components, removed components and added GameObjects. The Overrides dropdown on an instance lets you Apply them to the asset (or to a specific level of a nested or variant chain) or Revert them.",
            "**Prefab Mode** opens the asset in isolation for editing; edits there change the asset, not an instance.",
            "**Unpacking** a prefab instance severs the link permanently; it becomes plain GameObjects in the scene."
          ]
        },
        {
          "type": "p",
          "text": "Back to the racer: on track 12 someone had changed the NPC collider's size in the scene, which recorded an override for `m_Size`. The fix on the prefab asset changed the default, but overrides win, so track 12 kept its local value. The bold labels and the blue bar in the Inspector were telling the truth; nobody looked."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Overrides are sticky and silent. A value that was overridden by accident, even to the same number, stays overridden forever. Periodically audit instances with the Overrides dropdown, and prefer variants over scene-instance overrides for intentional differences, because variants are reviewable assets."
        },
        {
          "type": "h",
          "text": "Play Mode"
        },
        {
          "type": "p",
          "text": "Pressing Play runs the game inside the Editor using the currently loaded scenes. By default changes you make in the Inspector during Play Mode are discarded when you exit, because the Editor restores the scene from its saved state. Changes to **assets** (materials, ScriptableObjects) made during Play Mode are not reverted, since they are edits to files, not to the scene. Play Mode is also not a build: Editor-only code paths, asset loading from the AssetDatabase and missing platform stripping mean that \"works in Play Mode\" is a weak claim until it runs in a player build."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "When an agent changes prefabs, have it do so through the Editor (Editor scripts, the Unity CLI or MCP running C# in the Editor) rather than by editing YAML; the version-control lesson explains why. Then verify the result the way this lesson suggests: open the scene, check the Console for Missing references and check each touched instance's Overrides dropdown for entries nobody intended."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Use variants for families of things (enemy tiers, weapon skins) and nested prefabs for shared parts (wheels, UI widgets). Keep scene overrides for genuinely per-placement data such as a spawn point's patrol route."
        }
      ],
      "keyPoints": [
        "A GameObject is a container; behaviour and data live in Components, and every object has exactly one Transform that defines the hierarchy.",
        "Assets are referenced by GUID in `.meta` files plus local file IDs; losing a `.meta` breaks every reference to that asset.",
        "Prefab instances store only property modifications against the asset, so overrides always win over later changes to the asset.",
        "Variants inherit from a base prefab and nested prefabs keep their own link, which makes shared fixes propagate automatically.",
        "Inspector changes in Play Mode are discarded on exit, but changes to assets made during Play Mode persist."
      ],
      "quiz": [
        {
          "q": "You fix a collider size on the `Mechanic` prefab asset. Every track updates except track 12. What is the most likely cause?",
          "options": [
            "Track 12 has an override on that collider property",
            "Track 12 needs a full asset reimport to refresh",
            "The prefab asset was not saved in Prefab Mode",
            "Track 12 loads the scene additively at runtime"
          ],
          "answer": 0,
          "explain": "Instances store property modifications, and an existing override for the collider size takes precedence over the asset's new default. An unsaved asset would fail on every track, not just one."
        },
        {
          "q": "A child object's `activeSelf` is true, yet it is not rendered and its `Update` never runs. What explains this?",
          "options": [
            "Its MeshRenderer component has been disabled",
            "A parent GameObject is inactive in the hierarchy",
            "Its Transform has a scale of zero on every axis",
            "It was instantiated from an unpacked prefab"
          ],
          "answer": 1,
          "explain": "Deactivating a parent makes `activeInHierarchy` false for every child while their own `activeSelf` stays true, which stops both rendering and Update. A disabled renderer or zero scale would hide it but Update would still run."
        },
        {
          "q": "You need `EnemyArmored` that is identical to `Enemy` except for health and a shield mesh, and should pick up future changes to `Enemy`. What do you create?",
          "options": [
            "A copy of the `Enemy` prefab asset",
            "An unpacked instance saved as a new prefab",
            "A prefab variant based on `Enemy`",
            "A scene instance of `Enemy` with overrides"
          ],
          "answer": 2,
          "explain": "A variant inherits from its base and stores only differences as a reviewable asset. A copy or unpacked prefab loses the link, and scene overrides only apply to that one placement."
        },
        {
          "q": "A profiler capture shows high cost in transform change dispatch. 3,000 projectiles move every frame, all parented under one `Projectiles` root. What change most likely helps?",
          "options": [
            "Set each projectile's position twice per frame",
            "Move the root deeper into a manager object",
            "Disable the projectiles' MeshRenderer components",
            "Spawn projectiles as separate root objects"
          ],
          "answer": 3,
          "explain": "Each root hierarchy is a unit for transform updates and change dispatch, so one giant root serialises work; splitting into roots allows parallel processing. Moving the root deeper makes the hierarchy worse, not better."
        },
        {
          "q": "During Play Mode you tune a light in the scene and a value on a `DifficultySettings` ScriptableObject asset. You exit Play Mode. What remains?",
          "options": [
            "The ScriptableObject change, not the light change",
            "The light change, not the ScriptableObject change",
            "Both changes remain until the Editor restarts",
            "Neither change remains after exiting Play Mode"
          ],
          "answer": 0,
          "explain": "Scene state is restored on exit, but the ScriptableObject is an asset file and edits to it persist. That asymmetry regularly surprises people who tweak data assets while testing."
        }
      ]
    },
    {
      "id": "unity-lifecycle-scripting",
      "title": "MonoBehaviour Lifecycle, Coroutines, Async and ScriptableObjects",
      "minutes": 13,
      "summary": "The exact order Unity calls your scripts in, how to sequence systems, when to use coroutines versus Awaitable, and how ScriptableObjects carry data and events.",
      "lesson": [
        {
          "type": "p",
          "text": "A bug report: \"Sometimes the HUD shows 0 health on level start.\" It reproduces one time in five, only in builds. The `HUD` reads `player.Health` in its `Start`, and `Player` sets `Health` in its own `Start`. Unity does not promise which `Start` runs first between two objects, and the order can change between Editor and build. Lifecycle bugs are ordering bugs, and you fix them by knowing exactly what Unity guarantees and what it does not."
        },
        {
          "type": "h",
          "text": "The lifecycle, in order"
        },
        {
          "type": "list",
          "items": [
            "**Awake**: once, when the object is loaded or instantiated, if its GameObject is active. Runs even if the component itself is disabled. Use it for self-initialisation: caching own components, setting own fields.",
            "**OnEnable**: right after Awake (per object), and again every time the component or GameObject is re-enabled. Subscribe to events here.",
            "**Start**: once, before the component's first Update, and only if the component is enabled. Every Awake and OnEnable of objects in the same loaded scene has run by then, so Start is where you may talk to other objects.",
            "**FixedUpdate**: on the fixed physics timestep (default 0.02 s, 50 Hz). It runs zero, one or several times per rendered frame depending on how much time has accumulated.",
            "**Update**: once per rendered frame. Gameplay logic and input.",
            "**LateUpdate**: once per frame after every Update and after animation evaluation. Cameras that follow animated targets belong here.",
            "**OnDisable**: when the component or GameObject is disabled, and before OnDestroy. Unsubscribe here.",
            "**OnDestroy**: when the object is destroyed or its scene unloads, only if it was previously active (Awake ran)."
          ]
        },
        {
          "type": "p",
          "text": "Between FixedUpdate and Update sit the physics simulation and trigger/collision callbacks; between Update and LateUpdate sits the Animator update for normally updated animators; after LateUpdate come rendering and `WaitForEndOfFrame` coroutines. The frame loop itself is a `PlayerLoop` you can inspect and extend via `UnityEngine.LowLevel.PlayerLoop`."
        },
        {
          "type": "h",
          "text": "Fixed timestep arithmetic"
        },
        {
          "type": "p",
          "text": "At 60 fps a frame is 16.7 ms and the fixed step is 20 ms, so FixedUpdate runs on roughly five of every six frames. At 30 fps (33.3 ms) it runs once or twice per frame. If a frame hitches to 200 ms, Unity would owe 10 fixed steps; the **Maximum Allowed Timestep** setting (default one third of a second) caps the catch-up so a slow frame does not trigger a spiral of ever-more physics work. The consequences for input handling and smooth motion (latching input, Rigidbody interpolation) are covered in the physics lesson."
        },
        {
          "type": "h",
          "text": "Controlling execution order"
        },
        {
          "type": "p",
          "text": "Across different scripts, Unity's default order for the same callback is undefined. You have three tools: the Script Execution Order list in Project Settings, the `[DefaultExecutionOrder(n)]` attribute on a class (lower runs earlier), and, best of all, explicit initialisation where one bootstrapper calls `Init()` on systems in a known order. Fix the HUD bug by having the Player set `Health` in Awake (self-init) and the HUD read it in Start (cross-object), or by having the HUD subscribe to a health-changed event so order stops mattering."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "[DefaultExecutionOrder(-100)] // runs before default-order scripts\npublic class Player : MonoBehaviour\n{\n    public event System.Action<int> HealthChanged;\n    public int Health { get; private set; }\n\n    void Awake() => Health = 100;            // self-init only\n\n    public void Damage(int amount)\n    {\n        Health -= amount;\n        HealthChanged?.Invoke(Health);\n    }\n}\n\npublic class Hud : MonoBehaviour\n{\n    [SerializeField] Player player;\n\n    void OnEnable()  => player.HealthChanged += Show;\n    void OnDisable() => player.HealthChanged -= Show;\n    void Start()     => Show(player.Health); // other objects are awake now\n    void Show(int hp) { /* update label */ }\n}"
        },
        {
          "type": "h",
          "text": "Coroutines"
        },
        {
          "type": "p",
          "text": "A coroutine is an `IEnumerator` method driven by the engine: `StartCoroutine(Fade())` runs it until the first `yield`, then resumes it at a point in the player loop determined by what was yielded (`null` for next frame after Update, `WaitForFixedUpdate`, `WaitForSeconds`, `WaitForEndOfFrame`). It is a state machine generated by the C# compiler, scheduled by the MonoBehaviour that started it. Coroutines stop when that GameObject is deactivated or destroyed, but **not** when the component is merely disabled. They cannot return values, exceptions inside them are logged rather than propagated, and every `StartCoroutine` plus `new WaitForSeconds` allocates, which matters if you start thousands."
        },
        {
          "type": "h",
          "text": "async/await and Awaitable"
        },
        {
          "type": "p",
          "text": "Since Unity 2023.1 (and so in Unity 6), `UnityEngine.Awaitable` gives you engine-aware async: `await Awaitable.NextFrameAsync()`, `WaitForSecondsAsync`, `FixedUpdateAsync`, `EndOfFrameAsync`, plus `BackgroundThreadAsync()` and `MainThreadAsync()` to hop threads. Awaitables are pooled to avoid allocations, which is why you must await each instance only once. Unlike coroutines, async methods are not tied to any object: if the object is destroyed mid-await, the method resumes anyway and touches a dead object. Pass `destroyCancellationToken` (available on MonoBehaviour) and handle `OperationCanceledException`."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "async Awaitable FlashAsync()\n{\n    var token = destroyCancellationToken;\n    try\n    {\n        for (int i = 0; i < 6; i++)\n        {\n            sprite.enabled = !sprite.enabled; // [SerializeField] SpriteRenderer sprite\n            await Awaitable.WaitForSecondsAsync(0.1f, token);\n        }\n    }\n    catch (System.OperationCanceledException) { /* object destroyed */ }\n}"
        },
        {
          "type": "p",
          "text": "`System.Threading.Tasks.Task` also works because Unity installs a `SynchronizationContext` that resumes continuations on the main thread, but Task allocates more and has no frame-aware waits. Avoid `async void` except for event handlers: exceptions escape to the context and are hard to trace. Rule of thumb: coroutines for simple object-scoped sequences, Awaitable for anything returning a value, composing calls or needing cancellation."
        },
        {
          "type": "h",
          "text": "ScriptableObjects as data and events"
        },
        {
          "type": "p",
          "text": "A **ScriptableObject** is a serializable object that lives as an asset rather than on a GameObject. Fifty enemies referencing one `EnemyStats` asset share one copy of the data instead of fifty serialized copies, and designers tune it without touching scenes. ScriptableObjects also work as decoupled **event channels**: a `GameEvent` asset holds a list of listeners; the player raises it, the HUD and audio listen, and neither references the other, which also solves the cross-scene reference problem."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "[CreateAssetMenu(menuName = \"Events/Game Event\")]\npublic class GameEvent : ScriptableObject\n{\n    readonly List<System.Action> listeners = new();\n    public void Raise() { for (int i = listeners.Count - 1; i >= 0; i--) listeners[i](); }\n    public void Add(System.Action a) => listeners.Add(a);\n    public void Remove(System.Action a) => listeners.Remove(a);\n}"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Runtime writes to a ScriptableObject in the Editor change the asset and persist after Play Mode; in a build they reset on next launch. Never use an SO as save-game storage, and treat runtime state on SOs (like the listener list above) as something to clear explicitly, especially with domain reload disabled."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "When an agent writes MonoBehaviours, check three things: cross-object access is not in Awake, every `+=` in OnEnable has a matching `-=` in OnDisable, and every async method awaiting across frames takes `destroyCancellationToken`. Agents also tend to invent Awaitable members from Task habits; ask them to stick to documented `Awaitable` static methods and to compile in the Editor before claiming done."
        }
      ],
      "keyPoints": [
        "Awake is for self-initialisation, Start for talking to other objects; order of the same callback across scripts is undefined unless you set it.",
        "FixedUpdate runs zero or more times per frame on a fixed step; read input in Update, apply forces in FixedUpdate.",
        "Coroutines stop with their GameObject but not when the component is disabled; async methods stop with nothing unless you cancel them.",
        "Awaitable gives frame-aware, pooled async in Unity 6; pass `destroyCancellationToken` and await each instance once.",
        "ScriptableObjects share data across instances and decouple systems as event channels, but runtime edits persist in the Editor."
      ],
      "quiz": [
        {
          "q": "The game runs at 30 fps with the default fixed timestep of 0.02 s. Roughly how many times does FixedUpdate run per rendered frame?",
          "options": [
            "Exactly once per rendered frame",
            "Once or twice, averaging about 1.7",
            "About 0.6 times on average",
            "Exactly twice per rendered frame"
          ],
          "answer": 1,
          "explain": "A 33.3 ms frame accumulates 1.67 fixed steps on average, so some frames get one and some get two. FixedUpdate is not locked to the frame rate."
        },
        {
          "q": "Every other script's Awake reads settings from `ConfigLoader`, which loads them in its own Awake. Which approach reliably runs `ConfigLoader.Awake` first?",
          "options": [
            "Add `[DefaultExecutionOrder(-100)]` to ConfigLoader",
            "Place ConfigLoader at the top of the Hierarchy",
            "Load the settings in ConfigLoader.OnValidate",
            "Make ConfigLoader's Awake method a static one"
          ],
          "answer": 0,
          "explain": "Script execution order (the attribute or the Project Settings list) applies to Awake as well as later callbacks. Hierarchy position is not a documented ordering guarantee, and OnValidate is an Editor callback, not a runtime one."
        },
        {
          "q": "A turret's `async Awaitable` loop keeps logging `MissingReferenceException` after the turret is destroyed. Which change fixes it?",
          "options": [
            "Disable the turret component before calling Destroy",
            "Replace the waits with `Task.Delay` calls instead",
            "Pass `destroyCancellationToken` to each await call",
            "Start the loop from Awake instead of from Start"
          ],
          "answer": 2,
          "explain": "Async methods are not owned by the object, so they resume after destruction; cancelling via `destroyCancellationToken` ends them. Disabling the component would not stop an async method either."
        },
        {
          "q": "A coroutine blinking a sprite keeps running after `blinker.enabled = false`. What is going on?",
          "options": [
            "Coroutines run on a separate thread from the component",
            "The coroutine is cached by the Animator until next frame",
            "Disabling only takes effect after the next LateUpdate",
            "Disabling the component does not stop its coroutines"
          ],
          "answer": 3,
          "explain": "Coroutines are stopped by deactivating or destroying the GameObject, or by `StopCoroutine`, not by disabling the MonoBehaviour. Nothing about coroutines involves threads."
        },
        {
          "q": "`Hud.Start` reads `player.Health` and sometimes sees 0; `Player` assigns Health in its own Start. What is the most robust fix?",
          "options": [
            "Assign Health in Player.Awake and read it in Hud.Start",
            "Move the HUD read into Hud.Awake so it runs earlier",
            "Add a one-frame coroutine delay before reading Health",
            "Put both objects under the same parent GameObject"
          ],
          "answer": 0,
          "explain": "All Awake calls in a loaded scene finish before any Start, so self-initialising in Awake and reading in Start is guaranteed. Moving the read to Awake makes it worse, and a frame delay only hides the race."
        }
      ]
    },
    {
      "id": "unity-csharp-memory-serialization",
      "title": "C# in Unity: Memory, Garbage Collection and Serialization",
      "minutes": 13,
      "summary": "How Unity's managed heap and garbage collector behave, how to keep hot paths allocation-free, why destroyed objects compare equal to null, and what the serializer will and will not save.",
      "lesson": [
        {
          "type": "p",
          "text": "A mobile shooter runs at a smooth 60 fps, except that every eight to ten seconds there is a 25 ms hitch. The profiler shows `GC.Collect` in the spike, and the GC Alloc column shows 3.2 KB allocated per frame, mostly from a damage-number system that formats strings, a LINQ query that finds the nearest enemy and a lambda passed to a sort. None of these look expensive in isolation. Together they fill the heap and force a collection mid-fight. Unity C# is ordinary C# running in an unusual runtime, and you need to know where the differences bite."
        },
        {
          "type": "h",
          "text": "The managed heap and the GC"
        },
        {
          "type": "p",
          "text": "Unity's scripting runtime (Mono in the Editor and in Mono builds, IL2CPP for most shipped players) uses the **Boehm-Demers-Weiser** garbage collector. Two properties matter. It is **non-generational**: every collection marks the whole live heap, so cost scales with how much you keep alive, not with how much garbage you made. It is **non-compacting**: objects never move, so the heap fragments, and when no free block is large enough the heap grows. Unity does not reliably return that memory to the OS, so a one-off spike of allocations raises your memory footprint for the rest of the session."
        },
        {
          "type": "p",
          "text": "**Incremental GC** (enabled by default in new projects for years and in Unity 6) splits the marking phase across frames, using a time slice per frame, instead of stopping the world for one long pass. It turns a 25 ms hitch into a few milliseconds spread over several frames, at the cost of write barriers that make every reference write slightly slower. It reduces spikes; it does not reduce work. If you allocate faster than the incremental collector can keep up, it falls back to a full blocking collection. Unity has announced a move toward the CoreCLR runtime, which brings a different, generational GC; check your Unity version before relying on runtime-specific behaviour."
        },
        {
          "type": "h",
          "text": "The frame-budget arithmetic"
        },
        {
          "type": "p",
          "text": "At 60 fps you have 16.7 ms per frame for everything. A modest 1 KB per frame is 60 KB per second, 3.6 MB per minute. With a heap of tens of MB of live objects, each full mark can cost several milliseconds on a mid-range phone. The target for gameplay hot paths (Update, FixedUpdate, per-entity logic) is therefore **zero GC Alloc per frame** in steady state, measured in the Profiler's CPU module with the GC Alloc column, or with the Memory Profiler package for heap contents."
        },
        {
          "type": "h",
          "text": "Common hidden allocations"
        },
        {
          "type": "list",
          "items": [
            "**String building**: `\"HP: \" + hp` allocates a new string every call. Cache the label and only rebuild on change, or write into a `StringBuilder` / TextMeshPro `SetText` overloads that take numbers.",
            "**Boxing**: passing a struct or enum where `object` or an interface is expected copies it to the heap, for example `string.Format(\"{0}\", 42)` or storing structs in a `List<IDamageable>`.",
            "**LINQ**: `enemies.Where(...).OrderBy(...).First()` allocates iterators, delegates and often buffers. Fine in tools and loading code, not in Update.",
            "**Closures**: a lambda that captures a local or `this` allocates a closure object and a delegate each time it is created. Non-capturing lambdas are cached by the compiler.",
            "**Array-returning APIs**: `GetComponents<T>()`, `Physics.RaycastAll`, `Mesh.vertices` and `Renderer.materials` return fresh arrays. Use the `List<T>` overloads, `Physics.RaycastNonAlloc` or `Physics.Raycast` with a preallocated buffer, and cache mesh data.",
            "**Coroutine yields**: `yield return new WaitForSeconds(1f)` allocates each time; cache the instance if the delay is constant.",
            "**`foreach` over an interface**: iterating a `List<T>` directly uses a struct enumerator and is allocation-free, but iterating it through `IEnumerable<T>` boxes the enumerator."
          ]
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Before: allocates every frame (closure + LINQ + string)\nvoid Update()\n{\n    var target = enemies.Where(e => e.Alive)\n                        .OrderBy(e => (e.Pos - pos).sqrMagnitude).FirstOrDefault();\n    label.text = \"Target: \" + target?.Name;\n}\n\n// After: zero steady-state allocations\nEnemy current;\nvoid Update()\n{\n    Enemy best = null; float bestD = float.MaxValue;\n    for (int i = 0; i < enemies.Count; i++)\n    {\n        var e = enemies[i];\n        if (!e.Alive) continue;\n        float d = (e.Pos - pos).sqrMagnitude;\n        if (d < bestD) { bestD = d; best = e; }\n    }\n    if (best != current) { current = best; label.text = best ? best.Name : \"\"; }\n}"
        },
        {
          "type": "h",
          "text": "Structs and value semantics"
        },
        {
          "type": "p",
          "text": "`Vector3`, `Quaternion` and `Color` are structs. That is why `transform.position.x = 5` does not compile: the property returns a copy, and modifying a temporary would be lost. Copy the struct, modify, assign back. Structs avoid heap allocation and keep arrays of data contiguous, which is what makes Burst and the job system fast. But large structs passed by value cost copies; use `in` or `ref` parameters for structs bigger than a few machine words, and never mutate a struct through an interface reference, because you are mutating a boxed copy."
        },
        {
          "type": "h",
          "text": "The fake null"
        },
        {
          "type": "p",
          "text": "Every `UnityEngine.Object` (GameObject, Component, ScriptableObject, assets) is a C# wrapper around a native object. `Destroy` frees the native side at the end of the frame, but the C# wrapper lives until nothing references it. Unity overrides `==` and the implicit bool conversion on `UnityEngine.Object` so that a destroyed object compares equal to `null`. This is the **fake null**: the reference is not null to the CLR, but `obj == null` returns true."
        },
        {
          "type": "list",
          "items": [
            "`?.`, `??`, `is null` and `ReferenceEquals` bypass Unity's operator and test the real C# reference, so `enemy?.TakeDamage()` happily calls into a destroyed object and throws `MissingReferenceException`.",
            "Declaring a variable as `object` or an interface type also loses the override, because operator resolution is static.",
            "`Destroy` is deferred: in the same frame right after `Destroy(go)`, `go == null` is still false.",
            "In the Editor, unassigned serialized fields can hold a fake-null placeholder used to produce a clearer `UnassignedReferenceException`.",
            "The overloaded `==` calls into native code to check liveness, so it is slightly slower than a plain reference comparison; in very hot loops, cache liveness instead of comparing to null repeatedly."
          ]
        },
        {
          "type": "h",
          "text": "Serialization rules"
        },
        {
          "type": "p",
          "text": "Unity's serializer is what saves scenes and prefabs and what the Inspector edits. It is not .NET serialization and has its own rules. A field is serialized if it is `public` or marked `[SerializeField]`, and is not `static`, `const` or `readonly`. Properties are not serialized, but an auto-property's backing field can be with `[field: SerializeField]`. Supported types are primitives, enums, strings, Unity types such as `Vector3` and `AnimationCurve`, references to `UnityEngine.Object`s, `[Serializable]` plain classes and structs, and arrays or `List<T>` of those. `Dictionary`, multidimensional arrays and nested lists are not serialized."
        },
        {
          "type": "p",
          "text": "Plain `[Serializable]` class fields are serialized **inline by value**: no null (Unity creates an instance), no polymorphism (a `Weapon` field holding a `Sword` is saved as a `Weapon`), and no shared references (two fields pointing at the same object become two copies on reload). `[SerializeReference]` changes that for a field: it serializes managed references with their concrete type, supports null and preserves sharing within the same host object. It does not work on `UnityEngine.Object` types, and renaming a class used with it breaks the stored type name unless you add `[MovedFrom]`."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "public interface IEffect { void Apply(Unit u); }\n[System.Serializable] public class Burn : IEffect { public float dps; public void Apply(Unit u) {} }\n[System.Serializable] public class Slow : IEffect { public float factor; public void Apply(Unit u) {} }\n\npublic class Ability : ScriptableObject\n{\n    [SerializeField] int cost;                         // private but serialized\n    [field: SerializeField] public float Cooldown { get; private set; }\n    [SerializeReference] List<IEffect> effects = new(); // polymorphic list\n}"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Serialized values beat field initializers. If you change `public float speed = 5;` to `= 8;`, every existing prefab and scene keeps its saved 5. Renaming a field loses its data unless you add `[FormerlySerializedAs(\"oldName\")]`."
        },
        {
          "type": "h",
          "text": "Domain and scene reload"
        },
        {
          "type": "p",
          "text": "By default entering Play Mode reloads the scripting domain (fresh statics, re-run static constructors) and reloads the scene. On a large project that can take several seconds. **Enter Play Mode Settings** in Project Settings > Editor let you skip domain reload, scene reload or both, which can make entering Play Mode near-instant. The price: static fields, static events and singletons keep their values from the previous session. Reset them explicitly with a method marked `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]`."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "public static class Score\n{\n    public static int Value;\n    public static event System.Action<int> Changed;\n\n    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]\n    static void ResetStatics() { Value = 0; Changed = null; }\n}"
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents write idiomatic server C#: LINQ, `?.`, string interpolation, async Task everywhere. In Unity code that runs per frame, ask for allocation-free loops, `== null` (not `?.`) on UnityEngine.Object, and the List overloads of query APIs. Verify by profiling the GC Alloc column rather than reading the code. When an agent renames serialized fields or classes used by `[SerializeReference]`, require `[FormerlySerializedAs]` or `[MovedFrom]` and check a prefab still holds its values."
        }
      ],
      "keyPoints": [
        "Unity's Boehm GC is non-generational and non-compacting; incremental mode spreads the cost but does not remove it, so target zero per-frame allocations.",
        "Hidden allocations come from strings, boxing, LINQ, capturing lambdas, array-returning APIs and cached-but-not-cached yield instructions.",
        "Destroyed UnityEngine.Objects compare equal to null only through Unity's `==`; `?.`, `??` and `is null` bypass it.",
        "The serializer saves public or `[SerializeField]` fields inline by value; `[SerializeReference]` adds polymorphism, null and shared references.",
        "Disabling domain reload speeds up iteration but leaves statics alive; reset them with `RuntimeInitializeOnLoadMethod`."
      ],
      "quiz": [
        {
          "q": "The profiler shows 0.8 KB GC Alloc per frame and a 20 ms GC spike every few seconds. Incremental GC is on. What is the most effective fix?",
          "options": [
            "Call `GC.Collect()` manually every frame",
            "Raise the target frame rate so frames are shorter",
            "Remove the per-frame allocations in hot paths",
            "Switch from IL2CPP to the Mono scripting backend"
          ],
          "answer": 2,
          "explain": "Incremental GC only spreads work; sustained allocation still forces collections, so eliminating the garbage is the fix. Collecting every frame would pay a full mark each frame."
        },
        {
          "q": "`target?.Hit()` throws `MissingReferenceException` after the target was destroyed last frame. Why?",
          "options": [
            "`?.` checks the C# reference, which is not null",
            "`Destroy` is deferred until the scene is unloaded",
            "The native object is freed before the wrapper exists",
            "Unity's `==` override throws on destroyed objects"
          ],
          "answer": 0,
          "explain": "The null-conditional operator bypasses Unity's overloaded `==`, so the live C# wrapper passes the check and the call reaches a dead native object. Use `if (target != null)` instead."
        },
        {
          "q": "A `Weapon` field holds a `Sword` (subclass) assigned in code. After reloading the scene, it behaves like a plain `Weapon`. Which fix preserves the subclass?",
          "options": [
            "Make the `Weapon` field public instead of private",
            "Mark the `Weapon` class with `[System.Serializable]`",
            "Change the field's type to `object` for flexibility",
            "Annotate the field with `[SerializeReference]`"
          ],
          "answer": 3,
          "explain": "Plain serialized classes are stored inline by declared type, dropping the subclass; `[SerializeReference]` stores the concrete type. Visibility and `[Serializable]` do not change the inline-by-value behaviour."
        },
        {
          "q": "With domain reload disabled, the second Play session starts with last session's score and duplicate event handlers. What is the right fix?",
          "options": [
            "Re-enable scene reload while keeping domain reload off",
            "Reset statics in a `SubsystemRegistration` init method",
            "Move the score into a field initializer on the class",
            "Mark the static score field with `[NonSerialized]`"
          ],
          "answer": 1,
          "explain": "Without domain reload, statics survive between sessions and must be reset explicitly; `RuntimeInitializeOnLoadMethod(SubsystemRegistration)` runs early on each Play. Scene reload does not touch statics."
        },
        {
          "q": "You change `public float speed = 5f;` to `= 8f;` in a MonoBehaviour. Existing enemy prefabs still move at 5. Why?",
          "options": [
            "Prefabs cache compiled scripts until a reimport",
            "Public fields are read-only once the prefab is saved",
            "Serialized values in the prefab override initializers",
            "Field initializers only run in development builds"
          ],
          "answer": 2,
          "explain": "The prefab already stores `speed: 5`, and deserialization overwrites the initializer's value. Only newly added components pick up the new default."
        }
      ]
    },
    {
      "id": "unity-rendering",
      "title": "Rendering in Unity: Pipelines, Batching, Shaders and Lighting",
      "minutes": 14,
      "summary": "How Unity's render pipelines turn scenes into draw calls, how the SRP Batcher, instancing and batching cut CPU cost, and how shader variants, baked lighting and Render Graph fit together.",
      "lesson": [
        {
          "type": "p",
          "text": "A city-builder hits 24 fps on a mid-range Android phone. The GPU timing is 11 ms, but the main thread spends 19 ms and the render thread 17 ms, and the Frame Debugger shows over 2,000 draw events with 900 SetPass calls. The art is not too heavy for the GPU; the CPU is drowning in state changes because buildings use 300 slightly different materials and an old custom shader that breaks batching. Unity rendering performance is usually about how much work the CPU does to describe the frame, and the tools below exist to shrink it."
        },
        {
          "type": "h",
          "text": "Three pipelines"
        },
        {
          "type": "list",
          "items": [
            "**Built-in Render Pipeline**: the legacy fixed pipeline. Still present, but feature development has moved to the Scriptable Render Pipelines, and new projects should not start on it.",
            "**URP (Universal Render Pipeline)**: the default for most projects, scaling from mobile and Switch-class hardware to PC and console. Forward, Forward+ and Deferred rendering paths, Renderer Features for custom passes, Shader Graph support.",
            "**HDRP (High Definition Render Pipeline)**: physically based, high-end PC and console target with volumetrics, ray tracing integration and a heavier baseline cost per frame.",
            "Shaders and many assets are pipeline-specific: a Built-in shader renders magenta under URP. Switching pipelines mid-project is a migration, not a toggle."
          ]
        },
        {
          "type": "p",
          "text": "Both SRPs are C# code in packages that you can read, which is how you find out what a setting actually does. A pipeline's per-frame job: cull renderers against each camera, sort them, set up passes (shadows, depth, opaques, skybox, transparents, post-processing) and issue draws through the graphics API."
        },
        {
          "type": "h",
          "text": "Where CPU rendering cost comes from"
        },
        {
          "type": "p",
          "text": "A **draw call** asks the GPU to draw a mesh. What is expensive on the CPU is mostly the **state setup** before it: binding a shader variant (a **SetPass call**), uploading material properties and per-object data, and validating state in the driver. Rough guidance: mobile projects aim for a few hundred draw calls and far fewer SetPass calls per frame; PC and console handle thousands. The batching techniques below attack different parts of this cost."
        },
        {
          "type": "h",
          "text": "SRP Batcher"
        },
        {
          "type": "p",
          "text": "The **SRP Batcher** does not merge meshes. It makes consecutive draws that use the same shader variant cheap. Material properties live in a persistent GPU constant buffer (`UnityPerMaterial`) that is only re-uploaded when a material changes, and per-object data (`UnityPerDraw`) is uploaded in bulk. So 300 different materials sharing one shader variant become one batch of fast draws instead of 300 full setups. For a shader to be compatible, all material properties must be declared in a single `CBUFFER_START(UnityPerMaterial)` block. URP Lit and Shader Graph shaders are compatible; hand-written legacy shaders often are not, and the Inspector of a shader says whether it is."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Setting per-renderer properties with a `MaterialPropertyBlock` makes that renderer incompatible with the SRP Batcher. For per-object variation, prefer distinct material instances on an SRP-compatible shader, or GPU instancing with per-instance properties when the objects share a mesh."
        },
        {
          "type": "h",
          "text": "GPU instancing, static and dynamic batching"
        },
        {
          "type": "list",
          "items": [
            "**GPU instancing**: draws many copies of the same mesh with the same material in one call, with per-instance data such as transforms and colours. Ideal for grass, rocks, crowds. In URP and HDRP the SRP Batcher takes priority, so instancing applies to renderers that are not SRP Batcher compatible or to explicit calls like `Graphics.RenderMeshInstanced`.",
            "**Static batching**: for objects marked Batching Static, Unity combines meshes into large shared vertex and index buffers at build time and draws ranges of them with fewer state changes. It costs memory (a combined copy of every mesh instance) and the objects cannot move.",
            "**Dynamic batching**: transforms small meshes (a few hundred vertices) on the CPU every frame into one buffer. It trades CPU vertex work for draw calls and is rarely a win on modern hardware; URP leaves it off by default.",
            "**GPU Resident Drawer** (Unity 6, URP and HDRP): uses the BatchRendererGroup API to keep scene renderers in GPU memory and draw them with instanced indirect calls, which can cut CPU rendering cost dramatically in large static-heavy scenes. In URP it requires the Forward+ rendering path (or Deferred+ in Unity 6 releases that offer it) and keeping BatchRendererGroup shader variants in Graphics settings."
          ]
        },
        {
          "type": "h",
          "text": "Materials, shader variants and Shader Graph"
        },
        {
          "type": "p",
          "text": "A shader source compiles into many **variants**, one per combination of enabled keywords per pass per platform. `#pragma multi_compile _ FOG_ON` always compiles both states; `#pragma shader_feature _ DETAIL_ON` only includes variants that some material in the build uses. Keywords multiply: ten independent binary `multi_compile` keywords produce 1,024 variants per pass. The results are long build times, large builds, high memory for loaded shaders and runtime hitches the first time a variant and its pipeline state object are created on device. Strip aggressively (Graphics settings, URP asset feature toggles, `IPreprocessShaders`) and prewarm the variants your game actually uses."
        },
        {
          "type": "p",
          "text": "**Shader Graph** generates pipeline-specific HLSL from a node graph. It produces SRP-Batcher-compatible code, supports custom nodes from HLSL, and its keyword nodes create variants just like hand-written pragmas, so a graph with several Boolean keywords can explode variants as easily as code. **Materials** are assets that pick a shader and set its properties; `renderer.material` silently clones the material (a new instance that you must destroy), while `renderer.sharedMaterial` edits the asset."
        },
        {
          "type": "h",
          "text": "Lighting: realtime, mixed and baked"
        },
        {
          "type": "p",
          "text": "Each light is **Realtime**, **Mixed** or **Baked**. Realtime lights are computed every frame and cost per light per object (or per tile in Forward+). Baked lights are precomputed into **lightmaps** by the Progressive Lightmapper and cost nothing at runtime except texture memory and sampling. Mixed lights do both, according to the scene's **Lighting Mode**: **Baked Indirect** (realtime direct light and shadows, baked bounce light), **Shadowmask** (baked shadows from static objects stored in a mask, realtime direct lighting) and **Subtractive** (everything baked, a single realtime shadow from the main light on dynamic objects; cheapest, least accurate)."
        },
        {
          "type": "p",
          "text": "Lightmaps only light static geometry. Dynamic objects get baked **global illumination** from **light probes**: points that store spherical-harmonic lighting, interpolated for each moving renderer. Classic Light Probe Groups need manual placement; **Adaptive Probe Volumes** (URP and HDRP in Unity 6) place probes automatically in a density-adaptive grid and sample per pixel, avoiding the blotchy per-object look."
        },
        {
          "type": "h",
          "text": "Render Graph in URP"
        },
        {
          "type": "p",
          "text": "Since Unity 6, URP builds each frame with the **Render Graph** system. Custom passes declare what they read and write in `RecordRenderGraph`; the graph then culls unused passes, allocates and aliases transient textures, and on tile-based mobile GPUs merges compatible passes into native render passes so intermediate results stay in on-chip memory instead of round-tripping through main memory. Older `Execute`/`OnCameraSetup` style passes rely on a compatibility mode that is being phased out."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Unity 6 URP: a fullscreen tint pass (check signatures against your URP version)\nclass TintPass : ScriptableRenderPass\n{\n    class PassData { public TextureHandle src; public Material mat; }\n    readonly Material mat;\n    public TintPass(Material m) { mat = m; renderPassEvent = RenderPassEvent.BeforeRenderingPostProcessing; }\n\n    public override void RecordRenderGraph(RenderGraph graph, ContextContainer frameData)\n    {\n        var res = frameData.Get<UniversalResourceData>();\n        if (res.isActiveTargetBackBuffer) return;\n        TextureHandle src = res.activeColorTexture;\n        var desc = graph.GetTextureDesc(src);\n        desc.name = \"_TintTarget\"; desc.clearBuffer = false;\n        TextureHandle dst = graph.CreateTexture(desc);\n\n        using var builder = graph.AddRasterRenderPass<PassData>(\"Tint\", out var data);\n        data.src = src; data.mat = mat;\n        builder.UseTexture(src);                 // declared read\n        builder.SetRenderAttachment(dst, 0);     // declared write\n        builder.SetRenderFunc((PassData d, RasterGraphContext ctx) =>\n            Blitter.BlitTexture(ctx.cmd, d.src, new Vector4(1, 1, 0, 0), d.mat, 0));\n        res.cameraColor = dst;                    // later passes read the tinted result\n    }\n}"
        },
        {
          "type": "h",
          "text": "The Frame Debugger"
        },
        {
          "type": "p",
          "text": "Window > Analysis > Frame Debugger freezes a frame and lists every rendering event in order. Selecting an event shows the shader, keywords, material properties, render target and, crucially, why it was not batched with the previous draw. For Render Graph, the Render Graph Viewer shows passes, resource lifetimes and which passes were merged or culled. Pair them with the Profiler: the Profiler tells you whether you are CPU or GPU bound, the Frame Debugger tells you why."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents frequently produce Built-in pipeline shaders (`CGPROGRAM`, `UnityCG.cginc`) or pre-Render-Graph URP passes from older training data. Tell the agent the exact pipeline and Unity version, require HLSL with properties in a `UnityPerMaterial` CBUFFER, and require Render Graph `RecordRenderGraph` for custom passes. Verify in the Editor: the shader Inspector should report SRP Batcher compatible, the Frame Debugger should show the pass where you expect it, and the build's variant count should not jump."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Before optimising rendering, read the Profiler's main thread, render thread and GPU times side by side. High CPU with a lightly loaded GPU means batching and SetPass work; high GPU time means fill rate, overdraw, shader cost or resolution."
        }
      ],
      "keyPoints": [
        "URP is the default pipeline; HDRP targets high-end hardware; Built-in is legacy and its shaders do not work in SRPs.",
        "The SRP Batcher cuts per-draw setup for objects sharing a shader variant; MaterialPropertyBlocks and non-CBUFFER shaders break it.",
        "Instancing, static batching, dynamic batching and the GPU Resident Drawer reduce CPU cost in different ways with different trade-offs.",
        "Shader keywords multiply variants; strip unused ones to protect build size, memory and first-use hitches.",
        "Baked lighting covers static geometry; light probes or Adaptive Probe Volumes light dynamic objects; Render Graph manages URP passes and resources."
      ],
      "quiz": [
        {
          "q": "Main thread 19 ms, render thread 17 ms, GPU 9 ms, 900 SetPass calls. Buildings use 300 materials on a legacy custom shader. What change helps most?",
          "options": [
            "Lower the render resolution to 75 percent",
            "Port the shader to be SRP Batcher compatible",
            "Switch every light in the scene to Realtime",
            "Enable dynamic batching on the URP asset"
          ],
          "answer": 1,
          "explain": "The CPU is bound by per-material setup, which the SRP Batcher removes for draws sharing a compatible shader variant. Lowering resolution targets the GPU, which is not the bottleneck."
        },
        {
          "q": "You set colours on 500 trees through `MaterialPropertyBlock`, and CPU render cost rises. The shader is SRP Batcher compatible. Why?",
          "options": [
            "Property blocks force a shader recompile each frame",
            "Property blocks disable frustum culling for renderers",
            "Those renderers drop out of the SRP Batcher path",
            "Property blocks duplicate the mesh into GPU memory"
          ],
          "answer": 2,
          "explain": "Renderers with a MaterialPropertyBlock are not SRP Batcher compatible and fall back to slower draws. Use instancing with per-instance colour, or material variants, instead."
        },
        {
          "q": "A shader has eight independent `multi_compile` on/off keywords in one pass. How many variants of that pass are compiled per platform?",
          "options": [
            "256 variants for the pass",
            "16 variants for the pass",
            "8 variants for the pass",
            "64 variants for the pass"
          ],
          "answer": 0,
          "explain": "Each independent binary keyword doubles the count, so 2^8 = 256. `shader_feature` would compile only combinations used by materials in the build."
        },
        {
          "q": "Moving characters look flat inside a level lit with lightmaps, while walls look great. What is missing?",
          "options": [
            "Static batching on the characters' renderers",
            "A Shadowmask lighting mode for the main light",
            "Higher lightmap resolution in the bake settings",
            "Light probes or probe volumes for dynamic objects"
          ],
          "answer": 3,
          "explain": "Lightmaps only apply to static geometry; dynamic renderers receive baked indirect lighting through light probes or Adaptive Probe Volumes. Lightmap resolution does not affect moving objects at all."
        },
        {
          "q": "On a tile-based mobile GPU, a URP custom pass written for Render Graph makes the frame cheaper than the same pass written the old way. Most likely why?",
          "options": [
            "Render Graph merges passes to keep data on chip",
            "Render Graph moves blits to an async compute queue",
            "Render Graph skips post-processing on mobile GPUs",
            "Render Graph runs the pass at half resolution"
          ],
          "answer": 0,
          "explain": "Declared reads and writes let Render Graph merge compatible passes into native render passes, avoiding costly memory round-trips on tilers. It does not change resolution or skip effects."
        }
      ]
    },
    {
      "id": "unity-physics-input-animation",
      "title": "Physics, Input and Animation in Unity",
      "minutes": 13,
      "summary": "How Rigidbodies, colliders, the fixed timestep, input handling and the Animator actually fit into Unity's frame.",
      "lesson": [
        {
          "type": "p",
          "text": "A classic first bug in a Unity project: the player character jitters when the camera follows it, bullets occasionally pass straight through thin walls, and the jump button sometimes does nothing. Three different symptoms, one root cause: the code mixes up two clocks. Unity renders on a variable-rate **frame loop** (`Update`, `LateUpdate`), but PhysX simulates on a **fixed-rate loop** (`FixedUpdate`). Physics, input and animation all live at the seam between those two loops, so understanding the seam is most of the job."
        },
        {
          "type": "h",
          "text": "Rigidbody, colliders and who owns the transform"
        },
        {
          "type": "p",
          "text": "A **Collider** (Box, Sphere, Capsule, Mesh, Terrain) is shape data registered with the physics scene. A **Rigidbody** makes the object a simulated body: PhysX integrates its velocity, applies gravity and resolves contacts, then writes the result back to the Transform. Once a non-kinematic Rigidbody exists, the physics engine owns the position; setting `transform.position` every frame fights the solver, teleports through contacts and breaks interpolation. Move dynamic bodies with forces, velocity (`linearVelocity` in Unity 6, formerly `velocity`) or `MovePosition`/`MoveRotation`."
        },
        {
          "type": "list",
          "items": [
            "**Static collider**: collider with no Rigidbody. Meant never to move; level geometry.",
            "**Kinematic Rigidbody** (`isKinematic = true`): moved by your code via `MovePosition`, pushes dynamic bodies but is not pushed back. Use it for anything with a collider that you animate or move from script: doors, moving platforms, trigger volumes that follow a character.",
            "**Dynamic Rigidbody**: fully simulated. Mass, damping, constraints and collision detection mode matter.",
            "**MeshCollider**: a dynamic Rigidbody needs a convex MeshCollider (max 255 triangles for the generated hull); concave meshes are for static or kinematic use. Primitive colliders are much cheaper than meshes for contacts and queries."
          ]
        },
        {
          "type": "h",
          "text": "Layers, the collision matrix and triggers"
        },
        {
          "type": "p",
          "text": "Every GameObject has one of 32 **layers**. The **Layer Collision Matrix** (Project Settings > Physics) decides which layer pairs are even considered during the broadphase. Turning off pairs that can never meaningfully touch (enemy bullets vs enemy, pickups vs terrain, UI-world objects vs everything) is free performance and removes whole classes of bugs. Layers also feed the `LayerMask` argument of every physics query."
        },
        {
          "type": "figure",
          "id": "unity-collision-matrix-bullets",
          "caption": "EnemyBullet × Enemy is off in the matrix, so the bullet passes through the other enemy without a broadphase test and only reports contact against the Player.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 340\" role=\"img\" aria-label=\"Layer Collision Matrix with EnemyBullet versus Enemy turned off: an enemy bullet passes through another enemy and hits the player.\"> <style> .unity-collision-matrix-bullets-t{font-size:13px;fill:var(--fig-ink)} .unity-collision-matrix-bullets-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-collision-matrix-bullets-m{font-size:13px;fill:var(--fig-muted)} .unity-collision-matrix-bullets-on{fill:var(--fig-accent);fill-opacity:.16;stroke:var(--fig-accent);stroke-width:1.5} .unity-collision-matrix-bullets-off{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-collision-matrix-bullets-ck{fill:none;stroke:var(--fig-accent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round} .unity-collision-matrix-bullets-ring{fill:none;stroke-width:2.5;opacity:0} .unity-collision-matrix-bullets-r1{stroke:var(--fig-muted);animation:unity-collision-matrix-bullets-a1 5s linear infinite} .unity-collision-matrix-bullets-r2{stroke:var(--fig-ok);animation:unity-collision-matrix-bullets-a2 5s linear infinite} .unity-collision-matrix-bullets-bul{fill:var(--fig-warn);animation:unity-collision-matrix-bullets-move 5s linear infinite} .unity-collision-matrix-bullets-ghost{fill:none;stroke:var(--fig-muted);stroke-width:2;stroke-dasharray:4 4;opacity:0;animation:unity-collision-matrix-bullets-a1 5s linear infinite} .unity-collision-matrix-bullets-burst{fill:var(--fig-ok);fill-opacity:.35;opacity:0;transform-box:fill-box;transform-origin:center;animation:unity-collision-matrix-bullets-burst 5s ease-out infinite} @keyframes unity-collision-matrix-bullets-move{0%{transform:translateX(0);opacity:1}70%{transform:translateX(135px);opacity:1}72%{transform:translateX(135px);opacity:0}100%{transform:translateX(135px);opacity:0}} @keyframes unity-collision-matrix-bullets-a1{0%,20%{opacity:0}23%,38%{opacity:1}42%,100%{opacity:0}} @keyframes unity-collision-matrix-bullets-a2{0%,68%{opacity:0}71%,84%{opacity:1}88%,100%{opacity:0}} @keyframes unity-collision-matrix-bullets-burst{0%,69%{opacity:0;transform:scale(.3)}71%{opacity:1;transform:scale(.6)}86%{opacity:0;transform:scale(1.6)}100%{opacity:0;transform:scale(1.6)}} </style> <text class=\"unity-collision-matrix-bullets-h\" x=\"24\" y=\"30\">Layer Collision Matrix</text> <text class=\"unity-collision-matrix-bullets-t\" x=\"152\" y=\"131\" text-anchor=\"end\">Default</text> <text class=\"unity-collision-matrix-bullets-t\" transform=\"translate(172 104) rotate(-55)\">Default</text> <rect class=\"unity-collision-matrix-bullets-on\" x=\"162\" y=\"112\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M169 125 l4 4 l8 -9\"/> <text class=\"unity-collision-matrix-bullets-t\" x=\"152\" y=\"161\" text-anchor=\"end\">Player</text> <text class=\"unity-collision-matrix-bullets-t\" transform=\"translate(202 104) rotate(-55)\">Player</text> <rect class=\"unity-collision-matrix-bullets-on\" x=\"162\" y=\"142\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M169 155 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"192\" y=\"142\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M199 155 l4 4 l8 -9\"/> <text class=\"unity-collision-matrix-bullets-t\" x=\"152\" y=\"191\" text-anchor=\"end\">Enemy</text> <text class=\"unity-collision-matrix-bullets-t\" transform=\"translate(232 104) rotate(-55)\">Enemy</text> <rect class=\"unity-collision-matrix-bullets-on\" x=\"162\" y=\"172\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M169 185 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"192\" y=\"172\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M199 185 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"222\" y=\"172\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M229 185 l4 4 l8 -9\"/> <text class=\"unity-collision-matrix-bullets-t\" x=\"152\" y=\"221\" text-anchor=\"end\">EnemyBullet</text> <text class=\"unity-collision-matrix-bullets-t\" transform=\"translate(262 104) rotate(-55)\">EnemyBullet</text> <rect class=\"unity-collision-matrix-bullets-on\" x=\"162\" y=\"202\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M169 215 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"192\" y=\"202\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M199 215 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-off\" x=\"222\" y=\"202\" width=\"26\" height=\"26\" rx=\"7\"/> <rect class=\"unity-collision-matrix-bullets-off\" x=\"252\" y=\"202\" width=\"26\" height=\"26\" rx=\"7\"/> <text class=\"unity-collision-matrix-bullets-t\" x=\"152\" y=\"251\" text-anchor=\"end\">Pickup</text> <text class=\"unity-collision-matrix-bullets-t\" transform=\"translate(292 104) rotate(-55)\">Pickup</text> <rect class=\"unity-collision-matrix-bullets-off\" x=\"162\" y=\"232\" width=\"26\" height=\"26\" rx=\"7\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"192\" y=\"232\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M199 245 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-off\" x=\"222\" y=\"232\" width=\"26\" height=\"26\" rx=\"7\"/> <rect class=\"unity-collision-matrix-bullets-off\" x=\"252\" y=\"232\" width=\"26\" height=\"26\" rx=\"7\"/> <rect class=\"unity-collision-matrix-bullets-off\" x=\"282\" y=\"232\" width=\"26\" height=\"26\" rx=\"7\"/> <text class=\"unity-collision-matrix-bullets-t\" x=\"152\" y=\"281\" text-anchor=\"end\">Terrain</text> <text class=\"unity-collision-matrix-bullets-t\" transform=\"translate(322 104) rotate(-55)\">Terrain</text> <rect class=\"unity-collision-matrix-bullets-on\" x=\"162\" y=\"262\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M169 275 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"192\" y=\"262\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M199 275 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"222\" y=\"262\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M229 275 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"252\" y=\"262\" width=\"26\" height=\"26\" rx=\"7\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M259 275 l4 4 l8 -9\"/> <rect class=\"unity-collision-matrix-bullets-off\" x=\"282\" y=\"262\" width=\"26\" height=\"26\" rx=\"7\"/> <rect class=\"unity-collision-matrix-bullets-off\" x=\"312\" y=\"262\" width=\"26\" height=\"26\" rx=\"7\"/> <rect class=\"unity-collision-matrix-bullets-ring unity-collision-matrix-bullets-r1\" x=\"219\" y=\"199\" width=\"32\" height=\"32\" rx=\"8\"/> <rect class=\"unity-collision-matrix-bullets-ring unity-collision-matrix-bullets-r2\" x=\"189\" y=\"199\" width=\"32\" height=\"32\" rx=\"8\"/> <rect class=\"unity-collision-matrix-bullets-on\" x=\"24\" y=\"306\" width=\"18\" height=\"18\" rx=\"5\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M28 315 l3 3 l6 -7\"/> <text class=\"unity-collision-matrix-bullets-m\" x=\"50\" y=\"320\">pair tested</text> <rect class=\"unity-collision-matrix-bullets-off\" x=\"140\" y=\"306\" width=\"18\" height=\"18\" rx=\"5\"/> <text class=\"unity-collision-matrix-bullets-m\" x=\"166\" y=\"320\">never in broadphase</text> <rect x=\"360\" y=\"40\" width=\"262\" height=\"278\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/> <rect class=\"unity-collision-matrix-bullets-off\" x=\"378\" y=\"58\" width=\"18\" height=\"18\" rx=\"5\"/> <text class=\"unity-collision-matrix-bullets-t\" x=\"404\" y=\"72\">EnemyBullet × Enemy: off</text> <rect class=\"unity-collision-matrix-bullets-on\" x=\"378\" y=\"86\" width=\"18\" height=\"18\" rx=\"5\"/><path class=\"unity-collision-matrix-bullets-ck\" d=\"M382 95 l3 3 l6 -7\"/> <text class=\"unity-collision-matrix-bullets-t\" x=\"404\" y=\"100\">EnemyBullet × Player: on</text> <line x1=\"376\" y1=\"250\" x2=\"606\" y2=\"250\" stroke=\"var(--fig-line)\" stroke-width=\"2\"/> <rect x=\"380\" y=\"180\" width=\"36\" height=\"70\" rx=\"8\" fill=\"var(--fig-bad)\" fill-opacity=\".16\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\"/> <rect x=\"462\" y=\"180\" width=\"36\" height=\"70\" rx=\"8\" fill=\"var(--fig-bad)\" fill-opacity=\".16\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\"/> <rect class=\"unity-collision-matrix-bullets-ghost\" x=\"456\" y=\"174\" width=\"48\" height=\"82\" rx=\"10\"/> <rect x=\"560\" y=\"180\" width=\"36\" height=\"70\" rx=\"8\" fill=\"var(--fig-accent)\" fill-opacity=\".16\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/> <circle class=\"unity-collision-matrix-bullets-burst\" cx=\"560\" cy=\"205\" r=\"16\"/> <circle class=\"unity-collision-matrix-bullets-bul\" cx=\"420\" cy=\"205\" r=\"5\"/> <text class=\"unity-collision-matrix-bullets-m\" x=\"398\" y=\"274\" text-anchor=\"middle\">Enemy</text> <text class=\"unity-collision-matrix-bullets-m\" x=\"480\" y=\"274\" text-anchor=\"middle\">Enemy</text> <text class=\"unity-collision-matrix-bullets-m\" x=\"578\" y=\"274\" text-anchor=\"middle\">Player</text> <text class=\"unity-collision-matrix-bullets-m\" x=\"480\" y=\"160\" text-anchor=\"middle\">passes through</text> <text class=\"unity-collision-matrix-bullets-m\" x=\"578\" y=\"160\" text-anchor=\"middle\">contact</text> <text class=\"unity-collision-matrix-bullets-m\" x=\"491\" y=\"300\" text-anchor=\"middle\">Physics Scene</text> </svg>"
        },
        {
          "type": "p",
          "text": "A collider with `isTrigger` set does not produce contact forces; it reports overlap through `OnTriggerEnter/Stay/Exit`. Messages only fire if at least one of the two objects has a Rigidbody (a kinematic one is fine). `OnCollisionEnter` needs at least one non-kinematic Rigidbody in the pair. A trigger volume on a static object touching another static object will never report anything; that single rule explains most 'my trigger does not fire' threads."
        },
        {
          "type": "h",
          "text": "FixedUpdate, the accumulator and interpolation"
        },
        {
          "type": "p",
          "text": "The lifecycle lesson covered the fixed-step accumulator: each frame Unity runs `FixedUpdate` plus a physics step as many times as needed to catch up in steps of `Time.fixedDeltaTime` (default 0.02 s), capped by Maximum Allowed Timestep. The point here is the consequence: at 144 fps most frames run zero physics steps, at 30 fps most run one or two, so anything rendered or read per frame is out of phase with the simulation."
        },
        {
          "type": "p",
          "text": "Because rendering samples the physics state at arbitrary points between steps, a followed object appears to stutter: some rendered frames show the same physics position twice. **Rigidbody interpolation** (`RigidbodyInterpolation.Interpolate`) renders the body between its previous and current physics poses, at the cost of up to one fixed step of visual latency. Enable it on the player and anything the camera follows, not on hundreds of debris objects. Extrapolate predicts forward instead and overshoots on collisions."
        },
        {
          "type": "figure",
          "id": "unity-rb-interpolate-lanes",
          "caption": "Physics runs every 0.02 s while frames arrive every ~7 ms at 144 fps: without interpolation the body holds a pose across several frames, with Interpolate it glides one step behind.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A body moving under physics: with interpolation None it jumps once per 0.02 s fixed step; with Interpolate it glides between poses one step behind. Below, fixed steps every 20 ms against frames at 144 fps.\"> <style> .unity-rb-interpolate-lanes-t{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-rb-interpolate-lanes-m{font-size:13px;fill:var(--fig-muted)} .unity-rb-interpolate-lanes-s{font-size:12px;fill:var(--fig-muted)} .unity-rb-interpolate-lanes-tr{stroke:var(--fig-line);stroke-width:2;stroke-linecap:round} .unity-rb-interpolate-lanes-pose{fill:var(--fig-line)} .unity-rb-interpolate-lanes-b1{fill:var(--fig-bad);animation:unity-rb-interpolate-lanes-step 4s steps(8,end) infinite} .unity-rb-interpolate-lanes-b2{fill:var(--fig-accent);animation:unity-rb-interpolate-lanes-lin 4s linear infinite} .unity-rb-interpolate-lanes-ph{fill:var(--fig-accent2)} .unity-rb-interpolate-lanes-fr{stroke:var(--fig-ink);stroke-opacity:.55;stroke-width:1.5} @keyframes unity-rb-interpolate-lanes-step{from{transform:translateX(0)}to{transform:translateX(480px)}} @keyframes unity-rb-interpolate-lanes-lin{0%,12.5%{transform:translateX(0)}100%{transform:translateX(420px)}} </style> <text class=\"unity-rb-interpolate-lanes-t\" x=\"20\" y=\"67\">None</text> <text class=\"unity-rb-interpolate-lanes-t\" x=\"20\" y=\"125\">Interpolate</text> <line class=\"unity-rb-interpolate-lanes-tr\" x1=\"150\" y1=\"62\" x2=\"570\" y2=\"62\"/> <line class=\"unity-rb-interpolate-lanes-tr\" x1=\"150\" y1=\"120\" x2=\"570\" y2=\"120\"/> <circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"150\" cy=\"62\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"150\" cy=\"120\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"210\" cy=\"62\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"210\" cy=\"120\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"270\" cy=\"62\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"270\" cy=\"120\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"330\" cy=\"62\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"330\" cy=\"120\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"390\" cy=\"62\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"390\" cy=\"120\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"450\" cy=\"62\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"450\" cy=\"120\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"510\" cy=\"62\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"510\" cy=\"120\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"570\" cy=\"62\" r=\"3.5\"/><circle class=\"unity-rb-interpolate-lanes-pose\" cx=\"570\" cy=\"120\" r=\"3.5\"/> <circle class=\"unity-rb-interpolate-lanes-b1\" cx=\"150\" cy=\"62\" r=\"9\"/> <circle class=\"unity-rb-interpolate-lanes-b2\" cx=\"150\" cy=\"120\" r=\"9\"/> <text class=\"unity-rb-interpolate-lanes-s\" x=\"150\" y=\"90\">same physics pose drawn on several frames: stutter</text> <text class=\"unity-rb-interpolate-lanes-s\" x=\"150\" y=\"148\">between previous and current pose, up to one step behind</text> <line x1=\"20\" y1=\"170\" x2=\"620\" y2=\"170\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/> <text class=\"unity-rb-interpolate-lanes-m\" x=\"20\" y=\"204\">Fixed step</text> <text class=\"unity-rb-interpolate-lanes-m\" x=\"20\" y=\"248\">Frame (144 fps)</text> <line class=\"unity-rb-interpolate-lanes-tr\" x1=\"130\" y1=\"200\" x2=\"590\" y2=\"200\"/> <line class=\"unity-rb-interpolate-lanes-tr\" x1=\"130\" y1=\"244\" x2=\"590\" y2=\"244\"/> <rect class=\"unity-rb-interpolate-lanes-ph\" x=\"126\" y=\"188\" width=\"8\" height=\"24\" rx=\"3\"/><text class=\"unity-rb-interpolate-lanes-s\" x=\"130\" y=\"278\" text-anchor=\"middle\">0</text><rect class=\"unity-rb-interpolate-lanes-ph\" x=\"218\" y=\"188\" width=\"8\" height=\"24\" rx=\"3\"/><text class=\"unity-rb-interpolate-lanes-s\" x=\"222\" y=\"278\" text-anchor=\"middle\">20</text><rect class=\"unity-rb-interpolate-lanes-ph\" x=\"310\" y=\"188\" width=\"8\" height=\"24\" rx=\"3\"/><text class=\"unity-rb-interpolate-lanes-s\" x=\"314\" y=\"278\" text-anchor=\"middle\">40</text><rect class=\"unity-rb-interpolate-lanes-ph\" x=\"402\" y=\"188\" width=\"8\" height=\"24\" rx=\"3\"/><text class=\"unity-rb-interpolate-lanes-s\" x=\"406\" y=\"278\" text-anchor=\"middle\">60</text><rect class=\"unity-rb-interpolate-lanes-ph\" x=\"494\" y=\"188\" width=\"8\" height=\"24\" rx=\"3\"/><text class=\"unity-rb-interpolate-lanes-s\" x=\"498\" y=\"278\" text-anchor=\"middle\">80</text><rect class=\"unity-rb-interpolate-lanes-ph\" x=\"586\" y=\"188\" width=\"8\" height=\"24\" rx=\"3\"/><text class=\"unity-rb-interpolate-lanes-s\" x=\"590\" y=\"278\" text-anchor=\"middle\">100 ms</text><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"130.0\" y1=\"236\" x2=\"130.0\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"161.9\" y1=\"236\" x2=\"161.9\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"193.9\" y1=\"236\" x2=\"193.9\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"225.8\" y1=\"236\" x2=\"225.8\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"257.8\" y1=\"236\" x2=\"257.8\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"289.7\" y1=\"236\" x2=\"289.7\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"321.6\" y1=\"236\" x2=\"321.6\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"353.6\" y1=\"236\" x2=\"353.6\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"385.5\" y1=\"236\" x2=\"385.5\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"417.5\" y1=\"236\" x2=\"417.5\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"449.4\" y1=\"236\" x2=\"449.4\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"481.3\" y1=\"236\" x2=\"481.3\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"513.3\" y1=\"236\" x2=\"513.3\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"545.2\" y1=\"236\" x2=\"545.2\" y2=\"252\"/><line class=\"unity-rb-interpolate-lanes-fr\" x1=\"577.2\" y1=\"236\" x2=\"577.2\" y2=\"252\"/> </svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "public class PlayerMotor : MonoBehaviour\n{\n    [SerializeField] Rigidbody body;\n    [SerializeField] float speed = 6f;\n    Vector2 moveInput;   // written in Update / input callbacks\n    bool jumpQueued;     // latched until physics consumes it\n\n    public void OnMove(Vector2 v) => moveInput = v;\n    public void OnJump() => jumpQueued = true;\n\n    void FixedUpdate()\n    {\n        Vector3 v = body.linearVelocity;\n        v.x = moveInput.x * speed;\n        v.z = moveInput.y * speed;\n        if (jumpQueued && IsGrounded()) v.y = 7f;\n        jumpQueued = false;\n        body.linearVelocity = v;\n    }\n\n    readonly RaycastHit[] hits = new RaycastHit[4];\n    bool IsGrounded() =>\n        Physics.SphereCastNonAlloc(body.position + Vector3.up * 0.5f, 0.3f,\n            Vector3.down, hits, 0.3f, LayerMask.GetMask(\"Ground\"),\n            QueryTriggerInteraction.Ignore) > 0;\n}"
        },
        {
          "type": "p",
          "text": "Note the latch: input is read per frame, consumed per fixed step. Checking `GetKeyDown` or `WasPressedThisFrame` directly inside `FixedUpdate` misses presses whenever a frame runs zero physics steps, and double-fires when a frame runs two. That is the 'jump sometimes does nothing' bug."
        },
        {
          "type": "h",
          "text": "Tunnelling and physics queries"
        },
        {
          "type": "p",
          "text": "Discrete collision detection checks overlap only at step boundaries. A 0.1 m bullet moving at 300 m/s travels 6 m per 0.02 s step and skips thin walls. Options: `CollisionDetectionMode.Continuous`/`ContinuousDynamic` (swept tests, more expensive), `ContinuousSpeculative` (cheaper, can cause ghost contacts), or, for real bullets, do not simulate them as bodies at all: raycast from the previous to the current position each step."
        },
        {
          "type": "p",
          "text": "Queries (`Raycast`, `SphereCast`, `OverlapSphere`, `CapsuleCast`) run against the physics scene, not against the Transforms. If you move colliders in `Update` and query in the same frame, results reflect the last sync unless `Physics.autoSyncTransforms` is on (off by default since 2018.3 because syncing on every query is costly) or you call `Physics.SyncTransforms()`. Always pass a LayerMask and a max distance, prefer the `NonAlloc` variants to avoid GC allocations, and use `RaycastCommand` to batch hundreds of rays across worker threads."
        },
        {
          "type": "h",
          "text": "Input: Input Manager vs the Input System package"
        },
        {
          "type": "p",
          "text": "The legacy **Input Manager** (`Input.GetAxis(\"Horizontal\")`, `Input.GetKeyDown`) is a polling API configured in a global axis list. It is simple but hardcodes devices, has no runtime rebinding, and handles gamepads and multiple players poorly. The **Input System package** (`com.unity.inputsystem`) separates **actions** (Jump, Move) from **bindings** (Space, gamepad south button, touch), groups actions into **action maps** (Gameplay, UI, Vehicle) you enable and disable, supports control schemes, rebinding, local multiplayer via `PlayerInput`, and both polling (`action.ReadValue<Vector2>()`) and callbacks. Unity 6 ships a project-wide actions asset by default. The **Active Input Handling** player setting selects Old, New or Both; 'Both' is a migration crutch, not a destination."
        },
        {
          "type": "list",
          "items": [
            "Input System events are processed at the start of the frame by default (dynamic update). Its update mode can be switched to fixed update, but then UI and per-frame reads become coarser; latching as above is usually better.",
            "Enable only the action map that matches the current context; otherwise Space both jumps and presses the focused UI button.",
            "Touch and mouse pointer events for uGUI need the Input System UI Input Module on the EventSystem, not the legacy StandaloneInputModule."
          ]
        },
        {
          "type": "h",
          "text": "Animation: Animator, blend trees and Timeline"
        },
        {
          "type": "p",
          "text": "**Mecanim** is the Animator component plus an **Animator Controller** asset: a state machine of states (clips or blend trees) and transitions driven by parameters (float, int, bool, trigger). **Layers** with **Avatar Masks** let an upper-body layer play 'reload' while the base layer runs. A **blend tree** mixes clips continuously by parameter: a 1D tree blends idle, walk and run by speed; a 2D Freeform Directional tree blends strafe directions by a velocity vector. Set parameters with hashed ids (`Animator.StringToHash`) and use damping on `SetFloat` to avoid popping."
        },
        {
          "type": "figure",
          "id": "unity-locomotion-blend-tree",
          "caption": "The Locomotion state is a 1D blend tree on Speed: as Speed moves from 0 to 6 the weight slides from Idle through Walk to Run.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"Animator Controller with Locomotion, Jump and Fall states. Locomotion is a 1D blend tree: as Speed moves from 0 to 6 the weights shift from Idle to Walk to Run.\"> <defs><marker id=\"unity-locomotion-blend-tree-ar\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0 L10 5 L0 10 z\" fill=\"var(--fig-muted)\"/></marker></defs> <style> .unity-locomotion-blend-tree-t{font-size:14px;fill:var(--fig-ink)} .unity-locomotion-blend-tree-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-locomotion-blend-tree-m{font-size:13px;fill:var(--fig-muted)} .unity-locomotion-blend-tree-s{font-size:12px;fill:var(--fig-muted)} .unity-locomotion-blend-tree-st{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-locomotion-blend-tree-act{fill:var(--fig-accent);fill-opacity:.14;stroke:var(--fig-accent);stroke-width:2} .unity-locomotion-blend-tree-tx{fill:none;stroke:var(--fig-muted);stroke-width:1.5} .unity-locomotion-blend-tree-trk{fill:var(--fig-line);fill-opacity:.5} .unity-locomotion-blend-tree-w{fill:var(--fig-accent);transform-box:fill-box;transform-origin:0 50%} .unity-locomotion-blend-tree-wi{animation:unity-locomotion-blend-tree-wi 6s linear infinite} .unity-locomotion-blend-tree-ww{transform:scaleX(0);animation:unity-locomotion-blend-tree-ww 6s linear infinite} .unity-locomotion-blend-tree-wr{transform:scaleX(0);animation:unity-locomotion-blend-tree-wr 6s linear infinite} .unity-locomotion-blend-tree-mk{animation:unity-locomotion-blend-tree-mk 6s linear infinite} @keyframes unity-locomotion-blend-tree-wi{0%{transform:scaleX(1)}25%,75%{transform:scaleX(0)}100%{transform:scaleX(1)}} @keyframes unity-locomotion-blend-tree-ww{0%,50%,100%{transform:scaleX(0)}25%,75%{transform:scaleX(1)}} @keyframes unity-locomotion-blend-tree-wr{0%,25%,75%,100%{transform:scaleX(0)}50%{transform:scaleX(1)}} @keyframes unity-locomotion-blend-tree-mk{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(80px)}50%{transform:translateX(240px)}} </style> <text class=\"unity-locomotion-blend-tree-h\" x=\"24\" y=\"34\">Animator Controller</text> <rect class=\"unity-locomotion-blend-tree-act\" x=\"24\" y=\"70\" width=\"140\" height=\"50\" rx=\"10\"/> <text class=\"unity-locomotion-blend-tree-t\" x=\"94\" y=\"92\" text-anchor=\"middle\">Locomotion</text> <text class=\"unity-locomotion-blend-tree-s\" x=\"94\" y=\"110\" text-anchor=\"middle\">blend tree</text> <rect class=\"unity-locomotion-blend-tree-st\" x=\"220\" y=\"70\" width=\"84\" height=\"50\" rx=\"10\"/> <text class=\"unity-locomotion-blend-tree-t\" x=\"262\" y=\"100\" text-anchor=\"middle\">Jump</text> <rect class=\"unity-locomotion-blend-tree-st\" x=\"122\" y=\"186\" width=\"84\" height=\"50\" rx=\"10\"/> <text class=\"unity-locomotion-blend-tree-t\" x=\"164\" y=\"216\" text-anchor=\"middle\">Fall</text> <path class=\"unity-locomotion-blend-tree-tx\" d=\"M166 95 L216 95\" marker-end=\"url(#unity-locomotion-blend-tree-ar)\"/> <text class=\"unity-locomotion-blend-tree-s\" x=\"192\" y=\"86\" text-anchor=\"middle\">Jump</text> <path class=\"unity-locomotion-blend-tree-tx\" d=\"M248 122 L196 184\" marker-end=\"url(#unity-locomotion-blend-tree-ar)\"/> <text class=\"unity-locomotion-blend-tree-s\" x=\"232\" y=\"164\">falling</text> <path class=\"unity-locomotion-blend-tree-tx\" d=\"M146 184 L110 124\" marker-end=\"url(#unity-locomotion-blend-tree-ar)\"/> <text class=\"unity-locomotion-blend-tree-s\" x=\"120\" y=\"164\" text-anchor=\"end\">Grounded</text> <text class=\"unity-locomotion-blend-tree-m\" x=\"24\" y=\"270\">Parameters</text> <text class=\"unity-locomotion-blend-tree-s\" x=\"24\" y=\"292\">Speed float · Jump trigger · Grounded bool</text> <path d=\"M140 70 C 200 30, 300 34, 334 54\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/> <rect x=\"334\" y=\"40\" width=\"288\" height=\"262\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/> <text class=\"unity-locomotion-blend-tree-h\" x=\"354\" y=\"66\">Locomotion: 1D on Speed</text> <line x1=\"370\" y1=\"122\" x2=\"600\" y2=\"122\" stroke=\"var(--fig-line)\" stroke-width=\"2\"/> <circle cx=\"370\" cy=\"122\" r=\"4\" fill=\"var(--fig-muted)\"/><circle cx=\"450\" cy=\"122\" r=\"4\" fill=\"var(--fig-muted)\"/><circle cx=\"600\" cy=\"122\" r=\"4\" fill=\"var(--fig-muted)\"/> <text class=\"unity-locomotion-blend-tree-s\" x=\"370\" y=\"104\" text-anchor=\"middle\">Idle</text><text class=\"unity-locomotion-blend-tree-s\" x=\"450\" y=\"104\" text-anchor=\"middle\">Walk</text><text class=\"unity-locomotion-blend-tree-s\" x=\"600\" y=\"104\" text-anchor=\"middle\">Run</text> <text class=\"unity-locomotion-blend-tree-s\" x=\"370\" y=\"144\" text-anchor=\"middle\">0</text><text class=\"unity-locomotion-blend-tree-s\" x=\"450\" y=\"144\" text-anchor=\"middle\">2</text><text class=\"unity-locomotion-blend-tree-s\" x=\"600\" y=\"144\" text-anchor=\"middle\">6</text> <text class=\"unity-locomotion-blend-tree-s\" x=\"525\" y=\"144\" text-anchor=\"middle\">Speed</text> <g class=\"unity-locomotion-blend-tree-mk\"><path d=\"M370 122 l-7 -14 h14 z\" fill=\"var(--fig-accent2)\"/></g> <text class=\"unity-locomotion-blend-tree-m\" x=\"354\" y=\"182\">weight</text> <text class=\"unity-locomotion-blend-tree-t\" x=\"354\" y=\"212\">Idle</text><rect class=\"unity-locomotion-blend-tree-trk\" x=\"400\" y=\"200\" width=\"200\" height=\"16\" rx=\"8\"/><rect class=\"unity-locomotion-blend-tree-w unity-locomotion-blend-tree-wi\" x=\"400\" y=\"200\" width=\"200\" height=\"16\" rx=\"8\"/> <text class=\"unity-locomotion-blend-tree-t\" x=\"354\" y=\"244\">Walk</text><rect class=\"unity-locomotion-blend-tree-trk\" x=\"400\" y=\"232\" width=\"200\" height=\"16\" rx=\"8\"/><rect class=\"unity-locomotion-blend-tree-w unity-locomotion-blend-tree-ww\" x=\"400\" y=\"232\" width=\"200\" height=\"16\" rx=\"8\"/> <text class=\"unity-locomotion-blend-tree-t\" x=\"354\" y=\"276\">Run</text><rect class=\"unity-locomotion-blend-tree-trk\" x=\"400\" y=\"264\" width=\"200\" height=\"16\" rx=\"8\"/><rect class=\"unity-locomotion-blend-tree-w unity-locomotion-blend-tree-wr\" x=\"400\" y=\"264\" width=\"200\" height=\"16\" rx=\"8\"/> </svg>"
        },
        {
          "type": "p",
          "text": "**Root motion** lets clips move the character (the animation decides displacement), versus code-driven motion where you move the body and pick clips to match. Mixing both without intent produces foot sliding or drift. The Animator's **update mode** can evaluate in sync with physics for characters driven by Rigidbodies, and its **culling mode** (Always Animate, Cull Update Transforms, Cull Completely) decides what happens off-screen. Animators are not cheap: hundreds of skinned characters with complex controllers cost several milliseconds on mobile. Use culling, the rig import option to strip unused transforms (Optimize Game Objects), and for crowds consider baked vertex or GPU animation."
        },
        {
          "type": "p",
          "text": "**Timeline** is for authored sequences: cutscenes, scripted camera moves, a boss intro. A PlayableDirector plays a Timeline asset with tracks (Animation, Activation, Audio, Signal, Control). Both Timeline and the Animator are built on the **Playables API**, a graph of nodes that evaluate and mix. Use the Animator for reactive gameplay state, Timeline for linear choreography, and Signals to call back into gameplay code at authored times."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Moving a non-kinematic Rigidbody through `transform.position`, polling one-shot input in `FixedUpdate`, and querying physics right after moving colliders in `Update` are the three most common sources of 'random' physics bugs. All three are clock-mixing errors."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Tell the agent which input stack the project uses (check Active Input Handling) and which Unity version; models trained on older code default to `Input.GetAxis` and `rb.velocity`. When it writes movement code, verify: forces and velocity are applied in `FixedUpdate`, one-shot inputs are latched, queries pass a LayerMask and use NonAlloc, and it did not 'fix' jitter by moving the camera into `FixedUpdate` instead of enabling interpolation. Ask it to state which layer pairs it expects to collide and check the matrix."
        }
      ],
      "keyPoints": [
        "Rendering runs per frame; PhysX runs on a fixed step (default 50 Hz). Write physics in FixedUpdate, latch per-frame input for it.",
        "Once a dynamic Rigidbody exists, physics owns the transform; move it with velocity, forces or MovePosition, and give moving colliders a kinematic Rigidbody.",
        "The layer collision matrix and LayerMasks cut broadphase work and bugs; trigger messages need a Rigidbody on at least one side.",
        "Interpolation fixes follow-camera jitter; continuous detection or raycasts fix tunnelling of fast objects.",
        "The Input System separates actions from bindings; the Animator handles reactive state, Timeline handles authored sequences, both on Playables."
      ],
      "quiz": [
        {
          "q": "A game runs at 120 fps. The jump code calls `jumpAction.WasPressedThisFrame()` inside `FixedUpdate`. Players report that jumps are frequently ignored. Why?",
          "options": [
            "The Input System only reports presses during LateUpdate callbacks",
            "FixedUpdate runs at 50 Hz, so the jump is clamped by Maximum Allowed Timestep",
            "Most frames run no physics step, so the press frame often has no FixedUpdate",
            "WasPressedThisFrame requires a kinematic Rigidbody on the player object"
          ],
          "answer": 2,
          "explain": "At 120 fps most rendered frames execute zero fixed steps, so the one frame where the press is true often has no FixedUpdate to see it. Latch the press in Update or a callback and consume it in FixedUpdate."
        },
        {
          "q": "A trigger volume is a BoxCollider with isTrigger on an empty GameObject. The player has a CapsuleCollider, is moved via its Transform and has no Rigidbody. OnTriggerEnter never fires. What is the minimal fix?",
          "options": [
            "Add a kinematic Rigidbody to the trigger volume GameObject",
            "Switch the trigger collider to a convex MeshCollider instead",
            "Enable Physics.autoSyncTransforms in the physics settings",
            "Move the OnTriggerEnter handler into FixedUpdate instead"
          ],
          "answer": 0,
          "explain": "Trigger messages need a Rigidbody on at least one of the two objects; a kinematic one on the volume is enough. Converting to a MeshCollider or moving the handler changes nothing about that rule."
        },
        {
          "q": "The camera follows a Rigidbody-driven car smoothly in the editor at 50 fps but the car visibly stutters on a 90 Hz device. Which change addresses the cause?",
          "options": [
            "Set the car's collision detection mode to ContinuousDynamic",
            "Move the camera follow code from LateUpdate into FixedUpdate",
            "Raise the fixed timestep to 0.05 seconds to reduce physics cost",
            "Set the car Rigidbody's interpolation mode to Interpolate"
          ],
          "answer": 3,
          "explain": "At 90 Hz rendering against 50 Hz physics, some frames show the same physics pose twice; interpolation renders between poses. Moving the camera into FixedUpdate just makes the camera stutter at 50 Hz too."
        },
        {
          "q": "Rifle bullets are spawned as small dynamic Rigidbodies moving at 400 m/s and sometimes pass through 10 cm walls. What is usually the best approach for hitscan-like bullets?",
          "options": [
            "Increase the bullet's mass so contacts resolve more strongly",
            "Raycast from previous to current position each fixed step",
            "Lower the solver iteration count to speed up each physics step",
            "Mark the walls as triggers so overlap is reported instead"
          ],
          "answer": 1,
          "explain": "At 400 m/s a bullet moves 8 m per 0.02 s step, so discrete detection skips thin walls. A per-step raycast along the travelled segment is exact and cheaper than continuous detection on many bodies."
        },
        {
          "q": "A character controller script moves a kinematic platform in Update by setting transform.position, then immediately calls Physics.Raycast to see if the player is on it. The ray reports the old platform position. What explains this?",
          "options": [
            "Raycasts ignore kinematic bodies unless QueryTriggerInteraction is Collide",
            "Kinematic bodies are only queried after their OnCollisionStay callback",
            "Transform changes are not synced to physics until the next sync point",
            "Raycasts always use the previous frame's interpolated positions instead"
          ],
          "answer": 2,
          "explain": "Queries run against the physics scene, and with autoSyncTransforms off (the default) moved transforms are synced at the next simulation step. Call Physics.SyncTransforms or move the platform with MovePosition in FixedUpdate."
        }
      ]
    },
    {
      "id": "unity-ui",
      "title": "UI in Unity: uGUI, UI Toolkit and TextMeshPro",
      "minutes": 12,
      "summary": "How Unity's two UI systems render and update, why UI is often the hidden frame-time hog, and how to pick between them.",
      "lesson": [
        {
          "type": "p",
          "text": "A mobile game hits 60 fps in gameplay, then drops to 40 the moment the HUD shows a ticking timer and a scrolling kill feed. The profiler blames `Canvas.SendWillRenderCanvases` and `Canvas.BuildBatch`, and the culprit is a single Canvas containing the whole HUD, the timer text and a decorative spinning icon. UI is frequently the most expensive 'cheap' system in a Unity game, because it looks static while rebuilding geometry every frame."
        },
        {
          "type": "h",
          "text": "uGUI: Canvas, Graphics and rebuilds"
        },
        {
          "type": "p",
          "text": "**uGUI** (the `com.unity.ugui` package) is the GameObject-based UI: a **Canvas** at the root, children with **RectTransform**s, and **Graphic** components (Image, RawImage, TextMeshProUGUI) that generate quads. A Canvas has three render modes: Screen Space - Overlay (drawn on top, no camera), Screen Space - Camera (placed in front of a camera, can use post effects and depth), and World Space (a quad in the scene, for diegetic UI and VR)."
        },
        {
          "type": "p",
          "text": "Every Graphic owns a mesh. When anything about it changes (color, sprite, text, size, enable state), it is marked **dirty**. Before rendering, the CanvasUpdateRegistry runs **layout rebuilds** (recalculate RectTransform sizes for dirty layout elements) then **graphic rebuilds** (regenerate vertex data). Then the Canvas **re-batches**: it sorts all its elements by depth, material and texture, and merges them into as few draw calls as possible. Batching is done per Canvas, and one dirty element forces the whole Canvas to rebuild its batch. Batching is partly multithreaded, but the cost still scales with the element count of the Canvas."
        },
        {
          "type": "h",
          "text": "Splitting canvases"
        },
        {
          "type": "p",
          "text": "The main tool is to split by update frequency. A **nested Canvas** (a Canvas component on a child object) is batched independently: when it dirties, its parent does not re-batch. Typical structure: one Canvas for the static frame of the HUD, one for elements that change every frame (timer, health bar, minimap marker), one per popup or screen. Do not go to the extreme of a Canvas per element either; each Canvas costs its own batch and draw calls cannot merge across canvases."
        },
        {
          "type": "figure",
          "id": "unity-canvas-split-rebatch",
          "caption": "Each timer tick dirties its Canvas; with one Canvas all 12 elements re-batch, with a nested Dynamic Canvas only its 3 do.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A ticking timer dirties its Canvas. In one shared Canvas all 12 elements are re-batched every tick; with a nested Dynamic Canvas only its 3 elements are.\"> <style> .unity-canvas-split-rebatch-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-canvas-split-rebatch-s{font-size:12px;fill:var(--fig-muted)} .unity-canvas-split-rebatch-e{font-size:12px;fill:var(--fig-ink)} .unity-canvas-split-rebatch-ok{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-canvas-split-rebatch-bad{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-canvas-split-rebatch-cv{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:5 4} .unity-canvas-split-rebatch-cvd{stroke:var(--fig-accent)} .unity-canvas-split-rebatch-es{fill:var(--fig-line);fill-opacity:.55} .unity-canvas-split-rebatch-ed{fill:var(--fig-accent);fill-opacity:.18;stroke:var(--fig-accent);stroke-width:1.5} .unity-canvas-split-rebatch-fl{fill:var(--fig-warn);opacity:0;animation:unity-canvas-split-rebatch-fl 3s ease-out infinite} .unity-canvas-split-rebatch-ta{animation:unity-canvas-split-rebatch-ta 3s step-end infinite} .unity-canvas-split-rebatch-tb{opacity:0;animation:unity-canvas-split-rebatch-tb 3s step-end infinite} @keyframes unity-canvas-split-rebatch-fl{0%{opacity:.6}18%{opacity:0}50%{opacity:.6}68%{opacity:0}100%{opacity:0}} @keyframes unity-canvas-split-rebatch-ta{0%{opacity:1}50%{opacity:0}} @keyframes unity-canvas-split-rebatch-tb{0%{opacity:0}50%{opacity:1}} </style> <rect x=\"20\" y=\"30\" width=\"290\" height=\"256\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/> <text class=\"unity-canvas-split-rebatch-h\" x=\"36\" y=\"56\">One Canvas</text> <rect class=\"unity-canvas-split-rebatch-cv\" x=\"34\" y=\"96\" width=\"258\" height=\"138\" rx=\"10\"/><text class=\"unity-canvas-split-rebatch-s\" x=\"34\" y=\"88\">HUD (Canvas)</text> <rect class=\"unity-canvas-split-rebatch-es\" x=\"42\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"42\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"100\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"100\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"158\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"158\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-ed\" x=\"232\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"232\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/><text class=\"unity-canvas-split-rebatch-e unity-canvas-split-rebatch-ta\" x=\"258\" y=\"127\" text-anchor=\"middle\">0:42</text><text class=\"unity-canvas-split-rebatch-e unity-canvas-split-rebatch-tb\" x=\"258\" y=\"127\" text-anchor=\"middle\">0:41</text> <rect class=\"unity-canvas-split-rebatch-es\" x=\"42\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"42\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"100\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"100\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"158\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"158\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-ed\" x=\"232\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"232\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/><text class=\"unity-canvas-split-rebatch-e\" x=\"258\" y=\"169\" text-anchor=\"middle\">Ammo</text> <rect class=\"unity-canvas-split-rebatch-es\" x=\"42\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"42\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"100\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"100\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"158\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"158\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-ed\" x=\"232\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"232\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/><text class=\"unity-canvas-split-rebatch-e\" x=\"258\" y=\"211\" text-anchor=\"middle\">HP</text> <text class=\"unity-canvas-split-rebatch-bad\" x=\"36\" y=\"262\">12 elements re-batched per tick</text> <rect x=\"330\" y=\"30\" width=\"290\" height=\"256\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/> <text class=\"unity-canvas-split-rebatch-h\" x=\"346\" y=\"56\">Split by update rate</text> <rect class=\"unity-canvas-split-rebatch-cv\" x=\"344\" y=\"96\" width=\"184\" height=\"138\" rx=\"10\"/><text class=\"unity-canvas-split-rebatch-s\" x=\"344\" y=\"88\">StaticFrame</text> <rect class=\"unity-canvas-split-rebatch-cv unity-canvas-split-rebatch-cvd\" x=\"534\" y=\"96\" width=\"68\" height=\"138\" rx=\"10\"/><text class=\"unity-canvas-split-rebatch-s\" x=\"602\" y=\"88\" text-anchor=\"end\">Dynamic (Canvas)</text> <rect class=\"unity-canvas-split-rebatch-es\" x=\"352\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"410\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"468\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-ed\" x=\"542\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"542\" y=\"106\" width=\"52\" height=\"32\" rx=\"8\"/><text class=\"unity-canvas-split-rebatch-e unity-canvas-split-rebatch-ta\" x=\"568\" y=\"127\" text-anchor=\"middle\">0:42</text><text class=\"unity-canvas-split-rebatch-e unity-canvas-split-rebatch-tb\" x=\"568\" y=\"127\" text-anchor=\"middle\">0:41</text> <rect class=\"unity-canvas-split-rebatch-es\" x=\"352\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"410\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"468\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-ed\" x=\"542\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"542\" y=\"148\" width=\"52\" height=\"32\" rx=\"8\"/><text class=\"unity-canvas-split-rebatch-e\" x=\"568\" y=\"169\" text-anchor=\"middle\">Ammo</text> <rect class=\"unity-canvas-split-rebatch-es\" x=\"352\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"410\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-es\" x=\"468\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/> <rect class=\"unity-canvas-split-rebatch-ed\" x=\"542\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/><rect class=\"unity-canvas-split-rebatch-fl\" x=\"542\" y=\"190\" width=\"52\" height=\"32\" rx=\"8\"/><text class=\"unity-canvas-split-rebatch-e\" x=\"568\" y=\"211\" text-anchor=\"middle\">HP</text> <text class=\"unity-canvas-split-rebatch-ok\" x=\"346\" y=\"262\">3 elements re-batched per tick</text> </svg>"
        },
        {
          "type": "code",
          "lang": "text",
          "text": "HUD (Canvas, Screen Space - Overlay)\n  StaticFrame        <- borders, icons, labels: rebuilds almost never\n  Dynamic (Canvas)   <- timer, ammo, health fill: dirties every frame\n  KillFeed (Canvas)  <- dirties on events only\nPauseMenu (Canvas, disabled Canvas component when hidden)"
        },
        {
          "type": "list",
          "items": [
            "Hide a screen by disabling its **Canvas component** rather than calling `SetActive(false)` on the GameObject: disabling the Canvas stops drawing but keeps the generated geometry, while toggling the GameObject runs OnDisable/OnEnable on every child and forces full rebuilds.",
            "Animating UI with an Animator dirties the animated elements every frame even when the curve is flat. Prefer tweens that stop, or put animated elements on their own Canvas.",
            "Batches break when materials or textures differ; put UI sprites in a Sprite Atlas so Images share a texture, and check the Frame Debugger to see why consecutive elements did not merge."
          ]
        },
        {
          "type": "h",
          "text": "Raycast targets and the EventSystem"
        },
        {
          "type": "p",
          "text": "The **GraphicRaycaster** on each Canvas tests the pointer against every Graphic with **Raycast Target** enabled, on every pointer event. Images and texts default to raycast-target on, so a dense HUD tests hundreds of decorative elements that can never be clicked. Turn it off on everything that is not interactive; remove GraphicRaycaster entirely from canvases that have no interactive content. Invisible full-screen Images left as raycast targets are also the classic 'buttons below stopped responding' bug."
        },
        {
          "type": "figure",
          "id": "unity-raycast-target-tests",
          "caption": "Every pointer event tests each Graphic with Raycast Target on; turning it off on decoration cuts 11 tests to the 3 buttons.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"On a click, the GraphicRaycaster tests every Graphic with Raycast Target on: 11 in a default HUD, 3 when decorative graphics have it turned off.\"> <style> .unity-raycast-target-tests-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-raycast-target-tests-s{font-size:12px;fill:var(--fig-muted)} .unity-raycast-target-tests-e{font-size:12px;fill:var(--fig-ink)} .unity-raycast-target-tests-ok{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-raycast-target-tests-bad{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-raycast-target-tests-bg{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .unity-raycast-target-tests-dec{fill:var(--fig-line)} .unity-raycast-target-tests-btn{fill:var(--fig-accent);fill-opacity:.16} .unity-raycast-target-tests-rt{stroke:var(--fig-accent);stroke-width:1.5;stroke-dasharray:4 3;animation:unity-raycast-target-tests-rt 4s ease-out infinite} .unity-raycast-target-tests-rip{fill:none;stroke:var(--fig-accent2);stroke-width:2;opacity:0;transform-box:fill-box;transform-origin:center;animation:unity-raycast-target-tests-rip 4s ease-out infinite} .unity-raycast-target-tests-ptr{fill:var(--fig-ink);stroke:var(--fig-bg);stroke-width:1.2;stroke-linejoin:round} @keyframes unity-raycast-target-tests-rt{0%,24%{stroke-width:1.5;stroke-opacity:1}30%{stroke-width:3.5;stroke-opacity:1}48%,100%{stroke-width:1.5;stroke-opacity:1}} @keyframes unity-raycast-target-tests-rip{0%,20%{opacity:0;transform:scale(.4)}24%{opacity:1;transform:scale(.6)}44%{opacity:0;transform:scale(1.6)}100%{opacity:0;transform:scale(1.6)}} </style> <rect x=\"20\" y=\"30\" width=\"290\" height=\"262\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/> <text class=\"unity-raycast-target-tests-h\" x=\"36\" y=\"56\">Default: every Graphic</text> <rect class=\"unity-raycast-target-tests-bg unity-raycast-target-tests-rt\" x=\"36\" y=\"72\" width=\"258\" height=\"160\" rx=\"10\"/> <rect class=\"unity-raycast-target-tests-dec unity-raycast-target-tests-rt\" x=\"50\" y=\"88\" width=\"120\" height=\"12\" rx=\"6\"/> <circle class=\"unity-raycast-target-tests-dec unity-raycast-target-tests-rt\" cx=\"62\" cy=\"128\" r=\"10\"/><circle class=\"unity-raycast-target-tests-dec unity-raycast-target-tests-rt\" cx=\"92\" cy=\"128\" r=\"10\"/><circle class=\"unity-raycast-target-tests-dec unity-raycast-target-tests-rt\" cx=\"122\" cy=\"128\" r=\"10\"/><circle class=\"unity-raycast-target-tests-dec unity-raycast-target-tests-rt\" cx=\"152\" cy=\"128\" r=\"10\"/> <rect class=\"unity-raycast-target-tests-dec unity-raycast-target-tests-rt\" x=\"50\" y=\"158\" width=\"140\" height=\"10\" rx=\"5\"/><rect class=\"unity-raycast-target-tests-dec unity-raycast-target-tests-rt\" x=\"50\" y=\"176\" width=\"104\" height=\"10\" rx=\"5\"/> <rect class=\"unity-raycast-target-tests-btn unity-raycast-target-tests-rt\" x=\"206\" y=\"88\" width=\"74\" height=\"28\" rx=\"8\"/><text class=\"unity-raycast-target-tests-e\" x=\"243\" y=\"106\" text-anchor=\"middle\">Play</text><rect class=\"unity-raycast-target-tests-btn unity-raycast-target-tests-rt\" x=\"206\" y=\"128\" width=\"74\" height=\"28\" rx=\"8\"/><text class=\"unity-raycast-target-tests-e\" x=\"243\" y=\"146\" text-anchor=\"middle\">Shop</text><rect class=\"unity-raycast-target-tests-btn unity-raycast-target-tests-rt\" x=\"206\" y=\"168\" width=\"74\" height=\"28\" rx=\"8\"/><text class=\"unity-raycast-target-tests-e\" x=\"243\" y=\"186\" text-anchor=\"middle\">Quit</text> <circle class=\"unity-raycast-target-tests-rip\" cx=\"264\" cy=\"102\" r=\"14\"/> <path class=\"unity-raycast-target-tests-ptr\" d=\"M264 103 l0 20 l5 -5 l4 9 l4 -2 l-4 -9 l7 0 z\"/> <text class=\"unity-raycast-target-tests-bad\" x=\"36\" y=\"256\">11 graphics tested per pointer event</text><text class=\"unity-raycast-target-tests-s\" x=\"36\" y=\"276\">background Image, labels and icons too</text> <rect x=\"330\" y=\"30\" width=\"290\" height=\"262\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/> <text class=\"unity-raycast-target-tests-h\" x=\"346\" y=\"56\">Decor: Raycast Target off</text> <rect class=\"unity-raycast-target-tests-bg\" x=\"346\" y=\"72\" width=\"258\" height=\"160\" rx=\"10\"/> <rect class=\"unity-raycast-target-tests-dec\" x=\"360\" y=\"88\" width=\"120\" height=\"12\" rx=\"6\"/> <circle class=\"unity-raycast-target-tests-dec\" cx=\"372\" cy=\"128\" r=\"10\"/><circle class=\"unity-raycast-target-tests-dec\" cx=\"402\" cy=\"128\" r=\"10\"/><circle class=\"unity-raycast-target-tests-dec\" cx=\"432\" cy=\"128\" r=\"10\"/><circle class=\"unity-raycast-target-tests-dec\" cx=\"462\" cy=\"128\" r=\"10\"/> <rect class=\"unity-raycast-target-tests-dec\" x=\"360\" y=\"158\" width=\"140\" height=\"10\" rx=\"5\"/><rect class=\"unity-raycast-target-tests-dec\" x=\"360\" y=\"176\" width=\"104\" height=\"10\" rx=\"5\"/> <rect class=\"unity-raycast-target-tests-btn unity-raycast-target-tests-rt\" x=\"516\" y=\"88\" width=\"74\" height=\"28\" rx=\"8\"/><text class=\"unity-raycast-target-tests-e\" x=\"553\" y=\"106\" text-anchor=\"middle\">Play</text><rect class=\"unity-raycast-target-tests-btn unity-raycast-target-tests-rt\" x=\"516\" y=\"128\" width=\"74\" height=\"28\" rx=\"8\"/><text class=\"unity-raycast-target-tests-e\" x=\"553\" y=\"146\" text-anchor=\"middle\">Shop</text><rect class=\"unity-raycast-target-tests-btn unity-raycast-target-tests-rt\" x=\"516\" y=\"168\" width=\"74\" height=\"28\" rx=\"8\"/><text class=\"unity-raycast-target-tests-e\" x=\"553\" y=\"186\" text-anchor=\"middle\">Quit</text> <circle class=\"unity-raycast-target-tests-rip\" cx=\"574\" cy=\"102\" r=\"14\"/> <path class=\"unity-raycast-target-tests-ptr\" d=\"M574 103 l0 20 l5 -5 l4 9 l4 -2 l-4 -9 l7 0 z\"/> <text class=\"unity-raycast-target-tests-ok\" x=\"346\" y=\"256\">3 graphics tested per pointer event</text><text class=\"unity-raycast-target-tests-s\" x=\"346\" y=\"276\">only the buttons are targets</text> </svg>"
        },
        {
          "type": "h",
          "text": "Layout groups cost"
        },
        {
          "type": "p",
          "text": "Horizontal/Vertical/Grid Layout Groups and Content Size Fitter are convenient but expensive: a layout rebuild walks up to find the root layout and recomputes every child, calling `GetComponents` along the way. Nested layout groups (a vertical list of rows, each row a horizontal group, each cell with a fitter) can turn a single text change into a cascade across hundreds of elements. Use anchors for static layout, compute positions yourself for big scrolling lists, and use pooled, recycled list items rather than instantiating 500 rows in a ScrollRect."
        },
        {
          "type": "figure",
          "id": "unity-layout-group-cascade",
          "caption": "One text change in a nested layout walks up to the root layout group, which then recomputes every element below it.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"Nested layout groups: one text change in a cell walks up to the root Vertical Layout Group, which then recomputes all 17 elements.\"> <style> .unity-layout-group-cascade-t{font-size:13px;fill:var(--fig-ink)} .unity-layout-group-cascade-s{font-size:12px;fill:var(--fig-ink)} .unity-layout-group-cascade-m{font-size:13px;fill:var(--fig-muted)} .unity-layout-group-cascade-w{font-size:13px;fill:var(--fig-warn);font-weight:600} .unity-layout-group-cascade-n{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-layout-group-cascade-e{stroke:var(--fig-line);stroke-width:1.5;fill:none} .unity-layout-group-cascade-up{stroke:var(--fig-warn);stroke-width:3;fill:none;stroke-linecap:round;opacity:0;animation:unity-layout-group-cascade-up 6s linear infinite} .unity-layout-group-cascade-dirty{fill:var(--fig-warn);fill-opacity:.25;stroke:var(--fig-warn);stroke-width:2} .unity-layout-group-cascade-re{fill:var(--fig-warn);opacity:0;animation:unity-layout-group-cascade-re 6s ease-out infinite} @keyframes unity-layout-group-cascade-up{0%,12%{opacity:0}18%,72%{opacity:1}80%,100%{opacity:0}} @keyframes unity-layout-group-cascade-re{0%,34%{opacity:0}40%{opacity:.45}72%{opacity:.3}80%,100%{opacity:0}} </style> <path class=\"unity-layout-group-cascade-e\" d=\"M320 80 L110 124\"/><path class=\"unity-layout-group-cascade-e\" d=\"M110 156 L64 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M110 156 L110 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M110 156 L156 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M320 80 L250 124\"/><path class=\"unity-layout-group-cascade-e\" d=\"M250 156 L204 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M250 156 L250 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M250 156 L296 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M320 80 L390 124\"/><path class=\"unity-layout-group-cascade-e\" d=\"M390 156 L344 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M390 156 L390 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M390 156 L436 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M320 80 L530 124\"/><path class=\"unity-layout-group-cascade-e\" d=\"M530 156 L484 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M530 156 L530 196\"/><path class=\"unity-layout-group-cascade-e\" d=\"M530 156 L576 196\"/> <path class=\"unity-layout-group-cascade-up\" d=\"M204 196 L250 156 M250 124 L320 80\"/> <rect class=\"unity-layout-group-cascade-n\" x=\"190\" y=\"44\" width=\"260\" height=\"36\" rx=\"10\"/><rect class=\"unity-layout-group-cascade-re\" x=\"190\" y=\"44\" width=\"260\" height=\"36\" rx=\"10\"/> <text class=\"unity-layout-group-cascade-t\" x=\"320\" y=\"67\" text-anchor=\"middle\">Content (Vertical Layout Group)</text> <rect class=\"unity-layout-group-cascade-n\" x=\"60\" y=\"124\" width=\"100\" height=\"32\" rx=\"9\"/><rect class=\"unity-layout-group-cascade-re\" x=\"60\" y=\"124\" width=\"100\" height=\"32\" rx=\"9\"/><text class=\"unity-layout-group-cascade-s\" x=\"110\" y=\"145\" text-anchor=\"middle\">Row (HLG)</text> <rect class=\"unity-layout-group-cascade-n\" x=\"44\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"44\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"64\" y=\"215\" text-anchor=\"middle\">Cell</text><rect class=\"unity-layout-group-cascade-n\" x=\"90\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"90\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"110\" y=\"215\" text-anchor=\"middle\">Cell</text><rect class=\"unity-layout-group-cascade-n\" x=\"136\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"136\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"156\" y=\"215\" text-anchor=\"middle\">Cell</text> <rect class=\"unity-layout-group-cascade-n\" x=\"200\" y=\"124\" width=\"100\" height=\"32\" rx=\"9\"/><rect class=\"unity-layout-group-cascade-re\" x=\"200\" y=\"124\" width=\"100\" height=\"32\" rx=\"9\"/><text class=\"unity-layout-group-cascade-s\" x=\"250\" y=\"145\" text-anchor=\"middle\">Row (HLG)</text> <rect class=\"unity-layout-group-cascade-dirty\" x=\"184\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"184\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"204\" y=\"215\" text-anchor=\"middle\">Cell</text><rect class=\"unity-layout-group-cascade-n\" x=\"230\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"230\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"250\" y=\"215\" text-anchor=\"middle\">Cell</text><rect class=\"unity-layout-group-cascade-n\" x=\"276\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"276\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"296\" y=\"215\" text-anchor=\"middle\">Cell</text> <rect class=\"unity-layout-group-cascade-n\" x=\"340\" y=\"124\" width=\"100\" height=\"32\" rx=\"9\"/><rect class=\"unity-layout-group-cascade-re\" x=\"340\" y=\"124\" width=\"100\" height=\"32\" rx=\"9\"/><text class=\"unity-layout-group-cascade-s\" x=\"390\" y=\"145\" text-anchor=\"middle\">Row (HLG)</text> <rect class=\"unity-layout-group-cascade-n\" x=\"324\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"324\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"344\" y=\"215\" text-anchor=\"middle\">Cell</text><rect class=\"unity-layout-group-cascade-n\" x=\"370\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"370\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"390\" y=\"215\" text-anchor=\"middle\">Cell</text><rect class=\"unity-layout-group-cascade-n\" x=\"416\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"416\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"436\" y=\"215\" text-anchor=\"middle\">Cell</text> <rect class=\"unity-layout-group-cascade-n\" x=\"480\" y=\"124\" width=\"100\" height=\"32\" rx=\"9\"/><rect class=\"unity-layout-group-cascade-re\" x=\"480\" y=\"124\" width=\"100\" height=\"32\" rx=\"9\"/><text class=\"unity-layout-group-cascade-s\" x=\"530\" y=\"145\" text-anchor=\"middle\">Row (HLG)</text> <rect class=\"unity-layout-group-cascade-n\" x=\"464\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"464\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"484\" y=\"215\" text-anchor=\"middle\">Cell</text><rect class=\"unity-layout-group-cascade-n\" x=\"510\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"510\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"530\" y=\"215\" text-anchor=\"middle\">Cell</text><rect class=\"unity-layout-group-cascade-n\" x=\"556\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><rect class=\"unity-layout-group-cascade-re\" x=\"556\" y=\"196\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"unity-layout-group-cascade-s\" x=\"576\" y=\"215\" text-anchor=\"middle\">Cell</text> <text class=\"unity-layout-group-cascade-w\" x=\"204\" y=\"246\" text-anchor=\"middle\">text changed</text> <text class=\"unity-layout-group-cascade-m\" x=\"320\" y=\"282\" text-anchor=\"middle\">1 text change → walk up to the root layout → recompute all 17 elements</text> </svg>"
        },
        {
          "type": "h",
          "text": "TextMeshPro"
        },
        {
          "type": "p",
          "text": "**TextMeshPro** renders text with **signed distance field** (SDF) font atlases: each glyph is stored as a distance field, so one atlas renders crisply at many sizes, with outlines and shadows done in the shader. Font assets are **static** (pre-baked character set) or **dynamic** (glyphs rasterized into the atlas at runtime as they appear). Fallback font assets cover additional scripts. In Unity 6, TextMeshPro is part of the uGUI package rather than a separate package. Pitfalls: a dynamic atlas for CJK can grow large or require fallback chains; Auto Size runs a sizing search on every text change and is costly on frequently updated labels; formatting a new string every frame (`$\"{score}\"`) allocates garbage, which `SetText` with numeric arguments avoids."
        },
        {
          "type": "h",
          "text": "UI Toolkit"
        },
        {
          "type": "p",
          "text": "**UI Toolkit** is the retained-mode UI system inspired by web technology. Structure lives in **UXML**, styling in **USS** (a CSS subset with selectors and variables), and layout is flexbox via the Yoga engine. At runtime a **UIDocument** component with a **PanelSettings** asset hosts a tree of **VisualElements**. It powers the Unity Editor's own UI and is the recommended choice for editor tooling. It renders through a single uber-shader with dynamic atlasing, so a large panel draws in very few batches, and it has a data binding system in Unity 6."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Score.uxml:  <ui:Label name=\"score\" class=\"hud-label\" />\n// Hud.uss:     .hud-label { font-size: 32px; color: rgb(255, 220, 80); }\npublic class Hud : MonoBehaviour\n{\n    [SerializeField] UIDocument doc;\n    Label score;\n    void OnEnable() => score = doc.rootVisualElement.Q<Label>(\"score\");\n    public void SetScore(int s) => score.text = s.ToString();\n}"
        },
        {
          "type": "h",
          "text": "Choosing between them"
        },
        {
          "type": "list",
          "items": [
            "**UI Toolkit**: editor tools and inspectors (default choice), data-heavy runtime screens like menus, settings, inventories and shops, teams with web/CSS experience, large UIs where batching and styling consistency matter.",
            "**uGUI**: world-space and diegetic UI, heavy use of custom shaders or particle effects inside UI, Animator-driven UI animation, mature third-party assets, and existing projects already built on it. UI Toolkit has been closing these gaps across Unity 6 releases, so check the version you target.",
            "Mixing is legitimate: UI Toolkit menus with a uGUI world-space nameplate system is common. What hurts is two parallel styling and input stacks with no rule for which owns what."
          ]
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "To measure UI, look at `Canvas.SendWillRenderCanvases` (layout and graphic rebuilds), `Canvas.BuildBatch` and the UI rendering markers in the CPU profiler, plus the UI and UI Details profiler modules, which show batches and why they broke."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Tell the agent which UI system each screen uses; agents freely mix `UnityEngine.UI.Text`, TextMeshPro and UI Toolkit code in one feature. Verify generated uGUI code does not call `SetActive` to toggle whole screens every few frames, does not add a Layout Group to every row of a long list, and turns off raycastTarget on decorative graphics. For UI Toolkit, check it queries elements once (cache the `Q<T>` result) rather than every frame, and that USS classes are used instead of inline style writes scattered through C#."
        }
      ],
      "keyPoints": [
        "uGUI regenerates and re-batches per Canvas: one dirty element rebuilds the whole Canvas batch, so split canvases by update frequency.",
        "Disable the Canvas component to hide screens; turn off Raycast Target on non-interactive graphics.",
        "Nested Layout Groups and Content Size Fitters cascade rebuilds; use anchors and pooled list items for large or dynamic layouts.",
        "TextMeshPro uses SDF atlases; watch Auto Size, dynamic atlas growth and per-frame string allocations.",
        "UI Toolkit (UXML, USS, flexbox) is the default for editor tooling and data-heavy screens; uGUI remains strong for world-space, effects-heavy and Animator-driven UI."
      ],
      "quiz": [
        {
          "q": "A HUD Canvas holds 400 static elements and one timer label updated every frame. Profiling shows Canvas.BuildBatch taking 2 ms per frame. What is the most effective fix?",
          "options": [
            "Switch the Canvas render mode from Overlay to Screen Space - Camera",
            "Move the timer label onto its own nested Canvas under the HUD",
            "Turn off Raycast Target on all 400 static elements in the HUD",
            "Wrap the 400 static elements in a single Vertical Layout Group"
          ],
          "answer": 1,
          "explain": "Batching is per Canvas, so the one dirty label forces all 400 elements to re-batch. A nested Canvas isolates the frequently changing element; raycast targets affect input cost, not batching."
        },
        {
          "q": "Opening the pause menu causes a 25 ms spike. The menu is shown with `menuRoot.SetActive(true)` and has 300 elements. What change most directly reduces the spike?",
          "options": [
            "Add a Content Size Fitter to the root so layout is calculated once",
            "Replace every Image in the menu with a RawImage component instead",
            "Move the menu to a World Space Canvas positioned in front of the camera",
            "Keep the object active and toggle its Canvas component's enabled flag"
          ],
          "answer": 3,
          "explain": "SetActive runs OnEnable on every child and forces full layout and graphic rebuilds; disabling only the Canvas component stops drawing while keeping generated geometry. The other options do not avoid the rebuild."
        },
        {
          "q": "After adding a full-screen fade Image (alpha 0) to the top of the HUD Canvas, buttons beneath it stop responding. What is the cause?",
          "options": [
            "The fade Image has Raycast Target enabled and absorbs pointer events",
            "The transparent Image breaks batching, so buttons stop receiving input",
            "Alpha 0 Images force the Canvas into a layout rebuild that blocks input",
            "The EventSystem only processes the topmost Canvas in the scene hierarchy"
          ],
          "answer": 0,
          "explain": "The GraphicRaycaster hits any Graphic with Raycast Target on, regardless of alpha, and the topmost one consumes the click. Disable raycastTarget on the fade or use a CanvasGroup with blocksRaycasts off."
        },
        {
          "q": "A team is building a new inventory and shop screen with hundreds of styled entries, sorting and filtering, and several web developers on the team. No world-space or particle effects are needed. Which choice fits best?",
          "options": [
            "uGUI with a Grid Layout Group per entry and Animator transitions",
            "IMGUI with OnGUI calls, as it has the lowest per-element overhead",
            "UI Toolkit with UXML templates, USS classes and data binding",
            "uGUI with one Canvas per entry so each item batches independently"
          ],
          "answer": 2,
          "explain": "Data-heavy screens with consistent styling are UI Toolkit's strength and match web skills. IMGUI is for editor and debug tools, and a Canvas per entry destroys batching."
        },
        {
          "q": "A score label using TextMeshPro with Auto Size enabled is updated every frame with `label.text = \"Score: \" + score;`. It shows up as a CPU and GC hotspot. Which pair of changes addresses both costs?",
          "options": [
            "Use a static font asset and enable Raycast Target on the label",
            "Disable Auto Size and use SetText with a numeric format argument",
            "Switch the font atlas to dynamic and add a Content Size Fitter",
            "Move the label to UI Toolkit and keep the same string concatenation"
          ],
          "answer": 1,
          "explain": "Auto Size runs a fitting search on every text change, and string concatenation allocates every frame; SetText with numeric arguments avoids the allocation. The other changes either add cost or keep the allocation."
        }
      ]
    },
    {
      "id": "unity-assets-content",
      "title": "Assets and Content Management",
      "minutes": 13,
      "summary": "Import settings, texture compression, atlases, Resources, AssetBundles and Addressables, and how content turns into memory.",
      "lesson": [
        {
          "type": "p",
          "text": "A mobile build crashes on 3 GB Android phones after the second level. The memory profiler shows 900 MB of textures, including two copies of the same character atlas, a 4096x4096 uncompressed background and a pile of shop icons nobody has opened. None of this is a code bug in the usual sense; it is content management. In Unity, most of a shipped game's memory and download size is determined by import settings and by how assets are grouped and loaded."
        },
        {
          "type": "h",
          "text": "Import pipeline and meta files"
        },
        {
          "type": "p",
          "text": "Unity never uses your PNG, FBX or WAV at runtime. On import it converts each source file into an engine-native, platform-specific artifact cached in the `Library` folder, according to **import settings** stored in the adjacent `.meta` file. That same file holds the GUID that every reference to the asset uses (see the fundamentals and version-control lessons), so meta files must be committed and `Library` must not. Changing an import setting rewrites the meta file and triggers a reimport, which is why import settings are reviewable in diffs."
        },
        {
          "type": "h",
          "text": "Texture import settings and compression"
        },
        {
          "type": "p",
          "text": "Textures dominate memory, so their settings matter most. Key settings: **Max Size** (downscales at import), **Compression/Format** per platform, **Generate Mipmaps** (adds about 33% memory, needed for 3D surfaces, usually off for UI), **sRGB** (on for colour, off for masks and normal-like data), and **Read/Write** (keeps a CPU-side copy, roughly doubling memory; leave off unless code reads pixels)."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "2048 x 2048 texture, memory per format (without mips; add ~33% with mips)\nRGBA32 uncompressed   32 bpp   16.0 MB\nETC2 RGBA8 / BC7       8 bpp    4.0 MB\nASTC 4x4               8 bpp    4.0 MB\nASTC 6x6            ~3.56 bpp   ~1.8 MB\nASTC 8x8               2 bpp    1.0 MB\nBC1 / ETC2 RGB (no a)  4 bpp    2.0 MB"
        },
        {
          "type": "figure",
          "id": "unity-import-format-memory",
          "caption": "The same 2048x2048 texture drawn to scale per format: RGBA32 costs 16 MB, ASTC 8x8 1 MB, and a mip chain adds about a third on top.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 326\" role=\"img\" aria-label=\"Memory of a 2048 by 2048 texture per format, bars to scale: RGBA32 16 MB, ETC2 RGBA8 or BC7 4 MB, ASTC 4x4 4 MB, ASTC 6x6 about 1.8 MB, ASTC 8x8 1 MB, BC1 or ETC2 RGB 2 MB; mipmaps add about 33 percent.\"> <style> .unity-import-format-memory-t{font-size:13px;fill:var(--fig-ink)} .unity-import-format-memory-h{font-size:12px;font-weight:600;fill:var(--fig-muted)} .unity-import-format-memory-m{font-size:13px;fill:var(--fig-muted)} .unity-import-format-memory-b{fill:var(--fig-accent)} .unity-import-format-memory-mip{fill:var(--fig-accent2);fill-opacity:.55;transform-box:fill-box;transform-origin:0 50%;animation:unity-import-format-memory-mip 5s ease-in-out infinite} @keyframes unity-import-format-memory-mip{0%,15%{transform:scaleX(0)}40%,85%{transform:scaleX(1)}100%{transform:scaleX(0)}} </style> <text class=\"unity-import-format-memory-h\" x=\"20\" y=\"36\">FORMAT</text><text class=\"unity-import-format-memory-h\" x=\"206\" y=\"36\" text-anchor=\"end\">BPP</text><text class=\"unity-import-format-memory-h\" x=\"268\" y=\"36\" text-anchor=\"end\">MB</text><text class=\"unity-import-format-memory-h\" x=\"286\" y=\"36\">2048 × 2048, to scale</text> <line x1=\"286\" y1=\"48\" x2=\"286\" y2=\"274\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/> <text class=\"unity-import-format-memory-t\" x=\"20\" y=\"75\">RGBA32 uncompressed</text><text class=\"unity-import-format-memory-m\" x=\"206\" y=\"75\" text-anchor=\"end\">32</text><text class=\"unity-import-format-memory-t\" x=\"268\" y=\"75\" text-anchor=\"end\">16.0</text> <rect class=\"unity-import-format-memory-b\" x=\"286\" y=\"60\" width=\"240.0\" height=\"20\" rx=\"4\"/><rect class=\"unity-import-format-memory-mip\" x=\"527.0\" y=\"60\" width=\"80.0\" height=\"20\" rx=\"4\"/> <text class=\"unity-import-format-memory-t\" x=\"20\" y=\"113\">ETC2 RGBA8 / BC7</text><text class=\"unity-import-format-memory-m\" x=\"206\" y=\"113\" text-anchor=\"end\">8</text><text class=\"unity-import-format-memory-t\" x=\"268\" y=\"113\" text-anchor=\"end\">4.0</text> <rect class=\"unity-import-format-memory-b\" x=\"286\" y=\"98\" width=\"60.0\" height=\"20\" rx=\"4\"/><rect class=\"unity-import-format-memory-mip\" x=\"347.0\" y=\"98\" width=\"20.0\" height=\"20\" rx=\"4\"/> <text class=\"unity-import-format-memory-t\" x=\"20\" y=\"151\">ASTC 4x4</text><text class=\"unity-import-format-memory-m\" x=\"206\" y=\"151\" text-anchor=\"end\">8</text><text class=\"unity-import-format-memory-t\" x=\"268\" y=\"151\" text-anchor=\"end\">4.0</text> <rect class=\"unity-import-format-memory-b\" x=\"286\" y=\"136\" width=\"60.0\" height=\"20\" rx=\"4\"/><rect class=\"unity-import-format-memory-mip\" x=\"347.0\" y=\"136\" width=\"20.0\" height=\"20\" rx=\"4\"/> <text class=\"unity-import-format-memory-t\" x=\"20\" y=\"189\">ASTC 6x6</text><text class=\"unity-import-format-memory-m\" x=\"206\" y=\"189\" text-anchor=\"end\">~3.56</text><text class=\"unity-import-format-memory-t\" x=\"268\" y=\"189\" text-anchor=\"end\">~1.8</text> <rect class=\"unity-import-format-memory-b\" x=\"286\" y=\"174\" width=\"26.7\" height=\"20\" rx=\"4\"/><rect class=\"unity-import-format-memory-mip\" x=\"313.7\" y=\"174\" width=\"8.9\" height=\"20\" rx=\"4\"/> <text class=\"unity-import-format-memory-t\" x=\"20\" y=\"227\">ASTC 8x8</text><text class=\"unity-import-format-memory-m\" x=\"206\" y=\"227\" text-anchor=\"end\">2</text><text class=\"unity-import-format-memory-t\" x=\"268\" y=\"227\" text-anchor=\"end\">1.0</text> <rect class=\"unity-import-format-memory-b\" x=\"286\" y=\"212\" width=\"15.0\" height=\"20\" rx=\"4\"/><rect class=\"unity-import-format-memory-mip\" x=\"302.0\" y=\"212\" width=\"5.0\" height=\"20\" rx=\"4\"/> <text class=\"unity-import-format-memory-t\" x=\"20\" y=\"265\">BC1 / ETC2 RGB</text><text class=\"unity-import-format-memory-m\" x=\"206\" y=\"265\" text-anchor=\"end\">4</text><text class=\"unity-import-format-memory-t\" x=\"268\" y=\"265\" text-anchor=\"end\">2.0</text> <rect class=\"unity-import-format-memory-b\" x=\"286\" y=\"250\" width=\"30.0\" height=\"20\" rx=\"4\"/><rect class=\"unity-import-format-memory-mip\" x=\"317.0\" y=\"250\" width=\"10.0\" height=\"20\" rx=\"4\"/> <rect class=\"unity-import-format-memory-b\" x=\"20\" y=\"292\" width=\"16\" height=\"14\" rx=\"3\"/><text class=\"unity-import-format-memory-m\" x=\"44\" y=\"304\">texture, no mips</text> <rect x=\"180\" y=\"292\" width=\"16\" height=\"14\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\".55\"/><text class=\"unity-import-format-memory-m\" x=\"204\" y=\"304\">+ mip chain (~33%)</text> <text class=\"unity-import-format-memory-m\" x=\"620\" y=\"304\" text-anchor=\"end\">1 MB = 15 px</text> </svg>"
        },
        {
          "type": "p",
          "text": "GPU block compression formats stay compressed in VRAM and are sampled directly, unlike PNG, which must be fully decompressed. Platforms differ: desktop and consoles use the **BC** family (BC1 for opaque, BC7 for high-quality RGBA, BC5 for normal maps), modern mobile uses **ASTC** with a selectable block size trading quality for size, and **ETC2** is the Android baseline for older GPUs. If the chosen format is unsupported on a device, the texture is decompressed at load time to an uncompressed format, which silently multiplies memory and load time. Set per-platform overrides deliberately and enforce them with an `AssetPostprocessor` or preset rather than relying on artists remembering."
        },
        {
          "type": "h",
          "text": "Sprite atlases"
        },
        {
          "type": "p",
          "text": "A **Sprite Atlas** packs many sprites into one texture so UI and 2D renderers can batch into fewer draw calls. The pitfall is granularity: when any sprite from an atlas is needed, the whole atlas texture is loaded. Atlas by usage (one per screen or feature, a shared atlas for common icons), not by art folder, or a single shop icon will drag a 16 MB atlas of all shop content into the main menu. Sprites that are packed into an atlas and also referenced directly from bundles can be duplicated, so check builds with the tools below."
        },
        {
          "type": "h",
          "text": "The Resources folder"
        },
        {
          "type": "p",
          "text": "Any folder named `Resources` is included in the build in full, whether referenced or not, and is loadable by string path via `Resources.Load`. It looks convenient and Unity explicitly recommends against it for shipping content: the build contains everything in it, Unity builds a lookup index of all Resources objects that is loaded at startup (increasing launch time with size), memory can only be reclaimed with the global `Resources.UnloadUnusedAssets`, and string paths break silently on rename. Keep Resources for a handful of small bootstrap objects, if at all."
        },
        {
          "type": "h",
          "text": "AssetBundles"
        },
        {
          "type": "p",
          "text": "An **AssetBundle** is an archive of serialized assets built for one platform, loadable from disk or the network at runtime. Bundles let you ship content after release, split downloads and control memory, but the raw API leaves the hard parts to you. If asset A in bundle 1 references texture T, and T is not explicitly assigned to any bundle, T is **implicitly copied into bundle 1**. If bundle 2 also references T, it gets its own copy too: double the download and, once both are loaded, two separate texture objects in memory. Dependencies between bundles must be loaded first, and `AssetBundle.Unload(false)` unloads the bundle but leaves loaded objects alive and disconnected (reloading creates duplicates), while `Unload(true)` destroys objects still in use, producing missing textures."
        },
        {
          "type": "figure",
          "id": "unity-bundle-implicit-copy",
          "caption": "Texture T with no bundle of its own is copied into every bundle that references it; giving it a shared bundle leaves one copy that both depend on.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"Texture T not assigned to any bundle is copied into both bundles that reference it. Assigned to its own shared bundle, it exists once and both bundles depend on it.\"> <style> .unity-bundle-implicit-copy-t{font-size:14px;fill:var(--fig-ink)} .unity-bundle-implicit-copy-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-bundle-implicit-copy-s{font-size:12px;fill:var(--fig-muted)} .unity-bundle-implicit-copy-ok{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-bundle-implicit-copy-bad{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-bundle-implicit-copy-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-bundle-implicit-copy-bd{fill:var(--fig-bg);stroke:var(--fig-muted);stroke-width:1.5} .unity-bundle-implicit-copy-a{fill:var(--fig-accent);fill-opacity:.16;stroke:var(--fig-accent);stroke-width:1.5} .unity-bundle-implicit-copy-tx{fill:var(--fig-accent2);fill-opacity:.2;stroke:var(--fig-accent2);stroke-width:1.5} .unity-bundle-implicit-copy-cp{fill:var(--fig-bad);fill-opacity:.14;stroke:var(--fig-bad);stroke-width:1.5;stroke-dasharray:4 3} .unity-bundle-implicit-copy-ref{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:3 4;fill:none} .unity-bundle-implicit-copy-dep{stroke:var(--fig-accent);stroke-width:2;fill:none;stroke-dasharray:6 5;animation:unity-bundle-implicit-copy-flow 1.2s linear infinite} .unity-bundle-implicit-copy-c1{animation:unity-bundle-implicit-copy-c1 5s ease-in-out infinite} .unity-bundle-implicit-copy-c2{animation:unity-bundle-implicit-copy-c2 5s ease-in-out infinite} @keyframes unity-bundle-implicit-copy-flow{to{stroke-dashoffset:-11}} @keyframes unity-bundle-implicit-copy-c1{0%,55%{transform:translate(0,0);opacity:1}62%{transform:translate(0,0);opacity:0}63%{transform:translate(45px,-98px);opacity:0}70%{transform:translate(45px,-98px);opacity:1}92%,100%{transform:translate(0,0);opacity:1}} @keyframes unity-bundle-implicit-copy-c2{0%,55%{transform:translate(0,0);opacity:1}62%{transform:translate(0,0);opacity:0}63%{transform:translate(-90px,-98px);opacity:0}70%{transform:translate(-90px,-98px);opacity:1}92%,100%{transform:translate(0,0);opacity:1}} </style> <defs><marker id=\"unity-bundle-implicit-copy-ar\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0 L10 5 L0 10 z\" fill=\"var(--fig-accent)\"/></marker></defs> <rect class=\"unity-bundle-implicit-copy-pn\" x=\"20\" y=\"20\" width=\"290\" height=\"284\" rx=\"12\"/> <text class=\"unity-bundle-implicit-copy-h\" x=\"36\" y=\"46\">T not assigned to a bundle</text> <rect class=\"unity-bundle-implicit-copy-tx\" x=\"145\" y=\"66\" width=\"40\" height=\"40\" rx=\"8\"/><text class=\"unity-bundle-implicit-copy-t\" x=\"165\" y=\"91\" text-anchor=\"middle\">T</text><text class=\"unity-bundle-implicit-copy-s\" x=\"194\" y=\"91\">texture T</text> <path class=\"unity-bundle-implicit-copy-ref\" d=\"M165 106 L120 164 M165 106 L255 164\"/> <rect class=\"unity-bundle-implicit-copy-bd\" x=\"40\" y=\"132\" width=\"120\" height=\"96\" rx=\"10\"/><text class=\"unity-bundle-implicit-copy-s\" x=\"50\" y=\"150\">bundle 1</text> <rect class=\"unity-bundle-implicit-copy-bd\" x=\"170\" y=\"132\" width=\"120\" height=\"96\" rx=\"10\"/><text class=\"unity-bundle-implicit-copy-s\" x=\"180\" y=\"150\">bundle 2</text> <rect class=\"unity-bundle-implicit-copy-a\" x=\"52\" y=\"164\" width=\"40\" height=\"40\" rx=\"8\"/><text class=\"unity-bundle-implicit-copy-t\" x=\"72\" y=\"189\" text-anchor=\"middle\">A</text><rect class=\"unity-bundle-implicit-copy-a\" x=\"190\" y=\"164\" width=\"40\" height=\"40\" rx=\"8\"/><text class=\"unity-bundle-implicit-copy-t\" x=\"210\" y=\"189\" text-anchor=\"middle\">B</text> <g class=\"unity-bundle-implicit-copy-c1\"><rect class=\"unity-bundle-implicit-copy-cp\" x=\"100\" y=\"164\" width=\"40\" height=\"40\" rx=\"8\"/><text class=\"unity-bundle-implicit-copy-t\" x=\"120\" y=\"189\" text-anchor=\"middle\">T</text></g> <g class=\"unity-bundle-implicit-copy-c2\"><rect class=\"unity-bundle-implicit-copy-cp\" x=\"235\" y=\"164\" width=\"40\" height=\"40\" rx=\"8\"/><text class=\"unity-bundle-implicit-copy-t\" x=\"255\" y=\"189\" text-anchor=\"middle\">T</text></g> <text class=\"unity-bundle-implicit-copy-bad\" x=\"36\" y=\"262\">2 copies of T</text> <text class=\"unity-bundle-implicit-copy-s\" x=\"36\" y=\"282\">2× download, 2 textures in memory</text> <rect class=\"unity-bundle-implicit-copy-pn\" x=\"330\" y=\"20\" width=\"290\" height=\"284\" rx=\"12\"/> <text class=\"unity-bundle-implicit-copy-h\" x=\"346\" y=\"46\">T in its own shared bundle</text> <rect class=\"unity-bundle-implicit-copy-bd\" x=\"350\" y=\"66\" width=\"120\" height=\"80\" rx=\"10\"/><text class=\"unity-bundle-implicit-copy-s\" x=\"360\" y=\"84\">bundle 1</text><rect class=\"unity-bundle-implicit-copy-a\" x=\"390\" y=\"94\" width=\"40\" height=\"40\" rx=\"8\"/><text class=\"unity-bundle-implicit-copy-t\" x=\"410\" y=\"119\" text-anchor=\"middle\">A</text> <rect class=\"unity-bundle-implicit-copy-bd\" x=\"480\" y=\"66\" width=\"120\" height=\"80\" rx=\"10\"/><text class=\"unity-bundle-implicit-copy-s\" x=\"490\" y=\"84\">bundle 2</text><rect class=\"unity-bundle-implicit-copy-a\" x=\"520\" y=\"94\" width=\"40\" height=\"40\" rx=\"8\"/><text class=\"unity-bundle-implicit-copy-t\" x=\"540\" y=\"119\" text-anchor=\"middle\">B</text> <path class=\"unity-bundle-implicit-copy-dep\" d=\"M410 148 L458 178\" marker-end=\"url(#unity-bundle-implicit-copy-ar)\"/> <path class=\"unity-bundle-implicit-copy-dep\" d=\"M540 148 L492 178\" marker-end=\"url(#unity-bundle-implicit-copy-ar)\"/> <rect class=\"unity-bundle-implicit-copy-bd\" x=\"415\" y=\"180\" width=\"120\" height=\"58\" rx=\"10\"/><text class=\"unity-bundle-implicit-copy-s\" x=\"425\" y=\"214\">shared</text><rect class=\"unity-bundle-implicit-copy-tx\" x=\"480\" y=\"189\" width=\"40\" height=\"40\" rx=\"8\"/><text class=\"unity-bundle-implicit-copy-t\" x=\"500\" y=\"214\" text-anchor=\"middle\">T</text> <text class=\"unity-bundle-implicit-copy-ok\" x=\"346\" y=\"262\">1 copy of T</text> <text class=\"unity-bundle-implicit-copy-s\" x=\"346\" y=\"282\">loaded once, both bundles depend on it</text> </svg>"
        },
        {
          "type": "h",
          "text": "Addressables"
        },
        {
          "type": "p",
          "text": "The **Addressables** package (`com.unity.addressables`) is the layer on top of AssetBundles that most projects should use. You mark assets as addressable, give them an address and labels, and arrange them in **groups** whose settings control bundle packing (pack together, separately, or by label), local versus remote hosting, and compression. At build time it generates bundles plus a **catalog** mapping addresses to bundle locations, resolves dependencies, and at runtime loads bundles and their dependencies automatically."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using UnityEngine.AddressableAssets;\nusing UnityEngine.ResourceManagement.AsyncOperations;\n\nAsyncOperationHandle<GameObject> handle;\n\nasync Awaitable ShowBoss()\n{\n    handle = Addressables.LoadAssetAsync<GameObject>(\"enemies/boss\");\n    GameObject prefab = await handle.Task;\n    Instantiate(prefab);\n}\n\nvoid OnLevelExit()\n{\n    // Every load must be paired with a release, or the bundle never unloads.\n    Addressables.Release(handle);\n}"
        },
        {
          "type": "p",
          "text": "Addressables is **reference counted**: each load increments counts on the asset and its bundles, each `Release` decrements, and a bundle unloads when its count reaches zero. Forgotten releases are memory leaks; double releases unload content still in use. A subtle point: an asset loaded from a bundle generally stays in memory until its whole bundle unloads, so a 'pack together' group of 200 enemies keeps released enemies resident while any one is still in use. Group content by what is loaded and unloaded together. Use the Addressables **Analyze** rules and build reports to find duplicated dependencies, and assign shared materials, shaders and atlases to their own group."
        },
        {
          "type": "figure",
          "id": "unity-addressables-refcount",
          "caption": "Each load raises the count and each Release lowers it; the bundle unloads only at zero, so one missing Release keeps it resident.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"Addressables reference count over time. Paired loads and releases bring the count to zero and the bundle unloads; a missing Release leaves the count at 1 and the bundle never unloads.\"> <style> .unity-addressables-refcount-t{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-addressables-refcount-e{font-size:13px;fill:var(--fig-ink)} .unity-addressables-refcount-s{font-size:12px;fill:var(--fig-muted)} .unity-addressables-refcount-n{font-size:13px;font-weight:600;fill:var(--fig-accent)} .unity-addressables-refcount-okt{font-size:12px;fill:var(--fig-ok)} .unity-addressables-refcount-badt{font-size:12px;fill:var(--fig-bad);font-weight:600} .unity-addressables-refcount-ax{stroke:var(--fig-line);stroke-width:1.5} .unity-addressables-refcount-cnt{fill:none;stroke:var(--fig-accent);stroke-width:2.5;stroke-linejoin:round} .unity-addressables-refcount-ev{stroke:var(--fig-line);stroke-width:1;stroke-dasharray:3 3} .unity-addressables-refcount-ph{stroke:var(--fig-accent2);stroke-width:2;animation:unity-addressables-refcount-ph 7s linear infinite} @keyframes unity-addressables-refcount-ph{0%{transform:translateX(0)}85%,100%{transform:translateX(480px)}} </style> <text class=\"unity-addressables-refcount-t\" x=\"20\" y=\"96\">Paired</text><text class=\"unity-addressables-refcount-s\" x=\"20\" y=\"114\">refcount</text> <line class=\"unity-addressables-refcount-ev\" x1=\"160\" y1=\"50\" x2=\"160\" y2=\"138\"/><text class=\"unity-addressables-refcount-e\" x=\"160\" y=\"40\" text-anchor=\"middle\">Load</text><line class=\"unity-addressables-refcount-ev\" x1=\"260\" y1=\"50\" x2=\"260\" y2=\"138\"/><text class=\"unity-addressables-refcount-e\" x=\"260\" y=\"40\" text-anchor=\"middle\">Load</text><line class=\"unity-addressables-refcount-ev\" x1=\"360\" y1=\"50\" x2=\"360\" y2=\"138\"/><text class=\"unity-addressables-refcount-e\" x=\"360\" y=\"40\" text-anchor=\"middle\">Release</text><line class=\"unity-addressables-refcount-ev\" x1=\"460\" y1=\"50\" x2=\"460\" y2=\"138\"/><text class=\"unity-addressables-refcount-e\" x=\"460\" y=\"40\" text-anchor=\"middle\">Release</text> <line class=\"unity-addressables-refcount-ax\" x1=\"120\" y1=\"120\" x2=\"600\" y2=\"120\"/><path class=\"unity-addressables-refcount-cnt\" d=\"M120 120 H160 V100 H260 V80 H360 V100 H460 V120 H600\"/><text class=\"unity-addressables-refcount-n\" x=\"210\" y=\"92\" text-anchor=\"middle\">1</text><text class=\"unity-addressables-refcount-n\" x=\"310\" y=\"72\" text-anchor=\"middle\">2</text><text class=\"unity-addressables-refcount-n\" x=\"410\" y=\"92\" text-anchor=\"middle\">1</text><text class=\"unity-addressables-refcount-n\" x=\"530\" y=\"112\" text-anchor=\"middle\">0</text> <rect x=\"160\" y=\"128\" width=\"300\" height=\"10\" rx=\"5\" fill=\"var(--fig-ok)\" fill-opacity=\".45\"/><text class=\"unity-addressables-refcount-okt\" x=\"160\" y=\"156\">bundle in memory</text><text class=\"unity-addressables-refcount-okt\" x=\"470\" y=\"138\">unloads at 0</text> <text class=\"unity-addressables-refcount-t\" x=\"20\" y=\"246\">Unpaired</text><text class=\"unity-addressables-refcount-s\" x=\"20\" y=\"264\">refcount</text> <line class=\"unity-addressables-refcount-ev\" x1=\"160\" y1=\"200\" x2=\"160\" y2=\"288\"/><text class=\"unity-addressables-refcount-e\" x=\"160\" y=\"190\" text-anchor=\"middle\">Load</text><line class=\"unity-addressables-refcount-ev\" x1=\"260\" y1=\"200\" x2=\"260\" y2=\"288\"/><text class=\"unity-addressables-refcount-e\" x=\"260\" y=\"190\" text-anchor=\"middle\">Load</text><line class=\"unity-addressables-refcount-ev\" x1=\"360\" y1=\"200\" x2=\"360\" y2=\"288\"/><text class=\"unity-addressables-refcount-e\" x=\"360\" y=\"190\" text-anchor=\"middle\">Release</text><line class=\"unity-addressables-refcount-ev\" x1=\"460\" y1=\"200\" x2=\"460\" y2=\"288\"/><text class=\"unity-addressables-refcount-badt\" x=\"460\" y=\"190\" text-anchor=\"middle\">no Release</text> <line class=\"unity-addressables-refcount-ax\" x1=\"120\" y1=\"270\" x2=\"600\" y2=\"270\"/><path class=\"unity-addressables-refcount-cnt\" d=\"M120 270 H160 V250 H260 V230 H360 V250 H600\"/><text class=\"unity-addressables-refcount-n\" x=\"210\" y=\"242\" text-anchor=\"middle\">1</text><text class=\"unity-addressables-refcount-n\" x=\"310\" y=\"222\" text-anchor=\"middle\">2</text><text class=\"unity-addressables-refcount-n\" x=\"480\" y=\"242\" text-anchor=\"middle\">1</text> <rect x=\"160\" y=\"278\" width=\"440\" height=\"10\" rx=\"5\" fill=\"var(--fig-bad)\" fill-opacity=\".45\"/><text class=\"unity-addressables-refcount-badt\" x=\"600\" y=\"306\" text-anchor=\"end\">bundle never unloads: leak</text> <line class=\"unity-addressables-refcount-ph\" x1=\"120\" y1=\"20\" x2=\"120\" y2=\"312\"/> </svg>"
        },
        {
          "type": "h",
          "text": "Memory unloading"
        },
        {
          "type": "list",
          "items": [
            "`Resources.UnloadUnusedAssets` walks the object graph and frees assets with no references. It is expensive (a long main-thread stall on large projects) and is called automatically on non-additive scene loads; call it yourself only at natural pause points.",
            "`Destroy` on a GameObject does not free the textures and meshes it used; only unloading unreferenced assets or releasing their bundle does.",
            "Managed references from static fields, events and caches keep assets alive; the Memory Profiler shows the reference chain that pins an object.",
            "Device memory budgets are much lower than device RAM: on a 3 GB Android phone the OS may kill a game well before 1.5 GB, so set an explicit budget per platform and track it in CI."
          ]
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "A 'small' asset duplicated into ten bundles is ten downloads and potentially ten copies in memory. Duplication is invisible in the Project window; you only see it in build reports, Addressables Analyze or a memory snapshot."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents reach for `Resources.Load` and string paths because it is the shortest working code. Tell the agent the project's loading strategy (Addressables groups, labels, who owns release). Verify every `LoadAssetAsync` or `InstantiateAsync` has a matching `Release` or `ReleaseInstance` on a clear lifecycle, that it does not call `Resources.UnloadUnusedAssets` every frame or on every screen change, and that new textures it creates or imports have per-platform compression set. Never let an agent regenerate or delete `.meta` files to 'fix' an import error."
        }
      ],
      "keyPoints": [
        "Import settings in .meta files decide the runtime format; GUIDs in meta files hold every reference together.",
        "Texture format dominates memory: GPU block compression (ASTC, ETC2, BC) stays compressed in VRAM; Read/Write and mipmaps cost extra.",
        "Avoid Resources for shipping content; it bloats builds, slows startup and cannot be unloaded selectively.",
        "Unassigned shared dependencies get duplicated into every AssetBundle that references them; assign shared assets to their own group.",
        "Addressables is reference counted: pair every load with a release and group content by what loads and unloads together."
      ],
      "quiz": [
        {
          "q": "Two Addressables groups, Level1 and Level2, each contain prefabs using the same 8 MB rock texture, which is not itself addressable. Memory shows 16 MB of rock texture after both levels' bundles load. What fixes it?",
          "options": [
            "Enable Read/Write on the rock texture so both bundles share one copy",
            "Call Resources.UnloadUnusedAssets after each level's bundle has loaded",
            "Switch both groups to Pack Separately so each prefab gets a bundle",
            "Make the texture addressable in a shared group so both depend on it"
          ],
          "answer": 3,
          "explain": "An unassigned dependency is copied into every bundle that references it, producing two distinct objects. Assigning it to its own group makes both bundles reference one copy; packing separately would duplicate it even more."
        },
        {
          "q": "A 2048x2048 RGBA UI texture is imported as RGBA32 with mipmaps and Read/Write enabled. It is only drawn by an Image. Which settings change gives the biggest memory reduction without changing resolution?",
          "options": [
            "Disable sRGB and enable the Alpha Is Transparency import flag",
            "Use ASTC compression, disable mipmaps and disable Read/Write",
            "Move the texture into a Resources folder and load it on demand",
            "Enable Generate Mipmaps streaming and keep RGBA32 for quality"
          ],
          "answer": 1,
          "explain": "RGBA32 with mips is about 21 MB on the GPU, and Read/Write keeps a CPU copy as well. ASTC cuts the GPU copy to a few MB, UI does not need mips, and disabling Read/Write drops the CPU copy."
        },
        {
          "q": "A game loads 300 MB of content from Resources folders. Players complain about a long startup before the first scene even appears. Which explanation fits?",
          "options": [
            "Resources assets are always decompressed into memory at startup",
            "Resources textures cannot use GPU compression on mobile devices",
            "Unity loads a lookup index of all Resources objects at launch",
            "Resources.Load forces a synchronous shader warmup at startup"
          ],
          "answer": 2,
          "explain": "The Resources system builds an index of every object in all Resources folders, and that index is loaded during startup, so its cost grows with Resources content. Assets themselves are not all loaded or decompressed at launch."
        },
        {
          "q": "Using Addressables, a team loads a level's enemy prefabs individually from one Pack Together group of 200 enemies. After releasing 199 of them, memory barely changes. Why?",
          "options": [
            "Assets generally stay resident until their entire bundle is unloaded",
            "Addressables never frees memory until Application.Quit is called",
            "Release only works on handles created with InstantiateAsync calls",
            "Pack Together groups disable reference counting for their assets"
          ],
          "answer": 0,
          "explain": "The bundle is still referenced by the one remaining enemy, and assets loaded from a bundle generally remain until the bundle unloads. Group content by what is loaded and unloaded together, or pack it more finely."
        },
        {
          "q": "An artist imports a new texture and an agent 'fixes' a warning by deleting and regenerating its .meta file. Afterwards, three prefabs show missing textures. What happened?",
          "options": [
            "The texture was reimported with a different compression format",
            "The Library folder cache was invalidated for the whole project",
            "Addressables catalog entries were rebuilt without the texture",
            "The regenerated meta file has a new GUID, so references broke"
          ],
          "answer": 3,
          "explain": "References between assets are stored as GUIDs from the meta file. A new meta file means a new GUID, so every prefab and material pointing at the old GUID now has a missing reference."
        }
      ]
    },
    {
      "id": "unity-profiling-performance",
      "title": "Profiling and Performance in Unity",
      "minutes": 14,
      "summary": "Measuring on device with the Profiler, Frame Debugger and Memory Profiler, finding the real bottleneck, and when Jobs, Burst and DOTS pay off.",
      "lesson": [
        {
          "type": "p",
          "text": "A team spends a week optimizing scripts because the editor profiler shows `PlayerLoop` at 14 ms. On the target phone, the game is GPU bound at 22 ms, and after ten minutes it throttles from 60 to 40 fps. The week was wasted because it measured the wrong thing in the wrong place. Performance work in Unity follows one rule above all: **measure on target hardware, find which unit is the bottleneck, then optimize that**."
        },
        {
          "type": "h",
          "text": "Frame budgets"
        },
        {
          "type": "list",
          "items": [
            "60 fps = 16.67 ms per frame; 30 fps = 33.3 ms; 120 fps = 8.33 ms.",
            "On mobile, aim for roughly 65-70% of the budget (about 11 ms at 60 fps) in sustained play so the device has thermal headroom.",
            "Mobile platforms default to 30 fps unless you set `Application.targetFrameRate`; many 'why is my phone build capped' questions end here.",
            "A frame has a main thread, a render thread, worker threads and the GPU running in a pipeline. The slowest of them sets the frame rate."
          ]
        },
        {
          "type": "h",
          "text": "The Unity Profiler"
        },
        {
          "type": "p",
          "text": "The **Profiler window** (Window > Analysis > Profiler) records per-frame data from modules: CPU Usage, Rendering, Memory, Physics, UI, Audio, GPU and others. In the CPU module, the **Hierarchy** view aggregates time and **GC Alloc** per marker, and the **Timeline** view shows every thread side by side, which is how you see waits and dependencies. Sort Hierarchy by GC Alloc too: any steady per-frame allocation eventually triggers garbage collection spikes, even with the incremental GC."
        },
        {
          "type": "p",
          "text": "By default the profiler only records Unity's built-in markers and the top-level calls into your scripts (`Update`, `FixedUpdate`, coroutines). **Deep Profiling** instruments every managed method call. It answers 'which function' when you have no idea, but its overhead is large (often several times slower, worse for many small calls) and skews results toward call-heavy code. Use it briefly to locate a region, then add explicit markers and profile normally."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using Unity.Profiling;\n\npublic class CrowdSystem : MonoBehaviour\n{\n    static readonly ProfilerMarker s_Steer = new ProfilerMarker(\"Crowd.Steer\");\n    static readonly ProfilerMarker s_Avoid = new ProfilerMarker(\"Crowd.Avoid\");\n\n    void Update()\n    {\n        using (s_Steer.Auto()) { Steer(); }\n        using (s_Avoid.Auto()) { Avoid(); }\n    }\n}"
        },
        {
          "type": "p",
          "text": "`ProfilerMarker` costs almost nothing when the profiler is not recording and is compiled out of non-development builds, so leave markers in. They also show up in the **Profile Analyzer** package, which compares captures across many frames (median, worst frames, before vs after a change) instead of eyeballing a single spike."
        },
        {
          "type": "h",
          "text": "Profiling on device"
        },
        {
          "type": "p",
          "text": "Editor numbers include editor overhead (`EditorLoop`, inspector repaints, the Scene view), run on a desktop CPU and GPU, and use Mono with JIT rather than IL2CPP. Build with **Development Build** and **Autoconnect Profiler** enabled, then attach over USB or the network. Development builds have small overheads of their own; avoid **Script Debugging** when measuring because it adds significant cost. For GPU work, platform tools (Xcode GPU frame capture and Instruments, Android GPU Inspector, Arm Performance Studio, RenderDoc, PIX) see what Unity's profiler cannot: per-pass GPU timings, bandwidth and shader occupancy."
        },
        {
          "type": "h",
          "text": "CPU bound or GPU bound"
        },
        {
          "type": "p",
          "text": "Read the main thread in the Timeline view. If the main thread is busy for most of the frame with scripts, physics, animation or culling, you are CPU bound there. If the main thread finishes early and then sits in **Gfx.WaitForPresentOnGfxThread** (or the render thread waits for the GPU), the GPU is the bottleneck. If the render thread is busy submitting while the main thread waits in a sync marker, draw call submission is the problem. **WaitForTargetFPS** means you are simply idling to hit the target frame rate. A quick sanity test: lower the render resolution drastically; if frame time drops, you are GPU bound (likely fill rate or fragment shader cost); if it does not, look at the CPU."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Example capture on a phone, target 60 fps (16.7 ms)\nMain thread:   PlayerLoop 6.1 ms ... Gfx.WaitForPresentOnGfxThread 15.8 ms\nRender thread: 5.0 ms submitting, then waiting\nFrame time:    22 ms\nVerdict: GPU bound. Optimizing C# scripts will not change the frame rate."
        },
        {
          "type": "figure",
          "id": "unity-gpu-bound-capture",
          "caption": "The lesson's phone capture to scale: the main thread finishes PlayerLoop in 6.1 ms and then waits on the GPU, which is busy for the whole 22 ms frame.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"Phone capture at 60 fps target, to scale: main thread PlayerLoop 6.1 ms then Gfx.WaitForPresentOnGfxThread 15.8 ms, render thread 5.0 ms submitting then waiting, GPU busy for the whole 22 ms frame. GPU bound.\"> <style> .unity-gpu-bound-capture-l{font-size:13px;fill:var(--fig-ink)} .unity-gpu-bound-capture-b{font-size:13px;fill:var(--fig-ink)} .unity-gpu-bound-capture-s{font-size:12px;fill:var(--fig-muted)} .unity-gpu-bound-capture-v{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-gpu-bound-capture-work{fill:var(--fig-accent);fill-opacity:.3;stroke:var(--fig-accent);stroke-width:1.5} .unity-gpu-bound-capture-wait{fill:var(--fig-line);fill-opacity:.35;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 3} .unity-gpu-bound-capture-gpu{fill:var(--fig-bad);fill-opacity:.25;stroke:var(--fig-bad);stroke-width:1.5} .unity-gpu-bound-capture-ph{stroke:var(--fig-accent2);stroke-width:2;animation:unity-gpu-bound-capture-ph 5s linear infinite} @keyframes unity-gpu-bound-capture-ph{0%{transform:translateX(0)}80%,100%{transform:translateX(440px)}} </style> <text class=\"unity-gpu-bound-capture-l\" x=\"20\" y=\"74\">Main thread</text> <text class=\"unity-gpu-bound-capture-l\" x=\"20\" y=\"124\">Render thread</text> <text class=\"unity-gpu-bound-capture-l\" x=\"20\" y=\"174\">GPU</text> <rect class=\"unity-gpu-bound-capture-work\" x=\"130.0\" y=\"54\" width=\"122.0\" height=\"30\" rx=\"6\"/><text class=\"unity-gpu-bound-capture-b\" x=\"140\" y=\"74\">PlayerLoop 6.1</text> <rect class=\"unity-gpu-bound-capture-wait\" x=\"252.0\" y=\"54\" width=\"316.0\" height=\"30\" rx=\"6\"/><text class=\"unity-gpu-bound-capture-b\" x=\"262\" y=\"74\">Gfx.WaitForPresentOnGfxThread 15.8</text> <rect class=\"unity-gpu-bound-capture-work\" x=\"130.0\" y=\"104\" width=\"100\" height=\"30\" rx=\"6\"/><text class=\"unity-gpu-bound-capture-b\" x=\"140\" y=\"124\">submit 5.0</text> <rect class=\"unity-gpu-bound-capture-wait\" x=\"230.0\" y=\"104\" width=\"340.0\" height=\"30\" rx=\"6\"/><text class=\"unity-gpu-bound-capture-s\" x=\"240\" y=\"123\">waiting</text> <rect class=\"unity-gpu-bound-capture-gpu\" x=\"130.0\" y=\"154\" width=\"440\" height=\"30\" rx=\"6\"/><text class=\"unity-gpu-bound-capture-b\" x=\"140\" y=\"174\">GPU frame busy the whole time</text> <path d=\"M464.0 40 V50 M464.0 88 V100 M464.0 138 V150 M464.0 188 V208\" stroke=\"var(--fig-warn)\" stroke-width=\"2.5\" fill=\"none\"/> <text class=\"unity-gpu-bound-capture-s\" x=\"464.0\" y=\"34\" text-anchor=\"middle\">16.7 ms budget</text> <text class=\"unity-gpu-bound-capture-s\" x=\"570.0\" y=\"34\" text-anchor=\"middle\">22 ms</text> <path d=\"M570.0 40 V50 M570.0 88 V100 M570.0 138 V150 M570.0 188 V208\" stroke=\"var(--fig-bad)\" stroke-width=\"2.5\" fill=\"none\"/> <line x1=\"130\" y1=\"212\" x2=\"610\" y2=\"212\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/> <line x1=\"130.0\" y1=\"208\" x2=\"130.0\" y2=\"216\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"unity-gpu-bound-capture-s\" x=\"130.0\" y=\"232\" text-anchor=\"middle\">0</text><line x1=\"210.0\" y1=\"208\" x2=\"210.0\" y2=\"216\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"unity-gpu-bound-capture-s\" x=\"210.0\" y=\"232\" text-anchor=\"middle\">4</text><line x1=\"290.0\" y1=\"208\" x2=\"290.0\" y2=\"216\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"unity-gpu-bound-capture-s\" x=\"290.0\" y=\"232\" text-anchor=\"middle\">8</text><line x1=\"370.0\" y1=\"208\" x2=\"370.0\" y2=\"216\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"unity-gpu-bound-capture-s\" x=\"370.0\" y=\"232\" text-anchor=\"middle\">12</text><line x1=\"450.0\" y1=\"208\" x2=\"450.0\" y2=\"216\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"unity-gpu-bound-capture-s\" x=\"450.0\" y=\"232\" text-anchor=\"middle\">16</text><line x1=\"530.0\" y1=\"208\" x2=\"530.0\" y2=\"216\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"unity-gpu-bound-capture-s\" x=\"530.0\" y=\"232\" text-anchor=\"middle\">20</text><line x1=\"610.0\" y1=\"208\" x2=\"610.0\" y2=\"216\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"unity-gpu-bound-capture-s\" x=\"610.0\" y=\"232\" text-anchor=\"middle\">24 ms</text> <line class=\"unity-gpu-bound-capture-ph\" x1=\"130\" y1=\"44\" x2=\"130\" y2=\"196\"/> <text class=\"unity-gpu-bound-capture-v\" x=\"20\" y=\"268\">Verdict: GPU bound. Optimizing C# scripts will not change the frame rate.</text> </svg>"
        },
        {
          "type": "h",
          "text": "Frame Debugger and Memory Profiler"
        },
        {
          "type": "p",
          "text": "The **Frame Debugger**, introduced in the rendering lesson, is the next step once the Profiler says rendering is the problem: it explains why draws did not batch, and it also works on a connected development build, not just in the editor. The **Memory Profiler** package (`com.unity.memoryprofiler`) captures full snapshots: every native and managed object, its size and the references keeping it alive. Take a snapshot after loading a level and another after returning to the menu; comparing them shows leaks like a retained level texture or a static list of destroyed enemies."
        },
        {
          "type": "h",
          "text": "Mobile thermal throttling"
        },
        {
          "type": "p",
          "text": "Phones have no fans. A game that holds 60 fps for two minutes may heat the SoC until the OS lowers CPU and GPU clocks, and frame time rises by 30-50%. Always run soak tests of 15-30 minutes on a mid-range device. Mitigations: cap at 30 fps for less demanding content, leave budget headroom, reduce GPU work (resolution scaling, cheaper post-processing), and use the **Adaptive Performance** package where supported to react to thermal warnings by scaling quality."
        },
        {
          "type": "figure",
          "id": "unity-thermal-soak-curve",
          "caption": "Over a soak test a phone with no headroom throttles from 16.7 to 25 ms per frame, while the same rise from an 11 ms budget stays under the 60 fps line.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"Frame time over a 20 minute soak test on a phone. Running at 16.7 ms with no headroom, throttling pushes frame time to 25 ms, 60 to 40 fps. Starting at an 11 ms budget, the same 30 percent rise stays under 16.7 ms.\"> <style> .unity-thermal-soak-curve-s{font-size:12px;fill:var(--fig-muted)} .unity-thermal-soak-curve-m{font-size:13px;fill:var(--fig-muted)} .unity-thermal-soak-curve-bt{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-thermal-soak-curve-ot{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-thermal-soak-curve-g{stroke:var(--fig-line);stroke-width:1} .unity-thermal-soak-curve-base{fill:none;stroke-width:2.5;stroke-opacity:.25} .unity-thermal-soak-curve-draw{fill:none;stroke-width:2.5;stroke-dasharray:100;stroke-dashoffset:100;animation:unity-thermal-soak-curve-draw 7s linear infinite} .unity-thermal-soak-curve-a{stroke:var(--fig-bad)} .unity-thermal-soak-curve-b{stroke:var(--fig-ok)} @keyframes unity-thermal-soak-curve-draw{0%{stroke-dashoffset:100}75%,95%{stroke-dashoffset:0}100%{stroke-dashoffset:0;stroke-opacity:0}} </style> <line class=\"unity-thermal-soak-curve-g\" x1=\"80\" y1=\"260.0\" x2=\"600\" y2=\"260.0\"/><text class=\"unity-thermal-soak-curve-s\" x=\"70\" y=\"264.0\" text-anchor=\"end\">0</text><line class=\"unity-thermal-soak-curve-g\" x1=\"80\" y1=\"193.3\" x2=\"600\" y2=\"193.3\"/><text class=\"unity-thermal-soak-curve-s\" x=\"70\" y=\"197.3\" text-anchor=\"end\">10</text><line class=\"unity-thermal-soak-curve-g\" x1=\"80\" y1=\"126.7\" x2=\"600\" y2=\"126.7\"/><text class=\"unity-thermal-soak-curve-s\" x=\"70\" y=\"130.7\" text-anchor=\"end\">20</text><line class=\"unity-thermal-soak-curve-g\" x1=\"80\" y1=\"60.0\" x2=\"600\" y2=\"60.0\"/><text class=\"unity-thermal-soak-curve-s\" x=\"70\" y=\"64.0\" text-anchor=\"end\">30</text><text class=\"unity-thermal-soak-curve-s\" x=\"80\" y=\"280\" text-anchor=\"middle\">0</text><text class=\"unity-thermal-soak-curve-s\" x=\"210\" y=\"280\" text-anchor=\"middle\">5</text><text class=\"unity-thermal-soak-curve-s\" x=\"340\" y=\"280\" text-anchor=\"middle\">10</text><text class=\"unity-thermal-soak-curve-s\" x=\"470\" y=\"280\" text-anchor=\"middle\">15</text><text class=\"unity-thermal-soak-curve-s\" x=\"600\" y=\"280\" text-anchor=\"middle\">20</text> <line x1=\"80\" y1=\"148.7\" x2=\"600\" y2=\"148.7\" stroke=\"var(--fig-warn)\" stroke-width=\"1.5\" stroke-dasharray=\"5 4\"/> <text class=\"unity-thermal-soak-curve-s\" x=\"596\" y=\"142.7\" text-anchor=\"end\">16.7 ms = 60 fps</text> <path class=\"unity-thermal-soak-curve-base unity-thermal-soak-curve-a\" d=\"M80 148.7 L132 148.7 C171 148.7 197 93.3 236 93.3 L600 93.3\"/><path class=\"unity-thermal-soak-curve-draw unity-thermal-soak-curve-a\" pathLength=\"100\" d=\"M80 148.7 L132 148.7 C171 148.7 197 93.3 236 93.3 L600 93.3\"/> <path class=\"unity-thermal-soak-curve-base unity-thermal-soak-curve-b\" d=\"M80 186.7 L184 186.7 C230.79999999999998 186.7 267.20000000000005 163.3 314 163.3 L600 163.3\"/><path class=\"unity-thermal-soak-curve-draw unity-thermal-soak-curve-b\" pathLength=\"100\" d=\"M80 186.7 L184 186.7 C230.79999999999998 186.7 267.20000000000005 163.3 314 163.3 L600 163.3\"/> <text class=\"unity-thermal-soak-curve-bt\" x=\"596\" y=\"83.3\" text-anchor=\"end\">no headroom: 16.7 → 25 ms (60 → 40 fps)</text> <text class=\"unity-thermal-soak-curve-ot\" x=\"596\" y=\"183.3\" text-anchor=\"end\">11 ms budget: still under 16.7</text> <text class=\"unity-thermal-soak-curve-m\" x=\"249\" y=\"123.3\">SoC heats, clocks drop</text> <text class=\"unity-thermal-soak-curve-m\" x=\"340\" y=\"306\" text-anchor=\"middle\">minutes of sustained play</text> <text class=\"unity-thermal-soak-curve-m\" transform=\"translate(28 160) rotate(-90)\" text-anchor=\"middle\">frame time (ms)</text> </svg>"
        },
        {
          "type": "h",
          "text": "C# Job System, Burst and DOTS"
        },
        {
          "type": "p",
          "text": "When CPU work is genuinely heavy and data-parallel (crowds, projectiles, procedural meshes, pathfinding batches), move it off the main thread. The **C# Job System** schedules structs implementing `IJob` or `IJobParallelFor` onto Unity's worker threads. Jobs operate on **NativeContainers** (`NativeArray<T>` and friends) allocated outside the managed heap; a **safety system** detects race conditions and missing dependencies in the editor. **Burst** compiles a subset of C# (no managed objects, no classes, no GC) through LLVM into highly optimized, often SIMD-vectorized native code; speedups of 10x or more over plain C# for math-heavy loops are common."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using Unity.Burst;\nusing Unity.Collections;\nusing Unity.Jobs;\nusing Unity.Mathematics;\n\n[BurstCompile]\nstruct MoveJob : IJobParallelFor\n{\n    public NativeArray<float3> positions;\n    [ReadOnly] public NativeArray<float3> velocities;\n    public float dt;\n    public void Execute(int i) => positions[i] += velocities[i] * dt;\n}\n\n// var handle = new MoveJob { positions = pos, velocities = vel, dt = Time.deltaTime }\n//     .Schedule(pos.Length, 64);   // 64 items per batch\n// ... do other main-thread work ...\n// handle.Complete();              // complete as late as possible"
        },
        {
          "type": "figure",
          "id": "unity-job-complete-late",
          "caption": "Batches of 64 run on worker threads in parallel with main-thread work when Complete() comes late; calling it right after Schedule() turns that time into waiting.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"IJobParallelFor batches of 64 running on three worker threads. Completing late lets them overlap other main-thread work; calling Complete right after Schedule makes the main thread wait and the frame longer.\"> <style> .unity-job-complete-late-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-job-complete-late-l{font-size:13px;fill:var(--fig-muted)} .unity-job-complete-late-e{font-size:12px;fill:var(--fig-ink)} .unity-job-complete-late-n{font-size:11px;fill:var(--fig-ink)} .unity-job-complete-late-bt{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-job-complete-late-ot{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-job-complete-late-mw{fill:var(--fig-accent);fill-opacity:.25;stroke:var(--fig-accent);stroke-width:1.5} .unity-job-complete-late-wt{fill:var(--fig-warn);fill-opacity:.2;stroke:var(--fig-warn);stroke-width:1.5;stroke-dasharray:4 3} .unity-job-complete-late-bj{fill:var(--fig-accent2);fill-opacity:.3;stroke:var(--fig-accent2);stroke-width:1.5;animation:unity-job-complete-late-bj 6s linear infinite backwards} .unity-job-complete-late-k1{animation-delay:.5s}.unity-job-complete-late-k2{animation-delay:1s}.unity-job-complete-late-k3{animation-delay:1.5s} @keyframes unity-job-complete-late-bj{0%{fill-opacity:.04;stroke-opacity:.3}5%,85%{fill-opacity:.3;stroke-opacity:1}95%,100%{fill-opacity:.04;stroke-opacity:.3}} </style> <text class=\"unity-job-complete-late-h\" x=\"20\" y=\"30\">Complete() as late as possible</text> <text class=\"unity-job-complete-late-l\" x=\"20\" y=\"61\">Main</text><rect class=\"unity-job-complete-late-mw\" x=\"130\" y=\"44\" width=\"20\" height=\"24\" rx=\"5\"/><rect class=\"unity-job-complete-late-mw\" x=\"152\" y=\"44\" width=\"238\" height=\"24\" rx=\"5\"/><text class=\"unity-job-complete-late-e\" x=\"162\" y=\"60\">other main-thread work</text><rect class=\"unity-job-complete-late-mw\" x=\"392\" y=\"44\" width=\"10\" height=\"24\" rx=\"3\"/> <text class=\"unity-job-complete-late-l\" x=\"20\" y=\"89\">Worker 1</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k0\" x=\"152\" y=\"76\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"171\" y=\"89\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k1\" x=\"192\" y=\"76\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"211\" y=\"89\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k2\" x=\"232\" y=\"76\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"251\" y=\"89\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k3\" x=\"272\" y=\"76\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"291\" y=\"89\" text-anchor=\"middle\">64</text> <text class=\"unity-job-complete-late-l\" x=\"20\" y=\"111\">Worker 2</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k0\" x=\"152\" y=\"98\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"171\" y=\"111\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k1\" x=\"192\" y=\"98\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"211\" y=\"111\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k2\" x=\"232\" y=\"98\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"251\" y=\"111\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k3\" x=\"272\" y=\"98\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"291\" y=\"111\" text-anchor=\"middle\">64</text> <text class=\"unity-job-complete-late-l\" x=\"20\" y=\"133\">Worker 3</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k0\" x=\"152\" y=\"120\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"171\" y=\"133\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k1\" x=\"192\" y=\"120\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"211\" y=\"133\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k2\" x=\"232\" y=\"120\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"251\" y=\"133\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k3\" x=\"272\" y=\"120\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"291\" y=\"133\" text-anchor=\"middle\">64</text> <line x1=\"402\" y1=\"38\" x2=\"402\" y2=\"146\" stroke=\"var(--fig-ok)\" stroke-width=\"2\"/><text class=\"unity-job-complete-late-ot\" x=\"410\" y=\"61\">frame done</text> <text class=\"unity-job-complete-late-h\" x=\"20\" y=\"180\">Complete() right after Schedule()</text> <text class=\"unity-job-complete-late-l\" x=\"20\" y=\"211\">Main</text><rect class=\"unity-job-complete-late-mw\" x=\"130\" y=\"194\" width=\"20\" height=\"24\" rx=\"5\"/><rect class=\"unity-job-complete-late-wt\" x=\"152\" y=\"194\" width=\"158\" height=\"24\" rx=\"5\"/><text class=\"unity-job-complete-late-e\" x=\"162\" y=\"210\">waiting in Complete()</text><rect class=\"unity-job-complete-late-mw\" x=\"312\" y=\"194\" width=\"238\" height=\"24\" rx=\"5\"/><text class=\"unity-job-complete-late-e\" x=\"322\" y=\"210\">other main-thread work</text> <text class=\"unity-job-complete-late-l\" x=\"20\" y=\"239\">Worker 1</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k0\" x=\"152\" y=\"226\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"171\" y=\"239\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k1\" x=\"192\" y=\"226\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"211\" y=\"239\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k2\" x=\"232\" y=\"226\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"251\" y=\"239\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k3\" x=\"272\" y=\"226\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"291\" y=\"239\" text-anchor=\"middle\">64</text> <text class=\"unity-job-complete-late-l\" x=\"20\" y=\"261\">Worker 2</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k0\" x=\"152\" y=\"248\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"171\" y=\"261\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k1\" x=\"192\" y=\"248\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"211\" y=\"261\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k2\" x=\"232\" y=\"248\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"251\" y=\"261\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k3\" x=\"272\" y=\"248\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"291\" y=\"261\" text-anchor=\"middle\">64</text> <text class=\"unity-job-complete-late-l\" x=\"20\" y=\"283\">Worker 3</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k0\" x=\"152\" y=\"270\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"171\" y=\"283\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k1\" x=\"192\" y=\"270\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"211\" y=\"283\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k2\" x=\"232\" y=\"270\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"251\" y=\"283\" text-anchor=\"middle\">64</text><rect class=\"unity-job-complete-late-bj unity-job-complete-late-k3\" x=\"272\" y=\"270\" width=\"38\" height=\"18\" rx=\"4\"/><text class=\"unity-job-complete-late-n\" x=\"291\" y=\"283\" text-anchor=\"middle\">64</text> <line x1=\"550\" y1=\"188\" x2=\"550\" y2=\"296\" stroke=\"var(--fig-bad)\" stroke-width=\"2\"/><text class=\"unity-job-complete-late-bt\" x=\"542\" y=\"288\" text-anchor=\"end\">frame ends later</text><line x1=\"402\" y1=\"224\" x2=\"402\" y2=\"296\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/> </svg>"
        },
        {
          "type": "p",
          "text": "**DOTS** (Data-Oriented Technology Stack) combines Jobs and Burst with **Entities**, Unity's ECS. Entities are ids; components are plain structs stored by **archetype** in 16 KB chunks, so systems iterate tightly packed memory. Authoring still happens with GameObjects in **subscenes**, which **bakers** convert into entity data. Entities Graphics renders them, and Unity Physics and Netcode for Entities build on it. DOTS shines for tens of thousands of similar simulated things; it costs a different programming model, a smaller ecosystem and more complex tooling. Most projects benefit more from Jobs plus Burst on hot spots inside an otherwise GameObject-based game."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Classic misreads: optimizing scripts in a GPU-bound game, trusting editor timings, treating a Deep Profile capture as representative, and calling `handle.Complete()` immediately after `Schedule()`, which makes the job run while the main thread waits and removes most of the parallelism."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Give the agent real profiler evidence: device, build type, frame time, the top markers from the Timeline view, and whether the main thread waits on the GPU. Without it, agents default to micro-optimizations like caching `GetComponent` that rarely move the frame. When an agent writes jobs, verify it uses Burst-compatible types, disposes every `NativeArray` with the right Allocator, does not call `Complete()` right after scheduling, and marks read-only inputs `[ReadOnly]`. Require a before and after capture (Profile Analyzer) on device for every claimed optimization."
        }
      ],
      "keyPoints": [
        "Measure on the target device with a development build; editor timings and Deep Profiling distort results.",
        "Use the Timeline view to decide CPU vs GPU bound: a main thread waiting in Gfx.WaitForPresent means the GPU is the bottleneck.",
        "ProfilerMarkers, Profile Analyzer, Frame Debugger and Memory Profiler each answer a different question; compare snapshots to find leaks.",
        "Mobile needs budget headroom and long soak tests because thermal throttling raises frame time after minutes.",
        "Jobs plus Burst give large wins on data-parallel hot spots; full DOTS/Entities pays off for very large simulations."
      ],
      "quiz": [
        {
          "q": "A phone capture at a 60 fps target shows the main thread doing 5 ms of work, then waiting 14 ms in Gfx.WaitForPresentOnGfxThread; frame time is 20 ms. Which optimization is most likely to help?",
          "options": [
            "Lower render resolution or cut fragment shader and overdraw cost",
            "Convert MonoBehaviour Update loops to Burst-compiled jobs",
            "Cache all GetComponent calls made in frequently run scripts",
            "Reduce the physics fixed timestep from 0.02 to 0.04 seconds"
          ],
          "answer": 0,
          "explain": "The main thread is idle waiting for the GPU, so the game is GPU bound and CPU-side changes will not raise the frame rate. Reducing pixel and shader cost targets the actual bottleneck."
        },
        {
          "q": "With Deep Profiling enabled, a function making 50,000 tiny calls shows as 9 ms. Without Deep Profiling, its enclosing Update shows 2 ms. What is the right conclusion?",
          "options": [
            "Deep Profiling is accurate, the normal profiler hides managed time",
            "The 9 ms is real time spent in garbage collection during those calls",
            "Deep Profiling overhead inflates many-small-call code; use markers",
            "The 2 ms reading is wrong because IL2CPP is not used in the editor"
          ],
          "answer": 2,
          "explain": "Deep Profiling instruments every call, so code with many small calls is inflated far more than code with few large ones. Use it to locate a region, then measure with ProfilerMarkers and normal profiling."
        },
        {
          "q": "A game holds 60 fps for the first five minutes on a mid-range phone, then settles at about 42 fps with no change in scene content. What is the most likely cause?",
          "options": [
            "Incremental GC is disabled after the first few minutes of play",
            "Thermal throttling has reduced the device's CPU and GPU clocks",
            "The fixed timestep accumulates error and adds physics steps",
            "Texture streaming has evicted all mipmaps from video memory"
          ],
          "answer": 1,
          "explain": "A gradual drop with constant content on a fanless device is the signature of thermal throttling. Leave budget headroom, consider a 30 fps cap, and run long soak tests."
        },
        {
          "q": "A job is scheduled with `var h = job.Schedule(n, 64); h.Complete();` at the start of Update, followed by other main-thread work. The profiler shows little speedup. What is the main issue?",
          "options": [
            "The batch size of 64 is too small for a parallel job to help",
            "The job is missing the ReadOnly attribute on its output array",
            "Burst cannot compile jobs that are scheduled from Update calls",
            "Completing immediately makes the main thread wait for the job"
          ],
          "answer": 3,
          "explain": "Calling Complete right after Schedule blocks the main thread until the job finishes, so no main-thread work overlaps with it. Schedule early, do other work, and complete as late as possible."
        },
        {
          "q": "After returning from a level to the main menu, memory stays 300 MB higher than before the level. Which tool and workflow most directly finds what is keeping it alive?",
          "options": [
            "Memory Profiler snapshots before and after, then compare them",
            "Frame Debugger stepping through the menu's draw calls one by one",
            "Deep Profiling the menu scene and sorting the Hierarchy by time",
            "Profile Analyzer comparing median frame times of both scenes"
          ],
          "answer": 0,
          "explain": "Comparing Memory Profiler snapshots shows which objects remain and the reference chains that pin them. The other tools measure time or draw calls, not retained memory."
        }
      ]
    },
    {
      "id": "unity-editor-scripting",
      "title": "Editor Scripting and Tooling",
      "minutes": 13,
      "summary": "Extend the Unity Editor with inspectors, windows, importers and batch-mode entry points so content work scales and automation has a front door.",
      "lesson": [
        {
          "type": "p",
          "text": "A mid-size game has thousands of assets and dozens of designers touching them. Somebody imports 400 UI textures with mipmaps on and compression off, and the build grows by 300 MB. A level designer spends an afternoon dragging spawn points into a list by hand. A CI job needs to bake addressables and lightmaps without a human clicking buttons. All three problems have the same answer: Unity's Editor is itself a C# application you can extend, and on a real team the editor tooling is as much a product as the game."
        },
        {
          "type": "h",
          "text": "Where editor code lives"
        },
        {
          "type": "p",
          "text": "Unity compiles scripts into assemblies. Code that references the `UnityEditor` namespace cannot ship in a player build, because that namespace does not exist at runtime. There are three ways to keep it out:"
        },
        {
          "type": "list",
          "items": [
            "**Special `Editor` folders**: any script under a folder named `Editor` (at any depth) goes into the predefined `Assembly-CSharp-Editor` assembly, which is excluded from players. This is the legacy mechanism and still works when you do not use assembly definitions.",
            "**Assembly definitions (`.asmdef`)**: an asmdef whose Include Platforms list contains only `Editor` produces an editor-only assembly. Once a folder has an asmdef, the special `Editor` folder rule no longer applies inside it, so the asmdef is what decides. A common layout is `Game.Runtime.asmdef` plus `Game.Editor.asmdef` that references it.",
            "**`#if UNITY_EDITOR` blocks**: for small editor-only hooks inside runtime classes, such as an `OnValidate` that calls `AssetDatabase`. Use sparingly; every block is a place where the editor and the player diverge."
          ]
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "A common surprise: adding an asmdef to a folder means scripts in it can no longer see `Assembly-CSharp`. Runtime code that worked before may stop compiling until the referenced code also gets an asmdef, because predefined assemblies can reference asmdef assemblies but not the other way round."
        },
        {
          "type": "p",
          "text": "Asmdefs matter beyond correctness. Without them every script change recompiles all of `Assembly-CSharp`; on a large project a domain reload after a one-line change can take 10 to 30 seconds. Splitting into assemblies means only the changed assembly and its dependents recompile, and editor tooling changes stop triggering runtime recompiles."
        },
        {
          "type": "h",
          "text": "Custom inspectors and property drawers"
        },
        {
          "type": "p",
          "text": "A custom inspector replaces how one component type is drawn. You subclass `Editor`, tag it with `[CustomEditor(typeof(Spawner))]`, and override either `OnInspectorGUI` (IMGUI, immediate mode, redrawn every repaint) or `CreateInspectorGUI` (UI Toolkit, a retained visual tree built once). New tooling should generally use UI Toolkit; IMGUI remains everywhere in existing code. A property drawer is smaller in scope: it changes how one field type, or fields carrying a given `PropertyAttribute`, render in any inspector. A `[MinMaxRange]` drawer written once applies to every component that uses the attribute."
        },
        {
          "type": "p",
          "text": "The key under the hood: inspectors edit a `SerializedObject`, not the C# object directly. `SerializedProperty` walks the serialized data that Unity will write to disk. Going through it gives you undo, multi-object editing, prefab override tracking (bold labels) and correct dirtying for free. Writing `((Spawner)target).count = 5` bypasses all of that: the change may not be saved, may not be undoable, and will not register as a prefab override."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using UnityEditor;\nusing UnityEditor.UIElements;\nusing UnityEngine;\nusing UnityEngine.UIElements;\n\n[CustomEditor(typeof(Spawner))]\npublic class SpawnerEditor : Editor\n{\n    public override VisualElement CreateInspectorGUI()\n    {\n        var root = new VisualElement();\n        root.Add(new PropertyField(serializedObject.FindProperty(\"points\")));\n        var button = new Button(CollectChildren) { text = \"Collect child points\" };\n        root.Add(button);\n        return root;\n    }\n\n    void CollectChildren()\n    {\n        var spawner = (Spawner)target;\n        Undo.RecordObject(spawner, \"Collect spawn points\");\n        spawner.points.Clear();\n        foreach (Transform child in spawner.transform)\n            spawner.points.Add(child);\n        // Undo.RecordObject already marked it dirty; prefab instances also\n        // need their modifications recorded as overrides:\n        PrefabUtility.RecordPrefabInstancePropertyModifications(spawner);\n    }\n}"
        },
        {
          "type": "p",
          "text": "Note the pairing in `CollectChildren`: when you do write fields directly, call `Undo.RecordObject` before the change (it also marks the object and its scene dirty), and if the target can be a prefab instance, call `PrefabUtility.RecordPrefabInstancePropertyModifications` after it. Skipping these is the classic cause of edits that look applied and vanish on reload. `EditorUtility.SetDirty` is for assets changed without undo, not a substitute for either."
        },
        {
          "type": "h",
          "text": "Windows, menu items and ScriptableObject tools"
        },
        {
          "type": "p",
          "text": "`EditorWindow` gives you a dockable panel: subclass it, open it with `GetWindow<T>()`, and build UI in `CreateGUI`. `[MenuItem(\"Tools/Level/Validate Spawns\")]` on a static method adds a menu entry; a second method with the same path and `true` as the validate argument controls whether it is greyed out. `[ContextMenu]` adds entries to a component's gear menu."
        },
        {
          "type": "p",
          "text": "ScriptableObjects are the natural data model for tools. Instead of hard-coding import rules or level metadata in C#, make an asset type with `[CreateAssetMenu]` and let designers own the data. A texture rules asset, a list of scenes in the build, a table of enemy stats: all diff-able text assets that tools read. The rule of thumb is code defines behaviour, ScriptableObjects hold the knobs."
        },
        {
          "type": "h",
          "text": "AssetPostprocessor: enforce rules at import"
        },
        {
          "type": "p",
          "text": "`AssetPostprocessor` subclasses get callbacks during import: `OnPreprocessTexture`, `OnPreprocessModel`, `OnPostprocessModel` and the static `OnPostprocessAllAssets`. Preprocess hooks run before the importer and can change its settings through `assetImporter`; this is where you enforce that everything under `Assets/Art/UI` is a sprite without mipmaps and with a max size of 2048. Because the rule runs at import, it also runs on every machine and in CI, so no one can forget it."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "class UiTextureRules : AssetPostprocessor\n{\n    void OnPreprocessTexture()\n    {\n        if (!assetPath.StartsWith(\"Assets/Art/UI/\")) return;\n        var ti = (TextureImporter)assetImporter;\n        ti.textureType = TextureImporterType.Sprite;\n        ti.mipmapEnabled = false;\n        ti.maxTextureSize = 2048;\n    }\n}"
        },
        {
          "type": "p",
          "text": "Two numbers make the point: a 2048x2048 RGBA32 texture is 16 MB uncompressed and about 21 MB with mipmaps; the same texture as ASTC 6x6 is under 2 MB. One missed setting on a hundred textures is the difference between fitting in a mobile memory budget and crashing on a 3 GB device. Bump the postprocessor's `GetVersion()` when rules change so Unity reimports affected assets."
        },
        {
          "type": "h",
          "text": "Batch mode and -executeMethod"
        },
        {
          "type": "p",
          "text": "Every editor feature reachable from a static method is reachable from the command line. `-batchmode` runs the Editor without UI, `-quit` exits when done, `-executeMethod Namespace.Class.Method` calls a static method after the project loads, and `-logFile -` streams the log to stdout. Exit codes are how CI knows what happened: call `EditorApplication.Exit(1)` on failure rather than throwing and hoping."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Unity -batchmode -nographics -quit \\\n  -projectPath ./MyGame \\\n  -executeMethod Tools.Validation.RunAll \\\n  -logFile -"
        },
        {
          "type": "list",
          "items": [
            "Only one Editor can open a project at a time; a batch job on a project already open in the GUI fails on the lock.",
            "Startup cost is real: importing a cold `Library` folder can take tens of minutes, so CI caches `Library`.",
            "Batch methods must not open dialogs; `EditorUtility.DisplayDialog` has no one to click it."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Editor scripts are the safest interface between an AI agent and a Unity project. Ask the agent to make changes through a `MenuItem` or `-executeMethod` entry point that uses `SerializedObject` or `Undo`, not by editing `.unity` or `.prefab` text. Verify that editor code sits in an editor-only asmdef or `Editor` folder (agents often drop `using UnityEditor` into runtime scripts, which compiles in the Editor and breaks the player build), and that batch methods return non-zero exit codes on failure."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Make the first tool you build a project validator: one menu item, also callable from batch mode, that checks missing scripts, broken references and import rules. It pays for itself the first week and becomes the agent's verification step."
        }
      ],
      "keyPoints": [
        "Editor-only code must live in an editor-only assembly (asmdef or `Editor` folder) or the player build fails on `UnityEditor` references.",
        "Inspectors and drawers should edit through `SerializedObject`/`SerializedProperty` to get undo, multi-edit, prefab overrides and saving for free.",
        "`AssetPostprocessor` enforces import rules on every machine and in CI, which beats documentation every time.",
        "ScriptableObjects hold tool data as diff-able assets; code holds behaviour.",
        "Batch mode with `-executeMethod` turns any static editor method into an automation entry point; signal failure with an exit code."
      ],
      "quiz": [
        {
          "q": "A tool button sets `((Door)target).locked = true;` on a prefab instance. The inspector updates, but after reopening the scene the value is back to false and Ctrl+Z did nothing. What is the best fix?",
          "options": [
            "Modify the value via `serializedObject.FindProperty` and `ApplyModifiedProperties`",
            "Call `AssetDatabase.Refresh()` after setting the field on the target",
            "Move the button logic into `OnValidate` on the runtime Door component",
            "Mark the field `[SerializeField]` in addition to it being public"
          ],
          "answer": 0,
          "explain": "Going through `SerializedProperty` records undo, dirties the object and registers a prefab override so the change is saved. `AssetDatabase.Refresh` only rescans files on disk and does nothing for an unsaved in-memory scene edit."
        },
        {
          "q": "The project builds fine in the Editor, but the iOS build fails with `The type or namespace name 'UnityEditor' could not be found` in `Assets/Scripts/Enemy/EnemyGizmos.cs`. The scripts folder has a `Game.Runtime.asmdef`. Which change fixes it correctly?",
          "options": [
            "Add `UnityEditor` to the references of `Game.Runtime.asmdef`",
            "Move the file into an `Editor` subfolder under `Assets/Scripts/Enemy`",
            "Move the file into an asmdef whose Include Platforms is only Editor",
            "Switch the scripting backend from IL2CPP to Mono for iOS"
          ],
          "answer": 2,
          "explain": "An editor-only assembly is excluded from players, so the reference disappears from the build. Inside a folder already covered by an asmdef, the special `Editor` folder rule does not apply, so moving it into an `Editor` subfolder would still compile it into the runtime assembly."
        },
        {
          "q": "Artists keep importing UI textures with mipmaps enabled despite a wiki page. What is the most robust enforcement?",
          "options": [
            "A custom inspector for `TextureImporter` that shows a red warning label",
            "A pre-commit hook that greps the `.meta` files for `enableMipMap: 1`",
            "An `EditorWindow` that lists every texture and lets leads fix them",
            "An `AssetPostprocessor` with `OnPreprocessTexture` that sets the importer"
          ],
          "answer": 3,
          "explain": "A preprocess hook changes importer settings before import on every machine and in CI, so the rule cannot be forgotten. Warnings and windows rely on people noticing, and grepping `.meta` text catches problems late and is fragile."
        },
        {
          "q": "A CI job runs `Unity -batchmode -quit -executeMethod Build.Validate`. The method logs errors when validation fails, but the CI step is always green. What is missing?",
          "options": [
            "The `-nographics` flag so errors reach the log",
            "Calling `EditorApplication.Exit(1)` when validation fails",
            "Wrapping the method in `[MenuItem]` so it is discoverable",
            "Running with `-logFile -` so CI parses the error lines"
          ],
          "answer": 1,
          "explain": "The process exits 0 unless the method sets a non-zero exit code, and CI steps pass or fail on exit codes. Log flags only change where output goes, not the result."
        },
        {
          "q": "On a 300-script project, every change to an editor window script triggers a 25 second recompile of gameplay code. What reduces it most directly?",
          "options": [
            "Splitting runtime and editor code into separate asmdefs",
            "Wrapping every editor window in `#if UNITY_EDITOR` blocks",
            "Converting the editor window from IMGUI to UI Toolkit",
            "Moving the gameplay scripts into a `Plugins` folder"
          ],
          "answer": 0,
          "explain": "With separate assemblies only the changed assembly and its dependents recompile, and a runtime assembly does not depend on the editor one. `#if` blocks keep code out of players but still compile everything together in the Editor."
        }
      ]
    },
    {
      "id": "unity-builds-testing",
      "title": "Builds, Platforms and Testing",
      "minutes": 14,
      "summary": "How Unity turns C# into a shipping player, what IL2CPP and stripping do to your code, and how to prove it works with EditMode and PlayMode tests in CI.",
      "lesson": [
        {
          "type": "p",
          "text": "The game runs perfectly in the Editor. The Android release build crashes on launch with a `MissingMethodException` from your JSON library, and the iOS build takes 40 minutes and then fails in Xcode. None of this showed up in Play Mode, because Play Mode runs on Mono with JIT, with the full .NET class library available and every editor assembly loaded. A player build is a different program, produced by a different toolchain, and most build bugs live in that gap."
        },
        {
          "type": "h",
          "text": "The build pipeline"
        },
        {
          "type": "p",
          "text": "A player build roughly does this: compile scripts for the target platform with that platform's define symbols; collect the scenes in the build list plus everything they reference, plus everything in `Resources` folders; convert assets into platform formats (texture compression, shader variant compilation, audio encoding); serialize them into content files; process the managed assemblies (stripping, then IL2CPP conversion if selected); and finally package or hand off to a native project (Xcode for iOS, Gradle for Android). Shader variant compilation and IL2CPP are usually the slow parts."
        },
        {
          "type": "p",
          "text": "Builds can be scripted with `BuildPipeline.BuildPlayer(BuildPlayerOptions)`, which returns a `BuildReport` with the result, total size and per-file breakdown. `IPreprocessBuildWithReport` and `IPostprocessBuildWithReport` let you hook the start and end, for example to stamp a build number or fail early on validation errors. In Unity 6, Build Profiles let you save per-platform build configurations as assets, which is easier to keep in version control than editor-global settings."
        },
        {
          "type": "h",
          "text": "Mono vs IL2CPP"
        },
        {
          "type": "p",
          "text": "C# compiles to IL (intermediate language). With the **Mono** backend the player ships IL and a JIT compiles it at runtime. With **IL2CPP**, Unity converts the IL to C++ at build time and the platform's native compiler produces machine code: ahead-of-time (AOT) compilation."
        },
        {
          "type": "list",
          "items": [
            "IL2CPP is required on iOS, WebGL and consoles, where JIT is not allowed or not available. Android builds that need ARM64, which Google Play requires, must use IL2CPP.",
            "IL2CPP usually runs faster and is harder to decompile, but builds take much longer (minutes, not seconds) and incremental builds help less.",
            "AOT means no runtime code generation: `System.Reflection.Emit` does not work, and generic instantiations that only appear at runtime through reflection may have no compiled code. Unity has improved this with full generic sharing, but reflection-heavy libraries still need care.",
            "Mono is fine and faster to iterate for desktop development builds; many teams use Mono for daily desktop builds and IL2CPP for release candidates, which means release-only bugs must be tested on IL2CPP builds regularly."
          ]
        },
        {
          "type": "h",
          "text": "Managed code stripping and link.xml"
        },
        {
          "type": "p",
          "text": "Before conversion, the Unity linker removes code it cannot prove is used, starting from roots such as scenes, `MonoBehaviour` types and their called methods. The Managed Stripping Level setting goes from Disabled (Mono only) through Minimal, Low, Medium to High; IL2CPP always strips at least at Minimal. Stripping saves real size, often several megabytes, which matters on mobile and the web. The cost is that anything reached only through reflection looks unused: a JSON deserializer creating a DTO by type name, a dependency injection container, `Type.GetType(\"...\")` calls. Those types get removed and you see `MissingMethodException` or silently null fields at runtime, only in the player."
        },
        {
          "type": "code",
          "lang": "xml",
          "text": "<linker>\n  <!-- keep every type in our DTO assembly -->\n  <assembly fullname=\"Game.Network.Dto\" preserve=\"all\"/>\n  <!-- keep one type and all its members -->\n  <assembly fullname=\"Game.Runtime\">\n    <type fullname=\"Game.Save.SaveData\" preserve=\"all\"/>\n  </assembly>\n</linker>"
        },
        {
          "type": "p",
          "text": "A `link.xml` anywhere under `Assets` tells the linker what to keep. For your own code, `[Preserve]` on a type or member does the same inline. Prefer narrow preservation; `preserve=\"all\"` on every assembly gives back the size you were trying to save."
        },
        {
          "type": "h",
          "text": "Defines and platform-specific code"
        },
        {
          "type": "p",
          "text": "Unity sets platform define symbols such as `UNITY_EDITOR`, `UNITY_IOS`, `UNITY_ANDROID`, `UNITY_STANDALONE_WIN`, `UNITY_WEBGL` and `DEVELOPMENT_BUILD`. You add your own scripting define symbols in Player Settings per platform, and asmdefs can use Define Constraints (only compile this assembly if a symbol is set) and Version Defines (set a symbol when a package version is present). The trap: code inside `#if UNITY_IOS` is not compiled at all while the active target is Android, so it can rot unnoticed. Keep platform branches thin, ideally behind an interface with one small implementation per platform, and compile every target in CI."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Never wrap a serialized field in `#if UNITY_EDITOR`. The Editor writes data for a field the player does not have, and the serialized layout no longer matches; depending on the backend you get warnings, lost data or a crash on load. Keep editor-only data in editor-only assets instead."
        },
        {
          "type": "h",
          "text": "Unity Test Framework"
        },
        {
          "type": "p",
          "text": "The Unity Test Framework (`com.unity.test-framework`) is NUnit plus Unity-specific runners. Tests live in their own asmdef that references the test assemblies."
        },
        {
          "type": "list",
          "items": [
            "**EditMode tests** run in the Editor without entering Play Mode. They are fast (milliseconds each) and ideal for pure logic, editor tools, asset validation and serialization round-trips. The test asmdef targets the Editor platform.",
            "**PlayMode tests** enter Play Mode (or run in a built player) so `Awake`, `Update`, physics and coroutines run. Use `[UnityTest]` returning `IEnumerator` and `yield return null` to advance a frame. They are slower, often seconds each, because of scene loads and frame stepping.",
            "Design for testability: keep game rules in plain C# classes that EditMode tests can hit directly, and reserve PlayMode tests for integration behaviour that genuinely needs the engine loop."
          ]
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using System.Collections;\nusing NUnit.Framework;\nusing UnityEngine;\nusing UnityEngine.TestTools;\n\npublic class DamageTests\n{\n    [Test] // EditMode-friendly: pure logic\n    public void ArmorReducesDamage()\n    {\n        Assert.AreEqual(70, Damage.Apply(100, armor: 30));\n    }\n\n    [UnityTest] // PlayMode: needs frames to pass\n    public IEnumerator ProjectileMovesForward()\n    {\n        var go = new GameObject(\"p\");\n        var p = go.AddComponent<Projectile>();\n        p.speed = 10f;\n        yield return new WaitForSeconds(0.1f);\n        Assert.Greater(go.transform.position.z, 0.5f);\n        Object.Destroy(go);\n    }\n}"
        },
        {
          "type": "h",
          "text": "Running tests in CI"
        },
        {
          "type": "p",
          "text": "The Editor runs tests from the command line with `-runTests`, `-testPlatform EditMode` or `PlayMode`, and `-testResults path.xml` (NUnit XML that CI systems can display). Optional `-testFilter` and `-testCategory` narrow the run. Do not pass `-quit` together with `-runTests`: the runner exits by itself when tests finish, and `-quit` can end the process before tests run. A non-zero exit code means failures."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Unity -batchmode -projectPath . \\\n  -runTests -testPlatform EditMode \\\n  -testResults ./results/editmode.xml -logFile -"
        },
        {
          "type": "p",
          "text": "CI practicalities: a licence must be activated on the runner; cache the `Library` folder per platform to avoid full reimports; and run at least one IL2CPP build regularly, because stripping and AOT bugs never appear in EditMode or Editor PlayMode runs. PlayMode tests can also run inside a built player on device, which is the only way to catch platform-specific failures in tests."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Tests are the verification loop that makes AI agents usable in Unity. Ask the agent to put logic in plain C# with EditMode tests, run them via `-runTests` in batch mode, and read the result XML rather than claiming success. Watch for common agent mistakes: adding `-quit` to test runs, using `System.Reflection.Emit` or reflection-based serializers without `link.xml` entries, and putting code in `#if UNITY_IOS` blocks it never compiled. Ask for a player build (not just Play Mode) before accepting changes that touch serialization or reflection."
        }
      ],
      "keyPoints": [
        "Play Mode is Mono plus JIT plus editor assemblies; a player build, especially IL2CPP, is a different program and needs its own testing.",
        "IL2CPP is AOT: required on iOS, WebGL, consoles and ARM64 Android, slower to build, and incompatible with runtime code generation.",
        "Managed stripping removes reflection-only code; fix with narrow `link.xml` or `[Preserve]`, not by disabling stripping everywhere.",
        "EditMode tests for logic and tools, PlayMode tests for engine-loop integration; run both headless with `-runTests` and fail CI on exit codes.",
        "Code inside a platform `#if` is not compiled for other targets; build every platform in CI."
      ],
      "quiz": [
        {
          "q": "A save system works in the Editor and in Mono desktop builds, but in the IL2CPP Android build loading returns objects with all fields at default values. The serializer creates types by reflection. Most likely cause and fix?",
          "options": [
            "Android file permissions block reads; request storage permission at startup",
            "IL2CPP float parsing differs; switch the serializer to invariant culture",
            "Stripping removed reflection-only members; preserve the DTOs in `link.xml`",
            "The Gradle build compresses saves; disable compression in Player Settings"
          ],
          "answer": 2,
          "explain": "Reflection-only members look unused to the linker and get stripped, which shows up only in stripped player builds. Culture issues would corrupt specific values, not reset every field to default."
        },
        {
          "q": "A team wants fast iteration and ships to iOS and Android. Which backend policy is most sensible?",
          "options": [
            "Mono everywhere, because IL2CPP is only an optimization",
            "Mono for daily desktop builds, with regular IL2CPP device builds",
            "IL2CPP in the Editor too, so Play Mode matches the player",
            "Mono on iOS and IL2CPP on Android, since iOS allows JIT"
          ],
          "answer": 1,
          "explain": "IL2CPP is mandatory for iOS and ARM64 Android, so it must be exercised regularly, while Mono speeds local iteration. iOS forbids JIT, and the Editor itself always runs on Mono."
        },
        {
          "q": "A CI test step runs `Unity -batchmode -quit -runTests -testPlatform EditMode -testResults r.xml`. The job finishes in 40 seconds with no results file. What is the likely problem?",
          "options": [
            "EditMode tests require `-testPlatform PlayMode` in batch mode",
            "`-testResults` must be an absolute path inside the Library folder",
            "The tests need `-nographics` or the runner refuses to start",
            "`-quit` makes the Editor exit before the test runner executes"
          ],
          "answer": 3,
          "explain": "The test runner exits on its own when finished; adding `-quit` can terminate the Editor before tests run, so no results are written. The other flags are not required for EditMode runs."
        },
        {
          "q": "You need to test that a `ScoreCalculator` combo multiplier is correct across 50 input cases. Which approach is best?",
          "options": [
            "EditMode `[Test]` cases calling plain C# logic directly",
            "PlayMode `[UnityTest]` that loads the level and plays it",
            "A manual QA checklist run before each release build",
            "A PlayMode test that waits one frame per case with `yield`"
          ],
          "answer": 0,
          "explain": "Pure logic needs no engine loop, so EditMode tests are fast, deterministic and cheap to run in CI. PlayMode tests add scene loads and frame waits that only slow it down and add flakiness."
        },
        {
          "q": "An agent adds an in-app review prompt inside `#if UNITY_IOS`. Android CI is green; the first iOS build fails to compile in that block. Which practice would have caught it earliest?",
          "options": [
            "Raising the Managed Stripping Level to High on all targets",
            "Adding `[Preserve]` to the class that holds the iOS code",
            "Compiling or building every target platform in CI on each change",
            "Running the PlayMode tests in the Editor with Android selected"
          ],
          "answer": 2,
          "explain": "Code inside a platform define is not compiled at all for other targets, so only compiling for iOS reveals the error. Stripping and `[Preserve]` affect what is kept after compilation, not whether the code compiles."
        }
      ]
    },
    {
      "id": "unity-vcs-and-agents",
      "title": "Unity Projects, Version Control and AI Agents",
      "minutes": 14,
      "summary": "How a Unity project is stored on disk, why .meta files and GUIDs are sacred, how to merge scenes and prefabs, and how to let AI agents change a project without corrupting it.",
      "lesson": [
        {
          "type": "p",
          "text": "Two engineers branch from main. One renames `PlayerController.cs` in their IDE; the other adds a component to the player prefab. After merging, every scene shows `The referenced script (Unknown) on this Behaviour is missing!` and the prefab is half broken. Nothing in the diff looked dangerous. To work safely in a Unity repo, by hand or with an AI agent, you need to know how Unity stores references, because it is not by file path."
        },
        {
          "type": "h",
          "text": "Project layout"
        },
        {
          "type": "list",
          "items": [
            "**Commit**: `Assets/` (all content and code, plus every `.meta` file), `Packages/manifest.json` and `Packages/packages-lock.json`, and `ProjectSettings/`.",
            "**Ignore**: `Library/` (the import cache, often many gigabytes and fully regenerable), `Temp/`, `Obj/`, `Logs/`, `UserSettings/` (per-user editor state) and IDE-generated `.csproj`/`.sln` files.",
            "Embedded packages under `Packages/<name>/` are committed; registry packages are restored from the manifest and lock file."
          ]
        },
        {
          "type": "h",
          "text": ".meta files and GUIDs"
        },
        {
          "type": "p",
          "text": "Every file and folder under `Assets` has a sibling `.meta` file. It holds the asset's import settings and, most importantly, a 128-bit GUID written as 32 hex characters. Every reference in Unity's serialized data points at that GUID, never at a path. A material references its shader by GUID; a scene references a prefab by GUID; a `MonoBehaviour` references its script by the GUID of the script's `.meta`. Within a file, objects are addressed by a local `fileID`, so a full reference is the pair `{fileID, guid}`."
        },
        {
          "type": "code",
          "lang": "yaml",
          "text": "--- !u!114 &1840229117\nMonoBehaviour:\n  m_GameObject: {fileID: 1840229115}\n  m_Enabled: 1\n  m_Script: {fileID: 11500000, guid: 3f2a9c1e5b7d4e0f8a6c2b1d9e8f7a6b, type: 3}\n  speed: 6.5\n  weapon: {fileID: 11400000, guid: 9c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d, type: 2}"
        },
        {
          "type": "p",
          "text": "This explains the opening incident. Renaming the `.cs` file outside Unity without renaming its `.meta` makes Unity treat the old meta as orphaned and the renamed file as new: it deletes the old meta and generates a new GUID, and every `m_Script` pointing at the old GUID is now missing. Renaming inside the Editor, or moving the `.meta` together with the file, keeps the GUID. The same applies to deleting and recreating an asset, or committing an asset without its `.meta`: a teammate's Editor generates a different GUID and references break on their machine but not yours. Duplicated GUIDs, from copying a folder with its metas outside Unity, cause Unity to reassign one of them, again breaking references."
        },
        {
          "type": "h",
          "text": "Force Text serialization and YAML"
        },
        {
          "type": "p",
          "text": "In Project Settings, Editor, set Asset Serialization Mode to Force Text and keep Version Control Mode at Visible Meta Files (the default in modern versions). Scenes, prefabs, materials, ScriptableObjects and animation controllers are then written as a Unity-flavoured YAML. Each object starts with `--- !u!<classID> &<fileID>`: class 1 is `GameObject`, 4 is `Transform`, 114 is `MonoBehaviour`. Text makes diffs reviewable and merges possible, but it is not hand-editing friendly: fileIDs must be unique and consistent across cross-references, a prefab instance stores only overrides in `m_Modifications` against the source prefab's fileIDs, and stripped placeholder objects stand in for prefab internals."
        },
        {
          "type": "h",
          "text": "Merging scenes and prefabs"
        },
        {
          "type": "p",
          "text": "A line-based text merge of two scene edits often produces syntactically valid YAML that is semantically broken: duplicated fileIDs, a child listed in one `Transform` but pointing at a different parent, a component orphaned from its GameObject. Unity ships a semantic merge tool, **UnityYAMLMerge** (Smart Merge), in the Editor's `Data/Tools` folder. It parses both sides as objects and merges by fileID and property. Wire it into Git as a merge driver:"
        },
        {
          "type": "code",
          "lang": "text",
          "text": "# .gitattributes\n*.unity  merge=unityyamlmerge eol=lf\n*.prefab merge=unityyamlmerge eol=lf\n*.asset  merge=unityyamlmerge eol=lf\n\n# .gitconfig (per machine, path differs by OS and Editor version)\n[merge \"unityyamlmerge\"]\n  name = Unity SmartMerge\n  driver = '/path/to/Editor/Data/Tools/UnityYAMLMerge' merge -p %O %B %A %A"
        },
        {
          "type": "p",
          "text": "Smart Merge resolves most non-overlapping edits. True conflicts (both sides moved the same object) still need a human. The bigger lever is structure: split big scenes into additive sub-scenes and nest prefabs so two people rarely touch the same file. A 5,000-object scene edited by six designers will conflict daily no matter which tool you use."
        },
        {
          "type": "h",
          "text": "Git LFS vs Unity Version Control"
        },
        {
          "type": "p",
          "text": "Binary assets (PSD, FBX, WAV, textures) cannot be merged and bloat Git history, since every revision of a 200 MB PSD stays in every clone. **Git LFS** stores those in a separate server and keeps pointers in Git; track them by extension in `.gitattributes` and use `git lfs lock` for files that must not be edited concurrently. **Unity Version Control** (formerly Plastic SCM) is centralized-friendly, handles large binaries natively, supports exclusive checkouts for artists and has a simplified client for non-engineers. Rough rule: code-heavy teams already on Git do fine with Git plus LFS plus locking discipline; art-heavy teams with many non-technical contributors often prefer Unity Version Control or Perforce."
        },
        {
          "type": "h",
          "text": "What AI agents get wrong"
        },
        {
          "type": "list",
          "items": [
            "**Hand-editing scene and prefab YAML**: inventing fileIDs, copying blocks with duplicate IDs, or adding a component without wiring `m_Component` on the GameObject. It may load with silent errors or not at all.",
            "**Creating assets without `.meta` files**, or writing `.meta` files with made-up GUIDs that collide or do not match what other references expect.",
            "**Renaming or moving files with shell commands** and leaving the `.meta` behind, which breaks every reference to the asset.",
            "**Assuming file paths are references**: searching for a prefab by path in scene YAML finds nothing, because the scene holds a GUID.",
            "**Declaring success without opening the project**: the agent never saw the console, so compile errors, missing scripts and import errors go unnoticed."
          ]
        },
        {
          "type": "h",
          "text": "Safer approaches"
        },
        {
          "type": "p",
          "text": "Treat serialized assets as an output of the Editor, not as source files the agent writes. The agent writes C#, and C# changes the assets through Unity's APIs: `AssetDatabase.CreateAsset`, `PrefabUtility.SaveAsPrefabAsset`, `AssetDatabase.MoveAsset` (which keeps the GUID), `SerializedObject` edits and `EditorSceneManager.SaveScene`. Three ways to run that code:"
        },
        {
          "type": "list",
          "items": [
            "**Editor scripts with a batch entry point**: a static method run with `-executeMethod` in batch mode. Reproducible, reviewable and works in CI, but each run pays Editor startup.",
            "**Running C# in a live Editor** through an MCP server or the Unity CLI connected to the open Editor. The agent can query the hierarchy, read the console, create GameObjects and run snippets without restarts, which gives a tight inspect-change-verify loop.",
            "**Tests and validators as verification**: after changes, run EditMode tests and a project validator (missing scripts, broken references, compile errors) and read the results. The agent's claim of success counts only when these pass."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Give the agent explicit rules in its project instructions: never hand-edit `.unity`, `.prefab` or `.asset` YAML; never create, delete or rename a `.meta` file directly; move and rename assets through `AssetDatabase` or the connected Editor; after every change, check the Editor console and run the tests. When reviewing an agent's diff, look for new assets without `.meta` files, `.meta` files with changed GUIDs, and large YAML diffs in scenes the task did not mention; any of these is a reason to reject and redo the change through the Editor."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Run `git status` after any agent session and check that every added or renamed asset has a matching `.meta` change. A short CI check that fails on an asset without a `.meta`, or a `.meta` without an asset, catches most reference breakage before it merges."
        }
      ],
      "keyPoints": [
        "Unity references assets by GUID stored in `.meta` files, not by path; losing or regenerating a `.meta` breaks every reference.",
        "Commit `Assets` with metas, `Packages` manifest and lock file and `ProjectSettings`; ignore `Library`, `Temp`, `Logs` and `UserSettings`.",
        "Use Force Text serialization and UnityYAMLMerge for scenes and prefabs; reduce conflicts structurally with additive scenes and nested prefabs.",
        "Large binaries go in Git LFS with locking, or in Unity Version Control or Perforce for art-heavy teams.",
        "Agents should change assets through Editor APIs (batch scripts or a live Editor via MCP/CLI) and verify with console checks and tests, never by writing YAML."
      ],
      "quiz": [
        {
          "q": "After a merge, a prefab shows a missing script where `EnemyAI` used to be. The branch renamed `EnemyAI.cs` to `EnemyBrain.cs` with `git mv`, and the diff shows `EnemyAI.cs.meta` deleted and a new `EnemyBrain.cs.meta` added. What happened?",
          "options": [
            "The class name no longer matches the file name, so Unity skipped it",
            "The new meta has a new GUID, so `m_Script` points at nothing",
            "Smart Merge dropped the component because both sides edited it",
            "The prefab cached the old path and needs a Library reimport"
          ],
          "answer": 1,
          "explain": "References use the script's GUID from its `.meta`; deleting the old meta and generating a new one orphans every reference. The fix is to keep the original meta when renaming. A class/file name mismatch causes a different warning and does not explain a deleted meta."
        },
        {
          "q": "Which set of folders should be committed in a typical Unity Git repository?",
          "options": [
            "`Assets`, `Library`, `ProjectSettings` and `Packages`",
            "`Assets`, `Packages`, `ProjectSettings` and `UserSettings`",
            "`Assets` without metas, `Packages` and `ProjectSettings`",
            "`Assets` with metas, `Packages` and `ProjectSettings`"
          ],
          "answer": 3,
          "explain": "Metas carry GUIDs and import settings, so they must be committed with the assets. `Library` is a regenerable cache and `UserSettings` is per-user state; both belong in `.gitignore`."
        },
        {
          "q": "Two designers edited different objects in the same scene. Git's default text merge succeeded without conflicts, but the scene now loads with errors about duplicate fileIDs. What prevents this best?",
          "options": [
            "Configure UnityYAMLMerge as the merge driver for `.unity` files",
            "Switch Asset Serialization Mode from Force Text to Mixed",
            "Store scenes in Git LFS so they are merged as binary files",
            "Add `eol=crlf` for scenes in `.gitattributes` on all machines"
          ],
          "answer": 0,
          "explain": "A line-based merge can produce valid YAML that is semantically broken; Smart Merge merges by object and property. Binary or mixed serialization prevents merging entirely instead of fixing it, and line endings are unrelated."
        },
        {
          "q": "An agent must add a `Health` component to 120 enemy prefabs. Which approach is safest?",
          "options": [
            "Have the agent append a MonoBehaviour block to each `.prefab` YAML file",
            "Copy one edited prefab's YAML block into the other 119 with a script",
            "Run an editor script that loads each prefab and adds it via `PrefabUtility`",
            "Rename the prefabs to `.yaml`, edit them, then rename them back"
          ],
          "answer": 2,
          "explain": "Editor APIs allocate valid fileIDs, wire `m_Component` lists and save correctly. Hand-written or copied YAML risks duplicate or dangling fileIDs and missing script GUIDs."
        },
        {
          "q": "An art-heavy studio with 30 non-technical artists keeps losing work when two people edit the same PSD. What is the most direct fix?",
          "options": [
            "Switch the PSDs to Force Text serialization so they merge",
            "Use exclusive file locking via LFS locks or Unity Version Control",
            "Add the PSD files to `.gitignore` and share them on a drive",
            "Configure UnityYAMLMerge as the merge driver for `*.psd`"
          ],
          "answer": 1,
          "explain": "Binary files cannot be merged, so the fix is to stop concurrent edits with locking. Force Text and UnityYAMLMerge only apply to Unity's own serialized assets, not PSDs."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "Your game drops to 40 fps on device. The Timeline view shows the main thread busy for 23 ms, most of it in `Animator.Update` across 250 skinned NPCs, most of them off-screen. What helps most?",
      "options": [
        "Lower the render resolution so the GPU finishes sooner",
        "Enable Rigidbody interpolation on every NPC body",
        "Set the NPC Animators to cull work when off-screen",
        "Move Animator parameter writes into FixedUpdate"
      ],
      "answer": 2,
      "explain": "The main thread is busy animating characters nobody can see; a culling mode such as Cull Update Transforms or Cull Completely removes that work. Resolution only helps a GPU-bound frame, and interpolation adds work rather than removing it."
    },
    {
      "q": "A designer reports that after you renamed the serialized field `hp` to `maxHealth`, every enemy prefab lost its tuned health value. What would have preserved the data?",
      "options": [
        "Adding `[FormerlySerializedAs(\"hp\")]` to the new field",
        "Adding `[SerializeReference]` to the renamed field",
        "Turning the field into a `[field: SerializeField]` property",
        "Reimporting all prefabs right after the rename"
      ],
      "answer": 0,
      "explain": "The serializer matches saved data by field name, and `FormerlySerializedAs` tells it to read the old name. The other options neither map the old key nor recover lost values."
    },
    {
      "q": "QA reports a crash on 3 GB phones after several boss-fight-to-hub loops. Memory Profiler snapshots show boss textures still resident in the hub, reached through a static `List<Boss>` in a stats tracker. What is the fix?",
      "options": [
        "Call `GC.Collect()` every frame while in the hub",
        "Clear the static list when the fight ends",
        "Enable Read/Write on the boss textures",
        "Load the hub additively over the boss scene"
      ],
      "answer": 1,
      "explain": "The static list keeps the destroyed bosses' wrappers reachable, and through them their assets, so nothing can be unloaded. Removing the reference lets the next unload free them; forcing collections cannot free objects that are still referenced."
    },
    {
      "q": "Which of these can a Burst-compiled `IJobParallelFor` legally do inside `Execute`?",
      "options": [
        "Allocate a new managed `List<int>` per item",
        "Read serialized fields from a MonoBehaviour",
        "Format a debug string for each processed item",
        "Do float3 math on NativeArray elements"
      ],
      "answer": 3,
      "explain": "Burst compiles a subset of C# without managed objects, so blittable structs, Unity.Mathematics types and native containers are fine. Managed lists, MonoBehaviour references and string formatting all require managed memory."
    },
    {
      "q": "You enable the GPU Resident Drawer in a URP project, but CPU rendering time and the Frame Debugger output do not change at all. What should you check first?",
      "options": [
        "That every renderer sets a MaterialPropertyBlock",
        "That the renderer uses the Forward+ rendering path",
        "That dynamic batching is enabled on the URP asset",
        "That every light in the scene is set to Realtime"
      ],
      "answer": 1,
      "explain": "In URP the GPU Resident Drawer only takes effect with Forward+ (or Deferred+ where available) and with BatchRendererGroup variants kept. Property blocks and dynamic batching are unrelated or counterproductive."
    },
    {
      "q": "A designer reports that the shop takes 400 ms to open the first time and memory jumps by 64 MB, although the screen shows only 12 icons. All item icons in the game share one Sprite Atlas. What is the best fix?",
      "options": [
        "Enable Read/Write on the atlas so it loads faster",
        "Move all the icons into a Resources folder instead",
        "Split atlases by the screens that use the sprites",
        "Generate mipmaps on the atlas to reduce memory"
      ],
      "answer": 2,
      "explain": "Using any sprite loads its whole atlas, so one atlas of every icon drags all of them into memory. Atlasing by usage loads only what the screen needs; Read/Write and mipmaps add memory, and Resources does not solve granularity."
    },
    {
      "q": "Which technique cannot work in an IL2CPP player, regardless of link.xml or stripping settings?",
      "options": [
        "Emitting new types at runtime with `Reflection.Emit`",
        "Reading custom attributes on types via reflection",
        "Storing a custom struct type in a `List<T>` field",
        "Calling interface methods implemented by structs"
      ],
      "answer": 0,
      "explain": "IL2CPP compiles ahead of time, so there is no JIT to run code generated at runtime. Reflection over existing metadata, generic collections of structs and interface calls all work when the code is preserved."
    },
    {
      "q": "A tester reports that pressing Space on the pause menu's Resume button also makes the character jump as play resumes. The project uses the Input System. What is the correct fix?",
      "options": [
        "Read the jump action in LateUpdate instead of Update",
        "Set Active Input Handling to Both in Player Settings",
        "Add a GraphicRaycaster to the gameplay HUD Canvas",
        "Enable only the action map that fits the context"
      ],
      "answer": 3,
      "explain": "Both the UI and Gameplay maps are listening to Space at once. Enabling the UI map while paused and the Gameplay map while playing removes the double handling; timing or input-backend changes do not."
    },
    {
      "q": "In Prefab Mode for `Car`, which contains a nested `Wheel` prefab instance, you change the wheel's radius and save. Where is that change stored?",
      "options": [
        "In the Wheel asset, affecting every car that uses it",
        "In the Car asset, as an override on its nested Wheel",
        "In each scene that places Car, as a scene override",
        "In the scene, because Prefab Mode edits instances"
      ],
      "answer": 1,
      "explain": "Editing a nested instance inside a prefab records an override on that instance within the outer prefab. To change every wheel, you would apply the override to the Wheel asset or open Wheel itself in Prefab Mode."
    },
    {
      "q": "A UI Toolkit HUD calls `root.Q<Label>(\"ammo\")` inside Update to set the ammo text, and the query shows up in the CPU profiler. What is the most direct fix?",
      "options": [
        "Query the label once in OnEnable and cache it",
        "Move the query and text update into LateUpdate",
        "Replace the USS class with inline C# style writes",
        "Rename the label so its query matches a USS class"
      ],
      "answer": 0,
      "explain": "Q walks the visual tree every call; caching the reference makes the per-frame cost a simple text assignment. Moving the call or changing styles leaves the repeated tree search in place."
    },
    {
      "q": "You need a method that waits for a server response, returns the parsed score to its caller, and stops cleanly if the object is destroyed. Which fits best?",
      "options": [
        "A coroutine that writes the score to a static field",
        "An `async void` method started from Update each frame",
        "An `async Awaitable<int>` using destroyCancellationToken",
        "A FixedUpdate loop that polls the request every step"
      ],
      "answer": 2,
      "explain": "Awaitable methods can return values, compose with other async calls and honour cancellation tokens. Coroutines cannot return values, and `async void` hides exceptions and is started repeatedly here."
    },
    {
      "q": "After adding a Shader Graph with five Boolean keywords set to Multi Compile, builds take 40 minutes longer and grow by 200 MB. Materials only set these toggles at edit time. What helps most?",
      "options": [
        "Enable the SRP Batcher in the URP asset",
        "Mark materials that use it as Batching Static",
        "Raise texture compression to ASTC 4x4 blocks",
        "Change those keywords to Shader Feature"
      ],
      "answer": 3,
      "explain": "Multi Compile builds every combination, while Shader Feature keeps only combinations used by materials in the build. Batching and texture formats do not change how many shader variants are compiled."
    },
    {
      "q": "Which per-frame code is allocation-free in steady state?",
      "options": [
        "A for loop over a `List<Enemy>` comparing sqrMagnitude",
        "A LINQ `OrderBy` over the enemy list to find the nearest",
        "A lambda capturing `this` passed to `List.Sort` each frame",
        "`Physics.RaycastAll` to collect every hit along a ray"
      ],
      "answer": 0,
      "explain": "Indexing a List and comparing floats allocates nothing. LINQ allocates iterators and delegates, capturing lambdas allocate closures, and RaycastAll returns a new array each call."
    },
    {
      "q": "A CI build job takes 35 minutes, of which 30 are spent importing assets on a fresh runner each time. What helps most?",
      "options": [
        "Commit the Library folder to the Git repository",
        "Cache the Library folder per platform between runs",
        "Pass `-nographics` so the asset import is skipped",
        "Switch the scripting backend from IL2CPP to Mono"
      ],
      "answer": 1,
      "explain": "The import cache in Library is regenerable but expensive to rebuild, so CI caches it per target platform. Committing it bloats the repository, `-nographics` does not skip imports, and the backend affects compilation, not import."
    },
    {
      "q": "A moving platform has a BoxCollider and is driven by a script along a path. Players riding it should be pushed correctly. Which setup is right?",
      "options": [
        "Keep it static and set transform.position in Update",
        "Add a dynamic Rigidbody and set transform.position",
        "Make the collider a trigger and move it in LateUpdate",
        "Add a kinematic Rigidbody and use MovePosition"
      ],
      "answer": 3,
      "explain": "Moving colliders should carry a kinematic Rigidbody moved with MovePosition in FixedUpdate, which pushes dynamic bodies and interpolates correctly. Moving a static collider or teleporting a dynamic body fights the physics engine."
    },
    {
      "q": "Your game drops to 40 fps when the inventory opens, and the profiler shows `Canvas.SendWillRenderCanvases` at 6 ms. The ScrollRect holds 500 instantiated rows, each with a Horizontal Layout Group and Content Size Fitter. What is the best fix?",
      "options": [
        "Turn off Raycast Target on each row's background",
        "Disable mipmaps on the item icon textures",
        "Recycle a small pool of rows without layout groups",
        "Switch the inventory Canvas to World Space"
      ],
      "answer": 2,
      "explain": "SendWillRenderCanvases is the layout and graphic rebuild, driven here by hundreds of nested layout components. Pooling only the visible rows and positioning them directly removes most of that work; raycast targets, mipmaps and render mode do not."
    }
  ]
});
