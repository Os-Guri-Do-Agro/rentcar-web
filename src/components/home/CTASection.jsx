import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionContainer from '../SectionContainer';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <SectionContainer className="py-0 px-0 md:py-0">
      <div className="relative bg-[#0E3A2F] overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#00D166]/10 -skew-x-12 transform origin-top-right"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D166]/5 rounded-full filter blur-3xl"></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Pronto para Alugar?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              Escolha seu carro ideal hoje mesmo e comece sua jornada com segurança, economia e a qualidade que só a JL Rent a Car oferece.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <button 
                onClick={() => navigate('/frota')}
                className="px-10 py-5 bg-[#00D166] text-[#0E3A2F] rounded-full font-bold text-xl hover:bg-[#00F178] transition-all shadow-xl hover:shadow-[#00D166]/40 hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
              >
                Explorar Frota <ArrowRight size={24} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default CTASection;