/**
 * moveGenerator.js
 * Produit les coups légaux du camp au trait, à partir des coups de chaque pièce
 * Auteur : Samuel Theytaz
 * Date : 27.08.2026
 */
import { MOVE_GENERATORS } from './movement/index.js'
import { createSquare, isInside } from './square.js'
import { createMove, MoveFlag } from './move.js'
import { applyMove } from './position.js'
import { Color, opposite } from './color.js'
import { PieceType } from './piece.js'

// Rassemble tous les coups pseudo-légaux du camp au trait, le roque compris aussi
function pseudoLegalMoves(position) {
  const moves = []
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = position.board[rank][file]
      if (piece && piece.color === position.sideToMove) {
        moves.push(...MOVE_GENERATORS[piece.type](position, createSquare(file, rank)))
      }
    }
  }
  moves.push(...castlingMoves(position))
  return moves
}

// Coups de roque du camp au trait
// placé ici prcq'il faut savoir si des cases sont attaquées, ce que king.js ne peut pas voir
function castlingMoves(position) {
  const color = position.sideToMove
  const enemy = opposite(color)
  const rank = color === Color.WHITE ? 0 : 7
  const rights = position.castling
  const kingFrom = createSquare(4, rank)
  const moves = []

  // pas de roque si le roi est déjà en échec
  if (isSquareAttacked(position, kingFrom, enemy)) return moves

  const empty = (file) => position.board[rank][file] === null
  const safe = (file) => !isSquareAttacked(position, createSquare(file, rank), enemy)

  // petit roque : le roi ne doit ni traverser ni finir sur une case attaquée
  const kingSide = color === Color.WHITE ? rights.whiteKing : rights.blackKing
  if (kingSide && empty(5) && empty(6) && safe(5) && safe(6)) {
    moves.push(createMove(kingFrom, createSquare(6, rank), { flag: MoveFlag.CASTLE_KING }))
  }

  // grand roque : la case b doit juste être vide, c et d doivent aussi être sûres
  const queenSide = color === Color.WHITE ? rights.whiteQueen : rights.blackQueen
  if (queenSide && empty(1) && empty(2) && empty(3) && safe(2) && safe(3)) {
    moves.push(createMove(kingFrom, createSquare(2, rank), { flag: MoveFlag.CASTLE_QUEEN }))
  }

  return moves
}

function at(position, file, rank) {
  if (!isInside(file, rank)) return null
  return position.board[rank][file]
}

// Indique si la couleur "by" attaque la case donnée
// on part de la case et on teste chaque type d'attaque
export function isSquareAttacked(position, square, by) {
  const { file, rank } = square

  const knightOffsets = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
  for (const [df, dr] of knightOffsets) {
    const p = at(position, file + df, rank + dr)
    if (p && p.color === by && p.type === PieceType.KNIGHT) return true
  }

  const kingOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  for (const [df, dr] of kingOffsets) {
    const p = at(position, file + df, rank + dr)
    if (p && p.color === by && p.type === PieceType.KING) return true
  }

  // un pion attaque en diagonale vers l'avant, donc l'attaquant se trouve une rangée derrière la case
  const pawnDir = by === Color.WHITE ? 1 : -1
  for (const df of [-1, 1]) {
    const p = at(position, file + df, rank - pawnDir)
    if (p && p.color === by && p.type === PieceType.PAWN) return true
  }

  if (rayHits(position, file, rank, [[1, 1], [1, -1], [-1, 1], [-1, -1]], by, [PieceType.BISHOP, PieceType.QUEEN])) return true
  if (rayHits(position, file, rank, [[1, 0], [-1, 0], [0, 1], [0, -1]], by, [PieceType.ROOK, PieceType.QUEEN])) return true

  return false
}

// Suit une ligne dans chaque direction jusqu'à la première pièce, qui ne menace que si son type correspond
function rayHits(position, file, rank, directions, by, types) {
  for (const [df, dr] of directions) {
    let f = file + df
    let r = rank + dr
    while (isInside(f, r)) {
      const p = position.board[r][f]
      if (p) {
        if (p.color === by && types.includes(p.type)) return true
        break
      }
      f += df
      r += dr
    }
  }
  return false
}

// Retrouve la case du roi d'une couleur, nécessaire pour tester l'échec
function kingSquare(position, color) {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const p = position.board[rank][file]
      if (p && p.type === PieceType.KING && p.color === color) return createSquare(file, rank)
    }
  }
  return null
}

// Garde seulement les coups qui ne laissent pas le en échec
// chaque coup est appliqué et on vérifie que le roi est pas attaqué dans la position qu'on obtient
export function legalMoves(position) {
  const me = position.sideToMove
  return pseudoLegalMoves(position).filter((move) => {
    const after = applyMove(position, move)
    return !isSquareAttacked(after, kingSquare(after, me), opposite(me))
  })
}

// Teste si un coup précis est légal en comparant ses cases à celles des coups légaux
export function isLegal(position, move) {
  return legalMoves(position).some(
    (m) => m.from.file === move.from.file && m.from.rank === move.from.rank
        && m.to.file === move.to.file && m.to.rank === move.to.rank,
  )
}
