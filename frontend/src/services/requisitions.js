import { requisitionApi } from './apiClient';

// Create a new requisition
export async function createRequisition(data) {
  try {
    console.log('Sending requisition data:', JSON.stringify(data, null, 2));

    const response = await requisitionApi.post('api/requisitions/', data, {
      timeout: 15000, // Longer timeout for creation
    });

    console.log('Requisition created successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error('Detailed error creating requisition:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    throw new Error(
      error.response?.status === 404
        ? 'Requisition endpoint not found. Check the backend URL.'
        : 'Failed to create requisition. Please check if the requisition service is running.'
    );
  }
}

// Get all requisitions
export async function getRequisitions() {
  try {
    const response = await requisitionApi.get('/requisitions/', {
      timeout: 10000,
    });

    // Support paginated and non-paginated responses
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

    throw new Error(
      'Failed to fetch requisitions. Please check if the requisition service is running.'
    );
  }
}

// Health check for requisition service
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
