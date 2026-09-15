/**
 * movement/index.js
 * Associe chaque type de pièce à sa fonction de déplacement
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { PieceType } from '../piece.js'
import * as pawn from './pawn.js'
import * as knight from './knight.js'
import * as bishop from './bishop.js'
import * as rook from './rook.js'
import * as queen from './queen.js'
import * as king from './king.js'

export const MOVE_GENERATORS = Object.freeze({
  [PieceType.PAWN]: pawn.pseudoLegalMoves,
  [PieceType.KNIGHT]: knight.pseudoLegalMoves,
  [PieceType.BISHOP]: bishop.pseudoLegalMoves,
  [PieceType.ROOK]: rook.pseudoLegalMoves,
  [PieceType.QUEEN]: queen.pseudoLegalMoves,
  [PieceType.KING]: king.pseudoLegalMoves,
})
