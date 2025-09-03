import { useContext, createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // FIX: Add a loading state to prevent race conditions
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // For now, we'll set a placeholder user.
      // In a real app, you'd decode the token to get user info.
      setUser({ token });
    }
    // FIX: Set loading to false after checking for the token
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  // FIX: Provide the loading state in the context value
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}