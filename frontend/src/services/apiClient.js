// src/services/apiClient.js
import axios from "axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API instance
const createApiClient = (baseURL) => {
  const client = axios.create({ baseURL });

  // Attach token automatically
  client.interceptors.request.use((config) => {
    config.headers = { ...config.headers, ...getAuthHeaders() };
    return config;
  });

  // Handle 401 and 403 globally
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;
        localStorage.clear();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Monolithic API clients for each service
export const inventoryApi = createApiClient("http://localhost:8009");
export const requisitionApi = createApiClient("http://localhost:8003");
export const userApi = createApiClient("http://localhost:8001");
