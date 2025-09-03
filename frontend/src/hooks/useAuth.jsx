import { useContext, createContext, useState } from 'react';

// Create an AuthContext, initializing with null is safer
const AuthContext = createContext(null);

// AuthProvider component to wrap your app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData); // Set the user data after login
  };

  const logout = () => {
    setUser(null); // Clear the user data on logout
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
  
  // FIX: Add a check to ensure the hook is used within an AuthProvider.
  // This provides a better error message if used incorrectly.
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}