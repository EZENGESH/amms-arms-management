// src/pages/Dashboard.jsx
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/Card';

function Dashboard() {
  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Total Arms">
            <p className="text-2xl font-semibold text-blue-600">120</p>
          </Card>
          <Card title="Active Requisitions">
            <p className="text-2xl font-semibold text-green-600">15</p>
          </Card>
          <Card title="Users">
            <p className="text-2xl font-semibold text-purple-600">8</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;