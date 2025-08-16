// src/services/inventory.js
import { inventoryApi } from './apiClient';

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 50
};

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

// CRUD Operations
export async function getInventory(options = {}) {
  const params = { ...DEFAULT_PAGINATION, ...options };
  const response = await inventoryApi.get('/arms', { params });
  return response.data;
}

export async function searchInventory(query, options = {}) {
  if (!query?.trim()) return getInventory(options);
  const params = { q: query.trim(), ...DEFAULT_PAGINATION, ...options };
  const response = await inventoryApi.get('/arms/search', { params });
  return response.data;
}

export async function getInventoryDashboard() {
  const response = await inventoryApi.get('/arms/dashboard');
  return response.data;
}

export async function getFirearmById(id) {
  const response = await inventoryApi.get(`/arms/${id}`);
  return response.data;
}

export async function addFirearm(firearmData) {
  const response = await inventoryApi.post('/arms', firearmData);
  return response.data;
}

export async function updateFirearm(id, firearmData) {
  const response = await inventoryApi.put(`/arms/${id}`, firearmData);
  return response.data;
}

export async function deleteFirearm(id) {
  const response = await inventoryApi.delete(`/arms/${id}`);
  return response.data;
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
