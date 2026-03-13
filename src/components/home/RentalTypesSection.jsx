import React from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Car, Check, ArrowRight } from 'lucide-react';
import SectionContainer from '../SectionContainer';
import { useNavigate } from 'react-router-dom';

const types = [
  {
    icon: User,
    title: 'Aluguel Particular',
    description: 'Para viagens, lazer ou necessidades temporárias do dia a dia.',
    features: ['KM Livre', 'Seguro Incluso', 'Sem caução alta'],
    color: 'bg-blue-50 text-blue-600',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    link: '/frota' // Redirect to /frota as requested in Task 2
  },
  {
    icon: Car,
    title: 'Para Motorista de App',
    description: 'Maximize seus ganhos com carros econômicos e manutenção inclusa.',
    features: ['Planos Semanais', 'Carros Econômicos', 'Manutenção Rápida'],
    color: 'bg-green-50 text-green-600',
    btnColor: 'bg-[#00D166] hover:bg-[#00b355] text-[#0E3A2F]',
    link: '/frota' // Already redirects to /frota
  },
  {
    icon: Briefcase,
    title: 'Aluguel Corporativo',
    description: 'Soluções personalizadas para frotas de pequenas e médias empresas.',
    features: ['Gestão de Frota', 'Faturamento Mensal', 'Atendimento VIP'],
    color: 'bg-purple-50 text-purple-600',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    link: '/frota' // Fixed redirect from /fale-conosco to /frota as requested in Task 1
  }
];

const RentalTypesSection = () => {
  const navigate = useNavigate();

  const handleNavigate = (link) => {
    console.log(`Redirecionando para ${link}`);
    navigate(link);
  };

  return (
    <SectionContainer>
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0E3A2F] mb-4">Soluções para Todos os Perfis</h2>
        <p className="text-gray-600 text-lg">Escolha a modalidade que melhor se adapta às suas necessidades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {types.map((type, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${type.color}`}>
              <type.icon size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-[#0E3A2F] mb-4">{type.title}</h3>
            <p className="text-gray-600 mb-8">{type.description}</p>
            
            <ul className="space-y-3 mb-8 flex-grow">
              {type.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[#00D166]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleNavigate(type.link)}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${type.btnColor}`}
            >
              Saiba Mais <ArrowRight size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default RentalTypesSection;