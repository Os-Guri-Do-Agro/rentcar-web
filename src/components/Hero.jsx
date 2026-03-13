import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative bg-[#0E3A2F] text-white pt-24 pb-32 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#165945] to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D166] rounded-full blur-[120px] opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[#00D166] font-bold text-xl md:text-2xl mb-4 tracking-wider uppercase">
              Comprar ou Assinar?
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              A liberdade de ter um carro,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                sem as dores de cabeça de ser dono.
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Descubra a assinatura de carros JL Rent a Car. Tudo incluso: documentação, seguro, IPVA e manutenção. Você só abastece e dirige.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#personalize"
                className="bg-[#00D166] text-[#0E3A2F] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#00F178] active:bg-[#05b05a] active:scale-95 transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,209,102,0.4)]"
              >
                Simular Assinatura
              </a>
              <a 
                href="#frota"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                Ver Frota
              </a>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Curve Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        
      </div>
    </section>
  );
};

export default Hero;