import { useState } from 'react';
import { generateInventoryReport, generateRequisitionAudit } from '../services/reports';
import Button from '../components/Button'; // Assuming you have a Button component

// A simple component to render report data as a table
const ReportTable = ({ title, headers, data }) => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold">{title}</h3>
    {data.length > 0 ? (
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th key={header} className="text-left py-2 px-3 border-b">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={header} className="py-2 px-3 border-b">{String(row[header.toLowerCase().replace(' ', '_')] || 'N/A')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="mt-2 text-gray-500">No data available for this report.</p>
    )}
  </div>
);


export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async (type) => {
    setIsLoading(true);
    setError(null);
    setReportData(null);
    setReportType(type);

    try {
      let data;
      if (type === 'inventory') {
        data = await generateInventoryReport();
      } else if (type === 'requisition') {
        data = await generateRequisitionAudit({ ordering: '-created_at' });
      }
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Reports</h1>

      <div className="flex space-x-4 mb-6">
        <Button onClick={() => handleGenerateReport('inventory')} disabled={isLoading}>
          {isLoading && reportType === 'inventory' ? 'Generating...' : 'Inventory Report'}
        </Button>
        <Button onClick={() => handleGenerateReport('requisition')} disabled={isLoading}>
          {isLoading && reportType === 'requisition' ? 'Generating...' : 'Requisition Audit'}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {reportData && reportType === 'inventory' && (
        <ReportTable 
          title="Inventory Report"
          headers={['Serial Number', 'Type', 'Model', 'Status', 'Quantity']}
          data={reportData}
        />
      )}

      {reportData && reportType === 'requisition' && (
        <ReportTable 
          title="Requisition Audit Report"
          headers={['ID', 'Firearm Type', 'Status', 'Name', 'Service Number', 'Created At']}
          data={reportData}
        />
      )}
    </div>
  );
}