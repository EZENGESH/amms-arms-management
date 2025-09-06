import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore tokens and user info from localStorage
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const storedUser = localStorage.getItem("user");

    if (accessToken && refreshToken && storedUser) {
      setUser({
        token: accessToken,
        refreshToken: refreshToken,
        ...JSON.parse(storedUser), // contains id, username, email, rank, etc.
      });
    }

    setLoading(false);
  }, []);

  const login = (authData) => {
    // Save tokens
    localStorage.setItem("access_token", authData.token);
    if (authData.refresh_token) {
      localStorage.setItem("refresh_token", authData.refresh_token);
    }

    // Save user details separately
    const userInfo = {
      id: authData.user_id,
      username: authData.username,
      email: authData.email,
      service_number: authData.service_number,
      rank: authData.rank,
    };
    localStorage.setItem("user", JSON.stringify(userInfo));

    setUser({
      token: authData.token,
      refreshToken: authData.refresh_token,
      ...userInfo,
    });

    navigate("/dashboard");
  };

  const logout = () => {
    // Clear everything
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
