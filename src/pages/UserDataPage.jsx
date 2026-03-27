import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, User, Mail, Phone, FileText, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useReserva } from '@/context/ReservaContext';
import { useToast } from '@/components/ui/use-toast';
import { formatCPF, formatPhone, formatCEP, validateCPF, validatePhone, validateCEP } from '@/lib/validationUtils';

const UserDataPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { dadosCarro, dadosReserva, setDadosUsuario } = useReserva();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    cnh: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_cidade: '',
    endereco_estado: '',
    endereco_cep: ''
  });

  useEffect(() => {
    // Validate Flow
    if (!dadosCarro || !dadosReserva) {
        toast({ title: "Sessão expirada", description: "Por favor, reinicie a reserva.", variant: "destructive" });
        navigate('/frota');
        return;
    }

    // Prefill if authenticated
    if (isAuthenticated && user) {
        setFormData(prev => ({
            ...prev,
            nome: user.nome || '',
            email: user.email || '',
            telefone: user.telefone || '',
            cpf: user.cpf || '',
            cnh: user.cnh || '',
            endereco_rua: user.endereco_rua || '',
            endereco_numero: user.endereco_numero || '',
            endereco_cidade: user.endereco_cidade || '',
            endereco_estado: user.endereco_estado || '',
            endereco_cep: user.endereco_cep || ''
        }));
    }
  }, [user, isAuthenticated, dadosCarro, dadosReserva, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    if (name === 'cpf') finalValue = formatCPF(value);
    if (name === 'telefone') finalValue = formatPhone(value);
    if (name === 'endereco_cep') finalValue = formatCEP(value);

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic Validation
    const cpfVal = validateCPF(formData.cpf);
    if (!cpfVal.valid) {
        toast({ title: "CPF Inválido", description: cpfVal.error, variant: "destructive" });
        return;
    }

    const strip = (v) => (v ?? '').replace(/\D/g, '');
    const dadosLimpos = {
        ...formData,
        telefone:     strip(formData.telefone),
        cpf:          strip(formData.cpf),
        endereco_cep: strip(formData.endereco_cep),
    };
    setDadosUsuario(dadosLimpos);
    console.log("Dados salvos no contexto");

    if (dadosCarro && dadosCarro.id) {
        navigate(`/documentos/${dadosCarro.id}`);
    } else {
        navigate('/frota');
    }
  };

  if (!dadosCarro) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <>
      <Helmet><title>Seus Dados - JL RENT A CAR</title></Helmet>
      <div className="min-h-screen bg-[#F9FAFB] pb-24 pt-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#0E3A2F] mb-8 font-medium">
            <ArrowLeft size={18} /> Voltar
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
             <div className="mb-8 border-b pb-4">
                 <h1 className="text-2xl font-bold text-[#0E3A2F] mb-2">Informe seus Dados</h1>
                 <p className="text-gray-500">Preencha as informações para o contrato de locação do <strong>{dadosCarro.marca} {dadosCarro.nome}</strong>.</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Personal Info */}
                 <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><User size={14}/> Dados Pessoais</h3>
                     <div className="grid grid-cols-1 gap-4">
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                             <input required name="nome" value={formData.nome} onChange={handleChange} className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                                 <input required name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">CNH</label>
                                 <input required name="cnh" value={formData.cnh} onChange={handleChange} className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Contact */}
                 <div className="space-y-4 pt-4 border-t border-gray-100">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Mail size={14}/> Contato</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                             <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                             <input required name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                         </div>
                     </div>
                 </div>

                 {/* Address */}
                 <div className="space-y-4 pt-4 border-t border-gray-100">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><MapPin size={14}/> Endereço</h3>
                     <div className="grid grid-cols-3 gap-4">
                         <div className="col-span-1">
                             <label className="block text-sm font-bold text-gray-700 mb-1">CEP</label>
                             <input required name="endereco_cep" value={formData.endereco_cep} onChange={handleChange} placeholder="00000-000" className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                         </div>
                         <div className="col-span-2">
                             <label className="block text-sm font-bold text-gray-700 mb-1">Cidade</label>
                             <input required name="endereco_cidade" value={formData.endereco_cidade} onChange={handleChange} className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                         </div>
                         <div className="col-span-2">
                             <label className="block text-sm font-bold text-gray-700 mb-1">Rua</label>
                             <input required name="endereco_rua" value={formData.endereco_rua} onChange={handleChange} className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                         </div>
                         <div className="col-span-1">
                             <label className="block text-sm font-bold text-gray-700 mb-1">Número</label>
                             <input required name="endereco_numero" value={formData.endereco_numero} onChange={handleChange} className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00D166] outline-none transition-all" />
                         </div>
                     </div>
                 </div>

                 <button type="submit" className="w-full py-4 bg-[#00D166] hover:bg-[#00F178] text-[#0E3A2F] font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-6">
                    Continuar para Documentação
                 </button>
             </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDataPage;