import React from 'react';
import { Helmet } from 'react-helmet';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Location = () => {
  return (
    <>
      <Helmet><title>Localização - JL RENT A CAR</title></Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#0E3A2F] mb-8 text-center">Nossa Localização</h1>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">JL Rent a Car</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-[#00D166] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900">Endereço</h3>
                  <p className="text-gray-600">Rua Fernando Falcão, 48 - Anexo 54</p>
                  <p className="text-gray-600">Vila Claudia (Mooca), São Paulo - SP</p>
                  <p className="text-gray-600">CEP: 03180-000</p>
                  <a 
                    href="https://waze.com/ul?ll=-23.555299,-46.585887&navigate=yes" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block mt-2 text-[#00D166] font-bold hover:underline"
                  >
                    Abrir no Waze
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="text-[#00D166] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900">Horário de Atendimento</h3>
                  <p className="text-gray-600">Segunda a Sexta: 09h às 18h</p>
                  <p className="text-gray-600">Sábado: 09h às 13h</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-[#00D166] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900">Telefones</h3>
                  <p className="text-gray-600">(11) 91312-3870</p>
                  <p className="text-gray-600">(11) 4306-7524</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.436376594248!2d-46.588075623812745!3d-23.55278746127471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5ec0192e4e11%3A0x6e9a6565158a1309!2sR.%20Fernando%20Falc%C3%A3o%2C%2048%20-%20Mooca%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2003180-000!5e0!3m2!1spt-BR!2sbr!4v1703200000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
};

export default Location;