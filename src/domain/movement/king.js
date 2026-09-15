/**
 * movement/king.js
 * Déplacements du roi sur les cases voisines, le roque est traité dans moveGenerator.js
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { createSquare, isInside } from '../square.js'
import { createMove, MoveFlag } from '../move.js'
import { pieceAt } from '../position.js'

const OFFSETS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
]

// Coups pseudo-légaux du roi depuis la case from, hors roque
export function pseudoLegalMoves(position, from) {
  const moves = []
  const me = pieceAt(position, from)
  for (const [df, dr] of OFFSETS) {
    const file = from.file + df
    const rank = from.rank + dr
    if (!isInside(file, rank)) continue
    const target = createSquare(file, rank)
    const occupant = pieceAt(position, target)
    if (!occupant) moves.push(createMove(from, target))
    else if (occupant.color !== me.color) moves.push(createMove(from, target, { flag: MoveFlag.CAPTURE }))
  }
  return moves
}
