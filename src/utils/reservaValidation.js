export const validarDadosCarro = (dadosCarro) => {
  const erros = [];
  if (!dadosCarro) {
    erros.push("Dados do carro não encontrados");
    console.log("Validação Carro: Dados ausentes");
    return { valid: false, erros };
  }
  if (!dadosCarro.id) erros.push("ID do carro obrigatório");
  if (!dadosCarro.nome) erros.push("Nome do carro obrigatório");
  if (!dadosCarro.marca) erros.push("Marca do carro obrigatória");

  const valid = erros.length === 0;
  console.log(`Validação Carro: ${valid ? "OK" : "Falhou"}`, erros);
  return { valid, erros };
};

export const validarDadosUsuario = (dadosUsuario) => {
  const erros = [];
  if (!dadosUsuario) {
    erros.push("Dados do usuário não preenchidos");
    console.log("Validação Usuário: Dados ausentes");
    return { valid: false, erros };
  }
  if (!dadosUsuario.nome) erros.push("Nome completo obrigatório");
  if (!dadosUsuario.email) erros.push("E-mail obrigatório");
  if (!dadosUsuario.telefone) erros.push("Telefone obrigatório");
  if (!dadosUsuario.cpf) erros.push("CPF obrigatório");
  if (!dadosUsuario.cnh) erros.push("CNH obrigatória");
  
  // Optional address validation depending on strictness, assuming required based on prompt "address"
  if (!dadosUsuario.endereco_rua) erros.push("Endereço obrigatório");

  const valid = erros.length === 0;
  console.log(`Validação Usuário: ${valid ? "OK" : "Falhou"}`, erros);
  return { valid, erros };
};

export const validarDadosReservaBasico = (dadosReserva) => {
  const erros = [];
  if (!dadosReserva) {
    erros.push("Detalhes da reserva não encontrados");
    console.log("Validação Reserva Básica: Dados ausentes");
    return { valid: false, erros };
  }
  if (!dadosReserva.dataInicio) erros.push("Data de retirada obrigatória");
  if (!dadosReserva.dataFim) erros.push("Data de devolução obrigatória");
  if (!dadosReserva.plano) erros.push("Plano selecionado obrigatório");
  if (!dadosReserva.valorTotal || dadosReserva.valorTotal <= 0) erros.push("Valor total inválido");

  const valid = erros.length === 0;
  console.log(`Validação Reserva Básica: ${valid ? "OK" : "Falhou"}`, erros);
  return { valid, erros };
};

export const validarDadosReserva = (dadosCompleto) => {
  console.log("Iniciando validação completa da reserva...");
  
  const valCarro = validarDadosCarro(dadosCompleto.carro);
  const valUsuario = validarDadosUsuario(dadosCompleto.usuario);
  const valReserva = validarDadosReservaBasico(dadosCompleto.reserva);

  const erros = [
    ...valCarro.erros,
    ...valUsuario.erros,
    ...valReserva.erros
  ];

  if (!dadosCompleto.tipoReserva) erros.push("Tipo de reserva não definido");

  const valid = erros.length === 0;
  console.log(`Validação Completa: ${valid ? "Válido" : "Inválido"}`, erros);
  return { valid, erros };
};

export const obterCamposFaltando = (dadosCompleto) => {
  const { erros } = validarDadosReserva(dadosCompleto);
  return erros;
};