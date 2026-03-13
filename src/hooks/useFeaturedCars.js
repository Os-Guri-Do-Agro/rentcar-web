import { useState, useEffect } from 'react';
import { fetchFeaturedCars } from '@/services/carService';

export const useFeaturedCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeatured = async () => {
      try {
        setLoading(true);
        const data = await fetchFeaturedCars();
        if (isMounted) setCars(data || []);
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