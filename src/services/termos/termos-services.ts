import { handleError } from '@/utils/error.utils'
import api from '../api'

class termosService {
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

  getTermos(): Promise<any> {
    return this.handleRequest(
      api.get('/termos'),
      'Erro ao buscar termos'
    )
  }

  postTermo(data: { titulo: string; conteudo: string; secao: string }): Promise<any> {
    return this.handleRequest(
      api.post('/termos', data, { headers: this.authHeader() }),
      'Erro ao criar termo'
    )
  }

  patchTermo(id: string, data: Partial<{ titulo: string; conteudo: string; secao: string }>): Promise<any> {
    return this.handleRequest(
      api.patch(`/termos/${id}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar termo'
    )
  }

  deleteTermo(id: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/termos/${id}`, { headers: this.authHeader() }),
      'Erro ao excluir termo'
    )
  }

}

export default new termosService()
