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
  const [currentMessage, setCurrentMessage] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    // Show capybara with a random message periodically
    const showCapybara = () => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setCurrentMessage(randomMessage)
      setIsVisible(true)

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 5000)
    }

    // Show first message after 3 seconds
    const initialTimeout = setTimeout(showCapybara, 3000)

    // Then show periodically
    const periodicInterval = setInterval(showCapybara, interval)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(periodicInterval)
    }
  }, [messages, interval])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="fixed bottom-8 left-8 z-50 flex items-end gap-4"
        >
          {/* Speech Bubble */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-white rounded-2xl px-6 py-4 shadow-2xl max-w-xs"
          >
            {/* Typing animation */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-800 font-semibold text-lg"
            >
              {currentMessage}
            </motion.p>

            {/* Speech bubble tail */}
            <div className="absolute bottom-4 -right-2 w-4 h-4 bg-white transform rotate-45" />
          </motion.div>

          {/* Capybara Character */}
          <motion.div
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* Capybara Body */}
            <div className="relative">
              {/* Main body - using a large capybara emoji */}
              <div className="text-8xl filter drop-shadow-2xl">
                🦫
              </div>

              {/* Sparkles */}
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
                className="absolute -top-2 -right-2 text-3xl"
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
                className="absolute -bottom-2 -left-2 text-2xl"
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
