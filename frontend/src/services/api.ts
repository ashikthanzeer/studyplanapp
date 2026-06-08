const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = localStorage.getItem('auth_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      let errorMsg = `API Error: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) {
          errorMsg = errJson.error;
        }
      } catch (e) {
        // ignore JSON parsing errors
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth endpoints
  register(email: string, password: string) {
    return this.request('/auth/register', 'POST', { email, password });
  }

  login(email: string, password: string) {
    return this.request('/auth/login', 'POST', { email, password });
  }

  getProfile() {
    return this.request('/auth/profile', 'GET');
  }

  // Tasks endpoints
  getTasks(filters?: any) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/tasks${query ? '?' + query : ''}`, 'GET');
  }

  createTask(task: any) {
    return this.request('/tasks', 'POST', task);
  }

  getTask(id: number) {
    return this.request(`/tasks/${id}`, 'GET');
  }

  updateTask(id: number, task: any) {
    return this.request(`/tasks/${id}`, 'PUT', task);
  }

  deleteTask(id: number) {
    return this.request(`/tasks/${id}`, 'DELETE');
  }

  // Pomodoro endpoints
  startSession(taskId?: number, duration?: number) {
    return this.request('/pomodoro/start', 'POST', {
      task_id: taskId,
      duration_minutes: duration,
    });
  }

  completeSession(sessionId: number) {
    return this.request(`/pomodoro/${sessionId}/complete`, 'PUT');
  }

  abandonSession(sessionId: number) {
    return this.request(`/pomodoro/${sessionId}/abandon`, 'PUT');
  }

  getSessionHistory(filters?: any) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/pomodoro/history${query ? '?' + query : ''}`, 'GET');
  }

  getSessionStats(filters?: any) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/pomodoro/stats${query ? '?' + query : ''}`, 'GET');
  }

  // Kanban endpoints
  getColumns() {
    return this.request('/kanban/columns', 'GET');
  }

  createColumn(name: string) {
    return this.request('/kanban/columns', 'POST', { name });
  }

  updateColumn(id: number, data: any) {
    return this.request(`/kanban/columns/${id}`, 'PUT', data);
  }

  deleteColumn(id: number) {
    return this.request(`/kanban/columns/${id}`, 'DELETE');
  }

  moveTaskToColumn(columnId: number, taskId: number, position: number) {
    return this.request('/kanban/move-task', 'POST', {
      columnId,
      taskId,
      position,
    });
  }

  getColumnTasks(columnId: number) {
    return this.request(`/kanban/columns/${columnId}/tasks`, 'GET');
  }

  // Subject endpoints
  getSubjects() {
    return this.request('/subjects', 'GET');
  }

  createSubject(name: string, color?: string) {
    return this.request('/subjects', 'POST', { name, color });
  }

  deleteSubject(id: number) {
    return this.request(`/subjects/${id}`, 'DELETE');
  }

  // Profile endpoints
  getPreferences() {
    return this.request('/profile/preferences', 'GET');
  }

  updatePreferences(preferences: any) {
    return this.request('/profile/preferences', 'PUT', preferences);
  }

  // OTP & Verification endpoints
  verifyEmail(code: string) {
    return this.request('/auth/verify-email', 'POST', { code });
  }

  resendVerification() {
    return this.request('/auth/resend-verification', 'POST');
  }

  forgotPassword(email: string) {
    return this.request('/auth/forgot-password', 'POST', { email });
  }

  resetPassword(data: any) {
    return this.request('/auth/reset-password', 'POST', data);
  }

  requestEmailChange(newEmail: string) {
    return this.request('/auth/change-email/request', 'POST', { newEmail });
  }

  confirmEmailChange(code: string, newEmail: string) {
    return this.request('/auth/change-email/confirm', 'POST', { code, newEmail });
  }

  requestPasswordChange() {
    return this.request('/auth/change-password/request', 'POST');
  }

  confirmPasswordChange(code: string, newPassword: string) {
    return this.request('/auth/change-password/confirm', 'POST', { code, newPassword });
  }
}

export default new ApiService();
