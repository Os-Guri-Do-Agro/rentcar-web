import { handleError } from '@/utils/error.utils'
import api from '../../api'

class carDestaqueService {
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

  getCarsDestaque(): Promise<any> {
    return this.handleRequest(
      api.get('/destaque', { headers: this.authHeader() }),
      'Erro ao buscar carros em destaque'
    )
  }

}

export default new carDestaqueService()
