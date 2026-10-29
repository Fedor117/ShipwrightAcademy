window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "maintain",
  "title": "Maintaining",
  "tagline": "Keep software alive, safe, fast and understandable long after the first release.",
  "intro": "Most of a system's life is spent after the first version ships, and most of the code you touch will be code someone else wrote. AI agents make it cheap to add code and easy to add a lot of it, so the discipline of keeping a codebase small, healthy, documented and recoverable matters more, not less. This section teaches the habits that stop that growth from turning into an unmaintainable mess.",
  "topics": [
    {
      "id": "refactoring-tech-debt",
      "title": "Refactoring & Technical Debt",
      "minutes": 9,
      "summary": "Change the structure of code without changing what it does, and treat shortcuts as loans you consciously take.",
      "lesson": [
        {
          "type": "p",
          "text": "You are asked to add a new discount rule to a 600-line `calculate_total` function. It mixes tax, shipping, coupons and rounding in one tangle of nested ifs. You can bolt the new rule on and pray, or you can first make the function easier to change. The second option is refactoring."
        },
        {
          "type": "h",
          "text": "What refactoring is (and is not)"
        },
        {
          "type": "p",
          "text": "**Refactoring** is changing the internal structure of code without changing its observable behaviour. The second half is the whole definition. If behaviour changes, even for the better, you are doing a feature or a bug fix, not a refactor. Mixing the two in one commit makes review hard and makes it impossible to tell which change broke something."
        },
        {
          "type": "p",
          "text": "Typical refactorings are small and mechanical: rename a variable, extract a function, inline a pointless wrapper, replace a conditional with polymorphism, move a function to the module that owns its data. Each step is tiny so that, if tests fail, you know exactly which step caused it."
        },
        {
          "type": "h",
          "text": "The safety net: tests"
        },
        {
          "type": "p",
          "text": "Refactoring without tests is just editing and hoping. Before restructuring code that has no tests, write **characterization tests**: tests that record what the code actually does today, right or wrong, by feeding it inputs and asserting on whatever comes out. They do not claim the behaviour is correct, only that it is current. If a refactor changes an output, the test tells you."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# Characterization test: pin down current behaviour before touching it\ndef test_total_current_behaviour():\n    order = make_order(items=[(\"widget\", 10.00, 3)], coupon=\"SAVE10\", country=\"DE\")\n    # Value copied from running the legacy code, not from a spec\n    assert calculate_total(order) == 31.48\n\ndef test_total_rounding_quirk():\n    order = make_order(items=[(\"pen\", 0.333, 3)], coupon=None, country=\"US\")\n    assert calculate_total(order) == 1.00  # odd, but customers rely on it"
        },
        {
          "type": "p",
          "text": "Notice the second test: a quirk is pinned, not fixed. Fixing it is a separate, deliberate, behaviour-changing commit."
        },
        {
          "type": "h",
          "text": "A safe refactoring loop"
        },
        {
          "type": "list",
          "items": [
            "Get tests green (add characterization tests if coverage is thin).",
            "Make one small structural change.",
            "Run the tests. Green: commit. Red: revert and try a smaller step.",
            "Repeat until the code is easy to change, then make the actual feature change on top."
          ]
        },
        {
          "type": "figure",
          "id": "maintain-refactor-loop",
          "caption": "Each pass is one small change: green tests mean commit and take the next step, red means revert and try a smaller step.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Refactoring loop: tests green, one small change, run tests; green means commit and take the next step, red means revert and try a smaller step\"><style>.maintain-refactor-loop-t{font-size:14px;fill:var(--fig-ink)}.maintain-refactor-loop-s{font-size:12px;fill:var(--fig-muted)}.maintain-refactor-loop-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.maintain-refactor-loop-ln{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.maintain-refactor-loop-ah{fill:var(--fig-muted)}.maintain-refactor-loop-okb{fill:var(--fig-ok);fill-opacity:.12;stroke:var(--fig-ok);stroke-width:1.5}.maintain-refactor-loop-badb{fill:var(--fig-bad);fill-opacity:.12;stroke:var(--fig-bad);stroke-width:1.5}.maintain-refactor-loop-okl{fill:none;stroke:var(--fig-ok);stroke-width:1.5}.maintain-refactor-loop-badl{fill:none;stroke:var(--fig-bad);stroke-width:1.5}.maintain-refactor-loop-okt{font-size:13px;fill:var(--fig-ok)}.maintain-refactor-loop-badt{font-size:13px;fill:var(--fig-bad)}.maintain-refactor-loop-dot{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:maintain-refactor-loop-mv 8s linear infinite}@keyframes maintain-refactor-loop-mv{0%{transform:translate(0px,0px)}4.8%{transform:translate(95px,0px)}13.5%{transform:translate(265px,0px)}20.8%{transform:translate(409px,0px)}30.6%{transform:translate(409px,192px)}48.7%{transform:translate(55px,192px)}58.4%{transform:translate(55px,0px)}69.1%{transform:translate(265px,0px)}75.3%{transform:translate(265px,120px)}81.9%{transform:translate(135px,120px)}88%{transform:translate(135px,0px)}94%{transform:translate(135px,0);opacity:1}97%{transform:translate(135px,0);opacity:0}99.9%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}}</style><defs><marker id=\"maintain-refactor-loop-arr\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path class=\"maintain-refactor-loop-ah\" d=\"M0,0 L10,5 L0,10 z\"/></marker></defs><rect class=\"maintain-refactor-loop-b\" x=\"16\" y=\"48\" width=\"130\" height=\"44\" rx=\"10\"/><rect class=\"maintain-refactor-loop-b\" x=\"176\" y=\"48\" width=\"160\" height=\"44\" rx=\"10\"/><rect class=\"maintain-refactor-loop-b\" x=\"366\" y=\"48\" width=\"120\" height=\"44\" rx=\"10\"/><rect class=\"maintain-refactor-loop-okb\" x=\"516\" y=\"48\" width=\"108\" height=\"44\" rx=\"10\"/><rect class=\"maintain-refactor-loop-badb\" x=\"366\" y=\"168\" width=\"120\" height=\"44\" rx=\"10\"/><circle class=\"maintain-refactor-loop-dot\" cx=\"161\" cy=\"70\" r=\"7\"/><text class=\"maintain-refactor-loop-t\" x=\"81\" y=\"75\" text-anchor=\"middle\">Tests green</text><text class=\"maintain-refactor-loop-t\" x=\"256\" y=\"75\" text-anchor=\"middle\">One small change</text><text class=\"maintain-refactor-loop-t\" x=\"426\" y=\"75\" text-anchor=\"middle\">Run tests</text><text class=\"maintain-refactor-loop-t\" x=\"570\" y=\"75\" text-anchor=\"middle\">Commit</text><text class=\"maintain-refactor-loop-t\" x=\"426\" y=\"195\" text-anchor=\"middle\">Revert</text><path class=\"maintain-refactor-loop-ln\" d=\"M146,70 H174\" marker-end=\"url(#maintain-refactor-loop-arr)\"/><path class=\"maintain-refactor-loop-ln\" d=\"M336,70 H364\" marker-end=\"url(#maintain-refactor-loop-arr)\"/><path class=\"maintain-refactor-loop-okl\" d=\"M486,70 H514\" marker-end=\"url(#maintain-refactor-loop-arr)\"/><text class=\"maintain-refactor-loop-okt\" x=\"501\" y=\"40\" text-anchor=\"middle\">green</text><path class=\"maintain-refactor-loop-badl\" d=\"M426,92 V166\" marker-end=\"url(#maintain-refactor-loop-arr)\"/><text class=\"maintain-refactor-loop-badt\" x=\"434\" y=\"134\">red</text><path class=\"maintain-refactor-loop-badl\" d=\"M366,190 H296 V94\" marker-end=\"url(#maintain-refactor-loop-arr)\"/><text class=\"maintain-refactor-loop-s\" x=\"358\" y=\"212\" text-anchor=\"end\">try a smaller step</text><path class=\"maintain-refactor-loop-okl\" d=\"M570,92 V262 H216 V94\" marker-end=\"url(#maintain-refactor-loop-arr)\"/><text class=\"maintain-refactor-loop-s\" x=\"393\" y=\"252\" text-anchor=\"middle\">next small step</text></svg>"
        },
        {
          "type": "p",
          "text": "A well-known phrasing of this is: make the change easy, then make the easy change."
        },
        {
          "type": "h",
          "text": "Technical debt as a tradeoff"
        },
        {
          "type": "p",
          "text": "**Technical debt** is the future cost created by choosing a quicker or simpler solution now. The metaphor is useful because debt can be rational: shipping a prototype with a hard-coded config to hit a launch date is a loan with a known purpose. What makes debt harmful is when it is accidental, undocumented, or never repaid, so that the interest (slower changes, more bugs, harder onboarding) compounds."
        },
        {
          "type": "list",
          "items": [
            "**Deliberate and prudent**: we know the shortcut, we wrote it down, we scheduled the payoff.",
            "**Accidental**: we did not know a better design existed; we only learn this later.",
            "**Reckless**: we skipped design because we did not care about the consequences."
          ]
        },
        {
          "type": "p",
          "text": "Debt is only worth paying down where you keep working. Ugly code in a module nobody touches costs nothing. Ugly code in the file changed every week costs a lot. Prioritise by change frequency times pain, not by aesthetic offence."
        },
        {
          "type": "h",
          "text": "Common pitfalls"
        },
        {
          "type": "list",
          "items": [
            "The big-bang rewrite disguised as a refactor: weeks without a green build, then an unreviewable diff.",
            "Refactoring and changing behaviour in the same commit.",
            "Refactoring code you have no reason to touch.",
            "Trusting a green test suite that does not actually cover the path you moved."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents are fast, confident refactorers and also fast at quietly changing behaviour. Ask for characterization tests first, then refactor in small commits, and tell the agent explicitly that tests must not change. If the diff edits existing assertions to make them pass, that is a red flag: the agent changed the spec, not the code. Also watch for 'while I was here' cleanups that touch unrelated files."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "You must restructure a function that has no tests and nobody can say what it is supposed to return",
              "use": "Characterization tests",
              "why": "Record what the code does today, quirks included, so any behaviour change shows up as a red test. They pin current behaviour, not correct behaviour; fix quirks in a separate commit."
            },
            {
              "signal": "A new rule must go into a tangled 600-line function and bolting it on feels risky",
              "use": "Preparatory refactoring",
              "why": "Make the change easy, then make the easy change: restructure first under green tests, then add the feature on top. Only worth it in code you are about to change anyway."
            },
            {
              "signal": "A refactor step leaves several tests red and you cannot tell which edit caused it",
              "use": "Green-red-revert micro-steps",
              "why": "One small structural change per run; green means commit, red means revert and take a smaller step. Feels slow, but you never debug a large broken diff."
            },
            {
              "signal": "A single commit both restructures code and changes an output, and the reviewer cannot tell which part is the fix",
              "use": "Separate refactor and behaviour commits",
              "why": "A pure refactor should leave every test untouched, which makes it easy to review and bisect. Mixing them hides the behaviour change inside noise."
            },
            {
              "signal": "You want to unit test logic that calls the database or the clock directly and cannot be isolated",
              "use": "Introduce a seam",
              "why": "Create a point where behaviour can be swapped without editing the call site, such as a parameter, interface or injected function. Adds indirection, so add seams only where tests need them."
            },
            {
              "signal": "A long chain of `if type == ...` branches grows with every new variant and is copied in several places",
              "use": "Replace conditional with polymorphism",
              "why": "Each variant owns its behaviour, so adding one means adding a class, not editing every switch. Overkill for two stable cases; a plain conditional is clearer there."
            },
            {
              "signal": "A team ships a hard-coded shortcut to hit a launch date and someone asks whether that is acceptable",
              "use": "Recorded deliberate debt",
              "why": "Debt is fine when it is known, written down and has a payoff plan, like a ticket with an owner. Unrecorded debt compounds silently until nobody knows it exists."
            },
            {
              "signal": "The team has a long list of ugly modules and limited time to clean up",
              "use": "Hotspot prioritisation (churn x pain)",
              "why": "Pay down debt where change frequency times difficulty is highest; version-control history shows churn. Ugly code nobody touches costs nothing, so leave it."
            },
            {
              "signal": "An agent's refactor diff edits existing test assertions so the suite goes green",
              "use": "Frozen tests during refactor",
              "why": "Tell the agent tests must not change in a refactor; changed assertions mean the spec moved, not the structure. Review test files first and reject such diffs."
            }
          ]
        }
      ],
      "keyPoints": [
        "Refactoring preserves observable behaviour; if behaviour changes it is not a refactor.",
        "Characterization tests pin current behaviour (even quirks) so you can restructure safely.",
        "Work in small steps with a green-red-revert loop and keep refactors in separate commits from feature changes.",
        "Technical debt is a tradeoff: deliberate, recorded debt is fine; invisible, unrepaid debt compounds.",
        "Pay down debt where you actually keep changing code."
      ],
      "quiz": [
        {
          "q": "What most precisely distinguishes a refactoring from other code changes?",
          "options": [
            "It reduces the line count while keeping every feature",
            "It changes structure while leaving observable behaviour the same",
            "It is done by someone other than the code's original author",
            "It always makes the code run faster for the same inputs"
          ],
          "answer": 1,
          "explain": "Refactoring is defined by behaviour preservation. Fewer lines or better speed may happen, but neither is required, and if behaviour changes you are doing a different kind of change."
        },
        {
          "q": "You must restructure a legacy function with no tests. What do you do first?",
          "options": [
            "Rewrite it cleanly and compare old and new versions by reading them",
            "Fix the obvious bugs you notice while reading through it",
            "Write tests that record its current outputs for representative inputs",
            "Delete the branches that look dead so there is less to restructure"
          ],
          "answer": 2,
          "explain": "Characterization tests give you a safety net that detects behaviour change. Fixing bugs or deleting branches first changes behaviour with nothing to catch mistakes."
        },
        {
          "q": "During a refactor a test fails because the legacy code rounds 0.999 up in a surprising way. What is the best response?",
          "options": [
            "Update the test to expect the new, more sensible rounding",
            "Delete the test, since it only pins down a known bug",
            "Abandon the refactor branch entirely and leave the code alone",
            "Restore the old rounding, and log the bug for a separate fix"
          ],
          "answer": 3,
          "explain": "A refactor must preserve behaviour, quirks included. Fixing the quirk is a deliberate, separate change that can be reviewed and rolled back on its own."
        },
        {
          "q": "Which situation is the best example of acceptable technical debt?",
          "options": [
            "Skipping design review because the deadline feels stressful and nobody will check",
            "Hard-coding a config value to hit a launch date, with a backlog item and a cleanup date",
            "Copying a function into five places because the author did not know how to extract it",
            "Leaving every shortcut in place indefinitely because the product still appears to work"
          ],
          "answer": 1,
          "explain": "Acceptable debt is deliberate, visible and scheduled for repayment. The others are reckless, accidental or unmanaged."
        },
        {
          "q": "Where should a team prioritise paying down debt?",
          "options": [
            "In the modules that change most often and cause the most friction",
            "In the ugliest modules, wherever they sit and however rarely touched",
            "In the oldest files first, since age is the best predictor of cost",
            "In the largest files first, since size is the best predictor of cost"
          ],
          "answer": 0,
          "explain": "Debt costs interest only when you work in that code. High change frequency plus high pain gives the best return; age or size alone are weak signals."
        },
        {
          "q": "You must add a new discount rule to a tangled 600-line `price()` function, and it is unclear where the rule even belongs. Bolting it onto the end feels risky. What should you reach for?",
          "options": [
            "Rewrite `price()` from scratch in a new module",
            "First restructure the code to make the change easy, then add the rule",
            "Append the rule as a new `if` block at the bottom of the existing function",
            "Rank all ugly modules by churn and clean the worst first"
          ],
          "answer": 1,
          "explain": "Make the change easy, then make the easy change: refactor in small steps first, then add the rule. A full rewrite is a much bigger and riskier step than the task needs."
        }
      ]
    },
    {
      "id": "dependencies-supply-chain",
      "title": "Dependencies & Supply Chain",
      "minutes": 10,
      "summary": "Every package you install is code you run and trust, so pin it, update it deliberately and scan it.",
      "lesson": [
        {
          "type": "p",
          "text": "A typical web app declares 30 direct dependencies and ends up running 1,500 packages written by strangers. On Monday it builds fine; on Tuesday, with no change to your code, CI breaks or, worse, ships something different. Understanding why requires understanding versions, lockfiles and trust."
        },
        {
          "type": "h",
          "text": "Semantic versioning and ranges"
        },
        {
          "type": "p",
          "text": "**Semantic versioning (semver)** labels a release MAJOR.MINOR.PATCH. By convention, PATCH is for bug fixes, MINOR adds backwards-compatible features, and MAJOR signals breaking changes. It is a promise made by humans, so it is sometimes broken. A **version range** in your manifest says which versions you will accept."
        },
        {
          "type": "code",
          "lang": "jsonc",
          "text": "// package.json (comments added for teaching; real package.json does not allow them)\n{\n  \"dependencies\": {\n    \"left-pad\": \"1.3.0\",      // exact\n    \"express\": \"^4.18.2\",     // >=4.18.2 <5.0.0\n    \"lodash\": \"~4.17.21\",     // >=4.17.21 <4.18.0\n    \"chalk\": \"*\"              // anything: avoid\n  }\n}"
        },
        {
          "type": "h",
          "text": "Lockfiles"
        },
        {
          "type": "p",
          "text": "A range lets different machines resolve different versions on different days. A **lockfile** (`package-lock.json`, `poetry.lock`, `Cargo.lock`, `go.sum`) records the exact resolved version of every direct and transitive dependency, plus integrity hashes. Commit it for applications. In CI, install from the lockfile strictly (`npm ci`, `pip install --require-hashes -r requirements.txt`, `uv sync --locked`, `cargo build --locked`) so the build fails rather than silently re-resolving. Libraries publish ranges for their consumers; applications pin through the lockfile."
        },
        {
          "type": "figure",
          "id": "maintain-lockfile-drift",
          "caption": "Same range, different days: without a lockfile a fresh install drifts to Tuesday's 4.19.0, while npm ci keeps 4.18.2.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"Version range ^4.18.2 on a version axis. Without a lockfile, a fresh install moves from 4.18.2 on Monday to 4.19.0 on Tuesday; with a lockfile, npm ci stays on 4.18.2\"><style>.maintain-lockfile-drift-t{font-size:14px;fill:var(--fig-ink)}.maintain-lockfile-drift-s{font-size:12px;fill:var(--fig-muted)}.maintain-lockfile-drift-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.maintain-lockfile-drift-ln{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.maintain-lockfile-drift-ah{fill:var(--fig-muted)}.maintain-lockfile-drift-band{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.5}.maintain-lockfile-drift-ax{stroke:var(--fig-ink);stroke-width:1.5}.maintain-lockfile-drift-g{stroke:var(--fig-line);stroke-width:1;stroke-dasharray:3 4}.maintain-lockfile-drift-ok{fill:var(--fig-ok);fill-opacity:.14;stroke:var(--fig-ok);stroke-width:1.5}.maintain-lockfile-drift-wn{fill:var(--fig-warn);fill-opacity:.16;stroke:var(--fig-warn);stroke-width:1.5}.maintain-lockfile-drift-wl{fill:none;stroke:var(--fig-warn);stroke-width:1.5}.maintain-lockfile-drift-wah{fill:var(--fig-warn)}.maintain-lockfile-drift-at{font-size:13px;fill:var(--fig-accent)}.maintain-lockfile-drift-bt{font-size:12px;fill:var(--fig-bad)}.maintain-lockfile-drift-wt{font-size:12px;fill:var(--fig-warn)}.maintain-lockfile-drift-dot{fill:var(--fig-warn);animation:maintain-lockfile-drift-mv 5s ease-in-out infinite}.maintain-lockfile-drift-new{animation:maintain-lockfile-drift-pop 5s ease-in-out infinite}@keyframes maintain-lockfile-drift-mv{0%,20%{transform:translate(0,0);opacity:0}25%{opacity:1}60%{transform:translate(110px,0);opacity:1}70%,100%{transform:translate(110px,0);opacity:0}}@keyframes maintain-lockfile-drift-pop{0%,55%,80%,100%{opacity:1}62%,72%{opacity:.35}}</style><defs><marker id=\"maintain-lockfile-drift-arr\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"maintain-lockfile-drift-wah\" d=\"M0,0 L10,5 L0,10 z\"/></marker></defs><text class=\"maintain-lockfile-drift-t\" x=\"24\" y=\"34\">express \"^4.18.2\"</text><text class=\"maintain-lockfile-drift-at\" x=\"616\" y=\"34\" text-anchor=\"end\">accepts &gt;=4.18.2 &lt;5.0.0</text><rect class=\"maintain-lockfile-drift-band\" x=\"340\" y=\"82\" width=\"230\" height=\"28\" rx=\"8\"/><line class=\"maintain-lockfile-drift-ax\" x1=\"200\" y1=\"96\" x2=\"616\" y2=\"96\"/><line class=\"maintain-lockfile-drift-ax\" x1=\"250\" y1=\"90\" x2=\"250\" y2=\"102\"/><line class=\"maintain-lockfile-drift-ax\" x1=\"340\" y1=\"90\" x2=\"340\" y2=\"102\"/><line class=\"maintain-lockfile-drift-ax\" x1=\"450\" y1=\"90\" x2=\"450\" y2=\"102\"/><line class=\"maintain-lockfile-drift-ax\" x1=\"570\" y1=\"90\" x2=\"570\" y2=\"102\"/><text class=\"maintain-lockfile-drift-s\" x=\"250\" y=\"132\" text-anchor=\"middle\">4.17.3</text><text class=\"maintain-lockfile-drift-t\" x=\"340\" y=\"132\" text-anchor=\"middle\">4.18.2</text><g class=\"maintain-lockfile-drift-new\"><text class=\"maintain-lockfile-drift-t\" x=\"450\" y=\"132\" text-anchor=\"middle\">4.19.0</text><text class=\"maintain-lockfile-drift-wt\" x=\"450\" y=\"148\" text-anchor=\"middle\">published Tuesday</text></g><text class=\"maintain-lockfile-drift-s\" x=\"570\" y=\"132\" text-anchor=\"middle\">5.0.0</text><text class=\"maintain-lockfile-drift-bt\" x=\"570\" y=\"148\" text-anchor=\"middle\">major: excluded</text><text class=\"maintain-lockfile-drift-t\" x=\"24\" y=\"190\">No lockfile</text><text class=\"maintain-lockfile-drift-s\" x=\"24\" y=\"207\">npm install</text><text class=\"maintain-lockfile-drift-t\" x=\"24\" y=\"242\">Lockfile</text><text class=\"maintain-lockfile-drift-s\" x=\"24\" y=\"259\">npm ci</text><rect class=\"maintain-lockfile-drift-ok\" x=\"294\" y=\"178\" width=\"92\" height=\"28\" rx=\"14\"/><text class=\"maintain-lockfile-drift-t\" x=\"340\" y=\"197\" text-anchor=\"middle\">Mon 4.18.2</text><rect class=\"maintain-lockfile-drift-wn\" x=\"404\" y=\"178\" width=\"92\" height=\"28\" rx=\"14\"/><text class=\"maintain-lockfile-drift-t\" x=\"450\" y=\"197\" text-anchor=\"middle\">Tue 4.19.0</text><path class=\"maintain-lockfile-drift-wl\" d=\"M386,192 H402\" marker-end=\"url(#maintain-lockfile-drift-arr)\"/><rect class=\"maintain-lockfile-drift-ok\" x=\"294\" y=\"230\" width=\"92\" height=\"28\" rx=\"14\"/><text class=\"maintain-lockfile-drift-t\" x=\"340\" y=\"249\" text-anchor=\"middle\">Mon 4.18.2</text><text class=\"maintain-lockfile-drift-s\" x=\"400\" y=\"249\">Tue: still 4.18.2</text><circle class=\"maintain-lockfile-drift-dot\" cx=\"340\" cy=\"170\" r=\"5\"/></svg>"
        },
        {
          "type": "h",
          "text": "Updating on purpose"
        },
        {
          "type": "p",
          "text": "Pinning does not mean never updating. Unpatched dependencies are one of the most common ways systems get compromised. The goal is controlled change: small, frequent updates raised as separate pull requests (Dependabot, Renovate), each running your test suite. Ten small updates are easier to debug than one 'update everything' diff after two years. Read changelogs for majors, and keep an update cadence rather than waiting for a crisis."
        },
        {
          "type": "h",
          "text": "Vulnerability scanning"
        },
        {
          "type": "p",
          "text": "Tools such as `npm audit`, `pip-audit`, `cargo audit`, OSV-Scanner and GitHub's dependency alerts match your resolved versions against known-vulnerability databases (CVEs, advisories). This only finds known problems. It also produces noise: a vulnerability in a function you never call may not be exploitable. Triage by reachability and exposure, but do not ignore alerts by default. A **software bill of materials (SBOM)** lists what is in a build so you can answer 'are we affected?' fast when a new advisory lands."
        },
        {
          "type": "h",
          "text": "Supply chain attacks"
        },
        {
          "type": "list",
          "items": [
            "**Typosquatting**: a malicious package named `reqeusts` or `colourama`, waiting for a mistyped install.",
            "**Dependency confusion**: a public package with the same name as your private internal one, with a higher version, gets pulled in by the resolver.",
            "**Account or maintainer takeover**: a legitimate package gets a malicious release, as in several well-known npm incidents.",
            "**Install scripts**: code that runs at install time, before you have read anything.",
            "**Slopsquatting**: attackers register package names that language models tend to hallucinate."
          ]
        },
        {
          "type": "p",
          "text": "Mitigations: verify the package name, age, maintainers and download history before adding it; prefer fewer dependencies; use scoped/private registries with explicit routing; enable lockfile integrity checks; disable install scripts by default (pnpm already does, and npm supports `--ignore-scripts`); and add a short cooldown (for example, not installing releases less than a few days old, a setting that pnpm, Yarn and Renovate, among others, now offer) so that obviously malicious releases are caught by others first."
        },
        {
          "type": "h",
          "text": "Vendoring"
        },
        {
          "type": "p",
          "text": "**Vendoring** means copying dependency source into your repository (Go's `vendor/`, or checked-in third-party directories). It guarantees reproducible, offline builds and lets you review exactly what you run, and protects you if a package is deleted from the registry. The cost: you own updates and security patches, and diffs get large. Vendor when availability or auditability matters more than convenience."
        },
        {
          "type": "h",
          "text": "Pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Adding a package for ten lines of code you could write yourself.",
            "Not committing the lockfile, or deleting it to 'fix' a conflict.",
            "Treating a passing audit as proof of safety.",
            "Letting a dependency stay on a version no longer receiving patches."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents add dependencies freely and sometimes invent plausible package names that do not exist or, worse, that an attacker registered. Require the agent to justify every new dependency, check the name on the registry yourself, and review lockfile diffs. Tell it to prefer the standard library and existing dependencies, and never to delete or regenerate the lockfile to get past an error."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "CI broke overnight with no code change, after a dependency published a new patch release",
              "use": "Commit lockfile, install strictly",
              "why": "The lockfile records exact transitive versions and hashes; `npm ci` or `uv sync --locked` fails instead of drifting. Applies to applications; libraries usually publish ranges, not locks."
            },
            {
              "signal": "Dependencies are two years old and a single 'update everything' attempt broke dozens of tests",
              "use": "Pin plus automated small updates",
              "why": "Bots like Dependabot or Renovate raise one small PR per update, each running the tests, so breakage is easy to attribute. Costs review time; batch low-risk patch bumps to limit noise."
            },
            {
              "signal": "Builds must work offline or must survive a package being deleted from the public registry",
              "use": "Vendoring",
              "why": "Copying dependency source into the repo gives reproducible, auditable, offline builds. You then own patching and accept large diffs, so vendor only when availability or audit beats convenience."
            },
            {
              "signal": "Someone wants to add a package to save ten lines of string padding",
              "use": "Write it yourself / prefer stdlib",
              "why": "Every dependency is a trust decision and an update stream for its whole transitive tree. Small, stable helpers are cheaper to own than to import."
            },
            {
              "signal": "A newly suggested package name looks almost right, is days old and has few downloads",
              "use": "Vet before install",
              "why": "Check name spelling, age, maintainers and download history to catch typosquatting and hallucinated names. A short cooldown on brand-new releases also blunts maintainer-takeover attacks."
            },
            {
              "signal": "An internal package name like `acme-utils` could also be registered on the public registry",
              "use": "Scoped registry with explicit routing",
              "why": "Route internal scopes only to your private registry so a higher public version cannot win resolution (dependency confusion). Requires registry config on every machine and in CI."
            },
            {
              "signal": "A scanner reports 40 vulnerabilities and the team is tempted to ignore all alerts",
              "use": "Triage by reachability and exposure",
              "why": "Fix exploitable, exposed ones first; record why others are not reachable instead of muting them. A clean audit only means no known issues, not safety."
            },
            {
              "signal": "Installing a package can run arbitrary code on developer machines and CI runners",
              "use": "Disable install scripts by default",
              "why": "Use `--ignore-scripts` or a package manager that blocks lifecycle scripts, and allowlist the few packages that genuinely need a build step. Some native packages then need manual setup."
            },
            {
              "signal": "Security asks which services ship a given vulnerable library version and nobody can answer quickly",
              "use": "SBOM",
              "why": "A software bill of materials lists every component and version per build, so exposure questions become a query. Only useful if generated automatically on each build and stored."
            }
          ]
        }
      ],
      "keyPoints": [
        "Semver is a convention: caret and tilde ranges allow automatic minor/patch drift, so builds can differ over time without a lockfile.",
        "Commit the lockfile for applications and install strictly from it in CI.",
        "Update dependencies frequently in small, tested steps rather than rarely in large ones.",
        "Scanners find only known vulnerabilities; triage them but do not dismiss them by default.",
        "Typosquatting, dependency confusion and maintainer takeover mean every new package is a trust decision."
      ],
      "quiz": [
        {
          "q": "Your manifest says `^2.4.1`. What range of versions can the resolver choose without a lockfile?",
          "options": [
            "Exactly 2.4.1",
            "2.4.1 up to but not including 2.5.0",
            "2.4.1 up to but not including 3.0.0",
            "Any version of 2.x including older ones"
          ],
          "answer": 2,
          "explain": "A caret permits changes that do not modify the leftmost non-zero component, so minor and patch updates are allowed. The tilde form is the one limited to patch updates."
        },
        {
          "q": "An application commits its lockfile and CI installs strictly from it. What does that give you?",
          "options": [
            "Every install resolves the same exact dependency versions and hashes",
            "Dependencies load faster at runtime because they are pre-resolved",
            "You no longer need to update dependencies once the file is committed",
            "Every package in the tree is checked and kept free of vulnerabilities"
          ],
          "answer": 0,
          "explain": "The lockfile freezes the full transitive tree, which makes builds reproducible. It does nothing about runtime speed, and pinned vulnerable versions stay vulnerable until updated."
        },
        {
          "q": "A developer mistypes `pip install reqests` and gets a package that exfiltrates environment variables. Which attack is this?",
          "options": [
            "Dependency confusion",
            "Maintainer account takeover",
            "A zero-day in the original library",
            "Typosquatting"
          ],
          "answer": 3,
          "explain": "Typosquatting relies on lookalike names. Dependency confusion instead exploits resolvers preferring a public package over a private one with the same name."
        },
        {
          "q": "`npm audit` reports no vulnerabilities. What can you conclude?",
          "options": [
            "The dependency tree is free of malicious packages",
            "No known advisory matches your resolved versions right now",
            "You can stop updating dependencies for a year",
            "All transitive dependencies have been reviewed by humans"
          ],
          "answer": 1,
          "explain": "Audits match against known advisories only. A fresh malicious release or an undisclosed flaw will not appear, so a clean audit is not proof of safety."
        },
        {
          "q": "Your CI re-resolves version ranges on every run, and it broke after a dependency published a patch release with a behaviour change. What is the most lasting fix?",
          "options": [
            "Delete the lockfile and reinstall so everything resolves fresh",
            "Change the range to `*` so any published version is accepted",
            "Install strictly from the lockfile and take updates as tested PRs",
            "Vendor every dependency and stop taking any updates at all"
          ],
          "answer": 2,
          "explain": "A strict lockfile install stops silent drift, and update PRs make changes deliberate and testable. Deleting the lockfile or using wildcards increases drift, and never updating just accumulates vulnerabilities."
        },
        {
          "q": "A critical CVE lands for `libfoo 1.4.2`. Security asks which of your 60 services ship that exact version, and answering takes two engineers two days of grepping repos. What fits best?",
          "options": [
            "Generate an SBOM for every build and query it by package and version",
            "Disable install scripts by default on every developer machine and on all CI runners",
            "Vendor every dependency into each repository",
            "Triage each alert by whether the vulnerable code is reachable"
          ],
          "answer": 0,
          "explain": "An SBOM is a queryable inventory of what each build contains. Reachability triage decides how urgent a finding is, but only after you know which services include the library."
        }
      ]
    },
    {
      "id": "incident-response-postmortems",
      "title": "Incident Response & Postmortems",
      "minutes": 10,
      "summary": "When production breaks, stop the bleeding first, coordinate clearly, then learn without blame.",
      "lesson": [
        {
          "type": "p",
          "text": "It is 02:10 and checkout error rates jumped from 0.1% to 40%. Three engineers join a call, each starts investigating independently, two of them restart different services, and nobody tells customers anything. The system recovers at 03:30, and nobody is sure why. Structured incident response exists to prevent exactly this."
        },
        {
          "type": "h",
          "text": "What counts as an incident"
        },
        {
          "type": "p",
          "text": "An **incident** is an unplanned event that degrades or threatens a service in a way that needs a coordinated response. Teams classify by **severity**, usually based on user impact rather than technical cause. For example: SEV1 means a core function is down or data is at risk for many users; SEV2 means major degradation or a significant subset affected; SEV3 means a minor issue with a workaround. The exact scale matters less than having one, agreed in advance, because severity determines who is paged, how often updates go out, and whether it is all-hands."
        },
        {
          "type": "h",
          "text": "Roles"
        },
        {
          "type": "list",
          "items": [
            "**Incident commander (IC)**: coordinates, decides, delegates. Does not debug. Keeps a single thread of control.",
            "**Operations / responders**: investigate and apply changes to the system.",
            "**Communications lead**: updates stakeholders and status page on a regular schedule.",
            "**Scribe**: keeps a timestamped log of what was seen and what was changed."
          ]
        },
        {
          "type": "p",
          "text": "Small teams double up roles, but someone must be explicitly in charge. Many people with no commander means conflicting changes, and conflicting changes make a diagnosis impossible."
        },
        {
          "type": "h",
          "text": "Mitigate before root cause"
        },
        {
          "type": "p",
          "text": "The goal during an incident is to restore service, not to understand it. **Mitigation** is any action that reduces user impact: roll back the last deploy, disable a feature flag, fail over, scale up, shed load, block a bad client. Finding the root cause can wait until users are no longer hurting; often the logs and evidence are still there afterwards. A rollback that works in five minutes beats an elegant fix in two hours."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "02:10  Alert: checkout 5xx > 5%.  IC: Priya.  Sev: SEV2 -> SEV1 at 02:18\n02:14  Observation: error spike began 02:06, deploy 4821 went out 02:04\n02:16  Decision: roll back deploy 4821 (IC)\n02:22  Rollback complete. Errors falling.\n02:31  Error rate back to baseline. Mitigated.\n02:35  Comms: status page updated. Root cause: TBD, postmortem scheduled"
        },
        {
          "type": "figure",
          "id": "maintain-incident-timeline",
          "caption": "The same incident log drawn to scale: the rollback decision came 6 minutes after the alert, and errors were back to baseline 21 minutes after it.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"Incident timeline to scale from 02:00 to 02:40: deploy 4821 at 02:04, errors spike at 02:06, alert at 02:10, rollback decided at 02:16, done at 02:22, baseline at 02:31\"><style>.maintain-incident-timeline-t{font-size:14px;fill:var(--fig-ink)}.maintain-incident-timeline-s{font-size:12px;fill:var(--fig-muted)}.maintain-incident-timeline-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.maintain-incident-timeline-ln{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.maintain-incident-timeline-ah{fill:var(--fig-muted)}.maintain-incident-timeline-cv{fill:none;stroke:var(--fig-bad);stroke-width:2}.maintain-incident-timeline-area{fill:var(--fig-bad);fill-opacity:.1}.maintain-incident-timeline-th{stroke:var(--fig-warn);stroke-width:1.5;stroke-dasharray:5 4}.maintain-incident-timeline-wt{font-size:12px;fill:var(--fig-warn)}.maintain-incident-timeline-ax{stroke:var(--fig-ink);stroke-width:1.5}.maintain-incident-timeline-tk{stroke:var(--fig-line);stroke-width:1.5}.maintain-incident-timeline-br{fill:none;stroke:var(--fig-accent);stroke-width:1.5}.maintain-incident-timeline-at{font-size:13px;fill:var(--fig-accent)}.maintain-incident-timeline-okt{font-size:13px;fill:var(--fig-ok)}.maintain-incident-timeline-cur{animation:maintain-incident-timeline-cur 8s linear infinite}.maintain-incident-timeline-cl{stroke:var(--fig-accent2);stroke-width:1.5}.maintain-incident-timeline-dot{fill:var(--fig-bad);stroke:var(--fig-bg);stroke-width:2;animation:maintain-incident-timeline-dot 8s linear infinite}@keyframes maintain-incident-timeline-cur{0%{transform:translate(0px,0)}2.2%{transform:translate(14px,0)}4.5%{transform:translate(28px,0)}6.8%{transform:translate(42px,0)}9%{transform:translate(56px,0)}11.2%{transform:translate(70px,0)}13.5%{transform:translate(84px,0)}15.7%{transform:translate(98px,0)}18%{transform:translate(112px,0)}20.2%{transform:translate(126px,0)}22.5%{transform:translate(140px,0)}24.8%{transform:translate(154px,0)}27%{transform:translate(168px,0)}29.2%{transform:translate(182px,0)}31.5%{transform:translate(196px,0)}33.8%{transform:translate(210px,0)}36%{transform:translate(224px,0)}38.2%{transform:translate(238px,0)}40.5%{transform:translate(252px,0)}42.8%{transform:translate(266px,0)}45%{transform:translate(280px,0)}47.2%{transform:translate(294px,0)}49.5%{transform:translate(308px,0)}51.7%{transform:translate(322px,0)}54%{transform:translate(336px,0)}56.2%{transform:translate(350px,0)}58.5%{transform:translate(364px,0)}60.8%{transform:translate(378px,0)}63%{transform:translate(392px,0)}65.2%{transform:translate(406px,0)}67.5%{transform:translate(420px,0)}69.8%{transform:translate(434px,0)}72%{transform:translate(448px,0)}74.2%{transform:translate(462px,0)}76.5%{transform:translate(476px,0)}78.8%{transform:translate(490px,0)}81%{transform:translate(504px,0)}83.2%{transform:translate(518px,0)}85.5%{transform:translate(532px,0)}87.8%{transform:translate(546px,0)}90%{transform:translate(560px,0)}95%{transform:translate(560px,0);opacity:1}99%{transform:translate(560px,0);opacity:0}99.1%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}}@keyframes maintain-incident-timeline-dot{0%{transform:translate(0px,0px)}2.2%{transform:translate(14px,0px)}4.5%{transform:translate(28px,0px)}6.8%{transform:translate(42px,0px)}9%{transform:translate(56px,0px)}11.2%{transform:translate(70px,0px)}13.5%{transform:translate(84px,0px)}15.7%{transform:translate(98px,-18.1px)}18%{transform:translate(112px,-65.2px)}20.2%{transform:translate(126px,-101.4px)}22.5%{transform:translate(140px,-112px)}24.8%{transform:translate(154px,-112px)}27%{transform:translate(168px,-112px)}29.2%{transform:translate(182px,-112px)}31.5%{transform:translate(196px,-112px)}33.8%{transform:translate(210px,-112px)}36%{transform:translate(224px,-112px)}38.2%{transform:translate(238px,-112px)}40.5%{transform:translate(252px,-112px)}42.8%{transform:translate(266px,-112px)}45%{transform:translate(280px,-112px)}47.2%{transform:translate(294px,-112px)}49.5%{transform:translate(308px,-112px)}51.7%{transform:translate(322px,-108.2px)}54%{transform:translate(336px,-98.1px)}56.2%{transform:translate(350px,-82.7px)}58.5%{transform:translate(364px,-65.2px)}60.8%{transform:translate(378px,-46.8px)}63%{transform:translate(392px,-29.3px)}65.2%{transform:translate(406px,-13.9px)}67.5%{transform:translate(420px,-3.8px)}69.8%{transform:translate(434px,0px)}72%{transform:translate(448px,0px)}74.2%{transform:translate(462px,0px)}76.5%{transform:translate(476px,0px)}78.8%{transform:translate(490px,0px)}81%{transform:translate(504px,0px)}83.2%{transform:translate(518px,0px)}85.5%{transform:translate(532px,0px)}87.8%{transform:translate(546px,0px)}90%{transform:translate(560px,0px)}95%{transform:translate(560px,0);opacity:1}99%{transform:translate(560px,0);opacity:0}99.1%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}}</style><path class=\"maintain-incident-timeline-br\" d=\"M96,50 V44 H180 V50\"/><text class=\"maintain-incident-timeline-at\" x=\"138\" y=\"36\" text-anchor=\"middle\">deploy to alert: 6 min</text><path class=\"maintain-incident-timeline-br\" d=\"M180,50 V44 H474 V50\"/><text class=\"maintain-incident-timeline-at\" x=\"327\" y=\"36\" text-anchor=\"middle\">alert to mitigated: 21 min</text><path class=\"maintain-incident-timeline-area\" d=\"M40,198 L124,198 C145,198 152,86 180,86 L348,86 C390,86 432,198 474,198 L600,198 L600,200 L40,200 Z\"/><line class=\"maintain-incident-timeline-th\" x1=\"40\" y1=\"185\" x2=\"600\" y2=\"185\"/><text class=\"maintain-incident-timeline-wt\" x=\"600\" y=\"178\" text-anchor=\"end\">alert: 5xx &gt; 5%</text><path class=\"maintain-incident-timeline-cv\" d=\"M40,198 L124,198 C145,198 152,86 180,86 L348,86 C390,86 432,198 474,198 L600,198\"/><text class=\"maintain-incident-timeline-s\" x=\"264\" y=\"76\" text-anchor=\"middle\">checkout 5xx rate</text><line class=\"maintain-incident-timeline-ax\" x1=\"40\" y1=\"200\" x2=\"600\" y2=\"200\"/><line class=\"maintain-incident-timeline-tk\" x1=\"96\" y1=\"200\" x2=\"96\" y2=\"210\"/><text class=\"maintain-incident-timeline-s\" x=\"96\" y=\"224\" text-anchor=\"middle\">02:04</text><text class=\"maintain-incident-timeline-t\" x=\"96\" y=\"240\" text-anchor=\"middle\">deploy 4821</text><line class=\"maintain-incident-timeline-tk\" x1=\"180\" y1=\"200\" x2=\"180\" y2=\"250\"/><text class=\"maintain-incident-timeline-s\" x=\"180\" y=\"264\" text-anchor=\"middle\">02:10</text><text class=\"maintain-incident-timeline-t\" x=\"180\" y=\"280\" text-anchor=\"middle\">alert, IC Priya</text><line class=\"maintain-incident-timeline-tk\" x1=\"264\" y1=\"200\" x2=\"264\" y2=\"210\"/><text class=\"maintain-incident-timeline-s\" x=\"264\" y=\"224\" text-anchor=\"middle\">02:16</text><text class=\"maintain-incident-timeline-t\" x=\"264\" y=\"240\" text-anchor=\"middle\">decide: roll back</text><line class=\"maintain-incident-timeline-tk\" x1=\"348\" y1=\"200\" x2=\"348\" y2=\"250\"/><text class=\"maintain-incident-timeline-s\" x=\"348\" y=\"264\" text-anchor=\"middle\">02:22</text><text class=\"maintain-incident-timeline-t\" x=\"348\" y=\"280\" text-anchor=\"middle\">rollback done</text><line class=\"maintain-incident-timeline-tk\" x1=\"474\" y1=\"200\" x2=\"474\" y2=\"210\"/><text class=\"maintain-incident-timeline-s\" x=\"474\" y=\"224\" text-anchor=\"middle\">02:31</text><text class=\"maintain-incident-timeline-okt\" x=\"474\" y=\"240\" text-anchor=\"middle\">baseline</text><line class=\"maintain-incident-timeline-tk\" x1=\"530\" y1=\"200\" x2=\"530\" y2=\"250\"/><text class=\"maintain-incident-timeline-s\" x=\"530\" y=\"264\" text-anchor=\"middle\">02:35</text><text class=\"maintain-incident-timeline-t\" x=\"530\" y=\"280\" text-anchor=\"middle\">status page</text><g class=\"maintain-incident-timeline-cur\"><line class=\"maintain-incident-timeline-cl\" x1=\"40\" y1=\"64\" x2=\"40\" y2=\"200\"/></g><circle class=\"maintain-incident-timeline-dot\" cx=\"40\" cy=\"198\" r=\"5\"/></svg>"
        },
        {
          "type": "p",
          "text": "Note how the log records observations, decisions and actions with times. This becomes the raw material for the postmortem."
        },
        {
          "type": "h",
          "text": "Blameless postmortems"
        },
        {
          "type": "p",
          "text": "After the incident, write a **postmortem** (also called a retrospective or incident review): a timeline, impact, contributing factors, what went well, what went badly, where you got lucky, and concrete follow-up actions with owners and dates. **Blameless** does not mean nobody is accountable. It means you assume people acted sensibly given what they knew at the time, and you ask why the system made the mistake easy. If you punish the engineer who ran the bad command, people hide mistakes, and the next incident is slower to detect."
        },
        {
          "type": "h",
          "text": "The limits of 5 whys"
        },
        {
          "type": "p",
          "text": "The **5 whys** technique asks 'why?' repeatedly to move from symptom to cause. It is simple and a good starting prompt. Its weaknesses: it assumes a single linear chain, whereas real failures have several contributing factors; it stops wherever the investigator stops; and it tends to end at a human ('the engineer did not check') which is where blame creeps in. Prefer asking what conditions allowed this, which safeguards were absent, and what would have made detection faster."
        },
        {
          "type": "h",
          "text": "Pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Everyone debugging, nobody coordinating or communicating.",
            "Making several changes at once during an incident so you cannot tell what helped.",
            "Skipping the postmortem when the fix was 'just a rollback'.",
            "Action items nobody owns, which never get done."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents are useful during incidents for reading logs, summarising a timeline and drafting a postmortem, but be careful about letting them take live actions in production. Give an agent read-only access while you diagnose, require your explicit approval for any change, and insist on mitigation (rollback, flag off) over a clever patch. Verify any root cause an agent states against the evidence in the logs; agents readily produce a confident, plausible story that the data does not support."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Errors spiked minutes after a deploy and the cause is not yet understood",
              "use": "Mitigate first: roll back",
              "why": "Restoring service beats understanding it; a five-minute rollback ends user pain while the evidence stays in logs. Not possible for irreversible data changes, so design migrations to be backward compatible."
            },
            {
              "signal": "Several engineers are on the call, each debugging and restarting services independently",
              "use": "Incident commander",
              "why": "One person coordinates, decides and delegates but does not debug, keeping a single thread of control. Without one, conflicting changes make diagnosis impossible."
            },
            {
              "signal": "The new code path is clearly the suspect and it is behind a toggle",
              "use": "Kill switch (feature flag off)",
              "why": "Turning off a flag is faster and narrower than a full rollback. Only works if risky features ship behind flags and the off path is tested."
            },
            {
              "signal": "Two responders each applied a fix at once and nobody knows which one helped",
              "use": "One change at a time",
              "why": "Change one thing, observe, then decide the next step, so cause and effect stay readable. Slower per step but avoids masking or compounding failures."
            },
            {
              "signal": "After the outage nobody can reconstruct what was seen, decided and changed, or when",
              "use": "Timestamped incident log (scribe)",
              "why": "A scribe logs observations, decisions and actions with times; it becomes the postmortem timeline. Cheap to do live, nearly impossible to rebuild afterwards."
            },
            {
              "signal": "Customers and support learn about the outage from social media rather than from you",
              "use": "Dedicated comms lead on a cadence",
              "why": "One person updates the status page and stakeholders on a fixed schedule, even with 'no news yet', so responders are not interrupted. Small teams double up, but someone must own it."
            },
            {
              "signal": "A draft postmortem concludes that the engineer should have been more careful",
              "use": "Blameless postmortem",
              "why": "Assume people acted sensibly with what they knew and ask why the system allowed the error. Blame hides information; system fixes like guardrails and checks prevent the repeat."
            },
            {
              "signal": "Your 5 whys analysis ended at a single person and a single linear cause",
              "use": "Contributing-factors analysis",
              "why": "Real failures have several conditions that combined; list them all instead of one chain. 5 whys is a useful prompt but stops wherever the investigator stops."
            },
            {
              "signal": "The last three postmortems produced action items that were never done",
              "use": "Owned, dated, specific action items",
              "why": "Each action needs one owner, a due date and a verifiable outcome, tracked like other work. 'Be more careful' is not an action item."
            }
          ]
        }
      ],
      "keyPoints": [
        "Severity is defined by user impact and drives who is paged and how communication works.",
        "A clear incident commander coordinates; responders change the system; someone keeps the log.",
        "Mitigate first (rollback, flag, failover) and investigate root cause once users are safe.",
        "Blameless postmortems ask why the system allowed the error and end in owned action items.",
        "5 whys is a prompt for thinking, not a complete method: real failures have several contributing factors."
      ],
      "quiz": [
        {
          "q": "Errors began right after a deploy, and the cause is not yet understood. What should the incident commander prioritise?",
          "options": [
            "Reproducing the bug in staging to find the root cause",
            "Writing the postmortem while details are fresh",
            "Asking each engineer to propose and test their own fix in production",
            "Rolling back the deploy to restore service, then investigating"
          ],
          "answer": 3,
          "explain": "Mitigation precedes diagnosis. A rollback restores users quickly and leaves the failing version available for analysis afterwards."
        },
        {
          "q": "What is the incident commander's main job?",
          "options": [
            "Writing and deploying the fix as quickly as possible",
            "Drafting and posting the customer status page updates",
            "Coordinating responders and decisions, not debugging",
            "Establishing which engineer caused the incident"
          ],
          "answer": 2,
          "explain": "The IC keeps one coherent thread of control. If the commander dives into debugging, nobody is coordinating and conflicting changes follow."
        },
        {
          "q": "Which statement best describes a blameless postmortem?",
          "options": [
            "It asks how the system made the mistake easy, assuming people acted sensibly",
            "It leaves out specific events and actions so nobody can be identified",
            "It means nobody owns outcomes or is accountable for follow-up actions",
            "It is reserved for incidents caused by third-party vendors and providers"
          ],
          "answer": 0,
          "explain": "Blameless focuses on systemic contributing factors rather than individual fault. It does not hide facts or remove accountability for follow-ups."
        },
        {
          "q": "Why is the 5 whys technique insufficient on its own?",
          "options": [
            "It must always go exactly five levels deep, no more and no fewer",
            "It follows one linear chain and often stops at a person, missing other factors",
            "It needs dedicated analysis tooling that most teams do not have",
            "It only works for hardware failures, not for software or process ones"
          ],
          "answer": 1,
          "explain": "The number five is arbitrary; the real problem is that complex failures have several interacting causes and the technique encourages a single chain ending at human error."
        },
        {
          "q": "Which postmortem action item is best?",
          "options": [
            "Add a canary stage that halts rollouts on error spikes; owner Sam; due next sprint",
            "Engineers must be more careful with deploys; owner: whole team; due: ongoing",
            "Review the deploy process thoroughly at some point during next quarter",
            "Remind every engineer to run the full test suite before each deploy"
          ],
          "answer": 0,
          "explain": "A good action item is specific, owned, dated and changes the system. Vague exhortations to be careful do not prevent recurrence."
        },
        {
          "q": "Two hours into an outage, support is overwhelmed with angry tickets and customers are learning status from social media, while every responder is heads-down debugging. What should you reach for?",
          "options": [
            "Have every responder reply to customers as soon as they know something",
            "Pause the debugging until a full postmortem draft is written",
            "Stop restarting services until the root cause is confirmed",
            "Assign one person to post status updates on a fixed cadence"
          ],
          "answer": 3,
          "explain": "A dedicated comms role keeps customers informed on a predictable schedule without pulling responders off the fix. Ad hoc replies from many responders give inconsistent messages and cost debugging time."
        }
      ]
    },
    {
      "id": "performance",
      "title": "Performance",
      "minutes": 10,
      "summary": "Measure before you optimise, find the hot path with a profiler, and distrust benchmarks that flatter you.",
      "lesson": [
        {
          "type": "p",
          "text": "A report page takes 8 seconds to load. A teammate is sure the database is slow and wants to add an index and a cache. Two days later the page takes 7.6 seconds. The real cost was a loop that serialised JSON 4,000 times. The lesson: intuition about performance is unreliable, and optimising the wrong thing is pure cost."
        },
        {
          "type": "h",
          "text": "Measure first"
        },
        {
          "type": "p",
          "text": "Donald Knuth's often-quoted line is that premature optimisation is the root of all evil; the full sentence is that you should not waste effort on small efficiencies about 97% of the time, but should not pass up the critical 3%. The practical rule: define a goal (for example, p95 under 500 ms), measure the current state, find the bottleneck, change one thing, measure again. If you did not measure, you do not know whether it helped."
        },
        {
          "type": "p",
          "text": "Pay attention to **latency percentiles**, not just averages. An average of 100 ms can hide a p99 of 4 seconds that hurts one request in a hundred, which at scale is a lot of users. Also separate **latency** (time per request) from **throughput** (requests per second); improving one can hurt the other."
        },
        {
          "type": "h",
          "text": "Profilers and flame graphs"
        },
        {
          "type": "p",
          "text": "A **profiler** shows where time or memory goes. A **sampling profiler** periodically records the call stack (for example 100 times per second), so overhead is low and the result approximates where the program spends time. An **instrumenting profiler** records every call precisely but distorts timing. A **flame graph** visualises sampled stacks: each box is a function, the width is the proportion of samples it appears in, and the stack grows upward. Look for wide boxes, especially wide boxes at the top, since those are where the time is actually spent."
        },
        {
          "type": "figure",
          "id": "maintain-flame-graph",
          "caption": "Each sample is a vertical slice through the stack; 7 of 10 land in json.dumps, the wide box at the top where the time actually goes.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Flame graph of build_report: main at the bottom, then load_rows and build_report, render_row, and json.dumps at the top taking 71 percent of the width. A sampling cursor lands in json.dumps 7 of 10 times\"><style>.maintain-flame-graph-t{font-size:14px;fill:var(--fig-ink)}.maintain-flame-graph-s{font-size:12px;fill:var(--fig-muted)}.maintain-flame-graph-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.maintain-flame-graph-ln{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.maintain-flame-graph-ah{fill:var(--fig-muted)}.maintain-flame-graph-f1{fill:var(--fig-accent);fill-opacity:.14;stroke:var(--fig-accent);stroke-width:1.5}.maintain-flame-graph-hot{fill:var(--fig-warn);fill-opacity:.22;stroke:var(--fig-warn);stroke-width:1.5}.maintain-flame-graph-sl{stroke:var(--fig-accent2);stroke-width:2}.maintain-flame-graph-st{font-size:12px;fill:var(--fig-accent2)}.maintain-flame-graph-cur{animation:maintain-flame-graph-j 6s step-end infinite}.maintain-flame-graph-ax{fill:none;stroke:var(--fig-muted);stroke-width:1.5}@keyframes maintain-flame-graph-j{0%{transform:translate(0px,0)}10%{transform:translate(-210px,0)}20%{transform:translate(160px,0)}30%{transform:translate(-100px,0)}40%{transform:translate(258px,0)}50%{transform:translate(80px,0)}60%{transform:translate(-50px,0)}70%{transform:translate(210px,0)}80%{transform:translate(-190px,0)}90%{transform:translate(120px,0)}100%{transform:translate(0,0)}}</style><rect class=\"maintain-flame-graph-f1\" x=\"41\" y=\"226\" width=\"558\" height=\"30\" rx=\"6\"/><text class=\"maintain-flame-graph-t\" x=\"50\" y=\"246\">main</text><rect class=\"maintain-flame-graph-f1\" x=\"41\" y=\"192\" width=\"98.8\" height=\"30\" rx=\"6\"/><text class=\"maintain-flame-graph-t\" x=\"50\" y=\"212\">load_rows</text><rect class=\"maintain-flame-graph-f1\" x=\"141.8\" y=\"192\" width=\"446\" height=\"30\" rx=\"6\"/><text class=\"maintain-flame-graph-t\" x=\"150.8\" y=\"212\">build_report</text><rect class=\"maintain-flame-graph-f1\" x=\"141.8\" y=\"158\" width=\"434.8\" height=\"30\" rx=\"6\"/><text class=\"maintain-flame-graph-t\" x=\"150.8\" y=\"178\">render_row</text><rect class=\"maintain-flame-graph-hot\" x=\"141.8\" y=\"124\" width=\"395.6\" height=\"30\" rx=\"6\"/><text class=\"maintain-flame-graph-t\" x=\"150.8\" y=\"144\">json.dumps 71%</text><rect class=\"maintain-flame-graph-f1\" x=\"539.4\" y=\"124\" width=\"37.2\" height=\"30\" rx=\"6\"/><text class=\"maintain-flame-graph-s\" x=\"40\" y=\"40\">stack grows upward; each box is a function</text><path class=\"maintain-flame-graph-ax\" d=\"M40,276 H600\"/><path class=\"maintain-flame-graph-ax\" d=\"M40,270 V282 M600,270 V282\"/><text class=\"maintain-flame-graph-s\" x=\"320\" y=\"292\" text-anchor=\"middle\">width = share of samples (100%)</text><g class=\"maintain-flame-graph-cur\"><line class=\"maintain-flame-graph-sl\" x1=\"300\" y1=\"86\" x2=\"300\" y2=\"256\"/><text class=\"maintain-flame-graph-st\" x=\"300\" y=\"78\" text-anchor=\"middle\">sample</text></g></svg>"
        },
        {
          "type": "code",
          "lang": "python",
          "text": "import cProfile, pstats\n# Note: cProfile is a deterministic (instrumenting) profiler. For low-overhead\n# sampling of a live process, use a sampler such as py-spy.\n\ndef build_report(rows):\n    out = []\n    for r in rows:\n        out.append(render_row(r))   # suspicious\n    return out\n\ncProfile.run('build_report(load_rows())', 'prof.out')\nstats = pstats.Stats('prof.out')\nstats.sort_stats('cumulative').print_stats(10)\n# Output shows 71% of time in json.dumps called from render_row"
        },
        {
          "type": "p",
          "text": "Distinguish **CPU-bound** work (time spent computing), **I/O-bound** work (waiting on disk, network, database) and **memory-bound** work (cache misses, garbage collection). The fix differs: algorithmic improvement for CPU, batching or concurrency for I/O, data layout for memory."
        },
        {
          "type": "h",
          "text": "Hot paths and the usual wins"
        },
        {
          "type": "p",
          "text": "A **hot path** is code executed very often or on the critical path of a request. Optimise there and leave the rest readable. The biggest wins are usually not micro-optimisations:"
        },
        {
          "type": "list",
          "items": [
            "Better algorithm or data structure (a list scan to a hash lookup; O(n^2) to O(n log n)).",
            "Fewer round trips: the N+1 query problem, where one list query triggers N follow-up queries.",
            "Doing less: skip unneeded work, paginate, stream instead of loading everything.",
            "Caching expensive, repeatedly-requested results."
          ]
        },
        {
          "type": "h",
          "text": "Caching and its price"
        },
        {
          "type": "p",
          "text": "A **cache** stores the result of expensive work to reuse it. It trades memory and complexity for speed, and brings one of the proverbial 'two hard things' in computer science: **invalidation**. A stale cache returns wrong data. Decide what happens when the source changes: time-to-live expiry, explicit invalidation on write, or accepting staleness. Watch for cache stampedes, where many requests recompute a popular expired key at once, and for a low hit rate, which means the cache is only adding overhead."
        },
        {
          "type": "h",
          "text": "Benchmarks that lie"
        },
        {
          "type": "list",
          "items": [
            "Cold versus warm: the first run pays for caching, JIT compilation and disk reads; later runs do not.",
            "Unrealistic data: benchmarking on 100 rows when production has 10 million.",
            "Dead-code elimination: the compiler removes work whose result is unused, so you measure nothing.",
            "Noisy environments: a laptop with other processes, thermal throttling, a single run.",
            "Microbenchmarks that ignore the system: a function 3x faster in isolation may not move end-to-end latency at all.",
            "Averages that hide tail latency."
          ]
        },
        {
          "type": "p",
          "text": "Good practice: repeat runs, report distributions, use realistic inputs, benchmark in an environment similar to production, and confirm that an improvement shows up in an end-to-end metric."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents love to 'optimise' by pattern: they add caches, rewrite loops or reach for concurrency without evidence. Give the agent a measurable target and a reproducible benchmark, ask it to profile before proposing changes, and require before and after numbers. Be suspicious of changes that make code more complex for an unmeasured gain, and check that any cache the agent adds has an invalidation story."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A teammate is sure the database is the bottleneck but nobody has profiled the slow page",
              "use": "Measure first (profile before fixing)",
              "why": "Set a target such as p95 under 500 ms, profile, change one thing, re-measure. Intuition about bottlenecks is often wrong, and optimising the wrong thing is pure cost."
            },
            {
              "signal": "A flame graph shows one wide box near the top of the stack for a single function",
              "use": "Optimise the hot path only",
              "why": "Width is share of samples, so wide boxes are where time goes; fix those and keep the rest readable. Micro-tuning code that takes 1% of time cannot help much."
            },
            {
              "signal": "A list page issues one query for the list and then one more query per row",
              "use": "Fix N+1 with batching / eager load",
              "why": "Fetch related rows in one `IN (...)` query or a join, turning N+1 round trips into 1-2. Over-eager loading of data you do not show can be slower, so batch what is used."
            },
            {
              "signal": "The same expensive result is recomputed on every request though its inputs rarely change",
              "use": "Cache with explicit invalidation",
              "why": "Trades memory and complexity for speed; decide up front how entries expire (TTL, invalidate on write, or accept staleness). A cache with no invalidation story returns wrong data."
            },
            {
              "signal": "When a popular cache key expires, many requests hit the slow backend at the same instant",
              "use": "Stampede protection",
              "why": "Let one request recompute while others wait or serve stale data, or add jittered expiry. Adds locking or background refresh logic, so use it only for hot keys."
            },
            {
              "signal": "The average latency looks fine but users still complain the service is sometimes very slow",
              "use": "Track percentiles (p95/p99)",
              "why": "Averages hide tails; a p99 of 4 s hurts one request in a hundred, which is many users at scale. Percentiles need histograms, not just sums and counts."
            },
            {
              "signal": "The profiler shows the CPU mostly idle while requests wait on network or disk",
              "use": "Classify CPU / I/O / memory-bound",
              "why": "I/O-bound work needs batching, concurrency or fewer round trips; CPU-bound needs a better algorithm; memory-bound needs better data layout. The wrong class of fix does nothing."
            },
            {
              "signal": "A microbenchmark shows a 10x speedup but end-to-end request latency did not change",
              "use": "Verify end-to-end",
              "why": "Confirm gains in a realistic end-to-end metric with warm runs, production-sized data and repeated measurements. The micro win may be off the critical path, or eliminated as dead code."
            },
            {
              "signal": "A loader reads millions of rows into memory just to show the first page",
              "use": "Do less: paginate or stream",
              "why": "Skipping unneeded work usually beats making it faster. Pagination adds API complexity and stable ordering requirements, but bounds memory and latency."
            }
          ]
        }
      ],
      "keyPoints": [
        "Set a target, measure, change one thing, measure again; intuition about bottlenecks is often wrong.",
        "Sampling profilers and flame graphs show where time goes; wide boxes at the top are the hot spots.",
        "Distinguish CPU-bound, I/O-bound and memory-bound work; the right fix differs.",
        "Algorithms, fewer round trips (N+1) and doing less usually beat micro-optimisation; caches add invalidation problems.",
        "Benchmarks mislead through cold starts, tiny data, dead-code elimination, noise and averages that hide tail latency."
      ],
      "quiz": [
        {
          "q": "A page is slow. What should you do before changing any code?",
          "options": [
            "Add a cache in front of the database to cut query time",
            "Profile or measure to find where the time actually goes",
            "Rewrite the slowest-looking function in a faster language",
            "Add more servers so each one handles fewer requests"
          ],
          "answer": 1,
          "explain": "Without measurement you may optimise something that is a tiny fraction of the cost. Caches and hardware may mask the problem and add cost without addressing the bottleneck."
        },
        {
          "q": "In a flame graph, which feature most clearly flags a good optimisation target?",
          "options": [
            "A very tall narrow stack",
            "A box at the far left of the graph",
            "A box with a bright colour",
            "A wide box near the top of the stack"
          ],
          "answer": 3,
          "explain": "Width is the share of samples, so wide boxes consume time; those at the top are where time is spent rather than just passed through. Height only shows call depth, and colour and left-right order are usually arbitrary."
        },
        {
          "q": "Why can an average latency of 100 ms be misleading?",
          "options": [
            "Averages cannot be computed meaningfully for latency data",
            "The mean of latency is always higher than the median",
            "Rare, very slow requests hide in the tail yet hit many users",
            "Latency should be reported in seconds, not milliseconds"
          ],
          "answer": 2,
          "explain": "Percentiles such as p95 and p99 reveal slow tails that the mean smooths over. At high traffic the tail still represents many real users."
        },
        {
          "q": "A microbenchmark shows your new function is 10 times faster than the old one, but a load test shows no change in request latency. The most likely explanation?",
          "options": [
            "The function accounts for only a small share of request time",
            "The microbenchmark measured the new function but not the old one",
            "Load tests are too noisy to ever detect a latency change",
            "Microbenchmarks always overstate speedups by a factor of ten"
          ],
          "answer": 0,
          "explain": "If the function is a small fraction of request time, even a large speedup barely shows end to end (Amdahl's law). That is why you confirm gains in an end-to-end metric."
        },
        {
          "q": "What is the main risk introduced by adding a cache to speed up a read?",
          "options": [
            "Every read gets slower, even when the cache hits",
            "The cache always costs more CPU than the original query",
            "Entries can never be removed once they are cached",
            "Serving stale data after the underlying source changes"
          ],
          "answer": 3,
          "explain": "Caches trade freshness and simplicity for speed. Without a defined invalidation or expiry strategy, users see outdated values."
        },
        {
          "q": "Each hour when the cached homepage feed expires, database CPU spikes to 100% for a few seconds because hundreds of requests all recompute the same value at once. Which approach fits best?",
          "options": [
            "Add an index to the feed query so that each individual recompute is much cheaper",
            "Fetch the feed in pages instead of all at once",
            "Let one request rebuild the value while the others wait or get the stale copy",
            "Replace the cache with per-request recomputation"
          ],
          "answer": 2,
          "explain": "Single-flight or serve-stale stops the herd from hitting the backend together. An index makes each recompute cheaper but hundreds of simultaneous recomputes still pile up."
        }
      ]
    },
    {
      "id": "documentation-knowledge",
      "title": "Documentation & Knowledge Sharing",
      "minutes": 9,
      "summary": "Write down what the code cannot say: how to run it, why it is this way, and what to do when it breaks.",
      "lesson": [
        {
          "type": "p",
          "text": "A new engineer joins and spends three days getting the project to run because the setup steps live in one person's head. Six months later, someone proposes replacing the message queue and nobody remembers why it was chosen. At 3 a.m. the on-call engineer does not know how to restart the worker safely. All three are documentation failures, each of a different kind."
        },
        {
          "type": "h",
          "text": "Code says what, docs say why and how"
        },
        {
          "type": "p",
          "text": "Code, if well written, already shows what it does. Documentation earns its keep by recording what code cannot: purpose, context, decisions, constraints, and procedures. Comments that restate the line below are noise. A comment that says why a surprising choice was made is valuable. A useful framework is to separate four needs: tutorials (learning), how-to guides (doing a task), reference (looking up facts), and explanation (understanding why)."
        },
        {
          "type": "h",
          "text": "The README"
        },
        {
          "type": "p",
          "text": "The README is the front door. It should answer, quickly: what is this, who is it for, how do I run it, how do I test it, how do I contribute, and where do I go for more. Test it by having someone new follow it literally on a clean machine; every step they get stuck on is a bug in the README."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "# Orders Service\nHandles order creation and payment capture for the storefront.\n\n## Quick start\n  make setup      # installs deps, starts local Postgres\n  make test       # runs unit + integration tests\n  make run        # serves on http://localhost:8080\n\n## Where things live\n  /api        HTTP handlers\n  /domain     business rules (no I/O)\n  /docs/adr   architecture decision records\n  /docs/runbooks  operational procedures\n\n## Ownership\n  Team: Payments. Slack: #payments-eng. On-call: see runbooks/oncall.md"
        },
        {
          "type": "h",
          "text": "Architecture Decision Records"
        },
        {
          "type": "p",
          "text": "An **ADR** is a short, dated document recording one significant decision: the context and forces, the options considered, the decision, and the consequences. ADRs are immutable history: if a decision is reversed, write a new ADR that supersedes the old one rather than editing it. They answer the question 'why on earth did we do this?' months later, and stop teams from re-litigating settled choices without new information."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "ADR-014: Use Postgres advisory locks for job de-duplication\nStatus: Accepted (2026-03-02)\nContext: Two workers sometimes process the same job. Redis is not otherwise required.\nOptions: Redis SETNX, advisory locks, unique constraint on job table.\nDecision: Advisory locks. No new infrastructure; lock scope matches transaction.\nConsequences: Tied to Postgres; a lock held past a crash is released by the DB."
        },
        {
          "type": "h",
          "text": "Runbooks"
        },
        {
          "type": "p",
          "text": "A **runbook** is a step-by-step procedure for an operational task or alert: what the alert means, how to confirm, how to mitigate, how to verify, and who to escalate to. It is written for a tired person at 3 a.m., so use exact commands, expected output and clear stop conditions. Link every alert to its runbook."
        },
        {
          "type": "h",
          "text": "Docs as code"
        },
        {
          "type": "p",
          "text": "**Docs as code** keeps documentation in the repository next to the source, written in plain text such as Markdown, reviewed in pull requests, and checked in CI (link checkers, spell checks, executing code samples). The benefit is that a change to behaviour and its documentation ship in the same change. Docs that live in a separate wiki rot because nothing forces them to move with the code."
        },
        {
          "type": "figure",
          "id": "maintain-docs-drift",
          "caption": "Docs in the repo move with every change because they ship in the same PR; the wiki was written once and falls further behind with each change.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"Six code changes. Docs kept in the repository are updated in the same pull request as each change; the wiki was written at change 1 and never updated, so it drifts further behind with every change\"><style>.maintain-docs-drift-t{font-size:14px;fill:var(--fig-ink)}.maintain-docs-drift-s{font-size:12px;fill:var(--fig-muted)}.maintain-docs-drift-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.maintain-docs-drift-ln{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.maintain-docs-drift-ah{fill:var(--fig-muted)}.maintain-docs-drift-tr{stroke:var(--fig-line);stroke-width:1.5}.maintain-docs-drift-cd{fill:var(--fig-ink)}.maintain-docs-drift-ok{fill:var(--fig-ok)}.maintain-docs-drift-miss{fill:var(--fig-bg);stroke:var(--fig-bad);stroke-width:2}.maintain-docs-drift-pr{stroke:var(--fig-ok);stroke-width:1.5;stroke-dasharray:3 3}.maintain-docs-drift-okt{font-size:12px;fill:var(--fig-ok)}.maintain-docs-drift-bl{fill:none;stroke:var(--fig-bad);stroke-width:1.5}.maintain-docs-drift-bt{font-size:13px;fill:var(--fig-bad)}.maintain-docs-drift-ph{stroke:var(--fig-accent);stroke-width:2}.maintain-docs-drift-pt{font-size:12px;fill:var(--fig-accent)}.maintain-docs-drift-head{animation:maintain-docs-drift-mv 6s ease-in-out infinite}.maintain-docs-drift-pu{transform-box:fill-box;transform-origin:center;animation:maintain-docs-drift-pu 6s ease-out infinite}.maintain-docs-drift-c0{animation-delay:0s}.maintain-docs-drift-c1{animation-delay:1s}.maintain-docs-drift-c2{animation-delay:2s}.maintain-docs-drift-c3{animation-delay:3s}.maintain-docs-drift-c4{animation-delay:4s}.maintain-docs-drift-c5{animation-delay:5s}@keyframes maintain-docs-drift-mv{0%{transform:translate(0px,0);opacity:1}12%{transform:translate(0px,0)}16.7%{transform:translate(76px,0);opacity:1}28.7%{transform:translate(76px,0)}33.3%{transform:translate(152px,0);opacity:1}45.3%{transform:translate(152px,0)}50%{transform:translate(228px,0);opacity:1}62%{transform:translate(228px,0)}66.7%{transform:translate(304px,0);opacity:1}78.7%{transform:translate(304px,0)}83.3%{transform:translate(380px,0);opacity:1}97%{transform:translate(380px,0);opacity:1}99%{transform:translate(380px,0);opacity:0}99.1%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}}@keyframes maintain-docs-drift-pu{0%{transform:scale(1)}4%{transform:scale(1.45)}12%,100%{transform:scale(1)}}</style><text class=\"maintain-docs-drift-s\" x=\"24\" y=\"52\">change</text><text class=\"maintain-docs-drift-s\" x=\"210\" y=\"52\" text-anchor=\"middle\">1</text><text class=\"maintain-docs-drift-s\" x=\"286\" y=\"52\" text-anchor=\"middle\">2</text><text class=\"maintain-docs-drift-s\" x=\"362\" y=\"52\" text-anchor=\"middle\">3</text><text class=\"maintain-docs-drift-s\" x=\"438\" y=\"52\" text-anchor=\"middle\">4</text><text class=\"maintain-docs-drift-s\" x=\"514\" y=\"52\" text-anchor=\"middle\">5</text><text class=\"maintain-docs-drift-s\" x=\"590\" y=\"52\" text-anchor=\"middle\">6</text><line class=\"maintain-docs-drift-tr\" x1=\"190\" y1=\"90\" x2=\"610\" y2=\"90\"/><text class=\"maintain-docs-drift-t\" x=\"24\" y=\"95\">Code</text><line class=\"maintain-docs-drift-tr\" x1=\"190\" y1=\"150\" x2=\"610\" y2=\"150\"/><text class=\"maintain-docs-drift-t\" x=\"24\" y=\"148\">Docs in repo</text><text class=\"maintain-docs-drift-s\" x=\"24\" y=\"165\">reviewed in the PR</text><line class=\"maintain-docs-drift-tr\" x1=\"190\" y1=\"210\" x2=\"610\" y2=\"210\"/><text class=\"maintain-docs-drift-t\" x=\"24\" y=\"208\">Wiki</text><text class=\"maintain-docs-drift-s\" x=\"24\" y=\"225\">separate, no review</text><line class=\"maintain-docs-drift-pr\" x1=\"210\" y1=\"100\" x2=\"210\" y2=\"140\"/><line class=\"maintain-docs-drift-pr\" x1=\"286\" y1=\"100\" x2=\"286\" y2=\"140\"/><line class=\"maintain-docs-drift-pr\" x1=\"362\" y1=\"100\" x2=\"362\" y2=\"140\"/><line class=\"maintain-docs-drift-pr\" x1=\"438\" y1=\"100\" x2=\"438\" y2=\"140\"/><line class=\"maintain-docs-drift-pr\" x1=\"514\" y1=\"100\" x2=\"514\" y2=\"140\"/><line class=\"maintain-docs-drift-pr\" x1=\"590\" y1=\"100\" x2=\"590\" y2=\"140\"/><text class=\"maintain-docs-drift-okt\" x=\"218\" y=\"124\">same PR</text><g class=\"maintain-docs-drift-head\"><line class=\"maintain-docs-drift-ph\" x1=\"210\" y1=\"66\" x2=\"210\" y2=\"226\"/></g><circle class=\"maintain-docs-drift-cd maintain-docs-drift-pu maintain-docs-drift-c0\" cx=\"210\" cy=\"90\" r=\"8\"/><circle class=\"maintain-docs-drift-ok maintain-docs-drift-pu maintain-docs-drift-c0\" cx=\"210\" cy=\"150\" r=\"8\"/><circle class=\"maintain-docs-drift-ok maintain-docs-drift-pu maintain-docs-drift-c0\" cx=\"210\" cy=\"210\" r=\"8\"/><circle class=\"maintain-docs-drift-cd maintain-docs-drift-pu maintain-docs-drift-c1\" cx=\"286\" cy=\"90\" r=\"8\"/><circle class=\"maintain-docs-drift-ok maintain-docs-drift-pu maintain-docs-drift-c1\" cx=\"286\" cy=\"150\" r=\"8\"/><circle class=\"maintain-docs-drift-miss maintain-docs-drift-pu maintain-docs-drift-c1\" cx=\"286\" cy=\"210\" r=\"7\"/><circle class=\"maintain-docs-drift-cd maintain-docs-drift-pu maintain-docs-drift-c2\" cx=\"362\" cy=\"90\" r=\"8\"/><circle class=\"maintain-docs-drift-ok maintain-docs-drift-pu maintain-docs-drift-c2\" cx=\"362\" cy=\"150\" r=\"8\"/><circle class=\"maintain-docs-drift-miss maintain-docs-drift-pu maintain-docs-drift-c2\" cx=\"362\" cy=\"210\" r=\"7\"/><circle class=\"maintain-docs-drift-cd maintain-docs-drift-pu maintain-docs-drift-c3\" cx=\"438\" cy=\"90\" r=\"8\"/><circle class=\"maintain-docs-drift-ok maintain-docs-drift-pu maintain-docs-drift-c3\" cx=\"438\" cy=\"150\" r=\"8\"/><circle class=\"maintain-docs-drift-miss maintain-docs-drift-pu maintain-docs-drift-c3\" cx=\"438\" cy=\"210\" r=\"7\"/><circle class=\"maintain-docs-drift-cd maintain-docs-drift-pu maintain-docs-drift-c4\" cx=\"514\" cy=\"90\" r=\"8\"/><circle class=\"maintain-docs-drift-ok maintain-docs-drift-pu maintain-docs-drift-c4\" cx=\"514\" cy=\"150\" r=\"8\"/><circle class=\"maintain-docs-drift-miss maintain-docs-drift-pu maintain-docs-drift-c4\" cx=\"514\" cy=\"210\" r=\"7\"/><circle class=\"maintain-docs-drift-cd maintain-docs-drift-pu maintain-docs-drift-c5\" cx=\"590\" cy=\"90\" r=\"8\"/><circle class=\"maintain-docs-drift-ok maintain-docs-drift-pu maintain-docs-drift-c5\" cx=\"590\" cy=\"150\" r=\"8\"/><circle class=\"maintain-docs-drift-miss maintain-docs-drift-pu maintain-docs-drift-c5\" cx=\"590\" cy=\"210\" r=\"7\"/><path class=\"maintain-docs-drift-bl\" d=\"M278,236 V242 H598 V236\"/><text class=\"maintain-docs-drift-bt\" x=\"438\" y=\"262\" text-anchor=\"middle\">drift: the wiki still describes change 1</text></svg>"
        },
        {
          "type": "h",
          "text": "Pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Documentation that is out of date is worse than none, because it misleads confidently.",
            "Documenting everything equally; prioritise what is hard to infer and costly to get wrong.",
            "Knowledge locked in chat threads and heads (the bus factor).",
            "Writing for yourself today rather than for a stranger in six months."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents read your repository docs as instructions. A good README, a short file such as AGENTS.md or CLAUDE.md stating build and test commands, conventions and no-go areas, and ADRs for key decisions all directly improve agent output. Keep them accurate and concise. When an agent drafts documentation, check it for invented commands, wrong paths and plausible-sounding rationale that nobody actually decided; agents will happily write the 'why' for a decision they never saw."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Someone proposes replacing a core component and nobody remembers why it was chosen",
              "use": "Architecture Decision Record",
              "why": "One short dated record per decision: context, options, decision, consequences. Supersede rather than edit, so history stays honest. Reserve ADRs for significant, costly-to-reverse choices."
            },
            {
              "signal": "The on-call engineer gets an alert at 3 a.m. and does not know how to restart the worker safely",
              "use": "Runbook linked from the alert",
              "why": "Exact commands, expected output, stop conditions and escalation, written for a tired stranger. Runbooks rot, so test them in drills and update after every incident."
            },
            {
              "signal": "A new hire needs three days to get the project running because the steps live in one person's head",
              "use": "README tested on a clean machine",
              "why": "The README must say what it is and how to run, test and navigate it; every point where a newcomer gets stuck is a README bug. Keep it short and link out for depth."
            },
            {
              "signal": "The wiki describes an API that changed six months ago and misleads readers confidently",
              "use": "Docs as code",
              "why": "Keep docs in the repo, reviewed in the same PR as the behaviour change and checked in CI (links, code samples). Wikis rot because nothing forces them to move with the code."
            },
            {
              "signal": "A comment says `// increment i` while a surprising workaround nearby has no explanation",
              "use": "Comment the why, not the what",
              "why": "Code already shows what it does; comments earn their place by explaining intent, constraints and non-obvious choices. Restating the line is noise that drifts out of date."
            },
            {
              "signal": "One document mixes a tutorial, a reference table and troubleshooting steps and serves none well",
              "use": "Split by need (tutorial/how-to/ref/explain)",
              "why": "Learners, doers, lookers-up and understanders read differently, so separate the four kinds. More pages to maintain, but each is easier to find and keep correct."
            },
            {
              "signal": "Only one engineer understands the billing integration and answers every question in chat",
              "use": "Raise the bus factor",
              "why": "Move answers from chat into the repo and pair others on that area. Prioritise documenting what is hard to infer and costly to get wrong, not everything equally."
            },
            {
              "signal": "An agent keeps guessing the test command and editing directories that are generated",
              "use": "Agent instruction file (AGENTS.md)",
              "why": "A short repo file with build and test commands, conventions and no-go areas, loaded every session. Keep it accurate and brief; a stale one misleads agents just like stale docs mislead people."
            }
          ]
        }
      ],
      "keyPoints": [
        "Docs should capture what code cannot: purpose, rationale, constraints and procedures.",
        "A README must let a newcomer run, test and navigate the project; test it on a clean machine.",
        "ADRs record one decision each with context, options and consequences, and are superseded rather than edited.",
        "Runbooks give exact steps for operational tasks and alerts, written for someone stressed and unfamiliar.",
        "Docs as code keeps documentation reviewed and versioned with the source; stale docs are actively harmful."
      ],
      "quiz": [
        {
          "q": "Which comment adds the most value?",
          "options": [
            "Retry 3 times: the vendor drops connections in nightly maintenance",
            "Increment the retry counter by one after each failed attempt",
            "This function returns the user record from the database",
            "Loop over the list of users and process each one in turn"
          ],
          "answer": 0,
          "explain": "It records why a non-obvious choice exists. The others merely restate what the code visibly does."
        },
        {
          "q": "A team decides to move from REST to gRPC internally. What is the best way to capture this decision for the future?",
          "options": [
            "Mention it in the team chat thread where it was discussed",
            "Update the README tagline to say the services use gRPC",
            "Write a dated ADR with context, alternatives and consequences",
            "Rely on the code itself, since the gRPC calls are visible there"
          ],
          "answer": 2,
          "explain": "An ADR preserves the reasoning and alternatives so later readers can judge whether it still applies. Chat threads are hard to find and code shows what, not why."
        },
        {
          "q": "What makes a runbook good for an on-call engineer at night?",
          "options": [
            "A detailed history of how the system evolved over the years",
            "Exact commands, expected outputs and when to escalate",
            "A link to the repository so the engineer can read the code",
            "General advice to investigate carefully before acting"
          ],
          "answer": 1,
          "explain": "Runbooks are for action under stress, so precision and clear decision points matter. History and general advice slow the responder down."
        },
        {
          "q": "Why do docs-as-code practices reduce documentation rot?",
          "options": [
            "They are written in a more precise, formal language than wikis",
            "They guarantee that engineers enjoy writing documentation",
            "They stop the code from changing once it has been documented",
            "Docs change and get reviewed in the same PR as the code"
          ],
          "answer": 3,
          "explain": "Keeping docs next to code and reviewing them together creates a natural moment to update them. It does not guarantee accuracy, but it makes drift visible."
        },
        {
          "q": "An agent drafts an ADR explaining why a team chose a particular database, but you did not give it the reasons. What should you do?",
          "options": [
            "Publish it as is, because it reads well and sounds plausible",
            "Ask the agent to add more detail so the rationale is more convincing",
            "Check each claim against what the team decided; cut invented reasons",
            "Drop the ADR format and record the decision in a wiki page instead"
          ],
          "answer": 2,
          "explain": "The risk is plausible but fabricated rationale being recorded as history. An ADR is only valuable if it reflects what was truly considered and decided."
        },
        {
          "q": "The 40-page payments guide mixes a getting-started walkthrough, a table of every error code and an essay on why the ledger works as it does. New hires and on-call both say they cannot find anything. What fits best?",
          "options": [
            "Separate it into a tutorial, how-to guides, a reference and an explanation",
            "Add a table of contents and a search box on top of it",
            "Write an ADR for each section of the guide",
            "Move the whole guide into a single runbook that is linked from every alert page"
          ],
          "answer": 0,
          "explain": "Readers arrive with different needs, so each kind of doc should serve one of them. A table of contents makes the mixed page easier to navigate but it still serves none of the needs well."
        }
      ]
    },
    {
      "id": "legacy-migrations",
      "title": "Legacy Code & Migrations",
      "minutes": 10,
      "summary": "Replace old systems gradually, move data safely, and delete code only when you can prove it is unused.",
      "lesson": [
        {
          "type": "p",
          "text": "Your company's billing system is twelve years old, written in a framework nobody hires for, and it makes money. Everyone wants to rewrite it. Two years later the rewrite is still 'almost done', the old system has kept gaining features nobody ported, and the team has two systems to maintain. Legacy modernisation is mostly the art of not doing that."
        },
        {
          "type": "h",
          "text": "What legacy means"
        },
        {
          "type": "p",
          "text": "Michael Feathers defined legacy code as code without tests. More broadly it is code that is valuable, hard to change safely, and often poorly understood. Legacy code is not bad code by definition: it is code that survived long enough to matter. It encodes years of edge cases and bug fixes, which is exactly why rewrites underestimate it."
        },
        {
          "type": "h",
          "text": "The strangler fig pattern"
        },
        {
          "type": "p",
          "text": "The **strangler fig** approach (named for a vine that grows around a tree) replaces a system incrementally. You put a routing layer or facade in front of the old system, then build new implementations of one capability at a time and redirect that traffic to them. The old system keeps working throughout and shrinks until it can be switched off. Each step is small, shippable and reversible, so risk stays low and value arrives early."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Before:   client -> legacy monolith\n\nStep 1:   client -> router -> legacy monolith\nStep 2:   client -> router -> /invoices -> NEW invoice service\n                          -> everything else -> legacy\nStep 3:   ... repeat per capability ...\nFinal:    client -> router -> new services      (legacy switched off)"
        },
        {
          "type": "figure",
          "id": "maintain-strangler-fig",
          "caption": "The router moves one capability at a time to the new services while legacy keeps serving the rest, until nothing is left and it is switched off.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Strangler fig: a client calls a router; route by route, traffic moves from the legacy monolith to new services, starting with /invoices, until the legacy system is switched off\"><style>.maintain-strangler-fig-t{font-size:14px;fill:var(--fig-ink)}.maintain-strangler-fig-s{font-size:12px;fill:var(--fig-muted)}.maintain-strangler-fig-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.maintain-strangler-fig-ln{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.maintain-strangler-fig-ah{fill:var(--fig-muted)}.maintain-strangler-fig-nb{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.5}.maintain-strangler-fig-nl{fill:none;stroke:var(--fig-accent);stroke-width:2}.maintain-strangler-fig-ll{fill:none;stroke:var(--fig-ink);stroke-width:2}.maintain-strangler-fig-bt{font-size:12px;fill:var(--fig-bad)}.maintain-strangler-fig-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}@keyframes maintain-strangler-fig-flow{to{stroke-dashoffset:-24}}.maintain-strangler-fig-n0{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite;opacity:1}.maintain-strangler-fig-l0{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite;opacity:0.1}@keyframes maintain-strangler-fig-n1{0%,30%,98%,100%{opacity:0.1}34%,64%{opacity:1}68%,94%{opacity:1}}.maintain-strangler-fig-n1{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite,maintain-strangler-fig-n1 9s ease-in-out infinite}@keyframes maintain-strangler-fig-l1{0%,30%,98%,100%{opacity:1}34%,64%{opacity:0.1}68%,94%{opacity:0.1}}.maintain-strangler-fig-l1{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite,maintain-strangler-fig-l1 9s ease-in-out infinite}@keyframes maintain-strangler-fig-n2{0%,30%,98%,100%{opacity:0.1}34%,64%{opacity:0.1}68%,94%{opacity:1}}.maintain-strangler-fig-n2{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite,maintain-strangler-fig-n2 9s ease-in-out infinite}@keyframes maintain-strangler-fig-l2{0%,30%,98%,100%{opacity:1}34%,64%{opacity:1}68%,94%{opacity:0.1}}.maintain-strangler-fig-l2{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite,maintain-strangler-fig-l2 9s ease-in-out infinite}@keyframes maintain-strangler-fig-n3{0%,30%,98%,100%{opacity:0.1}34%,64%{opacity:0.1}68%,94%{opacity:1}}.maintain-strangler-fig-n3{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite,maintain-strangler-fig-n3 9s ease-in-out infinite}@keyframes maintain-strangler-fig-l3{0%,30%,98%,100%{opacity:1}34%,64%{opacity:1}68%,94%{opacity:0.1}}.maintain-strangler-fig-l3{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite,maintain-strangler-fig-l3 9s ease-in-out infinite}@keyframes maintain-strangler-fig-lg{0%,30%,98%,100%{opacity:1}34%,64%{opacity:1}68%,94%{opacity:0.4}}.maintain-strangler-fig-lg{animation:maintain-strangler-fig-lg 9s ease-in-out infinite}@keyframes maintain-strangler-fig-off{0%,30%,98%,100%{opacity:0}34%,64%{opacity:0}68%,94%{opacity:1}}.maintain-strangler-fig-off{opacity:0;animation:maintain-strangler-fig-off 9s ease-in-out infinite}@keyframes maintain-strangler-fig-k0{0%,30%,98%,100%{opacity:1}34%,64%{opacity:0}68%,94%{opacity:0}}.maintain-strangler-fig-k0{opacity:1;animation:maintain-strangler-fig-k0 9s ease-in-out infinite}@keyframes maintain-strangler-fig-k1{0%,30%,98%,100%{opacity:0}34%,64%{opacity:1}68%,94%{opacity:0}}.maintain-strangler-fig-k1{opacity:0;animation:maintain-strangler-fig-k1 9s ease-in-out infinite}@keyframes maintain-strangler-fig-k2{0%,30%,98%,100%{opacity:0}34%,64%{opacity:0}68%,94%{opacity:1}}.maintain-strangler-fig-k2{opacity:0;animation:maintain-strangler-fig-k2 9s ease-in-out infinite}.maintain-strangler-fig-cl{stroke-dasharray:6 6;animation:maintain-strangler-fig-flow 1s linear infinite}</style><text class=\"maintain-strangler-fig-h maintain-strangler-fig-k0\" x=\"24\" y=\"30\">Step 2: /invoices moved to a new service</text><text class=\"maintain-strangler-fig-h maintain-strangler-fig-k1\" x=\"24\" y=\"30\">Step 3: /payments moved too</text><text class=\"maintain-strangler-fig-h maintain-strangler-fig-k2\" x=\"24\" y=\"30\">Final: everything moved, legacy switched off</text><rect class=\"maintain-strangler-fig-b\" x=\"20\" y=\"138\" width=\"90\" height=\"44\" rx=\"10\"/><text class=\"maintain-strangler-fig-t\" x=\"65\" y=\"165\" text-anchor=\"middle\">Client</text><path class=\"maintain-strangler-fig-ll maintain-strangler-fig-cl\" d=\"M110,160 H150\"/><rect class=\"maintain-strangler-fig-b\" x=\"150\" y=\"56\" width=\"140\" height=\"208\" rx=\"12\"/><text class=\"maintain-strangler-fig-h\" x=\"220\" y=\"82\" text-anchor=\"middle\">Router</text><text class=\"maintain-strangler-fig-t\" x=\"164\" y=\"115\">/invoices</text><text class=\"maintain-strangler-fig-t\" x=\"164\" y=\"155\">/payments</text><text class=\"maintain-strangler-fig-t\" x=\"164\" y=\"195\">/reports</text><text class=\"maintain-strangler-fig-t\" x=\"164\" y=\"235\">everything else</text><path class=\"maintain-strangler-fig-nl maintain-strangler-fig-n0\" d=\"M290,110 C380,110 380,58 468,58\"/><path class=\"maintain-strangler-fig-ll maintain-strangler-fig-l0\" d=\"M290,110 C380,110 380,208 468,208\"/><path class=\"maintain-strangler-fig-nl maintain-strangler-fig-n1\" d=\"M290,150 C380,150 380,76 468,76\"/><path class=\"maintain-strangler-fig-ll maintain-strangler-fig-l1\" d=\"M290,150 C380,150 380,226 468,226\"/><path class=\"maintain-strangler-fig-nl maintain-strangler-fig-n2\" d=\"M290,190 C380,190 380,94 468,94\"/><path class=\"maintain-strangler-fig-ll maintain-strangler-fig-l2\" d=\"M290,190 C380,190 380,244 468,244\"/><path class=\"maintain-strangler-fig-nl maintain-strangler-fig-n3\" d=\"M290,230 C380,230 380,112 468,112\"/><path class=\"maintain-strangler-fig-ll maintain-strangler-fig-l3\" d=\"M290,230 C380,230 380,262 468,262\"/><rect class=\"maintain-strangler-fig-nb\" x=\"470\" y=\"40\" width=\"150\" height=\"90\" rx=\"12\"/><text class=\"maintain-strangler-fig-t\" x=\"545\" y=\"90\" text-anchor=\"middle\">New services</text><g class=\"maintain-strangler-fig-lg\"><rect class=\"maintain-strangler-fig-b\" x=\"470\" y=\"190\" width=\"150\" height=\"90\" rx=\"12\"/><text class=\"maintain-strangler-fig-t\" x=\"545\" y=\"236\" text-anchor=\"middle\">Legacy monolith</text></g><text class=\"maintain-strangler-fig-bt maintain-strangler-fig-off\" x=\"545\" y=\"256\" text-anchor=\"middle\">switched off</text></svg>"
        },
        {
          "type": "h",
          "text": "Feature parity and verification"
        },
        {
          "type": "p",
          "text": "Parity is harder than it looks because the old system's behaviour is the real specification, including bugs that customers rely on. Techniques that help: characterization tests against the old system; **shadow traffic** or **dark launching**, where requests go to both systems and the new one's response is compared but not returned; and gradual rollout by percentage of users with a quick switch back. Decide explicitly which quirks to preserve and which to drop."
        },
        {
          "type": "h",
          "text": "Data migrations"
        },
        {
          "type": "p",
          "text": "Code can be rolled back; data often cannot. Schema and data changes need extra care. The standard approach for changing a live database is **expand and contract** (parallel change):"
        },
        {
          "type": "list",
          "items": [
            "Expand: add the new column or table, keeping the old one. Deploy code that tolerates both.",
            "Backfill: copy and transform existing data in small batches, idempotently, so it can be re-run.",
            "Switch: move reads to the new structure, after verifying it matches.",
            "Contract: once nothing uses the old structure, remove it."
          ]
        },
        {
          "type": "p",
          "text": "During the transition you may use **dual writes**: the application writes to both the old and new stores. They are dangerous. Two writes are not atomic, so one can succeed and the other fail, leaving the stores out of sync, and concurrent writers can apply updates in different orders. Mitigate with a single source of truth, reconciliation jobs that compare and repair, or a change-data-capture pipeline that replicates from one store to the other instead of the app writing twice. Always make the old store the authority until the new one is verified."
        },
        {
          "type": "h",
          "text": "Deleting code safely"
        },
        {
          "type": "p",
          "text": "Dead code costs reading time, build time and security surface. Before deleting, show that nothing uses it: search references, check logs or metrics for calls over a full business cycle (month-end jobs exist), add a deprecation warning or counter first, then remove. Because version control keeps history, deletion is reversible; that makes it safe to be bold once evidence is in. Delete in separate, small commits so reverting is trivial. Beware code reached only by reflection, config, scheduled jobs or external callers."
        },
        {
          "type": "h",
          "text": "Pitfalls"
        },
        {
          "type": "list",
          "items": [
            "The big-bang rewrite: long, invisible and risky, and it freezes feature work.",
            "Migrating with no rollback path or no verification step.",
            "Dual writes with no reconciliation.",
            "Never finishing: both systems live forever. Plan and track the end state, including the shutdown."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents can translate legacy code across languages quickly, which makes big-bang rewrites tempting. Use that speed inside a strangler approach instead: have the agent port one slice at a time and generate comparison tests against the old behaviour. Review for silently dropped edge cases, and never let an agent run a data migration against production data without a dry run, a backup and your sign-off. Be sceptical when an agent claims code is unused after only a text search."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Leadership wants a full rewrite of a working twelve-year-old system that still makes money",
              "use": "Strangler fig",
              "why": "Put a router in front and replace one capability at a time, redirecting its traffic; legacy shrinks until it can be switched off. Each step is shippable and reversible, but the router adds a hop."
            },
            {
              "signal": "You must swap an internal library used in hundreds of call sites without a long-lived branch",
              "use": "Branch by abstraction",
              "why": "Introduce an abstraction over the old implementation, move callers to it, build the new one behind it, then switch and delete the old. Trunk stays releasable; costs a temporary interface."
            },
            {
              "signal": "A column must be renamed in a live database while old and new app versions run side by side",
              "use": "Expand and contract (parallel change)",
              "why": "Add new structure, backfill, move reads, then remove the old once unused. Every step is backward compatible; it takes several deploys instead of one migration."
            },
            {
              "signal": "You need confidence that the new service matches the old one on real production inputs",
              "use": "Shadow traffic / dark launch",
              "why": "Send requests to both, return only the old response, and log differences. Real coverage without user risk, but side-effecting calls must be stubbed and it doubles load."
            },
            {
              "signal": "Millions of existing rows must be converted while the system stays online",
              "use": "Idempotent batched backfill",
              "why": "Process small batches that can be safely re-run after a crash, with progress checkpoints. Slower than one big UPDATE, but avoids long locks and partial, unrecoverable states."
            },
            {
              "signal": "During a migration the app writes every change to both the old and the new store",
              "use": "Single source of truth + reconciliation",
              "why": "Dual writes are not atomic, so stores drift. Keep one store authoritative and run a job that compares and repairs, or use change data capture to feed the other."
            },
            {
              "signal": "The new implementation is ready and you are unsure it handles the long tail of real users",
              "use": "Percentage rollout with fast switch-back",
              "why": "Route 1%, then 10%, then more, watching error and parity metrics, and keep a one-step switch back. Requires routing by user or request and both systems running for a while."
            },
            {
              "signal": "A module looks unused but you are not certain nothing calls it",
              "use": "Prove dead, then delete",
              "why": "Search references, then add a usage counter or deprecation log and watch a full business cycle, including month-end jobs. Delete in a small separate commit; version control makes it reversible."
            },
            {
              "signal": "A migration has been 'almost done' for a year and both systems still need patches",
              "use": "Planned decommission milestone",
              "why": "Track the end state, including shutting the old system off, as explicit owned work. Without it, the migration never finishes and you maintain two systems forever."
            }
          ]
        }
      ],
      "keyPoints": [
        "Legacy code encodes years of edge cases; the old system's behaviour is the real specification.",
        "The strangler fig pattern replaces functionality slice by slice behind a facade, keeping every step shippable and reversible.",
        "Verify parity with characterization tests, shadow traffic and gradual rollout.",
        "Migrate data with expand, backfill, switch, contract; dual writes need a source of truth and reconciliation.",
        "Delete code only after evidence that nothing uses it, in small, revertable commits."
      ],
      "quiz": [
        {
          "q": "Why do full rewrites of working legacy systems so often go badly?",
          "options": [
            "The new language or framework is usually slower than the legacy one",
            "They lose encoded edge cases while the old system keeps changing",
            "Nobody can understand legacy code well enough to start rewriting",
            "Most companies have engineering policies that forbid full rewrites"
          ],
          "answer": 1,
          "explain": "The old system embodies many undocumented behaviours and continues to evolve, so the rewrite chases a moving target without shipping value. The old language is not the core problem."
        },
        {
          "q": "What is the defining feature of the strangler fig pattern?",
          "options": [
            "Capabilities move to new code one at a time behind a router as the old system runs",
            "The old system is frozen, rewritten offline, then swapped out over one weekend",
            "Both systems are torn down and rebuilt from scratch on the shared database",
            "The new system is produced by translating the old code line by line"
          ],
          "answer": 0,
          "explain": "Incremental replacement behind a facade keeps risk small and each step reversible. The other options are big-bang or copy approaches."
        },
        {
          "q": "You send each production request to both the old and the new service but only return the old service's response, logging differences. What is this technique?",
          "options": [
            "Blue-green deployment switch",
            "Dual writing to both stores",
            "Canary release to a small cohort",
            "Shadow traffic comparison"
          ],
          "answer": 3,
          "explain": "Shadow traffic tests the new path with real inputs without affecting users. A canary exposes real users to the new version, and dual writing concerns data stores."
        },
        {
          "q": "During a migration your app writes every change to both the old and new database. What is the main risk?",
          "options": [
            "Writes to either database become impossible",
            "The old database runs out of storage straight away",
            "The two writes are not atomic, so stores can diverge",
            "Backfills can no longer be run against the new store"
          ],
          "answer": 2,
          "explain": "One write can succeed while the other fails, or concurrent writers can apply changes in different orders, leaving the stores inconsistent. Keep one authority and reconcile."
        },
        {
          "q": "You want to delete a module that appears unused. What is the strongest first step?",
          "options": [
            "Add usage logging and watch real traffic across a full business cycle",
            "Delete it now, since version control means nothing is really lost",
            "Search for the module name and delete it if there are no hits",
            "Ask the agent to confirm that the module looks unused"
          ],
          "answer": 0,
          "explain": "Text search misses reflection, config, scheduled jobs and external callers. Observed runtime usage over a full cycle is real evidence; version control makes deletion reversible but does not prove safety."
        },
        {
          "q": "The billing migration started a year ago. 20% of customers still run on the old service, both systems need patches, and the team does everything twice. What should you reach for?",
          "options": [
            "Begin routing shadow traffic to the new service to compare it with the old system",
            "Add dual writes so both stores always hold the same data",
            "Start a full rewrite of the new service to finish faster",
            "Set a dated decommission milestone with an owner and a cutover plan"
          ],
          "answer": 3,
          "explain": "Without an end date an incremental migration stalls with two systems to maintain. Shadow traffic builds confidence but does not retire the old system."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "A teammate opens a pull request titled 'Refactor: simplify pricing' that also changes how discounts round. What is the best review response?",
      "options": [
        "Approve it, since the new rounding is more correct than the old",
        "Ask for the rounding change to move into its own commit or PR",
        "Reject it outright, because rounding behaviour must never change",
        "Ask for more code comments explaining the new rounding logic"
      ],
      "answer": 1,
      "explain": "Mixing a behaviour change into a refactor hides which change caused any regression and defeats the verification idea. Separate them so each can be reviewed and reverted alone."
    },
    {
      "q": "Scenario: an agent finishes a refactor and all tests pass, but the diff shows it edited three existing test assertions. What do you do?",
      "options": [
        "Merge it, since the full test suite is green",
        "Ask the agent to add more tests before merging",
        "Treat it as a likely behaviour change and review why",
        "Delete the edited tests, since they were brittle"
      ],
      "answer": 2,
      "explain": "Edited assertions mean the specification moved to fit the code. Unless there is a deliberate, justified reason, treat it as a behaviour change and revert or review it explicitly."
    },
    {
      "q": "Scenario: your company publishes an internal package `acme-auth` at version 1.4.0 on its private registry. A build machine suddenly installs `acme-auth` 99.0.0 from the public registry. Which mitigation addresses the root cause?",
      "options": [
        "Raise the internal package to version 100.0.0 so it wins again",
        "Run `npm audit` on every build to catch the bad version",
        "Route the internal scope or names to the private registry only",
        "Add a cooldown so new releases are installed a few days later"
      ],
      "answer": 2,
      "explain": "This is dependency confusion: the resolver saw a higher public version with the same name. Scoping internal packages and pinning that scope to the private registry removes the ambiguity. Out-bidding the version only invites the attacker to go higher, an audit only knows published advisories, and a cooldown merely delays the install."
    },
    {
      "q": "An agent proposes adding the package `python-dateutils-helper` to your project. You cannot find it in documentation you know. What is the best next step?",
      "options": [
        "Install it, since the agent has seen far more of the ecosystem",
        "Ask the agent to confirm the package is safe and well maintained",
        "Verify it on the registry yourself, or use an existing dependency",
        "Try it in a throwaway container first, then ship it if tests pass"
      ],
      "answer": 2,
      "explain": "Models can hallucinate package names that attackers then register. Check existence, age, maintainers and downloads on the registry yourself, and prefer an existing dependency or the standard library. The agent's own assurance is not evidence, and passing tests in a container says nothing about what a malicious package does later."
    },
    {
      "q": "Two problems are reported at once: an internal admin export is broken for three staff who have a manual workaround, and 30% of customers cannot log in. Using an impact-based severity scale, how should they be classified?",
      "options": [
        "Login as the higher severity, because it affects many customers with no workaround",
        "Both at the same severity, since both are broken features in production",
        "The export as higher, because it was reported first and has a known owner",
        "Whichever has the more complex technical root cause gets the higher severity"
      ],
      "answer": 0,
      "explain": "Severity follows user impact, not technical cause or report order. A core function down for many users outranks a minor issue with a workaround, and that drives who is paged and how often updates go out."
    },
    {
      "q": "Scenario: a postmortem's conclusion reads 'engineer failed to check the config before deploying'. How would a blameless review improve it?",
      "options": [
        "Remove the engineer's name but leave the conclusion unchanged",
        "Ask why the process allowed it and add automated config validation",
        "Add a rule that engineers must double-check configs before deploys",
        "Ask the engineer involved to write the whole report on their own"
      ],
      "answer": 1,
      "explain": "Blameless review looks for system conditions, such as missing validation or a confusing interface, that let a reasonable person make the error. Removing a name or demanding care changes nothing structurally."
    },
    {
      "q": "Scenario: an orders page runs one query to fetch 50 orders, then one more query per order to load its customer. It is fast in development and slow in production. What is the best fix?",
      "options": [
        "Add an index on the orders table's primary key column",
        "Fetch all 50 customers in one batched query or a join",
        "Move the database to a larger, faster server instance",
        "Cache each customer row for an hour after it is loaded"
      ],
      "answer": 1,
      "explain": "This is the N+1 query problem: round trips grow with the number of rows, and each one pays network latency in production. Batching or joining removes the extra round trips. A primary key is already indexed, a bigger server does not remove round trips, and a cache adds invalidation problems without fixing the access pattern."
    },
    {
      "q": "Scenario: an agent says it sped up an endpoint by adding an in-memory cache. You read the diff. What must you check that the agent has not shown?",
      "options": [
        "Whether the cache variable names are clear and descriptive",
        "Whether the new code is shorter than the code it replaced",
        "Measured before/after numbers and how stale data is invalidated",
        "Whether the cache is a dictionary rather than a list or set"
      ],
      "answer": 2,
      "explain": "A performance change needs evidence of the bottleneck and of improvement, plus a correct invalidation plan. Cosmetic concerns do not address correctness or benefit."
    },
    {
      "q": "A benchmark loop calls `compute(x)` one million times and discards the result. It reports an astonishing speed. What is the most likely problem?",
      "options": [
        "The optimiser removed the unused work, so nothing was measured",
        "The result is correct and the function really is that fast",
        "One million iterations is too few for any meaningful benchmark",
        "Loops in benchmarks always distort the measured timing badly"
      ],
      "answer": 0,
      "explain": "Optimisers can eliminate work with no observable effect (dead-code elimination). Benchmarks should consume the result so the work cannot be removed."
    },
    {
      "q": "Scenario: a new hire cannot run the project and reports the README's setup steps are missing a database step. What is the best fix?",
      "options": [
        "Walk the new hire through the missing step on a call",
        "Post the missing step in the team chat for everyone",
        "Fix the README, verify it on a clean machine, then script it",
        "Close the report, since the other engineers have it working"
      ],
      "answer": 2,
      "explain": "Setup problems are documentation bugs. Fix the source of truth and verify it so the next person does not hit the same gap; automation removes the class of error."
    },
    {
      "q": "Which belongs in an ADR rather than in a runbook?",
      "options": [
        "Commands to restart a stuck worker process safely",
        "Steps to rotate an expired database credential",
        "Escalation contacts and paging order for an alert",
        "Why one queue technology was chosen over two others"
      ],
      "answer": 3,
      "explain": "ADRs capture decisions and their context. Runbooks are operational procedures."
    },
    {
      "q": "Scenario: you must replace a legacy reporting module used by many teams. Which plan is most consistent with sound migration practice?",
      "options": [
        "Rewrite it in isolation for six months, then switch everyone at once",
        "Add a facade, replace one report type at a time and shadow-compare",
        "Delete the module and ask the teams to report whatever breaks",
        "Freeze all feature work on reports until a full rewrite is done"
      ],
      "answer": 1,
      "explain": "Incremental replacement with verification keeps each step reversible and delivers value early. A big-bang switch concentrates all the risk at one moment."
    },
    {
      "q": "You are renaming a database column on a live system with zero downtime. Which sequence is correct?",
      "options": [
        "Rename the column in one migration and deploy new code at the same moment",
        "Drop the old column first, then add the new one and backfill it in batches",
        "Add the new column, backfill, switch reads, drop the old one once unused",
        "Copy the table under a new name, then swap the two tables in a single step"
      ],
      "answer": 2,
      "explain": "Expand, backfill, switch, contract keeps old and new code working throughout and gives a rollback point. A one-shot rename breaks whichever code version is not yet deployed."
    },
    {
      "q": "Scenario: your team builds firmware in an air-gapped facility and must be able to audit every line of third-party code it ships. Which dependency approach fits best?",
      "options": [
        "Use wide caret ranges so builds always pick up the latest fixes",
        "Vendor the source into the repository and own its updates yourself",
        "Fetch packages from the public registry at build time over a proxy",
        "Rely on a vulnerability scanner to approve each package automatically"
      ],
      "answer": 1,
      "explain": "Vendoring gives offline, reproducible builds and lets you review exactly what ships, at the cost of owning updates and security patches. Ranges and live registry fetches need network access and drift over time, and a scanner only knows published advisories."
    },
    {
      "kind": "order",
      "q": "Put the steps of a safe refactoring loop in order.",
      "steps": [
        "Get the tests green, adding characterization tests if coverage is thin",
        "Make one small structural change",
        "Run the tests: commit on green, revert on red",
        "Once the code is easy to change, make the actual feature change on top"
      ],
      "explain": "Tests come first because they are the safety net that proves behaviour is preserved. Each small change is checked and committed (or reverted) on its own, and the feature change comes last, in a separate step, so refactoring and behaviour change never share a commit."
    },
    {
      "kind": "order",
      "q": "Checkout errors spike right after a deploy. Put the incident response in order.",
      "steps": [
        "Declare the incident and assign an incident commander",
        "Correlate the error spike with recent changes",
        "Roll back the suspect deploy",
        "Confirm the error rate is back to baseline",
        "Hold a blameless postmortem to find the root cause"
      ],
      "explain": "Someone must coordinate before the debugging starts. The responders tie the spike to deploy timing, then mitigate first with a rollback and confirm that it worked. Root cause analysis waits for the postmortem, after users stop hurting."
    },
    {
      "kind": "order",
      "q": "Put the steps of a performance improvement in order.",
      "steps": [
        "Define a goal, such as p95 under 500 ms",
        "Measure the current state",
        "Find the bottleneck with a profiler",
        "Change one thing",
        "Measure again"
      ],
      "explain": "A goal tells you when to stop, and a baseline measurement shows the gap. The profiler finds where time really goes, which is often not where intuition says. Changing one thing at a time and measuring again is the only way to know whether each change helped."
    },
    {
      "kind": "line",
      "q": "This exchange-rate cache is meant to expire entries after 60 seconds. Click the line with the bug.",
      "lang": "python",
      "code": "import time\n\nTTL_SECONDS = 60\n_cache = {}\n\ndef get_rates(currency):\n    hit = _cache.get(currency)\n    if hit and time.time() - hit[1] > TTL_SECONDS:\n        return hit[0]\n    rates = fetch_rates(currency)\n    _cache[currency] = (rates, time.time())\n    return rates",
      "answer": 7,
      "explain": "Line 8 has the comparison backwards: it returns the cached value only once it is older than the TTL, so it serves stale rates and refetches fresh ones. It should be `time.time() - hit[1] < TTL_SECONDS`."
    },
    {
      "kind": "line",
      "q": "This function was rewritten to fix an N+1 query problem, but the problem is still there. Click the line that causes it.",
      "lang": "python",
      "code": "def orders_with_customers(db):\n    orders = db.query(\"SELECT * FROM orders ORDER BY created_at DESC LIMIT 50\")\n    ids = list({o.customer_id for o in orders})\n    customers = {c.id: c for c in db.query(\n        \"SELECT * FROM customers WHERE id = ANY(%s)\", [ids])}\n    result = []\n    for o in orders:\n        customer = db.query_one(\"SELECT * FROM customers WHERE id = %s\", [o.customer_id])\n        result.append((o, customer))\n    return result",
      "answer": 7,
      "explain": "Line 8 still runs one query per order, ignoring the batch that lines 4-5 already loaded, so the page makes 51 round trips. It should look up `customers[o.customer_id]`."
    },
    {
      "kind": "line",
      "q": "This backfill for an expand-and-contract migration is meant to run in batches and be safe to re-run. Click the line with the bug.",
      "lang": "python",
      "code": "BATCH = 1000\n\ndef backfill_full_name(db):\n    while True:\n        rows = db.query(\"SELECT id, first, last FROM users LIMIT %s\", [BATCH])\n        if not rows:\n            break\n        for r in rows:\n            db.execute(\"UPDATE users SET full_name = %s WHERE id = %s\",\n                       [f\"{r.first} {r.last}\", r.id])\n        db.commit()",
      "answer": 4,
      "explain": "Line 5 does not skip rows that are already done, so it returns the same first 1,000 users forever and the loop never ends. Adding `WHERE full_name IS NULL` makes each batch pick up new work and makes the job safe to re-run."
    },
    {
      "q": "With no lockfile, which version does `npm install` resolve for this dependency?",
      "lang": "jsonc",
      "code": "// package.json\n\"lodash\": \"~4.17.21\"\n\n// versions published on the registry:\n// 4.17.20, 4.17.21, 4.17.23, 4.18.0, 5.0.0",
      "options": [
        "4.17.21",
        "4.18.0",
        "5.0.0",
        "4.17.23"
      ],
      "answer": 3,
      "explain": "A tilde range allows patch updates only (>=4.17.21 <4.18.0), and npm picks the highest match, 4.17.23. A caret range would have allowed 4.18.0, and only a wildcard or a new major range would allow 5.0.0."
    },
    {
      "q": "What does this print?",
      "lang": "python",
      "code": "latencies_ms = [100] * 98 + [2000, 4000]\navg = sum(latencies_ms) / len(latencies_ms)\np99 = sorted(latencies_ms)[int(0.99 * len(latencies_ms))]\nprint(round(avg), p99)",
      "options": [
        "158 4000",
        "100 2000",
        "158 2000",
        "100 4000"
      ],
      "answer": 0,
      "explain": "The sum is 9,800 + 6,000 = 15,800 over 100 requests, so the average is 158. The p99 index is 99, the last sorted value, 4000. The average looks healthy while 1 request in 100 takes 4 seconds, which is why you watch percentiles."
    }
  ]
});
