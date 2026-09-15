/**
 * movement/pawn.js
 * Déplacements du pion : avance, double pas, prises, prise en passant et promotion
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { createSquare, isInside } from '../square.js'
import { createMove, MoveFlag } from '../move.js'
import { pieceAt } from '../position.js'
import { Color } from '../color.js'
import { PieceType } from '../piece.js'

const PROMOTIONS = [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT]

// Coups pseudo-légaux du pion depuis from, parcontre le sens de marche dépend de sa couleur
export function pseudoLegalMoves(position, from) {
  const me = pieceAt(position, from)
  const dir = me.color === Color.WHITE ? 1 : -1
  const startRank = me.color === Color.WHITE ? 1 : 6
  const lastRank = me.color === Color.WHITE ? 7 : 0
  const moves = []

  // avance tout droit si la case devant est libre, puis double pas depuis la rangée de départ
  const oneRank = from.rank + dir
  if (isInside(from.file, oneRank) && !pieceAt(position, createSquare(from.file, oneRank))) {
    addPawnMove(moves, from, createSquare(from.file, oneRank), lastRank)
    const twoRank = from.rank + 2 * dir
    if (from.rank === startRank && !pieceAt(position, createSquare(from.file, twoRank))) {
      moves.push(createMove(from, createSquare(from.file, twoRank), { flag: MoveFlag.DOUBLE_PUSH }))
    }
  }

  // prises en diagonale, et prise en passant si la case visée est celle marquée par la position
  for (const df of [-1, 1]) {
    const file = from.file + df
    const rank = from.rank + dir
    if (!isInside(file, rank)) continue
    const target = createSquare(file, rank)
    const occupant = pieceAt(position, target)
    if (occupant && occupant.color !== me.color) {
      addPawnMove(moves, from, target, lastRank, MoveFlag.CAPTURE)
    }
    if (position.enPassant && position.enPassant.file === file && position.enPassant.rank === rank) {
      moves.push(createMove(from, target, { flag: MoveFlag.EN_PASSANT }))
    }
  }

  return moves
}

// Ajoute le coup ou quatre coups si le pion atteint la dernière rangée, un par pièce de promotion
function addPawnMove(moves, from, to, lastRank, flag) {
  if (to.rank === lastRank) {
    for (const type of PROMOTIONS) {
      moves.push(createMove(from, to, { promotion: type, flag: MoveFlag.PROMOTION }))
    }
  } else {
    moves.push(createMove(from, to, flag ? { flag } : {}))
  }
}
