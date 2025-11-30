import { create } from 'zustand'
import confetti from 'canvas-confetti'
import { getRandomMessage, POMODORO_MESSAGES } from '@/lib/motivational-messages'

const WORK_TIME = 25 * 60 // 25 minutes
const BREAK_TIME = 5 * 60 // 5 minutes
const LONG_BREAK_TIME = 15 * 60 // 15 minutes

export type TimerMode = 'work' | 'break' | 'longBreak'

interface PomodoroState {
  timeLeft: number
  isRunning: boolean
  mode: TimerMode
  completedPomodoros: number
  showMessage: boolean
  message: string

  // Actions
  tick: () => void
  toggleTimer: () => void
  resetTimer: () => void
  switchMode: (mode: TimerMode) => void
  setShowMessage: (show: boolean) => void
  getModeConfig: (mode: TimerMode) => {
    duration: number
    color: string
    label: string
    emoji: string
  }
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  timeLeft: WORK_TIME,
  isRunning: false,
  mode: 'work',
  completedPomodoros: 0,
  showMessage: false,
  message: '',

  getModeConfig: (mode: TimerMode) => {
    switch (mode) {
      case 'work':
        return { duration: WORK_TIME, color: 'from-mocha-blue to-mocha-sapphire', label: 'Focus Time', emoji: '🎯' }
      case 'break':
        return { duration: BREAK_TIME, color: 'from-mocha-green to-mocha-teal', label: 'Short Break', emoji: '☕' }
      case 'longBreak':
        return { duration: LONG_BREAK_TIME, color: 'from-mocha-mauve to-mocha-pink', label: 'Long Break', emoji: '🌸' }
    }
  },

  tick: () => {
    const { timeLeft, isRunning, mode, completedPomodoros } = get()

    if (!isRunning || timeLeft <= 0) return

    const newTimeLeft = timeLeft - 1

    if (newTimeLeft === 0) {
      // Timer complete
      set({ isRunning: false, timeLeft: 0 })

      if (mode === 'work') {
        const newCompleted = completedPomodoros + 1
        set({ completedPomodoros: newCompleted })

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#06b6d4'],
        })

        set({
          message: getRandomMessage(POMODORO_MESSAGES.complete),
          showMessage: true
        })

        // Auto-switch modes
        const nextMode = newCompleted >= 4 ? 'longBreak' : 'break'
        const nextConfig = get().getModeConfig(nextMode)

        setTimeout(() => {
          set({
            mode: nextMode,
            timeLeft: nextConfig.duration,
            completedPomodoros: newCompleted >= 4 ? 0 : newCompleted
          })
        }, 1000)
      } else {
        set({
          message: getRandomMessage(POMODORO_MESSAGES.start),
          showMessage: true
        })

        setTimeout(() => {
          set({
            mode: 'work',
            timeLeft: WORK_TIME
          })
        }, 1000)
      }

      setTimeout(() => set({ showMessage: false }), 3000)
    } else {
      set({ timeLeft: newTimeLeft })
    }
  },

  toggleTimer: () => {
    const { isRunning, timeLeft, mode } = get()
    const config = get().getModeConfig(mode)

    if (!isRunning && timeLeft === config.duration) {
      set({
        message: getRandomMessage(POMODORO_MESSAGES.start),
        showMessage: true
      })
      setTimeout(() => set({ showMessage: false }), 2000)
    }

    set({ isRunning: !isRunning })
  },

  resetTimer: () => {
    const { mode } = get()
    const config = get().getModeConfig(mode)
    set({ isRunning: false, timeLeft: config.duration })
  },

  switchMode: (newMode: TimerMode) => {
    const config = get().getModeConfig(newMode)
    set({ mode: newMode, timeLeft: config.duration, isRunning: false })
  },

  setShowMessage: (show: boolean) => set({ showMessage: show }),
}))

// Start the global timer tick
if (typeof window !== 'undefined') {
  setInterval(() => {
    usePomodoroStore.getState().tick()
  }, 1000)
}
