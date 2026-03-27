import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertTriangle, Loader2, Phone, FileText, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { validateCPF, validatePhone, formatCPF, formatPhone } from '@/lib/validationUtils';
import authService from '@/services/auth/auth-service';
import validadorService from '@/services/validador/validador-service';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  
  const handleInputChange = (e) => {
      const { name, value } = e.target;
      let formattedValue = value;
      
      if (name === 'cpf') formattedValue = formatCPF(value);
      if (name === 'phone') formattedValue = formatPhone(value);
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');


    if (!aceitouTermos) {
        setErrorMsg('Você precisa aceitar os termos de uso para continuar.');
        return;
    }
    if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Senhas não coincidem .");
        return;
    }
    const cpfVal = validateCPF(formData.cpf);
    if (!cpfVal.valid) {
        setErrorMsg(cpfVal.error);
        return;
    }
    const phoneVal = validatePhone(formData.phone);
    if (!phoneVal.valid) {
        setErrorMsg(phoneVal.error);
        return;
    }

    setLoading(true);
    try {
        const [cpfRes, emailRes] = await Promise.all([
            validadorService.postValidadorCpf({ cpf: formData.cpf.replace(/\D/g, '') }),
            validadorService.postValidadorEmail({ email: formData.email })
        ]);

        if (cpfRes?.data?.existe) {
            setErrorMsg(cpfRes.data.mensagem);
            setLoading(false);
            return;
        }
        if (emailRes?.data?.existe) {
            setErrorMsg(emailRes.data.mensagem);
            setLoading(false);
            return;
        }

        const strip = (v) => (v ?? '').replace(/\D/g, '');
        const data = {
            email: formData.email,
            senha: formData.password,
            nome: formData.nome,
            cpf: strip(formData.cpf),
            telefone: '55' + strip(formData.phone),
            aceitouTermos: true
        }
      await authService.postRegister(data);

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta antes de fazer login.",
        className: "bg-green-600 text-white",
        duration: 6000,
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Criar Conta - JL RENT A CAR</title></Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-[#0E3A2F] mb-6 text-center">Criar Conta</h2>
            
            {errorMsg && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertTriangle size={16}/> {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input name="nome" type="text" placeholder='Nome Completo' required value={formData.nome} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input name="cpf" type="text" required value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Celular</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input name="phone" type="text" required value={formData.phone} onChange={handleInputChange} placeholder="(00) 00000-0000" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input name="email" type="email" placeholder='seuemail@gmail.com' required value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input name="password" placeholder='Senha' type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input name="confirmPassword" placeholder='Confirmar Senha' type={showConfirm ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                            <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                                {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <input
                        id="termos"
                        type="checkbox"
                        checked={aceitouTermos}
                        onChange={e => setAceitouTermos(e.target.checked)}
                        className="mt-0.5 accent-[#00D166] cursor-pointer"
                    />
                    <label htmlFor="termos" className="text-sm text-gray-600 cursor-pointer">
                        Li e aceito os{' '}
                        <Link to="/termos-de-uso" target="_blank" className="text-[#00D166] font-bold hover:underline">Termos de Uso</Link>,{' '}
                        <Link to="/politica-privacidade" target="_blank" className="text-[#00D166] font-bold hover:underline">Política de Privacidade</Link>{' '}e{' '}
                        <Link to="/norma-lgpd" target="_blank" className="text-[#00D166] font-bold hover:underline">Norma LGPD</Link>
                    </label>
                </div>

                <button type="submit" disabled={loading || !aceitouTermos} className="w-full py-3 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg hover:bg-[#00F178] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <><Loader2 className="animate-spin" size={18}/> Criando...</> : 'Criar Conta'}
                </button>
            </form>
            
            <p className="mt-6 text-center text-sm text-gray-600">
                Já tem conta? <Link to="/login" className="text-[#00D166] font-bold hover:underline">Faça login</Link>
            </p>
        </motion.div>
      </div>
    </>
  );
};

export default Register;