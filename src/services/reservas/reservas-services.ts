import { handleError } from '@/utils/error.utils'
import api from '../api'

class reservasService {
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

  getReservas(): Promise<any> {
    return this.handleRequest(
      api.get('/reservas', { headers: this.authHeader() }),
      'Erro ao buscar reservas'
    )
  }

  getMyReservas(): Promise<any> {
    return this.handleRequest(
      api.get('/reservas/my', { headers: this.authHeader() }),
      'Erro ao buscar as reservas do usuário logado'
    )
  }

  getReservasById(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/reservas/${id}`, { headers: this.authHeader() }),
      'Erro ao buscar reserva'
    )
  }

  patchStatusReserva(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/reservas/${id}/status`, data, { headers: this.authHeader() }),
      'Erro ao atualizar status da reserva'
    )
  }

  patchCancelReserva(id: string): Promise<any> {
    return this.handleRequest(
      api.patch(`/reservas/${id}/cancel`, {}, { headers: this.authHeader() }),
      'Erro ao cancelar reserva'
    )
  }

  postConfirmReserva(id: string): Promise<any> {
    return this.handleRequest(
      api.post(`/reservas/${id}/confirm`, {}, { headers: this.authHeader() }),
      'Erro ao confirmar reserva'
    )
  }

  postRejectReserva(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/reservas/${id}/reject`, data, { headers: this.authHeader() }),
      'Erro ao rejeitar reserva'
    )
  }

  getHostoryReserva(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/reservas/${id}/history`, { headers: this.authHeader() }),
      'Erro ao buscar histórico da reserva'
    )
  }

  postReserva(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/reservas', data, { headers: this.authHeader() }),
      'Erro ao criar reserva'
    )
  }

  postReservaComArquivos(data: FormData): Promise<any> {
    return this.handleRequest(
      api.post('/reservas/com-arquivos', data, {
        headers: {
          ...this.authHeader(),
          'Content-Type': 'multipart/form-data',
        },
      }),
      'Erro ao criar reserva com arquivos'
    )
  }

  getDowloadDocumento(reservaId: string, documentId: string): Promise<any> {
    return this.handleRequest(
      api.get(`/reservas/${reservaId}/documents/${documentId}/download`, { headers: this.authHeader(), responseType: 'blob' }),
      'Erro ao fazer download do documento'
    )
  }

}

export default new reservasService()
