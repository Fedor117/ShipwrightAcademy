window.TOPIC_PART = [
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
  }
];
