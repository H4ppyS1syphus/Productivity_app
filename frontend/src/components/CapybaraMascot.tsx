import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CapybaraMascotProps {
  messages?: string[]
  interval?: number
}

const defaultMessages = [
  "がんばって！ (Ganbatte!) 🌸",
  "You're doing amazing! ✨",
  "Keep up the great work! 💪",
  "すごい！ (Sugoi!) You're awesome! 🎉",
  "Time to crush those tasks! 🔥",
  "Believe in yourself! ⭐",
  "You got this! やった！ 🎯",
  "Stay focused, stay strong! 💎",
  "Every task completed is progress! 📈",
  "かっこいい！ (Kakkoii!) You're cool! 😎"
]

export function CapybaraMascot({ messages = defaultMessages, interval = 30000 }: CapybaraMascotProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [entryDirection, setEntryDirection] = useState<'left' | 'right'>('right')

  useEffect(() => {
    // Capybara is always visible, but sometimes talks
    setIsVisible(true)

    const showMessage = () => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      // Only use left and right to avoid weird positioning
      const randomDirection: 'left' | 'right' = Math.random() > 0.5 ? 'right' : 'left'

      setCurrentMessage(randomMessage)
      setEntryDirection(randomDirection)
      setIsTalking(true)

      // Stop talking after 5 seconds
      setTimeout(() => {
        setIsTalking(false)
      }, 5000)
    }

    // Show first message after 3 seconds
    const initialTimeout = setTimeout(showMessage, 3000)

    // Then show messages periodically
    const periodicInterval = setInterval(showMessage, interval)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(periodicInterval)
    }
  }, [messages, interval])

  const getEntryAnimation = () => {
    return entryDirection === 'left'
      ? { x: -400, opacity: 0 }
      : { x: 400, opacity: 0 }
  }

  const getPosition = () => {
    // On mobile, position higher to avoid bottom nav (bottom-24)
    // On desktop, keep at bottom-8
    return entryDirection === 'left'
      ? 'bottom-24 md:bottom-8 left-4 md:left-8'
      : 'bottom-24 md:bottom-8 right-4 md:right-8'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={getEntryAnimation()}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={getEntryAnimation()}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className={`fixed ${getPosition()} z-40 flex items-end gap-2 md:gap-4 ${entryDirection === 'right' ? 'flex-row-reverse' : ''}`}
        >
          {/* Speech Bubble - hidden on mobile */}
          <AnimatePresence>
            {isTalking && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.3 }}
                className={`hidden md:block relative bg-mocha-surface0 border-2 border-mocha-blue/50 rounded-2xl px-6 py-4 shadow-2xl max-w-xs ${
                  entryDirection === 'right' ? 'order-first' : ''
                }`}
              >
                {/* Typing animation */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-mocha-text font-semibold text-lg"
                >
                  {currentMessage}
                </motion.p>

                {/* Speech bubble tail */}
                <div className={`absolute bottom-4 w-4 h-4 bg-mocha-surface0 border-l-2 border-b-2 border-mocha-blue/50 transform rotate-45 ${
                  entryDirection === 'right' ? '-left-2' : '-right-2'
                }`} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Capybara Character */}
          <motion.div
            animate={
              isTalking
                ? {
                    y: [0, -10, 0],
                    rotate: [0, -5, 5, -5, 0]
                  }
                : {
                    // Idle animation - chilling
                    y: [0, -5, 0],
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.05, 1]
                  }
            }
            transition={{
              duration: isTalking ? 0.5 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* Capybara Body */}
            <div className="relative">
              {/* Main body - smaller on mobile, large on desktop */}
              <div className="text-5xl md:text-8xl filter drop-shadow-2xl">
                🦫
              </div>

              {/* Sparkles - smaller on mobile */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-1 md:-top-2 -right-1 md:-right-2 text-xl md:text-3xl"
              >
                ✨
              </motion.div>

              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-1 md:-bottom-2 -left-1 md:-left-2 text-lg md:text-2xl"
              >
                💫
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
