import api from './apiClient';

export async function registerUser(userData) {
  try {
    // Use direct service endpoint when not using API gateway
    const endpoint = '/api/users/register/'; // Direct user service endpoint
    const response = await api.post(endpoint, userData);
    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      // Handle validation errors from DRF
      if (error.response.data) {
        throw error.response.data;
      }
      throw new Error(error.response.statusText || 'Server error');
    } else if (error.request) {
      // No response received from server
      throw new Error('No response from server. Check your connection.');
    } else {
      // Unexpected error
      throw new Error(error.message || 'Network error');
    }
  }
}