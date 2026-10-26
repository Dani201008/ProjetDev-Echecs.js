/**
 * boardView.js
 * Dessine le plateau (8x8 cases) et transforme les clics de souris en coups à jouer.
 */
import { pieceSymbol } from './pieces.js'
import { pieceAt } from '../domain/position.js'
import { createSquare } from '../domain/square.js'
import { PieceType } from '../domain/piece.js'
import { Color } from '../domain/color.js'

// Donne l'ordre dans lequel on dessine les lignes et les colonnes.
// Normalement le rang 8 est en haut (vue des blancs). Si le plateau est retourné,
// on inverse simplement les deux listes : le rang 1 se retrouve en haut.
function displayOrder(flipped) {
    const ranks = [7, 6, 5, 4, 3, 2, 1, 0]
    const files = [0, 1, 2, 3, 4, 5, 6, 7]

    if (flipped) {
        return { ranks: ranks.slice().reverse(), files: files.slice().reverse() }
    }
    return { ranks: ranks, files: files }
}

export function createBoardView(onMove) {
    const element = document.createElement('div')
    element.className = 'grid aspect-square w-[min(90vw,620px)] grid-cols-8 grid-rows-[repeat(8,minmax(0,1fr))] border-[5px] border-[#3c1809] shadow-lg md:w-[min(70vw,620px)]'

    let position = null
    let moves = []
    let selected = null // la case sélectionnée : { file, rank }, ou null si rien n'est sélectionné
    let flipped = false

    function movesFromSelected() {
        if (selected === null) return []
        return moves.filter((m) => m.from.file === selected.file && m.from.rank === selected.rank)
    }

    // Cherche un coup légal qui amène la pièce sélectionnée sur la case (file, rank).
    // Renvoie null si ce n'est pas une case où l'on peut aller.
    function moveTo(file, rank) {
        const matchingMoves = movesFromSelected().filter((m) => m.to.file === file && m.to.rank === rank)
        if (matchingMoves.length === 0) return null

        // Si plusieurs coups légaux visent la même case, c'est une promotion :
        // le domaine propose un coup par pièce possible (dame, tour, fou, cavalier).
        // On choisit automatiquement la dame, qui est presque toujours le meilleur choix.
        const queenMove = matchingMoves.find((m) => m.promotion === PieceType.QUEEN || m.promotion === null)
        return queenMove || matchingMoves[0]
    }

    function draw() {
        element.innerHTML = ''
        if (position === null) return

        const order = displayOrder(flipped)

        for (const rank of order.ranks) {
            for (const file of order.files) {
                const square = document.createElement('button')
                const piece = pieceAt(position, createSquare(file, rank))

                // une case sur deux est foncée, comme sur un vrai échiquier
                const backgroundColor = (file + rank) % 2 === 0 ? 'bg-[#8c4b25]' : 'bg-[#e8b979]'

                // la couleur du texte dépend de la couleur de la pièce, pas de la couleur de la case
                let pieceColor = ''
                if (piece) {
                    pieceColor = piece.color === Color.WHITE
                        ? 'text-[#fff3d2] [text-shadow:1px_2px_#7c5939]'
                        : 'text-[#241b18] [text-shadow:1px_2px_#9e785f]'
                }

                square.className = `relative grid h-full min-h-0 w-full min-w-0 place-items-center overflow-hidden border-0 font-serif text-[clamp(1.8rem,6vw,4.5rem)] leading-none transition hover:brightness-110 ${backgroundColor} ${pieceColor}`

                // contour jaune sur la case actuellement sélectionnée
                if (selected !== null && selected.file === file && selected.rank === rank) {
                    square.classList.add('outline', 'outline-4', 'outline-offset-[-4px]', 'outline-[#f5d153]')
                }

                // petit point vert sur les cases où la pièce sélectionnée peut se déplacer
                if (moveTo(file, rank) !== null) {
                    square.classList.add('after:absolute', 'after:h-1/4', 'after:w-1/4', 'after:rounded-full', 'after:bg-[#315c2d]/80')
                }

                if (piece) {
                    square.textContent = pieceSymbol(piece)
                }

                square.onclick = () => handleClick(file, rank)
                element.append(square)
            }
        }
    }

    function handleClick(file, rank) {
        const move = moveTo(file, rank)
        if (move !== null) {
            // on avait une pièce sélectionnée et on clique sur une case où elle peut aller : on joue le coup
            selected = null
            onMove(move)
            return
        }

        // sinon, on regarde si on peut sélectionner la pièce sur laquelle on vient de cliquer
        const piece = pieceAt(position, createSquare(file, rank))
        const canSelect = piece && moves.some((m) => m.from.file === file && m.from.rank === rank)
        selected = canSelect ? { file, rank } : null
        draw()
    }

    return {
        element,
        flip() {
            flipped = !flipped
            draw()
        },
        render(nextPosition, nextMoves) {
            // applyMove() crée toujours un nouvel objet position. Si c'est le même objet qu'avant,
            // c'est qu'aucun coup n'a été joué (par exemple un simple rafraîchissement de l'affichage) :
            // dans ce cas on garde la sélection en cours au lieu de l'effacer.
            if (nextPosition !== position) {
                selected = null
            }
            position = nextPosition
            moves = nextMoves
            draw()
        },
    }
}