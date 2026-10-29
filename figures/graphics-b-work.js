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
          "type": "figure",
          "id": "graphics-bilinear-weights",
          "caption": "Point filtering snaps to whichever texel is nearest, while bilinear weights all four by how much a one-texel box around the UV overlaps each.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"A 2 by 2 block of texels with a sample point moving between their centres. Point filtering jumps to the nearest texel value while bilinear filtering blends all four with weights equal to the overlap of a one-texel box around the sample.\"><style>.graphics-bilinear-weights-t{font-size:13px;fill:var(--fig-ink)} .graphics-bilinear-weights-m{font-size:13px;fill:var(--fig-muted)} .graphics-bilinear-weights-h{font-size:14px;font-weight:600;fill:var(--fig-ink)} .graphics-bilinear-weights-mid{text-anchor:middle} .graphics-bilinear-weights-end{text-anchor:end} .graphics-bilinear-weights-mono{font-family:ui-monospace,Menlo,monospace} .graphics-bilinear-weights-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .graphics-bilinear-weights-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .graphics-bilinear-weights-ink{stroke:var(--fig-ink);stroke-width:2;fill:none} .graphics-bilinear-weights-tx{stroke:var(--fig-line);stroke-width:1.5;fill:var(--fig-accent)} .graphics-bilinear-weights-c{fill:var(--fig-muted)} .graphics-bilinear-weights-fp{fill:var(--fig-accent2);fill-opacity:.14;stroke:var(--fig-ink);stroke-width:1.5;stroke-dasharray:5 4} .graphics-bilinear-weights-dot{fill:var(--fig-accent2)} .graphics-bilinear-weights-mv{animation:graphics-bilinear-weights-mv 8s linear infinite} @keyframes graphics-bilinear-weights-mv{0%{transform:translate(0,0)}25%{transform:translate(50px,0)}50%{transform:translate(50px,50px)}75%{transform:translate(0,50px)}100%{transform:translate(0,0)}} .graphics-bilinear-weights-trk{fill:var(--fig-line);fill-opacity:.35} .graphics-bilinear-weights-bar{fill:var(--fig-accent);stroke:var(--fig-accent);stroke-width:1.5;transform-box:fill-box;transform-origin:50% 100%} .graphics-bilinear-weights-ring{fill:none;stroke:var(--fig-accent2);stroke-width:3} .graphics-bilinear-weights-sw{fill:var(--fig-accent)} .graphics-bilinear-weights-bTL{transform:scaleY(0.5625);animation:graphics-bilinear-weights-bTL 8s linear infinite}@keyframes graphics-bilinear-weights-bTL{0%{transform:scaleY(0.5625)}25%{transform:scaleY(0.1875)}50%{transform:scaleY(0.0625)}75%{transform:scaleY(0.1875)}100%{transform:scaleY(0.5625)}} .graphics-bilinear-weights-bTR{transform:scaleY(0.1875);animation:graphics-bilinear-weights-bTR 8s linear infinite}@keyframes graphics-bilinear-weights-bTR{0%{transform:scaleY(0.1875)}25%{transform:scaleY(0.5625)}50%{transform:scaleY(0.1875)}75%{transform:scaleY(0.0625)}100%{transform:scaleY(0.1875)}} .graphics-bilinear-weights-bBL{transform:scaleY(0.1875);animation:graphics-bilinear-weights-bBL 8s linear infinite}@keyframes graphics-bilinear-weights-bBL{0%{transform:scaleY(0.1875)}25%{transform:scaleY(0.0625)}50%{transform:scaleY(0.1875)}75%{transform:scaleY(0.5625)}100%{transform:scaleY(0.1875)}} .graphics-bilinear-weights-bBR{transform:scaleY(0.0625);animation:graphics-bilinear-weights-bBR 8s linear infinite}@keyframes graphics-bilinear-weights-bBR{0%{transform:scaleY(0.0625)}25%{transform:scaleY(0.1875)}50%{transform:scaleY(0.5625)}75%{transform:scaleY(0.1875)}100%{transform:scaleY(0.0625)}} .graphics-bilinear-weights-rTL{opacity:1;animation:graphics-bilinear-weights-rTL 8s linear infinite}@keyframes graphics-bilinear-weights-rTL{0%{opacity:1}12.49%{opacity:1}12.5%{opacity:0}87.49%{opacity:0}87.5%{opacity:1}99.99%{opacity:1}100%{opacity:1}} .graphics-bilinear-weights-rTR{opacity:0;animation:graphics-bilinear-weights-rTR 8s linear infinite}@keyframes graphics-bilinear-weights-rTR{0%{opacity:0}12.49%{opacity:0}12.5%{opacity:1}37.49%{opacity:1}37.5%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-bilinear-weights-rBL{opacity:0;animation:graphics-bilinear-weights-rBL 8s linear infinite}@keyframes graphics-bilinear-weights-rBL{0%{opacity:0}62.49%{opacity:0}62.5%{opacity:1}87.49%{opacity:1}87.5%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-bilinear-weights-rBR{opacity:0;animation:graphics-bilinear-weights-rBR 8s linear infinite}@keyframes graphics-bilinear-weights-rBR{0%{opacity:0}37.49%{opacity:0}37.5%{opacity:1}62.49%{opacity:1}62.5%{opacity:0}99.99%{opacity:0}100%{opacity:0}} .graphics-bilinear-weights-pt{fill-opacity:.2;animation:graphics-bilinear-weights-pt 8s linear infinite}@keyframes graphics-bilinear-weights-pt{0%{fill-opacity:0.2}12.49%{fill-opacity:0.2}12.5%{fill-opacity:0.9}37.49%{fill-opacity:0.9}37.5%{fill-opacity:0.7}62.49%{fill-opacity:0.7}62.5%{fill-opacity:0.5}87.49%{fill-opacity:0.5}87.5%{fill-opacity:0.2}100%{fill-opacity:0.2}} .graphics-bilinear-weights-bl{fill-opacity:0.42;animation:graphics-bilinear-weights-bl 8s linear infinite}@keyframes graphics-bilinear-weights-bl{0%{fill-opacity:0.42}25%{fill-opacity:0.71}50%{fill-opacity:0.67}75%{fill-opacity:0.51}100%{fill-opacity:0.42}}</style><text class=\"graphics-bilinear-weights-h\" x=\"30\" y=\"36\">Texels around the sample</text><text class=\"graphics-bilinear-weights-h\" x=\"300\" y=\"36\">Bilinear weights</text><rect class=\"graphics-bilinear-weights-tx\" x=\"30\" y=\"55\" width=\"100\" height=\"100\" fill-opacity=\"0.2\"/><rect class=\"graphics-bilinear-weights-tx\" x=\"130\" y=\"55\" width=\"100\" height=\"100\" fill-opacity=\"0.9\"/><rect class=\"graphics-bilinear-weights-tx\" x=\"30\" y=\"155\" width=\"100\" height=\"100\" fill-opacity=\"0.5\"/><rect class=\"graphics-bilinear-weights-tx\" x=\"130\" y=\"155\" width=\"100\" height=\"100\" fill-opacity=\"0.7\"/><rect class=\"graphics-bilinear-weights-ring graphics-bilinear-weights-rTL\" x=\"33\" y=\"58\" width=\"94\" height=\"94\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-ring graphics-bilinear-weights-rTR\" x=\"133\" y=\"58\" width=\"94\" height=\"94\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-ring graphics-bilinear-weights-rBL\" x=\"33\" y=\"158\" width=\"94\" height=\"94\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-ring graphics-bilinear-weights-rBR\" x=\"133\" y=\"158\" width=\"94\" height=\"94\" rx=\"4\"/><circle class=\"graphics-bilinear-weights-c\" cx=\"80\" cy=\"105\" r=\"3\"/><circle class=\"graphics-bilinear-weights-c\" cx=\"180\" cy=\"105\" r=\"3\"/><circle class=\"graphics-bilinear-weights-c\" cx=\"80\" cy=\"205\" r=\"3\"/><circle class=\"graphics-bilinear-weights-c\" cx=\"180\" cy=\"205\" r=\"3\"/><rect x=\"30\" y=\"55\" width=\"200\" height=\"200\" rx=\"2\" class=\"graphics-bilinear-weights-ln\"/><g class=\"graphics-bilinear-weights-mv\"><rect class=\"graphics-bilinear-weights-fp\" x=\"55\" y=\"80\" width=\"100\" height=\"100\" rx=\"2\"/><circle class=\"graphics-bilinear-weights-dot\" cx=\"105\" cy=\"130\" r=\"5.5\"/><text class=\"graphics-bilinear-weights-t\" x=\"113\" y=\"124\">uv</text></g><g><rect x=\"38\" y=\"62\" width=\"34\" height=\"20\" rx=\"5\" class=\"graphics-bilinear-weights-pn\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"55\" y=\"77\">0.2</text><rect x=\"188\" y=\"62\" width=\"34\" height=\"20\" rx=\"5\" class=\"graphics-bilinear-weights-pn\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"205\" y=\"77\">0.9</text><rect x=\"38\" y=\"228\" width=\"34\" height=\"20\" rx=\"5\" class=\"graphics-bilinear-weights-pn\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"55\" y=\"243\">0.5</text><rect x=\"188\" y=\"228\" width=\"34\" height=\"20\" rx=\"5\" class=\"graphics-bilinear-weights-pn\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"205\" y=\"243\">0.7</text></g><text class=\"graphics-bilinear-weights-m\" x=\"30\" y=\"282\">dashed box: one texel around uv</text><text class=\"graphics-bilinear-weights-m\" x=\"30\" y=\"302\">its overlap with a texel = that weight</text><rect class=\"graphics-bilinear-weights-trk\" x=\"310\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-bar graphics-bilinear-weights-bTL\" x=\"310\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\" fill-opacity=\"0.25\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"330\" y=\"219\">TL 0.2</text><rect class=\"graphics-bilinear-weights-trk\" x=\"370\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-bar graphics-bilinear-weights-bTR\" x=\"370\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\" fill-opacity=\"0.9\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"390\" y=\"219\">TR 0.9</text><rect class=\"graphics-bilinear-weights-trk\" x=\"430\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-bar graphics-bilinear-weights-bBL\" x=\"430\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\" fill-opacity=\"0.5\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"450\" y=\"219\">BL 0.5</text><rect class=\"graphics-bilinear-weights-trk\" x=\"490\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\"/><rect class=\"graphics-bilinear-weights-bar graphics-bilinear-weights-bBR\" x=\"490\" y=\"55\" width=\"40\" height=\"145\" rx=\"4\" fill-opacity=\"0.7\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"510\" y=\"219\">BR 0.7</text><rect class=\"graphics-bilinear-weights-pn\" x=\"300\" y=\"236\" width=\"110\" height=\"44\" rx=\"10\"/><rect class=\"graphics-bilinear-weights-sw graphics-bilinear-weights-pt\" x=\"300\" y=\"236\" width=\"110\" height=\"44\" rx=\"10\"/><rect class=\"graphics-bilinear-weights-pn\" x=\"470\" y=\"236\" width=\"110\" height=\"44\" rx=\"10\"/><rect class=\"graphics-bilinear-weights-sw graphics-bilinear-weights-bl\" x=\"470\" y=\"236\" width=\"110\" height=\"44\" rx=\"10\"/><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"355\" y=\"302\">Point: nearest texel</text><text class=\"graphics-bilinear-weights-t graphics-bilinear-weights-mid\" x=\"525\" y=\"302\">Bilinear: blend of 4</text></svg>"
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
