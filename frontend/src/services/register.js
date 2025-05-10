import api from './apiClient';

export async function registerUser(userData) {
  try {
    // Note the trailing slash and correct endpoint structure
    const response = await api.post('/api/register/', userData);
    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      // Handle validation errors from DRF
      if (error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.response.statusText);
    }
    throw new Error(error.message || 'Network error');
  }
}