import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import userService from '@/services/user/userService';

const DadosPessoaisForm = ({ usuarioId, dadosIniciais, onSalvar }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        cnh: '',
        data_nascimento: '',
        endereco_rua: '',
        endereco_numero: '',
        endereco_complemento: '',
        endereco_cidade: '',
        endereco_estado: '',
        endereco_cep: ''
    });

    useEffect(() => {
        const loadData = async () => {
            if (usuarioId) {
                console.log('Carregando dados do usuário para form:', usuarioId);
                const res = await userService.getUserById(usuarioId);
                const data = res?.data ?? res;

                if (data) {
                    // Ensure we populate state with db keys
                    setFormData(prev => ({ ...prev, ...data }));
                } else if (dadosIniciais) {
                    setFormData(prev => ({ ...prev, ...dadosIniciais }));
                }
            }
            setLoading(false);
        };
        loadData();
    }, [usuarioId, dadosIniciais]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const required = ['nome', 'email', 'telefone', 'cpf', 'cnh', 'endereco_rua', 'endereco_numero', 'endereco_cidade', 'endereco_estado', 'endereco_cep'];
        const missing = required.filter(field => !formData[field]);
        
        if (missing.length > 0) {
            toast({
                title: "Campos obrigatórios",
                description: `Preencha: ${missing.join(', ')}`,
                variant: "destructive"
            });
            return false;
        }
        return true;
    };

    const prepareDataForSave = () => {
        // Create a clean object with only allowed fields
        const cleanedData = {
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            cpf: formData.cpf,
            cnh: formData.cnh,
            data_nascimento: formData.data_nascimento,
            endereco_rua: formData.endereco_rua,
            endereco_numero: formData.endereco_numero,
            endereco_complemento: formData.endereco_complemento,
            endereco_cidade: formData.endereco_cidade,
            endereco_estado: formData.endereco_estado,
            endereco_cep: formData.endereco_cep
        };

        // Explicitly ensure forbidden fields are absent (sanity check)
        delete cleanedData.id;
        delete cleanedData.created_at;
        delete cleanedData.updated_at;

        return cleanedData;
    };

    const handleSalvar = async () => {
        if (!validateForm()) return;
        
        const dataToSave = prepareDataForSave();

        console.log('[DadosPessoaisForm] Salvando dados pessoais...');
        console.log('[DadosPessoaisForm] Dados a salvar:', dataToSave);
        console.log('[DadosPessoaisForm] Contém updated_at:', 'updated_at' in dataToSave);
        
        setSaving(true);
        try {
            await userService.patchUserById(usuarioId, dataToSave);
            console.log('[DadosPessoaisForm] Dados salvos no perfil');
            toast({ title: "Sucesso", description: "Dados atualizados com sucesso!" });
            if (onSalvar) onSalvar(dataToSave);
        } catch (error) {
            console.error('[DadosPessoaisForm] Exceção:', error);
            toast({ title: "Erro", description: "Erro interno ao processar requisição.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-[#0E3A2F] mb-4">Seus Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="nome" label="Nome Completo" value={formData.nome} onChange={handleChange} />
                <Input name="email" label="Email" value={formData.email} onChange={handleChange} disabled={true} />
                <Input name="telefone" label="Telefone / WhatsApp" value={formData.telefone} onChange={handleChange} />
                <Input name="cpf" label="CPF" value={formData.cpf} onChange={handleChange} />
                <Input name="cnh" label="CNH" value={formData.cnh} onChange={handleChange} />
                <Input name="data_nascimento" label="Data Nascimento" type="date" value={formData.data_nascimento || ''} onChange={handleChange} />
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 mb-3">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="endereco_cep" label="CEP" value={formData.endereco_cep} onChange={handleChange} />
                    <Input name="endereco_rua" label="Rua" value={formData.endereco_rua} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="endereco_numero" label="Número" value={formData.endereco_numero} onChange={handleChange} />
                        <Input name="endereco_complemento" label="Complemento" value={formData.endereco_complemento} onChange={handleChange} required={false} />
                    </div>
                    <Input name="endereco_cidade" label="Cidade" value={formData.endereco_cidade} onChange={handleChange} />
                    <Input name="endereco_estado" label="Estado (UF)" value={formData.endereco_estado} onChange={handleChange} />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSalvar} 
                    disabled={saving}
                    className="bg-[#0E3A2F] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#165945] flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Salvar e Confirmar
                </button>
            </div>
        </div>
    );
};

const Input = ({ label, name, value, onChange, type = "text", required = true, disabled = false }) => (
    <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00D166] outline-none disabled:bg-gray-100 disabled:text-gray-500"
        />
    </div>
);

export default DadosPessoaisForm;