import React from 'react';
import { motion } from 'framer-motion';
import { Users, Car } from 'lucide-react';

const ProfileSelector = ({ selectedProfile, onProfileChange }) => {
  return (
    <section className="py-12 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Escolha seu Perfil
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onProfileChange('motorista')}
            className={`flex-1 p-8 rounded-xl border-2 transition-all ${
              selectedProfile === 'motorista'
                ? 'border-[#0E3A2F] bg-[#0E3A2F] text-white shadow-xl'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[#0E3A2F]'
            }`}
          >
            <Car size={48} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Sou Motorista de App</h3>
            <p className={`text-sm ${selectedProfile === 'motorista' ? 'text-gray-200' : 'text-gray-600'}`}>
              Planos especiais para Uber, 99 e outros apps com diferentes categorias
            </p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onProfileChange('particular')}
            className={`flex-1 p-8 rounded-xl border-2 transition-all ${
              selectedProfile === 'particular'
                ? 'border-[#0E3A2F] bg-[#0E3A2F] text-white shadow-xl'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[#0E3A2F]'
            }`}
          >
            <Users size={48} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Cliente Particular</h3>
            <p className={`text-sm ${selectedProfile === 'particular' ? 'text-gray-200' : 'text-gray-600'}`}>
              Aluguel flexível para uso pessoal com opções diárias, mensais e anuais
            </p>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default ProfileSelector;