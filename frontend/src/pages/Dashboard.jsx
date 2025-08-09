// src/pages/Dashboard.jsx
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/Card';


function Dashboard() {
  // Sample data
  const armsData = [
    { category: 'Rifles', count: 45 },
    { category: 'Pistols', count: 30 },
    { category: 'Ammunition', count: 25 },
    { category: 'Accessories', count: 20 }
  ];

  const requisitionStatus = [
    { status: 'Approved', count: 8 },
    { status: 'Pending', count: 5 },
    { status: 'Rejected', count: 2 }
  ];

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            title="Total Arms" 
            icon="🛡️"
            trend="up"
            trendValue="5%"
          >
            <p className="text-3xl font-bold text-blue-600">120</p>
            <p className="text-sm text-gray-500 mt-1">+2 from last week</p>
          </Card>
          
          <Card 
            title="Active Requisitions" 
            icon="📋"
            trend="down"
            trendValue="10%"
          >
            <p className="text-3xl font-bold text-green-600">15</p>
            <p className="text-sm text-gray-500 mt-1">3 awaiting approval</p>
          </Card>
          
          <Card 
            title="Registered Users" 
            icon="👥"
            trend="up"
            trendValue="20%"
          >
            <p className="text-3xl font-bold text-purple-600">8</p>
            <p className="text-sm text-gray-500 mt-1">2 admins, 6 regular</p>
          </Card>
          
          <Card 
            title="Alerts" 
            icon="⚠️"
            trend="neutral"
          >
            <p className="text-3xl font-bold text-amber-500">3</p>
            <p className="text-sm text-gray-500 mt-1">2 expiring soon</p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Arms by Category</h2>
            <BarChart data={armsData} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Requisition Status</h2>
            <PieChart data={requisitionStatus} />
          </div>
        </div>

        {/* Recent Activity + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h2>
            <RecentActivity />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-100 text-blue-600 p-3 rounded-lg flex items-center gap-2 hover:bg-blue-200 transition">
                <span>➕</span> New Requisition
              </button>
              <button className="w-full bg-green-100 text-green-600 p-3 rounded-lg flex items-center gap-2 hover:bg-green-200 transition">
                <span>📋</span> Generate Report
              </button>
              <button className="w-full bg-purple-100 text-purple-600 p-3 rounded-lg flex items-center gap-2 hover:bg-purple-200 transition">
                <span>👤</span> Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;