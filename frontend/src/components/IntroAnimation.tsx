import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function IntroAnimation() {
  const [show, setShow] = useState(false)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // Show intro on every page load!
    setShow(true)

    // Anime-style pacing: FAST → PAUSE → FAST (optimized for performance)
    // Stage 1: Power up - FAST (0-0.5s)
    const stage1 = setTimeout(() => setStage(1), 200)

    // Stage 2: Capybara entrance - MEDIUM (0.5-1.5s)
    const stage2 = setTimeout(() => setStage(2), 600)

    // Stage 3: MENACING pause - DRAMATIC HOLD (1.5-2.5s)
    const stage3 = setTimeout(() => setStage(3), 1500)

    // Stage 4: ORA ORA - EXPLOSIVE FAST (2.5-3.5s)
    const stage4 = setTimeout(() => setStage(4), 2500)

    // Stage 5: Impact hold - FREEZE FRAME (3.5-4s)
    const stage5 = setTimeout(() => setStage(5), 3500)

    // Stage 6: Fade out (4-4.5s)
    const stage6 = setTimeout(() => setStage(6), 4000)

    const hideTimeout = setTimeout(() => {
      setShow(false)
    }, 4800)

    return () => {
      clearTimeout(stage1)
      clearTimeout(stage2)
      clearTimeout(stage3)
      clearTimeout(stage4)
      clearTimeout(stage5)
      clearTimeout(stage6)
      clearTimeout(hideTimeout)
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
        {/* JoJo Speed Lines - Optimized */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={stage >= 1 && stage < 6 ? {
                scaleX: [0, 2],
                opacity: [0, 0.8, 0],
                x: ['-100%', '200%']
              } : { opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: i * 0.03,
                repeat: 2,
                ease: "easeOut"
              }}
              className={`absolute h-1 ${
                i % 3 === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-600' :
                i % 3 === 1 ? 'bg-gradient-to-r from-neon-pink to-purple-600' :
                'bg-gradient-to-r from-neon-cyan to-blue-600'
              }`}
              style={{
                top: `${(i / 20) * 100}%`,
                width: '200%',
                left: '-100%',
                transform: `rotate(${-10 + (i % 5) * 5}deg)`,
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>

        {/* MENACING effect (ゴゴゴゴ) - DRAMATIC PAUSE - Optimized */}
        {stage >= 3 && stage < 6 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`menace-${i}`}
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0.5, 0],
                  scale: [0.5, 1.2],
                  rotate: [0, 10],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: 1,
                  ease: "easeInOut"
                }}
                className="absolute text-6xl font-black text-neon-purple"
                style={{
                  left: `${15 + (i % 3) * 30}%`,
                  top: `${20 + Math.floor(i / 3) * 50}%`,
                  textShadow: '0 0 20px #a855f7, 0 0 40px #ff3cc7',
                  willChange: 'transform, opacity'
                }}
              >
                ゴ
              </motion.div>
            ))}
          </div>
        )}

        {/* Center stage */}
        <div className="relative z-10">
          {/* Stage 1: Power Up - FAST BURST */}
          {stage >= 1 && stage < 2 && (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 3, 1.5],
                  rotate: [-180, 0, 0]
                }}
                transition={{ duration: 0.6, ease: [0.87, 0, 0.13, 1] }} // Dramatic ease
                className="text-9xl text-center mb-8"
                style={{
                  filter: 'drop-shadow(0 0 30px #ffff00) drop-shadow(0 0 60px #ff6600)',
                  textShadow: '0 0 40px #ffff00'
                }}
              >
                ⚡
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    textShadow: [
                      '0 0 20px #06b6d4',
                      '0 0 60px #06b6d4, 0 0 80px #3b82f6',
                      '0 0 20px #06b6d4'
                    ]
                  }}
                  transition={{ duration: 0.3, repeat: 1 }}
                  className="text-7xl font-black text-white"
                  style={{ willChange: 'transform' }}
                >
                  準備！
                </motion.div>
              </motion.div>
            </>
          )}

          {/* Stage 2: Capybara vs Procrastination - SLOW ANTICIPATION */}
          {stage >= 2 && stage < 3 && (
            <>
              <div className="flex items-center justify-center gap-16">
                {/* Capybara on left - SLOW entrance with anticipation */}
                <motion.div
                  initial={{ x: -500, rotate: -90 }}
                  animate={{
                    x: [-500, -80, 0],
                    rotate: [-90, -20, 0],
                    scale: [0.3, 1.1, 1]
                  }}
                  transition={{
                    duration: 1.2,  // SLOWER for dramatic entrance
                    ease: [0.34, 1.56, 0.64, 1],  // Bounce-like ease
                    times: [0, 0.6, 1]  // Hold at mid-point
                  }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, -15, 15, -15, 0]
                    }}
                    transition={{ duration: 0.4, repeat: 2 }}
                    className="text-9xl filter drop-shadow-2xl"
                  >
                    🦫
                  </motion.div>
                  {/* Punching effect */}
                  <motion.div
                    initial={{ opacity: 0, x: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: [0, 50, 100],
                      scale: [1, 1.5, 2]
                    }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="absolute top-1/2 left-full text-6xl"
                  >
                    👊💥
                  </motion.div>
                  {/* Weights */}
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: [100, 0, -10, 0], opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-5xl"
                  >
                    🏋️
                  </motion.div>
                </motion.div>

                {/* VS text */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1.5, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="text-7xl font-black text-yellow-400"
                  style={{
                    textShadow: '0 0 40px #ff6600, 0 0 80px #ffff00',
                    WebkitTextStroke: '3px #000'
                  }}
                >
                  VS
                </motion.div>

                {/* Procrastination on right - getting defeated! */}
                <motion.div
                  initial={{ x: 500 }}
                  animate={{
                    x: [500, 50, 100],
                    rotate: [0, 0, 45],
                    opacity: [1, 1, 0.3]
                  }}
                  transition={{ duration: 0.7 }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      scale: [1, 0.9, 0.7],
                      rotate: [0, 15, 30]
                    }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-9xl filter drop-shadow-2xl opacity-70"
                  >
                    😴
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="absolute top-0 left-0 text-6xl"
                  >
                    💢
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-12"
              >
                <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  CAPYBARA POWER!
                </div>
              </motion.div>
            </>
          )}

          {/* Stage 3: MENACING / TIME FREEZE */}
          {stage >= 3 && stage < 4 && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 2, 1.8],
                  rotate: [0, 360]
                }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="text-[12rem] text-center"
                style={{
                  filter: 'drop-shadow(0 0 40px #a855f7) drop-shadow(0 0 80px #ff3cc7)'
                }}
              >
                🌟
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.4, repeat: 2 }}
                  className="text-8xl font-black"
                  style={{
                    background: 'linear-gradient(45deg, #ff3cc7, #a855f7, #ff3cc7)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 80px rgba(255, 60, 199, 0.8)',
                    willChange: 'transform'
                  }}
                >
                  ZA WARUDO!
                </motion.div>
              </motion.div>
            </>
          )}

          {/* Stage 4: ORA ORA Impact */}
          {stage >= 4 && stage < 5 && (
            <>
              {/* Multiple impact flashes */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 4, 2.5],
                  rotate: [0, 180, 360],
                  opacity: [1, 0.5, 0.8]
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-[25rem] opacity-30">💥</div>
              </motion.div>

              {/* ORA ORA ORA text */}
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`ora-${i}`}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 2, 3],
                      x: [0, (Math.random() - 0.5) * 300],
                      y: [0, (Math.random() - 0.5) * 300],
                      rotate: [0, Math.random() * 360]
                    }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                    className="absolute top-1/2 left-1/2 text-7xl font-black text-yellow-400"
                    style={{
                      textShadow: '0 0 40px #ff6600, 0 0 80px #ffff00',
                      WebkitTextStroke: '2px #ff3cc7'
                    }}
                  >
                    ORA!
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                className="relative z-10 text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    textShadow: [
                      '0 0 30px #ff3cc7, 0 0 60px #a855f7',
                      '0 0 60px #ff3cc7, 0 0 120px #a855f7',
                      '0 0 30px #ff3cc7, 0 0 60px #a855f7',
                    ]
                  }}
                  transition={{ duration: 0.5, repeat: 1 }}
                  className="text-9xl font-black text-white mb-6"
                  style={{ willChange: 'transform' }}
                >
                  PRODUCTIVITY
                </motion.div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="h-3 bg-gradient-to-r from-yellow-400 via-neon-pink to-neon-purple rounded-full mx-auto shadow-2xl"
                  style={{ boxShadow: '0 0 40px #ff3cc7' }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="text-5xl font-black text-white/90 mt-8"
                  style={{ textShadow: '0 0 20px #ffa3c5' }}
                >
                  がんばって！🌸
                </motion.div>
              </motion.div>
            </>
          )}

          {/* Stage 5: FREEZE FRAME - Dramatic hold */}
          {stage >= 5 && stage < 6 && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                repeat: 1
              }}
              className="relative z-10 text-center"
            >
              <motion.div
                className="text-9xl font-black text-white mb-6"
                style={{
                  textShadow: '0 0 50px #ff3cc7, 0 0 100px #a855f7, 0 0 150px #ffff00'
                }}
              >
                PRODUCTIVITY
              </motion.div>
              <div className="h-3 bg-gradient-to-r from-yellow-400 via-neon-pink to-neon-purple rounded-full mx-auto shadow-2xl"
                  style={{ boxShadow: '0 0 60px #ff3cc7, 0 0 100px #a855f7' }}
              />
              <div className="text-5xl font-black text-white/90 mt-8"
                  style={{ textShadow: '0 0 30px #ffa3c5' }}>
                がんばって！🌸
              </div>
            </motion.div>
          )}

          {/* Stage 6: Fade Out */}
          {stage >= 6 && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="text-center"
            >
              <div className="text-6xl">✨</div>
            </motion.div>
          )}
        </div>

        {/* Particle effects */}
        {stage >= 3 && stage < 6 && (
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
