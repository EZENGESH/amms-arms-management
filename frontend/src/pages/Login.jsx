import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import { loginUser } from '../services/auth';

export default function Login() {
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
      password: formData.get('password'),
    };

    try {
      const response = await loginUser(credentials);

      // ✅ Check for your actual response format
      if (!response?.token || !response?.refresh_token) {
        throw new Error('Invalid server response. Login failed.');
      }

      console.log('Login response:', response); // Debugging

      // ✅ Adapted to your backend’s fields
      const authData = {
        token: response.token,
        refresh_token: response.refresh_token,
        user_id: response.user_id,
        username: response.username,
        email: response.email,
      };

      // Store in context
      login(authData);

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
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      {/* Debug info */}
      <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
        <p className="font-semibold">Debug Info:</p>
        <p>Backend response includes: token, refresh_token, user_id, username, email</p>
        <p>Check browser console for actual response</p>
      </div>
    </AuthLayout>
  );
}
