import React, { useState, useEffect } from 'react';
import { Car, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CAR_BRANDS } from '@/constants/carBrands';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const BrandSelector = ({ value, onChange, error, disabled = false }) => {
  const [isCustom, setIsCustom] = useState(false);
  const [internalError, setInternalError] = useState('');
  
  // Determine if the current value is one of the predefined brands
  useEffect(() => {
    if (value && !CAR_BRANDS.includes(value) && value !== "Outro") {
      setIsCustom(true);
    } else if (CAR_BRANDS.includes(value) && value !== "Outro") {
      setIsCustom(false);
    }
  }, [value]);

  const validateCustomBrand = (val) => {
    if (!val) return "A marca é obrigatória";
    if (val.length < 2) return "Mínimo de 2 caracteres";
    if (val.length > 50) return "Máximo de 50 caracteres";
    if (!/^[a-zA-Z0-9\s\-]+$/.test(val)) return "Apenas letras, números, espaços e hífens";
    return "";
  };

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    if (selected === "Outro") {
      setIsCustom(true);
      onChange(""); // Clear value to force user to type
      setInternalError("");
    } else {
      setIsCustom(false);
      onChange(selected);
      setInternalError("");
    }
  };

  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    
    // Real-time validation
    const validationError = validateCustomBrand(val);
    setInternalError(validationError);
  };

  const currentSelectValue = isCustom ? "Outro" : (CAR_BRANDS.includes(value) ? value : "");
  const displayError = error || (isCustom && internalError);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
        <Car size={16} className="text-[#00D166]" /> Marca
      </label>
      
      <div className="relative group">
        <select
          value={currentSelectValue}
          onChange={handleSelectChange}
          disabled={disabled}
          className={cn(
            "w-full p-3 border rounded-lg appearance-none bg-white transition-all duration-200 focus:ring-2 focus:ring-[#00D166] outline-none cursor-pointer",
            displayError ? "border-red-300 focus:border-red-500" : "border-gray-200 hover:border-gray-300"
          )}
        >
          <option value="" disabled>Selecione a marca do carro</option>
          {CAR_BRANDS.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        
        {/* Custom Chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      <AnimatePresence>
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative mt-2">
                <input
                    type="text"
                    value={value || ''}
                    onChange={handleCustomInputChange}
                    disabled={disabled}
                    placeholder="Digite o nome da marca"
                    className={cn(
                        "w-full p-3 pl-4 border rounded-lg transition-all duration-200 outline-none",
                        displayError 
                            ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500" 
                            : "border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-[#00D166]"
                    )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {displayError ? (
                        <AlertCircle size={18} className="text-red-500" />
                    ) : value && !internalError ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                    ) : null}
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-1">
                Ou digite uma marca customizada se não estiver na lista.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs text-red-500 mt-1 font-medium ml-1"
          >
            <AlertCircle size={12} />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandSelector;