import { format, formatDistanceToNow, isPast } from 'date-fns'
import { type Task } from '@/services/api'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (task: Task) => void
  onDelete: (taskId: number) => void
  filter?: 'all' | 'daily' | 'weekly' | 'long_term' | 'gym_workout' | 'pending' | 'completed'
}

export function TaskList({ tasks, onToggleComplete, onDelete, filter = 'all' }: TaskListProps) {
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'pending' || filter === 'completed') {
      return task.status === filter
    }
    return task.type === filter
  })

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No tasks found. Create one to get started!
        </p>
      </div>
    )
  }

  const getTaskTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'weekly':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      case 'long_term':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'gym_workout':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
    }
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const isOverdue = isPast(date) && !tasks.find(t => t.due_date === dueDate)?.completed_at

    return (
      <span className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
        {isOverdue ? '⚠️ Overdue: ' : '📅 Due: '}
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md
                   transition-shadow duration-200 p-4 flex items-start gap-4"
        >
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(task)}
            className="flex-shrink-0 mt-1"
          >
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center
                        ${task.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'}`}
            >
              {task.status === 'completed' && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-lg ${task.status === 'completed'
              ? 'line-through text-gray-500 dark:text-gray-500'
              : 'text-gray-900 dark:text-white'}`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded ${getTaskTypeColor(task.type)}`}>
                {task.type.replace('_', ' ')}
              </span>
              {task.due_date && formatDueDate(task.due_date)}
              {task.pause_on_away && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700
                               text-gray-600 dark:text-gray-400 rounded">
                  ✈️ Pauses when away
                </span>
              )}
            </div>
            {task.completed_at && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ✓ Completed {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
              </p>
            )}
          </div>

          {/* Delete button */}
          <button
            onClick={() => onDelete(task.id)}
            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
