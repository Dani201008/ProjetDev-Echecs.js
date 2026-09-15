/**
 * movement/knight.js
 * Déplacements du cavalier
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { createSquare, isInside } from '../square.js'
import { createMove, MoveFlag } from '../move.js'
import { pieceAt } from '../position.js'

const OFFSETS = [
  [1, 2], [2, 1], [2, -1], [1, -2],
  [-1, -2], [-2, -1], [-2, 1], [-1, 2],
]

// Coups pseudo-légaux du cavalier depuis la case from
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
