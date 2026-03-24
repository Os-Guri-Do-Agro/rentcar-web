import { handleError } from '@/utils/error.utils'
import api from '../api'

class WhatsappService {
  private authHeader() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }

  private async handleRequest<T>(
    request: Promise<{ data: T }>,
    errorMessage: string
  ): Promise<T> {
    try {
      const { data } = await request
      return data
    } catch (error: any) {
      handleError(`${errorMessage}: ${error.message}`, error)
      throw error
    }
  }

  // GET /whatsapp/status → { success, data: { conectado, estado } }
  getStatus(): Promise<any> {
    return this.handleRequest(
      api.get('/whatsapp/status', { headers: this.authHeader() }),
      'Erro ao buscar status do WhatsApp'
    )
  }

  // GET /whatsapp/chats
  getChats(): Promise<any> {
    return this.handleRequest(
      api.get('/whatsapp/chats', { headers: this.authHeader() }),
      'Erro ao buscar chats'
    )
  }

  // GET /whatsapp/mensagens/:remoteJid?page=1&limit=50
  getMensagens(remoteJid: string, page = 1, limit = 50): Promise<any> {
    return this.handleRequest(
      api.get(`/whatsapp/mensagens/${encodeURIComponent(remoteJid)}`, {
        headers: this.authHeader(),
        params: { page, limit },
      }),
      'Erro ao buscar mensagens'
    )
  }

  // GET /whatsapp/logs?page=1&limit=50&search=...
  getLogs(page = 1, limit = 50, search?: string): Promise<any> {
    return this.handleRequest(
      api.get('/whatsapp/logs', {
        headers: this.authHeader(),
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      'Erro ao buscar logs de WhatsApp'
    )
  }

  // POST /whatsapp/enviar
  postEnviar(data: { number: string; text: string; reservaId?: string }): Promise<any> {
    return this.handleRequest(
      api.post('/whatsapp/enviar', data, { headers: this.authHeader() }),
      'Erro ao enviar mensagem'
    )
  }

  // POST /whatsapp/enviar-imagem
  postEnviarImagem(data: {
    number: string
    imageUrl: string
    caption?: string
    reservaId?: string
  }): Promise<any> {
    return this.handleRequest(
      api.post('/whatsapp/enviar-imagem', data, { headers: this.authHeader() }),
      'Erro ao enviar imagem'
    )
  }

  // POST /whatsapp/enviar-documento
  postEnviarDocumento(data: {
    number: string
    documentUrl: string
    fileName: string
    caption?: string
    reservaId?: string
  }): Promise<any> {
    return this.handleRequest(
      api.post('/whatsapp/enviar-documento', data, { headers: this.authHeader() }),
      'Erro ao enviar documento'
    )
  }

  // POST /whatsapp/enviar-localizacao
  postEnviarLocalizacao(data: {
    number: string
    latitude: number
    longitude: number
    name: string
    address: string
    reservaId?: string
  }): Promise<any> {
    return this.handleRequest(
      api.post('/whatsapp/enviar-localizacao', data, { headers: this.authHeader() }),
      'Erro ao enviar localização'
    )
  }

  // POST /whatsapp/verificar-numero → { success, data: { existe, jid } }
  postVerificarNumero(data: { number: string }): Promise<any> {
    return this.handleRequest(
      api.post('/whatsapp/verificar-numero', data, { headers: this.authHeader() }),
      'Erro ao verificar número'
    )
  }
}

export default new WhatsappService()
