/**
 * domain.test.js : tests unitaires du cœur.
 */
import { describe, it, expect } from 'vitest'
import { Color, opposite } from '../src/domain/color.js'
import { createPiece, PieceType } from '../src/domain/piece.js'
import { createSquare, toAlgebraic, fromAlgebraic, isInside } from '../src/domain/square.js'
import { MoveFlag } from '../src/domain/move.js'
import { startingPosition, applyMove, pieceAt } from '../src/domain/position.js'
import { legalMoves } from '../src/domain/moveGenerator.js'
import { fromFEN } from '../src/domain/notation/fen.js'

// Retrouve le coup légal qui va de from à to, par exemple 'e2' et 'e4'
function findMove(position, from, to) {
  return legalMoves(position).find((move) => toAlgebraic(move.from) === from && toAlgebraic(move.to) === to)
}

describe('couleur, pièce et case', () => {
  it('donne le camp adverse', () => {
    expect(opposite(Color.WHITE)).toBe(Color.BLACK)
    expect(opposite(Color.BLACK)).toBe(Color.WHITE)
  })

  it('crée une pièce figée', () => {
    const knight = createPiece(PieceType.KNIGHT, Color.WHITE)
    expect(knight).toEqual({ type: 'n', color: 'white' })
    expect(Object.isFrozen(knight)).toBe(true)
  })

  it('convertit une case et sa notation', () => {
    expect(toAlgebraic(createSquare(4, 3))).toBe('e4')
    expect(fromAlgebraic('a1')).toEqual({ file: 0, rank: 0 })
    expect(fromAlgebraic('h8')).toEqual({ file: 7, rank: 7 })
  })

  it('sait si une case est sur le plateau', () => {
    expect(isInside(0, 7)).toBe(true)
    expect(isInside(8, 0)).toBe(false)
    expect(isInside(3, -1)).toBe(false)
  })
})

describe('position', () => {
  it('place les 32 pièces au départ', () => {
    const position = startingPosition()
    expect(position.board.flat().filter(Boolean)).toHaveLength(32)
    expect(pieceAt(position, fromAlgebraic('e1'))).toEqual({ type: 'k', color: 'white' })
    expect(pieceAt(position, fromAlgebraic('d8'))).toEqual({ type: 'q', color: 'black' })
    expect(position.sideToMove).toBe(Color.WHITE)
  })

  it('applyMove renvoie une nouvelle position sans toucher à l’ancienne', () => {
    const before = startingPosition()
    const after = applyMove(before, findMove(before, 'e2', 'e4'))
    expect(pieceAt(before, fromAlgebraic('e2'))).not.toBe(null)
    expect(pieceAt(after, fromAlgebraic('e2'))).toBe(null)
    expect(pieceAt(after, fromAlgebraic('e4')).type).toBe(PieceType.PAWN)
    expect(after.sideToMove).toBe(Color.BLACK)
    expect(Object.isFrozen(after.board)).toBe(true)
  })

  it('met à jour la case de prise en passant et les compteurs', () => {
    let position = startingPosition()
    position = applyMove(position, findMove(position, 'e2', 'e4'))
    expect(position.enPassant).toEqual(fromAlgebraic('e3'))
    expect(position.halfmoveClock).toBe(0)

    position = applyMove(position, findMove(position, 'g8', 'f6'))
    expect(position.enPassant).toBe(null)
    expect(position.halfmoveClock).toBe(1)
    expect(position.fullmove).toBe(2)
  })
})

describe('coups spéciaux', () => {
  it('roque : la tour suit le roi et les droits sont perdus', () => {
    const position = fromFEN('r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4')
    const castle = findMove(position, 'e1', 'g1')
    expect(castle.flag).toBe(MoveFlag.CASTLE_KING)

    const after = applyMove(position, castle)
    expect(pieceAt(after, fromAlgebraic('f1')).type).toBe(PieceType.ROOK)
    expect(pieceAt(after, fromAlgebraic('h1'))).toBe(null)
    expect(after.castling.whiteKing).toBe(false)
    expect(after.castling.whiteQueen).toBe(false)
  })

  it('prise en passant : le pion pris disparaît à côté de la case d’arrivée', () => {
    const position = fromFEN('rnbqkbnr/1pp1pppp/p7/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3')
    const capture = findMove(position, 'e5', 'd6')
    expect(capture.flag).toBe(MoveFlag.EN_PASSANT)
    expect(pieceAt(applyMove(position, capture), fromAlgebraic('d5'))).toBe(null)
  })

  it('promotion : un coup par pièce possible', () => {
    const position = fromFEN('4k3/1P6/8/8/8/8/8/4K3 w - - 0 1')
    const promotions = legalMoves(position).filter((move) => toAlgebraic(move.to) === 'b8')
    expect(promotions.map((move) => move.promotion).sort()).toEqual(['b', 'n', 'q', 'r'])
  })

  it('une pièce clouée devant son roi ne peut pas bouger', () => {
    const position = fromFEN('rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4')
    expect(legalMoves(position).filter((move) => toAlgebraic(move.from) === 'c3')).toHaveLength(0)
  })
})
