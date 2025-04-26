import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import { setToken } from '../services/inventory';
import api from '../services/apiClient';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { username: 'admin', role: 'admin' }; // Example user data
    login(userData); // Log in the user
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-4">Login to AMMS</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full p-2 border rounded"
        />
        <Button type="submit">Login</Button>
      </form>
    </AuthLayout>
  );
}
