import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, AlertTriangle, UploadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useReserva } from '@/context/ReservaContext';
import { useToast } from '@/components/ui/use-toast';

// Services
import reservasService from '@/services/reservas/reservas-services';
import userService from '@/services/user/userService';

// Mapeia chave interna → tipo aceito pela API
const DOC_TYPE_MAP = {
  comprovante_trabalho: 'comprovante_trabalho_plataforma',
};

// Components
import ProgressBar from '@/components/ProgressBar';
import ResumoReservaCard from '@/components/ResumoReservaCard';
import ResumoPrecoCard from '@/components/ResumoPrecoCard';
import DadosPessoaisSection from '@/components/DadosPessoaisSection';
import { DocumentDropzone } from '@/components/DocumentComponents';
import TermosModal from '@/components/TermosModal';

const DOCS_CONFIG = {
  particular: [
    { key: 'cnh',                   label: 'CNH (Completa)' },
    { key: 'comprovante_residencia', label: 'Comprovante de Residência' },
    { key: 'rg',                    label: 'RG (Frente e Verso)' },
  ],
  motorista: [
    { key: 'historico_criminal',    label: 'Histórico Criminal' },
    { key: 'cnh',                   label: 'CNH (com EAR)' },
    { key: 'comprovante_residencia', label: 'Comprovante de Residência' },
    { key: 'comprovante_trabalho',  label: 'Comprovante de Trabalho na Plataforma' },
  ],
  corporativo: [
    { key: 'cnpj',                  label: 'CNPJ' },
    { key: 'comprovante_residencia', label: 'Comprovante de Residência' },
    { key: 'cnh_responsavel',       label: 'CNH do Responsável' },
  ],
};

const ALL_DOC_KEYS = [...new Set(Object.values(DOCS_CONFIG).flat().map(d => d.key))];

