import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, type Task, type TaskCreate } from './services/api'
import { authService } from './services/auth'
import { calendarService } from './services/calendar'
import { TaskForm } from './features/tasks/TaskForm'
import { TaskList } from './features/tasks/TaskList'
import { StreakDisplay } from './features/streaks/StreakDisplay'
import { PomodoroTimer } from './features/pomodoro/PomodoroTimer'
import { GymTracker } from './features/gym/GymTracker'
import { AwayMode } from './features/away/AwayMode'
import { CapybaraMascot } from './components/CapybaraMascot'
import { IntroAnimation } from './components/IntroAnimation'
import { FloatingTimer } from './components/FloatingTimer'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { GoogleLogin } from './components/GoogleLogin'

type FilterType = 'all' | 'daily' | 'weekly' | 'long_term' | 'gym_workout' | 'pending' | 'completed'
type TabType = 'tasks' | 'streaks' | 'pomodoro' | 'gym' | 'away'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasCalendarAuth, setHasCalendarAuth] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [activeTab, setActiveTab] = useState<TabType>('tasks')

  // Mock streak data (replace with actual API call later)
  const [currentStreak, setCurrentStreak] = useState(7)
  const [longestStreak, _setLongestStreak] = useState(0);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [])

  // Handle OAuth callback redirect
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')

      if (code) {
        console.log('📅 Handling Google Calendar OAuth callback...')
        try {
          await authService.exchangeCalendarCode(code)
          setIsAuthenticated(true)
          setHasCalendarAuth(true)
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
          console.log('✅ Calendar connected successfully!')
        } catch (err) {
          console.error('❌ Calendar auth failed:', err)
          setError('Failed to connect Google Calendar')
        }
      }
    }

    if (!isCheckingAuth) {
      handleOAuthCallback()
    }
  }, [isCheckingAuth])

  // Check calendar authorization status when authenticated
  useEffect(() => {
    const checkCalendarAuth = async () => {
      if (isAuthenticated) {
        try {
          const status = await calendarService.checkAuthStatus()
          setHasCalendarAuth(status.is_authorized)
        } catch (err) {
          console.error('Failed to check calendar auth:', err)
        }
      }
    }
    checkCalendarAuth()
  }, [isAuthenticated])

  // Load tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
    }
  }, [isAuthenticated])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getTasks()
      setTasks(response.tasks)
    } catch (err) {
      setError('Failed to load tasks. Make sure the backend is running.')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (taskData: TaskCreate) => {
    try {
      const newTask = await api.createTask(taskData)
      setTasks([newTask, ...tasks])
      setShowForm(false)
    } catch (err) {
      setError('Failed to create task')
      console.error('Error creating task:', err)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = task.status === 'completed'
        ? await api.uncompleteTask(task.id)
        : await api.completeTask(task.id)

      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t))

      // Increment streak on task completion
      if (updatedTask.status === 'completed') {
        setCurrentStreak(s => s + 1)
      }
    } catch (err) {
      setError('Failed to update task')
      console.error('Error updating task:', err)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (err) {
      setError('Failed to delete task')
      console.error('Error deleting task:', err)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setTasks([])
  }

  const handleSyncToCalendar = async (taskId: number) => {
    try {
      await calendarService.syncTask(taskId)
      // Reload tasks to get updated calendar_event_id
      await loadTasks()
    } catch (err) {
      setError('Failed to sync task to calendar')
      console.error('Error syncing task:', err)
    }
  }

  const handleUnsyncFromCalendar = async (taskId: number) => {
    try {
      await calendarService.unsyncTask(taskId)
      // Reload tasks to clear calendar_event_id
      await loadTasks()
    } catch (err) {
      setError('Failed to unsync task from calendar')
      console.error('Error unsyncing task:', err)
    }
  }

  // Show login screen if not authenticated
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-mocha-base flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-mocha-blue border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <GoogleLogin onSuccess={handleLoginSuccess} />
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    daily: tasks.filter(t => t.type === 'daily').length,
    weekly: tasks.filter(t => t.type === 'weekly').length,
    longTerm: tasks.filter(t => t.type === 'long_term').length,
    gym: tasks.filter(t => t.type === 'gym_workout').length,
  }

  const tabs = [
    { id: 'tasks' as TabType, label: 'Tasks', emoji: '✅', color: 'from-mocha-green to-emerald-500' },
    { id: 'streaks' as TabType, label: 'Streaks', emoji: '🔥', color: 'from-mocha-peach to-orange-500' },
    { id: 'pomodoro' as TabType, label: 'Focus', emoji: '⏱️', color: 'from-mocha-blue to-blue-500' },
    { id: 'gym' as TabType, label: 'Gym', emoji: '💪', color: 'from-mocha-mauve to-purple-500' },
    { id: 'away' as TabType, label: 'Away', emoji: '✈️', color: 'from-mocha-sapphire to-cyan-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-mocha-crust via-mocha-base to-mocha-mantle">
      {/* Intro Animation */}
      <IntroAnimation />

      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mocha-blue/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mocha-mauve/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating Timer (shows when not on pomodoro tab) */}
      {activeTab !== 'pomodoro' && (
        <FloatingTimer onOpen={() => setActiveTab('pomodoro')} />
      )}

      {/* Capybara Mascot */}
      <CapybaraMascot />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl relative z-10">
        {/* Header - Mobile Optimized */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6 md:mb-10 relative"
        >
          {/* Top-right buttons */}
          <div className="absolute top-0 right-4 flex gap-2">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-2 bg-mocha-green/20 hover:bg-mocha-green/30 rounded-xl text-mocha-green text-sm font-semibold border border-mocha-green/30 transition-all cursor-pointer"
                title="Calendar connected (click to reconnect)"
              >
                ✓ Calendar
              </motion.button>
            )}
            {/* Logout button */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-mocha-surface0/50 hover:bg-mocha-surface1/50 rounded-xl text-mocha-text text-sm font-semibold border border-mocha-surface2 transition-colors"
            >
              Logout
            </motion.button>
          </div>

          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-mocha-blue via-mocha-mauve to-mocha-sapphire bg-clip-text text-transparent mb-2 md:mb-3">
            Productivity App
          </h1>
          <p className="text-mocha-text/70 text-sm md:text-lg font-medium px-4">
            がんばって！ (Ganbatte!) - Let's do our best! 🌸
          </p>
        </motion.header>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-mocha-red/20 backdrop-blur-sm border border-mocha-red/50 text-white px-6 py-4 rounded-2xl mb-6 flex items-center justify-between"
            >
              <span className="font-semibold">{error}</span>
              <button onClick={() => setError(null)} className="text-white/80 hover:text-white text-2xl">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs - Mobile Optimized */}
        <div className="flex gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-3 md:mx-0 px-3 md:px-0">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-shrink-0 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-xl`
                  : 'bg-gray-800/60 backdrop-blur-sm text-mocha-text/60 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl md:text-2xl mr-1 md:mr-2">{tab.emoji}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'tasks' && (
              <div>
                {/* Stats Bar - Mobile Optimized */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  {[
                    { label: 'Total', value: stats.total, color: 'from-mocha-blue to-blue-600', emoji: '📊' },
                    { label: 'Completed', value: stats.completed, color: 'from-mocha-green to-emerald-600', emoji: '✅' },
                    { label: 'Pending', value: stats.pending, color: 'from-mocha-yellow to-yellow-600', emoji: '⏳' },
                    { label: 'Success', value: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%', color: 'from-mocha-mauve to-purple-600', emoji: '🎯' },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gradient-to-br ${stat.color} p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl text-white touch-manipulation`}
                    >
                      <div className="text-2xl md:text-3xl mb-1 md:mb-2">{stat.emoji}</div>
                      <div className="text-3xl md:text-4xl font-black leading-none">{stat.value}</div>
                      <div className="text-xs md:text-sm opacity-90 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Filter Tabs - Mobile Optimized */}
                <div className="bg-gray-900/80 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl p-2 md:p-3 mb-4 md:mb-6 overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
                  <div className="flex md:flex-wrap gap-1.5 md:gap-2 min-w-max md:min-w-0">
                    {[
                      { value: 'all', label: '📋 All', fullLabel: '📋 All Tasks', count: stats.total },
                      { value: 'pending', label: '⚡', fullLabel: '⚡ Active', count: stats.pending },
                      { value: 'completed', label: '✅', fullLabel: '✅ Done', count: stats.completed },
                      { value: 'daily', label: '📅', fullLabel: '📅 Daily', count: stats.daily },
                      { value: 'weekly', label: '📆', fullLabel: '📆 Weekly', count: stats.weekly },
                      { value: 'long_term', label: '🎯', fullLabel: '🎯 Long Term', count: stats.longTerm },
                      { value: 'gym_workout', label: '💪', fullLabel: '💪 Gym', count: stats.gym },
                    ].map((tab) => (
                      <motion.button
                        key={tab.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilter(tab.value as FilterType)}
                        className={`flex-shrink-0 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold transition-all text-xs md:text-sm touch-manipulation ${
                          filter === tab.value
                            ? 'bg-gradient-to-r from-mocha-blue to-mocha-sapphire text-white shadow-lg'
                            : 'bg-gray-800 text-mocha-text/60 hover:bg-gray-700'
                        }`}
                      >
                        <span className="md:hidden">{tab.label}</span>
                        <span className="hidden md:inline">{tab.fullLabel}</span>
                        <span className="opacity-70 ml-1">({tab.count})</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Add Task Button / Form - Mobile Optimized */}
                {!showForm ? (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)}
                    className="w-full mb-4 md:mb-6 px-4 md:px-6 py-4 md:py-6 bg-gradient-to-r from-mocha-blue to-mocha-mauve
                             text-white font-black text-lg md:text-xl rounded-xl md:rounded-2xl shadow-2xl hover:shadow-mocha-blue/50
                             transition-all touch-manipulation"
                  >
                    ✨ Add New Task ✨
                  </motion.button>
                ) : (
                  <div className="mb-4 md:mb-6">
                    <TaskForm
                      onSubmit={handleCreateTask}
                      onCancel={() => setShowForm(false)}
                    />
                  </div>
                )}

                {/* Task List */}
                {loading ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-16 h-16 border-4 border-mocha-blue border-t-transparent rounded-full"
                    />
                    <p className="mt-4 text-mocha-text/80 font-semibold">Loading tasks...</p>
                  </div>
                ) : (
                  <TaskList
                    tasks={tasks}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onSyncToCalendar={handleSyncToCalendar}
                    onUnsyncFromCalendar={handleUnsyncFromCalendar}
                    hasCalendarAuth={hasCalendarAuth}
                    filter={filter}
                  />
                )}
              </div>
            )}

            {activeTab === 'streaks' && (
              <StreakDisplay
                currentStreak={currentStreak}
                longestStreak={longestStreak}
              />
            )}

            {activeTab === 'pomodoro' && <PomodoroTimer />}

            {activeTab === 'gym' && <GymTracker />}

            {activeTab === 'away' && <AwayMode />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
