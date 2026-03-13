import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, XCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { resetPassword, validatePasswordStrength } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Logic State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validSession, setValidSession] = useState(true); // Assume true initially if reached via link
  
  // Validation State
  const [strength, setStrength] = useState({ score: 'weak', requirements: [] });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Check for session/fragment on mount
  useEffect(() => {
    const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) {
         // Standard Supabase flow: URL contains hash with access_token. 
         // The Supabase client usually handles this automatically on load.
         // If still no session, the link might be expired or invalid.
         console.warn("No active session found on Reset Password page.");
         // We don't block immediately because sometimes the session handshake takes a moment,
         // but ideally the auth state listener would handle this.
         // For now, we allow the user to see the form but submission will fail if no session.
       }
    };
    
    // Listen for auth state changes to detect the recovery login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event on Reset Page:", event);
      if (event === 'PASSWORD_RECOVERY') {
         setValidSession(true);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  // Update validation on type
  useEffect(() => {
    setStrength(validatePasswordStrength(password));
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
        setPasswordsMatch(password === confirmPassword);
    } else {
        setPasswordsMatch(true); // Don't show error if empty
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
        setError('Digite a nova senha.');
        return;
    }
    if (strength.score === 'weak') {
        setError('A senha não atende aos requisitos de segurança.');
        return;
    }
    if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
    }

    setIsSubmitting(true);

    // Usually token is in the hash and handled by Supabase Session
    const result = await resetPassword(password);

    if (result.success) {
        setIsSuccess(true);
        toast({
            title: "Senha Atualizada!",
            description: "Você será redirecionado para o login.",
            className: "bg-green-600 text-white",
        });
        setTimeout(() => navigate('/login'), 3000);
    } else {
        setError(result.error);
        if (result.error.includes("different from the old")) {
           setError("A nova senha deve ser diferente da antiga.");
        } else if (result.error.includes("expired")) {
           setValidSession(false);
        }
        toast({
            title: "Erro",
            description: "Falha ao atualizar senha.",
            variant: "destructive",
        });
    }
    setIsSubmitting(false);
  };

  const getScoreColor = () => {
      if (strength.score === 'strong') return 'bg-green-500';
      if (strength.score === 'medium') return 'bg-yellow-500';
      return 'bg-red-500';
  };
  
  const getScoreWidth = () => {
      if (strength.score === 'strong') return '100%';
      if (strength.score === 'medium') return '66%';
      return '33%';
  };

  if (!validSession && !isSuccess) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                  <XCircle size={48} className="mx-auto text-red-500 mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Link Inválido ou Expirado</h2>
                  <p className="text-gray-500 mb-6">O link de recuperação de senha expirou ou já foi utilizado. Por favor, solicite um novo.</p>
                  <Link to="/forgot-password" className="inline-block w-full py-3 bg-[#0066FF] text-white rounded-xl font-bold hover:bg-blue-700">
                      Solicitar Novo Link
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <>
      <Helmet>
        <title>Redefinir Senha | JL RENT A CAR</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0E3A2F] via-[#165945] to-[#0E3A2F] flex items-center justify-center py-12 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar Nova Senha</h1>
              <p className="text-gray-500 text-sm">
                Sua nova senha deve ser diferente das senhas anteriores.
              </p>
            </div>

            {isSuccess ? (
               <div className="text-center py-8">
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex p-4 bg-green-100 text-green-600 rounded-full mb-4">
                       <CheckCircle2 size={48} />
                   </motion.div>
                   <h2 className="text-xl font-bold text-gray-900 mb-2">Sucesso!</h2>
                   <p className="text-gray-500">Sua senha foi redefinida. Redirecionando...</p>
               </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="Mínimo 8 caracteres"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        {/* Strength Meter */}
                        {password && (
                            <div className="mt-2">
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                                    <div 
                                        className={`h-full transition-all duration-300 ${getScoreColor()}`} 
                                        style={{ width: getScoreWidth() }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {strength.requirements?.map((req) => (
                                        <div key={req.id} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                                            {req.met ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />}
                                            {req.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                                    !passwordsMatch && confirmPassword 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                                    : 'border-gray-200 focus:border-[#0066FF] focus:ring-blue-500/10'
                                }`}
                                placeholder="Repita a senha"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {!passwordsMatch && confirmPassword && (
                            <p className="text-xs text-red-500 mt-1 font-medium">As senhas não coincidem.</p>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || strength.score === 'weak' || !passwordsMatch || !password}
                        className="w-full py-3.5 bg-[#0066FF] text-white rounded-xl font-bold text-lg hover:bg-[#0052CC] shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Atualizando...
                            </>
                        ) : 'Atualizar Senha'}
                    </button>
                </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;