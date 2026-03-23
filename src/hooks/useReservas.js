import { useState, useCallback } from 'react';
import reservasService from '@/services/reservas/reservas-services';

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservas = useCallback(async (userId) => {
    setLoading(true);
    try {
      const res = await reservasService.getMyReservas();
      setReservas(res?.data ?? res ?? []);
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
      const res = await reservasService.postReserva({ usuario_id: userId, carro_id: carId, data_retirada: dataInicio, data_devolucao: dataFim, valor_total: valorTotal });
      const newReserva = res?.data ?? res;
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
      const res = await reservasService.patchCancelReserva(reservaId);
      const updatedReserva = res?.data ?? res;
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