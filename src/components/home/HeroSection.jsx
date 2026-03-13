import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1627404760301-8efc143749c8?q=80&w=2574&auto=format&fit=crop')",
        }}
      >
         {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[#0E3A2F]/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E3A2F] via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D166]/20 border border-[#00D166]/30 text-[#00D166] font-bold text-sm mb-6 backdrop-blur-sm">
            🚀 A melhor opção para sua mobilidade
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Alugue o Carro Perfeito <br />
            para Sua <span className="text-[#00D166]">Jornada</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed font-light">
            Frota moderna, preços competitivos e atendimento de qualidade. Seja para trabalho ou lazer, temos o veículo ideal esperando por você.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/frota')}
              className="px-8 py-4 bg-[#00D166] text-[#0E3A2F] rounded-full font-bold text-lg hover:bg-[#00F178] transition-all shadow-xl hover:shadow-[#00D166]/30 hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              Explorar Frota 
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            
            <button 
              onClick={() => navigate('/sobre')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#0E3A2F] transition-all flex items-center justify-center gap-2"
            >
              Saiba Mais
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest opacity-70">Role para ver mais</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-[#00D166] rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;