import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { addFirearm, FIREARM_TYPES } from '../services/inventory';

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
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.serial_number.trim()) {
      errors.serial_number = 'Serial number is required';
    }
    
    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    }
    
    if (!formData.type) {
      errors.type = 'Firearm type is required';
    }
    
    if (!formData.manufacturer.trim()) {
      errors.manufacturer = 'Manufacturer is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await addFirearm(formData);
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
      
      // Handle different types of errors
      if (err.response?.status === 400 && err.response.data) {
        // Handle validation errors from backend
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setValidationErrors(backendErrors);
        setError('Please correct the errors in the form.');
      } else if (err.response?.status === 404) {
        setError('The API endpoint was not found. Please check your configuration.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check if the inventory service is running.');
      } else {
        setError(err.message || 'Failed to log firearm. Please check your inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/inventory');
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Log New Firearm</h1>
          <button
            onClick={goBack}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Inventory
          </button>
        </div>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Firearm logged successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serial_number">
              Serial Number *
            </label>
            <input
              className={`shadow appearance-none border ${validationErrors.serial_number ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              id="serial_number"
              name="serial_number"
              type="text"
              placeholder="Enter serial number"
              value={formData.serial_number}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.serial_number && (
              <p className="text-red-500 text-xs italic">{validationErrors.serial_number}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
              Model *
            </label>
            <input
              className={`shadow appearance-none border ${validationErrors.model ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              id="model"
              name="model"
              type="text"
              placeholder="Enter model"
              value={formData.model}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.model && (
              <p className="text-red-500 text-xs italic">{validationErrors.model}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Type *
            </label>
            <select
              className={`shadow appearance-none border ${validationErrors.type ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select a type</option>
              {FIREARM_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {validationErrors.type && (
              <p className="text-red-500 text-xs italic">{validationErrors.type}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manufacturer">
              Manufacturer *
            </label>
            <input
              className={`shadow appearance-none border ${validationErrors.manufacturer ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              id="manufacturer"
              name="manufacturer"
              type="text"
              placeholder="Enter manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.manufacturer && (
              <p className="text-red-500 text-xs italic">{validationErrors.manufacturer}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="calibre">
              Calibre
            </label>
            <input
              className={`shadow appearance-none border ${validationErrors.calibre ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              id="calibre"
              name="calibre"
              type="text"
              placeholder="Enter calibre"
              value={formData.calibre}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.calibre && (
              <p className="text-red-500 text-xs italic">{validationErrors.calibre}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Log Firearm'}
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => {
                setFormData({
                  serial_number: '',
                  model: '',
                  calibre: '',
                  type: '',
                  manufacturer: ''
                });
                setValidationErrors({});
              }}
              disabled={loading}
            >
              Clear Form
            </button>
          </div>
        </form>
        
        <p className="text-sm text-gray-600 mb-4">* Required fields</p>
      </div>
    </AdminLayout>
  );
}