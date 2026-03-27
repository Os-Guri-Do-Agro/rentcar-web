import { handleError } from '@/utils/error.utils'
import api from '../../api'

class categoriaBlogService {
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

  getCategoriaBlog(): Promise<any> {
    return this.handleRequest(
      api.get('/categoria-blog', { headers: this.authHeader() }),
      'Erro ao buscar categorias dos blogs'
    )
  }

  postCategoriaBlog(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/categoria-blog', data, { headers: this.authHeader() }),
      'Erro ao criar categoria para blog'
    )
  }

  getCategoriaBlogAdmin(): Promise<any> {
    return this.handleRequest(
      api.get('/categoria-blog/admin', { headers: this.authHeader() }),
      'Erro ao buscar categorias dos blogs'
    )
  }

  getCategoriaBlogById(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/categoria-blog/${id}`, { headers: this.authHeader() }),
      'Erro ao buscar categoria dos blogs por id'
    )
  }

  patchCategoriaBlog(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/categoria-blog/${id}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar categoria dos blogs'
    )
  }

  deleteCategoriaBlogById(id: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/categoria-blog/${id}`, { headers: this.authHeader() }),
      'Erro ao deletar categoria dos blogs'
    )
  }

  patchCategoriaBlogToggle(id: string, currentStatus: boolean): Promise<any> {
    return this.handleRequest(
      api.patch(`/categoria-blog/${id}/toggle`, { currentStatus }, { headers: this.authHeader() }),
      'Erro ao atualizar categoria dos blogs'
    )
  }
  
}

export default new categoriaBlogService()
