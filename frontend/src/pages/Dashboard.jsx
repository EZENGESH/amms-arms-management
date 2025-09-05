import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Card from "../components/Card";
import { api, inventoryApi, requisitionApi } from "../services/apiClient";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// A sub-component to render recent activities
const RecentActivity = ({ activities }) => (
  <div className="space-y-4">
    {activities.length > 0 ? (
      activities.map((activity) => (
        <div key={activity.id} className="border-b pb-3">
          <div className="flex justify-between">
            <p className="font-medium">New Requisition: {activity.firearm_type}</p>
            <span className="text-sm text-gray-500">
              {new Date(activity.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Status: {activity.status} | By: {activity.name} ({activity.service_number})
          </p>
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-600">No recent activities found.</p>
    )}
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalArms: 0,
    activeRequisitions: 0,
    registeredUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const [armsData, setArmsData] = useState({
    labels: [],
    datasets: [{ label: "Number of Items", data: [] }],
  });

  const [requisitionData, setRequisitionData] = useState({
    labels: [],
    datasets: [{ label: "Requisitions", data: [] }],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all data concurrently using the API clients
        const [inventoryDashboardRes, requisitionsRes, usersRes] = await Promise.all([
          inventoryApi.get("/dashboard/"),
          requisitionApi.get("/requisitions/"),
          api.get("/users/"),
        ]);

        // --- Process Stats ---
        // Handle different possible response structures
        const inventoryData = inventoryDashboardRes.data;
        const totalFirearms = inventoryData.summary?.total_firearms || 
                             inventoryData.total_firearms || 
                             inventoryData.total || 0;

        const activeRequisitionsCount = requisitionsRes.data.filter(
          (req) => req.status === "Pending"
        ).length;

        setStats({
          totalArms: totalFirearms,
          activeRequisitions: activeRequisitionsCount,
          registeredUsers: usersRes.data.length || 0,
        });

        // --- Process Arms Chart Data ---
        // Handle different possible structures for type statistics
        const typeStats = inventoryData.type_statistics || 
                         inventoryData.types || 
                         inventoryData.stats || 
                         [];

        setArmsData({
          labels: typeStats.map(stat => stat.type || stat.name || "Unknown"),
          datasets: [
            {
              label: "Number of Items",
              data: typeStats.map(stat => stat.count || stat.quantity || 0),
              backgroundColor: "rgba(53, 162, 235, 0.5)",
              borderColor: "rgb(53, 162, 235)",
              borderWidth: 1,
            },
          ],
        });

        // --- Process Requisition Chart Data ---
        const requisitionsByStatus = requisitionsRes.data.reduce((acc, req) => {
          const status = req.status || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        const statusColors = {
          Approved: "rgba(75, 192, 192, 0.6)",
          Pending: "rgba(255, 206, 86, 0.6)",
          Rejected: "rgba(255, 99, 132, 0.6)",
          Issued: "rgba(153, 102, 255, 0.6)",
          Returned: "rgba(255, 159, 64, 0.6)",
        };

        setRequisitionData({
          labels: Object.keys(requisitionsByStatus),
          datasets: [
            {
              label: "Requisitions",
              data: Object.values(requisitionsByStatus),
              backgroundColor: Object.keys(requisitionsByStatus).map(
                status => statusColors[status] || 'rgba(201, 203, 207, 0.6)'
              ),
            },
          ],
        });

        // --- Process Recent Activities ---
        const sortedRequisitions = requisitionsRes.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentActivities(sortedRequisitions.slice(0, 5));

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to fetch dashboard data. Please try again later.");
        
        // Set fallback data to prevent complete breakdown
        setStats({
          totalArms: 0,
          activeRequisitions: 0,
          registeredUsers: 0,
        });
        
        setRecentActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart options
  const barOptions = { 
    responsive: true, 
    plugins: { 
      legend: { position: "top" }, 
      title: { display: true, text: "Arms Inventory by Type" } 
    } 
  };
  
  const pieOptions = { 
    responsive: true, 
    plugins: { 
      legend: { position: "top" }, 
      title: { display: true, text: "Requisition Status" } 
    } 
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">Loading Dashboard...</p></div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100 text-red-700 p-4">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Total Arms"><p className="text-3xl font-bold">{stats.totalArms}</p></Card>
        <Card title="Active Requisitions"><p className="text-3xl font-bold">{stats.activeRequisitions}</p></Card>
        <Card title="Registered Users"><p className="text-3xl font-bold">{stats.registeredUsers}</p></Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Bar data={armsData} options={barOptions} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Pie data={requisitionData} options={pieOptions} />
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h2>
          <RecentActivity activities={recentActivities} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/requisitions/new')} 
              className="w-full bg-blue-100 text-blue-600 p-3 rounded-lg hover:bg-blue-200 transition"
            >
              New Requisition
            </button>
            <button 
              onClick={() => navigate('/reports')} 
              className="w-full bg-green-100 text-green-600 p-3 rounded-lg hover:bg-green-200 transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}