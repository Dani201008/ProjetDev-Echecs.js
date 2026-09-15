/**
 * main.js
 * Point d'entrée : construit la page HTML et relie Game, ChessTimer et les vues ensemble.
 */
import './style.css'
import { createBoardView } from './ui/boardView.js'
import { createStatusView } from './ui/statusView.js'
import { Game } from './app/game.js'
import { ChessTimer } from './app/timer.js'

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
    </nav>
    <main class="mx-auto mt-8 grid max-w-6xl grid-cols-1 items-center justify-items-center gap-5 md:mt-10 md:grid-cols-[auto_auto_auto] md:gap-10">
      <div id="black-player"></div>
      <div class="bg-linear-to-br from-[#c77e3b] to-[#4a210c] p-3 shadow-2xl">
        <div id="board"></div>
      </div>
      <div id="white-player"></div>
    </main>
  `

    // le chronomètre est recréé à chaque nouvelle partie ou reset, donc on le garde dans une
    // variable "let" plutôt que dans une constante
    let timer = null
    let unsubscribeTimer = null

    const board = createBoardView((move) => {
        // on note qui joue AVANT le coup, car après game.play() le trait change de camp
        const playerWhoMoved = game.position.sideToMove
        const moveWasPlayed = game.play(move)
        if (moveWasPlayed) {
            timer.pressButton(playerWhoMoved)
        }
    })
    const status = createStatusView()

    const boardWrapper = document.querySelector('#board')
    boardWrapper.append(board.element)
    boardWrapper.parentElement.append(status.messageElement)
    document.querySelector('#black-player').append(status.blackElement)
    document.querySelector('#white-player').append(status.whiteElement)

    const pauseButton = document.querySelector('#pause-timer')

    // Redessine le plateau. Ne doit être appelé que quand la position a changé
    // (un coup joué, une nouvelle partie), jamais à chaque tic du chrono : sinon
    // les 64 cases sont détruites et recréées 10 fois par seconde, ce qui fait
    // clignoter le plateau et rend les clics difficiles à capter.
    function renderBoard() {
        board.render(game.position, game.legalMoves())
    }

    // Met à jour la pendule et le message de partie. Ça, on peut l'appeler
    // aussi souvent qu'on veut : ce sont juste deux petites div, pas tout le plateau.
    function renderStatus() {
        status.render(game, timer)
        pauseButton.textContent = timer.isRunning ? 'Mettre en pause' : 'Reprendre le chrono'
    }

    function renderEverything() {
        renderBoard()
        renderStatus()
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

    const menu = document.querySelector('#menu')
    document.querySelector('#menu-button').onclick = () => { menu.hidden = !menu.hidden }

    document.querySelector('#new-game').onclick = () => {
        game.reset()
        startNewTimer()
    }

    document.querySelector('#flip-board').onclick = () => board.flip()

    document.querySelector('#reset-timer').onclick = () => {
        startNewTimer()
    }

    pauseButton.onclick = () => {
        if (timer.isRunning) {
            timer.stop()
        } else {
            timer.start()
        }
    }

    game.subscribe(renderEverything)
    startNewTimer()
    renderEverything()
}

// Création de la partie et affichage dans le navigateur
mountChessUi(new Game())