import { useContext, createContext, useState } from 'react';

// Create an AuthContext
const AuthContext = createContext();

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
  return useContext(AuthContext);
}