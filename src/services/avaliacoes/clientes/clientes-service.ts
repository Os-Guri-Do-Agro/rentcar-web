import { handleError } from '@/utils/error.utils'
import api from '../../api'

class clientesService {
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

  getClientesAvaliacao(clienteId: string): Promise<any> {
    return this.handleRequest(
      api.get(`/clientes/${clienteId}/avaliacao`, { headers: this.authHeader() }),
      'Erro ao buscar avaliações do cliente'
    )
  }

  postClientesAvaliacao(clienteId: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/clientes/${clienteId}/avaliacao`, data, { headers: this.authHeader() }),
      'Erro ao criar avaliação para o cliente'
    )
  }

  patchClientesAvaliacao(clienteId: string, clienteAvaliacaoId: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/clientes/${clienteId}/avaliacao/${clienteAvaliacaoId}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar avaliação do cliente'
    )
  }

  deleteClientesAvaliacaoById(clienteId: string, clienteAvaliacaoId: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/clientes/${clienteId}/avaliacao/${clienteAvaliacaoId}`, { headers: this.authHeader() }),
      'Erro ao deletar avaliação do cliente'
    )
  }

}

export default new clientesService()
