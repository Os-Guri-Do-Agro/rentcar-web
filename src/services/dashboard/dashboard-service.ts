import { handleError } from '@/utils/error.utils'
import api from '../api'

class dashboardService {
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

  getDashboard(): Promise<any> {
    return this.handleRequest(
      api.get('/dashboard', { headers: this.authHeader() }),
      'Erro ao buscar dashboard'
    )
  }
}

export default new dashboardService()
