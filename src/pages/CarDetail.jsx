import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Loader2, ArrowLeft, Check, Shield, Settings 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ReservaForm from '@/components/ReservaForm';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import carService from '@/services/cars/carService';

const CarDetail = () => {
  const { carroId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const topRef = useRef(null);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    const fetchCar = async () => {
      console.log('Loading car:', carroId);
      const { data, error } = await carService.getCarById(carroId);
      if (error) {
        toast({ title: "Erro", description: "Veículo não encontrado", variant: "destructive" });
        return;
      }
      setCar(data);
      console.log("Specs:", data.especificacoes);
      setLoading(false);
    };
    fetchCar();
  }, [carroId]);

  const handleReservationComplete = (data) => {
      const reservationPayload = {
          car: {
              id: car.id,
              nome: car.nome,
              marca: car.marca,
              placa: car.placa,
              imagem_url: car.imagem_url
          },
          user: user || null,
          reservation: {
              data_inicio: data.startDate,
              data_fim: data.endDate,
              tipo_reserva: data.rentalType,
              plano: data.plan,
              franquia_km: data.franchise,
              valor_total: data.summary.total,
              valor_diario: data.summary.valorDiario,
              km_contratado: parseInt(data.franchise) || 0,
              km_adicional_valor: data.summary.kmAdicional,
              status: 'pendente_documentos'
          }
      };

      localStorage.setItem('reservationData', JSON.stringify(reservationPayload));
      navigate(`/documentos/${car.id}`, { state: reservationPayload });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00D166]" size={48} /></div>;

  return (
    <>
      <Helmet><title>{car.nome} | Reserva</title></Helmet>
      <div ref={topRef} className="min-h-screen bg-[#F9FAFB] pb-24">
        
        {/* Header */}
        <div className="bg-[#0E3A2F] text-white pt-8 pb-32">
           <div className="container mx-auto px-4">
              <button onClick={() => navigate('/frota')} className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 font-medium">
                  <ArrowLeft size={18} /> Voltar para Frota
              </button>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{car.nome}</h1>
              <p className="text-lg text-gray-300 flex items-center gap-2">
                  <span className="bg-[#00D166] text-[#0E3A2F] text-xs font-bold px-2 py-1 rounded uppercase">{car.categoria}</span>
                  {car.marca} • {car.ano}
              </p>
           </div>
        </div>

        <div className="container mx-auto px-4 -mt-20">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-8">
                 {/* Gallery */}
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                     {car.fotos_galeria && car.fotos_galeria.length > 0 ? (
                         <Swiper modules={[Navigation, Pagination]} navigation pagination={{clickable:true}} className="w-full aspect-video">
                             <SwiperSlide>
                                 <img src={car.foto_principal || car.imagem_url} alt="Principal" className="w-full h-full object-cover"/>
                             </SwiperSlide>
                             {car.fotos_galeria.map((url, i) => (
                                 <SwiperSlide key={i}>
                                     <img src={url} alt={`Galeria ${i}`} className="w-full h-full object-cover"/>
                                 </SwiperSlide>
                             ))}
                         </Swiper>
                     ) : (
                         <img src={car.foto_principal || car.imagem_url} alt={car.nome} className="w-full aspect-video object-cover" />
                     )}
                 </motion.div>

                 {/* Specs */}
                 <div className="bg-white rounded-2xl shadow-lg p-8">
                     <h3 className="text-xl font-bold text-[#0E3A2F] mb-6 flex items-center gap-2"><Settings className="text-[#00D166]"/> Especificações</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {car.especificacoes && car.especificacoes.length > 0 ? (
                             car.especificacoes.map((spec, i) => (
                                 <div key={i} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                     <Check size={16} className="text-[#00D166]"/> <span className="text-sm font-medium">{spec}</span>
                                 </div>
                             ))
                         ) : (
                             <p className="text-gray-400 italic">Sem especificações cadastradas.</p>
                         )}
                     </div>
                 </div>

                 {/* Info */}
                 <div className="bg-white rounded-2xl shadow-lg p-8">
                     <h3 className="text-xl font-bold text-[#0E3A2F] mb-6 flex items-center gap-2"><Shield className="text-[#00D166]"/> Informações Importantes</h3>
                     <ul className="space-y-3 text-gray-600">
                         <li className="flex gap-2"><Check size={18} className="text-[#00D166]"/> Seguro Roubo, Furto e Assistência 24 Horas incluso.</li>
                         <li className="flex gap-2"><Check size={18} className="text-[#00D166]"/> Processo de documentação 100% Transparente.</li>
                         <li className="flex gap-2"><Check size={18} className="text-[#00D166]"/> Manutenção preventiva inclusa.</li>
                     </ul>
                 </div>
              </div>

              {/* Reservation Form Sidebar */}
              <div className="lg:col-span-1">
                 <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border-t-4 border-[#00D166]">
                    <h3 className="text-xl font-bold text-[#0E3A2F] mb-6">Simular Reserva</h3>
                    <ReservaForm car={car} onComplete={handleReservationComplete} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default CarDetail;