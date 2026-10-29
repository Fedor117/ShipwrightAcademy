window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "graphics",
  "track": "Game Development",
  "title": "Computer Graphics",
  "tagline": "How a GPU turns vertices, textures and light into pixels, and what that costs.",
  "intro": "Every frame a game ships is the output of a pipeline of transforms, shaders, textures and lighting running against a hard millisecond budget. Knowing how that pipeline works is what lets you read a profiler, name the stage that is slow, and judge whether an engine setting or an agent-written shader will help or hurt. This section builds that model from the underlying math up to render paths, APIs and GPU performance work, so the engine and Unity sections that follow rest on solid ground.",
  "topics": [
    {
      "id": "graphics-math",
      "title": "Math for Graphics",
      "minutes": 13,
      "summary": "Vectors, dot and cross products, matrices, transform order, homogeneous coordinates and why quaternions replace Euler angles.",
      "lesson": [
        {
          "type": "p",
          "text": "A designer reports: 'The turret rotates fine for the first minute, then it flips upside down when the player runs behind it.' Another bug: the same character, placed 200 km from the world origin, jitters when it walks. Neither is a logic error. Both are math-model errors, one about rotation representation, the other about floating-point precision. Nearly every rendering and gameplay bug that looks mystical turns out to be a transform applied in the wrong order, in the wrong space, or in a representation that cannot express what you asked. This topic gives you the small set of mathematical tools that everything else in graphics is built from."
        },
        {
          "type": "h",
          "text": "Vectors: points, directions and the two products"
        },
        {
          "type": "p",
          "text": "A vector is an ordered tuple of numbers, usually 2, 3 or 4 `float`s in games. The same three numbers can mean a **position** (a point in space), a **direction** (where something faces) or an **offset** (a displacement). The math is identical until you transform them, at which point the distinction matters, as the homogeneous coordinates section below shows. Length is `sqrt(x*x + y*y + z*z)`; normalizing divides by length to give a unit vector. Always check for a zero-length vector before normalizing: the result is NaN, and NaNs propagate silently through every later calculation until a mesh vanishes."
        },
        {
          "type": "p",
          "text": "The **dot product** `a . b = ax*bx + ay*by + az*bz` equals `|a| |b| cos(theta)`. For unit vectors it is simply the cosine of the angle between them: 1 means same direction, 0 perpendicular, -1 opposite. This one operation underlies diffuse lighting (`max(0, dot(N, L))`), field-of-view checks, back-face culling and projecting one vector onto another. Example: an enemy with a 90 degree vision cone sees the player when `dot(enemyForward, dirToPlayer) > cos(45 degrees) = 0.707`. No trigonometry call, no angle, just three multiplies and an add."
        },
        {
          "type": "figure",
          "id": "graphics-dot-product",
          "caption": "For unit vectors the dot product is the length of b's shadow on a: 0.866 at 30 degrees passes the 0.707 cone test, 0.5 at 60 degrees fails, 0 is perpendicular and -1 is opposite.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"Unit vector a fixed, unit vector b rotating from 30 to 180 degrees; the projection of b onto a shrinks from 0.866 to 0 to minus 1, and b is inside the 90 degree cone only while the dot product exceeds 0.707.\"><style>.graphics-dot-product-t{font-size:13px;fill:var(--fig-ink)}.graphics-dot-product-m{font-size:12px;fill:var(--fig-muted)}.graphics-dot-product-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-dot-product-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-dot-product-e{text-anchor:end}.graphics-dot-product-mid{text-anchor:middle}@keyframes graphics-dot-product-rot{0%,20%{transform:rotate(-30deg)}25%,45%{transform:rotate(-60deg)}50%,70%{transform:rotate(-90deg)}75%,92%{transform:rotate(-180deg)}100%{transform:rotate(-30deg)}}@keyframes graphics-dot-product-pr{0%,20%{transform:scaleX(0.866)}25%,45%{transform:scaleX(0.5)}50%,70%{transform:scaleX(0)}75%,92%{transform:scaleX(-1)}100%{transform:scaleX(0.866)}}@keyframes graphics-dot-product-pp{0%,20%{transform:translateX(121.244px) scaleY(0.5)}25%,45%{transform:translateX(70px) scaleY(0.866)}50%,70%{transform:translateX(0px) scaleY(1)}75%,92%{transform:translateX(-140px) scaleY(0)}100%{transform:translateX(121.244px) scaleY(0.5)}}@keyframes graphics-dot-product-lab{0%,17%{opacity:1}19%,98%{opacity:0}100%{opacity:1}}.graphics-dot-product-b{transform-box:view-box;transform-origin:170px 200px;transform:rotate(-30deg);animation:graphics-dot-product-rot 8s infinite}.graphics-dot-product-pr{transform-box:view-box;transform-origin:170px 200px;transform:scaleX(0.866);animation:graphics-dot-product-pr 8s infinite}.graphics-dot-product-pp{transform-box:view-box;transform-origin:170px 200px;transform:translateX(121.244px) scaleY(0.5);animation:graphics-dot-product-pp 8s infinite}.graphics-dot-product-l{opacity:0;animation:graphics-dot-product-lab 8s infinite}.graphics-dot-product-l1{opacity:1}.graphics-dot-product-l2{animation-delay:-6s}.graphics-dot-product-l3{animation-delay:-4s}.graphics-dot-product-l4{animation-delay:-2s}.graphics-dot-product-big{font-size:16px;font-weight:600;fill:var(--fig-ink)}.graphics-dot-product-v{font-size:15px;font-weight:600;fill:var(--fig-accent2)}.graphics-dot-product-ok{font-size:13px;font-weight:600;fill:var(--fig-ok)}.graphics-dot-product-bad{font-size:13px;font-weight:600;fill:var(--fig-bad)}.graphics-dot-product-n{font-size:13px;font-weight:600;fill:var(--fig-ink)}</style><path d=\"M170 200 L269 101 A140 140 0 0 1 269 299 Z\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.35\" stroke-width=\"1.5\"/><text class=\"graphics-dot-product-m\" x=\"282\" y=\"302\">90° cone</text><path d=\"M30 200 A140 140 0 0 1 310 200\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 5\"/><line x1=\"22\" y1=\"200\" x2=\"330\" y2=\"200\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-dot-product-pr\" x=\"170\" y=\"205\" width=\"140\" height=\"7\" rx=\"3.5\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><line class=\"graphics-dot-product-pp\" x1=\"170\" y1=\"200\" x2=\"170\" y2=\"60\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><line x1=\"170\" y1=\"200\" x2=\"300\" y2=\"200\" stroke=\"var(--fig-accent)\" stroke-width=\"3\" stroke-linecap=\"round\"/><polygon points=\"298,193 312,200 298,207\" fill=\"var(--fig-accent)\"/><text x=\"318\" y=\"205\" style=\"font-size:15px;font-weight:600;fill:var(--fig-accent)\">a</text><g class=\"graphics-dot-product-b\"><line x1=\"170\" y1=\"200\" x2=\"298\" y2=\"200\" stroke=\"var(--fig-accent2)\" stroke-width=\"3\" stroke-linecap=\"round\"/><polygon points=\"298,193 312,200 298,207\" fill=\"var(--fig-accent2)\"/></g><circle cx=\"170\" cy=\"200\" r=\"4\" fill=\"var(--fig-ink)\"/><text class=\"graphics-dot-product-t\" x=\"370\" y=\"52\">a · b = |a| |b| cos θ</text><text class=\"graphics-dot-product-m\" x=\"370\" y=\"74\">for unit vectors: a · b = cos θ</text><g class=\"graphics-dot-product-l graphics-dot-product-l1\"><text class=\"graphics-dot-product-big\" x=\"370\" y=\"122\">θ = 30°</text><text class=\"graphics-dot-product-v\" x=\"370\" y=\"148\">a · b = 0.866</text><text class=\"graphics-dot-product-ok\" x=\"370\" y=\"176\">inside the cone</text><text class=\"graphics-dot-product-m\" x=\"370\" y=\"196\">0.866 > 0.707 = cos 45°</text></g><g class=\"graphics-dot-product-l graphics-dot-product-l2\"><text class=\"graphics-dot-product-big\" x=\"370\" y=\"122\">θ = 60°</text><text class=\"graphics-dot-product-v\" x=\"370\" y=\"148\">a · b = 0.5</text><text class=\"graphics-dot-product-bad\" x=\"370\" y=\"176\">outside the cone</text><text class=\"graphics-dot-product-m\" x=\"370\" y=\"196\">0.5 < 0.707</text></g><g class=\"graphics-dot-product-l graphics-dot-product-l3\"><text class=\"graphics-dot-product-big\" x=\"370\" y=\"122\">θ = 90°</text><text class=\"graphics-dot-product-v\" x=\"370\" y=\"148\">a · b = 0</text><text class=\"graphics-dot-product-n\" x=\"370\" y=\"176\">perpendicular</text><text class=\"graphics-dot-product-m\" x=\"370\" y=\"196\">no component along a</text></g><g class=\"graphics-dot-product-l graphics-dot-product-l4\"><text class=\"graphics-dot-product-big\" x=\"370\" y=\"122\">θ = 180°</text><text class=\"graphics-dot-product-v\" x=\"370\" y=\"148\">a · b = −1</text><text class=\"graphics-dot-product-n\" x=\"370\" y=\"176\">opposite direction</text><text class=\"graphics-dot-product-m\" x=\"370\" y=\"196\">projection points backwards</text></g><line x1=\"370\" y1=\"232\" x2=\"392\" y2=\"232\" stroke=\"var(--fig-accent)\" stroke-width=\"3\" stroke-linecap=\"round\"/><text class=\"graphics-dot-product-t\" x=\"402\" y=\"236\">a: guard forward</text><line x1=\"370\" y1=\"256\" x2=\"392\" y2=\"256\" stroke=\"var(--fig-accent2)\" stroke-width=\"3\" stroke-linecap=\"round\"/><text class=\"graphics-dot-product-t\" x=\"402\" y=\"260\">b: direction to player</text><rect x=\"370\" y=\"276\" width=\"22\" height=\"7\" rx=\"3.5\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.55\"/><text class=\"graphics-dot-product-t\" x=\"402\" y=\"284\">projection of b onto a</text></svg>"
        },
        {
          "type": "p",
          "text": "The **cross product** `a x b` returns a vector perpendicular to both inputs, with length `|a| |b| sin(theta)`. It builds surface normals from two triangle edges, computes a camera's right vector from forward and up, and tells you which way to turn: the sign of the y component of `cross(forward, toTarget)` says whether a target is to the left or right on a flat ground plane. Cross is anti-commutative (`a x b = -(b x a)`), and which direction the result points depends on the handedness of your coordinate system. Unity is left-handed (y up, z forward), OpenGL's classic convention and many DCC tools are right-handed. Mixing assets or math from the two is a classic source of mirrored meshes and flipped winding."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Does the guard see the player? Cone half-angle 45 degrees.\nVector3 toPlayer = (player.position - guard.position).normalized;\nfloat facing = Vector3.Dot(guard.forward, toPlayer);   // cos of angle\nbool inCone = facing > 0.7071f;                         // cos(45 deg)\n\n// Which way should the guard turn? Positive y => target is to the right (left-handed, y up).\nfloat side = Vector3.Cross(guard.forward, toPlayer).y;\nfloat turn = Mathf.Sign(side);"
        },
        {
          "type": "h",
          "text": "Matrices and the order of transforms"
        },
        {
          "type": "p",
          "text": "A 4x4 matrix encodes a linear transform plus translation. Three primitives cover most needs: **translation** (move), **rotation** (turn) and **scale** (stretch). A matrix times a vector transforms the vector; a matrix times a matrix composes two transforms into one, which is why the GPU can apply an arbitrarily long chain of transforms to a million vertices with a single multiply each."
        },
        {
          "type": "p",
          "text": "Order is the whole game, because matrix multiplication is **not commutative**: rotate-then-translate puts the object at the translated spot turned in place, while translate-then-rotate swings it around the origin like a planet. With the **column-vector** convention used by Unity, OpenGL and most math texts, `v' = M * v` and a chain `T * R * S` applies scale first, then rotation, then translation: you read it right to left. With **row-vector** conventions (classic DirectX math, some engines) you write `v * S * R * T`, reading left to right. The geometry is identical; only the notation and the memory layout (column-major vs row-major) change. When you paste a matrix expression from a tutorial into an engine with the other convention, you get a transposed, silently wrong result."
        },
        {
          "type": "figure",
          "id": "graphics-transform-order",
          "caption": "Same rotation, same translation, different order: rotate-then-translate turns the square in place at its new spot, translate-then-rotate swings it around the origin.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 316\" role=\"img\" aria-label=\"Two panels. Left: a square rotates 60 degrees in place, then moves along x, ending turned at the new spot. Right: the square moves along x first, then the 60 degree rotation swings it around the origin like a planet.\"><style>.graphics-transform-order-t{font-size:13px;fill:var(--fig-ink)}.graphics-transform-order-m{font-size:12px;fill:var(--fig-muted)}.graphics-transform-order-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-transform-order-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-transform-order-e{text-anchor:end}.graphics-transform-order-mid{text-anchor:middle}@keyframes graphics-transform-order-lr{0%,10%{transform:rotate(0deg)}35%,94%{transform:rotate(-60deg)}95%,100%{transform:rotate(0deg)}}@keyframes graphics-transform-order-lt{0%,45%{transform:translateX(0px)}70%,94%{transform:translateX(150px)}95%,100%{transform:translateX(0px)}}@keyframes graphics-transform-order-rt{0%,10%{transform:translateX(0px)}35%,94%{transform:translateX(150px)}95%,100%{transform:translateX(0px)}}@keyframes graphics-transform-order-rr{0%,45%{transform:rotate(0deg)}70%,94%{transform:rotate(-60deg)}95%,100%{transform:rotate(0deg)}}@keyframes graphics-transform-order-fd{0%,88%{opacity:1}92%,96%{opacity:0}100%{opacity:1}}.graphics-transform-order-lr{transform-box:view-box;transform-origin:56px 236px;transform:rotate(-60deg);animation:graphics-transform-order-lr 6s infinite}.graphics-transform-order-lt{transform-box:view-box;transform-origin:56px 236px;transform:translateX(150px);animation:graphics-transform-order-lt 6s infinite}.graphics-transform-order-rt{transform-box:view-box;transform-origin:368px 236px;transform:translateX(150px);animation:graphics-transform-order-rt 6s infinite}.graphics-transform-order-rr{transform-box:view-box;transform-origin:368px 236px;transform:rotate(-60deg);animation:graphics-transform-order-rr 6s infinite}.graphics-transform-order-f{animation:graphics-transform-order-fd 6s infinite}</style><rect x=\"12\" y=\"10\" width=\"300\" height=\"296\" rx=\"12\" fill=\"var(--fig-panel)\"/><rect x=\"328\" y=\"10\" width=\"300\" height=\"296\" rx=\"12\" fill=\"var(--fig-panel)\"/><text class=\"graphics-transform-order-h\" x=\"30\" y=\"40\">Rotate, then translate</text><text class=\"graphics-transform-order-m graphics-transform-order-c\" x=\"30\" y=\"61\">M = T · R   (R applies first)</text><text class=\"graphics-transform-order-h\" x=\"346\" y=\"40\">Translate, then rotate</text><text class=\"graphics-transform-order-m graphics-transform-order-c\" x=\"346\" y=\"61\">M = R · T   (T applies first)</text><line x1=\"34\" y1=\"236\" x2=\"292\" y2=\"236\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"56\" y1=\"258\" x2=\"56\" y2=\"84\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-transform-order-m graphics-transform-order-mid\" x=\"56\" y=\"274\">origin</text><text class=\"graphics-transform-order-m\" x=\"280\" y=\"228\">x</text><line x1=\"346\" y1=\"236\" x2=\"608\" y2=\"236\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"368\" y1=\"258\" x2=\"368\" y2=\"84\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-transform-order-m graphics-transform-order-mid\" x=\"368\" y=\"274\">origin</text><text class=\"graphics-transform-order-m\" x=\"596\" y=\"228\">x</text><g transform=\"translate(150 0) rotate(-60 56 236)\"><rect x=\"38\" y=\"218\" width=\"36\" height=\"36\" rx=\"5\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.6\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/></g><g transform=\"rotate(-60 368 236) translate(150 0)\"><rect x=\"350\" y=\"218\" width=\"36\" height=\"36\" rx=\"5\" fill=\"none\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.6\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/></g><path d=\"M518 236 A150 150 0 0 0 443 106.1\" fill=\"none\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\" stroke-dasharray=\"5 5\"/><text class=\"graphics-transform-order-m\" x=\"508\" y=\"140\" style=\"fill:var(--fig-accent2)\">swings around</text><text class=\"graphics-transform-order-m\" x=\"508\" y=\"156\" style=\"fill:var(--fig-accent2)\">the origin</text><text class=\"graphics-transform-order-m\" x=\"168\" y=\"184\">turned in place</text><text class=\"graphics-transform-order-m\" x=\"168\" y=\"200\">at the new spot</text><g class=\"graphics-transform-order-f\"><g class=\"graphics-transform-order-lt\"><g class=\"graphics-transform-order-lr\"><rect x=\"38\" y=\"218\" width=\"36\" height=\"36\" rx=\"5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><line x1=\"56\" y1=\"236\" x2=\"74\" y2=\"236\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/><circle cx=\"74\" cy=\"236\" r=\"3.5\" fill=\"var(--fig-ink)\"/></g></g></g><g class=\"graphics-transform-order-f\"><g class=\"graphics-transform-order-rr\"><g class=\"graphics-transform-order-rt\"><rect x=\"350\" y=\"218\" width=\"36\" height=\"36\" rx=\"5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><line x1=\"368\" y1=\"236\" x2=\"386\" y2=\"236\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/><circle cx=\"386\" cy=\"236\" r=\"3.5\" fill=\"var(--fig-ink)\"/></g></g></g><text class=\"graphics-transform-order-m\" x=\"30\" y=\"292\">1 rotate 60°  ·  2 move +x by 150</text><text class=\"graphics-transform-order-m\" x=\"346\" y=\"292\">1 move +x by 150  ·  2 rotate 60°</text></svg>"
        },
        {
          "type": "list",
          "items": [
            "Canonical object placement is **TRS**: scale in local space, rotate, then translate to the world position. Non-uniform scale after rotation causes skew (shear), which is why parenting a rotated child under a non-uniformly scaled parent distorts it.",
            "A hierarchy is multiplication down the tree: `world = parentWorld * local`. A bone chain of 60 joints is 60 matrix multiplies per skeleton per frame, which is why skinning is done on the GPU or in jobs.",
            "A rotation matrix's inverse is its transpose. A general affine matrix needs a real inverse, which is far more expensive. Prefer inverting once and caching.",
            "**Normals do not transform like positions.** Under non-uniform scale they must be multiplied by the inverse-transpose of the model matrix, otherwise lighting skews on stretched objects."
          ]
        },
        {
          "type": "h",
          "text": "Homogeneous coordinates"
        },
        {
          "type": "p",
          "text": "Translation is not a linear operation on 3-vectors: you cannot write 'add (5,0,0)' as a 3x3 matrix multiply. The fix is to add a fourth coordinate `w` and work in 4D: a point is `(x, y, z, 1)` and a direction is `(x, y, z, 0)`. The fourth column of the 4x4 matrix then holds translation, and `w = 1` picks it up while `w = 0` ignores it. That is exactly right: moving an object should move its vertices but not change which way an arrow points. Perspective projection later uses `w` for something else: after projection, `w` holds the view-space depth, and the divide by `w` is what makes distant objects smaller. That step is the next topic."
        },
        {
          "type": "h",
          "text": "Rotations: Euler angles, gimbal lock and quaternions"
        },
        {
          "type": "p",
          "text": "**Euler angles** describe a rotation as three angles around three axes applied in a fixed order (Unity applies Z, then X, then Y). They are intuitive and great for editor fields and for a designer typing numbers. They are poor as the stored runtime representation for three reasons. First, **gimbal lock**: when the middle rotation reaches 90 degrees, the first and third axes align and one degree of freedom disappears. Rotating either remaining angle now spins the object about the same axis, and you cannot rotate about the lost axis without a large jump in the other angles. Second, there are many angle triples for the same orientation, so interpolating angles can swing the long way round. Third, composing two Euler rotations has no direct formula; you convert through matrices."
        },
        {
          "type": "figure",
          "id": "graphics-gimbal-lock",
          "caption": "As pitch reaches 90 degrees the roll axis swings onto the yaw axis, so two Euler angles now spin the object the same way and one degree of freedom is gone.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 318\" role=\"img\" aria-label=\"Yaw, pitch and roll axes of an Euler gimbal. As pitch rises from 0 to 90 degrees the roll axis tilts until it lies on the yaw axis, so two of the three angles spin about the same axis: gimbal lock.\"><style>.graphics-gimbal-lock-t{font-size:13px;fill:var(--fig-ink)}.graphics-gimbal-lock-m{font-size:12px;fill:var(--fig-muted)}.graphics-gimbal-lock-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-gimbal-lock-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-gimbal-lock-e{text-anchor:end}.graphics-gimbal-lock-mid{text-anchor:middle}@keyframes graphics-gimbal-lock-sh{0%,12%{transform:rotate(-38.66deg) scaleX(0.64)}25%{transform:rotate(19.53deg) scaleX(0.459)}37.5%{transform:rotate(69.43deg) scaleX(0.711)}50%,88%{transform:rotate(90deg) scaleX(1)}92%{transform:rotate(69.43deg) scaleX(0.711)}96%{transform:rotate(19.53deg) scaleX(0.459)}100%{transform:rotate(-38.66deg) scaleX(0.64)}}@keyframes graphics-gimbal-lock-hd{0%,12%{transform:rotate(-38.66deg) translateX(70.4px)}25%{transform:rotate(19.53deg) translateX(50.5px)}37.5%{transform:rotate(69.43deg) translateX(78.2px)}50%,88%{transform:rotate(90deg) translateX(110px)}92%{transform:rotate(69.43deg) translateX(78.2px)}96%{transform:rotate(19.53deg) translateX(50.5px)}100%{transform:rotate(-38.66deg) translateX(70.4px)}}@keyframes graphics-gimbal-lock-zt{0%,12%{transform:translate(51px,-55.2px)}25%{transform:translate(46.5px,22.9px)}37.5%{transform:translate(15.8px,90.1px)}50%,88%{transform:translate(-18px,128px)}92%{transform:translate(15.8px,90.1px)}96%{transform:translate(46.5px,22.9px)}100%{transform:translate(51px,-55.2px)}}@keyframes graphics-gimbal-lock-bar{0%,12%{transform:scaleX(0)}50%,88%{transform:scaleX(1)}100%{transform:scaleX(0)}}@keyframes graphics-gimbal-lock-s0{0%,12%{opacity:1}15%,97%{opacity:0}100%{opacity:1}}@keyframes graphics-gimbal-lock-s1{0%,13%{opacity:0}16%,46%{opacity:1}49%,100%{opacity:0}}@keyframes graphics-gimbal-lock-s2{0%,47%{opacity:0}50%,88%{opacity:1}91%,100%{opacity:0}}.graphics-gimbal-lock-sh{transform-box:view-box;transform-origin:170px 170px;transform:rotate(90deg) scaleX(1);animation:graphics-gimbal-lock-sh 7s infinite}.graphics-gimbal-lock-hd{transform-box:view-box;transform-origin:170px 170px;transform:rotate(90deg) translateX(110px);animation:graphics-gimbal-lock-hd 7s infinite}.graphics-gimbal-lock-zt{transform:translate(-18px,128px);animation:graphics-gimbal-lock-zt 7s infinite}.graphics-gimbal-lock-bar{transform-box:view-box;transform-origin:430px 0px;animation:graphics-gimbal-lock-bar 7s infinite}.graphics-gimbal-lock-s0{opacity:0;animation:graphics-gimbal-lock-s0 7s infinite}.graphics-gimbal-lock-s1{opacity:0;animation:graphics-gimbal-lock-s1 7s infinite}.graphics-gimbal-lock-s2{animation:graphics-gimbal-lock-s2 7s infinite}.graphics-gimbal-lock-k{font-size:15px;font-weight:600}</style><line x1=\"170\" y1=\"36\" x2=\"170\" y2=\"284\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.45\" stroke-width=\"1.5\" stroke-dasharray=\"5 5\"/><line x1=\"170\" y1=\"170\" x2=\"170\" y2=\"62\" stroke=\"var(--fig-accent)\" stroke-width=\"3\" stroke-linecap=\"round\"/><polygon points=\"164,64 170,50 176,64\" fill=\"var(--fig-accent)\"/><text class=\"graphics-gimbal-lock-k\" x=\"182\" y=\"60\" style=\"fill:var(--fig-accent)\">Y</text><line x1=\"170\" y1=\"170\" x2=\"272\" y2=\"170\" stroke=\"var(--fig-ink)\" stroke-width=\"3\" stroke-linecap=\"round\"/><polygon points=\"270,164 284,170 270,176\" fill=\"var(--fig-ink)\"/><text class=\"graphics-gimbal-lock-k\" x=\"292\" y=\"175\" style=\"fill:var(--fig-ink)\">X</text><line class=\"graphics-gimbal-lock-sh\" x1=\"170\" y1=\"170\" x2=\"280\" y2=\"170\" stroke=\"var(--fig-accent2)\" stroke-width=\"3.5\"/><g class=\"graphics-gimbal-lock-hd\"><polygon points=\"158,163 172,170 158,177\" fill=\"var(--fig-accent2)\"/></g><text class=\"graphics-gimbal-lock-k graphics-gimbal-lock-zt graphics-gimbal-lock-mid\" x=\"188\" y=\"175\" style=\"fill:var(--fig-accent2)\">Z</text><circle cx=\"170\" cy=\"170\" r=\"5\" fill=\"var(--fig-ink)\"/><text class=\"graphics-gimbal-lock-h\" x=\"384\" y=\"44\">Euler angles (Unity order Z, X, Y)</text><text class=\"graphics-gimbal-lock-m\" x=\"384\" y=\"84\">pitch</text><rect x=\"430\" y=\"74\" width=\"180\" height=\"12\" rx=\"6\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><rect class=\"graphics-gimbal-lock-bar\" x=\"430\" y=\"74\" width=\"180\" height=\"12\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.7\"/><text class=\"graphics-gimbal-lock-m\" x=\"430\" y=\"104\">0°</text><text class=\"graphics-gimbal-lock-m graphics-gimbal-lock-e\" x=\"610\" y=\"104\">90°</text><g class=\"graphics-gimbal-lock-s0\"><text x=\"384\" y=\"144\" style=\"font-size:14px;font-weight:600;fill:var(--fig-ok)\">Three independent axes</text><text class=\"graphics-gimbal-lock-m\" x=\"384\" y=\"166\">each angle turns the object</text><text class=\"graphics-gimbal-lock-m\" x=\"384\" y=\"184\">a different way</text></g><g class=\"graphics-gimbal-lock-s1\"><text x=\"384\" y=\"144\" style=\"font-size:14px;font-weight:600;fill:var(--fig-ink)\">Pitch tilts the roll axis</text><text class=\"graphics-gimbal-lock-m\" x=\"384\" y=\"166\">toward the yaw axis</text><text class=\"graphics-gimbal-lock-m\" x=\"384\" y=\"184\"></text></g><g class=\"graphics-gimbal-lock-s2\"><text x=\"384\" y=\"144\" style=\"font-size:14px;font-weight:600;fill:var(--fig-bad)\">Gimbal lock at pitch 90°</text><text class=\"graphics-gimbal-lock-m\" x=\"384\" y=\"166\">roll and yaw now spin about</text><text class=\"graphics-gimbal-lock-m\" x=\"384\" y=\"184\">one axis: a degree of freedom lost</text></g><line x1=\"384\" y1=\"218\" x2=\"406\" y2=\"218\" stroke=\"var(--fig-accent)\" stroke-width=\"3\" stroke-linecap=\"round\"/><text class=\"graphics-gimbal-lock-t\" x=\"416\" y=\"222\">Y  yaw (outer ring)</text><line x1=\"384\" y1=\"242\" x2=\"406\" y2=\"242\" stroke=\"var(--fig-ink)\" stroke-width=\"3\" stroke-linecap=\"round\"/><text class=\"graphics-gimbal-lock-t\" x=\"416\" y=\"246\">X  pitch (middle ring)</text><line x1=\"384\" y1=\"266\" x2=\"406\" y2=\"266\" stroke=\"var(--fig-accent2)\" stroke-width=\"3\" stroke-linecap=\"round\"/><text class=\"graphics-gimbal-lock-t\" x=\"416\" y=\"270\">Z  roll (inner ring)</text><text class=\"graphics-gimbal-lock-t\" x=\"384\" y=\"302\" style=\"font-weight:600\">Fix: store a quaternion</text></svg>"
        },
        {
          "type": "p",
          "text": "A **quaternion** stores a rotation as four numbers `(x, y, z, w)`: an axis scaled by `sin(theta/2)` and `cos(theta/2)` in `w`. A unit quaternion has no singularity, composes with a 16-multiply product, interpolates with **slerp** at constant angular speed, and is smaller than a 3x3 matrix (16 bytes against 36). Two quaternions `q` and `-q` are the same rotation (the double cover), so slerp must flip sign to take the short path; engine slerps do this for you. Quaternions drift off unit length after many multiplications through floating-point error, so renormalize occasionally. Composition order matters: in Unity `q2 * q1` rotates by `q1` first, then `q2`, matching the matrix convention."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Turret yaw with a limit: store orientation as a quaternion, edit it via axis-angle.\nQuaternion yaw   = Quaternion.AngleAxis(yawDegrees, Vector3.up);\nQuaternion pitch = Quaternion.AngleAxis(pitchDegrees, Vector3.right);\ntransform.rotation = yaw * pitch;           // pitch applied first, in yaw's local frame\n\n// Smoothly aim: RotateTowards turns along the shortest arc at a capped angular speed.\nQuaternion goal = Quaternion.LookRotation(toTarget, Vector3.up);\ntransform.rotation = Quaternion.RotateTowards(transform.rotation, goal, 180f * Time.deltaTime);"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Never read `transform.eulerAngles`, add 1 to a component and write it back each frame as your rotation state. The values are re-derived from the quaternion and can wrap or jump (170 to -190), which is the source of most 'it flips at the top' bugs. Keep your own pitch and yaw floats, clamp them, and build a quaternion from them."
        },
        {
          "type": "h",
          "text": "Floating-point precision"
        },
        {
          "type": "p",
          "text": "A 32-bit `float` has a 24-bit significand, so roughly 7 decimal digits. The spacing between adjacent representable values grows with magnitude: near 1 it is about 0.0000001, near 1,000 about 0.00006, and at 100,000 metres from the origin it is 2^-7, about 0.0078 m, nearly a centimetre. At that distance a character's vertices visibly snap between positions, animation jitters and physics gets unstable. This is why large open worlds use floating origin (re-centring the world around the player), chunk-local coordinates, or 64-bit positions on the CPU with float offsets sent to the GPU. Subtracting two large nearly equal numbers (catastrophic cancellation) is the underlying hazard."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "AI agents write transform math fluently and get conventions wrong quietly. Tell the agent your engine's handedness, up axis, matrix convention (column or row), and rotation order; ask it to state the space of every vector it handles in variable names (`dirWorld`, `posLocal`). Verify by running a tiny test: rotate a known vector 90 degrees about a known axis and assert the result. Typical failures: Euler angles accumulated per frame, transposed matrices copied from a GLSL tutorial into an HLSL shader, normalizing a possibly-zero vector, and using `*` order backwards for quaternions."
        },
        {
          "type": "h",
          "text": "Common misconceptions"
        },
        {
          "type": "list",
          "items": [
            "'Matrices rotate then translate because I wrote them in that order.' The order of application depends on convention; read the engine docs and test with a known case.",
            "'Quaternions are more accurate than matrices.' They are more compact, drift less in composition chains and interpolate well, but both suffer float error and both need renormalizing or orthonormalizing.",
            "'Gimbal lock is a hardware or physics effect.' It is purely a property of the three-angle parametrization, and it disappears when you store the orientation as a quaternion or matrix."
          ]
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A guard must notice the player only inside a view cone, and the code calls `acos` or `Vector3.Angle` per enemy per frame",
              "use": "Dot product against a precomputed cosine",
              "why": "With unit vectors, `dot(forward, toTarget) > cos(halfAngle)` is the cone test with no trig. Normalise both vectors first, or the comparison silently scales with distance."
            },
            {
              "signal": "A homing missile or AI must decide whether to steer left or right toward a target",
              "use": "Sign of the cross product",
              "why": "The sign of `cross(forward, toTarget)` along the up axis gives turn direction in one step. The sign convention flips with handedness, so verify it once in your engine."
            },
            {
              "signal": "You need the facing normal of a triangle or a plane through three points",
              "use": "Cross product of two edges",
              "why": "`normalize(cross(b - a, c - a))` is perpendicular to the surface. Its direction follows the winding order, so swapping two vertices flips the normal."
            },
            {
              "signal": "A rotation tween drifts, spins the long way round, or behaves oddly once another axis nears 90 degrees",
              "use": "Quaternion orientation with slerp",
              "why": "Quaternions avoid gimbal lock and interpolate along the shortest arc. Keep Euler angles for designer input and display only; renormalise quaternions after long chains of multiplications."
            },
            {
              "signal": "Shading looks wrong on a mesh with non-uniform scale even though the silhouette is correct",
              "use": "Inverse-transpose normal matrix",
              "why": "Normals must be transformed by the inverse transpose of the model matrix to stay perpendicular to the surface. For uniform scale the plain rotation works and is cheaper."
            },
            {
              "signal": "An object is skewed or orbits the origin instead of spinning in place after you build its matrix by hand",
              "use": "TRS order: scale, then rotate, then translate",
              "why": "With column vectors the world matrix is `T * R * S`, applied right to left. Matrix multiplication is not commutative, so any other order changes the result."
            },
            {
              "signal": "A velocity or normal gets shifted when you push it through the same matrix as positions",
              "use": "w = 0 for directions, w = 1 for points",
              "why": "Homogeneous w makes translation apply to points only. Use the direction variant of the transform call; a direction transformed as a point picks up the object's position."
            },
            {
              "signal": "A character or camera jitters only when it is tens of kilometres from the world origin",
              "use": "Floating origin (origin rebasing)",
              "why": "Float spacing grows with magnitude, so shift the world back toward zero when the player strays far. Costs a rebase step that must update physics, particles and networked positions consistently."
            },
            {
              "signal": "A hot loop finds the nearest enemy by calling `Vector3.Distance` or `magnitude` on every candidate",
              "use": "Compare squared distances",
              "why": "Ordering is preserved without the square root: compare `sqrMagnitude` against `range * range`. Only take the root for the final value you actually display or use."
            },
            {
              "signal": "A character should slide along a wall instead of stopping dead when moving into it",
              "use": "Project out the normal component",
              "why": "`v - dot(v, n) * n` removes the part of the motion into the surface and keeps the tangential part. `n` must be unit length, or the slide speed is wrong."
            }
          ]
        }
      ],
      "keyPoints": [
        "Dot gives the cosine of the angle between unit vectors, cross gives a perpendicular vector whose sign tells you turn direction; both avoid trig calls.",
        "Matrix multiplication is not commutative: with column vectors a chain applies right to left, and TRS means scale first, translate last.",
        "Homogeneous w distinguishes points (w=1, translated) from directions (w=0, not translated), and later holds depth for perspective.",
        "Store orientation as a quaternion; use Euler angles only for input and display, because of gimbal lock and ambiguity.",
        "Float spacing grows with distance from the origin: about 0.0078 m at 100 km, so far-from-origin jitter is a precision problem, not a bug in your logic."
      ],
      "quiz": [
        {
          "q": "A guard should notice the player only inside a 60 degree total cone (30 degrees either side of forward). Both vectors are normalized. Which test is correct and cheapest?",
          "options": [
            "Dot(forward, toPlayer) > cos(30 degrees), about 0.866",
            "Cross(forward, toPlayer).magnitude < sin(30 degrees), about 0.5",
            "Dot(forward, toPlayer) < cos(30 degrees), about 0.866",
            "Angle between the vectors via acos, compared against 60 degrees"
          ],
          "answer": 0,
          "explain": "For unit vectors the dot product is the cosine of the angle, and a smaller angle means a larger cosine, so the player is inside when dot exceeds cos(half-angle). The cross magnitude option also accepts targets directly behind the guard (sine is small near 180 degrees), and comparing against 60 degrees uses the full angle instead of the half-angle."
        },
        {
          "q": "A tween rotates a platform by adding 2 degrees per frame to a stored Euler Y angle, and the platform's tilt X is later set to 90 degrees by a designer. The platform's spin suddenly looks like it rotates about the wrong axis. What is happening?",
          "options": [
            "Floating-point drift in the Y angle accumulating over many frames",
            "The quaternion backing the transform is not normalized",
            "Matrix multiplication order is reversed in the transform hierarchy",
            "Gimbal lock: at 90 degrees on the middle axis two rotation axes coincide"
          ],
          "answer": 3,
          "explain": "With a 90 degree middle angle, the first and third Euler axes align, so a degree of freedom is lost and the remaining angle spins about a different axis than expected. Drift or normalization problems would produce slow error, not a sudden axis change."
        },
        {
          "q": "You apply a model matrix with non-uniform scale (2, 1, 1) to a mesh and the shading looks wrong, though the silhouette is right. What is the proper fix for the normals?",
          "options": [
            "Transform normals by the inverse-transpose of the model matrix, then renormalize",
            "Transform normals by the same model matrix and skip renormalizing",
            "Set w to 1 so the normal is translated along with the vertex",
            "Convert the normals to a quaternion before transforming"
          ],
          "answer": 0,
          "explain": "Normals are perpendicular to the surface, and a stretch changes that relationship unless you use the inverse-transpose. Using the model matrix directly skews them, and w should be 0 for directions so they are not translated."
        },
        {
          "q": "A character at x = 150,000 m in a huge open world jitters while walking at normal speed, though identical code works near the origin. Which change most directly addresses the cause?",
          "options": [
            "Replace Euler angles with quaternions for the character's rotation",
            "Re-center the world around the player (floating origin) or use chunk-local coordinates",
            "Normalize the velocity vector before adding it each frame",
            "Switch the transform hierarchy from column-vector to row-vector convention"
          ],
          "answer": 1,
          "explain": "At that magnitude float spacing is about 1 cm or worse, so position updates quantize; keeping coordinates small fixes it. Rotation representation, normalization and matrix convention do not change the resolution of large position values."
        },
        {
          "q": "In a column-vector engine you want a crate scaled 2x, then rotated 90 degrees about Y, then placed at (10, 0, 0). Which expression gives that world matrix?",
          "options": [
            "S * R * T",
            "R * T * S",
            "T * R * S",
            "T * S * R"
          ],
          "answer": 2,
          "explain": "Column-vector chains apply right to left, so T * R * S scales first, rotates second and translates last. S * R * T would translate first and then rotate and scale that offset, leaving the crate 20 units from the origin along a rotated axis instead of at (10, 0, 0)."
        },
        {
          "q": "A character controller stops dead whenever it touches a wall at an angle, and playtesters say moving along walls feels sticky. You want it to glide along the wall instead. What should you reach for?",
          "options": [
            "Zero the velocity whenever a contact is detected on a wall",
            "Reflect the velocity about the wall normal on each hit",
            "Subtract the velocity's component along the wall normal",
            "Rotate the velocity 90 degrees toward the wall tangent"
          ],
          "answer": 2,
          "explain": "Removing the part of velocity along the normal (`v - dot(v, n) * n`) leaves the tangential motion, so the character slides. Reflecting would bounce it off, and zeroing is the sticky behaviour you already have."
        }
      ]
    },
    {
      "id": "graphics-spaces-cameras",
      "title": "Coordinate Spaces and Cameras",
      "minutes": 13,
      "summary": "The chain from object space to screen pixels, perspective vs orthographic projection, and how the depth buffer and reversed-Z manage precision.",
      "lesson": [
        {
          "type": "p",
          "text": "A vertex in a character mesh is stored as a position like (0.1, 1.7, 0.0), meaning roughly 'the top of the head, relative to the pivot at the feet'. Eventually it must light up one specific pixel on a 2560x1440 screen, or none at all. Between those two facts sits a chain of coordinate spaces, each answering a different question, and a depth buffer that decides which surface wins at each pixel. When a mesh draws in the wrong place, vanishes at the edges, or shimmers with striped artifacts in the distance, the bug lives at one particular link of this chain. Knowing the chain lets you name the link."
        },
        {
          "type": "h",
          "text": "The chain of spaces"
        },
        {
          "type": "list",
          "items": [
            "**Object (local, model) space**: coordinates as authored in the DCC tool, relative to the mesh's pivot. Stored in the vertex buffer and never changes at runtime.",
            "**World space**: one shared space for the whole scene. The **model matrix** (object to world) places, rotates and scales each instance. Lighting and physics are usually reasoned about here.",
            "**View (camera, eye) space**: the world re-expressed with the camera at the origin looking along a fixed axis. The **view matrix** is the inverse of the camera's own world matrix. In Unity's shader conventions view space follows the OpenGL habit of the camera looking down negative Z, even though its world space is left-handed, which is a classic source of sign errors.",
            "**Clip space**: the output of the projection matrix, and the space your vertex shader must write to (`SV_Position` in HLSL, `gl_Position` in GLSL). Positions are 4D `(x, y, z, w)` and a point is inside the view volume when `-w <= x <= w`, `-w <= y <= w` and `0 <= z <= w` (Direct3D, Vulkan, Metal) or `-w <= z <= w` (OpenGL).",
            "**NDC (normalized device coordinates)**: clip space after the **perspective divide** `xyz / w`. Visible x and y span -1 to 1; z spans 0 to 1 (D3D, Vulkan, Metal) or -1 to 1 (OpenGL).",
            "**Screen (window) space**: NDC mapped by the viewport transform to pixels, e.g. x from 0 to 2560. Some APIs put y=0 at the top, others at the bottom, so render-to-texture code often needs a flip."
          ]
        },
        {
          "type": "p",
          "text": "The composed vertex path is `clip = Projection * View * Model * position`. Engines precompute `View * Projection` per camera and `Model` per object, and typically the vertex shader does one or two 4x4 multiplies per vertex. The GPU performs clipping against the clip volume and the perspective divide fixedly after your shader runs; you never write the divide yourself."
        },
        {
          "type": "figure",
          "id": "graphics-space-chain",
          "caption": "Follow one head vertex through every space: the model, view and projection matrices, then the fixed divide by w and the viewport map it to a pixel (camera at (10, 1.2, 0), 60 degree FOV, 16:9).",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 326\" role=\"img\" aria-label=\"A head vertex travels object, world, view, clip, NDC and screen space, with its coordinates in each: the model, view and projection matrices, then the divide by w and the viewport mapping.\"><style>.graphics-space-chain-t{font-size:13px;fill:var(--fig-ink)}.graphics-space-chain-m{font-size:12px;fill:var(--fig-muted)}.graphics-space-chain-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-space-chain-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-space-chain-e{text-anchor:end}.graphics-space-chain-mid{text-anchor:middle}@keyframes graphics-space-chain-dot{0%,11%{transform:translate(0px,0px);opacity:1}16.7%,27.7%{transform:translate(212px,0px);opacity:1}33.3%,44.3%{transform:translate(424px,0px);opacity:1}50%,61%{transform:translate(424px,170px);opacity:1}66.7%,77.7%{transform:translate(212px,170px);opacity:1}83.3%,94.3%{transform:translate(0px,170px);opacity:1}97%{transform:translate(0px,170px);opacity:0}98%{transform:translate(0px,0px);opacity:0}100%{transform:translate(0px,0px);opacity:1}}@keyframes graphics-space-chain-hl{0%,14.7%{opacity:1}17.2%,98%{opacity:0}100%{opacity:1}}.graphics-space-chain-dot{animation:graphics-space-chain-dot 7.2s infinite}.graphics-space-chain-hl{opacity:0;animation:graphics-space-chain-hl 7.2s infinite}.graphics-space-chain-h0{animation-delay:0s}.graphics-space-chain-h1{animation-delay:-6s}.graphics-space-chain-h2{animation-delay:-4.8s}.graphics-space-chain-h3{animation-delay:-3.6s}.graphics-space-chain-h4{animation-delay:-2.4s}.graphics-space-chain-h5{animation-delay:-1.2s}.graphics-space-chain-x{font-size:13px;fill:var(--fig-accent);font-weight:600}.graphics-space-chain-op{font-size:12px;font-weight:600;fill:var(--fig-accent2)}</style><text class=\"graphics-space-chain-m graphics-space-chain-c\" x=\"28\" y=\"24\">clip = Projection · View · Model · position</text><rect x=\"28\" y=\"44\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-space-chain-hl graphics-space-chain-h0\" x=\"28\" y=\"44\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-space-chain-h\" x=\"42\" y=\"70\">Object</text><text class=\"graphics-space-chain-x graphics-space-chain-c\" x=\"42\" y=\"100\" style=\"font-size:12px\">(0.1, 1.7, 0)</text><text class=\"graphics-space-chain-m\" x=\"42\" y=\"124\">relative to the pivot</text><rect x=\"240\" y=\"44\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-space-chain-hl graphics-space-chain-h1\" x=\"240\" y=\"44\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-space-chain-h\" x=\"254\" y=\"70\">World</text><text class=\"graphics-space-chain-x graphics-space-chain-c\" x=\"254\" y=\"100\" style=\"font-size:12px\">(10.1, 1.7, 5)</text><text class=\"graphics-space-chain-m\" x=\"254\" y=\"124\">shared scene space</text><rect x=\"452\" y=\"44\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-space-chain-hl graphics-space-chain-h2\" x=\"452\" y=\"44\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-space-chain-h\" x=\"466\" y=\"70\">View</text><text class=\"graphics-space-chain-x graphics-space-chain-c\" x=\"466\" y=\"100\" style=\"font-size:12px\">(0.1, 0.5, −5)</text><text class=\"graphics-space-chain-m\" x=\"466\" y=\"124\">camera looks down −z</text><rect x=\"452\" y=\"214\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-space-chain-hl graphics-space-chain-h3\" x=\"452\" y=\"214\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-space-chain-h\" x=\"466\" y=\"240\">Clip</text><text class=\"graphics-space-chain-x graphics-space-chain-c\" x=\"466\" y=\"270\" style=\"font-size:12px\">(0.1, 0.87, 4.9, 5)</text><text class=\"graphics-space-chain-m\" x=\"466\" y=\"294\">w = view depth</text><rect x=\"240\" y=\"214\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-space-chain-hl graphics-space-chain-h4\" x=\"240\" y=\"214\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-space-chain-h\" x=\"254\" y=\"240\">NDC</text><text class=\"graphics-space-chain-x graphics-space-chain-c\" x=\"254\" y=\"270\" style=\"font-size:12px\">(0.02, 0.17, 0.98)</text><text class=\"graphics-space-chain-m\" x=\"254\" y=\"294\">x, y in −1..1, z 0..1</text><rect x=\"28\" y=\"214\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-space-chain-hl graphics-space-chain-h5\" x=\"28\" y=\"214\" width=\"160\" height=\"96\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.08\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-space-chain-h\" x=\"42\" y=\"240\">Screen</text><text class=\"graphics-space-chain-x graphics-space-chain-c\" x=\"42\" y=\"270\" style=\"font-size:12px\">(1305, 595) px</text><text class=\"graphics-space-chain-m\" x=\"42\" y=\"294\">2560×1440, y from top</text><line x1=\"192\" y1=\"100\" x2=\"230\" y2=\"100\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><polygon points=\"227,95 236,100 227,105\" fill=\"var(--fig-muted)\"/><text class=\"graphics-space-chain-op graphics-space-chain-mid\" x=\"214\" y=\"90\">Model</text><line x1=\"404\" y1=\"100\" x2=\"442\" y2=\"100\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><polygon points=\"439,95 448,100 439,105\" fill=\"var(--fig-muted)\"/><text class=\"graphics-space-chain-op graphics-space-chain-mid\" x=\"426\" y=\"90\">View</text><line x1=\"532\" y1=\"144\" x2=\"532\" y2=\"204\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><polygon points=\"527,201 532,210 537,201\" fill=\"var(--fig-muted)\"/><text class=\"graphics-space-chain-op graphics-space-chain-e\" x=\"522\" y=\"181\">Projection</text><line x1=\"448\" y1=\"270\" x2=\"410\" y2=\"270\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><polygon points=\"413,265 404,270 413,275\" fill=\"var(--fig-muted)\"/><text class=\"graphics-space-chain-op graphics-space-chain-mid\" x=\"426\" y=\"260\">÷ w</text><line x1=\"236\" y1=\"270\" x2=\"198\" y2=\"270\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><polygon points=\"201,265 192,270 201,275\" fill=\"var(--fig-muted)\"/><text class=\"graphics-space-chain-op graphics-space-chain-mid\" x=\"214\" y=\"260\" style=\"font-size:11.5px\">viewport</text><circle class=\"graphics-space-chain-dot\" cx=\"170\" cy=\"62\" r=\"6\" fill=\"var(--fig-accent)\"/></svg>"
        },
        {
          "type": "h",
          "text": "Perspective projection"
        },
        {
          "type": "p",
          "text": "A perspective camera is defined by a **vertical field of view** (commonly 60 to 90 degrees in games), an **aspect ratio** (width/height) and **near and far planes**. The projection matrix scales x and y by `1/tan(fov/2)` (and x by `1/aspect`) and, crucially, copies view-space depth into `w`. After the divide, `x_ndc = x_view / depth`: farther objects have larger divisors and shrink toward the centre, which is exactly perspective foreshortening. Hence the importance of `w`: it is not a spare number, it is depth."
        },
        {
          "type": "figure",
          "id": "graphics-frustum",
          "caption": "The projection copies depth into w, so dividing by it shrinks an object in proportion to its distance: the same bar at 2.7 times the depth is 1/2.7 as tall on screen.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 392\" role=\"img\" aria-label=\"Side view of a 60 degree perspective frustum with near and far planes. A bar of fixed height moves away from the camera and its height on screen shrinks in proportion to one over depth.\"><style>.graphics-frustum-t{font-size:13px;fill:var(--fig-ink)}.graphics-frustum-m{font-size:12px;fill:var(--fig-muted)}.graphics-frustum-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-frustum-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-frustum-e{text-anchor:end}.graphics-frustum-mid{text-anchor:middle}@keyframes graphics-frustum-o{0%,10%{transform:translateX(0px)}20%{transform:translateX(40px)}30%{transform:translateX(90px)}40%{transform:translateX(140px)}50%,60%{transform:translateX(190px)}70%{transform:translateX(140px)}80%{transform:translateX(90px)}90%{transform:translateX(40px)}100%{transform:translateX(0px)}}@keyframes graphics-frustum-u{0%,10%{transform:rotate(-15.26deg) scaleX(1.140)}20%{transform:rotate(-11.31deg) scaleX(1.530)}30%{transform:rotate(-8.53deg) scaleX(2.022)}40%{transform:rotate(-6.84deg) scaleX(2.518)}50%,60%{transform:rotate(-5.71deg) scaleX(3.015)}70%{transform:rotate(-6.84deg) scaleX(2.518)}80%{transform:rotate(-8.53deg) scaleX(2.022)}90%{transform:rotate(-11.31deg) scaleX(1.530)}100%{transform:rotate(-15.26deg) scaleX(1.140)}}@keyframes graphics-frustum-l{0%,10%{transform:rotate(15.26deg) scaleX(1.140)}20%{transform:rotate(11.31deg) scaleX(1.530)}30%{transform:rotate(8.53deg) scaleX(2.022)}40%{transform:rotate(6.84deg) scaleX(2.518)}50%,60%{transform:rotate(5.71deg) scaleX(3.015)}70%{transform:rotate(6.84deg) scaleX(2.518)}80%{transform:rotate(8.53deg) scaleX(2.022)}90%{transform:rotate(11.31deg) scaleX(1.530)}100%{transform:rotate(15.26deg) scaleX(1.140)}}@keyframes graphics-frustum-s{0%,10%{transform:scaleY(1.000)}20%{transform:scaleY(0.733)}30%{transform:scaleY(0.550)}40%{transform:scaleY(0.440)}50%,60%{transform:scaleY(0.367)}70%{transform:scaleY(0.440)}80%{transform:scaleY(0.550)}90%{transform:scaleY(0.733)}100%{transform:scaleY(1.000)}}.graphics-frustum-o{animation:graphics-frustum-o 7s infinite}.graphics-frustum-u{transform-box:view-box;transform-origin:40px 200px;animation:graphics-frustum-u 7s infinite;transform:rotate(-15.26deg) scaleX(1.140)}.graphics-frustum-l{transform-box:view-box;transform-origin:40px 200px;animation:graphics-frustum-l 7s infinite;transform:rotate(15.26deg) scaleX(1.140)}.graphics-frustum-s{transform-box:view-box;transform-origin:525px 200px;animation:graphics-frustum-s 7s infinite}</style><path d=\"M40 200 L360 15.2 L360 384.8 Z\" fill=\"var(--fig-accent)\" fill-opacity=\"0.06\" stroke=\"var(--fig-accent)\" stroke-opacity=\"0.5\" stroke-width=\"1.5\"/><line x1=\"70\" y1=\"182.7\" x2=\"70\" y2=\"217.3\" stroke=\"var(--fig-accent)\" stroke-width=\"3\" stroke-linecap=\"round\"/><line x1=\"360\" y1=\"15.2\" x2=\"360\" y2=\"384.8\" stroke=\"var(--fig-accent)\" stroke-width=\"3\" stroke-linecap=\"round\"/><line x1=\"40\" y1=\"200\" x2=\"374\" y2=\"200\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"4 5\"/><text class=\"graphics-frustum-t graphics-frustum-mid\" x=\"70\" y=\"239.3\">near</text><text class=\"graphics-frustum-t\" x=\"370\" y=\"31.2\">far</text><path d=\"M86 173.4 A53 53 0 0 1 86 226.6\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"graphics-frustum-m\" x=\"14\" y=\"120\">60° vertical FOV</text><rect x=\"12\" y=\"189\" width=\"22\" height=\"22\" rx=\"5\" fill=\"var(--fig-ink)\"/><polygon points=\"33,194 40,200 33,206\" fill=\"var(--fig-ink)\"/><text class=\"graphics-frustum-m\" x=\"60\" y=\"384\">depth = distance along the view axis</text><line class=\"graphics-frustum-u\" x1=\"40\" y1=\"200\" x2=\"140\" y2=\"200\" stroke=\"var(--fig-accent2)\" stroke-opacity=\"0.6\" stroke-width=\"1.5\"/><line class=\"graphics-frustum-l\" x1=\"40\" y1=\"200\" x2=\"140\" y2=\"200\" stroke=\"var(--fig-accent2)\" stroke-opacity=\"0.6\" stroke-width=\"1.5\"/><g class=\"graphics-frustum-o\"><line x1=\"150\" y1=\"170\" x2=\"150\" y2=\"230\" stroke=\"var(--fig-accent2)\" stroke-width=\"7\" stroke-linecap=\"round\"/></g><text class=\"graphics-frustum-h\" x=\"450\" y=\"60\">On screen</text><rect x=\"470\" y=\"90\" width=\"110\" height=\"220\" rx=\"10\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-frustum-m graphics-frustum-e\" x=\"462\" y=\"102\">+1</text><text class=\"graphics-frustum-m graphics-frustum-e\" x=\"462\" y=\"204\">0</text><text class=\"graphics-frustum-m graphics-frustum-e\" x=\"462\" y=\"310\">−1</text><line x1=\"492\" y1=\"148.1\" x2=\"558\" y2=\"148.1\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 4\"/><line x1=\"492\" y1=\"251.9\" x2=\"558\" y2=\"251.9\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" stroke-dasharray=\"3 4\"/><rect class=\"graphics-frustum-s\" x=\"516\" y=\"148.1\" width=\"18\" height=\"103.9\" rx=\"6\" fill=\"var(--fig-accent2)\"/><text class=\"graphics-frustum-t graphics-frustum-c\" x=\"450\" y=\"346\">y_ndc = y_view / depth</text><text class=\"graphics-frustum-m\" x=\"450\" y=\"366\">x_ndc uses the same rule</text><text class=\"graphics-frustum-m\" x=\"450\" y=\"384\">2.7× the depth: 1/2.7 the height</text></svg>"
        },
        {
          "type": "p",
          "text": "Two consequences that surprise people. First, **perspective-correct interpolation**: attributes such as UVs cannot be interpolated linearly in screen space, or textures swim on slanted surfaces. The rasteriser interpolates `attribute / w` and `1 / w` linearly in screen space and divides per pixel. It is built in; you only notice it when it is disabled (some retro-styled effects deliberately turn it off for the PS1 look). Second, changing the vertical FOV on a wide screen changes the horizontal FOV through the aspect ratio, so ultrawide players may see far more or far less than intended depending on whether the engine fixes horizontal or vertical FOV."
        },
        {
          "type": "h",
          "text": "Orthographic projection"
        },
        {
          "type": "p",
          "text": "An orthographic camera defines a box instead of a frustum. The projection only rescales and shifts; `w` stays 1 and no divide changes anything, so parallel lines stay parallel and size does not depend on distance. It is the natural choice for 2D games, isometric strategy games, UI, and, in most engines, for directional-light shadow maps (the sun's rays are parallel). Orthographic depth is linear, which has a nice side effect: depth precision is uniform across the range, so z-fighting is far less of a problem than with perspective."
        },
        {
          "type": "h",
          "text": "The depth buffer"
        },
        {
          "type": "p",
          "text": "To draw opaque geometry in any order, the GPU keeps a **depth buffer** (z-buffer): one value per pixel recording the nearest surface so far. Each incoming fragment's depth is compared with the stored value; if it passes the test (usually 'less than' or, with reversed-Z, 'greater than'), the fragment is shaded and written, otherwise it is discarded, sometimes before the pixel shader even runs (early-Z). A 1080p depth buffer at 32 bits is about 8 MB; at 4K about 33 MB, which matters on bandwidth-limited mobile GPUs."
        },
        {
          "type": "p",
          "text": "The stored value is the NDC z, and for a perspective camera NDC z is a function of `1/depth`, not of depth. That makes precision highly nonlinear. With near = 0.1 and far = 1000, a conventional 24-bit fixed-point depth buffer spends roughly half its codes on the first 0.2 m or so. Back-of-the-envelope: the depth step in metres at distance z is about `z^2 / (near * 2^24)`. At 10 m that is about 6e-5 m, but at 500 m it is about 0.15 m: surfaces closer together than 15 cm swap places pixel by pixel, which you see as shimmering stripes called **z-fighting**."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Depth resolution (conventional Z, 24-bit, near=0.1, far=1000)\n  distance    smallest resolvable gap\n  10 m        ~0.00006 m\n  100 m       ~0.006 m\n  500 m       ~0.15 m\n  1000 m      ~0.6 m\n\nFix 1: raise near from 0.01 to 0.1: precision improves about 10x everywhere.\nFix 2: reversed-Z with a float32 depth buffer.\nFix 3: split the view into two cameras (near and far) rendered in layers."
        },
        {
          "type": "h",
          "text": "Reversed-Z"
        },
        {
          "type": "p",
          "text": "Floating-point numbers have more representable values near zero. Standard depth puts the near plane at 0 and far at 1, so the dense float region sits where the `1/z` mapping already gives plenty of precision, wasting float resolution. **Reversed-Z** swaps the mapping: near maps to 1 and far to 0, depth is cleared to 0, and the depth test becomes 'greater'. The two nonlinearities (hyperbolic `1/z` and float spacing) now roughly cancel, giving near-uniform precision across the whole range even with an infinite far plane. It needs a floating-point depth format; with a fixed-point 24-bit buffer reversal gives nothing. Modern Unity versions use reversed-Z on the platforms that support it (Direct3D, Metal, Vulkan, consoles), which is why shader code uses macros like `UNITY_REVERSED_Z` rather than assuming near is 0."
        },
        {
          "type": "figure",
          "id": "graphics-depth-precision",
          "caption": "With standard 24-bit depth the smallest resolvable gap grows with distance squared, reaching 0.15 m at 500 m; reversed-Z with a float32 buffer keeps it orders of magnitude smaller across the range.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 350\" role=\"img\" aria-label=\"Log-log plot of the smallest depth gap a depth buffer can resolve against distance. Standard 24-bit depth grows with distance squared, reaching 0.15 m at 500 m and 0.6 m at 1000 m; reversed-Z with float32 grows only linearly and stays far smaller.\"><style>.graphics-depth-precision-t{font-size:13px;fill:var(--fig-ink)}.graphics-depth-precision-m{font-size:12px;fill:var(--fig-muted)}.graphics-depth-precision-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-depth-precision-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-depth-precision-e{text-anchor:end}.graphics-depth-precision-mid{text-anchor:middle}@keyframes graphics-depth-precision-sc{0%,6%{transform:translate(0px,0px)}86%,100%{transform:translate(504px,0px)}}@keyframes graphics-depth-precision-a{0%,6%{transform:translate(0px,0px)}86%,100%{transform:translate(504px,-195px)}}@keyframes graphics-depth-precision-b{0%,6%{transform:translate(0px,0px)}86%,100%{transform:translate(504px,-97.5px)}}@keyframes graphics-depth-precision-f{0%,90%{opacity:1}96%,100%{opacity:0}}.graphics-depth-precision-sc{animation:graphics-depth-precision-sc 6s linear infinite,graphics-depth-precision-f 6s infinite}.graphics-depth-precision-a{animation:graphics-depth-precision-a 6s linear infinite,graphics-depth-precision-f 6s infinite}.graphics-depth-precision-b{animation:graphics-depth-precision-b 6s linear infinite,graphics-depth-precision-f 6s infinite}.graphics-depth-precision-sc,.graphics-depth-precision-a,.graphics-depth-precision-b{opacity:0}</style><line x1=\"96\" y1=\"36\" x2=\"600\" y2=\"36\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-e\" x=\"88\" y=\"40\">1 m</text><line x1=\"96\" y1=\"101\" x2=\"600\" y2=\"101\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-e\" x=\"88\" y=\"105\">1 cm</text><line x1=\"96\" y1=\"166\" x2=\"600\" y2=\"166\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-e\" x=\"88\" y=\"170\">0.1 mm</text><line x1=\"96\" y1=\"231\" x2=\"600\" y2=\"231\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-e\" x=\"88\" y=\"235\">1 µm</text><line x1=\"96\" y1=\"296\" x2=\"600\" y2=\"296\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-e\" x=\"88\" y=\"300\">10 nm</text><line x1=\"96\" y1=\"36\" x2=\"96\" y2=\"296\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-mid\" x=\"96\" y=\"314\">1 m</text><line x1=\"264\" y1=\"36\" x2=\"264\" y2=\"296\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-mid\" x=\"264\" y=\"314\">10 m</text><line x1=\"432\" y1=\"36\" x2=\"432\" y2=\"296\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-mid\" x=\"432\" y=\"314\">100 m</text><line x1=\"600\" y1=\"36\" x2=\"600\" y2=\"296\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-depth-precision-m graphics-depth-precision-mid\" x=\"600\" y=\"314\">1000 m</text><text class=\"graphics-depth-precision-m graphics-depth-precision-mid\" x=\"348\" y=\"336\">distance from camera (near = 0.1, far = 1000, log scale)</text><text class=\"graphics-depth-precision-m\" x=\"16\" y=\"20\">smallest resolvable gap (log scale)</text><line x1=\"96\" y1=\"238.3\" x2=\"600\" y2=\"43.3\" stroke=\"var(--fig-bad)\" stroke-width=\"2.5\"/><line x1=\"96\" y1=\"270.8\" x2=\"600\" y2=\"173.3\" stroke=\"var(--fig-ok)\" stroke-width=\"2.5\"/><circle cx=\"264\" cy=\"173.3\" r=\"4.5\" fill=\"var(--fig-bad)\"/><text class=\"graphics-depth-precision-t\" x=\"274\" y=\"193.3\">0.00006 m at 10 m</text><circle cx=\"432\" cy=\"108.3\" r=\"4.5\" fill=\"var(--fig-bad)\"/><text class=\"graphics-depth-precision-t\" x=\"422\" y=\"96.3\" style=\"text-anchor:end\">0.006 m at 100 m</text><circle cx=\"549.4\" cy=\"62.9\" r=\"4.5\" fill=\"var(--fig-bad)\"/><circle cx=\"600\" cy=\"43.3\" r=\"4.5\" fill=\"var(--fig-bad)\"/><text class=\"graphics-depth-precision-t\" x=\"600\" y=\"104\" style=\"text-anchor:end\">0.15 m at 500 m</text><text x=\"110\" y=\"62\" style=\"font-size:13px;font-weight:600;fill:var(--fig-bad)\">standard Z, 24-bit fixed</text><text class=\"graphics-depth-precision-m\" x=\"110\" y=\"80\">gap ≈ z² / (near · 2^24)</text><text x=\"344.2\" y=\"252.8\" style=\"font-size:13px;font-weight:600;fill:var(--fig-ok)\">reversed-Z, float32</text><text class=\"graphics-depth-precision-m\" x=\"344.2\" y=\"268.8\">gap grows only in step with z</text><line class=\"graphics-depth-precision-sc\" x1=\"96\" y1=\"36\" x2=\"96\" y2=\"296\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><circle class=\"graphics-depth-precision-a\" cx=\"96\" cy=\"238.3\" r=\"6\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-bad)\" stroke-width=\"2.5\"/><circle class=\"graphics-depth-precision-b\" cx=\"96\" cy=\"270.8\" r=\"6\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ok)\" stroke-width=\"2.5\"/></svg>"
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "The cheapest depth-precision win is always the near plane. Many projects leave near at 0.01 for a camera that never gets within 0.3 m of anything. Moving to 0.1 or 0.3 improves precision about 10 to 30 times across the range, with no cost. Reserve extreme near values for close-up first-person weapons, which are often drawn with a separate camera."
        },
        {
          "type": "h",
          "text": "Worked example: world to screen"
        },
        {
          "type": "p",
          "text": "To place a health bar above an enemy, take the world position, multiply by the view-projection matrix to get clip `(x, y, z, w)`; if `w <= 0` the point is behind the camera, so hide it. Otherwise `ndc = clip.xy / clip.w`, and `screen = (ndc * 0.5 + 0.5) * (width, height)`, flipping y if your UI origin is at the top. Every engine provides a helper for this (such as `Camera.WorldToScreenPoint` in Unity), but knowing the steps explains the classic bug: forgetting the behind-the-camera check draws labels mirrored on screen for enemies at your back, because dividing by a negative `w` flips the point through the origin."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "When asking an agent for camera or projection code, state the target graphics API conventions: clip z range, reversed-Z on or off, y-flip for render textures, left or right handed. Agents often produce an OpenGL-style projection matrix and a 'less' depth test, which silently breaks a reversed-Z pipeline (everything fails the depth test and the screen is empty). Ask for a unit test that projects a known near and far point and asserts NDC z values (0 and 1, or 1 and 0), and review whether the code checks `w > 0` before dividing."
        },
        {
          "type": "h",
          "text": "Pitfalls checklist"
        },
        {
          "type": "list",
          "items": [
            "Near plane set to 0.001 'to be safe' with a 24-bit fixed depth buffer: precision is roughly proportional to near, so distant surfaces z-fight. The far plane matters much less.",
            "Normals or lighting vectors computed in view space against world-space light directions: always keep both operands in one space.",
            "Using `w` after the divide: after the divide it is 1; keep the original if you need depth.",
            "Assuming screen y goes up. Render-texture sampling and UI toolkits differ by API."
          ]
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Lighting changes when the object rotates, and the shader mixes an object-space normal with a world-space light direction",
              "use": "Do lighting in one consistent space",
              "why": "Transform every vector (normal, light, view) into the same space, usually world or view, before any dot product. Mixed spaces give plausible but wrong results that are hard to spot."
            },
            {
              "signal": "Distant surfaces flicker in stripes (z-fighting) and the camera near plane is set to something like 0.01",
              "use": "Push the near plane out",
              "why": "Depth precision depends mostly on the near/far ratio, so raising near from 0.01 to 0.3 is the cheapest, biggest win. Too far out and nearby geometry clips through the camera."
            },
            {
              "signal": "A huge view distance still z-fights after tuning near and far planes",
              "use": "Reversed-Z with a float depth buffer",
              "why": "Mapping far to 0 and near to 1 cancels float and 1/z nonlinearity, giving near-uniform precision. Every hand-written depth compare, clear value and depth read must use the reversed convention."
            },
            {
              "signal": "A projected world-space label or marker shows up mirrored on screen when its target is behind the camera",
              "use": "Reject points with w <= 0 before dividing",
              "why": "A point behind the camera has negative clip w, and the divide mirrors it onto the screen. Check w first, then hide the marker or clamp it to the screen edge."
            },
            {
              "signal": "A directional light shadow map, a 2D game or a top-down strategy view needs parallel lines and uniform scale",
              "use": "Orthographic projection",
              "why": "Ortho keeps w at 1, so size does not change with distance and depth is linear. It gives no depth cue, so it is wrong for first-person views."
            },
            {
              "signal": "A fog or soft-particle effect reads the depth texture and treats the raw value as distance in metres",
              "use": "Linearise depth with near and far",
              "why": "Stored depth is a nonlinear function of 1/z and may be reversed. Convert it to linear eye depth first using the engine's helper, or effects bunch up near the camera."
            },
            {
              "signal": "A screen-space effect needs the world position of each pixel but there is no position buffer",
              "use": "Reconstruct position from depth",
              "why": "Combine pixel UV and depth into NDC, then multiply by the inverse view-projection and divide by w. Saves a G-buffer target at the cost of a matrix multiply per pixel."
            },
            {
              "signal": "A click or tap on the screen must select the 3D object under the cursor",
              "use": "Unproject a ray from the camera",
              "why": "Map the pixel to NDC at near and far depth, transform both by the inverse view-projection, and raycast between them. Avoids per-object screen-space tests."
            }
          ]
        }
      ],
      "keyPoints": [
        "Vertices travel object, world, view, clip, NDC, screen; the vertex shader outputs clip space and the GPU does the perspective divide.",
        "Perspective projection puts view-space depth in w, so dividing by w shrinks distant objects; orthographic keeps w at 1 and preserves parallel lines.",
        "Depth is stored nonlinearly (a function of 1/z), so conventional depth buffers have far worse precision in the distance; z-fighting is the symptom.",
        "Reversed-Z with a float depth buffer cancels the nonlinearity and gives near-uniform precision; moving the near plane outward is the cheapest fix.",
        "Always check w > 0 before projecting a point to the screen, otherwise objects behind the camera appear mirrored."
      ],
      "quiz": [
        {
          "q": "A vertex shader outputs a clip-space position. Who performs the perspective divide by w?",
          "options": [
            "The vertex shader, which must divide before writing its output",
            "The fragment shader, once per pixel during shading",
            "The GPU's fixed-function stage after the vertex stage, before rasterization",
            "The CPU, when it uploads the view-projection matrix"
          ],
          "answer": 2,
          "explain": "The hardware clips against the clip volume and then divides xyz by w automatically, which is why the shader outputs 4D clip coordinates. If the shader divided itself, the hardware would divide again and shrink everything twice."
        },
        {
          "q": "Far terrain at 600 m flickers in alternating stripes where two road meshes sit 0.5 m apart vertically. The camera uses near 0.01, far 2000, conventional Z, 24-bit depth. What is the most effective first fix?",
          "options": [
            "Raise the near plane to 0.1, since precision scales with near",
            "Halve the far plane to 1000 and keep near unchanged",
            "Widen the camera's vertical field of view",
            "Disable the perspective divide for distant geometry"
          ],
          "answer": 0,
          "explain": "Depth resolution at distance z is roughly z squared divided by near times the depth range, so a 10x larger near gives about 10x finer resolution. Halving the far plane changes precision very little, because far barely appears in that estimate."
        },
        {
          "q": "After switching to reversed-Z, a custom effect that gets depth from the depth texture shows inverted results, and objects fail the depth test in a hand-written pass. What should you check?",
          "options": [
            "Whether the depth texture is stored as an 8-bit format",
            "Whether the view matrix is stored column-major or not",
            "Whether the camera near plane exceeds its far plane",
            "Whether depth compare and linearize code assume near is 0"
          ],
          "answer": 3,
          "explain": "Reversed-Z flips the mapping, so a 'less' test and non-reversed linearization formulas break; engines expose macros for this. The near plane is still smaller than far in the camera settings, only the stored depth is reversed."
        },
        {
          "q": "A world-space label follows an enemy using manual projection, but when the enemy is directly behind the player a mirrored label appears in front of the screen. Which step is missing?",
          "options": [
            "Clamping the NDC values into the range zero to one",
            "Rejecting points whose clip-space w is zero or negative",
            "Multiplying by the inverse of the projection matrix",
            "Converting the position to object space first"
          ],
          "answer": 1,
          "explain": "Points behind the camera have negative w, and dividing by it flips the projected point through the screen centre, producing the mirror. Clamping would hide the symptom, not distinguish front from back."
        },
        {
          "q": "Why does an orthographic camera give shadow maps for a directional light more uniform depth precision than a perspective camera of the same range?",
          "options": [
            "Orthographic depth is stored in a smaller number of bits",
            "Orthographic projection stores w as view depth and divides it out",
            "Orthographic depth is a linear function of distance, not 1 over distance",
            "Orthographic cameras ignore the near plane entirely"
          ],
          "answer": 2,
          "explain": "Without the perspective divide, depth maps linearly across the near-to-far range so every distance gets equal resolution. Perspective depth depends on 1/z and concentrates precision close to the camera."
        },
        {
          "q": "A strategy game must let the player click the terrain or a unit under the mouse. Objects are 3D with perspective, and the cursor is a 2D pixel position. Which approach fits best?",
          "options": [
            "Unproject the cursor into a world ray and intersect it",
            "Multiply the cursor position by each object's model matrix",
            "Compare the cursor to each object's projected centre point only",
            "Render the scene to a depth buffer and read the raw depth"
          ],
          "answer": 0,
          "explain": "Turning the pixel into a ray from the camera and intersecting it with colliders gives exact 3D hits. Reading raw depth alone gives no object identity and is nonlinear, and a model matrix maps local to world, not screen to world."
        }
      ]
    },
    {
      "id": "graphics-meshes-geometry",
      "title": "Meshes and Geometry",
      "minutes": 14,
      "summary": "What a mesh is on the GPU: vertex attributes and layout, index buffers and the vertex cache, why vertices split, winding and culling, normals and tangent space, budgets and dynamic geometry.",
      "lesson": [
        {
          "type": "p",
          "text": "An artist hands over a character that is 12,000 vertices in Blender. The Unity Stats window says the same character costs 19,400 vertices per draw, the shadow passes draw it again, and the normal-mapped face shows a hairline seam down the middle. None of this is a bug. A mesh in a modelling tool is a surface; a mesh on the GPU is a set of buffers with a specific layout, and the two differ in ways that decide memory use, vertex shader cost and shading correctness. This topic covers what those buffers contain, why vertices multiply on import, how triangle order and winding affect speed and visibility, what normals and tangents really are, and what it costs to change a mesh at runtime."
        },
        {
          "type": "h",
          "text": "What the GPU receives"
        },
        {
          "type": "p",
          "text": "To the GPU a mesh is a **vertex buffer** (an array of vertices), usually an **index buffer** (an array of integers that pick vertices to form triangles) and a **topology** that says how to read the indices, almost always as a triangle list. A **vertex** is not just a position. It is a bundle of attributes that the vertex shader reads and the rasteriser interpolates across the triangle. The pipeline topic covers what happens after this data is fetched; this one is about the data itself."
        },
        {
          "type": "list",
          "items": [
            "**Position**: usually 3 floats in object space. The only attribute every mesh has.",
            "**Normal**: the unit vector the surface faces, used by lighting. Per vertex, not per triangle.",
            "**Tangent**: a unit vector along the texture's U direction, plus a sign in `w` that selects the bitangent's direction. It completes the basis that normal maps are expressed in.",
            "**UV0, UV1**: 2D texture coordinates. UV0 is typically the albedo and normal map layout; UV1 often holds a separate non-overlapping layout for lightmaps.",
            "**Colour**: per-vertex tint, commonly 4 bytes, used for baked occlusion, wind masks and blending weights.",
            "**Bone indices and weights**: for skinning, typically 4 bone indices and 4 weights per vertex.",
            "**Custom data**: extra UV channels or colours reused to carry anything a shader needs, such as a pivot or an animation phase."
          ]
        },
        {
          "type": "p",
          "text": "In Unity the high-level `Mesh` API exposes these as arrays. The example builds a quad: 4 vertices, 2 triangles, with all attributes set. Unity treats triangles whose indices run clockwise as front-facing, which matters for the winding section later."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "var mesh = new Mesh { name = \"Quad\" };\n\n// Vertices first: the triangle indices below must refer to existing vertices.\nmesh.vertices = new[] {\n    new Vector3(0, 0, 0), new Vector3(1, 0, 0),\n    new Vector3(0, 1, 0), new Vector3(1, 1, 0),\n};\nmesh.normals = new[] { Vector3.back, Vector3.back, Vector3.back, Vector3.back };\nmesh.uv = new[] {\n    new Vector2(0, 0), new Vector2(1, 0),\n    new Vector2(0, 1), new Vector2(1, 1),\n};\n\n// Two triangles, clockwise when seen from the camera side (-Z).\nmesh.triangles = new[] { 0, 2, 1,   2, 3, 1 };\n\nmesh.RecalculateBounds();   // bounds are used for culling; set them after the data"
        },
        {
          "type": "h",
          "text": "Layout, stride and precision"
        },
        {
          "type": "p",
          "text": "The attributes are packed into a **vertex layout**. The distance in bytes from one vertex to the next is the **stride**, and the buffer size is stride times vertex count. **Interleaved** layout stores all attributes of vertex 0, then of vertex 1, and so on in one stream; it is friendly to passes that read everything. **Separate streams** store each attribute (or group) in its own array, so a depth-only or shadow pass can read just the position stream and skip the rest. Unity's lower-level mesh API lets you choose the format, dimension and stream of every attribute, and most engines default to a convenient but generous layout."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Typical layout                    Compact layout\n  Position  float32 x3   12 B       Position  float32 x3   12 B\n  Normal    float32 x3   12 B       Normal    snorm8  x4    4 B\n  Tangent   float32 x4   16 B       Tangent   snorm8  x4    4 B\n  UV0       float32 x2    8 B       UV0       unorm16 x2    4 B\n  stride                 48 B       stride                 24 B\n\n50,000 vertices:  2.4 MB          1.2 MB\nA mesh drawn in the main pass and 3 shadow cascades reads its\nvertex buffer 4 times: 9.6 MB vs 4.8 MB of reads per frame."
        },
        {
          "type": "p",
          "text": "Precision is the lever. Unit-length normals and tangents lose almost nothing in 8-bit signed normalized values. UVs in the 0 to 1 range fit 16-bit unsigned normalized values with 1/65535 steps, which is finer than a texel of any realistic texture. Positions are the exception: float16 has only about 3 decimal digits, so a vertex 100 m from the mesh origin lands on a grid of roughly 6 cm. Engines that compress positions store 16-bit integers relative to the mesh bounds instead, which keeps a uniform step of bounds size divided by 65,535."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Half-float UVs are a common trap. float16 spacing grows with magnitude, so UVs near 1.0 snap in steps of about 0.0005, which is a full texel of a 2,048 texture, and tiled UVs up to 8 or atlas coordinates get worse. Use unorm16 for 0 to 1 data and test on the largest texture the mesh uses."
        },
        {
          "type": "h",
          "text": "Indexing and the vertex cache"
        },
        {
          "type": "p",
          "text": "Without indices every triangle would carry its own 3 vertices, so a closed surface where each vertex touches about 6 triangles would store each vertex 6 times. Indexing stores each distinct vertex once and lets triangles refer to it by number. For 100,000 triangles at a 32-byte stride, the non-indexed version is 300,000 vertices, 9.6 MB. An indexed smooth mesh has roughly half as many vertices as triangles, so about 50,000 vertices (1.6 MB) plus 300,000 indices at 2 bytes (0.6 MB), 2.2 MB in total. The shared vertices also get shaded once instead of six times, which is the bigger win."
        },
        {
          "type": "p",
          "text": "Index width is a trade-off. **16-bit indices** address vertices 0 to 65,535 and cost 2 bytes each, so they cap a mesh at about 65,000 vertices. **32-bit indices** remove the cap and cost 4 bytes each. Unity defaults to 16-bit and takes `mesh.indexFormat = IndexFormat.UInt32` (in `UnityEngine.Rendering`) for bigger meshes, and the model importer has an index format setting too. Set the format before assigning the triangles, because the same array of ints is interpreted according to it."
        },
        {
          "type": "p",
          "text": "Sharing only saves shader work if the GPU remembers a vertex it already shaded. Hardware keeps a small **post-transform vertex cache** keyed by index: when a triangle references an index that was recently shaded, the cached output is reused and the vertex shader does not run. Classic models use a FIFO of roughly 16 to 32 entries; newer GPUs batch work differently, but index locality still pays off. The standard metric is **ACMR**, the average cache miss ratio: vertex shader invocations divided by triangle count. A well-ordered smooth mesh approaches 0.5 and a well-optimised one lands around 0.6 to 0.8, while a random order drifts toward the worst case of 3.0, one miss for every index."
        },
        {
          "type": "figure",
          "id": "graphics-vertex-cache",
          "caption": "The mesh and its vertices are identical; only the order of the triangles differs. Sorted, the 5-slot cache reaches the floor of 9 shader runs for 8 triangles; scattered, it needs 14.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"The same 3 by 3 vertex grid drawn twice, eight triangles each. With triangles sorted along the grid the 5-slot FIFO vertex cache gives 9 vertex shader runs, ACMR 1.13. With a scattered order it gives 14 runs, ACMR 1.75.\"><style>.graphics-vertex-cache-t{font-size:13px;fill:var(--fig-ink)}.graphics-vertex-cache-m{font-size:12px;fill:var(--fig-muted)}.graphics-vertex-cache-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-vertex-cache-mid{text-anchor:middle}.graphics-vertex-cache-e{text-anchor:end}.graphics-vertex-cache-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-vertex-cache-v{fill:var(--fig-panel);stroke:var(--fig-muted);stroke-width:1.5}.graphics-vertex-cache-n{font-size:12px;fill:var(--fig-muted);text-anchor:middle}.graphics-vertex-cache-sl{fill:none;stroke:var(--fig-line);stroke-width:1.5}.graphics-vertex-cache-hit,.graphics-vertex-cache-a{fill:var(--fig-ok)}.graphics-vertex-cache-miss,.graphics-vertex-cache-b{fill:var(--fig-bad)}.graphics-vertex-cache-g{opacity:0}.graphics-vertex-cache-g0{opacity:1}.graphics-vertex-cache-g polygon{fill:var(--fig-accent);fill-opacity:.22;stroke:var(--fig-accent);stroke-width:2;stroke-linejoin:round}.graphics-vertex-cache-g text{font:13px ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink);text-anchor:middle}.graphics-vertex-cache-g text:last-child{font:13px system-ui,sans-serif;text-anchor:start}.graphics-vertex-cache-g0{animation:graphics-vertex-cache-k0 8s infinite}.graphics-vertex-cache-g1{animation:graphics-vertex-cache-k1 8s infinite}.graphics-vertex-cache-g2{animation:graphics-vertex-cache-k2 8s infinite}.graphics-vertex-cache-g3{animation:graphics-vertex-cache-k3 8s infinite}.graphics-vertex-cache-g4{animation:graphics-vertex-cache-k4 8s infinite}.graphics-vertex-cache-g5{animation:graphics-vertex-cache-k5 8s infinite}.graphics-vertex-cache-g6{animation:graphics-vertex-cache-k6 8s infinite}.graphics-vertex-cache-g7{animation:graphics-vertex-cache-k7 8s infinite}@keyframes graphics-vertex-cache-k0{0%,9.99%{opacity:1}10%,100%{opacity:0}}@keyframes graphics-vertex-cache-k1{0%,9.99%{opacity:0}10%,19.99%{opacity:1}20%,100%{opacity:0}}@keyframes graphics-vertex-cache-k2{0%,19.99%{opacity:0}20%,29.99%{opacity:1}30%,100%{opacity:0}}@keyframes graphics-vertex-cache-k3{0%,29.99%{opacity:0}30%,39.99%{opacity:1}40%,100%{opacity:0}}@keyframes graphics-vertex-cache-k4{0%,39.99%{opacity:0}40%,49.99%{opacity:1}50%,100%{opacity:0}}@keyframes graphics-vertex-cache-k5{0%,49.99%{opacity:0}50%,59.99%{opacity:1}60%,100%{opacity:0}}@keyframes graphics-vertex-cache-k6{0%,59.99%{opacity:0}60%,69.99%{opacity:1}70%,100%{opacity:0}}@keyframes graphics-vertex-cache-k7{0%,69.99%{opacity:0}70%,100%{opacity:1}}</style><rect x=\"20\" y=\"30\" width=\"290\" height=\"226\" rx=\"14\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-vertex-cache-h\" x=\"36\" y=\"58\">Sorted for the cache</text><path d=\"M54 108L98 108M54 108L54 152M98 108L54 152M98 108L142 108M98 108L98 152M142 108L98 152M142 108L142 152M54 152L98 152M54 152L54 196M98 152L54 196M98 152L142 152M98 152L98 196M142 152L98 196M142 152L142 196M54 196L98 196M98 196L142 196\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" fill=\"none\"/><circle class=\"graphics-vertex-cache-v\" cx=\"54\" cy=\"108\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"54\" y=\"112\">0</text><circle class=\"graphics-vertex-cache-v\" cx=\"98\" cy=\"108\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"98\" y=\"112\">1</text><circle class=\"graphics-vertex-cache-v\" cx=\"142\" cy=\"108\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"142\" y=\"112\">2</text><circle class=\"graphics-vertex-cache-v\" cx=\"54\" cy=\"152\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"54\" y=\"156\">3</text><circle class=\"graphics-vertex-cache-v\" cx=\"98\" cy=\"152\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"98\" y=\"156\">4</text><circle class=\"graphics-vertex-cache-v\" cx=\"142\" cy=\"152\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"142\" y=\"156\">5</text><circle class=\"graphics-vertex-cache-v\" cx=\"54\" cy=\"196\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"54\" y=\"200\">6</text><circle class=\"graphics-vertex-cache-v\" cx=\"98\" cy=\"196\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"98\" y=\"200\">7</text><circle class=\"graphics-vertex-cache-v\" cx=\"142\" cy=\"196\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"142\" y=\"200\">8</text><text class=\"graphics-vertex-cache-m\" x=\"170\" y=\"90\">fetch order</text><text class=\"graphics-vertex-cache-m\" x=\"170\" y=\"134\">FIFO cache, 5 slots</text><rect class=\"graphics-vertex-cache-sl\" x=\"170\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><rect class=\"graphics-vertex-cache-sl\" x=\"196\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><rect class=\"graphics-vertex-cache-sl\" x=\"222\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><rect class=\"graphics-vertex-cache-sl\" x=\"248\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><rect class=\"graphics-vertex-cache-sl\" x=\"274\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g0\"><polygon points=\"54,108 54,152 98,108\"/><text x=\"181 207 233\" y=\"112\"><tspan class=\"graphics-vertex-cache-b\">0</tspan><tspan class=\"graphics-vertex-cache-b\">3</tspan><tspan class=\"graphics-vertex-cache-b\">1</tspan></text><text x=\"181 207 233 259 285\" y=\"163\">031</text><text x=\"36\" y=\"230\">3 shaded / 1 tri: ACMR 3.00</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g1\"><polygon points=\"98,108 54,152 98,152\"/><text x=\"181 207 233\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">1</tspan><tspan class=\"graphics-vertex-cache-a\">3</tspan><tspan class=\"graphics-vertex-cache-b\">4</tspan></text><text x=\"181 207 233 259 285\" y=\"163\">0314</text><text x=\"36\" y=\"230\">4 shaded / 2 tri: ACMR 2.00</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g2\"><polygon points=\"98,108 98,152 142,108\"/><text x=\"181 207 233\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">1</tspan><tspan class=\"graphics-vertex-cache-a\">4</tspan><tspan class=\"graphics-vertex-cache-b\">2</tspan></text><text x=\"181 207 233 259 285\" y=\"163\">03142</text><text x=\"36\" y=\"230\">5 shaded / 3 tri: ACMR 1.67</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g3\"><polygon points=\"142,108 98,152 142,152\"/><text x=\"181 207 233\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">2</tspan><tspan class=\"graphics-vertex-cache-a\">4</tspan><tspan class=\"graphics-vertex-cache-b\">5</tspan></text><text x=\"181 207 233 259 285\" y=\"163\">31425</text><text x=\"36\" y=\"230\">6 shaded / 4 tri: ACMR 1.50</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g4\"><polygon points=\"54,152 54,196 98,152\"/><text x=\"181 207 233\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">3</tspan><tspan class=\"graphics-vertex-cache-b\">6</tspan><tspan class=\"graphics-vertex-cache-a\">4</tspan></text><text x=\"181 207 233 259 285\" y=\"163\">14256</text><text x=\"36\" y=\"230\">7 shaded / 5 tri: ACMR 1.40</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g5\"><polygon points=\"98,152 54,196 98,196\"/><text x=\"181 207 233\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">4</tspan><tspan class=\"graphics-vertex-cache-a\">6</tspan><tspan class=\"graphics-vertex-cache-b\">7</tspan></text><text x=\"181 207 233 259 285\" y=\"163\">42567</text><text x=\"36\" y=\"230\">8 shaded / 6 tri: ACMR 1.33</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g6\"><polygon points=\"98,152 98,196 142,152\"/><text x=\"181 207 233\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">4</tspan><tspan class=\"graphics-vertex-cache-a\">7</tspan><tspan class=\"graphics-vertex-cache-a\">5</tspan></text><text x=\"181 207 233 259 285\" y=\"163\">42567</text><text x=\"36\" y=\"230\">8 shaded / 7 tri: ACMR 1.14</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g7\"><polygon points=\"142,152 98,196 142,196\"/><text x=\"181 207 233\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">5</tspan><tspan class=\"graphics-vertex-cache-a\">7</tspan><tspan class=\"graphics-vertex-cache-b\">8</tspan></text><text x=\"181 207 233 259 285\" y=\"163\">25678</text><text x=\"36\" y=\"230\">9 shaded / 8 tri: ACMR 1.13</text></g><rect x=\"330\" y=\"30\" width=\"290\" height=\"226\" rx=\"14\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-vertex-cache-h\" x=\"346\" y=\"58\">Scattered order</text><path d=\"M364 108L408 108M364 108L364 152M408 108L364 152M408 108L452 108M408 108L408 152M452 108L408 152M452 108L452 152M364 152L408 152M364 152L364 196M408 152L364 196M408 152L452 152M408 152L408 196M452 152L408 196M452 152L452 196M364 196L408 196M408 196L452 196\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\" fill=\"none\"/><circle class=\"graphics-vertex-cache-v\" cx=\"364\" cy=\"108\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"364\" y=\"112\">0</text><circle class=\"graphics-vertex-cache-v\" cx=\"408\" cy=\"108\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"408\" y=\"112\">1</text><circle class=\"graphics-vertex-cache-v\" cx=\"452\" cy=\"108\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"452\" y=\"112\">2</text><circle class=\"graphics-vertex-cache-v\" cx=\"364\" cy=\"152\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"364\" y=\"156\">3</text><circle class=\"graphics-vertex-cache-v\" cx=\"408\" cy=\"152\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"408\" y=\"156\">4</text><circle class=\"graphics-vertex-cache-v\" cx=\"452\" cy=\"152\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"452\" y=\"156\">5</text><circle class=\"graphics-vertex-cache-v\" cx=\"364\" cy=\"196\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"364\" y=\"200\">6</text><circle class=\"graphics-vertex-cache-v\" cx=\"408\" cy=\"196\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"408\" y=\"200\">7</text><circle class=\"graphics-vertex-cache-v\" cx=\"452\" cy=\"196\" r=\"11\"/><text class=\"graphics-vertex-cache-n\" x=\"452\" y=\"200\">8</text><text class=\"graphics-vertex-cache-m\" x=\"480\" y=\"90\">fetch order</text><text class=\"graphics-vertex-cache-m\" x=\"480\" y=\"134\">FIFO cache, 5 slots</text><rect class=\"graphics-vertex-cache-sl\" x=\"480\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><rect class=\"graphics-vertex-cache-sl\" x=\"506\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><rect class=\"graphics-vertex-cache-sl\" x=\"532\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><rect class=\"graphics-vertex-cache-sl\" x=\"558\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><rect class=\"graphics-vertex-cache-sl\" x=\"584\" y=\"144\" width=\"22\" height=\"28\" rx=\"6\"/><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g0\"><polygon points=\"364,108 364,152 408,108\"/><text x=\"491 517 543\" y=\"112\"><tspan class=\"graphics-vertex-cache-b\">0</tspan><tspan class=\"graphics-vertex-cache-b\">3</tspan><tspan class=\"graphics-vertex-cache-b\">1</tspan></text><text x=\"491 517 543 569 595\" y=\"163\">031</text><text x=\"346\" y=\"230\">3 shaded / 1 tri: ACMR 3.00</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g1\"><polygon points=\"452,152 408,196 452,196\"/><text x=\"491 517 543\" y=\"112\"><tspan class=\"graphics-vertex-cache-b\">5</tspan><tspan class=\"graphics-vertex-cache-b\">7</tspan><tspan class=\"graphics-vertex-cache-b\">8</tspan></text><text x=\"491 517 543 569 595\" y=\"163\">31578</text><text x=\"346\" y=\"230\">6 shaded / 2 tri: ACMR 3.00</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g2\"><polygon points=\"408,108 408,152 452,108\"/><text x=\"491 517 543\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">1</tspan><tspan class=\"graphics-vertex-cache-b\">4</tspan><tspan class=\"graphics-vertex-cache-b\">2</tspan></text><text x=\"491 517 543 569 595\" y=\"163\">57842</text><text x=\"346\" y=\"230\">8 shaded / 3 tri: ACMR 2.67</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g3\"><polygon points=\"408,152 364,196 408,196\"/><text x=\"491 517 543\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">4</tspan><tspan class=\"graphics-vertex-cache-b\">6</tspan><tspan class=\"graphics-vertex-cache-a\">7</tspan></text><text x=\"491 517 543 569 595\" y=\"163\">78426</text><text x=\"346\" y=\"230\">9 shaded / 4 tri: ACMR 2.25</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g4\"><polygon points=\"408,108 364,152 408,152\"/><text x=\"491 517 543\" y=\"112\"><tspan class=\"graphics-vertex-cache-b\">1</tspan><tspan class=\"graphics-vertex-cache-b\">3</tspan><tspan class=\"graphics-vertex-cache-a\">4</tspan></text><text x=\"491 517 543 569 595\" y=\"163\">42613</text><text x=\"346\" y=\"230\">11 shaded / 5 tri: ACMR 2.20</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g5\"><polygon points=\"452,108 408,152 452,152\"/><text x=\"491 517 543\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">2</tspan><tspan class=\"graphics-vertex-cache-a\">4</tspan><tspan class=\"graphics-vertex-cache-b\">5</tspan></text><text x=\"491 517 543 569 595\" y=\"163\">26135</text><text x=\"346\" y=\"230\">12 shaded / 6 tri: ACMR 2.00</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g6\"><polygon points=\"364,152 364,196 408,152\"/><text x=\"491 517 543\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">3</tspan><tspan class=\"graphics-vertex-cache-a\">6</tspan><tspan class=\"graphics-vertex-cache-b\">4</tspan></text><text x=\"491 517 543 569 595\" y=\"163\">61354</text><text x=\"346\" y=\"230\">13 shaded / 7 tri: ACMR 1.86</text></g><g class=\"graphics-vertex-cache-g graphics-vertex-cache-g7\"><polygon points=\"408,152 408,196 452,152\"/><text x=\"491 517 543\" y=\"112\"><tspan class=\"graphics-vertex-cache-a\">4</tspan><tspan class=\"graphics-vertex-cache-b\">7</tspan><tspan class=\"graphics-vertex-cache-a\">5</tspan></text><text x=\"491 517 543 569 595\" y=\"163\">13547</text><text x=\"346\" y=\"230\">14 shaded / 8 tri: ACMR 1.75</text></g><text class=\"graphics-vertex-cache-m graphics-vertex-cache-mid\" x=\"320\" y=\"292\"><tspan class=\"graphics-vertex-cache-hit\">green</tspan> = cache hit, free. <tspan class=\"graphics-vertex-cache-miss\">red</tspan> = miss, the vertex shader runs. The floor here is 9 / 8 = 1.13.</text></svg>"
        },
        {
          "type": "p",
          "text": "Ordering is free to fix because it only permutes the index buffer. Libraries such as **meshoptimizer** provide `meshopt_optimizeVertexCache` to reorder triangles for the cache, `meshopt_optimizeOverdraw` to draw groups of triangles roughly front to back so the depth test rejects more pixels early, and `meshopt_optimizeVertexFetch` to renumber vertices in first-use order so memory reads are sequential. Run them in that order, offline in the import pipeline, because the overdraw pass trades a little cache efficiency for fewer shaded pixels. Many engine importers expose a mesh optimisation toggle that does a version of the same work."
        },
        {
          "type": "h",
          "text": "Why vertex counts grow on import"
        },
        {
          "type": "p",
          "text": "A GPU vertex is the **unique combination of all its attributes**. Two vertices at the same position are different vertices if their normals, UVs, tangents or colours differ, because one slot in the buffer can hold only one value of each. Modelling tools show you positions; the GPU needs every attribute combination stored separately. A cube has 8 positions, but with flat shading each corner needs a different normal for each of its three faces, so the corner is stored three times: 8 x 3 = 24 vertices. A UV seam does the same thing from the texture side: where an island of the unwrap ends, the 3D point sits at two different UV locations and must exist twice."
        },
        {
          "type": "figure",
          "id": "graphics-vertex-split",
          "caption": "The same 8 cube corners cost 8, 14 or 24 vertices depending on the attributes. Dashed lines are UV seams; dot colour shows which face (by axis) each copy belongs to.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 350\" role=\"img\" aria-label=\"A cube drawn with 8 corner positions. First 8 vertices, then 14 once UV seams split the back corners, then 24 once flat normals give every corner one copy per face.\"><style>.graphics-vertex-split-t{font-size:13px;fill:var(--fig-ink)}.graphics-vertex-split-m{font-size:12px;fill:var(--fig-muted)}.graphics-vertex-split-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-vertex-split-mid{text-anchor:middle}.graphics-vertex-split-e{text-anchor:end}.graphics-vertex-split-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-vertex-split-big{font-size:22px;font-weight:700;fill:var(--fig-ink)}.graphics-vertex-split-p1,.graphics-vertex-split-p2,.graphics-vertex-split-p3{opacity:0}.graphics-vertex-split-on{opacity:1}.graphics-vertex-split-p1{animation:graphics-vertex-split-k1 9s infinite}.graphics-vertex-split-p2{animation:graphics-vertex-split-k2 9s infinite}.graphics-vertex-split-p3{animation:graphics-vertex-split-k3 9s infinite}@keyframes graphics-vertex-split-k1{0%,29%{opacity:1}32%,96%{opacity:0}100%{opacity:1}}@keyframes graphics-vertex-split-k2{0%,29%{opacity:0}32%,62%{opacity:1}65%,100%{opacity:0}}@keyframes graphics-vertex-split-k3{0%,62%{opacity:0}65%,95%{opacity:1}98%,100%{opacity:0}}</style><text class=\"graphics-vertex-split-h\" x=\"20\" y=\"30\">One cube, three vertex counts</text><g transform=\"translate(205 215) scale(1.3) translate(-205 -215)\"><polygon points=\"130,180 230,180 230,280 130,280\" fill=\"var(--fig-panel)\"/><polygon points=\"130,180 230,180 280,135 180,135\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.14\"/><polygon points=\"230,180 280,135 280,235 230,280\" fill=\"var(--fig-warn)\" fill-opacity=\"0.14\"/><line x1=\"180\" y1=\"135\" x2=\"180\" y2=\"235\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><line x1=\"180\" y1=\"235\" x2=\"130\" y2=\"280\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><line x1=\"180\" y1=\"235\" x2=\"280\" y2=\"235\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><line x1=\"130\" y1=\"180\" x2=\"230\" y2=\"180\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"230\" y1=\"180\" x2=\"230\" y2=\"280\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"230\" y1=\"280\" x2=\"130\" y2=\"280\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"130\" y1=\"280\" x2=\"130\" y2=\"180\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"130\" y1=\"180\" x2=\"180\" y2=\"135\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"230\" y1=\"180\" x2=\"280\" y2=\"135\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"230\" y1=\"280\" x2=\"280\" y2=\"235\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"180\" y1=\"135\" x2=\"280\" y2=\"135\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"280\" y1=\"135\" x2=\"280\" y2=\"235\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><g class=\"graphics-vertex-split-p2\"><line x1=\"130\" y1=\"180\" x2=\"180\" y2=\"135\" stroke=\"var(--fig-warn)\" stroke-width=\"3.5\" stroke-dasharray=\"7 5\" stroke-linecap=\"round\"/><line x1=\"230\" y1=\"180\" x2=\"280\" y2=\"135\" stroke=\"var(--fig-warn)\" stroke-width=\"3.5\" stroke-dasharray=\"7 5\" stroke-linecap=\"round\"/><line x1=\"180\" y1=\"135\" x2=\"280\" y2=\"135\" stroke=\"var(--fig-warn)\" stroke-width=\"3.5\" stroke-dasharray=\"7 5\" stroke-linecap=\"round\"/><line x1=\"180\" y1=\"135\" x2=\"180\" y2=\"235\" stroke=\"var(--fig-warn)\" stroke-width=\"3.5\" stroke-dasharray=\"7 5\" stroke-linecap=\"round\"/><line x1=\"280\" y1=\"135\" x2=\"280\" y2=\"235\" stroke=\"var(--fig-warn)\" stroke-width=\"3.5\" stroke-dasharray=\"7 5\" stroke-linecap=\"round\"/><line x1=\"130\" y1=\"280\" x2=\"180\" y2=\"235\" stroke=\"var(--fig-warn)\" stroke-width=\"3.5\" stroke-dasharray=\"7 5\" stroke-linecap=\"round\"/><line x1=\"230\" y1=\"280\" x2=\"280\" y2=\"235\" stroke=\"var(--fig-warn)\" stroke-width=\"3.5\" stroke-dasharray=\"7 5\" stroke-linecap=\"round\"/></g><g class=\"graphics-vertex-split-p1 graphics-vertex-split-on\"><circle cx=\"130\" cy=\"180\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"230\" cy=\"180\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"130\" cy=\"280\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"230\" cy=\"280\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"180\" cy=\"135\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"280\" cy=\"135\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"180\" cy=\"235\" r=\"4.5\" fill=\"var(--fig-ink)\" fill-opacity=\"0.5\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"280\" cy=\"235\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/></g><g class=\"graphics-vertex-split-p2\"><circle cx=\"130\" cy=\"180\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"230\" cy=\"180\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"130\" cy=\"280\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"230\" cy=\"280\" r=\"4.5\" fill=\"var(--fig-ink)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"194\" cy=\"149\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"187\" cy=\"141.3\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"173\" cy=\"155.3\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"266\" cy=\"149\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"259\" cy=\"141.3\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"273\" cy=\"155.3\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"190.5\" cy=\"231.2\" r=\"4.5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.5\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"173\" cy=\"227.3\" r=\"4.5\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"262.5\" cy=\"231.2\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"273\" cy=\"227.3\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/></g><g class=\"graphics-vertex-split-p3\"><circle cx=\"144\" cy=\"194\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"151\" cy=\"173.7\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"137\" cy=\"187.7\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"216\" cy=\"194\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"223\" cy=\"173.7\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"237\" cy=\"187.7\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"144\" cy=\"266\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"151\" cy=\"273.7\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"137\" cy=\"259.7\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"216\" cy=\"266\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"223\" cy=\"273.7\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"237\" cy=\"259.7\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"194\" cy=\"149\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"187\" cy=\"141.3\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"173\" cy=\"155.3\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"266\" cy=\"149\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"259\" cy=\"141.3\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"273\" cy=\"155.3\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"194\" cy=\"221\" r=\"4.5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.5\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"187\" cy=\"241.3\" r=\"4.5\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"173\" cy=\"227.3\" r=\"4.5\" fill=\"var(--fig-warn)\" fill-opacity=\"0.5\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"266\" cy=\"221\" r=\"4.5\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"259\" cy=\"241.3\" r=\"4.5\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/><circle cx=\"273\" cy=\"227.3\" r=\"4.5\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"1.5\"/></g></g><text class=\"graphics-vertex-split-p1 graphics-vertex-split-big graphics-vertex-split-mid graphics-vertex-split-on\" x=\"205\" y=\"336\">8 vertices</text><text class=\"graphics-vertex-split-p2 graphics-vertex-split-big graphics-vertex-split-mid\" x=\"205\" y=\"336\">14 vertices</text><text class=\"graphics-vertex-split-p3 graphics-vertex-split-big graphics-vertex-split-mid\" x=\"205\" y=\"336\">24 vertices</text><rect x=\"350\" y=\"62\" width=\"270\" height=\"70\" rx=\"14\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-vertex-split-p1 graphics-vertex-split-hl graphics-vertex-split-on\" x=\"350\" y=\"62\" width=\"270\" height=\"70\" rx=\"14\" fill=\"var(--fig-accent)\" fill-opacity=\"0.1\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-vertex-split-h\" x=\"366\" y=\"92\">Positions</text><text class=\"graphics-vertex-split-m\" x=\"366\" y=\"114\">one vertex per cube corner</text><text class=\"graphics-vertex-split-big graphics-vertex-split-e\" x=\"604\" y=\"107\">8</text><rect x=\"350\" y=\"148\" width=\"270\" height=\"70\" rx=\"14\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-vertex-split-p2 graphics-vertex-split-hl\" x=\"350\" y=\"148\" width=\"270\" height=\"70\" rx=\"14\" fill=\"var(--fig-accent)\" fill-opacity=\"0.1\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-vertex-split-h\" x=\"366\" y=\"178\">UV seams, smooth normals</text><text class=\"graphics-vertex-split-m\" x=\"366\" y=\"200\">back corners: 2-3 UV copies</text><text class=\"graphics-vertex-split-big graphics-vertex-split-e\" x=\"604\" y=\"193\">14</text><rect x=\"350\" y=\"234\" width=\"270\" height=\"70\" rx=\"14\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><rect class=\"graphics-vertex-split-p3 graphics-vertex-split-hl\" x=\"350\" y=\"234\" width=\"270\" height=\"70\" rx=\"14\" fill=\"var(--fig-accent)\" fill-opacity=\"0.1\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><text class=\"graphics-vertex-split-h\" x=\"366\" y=\"264\">Flat normals (hard edges)</text><text class=\"graphics-vertex-split-m\" x=\"366\" y=\"286\">one copy per face: 8 x 3</text><text class=\"graphics-vertex-split-big graphics-vertex-split-e\" x=\"604\" y=\"279\">24</text></svg>"
        },
        {
          "type": "list",
          "items": [
            "**Hard edges and split normals**: every smoothing-group boundary duplicates the vertices along it. A low-poly prop with all faces flat has about 3 vertices per triangle and gets almost nothing from indexing.",
            "**UV seams**: every seam edge duplicates its vertices; island padding and mirrored islands add more. Fewer, longer islands mean fewer splits.",
            "**Vertex colour or second UV discontinuities**: a lightmap UV layout that cuts where UV0 does not adds splits.",
            "**Material boundaries**: per-material submeshes share the vertex buffer in some engines, but exporters and tools may duplicate vertices at material seams."
          ]
        },
        {
          "type": "p",
          "text": "So budget and profile in imported vertices, not in the DCC tool's count. A 12,000-vertex character that arrives as 19,400 is normal; the gap is the price of its shading and texturing choices, and you can reduce it by welding vertices whose attributes differ only by noise and by cutting fewer seams."
        },
        {
          "type": "h",
          "text": "Topology, winding and culling"
        },
        {
          "type": "p",
          "text": "A **triangle list** uses 3 indices per triangle and is the default everywhere. A **triangle strip** reuses the previous two vertices, so n indices give n - 2 triangles, but strips join separate pieces with **degenerate triangles** (zero area, from a repeated index or collinear points) or a primitive-restart index. Strips mattered when index bandwidth was scarce; today a cache-optimised list gets the same reuse without the joins, and strips are rarely worth the effort. Degenerate triangles in a list are pure waste: they are fetched, shaded and then discarded, so clean them out."
        },
        {
          "type": "p",
          "text": "Which side of a triangle is its front is decided by **winding order**: the order of its three indices as seen on screen, clockwise or counter-clockwise. With back-face culling on, the GPU discards triangles that wind the wrong way after projection, which removes about half of a closed mesh's triangles before rasterisation. The convention is not universal: OpenGL and glTF default to counter-clockwise fronts, Direct3D defaults to clockwise, Vulkan makes you choose, and Unity treats clockwise as front. A mesh imported with the wrong convention looks inside-out, showing the far inner walls."
        },
        {
          "type": "figure",
          "id": "graphics-winding-cull",
          "caption": "As the triangle turns, the order 0, 1, 2 flips from counter-clockwise to clockwise on screen at the edge-on moment, and from that frame the rasteriser receives nothing. Drawn with the OpenGL and glTF convention (front = counter-clockwise); Unity treats clockwise as front, so there the roles swap.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"A triangle with vertices ordered 0, 1, 2 turns about a vertical axis. While it faces the camera its winding is counter-clockwise and it is drawn; after half a turn the same order reads clockwise and the back face is culled.\"><style>.graphics-winding-cull-t{font-size:13px;fill:var(--fig-ink)}.graphics-winding-cull-m{font-size:12px;fill:var(--fig-muted)}.graphics-winding-cull-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-winding-cull-mid{text-anchor:middle}.graphics-winding-cull-e{text-anchor:end}.graphics-winding-cull-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-winding-cull-sp,.graphics-winding-cull-sf{transform-box:fill-box;transform-origin:center;animation:graphics-winding-cull-spin 7s infinite ease-in-out}.graphics-winding-cull-sf{animation:graphics-winding-cull-spin 7s infinite ease-in-out,graphics-winding-cull-frk 7s infinite}.graphics-winding-cull-fr{opacity:1;animation:graphics-winding-cull-frk 7s infinite}.graphics-winding-cull-bk{opacity:0;animation:graphics-winding-cull-bkk 7s infinite}.graphics-winding-cull-ok{fill:var(--fig-ok)}.graphics-winding-cull-bd{fill:var(--fig-bad)}@keyframes graphics-winding-cull-spin{0%,10%{transform:scaleX(1)}25%{transform:scaleX(0)}40%,60%{transform:scaleX(-1)}75%{transform:scaleX(0)}90%,100%{transform:scaleX(1)}}@keyframes graphics-winding-cull-frk{0%,24.5%{opacity:1}25%,75%{opacity:0}75.5%,100%{opacity:1}}@keyframes graphics-winding-cull-bkk{0%,24.5%{opacity:0}25%,75%{opacity:1}75.5%,100%{opacity:0}}.graphics-winding-cull-sf .graphics-winding-cull-fr{animation:none}</style><rect x=\"20\" y=\"44\" width=\"280\" height=\"230\" rx=\"14\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-winding-cull-h\" x=\"36\" y=\"70\">Scene: the triangle turns</text><rect x=\"340\" y=\"44\" width=\"280\" height=\"230\" rx=\"14\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-winding-cull-h\" x=\"356\" y=\"70\">Rasteriser input</text><line x1=\"160\" y1=\"88\" x2=\"160\" y2=\"236\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"3 5\"/><g transform=\"translate(0 0)\"><g class=\"graphics-winding-cull-sp\"><polygon class=\"graphics-winding-cull-fr\" points=\"100,215 220,215 160,105\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"2\" stroke-linejoin=\"round\"/><polygon class=\"graphics-winding-cull-bk\" points=\"100,215 220,215 160,105\" fill=\"var(--fig-bad)\" fill-opacity=\"0.12\" stroke=\"var(--fig-bad)\" stroke-dasharray=\"6 4\" stroke-width=\"2\" stroke-linejoin=\"round\"/><path d=\"M160 160A20 20 0 1 0 180 180\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\" stroke-linecap=\"round\"/><polygon points=\"176,181 184,181 180,171\" fill=\"var(--fig-ink)\"/><circle cx=\"100\" cy=\"215\" r=\"4\" fill=\"var(--fig-ink)\"/><circle cx=\"220\" cy=\"215\" r=\"4\" fill=\"var(--fig-ink)\"/><circle cx=\"160\" cy=\"105\" r=\"4\" fill=\"var(--fig-ink)\"/></g></g><g transform=\"translate(320 0)\"><g class=\"graphics-winding-cull-sf\"><polygon class=\"graphics-winding-cull-fr\" points=\"100,215 220,215 160,105\" fill=\"var(--fig-accent)\" fill-opacity=\"0.18\" stroke=\"var(--fig-accent)\" stroke-width=\"2\" stroke-linejoin=\"round\"/><path d=\"M160 160A20 20 0 1 0 180 180\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\" stroke-linecap=\"round\"/><polygon points=\"176,181 184,181 180,171\" fill=\"var(--fig-ink)\"/><circle cx=\"100\" cy=\"215\" r=\"4\" fill=\"var(--fig-ink)\"/><circle cx=\"220\" cy=\"215\" r=\"4\" fill=\"var(--fig-ink)\"/><circle cx=\"160\" cy=\"105\" r=\"4\" fill=\"var(--fig-ink)\"/></g></g><text class=\"graphics-winding-cull-t graphics-winding-cull-mid graphics-winding-cull-ok graphics-winding-cull-fr graphics-winding-cull-tx\" x=\"160\" y=\"256\">front face: 0, 1, 2 is CCW</text><text class=\"graphics-winding-cull-t graphics-winding-cull-mid graphics-winding-cull-bd graphics-winding-cull-bk graphics-winding-cull-tx\" x=\"160\" y=\"256\">back face: 0, 1, 2 reads CW</text><text class=\"graphics-winding-cull-t graphics-winding-cull-mid graphics-winding-cull-ok graphics-winding-cull-fr graphics-winding-cull-tx\" x=\"480\" y=\"256\">drawn</text><text class=\"graphics-winding-cull-t graphics-winding-cull-mid graphics-winding-cull-bd graphics-winding-cull-bk graphics-winding-cull-tx\" x=\"480\" y=\"256\">culled: 0 pixels</text><text class=\"graphics-winding-cull-m graphics-winding-cull-mid\" x=\"320\" y=\"302\">Cull Back with front = CCW: only the CCW view of the triangle is rasterised</text></svg>"
        },
        {
          "type": "p",
          "text": "Mirroring also flips winding. A transform with a negative scale on one axis (a left-handed copy of a right-handed prop) reverses every triangle, and engines detect the negative determinant and flip the front-face rule for that draw. Hand-written shaders and custom culling code need to respect the same rule. Finally, a **manifold** mesh is a closed surface where every edge is shared by exactly two triangles. **Non-manifold** geometry has edges shared by three or more triangles, open boundary edges, or vertices pinched between two fans. It usually renders, but it breaks algorithms that assume a watertight solid: mesh simplification for LODs, mesh-to-SDF and volume voxelisation, boolean operations, cloth, and any stencil shadow-volume or inside-test logic."
        },
        {
          "type": "h",
          "text": "Normals and tangent space"
        },
        {
          "type": "p",
          "text": "Normals are just a vertex attribute, so the choice between smooth and flat shading is a mesh data choice. **Smooth shading** gives the shared vertex one averaged normal, so interpolation across the triangle bends the lighting continuously around the edge. **Flat shading** gives each face its own copy of the vertex with the face normal, which is exactly the vertex split in the previous figure. Unity's `RecalculateNormals` averages only triangles that share a vertex index, so it respects splits: it keeps hard edges where vertices are duplicated, and a UV seam on a smooth surface gets a lighting seam, because the two copies are averaged separately. Build or weld vertices deliberately and set normals explicitly when seams matter."
        },
        {
          "type": "p",
          "text": "A **normal map** does not store world or object directions; it stores a perturbation in **tangent space**, a basis at each vertex made of the normal `N`, the tangent `T` along increasing U, and the bitangent `B` along increasing V. The bitangent is derived as `B = cross(N, T) * T.w`, so the tangent's `w` of +1 or -1 carries handedness. That sign is what keeps mirrored UV islands correct, because a mirrored island reverses the direction of U relative to the surface. In the fragment shader the sampled normal is multiplied by the `T`, `B`, `N` basis to reach world space."
        },
        {
          "type": "p",
          "text": "The basis is only meaningful relative to how the map was baked. If the baking tool and the engine construct tangents differently (different handling of mirrored UVs, per-pixel or per-vertex orthogonalisation, or Y-up versus Y-down green channel), the stored perturbations are applied in the wrong frame. The symptoms are shading seams along UV borders, bumps that look inverted on mirrored islands, and lighting that changes when the mesh is re-triangulated. **MikkTSpace** is the common standard that most baking tools, glTF and Unity's imported tangents use; the practical rule is to bake and render with the same algorithm, import tangents instead of recalculating them if the exporter supplies them, and check the normal map's green channel convention."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "A quick test for tangent trouble is a flat-grey normal map or a debug view that shows the tangent as colour. If lighting is smooth with a flat map but breaks with the real map at UV seams, the baked normals and the engine tangents disagree, not the mesh geometry."
        },
        {
          "type": "h",
          "text": "Budgets and cost"
        },
        {
          "type": "p",
          "text": "Triangle count alone is a poor budget. Cost splits across several things: the vertex shader runs per **vertex** (reduced by the cache), memory and fetch bandwidth scale with **vertices times stride**, the rasteriser works per triangle, and the fragment shader runs per **covered pixel**, in 2x2 quads as the earlier raster figure showed. That last point is why tiny triangles hurt. A triangle covering a fraction of a pixel still launches a whole quad of 4 fragment invocations and may produce no visible pixel, so a 20,000-triangle character that occupies 30 x 60 pixels (about 0.09 pixels per triangle) pays for the geometry and for large quad overshading without any visible gain."
        },
        {
          "type": "list",
          "items": [
            "**LODs**: swap in coarser meshes by screen size, for example 20,000, 8,000 and 2,500 triangles at near, mid and far, with a cross-fade or dithered transition. This addresses vertex cost and micro-triangle overshading together.",
            "**Attribute diet**: drop channels no shader reads (UV1, colour, tangents on non-normal-mapped materials) and quantise the rest, as in the layout above.",
            "**Mesh compression**: importer quantisation reduces the vertex data stored in memory; transmission formats such as Draco or meshopt in glTF shrink downloads but are decoded to a GPU layout before use.",
            "**Bounds**: the engine culls with the mesh's axis-aligned bounds, so they must contain every vertex that can ever be visible. A vertex shader that displaces vertices, or a skinned character whose arms reach outside its rest-pose box, gets culled while still on screen unless the bounds are enlarged; skinned renderers expose their own bounds and an update-when-offscreen option."
          ]
        },
        {
          "type": "h",
          "text": "Dynamic geometry"
        },
        {
          "type": "p",
          "text": "Two systems deform a mesh that is otherwise static. **Skinning** moves each vertex by a weighted sum of bone transforms, `v' = sum of w_i * (bone_i * bindpose_i) * v` with the weights adding to 1, usually 4 influences per vertex. The data is the bone indices and weights per vertex, and the cost is vertices times influences, normally on the GPU. **Blend shapes** (morph targets) store per-vertex deltas for a target pose and add them in proportion to a weight, `v' = v + sum of w_k * delta_k`. They suit shapes that skinning cannot express, such as facial expressions, but their memory scales with shape count: a 52-shape face rig where each shape touches 10,000 vertices stores 52 x 10,000 x 36 bytes (position, normal and tangent deltas) for about 19 MB. In Unity a `SkinnedMeshRenderer` drives both, and `SetBlendShapeWeight` takes weights from 0 to 100."
        },
        {
          "type": "p",
          "text": "The third option is changing the arrays on the CPU every frame, for example for a procedural flag or a destructible wall. Every change re-uploads the buffer: 20,000 vertices at 32 bytes is 640 KB per frame, about 38 MB per second at 60 fps. That bandwidth is small; the real costs are the CPU writing the data, validation in the engine and the driver's synchronisation with a GPU that may still be reading the old copy. Allocate once, mark the mesh dynamic, reuse arrays, update only what changed, and avoid whole-mesh `RecalculateNormals` on large meshes every frame. When the motion is a function of time, such as waves, move it into the vertex shader instead and keep the mesh static."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "Vector3[] verts;           // allocated once, reused every frame\nMesh mesh;\n\nvoid Awake() {\n    mesh = GetComponent<MeshFilter>().mesh;\n    mesh.MarkDynamic();    // hint: this mesh's buffers are rewritten often\n    verts = mesh.vertices;\n}\n\nvoid Update() {\n    for (int i = 0; i < verts.Length; i++)\n        verts[i].y = Mathf.Sin(Time.time + verts[i].x);\n\n    mesh.SetVertices(verts);   // no new array each frame\n    mesh.RecalculateBounds();  // keep culling bounds in step with the motion\n    // RecalculateNormals() here would cost O(triangles) every frame.\n}"
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents write mesh-building code that compiles and still renders wrong, because the failures are conventions rather than syntax. Tell the agent your engine's winding rule, handedness, index format limit and tangent standard, and ask it to include a validation function: every index below the vertex count, no degenerate triangles, vertex count and ACMR logged, winding agreeing with the stored normals (cross product of two edges against the normal), and bounds containing all vertices. Typical agent mistakes are counter-clockwise indices copied from OpenGL tutorials, 16-bit indices on meshes over 65,000 vertices, RecalculateNormals on a split mesh that creates seams, and per-frame array allocations in dynamic meshes. Also ask for the imported vertex count to be compared against the source tool's count when it generates importer code."
        },
        {
          "type": "h",
          "text": "Pitfalls checklist"
        },
        {
          "type": "list",
          "items": [
            "Comparing a DCC vertex count to the engine's: only the engine's count, after hard edges and UV seams, is what the GPU shades.",
            "A procedural mesh above 65,000 vertices left on 16-bit indices: the indices wrap or the engine rejects the mesh.",
            "Triangles authored in the wrong winding for the engine: the mesh looks inside-out, or vanishes with back-face culling on.",
            "Baking normal maps in one tool and shading with tangents from another algorithm.",
            "Half-float positions on large or far-from-origin meshes, and half-float UVs on atlases or tiled textures.",
            "Displaced or skinned geometry with static bounds, which gets culled early at the screen edge.",
            "Meshes with thousands of sub-pixel triangles in the distance and no LODs."
          ]
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A prop's imported vertex count is three or four times what the DCC tool reports",
              "use": "Split vertices only at hard edges and UV seams",
              "why": "Every unique attribute combination is its own GPU vertex. Soften edges that do not need to be hard and merge UV islands where stretching is acceptable; keep real seams."
            },
            {
              "signal": "A mesh is stored as a triangle soup where shared corners are duplicated in the vertex buffer",
              "use": "Indexed triangle list",
              "why": "An index buffer shares vertices between triangles, cutting memory and vertex shader runs. Only vertices with fully identical attributes can be shared."
            },
            {
              "signal": "A GPU capture shows the vertex stage is heavy and the mesh's ACMR is well above 1",
              "use": "Vertex cache reordering",
              "why": "Reordering triangles (for example with meshoptimizer) raises post-transform cache hits, so fewer vertex shader runs per triangle. The image is unchanged; it does nothing for fragment cost."
            },
            {
              "signal": "Vertex buffers dominate mesh memory and every attribute is stored as 32-bit float",
              "use": "Quantise vertex attributes",
              "why": "Normals and tangents as snorm8 and UVs as unorm16 can halve the stride. Keep positions at full float when far from the origin, since half floats get coarse quickly."
            },
            {
              "signal": "A procedural mesh with more than 65,535 vertices renders as scrambled spikes",
              "use": "32-bit index format or split the mesh",
              "why": "16-bit indices wrap past 65,535. Set the index format (`Mesh.indexFormat` in Unity) before assigning triangles, or chunk the mesh; 32-bit indices double index memory."
            },
            {
              "signal": "A normal-mapped mesh shows seams along UV borders and inverted bumps on its mirrored half",
              "use": "Match the tangent basis to the baker",
              "why": "Import tangents in the same convention the map was baked with, usually MikkTSpace, including the w sign for mirroring. Recalculating with a different method breaks the bake."
            },
            {
              "signal": "Distant characters with dense meshes make the frame fragment-bound because triangles are smaller than a pixel",
              "use": "LOD chain",
              "why": "Swap to simpler meshes as screen size shrinks, cutting wasted 2x2 quad shading and vertex work. Costs memory and authoring time, and needs crossfade or hysteresis to hide popping."
            },
            {
              "signal": "A skinned or vertex-displaced mesh vanishes near the screen edge even though part of it is visible",
              "use": "Expand the mesh bounds",
              "why": "Culling uses the bounding box, which does not know about shader displacement or animation reach. Enlarge it to cover the full motion; too large wastes culling efficiency."
            },
            {
              "signal": "Waves, flags or grass sway are animated by rewriting vertex positions on the CPU every frame",
              "use": "Animate in the vertex shader",
              "why": "A time-driven vertex shader avoids per-frame CPU work and buffer uploads. Bounds must be expanded, and CPU-side physics will not see the deformed shape."
            }
          ]
        }
      ],
      "keyPoints": [
        "A GPU vertex is the unique combination of all its attributes; hard edges and UV seams duplicate vertices, so a cube is 8 positions but 24 flat-shaded vertices, and imported counts exceed the DCC count.",
        "Vertex memory is stride times vertex count; quantising normals and tangents to snorm8 and UVs to unorm16 can halve the buffer, while positions need care because half-floats are coarse far from the origin.",
        "Indexing shares vertices, and the post-transform cache only helps if triangle order has locality; ACMR measures shader runs per triangle and reordering (for example with meshoptimizer) can lower it without changing the picture.",
        "16-bit indices stop at 65,535; larger meshes need 32-bit indices (Mesh.indexFormat in Unity), and the format must be set before the triangles are assigned.",
        "Winding decides the front face and culling convention differs between APIs and engines; negative scale flips winding, and manifold geometry (every edge shared by two triangles) is required by many algorithms.",
        "Normal maps live in tangent space, so the tangent and its w sign must match how the map was baked (usually MikkTSpace); mismatches show up as seams and inverted bumps on mirrored islands.",
        "Tiny triangles waste 2x2 quad shading, so LODs matter; displaced or skinned meshes need correct bounds, and per-frame CPU mesh edits cost an upload plus CPU work, so prefer vertex-shader or GPU animation."
      ],
      "quiz": [
        {
          "q": "A crate modelled as a cube with 8 vertices in the DCC tool shows 24 vertices after import, with hard edges and one UV island per face. What is the correct reading?",
          "options": [
            "The importer subdivided each face, so the mesh is now higher resolution than authored",
            "The importer added 16 extra degenerate vertices that the GPU skips at no cost",
            "Each corner has a different normal and UV on each face, so it is stored once per face",
            "Unity duplicates every vertex that is shared by more than one triangle on import"
          ],
          "answer": 2,
          "explain": "A GPU vertex is the unique combination of position, normal, UV and other attributes. A hard-edged cube corner needs three normals, so it is stored three times, and the vertex shader runs on 24 vertices. Vertices that match in every attribute stay shared, which is why smooth meshes keep their indexing savings."
        },
        {
          "q": "A procedural terrain chunk is a 300 x 300 vertex grid, so 90,000 vertices. After assigning the triangles the chunk renders as scrambled spikes or fails validation. What fixes it?",
          "options": [
            "Set mesh.indexFormat to UInt32 before assigning the triangles",
            "Call RecalculateBounds after assigning the triangles",
            "Switch the topology from a triangle list to a triangle strip",
            "Remove UV1 so each vertex fits into a 16-bit stride"
          ],
          "answer": 0,
          "explain": "The default 16-bit indices can only address vertices 0 to 65,535, so indices for a 90,000-vertex mesh do not fit. Use 32-bit indices, or split the terrain into chunks under the limit, which also culls better. Bounds, topology and attribute count do not change the index range."
        },
        {
          "q": "The same 8,000-triangle mesh, with identical vertices and attributes, is run through a vertex-cache optimiser. Its ACMR drops from 2.1 to 0.7. What do you expect to change in the frame?",
          "options": [
            "Nothing, because vertex count and triangle count are unchanged",
            "Lower fragment cost, because the triangles now cover fewer pixels",
            "A smaller mesh in memory, because the indices are now stored in 16 bits",
            "About a third of the vertex shader invocations for this mesh, with the same image"
          ],
          "answer": 3,
          "explain": "ACMR is vertex shader runs per triangle, so 2.1 to 0.7 is about three times fewer runs. Reordering only permutes the index buffer: the covered pixels, the image and the buffer sizes are unchanged. The saving matters most for vertex-bound draws such as shadow passes."
        },
        {
          "q": "A normal-mapped character baked in an external tool looks right in most places, but shows seams along UV borders and inverted bumps on the mirrored half. The engine recalculates tangents on import. What is the most likely fix?",
          "options": [
            "Call RecalculateNormals at runtime so the normals match the map",
            "Make the baker and the engine use the same tangent basis, normally MikkTSpace",
            "Save the normal map at a higher bit depth to keep more precision",
            "Reverse the winding order of the mirrored half of the mesh"
          ],
          "answer": 1,
          "explain": "A tangent-space normal map is only valid in the basis it was baked in. A different tangent construction, especially for mirrored UVs and the bitangent sign in w, applies the stored perturbation in the wrong frame. Recomputed normals, bit depth and winding do not change that basis."
        },
        {
          "q": "A GPU capture of a distant crowd is fragment-bound. Each 20,000-triangle character covers about 30 x 60 pixels, so most triangles are far smaller than a pixel. What is the best fix?",
          "options": [
            "Switch the index buffers to 32-bit so the fragment work is batched",
            "Store positions as half floats to reduce the cost of each fragment",
            "Add LODs so distant characters use far fewer, larger triangles",
            "Turn off back-face culling, which costs extra for tiny triangles"
          ],
          "answer": 2,
          "explain": "Fragments are shaded in 2x2 quads, so a sub-pixel triangle can still launch four invocations for little or nothing visible. Cutting the triangle count with LODs removes that overshading and the vertex work. Index width, position precision and the culling setting do not change how many quads are launched."
        },
        {
          "q": "A flag, banner and grass field sway by having a script rewrite every vertex position on the CPU each frame and re-upload the mesh. The profiler shows CPU time and upload bandwidth growing with vertex count. What should you reach for?",
          "options": [
            "Reorder the index buffer for better vertex cache efficiency",
            "Quantise the vertex attributes down to 16-bit values",
            "Build a LOD chain with simpler meshes for the far grass",
            "Animate vertices in the vertex shader from a time uniform"
          ],
          "answer": 3,
          "explain": "A sine or noise offset in the vertex shader runs on the GPU with no per-frame upload. Cache reordering and quantisation shrink GPU work or memory but leave the CPU rewrite and upload in place."
        }
      ]
    },
    {
      "id": "graphics-gpu-pipeline",
      "title": "The GPU and the Rendering Pipeline",
      "minutes": 14,
      "summary": "How a draw call becomes pixels, why GPUs run threads in lockstep groups, and how the CPU and GPU overlap and stall each other.",
      "lesson": [
        {
          "type": "p",
          "text": "Your game runs at 48 fps on a mid-range console and the target is 60. The profiler says the main thread takes 6 ms and the GPU takes 20 ms. Which side do you optimise, and what does 'GPU takes 20 ms' even consist of? Without a model of what the GPU physically does, tuning is guesswork: people halve their triangle count when the real cost is overdraw, or merge draw calls when the real cost is a shader that spills registers. This topic builds the model: the pipeline stages, the execution style of the hardware, and the producer-consumer relationship between CPU and GPU."
        },
        {
          "type": "h",
          "text": "Frame budgets"
        },
        {
          "type": "p",
          "text": "Everything is measured against the frame budget: 33.3 ms at 30 fps, 16.67 ms at 60 fps, 8.33 ms at 120 fps. CPU and GPU work in a pipeline, so the frame rate is limited by the slower of the two, not their sum. In the example above the GPU's 20 ms dominates, the frame takes about 20 ms (50 fps, with some scheduling loss giving 48), and optimising the CPU from 6 ms to 3 ms changes nothing visible. Always identify the limiter first."
        },
        {
          "type": "h",
          "text": "The pipeline stages"
        },
        {
          "type": "list",
          "items": [
            "**Input assembly**: fetches vertices and indices from buffers according to the vertex layout (position, normal, UV, and so on) and forms primitives, mostly triangles.",
            "**Vertex stage**: runs your vertex shader once per vertex (post-transform vertex cache lets shared vertices skip repeats). Output: clip-space position plus attributes to interpolate. Optional tessellation, geometry and mesh-shader stages can sit here, depending on API and hardware.",
            "**Primitive assembly, clipping and culling**: triangles outside the frustum are dropped, back-facing triangles can be culled, partially visible ones are clipped. Fixed-function.",
            "**Rasterization**: determines which pixels each triangle covers and generates **fragments**, interpolating attributes with perspective correction. Fixed-function and extremely fast, but it has a granularity: pixels are processed in 2x2 quads.",
            "**Fragment (pixel) stage**: runs your fragment shader per fragment. Here are texture sampling, lighting math and most of the GPU's ALU time. Depth testing may happen before this stage (early-Z) when the shader does not modify depth or discard.",
            "**Output merger (ROP)**: depth and stencil tests, blending with the existing colour, and writes to render targets. It is fixed-function but bandwidth-heavy: blending a 4K RGBA16F target touches a 66 MB surface per full-screen layer (read plus write, about 132 MB of traffic)."
          ]
        },
        {
          "type": "figure",
          "id": "graphics-pipeline-stages",
          "caption": "Only the vertex and fragment stages run your code; everything between them, including clipping, rasterization and the depth test, is fixed-function hardware.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 270\" role=\"img\" aria-label=\"Six pipeline stages in a row: input assembly, vertex shader, clip and cull, rasterize, fragment shader, output merger. Above each, the same triangle as it looks after that stage, from three indexed vertices to a covered pixel grid to depth-tested pixels.\"><style>.graphics-pipeline-stages-t{font-size:13px;fill:var(--fig-ink)}.graphics-pipeline-stages-m{font-size:12px;fill:var(--fig-muted)}.graphics-pipeline-stages-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-pipeline-stages-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-pipeline-stages-e{text-anchor:end}.graphics-pipeline-stages-mid{text-anchor:middle}@keyframes graphics-pipeline-stages-hl{0%,14%{opacity:1}17.5%,98%{opacity:0}100%{opacity:1}}.graphics-pipeline-stages-hl{opacity:0;animation:graphics-pipeline-stages-hl 6s infinite}.graphics-pipeline-stages-h1{animation-delay:-5s}.graphics-pipeline-stages-h2{animation-delay:-4s}.graphics-pipeline-stages-h3{animation-delay:-3s}.graphics-pipeline-stages-h4{animation-delay:-2s}.graphics-pipeline-stages-h5{animation-delay:-1s}.graphics-pipeline-stages-hl.graphics-pipeline-stages-h0{opacity:1}.graphics-pipeline-stages-s{font-size:11.5px;fill:var(--fig-muted)}.graphics-pipeline-stages-n{font-size:11px;fill:var(--fig-muted)}</style><text class=\"graphics-pipeline-stages-h\" x=\"10\" y=\"26\">One triangle through the pipeline</text><rect x=\"372\" y=\"15\" width=\"14\" height=\"14\" rx=\"4\" fill=\"var(--fig-accent)\" fill-opacity=\"0.16\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-pipeline-stages-m\" x=\"392\" y=\"26\">programmable</text><rect x=\"490\" y=\"15\" width=\"14\" height=\"14\" rx=\"4\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-pipeline-stages-m\" x=\"510\" y=\"26\">fixed-function</text><rect class=\"graphics-pipeline-stages-hl graphics-pipeline-stages-h0\" x=\"6\" y=\"44\" width=\"100\" height=\"194\" rx=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.06\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><rect x=\"10\" y=\"178\" width=\"92\" height=\"56\" rx=\"10\" fill=\"var(--fig-panel)\" fill-opacity=\"1\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"56\" y=\"202\" style=\"font-weight:600\">Input</text><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"56\" y=\"220\" style=\"font-weight:600\">assembly</text><text class=\"graphics-pipeline-stages-s graphics-pipeline-stages-mid\" x=\"56\" y=\"254\">vertices + indices</text><polygon points=\"107,201 114,206 107,211\" fill=\"var(--fig-muted)\"/><rect class=\"graphics-pipeline-stages-hl graphics-pipeline-stages-h1\" x=\"112\" y=\"44\" width=\"100\" height=\"194\" rx=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.06\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><rect x=\"116\" y=\"178\" width=\"92\" height=\"56\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.16\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"162\" y=\"202\" style=\"font-weight:600\">Vertex</text><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"162\" y=\"220\" style=\"font-weight:600\">shader</text><text class=\"graphics-pipeline-stages-s graphics-pipeline-stages-mid\" x=\"162\" y=\"254\">clip-space positions</text><polygon points=\"213,201 220,206 213,211\" fill=\"var(--fig-muted)\"/><rect class=\"graphics-pipeline-stages-hl graphics-pipeline-stages-h2\" x=\"218\" y=\"44\" width=\"100\" height=\"194\" rx=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.06\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><rect x=\"222\" y=\"178\" width=\"92\" height=\"56\" rx=\"10\" fill=\"var(--fig-panel)\" fill-opacity=\"1\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"268\" y=\"202\" style=\"font-weight:600\">Clip &</text><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"268\" y=\"220\" style=\"font-weight:600\">cull</text><text class=\"graphics-pipeline-stages-s graphics-pipeline-stages-mid\" x=\"268\" y=\"254\">clipped to the view</text><polygon points=\"319,201 326,206 319,211\" fill=\"var(--fig-muted)\"/><rect class=\"graphics-pipeline-stages-hl graphics-pipeline-stages-h3\" x=\"324\" y=\"44\" width=\"100\" height=\"194\" rx=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.06\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><rect x=\"328\" y=\"178\" width=\"92\" height=\"56\" rx=\"10\" fill=\"var(--fig-panel)\" fill-opacity=\"1\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"374\" y=\"211\" style=\"font-weight:600\">Rasterize</text><text class=\"graphics-pipeline-stages-s graphics-pipeline-stages-mid\" x=\"374\" y=\"254\">fragments</text><polygon points=\"425,201 432,206 425,211\" fill=\"var(--fig-muted)\"/><rect class=\"graphics-pipeline-stages-hl graphics-pipeline-stages-h4\" x=\"430\" y=\"44\" width=\"100\" height=\"194\" rx=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.06\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><rect x=\"434\" y=\"178\" width=\"92\" height=\"56\" rx=\"10\" fill=\"var(--fig-accent)\" fill-opacity=\"0.16\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"480\" y=\"202\" style=\"font-weight:600\">Fragment</text><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"480\" y=\"220\" style=\"font-weight:600\">shader</text><text class=\"graphics-pipeline-stages-s graphics-pipeline-stages-mid\" x=\"480\" y=\"254\">shaded fragments</text><polygon points=\"531,201 538,206 531,211\" fill=\"var(--fig-muted)\"/><rect class=\"graphics-pipeline-stages-hl graphics-pipeline-stages-h5\" x=\"536\" y=\"44\" width=\"100\" height=\"194\" rx=\"12\" fill=\"var(--fig-accent)\" fill-opacity=\"0.06\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><rect x=\"540\" y=\"178\" width=\"92\" height=\"56\" rx=\"10\" fill=\"var(--fig-panel)\" fill-opacity=\"1\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"586\" y=\"202\" style=\"font-weight:600\">Output</text><text class=\"graphics-pipeline-stages-t graphics-pipeline-stages-mid\" x=\"586\" y=\"220\" style=\"font-weight:600\">merger</text><text class=\"graphics-pipeline-stages-s graphics-pipeline-stages-mid\" x=\"586\" y=\"254\">depth test, blend</text><circle cx=\"26\" cy=\"128\" r=\"4.5\" fill=\"var(--fig-ink)\"/><text class=\"graphics-pipeline-stages-n\" x=\"12\" y=\"132\">0</text><circle cx=\"86\" cy=\"114\" r=\"4.5\" fill=\"var(--fig-ink)\"/><text class=\"graphics-pipeline-stages-n\" x=\"94\" y=\"118\">1</text><circle cx=\"50\" cy=\"70\" r=\"4.5\" fill=\"var(--fig-ink)\"/><text class=\"graphics-pipeline-stages-n\" x=\"36\" y=\"64\">2</text><text class=\"graphics-pipeline-stages-n graphics-pipeline-stages-mid graphics-pipeline-stages-c\" x=\"56\" y=\"156\">[0, 1, 2]</text><circle cx=\"132\" cy=\"128\" r=\"3\" fill=\"var(--fig-muted)\" fill-opacity=\"0.5\"/><circle cx=\"192\" cy=\"114\" r=\"3\" fill=\"var(--fig-muted)\" fill-opacity=\"0.5\"/><circle cx=\"156\" cy=\"70\" r=\"3\" fill=\"var(--fig-muted)\" fill-opacity=\"0.5\"/><polygon points=\"126,132 200,104 164,64\" fill=\"var(--fig-accent)\" fill-opacity=\"0.15\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><circle cx=\"126\" cy=\"132\" r=\"4.5\" fill=\"var(--fig-accent)\"/><circle cx=\"200\" cy=\"104\" r=\"4.5\" fill=\"var(--fig-accent)\"/><circle cx=\"164\" cy=\"64\" r=\"4.5\" fill=\"var(--fig-accent)\"/><defs><clipPath id=\"graphics-pipeline-stages-cp\"><rect x=\"236\" y=\"70\" width=\"64\" height=\"64\"/></clipPath></defs><polygon points=\"240,128 320,108 262,66\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/><polygon clip-path=\"url(#graphics-pipeline-stages-cp)\" points=\"240,128 320,108 262,66\" fill=\"var(--fig-accent)\" fill-opacity=\"0.2\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\"/><rect x=\"236\" y=\"70\" width=\"64\" height=\"64\" rx=\"2\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"5 3\"/><path d=\"M350 78h12v12h-12zM362 78h12v12h-12zM374 78h12v12h-12zM386 78h12v12h-12zM350 90h12v12h-12zM362 90h12v12h-12zM374 90h12v12h-12zM386 90h12v12h-12zM350 102h12v12h-12zM362 102h12v12h-12zM374 102h12v12h-12zM362 114h12v12h-12z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.35\"/><path d=\"M338 66v72M338 66h72M350 66v72M338 78h72M362 66v72M338 90h72M374 66v72M338 102h72M386 66v72M338 114h72M398 66v72M338 126h72M410 66v72M338 138h72\" stroke=\"var(--fig-line)\" stroke-width=\"1\" fill=\"none\"/><polygon points=\"341.6,72 406.4,86.4 360.8,134.4\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><rect x=\"456\" y=\"78\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.4\"/><rect x=\"468\" y=\"78\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.6\"/><rect x=\"480\" y=\"78\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.7\"/><rect x=\"492\" y=\"78\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.8\"/><rect x=\"456\" y=\"90\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\"/><rect x=\"468\" y=\"90\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.6\"/><rect x=\"480\" y=\"90\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.7\"/><rect x=\"492\" y=\"90\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.9\"/><rect x=\"456\" y=\"102\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.5\"/><rect x=\"468\" y=\"102\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.6\"/><rect x=\"480\" y=\"102\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.8\"/><rect x=\"468\" y=\"114\" width=\"12\" height=\"12\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.7\"/><path d=\"M444 66v72M444 66h72M456 66v72M444 78h72M468 66v72M444 90h72M480 66v72M444 102h72M492 66v72M444 114h72M504 66v72M444 126h72M516 66v72M444 138h72\" stroke=\"var(--fig-line)\" stroke-width=\"1\" fill=\"none\"/><rect x=\"598\" y=\"78\" width=\"24\" height=\"48\" fill=\"var(--fig-muted)\" fill-opacity=\"0.45\"/><path d=\"M562 78h12v12h-12zM574 78h12v12h-12zM586 78h12v12h-12zM562 90h12v12h-12zM574 90h12v12h-12zM586 90h12v12h-12zM562 102h12v12h-12zM574 102h12v12h-12zM586 102h12v12h-12zM574 114h12v12h-12z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.75\"/><path d=\"M598 78h12v12h-12zM598 90h12v12h-12z\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-width=\"1.5\" stroke-dasharray=\"2 2\"/><path d=\"M550 66v72M550 66h72M562 66v72M550 78h72M574 66v72M550 90h72M586 66v72M550 102h72M598 66v72M550 114h72M610 66v72M550 126h72M622 66v72M550 138h72\" stroke=\"var(--fig-line)\" stroke-width=\"1\" fill=\"none\"/></svg>"
        },
        {
          "type": "p",
          "text": "Compute shaders sit outside this fixed flow: they run general-purpose thread groups with no triangles, used for culling, particle simulation, post-processing and skinning. The same hardware cores execute them."
        },
        {
          "type": "h",
          "text": "What a draw call is, and what it costs"
        },
        {
          "type": "p",
          "text": "A **draw call** is a command that says 'render this index range of this mesh with the currently bound shader, textures and state'. The expensive part is usually on the **CPU**: the engine and driver validate state, translate it to hardware commands and write them into a command buffer. A scene with 5,000 draw calls and cheap shaders can be CPU-bound at 8 ms on a phone while the GPU idles. Remedies reduce CPU work per object: **instancing** (one call draws many copies with per-instance data), **batching** (merging meshes or sharing state so the engine can skip rebinding), GPU-driven rendering (the GPU builds its own draw list from a culling compute pass), and simply culling better (the Graphics APIs and GPU performance topic covers batching and instancing in detail). Modern APIs (Vulkan, D3D12, Metal) lower per-call overhead versus older APIs, but state changes such as switching shader or render target are still costly."
        },
        {
          "type": "p",
          "text": "A common misconception is that draw calls are expensive on the GPU. The GPU cost of a draw is mostly the shader work it triggers; a million cheap triangles in one call is fine, while 10 calls of overdraw-heavy fullscreen transparent layers can cost 6 ms on a mobile GPU."
        },
        {
          "type": "h",
          "text": "How the GPU executes: thousands of threads in lockstep"
        },
        {
          "type": "p",
          "text": "A CPU core is built to run one thread fast: deep caches, branch prediction, out-of-order execution. A GPU is built for throughput: many simple lanes, with little control logic per lane. The hardware groups threads into fixed-size bundles that share one instruction stream: **warps** of 32 threads on NVIDIA, **wavefronts** of 32 or 64 on AMD (the width depends on architecture and mode), and SIMD-groups of 32 on Apple GPUs. All lanes in the group execute the same instruction on different data (SIMT). A GPU might have thousands of lanes active simultaneously, and tens of thousands of threads resident."
        },
        {
          "type": "p",
          "text": "Memory is slow: a texture fetch that misses cache can take hundreds of cycles. The GPU hides it not with caches and prediction but with **occupancy**: when one warp waits on memory, the scheduler switches to another resident warp at no cost, since each warp's registers stay on chip. If your shader needs many registers per thread, fewer warps fit on a core, occupancy drops, latency is exposed, and the shader stalls. This is why a 'simple-looking' shader with many live temporaries can be slower than a longer one."
        },
        {
          "type": "p",
          "text": "Because pixels are shaded in 2x2 **quads** (so the hardware can compute screen-space derivatives for texture mip selection by differencing neighbours), a triangle covering a single pixel still launches work for a whole quad, up to four lanes with three doing wasted helper work. Meshes with millions of tiny triangles are therefore wasteful for the fragment stage, which is a major reason for LODs alongside vertex cost. Mobile GPUs are mostly **tile-based**, which changes where the costs sit; the Graphics APIs and GPU performance topic covers that model and its rules."
        },
        {
          "type": "figure",
          "id": "graphics-raster-quads",
          "caption": "The rasterizer tests pixel centres, but shading runs in 2x2 quads: every quad the triangle touches launches four lanes, so edge pixels and tiny triangles pay for helper lanes that produce nothing.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 308\" role=\"img\" aria-label=\"A triangle over a 16 by 10 pixel grid. Pixels whose centres fall inside fill in row by row (52 pixels), then the 2 by 2 quads they touch are outlined: 19 quads run 76 lanes, 24 of them helper lanes on uncovered pixels.\"><style>.graphics-raster-quads-t{font-size:13px;fill:var(--fig-ink)}.graphics-raster-quads-m{font-size:12px;fill:var(--fig-muted)}.graphics-raster-quads-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-raster-quads-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-raster-quads-e{text-anchor:end}.graphics-raster-quads-mid{text-anchor:middle}.graphics-raster-quads-r{opacity:1}@keyframes graphics-raster-quads-r1{0%,10.6%{opacity:0}12.1%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-r1{animation:graphics-raster-quads-r1 7s infinite}@keyframes graphics-raster-quads-r2{0%,15.2%{opacity:0}16.7%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-r2{animation:graphics-raster-quads-r2 7s infinite}@keyframes graphics-raster-quads-r3{0%,19.8%{opacity:0}21.3%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-r3{animation:graphics-raster-quads-r3 7s infinite}@keyframes graphics-raster-quads-r4{0%,24.4%{opacity:0}25.9%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-r4{animation:graphics-raster-quads-r4 7s infinite}@keyframes graphics-raster-quads-r5{0%,29%{opacity:0}30.5%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-r5{animation:graphics-raster-quads-r5 7s infinite}@keyframes graphics-raster-quads-r6{0%,33.6%{opacity:0}35.1%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-r6{animation:graphics-raster-quads-r6 7s infinite}@keyframes graphics-raster-quads-r7{0%,38.2%{opacity:0}39.7%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-r7{animation:graphics-raster-quads-r7 7s infinite}@keyframes graphics-raster-quads-r8{0%,42.8%{opacity:0}44.3%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-r8{animation:graphics-raster-quads-r8 7s infinite}@keyframes graphics-raster-quads-q{0%,56%{opacity:0}60%,92%{opacity:1}96%,100%{opacity:0}}.graphics-raster-quads-q{animation:graphics-raster-quads-q 7s infinite}@keyframes graphics-raster-quads-sc{0%,6%{transform:translateY(0px)}48.9%{transform:translateY(240px);opacity:1}50.4%,100%{transform:translateY(240px);opacity:0}}.graphics-raster-quads-sc{opacity:0;animation:graphics-raster-quads-sc 7s infinite}.graphics-raster-quads-big{font-size:15px;font-weight:600}</style><defs><pattern id=\"graphics-raster-quads-g\" x=\"24\" y=\"52\" width=\"24\" height=\"24\" patternUnits=\"userSpaceOnUse\"><path d=\"M24 0V24H0\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"1.6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.7\"/></pattern></defs><text class=\"graphics-raster-quads-h\" x=\"24\" y=\"32\">Pixel centres tested, then shaded in 2×2 quads</text><g class=\"graphics-raster-quads-q\"><path d=\"M72 52h24v24h-24zM96 52h24v24h-24zM120 52h24v24h-24zM144 52h24v24h-24zM144 76h24v24h-24zM72 124h24v24h-24zM264 100h24v24h-24zM288 100h24v24h-24zM312 100h24v24h-24zM336 100h24v24h-24zM72 148h24v24h-24zM72 172h24v24h-24zM288 172h24v24h-24zM336 148h24v24h-24zM312 172h24v24h-24zM336 172h24v24h-24zM216 220h24v24h-24zM240 220h24v24h-24zM120 244h24v24h-24zM120 268h24v24h-24zM144 268h24v24h-24zM192 244h24v24h-24zM168 268h24v24h-24zM192 268h24v24h-24z\" fill=\"var(--fig-warn)\" fill-opacity=\"0.3\"/></g><path class=\"graphics-raster-quads-r1\" d=\"M72 76h24v24h-24zM96 76h24v24h-24zM120 76h24v24h-24z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><path class=\"graphics-raster-quads-r2\" d=\"M72 100h24v24h-24zM96 100h24v24h-24zM120 100h24v24h-24zM144 100h24v24h-24zM168 100h24v24h-24zM192 100h24v24h-24zM216 100h24v24h-24zM240 100h24v24h-24z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><path class=\"graphics-raster-quads-r3\" d=\"M96 124h24v24h-24zM120 124h24v24h-24zM144 124h24v24h-24zM168 124h24v24h-24zM192 124h24v24h-24zM216 124h24v24h-24zM240 124h24v24h-24zM264 124h24v24h-24zM288 124h24v24h-24zM312 124h24v24h-24zM336 124h24v24h-24z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><path class=\"graphics-raster-quads-r4\" d=\"M96 148h24v24h-24zM120 148h24v24h-24zM144 148h24v24h-24zM168 148h24v24h-24zM192 148h24v24h-24zM216 148h24v24h-24zM240 148h24v24h-24zM264 148h24v24h-24zM288 148h24v24h-24zM312 148h24v24h-24z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><path class=\"graphics-raster-quads-r5\" d=\"M96 172h24v24h-24zM120 172h24v24h-24zM144 172h24v24h-24zM168 172h24v24h-24zM192 172h24v24h-24zM216 172h24v24h-24zM240 172h24v24h-24zM264 172h24v24h-24z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><path class=\"graphics-raster-quads-r6\" d=\"M120 196h24v24h-24zM144 196h24v24h-24zM168 196h24v24h-24zM192 196h24v24h-24zM216 196h24v24h-24zM240 196h24v24h-24z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><path class=\"graphics-raster-quads-r7\" d=\"M120 220h24v24h-24zM144 220h24v24h-24zM168 220h24v24h-24zM192 220h24v24h-24z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><path class=\"graphics-raster-quads-r8\" d=\"M144 244h24v24h-24zM168 244h24v24h-24z\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><rect x=\"24\" y=\"52\" width=\"384\" height=\"240\" fill=\"url(#graphics-raster-quads-g)\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><line class=\"graphics-raster-quads-sc\" x1=\"24\" y1=\"52\" x2=\"408\" y2=\"52\" stroke=\"var(--fig-accent)\" stroke-width=\"2\"/><polygon points=\"57.6,71.2 374.4,133.6 148.8,280\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\" stroke-linejoin=\"round\"/><g class=\"graphics-raster-quads-q\"><path d=\"M72 52h48v48h-48zM120 52h48v48h-48zM72 100h48v48h-48zM120 100h48v48h-48zM168 100h48v48h-48zM216 100h48v48h-48zM264 100h48v48h-48zM312 100h48v48h-48zM72 148h48v48h-48zM120 148h48v48h-48zM168 148h48v48h-48zM216 148h48v48h-48zM264 148h48v48h-48zM312 148h48v48h-48zM120 196h48v48h-48zM168 196h48v48h-48zM216 196h48v48h-48zM120 244h48v48h-48zM168 244h48v48h-48z\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.75\" stroke-width=\"2\"/></g><rect x=\"436\" y=\"58\" width=\"14\" height=\"14\" rx=\"3\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><text class=\"graphics-raster-quads-t\" x=\"458\" y=\"70\">covered pixels: 52</text><rect x=\"436\" y=\"82\" width=\"14\" height=\"14\" rx=\"2\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/><text class=\"graphics-raster-quads-t\" x=\"458\" y=\"94\">quads launched: 19</text><rect x=\"436\" y=\"106\" width=\"14\" height=\"14\" rx=\"3\" fill=\"var(--fig-warn)\" fill-opacity=\"0.3\"/><text class=\"graphics-raster-quads-t\" x=\"458\" y=\"118\">helper lanes: 24</text><text class=\"graphics-raster-quads-m\" x=\"436\" y=\"146\">76 lanes run for 52 pixels</text><text class=\"graphics-raster-quads-m\" x=\"436\" y=\"164\">helpers feed mip derivatives</text><text class=\"graphics-raster-quads-t\" x=\"436\" y=\"196\" style=\"font-weight:600\">A 1-pixel triangle</text><rect x=\"440\" y=\"210\" width=\"48\" height=\"48\" fill=\"var(--fig-warn)\" fill-opacity=\"0.3\"/><rect x=\"440\" y=\"210\" width=\"24\" height=\"24\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.45\"/><path d=\"M464 210v48M440 234h48\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><rect x=\"440\" y=\"210\" width=\"48\" height=\"48\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.75\" stroke-width=\"2\"/><polygon points=\"445,216 460,219 449,230\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\"/><text class=\"graphics-raster-quads-t\" x=\"502\" y=\"230\">1 pixel covered</text><text class=\"graphics-raster-quads-t\" x=\"502\" y=\"250\">4 lanes, 3 wasted</text></svg>"
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Where the 20 ms goes (example 1440p frame, GPU-bound)\n  shadow maps (4 cascades)      3.5 ms   vertex/ROP bound\n  opaque geometry               6.0 ms   fragment ALU + texture bound\n  lighting / SSAO               4.0 ms   bandwidth bound\n  transparents + particles      4.0 ms   overdraw, blending\n  post-processing (bloom, TAA)  2.5 ms   bandwidth bound\n  total                        20.0 ms   -> 50 fps\n\nCheck: halve render resolution. Frame time drops a lot => pixel bound.\n       Frame time unchanged => vertex, CPU or sync bound."
        },
        {
          "type": "h",
          "text": "CPU-GPU synchronisation and latency"
        },
        {
          "type": "p",
          "text": "The CPU does not wait for the GPU to finish a draw: it records commands into a queue and moves on. The GPU consumes them later, typically **one to three frames behind** (the driver or engine allows a small number of queued frames to keep both busy). That decoupling is why the pipeline reaches the max of CPU and GPU time, but it adds **latency**: your input at the start of frame N appears on screen after the CPU records N, the GPU renders N, and the display scans it out. Typical end-to-end latency is 2 to 4 frames, or 33 to 66 ms at 60 fps, and low-latency modes shorten the queue at some throughput cost."
        },
        {
          "type": "p",
          "text": "Synchronisation points break this overlap. The main one: **reading data back from the GPU** to the CPU (reading pixels, occlusion query results, a buffer written by compute) forces the CPU to wait for the GPU to finish the producing work. A blocking readback inserted in the middle of a frame can turn a 14 ms GPU frame and a 6 ms CPU frame into 20 ms, because the two stop overlapping and run serially. The fix is **asynchronous readback** that delivers the data a few frames later, accepting latency. Similarly, updating a buffer the GPU is still reading forces a stall or a hidden copy; use ring buffers, with several frames of buffers rotating."
        },
        {
          "type": "figure",
          "id": "graphics-cpu-gpu-overlap",
          "caption": "Pipelined, a 6 ms CPU and a 14 ms GPU deliver a frame every 14 ms; a blocking readback forces them to take turns and every frame costs 6 + 14 = 20 ms.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 324\" role=\"img\" aria-label=\"Two CPU and GPU timelines over 60 ms, drawn to scale. Pipelined, the CPU records frame N+1 while the GPU renders frame N, so a frame completes every 14 ms. With a blocking readback the CPU waits for the GPU each frame and frames take 6 + 14 = 20 ms.\"><style>.graphics-cpu-gpu-overlap-t{font-size:13px;fill:var(--fig-ink)}.graphics-cpu-gpu-overlap-m{font-size:12px;fill:var(--fig-muted)}.graphics-cpu-gpu-overlap-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-cpu-gpu-overlap-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-cpu-gpu-overlap-e{text-anchor:end}.graphics-cpu-gpu-overlap-mid{text-anchor:middle}@keyframes graphics-cpu-gpu-overlap-ph{0%{transform:translateX(0px)}100%{transform:translateX(520px)}}.graphics-cpu-gpu-overlap-ph{animation:graphics-cpu-gpu-overlap-ph 6s linear infinite}.graphics-cpu-gpu-overlap-k{font-size:12px;font-weight:600;fill:var(--fig-ink);text-anchor:middle}.graphics-cpu-gpu-overlap-lab{font-size:13px;font-weight:600;fill:var(--fig-muted);text-anchor:end}</style><text class=\"graphics-cpu-gpu-overlap-h\" x=\"16\" y=\"24\">Pipelined: the GPU renders frame N while the CPU records N+1</text><text class=\"graphics-cpu-gpu-overlap-lab\" x=\"84\" y=\"59\">CPU</text><text class=\"graphics-cpu-gpu-overlap-lab\" x=\"84\" y=\"95\">GPU</text><rect x=\"97\" y=\"40\" width=\"50\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"122\" y=\"58\">N</text><rect x=\"218.3\" y=\"40\" width=\"50\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"243.3\" y=\"58\">N+1</text><rect x=\"339.7\" y=\"40\" width=\"50\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"364.7\" y=\"58\">N+2</text><rect x=\"461\" y=\"40\" width=\"50\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"486\" y=\"58\">N+3</text><rect x=\"582.3\" y=\"40\" width=\"32.7\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"598.6\" y=\"58\">N+4</text><rect x=\"97\" y=\"76\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"156.7\" y=\"94\">N−1</text><rect x=\"218.3\" y=\"76\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"278\" y=\"94\">N</text><rect x=\"339.7\" y=\"76\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"399.4\" y=\"94\">N+1</text><rect x=\"461\" y=\"76\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"520.6\" y=\"94\">N+2</text><rect x=\"582.3\" y=\"76\" width=\"32.7\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"598.6\" y=\"94\">N+3</text><text class=\"graphics-cpu-gpu-overlap-m\" x=\"104\" y=\"130\">a frame every 14 ms = max(CPU 6, GPU 14); the GPU is never idle</text><text class=\"graphics-cpu-gpu-overlap-h\" x=\"16\" y=\"170\">Blocking readback: the CPU waits, nothing overlaps</text><text class=\"graphics-cpu-gpu-overlap-lab\" x=\"84\" y=\"205\">CPU</text><text class=\"graphics-cpu-gpu-overlap-lab\" x=\"84\" y=\"241\">GPU</text><rect x=\"97\" y=\"186\" width=\"50\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"122\" y=\"204\">N</text><rect x=\"149\" y=\"186\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-opacity=\"0.7\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"208.7\" y=\"204\" style=\"fill:var(--fig-bad)\">waits</text><rect x=\"97\" y=\"222\" width=\"50\" height=\"28\" rx=\"6\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-opacity=\"0.7\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"122\" y=\"240\" style=\"fill:var(--fig-bad)\">idle</text><rect x=\"149\" y=\"222\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"208.7\" y=\"240\">N</text><rect x=\"270.3\" y=\"186\" width=\"50\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"295.3\" y=\"204\">N+1</text><rect x=\"322.3\" y=\"186\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-opacity=\"0.7\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"382\" y=\"204\" style=\"fill:var(--fig-bad)\">waits</text><rect x=\"270.3\" y=\"222\" width=\"50\" height=\"28\" rx=\"6\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-opacity=\"0.7\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"295.3\" y=\"240\" style=\"fill:var(--fig-bad)\">idle</text><rect x=\"322.3\" y=\"222\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"382\" y=\"240\">N+1</text><rect x=\"443.7\" y=\"186\" width=\"50\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"468.7\" y=\"204\">N+2</text><rect x=\"495.7\" y=\"186\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-opacity=\"0.7\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"555.4\" y=\"204\" style=\"fill:var(--fig-bad)\">waits</text><rect x=\"443.7\" y=\"222\" width=\"50\" height=\"28\" rx=\"6\" fill=\"none\" stroke=\"var(--fig-bad)\" stroke-opacity=\"0.7\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"468.7\" y=\"240\" style=\"fill:var(--fig-bad)\">idle</text><rect x=\"495.7\" y=\"222\" width=\"119.3\" height=\"28\" rx=\"6\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-k\" x=\"555.4\" y=\"240\">N+2</text><text class=\"graphics-cpu-gpu-overlap-m\" x=\"104\" y=\"276\">a frame every 20 ms = CPU 6 + GPU 14</text><line x1=\"96\" y1=\"292\" x2=\"616\" y2=\"292\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><line x1=\"96\" y1=\"292\" x2=\"96\" y2=\"298\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"96\" y=\"314\">0</text><line x1=\"182.7\" y1=\"292\" x2=\"182.7\" y2=\"298\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"182.7\" y=\"314\">10</text><line x1=\"269.3\" y1=\"292\" x2=\"269.3\" y2=\"298\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"269.3\" y=\"314\">20</text><line x1=\"356\" y1=\"292\" x2=\"356\" y2=\"298\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"356\" y=\"314\">30</text><line x1=\"442.7\" y1=\"292\" x2=\"442.7\" y2=\"298\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"442.7\" y=\"314\">40</text><line x1=\"529.3\" y1=\"292\" x2=\"529.3\" y2=\"298\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"529.3\" y=\"314\">50</text><line x1=\"616\" y1=\"292\" x2=\"616\" y2=\"298\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-cpu-gpu-overlap-m graphics-cpu-gpu-overlap-mid\" x=\"616\" y=\"314\">60 ms</text><path class=\"graphics-cpu-gpu-overlap-ph\" d=\"M96 34V110M96 180V292\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-opacity=\"0.55\" stroke-width=\"1.5\"/></svg>"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "VSync and frame pacing hide the limiter. With classic double-buffered VSync on a 60 Hz display, a frame that takes 17 ms drops the game to 30 fps (it misses one refresh and waits for the next). Judge performance by CPU and GPU millisecond timings, not by fps alone, and capture GPU timings with the platform's GPU profiler."
        },
        {
          "type": "h",
          "text": "Worked diagnosis"
        },
        {
          "type": "p",
          "text": "Symptom: 52 fps on a laptop, GPU utilisation 98%, CPU main thread 5 ms. Hypothesis: GPU-bound. Test 1: drop the resolution scale to 50%. Frame time falls from 19 ms to 11 ms, so the cost scales with pixel count: fragment-bound or bandwidth-bound. Test 2: disable post-processing; 3 ms recovered. Test 3: a GPU capture shows the transparent particle pass at 4 ms with heavy overdraw. Fix: fewer, smaller particles, tighter quads cropped to the visible alpha, and half-resolution rendering for the smoke layer. Each step used a measured experiment to narrow the stage, not a guess."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents optimise by pattern and will confidently 'reduce draw calls' or 'merge meshes' for a GPU-bound scene, making it no faster. Give the agent measurements: CPU ms, GPU ms, which pass dominates, the target platform. Ask it to say which pipeline stage a change targets and how you would confirm it with a capture. Be sceptical of code that calls blocking GPU readbacks in the frame loop, allocates buffers per frame, or relies on 'it ran fast on my machine' numbers. Verify with the profiler on target hardware."
        },
        {
          "type": "h",
          "text": "Pitfalls checklist"
        },
        {
          "type": "list",
          "items": [
            "Optimising the wrong side: always compare CPU ms with GPU ms first.",
            "Counting triangles instead of covered pixels and overdraw.",
            "Synchronous readbacks of render textures or compute results mid-frame.",
            "Many tiny meshes or sub-pixel triangles that waste quad work.",
            "Ignoring thermal throttling: a phone that hits 60 fps for 30 seconds may sustain only 40."
          ]
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A teammate proposes a shader optimisation, but nobody has compared CPU and GPU frame times yet",
              "use": "Measure both sides, fix the long pole",
              "why": "CPU and GPU run as a pipeline, so the frame takes as long as the slower one. Saving GPU time in a CPU-bound frame changes nothing but power use."
            },
            {
              "signal": "Code reads a render texture or buffer back to the CPU mid-frame and the frame is longer than CPU plus GPU work alone",
              "use": "Asynchronous GPU readback",
              "why": "A synchronous read makes the CPU wait for the GPU to drain. An async request returns a frame or more later, so the logic must tolerate stale data."
            },
            {
              "signal": "A capture shows heavy opaque overdraw: the same pixels shaded several times per frame",
              "use": "Sort opaque draws front to back",
              "why": "Near objects fill the depth buffer first, so early-Z rejects hidden fragments before shading. Conflicts with sorting by state, so engines sort by a key that balances both."
            },
            {
              "signal": "Opaque fragment shaders are expensive and overdraw stays high even after sorting, for example dense foliage",
              "use": "Depth prepass",
              "why": "Render depth only first, then shade with an equal depth test so each pixel is shaded once. Doubles vertex work and draw calls, so it pays only when fragment cost dominates."
            },
            {
              "signal": "An opaque shader uses `discard`/`clip` or writes depth, and overdraw cost jumped",
              "use": "Keep early depth testing alive",
              "why": "Discard and depth writes force late depth testing, so hidden fragments get shaded. Restrict them to cutout materials, render those after plain opaques, or use a depth prepass."
            },
            {
              "signal": "Objects far outside the camera view still appear as draw calls in the frame debugger",
              "use": "Frustum culling",
              "why": "Test bounding volumes against the view frustum before submission to skip CPU and GPU work. Needs correct bounds; large meshes that span the view are never culled, so split them."
            },
            {
              "signal": "Indoor or city levels draw many objects that are fully hidden behind walls or buildings",
              "use": "Occlusion culling",
              "why": "Baked visibility data or a depth-pyramid test skips hidden draws. It costs CPU or GPU time and memory itself, so it pays only in scenes with heavy occlusion."
            },
            {
              "signal": "A fragment shader that uses many registers runs slower than a longer but leaner shader",
              "use": "Reduce register pressure for occupancy",
              "why": "Fewer registers per thread lets more warps stay resident to hide texture latency. Shorten live ranges or split passes; verify the occupancy gain in a GPU profiler."
            }
          ]
        }
      ],
      "keyPoints": [
        "Frame rate is limited by the slower of CPU and GPU, since they run as a pipeline; measure both before optimising either.",
        "The pipeline runs input assembly, vertex, rasterization, fragment and output merger; most cost is fragment shading, texture bandwidth and blending.",
        "Draw-call cost is mostly CPU-side validation and submission; the GPU cost is the shader work it triggers.",
        "GPUs run threads in lockstep groups (warps or wavefronts) and hide memory latency by switching groups, so register pressure and occupancy matter.",
        "Reading GPU results back on the CPU synchronously stalls the pipeline; use async readback and accept a frame or more of latency."
      ],
      "quiz": [
        {
          "q": "A profiler shows CPU main thread 14 ms and GPU 9 ms per frame, with VSync off. A teammate proposes cutting shader cost to save 3 ms on the GPU. What happens to the frame rate?",
          "options": [
            "It rises to about 83 fps because the frame is now GPU-limited at 12 ms",
            "It stays the same, since the CPU at 14 ms is the limiter",
            "It drops, because a faster GPU waits for the CPU more often",
            "It rises to about 100 fps as the GPU saves a third of its time"
          ],
          "answer": 1,
          "explain": "With CPU and GPU pipelined, frame time is the maximum of the two, here 14 ms, so GPU savings are invisible until the CPU improves. The first option confuses summing with taking the max."
        },
        {
          "q": "A 1440p scene is GPU-bound. Rendering at 50% resolution scale drops GPU time from 19 ms to 11 ms. What does this most strongly suggest?",
          "options": [
            "The vertex stage is the bottleneck, since vertex work shrinks with resolution",
            "The CPU is submitting too many draw calls",
            "The frame is limited by pixel work such as fragment shading, overdraw or bandwidth",
            "The GPU readback is stalling the CPU"
          ],
          "answer": 2,
          "explain": "Resolution changes the number of fragments, not vertices or draw calls, so a large time drop points to pixel-side cost. A vertex or CPU limit would show little change."
        },
        {
          "q": "A mid-frame call reads a render texture back to the CPU to compute average brightness. CPU time is 6 ms, GPU time is 14 ms, but the frame takes 20 ms. What is the best fix?",
          "options": [
            "Use an asynchronous readback and consume the result a few frames later",
            "Reduce the number of draw calls on the CPU thread",
            "Lower the texture resolution of every material in the scene",
            "Increase the number of frames buffered ahead on the display"
          ],
          "answer": 0,
          "explain": "The blocking readback forces the CPU to wait for the GPU, so the two stop overlapping and their times add (6 + 14 = 20). An async readback keeps them pipelined at the cost of a few frames of latency."
        },
        {
          "q": "A fragment shader needs many registers per thread and its texture fetches are slow. Why can it run slower than a longer shader with fewer registers?",
          "options": [
            "Each warp must run on its own dedicated core, so extra registers add warps",
            "More registers force the rasterizer to produce smaller quads",
            "Register use increases the draw-call overhead on the CPU",
            "Fewer warps fit per core, so there is less other work to switch to while memory loads wait"
          ],
          "answer": 3,
          "explain": "GPUs hide memory latency by switching to other resident warps, and registers limit how many can be resident. Registers do not change quad size or CPU draw-call cost."
        },
        {
          "q": "A scene is made of 2 million triangles, many smaller than one pixel, and the fragment stage is slow. What explains the waste?",
          "options": [
            "Pixels shade in 2x2 quads, so tiny triangles waste discarded lanes",
            "Each triangle forces its own separate draw call on the GPU",
            "Triangles under one pixel skip depth testing and so cause overdraw",
            "The vertex cache cannot hold more than one triangle at a time"
          ],
          "answer": 0,
          "explain": "Quad shading means a one-pixel triangle can still run four fragment invocations, so tiny geometry multiplies fragment cost. Triangle count alone does not create draw calls, and depth testing still applies."
        },
        {
          "q": "After an artist adds `clip(alpha - 0.5)` to the opaque foliage shader, GPU time jumps and a capture shows the same pixels now shaded many times, though draw order is unchanged. Which fix fits best?",
          "options": [
            "Sort all of the opaque draws strictly front to back by depth",
            "Add a depth prepass so early-Z rejects hidden pixels",
            "Enable occlusion culling for the foliage and its meshes",
            "Apply frustum culling to the foliage meshes each frame"
          ],
          "answer": 1,
          "explain": "`discard` forces the GPU to shade a fragment before it can finalise depth, so early-Z is lost. A depth prepass writes depth once, then the main pass shades only the nearest pixel; sorting alone does not help while early-Z is off."
        }
      ]
    },
    {
      "id": "graphics-shaders",
      "title": "Shaders",
      "minutes": 14,
      "summary": "Vertex, fragment and compute shaders in HLSL and GLSL, constant data, interpolation, divergence costs and the variant compilation problem.",
      "lesson": [
        {
          "type": "p",
          "text": "An artist sends you a toon-shaded character and asks for rim lighting, dissolve, fog, three quality levels and mobile support. A week later the build takes 40 minutes, the shader count is in the tens of thousands, and the first time the player enters the cave the game freezes for 300 ms. Shaders are tiny programs, but they determine your visuals, your frame time and, through compilation, your hitches and build times. This topic covers what they are, how they get their data, what each GPU stage does with them and where the cost hides."
        },
        {
          "type": "h",
          "text": "What a shader is"
        },
        {
          "type": "p",
          "text": "A **shader** is a program that runs on the GPU, written in a C-like language such as **HLSL** (Direct3D, and what Unity uses for authoring) or **GLSL** (OpenGL, Vulkan via SPIR-V), and compiled to hardware-specific machine code, often by the driver at runtime. Shaders are stateless functions: each invocation sees its inputs and produces outputs, and cannot call back into the CPU or read another invocation's local variables. That purity is what lets the GPU run thousands of them in parallel."
        },
        {
          "type": "list",
          "items": [
            "**Vertex shader**: once per vertex. Transforms object-space position to clip space, computes values to interpolate (world position, normal, UV, vertex colour). Also where skinning and vertex animation (wind, waves) run.",
            "**Fragment (pixel) shader**: once per covered pixel fragment. Samples textures, evaluates lighting and returns a colour (or several, for multiple render targets). Usually the bulk of shading cost, because pixels far outnumber vertices.",
            "**Compute shader**: no pipeline input. You dispatch a grid of thread groups; threads read and write buffers and textures freely. Used for culling, particle simulation, light binning, blur kernels, procedural generation. They can share fast on-chip memory (`groupshared`) within a group."
          ]
        },
        {
          "type": "code",
          "lang": "hlsl",
          "text": "// Minimal lit surface (HLSL). One vertex stage, one fragment stage.\ncbuffer PerMaterial : register(b0)\n{\n    float4 _Tint;\n    float  _Smoothness;\n};\ncbuffer PerFrame : register(b1)\n{\n    float4x4 _ViewProj;\n    float3   _LightDir;   // direction toward the light, normalized\n};\ncbuffer PerObject : register(b2) { float4x4 _Model; };\n\nTexture2D    _Albedo : register(t0);\nSamplerState _Samp   : register(s0);\n\nstruct VSIn  { float3 pos : POSITION; float3 nrm : NORMAL; float2 uv : TEXCOORD0; };\nstruct VSOut { float4 clip : SV_Position; float3 nrmW : TEXCOORD1; float2 uv : TEXCOORD0; };\n\nVSOut VS(VSIn i)\n{\n    VSOut o;\n    float4 world = mul(_Model, float4(i.pos, 1.0));   // w = 1: a point\n    o.clip = mul(_ViewProj, world);\n    o.nrmW = mul((float3x3)_Model, i.nrm);            // assumes uniform scale\n    o.uv   = i.uv;\n    return o;\n}\n\nfloat4 PS(VSOut i) : SV_Target\n{\n    float3 n = normalize(i.nrmW);                      // re-normalize after interpolation\n    float  ndl = saturate(dot(n, _LightDir));\n    float3 albedo = _Albedo.Sample(_Samp, i.uv).rgb * _Tint.rgb;\n    return float4(albedo * (0.1 + ndl), 1.0);\n}"
        },
        {
          "type": "h",
          "text": "Getting data in: uniforms and constant buffers"
        },
        {
          "type": "p",
          "text": "Per-draw and per-frame values reach the shader as **uniforms** in GLSL or **constant buffers** (cbuffers) in HLSL. The same value is seen by every invocation of that draw. Good practice is to group by update frequency: per-frame (camera matrices, time, light data), per-material (colours, parameters), per-object (model matrix). That way, changing an object's matrix does not re-upload the whole material block. Layout rules matter: constant buffers are packed in 16-byte rows (a `float3` followed by a `float` fits in one row, but a `float3` followed by a `float3` does not), and a mismatch between CPU struct and GPU layout yields garbage parameters, one of the most common silent bugs. Larger or random-access data goes in **structured buffers** or textures. Textures are read through samplers that define filtering (point, bilinear, trilinear, anisotropic) and wrapping."
        },
        {
          "type": "h",
          "text": "Interpolation"
        },
        {
          "type": "p",
          "text": "Vertex shader outputs are interpolated across the triangle, using barycentric weights of the three vertices, with perspective correction so that attributes vary evenly in 3D space and not in screen space. A normal interpolated between unit-length vertices is no longer unit length in the middle (it shrinks), so re-normalize in the fragment shader, as in the example above. Integer or flag values must use `nointerpolation` (HLSL) or `flat` (GLSL), or interpolation will mangle them. Another point: interpolators are limited and each costs bandwidth between stages, so pass only what the fragment stage needs and compute cheap or uniform things in the vertex shader (per vertex is far fewer invocations than per pixel when meshes are not tiny)."
        },
        {
          "type": "figure",
          "id": "graphics-interpolation",
          "caption": "Every fragment gets a barycentric blend of its three vertices' outputs; blending two unit normals gives a shorter vector, which is why the fragment shader re-normalizes.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 316\" role=\"img\" aria-label=\"Left: a triangle whose vertex colours blend across its surface while a fragment moves inside and its three barycentric weight bars change. Right: two unit vertex normals 90 degrees apart; the interpolated normal sweeping between them is only 0.71 long at the midpoint until it is normalized.\"><style>.graphics-interpolation-t{font-size:13px;fill:var(--fig-ink)}.graphics-interpolation-m{font-size:12px;fill:var(--fig-muted)}.graphics-interpolation-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-interpolation-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-interpolation-e{text-anchor:end}.graphics-interpolation-mid{text-anchor:middle}@keyframes graphics-interpolation-pt{0%,10%{transform:translate(0px,0px)}22%,32%{transform:translate(-67.1px,33.7px)}47%,57%{transform:translate(73.7px,20.5px)}72%,82%{transform:translate(-6.6px,-54.3px)}100%{transform:translate(0px,0px)}}.graphics-interpolation-pt{animation:graphics-interpolation-pt 8s infinite}@keyframes graphics-interpolation-w0{0%,10%{transform:scaleX(0.3333)}22%,32%{transform:scaleX(0.7)}47%,57%{transform:scaleX(0.15)}72%,82%{transform:scaleX(0.15)}100%{transform:scaleX(0.3333)}}.graphics-interpolation-w0{transform-box:view-box;transform-origin:64px 0px;transform:scaleX(0.333);animation:graphics-interpolation-w0 8s infinite}@keyframes graphics-interpolation-w1{0%,10%{transform:scaleX(0.3333)}22%,32%{transform:scaleX(0.15)}47%,57%{transform:scaleX(0.7)}72%,82%{transform:scaleX(0.15)}100%{transform:scaleX(0.3333)}}.graphics-interpolation-w1{transform-box:view-box;transform-origin:64px 0px;transform:scaleX(0.333);animation:graphics-interpolation-w1 8s infinite}@keyframes graphics-interpolation-w2{0%,10%{transform:scaleX(0.3333)}22%,32%{transform:scaleX(0.15)}47%,57%{transform:scaleX(0.15)}72%,82%{transform:scaleX(0.7)}100%{transform:scaleX(0.3333)}}.graphics-interpolation-w2{transform-box:view-box;transform-origin:64px 0px;transform:scaleX(0.333);animation:graphics-interpolation-w2 8s infinite}@keyframes graphics-interpolation-sh{0%{transform:translateX(0px) rotate(45.00deg) scaleY(1.000)}12%{transform:translateX(40px) rotate(26.57deg) scaleY(0.791)}20%,30%{transform:translateX(80px) rotate(0.00deg) scaleY(0.707)}38%{transform:translateX(120px) rotate(-26.57deg) scaleY(0.791)}50%{transform:translateX(160px) rotate(-45.00deg) scaleY(1.000)}62%{transform:translateX(120px) rotate(-26.57deg) scaleY(0.791)}70%,80%{transform:translateX(80px) rotate(0.00deg) scaleY(0.707)}88%{transform:translateX(40px) rotate(26.57deg) scaleY(0.791)}100%{transform:translateX(0px) rotate(45.00deg) scaleY(1.000)}}.graphics-interpolation-sh{transform-box:view-box;transform-origin:400px 236px;transform:translateX(80px) rotate(0.00deg) scaleY(0.707);animation:graphics-interpolation-sh 7s infinite}@keyframes graphics-interpolation-hd{0%{transform:translateX(0px) rotate(45.00deg) translateY(0px)}12%{transform:translateX(40px) rotate(26.57deg) translateY(20.9px)}20%,30%{transform:translateX(80px) rotate(0.00deg) translateY(29.3px)}38%{transform:translateX(120px) rotate(-26.57deg) translateY(20.9px)}50%{transform:translateX(160px) rotate(-45.00deg) translateY(0px)}62%{transform:translateX(120px) rotate(-26.57deg) translateY(20.9px)}70%,80%{transform:translateX(80px) rotate(0.00deg) translateY(29.3px)}88%{transform:translateX(40px) rotate(26.57deg) translateY(20.9px)}100%{transform:translateX(0px) rotate(45.00deg) translateY(0px)}}.graphics-interpolation-hd{transform-box:view-box;transform-origin:400px 236px;transform:translateX(80px) rotate(0.00deg) translateY(29.3px);animation:graphics-interpolation-hd 7s infinite}@keyframes graphics-interpolation-gh{0%{transform:translateX(0px) rotate(45.00deg)}12%{transform:translateX(40px) rotate(26.57deg)}20%,30%{transform:translateX(80px) rotate(0.00deg)}38%{transform:translateX(120px) rotate(-26.57deg)}50%{transform:translateX(160px) rotate(-45.00deg)}62%{transform:translateX(120px) rotate(-26.57deg)}70%,80%{transform:translateX(80px) rotate(0.00deg)}88%{transform:translateX(40px) rotate(26.57deg)}100%{transform:translateX(0px) rotate(45.00deg)}}.graphics-interpolation-gh{transform-box:view-box;transform-origin:400px 236px;transform:translateX(80px) rotate(0.00deg);animation:graphics-interpolation-gh 7s infinite}@keyframes graphics-interpolation-ar{0%{transform:translateX(0px)}12%{transform:translateX(40px)}20%,30%{transform:translateX(80px)}38%{transform:translateX(120px)}50%{transform:translateX(160px)}62%{transform:translateX(120px)}70%,80%{transform:translateX(80px)}88%{transform:translateX(40px)}100%{transform:translateX(0px)}}.graphics-interpolation-ar{transform-box:view-box;transform-origin:400px 236px;transform:translateX(80px);animation:graphics-interpolation-ar 7s infinite}</style><defs><linearGradient id=\"graphics-interpolation-g0\" gradientUnits=\"userSpaceOnUse\" x1=\"40\" y1=\"200\" x2=\"170.9\" y2=\"59.5\"><stop offset=\"0\" style=\"stop-color:var(--fig-accent);stop-opacity:1\"/><stop offset=\"1\" style=\"stop-color:var(--fig-accent);stop-opacity:0\"/></linearGradient><linearGradient id=\"graphics-interpolation-g1\" gradientUnits=\"userSpaceOnUse\" x1=\"296\" y1=\"176\" x2=\"133.4\" y2=\"64.2\"><stop offset=\"0\" style=\"stop-color:var(--fig-accent2);stop-opacity:1\"/><stop offset=\"1\" style=\"stop-color:var(--fig-accent2);stop-opacity:0\"/></linearGradient><linearGradient id=\"graphics-interpolation-g2\" gradientUnits=\"userSpaceOnUse\" x1=\"150\" y1=\"40\" x2=\"163.9\" y2=\"188.4\"><stop offset=\"0\" style=\"stop-color:var(--fig-warn);stop-opacity:1\"/><stop offset=\"1\" style=\"stop-color:var(--fig-warn);stop-opacity:0\"/></linearGradient></defs><text class=\"graphics-interpolation-h\" x=\"16\" y=\"22\">Vertex outputs blend across the triangle</text><polygon points=\"40,200 296,176 150,40\" fill=\"var(--fig-bg)\"/><polygon points=\"40,200 296,176 150,40\" fill=\"url(#graphics-interpolation-g0)\" fill-opacity=\"0.85\"/><polygon points=\"40,200 296,176 150,40\" fill=\"url(#graphics-interpolation-g1)\" fill-opacity=\"0.85\"/><polygon points=\"40,200 296,176 150,40\" fill=\"url(#graphics-interpolation-g2)\" fill-opacity=\"0.85\"/><polygon points=\"40,200 296,176 150,40\" fill=\"none\" stroke=\"var(--fig-ink)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><circle cx=\"40\" cy=\"200\" r=\"6\" fill=\"var(--fig-accent)\" stroke=\"var(--fig-bg)\" stroke-width=\"2\"/><text class=\"graphics-interpolation-t\" x=\"24\" y=\"218\" style=\"font-weight:600\">A</text><circle cx=\"296\" cy=\"176\" r=\"6\" fill=\"var(--fig-accent2)\" stroke=\"var(--fig-bg)\" stroke-width=\"2\"/><text class=\"graphics-interpolation-t\" x=\"306\" y=\"194\" style=\"font-weight:600\">B</text><circle cx=\"150\" cy=\"40\" r=\"6\" fill=\"var(--fig-warn)\" stroke=\"var(--fig-bg)\" stroke-width=\"2\"/><text class=\"graphics-interpolation-t\" x=\"160\" y=\"36\" style=\"font-weight:600\">C</text><g class=\"graphics-interpolation-pt\"><circle cx=\"162\" cy=\"138.7\" r=\"7\" fill=\"var(--fig-bg)\" stroke=\"var(--fig-ink)\" stroke-width=\"2.5\"/></g><text class=\"graphics-interpolation-m\" x=\"16\" y=\"248\">barycentric weights of the fragment</text><text class=\"graphics-interpolation-m\" x=\"40\" y=\"271\">A</text><rect x=\"64\" y=\"262\" width=\"220\" height=\"10\" rx=\"5\" fill=\"var(--fig-panel)\"/><rect class=\"graphics-interpolation-w0\" x=\"64\" y=\"262\" width=\"220\" height=\"10\" rx=\"5\" fill=\"var(--fig-accent)\"/><text class=\"graphics-interpolation-m\" x=\"40\" y=\"289\">B</text><rect x=\"64\" y=\"280\" width=\"220\" height=\"10\" rx=\"5\" fill=\"var(--fig-panel)\"/><rect class=\"graphics-interpolation-w1\" x=\"64\" y=\"280\" width=\"220\" height=\"10\" rx=\"5\" fill=\"var(--fig-accent2)\"/><text class=\"graphics-interpolation-m\" x=\"40\" y=\"307\">C</text><rect x=\"64\" y=\"298\" width=\"220\" height=\"10\" rx=\"5\" fill=\"var(--fig-panel)\"/><rect class=\"graphics-interpolation-w2\" x=\"64\" y=\"298\" width=\"220\" height=\"10\" rx=\"5\" fill=\"var(--fig-warn)\"/><line x1=\"328\" y1=\"14\" x2=\"328\" y2=\"310\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-interpolation-h\" x=\"348\" y=\"22\">Interpolated normals shrink</text><line x1=\"386\" y1=\"236\" x2=\"574\" y2=\"236\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/><g transform=\"rotate(45 400 236)\"><line x1=\"400\" y1=\"236\" x2=\"400\" y2=\"144\" stroke=\"var(--fig-ink)\" stroke-width=\"2.5\"/><polygon points=\"394,147 400,136 406,147\" fill=\"var(--fig-ink)\"/></g><g transform=\"rotate(-45 560 236)\"><line x1=\"560\" y1=\"236\" x2=\"560\" y2=\"144\" stroke=\"var(--fig-ink)\" stroke-width=\"2.5\"/><polygon points=\"554,147 560,136 566,147\" fill=\"var(--fig-ink)\"/></g><circle cx=\"400\" cy=\"236\" r=\"4\" fill=\"var(--fig-ink)\"/><circle cx=\"560\" cy=\"236\" r=\"4\" fill=\"var(--fig-ink)\"/><text class=\"graphics-interpolation-m graphics-interpolation-mid\" x=\"400\" y=\"258\">vertex normal</text><text class=\"graphics-interpolation-m graphics-interpolation-mid\" x=\"560\" y=\"258\">vertex normal</text><g class=\"graphics-interpolation-ar\"><path d=\"M329.3 165.3A100 100 0 0 1 470.7 165.3\" fill=\"none\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\" stroke-dasharray=\"2 5\"/></g><g class=\"graphics-interpolation-gh\"><line x1=\"400\" y1=\"236\" x2=\"400\" y2=\"144\" stroke=\"var(--fig-accent2)\" stroke-width=\"2\" stroke-dasharray=\"4 4\"/><polygon points=\"394,147 400,136 406,147\" fill=\"none\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/></g><line class=\"graphics-interpolation-sh\" x1=\"400\" y1=\"236\" x2=\"400\" y2=\"144\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><polygon class=\"graphics-interpolation-hd\" points=\"394,147 400,136 406,147\" fill=\"var(--fig-accent)\"/><line x1=\"348\" y1=\"276\" x2=\"368\" y2=\"276\" stroke=\"var(--fig-accent)\" stroke-width=\"3\"/><text class=\"graphics-interpolation-t\" x=\"376\" y=\"280\">interpolated: 0.71 long at the midpoint</text><line x1=\"348\" y1=\"298\" x2=\"368\" y2=\"298\" stroke=\"var(--fig-accent2)\" stroke-width=\"2\" stroke-dasharray=\"4 4\"/><text class=\"graphics-interpolation-t\" x=\"376\" y=\"302\">after normalize(): length 1</text></svg>"
        },
        {
          "type": "h",
          "text": "Branching and divergence"
        },
        {
          "type": "p",
          "text": "Because lanes in a warp share an instruction stream, an `if` has two possible costs. If every lane in the group takes the same side (a **uniform** or **coherent** branch, such as one depending on a uniform or a smoothly varying material mask), the GPU executes only that side. If lanes disagree (a **divergent** branch), the hardware executes **both** sides with lanes masked off, paying the sum of both paths. A loop whose trip count varies per lane runs until the longest lane finishes. Consequently, branching on a uniform constant to skip an expensive effect is great; branching per pixel on noisy data to save work often saves nothing, and a branch containing a texture sample can break mip selection because screen-space derivatives become undefined for lanes in non-uniform control flow (use an explicit-mip sample such as `SampleLevel`, or sample before the branch)."
        },
        {
          "type": "figure",
          "id": "graphics-warp-divergence",
          "caption": "When lanes disagree on a branch the warp runs both sides with lanes masked off and pays shadeA plus shadeB; a coherent warp pays for one side only.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 340\" role=\"img\" aria-label=\"Two warps of 32 lanes run the same if/else. In the divergent warp half the lanes are masked while shadeA runs and the other half while shadeB runs, so it pays 8 time units; the coherent warp skips shadeB and finishes in 5.\"><style>.graphics-warp-divergence-t{font-size:13px;fill:var(--fig-ink)}.graphics-warp-divergence-m{font-size:12px;fill:var(--fig-muted)}.graphics-warp-divergence-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-warp-divergence-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-warp-divergence-e{text-anchor:end}.graphics-warp-divergence-mid{text-anchor:middle}@keyframes graphics-warp-divergence-dact{0%,11.5%{opacity:1}13%,86.5%{opacity:0}88%,100%{opacity:1}}@keyframes graphics-warp-divergence-da{0%,11.5%{opacity:0}13%,49%{opacity:1}50.5%,100%{opacity:0}}@keyframes graphics-warp-divergence-db{0%,49%{opacity:0}50.5%,86.5%{opacity:1}88%,100%{opacity:0}}@keyframes graphics-warp-divergence-cact{0%,11.5%{opacity:1}13%,49%{opacity:0}50.5%,61.5%{opacity:1}63%,100%{opacity:0}}@keyframes graphics-warp-divergence-ca{0%,11.5%{opacity:0}13%,49%{opacity:1}50.5%,100%{opacity:0}}@keyframes graphics-warp-divergence-cdone{0%,61.5%{opacity:0}63%,100%{opacity:1}}@keyframes graphics-warp-divergence-hl{0%,12%{transform:translateY(0px)}12.5%,49.5%{transform:translateY(22px)}50%,87%{transform:translateY(66px)}87.5%,100%{transform:translateY(88px)}}@keyframes graphics-warp-divergence-pd{0%{transform:translateX(0px)}100%{transform:translateX(480px)}}@keyframes graphics-warp-divergence-pc{0%{transform:translateX(0px);opacity:1}62.5%{transform:translateX(300px);opacity:1}64%,100%{transform:translateX(300px);opacity:0}}.graphics-warp-divergence-dact{opacity:0;animation:graphics-warp-divergence-dact 8s infinite}.graphics-warp-divergence-da{opacity:1;animation:graphics-warp-divergence-da 8s infinite}.graphics-warp-divergence-db{opacity:0;animation:graphics-warp-divergence-db 8s infinite}.graphics-warp-divergence-cact{opacity:0;animation:graphics-warp-divergence-cact 8s infinite}.graphics-warp-divergence-ca{opacity:1;animation:graphics-warp-divergence-ca 8s infinite}.graphics-warp-divergence-cdone{opacity:0;animation:graphics-warp-divergence-cdone 8s infinite}.graphics-warp-divergence-hl{transform:translateY(22px);animation:graphics-warp-divergence-hl 8s infinite}.graphics-warp-divergence-pd{opacity:0;animation:graphics-warp-divergence-pd 8s linear infinite,graphics-warp-divergence-op 8s infinite}.graphics-warp-divergence-pc{opacity:0;animation:graphics-warp-divergence-pc 8s linear infinite}@keyframes graphics-warp-divergence-op{0%,100%{opacity:1}}.graphics-warp-divergence-code{font-size:13px;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre}</style><rect x=\"16\" y=\"14\" width=\"292\" height=\"122\" rx=\"10\" fill=\"var(--fig-panel)\"/><rect class=\"graphics-warp-divergence-hl\" x=\"20\" y=\"22\" width=\"284\" height=\"20\" rx=\"5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.16\"/><text class=\"graphics-warp-divergence-code\" x=\"30\" y=\"37\" xml:space=\"preserve\">if (noise(uv) > 0.5)</text><text class=\"graphics-warp-divergence-code\" x=\"30\" y=\"59\" xml:space=\"preserve\">    c = shadeA();</text><text class=\"graphics-warp-divergence-code\" x=\"30\" y=\"81\" xml:space=\"preserve\">else</text><text class=\"graphics-warp-divergence-code\" x=\"30\" y=\"103\" xml:space=\"preserve\">    c = shadeB();</text><text class=\"graphics-warp-divergence-code\" x=\"30\" y=\"125\" xml:space=\"preserve\">return c;</text><text class=\"graphics-warp-divergence-h\" x=\"330\" y=\"34\">32 lanes, one instruction stream</text><text class=\"graphics-warp-divergence-m\" x=\"330\" y=\"56\">A noisy mask splits the warp: the hardware</text><text class=\"graphics-warp-divergence-m\" x=\"330\" y=\"74\">runs shadeA with half the lanes masked off,</text><text class=\"graphics-warp-divergence-m\" x=\"330\" y=\"92\">then shadeB with the other half.</text><text class=\"graphics-warp-divergence-m\" x=\"330\" y=\"118\">A coherent warp runs one side only.</text><text class=\"graphics-warp-divergence-t\" x=\"24\" y=\"172\" style=\"font-weight:600\">Divergent warp: 16 lanes take each side</text><path d=\"M24 184h15v26h-15zM41.5 184h15v26h-15zM59 184h15v26h-15zM76.5 184h15v26h-15zM94 184h15v26h-15zM111.5 184h15v26h-15zM129 184h15v26h-15zM146.5 184h15v26h-15zM164 184h15v26h-15zM181.5 184h15v26h-15zM199 184h15v26h-15zM216.5 184h15v26h-15zM234 184h15v26h-15zM251.5 184h15v26h-15zM269 184h15v26h-15zM286.5 184h15v26h-15zM304 184h15v26h-15zM321.5 184h15v26h-15zM339 184h15v26h-15zM356.5 184h15v26h-15zM374 184h15v26h-15zM391.5 184h15v26h-15zM409 184h15v26h-15zM426.5 184h15v26h-15zM444 184h15v26h-15zM461.5 184h15v26h-15zM479 184h15v26h-15zM496.5 184h15v26h-15zM514 184h15v26h-15zM531.5 184h15v26h-15zM549 184h15v26h-15zM566.5 184h15v26h-15z\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><text class=\"graphics-warp-divergence-t\" x=\"24\" y=\"264\" style=\"font-weight:600\">Coherent warp: all 32 lanes take shadeA</text><path d=\"M24 276h15v26h-15zM41.5 276h15v26h-15zM59 276h15v26h-15zM76.5 276h15v26h-15zM94 276h15v26h-15zM111.5 276h15v26h-15zM129 276h15v26h-15zM146.5 276h15v26h-15zM164 276h15v26h-15zM181.5 276h15v26h-15zM199 276h15v26h-15zM216.5 276h15v26h-15zM234 276h15v26h-15zM251.5 276h15v26h-15zM269 276h15v26h-15zM286.5 276h15v26h-15zM304 276h15v26h-15zM321.5 276h15v26h-15zM339 276h15v26h-15zM356.5 276h15v26h-15zM374 276h15v26h-15zM391.5 276h15v26h-15zM409 276h15v26h-15zM426.5 276h15v26h-15zM444 276h15v26h-15zM461.5 276h15v26h-15zM479 276h15v26h-15zM496.5 276h15v26h-15zM514 276h15v26h-15zM531.5 276h15v26h-15zM549 276h15v26h-15zM566.5 276h15v26h-15z\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><path class=\"graphics-warp-divergence-dact\" d=\"M24 184h15v26h-15zM41.5 184h15v26h-15zM59 184h15v26h-15zM76.5 184h15v26h-15zM94 184h15v26h-15zM111.5 184h15v26h-15zM129 184h15v26h-15zM146.5 184h15v26h-15zM164 184h15v26h-15zM181.5 184h15v26h-15zM199 184h15v26h-15zM216.5 184h15v26h-15zM234 184h15v26h-15zM251.5 184h15v26h-15zM269 184h15v26h-15zM286.5 184h15v26h-15zM304 184h15v26h-15zM321.5 184h15v26h-15zM339 184h15v26h-15zM356.5 184h15v26h-15zM374 184h15v26h-15zM391.5 184h15v26h-15zM409 184h15v26h-15zM426.5 184h15v26h-15zM444 184h15v26h-15zM461.5 184h15v26h-15zM479 184h15v26h-15zM496.5 184h15v26h-15zM514 184h15v26h-15zM531.5 184h15v26h-15zM549 184h15v26h-15zM566.5 184h15v26h-15z\" fill=\"var(--fig-ink)\" fill-opacity=\"0.35\"/><path class=\"graphics-warp-divergence-da\" d=\"M76.5 184h15v26h-15zM94 184h15v26h-15zM111.5 184h15v26h-15zM129 184h15v26h-15zM146.5 184h15v26h-15zM181.5 184h15v26h-15zM234 184h15v26h-15zM321.5 184h15v26h-15zM339 184h15v26h-15zM356.5 184h15v26h-15zM374 184h15v26h-15zM409 184h15v26h-15zM461.5 184h15v26h-15zM496.5 184h15v26h-15zM549 184h15v26h-15zM566.5 184h15v26h-15z\" fill=\"var(--fig-accent)\"/><path class=\"graphics-warp-divergence-db\" d=\"M24 184h15v26h-15zM41.5 184h15v26h-15zM59 184h15v26h-15zM164 184h15v26h-15zM199 184h15v26h-15zM216.5 184h15v26h-15zM251.5 184h15v26h-15zM269 184h15v26h-15zM286.5 184h15v26h-15zM304 184h15v26h-15zM391.5 184h15v26h-15zM426.5 184h15v26h-15zM444 184h15v26h-15zM479 184h15v26h-15zM514 184h15v26h-15zM531.5 184h15v26h-15z\" fill=\"var(--fig-accent2)\"/><path class=\"graphics-warp-divergence-cact\" d=\"M24 276h15v26h-15zM41.5 276h15v26h-15zM59 276h15v26h-15zM76.5 276h15v26h-15zM94 276h15v26h-15zM111.5 276h15v26h-15zM129 276h15v26h-15zM146.5 276h15v26h-15zM164 276h15v26h-15zM181.5 276h15v26h-15zM199 276h15v26h-15zM216.5 276h15v26h-15zM234 276h15v26h-15zM251.5 276h15v26h-15zM269 276h15v26h-15zM286.5 276h15v26h-15zM304 276h15v26h-15zM321.5 276h15v26h-15zM339 276h15v26h-15zM356.5 276h15v26h-15zM374 276h15v26h-15zM391.5 276h15v26h-15zM409 276h15v26h-15zM426.5 276h15v26h-15zM444 276h15v26h-15zM461.5 276h15v26h-15zM479 276h15v26h-15zM496.5 276h15v26h-15zM514 276h15v26h-15zM531.5 276h15v26h-15zM549 276h15v26h-15zM566.5 276h15v26h-15z\" fill=\"var(--fig-ink)\" fill-opacity=\"0.35\"/><path class=\"graphics-warp-divergence-ca\" d=\"M24 276h15v26h-15zM41.5 276h15v26h-15zM59 276h15v26h-15zM76.5 276h15v26h-15zM94 276h15v26h-15zM111.5 276h15v26h-15zM129 276h15v26h-15zM146.5 276h15v26h-15zM164 276h15v26h-15zM181.5 276h15v26h-15zM199 276h15v26h-15zM216.5 276h15v26h-15zM234 276h15v26h-15zM251.5 276h15v26h-15zM269 276h15v26h-15zM286.5 276h15v26h-15zM304 276h15v26h-15zM321.5 276h15v26h-15zM339 276h15v26h-15zM356.5 276h15v26h-15zM374 276h15v26h-15zM391.5 276h15v26h-15zM409 276h15v26h-15zM426.5 276h15v26h-15zM444 276h15v26h-15zM461.5 276h15v26h-15zM479 276h15v26h-15zM496.5 276h15v26h-15zM514 276h15v26h-15zM531.5 276h15v26h-15zM549 276h15v26h-15zM566.5 276h15v26h-15z\" fill=\"var(--fig-accent)\"/><path class=\"graphics-warp-divergence-cdone\" d=\"M24 276h15v26h-15zM41.5 276h15v26h-15zM59 276h15v26h-15zM76.5 276h15v26h-15zM94 276h15v26h-15zM111.5 276h15v26h-15zM129 276h15v26h-15zM146.5 276h15v26h-15zM164 276h15v26h-15zM181.5 276h15v26h-15zM199 276h15v26h-15zM216.5 276h15v26h-15zM234 276h15v26h-15zM251.5 276h15v26h-15zM269 276h15v26h-15zM286.5 276h15v26h-15zM304 276h15v26h-15zM321.5 276h15v26h-15zM339 276h15v26h-15zM356.5 276h15v26h-15zM374 276h15v26h-15zM391.5 276h15v26h-15zM409 276h15v26h-15zM426.5 276h15v26h-15zM444 276h15v26h-15zM461.5 276h15v26h-15zM479 276h15v26h-15zM496.5 276h15v26h-15zM514 276h15v26h-15zM531.5 276h15v26h-15zM549 276h15v26h-15zM566.5 276h15v26h-15z\" fill=\"var(--fig-ok)\" fill-opacity=\"0.25\"/><rect x=\"24\" y=\"218\" width=\"58\" height=\"18\" rx=\"5\" fill=\"var(--fig-muted)\" fill-opacity=\"0.22\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"graphics-warp-divergence-m graphics-warp-divergence-mid\" x=\"53\" y=\"231.5\" style=\"font-size:11.5px\">cond</text><rect x=\"84\" y=\"218\" width=\"178\" height=\"18\" rx=\"5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-warp-divergence-m graphics-warp-divergence-mid\" x=\"173\" y=\"231.5\" style=\"font-size:11.5px\">shadeA</text><rect x=\"264\" y=\"218\" width=\"178\" height=\"18\" rx=\"5\" fill=\"var(--fig-accent2)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent2)\" stroke-width=\"1.5\"/><text class=\"graphics-warp-divergence-m graphics-warp-divergence-mid\" x=\"353\" y=\"231.5\" style=\"font-size:11.5px\">shadeB</text><rect x=\"444\" y=\"218\" width=\"58\" height=\"18\" rx=\"5\" fill=\"var(--fig-muted)\" fill-opacity=\"0.22\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"graphics-warp-divergence-m graphics-warp-divergence-mid\" x=\"473\" y=\"231.5\" style=\"font-size:11.5px\">ret</text><text class=\"graphics-warp-divergence-t\" x=\"512\" y=\"231\" style=\"font-weight:600\">8 units</text><rect x=\"24\" y=\"310\" width=\"58\" height=\"18\" rx=\"5\" fill=\"var(--fig-muted)\" fill-opacity=\"0.22\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"graphics-warp-divergence-m graphics-warp-divergence-mid\" x=\"53\" y=\"323.5\" style=\"font-size:11.5px\">cond</text><rect x=\"84\" y=\"310\" width=\"178\" height=\"18\" rx=\"5\" fill=\"var(--fig-accent)\" fill-opacity=\"0.22\" stroke=\"var(--fig-accent)\" stroke-width=\"1.5\"/><text class=\"graphics-warp-divergence-m graphics-warp-divergence-mid\" x=\"173\" y=\"323.5\" style=\"font-size:11.5px\">shadeA</text><rect x=\"264\" y=\"310\" width=\"58\" height=\"18\" rx=\"5\" fill=\"var(--fig-muted)\" fill-opacity=\"0.22\" stroke=\"var(--fig-muted)\" stroke-width=\"1.5\"/><text class=\"graphics-warp-divergence-m graphics-warp-divergence-mid\" x=\"293\" y=\"323.5\" style=\"font-size:11.5px\">ret</text><text class=\"graphics-warp-divergence-t\" x=\"332\" y=\"323\" style=\"font-weight:600;fill:var(--fig-ok)\">5 units, warp free</text><line class=\"graphics-warp-divergence-pd\" x1=\"24\" y1=\"180\" x2=\"24\" y2=\"240\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/><line class=\"graphics-warp-divergence-pc\" x1=\"24\" y1=\"272\" x2=\"24\" y2=\"332\" stroke=\"var(--fig-ink)\" stroke-width=\"2\"/></svg>"
        },
        {
          "type": "list",
          "items": [
            "Prefer arithmetic selection (`lerp`, `step`, `saturate`) for cheap choices; both sides of tiny branches cost little.",
            "Hoist work that does not depend on the lane to the vertex shader or the CPU.",
            "Texture fetches dominate: 8 samples for a blur at 4K can cost more than 100 ALU instructions. Reduce taps, use lower mips, or use half resolution.",
            "On mobile GPUs, `half` precision lowers register use and power; on desktop it may be ignored."
          ]
        },
        {
          "type": "h",
          "text": "Shader variants and compilation stalls"
        },
        {
          "type": "p",
          "text": "To support options (fog, normal maps, shadow modes, quality levels) the usual technique is **compile-time keywords** (`#pragma multi_compile` and `shader_feature` in Unity, `#define`s elsewhere) that produce a separate compiled shader per combination. Variants multiply: 10 independent on/off keywords create 2^10 = 1,024 variants for a single pass. A handful of shaders with several keyword groups easily produce tens of thousands of compiled programs. Costs: long build and import times, huge memory for the shader binaries, and a **runtime compile hitch** when a variant is first needed and was not compiled or cached ahead of time. Modern APIs (D3D12, Vulkan, Metal) compile your shader plus the complete pipeline state into a **pipeline state object (PSO)** at first use, and building one can take from a few milliseconds to hundreds of milliseconds, which shows up as a freeze when new effects first appear on screen."
        },
        {
          "type": "figure",
          "id": "graphics-shader-variants",
          "caption": "Each independent on/off keyword doubles the compiled programs: 10 keywords make 2^10 = 1,024 variants for one pass, while the worked example drops from 288 to 36 by moving three features to uniform branches.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 404\" role=\"img\" aria-label=\"Ten on/off keyword toggles switch on one by one while a grid of compiled variants doubles each time, from 1 to 1,024. Below, to scale, the worked example: 288 variants per pass, cut to 36 by turning three keywords into uniform branches.\"><style>.graphics-shader-variants-t{font-size:13px;fill:var(--fig-ink)}.graphics-shader-variants-m{font-size:12px;fill:var(--fig-muted)}.graphics-shader-variants-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.graphics-shader-variants-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.graphics-shader-variants-e{text-anchor:end}.graphics-shader-variants-mid{text-anchor:middle}.graphics-shader-variants-kw{font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--fig-ink)}.graphics-shader-variants-big{font-size:26px;font-weight:700;fill:var(--fig-accent)}@keyframes graphics-shader-variants-k0{0%,7.5%{opacity:0}9%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k0{animation:graphics-shader-variants-k0 8s infinite}@keyframes graphics-shader-variants-k1{0%,15%{opacity:0}16.5%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k1{animation:graphics-shader-variants-k1 8s infinite}@keyframes graphics-shader-variants-k2{0%,22.5%{opacity:0}24%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k2{animation:graphics-shader-variants-k2 8s infinite}@keyframes graphics-shader-variants-k3{0%,30%{opacity:0}31.5%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k3{animation:graphics-shader-variants-k3 8s infinite}@keyframes graphics-shader-variants-k4{0%,37.5%{opacity:0}39%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k4{animation:graphics-shader-variants-k4 8s infinite}@keyframes graphics-shader-variants-k5{0%,45%{opacity:0}46.5%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k5{animation:graphics-shader-variants-k5 8s infinite}@keyframes graphics-shader-variants-k6{0%,52.5%{opacity:0}54%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k6{animation:graphics-shader-variants-k6 8s infinite}@keyframes graphics-shader-variants-k7{0%,60%{opacity:0}61.5%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k7{animation:graphics-shader-variants-k7 8s infinite}@keyframes graphics-shader-variants-k8{0%,67.5%{opacity:0}69%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k8{animation:graphics-shader-variants-k8 8s infinite}@keyframes graphics-shader-variants-k9{0%,75%{opacity:0}76.5%,95%{opacity:1}100%{opacity:0}}.graphics-shader-variants-k9{animation:graphics-shader-variants-k9 8s infinite}@keyframes graphics-shader-variants-g0{0%,7.5%{opacity:1}8%,95%{opacity:0}95.5%,100%{opacity:1}}.graphics-shader-variants-g0{opacity:0;animation:graphics-shader-variants-g0 8s infinite}@keyframes graphics-shader-variants-g1{0%,7.5%{opacity:0}8%,15%{opacity:1}15.5%,100%{opacity:0}}.graphics-shader-variants-g1{opacity:0;animation:graphics-shader-variants-g1 8s infinite}@keyframes graphics-shader-variants-g2{0%,15%{opacity:0}15.5%,22.5%{opacity:1}23%,100%{opacity:0}}.graphics-shader-variants-g2{opacity:0;animation:graphics-shader-variants-g2 8s infinite}@keyframes graphics-shader-variants-g3{0%,22.5%{opacity:0}23%,30%{opacity:1}30.5%,100%{opacity:0}}.graphics-shader-variants-g3{opacity:0;animation:graphics-shader-variants-g3 8s infinite}@keyframes graphics-shader-variants-g4{0%,30%{opacity:0}30.5%,37.5%{opacity:1}38%,100%{opacity:0}}.graphics-shader-variants-g4{opacity:0;animation:graphics-shader-variants-g4 8s infinite}@keyframes graphics-shader-variants-g5{0%,37.5%{opacity:0}38%,45%{opacity:1}45.5%,100%{opacity:0}}.graphics-shader-variants-g5{opacity:0;animation:graphics-shader-variants-g5 8s infinite}@keyframes graphics-shader-variants-g6{0%,45%{opacity:0}45.5%,52.5%{opacity:1}53%,100%{opacity:0}}.graphics-shader-variants-g6{opacity:0;animation:graphics-shader-variants-g6 8s infinite}@keyframes graphics-shader-variants-g7{0%,52.5%{opacity:0}53%,60%{opacity:1}60.5%,100%{opacity:0}}.graphics-shader-variants-g7{opacity:0;animation:graphics-shader-variants-g7 8s infinite}@keyframes graphics-shader-variants-g8{0%,60%{opacity:0}60.5%,67.5%{opacity:1}68%,100%{opacity:0}}.graphics-shader-variants-g8{opacity:0;animation:graphics-shader-variants-g8 8s infinite}@keyframes graphics-shader-variants-g9{0%,67.5%{opacity:0}68%,75%{opacity:1}75.5%,100%{opacity:0}}.graphics-shader-variants-g9{opacity:0;animation:graphics-shader-variants-g9 8s infinite}@keyframes graphics-shader-variants-g10{0%,75%{opacity:0}75.5%,95%{opacity:1}95.5%,100%{opacity:0}}.graphics-shader-variants-g10{opacity:1;animation:graphics-shader-variants-g10 8s infinite}</style><defs><pattern id=\"graphics-shader-variants-cell\" x=\"250\" y=\"44\" width=\"8\" height=\"8\" patternUnits=\"userSpaceOnUse\"><rect x=\"0.75\" y=\"0.75\" width=\"6.5\" height=\"6.5\" rx=\"1.5\" fill=\"var(--fig-accent)\"/></pattern></defs><text class=\"graphics-shader-variants-h\" x=\"24\" y=\"28\">Keywords, one pass</text><text class=\"graphics-shader-variants-h\" x=\"250\" y=\"28\">Compiled variants</text><rect x=\"24\" y=\"44\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"53\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k0\"><rect x=\"24\" y=\"44\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"53\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"57.5\">FOG</text><rect x=\"24\" y=\"70\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"79\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k1\"><rect x=\"24\" y=\"70\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"79\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"83.5\">NORMAL_MAP</text><rect x=\"24\" y=\"96\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"105\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k2\"><rect x=\"24\" y=\"96\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"105\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"109.5\">EMISSION</text><rect x=\"24\" y=\"122\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"131\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k3\"><rect x=\"24\" y=\"122\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"131\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"135.5\">RIM</text><rect x=\"24\" y=\"148\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"157\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k4\"><rect x=\"24\" y=\"148\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"157\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"161.5\">DISSOLVE</text><rect x=\"24\" y=\"174\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"183\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k5\"><rect x=\"24\" y=\"174\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"183\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"187.5\">SOFT_SHADOWS</text><rect x=\"24\" y=\"200\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"209\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k6\"><rect x=\"24\" y=\"200\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"209\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"213.5\">LIGHTMAP</text><rect x=\"24\" y=\"226\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"235\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k7\"><rect x=\"24\" y=\"226\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"235\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"239.5\">REFLECTION</text><rect x=\"24\" y=\"252\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"261\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k8\"><rect x=\"24\" y=\"252\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"261\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"265.5\">DETAIL_MAP</text><rect x=\"24\" y=\"278\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-panel)\" stroke=\"var(--fig-line)\" stroke-width=\"1.5\"/><circle cx=\"33\" cy=\"287\" r=\"6\" fill=\"var(--fig-muted)\" fill-opacity=\"0.6\"/><g class=\"graphics-shader-variants-k9\"><rect x=\"24\" y=\"278\" width=\"34\" height=\"18\" rx=\"9\" fill=\"var(--fig-accent)\"/><circle cx=\"49\" cy=\"287\" r=\"6\" fill=\"var(--fig-bg)\"/></g><text class=\"graphics-shader-variants-kw\" x=\"68\" y=\"291.5\">ALPHA_CLIP</text><g class=\"graphics-shader-variants-g0\"><rect x=\"250\" y=\"44\" width=\"8\" height=\"8\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">1</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^0</text></g><g class=\"graphics-shader-variants-g1\"><rect x=\"250\" y=\"44\" width=\"16\" height=\"8\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">2</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^1</text></g><g class=\"graphics-shader-variants-g2\"><rect x=\"250\" y=\"44\" width=\"16\" height=\"16\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">4</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^2</text></g><g class=\"graphics-shader-variants-g3\"><rect x=\"250\" y=\"44\" width=\"32\" height=\"16\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">8</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^3</text></g><g class=\"graphics-shader-variants-g4\"><rect x=\"250\" y=\"44\" width=\"32\" height=\"32\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">16</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^4</text></g><g class=\"graphics-shader-variants-g5\"><rect x=\"250\" y=\"44\" width=\"64\" height=\"32\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">32</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^5</text></g><g class=\"graphics-shader-variants-g6\"><rect x=\"250\" y=\"44\" width=\"64\" height=\"64\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">64</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^6</text></g><g class=\"graphics-shader-variants-g7\"><rect x=\"250\" y=\"44\" width=\"128\" height=\"64\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">128</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^7</text></g><g class=\"graphics-shader-variants-g8\"><rect x=\"250\" y=\"44\" width=\"128\" height=\"128\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">256</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^8</text></g><g class=\"graphics-shader-variants-g9\"><rect x=\"250\" y=\"44\" width=\"256\" height=\"128\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">512</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^9</text></g><g class=\"graphics-shader-variants-g10\"><rect x=\"250\" y=\"44\" width=\"256\" height=\"256\" fill=\"url(#graphics-shader-variants-cell)\"/><text class=\"graphics-shader-variants-big\" x=\"524\" y=\"78\">1,024</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"100\">= 2^10</text></g><rect x=\"249\" y=\"43\" width=\"258\" height=\"258\" rx=\"3\" fill=\"none\" stroke=\"var(--fig-line)\" stroke-width=\"1\"/><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"134\">variants for</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"150\">a single pass</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"184\">each square is</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"200\">one compiled</text><text class=\"graphics-shader-variants-m\" x=\"524\" y=\"216\">program</text><text class=\"graphics-shader-variants-h\" x=\"24\" y=\"340\">Worked example, per pass (1 px = 1 variant)</text><rect x=\"24\" y=\"352\" width=\"288\" height=\"16\" rx=\"4\" fill=\"var(--fig-bad)\" fill-opacity=\"0.75\"/><text class=\"graphics-shader-variants-t\" x=\"322\" y=\"365\">288 with every feature as a keyword</text><rect x=\"24\" y=\"378\" width=\"36\" height=\"16\" rx=\"4\" fill=\"var(--fig-ok)\" fill-opacity=\"0.85\"/><text class=\"graphics-shader-variants-t\" x=\"70\" y=\"391\">36 after rim, emission, dissolve become uniform branches</text></svg>"
        },
        {
          "type": "p",
          "text": "Mitigations: strip variants your project never uses (`shader_feature` drops unreferenced variants from builds, `multi_compile` keeps all of them, so use it only where runtime switching is necessary); replace rarely used keywords with runtime branches on uniforms when the branch is coherent and cheap; **warm up** shaders and PSOs during loading screens (in Unity, `ShaderVariantCollection.WarmUp`, and in recent Unity 6 releases `GraphicsStateCollection` for recording and prewarming PSOs); ship precompiled caches where the platform allows; and keep a budget for keywords per shader."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Dynamic branch on a uniform versus a keyword: a coherent runtime `if (_UseFog > 0.5)` costs a few cycles per pixel and creates no extra variants; a keyword doubles variants but gives the leanest code. For features toggled rarely and cheap to evaluate, prefer the runtime branch; for heavy features (parallax mapping, many-light loops), prefer keywords."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents write plausible HLSL and GLSL but mix them up (using `vec3` and `mix` in HLSL, `float4x4` and `mul` in GLSL), ignore constant buffer packing, and add a keyword for every request, which explodes variant counts. Say which language, graphics API and render pipeline the shader targets, and ask for the keyword count and variant math in the change. Verify by compiling for all target platforms, checking the build's variant count, checking for per-pixel divergent branches around texture samples, and capturing a frame in the GPU profiler. Treat any agent-written post-process that loops 32 or 64 taps per pixel with suspicion."
        },
        {
          "type": "h",
          "text": "Worked example: variant budget"
        },
        {
          "type": "p",
          "text": "A team's character shader has keywords for normal map, emission, rim, dissolve, two fog modes (mutually exclusive), three shadow qualities, and one for each of two platforms' lighting modes. Naively that is 2 x 2 x 2 x 2 x 3 x 3 x 2 = 288 variants per pass, times 3 passes (forward, shadow, depth) about 864, before any engine-provided keyword sets such as fog or lightmap options multiply it again. Converting rim, emission and dissolve to uniform-driven branches (coherent per material) leaves 2 x 3 x 3 x 2 = 36 per pass: an 8x reduction in compile time and memory with a measured GPU cost under 0.1 ms."
        },
        {
          "type": "h",
          "text": "Pitfalls checklist"
        },
        {
          "type": "list",
          "items": [
            "Forgetting to re-normalize interpolated normals and view vectors.",
            "Dividing by zero or taking sqrt, pow or log of negative values: NaN pixels bleed into bloom and TAA over many frames.",
            "Branching on per-pixel data around `Sample` calls.",
            "Per-frame variant explosion from one keyword per feature.",
            "Assuming warmup happened: test the first-use path on a clean cache on real hardware."
          ]
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "The fragment shader computes a value that varies linearly across the triangle, such as a fog factor or a scaled UV",
              "use": "Move work from fragment to vertex shader",
              "why": "Vertices are far fewer than pixels, and interpolation delivers the result for free. Only for values that are linear across a triangle; per-pixel lighting detail gets lost."
            },
            {
              "signal": "An `if` on per-pixel data like noise or a texture value saves nothing in profiles",
              "use": "Branch on uniforms, not per-pixel data",
              "why": "A divergent warp runs both paths. Branch on material or per-draw constants, or use branchless `lerp`/`step` for small bodies; coherent per-pixel branches over large areas can still pay off."
            },
            {
              "signal": "A texture fetch sits inside a per-pixel branch and edge pixels show blocky mip artefacts",
              "use": "Sample outside divergent branches",
              "why": "Implicit derivatives are undefined when neighbouring pixels in a quad take different paths. Sample before the branch, or pass explicit gradients or a mip level."
            },
            {
              "signal": "A shader declares many independent `multi_compile` keywords and builds are slow and memory heavy",
              "use": "Variant budget: fewer keywords plus stripping",
              "why": "Variants multiply per keyword. Use `shader_feature` for material-only toggles, strip unused combinations in builds, and move cheap toggles to uniform branches."
            },
            {
              "signal": "The game freezes once, for a few hundred ms, the first time a new effect or material appears",
              "use": "Shader and pipeline warm-up",
              "why": "The driver compiles the variant or pipeline state on first use. Collect the variants actually used and precompile them during loading; costs load time and needs maintaining."
            },
            {
              "signal": "A fragment shader evaluates an expensive function of one or two inputs every pixel, like a BRDF term or colour curve",
              "use": "Precompute into a lookup texture",
              "why": "Bake the function into a small 1D/2D/3D texture and sample it. Trades ALU for a fetch and memory, and loses precision between texels, so it suits smooth functions."
            },
            {
              "signal": "The CPU uploads tightly packed floats but the shader reads the second `float3` from the wrong offset",
              "use": "Pack constants to 16-byte rows",
              "why": "Constant buffers align fields to 16-byte rows. Lay out data as `float4` groups or add explicit padding so CPU and GPU structs match exactly."
            },
            {
              "signal": "Per-object, per-material and per-frame constants are all uploaded together in one buffer every draw",
              "use": "Group constants by update frequency",
              "why": "Separate per-frame, per-material and per-draw buffers so each is uploaded only when it changes, reducing bandwidth and binding cost on the CPU."
            },
            {
              "signal": "Lighting looks darker in the middle of large triangles even though vertex normals are unit length",
              "use": "Renormalise interpolated vectors",
              "why": "Linear interpolation of unit vectors shortens them between vertices. Call `normalize` in the fragment shader; one cheap instruction per pixel."
            },
            {
              "signal": "An integer material ID or index passed to the fragment stage gets blended into garbage between vertices",
              "use": "Flat (nointerpolation) attributes",
              "why": "Mark the attribute `nointerpolation` so every fragment gets the provoking vertex's value. Requires all vertices of the triangle to carry the same ID."
            },
            {
              "signal": "Thousands of independent elements (particles, culling, simulation) are updated in a C# loop each frame",
              "use": "Move data-parallel work to a compute shader",
              "why": "The GPU processes elements in parallel and the data stays on the GPU for rendering. Reading results back costs latency; the gain needs many elements and little branching."
            }
          ]
        }
      ],
      "keyPoints": [
        "Vertex shaders run per vertex and output clip space plus attributes; fragment shaders run per pixel and dominate cost; compute shaders run user-defined thread groups with no pipeline input.",
        "Constant buffers carry per-draw data in 16-byte packed rows; group them by update frequency and match CPU and GPU layouts exactly.",
        "Attributes are interpolated with perspective correction; renormalize vectors in the fragment shader and mark integers as flat or nointerpolation.",
        "Divergent branches run both paths for a warp, and branching around texture sampling can break derivatives; uniform branches are cheap.",
        "Keyword variants multiply exponentially and uncompiled ones cause first-use hitches; strip, reduce and warm them up."
      ],
      "quiz": [
        {
          "q": "A fragment shader has `if (noise(uv) > 0.5) { expensiveEffect(); }` and noise varies per pixel. Profiling shows no savings versus always running the effect. Why?",
          "options": [
            "Constant buffers are re-uploaded each time a branch is taken",
            "Interpolation is disabled inside any conditional code block",
            "The compiler removes the branch and always runs the effect",
            "Lanes in a warp disagree, so the effect runs masked for the group"
          ],
          "answer": 3,
          "explain": "When lanes in a warp diverge, the group still executes the expensive path for any lane that needs it, so the saving disappears. A branch that is coherent across neighbouring pixels (such as one on a uniform) would skip the work."
        },
        {
          "q": "A shader has 12 independent boolean keywords compiled with multi_compile. The build is slow and memory heavy. Which change gives the largest reduction for the least GPU cost?",
          "options": [
            "Warm up every variant during the loading screen at startup",
            "Turn keywords for cheap per-material features into uniform branches",
            "Change the keywords from multi_compile to multi_compile_local",
            "Move each keyword's code path into a separate shader pass"
          ],
          "answer": 1,
          "explain": "Twelve independent keywords means up to 4,096 variants; making cheap coherent features runtime branches removes factors of two each. Warmup hides runtime hitches but still compiles and stores every variant, local keywords save global keyword slots without reducing combinations, and extra passes add variants rather than removing them."
        },
        {
          "q": "A player enters a new area and the game freezes for about 200 ms the first time a particle effect appears, never again afterwards. What is the most likely cause and fix?",
          "options": [
            "Constant buffer packing is wrong, so recompile with fewer fields",
            "A shader variant or pipeline state is compiled on first use; warm it up during loading",
            "The effect has too many vertices; reduce the triangle count of the mesh",
            "The vertex shader runs per pixel; move it to the fragment stage"
          ],
          "answer": 1,
          "explain": "A one-time hitch at first appearance is the signature of lazy shader or pipeline compilation, solved by precompiling or warming up in a loading screen. Geometry cost would repeat every frame the effect is visible."
        },
        {
          "q": "A cbuffer declares `float3 _Color;` followed by `float3 _Offset;`. The CPU uploads a tightly packed struct of six floats, yet the shader reads a wrong offset. What is the likely issue?",
          "options": [
            "Constant buffers cannot hold more than one float3 field",
            "The GPU applies perspective correction to cbuffer fields",
            "CPU and GPU disagree about 16-byte packing, shifting the offset",
            "Uniform values must be normalized before every upload"
          ],
          "answer": 2,
          "explain": "HLSL packs values into 16-byte rows and does not let a float3 straddle a row boundary, so a CPU struct without matching padding shifts later fields. Perspective correction applies to interpolators only, not constants."
        },
        {
          "q": "A vertex shader passes a unit-length normal to the fragment stage. A lighting artifact shows darker shading in the middle of large triangles. What is the correct fix?",
          "options": [
            "Normalize the interpolated normal in the fragment shader",
            "Pass the normal as nointerpolation so it is constant per triangle",
            "Compute the normal from the clip-space position instead",
            "Multiply the dot product by the triangle's area"
          ],
          "answer": 0,
          "explain": "Linear interpolation between unit vectors yields shorter vectors in the middle of a triangle, darkening the dot product; renormalizing restores unit length. Making it flat would give faceted shading instead of smooth."
        },
        {
          "q": "A post-process fragment shader evaluates an expensive filmic colour curve with several `pow` and `exp` calls on a single input value for every pixel, and the pass is ALU-bound. What should you reach for?",
          "options": [
            "Move the curve evaluation into the vertex shader for each vertex",
            "Precompute the curve into a small lookup texture and sample it",
            "Branch on a uniform so the curve is skipped sometimes",
            "Mark the input value as a flat, non-interpolated attribute"
          ],
          "answer": 1,
          "explain": "A 1D lookup replaces many ALU ops with one texture fetch for any function of one or two inputs. The vertex shader trick only works for values that vary linearly, and a non-linear curve interpolated across a triangle would be wrong."
        }
      ]
    },
    {
      "id": "graphics-textures-sampling",
      "title": "Textures and sampling",
      "minutes": 12,
      "summary": "How a GPU turns UV coordinates into colours: texels, filtering, mipmaps, compression formats, atlases and colour space.",
      "lesson": [
        {
          "type": "p",
          "text": "Your artist delivers a 4096x4096 rock texture. It looks gorgeous in the editor, shimmers like static when the camera slides along the ground, and on a mid-range phone it takes 64 MB of memory and a visible chunk of your frame time. Every one of those symptoms is a texture-sampling problem. Textures are not pictures to the GPU. They are 1D, 2D or 3D arrays of data that shaders read from, and nearly all of the memory and bandwidth in a typical game goes into them."
        },
        {
          "type": "h",
          "text": "UVs, texels and the sampler"
        },
        {
          "type": "p",
          "text": "A **texel** is one element of a texture (a pixel of the texture, as opposed to a pixel on screen). A mesh vertex stores a **UV** coordinate, normally in the range 0 to 1 across the image. The rasteriser interpolates UVs across each triangle, and for every screen pixel the fragment shader calls something like `tex.Sample(sampler, uv)`. The UV is a continuous position, so the hardware has to decide which texels to read and how to combine them. That decision is the **sampler state**: filter mode (point, bilinear, trilinear), wrap mode (repeat, clamp, mirror) and anisotropy level. Sampler state is separate from texture data in modern APIs, which is why one texture can be sampled in several ways."
        },
        {
          "type": "p",
          "text": "Two numbers describe the mismatch that makes sampling hard. A texture has a fixed texel size, and a triangle on screen has a variable pixel size. If a 1024-texel-wide texture covers 256 screen pixels, each pixel spans 4 texels (minification). If it covers 4000 pixels, each texel spans about 4 pixels (magnification). The GPU computes UV derivatives between neighbouring pixels in a 2x2 quad (`ddx(uv)`, `ddy(uv)`) to know which situation it is in. This is also why sampling inside divergent branches or after discards can produce wrong mip selection: the quad needs all four lanes to compute derivatives."
        },
        {
          "type": "h",
          "text": "Filtering and mipmaps"
        },
        {
          "type": "p",
          "text": "**Point** filtering returns the nearest texel: blocky when magnified, and noisy when minified because a pixel that should be an average of 16 texels picks one arbitrary texel, which flickers as the camera moves. **Bilinear** filtering blends the four nearest texels and fixes the magnified case. It does not fix minification, because four texels cannot represent the average of sixteen or sixty-four."
        },
        {
          "type": "figure",
          "id": "graphics-bilinear-weights",
          "caption": "Point filtering snaps to whichever texel is nearest, while bilinear weights all four by how much a one-texel box around the UV overlaps each.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"A 2 by 2 block of texels with a sample point moving between their centres. Point filtering jumps to the nearest texel value while bilinear filtering blends all four with weights equal to the overlap of a one-texel box around the sample.\"><style>.graphics-bilinear-weights-t{font-size:13px;fill:var(--fig-ink)} .graphics-bilinear-weights-m{font-size:13px;fill:var(--fig-muted)} .graphics-bilinear-weights-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-bilinear-weights-mid{text-anchor:middle} .graphics-bilinear-weights-end{text-anchor:end} .graphics-bilinear-weights-mono{font-family:ui-monospace,Menlo,monospace} .graphics-bilinear-weights-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-bilinear-weights-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-bilinear-weights-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-bilinear-weights-tx{stroke:var(--fig-line);stroke-width:1.5;fill:var(--fig-accent)} .graphics-bilinear-weights-c{fill:var(--fig-muted)} .graphics-bilinear-weights-fp{fill:var(--fig-accent2);fill-opacity:.14;stroke:var(--fig-ink);stroke-width:1.5;stroke-dasharray:5 4} .graphics-bilinear-weights-dot{fill:var(--fig-accent2)} .graphics-bilinear-weights-mv{animation:graphics-bilinear-weights-mv 8s linear infinite} @keyframes graphics-bilinear-weights-mv{0%{transform:translate(0,0)}25%{transform:translate(50px,0)}50%{transform:translate(50px,50px)}75%{transform:translate(0,50px)}100%{transform:translate(0,0)}} .graphics-bilinear-weights-trk{fill:var(--fig-line);fill-opacity:.35} .graphics-bilinear-weights-bar{fill:var(--fig-accent);stroke:var(--fig-accent);stroke-width:1.5;transform-box:fill-box;transform-origin:50% 100%} .graphics-bilinear-weights-ring{fill:none;stroke:var(--fig-accent2);stroke-width:3} .graphics-bilinear-weights-sw{fill:var(--fig-accent)} .graphics-bilinear-weights-bTL{transform:scaleY(0.5625);animation:graphics-bilinear-weights-bTL 8s linear infinite}@keyframes graphics-bilinear-weights-bTL{0%{transform:scaleY(0.5625)}25%{transform:scaleY(0.1875)}50%{transform:scaleY(0.0625)}75%{transform:scaleY(0.1875)}100%{transform:scaleY(0.5625)}} .graphics-bilinear-weights-bTR{transform:scaleY(0.1875);animation:graphics-bilinear-weights-bTR 8s linear infinite}@keyframes graphics-bilinear-weights-bTR{0%{transform:scaleY(0.1875)}25%{transform:scaleY(0.5625)}50%{transform:scaleY(0.1875)}75%{transform:scaleY(0.0625)}100%{transform:scaleY(0.1875)}} .graphics-bilinear-weights-bBL{transform:scaleY(0.1875);animation:graphics-bilinear-weights-bBL 8s linear infinite}@keyframes graphics-bilinear-weights-bBL{0%{transform:scaleY(0.1875)}25%{transform:scaleY(0.0625)}50%{transform:scaleY(0.1875)}75%{transform:scaleY(0.5625)}100%{transform:scaleY(0.1875)}} .graphics-bilinear-weights-bBR{transform:scaleY(0.0625);animation:graphics-bilinear-weights-bBR 8s linear infinite}@keyframes graphics-bilinear-weights-bBR{0%{transform:scaleY(0.0625)}25%{transform:scaleY(0.1875)}50%{transform:scaleY(0.5625)}75%{transform:scaleY(0.1875)}100%{transform:scaleY(0.0625)}} .graphics-bilinear-weights-rTL{opacity:1;animation:graphics-bilinear-weights-rTL 8s linear infinite}@keyframes graphics-bilinear-weights-rTL{0%{opacity:1}12.49%{opacity:1}12.5%{opacity:0}87.49%{opacity:0}87.5%{opacity:1}99.99%{opacity:1}100%{opacity:1}} .graphics-bilinear-weights-rTR{opacity:0;animation:graphics-bilinear-weights-rTR 8s linear infinite}@keyframes graphics-bilinear-weights-rTR{0%{opacity:0}12.49%{opacity:0}12.5%{opacity:1}37.49%{opacity:1}37.5%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-bilinear-weights-rBL{opacity:0;animation:graphics-bilinear-weights-rBL 8s linear infinite}@keyframes graphics-bilinear-weights-rBL{0%{opacity:0}62.49%{opacity:0}62.5%{opacity:1}87.49%{opacity:1}87.5%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-bilinear-weights-rBR{opacity:0;animation:graphics-bilinear-weights-rBR 8s linear infinite}@keyframes graphics-bilinear-weights-rBR{0%{opacity:0}37.49%{opacity:0}37.5%{opacity:1}62.49%{opacity:1}62.5%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-bilinear-weights-pt{fill-opacity:.2;animation:graphics-bilinear-weights-pt 8s linear infinite}@keyframes graphics-bilinear-weights-pt{0%{fill-opacity:0.2}12.49%{fill-opacity:0.2}12.5%{fill-opacity:0.9}37.49%{fill-opacity:0.9}37.5%{fill-opacity:0.7}62.49%{fill-opacity:0.7}62.5%{fill-opacity:0.5}87.49%{fill-opacity:0.5}87.5%{fill-opacity:0.2}100%{fill-opacity:0.2}} .graphics-bilinear-weights-bl{fill-opacity:0.42;animation:graphics-bilinear-weights-bl 8s linear infinite}@keyframes graphics-bilinear-weights-bl{0%{fill-opacity:0.42}25%{fill-opacity:0.71}50%{fill-opacity:0.67}75%{fill-opacity:0.51}100%{fill-opacity:0.42}}</style><text class=\"graphics-bilinear-weights-h\" x=\"30\" y=\"36\">Texels around the sample</text><text class=\"graphics-bilinear-weights-h\" x=\"300\" y=\"36\">Bilinear weights</text><rect class=\"graphics-bilinear-weights-tx\" x=\"30\" y=\"55\" width=\"100\" height=\"100\" fill-opacity=\"0.2\"/><rect class=\"graphics-bilinear-weights-tx\" x=\"130\" y=\"55\" width=\"100\" height=\"100\" fill-opacity=\"0.9\"/><rect class=\"graphics-bilinear-weights-tx\" x=\"30\" y=\"155\" width=\"100\" height=\"100\" fill-opacity=\"0.5\"/><rect class=\"graphics-bilinear-weights-tx\" x=\"130\" y=\"155\" width=\"100\" height=\"100\" fill-opacity=\"0.7\"/><rect class=\"graphics-bilinear-weights-ring graphics-bilinear-weights-rTL\" x=\"33\" y=\"58\" width=\"94\" height=\"94\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-ring graphics-bilinear-weights-rTR\" x=\"133\" y=\"58\" width=\"94\" height=\"94\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-ring graphics-bilinear-weights-rBL\" x=\"33\" y=\"158\" width=\"94\" height=\"94\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-ring graphics-bilinear-weights-rBR\" x=\"133\" y=\"158\" width=\"94\" height=\"94\" rx=\"4\"/><circle class=\"graphics-bilinear-weights-c\" cx=\"80\" cy=\"105\" r=\"3\"/><circle class=\"graphics-bilinear-weights-c\" cx=\"180\" cy=\"105\" r=\"3\"/><circle class=\"graphics-bilinear-weights-c\" cx=\"80\" cy=\"205\" r=\"3\"/><circle class=\"graphics-bilinear-weights-c\" cx=\"180\" cy=\"205\" r=\"3\"/><rect x=\"30\" y=\"55\" width=\"200\" height=\"200\" rx=\"2\" class=\"graphics-bilinear-weights-ln\"/><g class=\"graphics-bilinear-weights-mv\"><rect class=\"graphics-bilinear-weights-fp\" x=\"55\" y=\"80\" width=\"100\" height=\"100\" rx=\"2\"/><circle class=\"graphics-bilinear-weights-dot\" cx=\"105\" cy=\"130\" r=\"5.5\"/><text class=\"graphics-bilinear-weights-t\" x=\"113\" y=\"124\">uv</text></g><g><rect x=\"38\" y=\"62\" width=\"34\" height=\"20\" rx=\"5\" class=\"graphics-bilinear-weights-pn\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"55\" y=\"77\">0.2</text><rect x=\"188\" y=\"62\" width=\"34\" height=\"20\" rx=\"5\" class=\"graphics-bilinear-weights-pn\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"205\" y=\"77\">0.9</text><rect x=\"38\" y=\"228\" width=\"34\" height=\"20\" rx=\"5\" class=\"graphics-bilinear-weights-pn\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"55\" y=\"243\">0.5</text><rect x=\"188\" y=\"228\" width=\"34\" height=\"20\" rx=\"5\" class=\"graphics-bilinear-weights-pn\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"205\" y=\"243\">0.7</text></g><text class=\"graphics-bilinear-weights-m\" x=\"30\" y=\"282\">dashed box: one texel around uv</text><text class=\"graphics-bilinear-weights-m\" x=\"30\" y=\"302\">its overlap with a texel = that weight</text><rect class=\"graphics-bilinear-weights-trk\" x=\"310\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-bar graphics-bilinear-weights-bTL\" x=\"310\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\" fill-opacity=\"0.25\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"330\" y=\"219\">TL 0.2</text><rect class=\"graphics-bilinear-weights-trk\" x=\"370\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-bar graphics-bilinear-weights-bTR\" x=\"370\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\" fill-opacity=\"0.9\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"390\" y=\"219\">TR 0.9</text><rect class=\"graphics-bilinear-weights-trk\" x=\"430\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-bar graphics-bilinear-weights-bBL\" x=\"430\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\" fill-opacity=\"0.5\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"450\" y=\"219\">BL 0.5</text><rect class=\"graphics-bilinear-weights-trk\" x=\"490\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-bar graphics-bilinear-weights-bBR\" x=\"490\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\" fill-opacity=\"0.7\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"510\" y=\"219\">BR 0.7</text><rect class=\"graphics-bilinear-weights-pn\" x=\"300\" y=\"236\" width=\"110\" height=\"44\" rx=\"10\"/><rect class=\"graphics-bilinear-weights-sw graphics-bilinear-weights-pt\" x=\"300\" y=\"236\" width=\"110\" height=\"44\" rx=\"10\"/><rect class=\"graphics-bilinear-weights-pn\" x=\"470\" y=\"236\" width=\"110\" height=\"44\" rx=\"10\"/><rect class=\"graphics-bilinear-weights-sw graphics-bilinear-weights-bl\" x=\"470\" y=\"236\" width=\"110\" height=\"44\" rx=\"10\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"355\" y=\"302\">Point: nearest texel</text><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"525\" y=\"302\">Bilinear: blend of 4</text></svg>"
        },
        {
          "type": "interactive",
          "id": "graphics-bilinear-explorer",
          "caption": "Drag the sample: each bilinear weight is the overlap of a one-texel box with that texel, the four weights sum to 1, and point filtering just returns the nearest texel.",
          "height": 380,
          "html": "<style>\n.w { display: flex; flex-direction: column; height: 100%; gap: 8px; }\nsvg { flex: 1; min-height: 0; width: 100%; display: block; touch-action: none; }\n.tx { fill: var(--fig-accent2); stroke: var(--fig-line); stroke-width: 2; }\n.near { fill: none; stroke: var(--fig-warn); stroke-width: 4; }\n.ov { fill: var(--fig-accent); fill-opacity: .28; }\n.box { fill: none; stroke: var(--fig-accent); stroke-width: 2; stroke-dasharray: 6 4; }\n.ctr { fill: var(--fig-ink); fill-opacity: .5; }\n.dot { fill: var(--fig-accent); stroke: var(--fig-bg); stroke-width: 2; cursor: grab; }\n.t { fill: var(--fig-ink); font-size: 14px; }\n.b { font-weight: 600; }\n.m { fill: var(--fig-muted); font-size: 12px; }\n.mid { text-anchor: middle; } .end { text-anchor: end; }\n.bar { fill: var(--fig-accent); }\n.tr { fill: var(--fig-panel); }\n.c { display: grid; grid-template-columns: auto 1fr auto; gap: 4px 10px; align-items: center; }\n.c input { width: 100%; }\noutput { font-variant-numeric: tabular-nums; color: var(--fig-muted); }\n</style>\n<div class=\"w\">\n<svg id=\"s\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Four texels in a 2 by 2 block with a sample point between their centres. A one-texel box around the sample overlaps each texel; the overlap areas are the bilinear weights, and the nearest texel is what point filtering returns.\">\n  <g id=\"tex\"></g><g id=\"ovl\"></g>\n  <rect id=\"near\" class=\"near\" width=\"120\" height=\"120\"/>\n  <rect id=\"box\" class=\"box\" width=\"120\" height=\"120\"/>\n  <circle class=\"ctr\" cx=\"120\" cy=\"90\" r=\"3\"/><circle class=\"ctr\" cx=\"240\" cy=\"90\" r=\"3\"/><circle class=\"ctr\" cx=\"120\" cy=\"210\" r=\"3\"/><circle class=\"ctr\" cx=\"240\" cy=\"210\" r=\"3\"/>\n  <g id=\"lbl\"></g>\n  <circle id=\"dot\" class=\"dot\" r=\"9\"/>\n  <text class=\"m mid\" x=\"180\" y=\"292\">drag the sample, or use the sliders</text>\n  <text class=\"t b\" x=\"340\" y=\"44\">Weights (sum to 1)</text>\n  <g id=\"bars\"></g>\n  <text id=\"fxy\" class=\"m\" x=\"340\" y=\"200\"></text>\n  <text id=\"bil\" class=\"t\" x=\"340\" y=\"232\"></text>\n  <text id=\"pt\" class=\"t\" x=\"340\" y=\"258\"></text>\n</svg>\n<div class=\"c\">\n  <label for=\"u\">Sample u</label><input id=\"u\" type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" value=\"0.3\"><output id=\"uo\" for=\"u\"></output>\n  <label for=\"v\">Sample v</label><input id=\"v\" type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" value=\"0.6\"><output id=\"vo\" for=\"v\"></output>\n</div>\n</div>\n<script>\n(function () {\n  var $ = function (id) { return document.getElementById(id); };\n  var T = [{ n: 'top-left', x: 60, y: 30, val: 0.9 }, { n: 'top-right', x: 180, y: 30, val: 0.2 }, { n: 'bottom-left', x: 60, y: 150, val: 0.4 }, { n: 'bottom-right', x: 180, y: 150, val: 0.7 }];\n  $('tex').innerHTML = T.map(function (t) { return '<rect class=\"tx\" x=\"' + t.x + '\" y=\"' + t.y + '\" width=\"120\" height=\"120\" fill-opacity=\"' + (0.1 + 0.4 * t.val).toFixed(2) + '\"/>'; }).join('');\n  function draw() {\n    var fx = +$('u').value, fy = +$('v').value;\n    var px = 120 + fx * 120, py = 90 + fy * 120;\n    var w = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy];\n    var bx = px - 60, by = py - 60;\n    $('box').setAttribute('x', bx); $('box').setAttribute('y', by);\n    $('dot').setAttribute('cx', px); $('dot').setAttribute('cy', py);\n    var ov = '', lbl = '';\n    T.forEach(function (t, i) {\n      var x0 = Math.max(bx, t.x), y0 = Math.max(by, t.y), x1 = Math.min(bx + 120, t.x + 120), y1 = Math.min(by + 120, t.y + 120);\n      if (x1 > x0 && y1 > y0) ov += '<rect class=\"ov\" x=\"' + x0 + '\" y=\"' + y0 + '\" width=\"' + (x1 - x0) + '\" height=\"' + (y1 - y0) + '\"/>';\n      var lx = t.x + 60, ly = t.y + (i < 2 ? 22 : 94);\n      lbl += '<text class=\"m mid\" x=\"' + lx + '\" y=\"' + ly + '\">value ' + t.val.toFixed(1) + '</text>';\n      lbl += '<text class=\"t b mid\" x=\"' + lx + '\" y=\"' + (ly + 18) + '\">w ' + w[i].toFixed(2) + '</text>';\n    });\n    $('ovl').innerHTML = ov; $('lbl').innerHTML = lbl;\n    var bars = '';\n    T.forEach(function (t, i) {\n      var y = 60 + i * 30;\n      bars += '<text class=\"t\" x=\"340\" y=\"' + (y + 13) + '\">' + t.n + '</text><rect class=\"tr\" x=\"450\" y=\"' + y + '\" width=\"140\" height=\"16\" rx=\"8\"/>' +\n        '<rect class=\"bar\" x=\"450\" y=\"' + y + '\" width=\"' + (140 * w[i]).toFixed(1) + '\" height=\"16\" rx=\"8\"/><text class=\"t end\" x=\"634\" y=\"' + (y + 13) + '\">' + w[i].toFixed(2) + '</text>';\n    });\n    $('bars').innerHTML = bars;\n    var n = (fy < 0.5 ? 0 : 2) + (fx < 0.5 ? 0 : 1);\n    $('near').setAttribute('x', T[n].x); $('near').setAttribute('y', T[n].y);\n    var sum = w.reduce(function (a, wi, i) { return a + wi * T[i].val; }, 0);\n    $('fxy').textContent = 'fx = ' + fx.toFixed(2) + ', fy = ' + fy.toFixed(2) + ' (fraction between centres)';\n    $('bil').textContent = 'Bilinear: Σ w × value = ' + sum.toFixed(2);\n    $('pt').textContent = 'Point: nearest texel (' + T[n].n + ') = ' + T[n].val.toFixed(1);\n    $('uo').textContent = fx.toFixed(2); $('vo').textContent = fy.toFixed(2);\n  }\n  var svg = $('s'), drag = false;\n  function move(e) {\n    var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;\n    p = p.matrixTransform(svg.getScreenCTM().inverse());\n    $('u').value = Math.min(1, Math.max(0, (p.x - 120) / 120)).toFixed(2);\n    $('v').value = Math.min(1, Math.max(0, (p.y - 90) / 120)).toFixed(2);\n    draw();\n  }\n  svg.addEventListener('pointerdown', function (e) { drag = true; svg.setPointerCapture(e.pointerId); move(e); });\n  svg.addEventListener('pointermove', function (e) { if (drag) move(e); });\n  svg.addEventListener('pointerup', function () { drag = false; });\n  $('u').addEventListener('input', draw); $('v').addEventListener('input', draw);\n  draw();\n})();\n</script>"
        },
        {
          "type": "p",
          "text": "**Mipmaps** solve minification. A mip chain stores the texture at half resolution repeatedly down to 1x1: 1024, 512, 256, and so on. The hardware picks the level whose texel size best matches the pixel footprint, computed from the UV derivatives. **Trilinear** filtering blends between two adjacent mip levels so the transition is smooth. The cost is memory: a full chain adds 1/4 + 1/16 + ... which is about 33 percent. The benefit is large: stable images with no shimmering, and better cache behaviour, because neighbouring pixels read neighbouring texels in a small mip level instead of striding across a huge one."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Mip level   Size        Bytes (RGBA8)\n0           1024x1024   4,194,304\n1           512x512     1,048,576\n2           256x256       262,144\n...\nTotal chain             ~5,592,405  (1.333x of mip 0)"
        },
        {
          "type": "figure",
          "id": "graphics-mip-chain-scale",
          "caption": "Each mip level halves the size, so the whole chain adds only about 33 percent, and the GPU picks the level where one texel covers about one pixel.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 346\" role=\"img\" aria-label=\"A mip chain from 1024 by 1024 down to 1 by 1, each level half the size of the previous, with a memory bar showing the extra levels add about 33 percent. A quad shrinking on screen highlights which mip level is chosen.\"><style>.graphics-mip-chain-scale-t{font-size:13px;fill:var(--fig-ink)} .graphics-mip-chain-scale-m{font-size:13px;fill:var(--fig-muted)} .graphics-mip-chain-scale-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-mip-chain-scale-mid{text-anchor:middle} .graphics-mip-chain-scale-end{text-anchor:end} .graphics-mip-chain-scale-mono{font-family:ui-monospace,Menlo,monospace} .graphics-mip-chain-scale-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-mip-chain-scale-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-mip-chain-scale-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-mip-chain-scale-sq{fill:var(--fig-accent);fill-opacity:.2;stroke:var(--fig-accent);stroke-width:1.5} .graphics-mip-chain-scale-ring{fill:none;stroke:var(--fig-accent2);stroke-width:2.5} .graphics-mip-chain-scale-q{fill:var(--fig-accent);fill-opacity:.3;stroke:var(--fig-accent);stroke-width:1.5;transform-box:fill-box;transform-origin:50% 50%;animation:graphics-mip-chain-scale-q 7.5s linear infinite} .graphics-mip-chain-scale-m0{fill:var(--fig-accent);fill-opacity:.35} .graphics-mip-chain-scale-m1{fill:var(--fig-accent2);fill-opacity:.4}@keyframes graphics-mip-chain-scale-q{0%{transform:scale(1)}19.99%{transform:scale(1)}20%{transform:scale(0.5)}39.99%{transform:scale(0.5)}40%{transform:scale(0.25)}59.99%{transform:scale(0.25)}60%{transform:scale(0.125)}79.99%{transform:scale(0.125)}80%{transform:scale(0.0625)}99.99%{transform:scale(0.0625)}100%{transform:scale(1)}} .graphics-mip-chain-scale-k0{opacity:1;animation:graphics-mip-chain-scale-k0 7.5s linear infinite}@keyframes graphics-mip-chain-scale-k0{0%{opacity:1}19.99%{opacity:1}20%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-mip-chain-scale-k1{opacity:0;animation:graphics-mip-chain-scale-k1 7.5s linear infinite}@keyframes graphics-mip-chain-scale-k1{0%{opacity:0}19.99%{opacity:0}20%{opacity:1}39.99%{opacity:1}40%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-mip-chain-scale-k2{opacity:0;animation:graphics-mip-chain-scale-k2 7.5s linear infinite}@keyframes graphics-mip-chain-scale-k2{0%{opacity:0}39.99%{opacity:0}40%{opacity:1}59.99%{opacity:1}60%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-mip-chain-scale-k3{opacity:0;animation:graphics-mip-chain-scale-k3 7.5s linear infinite}@keyframes graphics-mip-chain-scale-k3{0%{opacity:0}59.99%{opacity:0}60%{opacity:1}79.99%{opacity:1}80%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-mip-chain-scale-k4{opacity:0;animation:graphics-mip-chain-scale-k4 7.5s linear infinite}@keyframes graphics-mip-chain-scale-k4{0%{opacity:0}79.99%{opacity:0}80%{opacity:1}99.99%{opacity:1}100%{opacity:1}}</style><text class=\"graphics-mip-chain-scale-h\" x=\"24\" y=\"30\">Mip chain, drawn to scale</text><text class=\"graphics-mip-chain-scale-h graphics-mip-chain-scale-mid\" x=\"573\" y=\"30\">Quad recedes</text><rect class=\"graphics-mip-chain-scale-sq\" x=\"24\" y=\"44\" width=\"176\" height=\"176\" rx=\"3\"/><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid\" x=\"112\" y=\"240\">1024</text><rect class=\"graphics-mip-chain-scale-ring graphics-mip-chain-scale-k0\" x=\"19\" y=\"39\" width=\"186\" height=\"186\" rx=\"5\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"212\" y=\"132\" width=\"88\" height=\"88\" rx=\"3\"/><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid\" x=\"256\" y=\"240\">512</text><rect class=\"graphics-mip-chain-scale-ring graphics-mip-chain-scale-k1\" x=\"207\" y=\"127\" width=\"98\" height=\"98\" rx=\"5\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"312\" y=\"176\" width=\"44\" height=\"44\" rx=\"3\"/><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid\" x=\"334\" y=\"240\">256</text><rect class=\"graphics-mip-chain-scale-ring graphics-mip-chain-scale-k2\" x=\"307\" y=\"171\" width=\"54\" height=\"54\" rx=\"5\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"368\" y=\"198\" width=\"22\" height=\"22\" rx=\"3\"/><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid\" x=\"379\" y=\"240\">128</text><rect class=\"graphics-mip-chain-scale-ring graphics-mip-chain-scale-k3\" x=\"363\" y=\"193\" width=\"32\" height=\"32\" rx=\"5\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"402\" y=\"209\" width=\"11\" height=\"11\"/><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid\" x=\"407.5\" y=\"240\">64</text><rect class=\"graphics-mip-chain-scale-ring graphics-mip-chain-scale-k4\" x=\"397\" y=\"204\" width=\"21\" height=\"21\" rx=\"5\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"425\" y=\"214.5\" width=\"5.5\" height=\"5.5\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"435.5\" y=\"217.25\" width=\"2.75\" height=\"2.75\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"443.25\" y=\"218.63\" width=\"1.38\" height=\"1.38\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"449.63\" y=\"219.31\" width=\"0.69\" height=\"0.69\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"455.31\" y=\"219.66\" width=\"0.34\" height=\"0.34\"/><rect class=\"graphics-mip-chain-scale-sq\" x=\"460.66\" y=\"219.83\" width=\"0.17\" height=\"0.17\"/><text class=\"graphics-mip-chain-scale-m\" x=\"471.83\" y=\"240\">… 1×1</text><rect class=\"graphics-mip-chain-scale-pn\" x=\"520\" y=\"44\" width=\"106\" height=\"176\" rx=\"10\"/><text class=\"graphics-mip-chain-scale-m graphics-mip-chain-scale-mid\" x=\"573\" y=\"66\">on screen</text><rect class=\"graphics-mip-chain-scale-q\" x=\"525\" y=\"94\" width=\"96\" height=\"96\" rx=\"2\"/><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid graphics-mip-chain-scale-k0\" x=\"573\" y=\"240\">1024 px: mip 0</text><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid graphics-mip-chain-scale-k1\" x=\"573\" y=\"240\">512 px: mip 1</text><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid graphics-mip-chain-scale-k2\" x=\"573\" y=\"240\">256 px: mip 2</text><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid graphics-mip-chain-scale-k3\" x=\"573\" y=\"240\">128 px: mip 3</text><text class=\"graphics-mip-chain-scale-t graphics-mip-chain-scale-mid graphics-mip-chain-scale-k4\" x=\"573\" y=\"240\">64 px: mip 4</text><rect class=\"graphics-mip-chain-scale-m0\" x=\"24\" y=\"268\" width=\"360\" height=\"22\" rx=\"5\"/><rect class=\"graphics-mip-chain-scale-m1\" x=\"386\" y=\"268\" width=\"120\" height=\"22\" rx=\"5\"/><text class=\"graphics-mip-chain-scale-t\" x=\"24\" y=\"312\">mip 0: 4,194,304 B</text><text class=\"graphics-mip-chain-scale-t\" x=\"386\" y=\"312\">levels 1-10: +33%</text><text class=\"graphics-mip-chain-scale-m\" x=\"24\" y=\"334\">total chain ≈ 5,592,405 B (1.333× of mip 0, RGBA8)</text></svg>"
        },
        {
          "type": "h",
          "text": "Anisotropic filtering"
        },
        {
          "type": "p",
          "text": "A floor stretching away from the camera is the classic failure of trilinear filtering. The pixel footprint on the texture is a long thin ellipse, not a square. Trilinear picks the mip from the longer axis to avoid aliasing, so the floor becomes a blurry smear. **Anisotropic filtering** takes several samples along the long axis of the footprint (2x, 4x, 8x or 16x the maximum). It costs more texture-unit work per pixel, but modern GPUs handle 8x or 16x cheaply on desktop. On mobile it still costs bandwidth, so 2x to 4x is a common compromise. It matters most for ground, roads and walls seen at grazing angles, and not at all for a sprite facing the camera."
        },
        {
          "type": "h",
          "text": "GPU compression formats"
        },
        {
          "type": "p",
          "text": "PNG and JPEG are storage formats. The GPU cannot sample them directly, so the engine decodes them to raw RGBA8 in VRAM: 4 bytes per texel. GPU compression formats are decoded by fixed-function hardware at sample time, so the texture stays compressed in memory and in cache. They are lossy and block-based: each block of texels (4x4 for BC and ETC2, 4x4 up to 12x12 for ASTC) encodes into a fixed 64 or 128 bits, so random access is cheap."
        },
        {
          "type": "list",
          "items": [
            "**BC1/BC3/BC4/BC5/BC7 (DXT family)**: desktop and console. BC1 is 4 bits per texel (8:1 vs RGBA8), BC7 is 8 bits per texel with high quality. BC5 stores two channels and is common for normal maps; BC4 is one channel.",
            "**ETC2**: mandatory in OpenGL ES 3.0 and effectively universal on Android; 4 or 8 bits per texel. Older but universally supported on mobile.",
            "**ASTC**: variable block size from 4x4 (8 bits per texel) up to 12x12 (0.89 bits per texel), so you can trade quality for size per texture. Supported on modern iOS and Android GPUs and the common mobile default.",
            "**Uncompressed**: RGBA8 or RGBA16F for render targets, LUTs or small UI textures where block artefacts are unacceptable."
          ]
        },
        {
          "type": "p",
          "text": "Compression happens at import or build time and is slow, since encoders search for the best block encoding. The numbers matter: a 2048x2048 RGBA8 texture with mips is about 22 MB. As ASTC 6x6 (about 3.6 bits per texel) it is under 4 MB. For a mobile game with a 1.5 GB memory ceiling, texture format is often the single biggest memory lever."
        },
        {
          "type": "figure",
          "id": "graphics-block-compression",
          "caption": "A 4x4 block of RGBA8 is 512 bits; BC7 stores it in 128 and ASTC 12x12 gets down to 0.89 bits per texel.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"A 4 by 4 texel block of 512 raw bits collapsing into a 128 bit BC7 block, beside a bar chart drawn to scale of bits per texel for RGBA8, BC7, ASTC 4x4, BC1, ETC2, ASTC 6x6 and ASTC 12x12.\"><style>.graphics-block-compression-t{font-size:13px;fill:var(--fig-ink)} .graphics-block-compression-m{font-size:13px;fill:var(--fig-muted)} .graphics-block-compression-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-block-compression-mid{text-anchor:middle} .graphics-block-compression-end{text-anchor:end} .graphics-block-compression-mono{font-family:ui-monospace,Menlo,monospace} .graphics-block-compression-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-block-compression-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-block-compression-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-block-compression-tx{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:1} .graphics-block-compression-raw{fill:var(--fig-muted);fill-opacity:.45} .graphics-block-compression-cmp{fill:var(--fig-accent);fill-opacity:.75} .graphics-block-compression-ghost{opacity:0;transform-box:fill-box;transform-origin:0 0;animation:graphics-block-compression-gh 6s ease-in-out infinite}@keyframes graphics-block-compression-gh{0%{opacity:0;transform:translateY(0) scaleY(1)}12%{opacity:.85;transform:translateY(0) scaleY(1)}22%{opacity:.85;transform:translateY(0) scaleY(1)}62%{opacity:.85;transform:translateY(155px) scaleY(.25)}80%{opacity:0;transform:translateY(155px) scaleY(.25)}100%{opacity:0;transform:translateY(155px) scaleY(.25)}}</style><text class=\"graphics-block-compression-h\" x=\"24\" y=\"32\">One 4×4 block</text><rect class=\"graphics-block-compression-tx\" x=\"30\" y=\"50\" width=\"28\" height=\"28\" fill-opacity=\"0.25\"/><rect class=\"graphics-block-compression-tx\" x=\"58\" y=\"50\" width=\"28\" height=\"28\" fill-opacity=\"0.4\"/><rect class=\"graphics-block-compression-tx\" x=\"86\" y=\"50\" width=\"28\" height=\"28\" fill-opacity=\"0.55\"/><rect class=\"graphics-block-compression-tx\" x=\"114\" y=\"50\" width=\"28\" height=\"28\" fill-opacity=\"0.7\"/><rect class=\"graphics-block-compression-tx\" x=\"30\" y=\"78\" width=\"28\" height=\"28\" fill-opacity=\"0.35\"/><rect class=\"graphics-block-compression-tx\" x=\"58\" y=\"78\" width=\"28\" height=\"28\" fill-opacity=\"0.5\"/><rect class=\"graphics-block-compression-tx\" x=\"86\" y=\"78\" width=\"28\" height=\"28\" fill-opacity=\"0.65\"/><rect class=\"graphics-block-compression-tx\" x=\"114\" y=\"78\" width=\"28\" height=\"28\" fill-opacity=\"0.8\"/><rect class=\"graphics-block-compression-tx\" x=\"30\" y=\"106\" width=\"28\" height=\"28\" fill-opacity=\"0.45\"/><rect class=\"graphics-block-compression-tx\" x=\"58\" y=\"106\" width=\"28\" height=\"28\" fill-opacity=\"0.6\"/><rect class=\"graphics-block-compression-tx\" x=\"86\" y=\"106\" width=\"28\" height=\"28\" fill-opacity=\"0.75\"/><rect class=\"graphics-block-compression-tx\" x=\"114\" y=\"106\" width=\"28\" height=\"28\" fill-opacity=\"0.9\"/><rect class=\"graphics-block-compression-tx\" x=\"30\" y=\"134\" width=\"28\" height=\"28\" fill-opacity=\"0.55\"/><rect class=\"graphics-block-compression-tx\" x=\"58\" y=\"134\" width=\"28\" height=\"28\" fill-opacity=\"0.7\"/><rect class=\"graphics-block-compression-tx\" x=\"86\" y=\"134\" width=\"28\" height=\"28\" fill-opacity=\"0.85\"/><rect class=\"graphics-block-compression-tx\" x=\"114\" y=\"134\" width=\"28\" height=\"28\" fill-opacity=\"0.95\"/><g class=\"graphics-block-compression-ghost\"><rect class=\"graphics-block-compression-tx\" x=\"30\" y=\"50\" width=\"28\" height=\"28\" fill-opacity=\"0.25\"/><rect class=\"graphics-block-compression-tx\" x=\"58\" y=\"50\" width=\"28\" height=\"28\" fill-opacity=\"0.4\"/><rect class=\"graphics-block-compression-tx\" x=\"86\" y=\"50\" width=\"28\" height=\"28\" fill-opacity=\"0.55\"/><rect class=\"graphics-block-compression-tx\" x=\"114\" y=\"50\" width=\"28\" height=\"28\" fill-opacity=\"0.7\"/><rect class=\"graphics-block-compression-tx\" x=\"30\" y=\"78\" width=\"28\" height=\"28\" fill-opacity=\"0.35\"/><rect class=\"graphics-block-compression-tx\" x=\"58\" y=\"78\" width=\"28\" height=\"28\" fill-opacity=\"0.5\"/><rect class=\"graphics-block-compression-tx\" x=\"86\" y=\"78\" width=\"28\" height=\"28\" fill-opacity=\"0.65\"/><rect class=\"graphics-block-compression-tx\" x=\"114\" y=\"78\" width=\"28\" height=\"28\" fill-opacity=\"0.8\"/><rect class=\"graphics-block-compression-tx\" x=\"30\" y=\"106\" width=\"28\" height=\"28\" fill-opacity=\"0.45\"/><rect class=\"graphics-block-compression-tx\" x=\"58\" y=\"106\" width=\"28\" height=\"28\" fill-opacity=\"0.6\"/><rect class=\"graphics-block-compression-tx\" x=\"86\" y=\"106\" width=\"28\" height=\"28\" fill-opacity=\"0.75\"/><rect class=\"graphics-block-compression-tx\" x=\"114\" y=\"106\" width=\"28\" height=\"28\" fill-opacity=\"0.9\"/><rect class=\"graphics-block-compression-tx\" x=\"30\" y=\"134\" width=\"28\" height=\"28\" fill-opacity=\"0.55\"/><rect class=\"graphics-block-compression-tx\" x=\"58\" y=\"134\" width=\"28\" height=\"28\" fill-opacity=\"0.7\"/><rect class=\"graphics-block-compression-tx\" x=\"86\" y=\"134\" width=\"28\" height=\"28\" fill-opacity=\"0.85\"/><rect class=\"graphics-block-compression-tx\" x=\"114\" y=\"134\" width=\"28\" height=\"28\" fill-opacity=\"0.95\"/></g><text class=\"graphics-block-compression-t\" x=\"24\" y=\"184\">RGBA8: 16 × 32 = 512 bits</text><rect class=\"graphics-block-compression-cmp\" x=\"30\" y=\"205\" width=\"112\" height=\"28\" rx=\"3\"/><text class=\"graphics-block-compression-t\" x=\"152\" y=\"224\">BC7: 128 bits</text><rect class=\"graphics-block-compression-cmp\" x=\"30\" y=\"248\" width=\"112\" height=\"14\" rx=\"3\"/><text class=\"graphics-block-compression-t\" x=\"152\" y=\"260\">BC1: 64 bits</text><text class=\"graphics-block-compression-m\" x=\"24\" y=\"296\">area = bits, same scale</text><text class=\"graphics-block-compression-h\" x=\"262\" y=\"32\">Bits per texel, to scale</text><text class=\"graphics-block-compression-t graphics-block-compression-end\" x=\"348\" y=\"66\">RGBA8</text><rect class=\"graphics-block-compression-raw\" x=\"356\" y=\"52\" width=\"224\" height=\"20\" rx=\"4\"/><text class=\"graphics-block-compression-m\" x=\"588\" y=\"67\">32</text><text class=\"graphics-block-compression-t graphics-block-compression-end\" x=\"348\" y=\"100\">BC7</text><rect class=\"graphics-block-compression-cmp\" x=\"356\" y=\"86\" width=\"56\" height=\"20\" rx=\"4\"/><text class=\"graphics-block-compression-m\" x=\"420\" y=\"101\">8</text><text class=\"graphics-block-compression-t graphics-block-compression-end\" x=\"348\" y=\"134\">ASTC 4×4</text><rect class=\"graphics-block-compression-cmp\" x=\"356\" y=\"120\" width=\"56\" height=\"20\" rx=\"4\"/><text class=\"graphics-block-compression-m\" x=\"420\" y=\"135\">8</text><text class=\"graphics-block-compression-t graphics-block-compression-end\" x=\"348\" y=\"168\">BC1</text><rect class=\"graphics-block-compression-cmp\" x=\"356\" y=\"154\" width=\"28\" height=\"20\" rx=\"4\"/><text class=\"graphics-block-compression-m\" x=\"392\" y=\"169\">4</text><text class=\"graphics-block-compression-t graphics-block-compression-end\" x=\"348\" y=\"202\">ETC2</text><rect class=\"graphics-block-compression-cmp\" x=\"356\" y=\"188\" width=\"28\" height=\"20\" rx=\"4\"/><text class=\"graphics-block-compression-m\" x=\"392\" y=\"203\">4</text><text class=\"graphics-block-compression-t graphics-block-compression-end\" x=\"348\" y=\"236\">ASTC 6×6</text><rect class=\"graphics-block-compression-cmp\" x=\"356\" y=\"222\" width=\"24.92\" height=\"20\" rx=\"4\"/><text class=\"graphics-block-compression-m\" x=\"388.92\" y=\"237\">≈3.6</text><text class=\"graphics-block-compression-t graphics-block-compression-end\" x=\"348\" y=\"270\">ASTC 12×12</text><rect class=\"graphics-block-compression-cmp\" x=\"356\" y=\"256\" width=\"6.23\" height=\"20\" rx=\"2\"/><text class=\"graphics-block-compression-m\" x=\"370.23\" y=\"271\">0.89</text><line class=\"graphics-block-compression-ln\" x1=\"356\" y1=\"46\" x2=\"356\" y2=\"288\"/><text class=\"graphics-block-compression-m\" x=\"262\" y=\"316\">2048² with mips: RGBA8 ≈ 22 MB, ASTC 6×6 under 4 MB</text></svg>"
        },
        {
          "type": "h",
          "text": "Atlases and sRGB versus linear"
        },
        {
          "type": "p",
          "text": "A **texture atlas** packs many small images into one large texture so that many objects can share one material and one draw call. It is the backbone of sprite and UI rendering. The pitfalls are bleeding and mips: bilinear filtering near a sprite edge reads the neighbouring sprite, so you need padding (extruded border pixels), and mip levels blend neighbours together faster at lower levels, so atlases often need padding proportional to the highest mip you use, or mips disabled for UI. Texture arrays are an alternative for same-size images: each layer is a clean texture, with no bleeding."
        },
        {
          "type": "p",
          "text": "**Colour space** is the other classic trap. Monitors and image files encode colour in sRGB, a non-linear curve (roughly gamma 2.2) that spends more precision on dark tones. Lighting maths (adding light, multiplying albedo by irradiance, blending) is only physically meaningful in **linear** space. If you sample an sRGB texture as raw numbers and light it, your mid-tones are wrong and the result looks washed out or too contrasty. The fix is to mark colour textures (albedo, emissive) as sRGB so the hardware converts to linear on sample, filter in linear space, and convert back when writing to an sRGB render target. Data textures (normal maps, roughness, metallic, masks, height) must be linear: they hold numbers, not colours, and applying an sRGB curve corrupts them."
        },
        {
          "type": "code",
          "lang": "hlsl",
          "text": "Texture2D    _Albedo;   // imported as sRGB: GPU converts to linear on Sample\nTexture2D    _Normal;   // imported as linear data\nSamplerState sampler_linear_repeat; // trilinear, 8x anisotropy, wrap\n\nfloat4 Frag(float2 uv : TEXCOORD0) : SV_Target\n{\n    float3 albedo = _Albedo.Sample(sampler_linear_repeat, uv).rgb;  // already linear\n    float3 n = _Normal.Sample(sampler_linear_repeat, uv).xyz * 2 - 1; // data, not colour\n    return float4(albedo * Lighting(n), 1);\n}"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Misconceptions to drop: 'bigger texture means sharper' (only if the texel density on screen justifies it; beyond that you pay memory and get nothing), 'PNG size on disk is the memory cost' (it is the decoded or GPU-compressed size that counts), and 'mipmaps waste memory' (they cost 33 percent and save more than that in bandwidth and shimmer)."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "When an agent writes import scripts or shaders, specify the colour space and compression per texture type: albedo sRGB with BC7 or ASTC, normal maps linear with BC5 or ASTC, masks linear. Agents often generate texture code that samples everything the same way, forgets to mark data textures as linear, or recommends 'just use RGBA32 for quality'. Verify by checking a texture's format and memory size in the engine's inspector or a memory profiler, and by looking at a grazing-angle surface for blur (anisotropy) and distant surfaces for shimmer (mips)."
        },
        {
          "type": "p",
          "text": "A practical budget check: pick the target texel density first (for example 512 texels per metre for hero props, 128 for terrain), derive resolutions from object size, then choose the compression. Starting from 'what looks good in the editor on my 4K monitor' is how projects end up 3 GB over budget."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Distant ground textures shimmer and crawl as the camera moves slowly",
              "use": "Generate mipmaps",
              "why": "Minified textures skip texels and alias; mips prefilter them and improve cache hits. Costs about 33 percent more memory; skip only for textures never minified, like pixel-exact UI."
            },
            {
              "signal": "A road or floor turns into a blurry smear at grazing angles while surfaces facing the camera look sharp",
              "use": "Anisotropic filtering",
              "why": "Takes extra samples along the stretched axis instead of dropping to a blurry mip. Costs bandwidth, so use 4x to 16x on ground textures and leave it off elsewhere."
            },
            {
              "signal": "Texture memory is over budget and most textures are stored as uncompressed RGBA8",
              "use": "Block compression per platform",
              "why": "BC on desktop and console, ASTC on modern mobile, ETC2 as a fallback; textures stay compressed in VRAM at 4x to 8x savings. Lossy, so check normal maps and gradients."
            },
            {
              "signal": "Roughness, metallic and AO are each a separate greyscale texture per material",
              "use": "Channel packing",
              "why": "Store each mask in one channel of a single texture, cutting fetches and memory. All channels share one resolution and compression, and the packed texture must be linear."
            },
            {
              "signal": "Normal maps or roughness masks look subtly wrong, with flat or overly bright lighting on slopes",
              "use": "sRGB for colour, linear for data",
              "why": "The sRGB flag decodes gamma on sample, which is right for albedo and wrong for normals, masks and LUTs. Set it per texture by what the data means, not by how it looks."
            },
            {
              "signal": "Hundreds of small UI icons or sprites each use their own texture and break batching",
              "use": "Texture atlas with padding",
              "why": "One texture lets many elements share a material and batch. Pad and extrude edges against bleeding at lower mips; atlases cannot use wrap-mode tiling per element."
            },
            {
              "signal": "Terrain layers or tiling materials need per-layer wrap and mips but you want one material and one binding",
              "use": "Texture array",
              "why": "Each slice keeps its own wrap, mips and filtering with no bleeding, indexed by a slice number. All slices must share size and format."
            },
            {
              "signal": "Normal maps show blocky banding after compression with a generic colour format",
              "use": "Two-channel normal compression",
              "why": "Store X and Y in a two-channel format (BC5 or ASTC with normal settings) and rebuild Z in the shader. Higher quality per bit, at the cost of a few ALU instructions."
            },
            {
              "signal": "A large open world cannot keep every texture's full mip chain resident in memory",
              "use": "Mip streaming",
              "why": "Load only the mip levels each texture needs at its current screen size, keeping a memory budget. Textures may look blurry briefly while higher mips stream in."
            }
          ]
        }
      ],
      "keyPoints": [
        "A texel is a texture element; sampler state (filter, wrap, anisotropy) decides how a continuous UV maps to texel data.",
        "Mipmaps fix minification shimmer and improve cache use for about 33 percent extra memory; anisotropic filtering fixes blur at grazing angles.",
        "GPU block compression (BC, ASTC, ETC2) keeps textures compressed in VRAM, cutting memory 4x to 8x or more versus RGBA8.",
        "Atlases save draw calls but need padding against bleeding and care with mips.",
        "Colour textures are sRGB, data textures (normals, roughness, masks) are linear; mixing them up silently corrupts lighting."
      ],
      "quiz": [
        {
          "q": "A road texture looks crisp near the camera but turns into a blurry smear far down the road, while a distant wall facing the camera looks fine. Trilinear filtering is on. What fixes it?",
          "options": [
            "Raise the texture resolution from 2048 to 4096",
            "Enable anisotropic filtering on that sampler or texture",
            "Switch the filter from trilinear to point sampling",
            "Disable mipmaps so the full resolution is always sampled"
          ],
          "answer": 1,
          "explain": "The road's pixel footprint is a long thin ellipse at grazing angles, and trilinear picks the mip from the longer axis, so it blurs. Anisotropic filtering takes multiple samples along that axis. A bigger texture does not change which mip is chosen at distance."
        },
        {
          "q": "Distant cobblestones shimmer and crawl as the camera moves slowly, even though the texture is high resolution. The texture was imported without mipmaps. What is the underlying cause?",
          "options": [
            "Bilinear filtering blends too many texels together",
            "The texture is compressed with a lossy block format",
            "The sampler uses the wrong wrap mode at the edges",
            "Each pixel covers many texels but only samples a few"
          ],
          "answer": 3,
          "explain": "Without mips, a pixel covering say 16 texels still reads only 1 to 4 of them, and which ones changes frame to frame, so it shimmers. Mips precompute the average. Compression and wrap mode do not cause temporal shimmer."
        },
        {
          "q": "A normal map imported with the sRGB option ticked gives lighting that looks subtly wrong and flat on slopes. Why?",
          "options": [
            "The sRGB decode curve distorts the stored vector values",
            "sRGB textures cannot be sampled with a trilinear filter",
            "Normal maps need more than 8 bits per channel to work",
            "sRGB import disables compression, so detail is lost"
          ],
          "answer": 0,
          "explain": "Normal maps hold direction data, and the sRGB decode bends the stored values non-linearly so the unpacked vectors are wrong. sRGB textures can be filtered normally and compression is unaffected."
        },
        {
          "q": "Your mobile build is over its memory budget. Profiling shows 400 MB of 2048x2048 RGBA8 textures with mips. Quality must stay close. Which change helps most?",
          "options": [
            "Remove mipmaps from all textures",
            "Convert the textures to PNG with maximum compression",
            "Import them as ASTC with a 6x6 or 4x4 block size",
            "Lower anisotropic filtering from 16x to 2x"
          ],
          "answer": 2,
          "explain": "ASTC stays compressed in VRAM and cuts size by roughly 4x (4x4 blocks) to 9x (6x6 blocks). PNG is only on-disk compression, since it is decoded to RGBA8 for the GPU, and mips and anisotropy do not touch the base memory cost."
        },
        {
          "q": "UI icons packed in an atlas show thin coloured lines from neighbouring icons at the edges when the UI is scaled down. What is the best fix?",
          "options": [
            "Convert the atlas to a point-filtered sampler only",
            "Add padding with extruded edge pixels or limit the mip levels",
            "Increase the atlas to 8192x8192 to space icons apart",
            "Store the icons as separate uncompressed RGBA16F textures"
          ],
          "answer": 1,
          "explain": "Bilinear and mip filtering read texels across icon borders, so edges need padding of repeated border pixels, or mips need to be limited. A larger atlas does not change filter footprints unless the spacing also grows."
        },
        {
          "q": "Each PBR material ships three separate greyscale textures for roughness, metallic and ambient occlusion. Profiling shows extra texture fetches per pixel and wasted memory from three single-channel files. Which approach fits best?",
          "options": [
            "Convert each mask into a slice of a texture array",
            "Stream in only the lower mip levels of the three masks",
            "Turn on anisotropic filtering for the three mask textures",
            "Pack the three masks into channels of one texture"
          ],
          "answer": 3,
          "explain": "Channel packing stores three single-channel masks in R, G and B of one linear texture, giving one fetch and one allocation. A texture array still needs separate fetches, and streaming or filtering do not cut the sample count."
        }
      ]
    },
    {
      "id": "graphics-lighting-materials",
      "title": "Lighting and materials",
      "minutes": 14,
      "summary": "From Blinn-Phong to physically based metallic/roughness materials, normal maps, shadow maps and the precomputed tricks that fake global illumination.",
      "lesson": [
        {
          "type": "p",
          "text": "Two scenes with the same geometry can look like plastic toys or like believable stone, metal and skin. The difference is a lighting model and a material description. In a game you also need it to run in about 4 ms of a 16.6 ms frame, with dozens of lights and moving characters. This lesson covers the shading models, the maps that fake detail, and the main techniques for shadows and indirect light."
        },
        {
          "type": "h",
          "text": "Diffuse and specular"
        },
        {
          "type": "p",
          "text": "Light arriving at a surface does one of two things. Some enters the material, scatters and leaves in all directions: that is **diffuse**, and it gives the surface its colour. Some reflects off the surface boundary like a mirror, blurred by roughness: that is **specular**, and it gives highlights. The simplest diffuse model is Lambert: brightness is `max(0, dot(N, L))`, where N is the surface normal and L the direction to the light. It depends only on the angle between normal and light, not on the viewer."
        },
        {
          "type": "figure",
          "id": "graphics-lambert-orbit",
          "caption": "Lambert brightness follows the cosine of the angle between N and L and clamps to zero once the light passes behind the surface.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"A sphere lit by a light orbiting it. Brightness at each point is max(0, N dot L), so it falls off as the cosine of the angle between the surface normal and the light direction and is clamped to zero on the far side. A plot tracks the angle for one surface point.\"><style>.graphics-lambert-orbit-t{font-size:13px;fill:var(--fig-ink)} .graphics-lambert-orbit-m{font-size:13px;fill:var(--fig-muted)} .graphics-lambert-orbit-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-lambert-orbit-mid{text-anchor:middle} .graphics-lambert-orbit-end{text-anchor:end} .graphics-lambert-orbit-mono{font-family:ui-monospace,Menlo,monospace} .graphics-lambert-orbit-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-lambert-orbit-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-lambert-orbit-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-lambert-orbit-st{stop-color:var(--fig-warn)} .graphics-lambert-orbit-sun{fill:var(--fig-warn);stroke:var(--fig-warn);stroke-width:2} .graphics-lambert-orbit-rot{transform-box:view-box;transform-origin:170px 172px;transform:rotate(-70deg);animation:graphics-lambert-orbit-rot 9s linear infinite} .graphics-lambert-orbit-rotp{transform-box:view-box;transform-origin:239.28px 132px;transform:rotate(-70deg);animation:graphics-lambert-orbit-rot 9s linear infinite} .graphics-lambert-orbit-cr{transform-box:fill-box;transform-origin:50% 50%;transform:rotate(70deg);animation:graphics-lambert-orbit-cr 9s linear infinite} @keyframes graphics-lambert-orbit-rot{0%{transform:rotate(-70deg)}100%{transform:rotate(290deg)}} @keyframes graphics-lambert-orbit-cr{0%{transform:rotate(70deg)}100%{transform:rotate(-290deg)}} .graphics-lambert-orbit-n{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-lambert-orbit-l{stroke:var(--fig-warn);stroke-width:2.5;fill:none} .graphics-lambert-orbit-ah{fill:var(--fig-ink)} .graphics-lambert-orbit-ahl{fill:var(--fig-warn)} .graphics-lambert-orbit-cv{stroke:var(--fig-accent);stroke-width:2.5;fill:none} .graphics-lambert-orbit-cl{stroke:var(--fig-bad);stroke-width:2.5;fill:none} .graphics-lambert-orbit-mk{fill:var(--fig-accent2);stroke:var(--fig-bg);stroke-width:2} .graphics-lambert-orbit-mk{transform:translate(428.89px,115.74px);animation:graphics-lambert-orbit-mk 9s linear infinite}@keyframes graphics-lambert-orbit-mk{0%{transform:translate(428.89px,115.74px)}2.5%{transform:translate(417.89px,105.71px)}5%{transform:translate(406.89px,98.01px)}7.5%{transform:translate(395.89px,92.82px)}10%{transform:translate(384.89px,90.27px)}11.11%{transform:translate(380px,90px)}12.5%{transform:translate(386.11px,90.42px)}15%{transform:translate(397.11px,93.27px)}17.5%{transform:translate(408.11px,98.74px)}20%{transform:translate(419.11px,106.71px)}22.5%{transform:translate(430.11px,116.98px)}25%{transform:translate(441.11px,129.29px)}27.5%{transform:translate(452.11px,143.35px)}30%{transform:translate(463.11px,158.79px)}32.5%{transform:translate(474.11px,175.26px)}35%{transform:translate(485.11px,192.33px)}36.11%{transform:translate(490px,200px)}37.5%{transform:translate(496.11px,200px)}40%{transform:translate(507.11px,200px)}42.5%{transform:translate(518.11px,200px)}45%{transform:translate(529.11px,200px)}47.5%{transform:translate(540.11px,200px)}50%{transform:translate(551.11px,200px)}52.5%{transform:translate(562.11px,200px)}55%{transform:translate(573.11px,200px)}57.5%{transform:translate(584.11px,200px)}60%{transform:translate(595.11px,200px)}61.11%{transform:translate(600px,200px)}62.5%{transform:translate(593.89px,200px)}65%{transform:translate(582.89px,200px)}67.5%{transform:translate(571.89px,200px)}70%{transform:translate(560.89px,200px)}72.5%{transform:translate(549.89px,200px)}75%{transform:translate(538.89px,200px)}77.5%{transform:translate(527.89px,200px)}80%{transform:translate(516.89px,200px)}82.5%{transform:translate(505.89px,200px)}85%{transform:translate(494.89px,200px)}87.5%{transform:translate(483.89px,190.41px)}90%{transform:translate(472.89px,173.39px)}92.5%{transform:translate(461.89px,157.02px)}95%{transform:translate(450.89px,141.71px)}97.5%{transform:translate(439.89px,127.83px)}100%{transform:translate(428.89px,115.74px)}}</style><defs><linearGradient id=\"graphics-lambert-orbit-g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop class=\"graphics-lambert-orbit-st\" offset=\"0\" stop-opacity=\"0\"/><stop class=\"graphics-lambert-orbit-st\" offset=\".5\" stop-opacity=\"0\"/><stop class=\"graphics-lambert-orbit-st\" offset=\"1\" stop-opacity=\".95\"/></linearGradient><clipPath id=\"graphics-lambert-orbit-clip\"><circle cx=\"170\" cy=\"172\" r=\"80\"/></clipPath></defs><text class=\"graphics-lambert-orbit-h\" x=\"20\" y=\"26\">Lambert: max(0, dot(N, L))</text><circle class=\"graphics-lambert-orbit-pn\" cx=\"170\" cy=\"172\" r=\"80\"/><g clip-path=\"url(#graphics-lambert-orbit-clip)\"><g class=\"graphics-lambert-orbit-rot\"><rect x=\"90\" y=\"92\" width=\"160\" height=\"160\" fill=\"url(#graphics-lambert-orbit-g)\"/></g></g><circle cx=\"170\" cy=\"172\" r=\"80\" class=\"graphics-lambert-orbit-ln\"/><circle cx=\"170\" cy=\"172\" r=\"128\" class=\"graphics-lambert-orbit-ln\" stroke-dasharray=\"3 5\"/><g class=\"graphics-lambert-orbit-rot\"><circle class=\"graphics-lambert-orbit-sun\" cx=\"298\" cy=\"172\" r=\"10\"/></g><line class=\"graphics-lambert-orbit-n\" x1=\"239.28\" y1=\"132\" x2=\"265.26\" y2=\"117\"/><circle class=\"graphics-lambert-orbit-ah\" cx=\"265.26\" cy=\"117\" r=\"3.5\"/><text class=\"graphics-lambert-orbit-h\" x=\"261.26\" y=\"109\">N</text><g class=\"graphics-lambert-orbit-rotp\"><line class=\"graphics-lambert-orbit-l\" x1=\"239.28\" y1=\"132\" x2=\"269.28\" y2=\"132\"/><circle class=\"graphics-lambert-orbit-ahl\" cx=\"269.28\" cy=\"132\" r=\"3.5\"/><g class=\"graphics-lambert-orbit-cr\"><text class=\"graphics-lambert-orbit-h\" x=\"277.28\" y=\"137\">L</text></g></g><circle class=\"graphics-lambert-orbit-ah\" cx=\"239.28\" cy=\"132\" r=\"4\"/><text class=\"graphics-lambert-orbit-h\" x=\"380\" y=\"62\">brightness = max(0, cos θ)</text><line class=\"graphics-lambert-orbit-ln\" x1=\"380\" y1=\"84\" x2=\"380\" y2=\"200\"/><line class=\"graphics-lambert-orbit-ln\" x1=\"380\" y1=\"200\" x2=\"604\" y2=\"200\"/><path class=\"graphics-lambert-orbit-cv\" d=\"M380 90L383.67 90.15L387.33 90.6L391 91.35L394.67 92.4L398.33 93.75L402 95.38L405.67 97.31L409.33 99.51L413 101.99L416.67 104.74L420.33 107.75L424 111.01L427.67 114.51L431.33 118.25L435 122.22L438.67 126.4L442.33 130.77L446 135.34L449.67 140.09L453.33 145L457 150.06L460.67 155.26L464.33 160.58L468 166.01L471.67 171.53L475.33 177.13L479 182.79L482.67 188.5L486.33 194.24L490 200\"/><path class=\"graphics-lambert-orbit-cl\" d=\"M490 200 L600 200\"/><text class=\"graphics-lambert-orbit-m graphics-lambert-orbit-end\" x=\"372\" y=\"94\">1</text><text class=\"graphics-lambert-orbit-m graphics-lambert-orbit-end\" x=\"372\" y=\"204\">0</text><text class=\"graphics-lambert-orbit-m graphics-lambert-orbit-mid\" x=\"380\" y=\"222\">0°</text><text class=\"graphics-lambert-orbit-m graphics-lambert-orbit-mid\" x=\"490\" y=\"222\">90°</text><text class=\"graphics-lambert-orbit-m graphics-lambert-orbit-mid\" x=\"600\" y=\"222\">180°</text><text class=\"graphics-lambert-orbit-m graphics-lambert-orbit-mid\" x=\"545\" y=\"190\">clamped to 0</text><text class=\"graphics-lambert-orbit-m graphics-lambert-orbit-mid\" x=\"490\" y=\"246\">θ = angle between N and L</text><circle class=\"graphics-lambert-orbit-mk\" cx=\"0\" cy=\"0\" r=\"6\"/><text class=\"graphics-lambert-orbit-m\" x=\"380\" y=\"284\">Lit side faces the light; the</text><text class=\"graphics-lambert-orbit-m\" x=\"380\" y=\"304\">terminator sits where N ⟂ L.</text></svg>"
        },
        {
          "type": "p",
          "text": "**Blinn-Phong** adds specular with a half-vector H, halfway between L and the view vector V. Specular intensity is `pow(max(0, dot(N, H)), shininess)`. High shininess gives a tight highlight (polished surface), low gives a wide one. It is cheap and looks acceptable, which is why it dominated for twenty years. Its problems are that parameters are not physically meaningful (shininess has no real-world unit), it does not conserve energy (a surface can reflect more light than it receives), and it looks wrong at grazing angles, where real surfaces become more mirror-like."
        },
        {
          "type": "code",
          "lang": "hlsl",
          "text": "float3 BlinnPhong(float3 N, float3 L, float3 V, float3 albedo, float3 lightCol, float shininess)\n{\n    float3 H = normalize(L + V);\n    float diff = saturate(dot(N, L));\n    float spec = pow(saturate(dot(N, H)), shininess) * step(0.0, diff);\n    return (albedo * diff + spec) * lightCol;\n}"
        },
        {
          "type": "figure",
          "id": "graphics-blinn-phong-half",
          "caption": "H always sits halfway between L and V, and the highlight peaks when H lines up with N; higher shininess makes the peak narrower.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 324\" role=\"img\" aria-label=\"Blinn-Phong vectors at a surface point: normal N, view vector V, a moving light vector L and the half vector H halfway between L and V. A plot of pow(dot(N,H), shininess) for shininess 8 and 64 shows the highlight is tight for high shininess, with markers tracking the current H angle.\"><style>.graphics-blinn-phong-half-t{font-size:13px;fill:var(--fig-ink)} .graphics-blinn-phong-half-m{font-size:13px;fill:var(--fig-muted)} .graphics-blinn-phong-half-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-blinn-phong-half-mid{text-anchor:middle} .graphics-blinn-phong-half-end{text-anchor:end} .graphics-blinn-phong-half-mono{font-family:ui-monospace,Menlo,monospace} .graphics-blinn-phong-half-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-blinn-phong-half-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-blinn-phong-half-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-blinn-phong-half-rt{transform-box:view-box;transform-origin:190px 240px} .graphics-blinn-phong-half-cr{transform-box:fill-box;transform-origin:50% 50%} .graphics-blinn-phong-half-aL{transform:rotate(-70deg);animation:graphics-blinn-phong-half-aL 6s linear infinite} .graphics-blinn-phong-half-cL{transform:rotate(70deg);animation:graphics-blinn-phong-half-cL 6s linear infinite} .graphics-blinn-phong-half-aH{transform:rotate(-15deg);animation:graphics-blinn-phong-half-aH 6s linear infinite} .graphics-blinn-phong-half-cH{transform:rotate(15deg);animation:graphics-blinn-phong-half-cH 6s linear infinite}@keyframes graphics-blinn-phong-half-aL{0%{transform:rotate(-70deg)}50%{transform:rotate(-10deg)}100%{transform:rotate(-70deg)}}@keyframes graphics-blinn-phong-half-cL{0%{transform:rotate(70deg)}50%{transform:rotate(10deg)}100%{transform:rotate(70deg)}}@keyframes graphics-blinn-phong-half-aH{0%{transform:rotate(-15deg)}50%{transform:rotate(15deg)}100%{transform:rotate(-15deg)}}@keyframes graphics-blinn-phong-half-cH{0%{transform:rotate(15deg)}50%{transform:rotate(-15deg)}100%{transform:rotate(15deg)}} .graphics-blinn-phong-half-vN{stroke:var(--fig-ink);stroke-width:2} .graphics-blinn-phong-half-vV{stroke:var(--fig-accent2);stroke-width:2.5} .graphics-blinn-phong-half-vL{stroke:var(--fig-warn);stroke-width:2.5} .graphics-blinn-phong-half-vH{stroke:var(--fig-accent);stroke-width:3} .graphics-blinn-phong-half-fN{fill:var(--fig-ink)} .graphics-blinn-phong-half-fV{fill:var(--fig-accent2)} .graphics-blinn-phong-half-fL{fill:var(--fig-warn)} .graphics-blinn-phong-half-fH{fill:var(--fig-accent)} .graphics-blinn-phong-half-c8{stroke:var(--fig-accent2);stroke-width:2.5;fill:none} .graphics-blinn-phong-half-c64{stroke:var(--fig-accent);stroke-width:2.5;fill:none} .graphics-blinn-phong-half-vl{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 4} .graphics-blinn-phong-half-vm{transform:translateX(73.33px);animation:graphics-blinn-phong-half-vm 6s linear infinite}@keyframes graphics-blinn-phong-half-vm{0%{transform:translateX(73.33px)}5%{transform:translateX(80.67px)}10%{transform:translateX(88px)}15%{transform:translateX(95.33px)}20%{transform:translateX(102.67px)}25%{transform:translateX(110px)}30%{transform:translateX(117.33px)}35%{transform:translateX(124.67px)}40%{transform:translateX(132px)}45%{transform:translateX(139.33px)}50%{transform:translateX(146.67px)}55%{transform:translateX(139.33px)}60%{transform:translateX(132px)}65%{transform:translateX(124.67px)}70%{transform:translateX(117.33px)}75%{transform:translateX(110px)}80%{transform:translateX(102.67px)}85%{transform:translateX(95.33px)}90%{transform:translateX(88px)}95%{transform:translateX(80.67px)}100%{transform:translateX(73.33px)}} .graphics-blinn-phong-half-d8{transform:translate(473.33px,113.91px);animation:graphics-blinn-phong-half-d8 6s linear infinite}@keyframes graphics-blinn-phong-half-d8{0%{transform:translate(473.33px,113.91px)}5%{transform:translate(480.67px,102.68px)}10%{transform:translate(488px,93.21px)}15%{transform:translate(495.33px,86.02px)}20%{transform:translate(502.67px,81.53px)}25%{transform:translate(510px,80px)}30%{transform:translate(517.33px,81.53px)}35%{transform:translate(524.67px,86.02px)}40%{transform:translate(532px,93.21px)}45%{transform:translate(539.33px,102.68px)}50%{transform:translate(546.67px,113.91px)}55%{transform:translate(539.33px,102.68px)}60%{transform:translate(532px,93.21px)}65%{transform:translate(524.67px,86.02px)}70%{transform:translate(517.33px,81.53px)}75%{transform:translate(510px,80px)}80%{transform:translate(502.67px,81.53px)}85%{transform:translate(495.33px,86.02px)}90%{transform:translate(488px,93.21px)}95%{transform:translate(480.67px,102.68px)}100%{transform:translate(473.33px,113.91px)}} .graphics-blinn-phong-half-d64{transform:translate(473.33px,204.78px);animation:graphics-blinn-phong-half-d64 6s linear infinite}@keyframes graphics-blinn-phong-half-d64{0%{transform:translate(473.33px,204.78px)}5%{transform:translate(480.67px,185.96px)}10%{transform:translate(488px,156.64px)}15%{transform:translate(495.33px,121.5px)}20%{transform:translate(502.67px,91.76px)}25%{transform:translate(510px,80px)}30%{transform:translate(517.33px,91.76px)}35%{transform:translate(524.67px,121.5px)}40%{transform:translate(532px,156.64px)}45%{transform:translate(539.33px,185.96px)}50%{transform:translate(546.67px,204.78px)}55%{transform:translate(539.33px,185.96px)}60%{transform:translate(532px,156.64px)}65%{transform:translate(524.67px,121.5px)}70%{transform:translate(517.33px,91.76px)}75%{transform:translate(510px,80px)}80%{transform:translate(502.67px,91.76px)}85%{transform:translate(495.33px,121.5px)}90%{transform:translate(488px,156.64px)}95%{transform:translate(480.67px,185.96px)}100%{transform:translate(473.33px,204.78px)}}</style><text class=\"graphics-blinn-phong-half-h\" x=\"30\" y=\"30\">H = normalize(L + V)</text><rect class=\"graphics-blinn-phong-half-pn\" x=\"40\" y=\"240\" width=\"300\" height=\"18\" rx=\"4\"/><g><line class=\"graphics-blinn-phong-half-vN\" x1=\"190\" y1=\"240\" x2=\"190\" y2=\"118\"/><path class=\"graphics-blinn-phong-half-fN\" d=\"M184 120 L190 110 L196 120 Z\"/><text class=\"graphics-blinn-phong-half-h\" x=\"198\" y=\"118\">N</text></g><g transform=\"rotate(40 190 240)\"><line class=\"graphics-blinn-phong-half-vV\" x1=\"190\" y1=\"240\" x2=\"190\" y2=\"118\"/><path class=\"graphics-blinn-phong-half-fV\" d=\"M184 120 L190 110 L196 120 Z\"/><ellipse class=\"graphics-blinn-phong-half-fV\" cx=\"190\" cy=\"96\" rx=\"9\" ry=\"5\" fill-opacity=\".35\"/><circle class=\"graphics-blinn-phong-half-fV\" cx=\"190\" cy=\"96\" r=\"3\"/><text class=\"graphics-blinn-phong-half-h\" x=\"204\" y=\"100\" transform=\"rotate(-40 208 95)\">V</text></g><g class=\"graphics-blinn-phong-half-rt graphics-blinn-phong-half-aL\"><line class=\"graphics-blinn-phong-half-vL\" x1=\"190\" y1=\"240\" x2=\"190\" y2=\"118\"/><path class=\"graphics-blinn-phong-half-fL\" d=\"M184 120 L190 110 L196 120 Z\"/><circle class=\"graphics-blinn-phong-half-fL\" cx=\"190\" cy=\"94\" r=\"8\"/><g class=\"graphics-blinn-phong-half-cr graphics-blinn-phong-half-cL\"><text class=\"graphics-blinn-phong-half-h graphics-blinn-phong-half-mid\" x=\"190\" y=\"78\">L</text></g></g><g class=\"graphics-blinn-phong-half-rt graphics-blinn-phong-half-aH\"><line class=\"graphics-blinn-phong-half-vH\" x1=\"190\" y1=\"240\" x2=\"190\" y2=\"148\"/><path class=\"graphics-blinn-phong-half-fH\" d=\"M184 150 L190 140 L196 150 Z\"/><g class=\"graphics-blinn-phong-half-cr graphics-blinn-phong-half-cH\"><text class=\"graphics-blinn-phong-half-h\" x=\"200\" y=\"158\">H</text></g></g><circle class=\"graphics-blinn-phong-half-fN\" cx=\"190\" cy=\"240\" r=\"4\"/><text class=\"graphics-blinn-phong-half-m\" x=\"40\" y=\"286\">H sits halfway between L and V;</text><text class=\"graphics-blinn-phong-half-m\" x=\"40\" y=\"306\">highlight peaks when H lines up with N.</text><text class=\"graphics-blinn-phong-half-h\" x=\"400\" y=\"40\">pow(dot(N, H), shininess)</text><line class=\"graphics-blinn-phong-half-ln\" x1=\"400\" y1=\"70\" x2=\"400\" y2=\"220\"/><line class=\"graphics-blinn-phong-half-ln\" x1=\"400\" y1=\"220\" x2=\"620\" y2=\"220\"/><path class=\"graphics-blinn-phong-half-c8\" d=\"M400 211.25L403.67 209.27L407.33 206.98L411 204.35L414.67 201.37L418.33 198.03L422 194.31L425.67 190.21L429.33 185.73L433 180.89L436.67 175.7L440.33 170.19L444 164.39L447.67 158.34L451.33 152.08L455 145.69L458.67 139.21L462.33 132.72L466 126.29L469.67 119.99L473.33 113.91L477 108.11L480.67 102.68L484.33 97.69L488 93.21L491.67 89.3L495.33 86.02L499 83.42L502.67 81.53L506.33 80.38L510 80L513.67 80.38L517.33 81.53L521 83.42L524.67 86.02L528.33 89.3L532 93.21L535.67 97.69L539.33 102.68L543 108.11L546.67 113.91L550.33 119.99L554 126.29L557.67 132.72L561.33 139.21L565 145.69L568.67 152.08L572.33 158.34L576 164.39L579.67 170.19L583.33 175.7L587 180.89L590.67 185.73L594.33 190.21L598 194.31L601.67 198.03L605.33 201.37L609 204.35L612.67 206.98L616.33 209.27L620 211.25\"/><path class=\"graphics-blinn-phong-half-c64\" d=\"M400 220L403.67 220L407.33 220L411 220L414.67 220L418.33 220L422 220L425.67 220L429.33 220L433 219.99L436.67 219.99L440.33 219.96L444 219.91L447.67 219.8L451.33 219.57L455 219.12L458.67 218.28L462.33 216.81L466 214.36L469.67 210.51L473.33 204.78L477 196.7L480.67 185.96L484.33 172.49L488 156.64L491.67 139.22L495.33 121.5L499 105.1L502.67 91.76L506.33 83.04L510 80L513.67 83.04L517.33 91.76L521 105.1L524.67 121.5L528.33 139.22L532 156.64L535.67 172.49L539.33 185.96L543 196.7L546.67 204.78L550.33 210.51L554 214.36L557.67 216.81L561.33 218.28L565 219.12L568.67 219.57L572.33 219.8L576 219.91L579.67 219.96L583.33 219.99L587 219.99L590.67 220L594.33 220L598 220L601.67 220L605.33 220L609 220L612.67 220L616.33 220L620 220\"/><text class=\"graphics-blinn-phong-half-m graphics-blinn-phong-half-end\" x=\"392\" y=\"84\">1</text><text class=\"graphics-blinn-phong-half-m graphics-blinn-phong-half-end\" x=\"392\" y=\"224\">0</text><text class=\"graphics-blinn-phong-half-m graphics-blinn-phong-half-mid\" x=\"400\" y=\"240\">−45°</text><text class=\"graphics-blinn-phong-half-m graphics-blinn-phong-half-mid\" x=\"510\" y=\"240\">0°</text><text class=\"graphics-blinn-phong-half-m graphics-blinn-phong-half-mid\" x=\"620\" y=\"240\">45°</text><text class=\"graphics-blinn-phong-half-m graphics-blinn-phong-half-mid\" x=\"510\" y=\"262\">angle between N and H</text><text class=\"graphics-blinn-phong-half-t\" x=\"560\" y=\"112\" fill-opacity=\"1\">8</text><text class=\"graphics-blinn-phong-half-t\" x=\"530\" y=\"74\">64</text><text class=\"graphics-blinn-phong-half-m\" x=\"420\" y=\"296\">shininess 64: tight highlight</text><text class=\"graphics-blinn-phong-half-m\" x=\"420\" y=\"316\">shininess 8: wide highlight</text><rect class=\"graphics-blinn-phong-half-fH\" x=\"404\" y=\"287\" width=\"10\" height=\"10\" rx=\"2\"/><rect class=\"graphics-blinn-phong-half-fV\" x=\"404\" y=\"307\" width=\"10\" height=\"10\" rx=\"2\"/><line class=\"graphics-blinn-phong-half-vl graphics-blinn-phong-half-vm\" x1=\"400\" y1=\"70\" x2=\"400\" y2=\"220\"/><circle class=\"graphics-blinn-phong-half-fV graphics-blinn-phong-half-d8\" cx=\"0\" cy=\"0\" r=\"5\"/><circle class=\"graphics-blinn-phong-half-fH graphics-blinn-phong-half-d64\" cx=\"0\" cy=\"0\" r=\"5\"/></svg>"
        },
        {
          "type": "h",
          "text": "Physically based rendering"
        },
        {
          "type": "p",
          "text": "**PBR** replaces ad-hoc parameters with ones that correspond to measurable properties, and uses a BRDF (bidirectional reflectance distribution function) that conserves energy. The common game workflow is **metallic/roughness**, with three main inputs: base colour (albedo), metallic (0 or 1 in practice, intermediate values only for transitions such as dirt on metal) and roughness (0 mirror-smooth to 1 fully rough). Dielectrics (wood, plastic, skin) have coloured diffuse and a fixed dim specular of about 4 percent reflectance; metals have no diffuse and tint their specular with the base colour."
        },
        {
          "type": "p",
          "text": "The standard real-time specular BRDF, Cook-Torrance, has three terms: a normal distribution function D (how many microfacets face the half-vector, controlled by roughness), a geometry term G (microfacets shadowing each other) and a Fresnel term F (reflectance rises toward 100 percent at grazing angles, via Schlick's approximation). The point of PBR is not realism for its own sake. It is that a material authored once looks consistent under sunlight, a torch and an overcast sky, so artists stop retuning per scene. Specular/glossiness is an alternative workflow, equivalent in power but easier to author incorrectly."
        },
        {
          "type": "h",
          "text": "Normal maps"
        },
        {
          "type": "p",
          "text": "A **normal map** stores a perturbed normal per texel (as RGB, in tangent space) so a flat 2-triangle wall shades as though it had bricks, grout and scratches. The shader samples it, remaps from 0-1 to -1..1, and transforms it by the TBN matrix (tangent, bitangent, normal) built from the mesh. It changes shading only, not silhouettes or depth: look at the wall edge-on and it is flat. Normal maps are baked from high-poly sculpts onto low-poly game meshes, and they must be linear data textures, usually stored in BC5 or ASTC with the Z component reconstructed. Mismatched tangent-space conventions (OpenGL-style versus DirectX-style green channel) cause bumps that look inverted when lit from above."
        },
        {
          "type": "h",
          "text": "Shadow mapping and its artefacts"
        },
        {
          "type": "p",
          "text": "**Shadow mapping** renders the scene's depth from the light's point of view into a depth texture (the shadow map). When shading a pixel, you transform its position into light space and compare its depth to the stored depth: if the pixel is farther, something is in front of it and it is in shadow. Cost is one extra depth-only pass per light (or per cascade), plus texture reads when shading. A directional sun typically uses 3 to 4 **cascades**: shadow maps covering nested ranges of the view frustum, so shadows near the camera get high texel density."
        },
        {
          "type": "list",
          "items": [
            "**Shadow acne**: surfaces shadow themselves because depth precision and slope make them fail the comparison. Fixed with a depth bias and normal-offset bias.",
            "**Peter-panning**: too much bias detaches the shadow from the object's base so it floats. Balance bias per light and scene scale.",
            "**Aliasing and blocky edges**: shadow map texels are visible when one texel covers many pixels. Fixed with cascades, higher resolution, PCF (percentage-closer filtering, averaging several comparisons) or soft filters.",
            "**Shimmering (swimming)**: shadow edges shimmer when the camera moves because texels shift; stabilising cascades by snapping to texel increments reduces it."
          ]
        },
        {
          "type": "figure",
          "id": "graphics-shadow-map-compare",
          "caption": "Each pixel looks up the depth the light saw and is in shadow when it is farther; too little bias gives acne, too much gives peter-panning.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"Shadow mapping: a strip of depth texels rendered from a light above a floating occluder. A probe pixel slides along the ground, reads its texel and compares depths: equal means lit, farther than the stored depth means in shadow. Insets show shadow acne from too little bias and peter-panning from too much.\"><style>.graphics-shadow-map-compare-t{font-size:13px;fill:var(--fig-ink)} .graphics-shadow-map-compare-m{font-size:13px;fill:var(--fig-muted)} .graphics-shadow-map-compare-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-shadow-map-compare-mid{text-anchor:middle} .graphics-shadow-map-compare-end{text-anchor:end} .graphics-shadow-map-compare-mono{font-family:ui-monospace,Menlo,monospace} .graphics-shadow-map-compare-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-shadow-map-compare-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-shadow-map-compare-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-shadow-map-compare-tl{fill:var(--fig-accent)} .graphics-shadow-map-compare-pr{animation:graphics-shadow-map-compare-pr 8s linear infinite} @keyframes graphics-shadow-map-compare-pr{0%{transform:translateX(0)}50%{transform:translateX(320px)}100%{transform:translateX(0)}} .graphics-shadow-map-compare-pl{stroke:var(--fig-accent2);stroke-width:2;stroke-dasharray:5 4} .graphics-shadow-map-compare-pd{fill:var(--fig-accent2);stroke:var(--fig-bg);stroke-width:2} .graphics-shadow-map-compare-pf{fill:none;stroke:var(--fig-accent2);stroke-width:2.5} .graphics-shadow-map-compare-ok{fill:var(--fig-ok)} .graphics-shadow-map-compare-bad{fill:var(--fig-bad)} .graphics-shadow-map-compare-shd{fill:var(--fig-ink);fill-opacity:.28} .graphics-shadow-map-compare-stp{stroke:var(--fig-ink);stroke-opacity:.5;stroke-width:3} .graphics-shadow-map-compare-lt{stroke:var(--fig-warn);stroke-width:2;stroke-dasharray:6 5} .graphics-shadow-map-compare-halo{stroke:var(--fig-bg);stroke-width:5;stroke-linejoin:round;paint-order:stroke} .graphics-shadow-map-compare-on{opacity:1;animation:graphics-shadow-map-compare-on 8s linear infinite} .graphics-shadow-map-compare-off{opacity:0;animation:graphics-shadow-map-compare-off 8s linear infinite}@keyframes graphics-shadow-map-compare-on{0%{opacity:1}14.68%{opacity:1}14.69%{opacity:0}28.43%{opacity:0}28.44%{opacity:1}71.55%{opacity:1}71.56%{opacity:0}85.3%{opacity:0}85.31%{opacity:1}99.99%{opacity:1}100%{opacity:1}}@keyframes graphics-shadow-map-compare-off{0%{opacity:0}14.68%{opacity:0}14.69%{opacity:1}28.43%{opacity:1}28.44%{opacity:0}71.55%{opacity:0}71.56%{opacity:1}85.3%{opacity:1}85.31%{opacity:0}99.99%{opacity:0}100%{opacity:0}}</style><defs><pattern id=\"graphics-shadow-map-compare-stripe\" width=\"7\" height=\"7\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(45)\"><line class=\"graphics-shadow-map-compare-stp\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"7\"/></pattern></defs><text class=\"graphics-shadow-map-compare-h\" x=\"30\" y=\"30\">Directional light, looking down</text><line class=\"graphics-shadow-map-compare-lt\" x1=\"30\" y1=\"44\" x2=\"390\" y2=\"44\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"34\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"56\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"78\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"100\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"122\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"144\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.7\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"166\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.7\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"188\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.7\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"210\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.7\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"232\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"254\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"276\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"298\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"320\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"342\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><rect class=\"graphics-shadow-map-compare-tl\" x=\"364\" y=\"54\" width=\"22\" height=\"20\" fill-opacity=\"0.18\" stroke=\"none\"/><g class=\"graphics-shadow-map-compare-pr\"><line class=\"graphics-shadow-map-compare-pl\" x1=\"50\" y1=\"76\" x2=\"50\" y2=\"272\"/><rect class=\"graphics-shadow-map-compare-pf\" x=\"39\" y=\"52\" width=\"22\" height=\"24\" rx=\"3\"/><circle class=\"graphics-shadow-map-compare-pd\" cx=\"50\" cy=\"280\" r=\"7\"/></g><rect class=\"graphics-shadow-map-compare-ln\" x=\"34\" y=\"54\" width=\"352\" height=\"20\" rx=\"2\"/><text class=\"graphics-shadow-map-compare-m graphics-shadow-map-compare-halo\" x=\"34\" y=\"96\">shadow map: depth seen from the light</text><rect class=\"graphics-shadow-map-compare-pn\" x=\"144\" y=\"150\" width=\"88\" height=\"18\" rx=\"4\" style=\"stroke:var(--fig-ink)\"/><text class=\"graphics-shadow-map-compare-t graphics-shadow-map-compare-halo\" x=\"242\" y=\"164\">occluder (depth 90)</text><rect class=\"graphics-shadow-map-compare-shd\" x=\"144\" y=\"270\" width=\"88\" height=\"10\"/><line class=\"graphics-shadow-map-compare-ink\" x1=\"30\" y1=\"280\" x2=\"390\" y2=\"280\"/><text class=\"graphics-shadow-map-compare-t graphics-shadow-map-compare-halo\" x=\"300\" y=\"268\">ground (220)</text><text class=\"graphics-shadow-map-compare-m\" x=\"30\" y=\"306\">probe pixel: reads its texel, compares depths</text><rect class=\"graphics-shadow-map-compare-pn\" x=\"415\" y=\"40\" width=\"210\" height=\"128\" rx=\"12\"/><text class=\"graphics-shadow-map-compare-m\" x=\"430\" y=\"68\">pixel depth from light</text><text class=\"graphics-shadow-map-compare-t graphics-shadow-map-compare-end\" x=\"610\" y=\"68\">220</text><text class=\"graphics-shadow-map-compare-m\" x=\"430\" y=\"96\">shadow map stores</text><text class=\"graphics-shadow-map-compare-t graphics-shadow-map-compare-end graphics-shadow-map-compare-on\" x=\"610\" y=\"96\">220</text><text class=\"graphics-shadow-map-compare-t graphics-shadow-map-compare-end graphics-shadow-map-compare-off\" x=\"610\" y=\"96\">90</text><line class=\"graphics-shadow-map-compare-ln\" x1=\"430\" y1=\"112\" x2=\"610\" y2=\"112\"/><text class=\"graphics-shadow-map-compare-h graphics-shadow-map-compare-mid graphics-shadow-map-compare-on\" x=\"520\" y=\"146\"><tspan class=\"graphics-shadow-map-compare-ok\">220 ≤ 220 → lit</tspan></text><text class=\"graphics-shadow-map-compare-h graphics-shadow-map-compare-mid graphics-shadow-map-compare-off\" x=\"520\" y=\"146\"><tspan class=\"graphics-shadow-map-compare-bad\">220 &gt; 90 → in shadow</tspan></text><rect class=\"graphics-shadow-map-compare-pn\" x=\"425\" y=\"188\" width=\"80\" height=\"56\" rx=\"8\"/><rect x=\"433\" y=\"214\" width=\"64\" height=\"18\" fill=\"url(#graphics-shadow-map-compare-stripe)\"/><line class=\"graphics-shadow-map-compare-ink\" x1=\"433\" y1=\"214\" x2=\"497\" y2=\"214\"/><text class=\"graphics-shadow-map-compare-h\" x=\"517\" y=\"210\">Shadow acne</text><text class=\"graphics-shadow-map-compare-m\" x=\"517\" y=\"230\">bias too small</text><rect class=\"graphics-shadow-map-compare-pn\" x=\"425\" y=\"260\" width=\"80\" height=\"56\" rx=\"8\"/><line class=\"graphics-shadow-map-compare-ink\" x1=\"433\" y1=\"304\" x2=\"497\" y2=\"304\"/><rect class=\"graphics-shadow-map-compare-pn\" x=\"447\" y=\"278\" width=\"16\" height=\"26\" rx=\"2\" style=\"stroke:var(--fig-ink)\"/><rect class=\"graphics-shadow-map-compare-shd\" x=\"474\" y=\"299\" width=\"20\" height=\"5\" rx=\"1\"/><text class=\"graphics-shadow-map-compare-h\" x=\"517\" y=\"282\">Peter-panning</text><text class=\"graphics-shadow-map-compare-m\" x=\"517\" y=\"302\">bias too large</text></svg>"
        },
        {
          "type": "h",
          "text": "Global illumination, lightmaps and light probes"
        },
        {
          "type": "p",
          "text": "Direct lighting is only a fraction of what you see. **Global illumination (GI)** is light bouncing between surfaces: sunlight hitting a red wall tints the white floor beside it. Real-time ray-traced GI exists on high-end hardware and in some engines, but across mobile, console and PC the dominant technique is still to **bake** it offline. A **lightmap** is a texture, mapped with a second UV channel (UV2) unique per static surface, that stores precomputed direct and indirect light. At runtime shading reads it for almost free. Costs are memory (lightmaps are large), bake time, and the fact that dynamic objects and moving lights are not included."
        },
        {
          "type": "p",
          "text": "**Light probes** fill the gap for dynamic objects: a grid of sample points in the scene stores the baked lighting at each point as spherical harmonics (a compact low-frequency representation, typically 9 coefficients per colour channel). A moving character interpolates between the nearest probes to pick up the ambient light of where it stands. **Reflection probes** capture a cubemap of the surroundings for shiny surfaces. Probe placement is a real craft: too sparse and characters glow wrongly walking through shadowed doorways, or too dense and you waste memory and bake time."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Budget thinking: a 2048x2048 lightmap in a compressed format is a few MB, but a large level can need dozens. Lightmap resolution is expressed in texels per metre; spend it on surfaces where the player looks and use lower density on hidden or uniform areas."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents tend to write 'realistic' shaders from memory: Phong with energy-violating constants, PBR with gamma-space inputs, or a normal map sampled as sRGB. Tell the agent which pipeline and material model you use, and ask it to modify existing shaders instead of generating them from scratch. Verify with a reference scene: a smooth metal sphere, a rough dielectric sphere and a grey ramp under one light and one environment. Check that roughness 0 gives a sharp reflection, that values stay energy-plausible, and that shadows show neither acne nor floating."
        },
        {
          "type": "p",
          "text": "Bring it together on a typical mobile level: static geometry uses baked lightmaps (indirect plus most direct light), one realtime directional light with 2 cascades casts shadows from characters, characters take ambient light from probes, and materials use compact metallic/roughness maps packed into one texture's channels. Each piece trades flexibility for cost, and the skill is deciding where flexibility is actually needed."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Static level geometry needs soft indirect light and the real-time lighting cost is too high",
              "use": "Bake lightmaps",
              "why": "Precompute direct and indirect light into textures, so runtime cost is one fetch. Lights and geometry must stay static; bakes cost iteration time and lightmap memory."
            },
            {
              "signal": "A moving character stays brightly lit when walking from a sunny courtyard into a baked dark corridor",
              "use": "Light probes for dynamic objects",
              "why": "Probes sample baked indirect light at points in space, and dynamic objects interpolate between them. Place them densely where light changes, especially at doorways and shadow edges."
            },
            {
              "signal": "Shiny objects reflect the sky indoors, or reflections do not line up with the room's walls",
              "use": "Local reflection probes",
              "why": "Place probes per area so reflections show the local surroundings; box projection aligns them with room walls. Real-time probe updates are expensive, so bake them where possible."
            },
            {
              "signal": "Sun shadows are blocky near the camera because one shadow map covers the whole view distance",
              "use": "Cascaded shadow maps",
              "why": "Split the view frustum into ranges, each with its own shadow map, so near shadows get the resolution. Each cascade adds a shadow render pass; also cap shadow distance."
            },
            {
              "signal": "Shadows show stripy self-shadowing (acne), or they float detached from the feet (peter-panning)",
              "use": "Tune depth and normal bias",
              "why": "Acne means too little bias; detached shadows mean too much. Use a small depth bias plus normal-offset bias, and tune per light rather than raising one value."
            },
            {
              "signal": "Artists retune shininess per scene because materials look right under one lighting setup and wrong under another",
              "use": "PBR metallic/roughness workflow",
              "why": "An energy-conserving BRDF with measurable parameters keeps materials consistent under any light. Needs reference values and linear-space lighting to pay off."
            },
            {
              "signal": "A metal surface looks like dull grey plastic even with low roughness",
              "use": "Metallic as a near-binary mask",
              "why": "Metals need metallic = 1 with the tint in base colour; dielectrics need metallic = 0. In-between values are only for transitions such as rust or dirt edges."
            },
            {
              "signal": "Surface detail like bricks or scratches is needed but the triangle budget is already spent",
              "use": "Normal map instead of geometry",
              "why": "Fakes shading detail at a texture fetch per pixel. Silhouettes and grazing views stay flat, so large forms still need real geometry or parallax techniques."
            },
            {
              "signal": "Many point and spot lights cast real-time shadows and shadow rendering dominates the GPU frame",
              "use": "Shadow caster budget",
              "why": "Point lights render up to six shadow faces each. Limit shadowed lights to the few that matter, bake the rest, and cull shadow casters by distance."
            }
          ]
        }
      ],
      "keyPoints": [
        "Diffuse is scattered colour light; specular is boundary reflection. Blinn-Phong is cheap but not energy-conserving or physically meaningful.",
        "PBR metallic/roughness uses measurable parameters and an energy-conserving BRDF, so materials look consistent under any lighting.",
        "Normal maps fake shading detail only: silhouettes and depth stay flat, and the maps must be linear data.",
        "Shadow maps compare depth from the light; tune bias to avoid acne (too little) and peter-panning (too much), and use cascades for sun shadows.",
        "Baked lightmaps carry static GI cheaply; light probes and reflection probes give dynamic objects matching indirect light."
      ],
      "quiz": [
        {
          "q": "A character's shadow on the ground appears detached, floating a few centimetres away from the feet. Which setting is the most likely culprit?",
          "options": [
            "Shadow bias set too low",
            "Shadow bias set too high",
            "Cascade count set too high",
            "Lightmap resolution set too low"
          ],
          "answer": 1,
          "explain": "That is peter-panning: excessive bias pushes the depth comparison so far that shadow contact is lost. Too little bias gives acne (speckled self-shadowing) instead. Cascade count and lightmap density do not move shadow contact."
        },
        {
          "q": "A metallic sphere looks dull grey instead of reflecting the environment, even though roughness is low. The material has metallic = 0 and a grey base colour. What is wrong?",
          "options": [
            "Metallic should be near 1 so the surface uses tinted specular and no diffuse",
            "Roughness should be raised so that the highlight spreads out",
            "The base colour should be white for reflections to appear",
            "The normal map should be disabled to allow reflections"
          ],
          "answer": 0,
          "explain": "With metallic = 0 the material is a dielectric with a diffuse grey body and only a ~4 percent specular reflection. Setting metallic to 1 gives full coloured reflection. Roughness changes the blur of reflections, not their strength."
        },
        {
          "q": "A flat wall with a brick normal map looks convincingly bumpy face-on, but at a steep grazing angle its silhouette is a perfectly straight line. Why?",
          "options": [
            "The normal map is stored in too low a resolution",
            "The tangent space is flipped for this mesh",
            "Mipmaps flatten the normals at grazing angles",
            "Normal maps change shading only, not geometry or depth"
          ],
          "answer": 3,
          "explain": "A normal map perturbs the normal used in the lighting equation. The triangles stay flat, so the edge outline stays straight. Parallax or tessellation or real geometry is needed to change silhouettes."
        },
        {
          "q": "A moving enemy walks from a sunlit courtyard into a baked, shadowed corridor but stays brightly lit in the corridor. Static walls look correctly dark. What should you fix?",
          "options": [
            "Raise the lightmap resolution on the corridor walls",
            "Add or tighten light probes inside the corridor",
            "Increase the sun's shadow cascade count",
            "Switch the walls from baked to realtime lighting"
          ],
          "answer": 1,
          "explain": "Lightmaps only light static surfaces. Dynamic objects get indirect light from probes, and sparse probes near the doorway leave the enemy interpolating sunlit values. Lightmap resolution or cascades do not affect dynamic object ambient."
        },
        {
          "q": "Why does the metallic/roughness PBR workflow usually give more consistent results across lighting conditions than a Blinn-Phong material with hand-tuned shininess?",
          "options": [
            "It avoids using normal maps and shadow maps entirely",
            "It computes lighting at lower cost per pixel on all GPUs",
            "Its parameters map to physical properties and its BRDF conserves energy",
            "It always stores materials in a linear 16-bit float format"
          ],
          "answer": 2,
          "explain": "PBR's parameters describe the surface (reflectance, roughness), and the BRDF cannot reflect more energy than arrives, so one material behaves plausibly everywhere. It is usually not cheaper, and it still uses normal and shadow maps."
        },
        {
          "q": "A 4096 sun shadow map is already in use, yet shadows are crude around the player while shadows on hills 600 m away look fine. Raising the resolution further blows the memory budget. What should you reach for?",
          "options": [
            "Cascaded shadow maps that split the view range into slices",
            "Raise the depth bias and the normal bias on the sun light a lot",
            "Cap the number of real-time shadow casters in the scene",
            "Bake the sun shadows into static lightmaps for the level"
          ],
          "answer": 0,
          "explain": "Cascades give each distance band its own shadow map, so near slices get high texel density cheaply. Bias fixes acne or floating shadows, not blocky resolution, and baking would lose shadows on moving characters."
        }
      ]
    },
    {
      "id": "graphics-render-paths-postfx",
      "title": "Render paths, transparency and post-processing",
      "minutes": 14,
      "summary": "How forward, deferred and forward+ organise lighting work, why transparency is hard, and how HDR, tonemapping, bloom, anti-aliasing and upscalers shape the final image.",
      "lesson": [
        {
          "type": "p",
          "text": "You add the 40th point light to a night street scene and the frame rate collapses from 60 to 25, even though nothing else changed. A particle-heavy explosion drops the same game to 20 fps on phones while the CPU is idle. Both problems come from how the renderer organises its work: which **render path** it uses and how it deals with transparent surfaces. This lesson covers those structures and the full-screen processing that turns raw lit pixels into the final image."
        },
        {
          "type": "h",
          "text": "Forward, deferred and forward+"
        },
        {
          "type": "p",
          "text": "**Forward rendering** shades each object in one pass: for every mesh, the fragment shader loops over the lights affecting it and outputs a final colour. It is simple, supports transparency, MSAA and many material types, and uses little memory. Its cost scales as objects times lights: a fragment is shaded for every light that touches its object, including fragments that are later overdrawn. Classic forward therefore caps real-time lights at a handful per object (in Unity's built-in pipeline, a few per-pixel lights plus cheap vertex or spherical-harmonic ones)."
        },
        {
          "type": "p",
          "text": "**Deferred rendering** splits the work. A geometry pass writes surface attributes (albedo, normal, roughness, metallic, depth) into several render targets, the **G-buffer**. A lighting pass then runs once per light over only the screen pixels it affects, reading the G-buffer. Each pixel is lit once regardless of overdraw, so hundreds of lights are affordable. The costs: a fat G-buffer (e.g. four RGBA8 targets is 16 bytes per pixel, about 33 MB at 1080p, and much more bandwidth), no hardware MSAA (so you rely on post-process AA), and transparent objects still need a separate forward pass. On tile-based mobile GPUs deferred is possible but bandwidth-hungry unless the API keeps the G-buffer on-chip."
        },
        {
          "type": "figure",
          "id": "graphics-forward-deferred",
          "caption": "Forward shades every object once per light; deferred writes the G-buffer once and then lights only the pixels each light touches.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 372\" role=\"img\" aria-label=\"Forward rendering shades each mesh by looping over every light, so work scales with objects times lights. Deferred rendering writes albedo, normal, roughness and metallic, and depth into a G-buffer in a geometry pass, then a lighting pass shades each pixel once per light; four RGBA8 targets cost 16 bytes per pixel, about 33 MB at 1080p.\"><style>.graphics-forward-deferred-t{font-size:13px;fill:var(--fig-ink)} .graphics-forward-deferred-m{font-size:13px;fill:var(--fig-muted)} .graphics-forward-deferred-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-forward-deferred-mid{text-anchor:middle} .graphics-forward-deferred-end{text-anchor:end} .graphics-forward-deferred-mono{font-family:ui-monospace,Menlo,monospace} .graphics-forward-deferred-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-forward-deferred-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-forward-deferred-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-forward-deferred-hl{fill:var(--fig-accent);opacity:0} .graphics-forward-deferred-gl{fill:var(--fig-accent2);opacity:0} .graphics-forward-deferred-ar{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .graphics-forward-deferred-ah{fill:var(--fig-muted)} .graphics-forward-deferred-f0{animation:graphics-forward-deferred-f0 7.2s linear infinite}@keyframes graphics-forward-deferred-f0{0%{opacity:0}0%{opacity:0}1%{opacity:0.55}10%{opacity:0.55}11%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-f1{animation:graphics-forward-deferred-f1 7.2s linear infinite}@keyframes graphics-forward-deferred-f1{0%{opacity:0}10%{opacity:0}11%{opacity:0.55}20%{opacity:0.55}21%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-f2{animation:graphics-forward-deferred-f2 7.2s linear infinite}@keyframes graphics-forward-deferred-f2{0%{opacity:0}20%{opacity:0}21%{opacity:0.55}30%{opacity:0.55}31%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-f3{animation:graphics-forward-deferred-f3 7.2s linear infinite}@keyframes graphics-forward-deferred-f3{0%{opacity:0}30%{opacity:0}31%{opacity:0.55}40%{opacity:0.55}41%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-f4{animation:graphics-forward-deferred-f4 7.2s linear infinite}@keyframes graphics-forward-deferred-f4{0%{opacity:0}40%{opacity:0}41%{opacity:0.55}50%{opacity:0.55}51%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-f5{animation:graphics-forward-deferred-f5 7.2s linear infinite}@keyframes graphics-forward-deferred-f5{0%{opacity:0}50%{opacity:0}51%{opacity:0.55}60%{opacity:0.55}61%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-f6{animation:graphics-forward-deferred-f6 7.2s linear infinite}@keyframes graphics-forward-deferred-f6{0%{opacity:0}60%{opacity:0}61%{opacity:0.55}70%{opacity:0.55}71%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-f7{animation:graphics-forward-deferred-f7 7.2s linear infinite}@keyframes graphics-forward-deferred-f7{0%{opacity:0}70%{opacity:0}71%{opacity:0.55}80%{opacity:0.55}81%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-f8{animation:graphics-forward-deferred-f8 7.2s linear infinite}@keyframes graphics-forward-deferred-f8{0%{opacity:0}80%{opacity:0}81%{opacity:0.55}90%{opacity:0.55}91%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-g0{animation:graphics-forward-deferred-g0 7.2s linear infinite}@keyframes graphics-forward-deferred-g0{0%{opacity:0}0%{opacity:0}6%{opacity:0.45}92%{opacity:0.45}98%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-g1{animation:graphics-forward-deferred-g1 7.2s linear infinite}@keyframes graphics-forward-deferred-g1{0%{opacity:0}8%{opacity:0}14%{opacity:0.45}92%{opacity:0.45}98%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-g2{animation:graphics-forward-deferred-g2 7.2s linear infinite}@keyframes graphics-forward-deferred-g2{0%{opacity:0}16%{opacity:0}22%{opacity:0.45}92%{opacity:0.45}98%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-g3{animation:graphics-forward-deferred-g3 7.2s linear infinite}@keyframes graphics-forward-deferred-g3{0%{opacity:0}24%{opacity:0}30%{opacity:0.45}92%{opacity:0.45}98%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-lp{animation:graphics-forward-deferred-lp 7.2s linear infinite}@keyframes graphics-forward-deferred-lp{0%{opacity:0}40%{opacity:0}46%{opacity:0.3}92%{opacity:0.3}98%{opacity:0}100%{opacity:0}} .graphics-forward-deferred-ct{animation:graphics-forward-deferred-ct 7.2s linear infinite}@keyframes graphics-forward-deferred-ct{0%{opacity:0}62%{opacity:0}68%{opacity:0.3}92%{opacity:0.3}98%{opacity:0}100%{opacity:0}}</style><defs><marker id=\"graphics-forward-deferred-m\" viewBox=\"0 0 8 8\" refX=\"7\" refY=\"4\" markerWidth=\"8\" markerHeight=\"8\" orient=\"auto\"><path class=\"graphics-forward-deferred-ah\" d=\"M0 0 L8 4 L0 8 Z\"/></marker></defs><text class=\"graphics-forward-deferred-h\" x=\"20\" y=\"28\">Forward: every object loops over its lights</text><rect class=\"graphics-forward-deferred-pn\" x=\"20\" y=\"46\" width=\"96\" height=\"26\" rx=\"8\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"68\" y=\"64\">Mesh A</text><line class=\"graphics-forward-deferred-ar\" x1=\"118\" y1=\"59\" x2=\"146\" y2=\"59\" marker-end=\"url(#graphics-forward-deferred-m)\"/><rect class=\"graphics-forward-deferred-pn\" x=\"20\" y=\"80\" width=\"96\" height=\"26\" rx=\"8\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"68\" y=\"98\">Mesh B</text><line class=\"graphics-forward-deferred-ar\" x1=\"118\" y1=\"93\" x2=\"146\" y2=\"93\" marker-end=\"url(#graphics-forward-deferred-m)\"/><rect class=\"graphics-forward-deferred-pn\" x=\"20\" y=\"114\" width=\"96\" height=\"26\" rx=\"8\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"68\" y=\"132\">Mesh C</text><line class=\"graphics-forward-deferred-ar\" x1=\"118\" y1=\"127\" x2=\"146\" y2=\"127\" marker-end=\"url(#graphics-forward-deferred-m)\"/><rect class=\"graphics-forward-deferred-pn\" x=\"150\" y=\"40\" width=\"250\" height=\"110\" rx=\"10\"/><rect class=\"graphics-forward-deferred-pn\" x=\"168\" y=\"48\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f0\" x=\"168\" y=\"48\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"200\" y=\"65\">light 1</text><rect class=\"graphics-forward-deferred-pn\" x=\"242\" y=\"48\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f1\" x=\"242\" y=\"48\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"274\" y=\"65\">light 2</text><rect class=\"graphics-forward-deferred-pn\" x=\"316\" y=\"48\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f2\" x=\"316\" y=\"48\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"348\" y=\"65\">light 3</text><rect class=\"graphics-forward-deferred-pn\" x=\"168\" y=\"82\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f3\" x=\"168\" y=\"82\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"200\" y=\"99\">light 1</text><rect class=\"graphics-forward-deferred-pn\" x=\"242\" y=\"82\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f4\" x=\"242\" y=\"82\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"274\" y=\"99\">light 2</text><rect class=\"graphics-forward-deferred-pn\" x=\"316\" y=\"82\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f5\" x=\"316\" y=\"82\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"348\" y=\"99\">light 3</text><rect class=\"graphics-forward-deferred-pn\" x=\"168\" y=\"116\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f6\" x=\"168\" y=\"116\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"200\" y=\"133\">light 1</text><rect class=\"graphics-forward-deferred-pn\" x=\"242\" y=\"116\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f7\" x=\"242\" y=\"116\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"274\" y=\"133\">light 2</text><rect class=\"graphics-forward-deferred-pn\" x=\"316\" y=\"116\" width=\"64\" height=\"24\" rx=\"6\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-f8\" x=\"316\" y=\"116\" width=\"64\" height=\"24\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"348\" y=\"133\">light 3</text><line class=\"graphics-forward-deferred-ar\" x1=\"402\" y1=\"95\" x2=\"446\" y2=\"95\" marker-end=\"url(#graphics-forward-deferred-m)\"/><rect class=\"graphics-forward-deferred-pn\" x=\"450\" y=\"70\" width=\"150\" height=\"50\" rx=\"10\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"525\" y=\"100\">Colour target</text><text class=\"graphics-forward-deferred-m\" x=\"150\" y=\"172\">shading work ≈ objects × lights, overdraw included</text><text class=\"graphics-forward-deferred-h\" x=\"20\" y=\"212\">Deferred: write a G-buffer once, then light pixels</text><rect class=\"graphics-forward-deferred-pn\" x=\"20\" y=\"236\" width=\"100\" height=\"100\" rx=\"10\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"70\" y=\"282\">Geometry</text><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"70\" y=\"300\">pass</text><line class=\"graphics-forward-deferred-ar\" x1=\"122\" y1=\"286\" x2=\"156\" y2=\"286\" marker-end=\"url(#graphics-forward-deferred-m)\"/><rect class=\"graphics-forward-deferred-pn\" x=\"160\" y=\"234\" width=\"160\" height=\"22\" rx=\"6\"/><rect class=\"graphics-forward-deferred-gl graphics-forward-deferred-g0\" x=\"160\" y=\"234\" width=\"160\" height=\"22\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"240\" y=\"250\">albedo</text><rect class=\"graphics-forward-deferred-pn\" x=\"160\" y=\"260\" width=\"160\" height=\"22\" rx=\"6\"/><rect class=\"graphics-forward-deferred-gl graphics-forward-deferred-g1\" x=\"160\" y=\"260\" width=\"160\" height=\"22\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"240\" y=\"276\">normal</text><rect class=\"graphics-forward-deferred-pn\" x=\"160\" y=\"286\" width=\"160\" height=\"22\" rx=\"6\"/><rect class=\"graphics-forward-deferred-gl graphics-forward-deferred-g2\" x=\"160\" y=\"286\" width=\"160\" height=\"22\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"240\" y=\"302\">roughness / metallic</text><rect class=\"graphics-forward-deferred-pn\" x=\"160\" y=\"312\" width=\"160\" height=\"22\" rx=\"6\"/><rect class=\"graphics-forward-deferred-gl graphics-forward-deferred-g3\" x=\"160\" y=\"312\" width=\"160\" height=\"22\" rx=\"6\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"240\" y=\"328\">depth</text><line class=\"graphics-forward-deferred-ar\" x1=\"322\" y1=\"286\" x2=\"352\" y2=\"286\" marker-end=\"url(#graphics-forward-deferred-m)\"/><rect class=\"graphics-forward-deferred-pn\" x=\"356\" y=\"236\" width=\"124\" height=\"100\" rx=\"10\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-lp\" x=\"356\" y=\"236\" width=\"124\" height=\"100\" rx=\"10\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"418\" y=\"274\">Lighting pass</text><text class=\"graphics-forward-deferred-m graphics-forward-deferred-mid\" x=\"418\" y=\"294\">once per light,</text><text class=\"graphics-forward-deferred-m graphics-forward-deferred-mid\" x=\"418\" y=\"312\">its pixels only</text><line class=\"graphics-forward-deferred-ar\" x1=\"482\" y1=\"286\" x2=\"506\" y2=\"286\" marker-end=\"url(#graphics-forward-deferred-m)\"/><rect class=\"graphics-forward-deferred-pn\" x=\"510\" y=\"261\" width=\"110\" height=\"50\" rx=\"10\"/><rect class=\"graphics-forward-deferred-hl graphics-forward-deferred-ct\" x=\"510\" y=\"261\" width=\"110\" height=\"50\" rx=\"10\"/><text class=\"graphics-forward-deferred-t graphics-forward-deferred-mid\" x=\"565\" y=\"291\">Colour</text><text class=\"graphics-forward-deferred-m\" x=\"160\" y=\"360\">4 × RGBA8 = 16 bytes per pixel ≈ 33 MB at 1080p</text></svg>"
        },
        {
          "type": "p",
          "text": "**Forward+** (tiled or clustered forward) keeps the forward pass but first builds a per-tile or per-cluster list of lights, usually in a compute shader: the screen is divided into tiles (16x16 pixels is typical) (clusters add depth slices), and each tile records which lights intersect it. The fragment shader loops over only its tile's lights. You get many lights, MSAA and transparency in one path, at the cost of extra compute and list management. Modern pipelines (Unity's Forward+ in URP 14 and later, Unreal's clustered options) lean this way because it scales to many lights without a G-buffer."
        },
        {
          "type": "list",
          "items": [
            "**Forward**: cheap memory, MSAA and transparency work, light count is the limit. Best for mobile and VR with few lights.",
            "**Deferred**: many lights, decoupled from geometry cost, heavy bandwidth, no MSAA. Best for light-dense scenes on desktop and console.",
            "**Forward+**: many lights with forward's flexibility, needs compute or clustering. A strong default when targeting a wide device range."
          ]
        },
        {
          "type": "h",
          "text": "Transparency, sorting and overdraw"
        },
        {
          "type": "p",
          "text": "**Alpha blending** computes `out = src.rgb * src.a + dst.rgb * (1 - src.a)`. The operation is not commutative: blending A over B differs from B over A, so transparent triangles must be drawn **back to front**. Opaque geometry avoids this because the depth buffer resolves visibility in any order. Transparent objects are therefore drawn after opaques, sorted by distance, with depth writes usually off (they test against depth but do not write it). Sorting per object fails for large or intersecting objects (a glass window crossing a smoke cloud), which show popping or wrong ordering. Alternatives: alpha testing (cutout, binary and aliased, great for foliage with alpha-to-coverage), dithered transparency, or order-independent techniques (weighted blended OIT) that approximate the order."
        },
        {
          "type": "p",
          "text": "**Overdraw** is shading the same pixel multiple times. Opaque overdraw is reduced by sorting front to back and early-Z, but transparent overdraw cannot be skipped: every layer of a smoke particle is blended. A full-screen particle effect with 10 layers means 10 times the fill-rate cost of the screen, which is exactly the phone explosion problem. Mitigations: smaller quads that tightly fit the visible shape, fewer and larger particles with better textures, half-resolution rendering of particles then compositing, and overdraw visualisation views to find hotspots."
        },
        {
          "type": "figure",
          "id": "graphics-alpha-overdraw",
          "caption": "Transparent quads must be blended far to near, and every layer covering a pixel shades it again.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 316\" role=\"img\" aria-label=\"Four transparent quads drawn back to front, from far to near, so alpha blending composes correctly. Where all four overlap the pixel is shaded four times, which is overdraw; ten full screen layers cost ten times the fill rate.\"><style>.graphics-alpha-overdraw-t{font-size:13px;fill:var(--fig-ink)} .graphics-alpha-overdraw-m{font-size:13px;fill:var(--fig-muted)} .graphics-alpha-overdraw-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-alpha-overdraw-mid{text-anchor:middle} .graphics-alpha-overdraw-end{text-anchor:end} .graphics-alpha-overdraw-mono{font-family:ui-monospace,Menlo,monospace} .graphics-alpha-overdraw-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-alpha-overdraw-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-alpha-overdraw-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-alpha-overdraw-q{fill:var(--fig-accent);fill-opacity:.22;stroke:var(--fig-accent);stroke-width:1.5} .graphics-alpha-overdraw-blk{fill:var(--fig-accent);fill-opacity:.55} .graphics-alpha-overdraw-dot{fill:var(--fig-accent2)} .graphics-alpha-overdraw-v0{animation:graphics-alpha-overdraw-v0 8s linear infinite}@keyframes graphics-alpha-overdraw-v0{0%{opacity:1}99.99%{opacity:1}100%{opacity:1}} .graphics-alpha-overdraw-v1{animation:graphics-alpha-overdraw-v1 8s linear infinite}@keyframes graphics-alpha-overdraw-v1{0%{opacity:1}14.99%{opacity:1}15%{opacity:0}24.99%{opacity:0}25%{opacity:1}99.99%{opacity:1}100%{opacity:1}} .graphics-alpha-overdraw-v2{animation:graphics-alpha-overdraw-v2 8s linear infinite}@keyframes graphics-alpha-overdraw-v2{0%{opacity:1}14.99%{opacity:1}15%{opacity:0}41.99%{opacity:0}42%{opacity:1}99.99%{opacity:1}100%{opacity:1}} .graphics-alpha-overdraw-v3{animation:graphics-alpha-overdraw-v3 8s linear infinite}@keyframes graphics-alpha-overdraw-v3{0%{opacity:1}14.99%{opacity:1}15%{opacity:0}58.99%{opacity:0}59%{opacity:1}99.99%{opacity:1}100%{opacity:1}}</style><text class=\"graphics-alpha-overdraw-h\" x=\"20\" y=\"30\">Transparent quads, drawn back to front</text><g class=\"graphics-alpha-overdraw-v0\"><rect class=\"graphics-alpha-overdraw-q\" x=\"40\" y=\"52\" width=\"150\" height=\"120\" rx=\"10\"/><text class=\"graphics-alpha-overdraw-t graphics-alpha-overdraw-end\" x=\"180\" y=\"72\">1 far</text></g><g class=\"graphics-alpha-overdraw-v1\"><rect class=\"graphics-alpha-overdraw-q\" x=\"75\" y=\"80\" width=\"150\" height=\"120\" rx=\"10\"/><text class=\"graphics-alpha-overdraw-t graphics-alpha-overdraw-end\" x=\"215\" y=\"100\">2</text></g><g class=\"graphics-alpha-overdraw-v2\"><rect class=\"graphics-alpha-overdraw-q\" x=\"110\" y=\"108\" width=\"150\" height=\"120\" rx=\"10\"/><text class=\"graphics-alpha-overdraw-t graphics-alpha-overdraw-end\" x=\"250\" y=\"128\">3</text></g><g class=\"graphics-alpha-overdraw-v3\"><rect class=\"graphics-alpha-overdraw-q\" x=\"145\" y=\"136\" width=\"150\" height=\"120\" rx=\"10\"/><text class=\"graphics-alpha-overdraw-t graphics-alpha-overdraw-end\" x=\"285\" y=\"156\">4 near</text></g><g class=\"graphics-alpha-overdraw-v3\"><text class=\"graphics-alpha-overdraw-h graphics-alpha-overdraw-mid\" x=\"167\" y=\"166\">4×</text></g><text class=\"graphics-alpha-overdraw-m\" x=\"20\" y=\"300\">10 full-screen layers = 10× the fill-rate cost</text><text class=\"graphics-alpha-overdraw-t graphics-alpha-overdraw-mono\" x=\"340\" y=\"52\">out = src.rgb·src.a</text><text class=\"graphics-alpha-overdraw-t graphics-alpha-overdraw-mono\" x=\"356\" y=\"72\">+ dst.rgb·(1 − src.a)</text><text class=\"graphics-alpha-overdraw-h\" x=\"340\" y=\"112\">Draw order, sorted by distance</text><g class=\"graphics-alpha-overdraw-v0\"><circle class=\"graphics-alpha-overdraw-dot\" cx=\"348\" cy=\"131\" r=\"4\"/></g><text class=\"graphics-alpha-overdraw-t\" x=\"362\" y=\"136\">quad 1</text><text class=\"graphics-alpha-overdraw-m graphics-alpha-overdraw-end\" x=\"470\" y=\"136\">9.2 m</text><g class=\"graphics-alpha-overdraw-v1\"><circle class=\"graphics-alpha-overdraw-dot\" cx=\"348\" cy=\"157\" r=\"4\"/></g><text class=\"graphics-alpha-overdraw-t\" x=\"362\" y=\"162\">quad 2</text><text class=\"graphics-alpha-overdraw-m graphics-alpha-overdraw-end\" x=\"470\" y=\"162\">6.5 m</text><g class=\"graphics-alpha-overdraw-v2\"><circle class=\"graphics-alpha-overdraw-dot\" cx=\"348\" cy=\"183\" r=\"4\"/></g><text class=\"graphics-alpha-overdraw-t\" x=\"362\" y=\"188\">quad 3</text><text class=\"graphics-alpha-overdraw-m graphics-alpha-overdraw-end\" x=\"470\" y=\"188\">4.1 m</text><g class=\"graphics-alpha-overdraw-v3\"><circle class=\"graphics-alpha-overdraw-dot\" cx=\"348\" cy=\"209\" r=\"4\"/></g><text class=\"graphics-alpha-overdraw-t\" x=\"362\" y=\"214\">quad 4</text><text class=\"graphics-alpha-overdraw-m graphics-alpha-overdraw-end\" x=\"470\" y=\"214\">2.0 m</text><text class=\"graphics-alpha-overdraw-m\" x=\"340\" y=\"262\">centre pixel shaded:</text><g class=\"graphics-alpha-overdraw-v0\"><rect class=\"graphics-alpha-overdraw-blk\" x=\"478\" y=\"248\" width=\"22\" height=\"22\" rx=\"5\"/></g><g class=\"graphics-alpha-overdraw-v1\"><rect class=\"graphics-alpha-overdraw-blk\" x=\"506\" y=\"248\" width=\"22\" height=\"22\" rx=\"5\"/></g><g class=\"graphics-alpha-overdraw-v2\"><rect class=\"graphics-alpha-overdraw-blk\" x=\"534\" y=\"248\" width=\"22\" height=\"22\" rx=\"5\"/></g><g class=\"graphics-alpha-overdraw-v3\"><rect class=\"graphics-alpha-overdraw-blk\" x=\"562\" y=\"248\" width=\"22\" height=\"22\" rx=\"5\"/></g><text class=\"graphics-alpha-overdraw-m\" x=\"340\" y=\"300\">depth test on, depth write off</text></svg>"
        },
        {
          "type": "h",
          "text": "HDR, tonemapping and bloom"
        },
        {
          "type": "p",
          "text": "Real light spans a huge range: a sunlit pixel can be tens of thousands of times brighter than a shadowed one, but an 8-bit display shows 256 levels. Rendering in **HDR** (high dynamic range) uses float render targets (commonly R11G11B10 or RGBA16F) so lighting values above 1.0 survive until the end. **Tonemapping** then compresses scene-referred values into display range. Clamping at 1.0 loses highlights in a flat white blob; a tonemap curve such as ACES or Khronos PBR Neutral rolls highlights off smoothly and keeps colour. Tonemapping is done after lighting and bloom, in linear space, and before the final sRGB conversion. Auto-exposure adapts the scale factor so a dark cave and noon sun both land in a sensible range."
        },
        {
          "type": "figure",
          "id": "graphics-tonemap-curve",
          "caption": "Clamping flattens everything above 1.0 into the same white, while a tonemap curve rolls highlights off smoothly.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"A graph mapping HDR scene values from 0 to 8 to display values from 0 to 1. Clamping goes flat at 1.0 so all highlights become the same white, while an ACES tonemapping curve rolls highlights off smoothly.\"><style>.graphics-tonemap-curve-t{font-size:13px;fill:var(--fig-ink)} .graphics-tonemap-curve-m{font-size:13px;fill:var(--fig-muted)} .graphics-tonemap-curve-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-tonemap-curve-mid{text-anchor:middle} .graphics-tonemap-curve-end{text-anchor:end} .graphics-tonemap-curve-mono{font-family:ui-monospace,Menlo,monospace} .graphics-tonemap-curve-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-tonemap-curve-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-tonemap-curve-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-tonemap-curve-ac{stroke:var(--fig-accent);stroke-width:2.5;fill:none} .graphics-tonemap-curve-cl{stroke:var(--fig-bad);stroke-width:2.5;fill:none;stroke-dasharray:7 5} .graphics-tonemap-curve-st{stop-color:var(--fig-warn)} .graphics-tonemap-curve-sc{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:3 4} .graphics-tonemap-curve-da{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2} .graphics-tonemap-curve-db{fill:var(--fig-bad);stroke:var(--fig-bg);stroke-width:2} .graphics-tonemap-curve-sw{fill:var(--fig-accent)} .graphics-tonemap-curve-swb{fill:var(--fig-bad)} .graphics-tonemap-curve-sl{transform:translateX(100px);animation:graphics-tonemap-curve-sl 7s linear infinite alternate}@keyframes graphics-tonemap-curve-sl{0%{transform:translateX(0px)}3.13%{transform:translateX(12.5px)}6.25%{transform:translateX(25px)}9.38%{transform:translateX(37.5px)}12.5%{transform:translateX(50px)}18.75%{transform:translateX(75px)}25%{transform:translateX(100px)}37.5%{transform:translateX(150px)}50%{transform:translateX(200px)}62.5%{transform:translateX(250px)}75%{transform:translateX(300px)}87.5%{transform:translateX(350px)}100%{transform:translateX(400px)}} .graphics-tonemap-curve-da{transform:translate(170px,85.33px);animation:graphics-tonemap-curve-da 7s linear infinite alternate}@keyframes graphics-tonemap-curve-da{0%{transform:translate(70px,250px)}3.13%{transform:translate(82.5px,182.66px)}6.25%{transform:translate(95px,139.06px)}9.38%{transform:translate(107.5px,117.55px)}12.5%{transform:translate(120px,105.32px)}18.75%{transform:translate(145px,92.18px)}25%{transform:translate(170px,85.33px)}37.5%{transform:translate(220px,78.33px)}50%{transform:translate(270px,74.78px)}62.5%{transform:translate(320px,72.65px)}75%{transform:translate(370px,71.22px)}87.5%{transform:translate(420px,70.2px)}100%{transform:translate(470px,70px)}} .graphics-tonemap-curve-db{transform:translate(170px,70px);animation:graphics-tonemap-curve-db 7s linear infinite alternate}@keyframes graphics-tonemap-curve-db{0%{transform:translate(70px,250px)}3.13%{transform:translate(82.5px,205px)}6.25%{transform:translate(95px,160px)}9.38%{transform:translate(107.5px,115px)}12.5%{transform:translate(120px,70px)}18.75%{transform:translate(145px,70px)}25%{transform:translate(170px,70px)}37.5%{transform:translate(220px,70px)}50%{transform:translate(270px,70px)}62.5%{transform:translate(320px,70px)}75%{transform:translate(370px,70px)}87.5%{transform:translate(420px,70px)}100%{transform:translate(470px,70px)}}</style><text class=\"graphics-tonemap-curve-h\" x=\"20\" y=\"30\">HDR scene value → display value</text><line class=\"graphics-tonemap-curve-ln\" x1=\"70\" y1=\"60\" x2=\"70\" y2=\"250\"/><line class=\"graphics-tonemap-curve-ln\" x1=\"70\" y1=\"250\" x2=\"476\" y2=\"250\"/><line class=\"graphics-tonemap-curve-ln\" x1=\"70\" y1=\"70\" x2=\"470\" y2=\"70\" stroke-dasharray=\"2 5\"/><text class=\"graphics-tonemap-curve-m graphics-tonemap-curve-end\" x=\"60\" y=\"74\">1.0</text><text class=\"graphics-tonemap-curve-m graphics-tonemap-curve-end\" x=\"60\" y=\"254\">0</text><text class=\"graphics-tonemap-curve-m graphics-tonemap-curve-mid\" x=\"70\" y=\"270\">0</text><text class=\"graphics-tonemap-curve-m graphics-tonemap-curve-mid\" x=\"120\" y=\"270\">1</text><text class=\"graphics-tonemap-curve-m graphics-tonemap-curve-mid\" x=\"170\" y=\"270\">2</text><text class=\"graphics-tonemap-curve-m graphics-tonemap-curve-mid\" x=\"270\" y=\"270\">4</text><text class=\"graphics-tonemap-curve-m graphics-tonemap-curve-mid\" x=\"470\" y=\"270\">8</text><text class=\"graphics-tonemap-curve-m graphics-tonemap-curve-mid\" x=\"270\" y=\"290\">scene value (linear HDR)</text><path class=\"graphics-tonemap-curve-cl\" d=\"M70 250 L120 70 L470 70\"/><path class=\"graphics-tonemap-curve-ac\" d=\"M70 250L75 227.35L80 196.08L85 171.07L90 152.66L95 139.06L100 128.81L105 120.87L110 114.58L115 109.5L120 105.32L125 101.82L130 98.85L135 96.31L140 94.11L145 92.18L150 90.48L155 88.97L160 87.63L165 86.42L170 85.33L175 84.33L180 83.43L185 82.6L190 81.84L195 81.14L200 80.49L205 79.89L210 79.33L215 78.81L220 78.33L225 77.87L230 77.44L235 77.04L240 76.66L245 76.31L250 75.97L255 75.65L260 75.35L265 75.06L270 74.78L275 74.52L280 74.28L285 74.04L290 73.82L295 73.6L300 73.39L305 73.2L310 73.01L315 72.82L320 72.65L325 72.48L330 72.32L335 72.17L340 72.02L345 71.87L350 71.73L355 71.6L360 71.47L365 71.35L370 71.22L375 71.11L380 70.99L385 70.88L390 70.78L395 70.68L400 70.58L405 70.48L410 70.38L415 70.29L420 70.2L425 70.12L430 70.03L435 70L440 70L445 70L450 70L455 70L460 70L465 70L470 70\"/><line class=\"graphics-tonemap-curve-sc graphics-tonemap-curve-sl\" x1=\"70\" y1=\"60\" x2=\"70\" y2=\"250\"/><circle class=\"graphics-tonemap-curve-db\" cx=\"0\" cy=\"0\" r=\"5.5\"/><circle class=\"graphics-tonemap-curve-da\" cx=\"0\" cy=\"0\" r=\"5.5\"/><rect class=\"graphics-tonemap-curve-swb\" x=\"500\" y=\"62\" width=\"14\" height=\"4\" rx=\"2\"/><text class=\"graphics-tonemap-curve-t\" x=\"522\" y=\"68\">clamp at 1.0</text><rect class=\"graphics-tonemap-curve-sw\" x=\"500\" y=\"88\" width=\"14\" height=\"4\" rx=\"2\"/><text class=\"graphics-tonemap-curve-t\" x=\"522\" y=\"94\">ACES tonemap</text><text class=\"graphics-tonemap-curve-m\" x=\"500\" y=\"140\">Clamp: everything</text><text class=\"graphics-tonemap-curve-m\" x=\"500\" y=\"158\">above 1.0 is the</text><text class=\"graphics-tonemap-curve-m\" x=\"500\" y=\"176\">same flat white.</text><text class=\"graphics-tonemap-curve-m\" x=\"500\" y=\"212\">Curve: highlights</text><text class=\"graphics-tonemap-curve-m\" x=\"500\" y=\"230\">roll off and keep</text><text class=\"graphics-tonemap-curve-m\" x=\"500\" y=\"248\">their gradation.</text></svg>"
        },
        {
          "type": "interactive",
          "id": "graphics-tonemap-explorer",
          "caption": "Raise the exposure and clamp turns more of the scene pure white, while Reinhard and the ACES fit roll highlights off; the probe reads each operator's display value.",
          "height": 400,
          "html": "<style>\n.w { display: flex; flex-direction: column; height: 100%; gap: 8px; }\nsvg { flex: 1; min-height: 0; width: 100%; display: block; }\n.g { stroke: var(--fig-line); stroke-width: 1; }\n.ax { stroke: var(--fig-muted); stroke-width: 1.5; }\n.m { fill: var(--fig-muted); font-size: 12px; }\n.t { fill: var(--fig-ink); font-size: 13px; }\n.mid { text-anchor: middle; } .end { text-anchor: end; }\n.cv { fill: none; stroke-width: 3; stroke-linejoin: round; }\n.k0 { stroke: var(--fig-bad); } .k1 { stroke: var(--fig-accent2); } .k2 { stroke: var(--fig-accent); }\n.d0 { fill: var(--fig-bad); } .d1 { fill: var(--fig-accent2); } .d2 { fill: var(--fig-accent); }\n.probe { stroke: var(--fig-ink); stroke-dasharray: 4 4; stroke-opacity: .5; }\n.c { display: grid; grid-template-columns: auto 1fr auto; gap: 4px 10px; align-items: center; }\n.c input { width: 100%; }\noutput { font-variant-numeric: tabular-nums; color: var(--fig-muted); }\n</style>\n<div class=\"w\">\n<svg viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Display value against HDR scene value from 0 to 8 for three operators: clamp, Reinhard and an ACES fit, after the chosen exposure. A dashed probe line reads off each operator's output.\">\n  <g id=\"grid\"></g>\n  <line class=\"ax\" x1=\"60\" y1=\"250\" x2=\"460\" y2=\"250\"/><line class=\"ax\" x1=\"60\" y1=\"250\" x2=\"60\" y2=\"40\"/>\n  <text class=\"m end\" x=\"52\" y=\"54\">1.0</text><text class=\"m end\" x=\"52\" y=\"154\">0.5</text><text class=\"m end\" x=\"52\" y=\"254\">0</text>\n  <text class=\"m mid\" x=\"260\" y=\"290\">scene value (linear HDR, before exposure)</text>\n  <path id=\"p0\" class=\"cv k0\"/><path id=\"p1\" class=\"cv k1\"/><path id=\"p2\" class=\"cv k2\"/>\n  <line id=\"probe\" class=\"probe\" y1=\"40\" y2=\"250\"/>\n  <circle id=\"d0\" class=\"d0\" r=\"5\"/><circle id=\"d1\" class=\"d1\" r=\"5\"/><circle id=\"d2\" class=\"d2\" r=\"5\"/>\n  <rect class=\"d0\" x=\"480\" y=\"40\" width=\"14\" height=\"4\" rx=\"2\"/><text class=\"t\" x=\"502\" y=\"46\">clamp</text><text id=\"v0\" class=\"t end\" x=\"634\" y=\"46\"></text>\n  <rect class=\"d1\" x=\"480\" y=\"64\" width=\"14\" height=\"4\" rx=\"2\"/><text class=\"t\" x=\"502\" y=\"70\">Reinhard</text><text id=\"v1\" class=\"t end\" x=\"634\" y=\"70\"></text>\n  <rect class=\"d2\" x=\"480\" y=\"88\" width=\"14\" height=\"4\" rx=\"2\"/><text class=\"t\" x=\"502\" y=\"94\">ACES (fit)</text><text id=\"v2\" class=\"t end\" x=\"634\" y=\"94\"></text>\n  <text class=\"m\" x=\"480\" y=\"134\">Turns pure white above</text>\n  <text class=\"m\" x=\"480\" y=\"154\">scene value:</text>\n  <text class=\"t\" x=\"480\" y=\"178\">clamp</text><text id=\"w0\" class=\"t end\" x=\"634\" y=\"178\"></text>\n  <text class=\"t\" x=\"480\" y=\"198\">Reinhard</text><text class=\"t end\" x=\"634\" y=\"198\">never</text>\n  <text class=\"t\" x=\"480\" y=\"218\">ACES (fit)</text><text id=\"w2\" class=\"t end\" x=\"634\" y=\"218\"></text>\n  <text class=\"m\" x=\"480\" y=\"250\">x = scene × 2^EV</text>\n</svg>\n<div class=\"c\">\n  <label for=\"ev\">Exposure</label><input id=\"ev\" type=\"range\" min=\"-2\" max=\"3\" step=\"0.5\" value=\"0\"><output id=\"evo\" for=\"ev\"></output>\n  <label for=\"sv\">Probe</label><input id=\"sv\" type=\"range\" min=\"0\" max=\"8\" step=\"0.1\" value=\"4\"><output id=\"svo\" for=\"sv\"></output>\n</div>\n</div>\n<script>\n(function () {\n  var $ = function (id) { return document.getElementById(id); };\n  var ops = [\n    function (x) { return Math.min(1, x); },\n    function (x) { return x / (1 + x); },\n    function (x) { return Math.min(1, Math.max(0, x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14))); }\n  ];\n  var X = function (s) { return 60 + s * 50; }, Y = function (v) { return 250 - v * 200; };\n  var grid = '';\n  for (var i = 1; i <= 8; i++) grid += '<line class=\"g\" x1=\"' + X(i) + '\" y1=\"40\" x2=\"' + X(i) + '\" y2=\"250\"/><text class=\"m mid\" x=\"' + X(i) + '\" y=\"270\">' + i + '</text>';\n  grid += '<line class=\"g\" x1=\"60\" y1=\"150\" x2=\"460\" y2=\"150\"/><line class=\"g\" x1=\"60\" y1=\"50\" x2=\"460\" y2=\"50\"/><text class=\"m mid\" x=\"60\" y=\"270\">0</text>';\n  $('grid').innerHTML = grid;\n  function draw() {\n    var ev = +$('ev').value, e = Math.pow(2, ev), s = +$('sv').value;\n    ops.forEach(function (f, k) {\n      var d = '';\n      for (var j = 0; j <= 160; j++) { var x = j / 20; d += (j ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(f(x * e)).toFixed(1); }\n      $('p' + k).setAttribute('d', d);\n      var v = f(s * e);\n      $('d' + k).setAttribute('cx', X(s)); $('d' + k).setAttribute('cy', Y(v));\n      $('v' + k).textContent = v.toFixed(2) + (k !== 1 && v >= 1 ? ' clipped' : '');\n    });\n    $('probe').setAttribute('x1', X(s)); $('probe').setAttribute('x2', X(s));\n    $('w0').textContent = (1 / e).toFixed(2);\n    $('w2').textContent = (7.24 / e).toFixed(2);\n    $('evo').textContent = (ev > 0 ? '+' : ev < 0 ? '−' : '±') + Math.abs(ev).toFixed(1) + ' EV (×' + e.toFixed(2) + ')';\n    $('svo').textContent = 'scene ' + s.toFixed(1);\n  }\n  $('ev').addEventListener('input', draw); $('sv').addEventListener('input', draw);\n  draw();\n})();\n</script>"
        },
        {
          "type": "p",
          "text": "**Bloom** simulates light scattering in a lens: bright areas bleed into their surroundings. It extracts pixels above a threshold, blurs them across a chain of downsampled textures (a mip-style pyramid, cheap and wide), and adds the result back. Bloom depends on HDR: with clamped input, a white shirt and a sun both have value 1.0 and bloom the same, but in HDR the sun is 50 and stands out. Overused bloom makes everything look like a dream sequence."
        },
        {
          "type": "h",
          "text": "Anti-aliasing and temporal upscalers"
        },
        {
          "type": "p",
          "text": "Rasterisation samples a pixel once, so edges become staircases (aliasing), and thin shaded details shimmer. **MSAA** takes multiple coverage samples per pixel (2x, 4x, 8x) but shades once, so it fixes geometry edges only, and costs bandwidth proportional to sample count. It does not work directly with deferred and does nothing for shader aliasing, for example specular shimmer. **FXAA** is a cheap post-process that detects edges in the final image and blurs them: very fast, works everywhere, slightly soft. **TAA** (temporal anti-aliasing) jitters the camera sub-pixel each frame and accumulates history using motion vectors, effectively supersampling over time. It handles geometry and shader aliasing together. Its artefacts are ghosting behind moving objects, blur and flicker on thin features when history is rejected badly."
        },
        {
          "type": "p",
          "text": "**Temporal upscalers** build on TAA: render at lower internal resolution (for example 67 percent per axis, which is about 45 percent of the pixels) and reconstruct a full-resolution image from jittered samples, motion vectors and depth. Examples include DLSS, FSR, XeSS and Unity's STP. Some are ML-based, others hand-tuned, but all need correct motion vectors for every moving thing (animated meshes, particles, vertex animation) to avoid smearing, and UI should be composited after upscaling. Upscaling usually saves GPU time, but it adds a fixed cost and does nothing if the frame is CPU-bound."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Post-process order matters. Typical chain: opaque, transparent, TAA or upscale, bloom and exposure, tonemap, colour grading, then UI. Applying tonemapping before bloom, or running bloom on clamped LDR, gives dull, wrong results."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents frequently suggest 'enable MSAA' regardless of render path, add a bloom pass that reads an LDR buffer, or write transparency shaders with depth write on. State your render path and target hardware, then check the result: look for transparent sorting pops, verify HDR is enabled in the camera and pipeline asset before judging bloom, and test TAA or upscaling with fast-moving objects and particles for ghosting. When an agent adds a custom full-screen pass, ask where in the chain it runs."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Dozens of small overlapping point lights tank a classic forward renderer, which is GPU-bound",
              "use": "Deferred or forward+ for many lights",
              "why": "Deferred lights a G-buffer once per light volume; forward+ builds per-tile light lists. Deferred costs bandwidth and complicates MSAA and transparency, so forward+ often suits mid-range."
            },
            {
              "signal": "A mobile or VR game uses few lights, needs MSAA, and is bandwidth constrained",
              "use": "Forward rendering",
              "why": "No G-buffer, so far less bandwidth, and MSAA works directly. Cost scales with objects times lights, so keep per-object light counts low."
            },
            {
              "signal": "Transparent objects render in the wrong order and pop in front of each other as the camera moves",
              "use": "Sort transparents back to front",
              "why": "Alpha blending is order-dependent, so draw far to near after opaques. Per-object sorting fails for intersecting or self-overlapping meshes; split those meshes."
            },
            {
              "signal": "Interpenetrating transparent surfaces flicker even with per-object sorting",
              "use": "Order-independent transparency",
              "why": "Weighted blended OIT or per-pixel lists remove the sort dependency. Approximate or memory heavy, so use only where sorting cannot be fixed by splitting geometry."
            },
            {
              "signal": "Foliage or fences use alpha blending, sort badly and cause heavy overdraw",
              "use": "Alpha-tested cutout or alpha-to-coverage",
              "why": "Treat them as opaque with `clip` so they write depth and need no sorting. Loses soft edges and early-Z; alpha-to-coverage smooths edges when MSAA is on."
            },
            {
              "signal": "Particle effects with large mostly transparent quads make the GPU fill-rate bound when the camera gets close",
              "use": "Trim particle overdraw",
              "why": "Use tighter mesh-shaped sprites, cap particle count and size near the camera, or render particles to a lower-resolution buffer. Low-res buffers need careful upsampling at edges."
            },
            {
              "signal": "Bloom looks weak and a bright sun glows the same as a white shirt",
              "use": "HDR render target plus tonemapping",
              "why": "Without HDR all bright values clip at 1.0, so bloom cannot tell them apart. HDR targets cost bandwidth; tonemap once at the end of the chain."
            },
            {
              "signal": "Thin wires and shiny specular highlights shimmer in a deferred renderer when the camera moves",
              "use": "Temporal anti-aliasing",
              "why": "TAA accumulates jittered samples over frames, fixing both geometry and shader aliasing. Needs correct motion vectors and can ghost or blur; MSAA only fixes geometry edges."
            },
            {
              "signal": "A GPU-bound frame at high resolution must get faster and dropping native resolution looks too soft",
              "use": "Temporal upscaler",
              "why": "Render fewer pixels and reconstruct with history and motion vectors. Saves GPU fragment time only; it does nothing for a CPU-bound frame and can ghost on bad motion vectors."
            },
            {
              "signal": "Vignette, colour grading, grain and tonemapping each run as a separate full-screen pass",
              "use": "Merge post effects into an uber pass",
              "why": "One pass reads and writes the frame once instead of several times, saving bandwidth, especially on mobile. Effects that need neighbouring pixels, like blur, still need their own passes."
            }
          ]
        }
      ],
      "keyPoints": [
        "Forward cost scales with objects times lights; deferred decouples lights from geometry using a G-buffer; forward+ keeps forward flexibility with per-tile light lists.",
        "Alpha blending is order-dependent, so transparents are sorted back to front, and transparent overdraw is a fill-rate hazard.",
        "HDR render targets keep values above 1.0; tonemapping compresses them to display range, and bloom needs that HDR data.",
        "MSAA fixes geometry edges only, FXAA is a cheap blur, TAA accumulates samples over time and can ghost.",
        "Temporal upscalers render fewer pixels and reconstruct, requiring accurate motion vectors and doing nothing for CPU-bound frames."
      ],
      "quiz": [
        {
          "q": "A night scene has 60 small point lights, mostly overlapping a few buildings. Classic single-pass forward drops to 25 fps, GPU-bound. Which change addresses the cause most directly?",
          "options": [
            "Move to forward+ or deferred so pixels only use nearby lights",
            "Enable 8x MSAA to smooth the edges of lit objects",
            "Turn off HDR so the frame uses less render target memory",
            "Sort opaque objects back to front to reduce overdraw"
          ],
          "answer": 0,
          "explain": "Forward shades each fragment against every light touching its object, so cost explodes with overlapping lights. Tiled or deferred lighting limits work to relevant lights. MSAA adds cost, and opaque objects should be sorted front to back, not back to front."
        },
        {
          "q": "A glass window in front of a smoke cloud renders correctly from one angle, but when the camera moves the smoke suddenly pops in front of the glass. Both are transparent and sorted per object. What is the likely cause?",
          "options": [
            "The shaders use alpha-to-coverage instead of blending",
            "The depth buffer is too low in precision for transparents",
            "Per-object sort order flips as the camera moves",
            "The tonemapper runs before the transparent pass"
          ],
          "answer": 2,
          "explain": "Blending is order-dependent, and sorting whole objects by pivot distance can flip when large or intersecting objects trade places. Fixes include splitting meshes, adjusting sort priority, or using OIT. Depth precision and tonemap order do not cause a flip of draw order."
        },
        {
          "q": "Bloom in your game looks weak: a bright sun and a white shirt glow identically and barely at all. The camera is set to LDR and the bloom threshold is 1.0. What do you do?",
          "options": [
            "Lower the bloom threshold to 0.1 so all pixels glow",
            "Enable HDR so the sun exceeds 1.0 and passes the threshold",
            "Switch from TAA to FXAA to keep highlights sharper",
            "Increase the shadow cascade count for brighter highlights"
          ],
          "answer": 1,
          "explain": "In LDR everything is clamped at 1.0, so the sun and the shirt are indistinguishable to a threshold. HDR retains the intensity difference. Lowering the threshold would make the whole image glow, and AA mode is unrelated."
        },
        {
          "q": "A frame renders at 1440p with a deferred path and takes 22 ms of GPU time, CPU at 6 ms. You enable a temporal upscaler at 67 percent per axis and GPU time falls to about 14 ms. A second profile of a CPU-bound scene at 18 ms of CPU time shows nearly no gain. Why?",
          "options": [
            "Upscalers only work with forward rendering paths",
            "Upscaling disables motion vectors used for CPU work",
            "The CPU is too slow to read the upscaled image back",
            "It only reduces GPU pixel work, not CPU-side work"
          ],
          "answer": 3,
          "explain": "The upscaler cuts pixel-shading work on the GPU. If the frame is limited by CPU work such as draw submission or scripts, fewer pixels make no difference. Upscalers work with deferred paths and need motion vectors rather than disabling them."
        },
        {
          "q": "You want to anti-alias a deferred renderer where thin power lines and shiny specular surfaces shimmer when the camera moves. Which option best addresses both geometry and shader aliasing?",
          "options": [
            "TAA with correct motion vectors",
            "MSAA 4x on the G-buffer",
            "FXAA applied before tonemapping",
            "Raising texture anisotropy to 16x"
          ],
          "answer": 0,
          "explain": "TAA accumulates jittered samples over time, covering thin geometry and shading shimmer, and works with deferred. MSAA is awkward with a G-buffer and does not fix shader aliasing, and FXAA only blurs edges in a single image. Anisotropy concerns texture sampling."
        },
        {
          "q": "A chain-link fence and bushes are drawn with alpha blending. Their texture alpha is only ever 0 or 1, yet they sort badly against other transparents and fill-rate is high. Which approach fits best?",
          "options": [
            "Order-independent transparency for the whole scene view",
            "Sort all transparent objects strictly back to front every frame",
            "Alpha-tested cutout, with alpha-to-coverage if MSAA is on",
            "Merge all of the post effects into one single uber pass"
          ],
          "answer": 2,
          "explain": "Binary alpha needs no blending: cutout writes depth, sorts like opaque geometry and avoids the overdraw. Sorting or OIT would keep paying blend costs for a problem that disappears with a test."
        }
      ]
    },
    {
      "id": "graphics-apis-gpu-performance",
      "title": "Graphics APIs and GPU performance",
      "minutes": 14,
      "summary": "How OpenGL, Direct3D 12, Vulkan and Metal differ, how draw submission works, and how to find the real bottleneck with GPU capture tools.",
      "lesson": [
        {
          "type": "p",
          "text": "Your game holds 60 fps in the editor, then runs at 38 fps on a phone. The team guesses: reduce texture sizes, halve the particles, lower the resolution. Each change is a coin flip, and the result is a month of lost work. Performance work that starts with guessing is expensive; the alternative is knowing how a frame travels from your code to the screen, and measuring where it stalls."
        },
        {
          "type": "h",
          "text": "What a graphics API actually does"
        },
        {
          "type": "p",
          "text": "A graphics API is the contract between your program and the GPU driver. Your CPU code records commands: bind a pipeline, bind resources, set a viewport, draw N triangles. The driver translates them into hardware-specific packets, and the GPU executes them asynchronously, a frame or more behind (the CPU-GPU pipelining described in The GPU and the Rendering Pipeline). What differs between APIs is how much of that translation the driver does for you, and at what CPU cost."
        },
        {
          "type": "list",
          "items": [
            "**OpenGL / OpenGL ES**: a global state machine with implicit synchronisation. Easy to start, but the driver does a lot of hidden work (validation, state tracking, memory management), with high and unpredictable CPU cost, and it is effectively single-threaded. OpenGL ES remains on older Android devices; on Apple platforms it is deprecated.",
            "**Direct3D 12**: Windows and Xbox. Explicit: you create pipeline state objects (PSOs), manage memory and resource states, record command lists on many threads and submit them to queues. Lower driver overhead and better multicore scaling, at the cost of more code and more ways to be wrong.",
            "**Vulkan**: the cross-platform explicit API (Android, Windows, Linux). Similar philosophy to D3D12, with render passes and subpasses that map well to tile-based GPUs, and explicit synchronisation through barriers and semaphores.",
            "**Metal**: Apple's explicit API for iOS, macOS and tvOS. Lower overhead than OpenGL and a tighter hardware fit than Vulkan on Apple GPUs, including direct access to tile memory features.",
            "**Direct3D 11**: an older, implicit API still widely used for compatibility, sitting between OpenGL and D3D12 in driver overhead."
          ]
        },
        {
          "type": "p",
          "text": "Engines hide these behind a **render hardware interface** (RHI). That is why you rarely write API calls yourself, yet it still matters which one runs: some features, shader compilation behaviour and bugs differ per backend, and your profiling tools depend on it."
        },
        {
          "type": "h",
          "text": "Command buffers, batching and instancing"
        },
        {
          "type": "p",
          "text": "In explicit APIs you record **command buffers** (command lists) ahead of time and submit them to a queue. Recording is cheap and parallelisable, so several worker threads can each build commands for part of the scene, and submission is a single call. Each draw call still has a CPU cost: binding materials, updating constants, validating state. Typical budgets: a few thousand draw calls on mobile, a few thousand to tens of thousands on desktop, depending on API and engine. Exceed that and the CPU render thread, not the GPU, sets your frame time."
        },
        {
          "type": "p",
          "text": "Reducing that CPU cost is the point of **batching**. Static batching merges meshes that share a material into one buffer; dynamic batching merges small meshes on the CPU each frame (cost grows with vertex count, so only worth it for tiny meshes). **GPU instancing** draws many copies of one mesh and material in a single call, with per-instance data (transform, colour) read from a buffer: 5000 trees or grass blades in one call. An SRP-batcher-style approach keeps per-material data resident in GPU buffers so changing material costs little, even if meshes differ. The rule: fewer state changes and fewer calls, not necessarily fewer triangles."
        },
        {
          "type": "figure",
          "id": "graphics-instancing-calls",
          "caption": "Eight draw calls cost eight rounds of CPU state setup; one instanced call costs one, with the same GPU work reading per-instance data.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Timelines comparing eight separate draw calls, each with CPU state setup and submission and the GPU idling between them, against one instanced draw call where the CPU submits once and the GPU draws eight instances reading per-instance transforms from a buffer.\"><style>.graphics-instancing-calls-t{font-size:13px;fill:var(--fig-ink)} .graphics-instancing-calls-m{font-size:13px;fill:var(--fig-muted)} .graphics-instancing-calls-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-instancing-calls-mid{text-anchor:middle} .graphics-instancing-calls-end{text-anchor:end} .graphics-instancing-calls-mono{font-family:ui-monospace,Menlo,monospace} .graphics-instancing-calls-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-instancing-calls-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-instancing-calls-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-instancing-calls-stt{fill:var(--fig-warn);fill-opacity:.55;stroke:var(--fig-warn);stroke-width:1.5} .graphics-instancing-calls-drw{fill:var(--fig-accent);stroke:var(--fig-accent);stroke-width:1.5} .graphics-instancing-calls-gpu{fill:var(--fig-accent2);fill-opacity:.35;stroke:var(--fig-accent2);stroke-width:1.5} .graphics-instancing-calls-hi{fill:var(--fig-accent2);opacity:0} .graphics-instancing-calls-free{fill:none;stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:5 4} .graphics-instancing-calls-ph{stroke:var(--fig-ink);stroke-width:2;fill:none;animation:graphics-instancing-calls-ph 6s linear infinite} @keyframes graphics-instancing-calls-ph{0%{transform:translateX(0)}100%{transform:translateX(380px)}} .graphics-instancing-calls-div{stroke:var(--fig-accent2);stroke-width:1} .graphics-instancing-calls-h1{animation:graphics-instancing-calls-h1 6s linear infinite}@keyframes graphics-instancing-calls-h1{0%{opacity:0}11.05%{opacity:0}11.15%{opacity:0.6}17.89%{opacity:0.6}17.99%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h2{animation:graphics-instancing-calls-h2 6s linear infinite}@keyframes graphics-instancing-calls-h2{0%{opacity:0}22.63%{opacity:0}22.73%{opacity:0.6}29.47%{opacity:0.6}29.57%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h3{animation:graphics-instancing-calls-h3 6s linear infinite}@keyframes graphics-instancing-calls-h3{0%{opacity:0}34.21%{opacity:0}34.31%{opacity:0.6}41.05%{opacity:0.6}41.15%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h4{animation:graphics-instancing-calls-h4 6s linear infinite}@keyframes graphics-instancing-calls-h4{0%{opacity:0}45.79%{opacity:0}45.89%{opacity:0.6}52.63%{opacity:0.6}52.73%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h5{animation:graphics-instancing-calls-h5 6s linear infinite}@keyframes graphics-instancing-calls-h5{0%{opacity:0}57.37%{opacity:0}57.47%{opacity:0.6}64.21%{opacity:0.6}64.31%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h6{animation:graphics-instancing-calls-h6 6s linear infinite}@keyframes graphics-instancing-calls-h6{0%{opacity:0}68.95%{opacity:0}69.05%{opacity:0.6}75.79%{opacity:0.6}75.89%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h7{animation:graphics-instancing-calls-h7 6s linear infinite}@keyframes graphics-instancing-calls-h7{0%{opacity:0}80.53%{opacity:0}80.63%{opacity:0.6}87.37%{opacity:0.6}87.47%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h8{animation:graphics-instancing-calls-h8 6s linear infinite}@keyframes graphics-instancing-calls-h8{0%{opacity:0}92.11%{opacity:0}92.21%{opacity:0.6}98.95%{opacity:0.6}99.05%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h9{animation:graphics-instancing-calls-h9 6s linear infinite}@keyframes graphics-instancing-calls-h9{0%{opacity:0}11.58%{opacity:0}11.68%{opacity:0.6}17.37%{opacity:0.6}17.47%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h10{animation:graphics-instancing-calls-h10 6s linear infinite}@keyframes graphics-instancing-calls-h10{0%{opacity:0}18.42%{opacity:0}18.52%{opacity:0.6}24.21%{opacity:0.6}24.31%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h11{animation:graphics-instancing-calls-h11 6s linear infinite}@keyframes graphics-instancing-calls-h11{0%{opacity:0}25.26%{opacity:0}25.36%{opacity:0.6}31.05%{opacity:0.6}31.15%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h12{animation:graphics-instancing-calls-h12 6s linear infinite}@keyframes graphics-instancing-calls-h12{0%{opacity:0}32.11%{opacity:0}32.21%{opacity:0.6}37.89%{opacity:0.6}37.99%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h13{animation:graphics-instancing-calls-h13 6s linear infinite}@keyframes graphics-instancing-calls-h13{0%{opacity:0}38.95%{opacity:0}39.05%{opacity:0.6}44.74%{opacity:0.6}44.84%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h14{animation:graphics-instancing-calls-h14 6s linear infinite}@keyframes graphics-instancing-calls-h14{0%{opacity:0}45.79%{opacity:0}45.89%{opacity:0.6}51.58%{opacity:0.6}51.68%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h15{animation:graphics-instancing-calls-h15 6s linear infinite}@keyframes graphics-instancing-calls-h15{0%{opacity:0}52.63%{opacity:0}52.73%{opacity:0.6}58.42%{opacity:0.6}58.52%{opacity:0}100%{opacity:0}} .graphics-instancing-calls-h16{animation:graphics-instancing-calls-h16 6s linear infinite}@keyframes graphics-instancing-calls-h16{0%{opacity:0}59.47%{opacity:0}59.57%{opacity:0.6}65.26%{opacity:0.6}65.36%{opacity:0}100%{opacity:0}}</style><text class=\"graphics-instancing-calls-h\" x=\"20\" y=\"28\">8 draw calls: CPU sets state and submits each one</text><text class=\"graphics-instancing-calls-t graphics-instancing-calls-end\" x=\"100\" y=\"62\">CPU</text><text class=\"graphics-instancing-calls-t graphics-instancing-calls-end\" x=\"100\" y=\"94\">GPU</text><rect class=\"graphics-instancing-calls-stt\" x=\"110\" y=\"46\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"140\" y=\"46\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-gpu\" x=\"152\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h1\" x=\"152\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-stt\" x=\"154\" y=\"46\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"184\" y=\"46\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-gpu\" x=\"196\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h2\" x=\"196\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-stt\" x=\"198\" y=\"46\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"228\" y=\"46\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-gpu\" x=\"240\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h3\" x=\"240\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-stt\" x=\"242\" y=\"46\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"272\" y=\"46\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-gpu\" x=\"284\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h4\" x=\"284\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-stt\" x=\"286\" y=\"46\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"316\" y=\"46\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-gpu\" x=\"328\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h5\" x=\"328\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-stt\" x=\"330\" y=\"46\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"360\" y=\"46\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-gpu\" x=\"372\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h6\" x=\"372\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-stt\" x=\"374\" y=\"46\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"404\" y=\"46\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-gpu\" x=\"416\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h7\" x=\"416\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-stt\" x=\"418\" y=\"46\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"448\" y=\"46\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-gpu\" x=\"460\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h8\" x=\"460\" y=\"78\" width=\"26\" height=\"24\" rx=\"3\"/><text class=\"graphics-instancing-calls-m\" x=\"510\" y=\"62\">8 × state + submit</text><text class=\"graphics-instancing-calls-m\" x=\"510\" y=\"94\">idle between</text><text class=\"graphics-instancing-calls-h\" x=\"20\" y=\"146\">1 instanced call: one mesh, per-instance data</text><text class=\"graphics-instancing-calls-t graphics-instancing-calls-end\" x=\"100\" y=\"180\">CPU</text><text class=\"graphics-instancing-calls-t graphics-instancing-calls-end\" x=\"100\" y=\"212\">GPU</text><text class=\"graphics-instancing-calls-t graphics-instancing-calls-end\" x=\"100\" y=\"244\">data</text><rect class=\"graphics-instancing-calls-stt\" x=\"110\" y=\"164\" width=\"28\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-drw\" x=\"140\" y=\"164\" width=\"12\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-free\" x=\"160\" y=\"164\" width=\"302\" height=\"24\" rx=\"5\"/><text class=\"graphics-instancing-calls-m graphics-instancing-calls-mid\" x=\"311\" y=\"181\">CPU free for game logic</text><rect class=\"graphics-instancing-calls-gpu\" x=\"152\" y=\"196\" width=\"208\" height=\"24\" rx=\"3\"/><rect class=\"graphics-instancing-calls-pn\" x=\"154\" y=\"230\" width=\"22\" height=\"22\" rx=\"5\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h9\" x=\"154\" y=\"230\" width=\"22\" height=\"22\" rx=\"3\"/><line class=\"graphics-instancing-calls-div\" x1=\"178\" y1=\"198\" x2=\"178\" y2=\"218\"/><rect class=\"graphics-instancing-calls-pn\" x=\"180\" y=\"230\" width=\"22\" height=\"22\" rx=\"5\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h10\" x=\"180\" y=\"230\" width=\"22\" height=\"22\" rx=\"3\"/><line class=\"graphics-instancing-calls-div\" x1=\"204\" y1=\"198\" x2=\"204\" y2=\"218\"/><rect class=\"graphics-instancing-calls-pn\" x=\"206\" y=\"230\" width=\"22\" height=\"22\" rx=\"5\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h11\" x=\"206\" y=\"230\" width=\"22\" height=\"22\" rx=\"3\"/><line class=\"graphics-instancing-calls-div\" x1=\"230\" y1=\"198\" x2=\"230\" y2=\"218\"/><rect class=\"graphics-instancing-calls-pn\" x=\"232\" y=\"230\" width=\"22\" height=\"22\" rx=\"5\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h12\" x=\"232\" y=\"230\" width=\"22\" height=\"22\" rx=\"3\"/><line class=\"graphics-instancing-calls-div\" x1=\"256\" y1=\"198\" x2=\"256\" y2=\"218\"/><rect class=\"graphics-instancing-calls-pn\" x=\"258\" y=\"230\" width=\"22\" height=\"22\" rx=\"5\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h13\" x=\"258\" y=\"230\" width=\"22\" height=\"22\" rx=\"3\"/><line class=\"graphics-instancing-calls-div\" x1=\"282\" y1=\"198\" x2=\"282\" y2=\"218\"/><rect class=\"graphics-instancing-calls-pn\" x=\"284\" y=\"230\" width=\"22\" height=\"22\" rx=\"5\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h14\" x=\"284\" y=\"230\" width=\"22\" height=\"22\" rx=\"3\"/><line class=\"graphics-instancing-calls-div\" x1=\"308\" y1=\"198\" x2=\"308\" y2=\"218\"/><rect class=\"graphics-instancing-calls-pn\" x=\"310\" y=\"230\" width=\"22\" height=\"22\" rx=\"5\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h15\" x=\"310\" y=\"230\" width=\"22\" height=\"22\" rx=\"3\"/><line class=\"graphics-instancing-calls-div\" x1=\"334\" y1=\"198\" x2=\"334\" y2=\"218\"/><rect class=\"graphics-instancing-calls-pn\" x=\"336\" y=\"230\" width=\"22\" height=\"22\" rx=\"5\"/><rect class=\"graphics-instancing-calls-hi graphics-instancing-calls-h16\" x=\"336\" y=\"230\" width=\"22\" height=\"22\" rx=\"3\"/><text class=\"graphics-instancing-calls-m\" x=\"510\" y=\"180\">1 × state + submit</text><text class=\"graphics-instancing-calls-m\" x=\"510\" y=\"212\">same GPU work</text><text class=\"graphics-instancing-calls-m\" x=\"510\" y=\"244\">8 transforms</text><path class=\"graphics-instancing-calls-ph\" d=\"M110 40 V106 M110 158 V258\"/><rect class=\"graphics-instancing-calls-stt\" x=\"110\" y=\"276\" width=\"14\" height=\"14\" rx=\"3\"/><text class=\"graphics-instancing-calls-m\" x=\"130\" y=\"288\">bind / set state</text><rect class=\"graphics-instancing-calls-drw\" x=\"250\" y=\"276\" width=\"14\" height=\"14\" rx=\"3\"/><text class=\"graphics-instancing-calls-m\" x=\"270\" y=\"288\">draw call</text><rect class=\"graphics-instancing-calls-gpu\" x=\"360\" y=\"276\" width=\"14\" height=\"14\" rx=\"3\"/><text class=\"graphics-instancing-calls-m\" x=\"380\" y=\"288\">GPU executes</text></svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Unity: draw 5000 rocks in 5 instanced calls instead of 5000 (no GameObjects, no per-object CPU cost)\nMatrix4x4[] matrices = new Matrix4x4[1023]; // Graphics.DrawMeshInstanced takes at most 1023 instances per call\n// for each batch of up to 1023 rocks: fill matrices, then\nGraphics.DrawMeshInstanced(rockMesh, 0, rockMaterial, matrices, count);\n// The material needs 'Enable GPU Instancing' and an instancing-capable shader.\n// Graphics.RenderMeshInstanced is the newer RenderParams-based equivalent."
        },
        {
          "type": "h",
          "text": "CPU-bound versus GPU-bound"
        },
        {
          "type": "p",
          "text": "The GPU and the Rendering Pipeline topic introduced the rule that frame time is the slower of CPU and GPU, and the half-resolution test. Here is how to apply them. If the GPU finishes in 9 ms and then idles in a 24 ms frame, you are **CPU-bound**: the GPU is starved by draw submission, scripts, culling, animation or physics, and lowering resolution will not help. If the CPU waits at present or on a fence for a GPU that needs 20 ms, you are **GPU-bound**, and the next question is which kind:"
        },
        {
          "type": "list",
          "items": [
            "**Fill-rate / pixel-bound**: too many pixel shader invocations, from overdraw, expensive shaders, high resolution or post-processing. Fix: lower resolution, cheaper shaders, less overdraw, fewer full-screen passes.",
            "**Vertex-bound**: too many vertices or expensive vertex work, for example high-poly characters with skinning or tessellation. Dense meshes also produce tiny triangles that waste fragment quad work. Fix: LODs, mesh simplification, culling.",
            "**Bandwidth-bound**: too much memory traffic from large textures, uncompressed targets or many render target switches. Fix: compression, smaller formats, fewer passes.",
            "**CPU-bound**: draw calls, state changes, scripts. Fix: batching, instancing, culling, jobs and multithreaded rendering."
          ]
        },
        {
          "type": "figure",
          "id": "graphics-cpu-gpu-bound",
          "caption": "Frame time is the longer bar: a CPU-bound frame leaves the GPU idle, and a GPU-bound frame leaves the CPU waiting.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"Two frame timelines drawn to scale in milliseconds. CPU-bound: the CPU takes 24 ms while the GPU finishes in 9 ms and idles. GPU-bound: the GPU needs 20 ms while the CPU finishes in 8 ms and waits on a fence. A dashed line marks the 16.6 ms budget for 60 fps.\"><style>.graphics-cpu-gpu-bound-t{font-size:13px;fill:var(--fig-ink)} .graphics-cpu-gpu-bound-m{font-size:13px;fill:var(--fig-muted)} .graphics-cpu-gpu-bound-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-cpu-gpu-bound-mid{text-anchor:middle} .graphics-cpu-gpu-bound-end{text-anchor:end} .graphics-cpu-gpu-bound-mono{font-family:ui-monospace,Menlo,monospace} .graphics-cpu-gpu-bound-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-cpu-gpu-bound-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-cpu-gpu-bound-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-cpu-gpu-bound-cpu{fill:var(--fig-accent);fill-opacity:.35;stroke:var(--fig-accent);stroke-width:1.5} .graphics-cpu-gpu-bound-gpu{fill:var(--fig-accent2);fill-opacity:.35;stroke:var(--fig-accent2);stroke-width:1.5} .graphics-cpu-gpu-bound-idle{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:5 4} .graphics-cpu-gpu-bound-bud{stroke:var(--fig-warn);stroke-width:2;stroke-dasharray:6 4} .graphics-cpu-gpu-bound-ph{stroke:var(--fig-ink);stroke-width:2;fill:none;animation:graphics-cpu-gpu-bound-ph 6s linear infinite} @keyframes graphics-cpu-gpu-bound-ph{0%{transform:translateX(0)}100%{transform:translateX(432px)}}</style><text class=\"graphics-cpu-gpu-bound-h\" x=\"20\" y=\"28\">CPU-bound: 24 ms frame, GPU busy only 9 ms</text><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-end\" x=\"140\" y=\"61\">CPU</text><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-end\" x=\"140\" y=\"93\">GPU</text><rect class=\"graphics-cpu-gpu-bound-cpu\" x=\"150\" y=\"44\" width=\"432\" height=\"24\" rx=\"5\"/><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-mid\" x=\"366\" y=\"61\">scripts, culling, draw submission</text><rect class=\"graphics-cpu-gpu-bound-gpu\" x=\"150\" y=\"76\" width=\"162\" height=\"24\" rx=\"5\"/><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-mid\" x=\"231\" y=\"93\">9 ms</text><rect class=\"graphics-cpu-gpu-bound-idle\" x=\"312\" y=\"76\" width=\"270\" height=\"24\" rx=\"5\"/><text class=\"graphics-cpu-gpu-bound-m graphics-cpu-gpu-bound-mid\" x=\"515.4\" y=\"93\">idle, starved</text><text class=\"graphics-cpu-gpu-bound-h\" x=\"20\" y=\"140\">GPU-bound: GPU needs 20 ms, CPU waits</text><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-end\" x=\"140\" y=\"173\">CPU</text><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-end\" x=\"140\" y=\"205\">GPU</text><rect class=\"graphics-cpu-gpu-bound-cpu\" x=\"150\" y=\"156\" width=\"144\" height=\"24\" rx=\"5\"/><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-mid\" x=\"222\" y=\"173\">8 ms</text><rect class=\"graphics-cpu-gpu-bound-idle\" x=\"294\" y=\"156\" width=\"216\" height=\"24\" rx=\"5\"/><text class=\"graphics-cpu-gpu-bound-m graphics-cpu-gpu-bound-mid\" x=\"369.6\" y=\"173\">waits on fence</text><rect class=\"graphics-cpu-gpu-bound-gpu\" x=\"150\" y=\"188\" width=\"360\" height=\"24\" rx=\"5\"/><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-mid\" x=\"330\" y=\"205\">pixels, overdraw, post</text><line class=\"graphics-cpu-gpu-bound-bud\" x1=\"448.8\" y1=\"36\" x2=\"448.8\" y2=\"222\"/><line class=\"graphics-cpu-gpu-bound-ln\" x1=\"150\" y1=\"234\" x2=\"582\" y2=\"234\"/><line class=\"graphics-cpu-gpu-bound-ln\" x1=\"150\" y1=\"234\" x2=\"150\" y2=\"240\"/><text class=\"graphics-cpu-gpu-bound-m graphics-cpu-gpu-bound-mid\" x=\"150\" y=\"256\">0</text><line class=\"graphics-cpu-gpu-bound-ln\" x1=\"294\" y1=\"234\" x2=\"294\" y2=\"240\"/><text class=\"graphics-cpu-gpu-bound-m graphics-cpu-gpu-bound-mid\" x=\"294\" y=\"256\">8</text><line class=\"graphics-cpu-gpu-bound-ln\" x1=\"448.8\" y1=\"234\" x2=\"448.8\" y2=\"240\"/><text class=\"graphics-cpu-gpu-bound-m graphics-cpu-gpu-bound-mid\" x=\"448.8\" y=\"256\">16.6</text><line class=\"graphics-cpu-gpu-bound-ln\" x1=\"510\" y1=\"234\" x2=\"510\" y2=\"240\"/><text class=\"graphics-cpu-gpu-bound-m graphics-cpu-gpu-bound-mid\" x=\"510\" y=\"256\">20</text><line class=\"graphics-cpu-gpu-bound-ln\" x1=\"582\" y1=\"234\" x2=\"582\" y2=\"240\"/><text class=\"graphics-cpu-gpu-bound-m graphics-cpu-gpu-bound-mid\" x=\"582\" y=\"256\">24</text><text class=\"graphics-cpu-gpu-bound-m graphics-cpu-gpu-bound-end\" x=\"140\" y=\"256\">ms</text><text class=\"graphics-cpu-gpu-bound-t graphics-cpu-gpu-bound-mid\" x=\"448.8\" y=\"278\">16.6 ms = 60 fps budget</text><path class=\"graphics-cpu-gpu-bound-ph\" d=\"M150 38 V106 M150 150 V218\"/></svg>"
        },
        {
          "type": "h",
          "text": "Tile-based mobile GPUs and bandwidth"
        },
        {
          "type": "p",
          "text": "Desktop GPUs are usually immediate-mode: they rasterise triangles in submission order, writing directly to a framebuffer in VRAM. Mobile GPUs (Apple, Arm Mali, Qualcomm Adreno, PowerVR) are mostly **tile-based**: they first process geometry to bin triangles into small screen tiles (for example 16x16 or 32x32 pixels), then shade one tile at a time in fast on-chip memory, and write the finished tile to system memory once. This slashes framebuffer bandwidth, which matters enormously because mobile memory access costs power and heat. A sustained thermal limit matters as much as peak speed: a device that hits 60 fps for 30 seconds and then throttles to 40 is a typical outcome of bandwidth-heavy rendering."
        },
        {
          "type": "figure",
          "id": "graphics-tile-based-gpu",
          "caption": "Immediate-mode GPUs hit DRAM for every triangle; tile-based GPUs shade each tile on-chip and write it out once.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 324\" role=\"img\" aria-label=\"Immediate-mode GPUs read and write the framebuffer in DRAM for every triangle. Tile-based GPUs bin triangles into screen tiles, shade one tile at a time in on-chip memory, and write each finished tile to system memory once.\"><style>.graphics-tile-based-gpu-t{font-size:13px;fill:var(--fig-ink)} .graphics-tile-based-gpu-m{font-size:13px;fill:var(--fig-muted)} .graphics-tile-based-gpu-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-tile-based-gpu-mid{text-anchor:middle} .graphics-tile-based-gpu-end{text-anchor:end} .graphics-tile-based-gpu-mono{font-family:ui-monospace,Menlo,monospace} .graphics-tile-based-gpu-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-tile-based-gpu-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-tile-based-gpu-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-tile-based-gpu-tri{fill:var(--fig-accent);fill-opacity:.25;stroke:var(--fig-accent);stroke-width:1.5} .graphics-tile-based-gpu-tr2{fill:var(--fig-accent2);fill-opacity:.25;stroke:var(--fig-accent2);stroke-width:1.5} .graphics-tile-based-gpu-dn{stroke:var(--fig-bad);stroke-width:2;stroke-dasharray:4 6;animation:graphics-tile-based-gpu-dn 1s linear infinite} .graphics-tile-based-gpu-up{stroke:var(--fig-bad);stroke-width:2;stroke-dasharray:4 6;animation:graphics-tile-based-gpu-up 1s linear infinite} @keyframes graphics-tile-based-gpu-dn{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-20}} @keyframes graphics-tile-based-gpu-up{0%{stroke-dashoffset:0}100%{stroke-dashoffset:20}} .graphics-tile-based-gpu-cur{fill:none;stroke:var(--fig-ink);stroke-width:2.5} .graphics-tile-based-gpu-done{fill:var(--fig-ok);opacity:0} .graphics-tile-based-gpu-pulse{fill:var(--fig-ok);animation:graphics-tile-based-gpu-pu 0.6s linear infinite} @keyframes graphics-tile-based-gpu-pu{0%{transform:translateY(0);opacity:0}55%{transform:translateY(0);opacity:0}60%{opacity:1}95%{transform:translateY(88px);opacity:1}100%{transform:translateY(88px);opacity:0}} .graphics-tile-based-gpu-wr{stroke:var(--fig-ok);stroke-width:2} .graphics-tile-based-gpu-fok{fill:var(--fig-ok)} .graphics-tile-based-gpu-ar{stroke:var(--fig-muted);stroke-width:1.5} .graphics-tile-based-gpu-d0{animation:graphics-tile-based-gpu-d0 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d0{0%{opacity:0}8.32%{opacity:0}8.33%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d1{animation:graphics-tile-based-gpu-d1 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d1{0%{opacity:0}16.66%{opacity:0}16.67%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d2{animation:graphics-tile-based-gpu-d2 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d2{0%{opacity:0}24.99%{opacity:0}25%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d3{animation:graphics-tile-based-gpu-d3 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d3{0%{opacity:0}33.32%{opacity:0}33.33%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d4{animation:graphics-tile-based-gpu-d4 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d4{0%{opacity:0}41.66%{opacity:0}41.67%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d5{animation:graphics-tile-based-gpu-d5 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d5{0%{opacity:0}49.99%{opacity:0}50%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d6{animation:graphics-tile-based-gpu-d6 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d6{0%{opacity:0}58.32%{opacity:0}58.33%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d7{animation:graphics-tile-based-gpu-d7 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d7{0%{opacity:0}66.66%{opacity:0}66.67%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d8{animation:graphics-tile-based-gpu-d8 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d8{0%{opacity:0}74.99%{opacity:0}75%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d9{animation:graphics-tile-based-gpu-d9 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d9{0%{opacity:0}83.32%{opacity:0}83.33%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d10{animation:graphics-tile-based-gpu-d10 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d10{0%{opacity:0}91.66%{opacity:0}91.67%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-d11{animation:graphics-tile-based-gpu-d11 7.2s linear infinite}@keyframes graphics-tile-based-gpu-d11{0%{opacity:0}99.99%{opacity:0}100%{opacity:0.22}99.5%{opacity:0.22}100%{opacity:0}} .graphics-tile-based-gpu-cm{animation:graphics-tile-based-gpu-cm 7.2s linear infinite}@keyframes graphics-tile-based-gpu-cm{0%{transform:translate(0px,0px)}8.32%{transform:translate(0px,0px)}8.33%{transform:translate(40px,0px)}16.66%{transform:translate(40px,0px)}16.67%{transform:translate(80px,0px)}24.99%{transform:translate(80px,0px)}25%{transform:translate(120px,0px)}33.32%{transform:translate(120px,0px)}33.33%{transform:translate(0px,30px)}41.66%{transform:translate(0px,30px)}41.67%{transform:translate(40px,30px)}49.99%{transform:translate(40px,30px)}50%{transform:translate(80px,30px)}58.32%{transform:translate(80px,30px)}58.33%{transform:translate(120px,30px)}66.66%{transform:translate(120px,30px)}66.67%{transform:translate(0px,60px)}74.99%{transform:translate(0px,60px)}75%{transform:translate(40px,60px)}83.32%{transform:translate(40px,60px)}83.33%{transform:translate(80px,60px)}91.66%{transform:translate(80px,60px)}91.67%{transform:translate(120px,60px)}99.99%{transform:translate(120px,60px)}100%{transform:translate(0px,0px)}}</style><text class=\"graphics-tile-based-gpu-h\" x=\"20\" y=\"28\">Immediate mode (desktop)</text><text class=\"graphics-tile-based-gpu-h\" x=\"340\" y=\"28\">Tile-based (mobile)</text><rect class=\"graphics-tile-based-gpu-pn\" x=\"40\" y=\"46\" width=\"200\" height=\"120\" rx=\"8\"/><path class=\"graphics-tile-based-gpu-tri\" d=\"M70 160 L130 62 L180 160 Z\"/><path class=\"graphics-tile-based-gpu-tr2\" d=\"M130 150 L210 75 L215 162 Z\"/><line class=\"graphics-tile-based-gpu-dn\" x1=\"70\" y1=\"172\" x2=\"70\" y2=\"236\"/><line class=\"graphics-tile-based-gpu-up\" x1=\"115\" y1=\"172\" x2=\"115\" y2=\"236\"/><line class=\"graphics-tile-based-gpu-dn\" x1=\"160\" y1=\"172\" x2=\"160\" y2=\"236\"/><line class=\"graphics-tile-based-gpu-up\" x1=\"205\" y1=\"172\" x2=\"205\" y2=\"236\"/><rect class=\"graphics-tile-based-gpu-pn\" x=\"40\" y=\"240\" width=\"240\" height=\"48\" rx=\"10\"/><text class=\"graphics-tile-based-gpu-t graphics-tile-based-gpu-mid\" x=\"160\" y=\"269\">Framebuffer in DRAM</text><text class=\"graphics-tile-based-gpu-m\" x=\"20\" y=\"312\">every triangle reads and writes DRAM</text><rect class=\"graphics-tile-based-gpu-pn\" x=\"350\" y=\"46\" width=\"160\" height=\"120\" rx=\"4\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d0\" x=\"350\" y=\"46\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d1\" x=\"390\" y=\"46\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d2\" x=\"430\" y=\"46\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d3\" x=\"470\" y=\"46\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d4\" x=\"350\" y=\"76\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d5\" x=\"390\" y=\"76\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d6\" x=\"430\" y=\"76\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d7\" x=\"470\" y=\"76\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d8\" x=\"350\" y=\"106\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d9\" x=\"390\" y=\"106\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d10\" x=\"430\" y=\"106\" width=\"40\" height=\"30\"/><rect class=\"graphics-tile-based-gpu-done graphics-tile-based-gpu-d11\" x=\"470\" y=\"106\" width=\"40\" height=\"30\"/><path class=\"graphics-tile-based-gpu-tri\" d=\"M362 158 L422 60 L472 158 Z\"/><path class=\"graphics-tile-based-gpu-tr2\" d=\"M422 148 L502 73 L507 160 Z\"/><line class=\"graphics-tile-based-gpu-ln\" x1=\"390\" y1=\"46\" x2=\"390\" y2=\"166\"/><line class=\"graphics-tile-based-gpu-ln\" x1=\"430\" y1=\"46\" x2=\"430\" y2=\"166\"/><line class=\"graphics-tile-based-gpu-ln\" x1=\"470\" y1=\"46\" x2=\"470\" y2=\"166\"/><line class=\"graphics-tile-based-gpu-ln\" x1=\"350\" y1=\"76\" x2=\"510\" y2=\"76\"/><line class=\"graphics-tile-based-gpu-ln\" x1=\"350\" y1=\"106\" x2=\"510\" y2=\"106\"/><rect class=\"graphics-tile-based-gpu-cur graphics-tile-based-gpu-cm\" x=\"350\" y=\"46\" width=\"40\" height=\"30\" rx=\"3\"/><line class=\"graphics-tile-based-gpu-ar\" x1=\"512\" y1=\"106\" x2=\"540\" y2=\"106\"/><rect class=\"graphics-tile-based-gpu-pn\" x=\"540\" y=\"76\" width=\"84\" height=\"60\" rx=\"10\"/><text class=\"graphics-tile-based-gpu-t graphics-tile-based-gpu-mid\" x=\"582\" y=\"102\">on-chip</text><text class=\"graphics-tile-based-gpu-t graphics-tile-based-gpu-mid\" x=\"582\" y=\"120\">tile memory</text><line class=\"graphics-tile-based-gpu-wr\" x1=\"582\" y1=\"138\" x2=\"582\" y2=\"238\" stroke-dasharray=\"3 4\"/><circle class=\"graphics-tile-based-gpu-pulse\" cx=\"582\" cy=\"146\" r=\"5\"/><rect class=\"graphics-tile-based-gpu-pn\" x=\"350\" y=\"240\" width=\"274\" height=\"48\" rx=\"10\"/><text class=\"graphics-tile-based-gpu-t graphics-tile-based-gpu-mid\" x=\"466\" y=\"269\">System memory</text><text class=\"graphics-tile-based-gpu-m\" x=\"340\" y=\"312\">bin triangles, shade each tile on-chip, write once</text></svg>"
        },
        {
          "type": "p",
          "text": "Consequences for you: avoid switching render targets mid-frame (it forces a tile flush to memory), avoid reading back the framebuffer, clear or discard targets you do not need to load (a 'load' of a full-screen target is a full read), skip unnecessary full-screen post passes (each is a round trip through memory), and keep MSAA resolves on-chip when the API supports it. Opaque-heavy rendering benefits from the hardware's hidden-surface removal on some GPUs, while alpha-tested and blended content defeats it."
        },
        {
          "type": "h",
          "text": "GPU capture tools"
        },
        {
          "type": "p",
          "text": "Guessing ends with a **frame capture**. **RenderDoc** (free, for Direct3D 11/12, Vulkan, OpenGL) records every API call in one frame and lets you step through draws, inspect bound textures, render targets, shader inputs, meshes and pipeline state. It answers 'why is this object black?' and 'why is this pass drawing 3000 times?'. **Xcode's GPU debugger** and Metal frame capture do the same on Apple hardware, adding per-draw timing, bandwidth and shader cost counters. Vendor tools (Arm Streamline, Snapdragon Profiler, NVIDIA Nsight, AMD Radeon GPU Profiler) provide hardware counters that say whether the limit is ALU, texture, bandwidth or memory. Engine-level tools such as Unity's Frame Debugger and the Profiler's timeline show CPU render thread time and draw sequencing."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Measure the right quantity: GPU time per pass (not the whole frame), draw call count, SetPass or state-change count, and overdraw. Profile on the weakest target device in a release-like build; editor numbers are not representative."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents love confident optimisation advice without measurement: 'combine meshes', 'lower shadow resolution', 'use async compute'. Give the agent concrete evidence: frame time, whether CPU or GPU is the long pole, capture excerpts, draw call counts. Ask it to state what number should move if its change works, then verify by profiling before and after on the target device. Be sceptical of generated low-level API code (barriers, synchronisation) that cannot be validated without debug layers such as the Vulkan validation layers or D3D12 debug layer."
        },
        {
          "type": "p",
          "text": "A worked example: the phone scene at 38 fps shows GPU time 24 ms at 1080p. Rendering at 720p gives 14 ms: strongly resolution-dependent, so fill rate. A capture shows a 4-layer full-screen fog particle effect and three full-screen post-process passes. Removing two passes and shrinking fog quads recovers 10 ms. No texture or mesh change was needed, and nothing was guessed."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "The frame is GPU-bound and you need to know whether pixel work is the cause",
              "use": "Resolution-scale test",
              "why": "Halve the render resolution: a big drop means fragment or fill-rate bound. Almost no change points at vertex work, CPU submission or fixed-cost passes."
            },
            {
              "signal": "Halving resolution barely helps a GPU-bound frame that is full of dense meshes",
              "use": "Cut vertex work: LODs, culling, simpler skinning",
              "why": "Vertex cost does not scale with resolution. Confirm in a capture that the vertex stage is busy before reducing triangle counts or skinned bone influences."
            },
            {
              "signal": "Thousands of copies of the same mesh and material are drawn as separate draw calls and the render thread is busy",
              "use": "GPU instancing",
              "why": "One draw submits many copies with per-instance data in a buffer, cutting CPU submission cost. Needs the same mesh and material; per-instance variation must go through instance data."
            },
            {
              "signal": "Many different static meshes share a few materials and the CPU spends its time on draw submission",
              "use": "Batch and sort draws by state",
              "why": "Combine static meshes or sort draws by shader, then material, so state changes are rare. Static batching costs memory and coarsens culling; state changes cost more than triangles."
            },
            {
              "signal": "The render thread is pegged on one core while other cores sit idle, on an explicit API",
              "use": "Multithreaded command recording",
              "why": "D3D12, Vulkan and Metal let several threads record command buffers in parallel. Requires explicit sync and resource-state tracking; the engine usually exposes it as a setting."
            },
            {
              "signal": "A mobile game starts at 60 fps, drops to 40 after a minute and the device heats up",
              "use": "Profile sustained performance and cap frame rate",
              "why": "Thermal throttling cuts clocks after the device heats. Test over many minutes, budget below peak, and use a lower frame-rate cap or fewer passes to save power."
            },
            {
              "signal": "A mobile GPU timeline shows many full-screen passes that read and write the same render targets",
              "use": "Keep render passes merged on tile GPUs",
              "why": "Each pass switch flushes tile memory to DRAM and reloads it. Merge passes, use subpasses or framebuffer fetch, and avoid mid-frame target switches; bandwidth is the scarce resource."
            },
            {
              "signal": "Each render pass on mobile loads the previous target contents and stores depth that is never read again",
              "use": "Clear or don't-care load/store actions",
              "why": "Loading and storing whole attachments costs bandwidth on tile GPUs. Clear or discard on load, discard depth and MSAA samples on store, using memoryless attachments where possible."
            },
            {
              "signal": "A character renders black on one device only, and frame timings do not explain it",
              "use": "Frame capture in RenderDoc or Xcode",
              "why": "A capture shows each draw's bound shaders, textures, constants and render state, so you can see the wrong input. It costs capture overhead and shows one frame, not trends."
            }
          ]
        }
      ],
      "keyPoints": [
        "The CPU records commands and the GPU executes them asynchronously; frame time is set by whichever side is the long pole.",
        "Explicit APIs (D3D12, Vulkan, Metal) cut driver overhead and allow multithreaded command recording at the cost of complexity.",
        "Reduce draw call CPU cost with batching and instancing; fewer state changes matter more than fewer triangles.",
        "Diagnose first: CPU-bound vs GPU-bound, then fill-rate, vertex or bandwidth. Halving the resolution is a quick test for pixel-bound.",
        "Tile-based mobile GPUs make bandwidth the scarce resource, so avoid render target switches and extra full-screen passes; confirm with captures in RenderDoc or Xcode."
      ],
      "quiz": [
        {
          "q": "Frame time is 25 ms. The profiler shows the main thread and render thread busy for 24 ms while the GPU finishes its work in 8 ms. Which action is most likely to help?",
          "options": [
            "Lower the render resolution to 720p",
            "Compress the textures to ASTC",
            "Reduce draw calls through batching or instancing",
            "Switch the post-process chain to half-resolution targets"
          ],
          "answer": 2,
          "explain": "The CPU is the long pole, with the GPU idle for much of the frame. Draw submission cost falls with batching and instancing. Resolution, texture compression and post-process size reduce GPU work, which is not the bottleneck."
        },
        {
          "q": "You halve the render resolution in a GPU-bound scene and frame time barely changes: 21 ms drops to 20 ms. What is the most likely bottleneck?",
          "options": [
            "Fill rate from expensive pixel shaders",
            "Vertex work or another resolution-independent cost",
            "Anisotropic filtering cost on ground textures",
            "Overdraw from full-screen particle effects"
          ],
          "answer": 1,
          "explain": "Pixel-bound problems scale with pixel count, so a 4x pixel reduction would cut time sharply. A flat result points to work independent of resolution, such as vertex cost. Fill rate, particle overdraw and anisotropy are all resolution-dependent."
        },
        {
          "q": "A mobile game hits 60 fps for a minute, then drops to 40 and the device gets hot. The GPU timeline shows many full-screen passes reading and writing the same render targets. What is the best explanation and fix?",
          "options": [
            "Vertex count is too high, so use LODs for the characters",
            "The CPU is throttling, so reduce scripts per frame",
            "The shader compiler is stalling, so prewarm the shaders",
            "Bandwidth drives heat, so merge passes and avoid target switches"
          ],
          "answer": 3,
          "explain": "On tile-based GPUs each full-screen pass round-trips through system memory, and bandwidth costs power and heat that eventually trigger throttling. Merging passes keeps work on-chip. The evidence points at bandwidth, not vertices, CPU or shader compilation."
        },
        {
          "q": "A forest of 8000 identical trees is drawn as 8000 separate draw calls, each with the same mesh and material, and the CPU render thread takes 14 ms. Which change should lower that cost most?",
          "options": [
            "Draw them with GPU instancing using per-instance transforms",
            "Halve the vertex count of the tree mesh with a lower LOD",
            "Reduce the shadow map resolution for the sun",
            "Switch the trees' textures to a smaller atlas"
          ],
          "answer": 0,
          "explain": "The cost is CPU submission per draw call. Instancing renders all copies in a few calls with identical state. A lower-poly mesh or smaller shadow map reduces GPU work, and an atlas does not change the number of calls."
        },
        {
          "q": "A frame capture in RenderDoc shows that a character renders black on one device but not another. What does the capture let you do that profiler timing alone cannot?",
          "options": [
            "Measure total frame time with more precision than a profiler",
            "Count the scripts running on the main thread each frame",
            "See how long the CPU spent submitting that draw",
            "Inspect the draw's bound textures and shader inputs"
          ],
          "answer": 3,
          "explain": "A capture records the API calls and resource state of one frame so you can step to the draw and see what was bound. Timing tools show how long things took, not what data the draw used. Submission timing and script counts are profiler questions, and neither explains wrong output."
        },
        {
          "q": "A mobile GPU capture shows every render pass starting with a full load of the previous colour target and ending by storing a depth buffer nobody reads again. Bandwidth is the bottleneck. What should you reach for?",
          "options": [
            "Run a resolution-scale test to confirm the pixel cost first of all",
            "Switch the repeated meshes over to GPU instancing here",
            "Cap the frame rate to limit sustained heat on the device",
            "Use clear or don't-care load and store actions on those targets"
          ],
          "answer": 3,
          "explain": "On tile-based GPUs, an unneeded load or store moves whole targets through main memory. Clear or don't-care actions skip that traffic. Instancing cuts draw calls, not bandwidth, and a frame cap treats heat, not these transfers."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "Your game drops to 40 fps on a mid-range phone. The profiler shows the main thread at 9 ms and the GPU at 25 ms, and a 70 percent resolution scale brings GPU time down to 14 ms. A teammate proposes merging meshes to cut draw calls. What should you do instead?",
      "options": [
        "Merge the meshes anyway, since fewer draw calls also shorten GPU time",
        "Move gameplay scripts to jobs so the main thread finishes sooner",
        "Target pixel cost: overdraw, full-screen passes and shader complexity",
        "Raise anisotropic filtering so fewer mip levels need to be sampled"
      ],
      "answer": 2,
      "explain": "The GPU is the long pole and its time scales with resolution, so the cost is pixel work. Draw-call merging and job scheduling reduce CPU time, which is not the limiter, and anisotropy adds texture work rather than removing it."
    },
    {
      "q": "To stop a first-person weapon clipping into walls, a programmer sets the camera near plane to 0.001. Windows on distant buildings now z-fight with their walls. What is the best fix?",
      "options": [
        "Increase the far plane so the depth range is spread wider",
        "Restore near to about 0.1 and draw the weapon with a separate camera",
        "Switch the main camera to orthographic for the distant buildings",
        "Turn off early-Z so the windows are shaded before the walls"
      ],
      "answer": 1,
      "explain": "Depth resolution is roughly proportional to the near distance, so a 100x smaller near plane makes distant precision about 100x worse. A separate weapon camera keeps the close-up case without wrecking the main camera's depth. A larger far plane barely affects precision, and early-Z or orthographic tricks do not address it."
    },
    {
      "q": "A RenderDoc capture shows NaN positions for a few vertices of a mesh. The vertex shader normalizes the vector from each vertex to a point light and uses the result in a displacement. What is the likely cause?",
      "options": [
        "A vertex sits exactly at the light, so a zero-length vector is normalized",
        "Mobile GPUs cannot run the normalize intrinsic inside vertex shaders",
        "The mesh's UVs exceed 1.0, so the sampler wraps them to NaN values",
        "The light position is uploaded with a row-major constant buffer layout"
      ],
      "answer": 0,
      "explain": "Normalizing a zero-length vector divides by zero and produces NaN, which then propagates through every later calculation. normalize works in every stage, wrapped UVs do not create NaNs, and a layout mismatch gives wrong values rather than NaNs only at specific vertices."
    },
    {
      "q": "Your VR title uses deferred rendering. Testers complain about jagged edges, and TAA causes ghosting they find uncomfortable. Which change gives clean geometry edges without temporal history?",
      "options": [
        "Switch to forward or forward+ and enable 4x MSAA",
        "Raise anisotropic filtering to 16x on all materials",
        "Increase the shadow cascade count from two to four",
        "Render at 67 percent and apply a temporal upscaler"
      ],
      "answer": 0,
      "explain": "MSAA resolves geometry edges within a single frame and works naturally with forward paths, which is why forward is common in VR. Hardware MSAA does not fit a G-buffer, anisotropy and cascades do not touch edge aliasing, and an upscaler is temporal and can ghost too."
    },
    {
      "q": "On a tile-based mobile GPU, a custom render pass copies the camera colour target to a texture in the middle of the opaque pass, then rendering continues. GPU time rises by 3 ms although almost no shading was added. Why?",
      "options": [
        "The copy compiles a new shader variant on every frame",
        "Ending and restarting the pass stores tiles to memory and reloads them",
        "The copy disables early depth testing for the rest of the frame",
        "The copy forces the CPU to wait for the GPU on every frame"
      ],
      "answer": 1,
      "explain": "Tile-based GPUs keep colour and depth on chip until a pass ends. Breaking the pass forces a full store to system memory and a reload afterwards, which is pure bandwidth cost. A GPU-side copy does not compile variants, disable early-Z or block the CPU."
    },
    {
      "q": "Two points in view space have the same horizontal offset of 4 m, one at depth 20 m and one at depth 40 m. With a perspective camera, how do their horizontal NDC positions compare?",
      "options": [
        "They are identical, since x does not depend on depth",
        "The far point lies twice as far from the screen centre",
        "The far point lies a quarter as far from the centre",
        "The far point lies half as far from the screen centre"
      ],
      "answer": 3,
      "explain": "The projection puts view depth in w, and dividing x by w makes NDC x proportional to x divided by depth. Doubling the depth therefore halves the distance from the centre. That divide is perspective foreshortening."
    },
    {
      "q": "An artist imports a roughness map with the sRGB option on. In game, surfaces with mid-range roughness look glossier than in the authoring tool. What happened?",
      "options": [
        "The sRGB decode lowered mid-range values, so roughness reads too low",
        "The sRGB decode raised mid-range values, so roughness reads too high",
        "Block compression removed high-frequency detail from the roughness",
        "Trilinear filtering averaged roughness across adjacent mip levels"
      ],
      "answer": 0,
      "explain": "Decoding sRGB to linear maps a stored 0.5 to about 0.21, so the shader sees lower roughness and renders sharper highlights. Roughness is data and must be imported as linear. Compression and filtering soften detail but do not shift mid-range values systematically."
    },
    {
      "q": "A temporal upscaler smears a running character's limbs while the static background looks sharp. Which input most likely needs fixing?",
      "options": [
        "The per-tile light lists built for forward+ shading",
        "The shadow map resolution of each sun cascade",
        "Per-pixel motion vectors that include skinned motion",
        "The UI layer, which must be drawn before upscaling"
      ],
      "answer": 2,
      "explain": "Upscalers reproject history using motion vectors, so anything whose motion is missing from them, such as skinned limbs, smears. Light lists and shadow resolution do not feed the upscaler, and UI should be composited after upscaling, not before."
    },
    {
      "q": "A flight model stores an aircraft's orientation as three Euler angles and adds roll, pitch and yaw rates to them every frame. During a vertical climb the controls start fighting each other. What fixes the root cause?",
      "options": [
        "Clamp pitch to plus or minus 89 degrees in the flight model",
        "Integrate angular velocity into a quaternion and renormalize it",
        "Convert the angles to radians before integrating the rates",
        "Switch the transform code to a row-vector matrix convention"
      ],
      "answer": 1,
      "explain": "At 90 degrees of pitch the Euler representation hits gimbal lock and loses a degree of freedom. Storing orientation as a quaternion has no singularity. Clamping hides the symptom and forbids loops, while units and matrix convention do not change the parametrization."
    },
    {
      "q": "Why does deferred shading make hundreds of small point lights affordable where classic forward rendering struggles?",
      "options": [
        "It skips the depth buffer and saves one memory write per pixel",
        "It evaluates lighting per vertex instead of per covered pixel",
        "It bakes every point light into lightmaps when the level loads",
        "Each light is evaluated only for the visible pixels it covers"
      ],
      "answer": 3,
      "explain": "Deferred writes surface attributes once, then each light shades only the screen pixels it touches, with no wasted work on overdrawn fragments. It still uses depth, lights per pixel and works with fully dynamic lights."
    },
    {
      "q": "QA reports that the first time a player enters the boss arena the game hitches for 250 ms. Replaying the level does not hitch, but the hitch returns after the app is reinstalled. Which explanation fits best?",
      "options": [
        "Garbage collection of the previous level's managed objects",
        "Texture streaming loading the boss's highest mip level",
        "Pipeline states for new shader variants compiled and cached",
        "The boss mesh exceeding the size of the post-transform cache"
      ],
      "answer": 2,
      "explain": "A hitch that appears once, disappears while a cache survives and returns when the cache is wiped is the signature of shader or PSO compilation. Garbage collection and streaming would recur regardless of reinstalling, and the vertex cache causes no hitches."
    },
    {
      "q": "Why are transparent surfaces usually drawn with depth testing on but depth writing off?",
      "options": [
        "Depth writes cannot be enabled while blending is active",
        "It lets the GPU sort transparent triangles automatically",
        "It keeps the depth buffer valid for shadow map rendering",
        "Opaques still hide them, but they never cull other transparents"
      ],
      "answer": 3,
      "explain": "Testing against depth lets opaque geometry in front occlude the glass or smoke, while not writing depth stops one transparent layer from rejecting another behind it when sort order is imperfect. Blending and depth writes can coexist, and the GPU never sorts for you."
    },
    {
      "q": "A handheld console build drops to 40 fps during a rainstorm. The GPU profiler shows the rain particle pass at 9 ms; the particles use a soft-particle shader that reads the depth texture, and several layers cover most of the screen. What is the most effective change?",
      "options": [
        "Merge all the rain emitters into one instanced draw call",
        "Render the rain at half resolution with fewer, larger layers",
        "Switch the rain textures to an uncompressed RGBA format",
        "Add more shadow cascades so the rain is lit consistently"
      ],
      "answer": 1,
      "explain": "The cost is transparent overdraw: every layer is shaded and blended over most of the screen. Half resolution cuts shaded pixels by about 4x and fewer layers cut overdraw. Draw-call merging helps the CPU, uncompressed textures add bandwidth, and cascades add work."
    },
    {
      "q": "A 4096x4096 texture is imported as uncompressed RGBA8 with a full mip chain. Roughly how much GPU memory does it use?",
      "options": [
        "About 64 MB",
        "About 48 MB",
        "About 128 MB",
        "About 85 MB"
      ],
      "answer": 3,
      "explain": "Mip 0 is 4096 x 4096 x 4 bytes = 64 MB, and a full chain adds about one third, giving about 85 MB. Block compression such as BC7 or ASTC 4x4 would cut that by 4x."
    },
    {
      "q": "A designer reports that a door now swings around the middle of the level instead of its hinge after a refactor. In this column-vector engine the new code builds the door's matrix as R * T. What is wrong?",
      "options": [
        "The rotation matrix has to be transposed before it is used",
        "The door must use quaternions instead of rotation matrices",
        "Translation is applied first, so the rotation orbits the origin",
        "Non-uniform scale on the door skews the rotation axis"
      ],
      "answer": 2,
      "explain": "Column-vector chains apply right to left, so R * T moves the door away first and then rotates that offset about the world origin. T * R rotates the door in place and then positions it. Transposing or switching to quaternions keeps the wrong order."
    },
    {
      "q": "In a custom renderer with a fixed constant depth bias, the sun's shadow distance is raised from 50 m to 300 m with the same cascade count and resolution. Shadow acne stripes now cover a large flat floor. Why?",
      "options": [
        "The main camera's far plane is now closer than the shadows",
        "Larger shadow texels mean the existing bias is now too small",
        "The baked lightmaps were invalidated by the longer distance",
        "The floor's normal map is now sampled as sRGB colour data"
      ],
      "answer": 1,
      "explain": "Spreading the same shadow map over six times the distance makes each texel cover far more ground, so the depth error across one texel grows beyond the fixed bias and surfaces self-shadow. Scaling bias with texel size, as many engines do, or adding cascades fixes it."
    },
    {
      "q": "A mesh exported from a tool with counter-clockwise front faces is imported into an engine that treats clockwise as front and culls back faces. It looks inside-out. Which fix is correct?",
      "options": [
        "Recalculate the normals, since the stored normals decide which side is culled",
        "Swap two indices in every triangle at import, leaving the stored normals as they are",
        "Convert the mesh from a triangle list to triangle strips so the order is consistent",
        "Set every material to double-sided rendering and accept the extra fill cost"
      ],
      "answer": 1,
      "explain": "Culling depends on the index order, not on the normals. Swapping two indices per triangle reverses the winding and makes the outside the front face, while the normals were already pointing outward. Double-sided materials hide the symptom but cost extra pixels and break lighting on the back faces."
    },
    {
      "q": "A 50,000-vertex prop stores position float32 x3, normal float32 x3, tangent float32 x4 and UV0 float32 x2 (48 bytes). You want to halve its memory with the least visible risk. Which change does that?",
      "options": [
        "Store positions and UV0 as float16 and leave everything else as it is",
        "Quantise everything to 8-bit normalized values relative to the origin",
        "Drop the tangent and rebuild it in the fragment shader from the normal alone",
        "Pack normal and tangent as snorm8 and UV0 as unorm16, keeping float32 positions"
      ],
      "answer": 3,
      "explain": "12 + 4 + 4 + 4 gives a 24-byte stride, exactly half, and 8-bit unit vectors and 16-bit UVs lose almost nothing visible. Half-float positions and UVs lose precision away from the origin or on tiled textures, and a tangent cannot be rebuilt from the normal alone because it depends on the UV layout."
    },
    {
      "q": "A flat water plane is displaced up to 6 m by a vertex-shader wave function. When the camera looks so the undisplaced plane is just outside the view, wave crests that should be visible vanish and pop back in. What is the cause?",
      "options": [
        "Culling uses bounds from the undisplaced vertices, so they must be enlarged to cover the waves",
        "The depth buffer is too coarse in the distance, so the near plane should be raised",
        "The mesh is using 16-bit indices, so far vertices wrap to the wrong positions",
        "The vertex cache is thrashing, so the index buffer should be reordered"
      ],
      "answer": 0,
      "explain": "Frustum culling uses the mesh bounds, which come from the stored vertex positions rather than the shader's output. Displaced vertices can be on screen while the rest-pose box is not. Widening the bounds fixes it; depth precision, index width and cache order do not cause popping at the screen edge."
    },
    {
      "kind": "order",
      "q": "Put the stages of the GPU rasterisation pipeline in the order a triangle passes through them.",
      "steps": [
        "Input assembly: fetch vertices and indices, form primitives",
        "Vertex stage: transform each vertex to clip space",
        "Primitive assembly, clipping and back-face culling",
        "Rasterization: find covered pixels and generate fragments",
        "Fragment stage: sample textures and compute lighting",
        "Output merger: depth/stencil test, blend and write"
      ],
      "explain": "Vertices are fetched, then shaded to clip space. Only then can triangles be clipped against the frustum and culled by winding, because both need projected positions. The rasteriser turns surviving triangles into fragments, the fragment shader colours them, and the output merger (ROP) depth-tests, blends and writes them."
    },
    {
      "kind": "order",
      "q": "Order the coordinate spaces a vertex position moves through, from the vertex buffer to a pixel on screen.",
      "steps": [
        "Object space, as stored in the vertex buffer",
        "World space, after the model matrix",
        "View space, after the view matrix",
        "Clip space, after the projection matrix",
        "NDC, after the perspective divide by `w`",
        "Screen space, after the viewport transform"
      ],
      "explain": "The model matrix takes object space to world space, the view matrix (the inverse of the camera's world matrix) to view space, and the projection matrix to clip space, which the vertex shader outputs. The hardware divides by `w` to get NDC and the viewport transform maps NDC to pixels."
    },
    {
      "kind": "order",
      "q": "An import pipeline runs meshoptimizer on every mesh. In what order should these passes run?",
      "steps": [
        "`meshopt_optimizeVertexCache`: reorder triangles for post-transform cache reuse",
        "`meshopt_optimizeOverdraw`: reorder triangle groups roughly front to back",
        "`meshopt_optimizeVertexFetch`: renumber vertices in first-use order"
      ],
      "explain": "Cache optimisation sets the triangle order; the overdraw pass then reorders clusters, trading a little cache efficiency for better early-Z rejection; vertex fetch runs last because it renumbers vertices to match the final index order, so memory reads are sequential. Running fetch first would be undone by the later reorders."
    },
    {
      "kind": "line",
      "q": "This fragment shader produces lighting that is too dark in the middle of large triangles. Click the line with the bug.",
      "lang": "hlsl",
      "code": "float4 PS(VSOut i) : SV_Target\n{\n    float3 n = i.nrmW;\n    float3 l = normalize(_LightDir);\n    float  ndl = saturate(dot(n, l));\n    float3 albedo = _Albedo.Sample(_Samp, i.uv).rgb * _Tint.rgb;\n    return float4(albedo * (0.1 + ndl), 1.0);\n}",
      "answer": 2,
      "explain": "Line 3 uses the interpolated normal as is. Interpolating between unit-length vertex normals gives a shorter vector inside the triangle, so `dot(n, l)` is too small there. Fix: `float3 n = normalize(i.nrmW);`."
    },
    {
      "kind": "line",
      "q": "Every object drawn with this vertex shader ignores its position and stays at a fixed offset from the camera, following it like a skybox, though rotation and scale are right. Click the line with the bug.",
      "lang": "hlsl",
      "code": "VSOut VS(VSIn i)\n{\n    VSOut o;\n    float4 world = mul(_Model, float4(i.pos, 0.0));\n    o.clip = mul(_ViewProj, world);\n    o.nrmW = mul((float3x3)_Model, i.nrm);   // models use uniform scale\n    o.uv   = i.uv;\n    return o;\n}",
      "answer": 3,
      "explain": "Line 4 builds the position with `w = 0`, which marks it as a direction, so the translation column of every matrix it passes through is ignored: the model's and the view's. The object is placed as if it and the camera both sat at the origin, so it moves with the camera. A point needs `w = 1`: `mul(_Model, float4(i.pos, 1.0))`. The clip-space `w` then also comes out wrong, breaking perspective."
    },
    {
      "kind": "line",
      "q": "This procedural terrain never appears: Unity logs an error when the vertices are assigned and the mesh comes out empty. Click the line with the bug.",
      "lang": "csharp",
      "code": "var mesh = new Mesh { name = \"Terrain\" };\nint size = 300;                              // 300 x 300 = 90,000 vertices\nvar verts = new Vector3[size * size];\nfor (int z = 0; z < size; z++)\n    for (int x = 0; x < size; x++)\n        verts[z * size + x] = new Vector3(x, heights[x, z], z);\nmesh.indexFormat = IndexFormat.UInt16;\nmesh.vertices = verts;\nmesh.triangles = BuildGridIndices(size);\nmesh.RecalculateNormals();\nmesh.RecalculateBounds();",
      "answer": 6,
      "explain": "Line 7 picks 16-bit indices, which address at most 65,535 vertices, but the grid has 90,000. Unity rejects the vertex array with an error, and the triangle assignment after it fails too, leaving an empty mesh. Fix: `mesh.indexFormat = IndexFormat.UInt32;` before assigning the data."
    },
    {
      "q": "What does this log?",
      "lang": "csharp",
      "code": "Matrix4x4 m = Matrix4x4.Translate(new Vector3(5, 0, 0));\nVector3 p = m.MultiplyPoint(new Vector3(1, 2, 3));\nVector3 d = m.MultiplyVector(new Vector3(1, 2, 3));\nDebug.Log(p.x + d.x);",
      "options": [
        "7",
        "12",
        "2",
        "6"
      ],
      "answer": 0,
      "explain": "`MultiplyPoint` treats the input as a point (`w = 1`), so it picks up the translation: `p.x = 6`. `MultiplyVector` treats it as a direction (`w = 0`) and ignores translation: `d.x = 1`. The sum is 7."
    },
    {
      "q": "How many shader variants does this pass compile, ignoring stripping?",
      "lang": "hlsl",
      "code": "#pragma multi_compile _ FOG_ON\n#pragma multi_compile _ NORMALMAP_ON\n#pragma multi_compile _ SHADOWS_SOFT\n#pragma multi_compile QUALITY_LOW QUALITY_MED QUALITY_HIGH",
      "options": [
        "9",
        "16",
        "24",
        "48"
      ],
      "answer": 2,
      "explain": "Each `multi_compile` line is an independent keyword group and the variant count is the product of the group sizes: 2 x 2 x 2 x 3 = 24. Adding the group sizes (9) is the common mistake; this multiplication is why keyword counts explode."
    }
  ]
});
