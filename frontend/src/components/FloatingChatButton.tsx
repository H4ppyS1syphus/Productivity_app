import { motion } from 'framer-motion'

interface FloatingChatButtonProps {
  onClick: () => void
  hasUnread?: boolean
}

export function FloatingChatButton({ onClick, hasUnread = false }: FloatingChatButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-br from-mocha-blue to-mocha-mauve rounded-full shadow-2xl flex items-center justify-center text-white z-40 hover:shadow-mocha-blue/50 transition-shadow"
      title="Open AI Assistant"
      aria-label="Open AI Assistant chat"
    >
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>

      {hasUnread && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-mocha-red rounded-full border-2 border-mocha-base"
        />
      )}
    </motion.button>
  )
}
