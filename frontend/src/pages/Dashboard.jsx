// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
import AdminLayout from "../layouts/AdminLayout";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [armsData, setArmsData] = useState({ labels: [], datasets: [] });
  const [requisitionData, setRequisitionData] = useState({ labels: [], datasets: [] });
  const [recentActivities, setRecentActivities] = useState([]);

  // API endpoints
  const API_BASE_URL = {
    inventory: "http://localhost:8009/api/arms/",
    requisitions: "http://localhost:8003/api/requisitions/",
    users: "http://localhost:8001/api/v1/users/",
  };

  // Attach token to axios
  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const statusColors = {
    approved: "text-green-600",
    pending: "text-yellow-600",
    rejected: "text-red-600",
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [usersRes, inventoryRes, requisitionsRes] = await Promise.all([
          axios.get(API_BASE_URL.users, axiosConfig),
          axios.get(API_BASE_URL.inventory, axiosConfig),
          axios.get(API_BASE_URL.requisitions, axiosConfig),
        ]);

        const usersData = usersRes.data.results || usersRes.data || [];
        const inventoryData = inventoryRes.data.results || inventoryRes.data || [];
        const requisitionsData = requisitionsRes.data.results || requisitionsRes.data || [];

        // Stats
        setStats({
          totalArms: inventoryData.reduce((sum, arm) => sum + (arm.quantity || 1), 0),
          activeRequisitions: requisitionsData.filter(r => r.status?.toLowerCase() === "pending").length,
          registeredUsers: usersData.length,
        });

        // Arms chart
        const typeCounts = inventoryData.reduce((acc, item) => {
          const type = item.type || "Unknown";
          acc[type] = (acc[type] || 0) + (item.quantity || 1);
          return acc;
        }, {});
        setArmsData({
          labels: Object.keys(typeCounts),
          datasets: [
            {
              label: "Number of Items",
              data: Object.values(typeCounts),
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        });

        // Requisition chart
        const statusCounts = requisitionsData.reduce((acc, r) => {
          const status = r.status || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        const chartColors = {
          Approved: "rgba(75, 192, 192, 0.6)",
          Pending: "rgba(255, 206, 86, 0.6)",
          Rejected: "rgba(255, 99, 132, 0.6)",
        };
        setRequisitionData({
          labels: Object.keys(statusCounts),
          datasets: [
            {
              label: "Requisitions",
              data: Object.values(statusCounts),
              backgroundColor: Object.keys(statusCounts).map(s => chartColors[s] || "rgba(201,203,207,0.6)"),
            },
          ],
        });

        // Recent activities (latest 5)
        const sortedActivities = [...requisitionsData].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        setRecentActivities(sortedActivities.slice(0, 5));
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError("Failed to load dashboard data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: "top" }, title: { display: true, text: "Arms Inventory by Type" } },
  };
  const pieOptions = {
    responsive: true,
    plugins: { legend: { position: "top" }, title: { display: true, text: "Requisition Status" } },
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-lg">Loading Dashboard...</div>
    );

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500">Total Arms</p>
            <p className="text-3xl font-bold mt-2">{stats.totalArms}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500">Active Requisitions</p>
            <p className="text-3xl font-bold mt-2">{stats.activeRequisitions}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500">Registered Users</p>
            <p className="text-3xl font-bold mt-2">{stats.registeredUsers}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {armsData.labels.length > 0 && <Bar data={armsData} options={barOptions} className="bg-white p-6 rounded-xl shadow-sm" />}
          {requisitionData.labels.length > 0 && <Pie data={requisitionData} options={pieOptions} className="bg-white p-6 rounded-xl shadow-sm" />}
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h2>
          {recentActivities.length > 0 ? (
            recentActivities.map(activity => (
              <div key={activity.id} className="border-b pb-3 mb-3">
                <div className="flex justify-between">
                  <p className="font-medium">New Requisition: {activity.firearm_type}</p>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.created_at || activity.date_created).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm ${statusColors[activity.status?.toLowerCase()] || "text-gray-600"}`}>
                  Status: {activity.status} | By: {activity.name} ({activity.service_number})
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No recent activities found.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}