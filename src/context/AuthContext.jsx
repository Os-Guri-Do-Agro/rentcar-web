import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// JWT usa base64URL (- e _ em vez de + e /), atob espera base64 padrão
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const buildUsuario = (payload) => {
  if (!payload) return null;
  const user = payload.user ?? {};
  // role pode estar em payload.user.role ou direto em payload.role
  const role = (user.role ?? payload.role ?? '').toLowerCase();
  return { ...user, role };
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeToken(token);
      setUsuario(buildUsuario(payload));
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const payload = decodeToken(token);
    setUsuario(buildUsuario(payload));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!usuario,
      usuario,
      isAdmin: usuario?.role === 'admin',
      isBlog: usuario?.role === 'blog',
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
