import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Car, Shield, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

const PrivateRental = () => {
  return (
    <>
      <Helmet><title>Locação Particular - JL RENT A CAR</title></Helmet>
      
      {/* Hero */}
      <section className="relative bg-[#0E3A2F] text-white py-24 px-4 overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#165945] transform skew-x-12 translate-x-20 opacity-50 z-0"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-1 bg-[#00D166]/20 text-[#00D166] rounded-full font-bold text-sm mb-4">
                Ideal para viagens e dia a dia
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Liberdade para ir <br/>
                <span className="text-[#00D166]">onde quiser.</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Veículos novos e revisados com seguro completo. A solução perfeita para quem precisa de um carro particular sem as burocracias de financiamento ou manutenção.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/frota-particular" 
                  className="flex items-center justify-center gap-2 bg-[#00D166] text-[#0E3A2F] px-8 py-4 rounded-lg font-bold hover:bg-[#00F178] transition-all hover:scale-105"
                >
                  Ver Carros Disponíveis <ArrowRight size={20} />
                </Link>
                <a 
                  href="#como-funciona" 
                  className="flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition-all"
                >
                  Como Funciona
                </a>
              </div>
            </motion.div>
          </div>
          
          <div className="md:w-1/2 relative">
             <motion.img 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               src="https://horizons-cdn.hostinger.com/8fda7eda-572b-44df-8780-0af2f709550b/design-sem-nome-hstXm.png" 
               alt="Carro JL Rent"
               className="w-full drop-shadow-2xl"
             />
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0E3A2F]">Por que alugar com a JL Rent?</h2>
            <p className="text-gray-500 mt-2">Diferenciais pensados para sua tranquilidade</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureBox 
              icon={Shield} 
              title="Proteção Total" 
              desc="Seguro contra roubo, furto, colisão e assistência 24 horas inclusos no valor da diária. Viaje sem preocupações." 
            />
            <FeatureBox 
              icon={Clock} 
              title="Agilidade na Entrega" 
              desc="Processo desburocratizado. Análise de cadastro rápida e retirada do veículo no mesmo dia da aprovação." 
            />
            <FeatureBox 
              icon={CheckCircle} 
              title="Manutenção Inclusa" 
              desc="Esqueça gastos com mecânico. Todas as revisões preventivas e corretivas são por nossa conta." 
            />
          </div>
        </div>
      </section>

      {/* Process Info */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div>
               <h2 className="text-3xl font-bold text-[#0E3A2F] mb-6">Locação Descomplicada</h2>
               <p className="text-gray-600 mb-8">
                 Nosso processo foi desenhado para ser simples e transparente. Em poucos passos você sai dirigindo seu carro novo.
               </p>
               
               <div className="space-y-8">
                 <Step 
                   num="1" 
                   title="Escolha o Veículo" 
                   desc="Navegue pela nossa frota particular e escolha o modelo que atende suas necessidades." 
                 />
                 <Step 
                   num="2" 
                   title="Solicite Análise" 
                   desc="Envie sua CNH e comprovante de residência através do nosso formulário online seguro." 
                 />
                 <Step 
                   num="3" 
                   title="Retirada" 
                   desc="Após aprovação e pagamento inicial, retire o veículo higienizado e pronto para uso." 
                 />
               </div>
             </div>
             
             <div className="bg-[#0E3A2F] p-8 rounded-2xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D166] rounded-full blur-3xl opacity-20"></div>
               <h3 className="text-2xl font-bold mb-6">Documentos Necessários</h3>
               <ul className="space-y-4">
                 <li className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-[#00D166] rounded-full"></div>
                   <span>CNH Definitiva (Categoria B ou superior)</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-[#00D166] rounded-full"></div>
                   <span>Comprovante de Residência atualizado</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-[#00D166] rounded-full"></div>
                   <span>Cartão de Crédito para caução (ou PIX)</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-[#00D166] rounded-full"></div>
                   <span>Idade mínima de 21 anos</span>
                 </li>
               </ul>
               
               <div className="mt-8 pt-8 border-t border-white/10">
                 <Link to="/frota-particular" className="block w-full text-center bg-white text-[#0E3A2F] py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                   Escolher Meu Carro Agora
                 </Link>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-[#00D166]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#0E3A2F] mb-6">Pronto para começar?</h2>
          <Link 
            to="/frota-particular" 
            className="inline-block bg-[#0E3A2F] text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            Ver Frota Disponível
          </Link>
        </div>
      </section>
    </>
  );
};

const FeatureBox = ({ icon: Icon, title, desc }) => (
  <div className="text-center p-8 bg-white border border-gray-100 rounded-xl hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
    <div className="w-16 h-16 bg-[#0E3A2F]/5 rounded-full flex items-center justify-center mx-auto mb-6">
      <Icon className="text-[#00D166]" size={32} />
    </div>
    <h3 className="text-xl font-bold text-[#0E3A2F] mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }) => (
  <div className="flex gap-4">
     <div className="w-10 h-10 bg-[#00D166] rounded-full flex items-center justify-center font-bold text-[#0E3A2F] flex-shrink-0 text-lg shadow-lg">
       {num}
     </div>
     <div>
        <h3 className="font-bold text-lg text-[#0E3A2F] mb-1">{title}</h3>
        <p className="text-gray-600">{desc}</p>
     </div>
  </div>
);

export default PrivateRental;