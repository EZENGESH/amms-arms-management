// src/services/auth.js
import api from './apiClient';

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
    // Use the improved error handling for registration
    const errorMessages = error.response?.data || {};
    let errorMsg = "Registration failed. ";
    
    // Format specific field errors
    if (typeof errorMessages === 'object') {
      for (const [field, messages] of Object.entries(errorMessages)) {
        errorMsg += `${field}: ${Array.isArray(messages) ? messages.join(' ') : messages} `;
      }
    }
    
    throw new Error(errorMsg);
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login/', {
      username: credentials.username,
      password: credentials.password
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

// Rest of your original code remains unchanged
export const logoutUser = async () => {
  try {
    await api.post('/api/auth/logout/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post('/api/auth/token/refresh/', { 
      refresh: refreshToken 
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

const handleAuthError = (error) => {
  let errorMessage = 'Authentication failed';
  
  if (error.response) {
    if (error.response.data) {
      if (typeof error.response.data === 'object') {
        const errors = Object.entries(error.response.data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
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