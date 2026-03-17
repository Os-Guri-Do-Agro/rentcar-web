import React, { useState, useEffect } from 'react';
import mapImage from '@/assets/footer/map.jpg';
import { Helmet } from 'react-helmet';
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { 
  getWhatsAppNumber, 
  getEmailSuporte, 
  getTelefoneSuporte, 
  getEnderecoEmpresa,
  getInstagram,
  getFacebook,
  getMapsUrl
} from '@/services/configService';
import { 
    abrirInstagram, 
    abrirFacebook, 
    abrirWhatsApp, 
    abrirEmail, 
    abrirTelefone, 
    abrirMaps 
} from '@/utils/linkUtils';

const Contato = () => {
    const [config, setConfig] = useState({
        whatsapp: '',
        email: '',
        telefone: '',
        endereco: '',
        instagram: '',
        facebook: '',
        maps_url: ''
    });

    useEffect(() => {
        const loadConfigs = async () => {
            console.log("[Contato] Loading configurations...");
            const [whatsapp, email, telefone, endereco, instagram, facebook, maps_url] = await Promise.all([
                getWhatsAppNumber(),
                getEmailSuporte(),
                getTelefoneSuporte(),
                getEnderecoEmpresa(),
                getInstagram(),
                getFacebook(),
                getMapsUrl()
            ]);
            
            setConfig({
                whatsapp: whatsapp || '',
                email: email || '',
                telefone: telefone || '',
                endereco: endereco || '',
                instagram: instagram || '',
                facebook: facebook || '',
                maps_url: maps_url || ''
            });
        };
        loadConfigs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <Helmet title="Fale Conosco - JL RENT A CAR" />
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-[#0E3A2F] text-center mb-12">Fale Conosco</h1>
                
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:scale-105 transition-all cursor-pointer" onClick={() => abrirTelefone(config.telefone)}>
                        <div className="w-16 h-16 bg-[#00D166]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00D166]">
                            <Phone size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Telefone</h3>
                        <p className="text-gray-600 mb-4">Seg a Sex, 9h às 18h</p>
                        <p className="text-lg font-bold text-[#0E3A2F] hover:text-[#00D166] transition-colors">{config.telefone}</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:scale-105 transition-all cursor-pointer" onClick={() => abrirWhatsApp(config.whatsapp)}>
                        <div className="w-16 h-16 bg-[#00D166]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00D166]">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">WhatsApp</h3>
                        <p className="text-gray-600 mb-4">Atendimento rápido</p>
                        <p className="text-lg font-bold text-[#0E3A2F] hover:text-[#00D166] transition-colors">Iniciar Conversa</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:scale-105 transition-all cursor-pointer" onClick={() => abrirEmail(config.email)}>
                        <div className="w-16 h-16 bg-[#00D166]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00D166]">
                            <Mail size={32} />
                        </div>
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
                                <div className="flex items-start gap-4 cursor-pointer" onClick={() => abrirMaps(config.maps_url)}>
                                    <MapPin className="text-[#00D166] mt-1 shrink-0" />
                                    <p>{config.endereco}</p>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button onClick={() => abrirInstagram(config.instagram)} className="flex items-center gap-2 hover:text-[#00D166] transition-colors">
                                        <Instagram /> Instagram
                                    </button>
                                    <button onClick={() => abrirFacebook(config.facebook)} className="flex items-center gap-2 hover:text-[#00D166] transition-colors">
                                        <Facebook /> Facebook
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="h-64 rounded-xl shadow-lg border-4 border-white/10 cursor-pointer overflow-hidden" onClick={() => abrirMaps(config.maps_url)}>
                             <iframe
                                src={mapImage}
                                width="100%"
                                height="100%"
                                scrolling="no"
                                style={{ border: 0, pointerEvents: 'none', overflow: 'hidden' }}
                                allowFullScreen=""
                                loading="lazy"
                                className='object-cover'
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contato;