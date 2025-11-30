import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import confetti from 'canvas-confetti'
import { getRandomMessage, GYM_MESSAGES } from '@/lib/motivational-messages'

interface GymEntry {
  date: string
  bodyweight?: number
  squat?: number
  bench?: number
  deadlift?: number
}

export function GymTracker() {
  const [entries, setEntries] = useState<GymEntry[]>([
    { date: '2025-11-30', bodyweight: 83, squat: 150, bench: 87.5, deadlift: 170 },
  ])
  const [showForm, setShowForm] = useState(false)
  const [newEntry, setNewEntry] = useState<GymEntry>({
    date: new Date().toISOString().split('T')[0],
  })
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')

  const latest = entries[entries.length - 1] || {}
  const total = (latest.squat || 0) + (latest.bench || 0) + (latest.deadlift || 0)
  const is1000lbClub = total * 2.20462 >= 1000 // Convert kg to lbs

  const addEntry = () => {
    const previous = entries[entries.length - 1]
    let isNewPR = false

    if (previous) {
      if ((newEntry.squat && newEntry.squat > (previous.squat || 0)) ||
          (newEntry.bench && newEntry.bench > (previous.bench || 0)) ||
          (newEntry.deadlift && newEntry.deadlift > (previous.deadlift || 0))) {
        isNewPR = true
        celebratePR()
        setMessage(getRandomMessage(GYM_MESSAGES.pr))
      } else {
        setMessage(getRandomMessage(GYM_MESSAGES.progress))
      }
    }

    setEntries([...entries, newEntry])
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 3000)
    setNewEntry({ date: new Date().toISOString().split('T')[0] })
    setShowForm(false)
  }

  const celebratePR = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#ff3cc7', '#a855f7', '#f93e7d', '#06b6d4'],
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-6 p-4 bg-gradient-to-r from-mocha-pink to-mocha-mauve rounded-lg text-white text-center font-bold text-lg"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Squat', value: latest.squat, color: 'from-mocha-red to-mocha-pink', emoji: '🏋️' },
          { label: 'Bench', value: latest.bench, color: 'from-mocha-blue to-mocha-sapphire', emoji: '💪' },
          { label: 'Deadlift', value: latest.deadlift, color: 'from-mocha-mauve to-mocha-pink', emoji: '⚡' },
          { label: 'Total', value: total, color: 'from-mocha-yellow to-mocha-peach', emoji: '🔥' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05, rotate: 2 }}
            className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-xl text-white`}
          >
            <div className="text-3xl mb-2">{stat.emoji}</div>
            <div className="text-4xl font-black">{stat.value || 0}</div>
            <div className="text-sm opacity-80 mt-1">{stat.label} (kg)</div>
          </motion.div>
        ))}
      </div>

      {/* Achievement Badge */}
      {is1000lbClub && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 p-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl text-center animate-glow"
        >
          <div className="text-6xl mb-2">🏆</div>
          <div className="text-3xl font-black text-white">1000 LB CLUB!</div>
          <div className="text-white/90 mt-2">Elite strength achieved! 最強！</div>
        </motion.div>
      )}

      {/* Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-mocha-surface0/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-6"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Strength Progress 📈</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={entries}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="squat" stroke="#ff3cc7" strokeWidth={3} dot={{ r: 6 }} name="Squat" />
            <Line type="monotone" dataKey="bench" stroke="#06b6d4" strokeWidth={3} dot={{ r: 6 }} name="Bench" />
            <Line type="monotone" dataKey="deadlift" stroke="#a855f7" strokeWidth={3} dot={{ r: 6 }} name="Deadlift" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Add Entry Button */}
      {!showForm ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="w-full p-6 bg-gradient-to-r from-mocha-pink to-mocha-mauve rounded-2xl text-white font-bold text-xl shadow-xl hover:shadow-2xl transition-shadow"
        >
          + Log New Workout 💪
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-mocha-surface0/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl"
        >
          <h3 className="text-2xl font-bold text-white mb-4">New Workout Entry</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-mocha-subtext1 mb-2">Date</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-mocha-surface1/60 text-white border border-mocha-blue/30 focus:outline-none focus:ring-2 focus:ring-mocha-pink"
              />
            </div>
            <div>
              <label className="block text-mocha-subtext1 mb-2">Bodyweight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newEntry.bodyweight || ''}
                onChange={(e) => setNewEntry({ ...newEntry, bodyweight: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-mocha-surface1/60 text-white border border-mocha-blue/30 focus:outline-none focus:ring-2 focus:ring-mocha-pink"
              />
            </div>
            <div>
              <label className="block text-mocha-subtext1 mb-2">Squat 1RM (kg)</label>
              <input
                type="number"
                step="2.5"
                value={newEntry.squat || ''}
                onChange={(e) => setNewEntry({ ...newEntry, squat: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-mocha-surface1/60 text-white border border-mocha-blue/30 focus:outline-none focus:ring-2 focus:ring-mocha-pink"
              />
            </div>
            <div>
              <label className="block text-mocha-subtext1 mb-2">Bench 1RM (kg)</label>
              <input
                type="number"
                step="2.5"
                value={newEntry.bench || ''}
                onChange={(e) => setNewEntry({ ...newEntry, bench: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-mocha-surface1/60 text-white border border-mocha-blue/30 focus:outline-none focus:ring-2 focus:ring-mocha-pink"
              />
            </div>
            <div>
              <label className="block text-mocha-subtext1 mb-2">Deadlift 1RM (kg)</label>
              <input
                type="number"
                step="2.5"
                value={newEntry.deadlift || ''}
                onChange={(e) => setNewEntry({ ...newEntry, deadlift: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-mocha-surface1/60 text-white border border-mocha-blue/30 focus:outline-none focus:ring-2 focus:ring-mocha-pink"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={addEntry}
              className="flex-1 py-3 bg-gradient-to-r from-mocha-pink to-mocha-mauve rounded-lg text-white font-bold hover:shadow-lg transition-shadow"
            >
              Save Entry 💪
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-mocha-surface1/60 rounded-lg text-white font-semibold hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
