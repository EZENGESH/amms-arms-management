import api from './apiClient';

export async function getInventory() {
  try {
    const response = await api.get('/api/inventory/arms/');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

export async function getInventoryByType(type) {
  try {
    const response = await api.get(`/api/inventory/arms/by_type/?type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory by type:', error);
    throw error;
  }
}

export async function getInventoryDashboard() {
  try {
    const response = await api.get('/api/inventory/arms/dashboard/');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory dashboard:', error);
    throw error;
  }
}

export async function searchInventory(query) {
  try {
    const response = await api.get(`/api/inventory/arms/search/?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching inventory:', error);
    throw error;
  }
}

export async function addFirearm(firearmData) {
  try {
    const response = await api.post('/api/inventory/arms/', firearmData);
    return response.data;
  } catch (error) {
    console.error('Error adding firearm:', error);
    throw error;
  }
}

export async function updateFirearm(id, firearmData) {
  try {
    const response = await api.put(`/api/inventory/arms/${id}/`, firearmData);
    return response.data;
  } catch (error) {
    console.error('Error updating firearm:', error);
    throw error;
  }
}

export async function deleteFirearm(id) {
  try {
    const response = await api.delete(`/api/inventory/arms/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting firearm:', error);
    throw error;
  }
}