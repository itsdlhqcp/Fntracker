import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ Hydrate immediately from sessionStorage (no flicker)
    const storedIdToken = localStorage.getItem('idToken') || sessionStorage.getItem('idToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry') || sessionStorage.getItem('tokenExpiry');
    // Treat presence of idToken as logged-in; if expiry exists, ensure it's valid
    if (storedIdToken) {
      if (!tokenExpiry || Date.now() < parseInt(tokenExpiry, 10)) {
        return { idToken: storedIdToken };
      }
    }
    return null;
  });
  const [idToken, setIdToken] = useState(sessionStorage.getItem('idToken'));
  
  // Keep idToken state in sync on first load from either storage
  useEffect(() => {
    const initialToken = localStorage.getItem('idToken') || sessionStorage.getItem('idToken');
    if (initialToken) {
      setIdToken(initialToken);
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const oauthError = urlParams.get('error');

    if (code) {
      setLoading(true);
      sendCodeToEndpoint(code);
    } else if (oauthError) {
      setError(`Authentication failed: ${oauthError}`);
      window.location.replace('/login');
    }
  }, []);

  const sendCodeToEndpoint = async (code) => {
    try {
      const response = await api.post('/api/auth/token', {
        code,
        redirectUri: `${window.location.origin}/auth/google/callback`,
      });

      const tokenData = response.data.data;
      setIdToken(tokenData.idToken);
      setUser({ idToken: tokenData.idToken });

      // Persist in both storages to support same-tab and cross-tab scenarios
      const expiryValue = (Date.now() + tokenData.expirySec * 1000).toString();
      sessionStorage.setItem('idToken', tokenData.idToken);
      sessionStorage.setItem('refreshToken', tokenData.refreshToken);
      sessionStorage.setItem('tokenExpiry', expiryValue);
      localStorage.setItem('idToken', tokenData.idToken);
      localStorage.setItem('refreshToken', tokenData.refreshToken);
      localStorage.setItem('tokenExpiry', expiryValue);

      window.location.replace('/dashboard');
    } catch {
      setError('Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    setError(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Client ID not configured.');
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
    const scope = encodeURIComponent('email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
    window.location.href = authUrl;
  };

  const logout = () => {
    setUser(null);
    setIdToken(null);
    setError(null);
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('tokenExpiry');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, idToken, loading, login, logout, error, setError, clearError: () => setError(null) }}>
      {children}
    </AuthContext.Provider>
  );
};
