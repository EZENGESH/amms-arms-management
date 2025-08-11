import api from './apiClient';

export async function registerUser(userData) {
  try {
    const response = await api.post('/api/users/register/', userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Handle validation errors from DRF
      if (error.response.data) {
        // Format Django REST framework validation errors
        if (typeof error.response.data === 'object') {
          let errorMessages = [];
          for (const [field, messages] of Object.entries(error.response.data)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`);
          }
          throw new Error(errorMessages.join('\n'));
        }
        throw error.response.data;
      }
      throw new Error(error.response.statusText || 'Registration failed');
    } else if (error.request) {
      throw new Error('No response from server. Check your connection.');
    } else {
      throw new Error(error.message || 'Network error');
    }
  }
}

// Add other auth-related functions
export async function loginUser(credentials) {
  try {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
}

export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
}

export async function logoutUser() {
  try {
    await api.post('/auth/logout/');
    // Clear tokens from storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function handleAuthError(error) {
  if (error.response) {
    if (error.response.status === 400 || error.response.status === 401) {
      throw new Error('Invalid credentials');
    }
    throw new Error(error.response.data?.detail || 'Authentication failed');
  } else if (error.request) {
    throw new Error('No response from server. Check your connection.');
  } else {
    throw new Error(error.message || 'Network error');
  }
}