import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { addFirearm, FIREARM_TYPES, checkInventoryServiceHealth } from '../services/inventory';

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
  const [serviceStatus, setServiceStatus] = useState({ 
    isChecking: true,
    isHealthy: false,
    error: null
  });

  // Check service health on component mount
  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        const status = await checkInventoryServiceHealth();
        setServiceStatus({
          ...status,
          isChecking: false
        });
      } catch (err) {
        setServiceStatus({ 
          isHealthy: false, 
          error: err.message, 
          isChecking: false 
        });
      }
    };
    
    checkServiceStatus();
  }, []);

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
        [name]: undefined
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
      
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
        setError('Please correct the form errors');
      } else {
        setError(err.message || 'Failed to log firearm. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/inventory');
  };

  const renderServiceWarning = () => {
    if (serviceStatus.isChecking) return null;
    
    if (!serviceStatus.isHealthy) {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Service Warning</p>
          <p>The inventory service is currently unavailable. Form submissions may fail.</p>
          {serviceStatus.error && (
            <p className="text-sm mt-1">Error: {serviceStatus.error}</p>
          )}
        </div>
      );
    }
    
    return null;
  };

  const renderFormField = (fieldName, label, type = 'text', isRequired = true) => {
    const value = formData[fieldName];
    const error = validationErrors[fieldName];
    
    return (
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={fieldName}>
          {label} {isRequired && '*'}
        </label>
        {type === 'select' ? (
          <select
            className={`shadow appearance-none border ${error ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={handleChange}
            disabled={loading}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldName}-error` : undefined}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {FIREARM_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        ) : (
          <input
            className={`shadow appearance-none border ${error ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id={fieldName}
            name={fieldName}
            type={type}
            placeholder={`Enter ${label.toLowerCase()}`}
            value={value}
            onChange={handleChange}
            disabled={loading}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldName}-error` : undefined}
          />
        )}
        {error && (
          <p id={`${fieldName}-error`} className="text-red-500 text-xs italic mt-1">
            {error}
          </p>
        )}
      </div>
    );
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
        
        {renderServiceWarning()}
        
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
          {renderFormField('serial_number', 'Serial Number')}
          {renderFormField('model', 'Model')}
          {renderFormField('type', 'Type', 'select')}
          {renderFormField('manufacturer', 'Manufacturer')}
          {renderFormField('calibre', 'Calibre', 'text', false)}
          
          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={loading || (!serviceStatus.isChecking && !serviceStatus.isHealthy)}
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