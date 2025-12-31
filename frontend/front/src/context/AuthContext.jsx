import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and is valid
    if (token) {
      // You can add token validation here if needed
      setUser({ token }); // For now, just set user with token
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({ token: data.token });
        return { success: true };
      } else {
        const errorData = await response.json();
        // Handle specific error cases
        if (response.status === 404) {
          return { success: false, message: 'No user found with this email address' };
        } else if (response.status === 401) {
          return { success: false, message: 'Wrong password. Please check your credentials' };
        } else {
          return { success: false, message: errorData.message || 'Login failed' };
        }
      }
    } catch (error) {
      return { success: false, message: 'Connection error. Please check your internet connection' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({ token: data.token });
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      return { success: false, message: 'Connection error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
