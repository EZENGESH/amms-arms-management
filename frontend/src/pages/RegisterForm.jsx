import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import { registerUser } from '../services/auth';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service_number: '',
    rank: '',
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { confirm_password, ...userData } = formData;
      await registerUser(userData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
      
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        Registration successful! Redirecting to login...
      </div>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {Object.entries(formData).map(([name, value]) => (
          name !== 'confirm_password' && (
            <input
              key={name}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              type={name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'}
              name={name}
              placeholder={
                name.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') + 
                (name === 'password' ? ' (min 8 characters)' : '')
              }
              value={value}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          )
        ))}
        <input
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={formData.confirm_password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-3">Already have an account?</p>
        <Button 
          onClick={() => navigate('/login')}
          disabled={isLoading}
          className="w-full bg-gray-500 hover:bg-gray-700"
        >
          Back to Login
        </Button>
      </div>
    </AuthLayout>
  );
}