import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Use consistent key names
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (token) {
      // You might want to validate the token or fetch user details
      setUser({ token, refreshToken });
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    // Store both tokens with consistent keys
    localStorage.setItem('access_token', authData.token);
    if (authData.refresh_token) {
      localStorage.setItem('refresh_token', authData.refresh_token);
    }
    
    setUser({ 
      token: authData.token,
      refreshToken: authData.refresh_token,
      id: authData.user_id, 
      username: authData.username 
    });
    navigate('/dashboard');
  };

  const logout = () => {
    // Remove all tokens consistently
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}