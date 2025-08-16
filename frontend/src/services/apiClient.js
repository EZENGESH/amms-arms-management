// src/services/apiClient.js
import axios from 'axios';

// Configuration
const API_CONFIG = {
  USER_SERVICE: {
    BASE_URL: 'http://localhost:8001',
    TIMEOUT: 5000
  },
  INVENTORY_SERVICE: {
    BASE_URL: 'http://localhost:8009/api',
    TIMEOUT: 10000 // Longer timeout for inventory operations
  }
};

// Error messages
const ERROR_MESSAGES = {
  NETWORK: 'Network error - please check your internet connection',
  TIMEOUT: 'Request timed out - the server is taking too long to respond',
  SERVER: 'Server error - please try again later',
  AUTH: 'Authentication required - please login again',
  UNKNOWN: 'An unknown error occurred'
};

// Create Axios instances
function createAxiosInstance(baseURL, timeout) {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor for auth token
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

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        throw new Error(ERROR_MESSAGES.TIMEOUT);
      }

      // Handle network errors
      if (!error.response) {
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
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          window.location.href = '/login';
          return Promise.reject(new Error(ERROR_MESSAGES.AUTH));
        }
      }

      // Handle other errors
      const errorMessage = error.response.data?.message ||
        ERROR_MESSAGES[error.response.status] ||
        ERROR_MESSAGES.UNKNOWN;
      throw new Error(errorMessage);
    }
  );

  return instance;
}

// Token refresh function
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

// Create service instances
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