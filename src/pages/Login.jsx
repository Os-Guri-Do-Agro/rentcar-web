import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log("Login bem-sucedido (estado detectado)");
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, loading, navigate]);

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
        const result = await login(email, password);
        // If login throws, it goes to catch. If returns object, success.
        toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta à JL Rent a Car",
            duration: 3000,
            className: "bg-green-600 text-white"
        });
    } catch (error) {
        toast({
            title: "Erro ao fazer login",
            description: error.message || "Verifique suas credenciais e tente novamente",
            variant: "destructive",
            duration: 4000,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return null; 

  return (
    <>
      <Helmet>
        <title>Login - JL RENT A CAR</title>
        <meta name="description" content="Acesse sua conta JL Rent a Car" />
      </Helmet>

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
              <div className="rounded-lg mb-4 overflow-hidden flex justify-center ">
                <img 
                  src="https://horizons-cdn.hostinger.com/8fda7eda-572b-44df-8780-0af2f709550b/design-sem-nome-hstXm.png" 
                  alt="JL RENT A CAR" 
                  className="h-13 w-[100px] rounded-[50px] "
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
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all text-gray-900 ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#00D166] hover:border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-between items-start mt-2">
                    {errors.password ? (
                        <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                            <AlertCircle size={14} />
                            <span>{errors.password}</span>
                        </div>
                    ) : <span></span>}
                    
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