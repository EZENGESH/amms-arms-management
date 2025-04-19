import api from './api'; // Now this import will work

export const login = async (serviceNumber, password) => {
  try {
    const response = await api.post('/auth/login/', {
      service_number: serviceNumber,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Login failed' };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Registration failed' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};