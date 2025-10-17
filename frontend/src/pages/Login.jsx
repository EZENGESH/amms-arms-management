// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/Button";
import { loginUser } from "../services/auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const credentials = {
      username: formData.get("username").trim(),
      password: formData.get("password"),
    };

    try {
      const response = await loginUser(credentials);

      if (!response?.access || !response?.refresh) {
        throw new Error("Invalid server response. Login failed.");
      }

      // Save tokens & user via context
      login(response);

      // Redirect after successful login
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-4">Login to AMMS</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        {/* Hidden fake fields to block browser autofill */}
        <input type="text" name="fakeuser" autoComplete="username" hidden />
        <input type="password" name="fakepass" autoComplete="new-password" hidden />

        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          autoComplete="new-username"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete="new-password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
}
