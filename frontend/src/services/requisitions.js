import api, { requisitionApi } from './apiClient';

// Create a new requisition
export async function createRequisition(data) {
  const response = await requisitionApi.post('/requisitions/', data);
  return response.data;
}

// Get all requisitions (handle paginated or non-paginated response)
export async function getRequisitions() {
  const response = await requisitionApi.get('/requisitions/');
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (Array.isArray(response.data.results)) {
    return response.data.results;
  }
  return [];
}
app.post('/api/requisitions/', async (req, res) => {
  try {
    const requisition = await Requisition.create(req.body);
    res.status(201).json(requisition); // Always send a response
  } catch (error) {
    console.error('Error creating requisition:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});