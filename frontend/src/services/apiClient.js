import axios from "axios";

// ==============================
// Base URLs for microservices
// ==============================
const SERVICES = {
  user: "http://localhost:8001",
  inventory: "http://localhost:8009",
  requisition: "http://localhost:8003",
  firearmLog: "http://localhost:8009",
};

// ==============================
// Force logout helper
// ==============================
const forceLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// ==============================
// Interceptors
// ==============================

// Attach JWT token to requests
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

// Refresh token interceptor
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
            console.error("No refresh token found. Logging out...");
            forceLogout();
            return Promise.reject(error);
          }

          // Request new access token
          const response = await axios.post(`${SERVICES.user}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed. Logging out...");
          forceLogout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Error logging interceptor
const addErrorLoggingInterceptor = (instance, serviceName) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        console.error(`${serviceName} Service: Network Error or service is down.`);
      } else {
        console.error(
          `${serviceName} Service Error: ${error.response.status} ${error.config.method.toUpperCase()} ${error.config.url}`,
          error.response.data
        );
      }
      return Promise.reject(error);
    }
  );
};

// ==============================
// Create Axios instances dynamically
// ==============================
const createServiceInstance = (baseURL, serviceName) => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
  });

  addTokenInterceptor(instance);
  addRefreshInterceptor(instance);
  addErrorLoggingInterceptor(instance, serviceName);

  return instance;
};

// ==============================
// Export all service instances
// ==============================
export const api = createServiceInstance(SERVICES.user, "User");
export const inventoryApi = createServiceInstance(SERVICES.inventory, "Inventory");
export const requisitionApi = createServiceInstance(SERVICES.requisition, "Requisition");
export const logfirearmapi = createServiceInstance(SERVICES.firearmLog, "Firearm Log");
export default {
  api,
  inventoryApi,
  requisitionApi,
  logfirearmapi
};