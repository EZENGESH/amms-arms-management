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
    isHealthy: false,
    error: null
  });

  // Check service health on component mount
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

  // Fetch inventory data
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
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceStatus.isChecking]);

  // Handle search
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
      console.error('Search error:', err);
      setError(err.message || 'Failed to search inventory');
    } finally {
      setLoading(false);
    }
  };

  // Render service status warning
  const renderServiceStatus = () => {
    if (serviceStatus.isChecking) return null;
    
    if (!serviceStatus.isHealthy) {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Service Warning</p>
          <p>Inventory service is unavailable. Data may be outdated.</p>
          {serviceStatus.error && (
            <p className="text-sm mt-1">Error: {serviceStatus.error}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Render statistics cards
  const renderStats = () => {
    if (!stats) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Firearms</h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.summary?.total_firearms || 0}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Types</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.type_statistics?.length || 0}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Manufacturers</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.manufacturer_statistics?.length || 0}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Calibres</h3>
          <p className="text-2xl font-bold text-purple-600">
            {stats.calibre_statistics?.length || 0}
          </p>
        </div>
      </div>
    );
  };

  // Render firearms table
  const renderFirearmsTable = () => {
    if (loading && firearms.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading inventory...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchData}
            className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-200 text-left">Serial Number</th>
              <th className="p-3 border border-gray-200 text-left">Model</th>
              <th className="p-3 border border-gray-200 text-left">Type</th>
              <th className="p-3 border border-gray-200 text-left">Manufacturer</th>
              <th className="p-3 border border-gray-200 text-left">Calibre</th>
            </tr>
          </thead>
          <tbody>
            {firearms.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  {searchQuery ? 'No firearms found matching your search' : 'No firearms in inventory'}
                </td>
              </tr>
            ) : (
              firearms.map((firearm) => (
                <tr key={firearm.id || firearm.serial_number} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-200">{firearm.serial_number}</td>
                  <td className="p-3 border border-gray-200">{firearm.model}</td>
                  <td className="p-3 border border-gray-200">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {FIREARM_TYPES.find(t => t.value === firearm.type)?.label || firearm.type}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-200">{firearm.manufacturer}</td>
                  <td className="p-3 border border-gray-200">{firearm.calibre}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Replace your current return with this temporarily
return (
  <AdminLayout>
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-4">Firearms Inventory</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <pre>Service Status: {JSON.stringify(serviceStatus, null, 2)}</pre>
        <pre>Firearms Data: {JSON.stringify(firearms.slice(0, 3), null, 2)}</pre>
        <pre>Stats: {JSON.stringify(stats, null, 2)}</pre>
      </div>

      {renderFirearmsTable()}
    </div>
  </AdminLayout>
);
}