/**
 * statusView.js
 * Affiche les pièces prises, la pendule de chaque joueur (via app/timer.js, fait par un camarade)
 * et l'état de la partie : échec, mat, pat, nulle... (via domain/rules.js, fait par Timmy).
 */
import { pieceSymbol } from './pieces.js'
import { Color } from '../domain/color.js'
import { GameStatus } from '../domain/rules.js'
import { formatTime } from '../app/timer.js'

// Transforme l'état renvoyé par rules.js en phrase à afficher
function statusMessage(game) {
    const status = game.status()
    const sideToMove = game.position.sideToMove
    const sideName = sideToMove === Color.WHITE ? 'Blancs' : 'Noirs'

    if (status === GameStatus.CHECKMATE) return `Échec et mat, les ${sideName} ont perdu`
    if (status === GameStatus.STALEMATE) return 'Pat, partie nulle'
    if (status === GameStatus.DRAW_INSUFFICIENT_MATERIAL) return 'Partie nulle : matériel insuffisant'
    if (status === GameStatus.DRAW_FIFTY_MOVE) return 'Partie nulle : règle des 50 coups'
    if (status === GameStatus.DRAW_THREEFOLD_REPETITION) return 'Partie nulle : triple répétition'
    if (status === GameStatus.CHECK) return `${sideName} sont en échec`
    return `Trait aux ${sideName}`
}

// Construit le petit HTML d'un joueur : ses pièces prises, son nom et sa pendule
function panelHtml(playerName, capturedPieces, remainingTime, isActive) {
    let capturedSymbols = ''
    for (const piece of capturedPieces) {
        capturedSymbols += pieceSymbol(piece)
    }

    // le joueur dont c'est le tour a un petit contour doré autour de sa pendule
    let clockBoxClass = 'rounded-lg border border-[#d8974a] bg-[#48200d] p-4'
    if (isActive) {
        clockBoxClass += ' outline outline-2 outline-[#f5d153]'
    }

    return `
    <section class="w-44 text-center">
      <div class="mb-3 min-h-9 text-3xl text-[#f2d5a0]">${capturedSymbols}</div>
      <div class="${clockBoxClass}">
        <span class="block text-[#e4bd7d]">${playerName}</span>
        <strong class="font-sans text-3xl">${formatTime(remainingTime)}</strong>
      </div>
    </section>
  `
}

export function createStatusView() {
    const blackElement = document.createElement('div')
    const whiteElement = document.createElement('div')
    const messageElement = document.createElement('p')
    messageElement.className = 'text-center text-[#f5d68f]'

    return {
        blackElement,
        whiteElement,
        messageElement,
        render(game, timer) {
            const activeColor = timer.getActiveColor()

            blackElement.innerHTML = panelHtml(
                'Noirs',
                game.captured.black,
                timer.getRemainingTime(Color.BLACK),
                activeColor === Color.BLACK,
            )
            whiteElement.innerHTML = panelHtml(
                'Blancs',
                game.captured.white,
                timer.getRemainingTime(Color.WHITE),
                activeColor === Color.WHITE,
            )

            messageElement.textContent = statusMessage(game)
        },
    }
}