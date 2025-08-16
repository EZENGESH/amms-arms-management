import { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { getInventory, getInventoryDashboard, FIREARM_TYPES } from '../services/inventory';

export default function Inventory() {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    summary: { total_firearms: 0 },
    type_statistics: [],
    manufacturer_statistics: [],
    calibre_statistics: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [inventoryData, dashboardData] = await Promise.all([
        getInventory(),
        getInventoryDashboard()
      ]);

      setFirearms(inventoryData);
      setStats(dashboardData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderStatsCard = (title, value) => (
    <div className="bg-white p-4 rounded shadow border">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  const renderTableRow = (firearm) => (
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading inventory data...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4">
        <h1 className="text-2xl font-bold">Firearms Inventory</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {renderStatsCard('Total Firearms', stats.summary.total_firearms)}
          {renderStatsCard('Types', stats.type_statistics.length)}
          {renderStatsCard('Manufacturers', stats.manufacturer_statistics.length)}
          {renderStatsCard('Calibres', stats.calibre_statistics.length)}
        </div>

        {/* Firearms Table */}
        {firearms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border text-left">Serial</th>
                  <th className="p-3 border text-left">Model</th>
                  <th className="p-3 border text-left">Type</th>
                  <th className="p-3 border text-left">Manufacturer</th>
                  <th className="p-3 border text-left">Calibre</th>
                </tr>
              </thead>
              <tbody>
                {firearms.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded border">
            <p className="text-lg mb-4">No firearms found in inventory</p>
            <button
              onClick={fetchData}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}