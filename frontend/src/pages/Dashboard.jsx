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

  // Function to manually add auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if user is authenticated
        const token = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!token && !refreshToken) {
          throw new Error("No authentication tokens found. Please log in.");
        }

        console.log("Access Token exists:", !!token);
        console.log("Refresh Token exists:", !!refreshToken);

        // Fetch all data concurrently using the API clients with manual auth headers
        const [inventoryRes, requisitionsRes, usersRes] = await Promise.all([
          inventoryApi.get("/api/arms/", getAuthHeaders()),
          requisitionApi.get("/api/requisitions/", getAuthHeaders()),
          api.get("/api/users/", getAuthHeaders()),
        ]);

        // --- Process Stats ---
        const firearmsData = inventoryRes.data.results || inventoryRes.data || [];
        const totalFirearms = inventoryRes.data.count || firearmsData.length || 0;
        
        const requisitionsData = requisitionsRes.data.results || requisitionsRes.data || [];
        const activeRequisitionsCount = requisitionsData.filter(
          (req) => req.status === "Pending" || req.status === "pending"
        ).length;

        const usersData = usersRes.data.results || usersRes.data || [];
        const usersCount = usersRes.data.count || usersData.length || 0;

        setStats({
          totalArms: totalFirearms,
          activeRequisitions: activeRequisitionsCount,
          registeredUsers: usersCount,
        });

        // --- Process Arms Chart Data ---
        const typeCounts = {};
        
        firearmsData.forEach(firearm => {
          const type = firearm.type || firearm.firearm_type || "Unknown";
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        setArmsData({
          labels: Object.keys(typeCounts),
          datasets: [
            {
              label: "Number of Items",
              data: Object.values(typeCounts),
              backgroundColor: "rgba(53, 162, 235, 0.5)",
              borderColor: "rgb(53, 162, 235)",
              borderWidth: 1,
            },
          ],
        });

        // --- Process Requisition Chart Data ---
        const requisitionsByStatus = requisitionsData.reduce((acc, req) => {
          const status = req.status || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        const statusColors = {
          Approved: "rgba(75, 192, 192, 0.6)",
          approved: "rgba(75, 192, 192, 0.6)",
          Pending: "rgba(255, 206, 86, 0.6)",
          pending: "rgba(255, 206, 86, 0.6)",
          Rejected: "rgba(255, 99, 132, 0.6)",
          rejected: "rgba(255, 99, 132, 0.6)",
          Issued: "rgba(153, 102, 255, 0.6)",
          issued: "rgba(153, 102, 255, 0.6)",
          Returned: "rgba(255, 159, 64, 0.6)",
          returned: "rgba(255, 159, 64, 0.6)",
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
        const sortedRequisitions = [...requisitionsData].sort(
          (a, b) => new Date(b.created_at || b.date_created || 0) - new Date(a.created_at || a.date_created || 0)
        );
        setRecentActivities(sortedRequisitions.slice(0, 5));

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
          // Clear invalid tokens
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          // Redirect to login if authentication fails
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 404) {
          setError("API endpoints not found. Please check if the backend services are running.");
        } else if (err.message?.includes("No authentication token")) {
          setError("Please log in to access the dashboard.");
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError("Failed to fetch dashboard data. Please try again later.");
        }
        
        // Set empty data
        setStats({
          totalArms: 0,
          activeRequisitions: 0,
          registeredUsers: 0,
        });
        
        setArmsData({
          labels: [],
          datasets: [
            {
              label: "Number of Items",
              data: [],
              backgroundColor: "rgba(53, 162, 235, 0.5)",
              borderColor: "rgb(53, 162, 235)",
              borderWidth: 1,
            },
          ],
        });
        
        setRequisitionData({
          labels: [],
          datasets: [
            {
              label: "Requisitions",
              data: [],
              backgroundColor: [],
            },
          ],
        });
        
        setRecentActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
          <p className="text-sm mt-1">Please ensure you are logged in and have proper permissions.</p>
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