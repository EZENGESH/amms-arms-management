import { useState } from 'react';
// FIX: useNavigate is no longer needed here as the context handles it.
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

  console.log("Login API response:", response); // full axios response
  console.log("Login API data:", response.data); // actual JSON from backend

  const data = response.data; // 👈 extract JSON body

  if (!data?.access) {
    throw new Error("Invalid server response. Login failed.");
  }

  login(data);
} catch (err) {
  setError(err.response?.data?.detail || err.message || "An unexpected error occurred.");
}
 finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-4">Login to AMMS</h1>
      
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* ... form inputs remain the same ... */}
{/* ...existing code... */}
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
    </AuthLayout>
  );
}