const Documentos = () => {
  const { carroId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, isAuthenticated } = useAuth();
  const { getDadosCompletos, limparDados } = useReserva();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextData, setContextData] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
      nome: '', email: '', telefone: '', cpf: '', cnh: '', data_nascimento: '',
      endereco_rua: '', endereco_numero: '', endereco_complemento: '',
      endereco_cidade: '', endereco_estado: '', endereco_cep: '', aceitou_termos: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  
  // Files State Management
  const [filesData, setFilesData] = useState(
    () => Object.fromEntries(ALL_DOC_KEYS.map(k => [k, { file: null, status: 'idle', error: null }]))
  );

  const [termosOpen, setTermosOpen] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    let dados = null;
    if (location.state?.reserva) {
        dados = {
            reserva: location.state.reserva,
            carro: location.state.carro || { id: carroId },
            usuario: usuario,
            tipoReserva: location.state.reserva.tipo_locacao
        };
    } else {
        dados = getDadosCompletos();
    }

    if (!dados?.reserva?.valorTotal) {
         toast({ title: "Erro de Dados", description: "Dados da reserva incompletos. Redirecionando...", variant: "destructive" });
         navigate('/frota');
         return;
    }

    setContextData(dados);

    const token = localStorage.getItem('token');
    if (token) {
        userService.getUsersMe().then(res => {
            const data = res?.data ?? res;
            setFormData(prev => ({
                ...prev,
                nome: data.nome || '',
                email: data.email || '',
                telefone: data.telefone || '',
                cpf: data.cpf || '',
                cnh: data.cnh || '',
                data_nascimento: data.data_nascimento?.split('T')[0] || '',
                endereco_rua: data.endereco_rua || '',
                endereco_numero: data.endereco_numero || '',
                endereco_complemento: data.endereco_complemento || '',
                endereco_cidade: data.endereco_cidade || '',
                endereco_estado: data.endereco_estado || '',
                endereco_cep: data.endereco_cep || '',
                aceitou_termos: data.aceitou_termos
            }));
        }).catch(() => {}).finally(() => setLoading(false));
    } else if (usuario?.id) {
        userService.getUserById(usuario.id).then(res => {
            const userData = res?.data ?? res;
            if (userData) setFormData(prev => ({ ...prev, ...userData }));
            setLoading(false);
        }).catch(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [usuario, navigate, location, carroId]);

  // --- 2. Handlers ---

  const handleFileSelect = (file, type) => {
    if (file) {
        setFilesData(prev => ({
            ...prev,
            [type]: { file: file, status: 'idle', error: null }
        }));
    }
  };

  const validateAllFields = () => {
      const requiredFields = ['nome', 'email', 'telefone', 'cpf', 'endereco_rua', 'endereco_numero', 'endereco_cidade', 'endereco_estado', 'endereco_cep'];
      const newErrors = {};
      let isValid = true;

      requiredFields.forEach(field => {
          if (!formData[field]) {
              newErrors[field] = 'Campo obrigatório';
              isValid = false;
          }
      });
      
      setFormErrors(prev => ({ ...prev, ...newErrors }));
      setFormTouched(prev => requiredFields.reduce((acc, curr) => ({...acc, [curr]: true}), {}));
      
      return isValid;
  };

  const handlePreSubmit = () => {
      if (!isAuthenticated) {
          toast({ title: "Login Necessário", description: "Faça login para continuar.", variant: "default" });
          navigate('/login');
          return;
      }

      if (!validateAllFields()) {
          toast({ title: "Atenção", description: "Preencha todos os campos obrigatórios em vermelho.", variant: "destructive" });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
      }
      
      // Validate File Presence
      const docsRequeridos = DOCS_CONFIG[contextData?.tipoReserva] ?? DOCS_CONFIG.particular;
      const missingFiles = [];
      docsRequeridos.forEach(({ key, label }) => {
          if (!filesData[key]?.file && filesData[key]?.status !== 'success') missingFiles.push(label);
      });

      if (missingFiles.length > 0) {
          toast({ 
              title: "Documentos Faltando", 
              description: `Por favor, anexe: ${missingFiles.join(', ')}.`, 
              variant: "destructive" 
          });
          return;
      }
      
      setTermosOpen(true);
  };

  const handleFinalSubmit = async () => {
    setTermosOpen(false);
    setIsSubmitting(true);
    setGlobalError(null);

    try {
        const reserva = contextData.reserva;

        // Build multipart/form-data payload
        const payload = new FormData();

        // Reservation fields
        payload.append('carro_id',          contextData.carro?.id ?? '');
        payload.append('data_retirada',     reserva.dataRetirada || reserva.dataInicio || '');
        payload.append('data_devolucao',    reserva.dataDevolucao || reserva.dataFim || '');
        payload.append('valor_total',       String(reserva.valorTotal ?? 0));
        payload.append('tipo_reserva',      contextData.tipoReserva || reserva.tipo_locacao || '');
        payload.append('plano',             reserva.plano ?? '');
        payload.append('franquia_km',       String(reserva.franquia_km ?? ''));
        payload.append('valor_diario',      String(reserva.valorDiario ?? 0));
        payload.append('km_contratado',     String(reserva.km_contratado ?? 0));
        payload.append('km_adicional_valor', String(reserva.kmExcedente ?? 0));
        payload.append('origem_frota',      'site');
        payload.append('aceitou_termos', 'true');


        // User data as JSON string
        const usuarioPayload = {
            nome:                 formData.nome,
            email:                formData.email,
            telefone:             formData.telefone,
            data_nascimento:      formData.data_nascimento,
            cpf:                  formData.cpf,
            cnpj:                 formData.cnpj ?? '',
            endereco_cep:         formData.endereco_cep,
            endereco_rua:         formData.endereco_rua,
            endereco_numero:      formData.endereco_numero,
            endereco_complemento: formData.endereco_complemento ?? '',
            endereco_cidade:      formData.endereco_cidade,
            endereco_estado:      formData.endereco_estado,
            cnh:                  formData.cnh ?? '',
        };

        // Attach files — named as `TIPO+filename.pdf` so the API identifies the type
        const docsRequeridos = DOCS_CONFIG[contextData?.tipoReserva] ?? DOCS_CONFIG.particular;
        docsRequeridos.forEach(({ key }) => {
            const fileObj = filesData[key]?.file;
            if (!fileObj) return;
            const apiType = DOC_TYPE_MAP[key] ?? key;
            const namedFile = new File([fileObj], `${apiType}+${fileObj.name}`, { type: fileObj.type });
            payload.append('files', namedFile);
        });

        const response = await reservasService.postReservaComArquivos(payload);
        const reservaId = response?.id ?? response?.data?.id;
        
        toast({ title: "Reserva Realizada!", description: "Documentos enviados com sucesso.", className: "bg-green-600 text-white" });
        limparDados();
        navigate(`/confirmacao-reserva/${reservaId}`);

    } catch (error) {
        console.error('[Documentos] ERRO FATAL:', error);
        setGlobalError(error.message || "Ocorreu um erro no processo.");
        toast({ title: "Atenção", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || !contextData) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <UploadCloud size={48} className="text-[#0066FF]" />
            </motion.div>
            <p className="text-gray-500 font-medium">Carregando...</p>
        </div>
      );
  }

  return (
    <>
      <Helmet><title>Finalizar Reserva | JL Rent a Car</title></Helmet>
      
      <div className="min-h-screen bg-[#F9FAFB] font-sans pb-32 lg:pb-12">
        <ProgressBar currentStep={2} />

        <div className="container mx-auto px-4 py-6 lg:py-10">
            <motion.button 
                whileHover={{ x: -5 }} onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-500 hover:text-[#0066FF] mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> <span className="font-medium">Voltar para seleção</span>
            </motion.button>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full lg:w-[60%] space-y-8">
                    <div className="mb-2">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Seus Dados</h1>
                        <p className="text-gray-500 mt-1">Preencha com atenção. Seus dados são seguros.</p>
                    </div>

                    <DadosPessoaisSection 
                        formData={formData} setFormData={setFormData}
                        errors={formErrors} setErrors={setFormErrors}
                        touched={formTouched} setTouched={setFormTouched}
                    />

                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><ShieldCheck size={20} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Documentação Obrigatória</h3>
                                <p className="text-sm text-gray-500">Envie os arquivos em formato PDF (Max 10MB cada).</p>
                            </div>
                        </div>

                        {globalError && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 animate-in slide-in-from-top-2">
                                <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">Houve um problema no envio:</p>
                                    <p>{globalError}</p>
                                    <p className="mt-2 text-xs font-semibold">Tente enviar novamente clicando no botão abaixo.</p>
                                </div>
                            </div>
                        )}

                        {(() => {
                            const docs = DOCS_CONFIG[contextData.tipoReserva] ?? DOCS_CONFIG.particular;
                            const isOdd = docs.length % 2 !== 0;
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {docs.map(({ key, label }, idx) => {
                                        const isLastOdd = isOdd && idx === docs.length - 1;
                                        return (
                                            <div key={key} className={isLastOdd ? 'md:col-span-2' : ''}>
                                                <DocumentDropzone
                                                    label={label}
                                                    documentType={key}
                                                    onUpload={handleFileSelect}
                                                    loading={filesData[key]?.status === 'uploading'}
                                                    success={filesData[key]?.status === 'success'}
                                                    error={filesData[key]?.error}
                                                    acceptImage={key === 'comprovante_trabalho'}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </section>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full lg:w-[40%] lg:sticky lg:top-24 space-y-6">
                    <ResumoReservaCard carro={contextData.carro} reserva={contextData.reserva} isExpandedMobile={true} />
                    <div className="hidden lg:block">
                        <ResumoPrecoCard 
                            reserva={contextData.reserva} 
                            loading={isSubmitting} 
                            onFinalizar={handlePreSubmit}
                            buttonLabel={globalError ? "Tentar Novamente" : "Finalizar Reserva"}
                        />
                    </div>
                </motion.div>
            </div>
        </div>

        <div className="lg:hidden">
            <ResumoPrecoCard 
                reserva={contextData.reserva} 
                loading={isSubmitting} 
                onFinalizar={handlePreSubmit}
                buttonLabel={globalError ? "Tentar Novamente" : "Finalizar Reserva"}
            />
        </div>

        <TermosModal open={termosOpen} onAccept={handleFinalSubmit} onCancel={() => setTermosOpen(false)} />
      </div>
    </>
  );
};

export default Documentos;