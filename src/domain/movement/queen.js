/**
 * movement/queen.js
 * Déplacements de la dame, lignes et diagonales confiées à ray.js
 *
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { slidingMoves } from './ray.js'

export function pseudoLegalMoves(position, from) {
  return slidingMoves(position, from, [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ])
}
