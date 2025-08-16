// src/services/inventory.js
import { inventoryApi } from './apiClient';

// Constants
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 50
};

// Utility function for handling API errors
function handleInventoryError(error, context) {
  console.error(`[Inventory Service] Error ${context}:`, error);

  // Enhance error message with context
  const enhancedError = new Error(`Failed to ${context}: ${error.message}`);
  enhancedError.originalError = error;

  throw enhancedError;
}

// Service Health Check
export async function checkInventoryServiceHealth() {
  try {
    await inventoryApi.get('/health');
    return {
      isHealthy: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Inventory Operations
export async function getInventory(options = {}) {
  try {
    const params = {
      ...DEFAULT_PAGINATION,
      ...options
    };
    const response = await inventoryApi.get('/arms', { params });
    return response.data;
  } catch (error) {
    handleInventoryError(error, 'fetch inventory');
  }
}

export async function searchInventory(query, options = {}) {
  try {
    if (!query?.trim()) {
      return getInventory(options);
    }

    const params = {
      q: query.trim(),
      ...DEFAULT_PAGINATION,
      ...options
    };
    const response = await inventoryApi.get('/arms/search', { params });
    return response.data;
  } catch (error) {
    handleInventoryError(error, 'search inventory');
  }
}

export async function getInventoryDashboard() {
  try {
    const response = await inventoryApi.get('/arms/dashboard');
    return response.data;
  } catch (error) {
    handleInventoryError(error, 'fetch dashboard stats');
  }
}

// CRUD Operations
export async function getFirearmById(id) {
  try {
    const response = await inventoryApi.get(`/arms/${id}`);
    return response.data;
  } catch (error) {
    handleInventoryError(error, `fetch firearm ${id}`);
  }
}

export async function createFirearm(firearmData) {
  try {
    const response = await inventoryApi.post('/arms', firearmData);
    return response.data;
  } catch (error) {
    handleInventoryError(error, 'create firearm');
  }
}

export async function updateFirearm(id, firearmData) {
  try {
    const response = await inventoryApi.put(`/arms/${id}`, firearmData);
    return response.data;
  } catch (error) {
    handleInventoryError(error, `update firearm ${id}`);
  }
}

export async function deleteFirearm(id) {
  try {
    const response = await inventoryApi.delete(`/arms/${id}`);
    return response.data;
  } catch (error) {
    handleInventoryError(error, `delete firearm ${id}`);
  }
}

// Constants
export const FIREARM_TYPES = [
  { value: 'RIFLE', label: 'Rifle' },
  { value: 'PISTOL', label: 'Pistol' },
  { value: 'SHOTGUN', label: 'Shotgun' },
  { value: 'MACHINE_GUN', label: 'Machine Gun' },
  { value: 'SUBMACHINE_GUN', label: 'Submachine Gun' }
];

export const INVENTORY_CONFIG = {
  DEFAULT_PAGE_SIZE: DEFAULT_PAGINATION.limit,
  MAX_PAGE_SIZE: 200,
  SORT_OPTIONS: [
    { value: 'serial_number', label: 'Serial Number' },
    { value: 'model', label: 'Model' },
    { value: 'manufacturer', label: 'Manufacturer' }
  ]
};