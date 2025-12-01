import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '@/services/auth'

interface MobileHeaderProps {
  hasCalendarAuth: boolean
  onLogout: () => void
}

export function MobileHeader({ hasCalendarAuth, onLogout }: MobileHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const currentUser = authService.getCurrentUser()

  return (
    <>
      {/* Mobile Header - Compact */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative mb-4"
      >
        <div className="flex items-center justify-between">
          {/* Left: Menu button (mobile only) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 rounded-xl bg-mocha-surface0/50 text-mocha-text"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          {/* Center: Title */}
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-6xl font-black bg-gradient-to-r from-mocha-blue via-mocha-mauve to-mocha-sapphire bg-clip-text text-transparent">
              Productivity App
            </h1>
            <p className="hidden md:block text-mocha-text/70 text-lg font-medium mt-1">
              がんばって！ (Ganbatte!) - Let's do our best! 🌸
            </p>
          </div>

          {/* Right: Desktop buttons */}
          <div className="hidden md:flex gap-2 items-center">
            {/* User info badge */}
            {currentUser && (
              <div className="px-3 py-2 bg-mocha-surface0/50 rounded-xl border border-mocha-surface2">
                <div className="text-xs text-mocha-subtext0">Logged in as</div>
                <div className="text-sm font-semibold text-mocha-text">{currentUser.name}</div>
              </div>
            )}

            {/* Connect Calendar button */}
            {!hasCalendarAuth && (
              <motion.button
                onClick={() => authService.initiateCalendarAuth()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-mocha-blue to-mocha-sapphire hover:from-mocha-blue/80 hover:to-mocha-sapphire/80 rounded-xl text-mocha-base text-sm font-semibold shadow-lg border border-mocha-blue/30 transition-all"
                title="Connect Google Calendar"
              >
                📅 Calendar
              </motion.button>
            )}
            {hasCalendarAuth && (
              <motion.button
                onClick={() => authService.initiateCalendarAuth()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-mocha-green/20 hover:bg-mocha-green/30 rounded-xl text-mocha-green text-sm font-semibold border border-mocha-green/30 transition-all cursor-pointer"
                title="Calendar connected (click to reconnect)"
              >
                ✓ Calendar
              </motion.button>
            )}
            {/* Logout button */}
            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-mocha-surface0/50 hover:bg-mocha-surface1/50 rounded-xl text-mocha-text text-sm font-semibold border border-mocha-surface2 transition-colors"
            >
              Logout
            </motion.button>
          </div>

          {/* Mobile: Placeholder for symmetry */}
          <div className="md:hidden w-10" />
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-mocha-crust border-r border-mocha-surface0 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Close button */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-mocha-text">Menu</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMenu(false)}
                    className="p-2 rounded-lg bg-mocha-surface0/50 text-mocha-text"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* User info */}
                {currentUser && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-mocha-blue/10 to-mocha-mauve/10 rounded-xl border border-mocha-surface0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mocha-blue to-mocha-mauve flex items-center justify-center text-2xl font-bold text-white">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-mocha-text truncate">{currentUser.name}</div>
                        <div className="text-xs text-mocha-subtext0 truncate">{currentUser.email}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu items */}
                <div className="space-y-3">
                  {/* Calendar */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      authService.initiateCalendarAuth()
                      setShowMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      hasCalendarAuth
                        ? 'bg-mocha-green/20 text-mocha-green border border-mocha-green/30'
                        : 'bg-gradient-to-r from-mocha-blue to-mocha-sapphire text-white'
                    }`}
                  >
                    <span className="text-xl">📅</span>
                    <div className="text-left flex-1">
                      <div className="text-sm font-bold">
                        {hasCalendarAuth ? '✓ Calendar Connected' : 'Connect Calendar'}
                      </div>
                      <div className="text-xs opacity-70">
                        {hasCalendarAuth ? 'Tap to reconnect' : 'Sync tasks to Google Calendar'}
                      </div>
                    </div>
                  </motion.button>

                  {/* Settings placeholder */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-mocha-surface0/50 text-mocha-text font-semibold"
                  >
                    <span className="text-xl">⚙️</span>
                    <div className="text-left flex-1">
                      <div className="text-sm font-bold">Settings</div>
                      <div className="text-xs text-mocha-subtext0">Coming soon!</div>
                    </div>
                  </motion.button>

                  {/* Logout */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onLogout()
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-mocha-red/20 text-mocha-red border border-mocha-red/30 font-semibold"
                  >
                    <span className="text-xl">🚪</span>
                    <div className="text-left flex-1">
                      <div className="text-sm font-bold">Logout</div>
                      <div className="text-xs opacity-70">Sign out of your account</div>
                    </div>
                  </motion.button>
                </div>

                {/* App info */}
                <div className="mt-8 pt-6 border-t border-mocha-surface0">
                  <p className="text-mocha-subtext0 text-xs text-center">
                    がんばって！ (Ganbatte!)
                  </p>
                  <p className="text-mocha-subtext1 text-xs text-center mt-1">
                    Let's do our best! 🦫✨
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
