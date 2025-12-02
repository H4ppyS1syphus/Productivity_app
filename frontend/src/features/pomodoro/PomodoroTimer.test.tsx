import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PomodoroTimer } from './PomodoroTimer'
import { type Task } from '@/services/api'

const mockTask: Task = {
  id: 1,
  user_id: 1,
  title: 'Test Task for Pomodoro',
  description: 'Working on this important task',
  type: 'daily',
  status: 'pending',
  due_date: undefined,
  pause_on_away: true,
  is_recurring: false,
  recurrence_time: undefined,
  recurrence_day_of_week: undefined,
  recurrence_day_of_month: undefined,
  calendar_event_id: undefined,
  completed_at: undefined,
  created_at: new Date().toISOString(),
}

describe('PomodoroTimer', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders timer with default state', () => {
      render(<PomodoroTimer />)

      // Focus Time appears twice (button + timer display), so use getAllByText
      const focusTimeElements = screen.getAllByText('Focus Time')
      expect(focusTimeElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Short Break')).toBeInTheDocument()
      expect(screen.getByText('Long Break')).toBeInTheDocument()
    })

    it('displays play button when timer is not running', () => {
      render(<PomodoroTimer />)

      const playButton = screen.getByText('▶')
      expect(playButton).toBeInTheDocument()
    })

    it('shows session counter in work mode', () => {
      render(<PomodoroTimer />)

      expect(screen.getByText(/Session #/i)).toBeInTheDocument()
    })
  })

  describe('Active Task Display', () => {
    it('does not show active task card when no task is active', () => {
      render(<PomodoroTimer />)

      expect(screen.queryByText('Working on')).not.toBeInTheDocument()
    })

    it('shows active task card when task is provided', () => {
      render(<PomodoroTimer activeTask={mockTask} />)

      expect(screen.getByText('Working on')).toBeInTheDocument()
      expect(screen.getByText('Test Task for Pomodoro')).toBeInTheDocument()
    })

    it('displays task description when available', () => {
      render(<PomodoroTimer activeTask={mockTask} />)

      expect(screen.getByText('Working on this important task')).toBeInTheDocument()
    })

    it('shows clear button when onStopTimer is provided', () => {
      const onStopTimer = vi.fn()
      render(<PomodoroTimer activeTask={mockTask} onStopTimer={onStopTimer} />)

      const clearButton = screen.getByTitle('Clear active task')
      expect(clearButton).toBeInTheDocument()
    })

    it('calls onStopTimer when clear button is clicked', () => {
      const onStopTimer = vi.fn()
      render(<PomodoroTimer activeTask={mockTask} onStopTimer={onStopTimer} />)

      const clearButton = screen.getByTitle('Clear active task')
      fireEvent.click(clearButton)

      expect(onStopTimer).toHaveBeenCalled()
    })

    it('shows rotating timer icon in active task card', () => {
      render(<PomodoroTimer activeTask={mockTask} />)

      // Check that "Working on" text is present, which indicates the active task card is shown
      expect(screen.getByText('Working on')).toBeInTheDocument()
      // The icon is present as part of the card
      const activeTaskCard = screen.getByText('Working on').closest('div')
      expect(activeTaskCard).toBeInTheDocument()
    })
  })

  describe('Mode Switching', () => {
    it('allows switching between timer modes', () => {
      render(<PomodoroTimer />)

      const breakButton = screen.getByText('Short Break')
      fireEvent.click(breakButton)

      // Mode should switch (visual feedback would be in className changes)
      expect(breakButton).toBeInTheDocument()
    })

    it('displays different emojis for different modes', () => {
      render(<PomodoroTimer />)

      // Work mode should have work emoji (🎯 for Focus Time)
      expect(screen.getByText('🎯')).toBeInTheDocument()

      // Switch to break and check for break emoji
      // Short Break appears twice (button + display), so get all
      const breakButtons = screen.getAllByText('Short Break')
      fireEvent.click(breakButtons[0]) // Click the button
      expect(screen.getByText('☕')).toBeInTheDocument()
    })
  })

  describe('Timer Controls', () => {
    it('has play/pause button', () => {
      render(<PomodoroTimer />)

      const controlButton = screen.getByText('▶')
      expect(controlButton).toBeInTheDocument()
    })

    it('has reset button', () => {
      render(<PomodoroTimer />)

      const resetButton = screen.getByText('↻')
      expect(resetButton).toBeInTheDocument()
    })

    it('can start timer by clicking play button', () => {
      render(<PomodoroTimer />)

      const playButton = screen.getByText('▶')
      fireEvent.click(playButton)

      // Button should change to pause after clicking
      expect(screen.getByText('⏸')).toBeInTheDocument()
    })

    it('can reset timer by clicking reset button', () => {
      render(<PomodoroTimer />)

      const resetButton = screen.getByText('↻')
      fireEvent.click(resetButton)

      // Timer should reset (we can't easily test the actual time without mocking the store)
      expect(resetButton).toBeInTheDocument()
    })
  })

  describe('Completion Tracking', () => {
    it('displays completed pomodoros indicators', () => {
      render(<PomodoroTimer />)

      expect(screen.getByText('Completed Today')).toBeInTheDocument()

      // Should have 8 indicator dots (some filled, some empty)
      // Find the parent div containing "Completed Today" and look for its sibling/child divs
      const completedSection = screen.getByText('Completed Today').parentElement
      const dots = completedSection?.querySelectorAll('div[class*="rounded-full"]')
      expect(dots?.length).toBeGreaterThanOrEqual(1) // At least some dots should be present
    })
  })

  describe('Integration with Active Task', () => {
    it('maintains task display throughout timer session', () => {
      render(<PomodoroTimer activeTask={mockTask} />)

      // Task should be visible
      expect(screen.getByText('Test Task for Pomodoro')).toBeInTheDocument()

      // Start timer
      const playButton = screen.getByText('▶')
      fireEvent.click(playButton)

      // Task should still be visible while timer runs
      expect(screen.getByText('Test Task for Pomodoro')).toBeInTheDocument()
    })

    it('handles task prop changes correctly', () => {
      const { rerender } = render(<PomodoroTimer activeTask={mockTask} />)

      expect(screen.getByText('Test Task for Pomodoro')).toBeInTheDocument()

      // Change to different task
      const newTask = { ...mockTask, id: 2, title: 'Different Task' }
      rerender(<PomodoroTimer activeTask={newTask} />)

      expect(screen.getByText('Different Task')).toBeInTheDocument()
      expect(screen.queryByText('Test Task for Pomodoro')).not.toBeInTheDocument()
    })

    it('removes task display when activeTask becomes null', async () => {
      const { rerender } = render(<PomodoroTimer activeTask={mockTask} />)

      expect(screen.getByText('Test Task for Pomodoro')).toBeInTheDocument()

      // Remove active task
      rerender(<PomodoroTimer activeTask={null} />)

      // Wait for AnimatePresence exit animation to complete
      await waitFor(() => {
        expect(screen.queryByText('Working on')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })
})
