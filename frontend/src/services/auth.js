// src/services/auth.js
import { api } from './apiClient';

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/users/register/', {
      service_number: userData.service_number,
      rank: userData.rank,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      username: userData.username,
      password: userData.password
    });
    return response.data;
  } catch (error) {
    // Better error handling
    const errorMessages = error.response?.data || {};
    let errorMsg = "Registration failed. ";

    if (typeof errorMessages === 'object') {
      for (const [field, messages] of Object.entries(errorMessages)) {
        errorMsg += `${field}: ${Array.isArray(messages) ? messages.join(' ') : messages} `;
      }
    }
    throw new Error(errorMsg.trim());
  }
};

// User login
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login/', {
      username: credentials.username,
      password: credentials.password
    });

    const data = response.data;

    // Normalize backend response to a consistent structure
    return {
      token: data.access || data.token,          // JWT access token
      refresh_token: data.refresh || data.refresh_token,
      user_id: data.user?.id || data.user_id || data.id,
      username: data.user?.username || data.username || credentials.username,
      email: data.user?.email || data.email || null,
      service_number: data.user?.service_number || data.service_number || null,
      rank: data.user?.rank || data.rank || null
    };
  } catch (error) {
    handleAuthError(error);
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await api.post('/api/auth/logout/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post('/api/auth/token/refresh/', {
      refresh: refreshToken
    });

    const data = response.data;
    return {
      token: data.access,
      refresh_token: refreshToken
    };
  } catch (error) {
    handleAuthError(error);
  }
};

// Centralized error handler
const handleAuthError = (error) => {
  let errorMessage = 'Authentication failed';

  if (error.response) {
    if (error.response.data) {
      if (typeof error.response.data === 'object') {
        const errors = Object.entries(error.response.data)
          .map(([field, messages]) =>
            `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          );
        errorMessage = errors.join('\n');
      } else {
        errorMessage = error.response.data;
      }
    } else {
      errorMessage = error.response.statusText || 'Server error';
    }
  } else if (error.request) {
    errorMessage = 'No response from server. Check your connection.';
  } else {
    errorMessage = error.message || 'Network error';
  }

  throw new Error(errorMessage);
};