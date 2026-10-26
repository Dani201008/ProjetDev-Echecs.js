/**
 * rules.js
 * Détermine l'état d'une partie : échec, mat, pat et parties nulles.
 *
 * Ce fichier ne déplace aucune pièce lui-même : il s'appuie sur
 * moveGenerator.js pour connaître les attaques et les coups légaux.
 *
 *Auteur : Timmy Marendaz
 *Date : 01.09.2026
 */

import { Color, opposite } from './color.js'
import { PieceType } from './piece.js'
import { createSquare } from './square.js'
import { isSquareAttacked, legalMoves } from './moveGenerator.js'

/**
 * Valeurs retournées par getGameStatus().
 * Elles évitent d'utiliser des chaînes de caractères dispersées dans le projet.
 */
export const GameStatus = Object.freeze({
    ONGOING: 'ongoing',
    CHECK: 'check',
    CHECKMATE: 'checkmate',
    STALEMATE: 'stalemate',
    DRAW_INSUFFICIENT_MATERIAL: 'draw_insufficient_material',
    DRAW_FIFTY_MOVE: 'draw_fifty_move',
    DRAW_THREEFOLD_REPETITION: 'draw_threefold_repetition',
})

/**
 * Indique si le roi d'une couleur est en échec.
 * Par défaut, on vérifie le camp qui doit jouer.
 */
export function isInCheck(position, color = position.sideToMove) {
    const king = findKing(position, color)

    if (!king) {
        throw new Error(`Roi introuvable pour la couleur : ${color}`)
    }

    return isSquareAttacked(position, king, opposite(color))
}

/**
 * Échec et mat : le joueur au trait est en échec et ne possède
 * aucun coup légal pour s'en sortir.
 */
export function isCheckmate(position) {
    return isInCheck(position) && legalMoves(position).length === 0
}

/**
 * Pat : le joueur au trait n'est pas en échec, mais ne possède
 * aucun coup légal.
 */
export function isStalemate(position) {
    return !isInCheck(position) && legalMoves(position).length === 0
}

/**
 * Nulle par matériel insuffisant.
 *
 * Cas reconnus :
 * - roi contre roi ;
 * - roi + fou contre roi ;
 * - roi + cavalier contre roi ;
 * - uniquement des rois et des fous placés sur la même couleur de case.
 */
export function isInsufficientMaterial(position) {
    const minorPieces = []

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const piece = position.board[rank][file]

            if (!piece || piece.type === PieceType.KING) continue

            // Un pion, une tour ou une dame permet encore une possibilité de mat.
            if (
                piece.type === PieceType.PAWN
                || piece.type === PieceType.ROOK
                || piece.type === PieceType.QUEEN
            ) {
                return false
            }

            minorPieces.push({ piece, file, rank })
        }
    }

    // Roi contre roi, ou roi + une seule pièce mineure contre roi.
    if (minorPieces.length <= 1) return true

    // Avec plusieurs pièces mineures, la nulle automatique n'est certaine
    // ici que si ce sont uniquement des fous sur la même couleur de case.
    const onlyBishops = minorPieces.every(({ piece }) => piece.type === PieceType.BISHOP)
    if (!onlyBishops) return false

    const firstSquareColor = squareColor(minorPieces[0].file, minorPieces[0].rank)
    return minorPieces.every(
        ({ file, rank }) => squareColor(file, rank) === firstSquareColor,
    )
}

/**
 * Règle des 50 coups : 100 demi-coups sans déplacement de pion
 * et sans capture.
 *
 * halfmoveClock fait déjà partie de Position, donc aucune autre donnée
 * n'est nécessaire pour cette règle.
 */
export function isFiftyMoveDraw(position) {
    return position.halfmoveClock >= 100
}

/**
 * Nulle par triple répétition.
 *
 * previousPositions contient les positions précédentes de la partie,
 * sans inclure la position actuelle. Une position est considérée identique
 * si le plateau, le joueur au trait, les droits de roque et la case de prise
 * en passant sont identiques.
 */
export function isThreefoldRepetition(position, previousPositions = []) {
    const currentKey = repetitionKey(position)
    let occurrences = 1 // la position actuelle compte comme une occurrence

    for (const previousPosition of previousPositions) {
        if (repetitionKey(previousPosition) === currentKey) {
            occurrences++
        }

        if (occurrences >= 3) return true
    }

    return false
}

/**
 * Indique simplement si la partie est nulle, quelle qu'en soit la raison.
 */
export function isDraw(position, previousPositions = []) {
    return isStalemate(position)
        || isInsufficientMaterial(position)
        || isFiftyMoveDraw(position)
        || isThreefoldRepetition(position, previousPositions)
}

/**
 * Point d'entrée principal pour connaître l'état complet de la partie.
 *
 * L'ordre est volontaire : mat et pat sont vérifiés avant les autres nulles,
 * puis on indique simplement "échec" si la partie continue.
 */
export function getGameStatus(position, previousPositions = []) {
    const inCheck = isInCheck(position)
    const moves = legalMoves(position)

    if (moves.length === 0) {
        return inCheck ? GameStatus.CHECKMATE : GameStatus.STALEMATE
    }

    if (isInsufficientMaterial(position)) {
        return GameStatus.DRAW_INSUFFICIENT_MATERIAL
    }

    if (isFiftyMoveDraw(position)) {
        return GameStatus.DRAW_FIFTY_MOVE
    }

    if (isThreefoldRepetition(position, previousPositions)) {
        return GameStatus.DRAW_THREEFOLD_REPETITION
    }

    return inCheck ? GameStatus.CHECK : GameStatus.ONGOING
}

/**
 * Cherche la case du roi d'une couleur.
 */
function findKing(position, color) {
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const piece = position.board[rank][file]

            if (piece && piece.type === PieceType.KING && piece.color === color) {
                return createSquare(file, rank)
            }
        }
    }

    return null
}

/**
 * Retourne 0 ou 1 selon la couleur de la case.
 * Deux cases de même valeur ont la même couleur.
 */
function squareColor(file, rank) {
    return (file + rank) % 2
}

/**
 * Crée une représentation stable des éléments qui définissent une position
 * pour la règle de répétition.
 */
function repetitionKey(position) {
    const boardKey = position.board
        .map((row) => row.map(pieceKey).join(''))
        .join('/')

    const castlingKey = [
        position.castling.whiteKing ? 'K' : '',
        position.castling.whiteQueen ? 'Q' : '',
        position.castling.blackKing ? 'k' : '',
        position.castling.blackQueen ? 'q' : '',
    ].join('') || '-'

    const enPassantKey = position.enPassant
        ? `${position.enPassant.file},${position.enPassant.rank}`
        : '-'

    return `${boardKey}|${position.sideToMove}|${castlingKey}|${enPassantKey}`
}

/**
 * Une case vide vaut "--". Pour une pièce, la première lettre indique
 * la couleur et la seconde son type : wk, bq, wn, etc.
 */
function pieceKey(piece) {
    if (!piece) return '--'
    const color = piece.color === Color.WHITE ? 'w' : 'b'
    return `${color}${piece.type}`
}
