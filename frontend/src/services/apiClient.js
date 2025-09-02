import axios from "axios";

// Detect if we're running inside Docker
const isDocker = window.location.hostname !== "localhost";

// Base URLs for services
const USER_API_BASE_URL = isDocker
  ? "http://user-service:8000/api" // Docker internal hostname
  : "http://localhost:8001/api";

const INVENTORY_API_BASE_URL = isDocker
  ? "http://inventory-service:8000/api"
  : "http://localhost:8009/api";

const REQUISITION_API_BASE_URL = isDocker
  ? "http://requisition-service:8000/api"
  : "http://localhost:8003/api";

const FIREARM_LOG_API_BASE_URL = isDocker
  ? "http://inventory-service:8000/api"
  : "http://localhost:8009/api";

// Create Axios instances
const api = axios.create({ baseURL: USER_API_BASE_URL, headers: { "Content-Type": "application/json" } });
const inventoryApi = axios.create({ baseURL: INVENTORY_API_BASE_URL, headers: { "Content-Type": "application/json" } });
const logfirearmapi = axios.create({ baseURL: FIREARM_LOG_API_BASE_URL, headers: { "Content-Type": "application/json" } });
const requisitionApi = axios.create({ baseURL: REQUISITION_API_BASE_URL, headers: { "Content-Type": "application/json" }, timeout: 10000 });

// Attach tokens and refresh logic (same as before)
async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    console.warn("No refresh token found. Redirecting to login.");
    window.location.href = "/login";
    return Promise.reject("No refresh token");
  }
  try {
    const response = await axios.post(`${USER_API_BASE_URL}/token/refresh/`, { refresh });
    const newAccessToken = response.data.access;
    localStorage.setItem("access_token", newAccessToken);
    return { access: newAccessToken };
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    throw error;
  }
}

const addTokenInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

const addRefreshTokenInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken.access}`;
          return apiInstance(originalRequest);
        } catch (err) {
          console.error("Refresh token failed:", err);
        }
      }
      return Promise.reject(error);
    }
  );
};

const addErrorHandlingInterceptor = (apiInstance, serviceName) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error(`${serviceName} API Error:`, error);
      if (error.code === "ECONNABORTED") error.message = `Request to ${serviceName} service timed out`;
      else if (!error.response) error.message = `${serviceName} service is not responding`;
      else if (error.response.status === 502 || error.response.status === 503) error.message = `${serviceName} service is temporarily unavailable`;
      else if (error.response.status === 404) error.message = `${serviceName} endpoint not found`;
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
[api, inventoryApi, logfirearmapi, requisitionApi].forEach((instance) => {
  addTokenInterceptor(instance);
  addRefreshTokenInterceptor(instance);
});

addErrorHandlingInterceptor(api, "User");
addErrorHandlingInterceptor(inventoryApi, "Inventory");
addErrorHandlingInterceptor(logfirearmapi, "Firearm Log");
addErrorHandlingInterceptor(requisitionApi, "Requisition");

// Exports
export { api, inventoryApi, logfirearmapi, requisitionApi };
export default api;