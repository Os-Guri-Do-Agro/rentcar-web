import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Target, Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import mapImage from '@/assets/footer/map.jpg';
import {
  getWhatsAppNumber,
  getEmailSuporte,
  getTelefoneSuporte,
  getEnderecoEmpresa,
  getInstagram,
  getFacebook,
} from '@/services/configService';

const MAPS_URL = 'https://www.google.com/maps/place/R.+Fernando+Falc%C3%A3o,+54+-+Vila+Claudia,+S%C3%A3o+Paulo+-+SP,+03180-000/@-23.5543629,-46.5866693,1047m/data=!3m2!1e3!4b1!4m6!3m5!1s0x94ce5eb753b95707:0xe35150227a076d1b!8m2!3d-23.5543629!4d-46.5840944!16s%2Fg%2F11nnkr2gg3?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D'
import {
  abrirInstagram,
  abrirFacebook,
  abrirWhatsApp,
  abrirEmail,
  abrirTelefone,
  abrirMaps,
} from '@/utils/linkUtils';


const About = () => {
  const [config, setConfig] = useState({
    whatsapp: '', email: '', telefone: '', endereco: '', instagram: '', facebook: ''
  });

  useEffect(() => {
    const loadConfigs = async () => {
      const [whatsapp, email, telefone, endereco, instagram, facebook] = await Promise.all([
        getWhatsAppNumber(), getEmailSuporte(), getTelefoneSuporte(),
        getEnderecoEmpresa(), getInstagram(), getFacebook()
      ]);
      setConfig({ whatsapp: whatsapp || '', email: email || '', telefone: telefone || '', endereco: endereco || '', instagram: instagram || '', facebook: facebook || '' });
    };
    loadConfigs();
  }, []);

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

      {/* Contato */}
      <div className=" py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#0E3A2F] text-center mb-12">Fale Conosco</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:scale-105 transition-all cursor-pointer" onClick={() => abrirTelefone(config.telefone)}>
              <div className="w-16 h-16 bg-[#00D166]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00D166]"><Phone size={32} /></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Telefone</h3>
              <p className="text-gray-600 mb-4">Seg a Sex, 9h às 18h</p>
              <p className="text-lg font-bold text-[#0E3A2F] hover:text-[#00D166] transition-colors">{config.telefone}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:scale-105 transition-all cursor-pointer" onClick={() => abrirWhatsApp(config.whatsapp)}>
              <div className="w-16 h-16 bg-[#00D166]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00D166]"><MessageCircle size={32} /></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">Atendimento rápido</p>
              <p className="text-lg font-bold text-[#0E3A2F] hover:text-[#00D166] transition-colors">Iniciar Conversa</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:scale-105 transition-all cursor-pointer" onClick={() => abrirEmail(config.email)}>
              <div className="w-16 h-16 bg-[#00D166]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00D166]"><Mail size={32} /></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">E-mail</h3>
              <p className="text-gray-600 mb-4">Dúvidas e suporte</p>
              <p className="text-lg font-bold text-[#0E3A2F] hover:text-[#00D166] transition-colors truncate px-4">{config.email}</p>
            </div>
          </div>

          <div className="bg-[#0E3A2F] rounded-3xl p-8 md:p-12 text-white overflow-hidden relative shadow-2xl">
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Visite nossa Sede</h2>
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start gap-4 cursor-pointer" onClick={() => abrirMaps(MAPS_URL)}>
                    <MapPin className="text-[#00D166] mt-1 shrink-0" />
                    <p>{config.endereco}</p>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button onClick={() => abrirInstagram(config.instagram)} className="flex items-center gap-2 hover:text-[#00D166] transition-colors"><Instagram /> Instagram</button>
                    <button onClick={() => abrirFacebook(config.facebook)} className="flex items-center gap-2 hover:text-[#00D166] transition-colors"><Facebook /> Facebook</button>
                  </div>
                </div>
              </div>
              <div className="h-64 rounded-xl shadow-lg border-4 border-white/10 cursor-pointer overflow-hidden" onClick={() => abrirMaps(MAPS_URL)}>
                <iframe src={mapImage} width="100%" height="100%" scrolling="no" style={{ border: 0, pointerEvents: 'none', overflow: 'hidden' }} allowFullScreen="" loading="lazy" className="object-cover"></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   
  );

};

export default About;