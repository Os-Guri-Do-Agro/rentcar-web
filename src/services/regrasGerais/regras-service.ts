import { handleError } from '@/utils/error.utils'
import api from '../api'

class regrasService {
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

  getRegras(): Promise<any> {
    return this.handleRequest(
      api.get('/regras', { headers: this.authHeader() }),
      'Erro ao buscar regras'
    )
  }

  postRegas(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/regras', data, { headers: this.authHeader() }),
      'Erro ao cadastrar regra'
    )
  }

  patchRegras(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/regras/${id}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar regra'
    )
  }

  deleteRegras(id: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/regras/${id}`, { headers: this.authHeader() }),
      'Erro ao deletar regra'
    )
  }

}

export default new regrasService()
