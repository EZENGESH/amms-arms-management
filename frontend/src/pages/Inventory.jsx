import { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  getInventory, 
  searchInventory, 
  getInventoryDashboard,
  checkInventoryServiceHealth 
} from '../services/inventory';

export default function Inventory() {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [serviceStatus, setServiceStatus] = useState({ isChecking: true });

  // Check service health on component mount
  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        const status = await checkInventoryServiceHealth();
        setServiceStatus({ ...status, isChecking: false });
        if (!status.isHealthy) {
          setError('Inventory service is unavailable. Please try again later.');
        }
      } catch (err) {
        setServiceStatus({ 
          isHealthy: false, 
          error: err.message, 
          isChecking: false 
        });
        setError('Failed to check service status. Please refresh the page.');
      }
    };
    
    checkServiceHealth();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Only proceed if service is healthy
      if (!serviceStatus.isChecking && !serviceStatus.isHealthy) {
        throw new Error('Inventory service is unavailable');
      }

      const [firearmsData, dashboardData] = await Promise.all([
        getInventory(),
        getInventoryDashboard()
      ]);
      
      if (!firearmsData || !dashboardData) {
        throw new Error('Invalid data received from server');
      }
      
      setFirearms(Array.isArray(firearmsData) ? firearmsData : []);
      setStats(dashboardData);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError(err.message || 'Failed to load inventory data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!serviceStatus.isChecking) {
      fetchData();
    }
  }, [serviceStatus.isChecking]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await searchInventory(searchQuery);
      setFirearms(Array.isArray(searchResults) ? searchResults : []);
    } catch (err) {
      console.error('Error searching inventory:', err);
      setError(err.message || 'Failed to search inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceStatusWarning = () => {
    if (serviceStatus.isChecking) return null;
    
    if (!serviceStatus.isHealthy) {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Warning: Inventory Service Status</p>
          <p>The inventory service appears to be offline or experiencing issues. Data may not be up to date.</p>
          {serviceStatus.error && <p className="text-sm mt-1">Details: {serviceStatus.error}</p>}
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading inventory...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        {renderServiceStatusWarning()}
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchData}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading || (!serviceStatus.isChecking && !serviceStatus.isHealthy)}
        >
          {loading ? 'Retrying...' : 'Retry'}
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Firearms Inventory</h1>
        
        {renderServiceStatusWarning()}
        
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Firearms</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.summary?.total_firearms || 0}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Types</h3>
              <p className="text-2xl font-bold text-green-600">{stats.type_statistics?.length || 0}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Manufacturers</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.manufacturer_statistics?.length || 0}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Calibres</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.calibre_statistics?.length || 0}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by serial number, model, manufacturer, calibre, or type..."
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!serviceStatus.isHealthy}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading || !serviceStatus.isHealthy}
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchData();
              }}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading || !serviceStatus.isHealthy}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Firearms Table */}
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
                  {searchQuery ? 'No firearms found matching your search.' : 'No firearms in inventory.'}
                </td>
              </tr>
            ) : (
              firearms.map((firearm) => (
                <tr key={firearm.id || firearm.serial_number} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-200">{firearm.serial_number}</td>
                  <td className="p-3 border border-gray-200">{firearm.model}</td>
                  <td className="p-3 border border-gray-200">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {firearm.type_display || firearm.type}
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
    </AdminLayout>
  );
}