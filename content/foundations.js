window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "foundations",
  "title": "CS Foundations",
  "tagline": "The core ideas behind every program: data, cost, structure, memory and time.",
  "intro": "An AI agent can produce plausible code in seconds, but it cannot tell you whether that code is correct for your data, fast enough for your scale, or safe under concurrency unless you can ask the right questions. These foundations give you the vocabulary and mental models to review agent output, spot subtle bugs, and give precise instructions instead of vague ones.",
  "topics": [
    {
      "id": "data-representation",
      "title": "Data Representation",
      "minutes": 10,
      "summary": "How computers store numbers and text, and why integers wrap, floats drift and strings are not characters.",
      "lesson": [
        {
          "type": "p",
          "text": "A billing script adds up prices and reports that 0.1 + 0.2 equals 0.30000000000000004. A user named `José` is stored, read back, and shows up as `JosÃ©`. A counter that has run for years suddenly goes negative. All three bugs come from the same root: everything in a computer is bits, and every higher-level type is an agreement about how to interpret them. When the agreement is violated or misunderstood, you get these bugs."
        },
        {
          "type": "h",
          "text": "Bits, bytes and hex"
        },
        {
          "type": "p",
          "text": "A **bit** is a 0 or 1. A **byte** is 8 bits, giving 256 possible values. Binary is positional like decimal, but with powers of 2: `1011` is 8 + 2 + 1 = 11. Humans read binary badly, so we use **hexadecimal** (base 16), where each hex digit is exactly 4 bits. One byte is two hex digits: `0xFF` is `11111111` is 255. You meet hex in colors (`#FF8800`), memory addresses, hashes and byte dumps."
        },
        {
          "type": "h",
          "text": "Integers and overflow"
        },
        {
          "type": "p",
          "text": "Fixed-width integers have a fixed range. An unsigned 8-bit integer holds 0 to 255. Signed integers almost universally use **two's complement**: a signed 32-bit integer holds -2,147,483,648 to 2,147,483,647. When arithmetic exceeds the range, the result **overflows**. Depending on the language it wraps around silently (C unsigned, Java, Go), is undefined behavior (C and C++ signed), traps (Rust debug builds), or auto-promotes to a big integer (Python)."
        },
        {
          "type": "code",
          "lang": "js",
          "text": "// Java/C-style 32-bit wraparound, simulated in JS\nconst max = 2147483647;\nconsole.log((max + 1) | 0);   // -2147483648: wrapped to the most negative value\n\n// Classic bug: midpoint in binary search\n// int mid = (lo + hi) / 2;        // lo + hi can overflow\n// int mid = lo + (hi - lo) / 2;   // safe"
        },
        {
          "type": "p",
          "text": "Overflow bugs hide because they only appear at large values: a signed 32-bit millisecond counter wraps after about 24.8 days (unsigned, about 49.7), a 32-bit Unix timestamp after January 2038, and database auto-increment IDs eventually run out. When a value is an identifier, a count that can grow without bound, or money, pick the width deliberately."
        },
        {
          "type": "h",
          "text": "Floating point"
        },
        {
          "type": "p",
          "text": "Most languages use IEEE 754 binary floating point. A 64-bit double has 53 bits of precision, so it stores a binary fraction approximating the number. Values like 0.1 have no finite binary representation, in the same way 1/3 has none in decimal. So 0.1 + 0.2 produces the nearest representable result, which is not exactly 0.3."
        },
        {
          "type": "list",
          "items": [
            "Never compare floats with `==`; compare with a tolerance, or avoid floats.",
            "Never use binary floats for money. Use integer cents or a decimal type.",
            "Large magnitudes lose small ones: in JS, `2**53 + 1 === 2**53`. JS numbers are doubles, so integers above `Number.MAX_SAFE_INTEGER` (2^53 - 1) are unsafe; use `BigInt` or strings for 64-bit IDs.",
            "Special values exist: `NaN` (which is not equal to itself), `Infinity` and negative zero.",
            "Order of operations changes results: adding a million small numbers to a large one differs from summing small ones first."
          ]
        },
        {
          "type": "h",
          "text": "Text encodings and UTF-8"
        },
        {
          "type": "p",
          "text": "Text needs two layers. **Unicode** assigns each character a number called a **code point** (`A` is U+0041, `é` is U+00E9, the rocket emoji is U+1F680). An **encoding** turns code points into bytes. **UTF-8** is the dominant encoding: it uses 1 byte for ASCII, and 2 to 4 bytes for everything else, and is backward compatible with ASCII. UTF-16 uses 2 or 4 bytes; JavaScript, Java and C# strings expose UTF-16 code units, so their `length` counts those units, and an emoji outside the Basic Multilingual Plane has length 2."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "s = 'José'\nprint(len(s))                  # 4 code points\nprint(len(s.encode('utf-8')))  # 5 bytes: é takes 2\nprint('JosÃ©')                 # what you get decoding UTF-8 bytes as Latin-1\n\nflag = '\\U0001F1FA\\U0001F1F8'   # two code points render as one flag\nprint(len(flag))               # 2, yet the user sees one symbol"
        },
        {
          "type": "p",
          "text": "Three lengths exist: bytes, code points, and user-perceived characters (grapheme clusters). Slicing a string by byte offset can cut a multibyte character in half. Mojibake like `JosÃ©` is the signature of bytes written in one encoding and read as another. The fix is to decode explicitly and consistently: UTF-8 everywhere at the boundaries (files, HTTP, databases)."
        },
        {
          "type": "figure",
          "id": "foundations-utf8-mojibake",
          "caption": "UTF-8 stores é as two bytes, C3 A9; read back as Latin-1, each byte becomes its own character, and José turns into JosÃ©.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 316\" role=\"img\" aria-label=\"The text José is encoded as UTF-8 into 5 bytes: 4A 6F 73 C3 A9. The character é becomes the two bytes C3 A9. Decoding those bytes as Latin-1 turns each byte into its own character, producing JosÃ©.\"> <style> .foundations-utf8-mojibake-t{font-size:14px;fill:var(--fig-ink)} .foundations-utf8-mojibake-m{font-size:13px;fill:var(--fig-muted)} .foundations-utf8-mojibake-mc{font-size:13px;fill:var(--fig-muted);text-anchor:middle} .foundations-utf8-mojibake-c{font-size:16px;fill:var(--fig-ink);text-anchor:middle} .foundations-utf8-mojibake-b{font-size:15px;fill:var(--fig-ink);text-anchor:middle;font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .foundations-utf8-mojibake-u{font-size:13px;fill:var(--fig-muted);text-anchor:middle;font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .foundations-utf8-mojibake-bad{fill:var(--fig-bad)} .foundations-utf8-mojibake-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .foundations-utf8-mojibake-acc{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.5} .foundations-utf8-mojibake-err{fill:var(--fig-bad);fill-opacity:.1;stroke:var(--fig-bad);stroke-width:1.5} .foundations-utf8-mojibake-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .foundations-utf8-mojibake-ah{fill:var(--fig-muted)} .foundations-utf8-mojibake-dot{fill:var(--fig-accent);opacity:0;animation:foundations-utf8-mojibake-down 6s linear infinite} .foundations-utf8-mojibake-dot.foundations-utf8-mojibake-l{animation-name:foundations-utf8-mojibake-left} .foundations-utf8-mojibake-dot.foundations-utf8-mojibake-r{animation-name:foundations-utf8-mojibake-right} .foundations-utf8-mojibake-d1{animation-delay:.3s} .foundations-utf8-mojibake-d2{animation-delay:.6s} .foundations-utf8-mojibake-d3{animation-delay:.9s} @keyframes foundations-utf8-mojibake-down{0%{transform:translate(0,0);opacity:0}4%{opacity:1}66%{transform:translate(0,132px);opacity:1}70%,100%{transform:translate(0,132px);opacity:0}} @keyframes foundations-utf8-mojibake-left{0%{transform:translate(0,0);opacity:0}4%{opacity:1}27%{transform:translate(-44px,44px)}66%{transform:translate(-44px,132px);opacity:1}70%,100%{transform:translate(-44px,132px);opacity:0}} @keyframes foundations-utf8-mojibake-right{0%{transform:translate(0,0);opacity:0}4%{opacity:1}27%{transform:translate(44px,44px)}66%{transform:translate(44px,132px);opacity:1}70%,100%{transform:translate(44px,132px);opacity:0}} </style> <defs><marker id=\"foundations-utf8-mojibake-arrow\" viewBox=\"0 0 8 8\" refX=\"7.5\" refY=\"4\" markerWidth=\"8\" markerHeight=\"8\" markerUnits=\"userSpaceOnUse\" orient=\"auto\"><path class=\"foundations-utf8-mojibake-ah\" d=\"M0,0.5 L7.5,4 L0,7.5 z\"/></marker></defs> <text class=\"foundations-utf8-mojibake-t\" x=\"24\" y=\"58\">Text</text> <text class=\"foundations-utf8-mojibake-m\" x=\"24\" y=\"77\">4 code points</text> <text class=\"foundations-utf8-mojibake-t\" x=\"24\" y=\"152\">UTF-8 bytes</text> <text class=\"foundations-utf8-mojibake-m\" x=\"24\" y=\"170\">5 bytes</text> <text class=\"foundations-utf8-mojibake-t\" x=\"24\" y=\"240\">Read as Latin-1</text> <text class=\"foundations-utf8-mojibake-m\" x=\"24\" y=\"258\">5 characters</text> <g marker-end=\"url(#foundations-utf8-mojibake-arrow)\"> <path class=\"foundations-utf8-mojibake-ln\" d=\"M208,88 V131\"/><path class=\"foundations-utf8-mojibake-ln\" d=\"M296,88 V131\"/><path class=\"foundations-utf8-mojibake-ln\" d=\"M384,88 V131\"/><path class=\"foundations-utf8-mojibake-ln\" d=\"M516,88 L472,131\"/><path class=\"foundations-utf8-mojibake-ln\" d=\"M516,88 L560,131\"/> <path class=\"foundations-utf8-mojibake-ln\" d=\"M208,176 V219\"/><path class=\"foundations-utf8-mojibake-ln\" d=\"M296,176 V219\"/><path class=\"foundations-utf8-mojibake-ln\" d=\"M384,176 V219\"/><path class=\"foundations-utf8-mojibake-ln\" d=\"M472,176 V219\"/><path class=\"foundations-utf8-mojibake-ln\" d=\"M560,176 V219\"/> </g> <circle class=\"foundations-utf8-mojibake-dot\" cx=\"208\" cy=\"88\" r=\"5\"/> <circle class=\"foundations-utf8-mojibake-dot foundations-utf8-mojibake-d1\" cx=\"296\" cy=\"88\" r=\"5\"/> <circle class=\"foundations-utf8-mojibake-dot foundations-utf8-mojibake-d2\" cx=\"384\" cy=\"88\" r=\"5\"/> <circle class=\"foundations-utf8-mojibake-dot foundations-utf8-mojibake-l foundations-utf8-mojibake-d3\" cx=\"516\" cy=\"88\" r=\"5\"/> <circle class=\"foundations-utf8-mojibake-dot foundations-utf8-mojibake-r foundations-utf8-mojibake-d3\" cx=\"516\" cy=\"88\" r=\"5\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"170\" y=\"36\" width=\"76\" height=\"52\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"258\" y=\"36\" width=\"76\" height=\"52\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"346\" y=\"36\" width=\"76\" height=\"52\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"434\" y=\"36\" width=\"164\" height=\"52\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-acc\" x=\"434\" y=\"36\" width=\"164\" height=\"52\" rx=\"10\"/> <text class=\"foundations-utf8-mojibake-c\" x=\"208\" y=\"60\">J</text><text class=\"foundations-utf8-mojibake-u\" x=\"208\" y=\"79\">U+004A</text> <text class=\"foundations-utf8-mojibake-c\" x=\"296\" y=\"60\">o</text><text class=\"foundations-utf8-mojibake-u\" x=\"296\" y=\"79\">U+006F</text> <text class=\"foundations-utf8-mojibake-c\" x=\"384\" y=\"60\">s</text><text class=\"foundations-utf8-mojibake-u\" x=\"384\" y=\"79\">U+0073</text> <text class=\"foundations-utf8-mojibake-c\" x=\"516\" y=\"60\">é</text><text class=\"foundations-utf8-mojibake-u\" x=\"516\" y=\"79\">U+00E9</text> <rect class=\"foundations-utf8-mojibake-box\" x=\"170\" y=\"132\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"258\" y=\"132\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"346\" y=\"132\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"434\" y=\"132\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-acc\" x=\"434\" y=\"132\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"522\" y=\"132\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-acc\" x=\"522\" y=\"132\" width=\"76\" height=\"44\" rx=\"10\"/> <text class=\"foundations-utf8-mojibake-b\" x=\"208\" y=\"159\">4A</text> <text class=\"foundations-utf8-mojibake-b\" x=\"296\" y=\"159\">6F</text> <text class=\"foundations-utf8-mojibake-b\" x=\"384\" y=\"159\">73</text> <text class=\"foundations-utf8-mojibake-b\" x=\"472\" y=\"159\">C3</text> <text class=\"foundations-utf8-mojibake-b\" x=\"560\" y=\"159\">A9</text> <rect class=\"foundations-utf8-mojibake-box\" x=\"170\" y=\"220\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"258\" y=\"220\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"346\" y=\"220\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"434\" y=\"220\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-err\" x=\"434\" y=\"220\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-box\" x=\"522\" y=\"220\" width=\"76\" height=\"44\" rx=\"10\"/> <rect class=\"foundations-utf8-mojibake-err\" x=\"522\" y=\"220\" width=\"76\" height=\"44\" rx=\"10\"/> <text class=\"foundations-utf8-mojibake-c\" x=\"208\" y=\"248\">J</text> <text class=\"foundations-utf8-mojibake-c\" x=\"296\" y=\"248\">o</text> <text class=\"foundations-utf8-mojibake-c\" x=\"384\" y=\"248\">s</text> <text class=\"foundations-utf8-mojibake-c foundations-utf8-mojibake-bad\" x=\"472\" y=\"248\">Ã</text> <text class=\"foundations-utf8-mojibake-c foundations-utf8-mojibake-bad\" x=\"560\" y=\"248\">©</text> <text class=\"foundations-utf8-mojibake-mc\" x=\"384\" y=\"300\">UTF-8 writes é as 2 bytes; Latin-1 reads each byte as its own character</text> </svg>"
        },
        {
          "type": "h",
          "text": "Common misconceptions"
        },
        {
          "type": "list",
          "items": [
            "\"A string is a list of characters.\" It is a sequence of code units or bytes whose meaning depends on the encoding.",
            "\"Floats are imprecise, so results are random.\" They are deterministic; they are just approximations with predictable error.",
            "\"Python has no overflow, so I am safe.\" Python ints are unbounded, but the moment you cross into numpy, a database column or a binary protocol, fixed widths return."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents write `price * 1.1` with floats and `len(text)` as if it counted characters. When a task touches money, IDs, timestamps, hashing or user text, state the rules up front: 'amounts are integer cents', 'IDs are 64-bit and must not pass through JS Number', 'all I/O is UTF-8'. In review, look for float equality, `(a + b) / 2` midpoints, silent encoding defaults, and tests that only use small ASCII values."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Prices, balances or tax are stored as `float`/`double` and totals are off by a cent",
              "use": "Integer minor units or a decimal type",
              "why": "Store integer cents (or a decimal type) so 0.1 is exact and sums are exact. Decide rounding rules explicitly at the points where division or tax happens."
            },
            {
              "signal": "A computed float is compared with `==` and the check fails intermittently",
              "use": "Tolerance comparison",
              "why": "Compare `abs(a - b) <= eps`, with a relative term for large magnitudes. Floats are deterministic approximations; exact equality only holds for values that are exactly representable."
            },
            {
              "signal": "64-bit database IDs reach a JavaScript client as JSON numbers and two records show the same ID",
              "use": "Serialize big IDs as strings",
              "why": "JS numbers are doubles with 53 bits of precision, so larger integers silently round. Send IDs as strings (or parse to `BigInt`) and never do arithmetic on them."
            },
            {
              "signal": "Text such as `JosÃ©` appears after a round trip through a file, socket or database",
              "use": "Explicit UTF-8 at every boundary",
              "why": "Mojibake means bytes were decoded with the wrong encoding. Decode bytes to text once on input and encode once on output, always naming the encoding instead of trusting a platform default."
            },
            {
              "signal": "A length limit, truncation or cursor move breaks on accented names or emoji",
              "use": "Count the right unit of length",
              "why": "Bytes, code points and grapheme clusters differ. Use bytes for storage limits, graphemes for what users see, and never slice text at a byte offset that may split a multibyte character."
            },
            {
              "signal": "A counter, millisecond tick or Unix timestamp is held in a signed 32-bit integer",
              "use": "Widen to 64-bit integers",
              "why": "32-bit ms counters wrap after about 24.8 days and 32-bit timestamps in 2038. Use 64-bit types, and checked arithmetic where wrap would be silent, at the cost of 4 extra bytes per value."
            },
            {
              "signal": "Objects far from the world origin jitter, and physics or camera get less precise the further the player travels",
              "use": "Floating origin (rebase coordinates)",
              "why": "Float32 spacing grows with magnitude, so precision drops far from zero. Periodically shift the world back to the origin, or keep 64-bit positions and render camera-relative."
            },
            {
              "signal": "Each item carries a dozen independent booleans that are tested, combined and stored together",
              "use": "Bit flags in an integer",
              "why": "Pack flags into one integer and test with `flags & MASK`: compact, cheap to copy, and many flags combine in one operation. Costs readability, so name every mask and cap the count at the integer width."
            }
          ]
        }
      ],
      "keyPoints": [
        "Bits are meaningless without an agreed interpretation; type, width and encoding define it.",
        "Fixed-width integers overflow; know whether your language wraps, traps, or is undefined.",
        "Binary floats approximate decimals, so never use them for money or compare with ==.",
        "Unicode assigns code points; UTF-8 is an encoding; bytes, code points and visible characters differ in count."
      ],
      "quiz": [
        {
          "q": "A service computes order totals as `0.1 + 0.2` dollars per line and compares the sum to `0.3` with `==` before approving. Approvals fail unexpectedly. What is the best fix?",
          "options": [
            "Switch to 32-bit floats so the sum rounds to exactly 0.3",
            "Store amounts as integer cents and compare the integers",
            "Round both sides to 20 decimal places, then compare with ==",
            "Catch the floating-point exception that `==` throws on mismatch"
          ],
          "answer": 1,
          "explain": "Binary floats cannot represent 0.1 exactly, so exact equality is unreliable; integer cents (or a decimal type) make the arithmetic exact. 32-bit floats are less precise, rounding to 20 places does nothing because doubles only hold about 15 to 17 significant digits, and float mismatches are not exceptions."
        },
        {
          "q": "A Python script reads a file containing `José` as UTF-8 bytes but opens it assuming Latin-1, and prints `JosÃ©`. What happened?",
          "options": [
            "The file lost a byte on disk, so é was replaced by two symbols",
            "Python 3 strings cannot store accented characters unless a flag is set",
            "The file was really UTF-16, and Python truncated each code unit",
            "Each of é's two UTF-8 bytes was decoded as its own Latin-1 character"
          ],
          "answer": 3,
          "explain": "In UTF-8, é is the two bytes C3 A9; Latin-1 reads each byte as its own character (Ã and ©). The data is intact; the decoding choice was wrong."
        },
        {
          "q": "In a language with signed 32-bit wraparound, what is the main risk of `mid = (lo + hi) / 2` in a binary search over a huge array?",
          "options": [
            "lo + hi can exceed 2,147,483,647 and wrap to a negative index",
            "Integer division truncates, so the search can skip the target",
            "The division makes each step O(n), so the search is no longer O(log n)",
            "Dividing by 2 yields a float, which cannot be used as an array index"
          ],
          "answer": 0,
          "explain": "The sum can overflow before the division happens. `lo + (hi - lo) / 2` avoids it because hi - lo never exceeds the range. Truncating division is exactly what binary search expects, and complexity is unaffected."
        },
        {
          "q": "A JavaScript client receives 64-bit database IDs as JSON numbers. The IDs are distinct in the database, but after parsing, two different records show the same ID. What is the most likely cause?",
          "options": [
            "JSON limits numbers to 32 bits, so the parser dropped the high bits",
            "UTF-8 encoding of the response body altered some of the digits",
            "JS parses them as doubles, which are exact only up to 2^53 - 1",
            "The client converts IDs to hex strings, which collide for large values"
          ],
          "answer": 2,
          "explain": "Above 2^53 neighboring integers collapse onto the same double, so distinct IDs become equal after parsing. JSON itself sets no 32-bit limit. Sending IDs as strings (or parsing to BigInt) avoids it."
        },
        {
          "q": "A user enters a name that displays as 5 characters, but a database column limited to 5 bytes rejects it. ASCII names of the same length are accepted. What explains this?",
          "options": [
            "UTF-8 always stores each character in exactly 2 bytes",
            "Non-ASCII characters take 2 to 4 bytes each in UTF-8",
            "The database stores all text as UTF-32, at 4 bytes per character",
            "Visible characters always equal code points, so the DB miscounted"
          ],
          "answer": 1,
          "explain": "UTF-8 uses 1 byte for ASCII and 2 to 4 for everything else, so byte length can exceed the visible character count. If UTF-8 used 2 bytes everywhere, or the database used UTF-32, the ASCII names would be rejected too."
        },
        {
          "q": "In an open-world game the character moves smoothly near spawn, but at x = 80,000 the camera shakes and physics jitter. Positions are `float32`. Which approach fits best?",
          "options": [
            "Periodically shift the world so the player stays near zero",
            "Compare positions with a larger epsilon in the physics code",
            "Add smoothing and damping to the camera follow script",
            "Cap the world size so the player cannot travel that far"
          ],
          "answer": 0,
          "explain": "Float32 spacing grows with magnitude, so precision falls far from zero, and rebasing coordinates restores it. Epsilons and smoothing mask the symptom, and capping the world removes the feature."
        }
      ]
    },
    {
      "id": "complexity-big-o",
      "title": "Complexity and Big-O",
      "minutes": 10,
      "summary": "How to reason about how cost grows with input size, and when the constant factors matter instead.",
      "lesson": [
        {
          "type": "p",
          "text": "A feature works perfectly on your laptop with 100 rows, then times out in production with 2 million. The code did not change; the input did. **Complexity analysis** is the discipline of predicting how running time (and memory) grows as input size grows, before you find out the hard way."
        },
        {
          "type": "h",
          "text": "What Big-O means"
        },
        {
          "type": "p",
          "text": "Big-O notation describes an upper bound on growth rate as input size `n` becomes large, ignoring constant factors and lower-order terms. `3n^2 + 50n + 9` is `O(n^2)` because for big `n` the quadratic term dominates. It describes the shape of the curve, not the stopwatch time. Unless stated otherwise, people usually quote the **worst case**, but you can also discuss best, average and expected cases (quicksort is O(n log n) expected and O(n^2) worst case)."
        },
        {
          "type": "h",
          "text": "The common classes"
        },
        {
          "type": "list",
          "items": [
            "`O(1)` constant: array index, hash lookup (expected).",
            "`O(log n)` logarithmic: binary search, balanced tree lookup. Doubling input adds one step.",
            "`O(n)` linear: scan a list once.",
            "`O(n log n)`: efficient comparison sorts (merge sort, typical library sort).",
            "`O(n^2)` quadratic: nested loops over the same data, naive pairwise comparison.",
            "`O(2^n)` and `O(n!)`: exhaustive search over subsets or permutations; unusable beyond tiny `n`."
          ]
        },
        {
          "type": "figure",
          "id": "foundations-growth-curves",
          "caption": "Drawn to scale: by n = 14, n² has already hit 196 steps, while n log n is at 53 and O(log n) and O(1) barely leave the axis.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 356\" role=\"img\" aria-label=\"Growth curves drawn to scale for n from 0 to 40 and up to 200 steps. O(n squared) leaves the chart at n = 14, O(n log n) at about n = 38, while O(n), O(log n) and O(1) stay near the bottom.\"> <style> .foundations-growth-curves-m{font-size:13px;fill:var(--fig-muted)} .foundations-growth-curves-me{font-size:13px;fill:var(--fig-muted);text-anchor:end} .foundations-growth-curves-mc{font-size:13px;fill:var(--fig-muted);text-anchor:middle} .foundations-growth-curves-t{font-size:14px;font-weight:600} .foundations-growth-curves-v{font-size:14px} .foundations-growth-curves-grid{stroke:var(--fig-line);stroke-width:1;fill:none} .foundations-growth-curves-axis{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .foundations-growth-curves-c{fill:none;stroke-width:2.25;stroke-linecap:round;stroke-linejoin:round} .foundations-growth-curves-k1{stroke:var(--fig-ok)}.foundations-growth-curves-f1{fill:var(--fig-ok)} .foundations-growth-curves-k2{stroke:var(--fig-accent2)}.foundations-growth-curves-f2{fill:var(--fig-accent2)} .foundations-growth-curves-k3{stroke:var(--fig-accent)}.foundations-growth-curves-f3{fill:var(--fig-accent)} .foundations-growth-curves-k4{stroke:var(--fig-warn)}.foundations-growth-curves-f4{fill:var(--fig-warn)} .foundations-growth-curves-k5{stroke:var(--fig-bad)}.foundations-growth-curves-f5{fill:var(--fig-bad)} .foundations-growth-curves-mark{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 4;fill:none} .foundations-growth-curves-cover{fill:var(--fig-bg);animation:foundations-growth-curves-sweep 7s linear infinite} .foundations-growth-curves-scan{stroke:var(--fig-accent);stroke-width:2;opacity:0;animation:foundations-growth-curves-scan 7s linear infinite} @keyframes foundations-growth-curves-sweep{0%,45%{transform:translateX(500px);opacity:1}45.1%{transform:translateX(0);opacity:0}54%,58%{transform:translateX(0);opacity:1}96%{transform:translateX(487px)}100%{transform:translateX(500px)}} @keyframes foundations-growth-curves-scan{0%,57.9%{transform:translateX(0);opacity:0}58%{transform:translateX(0);opacity:1}96%{transform:translateX(487px);opacity:1}100%{transform:translateX(487px);opacity:0}} </style> <path class=\"foundations-growth-curves-c foundations-growth-curves-k1\" d=\"M72,298.7 H560\"/> <path class=\"foundations-growth-curves-c foundations-growth-curves-k2\" d=\"M84.2,300 L100.1,298.4 L115.9,297.6 L131.8,297 L147.6,296.6 L163.5,296.2 L179.4,295.9 L195.2,295.7 L211.1,295.4 L226.9,295.2 L242.8,295.1 L258.7,294.9 L274.5,294.7 L290.4,294.6 L306.2,294.5 L322.1,294.3 L338,294.2 L353.8,294.1 L369.7,294 L385.5,293.9 L401.4,293.8 L417.3,293.7 L433.1,293.6 L449,293.6 L464.8,293.5 L480.7,293.4 L496.6,293.3 L512.4,293.3 L528.3,293.2 L544.1,293.1 L560,293.1\"/> <path class=\"foundations-growth-curves-c foundations-growth-curves-k3\" d=\"M72,300 L560,248\"/> <path class=\"foundations-growth-curves-c foundations-growth-curves-k4\" d=\"M84.2,300 L99.3,296.6 L114.4,291.9 L129.4,286.3 L144.5,280.1 L159.6,273.4 L174.7,266.4 L189.8,258.9 L204.9,251.2 L219.9,243.2 L235,235 L250.1,226.6 L265.2,218 L280.3,209.2 L295.3,200.2 L310.4,191 L325.5,181.8 L340.6,172.3 L355.7,162.8 L370.8,153.1 L385.8,143.3 L400.9,133.4 L416,123.4 L431.1,113.3 L446.2,103.1 L461.3,92.8 L476.3,82.4 L491.4,71.9 L506.5,61.4 L521.6,50.7 L536.7,40\"/> <path class=\"foundations-growth-curves-c foundations-growth-curves-k5\" d=\"M72,300 L77.8,299.7 L83.5,298.8 L89.3,297.4 L95,295.4 L100.8,292.8 L106.5,289.6 L112.3,285.8 L118,281.5 L123.8,276.6 L129.5,271.1 L135.3,265 L141,258.4 L146.8,251.2 L152.5,243.4 L158.3,235 L164,226 L169.8,216.5 L175.5,206.4 L181.3,195.7 L187,184.4 L192.8,172.6 L198.5,160.2 L204.3,147.2 L210,133.6 L215.8,119.4 L221.5,104.7 L227.3,89.4 L233,73.5 L238.8,57 L244.5,40\"/> <rect class=\"foundations-growth-curves-cover\" x=\"73\" y=\"30\" width=\"500\" height=\"272\"/> <line class=\"foundations-growth-curves-scan\" x1=\"73\" y1=\"40\" x2=\"73\" y2=\"300\"/> <path class=\"foundations-growth-curves-grid\" d=\"M72,235 H560 M72,170 H560 M72,105 H560 M72,40 H560 M194,40 V300 M316,40 V300 M438,40 V300 M560,40 V300\"/> <path class=\"foundations-growth-curves-axis\" d=\"M72,36 V300 H564\"/> <path class=\"foundations-growth-curves-mark\" d=\"M242.8,300 V48\"/> <circle class=\"foundations-growth-curves-f5\" cx=\"242.8\" cy=\"45.2\" r=\"4\"/> <circle class=\"foundations-growth-curves-f4\" cx=\"242.8\" cy=\"230.7\" r=\"4\"/> <circle class=\"foundations-growth-curves-f3\" cx=\"242.8\" cy=\"281.8\" r=\"4\"/> <text class=\"foundations-growth-curves-me\" x=\"62\" y=\"304\">0</text> <text class=\"foundations-growth-curves-me\" x=\"62\" y=\"239\">50</text> <text class=\"foundations-growth-curves-me\" x=\"62\" y=\"174\">100</text> <text class=\"foundations-growth-curves-me\" x=\"62\" y=\"109\">150</text> <text class=\"foundations-growth-curves-me\" x=\"62\" y=\"44\">200</text> <text class=\"foundations-growth-curves-mc\" x=\"72\" y=\"320\">0</text> <text class=\"foundations-growth-curves-mc\" x=\"194\" y=\"320\">10</text> <text class=\"foundations-growth-curves-mc\" x=\"316\" y=\"320\">20</text> <text class=\"foundations-growth-curves-mc\" x=\"438\" y=\"320\">30</text> <text class=\"foundations-growth-curves-mc\" x=\"560\" y=\"320\">40</text> <text class=\"foundations-growth-curves-mc\" x=\"242.8\" y=\"320\">14</text> <text class=\"foundations-growth-curves-mc\" x=\"316\" y=\"344\">input size n</text> <text class=\"foundations-growth-curves-m\" x=\"24\" y=\"22\">steps</text> <text class=\"foundations-growth-curves-m\" x=\"92\" y=\"64\">at n = 14</text> <text class=\"foundations-growth-curves-v foundations-growth-curves-f5\" x=\"92\" y=\"86\">n² = 196</text> <text class=\"foundations-growth-curves-v foundations-growth-curves-f4\" x=\"92\" y=\"106\">n log n ≈ 53</text> <text class=\"foundations-growth-curves-v foundations-growth-curves-f3\" x=\"92\" y=\"126\">n = 14</text> <text class=\"foundations-growth-curves-t foundations-growth-curves-f5\" x=\"254\" y=\"50\">O(n²)</text> <text class=\"foundations-growth-curves-t foundations-growth-curves-f4\" x=\"546\" y=\"46\">O(n log n)</text> <text class=\"foundations-growth-curves-t foundations-growth-curves-f3\" x=\"568\" y=\"253\">O(n)</text> <text class=\"foundations-growth-curves-t foundations-growth-curves-f2\" x=\"568\" y=\"290\">O(log n)</text> <text class=\"foundations-growth-curves-t foundations-growth-curves-f1\" x=\"568\" y=\"309\">O(1)</text> </svg>"
        },
        {
          "type": "p",
          "text": "A useful feel: at n = 1,000,000, O(n) is about a million steps, O(n log n) about 20 million, O(n^2) a trillion. A trillion simple operations is minutes to hours; that is the difference between a request and an outage."
        },
        {
          "type": "h",
          "text": "Worked example: hidden quadratics"
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# Find users who appear in both lists\ndef common_slow(a, b):\n    return [x for x in a if x in b]       # 'in' on a list is O(len(b)) -> O(n*m)\n\ndef common_fast(a, b):\n    b_set = set(b)                        # O(m) to build\n    return [x for x in a if x in b_set]   # O(1) expected each -> O(n + m)"
        },
        {
          "type": "p",
          "text": "Both look like one loop. The slow version hides a second loop inside `in`. Reading complexity means knowing the cost of each operation you call: list `in`, string concatenation in a loop, `list.pop(0)`, `ORDER BY` without an index, and a database query inside a loop (the N+1 problem) are classic hidden costs."
        },
        {
          "type": "h",
          "text": "Space complexity"
        },
        {
          "type": "p",
          "text": "Memory grows too. The set above trades O(m) extra space for speed. Recursion uses stack space proportional to depth. Time-space tradeoffs are everywhere: caching, indexes and precomputed tables all spend memory to save time."
        },
        {
          "type": "h",
          "text": "Amortized analysis"
        },
        {
          "type": "p",
          "text": "Appending to a dynamic array (Python list, JS array, Java ArrayList) is usually O(1), but occasionally the buffer is full and it copies everything into a bigger one, costing O(n). Because capacity grows geometrically (say doubling), the expensive copies are rare enough that the average cost over a sequence of appends is O(1). That is **amortized** O(1): a guarantee about the total over many operations, not each single one. A single append can still be slow, which matters for latency-sensitive code."
        },
        {
          "type": "h",
          "text": "When constants matter"
        },
        {
          "type": "p",
          "text": "Big-O hides constants, and constants can dominate at realistic sizes. For small `n` (tens to hundreds), a linear scan of a contiguous array often beats a hash map or tree because of CPU cache locality and lower overhead. Library sorts switch to insertion sort for small slices for this reason. An O(n) algorithm that makes a network call per element loses to an O(n log n) one that stays in memory. The rule: use Big-O to rule out the disasters, then **measure** to choose among the survivors."
        },
        {
          "type": "h",
          "text": "Misconceptions"
        },
        {
          "type": "list",
          "items": [
            "\"O(1) means fast.\" It means size-independent. A constant 2-second call is O(1).",
            "\"Big-O is the exact count of operations.\" It is a growth trend; two O(n) algorithms can differ 100x.",
            "\"Optimize everything.\" Optimizing code that runs on 50 items is wasted effort and added complexity."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents tend to write the simplest code that passes the example in the prompt, which is often a nested loop or a query per item. Tell the agent the expected input sizes ('up to 5 million rows') and the budget ('under 200 ms'). In review, hunt for loops containing `in list`, `.find`, `.filter`, string `+=`, or I/O calls. Ask the agent to state the complexity of what it wrote and then verify it with a benchmark at realistic scale."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A loop over `n` orders calls `customers.find(...)` or a linear search on another collection",
              "use": "Build a lookup map once",
              "why": "Index the inner collection by key before the loop, turning O(n·m) into O(n + m). Costs O(m) memory; only worth it when the lookups repeat."
            },
            {
              "signal": "A loop issues one database or HTTP call per item and latency grows with the number of rows",
              "use": "Batch the query (N+1 fix)",
              "why": "Fetch everything in one `WHERE id IN (...)` or a join, then match in memory. One round trip replaces n, though very large batches may need chunking."
            },
            {
              "signal": "A string is built with `s += piece` inside a loop over thousands of items",
              "use": "Collect parts, join once",
              "why": "With immutable strings each `+=` can copy the whole string so far, giving O(n^2). Append to a list or string builder and join once for O(n) total."
            },
            {
              "signal": "You must remove duplicates from a large list and keep the first-seen order",
              "use": "Seen-set dedupe",
              "why": "Scan once, skip items already in a hash set: O(n) expected time and O(n) extra memory. Items must be hashable and stable while in the set."
            },
            {
              "signal": "You must dedupe or group a huge dataset, memory is tight or the output should be sorted anyway",
              "use": "Sort, then scan neighbours",
              "why": "After sorting, equal items are adjacent, so one pass finds duplicates or groups. O(n log n) instead of O(n), but works in place or externally and gives sorted output."
            },
            {
              "signal": "You need the top 10 of millions of scores and the code sorts the whole list first",
              "use": "Partial selection with a size-k heap",
              "why": "A min-heap holding k items costs O(n log k) time and O(k) memory, and works on streams. A full sort costs O(n log n) and needs everything in memory."
            },
            {
              "signal": "In a hot loop over about 20 small items, a hash map is slower than a plain array scan in the profiler",
              "use": "Linear scan over a contiguous array",
              "why": "At small n, constants and cache locality dominate Big-O; a contiguous scan avoids hashing and pointer chasing. Re-measure if n can grow into the thousands."
            },
            {
              "signal": "Someone argues a call is O(1) or O(n log n) so it cannot be the cause of a slowdown",
              "use": "Measure with a profiler",
              "why": "Big-O predicts growth, not absolute cost: an O(1) call can block on I/O for seconds. Use Big-O to rule out bad designs, then profile with realistic input sizes."
            }
          ]
        }
      ],
      "keyPoints": [
        "Big-O describes how cost grows with input size, ignoring constants and lower-order terms.",
        "Hidden loops inside library calls (list membership, per-item queries) are the most common source of accidental quadratics.",
        "Amortized O(1) means cheap on average over many operations, even if one operation is occasionally expensive.",
        "Use Big-O to eliminate bad designs, then measure; constants and cache behavior dominate at small sizes."
      ],
      "quiz": [
        {
          "q": "A function loops over `n` orders and, for each, calls `customers.find(c => c.id === order.customerId)` on an array of `m` customers. What is its time complexity?",
          "options": [
            "O(n + m)",
            "O(n log m)",
            "O(n * m)",
            "O(m)"
          ],
          "answer": 2,
          "explain": "The inner find scans up to m customers for each of n orders. Building a map from id to customer first would make it O(n + m)."
        },
        {
          "q": "Appending to a dynamic array is described as amortized O(1). What does that mean?",
          "options": [
            "Every append costs the same constant time, because capacity is reserved ahead",
            "Appends cost O(1) in the best case and O(n) on average across a sequence",
            "Appends cost O(1) only while the array stays below a fixed size limit",
            "Averaged over many appends the cost is constant, though one may cost O(n)"
          ],
          "answer": 3,
          "explain": "Occasional resize-and-copy operations are spread across the many cheap appends. It is a guarantee about the total, not about each operation, so one append can still cause a latency spike."
        },
        {
          "q": "You look up values among about 20 small items in a hot loop. A profiler shows a linear scan over a plain array is faster than your hash map. Which conclusion is most reasonable?",
          "options": [
            "At n = 20, constant factors like hashing cost and cache locality dominate",
            "The profiler must be wrong, since hash lookups are O(1) and scans are O(n)",
            "Big-O analysis does not apply to arrays, only to hash-based structures",
            "Hash maps are only O(1) after they have been warmed up with many inserts"
          ],
          "answer": 0,
          "explain": "Big-O is about growth for large n. For n = 20 the scan's low overhead and cache-friendly layout beat hashing. Keep the faster one, but know it will not scale if n grows."
        },
        {
          "q": "Which approach gives the best asymptotic time for de-duplicating a list of 1 million strings while preserving first-seen order?",
          "options": [
            "For each string, scan the output list and append it if it is not there",
            "Track seen strings in a hash set and append only unseen ones",
            "Sort the strings, then drop adjacent duplicates in a single pass",
            "Insert into a balanced tree and re-sort the output after each append"
          ],
          "answer": 1,
          "explain": "A hash set gives expected O(1) membership, so the whole pass is O(n). Scanning the output is O(n^2); sorting is O(n log n) and loses first-seen order; re-sorting after each append is worse still."
        },
        {
          "q": "A teammate says: 'This endpoint is O(1), so it cannot be the cause of our latency problem.' What is the flaw?",
          "options": [
            "O(1) code cannot be called inside a loop, so it cannot add up",
            "O(1) describes memory use only, not running time",
            "O(1) means size-independent; the constant itself can be large",
            "O(1) means one CPU instruction, so the claim is actually correct"
          ],
          "answer": 2,
          "explain": "Constant does not mean small. An endpoint that always does a 3-second remote call is O(1) and still the bottleneck."
        },
        {
          "q": "A nightly job sorts 50 million scores in memory to show the top 10 players. It takes minutes and needs 8 GB of RAM. Which approach fits best?",
          "options": [
            "Build a hash map from player to score before sorting",
            "Sort in parallel across cores to cut the wall-clock time",
            "Sort once, then scan neighbours to drop the duplicate scores",
            "Scan the scores once while keeping a min-heap of size 10"
          ],
          "answer": 3,
          "explain": "A size-k heap costs O(n log k) time and O(k) memory and even works on streams. Parallel sorting still holds everything in memory, and neighbour scanning solves dedupe, not selection."
        }
      ]
    },
    {
      "id": "core-data-structures",
      "title": "Core Data Structures",
      "minutes": 12,
      "summary": "Arrays, lists, hash maps, stacks, queues, trees, heaps and graphs, and how to choose between them.",
      "lesson": [
        {
          "type": "p",
          "text": "Imagine building an autocomplete box, a task scheduler and a route planner. The business logic differs, but each reduces to the same question: how should the data be organized so the operations you need are cheap? A **data structure** is a way of organizing data together with the operations it supports and their costs. Choosing well often matters more than clever code."
        },
        {
          "type": "h",
          "text": "Arrays and dynamic arrays"
        },
        {
          "type": "p",
          "text": "An array stores elements contiguously in memory, so indexing is O(1) and iteration is cache-friendly. Inserting or deleting in the middle shifts elements: O(n). Dynamic arrays (Python `list`, JS `Array`, Java `ArrayList`) resize automatically with amortized O(1) append. Arrays are the right default."
        },
        {
          "type": "h",
          "text": "Linked lists"
        },
        {
          "type": "p",
          "text": "A linked list stores nodes holding a value and a pointer to the next node. Insertion or removal is O(1) once you hold the node, but reaching the k-th element is O(k), and nodes scatter across memory, hurting cache performance. In practice linked lists are rarer than textbooks suggest; they appear inside other structures (hash map chains, LRU caches) more than as a standalone choice."
        },
        {
          "type": "h",
          "text": "Hash maps and sets"
        },
        {
          "type": "p",
          "text": "A hash map turns a key into an array index via a **hash function**, giving expected O(1) insert, lookup and delete. Collisions (two keys, one slot) are handled by chaining or probing. Worst case degrades to O(n) if many keys collide. Keys must be hashable and immutable in spirit: mutating a key after insertion breaks lookups. Iteration order is a language-level guarantee in some languages (Python dicts, JS Maps preserve insertion order) and not in others. A **set** is a map without values."
        },
        {
          "type": "figure",
          "id": "foundations-hash-buckets",
          "caption": "The hash function turns each key into a bucket index; carol collides with alice in bucket 3 and is chained after it.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 312\" role=\"img\" aria-label=\"A hash map with 8 buckets. hash(key) % 8 sends alice to bucket 3 and bob to bucket 6. carol also hashes to bucket 3, a collision, so it is chained after alice in the same bucket.\"> <style> .foundations-hash-buckets-m{font-size:13px;fill:var(--fig-muted)} .foundations-hash-buckets-mc{font-size:13px;fill:var(--fig-muted);text-anchor:middle} .foundations-hash-buckets-t{font-size:14px;fill:var(--fig-ink)} .foundations-hash-buckets-tc{font-size:14px;fill:var(--fig-ink);text-anchor:middle} .foundations-hash-buckets-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .foundations-hash-buckets-w{fill:var(--fig-warn)} .foundations-hash-buckets-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .foundations-hash-buckets-fn{fill:var(--fig-panel);stroke:var(--fig-accent2);stroke-width:2} .foundations-hash-buckets-a{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.5} .foundations-hash-buckets-c{fill:var(--fig-warn);fill-opacity:.14;stroke:var(--fig-warn);stroke-width:1.5} .foundations-hash-buckets-hot{stroke:var(--fig-accent);stroke-width:1.5} .foundations-hash-buckets-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .foundations-hash-buckets-ah{fill:var(--fig-muted)} .foundations-hash-buckets-tok{fill:var(--fig-accent);opacity:0;animation:foundations-hash-buckets-alice 6s linear infinite} .foundations-hash-buckets-tok.foundations-hash-buckets-k2{animation-name:foundations-hash-buckets-bob;animation-delay:2s} .foundations-hash-buckets-tok.foundations-hash-buckets-k3{animation-name:foundations-hash-buckets-carol;animation-delay:4s;fill:var(--fig-warn)} .foundations-hash-buckets-ring{fill:none;stroke-width:2.5;opacity:0;animation:foundations-hash-buckets-ring 6s ease-out infinite} .foundations-hash-buckets-r1{stroke:var(--fig-accent)} .foundations-hash-buckets-r2{stroke:var(--fig-accent);animation-delay:2s} .foundations-hash-buckets-r3{stroke:var(--fig-warn);animation-delay:4s} @keyframes foundations-hash-buckets-alice{0%{transform:translate(0,0);opacity:0}3%{opacity:1}10%{transform:translate(62px,36px)}16%{transform:translate(202px,50px)}23%{transform:translate(264px,45px)}28%{transform:translate(328px,45px);opacity:1}30%,100%{transform:translate(328px,45px);opacity:0}} @keyframes foundations-hash-buckets-bob{0%{transform:translate(0,0);opacity:0}3%{opacity:1}10%{transform:translate(62px,0)}16%{transform:translate(202px,0)}23%{transform:translate(264px,97px)}28%{transform:translate(328px,97px);opacity:1}30%,100%{transform:translate(328px,97px);opacity:0}} @keyframes foundations-hash-buckets-carol{0%{transform:translate(0,0);opacity:0}3%{opacity:1}10%{transform:translate(62px,-36px)}16%{transform:translate(202px,-50px)}23%{transform:translate(264px,-55px)}28%{transform:translate(424px,-55px);opacity:1}30%,100%{transform:translate(424px,-55px);opacity:0}} @keyframes foundations-hash-buckets-ring{0%,27%{opacity:0}31%{opacity:1}50%,100%{opacity:0}} </style> <defs><marker id=\"foundations-hash-buckets-arrow\" viewBox=\"0 0 8 8\" refX=\"7.5\" refY=\"4\" markerWidth=\"8\" markerHeight=\"8\" markerUnits=\"userSpaceOnUse\" orient=\"auto\"><path class=\"foundations-hash-buckets-ah\" d=\"M0,0.5 L7.5,4 L0,7.5 z\"/></marker></defs> <text class=\"foundations-hash-buckets-m\" x=\"24\" y=\"70\">keys</text> <text class=\"foundations-hash-buckets-mc\" x=\"412\" y=\"18\">buckets</text> <g marker-end=\"url(#foundations-hash-buckets-arrow)\"> <path class=\"foundations-hash-buckets-ln\" d=\"M128,100 L188,136\"/><path class=\"foundations-hash-buckets-ln\" d=\"M128,150 H188\"/><path class=\"foundations-hash-buckets-ln\" d=\"M128,200 L188,164\"/> <path class=\"foundations-hash-buckets-ln\" d=\"M330,150 L390,145\"/><path class=\"foundations-hash-buckets-ln\" d=\"M330,150 L390,247\"/> <path class=\"foundations-hash-buckets-ln\" d=\"M432,145 H455\"/><path class=\"foundations-hash-buckets-ln\" d=\"M532,145 H551\"/><path class=\"foundations-hash-buckets-ln\" d=\"M432,247 H455\"/> </g> <circle class=\"foundations-hash-buckets-tok\" cx=\"128\" cy=\"100\" r=\"6\"/> <circle class=\"foundations-hash-buckets-tok foundations-hash-buckets-k2\" cx=\"128\" cy=\"150\" r=\"6\"/> <circle class=\"foundations-hash-buckets-tok foundations-hash-buckets-k3\" cx=\"128\" cy=\"200\" r=\"6\"/> <rect class=\"foundations-hash-buckets-box\" x=\"24\" y=\"83\" width=\"104\" height=\"34\" rx=\"9\"/> <rect class=\"foundations-hash-buckets-box\" x=\"24\" y=\"133\" width=\"104\" height=\"34\" rx=\"9\"/> <rect class=\"foundations-hash-buckets-box\" x=\"24\" y=\"183\" width=\"104\" height=\"34\" rx=\"9\"/> <text class=\"foundations-hash-buckets-tc\" x=\"76\" y=\"105\">alice</text> <text class=\"foundations-hash-buckets-tc\" x=\"76\" y=\"155\">bob</text> <text class=\"foundations-hash-buckets-tc\" x=\"76\" y=\"205\">carol</text> <rect class=\"foundations-hash-buckets-fn\" x=\"190\" y=\"118\" width=\"140\" height=\"64\" rx=\"12\"/> <text class=\"foundations-hash-buckets-tc foundations-hash-buckets-mono\" x=\"260\" y=\"155\">hash(key) % 8</text> <g class=\"foundations-hash-buckets-mono\"> <rect class=\"foundations-hash-buckets-box\" x=\"392\" y=\"28\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"foundations-hash-buckets-mc\" x=\"412\" y=\"48\">0</text> <rect class=\"foundations-hash-buckets-box\" x=\"392\" y=\"62\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"foundations-hash-buckets-mc\" x=\"412\" y=\"82\">1</text> <rect class=\"foundations-hash-buckets-box\" x=\"392\" y=\"96\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"foundations-hash-buckets-mc\" x=\"412\" y=\"116\">2</text> <rect class=\"foundations-hash-buckets-box foundations-hash-buckets-hot\" x=\"392\" y=\"130\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"foundations-hash-buckets-tc\" x=\"412\" y=\"150\">3</text> <rect class=\"foundations-hash-buckets-box\" x=\"392\" y=\"164\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"foundations-hash-buckets-mc\" x=\"412\" y=\"184\">4</text> <rect class=\"foundations-hash-buckets-box\" x=\"392\" y=\"198\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"foundations-hash-buckets-mc\" x=\"412\" y=\"218\">5</text> <rect class=\"foundations-hash-buckets-box foundations-hash-buckets-hot\" x=\"392\" y=\"232\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"foundations-hash-buckets-tc\" x=\"412\" y=\"252\">6</text> <rect class=\"foundations-hash-buckets-box\" x=\"392\" y=\"266\" width=\"40\" height=\"30\" rx=\"8\"/><text class=\"foundations-hash-buckets-mc\" x=\"412\" y=\"286\">7</text> </g> <rect class=\"foundations-hash-buckets-box\" x=\"456\" y=\"130\" width=\"76\" height=\"30\" rx=\"8\"/><rect class=\"foundations-hash-buckets-a\" x=\"456\" y=\"130\" width=\"76\" height=\"30\" rx=\"8\"/> <rect class=\"foundations-hash-buckets-box\" x=\"552\" y=\"130\" width=\"76\" height=\"30\" rx=\"8\"/><rect class=\"foundations-hash-buckets-c\" x=\"552\" y=\"130\" width=\"76\" height=\"30\" rx=\"8\"/> <rect class=\"foundations-hash-buckets-box\" x=\"456\" y=\"232\" width=\"76\" height=\"30\" rx=\"8\"/><rect class=\"foundations-hash-buckets-a\" x=\"456\" y=\"232\" width=\"76\" height=\"30\" rx=\"8\"/> <text class=\"foundations-hash-buckets-tc\" x=\"494\" y=\"150\">alice</text> <text class=\"foundations-hash-buckets-tc\" x=\"590\" y=\"150\">carol</text> <text class=\"foundations-hash-buckets-tc\" x=\"494\" y=\"252\">bob</text> <text class=\"foundations-hash-buckets-mc\" x=\"590\" y=\"178\">chained</text> <rect class=\"foundations-hash-buckets-ring foundations-hash-buckets-r1\" x=\"452\" y=\"126\" width=\"84\" height=\"38\" rx=\"11\"/> <rect class=\"foundations-hash-buckets-ring foundations-hash-buckets-r2\" x=\"452\" y=\"228\" width=\"84\" height=\"38\" rx=\"11\"/> <rect class=\"foundations-hash-buckets-ring foundations-hash-buckets-r3\" x=\"548\" y=\"126\" width=\"84\" height=\"38\" rx=\"11\"/> <text class=\"foundations-hash-buckets-t\" x=\"190\" y=\"214\">alice → 3</text> <text class=\"foundations-hash-buckets-t\" x=\"190\" y=\"236\">bob → 6</text> <text class=\"foundations-hash-buckets-t\" x=\"190\" y=\"258\">carol → 3 <tspan class=\"foundations-hash-buckets-w\">collision</tspan></text> </svg>"
        },
        {
          "type": "h",
          "text": "Stacks and queues"
        },
        {
          "type": "p",
          "text": "A **stack** is last-in-first-out (push, pop): call stacks, undo history, parsing nested brackets, depth-first search. A **queue** is first-in-first-out (enqueue, dequeue): job processing, breadth-first search, buffering. A **deque** supports both ends. Use a proper deque, not `list.pop(0)`, which is O(n)."
        },
        {
          "type": "h",
          "text": "Trees and heaps"
        },
        {
          "type": "p",
          "text": "A **tree** is a hierarchy of nodes. A **binary search tree** keeps smaller keys left and larger right, giving O(log n) search if balanced; unbalanced it degenerates into a list, so real implementations use self-balancing variants (red-black trees, B-trees). B-trees, which store many keys per node to minimize disk reads, underlie most database indexes and give you ordered traversal and range queries that hash maps cannot. A **heap** is a tree (usually stored in an array) where each parent is less than or equal to its children (min-heap), so the minimum is always at the top: peek O(1), push and pop O(log n). Heaps power priority queues, schedulers and top-k problems."
        },
        {
          "type": "h",
          "text": "Graphs"
        },
        {
          "type": "p",
          "text": "A **graph** is nodes (vertices) connected by edges, possibly directed or weighted. Trees are connected graphs without cycles. Models: road networks, social links, dependency graphs (build systems, package managers), state machines. Store as an **adjacency list** (each node maps to its neighbors; space O(V + E), good for sparse graphs) or an adjacency matrix (O(V^2) space, O(1) edge check, good for dense graphs)."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "from collections import deque, defaultdict\nimport heapq\n\nseen_ids = set()                 # membership: expected O(1)\nprices = {}                      # key -> value lookup\nq = deque()                      # FIFO, O(1) at both ends\nstack = []                       # LIFO via append/pop\nheap = []                        # min-heap\nheapq.heappush(heap, (5, 'low')) # O(log n)\nheapq.heappush(heap, (1, 'urgent'))\nprint(heapq.heappop(heap))       # (1, 'urgent')\n\ngraph = defaultdict(list)        # adjacency list\ngraph['app'].append('lib')\ngraph['lib'].append('core')"
        },
        {
          "type": "h",
          "text": "Choosing one"
        },
        {
          "type": "list",
          "items": [
            "Need lookup by key or de-duplication? Hash map or set.",
            "Need ordered keys, range queries or sorted iteration? Balanced tree or a sorted array with binary search.",
            "Need repeated 'give me the smallest/highest priority'? Heap.",
            "Need to process in arrival order? Queue. Reverse order or backtracking? Stack.",
            "Relationships between things? Graph.",
            "Otherwise, start with an array and change when measurements or access patterns demand it."
          ]
        },
        {
          "type": "p",
          "text": "Pitfalls: using a list as a set, assuming a hash map is sorted, forgetting that a hash map holds extra memory per entry, and mutating objects used as keys."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents default to lists and nested loops because they are the shortest code. When you describe a task, name the access pattern ('look up by id millions of times', 'need top 10 by score continuously') rather than prescribing a structure, and ask the agent to justify its choice. In review, flag `x in some_list` in loops, repeated `sort()` where a heap would do, and hand-rolled trees or graphs where a standard library structure exists."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "You test `x in items` inside a loop and `items` is a list",
              "use": "Hash set",
              "why": "Average O(1) membership instead of O(n), so an O(n·m) loop becomes O(n + m). Costs extra memory per entry and gives no ordering guarantee."
            },
            {
              "signal": "Queries ask for keys in a range, the nearest key, or sorted iteration (orders between two dates)",
              "use": "Sorted array or balanced search tree",
              "why": "Both give O(log n) search and in-order range scans. A sorted array with binary search is compact and fastest if built once; use a balanced tree when inserts and deletes are frequent."
            },
            {
              "signal": "Code repeatedly asks for the smallest or highest-priority item while items keep arriving (jobs, timers)",
              "use": "Binary heap (priority queue)",
              "why": "O(log n) push and pop-min, O(1) peek. A heap is not sorted, so it cannot do range queries or fast arbitrary search; use a balanced tree when you need those."
            },
            {
              "signal": "Work items are processed in arrival order and the code uses `list.pop(0)` or `array.shift()`",
              "use": "FIFO queue (deque or ring buffer)",
              "why": "`pop(0)` shifts every remaining element, so draining n items is O(n^2). A deque or ring buffer gives O(1) at both ends; bound its size if producers can outrun consumers."
            },
            {
              "signal": "The requirement says undo, nested scopes, matching brackets or return to the previous state",
              "use": "Stack",
              "why": "Last-in-first-out matches nesting: push on open or action, pop on close or undo, both O(1). For redo, keep a second stack and clear it on each new action."
            },
            {
              "signal": "Autocomplete, longest-prefix match or 'all words starting with ...' over a large vocabulary",
              "use": "Trie (prefix tree)",
              "why": "Lookup costs O(length of key) regardless of vocabulary size, and all completions sit under one node. Uses much more memory than a hash set; a sorted array with binary search on prefixes is a compact alternative."
            },
            {
              "signal": "Items are merged into groups over time and you ask 'are A and B connected?' (islands, clusters, Kruskal)",
              "use": "Union-find (disjoint set)",
              "why": "With path compression and union by rank, union and find are effectively O(1) amortized. It cannot split groups or list a path; use graph search for those."
            },
            {
              "signal": "Entities link to a handful of others (dependencies, roads, friends) and there are tens of thousands of them",
              "use": "Adjacency list",
              "why": "O(V + E) memory and fast neighbour iteration for sparse graphs. Use an adjacency matrix only when the graph is small or dense and you need O(1) 'is there an edge' checks."
            },
            {
              "signal": "A cache must hold at most N entries and evict the least recently used one in O(1)",
              "use": "Hash map + doubly linked list (LRU)",
              "why": "The map finds a node in O(1); the list keeps recency order so moving to front and evicting the tail are O(1). Many languages ship this as an ordered dictionary."
            },
            {
              "signal": "A huge grid or matrix is mostly empty and the dense array eats memory (chunk maps, sparse tiles)",
              "use": "Sparse map keyed by coordinate",
              "why": "Store only occupied cells in a hash map keyed by `(x, y)`: memory scales with content, not area. Iteration is unordered and each access hashes, so switch back to dense arrays when most cells are filled."
            },
            {
              "signal": "You track membership for small dense integer IDs and intersect or union large sets often (layers, visited flags)",
              "use": "Bitset",
              "why": "One bit per possible ID; intersection and union run 64 IDs per machine word. Memory scales with the largest ID, not the count, so it is wasteful when IDs are sparse."
            },
            {
              "signal": "A linked structure may loop back on itself and you must detect the cycle without extra memory",
              "use": "Fast/slow pointers (Floyd)",
              "why": "Advance one pointer by 1 and another by 2; they meet if and only if there is a cycle. O(n) time and O(1) memory; a visited hash set is simpler but costs O(n) memory."
            }
          ]
        }
      ],
      "keyPoints": [
        "A data structure is defined by its operations and their costs; pick by access pattern.",
        "Arrays are the default; hash maps give expected O(1) lookup but no ordering guarantees across languages.",
        "Balanced trees give ordered O(log n) operations and range queries; heaps give fast min/max extraction.",
        "Stacks, queues and graphs model processing order and relationships, and underpin many algorithms."
      ],
      "quiz": [
        {
          "q": "A feature must repeatedly extract the highest-priority job from a changing collection of 100,000 jobs. Which structure fits best?",
          "options": [
            "A heap used as a priority queue",
            "A linked list kept in arrival order",
            "A hash map keyed by job id",
            "A stack of jobs in arrival order"
          ],
          "answer": 0,
          "explain": "A heap gives O(log n) insert and extract-top. A hash map has no priority ordering, and a list or stack would force an O(n) scan for the best job."
        },
        {
          "q": "A report needs all orders with timestamps between two given dates, from millions of orders. Which structure supports this efficiently?",
          "options": [
            "A hash map keyed by timestamp, probing every possible key in range",
            "A B-tree or sorted array, locating the range by binary search",
            "A FIFO queue of orders, dequeuing until the end date",
            "A hash set of order IDs combined with a full scan"
          ],
          "answer": 1,
          "explain": "Range queries require keys to be ordered. Hash maps scatter keys, so a range query would scan everything or probe every possible timestamp. This is why database indexes are B-trees."
        },
        {
          "q": "You use a Python `list` as a queue with `items.pop(0)` for 500,000 tasks and it becomes very slow. Why, and what is the fix?",
          "options": [
            "pop(0) is O(1), but the garbage collector stalls; call gc.collect()",
            "Lists cap at 100,000 items and then spill to disk; use a tuple",
            "pop(0) shifts all remaining items, so it is O(n); use a deque",
            "pop(0) re-sorts the list each time; use a set instead"
          ],
          "answer": 2,
          "explain": "Removing from the front of a dynamic array moves all later elements, so draining it is O(n^2) overall. `collections.deque` supports O(1) removal at both ends."
        },
        {
          "q": "You store a mutable object as a hash map key, then change one of its fields. Later, a lookup with an equal-looking key fails. What is the best explanation?",
          "options": [
            "Hash maps support only string keys, so the object was coerced",
            "The map hit its load factor and evicted the oldest entry",
            "Hash maps randomize slot positions on every lookup call",
            "The key's hash changed, so lookups probe a different slot"
          ],
          "answer": 3,
          "explain": "The entry was placed using the old hash. After mutation the new hash points elsewhere. Use immutable keys, or never modify a key while it is in the map."
        },
        {
          "q": "You model package dependencies where each package lists the packages it needs. There are tens of thousands of packages, and most depend on only a handful of others. Which representation fits best?",
          "options": [
            "An adjacency matrix with a row and column for every package",
            "An adjacency list mapping each package to its dependencies",
            "A sorted array of package names, searched with binary search",
            "A stack of package names in installation order"
          ],
          "answer": 1,
          "explain": "A sparse graph needs O(V + E) space with an adjacency list. A matrix needs O(V^2), which is mostly empty here, and arrays or stacks do not capture relationships."
        },
        {
          "q": "A network tool receives cable links one at a time. After each new link, a dashboard must instantly say whether two given servers are in the same cluster. Links are never removed. What should you reach for?",
          "options": [
            "A breadth-first search from one server on every query",
            "A disjoint set with path compression and union by rank",
            "An adjacency matrix over all the servers in the network",
            "A sorted array of server IDs searched with binary search"
          ],
          "answer": 1,
          "explain": "Union and find are effectively O(1) amortized when groups only merge. BFS per query costs O(V + E) each time, and a matrix uses quadratic memory without answering connectivity quickly."
        }
      ]
    },
    {
      "id": "core-algorithms",
      "title": "Core Algorithms",
      "minutes": 12,
      "summary": "Searching, sorting, recursion, graph traversal, dynamic programming and greedy strategies as reusable problem-solving patterns.",
      "lesson": [
        {
          "type": "p",
          "text": "An algorithm is a precise procedure for solving a class of problems. You rarely need to implement sorting yourself, but you constantly need to recognize which pattern a problem fits: Is this a search? Does it have overlapping subproblems? Is there a graph hiding in it? Recognizing the pattern is the skill that lets you direct an agent and judge its answer."
        },
        {
          "type": "h",
          "text": "Searching"
        },
        {
          "type": "p",
          "text": "**Linear search** checks items one by one: O(n), works on anything. **Binary search** repeatedly halves a **sorted** range: O(log n). The sorted precondition is the catch: if the data is not sorted, binary search silently returns nonsense. Binary search generalizes to any monotonic condition ('find the smallest value where this check passes'), which makes it useful for tuning and bisecting a bad commit."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "def lower_bound(a, target):\n    # first index i where a[i] >= target; a must be sorted\n    lo, hi = 0, len(a)\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if a[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo"
        },
        {
          "type": "figure",
          "id": "foundations-binary-search",
          "caption": "lower_bound halves the lo..hi range on every comparison, so 16 sorted items need only 4 steps to find 37 at index 8.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Binary search with lower_bound for target 37 in a sorted array of 16 numbers. The lo to hi range halves each step: 0 to 16, 0 to 8, 5 to 8, 7 to 8, until lo equals hi at index 8 after 4 comparisons.\"> <style> .foundations-binary-search-m{font-size:13px;fill:var(--fig-muted)} .foundations-binary-search-mc{font-size:13px;fill:var(--fig-muted);text-anchor:middle} .foundations-binary-search-t{font-size:14px;fill:var(--fig-ink)} .foundations-binary-search-tc{font-size:14px;fill:var(--fig-ink);text-anchor:middle} .foundations-binary-search-act{font-size:14px;font-weight:600;fill:var(--fig-accent)} .foundations-binary-search-lab{font-size:13px;font-weight:600;fill:var(--fig-accent);text-anchor:middle} .foundations-binary-search-midt{font-size:13px;font-weight:600;fill:var(--fig-accent2);text-anchor:middle} .foundations-binary-search-okt{font-size:14px;font-weight:600;fill:var(--fig-ok);text-anchor:middle} .foundations-binary-search-okt.foundations-binary-search-left{text-anchor:start} .foundations-binary-search-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .foundations-binary-search-ghost{fill:none;stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 3} .foundations-binary-search-bar{fill:var(--fig-accent)} .foundations-binary-search-mid{fill:none;stroke:var(--fig-accent2);stroke-width:2} .foundations-binary-search-found{fill:var(--fig-ok);fill-opacity:.2;stroke:var(--fig-ok);stroke-width:2} .foundations-binary-search-row{fill:var(--fig-accent);fill-opacity:.1} .foundations-binary-search-ph{animation:foundations-binary-search-show 7.5s linear infinite} .foundations-binary-search-p1,.foundations-binary-search-p2,.foundations-binary-search-p3,.foundations-binary-search-p4{opacity:0} .foundations-binary-search-p1{animation-delay:1.5s}.foundations-binary-search-p2{animation-delay:3s}.foundations-binary-search-p3{animation-delay:4.5s}.foundations-binary-search-p4{animation-delay:6s} @keyframes foundations-binary-search-show{0%,19.9%{opacity:1}20%,100%{opacity:0}} </style> <rect class=\"foundations-binary-search-box\" x=\"14\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"30\" y=\"81\">2</text><text class=\"foundations-binary-search-mc\" x=\"30\" y=\"114\">0</text> <rect class=\"foundations-binary-search-box\" x=\"50\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"66\" y=\"81\">5</text><text class=\"foundations-binary-search-mc\" x=\"66\" y=\"114\">1</text> <rect class=\"foundations-binary-search-box\" x=\"86\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"102\" y=\"81\">8</text><text class=\"foundations-binary-search-mc\" x=\"102\" y=\"114\">2</text> <rect class=\"foundations-binary-search-box\" x=\"122\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"138\" y=\"81\">12</text><text class=\"foundations-binary-search-mc\" x=\"138\" y=\"114\">3</text> <rect class=\"foundations-binary-search-box\" x=\"158\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"174\" y=\"81\">16</text><text class=\"foundations-binary-search-mc\" x=\"174\" y=\"114\">4</text> <rect class=\"foundations-binary-search-box\" x=\"194\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"210\" y=\"81\">23</text><text class=\"foundations-binary-search-mc\" x=\"210\" y=\"114\">5</text> <rect class=\"foundations-binary-search-box\" x=\"230\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"246\" y=\"81\">27</text><text class=\"foundations-binary-search-mc\" x=\"246\" y=\"114\">6</text> <rect class=\"foundations-binary-search-box\" x=\"266\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"282\" y=\"81\">31</text><text class=\"foundations-binary-search-mc\" x=\"282\" y=\"114\">7</text> <rect class=\"foundations-binary-search-box\" x=\"302\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"318\" y=\"81\">37</text><text class=\"foundations-binary-search-mc\" x=\"318\" y=\"114\">8</text> <rect class=\"foundations-binary-search-box\" x=\"338\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"354\" y=\"81\">42</text><text class=\"foundations-binary-search-mc\" x=\"354\" y=\"114\">9</text> <rect class=\"foundations-binary-search-box\" x=\"374\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"390\" y=\"81\">48</text><text class=\"foundations-binary-search-mc\" x=\"390\" y=\"114\">10</text> <rect class=\"foundations-binary-search-box\" x=\"410\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"426\" y=\"81\">55</text><text class=\"foundations-binary-search-mc\" x=\"426\" y=\"114\">11</text> <rect class=\"foundations-binary-search-box\" x=\"446\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"462\" y=\"81\">61</text><text class=\"foundations-binary-search-mc\" x=\"462\" y=\"114\">12</text> <rect class=\"foundations-binary-search-box\" x=\"482\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"498\" y=\"81\">67</text><text class=\"foundations-binary-search-mc\" x=\"498\" y=\"114\">13</text> <rect class=\"foundations-binary-search-box\" x=\"518\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"534\" y=\"81\">74</text><text class=\"foundations-binary-search-mc\" x=\"534\" y=\"114\">14</text> <rect class=\"foundations-binary-search-box\" x=\"554\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-tc\" x=\"570\" y=\"81\">80</text><text class=\"foundations-binary-search-mc\" x=\"570\" y=\"114\">15</text> <rect class=\"foundations-binary-search-ghost\" x=\"590\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-mc\" x=\"606\" y=\"114\">16</text> <g class=\"foundations-binary-search-ph foundations-binary-search-p0\"><rect class=\"foundations-binary-search-row\" x=\"16\" y=\"180\" width=\"608\" height=\"23\" rx=\"7\"/><rect class=\"foundations-binary-search-bar\" x=\"14\" y=\"42\" width=\"572\" height=\"6\" rx=\"3\"/><text class=\"foundations-binary-search-lab\" x=\"30\" y=\"34\">lo</text><text class=\"foundations-binary-search-lab\" x=\"606\" y=\"34\">hi</text><rect class=\"foundations-binary-search-mid\" x=\"299\" y=\"53\" width=\"38\" height=\"46\" rx=\"10\"/><text class=\"foundations-binary-search-midt\" x=\"318\" y=\"136\">mid</text></g> <g class=\"foundations-binary-search-ph foundations-binary-search-p1\"><rect class=\"foundations-binary-search-row\" x=\"16\" y=\"202\" width=\"608\" height=\"23\" rx=\"7\"/><rect class=\"foundations-binary-search-bar\" x=\"14\" y=\"42\" width=\"284\" height=\"6\" rx=\"3\"/><text class=\"foundations-binary-search-lab\" x=\"30\" y=\"34\">lo</text><text class=\"foundations-binary-search-lab\" x=\"318\" y=\"34\">hi</text><rect class=\"foundations-binary-search-mid\" x=\"155\" y=\"53\" width=\"38\" height=\"46\" rx=\"10\"/><text class=\"foundations-binary-search-midt\" x=\"174\" y=\"136\">mid</text></g> <g class=\"foundations-binary-search-ph foundations-binary-search-p2\"><rect class=\"foundations-binary-search-row\" x=\"16\" y=\"224\" width=\"608\" height=\"23\" rx=\"7\"/><rect class=\"foundations-binary-search-bar\" x=\"194\" y=\"42\" width=\"104\" height=\"6\" rx=\"3\"/><text class=\"foundations-binary-search-lab\" x=\"210\" y=\"34\">lo</text><text class=\"foundations-binary-search-lab\" x=\"318\" y=\"34\">hi</text><rect class=\"foundations-binary-search-mid\" x=\"227\" y=\"53\" width=\"38\" height=\"46\" rx=\"10\"/><text class=\"foundations-binary-search-midt\" x=\"246\" y=\"136\">mid</text></g> <g class=\"foundations-binary-search-ph foundations-binary-search-p3\"><rect class=\"foundations-binary-search-row\" x=\"16\" y=\"246\" width=\"608\" height=\"23\" rx=\"7\"/><rect class=\"foundations-binary-search-bar\" x=\"266\" y=\"42\" width=\"32\" height=\"6\" rx=\"3\"/><text class=\"foundations-binary-search-lab\" x=\"282\" y=\"34\">lo</text><text class=\"foundations-binary-search-lab\" x=\"318\" y=\"34\">hi</text><rect class=\"foundations-binary-search-mid\" x=\"263\" y=\"53\" width=\"38\" height=\"46\" rx=\"10\"/><text class=\"foundations-binary-search-midt\" x=\"282\" y=\"136\">mid</text></g> <g class=\"foundations-binary-search-ph foundations-binary-search-p4\"><rect class=\"foundations-binary-search-row\" x=\"16\" y=\"268\" width=\"608\" height=\"23\" rx=\"7\"/><rect class=\"foundations-binary-search-found\" x=\"302\" y=\"56\" width=\"32\" height=\"40\" rx=\"8\"/><text class=\"foundations-binary-search-okt\" x=\"318\" y=\"34\">lo = hi</text><text class=\"foundations-binary-search-okt\" x=\"318\" y=\"136\">return 8</text></g> <text class=\"foundations-binary-search-m\" x=\"30\" y=\"168\">target 37 · 16 items · 4 comparisons (log₂ 16 = 4)</text> <text class=\"foundations-binary-search-m\" x=\"30\" y=\"196\">1</text><text class=\"foundations-binary-search-t\" x=\"64\" y=\"196\">lo 0</text><text class=\"foundations-binary-search-t\" x=\"124\" y=\"196\">hi 16</text><text class=\"foundations-binary-search-t\" x=\"184\" y=\"196\">mid 8</text><text class=\"foundations-binary-search-t\" x=\"256\" y=\"196\">a[8] = 37 ≥ 37</text><text class=\"foundations-binary-search-act\" x=\"440\" y=\"196\">hi = 8</text> <text class=\"foundations-binary-search-m\" x=\"30\" y=\"218\">2</text><text class=\"foundations-binary-search-t\" x=\"64\" y=\"218\">lo 0</text><text class=\"foundations-binary-search-t\" x=\"124\" y=\"218\">hi 8</text><text class=\"foundations-binary-search-t\" x=\"184\" y=\"218\">mid 4</text><text class=\"foundations-binary-search-t\" x=\"256\" y=\"218\">a[4] = 16 < 37</text><text class=\"foundations-binary-search-act\" x=\"440\" y=\"218\">lo = 5</text> <text class=\"foundations-binary-search-m\" x=\"30\" y=\"240\">3</text><text class=\"foundations-binary-search-t\" x=\"64\" y=\"240\">lo 5</text><text class=\"foundations-binary-search-t\" x=\"124\" y=\"240\">hi 8</text><text class=\"foundations-binary-search-t\" x=\"184\" y=\"240\">mid 6</text><text class=\"foundations-binary-search-t\" x=\"256\" y=\"240\">a[6] = 27 < 37</text><text class=\"foundations-binary-search-act\" x=\"440\" y=\"240\">lo = 7</text> <text class=\"foundations-binary-search-m\" x=\"30\" y=\"262\">4</text><text class=\"foundations-binary-search-t\" x=\"64\" y=\"262\">lo 7</text><text class=\"foundations-binary-search-t\" x=\"124\" y=\"262\">hi 8</text><text class=\"foundations-binary-search-t\" x=\"184\" y=\"262\">mid 7</text><text class=\"foundations-binary-search-t\" x=\"256\" y=\"262\">a[7] = 31 < 37</text><text class=\"foundations-binary-search-act\" x=\"440\" y=\"262\">lo = 8</text> <text class=\"foundations-binary-search-m\" x=\"30\" y=\"284\">5</text><text class=\"foundations-binary-search-okt foundations-binary-search-left\" x=\"64\" y=\"284\">lo = hi = 8, return 8</text> </svg>"
        },
        {
          "type": "h",
          "text": "Sorting"
        },
        {
          "type": "p",
          "text": "Comparison sorts cannot beat O(n log n) in the worst case. Merge sort achieves it with stable, predictable behavior and O(n) extra space; quicksort is fast in practice, O(n log n) expected, O(n^2) worst case. Production libraries use hybrids (Timsort in Python and Java object sorts, introsort in C++). **Stable** means equal elements keep their original relative order, which matters when sorting by one field after another. Practical advice: use the library sort, pass a key function, and sort once instead of repeatedly."
        },
        {
          "type": "h",
          "text": "Recursion"
        },
        {
          "type": "p",
          "text": "Recursion solves a problem by solving smaller instances of itself. Every recursive function needs a **base case** that stops and a step that moves toward it. Each call consumes stack space, so recursion depth is limited (Python's default is about 1000 frames); an unbounded or very deep recursion raises a stack overflow. Many recursive solutions can be rewritten with an explicit stack."
        },
        {
          "type": "h",
          "text": "Graph traversal: BFS and DFS"
        },
        {
          "type": "p",
          "text": "**Breadth-first search** uses a queue and explores level by level, so in an unweighted graph it finds the shortest path by number of edges. **Depth-first search** uses a stack (or recursion) and dives deep before backtracking; it suits cycle detection, topological ordering and exhaustive exploration. Both are O(V + E). Always track visited nodes, or cycles cause infinite loops."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "from collections import deque\n\ndef shortest_hops(graph, start, goal):\n    q = deque([(start, 0)])\n    seen = {start}\n    while q:\n        node, d = q.popleft()\n        if node == goal:\n            return d\n        for nxt in graph.get(node, []):\n            if nxt not in seen:\n                seen.add(nxt)\n                q.append((nxt, d + 1))\n    return -1"
        },
        {
          "type": "h",
          "text": "Dynamic programming"
        },
        {
          "type": "p",
          "text": "Dynamic programming (DP) applies when a problem has **overlapping subproblems** and **optimal substructure**: the best answer is built from best answers to smaller pieces, and the same smaller pieces recur. Naive recursive Fibonacci recomputes `fib(30)` exponentially often. Caching each result (**memoization**) or filling a table bottom-up makes it linear. Examples: minimum coins for an amount, longest common subsequence (the idea behind diff), edit distance, knapsack. The method: define the state, write the recurrence, identify the base cases, and choose an evaluation order."
        },
        {
          "type": "h",
          "text": "Greedy algorithms"
        },
        {
          "type": "p",
          "text": "A **greedy** algorithm makes the locally best choice at each step and never reconsiders. It is simple and fast, but only correct when the problem has the greedy-choice property. Interval scheduling (always pick the job that finishes earliest) and Dijkstra's shortest path with non-negative weights are provably greedy-correct. Making change with coins {1, 3, 4} for 6 by always taking the largest coin gives 4+1+1 (three coins), while 3+3 uses two: greedy fails there, and DP is needed."
        },
        {
          "type": "h",
          "text": "Misconceptions"
        },
        {
          "type": "list",
          "items": [
            "\"Recursion is slower, so avoid it.\" The real risk is depth limits and recomputation, not recursion itself.",
            "\"Greedy usually works.\" It works only when proven; test it against brute force on small inputs.",
            "\"DP is a trick.\" It is memoized recursion with a clear state definition."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents often produce a confident greedy solution to a problem that needs DP, or a recursive traversal with no visited set that loops forever on cyclic input. Ask for a brute-force reference implementation and a randomized test comparing it with the optimized version on small inputs. Check the stated preconditions (sorted? acyclic? non-negative weights?) against what your real data guarantees."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "The data is sorted (or monotonic) and you search for a value, the first item >= x, or an insertion point",
              "use": "Binary search (lower_bound)",
              "why": "O(log n) instead of O(n). Only correct if the data really is sorted by the same key; sorting first costs O(n log n), which pays off only for repeated queries."
            },
            {
              "signal": "Sorted array, and the question asks for a pair or triple with a target sum, or to merge or dedupe in place",
              "use": "Two pointers",
              "why": "Move a left and a right index inward based on the comparison: O(n) time, O(1) memory. Relies on sorted order; on unsorted input use a hash set of complements."
            },
            {
              "signal": "Longest or shortest contiguous subarray or substring that satisfies a constraint (at most k distinct, sum >= s)",
              "use": "Sliding window",
              "why": "Grow the right edge, shrink the left while the window is invalid: O(n) instead of O(n^2). Needs the constraint to be monotonic in window size; negative numbers can break sum windows."
            },
            {
              "signal": "Many queries ask for the sum of `a[i..j]` on an array that rarely changes",
              "use": "Prefix sums",
              "why": "Precompute `P[k] = a[0] + ... + a[k-1]` once in O(n); each query is `P[j+1] - P[i]` in O(1). Updates cost O(n), so use a Fenwick or segment tree when values change often."
            },
            {
              "signal": "For each element, find the next greater or smaller element, or how far a span extends (stock span, histogram)",
              "use": "Monotonic stack",
              "why": "Keep a stack of indices with increasing or decreasing values; each index is pushed and popped once, so O(n) total instead of O(n^2) nested scans."
            },
            {
              "signal": "Fewest hops or moves between two states where every edge costs the same (social graph, grid maze)",
              "use": "Breadth-first search",
              "why": "Exploring level by level from a queue finds a fewest-edge path in O(V + E). Mark nodes visited when enqueued; with unequal edge weights BFS is no longer correct."
            },
            {
              "signal": "Shortest path where edges have different non-negative costs (travel times, movement costs)",
              "use": "Dijkstra's algorithm",
              "why": "A min-heap of tentative distances gives O((V + E) log V). Fails with negative weights (use Bellman-Ford); add an admissible heuristic to get A* for single-target queries."
            },
            {
              "signal": "Tasks, packages or build steps must run after the things they depend on",
              "use": "Topological sort",
              "why": "Kahn's algorithm repeatedly takes nodes with no remaining prerequisites, O(V + E). If nodes are left over, the graph has a cycle, which is also how you report circular dependencies."
            },
            {
              "signal": "The requirement says all combinations, permutations or placements that satisfy constraints (sudoku, seating)",
              "use": "Backtracking with pruning",
              "why": "Build a candidate step by step and undo on a dead end. Worst case stays exponential, so prune early on violated constraints and switch to DP if subproblems repeat."
            },
            {
              "signal": "A recursive solution recomputes the same arguments many times and slows explosively as input grows",
              "use": "Dynamic programming",
              "why": "Define the state, recurrence and base cases, then memoize or fill a table, so each subproblem is solved once. Needs optimal substructure; table memory can dominate for large state spaces."
            },
            {
              "signal": "Taking the best-looking option at each step seems to work (earliest finish time, largest coin)",
              "use": "Greedy with a proof",
              "why": "Greedy is fast and simple but only correct with the greedy-choice property, as in interval scheduling by earliest finish. Coins {1, 3, 4} for 6 show it failing; check against brute force on small inputs."
            },
            {
              "signal": "The question asks to minimise the maximum (or maximise the minimum): smallest capacity, fewest days, largest gap",
              "use": "Binary search on the answer",
              "why": "If 'can we do it with limit X?' is monotonic in X, binary search X and run a cheap feasibility check each time: O(log range · check). Fails if feasibility is not monotonic."
            }
          ]
        }
      ],
      "keyPoints": [
        "Binary search needs sorted (monotonic) data; it turns O(n) into O(log n).",
        "BFS finds fewest-edge paths in unweighted graphs; DFS suits cycle detection and exhaustive exploration; both need a visited set.",
        "DP is for overlapping subproblems with optimal substructure: define state, recurrence and base cases, then cache.",
        "Greedy is fast but only correct with a proof; verify against brute force on small inputs."
      ],
      "quiz": [
        {
          "q": "You need the minimum number of coins to make 6 using coin values {1, 3, 4}. Why does 'always take the largest coin that fits' fail?",
          "options": [
            "Greedy cannot be applied to coin problems in any coin system",
            "The coins must be sorted ascending before taking the largest",
            "Greedy picks 4, then needs 1+1 (3 coins); 3+3 needs only 2",
            "Coin change has no polynomial-time solution even for small targets"
          ],
          "answer": 2,
          "explain": "The locally best first choice (4) does not lead to the global optimum here. Greedy does work for some coin systems, such as standard currency, but not arbitrary ones; DP over amounts finds the minimum in O(amount * coins)."
        },
        {
          "q": "A function returns wrong results on some inputs: it runs `lower_bound` over a list of timestamps that arrive in random order. What is the root problem?",
          "options": [
            "Binary search assumes sorted input; otherwise its halving is invalid",
            "Binary search only works on integer keys, not on timestamps",
            "The loop must be recursive for binary search to be correct",
            "lower_bound overflows once the list exceeds 2^31 elements"
          ],
          "answer": 0,
          "explain": "Binary search discards half the range based on one comparison, which is only valid when order guarantees the target cannot be in the discarded half. Sort first or use a different approach."
        },
        {
          "q": "You must find the fewest number of hops between two users in a social graph where every connection counts as 1. Which approach is correct and efficient?",
          "options": [
            "Depth-first search, returning the first path found",
            "Breadth-first search with a queue and a visited set",
            "Sort users by id and binary search for the target",
            "Enumerate every ordering of users and keep the shortest"
          ],
          "answer": 1,
          "explain": "BFS explores in increasing distance, so the first time it reaches the target it has used the minimum number of edges. DFS's first path can be arbitrarily long, and enumeration is factorial."
        },
        {
          "q": "A recursive `count_paths(r, c)` on a grid takes minutes for a 25x25 grid because it recomputes the same cells repeatedly. What is the right fix?",
          "options": [
            "Increase the recursion limit",
            "Rewrite it with a while loop and no state",
            "Memoize results per (r, c), since the subproblems overlap",
            "Replace recursion with a greedy choice of the first available direction"
          ],
          "answer": 2,
          "explain": "Overlapping subproblems are the signature of dynamic programming. Caching each (r, c) result reduces exponential work to O(rows * cols). A higher limit would not reduce the repeated work, and greedy would count only one path."
        },
        {
          "q": "You sort a list of employees by department, then sort the result by name using an unstable sort, and employees with equal names lose their department order. What property would have preserved it?",
          "options": [
            "Quicksort, as the fastest general-purpose comparison sort",
            "Sorting in descending order so ties reverse consistently",
            "Sorting by a hash of the name so equal keys stay together",
            "A stable sort, which keeps tied elements in their prior order"
          ],
          "answer": 3,
          "explain": "Stability is exactly the guarantee that ties keep their earlier order, enabling multi-key sorts by successive passes. Typical quicksort implementations are not stable."
        },
        {
          "q": "Find the smallest daily weight capacity that ships all packages, in order, within 5 days. Capacities go up to 10^9, and checking one capacity is a simple linear pass. Which approach fits best?",
          "options": [
            "Greedily load the heaviest packages onto the earliest days first",
            "Fill a DP table over every possible split of all the packages",
            "Binary search the capacity, with the linear pass as the test",
            "Try every capacity from 1 upward and stop at the first that works"
          ],
          "answer": 2,
          "explain": "Feasibility is monotonic in capacity, so binary search needs about 30 checks. Loading heaviest first breaks the shipping order, and a DP table or linear try-all is far too slow for this range."
        }
      ]
    },
    {
      "id": "memory-and-execution",
      "title": "Memory and Program Execution",
      "minutes": 11,
      "summary": "Where values live, how references behave, how memory is reclaimed, and how code is actually run.",
      "lesson": [
        {
          "type": "p",
          "text": "You pass a list into a function, the function 'adds a default item', and suddenly the caller's list has changed. Another service slowly eats memory over days until it is killed. A third runs 50 times slower the first time it is called after deploy. These are not three mysteries; they are consequences of how programs use memory and how code gets executed."
        },
        {
          "type": "h",
          "text": "Stack and heap"
        },
        {
          "type": "p",
          "text": "The **call stack** holds one frame per active function call: its local variables, arguments and return address. Allocation is just moving a pointer, frames vanish automatically when the function returns, and the stack is small (typically megabytes), which is why very deep recursion overflows it. The **heap** is a large pool for data whose lifetime or size is not known up front or that must outlive the call: objects, strings, growing arrays. Heap allocation is slower and something must decide when memory is freed. Many languages hide the split: in Python and Java, objects live on the heap and variables hold references to them."
        },
        {
          "type": "h",
          "text": "Values versus references"
        },
        {
          "type": "p",
          "text": "A **value** semantics variable holds the data itself; copying it duplicates the data. A **reference** holds the location of data; copying it creates a second name for the same object (an alias). Most languages mix both: numbers are copied, objects are shared."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "def add_default(items=[]):      # BUG: the default list is created once, shared forever\n    items.append('default')\n    return items\n\nprint(add_default())   # ['default']\nprint(add_default())   # ['default', 'default']\n\na = [1, 2, 3]\nb = a                  # alias, not a copy\nb.append(4)\nprint(a)               # [1, 2, 3, 4]\nc = a.copy()           # shallow copy: new outer list, same inner objects\n\nimport copy\nnested = [[1], [2]]\nshallow = nested.copy()\nshallow[0].append(99)\nprint(nested)          # [[1, 99], [2]]; inner list was shared\ndeep = copy.deepcopy(nested)"
        },
        {
          "type": "figure",
          "id": "foundations-shared-reference",
          "caption": "b = a copies the reference, not the list: b.append(4) changes the one object both names point to, while a.copy() makes a separate list.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Stack variables a and b both hold references to the same list object on the heap, so b.append(4) is visible through a. c = a.copy() points to a separate list.\"> <style> .foundations-shared-reference-m{font-size:13px;fill:var(--fig-muted)} .foundations-shared-reference-tc{font-size:15px;fill:var(--fig-ink);text-anchor:middle} .foundations-shared-reference-code{font-size:14px;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .foundations-shared-reference-var{font-size:15px;font-weight:600;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .foundations-shared-reference-panel{fill:var(--fig-panel);fill-opacity:.5;stroke:var(--fig-line);stroke-width:1.5} .foundations-shared-reference-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .foundations-shared-reference-list{fill:var(--fig-panel);stroke:var(--fig-ink);stroke-opacity:.5;stroke-width:1.5} .foundations-shared-reference-copy{fill:var(--fig-panel);stroke:var(--fig-accent2);stroke-width:1.5} .foundations-shared-reference-div{stroke:var(--fig-line);stroke-width:1.5} .foundations-shared-reference-ref{fill:var(--fig-ink)} .foundations-shared-reference-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .foundations-shared-reference-ah{fill:var(--fig-muted)} .foundations-shared-reference-aha{fill:var(--fig-accent)} .foundations-shared-reference-hl{stroke:var(--fig-accent);stroke-width:2.5;fill:none;opacity:0} .foundations-shared-reference-hb{animation:foundations-shared-reference-hb 6s linear infinite} .foundations-shared-reference-ha{animation:foundations-shared-reference-ha 6s linear infinite} .foundations-shared-reference-codehl{fill:var(--fig-accent);fill-opacity:.14;opacity:0;animation:foundations-shared-reference-hb 6s linear infinite} .foundations-shared-reference-new{transform-box:fill-box;transform-origin:center;animation:foundations-shared-reference-pop 6s ease-out infinite} .foundations-shared-reference-tint{fill:var(--fig-accent);fill-opacity:.16;opacity:0;animation:foundations-shared-reference-tint 6s linear infinite} @keyframes foundations-shared-reference-pop{0%,34%{opacity:1;transform:scale(1)}40%,46%{opacity:0;transform:scale(.5)}54%{opacity:1;transform:scale(1.15)}60%,100%{opacity:1;transform:scale(1)}} @keyframes foundations-shared-reference-tint{0%,46%{opacity:0}54%,80%{opacity:1}92%,100%{opacity:0}} @keyframes foundations-shared-reference-hb{0%,40%{opacity:0}46%,62%{opacity:1}70%,100%{opacity:0}} @keyframes foundations-shared-reference-ha{0%,60%{opacity:0}66%,82%{opacity:1}90%,100%{opacity:0}} </style> <defs> <marker id=\"foundations-shared-reference-arrow\" viewBox=\"0 0 8 8\" refX=\"7.5\" refY=\"4\" markerWidth=\"8\" markerHeight=\"8\" markerUnits=\"userSpaceOnUse\" orient=\"auto\"><path class=\"foundations-shared-reference-ah\" d=\"M0,0.5 L7.5,4 L0,7.5 z\"/></marker> <marker id=\"foundations-shared-reference-arrowa\" viewBox=\"0 0 8 8\" refX=\"7.5\" refY=\"4\" markerWidth=\"8\" markerHeight=\"8\" markerUnits=\"userSpaceOnUse\" orient=\"auto\"><path class=\"foundations-shared-reference-aha\" d=\"M0,0.5 L7.5,4 L0,7.5 z\"/></marker> </defs> <rect class=\"foundations-shared-reference-codehl\" x=\"242\" y=\"13\" width=\"105\" height=\"24\" rx=\"6\"/> <text class=\"foundations-shared-reference-code\" x=\"24\" y=\"30\">a = [1, 2, 3]</text> <text class=\"foundations-shared-reference-code\" x=\"168\" y=\"30\">b = a</text> <text class=\"foundations-shared-reference-code\" x=\"248\" y=\"30\">b.append(4)</text> <text class=\"foundations-shared-reference-code\" x=\"378\" y=\"30\">c = a.copy()</text> <rect class=\"foundations-shared-reference-panel\" x=\"24\" y=\"52\" width=\"192\" height=\"232\" rx=\"12\"/> <rect class=\"foundations-shared-reference-panel\" x=\"244\" y=\"52\" width=\"372\" height=\"232\" rx=\"12\"/> <text class=\"foundations-shared-reference-m\" x=\"44\" y=\"78\">Stack frame</text> <text class=\"foundations-shared-reference-m\" x=\"264\" y=\"78\">Heap</text> <rect class=\"foundations-shared-reference-box\" x=\"44\" y=\"104\" width=\"152\" height=\"36\" rx=\"9\"/> <rect class=\"foundations-shared-reference-box\" x=\"44\" y=\"160\" width=\"152\" height=\"36\" rx=\"9\"/> <rect class=\"foundations-shared-reference-box\" x=\"44\" y=\"216\" width=\"152\" height=\"36\" rx=\"9\"/> <text class=\"foundations-shared-reference-var\" x=\"62\" y=\"127\">a</text> <text class=\"foundations-shared-reference-var\" x=\"62\" y=\"183\">b</text> <text class=\"foundations-shared-reference-var\" x=\"62\" y=\"239\">c</text> <text class=\"foundations-shared-reference-m\" x=\"88\" y=\"127\">ref</text> <text class=\"foundations-shared-reference-m\" x=\"88\" y=\"183\">ref</text> <text class=\"foundations-shared-reference-m\" x=\"88\" y=\"239\">ref</text> <path class=\"foundations-shared-reference-ln\" marker-end=\"url(#foundations-shared-reference-arrow)\" d=\"M176,122 L318,140\"/><path class=\"foundations-shared-reference-ln\" marker-end=\"url(#foundations-shared-reference-arrow)\" d=\"M176,178 L318,156\"/><path class=\"foundations-shared-reference-ln\" marker-end=\"url(#foundations-shared-reference-arrow)\" d=\"M176,234 H318\"/> <path class=\"foundations-shared-reference-hl foundations-shared-reference-hb\" marker-end=\"url(#foundations-shared-reference-arrowa)\" d=\"M176,178 L318,156\"/> <path class=\"foundations-shared-reference-hl foundations-shared-reference-ha\" marker-end=\"url(#foundations-shared-reference-arrowa)\" d=\"M176,122 L318,140\"/> <circle class=\"foundations-shared-reference-ref\" cx=\"176\" cy=\"122\" r=\"5\"/> <circle class=\"foundations-shared-reference-ref\" cx=\"176\" cy=\"178\" r=\"5\"/> <circle class=\"foundations-shared-reference-ref\" cx=\"176\" cy=\"234\" r=\"5\"/> <text class=\"foundations-shared-reference-m\" x=\"320\" y=\"118\">one list, two names: a and b</text> <rect class=\"foundations-shared-reference-list\" x=\"320\" y=\"128\" width=\"208\" height=\"40\" rx=\"10\"/> <path class=\"foundations-shared-reference-div\" d=\"M372,128 V168 M424,128 V168 M476,128 V168\"/> <text class=\"foundations-shared-reference-tc\" x=\"346\" y=\"153\">1</text> <text class=\"foundations-shared-reference-tc\" x=\"398\" y=\"153\">2</text> <text class=\"foundations-shared-reference-tc\" x=\"450\" y=\"153\">3</text> <g class=\"foundations-shared-reference-new\"> <rect class=\"foundations-shared-reference-tint\" x=\"477\" y=\"129\" width=\"50\" height=\"38\" rx=\"9\"/> <text class=\"foundations-shared-reference-tc\" x=\"502\" y=\"153\">4</text> </g> <text class=\"foundations-shared-reference-m\" x=\"320\" y=\"204\">c: a separate copy</text> <rect class=\"foundations-shared-reference-copy\" x=\"320\" y=\"214\" width=\"208\" height=\"40\" rx=\"10\"/> <path class=\"foundations-shared-reference-div\" d=\"M372,214 V254 M424,214 V254 M476,214 V254\"/> <text class=\"foundations-shared-reference-tc\" x=\"346\" y=\"239\">1</text> <text class=\"foundations-shared-reference-tc\" x=\"398\" y=\"239\">2</text> <text class=\"foundations-shared-reference-tc\" x=\"450\" y=\"239\">3</text> <text class=\"foundations-shared-reference-tc\" x=\"502\" y=\"239\">4</text> </svg>"
        },
        {
          "type": "p",
          "text": "The distinction between **shallow** and **deep** copies, mutable default arguments, and shared mutable state across threads are all the same idea: two names, one object. Passing 'by reference' versus 'by value' is often muddy; the useful question is always whether the callee can mutate the caller's object."
        },
        {
          "type": "h",
          "text": "Reclaiming memory"
        },
        {
          "type": "p",
          "text": "Manual management (C, C++ with raw `malloc`/`free`) gives control and risks leaks, use-after-free and double-free. **Garbage collection** (Java, C#, Go, JavaScript, Python) automatically frees objects that are no longer reachable. Tracing collectors start from roots (stack variables, globals) and mark everything reachable; the rest is garbage. CPython also uses reference counting, backed by a cycle collector. Rust takes a third route: ownership and borrowing rules checked at compile time free memory deterministically with no collector."
        },
        {
          "type": "p",
          "text": "GC does not prevent leaks; it prevents freeing things still in use. A memory leak in a GC language means keeping objects **reachable** by accident: an ever-growing cache or map, unremoved event listeners, static collections, closures holding large objects. Collectors may also pause your program briefly; the cost shows up as latency spikes, which matters in games and trading systems."
        },
        {
          "type": "h",
          "text": "Compiled, interpreted and JIT"
        },
        {
          "type": "p",
          "text": "A **compiler** translates source to machine code ahead of time (C, C++, Rust, Go); you ship a binary and the machine runs it directly. An **interpreter** executes source or bytecode instruction by instruction (classic Python, Ruby); startup is easy and speed is lower. A **JIT** (just-in-time) compiler, used by JVM languages, C#'s runtime and JavaScript engines, starts by interpreting, watches which code is hot, and compiles that to machine code at runtime using real observed types. That is why such programs are slow at first and fast later: the **warm-up** effect. The categories blur: CPython compiles to bytecode, then interprets it (recent versions add an optional experimental JIT, and Ruby ships YJIT); TypeScript compiles to JavaScript, which is JIT-compiled."
        },
        {
          "type": "h",
          "text": "Misconceptions"
        },
        {
          "type": "list",
          "items": [
            "\"Languages are either compiled or interpreted.\" It is a property of the implementation, and many use several stages.",
            "\"GC means no memory problems.\" It means no dangling pointers, not no leaks.",
            "\"Assignment copies.\" For objects it usually copies the reference."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents frequently write functions that mutate arguments, use mutable default arguments, or build unbounded in-memory caches, and they benchmark JIT languages with a single cold run. Tell the agent whether inputs may be mutated, ask for explicit copies or immutable data where sharing is risky, and require cache size limits and eviction. When asking for performance work, specify warm-up and repeated runs, and review any `global`, class-level collections and long-lived maps."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A function has a mutable default such as `def f(x, acc=[])` and results accumulate across calls",
              "use": "None default, create inside",
              "why": "The default object is created once and shared by every call. Default to `None` and create a fresh list inside; do the same for dicts, sets and any mutable object."
            },
            {
              "signal": "You copied a list or object, changed a nested field, and the original changed too",
              "use": "Deep copy or immutable nested data",
              "why": "A shallow copy duplicates only the outer container; nested objects are still shared. Deep copy when you must mutate, or keep nested data immutable so sharing is safe and cheap."
            },
            {
              "signal": "Memory climbs steadily for days and a static map or cache is only ever added to",
              "use": "Bounded cache with eviction",
              "why": "The GC cannot free what stays reachable. Cap entries and evict by LRU or TTL, or key by weak references when entries should die with their owner. Unbounded growth is a leak by design."
            },
            {
              "signal": "Destroyed screens, scenes or objects stay in a heap snapshot, retained by event handlers or callbacks",
              "use": "Unsubscribe on teardown",
              "why": "A publisher's listener list keeps every subscriber reachable. Pair every subscribe with an unsubscribe in the matching teardown hook, or hold a disposable token that removes the handler."
            },
            {
              "signal": "A lookup by an object key fails after one of the key object's fields was changed",
              "use": "Immutable value as hash key",
              "why": "The entry sits in the bucket for its old hash, so changed keys become unfindable. Use immutable keys (tuples, records, IDs) and never mutate an object while it is a key."
            },
            {
              "signal": "Recursion that is logically correct crashes with a stack overflow on very deep or long inputs",
              "use": "Iterate with an explicit stack",
              "why": "Each call costs a stack frame and the call stack is small. An explicit heap-allocated stack or loop handles depth bounded only by memory; raising the recursion limit just moves the crash."
            },
            {
              "signal": "The profiler shows periodic GC spikes while many short-lived objects (bullets, buffers, messages) are created per second",
              "use": "Object pool / buffer reuse",
              "why": "Reusing pre-allocated objects keeps allocation off the hot path and GC quiet. Costs reset bookkeeping and memory held at peak size; stale state in reused objects is the classic bug."
            },
            {
              "signal": "A benchmark on a JIT runtime shows the first thousand calls far slower than later ones",
              "use": "Warm up before measuring",
              "why": "JIT code starts interpreted and is compiled once it is hot. Discard warm-up iterations and use a benchmark harness; but report cold-start time separately if users actually pay it."
            }
          ]
        }
      ],
      "keyPoints": [
        "The stack holds short-lived call frames; the heap holds objects with flexible lifetimes.",
        "Assigning an object copies the reference, not the object; shallow copies still share nested objects.",
        "Garbage collection frees unreachable memory; leaks in GC languages are objects kept reachable by accident.",
        "Compiled, interpreted and JIT describe execution strategies; JIT code is slow at first and speeds up as it warms."
      ],
      "quiz": [
        {
          "q": "A Python function `def f(x, acc=[])` appends x to `acc` and returns it. After three calls without passing `acc`, the third result contains all three values. Why?",
          "options": [
            "Python appends shared values to every list created in a module",
            "The default list is created once at definition and shared by calls",
            "The garbage collector kept the old list alive between the calls",
            "Lists are passed by value, so each call copies the old contents"
          ],
          "answer": 1,
          "explain": "Default argument expressions are evaluated at definition time, so every call using the default mutates the same object. The idiom is `acc=None` and create a new list inside."
        },
        {
          "q": "A long-running Java service has a cache implemented as a static HashMap that is only ever added to. Memory grows until it crashes, even though the language has a garbage collector. What is happening?",
          "options": [
            "Entries stay reachable from a static root, so GC cannot free them",
            "The collector skips static fields unless the JVM runs in debug mode",
            "HashMap entries are allocated off-heap, where GC does not apply",
            "The JIT compiler leaks machine code for every new map entry"
          ],
          "answer": 0,
          "explain": "GC frees only unreachable objects. A static map is a root that keeps every entry reachable forever. Bound the cache and evict, or use weak references where appropriate."
        },
        {
          "q": "You copy a list of lists with `shallow = original.copy()` and then modify `shallow[0][0]`. The original changes too. What is the right explanation?",
          "options": [
            "copy() does not work on nested lists in recent Python versions",
            "copy() returned the same list object, so both names alias it",
            "Only the outer list is new; the inner lists are still shared",
            "Python copies lazily and syncs both lists until the next write"
          ],
          "answer": 2,
          "explain": "A shallow copy duplicates only the top-level container. `shallow is original` is False, but `shallow[0] is original[0]` is True. Use a deep copy (or build new inner lists) when nested data must be independent."
        },
        {
          "q": "A benchmark of a Java function shows the first 1,000 calls are 20x slower than later ones. Which explanation is most plausible?",
          "options": [
            "The call stack is still growing to its full size on first use",
            "Java is purely interpreted, so later calls reuse cached results",
            "The garbage collector runs a full collection on each early call",
            "The JIT has not yet compiled the hot code, so early calls run slower"
          ],
          "answer": 3,
          "explain": "JIT runtimes begin with interpreted or lightly optimized execution and compile hot paths after profiling them. Benchmarks should include warm-up iterations and measure steady state."
        },
        {
          "q": "A recursive function with no bug in its logic crashes with a stack overflow only on very long input lists (about 100,000 elements). What is the most robust remedy?",
          "options": [
            "Move the lists to the heap so they no longer use stack space",
            "Rewrite it iteratively so depth does not grow with input size",
            "Disable garbage collection while the recursion is running",
            "Pass a copy of the list so each frame holds less data"
          ],
          "answer": 1,
          "explain": "Each recursive call adds a stack frame and the stack is small and fixed. An iterative version (a loop or an explicit stack) keeps pending work on the heap, where it can grow. The lists already live on the heap, so moving them does not help."
        },
        {
          "q": "After opening and closing the Settings screen 20 times, a heap snapshot shows 20 live `SettingsScreen` instances, each referenced from the handler list of a static `ThemeChanged` event. What should you reach for?",
          "options": [
            "Unsubscribe the handler in the screen's teardown",
            "Cap the event's handler list at a fixed number of entries",
            "Deep copy the screen's data before the handler runs",
            "Pool `SettingsScreen` objects so they are reused each time"
          ],
          "answer": 0,
          "explain": "The publisher's handler list keeps every subscriber reachable, so each subscribe needs a matching unsubscribe. Capping the list drops live handlers, and pooling hides the leak instead of ending it."
        }
      ]
    },
    {
      "id": "concurrency-parallelism",
      "title": "Concurrency and Parallelism",
      "minutes": 12,
      "summary": "Threads, async/await, race conditions, locks, deadlocks and why immutability makes concurrent code safer.",
      "lesson": [
        {
          "type": "p",
          "text": "Two requests arrive at once, both read a stock count of 1, both decide to sell the item, both write 0. You just sold something you did not have, and the bug appears once a week and never in your tests. Concurrency is about structuring a program to handle many things in overlapping time; it brings a class of bugs that depend on timing rather than input."
        },
        {
          "type": "h",
          "text": "Concurrency versus parallelism"
        },
        {
          "type": "p",
          "text": "**Concurrency** is dealing with multiple tasks whose lifetimes overlap, possibly on one core by interleaving them. **Parallelism** is literally executing multiple tasks at the same instant on multiple cores. A web server handling thousands of connections on one thread is concurrent but not parallel; a video encoder splitting frames across 8 cores is parallel. Workloads divide into **I/O-bound** (waiting on network or disk: concurrency helps) and **CPU-bound** (computing: needs parallelism, so more cores)."
        },
        {
          "type": "h",
          "text": "Threads and async/await"
        },
        {
          "type": "p",
          "text": "A **thread** is an independently scheduled flow of execution sharing the process's memory. The OS can switch between them at almost any instruction, which is the source of most trouble. OS threads are heavyweight (stack memory, context switches), so you cannot sensibly have a million; runtimes such as Go (goroutines) and Java 21+ (virtual threads) multiplex many lightweight threads onto a few OS threads to get around this. **Async/await** is cooperative concurrency: an `async` function runs until it hits an `await` on something slow, yields control to an event loop, and resumes when the result is ready. One thread can juggle thousands of waiting operations. The rule: never block the event loop with CPU-heavy work or synchronous I/O, because everything else stalls. Python's GIL (which lets only one thread run Python bytecode at a time in the standard build; a free-threaded build without it is officially supported since Python 3.14 but is not the default) and JavaScript's single-threaded model further shape what is possible; check your runtime."
        },
        {
          "type": "code",
          "lang": "ts",
          "text": "// Sequential: total time = a + b\nconst x = await fetchUser(id);\nconst y = await fetchOrders(id);\n\n// Concurrent: total time = max(a, b)\nconst [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);"
        },
        {
          "type": "h",
          "text": "Race conditions"
        },
        {
          "type": "p",
          "text": "A **race condition** exists when correctness depends on the relative timing of operations. The classic form is check-then-act or read-modify-write: `count = count + 1` is three steps (read, add, write), and two threads interleaving them can lose an update."
        },
        {
          "type": "figure",
          "id": "foundations-lost-update",
          "caption": "Both threads read 0 before either writes, so both write 1: two increments ran, but one update is lost.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"Lost update timeline. Thread A reads count 0, thread B reads count 0, A writes 1, then B writes 1. Two increments ran, but count ends at 1 instead of 2.\"> <style> .foundations-lost-update-m{font-size:13px;fill:var(--fig-muted)} .foundations-lost-update-me{font-size:13px;fill:var(--fig-muted);text-anchor:end} .foundations-lost-update-lab{font-size:14px;font-weight:600;fill:var(--fig-ink)} .foundations-lost-update-tc{font-size:14px;fill:var(--fig-ink);text-anchor:middle} .foundations-lost-update-vc{font-size:15px;font-weight:600;fill:var(--fig-ink);text-anchor:middle} .foundations-lost-update-bt{font-size:14px;font-weight:600;fill:var(--fig-bad);text-anchor:middle} .foundations-lost-update-bv{font-size:15px;font-weight:600;fill:var(--fig-bad);text-anchor:middle} .foundations-lost-update-lane{stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:3 5} .foundations-lost-update-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .foundations-lost-update-ta{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.5} .foundations-lost-update-tb{fill:var(--fig-accent2);fill-opacity:.12;stroke:var(--fig-accent2);stroke-width:1.5} .foundations-lost-update-err{fill:var(--fig-bad);fill-opacity:.12;stroke:var(--fig-bad);stroke-width:1.5} .foundations-lost-update-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .foundations-lost-update-ah{fill:var(--fig-muted)} .foundations-lost-update-cur{stroke:var(--fig-muted);stroke-width:1.5;opacity:0;animation:foundations-lost-update-cur 6s linear infinite} .foundations-lost-update-dot{opacity:0;animation:foundations-lost-update-up 6s linear infinite} .foundations-lost-update-dn{animation-name:foundations-lost-update-down} .foundations-lost-update-da{fill:var(--fig-accent)} .foundations-lost-update-db{fill:var(--fig-accent2)} .foundations-lost-update-s1{animation-delay:.35s}.foundations-lost-update-s2{animation-delay:1.55s}.foundations-lost-update-s3{animation-delay:2.75s}.foundations-lost-update-s4{animation-delay:3.95s} @keyframes foundations-lost-update-cur{0%{transform:translateX(0);opacity:0}3%{opacity:1}80%{transform:translateX(440px);opacity:1}85%,100%{transform:translateX(440px);opacity:0}} @keyframes foundations-lost-update-up{0%{transform:translate(0,0);opacity:0}1%{opacity:1}7%{transform:translate(0,-36px);opacity:1}8%,100%{transform:translate(0,-36px);opacity:0}} @keyframes foundations-lost-update-down{0%{transform:translate(0,0);opacity:0}1%{opacity:1}7%{transform:translate(0,36px);opacity:1}8%,100%{transform:translate(0,36px);opacity:0}} </style> <defs><marker id=\"foundations-lost-update-arrow\" viewBox=\"0 0 8 8\" refX=\"7.5\" refY=\"4\" markerWidth=\"8\" markerHeight=\"8\" markerUnits=\"userSpaceOnUse\" orient=\"auto\"><path class=\"foundations-lost-update-ah\" d=\"M0,0.5 L7.5,4 L0,7.5 z\"/></marker></defs> <text class=\"foundations-lost-update-me\" x=\"600\" y=\"34\">time →</text> <text class=\"foundations-lost-update-lab\" x=\"24\" y=\"85\">Thread A</text> <text class=\"foundations-lost-update-lab\" x=\"24\" y=\"155\">count</text> <text class=\"foundations-lost-update-m\" x=\"24\" y=\"172\">shared</text> <text class=\"foundations-lost-update-lab\" x=\"24\" y=\"225\">Thread B</text> <path class=\"foundations-lost-update-lane\" d=\"M140,80 H600 M140,150 H600 M140,220 H600\"/> <line class=\"foundations-lost-update-cur\" x1=\"150\" y1=\"48\" x2=\"150\" y2=\"250\"/> <g marker-end=\"url(#foundations-lost-update-arrow)\"> <path class=\"foundations-lost-update-ln\" d=\"M200,134 V99\"/><path class=\"foundations-lost-update-ln\" d=\"M310,166 V201\"/><path class=\"foundations-lost-update-ln\" d=\"M420,98 V133\"/><path class=\"foundations-lost-update-ln\" d=\"M530,202 V167\"/> </g> <circle class=\"foundations-lost-update-dot foundations-lost-update-da foundations-lost-update-s1\" cx=\"200\" cy=\"134\" r=\"5\"/> <circle class=\"foundations-lost-update-dot foundations-lost-update-dn foundations-lost-update-db foundations-lost-update-s2\" cx=\"310\" cy=\"166\" r=\"5\"/> <circle class=\"foundations-lost-update-dot foundations-lost-update-dn foundations-lost-update-da foundations-lost-update-s3\" cx=\"420\" cy=\"98\" r=\"5\"/> <circle class=\"foundations-lost-update-dot foundations-lost-update-db foundations-lost-update-s4\" cx=\"530\" cy=\"202\" r=\"5\"/> <rect class=\"foundations-lost-update-box\" x=\"154\" y=\"62\" width=\"92\" height=\"36\" rx=\"10\"/><rect class=\"foundations-lost-update-ta\" x=\"154\" y=\"62\" width=\"92\" height=\"36\" rx=\"10\"/> <rect class=\"foundations-lost-update-box\" x=\"374\" y=\"62\" width=\"92\" height=\"36\" rx=\"10\"/><rect class=\"foundations-lost-update-ta\" x=\"374\" y=\"62\" width=\"92\" height=\"36\" rx=\"10\"/> <rect class=\"foundations-lost-update-box\" x=\"264\" y=\"202\" width=\"92\" height=\"36\" rx=\"10\"/><rect class=\"foundations-lost-update-tb\" x=\"264\" y=\"202\" width=\"92\" height=\"36\" rx=\"10\"/> <rect class=\"foundations-lost-update-box\" x=\"484\" y=\"202\" width=\"92\" height=\"36\" rx=\"10\"/><rect class=\"foundations-lost-update-tb\" x=\"484\" y=\"202\" width=\"92\" height=\"36\" rx=\"10\"/> <text class=\"foundations-lost-update-tc\" x=\"200\" y=\"85\">read 0</text> <text class=\"foundations-lost-update-tc\" x=\"420\" y=\"85\">write 0+1</text> <text class=\"foundations-lost-update-tc\" x=\"310\" y=\"225\">read 0</text> <text class=\"foundations-lost-update-tc\" x=\"530\" y=\"225\">write 0+1</text> <rect class=\"foundations-lost-update-box\" x=\"178\" y=\"134\" width=\"44\" height=\"32\" rx=\"8\"/> <rect class=\"foundations-lost-update-box\" x=\"288\" y=\"134\" width=\"44\" height=\"32\" rx=\"8\"/> <rect class=\"foundations-lost-update-box\" x=\"398\" y=\"134\" width=\"44\" height=\"32\" rx=\"8\"/> <rect class=\"foundations-lost-update-box\" x=\"508\" y=\"134\" width=\"44\" height=\"32\" rx=\"8\"/><rect class=\"foundations-lost-update-err\" x=\"508\" y=\"134\" width=\"44\" height=\"32\" rx=\"8\"/> <text class=\"foundations-lost-update-vc\" x=\"200\" y=\"155\">0</text> <text class=\"foundations-lost-update-vc\" x=\"310\" y=\"155\">0</text> <text class=\"foundations-lost-update-vc\" x=\"420\" y=\"155\">1</text> <text class=\"foundations-lost-update-bv\" x=\"530\" y=\"155\">1</text> <text class=\"foundations-lost-update-bt\" x=\"370\" y=\"274\">Two increments ran, count = 1 (expected 2)</text> <text class=\"foundations-lost-update-m\" x=\"370\" y=\"294\" text-anchor=\"middle\">B read before A wrote, so A's update is lost</text> </svg>"
        },
        {
          "type": "code",
          "lang": "python",
          "text": "import threading\ncount = 0\nlock = threading.Lock()\n\ndef unsafe():\n    global count\n    for _ in range(100000):\n        count += 1            # read, add, write: updates can be lost\n\ndef safe():\n    global count\n    for _ in range(100000):\n        with lock:            # only one thread inside at a time\n            count += 1"
        },
        {
          "type": "h",
          "text": "Locks and deadlocks"
        },
        {
          "type": "p",
          "text": "A **lock** (mutex) lets only one thread enter a critical section at a time. Locks fix races but add costs: they serialize work (hurting throughput) and can cause **deadlock**, where threads wait on each other forever. The classic recipe: thread A holds lock 1 and wants lock 2, thread B holds lock 2 and wants lock 1. Defenses: acquire locks in one global order, hold them briefly, never call unknown code or do I/O while holding one, and use timeouts. Related hazards are **livelock** (threads keep reacting without progress) and **starvation** (one thread never gets its turn)."
        },
        {
          "type": "h",
          "text": "Prefer designs that avoid sharing"
        },
        {
          "type": "list",
          "items": [
            "**Immutability**: data that never changes can be read by any number of threads without locks.",
            "**Share-nothing / message passing**: each worker owns its data; communicate via queues or channels.",
            "**Atomic operations** and database transactions for the few truly shared counters or records; let the database enforce invariants (unique constraints, `UPDATE ... WHERE stock > 0`).",
            "**Idempotent** operations so retries and duplicates do no harm."
          ]
        },
        {
          "type": "h",
          "text": "Misconceptions"
        },
        {
          "type": "list",
          "items": [
            "\"It passed my tests, so it is thread-safe.\" Races depend on timing; absence of failure proves little. Use race detectors and stress tests.",
            "\"async makes code faster.\" It improves waiting-heavy workloads; it does not speed CPU-bound work.",
            "\"More threads means more speed.\" Contention, context switches and locks can make it slower."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents add `async`, threads or a quick `Lock` freely, and often miss check-then-act races, forget to `await`, or hold a lock across a network call. Tell the agent what is shared and what the invariants are ('stock must never go negative'). Ask it to enumerate the interleavings that could break them, prefer immutable data or database-level guarantees, and run tests with a race detector (for example `go test -race`) and repeated stress runs."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Code reads shared state, checks it (`stock > 0`), then writes; overselling or double-booking shows up rarely",
              "use": "Atomic conditional update",
              "why": "Make check and write one operation: `UPDATE ... SET stock = stock - 1 WHERE stock > 0`, compare-and-swap, or a unique constraint. Check-then-act is a race whatever the language."
            },
            {
              "signal": "Several threads increment a shared counter or flag and the total comes out too low",
              "use": "Atomic operations for single variables",
              "why": "An atomic increment or CAS is lock-free and cheap for one word. Once an invariant spans several fields, atomics compose badly; switch to a lock around the whole update."
            },
            {
              "signal": "An invariant spans several fields or objects (balance plus ledger entry) touched by multiple threads",
              "use": "Mutex around the whole invariant",
              "why": "One lock guarding every read and write of the related fields keeps them consistent. Locks serialise work and can deadlock, so keep the critical section short and never call unknown code inside."
            },
            {
              "signal": "Two threads hang forever, each holding one lock and waiting for the other's (`accounts[1]`, `accounts[2]`)",
              "use": "Global lock ordering",
              "why": "Always acquire locks in one agreed order, for example by account id, so a wait cycle cannot form. Lock timeouts only detect deadlock; ordering prevents it."
            },
            {
              "signal": "A lock is held across a network call, disk read or `await`, and throughput collapses under load",
              "use": "Shrink the critical section",
              "why": "Do the slow I/O outside the lock, then lock only to read or apply the result, revalidating if needed. Every millisecond inside the lock serialises all waiting threads."
            },
            {
              "signal": "One part produces work (requests, log lines, chunks) faster or slower than another part consumes it",
              "use": "Producer-consumer bounded queue",
              "why": "A thread-safe queue decouples the two sides and gives each worker data it owns. Bound it so a fast producer blocks or sheds load instead of exhausting memory."
            },
            {
              "signal": "Read-mostly configuration or lookup data is shared by many threads and someone proposes a lock on every read",
              "use": "Immutable snapshot, swap the reference",
              "why": "Readers use an immutable object with no locks; a writer builds a new copy and publishes it with one atomic reference swap. Costs a full copy per update, so it suits rare writes."
            },
            {
              "signal": "Independent I/O calls are awaited one after another, so latency is their sum",
              "use": "Fan-out / fan-in",
              "why": "Start them together and join with `Promise.all` or a task group, so latency becomes the slowest one. Cap concurrency for large fan-outs and decide how one failure cancels the rest."
            },
            {
              "signal": "One CPU-heavy request (compression, image resize, `gzipSync`) freezes an async server for every user",
              "use": "Offload CPU work to a worker pool",
              "why": "The event loop is one thread, so CPU-bound work blocks all other tasks. Use async APIs or worker threads or processes; async alone speeds up waiting, not computing."
            }
          ]
        }
      ],
      "keyPoints": [
        "Concurrency is overlapping tasks; parallelism is simultaneous execution; I/O-bound and CPU-bound work need different tools.",
        "Read-modify-write and check-then-act on shared state are race conditions; tests rarely catch them.",
        "Locks protect critical sections but can cause deadlock; use a global lock order and short critical sections.",
        "The safest concurrency avoids sharing: immutable data, message passing, and database-enforced invariants."
      ],
      "quiz": [
        {
          "q": "Two request handlers each read `stock = 1`, check `stock > 0`, then write `stock = stock - 1`. Both succeed and you oversell. What kind of bug is this and what is the sturdiest fix?",
          "options": [
            "A deadlock; add request timeouts so a stuck handler gives up",
            "A visibility bug; mark the stock variable as volatile",
            "A check-then-act race; do one conditional atomic update",
            "An overflow; store the stock count as a 64-bit integer"
          ],
          "answer": 2,
          "explain": "Between the check and the write another request can run, so both pass the check. Performing the check and update as one atomic operation (`UPDATE ... SET stock = stock - 1 WHERE stock > 0`) removes the window. Volatile makes writes visible but does not make check-then-act atomic."
        },
        {
          "q": "Thread A locks `accounts[1]` then waits for `accounts[2]`; thread B locks `accounts[2]` then waits for `accounts[1]`. Both hang. What is the standard way to prevent this?",
          "options": [
            "Add more worker threads so one of them can finish first",
            "Make every lock re-entrant so a thread can re-acquire it",
            "Swap the locks for async/await so no thread ever blocks",
            "Acquire locks in one global order, such as by account id"
          ],
          "answer": 3,
          "explain": "A consistent acquisition order makes a circular wait impossible. Extra threads only add more waiters, re-entrancy only helps when the same thread re-locks, and async code still needs to protect shared state."
        },
        {
          "q": "An async Node server slows to a crawl for all users whenever one user uploads a large file that is compressed with `zlib.gzipSync` inside the request handler. What is the most likely cause?",
          "options": [
            "Async functions cannot read file uploads larger than the heap",
            "The synchronous compression blocks the single event-loop thread",
            "Node caps pending promises at 100, so later requests queue up",
            "gzip is O(n^2), so one large file outweighs all small ones"
          ],
          "answer": 1,
          "explain": "Cooperative concurrency relies on tasks yielding at awaits. A synchronous CPU-heavy call never yields, so every other request waits. Use the async zlib API (which runs on a worker pool) or a worker thread."
        },
        {
          "q": "Which workload gains the most from replacing sequential `await` calls with `Promise.all` on a single thread?",
          "options": [
            "Hashing three large buffers with a pure-JavaScript SHA-256",
            "Multiplying three large matrices held in memory",
            "Fetching profile, orders and ads from three remote services",
            "Sorting three large in-memory arrays of numbers"
          ],
          "answer": 2,
          "explain": "The three requests spend most of their time waiting on the network, so overlapping them cuts total latency to roughly the slowest one. The other options are CPU-bound JavaScript and would not overlap on one thread."
        },
        {
          "q": "A team shares a configuration object across threads and wants to avoid locks. Which design removes the need for locking on reads?",
          "options": [
            "Make it immutable and publish changes by swapping in a new instance",
            "Guard every read with one global lock held for the program's life",
            "Let threads edit the shared object in place, keeping writes small",
            "Run reader threads at a lower priority than the writer thread"
          ],
          "answer": 0,
          "explain": "Immutable data can be read concurrently with no synchronization because nobody mutates it; updates publish a fresh copy by swapping one reference. In-place edits create races, and priorities do not provide safety."
        },
        {
          "q": "Under load, throughput on `updateCart` collapses. A profile shows most threads waiting on one mutex that is held while the code makes an HTTP call to a price service. What should you reach for?",
          "options": [
            "Acquire the locks in one global order across every caller",
            "Replace the mutex with an atomic counter on the cart total value",
            "Wrap the lock acquisition in a retry loop with a short timeout",
            "Do the HTTP call outside the lock, then lock only to apply it"
          ],
          "answer": 3,
          "explain": "Slow I/O inside a critical section serialises every waiting thread, so move it out and lock only to apply the result. Lock ordering prevents deadlock, which is not the symptom here."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "An agent's CSV loader parses values with `parseFloat` and skips missing ones with `if (x === NaN) continue;`. Missing values are never skipped. What is wrong?",
      "options": [
        "NaN is not equal to anything, itself included; use Number.isNaN(x)",
        "parseFloat returns the string 'NaN', so === fails on the type check",
        "NaN only comes from division by zero, never from failed parsing",
        "Float equality needs a tolerance, so compare with Math.abs(x - NaN)"
      ],
      "answer": 0,
      "explain": "NaN compares unequal to every value, including another NaN, so `x === NaN` is always false. `Number.isNaN(x)` is the correct test. parseFloat returns the number NaN for unparsable input, and a tolerance does not help because any arithmetic with NaN is NaN."
    },
    {
      "q": "A log search feature takes a list of 10,000 error codes and checks each of 5 million log lines with `code in error_codes` (a list). It takes minutes. What is the smallest change with the biggest win?",
      "options": [
        "Run the loop on a machine with a faster CPU and more RAM",
        "Sort the log lines first so matching lines are adjacent",
        "Convert the error codes to a set once, before the loop",
        "Read the log file in larger chunks to reduce disk I/O"
      ],
      "answer": 2,
      "explain": "Membership in a list is O(10,000) per line; a set makes it expected O(1), cutting the work by orders of magnitude. The other options do not change the growth rate, and sorting adds work."
    },
    {
      "q": "You ask an agent for a function that returns the k largest items from a stream of 100 million numbers, using little memory. Which approach should you expect or request?",
      "options": [
        "Collect every number in a list, sort it descending, and take the first k",
        "Keep a size-k min-heap; replace its minimum when a larger value arrives",
        "Count occurrences in a hash map, then pick the k largest keys",
        "Recursively split the stream in half and merge the top halves"
      ],
      "answer": 1,
      "explain": "A size-k min-heap uses O(k) memory and O(log k) work per item. Sorting everything needs O(n) memory and O(n log n) time, and a hash map grows with the number of distinct values."
    },
    {
      "q": "A service fits UTF-8 text into a 100-byte SMS field by cutting the byte array at 100. Some messages now end with the replacement character `U+FFFD`. What happened?",
      "options": [
        "The SMS gateway rejects every non-ASCII character it receives",
        "UTF-8 needs a terminating null byte, which the cut removed",
        "The text was really UTF-16, so each byte became half a character",
        "The cut split a multibyte UTF-8 character, leaving invalid bytes"
      ],
      "answer": 3,
      "explain": "A non-ASCII character spans 2 to 4 bytes, so a fixed byte offset can land inside one; the decoder then replaces the partial sequence with U+FFFD. Truncate on a character (ideally grapheme) boundary instead. A gateway that rejected all non-ASCII would break every such message, not just some endings."
    },
    {
      "q": "Your dependency installer is given packages A, B and C, where A needs B, B needs C, and C needs A. The agent's recursive resolver hangs with growing memory. What is the likely defect and fix?",
      "options": [
        "Raise the recursion limit so the resolver can finish the chain",
        "Store the graph as an adjacency matrix instead of a list",
        "Track nodes on the current path and report the cycle as an error",
        "Resolve packages in alphabetical order instead of by dependency"
      ],
      "answer": 2,
      "explain": "Following edges around a cycle without remembering visited nodes recurses forever. Raising limits only delays the crash and changing the representation changes nothing; the cycle must be detected and surfaced as an error."
    },
    {
      "q": "A route planner uses BFS to find the cheapest route between cities, where each road has a different non-negative toll. It returns routes with the fewest roads, not the lowest total toll. What should it use instead?",
      "options": [
        "Depth-first search, which explores each route fully before the next",
        "Dijkstra's algorithm, which handles non-negative edge weights",
        "BFS with a stack instead of a queue, to reach cheap roads sooner",
        "Greedy: always take the cheapest road leaving the current city"
      ],
      "answer": 1,
      "explain": "BFS minimizes the number of edges, which matches cost only when every edge weighs the same. Dijkstra's algorithm is the greedy-correct choice for non-negative weights. Taking the cheapest next road can lead into an expensive dead end, and DFS has no cost guarantee."
    },
    {
      "q": "You must fit the most non-overlapping meetings into one room. An agent picks the shortest meetings first, and your brute-force test finds a counterexample. Which greedy rule is provably optimal?",
      "options": [
        "Pick the meeting that starts earliest, then the next compatible one",
        "Pick the shortest meeting, then the next shortest compatible one",
        "Pick the meeting that ends earliest, then the next compatible one",
        "Pick the meeting with the fewest conflicts, then repeat"
      ],
      "answer": 2,
      "explain": "Choosing the earliest finish time leaves the most room for the rest, and an exchange argument proves it optimal. Earliest start, shortest first and fewest conflicts all have known counterexamples, which is why greedy rules must be proven or tested against brute force."
    },
    {
      "q": "A service function gets a settings dict from its caller, adds default keys to it and returns it. Later, the caller's own dict contains unexpected keys. What principle was violated, and what is the fix?",
      "options": [
        "Dicts are unordered, so new keys can appear in any caller's dict",
        "It mutated the caller's object; copy the dict or build a new one",
        "The dict was garbage collected early and rebuilt with defaults",
        "The function should use recursion to merge nested defaults"
      ],
      "answer": 1,
      "explain": "Passing an object passes a reference to the same data, so in-place edits are visible to the caller. Returning a new dict (for example `{**defaults, **settings}`) avoids the surprise."
    },
    {
      "q": "A teammate says: 'Python is interpreted, so it never compiles anything.' Which statement about CPython is accurate?",
      "options": [
        "Correct: CPython executes source text line by line with no compile step",
        "It compiles source to bytecode, then interprets that bytecode",
        "It compiles every module to machine code before running it",
        "It compiles code only when type hints are present in the file"
      ],
      "answer": 1,
      "explain": "CPython first compiles source to bytecode (cached in `.pyc` files) and then interprets the bytecode. Recent versions add an optional experimental JIT for hot code, but nothing is compiled to machine code ahead of time. 'Compiled versus interpreted' describes an implementation, not a language."
    },
    {
      "q": "A Java microbenchmark shows version B of a parsing function is 3x slower than version A, from one run each of 100 iterations in a fresh JVM. What should you do before believing it?",
      "options": [
        "Accept it, since 100 iterations are enough to average out noise",
        "Rerun with a smaller input to see whether the gap shrinks",
        "Compare bytecode sizes, since smaller bytecode runs faster",
        "Rerun with warm-up and many repetitions in a harness such as JMH"
      ],
      "answer": 3,
      "explain": "JIT warm-up, caching and noise can dominate a single short cold run. A harness with warm-up and repeated measurements produces comparable steady-state numbers."
    },
    {
      "q": "An async endpoint validates a coupon, then in a separate step marks it as used. Under load, the same single-use coupon is accepted twice. Which fix is most robust?",
      "options": [
        "Make check-and-mark atomic in the database, e.g. a conditional update",
        "Add a short sleep between validating the coupon and marking it used",
        "Run more server instances so each request completes sooner",
        "Re-check the coupon in application code right after marking it used"
      ],
      "answer": 0,
      "explain": "The gap between check and act is the race window; sleeping or re-checking in application code still leaves interleavings. Atomicity enforced by the database (a conditional update or a unique constraint on redemption) closes it even across multiple server instances."
    },
    {
      "q": "A signed 32-bit counter of milliseconds since service start is used to compute uptime. After roughly 25 days the service reports negative uptime. What is the cause and the right fix?",
      "options": [
        "Float rounding error; store the uptime as a double instead",
        "The garbage collector reset the counter during a full GC",
        "The counter was stored as UTF-16 text and misparsed",
        "Signed 32-bit overflow after 2^31 ms; use a 64-bit integer"
      ],
      "answer": 3,
      "explain": "2^31 milliseconds is about 24.8 days, after which the value wraps to the most negative number. A 64-bit counter lasts about 292 million years."
    },
    {
      "q": "A teammate proposes holding a lock while calling a remote payment API 'to be safe', since it guarantees ordered updates to the account record. What is the main risk?",
      "options": [
        "Remote calls are forbidden inside critical sections in most languages",
        "The lock lets the API calls run in parallel and reorder updates",
        "Contenders stall for the API's latency, and a hung call blocks them all",
        "The lock may be released before the API's response arrives"
      ],
      "answer": 2,
      "explain": "Critical sections should be short and free of I/O, because their duration directly becomes waiting time for all contenders, and a slow or hung call can block them indefinitely. Better: make the call outside the lock and reconcile with an atomic update or idempotency key."
    },
    {
      "q": "A Python service (standard build, with the GIL) resizes images in pure-Python code using a pool of 8 threads on an 8-core machine, and sees almost no speedup over one thread. Why, and what helps?",
      "options": [
        "The GIL runs one thread's bytecode at a time; use processes",
        "Eight threads are too few; raise the pool size to 64 threads",
        "Resizing is I/O-bound, so switching to async/await will help",
        "Thread pools run tasks one by one by design; use raw threads"
      ],
      "answer": 0,
      "explain": "The work is CPU-bound, and in the standard build the GIL lets only one thread execute Python bytecode at a time. A process pool (or native code that releases the GIL, or the free-threaded build) gives real parallelism. More threads add contention, and async only helps waiting-heavy work."
    }
  ]
});
