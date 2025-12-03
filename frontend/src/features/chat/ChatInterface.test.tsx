import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatInterface } from './ChatInterface'
import { type ChatMessage } from '@/services/chatbot'

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders chat interface when open', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(<ChatInterface isOpen={false} onClose={vi.fn()} />)

      expect(screen.queryByPlaceholderText(/Type a message/i)).not.toBeInTheDocument()
    })

    it('displays chat title', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument()
    })

    it('has close button', () => {
      const onClose = vi.fn()
      render(<ChatInterface isOpen={true} onClose={onClose} />)

      const closeButton = screen.getByTitle(/Close chat/i)
      expect(closeButton).toBeInTheDocument()

      fireEvent.click(closeButton)
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Message Display', () => {
    it('displays message history', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
        { role: 'assistant', content: 'Hi there!', timestamp: new Date().toISOString() },
      ]

      render(<ChatInterface isOpen={true} onClose={vi.fn()} initialMessages={messages} />)

      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hi there!')).toBeInTheDocument()
    })

    it('distinguishes between user and assistant messages', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'User message', timestamp: new Date().toISOString() },
        { role: 'assistant', content: 'Assistant message', timestamp: new Date().toISOString() },
      ]

      render(<ChatInterface isOpen={true} onClose={vi.fn()} initialMessages={messages} />)

      const userMessage = screen.getByText('User message').closest('div')
      const assistantMessage = screen.getByText('Assistant message').closest('div')

      // User messages should have different styling
      expect(userMessage?.className).toMatch(/user|right|blue/i)
      expect(assistantMessage?.className).toMatch(/assistant|left|gray/i)
    })

    it('displays timestamps for messages', () => {
      const now = new Date()
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test', timestamp: now.toISOString() },
      ]

      render(<ChatInterface isOpen={true} onClose={vi.fn()} initialMessages={messages} />)

      // Should display time in format like "10:30 AM"
      expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument()
    })

    it('auto-scrolls to latest message', async () => {
      const { rerender } = render(<ChatInterface isOpen={true} onClose={vi.fn()} initialMessages={[]} />)

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Message 1', timestamp: new Date().toISOString() },
        { role: 'assistant', content: 'Message 2', timestamp: new Date().toISOString() },
        { role: 'user', content: 'Message 3', timestamp: new Date().toISOString() },
      ]

      rerender(<ChatInterface isOpen={true} onClose={vi.fn()} initialMessages={messages} />)

      // Latest message should be visible
      await waitFor(() => {
        expect(screen.getByText('Message 3')).toBeVisible()
      })
    })
  })

  describe('Sending Messages', () => {
    it('can type and send message', async () => {
      const onSendMessage = vi.fn()
      render(<ChatInterface isOpen={true} onClose={vi.fn()} onSendMessage={onSendMessage} />)

      const input = screen.getByPlaceholderText(/Type a message/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Hello AI' } })
      fireEvent.click(sendButton)

      expect(onSendMessage).toHaveBeenCalledWith('Hello AI')
    })

    it('clears input after sending', async () => {
      const onSendMessage = vi.fn()
      render(<ChatInterface isOpen={true} onClose={vi.fn()} onSendMessage={onSendMessage} />)

      const input = screen.getByPlaceholderText(/Type a message/i) as HTMLInputElement
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('can send message with Enter key', async () => {
      const onSendMessage = vi.fn()
      render(<ChatInterface isOpen={true} onClose={vi.fn()} onSendMessage={onSendMessage} />)

      const input = screen.getByPlaceholderText(/Type a message/i)

      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(onSendMessage).toHaveBeenCalledWith('Test')
    })

    it('does not send empty messages', () => {
      const onSendMessage = vi.fn()
      render(<ChatInterface isOpen={true} onClose={vi.fn()} onSendMessage={onSendMessage} />)

      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.click(sendButton)

      expect(onSendMessage).not.toHaveBeenCalled()
    })

    it('disables send button while loading', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} isLoading={true} />)

      const sendButton = screen.getByRole('button', { name: /send/i })

      expect(sendButton).toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('shows typing indicator when loading', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} isLoading={true} />)

      expect(screen.getByText(/typing/i)).toBeInTheDocument()
    })

    it('shows loading animation', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} isLoading={true} />)

      const loadingIndicator = screen.getByRole('status', { hidden: true })
      expect(loadingIndicator).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays error message', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} error="Failed to send message" />)

      expect(screen.getByText(/Failed to send message/i)).toBeInTheDocument()
    })

    it('shows retry button on error', () => {
      const onRetry = vi.fn()
      render(<ChatInterface isOpen={true} onClose={vi.fn()} error="Error" onRetry={onRetry} />)

      const retryButton = screen.getByText(/Retry/i)
      fireEvent.click(retryButton)

      expect(onRetry).toHaveBeenCalled()
    })

    it('clears error on new message', async () => {
      const { rerender } = render(<ChatInterface isOpen={true} onClose={vi.fn()} error="Error" />)

      expect(screen.getByText(/Error/i)).toBeInTheDocument()

      rerender(<ChatInterface isOpen={true} onClose={vi.fn()} error={undefined} />)

      await waitFor(() => {
        expect(screen.queryByText(/Error/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Quick Actions', () => {
    it('displays quick action buttons', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByText(/Add Task/i)).toBeInTheDocument()
      expect(screen.getByText(/Log Workout/i)).toBeInTheDocument()
      expect(screen.getByText(/Search Papers/i)).toBeInTheDocument()
    })

    it('sends predefined message on quick action click', async () => {
      const onSendMessage = vi.fn()
      render(<ChatInterface isOpen={true} onClose={vi.fn()} onSendMessage={onSendMessage} />)

      const addTaskButton = screen.getByText(/Add Task/i)
      fireEvent.click(addTaskButton)

      expect(onSendMessage).toHaveBeenCalledWith(expect.stringContaining('task'))
    })

    it('hides quick actions when typing', async () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      const input = screen.getByPlaceholderText(/Type a message/i)

      fireEvent.change(input, { target: { value: 'Some text' } })

      await waitFor(() => {
        expect(screen.queryByText(/Add Task/i)).not.toBeVisible()
      })
    })
  })

  describe('Action Feedback', () => {
    it('shows action execution feedback', () => {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: '✅ Task created successfully',
          timestamp: new Date().toISOString(),
        },
      ]

      render(<ChatInterface isOpen={true} onClose={vi.fn()} initialMessages={messages} />)

      expect(screen.getByText(/Task created successfully/i)).toBeInTheDocument()
    })

    it('displays action icons for system messages', () => {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: '✅ Task created',
          timestamp: new Date().toISOString(),
        },
      ]

      render(<ChatInterface isOpen={true} onClose={vi.fn()} initialMessages={messages} />)

      // Should have success icon
      expect(screen.getByText(/✅/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByLabelText(/Chat message input/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Send message/i })).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      const onClose = vi.fn()
      render(<ChatInterface isOpen={true} onClose={onClose} />)

      const closeButton = screen.getByTitle(/Close chat/i)
      closeButton.focus()

      expect(document.activeElement).toBe(closeButton)
    })

    it('has proper heading hierarchy', () => {
      render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent(/AI Assistant/i)
    })
  })

  describe('Responsive Design', () => {
    it('adapts to mobile viewport', () => {
      global.innerWidth = 375
      global.dispatchEvent(new Event('resize'))

      const { container } = render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      // Should use mobile-optimized layout
      const chatContainer = container.querySelector('[class*="chat"]')
      expect(chatContainer).toBeTruthy()
    })

    it('expands to full screen on mobile', () => {
      global.innerWidth = 375

      render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      // On mobile, should take full viewport
      const chatWindow = screen.getByRole('dialog', { hidden: true })
      expect(chatWindow.className).toMatch(/fixed|inset|w-full|h-full/)
    })
  })

  describe('Animation', () => {
    it('animates in when opening', async () => {
      const { rerender } = render(<ChatInterface isOpen={false} onClose={vi.fn()} />)

      rerender(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      await waitFor(() => {
        const chatWindow = screen.getByRole('dialog', { hidden: true })
        expect(chatWindow).toBeVisible()
      })
    })

    it('animates out when closing', async () => {
      const { rerender } = render(<ChatInterface isOpen={true} onClose={vi.fn()} />)

      rerender(<ChatInterface isOpen={false} onClose={vi.fn()} />)

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })
})
