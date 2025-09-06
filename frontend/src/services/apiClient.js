import axios from "axios";

// ==============================
// Base URLs for microservices
// ==============================
const USER_API_BASE_URL = "http://localhost:8001";
const INVENTORY_API_BASE_URL = "http://localhost:8009";
const REQUISITION_API_BASE_URL = "http://localhost:8003";
const FIREARM_LOG_API_BASE_URL = "http://localhost:8009";

// ==============================
// Axios instances per service
// ==============================
const api = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const inventoryApi = axios.create({
  baseURL: INVENTORY_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const requisitionApi = axios.create({
  baseURL: REQUISITION_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const logfirearmapi = axios.create({
  baseURL: FIREARM_LOG_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ==============================
// Interceptors
// ==============================

// 1. Attach JWT token to every request
const addTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// 2. Handle expired access tokens with refresh logic
const addRefreshInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) {
            console.error("No refresh token available. User must log in again.");
            return Promise.reject(error);
          }

          // Correct refresh endpoint (matches Django)
          const response = await axios.post(`${USER_API_BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance.request(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// 3. Generic error logging
const addErrorLoggingInterceptor = (instance, serviceName) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        console.error(`${serviceName} Service: Network Error or service is down.`);
      } else {
        console.error(
          `${serviceName} Service Error: ${error.response.status} on ${error.config.url}`,
          error.response.data
        );
      }
      return Promise.reject(error);
    }
  );
};

// ==============================
// Apply Interceptors
// ==============================
const allInstances = [api, inventoryApi, requisitionApi, logfirearmapi];

allInstances.forEach((instance) => {
  addTokenInterceptor(instance);
  addRefreshInterceptor(instance);
});

addErrorLoggingInterceptor(api, "User");
addErrorLoggingInterceptor(inventoryApi, "Inventory");
addErrorLoggingInterceptor(requisitionApi, "Requisition");
addErrorLoggingInterceptor(logfirearmapi, "Firearm Log");

// ==============================
// Exports
// ==============================
export { api, inventoryApi, requisitionApi, logfirearmapi };
