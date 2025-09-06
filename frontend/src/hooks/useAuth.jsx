import { useContext, createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get token and user info from localStorage
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser({ token, ...JSON.parse(storedUser) });
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    // Save user info and token
    setUser(userData);
    localStorage.setItem('access_token', userData.token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: userData.user_id,
        username: userData.username,
        email: userData.email,
        service_number: userData.service_number,
        rank: userData.rank,
      })
    );
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
