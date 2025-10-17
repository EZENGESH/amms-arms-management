// src/pages/Login.jsx
import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Ensure browsers don’t autofill any real inputs
    const random = Math.random().toString(36).substring(2, 8);
    document.querySelectorAll("input").forEach((input) => {
      input.setAttribute("autocomplete", "new-" + random);
      input.setAttribute("aria-autocomplete", "none"); // helps on Safari
    });
  }, []);

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

      // Save user data in context
      login(response);
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
        {/* 🧩 Hidden fake fields to neutralize autofill */}
        <input
          type="text"
          name="fake_user"
          autoComplete="username"
          tabIndex="-1"
          style={{
            position: "absolute",
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: "none",
          }}
        />
        <input
          type="password"
          name="fake_pass"
          autoComplete="current-password"
          tabIndex="-1"
          style={{
            position: "absolute",
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: "none",
          }}
        />

        {/* 🧭 Real fields */}
        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          autoComplete="new-username"
          inputMode="text"
          aria-autocomplete="none"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete="new-password"
          aria-autocomplete="none"
          inputMode="none"
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
