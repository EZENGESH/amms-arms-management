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

// --- Interceptors ---

// 1. Attach token to every request
const addTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      // Get the token from the key we set in AuthContext
      const token = localStorage.getItem("auth_token");
      if (token) {
        // DRF authtoken expects the "Token" keyword, not "Bearer".
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// 2. Generic error logging
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

// --- Apply Interceptors ---

// Array of all client instances
const allInstances = [api, inventoryApi, requisitionApi, logfirearmapi];

// Apply the token interceptor to all instances
allInstances.forEach(addTokenInterceptor);

// Apply specific error loggers
addErrorLoggingInterceptor(api, "User");
addErrorLoggingInterceptor(inventoryApi, "Inventory");
addErrorLoggingInterceptor(requisitionApi, "Requisition");
addErrorLoggingInterceptor(logfirearmapi, "Firearm Log");

// --- Exports ---
export { api, inventoryApi, requisitionApi, logfirearmapi };