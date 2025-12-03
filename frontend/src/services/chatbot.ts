import { type TaskCreate } from './api'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface ChatContext {
  tasks?: Array<{
    id: number
    title: string
    type: string
    status: string
    due_date?: string
  }>
  currentTab?: string
  arxivPapers?: Array<{
    id: string
    title: string
    authors: string[]
  }>
  history?: ChatMessage[]
}

export type ChatAction =
  | { type: 'create_task'; data: TaskCreate }
  | { type: 'log_gym'; data: GymWorkout }
  | { type: 'search_arxiv'; query: string }
  | { type: 'sync_to_calendar'; taskId: number }
  | { type: 'start_timer'; taskId: number }
  | { type: 'query_tasks'; filter?: string }

export interface GymWorkout {
  exercise: string
  sets: number
  reps: number
  weight?: number
  notes?: string
}

export interface ChatResponse {
  message: string
  actions: ChatAction[]
}

/**
 * Sends a message to the LLM chatbot API
 * @param message - User's message
 * @param context - Current application context
 * @returns ChatResponse with message and actions
 */
export async function sendMessage(
  message: string,
  context: ChatContext
): Promise<ChatResponse> {
  try {
    // Format context for LLM
    const formattedContext = formatContext(context)

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: formattedContext,
        history: context.history || [],
      }),
    })

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status} ${response.statusText}`)
    }

    const data: ChatResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to send message to chatbot')
  }
}

/**
 * Formats application context for LLM consumption
 */
function formatContext(context: ChatContext) {
  const formatted: any = {
    currentTab: context.currentTab || 'unknown',
  }

  if (context.tasks) {
    formatted.taskCount = context.tasks.length
    formatted.pendingTasks = context.tasks.filter(t => t.status === 'pending').length
    formatted.completedTasks = context.tasks.filter(t => t.status === 'completed').length
    formatted.tasks = context.tasks.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      status: t.status,
      dueDate: t.due_date,
    }))
  }

  if (context.arxivPapers) {
    formatted.arxivPapers = context.arxivPapers.map(p => ({
      id: p.id,
      title: p.title,
      authors: p.authors.slice(0, 3).join(', '), // First 3 authors
    }))
  }

  return formatted
}

/**
 * Parses actions from LLM response
 * @param response - Response from LLM
 * @returns Array of parsed actions
 */
export function parseActions(response: ChatResponse): ChatAction[] {
  if (!response.actions || response.actions.length === 0) {
    return []
  }

  return response.actions.map(action => {
    validateAction(action)
    return action
  })
}

/**
 * Validates action structure and required fields
 */
function validateAction(action: ChatAction): void {
  switch (action.type) {
    case 'create_task':
      if (!action.data || !action.data.title) {
        throw new Error('create_task action requires title')
      }
      // Validate task type includes 'once'
      const validTypes = ['daily', 'weekly', 'monthly', 'long_term', 'gym_workout', 'once']
      if (action.data.type && !validTypes.includes(action.data.type)) {
        throw new Error(`Invalid task type: ${action.data.type}`)
      }
      break

    case 'log_gym':
      if (!action.data || !action.data.exercise || !action.data.sets || !action.data.reps) {
        throw new Error('log_gym action requires exercise, sets, and reps')
      }
      break

    case 'search_arxiv':
      if (!action.query) {
        throw new Error('search_arxiv action requires query')
      }
      break

    case 'sync_to_calendar':
      if (!action.taskId) {
        throw new Error('sync_to_calendar action requires taskId')
      }
      break

    case 'start_timer':
      if (!action.taskId) {
        throw new Error('start_timer action requires taskId')
      }
      break

    case 'query_tasks':
      // Optional filter
      break

    default:
      throw new Error(`Unknown action type: ${(action as any).type}`)
  }
}

/**
 * Executes a chat action
 * @param action - Action to execute
 * @param handlers - Action handlers from the app
 */
export async function executeAction(
  action: ChatAction,
  handlers: {
    onCreateTask?: (data: TaskCreate) => Promise<void>
    onLogGym?: (data: GymWorkout) => Promise<void>
    onSearchArxiv?: (query: string) => Promise<void>
    onSyncToCalendar?: (taskId: number) => Promise<void>
    onStartTimer?: (taskId: number) => Promise<void>
    onQueryTasks?: (filter?: string) => Promise<void>
  }
): Promise<string> {
  switch (action.type) {
    case 'create_task':
      if (handlers.onCreateTask) {
        await handlers.onCreateTask(action.data)
        return `✅ Task "${action.data.title}" created successfully`
      }
      return '❌ Task creation handler not available'

    case 'log_gym':
      if (handlers.onLogGym) {
        await handlers.onLogGym(action.data)
        return `✅ Logged ${action.data.exercise}: ${action.data.sets}x${action.data.reps}`
      }
      return '❌ Gym logging handler not available'

    case 'search_arxiv':
      if (handlers.onSearchArxiv) {
        await handlers.onSearchArxiv(action.query)
        return `✅ Searching for: ${action.query}`
      }
      return '❌ arXiv search handler not available'

    case 'sync_to_calendar':
      if (handlers.onSyncToCalendar) {
        await handlers.onSyncToCalendar(action.taskId)
        return `✅ Task synced to calendar`
      }
      return '❌ Calendar sync handler not available'

    case 'start_timer':
      if (handlers.onStartTimer) {
        await handlers.onStartTimer(action.taskId)
        return `✅ Timer started`
      }
      return '❌ Timer handler not available'

    case 'query_tasks':
      if (handlers.onQueryTasks) {
        await handlers.onQueryTasks(action.filter)
        return '✅ Showing tasks'
      }
      return '❌ Query tasks handler not available'

    default:
      return '❌ Unknown action type'
  }
}
