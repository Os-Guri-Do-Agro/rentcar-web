import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import CookieBanner from '@/components/CookieBanner';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/context/AuthContext';
import { ReservaProvider } from '@/context/ReservaContext';
import { AdminModeProvider } from '@/context/AdminModeContext';
import useScrollToTop from '@/hooks/useScrollToTop';

// Public Pages
import Home from '@/pages/Home';
import Frota from '@/pages/Frota';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import About from '@/pages/About';
import CarDetail from '@/pages/CarDetail';
import Documentos from '@/pages/Documentos';
import UserDataPage from '@/pages/UserDataPage';
import PrivateRental from '@/pages/PrivateRental';
import TermsAndRules from '@/pages/TermsAndRules';
import Location from '@/pages/Location';
import NotFound from '@/pages/NotFound';
import Contato from '@/pages/Contato';
import Blog from '@/pages/Blog';
import BlogDetalhe from '@/pages/BlogDetalhe';
import LocacaoCorporativa from '@/pages/LocacaoCorporativa';
import TermosDeUso from '@/pages/TermosDeUso';
import Privacidade from '@/pages/Privacidade';
import NormaLGPD from '@/pages/NormaLGPD';

// Protected User Pages
import RequestAnalysis from '@/pages/RequestAnalysis';
import RequestStatus from '@/pages/RequestStatus';
import ReservationConfirmation from '@/pages/ReservationConfirmation';
import UserProfile from '@/pages/UserProfile';
import MinhasReservas from '@/pages/MinhasReservas';
import DetalhesReserva from '@/pages/DetalhesReserva';

// Admin Pages
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/AdminDashboard';
import FleetManagement from '@/pages/admin/FleetManagement';
import CarForm from '@/pages/admin/CarForm';
import PriceControl from '@/pages/admin/PriceControl';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminTermsAndRules from '@/pages/admin/AdminTermsAndRules';
import AdminEmailConfig from '@/pages/admin/AdminEmailConfig';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminCars from '@/pages/admin/AdminCars';
import AdminFleetManager from '@/pages/admin/AdminFleetManager'; 
import AdminReservations from '@/pages/admin/AdminReservations';
import AdminDetalhesReserva from '@/pages/admin/AdminDetalhesReserva';
import AdminClientes from '@/pages/admin/AdminClientes';
import AdminDetalhesCliente from '@/pages/admin/AdminDetalhesCliente';
import AdminIntegrations from '@/pages/admin/AdminIntegrations';
import AdminLogs from '@/pages/admin/AdminLogs'; 
import AdminCarrosDestaque from '@/pages/admin/AdminCarrosDestaque';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminBlogNovo from '@/pages/admin/AdminBlogNovo';
import AdminBlogEditar from '@/pages/admin/AdminBlogEditar';
import AdminEditarPrecosCarro from '@/pages/admin/AdminEditarPrecosCarro';
import AdminAvaliacoes from '@/pages/admin/AdminAvaliacoes';
import AdminSecoes from '@/pages/admin/AdminSecoes';
import AdminConteudo from '@/pages/admin/AdminConteudo';
import AdminEmails from '@/pages/admin/AdminEmails'; 
import DiagnosticoPage from '@/pages/DiagnosticoPage';
import AdminCarPricing from '@/pages/admin/AdminCarPricing'; 

function App() {
  const { usuario, isAdmin } = useAuth();
  const { pathname } = useLocation();
  useScrollToTop();

  return (
    <>
      <Helmet title="JL RENT A CAR" />
      
      <ReservaProvider>
        <AdminModeProvider>
          <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
            <Header />
            
            <main className="flex-grow">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/frota" element={<Frota />} />
                <Route path="/frota-motorista" element={<Navigate to="/frota" replace />} />
                <Route path="/frota-particular" element={<Navigate to="/frota" replace />} />
                
                <Route path="/carro/:carroId" element={<CarDetail />} />
                <Route path="/dados-usuario" element={<UserDataPage />} />
                <Route path="/documentos/:carroId" element={<Documentos />} />

                <Route path="/locacao-particular" element={<PrivateRental />} />
                <Route path="/locacao-corporativa" element={<LocacaoCorporativa />} />
                <Route path="/termos-regras" element={<TermsAndRules />} />
                <Route path="/localizacao" element={<Location />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetalhe />} />
                
                {/* Legal Pages */}
                <Route path="/termos-de-uso" element={<TermosDeUso />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/politica-privacidade" element={<Navigate to="/privacidade" replace />} />
                <Route path="/norma-lgpd" element={<NormaLGPD />} />

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/termos-condicoes" element={<Navigate to="/termos-regras" replace />} />
                <Route path="/regras-gerais" element={<Navigate to="/termos-regras" replace />} />
                <Route path="/fale-conosco" element={<Navigate to="/contato" replace />} />

                {/* Protected User Routes */}
                <Route path="/solicitacao/:carId" element={<ProtectedRoute><RequestAnalysis /></ProtectedRoute>} />
                <Route path="/minha-solicitacao/:id" element={<ProtectedRoute><RequestStatus /></ProtectedRoute>} />
                <Route path="/confirmacao-reserva/:reservaId" element={<ProtectedRoute><ReservationConfirmation /></ProtectedRoute>} />
                <Route path="/user" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/minhas-reservas" element={<ProtectedRoute><MinhasReservas /></ProtectedRoute>} />
                <Route path="/reserva/:reservaId" element={<ProtectedRoute><DetalhesReserva /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="usuarios" element={<AdminUsers />} />
                  <Route path="carros" element={<AdminCars />} />
                  <Route path="frota" element={<AdminFleetManager />} />
                  <Route path="precos-carros" element={<AdminCarPricing />} /> 
                  <Route path="carros-destaque" element={<AdminCarrosDestaque />} />
                  
                  <Route path="reservas" element={<AdminReservations />} />
                  <Route path="reserva/:reservaId" element={<AdminDetalhesReserva />} />
                  
                  <Route path="clientes" element={<AdminClientes />} />
                  <Route path="cliente/:clienteId" element={<AdminDetalhesCliente />} />

                  {/* CMS & Config */}
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="blog/novo" element={<AdminBlogNovo />} />
                  <Route path="blog/editar/:id" element={<AdminBlogEditar />} />
                  <Route path="avaliacoes" element={<AdminAvaliacoes />} />
                  <Route path="secoes" element={<AdminSecoes />} />
                  <Route path="conteudo" element={<AdminConteudo />} />
                  <Route path="emails" element={<AdminEmails />} />

                  <Route path="integraciones" element={<AdminIntegrations />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="email-config" element={<AdminEmailConfig />} />
                  <Route path="diagnostico" element={<DiagnosticoPage />} />
                  <Route path="editar-precos-carro/:carroId" element={<AdminEditarPrecosCarro />} />
                  
                  {/* Legacy Routes */}
                  <Route path="fleet" element={<FleetManagement />} />
                  <Route path="car/new" element={<CarForm />} />
                  <Route path="car/:id" element={<CarForm />} />
                  <Route path="prices" element={<PriceControl />} />
                  <Route path="termos-regras" element={<AdminTermsAndRules />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {!pathname.startsWith('/admin') && <Footer />}
            <FloatingWhatsApp />
            <CookieBanner />
            <Toaster />
          </div>
        </AdminModeProvider>
      </ReservaProvider>
    </>
  );
}

export default App;