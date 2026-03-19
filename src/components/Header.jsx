import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Shield, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/user/userService';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const [user, setUser] = useState(null)

  const isActive = (path) => location.pathname === path ? 'text-[#00D166]' : 'text-white hover:text-[#00D166]';
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isAuthenticated) infoUser();
  }, [isAuthenticated])

  const infoUser = async () => {
    try {
      const r = await userService.getUsersMe()
      setUser(r.data)
      console.log(r)
    } catch (e) {
      console.error(e)
    }
  }

  const logout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  console.log("Header rendering, current path:", location.pathname);

  return (
    <header className="bg-[#0E3A2F] text-white sticky top-0 z-50 shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-1">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://xrkjpufttmfdcvfyakpc.supabase.co/storage/v1/object/public/logo/image3-edit-Photoroom.png"
              alt="Logo"
              className="h-20 w-auto object-contain flex items-center "
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/frota" className={isActive('/frota')}>Nossa Frota</Link>
            <Link to="/locacao-particular" className={isActive('/locacao-particular')}>Info Particular</Link>
            <Link to="/termos-regras" className={isActive('/termos-regras')}>Termos</Link>
            <Link to="/sobre" className={isActive('/sobre')}>Sobre</Link>
            <Link to="/blog" className={isActive('/blog')}>Blog</Link>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors border border-purple-500/30"
                  >
                    <Shield size={16} /> <span className="text-xs font-bold uppercase">Painel Admin</span>
                  </Link>
                )}
                
                <Link 
                   to="/minhas-reservas"
                   className="text-white hover:text-[#00D166] px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-2 transition-all"
                   title="Minhas Reservas"
                >
                   <Calendar size={18} />
                   <span className="hidden xl:inline text-sm font-semibold">Minhas Reservas</span>
                </Link>

                <Link to="/user" className="flex items-center gap-2 text-sm hover:text-[#00D166] transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-[#00D166]/20 flex items-center justify-center text-[#00D166] group-hover:bg-[#00D166] group-hover:text-[#0E3A2F] transition-all overflow-hidden">
                    {user?.user_avatars ? (
                       <img src={user.user_avatars} alt="User" className="w-full h-full object-cover" />
                    ) : (
                       <User size={16} />
                    )}
                  </div>
                  <span className="font-semibold">{user?.nome?.split(' ')[0]}</span>
                </Link>
                
                <button 
                  onClick={() => logout()} 
                  className="text-red-400 hover:text-red-300 hover:bg-white/5 p-2 rounded-full transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                 <Link to="/login" className="text-sm hover:text-[#00D166] font-medium transition-colors">Login</Link>
                 <Link to="/register" className="px-5 py-2.5 bg-[#00D166] text-[#0E3A2F] rounded-lg font-bold text-sm hover:bg-[#00F178] transition-all hover:scale-105 shadow-lg shadow-[#00D166]/20">
                    Cadastre-se
                 </Link>
              </div>
            )}
          </div>

          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-white/10 space-y-4">
            <Link to="/" className="block py-2 px-4 hover:bg-white/5" onClick={closeMenu}>Home</Link>
            <Link to="/frota" className="block py-2 px-4 hover:bg-white/5" onClick={closeMenu}>Nossa Frota</Link>
            <Link to="/locacao-particular" className="block py-2 px-4 hover:bg-white/5" onClick={closeMenu}>Info Particular</Link>
            <Link to="/termos-regras" className="block py-2 px-4 hover:bg-white/5" onClick={closeMenu}>Termos</Link>
            <Link to="/sobre" className="block py-2 px-4 hover:bg-white/5" onClick={closeMenu}>Sobre</Link>
            <Link to="/blog" className="block py-2 px-4 hover:bg-white/5" onClick={closeMenu}>Blog</Link>
            <Link to="/privacidade" className="block py-2 px-4 hover:bg-white/5 text-sm text-gray-400" onClick={closeMenu}>Política de Privacidade</Link>
            <Link to="/termos-de-uso" className="block py-2 px-4 hover:bg-white/5 text-sm text-gray-400" onClick={closeMenu}>Termos de Uso</Link>
            
            <div className="border-t border-white/10 pt-4 px-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 mb-4 px-2">
                     <div className="w-10 h-10 rounded-full bg-[#00D166]/20 flex items-center justify-center text-[#00D166] overflow-hidden">
                        {user?.user_avatars ? (
                           <img src={user.user_avatars} alt="User" className="w-full h-full object-cover" />
                        ) : (
                           <User size={20} />
                        )}
                     </div>
                     <div>
                       <p className="font-bold">{user?.nome}</p>
                       <p className="text-xs text-gray-400">{user?.email}</p>
                     </div>
                  </div>
                  
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 w-full py-3 px-2 text-purple-300 hover:bg-purple-900/20 rounded-lg mb-2" onClick={closeMenu}>
                       <Shield size={18} /> Painel Administrativo
                    </Link>
                  )}
                  
                  <Link to="/minhas-reservas" className="flex items-center gap-2 w-full py-2 px-2 hover:bg-white/5 rounded-lg mb-2" onClick={closeMenu}>
                     <Calendar size={18} /> Minhas Reservas
                  </Link>

                  <Link to="/user" className="flex items-center gap-2 w-full py-2 px-2 hover:bg-white/5 rounded-lg" onClick={closeMenu}>
                     <User size={18} /> Meu Perfil
                  </Link>

                  <button onClick={() => { logout(); closeMenu(); }} className="flex items-center gap-2 text-red-400 w-full py-2 px-2 hover:bg-white/5 rounded-lg">
                    <LogOut size={18} /> Sair
                  </button>
                </>
              ) : (
                 <div className="flex flex-col gap-3">
                    <Link to="/login" className="block text-center py-2 border border-white/20 rounded-lg" onClick={closeMenu}>Login</Link>
                    <Link to="/register" className="block text-center py-2 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg" onClick={closeMenu}>Criar Conta</Link>
                 </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;