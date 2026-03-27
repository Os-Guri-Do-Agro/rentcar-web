import { handleError } from '@/utils/error.utils'
import api from '../api'

class validadorService {
  private getToken() {
    return localStorage.getItem('token')
  }

  private authHeader() {
    return { Authorization: `Bearer ${this.getToken()}` }
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

  postValidadorCpf(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/validador/cpf', data),
      'Erro ao validar cpf'
    )
  }

  postValidadorEmail(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/validador/email', data),
      'Erro ao validar email'
    )
  }

  postValidadorCnh(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/validador/cnh', data),
      'Erro ao validar cnh'
    )
  }

}

export default new validadorService()
