import React, { useState } from 'react';
import CarCard from '@/components/CarCard';
import { carsData } from '@/data/carsData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FleetSection = () => {
  const particularCars = carsData.filter(c => c.pricing.particular);
  // Assuming all cars are available for drivers too in this dataset, or strictly checking categories
  const driverCars = carsData.filter(c => c.pricing.motorista);

  return (
    <section id="frota" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[#0E3A2F] mb-4">Nossa Frota</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Escolha o veículo ideal para sua necessidade, seja para rodar com aplicativos ou para uso pessoal.
        </p>

        <Tabs defaultValue="particular" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="particular"
                className="data-[state=active]:bg-[#0E3A2F] data-[state=active]:text-white py-3 font-bold rounded-md transition-all"
              >
                Frota Particular
              </TabsTrigger>
              <TabsTrigger 
                value="motorista"
                className="data-[state=active]:bg-[#0E3A2F] data-[state=active]:text-white py-3 font-bold rounded-md transition-all"
              >
                Para Motoristas de App
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="particular" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {particularCars.map(car => (
                 <CarCard 
                    key={car.id} 
                    car={car} 
                    selectedProfile="particular"
                    selectedPeriod="Mensal" // Default view
                    selectedMileage="" 
                  />
               ))}
             </div>
          </TabsContent>

          <TabsContent value="motorista" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {driverCars.map(car => (
                 <CarCard 
                    key={car.id} 
                    car={car} 
                    selectedProfile="motorista"
                    selectedPeriod="Anual" // Default view
                    selectedMileage="2.500 KM" // Default view
                  />
               ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default FleetSection;