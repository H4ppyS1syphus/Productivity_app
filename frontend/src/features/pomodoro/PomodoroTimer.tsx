import { motion, AnimatePresence } from 'framer-motion'
import { usePomodoroStore, type TimerMode } from '@/stores/pomodoroStore'
import { type Task } from '@/services/api'

interface PomodoroTimerProps {
  activeTask?: Task | null
  onStopTimer?: () => void
}

export function PomodoroTimer({ activeTask, onStopTimer }: PomodoroTimerProps = {}) {
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

  // Responsive circle radius - smaller on mobile
  const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 140
  const circumference = 2 * Math.PI * radius
  const svgSize = radius * 2 + 40 // Add padding

  return (
    <div className="max-w-md mx-auto px-4">
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

      {/* Active Task Card */}
      <AnimatePresence>
        {activeTask && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 p-4 bg-gradient-to-br from-mocha-peach/20 to-mocha-maroon/20 backdrop-blur-sm border border-mocha-peach/50 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 rounded-full bg-mocha-peach/30 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-mocha-peach" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-mocha-peach mb-1 uppercase tracking-wider">
                  Working on
                </div>
                <h3 className="text-mocha-text font-bold text-lg leading-tight mb-1">
                  {activeTask.title}
                </h3>
                {activeTask.description && (
                  <p className="text-mocha-subtext0 text-sm line-clamp-2">
                    {activeTask.description}
                  </p>
                )}
              </div>
              {onStopTimer && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onStopTimer}
                  className="flex-shrink-0 p-2 rounded-lg text-mocha-subtext0 hover:text-mocha-peach hover:bg-mocha-peach/20 transition-colors"
                  title="Clear active task"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Selector - Mobile optimized */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
        {(['work', 'break', 'longBreak'] as TimerMode[]).map((m) => {
          const mConfig = getModeConfig(m)
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`py-2.5 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all ${
                mode === m
                  ? `bg-gradient-to-br ${mConfig.color} text-white shadow-lg`
                  : 'bg-mocha-surface1 text-mocha-subtext0 hover:bg-mocha-surface2 hover:text-mocha-text'
              }`}
            >
              <div className="text-base md:text-lg mb-0.5 md:mb-1">{mConfig.emoji}</div>
              <div className="text-xs md:text-sm">{mConfig.label}</div>
            </button>
          )
        })}
      </div>

      {/* Circular Timer - Centered and mobile-friendly */}
      <motion.div
        className={`relative bg-gradient-to-br ${config.color} rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden mx-auto`}
      >
        <div className="p-6 md:p-12">
          {/* Centered timer container */}
          <div className="relative flex items-center justify-center">
            {/* SVG Circle - Responsive size */}
            <svg
              className="transform -rotate-90"
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
            >
              {/* Background circle */}
              <circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - progress) }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Time Display - Absolutely centered */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-5xl md:text-7xl font-bold text-white leading-none"
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="text-sm md:text-lg text-white/80 mt-2 md:mt-3 font-medium">
                {config.label}
              </div>
              {mode === 'work' && (
                <div className="text-xs md:text-sm text-white/60 mt-1 md:mt-2">
                  Session #{completedPomodoros + 1}
                </div>
              )}
            </div>
          </div>

          {/* Controls - Mobile friendly touch targets */}
          <div className="flex gap-3 md:gap-4 mt-6 md:mt-8 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white hover:bg-gray-50 text-gray-900 font-bold text-xl md:text-2xl shadow-lg transition-colors touch-manipulation"
            >
              {isRunning ? '⏸' : '▶'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xl md:text-2xl transition-colors touch-manipulation"
            >
              ↻
            </motion.button>
          </div>

          {/* Completed Count */}
          <div className="mt-6 md:mt-8 text-center text-white/80">
            <div className="text-xs md:text-sm mb-2 md:mb-3 font-medium">Completed Today</div>
            <div className="flex justify-center gap-1.5 md:gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${
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
