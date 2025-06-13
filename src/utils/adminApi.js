import axios from 'axios';

// Create a separate axios instance for API calls
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', 'true');
      return response.data;
    }
    throw new Error('Login failed');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    const response = await api.delete(`/admin/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete quiz');
  }
};
