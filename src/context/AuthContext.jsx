import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as authLogin, logout as authLogout, register as authRegister, getCurrentUser } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("[CONTEXT] AuthContext: Initializing authentication...");
        // Check for initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const currentUser = await getCurrentUser();
          if (mounted) {
            setUsuario(currentUser);
            console.log("[CONTEXT] AuthContext: usuario object loaded:", currentUser?.email);
            console.log("[CONTEXT] usuario.id =", currentUser?.id);
            
            if (currentUser?.role?.toLowerCase() === 'admin') {
              console.log("[CONTEXT] AuthContext: ADMIN privileges active");
            }
          }
        } else {
          if (mounted) {
            setUsuario(null);
            console.log("[CONTEXT] AuthContext: No active session found");
          }
        }
      } catch (err) {
        console.error("[CONTEXT] AuthContext: Initialization failed:", err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log("[CONTEXT] AuthContext: Auth state change event:", event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = await getCurrentUser();
        setUsuario(currentUser);
        setLoading(false);
        console.log("[CONTEXT] AuthContext: Usuario Signed In/Refreshed:", currentUser?.email);
        console.log("[CONTEXT] usuario.id =", currentUser?.id);
        
        if (currentUser?.role?.toLowerCase() !== 'admin' && currentUser?.email?.includes('admin')) {
             console.warn("[CONTEXT] AuthContext WARNING: Usuario has 'admin' in email but role is not 'admin'. Check database users table.");
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUsuario(null);
        setLoading(false);
        console.log("[CONTEXT] AuthContext: Usuario Signed Out");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await authLogin(email, password);
      // User state will be updated by onAuthStateChange
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, nome) => {
    setLoading(true);
    try {
      await authRegister(email, password, nome);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authLogout();
      setUsuario(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Robust admin check - handles both 'admin' and 'ADMIN'
  const isAdmin = usuario?.role?.toLowerCase() === 'admin';

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!usuario, 
      usuario, 
      login, 
      logout, 
      register, 
      loading, 
      error,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};