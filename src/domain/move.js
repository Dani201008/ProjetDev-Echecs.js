/**
 * move.js
 * Représente un coup : cases de départ et d'arrivée, un drapeau et une promotion éventuelle
 * Auteur : Samuel Theytaz
 * Date création : mardi 18.08.2026
 */

// le drapeau retient la nature du coup pour ne pas la redeviner au moment de l'appliquer
export const MoveFlag = Object.freeze({
  NORMAL: 'normal',
  CAPTURE: 'capture',
  DOUBLE_PUSH: 'double_push',
  EN_PASSANT: 'en_passant',
  CASTLE_KING: 'castle_king',
  CASTLE_QUEEN: 'castle_queen',
  PROMOTION: 'promotion',
})

// promotion = pièce choisie quand un pion arrive au bout, les valeurs par défaut couvrent un coup simple
export function createMove(from, to, options = {}) {
  return Object.freeze({
    from,
    to,
    promotion: options.promotion ?? null,
    flag: options.flag ?? MoveFlag.NORMAL,
  })
}
