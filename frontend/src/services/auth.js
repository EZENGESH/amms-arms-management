// src/services/auth.js
import { api } from './apiClient';

const clearAuthStorage = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

const handleAuthError = (error) => {
  let errorMessage = 'Authentication failed';

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (data && typeof data === 'object') {
      const errors = Object.entries(data)
        .map(([field, messages]) =>
          `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
        );
      errorMessage = errors.join('\n');
    } else {
      errorMessage = data || error.response.statusText;
    }

    console.error(`Auth Error [${status}]: ${errorMessage}`);
  } else if (error.request) {
    errorMessage = 'No response from server. Check your connection.';
  } else {
    errorMessage = error.message || 'Network error';
  }

  throw new Error(errorMessage);
};

// ==============================
// Auth services
// ==============================

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/users/register/', userData);
    return response.data;
  } catch (error) {
    const errorMessages = error.response?.data || {};
    let errorMsg = 'Registration failed. ';

    if (typeof errorMessages === 'object') {
      for (const [field, messages] of Object.entries(errorMessages)) {
        errorMsg += `${field}: ${Array.isArray(messages) ? messages.join(' ') : messages} `;
      }
    }

    throw new Error(errorMsg.trim());
  }
};

export const loginUser = async ({ username, password }) => {
  try {
    const { data } = await api.post('/api/auth/login/', { username, password });

    const user = {
      token: data.access || data.token,
      refresh_token: data.refresh || data.refresh_token,
      user_id: data.user?.id || data.user_id || data.id,
      username: data.user?.username || data.username || username,
      email: data.user?.email || data.email || null,
      service_number: data.user?.service_number || data.service_number || null,
      rank: data.user?.rank || data.rank || null
    };

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', user.token);
    localStorage.setItem('refresh_token', user.refresh_token);

    return user;
  } catch (error) {
    handleAuthError(error);
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/api/auth/logout/');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthStorage();
  }
};

export const refreshToken = async () => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) throw new Error('No refresh token available');

    const { data } = await api.post('/api/auth/token/refresh/', { refresh: refresh_token });

    localStorage.setItem('access_token', data.access);
    return { token: data.access, refresh_token };
  } catch (error) {
    clearAuthStorage();
    handleAuthError(error);
  }
};
