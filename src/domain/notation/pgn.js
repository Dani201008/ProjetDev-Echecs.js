/**
 * pgn.js
 * Écrit et relit une partie complète au format PGN : quelques en-têtes, puis les coups numérotés en SAN
 * Exemple : 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0
 * Auteur : Samuel Theytaz
 * Date : 27.10.2026
 */
import { Color } from '../color.js'
import { applyMove, startingPosition } from '../position.js'
import { getGameStatus, GameStatus } from '../rules.js'
import { toFEN, fromFEN } from './fen.js'
import { toSAN, fromSAN } from './san.js'

const STARTING_FEN = toFEN(startingPosition())
const RESULTS = ['1-0', '0-1', '1/2-1/2', '*']

// Écrit en PGN la partie jouée depuis la position start avec la liste de coups moves
export function toPGN(start, moves) {
  let position = start
  const previousPositions = []
  let text = ''

  moves.forEach((move, index) => {
    // le numéro s'écrit avant le coup des blancs, ou avec "..." si la partie commence par les noirs
    if (position.sideToMove === Color.WHITE) text += `${position.fullmove}. `
    else if (index === 0) text += `${position.fullmove}... `
    text += `${toSAN(position, move)} `
    previousPositions.push(position)
    position = applyMove(position, move)
  })

  const result = resultOf(position, previousPositions)
  const headers = ['[Event "echecs.js"]', `[Result "${result}"]`]
  // une partie qui ne commence pas à la position de départ doit donner sa position en FEN
  const startFEN = toFEN(start)
  if (startFEN !== STARTING_FEN) headers.push('[SetUp "1"]', `[FEN "${startFEN}"]`)

  return `${headers.join('\n')}\n\n${text}${result}`
}

// Relit un texte PGN, renvoie la position de départ et la liste des coups pour pouvoir les rejouer
export function fromPGN(text) {
  const fen = text.match(/\[FEN "([^"]+)"\]/)
  const start = fen ? fromFEN(fen[1]) : startingPosition()

  // on enlève les en-têtes [...] et les commentaires {...}, puis les numéros "1." et le résultat
  const tokens = text
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^\d+\.+/, ''))
    .filter((token) => token !== '' && !RESULTS.includes(token))

  const moves = []
  let position = start
  for (const token of tokens) {
    const move = fromSAN(position, token)
    if (!move) throw new Error(`PGN invalide, coup impossible : ${token}`)
    moves.push(move)
    position = applyMove(position, move)
  }
  return { start, moves }
}

// Résultat au format PGN : 1-0 ou 0-1 après un mat, 1/2-1/2 pour une nulle, * si la partie continue
function resultOf(position, previousPositions) {
  const status = getGameStatus(position, previousPositions)
  if (status === GameStatus.CHECKMATE) return position.sideToMove === Color.WHITE ? '0-1' : '1-0'
  if (status === GameStatus.ONGOING || status === GameStatus.CHECK) return '*'
  return '1/2-1/2'
}
