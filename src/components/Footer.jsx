import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin, MessageCircle, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const Footer = () => {
  const currentYear = new Date().getFullYear();
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
        console.log("[Footer] Loading configurations...");
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
    <footer className="bg-[#0E3A2F] text-white pt-20 pb-8 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <h3 className="text-2xl font-bold tracking-tight text-white">
                JL RENT A CAR
              </h3>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
               Referência em locação de veículos para motoristas de aplicativo e particulares em São Paulo. Transparência, segurança e qualidade em cada quilômetro.
            </p>
            <div className="flex gap-4 pt-2">
              <button onClick={() => abrirInstagram(config.instagram)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#00D166] hover:text-[#0E3A2F] transition-all" title="Instagram">
                <Instagram size={20} />
              </button>
              <button onClick={() => abrirFacebook(config.facebook)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#00D166] hover:text-[#0E3A2F] transition-all" title="Facebook">
                <Facebook size={20} />
              </button>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Navegação</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-[#00D166] transition-colors flex items-center gap-2">Início</Link></li>
              <li><Link to="/frota" className="hover:text-[#00D166] transition-colors flex items-center gap-2">Nossa Frota</Link></li>
              <li><Link to="/locacao-particular" className="hover:text-[#00D166] transition-colors flex items-center gap-2">Aluguel Particular</Link></li>
              <li><Link to="/sobre" className="hover:text-[#00D166] transition-colors flex items-center gap-2">Sobre Nós</Link></li>
              <li><Link to="/contato" className="hover:text-[#00D166] transition-colors flex items-center gap-2">Contato</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Fale Conosco</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-center gap-3 group cursor-pointer" onClick={() => abrirTelefone(config.telefone)}>
                 <div className="w-8 h-8 rounded-full bg-[#00D166]/10 flex items-center justify-center text-[#00D166] group-hover:bg-[#00D166] group-hover:text-[#0E3A2F] transition-all">
                    <Phone size={16} />
                 </div>
                 <span className="group-hover:text-white transition-colors">{config.telefone}</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer" onClick={() => abrirEmail(config.email)}>
                 <div className="w-8 h-8 rounded-full bg-[#00D166]/10 flex items-center justify-center text-[#00D166] group-hover:bg-[#00D166] group-hover:text-[#0E3A2F] transition-all">
                    <Mail size={16} />
                 </div>
                 <span className="group-hover:text-white transition-colors truncate max-w-[200px]">{config.email}</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer" onClick={() => abrirWhatsApp(config.whatsapp)}>
                    <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all">
                        <MessageCircle size={16} />
                    </div>
                    <span className="group-hover:text-white transition-colors">WhatsApp</span>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer" onClick={() => abrirMaps(config.maps_url)}>
                 <div className="w-8 h-8 rounded-full bg-[#00D166]/10 flex items-center justify-center text-[#00D166] group-hover:bg-[#00D166] group-hover:text-[#0E3A2F] transition-all mt-1">
                    <MapPin size={16} />
                 </div>
                 <span className="group-hover:text-white transition-colors">{config.endereco}</span>
              </li>
            </ul>
          </div>

          {/* Map Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Onde Estamos</h3>
            <div className="rounded-xl overflow-hidden h-40 border border-gray-700 shadow-lg group cursor-pointer" onClick={() => abrirMaps(config.maps_url)}>
               <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.436376594248!2d-46.588075623812745!3d-23.55278746127471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5ec0192e4e11%3A0x6e9a6565158a1309!2sR.%20Fernando%20Falc%C3%A3o%2C%2054%20-%20Mooca%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2003180-000!5e0!3m2!1spt-BR!2sbr!4v1703200000000!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: 'none' }} 
                  allowFullScreen=""
                  loading="lazy"
                  className="group-hover:scale-110 transition-transform duration-700"
               ></iframe>
            </div>
            <p className="text-xs text-center mt-2 text-gray-500 hover:text-[#00D166]" onClick={() => abrirMaps(config.maps_url)}>Clique para abrir no mapa</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {currentYear} JL RENT A CAR LTDA. CNPJ: 52.535.561/0001-99</p>
          <div className="flex gap-6">
            <Link to="/termos-de-uso" className="hover:text-[#00D166] transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-[#00D166] transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;