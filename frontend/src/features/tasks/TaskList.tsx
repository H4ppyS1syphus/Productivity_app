import { useState } from 'react'
import { formatDistanceToNow, isPast } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { type Task } from '@/services/api'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (task: Task) => void
  onDelete: (taskId: number) => void
  filter?: 'all' | 'daily' | 'weekly' | 'long_term' | 'gym_workout' | 'pending' | 'completed'
}

export function TaskList({ tasks, onToggleComplete, onDelete, filter = 'all' }: TaskListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'pending' || filter === 'completed') {
      return task.status === filter
    }
    return task.type === filter
  })

  if (filteredTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20"
      >
        <div className="text-6xl mb-4">🌸</div>
        <p className="text-white/80 text-xl font-semibold">
          No tasks found. Create one to get started!
        </p>
        <p className="text-white/60 mt-2">がんばって！ (Ganbatte!)</p>
      </motion.div>
    )
  }

  const getTaskTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'daily':
        return 'bg-gradient-to-r from-neon-blue to-neon-cyan text-white'
      case 'weekly':
        return 'bg-gradient-to-r from-neon-purple to-purple-600 text-white'
      case 'long_term':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
      case 'gym_workout':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
    }
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const isOverdue = isPast(date) && !tasks.find(t => t.due_date === dueDate)?.completed_at

    return (
      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
        isOverdue
          ? 'bg-red-500/20 text-red-300 border border-red-500/50'
          : 'bg-white/10 text-white/70'
      }`}>
        {isOverdue ? '⚠️ Overdue: ' : '📅 Due: '}
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl
                   transition-all duration-300 p-6 flex items-start gap-4 border border-white/20
                   hover:border-neon-pink/50 group"
        >
          {/* Checkbox */}
          <motion.button
            onClick={() => onToggleComplete(task)}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 mt-1"
          >
            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
                        ${task.status === 'completed'
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-400 shadow-lg shadow-green-500/50'
                          : 'border-white/30 hover:border-neon-pink hover:bg-white/10'}`}
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
              ? 'line-through text-white/50'
              : 'text-white'}`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-white/70 mt-2">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs px-3 py-1.5 rounded-lg font-bold shadow-lg ${getTaskTypeColor(task.type)}`}>
                {task.type.replace('_', ' ').toUpperCase()}
              </span>
              {task.due_date && formatDueDate(task.due_date)}
              {task.pause_on_away && (
                <span className="text-xs px-3 py-1.5 bg-white/10 border border-white/30
                               text-white/80 rounded-lg font-semibold">
                  ✈️ Pauses when away
                </span>
              )}
            </div>
            {task.completed_at && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs px-3 py-1.5 bg-green-500/20 text-green-300 mt-3 inline-block rounded-lg font-semibold border border-green-500/50"
              >
                ✓ Completed {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
              </motion.p>
            )}
          </div>

          {/* Delete button */}
          <div className="flex-shrink-0 flex items-center gap-2">
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
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg
                             transition-colors"
                  >
                    Delete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg
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
  )
}
