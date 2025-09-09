import { requisitionApi } from './apiClient';

// ==============================
// Create a new requisition
// ==============================
export async function createRequisition(data) {
  try {
    console.log('Sending requisition data:', JSON.stringify(data, null, 2));

    const response = await requisitionApi.post('/requisitions/', data, { timeout: 15000 });

    console.log('Requisition created successfully:', response.data);
    return response.data;

  } catch (error) {
    const status = error.response?.status;

    console.error('Detailed error creating requisition:', {
      message: error.message,
      code: error.code,
      status,
      data: error.response?.data,
      url: error.config?.url
    });

    if (status === 404) {
      throw new Error('Requisition endpoint not found. Check the backend URL.');
    }
    if (status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }

    throw new Error('Failed to create requisition. Please ensure the service is running.');
  }
}

// ==============================
// Get all requisitions
// ==============================
export async function getRequisitions() {
  try {
    const response = await requisitionApi.get('/requisitions/', { timeout: 10000 });

    // Support multiple response formats
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.results)) return response.data.results;
    if (Array.isArray(response.data?.data)) return response.data.data;

    console.warn('Unexpected response format from requisitions:', response.data);
    return [];

  } catch (error) {
    console.error('Error fetching requisitions:', {
      message: error.message,
      code: error.code,
      status: error.response?.status
    });

    throw new Error('Failed to fetch requisitions. Ensure the service is running.');
  }
}

// ==============================
// Health check for requisition service
// ==============================
export async function checkRequisitionServiceHealth() {
  try {
    const response = await requisitionApi.get('/health', { timeout: 5000 });
    return { status: 'healthy', data: response.data };
  } catch (error) {
    console.error('Requisition service health check failed:', error.message);
    return {
      status: 'unhealthy',
      error: error.message,
      details: 'Requisition service is not responding'
    };
  }
}
