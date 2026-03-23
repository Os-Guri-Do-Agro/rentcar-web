import { useState, useEffect } from 'react';
import carsDestaqueService from '@/services/cars/destaques/carsDestaque-service';

export const useFeaturedCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeatured = async () => {
      try {
        setLoading(true);
        const res = await carsDestaqueService.getCarsDestaque();
        if (isMounted) setCars(res?.data ?? res ?? []);
      } catch (err) {
        if (isMounted) setError(err);
        console.error("Failed to load featured cars:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFeatured();

    return () => { isMounted = false; };
  }, []);

  return { cars, loading, error };
};