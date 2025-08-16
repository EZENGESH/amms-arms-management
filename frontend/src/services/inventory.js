import { inventoryApi } from './apiClient';

/**
 * Inventory Service - Handles all inventory-related API calls
 */

// Enhanced error handler
function handleApiError(error, operation) {
  console.error(`Error ${operation}:`, error);

  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
    throw new Error(`Cannot connect to inventory service. Please ensure the service is running on the correct port.`);
  }

  if (error.response?.status === 404) {
    throw new Error(`${operation} endpoint not found. Please check the API configuration.`);
  }

  if (error.response?.status === 400) {
    const message = error.response.data?.message || error.response.data?.error || 'Invalid request';
    throw new Error(`Bad request: ${message}`);
  }

  if (error.response?.status === 401) {
    throw new Error('Unauthorized access. Please check your authentication.');
  }

  if (error.response?.status === 403) {
    throw new Error('Access forbidden. You do not have permission to perform this action.');
  }

  if (error.response?.status === 500) {
    throw new Error('Internal server error. Please try again later or contact support.');
  }

  // Generic error
  const statusCode = error.response?.status || 'Network Error';
  const message = error.response?.data?.message || error.message || 'Unknown error occurred';
  throw new Error(`API Error (${statusCode}): ${message}`);
}

// Service health check
export async function checkInventoryServiceHealth() {
  try {
    // Use a valid health or list endpoint, not a malformed one
    const response = await inventoryApi.get('/arms/');
    return {
      isHealthy: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Inventory service health check failed:', error.message);
    return {
      isHealthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Get inventory filtered by type
export async function getInventoryByType(type, options = {}) {
  try {
    if (!type || typeof type !== 'string') {
      throw new Error('Valid firearm type is required');
    }
    
    const { page = 1, limit = 50 } = options;
    const params = new URLSearchParams({
      type: encodeURIComponent(type.trim()),
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await inventoryApi.get(`/api/arms/by_type/?${params}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching inventory by type');
  }
}

// Get dashboard statistics
export async function getInventoryDashboard() {
  try {
    const response = await inventoryApi.get('/api/arms/dashboard/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching inventory dashboard');
  }
}

// Search inventory
export async function searchInventory(query, options = {}) {
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Search query is required and cannot be empty');
    }
    
    const { page = 1, limit = 50 } = options;
    const params = new URLSearchParams({
      q: encodeURIComponent(query.trim()),
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await inventoryApi.get(`/api/arms/search/?${params}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'searching inventory');
  }
}

// Add a new firearm
export async function addFirearm(firearmData) {
  try {
    if (!firearmData || typeof firearmData !== 'object') {
      throw new Error('Valid firearm data is required');
    }
    
    const response = await inventoryApi.post('/arms/', firearmData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'adding firearm');
  }
}

// Update an existing firearm
export async function updateFirearm(id, firearmData) {
  try {
    if (!id) throw new Error('Firearm ID is required');
    if (!firearmData || typeof firearmData !== 'object') {
      throw new Error('Valid firearm data is required');
    }
    
    const response = await inventoryApi.put(`/arms/${id}/`, firearmData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating firearm');
  }
}

// Delete a firearm
export async function deleteFirearm(id) {
  try {
    if (!id) throw new Error('Firearm ID is required');

    const response = await inventoryApi.delete(`/arms/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting firearm');
  }
}

// Export configurations
export const FIREARM_TYPES = [
  { value: 'RIFLE', label: 'Rifle' },
  { value: 'PISTOL', label: 'Pistol' },
  { value: 'SHOTGUN', label: 'Shotgun' },
  { value: 'MACHINE_GUN', label: 'Machine Gun' },
  { value: 'SUBMACHINE_GUN', label: 'Submachine Gun' }
];

export const INVENTORY_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,
  API_ENDPOINTS: {
    BASE: 'arms/',
    DASHBOARD: 'arms/dashboard/',
    SEARCH: 'arms/search/',
    BY_TYPE: 'arms/by_type/',
    HEALTH: 'arms/health/',
    DETAIL: 'arms/:id/'
  },
  DEFAULT_PARAMS: {
    page: 1,
    limit: 50,
    sort_by: 'serial_number',
    sort_order: 'asc',
    q: '',
    type: ''
  },
  ERROR_MESSAGES: {
    NETWORK: 'Cannot connect to inventory service. Please ensure the service is running.',
    NOT_FOUND: 'The requested firearm was not found.',
    AUTH: 'Unauthorized access. Please check your authentication.',
    VALIDATION: 'Invalid request data.',
    SERVER: 'Internal server error. Please try again later.'
  },
  FIREARM_TYPES: [
    'RIFLE',
    'PISTOL',
    'SHOTGUN',
    'MACHINE_GUN',
    'SUBMACHINE_GUN'
  ]
};

// Add the missing getInventory export
export async function getInventory(options = {}) {
  try {
    const { page = 1, limit = 50 } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    // Use the correct endpoint for listing all firearms
    const response = await inventoryApi.get(`/arms/?${params}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching inventory');
  }
}