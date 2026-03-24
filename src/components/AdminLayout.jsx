import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Users, Calendar,
  LogOut, Menu, X, FileText,
  DollarSign, Shield, Mail, Layers, MessageSquare, Newspaper, MessageCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminMode } from '@/context/AdminModeContext';

const AdminLayout = () => {
  const { logout, usuario } = useAuth();
  const { setIsAdminMode } = useAdminMode();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    localStorage.clear();
    window.location.reload();
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/frota", icon: Car, label: "Gerenciar Frota" },
    { to: "/admin/precos-carros", icon: DollarSign, label: "Preços dos Carros" },
    { to: "/admin/reservas", icon: Calendar, label: "Reservas" },
    { to: "/admin/clientes", icon: Users, label: "Clientes" },
    { to: "/admin/blog", icon: Newspaper, label: "Blog" },
    
    // CMS & Content
    { to: "/admin/secoes", icon: Layers, label: "Seções Home" },
    { to: "/admin/avaliacoes", icon: MessageSquare, label: "Avaliações" },
    { to: "/admin/conteudo", icon: FileText, label: "Conteúdo Legal" },
    // { to: "/admin/emails", icon: Mail, label: "E-mails" },
    
    // System
    // Removed Configurações link as requested
    { to: "/admin/whatsapp", icon: MessageCircle, label: "WhatsApp" },
    { to: "/admin/logs", icon: Shield, label: "Logs de Sistema" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0E3A2F] text-white transition-transform duration-300 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#00D166]">Painel Admin</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2 pb-20">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-[#00D166] text-[#0E3A2F] font-bold' : 'text-gray-300 hover:bg-[#165945] hover:text-white'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[#165945] bg-[#0E3A2F]">
          <button 
            onClick={handleExitAdmin}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#165945] w-full rounded-lg transition-colors mb-2"
          >
            <LogOut size={20} />
            Sair do Modo Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 lg:px-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
             <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">Administrador</span>
             <div className="w-8 h-8 rounded-full bg-[#00D166] flex items-center justify-center text-[#0E3A2F] font-bold overflow-hidden">
               {usuario?.foto_perfil_url ? (
                   <img src={usuario.foto_perfil_url} alt="Admin" className="w-full h-full object-cover"/>
               ) : (
                   "A"
               )}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;