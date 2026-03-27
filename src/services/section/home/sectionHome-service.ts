import { handleError } from '@/utils/error.utils'
import api from '../../api'

class sectionService {
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

  getHomeSection(): Promise<any> {
    return this.handleRequest(
      api.get('/secoes', { headers: this.authHeader() }),
      'Erro ao buscar seções'
    )
  }

  patchHomeSectionById(slug: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/secoes/${slug}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar seção'
    )
  }

  deleteHomeSecionCardSlug(slug: string, cardId: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/secoes/${slug}/cards/${cardId}`, { headers: this.authHeader() }),
      'Erro ao deletar card da seção'
    )
  }

  postHomeSectionCard(slug: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/secoes/${slug}/cards`, data, { headers: this.authHeader() }),
      'Erro ao criar card na seção'
    )
  }

}

export default new sectionService()
