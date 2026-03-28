import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Users, Calendar,
  LogOut, Menu, X, FileText,
  DollarSign, Layers, MessageSquare, Newspaper, LucideShieldMinus, Logs,
  Wifi, WifiOff, QrCode, RefreshCw, Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { useAdminMode } from '@/context/AdminModeContext';
import whatsappService from '@/services/whatsapp/whatsapp-service';

const QrModal = ({ onClose }) => {
  const { isAdmin } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQr = async (setLoad) => {
    setLoad(true);
    try {
      const res = await whatsappService.getWhatsappQrCode();
      setQrData(res?.data ?? res);
    } catch {}
    finally { setLoad(false); }
  };

  useEffect(() => { fetchQr(setLoading); }, []);

  // Poll status — fecha modal quando conectar (só roda para admin)
  useEffect(() => {
    if (!isAdmin) return;
    const id = setInterval(async () => {
      try {
        const res = await whatsappService.getStatus();
        const d = res?.data ?? res;
        if (d?.estado === 'open' || d?.conectado === true) window.location.reload();
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [isAdmin]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Conectar WhatsApp</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Abra o WhatsApp no celular, vá em <strong>Aparelhos conectados</strong> e escaneie o código abaixo.
        </p>
        <div className="flex items-center justify-center min-h-[220px]">
          {loading ? (
            <Loader2 className="animate-spin text-green-500" size={40} />
          ) : qrData?.qrcode ? (
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <QRCodeSVG value={qrData.qrcode} size={200} bgColor="#ffffff" fgColor="#0E3A2F" level="M" />
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm">
              <QrCode size={48} className="mx-auto mb-2 opacity-30" />
              Não foi possível gerar o QR Code.
            </div>
          )}
        </div>
        <button
          onClick={() => fetchQr(setRefreshing)}
          disabled={refreshing || loading}
          className="w-full mt-4 py-2.5 border-2 border-[#0E3A2F] text-[#0E3A2F] font-bold rounded-xl hover:bg-[#0E3A2F]/5 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          {refreshing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          Atualizar QR Code
        </button>
      </div>
    </div>
  );
};

const useWhatsappStatus = (polling = false, isAdmin = false) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    whatsappService.getStatus()
      .then(res => setStatus(res?.data ?? res))
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!polling || !isAdmin) return;
    const base = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const es = new EventSource(`${base}/whatsapp/eventos`);
    es.onmessage = (e) => {
      try {
        const { tipo, dados } = JSON.parse(e.data);
        if (tipo === 'conexao') setStatus(dados);
      } catch {}
    };
    return () => es.close();
  }, [polling, isAdmin]);

  useEffect(() => {
    if (!polling || !isAdmin) return;
    const id = setInterval(() => {
      whatsappService.getStatus()
        .then(res => setStatus(res?.data ?? res))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [polling, isAdmin]);

  return status;
};

const AdminLayout = () => {
  const { logout, usuario, isBlog, isAdmin } = useAuth();
  const { setIsAdminMode } = useAdminMode();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const whatsappStatus = useWhatsappStatus(showQr, isAdmin);
  const connectionState = whatsappStatus?.estado ?? (whatsappStatus?.conectado ? 'open' : 'close');

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    localStorage.clear();
    window.location.reload();
  };

  const allNavItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/frota", icon: Car, label: "Gerenciar Frota" },
    { to: "/admin/precos-carros", icon: DollarSign, label: "Preços dos Carros" },
    { to: "/admin/reservas", icon: Calendar, label: "Reservas" },
    { to: "/admin/clientes", icon: Users, label: "Clientes" },
    { to: "/admin/blog", icon: Newspaper, label: "Blog" },
    { to: "/admin/secoes", icon: Layers, label: "Seções Home" },
    { to: "/admin/avaliacoes", icon: MessageSquare, label: "Avaliações" },
    { to: "/admin/conteudo", icon: FileText, label: "Conteúdo Legal" },
    // { to: "/admin/whatsapp", icon: MessageCircle, label: "WhatsApp" },
    { to: "/admin/logs", icon: Logs, label: "Logs de Sistema" },
    { to: "/admin/whatsapp-config", icon: LucideShieldMinus, label: "Admin Configs" },
  ];

  const blogNavItems = [
    { to: "/admin/blog", icon: Newspaper, label: "Blog" },
  ];

  const navItems = isBlog ? blogNavItems : allNavItems;

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

          <div className="flex items-center gap-3 ml-auto">
            {!isBlog && (
              <div className="flex items-center gap-2">
                {connectionState === 'open' ? (
                  <>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      WhatsApp
                    </span>
                    <button
                      onClick={async () => {
                        setDisconnecting(true);
                        try { await whatsappService.deleteWhatsappDesconectar(); window.location.reload(); }
                        catch {} finally { setDisconnecting(false); }
                      }}
                      disabled={disconnecting}
                      title="Desconectar WhatsApp"
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {disconnecting ? <Loader2 size={16} className="animate-spin" /> : <WifiOff size={16} />}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      WhatsApp
                    </span>
                    <button
                      onClick={() => setShowQr(true)}
                      title="Conectar WhatsApp"
                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <QrCode size={16} />
                    </button>
                  </>
                )}
              </div>
            )}
            <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">{isBlog ? 'Editor de Blog' : 'Administrador'}</span>
            <div className="w-8 h-8 rounded-full bg-[#00D166] flex items-center justify-center text-[#0E3A2F] font-bold overflow-hidden">
              {usuario?.foto_perfil_url ? (
                <img src={usuario.foto_perfil_url} alt="Admin" className="w-full h-full object-cover"/>
              ) : "A"}
            </div>
          </div>
        </header>
        {showQr && <QrModal onClose={() => setShowQr(false)} />}

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;