import React from 'react';
import { Helmet } from 'react-helmet';
import { Building2, CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const LocacaoCorporativa = () => {
    console.log("[LocacaoCorporativa] Render");
    return (
        <div className="min-h-screen bg-gray-50">
            <Helmet title="Locação Corporativa | JL Rent a Car" />
            
            {/* Hero */}
            <div className="bg-[#0E3A2F] text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Soluções Corporativas</h1>
                    <p className="text-xl text-gray-300">Gestão de frota eficiente para sua empresa com custo reduzido e zero burocracia.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0E3A2F] mb-6">Por que escolher a JL para sua empresa?</h2>
                        <ul className="space-y-4">
                            {[
                                "Redução de custos operacionais",
                                "Manutenção e seguro inclusos (Roubo, Furto e Assistência 24h)",
                                "Carros sempre novos e revisados",
                                "Documentação Transparente e simplificada",
                                "Atendimento exclusivo para empresas"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-lg text-gray-700">
                                    <CheckCircle className="text-[#00D166]" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <Building2 className="text-[#00D166] w-16 h-16 mb-6" />
                        <h3 className="text-2xl font-bold text-[#0E3A2F] mb-4">Solicite uma Proposta</h3>
                        <p className="text-gray-600 mb-6">Entre em contato com nosso time comercial para um plano personalizado.</p>
                        <a 
                            href="https://wa.me/5511913123870?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20proposta%20corporativa" 
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full text-center bg-[#00D166] text-[#0E3A2F] py-3 rounded-lg font-bold hover:bg-[#00F178] transition-colors mb-4"
                        >
                            Falar no WhatsApp
                        </a>
                        <a 
                            href="mailto:adm@jlrentacar.com.br" 
                            className="block w-full text-center border-2 border-[#0E3A2F] text-[#0E3A2F] py-3 rounded-lg font-bold hover:bg-[#0E3A2F] hover:text-white transition-colors"
                        >
                            Enviar E-mail
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocacaoCorporativa;