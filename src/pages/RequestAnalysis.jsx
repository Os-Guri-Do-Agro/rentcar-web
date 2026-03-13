import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileText, CheckCircle, Car as CarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const RequestAnalysis = () => {
  const { carId } = useParams();
  // [REPLACE] Replaced user with usuario
  const { usuario, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [car, setCar] = useState(null);
  const [tipoLocacao, setTipoLocacao] = useState('aplicativo');
  const [loading, setLoading] = useState(false);
  const [fetchingCar, setFetchingCar] = useState(true);
  const [documents, setDocuments] = useState({
    cnh: null,
    residencia: null,
    antecedentes: null,
    app_cadastro: null
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ title: "Faça login para continuar", description: "Você precisa estar logado para solicitar análise." });
      navigate('/login');
      return;
    }
    const fetchCar = async () => {
      const { data } = await supabase.from('cars').select('*').eq('id', carId).single();
      setCar(data);
      setFetchingCar(false);
    };
    fetchCar();
  }, [carId, isAuthenticated, navigate, toast]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "Máximo 5MB", variant: "destructive" });
        return;
      }
      setDocuments(prev => ({ ...prev, [type]: file }));
    }
  };

  const uploadFile = async (file, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('solicitacoes-documentos')
      .upload(filePath, file);
      
    if (error) throw error;
    
    // Get public URL
    const { data } = supabase.storage.from('solicitacoes-documentos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documents.cnh || !documents.residencia || !documents.antecedentes) {
      toast({ title: "Documentos faltando", description: "Envie todos os documentos obrigatórios.", variant: "destructive" });
      return;
    }
    if (tipoLocacao === 'aplicativo' && !documents.app_cadastro) {
      toast({ title: "Comprovante de App faltando", description: "Para locação de app, o comprovante é obrigatório.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const protocol = `JL-${Date.now().toString().slice(-6)}`;
      const uploadedDocs = {};

      console.log("[PAGE] Using usuario.id:", usuario.id);

      // Upload files sequentially
      // [REPLACE] usuario.id
      uploadedDocs.cnh = await uploadFile(documents.cnh, `solicitacoes/${usuario.id}/cnh`);
      uploadedDocs.residencia = await uploadFile(documents.residencia, `solicitacoes/${usuario.id}/residencia`);
      uploadedDocs.antecedentes = await uploadFile(documents.antecedentes, `solicitacoes/${usuario.id}/antecedentes`);
      
      if (tipoLocacao === 'aplicativo' && documents.app_cadastro) {
        uploadedDocs.app_cadastro = await uploadFile(documents.app_cadastro, `solicitacoes/${usuario.id}/app`);
      }

      // Insert record
      const { data, error } = await supabase.from('solicitacoes_analise').insert([{
        usuario_id: usuario.id, // Keeping user_id for this table as schema was not explicitly migrated to usuario_id for solicitacoes_analise
        car_id: carId,
        tipo_locacao: tipoLocacao,
        status: 'Pendente',
        numero_protocolo: protocol,
        documentos_enviados: uploadedDocs
      }]).select().single();

      if (error) throw error;

      // TODO: Call Edge Function for email (simulated here)
      // await supabase.functions.invoke('send-analysis-request-email', { body: { ... } })

      toast({ title: "Solicitação Enviada!", description: `Protocolo: ${protocol}` });
      navigate(`/minha-solicitacao/${data.id}`);

    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao enviar", description: "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCar) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <>
      <Helmet><title>Solicitar Análise - JL RENT A CAR</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Car Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex items-center gap-6">
          <img src={car.imagem_url} alt={car.nome} className="w-24 h-24 object-cover rounded-lg" />
          <div>
             <h2 className="text-xl font-bold text-[#0E3A2F]">{car.nome}</h2>
             <p className="text-gray-500">{car.categoria}</p>
             <p className="font-bold text-[#00D166]">R$ {car.preco_diaria}/dia</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selector */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CarIcon size={20} /> Finalidade da Locação</h3>
             <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTipoLocacao('aplicativo')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${tipoLocacao === 'aplicativo' ? 'border-[#00D166] bg-[#00D166]/10 font-bold text-[#0E3A2F]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  Motorista de Aplicativo
                </button>
                <button
                  type="button"
                  onClick={() => setTipoLocacao('particular')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${tipoLocacao === 'particular' ? 'border-[#00D166] bg-[#00D166]/10 font-bold text-[#0E3A2F]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  Uso Particular
                </button>
             </div>
          </div>

          {/* Docs Upload */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Upload size={20} /> Envio de Documentos</h3>
             <p className="text-sm text-gray-500 mb-6">Aceitamos arquivos PDF, JPG ou PNG (Max 5MB).</p>
             
             <div className="space-y-4">
                <FileUpload label="CNH Digital (com EAR)" onChange={(e) => handleFileChange(e, 'cnh')} file={documents.cnh} />
                <FileUpload label="Comprovante de Residência" onChange={(e) => handleFileChange(e, 'residencia')} file={documents.residencia} />
                <FileUpload label="Atestado de Antecedentes Criminais" onChange={(e) => handleFileChange(e, 'antecedentes')} file={documents.antecedentes} />
                
                {tipoLocacao === 'aplicativo' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <FileUpload label="Print do Cadastro no App (Uber/99)" onChange={(e) => handleFileChange(e, 'app_cadastro')} file={documents.app_cadastro} />
                  </motion.div>
                )}
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0E3A2F] text-white font-bold rounded-xl hover:bg-[#165945] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
             {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
             {loading ? 'Enviando Solicitação...' : 'Finalizar Solicitação'}
          </button>
        </form>
      </div>
    </>
  );
};

const FileUpload = ({ label, onChange, file }) => (
  <div className="border border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
     <label className="flex items-center justify-between cursor-pointer w-full">
        <div className="flex items-center gap-3">
           <FileText className={file ? "text-[#00D166]" : "text-gray-400"} />
           <div>
              <span className="font-medium text-gray-700 block">{label}</span>
              {file && <span className="text-xs text-[#00D166]">{file.name}</span>}
           </div>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-600">Selecionar</div>
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={onChange} />
     </label>
  </div>
);

export default RequestAnalysis;