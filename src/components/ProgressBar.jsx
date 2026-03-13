import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

const ProgressBar = ({ currentStep = 2, totalSteps = 3 }) => {
  const steps = [
    { id: 1, label: 'Seleção' },
    { id: 2, label: 'Dados' },
    { id: 3, label: 'Confirmação' },
  ];

  const progress = ((currentStep / totalSteps) * 100);

  return (
    <div className="w-full py-6 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Breadcrumb / Steps */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex items-center gap-2 ${
                    step.id <= currentStep ? 'text-[#0066FF] font-bold' : 'text-gray-400 font-medium'
                  }`}
                >
                  <span className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs
                    ${step.id < currentStep ? 'bg-[#0066FF] text-white' : step.id === currentStep ? 'bg-[#0066FF]/10 text-[#0066FF] ring-2 ring-[#0066FF]/20' : 'bg-gray-100 text-gray-400'}
                  `}>
                    {step.id < currentStep ? <Check size={12} /> : step.id}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight size={14} className="text-gray-300" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            Etapa {currentStep} de {totalSteps}
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#0066FF]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;