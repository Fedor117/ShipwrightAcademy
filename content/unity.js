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
          "type": "figure",
          "id": "unity-gameobject-components",
          "caption": "A GameObject is a list of Components, each a C# wrapper over a native object: disabling one component stops only that component, SetActive(false) stops them all.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 384\" role=\"img\" aria-label=\"A Door GameObject holding Transform, MeshFilter, MeshRenderer, BoxCollider, Animator and a Door script, each a C# wrapper over a native C++ object; disabling one component stops only it, SetActive(false) stops the whole object.\"> <style>.unity-gameobject-components-t{font-size:14px;fill:var(--fig-ink)}.unity-gameobject-components-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-gameobject-components-s{font-size:13px;fill:var(--fig-muted)}.unity-gameobject-components-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-gameobject-components-row{animation:unity-gameobject-components-row 7.5s infinite}.unity-gameobject-components-card{animation:unity-gameobject-components-card 7.5s infinite}.unity-gameobject-components-sta{animation:unity-gameobject-components-sa 7.5s infinite}.unity-gameobject-components-stb{animation:unity-gameobject-components-sb 7.5s infinite}.unity-gameobject-components-stc{animation:unity-gameobject-components-sc 7.5s infinite}@keyframes unity-gameobject-components-row{0%{opacity:1}34%{opacity:1}38%{opacity:.3}96%{opacity:.3}100%{opacity:1}}@keyframes unity-gameobject-components-card{0%{opacity:1}64%{opacity:1}68%{opacity:.35}96%{opacity:.35}100%{opacity:1}}@keyframes unity-gameobject-components-sa{0%{opacity:1}32%{opacity:1}33.5%{opacity:0}97.5%{opacity:0}99%{opacity:1}100%{opacity:1}}@keyframes unity-gameobject-components-sb{0%{opacity:0}34.5%{opacity:0}36%{opacity:1}63%{opacity:1}64.5%{opacity:0}100%{opacity:0}}@keyframes unity-gameobject-components-sc{0%{opacity:0}65.5%{opacity:0}67%{opacity:1}96%{opacity:1}97.5%{opacity:0}100%{opacity:0}}</style> <defs><marker id=\"unity-gameobject-components-arr\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" fill=\"var(--fig-muted)\"/></marker></defs><g class=\"unity-gameobject-components-card\"><rect x=\"24\" y=\"20\" width=\"300\" height=\"318\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"44\" y=\"48\" class=\"unity-gameobject-components-b\" font-size=\"15\">Door</text><text x=\"44\" y=\"70\" class=\"unity-gameobject-components-s\">GameObject: name, tag, layer, active</text><rect x=\"40\" y=\"88\" width=\"268\" height=\"32\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"56\" y=\"109\" class=\"unity-gameobject-components-t\">Transform</text><rect x=\"40\" y=\"128\" width=\"268\" height=\"32\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"56\" y=\"149\" class=\"unity-gameobject-components-t\">MeshFilter</text><rect x=\"40\" y=\"168\" width=\"268\" height=\"32\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"56\" y=\"189\" class=\"unity-gameobject-components-t\">MeshRenderer</text><rect x=\"40\" y=\"208\" width=\"268\" height=\"32\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"56\" y=\"229\" class=\"unity-gameobject-components-t\">BoxCollider</text><g class=\"unity-gameobject-components-row\"><rect x=\"40\" y=\"248\" width=\"268\" height=\"32\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"56\" y=\"269\" class=\"unity-gameobject-components-t\">Animator</text></g><rect x=\"40\" y=\"288\" width=\"268\" height=\"32\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text x=\"56\" y=\"309\" class=\"unity-gameobject-components-t\">Door (MonoBehaviour)</text></g><text x=\"364\" y=\"70\" class=\"unity-gameobject-components-s\" text-anchor=\"middle\">wraps</text><text x=\"420\" y=\"70\" class=\"unity-gameobject-components-s\">native engine objects</text><line x1=\"308\" y1=\"104\" x2=\"412\" y2=\"104\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-gameobject-components-arr)\"/><circle cx=\"308\" cy=\"104\" r=\"3\" fill=\"var(--fig-muted)\"/><line x1=\"308\" y1=\"144\" x2=\"412\" y2=\"144\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-gameobject-components-arr)\"/><circle cx=\"308\" cy=\"144\" r=\"3\" fill=\"var(--fig-muted)\"/><line x1=\"308\" y1=\"184\" x2=\"412\" y2=\"184\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-gameobject-components-arr)\"/><circle cx=\"308\" cy=\"184\" r=\"3\" fill=\"var(--fig-muted)\"/><line x1=\"308\" y1=\"224\" x2=\"412\" y2=\"224\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-gameobject-components-arr)\"/><circle cx=\"308\" cy=\"224\" r=\"3\" fill=\"var(--fig-muted)\"/><line x1=\"308\" y1=\"264\" x2=\"412\" y2=\"264\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-gameobject-components-arr)\"/><circle cx=\"308\" cy=\"264\" r=\"3\" fill=\"var(--fig-muted)\"/><line x1=\"308\" y1=\"304\" x2=\"412\" y2=\"304\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-gameobject-components-arr)\"/><circle cx=\"308\" cy=\"304\" r=\"3\" fill=\"var(--fig-muted)\"/><rect x=\"420\" y=\"88\" width=\"196\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.35\" stroke-width=\"1.5\"/><text x=\"436\" y=\"109\" class=\"unity-gameobject-components-s\">C++ Transform</text><rect x=\"420\" y=\"128\" width=\"196\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.35\" stroke-width=\"1.5\"/><text x=\"436\" y=\"149\" class=\"unity-gameobject-components-s\">C++ MeshFilter</text><rect x=\"420\" y=\"168\" width=\"196\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.35\" stroke-width=\"1.5\"/><text x=\"436\" y=\"189\" class=\"unity-gameobject-components-s\">C++ MeshRenderer</text><rect x=\"420\" y=\"208\" width=\"196\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.35\" stroke-width=\"1.5\"/><text x=\"436\" y=\"229\" class=\"unity-gameobject-components-s\">C++ BoxCollider</text><rect x=\"420\" y=\"248\" width=\"196\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.35\" stroke-width=\"1.5\"/><text x=\"436\" y=\"269\" class=\"unity-gameobject-components-s\">C++ Animator</text><rect x=\"420\" y=\"288\" width=\"196\" height=\"32\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.35\" stroke-width=\"1.5\"/><text x=\"436\" y=\"309\" class=\"unity-gameobject-components-s\">C++ MonoBehaviour</text><text x=\"320\" y=\"368\" class=\"unity-gameobject-components-t unity-gameobject-components-sta\" text-anchor=\"middle\" opacity=\"1\">All components enabled: each one receives Update</text><text x=\"320\" y=\"368\" class=\"unity-gameobject-components-t unity-gameobject-components-stb\" text-anchor=\"middle\" opacity=\"0\">animator.enabled = false: only the Animator stops</text><text x=\"320\" y=\"368\" class=\"unity-gameobject-components-t unity-gameobject-components-stc\" text-anchor=\"middle\" opacity=\"0\">gameObject.SetActive(false): the whole object stops</text> </svg>"
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
          "type": "figure",
          "id": "unity-transform-dirty",
          "caption": "Every Transform write dirties the whole subtree below it, so two writes cost two propagations and SetPositionAndRotation costs one.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"Writing transform.position then transform.rotation on a parent marks its whole subtree dirty twice; SetPositionAndRotation marks it dirty once.\"> <style>.unity-transform-dirty-t{font-size:14px;fill:var(--fig-ink)}.unity-transform-dirty-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-transform-dirty-s{font-size:13px;fill:var(--fig-muted)}.unity-transform-dirty-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-transform-dirty-two{animation:unity-transform-dirty-two 6s infinite}.unity-transform-dirty-one{animation:unity-transform-dirty-one 6s infinite}.unity-transform-dirty-l1{animation-delay:.25s}.unity-transform-dirty-l2{animation-delay:.5s}@keyframes unity-transform-dirty-two{0%{opacity:0}4%{opacity:1}20%{opacity:1}27%{opacity:0}44%{opacity:0}48%{opacity:1}64%{opacity:1}71%{opacity:0}100%{opacity:0}}@keyframes unity-transform-dirty-one{0%{opacity:0}4%{opacity:1}20%{opacity:1}27%{opacity:0}100%{opacity:0}}</style> <rect x=\"16\" y=\"16\" width=\"296\" height=\"270\" rx=\"12\" fill=\"var(--fig-panel)\" fill-opacity=\"0.5\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"164\" y=\"46\" class=\"unity-transform-dirty-m\" text-anchor=\"middle\">position = p; rotation = r;</text><line x1=\"164\" y1=\"105\" x2=\"68\" y2=\"145\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"164\" y1=\"105\" x2=\"164\" y2=\"145\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"164\" y1=\"105\" x2=\"260\" y2=\"145\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"68\" y1=\"175\" x2=\"68\" y2=\"215\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"260\" y1=\"175\" x2=\"260\" y2=\"215\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect x=\"116\" y=\"75\" width=\"96\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"116\" y=\"75\" width=\"96\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-two unity-transform-dirty-l0\"/><text x=\"164\" y=\"95\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Car</text><rect x=\"28\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"28\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-two unity-transform-dirty-l1\"/><text x=\"68\" y=\"165\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Body</text><rect x=\"124\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"124\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-two unity-transform-dirty-l1\"/><text x=\"164\" y=\"165\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Wheels</text><rect x=\"220\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"220\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-two unity-transform-dirty-l1\"/><text x=\"260\" y=\"165\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Driver</text><rect x=\"28\" y=\"215\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"28\" y=\"215\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-two unity-transform-dirty-l2\"/><text x=\"68\" y=\"235\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Door</text><rect x=\"220\" y=\"215\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"220\" y=\"215\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-two unity-transform-dirty-l2\"/><text x=\"260\" y=\"235\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Head</text><text x=\"164\" y=\"270\" class=\"unity-transform-dirty-b\" text-anchor=\"middle\" fill=\"var(--fig-warn)\" style=\"fill:var(--fig-warn)\">2 dirty propagations</text><rect x=\"328\" y=\"16\" width=\"296\" height=\"270\" rx=\"12\" fill=\"var(--fig-panel)\" fill-opacity=\"0.5\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"476\" y=\"46\" class=\"unity-transform-dirty-m\" text-anchor=\"middle\">SetPositionAndRotation(p, r)</text><line x1=\"476\" y1=\"105\" x2=\"380\" y2=\"145\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"476\" y1=\"105\" x2=\"476\" y2=\"145\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"476\" y1=\"105\" x2=\"572\" y2=\"145\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"380\" y1=\"175\" x2=\"380\" y2=\"215\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"572\" y1=\"175\" x2=\"572\" y2=\"215\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect x=\"428\" y=\"75\" width=\"96\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"428\" y=\"75\" width=\"96\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-one unity-transform-dirty-l0\"/><text x=\"476\" y=\"95\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Car</text><rect x=\"340\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"340\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-one unity-transform-dirty-l1\"/><text x=\"380\" y=\"165\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Body</text><rect x=\"436\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"436\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-one unity-transform-dirty-l1\"/><text x=\"476\" y=\"165\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Wheels</text><rect x=\"532\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"532\" y=\"145\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-one unity-transform-dirty-l1\"/><text x=\"572\" y=\"165\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Driver</text><rect x=\"340\" y=\"215\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"340\" y=\"215\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-one unity-transform-dirty-l2\"/><text x=\"380\" y=\"235\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Door</text><rect x=\"532\" y=\"215\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><rect x=\"532\" y=\"215\" width=\"80\" height=\"30\" rx=\"8\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-transform-dirty-one unity-transform-dirty-l2\"/><text x=\"572\" y=\"235\" class=\"unity-transform-dirty-t\" text-anchor=\"middle\">Head</text><text x=\"476\" y=\"270\" class=\"unity-transform-dirty-b\" text-anchor=\"middle\" fill=\"var(--fig-ok)\" style=\"fill:var(--fig-ok)\">1 propagation</text><rect x=\"214\" y=\"304\" width=\"16\" height=\"16\" rx=\"4\" fill=\"var(--fig-warn)\" fill-opacity=\"0.35\" stroke=\"var(--fig-warn)\" stroke-width=\"1.5\"/><text x=\"238\" y=\"317\" class=\"unity-transform-dirty-s\">marked dirty: world matrix must be recomputed</text> </svg>"
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
          "type": "figure",
          "id": "unity-prefab-override",
          "caption": "The fix to the prefab asset reaches every instance except Track 12, whose overridden m_Size wins.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 364\" role=\"img\" aria-label=\"An engineer changes m_Size on the MechanicNPC prefab asset from 1.0 to 1.4; the change flows to every scene instance except Track 12, whose overridden 1.0 wins.\"> <style>.unity-prefab-override-t{font-size:14px;fill:var(--fig-ink)}.unity-prefab-override-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-prefab-override-s{font-size:13px;fill:var(--fig-muted)}.unity-prefab-override-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-prefab-override-anew{animation:unity-prefab-override-an 7s infinite}.unity-prefab-override-aold{animation:unity-prefab-override-ao 7s infinite}.unity-prefab-override-inew{animation:unity-prefab-override-in 7s infinite}.unity-prefab-override-iold{animation:unity-prefab-override-io 7s infinite}@keyframes unity-prefab-override-an{0%{opacity:1}60%{opacity:1}62%{opacity:0}74%{opacity:0}76%{opacity:1}100%{opacity:1}}@keyframes unity-prefab-override-ao{0%{opacity:0}60%{opacity:0}62%{opacity:1}74%{opacity:1}76%{opacity:0}100%{opacity:0}}@keyframes unity-prefab-override-in{0%{opacity:1}60%{opacity:1}62%{opacity:0}87%{opacity:0}89%{opacity:1}100%{opacity:1}}@keyframes unity-prefab-override-io{0%{opacity:0}60%{opacity:0}62%{opacity:1}87%{opacity:1}89%{opacity:0}100%{opacity:0}}.unity-prefab-override-d0{animation:unity-prefab-override-d0 7s infinite}@keyframes unity-prefab-override-d0{0%{opacity:0;transform:translate(0,0)}75%{opacity:0;transform:translate(0,0)}76%{opacity:1;transform:translate(0,0)}88%{opacity:1;transform:translate(-240px,120px)}90%{opacity:0;transform:translate(-240px,120px)}100%{opacity:0;transform:translate(-240px,120px)}}.unity-prefab-override-d1{animation:unity-prefab-override-d1 7s infinite}@keyframes unity-prefab-override-d1{0%{opacity:0;transform:translate(0,0)}75%{opacity:0;transform:translate(0,0)}76%{opacity:1;transform:translate(0,0)}88%{opacity:1;transform:translate(-120px,120px)}90%{opacity:0;transform:translate(-120px,120px)}100%{opacity:0;transform:translate(-120px,120px)}}.unity-prefab-override-d2{animation:unity-prefab-override-d2 7s infinite}@keyframes unity-prefab-override-d2{0%{opacity:0;transform:translate(0,0)}75%{opacity:0;transform:translate(0,0)}76%{opacity:1;transform:translate(0,0)}88%{opacity:1;transform:translate(0px,120px)}90%{opacity:0;transform:translate(0px,120px)}100%{opacity:0;transform:translate(0px,120px)}}.unity-prefab-override-d3{animation:unity-prefab-override-d3 7s infinite}@keyframes unity-prefab-override-d3{0%{opacity:0;transform:translate(0,0)}75%{opacity:0;transform:translate(0,0)}76%{opacity:1;transform:translate(0,0)}88%{opacity:1;transform:translate(120px,120px)}90%{opacity:0;transform:translate(120px,120px)}100%{opacity:0;transform:translate(120px,120px)}}.unity-prefab-override-d4{animation:unity-prefab-override-d4 7s infinite}@keyframes unity-prefab-override-d4{0%{opacity:0;transform:translate(0,0)}75%{opacity:0;transform:translate(0,0)}76%{opacity:1;transform:translate(0,0)}88%{opacity:1;transform:translate(240px,120px)}90%{opacity:0;transform:translate(240px,120px)}100%{opacity:0;transform:translate(240px,120px)}}</style> <text x=\"184\" y=\"56\" class=\"unity-prefab-override-s\" text-anchor=\"end\">Prefab asset</text><text x=\"456\" y=\"52\" class=\"unity-prefab-override-s\">engineer's fix</text><text x=\"456\" y=\"74\" class=\"unity-prefab-override-m\">1.0 → 1.4</text><line x1=\"320\" y1=\"100\" x2=\"80\" y2=\"220\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"320\" y1=\"100\" x2=\"200\" y2=\"220\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"320\" y1=\"100\" x2=\"320\" y2=\"220\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"320\" y1=\"100\" x2=\"440\" y2=\"220\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"320\" y1=\"100\" x2=\"560\" y2=\"220\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect x=\"200\" y=\"20\" width=\"240\" height=\"80\" rx=\"12\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.5\" stroke-width=\"1.5\"/><text x=\"320\" y=\"46\" class=\"unity-prefab-override-b\" text-anchor=\"middle\">MechanicNPC.prefab</text><text x=\"220\" y=\"80\" class=\"unity-prefab-override-s\">BoxCollider m_Size</text><text x=\"420\" y=\"80\" class=\"unity-prefab-override-m unity-prefab-override-anew\" text-anchor=\"end\" font-weight=\"600\">1.4</text><text x=\"420\" y=\"80\" class=\"unity-prefab-override-m unity-prefab-override-aold\" text-anchor=\"end\" font-weight=\"600\" opacity=\"0\">1.0</text><rect x=\"28\" y=\"220\" width=\"104\" height=\"80\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"80\" y=\"246\" class=\"unity-prefab-override-t\" text-anchor=\"middle\">Track 1</text><text x=\"46\" y=\"281\" class=\"unity-prefab-override-s\">m_Size</text><text x=\"120\" y=\"281\" class=\"unity-prefab-override-m unity-prefab-override-inew\" text-anchor=\"end\">1.4</text><text x=\"120\" y=\"281\" class=\"unity-prefab-override-m unity-prefab-override-iold\" text-anchor=\"end\" opacity=\"0\">1.0</text><circle cx=\"320\" cy=\"100\" r=\"5\" fill=\"var(--fig-accent)\" opacity=\"0\" class=\"unity-prefab-override-d0\"/><rect x=\"148\" y=\"220\" width=\"104\" height=\"80\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"200\" y=\"246\" class=\"unity-prefab-override-t\" text-anchor=\"middle\">Track 2</text><text x=\"166\" y=\"281\" class=\"unity-prefab-override-s\">m_Size</text><text x=\"240\" y=\"281\" class=\"unity-prefab-override-m unity-prefab-override-inew\" text-anchor=\"end\">1.4</text><text x=\"240\" y=\"281\" class=\"unity-prefab-override-m unity-prefab-override-iold\" text-anchor=\"end\" opacity=\"0\">1.0</text><circle cx=\"320\" cy=\"100\" r=\"5\" fill=\"var(--fig-accent)\" opacity=\"0\" class=\"unity-prefab-override-d1\"/><rect x=\"268\" y=\"220\" width=\"104\" height=\"80\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"320\" y=\"246\" class=\"unity-prefab-override-t\" text-anchor=\"middle\">Track 11</text><text x=\"286\" y=\"281\" class=\"unity-prefab-override-s\">m_Size</text><text x=\"360\" y=\"281\" class=\"unity-prefab-override-m unity-prefab-override-inew\" text-anchor=\"end\">1.4</text><text x=\"360\" y=\"281\" class=\"unity-prefab-override-m unity-prefab-override-iold\" text-anchor=\"end\" opacity=\"0\">1.0</text><circle cx=\"320\" cy=\"100\" r=\"5\" fill=\"var(--fig-accent)\" opacity=\"0\" class=\"unity-prefab-override-d2\"/><rect x=\"388\" y=\"220\" width=\"104\" height=\"80\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><rect x=\"396\" y=\"262\" width=\"4\" height=\"26\" rx=\"2\" fill=\"var(--fig-accent)\"/><text x=\"440\" y=\"246\" class=\"unity-prefab-override-t\" text-anchor=\"middle\">Track 12</text><text x=\"406\" y=\"281\" class=\"unity-prefab-override-s\">m_Size</text><text x=\"480\" y=\"281\" class=\"unity-prefab-override-m\" text-anchor=\"end\" font-weight=\"700\" style=\"fill:var(--fig-accent)\">1.0</text><circle cx=\"320\" cy=\"100\" r=\"5\" fill=\"var(--fig-accent)\" opacity=\"0\" class=\"unity-prefab-override-d3\"/><rect x=\"508\" y=\"220\" width=\"104\" height=\"80\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"560\" y=\"246\" class=\"unity-prefab-override-t\" text-anchor=\"middle\">Track 40</text><text x=\"526\" y=\"281\" class=\"unity-prefab-override-s\">m_Size</text><text x=\"600\" y=\"281\" class=\"unity-prefab-override-m unity-prefab-override-inew\" text-anchor=\"end\">1.4</text><text x=\"600\" y=\"281\" class=\"unity-prefab-override-m unity-prefab-override-iold\" text-anchor=\"end\" opacity=\"0\">1.0</text><circle cx=\"320\" cy=\"100\" r=\"5\" fill=\"var(--fig-accent)\" opacity=\"0\" class=\"unity-prefab-override-d4\"/><text x=\"440\" y=\"324\" class=\"unity-prefab-override-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">override wins</text><text x=\"28\" y=\"324\" class=\"unity-prefab-override-s\">scene instances</text><rect x=\"186\" y=\"338\" width=\"4\" height=\"16\" rx=\"2\" fill=\"var(--fig-accent)\"/><text x=\"198\" y=\"351\" class=\"unity-prefab-override-s\">overridden property: bold value, blue bar in the Inspector</text> </svg>"
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "You need `EnemyArmored` that differs from `Enemy` in a few values and should still pick up future fixes to `Enemy`",
              "use": "Prefab Variant",
              "why": "The variant stores only its differences from the base, so base fixes propagate. Keep chains shallow: deep variant-of-variant stacks make it hard to see where a value comes from."
            },
            {
              "signal": "The same sub-assembly (a wheel, a door, a light rig) is copy-pasted inside many different prefabs",
              "use": "Nested prefab",
              "why": "Each nested instance keeps its own link to its asset, so one edit updates every parent. Costs an extra level of overrides to reason about when a parent tweaks the child."
            },
            {
              "signal": "A 2,000-line `Player` MonoBehaviour handles movement, health, audio and UI, and every change touches it",
              "use": "Composition with small components",
              "why": "Split into `Mover`, `Health`, `PlayerAudio` and so on, each with one job, reused on other objects. Costs more wiring between components; do not split pieces that always change together."
            },
            {
              "signal": "A component silently fails because a sibling `Rigidbody` or `Collider` it depends on was never added",
              "use": "`[RequireComponent]`",
              "why": "Unity adds the dependency automatically and blocks removing it, turning a runtime null into an editor guarantee. Only use it for true hard dependencies, or it fights designers."
            },
            {
              "signal": "Scripts locate collaborators with `GameObject.Find(\"Player\")` or by tag, and break when an object is renamed",
              "use": "Serialized reference in the Inspector",
              "why": "A `[SerializeField]` reference is resolved by file ID, survives renames and costs nothing at runtime. For objects spawned at runtime, pass references at spawn time instead."
            },
            {
              "signal": "A fix made on the prefab asset reaches every instance except one, which still shows the old value",
              "use": "Audit and revert instance overrides",
              "why": "Overrides always win over the asset. Check the Overrides dropdown, revert stale ones, and apply deliberate ones to the asset so instances do not drift."
            },
            {
              "signal": "Profiler shows high transform change dispatch; thousands of movers share one deep parent",
              "use": "Flat hierarchy for moving objects",
              "why": "A transform change dirties the whole hierarchy it belongs to, so many movers under one root serialise work. Keep frequently moving objects at the root or in small groups; folders are not free."
            },
            {
              "signal": "You want a script to stop running but keep the object visible and colliding",
              "use": "Disable the component, not the GameObject",
              "why": "`enabled = false` stops that component's Update and similar callbacks only. `SetActive(false)` deactivates the whole object and its children, hiding renderers and colliders too."
            },
            {
              "signal": "References to an asset break after files were moved or renamed outside Unity, or a commit lacks `.meta` files",
              "use": "Move assets in the Editor, commit `.meta`",
              "why": "References are by GUID stored in `.meta`; a new `.meta` means a new GUID and every reference breaks. Always move inside Unity and treat `.meta` as source code."
            }
          ]
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
        },
        {
          "q": "A designer renames the `Player` object to `Hero` and the camera rig starts throwing NullReferenceException. Its script grabs the target with `GameObject.Find(\"Player\")` in `Start`. What should you reach for?",
          "options": [
            "A `[SerializeField]` field set in the Inspector",
            "Switch the lookup to `FindWithTag(\"Player\")` instead",
            "Move the camera under the Hero in the hierarchy",
            "Add `[RequireComponent]` to the camera script"
          ],
          "answer": 0,
          "explain": "A serialized reference is stored by file ID, so it survives renames and costs nothing at runtime. `FindWithTag` only swaps one string for another and breaks the same way when the tag changes."
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
          "type": "figure",
          "id": "unity-lifecycle-order",
          "caption": "Watch FixedUpdate run once, then zero times, then twice across three frames, while Update, LateUpdate and rendering run exactly once each.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 312\" role=\"img\" aria-label=\"MonoBehaviour lifecycle: Awake, OnEnable and Start once, then every frame FixedUpdate and physics zero or more times, Update, Animator, LateUpdate and rendering, then OnDisable and OnDestroy.\"> <style>.unity-lifecycle-order-t{font-size:14px;fill:var(--fig-ink)}.unity-lifecycle-order-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-lifecycle-order-s{font-size:13px;fill:var(--fig-muted)}.unity-lifecycle-order-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-lifecycle-order-hawake{animation:unity-lifecycle-order-hawake 8s infinite}@keyframes unity-lifecycle-order-hawake{0%{opacity:1}3.57%{opacity:1}3.97%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-honenable{animation:unity-lifecycle-order-honenable 8s infinite}@keyframes unity-lifecycle-order-honenable{0%{opacity:0}3.77%{opacity:0}4.17%{opacity:1}7.73%{opacity:1}8.13%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hstart{animation:unity-lifecycle-order-hstart 8s infinite}@keyframes unity-lifecycle-order-hstart{0%{opacity:0}7.93%{opacity:0}8.33%{opacity:1}11.9%{opacity:1}12.3%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hondisable{animation:unity-lifecycle-order-hondisable 8s infinite}@keyframes unity-lifecycle-order-hondisable{0%{opacity:0}87.1%{opacity:0}87.5%{opacity:1}91.07%{opacity:1}91.47%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hondestroy{animation:unity-lifecycle-order-hondestroy 8s infinite}@keyframes unity-lifecycle-order-hondestroy{0%{opacity:0}91.27%{opacity:0}91.67%{opacity:1}95.23%{opacity:1}95.63%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hfixedupdate{animation:unity-lifecycle-order-hfixedupdate 8s infinite}@keyframes unity-lifecycle-order-hfixedupdate{0%{opacity:0}12.1%{opacity:0}12.5%{opacity:1}16.07%{opacity:1}16.47%{opacity:0}53.77%{opacity:0}54.17%{opacity:1}57.73%{opacity:1}58.13%{opacity:0}62.1%{opacity:0}62.5%{opacity:1}66.07%{opacity:1}66.47%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hphysics{animation:unity-lifecycle-order-hphysics 8s infinite}@keyframes unity-lifecycle-order-hphysics{0%{opacity:0}16.27%{opacity:0}16.67%{opacity:1}20.23%{opacity:1}20.63%{opacity:0}57.93%{opacity:0}58.33%{opacity:1}61.9%{opacity:1}62.3%{opacity:0}66.27%{opacity:0}66.67%{opacity:1}70.23%{opacity:1}70.63%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hupdate{animation:unity-lifecycle-order-hupdate 8s infinite}@keyframes unity-lifecycle-order-hupdate{0%{opacity:0}20.43%{opacity:0}20.83%{opacity:1}24.4%{opacity:1}24.8%{opacity:0}37.1%{opacity:0}37.5%{opacity:1}41.07%{opacity:1}41.47%{opacity:0}70.43%{opacity:0}70.83%{opacity:1}74.4%{opacity:1}74.8%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hanimator{animation:unity-lifecycle-order-hanimator 8s infinite}@keyframes unity-lifecycle-order-hanimator{0%{opacity:0}24.6%{opacity:0}25%{opacity:1}28.57%{opacity:1}28.97%{opacity:0}41.27%{opacity:0}41.67%{opacity:1}45.23%{opacity:1}45.63%{opacity:0}74.6%{opacity:0}75%{opacity:1}78.57%{opacity:1}78.97%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hlateupdate{animation:unity-lifecycle-order-hlateupdate 8s infinite}@keyframes unity-lifecycle-order-hlateupdate{0%{opacity:0}28.77%{opacity:0}29.17%{opacity:1}32.73%{opacity:1}33.13%{opacity:0}45.43%{opacity:0}45.83%{opacity:1}49.4%{opacity:1}49.8%{opacity:0}78.77%{opacity:0}79.17%{opacity:1}82.73%{opacity:1}83.13%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-hrendering{animation:unity-lifecycle-order-hrendering 8s infinite}@keyframes unity-lifecycle-order-hrendering{0%{opacity:0}32.93%{opacity:0}33.33%{opacity:1}36.9%{opacity:1}37.3%{opacity:0}49.6%{opacity:0}50%{opacity:1}53.57%{opacity:1}53.97%{opacity:0}82.93%{opacity:0}83.33%{opacity:1}86.9%{opacity:1}87.3%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-st0{animation:unity-lifecycle-order-st0 8s infinite}@keyframes unity-lifecycle-order-st0{0%{opacity:1}11.9%{opacity:1}12.3%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-st1{animation:unity-lifecycle-order-st1 8s infinite}@keyframes unity-lifecycle-order-st1{0%{opacity:0}12.1%{opacity:0}12.5%{opacity:1}36.9%{opacity:1}37.3%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-st2{animation:unity-lifecycle-order-st2 8s infinite}@keyframes unity-lifecycle-order-st2{0%{opacity:0}37.1%{opacity:0}37.5%{opacity:1}53.57%{opacity:1}53.97%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-st3{animation:unity-lifecycle-order-st3 8s infinite}@keyframes unity-lifecycle-order-st3{0%{opacity:0}53.77%{opacity:0}54.17%{opacity:1}86.9%{opacity:1}87.3%{opacity:0}100%{opacity:0}}.unity-lifecycle-order-st4{animation:unity-lifecycle-order-st4 8s infinite}@keyframes unity-lifecycle-order-st4{0%{opacity:0}87.1%{opacity:0}87.5%{opacity:1}99.4%{opacity:1}99.8%{opacity:0}100%{opacity:0}}</style> <defs><marker id=\"unity-lifecycle-order-ar\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" fill=\"var(--fig-muted)\"/></marker></defs><path d=\"M288 72L16 112H624L398 72Z\" fill=\"var(--fig-panel)\" fill-opacity=\"0.6\"/><rect x=\"16\" y=\"112\" width=\"608\" height=\"150\" rx=\"12\" fill=\"var(--fig-panel)\" fill-opacity=\"0.6\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"32\" y=\"136\" class=\"unity-lifecycle-order-s\">every frame</text><text x=\"16\" y=\"24\" class=\"unity-lifecycle-order-s\">once, on load</text><text x=\"624\" y=\"24\" class=\"unity-lifecycle-order-s\" text-anchor=\"end\">once, on disable / destroy</text><rect x=\"16\" y=\"36\" width=\"62\" height=\"36\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"16\" y=\"36\" width=\"62\" height=\"36\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hawake\"/><text x=\"47\" y=\"59\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">Awake</text><line x1=\"81\" y1=\"54\" x2=\"96\" y2=\"54\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"99\" y=\"36\" width=\"85\" height=\"36\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"99\" y=\"36\" width=\"85\" height=\"36\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-honenable\"/><text x=\"141.5\" y=\"59\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">OnEnable</text><line x1=\"187\" y1=\"54\" x2=\"202\" y2=\"54\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"205\" y=\"36\" width=\"62\" height=\"36\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"205\" y=\"36\" width=\"62\" height=\"36\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hstart\"/><text x=\"236\" y=\"59\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">Start</text><line x1=\"270\" y1=\"54\" x2=\"285\" y2=\"54\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"288\" y=\"36\" width=\"110\" height=\"36\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.5\" stroke-width=\"1.5\"/><text x=\"343\" y=\"59\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">frame loop</text><line x1=\"401\" y1=\"54\" x2=\"416\" y2=\"54\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"419\" y=\"36\" width=\"92\" height=\"36\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"419\" y=\"36\" width=\"92\" height=\"36\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hondisable\"/><text x=\"465\" y=\"59\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">OnDisable</text><line x1=\"514\" y1=\"54\" x2=\"529\" y2=\"54\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"532\" y=\"36\" width=\"92\" height=\"36\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"532\" y=\"36\" width=\"92\" height=\"36\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hondestroy\"/><text x=\"578\" y=\"59\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">OnDestroy</text><rect x=\"32\" y=\"148\" width=\"200.2\" height=\"50\" rx=\"12\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.6\" stroke-dasharray=\"5 4\" stroke-width=\"1.5\"/><text x=\"132.1\" y=\"218\" class=\"unity-lifecycle-order-s\" text-anchor=\"middle\">× 0, 1 or several</text><rect x=\"38\" y=\"156\" width=\"102\" height=\"34\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"38\" y=\"156\" width=\"102\" height=\"34\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hfixedupdate\"/><text x=\"89\" y=\"178\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">FixedUpdate</text><line x1=\"142\" y1=\"173\" x2=\"153.2\" y2=\"173\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"155.2\" y=\"156\" width=\"71\" height=\"34\" rx=\"9\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-dasharray=\"4 3\" stroke-width=\"1.5\"/><rect x=\"155.2\" y=\"156\" width=\"71\" height=\"34\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hphysics\"/><text x=\"190.7\" y=\"178\" class=\"unity-lifecycle-order-s\" text-anchor=\"middle\">physics</text><line x1=\"228.2\" y1=\"173\" x2=\"239.4\" y2=\"173\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"241.4\" y=\"156\" width=\"64\" height=\"34\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"241.4\" y=\"156\" width=\"64\" height=\"34\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hupdate\"/><text x=\"273.4\" y=\"178\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">Update</text><line x1=\"307.4\" y1=\"173\" x2=\"318.6\" y2=\"173\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"320.6\" y=\"156\" width=\"79\" height=\"34\" rx=\"9\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-dasharray=\"4 3\" stroke-width=\"1.5\"/><rect x=\"320.6\" y=\"156\" width=\"79\" height=\"34\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hanimator\"/><text x=\"360.1\" y=\"178\" class=\"unity-lifecycle-order-s\" text-anchor=\"middle\">Animator</text><line x1=\"401.6\" y1=\"173\" x2=\"412.8\" y2=\"173\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"414.8\" y=\"156\" width=\"94\" height=\"34\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"414.8\" y=\"156\" width=\"94\" height=\"34\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hlateupdate\"/><text x=\"461.8\" y=\"178\" class=\"unity-lifecycle-order-t\" text-anchor=\"middle\">LateUpdate</text><line x1=\"510.8\" y1=\"173\" x2=\"522\" y2=\"173\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><rect x=\"524\" y=\"156\" width=\"86\" height=\"34\" rx=\"9\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-dasharray=\"4 3\" stroke-width=\"1.5\"/><rect x=\"524\" y=\"156\" width=\"86\" height=\"34\" rx=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.28\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-lifecycle-order-hrendering\"/><text x=\"567\" y=\"178\" class=\"unity-lifecycle-order-s\" text-anchor=\"middle\">rendering</text><path d=\"M567 190V238H24V173H30\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-lifecycle-order-ar)\"/><text x=\"320\" y=\"254\" class=\"unity-lifecycle-order-s\" text-anchor=\"middle\">next frame</text><text x=\"320\" y=\"296\" class=\"unity-lifecycle-order-b unity-lifecycle-order-st0\" text-anchor=\"middle\" opacity=\"1\">startup: Awake, OnEnable, Start</text><text x=\"320\" y=\"296\" class=\"unity-lifecycle-order-b unity-lifecycle-order-st1\" text-anchor=\"middle\" opacity=\"0\">frame 1: FixedUpdate × 1</text><text x=\"320\" y=\"296\" class=\"unity-lifecycle-order-b unity-lifecycle-order-st2\" text-anchor=\"middle\" opacity=\"0\">frame 2: FixedUpdate × 0</text><text x=\"320\" y=\"296\" class=\"unity-lifecycle-order-b unity-lifecycle-order-st3\" text-anchor=\"middle\" opacity=\"0\">frame 3: FixedUpdate × 2</text><text x=\"320\" y=\"296\" class=\"unity-lifecycle-order-b unity-lifecycle-order-st4\" text-anchor=\"middle\" opacity=\"0\">teardown: OnDisable, OnDestroy</text> </svg>"
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
          "type": "figure",
          "id": "unity-fixed-timestep",
          "caption": "Drawn to scale: elapsed time piles up and each 20 ms fixed step drains it, so 60 fps skips FixedUpdate on one frame in six and 30 fps runs it once or twice.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 372\" role=\"img\" aria-label=\"To scale over 100 ms: real time accumulates and each 20 ms fixed step drains it; at 60 fps FixedUpdate runs on five of six frames, at 30 fps once or twice per frame.\"> <style>.unity-fixed-timestep-t{font-size:14px;fill:var(--fig-ink)}.unity-fixed-timestep-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-fixed-timestep-s{font-size:13px;fill:var(--fig-muted)}.unity-fixed-timestep-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-fixed-timestep-dot60{animation:unity-fixed-timestep-dot60 6s linear infinite}@keyframes unity-fixed-timestep-dot60{0%{transform:translate(0px,0px)}16%{transform:translate(86.67px,-26.67px)}32%{transform:translate(173.33px,-53.33px)}32.8%{transform:translate(173.33px,-21.33px)}48%{transform:translate(260px,-48px)}48.8%{transform:translate(260px,-16px)}64%{transform:translate(346.67px,-42.67px)}64.8%{transform:translate(346.67px,-10.67px)}80%{transform:translate(433.33px,-37.33px)}80.8%{transform:translate(433.33px,-5.33px)}96%{transform:translate(520px,-32px)}96.8%{transform:translate(520px,0px)}100%{transform:translate(520px,0px)}}.unity-fixed-timestep-dot30{animation:unity-fixed-timestep-dot30 6s linear infinite}@keyframes unity-fixed-timestep-dot30{0%{transform:translate(0px,0px)}32%{transform:translate(173.33px,-53.33px)}32.8%{transform:translate(173.33px,-21.33px)}64%{transform:translate(346.67px,-74.67px)}64.8%{transform:translate(346.67px,-42.67px)}65.6%{transform:translate(346.67px,-10.67px)}96%{transform:translate(520px,-64px)}96.8%{transform:translate(520px,-32px)}97.6%{transform:translate(520px,0px)}100%{transform:translate(520px,0px)}}.unity-fixed-timestep-ph{animation:unity-fixed-timestep-ph 6s linear infinite}@keyframes unity-fixed-timestep-ph{0%{transform:translateX(0)}96%{transform:translateX(520px)}100%{transform:translateX(520px)}}</style> <line x1=\"80\" y1=\"36\" x2=\"80\" y2=\"342\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text x=\"80\" y=\"28\" class=\"unity-fixed-timestep-s\" text-anchor=\"middle\">0</text><line x1=\"184\" y1=\"36\" x2=\"184\" y2=\"342\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text x=\"184\" y=\"28\" class=\"unity-fixed-timestep-s\" text-anchor=\"middle\">20</text><line x1=\"288\" y1=\"36\" x2=\"288\" y2=\"342\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text x=\"288\" y=\"28\" class=\"unity-fixed-timestep-s\" text-anchor=\"middle\">40</text><line x1=\"392\" y1=\"36\" x2=\"392\" y2=\"342\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text x=\"392\" y=\"28\" class=\"unity-fixed-timestep-s\" text-anchor=\"middle\">60</text><line x1=\"496\" y1=\"36\" x2=\"496\" y2=\"342\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text x=\"496\" y=\"28\" class=\"unity-fixed-timestep-s\" text-anchor=\"middle\">80</text><line x1=\"600\" y1=\"36\" x2=\"600\" y2=\"342\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text x=\"600\" y=\"28\" class=\"unity-fixed-timestep-s\" text-anchor=\"middle\">100 ms</text><text x=\"16\" y=\"62\" class=\"unity-fixed-timestep-b\">60 fps: frames of 16.7 ms, FixedUpdate on 5 of 6 frames</text><line x1=\"80\" y1=\"118\" x2=\"600\" y2=\"118\" stroke=\"var(--fig-accent2)\" stroke-dasharray=\"5 4\" stroke-width=\"1.5\"/><text x=\"72\" y=\"122\" class=\"unity-fixed-timestep-s\" text-anchor=\"end\">20 ms</text><text x=\"72\" y=\"154\" class=\"unity-fixed-timestep-s\" text-anchor=\"end\">0</text><line x1=\"80\" y1=\"150\" x2=\"600\" y2=\"150\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><rect x=\"81\" y=\"156\" width=\"84.67\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"167.67\" y=\"156\" width=\"84.67\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"254.33\" y=\"156\" width=\"84.67\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"341\" y=\"156\" width=\"84.67\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"427.67\" y=\"156\" width=\"84.67\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"514.33\" y=\"156\" width=\"84.67\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><path d=\"M80 150L166.67 123.33L253.33 96.67L253.33 128.67L340 102L340 134L426.67 107.33L426.67 139.33L513.33 112.67L513.33 144.67L600 118L600 150\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\" stroke-linejoin=\"round\"/><line x1=\"253.33\" y1=\"96.67\" x2=\"253.33\" y2=\"128.67\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"253.33\" cy=\"128.67\" r=\"3\" fill=\"var(--fig-accent)\"/><line x1=\"340\" y1=\"102\" x2=\"340\" y2=\"134\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"340\" cy=\"134\" r=\"3\" fill=\"var(--fig-accent)\"/><line x1=\"426.67\" y1=\"107.33\" x2=\"426.67\" y2=\"139.33\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"426.67\" cy=\"139.33\" r=\"3\" fill=\"var(--fig-accent)\"/><line x1=\"513.33\" y1=\"112.67\" x2=\"513.33\" y2=\"144.67\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"513.33\" cy=\"144.67\" r=\"3\" fill=\"var(--fig-accent)\"/><line x1=\"600\" y1=\"118\" x2=\"600\" y2=\"150\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"600\" cy=\"150\" r=\"3\" fill=\"var(--fig-accent)\"/><text x=\"166.67\" y=\"192\" class=\"unity-fixed-timestep-s\" text-anchor=\"middle\">×0</text><text x=\"253.33\" y=\"192\" class=\"unity-fixed-timestep-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">×1</text><text x=\"340\" y=\"192\" class=\"unity-fixed-timestep-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">×1</text><text x=\"426.67\" y=\"192\" class=\"unity-fixed-timestep-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">×1</text><text x=\"513.33\" y=\"192\" class=\"unity-fixed-timestep-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">×1</text><text x=\"600\" y=\"192\" class=\"unity-fixed-timestep-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">×1</text><circle cx=\"80\" cy=\"150\" r=\"5.5\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" class=\"unity-fixed-timestep-dot60\"/><text x=\"16\" y=\"230\" class=\"unity-fixed-timestep-b\">30 fps: frames of 33.3 ms, FixedUpdate once or twice</text><line x1=\"80\" y1=\"286\" x2=\"600\" y2=\"286\" stroke=\"var(--fig-accent2)\" stroke-dasharray=\"5 4\" stroke-width=\"1.5\"/><text x=\"72\" y=\"290\" class=\"unity-fixed-timestep-s\" text-anchor=\"end\">20 ms</text><text x=\"72\" y=\"322\" class=\"unity-fixed-timestep-s\" text-anchor=\"end\">0</text><line x1=\"80\" y1=\"318\" x2=\"600\" y2=\"318\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><rect x=\"81\" y=\"324\" width=\"171.33\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"254.33\" y=\"324\" width=\"171.33\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"427.67\" y=\"324\" width=\"171.33\" height=\"18\" rx=\"5\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><path d=\"M80 318L253.33 264.67L253.33 296.67L426.67 243.33L426.67 275.33L426.67 307.33L600 254L600 286L600 318\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\" stroke-linejoin=\"round\"/><line x1=\"253.33\" y1=\"264.67\" x2=\"253.33\" y2=\"296.67\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"253.33\" cy=\"296.67\" r=\"3\" fill=\"var(--fig-accent)\"/><line x1=\"426.67\" y1=\"243.33\" x2=\"426.67\" y2=\"275.33\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"426.67\" cy=\"275.33\" r=\"3\" fill=\"var(--fig-accent)\"/><line x1=\"426.67\" y1=\"275.33\" x2=\"426.67\" y2=\"307.33\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"426.67\" cy=\"307.33\" r=\"3\" fill=\"var(--fig-accent)\"/><line x1=\"600\" y1=\"254\" x2=\"600\" y2=\"286\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"600\" cy=\"286\" r=\"3\" fill=\"var(--fig-accent)\"/><line x1=\"600\" y1=\"286\" x2=\"600\" y2=\"318\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><circle cx=\"600\" cy=\"318\" r=\"3\" fill=\"var(--fig-accent)\"/><text x=\"253.33\" y=\"360\" class=\"unity-fixed-timestep-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">×1</text><text x=\"426.67\" y=\"360\" class=\"unity-fixed-timestep-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">×2</text><text x=\"600\" y=\"360\" class=\"unity-fixed-timestep-b\" text-anchor=\"middle\" style=\"fill:var(--fig-accent)\">×2</text><circle cx=\"80\" cy=\"318\" r=\"5.5\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-accent)\" stroke-width=\"2.5\" class=\"unity-fixed-timestep-dot30\"/><text x=\"16\" y=\"192\" class=\"unity-fixed-timestep-s\">per frame</text><text x=\"16\" y=\"360\" class=\"unity-fixed-timestep-s\">per frame</text><line x1=\"80\" y1=\"36\" x2=\"80\" y2=\"342\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.5\" stroke-width=\"1.5\" class=\"unity-fixed-timestep-ph\"/> </svg>"
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
          "type": "figure",
          "id": "unity-coroutine-frames",
          "caption": "A coroutine is suspended at each yield return null and resumed by the engine after Update on the next frame.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 312\" role=\"img\" aria-label=\"A Fade coroutine started in Update runs until yield return null, then resumes once per frame after Update, lowering the sprite alpha from 1.0 to 0 over five frames.\"> <style>.unity-coroutine-frames-t{font-size:14px;fill:var(--fig-ink)}.unity-coroutine-frames-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-coroutine-frames-s{font-size:13px;fill:var(--fig-muted)}.unity-coroutine-frames-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-coroutine-frames-col{animation:unity-coroutine-frames-col 6s step-end infinite}@keyframes unity-coroutine-frames-col{0%{transform:translateX(0px)}20%{transform:translateX(92px)}40%{transform:translateX(184px)}60%{transform:translateX(276px)}80%{transform:translateX(368px)}100%{transform:translateX(368px)}}</style> <rect x=\"156\" y=\"28\" width=\"92\" height=\"240\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\" class=\"unity-coroutine-frames-col\"/><text x=\"202\" y=\"48\" class=\"unity-coroutine-frames-s\" text-anchor=\"middle\">frame 1</text><text x=\"294\" y=\"48\" class=\"unity-coroutine-frames-s\" text-anchor=\"middle\">frame 2</text><text x=\"386\" y=\"48\" class=\"unity-coroutine-frames-s\" text-anchor=\"middle\">frame 3</text><text x=\"478\" y=\"48\" class=\"unity-coroutine-frames-s\" text-anchor=\"middle\">frame 4</text><text x=\"570\" y=\"48\" class=\"unity-coroutine-frames-s\" text-anchor=\"middle\">frame 5</text><text x=\"24\" y=\"81\" class=\"unity-coroutine-frames-s\">Update</text><text x=\"24\" y=\"123\" class=\"unity-coroutine-frames-t\">yield null resumes</text><text x=\"24\" y=\"165\" class=\"unity-coroutine-frames-s\">LateUpdate</text><text x=\"24\" y=\"207\" class=\"unity-coroutine-frames-s\">rendering</text><path d=\"M244 76C252 76 244 118 252 118\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><line x1=\"336\" y1=\"118\" x2=\"344\" y2=\"118\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><line x1=\"428\" y1=\"118\" x2=\"436\" y2=\"118\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><line x1=\"520\" y1=\"118\" x2=\"528\" y2=\"118\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><rect x=\"160\" y=\"62\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text x=\"202\" y=\"81\" class=\"unity-coroutine-frames-t\" text-anchor=\"middle\">α = 1.0</text><rect x=\"252\" y=\"62\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"344\" y=\"62\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"436\" y=\"62\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"528\" y=\"62\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"160\" y=\"104\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"252\" y=\"104\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text x=\"294\" y=\"123\" class=\"unity-coroutine-frames-t\" text-anchor=\"middle\">α = 0.75</text><rect x=\"344\" y=\"104\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text x=\"386\" y=\"123\" class=\"unity-coroutine-frames-t\" text-anchor=\"middle\">α = 0.5</text><rect x=\"436\" y=\"104\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text x=\"478\" y=\"123\" class=\"unity-coroutine-frames-t\" text-anchor=\"middle\">α = 0.25</text><rect x=\"528\" y=\"104\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text x=\"570\" y=\"123\" class=\"unity-coroutine-frames-t\" text-anchor=\"middle\">α = 0</text><rect x=\"160\" y=\"146\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"252\" y=\"146\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"344\" y=\"146\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"436\" y=\"146\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"528\" y=\"146\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"160\" y=\"188\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"252\" y=\"188\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"344\" y=\"188\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"436\" y=\"188\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><rect x=\"528\" y=\"188\" width=\"84\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\"/><text x=\"24\" y=\"255\" class=\"unity-coroutine-frames-s\">sprite on screen</text><rect x=\"187\" y=\"236\" width=\"30\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"1\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"none\"/><rect x=\"279\" y=\"236\" width=\"30\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.75\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"none\"/><rect x=\"371\" y=\"236\" width=\"30\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"none\"/><rect x=\"463\" y=\"236\" width=\"30\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"none\"/><rect x=\"555\" y=\"236\" width=\"30\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><text x=\"320\" y=\"300\" class=\"unity-coroutine-frames-s\" text-anchor=\"middle\">yield return null suspends Fade(); the engine resumes it next frame, after Update</text> </svg>"
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "`GetComponent<Rigidbody>()` is called inside `Update` on every frame",
              "use": "Cache component references in Awake",
              "why": "Look up once in `Awake` and store it in a field; repeated lookups waste CPU in hot paths. If the component can be added later, use `TryGetComponent` when it appears instead."
            },
            {
              "signal": "`Find`, `FindObjectOfType` or `FindWithTag` appears in `Update` or in code run per spawned object",
              "use": "Look up once, or register on spawn",
              "why": "Find walks the scene and scales with object count. Resolve once at init, or have objects register themselves with a manager or runtime set when enabled."
            },
            {
              "signal": "A script reads another object's data in `Awake` and sometimes sees defaults",
              "use": "Awake for self, Start for others",
              "why": "Every `Awake` in a scene runs before any `Start`, so set up your own state in Awake and talk to others in Start. Order of the same callback across scripts is still undefined."
            },
            {
              "signal": "Many scripts depend on a config or service manager being initialised before them",
              "use": "Bootstrapper with explicit init order",
              "why": "One entry point initialises services in a known order and hands them out. `[DefaultExecutionOrder]` works for a few cases but hides the order in attributes scattered across files."
            },
            {
              "signal": "A short sequence over frames (blink, fade, wait then spawn) should die with its GameObject",
              "use": "Coroutine",
              "why": "Simple, tied to the object and stopped when it is destroyed or deactivated. It keeps running if only the component is disabled, cannot return values and swallows the call stack in exceptions."
            },
            {
              "signal": "An `async` loop keeps running and throws `MissingReferenceException` after its object is destroyed",
              "use": "Awaitable + `destroyCancellationToken`",
              "why": "Async methods are owned by nothing, so pass the token and let cancellation end the loop. Await each Awaitable instance only once, since instances are pooled."
            },
            {
              "signal": "You must wait for a load or web request and then use its result, with try/catch error handling",
              "use": "async/await over coroutines",
              "why": "Async methods return values and propagate exceptions normally, so multi-step flows read top to bottom. Costs explicit cancellation and care about which thread you resume on."
            },
            {
              "signal": "A CPU-heavy calculation (path search, parsing) causes a frame spike on the main thread",
              "use": "Background thread, then back to main thread",
              "why": "`Awaitable.BackgroundThreadAsync()` moves the work off the main thread and `MainThreadAsync()` returns to touch Unity objects. Unity APIs are main-thread only; for bulk data, the Job System scales better."
            },
            {
              "signal": "Every enemy prefab carries its own copy of max health, speed and loot tables, and balance changes touch 200 files",
              "use": "ScriptableObject as shared data",
              "why": "Instances reference one asset, saving memory and giving designers a single place to tune. Treat it as read-only at runtime: Play Mode edits to assets persist in the Editor."
            },
            {
              "signal": "Player death must notify HUD, audio and analytics, and none of them should reference the player or each other",
              "use": "ScriptableObject event channel",
              "why": "A `GameEvent` asset holds listeners; the raiser and listeners only share the asset, even across scenes. Flow is harder to trace than direct calls, so name channels clearly and log raises."
            },
            {
              "signal": "Systems call `FindObjectsByType<Enemy>` to get all live enemies",
              "use": "ScriptableObject runtime set",
              "why": "Enemies add themselves to a set asset in `OnEnable` and remove in `OnDisable`, giving an always-current list with no scene search. Clear it on play start when domain reload is off."
            },
            {
              "signal": "Handlers fire on destroyed objects, or fire twice after re-enabling a component",
              "use": "Subscribe in OnEnable, unsubscribe in OnDisable",
              "why": "Pairing the two keeps listener lifetime equal to the component's active lifetime. Subscribing in Start without unsubscribing leaks handlers that keep dead objects alive."
            }
          ]
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
        },
        {
          "q": "Minimap, AI and audio code each call `FindObjectsByType<Enemy>()` every frame, and enemies spawn and die constantly. The scene search shows up in the profiler. Which approach fits best?",
          "options": [
            "Cache the found array once, in `Start`",
            "A ScriptableObject set filled in `OnEnable`",
            "Poll with a coroutine every half second or so",
            "Tag enemies and call `FindGameObjectsWithTag`"
          ],
          "answer": 1,
          "explain": "Enemies add and remove themselves, so the set is always current and needs no scene search. Caching in `Start` goes stale as soon as enemies spawn or die."
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
          "type": "figure",
          "id": "unity-gc-hitch",
          "caption": "At 3.2 KB per frame the garbage reaches about 1.7 MB in nine seconds and the collection blows the 16.7 ms budget; at zero GC Alloc both lines stay flat.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 316\" role=\"img\" aria-label=\"Over 20 seconds at 60 fps, 3.2 KB of garbage per frame piles up to about 1.7 MB, then a GC causes a 25 ms frame over the 16.7 ms budget; with zero allocations the heap and frame time stay flat.\"> <style>.unity-gc-hitch-t{font-size:14px;fill:var(--fig-ink)}.unity-gc-hitch-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-gc-hitch-s{font-size:13px;fill:var(--fig-muted)}.unity-gc-hitch-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-gc-hitch-g1{animation:unity-gc-hitch-g1 7s infinite}@keyframes unity-gc-hitch-g1{0%{opacity:0}44.5%{opacity:0}45%{opacity:1}51%{opacity:1}51.5%{opacity:0}100%{opacity:0}}.unity-gc-hitch-g2{animation:unity-gc-hitch-g2 7s infinite}@keyframes unity-gc-hitch-g2{0%{opacity:0}89.5%{opacity:0}90%{opacity:1}96%{opacity:1}96.5%{opacity:0}100%{opacity:0}}.unity-gc-hitch-ph{animation:unity-gc-hitch-ph 7s linear infinite}@keyframes unity-gc-hitch-ph{0%{transform:translateX(0)}100%{transform:translateX(256px)}}</style> <text x=\"16\" y=\"28\" class=\"unity-gc-hitch-b\">Before: 3.2 KB GC Alloc per frame</text><text x=\"40\" y=\"54\" class=\"unity-gc-hitch-s\">garbage on the heap</text><line x1=\"40\" y1=\"140\" x2=\"296\" y2=\"140\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"60\" x2=\"296\" y2=\"60\" stroke=\"var(--fig-line)\" stroke-dasharray=\"3 4\"/><text x=\"34\" y=\"64\" class=\"unity-gc-hitch-s\" text-anchor=\"end\" font-size=\"11\">2 MB</text><text x=\"34\" y=\"144\" class=\"unity-gc-hitch-s\" text-anchor=\"end\" font-size=\"11\">0</text><path d=\"M40 140L155.2 70.88L155.2 140L270.4 70.88L270.4 140L296 124.64V140Z\" fill=\"var(--fig-accent)\" fill-opacity=\"0.15\"/><path d=\"M40 140L155.2 70.88L155.2 140L270.4 70.88L270.4 140L296 124.64\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-width=\"2\" stroke-linejoin=\"round\"/><text x=\"161.2\" y=\"84.88\" class=\"unity-gc-hitch-s\">1.7 MB</text><text x=\"151.2\" y=\"156\" class=\"unity-gc-hitch-b\" text-anchor=\"middle\" style=\"fill:var(--fig-bad)\">GC</text><text x=\"266.4\" y=\"156\" class=\"unity-gc-hitch-b\" text-anchor=\"middle\" style=\"fill:var(--fig-bad)\">GC</text><text x=\"40\" y=\"184\" class=\"unity-gc-hitch-s\">frame time</text><line x1=\"40\" y1=\"290\" x2=\"296\" y2=\"290\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><line x1=\"40\" y1=\"234.33\" x2=\"296\" y2=\"234.33\" stroke=\"var(--fig-warn)\" stroke-dasharray=\"5 4\" stroke-width=\"1.5\"/><text x=\"48\" y=\"228.33\" class=\"unity-gc-hitch-s\">16.7 ms budget</text><path d=\"M40 253.33H152.2V206.67H158.2V253.33H267.4V206.67H273.4V253.33H296\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\" stroke-linejoin=\"round\"/><rect x=\"152.2\" y=\"206.67\" width=\"6\" height=\"46.67\" fill=\"var(--fig-bad)\"/><rect x=\"267.4\" y=\"206.67\" width=\"6\" height=\"46.67\" fill=\"var(--fig-bad)\"/><text x=\"163.2\" y=\"210.67\" class=\"unity-gc-hitch-b\" style=\"fill:var(--fig-bad)\">25 ms</text><circle cx=\"155.2\" cy=\"206.67\" r=\"10\" fill=\"var(--fig-bad)\" fill-opacity=\"0.3\" opacity=\"0\" class=\"unity-gc-hitch-g1\"/><circle cx=\"270.4\" cy=\"206.67\" r=\"10\" fill=\"var(--fig-bad)\" fill-opacity=\"0.3\" opacity=\"0\" class=\"unity-gc-hitch-g2\"/><text x=\"40\" y=\"308\" class=\"unity-gc-hitch-s\" text-anchor=\"middle\">0 s</text><text x=\"168\" y=\"308\" class=\"unity-gc-hitch-s\" text-anchor=\"middle\">10 s</text><text x=\"296\" y=\"308\" class=\"unity-gc-hitch-s\" text-anchor=\"middle\">20 s</text><line x1=\"40\" y1=\"62\" x2=\"40\" y2=\"290\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.55\" stroke-width=\"1.5\" class=\"unity-gc-hitch-ph\"/><text x=\"336\" y=\"28\" class=\"unity-gc-hitch-b\">After: zero GC Alloc per frame</text><text x=\"360\" y=\"54\" class=\"unity-gc-hitch-s\">garbage on the heap</text><line x1=\"360\" y1=\"140\" x2=\"616\" y2=\"140\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><line x1=\"360\" y1=\"60\" x2=\"616\" y2=\"60\" stroke=\"var(--fig-line)\" stroke-dasharray=\"3 4\"/><text x=\"354\" y=\"64\" class=\"unity-gc-hitch-s\" text-anchor=\"end\" font-size=\"11\">2 MB</text><text x=\"354\" y=\"144\" class=\"unity-gc-hitch-s\" text-anchor=\"end\" font-size=\"11\">0</text><line x1=\"360\" y1=\"139\" x2=\"616\" y2=\"139\" stroke=\"var(--fig-ok)\" stroke-width=\"2.5\"/><text x=\"488\" y=\"126\" class=\"unity-gc-hitch-s\" text-anchor=\"middle\">0 B per frame, no collections</text><text x=\"360\" y=\"184\" class=\"unity-gc-hitch-s\">frame time</text><line x1=\"360\" y1=\"290\" x2=\"616\" y2=\"290\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><line x1=\"360\" y1=\"234.33\" x2=\"616\" y2=\"234.33\" stroke=\"var(--fig-warn)\" stroke-dasharray=\"5 4\" stroke-width=\"1.5\"/><text x=\"368\" y=\"228.33\" class=\"unity-gc-hitch-s\">16.7 ms budget</text><line x1=\"360\" y1=\"253.33\" x2=\"616\" y2=\"253.33\" stroke=\"var(--fig-ok)\" stroke-width=\"2\"/><text x=\"360\" y=\"308\" class=\"unity-gc-hitch-s\" text-anchor=\"middle\">0 s</text><text x=\"488\" y=\"308\" class=\"unity-gc-hitch-s\" text-anchor=\"middle\">10 s</text><text x=\"616\" y=\"308\" class=\"unity-gc-hitch-s\" text-anchor=\"middle\">20 s</text><line x1=\"360\" y1=\"62\" x2=\"360\" y2=\"290\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.55\" stroke-width=\"1.5\" class=\"unity-gc-hitch-ph\"/> </svg>"
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
          "type": "figure",
          "id": "unity-fake-null",
          "caption": "Destroy frees only the native side at end of frame; only Unity’s == operator notices, every plain C# null test still sees a live reference.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 326\" role=\"img\" aria-label=\"The fake null: after Destroy, the native object is freed at end of frame while the C# wrapper lives on, so enemy == null is true but ?., is null and ReferenceEquals still see a live reference.\"> <style>.unity-fake-null-t{font-size:14px;fill:var(--fig-ink)}.unity-fake-null-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-fake-null-s{font-size:13px;fill:var(--fig-muted)}.unity-fake-null-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-fake-null-s0{animation:unity-fake-null-s0 8s infinite}@keyframes unity-fake-null-s0{0%{opacity:1}46%{opacity:1}47.5%{opacity:0}86.5%{opacity:0}88%{opacity:1}100%{opacity:1}}.unity-fake-null-s1{animation:unity-fake-null-s1 8s infinite}@keyframes unity-fake-null-s1{0%{opacity:0}48.5%{opacity:0}50%{opacity:1}66%{opacity:1}67.5%{opacity:0}100%{opacity:0}}.unity-fake-null-s2{animation:unity-fake-null-s2 8s infinite}@keyframes unity-fake-null-s2{0%{opacity:0}67.5%{opacity:0}69%{opacity:1}85%{opacity:1}86.5%{opacity:0}100%{opacity:0}}.unity-fake-null-alive{animation:unity-fake-null-al 8s infinite}.unity-fake-null-dead{animation:unity-fake-null-de 8s infinite}@keyframes unity-fake-null-al{0%{opacity:0}47.5%{opacity:0}49%{opacity:1}85%{opacity:1}86.5%{opacity:0}100%{opacity:0}}@keyframes unity-fake-null-de{0%{opacity:1}46%{opacity:1}47.5%{opacity:0}86.5%{opacity:0}88%{opacity:1}100%{opacity:1}}</style> <defs><marker id=\"unity-fake-null-ar\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" fill=\"var(--fig-ink)\"/></marker></defs><text x=\"24\" y=\"28\" class=\"unity-fake-null-s\">C# (managed heap)</text><text x=\"372\" y=\"28\" class=\"unity-fake-null-s\">engine (native C++)</text><line x1=\"330\" y1=\"16\" x2=\"330\" y2=\"118\" stroke=\"var(--fig-line)\" stroke-dasharray=\"4 4\"/><rect x=\"24\" y=\"56\" width=\"92\" height=\"36\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"70\" y=\"79\" class=\"unity-fake-null-m\" text-anchor=\"middle\">enemy</text><line x1=\"116\" y1=\"74\" x2=\"150\" y2=\"74\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" marker-end=\"url(#unity-fake-null-ar)\"/><rect x=\"152\" y=\"46\" width=\"152\" height=\"56\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text x=\"228\" y=\"70\" class=\"unity-fake-null-t\" text-anchor=\"middle\">Enemy wrapper</text><text x=\"228\" y=\"90\" class=\"unity-fake-null-s\" text-anchor=\"middle\">still alive</text><g class=\"unity-fake-null-alive\" opacity=\"0\"><line x1=\"304\" y1=\"74\" x2=\"370\" y2=\"74\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" marker-end=\"url(#unity-fake-null-ar)\"/><rect x=\"372\" y=\"46\" width=\"220\" height=\"56\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-ok)\" stroke-width=\"1.5\"/><text x=\"482\" y=\"70\" class=\"unity-fake-null-t\" text-anchor=\"middle\">native Enemy object</text><text x=\"482\" y=\"90\" class=\"unity-fake-null-s\" text-anchor=\"middle\">alive</text></g><g class=\"unity-fake-null-dead\"><line x1=\"304\" y1=\"74\" x2=\"370\" y2=\"74\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"/><rect x=\"372\" y=\"46\" width=\"220\" height=\"56\" rx=\"10\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" stroke-dasharray=\"5 4\"/><text x=\"482\" y=\"70\" class=\"unity-fake-null-t\" text-anchor=\"middle\" style=\"fill:var(--fig-bad)\">native object freed</text><text x=\"482\" y=\"90\" class=\"unity-fake-null-s\" text-anchor=\"middle\">Destroy ran at end of frame</text></g><text x=\"320\" y=\"134\" class=\"unity-fake-null-t unity-fake-null-s0\" text-anchor=\"middle\" opacity=\"1\">After Destroy and end of frame: the wrapper outlives the native object</text><text x=\"320\" y=\"134\" class=\"unity-fake-null-t unity-fake-null-s1\" text-anchor=\"middle\" opacity=\"0\">Alive: the wrapper points at a live native object</text><text x=\"320\" y=\"134\" class=\"unity-fake-null-t unity-fake-null-s2\" text-anchor=\"middle\" opacity=\"0\">Destroy(enemy) called: native side survives until end of frame</text><text x=\"24\" y=\"168\" class=\"unity-fake-null-s\">Once the native object is freed:</text><rect x=\"16\" y=\"178\" width=\"608\" height=\"30\" rx=\"8\" fill=\"var(--fig-panel)\" fill-opacity=\"0.9\"/><text x=\"32\" y=\"198\" class=\"unity-fake-null-m\">enemy == null</text><circle cx=\"290\" cy=\"193\" r=\"4\" fill=\"var(--fig-ok)\"/><text x=\"302\" y=\"198\" class=\"unity-fake-null-t\">true: Unity’s == asks the engine</text><rect x=\"16\" y=\"214\" width=\"608\" height=\"30\" rx=\"8\" fill=\"var(--fig-panel)\" fill-opacity=\"0.4\"/><text x=\"32\" y=\"234\" class=\"unity-fake-null-m\">enemy?.TakeDamage()</text><circle cx=\"290\" cy=\"229\" r=\"4\" fill=\"var(--fig-bad)\"/><text x=\"302\" y=\"234\" class=\"unity-fake-null-t\">calls it: MissingReferenceException</text><rect x=\"16\" y=\"250\" width=\"608\" height=\"30\" rx=\"8\" fill=\"var(--fig-panel)\" fill-opacity=\"0.9\"/><text x=\"32\" y=\"270\" class=\"unity-fake-null-m\">enemy is null</text><circle cx=\"290\" cy=\"265\" r=\"4\" fill=\"var(--fig-bad)\"/><text x=\"302\" y=\"270\" class=\"unity-fake-null-t\">false: plain C# reference test</text><rect x=\"16\" y=\"286\" width=\"608\" height=\"30\" rx=\"8\" fill=\"var(--fig-panel)\" fill-opacity=\"0.4\"/><text x=\"32\" y=\"306\" class=\"unity-fake-null-m\">ReferenceEquals(enemy, null)</text><circle cx=\"290\" cy=\"301\" r=\"4\" fill=\"var(--fig-bad)\"/><text x=\"302\" y=\"306\" class=\"unity-fake-null-t\">false: plain C# reference test</text> </svg>"
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
          "type": "figure",
          "id": "unity-serialization-rules",
          "caption": "The serializer keeps public and [SerializeField] fields of supported types and silently skips everything else.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 376\" role=\"img\" aria-label=\"Unity serializer walking a class: public and [SerializeField] fields, auto-property backing fields, List and [Serializable] classes are saved; private, static, readonly, properties and Dictionary are skipped.\"> <style>.unity-serialization-rules-t{font-size:14px;fill:var(--fig-ink)}.unity-serialization-rules-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-serialization-rules-s{font-size:13px;fill:var(--fig-muted)}.unity-serialization-rules-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-serialization-rules-hl{animation:unity-serialization-rules-hl 8s step-end infinite}@keyframes unity-serialization-rules-hl{0%{transform:translateY(0px)}10%{transform:translateY(30px)}20%{transform:translateY(60px)}30%{transform:translateY(90px)}40%{transform:translateY(120px)}50%{transform:translateY(150px)}60%{transform:translateY(180px)}70%{transform:translateY(210px)}80%{transform:translateY(240px)}90%{transform:translateY(270px)}100%{transform:translateY(270px)}}</style> <text x=\"32\" y=\"28\" class=\"unity-serialization-rules-s\">field declaration</text><text x=\"436\" y=\"28\" class=\"unity-serialization-rules-s\">Unity serializer</text><rect x=\"16\" y=\"40\" width=\"608\" height=\"28\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.12\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" class=\"unity-serialization-rules-hl\"/><text x=\"32\" y=\"59\" class=\"unity-serialization-rules-m\">public float speed = 5;</text><circle cx=\"428\" cy=\"54\" r=\"4.5\" fill=\"var(--fig-ok)\"/><text x=\"440\" y=\"59\" class=\"unity-serialization-rules-t\">saved</text><rect x=\"16\" y=\"70\" width=\"608\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" fill-opacity=\"0.7\"/><text x=\"32\" y=\"89\" class=\"unity-serialization-rules-m\">[SerializeField] int ammo;</text><circle cx=\"428\" cy=\"84\" r=\"4.5\" fill=\"var(--fig-ok)\"/><text x=\"440\" y=\"89\" class=\"unity-serialization-rules-t\">saved: private but marked</text><text x=\"32\" y=\"119\" class=\"unity-serialization-rules-m\" style=\"fill:var(--fig-muted)\">int cache;</text><circle cx=\"428\" cy=\"114\" r=\"4.5\" fill=\"var(--fig-bad)\"/><text x=\"440\" y=\"119\" class=\"unity-serialization-rules-t\" style=\"fill:var(--fig-muted)\">skipped: private</text><rect x=\"16\" y=\"130\" width=\"608\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" fill-opacity=\"0.7\"/><text x=\"32\" y=\"149\" class=\"unity-serialization-rules-m\" style=\"fill:var(--fig-muted)\">public static int count;</text><circle cx=\"428\" cy=\"144\" r=\"4.5\" fill=\"var(--fig-bad)\"/><text x=\"440\" y=\"149\" class=\"unity-serialization-rules-t\" style=\"fill:var(--fig-muted)\">skipped: static</text><text x=\"32\" y=\"179\" class=\"unity-serialization-rules-m\" style=\"fill:var(--fig-muted)\">public readonly int max;</text><circle cx=\"428\" cy=\"174\" r=\"4.5\" fill=\"var(--fig-bad)\"/><text x=\"440\" y=\"179\" class=\"unity-serialization-rules-t\" style=\"fill:var(--fig-muted)\">skipped: readonly</text><rect x=\"16\" y=\"190\" width=\"608\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" fill-opacity=\"0.7\"/><text x=\"32\" y=\"209\" class=\"unity-serialization-rules-m\" style=\"fill:var(--fig-muted)\">public int Hp { get; set; }</text><circle cx=\"428\" cy=\"204\" r=\"4.5\" fill=\"var(--fig-bad)\"/><text x=\"440\" y=\"209\" class=\"unity-serialization-rules-t\" style=\"fill:var(--fig-muted)\">skipped: property</text><text x=\"32\" y=\"239\" class=\"unity-serialization-rules-m\">[field: SerializeField] int Armor { get; set; }</text><circle cx=\"428\" cy=\"234\" r=\"4.5\" fill=\"var(--fig-ok)\"/><text x=\"440\" y=\"239\" class=\"unity-serialization-rules-t\">saved: backing field</text><rect x=\"16\" y=\"250\" width=\"608\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" fill-opacity=\"0.7\"/><text x=\"32\" y=\"269\" class=\"unity-serialization-rules-m\" style=\"fill:var(--fig-muted)\">public Dictionary&lt;string, int&gt; map;</text><circle cx=\"428\" cy=\"264\" r=\"4.5\" fill=\"var(--fig-bad)\"/><text x=\"440\" y=\"269\" class=\"unity-serialization-rules-t\" style=\"fill:var(--fig-muted)\">skipped: Dictionary</text><text x=\"32\" y=\"299\" class=\"unity-serialization-rules-m\">public List&lt;Weapon&gt; loadout;</text><circle cx=\"428\" cy=\"294\" r=\"4.5\" fill=\"var(--fig-ok)\"/><text x=\"440\" y=\"299\" class=\"unity-serialization-rules-t\">saved: List&lt;T&gt;</text><rect x=\"16\" y=\"310\" width=\"608\" height=\"28\" rx=\"7\" fill=\"var(--fig-panel)\" fill-opacity=\"0.7\"/><text x=\"32\" y=\"329\" class=\"unity-serialization-rules-m\">public Weapon weapon;</text><circle cx=\"428\" cy=\"324\" r=\"4.5\" fill=\"var(--fig-ok)\"/><text x=\"440\" y=\"329\" class=\"unity-serialization-rules-t\">saved inline, by value</text><text x=\"32\" y=\"362\" class=\"unity-serialization-rules-s\">Weapon is a [Serializable] class: no null, no polymorphism, no shared references</text> </svg>"
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Profiler shows GC Alloc every frame and a periodic spike, with bullets or effects instantiated and destroyed constantly",
              "use": "Object pooling",
              "why": "Reuse instances with `UnityEngine.Pool.ObjectPool<T>` or your own pool; Instantiate/Destroy cost CPU and garbage. Pools hold memory and need careful state reset on reuse."
            },
            {
              "signal": "A label string is built with `+` or interpolation every frame",
              "use": "Rebuild strings only on change",
              "why": "Concatenation allocates a new string per call. Rebuild when the value changes, or format into a reused `StringBuilder`; the allocation then happens rarely instead of every frame."
            },
            {
              "signal": "`Physics.RaycastAll`, `GetComponents<T>()` or `mesh.vertices` is called in a hot path",
              "use": "Non-allocating API with reused buffer",
              "why": "These return fresh arrays each call. Use the `NonAlloc` variants or `List<T>` overloads with a preallocated buffer; size it for the worst case or results are silently truncated."
            },
            {
              "signal": "LINQ like `.Where().OrderBy().First()` runs in `Update` or per-frame AI code",
              "use": "Plain loops in hot paths",
              "why": "LINQ allocates enumerators and closures and hides O(n log n) sorts. Keep it for editor tools and load-time code; in per-frame code write the loop and track the best item yourself."
            },
            {
              "signal": "A coroutine loop does `yield return new WaitForSeconds(0.1f)` on every iteration",
              "use": "Cache yield instructions",
              "why": "Each `new` allocates. Store the `WaitForSeconds` in a field and reuse it; `null` and `WaitForEndOfFrame`-style instances can be shared too. Not needed for one-shot waits."
            },
            {
              "signal": "A lambda capturing a local or `this` is passed as a callback every frame",
              "use": "Cache the delegate",
              "why": "Capturing lambdas allocate a closure and delegate each time they are created. Create the delegate once in a field; non-capturing lambdas are already cached by the compiler."
            },
            {
              "signal": "A `Dictionary` keyed by a custom struct or enum shows GC Alloc on every lookup",
              "use": "`IEquatable<T>` on struct keys",
              "why": "Without it, equality falls back to `object.Equals` and boxes. Implement `IEquatable<T>` and `GetHashCode`, or pass a custom `IEqualityComparer<T>` to the dictionary."
            },
            {
              "signal": "`target?.Hit()` or `cached ?? fallback` misbehaves after the target object was destroyed",
              "use": "Unity null check: `==` or implicit bool",
              "why": "Destroyed objects are fake nulls that only Unity's overloaded `==` detects; `?.`, `??` and `is null` check the C# reference. Write `if (target) target.Hit();`."
            },
            {
              "signal": "A field typed as a base class or interface loses its subclass data after save or reload",
              "use": "`[SerializeReference]`",
              "why": "Stores the managed reference with its concrete type, so polymorphism, null and shared references survive. Costs a heavier format and breaks if the class is renamed without `[MovedFrom]`."
            },
            {
              "signal": "Renaming a serialized field resets its value on every prefab and scene",
              "use": "`[FormerlySerializedAs]`",
              "why": "The serializer matches data by field name; the attribute maps the old name to the new one. Keep it until every asset has been re-saved, then remove it."
            },
            {
              "signal": "You need a `Dictionary` editable in the Inspector, but the serializer drops it",
              "use": "Serialize as list, rebuild in callback",
              "why": "Store parallel lists or a list of key-value structs and rebuild the dictionary in `ISerializationCallbackReceiver.OnAfterDeserialize`. Duplicate keys must be handled explicitly."
            },
            {
              "signal": "With domain reload disabled, scores and event handlers from the last Play session reappear",
              "use": "Reset statics with `RuntimeInitializeOnLoadMethod`",
              "why": "Statics survive when the domain is not reloaded. Reset them in a method marked with `RuntimeInitializeLoadType.SubsystemRegistration`, which runs before scene load on every play."
            }
          ]
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
        },
        {
          "q": "A proximity sensor calls `Physics.RaycastAll` in `Update`, and the Profiler's hierarchy shows about 1 KB of GC Alloc per frame from that call. Which change removes the garbage?",
          "options": [
            "Call `GC.Collect()` at the end of each frame",
            "Filter the hits with LINQ into a new `List<T>`",
            "`RaycastNonAlloc` with a reused hit buffer",
            "Run the cast in a coroutine every frame"
          ],
          "answer": 2,
          "explain": "The NonAlloc variant writes into a buffer you reuse, so no array is created per call. Forcing `GC.Collect()` just trades steady garbage for a guaranteed main-thread stall."
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
          "type": "figure",
          "id": "unity-srp-batcher",
          "caption": "With the SRP Batcher, material constants stay on the GPU, so each draw uploads only its small per-object data.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 372\" role=\"img\" aria-label=\"Four draws using four materials of one shader variant: without the SRP Batcher each draw re-sends SetPass, material and object data; with it, material constants stay on the GPU and only per-object data is uploaded.\"> <style>.unity-srp-batcher-t{font-size:14px;fill:var(--fig-ink)}.unity-srp-batcher-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-srp-batcher-s{font-size:13px;fill:var(--fig-muted)}.unity-srp-batcher-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-srp-batcher-m0{animation:unity-srp-batcher-m0 7s infinite}@keyframes unity-srp-batcher-m0{0%{opacity:0}9.2%{opacity:0}10%{opacity:1}19%{opacity:1}19.8%{opacity:0}100%{opacity:0}}.unity-srp-batcher-m1{animation:unity-srp-batcher-m1 7s infinite}@keyframes unity-srp-batcher-m1{0%{opacity:0}29.2%{opacity:0}30%{opacity:1}39%{opacity:1}39.8%{opacity:0}100%{opacity:0}}.unity-srp-batcher-m2{animation:unity-srp-batcher-m2 7s infinite}@keyframes unity-srp-batcher-m2{0%{opacity:0}49.2%{opacity:0}50%{opacity:1}59%{opacity:1}59.8%{opacity:0}100%{opacity:0}}.unity-srp-batcher-m3{animation:unity-srp-batcher-m3 7s infinite}@keyframes unity-srp-batcher-m3{0%{opacity:0}69.2%{opacity:0}70%{opacity:1}79%{opacity:1}79.8%{opacity:0}100%{opacity:0}}.unity-srp-batcher-pl{animation:unity-srp-batcher-pl 7s infinite}.unity-srp-batcher-pr{animation:unity-srp-batcher-pr 7s infinite}.unity-srp-batcher-fl{animation:unity-srp-batcher-fl 7s infinite}.unity-srp-batcher-fr{animation:unity-srp-batcher-fl 7s infinite}@keyframes unity-srp-batcher-pl{0%{opacity:1;transform:translate(0,0)}13%{opacity:1;transform:translate(0,140px)}15%{opacity:0;transform:translate(0,140px)}15.1%{opacity:0;transform:translate(0,0)}20%{opacity:1;transform:translate(0,0)}33%{opacity:1;transform:translate(0,140px)}35%{opacity:0;transform:translate(0,140px)}35.1%{opacity:0;transform:translate(0,0)}40%{opacity:1;transform:translate(0,0)}53%{opacity:1;transform:translate(0,140px)}55%{opacity:0;transform:translate(0,140px)}55.1%{opacity:0;transform:translate(0,0)}60%{opacity:1;transform:translate(0,0)}73%{opacity:1;transform:translate(0,140px)}75%{opacity:0;transform:translate(0,140px)}75.1%{opacity:0;transform:translate(0,0)}99%{opacity:0;transform:translate(0,0)}100%{opacity:1;transform:translate(0,0)}}@keyframes unity-srp-batcher-pr{0%{opacity:1;transform:translate(0,0)}13%{opacity:1;transform:translate(0,180px)}15%{opacity:0;transform:translate(0,180px)}15.1%{opacity:0;transform:translate(0,0)}20%{opacity:1;transform:translate(0,0)}33%{opacity:1;transform:translate(0,180px)}35%{opacity:0;transform:translate(0,180px)}35.1%{opacity:0;transform:translate(0,0)}40%{opacity:1;transform:translate(0,0)}53%{opacity:1;transform:translate(0,180px)}55%{opacity:0;transform:translate(0,180px)}55.1%{opacity:0;transform:translate(0,0)}60%{opacity:1;transform:translate(0,0)}73%{opacity:1;transform:translate(0,180px)}75%{opacity:0;transform:translate(0,180px)}75.1%{opacity:0;transform:translate(0,0)}99%{opacity:0;transform:translate(0,0)}100%{opacity:1;transform:translate(0,0)}}@keyframes unity-srp-batcher-fl{0%{opacity:0}11.2%{opacity:0}12%{opacity:1}17%{opacity:1}17.8%{opacity:0}31.2%{opacity:0}32%{opacity:1}37%{opacity:1}37.8%{opacity:0}51.2%{opacity:0}52%{opacity:1}57%{opacity:1}57.8%{opacity:0}71.2%{opacity:0}72%{opacity:1}77%{opacity:1}77.8%{opacity:0}100%{opacity:0}}</style> <text x=\"164\" y=\"28\" class=\"unity-srp-batcher-b\" text-anchor=\"middle\">Without SRP Batcher</text><rect x=\"32\" y=\"44\" width=\"264\" height=\"40\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"164\" y=\"69\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">CPU: draws with materials A B C D</text><line x1=\"164\" y1=\"88\" x2=\"164\" y2=\"206\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 4\"/><rect x=\"32\" y=\"210\" width=\"264\" height=\"120\" rx=\"12\" fill=\"var(--fig-panel)\" fill-opacity=\"0.5\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><text x=\"46\" y=\"232\" class=\"unity-srp-batcher-s\">GPU</text><rect x=\"56\" y=\"244\" width=\"216\" height=\"70\" rx=\"8\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect x=\"56\" y=\"244\" width=\"216\" height=\"70\" rx=\"8\" fill=\"var(--fig-bad)\" fill-opacity=\"0.18\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" opacity=\"0\" class=\"unity-srp-batcher-fl\"/><text x=\"164\" y=\"274\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">material + per-object data</text><text x=\"164\" y=\"294\" class=\"unity-srp-batcher-s\" text-anchor=\"middle\">re-set for every draw</text><g class=\"unity-srp-batcher-pl\"><rect x=\"72\" y=\"92\" width=\"184\" height=\"26\" rx=\"7\" fill=\"var(--fig-bad)\" fill-opacity=\"0.2\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\"/><text x=\"164\" y=\"110\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">SetPass + material + object</text></g><text x=\"164\" y=\"356\" class=\"unity-srp-batcher-b\" text-anchor=\"middle\" style=\"fill:var(--fig-bad)\">4 draws = 4 full setups</text><text x=\"476\" y=\"28\" class=\"unity-srp-batcher-b\" text-anchor=\"middle\">SRP Batcher</text><rect x=\"344\" y=\"44\" width=\"264\" height=\"40\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text x=\"476\" y=\"69\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">CPU: draws with materials A B C D</text><line x1=\"476\" y1=\"88\" x2=\"476\" y2=\"206\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 4\"/><rect x=\"344\" y=\"210\" width=\"264\" height=\"120\" rx=\"12\" fill=\"var(--fig-panel)\" fill-opacity=\"0.5\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.4\" stroke-width=\"1.5\"/><text x=\"358\" y=\"232\" class=\"unity-srp-batcher-s\">GPU · UnityPerMaterial, persistent</text><rect x=\"362\" y=\"242\" width=\"50\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.15\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><rect x=\"362\" y=\"242\" width=\"50\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\" stroke=\"var(--fig-accent2)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-srp-batcher-m0\"/><text x=\"387\" y=\"262\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">A</text><rect x=\"422\" y=\"242\" width=\"50\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.15\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><rect x=\"422\" y=\"242\" width=\"50\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\" stroke=\"var(--fig-accent2)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-srp-batcher-m1\"/><text x=\"447\" y=\"262\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">B</text><rect x=\"482\" y=\"242\" width=\"50\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.15\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><rect x=\"482\" y=\"242\" width=\"50\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\" stroke=\"var(--fig-accent2)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-srp-batcher-m2\"/><text x=\"507\" y=\"262\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">C</text><rect x=\"542\" y=\"242\" width=\"50\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.15\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><rect x=\"542\" y=\"242\" width=\"50\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\" stroke=\"var(--fig-accent2)\" stroke-width=\"2.5\" opacity=\"0\" class=\"unity-srp-batcher-m3\"/><text x=\"567\" y=\"262\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">D</text><rect x=\"362\" y=\"284\" width=\"230\" height=\"30\" rx=\"7\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"362\" y=\"284\" width=\"230\" height=\"30\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" opacity=\"0\" class=\"unity-srp-batcher-fr\"/><text x=\"476\" y=\"304\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">UnityPerDraw, uploaded in bulk</text><g class=\"unity-srp-batcher-pr\"><rect x=\"416\" y=\"92\" width=\"120\" height=\"26\" rx=\"7\" fill=\"var(--fig-accent)\" fill-opacity=\"0.2\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text x=\"476\" y=\"110\" class=\"unity-srp-batcher-t\" text-anchor=\"middle\">per-object data</text></g><text x=\"476\" y=\"356\" class=\"unity-srp-batcher-b\" text-anchor=\"middle\" style=\"fill:var(--fig-ok)\">1 SetPass, 4 fast draws in one batch</text> </svg>"
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
          "type": "figure",
          "id": "unity-batching-compared",
          "caption": "Static batching, dynamic batching and instancing merge work into one draw; the SRP Batcher keeps separate draws but makes them cheap.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 362\" role=\"img\" aria-label=\"Four batching techniques compared: static and dynamic batching merge different meshes into one draw, GPU instancing draws one mesh many times in one call, and the SRP Batcher keeps separate draws but needs only one SetPass.\"> <style>.unity-batching-compared-t{font-size:14px;fill:var(--fig-ink)}.unity-batching-compared-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-batching-compared-s{font-size:13px;fill:var(--fig-muted)}.unity-batching-compared-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-batching-compared-i0{animation:unity-batching-compared-i0 6s ease-in-out infinite}@keyframes unity-batching-compared-i0{0%{transform:translateX(0)}15%{transform:translateX(0)}35%{transform:translateX(27px)}80%{transform:translateX(27px)}95%{transform:translateX(0)}100%{transform:translateX(0)}}.unity-batching-compared-i1{animation:unity-batching-compared-i1 6s ease-in-out infinite}@keyframes unity-batching-compared-i1{0%{transform:translateX(0)}15%{transform:translateX(0)}35%{transform:translateX(9px)}80%{transform:translateX(9px)}95%{transform:translateX(0)}100%{transform:translateX(0)}}.unity-batching-compared-i2{animation:unity-batching-compared-i2 6s ease-in-out infinite}@keyframes unity-batching-compared-i2{0%{transform:translateX(0)}15%{transform:translateX(0)}35%{transform:translateX(-9px)}80%{transform:translateX(-9px)}95%{transform:translateX(0)}100%{transform:translateX(0)}}.unity-batching-compared-i3{animation:unity-batching-compared-i3 6s ease-in-out infinite}@keyframes unity-batching-compared-i3{0%{transform:translateX(0)}15%{transform:translateX(0)}35%{transform:translateX(-27px)}80%{transform:translateX(-27px)}95%{transform:translateX(0)}100%{transform:translateX(0)}}.unity-batching-compared-box{animation:unity-batching-compared-box 6s infinite}@keyframes unity-batching-compared-box{0%{opacity:0}34%{opacity:0}36%{opacity:1}80%{opacity:1}82%{opacity:0}100%{opacity:0}}</style> <defs><marker id=\"unity-batching-compared-ar\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" fill=\"var(--fig-muted)\"/></marker></defs><text x=\"264\" y=\"22\" class=\"unity-batching-compared-s\" text-anchor=\"middle\">separate renderers</text><text x=\"392\" y=\"22\" class=\"unity-batching-compared-s\">what the CPU submits</text><text x=\"16\" y=\"61\" class=\"unity-batching-compared-b\">Static batching</text><text x=\"16\" y=\"79\" class=\"unity-batching-compared-s\">Batching Static objects</text><rect x=\"202\" y=\"44\" width=\"124\" height=\"40\" rx=\"10\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-batching-compared-box\"/><g class=\"unity-batching-compared-i0\"><rect x=\"180\" y=\"52\" width=\"24\" height=\"24\" rx=\"4\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/></g><g class=\"unity-batching-compared-i1\"><circle cx=\"240\" cy=\"64\" r=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/></g><g class=\"unity-batching-compared-i2\"><path d=\"M288 52L300 76H276Z\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/></g><g class=\"unity-batching-compared-i3\"><path d=\"M336 52L348 64L336 76L324 64Z\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/></g><line x1=\"364\" y1=\"64\" x2=\"384\" y2=\"64\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-batching-compared-ar)\"/><text x=\"392\" y=\"61\" class=\"unity-batching-compared-b\">1 draw over combined buffers</text><text x=\"392\" y=\"79\" class=\"unity-batching-compared-s\">built at build time, cannot move</text><line x1=\"16\" y1=\"107\" x2=\"624\" y2=\"107\" stroke=\"var(--fig-line)\"/><text x=\"16\" y=\"147\" class=\"unity-batching-compared-b\">Dynamic batching</text><text x=\"16\" y=\"165\" class=\"unity-batching-compared-s\">small meshes</text><rect x=\"202\" y=\"130\" width=\"124\" height=\"40\" rx=\"10\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-batching-compared-box\"/><g class=\"unity-batching-compared-i0\"><rect x=\"183\" y=\"141\" width=\"18\" height=\"18\" rx=\"4\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/></g><g class=\"unity-batching-compared-i1\"><circle cx=\"240\" cy=\"150\" r=\"9\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/></g><g class=\"unity-batching-compared-i2\"><path d=\"M288 141L297 159H279Z\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/></g><g class=\"unity-batching-compared-i3\"><path d=\"M336 141L345 150L336 159L327 150Z\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/></g><line x1=\"364\" y1=\"150\" x2=\"384\" y2=\"150\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-batching-compared-ar)\"/><text x=\"392\" y=\"147\" class=\"unity-batching-compared-b\">1 draw, rebuilt every frame</text><text x=\"392\" y=\"165\" class=\"unity-batching-compared-s\">CPU vertex work, off in URP</text><line x1=\"16\" y1=\"193\" x2=\"624\" y2=\"193\" stroke=\"var(--fig-line)\"/><text x=\"16\" y=\"233\" class=\"unity-batching-compared-b\">GPU instancing</text><text x=\"16\" y=\"251\" class=\"unity-batching-compared-s\">same mesh + material</text><rect x=\"202\" y=\"216\" width=\"124\" height=\"40\" rx=\"10\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-width=\"2\" opacity=\"0\" class=\"unity-batching-compared-box\"/><g class=\"unity-batching-compared-i0\"><circle cx=\"192\" cy=\"236\" r=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.2\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/></g><g class=\"unity-batching-compared-i1\"><circle cx=\"240\" cy=\"236\" r=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.45\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/></g><g class=\"unity-batching-compared-i2\"><circle cx=\"288\" cy=\"236\" r=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.7\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/></g><g class=\"unity-batching-compared-i3\"><circle cx=\"336\" cy=\"236\" r=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.95\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/></g><line x1=\"364\" y1=\"236\" x2=\"384\" y2=\"236\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-batching-compared-ar)\"/><text x=\"392\" y=\"233\" class=\"unity-batching-compared-b\">1 instanced call</text><text x=\"392\" y=\"251\" class=\"unity-batching-compared-s\">per-instance transform, colour</text><line x1=\"16\" y1=\"279\" x2=\"624\" y2=\"279\" stroke=\"var(--fig-line)\"/><text x=\"16\" y=\"319\" class=\"unity-batching-compared-b\">SRP Batcher</text><text x=\"16\" y=\"337\" class=\"unity-batching-compared-s\">same shader variant</text><rect x=\"178\" y=\"296\" width=\"182\" height=\"52\" rx=\"12\" fill=\"none\" stroke=\"var(--fig-ok)\" stroke-width=\"2\" stroke-dasharray=\"5 4\" opacity=\"0\" class=\"unity-batching-compared-box\"/><rect x=\"180\" y=\"310\" width=\"24\" height=\"24\" rx=\"5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"228\" y=\"310\" width=\"24\" height=\"24\" rx=\"5\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.25\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><rect x=\"276\" y=\"310\" width=\"24\" height=\"24\" rx=\"5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.6\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><rect x=\"324\" y=\"310\" width=\"24\" height=\"24\" rx=\"5\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.6\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><line x1=\"364\" y1=\"322\" x2=\"384\" y2=\"322\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" marker-end=\"url(#unity-batching-compared-ar)\"/><text x=\"392\" y=\"319\" class=\"unity-batching-compared-b\">4 draws, 1 SetPass</text><text x=\"392\" y=\"337\" class=\"unity-batching-compared-s\">materials stay on the GPU</text> </svg>"
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
          "type": "figure",
          "id": "unity-shader-variants",
          "caption": "Each binary multi_compile keyword doubles the variant count: ten keywords fill all 1,024 squares.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 350\" role=\"img\" aria-label=\"Each binary multi_compile keyword doubles the variants of a pass: ten keywords give 1,024 variants, shown as a 32 by 32 grid filling up.\"> <style>.unity-shader-variants-t{font-size:14px;fill:var(--fig-ink)}.unity-shader-variants-b{font-size:14px;font-weight:600;fill:var(--fig-ink)}.unity-shader-variants-s{font-size:13px;fill:var(--fig-muted)}.unity-shader-variants-m{font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.unity-shader-variants-k1{animation:unity-shader-variants-k1 8s infinite}@keyframes unity-shader-variants-k1{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}21.2%{opacity:0}22%{opacity:1}100%{opacity:1}}.unity-shader-variants-k2{animation:unity-shader-variants-k2 8s infinite}@keyframes unity-shader-variants-k2{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}28.2%{opacity:0}29%{opacity:1}100%{opacity:1}}.unity-shader-variants-k3{animation:unity-shader-variants-k3 8s infinite}@keyframes unity-shader-variants-k3{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}35.2%{opacity:0}36%{opacity:1}100%{opacity:1}}.unity-shader-variants-k4{animation:unity-shader-variants-k4 8s infinite}@keyframes unity-shader-variants-k4{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}42.2%{opacity:0}43%{opacity:1}100%{opacity:1}}.unity-shader-variants-k5{animation:unity-shader-variants-k5 8s infinite}@keyframes unity-shader-variants-k5{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}49.2%{opacity:0}50%{opacity:1}100%{opacity:1}}.unity-shader-variants-k6{animation:unity-shader-variants-k6 8s infinite}@keyframes unity-shader-variants-k6{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}56.2%{opacity:0}57%{opacity:1}100%{opacity:1}}.unity-shader-variants-k7{animation:unity-shader-variants-k7 8s infinite}@keyframes unity-shader-variants-k7{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}63.2%{opacity:0}64%{opacity:1}100%{opacity:1}}.unity-shader-variants-k8{animation:unity-shader-variants-k8 8s infinite}@keyframes unity-shader-variants-k8{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}70.2%{opacity:0}71%{opacity:1}100%{opacity:1}}.unity-shader-variants-k9{animation:unity-shader-variants-k9 8s infinite}@keyframes unity-shader-variants-k9{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}77.2%{opacity:0}78%{opacity:1}100%{opacity:1}}.unity-shader-variants-k10{animation:unity-shader-variants-k10 8s infinite}@keyframes unity-shader-variants-k10{0%{opacity:1}12%{opacity:1}12.8%{opacity:0}84.2%{opacity:0}85%{opacity:1}100%{opacity:1}}.unity-shader-variants-c0{animation:unity-shader-variants-c0 8s infinite}@keyframes unity-shader-variants-c0{0%{opacity:0}12.4%{opacity:0}13%{opacity:1}22%{opacity:1}22.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c1{animation:unity-shader-variants-c1 8s infinite}@keyframes unity-shader-variants-c1{0%{opacity:0}21.4%{opacity:0}22%{opacity:1}29%{opacity:1}29.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c2{animation:unity-shader-variants-c2 8s infinite}@keyframes unity-shader-variants-c2{0%{opacity:0}28.4%{opacity:0}29%{opacity:1}36%{opacity:1}36.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c3{animation:unity-shader-variants-c3 8s infinite}@keyframes unity-shader-variants-c3{0%{opacity:0}35.4%{opacity:0}36%{opacity:1}43%{opacity:1}43.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c4{animation:unity-shader-variants-c4 8s infinite}@keyframes unity-shader-variants-c4{0%{opacity:0}42.4%{opacity:0}43%{opacity:1}50%{opacity:1}50.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c5{animation:unity-shader-variants-c5 8s infinite}@keyframes unity-shader-variants-c5{0%{opacity:0}49.4%{opacity:0}50%{opacity:1}57%{opacity:1}57.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c6{animation:unity-shader-variants-c6 8s infinite}@keyframes unity-shader-variants-c6{0%{opacity:0}56.4%{opacity:0}57%{opacity:1}64%{opacity:1}64.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c7{animation:unity-shader-variants-c7 8s infinite}@keyframes unity-shader-variants-c7{0%{opacity:0}63.4%{opacity:0}64%{opacity:1}71%{opacity:1}71.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c8{animation:unity-shader-variants-c8 8s infinite}@keyframes unity-shader-variants-c8{0%{opacity:0}70.4%{opacity:0}71%{opacity:1}78%{opacity:1}78.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c9{animation:unity-shader-variants-c9 8s infinite}@keyframes unity-shader-variants-c9{0%{opacity:0}77.4%{opacity:0}78%{opacity:1}85%{opacity:1}85.6%{opacity:0}100%{opacity:0}}.unity-shader-variants-c10{animation:unity-shader-variants-c10 8s infinite}@keyframes unity-shader-variants-c10{0%{opacity:1}12%{opacity:1}12.6%{opacity:0}84.4%{opacity:0}85%{opacity:1}100%{opacity:1}}</style> <defs><pattern id=\"unity-shader-variants-off\" x=\"352\" y=\"48\" width=\"8\" height=\"8\" patternUnits=\"userSpaceOnUse\"><rect width=\"7\" height=\"7\" rx=\"1.5\" fill=\"var(--fig-line)\"/></pattern><pattern id=\"unity-shader-variants-on\" x=\"352\" y=\"48\" width=\"8\" height=\"8\" patternUnits=\"userSpaceOnUse\"><rect width=\"7\" height=\"7\" rx=\"1.5\" fill=\"var(--fig-accent)\"/></pattern></defs><text x=\"16\" y=\"30\" class=\"unity-shader-variants-s\">multi_compile keywords (binary)</text><text x=\"352\" y=\"30\" class=\"unity-shader-variants-s\">variants per pass, one square each</text><rect x=\"352\" y=\"48\" width=\"256\" height=\"256\" fill=\"url(#unity-shader-variants-off)\"/><rect x=\"352\" y=\"48\" width=\"8\" height=\"8\" fill=\"url(#unity-shader-variants-on)\"/><rect x=\"16\" y=\"46\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k1\"><rect x=\"16\" y=\"46\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"54\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"59\" class=\"unity-shader-variants-m\">FOG_ON</text><rect x=\"360\" y=\"48\" width=\"8\" height=\"8\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k1\"/><rect x=\"16\" y=\"72\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k2\"><rect x=\"16\" y=\"72\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"80\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"85\" class=\"unity-shader-variants-m\">DETAIL_ON</text><rect x=\"368\" y=\"48\" width=\"16\" height=\"8\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k2\"/><rect x=\"16\" y=\"98\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k3\"><rect x=\"16\" y=\"98\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"106\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"111\" class=\"unity-shader-variants-m\">_NORMALMAP</text><rect x=\"384\" y=\"48\" width=\"32\" height=\"8\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k3\"/><rect x=\"16\" y=\"124\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k4\"><rect x=\"16\" y=\"124\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"132\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"137\" class=\"unity-shader-variants-m\">_EMISSION</text><rect x=\"416\" y=\"48\" width=\"64\" height=\"8\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k4\"/><rect x=\"16\" y=\"150\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k5\"><rect x=\"16\" y=\"150\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"158\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"163\" class=\"unity-shader-variants-m\">_ALPHATEST_ON</text><rect x=\"480\" y=\"48\" width=\"128\" height=\"8\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k5\"/><rect x=\"16\" y=\"176\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k6\"><rect x=\"16\" y=\"176\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"184\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"189\" class=\"unity-shader-variants-m\">LIGHTMAP_ON</text><rect x=\"352\" y=\"56\" width=\"256\" height=\"8\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k6\"/><rect x=\"16\" y=\"202\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k7\"><rect x=\"16\" y=\"202\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"210\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"215\" class=\"unity-shader-variants-m\">_SHADOWS_SOFT</text><rect x=\"352\" y=\"64\" width=\"256\" height=\"16\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k7\"/><rect x=\"16\" y=\"228\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k8\"><rect x=\"16\" y=\"228\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"236\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"241\" class=\"unity-shader-variants-m\">_ADDITIONAL_LIGHTS</text><rect x=\"352\" y=\"80\" width=\"256\" height=\"32\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k8\"/><rect x=\"16\" y=\"254\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k9\"><rect x=\"16\" y=\"254\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"262\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"267\" class=\"unity-shader-variants-m\">DIRLIGHTMAP_COMBINED</text><rect x=\"352\" y=\"112\" width=\"256\" height=\"64\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k9\"/><rect x=\"16\" y=\"280\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><g class=\"unity-shader-variants-k10\"><rect x=\"16\" y=\"280\" width=\"30\" height=\"16\" rx=\"8\" fill=\"var(--fig-accent)\"/><circle cx=\"38\" cy=\"288\" r=\"5\" fill=\"var(--fig-bg)\"/></g><text x=\"56\" y=\"293\" class=\"unity-shader-variants-m\">_SPECULAR_SETUP</text><rect x=\"352\" y=\"176\" width=\"256\" height=\"128\" fill=\"url(#unity-shader-variants-on)\" class=\"unity-shader-variants-k10\"/><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c0\" font-size=\"17\" opacity=\"0\">0 keywords → 1 variant</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c1\" font-size=\"17\" opacity=\"0\">1 keyword → 2 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c2\" font-size=\"17\" opacity=\"0\">2 keywords → 4 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c3\" font-size=\"17\" opacity=\"0\">3 keywords → 8 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c4\" font-size=\"17\" opacity=\"0\">4 keywords → 16 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c5\" font-size=\"17\" opacity=\"0\">5 keywords → 32 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c6\" font-size=\"17\" opacity=\"0\">6 keywords → 64 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c7\" font-size=\"17\" opacity=\"0\">7 keywords → 128 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c8\" font-size=\"17\" opacity=\"0\">8 keywords → 256 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c9\" font-size=\"17\" opacity=\"0\">9 keywords → 512 variants</text><text x=\"16\" y=\"336\" class=\"unity-shader-variants-b unity-shader-variants-c10\" font-size=\"17\" opacity=\"1\">10 keywords → 1,024 variants</text><text x=\"352\" y=\"330\" class=\"unity-shader-variants-s\">10 binary keywords: 2¹⁰ = 1,024</text> </svg>"
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Frame time is too high and you do not yet know whether the CPU, render thread or GPU is the limit",
              "use": "Find the bound first",
              "why": "Compare main thread, render thread and GPU times before changing anything. Cutting draw calls does nothing for a GPU-bound frame; cutting shader cost does nothing for a CPU-bound one."
            },
            {
              "signal": "Hundreds of SetPass calls; objects use many materials on a legacy or hand-written shader",
              "use": "SRP Batcher compatible shaders",
              "why": "Put material properties in `CBUFFER_START(UnityPerMaterial)` so objects sharing a shader variant skip per-draw setup. Gains come from fewer variants, not necessarily fewer materials."
            },
            {
              "signal": "Per-object colours are set through `MaterialPropertyBlock` and render CPU cost goes up",
              "use": "Shared material variants instead of MPBs",
              "why": "Renderers with a property block drop out of the SRP Batcher. Use a few shared materials, or encode variation in vertex colour or a texture. MPBs remain fine for Built-in or instanced paths."
            },
            {
              "signal": "Thousands of copies of one mesh and material (grass, rocks, crowds) need drawing",
              "use": "GPU instancing",
              "why": "One draw call renders many instances with per-instance data, ideally via `Graphics.RenderMeshInstanced` or indirect drawing. Loses per-object culling and LOD unless you implement them."
            },
            {
              "signal": "Many non-moving props share a few materials and draw calls dominate the CPU",
              "use": "Static batching",
              "why": "Combines static meshes into big buffers drawn with fewer state changes. Costs extra memory for the combined copies and the objects can never move."
            },
            {
              "signal": "A Unity 6 URP scene has many GameObject renderers and CPU draw submission is the bottleneck",
              "use": "GPU Resident Drawer",
              "why": "Moves draw submission for eligible renderers to GPU-driven instanced paths, cutting CPU cost. Requires Forward+ and compatible shaders; check the manual for current constraints."
            },
            {
              "signal": "Distant objects with full-detail meshes inflate vertex count and GPU time",
              "use": "LOD Group",
              "why": "Swaps to cheaper meshes as screen size shrinks, culling at the end. Costs authoring time and memory for each level; cross-fade hides popping at extra shader cost."
            },
            {
              "signal": "Dense interiors where walls hide most objects, yet the frame still draws everything in the frustum",
              "use": "Occlusion culling",
              "why": "Baked visibility data skips hidden renderers. Costs bake time and memory, and gives little in open scenes where most things are visible anyway."
            },
            {
              "signal": "Many small sprites or UI images each use their own texture and break batching",
              "use": "Sprite Atlas",
              "why": "Packing into one texture lets them share a material and batch. Costs atlas memory for every sprite in it, so group atlases by screen or level, not the whole game."
            },
            {
              "signal": "Build size and shader compile time explode; a shader has many `multi_compile` keywords",
              "use": "Shader variant stripping",
              "why": "Variants multiply per keyword. Use `shader_feature` for material toggles, strip unused variants, and prewarm needed ones. Over-stripping causes missing or pink materials at runtime."
            },
            {
              "signal": "Static scenery is lit well by lightmaps but moving characters look flat and unlit",
              "use": "Light probes or Adaptive Probe Volumes",
              "why": "Probes sample baked light in space so dynamic objects receive matching indirect light. Probes need placement or volume setup and do not capture sharp shadows."
            },
            {
              "signal": "Mobile frame is GPU bound with many realtime lights and shadows on geometry that never moves",
              "use": "Bake static lighting",
              "why": "Lightmaps move lighting cost to build time, leaving few realtime lights. Costs lightmap memory and bake iteration time, and baked lights cannot change at runtime."
            }
          ]
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
        },
        {
          "q": "A meadow has 8,000 copies of one grass mesh sharing one material. The render thread is the bottleneck, the GPU is mostly idle, and the objects must keep varying scale. What should you reach for?",
          "options": [
            "Static batching of all the grass meshes",
            "Occlusion culling baked for the whole meadow",
            "A LOD Group added to every single blade",
            "GPU instancing with `RenderMeshInstanced`"
          ],
          "answer": 3,
          "explain": "Instancing draws many copies of one mesh and material in a few calls with per-instance data. Occlusion culling gives little in an open field where most blades are visible anyway."
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Rigidbody forces applied in `Update` feel stronger at high frame rates and weaker at low ones",
              "use": "Apply forces in FixedUpdate",
              "why": "Physics steps on a fixed timestep, so forces applied there are frame rate independent. Read input in Update; only the application of forces moves to FixedUpdate."
            },
            {
              "signal": "`WasPressedThisFrame()` checked in `FixedUpdate` misses jumps at high frame rates",
              "use": "Latch input in Update, consume in FixedUpdate",
              "why": "FixedUpdate may not run on the frame the press happened. Set a flag in Update and clear it after the physics step uses it, so no one-frame event is lost."
            },
            {
              "signal": "A follow camera shows a Rigidbody stuttering, especially on high refresh displays",
              "use": "Rigidbody interpolation",
              "why": "Interpolate renders the body between physics steps, so motion is smooth at any frame rate. Adds up to one fixed step of visual latency; use it on player-visible bodies, not everything."
            },
            {
              "signal": "Fast bullets or balls pass through thin walls between physics steps",
              "use": "Raycast or continuous collision detection",
              "why": "For hitscan-like bullets, raycast along the path each step. For physical objects use continuous detection modes, which cost more and should be limited to the few fast bodies."
            },
            {
              "signal": "A platform moved by `transform.position` jitters riders and misses trigger events",
              "use": "Kinematic Rigidbody + `MovePosition`",
              "why": "A moving collider without a Rigidbody is treated as static and is expensive to move. A kinematic body moved in FixedUpdate interacts correctly and carries riders."
            },
            {
              "signal": "Raycasts hit the player's own collider or triggers, and broadphase cost is high in crowded scenes",
              "use": "Layers, LayerMask and the collision matrix",
              "why": "Disable layer pairs that never interact and pass a LayerMask to queries. This removes bugs and broadphase work; keep layer usage documented since there are only 32."
            },
            {
              "signal": "Gameplay code polls `Keyboard.current.spaceKey` directly and now needs gamepad support and rebinding",
              "use": "Input System actions",
              "why": "Code reads a `Jump` action; bindings for keyboard, gamepad and touch live in the asset and can be rebound. Costs some setup and an indirection when debugging a binding."
            },
            {
              "signal": "Menu and gameplay both react to the same button, causing double actions when a menu is open",
              "use": "Separate action maps per context",
              "why": "Enable the `UI` map and disable `Gameplay` when a menu opens. Context switches become explicit; forget to re-enable a map and input appears dead."
            },
            {
              "signal": "Animation logic is a nest of bools and `Play(\"Run\")` calls with fragile transitions",
              "use": "Animator state machine driven by parameters",
              "why": "Code only sets parameters like Speed and Grounded; the Animator owns states and blends. Hash names with `Animator.StringToHash` once, as string lookups each frame waste CPU."
            },
            {
              "signal": "A cutscene must sync camera moves, animations, audio and events to exact times",
              "use": "Timeline",
              "why": "Authored sequences belong in a Timeline asset with tracks, not in coroutines of waits. Use the Animator for reactive state; both run on Playables and can be combined."
            },
            {
              "signal": "Feet slide because the code-driven move speed disagrees with the walk animation's stride",
              "use": "Root motion",
              "why": "Let the animation drive displacement, optionally through `OnAnimatorMove`, so feet stay planted. Costs responsiveness and precise control; many action games scale animation speed instead."
            },
            {
              "signal": "Hundreds of off-screen NPC Animators still show up as CPU cost in the profiler",
              "use": "Animator culling mode",
              "why": "Set culling to skip updates when renderers are not visible. Watch for gameplay that reads bone positions or animation events off-screen, which then stop updating."
            }
          ]
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
        },
        {
          "q": "Opening the inventory with `I` leaves the Jump and Fire bindings live, so clicking an item also shoots and Space jumps the character. What is the cleanest fix?",
          "options": [
            "Enable the UI map, disable the Gameplay map",
            "Check a `menuOpen` bool in every gameplay script",
            "Rebind Jump and Fire while the menu is open",
            "Poll `Keyboard.current` in the menu code instead"
          ],
          "answer": 0,
          "explain": "Swapping maps makes the context switch explicit in one place. Scattered `menuOpen` checks work at first but each new gameplay script can forget one."
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Button handlers modify game state directly and UI scripts read player fields, so screens break when gameplay changes",
              "use": "MVP: presenter between view and model",
              "why": "The view only displays and raises input events; a presenter talks to game state. Views become swappable and logic testable without UI. Costs one extra class per screen."
            },
            {
              "signal": "A UI Toolkit screen has dozens of fields that must mirror a settings or inventory object",
              "use": "UI Toolkit runtime data binding",
              "why": "Bind elements to a data source with the MVVM pattern instead of hand-written sync code. Version dependent and adds binding overhead; for a few labels, direct updates are simpler."
            },
            {
              "signal": "The HUD polls player health, ammo and score in `Update` and rewrites labels every frame",
              "use": "Observer: update HUD on change events",
              "why": "Model raises `HealthChanged`; the HUD updates only then, avoiding per-frame rebuilds and allocations. Unsubscribe when the HUD is disabled or destroyed."
            },
            {
              "signal": "Back button behaviour is a tangle of ifs over which panels are open, and popups sometimes stack wrongly",
              "use": "Screen stack navigation",
              "why": "Push screens on open, pop on back; the top screen gets input and focus. Model the outer flow (title, loading, in-game) as a small state machine above the stack."
            },
            {
              "signal": "Profiler shows `Canvas.BuildBatch` every frame; a big static HUD shares a Canvas with a ticking timer",
              "use": "Split canvases by update frequency",
              "why": "A dirty element re-batches its whole Canvas. Put frequently changing elements on a nested Canvas of their own. Each extra Canvas adds draw calls, so do not split per element."
            },
            {
              "signal": "A ScrollRect with 1,000 instantiated rows takes seconds to open and scrolls slowly",
              "use": "Virtualised list with recycled items",
              "why": "Create only the visible rows and rebind them as they scroll; UI Toolkit `ListView` virtualises this way. Costs more complex item code, and variable row heights are harder."
            },
            {
              "signal": "Changing one text causes a spike in layout rebuilds through nested Layout Groups and Content Size Fitters",
              "use": "Anchors instead of nested Layout Groups",
              "why": "Layout Groups cascade rebuilds up to the root. Use anchors for fixed layouts and keep Layout Groups for truly dynamic lists, ideally one level deep."
            },
            {
              "signal": "Opening a menu with `SetActive(true)` causes a frame spike on a large panel",
              "use": "Toggle the Canvas component to show and hide",
              "why": "Disabling the Canvas stops drawing but keeps its geometry and layout, so re-showing is cheap. Scripts on it keep running, so pause their Update logic yourself."
            },
            {
              "signal": "Clicks are swallowed by an invisible overlay, or GraphicRaycaster shows up in the profiler",
              "use": "Raycast Target only on interactive graphics",
              "why": "Every Graphic with Raycast Target on is tested on input and can block clicks beneath it. Turn it off on decorative images and text; use `CanvasGroup.blocksRaycasts` for whole panels."
            },
            {
              "signal": "A TextMeshPro score label is set with string concatenation every frame and Auto Size is on",
              "use": "TMP `SetText` with numbers, Auto Size off",
              "why": "`SetText(\"Score: {0}\", score)` formats without a string allocation, and fixed sizes avoid repeated layout passes. Update only when the value actually changes."
            },
            {
              "signal": "You need a quick debug overlay or editor tool and do not want to build prefabs or UXML",
              "use": "Immediate mode UI (IMGUI)",
              "why": "IMGUI rebuilds the UI from code each call, so it is fast to write and has no asset state. It allocates and redraws every frame, so keep it out of shipping player UI, which suits retained mode."
            },
            {
              "signal": "HUD elements clip under phone notches or stretch on ultrawide screens",
              "use": "Anchors, Canvas Scaler and safe area",
              "why": "Anchor to edges, scale with a reference resolution, and inset a root rect by `Screen.safeArea`. Test multiple aspect ratios early; fixed pixel positions fail on the first new device."
            }
          ]
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
        },
        {
          "q": "The Back button logic is a tangle of ifs over which panels are open, and sometimes a settings popup opens behind the shop instead of on top. Which approach fits best?",
          "options": [
            "Keep an `isOpen` bool per panel and check in order",
            "Screen stack: push on open, pop on back",
            "Toggle each panel's Canvas component on and off",
            "Bind each panel to a UI Toolkit data source"
          ],
          "answer": 1,
          "explain": "A stack gives one rule: the top screen gets input and Back pops it. Per-panel bools just recreate the ordering ifs you have now."
        }
      ]
    },
    {
      "id": "unity-accessibility-localization",
      "title": "Accessibility and localization",
      "minutes": 15,
      "summary": "Designing Unity games that more players can perceive, control and understand, and that ship in many languages without retrofits: colour, input, subtitles, screen readers, string tables, plurals, fonts and pseudo-localization.",
      "lesson": [
        {
          "type": "p",
          "text": "A co-op shooter launches in twelve languages. Within a week the reviews say: colour-blind players cannot tell squad markers from enemy markers, the German shop buttons read `Kaufe…`, Japanese players see empty boxes in chat, and a German player's save file fails to load because `3,5` will not parse as a float. None of these are hard problems on day one. All of them are expensive after launch, because the decisions behind them (state encoded only in colour, text baked into prefabs, fonts that only cover Latin, culture-dependent parsing) are spread through every screen of the game."
        },
        {
          "type": "h",
          "text": "Why accessibility matters"
        },
        {
          "type": "p",
          "text": "Accessibility is about who can finish your game. Roughly 1 in 12 men and 1 in 200 women have some form of colour vision deficiency, many players have reduced hearing, limited grip strength or tremor, and far more have situational limits: playing one-handed, on a bus with the sound off, or tired after work. Subtitles are a good example of an accessibility feature most players turn on. There is also outside pressure. Platform holders publish guidance such as the **Xbox Accessibility Guidelines**, store pages increasingly surface accessibility features to buyers (Apple's App Store has accessibility labels on product pages), and law reaches parts of games: in the US the CVAA covers in-game communication such as text and voice chat, and the European Accessibility Act covers things like e-commerce flows. Treat the specifics as something to check with your platform and legal contacts per release, not as a fixed checklist."
        },
        {
          "type": "h",
          "text": "Visual: colour, contrast, text and subtitles"
        },
        {
          "type": "p",
          "text": "The core rule is **never use colour alone** to carry information. Red-green deficiencies (deuteranopia, protanopia) are the most common, so red-for-enemy and green-for-friend is exactly the pair that fails. Add a second channel: shape, icon, pattern, position or a text label. Colour-blind filter modes that recolour the screen are a useful extra, but they are a patch over a design that already lost information; a shape-coded HUD works for everyone without a setting."
        },
        {
          "type": "figure",
          "id": "unity-a11y-colour-only",
          "caption": "Under simulated deuteranopia the red and green markers collapse into one colour; the shape-coded radar still tells allies from enemies.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A radar HUD shown under simulated deuteranopia and normal vision. When allies and enemies differ only by red and green they become identical; when allies are circles and enemies are triangles they stay distinguishable.\"> <style> .unity-a11y-colour-only-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-a11y-colour-only-s{font-size:13px;fill:var(--fig-muted)} .unity-a11y-colour-only-pt{font-size:13px;fill:var(--fig-ink)} .unity-a11y-colour-only-ok{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-a11y-colour-only-bad{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-a11y-colour-only-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-a11y-colour-only-radar{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .unity-a11y-colour-only-ring{fill:none;stroke:var(--fig-line);stroke-width:1.5} .unity-a11y-colour-only-pill{fill:none;stroke:var(--fig-line);stroke-width:1.5} .unity-a11y-colour-only-pon{fill:var(--fig-accent);fill-opacity:.16;stroke:var(--fig-accent);stroke-width:1.5} .unity-a11y-colour-only-al{fill:var(--fig-ok)} .unity-a11y-colour-only-en{fill:var(--fig-bad)} .unity-a11y-colour-only-cvd{fill:var(--fig-warn)} .unity-a11y-colour-only-me{fill:var(--fig-ink)} .unity-a11y-colour-only-d{animation:unity-a11y-colour-only-d 6s ease-in-out infinite} .unity-a11y-colour-only-n{opacity:0;animation:unity-a11y-colour-only-n 6s ease-in-out infinite} @keyframes unity-a11y-colour-only-d{0%,42%{opacity:1}50%,92%{opacity:0}100%{opacity:1}} @keyframes unity-a11y-colour-only-n{0%,42%{opacity:0}50%,92%{opacity:1}100%{opacity:0}} </style> <rect class=\"unity-a11y-colour-only-pill\" x=\"146\" y=\"14\" width=\"170\" height=\"28\" rx=\"14\"/><rect class=\"unity-a11y-colour-only-pon unity-a11y-colour-only-d\" x=\"146\" y=\"14\" width=\"170\" height=\"28\" rx=\"14\"/><text class=\"unity-a11y-colour-only-pt\" x=\"231\" y=\"33\" text-anchor=\"middle\">Deuteranopia (sim.)</text> <rect class=\"unity-a11y-colour-only-pill\" x=\"324\" y=\"14\" width=\"170\" height=\"28\" rx=\"14\"/><rect class=\"unity-a11y-colour-only-pon unity-a11y-colour-only-n\" x=\"324\" y=\"14\" width=\"170\" height=\"28\" rx=\"14\"/><text class=\"unity-a11y-colour-only-pt\" x=\"409\" y=\"33\" text-anchor=\"middle\">Normal vision</text> <rect class=\"unity-a11y-colour-only-panel\" x=\"20\" y=\"56\" width=\"290\" height=\"230\" rx=\"12\"/><text class=\"unity-a11y-colour-only-h\" x=\"36\" y=\"82\">Colour only</text> <rect class=\"unity-a11y-colour-only-radar\" x=\"36\" y=\"96\" width=\"258\" height=\"130\" rx=\"10\"/><circle class=\"unity-a11y-colour-only-ring\" cx=\"165\" cy=\"161\" r=\"30\"/><circle class=\"unity-a11y-colour-only-ring\" cx=\"165\" cy=\"161\" r=\"58\"/> <path class=\"unity-a11y-colour-only-me\" d=\"M165 152 l8 18 l-8 -5 l-8 5 z\"/><circle class=\"unity-a11y-colour-only-al\" cx=\"76\" cy=\"124\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"76\" cy=\"124\" r=\"9\"/><circle class=\"unity-a11y-colour-only-al\" cx=\"116\" cy=\"196\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"116\" cy=\"196\" r=\"9\"/><circle class=\"unity-a11y-colour-only-al\" cx=\"196\" cy=\"150\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"196\" cy=\"150\" r=\"9\"/><circle class=\"unity-a11y-colour-only-en\" cx=\"150\" cy=\"118\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"150\" cy=\"118\" r=\"9\"/><circle class=\"unity-a11y-colour-only-en\" cx=\"236\" cy=\"186\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"236\" cy=\"186\" r=\"9\"/><circle class=\"unity-a11y-colour-only-en\" cx=\"262\" cy=\"128\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"262\" cy=\"128\" r=\"9\"/> <rect class=\"unity-a11y-colour-only-panel\" x=\"330\" y=\"56\" width=\"290\" height=\"230\" rx=\"12\"/><text class=\"unity-a11y-colour-only-h\" x=\"346\" y=\"82\">Colour + shape</text> <rect class=\"unity-a11y-colour-only-radar\" x=\"346\" y=\"96\" width=\"258\" height=\"130\" rx=\"10\"/><circle class=\"unity-a11y-colour-only-ring\" cx=\"475\" cy=\"161\" r=\"30\"/><circle class=\"unity-a11y-colour-only-ring\" cx=\"475\" cy=\"161\" r=\"58\"/> <path class=\"unity-a11y-colour-only-me\" d=\"M475 152 l8 18 l-8 -5 l-8 5 z\"/><circle class=\"unity-a11y-colour-only-al\" cx=\"386\" cy=\"124\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"386\" cy=\"124\" r=\"9\"/><circle class=\"unity-a11y-colour-only-al\" cx=\"426\" cy=\"196\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"426\" cy=\"196\" r=\"9\"/><circle class=\"unity-a11y-colour-only-al\" cx=\"506\" cy=\"150\" r=\"9\"/><circle class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" cx=\"506\" cy=\"150\" r=\"9\"/><path class=\"unity-a11y-colour-only-en\" d=\"M460 108 L470 126 L450 126 Z\"/><path class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" d=\"M460 108 L470 126 L450 126 Z\"/><path class=\"unity-a11y-colour-only-en\" d=\"M546 176 L556 194 L536 194 Z\"/><path class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" d=\"M546 176 L556 194 L536 194 Z\"/><path class=\"unity-a11y-colour-only-en\" d=\"M572 118 L582 136 L562 136 Z\"/><path class=\"unity-a11y-colour-only-cvd unity-a11y-colour-only-d\" d=\"M572 118 L582 136 L562 136 Z\"/> <text class=\"unity-a11y-colour-only-bad unity-a11y-colour-only-d\" x=\"36\" y=\"252\">Allies and enemies look identical</text><text class=\"unity-a11y-colour-only-s unity-a11y-colour-only-n\" x=\"36\" y=\"252\">Green = ally, red = enemy</text><text class=\"unity-a11y-colour-only-s\" x=\"36\" y=\"272\">Colour carries all the meaning</text> <text class=\"unity-a11y-colour-only-ok\" x=\"346\" y=\"252\">Circle = ally, triangle = enemy</text><text class=\"unity-a11y-colour-only-s\" x=\"346\" y=\"272\">Shape carries it, colour reinforces</text> </svg>"
        },
        {
          "type": "list",
          "items": [
            "**Contrast**: aim for at least 4.5:1 between text and its background (3:1 for large text), the WCAG thresholds. In a 3D game the background changes every frame, so put text on a backing plate or add an outline rather than trusting the scene.",
            "**Text size and scaling**: test at the real viewing distance; a TV across the room needs much larger text than a phone held close. Offer a UI or text scale option and build layouts that survive 150-200% text, which is the same flexibility localization needs.",
            "**Subtitles**: on by default or offered at first launch, with **speaker labels**, a **background box** with adjustable opacity, adjustable size, at most two or three lines at a time, and captions for gameplay-relevant sounds (`[footsteps behind you]`, `[alarm]`).",
            "Do not rely on audio alone either: a sound cue that warns of an off-screen attack needs a visual equivalent such as a directional indicator."
          ]
        },
        {
          "type": "h",
          "text": "Motor: remapping, hold vs toggle, timing"
        },
        {
          "type": "list",
          "items": [
            "**Full input remapping** for every action on every device, including menus. Never hard-code keys in gameplay code; read actions, not buttons. With the Input System, interactive rebinding and saving overrides as JSON are built in.",
            "**Hold vs toggle**: sprint, aim, crouch and charge should each offer a toggle option. Holding a trigger for long stretches is fatiguing or impossible for many players.",
            "**No required rapid inputs**: button-mashing and fast quick-time events need an alternative (a single press or hold, or an auto-complete option).",
            "**Aim assist and sensitivity**: adjustable aim assist strength, look sensitivity and dead zones per stick.",
            "**Adjustable timing**: longer reaction windows, a game-speed slider or pause anywhere, so precision timing is a choice rather than a gate."
          ]
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using UnityEngine;\nusing UnityEngine.InputSystem;\n\npublic class AimInput : MonoBehaviour\n{\n    [SerializeField] InputActionAsset actions;\n    [SerializeField] InputActionReference aim;\n    public bool aimIsToggle;          // exposed in the settings menu\n    public bool Aiming { get; private set; }\n\n    void OnEnable()\n    {\n        actions.LoadBindingOverridesFromJson(PlayerPrefs.GetString(\"bindings\", \"\"));\n        aim.action.started  += _ => Aiming = aimIsToggle ? !Aiming : true;\n        aim.action.canceled += _ => { if (!aimIsToggle) Aiming = false; };\n        aim.action.Enable();\n    }\n\n    public void Rebind(InputAction action, int bindingIndex)\n    {\n        action.Disable();\n        action.PerformInteractiveRebinding(bindingIndex)\n            .WithCancelingThrough(\"<Keyboard>/escape\")\n            .OnComplete(op =>\n            {\n                op.Dispose();\n                action.Enable();\n                PlayerPrefs.SetString(\"bindings\", actions.SaveBindingOverridesAsJson());\n            })\n            .OnCancel(op => { op.Dispose(); action.Enable(); })\n            .Start();\n    }\n}"
        },
        {
          "type": "h",
          "text": "Cognitive load, motion and flashing"
        },
        {
          "type": "p",
          "text": "Difficulty is an accessibility setting: separate sliders (enemy damage, timing windows, puzzle hints) or an assist mode let players remove the specific barrier they hit without changing the whole game. Keep the current objective one button press away, make tutorials replayable, and avoid burying critical information in a single line of dialogue. For vestibular and photosensitive players, offer toggles for camera shake, head bob, motion blur and field of view, and keep flashing below about three flashes per second, especially large, saturated red flashes. A warning screen does not make a seizure-triggering effect acceptable; reduce the effect."
        },
        {
          "type": "h",
          "text": "Screen readers and the Unity accessibility APIs"
        },
        {
          "type": "p",
          "text": "On iOS and Android, VoiceOver and TalkBack read the native view hierarchy. A Unity game draws everything into one surface, so by default the screen reader sees a single opaque view and a blind player cannot navigate your menus. Since Unity 2023.2, the `UnityEngine.Accessibility` namespace includes screen reader support for iOS and Android: you build an **accessibility hierarchy** of nodes, each with a label, a role such as button, a screen rectangle and an activation callback, and the platform screen reader lets the player swipe through and activate them. Platform coverage, how it integrates with uGUI and UI Toolkit, and access to OS settings such as font scale have changed between releases, so check the Accessibility section of the manual for the exact version you ship on."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Test with real players who have the disabilities you are designing for, early, with a build where the options already exist. Checklists such as the Game Accessibility Guidelines catch the obvious gaps; players catch the ones you did not imagine, like a remapping screen that itself cannot be navigated without the action being remapped."
        },
        {
          "type": "h",
          "text": "Localization: design for it from day one"
        },
        {
          "type": "p",
          "text": "Retrofitting localization means finding every player-facing string in code, prefabs, scenes, textures and audio. The rules that avoid that: no player-facing text in code or baked into textures, every string referenced by a **key**, no sentences built by concatenation, and layouts that let text grow and flip direction. The **Unity Localization package** (`com.unity.localization`) implements this. You define **Locales** (en, de, ja, ar), and a **String Table Collection** holds one table per locale sharing the same keys. **Asset Table Collections** do the same for sprites, audio clips, fonts and prefabs, so a voice line or a sign texture swaps with the locale. A **Locale Selector** chain decides the starting locale (saved player choice, command line, system language), and components such as **Localize String Event** push the resolved text into a TextMeshPro label and update it when the locale changes."
        },
        {
          "type": "p",
          "text": "Plurals are where hand-written code breaks. English has two forms (1 item, 5 items), Japanese has one, Polish and Russian have three or four depending on the number, and Arabic has six. The package's **Smart Strings** (based on the SmartFormat library) let the translator write the forms in the entry itself, and the plural formatter picks the right one using the locale's plural rules. Variables come from arguments or from **local and global variables** attached to the LocalizedString, so changing a variable refreshes the text."
        },
        {
          "type": "figure",
          "id": "unity-loc-string-table",
          "caption": "One key, two inputs: the selected locale chooses the table row and the count chooses the plural branch, so code never builds the sentence itself.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"A LocalizedString with key shop.cart_count and a count variable is resolved through the UI String Table: the selected locale picks the row and the count picks the plural branch, producing 1 item, 5 items, 1 Artikel or 5 Artikel.\"> <style> .unity-loc-string-table-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-loc-string-table-s{font-size:12px;fill:var(--fig-muted)} .unity-loc-string-table-m{font-size:13px;fill:var(--fig-muted)} .unity-loc-string-table-c{font-size:12px;font-family:ui-monospace,Menlo,monospace;fill:var(--fig-ink)} .unity-loc-string-table-cm{font-size:12px;font-family:ui-monospace,Menlo,monospace;fill:var(--fig-muted)} .unity-loc-string-table-tag{font-size:13px;font-weight:600;fill:var(--fig-ink)} .unity-loc-string-table-out{font-size:16px;font-weight:600;fill:var(--fig-ink)} .unity-loc-string-table-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-loc-string-table-row{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .unity-loc-string-table-chip{fill:none;stroke:var(--fig-line);stroke-width:1.5} .unity-loc-string-table-rowon{fill:none;stroke:var(--fig-accent);stroke-width:2} .unity-loc-string-table-chipon{fill:var(--fig-accent);fill-opacity:.18;stroke:var(--fig-accent);stroke-width:1.5} .unity-loc-string-table-ar{stroke:var(--fig-muted);stroke-width:1.5;fill:none;stroke-linecap:round;stroke-linejoin:round} .unity-loc-string-table-b{opacity:0} .unity-loc-string-table-p1{animation:unity-loc-string-table-p1 8s step-end infinite} .unity-loc-string-table-p2{animation:unity-loc-string-table-p2 8s step-end infinite} .unity-loc-string-table-p3{animation:unity-loc-string-table-p3 8s step-end infinite} .unity-loc-string-table-p4{animation:unity-loc-string-table-p4 8s step-end infinite} .unity-loc-string-table-h1{animation:unity-loc-string-table-h1 8s step-end infinite} .unity-loc-string-table-h2{animation:unity-loc-string-table-h2 8s step-end infinite} .unity-loc-string-table-odd{animation:unity-loc-string-table-odd 8s step-end infinite} .unity-loc-string-table-even{animation:unity-loc-string-table-even 8s step-end infinite} @keyframes unity-loc-string-table-p1{0%{opacity:1}25%{opacity:0}} @keyframes unity-loc-string-table-p2{0%{opacity:0}25%{opacity:1}50%{opacity:0}} @keyframes unity-loc-string-table-p3{0%{opacity:0}50%{opacity:1}75%{opacity:0}} @keyframes unity-loc-string-table-p4{0%{opacity:0}75%{opacity:1}} @keyframes unity-loc-string-table-h1{0%{opacity:1}50%{opacity:0}} @keyframes unity-loc-string-table-h2{0%{opacity:0}50%{opacity:1}} @keyframes unity-loc-string-table-odd{0%{opacity:1}25%{opacity:0}50%{opacity:1}75%{opacity:0}} @keyframes unity-loc-string-table-even{0%{opacity:0}25%{opacity:1}50%{opacity:0}75%{opacity:1}} </style> <rect class=\"unity-loc-string-table-panel\" x=\"20\" y=\"40\" width=\"150\" height=\"190\" rx=\"12\"/><text class=\"unity-loc-string-table-s\" x=\"32\" y=\"30\">Code asks for a key</text> <text class=\"unity-loc-string-table-h\" x=\"32\" y=\"68\">LocalizedString</text><text class=\"unity-loc-string-table-cm\" x=\"32\" y=\"96\">table</text><text class=\"unity-loc-string-table-c\" x=\"32\" y=\"114\">UI</text><text class=\"unity-loc-string-table-cm\" x=\"32\" y=\"138\">key</text><text class=\"unity-loc-string-table-c\" x=\"32\" y=\"156\">shop.cart_count</text> <text class=\"unity-loc-string-table-c unity-loc-string-table-odd\" x=\"32\" y=\"186\">count = 1</text><text class=\"unity-loc-string-table-c unity-loc-string-table-b unity-loc-string-table-even\" x=\"32\" y=\"186\">count = 5</text> <text class=\"unity-loc-string-table-cm unity-loc-string-table-h1\" x=\"32\" y=\"212\">locale = en</text><text class=\"unity-loc-string-table-cm unity-loc-string-table-b unity-loc-string-table-h2\" x=\"32\" y=\"212\">locale = de</text> <path class=\"unity-loc-string-table-ar\" d=\"M174 135 L194 135 M188 129 L194 135 L188 141\"/><path class=\"unity-loc-string-table-ar\" d=\"M474 135 L494 135 M488 129 L494 135 L488 141\"/> <rect class=\"unity-loc-string-table-panel\" x=\"200\" y=\"40\" width=\"270\" height=\"190\" rx=\"12\"/><text class=\"unity-loc-string-table-s\" x=\"212\" y=\"30\">String Table Collection</text> <text class=\"unity-loc-string-table-h\" x=\"212\" y=\"66\">UI / shop.cart_count</text><text class=\"unity-loc-string-table-s\" x=\"212\" y=\"86\">Smart String, plural forms by count</text> <text class=\"unity-loc-string-table-s\" x=\"298\" y=\"114\" text-anchor=\"middle\">one</text><text class=\"unity-loc-string-table-s\" x=\"402\" y=\"114\" text-anchor=\"middle\">other</text> <rect class=\"unity-loc-string-table-row\" x=\"212\" y=\"124\" width=\"246\" height=\"40\" rx=\"9\"/><rect class=\"unity-loc-string-table-rowon unity-loc-string-table-h1\" x=\"212\" y=\"124\" width=\"246\" height=\"40\" rx=\"9\"/><text class=\"unity-loc-string-table-tag\" x=\"226\" y=\"149\">en</text><rect class=\"unity-loc-string-table-chip\" x=\"250\" y=\"131\" width=\"96\" height=\"26\" rx=\"7\"/><rect class=\"unity-loc-string-table-chipon unity-loc-string-table-p1\" x=\"250\" y=\"131\" width=\"96\" height=\"26\" rx=\"7\"/><text class=\"unity-loc-string-table-c\" x=\"298\" y=\"149\" text-anchor=\"middle\">{} item</text><rect class=\"unity-loc-string-table-chip\" x=\"354\" y=\"131\" width=\"96\" height=\"26\" rx=\"7\"/><rect class=\"unity-loc-string-table-chipon unity-loc-string-table-b unity-loc-string-table-p2\" x=\"354\" y=\"131\" width=\"96\" height=\"26\" rx=\"7\"/><text class=\"unity-loc-string-table-c\" x=\"402\" y=\"149\" text-anchor=\"middle\">{} items</text> <rect class=\"unity-loc-string-table-row\" x=\"212\" y=\"174\" width=\"246\" height=\"40\" rx=\"9\"/><rect class=\"unity-loc-string-table-rowon unity-loc-string-table-b unity-loc-string-table-h2\" x=\"212\" y=\"174\" width=\"246\" height=\"40\" rx=\"9\"/><text class=\"unity-loc-string-table-tag\" x=\"226\" y=\"199\">de</text><rect class=\"unity-loc-string-table-chip\" x=\"250\" y=\"181\" width=\"96\" height=\"26\" rx=\"7\"/><rect class=\"unity-loc-string-table-chipon unity-loc-string-table-b unity-loc-string-table-p3\" x=\"250\" y=\"181\" width=\"96\" height=\"26\" rx=\"7\"/><text class=\"unity-loc-string-table-c\" x=\"298\" y=\"199\" text-anchor=\"middle\">{} Artikel</text><rect class=\"unity-loc-string-table-chip\" x=\"354\" y=\"181\" width=\"96\" height=\"26\" rx=\"7\"/><rect class=\"unity-loc-string-table-chipon unity-loc-string-table-b unity-loc-string-table-p4\" x=\"354\" y=\"181\" width=\"96\" height=\"26\" rx=\"7\"/><text class=\"unity-loc-string-table-c\" x=\"402\" y=\"199\" text-anchor=\"middle\">{} Artikel</text> <rect class=\"unity-loc-string-table-panel\" x=\"500\" y=\"40\" width=\"120\" height=\"190\" rx=\"12\"/><text class=\"unity-loc-string-table-s\" x=\"512\" y=\"30\">On screen</text> <rect class=\"unity-loc-string-table-row\" x=\"512\" y=\"114\" width=\"96\" height=\"42\" rx=\"9\"/><text class=\"unity-loc-string-table-out unity-loc-string-table-p1\" x=\"560\" y=\"141\" text-anchor=\"middle\">1 item</text><text class=\"unity-loc-string-table-out unity-loc-string-table-b unity-loc-string-table-p2\" x=\"560\" y=\"141\" text-anchor=\"middle\">5 items</text><text class=\"unity-loc-string-table-out unity-loc-string-table-b unity-loc-string-table-p3\" x=\"560\" y=\"141\" text-anchor=\"middle\">1 Artikel</text><text class=\"unity-loc-string-table-out unity-loc-string-table-b unity-loc-string-table-p4\" x=\"560\" y=\"141\" text-anchor=\"middle\">5 Artikel</text> <text class=\"unity-loc-string-table-m\" x=\"320\" y=\"268\" text-anchor=\"middle\">The locale picks the row; the count picks the plural form by that language's rules</text> </svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using TMPro;\nusing UnityEngine;\nusing UnityEngine.Localization;\nusing UnityEngine.Localization.SmartFormat.PersistentVariables;\n\n// Entry \"shop.cart_count\" in table \"UI\":\n//   en: {count:plural:{} item|{} items}\n//   de: {count:plural:{} Artikel|{} Artikel}\npublic class CartLabel : MonoBehaviour\n{\n    [SerializeField] LocalizedString label;   // pick table and key in the Inspector\n    [SerializeField] TMP_Text text;\n    IntVariable count;\n\n    void OnEnable()\n    {\n        if (!label.TryGetValue(\"count\", out var v))\n            label.Add(\"count\", v = new IntVariable());\n        count = (IntVariable)v;\n        // Fires on subscribe, on locale change and whenever a variable changes.\n        label.StringChanged += OnStringChanged;\n    }\n\n    void OnDisable() => label.StringChanged -= OnStringChanged;\n    void OnStringChanged(string value) => text.text = value;\n    public void SetCount(int n) => count.Value = n;\n}"
        },
        {
          "type": "h",
          "text": "Text expansion, right-to-left and fonts"
        },
        {
          "type": "p",
          "text": "Translated text is usually longer than English: German runs about 30% longer on average, and short UI strings expand far more (a 4-letter English label can double). Design containers that grow or wrap, set a sensible minimum font size if you use Auto Size (and remember its cost from the UI lesson), and keep a per-key maximum length for places that truly cannot grow. **Right-to-left** scripts (Arabic, Hebrew) need more than reversed text: Arabic letters change shape depending on their neighbours, and the layout itself mirrors, so back arrows, list alignment, progress bars and tab order flip. Things that represent physical direction, such as a media play icon or a clock, do not flip. TextMeshPro has a right-to-left option, but it reverses character order without doing Arabic shaping, so you need a shaping solution or a text system that supports complex scripts; check what your Unity version's text stack provides before committing."
        },
        {
          "type": "figure",
          "id": "unity-loc-expansion-rtl",
          "caption": "The same Settings button cycled through German, Arabic and English: a box sized for English truncates and stays left-to-right, while a flexible, mirrored one adapts.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A Settings menu button cycled through German, Arabic and English. A fixed-width left-to-right button truncates the German label and does not mirror for Arabic; a flexible, mirrored button grows for German and flips icon, arrow, alignment and progress fill for Arabic.\"> <style> .unity-loc-expansion-rtl-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-loc-expansion-rtl-s{font-size:13px;fill:var(--fig-muted)} .unity-loc-expansion-rtl-pt{font-size:13px;fill:var(--fig-ink)} .unity-loc-expansion-rtl-lb{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-loc-expansion-rtl-ok{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-loc-expansion-rtl-bad{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-loc-expansion-rtl-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-loc-expansion-rtl-btn{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .unity-loc-expansion-rtl-btnbad{fill:var(--fig-bg);stroke:var(--fig-bad);stroke-width:2} .unity-loc-expansion-rtl-btnok{fill:var(--fig-bg);stroke:var(--fig-ok);stroke-width:2} .unity-loc-expansion-rtl-ic{fill:none;stroke:var(--fig-accent);stroke-width:2} .unity-loc-expansion-rtl-cv{fill:none;stroke:var(--fig-muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round} .unity-loc-expansion-rtl-tr{fill:var(--fig-line)} .unity-loc-expansion-rtl-fill{fill:var(--fig-accent)} .unity-loc-expansion-rtl-pill{fill:none;stroke:var(--fig-line);stroke-width:1.5} .unity-loc-expansion-rtl-pon{fill:var(--fig-accent);fill-opacity:.16;stroke:var(--fig-accent);stroke-width:1.5} .unity-loc-expansion-rtl-q1{animation:unity-loc-expansion-rtl-q1 6s ease-in-out infinite} .unity-loc-expansion-rtl-q2{opacity:0;animation:unity-loc-expansion-rtl-q2 6s ease-in-out infinite} .unity-loc-expansion-rtl-q3{opacity:0;animation:unity-loc-expansion-rtl-q3 6s ease-in-out infinite} @keyframes unity-loc-expansion-rtl-q1{0%,29%{opacity:1}34%,95%{opacity:0}100%{opacity:1}} @keyframes unity-loc-expansion-rtl-q2{0%,29%{opacity:0}34%,62%{opacity:1}67%,100%{opacity:0}} @keyframes unity-loc-expansion-rtl-q3{0%,62%{opacity:0}67%,95%{opacity:1}100%{opacity:0}} </style> <text class=\"unity-loc-expansion-rtl-s\" x=\"222\" y=\"33\" text-anchor=\"end\">Locale</text><rect class=\"unity-loc-expansion-rtl-pill\" x=\"232\" y=\"14\" width=\"56\" height=\"28\" rx=\"14\"/><rect class=\"unity-loc-expansion-rtl-pon unity-loc-expansion-rtl-q1\" x=\"232\" y=\"14\" width=\"56\" height=\"28\" rx=\"14\"/><text class=\"unity-loc-expansion-rtl-pt\" x=\"260\" y=\"33\" text-anchor=\"middle\">de</text><rect class=\"unity-loc-expansion-rtl-pill\" x=\"296\" y=\"14\" width=\"56\" height=\"28\" rx=\"14\"/><rect class=\"unity-loc-expansion-rtl-pon unity-loc-expansion-rtl-q2\" x=\"296\" y=\"14\" width=\"56\" height=\"28\" rx=\"14\"/><text class=\"unity-loc-expansion-rtl-pt\" x=\"324\" y=\"33\" text-anchor=\"middle\">ar</text><rect class=\"unity-loc-expansion-rtl-pill\" x=\"360\" y=\"14\" width=\"56\" height=\"28\" rx=\"14\"/><rect class=\"unity-loc-expansion-rtl-pon unity-loc-expansion-rtl-q3\" x=\"360\" y=\"14\" width=\"56\" height=\"28\" rx=\"14\"/><text class=\"unity-loc-expansion-rtl-pt\" x=\"388\" y=\"33\" text-anchor=\"middle\">en</text> <rect class=\"unity-loc-expansion-rtl-panel\" x=\"20\" y=\"56\" width=\"290\" height=\"230\" rx=\"12\"/><text class=\"unity-loc-expansion-rtl-h\" x=\"36\" y=\"82\">Fixed width, LTR only</text> <rect class=\"unity-loc-expansion-rtl-panel\" x=\"330\" y=\"56\" width=\"290\" height=\"230\" rx=\"12\"/><text class=\"unity-loc-expansion-rtl-h\" x=\"346\" y=\"82\">Flexible and mirrored</text> <g class=\"unity-loc-expansion-rtl-q1\"><rect class=\"unity-loc-expansion-rtl-btnbad\" x=\"90\" y=\"110\" width=\"150\" height=\"48\" rx=\"12\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"112\" cy=\"134\" r=\"8\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"112\" cy=\"134\" r=\"2.5\"/><text class=\"unity-loc-expansion-rtl-lb\" x=\"132\" y=\"139\">Einstell…</text><path class=\"unity-loc-expansion-rtl-cv\" d=\"M220 128 l6 6 l-6 6\"/><rect class=\"unity-loc-expansion-rtl-tr\" x=\"90\" y=\"200\" width=\"150\" height=\"8\" rx=\"4\"/><rect class=\"unity-loc-expansion-rtl-fill\" x=\"90\" y=\"200\" width=\"90\" height=\"8\" rx=\"4\"/><text class=\"unity-loc-expansion-rtl-bad\" x=\"36\" y=\"240\">German label truncated</text><text class=\"unity-loc-expansion-rtl-s\" x=\"36\" y=\"262\">box was sized for “Settings”</text></g> <g class=\"unity-loc-expansion-rtl-q2\"><rect class=\"unity-loc-expansion-rtl-btnbad\" x=\"90\" y=\"110\" width=\"150\" height=\"48\" rx=\"12\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"112\" cy=\"134\" r=\"8\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"112\" cy=\"134\" r=\"2.5\"/><text class=\"unity-loc-expansion-rtl-lb\" x=\"132\" y=\"139\">الإعدادات</text><path class=\"unity-loc-expansion-rtl-cv\" d=\"M220 128 l6 6 l-6 6\"/><rect class=\"unity-loc-expansion-rtl-tr\" x=\"90\" y=\"200\" width=\"150\" height=\"8\" rx=\"4\"/><rect class=\"unity-loc-expansion-rtl-fill\" x=\"90\" y=\"200\" width=\"90\" height=\"8\" rx=\"4\"/><text class=\"unity-loc-expansion-rtl-bad\" x=\"36\" y=\"240\">Arabic text, LTR layout</text><text class=\"unity-loc-expansion-rtl-s\" x=\"36\" y=\"262\">icon, arrow and fill not mirrored</text></g> <g class=\"unity-loc-expansion-rtl-q3\"><rect class=\"unity-loc-expansion-rtl-btn\" x=\"90\" y=\"110\" width=\"150\" height=\"48\" rx=\"12\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"112\" cy=\"134\" r=\"8\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"112\" cy=\"134\" r=\"2.5\"/><text class=\"unity-loc-expansion-rtl-lb\" x=\"132\" y=\"139\">Settings</text><path class=\"unity-loc-expansion-rtl-cv\" d=\"M220 128 l6 6 l-6 6\"/><rect class=\"unity-loc-expansion-rtl-tr\" x=\"90\" y=\"200\" width=\"150\" height=\"8\" rx=\"4\"/><rect class=\"unity-loc-expansion-rtl-fill\" x=\"90\" y=\"200\" width=\"90\" height=\"8\" rx=\"4\"/><text class=\"unity-loc-expansion-rtl-s\" x=\"36\" y=\"240\">English fits</text><text class=\"unity-loc-expansion-rtl-s\" x=\"36\" y=\"262\">the only language it was tested in</text></g> <g class=\"unity-loc-expansion-rtl-q1\"><rect class=\"unity-loc-expansion-rtl-btnok\" x=\"400\" y=\"110\" width=\"184\" height=\"48\" rx=\"12\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"422\" cy=\"134\" r=\"8\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"422\" cy=\"134\" r=\"2.5\"/><text class=\"unity-loc-expansion-rtl-lb\" x=\"442\" y=\"139\">Einstellungen</text><path class=\"unity-loc-expansion-rtl-cv\" d=\"M564 128 l6 6 l-6 6\"/><rect class=\"unity-loc-expansion-rtl-tr\" x=\"400\" y=\"200\" width=\"150\" height=\"8\" rx=\"4\"/><rect class=\"unity-loc-expansion-rtl-fill\" x=\"400\" y=\"200\" width=\"90\" height=\"8\" rx=\"4\"/><text class=\"unity-loc-expansion-rtl-ok\" x=\"346\" y=\"240\">Box grows with the text</text><text class=\"unity-loc-expansion-rtl-s\" x=\"346\" y=\"262\">13 characters vs 8 in English</text></g> <g class=\"unity-loc-expansion-rtl-q2\"><rect class=\"unity-loc-expansion-rtl-btnok\" x=\"400\" y=\"110\" width=\"150\" height=\"48\" rx=\"12\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"528\" cy=\"134\" r=\"8\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"528\" cy=\"134\" r=\"2.5\"/><text class=\"unity-loc-expansion-rtl-lb\" x=\"508\" y=\"139\" text-anchor=\"end\">الإعدادات</text><path class=\"unity-loc-expansion-rtl-cv\" d=\"M424 128 l-6 6 l6 6\"/><rect class=\"unity-loc-expansion-rtl-tr\" x=\"400\" y=\"200\" width=\"150\" height=\"8\" rx=\"4\"/><rect class=\"unity-loc-expansion-rtl-fill\" x=\"460\" y=\"200\" width=\"90\" height=\"8\" rx=\"4\"/><text class=\"unity-loc-expansion-rtl-ok\" x=\"346\" y=\"240\">Layout mirrored for RTL</text><text class=\"unity-loc-expansion-rtl-s\" x=\"346\" y=\"262\">icon right, arrow left, fill from right</text></g> <g class=\"unity-loc-expansion-rtl-q3\"><rect class=\"unity-loc-expansion-rtl-btnok\" x=\"400\" y=\"110\" width=\"150\" height=\"48\" rx=\"12\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"422\" cy=\"134\" r=\"8\"/><circle class=\"unity-loc-expansion-rtl-ic\" cx=\"422\" cy=\"134\" r=\"2.5\"/><text class=\"unity-loc-expansion-rtl-lb\" x=\"442\" y=\"139\">Settings</text><path class=\"unity-loc-expansion-rtl-cv\" d=\"M530 128 l6 6 l-6 6\"/><rect class=\"unity-loc-expansion-rtl-tr\" x=\"400\" y=\"200\" width=\"150\" height=\"8\" rx=\"4\"/><rect class=\"unity-loc-expansion-rtl-fill\" x=\"400\" y=\"200\" width=\"90\" height=\"8\" rx=\"4\"/><text class=\"unity-loc-expansion-rtl-ok\" x=\"346\" y=\"240\">English fits</text><text class=\"unity-loc-expansion-rtl-s\" x=\"346\" y=\"262\">same prefab, every locale</text></g> </svg>"
        },
        {
          "type": "p",
          "text": "Fonts are a memory problem. Chinese and Japanese need thousands of glyphs, and an SDF atlas of 4096 x 4096 at 8 bits per pixel is 16 MB. In TextMeshPro each font asset has a **fallback list** (and the TMP Settings asset has a global one): when a glyph is missing from the primary Latin asset, TMP searches the fallbacks, so a CJK asset can sit behind your stylised Latin font. For known text, generate **static** atlases from the characters actually used in your string tables; use **dynamic** atlases (with multi-atlas enabled) for player-generated text such as names and chat. Load each language's font assets with its locale, through Asset Tables or Addressables, so an English player does not pay for three CJK atlases. And do not use one CJK font for all three languages: Han unification means the same code point is drawn differently in Japanese, Simplified and Traditional Chinese conventions, and native readers notice."
        },
        {
          "type": "p",
          "text": "Numbers, dates and currencies follow the culture too: `1,234.5` in English is `1.234,5` in German and `1 234,5` in French. Format for display with the locale's culture and always serialize data with the invariant culture, or a German player's save writes `3,5` and fails to parse. Currency formatting only changes symbols and separators; real prices come already localized from the store's product metadata."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using System;\nusing System.Globalization;\nusing UnityEngine.Localization.Settings;\n\nCultureInfo ui = LocalizationSettings.SelectedLocale.Identifier.CultureInfo;\nscoreText.text = score.ToString(\"N0\", ui);          // 12,345 or 12.345\ndateText.text  = DateTime.Now.ToString(\"d\", ui);    // 10/28/2026 or 28.10.2026\n\n// Data is not UI: never let the player's culture reach save files or network messages.\nstring saved = speed.ToString(CultureInfo.InvariantCulture);\nfloat speed2 = float.Parse(saved, CultureInfo.InvariantCulture);\n// Same trap: \"title\".ToUpper() in Turkish culture gives \"TİTLE\"; use ToUpperInvariant() for IDs."
        },
        {
          "type": "h",
          "text": "Pseudo-localization and the vendor handoff"
        },
        {
          "type": "p",
          "text": "**Pseudo-localization** finds problems before any translator is hired. A pseudo-locale transforms your source text automatically: accented characters (`Šéttîñĝš`), padding to simulate expansion, and brackets around each string (`[Šéttîñĝš ~~~~]`). The Localization package ships a Pseudo-Locale with methods like these. Play the game in it: any text that appears plain was never routed through a table (a hard-coded string), any text whose closing bracket is missing was truncated, and any box glyph is a font coverage gap. Running a screenshot pass in the pseudo-locale on CI keeps new hard-coded strings from creeping back in."
        },
        {
          "type": "list",
          "items": [
            "**Export, do not hand over the project**: the package can export and import CSV and XLIFF and sync with Google Sheets. Vendors work in translation tools, so give them files they can import and merge back without touching Unity.",
            "**Give context with every key**: a comment saying where it appears, a screenshot, a maximum length, what each Smart String variable means, and the speaker or gender where the language needs it. `shop.buy` alone could be a verb on a button or a heading.",
            "**Keys are stable IDs**: never reuse a key for a different meaning, and change the key (or flag the entry) when the source text changes meaning, so stale translations are not shipped silently.",
            "**Freeze, then verify in game**: set a string freeze before translation milestones, and run linguistic QA (LQA) on device, since many errors (truncation, wrong context, broken variables) are only visible on screen."
          ]
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "`\"You have \" + n + \" coins\"` is the most common localization bug. It hard-codes English word order and English plural rules, and no translator can fix it from a spreadsheet. Make every sentence one table entry with variables."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents are good at the mechanical half of this work. Ask one to sweep the project for player-facing text (string literals assigned to `.text` or `SetText`, `text` attributes in UXML, strings serialized in prefabs and scenes), propose keys, add the entries to the right String Table and replace the call sites, then list what it deliberately left alone: log messages, analytics event names and save keys must stay unlocalized. Have it write an Edit Mode test that fails when a key is missing in any locale or a Smart String does not parse, and a check of your UI colour pairs against the WCAG contrast ratios. Do not ship its translations: machine output is fine for placeholder builds, but real text goes through translators and in-game LQA. Review any accessibility feature it adds for state that is still encoded in colour alone, and for toggles it wired to only one input device."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Map markers or team indicators differ only by colour, and colour-blind testers cannot tell them apart",
              "use": "Redundant encoding: shape, icon or text",
              "why": "Pair each colour with a shape or label so the information survives any colour vision. Colour-blind filter modes help less, because they only fix the cases you anticipated."
            },
            {
              "signal": "A mechanic needs a long trigger hold or rapid mashing, and testers with limited grip report pain",
              "use": "Toggle and single-press alternatives",
              "why": "Offer a toggle for every hold and a single-press option for mashing, plus adjustable timing. They are opt-in settings, so the fight stays the same for everyone else."
            },
            {
              "signal": "Controls are fixed per device, or remapping exists for keyboard only",
              "use": "Full remapping on every device",
              "why": "Let players rebind every action on every device, built on Input System action rebinding. Requires conflict handling, a reset to defaults and saving bindings per profile."
            },
            {
              "signal": "Dialogue subtitles are small white text, and deaf players miss who is speaking and key off-screen sounds",
              "use": "Full subtitles and captions",
              "why": "Add speaker labels, a background, size options and captions for gameplay-relevant sounds. Costs authoring sound captions and UI space."
            },
            {
              "signal": "Players report nausea from camera shake, head bob or flashing effects",
              "use": "Motion and flash toggles",
              "why": "Provide settings to reduce shake, bob and blur and limit flashes per second. Wire effects through one intensity setting so new effects respect it automatically."
            },
            {
              "signal": "A mobile player using VoiceOver or TalkBack reports the screen reader announces nothing in your game",
              "use": "Expose an accessibility hierarchy",
              "why": "Engine-rendered UI is invisible to OS screen readers until you publish nodes with labels and roles. The Unity APIs are version dependent, so check the manual for your version."
            },
            {
              "signal": "Literal strings like `\"Quit\"` are scattered through scripts and prefabs, or one label stays untranslated",
              "use": "String Table keys, never literals",
              "why": "Reference every string through a key in a String Table so translators and tools see all of it. Costs a lookup and a key-naming discipline, which pays off on the first new language."
            },
            {
              "signal": "Code builds sentences like `\"You have \" + count + \" coins\"` from translated fragments",
              "use": "Smart Strings with plurals and variables",
              "why": "One translatable entry with placeholders lets each language reorder words and pick plural forms. Fragments assume English word order and plural rules, which most languages break."
            },
            {
              "signal": "Voice-over, flag sprites or fonts must differ per language, and all of them load for every player",
              "use": "Asset Tables loaded per locale",
              "why": "Map each locale to its own assets and load only the active one, through Asset Tables or Addressables. CJK fonts especially are large; load them as per-locale fallbacks."
            },
            {
              "signal": "Parsing `\"1.5\"` from a save or config fails on German or French machines",
              "use": "Invariant culture for data",
              "why": "Use `CultureInfo.InvariantCulture` for saved and network data and the player's culture only for displayed numbers and dates. Mixing them corrupts saves across regions."
            },
            {
              "signal": "Arabic or Hebrew is on the roadmap and the UI layout assumes left-to-right",
              "use": "Right-to-left mirroring",
              "why": "Mirror layouts, progress direction and text alignment for RTL locales and use a text renderer that shapes Arabic correctly. Retrofitting late is costly; build layouts mirror-ready now."
            },
            {
              "signal": "Hard-coded text and truncated labels are only discovered after translations arrive",
              "use": "Pseudo-localization",
              "why": "A pseudo-locale accents, brackets and expands every string, so unlocalised text and overflow show up on day one. Costs nothing but a test pass per screen."
            }
          ]
        }
      ],
      "keyPoints": [
        "Never carry information by colour alone; add shape, icon or text, and keep text contrast at WCAG levels on a backing plate.",
        "Motor access means full remapping on every device, a toggle option for every hold, no required rapid inputs, and adjustable timing and aim assist.",
        "Subtitles need speaker labels, a background, size options and captions for important sounds; motion and flashing need toggles and limits.",
        "Unity games are opaque to mobile screen readers unless you expose an accessibility hierarchy; the APIs are version-dependent, so check the manual.",
        "Reference every string by key through String Tables, write plurals and variables as Smart Strings, and swap fonts, sprites and audio via Asset Tables.",
        "Plan for expansion, right-to-left mirroring, CJK fallback fonts loaded per locale, and culture-aware display with invariant-culture data.",
        "Pseudo-localize early to expose hard-coded text and truncation, and give translators exported files with context for every key."
      ],
      "quiz": [
        {
          "q": "A strategy map marks available objectives with green dots and locked ones with red dots. Colour-blind testers cannot tell them apart. Which change fixes it for the most players?",
          "options": [
            "Add a filter mode that recolours the whole screen on request",
            "Swap to a blue and orange pair but keep the identical dots",
            "Give locked objectives a padlock icon and keep the colours",
            "Raise the saturation of both colours so each stands out more"
          ],
          "answer": 2,
          "explain": "A second channel (the icon) works for every type of colour deficiency, in greyscale and with no setting to find. A filter or a new colour pair still encodes the state in colour alone, and saturation does not separate hues a player cannot distinguish."
        },
        {
          "q": "A boss fight requires holding the right trigger for four seconds to charge each shot. Players with limited grip strength report pain after a few attempts. Which change helps them without changing the fight for everyone?",
          "options": [
            "An option that makes charge a toggle: press to start, press to fire",
            "Shorten the charge time to two seconds on every difficulty level",
            "Add aim assist so that charged shots home in on the boss target",
            "Allow remapping the charge action to the other trigger instead"
          ],
          "answer": 0,
          "explain": "The barrier is sustained holding, and a toggle option removes it for the players who need it. Remapping moves the hold to another finger, aim assist addresses a different problem, and a global change alters the fight for all players."
        },
        {
          "q": "Code builds the label as `\"You have \" + count + \" coins\"` with both fragments in the string table. The Polish translator says it cannot be translated correctly. What is the right fix?",
          "options": [
            "Polish runs longer, so the label needs a wider RectTransform",
            "Polish lacks those glyphs; add a Latin Extended fallback font",
            "Translate the two fragments and choose a suffix in C# by count",
            "Make it one Smart String entry with a plural rule over count"
          ],
          "answer": 3,
          "explain": "Polish uses different noun forms for 1, 2-4 and 5+, and may need a different word order; fragments joined in code fix both to English rules. A single entry lets the translator write every form, and the plural formatter picks one using Polish rules."
        },
        {
          "q": "Your game ships in English, Japanese and Simplified Chinese. A memory capture from an English player shows three 4096 x 4096 CJK font atlases resident. What is the best change?",
          "options": [
            "Use one shared CJK font asset for both Japanese and Chinese",
            "Load each locale's font assets only when that locale is active",
            "Switch the CJK font assets to dynamic atlases of 8192 x 8192",
            "Enable Auto Size on TextMeshPro labels so glyphs are shared"
          ],
          "answer": 1,
          "explain": "Fonts are content like any other; loading them per locale (Asset Tables or Addressables) means English players never pay for CJK atlases. Sharing one CJK font is wrong for Han-unified glyphs and still loads it, and bigger atlases or Auto Size do not reduce memory."
        },
        {
          "q": "With the pseudo-locale active, every pause menu label appears accented and bracketed except Quit, which reads as plain `Quit`. What does this tell you?",
          "options": [
            "The Quit entry has no translation yet in the German table",
            "The Quit font asset lacks the accented glyphs pseudo-loc uses",
            "The Quit text is set in code or the prefab, not via a table key",
            "Pseudo-localization skips strings shorter than five characters"
          ],
          "answer": 2,
          "explain": "The pseudo-locale transforms whatever comes through the string tables, so plain text means the label never asked a table for its string. Missing glyphs show up as boxes, and pseudo-localization does not depend on real translations."
        },
        {
          "q": "Playtesters report nausea and headaches during sprints, which add strong camera shake, head bob and screen flashes. Which change addresses this?",
          "options": [
            "Toggle alternatives for every held input button",
            "Speaker labels and sound captions in subtitles",
            "Reduce-motion setting for shake, bob, flashes",
            "Publish a screen reader accessibility hierarchy"
          ],
          "answer": 2,
          "explain": "A reduce-motion setting, ideally one intensity value all effects read, targets the cause. Subtitles and captions help players who cannot hear, not those made ill by motion."
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Addressables Analyze or a memory snapshot shows the same texture twice, once per group whose prefabs use it",
              "use": "Shared-dependency group",
              "why": "Make shared textures, materials, shaders and atlases addressable in their own group so bundles reference one copy instead of each implicitly embedding it. Costs an extra bundle to load first."
            },
            {
              "signal": "You release most enemies from a large Pack Together group, but memory barely drops while one is still in use",
              "use": "Group by load lifetime",
              "why": "A bundle unloads only when its whole reference count hits zero, so group what loads and unloads together (per level, per feature). Too many tiny groups add bundle overhead and catalog size."
            },
            {
              "signal": "`LoadAssetAsync` or `InstantiateAsync` calls are scattered around and memory grows with every level visited",
              "use": "Owner pairs every load with Release",
              "why": "Addressables is reference counted: one clear owner holds the handle and calls `Release` or `ReleaseInstance` on a lifecycle event. Missed releases leak; double releases unload content still in use."
            },
            {
              "signal": "Code calls `Resources.Load(\"Prefabs/Boss\")` and startup gets slower as the project grows",
              "use": "Addressables instead of Resources",
              "why": "Resources ships everything in the folder, builds a startup index and only frees via the global `UnloadUnusedAssets`; string paths break on rename. Keep Resources for a few tiny bootstrap objects at most."
            },
            {
              "signal": "Opening the main menu loads a 16 MB atlas because it shows one shop icon",
              "use": "Atlas by usage, not by folder",
              "why": "Any sprite pulls in its whole atlas texture, so pack per screen or feature plus one shared atlas for common icons. Finer atlases mean slightly more draw calls across screens."
            },
            {
              "signal": "Texture memory on Android is several times the expected size; textures show RGBA32 or an unsupported format",
              "use": "Per-platform GPU compression",
              "why": "ASTC on modern mobile, BC on desktop and consoles stay compressed in VRAM: a 2048 texture drops from 16 MB to about 1.8 MB at ASTC 6x6. Unsupported formats decompress at load and erase the gain."
            },
            {
              "signal": "A UI texture drawn only by an `Image` has Read/Write and mipmaps enabled",
              "use": "Disable Read/Write and UI mips",
              "why": "Read/Write keeps a CPU copy (about double memory) and mips add about 33% that screen-space UI never samples. Keep Read/Write only when code reads pixels."
            },
            {
              "signal": "Frame hitches on every screen change, and the profiler shows `Resources.UnloadUnusedAssets` each time",
              "use": "Unload only at natural pause points",
              "why": "It walks the whole object graph on the main thread, and non-additive scene loads already call it. Run it behind loading screens; rely on Addressables releases for steady-state memory."
            },
            {
              "signal": "Producers want to ship new levels or events without a store update",
              "use": "Remote groups with a content catalog",
              "why": "Addressables remote groups on a CDN plus an updatable catalog let you swap content after release. Code changes still need a binary, and you take on hosting, cache and version compatibility."
            }
          ]
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
        },
        {
          "q": "The profiler shows a 150 ms hitch on every screen change, and the hitch is `Resources.UnloadUnusedAssets` called from your transition code. What should you reach for?",
          "options": [
            "Call `GC.Collect()` after each screen change instead",
            "Move the screens' assets into Resources folders",
            "Call the unload every frame in small slices",
            "Unload only behind loading screens at pause points"
          ],
          "answer": 3,
          "explain": "It walks the whole object graph on the main thread, so it belongs where a pause is invisible; steady-state memory should come from Addressables releases. `GC.Collect()` frees managed memory, not unused assets."
        }
      ]
    },
    {
      "id": "unity-tech-art-pipeline",
      "title": "The Tech Art Pipeline: From DCC Tools to Unity",
      "minutes": 14,
      "summary": "How models, rigs and textures travel from Blender, Maya, Substance and Photoshop into Unity, and how budgets, conventions and automated import checks keep that pipeline honest.",
      "lesson": [
        {
          "type": "p",
          "text": "A new hero character lands in the project. It looks fine in the Scene view, but the spawner sets its rotation to identity and it falls flat on its back, 1.8 cm tall. Its textures are 4096 pixels, the body is 85,000 triangles, the rig has 140 bones and the mask texture makes the armour glow oddly. Nobody broke a rule, because none was written down. A **tech art pipeline** is the contract between the tools artists author in (DCC tools: Blender, Maya, Substance 3D Painter, Photoshop) and the engine: units, axes, naming, import settings and budgets, enforced by code instead of by someone squinting at a review."
        },
        {
          "type": "h",
          "text": "Units, axes and transforms at export"
        },
        {
          "type": "p",
          "text": "Unity is **Y-up, left-handed, and 1 unit = 1 metre**. Blender is Z-up and right-handed with metres by default; Maya is Y-up and right-handed with centimetres by default. FBX carries its own up axis and unit scale in the file, and Unity's model importer reads them: **Convert Units** turns the file's units into metres, **Scale Factor** multiplies on top, and **Bake Axis Conversion** pushes the axis change into the mesh data instead of the root transform. The classic Blender symptom is a model that looks right but whose root has Rotation X −90 (often −89.98) and Scale 100: the axis and unit conversion is stored as a transform rather than baked into vertices."
        },
        {
          "type": "p",
          "text": "That hidden transform leaks into gameplay. Code that resets `rotation` or `localScale` undoes the conversion, physics and colliders inherit a scale of 100, animation clips authored against an identity root are off, and every child attachment point is in the wrong space. The rule to agree with art is simple: **the imported root arrives at Rotation 0, Scale 1, with the mesh in metres and Y-up**. Get there at the source (apply rotation and scale in the DCC, use the exporter's unit and axis options, such as Blender's Apply Scalings and Forward/Up settings) or with Bake Axis Conversion in Unity, and check it automatically rather than by eye."
        },
        {
          "type": "figure",
          "id": "unity-fbx-root-transform",
          "caption": "Both characters look identical until code resets the root: the one carrying the axis and unit conversion as Rotation X −90, Scale 100 falls over and shrinks a hundredfold.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 362\" role=\"img\" aria-label=\"Two imports of the same 1.8 metre character. One carries the axis and unit conversion as a root rotation of minus 90 on X and a scale of 100; when a spawner resets rotation and scale it falls on its back and shrinks to 1.8 centimetres. The other has the conversion baked into the mesh, so the reset changes nothing.\"> <style> .unity-fbx-root-transform-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-fbx-root-transform-t{font-size:13px;fill:var(--fig-ink)} .unity-fbx-root-transform-s{font-size:13px;fill:var(--fig-muted)} .unity-fbx-root-transform-ax{font-size:12px;fill:var(--fig-muted)} .unity-fbx-root-transform-bad{font-size:13px;font-weight:600;fill:var(--fig-bad)} .unity-fbx-root-transform-ok{font-size:13px;font-weight:600;fill:var(--fig-ok)} .unity-fbx-root-transform-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-fbx-root-transform-gr{stroke:var(--fig-line);stroke-width:2} .unity-fbx-root-transform-cube{fill:var(--fig-accent2);fill-opacity:.15;stroke:var(--fig-accent2);stroke-width:1.5} .unity-fbx-root-transform-body{fill:var(--fig-accent);fill-opacity:.2;stroke:var(--fig-accent);stroke-width:1.5} .unity-fbx-root-transform-gz{stroke:var(--fig-muted);stroke-width:1.5} .unity-fbx-root-transform-pill{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .unity-fbx-root-transform-hot{fill:var(--fig-warn);fill-opacity:.18;stroke:var(--fig-warn);stroke-width:1.5;opacity:0;animation:unity-fbx-root-transform-hot 6s ease-in-out infinite} .unity-fbx-root-transform-fall{transform-box:fill-box;transform-origin:0% 100%;animation:unity-fbx-root-transform-fall 6s ease-in-out infinite} .unity-fbx-root-transform-late{opacity:0;animation:unity-fbx-root-transform-late 6s ease-in-out infinite} .unity-fbx-root-transform-still{opacity:0;animation:unity-fbx-root-transform-still 6s ease-in-out infinite} .unity-fbx-root-transform-set{font-size:13px;font-weight:600;fill:var(--fig-warn);opacity:0;animation:unity-fbx-root-transform-hot 6s ease-in-out infinite} .unity-fbx-root-transform-ring{fill:none;stroke:var(--fig-bad);stroke-width:1.5;stroke-dasharray:3 3} @keyframes unity-fbx-root-transform-hot{0%,22%{opacity:0}26%,84%{opacity:1}90%,100%{opacity:0}} @keyframes unity-fbx-root-transform-fall{0%,28%{transform:rotate(0deg) scale(1);opacity:1}42%{transform:rotate(-90deg) scale(1);opacity:1}50%{transform:rotate(-90deg) scale(1);opacity:1}60%,86%{transform:rotate(-90deg) scale(.01);opacity:1}90%{transform:rotate(-90deg) scale(.01);opacity:0}91%{transform:rotate(0deg) scale(1);opacity:0}97%,100%{transform:rotate(0deg) scale(1);opacity:1}} @keyframes unity-fbx-root-transform-late{0%,58%{opacity:0}63%,86%{opacity:1}90%,100%{opacity:0}} @keyframes unity-fbx-root-transform-still{0%,40%{opacity:0}46%,86%{opacity:1}90%,100%{opacity:0}} </style> <rect class=\"unity-fbx-root-transform-pill\" x=\"140\" y=\"10\" width=\"360\" height=\"30\" rx=\"15\"/> <rect class=\"unity-fbx-root-transform-hot\" x=\"140\" y=\"10\" width=\"360\" height=\"30\" rx=\"15\"/> <text class=\"unity-fbx-root-transform-t\" x=\"320\" y=\"30\" text-anchor=\"middle\">Spawner sets rotation = identity, scale = 1</text> <rect class=\"unity-fbx-root-transform-pn\" x=\"16\" y=\"52\" width=\"608\" height=\"140\" rx=\"12\"/> <text class=\"unity-fbx-root-transform-h\" x=\"36\" y=\"82\">Conversion on the root</text> <text class=\"unity-fbx-root-transform-t\" x=\"36\" y=\"108\">Rotation X −90</text> <text class=\"unity-fbx-root-transform-t\" x=\"36\" y=\"128\">Scale 100</text> <text class=\"unity-fbx-root-transform-set\" x=\"146\" y=\"108\">→ 0</text> <text class=\"unity-fbx-root-transform-set\" x=\"146\" y=\"128\">→ 1</text> <text class=\"unity-fbx-root-transform-s\" x=\"36\" y=\"152\">mesh: Z-up, centimetres</text> <line class=\"unity-fbx-root-transform-gr\" x1=\"260\" y1=\"174\" x2=\"604\" y2=\"174\"/> <rect class=\"unity-fbx-root-transform-cube\" x=\"280\" y=\"124\" width=\"50\" height=\"50\" rx=\"4\"/> <text class=\"unity-fbx-root-transform-ax\" x=\"305\" y=\"154\" text-anchor=\"middle\">1 m</text> <g class=\"unity-fbx-root-transform-fall\"> <circle class=\"unity-fbx-root-transform-body\" cx=\"483\" cy=\"94\" r=\"10\"/> <rect class=\"unity-fbx-root-transform-body\" x=\"471\" y=\"106\" width=\"24\" height=\"40\" rx=\"8\"/> <rect class=\"unity-fbx-root-transform-body\" x=\"472\" y=\"146\" width=\"9\" height=\"28\" rx=\"3\"/> <rect class=\"unity-fbx-root-transform-body\" x=\"485\" y=\"146\" width=\"9\" height=\"28\" rx=\"3\"/> </g> <g class=\"unity-fbx-root-transform-late\"> <circle class=\"unity-fbx-root-transform-ring\" cx=\"471\" cy=\"170\" r=\"9\"/> <text class=\"unity-fbx-root-transform-bad\" x=\"486\" y=\"166\">1.8 cm, lying flat</text> </g> <line class=\"unity-fbx-root-transform-gz\" x1=\"574\" y1=\"112\" x2=\"574\" y2=\"86\"/> <line class=\"unity-fbx-root-transform-gz\" x1=\"574\" y1=\"112\" x2=\"600\" y2=\"112\"/> <text class=\"unity-fbx-root-transform-ax\" x=\"574\" y=\"78\" text-anchor=\"middle\">Y</text> <text class=\"unity-fbx-root-transform-ax\" x=\"608\" y=\"116\">Z</text> <rect class=\"unity-fbx-root-transform-pn\" x=\"16\" y=\"208\" width=\"608\" height=\"140\" rx=\"12\"/> <text class=\"unity-fbx-root-transform-h\" x=\"36\" y=\"238\">Conversion baked in</text> <text class=\"unity-fbx-root-transform-t\" x=\"36\" y=\"264\">Rotation 0</text> <text class=\"unity-fbx-root-transform-t\" x=\"36\" y=\"284\">Scale 1</text> <text class=\"unity-fbx-root-transform-set\" x=\"146\" y=\"264\">→ 0</text> <text class=\"unity-fbx-root-transform-set\" x=\"146\" y=\"284\">→ 1</text> <text class=\"unity-fbx-root-transform-s\" x=\"36\" y=\"308\">mesh: Y-up, metres</text> <line class=\"unity-fbx-root-transform-gr\" x1=\"260\" y1=\"330\" x2=\"604\" y2=\"330\"/> <rect class=\"unity-fbx-root-transform-cube\" x=\"280\" y=\"280\" width=\"50\" height=\"50\" rx=\"4\"/> <text class=\"unity-fbx-root-transform-ax\" x=\"305\" y=\"310\" text-anchor=\"middle\">1 m</text> <circle class=\"unity-fbx-root-transform-body\" cx=\"483\" cy=\"250\" r=\"10\"/> <rect class=\"unity-fbx-root-transform-body\" x=\"471\" y=\"262\" width=\"24\" height=\"40\" rx=\"8\"/> <rect class=\"unity-fbx-root-transform-body\" x=\"472\" y=\"302\" width=\"9\" height=\"28\" rx=\"3\"/> <rect class=\"unity-fbx-root-transform-body\" x=\"485\" y=\"302\" width=\"9\" height=\"28\" rx=\"3\"/> <text class=\"unity-fbx-root-transform-ok unity-fbx-root-transform-still\" x=\"506\" y=\"290\">unchanged</text> <line class=\"unity-fbx-root-transform-gz\" x1=\"574\" y1=\"268\" x2=\"574\" y2=\"242\"/> <line class=\"unity-fbx-root-transform-gz\" x1=\"574\" y1=\"268\" x2=\"600\" y2=\"268\"/> <text class=\"unity-fbx-root-transform-ax\" x=\"574\" y=\"234\" text-anchor=\"middle\">Y</text> <text class=\"unity-fbx-root-transform-ax\" x=\"608\" y=\"272\">Z</text> </svg>"
        },
        {
          "type": "list",
          "items": [
            "**Pivots** are gameplay data: base centre for props that sit on the floor, the hinge for doors, between the feet for characters. A pivot in the wrong place means every placement script and snap tool needs an offset.",
            "**Facing**: characters and vehicles face +Z in Unity, so `transform.forward` means 'ahead'. Agree which DCC axis maps to it once, in the export preset.",
            "**Export presets** in the DCC (saved FBX settings per asset class) beat a wiki page: one click, the same units, axes, smoothing and selection rules every time.",
            "**Naming**: a short, checked scheme such as `SM_` static meshes, `SK_` skinned meshes, `T_Crate_BC` base colour, `_N` normal, `_M` packed mask, and `_LOD0` to `_LOD2` suffixes. Names are how automation decides which rules apply."
          ]
        },
        {
          "type": "h",
          "text": "Model import settings"
        },
        {
          "type": "p",
          "text": "Each FBX gets a `ModelImporter` whose settings live in its `.meta` file. The ones that matter for performance and correctness:"
        },
        {
          "type": "list",
          "items": [
            "**Read/Write Enabled** keeps a CPU-side copy of the mesh next to the GPU copy, roughly doubling its memory. Turn it on only when scripts read or modify vertex data at runtime.",
            "**Mesh Compression** quantises vertex data in the build to reduce disk size. It does not reduce runtime memory (the mesh is decompressed on load) and can cause visible artifacts at higher levels.",
            "**Normals and Tangents**: import them when the normal map was baked against the exported normals, or let Unity calculate MikkTSpace tangents to match bakers that use MikkTSpace (Blender and Substance do). A tangent-space mismatch shows up as seams and wrong shading across UV islands. Unity expects OpenGL-style normal maps (green channel up).",
            "**Materials**: set the importer not to create materials (or remap to project materials) so every FBX does not spawn its own duplicate materials.",
            "**Index Format**: 16-bit indices address at most 65,535 vertices per mesh; Auto picks 32-bit above that, which costs memory and is a sign the mesh may be over budget."
          ]
        },
        {
          "type": "p",
          "text": "Two numbers drive cost: vertices processed and draw calls issued. The vertex count Unity reports is usually higher than the DCC's, because a GPU vertex is a unique combination of position, normal, UV and other attributes: every UV seam, hard edge and material boundary splits vertices. Budget in Unity's numbers, read from the imported mesh, not the modeller's viewport. Every submesh with its own material is at least one draw call, multiplied again by shadow and depth passes, so a prop with five materials costs five times a prop with one, whatever its triangle count."
        },
        {
          "type": "h",
          "text": "LODs"
        },
        {
          "type": "p",
          "text": "A **LOD Group** swaps meshes by how much of the screen height the object covers: LOD0 above, say, 50%, LOD1 above 20%, LOD2 above 6%, culled below 2%. If an FBX contains meshes named with `_LOD0`, `_LOD1` and so on, the importer builds the LOD Group automatically, so the naming convention is the authoring interface. Each level usually halves the triangles; the transition heights belong in the budget sheet next to the triangle counts, because a LOD1 that only appears at 5% screen height saves almost nothing. Recent Unity 6 releases can also generate mesh LODs at import; check the Mesh LOD documentation for your version before relying on it."
        },
        {
          "type": "h",
          "text": "Rigs and avatars"
        },
        {
          "type": "p",
          "text": "The Rig tab sets the **Animation Type**. **Humanoid** maps the skeleton onto Unity's standard humanoid Avatar, which enables retargeting clips between differently proportioned characters and humanoid IK, at a higher CPU cost per animated character and with bones outside the humanoid map handled separately. **Generic** plays curves on the exact bones that exist: cheaper, and the right choice for creatures, vehicles, props and any skeleton that does not share humanoid clips. Pick per asset class and write it down; a crowd of 200 spiders does not need retargeting."
        },
        {
          "type": "list",
          "items": [
            "**Bone count** drives skinning cost and is a budget line per character class (hero, crowd, background), not a per-asset discussion.",
            "**Skin weights per vertex**: the Quality settings and the importer's Skin Weights option cap the influences per vertex (commonly 4, or 2 on low tiers). Extra weights are dropped and the rest renormalised, so a face rigged with 8 influences creases differently on low-end devices. Agree the cap before rigging, not after.",
            "**Optimize Game Objects** removes the bone Transforms from the hierarchy (the animation system still drives them); expose only the bones gameplay attaches things to, such as hands and weapon sockets.",
            "**Strip Bones** drops bones that have no skin weights, which removes helper and control bones exported by accident."
          ]
        },
        {
          "type": "h",
          "text": "Textures: authoring for the GPU"
        },
        {
          "type": "p",
          "text": "GPU compression works on blocks of texels (4x4 for BC and ETC, a chosen block size for ASTC), so dimensions should be multiples of the block size, and **power-of-two** sizes (256, 512, 1024, 2048) keep the mip chain clean all the way down; Unity can rescale non-power-of-two textures at import, but that resamples the artist's pixels. Size itself should come from **texel density**: pixels of texture per metre of surface. If the team agrees 512 px/m for props, a 2 m crate gets 1024 pixels across, and a mug at 0.1 m gets a small slice of a shared atlas, not its own 1024 texture. Mixed densities read as some objects crisp and others blurry in the same frame, and halving density quarters memory, so density is both the look and the budget."
        },
        {
          "type": "p",
          "text": "**Channel packing** stores several greyscale maps in the R, G, B and A channels of one texture. HDRP's Lit Mask Map uses R metallic, G ambient occlusion, B detail mask and A smoothness; URP's Lit shader reads smoothness from the alpha of the metallic or base map and takes occlusion as a separate texture, and a custom shader can use any layout the team agrees. One packed texture means one file, one sample and one set of import settings instead of four. Packed masks hold data, not colour, so they must be imported with **sRGB off**, or the gamma conversion bends every value; they need a format with good per-channel quality and an alpha channel (BC7 on desktop, ASTC on mobile); and normal maps stay in their own texture type. Substance 3D Painter's export presets and Photoshop channels can produce the packed file directly, so nobody packs by hand."
        },
        {
          "type": "figure",
          "id": "unity-mask-channel-pack",
          "caption": "Four greyscale maps become the four channels of one linear mask texture; the shader samples it once and reads metallic, occlusion, detail and smoothness from r, g, b and a.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 334\" role=\"img\" aria-label=\"Channel packing: four greyscale maps, metallic, occlusion, detail mask and smoothness, are written into the R, G, B and A channels of one linear mask texture, which the shader samples once and splits back into four values.\"> <style> .unity-mask-channel-pack-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-mask-channel-pack-t{font-size:13px;fill:var(--fig-ink)} .unity-mask-channel-pack-s{font-size:12px;fill:var(--fig-muted)} .unity-mask-channel-pack-c{font-size:13px;font-weight:600;fill:var(--fig-ink)} .unity-mask-channel-pack-ok{font-size:13px;font-weight:600;fill:var(--fig-ok)} .unity-mask-channel-pack-tile{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .unity-mask-channel-pack-g{fill:var(--fig-ink)} .unity-mask-channel-pack-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-mask-channel-pack-slot{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .unity-mask-channel-pack-wire{stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 4} .unity-mask-channel-pack-arw{stroke:var(--fig-muted);stroke-width:2;fill:none} .unity-mask-channel-pack-dot{opacity:0;animation:unity-mask-channel-pack-dot 6s ease-in-out infinite} .unity-mask-channel-pack-bar{fill-opacity:.45;animation:unity-mask-channel-pack-bar 6s ease-in-out infinite} .unity-mask-channel-pack-d1{animation-delay:.9s} .unity-mask-channel-pack-d2{animation-delay:1.8s} .unity-mask-channel-pack-d3{animation-delay:2.7s} .unity-mask-channel-pack-out{animation:unity-mask-channel-pack-out 6s ease-in-out infinite} @keyframes unity-mask-channel-pack-dot{0%{opacity:0;transform:translateX(0)}3%{opacity:1;transform:translateX(0)}22%{opacity:1;transform:translateX(146px)}25%,100%{opacity:0;transform:translateX(146px)}} @keyframes unity-mask-channel-pack-bar{0%,20%{fill-opacity:.45}24%{fill-opacity:.95}36%,100%{fill-opacity:.45}} @keyframes unity-mask-channel-pack-out{0%,4%{opacity:1}12%,64%{opacity:.4}70%,100%{opacity:1}} </style> <defs> <linearGradient id=\"unity-mask-channel-pack-grad\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" style=\"stop-color:var(--fig-ink);stop-opacity:.05\"/><stop offset=\"1\" style=\"stop-color:var(--fig-ink);stop-opacity:.85\"/></linearGradient> <marker id=\"unity-mask-channel-pack-ar\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0 L10 5 L0 10 z\" fill=\"var(--fig-muted)\"/></marker> </defs> <rect class=\"unity-mask-channel-pack-tile\" x=\"20\" y=\"48\" width=\"52\" height=\"52\" rx=\"8\"/> <rect class=\"unity-mask-channel-pack-g\" x=\"21\" y=\"49\" width=\"26\" height=\"50\" fill-opacity=\".8\"/> <rect class=\"unity-mask-channel-pack-g\" x=\"47\" y=\"49\" width=\"24\" height=\"50\" fill-opacity=\".08\"/> <text class=\"unity-mask-channel-pack-t\" x=\"84\" y=\"79\">Metallic</text> <rect class=\"unity-mask-channel-pack-tile\" x=\"20\" y=\"116\" width=\"52\" height=\"52\" rx=\"8\"/> <rect class=\"unity-mask-channel-pack-g\" x=\"21\" y=\"117\" width=\"50\" height=\"50\" rx=\"7\" fill-opacity=\".1\"/> <rect class=\"unity-mask-channel-pack-g\" x=\"21\" y=\"153\" width=\"50\" height=\"14\" rx=\"4\" fill-opacity=\".55\"/> <rect class=\"unity-mask-channel-pack-g\" x=\"21\" y=\"117\" width=\"12\" height=\"50\" rx=\"4\" fill-opacity=\".35\"/> <text class=\"unity-mask-channel-pack-t\" x=\"84\" y=\"147\">Occlusion</text> <rect class=\"unity-mask-channel-pack-tile\" x=\"20\" y=\"184\" width=\"52\" height=\"52\" rx=\"8\"/> <rect class=\"unity-mask-channel-pack-g\" x=\"28\" y=\"185\" width=\"8\" height=\"50\" fill-opacity=\".7\"/> <rect class=\"unity-mask-channel-pack-g\" x=\"44\" y=\"185\" width=\"8\" height=\"50\" fill-opacity=\".7\"/> <rect class=\"unity-mask-channel-pack-g\" x=\"60\" y=\"185\" width=\"8\" height=\"50\" fill-opacity=\".7\"/> <text class=\"unity-mask-channel-pack-t\" x=\"84\" y=\"215\">Detail mask</text> <rect class=\"unity-mask-channel-pack-tile\" x=\"20\" y=\"252\" width=\"52\" height=\"52\" rx=\"8\"/> <rect x=\"21\" y=\"253\" width=\"50\" height=\"50\" rx=\"7\" fill=\"url(#unity-mask-channel-pack-grad)\"/> <text class=\"unity-mask-channel-pack-t\" x=\"84\" y=\"283\">Smoothness</text> <line class=\"unity-mask-channel-pack-wire\" x1=\"176\" y1=\"74\" x2=\"328\" y2=\"74\"/> <line class=\"unity-mask-channel-pack-wire\" x1=\"176\" y1=\"142\" x2=\"328\" y2=\"142\"/> <line class=\"unity-mask-channel-pack-wire\" x1=\"176\" y1=\"210\" x2=\"328\" y2=\"210\"/> <line class=\"unity-mask-channel-pack-wire\" x1=\"176\" y1=\"278\" x2=\"328\" y2=\"278\"/> <circle class=\"unity-mask-channel-pack-dot\" cx=\"178\" cy=\"74\" r=\"6\" fill=\"var(--fig-bad)\"/> <circle class=\"unity-mask-channel-pack-dot unity-mask-channel-pack-d1\" cx=\"178\" cy=\"142\" r=\"6\" fill=\"var(--fig-ok)\"/> <circle class=\"unity-mask-channel-pack-dot unity-mask-channel-pack-d2\" cx=\"178\" cy=\"210\" r=\"6\" fill=\"var(--fig-accent)\"/> <circle class=\"unity-mask-channel-pack-dot unity-mask-channel-pack-d3\" cx=\"178\" cy=\"278\" r=\"6\" fill=\"var(--fig-muted)\"/> <rect class=\"unity-mask-channel-pack-pn\" x=\"316\" y=\"14\" width=\"160\" height=\"304\" rx=\"14\"/> <text class=\"unity-mask-channel-pack-h\" x=\"332\" y=\"38\">mask map</text> <text class=\"unity-mask-channel-pack-s\" x=\"460\" y=\"38\" text-anchor=\"end\">sRGB off</text> <rect class=\"unity-mask-channel-pack-slot\" x=\"330\" y=\"52\" width=\"132\" height=\"44\" rx=\"10\"/> <circle cx=\"352\" cy=\"74\" r=\"12\" fill=\"var(--fig-bad)\" fill-opacity=\".18\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\"/> <text class=\"unity-mask-channel-pack-c\" x=\"352\" y=\"79\" text-anchor=\"middle\">R</text> <rect class=\"unity-mask-channel-pack-bar\" x=\"374\" y=\"64\" width=\"76\" height=\"20\" rx=\"5\" fill=\"var(--fig-bad)\"/> <rect class=\"unity-mask-channel-pack-slot\" x=\"330\" y=\"120\" width=\"132\" height=\"44\" rx=\"10\"/> <circle cx=\"352\" cy=\"142\" r=\"12\" fill=\"var(--fig-ok)\" fill-opacity=\".18\" stroke=\"var(--fig-ok)\" stroke-width=\"1.5\"/> <text class=\"unity-mask-channel-pack-c\" x=\"352\" y=\"147\" text-anchor=\"middle\">G</text> <rect class=\"unity-mask-channel-pack-bar unity-mask-channel-pack-d1\" x=\"374\" y=\"132\" width=\"76\" height=\"20\" rx=\"5\" fill=\"var(--fig-ok)\"/> <rect class=\"unity-mask-channel-pack-slot\" x=\"330\" y=\"188\" width=\"132\" height=\"44\" rx=\"10\"/> <circle cx=\"352\" cy=\"210\" r=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\".18\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/> <text class=\"unity-mask-channel-pack-c\" x=\"352\" y=\"215\" text-anchor=\"middle\">B</text> <rect class=\"unity-mask-channel-pack-bar unity-mask-channel-pack-d2\" x=\"374\" y=\"200\" width=\"76\" height=\"20\" rx=\"5\" fill=\"var(--fig-accent)\"/> <rect class=\"unity-mask-channel-pack-slot\" x=\"330\" y=\"256\" width=\"132\" height=\"44\" rx=\"10\"/> <circle cx=\"352\" cy=\"278\" r=\"12\" fill=\"var(--fig-muted)\" fill-opacity=\".18\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/> <text class=\"unity-mask-channel-pack-c\" x=\"352\" y=\"283\" text-anchor=\"middle\">A</text> <rect class=\"unity-mask-channel-pack-bar unity-mask-channel-pack-d3\" x=\"374\" y=\"268\" width=\"76\" height=\"20\" rx=\"5\" fill=\"var(--fig-muted)\"/> <path class=\"unity-mask-channel-pack-arw\" d=\"M478 166 H496\" marker-end=\"url(#unity-mask-channel-pack-ar)\"/> <g class=\"unity-mask-channel-pack-out\"> <rect class=\"unity-mask-channel-pack-pn\" x=\"500\" y=\"92\" width=\"122\" height=\"150\" rx=\"12\"/> <text class=\"unity-mask-channel-pack-h\" x=\"512\" y=\"116\">Shader</text> <text class=\"unity-mask-channel-pack-s\" x=\"512\" y=\"140\">m = sample once</text> <text class=\"unity-mask-channel-pack-t\" x=\"512\" y=\"164\">m.r metallic</text> <text class=\"unity-mask-channel-pack-t\" x=\"512\" y=\"184\">m.g occlusion</text> <text class=\"unity-mask-channel-pack-t\" x=\"512\" y=\"204\">m.b detail</text> <text class=\"unity-mask-channel-pack-t\" x=\"512\" y=\"224\">m.a smoothness</text> </g> <text class=\"unity-mask-channel-pack-ok\" x=\"500\" y=\"270\">4 files → 1</text> <text class=\"unity-mask-channel-pack-s\" x=\"500\" y=\"290\">4 samples → 1</text> </svg>"
        },
        {
          "type": "p",
          "text": "Author once at master resolution and let import settings decide what each platform gets. The **Default** settings plus per-platform **overrides** (for example Android ASTC 6x6 at 1024, desktop BC7 at 2048) set format and **Max Size** per target; a format the device does not support gets decompressed at load, as the assets lesson showed. Keep a **single source of truth**: the `.blend`, `.spp` or `.psd` source lives in version control (Git LFS or the art repository), the exported FBX or PNG in `Assets/` is regenerated from it, and nobody hand-edits an exported file, because the next export silently overwrites the fix."
        },
        {
          "type": "h",
          "text": "Materials and shader ownership"
        },
        {
          "type": "p",
          "text": "Shaders are code: every keyword multiplies variants and compile time (see the rendering lesson), and every distinct shader breaks SRP Batcher grouping. A workable split is that engineers and technical artists own a small library of master shaders (Shader Graph or HLSL) with deliberately exposed properties, and artists create **materials and Material Variants** from those, changing values but not structure. New shader requests go through the owners, who can often add a property instead of a shader. Materials auto-generated by the FBX importer are the usual source of near-duplicates, which is another reason to turn material creation off and remap to library materials."
        },
        {
          "type": "h",
          "text": "Budgets as a contract"
        },
        {
          "type": "p",
          "text": "Budgets are agreed per **asset class**, not argued per asset, and written in the units the engine measures: triangles and bones read from the imported mesh, draw calls, texture size and format per platform, texel density. They come from profiling the target device (the profiling lesson), are owned jointly by the art lead and an engineer, and live in one place that both people and tools read, such as a ScriptableObject or a JSON file in the repository."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Example budget sheet (mobile, agreed with art, lives in one asset)\n\nAsset class        Tris LOD0  Bones  Draw calls  Texture max, Android    Texel density\nHero character      25,000     75        2       2048, ASTC 6x6          1024 px/m\nCrowd character      6,000     30        1       1024, ASTC 8x8           512 px/m\nHero prop            8,000      -        1       2048, ASTC 6x6           512 px/m\nBackground prop      1,500      -        1        512 (atlas), ASTC 8x8   256 px/m\n\nLOD steps: about 50% triangles per level; cull below 2% screen height."
        },
        {
          "type": "h",
          "text": "Automating the contract"
        },
        {
          "type": "p",
          "text": "**Presets** set starting values: the Preset Manager can assign a default importer preset per folder or name filter. Default presets apply when an asset is first imported, so they do nothing for assets already in the project. An **AssetPostprocessor** runs on every import on every machine; use it to fix what can be fixed silently (clamp size, set sRGB, add platform overrides) and to report what cannot (a mesh over its triangle budget) as an import error attached to the asset. If the rules read from a budget asset, make sure a change to it triggers a reimport: bump `GetVersion()` or declare the dependency through the import context (see the `AssetImportContext` docs for your version)."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using UnityEditor;\nusing UnityEngine;\n\n// ArtBudgets is project code: a ScriptableObject the art lead edits,\n// mapping folders (Characters, Props, Background) to budget numbers.\nclass ArtBudgetPostprocessor : AssetPostprocessor\n{\n    // Bump when the rules change so Unity reimports affected assets.\n    public override uint GetVersion() => 3;\n\n    void OnPreprocessTexture()\n    {\n        if (!assetPath.StartsWith(\"Assets/Art/\")) return;\n        var ti = (TextureImporter)assetImporter;\n        var budget = ArtBudgets.ForPath(assetPath);\n\n        // Fix what can be fixed silently: clamp size, linear masks.\n        ti.maxTextureSize = Mathf.Min(ti.maxTextureSize, budget.maxTextureSize);\n        if (assetPath.EndsWith(\"_M.png\")) ti.sRGBTexture = false;\n\n        ti.SetPlatformTextureSettings(new TextureImporterPlatformSettings\n        {\n            name = \"Android\",\n            overridden = true,\n            maxTextureSize = budget.maxTextureSize,\n            format = TextureImporterFormat.ASTC_6x6\n        });\n    }\n\n    void OnPostprocessModel(GameObject root)\n    {\n        if (!assetPath.StartsWith(\"Assets/Art/\")) return;\n        var budget = ArtBudgets.ForPath(assetPath);\n\n        // Report what cannot be fixed: the mesh itself is over budget.\n        // (A real rule checks each LOD level against its own number.)\n        int tris = 0;\n        foreach (var mf in root.GetComponentsInChildren<MeshFilter>(true))\n            tris += Triangles(mf.sharedMesh);\n        foreach (var smr in root.GetComponentsInChildren<SkinnedMeshRenderer>(true))\n            tris += Triangles(smr.sharedMesh);\n\n        if (tris > budget.maxTriangles)\n            context.LogImportError(\n                $\"{assetPath}: {tris} triangles, budget is {budget.maxTriangles}\");\n    }\n\n    static int Triangles(Mesh m)\n    {\n        if (m == null) return 0;\n        long indices = 0;\n        for (int i = 0; i < m.subMeshCount; i++) indices += m.GetIndexCount(i);\n        return (int)(indices / 3);\n    }\n}"
        },
        {
          "type": "p",
          "text": "Import hooks only run when something imports, so the last line of defence is a **validator in CI**: a batch-mode method that walks `Assets/Art`, checks every importer and mesh against the budget sheet and naming rules, prints one line per violation and exits non-zero. Run it on every change that touches art. It catches assets imported before a rule existed, settings changed by hand in the Inspector, and anything the postprocessor only warned about, and it turns 'please check your textures' into a failing check with a file name."
        },
        {
          "type": "figure",
          "id": "unity-asset-budget-gate",
          "caption": "The postprocessor quietly clamps the 4096 albedo to the 2048 budget, but a 48k-triangle rock cannot be fixed at import: it logs an error and the CI check blocks the merge.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"Asset pipeline with automated budget checks. A 3.2k triangle crate passes every stage into the build. A 4096 pixel albedo texture is clamped to 2048 by the import postprocessor and passes. A 48k triangle rock exceeds the 20k prop budget, the importer logs an error and the CI check fails, blocking the merge.\"> <style> .unity-asset-budget-gate-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .unity-asset-budget-gate-s{font-size:12px;fill:var(--fig-muted)} .unity-asset-budget-gate-b{font-size:13px;fill:var(--fig-muted)} .unity-asset-budget-gate-k{font-size:12px;fill:var(--fig-ink)} .unity-asset-budget-gate-e{font-size:13px;font-weight:600;fill:var(--fig-bad)} .unity-asset-budget-gate-st{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-asset-budget-gate-tr{stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:2 5} .unity-asset-budget-gate-ar{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .unity-asset-budget-gate-pill{fill:var(--fig-bg);stroke:var(--fig-accent);stroke-width:1.5} .unity-asset-budget-gate-red{fill:var(--fig-bad);fill-opacity:.16;stroke:var(--fig-bad);stroke-width:2} .unity-asset-budget-gate-amb{fill:var(--fig-warn);fill-opacity:.16;stroke:var(--fig-warn);stroke-width:2;opacity:0;animation:unity-asset-budget-gate-amb 8s ease-in-out infinite} .unity-asset-budget-gate-m1{animation:unity-asset-budget-gate-m1 8s ease-in-out infinite} .unity-asset-budget-gate-m2{animation:unity-asset-budget-gate-m2 8s ease-in-out infinite} .unity-asset-budget-gate-m3{animation:unity-asset-budget-gate-m3 8s ease-in-out infinite} .unity-asset-budget-gate-old{animation:unity-asset-budget-gate-old 8s ease-in-out infinite} .unity-asset-budget-gate-new{opacity:0;animation:unity-asset-budget-gate-new 8s ease-in-out infinite} .unity-asset-budget-gate-f1{opacity:0;animation:unity-asset-budget-gate-f1 8s ease-in-out infinite} .unity-asset-budget-gate-f2{opacity:0;animation:unity-asset-budget-gate-f2 8s ease-in-out infinite} .unity-asset-budget-gate-f3{opacity:0;animation:unity-asset-budget-gate-f3 8s ease-in-out infinite} @keyframes unity-asset-budget-gate-m1{0%,5%{transform:translateX(0);opacity:1}50%,88%{transform:translateX(500px);opacity:1}93%{transform:translateX(500px);opacity:0}94%{transform:translateX(0);opacity:0}100%{transform:translateX(0);opacity:1}} @keyframes unity-asset-budget-gate-m2{0%,10%{transform:translateX(0);opacity:1}55%,88%{transform:translateX(500px);opacity:1}93%{transform:translateX(500px);opacity:0}94%{transform:translateX(0);opacity:0}100%{transform:translateX(0);opacity:1}} @keyframes unity-asset-budget-gate-m3{0%,15%{transform:translateX(0);opacity:1}38%,88%{transform:translateX(250px);opacity:1}93%{transform:translateX(250px);opacity:0}94%{transform:translateX(0);opacity:0}100%{transform:translateX(0);opacity:1}} @keyframes unity-asset-budget-gate-old{0%,31%{opacity:1}34%,93%{opacity:0}94%,100%{opacity:1}} @keyframes unity-asset-budget-gate-new{0%,31%{opacity:0}34%,92%{opacity:1}93%,100%{opacity:0}} @keyframes unity-asset-budget-gate-amb{0%,29%{opacity:0}32%,36%{opacity:1}40%,100%{opacity:0}} @keyframes unity-asset-budget-gate-f1{0%,38%{opacity:0}41%,88%{opacity:1}93%,100%{opacity:0}} @keyframes unity-asset-budget-gate-f2{0%,42%{opacity:0}45%,88%{opacity:1}93%,100%{opacity:0}} @keyframes unity-asset-budget-gate-f3{0%,47%{opacity:0}50%,88%{opacity:1}93%,100%{opacity:0}} </style> <defs><marker id=\"unity-asset-budget-gate-mk\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path d=\"M0 0 L10 5 L0 10 z\" fill=\"var(--fig-muted)\"/></marker></defs> <text class=\"unity-asset-budget-gate-b\" x=\"20\" y=\"28\">Budgets agreed with art: prop ≤ 20k tris, texture ≤ 2048 px</text> <rect class=\"unity-asset-budget-gate-st\" x=\"20\" y=\"44\" width=\"100\" height=\"60\" rx=\"12\"/> <text class=\"unity-asset-budget-gate-h\" x=\"70\" y=\"70\" text-anchor=\"middle\">DCC</text> <text class=\"unity-asset-budget-gate-s\" x=\"70\" y=\"90\" text-anchor=\"middle\">Blender, Maya</text> <rect class=\"unity-asset-budget-gate-st\" x=\"140\" y=\"44\" width=\"100\" height=\"60\" rx=\"12\"/> <text class=\"unity-asset-budget-gate-h\" x=\"190\" y=\"70\" text-anchor=\"middle\">Export</text> <text class=\"unity-asset-budget-gate-s\" x=\"190\" y=\"90\" text-anchor=\"middle\">FBX, PNG</text> <rect class=\"unity-asset-budget-gate-st\" x=\"260\" y=\"44\" width=\"120\" height=\"60\" rx=\"12\"/> <rect class=\"unity-asset-budget-gate-amb\" x=\"260\" y=\"44\" width=\"120\" height=\"60\" rx=\"12\"/> <g class=\"unity-asset-budget-gate-f1\"><rect class=\"unity-asset-budget-gate-red\" x=\"260\" y=\"44\" width=\"120\" height=\"60\" rx=\"12\"/></g> <text class=\"unity-asset-budget-gate-h\" x=\"320\" y=\"70\" text-anchor=\"middle\">Importer</text> <text class=\"unity-asset-budget-gate-s\" x=\"320\" y=\"90\" text-anchor=\"middle\">postprocessor</text> <rect class=\"unity-asset-budget-gate-st\" x=\"400\" y=\"44\" width=\"100\" height=\"60\" rx=\"12\"/> <g class=\"unity-asset-budget-gate-f3\"><rect class=\"unity-asset-budget-gate-red\" x=\"400\" y=\"44\" width=\"100\" height=\"60\" rx=\"12\"/></g> <text class=\"unity-asset-budget-gate-h\" x=\"450\" y=\"70\" text-anchor=\"middle\">CI check</text> <text class=\"unity-asset-budget-gate-s\" x=\"450\" y=\"90\" text-anchor=\"middle\">batchmode</text> <rect class=\"unity-asset-budget-gate-st\" x=\"520\" y=\"44\" width=\"100\" height=\"60\" rx=\"12\"/> <text class=\"unity-asset-budget-gate-h\" x=\"570\" y=\"70\" text-anchor=\"middle\">Build</text> <text class=\"unity-asset-budget-gate-s\" x=\"570\" y=\"90\" text-anchor=\"middle\">in budget</text> <path class=\"unity-asset-budget-gate-ar\" d=\"M122 74 H137\" marker-end=\"url(#unity-asset-budget-gate-mk)\"/> <path class=\"unity-asset-budget-gate-ar\" d=\"M242 74 H257\" marker-end=\"url(#unity-asset-budget-gate-mk)\"/> <path class=\"unity-asset-budget-gate-ar\" d=\"M382 74 H397\" marker-end=\"url(#unity-asset-budget-gate-mk)\"/> <path class=\"unity-asset-budget-gate-ar\" d=\"M502 74 H517\" marker-end=\"url(#unity-asset-budget-gate-mk)\"/> <line class=\"unity-asset-budget-gate-tr\" x1=\"70\" y1=\"144\" x2=\"570\" y2=\"144\"/> <line class=\"unity-asset-budget-gate-tr\" x1=\"70\" y1=\"180\" x2=\"570\" y2=\"180\"/> <line class=\"unity-asset-budget-gate-tr\" x1=\"70\" y1=\"216\" x2=\"570\" y2=\"216\"/> <g class=\"unity-asset-budget-gate-m1\"> <rect class=\"unity-asset-budget-gate-pill\" x=\"15\" y=\"131\" width=\"110\" height=\"26\" rx=\"13\"/> <text class=\"unity-asset-budget-gate-k\" x=\"70\" y=\"148\" text-anchor=\"middle\">crate 3.2k tris</text> </g> <g class=\"unity-asset-budget-gate-m2\"> <rect class=\"unity-asset-budget-gate-pill\" x=\"15\" y=\"167\" width=\"110\" height=\"26\" rx=\"13\"/> <text class=\"unity-asset-budget-gate-k unity-asset-budget-gate-old\" x=\"70\" y=\"184\" text-anchor=\"middle\">albedo 4096 px</text> <text class=\"unity-asset-budget-gate-k unity-asset-budget-gate-new\" x=\"70\" y=\"184\" text-anchor=\"middle\">albedo 2048 px</text> </g> <g class=\"unity-asset-budget-gate-m3\"> <rect class=\"unity-asset-budget-gate-pill\" x=\"15\" y=\"203\" width=\"110\" height=\"26\" rx=\"13\"/> <g class=\"unity-asset-budget-gate-f1\"><rect class=\"unity-asset-budget-gate-red\" x=\"15\" y=\"203\" width=\"110\" height=\"26\" rx=\"13\"/></g> <text class=\"unity-asset-budget-gate-k\" x=\"70\" y=\"220\" text-anchor=\"middle\">rock 48k tris</text> </g> <text class=\"unity-asset-budget-gate-e unity-asset-budget-gate-f2\" x=\"20\" y=\"262\">Import error: rock.fbx has 48k tris, prop budget is 20k</text> <text class=\"unity-asset-budget-gate-e unity-asset-budget-gate-f3\" x=\"20\" y=\"284\">CI check exits 1, merge blocked</text> </svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "using System.Collections.Generic;\nusing UnityEditor;\nusing UnityEngine;\n\npublic static class ArtValidator\n{\n    // Unity -batchmode -quit -projectPath . -executeMethod ArtValidator.Run -logFile -\n    public static void Run()\n    {\n        var failures = new List<string>();\n        foreach (var guid in AssetDatabase.FindAssets(\"t:Texture2D\", new[] { \"Assets/Art\" }))\n        {\n            var path = AssetDatabase.GUIDToAssetPath(guid);\n            if (AssetImporter.GetAtPath(path) is not TextureImporter ti) continue;\n            if (ti.isReadable) failures.Add($\"{path}: Read/Write enabled\");\n            if (!ti.GetPlatformTextureSettings(\"Android\").overridden)\n                failures.Add($\"{path}: no Android override\");\n        }\n        // Same pattern for models (triangles per LOD, bones, materials),\n        // naming conventions and anything the postprocessor cannot fix.\n\n        foreach (var f in failures) Debug.LogError(f);\n        EditorApplication.Exit(failures.Count == 0 ? 0 : 1);\n    }\n}"
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Roll out a new rule as a warning first, publish the list of current violations, let art fix the backlog, then flip it to an error. A rule that turns 300 assets red on day one gets disabled by the end of the week."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Do not budget from the DCC's statistics. Triangle counts roughly survive export, but vertex counts grow at every seam and hard edge, and an FBX can carry hidden helper meshes, cameras and unused bones. Measure the imported asset in Unity."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents are good at turning a written budget sheet into an `AssetPostprocessor` and a batch-mode validator, and at sweeping existing assets to report violations. Give the agent the budget asset, the folder and naming conventions and the target platforms, and ask for a report before any change. Verify with fixture assets: a deliberately over-budget mesh and a 4096 texture in a test folder must fail or be clamped, and a compliant one must pass. Do not accept 'fixes' that raise a budget, skip a folder or disable a rule to make the check green, and do not let an agent bulk-edit `.meta` files by text when it can change importers through the API. Agents cannot judge looks: a flipped normal-map green channel or a bad LOD pop still needs a human on device."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "An imported Blender model looks right but its root shows Rotation X -90 and Scale 100",
              "use": "Bake axis and units at export",
              "why": "Apply transforms and set exporter axis and units, or use Bake Axis Conversion, so roots arrive at Rotation 0, Scale 1 in metres. Otherwise code that resets rotation or scale undoes the conversion."
            },
            {
              "signal": "A wiki lists import rules, yet new textures keep arriving at 4096 with the wrong compression",
              "use": "Budget-driven AssetPostprocessor",
              "why": "Runs on every import on every machine: silently clamp size, set sRGB and platform overrides, and log import errors for what cannot be fixed. Bump `GetVersion()` when rules change to reimport."
            },
            {
              "signal": "Each new asset in a folder needs the same starting importer settings",
              "use": "Preset Manager defaults per folder",
              "why": "Default presets set importer values on first import with no code. They never touch assets already in the project, so pair them with a postprocessor or validator for enforcement."
            },
            {
              "signal": "Assets imported before a rule existed, or changed by hand in the Inspector, still break the budget",
              "use": "Batch-mode art validator in CI",
              "why": "Walk `Assets/Art`, check every importer and mesh against budgets and naming, print one line per violation and exit non-zero. Catches what import hooks never re-run on; costs CI Editor time."
            },
            {
              "signal": "Every art review turns into a debate about whether this prop's triangle count is acceptable",
              "use": "Budget sheet per asset class",
              "why": "Agree triangles, bones, draw calls, texture size and format per class (hero, crowd, background) from device profiling, stored in one asset both people and tools read. Needs an owner to revisit it."
            },
            {
              "signal": "Metallic, occlusion and smoothness ship as separate textures, or a packed mask shades too dark and rough",
              "use": "Channel-packed mask, sRGB off",
              "why": "One texture, one sample, one set of import settings. Masks are data, so import linear with a format that keeps channels independent (BC7, ASTC); normal maps stay separate."
            },
            {
              "signal": "Some props look crisp and others blurry in the same frame, and texture sizes are chosen per asset",
              "use": "Texel density standard",
              "why": "Pick pixels per metre per asset class: a 2 m crate at 512 px/m gets 1024 px. Consistent look and predictable memory; halving density quarters memory, small objects share atlases."
            },
            {
              "signal": "Every FBX creates its own materials and artists ask for a new shader per asset",
              "use": "Master shader library + Material Variants",
              "why": "Engineers own a few master shaders with exposed properties; artists make materials and variants. Keeps keyword variants and SRP Batcher groups under control at the cost of a request queue."
            },
            {
              "signal": "LOD Groups are set up by hand inconsistently and tools cannot tell meshes from textures",
              "use": "Naming convention as the interface",
              "why": "Prefixes like `SM_`, `SK_`, `T_` and suffixes `_N`, `_M`, `_LOD0` let the importer build LOD Groups and let tools pick rules. Only works if the scheme is short and checked automatically."
            },
            {
              "signal": "A crowd of creatures or props uses a Humanoid rig though no clips are shared between skeletons",
              "use": "Generic rig unless retargeting",
              "why": "Generic plays curves on existing bones and is cheaper per character. Humanoid buys retargeting and humanoid IK; pay for it only where clips are shared across proportions."
            },
            {
              "signal": "A fix made directly to an exported PNG or FBX disappears after the next export",
              "use": "Single source of truth in DCC files",
              "why": "Version the `.blend`, `.spp` or `.psd` (LFS or art repo) and regenerate exports from it. Nobody hand-edits exported files; costs storage for large sources."
            },
            {
              "signal": "A new validation rule would turn hundreds of existing assets red on day one",
              "use": "Warn first, then fail",
              "why": "Ship the rule as a warning with a published violation list, let art clear the backlog, then flip to an error. A rule that blocks everyone at once gets disabled within the week."
            }
          ]
        }
      ],
      "keyPoints": [
        "Unity is Y-up, left-handed and metric; imported roots should arrive at Rotation 0, Scale 1, with the conversion baked at export or import.",
        "Budget in Unity's numbers: imported vertex and triangle counts, bones, draw calls per material, texture size and format per platform.",
        "Channel-packed masks save files and samples, but must be imported with sRGB off and a format that keeps channels independent.",
        "Texel density per asset class sets both visual consistency and texture memory; halving density quarters memory.",
        "Engineers own a small shader library; artists work in materials and variants, so variants and batching stay under control.",
        "Presets set defaults on first import, AssetPostprocessors enforce on every import, and a CI validator catches everything else."
      ],
      "quiz": [
        {
          "q": "A Blender prop imports looking correct, but its root shows Rotation X −90 and Scale 100. A spawner sets `localScale = Vector3.one` and the prop becomes tiny. What is the right fix?",
          "options": [
            "Multiply the spawner's scale by 100 for every Blender asset",
            "Set the importer's Scale Factor to 100 for the Blender files",
            "Bake axis and unit conversion so the root imports at identity",
            "Enable Read/Write so the spawner can rescale the mesh vertices"
          ],
          "answer": 2,
          "explain": "The conversion lives on the root transform, so any code that resets it undoes the conversion. Baking it into the mesh (at export or with Bake Axis Conversion and unit settings) leaves an identity root that code can safely overwrite."
        },
        {
          "q": "A packed mask (metallic in R, occlusion in G, smoothness in A) was imported with the default texture settings. Surfaces look rougher and occlusion darker than in Substance. What is the most likely cause?",
          "options": [
            "sRGB is on, so the linear mask data is gamma-converted on sampling",
            "Mipmaps average all four channels together at the lower mip levels",
            "Packed masks must be imported with the Normal Map texture type",
            "The alpha channel is stripped unless Read/Write is turned on"
          ],
          "answer": 0,
          "explain": "Masks hold linear data. With sRGB on, the GPU applies a gamma decode when sampling, which pushes mid values down: smoothness drops and occlusion darkens. Mipmaps filter each channel independently, and Read/Write only adds a CPU copy."
        },
        {
          "q": "An artist reports 10,000 vertices in Blender. Unity's imported mesh reports about 17,000. Assuming no hidden objects were exported, what explains the difference?",
          "options": [
            "Unity triangulates quads, which doubles every face's vertex count",
            "Mesh Compression stores extra vertices for each quantisation level",
            "The importer adds a duplicate vertex set for the shadow caster pass",
            "Vertices are split where UVs, normals or materials differ at seams"
          ],
          "answer": 3,
          "explain": "A GPU vertex is a unique combination of attributes, so UV seams, hard edges and material boundaries duplicate positions. Triangulation adds indices, not vertices, which is why budgets should use Unity's imported counts."
        },
        {
          "q": "A game needs 200 identical robot spiders on screen, each with custom eight-legged animations made only for that rig. Which rig setup fits best?",
          "options": [
            "Humanoid, so the clips can be retargeted onto the spider skeleton",
            "Generic with Optimize Game Objects, exposing only needed bones",
            "Humanoid with the front leg bones mapped onto the avatar's arms",
            "Legacy, because it is the only animation type that supports crowds"
          ],
          "answer": 1,
          "explain": "Humanoid retargeting only helps when clips are shared across humanoid skeletons, and it costs extra CPU per character. Generic plays the authored curves directly, and Optimize Game Objects removes the bone Transforms from the hierarchy, which matters with 200 instances."
        },
        {
          "q": "The team adds a default Preset setting Max Size 1024 for `Assets/Art/Props`. A week later, older prop textures are still 4096. What explains it, and what enforces the rule?",
          "options": [
            "Presets apply only during builds; run the player build on CI to apply them",
            "Presets need Read/Write enabled; turn it on and then reimport the folder",
            "Presets apply on first import; add a postprocessor plus a CI validator",
            "Presets apply only to new folders; move the textures to a fresh folder"
          ],
          "answer": 2,
          "explain": "Default presets set values when an asset is first imported and never revisit existing assets. An AssetPostprocessor enforces the rule on every (re)import, and a batch-mode validator in CI catches anything that slips past."
        },
        {
          "q": "You add a validator rule that flags textures above 2048 px, but 600 existing textures violate it and CI would go red for everyone on day one. How do you roll it out?",
          "options": [
            "Ship it as a warning list first, then an error",
            "Fail CI immediately so the backlog gets cleared quickly",
            "Add a Preset for the folder and call it enforced",
            "Silently downsize all 600 with a postprocessor"
          ],
          "answer": 0,
          "explain": "Artists can clear a published backlog, then the rule flips to an error. A rule that blocks everyone at once tends to be disabled within the week."
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Optimization decisions are based on Play Mode timings in the Editor profiler",
              "use": "Profile a development build on device",
              "why": "Editor numbers include EditorLoop, a desktop CPU and GPU, and Mono JIT. Use Development Build plus Autoconnect Profiler on the target device, without Script Debugging, which adds its own cost."
            },
            {
              "signal": "Timeline shows the main thread finishing early, then waiting in `Gfx.WaitForPresentOnGfxThread`",
              "use": "GPU bound: cut GPU work",
              "why": "Script optimization will not move the frame. Lower render resolution as a test, then reduce fill rate, overdraw, post-processing or shader cost, using platform GPU tools for per-pass timings."
            },
            {
              "signal": "`Update` of a system costs 6 ms and you cannot tell which part, and Deep Profiling inflates call-heavy code",
              "use": "ProfilerMarker around suspect sections",
              "why": "Markers cost almost nothing when not recording and compile out of release builds, so leave them in. Use Deep Profiling only briefly to locate a region, never for numbers."
            },
            {
              "signal": "Someone claims a speedup from comparing one spiky frame before and after a change",
              "use": "Profile Analyzer before/after",
              "why": "Compare medians and worst frames over many frames of two captures on device. Single frames are noise; insist on a before and after capture for every claimed optimization."
            },
            {
              "signal": "Memory stays 300 MB higher after returning from a level to the main menu",
              "use": "Memory Profiler snapshot diff",
              "why": "Snapshot before the level and after returning, then diff: leaked objects appear with the reference chain pinning them, such as a static list or event. Snapshots are large and pause the game."
            },
            {
              "signal": "The Profiler says rendering is the cost and draw calls are higher than expected",
              "use": "Frame Debugger",
              "why": "Steps through every draw and states why consecutive draws did not batch (different material, shader keywords, lightmap). Works on a connected development build, not only the Editor."
            },
            {
              "signal": "The game holds 60 fps for a few minutes on a phone, then settles near 40 with the same content",
              "use": "Soak test with thermal headroom",
              "why": "Run 15-30 minute tests on mid-range devices and budget about 65-70% of the frame; cap at 30 fps or scale quality, via Adaptive Performance where supported."
            },
            {
              "signal": "A hot loop updates thousands of positions, projectiles or mesh vertices on the main thread",
              "use": "Jobs + Burst",
              "why": "`IJobParallelFor` over `NativeArray` runs on worker threads and Burst vectorizes it, often 10x or more. Needs blittable data, no managed objects, and explicit disposal of native containers."
            },
            {
              "signal": "Code calls `handle.Complete()` on the line right after `Schedule()`",
              "use": "Schedule early, complete late",
              "why": "Immediate completion makes the main thread wait for the job, removing most parallelism. Schedule as early as possible, do other work, complete only when results are needed."
            },
            {
              "signal": "Hierarchy sorted by GC Alloc shows steady kilobytes per frame and periodic GC spikes",
              "use": "Zero per-frame allocations",
              "why": "Cache arrays and strings, avoid LINQ and boxing in hot paths, use non-allocating API variants. Even incremental GC eventually spikes; allocation at load time is fine."
            },
            {
              "signal": "Hundreds of projectiles or effects are instantiated and destroyed every second",
              "use": "Object pool",
              "why": "Reuse deactivated instances instead of Instantiate/Destroy, removing allocation and setup cost. Pools hold memory at peak size and need careful state reset on reuse."
            },
            {
              "signal": "The design calls for tens of thousands of similar simulated units and GameObject overhead dominates",
              "use": "DOTS / Entities",
              "why": "Archetype chunks give tightly packed iteration with jobs and Burst. Costs a different programming model and tooling; most games are better served by Jobs + Burst on hot spots."
            }
          ]
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
        },
        {
          "q": "The profiler says rendering is expensive and you count 1,400 draw calls, far above what you expected. The materials look identical in the scene. Which tool should you use next?",
          "options": [
            "Deep Profiling, to count the draws per script",
            "Frame Debugger, to see why draws did not batch",
            "A Memory Profiler snapshot of the render targets",
            "`ProfilerMarker` around the camera render call"
          ],
          "answer": 1,
          "explain": "The Frame Debugger steps through every draw and states why it broke from the previous one, such as keywords or lightmaps. Deep Profiling measures script calls, not batch breaks."
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
          "type": "figure",
          "id": "unity-asmdef-split",
          "caption": "Editor-only assemblies never reach the player, and the arrows only point one way: Assembly-CSharp can reference an asmdef, an asmdef cannot see Assembly-CSharp.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 360\" role=\"img\" aria-label=\"Four assemblies compile in the Editor; only Game.Runtime and Assembly-CSharp go into the player build. Predefined assemblies can reference asmdef assemblies, not the reverse.\"> <style> .unity-asmdef-split-t{font-size:14px;fill:var(--fig-ink);font-weight:600} .unity-asmdef-split-s{font-size:12px;fill:var(--fig-muted)} .unity-asmdef-split-h{font-size:13px;fill:var(--fig-ink)} .unity-asmdef-split-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-asmdef-split-rt{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.75} .unity-asmdef-split-ed{fill:var(--fig-accent2);fill-opacity:.12;stroke:var(--fig-accent2);stroke-width:1.75} .unity-asmdef-split-ar{stroke:var(--fig-muted);stroke-width:1.75;fill:none} .unity-asmdef-split-ok{stroke:var(--fig-ok);stroke-width:2;fill:none} .unity-asmdef-split-bad{stroke:var(--fig-bad);stroke-width:2;fill:none;stroke-dasharray:5 4} .unity-asmdef-split-x{fill:var(--fig-bad);font-size:14px;font-weight:700} .unity-asmdef-split-go{fill:var(--fig-accent);fill-opacity:.25;stroke:var(--fig-accent);stroke-width:1.5;opacity:0;animation:unity-asmdef-split-move 6s ease-in-out infinite} .unity-asmdef-split-stay{fill:none;stroke:var(--fig-bad);stroke-width:2;stroke-dasharray:6 4;opacity:0;animation:unity-asmdef-split-pulse 6s ease-in-out infinite} @keyframes unity-asmdef-split-move{0%,8%{opacity:0;transform:translateX(0)}15%{opacity:1;transform:translateX(0)}60%{opacity:1;transform:translateX(426px)}72%,100%{opacity:0;transform:translateX(426px)}} @keyframes unity-asmdef-split-pulse{0%,20%{opacity:0}35%,60%{opacity:1}75%,100%{opacity:0}} </style> <defs> <marker id=\"unity-asmdef-split-a\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-muted)\"/></marker> <marker id=\"unity-asmdef-split-ag\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-ok)\"/></marker> <marker id=\"unity-asmdef-split-ab\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-bad)\"/></marker> </defs> <rect class=\"unity-asmdef-split-panel\" x=\"16\" y=\"30\" width=\"410\" height=\"260\" rx=\"12\"/> <text class=\"unity-asmdef-split-h\" x=\"32\" y=\"54\">Editor: all four assemblies compile</text> <rect class=\"unity-asmdef-split-panel\" x=\"442\" y=\"30\" width=\"182\" height=\"260\" rx=\"12\"/> <text class=\"unity-asmdef-split-h\" x=\"458\" y=\"54\">Player build</text> <rect class=\"unity-asmdef-split-rt\" x=\"32\" y=\"76\" width=\"150\" height=\"52\" rx=\"10\"/> <text class=\"unity-asmdef-split-t\" x=\"44\" y=\"98\">Game.Runtime</text> <text class=\"unity-asmdef-split-s\" x=\"44\" y=\"116\">asmdef, any platform</text> <rect class=\"unity-asmdef-split-ed\" x=\"232\" y=\"76\" width=\"178\" height=\"52\" rx=\"10\"/> <text class=\"unity-asmdef-split-t\" x=\"244\" y=\"98\">Game.Editor</text> <text class=\"unity-asmdef-split-s\" x=\"244\" y=\"116\">asmdef, Editor only</text> <rect class=\"unity-asmdef-split-rt\" x=\"32\" y=\"198\" width=\"150\" height=\"52\" rx=\"10\"/> <text class=\"unity-asmdef-split-t\" x=\"44\" y=\"220\">Assembly-CSharp</text> <text class=\"unity-asmdef-split-s\" x=\"44\" y=\"238\">predefined</text> <rect class=\"unity-asmdef-split-ed\" x=\"232\" y=\"198\" width=\"178\" height=\"52\" rx=\"10\"/> <text class=\"unity-asmdef-split-t\" x=\"244\" y=\"220\" style=\"font-size:13px\">Assembly-CSharp-Editor</text> <text class=\"unity-asmdef-split-s\" x=\"244\" y=\"238\">Editor/ folders</text> <rect class=\"unity-asmdef-split-stay\" x=\"226\" y=\"70\" width=\"190\" height=\"186\" rx=\"12\"/> <text class=\"unity-asmdef-split-s\" x=\"194\" y=\"94\">refs</text> <line class=\"unity-asmdef-split-ar\" x1=\"230\" y1=\"102\" x2=\"186\" y2=\"102\" marker-end=\"url(#unity-asmdef-split-a)\"/> <text class=\"unity-asmdef-split-s\" x=\"194\" y=\"216\">refs</text> <line class=\"unity-asmdef-split-ar\" x1=\"230\" y1=\"224\" x2=\"186\" y2=\"224\" marker-end=\"url(#unity-asmdef-split-a)\"/> <line class=\"unity-asmdef-split-ok\" x1=\"78\" y1=\"196\" x2=\"78\" y2=\"132\" marker-end=\"url(#unity-asmdef-split-ag)\"/> <line class=\"unity-asmdef-split-bad\" x1=\"136\" y1=\"130\" x2=\"136\" y2=\"194\" marker-end=\"url(#unity-asmdef-split-ab)\"/> <circle cx=\"136\" cy=\"162\" r=\"10\" style=\"fill:var(--fig-panel);stroke:var(--fig-bad);stroke-width:1.5\"/> <text class=\"unity-asmdef-split-x\" x=\"136\" y=\"167\" text-anchor=\"middle\">×</text> <rect class=\"unity-asmdef-split-rt\" x=\"458\" y=\"76\" width=\"150\" height=\"52\" rx=\"10\"/> <text class=\"unity-asmdef-split-t\" x=\"470\" y=\"98\">Game.Runtime</text> <text class=\"unity-asmdef-split-s\" x=\"470\" y=\"116\">shipped</text> <rect class=\"unity-asmdef-split-rt\" x=\"458\" y=\"198\" width=\"150\" height=\"52\" rx=\"10\"/> <text class=\"unity-asmdef-split-t\" x=\"470\" y=\"220\">Assembly-CSharp</text> <text class=\"unity-asmdef-split-s\" x=\"470\" y=\"238\">shipped</text> <text class=\"unity-asmdef-split-s\" x=\"458\" y=\"276\">no UnityEditor here</text> <rect class=\"unity-asmdef-split-go\" x=\"32\" y=\"76\" width=\"150\" height=\"52\" rx=\"10\"/> <rect class=\"unity-asmdef-split-go\" x=\"32\" y=\"198\" width=\"150\" height=\"52\" rx=\"10\"/> <line class=\"unity-asmdef-split-ok\" x1=\"24\" y1=\"318\" x2=\"60\" y2=\"318\" marker-end=\"url(#unity-asmdef-split-ag)\"/> <text class=\"unity-asmdef-split-h\" x=\"70\" y=\"323\">predefined can reference an asmdef</text> <line class=\"unity-asmdef-split-bad\" x1=\"24\" y1=\"344\" x2=\"60\" y2=\"344\" marker-end=\"url(#unity-asmdef-split-ab)\"/> <text class=\"unity-asmdef-split-h\" x=\"70\" y=\"349\">an asmdef cannot see Assembly-CSharp</text> <rect x=\"352\" y=\"310\" width=\"16\" height=\"16\" rx=\"4\" class=\"unity-asmdef-split-ed\"/> <text class=\"unity-asmdef-split-h\" x=\"376\" y=\"323\">Editor-only: excluded from players</text> </svg>"
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
          "type": "figure",
          "id": "unity-serialized-inspector",
          "caption": "The same value, two routes: through SerializedProperty you get undo, prefab overrides and dirtying for free; writing the field directly gets none of them.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"An inspector edit that goes through SerializedProperty gets undo, prefab override tracking and dirtying; writing the C# field directly skips all three.\"> <style> .unity-serialized-inspector-t{font-size:14px;fill:var(--fig-ink);font-weight:600} .unity-serialized-inspector-s{font-size:12px;fill:var(--fig-muted)} .unity-serialized-inspector-c{font-size:12px;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .unity-serialized-inspector-lo{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-serialized-inspector-lb{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-serialized-inspector-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-serialized-inspector-sp{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.75} .unity-serialized-inspector-ar{stroke:var(--fig-muted);stroke-width:1.75;fill:none} .unity-serialized-inspector-dash{stroke:var(--fig-bad);stroke-width:1.75;fill:none;stroke-dasharray:6 5} .unity-serialized-inspector-cok{fill:var(--fig-ok);fill-opacity:.12;stroke:var(--fig-ok);stroke-width:1.5} .unity-serialized-inspector-cbad{fill:var(--fig-bad);fill-opacity:.1;stroke:var(--fig-bad);stroke-width:1.5} .unity-serialized-inspector-ct{font-size:12px;fill:var(--fig-ink)} .unity-serialized-inspector-pa{animation:unity-serialized-inspector-a 7s ease-in-out infinite} .unity-serialized-inspector-pb{opacity:0;animation:unity-serialized-inspector-b 7s ease-in-out infinite} .unity-serialized-inspector-ga{opacity:0;animation:unity-serialized-inspector-g 7s ease-in-out infinite} .unity-serialized-inspector-gb{opacity:0;animation:unity-serialized-inspector-g 7s ease-in-out infinite;animation-delay:4.3s} .unity-serialized-inspector-pk{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2} .unity-serialized-inspector-pkb{fill:var(--fig-bad);stroke:var(--fig-bg);stroke-width:2} .unity-serialized-inspector-pt{font-size:12px;fill:var(--fig-bg);font-weight:700} @keyframes unity-serialized-inspector-a{0%{opacity:0;transform:translateX(0)}5%{opacity:1;transform:translateX(0)}18%,26%{opacity:1;transform:translateX(154px)}40%{opacity:1;transform:translateX(308px)}46%,100%{opacity:0;transform:translateX(308px)}} @keyframes unity-serialized-inspector-b{0%,50%{opacity:0;transform:translateX(0)}55%{opacity:1;transform:translateX(0)}88%{opacity:1;transform:translateX(228px)}94%,100%{opacity:0;transform:translateX(228px)}} @keyframes unity-serialized-inspector-g{0%,18%{opacity:0}24%,40%{opacity:1}48%,100%{opacity:0}} </style> <defs><marker id=\"unity-serialized-inspector-a\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-muted)\"/></marker> <marker id=\"unity-serialized-inspector-ab\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-bad)\"/></marker></defs> <text class=\"unity-serialized-inspector-lo\" x=\"16\" y=\"30\">Through SerializedObject</text> <rect class=\"unity-serialized-inspector-box\" x=\"16\" y=\"44\" width=\"150\" height=\"56\" rx=\"10\"/> <text class=\"unity-serialized-inspector-t\" x=\"28\" y=\"67\">Inspector</text> <text class=\"unity-serialized-inspector-s\" x=\"28\" y=\"87\">field \"count\" = 5</text> <line class=\"unity-serialized-inspector-ar\" x1=\"168\" y1=\"72\" x2=\"224\" y2=\"72\" marker-end=\"url(#unity-serialized-inspector-a)\"/> <rect class=\"unity-serialized-inspector-sp\" x=\"226\" y=\"44\" width=\"188\" height=\"56\" rx=\"10\"/> <text class=\"unity-serialized-inspector-t\" x=\"238\" y=\"67\">SerializedProperty</text> <text class=\"unity-serialized-inspector-s\" x=\"238\" y=\"87\">serialized data on disk</text> <line class=\"unity-serialized-inspector-ar\" x1=\"416\" y1=\"72\" x2=\"472\" y2=\"72\" marker-end=\"url(#unity-serialized-inspector-a)\"/> <rect class=\"unity-serialized-inspector-box\" x=\"474\" y=\"44\" width=\"150\" height=\"56\" rx=\"10\"/> <text class=\"unity-serialized-inspector-t\" x=\"486\" y=\"67\">Spawner</text> <text class=\"unity-serialized-inspector-c\" x=\"486\" y=\"87\">count: 5</text> <rect class=\"unity-serialized-inspector-ga\" x=\"146\" y=\"110\" width=\"370\" height=\"38\" rx=\"12\" style=\"fill:var(--fig-ok);fill-opacity:.12\"/> <rect class=\"unity-serialized-inspector-cok\" x=\"152\" y=\"116\" width=\"96\" height=\"26\" rx=\"8\"/> <text class=\"unity-serialized-inspector-ct\" x=\"200\" y=\"133\" text-anchor=\"middle\">Undo ✓</text> <rect class=\"unity-serialized-inspector-cok\" x=\"258\" y=\"116\" width=\"150\" height=\"26\" rx=\"8\"/> <text class=\"unity-serialized-inspector-ct\" x=\"333\" y=\"133\" text-anchor=\"middle\"><tspan font-weight=\"700\">Prefab override</tspan> ✓</text> <rect class=\"unity-serialized-inspector-cok\" x=\"418\" y=\"116\" width=\"92\" height=\"26\" rx=\"8\"/> <text class=\"unity-serialized-inspector-ct\" x=\"464\" y=\"133\" text-anchor=\"middle\">Dirty ✓</text> <g class=\"unity-serialized-inspector-pa\"><circle class=\"unity-serialized-inspector-pk\" cx=\"166\" cy=\"72\" r=\"11\"/><text class=\"unity-serialized-inspector-pt\" x=\"166\" y=\"76\" text-anchor=\"middle\">5</text></g> <line x1=\"16\" y1=\"172\" x2=\"624\" y2=\"172\" style=\"stroke:var(--fig-line);stroke-width:1\"/> <text class=\"unity-serialized-inspector-lb\" x=\"16\" y=\"200\">Writing the field directly</text> <rect class=\"unity-serialized-inspector-box\" x=\"16\" y=\"214\" width=\"230\" height=\"56\" rx=\"10\"/> <text class=\"unity-serialized-inspector-t\" x=\"28\" y=\"237\">Your editor code</text> <text class=\"unity-serialized-inspector-c\" x=\"28\" y=\"257\">((Spawner)target).count = 5</text> <path class=\"unity-serialized-inspector-dash\" d=\"M248 242H470\" marker-end=\"url(#unity-serialized-inspector-ab)\"/> <text class=\"unity-serialized-inspector-s\" x=\"360\" y=\"234\" text-anchor=\"middle\">skips SerializedProperty</text> <rect class=\"unity-serialized-inspector-box\" x=\"474\" y=\"214\" width=\"150\" height=\"56\" rx=\"10\"/> <text class=\"unity-serialized-inspector-t\" x=\"486\" y=\"237\">Spawner</text> <text class=\"unity-serialized-inspector-c\" x=\"486\" y=\"257\">count: 5</text> <rect class=\"unity-serialized-inspector-gb\" x=\"146\" y=\"278\" width=\"370\" height=\"38\" rx=\"12\" style=\"fill:var(--fig-bad);fill-opacity:.1\"/> <rect class=\"unity-serialized-inspector-cbad\" x=\"152\" y=\"284\" width=\"96\" height=\"26\" rx=\"8\"/> <text class=\"unity-serialized-inspector-ct\" x=\"200\" y=\"301\" text-anchor=\"middle\">No undo</text> <rect class=\"unity-serialized-inspector-cbad\" x=\"258\" y=\"284\" width=\"150\" height=\"26\" rx=\"8\"/> <text class=\"unity-serialized-inspector-ct\" x=\"333\" y=\"301\" text-anchor=\"middle\">No override</text> <rect class=\"unity-serialized-inspector-cbad\" x=\"418\" y=\"284\" width=\"92\" height=\"26\" rx=\"8\"/> <text class=\"unity-serialized-inspector-ct\" x=\"464\" y=\"301\" text-anchor=\"middle\">May not save</text> <g class=\"unity-serialized-inspector-pb\"><circle class=\"unity-serialized-inspector-pkb\" cx=\"246\" cy=\"242\" r=\"11\"/><text class=\"unity-serialized-inspector-pt\" x=\"246\" y=\"246\" text-anchor=\"middle\">5</text></g> </svg>"
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
          "type": "figure",
          "id": "unity-import-rules",
          "caption": "OnPreprocessTexture rewrites the importer settings before the import runs; the bars show why one forgotten setting matters.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 366\" role=\"img\" aria-label=\"A texture imported under Assets/Art/UI passes through OnPreprocessTexture, which sets Sprite, no mipmaps and max size 2048 before the importer runs. Bars to scale: 16 MB RGBA32, about 21 MB with mipmaps, under 2 MB as ASTC 6x6.\"> <style> .unity-import-rules-t{font-size:14px;fill:var(--fig-ink);font-weight:600} .unity-import-rules-h{font-size:13px;fill:var(--fig-ink)} .unity-import-rules-s{font-size:12px;fill:var(--fig-muted)} .unity-import-rules-c{font-size:12px;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .unity-import-rules-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-import-rules-hook{fill:var(--fig-accent);fill-opacity:.1;stroke:var(--fig-accent);stroke-width:1.75} .unity-import-rules-ar{stroke:var(--fig-muted);stroke-width:1.75;fill:none} .unity-import-rules-hl{fill:var(--fig-accent);fill-opacity:.22;opacity:0;animation:unity-import-rules-hl 6s ease-in-out infinite} .unity-import-rules-chip{animation:unity-import-rules-mv 6s ease-in-out infinite} .unity-import-rules-bb{fill:var(--fig-bad);fill-opacity:.22;stroke:var(--fig-bad);stroke-width:1.5} .unity-import-rules-bw{fill:var(--fig-warn);fill-opacity:.22;stroke:var(--fig-warn);stroke-width:1.5} .unity-import-rules-bo{fill:var(--fig-ok);fill-opacity:.3;stroke:var(--fig-ok);stroke-width:1.5} @keyframes unity-import-rules-mv{0%{opacity:0;transform:translateX(0)}6%{opacity:1;transform:translateX(0)}18%,52%{opacity:1;transform:translateX(204px)}68%{opacity:1;transform:translateX(314px)}84%{opacity:1;transform:translateX(452px)}92%,100%{opacity:0;transform:translateX(452px)}} @keyframes unity-import-rules-hl{0%,18%{opacity:0}23%,48%{opacity:1}56%,100%{opacity:0}} </style> <defs><marker id=\"unity-import-rules-a\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-muted)\"/></marker></defs> <rect class=\"unity-import-rules-box\" x=\"16\" y=\"52\" width=\"124\" height=\"56\" rx=\"10\"/> <text class=\"unity-import-rules-t\" x=\"28\" y=\"75\">icon.png</text> <text class=\"unity-import-rules-c\" x=\"28\" y=\"95\">Assets/Art/UI/</text> <line class=\"unity-import-rules-ar\" x1=\"142\" y1=\"80\" x2=\"160\" y2=\"80\" marker-end=\"url(#unity-import-rules-a)\"/> <rect class=\"unity-import-rules-hook\" x=\"164\" y=\"36\" width=\"184\" height=\"128\" rx=\"12\"/> <text class=\"unity-import-rules-t\" x=\"176\" y=\"60\">OnPreprocessTexture</text> <text class=\"unity-import-rules-s\" x=\"176\" y=\"79\">path in Assets/Art/UI/</text> <rect class=\"unity-import-rules-hl\" x=\"170\" y=\"91\" width=\"172\" height=\"20\" rx=\"5\"/> <rect class=\"unity-import-rules-hl\" x=\"170\" y=\"113\" width=\"172\" height=\"20\" rx=\"5\" style=\"animation-delay:.25s\"/> <rect class=\"unity-import-rules-hl\" x=\"170\" y=\"135\" width=\"172\" height=\"20\" rx=\"5\" style=\"animation-delay:.5s\"/> <text class=\"unity-import-rules-c\" x=\"176\" y=\"105\">textureType = Sprite</text> <text class=\"unity-import-rules-c\" x=\"176\" y=\"127\">mipmapEnabled = false</text> <text class=\"unity-import-rules-c\" x=\"176\" y=\"149\">maxTextureSize = 2048</text> <line class=\"unity-import-rules-ar\" x1=\"350\" y1=\"80\" x2=\"372\" y2=\"80\" marker-end=\"url(#unity-import-rules-a)\"/> <rect class=\"unity-import-rules-box\" x=\"376\" y=\"52\" width=\"128\" height=\"56\" rx=\"10\"/> <text class=\"unity-import-rules-t\" x=\"388\" y=\"75\" style=\"font-size:13px\">TextureImporter</text> <text class=\"unity-import-rules-s\" x=\"388\" y=\"95\">uses new settings</text> <line class=\"unity-import-rules-ar\" x1=\"506\" y1=\"80\" x2=\"528\" y2=\"80\" marker-end=\"url(#unity-import-rules-a)\"/> <rect class=\"unity-import-rules-box\" x=\"532\" y=\"52\" width=\"92\" height=\"56\" rx=\"10\"/> <text class=\"unity-import-rules-t\" x=\"544\" y=\"75\">Library/</text> <text class=\"unity-import-rules-s\" x=\"544\" y=\"95\">imported</text> <g class=\"unity-import-rules-chip\"><rect x=\"110\" y=\"70\" width=\"32\" height=\"20\" rx=\"6\" style=\"fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2\"/><text x=\"126\" y=\"84\" text-anchor=\"middle\" style=\"font-size:11px;font-weight:700;fill:var(--fig-bg)\">png</text></g> <text class=\"unity-import-rules-h\" x=\"16\" y=\"206\">One 2048×2048 texture in memory, drawn to scale</text> <text class=\"unity-import-rules-h\" x=\"16\" y=\"239\">RGBA32</text> <rect class=\"unity-import-rules-bb\" x=\"150\" y=\"222\" width=\"304\" height=\"24\" rx=\"6\"/> <text class=\"unity-import-rules-h\" x=\"462\" y=\"239\">16 MB</text> <text class=\"unity-import-rules-h\" x=\"16\" y=\"275\">RGBA32 + mipmaps</text> <rect class=\"unity-import-rules-bw\" x=\"150\" y=\"258\" width=\"405\" height=\"24\" rx=\"6\"/> <rect x=\"454\" y=\"258\" width=\"101\" height=\"24\" rx=\"6\" style=\"fill:var(--fig-warn);fill-opacity:.25\"/> <text class=\"unity-import-rules-h\" x=\"563\" y=\"275\">≈21 MB</text> <text class=\"unity-import-rules-h\" x=\"16\" y=\"311\">ASTC 6×6</text> <rect class=\"unity-import-rules-bo\" x=\"150\" y=\"294\" width=\"34\" height=\"24\" rx=\"6\"/> <text class=\"unity-import-rules-h\" x=\"192\" y=\"311\">&lt; 2 MB</text> <text class=\"unity-import-rules-s\" x=\"16\" y=\"348\">The rule runs at import on every machine and in CI; bump GetVersion() when rules change.</text> </svg>"
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A tool writes `((Door)target).locked = true` and the change is not undoable and vanishes on reload",
              "use": "Edit via SerializedObject",
              "why": "`SerializedProperty` edits give undo, multi-object editing, prefab override tracking and dirtying for free. Remember `ApplyModifiedProperties()` after changes."
            },
            {
              "signal": "A button must mutate a component directly, such as rebuilding a list from child Transforms",
              "use": "Undo.RecordObject + prefab override record",
              "why": "Record before the change (also marks dirty), then `PrefabUtility.RecordPrefabInstancePropertyModifications` for prefab instances. `EditorUtility.SetDirty` alone loses undo and overrides."
            },
            {
              "signal": "The same min/max or ID-picker field appears on many components and each draws it differently",
              "use": "PropertyDrawer + PropertyAttribute",
              "why": "Write the drawer once and every field tagged with the attribute renders it in any inspector. Scope is one field; use a custom editor for whole-component layout or buttons."
            },
            {
              "signal": "Designers need buttons, validation hints or grouped fields on one component's inspector",
              "use": "Custom Editor (UI Toolkit)",
              "why": "`[CustomEditor]` with `CreateInspectorGUI` builds a retained tree; `PropertyField` keeps default drawing and binding. IMGUI remains in legacy code but redraws every repaint."
            },
            {
              "signal": "A designer repeats a multi-step workflow across many assets or scene objects by hand",
              "use": "EditorWindow tool",
              "why": "A dockable panel built in `CreateGUI` can hold state, lists and batch operations. Costs ongoing maintenance, so build it where the repeated time clearly exceeds that."
            },
            {
              "signal": "An occasional one-shot action (validate spawns, rebuild atlas) lives in a doc as manual steps",
              "use": "MenuItem with validate method",
              "why": "A static `[MenuItem]` gives a discoverable entry, and a validate method greys it out when not applicable. The same static method can be the batch-mode entry point."
            },
            {
              "signal": "The Editor runs fine but the player build fails with `UnityEditor could not be found`",
              "use": "Editor-only asmdef",
              "why": "Put editor code in an asmdef whose platforms include only Editor, referencing the runtime asmdef. Inside an asmdef folder the special `Editor` folder rule no longer applies."
            },
            {
              "signal": "A one-line change to an editor window triggers a 25 second recompile of all gameplay code",
              "use": "Split code with assembly definitions",
              "why": "Only the changed assembly and its dependents recompile. Costs explicit references: asmdef code cannot see `Assembly-CSharp`, so dependencies must get asmdefs too."
            },
            {
              "signal": "Import rules, scene lists or enemy stats are hard-coded constants inside tool code",
              "use": "ScriptableObject settings asset",
              "why": "Code holds behaviour, a `[CreateAssetMenu]` asset holds the knobs designers own, and changes are diffable text. Tools must handle the asset being missing or edited mid-session."
            },
            {
              "signal": "A CI job must bake, validate or build without anyone clicking in the Editor",
              "use": "-executeMethod with exit codes",
              "why": "Run a static method with `-batchmode -quit -logFile -` and call `EditorApplication.Exit(1)` on failure. No dialogs in batch mode, and cache `Library` to avoid long cold imports."
            },
            {
              "signal": "A runtime class needs a small editor-only hook such as an `OnValidate` that calls `AssetDatabase`",
              "use": "Narrow #if UNITY_EDITOR block",
              "why": "Keeps the hook out of the player without a separate assembly. Each block is a place where Editor and player diverge, so keep them tiny and never around serialized fields."
            },
            {
              "signal": "Missing scripts and broken references are only found when someone happens to open a scene",
              "use": "Project validator menu + batch",
              "why": "One validator for missing scripts, broken references and import rules, runnable from a menu and `-executeMethod`. Becomes the verification step for humans, CI and agents."
            }
          ]
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
        },
        {
          "q": "Twelve components each draw a min/max range field with hand-written inspector code, and every one looks slightly different. What should you reach for?",
          "options": [
            "A shared static helper copied into each custom editor",
            "An EditorWindow that lists every range field",
            "A PropertyDrawer bound to a custom PropertyAttribute",
            "A ScriptableObject holding all the range values"
          ],
          "answer": 2,
          "explain": "Tag each field with the attribute and one drawer renders it identically in any inspector. A shared helper still needs a custom editor per component to call it."
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
          "type": "figure",
          "id": "unity-mono-il2cpp",
          "caption": "Mono defers compilation to the device with a JIT; IL2CPP does all the work at build time, which is why its builds are slow and its players need no JIT.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"C# compiles to IL. Mono ships the IL and JIT-compiles it at runtime. IL2CPP strips the IL, converts it to C++ and compiles it with the platform's native compiler at build time, so the device runs AOT machine code.\"> <style> .unity-mono-il2cpp-t{font-size:14px;fill:var(--fig-ink);font-weight:600} .unity-mono-il2cpp-h{font-size:13px;fill:var(--fig-ink)} .unity-mono-il2cpp-s{font-size:12px;fill:var(--fig-muted)} .unity-mono-il2cpp-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-mono-il2cpp-m{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.75} .unity-mono-il2cpp-i{fill:var(--fig-accent2);fill-opacity:.12;stroke:var(--fig-accent2);stroke-width:1.75} .unity-mono-il2cpp-ar{stroke:var(--fig-muted);stroke-width:1.75;fill:none} .unity-mono-il2cpp-g{fill:none;stroke-width:3;opacity:0} .unity-mono-il2cpp-gm{stroke:var(--fig-accent)} .unity-mono-il2cpp-gi{stroke:var(--fig-accent2)} @keyframes unity-mono-il2cpp-k1{0%,3%{opacity:0}6%,16%{opacity:1}20%,100%{opacity:0}} @keyframes unity-mono-il2cpp-k2{0%,20%{opacity:0}24%{opacity:1}36%{opacity:.35}48%{opacity:1}60%{opacity:.35}72%{opacity:1}84%{opacity:.35}92%{opacity:1}97%,100%{opacity:0}} @keyframes unity-mono-il2cpp-k3{0%,3%{opacity:0}6%,22%{opacity:1}26%,100%{opacity:0}} @keyframes unity-mono-il2cpp-k4{0%,24%{opacity:0}28%,44%{opacity:1}48%,100%{opacity:0}} @keyframes unity-mono-il2cpp-k5{0%,46%{opacity:0}50%,70%{opacity:1}74%,100%{opacity:0}} @keyframes unity-mono-il2cpp-k6{0%,74%{opacity:0}78%,94%{opacity:1}98%,100%{opacity:0}} </style> <defs><marker id=\"unity-mono-il2cpp-a\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-muted)\"/></marker></defs> <text class=\"unity-mono-il2cpp-s\" x=\"250\" y=\"24\" text-anchor=\"middle\">BUILD TIME</text> <text class=\"unity-mono-il2cpp-s\" x=\"567\" y=\"24\" text-anchor=\"middle\">RUNTIME, ON DEVICE</text> <line x1=\"490\" y1=\"34\" x2=\"490\" y2=\"246\" style=\"stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 5\"/> <rect class=\"unity-mono-il2cpp-box\" x=\"16\" y=\"133\" width=\"56\" height=\"44\" rx=\"10\"/> <text class=\"unity-mono-il2cpp-t\" x=\"44\" y=\"160\" text-anchor=\"middle\">C#</text> <line class=\"unity-mono-il2cpp-ar\" x1=\"74\" y1=\"155\" x2=\"98\" y2=\"155\" marker-end=\"url(#unity-mono-il2cpp-a)\"/> <rect class=\"unity-mono-il2cpp-box\" x=\"102\" y=\"133\" width=\"56\" height=\"44\" rx=\"10\"/> <text class=\"unity-mono-il2cpp-t\" x=\"130\" y=\"160\" text-anchor=\"middle\">IL</text> <text class=\"unity-mono-il2cpp-s\" x=\"87\" y=\"196\" text-anchor=\"middle\">compile</text> <path class=\"unity-mono-il2cpp-ar\" d=\"M160 148C180 148 174 90 192 90\" marker-end=\"url(#unity-mono-il2cpp-a)\"/> <path class=\"unity-mono-il2cpp-ar\" d=\"M160 162C180 162 174 216 192 216\" marker-end=\"url(#unity-mono-il2cpp-a)\"/> <text x=\"196\" y=\"60\" style=\"font-size:14px;font-weight:700;fill:var(--fig-accent)\">Mono</text> <rect class=\"unity-mono-il2cpp-m\" x=\"196\" y=\"70\" width=\"110\" height=\"40\" rx=\"10\"/> <text class=\"unity-mono-il2cpp-h\" x=\"251\" y=\"95\" text-anchor=\"middle\">ships IL</text> <rect class=\"unity-mono-il2cpp-g unity-mono-il2cpp-gm\" x=\"193\" y=\"67\" width=\"116\" height=\"46\" rx=\"12\" style=\"animation:unity-mono-il2cpp-k1 8s infinite\"/> <line class=\"unity-mono-il2cpp-ar\" x1=\"308\" y1=\"90\" x2=\"506\" y2=\"90\" marker-end=\"url(#unity-mono-il2cpp-a)\"/> <rect class=\"unity-mono-il2cpp-m\" x=\"510\" y=\"66\" width=\"114\" height=\"48\" rx=\"10\"/> <text class=\"unity-mono-il2cpp-h\" x=\"567\" y=\"86\" text-anchor=\"middle\">JIT compiles</text> <text class=\"unity-mono-il2cpp-s\" x=\"567\" y=\"104\" text-anchor=\"middle\">at runtime</text> <rect class=\"unity-mono-il2cpp-g unity-mono-il2cpp-gm\" x=\"507\" y=\"63\" width=\"120\" height=\"54\" rx=\"12\" style=\"animation:unity-mono-il2cpp-k2 8s infinite\"/> <text class=\"unity-mono-il2cpp-s\" x=\"196\" y=\"134\">seconds per build, fine for desktop iteration</text> <text x=\"196\" y=\"186\" style=\"font-size:14px;font-weight:700;fill:var(--fig-accent2)\">IL2CPP</text> <rect class=\"unity-mono-il2cpp-i\" x=\"196\" y=\"196\" width=\"64\" height=\"40\" rx=\"10\"/> <text class=\"unity-mono-il2cpp-h\" x=\"228\" y=\"221\" text-anchor=\"middle\">strip</text> <line class=\"unity-mono-il2cpp-ar\" x1=\"261\" y1=\"216\" x2=\"273\" y2=\"216\" marker-end=\"url(#unity-mono-il2cpp-a)\"/> <rect class=\"unity-mono-il2cpp-i\" x=\"276\" y=\"196\" width=\"60\" height=\"40\" rx=\"10\"/> <text class=\"unity-mono-il2cpp-h\" x=\"306\" y=\"221\" text-anchor=\"middle\">C++</text> <line class=\"unity-mono-il2cpp-ar\" x1=\"337\" y1=\"216\" x2=\"349\" y2=\"216\" marker-end=\"url(#unity-mono-il2cpp-a)\"/> <rect class=\"unity-mono-il2cpp-i\" x=\"352\" y=\"196\" width=\"122\" height=\"40\" rx=\"10\"/> <text class=\"unity-mono-il2cpp-h\" x=\"413\" y=\"221\" text-anchor=\"middle\">native compiler</text> <line class=\"unity-mono-il2cpp-ar\" x1=\"476\" y1=\"216\" x2=\"506\" y2=\"216\" marker-end=\"url(#unity-mono-il2cpp-a)\"/> <rect class=\"unity-mono-il2cpp-i\" x=\"510\" y=\"192\" width=\"114\" height=\"48\" rx=\"10\"/> <text class=\"unity-mono-il2cpp-h\" x=\"567\" y=\"212\" text-anchor=\"middle\">machine code</text> <text class=\"unity-mono-il2cpp-s\" x=\"567\" y=\"230\" text-anchor=\"middle\">AOT, no JIT</text> <rect class=\"unity-mono-il2cpp-g unity-mono-il2cpp-gi\" x=\"193\" y=\"193\" width=\"70\" height=\"46\" rx=\"12\" style=\"animation:unity-mono-il2cpp-k3 8s infinite\"/> <rect class=\"unity-mono-il2cpp-g unity-mono-il2cpp-gi\" x=\"273\" y=\"193\" width=\"66\" height=\"46\" rx=\"12\" style=\"animation:unity-mono-il2cpp-k4 8s infinite\"/> <rect class=\"unity-mono-il2cpp-g unity-mono-il2cpp-gi\" x=\"349\" y=\"193\" width=\"128\" height=\"46\" rx=\"12\" style=\"animation:unity-mono-il2cpp-k5 8s infinite\"/> <rect class=\"unity-mono-il2cpp-g unity-mono-il2cpp-gi\" x=\"507\" y=\"189\" width=\"120\" height=\"54\" rx=\"12\" style=\"animation:unity-mono-il2cpp-k6 8s infinite\"/> <text class=\"unity-mono-il2cpp-s\" x=\"196\" y=\"266\">minutes per build; required on iOS, WebGL, consoles, ARM64 Android</text> </svg>"
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
          "type": "figure",
          "id": "unity-stripping-linkxml",
          "caption": "A type reached only by name through reflection looks unused to the linker; link.xml is what keeps it in the player.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 340\" role=\"img\" aria-label=\"The Unity linker keeps code reachable from roots such as scenes and MonoBehaviours. SaveData is only created by type name through reflection, so without link.xml it is stripped and fails at runtime with MissingMethodException; link.xml preserves it.\"> <style> .unity-stripping-linkxml-t{font-size:14px;fill:var(--fig-ink);font-weight:600} .unity-stripping-linkxml-s{font-size:12px;fill:var(--fig-muted)} .unity-stripping-linkxml-k{fill:var(--fig-ok);fill-opacity:.1;stroke:var(--fig-ok);stroke-width:1.75} .unity-stripping-linkxml-x{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:5 4} .unity-stripping-linkxml-ar{stroke:var(--fig-muted);stroke-width:1.75;fill:none} .unity-stripping-linkxml-m{fill:none;stroke:var(--fig-ok);stroke-width:3.5;opacity:0;animation:unity-stripping-linkxml-mk 8s ease-out infinite} .unity-stripping-linkxml-lx{animation:unity-stripping-linkxml-off 8s ease-in-out infinite} .unity-stripping-linkxml-sd{animation:unity-stripping-linkxml-dim 8s ease-in-out infinite} .unity-stripping-linkxml-on{opacity:0;animation:unity-stripping-linkxml-err 8s ease-in-out infinite} @keyframes unity-stripping-linkxml-mk{0%{opacity:0}3%{opacity:1}12%,100%{opacity:0}} @keyframes unity-stripping-linkxml-off{0%,48%{opacity:1}54%,90%{opacity:.15}96%,100%{opacity:1}} @keyframes unity-stripping-linkxml-dim{0%,52%{opacity:1}60%,90%{opacity:.3}96%,100%{opacity:1}} @keyframes unity-stripping-linkxml-err{0%,56%{opacity:0}62%,90%{opacity:1}96%,100%{opacity:0}} </style> <defs><marker id=\"unity-stripping-linkxml-a\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-muted)\"/></marker> <marker id=\"unity-stripping-linkxml-ak\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-accent)\"/></marker></defs> <text class=\"unity-stripping-linkxml-s\" x=\"16\" y=\"30\">The linker keeps what it can reach from roots, and removes the rest</text> <rect class=\"unity-stripping-linkxml-k\" x=\"16\" y=\"56\" width=\"96\" height=\"44\" rx=\"10\"/> <text class=\"unity-stripping-linkxml-t\" x=\"28\" y=\"75\">Scene</text> <text class=\"unity-stripping-linkxml-s\" x=\"28\" y=\"92\">root</text> <line class=\"unity-stripping-linkxml-ar\" x1=\"114\" y1=\"78\" x2=\"144\" y2=\"78\" marker-end=\"url(#unity-stripping-linkxml-a)\"/> <rect class=\"unity-stripping-linkxml-k\" x=\"148\" y=\"56\" width=\"180\" height=\"44\" rx=\"10\"/> <text class=\"unity-stripping-linkxml-t\" x=\"160\" y=\"75\">Player</text> <text class=\"unity-stripping-linkxml-s\" x=\"160\" y=\"92\">MonoBehaviour, root</text> <line class=\"unity-stripping-linkxml-ar\" x1=\"330\" y1=\"78\" x2=\"360\" y2=\"78\" marker-end=\"url(#unity-stripping-linkxml-a)\"/> <rect class=\"unity-stripping-linkxml-k\" x=\"364\" y=\"56\" width=\"160\" height=\"44\" rx=\"10\"/> <text class=\"unity-stripping-linkxml-t\" x=\"376\" y=\"75\">SaveSystem</text> <text class=\"unity-stripping-linkxml-s\" x=\"376\" y=\"92\">called method</text> <line class=\"unity-stripping-linkxml-ar\" x1=\"238\" y1=\"102\" x2=\"238\" y2=\"142\" marker-end=\"url(#unity-stripping-linkxml-a)\"/> <rect class=\"unity-stripping-linkxml-k\" x=\"148\" y=\"146\" width=\"180\" height=\"44\" rx=\"10\"/> <text class=\"unity-stripping-linkxml-t\" x=\"160\" y=\"165\">Damage</text> <text class=\"unity-stripping-linkxml-s\" x=\"160\" y=\"182\">called method</text> <line class=\"unity-stripping-linkxml-ar\" x1=\"444\" y1=\"102\" x2=\"444\" y2=\"142\" marker-end=\"url(#unity-stripping-linkxml-a)\"/> <rect class=\"unity-stripping-linkxml-k\" x=\"364\" y=\"146\" width=\"160\" height=\"44\" rx=\"10\"/> <text class=\"unity-stripping-linkxml-t\" x=\"376\" y=\"165\" style=\"font-size:13px\">JSON deserializer</text> <text class=\"unity-stripping-linkxml-s\" x=\"376\" y=\"182\">called method</text> <rect class=\"unity-stripping-linkxml-m\" x=\"13\" y=\"53\" width=\"102\" height=\"50\" rx=\"12\"/> <rect class=\"unity-stripping-linkxml-m\" x=\"145\" y=\"53\" width=\"186\" height=\"50\" rx=\"12\" style=\"animation-delay:.35s\"/> <rect class=\"unity-stripping-linkxml-m\" x=\"361\" y=\"53\" width=\"166\" height=\"50\" rx=\"12\" style=\"animation-delay:.7s\"/> <rect class=\"unity-stripping-linkxml-m\" x=\"145\" y=\"143\" width=\"186\" height=\"50\" rx=\"12\" style=\"animation-delay:.7s\"/> <rect class=\"unity-stripping-linkxml-m\" x=\"361\" y=\"143\" width=\"166\" height=\"50\" rx=\"12\" style=\"animation-delay:1.05s\"/> <g opacity=\".5\"><rect class=\"unity-stripping-linkxml-x\" x=\"148\" y=\"236\" width=\"180\" height=\"44\" rx=\"10\"/> <text class=\"unity-stripping-linkxml-t\" x=\"160\" y=\"255\">OldMenu</text> <text class=\"unity-stripping-linkxml-s\" x=\"160\" y=\"272\">never referenced: stripped</text></g> <line x1=\"444\" y1=\"192\" x2=\"444\" y2=\"232\" style=\"stroke:var(--fig-warn);stroke-width:1.75;stroke-dasharray:4 4\"/> <text x=\"454\" y=\"217\" style=\"font-size:12px;fill:var(--fig-warn)\">by type name</text> <g class=\"unity-stripping-linkxml-sd\"><rect class=\"unity-stripping-linkxml-k\" x=\"364\" y=\"236\" width=\"160\" height=\"44\" rx=\"10\"/> <text class=\"unity-stripping-linkxml-t\" x=\"376\" y=\"255\" style=\"font-size:13px\">Game.Save.SaveData</text> <text class=\"unity-stripping-linkxml-s\" x=\"376\" y=\"272\">DTO, reflection only</text></g> <rect class=\"unity-stripping-linkxml-on\" x=\"364\" y=\"236\" width=\"160\" height=\"44\" rx=\"10\" style=\"fill:none;stroke:var(--fig-bad);stroke-width:2;stroke-dasharray:6 4\"/> <g class=\"unity-stripping-linkxml-lx\"><rect x=\"554\" y=\"236\" width=\"70\" height=\"44\" rx=\"10\" style=\"fill:var(--fig-accent);fill-opacity:.14;stroke:var(--fig-accent);stroke-width:1.75\"/> <text x=\"589\" y=\"263\" text-anchor=\"middle\" style=\"font-size:13px;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace\">link.xml</text> <line x1=\"552\" y1=\"258\" x2=\"528\" y2=\"258\" style=\"stroke:var(--fig-accent);stroke-width:1.75\" marker-end=\"url(#unity-stripping-linkxml-ak)\"/></g> <text class=\"unity-stripping-linkxml-on\" x=\"624\" y=\"306\" text-anchor=\"end\" style=\"font-size:13px;font-weight:600;fill:var(--fig-bad)\">without link.xml: MissingMethodException</text> <rect x=\"16\" y=\"300\" width=\"14\" height=\"14\" rx=\"4\" class=\"unity-stripping-linkxml-k\"/> <text class=\"unity-stripping-linkxml-s\" x=\"38\" y=\"312\">kept</text> <rect x=\"84\" y=\"300\" width=\"14\" height=\"14\" rx=\"4\" class=\"unity-stripping-linkxml-x\"/> <text class=\"unity-stripping-linkxml-s\" x=\"106\" y=\"312\">stripped</text> </svg>"
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
          "type": "figure",
          "id": "unity-tests-ci",
          "caption": "A CI run in batch mode, and why EditMode tests carry most of the load: they take milliseconds where a PlayMode test takes seconds.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"A CI pipeline restores the Library cache, runs EditMode and PlayMode tests with -runTests, makes an IL2CPP build and reports results.xml and an exit code. EditMode tests take milliseconds each; a PlayMode test takes seconds.\"> <style> .unity-tests-ci-t{font-size:13px;fill:var(--fig-ink);font-weight:600} .unity-tests-ci-h{font-size:13px;fill:var(--fig-ink)} .unity-tests-ci-s{font-size:12px;fill:var(--fig-muted)} .unity-tests-ci-c{font-size:12px;fill:var(--fig-muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .unity-tests-ci-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-tests-ci-ok{fill:var(--fig-ok);fill-opacity:.12;stroke:var(--fig-ok);stroke-width:1.75} .unity-tests-ci-ar{stroke:var(--fig-muted);stroke-width:1.75;fill:none} .unity-tests-ci-g{fill:none;stroke:var(--fig-accent);stroke-width:3;opacity:0;animation:unity-tests-ci-run 7s ease-in-out infinite} .unity-tests-ci-ph{animation:unity-tests-ci-play 7s linear infinite} @keyframes unity-tests-ci-run{0%{opacity:0}3%,15%{opacity:1}19%,100%{opacity:0}} @keyframes unity-tests-ci-play{0%{transform:translateX(0)}100%{transform:translateX(450px)}} </style> <defs><marker id=\"unity-tests-ci-a\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-muted)\"/></marker></defs> <text class=\"unity-tests-ci-s\" x=\"16\" y=\"30\">CI job, all in -batchmode on one runner</text> <rect class=\"unity-tests-ci-box\" x=\"16\" y=\"48\" width=\"104\" height=\"60\" rx=\"10\"/><text class=\"unity-tests-ci-t\" x=\"68\" y=\"73\" text-anchor=\"middle\">Restore cache</text><text class=\"unity-tests-ci-c\" x=\"68\" y=\"94\" text-anchor=\"middle\">Library/</text><rect class=\"unity-tests-ci-g\" x=\"13\" y=\"45\" width=\"110\" height=\"66\" rx=\"12\" style=\"animation-delay:0.0s\"/><line class=\"unity-tests-ci-ar\" x1=\"122\" y1=\"78\" x2=\"138\" y2=\"78\" marker-end=\"url(#unity-tests-ci-a)\"/><rect class=\"unity-tests-ci-box\" x=\"142\" y=\"48\" width=\"104\" height=\"60\" rx=\"10\"/><text class=\"unity-tests-ci-t\" x=\"194\" y=\"73\" text-anchor=\"middle\">EditMode</text><text class=\"unity-tests-ci-c\" x=\"194\" y=\"94\" text-anchor=\"middle\">-runTests</text><rect class=\"unity-tests-ci-g\" x=\"139\" y=\"45\" width=\"110\" height=\"66\" rx=\"12\" style=\"animation-delay:1.2s\"/><line class=\"unity-tests-ci-ar\" x1=\"248\" y1=\"78\" x2=\"264\" y2=\"78\" marker-end=\"url(#unity-tests-ci-a)\"/><rect class=\"unity-tests-ci-box\" x=\"268\" y=\"48\" width=\"104\" height=\"60\" rx=\"10\"/><text class=\"unity-tests-ci-t\" x=\"320\" y=\"73\" text-anchor=\"middle\">PlayMode</text><text class=\"unity-tests-ci-c\" x=\"320\" y=\"94\" text-anchor=\"middle\">-runTests</text><rect class=\"unity-tests-ci-g\" x=\"265\" y=\"45\" width=\"110\" height=\"66\" rx=\"12\" style=\"animation-delay:2.4s\"/><line class=\"unity-tests-ci-ar\" x1=\"374\" y1=\"78\" x2=\"390\" y2=\"78\" marker-end=\"url(#unity-tests-ci-a)\"/><rect class=\"unity-tests-ci-box\" x=\"394\" y=\"48\" width=\"104\" height=\"60\" rx=\"10\"/><text class=\"unity-tests-ci-t\" x=\"446\" y=\"73\" text-anchor=\"middle\">IL2CPP build</text><text class=\"unity-tests-ci-c\" x=\"446\" y=\"94\" text-anchor=\"middle\">BuildPlayer</text><rect class=\"unity-tests-ci-g\" x=\"391\" y=\"45\" width=\"110\" height=\"66\" rx=\"12\" style=\"animation-delay:3.6s\"/><line class=\"unity-tests-ci-ar\" x1=\"500\" y1=\"78\" x2=\"516\" y2=\"78\" marker-end=\"url(#unity-tests-ci-a)\"/><rect class=\"unity-tests-ci-ok\" x=\"520\" y=\"48\" width=\"104\" height=\"60\" rx=\"10\"/><text class=\"unity-tests-ci-t\" x=\"572\" y=\"73\" text-anchor=\"middle\">results.xml</text><text class=\"unity-tests-ci-c\" x=\"572\" y=\"94\" text-anchor=\"middle\">exit code</text><rect class=\"unity-tests-ci-g\" x=\"517\" y=\"45\" width=\"110\" height=\"66\" rx=\"12\" style=\"animation-delay:4.8s\"/> <rect x=\"167\" y=\"122\" width=\"180\" height=\"26\" rx=\"8\" style=\"fill:var(--fig-warn);fill-opacity:.14;stroke:var(--fig-warn);stroke-width:1.5\"/> <text class=\"unity-tests-ci-h\" x=\"257\" y=\"140\" text-anchor=\"middle\" style=\"font-size:12px\">no -quit with -runTests</text> <text class=\"unity-tests-ci-s\" x=\"420\" y=\"140\">catches stripping and AOT bugs</text> <line x1=\"16\" y1=\"168\" x2=\"624\" y2=\"168\" style=\"stroke:var(--fig-line);stroke-width:1\"/> <text class=\"unity-tests-ci-h\" x=\"16\" y=\"192\">Time per test, to scale</text> <text class=\"unity-tests-ci-t\" x=\"16\" y=\"219\">EditMode</text> <path d=\"M150.75 204v20M153.75 204v20M156.75 204v20M159.75 204v20M162.75 204v20M165.75 204v20M168.75 204v20M171.75 204v20M174.75 204v20M177.75 204v20M180.75 204v20M183.75 204v20M186.75 204v20M189.75 204v20M192.75 204v20M195.75 204v20M198.75 204v20M201.75 204v20M204.75 204v20M207.75 204v20M210.75 204v20M213.75 204v20M216.75 204v20M219.75 204v20M222.75 204v20M225.75 204v20M228.75 204v20M231.75 204v20M234.75 204v20M237.75 204v20M240.75 204v20M243.75 204v20M246.75 204v20M249.75 204v20M252.75 204v20M255.75 204v20M258.75 204v20M261.75 204v20M264.75 204v20M267.75 204v20\" style=\"stroke:var(--fig-accent);stroke-width:1.5\"/> <text class=\"unity-tests-ci-s\" x=\"278\" y=\"219\">milliseconds each</text> <text class=\"unity-tests-ci-t\" x=\"16\" y=\"259\">PlayMode</text> <rect x=\"150\" y=\"244\" width=\"300\" height=\"20\" rx=\"5\" style=\"fill:var(--fig-accent2);fill-opacity:.25;stroke:var(--fig-accent2);stroke-width:1.5\"/> <text class=\"unity-tests-ci-s\" x=\"458\" y=\"259\">seconds each</text> <line x1=\"150\" y1=\"282\" x2=\"600\" y2=\"282\" style=\"stroke:var(--fig-line);stroke-width:1.5\"/> <path d=\"M150 282v6M300 282v6M450 282v6M600 282v6\" style=\"stroke:var(--fig-line);stroke-width:1.5\"/> <text class=\"unity-tests-ci-s\" x=\"150\" y=\"304\" text-anchor=\"middle\">0</text> <text class=\"unity-tests-ci-s\" x=\"300\" y=\"304\" text-anchor=\"middle\">1 s</text> <text class=\"unity-tests-ci-s\" x=\"450\" y=\"304\" text-anchor=\"middle\">2 s</text> <text class=\"unity-tests-ci-s\" x=\"600\" y=\"304\" text-anchor=\"middle\">3 s</text> <line class=\"unity-tests-ci-ph\" x1=\"150\" y1=\"198\" x2=\"150\" y2=\"282\" style=\"stroke:var(--fig-ink);stroke-width:1.5;stroke-opacity:.6\"/> </svg>"
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Tests are the verification loop that makes AI agents usable in Unity. Ask the agent to put logic in plain C# with EditMode tests, run them via `-runTests` in batch mode, and read the result XML rather than claiming success. Watch for common agent mistakes: adding `-quit` to test runs, using `System.Reflection.Emit` or reflection-based serializers without `link.xml` entries, and putting code in `#if UNITY_IOS` blocks it never compiled. Ask for a player build (not just Play Mode) before accepting changes that touch serialization or reflection."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A save or JSON system works in the Editor but IL2CPP builds throw `MissingMethodException` or load default fields",
              "use": "Narrow link.xml or [Preserve]",
              "why": "The linker strips types reached only by reflection. Preserve the specific assemblies or types; disabling stripping or `preserve=\"all\"` everywhere gives back the size you wanted to save."
            },
            {
              "signal": "Daily builds use Mono and a release candidate crashes in a way nobody saw before",
              "use": "Regular IL2CPP builds in CI",
              "why": "Mono for fast iteration is fine, but stripping and AOT bugs only show in IL2CPP players. Build and smoke-test IL2CPP regularly; it costs minutes per build."
            },
            {
              "signal": "A dependency uses `System.Reflection.Emit` or generates code at runtime",
              "use": "AOT-safe libraries",
              "why": "IL2CPP compiles ahead of time, so runtime code generation fails on iOS, WebGL and consoles. Choose source-generated or AOT-compatible serializers and DI instead."
            },
            {
              "signal": "Game rules live inside a MonoBehaviour, so testing them requires a scene and frames",
              "use": "Humble object",
              "why": "Move logic into a plain C# class the MonoBehaviour delegates to; test it in fast EditMode tests. The thin component stays untested or covered by a few PlayMode tests."
            },
            {
              "signal": "You need to check a combo multiplier or damage formula across dozens of input cases",
              "use": "EditMode tests with [TestCase]",
              "why": "Pure-logic NUnit tests run in milliseconds without Play Mode, so many cases stay cheap. They cannot catch engine-loop, physics or platform behaviour."
            },
            {
              "signal": "A behaviour depends on `Awake`, `Update`, physics or coroutines advancing over frames",
              "use": "PlayMode [UnityTest]",
              "why": "`IEnumerator` tests yield frames so the engine loop runs. Slower, often seconds each, so keep them for integration paths and run them in a built player for platform issues."
            },
            {
              "signal": "A CI test step finishes quickly with no results file",
              "use": "-runTests without -quit",
              "why": "The test runner exits on its own; `-quit` can end the process before tests run. Pass `-testResults` and fail the job on the exit code and the NUnit XML."
            },
            {
              "signal": "Platform code in `#if UNITY_IOS` compiles fine for Android but fails on the first iOS build",
              "use": "Platform interface + build all targets",
              "why": "Keep platform branches thin behind an interface with one small implementation each, and compile every target in CI. Code in an inactive `#if` is never compiled."
            },
            {
              "signal": "A serialized field is wrapped in `#if UNITY_EDITOR` and players warn about layout or lose data",
              "use": "Editor-only data in editor-only assets",
              "why": "Editor and player must agree on serialized layout. Move editor-only data into assets the player never loads instead of conditionally compiling fields."
            },
            {
              "signal": "Release builds are made by hand from someone's Editor and settings differ between machines",
              "use": "Scripted builds with Build Profiles",
              "why": "`BuildPipeline.BuildPlayer` from a batch method plus versioned Build Profiles makes builds reproducible, and the `BuildReport` gives result and size. Requires CI licence setup."
            },
            {
              "signal": "The player size jumps after a content change and nobody knows which assets caused it",
              "use": "Read the BuildReport breakdown",
              "why": "The per-file breakdown shows which assets and Resources content landed in the build; diff it between builds to catch duplicates and stray references before release."
            },
            {
              "signal": "Each CI run spends most of its time reimporting the whole project",
              "use": "Cache Library per platform",
              "why": "A warm `Library` turns cold imports of tens of minutes into short incremental ones. Key the cache by platform and Unity version; a stale cache can hide import bugs, so purge occasionally."
            }
          ]
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
        },
        {
          "q": "Testing a dash cooldown rule needs a scene load and about 40 frames of waiting, so each test takes seconds and CI crawls. Which approach fits best?",
          "options": [
            "Convert the test to a `[UnityTest]` that yields frames",
            "Run the same tests in a built player on a device",
            "Raise `Time.timeScale` inside the scene during tests",
            "Move the rule to a plain C# class; test in EditMode"
          ],
          "answer": 3,
          "explain": "A thin MonoBehaviour delegating to a plain class lets the rule run in milliseconds with no engine loop. PlayMode still needs the scene and frames, so it stays slow."
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
          "type": "figure",
          "id": "unity-meta-guid-rename",
          "caption": "The scene points at a GUID, not a path: keep the .meta with the file and the rename is harmless; leave it behind and the GUID changes.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"A scene references a script by the GUID in its .meta file. Renaming in the Editor keeps GUID 3f2a so the reference survives; renaming with mv in a shell leaves the meta behind, Unity generates GUID 7b1e and the scene shows a missing script.\"> <style> .unity-meta-guid-rename-t{font-size:14px;fill:var(--fig-ink);font-weight:600} .unity-meta-guid-rename-h{font-size:13px;fill:var(--fig-ink)} .unity-meta-guid-rename-s{font-size:12px;fill:var(--fig-muted)} .unity-meta-guid-rename-c{font-size:12px;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .unity-meta-guid-rename-ok{font-size:13px;fill:var(--fig-ok);font-weight:600} .unity-meta-guid-rename-bad{font-size:13px;fill:var(--fig-bad);font-weight:600} .unity-meta-guid-rename-panel{fill:none;stroke:var(--fig-line);stroke-width:1.5} .unity-meta-guid-rename-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-meta-guid-rename-meta{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.75} .unity-meta-guid-rename-lok{stroke:var(--fig-ok);stroke-width:2} .unity-meta-guid-rename-lbad{stroke:var(--fig-bad);stroke-width:2;stroke-dasharray:5 4} .unity-meta-guid-rename-A{animation:unity-meta-guid-rename-a 6s ease-in-out infinite} .unity-meta-guid-rename-B{opacity:0;animation:unity-meta-guid-rename-b 6s ease-in-out infinite} @keyframes unity-meta-guid-rename-a{0%,40%{opacity:1}46%,64%{opacity:0}72%,100%{opacity:1}} @keyframes unity-meta-guid-rename-b{0%,40%{opacity:0}46%,64%{opacity:1}72%,100%{opacity:0}} </style> <rect class=\"unity-meta-guid-rename-panel\" x=\"16\" y=\"20\" width=\"296\" height=\"292\" rx=\"12\"/><text x=\"32\" y=\"46\" style=\"font-size:14px;font-weight:700;fill:var(--fig-ok)\">Renamed in the Editor</text><rect class=\"unity-meta-guid-rename-box\" x=\"32\" y=\"60\" width=\"264\" height=\"80\" rx=\"10\"/><text class=\"unity-meta-guid-rename-t\" x=\"44\" y=\"83\">Level.unity</text><text class=\"unity-meta-guid-rename-c\" x=\"44\" y=\"105\">m_Script: guid 3f2a…</text><text class=\"unity-meta-guid-rename-ok\" x=\"44\" y=\"127\">✓ script found</text><line x1=\"246\" y1=\"142\" x2=\"246\" y2=\"188\" class=\"unity-meta-guid-rename-lok\"/><rect class=\"unity-meta-guid-rename-box\" x=\"32\" y=\"190\" width=\"150\" height=\"50\" rx=\"10\"/><text class=\"unity-meta-guid-rename-h unity-meta-guid-rename-B\" x=\"107\" y=\"220\" text-anchor=\"middle\">PlayerController.cs</text><text class=\"unity-meta-guid-rename-h unity-meta-guid-rename-A\" x=\"107\" y=\"220\" text-anchor=\"middle\">Hero.cs</text><rect class=\"unity-meta-guid-rename-meta\" x=\"196\" y=\"190\" width=\"100\" height=\"50\" rx=\"10\"/><text class=\"unity-meta-guid-rename-t\" x=\"246\" y=\"210\" text-anchor=\"middle\">.meta</text><text class=\"unity-meta-guid-rename-c\" x=\"246\" y=\"229\" text-anchor=\"middle\">3f2a…</text><text class=\"unity-meta-guid-rename-s\" x=\"32\" y=\"270\">Path changed, GUID kept,</text><text class=\"unity-meta-guid-rename-s\" x=\"32\" y=\"288\">so every reference still resolves.</text><rect class=\"unity-meta-guid-rename-panel\" x=\"328\" y=\"20\" width=\"296\" height=\"292\" rx=\"12\"/><text x=\"344\" y=\"46\" style=\"font-size:14px;font-weight:700;fill:var(--fig-bad)\">Renamed with mv in a shell</text><rect class=\"unity-meta-guid-rename-box\" x=\"344\" y=\"60\" width=\"264\" height=\"80\" rx=\"10\"/><text class=\"unity-meta-guid-rename-t\" x=\"356\" y=\"83\">Level.unity</text><text class=\"unity-meta-guid-rename-c\" x=\"356\" y=\"105\">m_Script: guid 3f2a…</text><text class=\"unity-meta-guid-rename-ok unity-meta-guid-rename-B\" x=\"356\" y=\"127\">✓ script found</text><text class=\"unity-meta-guid-rename-bad unity-meta-guid-rename-A\" x=\"356\" y=\"127\">✗ Missing script (Unknown)</text><line x1=\"558\" y1=\"142\" x2=\"558\" y2=\"188\" class=\"unity-meta-guid-rename-lok unity-meta-guid-rename-B\"/><g class=\"unity-meta-guid-rename-A\"><line x1=\"558\" y1=\"142\" x2=\"558\" y2=\"188\" class=\"unity-meta-guid-rename-lbad\"/><circle cx=\"558\" cy=\"165\" r=\"10\" style=\"fill:var(--fig-panel);stroke:var(--fig-bad);stroke-width:1.5\"/><text x=\"558\" y=\"170\" text-anchor=\"middle\" style=\"font-size:14px;font-weight:700;fill:var(--fig-bad)\">×</text></g><rect class=\"unity-meta-guid-rename-box\" x=\"344\" y=\"190\" width=\"150\" height=\"50\" rx=\"10\"/><text class=\"unity-meta-guid-rename-h unity-meta-guid-rename-B\" x=\"419\" y=\"220\" text-anchor=\"middle\">PlayerController.cs</text><text class=\"unity-meta-guid-rename-h unity-meta-guid-rename-A\" x=\"419\" y=\"220\" text-anchor=\"middle\">Hero.cs</text><rect class=\"unity-meta-guid-rename-meta\" x=\"508\" y=\"190\" width=\"100\" height=\"50\" rx=\"10\"/><text class=\"unity-meta-guid-rename-t\" x=\"558\" y=\"210\" text-anchor=\"middle\">.meta</text><text class=\"unity-meta-guid-rename-c unity-meta-guid-rename-B\" x=\"558\" y=\"229\" text-anchor=\"middle\">3f2a…</text><text class=\"unity-meta-guid-rename-c unity-meta-guid-rename-A\" x=\"558\" y=\"229\" text-anchor=\"middle\" style=\"fill:var(--fig-bad)\">7b1e…</text><g class=\"unity-meta-guid-rename-A\"><rect x=\"508\" y=\"252\" width=\"100\" height=\"44\" rx=\"10\" style=\"fill:none;stroke:var(--fig-bad);stroke-width:1.5;stroke-dasharray:5 4\"/><text x=\"558\" y=\"270\" text-anchor=\"middle\" style=\"font-size:12px;fill:var(--fig-bad)\">old 3f2a…</text><text x=\"558\" y=\"287\" text-anchor=\"middle\" style=\"font-size:12px;fill:var(--fig-bad)\">deleted</text></g><text class=\"unity-meta-guid-rename-s unity-meta-guid-rename-A\" x=\"344\" y=\"270\">Unity saw a new file</text><text class=\"unity-meta-guid-rename-s unity-meta-guid-rename-A\" x=\"344\" y=\"288\">and gave it a new GUID.</text> </svg>"
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
          "type": "figure",
          "id": "unity-smart-merge",
          "caption": "Smart Merge pairs objects by fileID, so both edits survive; a line merge can drop the m_Component entry and orphan the new component.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 380\" role=\"img\" aria-label=\"Ours adds a BoxCollider and lists it on the GameObject; Theirs changes speed. A line-based merge loses the m_Component entry and orphans the collider; UnityYAMLMerge matches objects by fileID and keeps both changes.\"> <style> .unity-smart-merge-s{font-size:12px;fill:var(--fig-muted)} .unity-smart-merge-c{font-size:12px;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .unity-smart-merge-panel{fill:none;stroke:var(--fig-line);stroke-width:1.5} .unity-smart-merge-pl{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-smart-merge-none{fill:none;stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 4;opacity:.6} .unity-smart-merge-acc{fill:var(--fig-accent);fill-opacity:.14;stroke:var(--fig-accent);stroke-width:1.5} .unity-smart-merge-acc2{fill:var(--fig-accent2);fill-opacity:.14;stroke:var(--fig-accent2);stroke-width:1.5} .unity-smart-merge-ok{fill:var(--fig-ok);fill-opacity:.12;stroke:var(--fig-ok);stroke-width:1.5} .unity-smart-merge-bad{fill:var(--fig-bad);fill-opacity:.12;stroke:var(--fig-bad);stroke-width:1.5} .unity-smart-merge-ar{stroke:var(--fig-muted);stroke-width:1.75;fill:none} .unity-smart-merge-g{fill:none;stroke:var(--fig-ink);stroke-width:2.5;opacity:0;animation:unity-smart-merge-hl 6s ease-in-out infinite} @keyframes unity-smart-merge-hl{0%{opacity:0}5%,26%{opacity:.8}32%,100%{opacity:0}} </style> <defs><marker id=\"unity-smart-merge-a\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-muted)\"/></marker></defs> <rect class=\"unity-smart-merge-panel\" x=\"16\" y=\"24\" width=\"288\" height=\"156\" rx=\"12\"/><text x=\"28\" y=\"46\" style=\"font-size:14px;font-weight:700;fill:var(--fig-ink)\">Ours</text><rect class=\"unity-smart-merge-acc\" x=\"28\" y=\"58\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"38\" y=\"77\">&amp;100 GameObject m_Component +&amp;300</text><rect class=\"unity-smart-merge-g\" x=\"25\" y=\"55\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:0s\"/><rect class=\"unity-smart-merge-pl\" x=\"28\" y=\"94\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"38\" y=\"113\">&amp;114 Player speed: 6.5</text><rect class=\"unity-smart-merge-g\" x=\"25\" y=\"91\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:2s\"/><rect class=\"unity-smart-merge-acc\" x=\"28\" y=\"130\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"38\" y=\"149\">&amp;300 BoxCollider (new)</text><rect class=\"unity-smart-merge-g\" x=\"25\" y=\"127\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:4s\"/><rect class=\"unity-smart-merge-panel\" x=\"336\" y=\"24\" width=\"288\" height=\"156\" rx=\"12\"/><text x=\"348\" y=\"46\" style=\"font-size:14px;font-weight:700;fill:var(--fig-ink)\">Theirs</text><rect class=\"unity-smart-merge-pl\" x=\"348\" y=\"58\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"358\" y=\"77\">&amp;100 GameObject</text><rect class=\"unity-smart-merge-g\" x=\"345\" y=\"55\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:0s\"/><rect class=\"unity-smart-merge-acc2\" x=\"348\" y=\"94\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"358\" y=\"113\">&amp;114 Player speed: 8</text><rect class=\"unity-smart-merge-g\" x=\"345\" y=\"91\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:2s\"/><rect class=\"unity-smart-merge-none\" x=\"348\" y=\"130\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"358\" y=\"149\">&amp;300 not in this branch</text><rect class=\"unity-smart-merge-g\" x=\"345\" y=\"127\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:4s\"/><line class=\"unity-smart-merge-ar\" x1=\"160\" y1=\"184\" x2=\"160\" y2=\"208\" marker-end=\"url(#unity-smart-merge-a)\"/><line class=\"unity-smart-merge-ar\" x1=\"480\" y1=\"184\" x2=\"480\" y2=\"208\" marker-end=\"url(#unity-smart-merge-a)\"/><text class=\"unity-smart-merge-s\" x=\"320\" y=\"199\" text-anchor=\"middle\">merge Ours + Theirs</text><rect class=\"unity-smart-merge-panel\" x=\"16\" y=\"214\" width=\"288\" height=\"156\" rx=\"12\"/><text x=\"28\" y=\"236\" style=\"font-size:14px;font-weight:700;fill:var(--fig-bad)\">Line-based text merge</text><rect class=\"unity-smart-merge-bad\" x=\"28\" y=\"248\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"38\" y=\"267\">&amp;100 GameObject m_Component: lost</text><rect class=\"unity-smart-merge-pl\" x=\"28\" y=\"284\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"38\" y=\"303\">&amp;114 Player speed: 8</text><rect class=\"unity-smart-merge-bad\" x=\"28\" y=\"320\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"38\" y=\"339\">&amp;300 BoxCollider, orphaned</text><rect class=\"unity-smart-merge-panel\" x=\"336\" y=\"214\" width=\"288\" height=\"156\" rx=\"12\"/><text x=\"348\" y=\"236\" style=\"font-size:14px;font-weight:700;fill:var(--fig-ok)\">UnityYAMLMerge (Smart Merge)</text><rect class=\"unity-smart-merge-ok\" x=\"348\" y=\"248\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"358\" y=\"267\">&amp;100 GameObject m_Component +&amp;300</text><rect class=\"unity-smart-merge-g\" x=\"345\" y=\"245\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:0s\"/><rect class=\"unity-smart-merge-ok\" x=\"348\" y=\"284\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"358\" y=\"303\">&amp;114 Player speed: 8</text><rect class=\"unity-smart-merge-g\" x=\"345\" y=\"281\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:2s\"/><rect class=\"unity-smart-merge-ok\" x=\"348\" y=\"320\" width=\"264\" height=\"28\" rx=\"8\"/><text class=\"unity-smart-merge-c\" x=\"358\" y=\"339\">&amp;300 BoxCollider</text><rect class=\"unity-smart-merge-g\" x=\"345\" y=\"317\" width=\"270\" height=\"34\" rx=\"10\" style=\"animation-delay:4s\"/> </svg>"
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
          "type": "figure",
          "id": "unity-agent-loop",
          "caption": "The agent changes assets only through C# and the Editor, and a change counts as done only after the tests and the console say so.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"Agent loop in a Unity project: edit C#, recompile, run EditMode tests, run C# in the live Editor via MCP, verify, repeat. Outside the loop: never hand-edit scene or prefab YAML, create or rename .meta files, or move assets in a shell.\"> <style> .unity-agent-loop-t{font-size:14px;fill:var(--fig-ink);font-weight:600} .unity-agent-loop-h{font-size:13px;fill:var(--fig-ink)} .unity-agent-loop-s{font-size:12px;fill:var(--fig-muted)} .unity-agent-loop-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .unity-agent-loop-ar{stroke:var(--fig-muted);stroke-width:1.75;fill:none} .unity-agent-loop-g{fill:none;stroke:var(--fig-accent);stroke-width:3;opacity:0;animation:unity-agent-loop-on 7.5s ease-in-out infinite} .unity-agent-loop-ck{font-size:20px;font-weight:700;fill:var(--fig-ok);opacity:0;animation:unity-agent-loop-on 7.5s ease-in-out infinite} @keyframes unity-agent-loop-on{0%{opacity:0}3%,17%{opacity:1}20%,100%{opacity:0}} </style> <defs><marker id=\"unity-agent-loop-a\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0L10 5L0 10z\" style=\"fill:var(--fig-muted)\"/></marker></defs> <text class=\"unity-agent-loop-s\" x=\"16\" y=\"30\">Inspect, change, verify, against the live Editor</text> <rect class=\"unity-agent-loop-box\" x=\"16\" y=\"48\" width=\"180\" height=\"56\" rx=\"12\"/><text class=\"unity-agent-loop-t\" x=\"30\" y=\"72\">Edit C#</text><text class=\"unity-agent-loop-s\" x=\"30\" y=\"91\">Unity APIs, not YAML</text><rect class=\"unity-agent-loop-g\" x=\"13\" y=\"45\" width=\"186\" height=\"62\" rx=\"14\" style=\"animation-delay:0.0s\"/><rect class=\"unity-agent-loop-box\" x=\"230\" y=\"48\" width=\"180\" height=\"56\" rx=\"12\"/><text class=\"unity-agent-loop-t\" x=\"244\" y=\"72\">Recompile</text><text class=\"unity-agent-loop-s\" x=\"244\" y=\"91\">check console errors</text><rect class=\"unity-agent-loop-g\" x=\"227\" y=\"45\" width=\"186\" height=\"62\" rx=\"14\" style=\"animation-delay:1.5s\"/><rect class=\"unity-agent-loop-box\" x=\"444\" y=\"48\" width=\"180\" height=\"56\" rx=\"12\"/><text class=\"unity-agent-loop-t\" x=\"458\" y=\"72\">Run EditMode tests</text><text class=\"unity-agent-loop-s\" x=\"458\" y=\"91\">-runTests, read the XML</text><rect class=\"unity-agent-loop-g\" x=\"441\" y=\"45\" width=\"186\" height=\"62\" rx=\"14\" style=\"animation-delay:3.0s\"/><rect class=\"unity-agent-loop-box\" x=\"444\" y=\"150\" width=\"180\" height=\"56\" rx=\"12\"/><text class=\"unity-agent-loop-t\" x=\"458\" y=\"174\" style=\"font-size:13px\">Run C# in the Editor</text><text class=\"unity-agent-loop-s\" x=\"458\" y=\"193\">via MCP: hierarchy</text><rect class=\"unity-agent-loop-g\" x=\"441\" y=\"147\" width=\"186\" height=\"62\" rx=\"14\" style=\"animation-delay:4.5s\"/><rect class=\"unity-agent-loop-box\" x=\"230\" y=\"150\" width=\"180\" height=\"56\" rx=\"12\"/><text class=\"unity-agent-loop-t\" x=\"244\" y=\"174\">Verify</text><text class=\"unity-agent-loop-s\" x=\"244\" y=\"193\">validator + tests pass</text><rect class=\"unity-agent-loop-g\" x=\"227\" y=\"147\" width=\"186\" height=\"62\" rx=\"14\" style=\"animation-delay:6.0s\"/><text class=\"unity-agent-loop-ck\" x=\"396\" y=\"182\" text-anchor=\"middle\" style=\"animation-delay:6s\">✓</text><line class=\"unity-agent-loop-ar\" x1=\"198\" y1=\"76\" x2=\"226\" y2=\"76\" marker-end=\"url(#unity-agent-loop-a)\"/><line class=\"unity-agent-loop-ar\" x1=\"412\" y1=\"76\" x2=\"440\" y2=\"76\" marker-end=\"url(#unity-agent-loop-a)\"/><line class=\"unity-agent-loop-ar\" x1=\"534\" y1=\"106\" x2=\"534\" y2=\"146\" marker-end=\"url(#unity-agent-loop-a)\"/><line class=\"unity-agent-loop-ar\" x1=\"442\" y1=\"178\" x2=\"414\" y2=\"178\" marker-end=\"url(#unity-agent-loop-a)\"/><path class=\"unity-agent-loop-ar\" d=\"M228 178H106V110\" marker-end=\"url(#unity-agent-loop-a)\"/><text class=\"unity-agent-loop-s\" x=\"167\" y=\"170\" text-anchor=\"middle\">repeat</text><rect x=\"16\" y=\"258\" width=\"196\" height=\"32\" rx=\"10\" style=\"fill:var(--fig-bad);fill-opacity:.1;stroke:var(--fig-bad);stroke-width:1.5\"/><text class=\"unity-agent-loop-h\" x=\"114\" y=\"279\" text-anchor=\"middle\">hand-edit .unity / .prefab</text><rect x=\"222\" y=\"258\" width=\"196\" height=\"32\" rx=\"10\" style=\"fill:var(--fig-bad);fill-opacity:.1;stroke:var(--fig-bad);stroke-width:1.5\"/><text class=\"unity-agent-loop-h\" x=\"320\" y=\"279\" text-anchor=\"middle\">create or rename .meta</text><rect x=\"428\" y=\"258\" width=\"196\" height=\"32\" rx=\"10\" style=\"fill:var(--fig-bad);fill-opacity:.1;stroke:var(--fig-bad);stroke-width:1.5\"/><text class=\"unity-agent-loop-h\" x=\"526\" y=\"279\" text-anchor=\"middle\">mv assets in a shell</text> <line x1=\"16\" y1=\"226\" x2=\"624\" y2=\"226\" style=\"stroke:var(--fig-line);stroke-width:1\"/> <text x=\"16\" y=\"248\" style=\"font-size:13px;font-weight:700;fill:var(--fig-bad)\">Never, by hand or by shell</text> <text class=\"unity-agent-loop-s\" x=\"16\" y=\"314\">Move and rename through AssetDatabase.MoveAsset, which keeps the GUID.</text> </svg>"
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
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "After a rename, prefabs show missing scripts and the diff shows the old `.meta` deleted and a new one added",
              "use": "Rename and move inside the Editor",
              "why": "Unity references by GUID in the `.meta`; renaming in the Editor or `AssetDatabase.MoveAsset` keeps it. Shell or IDE renames without the meta generate a new GUID."
            },
            {
              "signal": "References break on a teammate's machine but not yours, and an asset was committed without its `.meta`",
              "use": "CI check for asset/meta pairs",
              "why": "Fail on any asset without a `.meta` or meta without an asset, and flag changed GUIDs. Cheap to run and catches most reference breakage before merge."
            },
            {
              "signal": "A text merge of two scene edits succeeds but the scene loads with duplicate fileID errors",
              "use": "UnityYAMLMerge merge driver",
              "why": "Smart Merge parses both sides as objects and merges by fileID and property. Wire it in `.gitattributes` and git config; true conflicts on the same object still need a human."
            },
            {
              "signal": "Several designers edit one 5,000-object scene and conflict daily",
              "use": "Additive sub-scenes and nested prefabs",
              "why": "Split content so people rarely touch the same file; no merge tool fixes concurrent edits of one object. Costs load orchestration and cross-scene reference management."
            },
            {
              "signal": "Clones are huge because every revision of large PSDs and FBXs stays in Git history",
              "use": "Git LFS with file locking",
              "why": "LFS stores binaries on a separate server with pointers in Git; `git lfs lock` stops concurrent edits of unmergeable files. Locking only works if everyone checks locks."
            },
            {
              "signal": "An art-heavy studio keeps losing work when two non-technical artists edit the same file",
              "use": "Exclusive checkout VCS",
              "why": "Unity Version Control or Perforce handle large binaries natively and enforce exclusive checkout with artist-friendly clients. Code-heavy Git teams may find LFS plus locks enough."
            },
            {
              "signal": "Scene and prefab diffs are unreadable binary blobs in review",
              "use": "Force Text serialization",
              "why": "With Force Text and Visible Meta Files, assets become reviewable YAML that Smart Merge can handle. Text is still not safe to hand-edit: fileIDs and overrides must stay consistent."
            },
            {
              "signal": "`git status` shows `Library/`, `Temp/` or `UserSettings/` changes, or packages differ between machines",
              "use": "Commit only the source of truth",
              "why": "Commit `Assets` with metas, `ProjectSettings`, `Packages/manifest.json` and `packages-lock.json`; ignore regenerable folders. The lock file makes package versions identical everywhere."
            },
            {
              "signal": "An agent is asked to add a component to 120 prefabs and starts editing `.prefab` YAML",
              "use": "Change assets via Editor APIs",
              "why": "Have the agent write C# using `PrefabUtility`, `SerializedObject` and `AssetDatabase`, run in batch mode or a live Editor. Hand-written YAML risks invented fileIDs and unwired components."
            },
            {
              "signal": "An agent reports a task done but never opened the project or read the console",
              "use": "Verify in a live Editor loop",
              "why": "Connect via MCP or the Unity CLI to check console errors, query the hierarchy and run EditMode tests and the validator. Success counts only when those pass."
            },
            {
              "signal": "Agents keep creating `.meta` files, renaming with shell commands or reaching for `Resources.Load`",
              "use": "Explicit rules in agent instructions",
              "why": "State in project instructions: no YAML or meta edits, move assets via the Editor, the loading strategy, and run tests after changes. Rules reduce mistakes but still need diff review."
            },
            {
              "signal": "An agent diff contains large YAML changes in scenes the task never mentioned, or changed GUIDs",
              "use": "Reject and redo through the Editor",
              "why": "Unrelated scene churn and GUID changes signal hand-edited or regenerated assets. Revert and redo the change through Editor APIs rather than patching the YAML."
            }
          ]
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
        },
        {
          "q": "An agent finishes a task to add one field to a prefab, but its diff rewrites YAML in 40 unrelated scenes and several GUIDs changed. What do you do?",
          "options": [
            "Revert and redo it through Editor APIs",
            "Merge it and run the validator afterwards",
            "Move the touched scenes into Git LFS",
            "Hand-edit the GUIDs back to the old values"
          ],
          "answer": 0,
          "explain": "Unrelated scene churn and changed GUIDs signal hand-edited or regenerated assets. Patching the YAML by hand risks inconsistent fileIDs, so redo the change with `PrefabUtility` or `SerializedObject`."
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
    },
    {
      "q": "A 2 m crate has a 2048 texture unwrapped once across its width; a 0.5 m mug beside it has a 1024 texture unwrapped the same way. The mug looks oddly sharp. Which change matches their texel density and saves memory?",
      "options": [
        "Raise the crate to 4096 so both reach 2048 pixels per metre",
        "Drop the mug to 512 so both sit at about 1024 pixels per metre",
        "Drop the crate to 1024 so both sit at about 1024 pixels per metre",
        "Keep both sizes and enable mipmaps, which equalises the density"
      ],
      "answer": 1,
      "explain": "The crate is 2048 / 2 m = 1024 px/m; the mug is 1024 / 0.5 m = 2048 px/m. A 512 mug gives 1024 px/m, matching the crate at a quarter of the mug's previous memory. Mipmaps change sampling at distance, not authored density."
    },
    {
      "q": "A face rig authored with up to 8 bone influences per vertex looks right on high-end devices but creases badly on the low quality tier. What is the likely cause?",
      "options": [
        "Humanoid avatars ignore every bone that is not in the face mapping",
        "Mesh Compression quantised the bone weights to fewer bits each",
        "Optimize Game Objects removed the face bones from the hierarchy",
        "The skin weight cap drops the smaller influences per vertex there"
      ],
      "answer": 3,
      "explain": "The Skin Weights setting limits influences per vertex per quality level; weights beyond the cap are dropped and the rest renormalised, which changes deformation. Agree the cap before rigging and test on the lowest tier."
    },
    {
      "q": "Each prop artist builds their own Shader Graph. Shader variants, build time and SRP Batcher batches all grow every sprint. Which policy addresses the cause?",
      "options": [
        "Engineers own a few master shaders; artists make material variants",
        "Artists keep their graphs but strip every keyword from each of them",
        "Convert every Shader Graph to hand-written HLSL before shipping",
        "Give each prop its own material so batching treats them equally"
      ],
      "answer": 0,
      "explain": "Every distinct shader adds variants and splits SRP Batcher grouping. A small owned shader library with exposed properties, used through materials and Material Variants, keeps both under control while artists still adjust looks."
    },
    {
      "q": "German players report that their settings reset every launch. The save code writes `volume.ToString()` and reads it back with `float.Parse(text)`. What is the correct fix?",
      "options": [
        "Force the thread culture to en-US at startup for every player",
        "Write and parse saved values with CultureInfo.InvariantCulture",
        "Store floats as strings with the player's locale tag attached",
        "Replace float.Parse with Convert.ToSingle on the current culture"
      ],
      "answer": 1,
      "explain": "German culture writes `0,8`, which the parse rejects or misreads; data must always use the invariant culture. Forcing en-US breaks culture-correct display for the UI, and the other options keep culture-dependent data."
    },
    {
      "q": "Which subtitle setup best serves deaf and hard-of-hearing players during a busy combat scene?",
      "options": [
        "Large centred text with no background so the scene stays visible",
        "Subtitles only in cutscenes so gameplay dialogue never distracts",
        "Fast word-by-word text synced exactly to the voice line timing",
        "Speaker names, a backing box, and captions for off-screen sounds"
      ],
      "answer": 3,
      "explain": "Speaker labels say who is talking when the speaker is off-screen, a background keeps text legible over a changing scene, and captions convey gameplay-relevant sounds. The other options drop legibility, coverage or reading time."
    },
    {
      "q": "You are mirroring the UI for an Arabic release. Which element should keep its left-to-right orientation?",
      "options": [
        "A media play button's triangle pointing in the playback direction",
        "The back arrow in the top navigation bar of the settings screen",
        "The order of tabs in the horizontal tab bar across the screen",
        "A horizontal progress bar showing how far a download has got"
      ],
      "answer": 0,
      "explain": "Icons that represent physical or media direction, like play, are not mirrored. Navigation arrows, tab order and progress fill follow the reading direction and do flip in a right-to-left layout."
    },
    {
      "kind": "order",
      "q": "A component sits on an active GameObject in a scene that loads, plays a few frames, and is then destroyed. Put its callbacks in the order they first run.",
      "steps": [
        "`Awake`",
        "`OnEnable`",
        "`Start`",
        "`Update`",
        "`OnDisable`",
        "`OnDestroy`"
      ],
      "explain": "Awake runs on load, OnEnable right after it, and Start once before the first Update, after every Awake and OnEnable in the scene. On destruction OnDisable runs first, then OnDestroy."
    },
    {
      "kind": "order",
      "q": "Put the stages of a player build in the order Unity runs them.",
      "steps": [
        "Compile scripts with the target platform's define symbols",
        "Collect build scenes, their references and `Resources` content",
        "Convert assets to platform formats and compile shader variants",
        "Serialize the converted assets into content files",
        "Strip managed assemblies, then convert them with IL2CPP",
        "Package the player or hand off to Xcode or Gradle"
      ],
      "explain": "Scripts compile first, then the content set is collected and converted (texture compression, shader variants, audio) and serialized. Managed assemblies are stripped before IL2CPP converts them, and the result is packaged or handed to the native toolchain. Shader variants and IL2CPP are usually the slow steps."
    },
    {
      "kind": "order",
      "q": "Within one frame where physics steps once, order these from first to last.",
      "steps": [
        "`FixedUpdate`",
        "Physics simulation and collision callbacks",
        "`Update`",
        "Animator update for normally updated animators",
        "`LateUpdate`",
        "Rendering and `WaitForEndOfFrame` coroutines"
      ],
      "explain": "FixedUpdate and the physics step (with trigger and collision callbacks) run before Update; the Animator evaluates between Update and LateUpdate, which is why follow cameras go in LateUpdate; rendering and end-of-frame coroutines come last."
    },
    {
      "kind": "line",
      "q": "The turret's target can be destroyed by another system. Click the line that throws or misbehaves once that happens.",
      "code": "public class Turret : MonoBehaviour\n{\n    [SerializeField] Enemy target;\n    [SerializeField] int damage = 10;\n\n    void Update()\n    {\n        target?.TakeDamage(damage);\n    }\n}",
      "lang": "csharp",
      "answer": 7,
      "explain": "Line 8: `?.` checks the C# reference, not Unity's overloaded `==`, so after Destroy the fake-null wrapper passes the check and `TakeDamage` touches a dead object. Write `if (target) target.TakeDamage(damage);`."
    },
    {
      "kind": "line",
      "q": "This flash effect throws `MissingReferenceException` when the object is destroyed mid-flash. Click the buggy line.",
      "code": "async Awaitable FlashAsync()\n{\n    var token = destroyCancellationToken;\n    try\n    {\n        for (int i = 0; i < 6; i++)\n        {\n            sprite.enabled = !sprite.enabled;\n            await Awaitable.WaitForSecondsAsync(0.1f);\n        }\n    }\n    catch (System.OperationCanceledException) { }\n}",
      "lang": "csharp",
      "answer": 8,
      "explain": "Line 9: the token is fetched but never passed, so the await resumes after the object is destroyed and line 8 touches a dead SpriteRenderer. Use `WaitForSecondsAsync(0.1f, token)` so destruction cancels the wait and the catch handles it."
    },
    {
      "kind": "line",
      "q": "Players with a German system locale lose their volume setting every launch. Click the buggy line.",
      "code": "using System.Globalization;\nusing UnityEngine;\n\npublic static class AudioSettings\n{\n    public static void Save(float volume) =>\n        PlayerPrefs.SetString(\"volume\", volume.ToString(CultureInfo.InvariantCulture));\n\n    public static float Load() =>\n        float.Parse(PlayerPrefs.GetString(\"volume\", \"0.8\"));\n}",
      "lang": "csharp",
      "answer": 9,
      "explain": "Line 10: the value is written with the invariant culture (`0.8`) but parsed with the current culture, which in German expects `0,8` and misreads it. Parse with `float.Parse(text, CultureInfo.InvariantCulture)`."
    },
    {
      "q": "What does this log, in the same frame?",
      "code": "var go = new GameObject(\"Temp\");\nDestroy(go);\nDebug.Log(go == null);\nDebug.Log(ReferenceEquals(go, null));",
      "lang": "csharp",
      "options": [
        "`False`, then `False`",
        "`True`, then `False`",
        "`True`, then `True`",
        "`False`, then `True`"
      ],
      "answer": 0,
      "explain": "`Destroy` is deferred to the end of the frame, so the native object still exists and Unity's `==` reports it as alive. `ReferenceEquals` checks the C# wrapper, which is never null here; after the frame ends, the first line would log `True`."
    },
    {
      "q": "Over the next few frames, what does this component log?",
      "code": "IEnumerator Count()\n{\n    for (int i = 1; i <= 3; i++)\n    {\n        Debug.Log(i);\n        yield return null;\n    }\n}\n\nvoid Start()\n{\n    StartCoroutine(Count());\n    enabled = false;\n}",
      "lang": "csharp",
      "options": [
        "`1`, then nothing more",
        "`1`, `2` and `3`",
        "Nothing is ever logged",
        "`1` and `2` only"
      ],
      "answer": 1,
      "explain": "`StartCoroutine` runs the body up to the first yield immediately, logging `1`. Disabling the component does not stop its coroutines; only deactivating or destroying the GameObject does, so `2` and `3` follow on the next frames."
    }
  ]
});
