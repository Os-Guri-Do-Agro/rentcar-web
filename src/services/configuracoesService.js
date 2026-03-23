import api from './api';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const getConfiguracoes = async () => {
  const { data } = await api.get('/configuracoes', { headers: authHeader() });
  return data?.data ?? data ?? [];
};

export const getConfiguracao = async (chave) => {
  try {
    const { data } = await api.get(`/config/${chave}`);
    const valor = data?.data?.valor ?? data?.valor;
    return valor != null ? { chave, valor } : null;
  } catch {
    return null;
  }
};

export const getConfiguracaoOuPadrao = async (chave, valorPadrao) => {
  const config = await getConfiguracao(chave);
  return config ? config.valor : valorPadrao;
};

export const updateConfiguracao = async (chave, valor) => {
  const { data } = await api.patch(
    `/configuracoes/${chave}`,
    { valor },
    { headers: authHeader() }
  );
  return data?.data ?? data;
};

export const createConfiguracao = async ({ chave, valor, descricao, tipo }) => {
  const { data } = await api.post(
    '/configuracoes',
    { chave, valor, descricao, tipo },
    { headers: authHeader() }
  );
  return data?.data ?? data;
};
