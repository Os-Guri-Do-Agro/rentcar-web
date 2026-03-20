import { handleError } from '@/utils/error.utils'
import api from '../../api'

class documentosService {
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

  getDocumentosByReservaId(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/reservas/${id}/documents`, { headers: this.authHeader() }),
      'Erro ao buscar documentos da reserva'
    )
  }

  postDocumentsUpload(reservaId: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/reservas/${reservaId}/documents/upload`, data, { headers: this.authHeader() }),
      'Erro ao fazer upload dos documentos'
    )
  }

  postDcoumentsSave(reservaId: string): Promise<any> {
    return this.handleRequest(
      api.post(`/reservas/${reservaId}/documents/save`, { headers: this.authHeader() }),
      'Erro ao salvar documentos'
    )
  }

}

export default new documentosService()
