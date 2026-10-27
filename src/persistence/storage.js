/**
 * storage.js
 * Sauvegarde et chargement d'une partie dans le navigateur (localStorage), au format PGN
 * Le PGN garde tous les coups : en le rejouant on retrouve aussi l'historique et les pièces prises
 * Auteur : Samuel Theytaz
 * Date : 27.10.2026
 */
import { applyMove } from '../domain/position.js'
import { legalMoves } from '../domain/moveGenerator.js'
import { toFEN } from '../domain/notation/fen.js'
import { toPGN, fromPGN } from '../domain/notation/pgn.js'

const STORAGE_KEY = 'echecs.partie'

// Sauvegarde la partie en cours, une seule sauvegarde à la fois
export function saveGame(game) {
  const positions = [...game.history.map((state) => state.position), game.position]
  localStorage.setItem(STORAGE_KEY, toPGN(positions[0], movesBetween(positions)))
}

// Recharge la partie sauvegardée en rejouant ses coups un par un avec game.play()
// renvoie false s'il n'y a encore rien de sauvegardé
export function loadGame(game) {
  const text = localStorage.getItem(STORAGE_KEY)
  if (text === null) return false

  const { start, moves } = fromPGN(text)
  game.reset()
  game.position = start
  for (const move of moves) {
    game.play(move)
  }
  // s'il n'y avait aucun coup à rejouer, l'affichage doit quand même montrer la position de départ
  game.notify()
  return true
}

// Game garde les positions mais pas les coups, on retrouve donc le coup qui fait passer de l'une à la suivante
function movesBetween(positions) {
  const moves = []
  for (let i = 0; i < positions.length - 1; i++) {
    const next = toFEN(positions[i + 1])
    moves.push(legalMoves(positions[i]).find((move) => toFEN(applyMove(positions[i], move)) === next))
  }
  return moves
}
