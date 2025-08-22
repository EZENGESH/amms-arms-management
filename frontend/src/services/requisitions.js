import api, { requisitionApi } from './apiClient';

// Create a new requisition
export async function createRequisition(data) {
  try {
    console.log('Sending requisition data:', JSON.stringify(data, null, 2));

    const response = await requisitionApi.post('/requisitions/', data, {
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

    throw new Error(error.message || 'Failed to create requisition. Please check if the requisition service is running.');
  }
}

// Get all requisitions (handle paginated or non-paginated response)
export async function getRequisitions() {
  try {
    const response = await requisitionApi.get('/requisitions/', {
      timeout: 10000,
    });

    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response.data?.results)) {
      return response.data.results;
    } else if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    console.warn('Unexpected response format from requisitions:', response.data);
    return [];

  } catch (error) {
    console.error('Error fetching requisitions:', {
      message: error.message,
      code: error.code,
      status: error.response?.status
    });

    throw new Error(error.message || 'Failed to fetch requisitions. Please check if the requisition service is running.');
  }
}

// Health check for requisition service
export async function checkRequisitionServiceHealth() {
  try {
    const response = await requisitionApi.get('/health', {
      timeout: 5000,
    });
    return { status: 'healthy', data: response.data };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      details: `Requisition service at ${REQUISITION_API_BASE_URL} is not responding`
    };
  }
}