import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient, { setTokens, clearTokens, getAccessToken } from '../api/axiosClient';

const AuthContext = createContext();

// Helper function to decode JWT payloads without external dependencies
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = getAccessToken();
      if (token) {
        const decoded = decodeToken(token);
        // Check if token is valid and not expired
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.sub || decoded.nameid || '',
            email: decoded.email || '',
            name: decoded.name || decoded.unique_name || 'User',
            role: decoded.role || 'User',
          });
          setIsAuthenticated(true);
        } else {
          // Token is expired on start
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Listen to global 401 unauth session expiry event dispatched by Axios client
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      // Post login data to /api/auth/login (axiosClient baseURL is https://takwenemusic.onrender.com/)
      const response = await axiosClient.post('api/auth/login', { email, password });
      
      // Standard return contains AuthResponseDto { accessToken, refreshToken }
      // ApiResponse wrapping is already resolved by response interceptor returning response.data
      const data = response.data || response;
      const { accessToken, refreshToken } = data;

      if (!accessToken || !refreshToken) {
        throw new Error('Invalid authentication response from API');
      }

      setTokens(accessToken, refreshToken);
      const decoded = decodeToken(accessToken);
      const loggedUser = {
        id: decoded?.sub || decoded?.nameid || '',
        email: decoded?.email || email,
        name: data?.fullName || decoded?.unique_name || 'User',
        role: decoded?.role || 'User',
      };

      setUser(loggedUser);
      setIsAuthenticated(true);
      return loggedUser;
    } catch (error) {
      throw error;
    }
  };

  const register = async (fullName, email, password) => {
    try {
      // Post registration data to /api/auth/register
      const response = await axiosClient.post('api/auth/register', { fullName, email, password });
      
      const data = response.data || response;
      const { accessToken, refreshToken } = data;

      if (!accessToken || !refreshToken) {
        throw new Error('Registration succeeded but tokens were missing.');
      }

      setTokens(accessToken, refreshToken);
      const decoded = decodeToken(accessToken);
      const loggedUser = {
        id: decoded?.sub || decoded?.nameid || '',
        email: data?.email || email,
        name: data?.fullName || decoded?.unique_name || name,
        role: decoded?.role || 'User',
      };

      setUser(loggedUser);
      setIsAuthenticated(true);
      return loggedUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
