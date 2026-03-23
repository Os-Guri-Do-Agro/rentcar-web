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

  postCarsDestaque(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/destaque', data, { headers: this.authHeader() }),
      'Erro ao cadastrar carro em destaque'
    )
  }

  deleteCarsDestaque(carroId : string): Promise<any> {
    return this.handleRequest(
      api.delete(`/destaque/${carroId }`, { headers: this.authHeader() }),
      'Erro ao remover carro em destaque'
    )
  }

  patchCarsReorder(data: any): Promise<any> {
    return this.handleRequest(
      api.patch('/destaque/reorder', data, { headers: this.authHeader() }),
      'Erro ao reorder carros em destaque'
    )
  }

}

export default new carDestaqueService()
