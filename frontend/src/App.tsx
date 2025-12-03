import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, type Task, type TaskCreate, type TaskUpdate } from './services/api'
import { authService } from './services/auth'
import { calendarService } from './services/calendar'
import { fetchPhDRelevantPapers, fetchMLPapers, type ArxivPaper } from './services/arxiv'
import { sendMessage, executeAction, type ChatMessage, type ChatContext, type GymWorkout } from './services/chatbot'
import { TaskForm } from './features/tasks/TaskForm'
import { TaskList } from './features/tasks/TaskList'
import { StreakDisplay } from './features/streaks/StreakDisplay'
import { PomodoroTimer } from './features/pomodoro/PomodoroTimer'
import { GymTracker } from './features/gym/GymTracker'
import { AwayMode } from './features/away/AwayMode'
import { ArxivPaperList } from './features/arxiv/ArxivPaperList'
import { ChatInterface } from './features/chat/ChatInterface'
import { CapybaraMascot } from './components/CapybaraMascot'
import { IntroAnimation } from './components/IntroAnimation'
import { FloatingTimer } from './components/FloatingTimer'
import { FloatingChatButton } from './components/FloatingChatButton'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { PWAUpdateNotifier } from './components/PWAUpdateNotifier'
import { GoogleLogin } from './components/GoogleLogin'
import { BottomNavigation } from './components/BottomNavigation'
import { MobileHeader } from './components/MobileHeader'
import { PullToRefresh } from './components/PullToRefresh'

