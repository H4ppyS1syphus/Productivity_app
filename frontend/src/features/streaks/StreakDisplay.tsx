import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getStreakMessage } from '@/lib/motivational-messages'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  onStreakMilestone?: (streak: number) => void
}

export function StreakDisplay({ currentStreak, longestStreak, onStreakMilestone }: StreakDisplayProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [message, setMessage] = useState('')
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>(() => {
    // Load celebrated milestones from localStorage
    const stored = localStorage.getItem('celebratedMilestones')
    return stored ? JSON.parse(stored) : []
  })

  const getStreakTier = (streak: number) => {
    if (streak >= 365) return { name: 'GOD', color: 'from-yellow-400 via-pink-500 to-purple-600', glow: 'gold' }
    if (streak >= 180) return { name: 'PLATINUM', color: 'from-cyan-400 via-blue-500 to-purple-600', glow: 'cyan' }
    if (streak >= 90) return { name: 'GOLD', color: 'from-yellow-400 via-orange-500 to-red-500', glow: 'gold' }
    if (streak >= 30) return { name: 'SILVER', color: 'from-gray-300 via-gray-400 to-gray-500', glow: 'silver' }
    if (streak >= 7) return { name: 'BRONZE', color: 'from-orange-400 via-orange-600 to-orange-800', glow: 'bronze' }
    return { name: 'BEGINNER', color: 'from-sakura-400 to-sakura-600', glow: 'pink' }
  }

  const tier = getStreakTier(currentStreak)

  const triggerCelebration = () => {
    // Confetti explosion!
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff3cc7', '#a855f7', '#f93e7d', '#ffa3c5'],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ff3cc7', '#a855f7', '#f93e7d', '#ffa3c5'],
      })
    }, 250)

    setMessage(getStreakMessage(currentStreak))
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 4000)
  }

  useEffect(() => {
    // Celebrate on milestones - but only once per milestone
    const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365]
    if (milestones.includes(currentStreak) && !celebratedMilestones.includes(currentStreak)) {
      triggerCelebration()
      onStreakMilestone?.(currentStreak)

      // Mark this milestone as celebrated
      const newCelebrated = [...celebratedMilestones, currentStreak]
      setCelebratedMilestones(newCelebrated)
      localStorage.setItem('celebratedMilestones', JSON.stringify(newCelebrated))
    }
  }, [currentStreak, celebratedMilestones])

  return (
    <div className="relative">
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-sakura-500 to-purple-600 p-8 rounded-3xl shadow-2xl max-w-md mx-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl text-center mb-4"
              >
                🔥
              </motion.div>
              <h2 className="text-3xl font-bold text-white text-center mb-4">
                {currentStreak} DAY STREAK!
              </h2>
              <p className="text-xl text-white/90 text-center">
                {message}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Streak Display */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`relative bg-gradient-to-br ${tier.color} p-8 rounded-2xl shadow-xl overflow-hidden`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent"
               style={{ backgroundSize: '200% 100%' }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="text-center mb-4">
            <div className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">
              {tier.name} TIER
            </div>
            <motion.div
              key={currentStreak}
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="inline-block"
            >
              <div className="text-8xl font-black text-white drop-shadow-lg animate-glow">
                {currentStreak}
              </div>
            </motion.div>
            <div className="text-2xl font-bold text-white/90 mt-2">
              DAY STREAK 🔥
            </div>
          </div>

          {/* Longest Streak */}
          {longestStreak > currentStreak && (
            <div className="text-center text-white/70 text-sm">
              Personal Best: {longestStreak} days
            </div>
          )}

          {/* Fire Animation */}
          {currentStreak > 0 && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl text-center mt-4 filter drop-shadow-lg"
            >
              {currentStreak >= 90 ? '👑' : currentStreak >= 30 ? '⭐' : currentStreak >= 7 ? '💎' : '🔥'}
            </motion.div>
          )}
        </div>

        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-2xl animate-glow pointer-events-none`} />
      </motion.div>

      {/* Progress to next milestone */}
      <div className="mt-4">
        <StreakProgress currentStreak={currentStreak} />
      </div>
    </div>
  )
}

function StreakProgress({ currentStreak }: { currentStreak: number }) {
  const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365]
  const nextMilestone = milestones.find(m => m > currentStreak) || 365
  const previousMilestone = [...milestones].reverse().find(m => m <= currentStreak) || 0

  const progress = previousMilestone === nextMilestone
    ? 100
    : ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <div className="flex justify-between text-sm text-white/80 mb-2">
        <span>Progress to {nextMilestone} days</span>
        <span className="font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-neon-pink to-neon-purple rounded-full"
        />
      </div>
    </div>
  )
}
