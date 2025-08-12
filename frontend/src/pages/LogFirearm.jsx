import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { inventoryApi } from '../services/apiClient'; // Import inventoryApi

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
      const response = await inventoryApi.post('/api/arms/', formData); // Use inventoryApi
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

  // ... rest of the component
}