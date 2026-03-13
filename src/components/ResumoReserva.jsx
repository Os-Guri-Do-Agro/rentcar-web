import React from 'react';
import { User, Car, Calendar, Edit2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumoReserva = ({ dados }) => {
  const navigate = useNavigate();
  const { usuario, carro, reserva, tipoReserva } = dados;

  console.log("Resumo carregado com sucesso", dados);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gray-50 p-4 border-b border-gray-100">
        <h3 className="font-bold text-[#0E3A2F] text-lg">Resumo da Reserva</h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Carro */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Car size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Veículo</h4>
              <p className="text-sm text-gray-600">{carro.marca} {carro.nome}</p>
              <p className="text-xs text-gray-500">{carro.categoria} • {tipoReserva === 'motorista' ? 'App' : 'Particular'}</p>
            </div>
          </div>
          <button onClick={() => navigate('/frota')} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <Edit2 size={14} /> Alterar
          </button>
        </div>

        <hr className="border-gray-100" />

        {/* Datas e Plano */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Período e Plano</h4>
              <p className="text-sm text-gray-600">
                {new Date(reserva.dataInicio).toLocaleDateString()} até {new Date(reserva.dataFim).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                Plano: {reserva.plano.replace('_', ' ')} • Franquia: {reserva.franquia} km
              </p>
            </div>
          </div>
          <button onClick={() => navigate(`/carro/${carro.id}`)} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <Edit2 size={14} /> Editar
          </button>
        </div>

        <hr className="border-gray-100" />

        {/* Usuário */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <User size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Seus Dados</h4>
              <p className="text-sm text-gray-600">{usuario.nome}</p>
              <p className="text-xs text-gray-500">{usuario.email} • {usuario.telefone}</p>
              <p className="text-xs text-gray-500">CPF: {usuario.cpf}</p>
            </div>
          </div>
          <button onClick={() => navigate('/dados-usuario')} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <Edit2 size={14} /> Editar
          </button>
        </div>

        <div className="bg-[#0E3A2F] text-white p-4 rounded-xl flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
                <Wallet size={20} />
                <span className="font-medium">Valor Total</span>
            </div>
            <span className="text-xl font-bold">R$ {parseFloat(reserva.valorTotal).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
    </div>
  );
};

export default ResumoReserva;