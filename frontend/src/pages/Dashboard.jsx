// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
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
import { api, inventoryApi, requisitionApi } from "../services/apiClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalArms: 0, activeRequisitions: 0, registeredUsers: 0 });
  const [armsData, setArmsData] = useState({ labels: [], datasets: [] });
  const [requisitionData, setRequisitionData] = useState({ labels: [], datasets: [] });
  const [recentActivities, setRecentActivities] = useState([]);

  const statusColors = {
    approved: "text-green-600",
    pending: "text-yellow-600",
    rejected: "text-red-600",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [usersRes, inventoryRes, requisitionsRes] = await Promise.all([
          api.get("/api/v1/users/"),
          inventoryApi.get("/api/v1/arms/"),
          requisitionApi.get("/api/requisitions/"),
        ]);

        const users = usersRes.data.results || usersRes.data || [];
        const inventory = inventoryRes.data.results || inventoryRes.data || [];
        const requisitions = requisitionsRes.data.results || requisitionsRes.data || [];

        // ===== Stats =====
        setStats({
          totalArms: inventory.reduce((sum, arm) => sum + (arm.quantity || 1), 0),
          activeRequisitions: requisitions.filter(r => r.status?.toLowerCase() === "pending").length,
          registeredUsers: users.length,
        });

        // ===== Arms Chart =====
        const typeCounts = inventory.reduce((acc, item) => {
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

        // ===== Requisition Chart =====
        const statusCounts = requisitions.reduce((acc, r) => {
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

        // ===== Recent Activities =====
        const sortedActivities = [...requisitions].sort(
          (a, b) => new Date(b.created_at || b.date_created || 0) - new Date(a.created_at || a.date_created || 0)
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
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (isLoading) return <div className="flex justify-center items-center h-screen text-lg">Loading Dashboard...</div>;

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Arms" value={stats.totalArms} />
          <StatCard title="Active Requisitions" value={stats.activeRequisitions} />
          <StatCard title="Registered Users" value={stats.registeredUsers} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {armsData.labels.length > 0 && <ChartWrapper chart={<Bar data={armsData} options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Arms Inventory by Type" } } }} />} />}
          {requisitionData.labels.length > 0 && <ChartWrapper chart={<Pie data={requisitionData} options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Requisition Status" } } }} />} />}
        </div>

        <RecentActivities activities={recentActivities} statusColors={statusColors} />
      </div>
    </AdminLayout>
  );
}

// ===== Subcomponents =====
const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <p className="text-gray-500">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const ChartWrapper = ({ chart }) => <div className="bg-white p-6 rounded-xl shadow-sm">{chart}</div>;

const RecentActivities = ({ activities, statusColors }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h2>
    {activities.length > 0 ? (
      activities.map((activity) => (
        <div key={activity.id || activity.pk} className="border-b pb-3 mb-3">
          <div className="flex justify-between">
            <p className="font-medium">New Requisition: {activity.firearm_type || "N/A"}</p>
            <span className="text-sm text-gray-500">
              {new Date(activity.created_at || activity.date_created || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <p className={`text-sm ${statusColors[activity.status?.toLowerCase()] || "text-gray-600"}`}>
            Status: {activity.status || "Unknown"} | By: {activity.name || "N/A"} ({activity.service_number || "N/A"})
          </p>
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-600">No recent activities found.</p>
    )}
  </div>
);
