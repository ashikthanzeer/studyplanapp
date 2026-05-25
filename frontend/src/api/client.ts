import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add Authorization token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expiry (401)
client.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('auth_token');
  }
  return Promise.reject(error);
});

// Auth endpoints
export async function register(payload: any) {
  const res = await client.post('/auth/register', payload);
  return res.data;
}

export async function login(payload: any) {
  const res = await client.post('/auth/login', payload);
  return res.data;
}

export async function logout() {
  const res = await client.post('/auth/logout');
  return res.data;
}

export async function getUserProfile() {
  const res = await client.get('/auth/profile');
  return res.data;
}

// Student Profile endpoints
export async function getStudentProfile() {
  const res = await client.get('/profile');
  return res.data;
}

export async function updateStudentProfile(payload: any) {
  const res = await client.put('/profile', payload);
  return res.data;
}

export async function getPreferences() {
  const res = await client.get('/profile/preferences');
  return res.data;
}

export async function updatePreferences(payload: any) {
  const res = await client.put('/profile/preferences', payload);
  return res.data;
}

export async function getGamification() {
  const res = await client.get('/profile/gamification');
  return res.data;
}

// Subjects endpoints
export async function getSubjects() {
  const res = await client.get('/subjects');
  return res.data;
}

export async function createSubject(payload: any) {
  const res = await client.post('/subjects', payload);
  return res.data;
}

export async function deleteSubject(id: number) {
  const res = await client.delete(`/subjects/${id}`);
  return res.data;
}

// Tasks endpoints
export async function getTasks(params?: any) {
  const res = await client.get('/tasks', { params });
  return res.data;
}

export async function createTask(payload: any) {
  const res = await client.post('/tasks', payload);
  return res.data;
}

export async function getTask(id: number) {
  const res = await client.get(`/tasks/${id}`);
  return res.data;
}

export async function updateTask(id: number, payload: any) {
  const res = await client.put(`/tasks/${id}`, payload);
  return res.data;
}

export async function deleteTask(id: number) {
  const res = await client.delete(`/tasks/${id}`);
  return res.data;
}

// Pomodoro endpoints
export async function startPomodoroSession(payload: { task_id?: number; duration_minutes?: number }) {
  const res = await client.post('/pomodoro/start', payload);
  return res.data;
}

export async function completePomodoroSession(sessionId: number) {
  const res = await client.put(`/pomodoro/${sessionId}/complete`);
  return res.data;
}

export async function abandonPomodoroSession(sessionId: number) {
  const res = await client.put(`/pomodoro/${sessionId}/abandon`);
  return res.data;
}

export async function getPomodoroHistory(params?: any) {
  const res = await client.get('/pomodoro/history', { params });
  return res.data;
}

export async function getPomodoroStats(params?: any) {
  const res = await client.get('/pomodoro/stats', { params });
  return res.data;
}

// Kanban endpoints
export async function getKanbanColumns() {
  const res = await client.get('/kanban/columns');
  return res.data;
}

export async function createKanbanColumn(payload: { name: string }) {
  const res = await client.post('/kanban/columns', payload);
  return res.data;
}

export async function updateKanbanColumn(id: number, payload: { name?: string; position?: number }) {
  const res = await client.put(`/kanban/columns/${id}`, payload);
  return res.data;
}

export async function deleteKanbanColumn(id: number) {
  const res = await client.delete(`/kanban/columns/${id}`);
  return res.data;
}

export async function moveTaskToColumn(payload: { columnId: number; taskId: number; position: number }) {
  const res = await client.post('/kanban/move-task', payload);
  return res.data;
}

export async function getColumnTasks(columnId: number) {
  const res = await client.get(`/kanban/columns/${columnId}/tasks`);
  return res.data;
}

export default client;
