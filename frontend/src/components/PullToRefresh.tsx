import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [touchStart, setTouchStart] = useState(0)

  const threshold = 80 // Pixels to pull before triggering refresh

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh when at top of page
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === 0 || window.scrollY > 0) return

    const currentTouch = e.touches[0].clientY
    const distance = currentTouch - touchStart

    // Only show pull indicator when pulling down
    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
    setTouchStart(0)
  }

  const progress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 flex justify-center items-center py-4 z-50"
          >
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  rotate: isRefreshing ? 360 : progress * 360,
                  scale: isRefreshing ? 1 : 0.8 + progress * 0.2
                }}
                transition={isRefreshing ? {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                } : {
                  duration: 0.2
                }}
                className={`text-3xl ${progress >= 1 ? 'text-mocha-green' : 'text-mocha-blue'}`}
              >
                {isRefreshing ? '🔄' : '⬇️'}
              </motion.div>
              <div className="text-xs text-mocha-subtext0 mt-1 font-medium">
                {isRefreshing ? 'Refreshing...' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
