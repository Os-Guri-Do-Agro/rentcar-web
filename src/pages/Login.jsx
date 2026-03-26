import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, AlertCircle, Loader2, Eye, EyeOff, Send, X, MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import authService from '@/services/auth/auth-service';

const ConfirmacaoEmailModal = ({ email: initialEmail, onClose }) => {
  const [reenvioEmail, setReenvioEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { toast } = useToast();

  const handleReenviar = async () => {
    if (!reenvioEmail) return;
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await authService.postReenviarConfirmacao({ email: reenvioEmail });
      const msg = res?.data?.mensagem || 'E-mail reenviado com sucesso!';
      setSuccessMsg(msg);
    } catch {
      toast({ title: 'Erro ao reenviar e-mail', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
            <MailCheck size={26} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">E-mail não confirmado</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.
          </p>
        </div>

        {successMsg ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm text-center">
            {successMsg}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="email"
                value={reenvioEmail}
                onChange={e => setReenvioEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-300 text-sm"
              />
            </div>
            <button
              onClick={handleReenviar}
              disabled={loading || !reenvioEmail}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {loading ? 'Reenviando...' : 'Reenviar confirmação'}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Fechar
        </button>
      </motion.div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalEmail, setModalEmail] = useState(null); // null = fechado

  const { isAuthenticated, login, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isAdmin) navigate('/admin');
    if (isAuthenticated && !isAdmin) navigate('/frota');
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await authService.postLogin({ email, password });
      login(res.data.token);
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta à JL Rent a Car',
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || '';
      const isEmailNaoConfirmado =
        msg.toLowerCase().includes('confirme seu e-mail') ||
        msg.toLowerCase().includes('confirme seu email');

      if (isEmailNaoConfirmado) {
        setModalEmail(email);
      } else {
        toast({
          title: 'Erro ao fazer login',
          description: msg || 'Verifique suas credenciais e tente novamente',
          variant: 'destructive',
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - JL RENT A CAR</title>
        <meta name="description" content="Acesse sua conta JL Rent a Car" />
      </Helmet>

      <AnimatePresence>
        {modalEmail !== null && (
          <ConfirmacaoEmailModal
            email={modalEmail}
            onClose={() => setModalEmail(null)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-[#0E3A2F] via-[#165945] to-[#0E3A2F] flex items-center justify-center py-12 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar à Home</span>
          </Link>

          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="rounded-lg mb-4 overflow-hidden flex justify-center">
                <img
                  src="https://horizons-cdn.hostinger.com/8fda7eda-572b-44df-8780-0af2f709550b/design-sem-nome-hstXm.png"
                  alt="JL RENT A CAR"
                  className="h-13 w-[100px] rounded-[50px]"
                />
              </div>
              <h1 className="text-3xl font-bold text-[#0E3A2F] mb-2">Bem-vindo de Volta</h1>
              <p className="text-gray-600">Entre na sua conta para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00D166] transition-colors" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all text-gray-900 ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#00D166] hover:border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm font-medium">
                    <AlertCircle size={14} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00D166] transition-colors" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full pl-11 pr-10 py-3 border-2 rounded-xl outline-none transition-all text-gray-900 ${
                      errors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#00D166] hover:border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00D166] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-between items-start mt-2">
                  {errors.password ? (
                    <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                      <AlertCircle size={14} />
                      <span>{errors.password}</span>
                    </div>
                  ) : <span />}
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-gray-500 hover:text-[#0E3A2F] transition-colors"
                  >
                    Esqueci a senha?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#0E3A2F] to-[#165945] text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </motion.button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
              <Link to="/register" className="text-sm text-[#0E3A2F] hover:underline font-bold">
                Não tem uma conta? Cadastre-se
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
