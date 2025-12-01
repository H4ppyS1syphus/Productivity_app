import { motion } from 'framer-motion'

export type TabType = 'tasks' | 'streaks' | 'pomodoro' | 'gym' | 'away'

interface BottomNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'tasks' as TabType, label: 'Tasks', emoji: '✅', color: 'from-mocha-green to-emerald-500' },
    { id: 'streaks' as TabType, label: 'Streaks', emoji: '🔥', color: 'from-mocha-peach to-orange-500' },
    { id: 'pomodoro' as TabType, label: 'Focus', emoji: '⏱️', color: 'from-mocha-blue to-blue-500' },
    { id: 'gym' as TabType, label: 'Gym', emoji: '💪', color: 'from-mocha-mauve to-purple-500' },
    { id: 'away' as TabType, label: 'Away', emoji: '✈️', color: 'from-mocha-sapphire to-cyan-500' },
  ]

  return (
    <>
      {/* Desktop: Horizontal tabs at top (hidden on mobile) */}
      <div className="hidden md:flex gap-3 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex-shrink-0 px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-xl`
                : 'bg-gray-800/60 backdrop-blur-sm text-mocha-text/60 hover:bg-gray-800'
            }`}
          >
            <span className="text-2xl mr-2">{tab.emoji}</span>
            <span className="whitespace-nowrap">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Mobile: Bottom navigation bar (only on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-mocha-crust/95 backdrop-blur-xl border-t border-mocha-surface0/50 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center px-3 py-2 rounded-xl min-w-[60px] touch-manipulation"
              >
                {/* Icon with active indicator */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  <div className={`text-2xl mb-1 ${isActive ? 'filter drop-shadow-lg' : ''}`}>
                    {tab.emoji}
                  </div>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r ${tab.color}`}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className={`text-[10px] font-semibold transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-mocha-subtext0'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* Spacer for mobile to prevent content being hidden behind bottom nav */}
      <div className="md:hidden h-20" />
    </>
  )
}
