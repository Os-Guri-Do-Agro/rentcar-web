import { handleError } from '@/utils/error.utils'
import api from './api'

class ConteudoService {
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

  getAll(): Promise<any> {
    return this.handleRequest(
      api.get('/conteudo'),
      'Erro ao buscar conteúdo'
    )
  }

  async getBySlug(slug: string): Promise<any> {
    try {
      const data = await this.handleRequest(
        api.get(`/conteudo/${slug}`),
        'Erro ao buscar conteúdo'
      )
      return (data as any)?.data ?? data ?? null
    } catch {
      return null
    }
  }

  getById(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/conteudo/id/${id}`),
      'Erro ao buscar conteúdo'
    )
  }

  create(slug: string, titulo: string, conteudo: string): Promise<any> {
    return this.handleRequest(
      api.post('/conteudo', { slug, titulo, conteudo }, { headers: this.authHeader() }),
      'Erro ao criar conteúdo'
    )
  }

  updateById(id: string, payload: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/conteudo/id/${id}`, payload, { headers: this.authHeader() }),
      'Erro ao atualizar conteúdo'
    )
  }

  deleteById(id: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/conteudo/id/${id}`, { headers: this.authHeader() }),
      'Erro ao deletar conteúdo'
    )
  }
}

const conteudoService = new ConteudoService()
export default conteudoService

// Named exports for backward compatibility
export const getAllConteudo      = () => conteudoService.getAll().then((res: any) => res?.data ?? res ?? [])
export const getConteudo         = (slug: string) => conteudoService.getBySlug(slug)
export const getConteudoById     = (id: string) => conteudoService.getById(id)
export const createConteudo      = (slug: string, titulo: string, conteudo: string) => conteudoService.create(slug, titulo, conteudo)
export const updateConteudoById  = (id: string, payload: any) => conteudoService.updateById(id, payload)
export const deleteConteudoById  = (id: string) => conteudoService.deleteById(id)
