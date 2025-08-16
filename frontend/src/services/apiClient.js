// src/services/apiClient.js
import axios from 'axios';

const API_CONFIG = {
  USER_SERVICE: {
    BASE_URL: 'http://localhost:8001',
    TIMEOUT: 5000
  },
  INVENTORY_SERVICE: {
    BASE_URL: 'http://localhost:8009/api',
    TIMEOUT: 10000
  }
};

const ERROR_MESSAGES = {
  NETWORK: 'Network error - please check your connection',
  TIMEOUT: 'Request timed out - server is not responding',
  SERVER: 'Server error - please try again later',
  AUTH: 'Authentication required - please login',
  VALIDATION: 'Validation error - check your inputs',
  NOT_FOUND: 'Resource not found',
  DEFAULT: 'An unexpected error occurred'
};

function createAxiosInstance(baseURL, timeout) {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Network/timeout errors
      if (error.code === 'ECONNABORTED' || !error.response) {
        throw new Error(ERROR_MESSAGES.NETWORK);
      }

      // Handle 401 Unauthorized
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();
          localStorage.setItem('access_token', newToken.access);
          originalRequest.headers.Authorization = `Bearer ${newToken.access}`;
          return instance(originalRequest);
        } catch (err) {
          console.error('Token refresh failed:', err);
          window.location.href = '/login';
          return Promise.reject(new Error(ERROR_MESSAGES.AUTH));
        }
      }

      // Handle validation errors
      if (error.response.status === 400) {
        const errorData = error.response.data;
        const validationError = new Error(ERROR_MESSAGES.VALIDATION);
        validationError.validationErrors = errorData.errors || errorData;
        throw validationError;
      }

      // Handle other errors
      const status = error.response.status;
      const message = error.response.data?.message ||
        ERROR_MESSAGES[status] ||
        ERROR_MESSAGES.DEFAULT;
      throw new Error(message);
    }
  );

  return instance;
}

async function refreshToken() {
  try {
    const response = await axios.post(`${API_CONFIG.USER_SERVICE.BASE_URL}/auth/refresh`, {
      refresh_token: localStorage.getItem('refresh_token')
    });
    return response.data;
  } catch (error) {
    console.error('Refresh token failed:', error);
    throw new Error(ERROR_MESSAGES.AUTH);
  }
}

// Create instances
const userApi = createAxiosInstance(
  API_CONFIG.USER_SERVICE.BASE_URL,
  API_CONFIG.USER_SERVICE.TIMEOUT
);

const inventoryApi = createAxiosInstance(
  API_CONFIG.INVENTORY_SERVICE.BASE_URL,
  API_CONFIG.INVENTORY_SERVICE.TIMEOUT
);

export { userApi, inventoryApi };
export default userApi;