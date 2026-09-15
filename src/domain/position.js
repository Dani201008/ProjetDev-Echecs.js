/**
 * position.js
 * L'état complet de la partie à un instant, et la façon de le faire évoluer après un coup
 * Les champs sont ceux d'un FEN, ce qui rendra la sauvegarde simple
 *
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { Color, opposite } from './color.js'
import { createPiece, PieceType } from './piece.js'
import { createSquare } from './square.js'
import { MoveFlag } from './move.js'

const BACK_RANK = [
  PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
  PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK,
]

// Construit la position de départ par défaut
export function startingPosition() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null))
  for (let file = 0; file < 8; file++) {
    board[0][file] = createPiece(BACK_RANK[file], Color.WHITE)
    board[1][file] = createPiece(PieceType.PAWN, Color.WHITE)
    board[6][file] = createPiece(PieceType.PAWN, Color.BLACK)
    board[7][file] = createPiece(BACK_RANK[file], Color.BLACK)
  }
  return freeze({
    board,
    sideToMove: Color.WHITE,
    castling: { whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true },
    enPassant: null,
    halfmoveClock: 0,
    fullmove: 1,
  })
}

// Renvoie la pièce sur une case, ou null si elle est vide
export function pieceAt(position, square) {
  return position.board[square.rank][square.file]
}

// Applique un coup et renvoie une nouvelle position sans toucher à l'ancienne
// ce détachement permet d'essayer un coup pour tester si c'est possible sans casser la partie
export function applyMove(position, move) {
  const board = position.board.map((row) => row.slice())
  const piece = board[move.from.rank][move.from.file]
  const captured = board[move.to.rank][move.to.file]
  const color = piece.color

  board[move.from.rank][move.from.file] = null
  board[move.to.rank][move.to.file] = move.promotion ? createPiece(move.promotion, color) : piece

  // le pion pris en passant est sur le côté, pas sur la case d'arrivée
  if (move.flag === MoveFlag.EN_PASSANT) {
    board[move.from.rank][move.to.file] = null
  }
  // au rock il reste à déplacer la tour, le roi a déjà bougé au-dessus
  if (move.flag === MoveFlag.CASTLE_KING) {
    board[move.from.rank][5] = board[move.from.rank][7]
    board[move.from.rank][7] = null
  }
  if (move.flag === MoveFlag.CASTLE_QUEEN) {
    board[move.from.rank][3] = board[move.from.rank][0]
    board[move.from.rank][0] = null
  }

  return freeze({
    board,
    sideToMove: opposite(color),
    castling: nextCastling(position.castling, piece, move),
    // une poussée double laisse la case du milieu ouverte à une prise en passant au coup suivant
    enPassant: move.flag === MoveFlag.DOUBLE_PUSH
      ? createSquare(move.to.file, (move.from.rank + move.to.rank) / 2)
      : null,
    halfmoveClock: piece.type === PieceType.PAWN || captured ? 0 : position.halfmoveClock + 1,
    fullmove: color === Color.WHITE ? position.fullmove : position.fullmove + 1,
  })
}

// Recalcule les droits de roque, perdus quand le roi bouge ou qu'une tour quitte son coin
function nextCastling(castling, piece, move) {
  const c = { ...castling }
  if (piece.type === PieceType.KING) {
    if (piece.color === Color.WHITE) { c.whiteKing = false; c.whiteQueen = false }
    else { c.blackKing = false; c.blackQueen = false }
  }
  for (const sq of [move.from, move.to]) {
    if (sq.rank === 0 && sq.file === 0) c.whiteQueen = false
    if (sq.rank === 0 && sq.file === 7) c.whiteKing = false
    if (sq.rank === 7 && sq.file === 0) c.blackQueen = false
    if (sq.rank === 7 && sq.file === 7) c.blackKing = false
  }
  return c
}

// Rend la position immuable pour éviter des modifications accidentelle
function freeze(position) {
  position.board.forEach((row) => Object.freeze(row))
  Object.freeze(position.board)
  return Object.freeze(position)
}
