import api from './api';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const getAllConteudo = async () => {
  const { data } = await api.get('/conteudo');
  return data?.data ?? data ?? [];
};

export const getConteudo = async (slug) => {
  try {
    const { data } = await api.get(`/conteudo/${slug}`);
    return data?.data ?? data ?? null;
  } catch {
    return null;
  }
};

export const getConteudoById = async (id) => {
  const { data } = await api.get(`/conteudo/id/${id}`);
  return data?.data ?? data ?? null;
};

export const createConteudo = async (slug, titulo, conteudo) => {
  const { data } = await api.post(
    '/conteudo',
    { slug, titulo, conteudo },
    { headers: authHeader() }
  );
  return data?.data ?? data;
};

export const updateConteudoById = async (id, payload) => {
  const { data } = await api.patch(
    `/conteudo/id/${id}`,
    payload,
    { headers: authHeader() }
  );
  return data?.data ?? data;
};

export const deleteConteudoById = async (id) => {
  await api.delete(`/conteudo/id/${id}`, { headers: authHeader() });
};
