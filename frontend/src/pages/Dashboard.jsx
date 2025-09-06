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
    const checkAuthAndFetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Debug: Check localStorage contents
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      
      console.log("Dashboard mounted - Checking localStorage:");
      console.log("access_token:", accessToken);
      console.log("refresh_token:", refreshToken);
      console.log("All localStorage keys:", Object.keys(localStorage));

      if (!accessToken) {
        const errorMsg = "No authentication token found. Please log in.";
        console.error(errorMsg);
        setError(errorMsg);
        setIsLoading(false);
        
        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      try {
        console.log("Tokens found, proceeding with API calls...");
        
        // For now, let's just set some demo data since we can't make API calls without proper tokens
        setStats({
          totalArms: 24,
          activeRequisitions: 5,
          registeredUsers: 12,
        });

        setArmsData({
          labels: ["Rifle", "Pistol", "Shotgun"],
          datasets: [
            {
              label: "Number of Items",
              data: [12, 8, 4],
              backgroundColor: "rgba(53, 162, 235, 0.5)",
              borderColor: "rgb(53, 162, 235)",
              borderWidth: 1,
            },
          ],
        });

        setRequisitionData({
          labels: ["Pending", "Approved", "Rejected"],
          datasets: [
            {
              label: "Requisitions",
              data: [5, 8, 3],
              backgroundColor: [
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(255, 99, 132, 0.6)",
              ],
            },
          ],
        });

        setRecentActivities([
          {
            id: 1,
            firearm_type: "Rifle",
            status: "Pending",
            name: "John Doe",
            service_number: "12345",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            firearm_type: "Pistol",
            status: "Approved",
            name: "Jane Smith",
            service_number: "67890",
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]);

      } catch (err) {
        console.error("Dashboard data setup error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
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
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Loading Dashboard...</p>
          <p className="text-sm text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      {error ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-semibold">Authentication Required</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting to login page...</p>
          <p className="text-xs mt-1 text-yellow-600">
            Debug: Check if tokens are being stored in localStorage after login
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}