import { useContext, createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // FIX: Add a useEffect to check for a token on initial component mount.
  // This makes the login state persist across page reloads.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // If a token exists, you can decode it to get user info or
      // simply set a user object to indicate authentication.
      // For now, we'll set a placeholder user.
      setUser({ token }); 
    }
  }, []); // The empty dependency array ensures this runs only once on mount.

  const login = (userData) => {
    // The token is already being set in Login.jsx, which is fine.
    setUser(userData); 
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null); 
    localStorage.removeItem('access_token'); // Clear the token on logout
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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