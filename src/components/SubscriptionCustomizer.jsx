import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { carsData } from '@/data/carsData';

const SubscriptionCustomizer = () => {
  const [profile, setProfile] = useState('particular');
  const [selectedCarId, setSelectedCarId] = useState(carsData[0].id);
  const [period, setPeriod] = useState('Anual');
  const [mileage, setMileage] = useState('2.500 KM');
  const [price, setPrice] = useState(0);

  const selectedCar = carsData.find(c => c.id === Number(selectedCarId));

  // Determine available options based on profile
  const periods = profile === 'particular' 
    ? ['Diária', 'Mensal', 'Trimestral', 'Semestral', 'Anual']
    : ['Trimestral', 'Semestral', 'Anual'];
  
  const mileagePlans = ['1.500 KM', '2.500 KM', '5.000 KM', '6.000 KM'];

  // Price Calculation Logic
  useEffect(() => {
    if (!selectedCar) return;

    let calculatedPrice = 0;
    const pricing = selectedCar.pricing[profile];

    if (profile === 'particular') {
      // Particular logic: flat rate based on period
      calculatedPrice = pricing[period] || 0;
    } else {
      // Motorista logic: nested object Period -> Mileage
      const cleanMileage = mileage.replace(' KM', '').replace('.', '');
      if (pricing[period] && pricing[period][cleanMileage]) {
        calculatedPrice = pricing[period][cleanMileage];
      }
    }
    setPrice(calculatedPrice);
  }, [profile, selectedCarId, period, mileage, selectedCar]);

  // Reset period/mileage if switching profiles and current selection is invalid
  useEffect(() => {
    if (profile === 'motorista' && (period === 'Diária' || period === 'Mensal')) {
      setPeriod('Anual');
    }
  }, [profile, period]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Fiz uma simulação no site.\n\n` +
      `🚗 *Modelo:* ${selectedCar?.name}\n` +
      `👤 *Perfil:* ${profile === 'particular' ? 'Particular' : 'Motorista de App'}\n` +
      `📅 *Período:* ${period}\n` +
      `${profile === 'motorista' ? `🛣️ *Franquia:* ${mileage}\n` : ''}` +
      `💰 *Valor Estimado:* R$ ${price.toLocaleString('pt-BR')}`
    );
    window.open(`https://wa.me/5511913123870?text=${message}`, '_blank');
  };

  return (
    <section id="personalize" className="py-20 bg-white relative -mt-20 z-20">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#0E3A2F] py-6 px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Personalize a sua assinatura
            </h2>
            <p className="text-gray-300 mt-2">
              Monte o plano perfeito com o modelo, tempo e franquia que você deseja
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-0">
            {/* Left Side: Controls */}
            <div className="lg:col-span-7 p-8 md:p-10 space-y-8">
              
              {/* 1. Profile Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  1. Qual o seu perfil?
                </label>
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setProfile('particular')}
                    className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
                      profile === 'particular'
                        ? 'bg-white text-[#0E3A2F] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Cliente Particular
                  </button>
                  <button
                    onClick={() => setProfile('motorista')}
                    className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
                      profile === 'motorista'
                        ? 'bg-white text-[#0E3A2F] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Motorista de App
                  </button>
                </div>
              </div>

              {/* 2. Car Model */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  2. Escolha o Modelo
                </label>
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(Number(e.target.value))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:border-[#00D166] focus:outline-none transition-colors appearance-none bg-white"
                >
                  {carsData.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.name} - {car.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Period Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  3. Tempo de Contrato
                </label>
                <div className="flex flex-wrap gap-3">
                  {periods.map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                        period === p
                          ? 'border-[#0E3A2F] bg-[#0E3A2F] text-white'
                          : 'border-gray-200 text-gray-600 hover:border-[#0E3A2F]/50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Mileage Selector (Only for Motorista for now, or if data supported particular mileage) */}
              {profile === 'motorista' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    4. Franquia Mensal (KM)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {mileagePlans.map(m => (
                      <button
                        key={m}
                        onClick={() => setMileage(m)}
                        className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                          mileage === m
                            ? 'border-[#0E3A2F] bg-[#0E3A2F] text-white'
                            : 'border-gray-200 text-gray-600 hover:border-[#0E3A2F]/50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Side: Preview & Price */}
            <div className="lg:col-span-5 bg-gray-50 p-8 md:p-10 flex flex-col justify-between border-l border-gray-100">
              <div>
                {selectedCar && (
                  <motion.div
                    key={selectedCar.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                  >
                    <img
                      src={selectedCar.image}
                      alt={selectedCar.name}
                      className="w-full h-48 object-cover rounded-xl shadow-md mb-4"
                    />
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedCar.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Modelo Selecionado</span>
                    <span className="font-bold text-gray-900">{selectedCar?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Plano</span>
                    <span className="font-bold text-gray-900">{period}</span>
                  </div>
                  {profile === 'motorista' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Franquia</span>
                      <span className="font-bold text-gray-900">{mileage}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-500 font-medium">Valor Estimado</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block mb-1">
                      {period === 'Diária' ? 'por dia' : 'por mês'}
                    </span>
                    <span className="text-4xl font-bold text-[#0E3A2F] tracking-tight">
                      R$ {price > 0 ? price.toLocaleString('pt-BR') : '--'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleWhatsApp}
                  disabled={price === 0}
                  className="w-full mt-4 bg-[#00D166] text-[#0E3A2F] py-4 rounded-lg font-bold text-lg hover:bg-[#00F178] active:bg-[#05b05a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  Contratar Agora
                  <Check size={20} strokeWidth={3} />
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  <Info size={12} className="inline mr-1" />
                  Sujeito a análise de crédito e disponibilidade
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionCustomizer;