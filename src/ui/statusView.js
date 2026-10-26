/**
 * statusView.js
 * Affiche les pièces prises, la pendule de chaque joueur (app/timer.js) et l'état de la
 * partie (domain/rules.js) : échec, mat, pat, nulle...
 *
 * Le message de partie s'affiche à deux endroits : messageElement (petit texte discret, tout
 * le temps) et overlayElement (gros message plein écran, seulement si la partie est finie,
 * avec un bouton "Rejouer" dont l'action est décidée par main.js via onReplay).
 */
import { pieceSymbol } from './pieces.js'
import { Color } from '../domain/color.js'
import { GameStatus } from '../domain/rules.js'
import { formatTime } from '../app/timer.js'

// Transforme l'état renvoyé par rules.js en phrase à afficher
function statusMessage(game, status) {
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

// Construit le petit HTML d'un joueur : ses pièces prises (6 par ligne), son nom et sa pendule
function panelHtml(playerName, capturedPieces, remainingTime, isActive) {
    const capturedSymbols = capturedPieces.map((piece) => `<span>${pieceSymbol(piece)}</span>`).join('')

    const activeOutline = isActive ? ' outline outline-2 outline-[#f5d153]' : ''
    const clockBoxClass = `rounded-lg border border-[#d8974a] bg-[#48200d] p-4${activeOutline}`

    return `
    <section class="w-44 text-center">
      <div class="mb-3 grid min-h-9 grid-cols-6 justify-center gap-0.5 text-2xl text-[#f2d5a0]">${capturedSymbols}</div>
      <div class="${clockBoxClass}">
        <span class="block text-[#e4bd7d]">${playerName}</span>
        <strong class="font-sans text-3xl">${formatTime(remainingTime)}</strong>
      </div>
    </section>
  `
}

export function createStatusView(onReplay) {
    const blackElement = document.createElement('div')
    const whiteElement = document.createElement('div')

    const messageElement = document.createElement('p')
    messageElement.className = 'text-center text-[#f5d68f]'

    // Le gros message de fin de partie. "fixed" + "inset-0" : positionné par rapport à l'écran
    // entier, donc toujours bien centré au milieu peu importe où on le pose dans la page.
    const overlayElement = document.createElement('div')
    overlayElement.className = 'fixed inset-0 z-50 hidden flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center text-3xl font-bold text-[#fff0cf] md:text-5xl'

    const overlayMessage = document.createElement('p')

    // Ce bouton apparaît quel que soit le résultat (mat, pat ou nulle)
    const replayButton = document.createElement('button')
    replayButton.textContent = 'Rejouer'
    replayButton.className = 'rounded-lg border border-[#d8974a] bg-[#6e3618] px-6 py-3 text-xl font-normal text-[#fff0cf] hover:brightness-110 md:text-2xl'
    replayButton.onclick = () => onReplay()

    overlayElement.append(overlayMessage, replayButton)

    return {
        blackElement,
        whiteElement,
        messageElement,
        overlayElement,
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

            const status = game.status()
            const message = statusMessage(game, status)
            messageElement.textContent = message

            if (game.isOver()) {
                overlayMessage.textContent = message
                overlayElement.classList.remove('hidden')
            } else {
                overlayElement.classList.add('hidden')
            }
        },
    }
}