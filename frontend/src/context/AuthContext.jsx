import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken as refreshTokenAPI } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const storedUser = localStorage.getItem("user");

    if (accessToken && refreshToken && storedUser) {
      setUser({
        token: accessToken,
        refreshToken: refreshToken,
        ...JSON.parse(storedUser),
      });
    }

    setLoading(false);
  }, []);

  // Login function
  const login = (authData) => {
    const userInfo = {
      id: authData.user_id,
      username: authData.username,
      email: authData.email,
      service_number: authData.service_number,
      rank: authData.rank,
    };

    // Store tokens & user info
    localStorage.setItem("access_token", authData.token);
    if (authData.refresh_token) localStorage.setItem("refresh_token", authData.refresh_token);
    localStorage.setItem("user", JSON.stringify(userInfo));

    setUser({ token: authData.token, refreshToken: authData.refresh_token, ...userInfo });

    navigate("/dashboard");
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const storedRefresh = localStorage.getItem("refresh_token");
      if (!storedRefresh) throw new Error("No refresh token available");

      const data = await refreshTokenAPI(storedRefresh);
      localStorage.setItem("access_token", data.token);

      setUser((prev) => ({ ...prev, token: data.token }));
      return data.token;
    } catch (err) {
      console.error("Refresh token failed:", err);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshToken, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
