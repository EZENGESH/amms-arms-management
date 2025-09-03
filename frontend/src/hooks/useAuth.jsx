import { useContext, createContext, useState } from 'react';
// FIX: Import useNavigate to handle redirection
import { useNavigate } from 'react-router-dom';

// Create an AuthContext, initializing with null is safer
const AuthContext = createContext(null);

// AuthProvider component to wrap your app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // FIX: Initialize the navigate function
  const navigate = useNavigate();

  const login = (userData) => {
    setUser(userData); // Set the user data after login
    // FIX: Add navigation to the dashboard after setting the user
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null); // Clear the user data on logout
    // It's also good practice to navigate to the login page on logout
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}