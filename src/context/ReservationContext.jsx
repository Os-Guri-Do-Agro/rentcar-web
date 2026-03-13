import React, { createContext, useContext, useState, useEffect } from 'react';

const ReservationContext = createContext(null);

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};

export const ReservationProvider = ({ children }) => {
  const [reservationState, setReservationState] = useState(() => {
    // Auto-restore from localStorage on init
    const saved = localStorage.getItem('reservationState');
    return saved ? JSON.parse(saved) : {
      tipoReserva: null, // 'particular', 'uber', null
      origem: null, // 'frota-particular', 'frota-uber', 'frota', null
      carroSelecionado: null
    };
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('reservationState', JSON.stringify(reservationState));
  }, [reservationState]);

  const setTipoReserva = (tipo) => {
    setReservationState(prev => ({ ...prev, tipoReserva: tipo }));
  };

  const setOrigem = (origem) => {
    setReservationState(prev => ({ ...prev, origem }));
  };

  const setCarroSelecionado = (carId) => {
    setReservationState(prev => ({ ...prev, carroSelecionado: carId }));
  };

  const clearReservationState = () => {
    setReservationState({
      tipoReserva: null,
      origem: null,
      carroSelecionado: null
    });
    localStorage.removeItem('reservationState');
  };

  return (
    <ReservationContext.Provider value={{
      ...reservationState,
      setTipoReserva,
      setOrigem,
      setCarroSelecionado,
      clearReservationState
    }}>
      {children}
    </ReservationContext.Provider>
  );
};