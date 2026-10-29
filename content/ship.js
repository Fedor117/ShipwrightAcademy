window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "ship",
  "title": "Shipping",
  "tagline": "Get changes safely from a merged PR into the hands of real users.",
  "intro": "Code that is not running in production has delivered no value, and code that reaches production unsafely is a liability. AI agents let you produce changes faster than ever, which moves the bottleneck to verifying, deploying and observing them. This section teaches the machinery that makes fast change safe: pipelines, review, API contracts, data and transactions, telemetry and release management.",
  "topics": [
    {
      "id": "continuous-integration",
      "title": "Continuous Integration",
      "minutes": 9,
      "summary": "Merge small changes often and let an automated pipeline prove each one works.",
      "lesson": [
        {
          "type": "p",
          "text": "Imagine a team of five where everyone works on a long-lived branch for three weeks. On merge day, nothing compiles, two people rewrote the same module in different ways, and a test that passed on every branch fails on the combination. This is 'integration hell', and continuous integration (CI) exists to prevent it."
        },
        {
          "type": "p",
          "text": "**Continuous integration** is the practice of merging every developer's work into a shared mainline frequently (at least daily), with each merge verified automatically by a build and test run. The point is not the tool (GitHub Actions, GitLab CI, Jenkins, Buildkite) but the feedback loop: the sooner you learn that your change conflicts with someone else's, the cheaper the fix, because the context is still in your head."
        },
        {
          "type": "h",
          "text": "The anatomy of a pipeline"
        },
        {
          "type": "p",
          "text": "A pipeline is a sequence of automated stages triggered by an event such as a push or a pull request. Each stage is a gate: if it fails, the change does not advance. A typical ordering puts the cheapest, fastest checks first so that most failures are reported in seconds rather than minutes."
        },
        {
          "type": "figure",
          "id": "ship-ci-gates",
          "caption": "Cheap gates run first: PR B fails typecheck within seconds and never reaches the slow integration job, while PR A passes every gate and lands on main.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"A CI pipeline of five gates, lint, typecheck, test, integration and build, ordered from seconds to minutes. Change A passes every gate and reaches main; change B fails typecheck and stops there.\"> <style> .ship-ci-gates-t{font-size:14px;fill:var(--fig-ink)} .ship-ci-gates-s{font-size:13px;fill:var(--fig-muted)} .ship-ci-gates-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .ship-ci-gates-main{fill:var(--fig-ok);fill-opacity:.12;stroke:var(--fig-ok);stroke-width:1.5} .ship-ci-gates-trk{stroke:var(--fig-ink);stroke-opacity:.35;stroke-width:2;fill:none} .ship-ci-gates-dash{stroke:var(--fig-line);stroke-width:2;stroke-dasharray:4 5;fill:none} .ship-ci-gates-brk{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .ship-ci-gates-ax{stroke:var(--fig-muted);stroke-width:1.5;fill:none} .ship-ci-gates-axh{fill:var(--fig-muted)} .ship-ci-gates-a{fill:var(--fig-accent);animation:ship-ci-gates-mva 7s linear infinite,ship-ci-gates-cola 7s linear infinite} .ship-ci-gates-b{fill:var(--fig-accent);animation:ship-ci-gates-mvb 7s linear infinite,ship-ci-gates-colb 7s linear infinite} .ship-ci-gates-fail{font-size:13px;fill:var(--fig-bad);animation:ship-ci-gates-showb 7s linear infinite} @keyframes ship-ci-gates-mva{0%{transform:translateX(530px);opacity:1}3%{transform:translateX(530px);opacity:0}4%{transform:translateX(0);opacity:0}7%{transform:translateX(0);opacity:1}85%{transform:translateX(530px);opacity:1}100%{transform:translateX(530px);opacity:1}} @keyframes ship-ci-gates-cola{0%,2%{fill:var(--fig-ok)}3%,84%{fill:var(--fig-accent)}85%,100%{fill:var(--fig-ok)}} @keyframes ship-ci-gates-mvb{0%{transform:translateX(162px);opacity:1}3%{transform:translateX(162px);opacity:0}4%{transform:translateX(0);opacity:0}7%{transform:translateX(0);opacity:1}30%{transform:translateX(162px);opacity:1}100%{transform:translateX(162px);opacity:1}} @keyframes ship-ci-gates-colb{0%,2%{fill:var(--fig-bad)}3%,29%{fill:var(--fig-accent)}30%,100%{fill:var(--fig-bad)}} @keyframes ship-ci-gates-showb{0%,2%{opacity:1}3%,29%{opacity:0}30%,100%{opacity:1}} </style> <path class=\"ship-ci-gates-brk\" d=\"M96 46 V40 H346 V46 M378 46 V40 H556 V46\"/> <text class=\"ship-ci-gates-s\" x=\"221\" y=\"30\" text-anchor=\"middle\">job: fast-checks</text> <text class=\"ship-ci-gates-s\" x=\"467\" y=\"30\" text-anchor=\"middle\">job: integration</text> <rect class=\"ship-ci-gates-box\" x=\"96\" y=\"60\" width=\"84\" height=\"160\" rx=\"10\"/> <rect class=\"ship-ci-gates-box\" x=\"190\" y=\"60\" width=\"84\" height=\"160\" rx=\"10\"/> <rect class=\"ship-ci-gates-box\" x=\"284\" y=\"60\" width=\"84\" height=\"160\" rx=\"10\"/> <rect class=\"ship-ci-gates-box\" x=\"378\" y=\"60\" width=\"84\" height=\"160\" rx=\"10\"/> <rect class=\"ship-ci-gates-box\" x=\"472\" y=\"60\" width=\"84\" height=\"160\" rx=\"10\"/> <rect class=\"ship-ci-gates-main\" x=\"572\" y=\"60\" width=\"56\" height=\"160\" rx=\"10\"/> <text class=\"ship-ci-gates-t\" x=\"138\" y=\"86\" text-anchor=\"middle\">lint</text> <text class=\"ship-ci-gates-t\" x=\"232\" y=\"86\" text-anchor=\"middle\">typecheck</text> <text class=\"ship-ci-gates-t\" x=\"326\" y=\"86\" text-anchor=\"middle\">test</text> <text class=\"ship-ci-gates-t\" x=\"420\" y=\"86\" text-anchor=\"middle\">integration</text> <text class=\"ship-ci-gates-t\" x=\"514\" y=\"86\" text-anchor=\"middle\">build</text> <text class=\"ship-ci-gates-t\" x=\"600\" y=\"86\" text-anchor=\"middle\">main</text> <text class=\"ship-ci-gates-t\" x=\"24\" y=\"135\">PR A</text> <text class=\"ship-ci-gates-t\" x=\"24\" y=\"185\">PR B</text> <path class=\"ship-ci-gates-trk\" d=\"M70 130 H600\"/> <path class=\"ship-ci-gates-trk\" d=\"M70 180 H232\"/> <path class=\"ship-ci-gates-dash\" d=\"M244 180 H600\"/> <circle class=\"ship-ci-gates-a\" cx=\"70\" cy=\"130\" r=\"9\"/> <circle class=\"ship-ci-gates-b\" cx=\"70\" cy=\"180\" r=\"9\"/> <text class=\"ship-ci-gates-fail\" x=\"232\" y=\"209\" text-anchor=\"middle\">failed</text> <path class=\"ship-ci-gates-ax\" d=\"M96 248 H548\"/> <path class=\"ship-ci-gates-axh\" d=\"M556 248 L546 243 V253 Z\"/> <text class=\"ship-ci-gates-s\" x=\"96\" y=\"272\">seconds</text> <text class=\"ship-ci-gates-s\" x=\"326\" y=\"272\" text-anchor=\"middle\">cheapest checks first</text> <text class=\"ship-ci-gates-s\" x=\"556\" y=\"272\" text-anchor=\"end\">minutes</text> </svg>"
        },
        {
          "type": "code",
          "lang": "yaml",
          "text": "name: ci\non:\n  pull_request:\n  push:\n    branches: [main]\njobs:\n  fast-checks:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v5\n      - run: npm ci            # exact versions from lockfile\n      - run: npm run lint\n      - run: npm run typecheck\n      - run: npm test\n  integration:\n    needs: fast-checks         # only runs if the cheap stage passed\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v5\n      - run: npm ci\n      - run: npm run test:integration\n      - run: npm run build"
        },
        {
          "type": "p",
          "text": "Note `npm ci` rather than `npm install`: it installs exactly what the lockfile says and fails if the lockfile is out of sync. That is the first step toward a reproducible build."
        },
        {
          "type": "h",
          "text": "Fast feedback is the whole game"
        },
        {
          "type": "p",
          "text": "A pipeline that takes 40 minutes changes behaviour: people batch up changes, context-switch while waiting, and start re-running failures hoping they go green. A common target is under ten minutes for the main gate. Levers include running independent jobs in parallel, caching dependencies and build outputs, running only tests affected by the change, sharding slow suites, and pushing slow end-to-end checks to a later stage or a nightly run."
        },
        {
          "type": "h",
          "text": "Trunk-based development"
        },
        {
          "type": "p",
          "text": "CI works best with **trunk-based development**: developers commit to one main branch, either directly or via very short-lived branches (hours to a day or two). Unfinished work is hidden behind feature flags rather than kept on a long branch. The alternative, long-lived feature branches, defers integration and recreates the problem CI was meant to solve. Many teams use pull requests with trunk-based development; what matters is that branches are small and short-lived."
        },
        {
          "type": "h",
          "text": "Reproducible builds and flaky tests"
        },
        {
          "type": "p",
          "text": "A build is **reproducible** if the same source commit produces the same artifact regardless of when or where it is built. Pin dependencies with lockfiles, pin base images and tool versions, avoid downloading 'latest' of anything, and build the artifact once in CI then promote that same artifact through environments instead of rebuilding per environment."
        },
        {
          "type": "p",
          "text": "A **flaky test** passes and fails on the same code, usually from timing, shared state, test order, or network calls. Flakes are corrosive: once people believe a red build might be noise, they stop trusting green ones. Quarantine or fix flaky tests promptly; do not simply add automatic retries that hide them."
        },
        {
          "type": "list",
          "items": [
            "Keep the mainline green: a broken main blocks everyone, so fixing or reverting it is top priority.",
            "Run the same commands locally as CI runs (a single `make check` or script) so failures are reproducible on your machine.",
            "Treat CI config as code: reviewed, versioned, and tested like anything else.",
            "CI proves the checks you wrote pass; it does not prove the change is correct. Weak tests give false confidence."
          ]
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "A passing pipeline is evidence, not proof. If a bug reaches production, ask which stage should have caught it and add that check, so the pipeline improves with each incident."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents can generate a lot of code quickly, which makes CI your primary safety net. Tell the agent the exact command that runs the full local check and require it to run it before declaring done. Watch for agents 'fixing' a red build by deleting or skipping a failing test, loosening an assertion, adding retries, or editing the CI config to bypass a gate. Treat any diff that touches test or pipeline files alongside production code with extra suspicion."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A 30-minute e2e suite runs before lint and unit tests, and a typo is reported half an hour later",
              "use": "Cheapest stages first (fail fast)",
              "why": "Order lint, type check and unit tests before slow suites so most failures report in minutes. Run the slow suite in parallel or later, but still gate merges on it if it guards critical paths."
            },
            {
              "signal": "The main CI gate takes 40 minutes and people batch changes and rerun red builds hoping for green",
              "use": "Cache and shard to stay under 10 min",
              "why": "Cache dependencies and build outputs and split tests across parallel runners. Caches keyed wrongly can hide breakages, so key them on the lockfile and toolchain version."
            },
            {
              "signal": "Feature branches live for weeks and merge day brings conflicts and broken builds",
              "use": "Trunk-based development",
              "why": "Integrate to `main` at least daily via short-lived branches, hiding unfinished work behind flags. Needs a fast, trusted pipeline and disciplined small changes to stay green."
            },
            {
              "signal": "A large refactor (swap the ORM) cannot finish in a day but must not live on a long branch",
              "use": "Branch by abstraction",
              "why": "Introduce an interface over the old implementation, move callers to it, build the new one behind it and switch over, merging each step to main. More steps, but trunk stays releasable."
            },
            {
              "signal": "CI and laptops resolve different dependency versions, so builds break with no code change",
              "use": "Lockfile + pinned toolchain",
              "why": "Use lockfile-enforcing installs (`npm ci`), pinned base images and tool versions so the same commit builds the same way. Update pins deliberately via automated update PRs."
            },
            {
              "signal": "The pipeline rebuilds the app separately for staging and for production",
              "use": "Build once, promote the artifact",
              "why": "Build one versioned artifact and promote that exact image through environments, injecting config at runtime. Rebuilding per stage means you never deployed what you tested."
            },
            {
              "signal": "A test fails one run in twenty on unchanged code and the team habitually clicks rerun",
              "use": "Quarantine flaky tests with an owner",
              "why": "Move it out of the blocking gate, file a ticket with an owner and deadline, and fix the root cause. Automatic retries hide real races and teach people to ignore red."
            },
            {
              "signal": "Two PRs each pass CI on their own but break `main` once both are merged",
              "use": "Merge queue",
              "why": "Test each PR against the latest `main` plus queued changes before merging, so main stays green. Adds latency per merge; batching in the queue keeps throughput up."
            },
            {
              "signal": "A failure in CI cannot be reproduced locally because CI runs a long inline YAML script",
              "use": "One entrypoint script for CI and local",
              "why": "Put checks in `make check` or a script that both CI and developers run. CI config stays thin, and failures reproduce on a laptop instead of by pushing and waiting."
            },
            {
              "signal": "`main` is red and others keep merging on top while the author investigates",
              "use": "Revert first, then fix",
              "why": "Revert the breaking change immediately to unblock everyone and fix it on a branch. A broken mainline costs the whole team; a revert is cheap and the change can land again later."
            }
          ]
        }
      ],
      "keyPoints": [
        "CI means merging small changes to a shared mainline often, each verified by an automated build and test run.",
        "Order stages cheapest-first and keep the main gate under about ten minutes so feedback stays fast.",
        "Trunk-based development with short-lived branches and feature flags avoids late, painful integration.",
        "Reproducible builds need pinned dependencies and one artifact built once and promoted; flaky tests must be fixed, not retried away."
      ],
      "quiz": [
        {
          "q": "A team's pipeline runs lint, unit tests and a 30-minute end-to-end suite all in sequence on every push. Developers have started batching several changes per push. What is the best first improvement?",
          "options": [
            "Ask developers to run the full end-to-end suite locally before every push",
            "Run lint and unit tests in a fast first stage, and shard or defer the slow suite",
            "Delete the end-to-end suite, since the unit tests already cover the same logic paths",
            "Add automatic retries so failed runs no longer need a manual rerun"
          ],
          "answer": 1,
          "explain": "Cheap checks first plus parallelism restores fast feedback while keeping the slow coverage. Deleting the suite loses safety, and retries do not shorten the loop."
        },
        {
          "q": "Why does CI use `npm ci` (or an equivalent lockfile-enforcing install) instead of resolving the newest compatible versions on every run?",
          "options": [
            "It always runs faster than a normal install, which keeps the pipeline short",
            "It lets the build run without any network access to a package registry",
            "It picks up the newest patched versions, so security fixes arrive automatically",
            "It installs exactly the locked tree, so upstream releases cannot change the build"
          ],
          "answer": 3,
          "explain": "Installing exactly what the lockfile records keeps the build deterministic. Resolving fresh versions each run can break the build without any change to your code."
        },
        {
          "q": "Which practice best describes trunk-based development?",
          "options": [
            "Everyone integrates into one mainline at least daily, hiding unfinished work behind flags",
            "Each feature lives on its own long-running branch until the whole feature is complete and tested",
            "Only release managers may merge to main, batching changes into scheduled releases",
            "Each developer keeps a personal branch that is rebased onto main once a month"
          ],
          "answer": 0,
          "explain": "The defining trait is frequent integration into a single mainline. Long-lived feature branches are the opposite and defer integration pain."
        },
        {
          "q": "A test fails about one run in twenty on unchanged code. What is the healthiest response?",
          "options": [
            "Configure the pipeline to retry failed tests three times so builds usually go green",
            "Move the whole test suite into an optional job that does not block merging",
            "Fix the nondeterminism, or quarantine the test with a tracked ticket",
            "Leave it as is, since a 95% pass rate is within normal tolerance"
          ],
          "answer": 2,
          "explain": "Flakes erode trust in the whole pipeline. Retries merely hide the symptom, while fixing or visibly quarantining addresses it."
        },
        {
          "q": "Your pipeline builds a Docker image for staging and then builds it again separately for production. Why is this risky?",
          "options": [
            "Docker refuses to build the same Dockerfile twice without a cache reset",
            "Production gets an artifact you never tested, and the rebuild may differ",
            "The only real downside is doubled registry storage for the duplicate image",
            "Nothing; staging and production should always run different images"
          ],
          "answer": 1,
          "explain": "Build once and promote the same artifact so what you tested is what you deploy. Rebuilding can pull in different dependency or tool versions."
        },
        {
          "q": "Two PRs each passed CI cleanly and were merged ten minutes apart. Now `main` fails to compile because one renamed a function the other still calls. What should you reach for?",
          "options": [
            "Run lint and unit tests first, before the slow end-to-end stage starts on every push",
            "Commit a lockfile and pin the toolchain version in CI",
            "Quarantine the failing test and assign it an owner",
            "A merge queue that tests each PR on top of the latest `main` before merging"
          ],
          "answer": 3,
          "explain": "Each PR was green only against an older `main`; a queue tests the combined result. Fail-fast stage ordering speeds feedback but still tests each PR against a stale base."
        }
      ]
    },
    {
      "id": "code-review",
      "title": "Code Review",
      "minutes": 9,
      "summary": "Review changes for correctness and risk first, keep PRs small, and give feedback people can act on.",
      "lesson": [
        {
          "type": "p",
          "text": "A pull request lands with 1,800 changed lines across 40 files. The reviewer skims, sees nothing alarming, and approves with 'LGTM'. Two days later a missing authorization check ships to production. The review happened, but it did not work. Understanding why is the heart of good code review."
        },
        {
          "type": "p",
          "text": "**Code review** is the practice of having someone other than the author examine a change before it merges. Its goals are to catch defects, spread knowledge about the codebase, keep the design coherent, and maintain shared standards. It is not primarily about gatekeeping or proving who is the better programmer."
        },
        {
          "type": "h",
          "text": "Keep pull requests small"
        },
        {
          "type": "p",
          "text": "Review quality drops sharply as size grows. Studies and experience agree that reviewers find far fewer defects per line in large changes, because attention is finite. Aim for changes a reviewer can fully understand in about 20 to 30 minutes, often a few hundred lines at most, with one logical purpose. Split mechanical changes (renames, formatting, moves) from behavioural ones so the risky part is not buried."
        },
        {
          "type": "figure",
          "id": "ship-review-budget",
          "caption": "Same 30-minute review, six times the code: attention per line drops from 6 s to 1 s, which is how a missing authorization check slips through.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 380\" role=\"img\" aria-label=\"Two pull requests drawn to scale, 300 lines and 1,800 lines, each given the same 30-minute review. The reading position moves six times faster through the larger one, past a missing authorization check.\"> <style> .ship-review-budget-t{font-size:15px;fill:var(--fig-ink)} .ship-review-budget-s{font-size:13px;fill:var(--fig-muted)} .ship-review-budget-h{font-size:14px;fill:var(--fig-muted)} .ship-review-budget-doc{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .ship-review-budget-ln{fill:var(--fig-ink);fill-opacity:.18} .ship-review-budget-bug{fill:var(--fig-bad)} .ship-review-budget-bugt{font-size:13px;fill:var(--fig-bad)} .ship-review-budget-ld{stroke:var(--fig-bad);stroke-width:1.5} .ship-review-budget-band{fill:var(--fig-accent);fill-opacity:.2;stroke:var(--fig-accent);stroke-width:1.5} .ship-review-budget-b1{animation:ship-review-budget-m1 6s linear infinite} .ship-review-budget-b2{animation:ship-review-budget-m2 6s linear infinite} @keyframes ship-review-budget-m1{from{transform:translateY(0)}to{transform:translateY(38px)}} @keyframes ship-review-budget-m2{from{transform:translateY(0)}to{transform:translateY(288px)}} </style> <defs> <pattern id=\"ship-review-budget-pat\" patternUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"300\" height=\"18\"> <rect class=\"ship-review-budget-ln\" x=\"72\" y=\"2\" width=\"96\" height=\"2\"/> <rect class=\"ship-review-budget-ln\" x=\"84\" y=\"8\" width=\"72\" height=\"2\"/> <rect class=\"ship-review-budget-ln\" x=\"84\" y=\"14\" width=\"104\" height=\"2\"/> </pattern> </defs> <text class=\"ship-review-budget-h\" x=\"320\" y=\"32\" text-anchor=\"middle\">same reviewer, same 30 minutes</text> <rect class=\"ship-review-budget-doc\" x=\"60\" y=\"60\" width=\"140\" height=\"50\" rx=\"8\"/> <rect x=\"60\" y=\"66\" width=\"140\" height=\"38\" fill=\"url(#ship-review-budget-pat)\"/> <rect class=\"ship-review-budget-doc\" x=\"360\" y=\"60\" width=\"140\" height=\"300\" rx=\"8\"/> <rect x=\"360\" y=\"66\" width=\"140\" height=\"288\" fill=\"url(#ship-review-budget-pat)\"/> <rect class=\"ship-review-budget-bug\" x=\"372\" y=\"248\" width=\"84\" height=\"4\" rx=\"2\"/> <path class=\"ship-review-budget-ld\" d=\"M462 250 H510\"/> <text class=\"ship-review-budget-bugt\" x=\"516\" y=\"246\">missing</text> <text class=\"ship-review-budget-bugt\" x=\"516\" y=\"262\">auth check</text> <rect class=\"ship-review-budget-band ship-review-budget-b1\" x=\"60\" y=\"60\" width=\"140\" height=\"12\" rx=\"4\"/> <rect class=\"ship-review-budget-band ship-review-budget-b2\" x=\"360\" y=\"60\" width=\"140\" height=\"12\" rx=\"4\"/> <text class=\"ship-review-budget-t\" x=\"216\" y=\"80\">300 lines</text> <text class=\"ship-review-budget-s\" x=\"216\" y=\"100\">6 s per line</text> <text class=\"ship-review-budget-t\" x=\"516\" y=\"80\">1,800 lines</text> <text class=\"ship-review-budget-s\" x=\"516\" y=\"100\">1 s per line</text> <rect class=\"ship-review-budget-band\" x=\"60\" y=\"330\" width=\"28\" height=\"12\" rx=\"4\"/> <text class=\"ship-review-budget-s\" x=\"98\" y=\"341\">where the reviewer is reading</text> <text class=\"ship-review-budget-s\" x=\"60\" y=\"364\">heights to scale: 1 px = 6 lines</text> </svg>"
        },
        {
          "type": "h",
          "text": "Correctness first, style last"
        },
        {
          "type": "p",
          "text": "Reviewer attention is the scarce resource, so spend it on what machines cannot check. Automate style with formatters and linters so no human argues about brace placement. Then review roughly in this order:"
        },
        {
          "type": "list",
          "items": [
            "Intent: does the change solve the stated problem, and is it the right problem?",
            "Correctness: edge cases, error handling, off-by-one, null or empty input, concurrency, idempotency.",
            "Security and data: authorization checks, input validation, secrets, personal data handling.",
            "Design: does it fit existing abstractions, and will the next change be easier or harder?",
            "Tests: do they fail without the change, and do they assert behaviour rather than implementation?",
            "Operational impact: migrations, performance on large data, logging, backwards compatibility, rollback."
          ]
        },
        {
          "type": "code",
          "lang": "python",
          "text": "def apply_discount(order, code):\n    discount = DISCOUNTS[code]          # KeyError on unknown code?\n    order.total -= order.total * discount.pct\n    order.save()                        # what if called twice (retry)?\n    return order\n\n# A good review comment targets behaviour and consequence:\n# 'If the client retries this request, the discount is applied twice.\n#  Could we compute total from line items, or guard on an applied_code field?'"
        },
        {
          "type": "h",
          "text": "Giving feedback"
        },
        {
          "type": "p",
          "text": "Comment on the code, not the person. Explain the reason, not just the demand, and distinguish blocking concerns from optional ones: prefix nits with 'nit:' or 'optional:'. Ask questions when you are unsure rather than asserting. Offer a concrete alternative when you can. Praise genuinely good decisions; it reinforces them and makes critical feedback land better."
        },
        {
          "type": "h",
          "text": "Receiving feedback"
        },
        {
          "type": "p",
          "text": "Assume good intent, and remember the review is of the change, not of you. If a comment confuses you, that is itself information: the code may be unclear, so the fix could be a clearer name or comment rather than an explanation in the thread. Disagree with reasons and evidence, and when a discussion stalls after a round or two, move to a call or pairing instead of escalating in text."
        },
        {
          "type": "h",
          "text": "Common pitfalls"
        },
        {
          "type": "list",
          "items": [
            "Rubber-stamping: approving because the author is senior or the CI is green. CI does not check intent.",
            "Bikeshedding: long threads on naming while a race condition goes unnoticed.",
            "Reviewing only the diff: sometimes the bug is in the unchanged code the diff interacts with, so open the surrounding file.",
            "Slow reviews: a PR waiting two days encourages bigger PRs and workarounds. Treat review latency as a team metric."
          ]
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Before reviewing the code, read the description and the tests. If you cannot tell what the change is supposed to do, ask for that first; a review without a stated intent can only check style."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agent output is often voluminous, polished-looking and confidently wrong, so you are now reviewing more code you did not write. Ask the agent to keep diffs small and focused, and to explain its assumptions. Check for invented APIs, silently swallowed errors, over-broad changes outside the task, deleted tests, and duplicated helpers that already exist. Reading the diff is not optional even when the agent says tests pass."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A 2,000-line PR mixes a codebase-wide rename with a change to refund calculation",
              "use": "Split mechanical from behavioral changes",
              "why": "Land the rename first (mostly skimmable) and the logic change separately, where review attention goes. Reviewers find far fewer defects per line in large mixed diffs."
            },
            {
              "signal": "Review threads argue about brace placement, import order and quote style",
              "use": "Automate style in CI",
              "why": "Run a formatter and linter as a CI gate so humans never comment on style. Pick the config once; the remaining comments can focus on intent, correctness and design."
            },
            {
              "signal": "Approval comes quickly because CI is green or the author is senior",
              "use": "Risk-ordered review checklist",
              "why": "Review intent, then correctness and edge cases, security and data access, design, tests and operations. CI cannot check intent or a missing authorization check; humans must."
            },
            {
              "signal": "A comment reads `this is wrong` with no reason, and the author cannot tell if it blocks merging",
              "use": "Reason + severity labels",
              "why": "Explain why and prefix optional points with `nit:` or `optional:` so blocking concerns stand out. Asking a question when unsure invites context instead of defensiveness."
            },
            {
              "signal": "The reviewer asks what a block does and the author explains it in a long thread reply",
              "use": "Fix confusion in the code",
              "why": "If a reviewer was confused, the next reader will be too; answer with a clearer name, smaller function or why-comment in the code. Thread answers vanish after merge."
            },
            {
              "signal": "A PR arrives with an empty description and the reviewer must reverse-engineer its purpose",
              "use": "PR description: what, why, how tested",
              "why": "State the problem, the approach, risks and how it was verified, and link the ticket. Five minutes of author time saves each reviewer far more, and becomes searchable history."
            },
            {
              "signal": "A feature is naturally 1,500 lines and cannot ship as one reviewable change",
              "use": "Stacked PRs",
              "why": "Split into a chain of small dependent PRs (schema, service, API, UI), each reviewed on its own. Requires rebasing the stack as earlier PRs change; tools help but add process."
            },
            {
              "signal": "Changes to auth, payments or migrations get approved by whoever is free",
              "use": "CODEOWNERS for sensitive paths",
              "why": "Require review from owners of high-risk directories automatically. Protects critical code, but too many owner rules create bottlenecks; keep them to areas that need expertise."
            },
            {
              "signal": "A review thread has gone back and forth 15 times on one design question",
              "use": "Move to a synchronous conversation",
              "why": "A short call or pairing session resolves disagreements faster than async ping-pong. Record the outcome in the PR so the decision stays visible."
            },
            {
              "signal": "An AI agent produced a large diff and the author has not read all of it",
              "use": "Author self-review first",
              "why": "The author reads the full diff, runs it and annotates tricky parts before requesting review. Reviewers should not be the first humans to read the code."
            }
          ]
        }
      ],
      "keyPoints": [
        "Review exists to catch defects, share knowledge and keep design coherent, not to gatekeep.",
        "Small, single-purpose PRs get better reviews; separate mechanical changes from behavioural ones.",
        "Automate style; spend human attention on intent, correctness, security, design, tests and operational impact.",
        "Give feedback on the code with reasons, label optional nits, and treat confusion as a signal that the code needs to be clearer."
      ],
      "quiz": [
        {
          "q": "You are asked to review a 2,000-line PR that mixes a rename of a core class across the codebase with a change to how refunds are calculated. What is the most effective request to the author?",
          "options": [
            "Approve it quickly, since renames are mechanical and low risk",
            "Read every line in order in one sitting, however long it takes",
            "Split it so the rename and the refund change are separate PRs",
            "Add three more reviewers and have each one skim a third of the files"
          ],
          "answer": 2,
          "explain": "Separating mechanical from behavioural changes lets reviewers verify each properly. In a mixed PR the risky refund logic is easily lost in the noise of the rename."
        },
        {
          "q": "A reviewer leaves 25 comments about variable naming and brace placement but misses that a new endpoint lacks an authorization check. What would most directly have prevented this?",
          "options": [
            "Letting a formatter and linter enforce style so humans focus on logic and security",
            "Banning review comments about naming so reviewers look at other things",
            "Requiring a second, independent approver on every PR before it is allowed to merge",
            "Assigning only senior engineers to write endpoints that touch permissions"
          ],
          "answer": 0,
          "explain": "Style is machine-checkable, so automating it frees attention for things only humans catch. Extra approvers or seniority do not change where attention is spent."
        },
        {
          "q": "Which review comment is the most useful?",
          "options": [
            "'This is wrong, please fix it before I can approve.'",
            "'Why did you write it this way? It seems bad to me.'",
            "'I would have structured this whole function differently, to be honest.'",
            "'Two concurrent requests can lose an update here. Atomic update?'"
          ],
          "answer": 3,
          "explain": "It names a concrete scenario, the consequence, and a possible fix. The others give no actionable information."
        },
        {
          "q": "CI is green and the author is a respected senior engineer. Why should you still read the change carefully?",
          "options": [
            "Because senior engineers statistically introduce more defects",
            "Because green CI only proves that the existing checks pass",
            "Because a recorded human review is legally required for every merge",
            "Because CI results are unreliable and usually need a manual re-check"
          ],
          "answer": 1,
          "explain": "Automated checks cover what someone thought to test. Review is the check on intent, missing cases and design, regardless of who wrote the code."
        },
        {
          "q": "A reviewer asks, 'What does `tmp2` hold here?' Which response best improves the code base?",
          "options": [
            "Reply in the thread with a detailed explanation and leave the code exactly as it is",
            "Point out that the meaning is obvious from the surrounding context",
            "Resolve the thread without comment, since it is not a blocking issue",
            "Rename the variable descriptively, since the confusion signals unclear code"
          ],
          "answer": 3,
          "explain": "Future readers will not see the thread. If one reviewer was confused, fixing the code makes the answer permanent."
        },
        {
          "q": "A PR changing token refresh logic was approved in two minutes by whichever teammate was free, and he had never touched the auth code. How do you stop this from happening again?",
          "options": [
            "Add a linter to CI that enforces brace and import style",
            "Require approval from the auth owners via CODEOWNERS on those paths",
            "Ask authors to split every PR into a stack of small ones",
            "Have the author carefully re-read their own diff before they request any review"
          ],
          "answer": 1,
          "explain": "Sensitive paths should need an owner with the right context. Self-review by the author helps, but it does not guarantee someone who knows auth reads the change."
        }
      ]
    },
    {
      "id": "deployment-strategies",
      "title": "Deployment Strategies",
      "minutes": 11,
      "summary": "Choose how new code reaches users so that a bad change is small, visible and quickly reversible.",
      "lesson": [
        {
          "type": "p",
          "text": "It is 4pm on Friday and your change is merged. You have two very different ways to get it live: replace everything at once and hope, or expose it gradually while watching for trouble. The first is a coin flip with all of your users watching. The second is a **deployment strategy**: a deliberate plan for moving from the old version to the new one while limiting how many users a mistake can hurt and how long it can last."
        },
        {
          "type": "p",
          "text": "A useful framing is to separate **deploying** (putting new code on production machines) from **releasing** (letting users actually experience it). Strategies below mostly control the deploy; feature flags control the release. Keeping the two apart is what lets you ship often without every deploy being a gamble."
        },
        {
          "type": "h",
          "text": "Rolling deployment"
        },
        {
          "type": "p",
          "text": "A **rolling** deployment replaces instances a few at a time. With ten servers you might take two out of the load balancer, update them, wait for health checks to pass, then move on to the next two. It needs no extra capacity beyond a small surge, and it is the default in most orchestrators such as Kubernetes. The trade-off is that during the rollout both versions serve traffic at once, so the two versions must be compatible with each other and with the shared database. Rollback is just another rolling deploy in reverse, which is slow when you are in a hurry."
        },
        {
          "type": "h",
          "text": "Blue/green deployment"
        },
        {
          "type": "p",
          "text": "In **blue/green**, you keep two complete environments. Blue serves live traffic; you deploy the new version to idle green, test it there against production-like conditions, then flip the router so all traffic goes to green. If something is wrong, flip back. The switch is near-instant and the rollback is just as fast, which is the main appeal. The costs are double the infrastructure during the switch and the fact that both environments usually share one database, so schema changes still have to be compatible with both."
        },
        {
          "type": "h",
          "text": "Canary release"
        },
        {
          "type": "p",
          "text": "A **canary** sends a small slice of real traffic, say 1%, to the new version while the rest stays on the old one. You compare the canary against the baseline on the signals that matter (error rate, latency, business metrics) and widen to 5%, 25%, 100% only if it holds up. This catches problems that no test environment can, because they only appear with real data and real users, while capping the damage. Strong canaries are automated: the pipeline widens exposure on healthy metrics and aborts by itself on regression."
        },
        {
          "type": "code",
          "lang": "yaml",
          "text": "# Progressive rollout: widen only while the canary stays healthy\nsteps:\n  - setWeight: 5\n  - pause: { duration: 10m }\n  - analysis:\n      successCondition: canary_error_rate <= baseline_error_rate * 1.1\n      failureAction: abort        # automatic rollback on regression\n  - setWeight: 25\n  - pause: { duration: 10m }\n  - setWeight: 100"
        },
        {
          "type": "figure",
          "id": "ship-canary-steps",
          "caption": "The rollout from the YAML, drawn to scale: traffic to the canary widens from 5% to 25% to 100% only after each 10-minute analysis passes.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 340\" role=\"img\" aria-label=\"Canary rollout over 30 minutes drawn to scale: 5% of traffic for 10 minutes, analysis passes, 25% for 10 minutes, analysis passes, then 100%. A bar below shows the traffic split between stable v1 and canary v2 at each moment.\"> <style> .ship-canary-steps-t{font-size:14px;fill:var(--fig-ink)} .ship-canary-steps-s{font-size:13px;fill:var(--fig-muted)} .ship-canary-steps-grid{stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 4} .ship-canary-steps-base{stroke:var(--fig-muted);stroke-width:1.5} .ship-canary-steps-area{fill:var(--fig-accent2);fill-opacity:.14} .ship-canary-steps-step{fill:none;stroke:var(--fig-accent2);stroke-width:2;stroke-linejoin:round} .ship-canary-steps-okc{fill:var(--fig-ok)} .ship-canary-steps-chk{fill:none;stroke:var(--fig-bg);stroke-width:2;stroke-linecap:round;stroke-linejoin:round} .ship-canary-steps-v1{fill:var(--fig-accent);fill-opacity:.75} .ship-canary-steps-v2{fill:var(--fig-accent2);transform-box:fill-box;transform-origin:0 0;animation:ship-canary-steps-split 7s linear infinite} .ship-canary-steps-sw2{fill:var(--fig-accent2)} .ship-canary-steps-ph{stroke:var(--fig-ink);stroke-opacity:.55;stroke-width:1.5;animation:ship-canary-steps-move 7s linear infinite} @keyframes ship-canary-steps-move{0%{transform:translateX(0)}90%,100%{transform:translateX(480px)}} @keyframes ship-canary-steps-split{0%,29.9%{transform:scaleX(.05)}30%,59.9%{transform:scaleX(.25)}60%,100%{transform:scaleX(1)}} </style> <defs><clipPath id=\"ship-canary-steps-clip\"><rect x=\"80\" y=\"264\" width=\"480\" height=\"18\" rx=\"6\"/></clipPath></defs> <text class=\"ship-canary-steps-s\" x=\"80\" y=\"32\">canary share of traffic</text> <path class=\"ship-canary-steps-grid\" d=\"M80 60 H560\"/> <path class=\"ship-canary-steps-area\" d=\"M80 220 V212 H240 V180 H400 V60 H560 V220 Z\"/> <path class=\"ship-canary-steps-step\" d=\"M80 212 H240 V180 H400 V60 H560\"/> <path class=\"ship-canary-steps-base\" d=\"M80 220 H560\"/> <text class=\"ship-canary-steps-s\" x=\"72\" y=\"64\" text-anchor=\"end\">100%</text> <text class=\"ship-canary-steps-s\" x=\"72\" y=\"224\" text-anchor=\"end\">0%</text> <text class=\"ship-canary-steps-t\" x=\"160\" y=\"202\" text-anchor=\"middle\">5% · pause 10m</text> <text class=\"ship-canary-steps-t\" x=\"320\" y=\"170\" text-anchor=\"middle\">25% · pause 10m</text> <text class=\"ship-canary-steps-t\" x=\"480\" y=\"50\" text-anchor=\"middle\">100%</text> <circle class=\"ship-canary-steps-okc\" cx=\"240\" cy=\"220\" r=\"8\"/> <path class=\"ship-canary-steps-chk\" d=\"M236 220 L239 223 L244 217\"/> <circle class=\"ship-canary-steps-okc\" cx=\"400\" cy=\"220\" r=\"8\"/> <path class=\"ship-canary-steps-chk\" d=\"M396 220 L399 223 L404 217\"/> <text class=\"ship-canary-steps-s\" x=\"80\" y=\"246\" text-anchor=\"middle\">0</text> <text class=\"ship-canary-steps-s\" x=\"240\" y=\"246\" text-anchor=\"middle\">10 min</text> <text class=\"ship-canary-steps-s\" x=\"400\" y=\"246\" text-anchor=\"middle\">20 min</text> <text class=\"ship-canary-steps-s\" x=\"560\" y=\"246\" text-anchor=\"middle\">30 min</text> <path class=\"ship-canary-steps-ph\" d=\"M80 44 V228\"/> <text class=\"ship-canary-steps-s\" x=\"72\" y=\"277\" text-anchor=\"end\">split</text> <g clip-path=\"url(#ship-canary-steps-clip)\"> <rect class=\"ship-canary-steps-v1\" x=\"80\" y=\"264\" width=\"480\" height=\"18\"/> <rect class=\"ship-canary-steps-v2\" x=\"80\" y=\"264\" width=\"480\" height=\"18\"/> </g> <rect class=\"ship-canary-steps-v1\" x=\"80\" y=\"306\" width=\"12\" height=\"12\" rx=\"3\"/> <text class=\"ship-canary-steps-s\" x=\"100\" y=\"317\">stable v1</text> <rect class=\"ship-canary-steps-sw2\" x=\"200\" y=\"306\" width=\"12\" height=\"12\" rx=\"3\"/> <text class=\"ship-canary-steps-s\" x=\"220\" y=\"317\">canary v2</text> <circle class=\"ship-canary-steps-okc\" cx=\"336\" cy=\"312\" r=\"6\"/> <text class=\"ship-canary-steps-s\" x=\"348\" y=\"317\">analysis: error ≤ baseline × 1.1</text> </svg>"
        },
        {
          "type": "h",
          "text": "Feature flags"
        },
        {
          "type": "p",
          "text": "A **feature flag** is a runtime switch that decides whether a code path runs, so the code can be deployed turned off and released later by changing configuration. Flags support gradual percentage rollouts, targeting specific users, and an instant **kill switch** that is far faster than redeploying. They also enable trunk-based development, since unfinished work can merge safely while hidden. Flags are not free: each one adds a path to test, so give every flag an owner and a removal date and delete it once fully rolled out."
        },
        {
          "type": "h",
          "text": "Rollback and roll forward"
        },
        {
          "type": "p",
          "text": "Decide before you deploy how you will undo it. **Rollback** redeploys the previous artifact, which works when the old code is still compatible with the current data. **Roll forward** ships a quick fix instead, which is sometimes the only option once data has changed. The fastest mitigation is usually a flag flip or traffic switch, with a code rollback second and a fix-forward last. Practise the rollback; an untested rollback procedure is a hope, not a plan."
        },
        {
          "type": "h",
          "text": "Database migrations that are safe to deploy"
        },
        {
          "type": "p",
          "text": "The database is the shared piece that no deployment strategy can swap out atomically. If a migration renames or drops something the running code still uses, every strategy above fails: old instances crash mid-rollout, and rolling back the code cannot bring the data back. The cure is **expand/contract** (also called parallel change): split a breaking change into steps that are each compatible with both the old and the new code."
        },
        {
          "type": "code",
          "lang": "sql",
          "text": "-- Goal: rename users.name to users.full_name without downtime\n\n-- 1. EXPAND (deploy 1): add the new column, nullable, old code unaffected\nALTER TABLE users ADD COLUMN full_name text;\n\n-- 2. Deploy 2: app writes both columns, reads the old one.\n--    Backfill existing rows in small batches:\nUPDATE users SET full_name = name WHERE full_name IS NULL AND id BETWEEN 1 AND 10000;\n\n-- 3. Deploy 3: app reads full_name (old column still written, so rollback is safe)\n\n-- 4. CONTRACT (a later deploy, once nothing reads or writes `name`):\nALTER TABLE users DROP COLUMN name;"
        },
        {
          "type": "figure",
          "id": "ship-expand-contract",
          "caption": "Each deploy changes one thing, so the code before and after it both work: name is dropped only after nothing reads or writes it.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 270\" role=\"img\" aria-label=\"Expand/contract rename of users.name to full_name over four deploys: add full_name empty; write both columns and backfill while reading name; read full_name while still writing name; finally drop name.\"> <style> .ship-expand-contract-h{font-size:14px;fill:var(--fig-ink)} .ship-expand-contract-l{font-size:14px;fill:var(--fig-ink)} .ship-expand-contract-s{font-size:13px;fill:var(--fig-muted)} .ship-expand-contract-cell{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .ship-expand-contract-empty{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 4} .ship-expand-contract-gone{fill:var(--fig-bad);fill-opacity:.06;stroke:var(--fig-bad);stroke-width:1.5;stroke-dasharray:4 4} .ship-expand-contract-gonet{font-size:13px;fill:var(--fig-bad)} .ship-expand-contract-read{fill:var(--fig-accent);fill-opacity:.14;stroke:var(--fig-accent);stroke-width:1.5} .ship-expand-contract-readt{font-size:13px;fill:var(--fig-accent)} .ship-expand-contract-write{fill:var(--fig-accent2);fill-opacity:.14;stroke:var(--fig-accent2);stroke-width:1.5} .ship-expand-contract-writet{font-size:13px;fill:var(--fig-accent2)} .ship-expand-contract-track{fill:var(--fig-line)} .ship-expand-contract-fill{fill:var(--fig-accent2);transform-box:fill-box;transform-origin:0 0;animation:ship-expand-contract-bf 8s linear infinite} .ship-expand-contract-hl{fill:none;stroke:var(--fig-ink);stroke-opacity:.4;stroke-width:2;animation:ship-expand-contract-step 8s ease-in-out infinite} @keyframes ship-expand-contract-step{0%,20%{transform:translateX(0)}25%,45%{transform:translateX(124px)}50%,70%{transform:translateX(248px)}75%,95%{transform:translateX(372px)}100%{transform:translateX(0)}} @keyframes ship-expand-contract-bf{0%,24.9%{transform:scaleX(1)}25%{transform:scaleX(.02)}45%,100%{transform:scaleX(1)}} </style> <rect class=\"ship-expand-contract-hl\" x=\"134\" y=\"24\" width=\"124\" height=\"196\" rx=\"12\"/> <text class=\"ship-expand-contract-l\" x=\"24\" y=\"108\">name</text> <text class=\"ship-expand-contract-l\" x=\"24\" y=\"184\">full_name</text> <text class=\"ship-expand-contract-h\" x=\"196\" y=\"48\" text-anchor=\"middle\">1 · expand</text> <text class=\"ship-expand-contract-h\" x=\"320\" y=\"48\" text-anchor=\"middle\">2 · dual write</text> <text class=\"ship-expand-contract-h\" x=\"444\" y=\"48\" text-anchor=\"middle\">3 · read new</text> <text class=\"ship-expand-contract-h\" x=\"568\" y=\"48\" text-anchor=\"middle\">4 · contract</text> <rect class=\"ship-expand-contract-cell\" x=\"140\" y=\"72\" width=\"112\" height=\"64\" rx=\"10\"/> <rect class=\"ship-expand-contract-read\" x=\"148\" y=\"84\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-readt\" x=\"170\" y=\"100\" text-anchor=\"middle\">read</text> <rect class=\"ship-expand-contract-write\" x=\"200\" y=\"84\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-writet\" x=\"222\" y=\"100\" text-anchor=\"middle\">write</text> <rect class=\"ship-expand-contract-cell\" x=\"264\" y=\"72\" width=\"112\" height=\"64\" rx=\"10\"/> <rect class=\"ship-expand-contract-read\" x=\"272\" y=\"84\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-readt\" x=\"294\" y=\"100\" text-anchor=\"middle\">read</text> <rect class=\"ship-expand-contract-write\" x=\"324\" y=\"84\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-writet\" x=\"346\" y=\"100\" text-anchor=\"middle\">write</text> <rect class=\"ship-expand-contract-cell\" x=\"388\" y=\"72\" width=\"112\" height=\"64\" rx=\"10\"/> <rect class=\"ship-expand-contract-write\" x=\"448\" y=\"84\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-writet\" x=\"470\" y=\"100\" text-anchor=\"middle\">write</text> <rect class=\"ship-expand-contract-gone\" x=\"512\" y=\"72\" width=\"112\" height=\"64\" rx=\"10\"/> <text class=\"ship-expand-contract-gonet\" x=\"568\" y=\"108\" text-anchor=\"middle\">dropped</text> <rect class=\"ship-expand-contract-empty\" x=\"140\" y=\"148\" width=\"112\" height=\"64\" rx=\"10\"/> <text class=\"ship-expand-contract-s\" x=\"196\" y=\"185\" text-anchor=\"middle\">added, empty</text> <rect class=\"ship-expand-contract-cell\" x=\"264\" y=\"148\" width=\"112\" height=\"64\" rx=\"10\"/> <rect class=\"ship-expand-contract-write\" x=\"324\" y=\"160\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-writet\" x=\"346\" y=\"176\" text-anchor=\"middle\">write</text> <text class=\"ship-expand-contract-s\" x=\"294\" y=\"176\" text-anchor=\"middle\">backfill</text> <rect class=\"ship-expand-contract-track\" x=\"272\" y=\"194\" width=\"96\" height=\"6\" rx=\"3\"/> <rect class=\"ship-expand-contract-fill\" x=\"272\" y=\"194\" width=\"96\" height=\"6\" rx=\"3\"/> <rect class=\"ship-expand-contract-cell\" x=\"388\" y=\"148\" width=\"112\" height=\"64\" rx=\"10\"/> <rect class=\"ship-expand-contract-read\" x=\"396\" y=\"160\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-readt\" x=\"418\" y=\"176\" text-anchor=\"middle\">read</text> <rect class=\"ship-expand-contract-write\" x=\"448\" y=\"160\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-writet\" x=\"470\" y=\"176\" text-anchor=\"middle\">write</text> <rect class=\"ship-expand-contract-cell\" x=\"512\" y=\"148\" width=\"112\" height=\"64\" rx=\"10\"/> <rect class=\"ship-expand-contract-read\" x=\"520\" y=\"160\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-readt\" x=\"542\" y=\"176\" text-anchor=\"middle\">read</text> <rect class=\"ship-expand-contract-write\" x=\"572\" y=\"160\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-writet\" x=\"594\" y=\"176\" text-anchor=\"middle\">write</text> <rect class=\"ship-expand-contract-read\" x=\"140\" y=\"236\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-readt\" x=\"162\" y=\"252\" text-anchor=\"middle\">read</text> <rect class=\"ship-expand-contract-write\" x=\"192\" y=\"236\" width=\"44\" height=\"22\" rx=\"6\"/> <text class=\"ship-expand-contract-writet\" x=\"214\" y=\"252\" text-anchor=\"middle\">write</text> <text class=\"ship-expand-contract-s\" x=\"248\" y=\"252\">what the running app does with each column</text> </svg>"
        },
        {
          "type": "list",
          "items": [
            "Never combine a destructive schema change and the code that depends on it in one deploy.",
            "Make each migration backward compatible with the version currently running, so rollback stays possible.",
            "Backfill large tables in batches to avoid long locks, and make migrations safe to re-run.",
            "Drop old columns only after a full release cycle in which nothing used them."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents tend to write the one-shot version: a single migration that renames the column plus the code that uses the new name, and a deploy plan of 'just ship it'. Ask explicitly for expand/contract steps as separate PRs, a stated rollback path for each, and a flag around new behaviour. Review any migration that contains `DROP`, `RENAME` or `NOT NULL` with extra care, and never let an agent run migrations against production directly."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A payments service must switch all traffic at a chosen moment and revert in seconds; double capacity is affordable",
              "use": "Blue/green",
              "why": "Deploy to the idle environment, verify, then flip the router; reverting is flipping back. Costs double capacity and does not help with incompatible database changes."
            },
            {
              "signal": "A change is risky in ways tests cannot show, and you want real-traffic evidence with a capped blast radius",
              "use": "Canary release",
              "why": "Send 1-5% of traffic to the new version and compare error rate and latency to the baseline before widening. Needs good metrics and enough traffic for a meaningful comparison."
            },
            {
              "signal": "A stateless fleet behind a load balancer gets a backward-compatible change",
              "use": "Rolling deployment",
              "why": "Replace a few instances at a time behind health checks; cheap and needs no spare environment. Old and new versions serve traffic at once, so both must work with the same data and APIs."
            },
            {
              "signal": "Code must merge and deploy now, but the feature should go live later or to a subset of users",
              "use": "Feature flag (decouple deploy from release)",
              "why": "Deploy with the path off, then release by config, by percentage or segment, with an instant kill switch. Every flag is a branch in the code and doubles test paths."
            },
            {
              "signal": "The codebase has 40 flags and 30 have been at 100% for six months",
              "use": "Flag expiry and cleanup",
              "why": "Give each release flag an owner and removal date, then delete the flag and the dead branch once fully rolled out. Stale flags are tech debt and can be flipped by accident."
            },
            {
              "signal": "A heavily used column must be renamed with zero downtime and a safe rollback at each step",
              "use": "Expand/contract migration",
              "why": "Add the new column, dual-write, backfill, move reads, then stop writing and drop the old one in later deploys. Each step works with old and new code; the cost is several releases."
            },
            {
              "signal": "A migration needs to update every row of a 200-million-row table",
              "use": "Batched backfill",
              "why": "Update in small batches with pauses, outside the schema-change deploy, so locks stay short and replicas keep up. Make it resumable and idempotent; it may run for hours."
            },
            {
              "signal": "A rewritten service path must be checked against production traffic without users seeing its results",
              "use": "Shadow traffic (dark launch)",
              "why": "Mirror real requests to the new path, discard its responses and diff them against the old. Doubles load on dependencies, and side effects like writes or emails must be suppressed."
            },
            {
              "signal": "Errors spike right after a deploy and no data or schema changed",
              "use": "Rollback first, debug later",
              "why": "Redeploy the previous artifact to stop user impact, then investigate. Roll forward instead only when rollback is unsafe, such as after an irreversible migration; decide which before deploying."
            }
          ]
        }
      ],
      "keyPoints": [
        "Deploying puts code on servers; releasing exposes it to users. Flags and gradual rollouts keep the two separate.",
        "Rolling updates are cheap but run two versions at once; blue/green gives instant switch and revert at the cost of double capacity; canaries test on real traffic with a capped blast radius.",
        "Feature flags give a fast kill switch, but each flag needs an owner and a removal date.",
        "Use expand/contract so every migration step works with both old and new code, and rollback stays possible."
      ],
      "quiz": [
        {
          "q": "Your payments service must switch all traffic to a new version at a chosen moment and be able to revert within seconds. You can afford temporary double capacity. Which strategy fits best?",
          "options": [
            "Rolling update, replacing one instance at a time until all are new",
            "Blue/green, switching traffic between two environments",
            "Recreate, stopping every old instance before starting any new one",
            "Canary at 1%, widening gradually over several days of observation"
          ],
          "answer": 1,
          "explain": "Blue/green keeps the old environment running, so both the cutover and the revert are a single routing change. A rolling update reverts slowly and a recreate causes downtime."
        },
        {
          "q": "A canary is serving 5% of traffic. Which check is the best basis for deciding to promote it to 25%?",
          "options": [
            "Confirm the canary instances started and pass their health checks",
            "Wait for the first support ticket before widening any further",
            "Compare only median latency, since errors are rare at 5% exposure",
            "Compare canary error rate and latency to baseline"
          ],
          "answer": 3,
          "explain": "A canary is only useful if you compare it with the baseline on user-visible signals. Health checks and a lack of complaints say little, and ignoring errors misses the likeliest failure."
        },
        {
          "q": "Your codebase has 40 feature flags, and 30 have been at 100% for over six months. What is the right move?",
          "options": [
            "Keep them all permanently as extra safety switches",
            "Convert them into permanent environment variables",
            "Remove the flags and their dead code paths",
            "Add tests for every combination of flags, so each is covered"
          ],
          "answer": 2,
          "explain": "Fully rolled-out flags are dead weight: extra paths, confusion and untested combinations. Removing them is part of the flag lifecycle, and testing every combination explodes."
        },
        {
          "q": "You must rename a heavily used column with zero downtime and a safe rollback at each step. Which sequence is right?",
          "options": [
            "Add new column, dual-write and backfill, move reads, drop old later",
            "Run `ALTER TABLE ... RENAME COLUMN` in the same deploy that ships the new code",
            "Deploy the new code first, then rename the column during the next maintenance window",
            "Drop the old column and add the new one inside a single transaction before deploying"
          ],
          "answer": 0,
          "explain": "Expand/contract keeps each step compatible with the code that is running. A direct rename breaks old instances during the rollout and cannot be rolled back with code alone."
        },
        {
          "q": "A release included code plus a migration that dropped a column. Errors spike, so the team redeploys the previous code version, but errors continue. Why?",
          "options": [
            "Redeploying cannot replace a container that is already running traffic",
            "Feature flags prevent the previous version from starting after a deploy",
            "Old code needs the dropped column; rollback does not restore data",
            "The load balancer keeps caching the new version's responses for an hour"
          ],
          "answer": 2,
          "explain": "Code and data roll back independently. Once the column is gone, the old code fails against it, which is why destructive migrations must be deferred to a later contract step."
        },
        {
          "q": "A migration must set `region` on all 200 million rows of `orders`. A single `UPDATE` locked the table in staging and ballooned the transaction log. Which approach fits best?",
          "options": [
            "Put the change behind a feature flag and flip it for all users",
            "Deploy it to a blue environment and switch traffic over at once",
            "Update in small id-ranged batches with pauses, safe to rerun",
            "Roll it out with a canary at 5% of production traffic"
          ],
          "answer": 2,
          "explain": "Batching keeps each transaction short and lets the job resume. A canary or blue/green switch controls traffic to code, not the size of a data update."
        }
      ]
    },
    {
      "id": "infrastructure-environments",
      "title": "Infrastructure & Environments",
      "minutes": 11,
      "summary": "Describe where and how your software runs as versioned, repeatable artifacts instead of hand-built servers.",
      "lesson": [
        {
          "type": "p",
          "text": "A classic outage story: the app worked on the developer's laptop and in staging, then failed in production because the production server had a different runtime version, a missing environment variable and a firewall rule that someone had once added by hand and never recorded. Nothing was wrong with the code. The problem was that the environment was an unwritten, unrepeatable thing. This topic is about making the environment as explicit and reviewable as the code itself."
        },
        {
          "type": "h",
          "text": "Containers"
        },
        {
          "type": "p",
          "text": "A **container** packages an application with its dependencies and runtime into an **image**, and runs it as an isolated process that shares the host's operating system kernel. Unlike a virtual machine it does not carry a whole guest OS, so it starts in seconds and is light on resources. The key benefit for shipping is that you build the image once and run the identical artifact on a laptop, in CI, in staging and in production."
        },
        {
          "type": "code",
          "lang": "dockerfile",
          "text": "# Pin the base image: 'latest' would change under you\nFROM node:22.11-slim AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:22.11-slim\nWORKDIR /app\nCOPY --from=build /app/dist ./dist\nCOPY --from=build /app/node_modules ./node_modules\nUSER node                      # do not run as root\nEXPOSE 8080\nCMD [\"node\", \"dist/server.js\"]"
        },
        {
          "type": "p",
          "text": "Containers should be **immutable** and **stateless**: you never patch a running container, you build a new image and replace it. Anything that must survive a restart (uploads, databases) lives outside, in a managed database or object storage. Tag images with the commit SHA or a version, not just `latest`, so you can tell exactly what is running and roll back to a known image."
        },
        {
          "type": "h",
          "text": "Infrastructure as code"
        },
        {
          "type": "p",
          "text": "**Infrastructure as code (IaC)** means defining servers, networks, databases and permissions in text files that a tool such as Terraform, OpenTofu, Pulumi or CloudFormation applies. The files live in version control, go through review, and can recreate an entire environment on demand. Most tools are **declarative**: you describe the desired end state, and the tool computes and applies the difference. Running a **plan** first shows exactly what will change before anything is touched."
        },
        {
          "type": "code",
          "lang": "hcl",
          "text": "resource \"aws_db_instance\" \"orders\" {\n  identifier          = \"orders-${var.env}\"\n  engine              = \"postgres\"\n  engine_version      = \"16.4\"\n  instance_class      = var.db_instance_class   # small in staging, larger in prod\n  allocated_storage   = 50\n  deletion_protection = true\n  password            = var.db_password         # injected, never hard-coded\n}"
        },
        {
          "type": "p",
          "text": "The failure mode to watch is **drift**: someone edits a resource in the cloud console, and reality no longer matches the code. The next apply may silently undo the manual fix or, worse, destroy something. The discipline is that every change goes through code and review, and the tool's state file is stored remotely and protected."
        },
        {
          "type": "h",
          "text": "Config versus secrets"
        },
        {
          "type": "p",
          "text": "Following the twelve-factor idea, **configuration** that varies between environments (database host, timeouts, log level, feature toggles) is kept out of the code and supplied at runtime, so the same image works everywhere. **Secrets** are the subset that grants access: passwords, API keys, signing keys, tokens. Ordinary config can sit in version control; secrets must not. They belong in a secret manager (such as AWS Secrets Manager, Vault or your platform's encrypted store), are injected when the process starts, and are rotated on a schedule."
        },
        {
          "type": "figure",
          "id": "ship-build-once",
          "caption": "The same image, tagged with its commit SHA, runs everywhere; only the config injected at runtime changes between environments.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"One container image, app:3f9c2a1, is built once and copied unchanged to laptop, staging and production. Only the runtime config differs: DB_HOST and LOG_LEVEL change per environment.\"> <style> .ship-build-once-h{font-size:14px;fill:var(--fig-ink)} .ship-build-once-s{font-size:13px;fill:var(--fig-muted)} .ship-build-once-k{font-size:13px;fill:var(--fig-accent2)} .ship-build-once-v{font-size:13px;fill:var(--fig-ink)} .ship-build-once-col{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .ship-build-once-img{fill:var(--fig-accent);fill-opacity:.14;stroke:var(--fig-accent);stroke-width:1.5} .ship-build-once-imgt{font-size:13px;fill:var(--fig-ink)} .ship-build-once-bgc{fill:var(--fig-bg)} .ship-build-once-cfg{fill:var(--fig-bg);stroke:var(--fig-accent2);stroke-opacity:.6;stroke-width:1.5;stroke-dasharray:4 4} .ship-build-once-src{fill:var(--fig-accent);fill-opacity:.14;stroke:var(--fig-accent);stroke-width:2} .ship-build-once-g1{opacity:0;animation:ship-build-once-m1 6s linear infinite} .ship-build-once-g2{opacity:0;animation:ship-build-once-m2 6s linear infinite} .ship-build-once-g3{opacity:0;animation:ship-build-once-m3 6s linear infinite} @keyframes ship-build-once-m1{0%,5%{transform:translateX(0);opacity:0}6%{transform:translateX(0);opacity:1}25%{transform:translateX(184px);opacity:1}29%,100%{transform:translateX(184px);opacity:0}} @keyframes ship-build-once-m2{0%,33%{transform:translateX(0);opacity:0}34%{transform:translateX(0);opacity:1}55%{transform:translateX(320px);opacity:1}59%,100%{transform:translateX(320px);opacity:0}} @keyframes ship-build-once-m3{0%,63%{transform:translateX(0);opacity:0}64%{transform:translateX(0);opacity:1}87%{transform:translateX(456px);opacity:1}91%,100%{transform:translateX(456px);opacity:0}} </style> <text class=\"ship-build-once-h\" x=\"100\" y=\"48\" text-anchor=\"middle\">CI: build once</text> <rect class=\"ship-build-once-src\" x=\"24\" y=\"84\" width=\"152\" height=\"40\" rx=\"10\"/> <text class=\"ship-build-once-imgt\" x=\"100\" y=\"109\" text-anchor=\"middle\">app:3f9c2a1</text> <text class=\"ship-build-once-s\" x=\"100\" y=\"148\" text-anchor=\"middle\">tagged with commit SHA</text> <text class=\"ship-build-once-s\" x=\"100\" y=\"196\" text-anchor=\"middle\">image: identical</text> <text class=\"ship-build-once-s\" x=\"100\" y=\"216\" text-anchor=\"middle\">config: varies</text> <text class=\"ship-build-once-h\" x=\"284\" y=\"48\" text-anchor=\"middle\">laptop</text> <rect class=\"ship-build-once-col\" x=\"224\" y=\"64\" width=\"120\" height=\"192\" rx=\"12\"/> <rect class=\"ship-build-once-img\" x=\"232\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/> <text class=\"ship-build-once-imgt\" x=\"284\" y=\"109\" text-anchor=\"middle\">app:3f9c2a1</text> <rect class=\"ship-build-once-cfg\" x=\"232\" y=\"140\" width=\"104\" height=\"100\" rx=\"8\"/> <text class=\"ship-build-once-k\" x=\"242\" y=\"162\">DB_HOST</text> <text class=\"ship-build-once-v\" x=\"242\" y=\"182\">localhost</text> <text class=\"ship-build-once-k\" x=\"242\" y=\"206\">LOG_LEVEL</text> <text class=\"ship-build-once-v\" x=\"242\" y=\"226\">debug</text> <text class=\"ship-build-once-h\" x=\"420\" y=\"48\" text-anchor=\"middle\">staging</text> <rect class=\"ship-build-once-col\" x=\"360\" y=\"64\" width=\"120\" height=\"192\" rx=\"12\"/> <rect class=\"ship-build-once-img\" x=\"368\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/> <text class=\"ship-build-once-imgt\" x=\"420\" y=\"109\" text-anchor=\"middle\">app:3f9c2a1</text> <rect class=\"ship-build-once-cfg\" x=\"368\" y=\"140\" width=\"104\" height=\"100\" rx=\"8\"/> <text class=\"ship-build-once-k\" x=\"378\" y=\"162\">DB_HOST</text> <text class=\"ship-build-once-v\" x=\"378\" y=\"182\">db-staging</text> <text class=\"ship-build-once-k\" x=\"378\" y=\"206\">LOG_LEVEL</text> <text class=\"ship-build-once-v\" x=\"378\" y=\"226\">info</text> <text class=\"ship-build-once-h\" x=\"556\" y=\"48\" text-anchor=\"middle\">production</text> <rect class=\"ship-build-once-col\" x=\"496\" y=\"64\" width=\"120\" height=\"192\" rx=\"12\"/> <rect class=\"ship-build-once-img\" x=\"504\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/> <text class=\"ship-build-once-imgt\" x=\"556\" y=\"109\" text-anchor=\"middle\">app:3f9c2a1</text> <rect class=\"ship-build-once-cfg\" x=\"504\" y=\"140\" width=\"104\" height=\"100\" rx=\"8\"/> <text class=\"ship-build-once-k\" x=\"514\" y=\"162\">DB_HOST</text> <text class=\"ship-build-once-v\" x=\"514\" y=\"182\">db-prod</text> <text class=\"ship-build-once-k\" x=\"514\" y=\"206\">LOG_LEVEL</text> <text class=\"ship-build-once-v\" x=\"514\" y=\"226\">warn</text> <g class=\"ship-build-once-g1\"><rect class=\"ship-build-once-bgc\" x=\"48\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/><rect class=\"ship-build-once-img\" x=\"48\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/><text class=\"ship-build-once-imgt\" x=\"100\" y=\"109\" text-anchor=\"middle\">app:3f9c2a1</text></g> <g class=\"ship-build-once-g2\"><rect class=\"ship-build-once-bgc\" x=\"48\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/><rect class=\"ship-build-once-img\" x=\"48\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/><text class=\"ship-build-once-imgt\" x=\"100\" y=\"109\" text-anchor=\"middle\">app:3f9c2a1</text></g> <g class=\"ship-build-once-g3\"><rect class=\"ship-build-once-bgc\" x=\"48\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/><rect class=\"ship-build-once-img\" x=\"48\" y=\"84\" width=\"104\" height=\"40\" rx=\"8\"/><text class=\"ship-build-once-imgt\" x=\"100\" y=\"109\" text-anchor=\"middle\">app:3f9c2a1</text></g> </svg>"
        },
        {
          "type": "p",
          "text": "A secret committed to git is compromised, even if you delete it in the next commit, because history and clones keep it. The correct response is always to **revoke and rotate** the credential first, then clean up."
        },
        {
          "type": "h",
          "text": "Dev, staging and production parity"
        },
        {
          "type": "p",
          "text": "Environments exist to catch problems before users do, and they only do that to the extent that they resemble production. Aim for **parity**: the same container image, the same database engine and major version, the same infrastructure code with different parameters. Staging can be smaller, but it should not use a different kind of database or skip the load balancer. Every difference is a place where a bug can hide until production."
        },
        {
          "type": "h",
          "text": "Cloud basics"
        },
        {
          "type": "p",
          "text": "Cloud platforms rent you building blocks at different levels of abstraction. **IaaS** gives you virtual machines and networks you manage. **PaaS** and container platforms run your code or images and handle scaling and patching. **Serverless** functions run per request and scale to zero. Moving up the ladder trades control for less operational work. Whatever the level, you share responsibility: the provider secures the data centre, you secure your configuration, identities and data. Most cloud incidents come from misconfiguration, such as a public storage bucket or an over-broad role, not from the provider being hacked."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Cloud costs and permissions are part of the blast radius. An agent or script with broad credentials can create expensive resources or delete production data in one command. Grant least privilege, set budget alerts, and enable deletion protection on stateful resources."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents will happily write a Dockerfile with `FROM node:latest`, run as root, bake a `.env` into the image, or fix a failing deploy by pasting a real key into a config file. Ask for pinned image versions, a non-root user and secrets passed by reference. When asking for IaC changes, require the agent to show the plan output and stop for your review, and never give it credentials that can apply changes to production."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "The app passes in staging but crashes in production because the Node.js version differs",
              "use": "Container image built once",
              "why": "Package runtime and dependencies into one image and run that same image in every environment. Removes version drift; base images still need regular rebuilds for security patches."
            },
            {
              "signal": "An engineer SSHes into a production server to patch a file or install a package",
              "use": "Immutable infrastructure",
              "why": "Never patch running instances; change the code or image and replace them. Every server then matches a known build, at the cost of a pipeline fast enough for urgent fixes."
            },
            {
              "signal": "Servers, networks and permissions were clicked together in a cloud console and nobody can recreate them",
              "use": "Infrastructure as code",
              "why": "Define resources in Terraform, OpenTofu or similar, reviewed in PRs and applied by CI. Environments become reproducible and auditable; state files need locking and protection."
            },
            {
              "signal": "A teammate fixed an outage by editing a firewall rule in the console, and the IaC code says otherwise",
              "use": "Codify the change and detect drift",
              "why": "Port the fix into code promptly, apply it and run plan-based drift checks on a schedule. Otherwise the next apply silently reverts the fix or destroys something."
            },
            {
              "signal": "The database host or log level is hardcoded, and each environment needs its own build",
              "use": "Config from the environment (twelve-factor)",
              "why": "Read environment-specific values at runtime so one artifact runs anywhere. Validate config at startup and fail fast on missing values rather than failing mid-request."
            },
            {
              "signal": "An API key in `.env` was committed and pushed to a shared repo",
              "use": "Revoke and rotate, then use a secret manager",
              "why": "Treat it as leaked: rotate first, then remove it from history, and load secrets at runtime from a vault or cloud secret store. Deleting it in a new commit does not help; history keeps it."
            },
            {
              "signal": "Staging uses SQLite and one instance while production runs PostgreSQL behind a load balancer",
              "use": "Dev/prod parity",
              "why": "Use the same image, database engine and major version, and similar topology in staging, scaled down. Each difference hides a class of bugs; full parity on size and data is rarely affordable."
            },
            {
              "signal": "Reviewers cannot try a PR without merging it to a shared staging that others are also using",
              "use": "Ephemeral preview environments",
              "why": "Spin up an environment per PR from the same IaC and tear it down on merge. Great for review and QA; costs cloud spend and needs seeded data and cleanup automation."
            },
            {
              "signal": "User uploads stored inside the container disappear whenever it is replaced or rescheduled",
              "use": "Externalize state",
              "why": "Keep containers stateless; put files in object storage and data in managed databases. Instances become disposable and scalable; you pay for an extra network hop and service."
            },
            {
              "signal": "CI holds long-lived cloud access keys in its settings for deploys",
              "use": "Short-lived credentials via OIDC",
              "why": "Let the CI provider exchange its identity token for temporary, scoped cloud credentials per job. No static key to leak or rotate; setup needs trust policies scoped to repo and branch."
            }
          ]
        }
      ],
      "keyPoints": [
        "Containers package the app and its dependencies into an immutable image that you build once and run unchanged everywhere.",
        "Infrastructure as code makes environments reviewable and repeatable; guard against drift by changing infrastructure only through code.",
        "Config varies per environment and is injected at runtime; secrets live in a secret manager, and a leaked secret must be rotated.",
        "Keep staging close to production in image, database engine and topology, since every difference hides potential bugs."
      ],
      "quiz": [
        {
          "q": "An app passes in staging but crashes in production because production runs a different Node.js version. Which change best removes this class of problem?",
          "options": [
            "Document the required Node.js version carefully in the project README file",
            "Ask the ops team to upgrade production to the newest Node.js version",
            "Build one image with a pinned runtime and promote it everywhere",
            "Install the matching Node.js version on production by hand and note it in a ticket"
          ],
          "answer": 2,
          "explain": "A single image carries its own runtime, so every environment runs the same thing. Documentation and manual installs depend on people remembering and are exactly what drifts."
        },
        {
          "q": "An AI agent committed an API key in `.env`, and the commit was already pushed to a shared repo. What is the correct first response?",
          "options": [
            "Revoke and rotate the key, then move it to a secret manager",
            "Delete the file in a new commit so it no longer appears",
            "Make the repository private, since the key is then hidden",
            "Rewrite git history and force-push, then continue using the key"
          ],
          "answer": 0,
          "explain": "Once pushed, assume the key is exposed, and history and clones retain it. Rotation is the only step that actually removes the risk; cleaning history is secondary."
        },
        {
          "q": "A teammate fixed an outage by editing a firewall rule in the cloud console. Your infrastructure is managed with Terraform. What is the best follow-up?",
          "options": [
            "Leave it as is, since the console change already fixed the outage",
            "Disable the plan step so Terraform no longer reports any differences",
            "Re-run apply immediately and accept whatever changes it proposes",
            "Add the rule to the Terraform code and apply it via review"
          ],
          "answer": 3,
          "explain": "Console edits create drift. An unreviewed apply could silently revert the fix, so reconcile the code with the change through the normal review path."
        },
        {
          "q": "Staging uses SQLite for convenience while production uses Postgres. A query bug shows up only in production. What is the most useful lesson?",
          "options": [
            "Add many more unit tests that mock out the database layer entirely",
            "Match staging's database engine and version to production",
            "Skip staging for any database-related change and verify in production instead",
            "Switch production over to SQLite as well so that both environments match"
          ],
          "answer": 1,
          "explain": "Environment differences are where bugs hide. Matching the engine and version lets staging reproduce database-specific behaviour. Mocks cannot reproduce it either."
        },
        {
          "q": "Which of these is acceptable to keep in a plain configuration file committed to the repository?",
          "options": [
            "The request timeout, set to 5 seconds",
            "The password for the production database",
            "The live key for the payment provider",
            "The key used to sign login tokens"
          ],
          "answer": 0,
          "explain": "A timeout is ordinary configuration with no access value. Passwords, live provider keys and signing keys are secrets and belong in a secret manager."
        },
        {
          "q": "Users upload avatars to the container's local disk. After every deploy they vanish, and with three replicas only the one that handled the upload can serve the file. What should you do?",
          "options": [
            "Store uploads in external object storage and keep containers stateless",
            "Build the container image once and promote that same image across every environment",
            "Move the storage path into an environment variable per stage",
            "Spin up a preview environment for each pull request"
          ],
          "answer": 0,
          "explain": "Containers are replaceable, so durable data must live outside them. Config from the environment only changes where the path points; it still writes to a disk that gets discarded."
        }
      ]
    },
    {
      "id": "observability",
      "title": "Observability",
      "minutes": 10,
      "summary": "Use logs, metrics and traces to understand a running system, and alert on user-visible symptoms.",
      "lesson": [
        {
          "type": "p",
          "text": "It is 2am. Customers report that checkout is slow. Your service has twelve dependencies, three databases and a queue. Where do you start? **Observability** is the property of a system that lets you answer questions about its internal behaviour from the data it emits, including questions you did not anticipate when you wrote the code. Without it, production is a black box and every incident is guesswork."
        },
        {
          "type": "h",
          "text": "The three pillars"
        },
        {
          "type": "p",
          "text": "Three kinds of telemetry complement each other. Each answers a different question, and none replaces the others."
        },
        {
          "type": "list",
          "items": [
            "**Logs**: timestamped records of discrete events. Best for detail about what happened in one specific case. Expensive at volume and hard to aggregate unless structured.",
            "**Metrics**: numeric measurements aggregated over time (request rate, error rate, latency percentiles, queue depth). Cheap to store and ideal for dashboards, trends and alerting. They tell you that something is wrong, not why.",
            "**Traces**: the path of a single request across services, as a tree of timed spans. They show where time went and which dependency failed."
          ]
        },
        {
          "type": "h",
          "text": "Structured logs"
        },
        {
          "type": "p",
          "text": "Write logs as key-value records, not prose, so they can be filtered and counted. Include a request or trace ID so one user's journey can be followed across services. Log at appropriate levels, and never log secrets or personal data."
        },
        {
          "type": "code",
          "lang": "js",
          "text": "// Hard to query:\nconsole.log('Payment failed for user 42 because card declined');\n\n// Queryable and correlatable:\nlogger.warn({\n  event: 'payment_failed',\n  reason: 'card_declined',\n  user_id: 42,\n  trace_id: ctx.traceId,\n  amount_cents: 1999,\n});"
        },
        {
          "type": "h",
          "text": "Metrics and percentiles"
        },
        {
          "type": "p",
          "text": "Averages hide pain. If 95 requests take 100 ms and 5 take 10 seconds, the mean is about 600 ms, which describes nobody's experience. Use percentiles: p50 is the typical request, p99 is the slow tail that some real users hit constantly. Also beware high-cardinality labels (such as user ID on a metric): they explode storage cost. Put such detail in logs or traces."
        },
        {
          "type": "figure",
          "id": "ship-percentiles",
          "caption": "To scale, 95 fast requests barely show above the axis; the mean sits at about 600 ms where no request is, while p50 and p99 describe real ones.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 360\" role=\"img\" aria-label=\"100 requests sorted by latency, drawn to scale: 95 take 100 ms and 5 take 10 s. p50 is 100 ms, p99 is 10 s, and the mean of about 600 ms matches no request at all.\"> <style> .ship-percentiles-s{font-size:13px;fill:var(--fig-muted)} .ship-percentiles-t{font-size:14px;fill:var(--fig-ink)} .ship-percentiles-w{font-size:14px;fill:var(--fig-warn)} .ship-percentiles-grid{stroke:var(--fig-line);stroke-width:1.5} .ship-percentiles-base{stroke:var(--fig-muted);stroke-width:1.5} .ship-percentiles-bar{fill:var(--fig-accent)} .ship-percentiles-mean{stroke:var(--fig-warn);stroke-width:2;stroke-dasharray:6 4} .ship-percentiles-mk{stroke:var(--fig-ink);stroke-opacity:.6;stroke-width:1.5} .ship-percentiles-cur{stroke:var(--fig-accent2);stroke-opacity:.6;stroke-width:1.5} .ship-percentiles-dot{fill:var(--fig-accent2);animation:ship-percentiles-y 7s linear infinite} .ship-percentiles-cx{animation:ship-percentiles-x 7s linear infinite} @keyframes ship-percentiles-x{0%{transform:translateX(0)}90%,100%{transform:translateX(475.2px)}} @keyframes ship-percentiles-y{0%,85.9%{transform:translateY(0)}86%,100%{transform:translateY(-198px)}} </style> <defs><pattern id=\"ship-percentiles-pat\" patternUnits=\"userSpaceOnUse\" x=\"110\" y=\"0\" width=\"4.8\" height=\"400\"><rect class=\"ship-percentiles-bar\" x=\"0\" y=\"0\" width=\"3.6\" height=\"400\"/></pattern></defs> <path class=\"ship-percentiles-grid\" d=\"M110 100 H590 M110 200 H590\"/> <text class=\"ship-percentiles-s\" x=\"100\" y=\"104\" text-anchor=\"end\">10 s</text> <text class=\"ship-percentiles-s\" x=\"100\" y=\"204\" text-anchor=\"end\">5 s</text> <text class=\"ship-percentiles-s\" x=\"100\" y=\"304\" text-anchor=\"end\">0</text> <rect x=\"110\" y=\"298\" width=\"456\" height=\"2\" fill=\"url(#ship-percentiles-pat)\"/> <rect class=\"ship-percentiles-bar\" x=\"566.0\" y=\"100\" width=\"3.6\" height=\"200\"/><rect class=\"ship-percentiles-bar\" x=\"570.8\" y=\"100\" width=\"3.6\" height=\"200\"/><rect class=\"ship-percentiles-bar\" x=\"575.6\" y=\"100\" width=\"3.6\" height=\"200\"/><rect class=\"ship-percentiles-bar\" x=\"580.4\" y=\"100\" width=\"3.6\" height=\"200\"/><rect class=\"ship-percentiles-bar\" x=\"585.2\" y=\"100\" width=\"3.6\" height=\"200\"/> <path class=\"ship-percentiles-base\" d=\"M110 300 H590\"/> <path class=\"ship-percentiles-mean\" d=\"M110 288.1 H590\"/> <text class=\"ship-percentiles-w\" x=\"114\" y=\"278\">mean ≈ 600 ms</text> <path class=\"ship-percentiles-mk\" d=\"M347 294 V142\"/> <text class=\"ship-percentiles-t\" x=\"347\" y=\"134\" text-anchor=\"middle\">p50 = 100 ms</text> <path class=\"ship-percentiles-mk\" d=\"M582.2 96 V88\"/> <text class=\"ship-percentiles-t\" x=\"600\" y=\"80\" text-anchor=\"end\">p99 = 10 s</text> <text class=\"ship-percentiles-s\" x=\"556\" y=\"124\" text-anchor=\"end\">5 at 10 s</text> <text class=\"ship-percentiles-s\" x=\"110\" y=\"322\">95 requests at 100 ms</text> <text class=\"ship-percentiles-s\" x=\"350\" y=\"348\" text-anchor=\"middle\">100 requests, sorted from fastest to slowest</text> <g class=\"ship-percentiles-cx\"><path class=\"ship-percentiles-cur\" d=\"M111.8 92 V300\"/><circle class=\"ship-percentiles-dot\" cx=\"111.8\" cy=\"298\" r=\"5\"/></g> </svg>"
        },
        {
          "type": "h",
          "text": "SLIs, SLOs and error budgets"
        },
        {
          "type": "p",
          "text": "A **service level indicator (SLI)** is a measurement of user-visible behaviour, such as the proportion of requests that succeed in under 300 ms. A **service level objective (SLO)** is a target for that SLI over a window, for example 99.9% over 30 days. The **error budget** is the allowed failure: 0.1% of requests, which is about 43 minutes of full outage per 30 days. While budget remains, the team can ship and take risks. When it is spent, reliability work takes priority over features. This turns the vague argument about 'how reliable is reliable enough' into a data-driven agreement, and 100% is the wrong target: it is infinitely expensive and users cannot perceive the difference beyond a point."
        },
        {
          "type": "h",
          "text": "Alerting on symptoms, not causes"
        },
        {
          "type": "p",
          "text": "An alert should mean a human must act now. Alert on **symptoms** that users feel (error rate above threshold, latency SLO burning too fast), not on every possible **cause** (CPU at 80%, one pod restarted). Cause-based alerts are noisy, and miss novel failures. Use causes as dashboards for diagnosis. Burn-rate alerts, which fire when the error budget is being consumed much faster than planned, balance sensitivity with noise. Every alert should link to a runbook, and alerts that are routinely ignored should be fixed or deleted, because alert fatigue makes people miss the real one."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "The practical diagnosis flow: an alert on a symptom fires, a metrics dashboard shows which endpoint and when, a trace shows which dependency is slow, and logs for that trace ID show the exact error."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Ask the agent to add telemetry as part of the feature: structured logs with a trace ID, a counter for failures and a latency histogram on the new code path. Agents often log too little where failure is likely, or too much sensitive data (full request bodies, tokens). Check that errors are not swallowed after logging, and that logs contain no secrets. When an agent is debugging an incident, give it real logs and trace data rather than letting it guess from the code."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Mean latency is 150 ms, yet some users complain the endpoint is very slow",
              "use": "Percentiles from histograms",
              "why": "Track p50, p95 and p99; averages hide the slow tail. Record latency histograms, since percentiles cannot be averaged across instances after the fact."
            },
            {
              "signal": "Debugging means grepping prose log lines like `User 42 failed to pay` across many servers",
              "use": "Structured logging",
              "why": "Emit key-value records (`event=payment_failed user_id=42`) with level and request ID so logs can be filtered and counted. Never log secrets or personal data; volume costs money."
            },
            {
              "signal": "A failing request passes through gateway, order and payment services and you cannot follow it",
              "use": "Distributed tracing",
              "why": "Propagate trace context (W3C `traceparent`, OpenTelemetry) so spans from every service join into one trace showing where time went. Sample traces to control cost; keep errors and slow ones."
            },
            {
              "signal": "A request-driven service has no standard dashboard and every team graphs different things",
              "use": "RED metrics",
              "why": "Rate, Errors, Duration per endpoint describe what callers experience and suit alerts. They show that something is wrong, not which resource is the cause."
            },
            {
              "signal": "You suspect a database, disk, queue or thread pool is the bottleneck",
              "use": "USE method",
              "why": "For each resource check Utilization, Saturation (queueing) and Errors. Systematic and quick for finding the constrained resource; it complements RED, which views the service from outside."
            },
            {
              "signal": "An alert on CPU above 80% pages someone at night and usually needs no action",
              "use": "Alert on symptoms (SLO-based)",
              "why": "Page on what users feel, like error rate or latency SLO burning, and keep cause metrics on dashboards for diagnosis. Alerts nobody acts on train people to ignore pages; delete them."
            },
            {
              "signal": "Product and engineering argue whether to ship features or spend the sprint on reliability",
              "use": "SLO with error budget",
              "why": "Agree an SLI and target (99.9% over 30 days is about 43 minutes); while budget remains, ship; when it is spent, prioritize reliability. Needs agreed consequences or it is just a chart."
            },
            {
              "signal": "A threshold alert fires on brief spikes and still misses slow, sustained degradation",
              "use": "Multi-window burn-rate alerts",
              "why": "Alert when the error budget burns fast over both a short and a long window. Catches real incidents quickly and ignores blips; more complex to set up than a static threshold."
            },
            {
              "signal": "Metrics cost exploded after someone added `user_id` as a label",
              "use": "Keep metric labels low-cardinality",
              "why": "Every label combination is a separate time series; use bounded labels like endpoint and status. Put per-user and per-request IDs in logs and traces instead."
            },
            {
              "signal": "Log volume and cost are dominated by debug-level lines from healthy requests",
              "use": "Log levels and sampling",
              "why": "Log successes at info or sample them, keep all warnings and errors, and enable debug dynamically when investigating. Sampling can drop the one request you later need, so keep errors unsampled."
            },
            {
              "signal": "A security review finds tokens and email addresses in production logs",
              "use": "Redact at the logger",
              "why": "Scrub known sensitive fields in the logging pipeline or log only allow-listed fields, and test it. Fixing every call site by hand misses new ones; logs often have broader access than the database."
            }
          ]
        }
      ],
      "keyPoints": [
        "Logs give detailed events, metrics give cheap aggregates for trends and alerts, and traces show a request's path across services.",
        "Use structured logs with correlation IDs, and percentiles rather than averages for latency.",
        "SLIs measure user experience, SLOs set targets, and the error budget quantifies how much unreliability is acceptable.",
        "Alert on user-visible symptoms; use cause-level signals for diagnosis, and delete alerts nobody acts on."
      ],
      "quiz": [
        {
          "q": "Mean latency of an endpoint is 150 ms, yet some users complain it is very slow. What is the most likely explanation and next step?",
          "options": [
            "The complaints are probably mistaken, since the mean is within target",
            "A slow tail is hidden by the mean; check p95/p99 and trace slow requests",
            "Those users are on slow mobile networks, so nothing can be done on the server side",
            "The average-latency alert threshold is too low and should be raised"
          ],
          "answer": 1,
          "explain": "Averages mask a minority of very slow requests. Percentiles expose the tail, and traces show where those requests spend time."
        },
        {
          "q": "Your service has a 99.9% availability SLO over 30 days. Roughly how much downtime does the error budget allow, and how should a nearly exhausted budget affect decisions?",
          "options": [
            "About 43 minutes; slow risky releases and prioritise reliability work",
            "About 7 hours; ship faster, because there is still plenty of room in the budget",
            "Zero minutes; any failure is a breach",
            "About 43 minutes; ignore it until the window resets"
          ],
          "answer": 0,
          "explain": "0.1% of 30 days is roughly 43 minutes. A depleted budget signals that reliability should take priority over new features."
        },
        {
          "q": "Which alert is best aligned with the principle of alerting on symptoms?",
          "options": [
            "CPU on any application server stays above 80% for one minute",
            "Any single container restarts unexpectedly",
            "Failed checkouts exceed what the SLO can tolerate",
            "Disk usage on a log server passes 60%"
          ],
          "answer": 2,
          "explain": "Failed checkouts are what users experience. CPU, restarts and disk are potential causes that often cause no user impact and should live on dashboards."
        },
        {
          "q": "You want to follow one failing request as it passes through the API gateway, the order service and the payment service. Which signal is designed for this?",
          "options": [
            "A CPU utilisation metric exported by each service",
            "A counter of total requests received per service",
            "A free-text log line written by each service as it handles the request",
            "A distributed trace sharing one trace ID across spans"
          ],
          "answer": 3,
          "explain": "Traces connect the timed steps of one request across services. Aggregated metrics and unstructured logs cannot reliably be stitched into one request's path."
        },
        {
          "q": "A developer adds `user_id` as a label on a request-count metric for a service with millions of users. What is the main problem?",
          "options": [
            "Metric systems do not support labels, so the metric will be rejected",
            "Labels add sampling error, so the counts become less accurate",
            "Each user becomes its own time series, exploding storage and query cost",
            "Storing user IDs anywhere in telemetry is prohibited outright by privacy law"
          ],
          "answer": 2,
          "explain": "Each distinct label value creates a separate series. Metrics are for aggregates, while high-cardinality detail suits logs and traces."
        },
        {
          "q": "Twelve services each have a dashboard built by a different engineer, so during an incident on-call cannot compare them or tell which request-serving service is hurting. Which approach fits best?",
          "options": [
            "Per-resource utilisation, saturation and error graphs for every host and disk in the fleet",
            "A standard dashboard of request rate, error rate and duration per service",
            "Alert whenever CPU on any host passes 80 percent",
            "Convert all logs to JSON and search them by field"
          ],
          "answer": 1,
          "explain": "RED gives every request-driven service the same three signals. The USE method targets resources like disks and queues, which helps find a bottleneck but not compare services."
        }
      ]
    },
    {
      "id": "releases-versioning",
      "title": "Releases & Versioning",
      "minutes": 9,
      "summary": "Version changes meaningfully, communicate them, and plan for app stores and deprecation.",
      "lesson": [
        {
          "type": "p",
          "text": "Your library has 5,000 downstream users. You rename a function in a 'minor' update and builds across the internet break. Or your mobile app has a crash, you push a fix, and discover the store review takes two days and half your users never update. Releases are where your work meets other people's expectations, and versioning is the contract that sets those expectations."
        },
        {
          "type": "h",
          "text": "Semantic versioning"
        },
        {
          "type": "p",
          "text": "**Semantic Versioning (SemVer)** uses MAJOR.MINOR.PATCH. Increment MAJOR for incompatible API changes, MINOR for backwards-compatible new functionality, and PATCH for backwards-compatible bug fixes. A consumer can then read a version bump and judge the risk: `2.3.1` to `2.3.2` should be safe to take, while `2.x` to `3.0.0` needs reading the notes. Versions below `1.0.0` signal that anything may change. Pre-release tags like `1.4.0-rc.1` mark candidates not yet final."
        },
        {
          "type": "list",
          "items": [
            "SemVer is a promise about a public API. You must define what that API is (functions, endpoints, config, file formats).",
            "Removing a field, tightening validation, or changing a default can be breaking even if no code signature changes.",
            "Applications (not libraries) often use date-based or build-number versions, because they have no API consumers to warn.",
            "Consumers should pin versions with lockfiles and upgrade deliberately; maintainers should not assume that everyone follows the rules."
          ]
        },
        {
          "type": "h",
          "text": "Changelogs"
        },
        {
          "type": "p",
          "text": "A **changelog** is a human-written record of notable changes per version, written for users, not a dump of commit messages. Group entries as Added, Changed, Deprecated, Removed, Fixed and Security, and call out breaking changes and migration steps prominently. Conventional commit messages (`feat:`, `fix:`, `feat!:`) let tooling derive the version bump and draft the changelog, but a human should still edit the result for clarity."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "## 3.0.0 - 2026-10-28\n### Breaking\n- `client.fetch()` now returns a Result object instead of throwing.\n  Migrate: replace try/catch with `if (!res.ok)`. See guide.\n### Added\n- `client.fetchAll()` with automatic pagination.\n### Deprecated\n- `client.legacyQuery()`; will be removed in 4.0.0."
        },
        {
          "type": "h",
          "text": "Release cadence and trains"
        },
        {
          "type": "p",
          "text": "Teams release either continuously (every merge deploys) or on a schedule. A **release train** departs on a fixed schedule (say every two weeks); features that are ready board it, and those that are not wait for the next one without delaying the train. This gives predictability and cheap coordination for products where every release has overhead, such as installed software and mobile apps. Pair it with feature flags so unfinished work can merge safely but stay dark."
        },
        {
          "type": "figure",
          "id": "ship-release-train",
          "caption": "Trains leave every two weeks whether or not a feature is ready; export misses week 2 by days and simply rides the week 4 train.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"Release trains depart every two weeks. Each feature boards the first train after it is ready; export is ready just after the week 2 train leaves, so it waits for week 4 and the train does not wait for it.\"> <style> .ship-release-train-t{font-size:14px;fill:var(--fig-ink)} .ship-release-train-s{font-size:13px;fill:var(--fig-muted)} .ship-release-train-train{stroke:var(--fig-accent);stroke-width:2;stroke-dasharray:6 5} .ship-release-train-work{fill:var(--fig-accent2);fill-opacity:.18;stroke:var(--fig-accent2);stroke-width:1.5} .ship-release-train-wait{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:3 4} .ship-release-train-ax{stroke:var(--fig-muted);stroke-width:1.5} .ship-release-train-ph{stroke:var(--fig-ink);stroke-opacity:.5;stroke-width:1.5;animation:ship-release-train-m 7s linear infinite} @keyframes ship-release-train-m{0%{transform:translateX(0)}90%,100%{transform:translateX(480px)}} .ship-release-train-d0{fill:var(--fig-accent2);animation:ship-release-train-k0 7s linear infinite} @keyframes ship-release-train-k0{0%{transform:translateX(0);opacity:1}2%,24%{transform:translateX(-32px);opacity:0}24.5%{transform:translateX(-32px);opacity:1}30%,100%{transform:translateX(0);opacity:1}} .ship-release-train-d1{fill:var(--fig-accent2);animation:ship-release-train-k1 7s linear infinite} @keyframes ship-release-train-k1{0%{transform:translateX(0);opacity:1}2%,33%{transform:translateX(-144px);opacity:0}33.5%{transform:translateX(-144px);opacity:1}60%,100%{transform:translateX(0);opacity:1}} .ship-release-train-d2{fill:var(--fig-accent2);animation:ship-release-train-k2 7s linear infinite} @keyframes ship-release-train-k2{0%{transform:translateX(0);opacity:1}2%,52.5%{transform:translateX(-40px);opacity:0}53%{transform:translateX(-40px);opacity:1}60%,100%{transform:translateX(0);opacity:1}} .ship-release-train-d3{fill:var(--fig-accent2);animation:ship-release-train-k3 7s linear infinite} @keyframes ship-release-train-k3{0%{transform:translateX(0);opacity:1}2%,81%{transform:translateX(-48px);opacity:0}81.5%{transform:translateX(-48px);opacity:1}90%,100%{transform:translateX(0);opacity:1}} </style> <path class=\"ship-release-train-train\" d=\"M240 58 V222\"/> <text class=\"ship-release-train-t\" x=\"240\" y=\"46\" text-anchor=\"middle\">train wk 2</text> <path class=\"ship-release-train-train\" d=\"M400 58 V222\"/> <text class=\"ship-release-train-t\" x=\"400\" y=\"46\" text-anchor=\"middle\">train wk 4</text> <path class=\"ship-release-train-train\" d=\"M560 58 V222\"/> <text class=\"ship-release-train-t\" x=\"560\" y=\"46\" text-anchor=\"middle\">train wk 6</text> <text class=\"ship-release-train-t\" x=\"68\" y=\"85\" text-anchor=\"end\">search</text> <rect class=\"ship-release-train-work\" x=\"96\" y=\"70\" width=\"112\" height=\"20\" rx=\"8\"/> <path class=\"ship-release-train-wait\" d=\"M208 80 H232\"/> <circle class=\"ship-release-train-d0\" cx=\"240\" cy=\"80\" r=\"7\"/> <text class=\"ship-release-train-t\" x=\"68\" y=\"125\" text-anchor=\"end\">export</text> <rect class=\"ship-release-train-work\" x=\"112\" y=\"110\" width=\"144\" height=\"20\" rx=\"8\"/> <path class=\"ship-release-train-wait\" d=\"M256 120 H392\"/> <circle class=\"ship-release-train-d1\" cx=\"400\" cy=\"120\" r=\"7\"/> <text class=\"ship-release-train-t\" x=\"68\" y=\"165\" text-anchor=\"end\">sync</text> <rect class=\"ship-release-train-work\" x=\"176\" y=\"150\" width=\"184\" height=\"20\" rx=\"8\"/> <path class=\"ship-release-train-wait\" d=\"M360 160 H392\"/> <circle class=\"ship-release-train-d2\" cx=\"400\" cy=\"160\" r=\"7\"/> <text class=\"ship-release-train-t\" x=\"68\" y=\"205\" text-anchor=\"end\">billing</text> <rect class=\"ship-release-train-work\" x=\"288\" y=\"190\" width=\"224\" height=\"20\" rx=\"8\"/> <path class=\"ship-release-train-wait\" d=\"M512 200 H552\"/> <circle class=\"ship-release-train-d3\" cx=\"560\" cy=\"200\" r=\"7\"/> <text class=\"ship-release-train-s\" x=\"80\" y=\"254\" text-anchor=\"middle\">0</text> <text class=\"ship-release-train-s\" x=\"160\" y=\"254\" text-anchor=\"middle\">1</text> <text class=\"ship-release-train-s\" x=\"240\" y=\"254\" text-anchor=\"middle\">2</text> <text class=\"ship-release-train-s\" x=\"320\" y=\"254\" text-anchor=\"middle\">3</text> <text class=\"ship-release-train-s\" x=\"400\" y=\"254\" text-anchor=\"middle\">4</text> <text class=\"ship-release-train-s\" x=\"480\" y=\"254\" text-anchor=\"middle\">5</text> <text class=\"ship-release-train-s\" x=\"560\" y=\"254\" text-anchor=\"middle\">6</text> <path class=\"ship-release-train-ax\" d=\"M80 234 H560\"/> <text class=\"ship-release-train-s\" x=\"580\" y=\"254\">weeks</text> <text class=\"ship-release-train-s\" x=\"328\" y=\"108\" text-anchor=\"middle\">waits for wk 4</text> <path class=\"ship-release-train-ph\" d=\"M80 58 V234\"/> </svg>"
        },
        {
          "type": "h",
          "text": "Mobile and app-store specifics"
        },
        {
          "type": "p",
          "text": "Web backends can be rolled back in seconds, but a mobile release cannot. Binaries pass store review (hours to days), users update on their own schedule, and old versions stay in the wild for months. Consequences:"
        },
        {
          "type": "list",
          "items": [
            "Your backend must support several old client versions at once; version your API and avoid breaking changes.",
            "Use staged rollout (release to a percentage, watch crash rates, then widen) and halt it if the numbers look bad.",
            "Put risky behaviour behind remotely controlled flags or config so you can disable it without a new binary.",
            "Keep a force-upgrade mechanism for the rare case of a security or compatibility emergency, and use it sparingly.",
            "Track crash-free sessions per version, since a regression affects users until they update."
          ]
        },
        {
          "type": "h",
          "text": "Deprecation"
        },
        {
          "type": "p",
          "text": "Removing something abruptly breaks users. A good deprecation has stages: announce it, offer a replacement and a migration path, emit warnings at runtime or in docs, set a published removal date or version, measure remaining usage, then remove. Removal is a MAJOR change under SemVer. Measuring usage matters: you may find a large customer still depends on the thing you plan to delete."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents can draft changelogs and propose version bumps, but they cannot know which behaviours your consumers rely on. Ask the agent to list every public-facing change in the diff and classify it as breaking or not, then verify the classification yourself. Beware of agents that make 'harmless' changes to defaults, error types or response shapes in a patch release, or that regenerate a changelog from commit titles with no migration advice."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A library's `parse()` returned an empty list for bad input and now throws, with no signature change",
              "use": "MAJOR version bump",
              "why": "Changed behavior that callers rely on is breaking under SemVer, even without a signature change. Calling it a minor release breaks every consumer that auto-updates within a range."
            },
            {
              "signal": "A change adds a new optional function or field and fixes nothing that callers rely on",
              "use": "MINOR version bump",
              "why": "Backward-compatible additions are minor and fixes are patch, so consumers can safely accept them within a `^` range. SemVer only means something once you define the public API."
            },
            {
              "signal": "The changelog is a pasted `git log` full of `wip` and internal ticket numbers",
              "use": "User-facing changelog sections",
              "why": "Group entries under Added, Changed, Deprecated, Removed, Fixed and Security, with breaking changes and migration steps first. Written for users, not developers; generate drafts, then edit."
            },
            {
              "signal": "Each release date slips because one unfinished feature holds everything else hostage",
              "use": "Release train",
              "why": "Ship on a fixed schedule with whatever is ready; unfinished work stays behind flags and catches the next train. Predictable for everyone, but a feature may wait one full cycle."
            },
            {
              "signal": "A crash ships in a mobile app and the fix will take days to clear store review",
              "use": "Remote kill switch",
              "why": "Wrap risky features in remotely controlled flags so you can disable them in minutes without a new binary. Needs a safe default when config cannot be fetched, and it only covers flagged code."
            },
            {
              "signal": "A new mobile build goes to every user at once and a crash would hit millions before you notice",
              "use": "Staged rollout with crash-rate gate",
              "why": "Release to a small percentage, watch crash-free rate and key metrics, then widen or halt. You cannot recall installed builds, so halting early is the only damage control."
            },
            {
              "signal": "Old app versions in the wild keep calling the API months after a new release",
              "use": "Support old clients + minimum version",
              "why": "Keep the backend compatible with several client versions and enforce a minimum supported version for forced updates. Forcing updates annoys users; reserve it for security or broken versions."
            },
            {
              "signal": "An endpoint some customers still call must be removed",
              "use": "Staged deprecation",
              "why": "Announce, provide a replacement and migration guide, emit warnings (such as a `Sunset` header), track usage and remove at a published date. Measure who still calls it rather than guessing."
            },
            {
              "signal": "A breaking API change is unavoidable but existing integrations must keep working",
              "use": "Versioned API (`/v2`)",
              "why": "Run old and new versions side by side and migrate clients over time. Every live version is code you maintain and test, so keep few versions and give each a sunset date."
            },
            {
              "signal": "Production 2.3 needs an urgent fix while `main` already contains unreleased 2.4 features",
              "use": "Release branch hotfix",
              "why": "Fix on `main`, then cherry-pick to the `release/2.3` branch and ship 2.3.1 from it. Avoids shipping half-done work; each maintained branch adds merge and testing cost."
            },
            {
              "signal": "Version numbers and tags are bumped by hand and sometimes skipped or duplicated",
              "use": "Automated versioning from commits",
              "why": "Derive the next version from commit conventions or PR labels and tag in CI, generating changelog drafts too. Only as accurate as the commit discipline behind it."
            }
          ]
        }
      ],
      "keyPoints": [
        "SemVer's MAJOR.MINOR.PATCH is a promise about a defined public API: breaking, additive, fix.",
        "Write changelogs for users, with breaking changes and migration steps called out.",
        "Release trains give predictable schedules; flags keep unfinished work from boarding.",
        "Mobile releases cannot be rolled back quickly, so use staged rollouts, remote kill switches and server compatibility with old clients; deprecate in stages with a measured removal."
      ],
      "quiz": [
        {
          "q": "A library's `parse()` function used to return an empty list for invalid input and now throws an exception. Under SemVer, which kind of release is this?",
          "options": [
            "Major, because existing callers can break",
            "Minor, because no new function was added",
            "Patch, because it only fixes how invalid input is handled",
            "None, since the function signature is unchanged"
          ],
          "answer": 0,
          "explain": "Behaviour that callers depend on is part of the public API. Changing it incompatibly requires a major version even if signatures do not change."
        },
        {
          "q": "A critical crash ships in your mobile app. The fix is ready. What reality should shape your plan?",
          "options": [
            "The store can roll every user back to the previous build instantly",
            "Store review is skipped entirely for fixes marked as urgent",
            "Only new installs matter, since existing users all update within a few hours",
            "Old installs stay broken until updated, so add flag or server mitigations"
          ],
          "answer": 3,
          "explain": "Binaries are in users' hands. Mitigation often combines a new release with server-side or flag-based workarounds for people who have not updated."
        },
        {
          "q": "You will remove an endpoint that some customers still call. Which plan best follows good deprecation practice?",
          "options": [
            "Delete it in the next patch release and mention the removal in the changelog",
            "Keep it running forever, since any removal will break someone",
            "Announce a replacement and date, warn, track usage, remove in a major",
            "Email the affected customers on the day the endpoint is removed"
          ],
          "answer": 2,
          "explain": "Staged notice, a migration path and usage measurement let consumers adapt. Removing in a patch violates the SemVer contract."
        },
        {
          "q": "What is the key benefit of a fixed-schedule release train?",
          "options": [
            "Every planned feature is guaranteed to ship in the next release",
            "Urgent hotfixes are forbidden between scheduled departures",
            "Releases happen less often, which by definition reduces the risk of each one",
            "Timing is predictable, and late work waits instead of delaying it"
          ],
          "answer": 3,
          "explain": "Predictability and not holding the release hostage to one late feature are the point. Hotfixes can still ship outside the train."
        },
        {
          "q": "What makes a good changelog entry different from a raw commit list?",
          "options": [
            "It is more complete, covering every commit in the release",
            "It explains user impact, flags breaking changes and gives migrations",
            "It credits every author who contributed to the release",
            "It lists every file and module that changed, so readers can audit the release"
          ],
          "answer": 1,
          "explain": "Changelogs serve consumers deciding whether and how to upgrade. Commit messages record developer-level steps that rarely answer that."
        },
        {
          "q": "Release tags are bumped by hand. Last week `2.3.1` was tagged twice and `2.4.0` was skipped, and nobody can say which commits each one holds. What should you reach for?",
          "options": [
            "Move to a fixed-schedule release train with a code freeze date before each release",
            "Publish a hotfix from a dedicated release branch each time",
            "Group the changelog into user-facing sections by hand",
            "Derive the next version and tag from commit types in the release pipeline"
          ],
          "answer": 3,
          "explain": "Computing the version and tag from commits in CI removes the manual step that went wrong. A release train fixes when releases ship, not how version numbers are assigned."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "You notice that a PR 'fixing' a failing CI job changes a test assertion from `expect(total).toBe(100)` to `expect(total).toBeGreaterThan(0)` alongside a pricing change. What do you do?",
      "options": [
        "Approve it, since the pipeline is green again",
        "Ask why it was weakened; the pricing change may be the real bug",
        "Ask the author to add retries so the test stops failing",
        "Merge it now and open a follow-up ticket to tighten the assertion later"
      ],
      "answer": 1,
      "explain": "A weakened assertion that makes a red build green is a red flag. The test may have caught a genuine regression in the pricing change."
    },
    {
      "q": "Your staged rollout has reached 5% of users. Crash-free sessions and p50 latency match the previous version, but the server-side error rate for the new version is three times higher. What is the right action?",
      "options": [
        "Halt the rollout and investigate the user-visible regression",
        "Keep widening, since errors at 5% exposure are not meaningful",
        "Hold at 5% until the median latency also starts to move",
        "Exclude the 5% cohort from dashboards to reduce the noise"
      ],
      "answer": 0,
      "explain": "A tripled error rate is a clear user-visible symptom. Catching exactly this while exposure is small is the purpose of a staged rollout; widening would spread it, and latency is not the only signal that matters."
    },
    {
      "q": "Which of these deployments is hardest to reverse with a simple rollback?",
      "options": [
        "A new CSS colour palette for the website",
        "A feature behind a flag enabled for 10% of users",
        "A change to the wording of an internal log message",
        "A migration that converts and then drops a column"
      ],
      "answer": 3,
      "explain": "Data transformations and dropped columns cannot be undone by redeploying code. The others can be reverted by redeploying or flipping a flag."
    },
    {
      "q": "Your app depends on `lib@^2.1.0` and has a committed lockfile pinning 2.1.4. Upstream publishes 2.2.0, labeled a minor release, which actually breaks your usage. What happens on your next CI run using `npm ci`?",
      "options": [
        "CI installs 2.2.0 because it satisfies the caret range, so the build breaks",
        "CI installs 2.1.4 from the lockfile; 2.2.0 arrives only when you update deliberately",
        "npm ci stops with an out-of-sync error until the lockfile is regenerated against 2.2.0",
        "npm detects that 2.2.0 violates SemVer and skips it automatically"
      ],
      "answer": 1,
      "explain": "`npm ci` installs exactly what the lockfile records, regardless of newer versions in range. SemVer labels are a maintainer's promise, not a guarantee, which is why consumers pin and upgrade deliberately."
    },
    {
      "q": "A service has a 99.9% SLO and has achieved 99.99% for the past several windows. Product asks for a risky but valuable migration. How does the error budget inform the decision?",
      "options": [
        "It is forbidden, because the SLO must be exceeded at all times",
        "The budget governs incident response only and has no bearing on feature decisions",
        "Ample budget remains, so the risk is acceptable if staged and monitored",
        "The SLO must first be raised to 100% to protect users"
      ],
      "answer": 2,
      "explain": "Unused budget is room for calculated risk. Staging and monitoring keep the risk within what the SLO allows, and 100% is never a sensible target."
    },
    {
      "q": "You are reviewing a PR from an AI agent that adds a new endpoint. Tests pass. Which question is the most valuable to ask first?",
      "options": [
        "Did the agent follow my preferred variable naming conventions?",
        "How many lines did the agent write, and is that too many?",
        "Does it check authorization and validate input, and do tests cover that?",
        "Which model generated the code, and was it the newest one available at the time?"
      ],
      "answer": 2,
      "explain": "Security checks and input handling are classic gaps, and passing tests only prove what was tested. Style questions are better automated."
    },
    {
      "q": "You roll out a new version across ten instances one at a time. The new code writes to a new `NOT NULL` column that the migration added just before the rollout. During the rollout, instances still on the old version start failing inserts. What was the mistake?",
      "options": [
        "Ten instances is too few for a rolling deploy to be considered safe",
        "A rolling strategy was the wrong choice; a canary would have avoided it",
        "The migration was incompatible with the old code still running",
        "The health checks should have run more frequently during the rollout"
      ],
      "answer": 2,
      "explain": "During a rolling deploy both versions run at once, so the schema must work for both. Add the column as nullable first (expand), and tighten it only after the old code is gone."
    },
    {
      "q": "A page fires whenever the 5-minute error rate exceeds 0.1%, the SLO threshold. It pages several times a week for brief blips that recover on their own, while the monthly error budget stays mostly unspent. What is the best change?",
      "options": [
        "Delete the alert, since the budget is healthy anyway",
        "Lower the threshold so problems are caught even earlier",
        "Page on error-budget burn rate instead of the raw error rate",
        "Keep it, and ask on-call to acknowledge blips more quickly"
      ],
      "answer": 2,
      "explain": "A burn-rate alert fires when the budget is being consumed much faster than planned, so short harmless blips stop paging while sustained problems still do. Deleting the alert loses protection entirely."
    },
    {
      "q": "Your Dockerfile starts with `FROM node:latest` and production deploys tag the image `latest`. Last week a deploy changed behaviour with no code change in your repo. What is the root cause and the fix?",
      "options": [
        "Floating tags: pin the base version and tag images by commit SHA",
        "Containers are mutable by design, so prefer patching running instances",
        "The registry was out of date, so clear its cache before each deploy",
        "Node.js releases break on every update, so avoid containers entirely"
      ],
      "answer": 0,
      "explain": "Floating tags mean the same Dockerfile can build different content over time, and `latest` tells you nothing about what is running. Pinned versions and SHA tags make builds reproducible and rollbacks precise."
    },
    {
      "q": "You ship via blue/green. Right after you flip traffic to green, the error rate climbs. The migration that ran was additive and backward compatible. What is the fastest safe mitigation?",
      "options": [
        "Redeploy blue from scratch using the previous commit's build",
        "Patch green in place and keep serving until it is fixed",
        "Pause all traffic until the cause has been fully understood",
        "Flip the router back to blue, still on the old version"
      ],
      "answer": 3,
      "explain": "Blue is still up and compatible with the database, so a routing change restores service in seconds. Investigate afterwards, from a stable position."
    },
    {
      "q": "A library maintainer adds an optional parameter with a default that preserves old behaviour and a new helper function. Which version bump fits under SemVer from 4.2.7?",
      "options": [
        "4.3.0",
        "5.0.0",
        "4.2.8",
        "4.3.7"
      ],
      "answer": 0,
      "explain": "Backwards-compatible new functionality is a minor bump, which resets the patch number. A major bump is only for breaking changes."
    },
    {
      "q": "A bug appears in an iOS release that is already at 100% rollout, and your backend team wants to change the API response shape to fix it. What is the key risk?",
      "options": [
        "iOS apps may not call third-party APIs once they pass review",
        "Clients ignore response shapes, so only the status code matters",
        "Backend APIs are frozen once the matching app version launches",
        "Older app versions still expect the old shape and may break on it"
      ],
      "answer": 3,
      "explain": "Old clients persist for months. Backends must remain compatible with them, usually by adding fields or versioning the API."
    },
    {
      "q": "A merged change deployed at 2pm and error rates doubled at 2:10pm. You have a flag guarding the new code path. What is the fastest safe first step?",
      "options": [
        "Turn the flag off, confirm errors recover, then investigate",
        "Start rewriting the feature so that the next deploy fixes the root cause",
        "Wait an hour to collect more data before acting",
        "Deploy another change on top to see whether it helps"
      ],
      "answer": 0,
      "explain": "A flag is a kill switch that restores service in seconds. Investigating after mitigation limits user impact."
    },
    {
      "q": "The same container image must run in staging and in production, but the two use different database hosts and credentials. Where should those differences live?",
      "options": [
        "In separate long-lived branches of the code, one per environment",
        "In injected runtime config, with secrets from a secret store",
        "In two separate Dockerfiles that bake the values into each image",
        "In constants at the top of the source file, switched by hostname"
      ],
      "answer": 1,
      "explain": "One artifact plus injected configuration keeps what you tested identical to what you deploy. Baking values into images or branches breaks that, and credentials never belong in code."
    },
    {
      "kind": "order",
      "q": "Put the stages of a CI pipeline in the order that gives the fastest feedback, as in the lesson's example.",
      "steps": [
        "Check out the commit",
        "Install exact dependencies with `npm ci`",
        "Run lint and typecheck",
        "Run unit tests",
        "Run integration tests, only if the fast checks passed"
      ],
      "explain": "Nothing runs without the code, and nothing builds without dependencies from the lockfile. After that, the cheapest checks go first: lint and typecheck fail in seconds, unit tests next, and the slow integration job runs only once the fast stage is green (`needs: fast-checks`)."
    },
    {
      "kind": "order",
      "q": "Order the deploys of a zero-downtime rename of `users.name` to `users.full_name` (expand/contract).",
      "steps": [
        "Add `full_name` as a nullable column; old code is unaffected",
        "App writes both columns and still reads `name`; backfill old rows in batches",
        "App reads `full_name` while still writing `name`",
        "Drop `name` once nothing reads or writes it"
      ],
      "explain": "Expand first, contract last. Each step stays compatible with the version running before it, so any deploy can be rolled back. Reading `full_name` before the backfill would return nulls, and dropping `name` before the last reader is gone crashes old instances and makes rollback impossible."
    },
    {
      "kind": "order",
      "q": "Order the steps of a blue/green deployment, with blue serving live traffic at the start.",
      "steps": [
        "Deploy the new version to the idle green environment",
        "Test green under production-like conditions",
        "Switch the router so all traffic goes to green",
        "If errors rise, switch the router back to blue"
      ],
      "explain": "Green is deployed and tested while it takes no traffic, then the router flips all traffic at once. Blue stays intact, so rollback is another near-instant flip rather than a redeploy."
    },
    {
      "kind": "line",
      "q": "This Terraform defines the production orders database. Click the line with the bug.",
      "code": "resource \"aws_db_instance\" \"orders\" {\n  identifier          = \"orders-${var.env}\"\n  engine              = \"postgres\"\n  engine_version      = \"16.4\"\n  instance_class      = var.db_instance_class\n  allocated_storage   = 50\n  deletion_protection = true\n  username            = \"orders_app\"\n  password            = \"Tr0ub4dor&3\"\n}",
      "lang": "hcl",
      "answer": 8,
      "explain": "Line 9 hard-codes a secret in a file that lives in version control, so everyone with repo access, and every clone, has the production password. Use `password = var.db_password` injected from a secret store, and since it was committed, revoke and rotate it. A username is not a secret, so line 8 is fine."
    },
    {
      "kind": "line",
      "q": "This handler logs failed logins for later investigation. Click the line with the bug.",
      "code": "function onLoginFailed(req, ctx, reason) {\n  logger.warn({\n    event: 'login_failed',\n    reason,\n    user_id: req.body.userId,\n    password: req.body.password,\n    trace_id: ctx.traceId,\n    ip: req.ip,\n  });\n}",
      "lang": "js",
      "answer": 5,
      "explain": "Line 6 writes the password the user typed into the logs, where many people and tools can read it, and a failed attempt is often a typo of the real password. Never log secrets: delete the field. The rest is good structured logging, with an event name, a reason and a trace ID to correlate."
    },
    {
      "kind": "line",
      "q": "This migration runs in the first deploy of renaming `users.name` to `users.full_name`, while the old app version is still serving traffic. Click the line with the bug.",
      "code": "-- Deploy 1: rename users.name to users.full_name\nALTER TABLE users ADD COLUMN full_name text;\n\n-- Backfill in small batches to avoid long locks\nUPDATE users SET full_name = name\n  WHERE full_name IS NULL AND id BETWEEN 1 AND 10000;\n\nALTER TABLE users DROP COLUMN name;",
      "lang": "sql",
      "answer": 7,
      "explain": "Line 8 drops `name` in the same deploy that adds its replacement, while the running code still reads it: old instances fail at once and rolling back the code cannot bring the data back. The contract step belongs in a later deploy, after the app reads `full_name` and nothing uses `name`."
    },
    {
      "q": "A service logs these ten request latencies. What does this print?",
      "code": "const ms = [100, 100, 100, 100, 100, 100, 100, 100, 100, 5000];\nconst mean = ms.reduce((a, b) => a + b) / ms.length;\nconst sorted = [...ms].sort((a, b) => a - b);\nconst p50 = sorted[Math.floor(0.5 * sorted.length)];\nconsole.log(mean, p50);",
      "lang": "js",
      "options": [
        "100 100",
        "590 100",
        "590 590",
        "100 5000"
      ],
      "answer": 1,
      "explain": "The sum is 900 + 5000 = 5900, so the mean is 590 ms, a latency no request actually had. The median is `sorted[5]`, 100 ms. One slow request drags the mean six-fold and leaves p50 untouched, which is why you watch percentiles, including the tail (p99), instead of averages."
    },
    {
      "q": "This applies Semantic Versioning bumps to a release history. What does it print?",
      "code": "function bump(v, change) {\n  const [major, minor, patch] = v.split('.').map(Number);\n  if (change === 'breaking') return `${major + 1}.0.0`;\n  if (change === 'feature') return `${major}.${minor + 1}.0`;\n  return `${major}.${minor}.${patch + 1}`;\n}\nlet v = '2.3.1';\nfor (const c of ['fix', 'feature', 'fix', 'breaking', 'feature']) v = bump(v, c);\nconsole.log(v);",
      "lang": "js",
      "options": [
        "3.2.2",
        "3.4.0",
        "2.5.2",
        "3.1.0"
      ],
      "answer": 3,
      "explain": "2.3.1 → 2.3.2 (fix) → 2.4.0 (feature resets PATCH) → 2.4.1 (fix) → 3.0.0 (breaking resets MINOR and PATCH) → 3.1.0 (feature). A MAJOR bump always zeroes the lower numbers."
    }
  ]
});
