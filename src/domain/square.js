/**
 * square.js
 * Une case du plateau (colonne et rangée) et les conversions avec la notation "e4"
 * Auteur : Samuel Theytaz
 * Date création : mardi 18.08.2026
 */

// file = colonne 0 a 7 (0 = a), rank = rangée 0 a 7 (0 = la "1")
export function createSquare(file, rank) {
  return Object.freeze({ file, rank })
}

const FILES = 'abcdefgh'

// Convertit une case en notation, le +1 vient du fait que la notation commence à 1
export function toAlgebraic({ file, rank }) {
  return FILES[file] + (rank + 1)
}

// Convertit une notation "e4" en case
export function fromAlgebraic(text) {
  return createSquare(FILES.indexOf(text[0]), Number(text[1]) - 1)
}

// Vérifie qu'une case reste dans la grille, à appeler après chaque calcul de déplacement
export function isInside(file, rank) {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8
}
