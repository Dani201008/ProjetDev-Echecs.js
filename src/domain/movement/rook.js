/**
 * movement/rook.js
 * Déplacements de la tour, les lignes et colonnes confiées à ray.js
 *
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { slidingMoves } from './ray.js'

export function pseudoLegalMoves(position, from) {
  return slidingMoves(position, from, [[1, 0], [-1, 0], [0, 1], [0, -1]])
}
