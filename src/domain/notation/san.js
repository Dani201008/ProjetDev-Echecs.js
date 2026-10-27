/**
 * san.js
 * Écrit un coup en notation algébrique (SAN), celle des livres et du PGN : e4, Nf3, exd5, O-O, e8=Q+
 * Les lettres des pièces sont celles du PGN, en anglais : N cavalier, B fou, R tour, Q dame, K roi
 * Auteur : Samuel Theytaz
 * Date : 27.10.2026
 */
import { PieceType } from '../piece.js'
import { MoveFlag } from '../move.js'
import { toAlgebraic } from '../square.js'
import { applyMove, pieceAt } from '../position.js'
import { legalMoves } from '../moveGenerator.js'
import { isInCheck } from '../rules.js'

// Convertit un coup légal en SAN, position est celle d'avant le coup
export function toSAN(position, move) {
  return moveText(position, move) + checkSuffix(position, move)
}

// Retrouve le coup légal qui correspond à un texte SAN, ou null s'il n'y en a pas
// on compare sans les signes + # ! ? qui ne changent pas le coup
export function fromSAN(position, text) {
  const wanted = cleanSAN(text)
  return legalMoves(position).find((move) => cleanSAN(toSAN(position, move)) === wanted) ?? null
}

function moveText(position, move) {
  if (move.flag === MoveFlag.CASTLE_KING) return 'O-O'
  if (move.flag === MoveFlag.CASTLE_QUEEN) return 'O-O-O'

  const piece = pieceAt(position, move.from)
  const target = toAlgebraic(move.to)
  const isCapture = pieceAt(position, move.to) !== null || move.flag === MoveFlag.EN_PASSANT

  // le pion n'a pas de lettre, quand il prend on note sa colonne de départ : exd5
  if (piece.type === PieceType.PAWN) {
    let text = isCapture ? `${toAlgebraic(move.from)[0]}x${target}` : target
    if (move.promotion) text += `=${move.promotion.toUpperCase()}`
    return text
  }

  return piece.type.toUpperCase() + disambiguation(position, move, piece) + (isCapture ? 'x' : '') + target
}

// Si deux pièces pareilles peuvent aller sur la même case, on précise d'où part la bonne
// d'abord avec la colonne (Nbd2), sinon avec la rangée (R1e2), et les deux si ça ne suffit pas
function disambiguation(position, move, piece) {
  const rivals = legalMoves(position).filter((other) => {
    const sameTarget = other.to.file === move.to.file && other.to.rank === move.to.rank
    const sameStart = other.from.file === move.from.file && other.from.rank === move.from.rank
    return sameTarget && !sameStart && pieceAt(position, other.from).type === piece.type
  })
  if (rivals.length === 0) return ''

  const from = toAlgebraic(move.from)
  if (rivals.every((other) => other.from.file !== move.from.file)) return from[0]
  if (rivals.every((other) => other.from.rank !== move.from.rank)) return from[1]
  return from
}

// + si le coup met le roi adverse en échec, # si en plus il n'a plus aucun coup (mat)
function checkSuffix(position, move) {
  const after = applyMove(position, move)
  if (!isInCheck(after)) return ''
  return legalMoves(after).length === 0 ? '#' : '+'
}

// on accepte aussi le roque écrit avec des zéros (0-0), aucune case ne contient de 0
function cleanSAN(text) {
  return text.replace(/[+#!?]/g, '').replace(/0/g, 'O').trim()
}
