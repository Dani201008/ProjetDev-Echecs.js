/**
 * timer.js
 *
 * Gère la pendule des deux joueurs.
 *
 * Le joueur actif voit son temps diminuer.
 * Après avoir joué son coup, il appuie sur son bouton :
 * son chrono s'arrête et celui de l'adversaire démarre.
 */

import { Color, opposite } from '../domain/color.js'


export class ChessTimer {

    constructor(minutesPerPlayer = 10) {

        const initialTime = minutesPerPlayer * 60 * 1000

        this.remainingTime = {
            [Color.WHITE]: initialTime,
            [Color.BLACK]: initialTime,
        }

        // Les blancs commencent la partie.
        this.activeColor = Color.WHITE

        this.isRunning = false
        this.intervalId = null
        this.lastUpdate = null

        this.listeners = []
    }


    /**
     * Démarre la pendule.
     */
    start() {

        if (this.isRunning) {
            return
        }

        this.isRunning = true
        this.lastUpdate = Date.now()

        this.intervalId = setInterval(() => {
            this.update()
        }, 100)

        this.notify()
    }


    /**
     * Appelé lorsqu'un joueur appuie sur son bouton.
     *
     * Exemple :
     * Blanc joue puis appuie sur son bouton.
     * Le chrono blanc s'arrête et le noir commence.
     */
    pressButton(color) {

        if (!this.isRunning) {
            return
        }

        // On ne peut appuyer que sur le bouton
        // du joueur dont le chrono tourne.
        if (color !== this.activeColor) {
            return
        }

        // On actualise une dernière fois son temps.
        this.update()

        // Puis on passe à l'adversaire.
        this.activeColor = opposite(color)
        this.lastUpdate = Date.now()

        this.notify()
    }


    /**
     * Met à jour le temps du joueur actif.
     */
    update() {

        if (!this.isRunning) {
            return
        }

        const now = Date.now()
        const elapsed = now - this.lastUpdate

        this.remainingTime[this.activeColor] -= elapsed

        this.lastUpdate = now


        // Le joueur n'a plus de temps.
        if (this.remainingTime[this.activeColor] <= 0) {

            this.remainingTime[this.activeColor] = 0

            this.stop()
        }

        this.notify()
    }


    /**
     * Arrête complètement la pendule.
     */
    stop() {

        this.isRunning = false

        if (this.intervalId !== null) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }

        this.notify()
    }


    /**
     * Retourne le temps restant d'un joueur en millisecondes.
     */
    getRemainingTime(color) {
        return this.remainingTime[color]
    }


    /**
     * Retourne le joueur dont le chrono tourne.
     */
    getActiveColor() {
        return this.activeColor
    }


    /**
     * Vérifie si un joueur n'a plus de temps.
     */
    hasLostOnTime(color) {
        return this.remainingTime[color] <= 0
    }


    /**
     * Permet à l'interface de recevoir les changements.
     */
    subscribe(listener) {

        this.listeners.push(listener)

        // Envoie immédiatement l'état actuel.
        listener(this.getState())

        return () => {
            this.listeners = this.listeners.filter(
                currentListener => currentListener !== listener
            )
        }
    }


    /**
     * Retourne l'état actuel de la pendule.
     */
    getState() {

        return {
            whiteTime: this.remainingTime[Color.WHITE],
            blackTime: this.remainingTime[Color.BLACK],
            activeColor: this.activeColor,
            isRunning: this.isRunning,
        }
    }


    /**
     * Prévient les éléments de l'interface.
     */
    notify() {

        const state = this.getState()

        for (const listener of this.listeners) {
            listener(state)
        }
    }
}


/**
 * Transforme des millisecondes en affichage MM:SS.
 *
 * Exemple :
 * 125000 -> "02:05"
 */
export function formatTime(milliseconds) {

    const totalSeconds = Math.ceil(milliseconds / 1000)

    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}