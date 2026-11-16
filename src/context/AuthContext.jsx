import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('adminUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || null);
  const [tempAuth, setTempAuth] = useState(null); // { tempToken, emailMasked }
  const navigate = useNavigate();

  // Step 1: Submit email & password -> triggers 2FA code dispatch
  const login = async (email, password) => {
    try {
      const response = await api.post('/admin/auth/login', { email, password });
      
      if (response.data?.status === 'success') {
        const data = response.data.data;

        // If 2FA is required (Phase 2 Spec B1)
        if (data.requires2FA) {
          setTempAuth({
            tempToken: data.tempToken,
            emailMasked: data.emailMasked,
          });
          return {
            success: true,
            requires2FA: true,
            emailMasked: data.emailMasked,
          };
        }

        // Direct login fallback (if 2FA was bypassed)
        const { admin, token: newToken } = data;
        setUser(admin);
        setToken(newToken);
        localStorage.setItem('adminUser', JSON.stringify(admin));
        localStorage.setItem('adminToken', newToken);
        navigate('/', { replace: true });
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  // Step 2: Verify 6-digit OTP code -> issues full admin session
  const verify2FA = async (otp) => {
    if (!tempAuth?.tempToken) {
      return { success: false, message: 'Verification session expired. Please start over.' };
    }

    try {
      const response = await api.post('/admin/auth/verify-2fa', {
        tempToken: tempAuth.tempToken,
        otp: otp.trim(),
      });

      if (response.data?.status === 'success') {
        const { admin, token: newToken } = response.data.data;
        setUser(admin);
        setToken(newToken);
        setTempAuth(null);

        localStorage.setItem('adminUser', JSON.stringify(admin));
        localStorage.setItem('adminToken', newToken);

        navigate('/', { replace: true });
        return { success: true };
      }
      return { success: false, message: 'Invalid verification response.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed. Please check the code.',
      };
    }
  };

  // Resend 2FA code
  const resend2FA = async () => {
    if (!tempAuth?.tempToken) {
      return { success: false, message: 'No active verification session.' };
    }

    try {
      const response = await api.post('/admin/auth/resend-2fa', {
        tempToken: tempAuth.tempToken,
      });
      return {
        success: true,
        message: response.data?.message || 'A new code has been sent.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend code.',
      };
    }
  };

  // Cancel 2FA and go back to step 1
  const cancel2FA = () => {
    setTempAuth(null);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTempAuth(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/login', { replace: true });
  };

  const role = (user?.role || 'support').toLowerCase();
  const isAdmin = role === 'admin' || role === 'super_admin';
  const hasPermission = (category) => {
    if (isAdmin) return true;
    return Array.isArray(user?.permissions) && user.permissions.includes(category);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        role,
        isAdmin,
        hasPermission,
        tempAuth,
        login,
        verify2FA,
        resend2FA,
        cancel2FA,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
