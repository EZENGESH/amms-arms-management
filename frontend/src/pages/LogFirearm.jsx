import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/apiClient';

const FIREARM_TYPES = [
  { value: 'RIFLE', label: 'Rifle' },
  { value: 'PISTOL', label: 'Pistol' },
  { value: 'SHOTGUN', label: 'Shotgun' },
  { value: 'MACHINE_GUN', label: 'Machine Gun' },
  { value: 'SUBMACHINE_GUN', label: 'Submachine Gun' }
];

export default function LogFirearm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serial_number: '',
    model: '',
    calibre: '',
    type: '',
    manufacturer: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await api.post('http://localhost:8002/api/arms/', formData);
      setSuccess(true);
      setFormData({
        serial_number: '',
        model: '',
        calibre: '',
        type: '',
        manufacturer: ''
      });
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error logging firearm:', err);
      setError(
        err.response?.data?.detail || 
        'Failed to log firearm. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Log New Firearm</h1>
          <button 
            onClick={() => navigate('/inventory')}
            className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Back to Inventory
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Firearm successfully logged in the inventory!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serial_number">
              Serial Number *
            </label>
            <input
              id="serial_number"
              name="serial_number"
              type="text"
              required
              value={formData.serial_number}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter serial number"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
              Model *
            </label>
            <input
              id="model"
              name="model"
              type="text"
              required
              value={formData.model}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter model name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manufacturer">
              Manufacturer *
            </label>
            <input
              id="manufacturer"
              name="manufacturer"
              type="text"
              required
              value={formData.manufacturer}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter manufacturer name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="calibre">
              Calibre *
            </label>
            <input
              id="calibre"
              name="calibre"
              type="text"
              required
              value={formData.calibre}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., 5.56mm, 9mm, .308"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Type *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select firearm type</option>
              {FIREARM_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Logging...' : 'Log Firearm'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  serial_number: '',
                  model: '',
                  calibre: '',
                  type: '',
                  manufacturer: ''
                });
                setError(null);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}