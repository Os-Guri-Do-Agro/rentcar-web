import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CarCard from '@/components/CarCard';
import { carsData } from '@/data/carsData';

const CarShowcase = ({ selectedProfile }) => {
  const [selectedFilter, setSelectedFilter] = useState(
    selectedProfile === 'particular' ? 'Popular' : 'Black'
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    selectedProfile === 'particular' ? 'Mensal' : 'Trimestral'
  );
  const [selectedMileage, setSelectedMileage] = useState('2.500 KM');

  const filters = selectedProfile === 'particular'
    ? ['Popular', 'Mais Espaço Interno', 'SUVs', 'Elétricos']
    : ['Black', 'Uber Green', 'Econômico', 'Comfort'];

  const periods = selectedProfile === 'particular'
    ? ['Diária', 'Mensal', 'Trimestral', 'Semestral', 'Anual']
    : ['Trimestral', 'Semestral', 'Anual'];

  const mileagePlans = ['1.500 KM', '2.500 KM', '5.000 KM', '6.000 KM'];

  const filteredCars = carsData.filter(car => {
    if (selectedProfile === 'particular') {
      return car.vehicleType === selectedFilter;
    } else {
      return car.category === selectedFilter;
    }
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Nossa Frota {selectedProfile === 'particular' ? 'Particular' : 'para Motoristas de App'}
        </h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedProfile === 'particular' ? 'Tipo de Veículo' : 'Categoria de Trabalho'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedFilter === filter
                    ? 'bg-[#0E3A2F] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#0E3A2F]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Período de Locação</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedPeriod === period
                    ? 'bg-[#0E3A2F] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-[#0E3A2F]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {selectedProfile === 'motorista' && (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Plano de Quilometragem</h3>
              <div className="flex flex-wrap gap-3">
                {mileagePlans.map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedMileage(plan)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedMileage === plan
                        ? 'bg-[#0E3A2F] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-[#0E3A2F]'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedFilter}-${selectedPeriod}-${selectedMileage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                selectedPeriod={selectedPeriod}
                selectedMileage={selectedMileage}
                selectedProfile={selectedProfile}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Nenhum veículo disponível nesta categoria</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CarShowcase;