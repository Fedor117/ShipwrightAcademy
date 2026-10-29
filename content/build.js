window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "build",
  "title": "Building Software",
  "tagline": "Write, structure, version and test code that others can safely change.",
  "intro": "Code is read far more often than it is written, and an AI agent can produce thousands of lines in minutes. That makes the fundamentals of structure, history, tests and contracts the main way you keep control of what ships. This section gives you the vocabulary and judgment to direct agents, review their output and keep a codebase healthy.",
  "topics": [
    {
      "id": "readable-code",
      "title": "Readable code",
      "minutes": 9,
      "summary": "Names, small functions and why-comments that let the next reader change code safely.",
      "lesson": [
        {
          "type": "p",
          "text": "You open a function called `process(d, f)` and find 90 lines of nested conditionals. Nothing is technically wrong with it, but you cannot change it without fear. The cost of software is dominated by reading and modifying it, not by typing it the first time. Readable code is code whose intent can be recovered quickly by someone who did not write it, including you in six months."
        },
        {
          "type": "h",
          "text": "Names carry most of the meaning"
        },
        {
          "type": "p",
          "text": "A good name says what something is or does at the level of the problem domain, not how it is stored. `days_until_expiry` beats `d`; `is_eligible_for_refund` beats `flag2`. Names should be proportional to scope: `i` is fine in a three-line loop, but a module-level constant needs a full description. Prefer nouns for values, verbs for functions, and booleans that read as questions (`has_access`, `is_empty`). Avoid vague containers such as `data`, `info`, `manager`, `utils`, which tell the reader nothing."
        },
        {
          "type": "h",
          "text": "Functions that do one thing at one level"
        },
        {
          "type": "p",
          "text": "A function should operate at a single level of abstraction. If one function both parses a request, applies pricing rules and formats an email, the reader must hold all three concerns at once. Extracting well-named helpers turns the body into an outline. The goal is not tiny functions for their own sake; it is that each function has a name you can trust without reading the body."
        },
        {
          "type": "figure",
          "id": "build-extract-helpers",
          "caption": "process_order() mixes parsing, pricing and email lines; extracting each concern into a named helper leaves a three-line outline you can read at a glance.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 344\" role=\"img\" aria-label=\"One function with parsing, pricing and email lines interleaved; the lines move into three named helpers and the original body becomes a three-line outline\"> <style> .build-extract-helpers-t{font-size:13px;fill:var(--fig-ink)} .build-extract-helpers-h{font-size:15px;font-weight:600;fill:var(--fig-ink)} .build-extract-helpers-m{font-size:13px;fill:var(--fig-muted)} .build-extract-helpers-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;fill:var(--fig-ink)} .build-extract-helpers-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .build-extract-helpers-ah{fill:var(--fig-muted)} .build-extract-helpers-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .build-extract-helpers-a{fill:var(--fig-accent);fill-opacity:.85} .build-extract-helpers-b{fill:var(--fig-accent2);fill-opacity:.85} .build-extract-helpers-e{fill:var(--fig-muted);fill-opacity:.7} .build-extract-helpers-slot{fill:none;stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:5 4} .build-extract-helpers-ol{opacity:0;animation:build-extract-helpers-ol 7s ease-in-out infinite} @keyframes build-extract-helpers-ol{0%,50%{opacity:0}58%,86%{opacity:1}92%,100%{opacity:0}} .build-extract-helpers-s0{animation:build-extract-helpers-s0 7s ease-in-out infinite} @keyframes build-extract-helpers-s0{0%,10%{transform:translate(0,0);opacity:1}30%,88%{transform:translate(332px,-14px);opacity:1}92%{transform:translate(332px,-14px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-extract-helpers-s1{animation:build-extract-helpers-s1 7s ease-in-out infinite} @keyframes build-extract-helpers-s1{0%,20%{transform:translate(0,0);opacity:1}40%,88%{transform:translate(316px,64px);opacity:1}92%{transform:translate(316px,64px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-extract-helpers-s2{animation:build-extract-helpers-s2 7s ease-in-out infinite} @keyframes build-extract-helpers-s2{0%,10%{transform:translate(0,0);opacity:1}30%,88%{transform:translate(300px,-49px);opacity:1}92%{transform:translate(300px,-49px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-extract-helpers-s3{animation:build-extract-helpers-s3 7s ease-in-out infinite} @keyframes build-extract-helpers-s3{0%,30%{transform:translate(0,0);opacity:1}50%,88%{transform:translate(316px,116px);opacity:1}92%{transform:translate(316px,116px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-extract-helpers-s4{animation:build-extract-helpers-s4 7s ease-in-out infinite} @keyframes build-extract-helpers-s4{0%,20%{transform:translate(0,0);opacity:1}40%,88%{transform:translate(300px,3px);opacity:1}92%{transform:translate(300px,3px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-extract-helpers-s5{animation:build-extract-helpers-s5 7s ease-in-out infinite} @keyframes build-extract-helpers-s5{0%,20%{transform:translate(0,0);opacity:1}40%,88%{transform:translate(284px,-6px);opacity:1}92%{transform:translate(284px,-6px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-extract-helpers-s6{animation:build-extract-helpers-s6 7s ease-in-out infinite} @keyframes build-extract-helpers-s6{0%,30%{transform:translate(0,0);opacity:1}50%,88%{transform:translate(316px,55px);opacity:1}92%{transform:translate(316px,55px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-extract-helpers-s7{animation:build-extract-helpers-s7 7s ease-in-out infinite} @keyframes build-extract-helpers-s7{0%,10%{transform:translate(0,0);opacity:1}30%,88%{transform:translate(300px,-162px);opacity:1}92%{transform:translate(300px,-162px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-extract-helpers-s8{animation:build-extract-helpers-s8 7s ease-in-out infinite} @keyframes build-extract-helpers-s8{0%,30%{transform:translate(0,0);opacity:1}50%,88%{transform:translate(332px,20px);opacity:1}92%{transform:translate(332px,20px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} </style> <defs><marker id=\"build-extract-helpers-arr\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path class=\"build-extract-helpers-ah\" d=\"M0 0L10 5L0 10z\"/></marker></defs> <rect class=\"build-extract-helpers-panel\" x=\"24\" y=\"24\" width=\"260\" height=\"300\" rx=\"12\"/> <text class=\"build-extract-helpers-c\" x=\"40\" y=\"54\" style=\"font-weight:600\">process_order()</text> <rect class=\"build-extract-helpers-slot\" x=\"356\" y=\"24\" width=\"260\" height=\"92\" rx=\"10\"/><text class=\"build-extract-helpers-c\" x=\"372\" y=\"50\">parse_request()</text><rect class=\"build-extract-helpers-slot\" x=\"356\" y=\"128\" width=\"260\" height=\"92\" rx=\"10\"/><text class=\"build-extract-helpers-c\" x=\"372\" y=\"154\">apply_pricing()</text><rect class=\"build-extract-helpers-slot\" x=\"356\" y=\"232\" width=\"260\" height=\"92\" rx=\"10\"/><text class=\"build-extract-helpers-c\" x=\"372\" y=\"258\">format_email()</text> <path class=\"build-extract-helpers-ln\" d=\"M298 174H336\" marker-end=\"url(#build-extract-helpers-arr)\"/> <text class=\"build-extract-helpers-m\" x=\"317\" y=\"162\" text-anchor=\"middle\">extract</text> <g class=\"build-extract-helpers-ol\"><rect class=\"build-extract-helpers-a\" x=\"40\" y=\"120\" width=\"6\" height=\"22\" rx=\"3\"/><text class=\"build-extract-helpers-c\" x=\"56\" y=\"136\">parse_request()</text><rect class=\"build-extract-helpers-b\" x=\"40\" y=\"160\" width=\"6\" height=\"22\" rx=\"3\"/><text class=\"build-extract-helpers-c\" x=\"56\" y=\"176\">apply_pricing()</text><rect class=\"build-extract-helpers-e\" x=\"40\" y=\"200\" width=\"6\" height=\"22\" rx=\"3\"/><text class=\"build-extract-helpers-c\" x=\"56\" y=\"216\">format_email()</text></g> <rect class=\"build-extract-helpers-a build-extract-helpers-s0\" x=\"40\" y=\"76\" width=\"200\" height=\"14\" rx=\"4\"/><rect class=\"build-extract-helpers-b build-extract-helpers-s1\" x=\"56\" y=\"102\" width=\"170\" height=\"14\" rx=\"4\"/><rect class=\"build-extract-helpers-a build-extract-helpers-s2\" x=\"72\" y=\"128\" width=\"150\" height=\"14\" rx=\"4\"/><rect class=\"build-extract-helpers-e build-extract-helpers-s3\" x=\"56\" y=\"154\" width=\"190\" height=\"14\" rx=\"4\"/><rect class=\"build-extract-helpers-b build-extract-helpers-s4\" x=\"72\" y=\"180\" width=\"140\" height=\"14\" rx=\"4\"/><rect class=\"build-extract-helpers-b build-extract-helpers-s5\" x=\"88\" y=\"206\" width=\"120\" height=\"14\" rx=\"4\"/><rect class=\"build-extract-helpers-e build-extract-helpers-s6\" x=\"56\" y=\"232\" width=\"180\" height=\"14\" rx=\"4\"/><rect class=\"build-extract-helpers-a build-extract-helpers-s7\" x=\"72\" y=\"258\" width=\"150\" height=\"14\" rx=\"4\"/><rect class=\"build-extract-helpers-e build-extract-helpers-s8\" x=\"40\" y=\"284\" width=\"210\" height=\"14\" rx=\"4\"/> </svg>"
        },
        {
          "type": "list",
          "items": [
            "Keep parameter lists short; three or more related parameters often want to be a single object.",
            "Avoid boolean flag parameters (`render(true)`): the call site is unreadable. Use two functions or a named option.",
            "Return early to handle edge cases and keep the main path unindented (guard clauses).",
            "Avoid hidden side effects: a function named `get_user` should not also write to the database."
          ]
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# Hard to read\ndef calc(o, c):\n    t = 0\n    for i in o:\n        if i[2] > 0:\n            t += i[1] * i[2]\n    if c and t > 100:\n        t = t * 0.9\n    return t\n\n# Readable\nBULK_DISCOUNT_THRESHOLD = 100\nBULK_DISCOUNT_RATE = 0.10\n\ndef order_total(items, has_loyalty_card):\n    subtotal = sum(i.unit_price * i.quantity for i in items if i.quantity > 0)\n    if has_loyalty_card and subtotal > BULK_DISCOUNT_THRESHOLD:\n        return subtotal * (1 - BULK_DISCOUNT_RATE)\n    return subtotal"
        },
        {
          "type": "p",
          "text": "Behavior is identical, but the second version names the magic numbers, the concepts and the rule. A reviewer can now spot that the discount applies only to loyalty customers without decoding index positions."
        },
        {
          "type": "h",
          "text": "Comments explain why, not what"
        },
        {
          "type": "p",
          "text": "A comment that restates the code (`# increment i`) is noise that rots when the code changes. Comments earn their place when they record what the code cannot say: why this approach was chosen, which external constraint forced it, what bug it works around, or what would break if someone simplified it. If you feel the need to explain what a block does, first try renaming or extracting so the code explains itself."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# Retry once: the payments API returns 409 for ~1% of requests when two\n# webhooks race; a second call is idempotent and succeeds. See incident #482.\nresponse = charge(order, retries=1)"
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Delete commented-out code. Version control remembers it; the file should show only what is live."
        },
        {
          "type": "h",
          "text": "Consistency and simplicity over cleverness"
        },
        {
          "type": "p",
          "text": "A codebase that does the same thing the same way everywhere is easier to navigate than one where each file is locally optimal. Follow the existing conventions for naming, error handling and layout, and let a formatter and linter enforce the mechanical ones so reviews focus on substance. Prefer the boring, obvious construct to the clever one: a plain loop beats a nested one-liner of chained comprehensions when the latter needs a minute to decode. Cleverness is a loan the next reader repays with interest."
        },
        {
          "type": "h",
          "text": "Common pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Over-abstraction: splitting into dozens of one-line functions can scatter logic and hurt readability just as much as a monolith.",
            "Misleading names: a name that is slightly wrong is worse than a vague one, because readers trust it.",
            "Comments that drift: when behavior changes and the comment does not, the comment becomes a lie.",
            "Treating readability as taste: it is testable. Ask a colleague to explain the code back to you."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents produce plausible-looking code fast, and they happily generate generic names like `data`, `result` and `helper`, redundant what-comments on every line, and slightly different styles across files. Tell the agent to follow the conventions of neighboring files, and run the formatter and linter automatically. When reviewing, read for intent: can you state in one sentence what each function does? If not, ask the agent to rename and restructure before you merge, because you are the one who will maintain it."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Edge-case checks wrap the main logic in three levels of nested `if`, and the real work sits at the deepest indent",
              "use": "Guard clauses (return early)",
              "why": "Handle invalid or trivial cases first and return, so the happy path reads top to bottom at one indent. Keep each guard short; a dozen guards hint the function does too much."
            },
            {
              "signal": "You need comment headers like `# parse`, `# apply pricing`, `# send email` to navigate one long function",
              "use": "Extract function",
              "why": "Each section becomes a named function at one level of abstraction, and the parent reads like a summary. Do not shred it into vague `step3` helpers; scattering logic hurts as much as a monolith."
            },
            {
              "signal": "A bare literal like `0.0725` or `86400` sits in a calculation and a reviewer has to ask what it means",
              "use": "Named constant",
              "why": "`SALES_TAX_RATE` states the meaning, gives one place to change it and makes the rule reviewable. Skip it for self-evident values like `0`, `1` or an index of `-1`."
            },
            {
              "signal": "A call site reads `export(report, true, false)` and nobody can tell what the booleans do",
              "use": "Replace flag argument",
              "why": "Split into two intent-named functions or pass a named option (`include_charts=True`). Flags usually mean the function does two things; separate functions also remove a branch inside."
            },
            {
              "signal": "Variables are named `data`, `tmp`, `flag2` or `userList`, describing storage rather than meaning",
              "use": "Name by intent",
              "why": "`days_until_expiry` or `is_eligible_for_refund` carries the domain rule to every reader. A slightly wrong name is worse than a vague one because readers trust it, so rename when meaning changes."
            },
            {
              "signal": "A condition like `if (a && !b || c && d > 3)` needs a minute of decoding before the branch makes sense",
              "use": "Explaining variable",
              "why": "Assign parts to names like `is_overdue` and `has_override`, then test those. Costs a line or two, buys a readable rule; extract a predicate function if the same check repeats."
            },
            {
              "signal": "A comment restates the next line (`# increment i`) or explains what a cryptic name should have said",
              "use": "Why-comment, not what-comment",
              "why": "Rename until the code says what it does, and keep comments for what code cannot say: why this approach, which bug it avoids, links to the spec. What-comments rot silently when code changes."
            },
            {
              "signal": "Four or more related parameters travel together through several functions (`start`, `end`, `tz`, `inclusive`)",
              "use": "Introduce parameter object",
              "why": "A `DateRange` type names the concept, shortens signatures and gives validation one home. Do not bundle unrelated parameters just to shorten a list; that hides dependencies."
            },
            {
              "signal": "A one-line nested comprehension with a ternary inside earns a 'clever' in review but takes minutes to verify",
              "use": "Boring explicit code",
              "why": "A plain loop with named steps is easier to read, debug and change, and the speed difference is usually nil. Keep compact idioms only where the team reads them fluently."
            }
          ]
        }
      ],
      "keyPoints": [
        "Code is read far more than written, so optimize for the next reader.",
        "Good names reflect domain meaning; bad names like data or flag2 hide intent.",
        "Functions should do one thing at one level of abstraction.",
        "Comments should explain why, not restate what the code does.",
        "Consistency and simplicity beat cleverness; let tools enforce formatting."
      ],
      "quiz": [
        {
          "q": "Which comment most clearly earns its place in a codebase?",
          "options": [
            "`# Loop over all users and add each balance to the running total`",
            "`# Sort descending: the billing API reads only the first 10 rows`",
            "`# TODO: refactor this later when there is time to clean it up`",
            "`# Set the rate variable to 0.9 so the discount gets applied`"
          ],
          "answer": 1,
          "explain": "It records a reason and an external constraint that the code cannot express. The others restate the code or defer work without giving any information."
        },
        {
          "q": "A teammate calls `export(report, true, false)`. What is the best readability fix?",
          "options": [
            "Add a comment at each call site explaining the two flags",
            "Rename the function to `exportReport` for added clarity",
            "Reorder the parameters so the two booleans come first",
            "Replace the flags with named options or separate functions"
          ],
          "answer": 3,
          "explain": "Unnamed boolean flags make call sites unreadable; named options or distinct functions make intent visible where the call is made. Comments drift, and renaming or reordering leaves the flags just as opaque."
        },
        {
          "q": "Which change best improves `def f(x): return x * 0.0725` ?",
          "options": [
            "Add a docstring stating that it multiplies x by a rate",
            "Inline the expression into every caller to remove indirection",
            "Name it `sales_tax(subtotal)` and make 0.0725 a named constant",
            "Rename `x` to `value` and `f` to `compute` for clarity"
          ],
          "answer": 2,
          "explain": "A domain name and a named constant expose both intent and the business rule. Generic renames add nothing, a what-docstring restates the code, and inlining spreads the magic number."
        },
        {
          "q": "Why is a clever one-line nested comprehension often a poor choice?",
          "options": [
            "Every future reader pays the cost of decoding it",
            "It always executes more slowly than the equivalent loop",
            "Most languages forbid nesting comprehensions this deeply",
            "Linters and formatters are unable to parse nested ones"
          ],
          "answer": 0,
          "explain": "The cost is human comprehension, not machine speed or tooling. Clever constructs are often fine for the machine but expensive for every later reader."
        },
        {
          "q": "You split a 200-line function into 40 five-line functions with vague names like `step3`. What is the likely outcome?",
          "options": [
            "Readability improves, since shorter functions are always clearer",
            "Runtime performance improves, since small functions inline well",
            "Logic is scattered, and readers jump around without gaining meaning",
            "Unit tests become unnecessary, since each piece is trivially right"
          ],
          "answer": 2,
          "explain": "Extraction helps only when each piece has a trustworthy, meaningful name. Vague fragments add indirection without clarity."
        },
        {
          "q": "`ship_order()` checks the cart, then stock, then the address, each inside another `if`; the actual shipping call sits five indents deep with the failure branches trailing below it. Which approach fits best?",
          "options": [
            "Check each failure case first and return early, leaving the main path flat",
            "Extract each nested block into its own helper function but keep the same nesting depth",
            "Add a comment header above each nesting level to explain it",
            "Pass a boolean flag so callers choose which checks to run"
          ],
          "answer": 0,
          "explain": "Guard clauses handle the edge cases up front so the main logic reads top to bottom. Extracting the blocks keeps the same deep nesting and just moves it elsewhere."
        }
      ]
    },
    {
      "id": "design-principles",
      "title": "Design principles",
      "minutes": 11,
      "summary": "Cohesion, coupling, SOLID, composition and when not to abstract.",
      "lesson": [
        {
          "type": "p",
          "text": "A feature request arrives: add a new payment method. You discover that adding it requires editing the checkout controller, the invoice generator, the refund service and three tests, and that a typo in one breaks the others. The code works, but every change ripples. Design principles are heuristics for arranging code so that changes stay local."
        },
        {
          "type": "h",
          "text": "Cohesion and coupling"
        },
        {
          "type": "p",
          "text": "**Cohesion** is how strongly the parts inside a module belong together; a module named `InvoiceCalculator` that only computes invoice totals is cohesive, while `Utils` holding date parsing, HTTP helpers and tax rules is not. **Coupling** is how much one module depends on the internals of another. The aim is high cohesion and low coupling: things that change together live together, and modules interact through small, stable interfaces. When a change in module A forces edits in B, C and D, coupling is high."
        },
        {
          "type": "h",
          "text": "SOLID in practice"
        },
        {
          "type": "list",
          "items": [
            "**Single Responsibility**: a module should have one reason to change. A class that formats reports and also talks to the database changes for two unrelated reasons.",
            "**Open/Closed**: add behavior by adding new code rather than editing working code, typically via a shared interface.",
            "**Liskov Substitution**: a subtype must be usable wherever its parent is expected without surprising the caller. A `Square` that breaks `Rectangle` width/height expectations violates it.",
            "**Interface Segregation**: prefer small, focused interfaces so clients do not depend on methods they never use.",
            "**Dependency Inversion**: high-level policy should depend on an abstraction, not on a concrete low-level detail such as a specific database."
          ]
        },
        {
          "type": "p",
          "text": "These are not laws. They are prompts to ask: what changes independently here, and is it isolated? Applying them mechanically to a ten-line script produces ceremony with no payoff."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# Rigid: adding a method means editing this function\ndef charge(order, method):\n    if method == 'card':\n        ...\n    elif method == 'paypal':\n        ...\n\n# Open for extension: new method = new class, no edits here\nclass CardPayment:\n    def charge(self, order): ...\n\nclass PayPalPayment:\n    def charge(self, order): ...\n\ndef checkout(order, payment):   # payment: anything with .charge()\n    payment.charge(order)"
        },
        {
          "type": "figure",
          "id": "build-open-closed",
          "caption": "Adding a bank payment edits charge() on the left, risking the existing branches; on the right a new BankPayment class plugs in and checkout() is untouched.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"Adding a bank payment method: on the left a new elif branch is edited into charge(); on the right a new BankPayment class plugs in and checkout is unchanged\"> <style> .build-open-closed-t{font-size:13px;fill:var(--fig-ink)} .build-open-closed-h{font-size:15px;font-weight:600;fill:var(--fig-ink)} .build-open-closed-m{font-size:13px;fill:var(--fig-muted)} .build-open-closed-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;fill:var(--fig-ink)} .build-open-closed-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .build-open-closed-ah{fill:var(--fig-muted)} .build-open-closed-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .build-open-closed-row{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .build-open-closed-slot{fill:none;stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:5 4} .build-open-closed-hd{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.5} .build-open-closed-new{fill:var(--fig-accent2);fill-opacity:.15;stroke:var(--fig-accent2);stroke-width:2} .build-open-closed-in{opacity:0;animation:build-open-closed-in 6s ease-out infinite} @keyframes build-open-closed-in{0%,15%{opacity:0;transform:translate(0,10px)}27%,85%{opacity:1;transform:translate(0,0)}93%,100%{opacity:0;transform:translate(0,0)}} .build-open-closed-warn{fill:none;stroke:var(--fig-warn);stroke-width:2.5;opacity:0;animation:build-open-closed-bd 6s ease-out infinite} .build-open-closed-ok{fill:none;stroke:var(--fig-ok);stroke-width:2.5;opacity:0;animation:build-open-closed-bd 6s ease-out infinite} .build-open-closed-bw{font-size:13px;font-weight:600;fill:var(--fig-warn);opacity:0;animation:build-open-closed-bd 6s ease-out infinite} .build-open-closed-bo{font-size:13px;font-weight:600;fill:var(--fig-ok);opacity:0;animation:build-open-closed-bd 6s ease-out infinite} @keyframes build-open-closed-bd{0%,27%{opacity:0}33%,85%{opacity:1}93%,100%{opacity:0}} </style> <rect class=\"build-open-closed-panel\" x=\"24\" y=\"24\" width=\"288\" height=\"272\" rx=\"12\"/> <rect class=\"build-open-closed-panel\" x=\"328\" y=\"24\" width=\"288\" height=\"272\" rx=\"12\"/> <rect class=\"build-open-closed-warn\" x=\"24\" y=\"24\" width=\"288\" height=\"272\" rx=\"12\"/> <text class=\"build-open-closed-h\" x=\"44\" y=\"52\">Rigid: if/elif</text> <text class=\"build-open-closed-bw\" x=\"292\" y=\"52\" text-anchor=\"end\">function edited</text> <text class=\"build-open-closed-m\" x=\"92\" y=\"138\">branches inside charge()</text> <rect class=\"build-open-closed-hd\" x=\"44\" y=\"68\" width=\"248\" height=\"40\" rx=\"10\"/><text class=\"build-open-closed-c\" x=\"168\" y=\"93\" text-anchor=\"middle\">def charge(order, method)</text><path class=\"build-open-closed-ln\" d=\"M68 108V258\"/><path class=\"build-open-closed-ln\" d=\"M68 170H92\"/><path class=\"build-open-closed-ln\" d=\"M68 214H92\"/><path class=\"build-open-closed-ln\" d=\"M68 258H92\"/><rect class=\"build-open-closed-row\" x=\"92\" y=\"152\" width=\"200\" height=\"36\" rx=\"8\"/><text class=\"build-open-closed-c\" x=\"106\" y=\"175\">if 'card'</text><rect class=\"build-open-closed-row\" x=\"92\" y=\"196\" width=\"200\" height=\"36\" rx=\"8\"/><text class=\"build-open-closed-c\" x=\"106\" y=\"219\">elif 'paypal'</text><rect class=\"build-open-closed-slot\" x=\"92\" y=\"240\" width=\"200\" height=\"36\" rx=\"8\"/><text class=\"build-open-closed-m\" x=\"106\" y=\"263\">+ new method</text><g class=\"build-open-closed-in\"><rect class=\"build-open-closed-row\" x=\"92\" y=\"240\" width=\"200\" height=\"36\" rx=\"8\"/><rect class=\"build-open-closed-new\" x=\"92\" y=\"240\" width=\"200\" height=\"36\" rx=\"8\"/><text class=\"build-open-closed-c\" x=\"106\" y=\"263\">elif 'bank'</text></g> <rect class=\"build-open-closed-ok\" x=\"348\" y=\"68\" width=\"248\" height=\"40\" rx=\"10\"/> <text class=\"build-open-closed-h\" x=\"348\" y=\"52\">Open: new class</text> <text class=\"build-open-closed-bo\" x=\"596\" y=\"52\" text-anchor=\"end\">no edits</text> <text class=\"build-open-closed-m\" x=\"396\" y=\"138\">anything with .charge()</text> <rect class=\"build-open-closed-hd\" x=\"348\" y=\"68\" width=\"248\" height=\"40\" rx=\"10\"/><text class=\"build-open-closed-c\" x=\"472\" y=\"93\" text-anchor=\"middle\">checkout(order, payment)</text><path class=\"build-open-closed-ln\" d=\"M372 108V258\"/><path class=\"build-open-closed-ln\" d=\"M372 170H396\"/><path class=\"build-open-closed-ln\" d=\"M372 214H396\"/><path class=\"build-open-closed-ln\" d=\"M372 258H396\"/><rect class=\"build-open-closed-row\" x=\"396\" y=\"152\" width=\"200\" height=\"36\" rx=\"8\"/><text class=\"build-open-closed-c\" x=\"410\" y=\"175\">CardPayment</text><rect class=\"build-open-closed-row\" x=\"396\" y=\"196\" width=\"200\" height=\"36\" rx=\"8\"/><text class=\"build-open-closed-c\" x=\"410\" y=\"219\">PayPalPayment</text><rect class=\"build-open-closed-slot\" x=\"396\" y=\"240\" width=\"200\" height=\"36\" rx=\"8\"/><text class=\"build-open-closed-m\" x=\"410\" y=\"263\">+ new method</text><g class=\"build-open-closed-in\"><rect class=\"build-open-closed-row\" x=\"396\" y=\"240\" width=\"200\" height=\"36\" rx=\"8\"/><rect class=\"build-open-closed-new\" x=\"396\" y=\"240\" width=\"200\" height=\"36\" rx=\"8\"/><text class=\"build-open-closed-c\" x=\"410\" y=\"263\">BankPayment</text></g> </svg>"
        },
        {
          "type": "h",
          "text": "Composition over inheritance"
        },
        {
          "type": "p",
          "text": "Inheritance models an is-a relationship and binds the child tightly to its parent's internals; changing the parent can silently break every subclass. Composition models has-a: an object holds collaborators and delegates to them. A `Notifier` that is given an `EmailSender` and a `SmsSender` can swap or combine behavior at runtime, whereas a deep hierarchy such as `EmailSmsUrgentNotifier extends EmailNotifier` explodes combinatorially. Use inheritance sparingly, for true substitutable subtypes or to satisfy a framework contract."
        },
        {
          "type": "h",
          "text": "YAGNI and the cost of speculation"
        },
        {
          "type": "p",
          "text": "YAGNI, you aren't gonna need it, says not to build for requirements you only imagine. Speculative flexibility has a real price: more code to read, test and keep consistent, and the guessed extension point usually does not match the real need. Add the abstraction when the second or third concrete case shows what actually varies."
        },
        {
          "type": "h",
          "text": "DRY versus the wrong abstraction"
        },
        {
          "type": "p",
          "text": "DRY, don't repeat yourself, is about duplicated knowledge, not duplicated text. Two blocks that look alike but change for different reasons are only coincidentally similar; merging them couples unrelated features. The common failure is a shared function that grows parameters and flags to serve each new caller. The heuristic of waiting for three occurrences is rough, but the better test is: if one changes, must the other change too? If not, duplication is cheaper than a wrong abstraction."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Duplication is cheap to fix later; a wrong abstraction embedded in ten callers is expensive. When unsure, duplicate and wait."
        },
        {
          "type": "h",
          "text": "Pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Interfaces with exactly one implementation, created 'just in case'.",
            "God classes that know everything, and anemic wrappers that add nothing.",
            "Treating SOLID as a checklist rather than a way to localize change."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents lean toward over-engineering when asked to be 'flexible' or 'clean': factories, abstract base classes and config options nobody requested. They also copy-paste near-duplicates across files instead of finding the shared knowledge. Constrain them: say 'smallest change that works, no new abstractions unless there are two real callers'. In review, ask for each new interface or class: what concrete requirement forced it, and what changes if I delete it?"
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "The same `switch (paymentType)` appears in checkout, invoicing and refunds, and each new type edits all of them",
              "use": "Strategy (polymorphism)",
              "why": "Put per-variant behavior behind one interface with an implementation per type, so a new type is new code, not edits in five places. Overkill for two stable cases; a plain `if` is fine there."
            },
            {
              "signal": "A vendor SDK's types and quirks show up throughout your business code, and switching vendors means a rewrite",
              "use": "Adapter",
              "why": "Wrap the SDK behind an interface shaped by your needs and translate in one class. You gain a swap point and a test seam; the cost is one more layer that must track SDK changes."
            },
            {
              "signal": "Callers must create five subsystem objects and call them in the right order just to do one common task",
              "use": "Facade",
              "why": "Expose one simple entry point (`exportReport()`) that orchestrates the subsystem. Keep the underlying parts reachable for unusual cases, and stop the facade becoming a god class."
            },
            {
              "signal": "After an order is placed, email, analytics and inventory must react, and the order code imports all three",
              "use": "Observer (in-process events)",
              "why": "The order code publishes `OrderPlaced` and listeners subscribe, so adding a reaction does not touch it. Control flow gets harder to trace and listener order should not matter; unsubscribe to avoid leaks."
            },
            {
              "signal": "Users need undo/redo, or actions must be queued, logged, retried or replayed later",
              "use": "Command",
              "why": "Represent each action as an object with `execute` (and `undo`), so history, queues and audit logs are just lists of commands. Too much ceremony for plain one-shot calls with no history."
            },
            {
              "signal": "`new SmtpMailer()` or `new S3Store()` choices based on config are copy-pasted across many call sites",
              "use": "Factory",
              "why": "Centralize the decision of which concrete type to build, so callers depend only on the interface. One `if` in one place does not need a factory class; a function is often enough."
            },
            {
              "signal": "A class constructs its own `DatabaseClient` internally, so tests cannot run it without a real database",
              "use": "Dependency injection",
              "why": "Pass collaborators in through the constructor; the caller (or composition root) decides real vs fake. Plain constructor parameters usually suffice; a DI container adds magic and is optional."
            },
            {
              "signal": "Subclasses multiply per combination: `EmailAlert`, `SmsAlert`, `EmailSmsRetryAlert`",
              "use": "Composition over inheritance",
              "why": "An `Alert` holds a list of channels and an optional retry policy, so features combine at runtime without new classes. Inheritance still fits true, stable is-a hierarchies with small surface."
            },
            {
              "signal": "A subclass overrides a method to throw `NotSupported` or breaks the parent's assumptions (the Square/Rectangle case)",
              "use": "Liskov check: drop the inheritance",
              "why": "If a subtype cannot honor the base contract, callers will break when given it. Model them as separate types or share behavior through composition instead of forcing an is-a relationship."
            },
            {
              "signal": "An interface or abstract factory has exactly one implementation and no second one on the roadmap",
              "use": "YAGNI: inline the abstraction",
              "why": "Speculative indirection costs reading, testing and navigation today for a guessed future. Use the concrete class; extracting an interface later, when a second case is real, is cheap."
            },
            {
              "signal": "Two blocks look identical but serve rules that change for different reasons (US tax vs EU tax)",
              "use": "Tolerate duplication (rule of three)",
              "why": "DRY targets duplicated knowledge, not similar text. Merging coincidental twins couples unrelated rules; wait for a third real case that changes for the same reason before extracting."
            },
            {
              "signal": "A shared helper grew flags and parameters for each caller and every change risks breaking someone",
              "use": "Inline the wrong abstraction",
              "why": "Copy the helper back into callers, delete the branches each one does not need, then re-extract what is genuinely shared. Duplication is cheaper than the wrong abstraction."
            }
          ]
        }
      ],
      "keyPoints": [
        "Aim for high cohesion within modules and low coupling between them.",
        "SOLID principles are prompts for localizing change, not rigid rules.",
        "Prefer composition (has-a) over inheritance (is-a) for flexibility.",
        "YAGNI: avoid speculative generality until real cases appear.",
        "DRY is about duplicated knowledge; a wrong abstraction costs more than duplication."
      ],
      "quiz": [
        {
          "q": "Two functions have identical code today, but one handles tax for the US and one for the EU, which change under different laws. What is the best move?",
          "options": [
            "Merge them into one function that takes a region flag",
            "Delete one copy and import the survivor in both places",
            "Keep them separate, since they change for different reasons",
            "Move both into a shared `Utils` class to group them"
          ],
          "answer": 2,
          "explain": "They share text, not knowledge, and they change for different reasons, so merging couples unrelated rules. DRY targets duplicated knowledge, not coincidental similarity."
        },
        {
          "q": "Which situation most clearly signals high coupling?",
          "options": [
            "A class exposes only one public method to its callers",
            "Changing a private field in A forces edits in B, C and D",
            "Two modules live in the same repository and folder",
            "A module has a long and highly descriptive name"
          ],
          "answer": 1,
          "explain": "Coupling means depending on another module's internals; ripple edits are the symptom. Repository layout, naming and method count are unrelated."
        },
        {
          "q": "You need an alert that sends email, SMS, or both, sometimes with a retry. Which approach scales best?",
          "options": [
            "A subclass for every combination of channel and retry",
            "One class with a boolean flag for each channel",
            "Copy the sending code into each place that needs it",
            "Compose a notifier from injected sender objects"
          ],
          "answer": 3,
          "explain": "Composition lets you combine behaviors without a combinatorial class hierarchy. Flags and copies grow harder to maintain with each new channel."
        },
        {
          "q": "A teammate adds an `AbstractPaymentStrategyFactory` for a product with one payment provider and no plans for others. This most violates:",
          "options": [
            "YAGNI",
            "Liskov Substitution",
            "Interface Segregation",
            "Single Responsibility"
          ],
          "answer": 0,
          "explain": "It adds speculative flexibility with no concrete need. The other principles are not the primary issue here."
        },
        {
          "q": "A `Square` subclass of `Rectangle` overrides `setWidth` to also set height, and code that sets width then height gets wrong areas. Which principle is broken?",
          "options": [
            "Open/Closed",
            "Dependency Inversion",
            "Liskov Substitution",
            "Interface Segregation"
          ],
          "answer": 2,
          "explain": "The subtype cannot be used wherever the parent is expected without surprising callers, which is exactly what Liskov Substitution forbids."
        },
        {
          "q": "`place_order()` saves the order and then calls the email sender, the analytics client and the inventory service directly. Every new reaction, like loyalty points, means editing it again. What should you reach for?",
          "options": [
            "Wrap the three calls in one facade object called `OrderNotifier` that place_order uses",
            "Subclass `OrderService` once per reaction that is needed",
            "Publish an order-placed event and let each reaction subscribe to it",
            "Add a boolean parameter per reaction to `place_order()`"
          ],
          "answer": 2,
          "explain": "Events invert the dependency so order code no longer knows its reactions. A facade hides the calls but `place_order()` still depends on every reaction and still changes for each new one."
        }
      ]
    },
    {
      "id": "version-control-git",
      "title": "Version control with git",
      "minutes": 11,
      "summary": "Commits, branches, merge vs rebase, and how to undo mistakes without panic.",
      "lesson": [
        {
          "type": "p",
          "text": "It is 5 p.m. and a change you made three days ago has broken checkout. Which of the 40 files you touched is the culprit? Without history you are guessing; with a clean history you can ask git to find the exact commit and revert it in a minute. Version control is a database of every state your project has been in, plus the reasoning for each change."
        },
        {
          "type": "h",
          "text": "The model: snapshots, not diffs"
        },
        {
          "type": "p",
          "text": "A **commit** is an immutable snapshot of the whole project plus a message, an author and a pointer to its parent commit(s). A **branch** is just a movable label pointing at a commit; creating one is nearly free. `HEAD` is a pointer to where you currently are. Your work moves through three areas: the working directory (files on disk), the **staging area** (what will go into the next commit) and the repository (committed history). `git add` moves changes to staging; `git commit` records them."
        },
        {
          "type": "code",
          "lang": "bash",
          "text": "git switch -c fix/rounding-bug    # new branch from current commit\ngit add -p                        # stage selected hunks interactively\ngit commit -m \"Round invoice totals half-up, not half-even\"\ngit log --oneline --graph -10     # see recent history\ngit diff --staged                 # review exactly what you are committing"
        },
        {
          "type": "h",
          "text": "Small, atomic commits"
        },
        {
          "type": "p",
          "text": "An atomic commit contains one logical change and leaves the project in a working state. Small commits make review easier, make `git bisect` effective at locating a regression (it binary-searches history, so each commit must build), and make a revert surgical. A commit that mixes a refactor, a bug fix and a formatting sweep cannot be reverted without losing the other two."
        },
        {
          "type": "h",
          "text": "Good messages"
        },
        {
          "type": "p",
          "text": "A message has a short imperative subject (around 50 characters: 'Fix', 'Add', 'Remove') and, when needed, a body explaining why the change was made, not what, since the diff already shows that. Future you reading `git blame` wants the reason and the constraint. 'Fix stuff' and 'WIP' are useless; 'Retry webhook delivery on 409 to avoid duplicate charges' is gold."
        },
        {
          "type": "h",
          "text": "Merge versus rebase"
        },
        {
          "type": "p",
          "text": "Both integrate work from one branch into another. **Merge** creates a new commit with two parents (unless git can simply fast-forward a branch that has not diverged), preserving the true history including when branches diverged. **Rebase** replays your commits on top of another base, producing a linear history by creating new commits with new hashes. Rebase makes history tidy; merge is safer because it never rewrites anything."
        },
        {
          "type": "figure",
          "id": "build-merge-rebase",
          "caption": "Merge adds commit M with two parents and keeps history as it happened; rebase copies D and E onto C as D′ and E′ with new hashes, leaving the originals behind.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 408\" role=\"img\" aria-label=\"Top: main and feature branches diverge at B and a merge commit M joins them. Bottom: rebase copies D and E onto C as new commits D prime and E prime, leaving the old ones behind\"> <style> .build-merge-rebase-t{font-size:13px;fill:var(--fig-ink)} .build-merge-rebase-h{font-size:15px;font-weight:600;fill:var(--fig-ink)} .build-merge-rebase-m{font-size:13px;fill:var(--fig-muted)} .build-merge-rebase-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;fill:var(--fig-ink)} .build-merge-rebase-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .build-merge-rebase-ah{fill:var(--fig-muted)} .build-merge-rebase-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .build-merge-rebase-a{fill:var(--fig-accent);stroke:var(--fig-accent);stroke-width:2} .build-merge-rebase-b{fill:var(--fig-accent2);stroke:var(--fig-accent2);stroke-width:2} .build-merge-rebase-ct{font-size:13px;font-weight:600;fill:var(--fig-bg);text-anchor:middle} .build-merge-rebase-ea{stroke:var(--fig-accent);stroke-width:2;fill:none} .build-merge-rebase-eb{stroke:var(--fig-accent2);stroke-width:2;fill:none} .build-merge-rebase-tag{fill:var(--fig-bg);stroke:var(--fig-ink);stroke-width:1.5} .build-merge-rebase-tt{font-size:13px;fill:var(--fig-ink);text-anchor:middle} .build-merge-rebase-show{opacity:0;animation:build-merge-rebase-show 7s ease-out infinite} @keyframes build-merge-rebase-show{0%,22%{opacity:0}32%,88%{opacity:1}94%,100%{opacity:0}} .build-merge-rebase-mt{animation:build-merge-rebase-mt 7s ease-in-out infinite} @keyframes build-merge-rebase-mt{0%,30%{transform:translate(0,0);opacity:1}42%,88%{transform:translate(200px,0);opacity:1}92%{transform:translate(200px,0);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-merge-rebase-mv{animation:build-merge-rebase-mv 7s ease-in-out infinite} @keyframes build-merge-rebase-mv{0%,20%{transform:translate(0,0);opacity:1}40%,88%{transform:translate(100px,-56px);opacity:1}92%{transform:translate(100px,-56px);opacity:0}93%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}} .build-merge-rebase-old{animation:build-merge-rebase-old 7s ease-in-out infinite} @keyframes build-merge-rebase-old{0%,30%{opacity:1}42%,88%{opacity:.3}96%,100%{opacity:1}} .build-merge-rebase-p1{opacity:0;animation:build-merge-rebase-p1 7s ease-in-out infinite} @keyframes build-merge-rebase-p1{0%,32%{opacity:0}40%,88%{opacity:1}92%,100%{opacity:0}} .build-merge-rebase-p0{animation:build-merge-rebase-p0 7s ease-in-out infinite} @keyframes build-merge-rebase-p0{0%,32%{opacity:1}40%,92%{opacity:0}100%{opacity:1}} </style> <rect class=\"build-merge-rebase-panel\" x=\"16\" y=\"12\" width=\"608\" height=\"186\" rx=\"12\"/><text class=\"build-merge-rebase-h\" x=\"36\" y=\"38\">Merge: one new commit with two parents</text><path class=\"build-merge-rebase-ea\" d=\"M100 92H300\"/><path class=\"build-merge-rebase-eb\" d=\"M200 92L300 148H400\"/><g class=\"build-merge-rebase-show\"><path class=\"build-merge-rebase-ea\" d=\"M300 92H500\"/><path class=\"build-merge-rebase-eb\" d=\"M400 148L500 92\"/><circle class=\"build-merge-rebase-a\" cx=\"500\" cy=\"92\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"500\" y=\"97\">M</text></g><circle class=\"build-merge-rebase-a\" cx=\"100\" cy=\"92\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"100\" y=\"97\">A</text><circle class=\"build-merge-rebase-a\" cx=\"200\" cy=\"92\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"200\" y=\"97\">B</text><circle class=\"build-merge-rebase-a\" cx=\"300\" cy=\"92\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"300\" y=\"97\">C</text><circle class=\"build-merge-rebase-b\" cx=\"300\" cy=\"148\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"300\" y=\"153\">D</text><circle class=\"build-merge-rebase-b\" cx=\"400\" cy=\"148\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"400\" y=\"153\">E</text><g class=\"build-merge-rebase-mt\"><rect class=\"build-merge-rebase-tag\" x=\"270\" y=\"46\" width=\"60\" height=\"22\" rx=\"11\"/><text class=\"build-merge-rebase-tt\" x=\"300\" y=\"62\">main</text></g><rect class=\"build-merge-rebase-tag\" x=\"370\" y=\"168\" width=\"60\" height=\"22\" rx=\"11\"/><text class=\"build-merge-rebase-tt\" x=\"400\" y=\"184\">feature</text><text class=\"build-merge-rebase-m build-merge-rebase-show\" x=\"604\" y=\"153\" text-anchor=\"end\">history kept as it was</text><rect class=\"build-merge-rebase-panel\" x=\"16\" y=\"210\" width=\"608\" height=\"186\" rx=\"12\"/><text class=\"build-merge-rebase-h\" x=\"36\" y=\"236\">Rebase: replay D, E on top of C</text><path class=\"build-merge-rebase-ea\" d=\"M100 290H300\"/><g class=\"build-merge-rebase-old\"><path class=\"build-merge-rebase-eb\" d=\"M200 290L300 346H400\"/><circle class=\"build-merge-rebase-b\" cx=\"300\" cy=\"346\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"300\" y=\"351\">D</text><circle class=\"build-merge-rebase-b\" cx=\"400\" cy=\"346\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"400\" y=\"351\">E</text></g><path class=\"build-merge-rebase-eb build-merge-rebase-p1\" d=\"M300 290H400\"/><circle class=\"build-merge-rebase-a\" cx=\"100\" cy=\"290\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"100\" y=\"295\">A</text><circle class=\"build-merge-rebase-a\" cx=\"200\" cy=\"290\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"200\" y=\"295\">B</text><circle class=\"build-merge-rebase-a\" cx=\"300\" cy=\"290\" r=\"14\"/><text class=\"build-merge-rebase-ct\" x=\"300\" y=\"295\">C</text><rect class=\"build-merge-rebase-tag\" x=\"270\" y=\"244\" width=\"60\" height=\"22\" rx=\"11\"/><text class=\"build-merge-rebase-tt\" x=\"300\" y=\"260\">main</text><g class=\"build-merge-rebase-mv\"><path class=\"build-merge-rebase-eb\" d=\"M300 346H400\"/><circle class=\"build-merge-rebase-b\" cx=\"300\" cy=\"346\" r=\"14\"/><text class=\"build-merge-rebase-ct build-merge-rebase-p0\" x=\"300\" y=\"351\">D</text><text class=\"build-merge-rebase-ct build-merge-rebase-p1\" x=\"300\" y=\"351\">D′</text><circle class=\"build-merge-rebase-b\" cx=\"400\" cy=\"346\" r=\"14\"/><text class=\"build-merge-rebase-ct build-merge-rebase-p0\" x=\"400\" y=\"351\">E</text><text class=\"build-merge-rebase-ct build-merge-rebase-p1\" x=\"400\" y=\"351\">E′</text><rect class=\"build-merge-rebase-tag\" x=\"370\" y=\"366\" width=\"60\" height=\"22\" rx=\"11\"/><text class=\"build-merge-rebase-tt\" x=\"400\" y=\"382\">feature</text></g><text class=\"build-merge-rebase-m build-merge-rebase-p1\" x=\"604\" y=\"264\" text-anchor=\"end\">D′, E′: new hashes</text><text class=\"build-merge-rebase-m build-merge-rebase-p1\" x=\"432\" y=\"351\">old D, E: left behind</text> </svg>"
        },
        {
          "type": "list",
          "items": [
            "Rebase your own local, unpublished work onto the latest main to keep it current and linear.",
            "Never rebase commits others have already pulled; rewriting shared history forces everyone to untangle duplicates.",
            "Squash-merge on pull requests gives one commit per change; it trades granular history for readability of main.",
            "Whichever strategy your team picks, use it consistently."
          ]
        },
        {
          "type": "h",
          "text": "Recovering from mistakes"
        },
        {
          "type": "p",
          "text": "Git rarely loses committed work. The `reflog` records every place HEAD and your branches have been in your local clone (kept 90 days by default, 30 days for commits no longer reachable from any branch), so even a botched rebase or a deleted branch is recoverable."
        },
        {
          "type": "code",
          "lang": "bash",
          "text": "git restore path/file.py        # discard uncommitted edits to a file\ngit restore --staged file.py    # unstage but keep edits\ngit commit --amend              # fix the last (unpushed) commit\ngit revert <sha>                # new commit that undoes <sha>; safe on shared branches\ngit reflog                      # find where HEAD used to be\ngit reset --hard <sha-from-reflog>  # jump back (discards uncommitted work!)\ngit bisect start; git bisect bad; git bisect good <sha>  # find the breaking commit"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "`git reset --hard` and `git checkout .` discard uncommitted changes, and edits that were never staged are gone permanently because git never stored them. Commit or stash first when unsure."
        },
        {
          "type": "h",
          "text": "Pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Force-pushing to a shared branch (use `--force-with-lease` on your own branch only).",
            "Committing secrets: removing the file in a later commit leaves it in history, so rotate the credential.",
            "Long-lived branches that diverge for weeks and produce painful merges.",
            "Committing generated files and large binaries instead of ignoring them."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents can run git commands for you, which makes history hygiene your job to specify. Ask for one logical change per commit with a why-focused message, and tell the agent never to force-push, amend published commits, or run `reset --hard` without asking. Review `git diff` and `git status` before accepting a commit: agents sometimes stage unrelated files, generated output or even `.env` files. Working on a branch (or worktree) per agent task keeps experiments disposable and your main safe."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A regression appeared somewhere in the last 200 commits and you have a command that reproduces it",
              "use": "`git bisect` (with `bisect run`)",
              "why": "Binary search finds the culprit in about 8 steps, automated if a script returns pass/fail. Works only if commits build and are atomic; giant mixed commits leave you with a huge diff to search."
            },
            {
              "signal": "A bad commit is already on shared `main` and teammates have pulled it",
              "use": "`git revert`",
              "why": "Revert adds a new commit that undoes the change, so nobody's history is rewritten. Resetting and force-pushing shared history forces everyone to untangle duplicates."
            },
            {
              "signal": "After `git reset --hard` or a botched rebase, a committed but unpushed commit vanished from `git log`",
              "use": "`git reflog` recovery",
              "why": "The reflog records where HEAD has been, so you can branch or reset to the lost hash. It is local to your clone and expires (90 days by default); uncommitted work is not in it."
            },
            {
              "signal": "Your local, unpublished feature branch is behind `main` and you want a linear, current history",
              "use": "Rebase local work onto main",
              "why": "`git rebase main` replays your commits on top so the PR diff is clean. Only for commits nobody else has; rebasing shared commits creates duplicates for everyone who pulled them."
            },
            {
              "signal": "After rebasing your own branch the push is rejected and you reach for `--force`",
              "use": "`--force-with-lease`",
              "why": "It refuses to overwrite the remote if someone pushed commits you have not seen, while still updating your rewritten branch. Never force-push shared branches like `main`."
            },
            {
              "signal": "One commit mixes a reformat of a file with a logic change, so the real change is buried in noise",
              "use": "Atomic commits (`git add -p`)",
              "why": "Stage hunks selectively so formatting and behavior land in separate commits. Each commit then reviews, reverts and bisects on its own. Each one should still build."
            },
            {
              "signal": "The PR history is a string of `wip`, `fix typo` and `oops` commits",
              "use": "Squash fixups before merge",
              "why": "Use `git commit --fixup` plus an autosquash rebase, or a squash-merge, to leave one meaningful commit per logical change. Squash-merge loses per-commit detail on large PRs."
            },
            {
              "signal": "A commit message says `fix stuff` and six months later nobody knows why the line changed",
              "use": "Imperative subject + why body",
              "why": "Subject like `Fix rounding in refund totals` (about 50 chars), body explaining the reason, the trade-off and the ticket. The diff already shows what; only the message can record why."
            },
            {
              "signal": "An urgent fix lands on `main` but also needs to go to an older release branch",
              "use": "`git cherry-pick`",
              "why": "Copies one commit onto another branch without merging everything else. The copy gets a new hash, so record the origin (`-x`), and expect conflicts if the branches diverged far."
            },
            {
              "signal": "You are mid-feature with uncommitted changes when a hotfix on another branch comes in",
              "use": "`git worktree`",
              "why": "A second working directory on another branch lets you fix and test without stashing or losing build state. Stash works for quick switches but is easy to forget and lose track of."
            }
          ]
        }
      ],
      "keyPoints": [
        "A commit is an immutable snapshot with a parent pointer; a branch is a movable label.",
        "Small atomic commits make review, bisect and revert effective.",
        "Messages should say why; use imperative subject lines.",
        "Merge preserves history; rebase rewrites it, so never rebase shared commits.",
        "The reflog and `git revert` let you recover from most mistakes."
      ],
      "quiz": [
        {
          "q": "You pushed a bad commit to a shared main branch that teammates have already pulled. What is the safest fix?",
          "options": [
            "`git reset --hard HEAD~1`, then force-push main",
            "Rebase main interactively to drop the bad commit",
            "`git revert` the commit and push the new commit",
            "Delete the remote repository and push a fresh one"
          ],
          "answer": 2,
          "explain": "Revert adds a new commit that undoes the bad one without rewriting shared history. Resetting, rebasing and force-pushing break everyone who already pulled."
        },
        {
          "q": "Why does `git bisect` work best with atomic commits that each build and pass?",
          "options": [
            "Bisect can only step through commits under ten lines",
            "Bisect requires every commit to be GPG-signed first",
            "Bisect automatically deletes the commits that fail",
            "Each commit it tests can be judged good or bad"
          ],
          "answer": 3,
          "explain": "Bisect binary-searches history; if intermediate commits are broken for unrelated reasons, they cannot be classified and the search gives misleading results."
        },
        {
          "q": "You ran `git reset --hard HEAD~1` and your last (committed, unpushed) commit vanished from `git log`. What helps?",
          "options": [
            "Use `git reflog` to find the old HEAD and reset to it",
            "Nothing; once gone from the log, the commit is lost",
            "Re-clone the remote, which still has your commit",
            "Run `git stash pop` to bring the commit back"
          ],
          "answer": 0,
          "explain": "The commit object still exists and the reflog records where HEAD was. The remote never had the unpushed commit, and stash is unrelated. Uncommitted work, by contrast, would be unrecoverable."
        },
        {
          "q": "Which is the best use of rebase?",
          "options": [
            "Rebasing a branch teammates have checked out, to tidy it",
            "Replaying your unpublished feature commits onto latest main",
            "Rewriting main to remove an old commit everyone has pulled",
            "Rebasing every shared branch by default, without discussion"
          ],
          "answer": 1,
          "explain": "Rebasing local, unpublished work is safe. Rewriting commits that others have pulled creates divergent histories."
        },
        {
          "q": "Which commit message is most useful six months later?",
          "options": [
            "`fix bug in checkout flow`",
            "`Update checkout.py and payment_gateway.py`",
            "`Retry capture once on gateway timeout to avoid double charges`",
            "`WIP: more changes to the payment and checkout stuff, see diff`"
          ],
          "answer": 2,
          "explain": "It states the change and the reason, which the diff cannot show. The others carry little beyond what git already records."
        },
        {
          "q": "You are mid-feature with a dev server running and half-finished edits. A production hotfix must be built and tested on the release branch right now, and you want your current state left exactly as it is. What fits best?",
          "options": [
            "Run `git reset --hard` and redo the feature work afterwards",
            "Check the release branch out in a second directory with `git worktree add`",
            "Cherry-pick your unfinished edits onto the release branch and build from there",
            "Rebase the feature branch onto the release branch first"
          ],
          "answer": 1,
          "explain": "A worktree gives the hotfix its own checkout while your files and running server stay untouched. Cherry-pick moves commits between branches and does nothing about your dirty working tree."
        }
      ]
    },
    {
      "id": "testing",
      "title": "Testing",
      "minutes": 12,
      "summary": "The test pyramid, TDD, test doubles and what separates a good test from a brittle one.",
      "lesson": [
        {
          "type": "p",
          "text": "You refactor a pricing function and ship on a Friday. Monday brings complaints: discounts stack incorrectly. A test that took five minutes to write would have caught it. Automated tests are executable specifications that tell you, within seconds, whether a change broke existing behavior. They are what lets you change code confidently, and they are the main safety net when much of the code was generated."
        },
        {
          "type": "h",
          "text": "The test pyramid"
        },
        {
          "type": "list",
          "items": [
            "**Unit tests**: exercise one function or class in isolation. Fast (milliseconds), precise failures, many of them.",
            "**Integration tests**: check that components work together, such as your code against a real database or a real HTTP boundary. Slower, fewer.",
            "**End-to-end (e2e) tests**: drive the whole system through the UI or public API like a user. Slowest, most brittle, few of them, covering critical journeys only."
          ]
        },
        {
          "type": "p",
          "text": "The pyramid is an economic argument: put most tests where they are cheap and give precise failures. An inverted pyramid, mostly slow e2e tests, gives slow feedback and failures that say 'something broke' without saying where. Modern variants (a 'trophy' emphasizing integration tests) shift the balance, but the principle holds: match the test level to the risk."
        },
        {
          "type": "figure",
          "id": "build-test-pyramid",
          "caption": "Watch the feedback bars: a suite built mostly of unit tests reports quickly and precisely, while an inverted suite of mostly e2e tests makes you wait.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 336\" role=\"img\" aria-label=\"A test pyramid with many unit tests, fewer integration tests and few end-to-end tests gives fast feedback; the inverted shape, mostly end-to-end tests, gives slow feedback\"> <style> .build-test-pyramid-t{font-size:13px;fill:var(--fig-ink)} .build-test-pyramid-h{font-size:15px;font-weight:600;fill:var(--fig-ink)} .build-test-pyramid-m{font-size:13px;fill:var(--fig-muted)} .build-test-pyramid-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;fill:var(--fig-ink)} .build-test-pyramid-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .build-test-pyramid-ah{fill:var(--fig-muted)} .build-test-pyramid-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .build-test-pyramid-u{fill:var(--fig-accent);fill-opacity:.55;stroke:var(--fig-accent);stroke-width:1.5} .build-test-pyramid-i{fill:var(--fig-accent2);fill-opacity:.45;stroke:var(--fig-accent2);stroke-width:1.5} .build-test-pyramid-e{fill:var(--fig-ink);fill-opacity:.12;stroke:var(--fig-muted);stroke-width:1.5} .build-test-pyramid-lt{font-size:14px;font-weight:600;fill:var(--fig-ink);text-anchor:middle} .build-test-pyramid-track{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .build-test-pyramid-fo{fill:var(--fig-ok);transform-box:fill-box;transform-origin:0 50%;transform:scaleX(0);animation:build-test-pyramid-fo 6s linear infinite} .build-test-pyramid-fw{fill:var(--fig-warn);transform-box:fill-box;transform-origin:0 50%;transform:scaleX(0);animation:build-test-pyramid-fw 6s linear infinite} @keyframes build-test-pyramid-fo{0%,5%{transform:scaleX(0)}22%,90%{transform:scaleX(1)}96%,100%{transform:scaleX(0)}} @keyframes build-test-pyramid-fw{0%,5%{transform:scaleX(0)}88%,90%{transform:scaleX(1)}96%,100%{transform:scaleX(0)}} </style> <text class=\"build-test-pyramid-h\" x=\"168\" y=\"36\" text-anchor=\"middle\">Pyramid</text><polygon class=\"build-test-pyramid-e\" points=\"138,60 198,60 234.7,120 101.3,120\" stroke-linejoin=\"round\"/><text class=\"build-test-pyramid-lt\" x=\"168\" y=\"95\">E2E</text><polygon class=\"build-test-pyramid-i\" points=\"101.3,120 234.7,120 271.3,180 64.7,180\" stroke-linejoin=\"round\"/><text class=\"build-test-pyramid-lt\" x=\"168\" y=\"155\">Integration</text><polygon class=\"build-test-pyramid-u\" points=\"64.7,180 271.3,180 308,240 28,240\" stroke-linejoin=\"round\"/><text class=\"build-test-pyramid-lt\" x=\"168\" y=\"215\">Unit</text><text class=\"build-test-pyramid-m\" x=\"48\" y=\"270\">feedback</text><rect class=\"build-test-pyramid-track\" x=\"48\" y=\"280\" width=\"240\" height=\"12\" rx=\"6\"/><rect class=\"build-test-pyramid-fo\" x=\"48\" y=\"280\" width=\"240\" height=\"12\" rx=\"6\"/><text class=\"build-test-pyramid-t\" x=\"168\" y=\"318\" text-anchor=\"middle\">Fast feedback, precise failures</text><text class=\"build-test-pyramid-h\" x=\"472\" y=\"36\" text-anchor=\"middle\">Inverted</text><polygon class=\"build-test-pyramid-e\" points=\"332,60 612,60 575.3,120 368.7,120\" stroke-linejoin=\"round\"/><text class=\"build-test-pyramid-lt\" x=\"472\" y=\"95\">E2E</text><polygon class=\"build-test-pyramid-i\" points=\"368.7,120 575.3,120 538.7,180 405.3,180\" stroke-linejoin=\"round\"/><text class=\"build-test-pyramid-lt\" x=\"472\" y=\"155\">Integration</text><polygon class=\"build-test-pyramid-u\" points=\"405.3,180 538.7,180 502,240 442,240\" stroke-linejoin=\"round\"/><text class=\"build-test-pyramid-lt\" x=\"472\" y=\"215\">Unit</text><text class=\"build-test-pyramid-m\" x=\"352\" y=\"270\">feedback</text><rect class=\"build-test-pyramid-track\" x=\"352\" y=\"280\" width=\"240\" height=\"12\" rx=\"6\"/><rect class=\"build-test-pyramid-fw\" x=\"352\" y=\"280\" width=\"240\" height=\"12\" rx=\"6\"/><text class=\"build-test-pyramid-t\" x=\"472\" y=\"318\" text-anchor=\"middle\">Slow feedback: 'something broke'</text> </svg>"
        },
        {
          "type": "h",
          "text": "What makes a good test"
        },
        {
          "type": "list",
          "items": [
            "**Tests behavior, not implementation**: it should fail when behavior breaks, not when you refactor internals.",
            "**Fast and deterministic**: same input, same result, every run.",
            "**Independent**: no shared state or required order between tests.",
            "**Readable**: arrange, act, assert, with a name that states the scenario and expected outcome.",
            "**Fails for one reason**, and the failure message points at the cause."
          ]
        },
        {
          "type": "code",
          "lang": "python",
          "text": "def test_loyalty_member_gets_10_percent_off_orders_over_100():\n    # Arrange\n    order = Order(items=[Item(price=120, qty=1)], loyalty_member=True)\n    # Act\n    total = order.total()\n    # Assert\n    assert total == 108"
        },
        {
          "type": "h",
          "text": "TDD: red, green, refactor"
        },
        {
          "type": "p",
          "text": "Test-driven development writes a failing test first (red), makes it pass with the simplest code (green), then cleans up with the tests as a safety net (refactor). Its value is less about the tests and more about design pressure: code that is hard to test is usually too coupled. You do not have to use TDD everywhere, but writing the failing test first is especially effective for bug fixes, because it proves the test can actually catch the bug."
        },
        {
          "type": "h",
          "text": "Test doubles"
        },
        {
          "type": "p",
          "text": "A **test double** replaces a real dependency. A *stub* returns canned answers; a *fake* is a lightweight working implementation (an in-memory repository); a *mock* records calls so you can verify interactions; a *spy* wraps a real object and records. Doubles isolate tests from slow or nondeterministic things (network, clock, randomness). Overuse is a trap: tests that mock everything verify only that your code calls your mocks, and break whenever internals change. Prefer fakes and real in-process dependencies where they are cheap, and mock at true system boundaries."
        },
        {
          "type": "h",
          "text": "Flaky tests"
        },
        {
          "type": "p",
          "text": "A flaky test passes and fails with no code change. Typical causes: timing and sleeps, shared state between tests, dependence on the real clock or network, unordered collections, and concurrency races. Flakiness destroys trust: people start re-running and ignoring red builds. Treat a flaky test as a bug: fix the nondeterminism (inject a fake clock, wait on conditions not durations) or quarantine and fix it promptly, never just retry forever."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Coverage percentage measures which lines ran, not whether anything was asserted. A test with no assertions can give 100% coverage and catch nothing."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents readily generate many tests, but often tautological ones that restate the implementation, mock everything, or assert only that no exception was raised. Worse, an agent that is told to 'make the tests pass' may edit the test or special-case the code. Give it a failing test (or write the test cases yourself) before implementation, forbid weakening existing assertions without explanation, and when reviewing, deliberately break the code and confirm a test fails. Ask: would this test fail if the feature were wrong?"
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A test interleaves setup, several calls and asserts, so when it fails you cannot tell which step broke",
              "use": "Arrange-Act-Assert",
              "why": "Three visible blocks: build state, perform one action, check the outcome. One behavior per test gives one clear reason to fail. Multiple asserts on the same outcome are fine."
            },
            {
              "signal": "The same test body is copy-pasted with different inputs and expected outputs",
              "use": "Table-driven (parameterized) tests",
              "why": "List cases as data and loop one assertion over them; adding a case is one row and failures name the case. Do not force very different scenarios into one table with branching logic."
            },
            {
              "signal": "Code under test calls `now()`, random or the network, so results change between runs",
              "use": "Inject the nondeterminism",
              "why": "Pass a clock, seed or client as a dependency and supply a fixed one in tests. Deterministic tests stop flaking; the cost is one more parameter or interface in production code."
            },
            {
              "signal": "Unit tests need a repository or cache, and the real one needs a running database",
              "use": "Fake (in-memory implementation)",
              "why": "A small working implementation behaves like the real thing, so tests check behavior, not call sequences. Back it with a contract test against the real adapter so the fake does not drift."
            },
            {
              "signal": "You must verify the code sends an email or charges a card, an effect at a system boundary",
              "use": "Mock at the boundary",
              "why": "Assert the outgoing call to the external system, where the interaction is the behavior. Mocking internal collaborators instead couples tests to implementation and they break on every refactor."
            },
            {
              "signal": "A function has a huge input space with invariants like `decode(encode(x)) == x` or `sort` keeps length",
              "use": "Property-based testing",
              "why": "A generator tries hundreds of random inputs and shrinks failures to a minimal case, finding edge cases you would not write. Needs a statable invariant; slower than examples and can be harder to debug."
            },
            {
              "signal": "Output is large but stable: a rendered report, serializer output, generated code or an image",
              "use": "Golden (snapshot) test",
              "why": "Compare against an approved file and review diffs on change. Cheap to write, but teams start rubber-stamping updates; keep snapshots small and normalize timestamps and IDs."
            },
            {
              "signal": "You must change legacy code that has no tests and nobody fully knows what it does",
              "use": "Characterization tests",
              "why": "Record what the code currently outputs for representative inputs and lock it in before refactoring. They pin existing behavior including bugs, so fix bugs as separate, deliberate changes."
            },
            {
              "signal": "The suite is mostly slow browser e2e tests, builds take 90 minutes and fail randomly",
              "use": "Rebalance to the test pyramid",
              "why": "Move logic checks down to unit and integration tests; keep a few e2e tests for critical journeys. Unit tests alone miss wiring bugs, so do not delete every integration test."
            },
            {
              "signal": "A test sleeps 100 ms and then asserts a background job finished, and fails about one run in twenty",
              "use": "Wait on a condition, not a timer",
              "why": "Poll for the expected state with a timeout, or await a completion signal or fake scheduler. Longer sleeps only make the suite slower and still flaky."
            },
            {
              "signal": "A bug report arrives with a reproducible case",
              "use": "Failing regression test first",
              "why": "Write a test that reproduces the bug and watch it fail (red) before fixing. It proves the test can catch the bug and keeps it from returning; skip only when reproduction is genuinely impractical."
            },
            {
              "signal": "Tests break every time you rename a private method, even though behavior did not change",
              "use": "Test through the public interface",
              "why": "Exercise behavior via the module's public API so refactors stay green. If internals feel too hard to reach, that is often a sign a separate unit wants extracting."
            }
          ]
        }
      ],
      "keyPoints": [
        "Most tests should be fast unit tests, with fewer integration and e2e tests.",
        "Good tests check behavior, are deterministic and independent, and fail for one clear reason.",
        "TDD's red-green-refactor loop adds design pressure; a failing test first proves it can catch the bug.",
        "Prefer fakes over heavy mocking; mock at system boundaries.",
        "Fix flaky tests promptly; they destroy trust in the suite."
      ],
      "quiz": [
        {
          "q": "A team has 20 unit tests and 800 browser e2e tests, and builds take 90 minutes with frequent random failures. What is the best direction?",
          "options": [
            "Add more e2e tests so every page is fully covered",
            "Move most checks to unit and integration tests; keep few e2e",
            "Configure CI to retry each failing e2e test three times",
            "Run the e2e suite only once a week, on Friday afternoons"
          ],
          "answer": 1,
          "explain": "The inverted pyramid gives slow, imprecise feedback. Moving checks to cheaper levels fixes both speed and diagnosability; retries only hide flakiness."
        },
        {
          "q": "Which test is most likely to break when you refactor internals without changing behavior?",
          "options": [
            "One that asserts the returned total for given inputs",
            "One that checks the status code of the public API",
            "One that compares output to a stored expected file",
            "One asserting a private helper ran exactly twice"
          ],
          "answer": 3,
          "explain": "Asserting on internal calls couples the test to implementation. Assertions on outputs and public behavior survive refactors."
        },
        {
          "q": "A test fails about 1 in 20 runs because it sleeps 100 ms and then expects a background job to finish. Best fix?",
          "options": [
            "Wait on the job's completion signal instead of a fixed sleep",
            "Increase the sleep from 100 ms to a full ten seconds",
            "Remove the assertion that checks the job's result",
            "Mark the test CI-only so local runs stay green"
          ],
          "answer": 0,
          "explain": "Fixed sleeps are guesses about timing. Waiting on a condition removes the race; a longer sleep is slower and still racy."
        },
        {
          "q": "You are fixing a bug. Which first step best reflects good TDD practice?",
          "options": [
            "Fix the code first, then add a test if time permits",
            "Refactor the surrounding code first, then fix the bug",
            "Write a failing test that reproduces the bug, then fix it",
            "Lower the coverage threshold so the fix can merge"
          ],
          "answer": 2,
          "explain": "A reproducing test that fails for the right reason proves your test can detect the bug and prevents regression."
        },
        {
          "q": "What does a mock-heavy test suite most commonly risk?",
          "options": [
            "Tests running faster than the production code they check",
            "Needing far fewer tests than the code really requires",
            "Line coverage dropping to zero for the mocked modules",
            "Passing while real integration is broken, failing on refactors"
          ],
          "answer": 3,
          "explain": "Mocks verify interactions with your assumptions rather than real behavior, so mismatches with the real dependency go unnoticed while internal changes cause failures."
        },
        {
          "q": "After checkout succeeds, the service must call the payment gateway's `charge` exactly once with the order total. Tests cannot hit the real gateway. Which approach fits best?",
          "options": [
            "Snapshot the whole order object as a golden file",
            "Add a `sleep` and poll the gateway dashboard for the charge",
            "Write a property test that checks `decode(encode(order))` always round-trips for any input",
            "Replace the gateway client with a mock and assert the single `charge` call"
          ],
          "answer": 3,
          "explain": "The charge is an effect at a system boundary, so a mock verifies it was requested. A golden snapshot of the order would not show whether the gateway was ever called."
        }
      ]
    },
    {
      "id": "interfaces-types-contracts",
      "title": "Interfaces, types & contracts",
      "minutes": 11,
      "summary": "Designing APIs, using types, validating at boundaries and evolving without breaking callers.",
      "lesson": [
        {
          "type": "p",
          "text": "Your team renames a JSON field from `user_name` to `username` in an internal API. The tests in the service pass. Two hours later the mobile app, the billing job and a partner integration all fail. The code was fine; the contract was broken. An interface is a promise about what a component accepts and returns, and every caller builds on that promise."
        },
        {
          "type": "h",
          "text": "Interfaces as contracts"
        },
        {
          "type": "p",
          "text": "A **contract** specifies preconditions (what callers must provide), postconditions (what the function guarantees) and invariants (what always stays true). It applies to a function signature, a class, a REST endpoint or an event schema. Good interfaces are small, hard to misuse and hide implementation details, so you can change the inside freely while the outside stays stable. The wider the public surface, the more you can break."
        },
        {
          "type": "list",
          "items": [
            "Make invalid states unrepresentable where you can: take a `Currency` type, not a free string.",
            "Name operations by intent (`cancel_order`), not by mechanism (`set_status`).",
            "Be strict in what you promise, careful in what you accept.",
            "Keep it minimal: everything public becomes something someone depends on."
          ]
        },
        {
          "type": "h",
          "text": "What type systems buy you"
        },
        {
          "type": "p",
          "text": "A type system checks, before the code runs, that values are used consistently. **Static** typing (TypeScript, Java, Rust, Go) catches many mistakes at compile time and powers editor navigation and safe refactoring. **Dynamic** typing (plain Python or JavaScript) checks at runtime, trading early feedback for flexibility; optional type hints give you part of both. Types are documentation that cannot drift, and cheap guardrails when many hands, human and AI, edit the same code. But types describe shape, not meaning: a `number` can still be a negative age."
        },
        {
          "type": "code",
          "lang": "ts",
          "text": "type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';\n\ninterface Order {\n  id: string;\n  status: OrderStatus;\n  totalCents: number;   // integer cents avoids float rounding\n}\n\nfunction ship(order: Order): Order {\n  if (order.status !== 'paid') {\n    throw new Error('Cannot ship an order that is ' + order.status);\n  }\n  return { ...order, status: 'shipped' };\n}"
        },
        {
          "type": "h",
          "text": "Validate at the boundaries"
        },
        {
          "type": "p",
          "text": "Types vanish at runtime, and data crossing a trust boundary (HTTP requests, files, queues, user input, third-party APIs, LLM output) is untyped until proven otherwise. The pattern is to **parse, don't validate**: check once at the edge and convert into a trusted internal type, so the core code never re-checks. Use a schema library (Zod, Pydantic, JSON Schema) to reject malformed input with a clear error. Inside the boundary, rely on types and a few assertions rather than defensive checks everywhere."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "from pydantic import BaseModel, Field, ValidationError\n\nclass CreateOrder(BaseModel):\n    customer_id: str\n    quantity: int = Field(gt=0, le=1000)\n\ntry:\n    cmd = CreateOrder.model_validate(request_json)\nexcept ValidationError as e:\n    return 422, e.errors()   # reject at the edge\n# from here on, cmd.quantity is guaranteed in 1..1000"
        },
        {
          "type": "h",
          "text": "Backwards compatibility"
        },
        {
          "type": "p",
          "text": "Once others consume an interface, changing it is a negotiation. **Additive** changes (new optional field, new endpoint) are generally safe, provided that clients ignore unknown fields. **Breaking** changes include removing or renaming a field, changing a type, tightening validation, or changing the meaning of a value. To break safely, use expand-and-contract: add the new form alongside the old, migrate callers, then remove the old after a deprecation period. Version APIs only when you must; semantic versioning communicates intent for libraries (major = breaking)."
        },
        {
          "type": "figure",
          "id": "build-expand-contract",
          "caption": "Expand-and-contract renames user_name safely: add username, migrate the mobile app, billing job and partner one at a time, and only then remove the old field.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 284\" role=\"img\" aria-label=\"Renaming user_name to username safely: add username alongside, move the mobile app, billing job and partner over one at a time, then remove user_name\"> <style> .build-expand-contract-t{font-size:13px;fill:var(--fig-ink)} .build-expand-contract-h{font-size:15px;font-weight:600;fill:var(--fig-ink)} .build-expand-contract-m{font-size:13px;fill:var(--fig-muted)} .build-expand-contract-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;fill:var(--fig-ink)} .build-expand-contract-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .build-expand-contract-ah{fill:var(--fig-muted)} .build-expand-contract-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .build-expand-contract-box{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .build-expand-contract-old{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .build-expand-contract-new{stroke:var(--fig-accent);stroke-width:2;fill:none} .build-expand-contract-ahn{fill:var(--fig-accent)} .build-expand-contract-pill{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .build-expand-contract-on{fill:var(--fig-accent);fill-opacity:.15;stroke:var(--fig-accent);stroke-width:2;opacity:0} .build-expand-contract-ph0{opacity:1} .build-expand-contract-fo{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .build-expand-contract-fn{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.5} .build-expand-contract-dep{font-size:13px;fill:var(--fig-warn);opacity:0;animation:build-expand-contract-dep 8s infinite} @keyframes build-expand-contract-dep{0%,20%{opacity:0}24%,60%{opacity:1}64%,100%{opacity:0}} .build-expand-contract-of{animation:build-expand-contract-of 8s infinite} @keyframes build-expand-contract-of{0%,60%{opacity:1}68%,90%{opacity:0}96%,100%{opacity:1}} .build-expand-contract-nf{opacity:0;animation:build-expand-contract-nf 8s infinite} @keyframes build-expand-contract-nf{0%,8%{opacity:0}16%,90%{opacity:1}96%,100%{opacity:0}} .build-expand-contract-ph0{animation:build-expand-contract-ph0 8s infinite} @keyframes build-expand-contract-ph0{0%,20%{opacity:1}23%,96%{opacity:0}100%{opacity:1}} .build-expand-contract-ph1{animation:build-expand-contract-ph1 8s infinite} @keyframes build-expand-contract-ph1{0%,20%{opacity:0}23%,58%{opacity:1}61%,100%{opacity:0}} .build-expand-contract-ph2{animation:build-expand-contract-ph2 8s infinite} @keyframes build-expand-contract-ph2{0%,58%{opacity:0}61%,92%{opacity:1}96%,100%{opacity:0}} .build-expand-contract-o0{animation:build-expand-contract-o0 8s infinite} @keyframes build-expand-contract-o0{0%,25%{opacity:1}30%,92%{opacity:0}97%,100%{opacity:1}} .build-expand-contract-n0{opacity:0;animation:build-expand-contract-n0 8s infinite} @keyframes build-expand-contract-n0{0%,25%{opacity:0}30%,90%{opacity:1}95%,100%{opacity:0}} .build-expand-contract-o1{animation:build-expand-contract-o1 8s infinite} @keyframes build-expand-contract-o1{0%,37%{opacity:1}42%,92%{opacity:0}97%,100%{opacity:1}} .build-expand-contract-n1{opacity:0;animation:build-expand-contract-n1 8s infinite} @keyframes build-expand-contract-n1{0%,37%{opacity:0}42%,90%{opacity:1}95%,100%{opacity:0}} .build-expand-contract-o2{animation:build-expand-contract-o2 8s infinite} @keyframes build-expand-contract-o2{0%,49%{opacity:1}54%,92%{opacity:0}97%,100%{opacity:1}} .build-expand-contract-n2{opacity:0;animation:build-expand-contract-n2 8s infinite} @keyframes build-expand-contract-n2{0%,49%{opacity:0}54%,90%{opacity:1}95%,100%{opacity:0}} </style> <defs><marker id=\"build-expand-contract-ao\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path class=\"build-expand-contract-ah\" d=\"M0 0L10 5L0 10z\"/></marker><marker id=\"build-expand-contract-an\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path class=\"build-expand-contract-ahn\" d=\"M0 0L10 5L0 10z\"/></marker></defs><path class=\"build-expand-contract-ln\" d=\"M184 30H240M400 30H456\"/><rect class=\"build-expand-contract-pill\" x=\"24\" y=\"16\" width=\"160\" height=\"28\" rx=\"14\"/><rect class=\"build-expand-contract-on build-expand-contract-ph0\" x=\"24\" y=\"16\" width=\"160\" height=\"28\" rx=\"14\"/><text class=\"build-expand-contract-t\" x=\"104\" y=\"35\" text-anchor=\"middle\">1 Expand</text><rect class=\"build-expand-contract-pill\" x=\"240\" y=\"16\" width=\"160\" height=\"28\" rx=\"14\"/><rect class=\"build-expand-contract-on build-expand-contract-ph1\" x=\"240\" y=\"16\" width=\"160\" height=\"28\" rx=\"14\"/><text class=\"build-expand-contract-t\" x=\"320\" y=\"35\" text-anchor=\"middle\">2 Migrate callers</text><rect class=\"build-expand-contract-pill\" x=\"456\" y=\"16\" width=\"160\" height=\"28\" rx=\"14\"/><rect class=\"build-expand-contract-on build-expand-contract-ph2\" x=\"456\" y=\"16\" width=\"160\" height=\"28\" rx=\"14\"/><text class=\"build-expand-contract-t\" x=\"536\" y=\"35\" text-anchor=\"middle\">3 Contract</text><rect class=\"build-expand-contract-panel\" x=\"24\" y=\"80\" width=\"152\" height=\"44\" rx=\"10\"/><text class=\"build-expand-contract-t\" x=\"100\" y=\"107\" text-anchor=\"middle\">Mobile app</text><rect class=\"build-expand-contract-panel\" x=\"24\" y=\"150\" width=\"152\" height=\"44\" rx=\"10\"/><text class=\"build-expand-contract-t\" x=\"100\" y=\"177\" text-anchor=\"middle\">Billing job</text><rect class=\"build-expand-contract-panel\" x=\"24\" y=\"220\" width=\"152\" height=\"44\" rx=\"10\"/><text class=\"build-expand-contract-t\" x=\"100\" y=\"247\" text-anchor=\"middle\">Partner</text><rect class=\"build-expand-contract-panel\" x=\"400\" y=\"76\" width=\"216\" height=\"192\" rx=\"12\"/><text class=\"build-expand-contract-m\" x=\"416\" y=\"102\">API response</text><rect class=\"build-expand-contract-box\" x=\"416\" y=\"196\" width=\"184\" height=\"40\" rx=\"8\" stroke-dasharray=\"5 4\"/><g class=\"build-expand-contract-of\"><rect class=\"build-expand-contract-fo\" x=\"416\" y=\"124\" width=\"184\" height=\"40\" rx=\"8\"/><text class=\"build-expand-contract-c\" x=\"430\" y=\"149\">user_name</text><text class=\"build-expand-contract-dep\" x=\"588\" y=\"149\" text-anchor=\"end\">deprecated</text></g><g class=\"build-expand-contract-nf\"><rect class=\"build-expand-contract-fn\" x=\"416\" y=\"196\" width=\"184\" height=\"40\" rx=\"8\"/><text class=\"build-expand-contract-c\" x=\"430\" y=\"221\">username</text><text class=\"build-expand-contract-m\" x=\"588\" y=\"221\" text-anchor=\"end\">new</text></g><path class=\"build-expand-contract-old build-expand-contract-o0\" d=\"M176 102L406 144\" marker-end=\"url(#build-expand-contract-ao)\"/><path class=\"build-expand-contract-new build-expand-contract-n0\" d=\"M176 102L406 216\" marker-end=\"url(#build-expand-contract-an)\"/><path class=\"build-expand-contract-old build-expand-contract-o1\" d=\"M176 172L406 144\" marker-end=\"url(#build-expand-contract-ao)\"/><path class=\"build-expand-contract-new build-expand-contract-n1\" d=\"M176 172L406 216\" marker-end=\"url(#build-expand-contract-an)\"/><path class=\"build-expand-contract-old build-expand-contract-o2\" d=\"M176 242L406 144\" marker-end=\"url(#build-expand-contract-ao)\"/><path class=\"build-expand-contract-new build-expand-contract-n2\" d=\"M176 242L406 216\" marker-end=\"url(#build-expand-contract-an)\"/> </svg>"
        },
        {
          "type": "h",
          "text": "Errors as values versus exceptions"
        },
        {
          "type": "p",
          "text": "Exceptions separate the happy path from error handling and unwind automatically, but they are invisible in signatures, so callers may forget they exist. Errors as values (Go's `(result, err)`, Rust's `Result<T, E>`) make failure part of the type, forcing callers to handle it, at the price of verbosity. A common rule: use values for expected, recoverable outcomes (not found, validation failed, insufficient funds) and exceptions or panics for genuine bugs and unrecoverable states. Whichever you use, never swallow errors silently, and include enough context to debug."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "A bare `catch (e) {}` or `except: pass` turns a loud failure into silent data corruption. If you catch, handle, translate or re-raise with context."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents optimize for the code in front of them, not for callers they cannot see. They rename fields, tighten validation or change return shapes as a convenient refactor, and sprinkle `any` casts or broad try/except blocks to make errors go away. Tell the agent which interfaces are public contracts and must not change, ask it to list every caller affected by a signature change, and require a failing contract or schema test for any API change. In review, search the diff for `any`, `ignore` comments and empty catch blocks."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A state object has optional `isLoading`, `error` and `data`, and bugs show `error` and `data` set together",
              "use": "Make illegal states unrepresentable",
              "why": "Model `Loading | Failed(error) | Loaded(data)` so impossible combinations cannot be built and the compiler forces each case. Costs some upfront modeling; pays off on any state shared across code."
            },
            {
              "signal": "Functions take `(userId: string, orderId: string)` and a swapped argument compiled and shipped",
              "use": "Value types / branded IDs",
              "why": "Distinct `UserId`, `OrderId` or `Currency` types make mixups a compile error and give validation a home. Adds wrapper types; reserve them for values that are easy to confuse or carry rules."
            },
            {
              "signal": "The same `if not is_valid_email(x)` checks appear in a dozen functions deep inside the code",
              "use": "Parse, don't validate",
              "why": "Parse raw input once at the edge into a type like `EmailAddress` that can only hold valid values, then pass that type inward. Inner code trusts the type and the repeated checks disappear."
            },
            {
              "signal": "A handler types `req.body` as `CreateOrder` but malformed requests still crash deep in the service",
              "use": "Runtime schema at the trust boundary",
              "why": "Types vanish at runtime; validate HTTP, file, queue and LLM input with a schema library and reject early with a clear error. Derive the static type from the schema so the two cannot drift."
            },
            {
              "signal": "Looking up a user by email that does not exist throws an exception that every caller wraps in try/catch",
              "use": "Result / Option return",
              "why": "Expected outcomes belong in the signature (`User | None`, `Result<User, NotFound>`) so callers must handle them. Keep exceptions for bugs and truly exceptional failures."
            },
            {
              "signal": "Code contains `catch (e) {}` or logs and continues with a half-initialized object",
              "use": "Fail fast with context",
              "why": "Let unexpected errors propagate, wrapped with what was being attempted, or crash the operation. Swallowed errors turn a clear failure into silent data corruption found weeks later."
            },
            {
              "signal": "A `switch` over an enum compiled fine when a new variant was added, and the new case silently fell to `default`",
              "use": "Exhaustiveness check",
              "why": "Omit `default` and use the compiler's exhaustive matching (`never` in TypeScript, `match` in Rust) so adding a variant fails the build at every unhandled site."
            },
            {
              "signal": "A public API is a generic `set_status(order, \"cancelled\")` and callers bypass the rules for cancelling",
              "use": "Intent-named operations",
              "why": "Expose `cancel_order()` that enforces preconditions and invariants in one place. The interface shrinks to valid moves; generic setters let every caller reinvent and break the rules."
            },
            {
              "signal": "A client crashed after the server added a new optional response field",
              "use": "Tolerant reader",
              "why": "Consumers ignore unknown fields and read only what they need, which makes additive server changes safe. Strict deserializers that reject unknown fields turn every addition into a breaking change."
            },
            {
              "signal": "A function silently misbehaves when given a negative quantity or an empty list that callers should never pass",
              "use": "Assert preconditions (design by contract)",
              "why": "Check the precondition at entry and fail immediately with a clear message, so the bug surfaces at the caller. For untrusted input use validation and error values instead of assertions."
            }
          ]
        }
      ],
      "keyPoints": [
        "An interface is a contract; callers depend on it, so changes can break far-away code.",
        "Types catch shape errors early, but runtime data at boundaries must still be validated.",
        "Parse once at the edge into trusted types; do not re-validate everywhere.",
        "Additive changes are safe; renames, removals and meaning changes are breaking; use expand-and-contract.",
        "Use error values for expected failures and exceptions for bugs; never swallow errors."
      ],
      "quiz": [
        {
          "q": "A service adds a new optional field `nickname` to its JSON response. Which statement is most accurate?",
          "options": [
            "Safe for clients that ignore unknown fields, which is typical",
            "Breaking, because any change to a schema breaks its clients",
            "Breaking, so it must ship only as a new major API version",
            "Breaking for every existing client that does not read it"
          ],
          "answer": 0,
          "explain": "Additive optional fields are backwards compatible for tolerant readers. Strict clients that reject unknown fields are the exception."
        },
        {
          "q": "Your TypeScript API handler types `req.body` as `CreateOrder`, but malformed requests still crash the service. Why?",
          "options": [
            "TypeScript is dynamically typed, so types are only hints",
            "The installed compiler version is too old to check bodies",
            "Type annotations are erased, so runtime input is unchecked",
            "The body must be typed as `any` for the checks to run"
          ],
          "answer": 2,
          "explain": "A type annotation is a compile-time claim, not a runtime check. Input from outside needs schema validation at the boundary."
        },
        {
          "q": "You must rename a widely used API field `user_name` to `username`. Which approach is safest?",
          "options": [
            "Rename it now and notify the consuming teams afterward",
            "Rename it and rely on the service's own tests to catch breaks",
            "Remove the old field and bump only the patch version",
            "Serve both fields for a deprecation period, then drop the old"
          ],
          "answer": 3,
          "explain": "Expand-and-contract lets consumers migrate at their own pace. A silent rename breaks anyone who has not updated, and your own tests cannot see external callers."
        },
        {
          "q": "Looking up a user by email that does not exist is a normal, expected outcome. Which design best matches common practice?",
          "options": [
            "Throw a generic `Exception` and let callers parse the message",
            "Return a typed result, such as `Option`, that callers must handle",
            "Return null, without mentioning it in the docs or signature",
            "Log an error and exit the process with a non-zero status"
          ],
          "answer": 1,
          "explain": "Expected outcomes belong in the return type so callers must handle them. Undocumented nulls and generic exceptions hide the case."
        },
        {
          "q": "What does 'parse, don't validate' recommend?",
          "options": [
            "Convert raw input once at the edge into a type that proves validity",
            "Re-check the data inside every function that consumes it",
            "Skip validation for requests from inside the trusted network",
            "Validate input only in the UI, before it reaches the server"
          ],
          "answer": 0,
          "explain": "Parsing at the edge yields a trusted internal type, so downstream code does not need repeated checks. Internal networks and the UI are not trust boundaries you can rely on."
        },
        {
          "q": "A bug shipped because `refund(orderId, userId)` was called as `refund(userId, orderId)`. Both are plain strings, so the compiler accepted it. What should you reach for?",
          "options": [
            "Validate every incoming request body with a runtime schema at the trust boundary",
            "Return a Result type from `refund` instead of throwing",
            "Give `OrderId` and `UserId` distinct types so a swap fails to compile",
            "Add an exhaustiveness check on the refund status enum"
          ],
          "answer": 2,
          "explain": "Distinct ID types turn the swap into a compile error. A runtime schema checks shape at the boundary but both IDs are still valid strings, so it cannot tell the order apart."
        }
      ]
    },
    {
      "id": "architecture",
      "title": "Architecture",
      "minutes": 12,
      "summary": "Layering, monolith vs microservices, events, dependency direction and boring technology.",
      "lesson": [
        {
          "type": "p",
          "text": "A startup with five engineers splits its app into twelve microservices because a conference talk said that is what scalable companies do. Six months later a simple feature touches four services, local development needs a cluster, and nobody can trace a failed request. Architecture is the set of structural decisions that are costly to reverse; its job is to make the most likely changes cheap."
        },
        {
          "type": "h",
          "text": "Layering and dependency direction"
        },
        {
          "type": "p",
          "text": "A **layered** design groups code by role, for example presentation (HTTP handlers, UI), domain (business rules) and infrastructure (database, external APIs). The key rule is about **dependency direction**: dependencies should point toward the stable, valuable core. The domain should not import the web framework or the ORM; infrastructure depends on the domain by implementing interfaces the domain defines. This is the idea behind hexagonal or 'clean' architecture: business rules can be tested without a database and survive a framework swap."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# domain/orders.py - knows nothing about SQL or HTTP\nclass OrderRepository:            # interface owned by the domain\n    def get(self, order_id): ...\n    def save(self, order): ...\n\ndef cancel_order(order_id, repo: OrderRepository):\n    order = repo.get(order_id)\n    order.cancel()                # business rule lives here\n    repo.save(order)\n\n# infrastructure/sql_orders.py - depends on the domain, not vice versa\nclass SqlOrderRepository(OrderRepository):\n    def get(self, order_id): ...  # SQL here\n    def save(self, order): ..."
        },
        {
          "type": "figure",
          "id": "build-dependency-direction",
          "caption": "Solid arrows (source dependencies) all point into the domain, yet at runtime the call still flows out through the OrderRepository interface to SQL.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"Presentation, domain and infrastructure layers. Source dependencies point into the domain, while a runtime call travels from the HTTP handler through the domain interface out to the SQL repository and database\"> <style> .build-dependency-direction-t{font-size:13px;fill:var(--fig-ink)} .build-dependency-direction-h{font-size:15px;font-weight:600;fill:var(--fig-ink)} .build-dependency-direction-m{font-size:13px;fill:var(--fig-muted)} .build-dependency-direction-c{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;fill:var(--fig-ink)} .build-dependency-direction-panel{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .build-dependency-direction-ah{fill:var(--fig-muted)} .build-dependency-direction-ln{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .build-dependency-direction-core{fill:var(--fig-accent);fill-opacity:.08;stroke:var(--fig-accent);stroke-width:2} .build-dependency-direction-chip{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .build-dependency-direction-hl{fill:var(--fig-accent2);fill-opacity:.18;stroke:var(--fig-accent2);stroke-width:2;opacity:0} .build-dependency-direction-dep{stroke:var(--fig-ink);stroke-width:2;fill:none} .build-dependency-direction-ahk{fill:var(--fig-ink)} .build-dependency-direction-num{fill:var(--fig-accent2)} .build-dependency-direction-nt{font-size:11px;font-weight:700;fill:var(--fig-bg);text-anchor:middle} .build-dependency-direction-ct{font-size:13px;fill:var(--fig-ink);text-anchor:middle} .build-dependency-direction-h0{animation:build-dependency-direction-h0 6s ease-in-out infinite} @keyframes build-dependency-direction-h0{0%,5%{opacity:0}8%,19%{opacity:1}23%,100%{opacity:0}} .build-dependency-direction-h1{animation:build-dependency-direction-h1 6s ease-in-out infinite} @keyframes build-dependency-direction-h1{0%,19%{opacity:0}22%,33%{opacity:1}37%,100%{opacity:0}} .build-dependency-direction-h2{animation:build-dependency-direction-h2 6s ease-in-out infinite} @keyframes build-dependency-direction-h2{0%,33%{opacity:0}36%,47%{opacity:1}51%,100%{opacity:0}} .build-dependency-direction-h3{animation:build-dependency-direction-h3 6s ease-in-out infinite} @keyframes build-dependency-direction-h3{0%,47%{opacity:0}50%,61%{opacity:1}65%,100%{opacity:0}} .build-dependency-direction-h4{animation:build-dependency-direction-h4 6s ease-in-out infinite} @keyframes build-dependency-direction-h4{0%,61%{opacity:0}64%,75%{opacity:1}79%,100%{opacity:0}} </style> <defs><marker id=\"build-dependency-direction-arr\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path class=\"build-dependency-direction-ahk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"build-dependency-direction-panel\" x=\"16\" y=\"24\" width=\"152\" height=\"232\" rx=\"12\"/><text class=\"build-dependency-direction-h\" x=\"92\" y=\"50\" text-anchor=\"middle\">Presentation</text><text class=\"build-dependency-direction-m\" x=\"92\" y=\"70\" text-anchor=\"middle\">web framework</text><rect class=\"build-dependency-direction-core\" x=\"248\" y=\"24\" width=\"144\" height=\"232\" rx=\"12\"/><text class=\"build-dependency-direction-h\" x=\"320\" y=\"50\" text-anchor=\"middle\">Domain</text><text class=\"build-dependency-direction-m\" x=\"320\" y=\"70\" text-anchor=\"middle\">business rules</text><rect class=\"build-dependency-direction-panel\" x=\"472\" y=\"24\" width=\"152\" height=\"232\" rx=\"12\"/><text class=\"build-dependency-direction-h\" x=\"548\" y=\"50\" text-anchor=\"middle\">Infrastructure</text><text class=\"build-dependency-direction-m\" x=\"548\" y=\"70\" text-anchor=\"middle\">database, APIs</text><rect class=\"build-dependency-direction-chip\" x=\"28\" y=\"96\" width=\"128\" height=\"40\" rx=\"8\"/><rect class=\"build-dependency-direction-chip\" x=\"256\" y=\"96\" width=\"128\" height=\"40\" rx=\"8\"/><rect class=\"build-dependency-direction-chip\" x=\"256\" y=\"176\" width=\"128\" height=\"40\" rx=\"8\"/><rect class=\"build-dependency-direction-chip\" x=\"480\" y=\"176\" width=\"136\" height=\"40\" rx=\"8\"/><rect class=\"build-dependency-direction-chip\" x=\"480\" y=\"96\" width=\"136\" height=\"40\" rx=\"8\"/><rect class=\"build-dependency-direction-hl build-dependency-direction-h0\" x=\"28\" y=\"96\" width=\"128\" height=\"40\" rx=\"8\"/><text class=\"build-dependency-direction-ct\" x=\"92\" y=\"121\">HTTP handler</text><circle class=\"build-dependency-direction-num\" cx=\"28\" cy=\"96\" r=\"9\"/><text class=\"build-dependency-direction-nt\" x=\"28\" y=\"100\">1</text><rect class=\"build-dependency-direction-hl build-dependency-direction-h1\" x=\"256\" y=\"96\" width=\"128\" height=\"40\" rx=\"8\"/><text class=\"build-dependency-direction-ct\" x=\"320\" y=\"121\">cancel_order()</text><circle class=\"build-dependency-direction-num\" cx=\"256\" cy=\"96\" r=\"9\"/><text class=\"build-dependency-direction-nt\" x=\"256\" y=\"100\">2</text><rect class=\"build-dependency-direction-hl build-dependency-direction-h2\" x=\"256\" y=\"176\" width=\"128\" height=\"40\" rx=\"8\"/><text class=\"build-dependency-direction-ct\" x=\"320\" y=\"201\">OrderRepository</text><circle class=\"build-dependency-direction-num\" cx=\"256\" cy=\"176\" r=\"9\"/><text class=\"build-dependency-direction-nt\" x=\"256\" y=\"180\">3</text><rect class=\"build-dependency-direction-hl build-dependency-direction-h3\" x=\"480\" y=\"176\" width=\"136\" height=\"40\" rx=\"8\"/><text class=\"build-dependency-direction-ct\" x=\"548\" y=\"201\">SqlOrderRepository</text><circle class=\"build-dependency-direction-num\" cx=\"480\" cy=\"176\" r=\"9\"/><text class=\"build-dependency-direction-nt\" x=\"480\" y=\"180\">4</text><rect class=\"build-dependency-direction-hl build-dependency-direction-h4\" x=\"480\" y=\"96\" width=\"136\" height=\"40\" rx=\"8\"/><text class=\"build-dependency-direction-ct\" x=\"548\" y=\"121\">SQL database</text><circle class=\"build-dependency-direction-num\" cx=\"480\" cy=\"96\" r=\"9\"/><text class=\"build-dependency-direction-nt\" x=\"480\" y=\"100\">5</text><path class=\"build-dependency-direction-dep\" d=\"M156 116H254\" marker-end=\"url(#build-dependency-direction-arr)\"/><text class=\"build-dependency-direction-m\" x=\"208\" y=\"106\" text-anchor=\"middle\">imports</text><path class=\"build-dependency-direction-dep\" d=\"M480 196H386\" marker-end=\"url(#build-dependency-direction-arr)\"/><text class=\"build-dependency-direction-m\" x=\"432\" y=\"186\" text-anchor=\"middle\">implements</text><path class=\"build-dependency-direction-dep\" d=\"M320 136V174\" marker-end=\"url(#build-dependency-direction-arr)\"/><text class=\"build-dependency-direction-m\" x=\"320\" y=\"238\" text-anchor=\"middle\">interface</text><path class=\"build-dependency-direction-dep\" d=\"M40 284H72\" marker-end=\"url(#build-dependency-direction-arr)\"/><text class=\"build-dependency-direction-t\" x=\"82\" y=\"289\">source dependency: points into the domain</text><circle class=\"build-dependency-direction-num\" cx=\"384\" cy=\"284\" r=\"9\"/><text class=\"build-dependency-direction-nt\" x=\"384\" y=\"288\">1</text><text class=\"build-dependency-direction-t\" x=\"400\" y=\"289\">runtime call order</text> </svg>"
        },
        {
          "type": "h",
          "text": "Modular monolith versus microservices"
        },
        {
          "type": "p",
          "text": "A **monolith** deploys as one unit. A **modular monolith** keeps one deployable but enforces strong internal module boundaries (each module exposes a small public interface and owns its data). **Microservices** split into independently deployed services communicating over the network. Microservices buy independent deployment and scaling per team, and fault isolation; they cost network latency, partial failure, distributed data consistency, harder debugging and heavy operational overhead. Those costs pay off mainly when many teams need to deploy independently. For most teams, a modular monolith delivers most of the benefit, and a well-bounded module can be extracted into a service later if needed."
        },
        {
          "type": "list",
          "items": [
            "Split by business capability (billing, catalog), not by technical layer.",
            "A 'distributed monolith', services that must deploy together, has the costs of both worlds.",
            "Shared databases between services defeat the purpose; they couple through the schema."
          ]
        },
        {
          "type": "h",
          "text": "Event-driven architecture"
        },
        {
          "type": "p",
          "text": "In an event-driven design, components publish facts ('OrderPlaced') to a broker or queue and others react asynchronously, instead of calling each other directly. This decouples producers from consumers, absorbs traffic spikes and makes adding a new reaction easy. The costs: control flow is harder to follow, ordering and duplicates must be handled (consumers should be idempotent: processing a message twice has the same effect as once), and you get eventual rather than immediate consistency. Use it where asynchrony is natural, such as notifications, indexing and integrations, not as a default for every call."
        },
        {
          "type": "h",
          "text": "Choosing boring technology"
        },
        {
          "type": "p",
          "text": "Every team has a small budget of novelty, and each new database, language or framework spends from it. Boring technology (PostgreSQL, a mainstream web framework, a queue you already operate) has known failure modes, plentiful documentation and people who can run it at 3 a.m. Choose novel tools only when they solve a problem the boring option demonstrably cannot, and write the decision and its trade-offs down in a short architecture decision record (ADR) so the reasoning survives."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Ask of any architectural idea: what change does this make cheaper, and what does it make more expensive? If you cannot name a concrete likely change, you are probably paying for fashion."
        },
        {
          "type": "h",
          "text": "Pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Designing for a scale you do not have yet.",
            "Layers that exist only as folders, with every layer importing every other.",
            "Skipping the written decision, so the next engineer reverses it unknowingly."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents work file by file, so they erode architecture silently: a handler imports the database directly, a domain module pulls in the web framework, a new dependency appears for a ten-line helper. They also eagerly propose trendy stacks. Give the agent the architecture in writing (layers, allowed dependency directions, approved technologies) in its project instructions, and enforce it with an automated import-boundary check or lint rule. In review, scan for new imports and new dependencies before reading the logic."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Business rules import the ORM, the HTTP framework or a cloud SDK, so they cannot be tested without them",
              "use": "Hexagonal (ports and adapters)",
              "why": "The domain defines interfaces (ports) and infrastructure implements them (adapters), so dependencies point toward the core. Overkill for CRUD apps with little logic; layers can be thin there."
            },
            {
              "signal": "A small team with one deploy cadence is about to split a new product into many microservices",
              "use": "Modular monolith first",
              "why": "One deployable with enforced module boundaries gives most modularity benefits without network failures, distributed tracing and multi-service deploys. Extract a service later when a module truly needs it."
            },
            {
              "signal": "Two services share database tables and must always be deployed together",
              "use": "Each service owns its data",
              "why": "Shared tables couple services through the schema, giving a distributed monolith. Give each service its own store and an API or events; if they always change together, merge them back."
            },
            {
              "signal": "A legacy system must be replaced, but a big-bang rewrite would freeze features for a year",
              "use": "Strangler fig",
              "why": "Route one capability at a time to new code behind a facade or proxy until the old system has nothing left. Slower than a rewrite on paper, but every step ships and can be reverted."
            },
            {
              "signal": "An order service calls email, loyalty and analytics synchronously, and fails when any of them is down",
              "use": "Publish domain events via a broker",
              "why": "Publish `OrderPlaced` to a queue and let consumers react asynchronously, removing runtime coupling. You accept eventual consistency and harder debugging, so keep critical-path calls synchronous."
            },
            {
              "signal": "A consumer occasionally processes the same message twice and double-charges or double-sends",
              "use": "Idempotent consumer",
              "why": "Brokers deliver at least once, so dedupe by message ID or make the operation naturally idempotent (upsert, set state). Store processed IDs in the same transaction as the effect."
            },
            {
              "signal": "Code writes to the database and then publishes an event, and a crash between the two loses or fakes events",
              "use": "Transactional outbox",
              "why": "Write the event to an outbox table in the same transaction as the data, and a relay publishes it afterwards. Gives at-least-once delivery, so consumers must still be idempotent."
            },
            {
              "signal": "Someone proposes a new database or language for a feature that fits fine in the existing PostgreSQL",
              "use": "Choose boring technology",
              "why": "Known tools have known failure modes and operators; each novel one spends the team's limited innovation budget. Adopt new tech when the existing stack clearly cannot do the job."
            },
            {
              "signal": "A costly-to-reverse decision (new datastore, service split) is made in a chat thread and later forgotten",
              "use": "Architecture Decision Record",
              "why": "A short ADR records context, decision and consequences in the repo, so the next engineer knows why and does not reverse it blindly. Keep it to a page; it is a log, not a spec."
            },
            {
              "signal": "Folders say `domain` and `infra`, but imports cross every layer in every direction",
              "use": "Enforced module boundaries",
              "why": "Add dependency rules to CI (import linters, architecture tests, build modules) so violations fail the build. Folder conventions alone erode under deadline pressure."
            }
          ]
        }
      ],
      "keyPoints": [
        "Architecture is the set of costly-to-reverse decisions; aim to make likely changes cheap.",
        "Dependencies should point toward the stable domain core, not toward frameworks and databases.",
        "A modular monolith gives most benefits of modularity without the distributed-systems tax.",
        "Event-driven designs decouple components but need idempotent consumers and accept eventual consistency.",
        "Prefer boring technology and record decisions in ADRs."
      ],
      "quiz": [
        {
          "q": "A five-person team is building a new product with a single deploy cadence. Which is the strongest default?",
          "options": [
            "One microservice per database entity",
            "A modular monolith with clear module boundaries",
            "A separate database for each developer",
            "A separately deployed service per team member"
          ],
          "answer": 1,
          "explain": "A small team with one release cadence pays the full operational cost of a distributed system without the independent-deploy benefit. A modular monolith keeps boundaries cheap."
        },
        {
          "q": "In a layered design following correct dependency direction, which import is a violation?",
          "options": [
            "The SQL repository imports the interface the domain defines",
            "The HTTP handler imports and calls a domain function",
            "The domain module imports the web framework's request object",
            "A unit test imports the domain module it is testing"
          ],
          "answer": 2,
          "explain": "The domain core should not depend on delivery or infrastructure details. The other imports point inward, which is correct."
        },
        {
          "q": "Why must an event consumer typically be idempotent?",
          "options": [
            "Brokers commonly deliver the same message more than once",
            "Brokers guarantee exactly-once, in-order delivery by default",
            "Idempotent consumers make each message payload smaller",
            "It lets consumers skip reading the event body entirely"
          ],
          "answer": 0,
          "explain": "Most brokers guarantee at-least-once delivery, so retries and duplicates occur; processing twice must not double-charge or double-ship."
        },
        {
          "q": "Two services share one database table and must always be deployed together. What best describes this?",
          "options": [
            "A well-factored microservice architecture",
            "A distributed monolith, paying the costs of both styles",
            "An event-driven design whose services are loosely coupled",
            "A clean architecture with inward dependencies"
          ],
          "answer": 1,
          "explain": "They are coupled through the schema and the release process, so they gain no independence but pay network and operational costs."
        },
        {
          "q": "A teammate proposes a new graph database for a feature that fits fine in your existing PostgreSQL. What is the best response?",
          "options": [
            "Approve it, since adopting new tech builds team skills",
            "Reject it, and ban all new technology from now on",
            "Adopt it alongside Postgres and store the data in both",
            "Ask what Postgres cannot do here, weigh the cost, record it"
          ],
          "answer": 3,
          "explain": "Novelty has a running cost. Require a demonstrated limit of the boring option, and document the trade-off in an ADR either way."
        },
        {
          "q": "The order service saves the order, then publishes `OrderPlaced` to the broker. After a crash between the two steps, billing never hears about some orders that exist in the database. Which approach fits best?",
          "options": [
            "Write the event to an outbox table in the same transaction and relay it",
            "Make the billing consumer idempotent so that it safely ignores any duplicate events",
            "Split the order service into two smaller microservices",
            "Record the choice of broker in an Architecture Decision Record"
          ],
          "answer": 0,
          "explain": "The outbox makes the save and the event commit atomically. An idempotent consumer protects against duplicates but cannot recover an event that was never published."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "You review an agent's pull request. A function `handle(data, flag)` contains 120 lines and the agent added the comment `# handle the data` above it. What is the most valuable review feedback?",
      "options": [
        "Ask for meaningful names, extracted steps and a why-comment",
        "Approve, since the new comment documents what it does",
        "Ask the agent to expand the comment into a full paragraph",
        "Ask the agent to wrap the function in a new class"
      ],
      "answer": 0,
      "explain": "Names and structure carry intent; a what-comment adds noise. A longer comment or an extra class does not fix the unclear intent."
    },
    {
      "q": "You see a `utils.py` of 2,000 lines mixing date helpers, HTTP code and tax rules, and the agent proposes adding another function there. Which principle is most directly at stake?",
      "options": [
        "Liskov Substitution",
        "Open/Closed",
        "Dependency Inversion",
        "Single Responsibility"
      ],
      "answer": 3,
      "explain": "The module has many unrelated reasons to change, so cohesion is low. Adding more makes it worse."
    },
    {
      "q": "A shared `format_price(amount, currency, mode, legacy, round_up, for_email)` function has grown flags to serve eight callers. What is the likely diagnosis and fix?",
      "options": [
        "Missing tests; add tests and keep adding flags as needed",
        "A YAGNI violation caused by having too few features",
        "A wrong abstraction; split it, keeping only the shared core",
        "Healthy reuse, since it prevents any duplicated code"
      ],
      "answer": 2,
      "explain": "Flag growth signals callers that change for different reasons. Splitting restores locality; avoiding duplication at any cost is the trap."
    },
    {
      "q": "Your domain `ReportService` constructs a `PostgresClient` directly, so its unit tests need a live database. Which change best addresses the design problem?",
      "options": [
        "Start a shared Postgres instance before every test run",
        "Copy the database code into ReportService to drop the import",
        "Relabel those tests as integration tests and skip them",
        "Depend on a repository interface and inject the implementation"
      ],
      "answer": 3,
      "explain": "Dependency Inversion: the domain depends on an abstraction it owns, and tests can pass a fake. The other options leave the domain welded to infrastructure."
    },
    {
      "q": "You squash a branch of 14 messy commits ('wip', 'fix', 'fix2') before merging. What do you gain and lose?",
      "options": [
        "Nothing is gained, and all history including the PR is lost",
        "A readable main with one coherent commit; intermediate steps go",
        "Granular history on main is gained, at the cost of readability",
        "Signed commits are gained, and nothing at all is lost"
      ],
      "answer": 1,
      "explain": "Squash trades granularity for a clean, reviewable unit on main; the hosting platform typically still shows the original commits in the pull request."
    },
    {
      "q": "You rebased a feature branch that a teammate had already pulled, and pushed with force. What is the most likely consequence?",
      "options": [
        "Nothing; git reconciles the two histories automatically",
        "Their branch diverges and duplicate commits must be untangled",
        "The remote repository and its other branches are deleted",
        "Their local files update safely on their next pull"
      ],
      "answer": 1,
      "explain": "Rebase creates new commits with new hashes, so the teammate's copy no longer lines up with the remote branch."
    },
    {
      "q": "A test suite is green locally but fails intermittently on CI. The failing test builds a report and compares it to a list produced by iterating a hash set. What is the most probable cause and fix?",
      "options": [
        "Unordered iteration; sort first or compare as sets",
        "A faulty CI runner; retry the job until it is green",
        "Insufficient coverage of the report-building code",
        "The test runs too fast for the CI machine's clock"
      ],
      "answer": 0,
      "explain": "Iteration order of unordered collections is not guaranteed, so assertions must not depend on it. Retrying masks the nondeterminism."
    },
    {
      "q": "An agent was told 'make the failing tests pass' and edits the assertion `assert total == 108` to `assert total == 120`. What should you conclude?",
      "options": [
        "Good work: a failing test means the test itself was wrong",
        "Good work: coverage is unchanged and the build is green",
        "It obeyed the instruction but weakened the spec; ask why",
        "Acceptable, as long as it deletes the test afterwards"
      ],
      "answer": 2,
      "explain": "Passing tests are only meaningful if assertions encode correct behavior. Changing the expected value without justification may hide a real bug."
    },
    {
      "q": "A code base has 95% line coverage, but a critical discount bug shipped. Which explanation is most plausible?",
      "options": [
        "Over 90% coverage guarantees correctness, so it is impossible",
        "Unit tests are unable to detect logic bugs of any kind",
        "The tests were too slow to run on every single commit",
        "Coverage counts executed lines, not verified behavior"
      ],
      "answer": 3,
      "explain": "Executed lines with weak or missing assertions give high coverage and little protection."
    },
    {
      "q": "Your public API used to accept `quantity` up to 1000; you want to reject anything above 100. How should you treat this change?",
      "options": [
        "Additive and safe, since valid requests still succeed",
        "Breaking for some callers; announce, deprecate, then enforce",
        "Safe, because validation is an internal implementation detail",
        "Breaking only if the response JSON shape also changes"
      ],
      "answer": 1,
      "explain": "Tightening validation makes previously valid requests fail, which is a breaking change even though no field changed. Communicate it and give callers time."
    },
    {
      "q": "In review you find `try: sync_inventory() except Exception: pass`, added by an agent 'to fix a flaky crash'. What is the main risk?",
      "options": [
        "Catching Exception is slower than catching a specific type",
        "Python forbids catching the base Exception class",
        "The crash still surfaces, just with a longer traceback",
        "Failures become silent, so stock data can drift unnoticed"
      ],
      "answer": 3,
      "explain": "Swallowing errors turns a loud failure into silent corruption. Fix the root cause, or catch narrowly and handle, translate or re-raise with context."
    },
    {
      "q": "A payment function returns `None` for insufficient funds, `None` for network error, and `None` for unknown account. What is the design problem?",
      "options": [
        "Callers cannot tell the different failures apart",
        "Returning None from any function is always forbidden",
        "It should raise one generic exception for every case",
        "Nothing; None is enough to signal any kind of failure"
      ],
      "answer": 0,
      "explain": "Callers need to tell expected failures from transient errors (retry the network error, not the empty account). Use a typed result or distinct errors."
    },
    {
      "q": "Six months after the team chose PostgreSQL over a document store, a new engineer proposes switching, unaware of the original reasons. Which practice would most likely have prevented the repeated debate?",
      "options": [
        "A rule that every database choice needs CTO sign-off",
        "Splitting into microservices so each team can choose",
        "A short ADR recording the decision and its trade-offs",
        "A larger test suite covering the database layer"
      ],
      "answer": 2,
      "explain": "An architecture decision record preserves the context and trade-offs, so the next engineer can see why and decide whether the reasons still hold."
    },
    {
      "q": "After search indexing moves to consuming `ProductUpdated` events, users sometimes see stale search results for a few seconds after editing a product. What is this?",
      "options": [
        "A bug showing the indexing consumer is not idempotent",
        "Expected eventual consistency from asynchronous processing",
        "Evidence that the broker silently drops messages",
        "A dependency-direction violation in the domain layer"
      ],
      "answer": 1,
      "explain": "Asynchronous consumers lag the write by design. A short delay is the eventual-consistency trade-off, not lost or duplicated messages."
    }
  ]
});
