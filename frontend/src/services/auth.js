// src/services/auth.js
import { api } from './apiClient';

// ==============================
// Local Storage Helpers
// ==============================
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

const setAuthStorage = ({ token, refresh_token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getAuthStorage = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const refresh_token = localStorage.getItem(REFRESH_KEY);
  const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  return { token, refresh_token, user };
};

const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

// ==============================
// Error Handler
// ==============================
const handleAuthError = (error) => {
  let message = 'Authentication failed';

  if (error.response) {
    const data = error.response.data;
    if (data && typeof data === 'object') {
      const errors = Object.entries(data).map(([k, v]) =>
        `${k}: ${Array.isArray(v) ? v.join(', ') : v}`
      );
      message = errors.join(' | ');
    } else {
      message = data || error.response.statusText;
    }
  } else if (error.request) {
    message = 'No response from server. Check your connection.';
  } else {
    message = error.message;
  }

  throw new Error(message);
};

// ==============================
// Auth Services
// ==============================

// Login
export const loginUser = async ({ username, password }) => {
  try {
    const { data } = await api.post('/api/v1/auth/login/', { username, password });

    if (!data.access || !data.refresh) throw new Error('Invalid server response');

    const user = {
      user_id: data.user?.id,
      username: data.user?.username,
      email: data.user?.email,
      service_number: data.user?.service_number,
      rank: data.user?.rank,
    };

    setAuthStorage({ token: data.access, refresh_token: data.refresh, user });

    return { access: data.access, refresh: data.refresh, user };
  } catch (err) {
    handleAuthError(err);
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await api.post('/api/v1/auth/logout/');
  } catch (err) {
    console.error('Logout error:', err.response?.data || err.message);
  } finally {
    clearAuthStorage();
    window.location.href = '/login'; // force redirect
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const { refresh_token } = getAuthStorage();
    if (!refresh_token) throw new Error('No refresh token available');

    const { data } = await api.post('/api/v1/auth/token/refresh/', { refresh: refresh_token });

    if (!data.access) throw new Error('Invalid refresh response');

    localStorage.setItem(TOKEN_KEY, data.access);

    return { token: data.access, refresh_token };
  } catch (err) {
    clearAuthStorage();
    handleAuthError(err);
  }
};

// Register
export const registerUser = async ({ username, email, password, service_number, rank }) => {
  try {
    const { data } = await api.post('/api/v1/auth/register/', {
      username,
      email,
      password,
      service_number,
      rank,
    });

    return {
      user_id: data.id,
      username: data.username,
      email: data.email,
      service_number: data.service_number,
      rank: data.rank,
    };
  } catch (err) {
    handleAuthError(err);
  }
};

// Get current user
export const getCurrentUser = () => {
  const { user } = getAuthStorage();
  return user;
};
