import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sendMessage,
  parseActions,
  type ChatMessage,
  type ChatAction,
  type ChatContext,
} from './chatbot'

// Mock fetch globally
global.fetch = vi.fn()

describe('Chatbot Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendMessage', () => {
    it('sends message to LLM API with context', async () => {
      const mockResponse = {
        message: 'I\'ll create that task for you.',
        actions: [
          {
            type: 'create_task',
            data: {
              title: 'Read ATLAS paper',
              type: 'long_term',
              pause_on_away: false,
            },
          },
        ],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const context: ChatContext = {
        tasks: [],
        currentTab: 'tasks',
      }

      const result = await sendMessage('Add a task to read ATLAS paper', context)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('read ATLAS paper'),
        })
      )

      expect(result.message).toBe('I\'ll create that task for you.')
      expect(result.actions).toHaveLength(1)
    })

    it('includes conversation history in request', async () => {
      const mockResponse = {
        message: 'Got it!',
        actions: [],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const history: ChatMessage[] = [
        { role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
        { role: 'assistant', content: 'Hi!', timestamp: new Date().toISOString() },
      ]

      const context: ChatContext = {
        tasks: [],
        currentTab: 'tasks',
        history,
      }

      await sendMessage('How are you?', context)

      const callArgs = (global.fetch as any).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)

      expect(requestBody.history).toBeDefined()
      expect(requestBody.history).toHaveLength(2)
    })

    it('handles API errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const context: ChatContext = {
        tasks: [],
        currentTab: 'tasks',
      }

      await expect(sendMessage('Test', context)).rejects.toThrow('Network error')
    })

    it('handles non-ok responses', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const context: ChatContext = {
        tasks: [],
        currentTab: 'tasks',
      }

      await expect(sendMessage('Test', context)).rejects.toThrow()
    })

    it('includes current context in request', async () => {
      const mockResponse = {
        message: 'Okay',
        actions: [],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const context: ChatContext = {
        tasks: [
          {
            id: 1,
            title: 'Existing task',
            type: 'daily',
            status: 'pending',
          },
        ],
        currentTab: 'gym',
        arxivPapers: [
          {
            id: 'arxiv:123',
            title: 'Test Paper',
            authors: ['Author'],
          },
        ],
      }

      await sendMessage('What tasks do I have?', context)

      const callArgs = (global.fetch as any).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)

      expect(requestBody.context.tasks).toHaveLength(1)
      expect(requestBody.context.currentTab).toBe('gym')
      expect(requestBody.context.arxivPapers).toHaveLength(1)
    })
  })

  describe('parseActions', () => {
    it('parses create_task action', () => {
      const response = {
        message: 'Task created',
        actions: [
          {
            type: 'create_task',
            data: {
              title: 'Read paper',
              description: 'Read the ATLAS paper',
              type: 'long_term',
              pause_on_away: false,
            },
          },
        ],
      }

      const actions = parseActions(response)

      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('create_task')
      expect(actions[0].data.title).toBe('Read paper')
    })

    it('parses log_gym action', () => {
      const response = {
        message: 'Logged workout',
        actions: [
          {
            type: 'log_gym',
            data: {
              exercise: 'Bench Press',
              sets: 3,
              reps: 10,
              weight: 100,
            },
          },
        ],
      }

      const actions = parseActions(response)

      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('log_gym')
      expect(actions[0].data.exercise).toBe('Bench Press')
    })

    it('parses search_arxiv action', () => {
      const response = {
        message: 'Searching papers',
        actions: [
          {
            type: 'search_arxiv',
            query: 'axion-like particles',
          },
        ],
      }

      const actions = parseActions(response)

      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('search_arxiv')
      expect(actions[0].query).toBe('axion-like particles')
    })

    it('parses sync_to_calendar action', () => {
      const response = {
        message: 'Syncing to calendar',
        actions: [
          {
            type: 'sync_to_calendar',
            taskId: 42,
          },
        ],
      }

      const actions = parseActions(response)

      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('sync_to_calendar')
      expect(actions[0].taskId).toBe(42)
    })

    it('parses start_timer action', () => {
      const response = {
        message: 'Starting timer',
        actions: [
          {
            type: 'start_timer',
            taskId: 5,
          },
        ],
      }

      const actions = parseActions(response)

      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('start_timer')
      expect(actions[0].taskId).toBe(5)
    })

    it('parses query_tasks action', () => {
      const response = {
        message: 'Here are your tasks',
        actions: [
          {
            type: 'query_tasks',
            filter: 'pending',
          },
        ],
      }

      const actions = parseActions(response)

      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('query_tasks')
      expect(actions[0].filter).toBe('pending')
    })

    it('parses multiple actions', () => {
      const response = {
        message: 'Done',
        actions: [
          { type: 'create_task', data: { title: 'Task 1' } },
          { type: 'create_task', data: { title: 'Task 2' } },
        ],
      }

      const actions = parseActions(response)

      expect(actions).toHaveLength(2)
      expect(actions[0].type).toBe('create_task')
      expect(actions[1].type).toBe('create_task')
    })

    it('handles responses with no actions', () => {
      const response = {
        message: 'Just a message',
        actions: [],
      }

      const actions = parseActions(response)

      expect(actions).toHaveLength(0)
    })

    it('validates action structure', () => {
      const response = {
        message: 'Test',
        actions: [
          { type: 'invalid_action' },
        ],
      }

      expect(() => parseActions(response)).toThrow()
    })
  })

  describe('Action Validation', () => {
    it('validates create_task action has required fields', () => {
      const response = {
        message: 'Test',
        actions: [
          {
            type: 'create_task',
            data: {}, // Missing required fields
          },
        ],
      }

      expect(() => parseActions(response)).toThrow()
    })

    it('validates log_gym action has required fields', () => {
      const response = {
        message: 'Test',
        actions: [
          {
            type: 'log_gym',
            data: { exercise: 'Test' }, // Missing other required fields
          },
        ],
      }

      expect(() => parseActions(response)).toThrow()
    })

    it('validates search_arxiv action has query', () => {
      const response = {
        message: 'Test',
        actions: [
          {
            type: 'search_arxiv',
            // Missing query
          },
        ],
      }

      expect(() => parseActions(response)).toThrow()
    })
  })

  describe('Context Management', () => {
    it('formats context for LLM consumption', async () => {
      const mockResponse = {
        message: 'Got it',
        actions: [],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const context: ChatContext = {
        tasks: [
          {
            id: 1,
            title: 'Task 1',
            type: 'daily',
            status: 'pending',
            due_date: '2024-01-20',
          },
          {
            id: 2,
            title: 'Task 2',
            type: 'weekly',
            status: 'completed',
          },
        ],
        currentTab: 'tasks',
      }

      await sendMessage('Show me my tasks', context)

      const callArgs = (global.fetch as any).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)

      expect(requestBody.context).toBeDefined()
      expect(requestBody.context.taskCount).toBe(2)
      expect(requestBody.context.pendingTasks).toBe(1)
      expect(requestBody.context.completedTasks).toBe(1)
    })
  })
})
