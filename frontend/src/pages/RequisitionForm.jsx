import { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Button from '../components/Button';
import { createRequisition } from '../services/requisitions';

export default function RequisitionForm() {
  const [formData, setFormData] = useState({
    service_number: '',
    rank: '',
    name: '',
    station_unit: '',
    firearm_type: '',
    quantity: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await createRequisition(formData);
      setMessage('Requisition submitted successfully!');
      setFormData({
        service_number: '',
        rank: '',
        name: '',
        station_unit: '',
        firearm_type: '',
        quantity: ''
      });
    } catch (error) {
      console.error('Error submitting requisition:', error);
      const errorMsg =
        error?.response?.data?.detail || 'Failed to submit requisition.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'service_number', label: 'Service Number', type: 'text', placeholder: 'Enter service number' },
    { id: 'rank', label: 'Rank', type: 'text', placeholder: 'Enter rank' },
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
    { id: 'station_unit', label: 'Station/Unit', type: 'text', placeholder: 'Enter station or unit' },
    { id: 'firearm_type', label: 'Firearm Type', type: 'text', placeholder: 'Enter firearm type' },
    { id: 'quantity', label: 'Quantity', type: 'number', placeholder: 'Enter quantity' }
  ];

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">New Requisition</h1>

        {message && (
          <div
            className={`mb-4 text-center text-sm font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'
              }`}
          >
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {fields.map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                id={id}
                type={type}
                value={formData[id]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}

          <div className="flex justify-center">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Requisition'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}