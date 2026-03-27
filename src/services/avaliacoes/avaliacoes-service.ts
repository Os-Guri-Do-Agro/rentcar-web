import { handleError } from '@/utils/error.utils'
import api from '../api'

class avaliacoesService {
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

  getAvaliacoes(): Promise<any> {
    return this.handleRequest(
      api.get('/avaliacoes', { headers: this.authHeader() }),
      'Erro ao buscar avaliações'
    )
  }

  postAvaliacoes(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/avaliacoes', data, { headers: this.authHeader() }),
      'Erro ao criar avaliação'
    )
  }

  postPhotoAvaliacoes(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/avaliacoes/${id}/photo`, data, {
        headers: { ...this.authHeader(), 'Content-Type': 'multipart/form-data' },
      }),
      'Erro ao criar foto da avaliação'
    )
  }

  patchAvaliacoes(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/avaliacoes/${id}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar avaliação'
    )
  }

  deleteAvaliacoesById(id: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/avaliacoes/${id}`, { headers: this.authHeader() }),
      'Erro ao deletar avaliação'
    )
  }

}

export default new avaliacoesService()
