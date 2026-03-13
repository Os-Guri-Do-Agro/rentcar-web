import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  // [REPLACE] Replaced user with usuario
  const { isAuthenticated, loading, isAdmin, usuario } = useAuth();
  const location = useLocation();

  console.log("Protected Route: Verificando autenticação...");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#00D166]" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Protected Route: Usuário autenticado: false");
    console.log("Protected Route: Redirecionando para login");
    
    // Store current location in localStorage for post-login redirect
    const currentPath = location.pathname + location.search;
    localStorage.setItem('redirectAfterLogin', currentPath);
    console.log("Protected Route: Armazenando rota de destino:", currentPath);

    return <Navigate to="/login" replace />;
  }

  console.log("Protected Route: Usuário autenticado: true");
  console.log("[PROTECTED] usuario.id check:", usuario?.id);
  console.log("Protected Route: Role do usuário:", usuario?.role);

  // Double check admin requirement using context isAdmin flag which checks role
  if (requireAdmin && !isAdmin) {
    console.log("Protected Route: Acesso negado. Requer admin.");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-4xl font-bold text-[#0E3A2F] mb-4">403 - Acesso Negado</h1>
        <p className="text-gray-600 mb-8">Você não tem permissão para acessar esta página.</p>
        <div className="flex gap-4">
           <a href="/" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300">Home</a>
           <a href="/user" className="px-6 py-2 bg-[#00D166] text-[#0E3A2F] rounded-lg font-bold hover:bg-[#00F178]">Meu Perfil</a>
        </div>
      </div>
    );
  }

  console.log("Protected Route: Permitindo acesso");
  return children;
};

export default ProtectedRoute;