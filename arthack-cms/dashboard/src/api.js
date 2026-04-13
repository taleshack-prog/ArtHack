import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

// Inject token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arthack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('arthack_token');
      localStorage.removeItem('arthack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
