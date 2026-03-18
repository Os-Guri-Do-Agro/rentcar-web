import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { validateCPF, validatePhone, validateCEP, formatCPF, formatPhone, formatCEP } from '@/lib/validationUtils';
import { useToast } from '@/components/ui/use-toast';
import { User, Phone, MapPin, FileText, Edit2, Save, X, Camera, Loader2 } from 'lucide-react';
import userService from '@/services/user/userService';

const Section = ({ title, icon: Icon, children, isEditing, onEdit, onSave, onCancel, loading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-6"
  >
    <div className="bg-[#0E3A2F] px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Icon className="text-[#00D166]" size={24} />
        <h2 className="text-white font-bold text-lg">{title}</h2>
      </div>
      {!isEditing ? (
        <button 
          onClick={onEdit}
          className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <Edit2 size={18} />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button 
            onClick={onCancel}
            disabled={loading}
            className="text-red-300 hover:text-red-200 hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
          <button 
            onClick={onSave}
            disabled={loading}
            className="text-[#00D166] hover:text-[#00F178] hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          </button>
        </div>
      )}
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

const InputGroup = ({ label, value, onChange, disabled, type = "text", placeholder }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full p-2.5 rounded-lg border ${disabled ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#00D166] focus:border-transparent'} transition-all outline-none`}
    />
  </div>
);

const UserProfile = () => {
  // [REPLACE] Replaced user with usuario
  const { usuario, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // States for each section
  const [personalEditing, setPersonalEditing] = useState(false);
  const [contactEditing, setContactEditing] = useState(false);
  const [addressEditing, setAddressEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const findUserInfo = async () => {
    try {
      const res = await userService.getUsersMe()
      const data = res.data
      setUserInfo(data)
      setFormData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        cpf: data.cpf || '',
        data_nascimento: data.data_nascimento || '',
        endereco_rua: data.endereco_rua || '',
        endereco_numero: data.endereco_numero || '',
        endereco_complemento: data.endereco_complemento || '',
        endereco_cidade: data.endereco_cidade || '',
        endereco_estado: data.endereco_estado || '',
        endereco_cep: data.endereco_cep || '',
        cnh: data.cnh || '',
        foto_perfil_url: data.user_avatars || ''
      })
    } catch (e) {
      console.error(e)
    }
  }
  
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({});

  useEffect(() => {
    findUserInfo()
  }, []);

  const handleUpdate = async (section, data) => {
    setLoading(true);
    try {
      await userService.patchUserById(userInfo.id, data);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
        className: "bg-green-600 text-white border-none"
      });
      if (section === 'personal') setPersonalEditing(false);
      if (section === 'contact') setContactEditing(false);
      if (section === 'address') setAddressEditing(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const formDataAvatar = new FormData();
      formDataAvatar.append('file', file);
      await userService.postUserAvatar(formDataAvatar);
      await findUserInfo();
      toast({
        title: "Foto atualizada!",
        description: "Sua nova foto de perfil foi salva.",
        className: "bg-green-600 text-white border-none"
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a foto.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-4 group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#00D166] bg-white shadow-lg">
              {formData.foto_perfil_url ? (
                <img src={formData.foto_perfil_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <User size={48} />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-[#0E3A2F] text-white p-2.5 rounded-full cursor-pointer hover:bg-[#165945] transition-colors shadow-md">
              <Camera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={loading} />
            </label>
          </div>
          <h1 className="text-3xl font-bold text-[#0E3A2F]">{formData.nome || 'Usuário'}</h1>
          <p className="text-gray-500">{formData.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Personal Data */}
          <Section 
            title="Dados Pessoais" 
            icon={User}
            isEditing={personalEditing}
            onEdit={() => setPersonalEditing(true)}
            onCancel={() => {
              setPersonalEditing(false);
              setFormData(prev => ({ ...prev, nome: userInfo.nome, cpf: userInfo.cpf, data_nascimento: userInfo.data_nascimento }));
            }}
            onSave={() => handleUpdate('personal', { nome: formData.nome, cpf: formData.cpf, data_nascimento: formData.data_nascimento })}
            loading={loading}
          >
            <InputGroup 
              label="Nome Completo" 
              value={formData.nome} 
              onChange={(e) => setFormData({...formData, nome: e.target.value})} 
              disabled={!personalEditing}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup 
                label="CPF" 
                value={personalEditing ? formData.cpf : formatCPF(formData.cpf)}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})} 
                disabled={!personalEditing}
                placeholder="000.000.000-00"
              />
              <InputGroup 
                label="Data de Nascimento" 
                type="date"
                value={formData.data_nascimento} 
                onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})} 
                disabled={!personalEditing}
              />
            </div>
          </Section>

          {/* Contact Data */}
          <Section 
            title="Contato" 
            icon={Phone}
            isEditing={contactEditing}
            onEdit={() => setContactEditing(true)}
            onCancel={() => {
              setContactEditing(false);
              setFormData(prev => ({ ...prev, telefone: userInfo.telefone }));
            }}
            onSave={() => handleUpdate('contact', { telefone: formData.telefone })}
            loading={loading}
          >
            <InputGroup 
              label="E-mail" 
              value={formData.email} 
              disabled={true} 
            />
            <InputGroup 
              label="Telefone / WhatsApp" 
              value={contactEditing ? formData.telefone : formatPhone(formData.telefone)}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})} 
              disabled={!contactEditing}
              placeholder="(00) 00000-0000"
            />
          </Section>

          {/* Address Data */}
          <div className="lg:col-span-2">
            <Section 
              title="Endereço" 
              icon={MapPin}
              isEditing={addressEditing}
              onEdit={() => setAddressEditing(true)}
              onCancel={() => {
                setAddressEditing(false);
                setFormData(prev => ({ 
                  ...prev, 
                  endereco_cep: userInfo.endereco_cep,
                  endereco_rua: userInfo.endereco_rua,
                  endereco_numero: userInfo.endereco_numero,
                  endereco_complemento: userInfo.endereco_complemento,
                  endereco_cidade: userInfo.endereco_cidade,
                  endereco_estado: userInfo.endereco_estado
                }));
              }}
              onSave={() => handleUpdate('address', { 
                endereco_cep: formData.endereco_cep,
                endereco_rua: formData.endereco_rua,
                endereco_numero: formData.endereco_numero,
                endereco_complemento: formData.endereco_complemento,
                endereco_cidade: formData.endereco_cidade,
                endereco_estado: formData.endereco_estado
              })}
              loading={loading}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="md:col-span-1">
                    <InputGroup 
                      label="CEP" 
                      value={addressEditing ? formData.endereco_cep : formatCEP(formData.endereco_cep)}
                      onChange={(e) => setFormData({...formData, endereco_cep: e.target.value})} 
                      disabled={!addressEditing}
                      placeholder="00000-000"
                    />
                 </div>
                 <div className="md:col-span-2">
                    <InputGroup 
                      label="Rua / Avenida" 
                      value={formData.endereco_rua} 
                      onChange={(e) => setFormData({...formData, endereco_rua: e.target.value})} 
                      disabled={!addressEditing}
                    />
                 </div>
                 <div className="md:col-span-1">
                    <InputGroup 
                      label="Número" 
                      value={formData.endereco_numero} 
                      onChange={(e) => setFormData({...formData, endereco_numero: e.target.value})} 
                      disabled={!addressEditing}
                    />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <InputGroup 
                    label="Complemento" 
                    value={formData.endereco_complemento} 
                    onChange={(e) => setFormData({...formData, endereco_complemento: e.target.value})} 
                    disabled={!addressEditing}
                 />
                 <InputGroup 
                    label="Cidade" 
                    value={formData.endereco_cidade} 
                    onChange={(e) => setFormData({...formData, endereco_cidade: e.target.value})} 
                    disabled={!addressEditing}
                 />
                 <InputGroup 
                    label="Estado (UF)" 
                    value={formData.endereco_estado} 
                    onChange={(e) => setFormData({...formData, endereco_estado: e.target.value})} 
                    disabled={!addressEditing}
                    placeholder="SP"
                 />
              </div>
            </Section>
          </div>
          
           {/* Documents (Just view/basic edit for CNH) */}
           <div className="lg:col-span-2">
             <Section
                title="Documentos"
                icon={FileText}
                isEditing={false} // Complex edits via specific flow usually
                onEdit={() => {}} // Could open modal
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Carteira Nacional de Habilitação (CNH)</p>
                      {formData.cnh ? (
                         <div className="flex items-center gap-2 text-[#0E3A2F] font-medium">
                            <span className="bg-green-100 p-1 rounded text-[#00D166]"><FileText size={16}/></span>
                            {formData.cnh}
                         </div>
                      ) : (
                         <p className="text-gray-400 italic text-sm">Não informada</p>
                      )}
                   </div>
                   <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Status da Conta</p>
                        <p className="text-sm font-medium text-gray-700">Verificação de identidade</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Pendente</span>
                   </div>
                </div>
             </Section>
           </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;