// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
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

// Placeholder RecentActivity component
const RecentActivity = () => (
  <div className="space-y-4">
    <div className="border-b pb-3">
      <div className="flex justify-between">
        <p className="font-medium">New requisition submitted</p>
        <span className="text-sm text-gray-500">10 min ago</span>
      </div>
      <p className="text-sm text-gray-600">
        Capt. John Smith requested ammunition
      </p>
    </div>
    <div className="border-b pb-3">
      <div className="flex justify-between">
        <p className="font-medium">Requisition approved</p>
        <span className="text-sm text-gray-500">2 hours ago</span>
      </div>
      <p className="text-sm text-gray-600">
        Lt. Sarah Johnson's request was approved
      </p>
    </div>
    <div>
      <div className="flex justify-between">
        <p className="font-medium">Inventory updated</p>
        <span className="text-sm text-gray-500">Yesterday</span>
      </div>
      <p className="text-sm text-gray-600">5 new rifles added to inventory</p>
    </div>
  </div>
);

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArms: 0,
    activeRequisitions: 0,
    registeredUsers: 0,
    alerts: 0,
  });

  const [armsData, setArmsData] = useState({
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

  const [requisitionData, setRequisitionData] = useState({
    labels: [],
    datasets: [
      {
        label: "Requisitions",
        data: [],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });

  // Simulated API fetch
  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setStats({
        totalArms: 120,
        activeRequisitions: 15,
        registeredUsers: 8,
        alerts: 3,
      });

      setArmsData({
        labels: ["Rifles", "Pistols", "Ammunition", "Accessories"],
        datasets: [
          {
            label: "Number of Items",
            data: [45, 30, 25, 20],
            backgroundColor: "rgba(53, 162, 235, 0.5)",
            borderColor: "rgb(53, 162, 235)",
            borderWidth: 1,
          },
        ],
      });

      setRequisitionData({
        labels: ["Approved", "Pending", "Rejected"],
        datasets: [
          {
            label: "Requisitions",
            data: [8, 5, 2],
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(255, 99, 132, 0.6)",
            ],
            borderColor: [
              "rgba(75, 192, 192, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(255, 99, 132, 1)",
            ],
            borderWidth: 1,
          },
        ],
      });

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer); // cleanup on unmount
  }, []);

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Arms Inventory by Category" },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Requisition Status Distribution" },
    },
  };

  return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card title="Total Arms" icon="🛡️" trend="up" trendValue="5%">
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalArms}
                </p>
                <p className="text-sm text-gray-500 mt-1">+2 from last week</p>
              </Card>

              <Card
                title="Active Requisitions"
                icon="📋"
                trend="down"
                trendValue="10%"
              >
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeRequisitions}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  3 awaiting approval
                </p>
              </Card>

              <Card title="Registered Users" icon="👥" trend="up" trendValue="20%">
                <p className="text-3xl font-bold text-purple-600">
                  {stats.registeredUsers}
                </p>
                <p className="text-sm text-gray-500 mt-1">2 admins, 6 regular</p>
              </Card>

              <Card title="Alerts" icon="⚠️" trend="neutral">
                <p className="text-3xl font-bold text-amber-500">{stats.alerts}</p>
                <p className="text-sm text-gray-500 mt-1">2 expiring soon</p>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Arms by Category
                </h2>
                <div className="h-64">
                  <Bar data={armsData} options={barOptions} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Requisition Status
                </h2>
                <div className="h-64">
                  <Pie data={requisitionData} options={pieOptions} />
                </div>
              </div>
            </div>

            {/* Recent Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Recent Activity
                </h2>
                <RecentActivity />
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Quick Actions
                </h2>
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
          </>
        )}
      </div>
   
  );
}

export default Dashboard;
