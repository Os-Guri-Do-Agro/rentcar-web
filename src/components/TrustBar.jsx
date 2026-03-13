import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Shield, Calendar, CheckCircle } from 'lucide-react';

const TrustBar = () => {
  const features = [
    {
      icon: Wrench,
      title: 'Manutenção Inclusa',
      description: 'Todos os reparos por nossa conta'
    },
    {
      icon: Shield,
      title: 'Seguro Total',
      description: 'Cobertura completa incluída'
    },
    {
      icon: Calendar,
      title: 'Carros 2025/2026',
      description: 'Frota sempre renovada'
    },
    {
      icon: CheckCircle,
      title: 'Sem Burocracia',
      description: 'Processo simples e rápido'
    }
  ];

  return (
    <section className="py-16 bg-white border-t border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0E3A2F] text-white rounded-full mb-4">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;