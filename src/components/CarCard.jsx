import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Fuel, Settings, Calendar, ArrowRight, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300 group flex flex-col h-full"
    >
      {/* Image Container - 16:9 Aspect Ratio */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        <img
          src={car.imagem_url}
          alt={car.nome}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {car.destaque && (
          <div className="absolute top-3 right-3 bg-[#00D166] text-[#0E3A2F] px-3 py-1 rounded-full text-xs font-bold shadow-md z-10">
            DESTAQUE
          </div>
        )}
        
        {/* Overlay gradient on bottom for text readability if needed */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        <div className="absolute bottom-3 left-4 text-white">
           <span className="text-xs font-bold bg-[#0E3A2F]/90 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
             {car.categoria}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00D166] transition-colors">
              {car.nome}
            </h3>
        </div>
        
        <div className="flex items-end gap-1 mb-6">
            <span className="text-sm text-gray-500 mb-1">A partir de</span>
            <span className="text-2xl font-bold text-[#0E3A2F]">R$ {car.preco_diaria_particular || car.preco_diaria || 99}</span>
            <span className="text-sm text-gray-500 mb-1">/dia</span>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} className="text-[#00D166] shrink-0" />
            <span className="truncate">{car.passageiros || 5} lugares</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Fuel size={16} className="text-[#00D166] shrink-0" />
            <span className="truncate">{car.combustivel || "Flex"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Settings size={16} className="text-[#00D166] shrink-0" />
            <span className="truncate">{car.cambio || "Manual"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Gauge size={16} className="text-[#00D166] shrink-0" />
            <span className="truncate">Livre KM</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Link
            to={`/carro/${car.id}`}
            className="w-full block text-center py-3 bg-gradient-to-r from-[#0E3A2F] to-[#0E3A2F] hover:from-[#00D166] hover:to-[#00F178] text-white hover:text-[#0E3A2F] rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CarCard;