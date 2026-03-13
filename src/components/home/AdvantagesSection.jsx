import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Car, FileCheck, Banknote, Sparkles, Loader2, Check, Wrench, Wrench as Tool } from 'lucide-react';
import SectionContainer from '../SectionContainer';
import { getSecao } from '@/services/secoesService';
import { supabase } from '@/lib/supabaseClient';

const ICON_MAP = {
  'Shield': Shield,
  'Clock': Clock,
  'Car': Car,
  'FileCheck': FileCheck,
  'Banknote': Banknote,
  'Sparkles': Sparkles,
  'Check': Check,
  'Wrench': Wrench,
  'Tool': Tool
};

const AdvantagesSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log("[AdvantagesSection] Fetching data...");
      const secao = await getSecao('vantagens');
      if (secao) setData(secao);
    } catch (err) {
      console.error("[AdvantagesSection] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Realtime updates
    const channel = supabase
      .channel('public:secoes_home')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'secoes_home', filter: 'slug=eq.vantagens' },
        (payload) => {
          console.log("[AdvantagesSection] Real-time update received:", payload);
          if (payload.new) setData(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#00D166]"/></div>;
  if (!data) return null;

  return (
    <SectionContainer className="bg-gray-50">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0E3A2F] mb-4">{data.titulo}</h2>
        <p className="text-gray-600 text-lg">{data.descricao}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.cards?.map((item, index) => {
          const IconComponent = ICON_MAP[item.icone] || Check;
          
          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-[#00D166]/30 transition-all duration-300 group hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-[#0E3A2F]/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00D166] transition-colors duration-300">
                <IconComponent size={28} className="text-[#0E3A2F] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-[#0E3A2F] mb-3">{item.titulo}</h3>
              <p className="text-gray-600 leading-relaxed">{item.descricao}</p>
            </motion.div>
          );
        })}
      </div>
    </SectionContainer>
  );
};

export default AdvantagesSection;