import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function IntroAnimation() {
  const [show, setShow] = useState(false)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // Check if intro has been shown before
    const hasSeenIntro = localStorage.getItem('hasSeenIntro')

    if (!hasSeenIntro) {
      setShow(true)

      // Stage 1: Power up (0-2s)
      const stage1 = setTimeout(() => setStage(1), 500)

      // Stage 2: Attack (2-3s)
      const stage2 = setTimeout(() => setStage(2), 2000)

      // Stage 3: Impact (3-4s)
      const stage3 = setTimeout(() => setStage(3), 3000)

      // Stage 4: Fade out (4-5s)
      const stage4 = setTimeout(() => {
        setStage(4)
        localStorage.setItem('hasSeenIntro', 'true')
      }, 4000)

      const hideTimeout = setTimeout(() => {
        setShow(false)
      }, 5500)

      return () => {
        clearTimeout(stage1)
        clearTimeout(stage2)
        clearTimeout(stage3)
        clearTimeout(stage4)
        clearTimeout(hideTimeout)
      }
    }
  }, [])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
      >
        {/* Background energy lines */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={stage >= 1 ? {
                scaleX: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0],
                x: ['-50%', '0%', '0%', '50%']
              } : {}}
              transition={{
                duration: 2,
                delay: i * 0.05,
                repeat: stage >= 1 && stage < 4 ? Infinity : 0,
                repeatDelay: 1
              }}
              className="absolute h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
              style={{
                top: `${5 + i * 5}%`,
                width: '200%',
                left: '-50%'
              }}
            />
          ))}
        </div>

        {/* Center stage */}
        <div className="relative z-10">
          {/* Stage 1: Power Up */}
          {stage >= 1 && stage < 2 && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 2, 1] }}
                transition={{ duration: 0.8 }}
                className="text-9xl text-center mb-8 filter drop-shadow-2xl"
              >
                ⚡
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-6xl font-black bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple
                             bg-clip-text text-transparent animate-shimmer"
                     style={{ backgroundSize: '200% auto' }}>
                  POWER UP
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-white/60 mt-4 text-2xl tracking-widest"
                >
                  準備中... (Preparing...)
                </motion.div>
              </motion.div>
            </>
          )}

          {/* Stage 2: Attack Animation */}
          {stage >= 2 && stage < 3 && (
            <>
              <motion.div
                initial={{ x: -1000, rotate: -180 }}
                animate={{ x: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="text-9xl text-center filter drop-shadow-2xl"
              >
                👊
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-8"
              >
                <div className="text-6xl font-black bg-gradient-to-r from-neon-pink via-sakura-400 to-neon-purple
                             bg-clip-text text-transparent animate-pulse">
                  ATTACK!
                </div>
              </motion.div>
            </>
          )}

          {/* Stage 3: Impact */}
          {stage >= 3 && stage < 4 && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 3, 2],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-[20rem] opacity-20">💥</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="relative z-10 text-center"
              >
                <motion.div
                  animate={{
                    textShadow: [
                      '0 0 20px #ff3cc7, 0 0 40px #a855f7',
                      '0 0 40px #ff3cc7, 0 0 80px #a855f7',
                      '0 0 20px #ff3cc7, 0 0 40px #a855f7',
                    ]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-8xl font-black text-white mb-4"
                >
                  PRODUCTIVITY
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-2 bg-gradient-to-r from-neon-pink via-sakura-400 to-neon-purple rounded-full mx-auto"
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-bold text-white/90 mt-6"
                >
                  がんばって！🌸
                </motion.div>
              </motion.div>
            </>
          )}

          {/* Stage 4: Fade Out */}
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <div className="text-6xl">✨</div>
            </motion.div>
          )}
        </div>

        {/* Particle effects */}
        {stage >= 2 && stage < 4 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                  scale: Math.random() * 2,
                  opacity: 0
                }}
                transition={{
                  duration: 1 + Math.random(),
                  delay: Math.random() * 0.5
                }}
                className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple"
                style={{
                  left: 0,
                  top: 0
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
