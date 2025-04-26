
// src/services/auth.js
import api from './apiClient';

export async function loginUser(credentials) {
  const response = await api.post('/auth/login/', credentials);
  return response.data;
}

export async function logoutUser() {
  await api.post('/auth/logout/');
}
