// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // You can expand this to include user info from token
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('access_token', userData.token);
    setUser(userData);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
