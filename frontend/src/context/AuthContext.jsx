import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token'); // Use a consistent key
    if (token) {
      // In a real app, you might fetch user details using the token
      setUser({ token });
    }
    setLoading(false);
  }, []);

  // FIX: The login function now handles the response from DRF's authtoken
  const login = (authData) => {
    // authData is the object from the API: { token, user_id, username }
    localStorage.setItem('auth_token', authData.token);
    setUser({ id: authData.user_id, username: authData.username });
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
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