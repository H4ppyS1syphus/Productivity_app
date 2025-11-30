import { motion, AnimatePresence } from 'framer-motion'
import { usePomodoroStore } from '@/stores/pomodoroStore'

interface FloatingTimerProps {
  onOpen: () => void
}

export function FloatingTimer({ onOpen }: FloatingTimerProps) {
  const { timeLeft, isRunning, mode, getModeConfig, toggleTimer } = usePomodoroStore()
  const config = getModeConfig(mode)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (config.duration - timeLeft) / config.duration

  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative bg-gradient-to-br ${config.color} rounded-2xl shadow-2xl overflow-hidden cursor-pointer`}
            onClick={onOpen}
          >
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="3"
                fill="none"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
                className="transition-all duration-500"
              />
            </svg>

            {/* Content */}
            <div className="relative p-4 flex flex-col items-center justify-center min-w-[120px]">
              <div className="text-xs text-white/80 font-medium mb-1">
                {config.emoji} {config.label}
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {formatTime(timeLeft)}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTimer()
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg transition-colors"
              >
                {isRunning ? '⏸' : '▶'}
              </motion.button>
            </div>

            {/* Pulsing indicator */}
            {isRunning && (
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
