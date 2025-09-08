import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  getInventory, 
  getInventoryDashboard, 
  searchInventory,
  checkInventoryServiceHealth,
  FIREARM_TYPES 
} from '../services/inventory';

export default function Inventory() {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    summary: { total_firearms: 0 },
    type_statistics: [],
    manufacturer_statistics: [],
    calibre_statistics: []
  });
  const [serviceStatus, setServiceStatus] = useState({ 
    isHealthy: false,
    error: null
  });

  // Initialize service health check
  useEffect(() => {
    const checkService = async () => {
      const status = await checkInventoryServiceHealth();
      setServiceStatus(status);
    };
    checkService();
  }, []);

// Fetch data when service is healthy
const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const [inventoryData, dashboardData] = await Promise.all([
      searchQuery ? searchInventory(searchQuery) : getInventory(),
      getInventoryDashboard()
    ]);

    console.log('Inventory data:', inventoryData); // <-- Add this line
    setFirearms(inventoryData);
    setStats(dashboardData);
  } catch (err) {
    setError(err.message || 'Failed to load inventory data');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (serviceStatus.isHealthy) {
      fetchData();
    }
  }, [serviceStatus.isHealthy, searchQuery]);

  // Render functions
  const renderServiceStatus = () => (
    !serviceStatus.isHealthy && (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 mb-4 rounded">
        {serviceStatus.error || 'Inventory service unavailable'}
      </div>
    )
  );

  const renderStatsCard = (title, value) => (
    <div className="bg-white p-4 rounded shadow border">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  const renderFirearmRow = (firearm) => (
    <tr key={firearm.id} className="hover:bg-gray-50">
      <td className="p-3 border">{firearm.serial_number}</td>
      <td className="p-3 border">{firearm.model}</td>
      <td className="p-3 border">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
          {FIREARM_TYPES.find(t => t.value === firearm.type)?.label || firearm.type}
        </span>
      </td>
      <td className="p-3 border">{firearm.manufacturer}</td>
      <td className="p-3 border">{firearm.calibre || 'N/A'}</td>
    </tr>
  );

  // Main render
  return (
    <AdminLayout>
      <div className="space-y-6 p-4">
        <h1 className="text-2xl font-bold">Firearms Inventory</h1>
        
        {renderServiceStatus()}

        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded"
            disabled={loading || !serviceStatus.isHealthy}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            {renderStatsCard('Total', stats.summary.total_firearms)}
            {renderStatsCard('Types', stats.type_statistics.length)}
            {renderStatsCard('Makers', stats.manufacturer_statistics.length)}
            {renderStatsCard('Calibers', stats.calibre_statistics.length)}
          </div>
        </div>

        {/* Inventory Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading inventory...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
            {error}
            <button 
              onClick={fetchData}
              className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        ) : firearms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border text-left">Serial</th>
                  <th className="p-3 border text-left">Model</th>
                  <th className="p-3 border text-left">Type</th>
                  <th className="p-3 border text-left">Manufacturer</th>
                  <th className="p-3 border text-left">Caliber</th>
                </tr>
              </thead>
              <tbody>
                {firearms.map(renderFirearmRow)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded border">
            <p className="text-lg mb-4">
              {searchQuery ? 'No matching firearms found' : 'No firearms in inventory'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                fetchData();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {searchQuery ? 'Clear Search' : 'Refresh'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}