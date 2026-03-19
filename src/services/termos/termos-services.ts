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
      api.get('/termos', { headers: this.authHeader() }),
      'Erro ao buscar termos'
    )
  }

}

export default new termosService()
