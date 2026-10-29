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
          "type": "h",
          "text": "Perspective projection"
        },
        {
          "type": "p",
          "text": "A perspective camera is defined by a **vertical field of view** (commonly 60 to 90 degrees in games), an **aspect ratio** (width/height) and **near and far planes**. The projection matrix scales x and y by `1/tan(fov/2)` (and x by `1/aspect`) and, crucially, copies view-space depth into `w`. After the divide, `x_ndc = x_view / depth`: farther objects have larger divisors and shrink toward the centre, which is exactly perspective foreshortening. Hence the importance of `w`: it is not a spare number, it is depth."
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
          "type": "h",
          "text": "Branching and divergence"
        },
        {
          "type": "p",
          "text": "Because lanes in a warp share an instruction stream, an `if` has two possible costs. If every lane in the group takes the same side (a **uniform** or **coherent** branch, such as one depending on a uniform or a smoothly varying material mask), the GPU executes only that side. If lanes disagree (a **divergent** branch), the hardware executes **both** sides with lanes masked off, paying the sum of both paths. A loop whose trip count varies per lane runs until the longest lane finishes. Consequently, branching on a uniform constant to skip an expensive effect is great; branching per pixel on noisy data to save work often saves nothing, and a branch containing a texture sample can break mip selection because screen-space derivatives become undefined for lanes in non-uniform control flow (use an explicit-mip sample such as `SampleLevel`, or sample before the branch)."
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
          "type": "p",
          "text": "**Mipmaps** solve minification. A mip chain stores the texture at half resolution repeatedly down to 1x1: 1024, 512, 256, and so on. The hardware picks the level whose texel size best matches the pixel footprint, computed from the UV derivatives. **Trilinear** filtering blends between two adjacent mip levels so the transition is smooth. The cost is memory: a full chain adds 1/4 + 1/16 + ... which is about 33 percent. The benefit is large: stable images with no shimmering, and better cache behaviour, because neighbouring pixels read neighbouring texels in a small mip level instead of striding across a huge one."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Mip level   Size        Bytes (RGBA8)\n0           1024x1024   4,194,304\n1           512x512     1,048,576\n2           256x256       262,144\n...\nTotal chain             ~5,592,405  (1.333x of mip 0)"
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
          "type": "p",
          "text": "**Blinn-Phong** adds specular with a half-vector H, halfway between L and the view vector V. Specular intensity is `pow(max(0, dot(N, H)), shininess)`. High shininess gives a tight highlight (polished surface), low gives a wide one. It is cheap and looks acceptable, which is why it dominated for twenty years. Its problems are that parameters are not physically meaningful (shininess has no real-world unit), it does not conserve energy (a surface can reflect more light than it receives), and it looks wrong at grazing angles, where real surfaces become more mirror-like."
        },
        {
          "type": "code",
          "lang": "hlsl",
          "text": "float3 BlinnPhong(float3 N, float3 L, float3 V, float3 albedo, float3 lightCol, float shininess)\n{\n    float3 H = normalize(L + V);\n    float diff = saturate(dot(N, L));\n    float spec = pow(saturate(dot(N, H)), shininess) * step(0.0, diff);\n    return (albedo * diff + spec) * lightCol;\n}"
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
          "type": "h",
          "text": "HDR, tonemapping and bloom"
        },
        {
          "type": "p",
          "text": "Real light spans a huge range: a sunlit pixel can be tens of thousands of times brighter than a shadowed one, but an 8-bit display shows 256 levels. Rendering in **HDR** (high dynamic range) uses float render targets (commonly R11G11B10 or RGBA16F) so lighting values above 1.0 survive until the end. **Tonemapping** then compresses scene-referred values into display range. Clamping at 1.0 loses highlights in a flat white blob; a tonemap curve such as ACES or Khronos PBR Neutral rolls highlights off smoothly and keeps colour. Tonemapping is done after lighting and bloom, in linear space, and before the final sRGB conversion. Auto-exposure adapts the scale factor so a dark cave and noon sun both land in a sensible range."
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
          "type": "h",
          "text": "Tile-based mobile GPUs and bandwidth"
        },
        {
          "type": "p",
          "text": "Desktop GPUs are usually immediate-mode: they rasterise triangles in submission order, writing directly to a framebuffer in VRAM. Mobile GPUs (Apple, Arm Mali, Qualcomm Adreno, PowerVR) are mostly **tile-based**: they first process geometry to bin triangles into small screen tiles (for example 16x16 or 32x32 pixels), then shade one tile at a time in fast on-chip memory, and write the finished tile to system memory once. This slashes framebuffer bandwidth, which matters enormously because mobile memory access costs power and heat. A sustained thermal limit matters as much as peak speed: a device that hits 60 fps for 30 seconds and then throttles to 40 is a typical outcome of bandwidth-heavy rendering."
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
    }
  ]
});
