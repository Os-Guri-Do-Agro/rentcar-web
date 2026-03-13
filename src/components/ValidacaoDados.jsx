import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ValidacaoDados = ({ erros }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dados Incompletos</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Para prosseguir com sua reserva, precisamos que todas as informações estejam preenchidas corretamente.
      </p>
      
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 text-left w-full max-w-md">
        <h3 className="font-bold text-red-800 mb-2">Campos faltando:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
          {erros.map((erro, index) => (
            <li key={index}>{erro}</li>
          ))}
        </ul>
        {console.log("Dados incompletos", erros)}
      </div>

      <button 
        onClick={() => navigate('/frota')}
        className="px-6 py-3 bg-[#0E3A2F] text-white font-bold rounded-lg hover:bg-[#165945] flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar e Preencher
      </button>
    </div>
  );
};

export default ValidacaoDados;