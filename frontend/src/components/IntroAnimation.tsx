import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function IntroAnimation() {
  const [show, setShow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = window.innerWidth < 768
    setIsMobile(checkMobile)

    // Skip intro on mobile entirely - it's annoying!
    if (checkMobile) {
      return
    }

    // Desktop: Show simplified intro (1.5s instead of 4.8s)
    setShow(true)

    const hideTimeout = setTimeout(() => {
      setShow(false)
    }, 1500) // Much faster: 1.5s total

    return () => {
      clearTimeout(hideTimeout)
    }
  }, [])

  if (!show || isMobile) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-mocha-crust via-mocha-base to-mocha-mantle"
      >
        {/* Simple, elegant intro */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          {/* Capybara */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-9xl mb-4 filter drop-shadow-2xl"
          >
            🦫
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-5xl font-black bg-gradient-to-r from-mocha-blue via-mocha-mauve to-mocha-pink bg-clip-text text-transparent"
          >
            Productivity App
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-lg text-mocha-subtext0 mt-2 font-medium"
          >
            がんばって! 🌸
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
