import api from './apiClient';

/**
 * Inventory Service - Handles all inventory-related API calls
 * Provides error handling, validation, and proper URL encoding
 */

// Service health check
export async function checkInventoryServiceHealth() {
  try {
    const response = await api.get('/health/');
    return {
      isHealthy: response.status === 200,
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Inventory service health check failed:', error.message);
    // Fallback health check
    try {
      await api.get('/api/inventory/');
      return { isHealthy: true, fallback: true, timestamp: new Date().toISOString() };
    } catch (fallbackError) {
      return { 
        isHealthy: false, 
        error: fallbackError.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }
}

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

// Validation helpers
function validateFirearmData(firearmData) {
  if (!firearmData || typeof firearmData !== 'object') {
    throw new Error('Invalid firearm data provided');
  }
  
  const requiredFields = ['serial_number', 'model', 'type', 'manufacturer'];
  const missingFields = requiredFields.filter(field => !firearmData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

function validateId(id) {
  if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
    throw new Error('Valid ID is required');
  }
}

// Core inventory functions
export async function getInventory(options = {}) {
  try {
    const { page = 1, limit = 50, sortBy = 'serial_number', sortOrder = 'asc' } = options;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by: sortBy,
      sort_order: sortOrder
    });
    
    const response = await api.get(`/api/inventory/arms/?${params}`);
    return {
      data: response.data,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'fetching inventory');
  }
}

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
    
    const response = await api.get(`/api/inventory/arms/by_type/?${params}`);
    return {
      data: response.data,
      type: type,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'fetching inventory by type');
  }
}

export async function getInventoryDashboard() {
  try {
    const response = await api.get('/api/inventory/arms/dashboard/');
    return {
      data: response.data,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'fetching inventory dashboard');
  }
}

export async function searchInventory(query, options = {}) {
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Search query is required and cannot be empty');
    }
    
    const { page = 1, limit = 50, searchFields = [] } = options;
    const params = new URLSearchParams({
      q: encodeURIComponent(query.trim()),
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Add specific search fields if provided
    if (searchFields.length > 0) {
      params.append('fields', searchFields.join(','));
    }
    
    const response = await api.get(`/api/inventory/arms/search/?${params}`);
    return {
      data: response.data,
      query: query.trim(),
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'searching inventory');
  }
}

// CRUD operations with enhanced validation
export async function addFirearm(firearmData) {
  try {
    validateFirearmData(firearmData);
    
    // Sanitize data
    const sanitizedData = {
      ...firearmData,
      serial_number: firearmData.serial_number?.toString().trim(),
      model: firearmData.model?.toString().trim(),
      manufacturer: firearmData.manufacturer?.toString().trim(),
      type: firearmData.type?.toString().trim(),
      calibre: firearmData.calibre?.toString().trim()
    };
    
    const response = await api.post('/api/inventory/arms/', sanitizedData);
    return {
      data: response.data,
      success: true,
      message: 'Firearm added successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'adding firearm');
  }
}

export async function updateFirearm(id, firearmData) {
  try {
    validateId(id);
    validateFirearmData(firearmData);
    
    // Sanitize data
    const sanitizedData = {
      ...firearmData,
      serial_number: firearmData.serial_number?.toString().trim(),
      model: firearmData.model?.toString().trim(),
      manufacturer: firearmData.manufacturer?.toString().trim(),
      type: firearmData.type?.toString().trim(),
      calibre: firearmData.calibre?.toString().trim()
    };
    
    const response = await api.put(`/api/inventory/arms/${encodeURIComponent(id)}/`, sanitizedData);
    return {
      data: response.data,
      success: true,
      message: 'Firearm updated successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'updating firearm');
  }
}

export async function deleteFirearm(id) {
  try {
    validateId(id);
    
    const response = await api.delete(`/api/inventory/arms/${encodeURIComponent(id)}/`);
    return {
      data: response.data,
      success: true,
      message: 'Firearm deleted successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'deleting firearm');
  }
}

// Additional utility functions
export async function getFirearmById(id) {
  try {
    validateId(id);
    
    const response = await api.get(`/api/inventory/arms/${encodeURIComponent(id)}/`);
    return {
      data: response.data,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'fetching firearm details');
  }
}

export async function getFirearmTypes() {
  try {
    const response = await api.get('/api/inventory/arms/types/');
    return {
      data: response.data,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'fetching firearm types');
  }
}

export async function getManufacturers() {
  try {
    const response = await api.get('/api/inventory/arms/manufacturers/');
    return {
      data: response.data,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'fetching manufacturers');
  }
}

export async function bulkUpdateFirearms(firearms) {
  try {
    if (!Array.isArray(firearms) || firearms.length === 0) {
      throw new Error('Valid array of firearms is required');
    }
    
    // Validate each firearm
    firearms.forEach((firearm, index) => {
      try {
        validateFirearmData(firearm);
      } catch (error) {
        throw new Error(`Invalid firearm data at index ${index}: ${error.message}`);
      }
    });
    
    const response = await api.post('/api/inventory/arms/bulk-update/', { firearms });
    return {
      data: response.data,
      success: true,
      message: `${firearms.length} firearms updated successfully`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleApiError(error, 'bulk updating firearms');
  }
}

// Export utilities for external use
export const inventoryUtils = {
  validateFirearmData,
  validateId,
  handleApiError
};

// Service configuration
export const INVENTORY_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,
  SUPPORTED_SORT_FIELDS: ['serial_number', 'model', 'type', 'manufacturer', 'calibre', 'created_at'],
  SUPPORTED_SEARCH_FIELDS: ['serial_number', 'model', 'type', 'manufacturer', 'calibre']
};
