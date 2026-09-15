/**
 * pieces.js
 * Associe chaque pièce à son symbole Unicode pour l'affichage.
 *
 * On utilise directement les lettres 'p', 'n', 'b', 'r', 'q', 'k' et les mots 'white'/'black',
 * parce que ce sont exactement les mêmes valeurs que celles utilisées dans domain/piece.js
 * et domain/color.js.
 */

const SYMBOLS = {
    white: {
        p: '♙',
        n: '♘',
        b: '♗',
        r: '♖',
        q: '♕',
        k: '♔',
    },
    black: {
        p: '♟',
        n: '♞',
        b: '♝',
        r: '♜',
        q: '♛',
        k: '♚',
    },
}

// Renvoie le caractère à afficher pour une pièce { type, color } donnée
export function pieceSymbol(piece) {
    return SYMBOLS[piece.color][piece.type]
}