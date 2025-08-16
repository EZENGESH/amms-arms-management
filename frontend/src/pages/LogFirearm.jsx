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
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.serial_number.trim()) errors.serial_number = 'Required';
    if (!formData.model.trim()) errors.model = 'Required';
    if (!formData.type) errors.type = 'Required';
    if (!formData.manufacturer.trim()) errors.manufacturer = 'Required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await addFirearm(formData);
      setSuccess(true);
      setTimeout(() => navigate('/inventory'), 2000);
    } catch (err) {
      if (err.errors) {
        setValidationErrors(err.errors);
        setError('Please fix validation errors');
      } else {
        setError(err.message || 'Failed to add firearm');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Add New Firearm</h1>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 mb-4 rounded">
            Firearm added successfully! Redirecting...
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Serial Number*</label>
            <input
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                validationErrors.serial_number ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.serial_number && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.serial_number}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Model*</label>
            <input
              name="model"
              value={formData.model}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                validationErrors.model ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.model && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.model}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Type*</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                validationErrors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              {FIREARM_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {validationErrors.type && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.type}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Manufacturer*</label>
            <input
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                validationErrors.manufacturer ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.manufacturer && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.manufacturer}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Calibre</label>
            <input
              name="calibre"
              value={formData.calibre}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white p-2 rounded ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {loading ? 'Submitting...' : 'Add Firearm'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}