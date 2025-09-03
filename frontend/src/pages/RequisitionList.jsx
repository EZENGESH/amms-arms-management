// src/pages/RequisitionList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function RequisitionList() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch requisitions on component mount
  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const response = await axios.get('http://localhost:8003/api/requisitions/');
        setRequisitions(response.data);
      } catch (error) {
        console.error('Error fetching requisitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-blue-500">Loading requisitions...</div>;
  }

  if (requisitions.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No requisitions found.
        <div className="mt-4">
          <Link to="/requisition/new" className="text-blue-500 underline">
            Create a new requisition
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Requisitions</h1>
      
      <div className="space-y-6">
        {requisitions.map((req) => (
          <div key={req.id} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            {/* FIX: Display fields that match the form data */}
            <h2 className="text-2xl font-semibold text-gray-700">
              {req.rank} {req.name} ({req.service_number})
            </h2>
            <p className="text-gray-600 mt-2">
              <span className="font-medium">Unit:</span> {req.station_unit}
            </p>
            <p className="text-gray-600 mt-1">
              <span className="font-medium">Firearm:</span> {req.firearm_type}
            </p>
            <p className="text-gray-600 mt-1">
              <span className="font--medium">Quantity:</span> {req.quantity}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link to="/requisition/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          + Create New Requisition
        </Link>
      </div>
    </div>
  );
}
