import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 90000
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Quiz APIs
export const generateQuiz = (topic) => API.post('/quiz/generate', { topic });
export const submitQuiz = (quizId, answers) => API.post(`/quiz/${quizId}/submit`, { answers });
export const getQuizHistory = () => API.get('/quiz/history');
export const getQuizResult = (quizId) => API.get(`/quiz/${quizId}`);

export default API;
