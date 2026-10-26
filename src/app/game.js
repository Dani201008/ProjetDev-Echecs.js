/**
 * game.js
 * Game fait le lien entre le domaine (les règles du jeu) et l'interface (l'affichage).
 * Il ne connaît pas les règles lui-même : il demande toujours au domaine si un coup est possible,
 * et il demande à domain/rules.js (fait par Timmy) l'état de la partie (échec, mat, pat, nulle...).
 *
 * Ce fichier NE GÈRE PAS le chronomètre : c'est app/timer.js qui s'en occupe, séparément.
 */
import { startingPosition, applyMove, pieceAt } from '../domain/position.js'
import { legalMoves as domainLegalMoves } from '../domain/moveGenerator.js'
import { getGameStatus, GameStatus } from '../domain/rules.js'
import { createSquare } from '../domain/square.js'
import { MoveFlag } from '../domain/move.js'

// Tous les états qui veulent dire que la partie est terminée (mat, pat, ou une des nulles)
const ENDING_STATUSES = [
  GameStatus.CHECKMATE,
  GameStatus.STALEMATE,
  GameStatus.DRAW_INSUFFICIENT_MATERIAL,
  GameStatus.DRAW_FIFTY_MOVE,
  GameStatus.DRAW_THREEFOLD_REPETITION,
]

// Vérifie si un coup que l'on veut jouer correspond bien à un coup légal renvoyé par le domaine.
// On compare la case de départ, la case d'arrivée, et la pièce de promotion si il y en a une.
function sameMove(legalMove, playedMove) {
  const sameSquares = legalMove.from.file === playedMove.from.file
      && legalMove.from.rank === playedMove.from.rank
      && legalMove.to.file === playedMove.to.file
      && legalMove.to.rank === playedMove.to.rank

  const samePromotion = playedMove.promotion
      ? legalMove.promotion === playedMove.promotion
      : legalMove.promotion === null

  return sameSquares && samePromotion
}

// Fait une copie des pièces capturées, pour pouvoir les remettre si on annule un coup (undo)
function cloneCaptured(captured) {
  return { white: captured.white.slice(), black: captured.black.slice() }
}

export class Game {
  constructor() {
    this.listeners = []
    this.reset()
  }

  // Remet la partie à zéro : position de départ, historique vide, aucune pièce capturée
  reset() {
    this.position = startingPosition()
    this.history = []
    this.captured = { white: [], black: [] }
    this.notify()
  }

  legalMoves() {
    return domainLegalMoves(this.position)
  }

  // État actuel de la partie ('ongoing', 'check', 'checkmate'...), calculé par domain/rules.js
  status() {
    const previousPositions = this.history.map((state) => state.position)
    return getGameStatus(this.position, previousPositions)
  }

  // La partie est-elle terminée (peu importe le résultat) ?
  isOver() {
    return ENDING_STATUSES.includes(this.status())
  }

  // Essaie de jouer un coup. Renvoie true si le coup a été joué, false s'il n'est pas légal.
  play(move) {
    const legalMove = this.legalMoves().find((m) => sameMove(m, move))
    if (!legalMove) return false

    const capturedPiece = this.capturedBy(legalMove)

    this.history.push({
      position: this.position,
      captured: cloneCaptured(this.captured),
    })

    if (capturedPiece) {
      this.captured[this.position.sideToMove].push(capturedPiece)
    }
    this.position = applyMove(this.position, legalMove)

    this.notify()
    return true
  }

  // Trouve quelle pièce est prise par un coup.
  // Cas particulier : à la prise en passant, la pièce prise n'est pas sur la case d'arrivée,
  // elle se trouve juste à côté (sur la même ligne que le pion qui capture).
  capturedBy(move) {
    if (move.flag === MoveFlag.EN_PASSANT) {
      const squareOfCapturedPawn = createSquare(move.to.file, move.from.rank)
      return pieceAt(this.position, squareOfCapturedPawn)
    }
    return pieceAt(this.position, move.to)
  }

  // Annule le dernier coup joué et remet les pièces capturées comme avant
  undo() {
    if (this.history.length === 0) return false
    const previousState = this.history.pop()
    this.position = previousState.position
    this.captured = previousState.captured
    this.notify()
    return true
  }

  // L'interface s'abonne avec cette méthode : sa fonction sera appelée à chaque changement de partie
  subscribe(listener) {
    this.listeners.push(listener)
  }

  // Prévient tous les abonnés (l'interface) qu'il y a du nouveau à afficher
  notify() {
    for (const listener of this.listeners) {
      listener(this)
    }
  }
}