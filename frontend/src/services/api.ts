/**
 * API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'long_term' | 'gym_workout';
  status: 'pending' | 'completed' | 'suggested';
  pause_on_away: boolean;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  recurrence?: string;
  calendar_event_id?: string;

  // Recurring task fields
  is_recurring: boolean;
  recurrence_time?: string; // Time in HH:MM:SS format
  recurrence_day_of_week?: number; // 0-6 (Monday-Sunday)
  recurrence_day_of_month?: number; // 1-31
  last_reset_date?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  type?: 'daily' | 'weekly' | 'monthly' | 'long_term' | 'gym_workout';
  pause_on_away?: boolean;
  due_date?: string;
  recurrence?: string;

  // Recurring task fields
  is_recurring?: boolean;
  recurrence_time?: string; // Time in HH:MM:SS format
  recurrence_day_of_week?: number; // 0-6 (Monday-Sunday)
  recurrence_day_of_month?: number; // 1-31
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  type?: 'daily' | 'weekly' | 'monthly' | 'long_term' | 'gym_workout';
  pause_on_away?: boolean;
  due_date?: string;
  recurrence?: string;

  // Recurring task fields
  is_recurring?: boolean;
  recurrence_time?: string; // Time in HH:MM:SS format
  recurrence_day_of_week?: number; // 0-6 (Monday-Sunday)
  recurrence_day_of_month?: number; // 1-31
}

export interface TaskList {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
}

export interface AwayPeriod {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface AwayPeriodCreate {
  start_date: string;
  end_date: string;
}

export interface AwayPeriodList {
  away_periods: AwayPeriod[];
  current_away_period: AwayPeriod | null;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/+$/, ""); // remove trailing slashes
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    }

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

  async updateTask(taskId: number, updates: TaskUpdate): Promise<Task> {
    return this.request<Task>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: number): Promise<void> {
    return this.request<void>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Away period endpoints
  async getAwayPeriods(params?: {
    skip?: number;
    limit?: number;
  }): Promise<AwayPeriodList> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.set('skip', params.skip.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/away-periods${queryString ? `?${queryString}` : ''}`;

    return this.request<AwayPeriodList>(endpoint);
  }

  async createAwayPeriod(period: AwayPeriodCreate): Promise<AwayPeriod> {
    return this.request<AwayPeriod>('/api/away-periods/', {
      method: 'POST',
      body: JSON.stringify(period),
    });
  }

  async deactivateAwayPeriod(periodId: number): Promise<AwayPeriod> {
    return this.request<AwayPeriod>(`/api/away-periods/${periodId}/deactivate`, {
      method: 'POST',
    });
  }

  async deleteAwayPeriod(periodId: number): Promise<void> {
    return this.request<void>(`/api/away-periods/${periodId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new APIClient(API_BASE_URL);
