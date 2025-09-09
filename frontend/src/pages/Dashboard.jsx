// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
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
import { api, inventoryApi, requisitionApi } from "../services/apiClient";
import {
  FiUsers,
  FiPieChart,
  FiClipboard,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw
} from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalArms: 0,
    activeRequisitions: 0,
    registeredUsers: 0,
    previousStats: {}
  });
  const [armsData, setArmsData] = useState({ labels: [], datasets: [] });
  const [requisitionData, setRequisitionData] = useState({ labels: [], datasets: [] });
  const [recentActivities, setRecentActivities] = useState([]);

  const statusColors = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  };

  const statusIcons = {
    approved: "✅",
    pending: "⏳",
    rejected: "❌",
    completed: "✅",
  };

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const [usersRes, inventoryRes, requisitionsRes] = await Promise.all([
        api.get("/api/v1/users/"),
        inventoryApi.get("/api/arms/"),
        requisitionApi.get("/api/requisitions/"),
      ]);

      const users = usersRes.data.results || usersRes.data || [];
      const inventory = inventoryRes.data.results || inventoryRes.data || [];
      const requisitions = requisitionsRes.data.results || requisitionsRes.data || [];

      // ===== Stats =====
      const newTotalArms = inventory.reduce((sum, arm) => sum + (arm.quantity || 1), 0);
      const newActiveRequisitions = requisitions.filter(r => r.status?.toLowerCase() === "pending").length;
      const newRegisteredUsers = users.length;

      setStats(prev => ({
        totalArms: newTotalArms,
        activeRequisitions: newActiveRequisitions,
        registeredUsers: newRegisteredUsers,
        previousStats: {
          totalArms: prev.totalArms,
          activeRequisitions: prev.activeRequisitions,
          registeredUsers: prev.registeredUsers
        }
      }));

      // ===== Arms Chart =====
      const typeCounts = inventory.reduce((acc, item) => {
        const type = item.type || "Unknown";
        acc[type] = (acc[type] || 0) + (item.quantity || 1);
        return acc;
      }, {});

      const backgroundColors = [
        "rgba(54, 162, 235, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(255, 159, 64, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 99, 132, 0.8)",
        "rgba(255, 205, 86, 0.8)",
      ];

      setArmsData({
        labels: Object.keys(typeCounts),
        datasets: [
          {
            label: "Number of Items",
            data: Object.values(typeCounts),
            backgroundColor: Object.keys(typeCounts).map((_, i) =>
              backgroundColors[i % backgroundColors.length]
            ),
            borderColor: Object.keys(typeCounts).map((_, i) =>
              backgroundColors[i % backgroundColors.length].replace('0.8', '1')
            ),
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      });

      // ===== Requisition Chart =====
      const statusCounts = requisitions.reduce((acc, r) => {
        const status = r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase() : "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const chartColors = {
        Approved: "rgba(75, 192, 192, 0.8)",
        Pending: "rgba(255, 206, 86, 0.8)",
        Rejected: "rgba(255, 99, 132, 0.8)",
        Completed: "rgba(153, 102, 255, 0.8)",
      };

      setRequisitionData({
        labels: Object.keys(statusCounts),
        datasets: [
          {
            label: "Requisitions",
            data: Object.values(statusCounts),
            backgroundColor: Object.keys(statusCounts).map(s =>
              chartColors[s] || "rgba(201, 203, 207, 0.8)"
            ),
            borderColor: Object.keys(statusCounts).map(s =>
              (chartColors[s] || "rgba(201, 203, 207, 1)").replace('0.8', '1')
            ),
            borderWidth: 1,
            hoverOffset: 12,
          },
        ],
      });

      // ===== Recent Activities =====
      const sortedActivities = [...requisitions].sort(
        (a, b) =>
          new Date(b.created_at || b.date_created || 0) - new Date(a.created_at || a.date_created || 0)
      );
      setRecentActivities(sortedActivities.slice(0, 5));
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (isLoading)
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading Dashboard...</p>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center mt-4 sm:mt-0 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <FiRefreshCw className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Arms"
            value={stats.totalArms}
            icon={<FiPieChart className="text-blue-500" />}
            change={stats.totalArms - (stats.previousStats.totalArms || 0)}
          />
          <StatCard
            title="Active Requisitions"
            value={stats.activeRequisitions}
            icon={<FiClipboard className="text-yellow-500" />}
            change={stats.activeRequisitions - (stats.previousStats.activeRequisitions || 0)}
          />
          <StatCard
            title="Registered Users"
            value={stats.registeredUsers}
            icon={<FiUsers className="text-green-500" />}
            change={stats.registeredUsers - (stats.previousStats.registeredUsers || 0)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {armsData.labels.length > 0 && (
            <ChartWrapper
              title="Arms Inventory by Type"
              chart={
                <Bar
                  data={armsData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          usePointStyle: true,
                          padding: 20
                        }
                      },
                      title: {
                        display: true,
                        text: "Arms Inventory by Type",
                        font: { size: 16 },
                        padding: { bottom: 20 }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              }
            />
          )}
          {requisitionData.labels.length > 0 && (
            <ChartWrapper
              title="Requisition Status"
              chart={
                <Doughnut
                  data={requisitionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          usePointStyle: true,
                          padding: 20
                        }
                      },
                      title: {
                        display: true,
                        text: "Requisition Status",
                        font: { size: 16 },
                        padding: { bottom: 20 }
                      }
                    },
                    cutout: '60%',
                  }}
                />
              }
            />
          )}
        </div>

        <RecentActivities activities={recentActivities} statusColors={statusColors} statusIcons={statusIcons} />
      </div>
    </AdminLayout>
  );
}

// ===== Subcomponents =====
const StatCard = ({ title, value, icon, change }) => {
  const changeValue = change || 0;
  const isPositive = changeValue >= 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-800">{value.toLocaleString()}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
              <span>{Math.abs(changeValue)} from last refresh</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-gray-100">
          {icon}
        </div>
      </div>
    </div>
  );
};

const ChartWrapper = ({ title, chart }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {chart}
  </div>
);

const RecentActivities = ({ activities, statusColors, statusIcons }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
        <FiActivity className="mr-2 text-blue-500" />
        Recent Activity
      </h2>
      <span className="text-sm text-gray-500">{activities.length} activities</span>
    </div>

    {activities.length > 0 ? (
      <div className="divide-y divide-gray-100">
        {activities.map((activity) => {
          const status = activity.status?.toLowerCase() || "unknown";
          return (
            <div key={activity.id || activity.pk} className="py-4 first:pt-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {statusIcons[status] || "📋"} New Requisition: {activity.firearm_type || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    By: {activity.name || "N/A"} ({activity.service_number || "N/A"})
                  </p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                  {new Date(activity.created_at || activity.date_created || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
                  Status: {activity.status || "Unknown"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-sm text-gray-600">No recent activities found.</p>
      </div>
    )}
  </div>
);