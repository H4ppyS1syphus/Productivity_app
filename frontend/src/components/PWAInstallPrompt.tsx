import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Don't show immediately - wait a bit for user to interact
      setTimeout(() => {
        // Check if user hasn't dismissed it before
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed) {
          setShowPrompt(true)
        }
      }, 5000) // Show after 5 seconds
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }

    // Clear the deferred prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed')
    }, 7 * 24 * 60 * 60 * 1000)
  }

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-50"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-mocha-blue via-mocha-mauve to-mocha-sapphire p-6 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20"
          >
            {/* Icon */}
            <div className="flex items-start gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-5xl flex-shrink-0"
              >
                📱
              </motion.div>

              <div className="flex-1">
                <h3 className="text-xl font-black text-white mb-2">
                  Install Productivity App!
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  Install on your home screen for quick access and offline use. がんばって！ 🌸
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstall}
                    className="flex-1 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-bold transition-colors border border-white/30"
                  >
                    ✨ Install
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDismiss}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white/80 font-semibold transition-colors"
                  >
                    Later
                  </motion.button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="text-white/60 hover:text-white text-2xl transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
