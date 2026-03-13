import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
        <p className="text-gray-500 mb-8">
          A página que você está procurando não existe, foi movida ou o ID fornecido é inválido.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 bg-[#0E3A2F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#165945] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Home size={20} />
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;