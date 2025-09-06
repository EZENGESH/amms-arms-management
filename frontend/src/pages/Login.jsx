// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import { loginUser } from '../services/auth';

export default function Login() {
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Already logged in? Redirect immediately
  if (user) {
    window.location.href = '/dashboard';
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const credentials = {
      username: formData.get('username').trim(),
      password: formData.get('password'),
    };

    try {
      const response = await loginUser(credentials);
      console.log('Login response:', response);

      // Ensure response has the expected fields
      if (!response.token) throw new Error('No access token received from backend');

      const authData = {
        token: response.token || response.access_token,
        refresh_token: response.refresh_token || response.refreshToken,
        user_id: response.user_id || response.id,
        username: response.username,
        email: response.email,
        service_number: response.service_number,
        rank: response.rank,
      };

      console.log('Mapped authData:', authData);
      login(authData); // AuthContext handles saving and redirect
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-4">Login to AMMS</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
        <p className="font-semibold">Debug Info:</p>
        <p>Expected backend response:</p>
        <pre>{`{
  "token": "JWT_ACCESS_TOKEN",
  "refresh_token": "JWT_REFRESH_TOKEN",
  "user_id": 1,
  "username": "admin",
  "email": "admin@gmail.com",
  "service_number": "12345",
  "rank": "Officer"
}`}</pre>
      </div>
    </AuthLayout>
  );
}
