/**
 * Google Calendar API service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  htmlLink?: string;
  created?: string;
  updated?: string;
}

export interface CalendarAuthStatus {
  is_authorized: boolean;
  scopes: string[];
  email?: string;
}

export interface TaskSyncResponse {
  task_id: number;
  calendar_event_id: string;
  message: string;
}

class CalendarService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/+$/, "");
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Check if user has authorized Google Calendar access
   */
  async checkAuthStatus(): Promise<CalendarAuthStatus> {
    return this.request<CalendarAuthStatus>('/api/calendar/status');
  }

  /**
   * Fetch calendar events
   */
  async getEvents(params?: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }): Promise<{ events: CalendarEvent[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.timeMin) queryParams.append('time_min', params.timeMin);
    if (params?.timeMax) queryParams.append('time_max', params.timeMax);
    if (params?.maxResults) queryParams.append('max_results', params.maxResults.toString());

    const query = queryParams.toString();
    return this.request<{ events: CalendarEvent[]; total: number }>(
      `/api/calendar/events${query ? `?${query}` : ''}`
    );
  }

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time?: string;
  }): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('/api/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, eventData: {
    title?: string;
    description?: string;
    location?: string;
    start_time?: string;
    end_time?: string;
  }): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(`/api/calendar/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    return this.request<void>(`/api/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Sync a task to Google Calendar
   */
  async syncTask(taskId: number, startTime?: string): Promise<TaskSyncResponse> {
    return this.request<TaskSyncResponse>('/api/calendar/sync-task', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId, start_time: startTime }),
    });
  }

  /**
   * Remove calendar sync from a task
   */
  async unsyncTask(taskId: number): Promise<void> {
    return this.request<void>(`/api/calendar/unsync-task/${taskId}`, {
      method: 'POST',
    });
  }
}

export const calendarService = new CalendarService(API_BASE_URL);
