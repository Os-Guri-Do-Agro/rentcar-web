import React from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '@/components/home/HeroSection';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import RentalTypesSection from '@/components/home/RentalTypesSection';
import FeaturedCarsSection from '@/components/home/FeaturedCarsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import CTASection from '@/components/home/CTASection';
import useScrollToTop from '@/hooks/useScrollToTop';

const Home = () => {
  useScrollToTop();

  return (
    <>
      <Helmet>
        <title>JL RENT A CAR | Aluguel de Carros em São Paulo</title>
        <meta name="description" content="Alugue o carro perfeito para sua jornada. Frota moderna, preços competitivos e atendimento 24/7 para motoristas de app e particulares." />
        <meta property="og:title" content="JL RENT A CAR | Aluguel de Carros" />
        <meta property="og:description" content="A melhor opção para sua mobilidade em São Paulo." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1627404760301-8efc143749c8" />
      </Helmet>

      <div className="flex flex-col w-full">
        {/* All child sections should self-manage any config needs via configService if necessary */}
        <HeroSection />
        <AdvantagesSection />
        <RentalTypesSection />
        <FeaturedCarsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </div>
    </>
  );
};

export default Home;