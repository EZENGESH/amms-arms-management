// src/services/apiClient.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshToken();
        localStorage.setItem('access_token', newToken.access);
        originalRequest.headers.Authorization = `Bearer ${newToken.access}`;
        return api(originalRequest);
      } catch (err) {
        console.error('Refresh token failed:', err);
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;