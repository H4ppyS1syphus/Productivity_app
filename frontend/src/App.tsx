import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, type Task, type TaskCreate } from './services/api'
import { TaskForm } from './features/tasks/TaskForm'
import { TaskList } from './features/tasks/TaskList'
import { StreakDisplay } from './features/streaks/StreakDisplay'
import { PomodoroTimer } from './features/pomodoro/PomodoroTimer'
import { GymTracker } from './features/gym/GymTracker'
import { CapybaraMascot } from './components/CapybaraMascot'
import { IntroAnimation } from './components/IntroAnimation'

type FilterType = 'all' | 'daily' | 'weekly' | 'long_term' | 'gym_workout' | 'pending' | 'completed'
type TabType = 'tasks' | 'streaks' | 'pomodoro' | 'gym'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [activeTab, setActiveTab] = useState<TabType>('tasks')

  // Mock streak data (replace with actual API call later)
  const [currentStreak, setCurrentStreak] = useState(7)
  const [longestStreak, setLongestStreak] = useState(30)

  // Load tasks on mount
  useEffect(() => {
    loadTasks()
  }, [])

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
    { id: 'tasks' as TabType, label: 'Tasks', emoji: '✅', color: 'from-sakura-400 to-sakura-600' },
    { id: 'streaks' as TabType, label: 'Streaks', emoji: '🔥', color: 'from-orange-500 to-red-500' },
    { id: 'pomodoro' as TabType, label: 'Focus', emoji: '⏱️', color: 'from-neon-cyan to-neon-blue' },
    { id: 'gym' as TabType, label: 'Gym', emoji: '💪', color: 'from-neon-purple to-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      {/* Intro Animation */}
      <IntroAnimation />

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Capybara Mascot */}
      <CapybaraMascot />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-7xl font-black bg-gradient-to-r from-neon-pink via-sakura-400 to-neon-purple bg-clip-text text-transparent mb-2 animate-shimmer" style={{ backgroundSize: '200% auto' }}>
            Productivity App
          </h1>
          <p className="text-white/70 text-lg font-medium">
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
              className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-white px-6 py-4 rounded-2xl mb-6 flex items-center justify-between"
            >
              <span className="font-semibold">{error}</span>
              <button onClick={() => setError(null)} className="text-white/80 hover:text-white text-2xl">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all overflow-hidden ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl`
                  : 'bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20'
              }`}
            >
              <span className="relative z-10 text-2xl mr-2">{tab.emoji}</span>
              <span className="relative z-10">{tab.label}</span>
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
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total', value: stats.total, color: 'from-neon-blue to-neon-cyan', emoji: '📊' },
                    { label: 'Completed', value: stats.completed, color: 'from-green-500 to-emerald-500', emoji: '✅' },
                    { label: 'Pending', value: stats.pending, color: 'from-orange-500 to-yellow-500', emoji: '⏳' },
                    { label: 'Success', value: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%', color: 'from-neon-purple to-neon-pink', emoji: '🎯' },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-xl text-white`}
                    >
                      <div className="text-3xl mb-2">{stat.emoji}</div>
                      <div className="text-4xl font-black">{stat.value}</div>
                      <div className="text-sm opacity-80 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Filter Tabs */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-3 mb-6 flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: '📋 All Tasks', count: stats.total },
                    { value: 'pending', label: '⚡ Active', count: stats.pending },
                    { value: 'completed', label: '✅ Done', count: stats.completed },
                    { value: 'daily', label: '📅 Daily', count: stats.daily },
                    { value: 'weekly', label: '📆 Weekly', count: stats.weekly },
                    { value: 'long_term', label: '🎯 Long Term', count: stats.longTerm },
                    { value: 'gym_workout', label: '💪 Gym', count: stats.gym },
                  ].map((tab) => (
                    <motion.button
                      key={tab.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilter(tab.value as FilterType)}
                      className={`px-4 py-2.5 rounded-xl font-bold transition-all text-sm ${
                        filter === tab.value
                          ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-lg'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {tab.label} <span className="opacity-70">({tab.count})</span>
                    </motion.button>
                  ))}
                </div>

                {/* Add Task Button / Form */}
                {!showForm ? (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)}
                    className="w-full mb-6 px-6 py-6 bg-gradient-to-r from-neon-pink to-neon-purple
                             text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-neon-pink/50
                             transition-all animate-glow"
                  >
                    ✨ Add New Task ✨
                  </motion.button>
                ) : (
                  <div className="mb-6">
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
                      className="inline-block w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full"
                    />
                    <p className="mt-4 text-white/80 font-semibold">Loading tasks...</p>
                  </div>
                ) : (
                  <TaskList
                    tasks={tasks}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
