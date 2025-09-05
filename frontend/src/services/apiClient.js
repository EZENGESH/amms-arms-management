import axios from "axios";

// Base URLs for local development
const USER_API_BASE_URL = "http://localhost:8001";
const INVENTORY_API_BASE_URL = "http://localhost:8009";
const REQUISITION_API_BASE_URL = "http://localhost:8003";
const FIREARM_LOG_API_BASE_URL = "http://localhost:8009";

// Create Axios instances
const api = axios.create({ baseURL: USER_API_BASE_URL, headers: { "Content-Type": "application/json" }, timeout: 10000 });
const inventoryApi = axios.create({ baseURL: INVENTORY_API_BASE_URL, headers: { "Content-Type": "application/json" }, timeout: 10000 });
const requisitionApi = axios.create({ baseURL: REQUISITION_API_BASE_URL, headers: { "Content-Type": "application/json" }, timeout: 10000 });
const logfirearmapi = axios.create({ baseURL: FIREARM_LOG_API_BASE_URL, headers: { "Content-Type": "application/json" }, timeout: 10000 });

// Refresh token function
async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    console.warn("No refresh token found. Redirecting to login.");
    window.location.href = "/login";
    return Promise.reject("No refresh token");
  }

  try {
    const response = await axios.post(`${USER_API_BASE_URL}/api/auth/token/refresh/`, { refresh });
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

// Attach token to requests
const addTokenInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

// Handle 401 by refreshing token
const addRefreshInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken.access}`;
          return instance(originalRequest);
        } catch (err) {
          console.error("Token refresh failed:", err);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Generic error handling
const addErrorHandlingInterceptor = (instance, serviceName) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        console.error(`${serviceName} service not responding:`, error.message);
      } else if (error.response.status === 404) {
        console.error(`${serviceName} endpoint not found:`, error.config.url);
      } else if ([502, 503].includes(error.response.status)) {
        console.error(`${serviceName} service temporarily unavailable`);
      } else {
        console.error(`${serviceName} API Error:`, error.response.status, error.response.data);
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
[api, inventoryApi, requisitionApi, logfirearmapi].forEach((instance) => {
  addTokenInterceptor(instance);
  addRefreshInterceptor(instance);
});

addErrorHandlingInterceptor(api, "User");
addErrorHandlingInterceptor(inventoryApi, "Inventory");
addErrorHandlingInterceptor(requisitionApi, "Requisition");
addErrorHandlingInterceptor(logfirearmapi, "Firearm Log");

// Exports
export { api, inventoryApi, requisitionApi, logfirearmapi };
export default api;