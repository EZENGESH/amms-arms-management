import api from './apiClient';

let mockToken = null; // Simulate token storage

export function setToken(token) {
  mockToken = token;
}

export function clearToken() {
  mockToken = null;
}

export async function getInventory() {
  if (!mockToken) {
    throw new Error('No token found. Please log in first.');
  }

  const response = await api.get('/inventory/', {
    headers: {
      Authorization: `Bearer ${mockToken}`, // Use the token
    },
  });
  return response.data;
}