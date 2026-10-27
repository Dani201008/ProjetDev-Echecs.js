/**
 * notation.test.js : tests de la notation FEN, SAN et PGN.
 */
import { describe, it, expect } from 'vitest'
import { startingPosition, applyMove } from '../src/domain/position.js'
import { legalMoves } from '../src/domain/moveGenerator.js'
import { fromAlgebraic, toAlgebraic } from '../src/domain/square.js'
import { toFEN, fromFEN } from '../src/domain/notation/fen.js'
import { toSAN, fromSAN } from '../src/domain/notation/san.js'
import { toPGN, fromPGN } from '../src/domain/notation/pgn.js'

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// Joue une suite de coups écrits en SAN et renvoie la position obtenue et les coups
function play(position, sans) {
  const moves = []
  for (const san of sans) {
    const move = fromSAN(position, san)
    moves.push(move)
    position = applyMove(position, move)
  }
  return { position, moves }
}

// Retrouve le coup légal qui va de from à to, pour tester toSAN
function moveFrom(position, from, to) {
  return legalMoves(position).find((move) => toAlgebraic(move.from) === from && toAlgebraic(move.to) === to)
}

function sanOf(position, from, to) {
  return toSAN(position, moveFrom(position, from, to))
}

describe('fen', () => {
  it('écrit la position de départ', () => {
    expect(toFEN(startingPosition())).toBe(START)
  })

  it('note la case de prise en passant après un double pas', () => {
    const { position } = play(startingPosition(), ['e4'])
    expect(toFEN(position)).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
  })

  it('relit exactement ce qu’il a écrit', () => {
    const fen = 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
    expect(toFEN(fromFEN(fen))).toBe(fen)
    expect(fromFEN(START)).toEqual(startingPosition())
  })

  it('rend une position figée', () => {
    expect(Object.isFrozen(fromFEN(START).board[0])).toBe(true)
  })

  it('refuse un FEN incomplet', () => {
    expect(() => fromFEN('8/8/8 w - - 0 1')).toThrow()
  })
})

describe('san', () => {
  it('écrit les coups simples', () => {
    const start = startingPosition()
    expect(sanOf(start, 'e2', 'e4')).toBe('e4')
    expect(sanOf(start, 'g1', 'f3')).toBe('Nf3')
  })

  it('écrit une prise de pion avec sa colonne de départ', () => {
    const { position } = play(startingPosition(), ['e4', 'd5'])
    expect(sanOf(position, 'e4', 'd5')).toBe('exd5')
  })

  it('précise la pièce quand deux pièces pareilles visent la même case', () => {
    const position = fromFEN('rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 2 3')
    expect(sanOf(position, 'b1', 'd2')).toBe('Nbd2')
    expect(sanOf(position, 'f3', 'd2')).toBe('Nfd2')
  })

  it('écrit le roque, la promotion et la prise en passant', () => {
    const castling = fromFEN('r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4')
    expect(toSAN(castling, fromSAN(castling, 'O-O'))).toBe('O-O')

    const promotion = fromFEN('4k3/1P6/8/8/8/8/8/4K3 w - - 0 1')
    expect(toSAN(promotion, fromSAN(promotion, 'b8=Q'))).toBe('b8=Q+')

    const enPassant = fromFEN('rnbqkbnr/1pp1pppp/p7/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3')
    expect(toSAN(enPassant, moveFrom(enPassant, 'e5', 'd6'))).toBe('exd6')
  })

  it('ajoute # quand le coup est mat', () => {
    const { position } = play(startingPosition(), ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6'])
    expect(sanOf(position, 'h5', 'f7')).toBe('Qxf7#')
  })

  it('relit un coup SAN, et renvoie null s’il est impossible', () => {
    const start = startingPosition()
    const move = fromSAN(start, 'Nf3')
    expect(move.from).toEqual(fromAlgebraic('g1'))
    expect(move.to).toEqual(fromAlgebraic('f3'))
    expect(fromSAN(start, 'Ke2')).toBe(null)
  })
})

describe('pgn', () => {
  it('écrit une partie complète avec son résultat', () => {
    const { moves } = play(startingPosition(), ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#'])
    const pgn = toPGN(startingPosition(), moves)
    expect(pgn).toContain('[Result "1-0"]')
    expect(pgn).toContain('1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0')
  })

  it('relit les coups qu’il a écrits', () => {
    const { moves } = play(startingPosition(), ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'])
    const reread = fromPGN(toPGN(startingPosition(), moves))
    expect(reread.moves).toEqual(moves)
  })

  it('garde la position de départ quand la partie ne commence pas au début', () => {
    const start = fromFEN('4k3/1P6/8/8/8/8/8/4K3 w - - 0 1')
    const pgn = toPGN(start, [fromSAN(start, 'b8=Q')])
    expect(pgn).toContain('[FEN "4k3/1P6/8/8/8/8/8/4K3 w - - 0 1"]')
    expect(toFEN(fromPGN(pgn).start)).toBe('4k3/1P6/8/8/8/8/8/4K3 w - - 0 1')
  })

  it('ignore les commentaires et refuse un coup impossible', () => {
    expect(fromPGN('1. e4 {bon début} e5 2. Nf3 *').moves).toHaveLength(3)
    expect(() => fromPGN('1. e4 e4')).toThrow()
  })
})
