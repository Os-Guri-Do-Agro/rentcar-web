import React, { useEffect, useState } from 'react';
import { updateCarPrice, fetchPriceHistory } from '@/services/priceHistoryService';
import carService from '@/services/cars/carService';
import { Loader2, Save, TrendingDown, TrendingUp, History } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PriceControl = () => {
  const [cars, setCars] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({}); // Local state for inputs
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [carsRes, historyData] = await Promise.all([
        carService.getCars('false', ''),
        fetchPriceHistory()
      ]);
      const carsData = carsRes?.data ?? carsRes ?? [];
      setCars(carsData);
      setPriceHistory(historyData);
      
      // Initialize price inputs
      const initialPrices = {};
      carsData.forEach(c => initialPrices[c.id] = c.preco_diaria);
      setPrices(initialPrices);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (id, val) => {
    setPrices(prev => ({ ...prev, [id]: val }));
  };

  const savePrice = async (car) => {
    const newPrice = prices[car.id];
    if (newPrice == car.preco_diaria) return;

    try {
      await updateCarPrice(car.id, newPrice, car.preco_diaria);
      toast({ title: "Preço atualizado com sucesso" });
      loadData(); // Reload to refresh history and base state
    } catch (error) {
      toast({ title: "Erro ao atualizar preço", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Price List */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-[#0E3A2F] mb-6">Tabela de Preços</h2>
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Veículo</th>
                <th className="p-4 text-left">Categoria</th>
                <th className="p-4 text-left">Preço Atual</th>
                <th className="p-4 text-left">Novo Preço</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cars.map(car => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{car.nome}</td>
                  <td className="p-4 text-gray-500 text-sm">{car.categoria}</td>
                  <td className="p-4 text-gray-500">R$ {car.preco_diaria}</td>
                  <td className="p-4">
                    <div className="relative max-w-[120px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                      <input 
                        type="number" 
                        value={prices[car.id]}
                        onChange={(e) => handlePriceChange(car.id, e.target.value)}
                        className="w-full pl-8 pr-2 py-2 border rounded focus:ring-2 focus:ring-[#00D166] outline-none"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {prices[car.id] != car.preco_diaria && (
                      <button 
                        onClick={() => savePrice(car)}
                        className="p-2 bg-[#0E3A2F] text-white rounded hover:bg-[#165945]"
                        title="Salvar alteração"
                      >
                        <Save size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Side Panel */}
      <div>
        <h2 className="text-2xl font-bold text-[#0E3A2F] mb-6 flex items-center gap-2">
          <History size={24} /> Histórico
        </h2>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {priceHistory.map((item) => (
              <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className={`mt-1 p-1.5 rounded-full ${item.preco_novo > item.preco_anterior ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {item.preco_novo > item.preco_anterior ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{item.cars?.nome || 'Veículo'}</p>
                  <p className="text-sm text-gray-500">
                    De <span className="line-through">R$ {item.preco_anterior}</span> para <span className="font-bold text-[#0E3A2F]">R$ {item.preco_novo}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.data_alteracao).toLocaleDateString()} às {new Date(item.data_alteracao).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {priceHistory.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum histórico disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceControl;