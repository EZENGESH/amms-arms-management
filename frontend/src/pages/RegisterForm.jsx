import { useState } from 'react';
import Button from '../components/Button';
import AdminLayout from '../layouts/AdminLayout';
import { createRequisition } from '../services/requisitions'; // <-- Import the function

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

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await createRequisition(formData); // <-- Use the imported function
      setMessage('Requisition submitted successfully!');
      // Reset the form
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
      setMessage('Failed to submit requisition.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">New Requisition</h1>

        {message && (
          <div className={`mb-4 text-center text-sm font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Service Number */}
          <div>
            <label htmlFor="service_number" className="block mb-2 text-sm font-medium text-gray-700">
              Service Number
            </label>
            <input
              type="text"
              id="service_number"
              value={formData.service_number}
              onChange={handleChange}
              placeholder="Enter service number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Rank */}
          <div>
            <label htmlFor="rank" className="block mb-2 text-sm font-medium text-gray-700">
              Rank
            </label>
            <input
              type="text"
              id="rank"
              value={formData.rank}
              onChange={handleChange}
              placeholder="Enter rank"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Station/Unit */}
          <div>
            <label htmlFor="station_unit" className="block mb-2 text-sm font-medium text-gray-700">
              Station/Unit
            </label>
            <input
              type="text"
              id="station_unit"
              value={formData.station_unit}
              onChange={handleChange}
              placeholder="Enter station or unit"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Firearm Type */}
          <div>
            <label htmlFor="firearm_type" className="block mb-2 text-sm font-medium text-gray-700">
              Firearm Type
            </label>
            <input
              type="text"
              id="firearm_type"
              value={formData.firearm_type}
              onChange={handleChange}
              placeholder="Enter firearm type"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
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