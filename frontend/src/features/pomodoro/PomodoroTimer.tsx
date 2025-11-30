import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getRandomMessage, POMODORO_MESSAGES } from '@/lib/motivational-messages'

const WORK_TIME = 25 * 60 // 25 minutes
const BREAK_TIME = 5 * 60 // 5 minutes
const LONG_BREAK_TIME = 15 * 60 // 15 minutes

type TimerMode = 'work' | 'break' | 'longBreak'

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')
  const intervalRef = useRef<number>()

  const getModeConfig = (m: TimerMode) => {
    switch (m) {
      case 'work':
        return { duration: WORK_TIME, color: 'from-neon-pink to-sakura-500', label: 'Focus Time', emoji: '🎯' }
      case 'break':
        return { duration: BREAK_TIME, color: 'from-neon-cyan to-neon-blue', label: 'Short Break', emoji: '☕' }
      case 'longBreak':
        return { duration: LONG_BREAK_TIME, color: 'from-neon-purple to-purple-600', label: 'Long Break', emoji: '🌸' }
    }
  }

  const config = getModeConfig(mode)
  const progress = (config.duration - timeLeft) / config.duration

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(t => Math.max(0, t - 1))
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)

    if (mode === 'work') {
      setCompletedPomodoros(p => p + 1)
      celebrate()
      setMessage(getRandomMessage(POMODORO_MESSAGES.complete))
    } else {
      setMessage(getRandomMessage(POMODORO_MESSAGES.start))
    }

    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 3000)

    // Auto-switch modes
    if (mode === 'work') {
      const newMode = completedPomodoros + 1 >= 4 ? 'longBreak' : 'break'
      setMode(newMode)
      setTimeLeft(getModeConfig(newMode).duration)
      if (completedPomodoros + 1 >= 4) {
        setCompletedPomodoros(0)
      }
    } else {
      setMode('work')
      setTimeLeft(WORK_TIME)
    }
  }

  const celebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff3cc7', '#a855f7', '#f93e7d'],
    })
  }

  const toggleTimer = () => {
    if (!isRunning && timeLeft === config.duration) {
      setMessage(getRandomMessage(POMODORO_MESSAGES.start))
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 2000)
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(config.duration)
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(getModeConfig(newMode).duration)
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const circumference = 2 * Math.PI * 140

  return (
    <div className="max-w-md mx-auto">
      {/* Message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-gradient-to-r from-neon-pink to-neon-purple rounded-lg text-white text-center font-semibold"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {(['work', 'break', 'longBreak'] as TimerMode[]).map((m) => {
          const mConfig = getModeConfig(m)
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                mode === m
                  ? `bg-gradient-to-r ${mConfig.color} text-white shadow-lg`
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {mConfig.emoji} {mConfig.label}
            </button>
          )
        })}
      </div>

      {/* Circular Timer */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`relative bg-gradient-to-br ${config.color} p-8 rounded-3xl shadow-2xl`}
      >
        <div className="relative flex items-center justify-center">
          {/* SVG Circle */}
          <svg className="transform -rotate-90 w-80 h-80">
            {/* Background circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="160"
              cy="160"
              r="140"
              stroke="white"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="drop-shadow-lg"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-7xl font-black text-white drop-shadow-lg"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="text-xl text-white/80 mt-2 font-semibold">
              {config.label}
            </div>
            {mode === 'work' && (
              <div className="text-sm text-white/60 mt-1">
                Pomodoro #{completedPomodoros + 1}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-8 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-white text-sakura-600 font-bold text-2xl shadow-xl hover:shadow-2xl transition-shadow"
          >
            {isRunning ? '⏸' : '▶'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="w-20 h-20 rounded-full bg-white/20 text-white font-bold text-2xl shadow-lg hover:bg-white/30 transition-colors"
          >
            ↻
          </motion.button>
        </div>

        {/* Completed Count */}
        <div className="mt-6 text-center text-white/80">
          <div className="text-sm mb-2">Completed Today</div>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < completedPomodoros ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Pulsing glow when active */}
        {isRunning && (
          <div className="absolute inset-0 rounded-3xl animate-glow pointer-events-none" />
        )}
      </motion.div>
    </div>
  )
}
