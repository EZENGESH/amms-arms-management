import { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/apiClient';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports/');
        console.log('API Response:', response.data); // Debugging log
        setReports(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      {Array.isArray(reports) && reports.length > 0 ? (
        <ul>
          {reports.map((report) => (
            <li key={report.id}>{report.title}</li>
          ))}
        </ul>
      ) : (
        <p>No reports available.</p>
      )}
    </AdminLayout>
  );
}