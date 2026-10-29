window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];
window.CURRICULUM_SECTIONS.push({
  "id": "cases",
  "track": "Game Development",
  "title": "Game Case Studies",
  "tagline": "Six classic games taken apart: the components, the algorithms and why the choices work.",
  "intro": "The earlier sections teach the parts: rendering, the loop, physics, AI, networking, Unity. This one puts them together. Each topic tears down one classic kind of game: a chess engine, a 2D platformer, a kart racer, a first-person shooter, an open-world RPG and a competitive multiplayer game. For each you see which subsystems it needs, the algorithms inside them, the decisions a team makes and why those decisions hold up, including what the alternatives would cost. The aim is to recognise the shape of a game before you write a line of it, and to judge whether a design, or code an agent proposes, fits that shape.",
  "topics": [
    {
      "id": "case-chess",
      "title": "Case study: Chess",
      "minutes": 20,
      "summary": "How a chess game with a computer opponent is built: a pure rules core, bitboards and perft, alpha-beta search with ordering, quiescence and a transposition table, evaluation, difficulty levels and server-authoritative online play.",
      "lesson": [
        {
          "type": "p",
          "text": "Your app has a board, a click-to-move UI and a 'Play vs computer' button. The first prototype picks a random legal move, and it holds up for ten minutes. Then one tester castles through an attacked square, another watches the bot hang its queen, and a third asks why the hard level needs 40 seconds to move at move 30. Chess is a good first teardown because it is small and exactly specified: a perfect-information game with 20 legal moves in the start position and about 35 in a typical middlegame. Every part of an engine exists to fight that branching factor, and the rules are strict enough that you can test most of it against published numbers."
        },
        {
          "type": "h",
          "text": "Components"
        },
        {
          "type": "list",
          "items": [
            "**Rules core.** Position, moves, legality, draw rules, FEN in and out. Pure data and functions, no UI types.",
            "**Move generator.** Attack tables and bitboard tricks produce pseudo-legal moves; a legality test drops the rest.",
            "**Search.** Negamax with alpha-beta, iterative deepening, move ordering, quiescence and a transposition table.",
            "**Evaluation.** Turns a quiet position into one number in centipawns, from the side to move's point of view.",
            "**Engine shell.** A UCI-style text protocol, clock handling, difficulty settings and a worker thread.",
            "**Front ends.** The Unity UI for local play and a game server for online play. Both talk to the core, never to search internals."
          ]
        },
        {
          "type": "p",
          "text": "Data flows one way. The UI turns a click into a move and asks the core to validate and apply it. The shell sends the move list and the clocks to the engine; search calls the move generator and the evaluation millions of times per second and returns one `bestmove`. The server runs the same core to validate whatever clients send."
        },
        {
          "type": "h",
          "text": "The rules core: a position is more than a board"
        },
        {
          "type": "p",
          "text": "A position is the piece placement plus the state that decides which moves exist. FEN writes all of it in one line: placement, side to move, castling rights (`KQkq`), the en passant target square, the halfmove clock and the fullmove number. The start position is `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`. Castling rights are lost when the king or that rook moves, or the rook is captured, so they are state you cannot recompute from the board. The en passant square lives for one ply, right after a double pawn push. The halfmove clock counts plies since the last capture or pawn move and drives the **50-move rule**: at 100 plies a player may claim a draw, and FIDE makes it automatic at 150. A **threefold repetition** needs the same position three times with the same side to move, rights and en passant possibilities. Keep a history of Zobrist hashes and look back only as far as the halfmove clock, because a capture or pawn move can never be undone."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "public sealed class Position            // plain C#, no UnityEngine types\n{\n    public ulong[] Pieces = new ulong[12];  // [color * 6 + type], one bit per square\n    public ulong Occupied;                  // cached union of all twelve\n    public bool WhiteToMove;\n    public byte Castling;                   // bit0 K, bit1 Q, bit2 k, bit3 q\n    public sbyte EpSquare = -1;             // -1 when no en passant capture is possible\n    public ushort Halfmove, Fullmove;\n    public ulong Hash;                      // Zobrist key, updated incrementally\n}\n\n// history[count - 1] is the current position's hash.\nstatic bool IsRepetition(ulong[] history, int count, int halfmove)\n{\n    // Same side to move means every second ply; stop at the last irreversible move.\n    for (int i = count - 3; i >= count - 1 - halfmove && i >= 0; i -= 2)\n        if (history[i] == history[count - 1]) return true;\n    return false;\n}"
        },
        {
          "type": "h",
          "text": "Board representation: three ways to hold 64 squares"
        },
        {
          "type": "p",
          "text": "An **8x8 array** (or a flat 64-entry array) is the obvious choice and is fine for a UI or a one-ply bot. Its weak spot is the edge: every ray walk needs bounds checks. A **0x88** board uses a 16-wide, 128-entry array, so a square is on the board exactly when `(sq & 0x88) == 0`, and the difference between two squares identifies their direction and distance in one table lookup. It makes edge tests free and was a staple of older engines. **Bitboards** keep one bit per square in a 64-bit integer: twelve masks (six piece types times two colours) plus cached occupancy. Set operations become single instructions. All white pawn pushes are `(pawns << 8) & ~occupied`, and 'is this square attacked' becomes an AND against a precomputed mask. Strong engines are bitboard-based because 64-bit CPUs make these operations as cheap as an array read while replacing whole loops."
        },
        {
          "type": "figure",
          "id": "chess-knight-mask",
          "caption": "A knight's attack set is the same 8 offsets on every square: precompute it once as a 64-bit mask, so move generation is one table read.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"A knight on e4 is bit 28 of a 64-bit board. Its eight attacked squares f6, d6, g5, c5, g3, c3, f2 and d2 are bits 45, 43, 38, 34, 22, 18, 13 and 11. Setting those bits gives the precomputed mask 0x0000284400442800, one table entry per square.\"><style>.chess-knight-mask-t{font-size:14px;fill:var(--fig-ink)}.chess-knight-mask-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.chess-knight-mask-s{font-size:12px;fill:var(--fig-muted)}.chess-knight-mask-c{text-anchor:middle}.chess-knight-mask-e{text-anchor:end}.chess-knight-mask-sd{fill:var(--fig-line);fill-opacity:.55}.chess-knight-mask-sl{fill:var(--fig-panel)}.chess-knight-mask-hot{fill:var(--fig-accent);fill-opacity:.3;stroke:var(--fig-accent);stroke-width:1.5;animation:chess-knight-mask-hot 6s linear infinite}.chess-knight-mask-kn{fill:var(--fig-ink)}.chess-knight-mask-kt{font-size:14px;font-weight:700;fill:var(--fig-bg)}.chess-knight-mask-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.chess-knight-mask-rh{fill:var(--fig-accent);fill-opacity:0;animation:chess-knight-mask-rh 6s linear infinite}.chess-knight-mask-fr{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.chess-knight-mask-d0{animation-delay:0.0s}.chess-knight-mask-d1{animation-delay:0.6s}.chess-knight-mask-d2{animation-delay:1.2s}.chess-knight-mask-d3{animation-delay:1.8s}.chess-knight-mask-d4{animation-delay:2.4s}.chess-knight-mask-d5{animation-delay:3.0s}.chess-knight-mask-d6{animation-delay:3.6s}.chess-knight-mask-d7{animation-delay:4.2s}@keyframes chess-knight-mask-hot{0%{fill-opacity:.3}2%,8%{fill-opacity:.85}10%,100%{fill-opacity:.3}}@keyframes chess-knight-mask-rh{0%{fill-opacity:0}2%,8%{fill-opacity:.3}10%,100%{fill-opacity:0}}</style><rect class=\"chess-knight-mask-sd\" x=\"64\" y=\"216\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"92\" y=\"216\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"120\" y=\"216\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"148\" y=\"216\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"176\" y=\"216\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"204\" y=\"216\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"232\" y=\"216\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"260\" y=\"216\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"64\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"92\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"120\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"148\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"176\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"204\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"232\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"260\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"64\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"92\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"120\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"148\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"176\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"204\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"232\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"260\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"64\" y=\"132\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"92\" y=\"132\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"120\" y=\"132\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"148\" y=\"132\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"176\" y=\"132\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"204\" y=\"132\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"232\" y=\"132\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"260\" y=\"132\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"64\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"92\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"120\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"148\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"176\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"204\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"232\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"260\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"64\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"92\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"120\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"148\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"176\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"204\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"232\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"260\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"64\" y=\"48\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"92\" y=\"48\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"120\" y=\"48\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"148\" y=\"48\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"176\" y=\"48\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"204\" y=\"48\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"232\" y=\"48\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"260\" y=\"48\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"64\" y=\"20\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"92\" y=\"20\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"120\" y=\"20\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"148\" y=\"20\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"176\" y=\"20\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"204\" y=\"20\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sl\" x=\"232\" y=\"20\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-sd\" x=\"260\" y=\"20\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-fr\" x=\"64\" y=\"20\" width=\"224\" height=\"224\"/><rect class=\"chess-knight-mask-hot chess-knight-mask-d0\" x=\"204\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-hot chess-knight-mask-d1\" x=\"148\" y=\"76\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-hot chess-knight-mask-d2\" x=\"232\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-hot chess-knight-mask-d3\" x=\"120\" y=\"104\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-hot chess-knight-mask-d4\" x=\"232\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-hot chess-knight-mask-d5\" x=\"120\" y=\"160\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-hot chess-knight-mask-d6\" x=\"204\" y=\"188\" width=\"28\" height=\"28\"/><rect class=\"chess-knight-mask-hot chess-knight-mask-d7\" x=\"148\" y=\"188\" width=\"28\" height=\"28\"/><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"218\" y=\"94\">45</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"162\" y=\"94\">43</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"246\" y=\"122\">38</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"134\" y=\"122\">34</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"246\" y=\"178\">22</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"134\" y=\"178\">18</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"218\" y=\"206\">13</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"162\" y=\"206\">11</text><circle class=\"chess-knight-mask-kn\" cx=\"190\" cy=\"146\" r=\"11\"/><text class=\"chess-knight-mask-kt chess-knight-mask-c\" x=\"190\" y=\"151\">N</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"78\" y=\"261\">a</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"106\" y=\"261\">b</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"134\" y=\"261\">c</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"162\" y=\"261\">d</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"190\" y=\"261\">e</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"218\" y=\"261\">f</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"246\" y=\"261\">g</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"274\" y=\"261\">h</text><text class=\"chess-knight-mask-s chess-knight-mask-e\" x=\"56\" y=\"235\">1</text><text class=\"chess-knight-mask-s chess-knight-mask-e\" x=\"56\" y=\"207\">2</text><text class=\"chess-knight-mask-s chess-knight-mask-e\" x=\"56\" y=\"179\">3</text><text class=\"chess-knight-mask-s chess-knight-mask-e\" x=\"56\" y=\"151\">4</text><text class=\"chess-knight-mask-s chess-knight-mask-e\" x=\"56\" y=\"123\">5</text><text class=\"chess-knight-mask-s chess-knight-mask-e\" x=\"56\" y=\"95\">6</text><text class=\"chess-knight-mask-s chess-knight-mask-e\" x=\"56\" y=\"67\">7</text><text class=\"chess-knight-mask-s chess-knight-mask-e\" x=\"56\" y=\"39\">8</text><rect class=\"chess-knight-mask-pn\" x=\"328\" y=\"20\" width=\"296\" height=\"232\" rx=\"12\"/><text class=\"chess-knight-mask-h\" x=\"342\" y=\"44\">N on e4 is bit 28</text><rect class=\"chess-knight-mask-rh chess-knight-mask-d0\" x=\"342\" y=\"51\" width=\"266\" height=\"20\" rx=\"5\"/><rect class=\"chess-knight-mask-rh chess-knight-mask-d1\" x=\"342\" y=\"73\" width=\"266\" height=\"20\" rx=\"5\"/><rect class=\"chess-knight-mask-rh chess-knight-mask-d2\" x=\"342\" y=\"95\" width=\"266\" height=\"20\" rx=\"5\"/><rect class=\"chess-knight-mask-rh chess-knight-mask-d3\" x=\"342\" y=\"117\" width=\"266\" height=\"20\" rx=\"5\"/><rect class=\"chess-knight-mask-rh chess-knight-mask-d4\" x=\"342\" y=\"139\" width=\"266\" height=\"20\" rx=\"5\"/><rect class=\"chess-knight-mask-rh chess-knight-mask-d5\" x=\"342\" y=\"161\" width=\"266\" height=\"20\" rx=\"5\"/><rect class=\"chess-knight-mask-rh chess-knight-mask-d6\" x=\"342\" y=\"183\" width=\"266\" height=\"20\" rx=\"5\"/><rect class=\"chess-knight-mask-rh chess-knight-mask-d7\" x=\"342\" y=\"205\" width=\"266\" height=\"20\" rx=\"5\"/><text class=\"chess-knight-mask-t\" x=\"356\" y=\"66\">sq +17</text><text class=\"chess-knight-mask-t\" x=\"446\" y=\"66\">f6</text><text class=\"chess-knight-mask-s\" x=\"520\" y=\"66\">bit 45</text><text class=\"chess-knight-mask-t\" x=\"356\" y=\"88\">sq +15</text><text class=\"chess-knight-mask-t\" x=\"446\" y=\"88\">d6</text><text class=\"chess-knight-mask-s\" x=\"520\" y=\"88\">bit 43</text><text class=\"chess-knight-mask-t\" x=\"356\" y=\"110\">sq +10</text><text class=\"chess-knight-mask-t\" x=\"446\" y=\"110\">g5</text><text class=\"chess-knight-mask-s\" x=\"520\" y=\"110\">bit 38</text><text class=\"chess-knight-mask-t\" x=\"356\" y=\"132\">sq +6</text><text class=\"chess-knight-mask-t\" x=\"446\" y=\"132\">c5</text><text class=\"chess-knight-mask-s\" x=\"520\" y=\"132\">bit 34</text><text class=\"chess-knight-mask-t\" x=\"356\" y=\"154\">sq -6</text><text class=\"chess-knight-mask-t\" x=\"446\" y=\"154\">g3</text><text class=\"chess-knight-mask-s\" x=\"520\" y=\"154\">bit 22</text><text class=\"chess-knight-mask-t\" x=\"356\" y=\"176\">sq -10</text><text class=\"chess-knight-mask-t\" x=\"446\" y=\"176\">c3</text><text class=\"chess-knight-mask-s\" x=\"520\" y=\"176\">bit 18</text><text class=\"chess-knight-mask-t\" x=\"356\" y=\"198\">sq -15</text><text class=\"chess-knight-mask-t\" x=\"446\" y=\"198\">f2</text><text class=\"chess-knight-mask-s\" x=\"520\" y=\"198\">bit 13</text><text class=\"chess-knight-mask-t\" x=\"356\" y=\"220\">sq -17</text><text class=\"chess-knight-mask-t\" x=\"446\" y=\"220\">d2</text><text class=\"chess-knight-mask-s\" x=\"520\" y=\"220\">bit 11</text><text class=\"chess-knight-mask-t chess-knight-mask-c\" x=\"320\" y=\"286\">attacks[e4] = 0x0000284400442800</text><text class=\"chess-knight-mask-s chess-knight-mask-c\" x=\"320\" y=\"306\">built once: 64 entries x 8 bytes = 512 bytes per leaper</text></svg>"
        },
        {
          "type": "p",
          "text": "Leapers need no occupancy, so their attacks are a table built once at startup: 64 entries of 8 bytes for the knight and the same for the king. The builder tries the eight offsets and drops any that leave the board, so edge squares simply have fewer bits and wrap-around bugs cannot appear at runtime. Sliders depend on blockers, and **magic bitboards** solve that. Mask the occupancy down to the squares that can block the ray (at most 12 bits for a rook, 9 for a bishop), multiply by a per-square magic constant found by offline search, shift right, and use the result as an index into a precomputed attack table. The multiply maps every blocker pattern to a distinct index, or to a harmless collision with the same attack set. With the common compact layout the tables hold about 100,000 rook entries and 5,000 bishop entries, under 1 MB in total."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "static readonly ulong[] KnightAttacks = new ulong[64];\n\nstatic void InitKnights()\n{\n    int[] df = { 1, 2, 2, 1, -1, -2, -2, -1 };\n    int[] dr = { 2, 1, -1, -2, -2, -1, 1, 2 };\n    for (int sq = 0; sq < 64; sq++)\n        for (int i = 0; i < 8; i++)\n        {\n            int f = (sq & 7) + df[i], r = (sq >> 3) + dr[i];\n            if (f >= 0 && f < 8 && r >= 0 && r < 8)\n                KnightAttacks[sq] |= 1UL << (r * 8 + f);\n        }\n}\n\n// Sliders: keep only relevant blockers, multiply by the magic, shift, look up.\nstatic ulong RookAttacks(int sq, ulong occ)\n{\n    ulong blockers = occ & RookMask[sq];\n    int index = (int)((blockers * RookMagic[sq]) >> RookShift[sq]);\n    return RookTable[sq][index];\n}"
        },
        {
          "type": "h",
          "text": "Move generation and perft"
        },
        {
          "type": "p",
          "text": "Generate **pseudo-legal** moves first: every move that follows piece movement rules, ignoring whether it leaves your own king in check. Then make the move and test whether your king is attacked, and discard it if so. That keeps the generator simple, because pins, discovered checks and the odd en passant capture that exposes the king along a rank all fall out of one test. The cost is making a few illegal moves, a small share of the work. Castling needs explicit checks: rights present, squares between empty, and the king not in check, not crossing and not landing on an attacked square. For make and unmake you can keep an undo stack, or use **copy-make**: a bitboard position is about 120 bytes, so copying it per node is cheap and removes a whole class of unmake bugs. In C# make it a struct, or copy into a preallocated slot per ply, so the search does not allocate a new object at every node."
        },
        {
          "type": "p",
          "text": "Test the generator with **perft**: count the leaf nodes of the full move tree to a fixed depth and compare with published values. From the start position, perft(1) = 20, perft(2) = 400, perft(3) = 8,902, perft(4) = 197,281, perft(5) = 4,865,609 and perft(6) = 119,060,324. The start position is gentle (no castling or promotions in the first plies), so also run the well-known 'Kiwipete' position `r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1`, which gives 48, 2,039, 97,862 and 4,085,603 for depths 1 to 4. When a count is off, **perft divide** prints the count under each root move. Compare it with a reference engine and recurse into the one move that differs until you reach the single wrong position."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "static long Perft(Position p, int depth)\n{\n    if (depth == 0) return 1;\n    long nodes = 0;\n    foreach (Move m in MoveGen.PseudoLegal(p))\n    {\n        Position next = p.Apply(m);              // copy-make\n        if (next.IsKingAttacked(!next.WhiteToMove)) continue;   // mover's own king in check\n        nodes += Perft(next, depth - 1);\n    }\n    return nodes;\n}"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Perft validates move generation only. It never touches repetition, the 50-move rule, clocks, evaluation or search, so those need their own tests: a position that must be drawn by repetition, one at halfmove clock 99 and 100, known mate-in-N puzzles. A passing perft can also hide a hashing bug: put castling rights and the en passant file into the Zobrist key, or the table will merge positions that differ only there."
        },
        {
          "type": "h",
          "text": "Search: negamax and alpha-beta"
        },
        {
          "type": "p",
          "text": "Minimax assumes both sides pick the best move for themselves. **Negamax** folds the two cases into one function using `max(a, b) = -min(-a, -b)`: every score is from the side to move's view and a recursive call returns `-Search(child)`. At a branching factor of about 35, plain minimax visits `35^d` leaves, which is 1.8 billion at depth 6. **Alpha-beta** carries a window: `alpha` is the best score the side to move can already guarantee, `beta` is the best the opponent will allow. When a move scores at least `beta`, the opponent would never let the game reach this line, so the remaining moves are skipped (a **beta cutoff**). The returned value equals the minimax value; only the work changes. With perfect ordering the tree shrinks to about `b^(d/2)` leaves (exactly `b^ceil(d/2) + b^floor(d/2) - 1`), so depth 8 costs about 2 x 35^4 = 3 million leaves instead of 2.25 trillion. With poor ordering you save much less, which is why ordering matters more than anything else in the search."
        },
        {
          "type": "figure",
          "id": "chess-alpha-beta",
          "caption": "The first branch sets alpha to 3. In the second branch the first leaf is 2, so the min side already holds something no better than 2 and the other leaves cannot change the root; they are skipped.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Alpha-beta pruning on a small game tree. A max root has three min children with three leaves each. After the first branch fixes alpha at 3, the second branch sees a leaf worth 2, cuts off, and its remaining leaves 9 and 1 are never searched. The third branch gives 4, so the root value is 4 after 7 of 9 leaves.\"><style>.chess-alpha-beta-t{font-size:14px;fill:var(--fig-ink)}.chess-alpha-beta-h{font-size:15px;font-weight:600;fill:var(--fig-ink)}.chess-alpha-beta-s{font-size:13px;fill:var(--fig-muted)}.chess-alpha-beta-c{text-anchor:middle}.chess-alpha-beta-e{stroke:var(--fig-muted);stroke-width:1.5}.chess-alpha-beta-n{fill:var(--fig-panel);stroke:var(--fig-accent);stroke-width:2}.chess-alpha-beta-lf{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.chess-alpha-beta-hl{fill:var(--fig-accent);fill-opacity:0;animation:chess-alpha-beta-hl 7s linear infinite}.chess-alpha-beta-pr{opacity:.18;animation:chess-alpha-beta-pr 7s linear infinite}.chess-alpha-beta-cut{fill:var(--fig-bad);animation:chess-alpha-beta-cut 7s linear infinite}.chess-alpha-beta-a3{fill:var(--fig-accent);animation:chess-alpha-beta-a3 7s linear infinite;opacity:0}.chess-alpha-beta-a4{fill:var(--fig-accent);animation:chess-alpha-beta-a4 7s linear infinite}.chess-alpha-beta-d0{animation-delay:0s}.chess-alpha-beta-d1{animation-delay:1s}.chess-alpha-beta-d05{animation-delay:0.5s}.chess-alpha-beta-d16{animation-delay:1.6s}.chess-alpha-beta-d27{animation-delay:2.7s}.chess-alpha-beta-d32{animation-delay:3.2s}.chess-alpha-beta-d37{animation-delay:3.7s}@keyframes chess-alpha-beta-hl{0%{fill-opacity:0}2%,7%{fill-opacity:.5}11%,100%{fill-opacity:0}}@keyframes chess-alpha-beta-pr{0%,31%{opacity:1}36%,92%{opacity:.18}97%,100%{opacity:1}}@keyframes chess-alpha-beta-cut{0%,31%{opacity:0}36%,92%{opacity:1}97%,100%{opacity:0}}@keyframes chess-alpha-beta-a3{0%,18%{opacity:0}20%,52%{opacity:1}54%,100%{opacity:0}}@keyframes chess-alpha-beta-a4{0%,56%{opacity:0}58%,92%{opacity:1}96%,100%{opacity:0}}</style><text class=\"chess-alpha-beta-s\" x=\"16\" y=\"55\">max</text><text class=\"chess-alpha-beta-s\" x=\"16\" y=\"129\">min</text><text class=\"chess-alpha-beta-s\" x=\"16\" y=\"225\">leaf</text><line class=\"chess-alpha-beta-e\" x1=\"320\" y1=\"50\" x2=\"120\" y2=\"124\"/><line class=\"chess-alpha-beta-e\" x1=\"320\" y1=\"50\" x2=\"320\" y2=\"124\"/><line class=\"chess-alpha-beta-e\" x1=\"320\" y1=\"50\" x2=\"520\" y2=\"124\"/><line class=\"chess-alpha-beta-e\" x1=\"120\" y1=\"124\" x2=\"70\" y2=\"206\"/><line class=\"chess-alpha-beta-e\" x1=\"120\" y1=\"124\" x2=\"120\" y2=\"206\"/><line class=\"chess-alpha-beta-e\" x1=\"120\" y1=\"124\" x2=\"170\" y2=\"206\"/><line class=\"chess-alpha-beta-e\" x1=\"320\" y1=\"124\" x2=\"270\" y2=\"206\"/><line class=\"chess-alpha-beta-e chess-alpha-beta-pr\" x1=\"320\" y1=\"124\" x2=\"320\" y2=\"206\"/><line class=\"chess-alpha-beta-e chess-alpha-beta-pr\" x1=\"320\" y1=\"124\" x2=\"370\" y2=\"206\"/><line class=\"chess-alpha-beta-e\" x1=\"520\" y1=\"124\" x2=\"470\" y2=\"206\"/><line class=\"chess-alpha-beta-e\" x1=\"520\" y1=\"124\" x2=\"520\" y2=\"206\"/><line class=\"chess-alpha-beta-e\" x1=\"520\" y1=\"124\" x2=\"570\" y2=\"206\"/><circle class=\"chess-alpha-beta-n\" cx=\"320\" cy=\"50\" r=\"20\"/><text class=\"chess-alpha-beta-h chess-alpha-beta-c\" x=\"320\" y=\"55\">4</text><circle class=\"chess-alpha-beta-n\" cx=\"120\" cy=\"124\" r=\"20\"/><text class=\"chess-alpha-beta-h chess-alpha-beta-c\" x=\"120\" y=\"129\">3</text><circle class=\"chess-alpha-beta-n\" cx=\"320\" cy=\"124\" r=\"20\"/><text class=\"chess-alpha-beta-h chess-alpha-beta-c\" x=\"320\" y=\"129\">≤2</text><circle class=\"chess-alpha-beta-n\" cx=\"520\" cy=\"124\" r=\"20\"/><text class=\"chess-alpha-beta-h chess-alpha-beta-c\" x=\"520\" y=\"129\">4</text><g><rect class=\"chess-alpha-beta-lf\" x=\"52\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"70\" y=\"225\">3</text></g><g><rect class=\"chess-alpha-beta-lf\" x=\"102\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"120\" y=\"225\">5</text></g><g><rect class=\"chess-alpha-beta-lf\" x=\"152\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"170\" y=\"225\">6</text></g><g><rect class=\"chess-alpha-beta-lf\" x=\"252\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"270\" y=\"225\">2</text></g><g class=\"chess-alpha-beta-pr\"><rect class=\"chess-alpha-beta-lf\" x=\"302\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"320\" y=\"225\">9</text></g><g class=\"chess-alpha-beta-pr\"><rect class=\"chess-alpha-beta-lf\" x=\"352\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"370\" y=\"225\">1</text></g><g><rect class=\"chess-alpha-beta-lf\" x=\"452\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"470\" y=\"225\">4</text></g><g><rect class=\"chess-alpha-beta-lf\" x=\"502\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"520\" y=\"225\">8</text></g><g><rect class=\"chess-alpha-beta-lf\" x=\"552\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-t chess-alpha-beta-c\" x=\"570\" y=\"225\">7</text></g><rect class=\"chess-alpha-beta-hl chess-alpha-beta-d0\" x=\"52\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><rect class=\"chess-alpha-beta-hl chess-alpha-beta-d05\" x=\"102\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><rect class=\"chess-alpha-beta-hl chess-alpha-beta-d1\" x=\"152\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><rect class=\"chess-alpha-beta-hl chess-alpha-beta-d16\" x=\"252\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><rect class=\"chess-alpha-beta-hl chess-alpha-beta-d27\" x=\"452\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><rect class=\"chess-alpha-beta-hl chess-alpha-beta-d32\" x=\"502\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><rect class=\"chess-alpha-beta-hl chess-alpha-beta-d37\" x=\"552\" y=\"206\" width=\"36\" height=\"28\" rx=\"6\"/><text class=\"chess-alpha-beta-h chess-alpha-beta-a3\" x=\"352\" y=\"44\">alpha = 3</text><text class=\"chess-alpha-beta-h chess-alpha-beta-a4\" x=\"352\" y=\"44\">alpha = 4</text><text class=\"chess-alpha-beta-s chess-alpha-beta-c chess-alpha-beta-cut\" x=\"320\" y=\"258\">cutoff: 2 ≤ alpha 3, skip the rest</text><text class=\"chess-alpha-beta-s chess-alpha-beta-c\" x=\"320\" y=\"288\">7 of 9 leaves searched; the root value is still exactly 4.</text></svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "int Search(Position p, int depth, int alpha, int beta, int ply)\n{\n    if (ply > 0 && IsDraw(p)) return 0;           // repetition or 50-move rule\n    if (depth <= 0) return Quiesce(p, alpha, beta);\n    int alphaStart = alpha;\n    Move ttMove = default;\n    if (tt.Probe(p.Hash, out Entry e))\n    {\n        ttMove = e.Move;\n        if (e.Depth >= depth && ProvesCutoff(e, alpha, beta)) return e.Score;\n    }\n    int best = -Mate, legal = 0; Move bestMove = default;\n    foreach (Move m in OrderedMoves(p, ttMove, ply))\n    {\n        Position next = p.Apply(m);\n        if (next.IsKingAttacked(!next.WhiteToMove)) continue;   // pseudo-legal filter\n        legal++;\n        int score = -Search(next, depth - 1, -beta, -alpha, ply + 1);\n        if (score > best) { best = score; bestMove = m; }\n        if (score > alpha) alpha = score;\n        if (alpha >= beta) { RecordKillerAndHistory(m, depth, ply); break; }   // beta cutoff\n    }\n    if (legal == 0) return p.InCheck() ? -Mate + ply : 0;       // mated or stalemate\n    tt.Store(p.Hash, depth, best, bestMove, best <= alphaStart ? Bound.Upper : best >= beta ? Bound.Lower : Bound.Exact);\n    return best;\n}"
        },
        {
          "type": "h",
          "text": "Move ordering"
        },
        {
          "type": "p",
          "text": "Cutoffs come early only if the best move is tried first, so the engine sorts moves by a cheap guess before searching them. The usual order:"
        },
        {
          "type": "list",
          "items": [
            "**Hash move.** The best move stored in the transposition table from an earlier or shallower search of this position. Try it first.",
            "**Captures by MVV-LVA.** Most valuable victim, least valuable attacker: score `10 * victim - attacker`, so pawn takes queen comes before queen takes pawn. Many engines use static exchange evaluation (SEE) to push losing captures to the back.",
            "**Killer moves.** Two quiet moves per ply that recently caused a cutoff in a sibling node. The same refutation often works next door.",
            "**History heuristic.** A table indexed by side, from and to that grows when a quiet move causes a cutoff, so moves that have worked anywhere float upward.",
            "**The rest.** Remaining quiet moves, sorted by history score."
          ]
        },
        {
          "type": "p",
          "text": "In a well-ordered engine the first move tried causes the cutoff in the large majority of cutoff nodes, commonly cited at well over 90 percent. Count it. A drop in that number is the cheapest way to notice an ordering bug."
        },
        {
          "type": "h",
          "text": "Quiescence search and the horizon effect"
        },
        {
          "type": "p",
          "text": "A fixed-depth search stops in the middle of exchanges. Suppose the last ply is `Qxd5`, winning a pawn that a pawn on e6 defends. A static evaluation sees +100 centipawns and never sees `exd5` winning the queen. Pushing such losses just past the search depth is the **horizon effect**. **Quiescence search** fixes it: at depth 0, do not evaluate, call a search that first takes the static evaluation as a 'stand pat' lower bound (the side to move can usually decline to capture), then tries only captures and promotions, recursing until nothing more is worth taking. Order captures by MVV-LVA and skip those that SEE says lose material, or the capture tree explodes; even so it is often half of all nodes or more. When the side to move is in check, standing pat is not allowed, so search every evasion."
        },
        {
          "type": "h",
          "text": "Transposition table and Zobrist hashing"
        },
        {
          "type": "p",
          "text": "Different move orders reach the same position (1.Nf3 Nf6 2.Nc3 and 1.Nc3 Nf6 2.Nf3), and iterative deepening revisits the same positions on every iteration. A **transposition table** (TT) caches results by position. The key is a **Zobrist hash**: fill a table with random 64-bit numbers, one for each (piece, square) pair (12 x 64), one for the side to move, 16 for the castling-rights combinations and 8 for the en passant files. A position's hash is the XOR of the numbers for everything present. XOR is its own inverse, so a move updates the hash incrementally: XOR the piece out of `from`, in at `to`, out of any captured square, then toggle the side, castling and en passant keys. That is a handful of operations instead of rescanning 64 squares."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "static readonly ulong[,] PieceKey = new ulong[12, 64];   // filled once from a seeded PRNG\nstatic readonly ulong SideKey;\nstatic readonly ulong[] CastleKey = new ulong[16], EpFileKey = new ulong[8];\n\n// Inside Apply(move), for an ordinary capture or quiet move:\nulong h = pos.Hash;\nh ^= PieceKey[piece, from];                   // lift the piece off\nh ^= PieceKey[piece, to];                     // put it down\nif (captured >= 0) h ^= PieceKey[captured, to];\nh ^= CastleKey[oldCastling] ^ CastleKey[newCastling];\nif (oldEp >= 0) h ^= EpFileKey[oldEp & 7];\nif (newEp >= 0) h ^= EpFileKey[newEp & 7];\nh ^= SideKey;                                 // flip the side to move\n// En passant, castling and promotion add their extra XORs the same way."
        },
        {
          "type": "p",
          "text": "Each TT entry holds the hash (or its upper bits) to detect index collisions, the depth searched, the score, a **bound type** (exact, lower bound from a beta cutoff, or upper bound from a fail-low) and the best move: about 16 bytes in a simple engine. The index is `hash & (size - 1)` with a power-of-two size, so a 64 MB table holds 4,194,304 entries. A probe can return a score outright when the stored depth is enough and the bound proves a cutoff; either way the stored move is tried first. Two cautions. A 64-bit key still collides rarely, so check that a hash move is legal before playing it. And mate scores need care: a score like `Mate - ply` counts plies from the root, so store it as a distance from the node and convert it back on probe, or a mate found at ply 8 is reported at the wrong distance when reached at ply 12."
        },
        {
          "type": "h",
          "text": "Iterative deepening and time management"
        },
        {
          "type": "p",
          "text": "You cannot know how deep you can get in 800 ms, because tree size varies by 100x between positions. **Iterative deepening** searches depth 1, then 2, 3 and so on until time runs out. It sounds wasteful, but the costs form a geometric series: if each ply costs about 3 times the last, all earlier iterations together add only about half of the final one. In return you always have a playable best move, the transposition table is full of good moves for ordering the next depth, and the previous best move is searched first at the root. **Time management** gives each move a budget; a common starting rule is the remaining time divided by about 30, plus most of the increment. Keep a soft limit (do not start another iteration once about a third of the budget is used, since the next one costs about twice everything so far) and a hard limit (poll the clock every 2,048 nodes and abort at once). An aborted iteration is discarded, unless its first root move had already finished, since partial results are unreliable."
        },
        {
          "type": "figure",
          "id": "chess-iter-deepening",
          "caption": "Each finished depth hands its best move and table entries to the next. Depth 7 starts too late and is cut off, so depth 6's move is played; a soft limit would not have started it.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 340\" role=\"img\" aria-label=\"Iterative deepening against a one second time budget. Each depth takes about three times as long as the previous one. Depths 1 to 6 finish, and depth 7 is cut off by the deadline, so the engine plays the best move from depth 6.\"><style>.chess-iter-deepening-t{font-size:14px;fill:var(--fig-ink)}.chess-iter-deepening-s{font-size:12px;fill:var(--fig-muted)}.chess-iter-deepening-c{text-anchor:middle}.chess-iter-deepening-e{text-anchor:end}.chess-iter-deepening-st{text-anchor:start}.chess-iter-deepening-tr{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.chess-iter-deepening-fa,.chess-iter-deepening-fw{transform-box:fill-box;transform-origin:0 50%}.chess-iter-deepening-fa{fill:var(--fig-accent);fill-opacity:.8}.chess-iter-deepening-fw{fill:var(--fig-warn);fill-opacity:.8}.chess-iter-deepening-ax{stroke:var(--fig-muted);stroke-width:1.5}.chess-iter-deepening-dl{stroke:var(--fig-bad);stroke-width:2;stroke-dasharray:5 4}.chess-iter-deepening-cu{stroke:var(--fig-ink);stroke-width:2;animation:chess-iter-deepening-cu 7s linear infinite}@keyframes chess-iter-deepening-cu{0%{transform:translateX(0)}85%,100%{transform:translateX(516px)}}@keyframes chess-iter-deepening-f0{0%,0.00%{transform:scaleX(0)}0.21%,96%{transform:scaleX(1)}100%{transform:scaleX(0)}}.chess-iter-deepening-f0{animation:chess-iter-deepening-f0 7s linear infinite}@keyframes chess-iter-deepening-f1{0%,0.21%{transform:scaleX(0)}0.85%,96%{transform:scaleX(1)}100%{transform:scaleX(0)}}.chess-iter-deepening-f1{animation:chess-iter-deepening-f1 7s linear infinite}@keyframes chess-iter-deepening-f2{0%,0.85%{transform:scaleX(0)}2.76%,96%{transform:scaleX(1)}100%{transform:scaleX(0)}}.chess-iter-deepening-f2{animation:chess-iter-deepening-f2 7s linear infinite}@keyframes chess-iter-deepening-f3{0%,2.76%{transform:scaleX(0)}8.50%,96%{transform:scaleX(1)}100%{transform:scaleX(0)}}.chess-iter-deepening-f3{animation:chess-iter-deepening-f3 7s linear infinite}@keyframes chess-iter-deepening-f4{0%,8.50%{transform:scaleX(0)}25.71%,96%{transform:scaleX(1)}100%{transform:scaleX(0)}}.chess-iter-deepening-f4{animation:chess-iter-deepening-f4 7s linear infinite}@keyframes chess-iter-deepening-f5{0%,25.71%{transform:scaleX(0)}77.35%,96%{transform:scaleX(1)}100%{transform:scaleX(0)}}.chess-iter-deepening-f5{animation:chess-iter-deepening-f5 7s linear infinite}@keyframes chess-iter-deepening-f6{0%,77.35%{transform:scaleX(0)}85.00%,96%{transform:scaleX(1)}100%{transform:scaleX(0)}}.chess-iter-deepening-f6{animation:chess-iter-deepening-f6 7s linear infinite}</style><text class=\"chess-iter-deepening-t\" x=\"16\" y=\"26\">One second per move, about 3x more work per extra ply</text><text class=\"chess-iter-deepening-s chess-iter-deepening-e\" x=\"600\" y=\"46\" style=\"fill:var(--fig-bad)\">time up</text><line class=\"chess-iter-deepening-dl\" x1=\"600\" y1=\"50\" x2=\"600\" y2=\"248\"/><text class=\"chess-iter-deepening-s\" x=\"16\" y=\"70\">depth 1</text><rect class=\"chess-iter-deepening-tr\" x=\"84.0\" y=\"56\" width=\"2.0\" height=\"18\" rx=\"3\"/><text class=\"chess-iter-deepening-s\" x=\"16\" y=\"98\">depth 2</text><rect class=\"chess-iter-deepening-tr\" x=\"85.3\" y=\"84\" width=\"3.9\" height=\"18\" rx=\"3\"/><text class=\"chess-iter-deepening-s\" x=\"16\" y=\"126\">depth 3</text><rect class=\"chess-iter-deepening-tr\" x=\"89.2\" y=\"112\" width=\"11.6\" height=\"18\" rx=\"3\"/><text class=\"chess-iter-deepening-s\" x=\"16\" y=\"154\">depth 4</text><rect class=\"chess-iter-deepening-tr\" x=\"100.8\" y=\"140\" width=\"34.8\" height=\"18\" rx=\"3\"/><text class=\"chess-iter-deepening-s\" x=\"16\" y=\"182\">depth 5</text><rect class=\"chess-iter-deepening-tr\" x=\"135.6\" y=\"168\" width=\"104.5\" height=\"18\" rx=\"3\"/><text class=\"chess-iter-deepening-s\" x=\"16\" y=\"210\">depth 6</text><rect class=\"chess-iter-deepening-tr\" x=\"240.1\" y=\"196\" width=\"313.5\" height=\"18\" rx=\"3\"/><text class=\"chess-iter-deepening-s\" x=\"16\" y=\"238\">depth 7</text><rect class=\"chess-iter-deepening-tr\" x=\"553.6\" y=\"224\" width=\"46.4\" height=\"18\" rx=\"3\"/><rect class=\"chess-iter-deepening-fa chess-iter-deepening-f0\" x=\"84.0\" y=\"56\" width=\"2.0\" height=\"18\" rx=\"3\"/><rect class=\"chess-iter-deepening-fa chess-iter-deepening-f1\" x=\"85.3\" y=\"84\" width=\"3.9\" height=\"18\" rx=\"3\"/><rect class=\"chess-iter-deepening-fa chess-iter-deepening-f2\" x=\"89.2\" y=\"112\" width=\"11.6\" height=\"18\" rx=\"3\"/><rect class=\"chess-iter-deepening-fa chess-iter-deepening-f3\" x=\"100.8\" y=\"140\" width=\"34.8\" height=\"18\" rx=\"3\"/><rect class=\"chess-iter-deepening-fa chess-iter-deepening-f4\" x=\"135.6\" y=\"168\" width=\"104.5\" height=\"18\" rx=\"3\"/><rect class=\"chess-iter-deepening-fa chess-iter-deepening-f5\" x=\"240.1\" y=\"196\" width=\"313.5\" height=\"18\" rx=\"3\"/><rect class=\"chess-iter-deepening-fw chess-iter-deepening-f6\" x=\"553.6\" y=\"224\" width=\"46.4\" height=\"18\" rx=\"3\"/><line class=\"chess-iter-deepening-ax\" x1=\"84\" y1=\"248\" x2=\"600\" y2=\"248\"/><line class=\"chess-iter-deepening-ax\" x1=\"84\" y1=\"248\" x2=\"84\" y2=\"254\"/><text class=\"chess-iter-deepening-s chess-iter-deepening-st\" x=\"84\" y=\"270\">0</text><line class=\"chess-iter-deepening-ax\" x1=\"342\" y1=\"248\" x2=\"342\" y2=\"254\"/><text class=\"chess-iter-deepening-s chess-iter-deepening-c\" x=\"342\" y=\"270\">0.5 s</text><line class=\"chess-iter-deepening-ax\" x1=\"600\" y1=\"248\" x2=\"600\" y2=\"254\"/><text class=\"chess-iter-deepening-s chess-iter-deepening-e\" x=\"600\" y=\"270\">1 s</text><line class=\"chess-iter-deepening-cu\" x1=\"84\" y1=\"50\" x2=\"84\" y2=\"248\"/><rect class=\"chess-iter-deepening-fa\" style=\"transform:none\" x=\"16\" y=\"289\" width=\"14\" height=\"12\" rx=\"2\"/><text class=\"chess-iter-deepening-s\" x=\"38\" y=\"300\">finished: its best move becomes the move to play</text><rect class=\"chess-iter-deepening-fw\" style=\"transform:none\" x=\"16\" y=\"311\" width=\"14\" height=\"12\" rx=\"2\"/><text class=\"chess-iter-deepening-s\" x=\"38\" y=\"322\">unfinished: discarded, but its table entries still help the next move</text></svg>"
        },
        {
          "type": "callout",
          "kind": "tip",
          "text": "Wall-clock limits make bugs unrepeatable, because the same position searches to a different depth on every run. Test and debug with a fixed node limit (`go nodes 500000`), which is deterministic on one thread, and keep time limits for play. Lazy multithreaded search is nondeterministic by design, so compare results with one thread."
        },
        {
          "type": "h",
          "text": "Evaluation"
        },
        {
          "type": "p",
          "text": "At a quiet leaf the engine needs one number. The classic **hand-written evaluation** starts with material in centipawns (pawn 100, knight 320, bishop 330, rook 500, queen 900). It adds **piece-square tables**, a 64-entry bonus per piece type (a knight is worth more on e4 than on a1), and then small terms for pawn structure, mobility, king safety and the bishop pair. The king shows why one table is not enough: it wants shelter in the middlegame and the centre in the endgame. A **tapered evaluation** computes a middlegame and an endgame score plus a game phase from the remaining material (knight and bishop 1, rook 2, queen 4, so 24 at the start), then blends them. The result is returned from the side to move's view, which negamax requires. Top engines now use **NNUE** (efficiently updatable neural network), which Stockfish adopted in version 12 in 2020. Its first layer is updated incrementally as pieces move instead of recomputed, so a network evaluation costs a few vector operations per move. A tuned hand-written evaluation is enough to beat nearly every casual player; NNUE is the upgrade for when you chase strength."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "int Evaluate(Position p)\n{\n    int mg = 0, eg = 0, phase = 0;\n    foreach (var (piece, sq) in p.AllPieces())        // iterates set bits of each bitboard\n    {\n        int t = piece.Type, s = piece.IsWhite ? 1 : -1;\n        int i = Oriented(sq, piece);                  // mirror the table for black\n        mg += s * (MgValue[t] + MgTable[t][i]);\n        eg += s * (EgValue[t] + EgTable[t][i]);\n        phase += PhaseWeight[t];                      // N,B = 1; R = 2; Q = 4; P,K = 0\n    }\n    phase = Math.Min(phase, 24);\n    int score = (mg * phase + eg * (24 - phase)) / 24;    // white's view\n    return p.WhiteToMove ? score : -score;                // side to move's view\n}"
        },
        {
          "type": "h",
          "text": "Engine and GUI: the UCI split"
        },
        {
          "type": "p",
          "text": "Put the engine behind a text protocol. **UCI** (Universal Chess Interface) is the de facto standard: the GUI sends lines such as `position startpos moves e2e4 e7e5` and `go wtime 60000 btime 60000 winc 1000 binc 1000`, the engine streams `info` lines and ends with `bestmove`, and `stop` interrupts. Search runs on its own thread so the main loop can still read `stop`; in Unity that is a background thread or task, and the main thread only polls for the result. The split buys three things: you can test the engine headless from a script, you can plug in Stockfish to benchmark yours, and the UI can never reach into search state. Even if you never speak UCI over a pipe, keep the same shape in-process: a position plus limits in, a best move out. WebGL has no regular threads, so slice the search across frames with a node budget per frame, or run it on a server."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "GUI    -> uci\nEngine -> id name MyEngine 0.1\nEngine -> uciok\nGUI    -> position startpos moves e2e4 e7e5\nGUI    -> go wtime 60000 btime 60000 winc 1000 binc 1000\nEngine -> info depth 12 score cp 31 nodes 1830211 nps 2400000 pv g1f3 b8c6\nEngine -> bestmove g1f3"
        },
        {
          "type": "h",
          "text": "Difficulty levels"
        },
        {
          "type": "p",
          "text": "A weak engine and a broken engine are different things. A bot that plays random legal moves hangs its queen and misses mate in one, and players read that as a bug. Three dials make a convincing weaker player. **Limit the search** by depth or, better, by nodes, since a node limit gives the same strength on any device and is deterministic. **Add evaluation noise** at the root: score every root move, then pick randomly among the moves within a margin of the best (say 20 to 150 centipawns, scaled by level). **Add guard rails**: keep quiescence at every level, always take a mate in one, and refuse any move that loses more than a set amount even when noise favours it. Stockfish exposes similar settings as `Skill Level` and `UCI_Elo`. Calibrate levels by playing them against a fixed reference and measuring the win rates, not by trusting the numbers on the slider."
        },
        {
          "type": "h",
          "text": "Online play"
        },
        {
          "type": "p",
          "text": "In online chess the client is a display and an input device. The server holds the authoritative position, validates every move with the same rules core the client uses (shared as a library) and rejects illegal ones. The message is tiny: game id, from, to, promotion piece and the expected ply number, which also makes retries idempotent. **Clocks are server-authoritative**: the server records when the turn began and when the move arrived, subtracts the difference, adds the increment, and arms a timer that ends the game when time runs out. The client runs a local countdown for display only and corrects it from the remaining times in each server message. Some servers credit a bounded amount of measured latency so that a slow connection is not punished. Draw rules run on the server from the hash history, and the move list from the start FEN lets you replay any game for review, reconnection and disputes."
        },
        {
          "type": "h",
          "text": "Decisions and why they work"
        },
        {
          "type": "list",
          "items": [
            "**Keep the core pure.** No UnityEngine types and no scene-bound statics. It then runs in EditMode tests, on a server and on a worker thread; logic buried in MonoBehaviours can do none of that.",
            "**Bitboards over an array.** Attacks, pawn pushes and occupancy become shifts and ANDs. The cost is harder debugging (print boards, not hex) and a magic-number setup. An array stays acceptable for a UI-only or one-ply bot.",
            "**Pseudo-legal moves plus a check test.** One simple test covers pins, discovered checks and en passant. A fully legal generator is a little faster but much easier to get wrong.",
            "**Perft before search.** A rare movegen bug (castling, promotion, en passant) is invisible in casual play and silently corrupts every search result built on it. Published counts make it cheap to catch.",
            "**Ordering and quiescence before evaluation terms.** Depth is the biggest multiplier, and ordering decides how deep you get in the same time. A bonus for rooks on open files can wait.",
            "**A TT with a replacement policy.** At 2 million nodes per second a 64 MB table fills in seconds. Always-replace throws away deep work and never-replace fills with stale data, so keep deep entries and age out old ones.",
            "**Iterative deepening with a hard clock check.** It costs about half again in nodes at a factor of 3 per ply, but a move is always ready, which a fixed-depth search cannot promise when the position suddenly gets sharp.",
            "**Difficulty from limits and noise, not random moves.** The weak bot still sees one-move tactics, so it loses like a human beginner and not like a broken program.",
            "**Server owns validation and time.** Any rule a client enforces is a rule a modified client can skip. The server's full check costs microseconds per move."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Delegate the boilerplate: attack-table initialisation, the UCI parser, piece-square tables, FEN parsing and the perft harness. Verify everything with oracles you control. Pin the published perft counts (start position and Kiwipete) in a test the agent may not edit, and if a count fails, make it work from `perft divide` output instead of changing the expected number. Require every search or evaluation change to come with a self-play result of several hundred games against the previous build, because speed-ups that lose strength look fine in unit tests. Check by hand that the search loop allocates nothing (agents like `List<Move>` per node), that mate scores are adjusted by ply in the TT, and that repetition uses the halfmove clock. Evaluation weights and difficulty feel are your call."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "The engine plays a capture that wins a pawn and loses a piece on the very next ply",
              "use": "Add quiescence search at depth 0",
              "why": "A static evaluation after a capture ignores the recapture. Searching captures until the position is quiet removes the horizon effect at a modest node cost."
            },
            {
              "signal": "Search reaches the same depth as before but needs far more nodes than expected",
              "use": "Fix move ordering first",
              "why": "Alpha-beta cost depends on trying the best move early. Hash move, MVV-LVA captures, killers and history can shrink the tree by a large factor with no strength loss."
            },
            {
              "signal": "A movegen change breaks rare moves such as castling, en passant or promotion",
              "use": "Run perft against published counts",
              "why": "Perft is a deterministic oracle. Compare several positions with known counts, then use divide to find the first wrong root move and recurse into it."
            },
            {
              "signal": "The same positions are searched again after transpositions and on every deeper iteration",
              "use": "Add a Zobrist-keyed transposition table",
              "why": "Incremental XOR hashing costs a few operations per move. Stored scores skip re-search, and stored best moves improve ordering at the next depth."
            },
            {
              "signal": "The bot must answer within a clock, but search time varies a lot between positions",
              "use": "Iterative deepening with soft and hard limits",
              "why": "Every finished depth is a playable move, so you can stop at any time. Poll the clock every few thousand nodes and do not start an iteration you cannot finish."
            },
            {
              "signal": "The easy bot feels random: it hangs pieces and misses mate in one",
              "use": "Weaken with a depth cap and bounded noise",
              "why": "Cap depth or nodes, then pick among moves within a small margin of the best. Keep quiescence and one-move tactics on, so mistakes look human, not broken."
            },
            {
              "signal": "A client reports its own clock or claims a move is legal",
              "use": "Server validates moves and owns the clocks",
              "why": "The client is untrusted. Run the same rules core on the server, reject illegal moves, and compute elapsed time from server receipt timestamps."
            },
            {
              "signal": "A draw by repetition fires late, or the UI and engine disagree about draws",
              "use": "Keep a hash history and a halfmove clock",
              "why": "Compare Zobrist keys only back to the last pawn move or capture. Inside search, treat one repeat as a draw; the game rules need three."
            }
          ]
        }
      ],
      "keyPoints": [
        "Keep the rules core pure and testable: FEN state, hash history and the halfmove clock cover castling, en passant and both draw rules.",
        "Bitboards turn attacks and pawn pushes into shifts and table lookups, and perft against published counts proves the move generator.",
        "Alpha-beta returns the minimax value but visits about b^(d/2) leaves with good ordering: hash move, MVV-LVA, killers, history.",
        "Quiescence search removes the horizon effect, and a Zobrist-keyed transposition table avoids re-searching transposed positions.",
        "Iterative deepening gives a playable move at any time and feeds ordering; the clock is polled every few thousand nodes.",
        "Difficulty comes from node limits, root noise and guard rails, and online the server validates every move and owns the clocks."
      ],
      "quiz": [
        {
          "q": "Perft(5) from a test position returns 4,865,612 but the reference says 4,865,609. What is the most efficient next step?",
          "options": [
            "Run perft(7) from the same position and see whether the gap widens further",
            "Play a self-play match and check whether the engine blunders in similar spots",
            "Run perft divide, compare per-move counts, and recurse into the odd one",
            "Increase the transposition table size to rule out hash collisions in the count"
          ],
          "answer": 2,
          "explain": "Divide localises the error: the one root move whose subtree count differs holds the bug, and repeating the diff one ply deeper narrows it to a single position. A deeper perft only makes the gap bigger, self-play can miss rare moves for thousands of games, and plain perft does not use a transposition table."
        },
        {
          "q": "After you improve move ordering, the engine reaches depth 8 in the time it needed for depth 6, and the score at each fixed depth is unchanged. Why?",
          "options": [
            "Alpha-beta gives the same value in any order; good ordering just cuts earlier",
            "Better ordering raises the evaluation accuracy, so the search needs fewer plies",
            "Ordering changes which moves are pruned unsoundly, trading accuracy for speed",
            "Ordering lets the engine skip quiescence at the horizon, which saves nodes"
          ],
          "answer": 0,
          "explain": "Alpha-beta returns the exact minimax value whatever the move order; order only decides how many branches are cut. Evaluation is untouched, alpha-beta pruning is sound (unlike heuristic forward pruning), and quiescence is not skipped."
        },
        {
          "q": "At depth 4 your engine plays Qxd5, winning a pawn that a pawn defends, and loses the queen next move. What is missing, and what is the fix?",
          "options": [
            "A larger evaluation weight for the queen so it avoids trades",
            "A transposition table that remembers the earlier recapture",
            "Iterative deepening so the capture is searched at more depths",
            "A quiescence search that resolves captures until the position is quiet"
          ],
          "answer": 3,
          "explain": "The leaf is evaluated in the middle of an exchange, so the recapture lies past the horizon. Quiescence extends only captures until the position is quiet. A heavier queen value does not reveal the recapture, a TT stores what was searched, and iterative deepening still ends every iteration at a noisy leaf."
        },
        {
          "q": "Why is XOR the operation used to build and update Zobrist hashes?",
          "options": [
            "XOR of random keys can never collide, so table keys are always unique",
            "It is its own inverse, so a move only XORs the features that changed",
            "It keeps the hash sorted by square so that nearby positions share table slots",
            "It makes hashes symmetric, so a position and its mirror get the same key"
          ],
          "answer": 1,
          "explain": "XORing a key twice cancels it, so removing a piece and adding it elsewhere is the same cheap operation and costs a few XORs instead of a 64-square rescan. Collisions are rare but possible (so entries store a check), and hashing does not sort or mirror positions."
        },
        {
          "q": "A client sends its remaining time with every move, and a modified client always reports 30 s. What is the right design?",
          "options": [
            "Sign each message with a key stored in the client binary so reports cannot be edited",
            "Average the client report with the last server value to limit how far it can drift",
            "Compare the client clock with NTP at login, then trust its reports for the game",
            "Ignore client times; the server measures each turn from its own timestamps"
          ],
          "answer": 3,
          "explain": "Only the server can be trusted with time. It stamps when a turn started and when the move arrived, so a client can only lose by lying. A key in the binary can be extracted, averaging still lets the client steer the result, and a login-time check says nothing about later reports."
        },
        {
          "q": "Your easiest bot picks uniformly random legal moves. Testers say it feels broken: it hangs its queen and ignores mate in one. Which move from the patterns fits?",
          "options": [
            "Add a transposition table so it stops repeating mistakes",
            "Give it a longer clock so that it plays more like a human",
            "Weaken with a depth cap and bounded noise, keep quiescence",
            "Add more random moves so the blunders look natural"
          ],
          "answer": 2,
          "explain": "A real search at a capped depth, with the choice made among near-best moves, loses by small positional errors like a beginner while still seeing one-move tactics. A TT does not change strength much, more time makes it stronger, and extra randomness is what makes it look broken."
        }
      ]
    },
    {
      "id": "case-platformer",
      "title": "Case study: 2D platformer",
      "minutes": 18,
      "summary": "How a tight 2D platformer is built: a fixed-step kinematic controller, per-axis tile collision, jump physics derived from designer values, forgiveness windows and a smoothed camera.",
      "lesson": [
        {
          "type": "p",
          "text": "A player sprints toward a ledge, steps off it, and presses jump 90 ms later. On screen the character is already falling. The game jumps anyway, and the player never notices that it cheated. A tight 2D platformer is built from dozens of small decisions like this one, each tuned in milliseconds and pixels. This case study takes the genre apart: the loop that keeps it deterministic, the collision code that keeps a character on a tile grid, the numbers behind a jump, the forgiveness that makes it fair, and the camera that follows. The examples use 16 px tiles and a 60 Hz simulation, and the code is Unity-flavoured C#, but nothing here depends on an engine."
        },
        {
          "type": "h",
          "text": "Components"
        },
        {
          "type": "list",
          "items": [
            "**Input** samples the device every frame and turns it into intent: move axis, jump pressed, jump held, dash pressed.",
            "**Simulation** runs at a fixed 60 Hz: the player state machine, velocity, gravity and the forgiveness timers.",
            "**Collision** moves a box through the tilemap one axis at a time and reports contacts: floor, wall, ceiling.",
            "**World** holds the room's tilemap, its entities (enemies, moving platforms, hazards) and the active checkpoint.",
            "**Camera** reads the player after each tick and follows with a dead zone and smoothing.",
            "**Presentation** draws the previous and current tick blended by alpha, and plays animation and effects."
          ]
        },
        {
          "type": "p",
          "text": "Data flows one way: input, then simulation (which calls collision), then camera, then render. Rendering never writes back into the simulation. That one rule is what makes replays, automated tests and exact tuning possible."
        },
        {
          "type": "h",
          "text": "Fixed timestep and render interpolation"
        },
        {
          "type": "p",
          "text": "Jump height must not depend on frame rate. With a variable `dt`, the integrator `y += v * dt` accumulates different error at 30, 60 and 144 fps, and a jump tuned to clear a 4-tile gap at 60 fps can fall short at 30. The fix is the fixed timestep from the game loop section: simulate in constant 1/60 s ticks (16.7 ms) and let the renderer run at any rate. An accumulator collects real time and the loop spends it in whole ticks. Clamp the accumulator to about 0.1 s so one long hitch cannot trigger a spiral of catch-up ticks."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "const float Dt = 1f / 60f;\nfloat acc;\n\nvoid Update() {\n  acc += Mathf.Min(Time.unscaledDeltaTime, 0.1f);  // clamp hitches\n  while (acc >= Dt) {\n    prev = curr;                                   // last tick's state\n    curr = Simulate(curr, input.Consume(), Dt);    // one 16.7 ms tick\n    acc -= Dt;\n  }\n  float alpha = acc / Dt;                          // 0..1 between ticks\n  sprite.position = Vector2.Lerp(prev.pos, curr.pos, alpha);\n}"
        },
        {
          "type": "p",
          "text": "The renderer then draws the state between the last two ticks. This costs up to one tick (16.7 ms) of display latency, and it removes the stutter you get when 60 Hz motion is shown on a 144 Hz display, where some frames would otherwise repeat the same position. Inside the tick, integrate with semi-implicit Euler: update velocity first, then move by the new velocity."
        },
        {
          "type": "h",
          "text": "Why a kinematic controller, not a rigidbody"
        },
        {
          "type": "p",
          "text": "A dynamic rigidbody moves because forces and impulses act on it. It has mass, friction, bounce and rotation, and a solver decides where it ends up. A platformer character is the opposite case. The designer wants to say 'run speed 90 px/s, reached in 6 ticks, apex 56 px', and get exactly that every time. Mario-style feel needs things a physics engine avoids: instant mid-air direction changes, different gravity going up and down, a wall jump that sets both velocities at once, and no sliding or being shoved by a crate. With a dynamic body you fight the solver for each of these, and the result depends on the physics step (Unity's default is 0.02 s) and the solver's iteration count."
        },
        {
          "type": "p",
          "text": "In a **kinematic controller** your code owns velocity and position, and collision only stops the box at solid tiles. The price is writing that collision yourself: roughly 200 to 400 lines for tile AABB tests, one-way platforms and moving platforms. That is a small price for code that is deterministic, cheap and easy to unit test. In Unity you can still keep a kinematic `Rigidbody2D` for triggers, or skip the physics engine and test directly against the tile array."
        },
        {
          "type": "h",
          "text": "Tilemap collision with AABB"
        },
        {
          "type": "p",
          "text": "The tile grid is already a spatial partition. The world is a 2D array of tile ids, 16 x 16 px each. A box with edges `left, right, top, bottom` can only touch columns `floor(left / 16)` to `floor((right - 1) / 16)` and the matching rows. A 14 x 24 px character spans at most 2 columns and 3 rows, so a collision query reads at most 6 array cells. There is no tree and no hash: the lookup is one multiply and one index per cell."
        },
        {
          "type": "figure",
          "id": "plat-tile-resolve",
          "caption": "Watch the two snaps: the box stops at the wall face after the X move, then at the floor face after the Y move.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 310\" role=\"img\" aria-label=\"A box moves diagonally toward a floor and wall corner on a tile grid. The collision code moves it along X until it touches the wall and snaps it, then moves it along Y until it touches the floor and snaps it. Four numbered steps on the right highlight in turn.\"><style>.plat-tile-resolve-t{font-size:13px;fill:var(--fig-ink)}.plat-tile-resolve-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.plat-tile-resolve-s{font-size:12px;fill:var(--fig-muted)}.plat-tile-resolve-c{text-anchor:middle}.plat-tile-resolve-e{text-anchor:end}.plat-tile-resolve-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.plat-tile-resolve-gr{fill:none;stroke:var(--fig-line);stroke-width:1}.plat-tile-resolve-sol{fill:var(--fig-ink);fill-opacity:.22;stroke:var(--fig-muted);stroke-width:1.5}.plat-tile-resolve-gh{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 4}.plat-tile-resolve-bx{fill:var(--fig-accent);fill-opacity:.85;stroke:var(--fig-ink);stroke-width:1.5;animation:plat-tile-resolve-kb 9s linear infinite}.plat-tile-resolve-hw{fill:var(--fig-bad);animation:plat-tile-resolve-kw 9s linear infinite}.plat-tile-resolve-hf{fill:var(--fig-bad);animation:plat-tile-resolve-kf 9s linear infinite}.plat-tile-resolve-s1{animation:plat-tile-resolve-a1 9s linear infinite}.plat-tile-resolve-s2{animation:plat-tile-resolve-a2 9s linear infinite}.plat-tile-resolve-s3{animation:plat-tile-resolve-a3 9s linear infinite}.plat-tile-resolve-s4{animation:plat-tile-resolve-a4 9s linear infinite}.plat-tile-resolve-sep{stroke:var(--fig-line);stroke-width:1.5}@keyframes plat-tile-resolve-kb{0%,5%{transform:translate(0px,0px);opacity:1}35%,45%{transform:translate(204px,0px)}75%,94%{transform:translate(204px,116px);opacity:1}97%{transform:translate(204px,116px);opacity:0}99.9%{transform:translate(0px,0px);opacity:0}100%{transform:translate(0px,0px);opacity:1}}@keyframes plat-tile-resolve-kw{0%,34%{opacity:0}36%,96%{opacity:1}97%,100%{opacity:0}}@keyframes plat-tile-resolve-kf{0%,74%{opacity:0}76%,96%{opacity:1}97%,100%{opacity:0}}@keyframes plat-tile-resolve-a1{0%,34%{opacity:1}38%,100%{opacity:.5}}@keyframes plat-tile-resolve-a2{0%,32%{opacity:.5}36%,46%{opacity:1}50%,100%{opacity:.5}}@keyframes plat-tile-resolve-a3{0%,44%{opacity:.5}48%,76%{opacity:1}80%,100%{opacity:.5}}@keyframes plat-tile-resolve-a4{0%,74%{opacity:.5}78%,92%{opacity:1}96%,100%{opacity:.5}}</style><text class=\"plat-tile-resolve-s\" x=\"40\" y=\"28\">One move: velocity right and down, into a corner</text><rect class=\"plat-tile-resolve-sol\" x=\"40\" y=\"232\" width=\"320\" height=\"32\"/><rect class=\"plat-tile-resolve-sol\" x=\"296\" y=\"104\" width=\"64\" height=\"128\"/><path class=\"plat-tile-resolve-gr\" d=\"M40 40V264M72 40V264M104 40V264M136 40V264M168 40V264M200 40V264M232 40V264M264 40V264M296 40V264M328 40V264M360 40V264M40 40H360M40 72H360M40 104H360M40 136H360M40 168H360M40 200H360M40 232H360M40 264H360\"/><rect class=\"plat-tile-resolve-gh\" x=\"64\" y=\"88\" width=\"28\" height=\"28\"/><text class=\"plat-tile-resolve-s plat-tile-resolve-c\" x=\"78\" y=\"80\">start</text><path class=\"plat-tile-resolve-gh\" d=\"M92 102H268M282 116V204\"/><rect class=\"plat-tile-resolve-gh\" x=\"268\" y=\"204\" width=\"28\" height=\"28\"/><rect class=\"plat-tile-resolve-hw\" x=\"293\" y=\"104\" width=\"4\" height=\"12\"/><rect class=\"plat-tile-resolve-hf\" x=\"268\" y=\"229\" width=\"28\" height=\"4\"/><rect class=\"plat-tile-resolve-bx\" x=\"64\" y=\"88\" width=\"28\" height=\"28\"/><text class=\"plat-tile-resolve-s\" x=\"40\" y=\"290\">tile = 16 px, drawn at 2x</text><text class=\"plat-tile-resolve-h\" x=\"392\" y=\"56\">Resolve one axis at a time</text><text class=\"plat-tile-resolve-t plat-tile-resolve-s1\" x=\"392\" y=\"88\">1  move X by vx * dt</text><text class=\"plat-tile-resolve-t plat-tile-resolve-s2\" x=\"392\" y=\"112\">2  hit: snap to wall, vx = 0</text><text class=\"plat-tile-resolve-t plat-tile-resolve-s3\" x=\"392\" y=\"136\">3  move Y by vy * dt</text><text class=\"plat-tile-resolve-t plat-tile-resolve-s4\" x=\"392\" y=\"160\">4  hit: snap to floor, vy = 0</text><text class=\"plat-tile-resolve-s\" x=\"392\" y=\"186\">grounded = hit while moving down</text><line class=\"plat-tile-resolve-sep\" x1=\"392\" y1=\"204\" x2=\"620\" y2=\"204\"/><text class=\"plat-tile-resolve-h\" x=\"392\" y=\"228\">Why not both at once?</text><text class=\"plat-tile-resolve-s\" x=\"392\" y=\"250\">A diagonal hit on a corner does</text><text class=\"plat-tile-resolve-s\" x=\"392\" y=\"268\">not say which face was struck.</text><text class=\"plat-tile-resolve-s\" x=\"392\" y=\"290\">Fast moves: sub-step at tile / 2</text></svg>"
        },
        {
          "type": "p",
          "text": "Move on X first and fix it, then move on Y and fix it. Each pass is one-dimensional: if the box overlaps a solid tile, snap its edge to the tile's edge and zero the velocity on that axis. There are no contact normals and no penetration-depth maths. The passes also answer the questions gameplay asks. A hit while moving down means the character is grounded. A hit while moving up is a head bump. A hit on X is a wall, which is what wall-slide needs. Resolving both axes at once cannot tell which face of a corner was struck, and the usual result is a character that sticks to walls."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "void MoveX(float amount) {\n  xRem += amount;                       // keep the sub-pixel remainder\n  int move = (int)MathF.Round(xRem);\n  xRem -= move;\n  int sign = Math.Sign(move);\n  while (move != 0) {                   // step 1 px at a time: no tunneling\n    if (map.Overlaps(box.Shifted(sign, 0))) { vel.x = 0; xRem = 0; break; }\n    box.x += sign; move -= sign;\n  }\n}\n// MoveY is the same on the other axis. A hit while moving down sets onGround."
        },
        {
          "type": "p",
          "text": "**Tunneling** happens when one tick moves the box farther than the geometry is thick, so the final position is already past the wall and no overlap is found. At 60 Hz a 240 px/s fall is 4 px per tick, and a 16 px tile cannot be skipped. A 480 px/s dash is 8 px per tick, still safe. A knockback at 2400 px/s is 40 px per tick and can skip a whole tile. The cheap fix is the loop above: step one pixel (or at most half a tile) at a time and test after every step. A swept test against tiles expanded by the box size gives the same answer in fewer queries, at the cost of more code. Unity's `BoxCast` sweeps for you at the price of a physics query."
        },
        {
          "type": "list",
          "items": [
            "**One-way platforms.** Solid only when the box is moving down (or still) and its bottom edge was at or above the platform's top on the previous tick. Jumping up through it, or pressing down to drop, skips the test.",
            "**Slopes.** Treat a slope tile as a height function. While grounded, sample the surface under the box's centre and place the feet on it. Going downhill, snap down by a few pixels so the character does not hop off every step. Integer height tables for 45 degree slopes are the robust option; arbitrary angles multiply the edge cases.",
            "**Moving platforms.** Move the platform first, then move each rider by the same delta through the normal `MoveX` and `MoveY`, so a rider is stopped by walls instead of being carried into them."
          ]
        },
        {
          "type": "h",
          "text": "Deriving the jump from designer values"
        },
        {
          "type": "p",
          "text": "Designers think in heights and times, not in gravity. 'The jump peaks at 3.5 tiles after 0.35 s.' Derive the engine values from that. Under constant gravity the rising speed falls linearly from `v0` to 0 at the apex, so `v0 = g * t`. The distance covered is the average speed times the time, `h = (v0 / 2) * t`. Solve the pair: **g = 2h / t²** and **v0 = 2h / t**. With h = 56 px and t = 0.35 s, g is about 914 px/s² and v0 is 320 px/s. Change the designer's numbers and the physics follows; nobody hunts for a magic `-9.81`."
        },
        {
          "type": "p",
          "text": "The 60 Hz integrator lands a few pixels under the analytic apex (about 53 px here), because each tick uses the new velocity for a whole step. Treat the equations as the starting point and tune the final value by playing. What matters is that the tuning knobs are the height and time the level designer already reasons about."
        },
        {
          "type": "h",
          "text": "Variable height, fall speed and apex hang"
        },
        {
          "type": "p",
          "text": "A tap should hop and a hold should leap. When the button is released while the character is still rising, cut the upward velocity (multiply by 0.5). Height scales with v², so releasing on the first tick leaves `(v0 / 2)² / 2g = h / 4`: a 14 px hop against a 56 px jump. The alternatives are extra gravity while the button is up, which is smoother but makes the peak less predictable, and a minimum hold time, which adds input latency."
        },
        {
          "type": "p",
          "text": "Two more tweaks shape the arc. A **fall gravity multiplier** of 1.5 to 2 makes the way down faster than the way up: at 1.6x the fall from the apex takes 0.28 s against 0.35 s rising, which reads as snappy instead of floaty. **Apex hang** halves gravity while the button is held and `|vy|` is below about 40 px/s, which adds roughly 70 ms of airtime at the top (with the 1.6x fall gravity) for precise landings. Cap the fall speed (for example 360 px/s) so the character stays readable and the tunneling bound above holds."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "float g  = 2f * h / (t * t);              // h = 56 px, t = 0.35 s -> 914\nfloat v0 = 2f * h / t;                    // 320 px/s\n\nif (intent.jumpReleased && vel.y > 0) vel.y *= 0.5f;   // variable height\n\nfloat scale = vel.y < 0 ? 1.6f : 1f;                   // heavier fall\nif (intent.jumpHeld && Mathf.Abs(vel.y) < 40f) scale *= 0.5f;  // apex hang\nvel.y = Mathf.Max(vel.y - g * scale * dt, -maxFall);   // maxFall = 360"
        },
        {
          "type": "figure",
          "id": "plat-jump-arc",
          "caption": "Left: the same launch speed gives a full hop when held and about a quarter of the height when tapped. Right: the jump pressed inside the coyote window still launches.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Two panels. Left: a full jump arc when the button is held and a much lower short hop when it is released early. Right: a character runs off a ledge, a 0.1 second coyote window follows the edge, and a jump pressed inside it still launches and lands on the next platform.\"><style>.plat-jump-arc-t{font-size:13px;fill:var(--fig-ink)}.plat-jump-arc-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.plat-jump-arc-s{font-size:12px;fill:var(--fig-muted)}.plat-jump-arc-c{text-anchor:middle}.plat-jump-arc-e{text-anchor:end}.plat-jump-arc-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.plat-jump-arc-g{stroke:var(--fig-ink);stroke-width:2}.plat-jump-arc-sol{fill:var(--fig-ink);fill-opacity:.15;stroke:var(--fig-line);stroke-width:1.5}.plat-jump-arc-pa{fill:none;stroke:var(--fig-accent);stroke-width:2;stroke-opacity:.55;stroke-dasharray:5 5}.plat-jump-arc-pb{fill:none;stroke:var(--fig-accent2);stroke-width:2;stroke-opacity:.7;stroke-dasharray:5 5}.plat-jump-arc-win{fill:var(--fig-warn);fill-opacity:.2;stroke:var(--fig-warn);stroke-width:1.5;stroke-dasharray:4 4}.plat-jump-arc-mk{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:3 4}.plat-jump-arc-la{stroke:var(--fig-accent);stroke-width:2.5}.plat-jump-arc-lb{stroke:var(--fig-accent2);stroke-width:2.5}.plat-jump-arc-d1{transform:translate(150px,144px);fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:plat-jump-arc-k1 7s linear infinite}.plat-jump-arc-d2{transform:translate(110px,219px);fill:var(--fig-accent2);stroke:var(--fig-bg);stroke-width:2;animation:plat-jump-arc-k2 7s linear infinite}.plat-jump-arc-d3{transform:translate(520px,147.5px);fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2;animation:plat-jump-arc-k3 7s linear infinite}@keyframes plat-jump-arc-k1{0%{transform:translate(70px,244px);opacity:1}2.5%{transform:translate(80px,220.6px)}5%{transform:translate(90px,200.3px)}7.5%{transform:translate(100px,183.1px)}10%{transform:translate(110px,169px)}12.5%{transform:translate(120px,158.1px)}15%{transform:translate(130px,150.3px)}17.5%{transform:translate(140px,145.6px)}20%{transform:translate(150px,144px)}22.5%{transform:translate(160px,145.6px)}25%{transform:translate(170px,150.3px)}27.5%{transform:translate(180px,158.1px)}30%{transform:translate(190px,169px)}32.5%{transform:translate(200px,183.1px)}35%{transform:translate(210px,200.3px)}37.5%{transform:translate(220px,220.6px)}40%{transform:translate(230px,244px)}94%{transform:translate(230px,244px);opacity:1}97%,100%{transform:translate(230px,244px);opacity:0}}@keyframes plat-jump-arc-k2{0%,50%{transform:translate(70px,244px);opacity:1}52.5%{transform:translate(80px,233.1px)}55%{transform:translate(90px,225.3px)}57.5%{transform:translate(100px,220.6px)}60%{transform:translate(110px,219px)}62.5%{transform:translate(120px,220.6px)}65%{transform:translate(130px,225.3px)}67.5%{transform:translate(140px,233.1px)}70%{transform:translate(150px,244px)}94%{transform:translate(150px,244px);opacity:1}97%,100%{transform:translate(150px,244px);opacity:0}}@keyframes plat-jump-arc-k3{0%{transform:translate(360px,204px);opacity:1}30%{transform:translate(440px,204px)}31.8%{transform:translate(447px,204.6px)}33.5%{transform:translate(454px,206.5px)}35.3%{transform:translate(461px,209.6px)}37%{transform:translate(468px,214px)}39.4%{transform:translate(475.4px,197px)}41.7%{transform:translate(482.9px,182.4px)}44.1%{transform:translate(490.3px,170.4px)}46.4%{transform:translate(497.7px,160.9px)}48.8%{transform:translate(505.1px,153.9px)}51.1%{transform:translate(512.6px,149.5px)}53.5%{transform:translate(520px,147.5px)}55.9%{transform:translate(527.4px,148px)}58.2%{transform:translate(534.9px,151.1px)}60.6%{transform:translate(542.3px,156.7px)}62.9%{transform:translate(549.7px,164.7px)}65.3%{transform:translate(557.1px,175.3px)}67.6%{transform:translate(564.6px,188.4px)}70%{transform:translate(572px,204px)}94%{transform:translate(572px,204px);opacity:1}97%,100%{transform:translate(572px,204px);opacity:0}}</style><rect class=\"plat-jump-arc-b\" x=\"16\" y=\"16\" width=\"296\" height=\"268\" rx=\"14\"/><rect class=\"plat-jump-arc-b\" x=\"328\" y=\"16\" width=\"296\" height=\"268\" rx=\"14\"/><text class=\"plat-jump-arc-h\" x=\"32\" y=\"42\">Variable jump height</text><text class=\"plat-jump-arc-s\" x=\"32\" y=\"62\">release early: vy *= 0.5</text><line class=\"plat-jump-arc-g\" x1=\"32\" y1=\"250\" x2=\"296\" y2=\"250\"/><path class=\"plat-jump-arc-pa\" d=\"M70 244 Q150 44 230 244\"/><path class=\"plat-jump-arc-pb\" d=\"M70 244 Q110 194 150 244\"/><text class=\"plat-jump-arc-s plat-jump-arc-c\" x=\"150\" y=\"130\">apex h</text><line class=\"plat-jump-arc-la\" x1=\"32\" y1=\"270\" x2=\"50\" y2=\"270\"/><text class=\"plat-jump-arc-s\" x=\"56\" y=\"274\">hold: full hop</text><line class=\"plat-jump-arc-lb\" x1=\"170\" y1=\"270\" x2=\"188\" y2=\"270\"/><text class=\"plat-jump-arc-s\" x=\"194\" y=\"274\">tap: h / 4</text><circle class=\"plat-jump-arc-d1\" cx=\"0\" cy=\"0\" r=\"6\"/><circle class=\"plat-jump-arc-d2\" cx=\"0\" cy=\"0\" r=\"6\"/><text class=\"plat-jump-arc-h\" x=\"344\" y=\"42\">Coyote time</text><text class=\"plat-jump-arc-s\" x=\"344\" y=\"62\">jump allowed ~0.1 s past the edge</text><rect class=\"plat-jump-arc-win\" x=\"440\" y=\"96\" width=\"36\" height=\"114\"/><text class=\"plat-jump-arc-s plat-jump-arc-c\" x=\"458\" y=\"88\">coyote</text><text class=\"plat-jump-arc-s plat-jump-arc-c\" x=\"458\" y=\"112\">0.1 s</text><rect class=\"plat-jump-arc-sol\" x=\"344\" y=\"210\" width=\"96\" height=\"48\"/><rect class=\"plat-jump-arc-sol\" x=\"556\" y=\"210\" width=\"56\" height=\"48\"/><line class=\"plat-jump-arc-mk\" x1=\"468\" y1=\"222\" x2=\"468\" y2=\"262\"/><path class=\"plat-jump-arc-pb\" d=\"M360 204 L440 204 Q452 204 468 214 Q520 86 572 204\"/><text class=\"plat-jump-arc-s plat-jump-arc-e\" x=\"440\" y=\"276\">edge</text><text class=\"plat-jump-arc-s\" x=\"462\" y=\"276\">jump pressed</text><circle class=\"plat-jump-arc-d3\" cx=\"0\" cy=\"0\" r=\"6\"/></svg>"
        },
        {
          "type": "h",
          "text": "Forgiveness: coyote time, buffering, corner correction"
        },
        {
          "type": "p",
          "text": "Humans press jump a few frames early or late, and the game should treat both as correct. **Coyote time**: after the character walks off a ledge, jump stays legal for about 0.1 s (6 ticks). **Jump buffering**: a press up to about 0.1 s before landing is remembered and fires at touchdown. Both are countdown timers, and a jump fires when both are positive. Typical windows sit between 0.05 and 0.15 s: shorter is not felt, longer starts to look like jumping in mid-air."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "coyote = (onGround && vel.y <= 0) ? 0.1f : coyote - dt;   // refill on ground\nbuffer = intent.jumpPressed ? 0.1f : buffer - dt;           // remember a press\n\nif (buffer > 0 && coyote > 0) {\n  vel.y = v0;\n  coyote = buffer = 0;      // consume both, or one press can jump twice\n}"
        },
        {
          "type": "p",
          "text": "**Corner correction** fixes the most irritating failure: jumping straight at a platform and clipping its corner by a pixel. If the head hits a ceiling tile but only the outer 3 or 4 px of the box overlap it, nudge the character sideways by that amount and continue the move instead of stopping. Applied to the feet, the same trick lets a jump land on a ledge's lip. None of these three change what the game looks like. They change which inputs count, and they cost a few lines each."
        },
        {
          "type": "h",
          "text": "The player state machine"
        },
        {
          "type": "list",
          "items": [
            "**Idle and run.** Horizontal speed accelerates toward the stick direction (for example 90 px/s reached in 6 ticks) and slows faster on the ground than in the air. Many teams treat idle and run as one state with an animation switch.",
            "**Jump and fall.** Jump is rising with the release cut; fall is descending with the heavier gravity. Both use reduced air acceleration and read the coyote and buffer timers.",
            "**Wall-slide.** Entered when airborne, falling and pushing into a wall. Fall speed is clamped (about 40 px/s) and a wall jump sets velocity on both axes at once.",
            "**Dash.** A fixed velocity for 0.15 s (for example 320 px/s, so 48 px or 3 tiles), gravity off, input ignored, then back to fall. One charge, restored on the ground."
          ]
        },
        {
          "type": "p",
          "text": "Each state is a small class or function with `Enter`, `Update` and `Exit`. Transitions are checked after the tick's movement from facts collision reported (`onGround`, `wallDir`), never from animation frames. One state at a time means a combination such as dashing while wall-sliding cannot exist by accident."
        },
        {
          "type": "h",
          "text": "The camera"
        },
        {
          "type": "p",
          "text": "The camera is a second small simulation, and each rule answers a specific complaint from playtesters."
        },
        {
          "type": "list",
          "items": [
            "**Dead zone.** A window around the camera centre (here 80 px wide). Focus movement inside it is ignored, so small steps do not shake the screen.",
            "**Look-ahead.** The focus is the player plus about 30 px in the facing direction, so the screen shows more of where the player is heading.",
            "**Vertical snap.** Follow vertically only when grounded, and snap to the current platform's height. Following every jump makes the screen heave at each hop.",
            "**Smoothing.** Move toward the target with exponential decay, `1 - exp(-k * dt)`, with k about 6 to 8. It does not depend on frame rate and cannot overshoot."
          ]
        },
        {
          "type": "figure",
          "id": "plat-camera",
          "caption": "The viewport holds still while the focus diamond is inside the dead zone, then eases after it; turning around flips the look-ahead.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A side view of a ground strip with a camera viewport rectangle and a dashed dead zone inside it. A player circle runs right, then left. A focus diamond leads the player by 30 pixels in the facing direction. The viewport stays still while the focus is inside the dead zone and then eases after it.\"><style>.plat-camera-t{font-size:13px;fill:var(--fig-ink)}.plat-camera-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.plat-camera-s{font-size:12px;fill:var(--fig-muted)}.plat-camera-c{text-anchor:middle}.plat-camera-e{text-anchor:end}.plat-camera-b{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.plat-camera-gr{fill:var(--fig-ink);fill-opacity:.15;stroke:var(--fig-ink);stroke-width:2}.plat-camera-vp{fill:var(--fig-accent);fill-opacity:.06;stroke:var(--fig-accent);stroke-width:2.5}.plat-camera-dz{fill:var(--fig-accent2);fill-opacity:.18;stroke:var(--fig-accent2);stroke-width:1.5;stroke-dasharray:5 4}.plat-camera-pl{fill:var(--fig-ink);stroke:var(--fig-bg);stroke-width:2}.plat-camera-fc{fill:var(--fig-warn);stroke:var(--fig-bg);stroke-width:1.5}.plat-camera-all{animation:plat-camera-ko 8s linear infinite}.plat-camera-cm{transform:translateX(80px);animation:plat-camera-kc 8s linear infinite}.plat-camera-pp{transform:translateX(170px);animation:plat-camera-kp 8s linear infinite}.plat-camera-ff{transform:translateX(200px);animation:plat-camera-kf 8s linear infinite}@keyframes plat-camera-ko{0%,94%{opacity:1}97%,100%{opacity:0}}@keyframes plat-camera-kc{0%{transform:translateX(80px)}2.5%{transform:translateX(80px)}5%{transform:translateX(80px)}7.5%{transform:translateX(80px)}10%{transform:translateX(80px)}12.5%{transform:translateX(84px)}15%{transform:translateX(98px)}17.5%{transform:translateX(117px)}20%{transform:translateX(136px)}22.5%{transform:translateX(156px)}25%{transform:translateX(176px)}27.5%{transform:translateX(196px)}30%{transform:translateX(216px)}32.5%{transform:translateX(236px)}35%{transform:translateX(256px)}37.5%{transform:translateX(276px)}40%{transform:translateX(296px)}42.5%{transform:translateX(316px)}45%{transform:translateX(332px)}47.5%{transform:translateX(338px)}50%{transform:translateX(339px)}52.5%{transform:translateX(340px)}55%{transform:translateX(340px)}57.5%{transform:translateX(340px)}60%{transform:translateX(336px)}62.5%{transform:translateX(322px)}65%{transform:translateX(303px)}67.5%{transform:translateX(284px)}70%{transform:translateX(264px)}72.5%{transform:translateX(244px)}75%{transform:translateX(224px)}77.5%{transform:translateX(204px)}80%{transform:translateX(184px)}82.5%{transform:translateX(164px)}85%{transform:translateX(144px)}87.5%{transform:translateX(124px)}90%{transform:translateX(114px)}92.5%{transform:translateX(111px)}95%{transform:translateX(110px)}97.5%{transform:translateX(110px)}100%{transform:translateX(110px)}}@keyframes plat-camera-kp{0%{transform:translateX(170px)}2.5%{transform:translateX(170px)}5%{transform:translateX(170px)}7.5%{transform:translateX(182px)}10%{transform:translateX(202px)}12.5%{transform:translateX(222px)}15%{transform:translateX(242px)}17.5%{transform:translateX(262px)}20%{transform:translateX(282px)}22.5%{transform:translateX(302px)}25%{transform:translateX(322px)}27.5%{transform:translateX(342px)}30%{transform:translateX(362px)}32.5%{transform:translateX(382px)}35%{transform:translateX(402px)}37.5%{transform:translateX(422px)}40%{transform:translateX(442px)}42.5%{transform:translateX(462px)}45%{transform:translateX(470px)}47.5%{transform:translateX(470px)}50%{transform:translateX(470px)}52.5%{transform:translateX(470px)}55%{transform:translateX(470px)}57.5%{transform:translateX(458px)}60%{transform:translateX(438px)}62.5%{transform:translateX(418px)}65%{transform:translateX(398px)}67.5%{transform:translateX(378px)}70%{transform:translateX(358px)}72.5%{transform:translateX(338px)}75%{transform:translateX(318px)}77.5%{transform:translateX(298px)}80%{transform:translateX(278px)}82.5%{transform:translateX(258px)}85%{transform:translateX(238px)}87.5%{transform:translateX(220px)}90%{transform:translateX(220px)}92.5%{transform:translateX(220px)}95%{transform:translateX(220px)}97.5%{transform:translateX(220px)}100%{transform:translateX(220px)}}@keyframes plat-camera-kf{0%{transform:translateX(200px)}2.5%{transform:translateX(200px)}5%{transform:translateX(200px)}7.5%{transform:translateX(212px)}10%{transform:translateX(232px)}12.5%{transform:translateX(252px)}15%{transform:translateX(272px)}17.5%{transform:translateX(292px)}20%{transform:translateX(312px)}22.5%{transform:translateX(332px)}25%{transform:translateX(352px)}27.5%{transform:translateX(372px)}30%{transform:translateX(392px)}32.5%{transform:translateX(412px)}35%{transform:translateX(432px)}37.5%{transform:translateX(452px)}40%{transform:translateX(472px)}42.5%{transform:translateX(492px)}45%{transform:translateX(500px)}47.5%{transform:translateX(500px)}50%{transform:translateX(500px)}52.5%{transform:translateX(500px)}55%{transform:translateX(500px)}57.5%{transform:translateX(428px)}60%{transform:translateX(408px)}62.5%{transform:translateX(388px)}65%{transform:translateX(368px)}67.5%{transform:translateX(348px)}70%{transform:translateX(328px)}72.5%{transform:translateX(308px)}75%{transform:translateX(288px)}77.5%{transform:translateX(268px)}80%{transform:translateX(248px)}82.5%{transform:translateX(228px)}85%{transform:translateX(208px)}87.5%{transform:translateX(190px)}90%{transform:translateX(190px)}92.5%{transform:translateX(190px)}95%{transform:translateX(190px)}97.5%{transform:translateX(190px)}100%{transform:translateX(190px)}}</style><text class=\"plat-camera-s\" x=\"24\" y=\"30\">The camera moves only when the focus leaves the dead zone</text><rect class=\"plat-camera-gr\" x=\"16\" y=\"214\" width=\"608\" height=\"24\"/><g class=\"plat-camera-all\"><g class=\"plat-camera-cm\"><rect class=\"plat-camera-vp\" x=\"0\" y=\"56\" width=\"240\" height=\"176\" rx=\"6\"/><rect class=\"plat-camera-dz\" x=\"80\" y=\"100\" width=\"80\" height=\"114\"/></g><circle class=\"plat-camera-pl plat-camera-pp\" cx=\"0\" cy=\"204\" r=\"10\"/><polygon class=\"plat-camera-fc plat-camera-ff\" points=\"0,197 7,204 0,211 -7,204\"/></g><circle class=\"plat-camera-pl\" cx=\"30\" cy=\"276\" r=\"7\"/><text class=\"plat-camera-s\" x=\"44\" y=\"280\">player</text><polygon class=\"plat-camera-fc\" points=\"110,269 117,276 110,283 103,276\"/><text class=\"plat-camera-s\" x=\"124\" y=\"280\">focus: player + 30 px ahead</text><rect class=\"plat-camera-dz\" x=\"322\" y=\"269\" width=\"16\" height=\"14\"/><text class=\"plat-camera-s\" x=\"344\" y=\"280\">dead zone, 80 px</text><rect class=\"plat-camera-vp\" x=\"466\" y=\"269\" width=\"16\" height=\"14\"/><text class=\"plat-camera-s\" x=\"488\" y=\"280\">viewport</text></svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "Vector2 focus = player.pos + new Vector2(facing * 30f, 0);\nfloat dx = focus.x - cam.x;\nif (Mathf.Abs(dx) > 40f) target.x = focus.x - Mathf.Sign(dx) * 40f;  // dead zone\nif (player.grounded) target.y = player.platformY;                    // vertical snap\ncam = Vector2.Lerp(cam, target, 1f - Mathf.Exp(-6f * dt));           // frame-rate safe"
        },
        {
          "type": "p",
          "text": "Update the camera after the tick, using the same interpolated position the sprite uses, or the camera and sprite jitter against each other. Pixel-art games also round the final camera position to whole pixels of the render target."
        },
        {
          "type": "h",
          "text": "Levels, enemies and input"
        },
        {
          "type": "p",
          "text": "A level is a set of rooms. A room is a tilemap (for example 40 x 22 tiles, which is 640 x 352 px at 16 px per tile and 880 bytes at one byte per tile) plus a list of entities with positions and properties. Tile ids index a tileset: empty, solid, one-way, slope, spike. A **checkpoint** stores a room id and a spawn point. Death reloads the room from authored data instead of patching live state, and respawn should take well under a second, because players will die many times."
        },
        {
          "type": "p",
          "text": "Enemies reuse the player's collision code and run small state machines. A patroller walks at constant speed, turns when the tile ahead of its front foot is empty or the tile in front is solid, pauses in **Idle** for about 0.5 s, then walks again. A chaser adds a **Notice** state when the player enters a radius. Reuse means one collision system to debug, and enemies obey one-way and moving platforms for free. Damage tests are overlaps against hitboxes a few pixels smaller than the sprite, which feels fair."
        },
        {
          "type": "p",
          "text": "Input goes through a rebinding layer and produces one `Intent` per tick: move axis, jump pressed, held and released, dash pressed. Analog sticks get a dead zone of about 0.2. Presses are latched in the frame loop and cleared when a tick consumes them, so a tap that starts and ends between two ticks is not lost."
        },
        {
          "type": "h",
          "text": "Decisions and why they work"
        },
        {
          "type": "list",
          "items": [
            "**Fixed 60 Hz tick with interpolation.** The same jump on every device, and replays and tests are exact. Variable `dt` makes jump heights and gap clearances depend on hardware. The cost is up to one tick of display latency.",
            "**Kinematic controller with your own collision.** Direct control of every velocity. A dynamic rigidbody fights you over mass, friction, bounce and solver steps.",
            "**Per-axis, pixel-stepped tile collision.** Contacts are unambiguous, nothing tunnels at platformer speeds, and it is easy to debug. Swept collision against arbitrary shapes handles any geometry but costs far more code and edge cases.",
            "**Jump derived from height and time.** Designers edit numbers they can see on the level grid. Hand-tuned gravity and impulse values break whenever a gap in the level changes.",
            "**Forgiveness windows.** Coyote time, buffering and corner nudges cost a few lines each and turn near misses into hits. Strict windows read as an unfair game.",
            "**A state machine instead of flags.** Exactly one state at a time. A pile of booleans such as `isJumping` and `isDashing` multiplies impossible combinations.",
            "**Camera as its own smoothed system.** Parenting the camera to the player copies every small step and every hop onto the screen.",
            "**Rooms rebuilt from data on death.** Resets are deterministic. Patching entity state back by hand leaks bugs between attempts."
          ]
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Do not drive gameplay from `Time.deltaTime`, and do not read button events inside `FixedUpdate`. Both are works-on-my-machine bugs: jump heights differ between a 60 Hz and a 144 Hz monitor, and presses vanish or repeat when a frame runs zero or two ticks. Latch input in `Update`, consume it in the tick, and test at several frame rates by forcing `Application.targetFrameRate`."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents are good at the mechanical parts: the tile array, the per-axis collision pass, state-machine boilerplate, unit tests and a room editor. Give them the numbers (tile size, tick rate, h and t) and ask for pure functions with no engine types, so tests run headless. Verify what they cannot feel. Ask for tests such as 'a held jump with h = 56 peaks within 4 px of it, a tap peaks near 14', 'a 40 px move never ends inside a wall' and 'a press 5 ticks before landing fires, 8 ticks does not'. Then play it yourself. Passing tests do not prove the feel is right, and an agent that 'simplifies' the fixed step into `deltaTime` has broken the game."
        },
        {
          "type": "h",
          "text": "Reading the symptoms"
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Testers say a jump pressed just before landing does nothing and the game eats inputs",
              "use": "Add a 0.1 s jump buffer",
              "why": "Remember the press for about 0.1 s and fire the jump on the tick the character lands. Humans mistime by a few frames, and the buffer converts that error into the jump they meant."
            },
            {
              "signal": "Players say they pressed jump at the ledge but fell; the press came a few frames after leaving it",
              "use": "Add 0.1 s of coyote time",
              "why": "Start a timer when the ground is lost without a jump, and allow a jump while it is positive. Clear it on takeoff so one press cannot jump twice."
            },
            {
              "signal": "A jump straight up clips a ceiling or platform corner by 1 to 3 px and the player bonks",
              "use": "Nudge sideways with corner correction",
              "why": "If only the outer few pixels of the box overlap the corner, shift the box sideways and continue the move. It removes a frustrating failure without changing level geometry."
            },
            {
              "signal": "Jump height or gap clearance differs between a 60 Hz and a 144 Hz machine",
              "use": "Run gameplay on a fixed timestep",
              "why": "Variable dt changes integration error and tick-order effects. Simulate in constant 1/60 s ticks and keep rendering separate."
            },
            {
              "signal": "Motion hitches on a 144 Hz display while the 60 Hz simulation is correct",
              "use": "Interpolate between previous and current tick",
              "why": "At 144 fps some frames get no new tick and repeat a position. Drawing Lerp(prev, curr, alpha) fills them in, for up to one tick of extra latency."
            },
            {
              "signal": "A dash or knockback passes through a thin wall at high speed",
              "use": "Step the move in sub-steps of half a tile",
              "why": "Testing only the final position skips geometry thinner than the per-tick displacement. Stepping 1 px, or at most half a tile, and testing after each step cannot skip it."
            },
            {
              "signal": "A designer asks for 'a jump 4 tiles high that peaks in 0.4 s'",
              "use": "Derive g and v0 from height and time",
              "why": "From h = v0 t / 2 and v0 = g t you get g = 2h / t² and v0 = 2h / t. Designers keep editing readable numbers and the physics follows."
            },
            {
              "signal": "The screen shakes with every small step and heaves with every hop",
              "use": "Add a dead zone and grounded-only vertical follow",
              "why": "Ignore focus movement inside a window around the camera and follow vertically only when grounded. The camera then moves for real changes in position, not for noise."
            }
          ]
        }
      ],
      "keyPoints": [
        "Simulate at a fixed 60 Hz and render interpolated between the last two ticks, so jump height never depends on frame rate or display.",
        "A kinematic controller owns velocity and position; collision only stops it. That gives exact, deterministic feel that a dynamic rigidbody fights.",
        "Resolve tile collision one axis at a time and step in sub-steps of at most half a tile: contacts are unambiguous and fast moves cannot tunnel.",
        "Derive jump physics from designer values: g = 2h / t² and v0 = 2h / t. Add a velocity cut on release, heavier fall gravity and a short apex hang.",
        "Coyote time and jump buffering (about 0.1 s each) plus corner correction turn near misses into hits. Consume both timers when the jump fires.",
        "The camera is a smoothed system: dead zone, look-ahead, grounded-only vertical snap and exponential decay with `1 - exp(-k * dt)`."
      ],
      "quiz": [
        {
          "q": "A designer asks for a jump that peaks 48 px high after 0.3 s. Which gravity and launch speed does that give?",
          "options": [
            "g = 533 px/s², v0 = 160 px/s",
            "g = 1067 px/s², v0 = 160 px/s",
            "g = 1067 px/s², v0 = 320 px/s",
            "g = 160 px/s², v0 = 533 px/s"
          ],
          "answer": 2,
          "explain": "From h = (v0 / 2) t and v0 = g t you get g = 2h / t² = 96 / 0.09 = 1067 and v0 = 2h / t = 96 / 0.3 = 320. The first option forgets the factor of 2 in both formulas. The second mixes a correct g with that half-size v0, which would peak at only 12 px. The fourth swaps the two values."
        },
        {
          "q": "Why does the controller move and resolve the X axis completely before it moves on Y?",
          "options": [
            "Each pass is one-dimensional, so the face that was hit is unambiguous",
            "It lets the box skip tiles that it would overlap at high speed",
            "It removes the need for a grounded flag because gravity handles the floor",
            "Tile maps cannot store collision data for diagonal movement at all"
          ],
          "answer": 0,
          "explain": "A single-axis pass needs only a snap to the tile edge and a zero velocity, and the axis tells you what was hit: down is floor, up is ceiling, sideways is wall. It does not prevent tunneling (that needs sub-steps), it does not replace the grounded flag (a downward hit sets it), and tile maps can represent any move; the issue is ambiguity at corners, not storage."
        },
        {
          "q": "The jump code multiplies upward velocity by 0.5 when the button is released. If the player releases on the first tick, how high is the hop compared with a full jump?",
          "options": [
            "About half as high, because the speed is halved",
            "About one eighth as high, because gravity also doubles",
            "No hop at all, because the cut cancels the launch",
            "About a quarter, because height goes with v squared"
          ],
          "answer": 3,
          "explain": "Rise height is v² / 2g. Halving v leaves one quarter of the height, so a 56 px jump becomes about 14 px. Half height would hold only if height were linear in speed. Gravity is unchanged by the cut, so there is no eighth. The character still moves up at half speed, so it does hop."
        },
        {
          "q": "A camera smooths with `cam = Lerp(cam, target, 0.1f)` each frame and trails by different amounts at 30 and 144 fps. What is the fix?",
          "options": [
            "Multiply by Time.deltaTime and clamp the result between 0 and 1",
            "Blend by `1 - Mathf.Exp(-k * dt)` using each frame's dt",
            "Move the camera into FixedUpdate and keep the 0.1 constant",
            "Cap the frame rate at 60 and keep the constant"
          ],
          "answer": 1,
          "explain": "The exponential form removes the same fraction of the remaining distance per second at any frame rate, and it cannot overshoot. Multiplying by deltaTime is only a first-order approximation and misbehaves on long frames. A camera in FixedUpdate jitters against an interpolated sprite. Capping the frame rate hides the bug on one device and leaves it on others."
        },
        {
          "q": "The simulation ticks at 60 Hz and the display runs at 144 Hz. Jump height is right but motion visibly hitches. What is the standard fix?",
          "options": [
            "Raise the tick rate to 144 Hz so every frame gets its own tick",
            "Multiply movement by Time.deltaTime inside the simulation",
            "Draw Lerp(prev, curr, alpha) using the leftover accumulator time",
            "Turn vsync off so frames are not repeated"
          ],
          "answer": 2,
          "explain": "Interpolating between the last two ticks gives every frame a distinct position for about one tick of extra latency, at any refresh rate. Raising the tick rate costs more simulation, changes every timer that counts ticks (coyote, buffer), shifts the tuned feel and still fails at 240 Hz. Variable dt in the simulation is exactly what breaks jump height. Turning vsync off adds tearing and does not change repeated positions."
        },
        {
          "q": "Testers on a patch build say jumps pressed just before landing are ignored. Coyote time already exists. What is the right move?",
          "options": [
            "Raise the coyote window from 0.1 s to 0.3 s so presses count longer",
            "Remember the press for about 0.1 s and fire the jump at landing",
            "Increase jump height so players land later and have more time",
            "Poll the jump button twice per frame to catch fast presses"
          ],
          "answer": 1,
          "explain": "The failure is an early press, which is what jump buffering fixes: store the press and fire when grounded. Coyote time covers late presses after leaving a ledge, so widening it does nothing here and 0.3 s would feel like jumping from air. Higher jumps do not change the timing error, and polling more often cannot recover a press that happened before the character landed."
        }
      ]
    },
    {
      "id": "case-kart-racer",
      "title": "Case study: Kart racer",
      "minutes": 18,
      "summary": "How an arcade kart racer is built, from raycast suspension and spline-based race progress to AI, items, split-screen and online prediction, and why each choice keeps the game fun and fair.",
      "lesson": [
        {
          "type": "p",
          "text": "Eight karts leave the grid on a 1.8 km track. Lap one is clean. On lap two a player cuts across a grass strip, falls off the edge, and respawns 300 m further along the track than where they left it. A second player finishes in 3rd on their screen and 5th on the server's. A third reports that the last-place kart \"cheats\" by catching up on every straight. None of these are rendering bugs. A kart racer is a small set of systems (suspension, track data, AI, items, camera, netcode) that each make a deliberate trade between realism and fun, and each fails in a specific way. This teardown walks through them in the order data flows."
        },
        {
          "type": "h",
          "text": "Components"
        },
        {
          "type": "p",
          "text": "Every fixed tick (50 or 60 Hz) input becomes forces on a rigid body. The body's position is projected onto a track spline to get progress, progress sorts the karts into positions, and positions feed back into AI speed and item odds. Cameras and the network read the result; they never drive it."
        },
        {
          "type": "list",
          "items": [
            "**Vehicle physics.** One rigid body, four raycasts, forces for suspension, grip, drive and drift. Runs in `FixedUpdate`.",
            "**Track data.** A closed spline centerline, per-point width and banking, ordered checkpoints, a kill plane below the track.",
            "**Race state.** Progress per kart, lap count, finish order, wrong-way flag, respawn requests.",
            "**AI drivers.** Produce the same input struct a human does: steer, throttle, drift, item. They get no special physics.",
            "**Items.** Position-weighted rolls, plus projectiles that follow the spline.",
            "**Camera and view.** One spring-arm camera per local player, split-screen viewports.",
            "**Network layer.** Input upload, authoritative server state, prediction for the local kart, interpolation for the rest."
          ]
        },
        {
          "type": "h",
          "text": "Arcade physics, not simulation"
        },
        {
          "type": "p",
          "text": "A simulation kart models tyre slip curves, weight transfer and a drivetrain. It is accurate and hard to drive: small steering errors at the limit cause spins. An arcade kart is a single rigid body with a low centre of mass and four **raycast wheels**. Each wheel casts a ray down from a mount point, and if it hits the ground the code applies a spring force, a lateral grip force and (on driven wheels) a drive force at the contact point. There are no wheel colliders to tune, the handling is a handful of numbers a designer can read, and the cost is four raycasts per kart per tick."
        },
        {
          "type": "figure",
          "id": "kart-suspension-bump",
          "caption": "Over the bump the front spring compresses and pushes harder, the rear spring extends, and the body rises and pitches; the dampers take the energy out so it does not bounce.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"Side view of a kart with a spring at each wheel. A bump slides under the front wheel and then the rear wheel; the spring over the bump compresses, the other spring extends, and the body rises and pitches.\"><style>.kart-suspension-bump-t{font-size:13px;fill:var(--fig-muted)}.kart-suspension-bump-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.kart-suspension-bump-e{text-anchor:end}.kart-suspension-bump-gr{stroke:var(--fig-ink);stroke-width:2;stroke-linecap:round}.kart-suspension-bump-bump{fill:var(--fig-panel);stroke:var(--fig-ink);stroke-width:2;animation:kart-suspension-bump-bump 6s linear infinite}.kart-suspension-bump-body{fill:var(--fig-panel);stroke:var(--fig-accent);stroke-width:2.5}.kart-suspension-bump-w{fill:var(--fig-panel);stroke:var(--fig-ink);stroke-width:3}.kart-suspension-bump-hub{fill:var(--fig-ink)}.kart-suspension-bump-sp{fill:none;stroke:var(--fig-accent2);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}.kart-suspension-bump-wf{animation:kart-suspension-bump-wf 6s ease-in-out infinite}.kart-suspension-bump-wr{animation:kart-suspension-bump-wr 6s ease-in-out infinite}.kart-suspension-bump-bd{transform-origin:270px 190px;animation:kart-suspension-bump-bd 6s ease-in-out infinite}.kart-suspension-bump-sf{transform-origin:340px 190px;animation:kart-suspension-bump-sf 6s ease-in-out infinite}.kart-suspension-bump-sr{transform-origin:200px 190px;animation:kart-suspension-bump-sr 6s ease-in-out infinite}.kart-suspension-bump-s{font-size:12px;fill:var(--fig-ink)}@keyframes kart-suspension-bump-bump{0%{transform:translateX(620px)}100%{transform:translateX(20px)}}@keyframes kart-suspension-bump-wf{0%,40%{transform:translateY(0)}46.7%{transform:translateY(-24px)}53.4%,100%{transform:translateY(0)}}@keyframes kart-suspension-bump-wr{0%,63.3%{transform:translateY(0)}70%{transform:translateY(-24px)}76.7%,100%{transform:translateY(0)}}@keyframes kart-suspension-bump-bd{0%,40%{transform:translateY(0) rotate(0deg)}46.7%{transform:translateY(-8px) rotate(-2deg)}53.4%,63.3%{transform:translateY(0) rotate(0deg)}70%{transform:translateY(-8px) rotate(2deg)}76.7%,100%{transform:translateY(0) rotate(0deg)}}@keyframes kart-suspension-bump-sf{0%,40%{transform:scaleY(1)}46.7%{transform:scaleY(.68)}53.4%,63.3%{transform:scaleY(1)}70%{transform:scaleY(1.13)}76.7%,100%{transform:scaleY(1)}}@keyframes kart-suspension-bump-sr{0%,40%{transform:scaleY(1)}46.7%{transform:scaleY(1.13)}53.4%,63.3%{transform:scaleY(1)}70%{transform:scaleY(.68)}76.7%,100%{transform:scaleY(1)}}</style><text class=\"kart-suspension-bump-h\" x=\"24\" y=\"28\">Raycast suspension, side view</text><text class=\"kart-suspension-bump-t kart-suspension-bump-e\" x=\"616\" y=\"28\">F = k · compression − c · velocity</text><text class=\"kart-suspension-bump-t\" x=\"24\" y=\"52\">Two of four wheels shown. A bump passes the front wheel, then the rear.</text><g transform=\"translate(0,-40)\"><line class=\"kart-suspension-bump-gr\" x1=\"16\" y1=\"250\" x2=\"624\" y2=\"250\"/><path class=\"kart-suspension-bump-bump\" transform=\"translate(620,0)\" d=\"M-40 250C-20 250 -16 226 0 226C16 226 20 250 40 250Z\"/><g class=\"kart-suspension-bump-wr\"><circle class=\"kart-suspension-bump-w\" cx=\"200\" cy=\"232\" r=\"18\"/><circle class=\"kart-suspension-bump-hub\" cx=\"200\" cy=\"232\" r=\"4\"/></g><g class=\"kart-suspension-bump-wf\"><circle class=\"kart-suspension-bump-w\" cx=\"340\" cy=\"232\" r=\"18\"/><circle class=\"kart-suspension-bump-hub\" cx=\"340\" cy=\"232\" r=\"4\"/></g><g class=\"kart-suspension-bump-bd\"><rect class=\"kart-suspension-bump-body\" x=\"185\" y=\"150\" width=\"170\" height=\"40\" rx=\"12\"/><circle class=\"kart-suspension-bump-hub\" cx=\"212\" cy=\"170\" r=\"4\"/><text class=\"kart-suspension-bump-s\" x=\"222\" y=\"174\">low CoM</text><path class=\"kart-suspension-bump-sp kart-suspension-bump-sr\" d=\"M200 190v4l-7 4l14 6l-14 6l14 6l-14 6l7 4v6\"/><path class=\"kart-suspension-bump-sp kart-suspension-bump-sf\" d=\"M340 190v4l-7 4l14 6l-14 6l14 6l-14 6l7 4v6\"/></g></g><text class=\"kart-suspension-bump-t\" x=\"24\" y=\"262\">Over the bump the spring compresses and pushes up harder; the body rises and pitches.</text></svg>"
        },
        {
          "type": "p",
          "text": "The **spring-damper** is the core. Let `compression = restLength - hitDistance`, clamped at 0. Then `F = k * compression - c * compressionSpeed`, applied along the ground normal. The first term holds the kart up; the second removes energy so it does not bounce. Sizing it is simple: for a 120 kg kart on four wheels, each wheel carries about 295 N. To sit at 0.08 m of compression, `k = 295 / 0.08`, about 3,700 N/m. Critical damping is `2 * sqrt(k * m)` with m = 30 kg per wheel, about 670 N·s/m; a damping ratio of 0.5 to 0.7 (c of roughly 330 to 470 N·s/m) settles in about one bounce. Too stiff and the kart skips over small bumps; too soft and it bottoms out on landings."
        },
        {
          "type": "p",
          "text": "**Lateral grip** is what makes it feel like a kart rather than a hovercraft. At each wheel, take the velocity at that point, project it on the wheel's sideways axis, and apply an impulse that cancels a fraction `grip` of it. `grip = 1` is a rail, `grip = 0` is ice. Steering uses a **speed curve**: a maximum steer angle of about 30 degrees at standstill falling to about 8 degrees at top speed (28 m/s, roughly 100 km/h), so the kart is nimble when slow and stable when fast."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "void ApplyWheel(Wheel w, float dt)\n{\n    if (!Physics.Raycast(w.mount, -transform.up, out var hit, w.rest + w.radius)) return;\n    float compression = w.rest - (hit.distance - w.radius);\n    float compSpeed = (compression - w.lastCompression) / dt;\n    w.lastCompression = compression;\n    float spring = Mathf.Max(0f, k * compression - c * compSpeed);\n    rb.AddForceAtPosition(hit.normal * spring, hit.point);\n\n    // Lateral grip: cancel a fraction of sideways speed at this wheel.\n    Vector3 v = rb.GetPointVelocity(hit.point);\n    float side = Vector3.Dot(v, w.transform.right);\n    float impulse = -side * w.grip * (rb.mass * 0.25f);\n    rb.AddForceAtPosition(w.transform.right * impulse / dt, hit.point);\n}"
        },
        {
          "type": "p",
          "text": "Keeping the kart upright is mostly tuning. Lower the **centre of mass** (`rb.centerOfMass`, about 0.3 m below the mesh centre) so lateral forces create little roll. Add an **anti-roll** force that pushes the more compressed side up. Add **downforce** that grows with speed so jumps and crests do not unload the tyres. While airborne, apply a **self-righting torque** that aligns the kart's up vector with the last ground normal, and if it is upside down for about 2 seconds, treat it as a respawn."
        },
        {
          "type": "h",
          "text": "Drift and mini-turbo"
        },
        {
          "type": "p",
          "text": "Drift is a state, not a different physics model. Holding the drift button while steering switches the kart into a state where the rear grip drops (for example from 1.0 to 0.6), the steering is biased into the turn, and a **charge timer** starts. The tiers are time thresholds. Example values: 0.7 s gives a small boost, 1.5 s a medium one, 2.5 s a large one. On release the kart gets a **mini-turbo**: a speed multiplier (for example 1.3x) for 0.6, 1.0 or 1.5 s. The loop is risk and reward: a long drift costs steering precision and lap time on the corner, and pays back on the straight."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "void TickDrift(float dt, bool held, float steer)\n{\n    if (held && speed > 10f) {\n        driftTime += dt;                      // seconds, so it is tick-rate independent\n        tier = driftTime >= 2.5f ? 3 : driftTime >= 1.5f ? 2 : driftTime >= 0.7f ? 1 : 0;\n        rearGrip = 0.6f;\n    } else {\n        if (driftTime > 0f && tier > 0) boostLeft = BoostSeconds[tier - 1]; // 0.6, 1.0, 1.5\n        driftTime = 0f; tier = 0; rearGrip = 1f;\n    }\n    boostLeft = Mathf.Max(0f, boostLeft - dt);\n    maxSpeed = boostLeft > 0f ? baseMax * 1.3f : baseMax;\n}"
        },
        {
          "type": "h",
          "text": "Track representation and race progress"
        },
        {
          "type": "p",
          "text": "The track is a closed **spline centerline**, sampled once at build time into points about every 2 m (about 900 points for 1.8 km) with an arc-length table, plus a width, a banking angle and a tangent at each point. Everything about the race hangs on one function: given a kart position, find the **nearest point on the centerline** and read its distance along the track, `s`. Then `progress = lap * L + s`, where `L` is the lap length. That single float orders the karts, drives the wrong-way check and feeds the AI."
        },
        {
          "type": "figure",
          "id": "kart-track-progress",
          "caption": "The kart projects onto the nearest centerline point; that gives s, and s plus lap times L is progress. Gates C0 to C5 must be crossed in order for a lap to count.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-label=\"Top-down oval track with a centerline and six numbered checkpoint gates. A kart drives around it; a dashed line projects the kart onto the nearest centerline point, and a bar on the right fills with the distance s along the spline for this lap. Race progress equals lap times lap length plus s.\"><style>.kart-track-progress-t{font-size:12px;fill:var(--fig-muted)}.kart-track-progress-m{text-anchor:middle}.kart-track-progress-e{text-anchor:end}.kart-track-progress-tr{fill:none;stroke:var(--fig-line);stroke-opacity:.55;stroke-width:34}.kart-track-progress-cl{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:5 5}.kart-track-progress-g{stroke:var(--fig-ink);stroke-width:2.5;stroke-linecap:round}.kart-track-progress-p{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.kart-track-progress-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.kart-track-progress-f{font-size:14px;fill:var(--fig-ink)}.kart-track-progress-s{font-size:13px;fill:var(--fig-muted)}.kart-track-progress-pr{stroke:var(--fig-ink);stroke-width:1.5;stroke-dasharray:3 3}.kart-track-progress-pd{fill:var(--fig-ink)}.kart-track-progress-kd{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2}.kart-track-progress-bt{fill:var(--fig-bg);stroke:var(--fig-line);stroke-width:1.5}.kart-track-progress-bf{fill:var(--fig-accent2);transform-box:fill-box;transform-origin:0 50%;animation:kart-track-progress-bf 8s linear infinite}.kart-track-progress-k{animation:kart-track-progress-k 8s linear infinite;transform:translate(210px,72px) rotate(-90deg)}@keyframes kart-track-progress-k{0%{transform:translate(210px,72px) rotate(-90deg)}2.8%{transform:translate(236px,73.3px) rotate(-84.1deg)}5.6%{transform:translate(261.3px,77.3px) rotate(-77.9deg)}8.3%{transform:translate(285px,83.8px) rotate(-71.3deg)}11.1%{transform:translate(306.4px,92.6px) rotate(-63.8deg)}13.9%{transform:translate(324.9px,103.4px) rotate(-55deg)}16.7%{transform:translate(339.9px,116px) rotate(-44.5deg)}19.4%{transform:translate(351px,129.9px) rotate(-31.8deg)}22.2%{transform:translate(357.7px,144.7px) rotate(-16.7deg)}25%{transform:translate(360px,160px) rotate(0deg)}27.8%{transform:translate(357.7px,175.3px) rotate(16.7deg)}30.6%{transform:translate(351px,190.1px) rotate(31.8deg)}33.3%{transform:translate(339.9px,204px) rotate(44.5deg)}36.1%{transform:translate(324.9px,216.6px) rotate(55deg)}38.9%{transform:translate(306.4px,227.4px) rotate(63.8deg)}41.7%{transform:translate(285px,236.2px) rotate(71.3deg)}44.4%{transform:translate(261.3px,242.7px) rotate(77.9deg)}47.2%{transform:translate(236px,246.7px) rotate(84.1deg)}50%{transform:translate(210px,248px) rotate(90deg)}52.8%{transform:translate(184px,246.7px) rotate(95.9deg)}55.6%{transform:translate(158.7px,242.7px) rotate(102.1deg)}58.3%{transform:translate(135px,236.2px) rotate(108.7deg)}61.1%{transform:translate(113.6px,227.4px) rotate(116.2deg)}63.9%{transform:translate(95.1px,216.6px) rotate(125deg)}66.7%{transform:translate(80.1px,204px) rotate(135.5deg)}69.4%{transform:translate(69px,190.1px) rotate(148.2deg)}72.2%{transform:translate(62.3px,175.3px) rotate(163.3deg)}75%{transform:translate(60px,160px) rotate(180deg)}77.8%{transform:translate(62.3px,144.7px) rotate(196.7deg)}80.6%{transform:translate(69px,129.9px) rotate(211.8deg)}83.3%{transform:translate(80.1px,116px) rotate(224.5deg)}86.1%{transform:translate(95.1px,103.4px) rotate(235deg)}88.9%{transform:translate(113.6px,92.6px) rotate(243.8deg)}91.7%{transform:translate(135px,83.8px) rotate(251.3deg)}94.4%{transform:translate(158.7px,77.3px) rotate(257.9deg)}97.2%{transform:translate(184px,73.3px) rotate(264.1deg)}100%{transform:translate(210px,72px) rotate(270deg)}}@keyframes kart-track-progress-bf{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}</style><ellipse class=\"kart-track-progress-tr\" cx=\"210\" cy=\"160\" rx=\"150\" ry=\"88\"/><ellipse class=\"kart-track-progress-cl\" cx=\"210\" cy=\"160\" rx=\"150\" ry=\"88\"/><line class=\"kart-track-progress-g\" x1=\"210\" y1=\"89\" x2=\"210\" y2=\"55\"/><line class=\"kart-track-progress-g\" x1=\"327.8\" y1=\"127.9\" x2=\"352\" y2=\"104.1\"/><line class=\"kart-track-progress-g\" x1=\"327.8\" y1=\"192.1\" x2=\"352\" y2=\"215.9\"/><line class=\"kart-track-progress-g\" x1=\"210\" y1=\"231\" x2=\"210\" y2=\"265\"/><line class=\"kart-track-progress-g\" x1=\"92.2\" y1=\"192.1\" x2=\"68\" y2=\"215.9\"/><line class=\"kart-track-progress-g\" x1=\"92.2\" y1=\"127.9\" x2=\"68\" y2=\"104.1\"/><text class=\"kart-track-progress-t kart-track-progress-m\" x=\"210\" y=\"45\">C0 start / finish</text><text class=\"kart-track-progress-t\" x=\"362\" y=\"98.3\">C1</text><text class=\"kart-track-progress-t\" x=\"362\" y=\"229.7\">C2</text><text class=\"kart-track-progress-t kart-track-progress-m\" x=\"210\" y=\"283\">C3</text><text class=\"kart-track-progress-t kart-track-progress-e\" x=\"58\" y=\"229.7\">C4</text><text class=\"kart-track-progress-t kart-track-progress-e\" x=\"58\" y=\"98.3\">C5</text><g class=\"kart-track-progress-k\"><line class=\"kart-track-progress-pr\" x1=\"0\" y1=\"0\" x2=\"10\" y2=\"0\"/><circle class=\"kart-track-progress-pd\" cx=\"0\" cy=\"0\" r=\"3.5\"/><circle class=\"kart-track-progress-kd\" cx=\"10\" cy=\"0\" r=\"6\"/></g><rect class=\"kart-track-progress-p\" x=\"432\" y=\"60\" width=\"192\" height=\"188\" rx=\"12\"/><text class=\"kart-track-progress-h\" x=\"448\" y=\"88\">race progress</text><text class=\"kart-track-progress-f\" x=\"448\" y=\"112\">= lap × L + s</text><text class=\"kart-track-progress-s\" x=\"448\" y=\"136\">L: lap length, 1,800 m</text><text class=\"kart-track-progress-s\" x=\"448\" y=\"158\">s: distance along the</text><text class=\"kart-track-progress-s\" x=\"448\" y=\"176\">spline, at the nearest</text><text class=\"kart-track-progress-s\" x=\"448\" y=\"194\">point to the kart</text><rect class=\"kart-track-progress-bt\" x=\"448\" y=\"208\" width=\"160\" height=\"10\" rx=\"5\"/><rect class=\"kart-track-progress-bf\" x=\"448\" y=\"208\" width=\"160\" height=\"10\" rx=\"5\"/><text class=\"kart-track-progress-t\" x=\"448\" y=\"238\">0</text><text class=\"kart-track-progress-t kart-track-progress-e\" x=\"608\" y=\"238\">L</text><text class=\"kart-track-progress-s\" x=\"24\" y=\"308\">Gates must be crossed in order, C0 to C5, before C0 counts a lap.</text></svg>"
        },
        {
          "type": "p",
          "text": "A global nearest-point search over 900 points for 12 karts is about 11,000 distance checks per tick, which is cheap. The problem is correctness: where a road passes over or next to itself, the globally nearest point can be on the other road, and progress jumps by hundreds of metres. Search a **window** instead: start at the kart's last index and check about 30 samples either side (60 m each way), then wrap the index at the end of the lap."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "int FindIndex(Vector3 p, int last)\n{\n    int best = last; float bestD = float.MaxValue;\n    for (int o = -30; o <= 30; o++) {\n        int i = (last + o + n) % n;\n        float d = (pts[i] - p).sqrMagnitude;\n        if (d < bestD) { bestD = d; best = i; }\n    }\n    // Seam wrap keeps progress continuous. The official lap count comes from the gates.\n    if (last > n - 40 && best < 40) progressLap++;\n    else if (last < 40 && best > n - 40) progressLap--;\n    return best;\n}"
        },
        {
          "type": "p",
          "text": "Progress alone is not enough to count a lap, because it can be gamed. Place **ordered checkpoints** (gate planes across the road, here six) and require that each kart crosses them in sequence. A lap counts only when the finish gate is crossed with all gates seen in order, so cutting a corner through the infield skips a gate and does not score. **Wrong-way detection** compares velocity with the spline tangent: if `dot(velocity, tangent)` is negative for more than about 1 second, show the warning. **Respawn** on a fall (kill plane below the track) or a stuck timer places the kart at the **last checkpoint it passed**, facing the tangent, with a short invulnerability. Respawning at the nearest spline point looks better but lets a player fall off, land beside a later section and skip track."
        },
        {
          "type": "p",
          "text": "**Position ranking** is a sort of 8 to 12 floats by progress every tick. Use a stable sort so ties do not flicker, lock the order when a kart finishes, and consider a small hysteresis on the HUD (a kart must lead by about 1 m before the number changes) so positions do not flash when two karts run side by side."
        },
        {
          "type": "h",
          "text": "AI drivers"
        },
        {
          "type": "p",
          "text": "AI karts are not scripted paths. They run the same physics as the player and produce the same input struct. Each point on the spline stores a **racing line** as a lateral offset from the centerline (inside on corners, wide on entry). The AI uses **pure pursuit**: pick a target point on the line a **lookahead** distance ahead, `lookahead = 6 m + 0.4 * speed`, steer toward it, and control speed from the curvature ahead (`vMax = sqrt(aLat / curvature)` with a lateral limit around 12 m/s squared, below which the kart brakes before the corner). The lookahead grows with speed because a short one oscillates at high speed and a long one cuts corners."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "Input Drive(Kart k)\n{\n    float look = 6f + 0.4f * k.speed;\n    Vector3 target = line.PointAt(k.s + look) + line.Normal(k.s + look) * (offset + noise);\n    Vector3 local = k.transform.InverseTransformPoint(target);\n    float steer = Mathf.Clamp(Mathf.Atan2(local.x, local.z) * Mathf.Rad2Deg / 30f, -1f, 1f);\n    float vTarget = Mathf.Min(topSpeed * skill, Mathf.Sqrt(aLat / line.Curvature(k.s + look * 2f)));\n    float throttle = k.speed < vTarget ? 1f : -0.5f; // brake when too fast for the corner\n    return new Input(steer, throttle);\n}"
        },
        {
          "type": "p",
          "text": "Identical AI looks robotic, so each driver gets variation: a `skill` scale on top speed (for example 0.92 to 1.0), a constant line offset of up to 1.5 m, a slow noise term on that offset, a reaction delay on braking, and a small chance of a mistake (a wide turn) that is higher on harder corners. All of it is data on a per-driver asset, so designers tune difficulty without touching code."
        },
        {
          "type": "h",
          "text": "Rubber banding and items"
        },
        {
          "type": "p",
          "text": "**Rubber banding** scales AI speed by the gap to the human player. Example: when an AI kart is 100 m behind, its top speed is scaled by up to 1.10; when 100 m ahead, by 0.95, with linear interpolation between and hard caps. It keeps races close for the whole pack, which is what makes a mid-race item hit matter. It is also **controversial**: players who build a lead feel punished, and visible cheating (an AI kart that passes a boosting player on a straight) breaks the sense that skill matters. The mitigations are to keep the caps small, scale smoothly instead of switching on, apply it to AI only, and never let it bend the rules of the physics a human sees."
        },
        {
          "type": "figure",
          "id": "kart-rubber-items",
          "caption": "Left: AI speed scale against the gap to the player, capped at +10% and -5%. Right: example item weights by position; the leader rolls mostly traps, the last kart mostly boosts and homing items.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 290\" role=\"img\" aria-label=\"Left: AI speed scale against the gap to the human player. The scale rises from 0.95 when the AI is 100 metres ahead to 1.00 at zero gap and 1.10 when it is 100 metres behind; a dot slides along the curve. Right: example item weights for 1st, 4th and 8th place; the leader mostly rolls traps and the last place mostly rolls boosts and homing items.\"><style>.kart-rubber-items-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.kart-rubber-items-s{font-size:13px;fill:var(--fig-muted)}.kart-rubber-items-m{text-anchor:middle}.kart-rubber-items-e{text-anchor:end}.kart-rubber-items-p{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.kart-rubber-items-ax{stroke:var(--fig-line);stroke-width:1.5}.kart-rubber-items-gd{stroke:var(--fig-muted);stroke-width:1.5;stroke-dasharray:4 5}.kart-rubber-items-cv{fill:none;stroke:var(--fig-accent);stroke-width:3;stroke-linejoin:round}.kart-rubber-items-dt{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:kart-rubber-items-dt 6s linear infinite alternate;transform:translate(56px,194px)}.kart-rubber-items-wa{fill:var(--fig-warn);fill-opacity:.4;stroke:var(--fig-warn);stroke-width:1.5}.kart-rubber-items-ok{fill:var(--fig-ok);fill-opacity:.4;stroke:var(--fig-ok);stroke-width:1.5}.kart-rubber-items-bd{fill:var(--fig-bad);fill-opacity:.4;stroke:var(--fig-bad);stroke-width:1.5}.kart-rubber-items-v{font-size:12px;fill:var(--fig-ink);text-anchor:middle}@keyframes kart-rubber-items-dt{0%{transform:translate(56px,194px)}5%{transform:translate(68px,191.4px)}10%{transform:translate(80px,188.8px)}15%{transform:translate(92px,186.2px)}20%{transform:translate(104px,183.6px)}25%{transform:translate(116px,181px)}30%{transform:translate(128px,178.4px)}35%{transform:translate(140px,175.8px)}40%{transform:translate(152px,173.2px)}45%{transform:translate(164px,170.6px)}50%{transform:translate(176px,168px)}55%{transform:translate(188px,162.8px)}60%{transform:translate(200px,157.6px)}65%{transform:translate(212px,152.4px)}70%{transform:translate(224px,147.2px)}75%{transform:translate(236px,142px)}80%{transform:translate(248px,136.8px)}85%{transform:translate(260px,131.6px)}90%{transform:translate(272px,126.4px)}95%{transform:translate(284px,121.2px)}100%{transform:translate(296px,116px)}}</style><rect class=\"kart-rubber-items-p\" x=\"16\" y=\"16\" width=\"296\" height=\"258\" rx=\"14\"/><text class=\"kart-rubber-items-h\" x=\"32\" y=\"44\">AI speed scale</text><text class=\"kart-rubber-items-s\" x=\"32\" y=\"64\">boost behind, brake ahead</text><line class=\"kart-rubber-items-ax\" x1=\"56\" y1=\"90\" x2=\"56\" y2=\"220\"/><line class=\"kart-rubber-items-ax\" x1=\"56\" y1=\"220\" x2=\"296\" y2=\"220\"/><line class=\"kart-rubber-items-gd\" x1=\"56\" y1=\"168\" x2=\"296\" y2=\"168\"/><text class=\"kart-rubber-items-s kart-rubber-items-e\" x=\"50\" y=\"119.99999999999997\">1.10</text><text class=\"kart-rubber-items-s kart-rubber-items-e\" x=\"50\" y=\"172\">1.00</text><text class=\"kart-rubber-items-s kart-rubber-items-e\" x=\"50\" y=\"198.00000000000003\">0.95</text><text class=\"kart-rubber-items-s kart-rubber-items-m\" x=\"56\" y=\"238\">−100</text><text class=\"kart-rubber-items-s kart-rubber-items-m\" x=\"176\" y=\"238\">0</text><text class=\"kart-rubber-items-s kart-rubber-items-m\" x=\"296\" y=\"238\">+100</text><text class=\"kart-rubber-items-s kart-rubber-items-m\" x=\"176\" y=\"258\">gap to player (m), + = AI behind</text><polyline class=\"kart-rubber-items-cv\" points=\"56,194.00000000000003 176,168 296,115.99999999999997\"/><text class=\"kart-rubber-items-s kart-rubber-items-e\" x=\"296\" y=\"106\">cap +10%</text><text class=\"kart-rubber-items-s\" x=\"62\" y=\"212\">cap −5%</text><circle class=\"kart-rubber-items-dt\" r=\"6\"/><rect class=\"kart-rubber-items-p\" x=\"328\" y=\"16\" width=\"296\" height=\"258\" rx=\"14\"/><text class=\"kart-rubber-items-h\" x=\"344\" y=\"44\">Item roll by race position</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"88\">1st</text><rect class=\"kart-rubber-items-wa\" x=\"380\" y=\"70\" width=\"132\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"446\" y=\"88\">60</text><rect class=\"kart-rubber-items-ok\" x=\"512\" y=\"70\" width=\"77\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"550.5\" y=\"88\">35</text><rect class=\"kart-rubber-items-bd\" x=\"589\" y=\"70\" width=\"11\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"594.5\" y=\"88\">5</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"126\">4th</text><rect class=\"kart-rubber-items-wa\" x=\"380\" y=\"108\" width=\"55\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"407.5\" y=\"126\">25</text><rect class=\"kart-rubber-items-ok\" x=\"435\" y=\"108\" width=\"88\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"479\" y=\"126\">40</text><rect class=\"kart-rubber-items-bd\" x=\"523\" y=\"108\" width=\"77\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"561.5\" y=\"126\">35</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"164\">8th</text><rect class=\"kart-rubber-items-wa\" x=\"380\" y=\"146\" width=\"11\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"385.5\" y=\"164\">5</text><rect class=\"kart-rubber-items-ok\" x=\"391\" y=\"146\" width=\"99\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"440.5\" y=\"164\">45</text><rect class=\"kart-rubber-items-bd\" x=\"490\" y=\"146\" width=\"110\" height=\"26\"/><text class=\"kart-rubber-items-v\" x=\"545\" y=\"164\">50</text><rect class=\"kart-rubber-items-wa\" x=\"344\" y=\"190\" width=\"10\" height=\"10\"/><text class=\"kart-rubber-items-s\" x=\"359\" y=\"200\">trap</text><rect class=\"kart-rubber-items-ok\" x=\"420\" y=\"190\" width=\"10\" height=\"10\"/><text class=\"kart-rubber-items-s\" x=\"435\" y=\"200\">boost</text><rect class=\"kart-rubber-items-bd\" x=\"504\" y=\"190\" width=\"10\" height=\"10\"/><text class=\"kart-rubber-items-s\" x=\"519\" y=\"200\">homing</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"234\">example weights, percent per roll</text><text class=\"kart-rubber-items-s\" x=\"344\" y=\"254\">trailing karts roll stronger items</text></svg>"
        },
        {
          "type": "p",
          "text": "**Items** are the second catch-up system, and it is honest because humans get it too. When a kart drives through an item box, roll a weighted random choice from a table indexed by its race position. The weights are data: the leader gets defensive or weak items, the last kart gets boosts and homing attacks. Roll on the server in multiplayer, and make the roll a pure function of `(position, rng)` so it can be tested. A **homing item** does not path-find. It follows the spline: its own `s` increases at about 1.4 times the leader's top speed, it steers toward the target when within a short range, and it falls back to the spline if the target is lost. Following the spline means it cannot get stuck on walls."
        },
        {
          "type": "h",
          "text": "Camera and split-screen"
        },
        {
          "type": "p",
          "text": "The **spring-arm camera** targets a point behind and above the kart (for example 5 m back, 2.2 m up), moves toward it with the frame-rate independent smoothing from earlier lessons, and lags its rotation more than its position so turns feel heavy. It raycasts from the kart to the desired position and pulls in if a wall is hit. **FOV rises with speed**, from about 60 degrees at rest to about 80 on a boost, with speed lines at the edges; the wider view is the cheapest way to sell speed. Rotation should follow the kart's velocity direction during a drift, not its facing, or the player sees the scene swing sideways."
        },
        {
          "type": "p",
          "text": "**Split-screen** is a CPU problem more than a pixel problem. Four viewports each cover a quarter of the screen, so total pixels shaded stays about the same. But the scene is culled and drawn four times, so draw calls, culling and shadow passes cost roughly four times as much. At 60 fps there is 16.6 ms per frame, so each view gets about 4 ms of CPU. The standard moves are a lower LOD bias per view, no or cheaper shadows on the secondary views, fewer particles and a shared static batch, because resolution is not the bottleneck."
        },
        {
          "type": "h",
          "text": "Online play"
        },
        {
          "type": "p",
          "text": "Online karts at 60 Hz physics cannot wait for the server before turning. **Client prediction** runs the player's own kart locally the moment input is read and tags each input with a tick number. The server simulates authoritatively and sends snapshots at about 20 Hz. When a snapshot for tick 600 arrives and the client is at tick 605, the client sets its kart to the server state for tick 600, **replays the stored inputs 601 to 605**, and blends away any visible difference over a few frames. Other players' karts are not predicted. The client **interpolates** them between two buffered snapshots about 100 ms in the past (two snapshot intervals at 20 Hz), which is smooth and tolerates one lost packet. Extrapolating forward on a turn is a guess that visibly pops when wrong."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "void OnServerState(int tick, KartState s)\n{\n    // Discard acknowledged inputs, then rewind to the authoritative state.\n    while (pending.Count > 0 && pending.Peek().tick <= tick) pending.Dequeue();\n    Vector3 shownPos = kart.Position + visualError;   // what the player sees now\n    kart.Restore(s);\n    foreach (var input in pending)          // 601..605 in the example\n        kart.Step(input, fixedDt);\n    // Show the corrected state smoothly: error decays instead of snapping.\n    visualError = shownPos - kart.Position;\n}\nvoid LateUpdate()\n{\n    visualError *= Mathf.Exp(-10f * Time.deltaTime);   // about 63% gone in 0.1 s\n    visual.position = kart.Position + visualError;\n}"
        },
        {
          "type": "p",
          "text": "Collisions between karts are the hard part: the local kart's prediction does not include other karts' true positions (they are 100 ms in the past on your screen). The practical answer is **lenient collisions**. Kart-to-kart contact is a soft push resolved on the server with small impulses, the local view does not predict it, and item hits use generous radii and are decided server side. The result is that the player sees a hit that matches what they saw, rather than a physically exact one that was wrong on their screen."
        },
        {
          "type": "h",
          "text": "Decisions and why they work"
        },
        {
          "type": "list",
          "items": [
            "**Raycast wheels, not wheel colliders.** Four raycasts and two numbers per wheel (k, c) give predictable handling designers can reason about. Full tyre models are more realistic and much harder to make forgiving.",
            "**Grip as a tunable fraction, not friction.** Cancelling a fraction of sideways speed lets you make drift, ice and boost pads by changing one number. A friction-coefficient model gives the same results only after hours of tuning.",
            "**One progress float per kart.** Position order, wrong-way, AI targets and respawns all read the same value. Computing them separately lets them disagree.",
            "**Windowed nearest-point search.** It costs about 60 checks per kart and cannot jump to a different road. Global search is simpler and fails exactly on overpasses.",
            "**Respawn at the last checkpoint.** It is slightly less tidy than the nearest point, and it cannot skip track. Exploits found in playtest cost more than the tidiness.",
            "**AI uses the player's input struct.** It exercises the same physics, so tracks that work for humans work for AI. A separate AI movement model needs its own debugging and breaks on new items.",
            "**Small, smooth rubber band plus item odds.** Two soft catch-up systems keep races close without one big visible cheat. A hard speed-up for trailing karts reads as cheating.",
            "**Predict the local kart, interpolate the rest.** The player gets zero-latency control and a world that never visibly rewinds. Waiting for the server feels like driving through mud."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Agents write the data-driven parts of a kart racer well: the spline sampler, the arc-length table, the item weight table, the lap and checkpoint state machine. Give them the invariants as tests. For example: a kart driven by recorded inputs finishes three laps with progress strictly non-decreasing; skipping any gate never increments the lap; respawn never reduces progress below the last gate; two runs from the same seed give the same finish order. Have the agent write an editor gizmo that draws the spline, windows, gates and AI target. Verify yourself the things only a human can judge: how the suspension and drift feel, whether the rubber band is visible, and netcode behaviour under 100 ms of latency and 3 percent packet loss. Do not accept a physics change without playing a lap."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "The classic pitfalls: counting time or boost in frames instead of seconds, so the mini-turbo differs between 30 and 60 fps; using the global nearest spline point, which jumps on overpasses and near shortcuts; making rubber banding so strong that a human who drives a perfect lap still sees AI karts glued to their bumper; and letting the client decide item hits, which any modified client can abuse."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Kart bounces for seconds after landing from a jump, or bottoms out on every big drop",
              "use": "Add damping along the ray, then tune k",
              "why": "F = k*compression - c*velocity. k carries the weight and c removes energy. A damping ratio of about 0.5 to 0.7 settles in one bounce; raising k alone only makes the oscillation faster."
            },
            {
              "signal": "Kart slides like on ice at speed, or the steering is twitchy and spins out on the straight",
              "use": "Cancel sideways speed and use a steer curve",
              "why": "Grip is the fraction of lateral velocity removed per tick, so it is one number. Cut steering from about 30 degrees to about 8 as speed rises so high-speed input stays controllable."
            },
            {
              "signal": "A kart's race progress jumps by hundreds of metres where the road crosses or runs beside itself",
              "use": "Search a window near the last index",
              "why": "A global nearest-point search can pick the other road. Checking about 30 samples either side of the last index is cheaper and cannot jump, as long as the index wraps at the seam."
            },
            {
              "signal": "Players skip track by cutting through the infield or by falling off at a good spot",
              "use": "Require ordered gates, respawn at the last",
              "why": "A lap counts only if every gate was crossed in order, and respawn restores the last gate. Progress then cannot be gained by leaving the road, whatever the geometry allows."
            },
            {
              "signal": "AI drivers all take the same line and brake at the same spots, so the field looks like a train",
              "use": "Add per-driver line offset and skill",
              "why": "A skill scale on top speed, a constant line offset and slow noise on it make each driver differ in data, with no new code. Identical AI also stack up behind one another and never overtake."
            },
            {
              "signal": "Trailing players quit because the leader is never caught, and the leader holds items that stay strong",
              "use": "Weight item rolls by race position",
              "why": "A table of weights per position gives the last kart boosts and homing items and the leader weak ones. It keeps the pack close with a system every player can see and use, unlike hidden AI speed."
            },
            {
              "signal": "Remote karts jitter at a 20 Hz snapshot rate, and fast turns snap when a packet is late",
              "use": "Interpolate remote karts 100 ms in the past",
              "why": "Blending between two buffered snapshots is smooth and survives one lost packet. Extrapolating guesses where the kart will be, and a turn makes the guess visibly wrong."
            },
            {
              "signal": "Four-player split-screen drops below 60 fps while every single view alone runs fine",
              "use": "Cut per-view CPU cost, not resolution",
              "why": "Each view repeats culling, draw calls and shadow passes, so CPU cost is about 4x while total pixels stay the same. Lower LOD, shadows and particles on the extra views instead of lowering resolution."
            }
          ]
        }
      ],
      "keyPoints": [
        "Arcade handling uses one rigid body with four raycast wheels: spring-damper F = k * compression - c * velocity, and lateral grip as a fraction of sideways speed cancelled.",
        "Stability comes from tuning: a low centre of mass, anti-roll, speed-based downforce, a steering angle that shrinks with speed and a self-righting torque.",
        "Race progress is lap * L + s, where s is the distance along the spline of the nearest point, found in a window around the last index; ordered checkpoints stop shortcuts, and respawn uses the last gate.",
        "AI drivers use pure pursuit on a stored racing line, with lookahead that grows with speed and per-driver skill, offset and mistake data; they use the same inputs as the player.",
        "Catch-up should be small and visible: capped smooth rubber banding on AI plus item odds weighted by position, rather than a large hidden speed boost.",
        "Online, the local kart is predicted and reconciled by replaying inputs, remote karts are interpolated about 100 ms in the past, and collisions and item hits are lenient and resolved on the server."
      ],
      "quiz": [
        {
          "q": "After landing from a jump, a kart's suspension keeps oscillating for several seconds before settling. The spring force is `k * compression`. What is the right fix?",
          "options": [
            "Increase k so the springs push back harder after the landing",
            "Add a damping term, c times compression speed, along the ray",
            "Lower the rest length so the springs have less travel to use",
            "Raise the fixed tick rate so the spring is evaluated sooner"
          ],
          "answer": 1,
          "explain": "A pure spring has no way to lose energy, so it rings. The c * velocity term removes it, and a damping ratio of 0.5 to 0.7 settles in about one bounce. A larger k makes the ringing faster, a shorter travel makes bottoming out more likely, and a higher tick rate only samples the same oscillation more often."
        },
        {
          "q": "On a track with an overpass, one kart's race progress suddenly jumps ahead by about 400 m while it drives on the lower road. What is the cause and fix?",
          "options": [
            "The lap counter ran twice, so reset the lap when crossing the finish",
            "Floating point error at large distances, so use doubles for progress",
            "A global nearest-point search chose the upper road, so search a window",
            "The checkpoint was missed, so add more gates along the track"
          ],
          "answer": 2,
          "explain": "The upper road is physically close to the kart, so a global nearest-point search can pick it and return an s hundreds of metres away. Searching about 30 samples either side of the last index cannot jump. Float precision is not an issue at 1.8 km, and extra gates do not change which spline point is nearest."
        },
        {
          "q": "Playtesters say AI karts zoom back to the pack and cheat. The rubber band scales AI speed by up to 40 percent. What is the best change?",
          "options": [
            "Cap the scale near +10% and -5% and ramp it smoothly with the gap",
            "Remove all catch-up so every AI kart has one fixed speed",
            "Raise the cap to 60% so the gap closes faster and ends sooner",
            "Apply the same scaling to the human so the rules are fair"
          ],
          "answer": 0,
          "explain": "A small, smooth, capped scale keeps races close and is hard to notice. Removing it leaves pack spread that no item can fix, a bigger cap is more visible cheating, and scaling the human changes the physics the player is tuning their driving to."
        },
        {
          "q": "Remote karts in an online race stutter even though snapshots arrive every 50 ms. The client draws each remote kart at the newest snapshot position. What is the fix?",
          "options": [
            "Predict remote karts with their last input so they never wait",
            "Raise the server tick rate to 120 Hz and send every tick",
            "Extrapolate remote karts forward by the round-trip time",
            "Interpolate between snapshots, rendering about 100 ms behind"
          ],
          "answer": 3,
          "explain": "Drawing the newest snapshot moves the kart in 50 ms jumps. Interpolating between two buffered snapshots is smooth and survives a lost packet. We do not have the remote player's input in time to predict, and extrapolation guesses wrong whenever the kart turns."
        },
        {
          "q": "A four-player split-screen mode drops to 40 fps. GPU time is 6 ms, CPU render thread time is 25 ms. Which change helps most?",
          "options": [
            "Lower the resolution of each of the four viewports",
            "Cut per-view CPU work: LOD, shadow casters, particles",
            "Add MSAA so the smaller viewports look sharper",
            "Enable a larger shadow cascade count for the leading view"
          ],
          "answer": 1,
          "explain": "The frame is CPU bound: each view repeats culling and draw submission, so cost is about four times a single view. Lowering resolution reduces GPU pixels, which are not the limit. More MSAA or more cascades add work without cutting the CPU cost."
        },
        {
          "q": "Last-place players in your kart racer say they never get a chance, because the item box gives them the same items as the leader. Which move from the patterns applies?",
          "options": [
            "Add damping along the ray, then tune k",
            "Search a window near the last index",
            "Interpolate remote karts 100 ms in the past",
            "Weight item rolls by race position"
          ],
          "answer": 3,
          "explain": "A position-indexed weight table gives trailing karts stronger items and the leader weaker ones, a visible comeback mechanic. The other moves address suspension, progress projection and netcode, none of which change who gets which item."
        }
      ]
    },
    {
      "id": "case-fps",
      "title": "Case study: FPS shooter",
      "minutes": 19,
      "summary": "How a first-person shooter fits movement, aim, weapons, hit detection, AI, netcode and level visibility into one 16 ms frame, and why each choice was made.",
      "lesson": [
        {
          "type": "p",
          "text": "A player peeks a corner on an 80 ms connection, puts the crosshair on a head and clicks. On his screen the target flinches and a hit marker flashes. On the server the target stepped behind the wall 90 ms earlier, so the answer depends entirely on how the team built hit detection. Meanwhile a campaign level has 12 enemies, a 16.6 ms frame budget, and a designer who wants every firefight to feel fair. A first-person shooter is a stack of small systems that all have to agree on one thing: what the player saw, when he saw it, and what he was allowed to do about it."
        },
        {
          "type": "h",
          "text": "Components"
        },
        {
          "type": "p",
          "text": "Think of one server tick (15.6 ms at 64 Hz) as a pipeline. Input commands come in, movement runs, weapons fire, hit detection resolves, damage applies, and snapshots go out. The client runs a copy of the first stages ahead of time so the player never waits for the network."
        },
        {
          "type": "list",
          "items": [
            "**Input and camera.** Raw mouse deltas and key state become a command per tick: move axes, view angles, buttons, a timestamp.",
            "**Character controller.** A kinematic capsule moved by shared code, identical on client and server so prediction works.",
            "**Weapons.** Data assets (rate, damage, spread, recoil) read by one fire routine; hitscan or projectile.",
            "**Hit detection.** Rays or sweeps against per-bone hitboxes, after the server rewinds them to the shooter's view time.",
            "**Feedback.** Hit markers, sounds, decals and tracers, mostly cosmetic and driven from events, not polled.",
            "**AI.** Perception, navigation, a decision layer and a token system. Runs on the server only; clients see the result as replicated entities.",
            "**Level and audio.** Visibility data, sightlines and occlusion that serve rendering, AI and sound at once."
          ]
        },
        {
          "type": "h",
          "text": "Player movement"
        },
        {
          "type": "p",
          "text": "Shooter movement is not physics simulation. It is a hand-tuned velocity model on a kinematic capsule. The classic Quake family model has two steps per tick. First apply **friction**: reduce speed by `max(speed, stopSpeed) * friction * dt`. Then **accelerate** toward the wish direction (the direction the keys ask for). Quake 3 uses about 320 units/s run speed, friction 6, ground acceleration 10 and air acceleration 1, with the stop speed at 100 units/s so low speeds decay quickly instead of creeping."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Quake-style acceleration. Same code and same dt on client and server.\nVector3 Accelerate(Vector3 vel, Vector3 wishDir, float wishSpeed, float accel, float dt)\n{\n    float current = Vector3.Dot(vel, wishDir);   // speed already along wishDir\n    float add = wishSpeed - current;             // room left in that direction\n    if (add <= 0f) return vel;\n    float gain = Mathf.Min(accel * wishSpeed * dt, add);\n    return vel + wishDir * gain;\n}\n\nvoid GroundMove(ref Vector3 vel, Vector3 wishDir, float dt)\n{\n    float speed = vel.magnitude;\n    if (speed > 0.01f)                           // friction first\n    {\n        float drop = Mathf.Max(speed, stopSpeed) * friction * dt;\n        vel *= Mathf.Max(speed - drop, 0f) / speed;\n    }\n    vel = Accelerate(vel, wishDir, maxSpeed, groundAccel, dt);\n}"
        },
        {
          "type": "p",
          "text": "The clamp is on the speed **along the wish direction**, not on total speed. That one choice creates **air control**. In the air there is no friction, and turning the mouse while holding a strafe key rotates the wish direction, so each tick there is fresh room to add speed. Players gain speed beyond the run limit (strafe jumping, bunny hopping). Source engine games clamp the wish speed to 30 units/s in the air but allow a large air acceleration, which keeps the effect while limiting its size. Modern console shooters usually cap horizontal speed and give limited, slower air steering. Keeping the quirk gives a skill ceiling and a movement subculture. Removing it makes the game easier to learn and the maps easier to balance."
        },
        {
          "type": "p",
          "text": "Around that sits the **character controller**. It is a capsule (about 0.4 m radius, 1.8 m tall for a standing player) swept through the world, not a rigid body. Each tick the controller sweeps the capsule along the velocity, and on contact projects the remaining motion onto the hit plane and sweeps again, up to about four times. Unity's `CharacterController` does this for you, with defaults of a 45 degree slope limit and a 0.3 m step offset. Three details decide how the movement feels:"
        },
        {
          "type": "list",
          "items": [
            "**Step-up.** Raise the capsule by the step height, sweep forward, then sweep down to the floor. If the landing surface is walkable and within the step limit, keep the result. Stairs then feel like flat ground.",
            "**Crouch.** Shrink the capsule (about 1.8 m to 1.0 m) and lower the eye. To stand, first test the tall capsule for overlap, or the player pops into the ceiling.",
            "**Ground check.** Treat a slope as ground only below the slope limit. Above it the player slides, which stops wall climbing without invisible walls."
          ]
        },
        {
          "type": "h",
          "text": "Camera, input and the view model"
        },
        {
          "type": "p",
          "text": "Aim is the one place where the game must not be clever. Read **raw mouse deltas** (the Input System's `Mouse.delta` or the OS raw-input API), never the cursor position, so OS pointer acceleration and screen edges cannot change the result. Convert counts to angle linearly: `yaw += counts * sensitivity * 0.022` degrees, the constant used by Quake and Source. At 800 DPI and sensitivity 1.0 that is 360 degrees per about 20 inches, which is why players can carry a sensitivity value between games. No smoothing and no acceleration: both add latency or make the same hand motion produce different angles. Apply look every rendered frame (at 240 fps the view updates every 4.2 ms instead of every 15.6 ms tick) and put the angles into the next command. **Field of view** is a gameplay setting. Players expect a horizontal FOV of around 90 degrees, adjustable up to 100 to 120. Unity's `Camera.fieldOfView` is vertical, so convert: `vfov = 2 * atan(tan(hfov / 2) / aspect)`. A 90 degree horizontal FOV at 16:9 is about 58.7 degrees vertical. Define the slider at 16:9 and keep that vertical FOV on wider screens (Hor+), so an ultrawide shows more at the sides instead of cropping the top and bottom."
        },
        {
          "type": "p",
          "text": "The weapon in the player's hands is a **view model**. If it lives in the world camera, it clips into walls when you stand close, and raising the world FOV to 110 stretches it. The fix is a second camera that renders only the view-model layer with its own FOV (about 60 to 70 degrees), its own near and far planes, and a cleared depth buffer, so the gun is always drawn on top. In URP this is an overlay camera in the base camera's stack. The costs are one more camera and some draw calls, and the gun will not receive world shadows correctly without extra work. The alternatives, pushing the gun back when a wall is near or squashing its depth in a vertex shader, each cost animation work or shader complexity."
        },
        {
          "type": "h",
          "text": "Weapons as data"
        },
        {
          "type": "p",
          "text": "A weapon is a row of numbers read by one fire routine. Designers tune a `ScriptableObject`; engineers do not touch code to rebalance. The important fields are fire interval, damage, a **range falloff** curve, **spread** (a cone that grows with continuous fire and movement and recovers over time), a **recoil pattern**, and whether the weapon is hitscan or projectile. Store the rate as RPM and convert once: 600 RPM is one shot per 0.1 s."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "[CreateAssetMenu]\npublic class WeaponDef : ScriptableObject\n{\n    public float rpm = 600f;              // interval = 60 / rpm = 0.1 s\n    public float damage = 28f;\n    public AnimationCurve falloff;        // x = metres, y = damage multiplier\n    public float spreadBase = 0.2f;       // degrees\n    public float spreadPerShot = 0.35f;   // added per shot, recovers at spreadRecover deg/s\n    public float spreadRecover = 4f;\n    public Vector2[] recoil;              // (pitch, yaw) kick per shot index, degrees\n    public int pellets = 1;               // 8-12 for a shotgun\n    public bool hitscan = true;\n    public float projectileSpeed;         // m/s, used when !hitscan\n    public float[] boneMultiplier;        // by hitbox id: head 2.0, torso 1.0, limbs 0.75\n}"
        },
        {
          "type": "p",
          "text": "Fire timing deserves care on a tick-based server. At 64 Hz a tick is 15.625 ms, so 600 RPM is 6.4 ticks per shot. If the code rounds the cooldown to whole ticks it fires at 6 ticks (640 RPM) or 7 ticks (549 RPM), and the weapon is quietly rebalanced. Keep a fractional `nextFireTime` and add the interval to it on each shot instead of resetting it to now. The same value on the client and server also keeps predicted shots from being rejected. **Recoil** comes in two flavours. A fixed **pattern** (shot 1 kicks up, shot 7 drifts right, and so on) can be learned, so skill comes from compensating a known curve. Random **spread** cannot be learned, so skill comes from burst control and positioning. Most competitive shooters mix them: a deterministic pattern for the view kick, and a small random cone on top. The random cone must be seeded from the shot index and the command tick so the client and server agree on where the bullet went."
        },
        {
          "type": "p",
          "text": "**Hitscan or projectile** is decided by travel time. A rifle bullet at 900 m/s covers about 14 m per 15.6 ms tick, so over typical combat ranges simulating flight adds cost and bugs for no gameplay gain: one raycast resolves the shot instantly. A rocket at 20 to 40 m/s is a different weapon: players dodge it, lead targets and bounce it off walls. Projectiles must be spawned by the server, predicted on the client, and swept (a capsule or ray cast per tick from last to new position) so a fast projectile does not tunnel through thin walls."
        },
        {
          "type": "p",
          "text": "Hits are tested against **hitboxes, not the render mesh**. A character mesh has 20,000 to 60,000 triangles skinned on the GPU, so its true vertex positions are usually not even available on the CPU. Hitboxes are 10 to 20 simple capsules and spheres attached to skeleton bones (head, chest, pelvis, upper and lower arms and legs). A ray against a capsule is a few multiplications, and the shape is stable and tuned: head slightly generous, hands often not tested at all. Each hitbox carries its own damage multiplier, so a head shot is `base * 2.0 * falloff` and a leg shot `base * 0.75 * falloff`. One ray tests world geometry and hitboxes together, so the nearest surface wins, and penetrable materials may pass the bullet through at reduced damage."
        },
        {
          "type": "figure",
          "id": "fps-hitboxes",
          "caption": "The ray scans head, torso and legs: each capsule has its own multiplier, and the first hitbox the ray reaches decides the damage.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"A hitscan ray fired from the left tests simple capsule hitboxes on a character. The ray scans a head hit worth 2 times damage, a torso hit worth 1 times and a leg hit worth 0.75 times, with a base damage of 20.\"><style>\n.fps-hitboxes-t{font-size:14px;fill:var(--fig-ink)}.fps-hitboxes-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.fps-hitboxes-s{font-size:13px;fill:var(--fig-muted)}\n.fps-hitboxes-hd{fill:var(--fig-bad);fill-opacity:.18;stroke:var(--fig-bad);stroke-width:2}\n.fps-hitboxes-tr{fill:var(--fig-accent);fill-opacity:.18;stroke:var(--fig-accent);stroke-width:2}\n.fps-hitboxes-lg{fill:var(--fig-ok);fill-opacity:.18;stroke:var(--fig-ok);stroke-width:2}\n.fps-hitboxes-gr{stroke:var(--fig-line);stroke-width:2}\n.fps-hitboxes-ray{stroke:var(--fig-warn);stroke-width:2.5}.fps-hitboxes-mz{fill:var(--fig-ink)}.fps-hitboxes-imp{fill:var(--fig-warn);stroke:var(--fig-bg);stroke-width:2}\n.fps-hitboxes-hl{fill:var(--fig-warn);fill-opacity:.15;stroke:var(--fig-warn);stroke-width:1.5}\n.fps-hitboxes-a{animation:fps-hitboxes-a 6s step-end infinite}\n@keyframes fps-hitboxes-a{0%{transform:translateY(0px)}33%{transform:translateY(62px)}66%{transform:translateY(152px)}100%{transform:translateY(0px)}}\n</style>\n<text class=\"fps-hitboxes-h\" x=\"24\" y=\"28\">A ray tests hitboxes, not the render mesh</text>\n<text class=\"fps-hitboxes-h\" x=\"452\" y=\"28\">base damage 20</text>\n<circle class=\"fps-hitboxes-hd\" cx=\"330\" cy=\"70\" r=\"18\"/>\n<rect class=\"fps-hitboxes-tr\" x=\"306\" y=\"94\" width=\"48\" height=\"76\" rx=\"14\"/>\n<rect class=\"fps-hitboxes-lg\" x=\"308\" y=\"176\" width=\"20\" height=\"88\" rx=\"9\"/>\n<rect class=\"fps-hitboxes-lg\" x=\"332\" y=\"176\" width=\"20\" height=\"88\" rx=\"9\"/>\n<line class=\"fps-hitboxes-gr\" x1=\"250\" y1=\"268\" x2=\"410\" y2=\"268\"/>\n<text class=\"fps-hitboxes-s\" x=\"60\" y=\"104\">first hit wins</text>\n<g class=\"fps-hitboxes-a\"><rect class=\"fps-hitboxes-hl\" x=\"440\" y=\"55\" width=\"184\" height=\"30\" rx=\"6\"/><rect class=\"fps-hitboxes-mz\" x=\"40\" y=\"64\" width=\"18\" height=\"12\" rx=\"3\"/><line class=\"fps-hitboxes-ray\" x1=\"58\" y1=\"70\" x2=\"312\" y2=\"70\"/><circle class=\"fps-hitboxes-imp\" cx=\"312\" cy=\"70\" r=\"6\"/></g>\n<text class=\"fps-hitboxes-t\" x=\"452\" y=\"75\">head ×2 → 40</text>\n<text class=\"fps-hitboxes-t\" x=\"452\" y=\"137\">torso ×1 → 20</text>\n<text class=\"fps-hitboxes-t\" x=\"452\" y=\"227\">legs ×0.75 → 15</text>\n<text class=\"fps-hitboxes-s\" x=\"24\" y=\"290\">damage = base × bone multiplier × range falloff; hitboxes follow the skeleton</text>\n</svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "// Server-side fire. Cooldown accumulates; it never resets to 'now'.\nvoid Fire(Player p, WeaponDef w, float now)\n{\n    if (now < p.nextFire) return;\n    // At most one tick of slack, so idle time cannot bank extra shots.\n    p.nextFire = Mathf.Max(p.nextFire, now - tickDt) + 60f / w.rpm;\n    Vector3 dir = ApplyRecoilAndSpread(p, w);       // seeded by shot index + tick\n\n    lagComp.Rewind(p.viewTime);                      // hitboxes as the shooter saw them\n    if (Physics.Raycast(p.eye, dir, out var hit, w.maxRange, hitMask))\n        if (hit.collider.TryGetComponent(out Hitbox hb))\n            hb.owner.ApplyDamage(\n                w.damage * w.falloff.Evaluate(hit.distance) * hb.multiplier, p);\n    lagComp.Restore();\n}"
        },
        {
          "type": "p",
          "text": "**Hit feedback** is what the player trusts. The **hit marker** is a 100 to 150 ms flash plus a short sound, with a different sound for a head shot or a kill. Show it from the client's own prediction at once, and let the server correct the damage numbers and the kill later: waiting a full round trip makes every shot feel dead. Impact **decals** and effects are pooled: allocate 100 to 200 decal quads and 20 to 40 impact effects at load, and reuse the oldest in a ring buffer. Calling `Instantiate` per bullet produces allocation spikes and garbage collection hitches during sustained fire, exactly when frame time matters. Choose the effect and sound from the surface material of the hit, tracers and muzzle flashes are cosmetic, and none of them is replicated bullet by bullet."
        },
        {
          "type": "h",
          "text": "Enemy AI"
        },
        {
          "type": "p",
          "text": "AI in a shooter has to look smart for a few seconds at a time while costing under 1 ms per frame in total. The pieces are perception, navigation, a decision layer and fairness rules."
        },
        {
          "type": "p",
          "text": "**Perception.** Sight is a cone (for example 120 degrees wide, 40 m range) plus raycasts from the eye to several points on the target (head, chest, feet), so a half-hidden player is partly seen. Awareness is a number that rises while visible (0 to 1 over 0.5 to 1.5 s, faster when close or moving) and decays when not, so enemies take time to react instead of snapping to you. Hearing uses **events**: a gunshot broadcasts a radius (say 30 m unsuppressed) to AI in range, measured along the navmesh instead of through walls. Budget it: 40 agents with 3 rays each every frame is 7,200 rays per second at 60 fps, so spread agents over frames and update perception at 5 to 10 Hz after a cheap distance and angle test."
        },
        {
          "type": "p",
          "text": "**Navigation.** A **navmesh** stores walkable polygons. A* finds a polygon path, the funnel algorithm pulls the string tight into corner points, and the agent radius is baked in so paths clear walls. **Cover points** are authored or generated along obstacles. Score each candidate: blocked from the threat's direction (raycast from crouch height), 10 to 25 m from the player, a peek position with a line of sight, not next to a squadmate. A utility score (weighted sum) picks the best point and avoids all enemies choosing the same one. **Decisions.** A **behaviour tree** is a priority list that designers can read and debug: the first branch whose conditions hold runs. **Utility AI** scores every action and runs the best, which blends smoothly but is harder to debug. Many shooters use a tree for the overall flow and utility scores inside it, for example for cover choice."
        },
        {
          "type": "code",
          "lang": "text",
          "text": "Selector                                   // first child that succeeds wins\n  Sequence  [HealthLow, CoverExists]       -> MoveToCover(farFromThreat); Wait(2-4 s)\n  Sequence  [SeesTarget, AcquireToken]     -> StepOut(); Aim(0.4 s);\n                                              FireBurst(3-5 shots); ReleaseToken()\n  Sequence  [SeesTarget, NoToken]          -> StayInCover(); Suppress or Reload\n  Sequence  [KnowsLastPosition]            -> Flank(); MoveToLastKnown()\n  Sequence  [HeardNoise]                   -> Investigate(noisePos)\n  Patrol()"
        },
        {
          "type": "p",
          "text": "**Tokens** solve the fairness problem. Without them, six enemies in sight all shoot at once, the player dies in a second, and the fight looks like noise. A token pool of 2 to 3 (scaled by difficulty) lets only the holders fire. The others flank, reload, suppress or reposition. A holder releases its token after a burst or a timeout, or when it dies. Add an aim delay of 0.3 to 0.5 s before the first shot, and make early shots less accurate. Attacks are then readable, the player can answer one threat at a time, and the number of enemies becomes a tuning value, not a death sentence. The alternative, lowering accuracy for everyone, keeps the clumping and just makes enemies look blind."
        },
        {
          "type": "figure",
          "id": "fps-attack-tokens",
          "caption": "Five enemies surround the player, but the token pool of two means only two attack at once; the tokens pass around so each enemy gets turns.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Five enemies surround the player but a pool of two attack tokens lets only two fire at a time. The tokens pass from enemy to enemy over time while the others flank, reload or take cover.\"><style>\n.fps-attack-tokens-t{font-size:13px;fill:var(--fig-ink)}.fps-attack-tokens-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.fps-attack-tokens-s{font-size:13px;fill:var(--fig-muted)}.fps-attack-tokens-c{text-anchor:middle}\n.fps-attack-tokens-pl{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2}\n.fps-attack-tokens-en{fill:var(--fig-panel);stroke:var(--fig-bad);stroke-width:2}\n.fps-attack-tokens-ring{fill:none;stroke:var(--fig-warn);stroke-width:3}\n.fps-attack-tokens-ln{stroke:var(--fig-bad);stroke-width:2.5;stroke-dasharray:6 6;animation:fps-attack-tokens-fl .5s linear infinite}\n@keyframes fps-attack-tokens-fl{to{stroke-dashoffset:-12}}\n.fps-attack-tokens-k0{animation:fps-attack-tokens-k0 5s linear infinite}.fps-attack-tokens-k1{animation:fps-attack-tokens-k1 5s linear infinite}.fps-attack-tokens-k2{animation:fps-attack-tokens-k2 5s linear infinite}.fps-attack-tokens-k3{animation:fps-attack-tokens-k3 5s linear infinite}.fps-attack-tokens-k4{animation:fps-attack-tokens-k4 5s linear infinite}@keyframes fps-attack-tokens-k0{0%{opacity:1}5%{opacity:1}10%{opacity:1}15%{opacity:1}20%{opacity:1}25%{opacity:1}30%{opacity:1}35%{opacity:1}40%{opacity:0}45%{opacity:0}50%{opacity:0}55%{opacity:0}60%{opacity:0}65%{opacity:0}70%{opacity:0}75%{opacity:0}80%{opacity:0}85%{opacity:0}90%{opacity:0}95%{opacity:0}100%{opacity:1}}@keyframes fps-attack-tokens-k1{0%{opacity:0}5%{opacity:0}10%{opacity:0}15%{opacity:0}20%{opacity:1}25%{opacity:1}30%{opacity:1}35%{opacity:1}40%{opacity:1}45%{opacity:1}50%{opacity:1}55%{opacity:1}60%{opacity:0}65%{opacity:0}70%{opacity:0}75%{opacity:0}80%{opacity:0}85%{opacity:0}90%{opacity:0}95%{opacity:0}100%{opacity:0}}@keyframes fps-attack-tokens-k2{0%{opacity:0}5%{opacity:0}10%{opacity:0}15%{opacity:0}20%{opacity:0}25%{opacity:0}30%{opacity:0}35%{opacity:0}40%{opacity:1}45%{opacity:1}50%{opacity:1}55%{opacity:1}60%{opacity:1}65%{opacity:1}70%{opacity:1}75%{opacity:1}80%{opacity:0}85%{opacity:0}90%{opacity:0}95%{opacity:0}100%{opacity:0}}@keyframes fps-attack-tokens-k3{0%{opacity:0}5%{opacity:0}10%{opacity:0}15%{opacity:0}20%{opacity:0}25%{opacity:0}30%{opacity:0}35%{opacity:0}40%{opacity:0}45%{opacity:0}50%{opacity:0}55%{opacity:0}60%{opacity:1}65%{opacity:1}70%{opacity:1}75%{opacity:1}80%{opacity:1}85%{opacity:1}90%{opacity:1}95%{opacity:1}100%{opacity:0}}@keyframes fps-attack-tokens-k4{0%{opacity:1}5%{opacity:1}10%{opacity:1}15%{opacity:1}20%{opacity:0}25%{opacity:0}30%{opacity:0}35%{opacity:0}40%{opacity:0}45%{opacity:0}50%{opacity:0}55%{opacity:0}60%{opacity:0}65%{opacity:0}70%{opacity:0}75%{opacity:0}80%{opacity:1}85%{opacity:1}90%{opacity:1}95%{opacity:1}100%{opacity:1}}\n</style>\n<text class=\"fps-attack-tokens-h\" x=\"24\" y=\"28\">Token pool: 2 of 5 enemies may fire</text>\n<circle class=\"fps-attack-tokens-pl\" cx=\"320\" cy=\"150\" r=\"16\"/>\n<text class=\"fps-attack-tokens-s fps-attack-tokens-c\" x=\"320\" y=\"190\">player</text>\n<g class=\"fps-attack-tokens-k0\"><line class=\"fps-attack-tokens-ln\" x1=\"125.2\" y1=\"85.1\" x2=\"299.1\" y2=\"143.0\"/><circle class=\"fps-attack-tokens-ring\" cx=\"110\" cy=\"80\" r=\"20\"/></g><g class=\"fps-attack-tokens-k1\"><line class=\"fps-attack-tokens-ln\" x1=\"204.3\" y1=\"207.8\" x2=\"300.3\" y2=\"159.8\"/><circle class=\"fps-attack-tokens-ring\" cx=\"190\" cy=\"215\" r=\"20\"/></g><g class=\"fps-attack-tokens-k2\"><line class=\"fps-attack-tokens-ln\" x1=\"435.7\" y1=\"207.8\" x2=\"339.7\" y2=\"159.8\"/><circle class=\"fps-attack-tokens-ring\" cx=\"450\" cy=\"215\" r=\"20\"/></g><g class=\"fps-attack-tokens-k3\"><line class=\"fps-attack-tokens-ln\" x1=\"514.8\" y1=\"85.1\" x2=\"340.9\" y2=\"143.0\"/><circle class=\"fps-attack-tokens-ring\" cx=\"530\" cy=\"80\" r=\"20\"/></g><g class=\"fps-attack-tokens-k4\"><line class=\"fps-attack-tokens-ln\" x1=\"320.0\" y1=\"72.0\" x2=\"320.0\" y2=\"128.0\"/><circle class=\"fps-attack-tokens-ring\" cx=\"320\" cy=\"56\" r=\"20\"/></g><circle class=\"fps-attack-tokens-en\" cx=\"110\" cy=\"80\" r=\"13\"/><circle class=\"fps-attack-tokens-en\" cx=\"190\" cy=\"215\" r=\"13\"/><circle class=\"fps-attack-tokens-en\" cx=\"450\" cy=\"215\" r=\"13\"/><circle class=\"fps-attack-tokens-en\" cx=\"530\" cy=\"80\" r=\"13\"/><circle class=\"fps-attack-tokens-en\" cx=\"320\" cy=\"56\" r=\"13\"/>\n<circle class=\"fps-attack-tokens-ring\" cx=\"36\" cy=\"270\" r=\"8\"/>\n<text class=\"fps-attack-tokens-s\" x=\"52\" y=\"275\">holds a token, may fire</text>\n<circle class=\"fps-attack-tokens-en\" cx=\"262\" cy=\"270\" r=\"6\"/>\n<text class=\"fps-attack-tokens-s\" x=\"276\" y=\"275\">no token: flank, reload, take cover</text>\n</svg>"
        },
        {
          "type": "h",
          "text": "Netcode, briefly"
        },
        {
          "type": "p",
          "text": "The deep dive on competitive play is a separate topic. For an FPS the shape is this. The server is **authoritative**: it runs the real simulation at a fixed **tick rate** (commonly 20 to 128 Hz; 64 Hz is 15.6 ms per tick) and decides every hit. Clients send input commands each tick and get **snapshots** back, delta-compressed against the last one they acknowledged. Three techniques hide the latency."
        },
        {
          "type": "list",
          "items": [
            "**Client-side prediction.** The client applies its own commands at once with the shared movement code, so moving feels instant. It keeps the unacknowledged commands in a buffer.",
            "**Reconciliation.** When a snapshot arrives, start from the server's state for that tick, replay the unacknowledged commands, and compare with what was predicted. Small errors are blended away over about 100 ms; large ones snap.",
            "**Entity interpolation.** Other players are drawn about 100 ms in the past (two snapshots at 20 Hz), blending between two real snapshots. They move smoothly, but the shooter is aiming at where they were."
          ]
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "void OnSnapshot(Snapshot s)\n{\n    pending.DiscardUpTo(s.lastProcessedCmd);       // server has seen these\n    PlayerState state = s.localState;              // authoritative at that tick\n    foreach (var cmd in pending)                   // replay the rest on top\n        state = Movement.Step(state, cmd, tickDt);\n\n    float err = Vector3.Distance(predicted.pos, state.pos);\n    if (err > 1.0f)       renderOffset = Vector3.zero;                 // large: snap\n    else if (err > 0.01f) renderOffset += predicted.pos - state.pos;   // small: smooth\n    predicted = state;                                                  // offset decays per frame\n}"
        },
        {
          "type": "p",
          "text": "Interpolation creates the shooting problem. The shooter's screen is about 150 ms old (50 ms of one-way latency plus 100 ms of interpolation), and the shot takes another 50 ms to arrive. If the server tested the ray against current positions, the player would have to lead every target by 200 ms. **Lag compensation** fixes that. The server keeps a short history of every hitbox, about 250 ms: with 16 players, 15 hitboxes and 28 bytes per pose per tick that is around 100 KB. When a shot arrives, the server rewinds all other players to the shooter's view time (command timestamp minus interpolation delay), runs the raycast, then restores the present."
        },
        {
          "type": "figure",
          "id": "fps-lag-comp",
          "caption": "The shooter aims at a target that the server already moved behind cover; the server rewinds the hitbox to the shooter's view time, so the shot counts.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Lag compensation timeline. The shooter's screen shows the target about 150 milliseconds behind the server. By the time the shot arrives the target is behind cover on the server, so the server rewinds its hitbox to the position the shooter saw and counts a hit.\"><style>\n.fps-lag-comp-t{font-size:13px;fill:var(--fig-ink)}.fps-lag-comp-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.fps-lag-comp-s{font-size:13px;fill:var(--fig-muted)}.fps-lag-comp-c{text-anchor:middle}.fps-lag-comp-e{text-anchor:end}\n.fps-lag-comp-lane{stroke:var(--fig-line);stroke-width:2;stroke-dasharray:3 5}\n.fps-lag-comp-wall{fill:var(--fig-panel);stroke:var(--fig-muted);stroke-width:1.5}\n.fps-lag-comp-da{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2}\n.fps-lag-comp-db{fill:var(--fig-accent2);stroke:var(--fig-bg);stroke-width:2}\n.fps-lag-comp-shot{stroke:var(--fig-warn);stroke-width:2.5;fill:none}.fps-lag-comp-shotf{fill:var(--fig-warn)}\n.fps-lag-comp-rw{fill:var(--fig-ok);fill-opacity:.15;stroke:var(--fig-ok);stroke-width:2;stroke-dasharray:4 3}\n.fps-lag-comp-ok{font-size:14px;font-weight:600;fill:var(--fig-ok)}\n.fps-lag-comp-ma{animation:fps-lag-comp-ma 6s linear infinite}\n@keyframes fps-lag-comp-ma{0%,10%{transform:translateX(180px)}60%,100%{transform:translateX(440px)}}\n.fps-lag-comp-mb{animation:fps-lag-comp-mb 6s linear infinite}\n@keyframes fps-lag-comp-mb{0%{transform:translateX(180px)}50%,100%{transform:translateX(440px)}}\n.fps-lag-comp-o1{animation:fps-lag-comp-o1 6s linear infinite}\n@keyframes fps-lag-comp-o1{0%,50%{opacity:0}54%,70%{opacity:1}76%,100%{opacity:0}}\n.fps-lag-comp-o2{animation:fps-lag-comp-o2 6s linear infinite}\n@keyframes fps-lag-comp-o2{0%,56%{opacity:0}60%,88%{opacity:1}94%,100%{opacity:0}}\n</style>\n<text class=\"fps-lag-comp-h\" x=\"24\" y=\"28\">One target, two timelines</text>\n<text class=\"fps-lag-comp-s\" x=\"24\" y=\"66\">Shooter's screen (the past)</text>\n<line class=\"fps-lag-comp-lane\" x1=\"170\" y1=\"96\" x2=\"560\" y2=\"96\"/>\n<text class=\"fps-lag-comp-s\" x=\"24\" y=\"170\">Server (the present)</text>\n<line class=\"fps-lag-comp-lane\" x1=\"170\" y1=\"200\" x2=\"560\" y2=\"200\"/>\n<g class=\"fps-lag-comp-ma\" transform=\"translate(180,0)\"><circle class=\"fps-lag-comp-da\" cx=\"0\" cy=\"96\" r=\"9\"/></g>\n<g class=\"fps-lag-comp-mb\" transform=\"translate(180,0)\"><circle class=\"fps-lag-comp-db\" cx=\"0\" cy=\"200\" r=\"9\"/></g>\n<rect class=\"fps-lag-comp-wall\" x=\"420\" y=\"74\" width=\"40\" height=\"44\" rx=\"4\"/>\n<rect class=\"fps-lag-comp-wall\" x=\"420\" y=\"178\" width=\"40\" height=\"44\" rx=\"4\"/>\n<text class=\"fps-lag-comp-s fps-lag-comp-c\" x=\"440\" y=\"68\">cover</text>\n<text class=\"fps-lag-comp-s fps-lag-comp-c\" x=\"440\" y=\"172\">cover</text>\n<g class=\"fps-lag-comp-o1\"><line class=\"fps-lag-comp-shot\" x1=\"409\" y1=\"116\" x2=\"409\" y2=\"176\"/><path class=\"fps-lag-comp-shotf\" d=\"M409 184l-6 -12h12z\"/><text class=\"fps-lag-comp-t fps-lag-comp-e\" x=\"399\" y=\"150\">shot + view time</text></g>\n<g class=\"fps-lag-comp-o2\"><circle class=\"fps-lag-comp-rw\" cx=\"409\" cy=\"200\" r=\"15\"/><text class=\"fps-lag-comp-ok fps-lag-comp-c\" x=\"409\" y=\"246\">rewound: HIT</text></g>\n<text class=\"fps-lag-comp-s\" x=\"24\" y=\"284\">rewind = RTT 100 ms + interpolation 100 ms, about 200 ms</text>\n</svg>"
        },
        {
          "type": "p",
          "text": "The price is the **shot around the corner**. The target ran behind cover on the server 200 ms ago, and still dies. Favouring the shooter means the player who acts gets the benefit of the doubt, and the player being shot pays. Teams cap the rewind (a few hundred ms at most) so a 300 ms ping cannot reach far into the past, and accept that victims sometimes die slightly behind cover: at 6 m/s, a 0.1 s rewind puts them about 0.6 m past the corner. The alternative, favouring the defender, makes shots miss on screen whenever the shooter has latency."
        },
        {
          "type": "h",
          "text": "Level design, culling and audio"
        },
        {
          "type": "p",
          "text": "The 16.6 ms budget (8.3 ms at 120 Hz) is spent in the worst view of the level, not the average. **Occlusion culling** decides what is hidden. Quake-style engines precompute a **PVS**, a bit set per BSP leaf listing which leaves can see each other, so visibility becomes a lookup. **Portal** systems split the level into cells connected by doors and clip the frustum through each opening. Unity's baked occlusion culling (Umbra) stores cell data and tests objects against occluders at run time. GPU depth-based culling needs no bake but costs a depth pass and often tests against the previous frame's depth. Without any of them you pay for every hidden room in vertex and overdraw cost. This makes level design a performance tool. A turn, a door or a height change every 20 to 30 m cuts long sightlines. That keeps the potentially visible set small and, at the same time, controls where sniping is possible and where enemies can see you. Long sightlines should be deliberate, with cheaper geometry and LODs set up for them. The same geometry feeds **audio occlusion**: one to three raycasts from listener to source (updated around 10 Hz, not per frame) lower volume and apply a low-pass filter when walls are in the way, and reverb zones per room give space. Cap the number of real voices (32 to 64 is typical) and let quieter ones be virtual. In a competitive game, correct footsteps are information, not decoration."
        },
        {
          "type": "h",
          "text": "Decisions and why they work"
        },
        {
          "type": "list",
          "items": [
            "**Authoritative server.** Clients cannot invent hits, positions or damage, which is the base of cheat resistance. It costs a round trip of latency, which prediction, interpolation and lag compensation then hide.",
            "**One shared movement function.** Prediction only works if client and server run the same step on the same inputs. Two implementations drift apart and the player rubber-bands. The cost is that movement must be deterministic enough, with no use of frame time or random values.",
            "**Raw, unsmoothed input.** One count of mouse movement always gives the same angle, so muscle memory transfers. Smoothing adds lag and acceleration changes the angle, and both make aim feel unreliable.",
            "**Hitboxes, not meshes.** Capsules are cheap, stable and tunable, and a ray test costs almost nothing. Mesh tests cost far more and tie fairness to art changes. The cost is a mismatch (shots through visible limbs) that artists and designers must tune.",
            "**Hitscan for bullets, projectiles for slow weapons.** Where flight time is a few ticks at most, simulating it adds netcode work and no feel. Projectiles stay for weapons whose travel time is the gameplay.",
            "**Lag compensation favouring the shooter.** What you see is what you hit, so high-ping players are not locked out. The price is shots around corners, bounded by a rewind cap.",
            "**Weapons as data, recoil seeded from the shot index.** Designers can balance without code, and the client and server compute the same bullet path. The alternative, random recoil on each side, produces hits the client does not see.",
            "**Tokens and telegraphs for AI.** Limiting simultaneous attackers and adding aim delay makes fights readable and difficulty a number. The cost is that enemies sometimes wait, so they need cover and flank behaviours that keep them looking active.",
            "**Separate view-model camera.** The gun never clips and does not stretch with the FOV slider. It costs one extra camera and some shadow work."
          ]
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "The server must pose hitboxes the same way the client sees them. If a dedicated server skips animation to save CPU, hitboxes stay at the bind pose and players report shots that hit the visible body but do nothing. Likewise, do not read the mouse in `FixedUpdate` or use `Time.deltaTime` inside shared movement code: movement must be a function of the command and the fixed tick time. Check both with a replay test, not by feel."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Delegate the plumbing and keep the feel for yourself. Agents are good at: ScriptableObject weapon schemas, hitbox setup from a skeleton, object pools for decals, behaviour tree and token manager scaffolding, and EditMode tests. Ask for tests that assert things you can compute: a step function that gives the same result on 1,000 replayed command sequences, a fire-rate test that checks 600 RPM yields 60 shots over 6 s at 64 Hz, falloff and bone-multiplier arithmetic, and a token manager that never grants more than the pool size. Verify by hand: recoil and spread feel, FOV and sensitivity, the cost of the rewind, and how cover and AI timings play. Agents tend to smooth input, use `Time.deltaTime` in shared code and call `Instantiate` in the fire path, so list those as rules up front and ask them to grep for each."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Shots hit on the shooter's screen but the server calls them misses, and the miss rate grows with ping",
              "use": "Server-side lag compensation (rewind hitboxes)",
              "why": "The server tests the ray against hitboxes at the shooter's view time (the command's time minus the interpolation delay). What you see is what you hit. Cap the rewind so very high ping cannot reach far back."
            },
            {
              "signal": "Your own movement rubber-bands or feels delayed by ping in an online game",
              "use": "Client prediction plus server reconciliation",
              "why": "Apply inputs immediately with the shared movement code and keep unacknowledged commands. On each snapshot, restart from the server state and replay them, so only real disagreement shows as a correction."
            },
            {
              "signal": "Other players look choppy or teleport between snapshots at 20 to 64 Hz",
              "use": "Entity interpolation, about 100 ms behind",
              "why": "Blending between two buffered snapshots gives smooth motion and absorbs a lost packet. The price is that you see the past, which lag compensation then accounts for. Shrink the buffer at higher snapshot rates."
            },
            {
              "signal": "The gun clips into walls up close, or raising the FOV slider stretches the weapon model",
              "use": "Separate view-model camera, own FOV and depth",
              "why": "A second camera with its own FOV, near and far planes and a cleared depth buffer draws the gun on top. It no longer clips, and the weapon looks the same at FOV 90 or 110."
            },
            {
              "signal": "Four or more enemies fire at the player together; fights feel unfair and unreadable",
              "use": "Attack tokens, 2 or 3 at once",
              "why": "Only token holders may fire, the others flank, reload or take cover. Add an aim delay before the first shot. Threat becomes readable, and difficulty becomes a pool size rather than enemy damage."
            },
            {
              "signal": "Frame time spikes in big open rooms, although most views of the level are cheap",
              "use": "Break sightlines and bake occlusion",
              "why": "Cost is set by the worst view. Turns, doors and height changes every 20 to 30 m, plus PVS, portals or baked occlusion, shrink the visible set. Long sightlines are kept on purpose, with LODs prepared."
            },
            {
              "signal": "Hit tests against the character mesh are slow, and every art change shifts what counts as a hit",
              "use": "Per-bone hitbox capsules with multipliers",
              "why": "Cheap capsules on skeleton bones give a stable, tunable shape, and each carries a damage multiplier. A ray against them is far cheaper than a mesh test, and fairness no longer depends on art."
            },
            {
              "signal": "Sustained automatic fire causes hitches from decals and impact effects being instantiated",
              "use": "Pooled ring buffer of decals and effects",
              "why": "Preallocate 100 to 200 decals and reuse the oldest. No allocation or garbage collection happens during fire, and the oldest bullet holes are the ones the player has stopped looking at."
            }
          ]
        }
      ],
      "keyPoints": [
        "Movement is a hand-tuned velocity model (friction, then clamped acceleration) on a kinematic capsule, shared by client and server so prediction works.",
        "Aim uses raw, unsmoothed mouse deltas, a separate view-model camera, and a horizontal FOV the player can change.",
        "Weapons are data: fire rate stored as RPM with a fractional cooldown, falloff curves, seeded recoil, and per-bone hitbox multipliers.",
        "Hits are rays against simple per-bone hitboxes, never the render mesh; hitscan fits bullets, projectiles fit slow weapons.",
        "Server authority with prediction, interpolation and lag compensation makes online play feel instant, at the price of shots around corners.",
        "AI combines perception, navmesh, cover and a decision layer, and attack tokens limit simultaneous attackers; level sightlines and occlusion decide the frame budget."
      ],
      "quiz": [
        {
          "q": "In the Quake-style `Accelerate` function, why can a player in the air gain speed beyond the run limit by turning the mouse while holding a strafe key?",
          "options": [
            "Air friction is zero, so every speed limit is skipped in the air",
            "The clamp is along the wish direction, which turning rotates",
            "Air acceleration is always larger than ground acceleration in Quake",
            "The velocity is scaled by the camera's yaw each tick, adding speed"
          ],
          "answer": 1,
          "explain": "The limit is `wishSpeed - dot(velocity, wishDir)`. Rotating the wish direction makes the old velocity project to less than the limit, so there is room to add more speed. Missing friction alone only stops decay, and Quake's air acceleration is lower than ground acceleration, not higher."
        },
        {
          "q": "A rifle is 600 RPM on a 64 Hz server. What is the safest way to enforce its fire rate?",
          "options": [
            "Wait 6 ticks between shots, since 6 is the closest whole number",
            "Wait 7 ticks between shots so the weapon never fires too fast",
            "Fire on the client and let the server accept any shot it receives",
            "Keep a fractional next-fire time and add 0.1 s on each shot"
          ],
          "answer": 3,
          "explain": "At 64 Hz, 600 RPM is 6.4 ticks per shot. Six ticks gives 640 RPM and seven ticks gives 549 RPM, which silently rebalances the gun. Accumulating 0.1 s keeps the exact rate, and the server must still check it, so trusting the client breaks authority."
        },
        {
          "q": "What is the real cost of server-side lag compensation that favours the shooter?",
          "options": [
            "A defender can be hit shortly after reaching cover, by about the rewind time",
            "Shooters with high ping must lead their targets by their round trip time",
            "The tick rate must be doubled, or hit detection becomes unreliable",
            "The shooter's own movement is delayed by the interpolation buffer"
          ],
          "answer": 0,
          "explain": "The server tests against the world the shooter saw, so a target that already moved behind cover on the server can still be hit. Leading targets is what you get without compensation. Own movement is handled by prediction, and the tick rate is not tied to compensation."
        },
        {
          "q": "Why do FPS games raycast against per-bone capsule hitboxes and not the character's render mesh?",
          "options": [
            "Render meshes cannot be placed on a collision layer in Unity",
            "Unity raycasts ignore mesh colliders on moving characters",
            "Capsules are cheap and stable, with a multiplier per body part",
            "Hitboxes make the weapon's range falloff curve unnecessary"
          ],
          "answer": 2,
          "explain": "A skinned mesh has tens of thousands of triangles whose true positions live on the GPU, and fairness would change with every art edit. Capsules are a handful of arithmetic per test and carry damage multipliers. Layers are not the issue, raycasts do hit moving mesh colliders, and falloff still applies."
        },
        {
          "q": "A client predicted its position for tick 120. A snapshot for tick 120 arrives while the client is on tick 126, and the positions differ by 4 cm. What should it do?",
          "options": [
            "Restart from the server state and replay inputs 121 to 126, then smooth",
            "Replace its position with the server's tick 120 position directly",
            "Ignore the snapshot, since the client is six ticks ahead anyway",
            "Pause input until the server confirms ticks 121 to 126 as well"
          ],
          "answer": 0,
          "explain": "Reconciliation restarts from the authoritative state and replays the commands the server has not processed, so the result is consistent with the server and still ahead in time. Snapping to the old tick 120 position undoes six ticks of movement, ignoring it lets errors grow, and pausing input adds latency."
        },
        {
          "q": "Playtesters say that six enemies shooting at the same moment feels unfair and the fights are chaos. Which move from the patterns fits?",
          "options": [
            "Halve every enemy's accuracy so their shots miss more often",
            "Randomise each enemy's fire delay between 0 and 2 seconds",
            "Use attack tokens so only two or three enemies may fire at once",
            "Add more player health so the player survives the first volley"
          ],
          "answer": 2,
          "explain": "A token pool caps simultaneous attackers and gives the rest other jobs, so the threat becomes readable. Lower accuracy keeps the clumping and makes enemies look blind. Random delays still allow overlap, and more health only delays the same chaos."
        }
      ]
    },
    {
      "id": "case-open-world-rpg",
      "title": "Case study: Open-world RPG",
      "minutes": 18,
      "summary": "How an open-world RPG streams a world too big to hold, keeps float precision and simulation cost under control, and stores content, rules and saves as data.",
      "lesson": [
        {
          "type": "p",
          "text": "A player gallops across a valley. Twenty seconds ago the town behind them had 200 NPCs, 3,000 props and a half-finished quest. Now none of it is in memory. Yet the shopkeeper they insulted must still be angry when they ride back an hour later, and the barrel they moved must still sit where they left it. An open-world RPG is built around that promise: the world is far larger than the machine can hold or simulate, and the player must never see the seams. This teardown follows one such game, described generically, from the streaming grid down to the save file."
        },
        {
          "type": "h",
          "text": "Components"
        },
        {
          "type": "list",
          "items": [
            "**Streaming.** A grid of cells around the player. Cells load and unload within a memory budget.",
            "**Rendering LOD.** LODs, HLOD proxies, impostors and terrain tiles keep distant scenery cheap.",
            "**World space.** A floating origin keeps coordinates small enough for single-precision floats.",
            "**Simulation LOD.** Full AI near the player, coarse schedules further out, plain records far away.",
            "**Content database.** Items, NPCs, quests and dialogue are data assets that designers edit without code.",
            "**Rules layer.** A stat modifier pipeline, inventory, quest state machines and dialogue conditions over shared world facts.",
            "**Event bus.** Typed events let systems react to each other without direct references.",
            "**Save system.** Stable object IDs, diffs from the authored baseline, versioned files, background writes."
          ]
        },
        {
          "type": "p",
          "text": "Data flows one way. The streamer decides which cells exist. Each loaded cell builds its objects from data assets and applies the saved diff for that cell. Gameplay changes objects and publishes events. The quest system turns events into facts, facts feed dialogue and quest conditions, and a change tracker records what differs from the baseline. That record is the save."
        },
        {
          "type": "h",
          "text": "World streaming: cells and two radii"
        },
        {
          "type": "p",
          "text": "The world is cut into a square grid of cells, here 128 m on a side. A cell is the unit of loading: its terrain tile, static props, lights, navmesh patch, NPC spawn records and vegetation. Every few frames the streamer measures the player's distance to each cell centre. Inside the **load radius** (3 cells, 384 m) a cell is requested. Outside the **unload radius** (4 cells, 512 m) a loaded cell is released. Between the two radii nothing changes. That gap is **hysteresis**. With one shared radius, a player pacing along a border makes a cell load, unload and load again. Each load costs disk reads, decompression, instantiation and usually a hitch, so the same price is paid repeatedly for nothing. A one-cell band makes the border free."
        },
        {
          "type": "figure",
          "id": "rpg-stream-grid",
          "caption": "The ring is the load radius and the dashed ring the unload radius: cells turn on ahead of the player and turn off only once they are well behind. Drawn at 2 and 3 cells to fit; the game in the text uses 3 and 4.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"Top-down view of a cell grid around a player moving right. Cells inside the inner load ring turn from empty to loading to loaded; cells leave only when they fall outside the larger unload ring, so the gap between the rings prevents thrashing.\"><style>.rpg-stream-grid-t{font-size:12px;fill:var(--fig-muted)}.rpg-stream-grid-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.rpg-stream-grid-c{fill-opacity:.5;fill:var(--fig-panel)}.rpg-stream-grid-on{fill:var(--fig-accent)}.rpg-stream-grid-l{fill:var(--fig-accent)}.rpg-stream-grid-e{fill:var(--fig-panel)}.rpg-stream-grid-a{animation-duration:8s;animation-timing-function:step-end;animation-iteration-count:infinite}.rpg-stream-grid-g{fill:none;stroke:var(--fig-line);stroke-width:1}.rpg-stream-grid-rl{fill:none;stroke:var(--fig-accent);stroke-width:2.5}.rpg-stream-grid-ru{fill:none;stroke:var(--fig-muted);stroke-width:2;stroke-dasharray:6 5}.rpg-stream-grid-pd{fill:var(--fig-ink);stroke:var(--fig-bg);stroke-width:2}.rpg-stream-grid-pl{animation:rpg-stream-grid-mv 8s linear infinite}@keyframes rpg-stream-grid-mv{0%{transform:translateX(136px)}80%,100%{transform:translateX(296px)}}.rpg-stream-grid-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.rpg-stream-grid-sw{stroke:var(--fig-line);stroke-width:1}@keyframes rpg-stream-grid-k1{0%{fill:var(--fig-accent)}26.6%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k2{0%{fill:var(--fig-accent)}30.1%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k3{0%{fill:var(--fig-accent)}46.6%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k4{0%{fill:var(--fig-accent)}50.1%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k5{0%{fill:var(--fig-panel)}10%{fill:var(--fig-warn)}17%{fill:var(--fig-accent)}54.8%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k6{0%{fill:var(--fig-accent)}66.6%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k7{0%{fill:var(--fig-accent)}70.1%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k8{0%{fill:var(--fig-panel)}30%{fill:var(--fig-warn)}37%{fill:var(--fig-accent)}74.8%{fill:var(--fig-panel)}}@keyframes rpg-stream-grid-k9{0%{fill:var(--fig-panel)}50%{fill:var(--fig-warn)}57.1%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k10{0%{fill:var(--fig-panel)}15.4%{fill:var(--fig-warn)}22.4%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k11{0%{fill:var(--fig-panel)}10%{fill:var(--fig-warn)}17%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k12{0%{fill:var(--fig-panel)}70%{fill:var(--fig-warn)}77%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k13{0%{fill:var(--fig-panel)}35.4%{fill:var(--fig-warn)}42.4%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k14{0%{fill:var(--fig-panel)}30%{fill:var(--fig-warn)}37%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k15{0%{fill:var(--fig-panel)}55.4%{fill:var(--fig-warn)}62.5%{fill:var(--fig-accent)}}@keyframes rpg-stream-grid-k16{0%{fill:var(--fig-panel)}75.4%{fill:var(--fig-warn)}82.5%{fill:var(--fig-accent)}}</style><path class=\"rpg-stream-grid-c rpg-stream-grid-e\" d=\"M16 40h40v40h-40zM16 80h40v40h-40zM16 120h40v40h-40zM16 160h40v40h-40zM16 200h40v40h-40zM56 40h40v40h-40zM56 200h40v40h-40zM96 40h40v40h-40zM96 200h40v40h-40zM296 40h40v40h-40zM296 200h40v40h-40zM336 40h40v40h-40zM336 200h40v40h-40zM376 40h40v40h-40zM376 80h40v40h-40zM376 120h40v40h-40zM376 160h40v40h-40zM376 200h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k1\" d=\"M56 80h40v40h-40zM56 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k2\" d=\"M56 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k3\" d=\"M96 80h40v40h-40zM96 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k4\" d=\"M96 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k5\" d=\"M136 40h40v40h-40zM136 200h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k6\" d=\"M136 80h40v40h-40zM136 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a rpg-stream-grid-on\" style=\"animation-name:rpg-stream-grid-k7\" d=\"M136 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k8\" d=\"M176 40h40v40h-40zM176 200h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-l\" d=\"M176 80h40v40h-40zM176 120h40v40h-40zM176 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k9\" d=\"M216 40h40v40h-40zM216 200h40v40h-40zM296 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k10\" d=\"M216 80h40v40h-40zM216 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k11\" d=\"M216 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k12\" d=\"M256 40h40v40h-40zM256 200h40v40h-40zM336 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k13\" d=\"M256 80h40v40h-40zM256 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k14\" d=\"M256 120h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k15\" d=\"M296 80h40v40h-40zM296 160h40v40h-40z\"/><path class=\"rpg-stream-grid-c rpg-stream-grid-a\" style=\"animation-name:rpg-stream-grid-k16\" d=\"M336 80h40v40h-40zM336 160h40v40h-40z\"/><path class=\"rpg-stream-grid-g\" d=\"M16 40v200M56 40v200M96 40v200M136 40v200M176 40v200M216 40v200M256 40v200M296 40v200M336 40v200M376 40v200M416 40v200M16 40h400M16 80h400M16 120h400M16 160h400M16 200h400M16 240h400\"/><g class=\"rpg-stream-grid-pl\" transform=\"translate(136,0)\"><circle class=\"rpg-stream-grid-ru\" cy=\"140\" r=\"120\"/><circle class=\"rpg-stream-grid-rl\" cy=\"140\" r=\"80\"/><circle class=\"rpg-stream-grid-pd\" cy=\"140\" r=\"7\"/></g><rect class=\"rpg-stream-grid-pn\" x=\"436\" y=\"24\" width=\"188\" height=\"252\" rx=\"12\"/><text class=\"rpg-stream-grid-h\" x=\"452\" y=\"50\">Streaming grid</text><rect class=\"rpg-stream-grid-c rpg-stream-grid-l rpg-stream-grid-sw\" x=\"452\" y=\"64\" width=\"16\" height=\"16\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"77\">loaded</text><rect class=\"rpg-stream-grid-c rpg-stream-grid-sw\" style=\"fill:var(--fig-warn)\" x=\"452\" y=\"88\" width=\"16\" height=\"16\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"101\">loading</text><rect class=\"rpg-stream-grid-c rpg-stream-grid-e rpg-stream-grid-sw\" x=\"452\" y=\"112\" width=\"16\" height=\"16\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"125\">unloaded</text><line class=\"rpg-stream-grid-rl\" x1=\"452\" y1=\"144\" x2=\"468\" y2=\"144\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"148\">load ring</text><line class=\"rpg-stream-grid-ru\" x1=\"452\" y1=\"164\" x2=\"468\" y2=\"164\"/><text class=\"rpg-stream-grid-t\" x=\"476\" y=\"168\">unload ring</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"190\">A cell loads inside the</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"204\">inner ring, unloads only</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"218\">outside the outer ring.</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"232\">The gap is hysteresis:</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"246\">stepping back and forth</text><text class=\"rpg-stream-grid-t\" x=\"452\" y=\"260\">on a border is free.</text><text class=\"rpg-stream-grid-t\" x=\"16\" y=\"280\">rings drawn at 2 and 3 cells to fit; player moves right</text></svg>"
        },
        {
          "type": "p",
          "text": "Loading is asynchronous. File reads and decompression run on worker threads. Only the last step, creating objects and uploading GPU data, touches the main thread. Requests wait in a priority queue, scored by distance weighted by view direction, so a cell 300 m ahead loads before one 200 m behind. A request that leaves the load radius before it starts is cancelled. A hard **memory budget** bounds the whole system. Peak residency is set by the unload radius: about pi x 4² = 50 cells. If the platform leaves about 1.5 GB for streamed content and a cell averages about 30 MB, that matches the budget. The radii come out of the budget, not the other way round. If cell sizes vary, the streamer tracks bytes instead of counts and evicts the worst-priority loaded cell first."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "float Priority(Cell c, Vector3 player, Vector3 view)   // lower = load first\n{\n    Vector3 to = c.Center - player;\n    float d = to.magnitude;\n    float ahead = Mathf.Max(0f, Vector3.Dot(view, to / d));  // 0 behind .. 1 ahead\n    return d * (1.5f - ahead);                              // ahead x0.5, behind x1.5\n}\n\nvoid UpdateStreaming(Vector3 player, Vector3 view)\n{\n    foreach (Cell c in grid.CellsNear(player, unloadRadius + cellSize))\n    {\n        float d = Vector3.Distance(c.Center, player);\n        if (c.State == CellState.Unloaded && d <= loadRadius)\n            Enqueue(c, Priority(c, player, view));\n        else if (c.State == CellState.Loaded && d > unloadRadius)\n            Release(c);\n    }\n}"
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "The expensive part of a cell load is instantiation, not the file read. Creating a thousand objects in one frame is a hitch of tens of milliseconds however fast the disk is. Give the main thread a per-frame budget (for example 2 ms), spread a cell over several frames in a fixed order (terrain, collision, props, NPCs) and mark it Loaded only when it is complete. Judge the result by the worst frame on the slowest target device, not the average."
        },
        {
          "type": "h",
          "text": "Drawing far things cheaply"
        },
        {
          "type": "p",
          "text": "Streaming decides what exists. Level of detail decides what each thing costs. Three layers stack. **LOD** swaps a mesh for a cheaper one as its projected size on screen falls, for example LOD0 above 30% of screen height, LOD1 down to 10%, LOD2 below that, with a dithered cross-fade of about 0.3 s to hide the swap. **HLOD** handles groups: a village of 80 buildings is baked offline into one merged mesh with one atlas material, so beyond about 300 m it costs a few draws instead of hundreds. **Impostors** replace complex shapes such as trees with camera-facing quads captured from many angles (for example 8 x 8 views): a few triangles that still shade plausibly. Each layer trades disk space and bake time for runtime draw calls."
        },
        {
          "type": "p",
          "text": "Terrain is its own case. It is a heightmap, a grid of 16-bit heights stored in tiles. A tile of 513 x 513 samples covers 512 m at 1 m spacing and takes about 0.5 MB. The 2^n + 1 size lets neighbouring tiles share an edge row, so there are no gaps. Each tile has a chain of LODs that halve the resolution per step (513, 257, 129, 65 samples), and the last step has about 60 times fewer vertices. Where two LODs meet, skirts or edge stitching hide the cracks. Ground textures come from a per-tile splat map. Grass and rocks are scattered at load time from density masks with a fixed seed, so they look identical every time the cell loads and never need saving."
        },
        {
          "type": "h",
          "text": "Floating origin"
        },
        {
          "type": "p",
          "text": "A 32-bit float has a 24-bit significand, so the gap between neighbouring values grows with magnitude. For a value in [2^e, 2^(e+1)) the gap is 2^(e-23). At 1 km from the origin it is about 0.06 mm. Between 4 and 8 km it is about 0.5 mm, at 16 to 32 km about 2 mm and near 100 km about 8 mm. Those are rounding steps for a single number. Transform chains, physics solvers and skinning combine several such numbers, so jitter in shadows, animation and contacts shows up long before the raw gap looks large. A 10 km world is already uncomfortable in plain floats."
        },
        {
          "type": "figure",
          "id": "rpg-float-origin",
          "caption": "The gap doubles every time the distance doubles. The marker shows what the shift does: the player never climbs past 1 km, so the gap never exceeds 0.06 mm.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"Log-log chart of the gap between adjacent 32-bit float positions against distance from the world origin: about 0.06 mm at 1 km, 0.5 mm at 5 km and 8 mm at 100 km. A marker climbs the curve to 1 km, then the world origin shifts and the marker returns near zero.\"><style>.rpg-float-origin-t{font-size:12px;fill:var(--fig-muted)}.rpg-float-origin-k{font-size:11px;fill:var(--fig-muted)}.rpg-float-origin-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.rpg-float-origin-g{fill:none;stroke:var(--fig-line);stroke-width:1}.rpg-float-origin-ax{fill:none;stroke:var(--fig-muted);stroke-width:1.5}.rpg-float-origin-cv{fill:none;stroke:var(--fig-accent2);stroke-width:2.5;stroke-linejoin:round}.rpg-float-origin-zn{fill:var(--fig-ok);fill-opacity:.12}.rpg-float-origin-dl{stroke:var(--fig-ok);stroke-width:1.5;stroke-dasharray:5 4}.rpg-float-origin-da{fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2}.rpg-float-origin-dw{fill:var(--fig-warn);stroke:var(--fig-bg);stroke-width:2}.rpg-float-origin-db{fill:var(--fig-bad);stroke:var(--fig-bg);stroke-width:2}.rpg-float-origin-mk{fill:var(--fig-ink);stroke:var(--fig-bg);stroke-width:2;animation:rpg-float-origin-mv 6s linear infinite}@keyframes rpg-float-origin-mv{0%{transform:translate(76px,226.9px)}3%{transform:translate(86.2px,226.9px)}6%{transform:translate(96.4px,226.9px)}9%{transform:translate(106.6px,214.9px)}12%{transform:translate(116.8px,214.9px)}15%{transform:translate(127px,202.9px)}18%{transform:translate(137.2px,202.9px)}21%{transform:translate(147.4px,190.8px)}24%{transform:translate(157.6px,190.8px)}27%{transform:translate(167.8px,178.8px)}30%{transform:translate(178px,178.8px)}33%{transform:translate(188.2px,166.7px)}36%{transform:translate(198.4px,166.7px)}39%{transform:translate(208.6px,154.7px)}42%{transform:translate(218.8px,154.7px)}45%{transform:translate(229px,142.7px)}48%{transform:translate(239.2px,142.7px)}51%{transform:translate(249.4px,130.6px)}54%{transform:translate(259.6px,130.6px)}57%{transform:translate(269.8px,118.6px)}60%{transform:translate(280px,118.6px)}60%{transform:translate(280px,118.6px)}70%{transform:translate(280px,118.6px)}71%,100%{transform:translate(76px,226.9px)}}.rpg-float-origin-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}</style><rect class=\"rpg-float-origin-zn\" x=\"76\" y=\"30\" width=\"204\" height=\"200\"/><path class=\"rpg-float-origin-g\" d=\"M76 230H416M76 190H416M76 150H416M76 110H416M76 70H416M76 30H416\"/><path class=\"rpg-float-origin-ax\" d=\"M76 30V230H416\"/><line class=\"rpg-float-origin-dl\" x1=\"280\" y1=\"30\" x2=\"280\" y2=\"230\"/><polyline class=\"rpg-float-origin-cv\" points=\"76,226.9 96.5,226.9 96.5,214.9 116.9,214.9 116.9,202.9 137.4,202.9 137.4,190.8 157.9,190.8 157.9,178.8 178.4,178.8 178.4,166.7 198.8,166.7 198.8,154.7 219.3,154.7 219.3,142.7 239.8,142.7 239.8,130.6 260.2,130.6 260.2,118.6 280.7,118.6 280.7,106.5 301.2,106.5 301.2,94.5 321.6,94.5 321.6,82.5 342.1,82.5 342.1,70.4 362.6,70.4 362.6,58.4 383.1,58.4 383.1,46.3 403.5,46.3 403.5,34.3 416,34.3\"/><circle class=\"rpg-float-origin-da\" cx=\"280\" cy=\"118.6\" r=\"5.5\"/><circle class=\"rpg-float-origin-dw\" cx=\"327.5\" cy=\"82.5\" r=\"5.5\"/><circle class=\"rpg-float-origin-db\" cx=\"416\" cy=\"34.3\" r=\"5.5\"/><circle class=\"rpg-float-origin-mk\" r=\"6\" transform=\"translate(76,226.9)\"/><text class=\"rpg-float-origin-k\" x=\"70\" y=\"234\" text-anchor=\"end\">0.0001 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"194\" text-anchor=\"end\">0.001 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"154\" text-anchor=\"end\">0.01 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"114\" text-anchor=\"end\">0.1 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"74\" text-anchor=\"end\">1 mm</text><text class=\"rpg-float-origin-k\" x=\"70\" y=\"34\" text-anchor=\"end\">10 mm</text><text class=\"rpg-float-origin-k\" x=\"76\" y=\"250\" text-anchor=\"middle\">1 m</text><text class=\"rpg-float-origin-k\" x=\"144\" y=\"250\" text-anchor=\"middle\">10 m</text><text class=\"rpg-float-origin-k\" x=\"212\" y=\"250\" text-anchor=\"middle\">100 m</text><text class=\"rpg-float-origin-k\" x=\"280\" y=\"250\" text-anchor=\"middle\">1 km</text><text class=\"rpg-float-origin-k\" x=\"348\" y=\"250\" text-anchor=\"middle\">10 km</text><text class=\"rpg-float-origin-k\" x=\"416\" y=\"250\" text-anchor=\"middle\">100 km</text><text class=\"rpg-float-origin-t\" x=\"246\" y=\"270\" text-anchor=\"middle\">distance from world origin (log scale)</text><text class=\"rpg-float-origin-t\" x=\"16\" y=\"22\">float32 position gap</text><text class=\"rpg-float-origin-t\" x=\"416\" y=\"22\" text-anchor=\"end\">no shift: about 8 mm at 100 km</text><text class=\"rpg-float-origin-t\" x=\"288\" y=\"46\">shift at 1 km</text><text class=\"rpg-float-origin-t\" x=\"288\" y=\"134\">1 km: 0.06 mm</text><text class=\"rpg-float-origin-t\" x=\"330\" y=\"102\">5 km: 0.5 mm</text><text class=\"rpg-float-origin-t\" x=\"276\" y=\"218\" text-anchor=\"end\">kept below 0.06 mm</text><rect class=\"rpg-float-origin-pn\" x=\"440\" y=\"30\" width=\"184\" height=\"200\" rx=\"12\"/><text class=\"rpg-float-origin-h\" x=\"454\" y=\"56\">Floating origin</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"82\">Keep the player near 0,0.</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"100\">Past 1 km, subtract the</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"118\">player offset from every</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"136\">root and the camera,</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"154\">and add it to a 64-bit</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"172\">world offset instead.</text><text class=\"rpg-float-origin-t\" x=\"454\" y=\"206\">marker: player after shifts</text></svg>"
        },
        {
          "type": "p",
          "text": "The fix is the **floating origin**. In engine coordinates the player stays near (0, 0, 0) and the world moves. When the player gets farther than a threshold (say 1 km) from the origin, the game subtracts the player's position from every root object, the camera and world-space particles, and adds it to a 64-bit offset. True world position is that double plus the float local position, and it is what streaming, saving and the map use. The shift happens between frames, when no streaming job holds raw positions, and fires an event so everything with cached world coordinates (trails, navmesh agent destinations, audio sources) subtracts the same delta. The alternatives cost more. Doubles everywhere double memory and bandwidth, and GPUs and most physics engines handle them poorly or not at all. Per-cell local coordinates work for static scenery but make cross-cell physics and AI paths awkward."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "const float ShiftThreshold = 1000f;\npublic Vector3d Origin;                  // 64-bit world position of engine (0,0,0)\n\nvoid LateUpdate()\n{\n    Vector3 p = player.position;\n    if (p.sqrMagnitude < ShiftThreshold * ShiftThreshold) return;\n\n    foreach (Transform root in worldRoots) root.position -= p;  // cells and dynamic roots\n    camera.transform.position -= p;\n    Origin += new Vector3d(p.x, p.y, p.z);\n    Physics.SyncTransforms();            // keep colliders in step\n    Events.Publish(new OriginShifted(-p)); // trails, agents, audio subtract this delta\n}"
        },
        {
          "type": "h",
          "text": "Simulation LOD and schedules"
        },
        {
          "type": "p",
          "text": "Rendering LOD saves GPU time. Simulation LOD saves CPU time and is where open worlds are won. NPCs live in three tiers. **Full**, inside the player's active area (about 50 to 100 m): perception, behaviour trees, animation, navmesh steering and physics. **Coarse**, loaded but out of sight: no animation and no perception, just a position that advances along a route at walking speed, updated once or twice a second. **Frozen**, in an unloaded cell: no objects at all, only a record of ID, location and schedule slot. Suppose the AI budget is 2 ms per frame and a full agent costs about 40 µs. Then about 50 full agents fit. 1,000 coarse agents at 2 Hz and about 2 µs per update cost about 0.13 ms per frame at 30 fps. Population can grow ten times while the frame stays flat."
        },
        {
          "type": "p",
          "text": "Schedules are data: a list of (start hour, place, activity) such as 06:00 wake, 08:00 open the shop, 18:00 tavern, 23:00 home. The day and night clock runs at a timescale; a value of 20 means one game day lasts 72 real minutes. The key trick is **catch-up instead of simulation**. A frozen NPC is not walked around for hours while unloaded. When their cell loads, the game reads the clock, finds the schedule slot that is current, and places the NPC where that slot says they are now, mid-route if the route is short, at the destination otherwise. The player sees consistent behaviour and the cost is one lookup. The price is that off-screen life is an approximation, so anything the player can verify (a shop that must be open at noon) must come from the schedule, not from chance."
        },
        {
          "type": "h",
          "text": "Data-driven content, stats and inventory"
        },
        {
          "type": "p",
          "text": "Items, NPCs, spells, quests and dialogue are **data assets**, not classes: ScriptableObjects, database rows or JSON validated at build time. An iron sword is a row with an ID (`item.sword.iron`), a mesh reference, a weight, a base damage and a list of modifiers. Designers add the 2,000th item without a programmer and without a compile. Code defines a few dozen behaviours (weapon, armour, potion, key) and data composes them. The alternative, a subclass per item, grows to thousands of types, forces a rebuild for every balance tweak and blocks modding. The rules: IDs are stable strings and are never renamed (add an alias instead), references between assets use IDs, and a build step fails on missing references and out-of-range values."
        },
        {
          "type": "p",
          "text": "A stat such as move speed is never one number that code increments and decrements. That drifts. Start at 5.0, equip boots (+0.5), drink a potion (x1.2) to get 6.6, then unequip the boots by subtracting 0.5, and you hold 6.1 instead of 5.0 x 1.2 = 6.0. Instead each stat keeps a **base value** and a list of **modifiers**, each tagged with a stage and a source. The final value is rebuilt from scratch: start from the base, add all additive modifiers, multiply by all multiplicative ones, then clamp. Removing a source removes its modifiers exactly. Modifiers are sorted by stage and source, so the result is deterministic in any equip order. It is cached and recomputed only when a modifier changes (a dirty flag), not every frame."
        },
        {
          "type": "figure",
          "id": "rpg-stat-pipeline",
          "caption": "Values flow through fixed stages: base 5.0, plus 0.5, times 1.3 and 1.2, clamped to 8. Any change just marks the stat dirty.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 280\" role=\"img\" aria-label=\"A stat pipeline for move speed: base 5.0, additive modifiers give 5.5, multiplicative modifiers give 8.58, a clamp to a maximum of 8 gives 8.0. A marker moves through the four stages in order. Below, an equip or buff change marks the stat dirty and the value is recomputed on the next read.\"><style>.rpg-stat-pipeline-t{font-size:12px;fill:var(--fig-muted)}.rpg-stat-pipeline-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.rpg-stat-pipeline-r{font-size:16px;font-weight:600;fill:var(--fig-ink)}.rpg-stat-pipeline-bx{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.rpg-stat-pipeline-gl{fill:var(--fig-accent);fill-opacity:.4;opacity:0;animation:rpg-stat-pipeline-gl 6s linear infinite}@keyframes rpg-stat-pipeline-gl{0%{opacity:1}15%,100%{opacity:0}}.rpg-stat-pipeline-ar{fill:none;stroke:var(--fig-muted);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.rpg-stat-pipeline-tr{stroke:var(--fig-line);stroke-width:2}.rpg-stat-pipeline-dt{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:rpg-stat-pipeline-dt 6s linear infinite}@keyframes rpg-stat-pipeline-dt{0%{transform:translateX(80px)}70%,100%{transform:translateX(560px)}}</style><rect class=\"rpg-stat-pipeline-bx\" x=\"16\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><rect class=\"rpg-stat-pipeline-gl\" style=\"animation-delay:0.0s\" x=\"16\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><text class=\"rpg-stat-pipeline-h\" x=\"80\" y=\"68\" text-anchor=\"middle\">Base</text><text class=\"rpg-stat-pipeline-t\" x=\"80\" y=\"94\" text-anchor=\"middle\">walk speed</text><text class=\"rpg-stat-pipeline-t\" x=\"80\" y=\"112\" text-anchor=\"middle\">from data asset</text><text class=\"rpg-stat-pipeline-r\" x=\"80\" y=\"142\" text-anchor=\"middle\">= 5.0</text><path class=\"rpg-stat-pipeline-ar\" d=\"M148 100h20m-6 -5l6 5l-6 5\"/><rect class=\"rpg-stat-pipeline-bx\" x=\"176\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><rect class=\"rpg-stat-pipeline-gl\" style=\"animation-delay:1.4s\" x=\"176\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><text class=\"rpg-stat-pipeline-h\" x=\"240\" y=\"68\" text-anchor=\"middle\">Additive</text><text class=\"rpg-stat-pipeline-t\" x=\"240\" y=\"94\" text-anchor=\"middle\">+0.5 boots</text><text class=\"rpg-stat-pipeline-t\" x=\"240\" y=\"112\" text-anchor=\"middle\">(sum all adds)</text><text class=\"rpg-stat-pipeline-r\" x=\"240\" y=\"142\" text-anchor=\"middle\">= 5.5</text><path class=\"rpg-stat-pipeline-ar\" d=\"M308 100h20m-6 -5l6 5l-6 5\"/><rect class=\"rpg-stat-pipeline-bx\" x=\"336\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><rect class=\"rpg-stat-pipeline-gl\" style=\"animation-delay:2.8s\" x=\"336\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><text class=\"rpg-stat-pipeline-h\" x=\"400\" y=\"68\" text-anchor=\"middle\">Multiplicative</text><text class=\"rpg-stat-pipeline-t\" x=\"400\" y=\"94\" text-anchor=\"middle\">x1.3 haste</text><text class=\"rpg-stat-pipeline-t\" x=\"400\" y=\"112\" text-anchor=\"middle\">x1.2 potion</text><text class=\"rpg-stat-pipeline-r\" x=\"400\" y=\"142\" text-anchor=\"middle\">= 8.58</text><path class=\"rpg-stat-pipeline-ar\" d=\"M468 100h20m-6 -5l6 5l-6 5\"/><rect class=\"rpg-stat-pipeline-bx\" x=\"496\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><rect class=\"rpg-stat-pipeline-gl\" style=\"animation-delay:4.2s\" x=\"496\" y=\"44\" width=\"128\" height=\"112\" rx=\"12\"/><text class=\"rpg-stat-pipeline-h\" x=\"560\" y=\"68\" text-anchor=\"middle\">Clamp</text><text class=\"rpg-stat-pipeline-t\" x=\"560\" y=\"94\" text-anchor=\"middle\">min 0</text><text class=\"rpg-stat-pipeline-t\" x=\"560\" y=\"112\" text-anchor=\"middle\">max 8 (cap)</text><text class=\"rpg-stat-pipeline-r\" x=\"560\" y=\"142\" text-anchor=\"middle\">= 8.0</text><rect class=\"rpg-stat-pipeline-bx\" x=\"16\" y=\"198\" width=\"176\" height=\"36\" rx=\"10\"/><text class=\"rpg-stat-pipeline-t\" x=\"104\" y=\"221\" text-anchor=\"middle\">equip, buff, expiry</text><rect class=\"rpg-stat-pipeline-bx\" x=\"216\" y=\"198\" width=\"140\" height=\"36\" rx=\"10\"/><text class=\"rpg-stat-pipeline-t\" x=\"286\" y=\"221\" text-anchor=\"middle\">mark stat dirty</text><rect class=\"rpg-stat-pipeline-bx\" x=\"380\" y=\"198\" width=\"244\" height=\"36\" rx=\"10\"/><text class=\"rpg-stat-pipeline-t\" x=\"502\" y=\"221\" text-anchor=\"middle\">recompute on next read, cache</text><path class=\"rpg-stat-pipeline-ar\" d=\"M196 216h16m-6 -5l6 5l-6 5M360 216h16m-6 -5l6 5l-6 5\"/><line class=\"rpg-stat-pipeline-tr\" x1=\"80\" y1=\"176\" x2=\"560\" y2=\"176\"/><circle class=\"rpg-stat-pipeline-dt\" cy=\"176\" r=\"6\" transform=\"translate(80,0)\"/><text class=\"rpg-stat-pipeline-h\" x=\"16\" y=\"28\">Move speed (m/s): one pipeline per stat</text><text class=\"rpg-stat-pipeline-t\" x=\"320\" y=\"262\" text-anchor=\"middle\">Fixed stage order and sorted modifiers: same inputs, same result.</text></svg>"
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "enum Stage { Additive = 0, Multiplicative = 1 }\nstruct Modifier { public Stage Stage; public float Value; public int SourceId; }\n\npublic float Get()\n{\n    if (!dirty) return cached;\n    float add = 0f, mul = 1f;\n    foreach (var m in modifiers)                 // kept sorted by (Stage, SourceId)\n        if (m.Stage == Stage.Additive) add += m.Value; else mul *= m.Value;\n    cached = Mathf.Clamp((baseValue + add) * mul, min, max);\n    dirty = false;\n    return cached;\n}\npublic void Remove(int sourceId) { modifiers.RemoveAll(m => m.SourceId == sourceId); dirty = true; }"
        },
        {
          "type": "p",
          "text": "Inventory follows from the same split. A stack is a record: definition ID, count and, for unique items, an instance ID with its own state (durability, enchantment). Equipping adds modifiers with the item instance as the source, and unequipping removes them by source. Carry weight is another stat, and the UI only calls `Get()`. For tooltips the stat can also return its list of contributions (\"base 5.0, boots +0.5, potion x1.2\") from the same data, so the explanation can never disagree with the number."
        },
        {
          "type": "h",
          "text": "Quests, dialogue and the event bus"
        },
        {
          "type": "p",
          "text": "A quest is a **state machine** whose current stage is stored as one world fact, such as `quest.guild.stage = 30`. **World facts** are a flat key-value store of integers: `killed.bandit_leader = 1`, `faction.guild.rep = 3`, `time.day = 12`. Systems write facts and conditions read them. A quest moves from stage 30 to 40 when its condition over facts becomes true. **Dialogue trees** use the same conditions. Each line carries a condition list, the NPC speaks the first line whose conditions pass, and choosing a reply runs effects that write facts. Because quests, dialogue and the world share only facts, a designer adds a reaction (guards mention the stolen ledger) by adding a line with a condition, with no change to quest code."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "struct Condition { public string Fact; public Op Op; public int Value; }\n\nbool Passes(Condition c, Facts f)\n{\n    int v = f.Get(c.Fact);                       // a missing fact reads as 0\n    switch (c.Op)\n    {\n        case Op.Eq: return v == c.Value;\n        case Op.Ge: return v >= c.Value;\n        case Op.Lt: return v <  c.Value;\n        default:    return v != c.Value;\n    }\n}\n\nDialogueLine Pick(DialogueNode n, Facts f)\n{\n    foreach (var line in n.Lines)                // authored in priority order\n        if (line.Conditions.All(c => Passes(c, f))) return line;\n    return n.Fallback;\n}"
        },
        {
          "type": "p",
          "text": "Facts have to come from somewhere. Gameplay code publishes typed events (`EnemyKilled`, `ItemAdded`, `LocationEntered`, `HourChanged`) on an **event bus**, and the quest system, achievements, UI and audio subscribe. The publisher does not know who listens, so adding a system means adding a subscriber. The costs are real: control flow is harder to read, ordering between subscribers matters, and a forgotten unsubscribe keeps a dead object alive. Contain them. Events are plain structs, dispatch happens at one fixed point per frame and never re-entrantly inside the publisher, and development builds log every event so you can answer \"why did this quest advance?\""
        },
        {
          "type": "h",
          "text": "Saving a world you cannot save"
        },
        {
          "type": "p",
          "text": "The player can change anything: move a barrel, empty a chest, kill a merchant. The authored world is gigabytes, so saving all of it would be too big and too slow. The save holds only the **diff** from the authored baseline. Every placed object carries a **stable unique ID** assigned at authoring time, a GUID stored with the object. It is never derived from the name, the position or the index in a list, because designers change all three. A change tracker marks an object dirty when it moves, is destroyed or has its contents changed, so saving costs in proportion to what the player did, not to world size. Loading a cell instantiates the baseline and then applies the diff for that cell's IDs. Objects spawned at runtime take IDs from a counter that is itself saved. A save can stay at a few MB even after tens of hours, plus global state: facts, clock, player and quest stages."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "[Serializable] class SaveFile\n{\n    public int Version = 7;                       // bump on every format change\n    public double PlayTime; public Vector3d PlayerWorldPos;\n    public Dictionary<string, int> Facts;         // all world facts\n    public List<ObjectDelta> Deltas;              // only objects that differ from baseline\n}\n[Serializable] struct ObjectDelta { public Guid Id; public bool Destroyed; public byte[] State; }\n\nvoid OnCellLoaded(Cell cell)\n{\n    foreach (var obj in cell.SpawnBaseline())     // authored objects, each with its Guid\n        if (deltas.TryGetValue(obj.Id, out var d)) obj.Apply(d);  // moved, emptied, destroyed\n}"
        },
        {
          "type": "p",
          "text": "Saves outlive patches. The file starts with a version number and loads through a chain of **migrations**: v5 to v6, then v6 to v7, each a small pure function that rewrites the data (rename a fact, split a field, drop a removed object). Old migrations are never edited, and test fixtures keep a real save from every shipped version. An ID that no longer exists in the baseline is skipped with a warning, not a crash. **Autosave** must not hitch. On the main thread, copy the dirty records into a buffer, which takes a millisecond or two. On a worker thread, serialise, compress and write a temporary file, then rename it over the target so a crash mid-write cannot damage the previous save. Keep three or more rotating slots, and delay autosave during combat and cell loads."
        },
        {
          "type": "h",
          "text": "Decisions and why they work"
        },
        {
          "type": "list",
          "items": [
            "**Streamed cells, not one big level.** Memory and load time are bounded by the radii, not by world size. Loading screens between zones are cheaper to build and break the premise.",
            "**Unload radius larger than load radius.** The one-cell gap makes border pacing free. Equal radii are simpler but thrash I/O and hitch.",
            "**Priority by distance and view direction.** What the player is about to see arrives first. Plain distance order loads cells behind the camera while the horizon is still empty.",
            "**Floating origin over doubles everywhere.** The GPU and physics engine stay in fast float32, and the world is rebased cheaply once per kilometre. Doubles everywhere cost memory and bandwidth and most of the pipeline cannot use them.",
            "**Simulation LOD with schedule catch-up.** CPU cost follows what is near the player, not the population. Simulating every NPC always cannot fit in a frame. The price is that off-screen life is an approximation.",
            "**Data assets over code for content.** Designers iterate without builds and tools validate everything. The price is a schema to maintain and tooling to write.",
            "**Stats derived from base plus modifiers.** Any equip order gives the same answer and tooltips come for free. Incrementing stats in place drifts and is nearly impossible to debug.",
            "**Facts plus events between systems.** Quests, dialogue and UI never reference each other, so they change independently. The price is indirection, paid back with event logging.",
            "**Diff saves with stable IDs.** Size follows play, not world size, and patches that move things do not corrupt saves. The price is discipline: IDs at authoring, change tracking on every mutable object, a migration for every format change."
          ]
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Never derive save IDs from names, positions or list indices. A designer renames a prop or nudges a chest, and every save that touched it now points at nothing or at the wrong object. Generate the GUID once, store it with the object, and add a build validator that fails on duplicate IDs and on any ID that disappears between releases without an alias."
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Delegate what is specified and testable: data schemas and the build-time validator (missing references, duplicate IDs, out-of-range values), the modifier pipeline with property tests (any permutation of equip order gives the same value, add then remove returns to base), the fact store and condition evaluator, the migration chain with golden saves from each version, and editor tooling such as a cell-grid debug view. State the invariants as rules: no gameplay state in statics, no object lookup by name, every mutable object registers with the change tracker, world positions are 64-bit. Verify yourself what the agent cannot see: hitches and memory on target hardware in the profiler, whether streaming holds up at horse speed, whether save and load round-trip (save, load, save again, diff the files) and whether IDs survive a level edit. Agents default to singletons, FindObjectOfType and per-frame recomputation, so ask for a review pass that greps for them."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "Frame time spikes whenever the player crosses a cell border, even when walking back and forth",
              "use": "Add hysteresis between load and unload radii",
              "why": "One shared radius reloads the same cell on every crossing. An unload radius a cell larger makes the border free and leaves the cost of a real load for real travel."
            },
            {
              "signal": "Meshes and contacts jitter far from the world origin, and the effect grows with distance",
              "use": "Shift the origin, keep true position as double",
              "why": "Float gaps double each time distance doubles. Rebasing the world around the player keeps single-precision math near zero, and the 64-bit offset keeps streaming and saves exact."
            },
            {
              "signal": "A distant town costs hundreds of draw calls although it covers a few pixels",
              "use": "Bake HLOD proxies and impostors",
              "why": "Merged meshes and billboards turn per-object cost into per-group cost. You pay in bake time and disk space once, not in draw calls every frame."
            },
            {
              "signal": "NPCs far from the player burn AI time, and nobody can see or hear them",
              "use": "Demote to coarse ticks or schedule catch-up",
              "why": "CPU cost should follow what the player can observe. Coarse routes and a clock lookup on cell load give consistent behaviour without running behaviour trees for hours."
            },
            {
              "signal": "A balance tweak or a new item needs a programmer and a new build",
              "use": "Move the value into a data asset",
              "why": "Designers iterate in minutes when content is rows validated by tools. Code keeps the few reusable behaviours, and data composes the thousands of variants."
            },
            {
              "signal": "A stat is wrong after equipping and unequipping items in a different order",
              "use": "Rebuild from base through a sorted pipeline",
              "why": "In-place increments depend on history. Recomputing base, additive, multiplicative and clamp from the current modifier list depends only on state, so the order cannot matter."
            },
            {
              "signal": "Quest, dialogue and guard scripts call each other, and every new reaction touches all three",
              "use": "Route state through facts and an event bus",
              "why": "Systems that share only facts and events can change independently. A designer adds a reaction as a conditioned line, and the quest code stays untouched."
            },
            {
              "signal": "Saves grow with world size or break after a patch moves authored objects",
              "use": "Save stable-ID diffs against the baseline",
              "why": "IDs fixed at authoring survive edits, and diffs scale with what the player changed. Versioned migrations upgrade old files instead of invalidating them."
            }
          ]
        }
      ],
      "keyPoints": [
        "Stream a cell grid with a load radius smaller than the unload radius; the gap is hysteresis that stops thrashing at borders.",
        "Load asynchronously, prioritised by distance and view direction, and bound residency by a byte budget and per-frame instantiation time.",
        "Float32 gaps grow from about 0.06 mm at 1 km to about 8 mm near 100 km, so shifting the origin keeps the player near zero.",
        "Simulation LOD runs full AI near the player, coarse ticks when loaded but unseen, and clock-based catch-up for unloaded NPCs.",
        "Content is data, and stats are rebuilt from base plus sorted modifiers, so equip order never changes the result.",
        "Quests and dialogue read shared facts, an event bus decouples systems, and saves hold stable-ID diffs through versioned migrations."
      ],
      "quiz": [
        {
          "q": "Playtesters riding along a cell border report a hitch every few seconds. The streamer uses one radius of 384 m for both loading and unloading. What is the right fix?",
          "options": [
            "Raise the shared radius to 512 m so the border is farther away",
            "Unload at a larger radius than the load radius, such as 512 m",
            "Unload cells on a timer instead of testing the distance",
            "Load cells synchronously so a cell is never half-finished"
          ],
          "answer": 1,
          "explain": "A gap between the radii is hysteresis: a cell loads at 384 m but stays until 512 m, so pacing at the edge changes nothing. A bigger single radius only moves the border and keeps the thrash. A timer can unload a cell the player is standing next to. Synchronous loads turn every crossing into a bigger hitch."
        },
        {
          "q": "At about 20 km from the world origin, roughly how large is the gap between adjacent 32-bit float positions?",
          "options": [
            "About 0.01 mm, which is far below anything visible",
            "About 0.2 mm, which is smaller than a hair's width",
            "About 0.5 mm, the same gap as at 5 km",
            "About 2 mm, four times the gap at 5 km"
          ],
          "answer": 3,
          "explain": "20 km lies in [16384, 32768) = [2^14, 2^15), so the gap is 2^(14-23) m, about 2 mm. About 0.5 mm is the gap for 4 to 8 km, two powers of two lower. The smaller options ignore that the gap grows with magnitude."
        },
        {
          "q": "A baker's cell stays unloaded all night. The player returns at 07:30 and the schedule opens the shop at 06:00. What should happen when the cell loads?",
          "options": [
            "Look up the current schedule slot and place the baker in the shop",
            "Run the baker's AI for the missed hours on a worker thread",
            "Spawn the baker at the home position and let the AI walk to the shop",
            "Keep the cell loaded all night so the schedule keeps running"
          ],
          "answer": 0,
          "explain": "Catch-up is one lookup: the clock and the schedule give the NPC's state now. Replaying hours of AI costs CPU nobody sees, spawning at home shows a baker walking to work at 07:30, and keeping cells loaded all night breaks the memory budget."
        },
        {
          "q": "A move-speed stat has base 10, one +4 additive modifier, one x1.5 multiplicative modifier and a clamp of 0 to 20. What does the pipeline return?",
          "options": [
            "15",
            "19",
            "20",
            "21"
          ],
          "answer": 2,
          "explain": "Additive first: 10 + 4 = 14, then multiplicative: 14 x 1.5 = 21, then the clamp limits it to 20. 19 comes from multiplying before adding (10 x 1.5 + 4). 15 ignores the additive modifier. 21 skips the clamp."
        },
        {
          "q": "Patch 1.2 moves 300 authored chests a few metres. Which save design keeps existing saves valid?",
          "options": [
            "Key each saved object by its world position in the cell",
            "Key each saved object by an authored GUID and store only diffs",
            "Key each saved object by its index in the cell's object list",
            "Store a full snapshot of every object in the loaded cells"
          ],
          "answer": 1,
          "explain": "A GUID assigned at authoring survives moves, renames and reordering, and a diff against the baseline stays small. Positions and list indices change with the edit, so saves would attach to the wrong object. A snapshot of loaded cells loses changes in every other cell and is large."
        },
        {
          "q": "A designer wants guards to mention the player's theft. The guard script calls the thieves-guild quest class, and that class calls back into dialogue, so each new reaction means editing both. What is the move?",
          "options": [
            "Merge guards, quests and dialogue into one manager class",
            "Give each system a singleton so that they can call each other",
            "Copy the theft flag into every guard script when it spawns",
            "Write the theft as a world fact and gate a dialogue line on it"
          ],
          "answer": 3,
          "explain": "A fact plus a condition on a dialogue line lets the designer add the reaction without touching quest or guard code. A big manager and singletons deepen the coupling, and copied flags go stale and are not saved in one place."
        }
      ]
    },
    {
      "id": "case-competitive-multiplayer",
      "title": "Case study: Competitive multiplayer game",
      "minutes": 18,
      "summary": "How a 1v1 fighting game and a 5v5 arena game stay fair and in sync: deterministic simulation, rollback, lockstep, server authority, matchmaking, and anti-cheat.",
      "lesson": [
        {
          "type": "p",
          "text": "Two players are 1,200 km apart with an 80 ms round trip. They are playing a 1v1 fighting game at 60 Hz, where a frame is 16.7 ms and a jab has 4 frames of startup. One-way latency is 40 ms, about 2.4 frames, so a naive game that waits for the opponent's input before simulating each frame puts every button press 2 to 3 frames late and stalls whenever a packet is delayed. Down the hall, ten players are in a 5v5 arena match and one of them runs a tool that draws enemy positions through walls. The tool works because the server sent those positions to every client. Competitive multiplayer is two problems: keeping players' views of one match consistent under latency, and making sure nobody can bend the result. Everything below is a choice between those two forces."
        },
        {
          "type": "h",
          "text": "Components"
        },
        {
          "type": "p",
          "text": "A competitive game splits into a **simulation** that decides what happens, a **netcode** layer that moves inputs or state between machines, and **services** around the match that decide who plays whom and keep the result honest. The simulation design determines which netcode is possible, and the netcode determines how much you must trust each client."
        },
        {
          "type": "list",
          "items": [
            "**Client:** samples input, runs the simulation (or a prediction of it), renders. Rendering never feeds back into the simulation.",
            "**Netcode layer:** peer-to-peer input exchange with rollback (fighting games), lockstep command exchange (RTS), or server snapshots with client prediction (MOBA, shooters).",
            "**Authoritative server (when used):** owns the true state, validates every input, filters what each client may see.",
            "**Matchmaker and rating service:** queues, rating updates, party and region rules.",
            "**Fleet and session allocator:** starts match servers or relays near the players and hands out signed connect tokens.",
            "**Replay store and anti-cheat pipeline:** match records, reports, statistical detection and review."
          ]
        },
        {
          "type": "h",
          "text": "Deterministic simulation"
        },
        {
          "type": "p",
          "text": "Rollback and lockstep both rest on one property: **the same inputs, applied in the same order to the same starting state, produce bit-identical results on every machine.** If that holds, you only ever send inputs, and a replay is just an input log. The rules are strict but few."
        },
        {
          "type": "list",
          "items": [
            "**Fixed timestep.** The simulation advances in whole frames at a fixed rate (60 Hz for fighting games), decoupled from rendering. The fixed-timestep loop from the engines section applies unchanged.",
            "**Controlled arithmetic.** Use integers or fixed-point (for example positions in 1/256 pixel) for everything that affects outcomes. Floats are deterministic only when the compiler, CPU flags and library functions match; `sin`, `pow` and other library functions, x87 versus SSE paths, and fused multiply-add contraction can differ across platforms. If you must use floats, ship one binary per platform family and test cross-play heavily.",
            "**Owned randomness.** The simulation owns a seeded generator stored inside the game state, for example xorshift32. Never call `UnityEngine.Random` or read `Time.time` in simulation code.",
            "**Fixed iteration order.** Iterate arrays by index. Dictionary or HashSet enumeration order, and sorting with unstable comparers or ties, can differ between runs and machines.",
            "**No outside inputs.** No physics engine with its own hidden state, no reading the frame rate, no threads that finish in varying order."
          ]
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "public struct Fighter { public int X, VX, Hp, Stun; }   // X in 1/256 px\npublic struct GameState {                           // plain data: copying it is saving it\n    public int Frame; public uint Rng;\n    public Fighter P1, P2;\n}\nstatic class Sim {\n    public static void Step(ref GameState s, ushort in1, ushort in2) {\n        s.Frame++;\n        Apply(ref s.P1, in1);                       // fixed order: P1 first, then P2\n        Apply(ref s.P2, in2);\n        if (Hit(s.P1, s.P2))\n            s.P2.Hp -= 80 + (int)(Rand(ref s.Rng) % 11);   // damage 80-90\n    }\n    static uint Rand(ref uint x) { x ^= x << 13; x ^= x >> 17; x ^= x << 5; return x; }\n}"
        },
        {
          "type": "p",
          "text": "Determinism fails quietly, so **detect desync** instead of hoping. Every peer computes a checksum of the game state each frame (a hash of the state struct, 4 bytes) and exchanges it with the inputs, or every 30 to 60 frames to save bandwidth. When checksums for the same frame differ, the peers know which frame diverged. Dump both states at the first bad frame, diff them field by field, and the culprit is usually a float function, an uninitialised field, an unordered collection or a stray `Random` call."
        },
        {
          "type": "h",
          "text": "Delay-based versus rollback netcode"
        },
        {
          "type": "p",
          "text": "The simple design is **delay-based**: do not simulate frame `f` until both players' inputs for `f` have arrived. Locally you hide latency by delaying your own input by `d` frames, and if the remote input for `f` is still in flight when frame `f` is due, the game freezes. With 40 ms one-way latency you need about 3 frames of delay, and with 120 ms one-way (a transatlantic link) about 7 frames, which is unplayable for a game whose moves are 3 to 5 frames long. Jitter makes it worse: one slow packet is a visible stutter for both players."
        },
        {
          "type": "p",
          "text": "**Rollback** (GGPO-style) never waits. Each frame the game does this:"
        },
        {
          "type": "list",
          "items": [
            "Sample local input and schedule it for frame `f + d`, where `d` is a small fixed input delay of 1 to 3 frames.",
            "For the remote player, use the real input if it has arrived. Otherwise **predict** it by repeating their last input. People hold directions and buttons for many frames, so most predictions are right and nothing has to be redone.",
            "Save a snapshot of the state, then simulate frame `f` and render it immediately.",
            "When a real remote input arrives for an old frame `g` and it differs from the prediction, **load the snapshot of frame `g`, then resimulate `g` to `f` with the corrected input**, all before drawing the next picture.",
            "Never roll back further than a limit of about 7 to 8 frames (roughly 120 to 130 ms). Past it the game pauses until the remote input catches up."
          ]
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "void Tick() {                                         // once per 16.7 ms\n    net.Poll();                                       // receive remote inputs\n    inputs.SetLocal(frame + inputDelay, pad.Sample());\n    if (frame - net.ConfirmedFrame > MaxRollback) return;   // stall, wait for the peer\n\n    int bad = inputs.FirstMispredicted();             // -1 if every guess was right\n    if (bad >= 0) {\n        state = ring[bad % Ring];                     // state before frame 'bad'\n        for (int f = bad; f < frame; f++) {\n            ring[f % Ring] = state;                   // re-save as we go\n            Sim.Step(ref state, inputs.Get(f, 0), inputs.Get(f, 1)); // real or predicted\n        }\n    }\n    ring[frame % Ring] = state;\n    Sim.Step(ref state, inputs.Get(frame, 0), inputs.Get(frame, 1));\n    frame++;\n    Render(state);                                    // draw once per tick, never mid-resim\n}"
        },
        {
          "type": "figure",
          "id": "mp-rollback",
          "caption": "The rollback is invisible to the player: the corrected frames F13 to F16 are recomputed in the same 16.7 ms window as the new frame, and the picture only ever shows the latest result.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 240\" role=\"img\" aria-label=\"Rollback timeline at 60 Hz. Frames F10 to F12 are confirmed, F13 to F16 were simulated with predicted remote input. A late real input for F13 arrives, differs from the prediction, the game restores the F13 snapshot and resimulates F13 to F16 in one frame.\"><style>.mp-rollback-t{font-size:13px;fill:var(--fig-ink)}.mp-rollback-s{font-size:12px;fill:var(--fig-muted)}.mp-rollback-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.mp-rollback-c{text-anchor:middle}.mp-rollback-e{text-anchor:end}.mp-rollback-ok{fill:var(--fig-ok);fill-opacity:.25;stroke:var(--fig-ok);stroke-width:1.5}.mp-rollback-pr{fill:var(--fig-warn);fill-opacity:.25;stroke:var(--fig-warn);stroke-width:1.5;stroke-dasharray:4 3}.mp-rollback-fu{fill:none;stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 4}.mp-rollback-bad{fill:var(--fig-bad);fill-opacity:.4;stroke:var(--fig-bad);stroke-width:2}.mp-rollback-pk{fill:var(--fig-panel);stroke:var(--fig-accent);stroke-width:2}.mp-rollback-rw{fill:none;stroke:var(--fig-accent);stroke-width:2.5;stroke-dasharray:1;stroke-dashoffset:0}.mp-rollback-ah{fill:var(--fig-accent)}.mp-rollback-ov{opacity:0;animation:mp-rollback-ov 7s ease infinite}@keyframes mp-rollback-ov{0%,58%{opacity:0}68%,88%{opacity:1}96%,100%{opacity:0}}.mp-rollback-mi{opacity:1;animation:mp-rollback-mi 7s ease infinite}@keyframes mp-rollback-mi{0%,18%{opacity:0}26%,56%{opacity:1}64%,100%{opacity:0}}.mp-rollback-in{opacity:1;animation:mp-rollback-in 7s ease infinite}@keyframes mp-rollback-in{0%,12%{opacity:0}20%,88%{opacity:1}96%,100%{opacity:0}}.mp-rollback-r1{animation:mp-rollback-r1 7s ease infinite}@keyframes mp-rollback-r1{0%,36%{stroke-dashoffset:1}56%,88%{stroke-dashoffset:0}96%,100%{stroke-dashoffset:0}}.mp-rollback-a1{opacity:1;animation:mp-rollback-a1 7s ease infinite}@keyframes mp-rollback-a1{0%,54%{opacity:0}58%,88%{opacity:1}96%,100%{opacity:0}}</style><text class=\"mp-rollback-h\" x=\"40\" y=\"20\">Local timeline at 60 Hz, one box = 16.7 ms</text><text class=\"mp-rollback-s mp-rollback-c\" x=\"140\" y=\"40\">confirmed: real inputs</text><text class=\"mp-rollback-s mp-rollback-c\" x=\"385\" y=\"40\">predicted: remote input = last input</text><text class=\"mp-rollback-s mp-rollback-c\" x=\"565\" y=\"40\">next</text><rect class=\"mp-rollback-ok\" x=\"40\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"70\" y=\"73\">F10</text><rect class=\"mp-rollback-ok\" x=\"110\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"140\" y=\"73\">F11</text><rect class=\"mp-rollback-ok\" x=\"180\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"210\" y=\"73\">F12</text><rect class=\"mp-rollback-pr\" x=\"250\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"280\" y=\"73\">F13</text><rect class=\"mp-rollback-pr\" x=\"320\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"350\" y=\"73\">F14</text><rect class=\"mp-rollback-pr\" x=\"390\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"420\" y=\"73\">F15</text><rect class=\"mp-rollback-pr\" x=\"460\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"490\" y=\"73\">F16</text><rect class=\"mp-rollback-fu\" x=\"530\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"560\" y=\"73\">F17</text><rect class=\"mp-rollback-bad mp-rollback-mi\" x=\"250\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><rect class=\"mp-rollback-ok mp-rollback-ov\" x=\"250\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><rect class=\"mp-rollback-ok mp-rollback-ov\" x=\"320\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><rect class=\"mp-rollback-ok mp-rollback-ov\" x=\"390\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><rect class=\"mp-rollback-ok mp-rollback-ov\" x=\"460\" y=\"48\" width=\"60\" height=\"40\" rx=\"8\"/><path class=\"mp-rollback-rw mp-rollback-r1\" pathLength=\"1\" d=\"M490 90C490 130 280 130 280 96\"/><path class=\"mp-rollback-ah mp-rollback-a1\" d=\"M280 91l-6 9h12z\"/><g class=\"mp-rollback-in\"><text class=\"mp-rollback-s mp-rollback-e\" x=\"440\" y=\"157\">input for F13 arrives while sim is at F16</text><rect class=\"mp-rollback-pk\" x=\"448\" y=\"140\" width=\"84\" height=\"24\" rx=\"6\"/><text class=\"mp-rollback-t mp-rollback-c\" x=\"490\" y=\"157\">F13: Punch</text></g><text class=\"mp-rollback-t\" x=\"40\" y=\"198\">Restore F13, replay F13 to F16 (4 steps), then run F17: 5 steps in one frame.</text><text class=\"mp-rollback-s\" x=\"40\" y=\"218\">At 1.5 ms per step that is 7.5 ms, so the frame budget of 16.7 ms still holds.</text></svg>"
        },
        {
          "type": "p",
          "text": "The numbers work out as follows. If one-way latency is `L` frames and input delay is `d`, an input arrives on time when `L <= d`, and you roll back about `L - d` frames otherwise. At 80 ms RTT (`L` = 2.4) with `d` = 2, a typical rollback is 0 to 1 frames. At 150 ms RTT (`L` = 4.5) it is 2 to 3 frames. A rollback of `n` frames costs `n + 1` simulation steps in one tick, so with a step cost of 1.5 ms and a render and engine budget of 8 ms, `n` = 4 uses 7.5 + 8 = 15.5 ms of 16.7. That is why fighting-game simulations are written to be tiny and allocation-free."
        },
        {
          "type": "p",
          "text": "Rollback needs **cheap save and load**. Keep the state in flat, blittable structs or arrays with no object references, so a snapshot is one `memcpy`. A ring buffer of 8 to 10 snapshots of 20 to 100 KB each costs about 1 MB at most and a few microseconds per save. State with pointers, GC objects or an engine scene graph is the thing that makes rollback hard to retrofit."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Anything with a side effect is outside the simulation and must tolerate being replayed. If a hit sound or particle burst is triggered inside `Step`, every resimulation of that frame plays it again, and a few consecutive rollbacks play it several times. Emit presentation events with a frame number and an id, deduplicate them, and cancel or retarget effects whose triggering frame was rolled back. Also keep animation state inside the rollback state, or characters will visibly pop on every correction."
        },
        {
          "type": "h",
          "text": "Lockstep for RTS-like games"
        },
        {
          "type": "p",
          "text": "When a game has thousands of units, state is too large to snapshot every frame and too large to send. **Deterministic lockstep** keeps the same determinism rules and sends only **commands** (select, move, build), a few bytes each. Time is divided into **turns** of about 100 to 200 ms. Commands issued during turn `N` are scheduled for turn `N + 2`, and each peer simulates turn `N` only after it has every player's command bundle for it. The wait for the next bundle is hidden behind the turn delay and by rendering with interpolation between simulation steps, which for RTS-scale games often run at only 8 to 20 Hz."
        },
        {
          "type": "p",
          "text": "Bandwidth is the point of the design. A state broadcast of 1,000 units at 20 bytes each and 20 Hz is about 400 KB/s per client. Lockstep with 8 players sending a handful of commands per second is a few hundred bytes per second, and it does not grow with unit count. The costs are that the whole game **runs at the pace of the slowest peer** (one lagging player slows everyone, or the game pauses), that any desync is fatal to the match, and that **every client holds the full true state**, so a map-hack can read hidden units from memory. That last cost is why games with hidden information choose a server instead."
        },
        {
          "type": "h",
          "text": "Server-authoritative state sync for a MOBA"
        },
        {
          "type": "p",
          "text": "In a 5v5 arena game the server runs the one true simulation at a fixed tick (about 30 Hz is common), and clients send **intents** (move here, cast ability 2 at this target), never results. The server validates each intent, advances the world and sends clients snapshots or deltas at 20 to 30 Hz within a budget of roughly 10 to 20 KB/s per client. The local hero is **predicted** on the client and reconciled when the server's state arrives, so movement feels instant, and other entities are drawn by **interpolation** about 100 ms in the past. For hit validation against rewound positions, see the FPS lag compensation case study; the same server-rewind idea applies to targeted abilities."
        },
        {
          "type": "p",
          "text": "Server authority costs one thing rollback does not: a dedicated machine per match, and a round trip before the server confirms things you cannot predict. It buys the one thing rollback cannot offer, which is **control over what each client knows**."
        },
        {
          "type": "h",
          "text": "Interest management and fog of war"
        },
        {
          "type": "p",
          "text": "**Interest management** means a client only receives the entities it is allowed to see. For fog of war the server keeps a **visibility grid per team**: a bitset with one bit per cell, such as 256 x 256 cells in 8 KB. Each tick it clears the grid, then for every vision source (hero, minion, ward, tower) it marks the cells in a circle around the source, skipping cells blocked by walls or terrain the source cannot see past. A circle of radius 10 cells is about 314 cells, so 60 sources cost around 19,000 bit writes: microseconds. An enemy entity is included in a team's snapshot only if its cell bit is set."
        },
        {
          "type": "code",
          "lang": "csharp",
          "text": "void UpdateVision(Team t) {\n    t.Visible.ClearAll();                              // 256 x 256 bits = 8 KB\n    foreach (var u in t.Units)\n        MarkCircleWithLineOfSight(t.Visible, u.Cell, u.VisionRadiusCells);\n}\nIEnumerable<Entity> Replicable(Client c) {\n    foreach (var e in world.Entities)\n        if (e.Team == c.Team || c.Team.Visible.Get(e.Cell))\n            yield return e;                           // hidden enemies are never serialised\n}"
        },
        {
          "type": "p",
          "text": "The important property is that hidden data **never leaves the server**. Encrypting packets or obfuscating IDs does not stop a wallhack, because the client has to decrypt what it uses. Filtering has side effects to design for. Entities pop into existence at the edge of vision, so send a short pre-reveal margin for smooth fade-in only if the hidden position is not exploitable. The same filter must cover events: a spell cast, a footstep sound or a ping marker carries a position, and broadcasting it to everyone leaks what the entity filter hides. Keep a per-client last-seen memory (a ghost marker) on the client, built only from information it was allowed to see."
        },
        {
          "type": "h",
          "text": "Ratings: Elo and its successors"
        },
        {
          "type": "p",
          "text": "A rating system turns match results into a number that predicts results. **Elo** gives player A an expected score `E = 1 / (1 + 10^((Rb - Ra) / 400))`, which is the win probability (draws count half), and updates `R' = R + K * (S - E)`, where `S` is 1 for a win, 0.5 for a draw and 0 for a loss. The constant 400 sets the scale: a 400-point gap means E of about 0.91. With `K` = 32, a 1600 player beating a 1400 player (`E` = 0.76) gains only 7.7 points, while losing costs 24.3. Updates are zero-sum between the two players, and they correct themselves: results that match expectation barely move ratings, and upsets move them a lot."
        },
        {
          "type": "figure",
          "id": "mp-elo-curve",
          "caption": "The curve is steepest near equal ratings, where every game is informative; far from the middle the outcome is almost known, so the favourite gains little for a win and loses a lot for a loss.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 296\" role=\"img\" aria-label=\"Elo expected score curve. The expected score of player A rises from about 0.09 at minus 400 rating points to 0.5 at equal rating and 0.91 at plus 400. At plus 200 it is 0.76, so with K equal to 32 a win gains 7.7 points and a loss costs 24.3.\"><style>.mp-elo-curve-t{font-size:13px;fill:var(--fig-ink)}.mp-elo-curve-s{font-size:12px;fill:var(--fig-muted)}.mp-elo-curve-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.mp-elo-curve-c{text-anchor:middle}.mp-elo-curve-e{text-anchor:end}.mp-elo-curve-ax{stroke:var(--fig-line);stroke-width:1.5}.mp-elo-curve-gd{stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 5}.mp-elo-curve-cv{fill:none;stroke:var(--fig-accent);stroke-width:2.5;stroke-linejoin:round}.mp-elo-curve-mk{fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2}.mp-elo-curve-dt{fill:var(--fig-accent);stroke:var(--fig-bg);stroke-width:2;animation:mp-elo-curve-dt 8s linear infinite}.mp-elo-curve-pn{fill:var(--fig-panel);stroke:var(--fig-line);stroke-width:1.5}.mp-elo-curve-w{font-size:14px;font-weight:600;fill:var(--fig-ok)}.mp-elo-curve-l{font-size:14px;font-weight:600;fill:var(--fig-bad)}@keyframes mp-elo-curve-dt{0%{transform:translate(70px,221.8px)}5%{transform:translate(86.5px,217.6px)}10%{transform:translate(103px,212.6px)}15%{transform:translate(119.5px,206.7px)}20%{transform:translate(136px,199.8px)}25%{transform:translate(152.5px,191.9px)}30%{transform:translate(169px,183.1px)}35%{transform:translate(185.5px,173.2px)}40%{transform:translate(202px,162.6px)}45%{transform:translate(218.5px,151.5px)}50%{transform:translate(235px,140px)}55%{transform:translate(251.5px,128.5px)}60%{transform:translate(268px,117.4px)}65%{transform:translate(284.5px,106.8px)}70%{transform:translate(301px,96.9px)}75%{transform:translate(317.5px,88.1px)}80%{transform:translate(334px,80.2px)}85%{transform:translate(350.5px,73.3px)}90%{transform:translate(367px,67.4px)}95%{transform:translate(383.5px,62.4px)}100%{transform:translate(400px,58.2px)}}</style><text class=\"mp-elo-curve-h\" x=\"70\" y=\"22\">Expected score of A, E = 1 / (1 + 10^(-diff / 400))</text><line class=\"mp-elo-curve-gd\" x1=\"70\" y1=\"140\" x2=\"400\" y2=\"140\"/><line class=\"mp-elo-curve-gd\" x1=\"235\" y1=\"40\" x2=\"235\" y2=\"240\"/><line class=\"mp-elo-curve-ax\" x1=\"70\" y1=\"40\" x2=\"70\" y2=\"240\"/><line class=\"mp-elo-curve-ax\" x1=\"70\" y1=\"240\" x2=\"400\" y2=\"240\"/><text class=\"mp-elo-curve-s mp-elo-curve-e\" x=\"62\" y=\"44\">1</text><text class=\"mp-elo-curve-s mp-elo-curve-e\" x=\"62\" y=\"144\">0.5</text><text class=\"mp-elo-curve-s mp-elo-curve-e\" x=\"62\" y=\"244\">0</text><text class=\"mp-elo-curve-s mp-elo-curve-c\" x=\"70\" y=\"260\">-400</text><text class=\"mp-elo-curve-s mp-elo-curve-c\" x=\"235\" y=\"260\">0</text><text class=\"mp-elo-curve-s mp-elo-curve-c\" x=\"400\" y=\"260\">+400</text><text class=\"mp-elo-curve-s mp-elo-curve-c\" x=\"235\" y=\"282\">rating difference, A minus B</text><polyline class=\"mp-elo-curve-cv\" points=\"70,221.8 78.3,219.8 86.5,217.6 94.8,215.2 103,212.6 111.3,209.8 119.5,206.7 127.8,203.4 136,199.8 144.3,196 152.5,191.9 160.8,187.6 169,183.1 177.3,178.2 185.5,173.2 193.8,168 202,162.6 210.3,157.1 218.5,151.5 226.8,145.8 235,140 243.3,134.2 251.5,128.5 259.8,122.9 268,117.4 276.3,112 284.5,106.8 292.8,101.8 301,96.9 309.3,92.4 317.5,88.1 325.8,84 334,80.2 342.3,76.6 350.5,73.3 358.8,70.2 367,67.4 375.3,64.8 383.5,62.4 391.8,60.2 400,58.2\"/><line class=\"mp-elo-curve-gd\" x1=\"317.5\" y1=\"88.1\" x2=\"317.5\" y2=\"240\"/><line class=\"mp-elo-curve-gd\" x1=\"70\" y1=\"88.1\" x2=\"317.5\" y2=\"88.1\"/><circle class=\"mp-elo-curve-mk\" cx=\"317.5\" cy=\"88.1\" r=\"5.5\"/><text class=\"mp-elo-curve-t\" x=\"326.5\" y=\"110.1\">E = 0.76</text><circle class=\"mp-elo-curve-dt\" cx=\"0\" cy=\"0\" r=\"5\" transform=\"translate(70,221.8)\"/><rect class=\"mp-elo-curve-pn\" x=\"424\" y=\"40\" width=\"200\" height=\"200\" rx=\"12\"/><text class=\"mp-elo-curve-h\" x=\"440\" y=\"66\">A 1600 vs B 1400</text><text class=\"mp-elo-curve-s\" x=\"440\" y=\"86\">diff +200, so E(A) = 0.76</text><text class=\"mp-elo-curve-t\" x=\"440\" y=\"118\">K = 32</text><text class=\"mp-elo-curve-w\" x=\"440\" y=\"144\">A wins: +7.7</text><text class=\"mp-elo-curve-l\" x=\"440\" y=\"168\">A loses: -24.3</text><text class=\"mp-elo-curve-s\" x=\"440\" y=\"200\">The favourite risks more</text><text class=\"mp-elo-curve-s\" x=\"440\" y=\"218\">than it can gain.</text></svg>"
        },
        {
          "type": "p",
          "text": "Plain Elo treats a new player and a veteran with 2,000 games identically, so new accounts take many games to converge and returning players are misrated. **Glicko** adds a **rating deviation** (RD), a measure of uncertainty that is large for new or inactive players and shrinks as they play, so their rating moves fast at first. **Glicko-2** also tracks volatility. **TrueSkill** models each player as a Gaussian with mean and deviation, which also handles teams and free-for-alls; matchmaking can use a conservative estimate such as mean minus 3 standard deviations. For 5v5 you need a team rating (an average, or a model that learns each player's contribution), and ranked ladders usually show a coarser tier derived from the hidden rating."
        },
        {
          "type": "h",
          "text": "Matchmaking: queues, windows, regions and parties"
        },
        {
          "type": "p",
          "text": "A matchmaker balances **match quality** (close ratings, low ping) against **wait time**. The standard mechanism is a **search window around each queued player that widens with time**. A new ticket accepts only rating differences of about 50 and ping under 60 ms. Every few seconds the window grows, and it is capped so that a 1500 player never gets a 2300 opponent. Two tickets match when each one's window contains the other. This is the cheapest way to be fast when the queue is full and still finish when it is empty."
        },
        {
          "type": "figure",
          "id": "mp-mm-window",
          "caption": "At peak hours the match is found in the first few steps; off-peak the window keeps growing until a candidate fits, but a candidate with bad ping is rejected at any width.",
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 304\" role=\"img\" aria-label=\"Matchmaking search window for a 1500 rated player. The accepted rating band starts at plus or minus 50 and widens by 25 every 5 seconds up to 300. A candidate at 1720 is found at 35 seconds, while a candidate at 1560 with 180 ms ping is skipped.\"><style>.mp-mm-window-t{font-size:13px;fill:var(--fig-ink)}.mp-mm-window-s{font-size:12px;fill:var(--fig-muted)}.mp-mm-window-h{font-size:14px;font-weight:600;fill:var(--fig-ink)}.mp-mm-window-c{text-anchor:middle}.mp-mm-window-e{text-anchor:end}.mp-mm-window-ax{stroke:var(--fig-line);stroke-width:1.5}.mp-mm-window-gd{stroke:var(--fig-line);stroke-width:1.5;stroke-dasharray:4 5}.mp-mm-window-bd{fill:var(--fig-accent);fill-opacity:.08;stroke:var(--fig-accent);stroke-opacity:.7;stroke-width:1.5}.mp-mm-window-st{fill:var(--fig-accent);fill-opacity:.3;opacity:0;animation:mp-mm-window-st 6s ease infinite}@keyframes mp-mm-window-st{0%{opacity:0}10%,70%{opacity:1}88%,100%{opacity:0}}.mp-mm-window-ok{fill:var(--fig-ok);stroke:var(--fig-bg);stroke-width:2}.mp-mm-window-rg{fill:none;stroke:var(--fig-ok);stroke-width:2;transform-box:fill-box;transform-origin:center;animation:mp-mm-window-rg 2.4s ease-out infinite}@keyframes mp-mm-window-rg{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.4);opacity:0}}.mp-mm-window-x{stroke:var(--fig-bad);stroke-width:2.5;stroke-linecap:round}</style><text class=\"mp-mm-window-h\" x=\"70\" y=\"20\">Search window for a 1500-rated player</text><text class=\"mp-mm-window-s\" x=\"70\" y=\"36\">starts at ±50, grows 25 every 5 s, capped at ±300 (example numbers)</text><rect class=\"mp-mm-window-st\" style=\"animation-delay:0s\" x=\"70\" y=\"133\" width=\"44.2\" height=\"34\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:0.3s\" x=\"114.2\" y=\"124.5\" width=\"44.2\" height=\"51\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:0.6s\" x=\"158.3\" y=\"116\" width=\"44.2\" height=\"68\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:0.9s\" x=\"202.5\" y=\"107.5\" width=\"44.2\" height=\"85\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:1.2s\" x=\"246.7\" y=\"99\" width=\"44.2\" height=\"102\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:1.5s\" x=\"290.8\" y=\"90.5\" width=\"44.2\" height=\"119\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:1.8s\" x=\"335\" y=\"82\" width=\"44.2\" height=\"136\"/><rect class=\"mp-mm-window-st\" style=\"animation-delay:2.1s\" x=\"379.2\" y=\"73.5\" width=\"44.2\" height=\"153\"/><path class=\"mp-mm-window-bd\" d=\"M70 133 L114.2 133 L114.2 124.5 L158.3 124.5 L158.3 116 L202.5 116 L202.5 107.5 L246.7 107.5 L246.7 99 L290.8 99 L290.8 90.5 L335 90.5 L335 82 L379.2 82 L379.2 73.5 L423.3 73.5 L423.3 65 L467.5 65 L467.5 56.5 L511.7 56.5 L511.7 48 L555.8 48 L555.8 48 L600 48 L600 252 L555.8 252 L555.8 252 L511.7 252 L511.7 243.5 L467.5 243.5 L467.5 235 L423.3 235 L423.3 226.5 L379.2 226.5 L379.2 218 L335 218 L335 209.5 L290.8 209.5 L290.8 201 L246.7 201 L246.7 192.5 L202.5 192.5 L202.5 184 L158.3 184 L158.3 175.5 L114.2 175.5 L114.2 167 L70 167Z\"/><line class=\"mp-mm-window-gd\" x1=\"70\" y1=\"150\" x2=\"600\" y2=\"150\"/><line class=\"mp-mm-window-ax\" x1=\"70\" y1=\"48\" x2=\"70\" y2=\"262\"/><line class=\"mp-mm-window-ax\" x1=\"70\" y1=\"262\" x2=\"600\" y2=\"262\"/><text class=\"mp-mm-window-s mp-mm-window-e\" x=\"62\" y=\"154\">1500</text><text class=\"mp-mm-window-s mp-mm-window-e\" x=\"62\" y=\"52\">1800</text><text class=\"mp-mm-window-s mp-mm-window-e\" x=\"62\" y=\"256\">1200</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"70\" y=\"278\">0</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"202.5\" y=\"278\">15</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"335\" y=\"278\">30</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"467.5\" y=\"278\">45</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"600\" y=\"278\">60</text><text class=\"mp-mm-window-s mp-mm-window-c\" x=\"335\" y=\"296\">seconds in queue</text><circle class=\"mp-mm-window-rg\" cx=\"379.2\" cy=\"75.2\" r=\"6\"/><circle class=\"mp-mm-window-ok\" cx=\"379.2\" cy=\"75.2\" r=\"6\"/><text class=\"mp-mm-window-t\" x=\"383.2\" y=\"98\">found at 35 s: rating 1720</text><line class=\"mp-mm-window-x\" x1=\"171\" y1=\"124.6\" x2=\"181\" y2=\"134.6\"/><line class=\"mp-mm-window-x\" x1=\"181\" y1=\"124.6\" x2=\"171\" y2=\"134.6\"/><text class=\"mp-mm-window-s\" x=\"188\" y=\"133.6\">rating fits, ping 180 ms: skipped</text></svg>"
        },
        {
          "type": "list",
          "items": [
            "**Region and ping.** Hard-constrain latency (for rollback, a cap around 100 to 120 ms RTT so rollback stays under the limit). Relax the cap slowly, or never, but widen rating first since it harms fairness less than a 250 ms game.",
            "**Parties.** A premade group coordinates by voice, so rate a party above the average of its members, queue it against parties of similar size, and use the highest member as an input rather than the mean.",
            "**Team balance.** For 10 solo players there are 252 ways to choose a team of 5, which is 126 distinct 5v5 splits. Enumerate them and pick the split with the smallest rating gap, with a penalty for role clashes.",
            "**Roles and modes.** A role queue is a separate queue per role, so wait is set by the scarcest role."
          ]
        },
        {
          "type": "h",
          "text": "Server fleet and session allocation"
        },
        {
          "type": "p",
          "text": "When the matchmaker has a full lobby it asks a **session allocator** for a server. The allocator picks the region that minimises the worst player's ping, takes a **pre-warmed** server process from a pool (starting a process and loading a map can take 10 to 30 seconds, too long to put in front of players), marks it busy and returns an address. Each player gets a **signed connect token**, valid for about 30 seconds and bound to match id, player id and team, so only the ten intended players can join. One match is one process, often one or two cores for a 5v5 at 30 Hz, so capacity planning is: concurrent matches times cores, plus 10 to 20 percent of warm headroom for spikes."
        },
        {
          "type": "p",
          "text": "Region choice uses measured ping, not geography. At login each client probes the regional endpoints with a few UDP echo packets and reports the results with its queue ticket. For 1v1 rollback games, a direct peer-to-peer connection saves a server hop, but players behind strict NAT need a relay, and a relay is also how a service can see and arbitrate the input stream."
        },
        {
          "type": "h",
          "text": "Anti-cheat and ranked integrity"
        },
        {
          "type": "p",
          "text": "The first principle is **never trust the client**. The client is code on a machine the player controls, so anything it reports (position, damage, cooldown, \"I hit him\") is a claim, not a fact. The design response is to make the client send **intents** and let the server compute outcomes. The rest follows from that."
        },
        {
          "type": "list",
          "items": [
            "**Server validation.** Reject movement faster than max speed times elapsed time plus a small tolerance, abilities used while on cooldown or without mana, and targets that are not in range or not visible to the caster.",
            "**Rate checks.** Cap command rates (say 20 to 30 per second), and flag inhuman patterns such as perfectly regular 1-frame timing or reaction times under 100 ms sustained.",
            "**Less to steal.** Interest management, covered above, removes the wallhack target. Peer-to-peer rollback cannot hide state, so fighting games accept it and rely on there being no hidden information.",
            "**Replay review.** Store every ranked match so a report can be checked by automated detectors and, for borderline cases, by humans.",
            "**Client-side anti-cheat** (integrity checks, kernel drivers) raises the cost of cheating but is an extra layer, never the foundation."
          ]
        },
        {
          "type": "p",
          "text": "**Replays** are the pay-off of determinism. For a lockstep or rollback game, a replay is the build version, the initial state and seed, and the input of every player for every frame: 2 players, 2 bytes each, 60 frames per second is 240 bytes per second, about 43 KB for a 3-minute match before compression. Store a full snapshot every 10 seconds so the viewer can seek. A replay only plays on the build that recorded it unless you keep old simulation versions, so tag every file with its version. Server-authoritative games usually record the server's event stream instead. **Spectating** works on the same data but is **delayed** (30 seconds to a few minutes in ranked) because a live feed with full information lets a teammate or stream viewer relay enemy positions."
        },
        {
          "type": "p",
          "text": "Ranked integrity also needs rules around the people. **Leavers**: allow a reconnect window (for example 60 to 120 seconds), then count an abandon, penalise it with queue lockouts that escalate, and shield teammates by reducing their rating loss. **Smurfs** are experienced players on new accounts. Signals are an unusually high win rate and kill share in the first 20 games, rating that climbs 300 points quickly, and links by device or payment account. The system response is not a ban but faster convergence: because a new account starts with high uncertainty, its rating moves quickly and it leaves the beginners' pool in a few games."
        },
        {
          "type": "callout",
          "kind": "warn",
          "text": "Peer-to-peer ranked play has an arbitration hole. If checksums diverge at frame 3,000, each peer's state says the other one is wrong and you cannot tell which machine cheated or just had a bug. Have clients report checksums to a service, or route inputs through a relay that can replay them, and define up front that an unresolved desync is a no-contest with no rating change. Otherwise either side can force it to cost the opponent rating."
        },
        {
          "type": "h",
          "text": "Decisions and why they work"
        },
        {
          "type": "list",
          "items": [
            "**Rollback for 1v1, not delay-based.** Local inputs are never delayed by the network, so the game feels like offline play up to a cap of about 7 to 8 frames. The cost is a simulation that is deterministic, cheap to copy and fast enough to replay up to 9 times a frame.",
            "**60 Hz fixed simulation, decoupled from rendering.** Frames are the unit of input, rollback and replay. Tying to the render loop makes monitors and frame drops change the game.",
            "**Integers or fixed-point in the simulation.** Bit-identical results on every platform without relying on compiler flags. The alternative is floats plus a test matrix and a desync hunt for each new platform.",
            "**Predict by repeating the last input.** Held inputs dominate human play, so most predictions are correct and no rollback happens. More elaborate predictors add complexity for little gain.",
            "**1 to 3 frames of fixed input delay.** It converts some rollbacks into on-time inputs and caps resim cost. Zero delay maximises visible corrections, and too much delay is the old delay-based problem.",
            "**Lockstep for RTS.** Bandwidth is independent of unit count. The alternative, state sync with thousands of units, needs aggressive prioritisation and costs tens to hundreds of KB/s.",
            "**Server authority and visibility filtering for MOBAs.** It removes whole cheat classes by construction. Client-side checks are always bypassable, since the cheater controls the client.",
            "**Send intents, not results.** A server can validate a command; it cannot validate \"I dealt 400 damage\".",
            "**Widening window plus hard ping cap.** Queues stay short for most players and everyone eventually matches, while the worst-ping matches are never made.",
            "**Pre-warmed server pool and signed tokens.** Players see no boot time, and only their own match's players can connect.",
            "**Delayed spectating.** It keeps a live information feed from becoming a ghosting tool."
          ]
        },
        {
          "type": "callout",
          "kind": "agent",
          "text": "Delegate the mechanical, testable parts: the snapshot ring buffer, input queue and misprediction detection, a network conditioner that injects latency, jitter and loss, a replay recorder and player, and unit tests for Elo or Glicko updates. Verify the properties a model gets subtly wrong. Run the same input log twice, and on two platforms, and compare per-frame checksums. Run a randomised test where a session with random delays and rollbacks must end in the same state as a zero-latency one. Grep the simulation assembly for `float`, `Dictionary`, `UnityEngine.Random`, `Time.` and LINQ, and check in the Profiler that `Step` allocates nothing. Ask for the simulation in its own assembly definition so presentation code cannot reach in. Keep matchmaking and anti-cheat thresholds (windows, penalties, tolerances) in config that you tune from real data, not constants the agent picked."
        },
        {
          "type": "p",
          "text": "The through-line is to decide first what the simulation can be: small and deterministic (rollback), large and deterministic (lockstep) or secret (server authority). Latency hiding, trust, bandwidth, replays and cheating all follow from that one choice."
        },
        {
          "type": "patterns",
          "patterns": [
            {
              "signal": "1v1 game, state under ~100 KB, players notice any input lag, ping to peers around 40 to 120 ms",
              "use": "Rollback netcode with 1-3 frames of input delay",
              "why": "Local input is never held back, and a wrong prediction is repaired by replaying a few frames inside one frame budget. It needs deterministic, cheap-to-copy state."
            },
            {
              "signal": "Thousands of units, state too big to snapshot or send, bandwidth is the limit",
              "use": "Deterministic lockstep, send commands only",
              "why": "Bandwidth depends on commands per second, not on unit count. The game then runs at the slowest peer's pace and every client holds the full state."
            },
            {
              "signal": "Players report wallhacks, and enemy positions outside vision are present in packets",
              "use": "Filter replication by team visibility, server-side",
              "why": "Hidden data that never leaves the server cannot be read. Encryption and obfuscation fail because the client must decode what it uses. Filter events and sounds too."
            },
            {
              "signal": "Checksums differ at frame N although both peers logged identical inputs",
              "use": "Dump both states at the first bad frame and diff",
              "why": "The first mismatching field names the cause: a float function, an unordered collection, an uninitialised value or a stray random call. Later frames only show knock-on damage."
            },
            {
              "signal": "Top-rated players wait minutes off-peak while mid-ladder players match in seconds",
              "use": "Widen the rating window as queue time grows",
              "why": "A window that starts tight and relaxes in steps gives close matches when the pool is deep and still finishes when it is thin. Cap the width and keep the ping limit fixed."
            },
            {
              "signal": "A client message says what happened: damage dealt, position reached, item gained",
              "use": "Accept only inputs and validate on the server",
              "why": "The server cannot verify a claimed result, but it can compute the result from an intent and reject impossible ones: too fast, on cooldown, out of range, not visible."
            },
            {
              "signal": "Support needs to reproduce a disputed match from last week or review a cheating report",
              "use": "Record versioned inputs and replay them",
              "why": "A deterministic simulation turns the build id, seed and per-frame inputs into the whole match, about 240 B/s for 2 players. Without the version tag, patches break old replays."
            },
            {
              "signal": "New accounts win 85 percent of games and gain 300 rating points in their first 20 matches",
              "use": "Flag a likely smurf and converge its rating fast",
              "why": "High uncertainty makes a rating move quickly, so the player leaves the beginner pool in a few games. Combine with device and behaviour signals before any sanction."
            }
          ]
        }
      ],
      "keyPoints": [
        "Rollback and lockstep need a deterministic simulation: fixed timestep, integer or fixed-point math, owned seeded RNG, fixed iteration order, and per-frame state checksums to catch desync.",
        "Rollback predicts remote input by repeating the last one, restores a saved snapshot when the real input differs and resimulates up to about 7 to 8 frames in one frame budget, using 1 to 3 frames of input delay.",
        "Lockstep sends only commands, so bandwidth ignores unit count, but the game runs at the slowest peer and every client holds the full state.",
        "A server-authoritative MOBA accepts intents, validates them and filters replication by per-team visibility so hidden enemies are never sent.",
        "Elo updates R' = R + K(S - E) with E = 1/(1+10^((Rb-Ra)/400)); Glicko and TrueSkill add uncertainty, and a queue window that widens with wait time trades quality for speed.",
        "Replays are versioned input logs, spectating is delayed, and ranked integrity covers desync arbitration, leaver penalties and smurf detection."
      ],
      "quiz": [
        {
          "q": "A rollback build passes tests on one platform, but a Windows and Android match desyncs after ~20 s. Inputs match, and the first bad checksum lands on a frame where a projectile uses `Mathf.Sin`. What is the right fix?",
          "options": [
            "Raise input delay from 2 to 4 frames so peers stay in step",
            "Use fixed-point or table-based trig in the simulation",
            "Send the full state to the guest every second to resync",
            "Lower MaxRollback so that fewer frames can diverge"
          ],
          "answer": 1,
          "explain": "Float transcendental functions can differ between CPUs and runtimes, so the same inputs yield different bits. Fixed-point or integer tables make every platform agree. More delay and a lower rollback cap change timing, not arithmetic, and periodic resync hides a bug that corrupts the match anyway."
        },
        {
          "q": "The simulation is at frame 134 using predicted input. The real remote input for frame 130 arrives and differs from the guess. What does a rollback client do?",
          "options": [
            "Teleport the opponent to where they should be at frame 134",
            "Pause and wait until all inputs up to frame 134 are confirmed",
            "Replay frame 130 to 134 on top of the current state",
            "Restore the frame 130 snapshot and resimulate to 134"
          ],
          "answer": 3,
          "explain": "The snapshot of the state before frame 130 plus corrected inputs reproduces what should have happened, and all five steps fit in one tick. Teleporting the character ignores knock-on effects such as hits and RNG draws, waiting is delay-based netcode, and replaying onto the current state applies frames twice."
        },
        {
          "q": "Players of a 5v5 arena game use a tool that shows enemy heroes behind fog. The server broadcasts the same snapshot to all ten clients. Which change closes the hole?",
          "options": [
            "Filter snapshots per team by server-side visibility",
            "Encrypt the snapshot with a per-match key held by the client",
            "Randomise entity IDs each tick so tools cannot track heroes",
            "Have the client hide fogged heroes and trust it to do so"
          ],
          "answer": 0,
          "explain": "Data that is never sent cannot be read from memory or traffic. Encryption and ID shuffling fail because the client must decode and use the data, and a client-side hide is exactly what a cheat patches out."
        },
        {
          "q": "Using R' = R + K(S - E) with K = 20, a 1700 player beats a 1500 player. E for the winner is about 0.76. How many points does the winner gain?",
          "options": [
            "+10.0",
            "+15.2",
            "+4.8",
            "+0.8"
          ],
          "answer": 2,
          "explain": "The gain is K times (1 - 0.76) = 20 x 0.24 = 4.8. +10 would be the gain for an evenly matched game, and +15.2 is what the favourite would lose with a defeat. A win against a weaker player moves the rating little."
        },
        {
          "q": "An RTS has 3,000 units and 8 players. The team wants the lowest possible bandwidth and accepts a deterministic simulation. Which tradeoff comes with the lockstep design they pick?",
          "options": [
            "Snapshots of every unit must be sent to keep clients in sync",
            "The game advances only as fast as the slowest peer's commands arrive",
            "The server must filter units so that hidden ones are never sent",
            "Each client may run a different tick rate, set by its own CPU"
          ],
          "answer": 1,
          "explain": "A turn cannot execute until every player's command bundle for it has arrived, so the slowest peer sets the pace. Lockstep sends commands, not unit snapshots, needs identical ticks on all machines, and gives each client the full state, so filtering is not possible."
        },
        {
          "q": "Ranked queue data: at 4 am the top 1 percent wait 6 minutes while average players match in 20 seconds. Designers do not want top players matched with beginners. Which move fits?",
          "options": [
            "Lower K so that ratings change less and look closer together",
            "Remove the ping limit so that more players qualify at 4 am",
            "Widen the rating window in steps as queue time grows, with a cap",
            "Move to lockstep so that fewer server resources are needed"
          ],
          "answer": 2,
          "explain": "A capped window that widens with wait time keeps matches close when the pool is deep and still finishes when it is thin. K changes how fast ratings move, not who is in the queue, lockstep is a netcode choice, and dropping the ping limit creates bad games for everyone."
        }
      ]
    }
  ],
  "exam": [
    {
      "q": "Inside search, a line returns to a position already on the current path. You score it 0 at the first repeat, though the rules need three occurrences. A teammate calls it a bug. What is the right view?",
      "options": [
        "Bug: only the third occurrence may be scored as a draw, otherwise search is unsound",
        "Bug: a repeat should be scored with the static evaluation of that position instead",
        "Intended: if both sides chose this cycle once, they can repeat it, so it is a draw",
        "Intended only if the transposition table is cleared before every search iteration"
      ],
      "answer": 2,
      "explain": "If neither side had anything better than entering the cycle, it will repeat, so search scores the first repeat as a draw and saves the nodes; the game loop still enforces threefold from the full history. The caveat is the transposition table: scores that depended on a path-specific repetition can be wrong when reused through another path, which is why engines are careful about storing them, not a reason to clear the table."
    },
    {
      "q": "Mate is scored as Mate - ply (Mate = 30000). A node at ply 4 proves mate 6 plies later and the raw score 29990 is stored in the TT. The entry is probed at ply 12 in another line. What goes wrong, and what is the fix?",
      "options": [
        "It implies mate before ply 12; store it relative to the node and adjust on probe",
        "Nothing; scores in the table are absolute, so they stay valid whatever the probe ply",
        "It overflows the 16-bit score field; clamp every stored score to plus or minus 20000",
        "The entry is stale; refuse to store any score above 29000 and search it again"
      ],
      "answer": 0,
      "explain": "Raw 29990 means mate at ply 10 from the root, which is before the probing node at ply 12, so the reported distance is wrong. Store the mate as 'in 6 plies from this node' (29994 here) and subtract the probing ply on read, giving 29982, a mate at ply 18. Clamping or refusing to store mate scores either loses the information or wastes the table."
    },
    {
      "q": "A 64 MB table holds 16-byte entries and every searched node stores a distinct position at 2 million nodes per second. About when does it start overwriting, and what follows?",
      "options": [
        "About 30 s in; below that, an always-replace policy loses nothing important",
        "About 2 min in; entries are 64-bit, so overwriting them is harmless to results",
        "About 20 s in; the table is large, so overwriting stays a rare event",
        "About 2 s in; replacement and aging now decide how much deep work survives"
      ],
      "answer": 3,
      "explain": "64 MB / 16 B = 4,194,304 entries, and at 2 million new positions per second that is full in about 2 seconds, well inside one move. From then on the replacement policy (prefer deep entries, age out old ones) determines how much useful work the table keeps. In practice many nodes are repeats, so fill is slower, but the policy still matters for long searches."
    },
    {
      "q": "A boss knockback sets vx = 2400 px/s. The sim runs at 60 Hz, tiles are 16 px, the player is 14 px wide, and collision tests only each move's final position. A player 2 px from a one-tile wall is launched at it and appears on the far side. Which fix keeps the knockback speed and the 60 Hz tick?",
      "options": [
        "Make the wall two tiles thick so the final position still overlaps it",
        "Clamp the knockback to 600 px/s so no move can exceed one tile",
        "Switch the character to a dynamic rigidbody with continuous detection",
        "Resolve each tick in sub-steps of at most 8 px, testing after each one"
      ],
      "answer": 3,
      "explain": "The move is 40 px per tick, more than the 32 px (2 + 16 + 14) needed to clear the gap and a one-tile wall, so the final position overlaps nothing. Stepping at most half a tile and testing after each step finds the wall at any speed and costs about 5 cheap grid lookups. Thicker walls patch one level and fail again at the next speed. Clamping changes the feel you wanted to keep. A dynamic body throws away the controller to solve a problem sub-stepping solves in a few lines."
    },
    {
      "q": "A jump is specified as apex 80 px, time to apex 0.4 s, and a fall gravity multiplier of 2. About how long does the fall from the apex back to the launch height take?",
      "options": [
        "About 0.20 s, because the multiplier halves the time",
        "About 0.28 s: the rise time divided by the square root of 2",
        "About 0.40 s, because a jump arc is symmetric",
        "About 0.57 s, because the fall covers twice the distance"
      ],
      "answer": 1,
      "explain": "Rising gravity is 2h / t² = 160 / 0.16 = 1000 px/s², so the fall gravity is 2000. Fall time is sqrt(2h / g) = sqrt(160 / 2000) = 0.283 s, which is 0.4 / sqrt(2). Doubling gravity does not halve the time, because distance goes with t². The arc is only symmetric with equal gravity, and the fall covers the same 80 px, not twice that."
    },
    {
      "q": "The jump code is `if (buffer > 0 && coyote > 0) vel.y = v0;` and it clears only the buffer. Players can jump twice by tapping jump twice quickly after leaving the ground. What is the correct fix?",
      "options": [
        "Clear the coyote timer in the same branch that fires the jump",
        "Cut the coyote window to 0.05 s so the second jump is rarer",
        "Require onGround as well as the coyote timer before jumping",
        "Ignore new buffered presses while the character is airborne"
      ],
      "answer": 0,
      "explain": "After the first jump the coyote timer is still positive, so a second press satisfies both conditions in mid-air. Consuming both timers at takeoff removes the extra jump entirely. A shorter window only makes the bug rarer. Requiring onGround deletes coyote time, which is the feature. Ignoring presses in the air also blocks the buffer, so early presses before landing stop working."
    },
    {
      "q": "A 120 kg kart sits on four raycast wheels. You want each spring to sit at 0.08 m of compression at rest (g = 9.81). Which spring constant k is correct, to the nearest 10 N/m?",
      "options": [
        "920 N/m",
        "14,720 N/m",
        "3,680 N/m",
        "29,430 N/m"
      ],
      "answer": 2,
      "explain": "Each wheel carries a quarter of the weight: 120 * 9.81 / 4 = 294.3 N. Then k = 294.3 / 0.08 = 3,679 N/m, about 3,680. Forgetting the division by four gives 14,720; dividing by 0.32 gives 920; 29,430 uses the full weight over half the compression."
    },
    {
      "q": "Prediction runs at 60 Hz. A server correction for tick 600 arrives while the client is at tick 605, and the client's stored state disagrees by 0.4 m. What should the client do?",
      "options": [
        "Snap to the server state for tick 600 and keep running from there",
        "Ignore it, because the local kart is always correct for the player",
        "Restore tick 600, replay inputs 601 to 605, smooth the error",
        "Extrapolate the server state by 5 ticks of the last velocity"
      ],
      "answer": 2,
      "explain": "The server state is five ticks old. Restoring it and replaying the unacknowledged inputs brings it to the present, and decaying the visual error hides the 0.4 m correction. Snapping to tick 600 rewinds the kart by 83 ms, ignoring it lets the client drift away, and extrapolating the velocity throws away the player's inputs."
    },
    {
      "q": "Players found that driving off a ledge near the end of a shortcut, then respawning at the nearest spline point, skips a checkpoint gate. How do you close the exploit without breaking normal falls?",
      "options": [
        "Respawn at the last gate passed; count laps in gate order",
        "Move the kill plane lower so the fall takes longer",
        "Make the respawn point the nearest spline point plus 20 m back",
        "Remove the shortcut from the track so nothing can be skipped"
      ],
      "answer": 0,
      "explain": "Progress can only be gained by crossing gates in order, and respawning at the last gate restores the state that was earned. A lower kill plane or a 20 m offset only changes how far the exploit lands, and removing the shortcut hides the design flaw rather than fixing it."
    },
    {
      "q": "A 64 Hz server compensates with RTT plus interpolation delay. A shooter has 60 ms RTT and interpolates 2 ticks (31 ms). A target runs at 6 m/s toward cover. About how far past the corner can the target be when the hit still counts?",
      "options": [
        "About 0.55 m, because the rewind is roughly 91 ms",
        "About 0.1 m, because only one tick is rewound",
        "About 1.2 m, because both pings are counted twice",
        "About 0 m, since lag compensation stops at corners"
      ],
      "answer": 0,
      "explain": "Rewind is about 60 + 31 = 91 ms, and 6 m/s * 0.091 s is about 0.55 m. Rewinding a single tick would ignore the latency being compensated, doubling the ping has no basis, and lag compensation has no knowledge of corners."
    },
    {
      "q": "A level has 40 AI agents. Profiling shows 3 sight raycasts per agent every frame cost 1.4 ms at 60 fps. Which change keeps behaviour believable and cuts the cost the most?",
      "options": [
        "Cast only one ray, to the player's feet, for every agent",
        "Use the render mesh for sight rays so each ray is more precise",
        "Reduce the number of agents to 10 in every encounter",
        "Stagger perception at 5 to 10 Hz after cheap cone tests"
      ],
      "answer": 3,
      "explain": "Time-slicing and cheap rejection reduce the ray count by about 6 to 12 times while reaction times stay human. One foot ray breaks partial-cover sight, mesh rays cost more, and removing agents changes the design instead of the cost."
    },
    {
      "q": "A designer wants a 120 m open hall where the player sees 300 props and 20 enemies at once. Frame time doubles there. What is the best first response?",
      "options": [
        "Lower texture resolution across the whole game to save memory",
        "Break the sightline with a turn or door, then bake occlusion",
        "Disable shadows only in this hall, and ship it unchanged",
        "Raise the camera far plane so culling covers the full hall"
      ],
      "answer": 1,
      "explain": "The cost is set by the worst view, and a long open sightline defeats occlusion. Shortening it or breaking it up lets baked visibility cull most of the hall, and LODs cover what must stay visible. Texture size, shadows alone and far plane changes do not address the visible set."
    },
    {
      "q": "Mounted travel reaches 25 m/s. A 128 m cell takes up to 4 s to load (95th percentile), and terrain and props must be ready when the cell is 256 m away. Which load and unload radii, in cells, meet the deadline without reloading cells at borders?",
      "options": [
        "2 cells load, 2 cells unload: it is the cheapest in memory",
        "3 cells load, 4 cells unload: 128 m of lead and a one-cell gap",
        "2 cells load, 3 cells unload: 256 m matches the view range",
        "3 cells load, 3 cells unload: the same radius saves one setting"
      ],
      "answer": 1,
      "explain": "A 4 s load at 25 m/s covers 100 m, so the request must start at least 356 m out. A 3-cell load radius (384 m) gives 128 m of lead, about 5.1 s at 25 m/s, which covers the 4 s load with about 1 s to spare, and a 4-cell unload radius adds the hysteresis gap. Loading at 256 m is 100 m too late and shows pop-in, and equal radii thrash at borders."
    },
    {
      "q": "A save from version 3 is opened by build version 6. Version 4 renamed the fact guild_rep to faction.guild.rep. Version 5 split the fact gold into gold and debt. Version 6 removed an NPC whose ID still appears in the saved deltas. Which loader is correct?",
      "options": [
        "Reject saves older than the previous version and ask the player to restart",
        "Read both old and new fact names in game code and keep that forever",
        "Edit the 3 to 4 migration so that it also covers the later renames",
        "Run migrations 3 to 4, 4 to 5, 5 to 6 in order; skip unknown IDs"
      ],
      "answer": 3,
      "explain": "Each migration is a small pure function for one version step, run in sequence, and tested against a real saved file from each version. Unknown IDs are skipped so removed content cannot crash the load. Rejecting old saves loses progress, dual names spread legacy into all code, and editing an old migration breaks saves already upgraded by it."
    },
    {
      "q": "Right after a 1 km origin shift, the trails of thrown arrows streak across the screen for one frame and agents head for destinations 1 km off. The static world and the player look correct. What was missed?",
      "options": [
        "Objects holding cached world-space positions never received the shift delta",
        "The threshold is too small, and shifting less often would hide the artefacts",
        "The shift should run in FixedUpdate so that it happens before physics",
        "Trails and agents need 64-bit positions so that the error cannot occur"
      ],
      "answer": 0,
      "explain": "The shift moves roots, but anything storing world coordinates separately (trail points, agent destinations, audio positions, cached targets) still holds the old values. Broadcasting the delta in the same frame fixes them all. A rarer shift only makes the jump bigger, the update phase is not the cause, and doubles on every consumer defeat the purpose of the shift."
    },
    {
      "q": "Your fighting game steps in 1.8 ms, and rendering plus engine work take 8 ms of a 16.7 ms frame. Rollback of n frames costs n + 1 steps. What is the largest rollback that fits, and what should you do about a design cap of 8?",
      "options": [
        "3 frames; speed up the step or raise input delay before allowing 8",
        "8 frames; resimulation skips rendering so only the sim matters",
        "4 frames; the current-frame step does not count toward the budget",
        "5 frames; the render cost shrinks while a rollback is running"
      ],
      "answer": 0,
      "explain": "The sim budget is 16.7 - 8 = 8.7 ms, which is 4 steps at 1.8 ms, so n + 1 = 4 and n = 3. A rollback of 8 would need 9 x 1.8 + 8 = 24.2 ms. The current frame's step is a real cost, and render does not get cheaper during a rollback. Fix the step cost or move the latency into input delay."
    },
    {
      "q": "A MOBA filters hidden enemy entities per team, but a cheat tool still reveals jungle camps being cleared. Ability and sound events are broadcast with their positions to all clients, and clients decide whether to show them. What is the real fix?",
      "options": [
        "Encrypt the event packets with a key the client holds",
        "Filter events per team by the server's visibility grid",
        "Add a small random offset to every broadcast event position",
        "Have the client drop events outside the player's own view"
      ],
      "answer": 1,
      "explain": "Events carry the same hidden information as entities, so they need the same server-side filter. Encryption, noise and client-side dropping leave the data on the machine of a cheater who controls the client."
    },
    {
      "q": "A ranked peer-to-peer rollback match ends at frame 3,000 when the per-frame checksums stop matching, and each player blames the other. What design decision lets you resolve this fairly?",
      "options": [
        "Trust the checksum of whichever player has the better rating",
        "Let the lower-ping player's state win, since it is more current",
        "Make it a no-contest; route checksums or inputs via a service",
        "Let both players keep playing and recompute the result afterwards"
      ],
      "answer": 2,
      "explain": "Without a neutral party neither state can be proved right, so the match should be a no-contest with no rating change, and the design should send checksums or inputs through a service that can replay them. Picking by rating or ping rewards the wrong thing, and continuing a diverged match gives results that no one can verify."
    }
  ]
});
