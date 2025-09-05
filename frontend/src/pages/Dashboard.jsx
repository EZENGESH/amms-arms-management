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

// Custom refresh token function that handles both 401 and 403
async function refreshAuthToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch("http://localhost:8001/api/auth/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  } catch (error) {
    console.error("Token refresh error:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    throw error;
  }
}

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

  // Enhanced API call function with token refresh and retry logic
  const makeAuthenticatedRequest = async (apiInstance, endpoint, retry = true) => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      const response = await apiInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (error) {
      // If we get 403 and have retries left, try to refresh token
      if (retry && (error.response?.status === 403 || error.response?.status === 401)) {
        console.log("Attempting token refresh due to authentication error");
        try {
          const newToken = await refreshAuthToken();
          // Retry the request with new token
          const retryResponse = await apiInstance.get(endpoint, {
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          });
          return retryResponse;
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw new Error("Authentication failed. Please log in again.");
        }
      }
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if we have both tokens
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!accessToken || !refreshToken) {
          throw new Error("Authentication required. Please log in.");
        }

        console.log("Tokens found, attempting to fetch data...");

        // Fetch all data with enhanced authentication handling
        const [inventoryRes, requisitionsRes, usersRes] = await Promise.allSettled([
          makeAuthenticatedRequest(inventoryApi, "/api/firearms/"),
          makeAuthenticatedRequest(requisitionApi, "/api/requisitions/"),
          makeAuthenticatedRequest(api, "/api/users/"),
        ]);

        // Check for any failed requests
        const failedRequests = [inventoryRes, requisitionsRes, usersRes].filter(
          result => result.status === 'rejected'
        );

        if (failedRequests.length > 0) {
          const firstError = failedRequests[0].reason;
          if (firstError.message.includes("Authentication failed") || 
              firstError.message.includes("No authentication")) {
            throw new Error("Authentication failed. Please log in again.");
          }
          throw new Error("Failed to fetch some dashboard data");
        }

        // Extract data from successful responses
        const inventoryData = inventoryRes.value.data.results || inventoryRes.value.data || [];
        const requisitionsData = requisitionsRes.value.data.results || requisitionsRes.value.data || [];
        const usersData = usersRes.value.data.results || usersRes.value.data || [];

        // --- Process Stats ---
        const totalFirearms = inventoryRes.value.data.count || inventoryData.length || 0;
        const activeRequisitionsCount = requisitionsData.filter(
          (req) => req.status === "Pending" || req.status === "pending"
        ).length;
        const usersCount = usersRes.value.data.count || usersData.length || 0;

        setStats({
          totalArms: totalFirearms,
          activeRequisitions: activeRequisitionsCount,
          registeredUsers: usersCount,
        });

        // --- Process Arms Chart Data ---
        const typeCounts = {};
        inventoryData.forEach(firearm => {
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
        
        if (err.message.includes("Authentication") || err.message.includes("log in")) {
          setError(err.message);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
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

      {/* Charts Row - Only show if we have data */}
      {(armsData.labels.length > 0 || requisitionData.labels.length > 0) && (
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
      )}

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