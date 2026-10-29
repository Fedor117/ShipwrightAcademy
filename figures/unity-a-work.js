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
          "type": "h",
          "text": "Layout groups cost"
        },
        {
          "type": "p",
          "text": "Horizontal/Vertical/Grid Layout Groups and Content Size Fitter are convenient but expensive: a layout rebuild walks up to find the root layout and recomputes every child, calling `GetComponents` along the way. Nested layout groups (a vertical list of rows, each row a horizontal group, each cell with a fitter) can turn a single text change into a cascade across hundreds of elements. Use anchors for static layout, compute positions yourself for big scrolling lists, and use pooled, recycled list items rather than instantiating 500 rows in a ScrollRect."
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
