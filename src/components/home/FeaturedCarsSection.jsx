import React, { useEffect, useState } from 'react';
import SectionContainer from '../SectionContainer';
import CarCard from '../CarCard';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import carsDestaqueService from '@/services/cars/destaques/carsDestaque-service';

const FeaturedCarsSection = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const response = await carsDestaqueService.getCarsDestaque()
      setCars(response.data ?? []);
    } catch (error) {
      console.error("Error loading featured cars:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show only first 4 cars
  const displayedCars = cars ? cars.slice(0, 4) : [];

  return (
    <SectionContainer className="bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
           <h2 className="text-3xl md:text-4xl font-bold text-[#0E3A2F] mb-4">Destaques da Frota</h2>
           <p className="text-gray-600 max-w-xl">Confira os modelos mais procurados pelos nossos clientes, combinando economia e conforto.</p>
        </div>
        <button 
          onClick={() => navigate('/frota')}
          className="text-[#00D166] font-bold hover:text-[#00b355] hover:underline underline-offset-4 transition-all"
        >
          Ver frota completa &rarr;
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <Loader2 className="animate-spin text-[#00D166]" size={40} />
        </div>
      ) : displayedCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
           Nenhum carro em destaque no momento.
        </div>
      )}
    </SectionContainer>
  );
};

export default FeaturedCarsSection;