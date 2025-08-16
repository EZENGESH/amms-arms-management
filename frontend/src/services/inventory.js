import { inventoryApi } from './apiClient';

export const FIREARM_TYPES = [
  { value: 'pistol', label: 'Pistol' },
  { value: 'rifle', label: 'Rifle' },
  { value: 'shotgun', label: 'Shotgun' },
  { value: 'submachine_gun', label: 'Submachine Gun' },
  { value: 'sniper_rifle', label: 'Sniper Rifle' },
  { value: 'other', label: 'Other' }
];

export const addFirearm = async (firearmData) => {
  try {
    const response = await inventoryApi.post('/arms/', firearmData);
    return response.data;
  } catch (error) {
    console.error('Error adding firearm:', error);
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
    return {
      summary: response.data?.summary || { total_firearms: 0 },
      type_statistics: Array.isArray(response.data?.type_statistics)
        ? response.data.type_statistics
        : [],
      manufacturer_statistics: Array.isArray(response.data?.manufacturer_statistics)
        ? response.data.manufacturer_statistics
        : [],
      calibre_statistics: Array.isArray(response.data?.calibre_statistics)
        ? response.data.calibre_statistics
        : []
    };
  } catch (error) {
    console.error('Dashboard load error:', error);
    return {
      summary: { total_firearms: 0 },
      type_statistics: [],
      manufacturer_statistics: [],
      calibre_statistics: []
    };
  }
};