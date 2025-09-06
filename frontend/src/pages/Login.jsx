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
      
      // Check for token in response
      if (!response?.token) {
        throw new Error('Invalid server response. Login failed.');
      }

      // DEBUG: Log the response to see its structure
      console.log('Login response:', response);

      // Extract the expected fields for the AuthContext login function
      const authData = {
        token: response.token,
        refresh_token: response.refresh_token || response.refreshToken,
        user_id: response.user_id || response.userId || response.id,
        username: response.username || credentials.username
      };

      // Call the context's login function with the formatted data
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

      {/* Debug info - remove in production */}
      <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
        <p className="font-semibold">Debug Info:</p>
        <p>Expected response: token, refresh_token, user_id, username</p>
        <p>Check browser console for detailed response structure</p>
      </div>
    </AuthLayout>
  );
}