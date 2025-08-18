import api from './apiClient';

// Create a new requisition
export async function createRequisition(data) {
  const response = await api.post('/requisitions/', data);
  return response.data;
}

// Get all requisitions (handle paginated or non-paginated response)
export async function getRequisitions() {
  const response = await api.get('/requisitions/');
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (Array.isArray(response.data.results)) {
    return response.data.results;
  }
  return [];
}