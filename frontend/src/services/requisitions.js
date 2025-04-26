import api from './apiClient';

export async function createRequisition(data) {
  const response = await api.post('/requisitions/', data);
  return response.data;
}

export async function getRequisitions() {
  const response = await api.get('/requisitions/');
  return response.data;
}