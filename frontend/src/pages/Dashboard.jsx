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
// FIX: Import the central API clients. The interceptors in these clients will handle auth.
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

const RecentActivity = ({ activities }) => (
  <div className="space-y-4">
    {activities.length > 0 ? (
      activities.map((activity) => (
        <div key={activity.id} className="border-b pb-3">
          <div className="flex justify-between">
            <p className="font-medium">New Requisition: {activity.firearm_type}</p>
            <span className="text-sm text-gray-500">
              {new Date(activity.created_at || activity.date_created).toLocaleDateString()}
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
  const [armsData, setArmsData] = useState({ labels: [], datasets: [] });
  const [requisitionData, setRequisitionData] = useState({ labels: [], datasets: [] });

  // FIX: All custom auth logic (checkAuthentication, refreshAuthToken, makeAuthenticatedRequest) has been removed.
  // We will rely on the apiClient's interceptors to handle tokens.

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // FIX: Use Promise.all with the central API clients directly.
        const [inventoryRes, requisitionsRes, usersRes] = await Promise.all([
          inventoryApi.get("/api/arms/"),
          requisitionApi.get("/api/requisitions/"),
          api.get("/api/users/"),
        ]);

        // Extract data, handling potential pagination from Django REST Framework
        const inventoryData = inventoryRes.data.results || inventoryRes.data || [];
        const requisitionsData = requisitionsRes.data.results || requisitionsRes.data || [];
        const usersData = usersRes.data.results || usersRes.data || [];

        // --- Process Stats ---
        setStats({
          totalArms: inventoryRes.data.count || inventoryData.length,
          activeRequisitions: requisitionsData.filter(req => req.status?.toLowerCase() === "pending").length,
          registeredUsers: usersRes.data.count || usersData.length,
        });

        // --- Process Arms Chart Data ---
        const typeCounts = inventoryData.reduce((acc, firearm) => {
          const type = firearm.type || "Unknown";
          acc[type] = (acc[type] || 0) + (firearm.quantity || 1);
          return acc;
        }, {});

        setArmsData({
          labels: Object.keys(typeCounts),
          datasets: [{
            label: "Number of Items",
            data: Object.values(typeCounts),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          }],
        });

        // --- Process Requisition Chart Data ---
        const requisitionsByStatus = requisitionsData.reduce((acc, req) => {
          const status = req.status || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        const statusColors = {
          Approved: "rgba(75, 192, 192, 0.6)",
          Pending: "rgba(255, 206, 86, 0.6)",
          Rejected: "rgba(255, 99, 132, 0.6)",
        };

        setRequisitionData({
          labels: Object.keys(requisitionsByStatus),
          datasets: [{
            label: "Requisitions",
            data: Object.values(requisitionsByStatus),
            backgroundColor: Object.keys(requisitionsByStatus).map(status => statusColors[status] || 'rgba(201, 203, 207, 0.6)'),
          }],
        });

        // --- Process Recent Activities ---
        const sortedRequisitions = [...requisitionsData].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        setRecentActivities(sortedRequisitions.slice(0, 5));

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // If the interceptor fails to refresh the token, it will throw an error.
        // We catch it here and redirect to login.
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Your session has expired. Please log in again.");
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError("Failed to fetch dashboard data. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Chart options... (rest of the component is the same)
  // ...
// ... (The rest of your return statement remains the same)
// ...
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Total Arms"><p className="text-3xl font-bold">{stats.totalArms}</p></Card>
        <Card title="Active Requisitions"><p className="text-3xl font-bold">{stats.activeRequisitions}</p></Card>
        <Card title="Registered Users"><p className="text-3xl font-bold">{stats.registeredUsers}</p></Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {armsData.labels.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Bar data={armsData} options={barOptions} />
          </div>
        )}
        {requisitionData.labels.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Pie data={requisitionData} options={pieOptions} />
          </div>
        )}
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