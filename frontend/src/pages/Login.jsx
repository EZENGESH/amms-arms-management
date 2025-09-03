import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import { loginUser } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const credentials = {
      username: formData.get('username').trim(),
      password: formData.get('password')
    };

    try {
      const response = await loginUser(credentials);
      
      if (!response?.token) {
        throw new Error('Invalid server response');
      }

      localStorage.setItem('access_token', response.token);
      login({
        username: credentials.username,
        token: response.token,
        user: response.user
      });

      // Navigate to the dashboard after successful login
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-4">Login to AMMS</h1>
      
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-3">Don't have an account?</p>
        <Button 
          onClick={() => navigate('/register')}
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-700"
        >
          Create New Account
        </Button>
      </div>
    </AuthLayout>
  );
}