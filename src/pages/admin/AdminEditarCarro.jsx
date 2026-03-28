import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import carService from '@/services/cars/carService';
import { Loader2, Save, ArrowLeft, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import BrandSelector from '@/components/BrandSelector';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
   const [confirmRemoveIdx, setConfirmRemoveIdx] = useState(null);

   // Form States
   const [formData, setFormData] = useState({});
   const [specs, setSpecs] = useState([]);
   const [gallery, setGallery] = useState([]);
   const [brandError, setBrandError] = useState("");

   useEffect(() => {
      fetchCar();
   }, [carroId]);

   const fetchCar = async () => {
      try {
         const res = await carService.getCarById(carroId);
         const data = res?.data ?? res;
         setCar(data);
         setFormData(data);
         setSpecs(data.especificacoes || []);
         setGallery(data.fotos_galeria || []);
      } catch {
         toast({ title: "Erro", description: "Carro não encontrado", variant: "destructive" });
         navigate('/admin/carros');
      } finally {
         setLoading(false);
      }
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
         const formData = new FormData();
         formData.append('foto_principal', file);
         const res = await carService.patchCarPhoto(carroId, formData);
         const url = res?.data?.foto_principal ?? res?.foto_principal;
         if (url) setFormData(prev => ({ ...prev, foto_principal: url, imagem_url: url }));
         toast({ title: "Foto principal atualizada", className: "bg-green-600 text-white border-none" });
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
         const formData = new FormData();
         files.forEach(file => formData.append('fotos_galeria', file));
         const res = await carService.patchCarPhoto(carroId, formData);
         const updatedGallery = res?.data?.fotos_galeria ?? res?.fotos_galeria ?? gallery;
         setGallery(updatedGallery);
         toast({ title: "Galeria atualizada", className: "bg-green-600 text-white border-none" });
      } catch (error) {
         toast({ title: "Erro no upload", variant: "destructive" });
      } finally {
         setUploading(false);
      }
   };

   const removeGalleryPhoto = (index) => {
      setConfirmRemoveIdx(index);
   };

   const confirmRemovePhoto = async () => {
      const newGallery = gallery.filter((_, i) => i !== confirmRemoveIdx);
      setGallery(newGallery);
      setConfirmRemoveIdx(null);
      await carService.patchCarById(carroId, { fotos_galeria: newGallery });
   };

   const handleSave = async () => {
      if (!formData.marca) {
         setBrandError("A marca é obrigatória");
         toast({ title: "Erro de validação", description: "Verifique o campo Marca", variant: "destructive" });
         return;
      }

      setSaving(true);
      try {
         await carService.patchCarById(carroId, { ...formData, especificacoes: specs });
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
         <AlertDialog open={confirmRemoveIdx !== null} onOpenChange={(o) => !o && setConfirmRemoveIdx(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Remover foto?</AlertDialogTitle>
                  <AlertDialogDescription>A foto será removida da galeria permanentemente.</AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmRemovePhoto} className="bg-red-600 hover:bg-red-700 text-white">Remover</AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
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