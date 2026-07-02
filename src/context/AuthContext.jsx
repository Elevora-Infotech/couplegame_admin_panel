import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('adminUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await api.post('/admin/auth/login', { email, password });
      
      if (response.data?.status === 'success') {
        const { admin, token: newToken } = response.data.data;
        
        setUser(admin);
        setToken(newToken);
        
        localStorage.setItem('adminUser', JSON.stringify(admin));
        localStorage.setItem('adminToken', newToken);
        
        navigate('/', { replace: true });
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
