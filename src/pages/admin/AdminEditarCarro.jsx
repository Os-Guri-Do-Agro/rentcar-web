import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, ArrowLeft, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { uploadFoto, updateFotoPrincipal, updateFotosGaleria, deleteFoto } from '@/services/fotosService';
import BrandSelector from '@/components/BrandSelector';

const SPEC_OPTIONS = [
   "Multimídia com fio", "Ar-condicionado", "Ar-condicionado digital", "Multimídia sem fio",
   "Motor 1.0", "Motor 1.6", "Motor Turbo", "Câmera de ré", "Sensor de estacionamento",
   "Teto solar", "Bancos de couro", "Direção hidráulica", "Freio ABS", "Airbag",
   "Controle de tração", "Estabilidade eletrônica", "Vidros elétricos", "Trava elétrica"
];

const AdminEditarCarro = () => {
   const { carroId } = useParams();
   const navigate = useNavigate();
   const { toast } = useToast();

   const [car, setCar] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [uploading, setUploading] = useState(false);

   // Form States
   const [formData, setFormData] = useState({});
   const [specs, setSpecs] = useState([]);
   const [gallery, setGallery] = useState([]);
   const [brandError, setBrandError] = useState("");

   useEffect(() => {
      fetchCar();
   }, [carroId]);

   const fetchCar = async () => {
      console.log("Fetching car data for editing:", carroId);
      const { data, error } = await supabase.from('cars').select('*').eq('id', carroId).single();
      if (error) {
         toast({ title: "Erro", description: "Carro não encontrado", variant: "destructive" });
         navigate('/admin/carros');
         return;
      }
      setCar(data);
      setFormData(data);
      setSpecs(data.especificacoes || []);
      setGallery(data.fotos_galeria || []);
      setLoading(false);
   };

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: type === 'checkbox' ? checked : value
      }));
   };

   const handleBrandChange = (value) => {
      setFormData(prev => ({ ...prev, marca: value }));
      if (value) setBrandError("");
   };

   const handleSpecToggle = (spec) => {
      setSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
   };

   const handleMainPhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
         const url = await uploadFoto(file, carroId, 'main');
         await updateFotoPrincipal(carroId, url);
         setFormData(prev => ({ ...prev, foto_principal: url, imagem_url: url }));
         toast({ title: "Foto principal atualizada" });
      } catch (error) {
         toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      } finally {
         setUploading(false);
      }
   };

   const handleGalleryUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      setUploading(true);
      try {
         const newUrls = [];
         for (const file of files) {
            const url = await uploadFoto(file, carroId, 'gallery');
            newUrls.push(url);
         }
         const updatedGallery = [...gallery, ...newUrls];
         setGallery(updatedGallery);
         await updateFotosGaleria(carroId, updatedGallery);
         toast({ title: "Galeria atualizada" });
      } catch (error) {
         toast({ title: "Erro no upload", variant: "destructive" });
      } finally {
         setUploading(false);
      }
   };

   const removeGalleryPhoto = async (index) => {
      if (!window.confirm("Remover foto?")) return;
      const photoUrl = gallery[index];
      const newGallery = gallery.filter((_, i) => i !== index);
      setGallery(newGallery);
      await updateFotosGaleria(carroId, newGallery);
      await deleteFoto(photoUrl); // Optional cleanup
   };

   const handleSave = async () => {
      if (!formData.marca) {
         setBrandError("A marca é obrigatória");
         toast({ title: "Erro de validação", description: "Verifique o campo Marca", variant: "destructive" });
         return;
      }

      setSaving(true);
      console.log("Saving car changes...", { ...formData, especificacoes: specs });
      try {
         const { error } = await supabase
            .from('cars')
            .update({
               ...formData,
               especificacoes: specs,
               updated_at: new Date().toISOString()
            })
            .eq('id', carroId);

         if (error) throw error;
         toast({ title: "Alterações salvas!", className: "bg-green-600 text-white" });
      } catch (error) {
         toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } finally {
         setSaving(false);
      }
   };

   if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin" /></div>;

   return (
      <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
         <Helmet title={`Editar | ${car.nome}`} />

         <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/admin/carros')} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft /></button>
                  <h1 className="text-3xl font-bold text-[#0E3A2F]">Editar Veículo</h1>
               </div>
               <button onClick={handleSave} disabled={saving} className="bg-[#0E3A2F] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                  {saving && <Loader2 className="animate-spin" size={18} />} <Save size={18} /> Salvar
               </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column: Photos */}
               <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                     <h3 className="font-bold mb-4">Foto Principal</h3>
                     <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group mb-4">
                        <img src={formData.foto_principal || formData.imagem_url} className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold gap-2">
                           <Upload size={20} /> Alterar Foto
                           <input type="file" className="hidden" accept="image/*" onChange={handleMainPhotoUpload} />
                        </label>
                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Galeria</h3>
                        <label className="cursor-pointer text-[#00D166] hover:underline text-sm font-bold">
                           + Adicionar
                           <input type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                        </label>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        {gallery.map((url, idx) => (
                           <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden relative group">
                              <img src={url} className="w-full h-full object-cover" />
                              <button onClick={() => removeGalleryPhoto(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 size={12} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Right Column: Details */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                     <h3 className="font-bold mb-6 text-lg border-b pb-2">Informações Básicas</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold mb-1">Modelo/Nome</label>
                           <input name="nome" value={formData.nome} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                           <BrandSelector 
                              value={formData.marca} 
                              onChange={handleBrandChange}
                              error={brandError}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold mb-1">Placa</label>
                           <input name="placa" value={formData.placa} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold mb-1">Ano</label>
                           <input name="ano" type="number" value={formData.ano} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold mb-1">Cor</label>
                           <input name="cor" value={formData.cor} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold mb-1">Categoria</label>
                           <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full p-2 border rounded">
                              <option value="Econômico">Econômico</option>
                              <option value="Intermediário">Intermediário</option>
                              <option value="SUV">SUV</option>
                              <option value="Luxo">Luxo</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                     <h3 className="font-bold mb-6 text-lg border-b pb-2">Especificações</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SPEC_OPTIONS.map(spec => (
                           <label key={spec} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                              <input
                                 type="checkbox"
                                 checked={specs.includes(spec)}
                                 onChange={() => handleSpecToggle(spec)}
                                 className="rounded text-[#00D166] focus:ring-[#00D166]"
                              />
                              {spec}
                           </label>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default AdminEditarCarro;