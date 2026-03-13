import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FrotaParticular = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/frota');
  }, [navigate]);

  return null;
};

export default FrotaParticular;