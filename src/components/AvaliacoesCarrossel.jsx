import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { Star, Quote, Loader2 } from 'lucide-react';
import { getAvaliacoes } from '@/services/avaliacoesService';
import { supabase } from '@/lib/supabaseClient';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const AvaliacoesCarrossel = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getAvaliacoes();
                console.log("[AvaliacoesCarrossel] Loaded reviews:", data.length);
                setReviews(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();

        // Realtime subscription
        const subscription = supabase
            .channel('public:avaliacoes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, (payload) => {
                console.log('Realtime update:', payload);
                fetchReviews();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#00D166]" size={32}/></div>;
    if (reviews.length === 0) return null;

    return (
        <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0E3A2F] mb-4">O que dizem nossos clientes</h2>
                    <p className="text-gray-600">A satisfação de quem confia na JL Rent a Car</p>
                </div>
                
                <Swiper
                    modules={[Navigation, Autoplay, Pagination]}
                    spaceBetween={30}
                    slidesPerView={1}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                    navigation
                    pagination={{ clickable: true, dynamicBullets: true }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    className="pb-12"
                >
                    {reviews.map((review) => (
                        <SwiperSlide key={review.id} className="h-auto">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-md transition-shadow">
                                <Quote className="text-[#00D166] mb-4 opacity-30" size={40} />
                                <p className="text-gray-600 italic mb-6 flex-grow leading-relaxed">"{review.texto}"</p>
                                
                                <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                        {review.foto_cliente ? (
                                            <img src={review.foto_cliente} alt={review.nome_cliente} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#0E3A2F] text-white font-bold text-lg">
                                                {review.nome_cliente.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#0E3A2F]">{review.nome_cliente}</h4>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={14} 
                                                    fill={i < review.estrelas ? "#FBBF24" : "none"} 
                                                    className={i < review.estrelas ? "text-yellow-400" : "text-gray-300"} 
                                                />
                                            ))}
                                        </div>
                                        {review.data_avaliacao && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(review.data_avaliacao).toLocaleDateString('pt-BR')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default AvaliacoesCarrossel;