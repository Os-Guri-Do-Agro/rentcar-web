import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, Car, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateWeeklyPrice, calculateMonthlyPrice } from '@/services/calculoPrecoService';

const ResumoReservaCard = ({ carro, reserva, isExpandedMobile = false }) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedMobile);

  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    return format(new Date(dateString), "dd 'de' MMM, yyyy", { locale: ptBR });
  };

  const planLabel = {
    'diario': 'Plano Diário',
    'semanal': 'Plano Semanal',
    'trimestral': 'Plano Trimestral',
    'semestral': 'Plano Semestral',
    'anual': 'Plano Anual',
    'franquia': 'Plano Mensal'
  };

  const formatMoney = (val) => val ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00';
  const weeklyPrice = calculateWeeklyPrice(reserva?.valorTotal, reserva?.plano);
  const monthlyPrice = calculateMonthlyPrice(reserva?.valorTotal, reserva?.plano);
  const showPrices = ['trimestral', 'semestral', 'anual'].includes(reserva?.plano);

  // Check if PDF document is present (checking various fields for compatibility)
  const hasDocument = reserva?.reserva_documentos && reserva.reserva_documentos.length > 0;
  const doc = hasDocument ? reserva.reserva_documentos[0] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between lg:hidden cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
           <Car size={18} className="text-[#0066FF]" />
           <span className="font-bold text-gray-900 text-sm">Resumo do Veículo</span>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      <AnimatePresence>
        {(isExpanded || window.innerWidth >= 1024) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden group">
              {carro?.foto_principal || carro?.imagem_url ? (
                <motion.img src={carro.foto_principal || carro.imagem_url} alt={carro.nome} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><Car size={48} /></div>
              )}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0E3A2F] shadow-sm">{carro?.ano || '2024'}</div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{carro?.marca} {carro?.nome}</h3>
              <p className="text-sm text-gray-500 mb-4">{carro?.categoria} • {carro?.combustivel}</p>

              <div className="space-y-4">
                 {showPrices && weeklyPrice > 0 && (
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-center mb-2">
                        <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-lg"><DollarSign size={16} />{formatMoney(weeklyPrice)} / semana</div>
                        <div className="text-xs text-gray-500 mt-1">({formatMoney(monthlyPrice)} / mês)</div>
                    </div>
                 )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-[#0066FF] rounded-lg mt-0.5"><Calendar size={16} /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Retirada</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(reserva?.dataRetirada)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mt-0.5"><Clock size={16} /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Duração</p>
                    <p className="text-sm font-medium text-gray-900">{reserva?.duracaoDias} dias • {planLabel[reserva?.plano] || reserva?.plano}</p>
                  </div>
                </div>
              
                {/* Document Status */}
                {doc && (
                    <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mt-0.5"><FileText size={16} /></div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Documentação</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-purple-700">
                                <CheckCircle size={12} /> Recebida (PDF)
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{doc.documento_pdf_nome || doc.arquivo_nome}</p>
                        </div>
                    </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResumoReservaCard;