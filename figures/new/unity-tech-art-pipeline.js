window.TOPIC_PART = [
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
      }
    ]
  }
];
