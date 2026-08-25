/**
 * color.js
 * Les deux couleurs de pièces, et le passage de l'une à l'autre
 * Auteur : Samuel Theytaz
 * Date création : mardi 18.08.2026
 */

export const Color = Object.freeze({ WHITE: 'white', BLACK: 'black' })

// Renvoie le camp adverse, utile après chaque coup et pour reconnaître une pièce ennemie
export function opposite(color) {
  return color === Color.WHITE ? Color.BLACK : Color.WHITE
}

