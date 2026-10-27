/**
 * perft.test.js : validation de la génération des coups.
 * On compte toutes les suites de coups possibles jusqu'à une profondeur donnée et on compare
 * aux valeurs de référence : s'il manque un seul coup ou s'il y en a un de trop, le total change.
 */
import { describe, it, expect } from 'vitest'
import { startingPosition, applyMove } from '../src/domain/position.js'
import { legalMoves } from '../src/domain/moveGenerator.js'
import { fromFEN } from '../src/domain/notation/fen.js'

function perft(position, depth) {
  if (depth === 0) return 1
  let total = 0
  for (const move of legalMoves(position)) {
    total += perft(applyMove(position, move), depth - 1)
  }
  return total
}

describe('perft', () => {
  it('depuis la position de départ', () => {
    const start = startingPosition()
    expect(perft(start, 1)).toBe(20)
    expect(perft(start, 2)).toBe(400)
    expect(perft(start, 3)).toBe(8902)
    expect(perft(start, 4)).toBe(197281)
  })

  // position de référence "Kiwipete" : beaucoup de roques, de prises en passant et de clouages
  it('depuis la position Kiwipete', () => {
    const kiwipete = fromFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1')
    expect(perft(kiwipete, 1)).toBe(48)
    expect(perft(kiwipete, 2)).toBe(2039)
    expect(perft(kiwipete, 3)).toBe(97862)
  })
})
