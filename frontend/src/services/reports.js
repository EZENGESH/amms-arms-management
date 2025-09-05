import { inventoryApi, requisitionApi } from '../services/apiClient';

/**
 * Generates an inventory report.
 * Can be filtered by passing parameters like { category: 'Rifle', status: 'Available' }.
 * @param {object} params - Optional query parameters for filtering the report.
 * @returns {Promise<Array>} A list of inventory items.
 */
export const generateInventoryReport = async (params = {}) => {
  try {
    // Uses the inventoryApi client to hit the inventory service
    const response = await inventoryApi.get('/api/arms/', { params });
    return response.data.results || response.data;
  } catch (error) {
    // The interceptor in apiClient.js will log the detailed error.
    // We throw a user-friendly message for the UI to catch.
    throw new Error('Failed to generate inventory report.');
  }
};

/**
 * Generates a requisition audit report.
 * Can be filtered by status, user, or date range.
 * @param {object} params - Optional query parameters like { status: 'Approved', ordering: '-created_at' }.
 * @returns {Promise<Array>} A list of requisitions.
 */
export const generateRequisitionAudit = async (params = {}) => {
  try {
    // Uses the requisitionApi client to hit the requisition service
    const response = await requisitionApi.get('/api/requisitions/', { params });
    return response.data.results || response.data;
  } catch (error) {
    throw new Error('Failed to generate requisition audit report.');
  }
};

/**
 * Example of a more complex report that combines data from multiple services.
 * @returns {Promise<object>} An object containing combined report data.
 */
export const generateFullSystemReport = async () => {
  try {
    // Fetch data from multiple services concurrently
    const [inventoryData, requisitionData] = await Promise.all([
      inventoryApi.get('/api/arms/'),
      requisitionApi.get('/api/requisitions/'),
    ]);

    const inventoryResults = inventoryData.data.results || inventoryData.data;
    const requisitionResults = requisitionData.data.results || requisitionData.data;

    // Process and combine the data as needed
    return {
      inventorySummary: {
        totalItems: inventoryResults.length,
        // Example: count items by category
        byCategory: inventoryResults.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {}),
      },
      requisitionSummary: {
        totalRequisitions: requisitionResults.length,
        // Example: count requisitions by status
        byStatus: requisitionResults.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {}),
      },
      // Include raw data for detailed tables
      rawInventory: inventoryResults,
      rawRequisitions: requisitionResults,
    };
  } catch (error) {
    throw new Error('Failed to generate full system report.');
  }
};