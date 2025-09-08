import axios from "axios";

const SERVICES = {
  user: "http://localhost:8001/",
  inventory: "http://localhost:8009/",
  requisition: "http://localhost:8003/",
  firearmLog: "http://localhost:8009/",
};

const forceLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const attachToken = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

const attachRefresh = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (originalRequest.url.includes("/token/refresh/")) {
        forceLogout();
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          forceLogout();
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(
            `${SERVICES.user}/api/v1/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          localStorage.setItem("access_token", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return instance(originalRequest);
        } catch (err) {
          forceLogout();
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};

const attachErrorLogging = (instance, name) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        console.error(`${name} Service: Network error or service down.`);
      } else {
        console.error(
          `${name} Service Error: ${error.response.status} ${error.config.method.toUpperCase()} ${error.config.url}`,
          error.response.data
        );
      }
      return Promise.reject(error);
    }
  );
};

const createService = (baseURL, serviceName) => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
  });

  attachToken(instance);
  attachRefresh(instance);
  attachErrorLogging(instance, serviceName);

  return instance;
};

// Export properly configured service instances
export const api = createService(SERVICES.user, "User");
export const inventoryApi = createService(SERVICES.inventory, "Inventory");
export const requisitionApi = createService(SERVICES.requisition, "Requisition");
export const firearmApi = createService(SERVICES.firearmLog, "Firearm Log");

export default { api, inventoryApi, requisitionApi, firearmApi };
