import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, type Task, type TaskCreate } from './services/api'
import { TaskForm } from './features/tasks/TaskForm'
import { TaskList } from './features/tasks/TaskList'
import { StreakDisplay } from './features/streaks/StreakDisplay'
import { PomodoroTimer } from './features/pomodoro/PomodoroTimer'
import { GymTracker } from './features/gym/GymTracker'
import { AwayMode } from './features/away/AwayMode'
import { CapybaraMascot } from './components/CapybaraMascot'
import { IntroAnimation } from './components/IntroAnimation'
import { FloatingTimer } from './components/FloatingTimer'

type FilterType = 'all' | 'daily' | 'weekly' | 'long_term' | 'gym_workout' | 'pending' | 'completed'
type TabType = 'tasks' | 'streaks' | 'pomodoro' | 'gym' | 'away'

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
    { id: 'tasks' as TabType, label: 'Tasks', emoji: '✅', color: 'from-green-600 to-green-700' },
    { id: 'streaks' as TabType, label: 'Streaks', emoji: '🔥', color: 'from-orange-600 to-orange-700' },
    { id: 'pomodoro' as TabType, label: 'Focus', emoji: '⏱️', color: 'from-blue-600 to-blue-700' },
    { id: 'gym' as TabType, label: 'Gym', emoji: '💪', color: 'from-purple-600 to-purple-700' },
    { id: 'away' as TabType, label: 'Away', emoji: '✈️', color: 'from-cyan-600 to-cyan-700' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Intro Animation */}
      <IntroAnimation />

      {/* Floating Timer (shows when not on pomodoro tab) */}
      {activeTab !== 'pomodoro' && (
        <FloatingTimer onOpen={() => setActiveTab('pomodoro')} />
      )}

      {/* Capybara Mascot */}
      <CapybaraMascot />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            Productivity App
          </h1>
          <p className="text-gray-400 text-base">
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
              className="bg-red-900/50 border border-red-700 text-white px-6 py-4 rounded-xl mb-6 flex items-center justify-between"
            >
              <span className="font-medium">{error}</span>
              <button onClick={() => setError(null)} className="text-white/80 hover:text-white text-xl">
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-br ${tab.color} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-300'
              }`}
            >
              <span className="text-xl mr-2">{tab.emoji}</span>
              <span>{tab.label}</span>
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
                    { label: 'Total', value: stats.total, color: 'from-blue-600 to-blue-700', emoji: '📊' },
                    { label: 'Completed', value: stats.completed, color: 'from-green-600 to-green-700', emoji: '✅' },
                    { label: 'Pending', value: stats.pending, color: 'from-yellow-600 to-yellow-700', emoji: '⏳' },
                    { label: 'Success', value: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%', color: 'from-purple-600 to-purple-700', emoji: '🎯' },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.03 }}
                      className={`bg-gradient-to-br ${stat.color} p-5 rounded-xl shadow-lg text-white`}
                    >
                      <div className="text-2xl mb-1">{stat.emoji}</div>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-sm opacity-80 mt-0.5">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Filter Tabs */}
                <div className="bg-gray-800 rounded-xl p-3 mb-6 flex flex-wrap gap-2">
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
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFilter(tab.value as FilterType)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        filter === tab.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-750 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      }`}
                    >
                      {tab.label} <span className="opacity-70">({tab.count})</span>
                    </motion.button>
                  ))}
                </div>

                {/* Add Task Button / Form */}
                {!showForm ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowForm(true)}
                    className="w-full mb-6 px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700
                             text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl
                             transition-all"
                  >
                    ✨ Add New Task
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
                      className="inline-block w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full"
                    />
                    <p className="mt-4 text-gray-400 font-medium">Loading tasks...</p>
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

            {activeTab === 'away' && <AwayMode />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
