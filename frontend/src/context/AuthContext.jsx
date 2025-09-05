import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // For persistence, you can decode the token to get user info
      // For now, setting a simple user object is enough to signify being logged in.
      setUser({ isAuthenticated: true });
    }
    setLoading(false);
  }, []);

  // FIX: The login function now expects an object with 'access' and 'refresh' tokens.
  const login = (authData) => {
    // It also expects user details to be passed in separately.
    const { access, refresh, user: userData } = authData;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    setUser(userData); // Set the actual user object in the state
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    // FIX: Also remove the refresh token on logout.
    localStorage.removeItem('refresh_token');
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