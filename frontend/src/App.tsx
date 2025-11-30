import { useState, useEffect } from 'react'
import { api, type Task, type TaskCreate } from './services/api'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const taskData: TaskCreate = {
        title: newTaskTitle,
        type: 'daily',
      }
      const newTask = await api.createTask(taskData)
      setTasks([newTask, ...tasks])
      setNewTaskTitle('')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Productivity App
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal task manager
          </p>
        </header>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* New task form */}
        <form onSubmit={handleCreateTask} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                       rounded-lg transition-colors duration-200"
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Task list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No tasks yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md
                         transition-shadow duration-200 p-4 flex items-center gap-4"
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="flex-shrink-0"
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center
                              ${task.status === 'completed'
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-green-500'}`}
                  >
                    {task.status === 'completed' && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Task content */}
                <div className="flex-1">
                  <h3 className={`font-medium ${task.status === 'completed'
                    ? 'line-through text-gray-500 dark:text-gray-500'
                    : 'text-gray-900 dark:text-white'}`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900
                                   text-blue-800 dark:text-blue-200 rounded">
                      {task.type}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {tasks.length > 0 && (
          <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {tasks.filter(t => t.status === 'completed').length}
              </span>
              {' '}of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {tasks.length}
              </span>
              {' '}tasks completed
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
