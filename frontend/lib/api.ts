/**
 * API client for communicating with the backend
 */
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ============= Auth API =============
export const authAPI = {
  signup: async (data: {
    username: string;
    email: string;
    password: string;
    role: 'teacher' | 'student';
    name: string;
    phone?: string;
    subject?: string;
    parent_contact?: string;
    teams_id?: string;
  }) => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  forgotPassword: async (username: string) => {
    const response = await api.post('/api/auth/forgot-password', { username });
    return response.data;
  },
  resetPassword: async (username: string, new_password: string) => {
    const response = await api.post('/api/auth/reset-password', { username, new_password });
    return response.data;
  },
};

// ============= Teachers API =============
export const teachersAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/teachers/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/teachers/${id}`);
    return response.data;
  },
  getStats: async (id: number) => {
    const response = await api.get(`/api/teachers/${id}/stats`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/teachers/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/api/teachers/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/teachers/${id}`);
    return response.data;
  },
};

// ============= Students API =============
export const studentsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/students/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/students/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/students/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/api/students/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/students/${id}`);
    return response.data;
  },
};

// ============= Lessons API =============
export const lessonsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/lessons/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/lessons/${id}`);
    return response.data;
  },
  start: async (studentId: number, teacherId: number) => {
    const response = await api.post('/api/lessons/start', { student_id: studentId, teacher_id: teacherId });
    return response.data;
  },
  stop: async (lessonId: number) => {
    const response = await api.post('/api/lessons/end', { lesson_id: lessonId });
    return response.data;
  },
  end: async (lessonId: number) => {
    const response = await api.post('/api/lessons/end', { lesson_id: lessonId });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/lessons/', data);
    return response.data;
  },
};

// ============= Payments API =============
export const paymentsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/payments/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/payments/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/payments/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/api/payments/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/payments/${id}`);
    return response.data;
  },
  markPaid: async (id: number) => {
    const response = await api.post(`/api/payments/${id}/mark-paid`);
    return response.data;
  },
};

// ============= Dashboard API =============
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
  getTeacherHours: async () => {
    const response = await api.get('/api/dashboard/teacher-hours');
    return response.data;
  },
  getStudentHistory: async () => {
    const response = await api.get('/api/dashboard/student-history');
    return response.data;
  },
  getTeacherDashboard: async () => {
    const response = await api.get('/api/dashboard/teacher/me');
    return response.data;
  },
  getStudentDashboard: async () => {
    const response = await api.get('/api/dashboard/student/me');
    return response.data;
  },
};

// ============= Achievements API =============
export const achievementsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/achievements/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/achievements/${id}`);
    return response.data;
  },
  create: async (data: {
    student_id: number;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => {
    const response = await api.post('/api/achievements/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/api/achievements/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/achievements/${id}`);
    return response.data;
  },
};

// ============= Messages API =============
export const messagesAPI = {
  send: async (data: { receiver_id: number; message: string }) => {
    const response = await api.post('/api/messages/', data);
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/api/messages/conversations');
    return response.data;
  },
  getMessagesWith: async (userId: number) => {
    const response = await api.get(`/api/messages/with/${userId}`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/api/messages/unread-count');
    return response.data;
  },
  markAsRead: async (userId: number) => {
    const response = await api.post(`/api/messages/mark-read/${userId}`);
    return response.data;
  },
};
