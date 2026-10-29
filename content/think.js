window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "think",
  "title": "How to Think",
  "tagline": "The mental habits that make every tool, language and agent more useful.",
  "intro": "Languages and frameworks change every few years; the ways good engineers think do not. When you build with AI agents, your job shifts from typing code to framing problems, judging designs and diagnosing failures, which makes these habits the core of the work. An agent amplifies clear thinking and vague thinking alike.",
  "topics": [
    {
      "id": "decomposition",
      "title": "Computational Thinking & Decomposition",
      "minutes": 9,
      "summary": "Turn a fuzzy goal into well-defined inputs, outputs, steps and invariants.",
      "lesson": [
        {
          "type": "p",
          "text": "A product manager says: 'Users should be able to clean up duplicate files in a folder.' You could start typing code immediately, or hand the sentence to an agent. Both usually produce something that runs and is subtly wrong. Computational thinking is the discipline of turning a fuzzy goal into a problem precise enough that a machine, or a colleague, can solve it without guessing."
        },
        {
          "type": "h",
          "text": "The four moves"
        },
        {
          "type": "list",
          "items": [
            "**Decomposition**: split the problem into smaller sub-problems that can be solved and tested independently.",
            "**Pattern recognition**: notice that a sub-problem is one you already know (sorting, grouping, graph search, parsing).",
            "**Abstraction**: ignore details that do not affect the answer (covered in depth in the next topic).",
            "**Algorithm design**: write the precise sequence of steps, including what happens at the edges."
          ]
        },
        {
          "type": "h",
          "text": "Start with inputs and outputs"
        },
        {
          "type": "p",
          "text": "Before any step-by-step plan, define the **contract**: exactly what goes in, exactly what comes out, and what is promised to be true about each. For the duplicate-file problem the vague words are 'duplicate' and 'clean up'. Is a duplicate a file with the same name, the same size, or the same bytes? Does clean up mean delete, move, or only report? Each answer changes the design, and asking is far cheaper than discovering the mismatch after the code exists."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Input:  a directory path (may contain nested folders and symlinks)\nOutput: a list of groups; each group is 2+ file paths with identical bytes\nNot in scope: deleting anything (report only)\nEdge cases: empty files, unreadable files, symlink loops, huge files"
        },
        {
          "type": "h",
          "text": "Decompose by data flow"
        },
        {
          "type": "p",
          "text": "A reliable way to decompose is to follow the data. Raw input is transformed by a series of stages into the output, and each stage has a small, testable contract. Here, the stages are: walk the tree, group paths by size, hash only the files whose size collides, then group by hash. Notice the second stage is an optimisation hidden inside the structure: files with a unique size cannot be duplicates, so we skip reading them."
        },
        {
          "type": "figure",
          "id": "think-dup-pipeline",
          "caption": "Follow the data: grouping by size first means f.mp4, the only 9 MB file, is never read or hashed.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"Six files flow through four stages: walk_files lists them, group by size drops f.mp4 because its size is unique, content_hash reads only the five remaining files, and group by hash leaves two duplicate groups.\"> <style> .think-dup-pipeline-t{font-size:13px;fill:var(--fig-ink)} .think-dup-pipeline-m{font-size:12px;fill:var(--fig-muted)} .think-dup-pipeline-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .think-dup-pipeline-hd{fill:var(--fig-accent);fill-opacity:.1;stroke:var(--fig-accent);stroke-width:1.5} .think-dup-pipeline-chip{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .think-dup-pipeline-grp{fill:none;stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 3} .think-dup-pipeline-okg{fill:var(--fig-ok);fill-opacity:.08;stroke:var(--fig-ok);stroke-width:1.5} .think-dup-pipeline-dim{opacity:.4} .think-dup-pipeline-ar{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .think-dup-pipeline-ah{fill:var(--fig-muted)} .think-dup-pipeline-ok{font-size:13px;fill:var(--fig-ok)} .think-dup-pipeline-bad{font-size:12px;fill:var(--fig-bad)} .think-dup-pipeline-pulse{animation:think-dup-pipeline-p 6s infinite} @keyframes think-dup-pipeline-p{0%,22%{fill-opacity:.35}28%,100%{fill-opacity:.1}} </style> <defs><marker id=\"think-dup-pipeline-arr\" viewBox=\"0 0 8 8\" refX=\"7\" refY=\"4\" markerWidth=\"8\" markerHeight=\"8\" orient=\"auto\"><path d=\"M0 0 L8 4 L0 8 z\" class=\"think-dup-pipeline-ah\"/></marker></defs> <rect x=\"12\" y=\"18\" width=\"124\" height=\"32\" rx=\"10\" class=\"think-dup-pipeline-hd think-dup-pipeline-pulse\" style=\"animation-delay:0s\"/><text x=\"74\" y=\"39\" text-anchor=\"middle\" class=\"think-dup-pipeline-t\">walk_files</text> <line x1=\"142\" y1=\"34\" x2=\"170\" y2=\"34\" class=\"think-dup-pipeline-ar\" marker-end=\"url(#think-dup-pipeline-arr)\"/> <rect x=\"176\" y=\"18\" width=\"124\" height=\"32\" rx=\"10\" class=\"think-dup-pipeline-hd think-dup-pipeline-pulse\" style=\"animation-delay:1.5s\"/><text x=\"238\" y=\"39\" text-anchor=\"middle\" class=\"think-dup-pipeline-t\">group by size</text> <line x1=\"306\" y1=\"34\" x2=\"334\" y2=\"34\" class=\"think-dup-pipeline-ar\" marker-end=\"url(#think-dup-pipeline-arr)\"/> <rect x=\"340\" y=\"18\" width=\"124\" height=\"32\" rx=\"10\" class=\"think-dup-pipeline-hd think-dup-pipeline-pulse\" style=\"animation-delay:3s\"/><text x=\"402\" y=\"39\" text-anchor=\"middle\" class=\"think-dup-pipeline-t\">content_hash</text> <line x1=\"470\" y1=\"34\" x2=\"498\" y2=\"34\" class=\"think-dup-pipeline-ar\" marker-end=\"url(#think-dup-pipeline-arr)\"/> <rect x=\"504\" y=\"18\" width=\"124\" height=\"32\" rx=\"10\" class=\"think-dup-pipeline-hd think-dup-pipeline-pulse\" style=\"animation-delay:4.5s\"/><text x=\"566\" y=\"39\" text-anchor=\"middle\" class=\"think-dup-pipeline-t\">group by hash</text> <g class=\"\"><rect x=\"18\" y=\"76\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"28\" y=\"91.5\" class=\"think-dup-pipeline-t\">a.jpg</text><text x=\"120\" y=\"91.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">2 MB</text></g> <g class=\"\"><rect x=\"18\" y=\"104\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"28\" y=\"119.5\" class=\"think-dup-pipeline-t\">b.jpg</text><text x=\"120\" y=\"119.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">2 MB</text></g> <g class=\"\"><rect x=\"18\" y=\"132\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"28\" y=\"147.5\" class=\"think-dup-pipeline-t\">c.txt</text><text x=\"120\" y=\"147.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">4 KB</text></g> <g class=\"\"><rect x=\"18\" y=\"160\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"28\" y=\"175.5\" class=\"think-dup-pipeline-t\">d.png</text><text x=\"120\" y=\"175.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">2 MB</text></g> <g class=\"\"><rect x=\"18\" y=\"188\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"28\" y=\"203.5\" class=\"think-dup-pipeline-t\">e.txt</text><text x=\"120\" y=\"203.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">4 KB</text></g> <g class=\"\"><rect x=\"18\" y=\"216\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"28\" y=\"231.5\" class=\"think-dup-pipeline-t\">f.mp4</text><text x=\"120\" y=\"231.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">9 MB</text></g> <rect x=\"176\" y=\"72\" width=\"124\" height=\"86\" rx=\"9\" class=\"think-dup-pipeline-grp\"/> <rect x=\"176\" y=\"168\" width=\"124\" height=\"58\" rx=\"9\" class=\"think-dup-pipeline-grp\"/> <g class=\"\"><rect x=\"182\" y=\"76\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"192\" y=\"91.5\" class=\"think-dup-pipeline-t\">a.jpg</text><text x=\"284\" y=\"91.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">2 MB</text></g> <g class=\"\"><rect x=\"182\" y=\"104\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"192\" y=\"119.5\" class=\"think-dup-pipeline-t\">b.jpg</text><text x=\"284\" y=\"119.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">2 MB</text></g> <g class=\"\"><rect x=\"182\" y=\"132\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"192\" y=\"147.5\" class=\"think-dup-pipeline-t\">d.png</text><text x=\"284\" y=\"147.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">2 MB</text></g> <g class=\"\"><rect x=\"182\" y=\"172\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"192\" y=\"187.5\" class=\"think-dup-pipeline-t\">c.txt</text><text x=\"284\" y=\"187.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">4 KB</text></g> <g class=\"\"><rect x=\"182\" y=\"200\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"192\" y=\"215.5\" class=\"think-dup-pipeline-t\">e.txt</text><text x=\"284\" y=\"215.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">4 KB</text></g> <rect x=\"340\" y=\"72\" width=\"124\" height=\"86\" rx=\"9\" class=\"think-dup-pipeline-grp\"/> <rect x=\"340\" y=\"168\" width=\"124\" height=\"58\" rx=\"9\" class=\"think-dup-pipeline-grp\"/> <g class=\"\"><rect x=\"346\" y=\"76\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"356\" y=\"91.5\" class=\"think-dup-pipeline-t\">a.jpg</text><text x=\"448\" y=\"91.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">7f3a</text></g> <g class=\"\"><rect x=\"346\" y=\"104\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"356\" y=\"119.5\" class=\"think-dup-pipeline-t\">b.jpg</text><text x=\"448\" y=\"119.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">7f3a</text></g> <g class=\"\"><rect x=\"346\" y=\"132\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"356\" y=\"147.5\" class=\"think-dup-pipeline-t\">d.png</text><text x=\"448\" y=\"147.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">c21e</text></g> <g class=\"\"><rect x=\"346\" y=\"172\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"356\" y=\"187.5\" class=\"think-dup-pipeline-t\">c.txt</text><text x=\"448\" y=\"187.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">e09b</text></g> <g class=\"\"><rect x=\"346\" y=\"200\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"356\" y=\"215.5\" class=\"think-dup-pipeline-t\">e.txt</text><text x=\"448\" y=\"215.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">e09b</text></g> <rect x=\"176\" y=\"236\" width=\"124\" height=\"30\" rx=\"9\" class=\"think-dup-pipeline-grp think-dup-pipeline-dim\"/> <g class=\"think-dup-pipeline-dim\"><rect x=\"182\" y=\"240\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"192\" y=\"255.5\" class=\"think-dup-pipeline-t\">f.mp4</text><text x=\"284\" y=\"255.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">9 MB</text></g> <rect x=\"504\" y=\"72\" width=\"124\" height=\"58\" rx=\"9\" class=\"think-dup-pipeline-okg\"/> <g class=\"\"><rect x=\"510\" y=\"76\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"520\" y=\"91.5\" class=\"think-dup-pipeline-t\">a.jpg</text><text x=\"612\" y=\"91.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">7f3a</text></g> <g class=\"\"><rect x=\"510\" y=\"104\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"520\" y=\"119.5\" class=\"think-dup-pipeline-t\">b.jpg</text><text x=\"612\" y=\"119.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">7f3a</text></g> <g class=\"think-dup-pipeline-dim\"><rect x=\"510\" y=\"144\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"520\" y=\"159.5\" class=\"think-dup-pipeline-t\">d.png</text><text x=\"612\" y=\"159.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">c21e</text></g> <rect x=\"504\" y=\"184\" width=\"124\" height=\"58\" rx=\"9\" class=\"think-dup-pipeline-okg\"/> <g class=\"\"><rect x=\"510\" y=\"188\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"520\" y=\"203.5\" class=\"think-dup-pipeline-t\">c.txt</text><text x=\"612\" y=\"203.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">e09b</text></g> <g class=\"\"><rect x=\"510\" y=\"216\" width=\"112\" height=\"22\" rx=\"6\" class=\"think-dup-pipeline-chip\"/><text x=\"520\" y=\"231.5\" class=\"think-dup-pipeline-t\">e.txt</text><text x=\"612\" y=\"231.5\" text-anchor=\"end\" class=\"think-dup-pipeline-m think-dup-pipeline-c\">e09b</text></g> <text x=\"74\" y=\"292\" text-anchor=\"middle\" class=\"think-dup-pipeline-m\" style=\"font-size:13px\">6 files</text> <text x=\"238\" y=\"292\" text-anchor=\"middle\" class=\"think-dup-pipeline-bad\" style=\"font-size:13px\">f.mp4 never read</text> <text x=\"402\" y=\"292\" text-anchor=\"middle\" class=\"think-dup-pipeline-m\" style=\"font-size:13px\">5 files hashed</text> <text x=\"566\" y=\"292\" text-anchor=\"middle\" class=\"think-dup-pipeline-ok\" style=\"font-size:13px\">2 duplicate groups</text> </svg>"
        },
        {
          "type": "code",
          "lang": "python",
          "text": "def find_duplicates(root):\n    by_size = group_by(walk_files(root), key=file_size)\n    candidates = [g for g in by_size.values() if len(g) > 1]\n    result = []\n    for group in candidates:\n        by_hash = group_by(group, key=content_hash)\n        result += [g for g in by_hash.values() if len(g) > 1]\n    return result"
        },
        {
          "type": "p",
          "text": "Each helper (`walk_files`, `group_by`, `file_size`, `content_hash`) can be written, tested and replaced on its own. If hashing turns out to be slow, you change one function, not the whole program."
        },
        {
          "type": "h",
          "text": "Invariants: what stays true"
        },
        {
          "type": "p",
          "text": "An **invariant** is a statement that is true before and after every step of a loop or operation. Invariants are how you convince yourself an algorithm is correct without running every input. In binary search the invariant is: if the target exists, it lies within the range `[lo, hi]`. Every iteration must shrink the range while keeping that sentence true."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "def search(items, target):\n    lo, hi = 0, len(items) - 1\n    while lo <= hi:\n        # invariant: target, if present, is in items[lo..hi]\n        mid = (lo + hi) // 2\n        if items[mid] == target:\n            return mid\n        if items[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1"
        },
        {
          "type": "p",
          "text": "Most famous off-by-one bugs are invariant violations: setting `lo = mid` instead of `mid + 1` keeps the invariant true but breaks progress, and the loop never ends. Termination (the range shrinks) and correctness (the invariant holds) are separate things to check."
        },
        {
          "type": "h",
          "text": "Common pitfalls"
        },
        {
          "type": "list",
          "items": [
            "**Decomposing by technology instead of by problem**: 'the database part, the API part' is not a decomposition of the problem, only of the stack.",
            "**Pieces that cannot be tested alone**: if a sub-problem needs the whole system to verify, the cut is in the wrong place.",
            "**Skipping the edge cases**: empty input, one element, duplicates, maximum size, and malformed data are where most real defects live.",
            "**Solving the stated problem instead of the real one**: confirm the goal behind the request."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents will confidently resolve ambiguity by guessing, and the guess is rarely flagged. Give the agent your contract (inputs, outputs, out-of-scope, edge cases) up front, and ask it to list its assumptions before writing code. When reviewing, check that the output honours the invariants and edge cases you named; agents tend to handle the happy path well and the boundaries poorly."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "A good decomposition test: can you describe each piece in one sentence without using the word 'and'? If not, split it further."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "The request contains fuzzy words like 'duplicate', 'clean up' or 'fast' that two people could read differently",
              "use": "Write the contract first",
              "why": "Pin down inputs, outputs, out-of-scope behaviour and edge cases before any steps. Ten minutes of definition prevents code that runs and solves the wrong problem."
            },
            {
              "signal": "A feature request names a solution ('remove duplicate customers') but not the outcome anyone actually wants",
              "use": "Ask for the goal behind the request",
              "why": "The real need (cleaner mailing lists? correct billing?) changes scope and edge cases. Skip it only when the goal is already obvious and agreed."
            },
            {
              "signal": "Raw input goes through several transformations before it becomes the output you need",
              "use": "Decompose by data flow (pipeline stages)",
              "why": "Each stage gets a small contract you can test and replace alone, e.g. `walk_files` then `group_by` then `content_hash`. Splitting by tech layer ('the DB part') hides the real problem."
            },
            {
              "signal": "An expensive check (hashing, network call, full compare) would run on every item, but most items can be ruled out cheaply",
              "use": "Cheap filter before expensive check",
              "why": "Grouping by file size before hashing only hashes files whose sizes collide. The cheap key must be a necessary condition, or you will drop true matches."
            },
            {
              "signal": "A sub-problem smells familiar: grouping by key, ordering, shortest route, matching brackets, parsing text",
              "use": "Reduce to a known problem",
              "why": "Recognising sorting, grouping, graph search or parsing gives you a proven algorithm and its known edge cases. Check the fit: a near-match with different constraints can mislead."
            },
            {
              "signal": "You cannot convince yourself a loop is correct without tracing many inputs by hand",
              "use": "State the loop invariant",
              "why": "Write the fact that holds before and after every iteration, e.g. 'target, if present, is in `items[lo..hi]`'. Correctness then follows from preserving it at each step."
            },
            {
              "signal": "A loop like binary search hangs on some inputs even though every update looks logically safe",
              "use": "Check termination separately (loop variant)",
              "why": "An invariant can stay true while the range stops shrinking, as with `lo = mid`. Name a quantity that strictly decreases each iteration, such as `hi - lo`."
            },
            {
              "signal": "You describe one piece of the design and the sentence needs 'and' to cover what it does",
              "use": "Split until no 'and'",
              "why": "A piece with one job has one contract and one reason to change. Stop splitting when pieces become so small that wiring them costs more than it clarifies."
            },
            {
              "signal": "A sub-problem can only be verified by running the whole system end to end",
              "use": "Re-cut at a testable boundary",
              "why": "If a piece needs everything else to check it, the cut is in the wrong place. Move the boundary so the piece takes plain data in and returns plain data out."
            },
            {
              "signal": "The design covers the happy path, and nobody has said what happens with empty, single, huge or malformed input",
              "use": "Edge-case checklist (0, 1, many, max, bad)",
              "why": "Most real defects live at these edges. Listing them during design shapes the contract; discovering them in production means rework and data cleanup."
            },
            {
              "signal": "The problem is large and you cannot see where to start or how the parts will fit together",
              "use": "Walking skeleton (thin end-to-end slice)",
              "why": "Build the simplest version that goes from real input to real output, then deepen each stage. It surfaces integration problems early, at the cost of temporarily crude stages."
            }
          ]
        }
      ],
      "keyPoints": [
        "Define inputs, outputs and out-of-scope behaviour before designing steps.",
        "Decompose by following the data through stages, each with a small testable contract.",
        "An invariant is a fact that holds before and after each step; it is your tool for proving correctness.",
        "Edge cases (empty, one, maximum, malformed) deserve explicit attention."
      ],
      "quiz": [
        {
          "q": "You are asked to build 'a feature that removes duplicate customers'. What should you do first?",
          "options": [
            "Define what counts as a duplicate, what removal means, and the inputs and outputs",
            "Prototype with a fuzzy-matching library to learn which records look alike",
            "Write the migration that deletes rows, guarded by a dry-run flag",
            "Split the work into frontend, backend and database tickets for the team"
          ],
          "answer": 0,
          "explain": "Without a precise contract any implementation is a guess. Prototyping or writing the migration commits to an unstated definition of 'duplicate', and splitting by technology is not decomposing the problem itself."
        },
        {
          "q": "In the duplicate-file example, why group files by size before hashing?",
          "options": [
            "Hashing is unreliable for files larger than available memory",
            "Files with a unique size cannot have an identical copy, so they never need to be read",
            "Files of equal size are almost always identical, so size is a cheap proxy",
            "Grouping by size keeps the output groups in a stable, sorted order"
          ],
          "answer": 1,
          "explain": "Different sizes imply different bytes, so unique sizes can be skipped. Equal size does not imply equal contents, which is why hashing is still needed."
        },
        {
          "q": "A binary search loop sets `lo = mid` when `items[mid] < target`. What is the most likely consequence?",
          "options": [
            "It returns the wrong index as soon as the target is found",
            "The invariant breaks, because the target can fall outside [lo, hi]",
            "The range can stop shrinking when hi = lo + 1, so the loop may never end",
            "It reads past the end of the list on the first iteration"
          ],
          "answer": 2,
          "explain": "The invariant (target in range) still holds, but with lo = mid the range may not shrink when hi = lo + 1, giving an infinite loop. Correctness and termination are separate checks."
        },
        {
          "q": "Which decomposition of 'process uploaded CSV and email a summary' has the best testable boundaries?",
          "options": [
            "Frontend, backend and database layers, each owned by one person on the team",
            "Parse rows, validate them, compute the summary, then render and send the email",
            "A single long function with clear comments marking each step of the work",
            "One piece per engineer, split by how many people happen to be free this week"
          ],
          "answer": 1,
          "explain": "Each stage has a clear input and output and can be tested without the others. Splitting by stack or by headcount does not decompose the problem, and one commented function cannot be tested in parts."
        },
        {
          "q": "What is the main purpose of listing edge cases while designing, rather than after coding?",
          "options": [
            "It makes the final code shorter and easier to read",
            "It helps you pick the fastest language for the job",
            "Edge cases only affect tests, so listing them early mainly saves test time",
            "Decisions such as skipping, failing or reporting bad input can change interfaces and data flow"
          ],
          "answer": 3,
          "explain": "Edge-case decisions (skip, fail, report) often shape the interfaces and data flow. Discovering them late forces rework."
        },
        {
          "q": "A report pipeline must ingest three vendor feeds, normalise them, score accounts and render PDFs. Two weeks of design docs later, nobody can say how the stages will fit together. Which approach fits best?",
          "options": [
            "Write a complete spec for every stage first, then code each stage in order",
            "Fully polish the ingestion stage before you touch any of the next stages",
            "Build a crude end-to-end slice on real data, then deepen each stage",
            "Split by tech layer and let each person build their own layer alone"
          ],
          "answer": 2,
          "explain": "A thin slice from real input to real output surfaces integration problems early. Specs written in isolation tend to miss how stages actually fit, and layer splits hide the data flow."
        }
      ]
    },
    {
      "id": "abstraction",
      "title": "Abstraction & Modeling",
      "minutes": 9,
      "summary": "Choose what to represent, hide the rest behind interfaces, and know when abstractions leak.",
      "lesson": [
        {
          "type": "p",
          "text": "Every program is a model of something: a bank balance, a game world, a chat conversation. A model keeps the details that matter and drops the ones that do not. Abstraction is the skill of choosing which is which, and it is where most design quality is won or lost."
        },
        {
          "type": "h",
          "text": "Modeling: choosing a representation"
        },
        {
          "type": "p",
          "text": "The first decision in any feature is how to represent the data, because the representation determines which operations are easy and which are painful. A calendar can be a list of events, a map from date to events, or an interval tree. All describe the same reality, but 'what is free at 3pm?' is trivial in one and a full scan in another."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# Representation A: a bare number. Which currency? Which unit?\nprice = 1999\n\n# Representation B: the model says what the number means\nclass Money:\n    def __init__(self, minor_units, currency):\n        self.minor_units = minor_units   # integer cents, never floats\n        self.currency = currency\n    def __add__(self, other):\n        assert self.currency == other.currency\n        return Money(self.minor_units + other.minor_units, self.currency)"
        },
        {
          "type": "p",
          "text": "Representation B makes illegal states harder to express: you cannot silently add dollars to euros. A useful guideline is to **make invalid states unrepresentable**. If a user is either anonymous or logged in, a single `user` object with a nullable `email` and a boolean `is_logged_in` allows contradictory combinations; two distinct types do not."
        },
        {
          "type": "h",
          "text": "Interface versus implementation"
        },
        {
          "type": "p",
          "text": "An **interface** is what callers may rely on; the **implementation** is how it is done today. A good abstraction lets you change the second without touching callers. A `Cache` that offers `get(key)` and `put(key, value)` can be backed by a dictionary now and Redis later, provided the contract (including failure behaviour and expiry) is stated and nothing outside it is depended upon."
        },
        {
          "type": "figure",
          "id": "think-cache-swap",
          "caption": "The implementation behind the interface changes from a dictionary to Redis; the caller's code does not.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"A caller uses cache.get and cache.put through the Cache interface. Below the interface the implementation switches between an in-memory dictionary and Redis while the caller code stays the same.\"> <style> .think-cache-swap-t{font-size:13px;fill:var(--fig-ink)} .think-cache-swap-m{font-size:12px;fill:var(--fig-muted)} .think-cache-swap-c{font-size:14px;fill:var(--fig-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace} .think-cache-swap-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .think-cache-swap-if{fill:var(--fig-accent);fill-opacity:.1;stroke:var(--fig-accent);stroke-width:2} .think-cache-swap-imp{fill:var(--fig-accent2);fill-opacity:.1;stroke:var(--fig-accent2);stroke-width:1.5} .think-cache-swap-ln{stroke:var(--fig-line);stroke-width:1.5} .think-cache-swap-ok{font-size:13px;fill:var(--fig-ok)} .think-cache-swap-a2{font-size:13px;fill:var(--fig-accent2)} .think-cache-swap-dot{fill:var(--fig-accent);animation:think-cache-swap-mv 3s ease-in-out infinite} .think-cache-swap-A{animation:think-cache-swap-fa 6s infinite} .think-cache-swap-B{opacity:0;animation:think-cache-swap-fb 6s infinite} @keyframes think-cache-swap-mv{0%,8%{transform:translateY(0)}42%,58%{transform:translateY(102px)}92%,100%{transform:translateY(0)}} @keyframes think-cache-swap-fa{0%,44%{opacity:1}50%,94%{opacity:0}100%{opacity:1}} @keyframes think-cache-swap-fb{0%,44%{opacity:0}50%,94%{opacity:1}100%{opacity:0}} </style> <text x=\"16\" y=\"62\" class=\"think-cache-swap-m\">callers rely on</text> <rect x=\"170\" y=\"20\" width=\"300\" height=\"76\" rx=\"12\" class=\"think-cache-swap-box\"/> <text x=\"186\" y=\"40\" class=\"think-cache-swap-m\">caller</text> <text x=\"186\" y=\"62\" class=\"think-cache-swap-c\">cache.get(key)</text> <text x=\"186\" y=\"84\" class=\"think-cache-swap-c\">cache.put(key, value)</text> <text x=\"486\" y=\"62\" class=\"think-cache-swap-ok\">unchanged</text> <line x1=\"320\" y1=\"96\" x2=\"320\" y2=\"128\" class=\"think-cache-swap-ln\"/> <rect x=\"60\" y=\"128\" width=\"520\" height=\"44\" rx=\"12\" class=\"think-cache-swap-if\"/> <text x=\"320\" y=\"155\" text-anchor=\"middle\" class=\"think-cache-swap-t\">Cache interface: get, put, expiry, failure behaviour</text> <line x1=\"320\" y1=\"172\" x2=\"320\" y2=\"204\" class=\"think-cache-swap-ln\"/> <text x=\"16\" y=\"241\" class=\"think-cache-swap-m\">how it is done</text> <g class=\"think-cache-swap-A\"><rect x=\"170\" y=\"204\" width=\"300\" height=\"66\" rx=\"12\" class=\"think-cache-swap-imp\"/><text x=\"186\" y=\"230\" class=\"think-cache-swap-t\">dictionary in memory</text><text x=\"186\" y=\"252\" class=\"think-cache-swap-m\">today</text></g> <g class=\"think-cache-swap-B\"><rect x=\"170\" y=\"204\" width=\"300\" height=\"66\" rx=\"12\" class=\"think-cache-swap-imp\"/><text x=\"186\" y=\"230\" class=\"think-cache-swap-t\">Redis over the network</text><text x=\"186\" y=\"252\" class=\"think-cache-swap-m\">later</text></g> <text x=\"486\" y=\"241\" class=\"think-cache-swap-a2\">swappable</text> <circle cx=\"320\" cy=\"100\" r=\"5\" class=\"think-cache-swap-dot\"/> </svg>"
        },
        {
          "type": "code",
          "lang": "ts",
          "text": "interface Clock { now(): Date }\n\nclass SystemClock implements Clock { now() { return new Date(); } }\nclass FakeClock implements Clock {\n  constructor(private t: Date) {}\n  now() { return this.t; }\n}\n\n// Business logic depends on the interface, so tests can control time.\nfunction isExpired(token: { expiresAt: Date }, clock: Clock) {\n  return clock.now() > token.expiresAt;\n}"
        },
        {
          "type": "p",
          "text": "The width of an interface matters. A small interface with deep behaviour behind it (a `sort` function) hides a lot of complexity per concept the caller must learn. A wide interface that mirrors its implementation (twenty getters and setters) hides nothing and merely adds a layer to read."
        },
        {
          "type": "h",
          "text": "Leaky abstractions"
        },
        {
          "type": "p",
          "text": "Joel Spolsky's law says all non-trivial abstractions leak: details of the layer beneath surface through. An ORM lets you treat rows as objects until a loop over 1,000 objects triggers 1,000 queries (the N+1 problem). A network filesystem looks like a local one until the connection drops. TCP promises reliable streams, yet you still deal with timeouts. The abstraction is not bad; you simply need to know one layer down when performance, failure or security is at stake."
        },
        {
          "type": "list",
          "items": [
            "**Premature abstraction**: building a flexible framework after seeing one use case. Wait for roughly three real examples so you can see what actually varies.",
            "**Wrong abstraction**: duplicated code merged under a shared function that gains boolean flags until nobody can follow it. Duplication is cheaper than the wrong abstraction.",
            "**Abstraction by indirection**: wrapping something in a layer that adds names but no hiding.",
            "**Ignoring the boundary**: reaching into another module's internals because it is convenient today."
          ]
        },
        {
          "type": "h",
          "text": "How to evaluate an abstraction"
        },
        {
          "type": "list",
          "items": [
            "Can I state what it does without describing how?",
            "If I rewrote the inside, would callers need to change?",
            "What does it do on failure, and is that in the contract?",
            "Does it make the common case simple and the rare case possible?"
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents love to add layers: factories, base classes, wrappers and config options 'for flexibility'. Ask for the simplest model that fits the current requirement, and reject abstractions with only one implementation and no stated reason. Also state the interface you want preserved, because an agent fixing a bug will happily change a public signature or reach through a boundary if that is the shortest edit."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "When a function signature takes three booleans, you are probably missing a type in your model."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A bare number like `price = 1999` travels through the code and nobody can say its unit or currency without reading the source",
              "use": "Value object (Money, Duration, Distance)",
              "why": "A small type carries meaning and rejects nonsense like adding dollars to euros. Costs a little ceremony; skip it for purely local, short-lived values."
            },
            {
              "signal": "Fields can disagree with each other, e.g. `isLoggedIn == false` while `email` is set",
              "use": "Make invalid states unrepresentable",
              "why": "Model distinct states as distinct types (Anonymous or LoggedIn) so the contradiction cannot be built. Removes defensive checks everywhere, but changing states needs more types."
            },
            {
              "signal": "A function signature takes two or three booleans and call sites read like `render(true, false, true)`",
              "use": "Replace flag arguments with a type",
              "why": "Booleans usually hide a missing concept: an enum, an options object or separate functions. Call sites become self-explaining and impossible combinations become visible."
            },
            {
              "signal": "The data supports the feature, but every common operation needs a scan or awkward conversion",
              "use": "Choose representation by dominant operation",
              "why": "A list, a map from date to events and an interval tree describe the same calendar but make different queries cheap. Pick for the frequent queries, not for the first one written."
            },
            {
              "signal": "Logic calls `new Date()`, randomness or the network directly, so tests are slow, flaky or impossible",
              "use": "Inject a seam (fake clock, fake gateway)",
              "why": "Depend on a narrow `Clock` interface and pass a `FakeClock` in tests. Adds one parameter or constructor argument; do not add seams where no test or swap needs them."
            },
            {
              "signal": "You expect to swap a backend (in-memory dict now, Redis later) and callers are spread across the codebase",
              "use": "Depend on the interface, not the implementation",
              "why": "If callers only use `get` and `put`, the swap touches one class. State failure behaviour (miss, timeout) in the contract or the new backend will surprise callers."
            },
            {
              "signal": "A class exposes a getter and setter for every field and callers still do all the real work",
              "use": "Deep module: small interface, rich behaviour",
              "why": "An abstraction earns its keep by hiding complexity per concept learned, like `sort`. A wide interface mirroring internals hides nothing and freezes the implementation."
            },
            {
              "signal": "After one use case, someone proposes a generic plugin framework 'for flexibility'",
              "use": "Rule of three (wait for real variation)",
              "why": "With about three real examples you can see what actually varies. Building early guesses the axis of change and usually guesses wrong; only one-way-door APIs justify earlier design."
            },
            {
              "signal": "A shared helper keeps gaining boolean parameters and `if` branches, one per caller",
              "use": "Inline the wrong abstraction, then re-extract",
              "why": "Duplication is cheaper than the wrong abstraction. Copy the code back into callers, delete unused branches, and extract again once the real common part is clear."
            },
            {
              "signal": "An ORM page is slow; logs show one query per row when looping and touching `order.customer`",
              "use": "Learn one layer down (fix the N+1 query)",
              "why": "The object abstraction leaked: each lazy access is a round trip. Use eager loading or one batched query; it may load more data than needed, so measure."
            },
            {
              "signal": "A wrapper class just forwards every call to the thing it wraps and renames the methods",
              "use": "Remove the pass-through layer",
              "why": "Indirection without hiding adds names to learn and code to keep in sync. Keep a wrapper only when it narrows the interface, adapts a mismatch or isolates a vendor."
            },
            {
              "signal": "Callers wrap a function in try/except or null checks because nobody knows what it does when things fail",
              "use": "Put failure modes in the contract",
              "why": "Document or type what happens on missing data, timeout or bad input (return value, error type, retry). Callers can then handle failure once, correctly, instead of guessing."
            }
          ]
        }
      ],
      "keyPoints": [
        "A model keeps what matters and drops what does not; representation decides which operations are easy.",
        "Prefer representations where invalid states cannot be expressed.",
        "Depend on interfaces, not implementations, and state failure behaviour in the contract.",
        "All non-trivial abstractions leak; learn one layer below where performance or failure matters.",
        "Wait for real variation before abstracting; the wrong abstraction costs more than duplication."
      ],
      "quiz": [
        {
          "q": "A `User` object has `email: string | null` and `isLoggedIn: boolean`. Which design best follows 'make invalid states unrepresentable'?",
          "options": [
            "Throw in the constructor when isLoggedIn is true and email is null",
            "Document the allowed field combinations in a comment on the class",
            "Use separate AnonymousUser and LoggedInUser types, where only the latter has an email",
            "Rename the fields so the valid combinations are more obvious"
          ],
          "answer": 2,
          "explain": "Separate types make the contradictory combination impossible to construct, while validation and comments only detect or describe it later."
        },
        {
          "q": "Your service calls `cache.get(key)` everywhere. You want to swap an in-memory dict for Redis. What makes this safe?",
          "options": [
            "Callers rely only on the documented interface, including miss behaviour",
            "Redis is faster than an in-process dictionary for every single lookup",
            "The class is renamed so that every caller notices the new backend",
            "Callers are updated to import the Redis client directly where needed"
          ],
          "answer": 0,
          "explain": "A swap is safe only when callers rely on the contract and nothing else. Failure semantics (timeouts, misses) matter since Redis introduces failures a dict did not have; it is also slower per lookup than an in-process dict."
        },
        {
          "q": "An ORM-based page loads slowly: the code loops over 500 orders and accesses `order.customer.name` in each iteration, issuing hundreds of queries. This is best described as:",
          "options": [
            "A bug in the database engine's query planner",
            "An unavoidable cost of using objects, so nothing can be done",
            "A limitation of the programming language's object model",
            "A leaky abstraction: the row-as-object illusion hides one query per access"
          ],
          "answer": 3,
          "explain": "The abstraction promises plain objects but the query behind each attribute leaks through. The fix requires knowing the layer below (eager loading or a join)."
        },
        {
          "q": "You have seen one use case for sending notifications (email). A teammate proposes a generic plugin framework for notification channels. What is the most defensible response?",
          "options": [
            "Build the plugin framework now so adding channels later needs no rewrite",
            "Implement email directly, and generalise once more channels show what varies",
            "Build the framework but ship only the email plugin for now",
            "Copy the email code into SMS, push and Slack senders right away"
          ],
          "answer": 1,
          "explain": "With one example you are guessing what varies, and early abstraction often encodes the wrong axis. Copying code for channels nobody has asked for builds for needs that do not exist yet."
        },
        {
          "q": "Which interface hides the most complexity relative to what the caller must learn?",
          "options": [
            "An object exposing a getter and setter for every internal field",
            "A `Parser` exposing `tokenize`, `buildTree`, `resolveNames` and `emit`, called in order",
            "A single `compile(source)` function that returns bytecode",
            "A base class with many hooks that subclasses must override"
          ],
          "answer": 2,
          "explain": "A small interface with deep behaviour hides internal stages. The staged API exposes the implementation steps and forces callers to know the sequence."
        },
        {
          "q": "Reviewers keep asking which flag is which in calls like `export(report, true, false, true)`, and someone now wants a fourth boolean. What should you reach for?",
          "options": [
            "Replace the booleans with a named options type or enum",
            "Add the fourth boolean at the end so existing calls still compile fine",
            "Document the argument order in the docstring, keep the signature",
            "Wrap `export` in a helper class that forwards every call as is"
          ],
          "answer": 0,
          "explain": "Flag arguments usually hide a missing concept, and a named type makes call sites self-explaining. A docstring does not fix the call site, and a pass-through wrapper adds a layer without hiding anything."
        }
      ]
    },
    {
      "id": "debugging",
      "title": "The Debugging Mindset",
      "minutes": 10,
      "summary": "Treat bugs as experiments: reproduce, isolate, form hypotheses, then fix the cause.",
      "lesson": [
        {
          "type": "p",
          "text": "A checkout page intermittently shows the wrong total. The tempting response is to change something that looks suspicious and see if it goes away. That is guessing, and it fails in a predictable way: the symptom disappears for a while, the cause remains, and you have added a change nobody understands. Debugging is faster and more reliable when you treat it as a science."
        },
        {
          "type": "h",
          "text": "The scientific loop"
        },
        {
          "type": "list",
          "items": [
            "**Observe**: collect facts (exact error, inputs, environment, time of first occurrence), not interpretations.",
            "**Hypothesize**: propose a specific, falsifiable explanation. 'The cart total is computed before the discount is applied' is testable; 'something is off with discounts' is not.",
            "**Predict**: if the hypothesis is true, what else must be true? What would you see in logs or at a breakpoint?",
            "**Experiment**: run the cheapest test that could prove the hypothesis wrong.",
            "**Conclude and repeat**: keep or discard the hypothesis and move on."
          ]
        },
        {
          "type": "h",
          "text": "Reproduce, isolate, fix"
        },
        {
          "type": "p",
          "text": "**Reproduce** first. A bug you can trigger on demand can be investigated; one you cannot is a rumour. Aim for the smallest reliable reproduction: a failing test, a script, or a command. If it is intermittent, the intermittency is itself a clue (timing, concurrency, caching, randomness, time of day, data-dependent)."
        },
        {
          "type": "p",
          "text": "**Isolate** by shrinking the problem. Remove inputs, features and code until the bug still occurs but nothing unnecessary remains. The smaller the case, the fewer places the bug can hide. Then **fix the cause, not the symptom**, and finish by adding a test that fails before the fix and passes after, so the bug cannot quietly return."
        },
        {
          "type": "h",
          "text": "Bisecting: binary search for the culprit"
        },
        {
          "type": "p",
          "text": "When something worked last week and is broken now, the cause is in a finite set of changes. `git bisect` does a binary search over commit history: with 1,000 commits you need only about 10 test runs. The same idea works for inputs (halve the failing data file), configuration (disable half the flags) and code (comment out half the pipeline)."
        },
        {
          "type": "figure",
          "id": "think-bisect",
          "caption": "Each test halves the suspect range, so 1,000 commits take only 10 runs to pin down the first bad one.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"git bisect over 1,000 commits between v2.3.0 (good) and HEAD (bad). Each test halves the range; after 10 tests only commit 637, the first bad commit, remains.\"> <style> .think-bisect-t{font-size:13px;fill:var(--fig-ink)} .think-bisect-m{font-size:11px;fill:var(--fig-muted)} .think-bisect-rg{fill:var(--fig-accent);fill-opacity:.25} .think-bisect-gd{fill:var(--fig-ok)}.think-bisect-bd{fill:var(--fig-bad)} .think-bisect-gt{font-size:13px;fill:var(--fig-ok)}.think-bisect-bt{font-size:13px;fill:var(--fig-bad)} .think-bisect-cl{stroke:var(--fig-bad);stroke-width:1.5;stroke-dasharray:4 4} .think-bisect-ax{stroke:var(--fig-line);stroke-width:1.5} .think-bisect-band{fill:var(--fig-accent);fill-opacity:.08;animation:think-bisect-s 8s steps(10,end) infinite} @keyframes think-bisect-s{from{transform:translateY(0)}to{transform:translateY(220px)}} </style> <rect x=\"10\" y=\"69\" width=\"620\" height=\"22\" rx=\"8\" class=\"think-bisect-band\"/> <text x=\"62\" y=\"34\" class=\"think-bisect-gt\">v2.3.0 good</text> <text x=\"287\" y=\"34\" text-anchor=\"middle\" class=\"think-bisect-m\" style=\"font-size:12px\">1,000 commits</text> <text x=\"512\" y=\"34\" text-anchor=\"end\" class=\"think-bisect-bt\">HEAD bad</text> <line x1=\"62\" y1=\"46\" x2=\"512\" y2=\"46\" class=\"think-bisect-ax\"/> <text x=\"16\" y=\"62\" class=\"think-bisect-m\">left</text><text x=\"528\" y=\"62\" class=\"think-bisect-m\">test</text> <line x1=\"348.65\" y1=\"50\" x2=\"348.65\" y2=\"292\" class=\"think-bisect-cl\"/> <text x=\"52\" y=\"84\" text-anchor=\"end\" class=\"think-bisect-m\">1000</text><rect x=\"62\" y=\"76\" width=\"450\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"287\" cy=\"80\" r=\"4\" class=\"think-bisect-gd\"/><text x=\"528\" y=\"84.5\" class=\"think-bisect-gt\">500 good</text> <text x=\"52\" y=\"106\" text-anchor=\"end\" class=\"think-bisect-m\">500</text><rect x=\"287\" y=\"98\" width=\"225\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"399.5\" cy=\"102\" r=\"4\" class=\"think-bisect-bd\"/><text x=\"528\" y=\"106.5\" class=\"think-bisect-bt\">750 bad</text> <text x=\"52\" y=\"128\" text-anchor=\"end\" class=\"think-bisect-m\">250</text><rect x=\"287\" y=\"120\" width=\"112.5\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"343.25\" cy=\"124\" r=\"4\" class=\"think-bisect-gd\"/><text x=\"528\" y=\"128.5\" class=\"think-bisect-gt\">625 good</text> <text x=\"52\" y=\"150\" text-anchor=\"end\" class=\"think-bisect-m\">125</text><rect x=\"343.25\" y=\"142\" width=\"56.25\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"371.15\" cy=\"146\" r=\"4\" class=\"think-bisect-bd\"/><text x=\"528\" y=\"150.5\" class=\"think-bisect-bt\">687 bad</text> <text x=\"52\" y=\"172\" text-anchor=\"end\" class=\"think-bisect-m\">62</text><rect x=\"343.25\" y=\"164\" width=\"27.9\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"357.2\" cy=\"168\" r=\"4\" class=\"think-bisect-bd\"/><text x=\"528\" y=\"172.5\" class=\"think-bisect-bt\">656 bad</text> <text x=\"52\" y=\"194\" text-anchor=\"end\" class=\"think-bisect-m\">31</text><rect x=\"343.25\" y=\"186\" width=\"13.95\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"350\" cy=\"190\" r=\"4\" class=\"think-bisect-bd\"/><text x=\"528\" y=\"194.5\" class=\"think-bisect-bt\">640 bad</text> <text x=\"52\" y=\"216\" text-anchor=\"end\" class=\"think-bisect-m\">15</text><rect x=\"343.25\" y=\"208\" width=\"6.75\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"346.4\" cy=\"212\" r=\"4\" class=\"think-bisect-gd\"/><text x=\"528\" y=\"216.5\" class=\"think-bisect-gt\">632 good</text> <text x=\"52\" y=\"238\" text-anchor=\"end\" class=\"think-bisect-m\">8</text><rect x=\"346.4\" y=\"230\" width=\"3.6\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"348.2\" cy=\"234\" r=\"4\" class=\"think-bisect-gd\"/><text x=\"528\" y=\"238.5\" class=\"think-bisect-gt\">636 good</text> <text x=\"52\" y=\"260\" text-anchor=\"end\" class=\"think-bisect-m\">4</text><rect x=\"347.6\" y=\"252\" width=\"3\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"349.1\" cy=\"256\" r=\"4\" class=\"think-bisect-bd\"/><text x=\"528\" y=\"260.5\" class=\"think-bisect-bt\">638 bad</text> <text x=\"52\" y=\"282\" text-anchor=\"end\" class=\"think-bisect-m\">2</text><rect x=\"347.15\" y=\"274\" width=\"3\" height=\"8\" rx=\"3\" class=\"think-bisect-rg\"/><circle cx=\"348.65\" cy=\"278\" r=\"4\" class=\"think-bisect-bd\"/><text x=\"528\" y=\"282.5\" class=\"think-bisect-bt\">637 bad</text> <text x=\"348.65\" y=\"312\" text-anchor=\"middle\" class=\"think-bisect-bt\">637: first bad commit</text> <text x=\"528\" y=\"312\" class=\"think-bisect-t\">10 tests</text> </svg>"
        },
        {
          "type": "code",
          "lang": "bash",
          "text": "git bisect start\ngit bisect bad HEAD            # current state is broken\ngit bisect good v2.3.0        # this release was fine\n# git checks out a midpoint; run your repro, then mark it:\ngit bisect good   # or: git bisect bad\n# ...repeat until git names the first bad commit\ngit bisect reset\n\n# Or automate it with a script that exits 0 for good, non-zero for bad:\ngit bisect run ./repro.sh"
        },
        {
          "type": "h",
          "text": "Reading stack traces"
        },
        {
          "type": "p",
          "text": "A stack trace lists the chain of calls active when the error occurred. Read the message and exception type first, then find the innermost frame in your own code (not in a library); that is usually where the bad value was used, though not necessarily where it was created. Frame order depends on the language: Python prints the most recent call last, so the innermost frame is at the bottom, while Java, C# and JavaScript print it first. Then walk outward through the callers to see how that value arrived."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Traceback (most recent call last):\n  File \"checkout.py\", line 42, in handle_order\n    total = compute_total(cart)\n  File \"pricing.py\", line 17, in compute_total\n    return sum(i.price * i.qty for i in cart.items)\nTypeError: unsupported operand type(s) for *: 'NoneType' and 'int'"
        },
        {
          "type": "p",
          "text": "The error is at `pricing.py` line 17, where `i.price` is `None`. The question to ask next is not 'how do I guard against None here?' but 'how did an item with no price get into the cart?' The defect usually lives upstream of the crash."
        },
        {
          "type": "h",
          "text": "Rubber ducking and other mental tools"
        },
        {
          "type": "p",
          "text": "Explaining the problem aloud, to a colleague or a rubber duck, forces you to state assumptions in order, and the false one often reveals itself mid-sentence. Writing the bug report as if for someone else achieves the same effect. Other habits: change one thing at a time, keep notes of what you tried, question every 'it can't be that', and verify the assumption you are most sure about, since certainty is where bugs hide."
        },
        {
          "type": "h",
          "text": "Common pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Shotgun debugging: changing several things at once so you cannot tell which mattered.",
            "Fixing the symptom with a null check or a retry and moving on.",
            "Trusting a log message over the actual behaviour; print statements can lie when they describe what you intended.",
            "Declaring victory after a single passing run of an intermittent bug."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Give an agent evidence, not conclusions: the exact error, the stack trace, a reproduction command and what you already ruled out. Ask it for hypotheses and the experiment that would distinguish them before it edits anything. Agents frequently patch the symptom (adding a try/catch or a None check) and report the bug fixed; require a failing test first and a root-cause explanation, and re-run the repro yourself."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "It worked at a known release and fails at HEAD, with many commits in between",
              "use": "git bisect (binary search history)",
              "why": "Each test halves the suspect range, so 1,000 commits need about 10 runs. Needs a reliable, scripted repro; `git bisect run` automates it. Flaky tests mislead it."
            },
            {
              "signal": "A large input file, config or scene triggers the bug, but you cannot tell which part matters",
              "use": "Minimise the repro (delta debugging)",
              "why": "Repeatedly halve the input and keep whichever half still fails. A tiny case leaves few places for the bug to hide and becomes your regression test."
            },
            {
              "signal": "The bug shows up in about 1 run in 20 and vanishes when you look",
              "use": "Make it reproducible before fixing",
              "why": "Loop the test, fix seeds, vary timing or load until it fails on demand. Intermittency points at concurrency, ordering or environment; one green run proves nothing."
            },
            {
              "signal": "Bad data enters a long pipeline and comes out wrong, and you do not know which stage corrupts it",
              "use": "Bisect the data path (wolf fence)",
              "why": "Check or assert the value at the midpoint stage, then halve again on the side that is already wrong. Finds the stage in log steps instead of reading every stage."
            },
            {
              "signal": "A long stack trace mixes framework and library frames with a few of your own",
              "use": "Read the message, then the innermost own frame",
              "why": "The exception type and message say what went wrong; the deepest frame in your code shows where the bad value was used. Library frames are rarely where the defect is."
            },
            {
              "signal": "A crash on `None` or null happens deep in a calculation, and the obvious patch is a null check right there",
              "use": "Trace the bad value upstream",
              "why": "Ask how a priceless item reached the cart, not how to survive it. A guard at the crash site hides the defect and lets bad data spread further."
            },
            {
              "signal": "You suspect a cause ('the cache is stale') and are about to change code to see if the symptom goes away",
              "use": "Predict, then run the falsifying experiment",
              "why": "Say what else must be true if the hypothesis holds (e.g. cache key and timestamp in logs) and run the cheapest test that could prove it wrong. Guess-and-patch leaves the cause."
            },
            {
              "signal": "You changed several suspicious things at once and the bug went away",
              "use": "Change one variable at a time",
              "why": "With several edits you cannot tell which mattered, and the others may hide a second bug. Revert, then reapply one change per run. Slower per step, far faster overall."
            },
            {
              "signal": "It works on your machine and fails in CI, staging or on a colleague's setup",
              "use": "Diff the environments",
              "why": "List versions, env vars, config, data and OS between the good and bad setups, then bisect the differences. Assumptions about 'identical' environments are often wrong."
            },
            {
              "signal": "Logs say a step ran correctly, yet the observed behaviour contradicts them",
              "use": "Observe ground truth (breakpoint, assert)",
              "why": "Log lines describe what the author intended and can be stale or misplaced. Inspect the actual value at runtime; trust behaviour over messages."
            },
            {
              "signal": "You have stared at the same code for an hour and every assumption still seems fine",
              "use": "Rubber duck (explain it step by step)",
              "why": "Stating each assumption in order, aloud or in a written bug report, often exposes the false one mid-sentence. Costs minutes; also makes a ready-made handoff if you need help."
            },
            {
              "signal": "You found the cause and are about to commit the fix",
              "use": "Failing regression test first",
              "why": "Write a test that fails before the fix and passes after. It proves you fixed this cause and stops the bug returning; skipping it leaves the fix unverified."
            }
          ]
        }
      ],
      "keyPoints": [
        "Debugging is hypothesis testing: observe, hypothesise, predict, experiment.",
        "Reproduce reliably, shrink the case, fix the cause, and add a regression test.",
        "Bisection over commits, inputs or config finds a culprit in logarithmic steps.",
        "In a stack trace, find the innermost frame in your own code, then trace the bad value upstream to where it originated."
      ],
      "quiz": [
        {
          "q": "A bug appears in about 1 of 20 test runs. What is the best first step?",
          "options": [
            "Wrap the failing call in retries so the suite stays green",
            "Mark the test as flaky and revisit it next sprint",
            "Rewrite the module, since intermittent bugs signal bad design",
            "Make it reproduce reliably, treating timing, ordering or shared state as clues"
          ],
          "answer": 3,
          "explain": "A bug cannot be fixed with confidence until it can be reproduced. Retrying or ignoring hides it rather than explaining it."
        },
        {
          "q": "A stack trace shows a `NoneType` error at `pricing.py` line 17 when multiplying an item price. Which action best addresses the root cause?",
          "options": [
            "Wrap the line in try/except and return 0 for that item",
            "Add `if price is None: price = 0` before the multiplication",
            "Find where an item without a price entered the cart",
            "Cast `i.price` to int so the multiplication always succeeds"
          ],
          "answer": 2,
          "explain": "The crash site is where the bad value was used, not where it was created. Silencing it there hides corrupt data further downstream."
        },
        {
          "q": "The app worked at release v2.3 and fails at HEAD, 512 commits later. About how many test runs does `git bisect` need to find the first bad commit?",
          "options": [
            "About 512",
            "About 9",
            "About 50",
            "Exactly 2"
          ],
          "answer": 1,
          "explain": "Binary search halves the range each step: log2(512) = 9. Testing commits one by one would be linear."
        },
        {
          "q": "You believe a cache is serving stale data. Which step best follows the scientific method?",
          "options": [
            "Predict that bypassing the cache removes the stale value, then try only that",
            "Clear the cache and the database, then restart every service",
            "Disable several components at once to see if the problem goes away",
            "Assume it is the cache and rewrite the caching layer from scratch"
          ],
          "answer": 0,
          "explain": "A single change with a stated prediction can falsify the hypothesis. Changing many things at once, or acting without testing, teaches you nothing about the cause."
        },
        {
          "q": "After fixing a bug, what makes the fix durable?",
          "options": [
            "A code comment next to the fix explaining what went wrong",
            "Closing the ticket with a link to the fixing commit",
            "A regression test that fails without the fix and passes with it",
            "Restarting the service and confirming the error is gone"
          ],
          "answer": 2,
          "explain": "An automated test encodes the failure so it cannot return silently. A comment or a one-time manual check does not protect against regressions."
        },
        {
          "q": "A 40 MB scene file crashes the importer, and each failing run takes three minutes. Nobody can tell which part of the file matters. What should you do first?",
          "options": [
            "Run `git bisect` across the last releases of the importer code",
            "Add a null check at the exact line the stack trace points to",
            "Re-run the whole file with extra logging until the cause shows up",
            "Halve the file repeatedly, keeping whichever half still crashes"
          ],
          "answer": 3,
          "explain": "Halving the input leaves a small repro with few places for the bug to hide, and it becomes the regression test. `git bisect` searches history, not input, and a guard at the crash line hides the defect."
        }
      ]
    },
    {
      "id": "tradeoffs",
      "title": "Tradeoffs & Estimation",
      "minutes": 10,
      "summary": "Every choice costs something; use rough numbers and reversibility to decide quickly.",
      "lesson": [
        {
          "type": "p",
          "text": "Should the team add a cache, move to microservices, or store images in the database? Questions like these have no universally right answer, only answers that fit particular constraints. Senior engineering judgement is largely the ability to name what each option costs and to estimate those costs quickly and approximately."
        },
        {
          "type": "h",
          "text": "No free lunch"
        },
        {
          "type": "p",
          "text": "Every design buys something with something else. A cache buys speed with staleness and complexity. Replication buys availability with consistency questions. Strong typing buys earlier error detection with upfront ceremony. Denormalised data buys read speed with write complexity. When someone describes an option with only benefits, they have not finished analysing it. A habit worth building: for each proposal, write down what it makes worse."
        },
        {
          "type": "list",
          "items": [
            "**Latency vs throughput**: batching raises throughput and increases per-item latency.",
            "**Consistency vs availability**: during a network partition you cannot guarantee both.",
            "**Space vs time**: precomputed tables and indexes use memory and disk to save computation.",
            "**Flexibility vs simplicity**: configurability is code that must be tested and understood.",
            "**Build vs buy**: buying costs money and control; building costs time and ongoing maintenance."
          ]
        },
        {
          "type": "h",
          "text": "Back-of-the-envelope estimation"
        },
        {
          "type": "p",
          "text": "Before building, a ten-minute calculation can eliminate whole designs. The aim is the right order of magnitude (10x), not precision. Round aggressively, write units, and sanity-check the result. Example: storing profile photos for 5 million users at 2 MB each is 5M x 2 MB = 10 TB. That is trivial for object storage and absurd for a relational database. A day has roughly 100,000 seconds (86,400), so 1 million requests per day is about 10 requests per second on average; peaks are perhaps 3-10 times that."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Feed service: 20M daily users, each opens the feed 10x/day\n  requests/day  = 20M x 10 = 200M\n  average QPS   = 200M / 100k s = ~2,000/s\n  peak (x5)     = ~10,000/s\n  one server handles ~1,000/s of simple reads  ->  ~10 servers at peak, plus headroom\nConclusion: no exotic architecture needed; caching is a cost optimisation, not a necessity."
        },
        {
          "type": "h",
          "text": "Latency numbers worth knowing"
        },
        {
          "type": "p",
          "text": "These are approximate and drift with hardware, but the ratios persist and are what matter. Moving down the list is a jump of orders of magnitude, which is why where your data lives dominates performance."
        },
        {
          "type": "list",
          "items": [
            "CPU cache or L1 reference: about 1 ns",
            "Main memory reference: about 100 ns",
            "Read 1 MB sequentially from memory: tens of microseconds",
            "SSD random read: roughly 20-100 microseconds (NVMe at the low end)",
            "Round trip within a datacentre: about 0.5 ms",
            "Read 1 MB sequentially from SSD: roughly 0.1-1 ms (modern NVMe at the low end)",
            "Disk seek on spinning disk: about 10 ms",
            "Network round trip across continents: about 100-150 ms"
          ]
        },
        {
          "type": "figure",
          "id": "think-latency-scale",
          "caption": "On a log scale each gridline is 10x: a datacentre round trip is thousands of memory references.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"Approximate latencies on a logarithmic scale from 1 nanosecond to 1 second: L1 cache 1 ns, memory 100 ns, datacentre round trip 0.5 ms, disk seek 10 ms, cross-continent round trip 100 to 150 ms.\"> <style> .think-latency-scale-t{font-size:13px;fill:var(--fig-ink)} .think-latency-scale-m{font-size:12px;fill:var(--fig-muted)} .think-latency-scale-v{font-size:12px;fill:var(--fig-muted);paint-order:stroke;stroke:var(--fig-bg);stroke-width:4px;stroke-linejoin:round} .think-latency-scale-g{stroke:var(--fig-line);stroke-width:1} .think-latency-scale-gm{stroke:var(--fig-muted);stroke-width:1.5} .think-latency-scale-b{fill:var(--fig-accent)} .think-latency-scale-n{fill:var(--fig-accent2)} .think-latency-scale-r{fill:var(--fig-accent);fill-opacity:.35} </style> <text x=\"210\" y=\"22\" class=\"think-latency-scale-m\">log scale: each gridline is 10× slower</text> <line x1=\"210\" y1=\"34\" x2=\"210\" y2=\"292\" class=\"think-latency-scale-g\"/> <line x1=\"245\" y1=\"34\" x2=\"245\" y2=\"292\" class=\"think-latency-scale-gm\"/> <line x1=\"280\" y1=\"34\" x2=\"280\" y2=\"292\" class=\"think-latency-scale-g\"/> <line x1=\"315\" y1=\"34\" x2=\"315\" y2=\"292\" class=\"think-latency-scale-g\"/> <line x1=\"350\" y1=\"34\" x2=\"350\" y2=\"292\" class=\"think-latency-scale-gm\"/> <line x1=\"385\" y1=\"34\" x2=\"385\" y2=\"292\" class=\"think-latency-scale-g\"/> <line x1=\"420\" y1=\"34\" x2=\"420\" y2=\"292\" class=\"think-latency-scale-g\"/> <line x1=\"455\" y1=\"34\" x2=\"455\" y2=\"292\" class=\"think-latency-scale-gm\"/> <line x1=\"490\" y1=\"34\" x2=\"490\" y2=\"292\" class=\"think-latency-scale-g\"/> <line x1=\"525\" y1=\"34\" x2=\"525\" y2=\"292\" class=\"think-latency-scale-g\"/> <line x1=\"560\" y1=\"34\" x2=\"560\" y2=\"292\" class=\"think-latency-scale-gm\"/> <text x=\"245\" y=\"312\" text-anchor=\"middle\" class=\"think-latency-scale-m\">1 ns</text> <text x=\"350\" y=\"312\" text-anchor=\"middle\" class=\"think-latency-scale-m\">1 µs</text> <text x=\"455\" y=\"312\" text-anchor=\"middle\" class=\"think-latency-scale-m\">1 ms</text> <text x=\"560\" y=\"312\" text-anchor=\"middle\" class=\"think-latency-scale-m\">1 s</text> <text x=\"16\" y=\"56.5\" class=\"think-latency-scale-t\">L1 cache reference</text><rect x=\"210\" y=\"45\" width=\"35\" height=\"14\" rx=\"4\" class=\"think-latency-scale-b\"/><text x=\"253\" y=\"56.5\" class=\"think-latency-scale-v\">1 ns</text> <text x=\"16\" y=\"88.5\" class=\"think-latency-scale-t\">Main memory reference</text><rect x=\"210\" y=\"77\" width=\"105\" height=\"14\" rx=\"4\" class=\"think-latency-scale-b\"/><text x=\"323\" y=\"88.5\" class=\"think-latency-scale-v\">100 ns</text> <text x=\"16\" y=\"120.5\" class=\"think-latency-scale-t\">Read 1 MB from memory</text><rect x=\"210\" y=\"109\" width=\"175\" height=\"14\" rx=\"4\" class=\"think-latency-scale-b\"/><rect x=\"381\" y=\"109\" width=\"28.46\" height=\"14\" rx=\"4\" class=\"think-latency-scale-r\"/><text x=\"417.46\" y=\"120.5\" class=\"think-latency-scale-v\">tens of µs</text> <text x=\"16\" y=\"152.5\" class=\"think-latency-scale-t\">SSD random read</text><rect x=\"210\" y=\"141\" width=\"185.54\" height=\"14\" rx=\"4\" class=\"think-latency-scale-b\"/><rect x=\"391.54\" y=\"141\" width=\"28.46\" height=\"14\" rx=\"4\" class=\"think-latency-scale-r\"/><text x=\"428\" y=\"152.5\" class=\"think-latency-scale-v\">20–100 µs</text> <text x=\"16\" y=\"184.5\" class=\"think-latency-scale-t\">Datacentre round trip</text><rect x=\"210\" y=\"173\" width=\"234.46\" height=\"14\" rx=\"4\" class=\"think-latency-scale-n\"/><text x=\"452.46\" y=\"184.5\" class=\"think-latency-scale-v\">0.5 ms</text> <text x=\"16\" y=\"216.5\" class=\"think-latency-scale-t\">Read 1 MB from SSD</text><rect x=\"210\" y=\"205\" width=\"210\" height=\"14\" rx=\"4\" class=\"think-latency-scale-b\"/><rect x=\"416\" y=\"205\" width=\"39\" height=\"14\" rx=\"4\" class=\"think-latency-scale-r\"/><text x=\"463\" y=\"216.5\" class=\"think-latency-scale-v\">0.1–1 ms</text> <text x=\"16\" y=\"248.5\" class=\"think-latency-scale-t\">Disk seek</text><rect x=\"210\" y=\"237\" width=\"280\" height=\"14\" rx=\"4\" class=\"think-latency-scale-b\"/><text x=\"498\" y=\"248.5\" class=\"think-latency-scale-v\">10 ms</text> <text x=\"16\" y=\"280.5\" class=\"think-latency-scale-t\">Cross-continent round trip</text><rect x=\"210\" y=\"269\" width=\"315\" height=\"14\" rx=\"4\" class=\"think-latency-scale-n\"/><rect x=\"521\" y=\"269\" width=\"10.16\" height=\"14\" rx=\"4\" class=\"think-latency-scale-r\"/><text x=\"539.16\" y=\"280.5\" class=\"think-latency-scale-v\">100–150 ms</text> </svg>"
        },
        {
          "type": "p",
          "text": "A practical consequence: a loop that makes one database call per item at 0.5 ms round trip costs 5 seconds for 10,000 items, while a single batched query takes tens of milliseconds. A memory reference is thousands of times faster than a datacentre network round trip, so the number of remote calls usually matters more than the cleverness of the code between them."
        },
        {
          "type": "h",
          "text": "Reversible vs irreversible decisions"
        },
        {
          "type": "p",
          "text": "Amazon describes decisions as one-way doors (hard or impossible to reverse) and two-way doors (cheap to undo). Choosing a library behind a thin interface is a two-way door; choosing a public API shape, a database schema with live data, a data-deletion policy or a vendor with proprietary data formats is closer to one-way. Spend analysis time in proportion to the cost of being wrong: decide two-way doors quickly and learn from the result, slow down for one-way doors, and where possible turn a one-way door into a two-way one (feature flags, gradual rollouts, expand-then-contract migrations)."
        },
        {
          "type": "h",
          "text": "Common pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Optimising without measuring: estimates select the design, measurements validate it.",
            "Estimating only the average and forgetting peaks and tail latency.",
            "Analysis paralysis on reversible choices.",
            "Treating a tradeoff as settled forever; the right answer changes with scale."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents will present one solution as if it were the only one, and rarely volunteer what it costs. Ask: 'give me two or three options, what each makes worse, and which decisions are hard to reverse.' Give your scale numbers explicitly (users, requests per second, data size), because without them an agent defaults to either toy-scale or internet-scale designs. Check its claims about performance with the rough numbers above."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Do not quote latency figures as exact facts in design reviews. Use them for ratios and to flag when a plan puts a network call inside a tight loop."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A proposal ('add a cache', 'go microservices') lists only benefits",
              "use": "Name what each option makes worse",
              "why": "Every option buys something with something else: a cache buys speed with staleness and invalidation work. Ask for 2-3 options with their costs before choosing."
            },
            {
              "signal": "Someone asks whether a design can handle the load and there are no numbers yet",
              "use": "Fermi estimate (round numbers, units)",
              "why": "Users x actions per day / ~100k seconds gives average QPS in minutes. Aim for the right order of magnitude; write units so mistakes show up."
            },
            {
              "signal": "A capacity plan is sized on the average request rate",
              "use": "Apply a peak factor and watch the tail",
              "why": "Traffic peaks at several times the average and users feel p99, not the mean. Size for peak plus headroom; sizing for the average guarantees overload at busy hours."
            },
            {
              "signal": "A question about storing photos, logs or events for millions of users",
              "use": "Storage estimate: count x size x copies",
              "why": "5M users x 2 MB is 10 TB before replication and backups. The number decides between database, object storage and tiering long before any code is written."
            },
            {
              "signal": "A design puts a database, cache or HTTP call inside a loop over many items",
              "use": "Multiply round trips by latency",
              "why": "10,000 calls at 0.5 ms is 5 s; one batched query takes tens of ms. Memory, SSD, datacentre and cross-continent costs differ by orders of magnitude, so count remote calls."
            },
            {
              "signal": "Per-item overhead dominates a job and total throughput is too low, but each item can wait a little",
              "use": "Batching",
              "why": "Amortises fixed cost per call across many items and raises throughput. Increases per-item latency and makes a single failure affect a whole batch."
            },
            {
              "signal": "Reads are slow because each one recomputes or joins the same data, and reads vastly outnumber writes",
              "use": "Precompute (trade space for time)",
              "why": "Indexes, lookup tables and denormalised copies make reads cheap. You pay in storage, slower writes and keeping copies consistent when the source changes."
            },
            {
              "signal": "The team debates for days over a choice that sits behind a thin interface and could be swapped later",
              "use": "Two-way door: decide fast",
              "why": "Cheap-to-undo decisions do not deserve long analysis; pick a reasonable option and learn from use. Analysis paralysis on reversible choices costs more than a wrong pick."
            },
            {
              "signal": "The choice is a public API shape, a schema with live data, a deletion policy or a long vendor contract",
              "use": "One-way door: slow down and prototype",
              "why": "Hard-to-reverse decisions deserve review, a spike and written alternatives. Applying this rigour to every decision instead would stall the team."
            },
            {
              "signal": "A risky decision looks one-way, but parts of it could be staged or hidden behind something swappable",
              "use": "Convert a one-way door into a two-way door",
              "why": "Feature flags, adapters, dual writes and versioned APIs make rollback possible. They add temporary complexity that must be removed once the decision settles."
            },
            {
              "signal": "An optimisation is proposed because something 'feels slow', with no profile or timing data",
              "use": "Estimate to choose, measure to confirm",
              "why": "Estimates pick the design; a profiler or benchmark shows where time actually goes. Optimising unmeasured code often speeds up the part that was never the bottleneck."
            },
            {
              "signal": "The team weighs writing an in-house component against buying or adopting one",
              "use": "Total cost of ownership (build vs buy)",
              "why": "Building costs initial time plus years of maintenance, on-call and upgrades; buying costs money, control and lock-in. Build only what differentiates your product."
            }
          ]
        }
      ],
      "keyPoints": [
        "Every design choice trades one property for another; ask what an option makes worse.",
        "Estimation aims for order of magnitude using round numbers, units and peak factors.",
        "Memory, SSD, datacentre network and cross-continent network are separated by orders of magnitude, so count remote calls.",
        "Decide reversible choices fast and irreversible ones carefully, and design to make decisions reversible."
      ],
      "quiz": [
        {
          "q": "Your service gets 50 million requests per day. Roughly what is the average request rate?",
          "options": [
            "About 50 per second",
            "About 500 per second",
            "About 5,000 per second",
            "About 50,000 per second"
          ],
          "answer": 1,
          "explain": "A day is about 100,000 seconds (86,400 exactly), so 50M / 100k = about 500 per second on average (about 580 with the exact figure). Peak load would be a multiple of that."
        },
        {
          "q": "A loop issues one database query per row for 10,000 rows, with 0.5 ms round trip per query. What is the best diagnosis of the expected cost?",
          "options": [
            "About 5 ms in total, which is negligible",
            "About 5 s in round trips alone, so batching is worth considering",
            "About 50 s, so the database must be replaced",
            "Impossible to estimate, since only CPU speed matters"
          ],
          "answer": 1,
          "explain": "10,000 x 0.5 ms = 5 s of pure network round trips. Batching replaces thousands of round trips with a few."
        },
        {
          "q": "Which of these is closest to a one-way door?",
          "options": [
            "Choosing a logging library wrapped behind your own interface",
            "Renaming an internal function used by three modules in your repo",
            "Publishing a response format that external customers integrate against",
            "Turning on a feature flag for 1% of users to test a change"
          ],
          "answer": 2,
          "explain": "Once customers depend on a public contract it is expensive to change. The other options can be undone cheaply."
        },
        {
          "q": "A colleague proposes adding a cache and lists only its speed benefits. What should you add to the discussion?",
          "options": [
            "That caches are always worth adding once traffic grows",
            "That the cache is unnecessary because modern servers are fast",
            "That caching only helps database-backed reads",
            "The costs: staleness, invalidation, memory and a new failure mode"
          ],
          "answer": 3,
          "explain": "Every tradeoff has a price. Naming staleness and invalidation lets the team decide whether the speedup is worth it."
        },
        {
          "q": "You must store 10 TB of user photos. Which conclusion does a quick estimate support?",
          "options": [
            "Store the photos as BLOBs in the relational database for simplicity",
            "Keep all photos in application memory for the fastest access",
            "Treat 10 TB as too large for any practical system",
            "Use object storage for the files and keep only metadata in the database"
          ],
          "answer": 3,
          "explain": "10 TB is routine for object storage but expensive and awkward inside a relational database, and far beyond application memory. The estimate immediately rules out the others."
        },
        {
          "q": "The checkout page 'feels slow' and a teammate wants to replace the JSON serializer with a custom binary format. Nobody has timing data for the request. What fits best?",
          "options": [
            "Rewrite the serializer now, since binary payloads are much smaller",
            "Profile the request first, then pick a fix from where time goes",
            "Put a cache in front of the endpoint and see if it feels quicker",
            "Split the endpoint into its own microservice to isolate its cost"
          ],
          "answer": 1,
          "explain": "Estimates choose a design, but only a profile shows where time goes. Optimising unmeasured code often speeds up a part that was never the bottleneck, and a cache or split adds cost without evidence."
        }
      ]
    },
    {
      "id": "reading-code",
      "title": "Reading Code & Building Mental Models",
      "minutes": 9,
      "summary": "Navigate unfamiliar code by tracing data flow, forming hypotheses and asking sharp questions.",
      "lesson": [
        {
          "type": "p",
          "text": "Engineers spend far more time reading code than writing it, and when an agent writes the code the ratio grows further. You are dropped into a 200,000-line repository and asked to change how refunds are calculated. You cannot read it all and you should not try. Reading effectively means building a small, accurate mental model of just the part that matters."
        },
        {
          "type": "h",
          "text": "Start from the outside in"
        },
        {
          "type": "list",
          "items": [
            "**Read the README, docs and directory layout** to learn the shape: where entry points, domain logic, storage and tests live.",
            "**Find the entry point**: `main`, the route table, the CLI command, the event handler. Every behaviour starts somewhere.",
            "**Run it**: start the app, run the tests, hit the endpoint. Observed behaviour grounds your reading.",
            "**Look at the tests**: they are executable examples of what the authors believed the code does."
          ]
        },
        {
          "type": "h",
          "text": "Trace the data"
        },
        {
          "type": "p",
          "text": "Pick a single concrete scenario and follow one piece of data from where it enters to where it ends up. This is much more efficient than reading files top to bottom. For the refund change: find the endpoint, see which function it calls, what it reads from the database, where the amount is computed, and what is written or sent afterwards."
        },
        {
          "type": "figure",
          "id": "think-trace-refund",
          "caption": "Pick one concrete refund and follow it stop by stop instead of reading files top to bottom.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 214\" role=\"img\" aria-label=\"One partial refund traced from the POST /refunds endpoint through refund_service, the orders table read, calculate_refund and finally ledger.post.\"> <style> .think-trace-refund-t{font-size:14px;fill:var(--fig-ink)} .think-trace-refund-m{font-size:12px;fill:var(--fig-muted)} .think-trace-refund-c{font-size:12px;fill:var(--fig-muted)} .think-trace-refund-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .think-trace-refund-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .think-trace-refund-ch{stroke:var(--fig-muted);stroke-width:1.5;fill:none;stroke-linecap:round;stroke-linejoin:round} .think-trace-refund-st{fill:var(--fig-panel);stroke:var(--fig-muted);stroke-width:1.5} .think-trace-refund-tk{fill:var(--fig-accent)} .think-trace-refund-tl{font-size:12px;fill:var(--fig-accent)} .think-trace-refund-go{animation:think-trace-refund-mv 7s ease-in-out infinite} @keyframes think-trace-refund-mv{0%{transform:translateX(0);opacity:1}8%{transform:translateX(0)}18%,26%{transform:translateX(126px)}36%,44%{transform:translateX(252px)}54%,62%{transform:translateX(378px)}72%,90%{transform:translateX(504px);opacity:1}95%{transform:translateX(504px);opacity:0}96%{transform:translateX(0);opacity:0}100%{transform:translateX(0);opacity:1}} </style> <text x=\"12\" y=\"24\" class=\"think-trace-refund-m\" style=\"font-size:13px\">One scenario, followed from where it enters to where it ends up</text> <line x1=\"68\" y1=\"146\" x2=\"572\" y2=\"146\" class=\"think-trace-refund-ln\"/> <rect x=\"12\" y=\"40\" width=\"112\" height=\"72\" rx=\"10\" class=\"think-trace-refund-box\"/><text x=\"68\" y=\"70\" text-anchor=\"middle\" class=\"think-trace-refund-t\">endpoint</text><text x=\"68\" y=\"92\" text-anchor=\"middle\" class=\"think-trace-refund-c\">POST /refunds</text><line x1=\"68\" y1=\"112\" x2=\"68\" y2=\"142\" class=\"think-trace-refund-ln\"/><circle cx=\"68\" cy=\"146\" r=\"4\" class=\"think-trace-refund-st\"/> <path d=\"M129 70 L133 76 L129 82\" class=\"think-trace-refund-ch\"/> <rect x=\"138\" y=\"40\" width=\"112\" height=\"72\" rx=\"10\" class=\"think-trace-refund-box\"/><text x=\"194\" y=\"70\" text-anchor=\"middle\" class=\"think-trace-refund-t\">service</text><text x=\"194\" y=\"92\" text-anchor=\"middle\" class=\"think-trace-refund-c\">refund_service</text><line x1=\"194\" y1=\"112\" x2=\"194\" y2=\"142\" class=\"think-trace-refund-ln\"/><circle cx=\"194\" cy=\"146\" r=\"4\" class=\"think-trace-refund-st\"/> <path d=\"M255 70 L259 76 L255 82\" class=\"think-trace-refund-ch\"/> <rect x=\"264\" y=\"40\" width=\"112\" height=\"72\" rx=\"10\" class=\"think-trace-refund-box\"/><text x=\"320\" y=\"70\" text-anchor=\"middle\" class=\"think-trace-refund-t\">reads</text><text x=\"320\" y=\"92\" text-anchor=\"middle\" class=\"think-trace-refund-c\">orders table</text><line x1=\"320\" y1=\"112\" x2=\"320\" y2=\"142\" class=\"think-trace-refund-ln\"/><circle cx=\"320\" cy=\"146\" r=\"4\" class=\"think-trace-refund-st\"/> <path d=\"M381 70 L385 76 L381 82\" class=\"think-trace-refund-ch\"/> <rect x=\"390\" y=\"40\" width=\"112\" height=\"72\" rx=\"10\" class=\"think-trace-refund-box\"/><text x=\"446\" y=\"70\" text-anchor=\"middle\" class=\"think-trace-refund-t\">computes</text><text x=\"446\" y=\"92\" text-anchor=\"middle\" class=\"think-trace-refund-c\">calculate_refund</text><line x1=\"446\" y1=\"112\" x2=\"446\" y2=\"142\" class=\"think-trace-refund-ln\"/><circle cx=\"446\" cy=\"146\" r=\"4\" class=\"think-trace-refund-st\"/> <path d=\"M507 70 L511 76 L507 82\" class=\"think-trace-refund-ch\"/> <rect x=\"516\" y=\"40\" width=\"112\" height=\"72\" rx=\"10\" class=\"think-trace-refund-box\"/><text x=\"572\" y=\"70\" text-anchor=\"middle\" class=\"think-trace-refund-t\">writes, sends</text><text x=\"572\" y=\"92\" text-anchor=\"middle\" class=\"think-trace-refund-c\">ledger.post()</text><line x1=\"572\" y1=\"112\" x2=\"572\" y2=\"142\" class=\"think-trace-refund-ln\"/><circle cx=\"572\" cy=\"146\" r=\"4\" class=\"think-trace-refund-st\"/> <g class=\"think-trace-refund-go\"><circle cx=\"68\" cy=\"146\" r=\"7\" class=\"think-trace-refund-tk\"/><text x=\"68\" y=\"172\" text-anchor=\"middle\" class=\"think-trace-refund-tl\">refund</text></g> <text x=\"12\" y=\"202\" class=\"think-trace-refund-m\">Files off this path can stay unread for now.</text> </svg>"
        },
        {
          "type": "code",
          "lang": "bash",
          "text": "# find where something is defined and used\nrg 'def calculate_refund|calculateRefund' src/\nrg 'refund' --glob '*test*' -l      # which tests mention it\ngit log -S'refund_amount' --oneline # when did this symbol appear or change?\ngit blame -L 40,70 src/refunds.py   # who changed these lines and why?\n\n# then follow a real call in a debugger or with a temporary print:\npytest tests/test_refunds.py::test_partial_refund -x -s"
        },
        {
          "type": "p",
          "text": "Version history is an underused reading tool. A confusing line often makes sense once you read the commit message and linked issue that introduced it. Before removing something that looks pointless, ask what problem it was added to solve (the idea known as Chesterton's fence)."
        },
        {
          "type": "h",
          "text": "Build and test a mental model"
        },
        {
          "type": "p",
          "text": "A mental model is your internal prediction of how the system behaves. Reading is only useful if the model becomes testable: state a prediction, then check it. 'I believe partial refunds are capped at the original charge minus prior refunds; let me look for that check and find a test that hits it.' When reality contradicts the prediction, you have learned something precise. Sketch what you learn: a box-and-arrow diagram of components, a list of the main types and a sequence of calls for one request. Writing it down exposes the gaps."
        },
        {
          "type": "p",
          "text": "Separate **what the code says** from **what it was meant to do**. Comments and names express intent and can be stale; the behaviour of the code is the ground truth. When they disagree, you have found either a bug or outdated documentation, and both are worth knowing."
        },
        {
          "type": "h",
          "text": "Ask good questions"
        },
        {
          "type": "p",
          "text": "When you do need a human, or an agent, the quality of the answer follows the quality of the question. A good question states the goal, what you already tried or read, what you expected, and what you observed instead. Compare 'How does billing work?' with 'I'm tracing how a partial refund reaches the ledger. `refund_service.apply()` calls `ledger.post()` but I can't find where currency conversion happens. Is it in `post()` or earlier?' The second can be answered in one sentence and shows your model, so the answerer can correct it."
        },
        {
          "type": "h",
          "text": "Common pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Reading linearly and aimlessly instead of following a concrete scenario.",
            "Trusting names and comments without checking behaviour.",
            "Stopping at the first plausible explanation; check for a second caller, an override or a configuration flag.",
            "Ignoring generated code, build config and infrastructure that affect runtime behaviour.",
            "Changing code before you can state in your own words what it currently does."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents are excellent navigators: ask one to map the repository, trace a request, or list all callers of a function, then verify its claims by opening the cited files and lines. They also produce confident summaries of code they only skimmed, and often miss dynamic dispatch, reflection, config-driven behaviour and generated code. Always ask for file paths and line references so a summary can be checked, and read the code that will actually change yourself."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "When you finish understanding a module, write the three-sentence summary you wish you had been given, and put it in the docs. The next reader, human or agent, starts ahead of you."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "You are dropped into a large unfamiliar repository and asked to change one behaviour",
              "use": "Orient outside-in (README, layout, entry points)",
              "why": "Learn where entry points, domain logic, storage and tests live before opening functions. Reading every file is impossible; a map tells you which few files matter."
            },
            {
              "signal": "You do not know where a behaviour starts: no obvious `main`, many modules, framework magic",
              "use": "Find the entry point (route, command, handler)",
              "why": "Every behaviour starts at a route table, CLI command, event handler or scheduled job. Search for the URL, command name or event string and follow from there."
            },
            {
              "signal": "You are reading files top to bottom and an hour later still cannot explain the feature",
              "use": "Trace one concrete scenario end to end",
              "why": "Follow one piece of data from request to database and back. It reads only the code that matters for your change; check afterwards for other callers and config flags."
            },
            {
              "signal": "Names and comments are unclear and you are unsure what a function is meant to do",
              "use": "Read the tests as specifications",
              "why": "Tests are executable examples of what the authors believed the code does. Missing or thin tests are themselves a finding: add one before changing behaviour."
            },
            {
              "signal": "A line or check looks pointless and you want to delete it",
              "use": "Chesterton's fence (blame before deleting)",
              "why": "Use `git blame` and the commit message or linked issue to learn what problem it solved. Delete once you know the reason no longer applies, not before."
            },
            {
              "signal": "You need to know when a symbol, constant or behaviour was introduced or last changed",
              "use": "Search history (`git log -S`, pickaxe)",
              "why": "`git log -S'refund_amount'` lists commits that added or removed the string, with their messages. Far faster than reading diffs, but renamed symbols need a second search."
            },
            {
              "signal": "A docstring says 'never returns null' but a test or run shows it returning null",
              "use": "Trust behaviour; flag the mismatch",
              "why": "Code behaviour is ground truth; comments and names express intent and go stale. Either the code has a bug or the docs are wrong, and both deserve a fix or an issue."
            },
            {
              "signal": "You (or an agent) concluded a function has only one caller after a plain text search",
              "use": "Check dynamic references before trusting it",
              "why": "Reflection, string-based lookups, DI containers, serialisation, event wiring and engine callbacks (e.g. message-based methods) escape plain search. Run the code or check config to confirm."
            },
            {
              "signal": "You think you understand a module but cannot say what a specific change will do",
              "use": "Predict, then verify (breakpoint or log)",
              "why": "Turn the mental model into a testable claim and check it by running the code. A failed prediction is cheap here and expensive after you ship the change."
            },
            {
              "signal": "Control flow is buried under interfaces, callbacks and indirection, and static reading keeps losing the thread",
              "use": "Step through it in a debugger",
              "why": "Running one request under a debugger shows the real call path and actual values, including overrides and dynamic dispatch. Use it to confirm a path, not to read a whole system."
            },
            {
              "signal": "You are about to ask a teammate or agent 'how does billing work?'",
              "use": "Ask goal / tried / expected / observed",
              "why": "A question that states the goal, what you read or tried, what you expected and what happened gets a precise answer. Vague questions get vague tours."
            },
            {
              "signal": "You just spent hours working out what a module does and the docs do not say it",
              "use": "Leave the three-sentence summary",
              "why": "Write the summary you wish you had been given and put it next to the code. It is the cheapest onboarding there is, and must be updated when behaviour changes."
            }
          ]
        }
      ],
      "keyPoints": [
        "Orient from the outside in: layout, entry points, running the app, then tests.",
        "Follow one concrete scenario's data end to end rather than reading files linearly.",
        "Use search, version history and blame to learn what and why.",
        "Turn reading into predictions you can verify, and distinguish behaviour from stated intent.",
        "Good questions state the goal, what you tried, what you expected and what happened."
      ],
      "quiz": [
        {
          "q": "You must change how invoices are totalled in a large unfamiliar repo. What is the most efficient first approach?",
          "options": [
            "Read every file in the repository in alphabetical order",
            "Propose rewriting the invoicing module from scratch",
            "Find the invoice-creation entry point and trace one example to the total",
            "Edit the most likely function and see whether tests fail"
          ],
          "answer": 2,
          "explain": "Following one concrete scenario limits the reading to what matters. Changing code before understanding it risks breaking unseen callers."
        },
        {
          "q": "A line of code looks pointless, so you want to delete it. What should you do first?",
          "options": [
            "Delete it, since code that looks unused is just clutter",
            "Check history and tests for why it was added and what depends on it",
            "Ask an agent whether it is unused, without checking references",
            "Comment it out, ship, and see whether anyone complains"
          ],
          "answer": 1,
          "explain": "Odd code often handles a past incident or edge case. Blame and log reveal the reason before you remove it (Chesterton's fence)."
        },
        {
          "q": "A function's docstring says it never returns null, but a test shows it returning null for an empty list. What is the right conclusion?",
          "options": [
            "Behaviour is ground truth: it is a bug or stale docs, so find out which",
            "The docstring is the ground truth, so the test must be wrong",
            "Neither matters as long as the callers seem to work",
            "The compiler or runtime must have a defect"
          ],
          "answer": 0,
          "explain": "Comments express intent and can be outdated, while behaviour is observable fact. The discrepancy itself needs resolving."
        },
        {
          "q": "Which question will most likely get you a useful answer from a teammate?",
          "options": [
            "Can you walk me through how the whole payments system works end to end?",
            "Could you explain the overall architecture so I can find my way around?",
            "The refund code is confusing and I'm stuck, could you take a look with me?",
            "Tracing a refund: `apply()` calls `ledger.post()`; where is currency converted?"
          ],
          "answer": 3,
          "explain": "It states the goal, what has been found and the specific gap, so it is answerable quickly and exposes your mental model for correction."
        },
        {
          "q": "An agent summarises how a feature works and says it only has one caller. What is the best verification?",
          "options": [
            "Search yourself, including dynamic dispatch and config, and open the cited lines",
            "Trust it, since agent summaries of code are usually accurate enough",
            "Ask the same agent again and check that the two answers agree",
            "Skip verification as long as the existing test suite still passes"
          ],
          "answer": 0,
          "explain": "Agents can miss indirect call paths. Independent search and reading cited lines checks the claim, whereas asking again only samples the same blind spot."
        },
        {
          "q": "Refunds stopped working for one client, and you suspect `refund_amount` was removed from the order payload some time ago. You need to know which commit dropped it and why. What should you reach for?",
          "options": [
            "Run `git blame` on each file in the whole repo that mentions orders",
            "Read the diff of every commit since the last release, one at a time",
            "Search history for commits touching that string, read the messages",
            "Ask an agent to summarise how the order payload works right now"
          ],
          "answer": 2,
          "explain": "`git log -S` lists exactly the commits that changed the string, with messages explaining why. Blame shows only the current last-touch line, and reading every diff is far slower."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "You ask an agent for a function that merges overlapping time intervals. It passes your one example. Which extra inputs are most worth testing?",
      "options": [
        "Several more lists shaped like your example, but with different values",
        "Only very large lists, since performance is the main risk here",
        "An empty list, one interval, intervals that only touch, and unsorted input",
        "Lists whose intervals carry longer descriptive labels on each entry"
      ],
      "answer": 2,
      "explain": "Agents handle the happy path well and boundaries poorly. Empty, single, touching and unsorted inputs are where interval-merging code typically breaks; more inputs of the same shape test nothing new."
    },
    {
      "q": "Which statement best defines an invariant?",
      "options": [
        "A variable that is never reassigned after initialisation",
        "A condition true before and after each step, used to argue correctness",
        "A constant declared at the top of a module",
        "A test that is expected to pass on every run"
      ],
      "answer": 1,
      "explain": "Invariants are properties maintained across steps. A never-reassigned variable is merely a constant."
    },
    {
      "q": "A report total is sometimes one cent off. You can reproduce it with three items at 0.10 each. What is the most plausible next step?",
      "options": [
        "Round the total to two decimals at display time and move on",
        "Add a retry around the total calculation until it matches",
        "Check for float sums; use integer cents or decimal, and add a test",
        "Ignore it, since one cent is immaterial to most users here"
      ],
      "answer": 2,
      "explain": "Float representation error is a classic cause of this symptom (0.1 + 0.1 + 0.1 is not exactly 0.3 in binary floating point). Rounding on display hides it; the fix is changing the representation and locking it in with a test."
    },
    {
      "q": "You are asked whether to move a 2 TB, rarely-read audit log from the primary relational database to object storage. A teammate says 'databases are always safer'. What is the best reply?",
      "options": [
        "Agree, since a database is always the safer home for any data",
        "Leave everything as is, because any change at all adds some risk",
        "Move it now, since object storage is always cheaper than a database",
        "Weigh cost, query needs, retention and reversibility against access"
      ],
      "answer": 3,
      "explain": "'Always' claims ignore tradeoffs. Access patterns, cost and reversibility determine the right choice."
    },
    {
      "q": "You believe the checkout code applies discounts before tax. What turns this belief into reliable knowledge?",
      "options": [
        "Find that code path and a test that would fail if the order were reversed",
        "Ask in the team chat whether anyone remembers the order of operations",
        "Read the names of the variables and functions in the discount module",
        "Accept it, because it matches what the product spec says about discounts"
      ],
      "answer": 0,
      "explain": "A mental model is useful when it makes a prediction you can check against behaviour. Memories, names and specs express intent and can disagree with what the code actually does."
    },
    {
      "q": "Which design best reflects 'depend on interfaces, not implementations' for code that needs the current time?",
      "options": [
        "Call the system clock directly wherever the time is needed",
        "Inject a `Clock` interface so tests can supply a fake one",
        "Store the current time in a global that tests overwrite",
        "Hard-code fixed dates in the tests and hope they line up"
      ],
      "answer": 1,
      "explain": "Injecting a clock makes time controllable in tests and the implementation replaceable. Direct calls or shared globals couple logic to one concrete source of time."
    },
    {
      "q": "A test fails only on CI, never locally. Which hypothesis-driven step is strongest?",
      "options": [
        "Re-run the job a few times until it passes, then merge the change",
        "Delete the test, since it already passes on every developer laptop",
        "List environment differences (OS, versions, timezone) and test the likeliest",
        "Add a sleep before the assertion to absorb any timing differences"
      ],
      "answer": 2,
      "explain": "Environmental differences are finite and testable, so you can form and test hypotheses. Re-running or sleeping hides the cause."
    },
    {
      "q": "An endpoint should serve 3,000 requests per second at peak, and each request makes 4 sequential calls to a service 0.5 ms away, plus 1 ms of CPU. Approximately how long does one request take, ignoring queuing?",
      "options": [
        "About 0.5 ms",
        "About 1 ms",
        "About 10 ms",
        "About 3 ms"
      ],
      "answer": 3,
      "explain": "4 x 0.5 ms = 2 ms of network plus 1 ms CPU = about 3 ms. Sequential remote calls usually dominate, so count them. The 3,000 requests per second affects capacity, not single-request latency."
    },
    {
      "q": "Your team debates adopting a new message queue vendor whose proprietary format would hold all your event history. What most increases the careful-analysis requirement?",
      "options": [
        "The move is hard to reverse once data and integrations depend on it",
        "The vendor is relatively new to the market and still growing fast",
        "The vendor's pricing page is hard to follow for most new customers",
        "The team adopting it is large and spread across several offices"
      ],
      "answer": 0,
      "explain": "Reversibility, not novelty, determines how much analysis is justified. Lock-in turns a two-way door into a one-way door."
    },
    {
      "q": "After two hours on a bug you are certain a config value is loaded correctly, so you have been searching elsewhere. What does the debugging mindset suggest?",
      "options": [
        "Keep searching elsewhere, because that config has worked for months",
        "Change several suspicious settings together to save time",
        "Check that assumption directly by inspecting the value at runtime",
        "Add a retry around the code that reads the config"
      ],
      "answer": 2,
      "explain": "The assumption you are most sure of is rarely verified, which is why bugs hide there. A direct check is cheap and either eliminates it or ends the search."
    },
    {
      "q": "Production requests hang whenever a network file mount stalls, although the code treats it as a local folder. What is the most useful lesson?",
      "options": [
        "Abstractions leak under failure, so know the layer below and add timeouts",
        "Never use network filesystems in production under any circumstances",
        "The language's file API is broken and should be replaced with another",
        "Add more worker threads so that hung calls stop mattering to users"
      ],
      "answer": 0,
      "explain": "The 'local folder' illusion breaks when network behaviour shows through. Knowing that layer lets you bound the failure (timeouts, async I/O); banning the tool or adding threads does not address it."
    },
    {
      "q": "A teammate merges two similar functions into one with three boolean flags to avoid duplication. Six months later each change breaks a different caller. What is the most accurate description?",
      "options": [
        "Good reuse that was only applied incorrectly by later changes",
        "A wrong abstraction: cases that vary differently were forced together",
        "Purely a missing test suite; the design itself is perfectly fine",
        "A naming problem that clearer flag names would fix in each case"
      ],
      "answer": 1,
      "explain": "Flags that select behaviour show the cases were never the same thing. Splitting them again is usually cheaper than extending the shared function."
    },
    {
      "q": "A function must return the 10 most-expensive items from a list of 50 million. Which first move shows computational thinking?",
      "options": [
        "Sort the whole list, since sorting is simple and fast enough",
        "Export the list to a spreadsheet and sort it there",
        "Request more memory so the full sort fits comfortably",
        "State input size and output, then keep a running top 10 instead of sorting"
      ],
      "answer": 3,
      "explain": "Stating the contract and scale reveals that a bounded structure (such as a heap of 10) avoids needless work. A full sort wastes time and memory."
    },
    {
      "q": "You use `git bisect` and your repro script sometimes passes on a bad commit because the bug is intermittent. What is the correct response?",
      "options": [
        "Trust each single run, since bisect averages out any noise by itself",
        "Make the repro reliable first, for example by looping it per commit",
        "Skip bisect and read the whole diff line by line, however long it is",
        "Mark every commit bad to be safe and then start the search over again"
      ],
      "answer": 1,
      "explain": "Bisect depends on a trustworthy good/bad signal and does not average anything. A flaky verdict leads it to the wrong commit, so stabilise or repeat the repro first."
    }
  ]
});
