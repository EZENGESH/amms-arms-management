// src/services/reports.js
import { inventoryApi, requisitionApi } from "./apiClient";

/**
 * Inventory report with optional filtering
 */
export const generateInventoryReport = async (params = {}) => {
  try {
    const response = await inventoryApi.get("/api/arms/", { params });
    return response.data.results || response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate inventory report.");
  }
};

/**
 * Requisition audit report with optional filtering
 */
export const generateRequisitionAudit = async (params = {}) => {
  try {
    const response = await requisitionApi.get("/api/requisitions/", { params });
    return response.data.results || response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate requisition audit report.");
  }
};

/**
 * Full system report combining inventory and requisitions
 */
export const generateFullSystemReport = async () => {
  try {
    const [inventoryData, requisitionData] = await Promise.all([
      inventoryApi.get("/api/arms/"),
      requisitionApi.get("/api/requisitions/"),
    ]);

    const inventoryResults = inventoryData.data.results || inventoryData.data;
    const requisitionResults = requisitionData.data.results || requisitionData.data;

    return {
      inventorySummary: {
        totalItems: inventoryResults.length,
        byCategory: inventoryResults.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {}),
      },
      requisitionSummary: {
        totalRequisitions: requisitionResults.length,
        byStatus: requisitionResults.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {}),
      },
      rawInventory: inventoryResults,
      rawRequisitions: requisitionResults,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate full system report.");
  }
};
