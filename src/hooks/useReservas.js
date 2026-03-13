import { useState, useCallback } from 'react';
import { createReserva, getUserReservas, cancelReserva as cancelReservaService } from '@/services/reservaService';

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservas = useCallback(async (userId) => {
    setLoading(true);
    try {
      const data = await getUserReservas(userId);
      setReservas(data);
    } catch (err) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (userId, carId, dataInicio, dataFim, valorTotal) => {
    setLoading(true);
    try {
      const newReserva = await createReserva(userId, carId, dataInicio, dataFim, valorTotal);
      setReservas(prev => [newReserva, ...prev]);
      return newReserva;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (reservaId) => {
    setLoading(true);
    try {
      const updatedReserva = await cancelReservaService(reservaId);
      setReservas(prev => prev.map(r => r.id === reservaId ? updatedReserva : r));
      return updatedReserva;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reservas, loading, error, fetchReservas, createReserva: create, cancelReserva: cancel };
};