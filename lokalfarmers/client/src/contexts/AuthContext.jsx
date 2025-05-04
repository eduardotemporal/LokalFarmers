import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // Using jwt-decode to get user info from token

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('lokalFarmersToken') || null);
  const [user, setUser] = useState(null); // Store decoded user info (id, role)
  const [isLoading, setIsLoading] = useState(true); // Indicate initial loading state

  useEffect(() => {
    const storedToken = localStorage.getItem('lokalFarmersToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Optional: Add check for token expiration here
        // if (decoded.exp * 1000 < Date.now()) { ... handle expired token ... }
        setToken(storedToken);
        setUser(decoded.user); // Assuming payload is { user: { id, role } }
      } catch (error) {
        console.error("Invalid token found:", error);
        localStorage.removeItem('lokalFarmersToken'); // Remove invalid token
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false); // Finished checking token
  }, []);

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      localStorage.setItem('lokalFarmersToken', newToken);
      setToken(newToken);
      setUser(decoded.user);
    } catch (error) {
        console.error("Failed to decode token during login:", error);
        // Handle appropriately - maybe show an error to the user
    }
  };

  const logout = () => {
    localStorage.removeItem('lokalFarmersToken');
    setToken(null);
    setUser(null);
    // Optionally redirect user to login page here or in the component calling logout
  };

  // Determine isAuthenticated based on the presence of a valid user object
  const isAuthenticated = !isLoading && !!user;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
