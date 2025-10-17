// src/pages/Login.jsx
import { useState, useRef } from "react";
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

  // Ref to directly manipulate password field name
  const passwordRef = useRef(null);

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

      {/* The trick: remove autocomplete at form level AND randomize password name */}
      <form
        className="space-y-4"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        {/* Fake hidden fields first (trap autofill) */}
        <input
          type="text"
          name="fake_user"
          autoComplete="username"
          style={{ display: "none" }}
        />
        <input
          type="password"
          name="fake_pass"
          autoComplete="new-password"
          style={{ display: "none" }}
        />

        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          autoComplete="off"
          spellCheck="false"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        {/* password field renamed dynamically to fool Chrome’s detector */}
        <input
          ref={passwordRef}
          name={`pass_${Math.random().toString(36).substring(2, 7)}`}
          type="password"
          placeholder="Password"
          required
          autoComplete="new-password"
          inputMode="none"
          spellCheck="false"
          onFocus={() => {
            // randomize name again on focus (kills saved password popup)
            passwordRef.current.name =
              "pass_" + Math.random().toString(36).substring(2, 8);
          }}
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
