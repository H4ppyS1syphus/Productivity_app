import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type ChatMessage } from '@/services/chatbot'

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
  initialMessages?: ChatMessage[]
  onSendMessage?: (message: string) => void
  isLoading?: boolean
  error?: string
  onRetry?: () => void
}

export function ChatInterface({
  isOpen,
  onClose,
  initialMessages = [],
  onSendMessage,
  isLoading = false,
  error,
  onRetry,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [initialMessages])

  // Hide quick actions when typing
  useEffect(() => {
    setShowQuickActions(input.trim() === '')
  }, [input])

  const handleSend = () => {
    if (!input.trim() || isLoading) return

    onSendMessage?.(input)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (message: string) => {
    onSendMessage?.(message)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-label="AI Assistant chat"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-20 w-96 h-[32rem] bg-mocha-surface0 rounded-2xl shadow-2xl border border-mocha-surface1 flex flex-col z-50 md:left-20 md:w-96 max-md:left-6 max-md:right-6 max-md:w-auto max-md:inset-x-6 max-md:h-[70vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-mocha-surface1">
            <h2 className="text-lg font-bold text-mocha-text">AI Assistant</h2>
            <button
              onClick={onClose}
              className="text-mocha-subtext0 hover:text-mocha-text transition-colors"
              title="Close chat"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {initialMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-mocha-blue text-white'
                      : message.role === 'system'
                      ? 'bg-mocha-green/20 text-mocha-green'
                      : 'bg-mocha-surface1 text-mocha-text'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-mocha-surface1 rounded-xl px-4 py-3">
                  <div role="status" aria-label="typing" className="flex space-x-2">
                    <div className="w-2 h-2 bg-mocha-text rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-mocha-text rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-mocha-text rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-xs text-mocha-subtext0 mt-1">AI is typing...</p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-mocha-red/20 border border-mocha-red/50 rounded-xl px-4 py-3">
                <p className="text-sm text-mocha-red">{error}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="text-xs text-mocha-red underline mt-2"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <AnimatePresence>
            {showQuickActions && initialMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-2 space-y-2"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickAction('Help me add a new task')}
                    className="px-3 py-1.5 bg-mocha-surface1 hover:bg-mocha-surface2 rounded-lg text-xs text-mocha-text transition-colors"
                  >
                    📋 Add Task
                  </button>
                  <button
                    onClick={() => handleQuickAction('I want to log a gym workout')}
                    className="px-3 py-1.5 bg-mocha-surface1 hover:bg-mocha-surface2 rounded-lg text-xs text-mocha-text transition-colors"
                  >
                    💪 Log Workout
                  </button>
                  <button
                    onClick={() => handleQuickAction('Search for recent arXiv papers on machine learning')}
                    className="px-3 py-1.5 bg-mocha-surface1 hover:bg-mocha-surface2 rounded-lg text-xs text-mocha-text transition-colors"
                  >
                    🔬 Search Papers
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="p-4 border-t border-mocha-surface1">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={isLoading}
                aria-label="Chat message input"
                className="flex-1 bg-mocha-surface1 text-mocha-text rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mocha-blue disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="bg-mocha-blue hover:bg-mocha-sapphire text-white rounded-xl px-4 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
