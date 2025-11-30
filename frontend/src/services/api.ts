/**
 * API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'long_term' | 'gym_workout';
  status: 'pending' | 'completed' | 'suggested';
  pause_on_away: boolean;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  recurrence?: string;
  calendar_event_id?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  type?: 'daily' | 'weekly' | 'long_term' | 'gym_workout';
  pause_on_away?: boolean;
  due_date?: string;
  recurrence?: string;
}

export interface TaskList {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // Task endpoints
  async getTasks(params?: {
    skip?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'suggested';
  }): Promise<TaskList> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.set('skip', params.skip.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`;

    return this.request<TaskList>(endpoint);
  }

  async createTask(task: TaskCreate): Promise<Task> {
    return this.request<Task>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async getTask(taskId: number): Promise<Task> {
    return this.request<Task>(`/api/tasks/${taskId}`);
  }

  async completeTask(taskId: number): Promise<Task> {
    return this.request<Task>(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
    });
  }

  async uncompleteTask(taskId: number): Promise<Task> {
    return this.request<Task>(`/api/tasks/${taskId}/uncomplete`, {
      method: 'POST',
    });
  }

  async deleteTask(taskId: number): Promise<void> {
    return this.request<void>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new APIClient(API_BASE_URL);
