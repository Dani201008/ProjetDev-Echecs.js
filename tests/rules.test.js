/**
 * rules.test.js
 * Tests unitaires des règles de fin de partie.
 */

import { describe, expect, it } from 'vitest'

import { Color } from '../src/domain/color.js'
import { createPiece, PieceType } from '../src/domain/piece.js'
import { fromAlgebraic } from '../src/domain/square.js'

import {
    GameStatus,
    getGameStatus,
    isCheckmate,
    isDraw,
    isFiftyMoveDraw,
    isInCheck,
    isInsufficientMaterial,
    isStalemate,
    isThreefoldRepetition,
} from '../src/domain/rules.js'


/**
 * Crée une position d'échecs simple pour les tests.
 */
function createTestPosition({
                                pieces,
                                sideToMove = Color.WHITE,
                                halfmoveClock = 0,
                            }) {
    const board = Array.from(
        { length: 8 },
        () => Array(8).fill(null)
    )

    for (const [squareName, piece] of Object.entries(pieces)) {
        const square = fromAlgebraic(squareName)

        board[square.rank][square.file] = piece
    }

    return {
        board,
        sideToMove,

        castling: {
            whiteKing: false,
            whiteQueen: false,
            blackKing: false,
            blackQueen: false,
        },

        enPassant: null,

        halfmoveClock,
        fullmove: 1,
    }
}


/**
 * Raccourcis pour créer les pièces.
 */
function white(type) {
    return createPiece(type, Color.WHITE)
}


function black(type) {
    return createPiece(type, Color.BLACK)
}



describe('Règles des échecs', () => {

    it('détecte que le roi blanc est en échec', () => {

        // La tour noire attaque directement le roi blanc.
        //
        // 8  . . . . ♜ . . ♚
        // 7  . . . . . . . .
        // 6  . . . . . . . .
        // 5  . . . . . . . .
        // 4  . . . . . . . .
        // 3  . . . . . . . .
        // 2  . . . . . . . .
        // 1  . . . . ♔ . . .

        const position = createTestPosition({
            pieces: {
                e1: white(PieceType.KING),
                a8: black(PieceType.KING),
                e8: black(PieceType.ROOK),
            },
        })

        expect(isInCheck(position)).toBe(true)
    })



    it("détecte qu'un roi n'est pas en échec", () => {

        const position = createTestPosition({
            pieces: {
                e1: white(PieceType.KING),
                e8: black(PieceType.KING),
            },
        })

        expect(isInCheck(position)).toBe(false)
    })



    it('détecte un échec et mat', () => {

        /*
            Position :

            Roi blanc : h1
            Dame noire : g2
            Roi noir : f3

            La dame met le roi blanc en échec.

            Le roi blanc ne peut :
            - ni capturer la dame,
            - ni aller en g1,
            - ni aller en h2.

            Il est donc mat.
        */

        const position = createTestPosition({
            pieces: {
                h1: white(PieceType.KING),

                f3: black(PieceType.KING),
                g2: black(PieceType.QUEEN),
            },
        })

        expect(isCheckmate(position)).toBe(true)
    })



    it('détecte un pat', () => {

        /*
            Roi blanc : h1
            Roi noir : f2
            Dame noire : g3

            Le roi blanc n'est PAS en échec.

            Mais il ne peut effectuer aucun coup légal.

            C'est donc un PAT.
        */

        const position = createTestPosition({
            pieces: {
                h1: white(PieceType.KING),

                f2: black(PieceType.KING),
                g3: black(PieceType.QUEEN),
            },
        })

        expect(isStalemate(position)).toBe(true)
    })



    it('détecte une nulle par matériel insuffisant', () => {

        /*
            Roi contre roi.

            Aucun joueur ne possède assez de matériel
            pour effectuer un échec et mat.
        */

        const position = createTestPosition({
            pieces: {
                e1: white(PieceType.KING),
                e8: black(PieceType.KING),
            },
        })

        expect(isInsufficientMaterial(position)).toBe(true)
    })



    it('détecte la règle des 50 coups', () => {

        /*
            50 coups complets
            =
            100 demi-coups.

            Aucun pion déplacé et aucune capture.
        */

        const position = createTestPosition({
            pieces: {
                e1: white(PieceType.KING),
                a1: white(PieceType.ROOK),

                e8: black(PieceType.KING),
            },

            halfmoveClock: 100,
        })

        expect(isFiftyMoveDraw(position)).toBe(true)
    })



    it('détecte une triple répétition', () => {

        const position = createTestPosition({
            pieces: {
                e1: white(PieceType.KING),
                a1: white(PieceType.ROOK),

                e8: black(PieceType.KING),
            },
        })


        /*
            La position actuelle existe déjà
            deux fois dans l'historique.

            Historique : 2
            Position actuelle : 1

            Total : 3
        */

        const previousPositions = [
            position,
            position,
        ]


        expect(
            isThreefoldRepetition(
                position,
                previousPositions
            )
        ).toBe(true)
    })



    it("détecte qu'une position est une nulle", () => {

        // Roi contre roi = matériel insuffisant.

        const position = createTestPosition({
            pieces: {
                e1: white(PieceType.KING),
                e8: black(PieceType.KING),
            },
        })

        expect(isDraw(position)).toBe(true)
    })



    it("retourne CHECK lorsque le roi est en échec", () => {

        const position = createTestPosition({
            pieces: {
                e1: white(PieceType.KING),

                a8: black(PieceType.KING),
                e8: black(PieceType.ROOK),
            },
        })

        expect(
            getGameStatus(position)
        ).toBe(GameStatus.CHECK)
    })



    it('retourne CHECKMATE lorsque le roi est mat', () => {

        const position = createTestPosition({
            pieces: {
                h1: white(PieceType.KING),

                f3: black(PieceType.KING),
                g2: black(PieceType.QUEEN),
            },
        })

        expect(
            getGameStatus(position)
        ).toBe(GameStatus.CHECKMATE)
    })



    it('retourne STALEMATE lors d’un pat', () => {

        const position = createTestPosition({
            pieces: {
                h1: white(PieceType.KING),

                f2: black(PieceType.KING),
                g3: black(PieceType.QUEEN),
            },
        })

        expect(
            getGameStatus(position)
        ).toBe(GameStatus.STALEMATE)
    })

})