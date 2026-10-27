/**
 * fen.js
 * Conversion entre une position et la notation FEN, une ligne de texte qui décrit toute la position
 * Position de départ : rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
 * Auteur : Samuel Theytaz
 * Date : 27.10.2026
 */
import { Color } from '../color.js'
import { createPiece, PieceType } from '../piece.js'
import { toAlgebraic, fromAlgebraic } from '../square.js'
import { freeze } from '../position.js'

const PIECE_LETTERS = Object.values(PieceType)

// Écrit une position en FEN, les six champs sont dans le même ordre que dans Position
export function toFEN(position) {
  const rows = []
  // le FEN commence par la rangée 8, donc on parcourt le plateau depuis le haut
  for (let rank = 7; rank >= 0; rank--) {
    let row = ''
    let empty = 0
    for (let file = 0; file < 8; file++) {
      const piece = position.board[rank][file]
      if (!piece) {
        empty++
        continue
      }
      if (empty > 0) {
        row += empty
        empty = 0
      }
      // majuscule pour les blancs, minuscule pour les noirs
      row += piece.color === Color.WHITE ? piece.type.toUpperCase() : piece.type
    }
    if (empty > 0) row += empty
    rows.push(row)
  }

  return [
    rows.join('/'),
    position.sideToMove === Color.WHITE ? 'w' : 'b',
    castlingToFEN(position.castling),
    position.enPassant ? toAlgebraic(position.enPassant) : '-',
    position.halfmoveClock,
    position.fullmove,
  ].join(' ')
}

// Lit une ligne FEN et reconstruit la position, figée comme celles de position.js
export function fromFEN(text) {
  const [placement, side, castling = '-', enPassant = '-', halfmove = '0', fullmove = '1'] = text.trim().split(/\s+/)
  const rows = placement.split('/')
  if (rows.length !== 8) throw new Error(`FEN invalide, il faut 8 rangées : ${text}`)

  const board = Array.from({ length: 8 }, () => Array(8).fill(null))
  rows.forEach((row, index) => {
    const rank = 7 - index
    let file = 0
    for (const char of row) {
      // un chiffre veut dire autant de cases vides à sauter
      if (char >= '1' && char <= '8') {
        file += Number(char)
        continue
      }
      const type = char.toLowerCase()
      if (!PIECE_LETTERS.includes(type)) throw new Error(`FEN invalide, pièce inconnue : ${char}`)
      const color = char === type ? Color.BLACK : Color.WHITE
      board[rank][file] = createPiece(type, color)
      file++
    }
  })

  return freeze({
    board,
    sideToMove: side === 'b' ? Color.BLACK : Color.WHITE,
    castling: {
      whiteKing: castling.includes('K'),
      whiteQueen: castling.includes('Q'),
      blackKing: castling.includes('k'),
      blackQueen: castling.includes('q'),
    },
    enPassant: enPassant === '-' ? null : fromAlgebraic(enPassant),
    halfmoveClock: Number(halfmove),
    fullmove: Number(fullmove),
  })
}

// Droits de roque au format FEN : KQkq, ou - s'il n'en reste aucun
function castlingToFEN(castling) {
  let text = ''
  if (castling.whiteKing) text += 'K'
  if (castling.whiteQueen) text += 'Q'
  if (castling.blackKing) text += 'k'
  if (castling.blackQueen) text += 'q'
  return text || '-'
}
