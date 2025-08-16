import { inventoryApi } from './apiClient';

export const FIREARM_TYPES = [
  { value: 'pistol', label: 'Pistol' },
  { value: 'rifle', label: 'Rifle' },
  { value: 'shotgun', label: 'Shotgun' },
  { value: 'submachine_gun', label: 'Submachine Gun' },
  { value: 'sniper_rifle', label: 'Sniper Rifle' }
];

export const checkInventoryServiceHealth = async () => {
  try {
    await inventoryApi.get('/health/');
    return { isHealthy: true, error: null };
  } catch (error) {
    return { isHealthy: false, error: error.message };
  }
};

export const getInventory = async () => {
  try {
    const response = await inventoryApi.get('/arms/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    throw error;
  }
};

export const addFirearm = async (firearmData) => {
  try {
    const response = await inventoryApi.post('/arms/', firearmData);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw {
        message: 'Validation failed',
        errors: error.response.data
      };
    }
    throw error;
  }
};

export const getInventoryDashboard = async () => {
  try {
    const response = await inventoryApi.get('/arms/dashboard/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    throw error;
  }
};