type FilterType = 'all' | 'daily' | 'weekly' | 'long_term' | 'gym_workout' | 'pending' | 'completed'
type TabType = 'tasks' | 'streaks' | 'pomodoro' | 'gym' | 'away' | 'arxiv'

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
  const [statsExpanded, setStatsExpanded] = useState(false)

  // Task-Timer integration
  const [activeTimerTask, setActiveTimerTask] = useState<Task | null>(null)

  // arXiv state
  const [arxivPapers, setArxivPapers] = useState<ArxivPaper[]>([])
  const [arxivLoading, setArxivLoading] = useState(false)
  const [arxivError, setArxivError] = useState<string | null>(null)
  const [arxivCategory, setArxivCategory] = useState<'phd' | 'ml'>('phd')
  const [arxivLastUpdated, setArxivLastUpdated] = useState<string | null>(null)

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  // Check authentication on mount and validate token
  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = authService.isAuthenticated()

      if (hasToken) {
        // Validate the token with backend
        const isValid = await authService.validateToken()
        setIsAuthenticated(isValid)
      } else {
        setIsAuthenticated(false)
      }

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

  const handleUpdateTask = async (taskId: number, updates: TaskUpdate) => {
    try {
      const updatedTask = await api.updateTask(taskId, updates)
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
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

  const handleStartTimerForTask = (task: Task) => {
    setActiveTimerTask(task)
    setActiveTab('pomodoro')
  }

  const handleStopTimer = () => {
    setActiveTimerTask(null)
  }

  // arXiv handlers
  const loadArxivPapers = async () => {
    try {
      setArxivLoading(true)
      setArxivError(null)

      const papers = arxivCategory === 'phd'
        ? await fetchPhDRelevantPapers({ maxResults: 20 })
        : await fetchMLPapers({ maxResults: 20 })

      setArxivPapers(papers)
      setArxivLastUpdated(new Date().toISOString())
    } catch (err) {
      setArxivError('Failed to load arXiv papers. Please try again.')
      console.error('Error loading arXiv papers:', err)
    } finally {
      setArxivLoading(false)
    }
  }

  const handleArxivCategoryChange = (category: 'phd' | 'ml') => {
    setArxivCategory(category)
  }

  const handleAddPaperToTask = async (paper: ArxivPaper) => {
    try {
      const taskData: TaskCreate = {
        title: `Read: ${paper.title}`,
        description: `${paper.summary}\n\nAuthors: ${paper.authors.join(', ')}\nLink: ${paper.link}`,
        type: 'long_term',
        pause_on_away: false,
      }

      const newTask = await api.createTask(taskData)
      setTasks([newTask, ...tasks])
      setActiveTab('tasks')
    } catch (err) {
      setError('Failed to add paper to tasks')
      console.error('Error adding paper to tasks:', err)
    }
  }

  // Load arXiv papers when switching to arxiv tab
  useEffect(() => {
    if (activeTab === 'arxiv' && arxivPapers.length === 0) {
      loadArxivPapers()
    }
  }, [activeTab, arxivCategory])

  // Chat handlers
  const handleSendChatMessage = async (message: string) => {
    try {
      setChatLoading(true)
      setChatError(null)

      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, userMessage])

      // Build context
      const context: ChatContext = {
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          type: t.type,
          status: t.status,
          due_date: t.due_date,
        })),
        currentTab: activeTab,
        arxivPapers: arxivPapers.map(p => ({
          id: p.id,
          title: p.title,
          authors: p.authors,
        })),
        history: chatMessages,
      }

      // Send to LLM
      const response = await sendMessage(message, context)

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, assistantMessage])

      // Execute actions
      for (const action of response.actions) {
        const feedback = await executeAction(action, {
          onCreateTask: async (data) => {
            await handleCreateTask(data)
          },
          onLogGym: async (data: GymWorkout) => {
            console.log('Logging gym workout:', data)
            const systemMessage: ChatMessage = {
              role: 'system',
              content: '✅ Gym workout logged successfully',
              timestamp: new Date().toISOString(),
            }
            setChatMessages(prev => [...prev, systemMessage])
          },
          onSearchArxiv: async (query: string) => {
            console.log('Searching arXiv for:', query)
            setActiveTab('arxiv')
            const systemMessage: ChatMessage = {
              role: 'system',
              content: `🔍 Switching to arXiv papers tab to search for: ${query}`,
              timestamp: new Date().toISOString(),
            }
            setChatMessages(prev => [...prev, systemMessage])
          },
          onSyncToCalendar: async (taskId: number) => {
            await handleSyncToCalendar(taskId)
            const systemMessage: ChatMessage = {
              role: 'system',
              content: '📅 Task synced to Google Calendar',
              timestamp: new Date().toISOString(),
            }
            setChatMessages(prev => [...prev, systemMessage])
          },
          onStartTimer: async (taskId: number) => {
            const task = tasks.find(t => t.id === taskId)
            if (task) {
              handleStartTimerForTask(task)
              const systemMessage: ChatMessage = {
                role: 'system',
                content: `⏱️ Pomodoro timer started for: ${task.title}`,
                timestamp: new Date().toISOString(),
              }
              setChatMessages(prev => [...prev, systemMessage])
            }
          },
          onQueryTasks: async (filter?: string) => {
            const systemMessage: ChatMessage = {
              role: 'system',
              content: `📋 Showing ${filter ? filter : 'all'} tasks`,
              timestamp: new Date().toISOString(),
            }
            setChatMessages(prev => [...prev, systemMessage])
            setActiveTab('tasks')
            if (filter) {
              setFilter(filter as FilterType)
            }
          },
        })

        // Add system feedback message
        if (feedback) {
          const systemMessage: ChatMessage = {
            role: 'system',
            content: feedback,
            timestamp: new Date().toISOString(),
          }
          setChatMessages(prev => [...prev, systemMessage])
        }
      }
    } catch (err) {
      setChatError('Failed to send message. Please try again.')
      console.error('Chat error:', err)
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatRetry = () => {
    setChatError(null)
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

      {/* PWA Auto-Update Notifier */}
      <PWAUpdateNotifier />

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} hasUnread={false} />

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialMessages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isLoading={chatLoading}
        error={chatError || undefined}
        onRetry={handleChatRetry}
      />

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl relative z-10 pb-24 md:pb-8">
        {/* Header - New Mobile Optimized */}
        <MobileHeader
          hasCalendarAuth={hasCalendarAuth}
          onLogout={handleLogout}
        />

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

        {/* Navigation - Bottom on mobile, Top on desktop */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

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
              <PullToRefresh onRefresh={loadTasks}>
                <div>
                  {/* Stats Bar - Collapsible on Mobile */}
                <div className="mb-4 md:mb-8">
                  {/* Mobile: Compact stats with expand button */}
                  <div className="md:hidden">
                    <motion.button
                      onClick={() => setStatsExpanded(!statsExpanded)}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-mocha-surface0/80 backdrop-blur-sm rounded-xl p-4 border border-mocha-surface2/50 mb-3 touch-manipulation"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-xl font-black text-mocha-blue">{stats.total}</div>
                            <div className="text-xs text-mocha-subtext0">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-black text-mocha-green">{stats.completed}</div>
                            <div className="text-xs text-mocha-subtext0">Done</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-black text-mocha-yellow">{stats.pending}</div>
                            <div className="text-xs text-mocha-subtext0">Active</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-black text-mocha-mauve">
                              {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
                            </div>
                            <div className="text-xs text-mocha-subtext0">Rate</div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: statsExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-mocha-text"
                        >
                          ▼
                        </motion.div>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {statsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {[
                              { label: 'Total', value: stats.total, color: 'from-mocha-blue to-blue-600', emoji: '📊' },
                              { label: 'Completed', value: stats.completed, color: 'from-mocha-green to-emerald-600', emoji: '✅' },
                              { label: 'Pending', value: stats.pending, color: 'from-mocha-yellow to-yellow-600', emoji: '⏳' },
                              { label: 'Success', value: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%', color: 'from-mocha-mauve to-purple-600', emoji: '🎯' },
                            ].map((stat) => (
                              <motion.div
                                key={stat.label}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl shadow-xl text-white`}
                              >
                                <div className="text-2xl mb-1">{stat.emoji}</div>
                                <div className="text-3xl font-black leading-none">{stat.value}</div>
                                <div className="text-xs opacity-90 mt-1">{stat.label}</div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Desktop: Full stats always visible */}
                  <div className="hidden md:grid grid-cols-4 gap-4">
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
                        className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-xl text-white`}
                      >
                        <div className="text-3xl mb-2">{stat.emoji}</div>
                        <div className="text-4xl font-black leading-none">{stat.value}</div>
                        <div className="text-sm opacity-90 mt-1">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
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
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    onSyncToCalendar={handleSyncToCalendar}
                    onUnsyncFromCalendar={handleUnsyncFromCalendar}
                    onStartTimer={handleStartTimerForTask}
                    activeTimerTaskId={activeTimerTask?.id}
                    hasCalendarAuth={hasCalendarAuth}
                    filter={filter}
                  />
                )}
                </div>
              </PullToRefresh>
            )}

            {activeTab === 'streaks' && (
              <StreakDisplay
                currentStreak={currentStreak}
                longestStreak={longestStreak}
              />
            )}

            {activeTab === 'pomodoro' && (
              <PomodoroTimer
                activeTask={activeTimerTask}
                onStopTimer={handleStopTimer}
              />
            )}

            {activeTab === 'gym' && <GymTracker />}

            {activeTab === 'away' && <AwayMode />}

            {activeTab === 'arxiv' && (
              <div className="space-y-4">
                {/* Category Selector */}
                <div className="flex gap-2 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleArxivCategoryChange('phd')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      arxivCategory === 'phd'
                        ? 'bg-mocha-blue text-mocha-base'
                        : 'bg-mocha-surface0 text-mocha-subtext0 hover:bg-mocha-surface1'
                    }`}
                  >
                    🔬 PhD Research
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleArxivCategoryChange('ml')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      arxivCategory === 'ml'
                        ? 'bg-mocha-blue text-mocha-base'
                        : 'bg-mocha-surface0 text-mocha-subtext0 hover:bg-mocha-surface1'
                    }`}
                  >
                    🤖 ML/AI Papers
                  </motion.button>
                </div>

                <ArxivPaperList
                  papers={arxivPapers}
                  isLoading={arxivLoading}
                  error={arxivError || undefined}
                  onRetry={loadArxivPapers}
                  onAddToTask={handleAddPaperToTask}
                  onRefresh={loadArxivPapers}
                  lastUpdated={arxivLastUpdated || undefined}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
