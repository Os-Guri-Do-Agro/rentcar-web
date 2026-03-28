import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { isValidEmail } from '@/lib/validationUtils';
import authService from '@/services/auth/auth-service';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'codigo'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Por favor, digite seu e-mail.'); return; }
    if (!isValidEmail(email)) { setError('Por favor, insira um e-mail válido.'); return; }

    setIsSubmitting(true);
    try {
      await authService.postEsqueceuSenha({ email });
      setStep('codigo');
      toast({ title: "Código enviado!", description: `Verifique o e-mail ${email}.`, className: "bg-green-600 text-white" });
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setError('');

    if (!codigo) { setError('Por favor, digite o código recebido.'); return; }

    setIsSubmitting(true);
    try {
      await authService.postVerificarCodigo({ email, codigo });
      sessionStorage.setItem('reset_email', email);
      toast({ title: "Código verificado!", description: "Agora defina sua nova senha.", className: "bg-green-600 text-white" });
      navigate('/reset-password');
    } catch (err) {
      setError('Código inválido ou expirado. Verifique e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Recuperar Senha | JL RENT A CAR</title>
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
            to="/login"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Login</span>
          </Link>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {step === 'email' ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-[#0066FF] rounded-full mb-4">
                    <Mail size={32} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Esqueceu a senha?</h1>
                  <p className="text-gray-500 text-sm">
                    Digite seu e-mail e enviaremos um código de verificação.
                  </p>
                </div>
                <form onSubmit={handleSubmitEmail} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      E-mail Cadastrado
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0066FF] transition-colors" size={20} />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all text-gray-900 placeholder:text-gray-400
                          ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-gray-200 focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300'
                          }`}
                        placeholder="exemplo@email.com"
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-2 text-red-600 text-sm font-medium"
                      >
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#0066FF] text-white rounded-xl font-bold text-lg hover:bg-[#0052CC] shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <><Loader2 className="animate-spin" size={20} />Enviando...</> : 'Enviar Código'}
                  </motion.button>
                </form>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-600 rounded-full mb-4">
                    <KeyRound size={32} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifique seu e-mail</h1>
                  <p className="text-gray-500 text-sm">
                    Enviamos um código de verificação para <strong className="text-gray-700">{email}</strong>. Digite-o abaixo para continuar.
                  </p>
                </div>
                <form onSubmit={handleVerificarCodigo} className="space-y-6">
                  <div>
                    <label htmlFor="codigo" className="block text-sm font-semibold text-gray-700 mb-2">
                      Código de Verificação
                    </label>
                    <input
                      id="codigo"
                      type="text"
                      value={codigo}
                      onChange={(e) => { setCodigo(e.target.value); setError(''); }}
                      className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all text-gray-900 text-center text-xl tracking-widest font-mono placeholder:text-gray-300
                        ${error
                          ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-gray-200 focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300'
                        }`}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                    />
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-2 text-red-600 text-sm font-medium"
                      >
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#0066FF] text-white rounded-xl font-bold text-lg hover:bg-[#0052CC] shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <><Loader2 className="animate-spin" size={20} />Verificando...</> : 'Verificar Código'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setError(''); setCodigo(''); }}
                    className="w-full py-3 text-gray-500 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Voltar para Login
                  </button>
                </form>
              </motion.div>
            )}

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
               <p className="text-sm text-gray-500">
                 Não tem uma conta?{' '}
                 <Link to="/register" className="text-[#0066FF] font-bold hover:underline">
                   Criar conta
                 </Link>
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;