import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, AlertTriangle, UploadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useReserva } from '@/context/ReservaContext';
import { useToast } from '@/components/ui/use-toast';

// Services
import { sendReservationEmailToRental, sendConfirmationEmailToUser } from '@/services/emailService';
import { 
    uploadDocumento,
    salvarTodosDocumentos
} from '@/services/documentoService';
import { createReserva, updateReservaStatus } from '@/services/reservaService';
import { carregarDadosUsuario, salvarDadosUsuario } from '@/services/usuarioService';
import { getEmailSuporte } from '@/services/configService';

// Components
import ProgressBar from '@/components/ProgressBar';
import ResumoReservaCard from '@/components/ResumoReservaCard';
import ResumoPrecoCard from '@/components/ResumoPrecoCard';
import DadosPessoaisSection from '@/components/DadosPessoaisSection';
import { DocumentDropzone } from '@/components/DocumentComponents';
import TermosModal from '@/components/TermosModal';

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
      endereco_cidade: '', endereco_estado: '', endereco_cep: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  
  // Files State Management
  const [filesData, setFilesData] = useState({
      cnh: { file: null, status: 'idle', error: null },
      cpf: { file: null, status: 'idle', error: null },
      rg: { file: null, status: 'idle', error: null },
      comprovante_residencia: { file: null, status: 'idle', error: null },
      historico_criminal: { file: null, status: 'idle', error: null }
  });

  const [termosOpen, setTermosOpen] = useState(false);
  const [createdReservaId, setCreatedReservaId] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  // --- 1. Initialization ---
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

    if (usuario?.id) {
        carregarDadosUsuario(usuario.id).then(userData => {
            if (userData) {
                setFormData(prev => ({ ...prev, ...userData }));
            }
            setLoading(false);
        });
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
      const missingFiles = [];
      Object.keys(filesData).forEach(key => {
          if (!filesData[key].file && filesData[key].status !== 'success') missingFiles.push(key.toUpperCase().replace('_', ' '));
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
    console.log("[FLOW] --- INICIANDO PROCESSO DE FINALIZAÇÃO ---");

    try {
        // 1. Create Reservation Record (if not already created)
        let reservaId = createdReservaId;
        
        if (!reservaId) {
            console.log("[FLOW] Step 1: Criando reserva...");
            
            // Save user data first
            const cleanedUserData = { ...formData };
            delete cleanedUserData.id;
            delete cleanedUserData.created_at;
            delete cleanedUserData.updated_at;
            await salvarDadosUsuario(usuario.id, cleanedUserData);

            // Create reservation
            const response = await createReserva(contextData); 
            reservaId = response.id;
            setCreatedReservaId(reservaId);
            console.log(`[FLOW] Reserva criada com sucesso. ID: ${reservaId}`);
        } else {
            console.log(`[FLOW] Step 1: Retomando reserva existente ID: ${reservaId}`);
        }

        // 2. Process Uploads (Only process files not yet successfully uploaded)
        const keysToUpload = Object.keys(filesData).filter(key => filesData[key].status !== 'success');
        let uploadedDocs = []; // To store successful upload metadata
        let hasErrors = false;

        // Note: In real app we might want to preserve previously uploaded docs if retry happens.
        // For simplicity, we assume one-shot success or retry of failures.
        
        for (const key of keysToUpload) {
            const fileObj = filesData[key].file;
            if (!fileObj) continue; // Should have been caught by validation

            console.log(`[FLOW] >> Enviando arquivo: ${key}`);
            setFilesData(prev => ({
                ...prev,
                [key]: { ...prev[key], status: 'uploading', error: null }
            }));

            const result = await uploadDocumento(fileObj, key, reservaId);

            if (result.success) {
                uploadedDocs.push(result.data);
                setFilesData(prev => ({
                    ...prev,
                    [key]: { ...prev[key], status: 'success', error: null }
                }));
            } else {
                console.error(`[FLOW] Erro no upload ${key}:`, result.error);
                setFilesData(prev => ({
                    ...prev,
                    [key]: { ...prev[key], status: 'error', error: result.error }
                }));
                hasErrors = true;
            }
        }

        if (hasErrors) {
            throw new Error("Alguns documentos falharam. Verifique e tente novamente.");
        }

        // 3. Save All Metadata to DB
        if (uploadedDocs.length > 0) {
            console.log("[FLOW] Step 3: Salvando metadados no banco...");
            const saveResult = await salvarTodosDocumentos(reservaId, uploadedDocs);
            if (!saveResult.success) throw new Error("Erro ao salvar informações dos documentos.");
        }

        // 4. Finalize
        console.log("[FLOW] Step 4: Finalizando reserva...");
        await updateReservaStatus(reservaId, 'pendente');
        
        // Emails
        const userEmail = formData.email;
        if (userEmail) {
            getEmailSuporte().then(rentalEmail => {
                 sendReservationEmailToRental(reservaId, rentalEmail, formData, contextData.carro);
                 sendConfirmationEmailToUser(reservaId, userEmail, formData, contextData.carro);
            }).catch(e => console.error("Erro ao enviar emails:", e));
        }

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DocumentDropzone 
                                label="CNH (Completa)" 
                                documentType="cnh"
                                onUpload={handleFileSelect} 
                                loading={filesData.cnh.status === 'uploading'}
                                success={filesData.cnh.status === 'success'}
                                error={filesData.cnh.error}
                            />
                            <DocumentDropzone 
                                label="CPF" 
                                documentType="cpf"
                                onUpload={handleFileSelect} 
                                loading={filesData.cpf.status === 'uploading'}
                                success={filesData.cpf.status === 'success'}
                                error={filesData.cpf.error}
                            />
                            <DocumentDropzone 
                                label="RG (Frente e Verso)" 
                                documentType="rg"
                                onUpload={handleFileSelect} 
                                loading={filesData.rg.status === 'uploading'}
                                success={filesData.rg.status === 'success'}
                                error={filesData.rg.error}
                            />
                            <DocumentDropzone 
                                label="Comprovante de Residência" 
                                documentType="comprovante_residencia"
                                onUpload={handleFileSelect} 
                                loading={filesData.comprovante_residencia.status === 'uploading'}
                                success={filesData.comprovante_residencia.status === 'success'}
                                error={filesData.comprovante_residencia.error}
                            />
                            <div className="md:col-span-2">
                                <DocumentDropzone 
                                    label="Histórico Criminal" 
                                    documentType="historico_criminal"
                                    onUpload={handleFileSelect} 
                                    loading={filesData.historico_criminal.status === 'uploading'}
                                    success={filesData.historico_criminal.status === 'success'}
                                    error={filesData.historico_criminal.error}
                                />
                            </div>
                        </div>
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