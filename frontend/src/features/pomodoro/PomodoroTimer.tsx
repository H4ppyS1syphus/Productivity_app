import { motion, AnimatePresence } from 'framer-motion'
import { usePomodoroStore, type TimerMode } from '@/stores/pomodoroStore'

export function PomodoroTimer() {
  const {
    timeLeft,
    isRunning,
    mode,
    completedPomodoros,
    showMessage,
    message,
    toggleTimer,
    resetTimer,
    switchMode,
    getModeConfig
  } = usePomodoroStore()

  const config = getModeConfig(mode)
  const progress = (config.duration - timeLeft) / config.duration

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
            className="mb-6 p-4 bg-mocha-surface1/80 backdrop-blur-sm border border-mocha-blue/50 rounded-xl text-mocha-text text-center font-medium"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Selector */}
      <div className="flex gap-3 mb-8">
        {(['work', 'break', 'longBreak'] as TimerMode[]).map((m) => {
          const mConfig = getModeConfig(m)
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === m
                  ? `bg-gradient-to-br ${mConfig.color} text-white shadow-lg`
                  : 'bg-mocha-surface1 text-mocha-subtext0 hover:bg-mocha-surface2 hover:text-mocha-text'
              }`}
            >
              <div className="text-lg mb-1">{mConfig.emoji}</div>
              <div className="text-sm">{mConfig.label}</div>
            </button>
          )
        })}
      </div>

      {/* Circular Timer */}
      <motion.div
        className={`relative bg-gradient-to-br ${config.color} rounded-3xl shadow-2xl overflow-hidden`}
      >
        <div className="p-12">
          <div className="relative flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="transform -rotate-90 w-80 h-80">
              {/* Background circle */}
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="160"
                cy="160"
                r="140"
                stroke="white"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - progress) }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-7xl font-bold text-white"
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="text-lg text-white/80 mt-3 font-medium">
                {config.label}
              </div>
              {mode === 'work' && (
                <div className="text-sm text-white/60 mt-2">
                  Session #{completedPomodoros + 1}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mt-8 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 text-gray-900 font-bold text-xl shadow-lg transition-colors"
            >
              {isRunning ? '⏸' : '▶'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xl transition-colors"
            >
              ↻
            </motion.button>
          </div>

          {/* Completed Count */}
          <div className="mt-8 text-center text-white/80">
            <div className="text-sm mb-3 font-medium">Completed Today</div>
            <div className="flex justify-center gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < completedPomodoros ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Subtle glow when active */}
        {isRunning && (
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-white pointer-events-none"
          />
        )}
      </motion.div>
    </div>
  )
}
