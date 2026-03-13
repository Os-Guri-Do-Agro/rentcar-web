import { useState, useEffect } from 'react';
import { fetchAllCars } from '@/services/carService';

export const useCars = (filters = {}) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadCars = async () => {
      try {
        setLoading(true);
        // Cached request handled by service layer now
        const data = await fetchAllCars();
        
        if (!isMounted) return;

        let filteredCars = data || [];

        // Client-side filtering
        if (filters.categoria) {
          filteredCars = filteredCars.filter(car => 
            car.categoria.toLowerCase() === filters.categoria.toLowerCase()
          );
        }

        // Client-side sorting
        if (filters.sortBy === 'preco_asc') {
          filteredCars.sort((a, b) => a.preco_diaria - b.preco_diaria);
        } else if (filters.sortBy === 'preco_desc') {
          filteredCars.sort((a, b) => b.preco_diaria - a.preco_diaria);
        }

        setCars(filteredCars);
      } catch (err) {
        if (isMounted) setError(err);
        console.error("Failed to load cars:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCars();
    
    return () => { isMounted = false; };
  }, [filters.categoria, filters.sortBy]);

  return { cars, loading, error };
};