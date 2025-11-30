import { useState } from 'react'
import { motion } from 'framer-motion'
import { type TaskCreate } from '@/services/api'

interface TaskFormProps {
  onSubmit: (task: TaskCreate) => Promise<void>
  onCancel?: () => void
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'daily' | 'weekly' | 'long_term' | 'gym_workout'>('daily')
  const [dueDate, setDueDate] = useState('')
  const [pauseOnAway, setPauseOnAway] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        due_date: dueDate || undefined,
        pause_on_away: pauseOnAway,
      })

      // Reset form
      setTitle('')
      setDescription('')
      setType('daily')
      setDueDate('')
      setPauseOnAway(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-mocha-surface0/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-mocha-surface2/50"
    >
      <h2 className="text-3xl font-black bg-gradient-to-r from-mocha-pink to-mocha-mauve bg-clip-text text-transparent mb-6">
        ✨ Add New Task
      </h2>

      {/* Title */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-mocha-text mb-2">
          Task Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 rounded-xl border-2 border-mocha-blue/30
                   bg-mocha-surface1/60 text-white placeholder-mocha-overlay1
                   focus:outline-none focus:ring-2 focus:ring-mocha-pink focus:border-mocha-pink
                   transition-all"
          required
        />
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-mocha-text mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-mocha-blue/30
                   bg-mocha-surface1/60 text-white placeholder-mocha-overlay1
                   focus:outline-none focus:ring-2 focus:ring-mocha-pink focus:border-mocha-pink
                   transition-all resize-none"
        />
      </div>

      {/* Task Type */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-mocha-text mb-2">
          Task Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full px-4 py-3 rounded-xl border-2 border-mocha-blue/30
                   bg-mocha-surface1/60 text-white
                   focus:outline-none focus:ring-2 focus:ring-mocha-pink focus:border-mocha-pink
                   transition-all cursor-pointer"
        >
          <option value="daily" className="bg-mocha-surface0">📅 Daily</option>
          <option value="weekly" className="bg-mocha-surface0">📆 Weekly</option>
          <option value="long_term" className="bg-mocha-surface0">🎯 Long Term</option>
          <option value="gym_workout" className="bg-mocha-surface0">💪 Gym Workout</option>
        </select>
      </div>

      {/* Due Date */}
      <div className="mb-5">
          <label className="block text-sm font-bold text-mocha-text mb-2">
            Due Date
          </label>

          {/* Quick Date Buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { label: 'Today', hours: 0 },
              { label: 'Tomorrow', hours: 24 },
              { label: 'In 3 days', hours: 72 },
              { label: 'Next week', hours: 168 },
              { label: 'In 2 weeks', hours: 336 },
            ].map((preset) => (
              <motion.button
                key={preset.label}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const date = new Date()
                  date.setHours(date.getHours() + preset.hours)
                  setDueDate(date.toISOString().slice(0, 16))
                }}
                className="px-3 py-1.5 bg-mocha-surface0/80 hover:bg-mocha-surface1/60 text-mocha-subtext1 hover:text-white
                         text-xs font-semibold rounded-lg border border-mocha-surface2/50 hover:border-mocha-sapphire
                         transition-all"
              >
                {preset.label}
              </motion.button>
            ))}
            {dueDate && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDueDate('')}
                className="px-3 py-1.5 bg-mocha-red/20 hover:bg-mocha-red/30 text-mocha-red
                         text-xs font-semibold rounded-lg border border-mocha-red/50
                         transition-all"
              >
                ✕ Clear
              </motion.button>
            )}
          </div>

          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-mocha-blue/30
                     bg-mocha-surface1/60 text-white
                     focus:outline-none focus:ring-2 focus:ring-mocha-pink focus:border-mocha-pink
                     transition-all"
          />
      </div>

      {/* Pause on Away */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={pauseOnAway}
              onChange={(e) => setPauseOnAway(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 rounded-full bg-mocha-surface1/60 border-2 border-mocha-blue/30
                          peer-checked:bg-gradient-to-r peer-checked:from-mocha-pink peer-checked:to-neon-purple
                          peer-checked:border-mocha-pink transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all
                          peer-checked:translate-x-5"></div>
          </div>
          <span className="ml-3 text-sm font-semibold text-mocha-text group-hover:text-white transition-colors">
            ✈️ Pause this task when I'm away
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <motion.button
          type="submit"
          disabled={loading || !title.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-mocha-pink to-mocha-mauve
                   disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50
                   text-white font-black text-lg rounded-xl shadow-lg
                   hover:shadow-mocha-pink/50 transition-all disabled:cursor-not-allowed"
        >
          {loading ? '✨ Adding...' : '✨ Add Task'}
        </motion.button>
        {onCancel && (
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-4 bg-mocha-surface1/60 hover:bg-mocha-surface2/50
                     text-white font-bold rounded-xl transition-all border border-mocha-blue/30"
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.form>
  )
}
