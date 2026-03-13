import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, ShieldCheck, Tag } from 'lucide-react';

const ResumoPrecoCard = ({ reserva, loading, onFinalizar }) => {
  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const isDesktop = window.innerWidth >= 1024;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`
        bg-white lg:rounded-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-lg border-t lg:border border-gray-100 
        fixed bottom-0 left-0 right-0 lg:static lg:block z-40 lg:z-0
      `}
    >
      <div className="p-4 lg:p-6">
        <h3 className="hidden lg:flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
          <Tag size={18} className="text-[#00D166]" /> Resumo de Valores
        </h3>

        {/* Desktop Details */}
        <div className="hidden lg:block space-y-3 mb-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Valor {reserva?.plano === 'diario' ? 'Diário' : 'Mensal/Base'}</span>
            <span className="font-medium">{formatMoney(reserva?.valorDiario)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Duração</span>
            <span className="font-medium">{reserva?.duracaoDias} dias</span>
          </div>
          <div className="h-px bg-gray-100 my-2" />
        </div>

        {/* Mobile/Desktop Total */}
        <div className="flex lg:flex-col items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wide lg:mb-1">Valor Total</span>
            <motion.span 
              key={reserva?.valorTotal}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-[#00D166]"
            >
              {formatMoney(reserva?.valorTotal)}
            </motion.span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onFinalizar}
            disabled={loading}
            className={`
              bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold py-3 px-6 rounded-xl 
              flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20
              disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px] justify-center
            `}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Finalizar <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </div>
        
        <div className="hidden lg:flex items-center justify-center gap-2 mt-4 text-xs text-gray-400 bg-gray-50 py-2 rounded-lg">
           <ShieldCheck size={14} /> Pagamento 100% Seguro no Local
        </div>
      </div>
    </motion.div>
  );
};

export default ResumoPrecoCard;