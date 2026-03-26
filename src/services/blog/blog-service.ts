import { handleError } from '@/utils/error.utils'
import api from '../api'

class blogService {
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

  getBlog(): Promise<any> {
    return this.handleRequest(
      api.get('/blog', { headers: this.authHeader() }),
      'Erro ao buscar blog'
    )
  }

  getBlogPagination(title: string, categoriaId: string, page: number, limit: number): Promise<any> {
    return this.handleRequest(
      api.get(`/blog/pagination?title=${title}&categoriaID=${categoriaId}&page=${page}&limit=${limit}`, { headers: this.authHeader() }),
      'Erro ao buscar blog'
    )
  }

  postBlog(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/blog', data, { headers: this.authHeader() }),
      'Erro ao criar blog'
    )
  }

  getBlogAdmin(): Promise<any> {
    return this.handleRequest(
      api.get('/blog/admin', { headers: this.authHeader() }),
      'Erro ao buscar blog'
    )
  }

  getBlogById(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/blog/${id}`, { headers: this.authHeader() }),
      'Erro ao buscar blog por id'
    )
  }

  deleteBlogById(id: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/blog/${id}`, { headers: this.authHeader() }),
      'Erro ao deletar blog'
    )
  }

  patchBlog(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/blog/${id}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar blog'
    )
  }

  postBlogPhoto(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/blog/${id}/photo`, data, {
        headers: { ...this.authHeader(), 'Content-Type': 'multipart/form-data' },
      }),
      'Erro ao criar foto do blog'
    )
  }

  patchBlogToggle(id: string, currentStatus: boolean): Promise<any> {
    return this.handleRequest(
      api.patch(`/blog/${id}/toggle`, { currentStatus }, { headers: this.authHeader() }),
      'Erro ao atualizar blog'
    )
  }

  
}

export default new blogService()
