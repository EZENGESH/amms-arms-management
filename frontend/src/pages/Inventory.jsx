import { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  getInventory,
  getInventoryDashboard,
  checkInventoryServiceHealth,
  FIREARM_TYPES
} from '../services/inventory';

export default function Inventory() {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [serviceStatus, setServiceStatus] = useState({ 
    isHealthy: false,
    error: null
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
    const initialize = async () => {
      const status = await checkInventoryServiceHealth();
      setServiceStatus(status);
      if (status.isHealthy) {
        await fetchData();
      }
    };
    initialize();
  }, []);

  const renderTable = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!firearms.length) return <div>No firearms found</div>;

    return (
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Serial</th>
            <th className="p-2 border">Model</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Manufacturer</th>
          </tr>
        </thead>
        <tbody>
          {firearms.map(firearm => (
            <tr key={firearm.id}>
              <td className="p-2 border">{firearm.serial_number}</td>
              <td className="p-2 border">{firearm.model}</td>
              <td className="p-2 border">
                {FIREARM_TYPES.find(t => t.value === firearm.type)?.label || firearm.type}
              </td>
              <td className="p-2 border">{firearm.manufacturer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Firearm Inventory</h1>
        {!serviceStatus.isHealthy && (
          <div className="bg-yellow-100 p-3 mb-4 rounded">
            Service unavailable: {serviceStatus.error}
          </div>
        )}
        {renderTable()}
      </div>
    </AdminLayout>
  );
}