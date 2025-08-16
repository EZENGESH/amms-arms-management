// src/components/Inventory.jsx
import { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  getInventory, 
  searchInventory, 
  getInventoryDashboard,
  checkInventoryServiceHealth,
  FIREARM_TYPES,
  INVENTORY_CONFIG
} from '../services/inventory';

export default function Inventory() {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [serviceStatus, setServiceStatus] = useState({ 
    isChecking: true,
    isHealthy: false
  });

  // Service health check
  useEffect(() => {
    const checkService = async () => {
      try {
        const status = await checkInventoryServiceHealth();
        setServiceStatus({
          ...status,
          isChecking: false
        });
      } catch (err) {
        setServiceStatus({
          isHealthy: false,
          error: err.message,
          isChecking: false
        });
      }
    };
    
    checkService();
  }, []);

  // Data fetching
  const fetchData = async () => {
    if (serviceStatus.isChecking) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [inventoryData, dashboardData] = await Promise.all([
        getInventory(),
        getInventoryDashboard()
      ]);
      
      setFirearms(inventoryData || []);
      setStats(dashboardData);
    } catch (err) {
      console.error('Inventory fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceStatus.isChecking]);

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }
    
    try {
      setLoading(true);
      const results = await searchInventory(searchQuery);
      setFirearms(results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render helpers
  const renderServiceStatus = () => (
    !serviceStatus.isChecking && !serviceStatus.isHealthy && (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Service Warning</p>
        <p>Inventory service is unavailable. Data may be outdated.</p>
        {serviceStatus.error && (
          <p className="text-sm mt-1">Error: {serviceStatus.error}</p>
        )}
      </div>
    )
  );

  const renderStats = () => (
    stats && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats.summary).map(([key, value]) => (
          <div key={key} className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">
              {key.replace(/_/g, ' ').toUpperCase()}
            </h3>
            <p className="text-2xl font-bold text-blue-600">{value}</p>
          </div>
        ))}
      </div>
    )
  );

  const renderFirearms = () => (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border border-gray-200 text-left">Serial Number</th>
            <th className="p-3 border border-gray-200 text-left">Model</th>
            <th className="p-3 border border-gray-200 text-left">Type</th>
            <th className="p-3 border border-gray-200 text-left">Manufacturer</th>
          </tr>
        </thead>
        <tbody>
          {firearms.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                {searchQuery ? 'No matching firearms found' : 'No firearms in inventory'}
              </td>
            </tr>
          ) : (
            firearms.map((firearm) => (
              <tr key={firearm.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-200">{firearm.serial_number}</td>
                <td className="p-3 border border-gray-200">{firearm.model}</td>
                <td className="p-3 border border-gray-200">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {FIREARM_TYPES.find(t => t.value === firearm.type)?.label || firearm.type}
                  </span>
                </td>
                <td className="p-3 border border-gray-200">{firearm.manufacturer}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Loading state
  if (loading && firearms.length === 0) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading inventory...</div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchData}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          Retry
        </button>
      </AdminLayout>
    );
  }

  // Main render
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Firearms Inventory</h1>
        
        {renderServiceStatus()}
        {renderStats()}

        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory..."
              className="flex-1 p-2 border border-gray-300 rounded"
              disabled={!serviceStatus.isHealthy}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading || !serviceStatus.isHealthy}
            >
              Search
            </button>
          </div>
        </form>

        {renderFirearms()}
      </div>
    </AdminLayout>
  );
}