/**
 * movement/ray.js
 * Déplacements des pièces qui glissent (fou, tour, dame), regroupés en un seul endroit
 *
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { createSquare, isInside } from '../square.js'
import { createMove, MoveFlag } from '../move.js'
import { pieceAt } from '../position.js'

// Génère les coups en suivant chaque direction jusqu'à un bord ou une pièce
// directions est une liste de [df, dr], la fonction renvoie les coups pseudo-légaux
export function slidingMoves(position, from, directions) {
  const moves = []
  const me = pieceAt(position, from)
  for (const [df, dr] of directions) {
    let file = from.file + df
    let rank = from.rank + dr
    while (isInside(file, rank)) {
      const target = createSquare(file, rank)
      const occupant = pieceAt(position, target)
      if (!occupant) {
        moves.push(createMove(from, target))
      } else {
        if (occupant.color !== me.color) {
          moves.push(createMove(from, target, { flag: MoveFlag.CAPTURE }))
        }
        break // une pièce bloque la suite de la ligne
      }
      file += df
      rank += dr
    }
  }
  return moves
}
