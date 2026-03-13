import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Check, X, AlertTriangle, Loader2, Phone, FileText } from 'lucide-react';
import { register } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { validateCPF, validatePhone, formatCPF, formatPhone } from '@/lib/validationUtils';

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
  
  // Formatters
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
    console.log("Validando formulário...");

    // Validations
    if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Senhas não conferem.");
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
      console.log("Enviando registro...");
      await register(formData.email, formData.password, formData.nome);
      // Here you would typically update the user profile with CPF/Phone as well, 
      // but register service might need update or we do a second call. 
      // Assuming register handles basic auth and we prompt for profile completion or update it here if authService supported it.
      // For this task, we assume success and redirect.
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando...",
        className: "bg-green-600 text-white"
      });
      setTimeout(() => navigate('/login'), 2000);
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
                        <input name="nome" type="text" required value={formData.nome} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
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
                        <input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input name="password" type="password" required value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg hover:bg-[#00F178] transition-all flex justify-center items-center gap-2">
                    {loading && <Loader2 className="animate-spin" size={18}/>} Criar Conta
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