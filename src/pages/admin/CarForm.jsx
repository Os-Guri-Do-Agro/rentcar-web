import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, ArrowLeft, Image as ImageIcon, CheckSquare, User, Briefcase, Building2, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BrandSelector from '@/components/BrandSelector';
import carService from '@/services/cars/carService';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
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
          const data = await carService.getCarById(id);
          reset(data.data);
          setPreviewImage(data.data.imagem_url || data.data.foto_principal);
          
          // Parse rental types
          setRentalTypes({
            particular: data.data.disponivel_particular || false,
            motorista: data.data.disponivel_motorista || false,
            corporativo: data.data.disponivel_corporativo || false
          });

          if (data.data.planos_km && Array.isArray(data.data.planos_km)) {
              setKmPlans(data.data.planos_km);
          }

          if (data.data.especificacoes && Array.isArray(data.data.especificacoes)) {
              setSpecs(data.data.especificacoes);
          }

        } catch (error) {
          toast({ title: "Erro ao carregar dados", variant: "destructive" });
        }
      };
      loadCar();
    }
  }, [id, isEditMode, reset, toast]);

  useEffect(() => {
    const hasSelection = Object.values(rentalTypes).some(Boolean);
    if (hasSelection) setRentalTypeError(false);
  }, [rentalTypes]);

  const toggleRentalType = (type) => {
    setRentalTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };
  
  const toggleSpec = (spec) => {
    setSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };

  const handleBrandChange = (value) => {
    setValue('marca', value, { shouldValidate: true, shouldDirty: true });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await carService.postCarPhoto(formData);
      const url = res.data.url;
      setPreviewImage(url);
      setValue('imagem_url', url);

      if (isEditMode) {
        await carService.patchCarById(id, { imagem_url: url, foto_principal: url });
        toast({ title: 'Foto atualizada com sucesso!' });
      }
    } catch {
      toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
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
      nome: data.nome,
      categoria: data.categoria,
      marca: data.marca,
      placa: data.placa,
      descricao: data.descricao,
      disponivel: true,
      imagem_url: data.imagem_url || previewImage || data.foto_principal,
      foto_principal: data.imagem_url || previewImage || data.foto_principal || null,
      tipos_aluguel: tiposAluguelStr,
      para_particular: rentalTypes.particular,
      tipo_locacao: tiposAluguelStr,
      disponivel_particular: rentalTypes.particular,
      disponivel_motorista: rentalTypes.motorista,
      disponivel_corporativo: rentalTypes.corporativo,
      especificacoes: specs,
      ano: data.ano ? parseInt(data.ano) : null,
      combustivel: data.combustivel,
      cambio: data.cambio,
      passageiros: data.passageiros ? parseInt(data.passageiros) : null,
      malas: data.malas ? parseInt(data.malas) : null,
      cor: data.cor,
    };

    console.log('payload enviado:', JSON.stringify(payload, null, 2));
    try {
      if (isEditMode) {
        await carService.patchCarById(id, payload);
        toast({ title: "Veículo atualizado com sucesso!" });
      } else {
        await carService.postCars(payload);
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
          
          {/* Image Section */}
          <div className="space-y-4 border-b pb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="text-[#00D166]" size={20} /> Imagem do Carro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">URL da Imagem</label>
                  <input {...register('imagem_url')} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="https://..." onChange={e => setPreviewImage(e.target.value)} />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center relative cursor-pointer min-h-[120px] flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <div className="text-gray-400 flex flex-col items-center">
                    {uploadingImage ? <Loader2 size={28} className="animate-spin" /> : <Upload size={28} />}
                    <span className="text-xs mt-2 font-medium">{uploadingImage ? 'Enviando...' : 'Ou envie um arquivo'}</span>
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploadingImage} />
                </div>
              </div>
              <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-gray-200 shadow-inner">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
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
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cor</label>
                <input {...register('cor')} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="Ex: Prata"/>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Combustível</label>
                <select {...register('combustivel')} className="w-full p-3 border rounded-lg bg-white">
                    <option value="">Selecione</option>
                    <option value="Flex">Flex</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Híbrido">Híbrido</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Câmbio</label>
                <select {...register('cambio')} className="w-full p-3 border rounded-lg bg-white">
                    <option value="">Selecione</option>
                    <option value="Manual">Manual</option>
                    <option value="Automático">Automático</option>
                    <option value="CVT">CVT</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Passageiros</label>
                <input type="number" {...register('passageiros')} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="5"/>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Malas</label>
                <input type="number" {...register('malas')} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="2"/>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                <textarea {...register('descricao')} rows={3} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none resize-none"/>
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