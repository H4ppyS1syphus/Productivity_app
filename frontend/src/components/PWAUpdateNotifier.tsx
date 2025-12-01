import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAUpdateNotifier() {
  const [showReload, setShowReload] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + r)

      // Check for updates every hour
      r && setInterval(() => {
        r.update()
      }, 60 * 60 * 1000)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
    onNeedRefresh() {
      console.log('New content available, will reload in 3 seconds...')
      setShowReload(true)

      // Auto-reload after showing notification for 3 seconds
      setTimeout(() => {
        updateServiceWorker(true)
      }, 3000)
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    },
  })

  useEffect(() => {
    if (needRefresh) {
      setShowReload(true)
    }
  }, [needRefresh])

  return (
    <AnimatePresence>
      {showReload && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-mocha-blue to-mocha-mauve px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
            <div className="animate-spin text-2xl">🔄</div>
            <div className="text-white">
              <div className="font-bold">Update Available!</div>
              <div className="text-sm opacity-90">Refreshing in 3 seconds...</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
