import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Shield, Car, FileCheck } from 'lucide-react';

const benefits = [
  {
    icon: Wrench,
    title: 'Manutenção Preventiva Inclusa',
    description: 'Esqueça os gastos com oficina. Todas as revisões e reparos preventivos estão inclusos na sua assinatura.'
  },
  {
    icon: Shield,
    title: 'Seguro Completo',
    description: 'Proteção total contra roubo, furto e colisões. Dirija com tranquilidade sabendo que você está coberto.'
  },
  {
    icon: Car,
    title: 'Frota Nova e Revisada',
    description: 'Acesso a modelos 2025/2026 impecáveis, com tecnologia de ponta e manutenção sempre em dia.'
  },
  {
    icon: FileCheck,
    title: 'Sem Burocracia',
    description: 'Processo de contratação ágil, 100% transparente e sem a papelada interminável das locadoras tradicionais.'
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#00D166] font-bold uppercase tracking-wider text-sm">Vantagens Exclusivas</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0E3A2F] mt-2 mb-4">
            Sem custos extras! Confira tudo que está incluso
          </h2>
          <p className="text-gray-600">
            Nossa assinatura foi desenhada para eliminar surpresas financeiras. O valor que você vê é o valor que você paga.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 ">
          {benefits.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-[#00D166] hover:-translate-scale-105 transition-transform duration-300 "
            >
              <div className="w-14 h-14 bg-[#0E3A2F]/10 text-[#0E3A2F] rounded-lg flex items-center justify-center mb-6 ">
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;