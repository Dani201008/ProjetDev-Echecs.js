/**
 * piece.js
 * Le type et la couleur d'une pièce
 * Auteur : Samuel Theytaz
 * Date création : mardi 18.08.2026
 */

// lettres minuscules comme la notation FEN, pour simplifier la sauvegarde plus tard
export const PieceType = Object.freeze({
  PAWN: 'p', KNIGHT: 'n', BISHOP: 'b', ROOK: 'r', QUEEN: 'q', KING: 'k',
})

// Crée une pièce figée : on ne la modifie jamais, une promotion crée une nouvelle pièce
export function createPiece(type, color) {
  return Object.freeze({ type, color })
}
