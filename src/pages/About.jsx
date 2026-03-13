import React from 'react';
import { ShieldCheck, Users, Target } from 'lucide-react';


const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-[#0E3A2F] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre a JL RENT A CAR</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Mais que uma locadora, sua parceira de confiança nas estradas de São Paulo.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-[#0E3A2F] mb-6">Nossa História</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              A JL Rent a Car nasceu com uma missão clara: desburocratizar o acesso a veículos de qualidade para quem precisa trabalhar ou se locomover com conforto em São Paulo.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Identificamos uma lacuna no mercado onde as grandes locadoras falhavam no atendimento personalizado e na flexibilidade para motoristas de aplicativo. Decidimos mudar isso.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Hoje, somos referência na Mooca e região, oferecendo uma frota sempre renovada (2025/2026) e um atendimento humano, onde cada cliente é tratado pelo nome, não por um número de contrato.
            </p>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623" 
              alt="Escritório moderno da JL Rent a Car" 
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#00D166] p-8 rounded-xl shadow-lg hidden md:block">
              <p className="text-[#0E3A2F] font-bold text-3xl">Desde 2023</p>
              <p className="text-[#0E3A2F] font-medium">Transformando vidas</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-xl border-t-4 border-[#0E3A2F]">
            <Target className="w-12 h-12 text-[#00D166] mb-4" />
            <h3 className="text-xl font-bold text-[#0E3A2F] mb-3">Missão</h3>
            <p className="text-gray-600">
              Proporcionar mobilidade acessível, segura e de qualidade, impulsionando os ganhos de motoristas parceiros e o conforto de famílias.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl border-t-4 border-[#0E3A2F]">
            <Users className="w-12 h-12 text-[#00D166] mb-4" />
            <h3 className="text-xl font-bold text-[#0E3A2F] mb-3">Visão</h3>
            <p className="text-gray-600">
              Ser reconhecida como a locadora mais confiável e parceira de São Paulo, expandindo nossa frota mantendo a excelência no atendimento.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl border-t-4 border-[#0E3A2F]">
            <ShieldCheck className="w-12 h-12 text-[#00D166] mb-4" />
            <h3 className="text-xl font-bold text-[#0E3A2F] mb-3">Valores</h3>
            <p className="text-gray-600">
              Transparência em primeiro lugar. Segurança inegociável. Respeito pelo cliente e agilidade na solução de problemas.
            </p>
          </div>
        </div>
      </div>
    </div>
   
  );

};

export default About;