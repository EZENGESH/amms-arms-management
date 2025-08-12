// src/pages/RequisitionForm.jsx
import { useState } from 'react';
import axios from 'axios';
import Button from '../components/Button';
import AdminLayout from '../layouts/AdminLayout';

export default function RequisitionForm() {
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    description: ''
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
      const response = await axios.post('http://localhost:8000/api/requisition/', {
        item_name: formData.itemName, // Make sure field names match your Django model
        quantity: formData.quantity,
        description: formData.description,
      });

      console.log('Response:', response.data);
      setMessage('Requisition submitted successfully!');
      
      // Reset the form
      setFormData({
        itemName: '',
        quantity: '',
        description: ''
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
        {/* Item Name */}
        <div>
          <label htmlFor="itemName" className="block mb-2 text-sm font-medium text-gray-700">
            Item Name
          </label>
          <input
            type="text"
            id="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Enter item name"
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

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Write a short description..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
