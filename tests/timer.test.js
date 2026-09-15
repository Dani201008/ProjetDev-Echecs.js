import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { ChessTimer, formatTime } from '../src/app/timer.js'
import { Color } from '../src/domain/color.js'

describe('ChessTimer', () => {

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })


    test('les deux joueurs commencent avec le même temps', () => {

        const timer = new ChessTimer(10)

        expect(timer.getRemainingTime(Color.WHITE)).toBe(600000)
        expect(timer.getRemainingTime(Color.BLACK)).toBe(600000)
    })


    test('les blancs commencent la partie', () => {

        const timer = new ChessTimer()

        expect(timer.getActiveColor()).toBe(Color.WHITE)
    })


    test('la pendule est arrêtée au départ', () => {

        const timer = new ChessTimer()

        expect(timer.isRunning).toBe(false)
    })


    test('start démarre la pendule', () => {

        const timer = new ChessTimer()

        timer.start()

        expect(timer.isRunning).toBe(true)

        timer.stop()
    })


    test('le temps du joueur actif diminue', () => {

        const timer = new ChessTimer(10)

        timer.start()

        vi.advanceTimersByTime(1000)

        expect(timer.getRemainingTime(Color.WHITE)).toBe(599000)
        expect(timer.getRemainingTime(Color.BLACK)).toBe(600000)

        timer.stop()
    })


    test('appuyer sur le bouton blanc passe le tour aux noirs', () => {

        const timer = new ChessTimer()

        timer.start()

        timer.pressButton(Color.WHITE)

        expect(timer.getActiveColor()).toBe(Color.BLACK)

        timer.stop()
    })


    test('un joueur non actif ne peut pas changer le tour', () => {

        const timer = new ChessTimer()

        timer.start()

        // Les blancs jouent actuellement,
        // donc les noirs ne peuvent pas appuyer.
        timer.pressButton(Color.BLACK)

        expect(timer.getActiveColor()).toBe(Color.WHITE)

        timer.stop()
    })


    test('après changement de joueur, le temps des noirs diminue', () => {

        const timer = new ChessTimer(10)

        timer.start()

        // Blanc joue pendant 1 seconde.
        vi.advanceTimersByTime(1000)

        timer.pressButton(Color.WHITE)

        // Noir joue pendant 2 secondes.
        vi.advanceTimersByTime(2000)

        expect(timer.getRemainingTime(Color.WHITE)).toBe(599000)
        expect(timer.getRemainingTime(Color.BLACK)).toBe(598000)

        timer.stop()
    })


    test('stop arrête la pendule', () => {

        const timer = new ChessTimer()

        timer.start()
        timer.stop()

        expect(timer.isRunning).toBe(false)
    })


    test('le temps ne descend plus après stop', () => {

        const timer = new ChessTimer(10)

        timer.start()

        vi.advanceTimersByTime(1000)

        timer.stop()

        const timeAfterStop = timer.getRemainingTime(Color.WHITE)

        vi.advanceTimersByTime(5000)

        expect(timer.getRemainingTime(Color.WHITE)).toBe(timeAfterStop)
    })


    test('le joueur perd lorsque son temps arrive à zéro', () => {

        // 0.01 minute = 600 ms
        const timer = new ChessTimer(0.01)

        timer.start()

        vi.advanceTimersByTime(1000)

        expect(timer.getRemainingTime(Color.WHITE)).toBe(0)
        expect(timer.hasLostOnTime(Color.WHITE)).toBe(true)
        expect(timer.isRunning).toBe(false)
    })


    test('subscribe reçoit immédiatement l’état actuel', () => {

        const timer = new ChessTimer(10)

        const listener = vi.fn()

        timer.subscribe(listener)

        expect(listener).toHaveBeenCalledTimes(1)

        expect(listener).toHaveBeenCalledWith({
            whiteTime: 600000,
            blackTime: 600000,
            activeColor: Color.WHITE,
            isRunning: false,
        })
    })


    test('unsubscribe arrête les notifications', () => {

        const timer = new ChessTimer()

        const listener = vi.fn()

        const unsubscribe = timer.subscribe(listener)

        // Appel initial de subscribe()
        expect(listener).toHaveBeenCalledTimes(1)

        unsubscribe()

        timer.start()

        // Il ne doit pas recevoir la notification de start()
        expect(listener).toHaveBeenCalledTimes(1)

        timer.stop()
    })
})


describe('formatTime', () => {

    test('transforme 125000 ms en 02:05', () => {
        expect(formatTime(125000)).toBe('02:05')
    })


    test('transforme 60000 ms en 01:00', () => {
        expect(formatTime(60000)).toBe('01:00')
    })


    test('transforme 0 ms en 00:00', () => {
        expect(formatTime(0)).toBe('00:00')
    })


    test('arrondit les secondes vers le haut', () => {
        expect(formatTime(1500)).toBe('00:02')
    })
})