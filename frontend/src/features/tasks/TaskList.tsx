import { useState } from 'react'
import { formatDistanceToNow, isPast } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { type Task, type TaskUpdate } from '@/services/api'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (task: Task) => void
  onUpdate?: (taskId: number, updates: TaskUpdate) => void
  onDelete: (taskId: number) => void
  onSyncToCalendar?: (taskId: number) => void
  onUnsyncFromCalendar?: (taskId: number) => void
  hasCalendarAuth?: boolean
  filter?: 'all' | 'daily' | 'weekly' | 'long_term' | 'gym_workout' | 'pending' | 'completed'
}

export function TaskList({
  tasks,
  onToggleComplete,
  onUpdate,
  onDelete,
  onSyncToCalendar,
  onUnsyncFromCalendar,
  hasCalendarAuth = false,
  filter = 'all'
}: TaskListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'pending' || filter === 'completed') {
      return task.status === filter
    }
    return task.type === filter
  })

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask || !onUpdate || !editTitle.trim()) return

    setEditLoading(true)
    try {
      await onUpdate(editingTask.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      })
      setEditingTask(null)
    } finally {
      setEditLoading(false)
    }
  }

  if (filteredTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 bg-mocha-surface0/80 backdrop-blur-sm rounded-2xl shadow-xl border border-mocha-surface2/50"
      >
        <div className="text-6xl mb-4">🌸</div>
        <p className="text-mocha-subtext1 text-xl font-semibold">
          No tasks found. Create one to get started!
        </p>
        <p className="text-white/60 mt-2">がんばって！ (Ganbatte!)</p>
      </motion.div>
    )
  }

  const getTaskTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'daily':
        return 'bg-gradient-to-r from-mocha-blue to-mocha-sapphire text-white'
      case 'weekly':
        return 'bg-gradient-to-r from-mocha-mauve to-mocha-pink text-white'
      case 'monthly':
        return 'bg-gradient-to-r from-mocha-lavender to-mocha-mauve text-white'
      case 'long_term':
        return 'bg-gradient-to-r from-mocha-green to-mocha-teal text-white'
      case 'gym_workout':
        return 'bg-gradient-to-r from-mocha-peach to-mocha-maroon text-white'
    }
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const isOverdue = isPast(date) && !tasks.find(t => t.due_date === dueDate)?.completed_at

    return (
      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
        isOverdue
          ? 'bg-red-500/20 text-red-300 border border-red-500/50'
          : 'bg-mocha-surface0/80 text-mocha-subtext0'
      }`}>
        {isOverdue ? '⚠️ Overdue: ' : '📅 Due: '}
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-mocha-surface0/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl
                     transition-all duration-300 p-6 flex items-start gap-4 border border-mocha-surface2/50
                     hover:border-mocha-pink/50 group"
          >
            {/* Checkbox */}
            <motion.button
              onClick={() => onToggleComplete(task)}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 mt-1"
            >
              <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
                          ${task.status === 'completed'
                            ? 'bg-gradient-to-br from-mocha-green to-mocha-teal border-mocha-green shadow-lg shadow-mocha-green/50'
                            : 'border-mocha-blue/30 hover:border-mocha-pink hover:bg-mocha-surface0/80'}`}
              >
                {task.status === 'completed' && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>
            </motion.button>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-xl ${task.status === 'completed'
                ? 'line-through text-mocha-overlay1'
                : 'text-white'}`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-mocha-subtext0 mt-2">
                  {task.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-xs px-3 py-1.5 rounded-lg font-bold shadow-lg ${getTaskTypeColor(task.type)}`}>
                  {task.type.replace('_', ' ').toUpperCase()}
                </span>
                {task.due_date && formatDueDate(task.due_date)}
                {task.pause_on_away && (
                  <span className="text-xs px-3 py-1.5 bg-mocha-surface0/80 border border-mocha-blue/30
                                 text-mocha-subtext1 rounded-lg font-semibold">
                    ✈️ Pauses when away
                  </span>
                )}
                {task.is_recurring && (
                  <span className="text-xs px-3 py-1.5 bg-mocha-sapphire/20 border border-mocha-sapphire/30
                                 text-mocha-sapphire rounded-lg font-semibold">
                    🔄 Recurring
                  </span>
                )}
              </div>
              {task.completed_at && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs px-3 py-1.5 bg-mocha-green/20 text-mocha-green mt-3 inline-block rounded-lg font-semibold border border-mocha-green/50"
                >
                  ✓ Completed {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
                </motion.p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {/* Edit button */}
              {onUpdate && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setEditingTask(task)
                    setEditTitle(task.title)
                    setEditDescription(task.description || '')
                  }}
                  className="text-white/40 hover:text-mocha-blue hover:bg-mocha-blue/20 transition-colors
                           p-2 rounded-lg"
                  title="Edit task"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.button>
              )}

              {/* Calendar sync button */}
              {hasCalendarAuth && onSyncToCalendar && onUnsyncFromCalendar && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (task.calendar_event_id) {
                      onUnsyncFromCalendar(task.id)
                    } else {
                      onSyncToCalendar(task.id)
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    task.calendar_event_id
                      ? 'text-mocha-green hover:text-mocha-green/70 hover:bg-mocha-green/20'
                      : 'text-white/40 hover:text-mocha-blue hover:bg-mocha-blue/20'
                  }`}
                  title={task.calendar_event_id ? 'Synced to Calendar (click to unsync)' : 'Sync to Google Calendar'}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.button>
              )}

              <AnimatePresence>
                {deleteConfirm === task.id ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onDelete(task.id)
                        setDeleteConfirm(null)
                      }}
                      className="px-3 py-1.5 bg-mocha-red hover:bg-mocha-maroon text-white text-xs font-bold rounded-lg
                               transition-colors"
                    >
                      Delete
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 bg-mocha-surface1/60 hover:bg-white/30 text-white text-xs font-bold rounded-lg
                               transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteConfirm(task.id)}
                    className="text-white/40 hover:text-red-400 transition-colors
                             p-2 rounded-lg hover:bg-red-500/20"
                    title="Delete task"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTask && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTask(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4"
            >
              <form
                onSubmit={handleEditSubmit}
                className="bg-mocha-surface0/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-mocha-surface2/50"
              >
                <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-mocha-blue to-mocha-mauve bg-clip-text text-transparent mb-6">
                  ✏️ Edit Task
                </h2>

                {/* Title */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-mocha-text mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-3 rounded-xl border-2 border-mocha-blue/30
                             bg-mocha-surface1/60 text-white placeholder-mocha-overlay1
                             focus:outline-none focus:ring-2 focus:ring-mocha-blue focus:border-mocha-blue
                             transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-mocha-text mb-2">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add more details..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-mocha-blue/30
                             bg-mocha-surface1/60 text-white placeholder-mocha-overlay1
                             focus:outline-none focus:ring-2 focus:ring-mocha-blue focus:border-mocha-blue
                             transition-all resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    disabled={editLoading || !editTitle.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-mocha-blue to-mocha-mauve
                             disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50
                             text-white font-black text-lg rounded-xl shadow-lg
                             hover:shadow-mocha-blue/50 transition-all disabled:cursor-not-allowed"
                  >
                    {editLoading ? '💾 Saving...' : '💾 Save Changes'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 bg-mocha-surface1/60 hover:bg-mocha-surface2/50
                             text-white font-bold rounded-xl transition-all border border-mocha-blue/30"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
