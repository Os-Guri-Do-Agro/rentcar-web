import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, MessageCircle } from 'lucide-react';
import SectionContainer from '../SectionContainer';
import { getWhatsAppNumber, generateWhatsAppLink } from '@/lib/whatsappUtils';

const faqs = [
  {
    question: "Quais são os requisitos mínimos para alugar?",
    answer: "Para alugar, você precisa ter no mínimo 21 anos, CNH válida há pelo menos 2 anos e cartão de crédito em nome do titular para caução. Para motoristas de app, é necessário apresentar o cadastro na plataforma."
  },
  {
    question: "Quais documentos preciso apresentar?",
    answer: "É necessário apresentar RG, CPF, CNH original e comprovante de residência atualizado. Para motoristas de aplicativo, também solicitamos o print do perfil na plataforma."
  },
  {
    question: "O seguro está incluso no valor?",
    answer: "Sim! Todas as nossas locações incluem proteção contra roubo, furto, colisão e terceiros. Existe uma coparticipação em caso de sinistro, que será detalhada no contrato."
  },
  {
    question: "Posso cadastrar outro motorista?",
    answer: "Sim, é possível incluir condutores adicionais mediante uma pequena taxa diária, desde que eles também atendam aos requisitos mínimos de locação."
  },
  {
    question: "Como funciona a política de cancelamento?",
    answer: "Cancelamentos feitos com até 48 horas de antecedência são gratuitos. Após esse prazo, pode haver cobrança de uma taxa administrativa conforme contrato."
  }
];

const FAQItem = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onClick}
        className={`w-full py-6 flex items-center justify-center md:justify-between text-left transition-colors ${isOpen ? 'text-[#00D166]' : 'text-[#0E3A2F] hover:text-[#00D166]'}`}
      >
        <span className="font-bold text-lg pr-8">{item.question}</span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isOpen ? 'bg-[#00D166] border-[#00D166] text-white' : 'border-gray-300 text-gray-400'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-600 leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    const loadWhatsApp = async () => {
        const num = await getWhatsAppNumber();
        setWhatsappNumber(num);
    };
    loadWhatsApp();
  }, []);

  const handleContact = () => {
      const link = generateWhatsAppLink(whatsappNumber, "Olá! Gostaria de mais informações sobre aluguel de carros.");
      window.open(link, '_blank');
  };

  return (
    <SectionContainer className="bg-gray-50">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="md:w-1/3 sticky top-24">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-[#00D166]/10 rounded-xl flex items-center justify-center mb-6">
               <HelpCircle className="text-[#00D166]" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-[#0E3A2F] mb-4">Dúvidas Frequentes</h2>
            <p className="text-gray-600 mb-6">
              Separamos as perguntas mais comuns para te ajudar. Se ainda tiver dúvidas, entre em contato conosco.
            </p>
            
            <button 
                onClick={handleContact}
                className="w-full py-3 bg-[#25D366] hover:bg-[#1ebc59] text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-md"
            >
                <MessageCircle size={20} /> Falar com Atendente
            </button>
          </div>
        </div>

        <div className="md:w-2/3 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(index === openIndex ? null : index)}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};

export default FAQSection;