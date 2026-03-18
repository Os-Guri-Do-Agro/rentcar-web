import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { validateCPF, validatePhone, validateCEP, isValidEmail } from '@/lib/validationUtils';

const InputField = ({ 
  label, name, value, onChange, onBlur, error, success, type = "text", placeholder, icon: Icon, disabled = false 
}) => (
  <div className="relative mb-4">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1.5 md:flex justify-between">
      {label}
      <AnimatePresence>
        {error && (
            <motion.span 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 flex items-center gap-1"
            >
                {error}
            </motion.span>
        )}
      </AnimatePresence>
    </label>
    <div className="relative group">
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-label={label}
        className={`
          w-full pl-10 pr-10 py-3 rounded-xl border text-gray-900 bg-white
          placeholder:text-gray-400 text-sm transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-50 disabled:text-gray-500
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
            : success 
              ? 'border-green-300 focus:border-green-500 focus:ring-green-100' 
              : 'border-gray-200 focus:border-[#0066FF] focus:ring-blue-50 hover:border-gray-300'}
        `}
      />
      <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#0066FF] transition-colors">
        {Icon && <Icon size={18} />}
      </div>
      
      <div className="absolute right-3 top-3">
        <AnimatePresence>
            {error && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><AlertCircle size={18} className="text-red-500" /></motion.div>}
            {success && !error && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 size={18} className="text-green-500" /></motion.div>}
        </AnimatePresence>
      </div>
    </div>
  </div>
);

const DadosPessoaisSection = ({ formData, setFormData, errors, setErrors, touched, setTouched }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMsg = null;
    
    switch (name) {
        case 'email':
            if (!value) errorMsg = 'Email é obrigatório';
            else if (!isValidEmail(value)) errorMsg = 'Formato de email inválido';
            break;
        case 'cpf':
            if (!value) errorMsg = 'CPF é obrigatório';
            else if (!validateCPF(value)) errorMsg = 'CPF inválido';
            break;
        case 'telefone':
            if (!value) errorMsg = 'Telefone é obrigatório';
            else if (!validatePhone(value)) errorMsg = 'Telefone inválido';
            break;
        case 'endereco_cep':
            if (!value) errorMsg = 'CEP obrigatório';
            else if (!validateCEP(value)) errorMsg = 'CEP inválido';
            break;
        case 'nome':
        case 'endereco_rua':
        case 'endereco_numero':
        case 'endereco_cidade':
        case 'endereco_estado':
            if (!value) errorMsg = 'Campo obrigatório';
            break;
        default:
            break;
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const getStatus = (fieldName) => {
      const isError = !!errors[fieldName];
      const isSuccess = touched[fieldName] && !isError && formData[fieldName]?.length > 0;
      return { error: errors[fieldName], success: isSuccess };
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Informações Pessoais */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-[#0066FF] rounded-lg">
                <User size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Informações Pessoais</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
                label="Nome Completo" name="nome" placeholder="Seu nome completo" icon={User}
                value={formData.nome} onChange={handleChange} onBlur={handleBlur} {...getStatus('nome')}
            />
             <InputField 
                label="Email" name="email" type="email" placeholder="seu@email.com" icon={User} disabled={true}
                value={formData.email} onChange={handleChange} onBlur={handleBlur} {...getStatus('email')}
            />
             <InputField 
                label="Telefone / WhatsApp" name="telefone" placeholder="(00) 00000-0000" icon={User}
                value={formData.telefone} onChange={handleChange} onBlur={handleBlur} {...getStatus('telefone')}
            />
             <InputField 
                label="Data Nascimento" name="data_nascimento" type="date" icon={User}
                value={formData.data_nascimento} onChange={handleChange} onBlur={handleBlur}
            />
        </div>
      </section>

      {/* 2. Documentos */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Documentação</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
                label="CPF" name="cpf" placeholder="000.000.000-00" icon={FileText}
                value={formData.cpf} onChange={handleChange} onBlur={handleBlur} {...getStatus('cpf')}
            />
            <InputField 
                label="CNH (Opcional)" name="cnh" placeholder="Número da CNH" icon={FileText}
                value={formData.cnh} onChange={handleChange} onBlur={handleBlur}
            />
        </div>
      </section>

      {/* 3. Endereço */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <MapPin size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Endereço</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
                label="CEP" name="endereco_cep" placeholder="00000-000" icon={MapPin}
                value={formData.endereco_cep} onChange={handleChange} onBlur={handleBlur} {...getStatus('endereco_cep')}
            />
             <div className="md:col-span-2 grid grid-cols-[1fr_120px] gap-4">
                 <InputField 
                    label="Rua / Avenida" name="endereco_rua" placeholder="Nome da rua" icon={MapPin}
                    value={formData.endereco_rua} onChange={handleChange} onBlur={handleBlur} {...getStatus('endereco_rua')}
                />
                 <InputField 
                    label="Número" name="endereco_numero" placeholder="123" icon={MapPin}
                    value={formData.endereco_numero} onChange={handleChange} onBlur={handleBlur} {...getStatus('endereco_numero')}
                />
             </div>
             <InputField 
                label="Complemento" name="endereco_complemento" placeholder="Apto, Bloco (Opcional)" icon={MapPin}
                value={formData.endereco_complemento} onChange={handleChange} onBlur={handleBlur}
            />
             <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="Cidade" name="endereco_cidade" placeholder="Cidade" icon={MapPin}
                    value={formData.endereco_cidade} onChange={handleChange} onBlur={handleBlur} {...getStatus('endereco_cidade')}
                />
                <InputField 
                    label="Estado" name="endereco_estado" placeholder="UF" icon={MapPin}
                    value={formData.endereco_estado} onChange={handleChange} onBlur={handleBlur} {...getStatus('endereco_estado')}
                />
             </div>
        </div>
      </section>

    </div>
  );
};

export default DadosPessoaisSection;