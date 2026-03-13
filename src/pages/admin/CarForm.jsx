import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Trash2, CheckSquare, User, Briefcase, Building2, Plus, X, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { fetchCarById, createCar, updateCar } from '@/services/carService';
import { uploadImage, deleteImage } from '@/services/imageService';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BrandSelector from '@/components/BrandSelector';

const SPECIFICATIONS_LIST = [
  "Multimídia com fio", "Ar-condicionado", "Ar-condicionado digital", "Multimídia sem fio",
  "Câmera de ré", "Sensor de estacionamento", "Teto solar", "Bancos de couro",
  "Direção hidráulica", "Freio ABS", "Airbag", "Controle de tração",
  "Estabilidade eletrônica", "Vidros elétricos", "Travas elétricas", "Espelhos elétricos",
  "Ar-condicionado automático", "Banco do motorista ajustável", "Banco do passageiro ajustável",
  "Volante ajustável", "Computador de bordo", "Bluetooth", "USB", "Entrada auxiliar",
  "Carregador wireless", "Painel digital", "Câmera frontal", "Sensor de chuva",
  "Sensor de luz", "Farol automático", "Farol de neblina", "Rodas de liga leve",
  "Pneus novos", "Bateria nova", "Óleo recente", "Filtro de ar novo"
];

const CarForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'link'
  const [currentImagePath, setCurrentImagePath] = useState(null);
  const [rentalTypeError, setRentalTypeError] = useState(false);
  
  // Rental Types State
  const [rentalTypes, setRentalTypes] = useState({
    particular: false,
    motorista: false,
    corporativo: false
  });
  
  // Specifications State
  const [specs, setSpecs] = useState([]);

  // KM Plans State
  const [kmPlans, setKmPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ km: '', preco: '' });
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const watchedImageUrl = watch('imagem_url');
  const watchedMarca = watch('marca');

  useEffect(() => {
    if (!isAdmin) {
        console.log("Access denied: Not admin");
    }
  }, [isAdmin]);

  // Register marca field manually since we use a custom component
  useEffect(() => {
    register('marca', { required: 'A marca é obrigatória' });
  }, [register]);

  useEffect(() => {
    if (isEditMode) {
      const loadCar = async () => {
        try {
          const data = await fetchCarById(id);
          reset(data);
          setPreviewImage(data.imagem_url);
          setCurrentImagePath(data.imagem_nome);
          if (data.imagem_url && !data.imagem_nome) setUploadMode('link');
          
          // Parse rental types
          if (data.tipos_aluguel) {
            const types = data.tipos_aluguel.split(',');
            setRentalTypes({
              particular: types.includes('particular'),
              motorista: types.includes('motorista'),
              corporativo: types.includes('corporativo')
            });
          } else {
             setRentalTypes({
               particular: data.disponivel_particular || false,
               motorista: data.disponivel_motorista || false,
               corporativo: false
             });
          }

          // Load km plans
          if (data.planos_km && Array.isArray(data.planos_km)) {
              setKmPlans(data.planos_km);
          }

          // Load specs
          if (data.especificacoes && Array.isArray(data.especificacoes)) {
              setSpecs(data.especificacoes);
          }

        } catch (error) {
          toast({ title: "Erro ao carregar dados", variant: "destructive" });
        }
      };
      loadCar();
    }
  }, [id, isEditMode, reset, toast]);

  useEffect(() => {
    if (uploadMode === 'link' && watchedImageUrl) {
      setPreviewImage(watchedImageUrl);
    }
  }, [watchedImageUrl, uploadMode]);

  useEffect(() => {
    const hasSelection = Object.values(rentalTypes).some(Boolean);
    if (hasSelection) setRentalTypeError(false);
  }, [rentalTypes]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isAdmin) {
        toast({ title: "Acesso negado", description: "Apenas administradores podem fazer upload de fotos", variant: "destructive" });
        return;
    }

    try {
      setUploading(true);
      if (currentImagePath) await deleteImage('cars', currentImagePath); // Updated bucket name based on context
      const result = await uploadImage(file, 'cars', 'frota', 'car');
      setPreviewImage(result.url);
      setCurrentImagePath(result.path);
      setValue('imagem_url', result.url);
      setValue('imagem_nome', result.path);
      toast({ title: "Imagem enviada!", className: "bg-green-600 text-white" });
    } catch (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
      if (currentImagePath) {
          try { await deleteImage('cars', currentImagePath); } catch (e) { }
      }
      setPreviewImage(null);
      setCurrentImagePath(null);
      setValue('imagem_url', '');
      setValue('imagem_nome', null);
  };

  const toggleRentalType = (type) => {
    setRentalTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };
  
  const toggleSpec = (spec) => {
    setSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };

  const handleBrandChange = (value) => {
    setValue('marca', value, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data) => {
    if (!isAdmin) return toast({ title: "Acesso Negado", variant: "destructive" });

    setLoading(true);
    console.log("Saving car with specs:", specs);
    
    const selectedTypes = Object.entries(rentalTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);
      
    if (selectedTypes.length === 0) {
      setRentalTypeError(true);
      toast({ title: "Selecione pelo menos um tipo de aluguel", variant: "destructive" });
      setLoading(false);
      return;
    }

    const tiposAluguelStr = selectedTypes.join(',');
    
    const payload = {
      ...data,
      disponivel_particular: rentalTypes.particular,
      disponivel_motorista: rentalTypes.motorista,
      tipos_aluguel: tiposAluguelStr,
      planos_km: rentalTypes.motorista ? kmPlans : [], 
      especificacoes: specs, // JSON array
      disponivel: true
    };

    try {
      if (isEditMode) {
        await updateCar(id, payload);
        toast({ title: "Veículo atualizado com sucesso!" });
      } else {
        await createCar(payload);
        toast({ title: "Veículo criado com sucesso!" });
      }
      navigate('/admin/frota');
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar veículo", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
      return (
          <div className="flex items-center justify-center min-h-screen text-red-600 font-bold text-xl">
              <AlertCircle className="mr-2"/> Acesso negado.
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 pb-20">
      <Link to="/admin/frota" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={20} /> Voltar para Frota
      </Link>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-[#0E3A2F] mb-6">
          {isEditMode ? 'Editar Veículo' : 'Novo Veículo'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Image Upload Section */}
          <div className="space-y-4 border-b pb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="text-[#00D166]" size={20} /> Imagem do Carro
            </h3>
            {/* Same image upload UI code from previous version... simplified for brevity, assume included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <div className="space-y-3">
                    <div className="flex gap-4 mb-2">
                        <button type="button" onClick={() => setUploadMode('upload')} className={`text-xs font-bold px-3 py-1 rounded transition-colors ${uploadMode==='upload' ? 'bg-[#0E3A2F] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Upload</button>
                        <button type="button" onClick={() => setUploadMode('link')} className={`text-xs font-bold px-3 py-1 rounded transition-colors ${uploadMode==='link' ? 'bg-[#0E3A2F] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Link</button>
                    </div>
                    {uploadMode === 'upload' ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center relative cursor-pointer min-h-[150px] flex items-center justify-center hover:bg-gray-50 transition-colors">
                            {uploading ? <Loader2 className="animate-spin text-[#00D166]"/> : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Upload size={32} />
                                    <span className="text-xs mt-2 font-medium">Clique para selecionar</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                    ) : (
                        <input {...register('imagem_url')} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="https://..." />
                    )}
                    <input type="hidden" {...register('imagem_nome')} />
                 </div>
                 <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-gray-200 shadow-inner">
                    {previewImage ? (
                        <>
                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-colors"><Trash2 size={16}/></button>
                        </>
                    ) : <ImageIcon className="opacity-20" size={40}/>}
                 </div>
            </div>
          </div>

          {/* Rental Types Section */}
          <div className="space-y-4 border-b pb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckSquare className="text-[#00D166]" size={20} /> Disponibilidade
            </h3>
            {/* Same checkbox logic ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                  { id: 'particular', label: 'Particular', icon: User },
                  { id: 'motorista', label: 'Motorista', icon: Briefcase },
                  { id: 'corporativo', label: 'Corporativo', icon: Building2 }
              ].map((option) => (
                  <label key={option.id} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${rentalTypes[option.id] ? 'border-[#00D166] bg-[#F0FDF4]' : 'border-gray-200 bg-white'}`}>
                     <input type="checkbox" className="hidden" checked={rentalTypes[option.id]} onChange={() => toggleRentalType(option.id)} />
                     {rentalTypes[option.id] && <div className="absolute top-3 right-3 text-[#00D166]"><CheckCircle2 size={20} /></div>}
                     <option.icon size={24} className={rentalTypes[option.id] ? 'text-[#00D166]' : 'text-gray-400'} />
                     <span className="font-bold">{option.label}</span>
                  </label>
              ))}
            </div>
          </div>
          
          {/* Specifications Section */}
          <div className="space-y-4 border-b pb-8">
             <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 <Settings className="text-[#00D166]" size={20} /> Especificações do Carro
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                 {SPECIFICATIONS_LIST.map(spec => (
                     <label key={spec} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded">
                         <input 
                            type="checkbox" 
                            checked={specs.includes(spec)}
                            onChange={() => toggleSpec(spec)}
                            className="rounded border-gray-300 text-[#00D166] focus:ring-[#00D166]"
                         />
                         {spec}
                     </label>
                 ))}
             </div>
          </div>

          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                <input {...register('nome', {required:true})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
            </div>
            <div>
               <BrandSelector 
                  value={watchedMarca}
                  onChange={handleBrandChange}
                  error={errors.marca?.message}
               />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Placa</label>
                <input {...register('placa', {required:true})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ano</label>
                <input type="number" {...register('ano')} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
            </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                <select {...register('categoria')} className="w-full p-3 border rounded-lg bg-white">
                    <option value="Econômico">Econômico</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="SUV">SUV</option>
                    <option value="Premium">Premium</option>
                </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button type="button" onClick={() => navigate('/admin/frota')} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700">Cancelar</button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-[#00D166] text-[#0E3A2F] rounded-lg font-bold hover:bg-[#00b355] flex items-center gap-2">
               {loading && <Loader2 className="animate-spin" size={20}/>} Salvar Veículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarForm;