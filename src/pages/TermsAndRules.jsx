import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, Shield, Book, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import termosServices from '@/services/termos/termos-services';
import regrasService from '@/services/regrasGerais/regras-service';

const TermsAndRules = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [regras, setRegras] = useState([]);
  const [termos, setTermos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('regras');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regrasRes, termosRes] = await Promise.all([
          regrasService.getRegras(),
          termosServices.getTermos(),
        ]);
        if (regrasRes.data) setRegras(regrasRes.data);
        if (termosRes.data) setTermos(termosRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveTab(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00D166]" size={40} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Termos e Regras - JL RENT A CAR</title>
        <meta name="description" content="Leia nossos termos de uso, condições e regras gerais de locação." />
      </Helmet>

      {/* Hero */}
      <div className="bg-[#0E3A2F] text-white py-16 px-4 relative">
        {isAdmin && (
          <button
            onClick={() => navigate('/admin/termos-regras')}
            className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Settings size={14} /> Gerenciar
          </button>
        )}
        <div className="container mx-auto text-center max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Central de Informações
          </motion.h1>
          <p className="text-gray-300 text-lg">
            Transparência total em nossos processos e contratos.
          </p>
        </div>
      </div>

      {/* Sticky Nav */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 md:gap-8 py-4 overflow-x-auto">
            <button
              onClick={() => scrollToSection('regras')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
                activeTab === 'regras'
                  ? 'bg-[#00D166] text-[#0E3A2F] shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Book size={18} /> Regras Gerais
            </button>
            <button
              onClick={() => scrollToSection('termos')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
                activeTab === 'termos'
                  ? 'bg-[#00D166] text-[#0E3A2F] shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Shield size={18} /> Termos e Condições
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl space-y-16">

          {/* Regras */}
          <section id="regras" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
              <div className="bg-[#0E3A2F] p-3 rounded-lg text-[#00D166]">
                <Book size={24} />
              </div>
              <h2 className="text-3xl font-bold text-[#0E3A2F]">Regras Gerais</h2>
            </div>
            <div className="grid gap-6">
              {regras.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold text-[#0E3A2F] mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#00D166]/20 flex items-center justify-center text-[#0E3A2F] text-sm shrink-0">
                      {index + 1}
                    </span>
                    {rule.titulo}
                  </h3>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line pl-10">
                    {rule.conteudo}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Termos */}
          <section id="termos" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
              <div className="bg-[#0E3A2F] p-3 rounded-lg text-[#00D166]">
                <Shield size={24} />
              </div>
              <h2 className="text-3xl font-bold text-[#0E3A2F]">Termos e Condições</h2>
            </div>
            <div className="grid gap-6">
              {termos.map((term, index) => (
                <motion.div
                  key={term.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-[#0E3A2F]">{term.titulo}</h3>
                    <span className="bg-white px-3 py-1 rounded text-xs font-semibold text-gray-500 uppercase tracking-wider border border-gray-200">
                      {term.secao || 'Geral'}
                    </span>
                  </div>
                  <div className="p-6 md:p-8 text-gray-600 leading-relaxed whitespace-pre-line">
                    {term.conteudo}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default TermsAndRules;
