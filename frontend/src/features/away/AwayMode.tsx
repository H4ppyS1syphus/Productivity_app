import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { api, type AwayPeriod } from '@/services/api'

export function AwayMode() {
  const [awayPeriods, setAwayPeriods] = useState<AwayPeriod[]>([])
  const [currentPeriod, setCurrentPeriod] = useState<AwayPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadAwayPeriods()
  }, [])

  const loadAwayPeriods = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getAwayPeriods()
      setAwayPeriods(response.away_periods)
      setCurrentPeriod(response.current_away_period)
    } catch (err) {
      setError('Failed to load away periods')
      console.error('Error loading away periods:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePeriod = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    try {
      const newPeriod = await api.createAwayPeriod({
        start_date: startDate,
        end_date: endDate,
      })
      setAwayPeriods([...awayPeriods, newPeriod])
      setCurrentPeriod(newPeriod)
      setShowForm(false)
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate('')

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#8b5cf6'],
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create away period')
      console.error('Error creating away period:', err)
    }
  }

  const handleEndPeriod = async (periodId: number) => {
    try {
      const updated = await api.deactivateAwayPeriod(periodId)
      setAwayPeriods(awayPeriods.map(p => p.id === periodId ? updated : p))
      setCurrentPeriod(null)
    } catch (err) {
      setError('Failed to end away period')
      console.error('Error ending away period:', err)
    }
  }

  const handleDeletePeriod = async (periodId: number) => {
    try {
      await api.deleteAwayPeriod(periodId)
      setAwayPeriods(awayPeriods.filter(p => p.id !== periodId))
      if (currentPeriod?.id === periodId) {
        setCurrentPeriod(null)
      }
    } catch (err) {
      setError('Failed to delete away period')
      console.error('Error deleting away period:', err)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-white rounded-2xl flex items-center justify-between"
          >
            <span className="font-semibold">{error}</span>
            <button onClick={() => setError(null)} className="text-white/80 hover:text-white text-2xl">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Away Period Banner */}
      <AnimatePresence>
        {currentPeriod && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-6 p-6 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl mb-2">✈️</div>
                <h3 className="text-2xl font-black text-white mb-2">Currently Away</h3>
                <p className="text-white/90 text-lg">
                  {formatDate(currentPeriod.start_date)} → {formatDate(currentPeriod.end_date)}
                </p>
                <p className="text-white/70 text-sm mt-2">
                  Tasks with "Pause on Away" enabled are paused 💤
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEndPeriod(currentPeriod.id)}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-bold hover:bg-white/30 transition-colors"
              >
                End Early
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Away Period Button / Form */}
      {!showForm ? (
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="w-full mb-6 px-6 py-6 bg-gradient-to-r from-neon-cyan to-neon-blue
                   text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-neon-cyan/50
                   transition-all animate-glow"
        >
          ✈️ Plan Away Period
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl"
        >
          <h3 className="text-2xl font-bold text-white mb-4">New Away Period</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/80 mb-2 font-semibold">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-semibold">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              />
            </div>
          </div>
          <div className="bg-neon-blue/20 rounded-xl p-4 mb-4">
            <p className="text-white/80 text-sm">
              💡 <strong>Tip:</strong> Tasks marked with "Pause on Away" will not count toward your streaks during this period.
              Perfect for vacations and travel! 🌴
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreatePeriod}
              className="flex-1 py-3 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
            >
              Create Away Period ✈️
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-white/20 rounded-xl text-white font-semibold hover:bg-white/30 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Away Periods List */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          📅 Away Period History
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full"
            />
            <p className="mt-4 text-white/80 font-semibold">Loading...</p>
          </div>
        ) : awayPeriods.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-white/70 text-lg">No away periods yet</p>
            <p className="text-white/50 text-sm mt-2">Plan your first trip or vacation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {awayPeriods.map((period, index) => (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl ${
                  period.is_active
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 border-2 border-neon-cyan/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{period.is_active ? '✈️' : '🏁'}</span>
                      <span className={`text-sm font-bold ${
                        period.is_active ? 'text-neon-cyan' : 'text-white/50'
                      }`}>
                        {period.is_active ? 'ACTIVE' : 'COMPLETED'}
                      </span>
                    </div>
                    <p className="text-white font-semibold">
                      {formatDate(period.start_date)} → {formatDate(period.end_date)}
                    </p>
                  </div>
                  {!period.is_active && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeletePeriod(period.id)}
                      className="p-2 bg-red-500/20 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      🗑️
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
