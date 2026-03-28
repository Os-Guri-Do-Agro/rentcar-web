import api from './api'

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

const DEFAULTS = {
  whatsapp: '5511913123870',
  email: 'adm@jlrentacar.com.br',
  telefone: '(11) 91312-3870',
  endereco: 'Rua Fernando Falcão, 54 - Mooca, São Paulo - SP',
  horario: 'Segunda a Sexta: 08h às 18h',
  instagram: 'https://www.instagram.com/jlrentacarsp/',
  facebook: 'https://www.facebook.com/profile.php?id=61584407205265',
}

// --- Public config read — GET /config/:chave ---
export const getConfig = async (chave: string, fallback?: string): Promise<string | undefined> => {
  try {
    const { data, status } = await api.get(`/config/${chave}`, {
      validateStatus: (s: number) => s < 500,
    })
    if (status === 404) return fallback
    const valor = data?.data?.valor ?? data?.valor
    return valor ?? fallback
  } catch {
    return fallback
  }
}

// --- Admin write — PUT /config/:chave ---
export const updateConfig = async (
  chave: string,
  valor: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    await api.put(`/config/${chave}`, { valor }, { headers: authHeader() })
    return { success: true, error: null }
  } catch (error: any) {
    console.error(`[configService] Error updating '${chave}':`, error)
    return { success: false, error: error.message }
  }
}

// --- Admin configs (admin_configs table) ---
export const getAdminConfigs = async (): Promise<Record<string, string>> => {
  const { data } = await api.get('/admin/configs', { headers: authHeader() })
  return data?.data ?? data ?? {}
}

export const putAdminConfig = async (chave: string, valor: string): Promise<void> => {
  await api.put('/admin/configs', { chave, valor }, { headers: authHeader() })
}

// --- Named shortcuts (public read) ---
export const getWhatsAppNumber       = () => getConfig('whatsapp_numero',     DEFAULTS.whatsapp)
export const getEmailSuporte         = () => getConfig('email_contato',       DEFAULTS.email)
export const getTelefoneSuporte      = () => getConfig('company_phone',       DEFAULTS.telefone)
export const getEnderecoEmpresa      = () => getConfig('endereco',            DEFAULTS.endereco)
export const getHorarioFuncionamento = () => getConfig('horario_atendimento', DEFAULTS.horario)
export const getInstagram            = () => getConfig('instagram',           DEFAULTS.instagram)
export const getFacebook             = () => getConfig('facebook',            DEFAULTS.facebook)


export const getKmPricing = async () => ({
  success: true,
  data: { preco_km_extra: await getConfig('global_km_price', '0.50') },
})

export const updateKmPricing = async (data: { preco_km_extra: string }) =>
  updateConfig('global_km_price', data.preco_km_extra)
