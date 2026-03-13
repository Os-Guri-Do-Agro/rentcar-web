import React, { createContext, useContext, useState, useEffect } from 'react';
import { validarDadosReserva } from '@/utils/reservaValidation';

const ReservaContext = createContext(null);

export const useReserva = () => {
  const context = useContext(ReservaContext);
  if (!context) {
    throw new Error('useReserva must be used within a ReservaProvider');
  }
  return context;
};

export const ReservaProvider = ({ children }) => {
  // Main State
  const [tipoReserva, setTipoReservaState] = useState(null);
  const [dadosCarro, setDadosCarroState] = useState(null);
  const [dadosReserva, setDadosReservaState] = useState(null);
  const [dadosUsuario, setDadosUsuarioState] = useState(null);

  useEffect(() => {
    console.log("ReservaProvider initialized");
    // Attempt to hydrate from localStorage
    const saved = localStorage.getItem('reservaContextState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tipoReserva) setTipoReservaState(parsed.tipoReserva);
        if (parsed.dadosCarro) setDadosCarroState(parsed.dadosCarro);
        if (parsed.dadosReserva) setDadosReservaState(parsed.dadosReserva);
        if (parsed.dadosUsuario) setDadosUsuarioState(parsed.dadosUsuario);
        console.log("Contexto restaurado do localStorage");
      } catch (e) {
        console.error("Erro ao restaurar contexto:", e);
      }
    }
  }, []);

  // Persist on change
  useEffect(() => {
    const state = { tipoReserva, dadosCarro, dadosReserva, dadosUsuario };
    localStorage.setItem('reservaContextState', JSON.stringify(state));
  }, [tipoReserva, dadosCarro, dadosReserva, dadosUsuario]);

  // Setters with logging
  const setTipoReserva = (tipo) => {
    console.log(`ReservaContext: Definindo tipo de reserva: ${tipo}`);
    setTipoReservaState(tipo);
  };

  const setDadosCarro = (carro) => {
    console.log("ReservaContext: Definindo dados do carro", carro?.nome);
    setDadosCarroState(carro);
  };

  const setDadosReserva = (dados) => {
    console.log("ReservaContext: Definindo dados da reserva (datas/plano)", dados);
    setDadosReservaState(dados);
  };

  const setDadosUsuario = (usuario) => {
    console.log("ReservaContext: Definindo dados do usuário", usuario?.email);
    setDadosUsuarioState(usuario);
  };

  const getDadosCompletos = () => {
    return {
      tipoReserva,
      carro: dadosCarro,
      reserva: dadosReserva,
      usuario: dadosUsuario
    };
  };

  const limparDados = () => {
    console.log("ReservaContext: Limpando todos os dados");
    setTipoReservaState(null);
    setDadosCarroState(null);
    setDadosReservaState(null);
    setDadosUsuarioState(null);
    localStorage.removeItem('reservaContextState');
  };

  const validarCompleto = () => {
    return validarDadosReserva(getDadosCompletos());
  };

  return (
    <ReservaContext.Provider value={{
      tipoReserva,
      dadosCarro,
      dadosReserva,
      dadosUsuario,
      setTipoReserva,
      setDadosCarro,
      setDadosReserva,
      setDadosUsuario,
      getDadosCompletos,
      limparDados,
      validarCompleto
    }}>
      {children}
    </ReservaContext.Provider>
  );
};