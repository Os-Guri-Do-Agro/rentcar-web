import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const AdminModeContext = createContext();

export const useAdminMode = () => {
  const context = useContext(AdminModeContext);
  if (!context) {
    throw new Error('useAdminMode must be used within an AdminModeProvider');
  }
  return context;
};

export const AdminModeProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('adminMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // If user is not admin, ensure admin mode is off
    if (!isAdmin) {
      setIsAdminMode(false);
      localStorage.removeItem('adminMode');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('adminMode', JSON.stringify(isAdminMode));
    }
  }, [isAdminMode, isAdmin]);

  const toggleAdminMode = () => {
    if (isAdmin) {
      setIsAdminMode(prev => !prev);
    }
  };

  return (
    <AdminModeContext.Provider value={{ isAdminMode, setIsAdminMode, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
};