import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { sendPasswordRecoveryEmail } from '@/services/authService';
import { isValidEmail } from '@/lib/validationUtils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email) {
      setError('Por favor, digite seu e-mail.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendPasswordRecoveryEmail(email);

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: "Link Enviado!",
          description: "Verifique sua caixa de entrada para redefinir a senha.",
          className: "bg-green-600 text-white",
        });
      } else {
        setError(result.error);
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-[#0066FF] rounded-full mb-4">
                <Mail size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Esqueceu a senha?</h1>
              <p className="text-gray-500 text-sm">
                Digite seu e-mail abaixo e enviaremos um link para você redefinir sua senha.
              </p>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-6 bg-green-50 rounded-xl border border-green-100"
              >
                <div className="inline-flex p-2 bg-green-100 text-green-600 rounded-full mb-3">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">E-mail Enviado!</h3>
                <p className="text-green-700 text-sm mb-4">
                  O link de recuperação foi enviado para <strong>{email}</strong>.
                </p>
                <p className="text-xs text-green-600">
                  Verifique também sua pasta de spam se não encontrar o e-mail em alguns minutos.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 text-sm font-semibold text-green-800 underline hover:text-green-900"
                >
                  Tentar outro e-mail
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
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
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </motion.button>
              </form>
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