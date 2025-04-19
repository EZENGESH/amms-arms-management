import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';
import '../../output.css'; // Ensure you have the correct path to your CSS file


const RegisterForm = () => {
  const [formData, setFormData] = useState({
    serviceNumber: '',
    name: '',
    station: '',
    email: '',
    password1: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors = {};
    if (formData.password1 !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    if (formData.password1.length < 8) {
      newErrors.password1 = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setErrors(err);
    }
  };

  return (
    <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center mb-6">Officer Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          {/* Service Number */}
          <div>
            <label className="block text-gray-700 mb-1">Service Number*</label>
            <input
              type="text"
              name="serviceNumber"
              className="w-full px-3 py-2 border rounded"
              value={formData.serviceNumber}
              onChange={handleChange}
              required
            />
            {errors.serviceNumber && <p class="text-red-500 text-sm">{errors.serviceNumber}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-700 mb-1">Full Name*</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border rounded"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Station */}
          <div>
            <label className="block text-gray-700 mb-1">Station*</label>
            <input
              type="text"
              name="station"
              className="w-full px-3 py-2 border rounded"
              value={formData.station}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email*</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border rounded"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Passwords */}
          <div>
            <label className="block text-gray-700 mb-1">Password*</label>
            <input
              type="password"
              name="password1"
              className="w-full px-3 py-2 border rounded"
              value={formData.password1}
              onChange={handleChange}
              required
            />
            {errors.password1 && <p className="text-red-500 text-sm">{errors.password1}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Confirm Password*</label>
            <input
              type="password"
              name="password2"
              className="w-full px-3 py-2 border rounded"
              value={formData.password2}
              onChange={handleChange}
              required
            />
            {errors.password2 && <p className="text-red-500 text-sm">{errors.password2}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;