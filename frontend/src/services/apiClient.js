// src/services/apiClient.js
import axios from 'axios';

// Define base URLs for different microservices
const USER_API_BASE_URL = 'http://localhost:8001'; // User registration service
const INVENTORY_API_BASE_URL = 'http://localhost:8009/api';
const REQUISITION_API_BASE_URL = 'http://localhost:8004/api'; // <-- Add your requisition service base URL

// Create Axios instance for User service
const api = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create Axios instance for Inventory service
const inventoryApi = axios.create({
  baseURL: INVENTORY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const logfirearmapi = axios.create({
  baseURL: 'http://localhost:8009/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create Axios instance for Requisition service
const requisitionApi = axios.create({
  baseURL: REQUISITION_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Function to refresh token (assumed to be implemented elsewhere)
async function refreshToken() {
  // Implement your token refresh logic here
  // This is a placeholder, replace with your actual implementation
  console.warn('refreshToken() function needs to be implemented');
  return Promise.resolve({ access: 'new_access_token' });
}

// Add interceptor for adding token to request
const addTokenInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Add interceptor for handling token refresh
const addRefreshTokenInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          localStorage.setItem('access_token', newToken.access);
          originalRequest.headers.Authorization = `Bearer ${newToken.access}`;
          return apiInstance(originalRequest); // Use the correct instance
        } catch (err) {
          console.error('Refresh token failed:', err);
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
};

// Add this function to your apiClient.js
const addErrorHandlingInterceptor = (apiInstance, serviceName) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error(`${serviceName} API Error:`, error);

      if (error.code === 'ECONNABORTED') {
        error.message = `Request to ${serviceName} service timed out`;
      } else if (!error.response) {
        error.message = `${serviceName} service is not responding`;
      } else if (error.response.status === 502 || error.response.status === 503) {
        error.message = `${serviceName} service is temporarily unavailable`;
      } else if (error.response.status === 404) {
        error.message = `${serviceName} endpoint not found`;
      }

      return Promise.reject(error);
    }
  );
};

// Apply the error handling interceptor to each instance
addErrorHandlingInterceptor(api, 'User');
addErrorHandlingInterceptor(inventoryApi, 'Inventory');
addErrorHandlingInterceptor(logfirearmapi, 'Firearm Log');
addErrorHandlingInterceptor(requisitionApi, 'Requisition');

// Apply interceptors to all instances
addTokenInterceptor(api);
addRefreshTokenInterceptor(api);
addTokenInterceptor(inventoryApi);
addRefreshTokenInterceptor(inventoryApi);
addTokenInterceptor(logfirearmapi);
addRefreshTokenInterceptor(logfirearmapi);
addTokenInterceptor(requisitionApi);
addRefreshTokenInterceptor(requisitionApi);

// Export the instances
export { api, inventoryApi, logfirearmapi, requisitionApi };
export default api; // Default export remains the same