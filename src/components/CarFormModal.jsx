import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import carService from '@/services/cars/carService';

const CarFormModal = ({ car, isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    placa: '',
    ano: new Date().getFullYear(),
    cor: '',
    imagem_url: '',
    categoria: 'Hatch',
    descricao: '',
    tipo_locacao: 'ambos', // particular, motorista, ambos
    disponivel: true,
    
    // Particular fields
    disponivel_particular: true,
    preco_diaria_particular: 100,
    km_inclusos_particular: 200,
    preco_km_extra_particular: 0.50,
    
    // Motorista fields
    disponivel_motorista: false,
    preco_diaria_motorista: 90,
    km_inclusos_motorista: 300,
    preco_km_extra_motorista: 0.40
  });

  useEffect(() => {
    if (car) {
      setFormData({
        ...formData,
        ...car,
        // Ensure defaults if null
        disponivel_particular: car.disponivel_particular ?? true,
        disponivel_motorista: car.disponivel_motorista ?? false,
      });
    } else {
      // Reset for new car
      setFormData({
        nome: '',
        placa: '',
        ano: new Date().getFullYear(),
        cor: '',
        imagem_url: '',
        categoria: 'Hatch',
        descricao: '',
        tipo_locacao: 'ambos',
        disponivel: true,
        disponivel_particular: true,
        preco_diaria_particular: 100,
        km_inclusos_particular: 200,
        preco_km_extra_particular: 0.50,
        disponivel_motorista: false,
        preco_diaria_motorista: 90,
        km_inclusos_motorista: 300,
        preco_km_extra_motorista: 0.40
      });
    }
  }, [car, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Required fields validation
      if (!formData.nome || !formData.placa || !formData.ano) {
        throw new Error("Campos Modelo, Placa e Ano são obrigatórios.");
      }

      // Sync the legacy price field with one of the new ones for backward compatibility
      const payload = {
        ...formData,
        preco_diaria: formData.disponivel_particular ? formData.preco_diaria_particular : formData.preco_diaria_motorista
      };

      if (car) {
        await carService.patchCarById(car.id, payload);
        toast({ title: "Carro atualizado com sucesso!", className: "bg-green-600 text-white" });
      } else {
        await carService.postCars(payload);
        toast({ title: "Carro criado com sucesso!", className: "bg-green-600 text-white" });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0E3A2F]">{car ? 'Editar Veículo' : 'Novo Veículo'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Dados Básicos */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Dados Básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                <input required type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full border rounded-lg p-2.5" placeholder="Ex: Fiat Argo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                <input required type="text" name="placa" value={formData.placa} onChange={handleChange} className="w-full border rounded-lg p-2.5 uppercase" placeholder="ABC-1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano *</label>
                <input required type="number" name="ano" value={formData.ano} onChange={handleChange} className="w-full border rounded-lg p-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <input type="text" name="cor" value={formData.cor} onChange={handleChange} className="w-full border rounded-lg p-2.5" placeholder="Ex: Prata" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-white">
                  <option value="Hatch">Hatch</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Premium">Premium</option>
                  <option value="Econômico">Econômico</option>
                </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Locação Principal</label>
                 <select name="tipo_locacao" value={formData.tipo_locacao} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-white">
                   <option value="ambos">Ambos</option>
                   <option value="particular">Somente Particular</option>
                   <option value="motorista">Somente Motorista App</option>
                 </select>
              </div>
            </div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                <div className="flex gap-2">
                    <input type="url" name="imagem_url" value={formData.imagem_url} onChange={handleChange} className="w-full border rounded-lg p-2.5" placeholder="https://..." />
                </div>
            </div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleChange} className="w-full border rounded-lg p-2.5 h-20" placeholder="Detalhes do veículo..." />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plano Particular */}
            <section className={`bg-blue-50 p-5 rounded-xl border border-blue-100 ${formData.tipo_locacao === 'motorista' ? 'opacity-50 pointer-events-none' : ''}`}>
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-blue-900">Plano Particular</h3>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="disponivel_particular" checked={formData.disponivel_particular} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                   </label>
               </div>
               <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600">Preço Diária (R$)</label>
                    <input type="number" step="0.01" name="preco_diaria_particular" value={formData.preco_diaria_particular} onChange={handleChange} className="w-full border border-blue-200 rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600">KM Inclusos</label>
                    <input type="number" name="km_inclusos_particular" value={formData.km_inclusos_particular} onChange={handleChange} className="w-full border border-blue-200 rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600">Preço KM Extra (R$)</label>
                    <input type="number" step="0.01" name="preco_km_extra_particular" value={formData.preco_km_extra_particular} onChange={handleChange} className="w-full border border-blue-200 rounded p-2" />
                  </div>
               </div>
            </section>

            {/* Plano Motorista */}
            <section className={`bg-green-50 p-5 rounded-xl border border-green-100 ${formData.tipo_locacao === 'particular' ? 'opacity-50 pointer-events-none' : ''}`}>
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-green-900">Plano Motorista App</h3>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="disponivel_motorista" checked={formData.disponivel_motorista} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                   </label>
               </div>
               <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600">Preço Diária (R$)</label>
                    <input type="number" step="0.01" name="preco_diaria_motorista" value={formData.preco_diaria_motorista} onChange={handleChange} className="w-full border border-green-200 rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600">KM Inclusos</label>
                    <input type="number" name="km_inclusos_motorista" value={formData.km_inclusos_motorista} onChange={handleChange} className="w-full border border-green-200 rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600">Preço KM Extra (R$)</label>
                    <input type="number" step="0.01" name="preco_km_extra_motorista" value={formData.preco_km_extra_motorista} onChange={handleChange} className="w-full border border-green-200 rounded p-2" />
                  </div>
               </div>
            </section>
          </div>

          <div className="flex justify-end pt-4 border-t gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg hover:bg-[#00F178] flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Salvar Veículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarFormModal;