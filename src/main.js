/**
 * main.js
 * Point d'entrée : construit la page HTML et relie Game, ChessTimer et les vues ensemble.
 */
import './style.css'
import { createBoardView } from './ui/boardView.js'
import { createStatusView } from './ui/statusView.js'
import { Game } from './app/game.js'
import { ChessTimer } from './app/timer.js'
import { saveGame, loadGame } from './persistence/storage.js'

const MINUTES_PER_PLAYER = 10

export function mountChessUi(game) {
    const app = document.querySelector('#app')
    app.className = 'min-h-screen bg-[repeating-linear-gradient(8deg,#32160a_0_8px,#3d1b0d_8px_16px)] p-4 font-serif text-[#fff0cf] md:p-6'
    app.innerHTML = `
    <header class="flex w-full items-center justify-between">
      <h1 class="text-4xl font-bold">echecs<span class="text-[#d98a3e]">.js</span></h1>
      <button id="menu-button" class="ml-auto rounded-md border border-[#d8974a] bg-[#55240f] px-3 py-1 text-2xl">☰</button>
    </header>
    <nav id="menu" class="absolute right-4 top-20 z-10 grid gap-1 border border-[#d8974a] bg-[#47200e] p-2 md:right-6" hidden>
      <button id="new-game" class="text-left text-[#fff0cf]">Nouvelle partie</button>
      <button id="flip-board" class="text-left text-[#fff0cf]">Retourner le plateau</button>
      <button id="reset-timer" class="text-left text-[#fff0cf]">Réinitialiser le timer</button>
      <button id="pause-timer" class="text-left text-[#fff0cf]">Mettre en pause</button>
      <button id="save-game" class="text-left text-[#fff0cf]">Sauvegarder la partie</button>
      <button id="load-game" class="text-left text-[#fff0cf]">Charger la partie</button>
    </nav>
    <main class="mx-auto mt-8 grid max-w-6xl grid-cols-1 items-center justify-items-center gap-5 md:mt-10 md:grid-cols-[auto_auto_auto] md:gap-10">
      <div id="black-player"></div>
      <div class="bg-linear-to-br from-[#c77e3b] to-[#4a210c] p-3 shadow-2xl">
        <div id="board"></div>
      </div>
      <div id="white-player"></div>
    </main>
  `

    let timer = null
    let unsubscribeTimer = null

    const board = createBoardView((move) => {
        const playerWhoMoved = game.position.sideToMove
        const moveWasPlayed = game.play(move)
        if (moveWasPlayed) {
            timer.pressButton(playerWhoMoved)
        }
    })

    // le bouton "Rejouer" du gros message de fin de partie fait la même chose que
    // le bouton "Nouvelle partie" du menu : startNewGame(), définie plus bas
    const status = createStatusView(startNewGame)

    const boardWrapper = document.querySelector('#board')
    boardWrapper.append(board.element)
    boardWrapper.parentElement.append(status.messageElement)
    document.querySelector('#black-player').append(status.blackElement)
    document.querySelector('#white-player').append(status.whiteElement)

    // le gros message de fin de partie est posé à la racine de la page (pas dans le plateau),
    // car il est en position "fixed" : il se centre tout seul par rapport à l'écran entier
    app.append(status.overlayElement)

    const pauseButton = document.querySelector('#pause-timer')

    function renderBoard() {
        board.render(game.position, game.legalMoves())
    }

    function renderStatus() {
        status.render(game, timer)
        pauseButton.textContent = timer.isRunning ? 'Mettre en pause' : 'Reprendre le chrono'
    }

    function renderEverything() {
        renderBoard()
        renderStatus()

        // la partie vient peut-être de se terminer (mat, pat ou nulle) : on arrête la pendule,
        // peu importe le résultat
        if (game.isOver()) {
            timer.stop()
        }
    }

    // Crée un nouveau chronomètre à 10 minutes et le démarre.
    // On désabonne l'ancien chronomètre avant d'en créer un nouveau.
    function startNewTimer() {
        if (unsubscribeTimer !== null) {
            unsubscribeTimer()
        }
        timer = new ChessTimer(MINUTES_PER_PLAYER)
        unsubscribeTimer = timer.subscribe(renderStatus)
        timer.start()
    }

    // Remet la partie et le chrono à zéro. Utilisé par le bouton "Nouvelle partie" du menu
    // ET par le bouton "Rejouer" qui apparaît sur le gros message de fin de partie.
    function startNewGame() {
        game.reset()
        startNewTimer()
    }

    const menu = document.querySelector('#menu')
    document.querySelector('#menu-button').onclick = () => { menu.hidden = !menu.hidden }
    document.querySelector('#new-game').onclick = startNewGame
    document.querySelector('#flip-board').onclick = board.flip
    document.querySelector('#reset-timer').onclick = startNewTimer

    pauseButton.onclick = () => {
        if (timer.isRunning) {
            timer.stop()
        } else {
            timer.start()
        }
    }

    document.querySelector('#save-game').onclick = () => {
        saveGame(game)
        menu.hidden = true
    }

    // la partie est rejouée coup par coup, puis on repart avec une pendule neuve
    document.querySelector('#load-game').onclick = () => {
        if (!loadGame(game)) return
        startNewTimer()
        // la pendule démarre toujours avec les blancs : si c'est aux noirs de jouer, on leur passe la main
        if (game.position.sideToMove !== timer.getActiveColor()) {
            timer.pressButton(timer.getActiveColor())
        }
        renderEverything()
        menu.hidden = true
    }

    game.subscribe(renderEverything)
    startNewTimer()
    renderEverything()
}

// Création de la partie et affichage dans le navigateur
mountChessUi(new Game())