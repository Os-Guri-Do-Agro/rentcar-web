import { handleError } from '@/utils/error.utils'
import api from '../../api'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZDQ1ZWJkZS05OGQ5LTRlNmQtOTRhYy00ODk3YzhlZDE2NzciLCJ1c2VySWQiOiI2ZDQ1ZWJkZS05OGQ5LTRlNmQtOTRhYy00ODk3YzhlZDE2NzciLCJyb2xlIjoiYWRtaW4iLCJ1c2VyIjp7ImlkIjoiNmQ0NWViZGUtOThkOS00ZTZkLTk0YWMtNDg5N2M4ZWQxNjc3IiwiZW1haWwiOiJuaWNrY2FzdGVsYUBob3RtYWlsLmNvbSIsIm5vbWUiOiJuaWNvbGFzIiwiY3BmIjoiMDU3LjIwMS42NjEtMTQiLCJ0ZWxlZm9uZSI6Iig2NykgOTkxMzMtNjg2OCIsInJvbGUiOiJhZG1pbiJ9LCJpYXQiOjE3NzM3NjA3Mzh9.pr3__9WaiMUxluTaVNLBiaKFqP9R8Jv2r0__pxlQw_4'
class sectionService {
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
      api.get('/secoes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }), 
      'Erro ao buscar seções'
    )
  }

  patchHomeSectionById(slug: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/secoes/${slug}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao atualizar seção'
    )
  }

  deleteHomeSecionCardSlug(slug: string, cardId: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/secoes/${slug}/cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao deletar card da seção'
    )
  }

  postHomeSectionCard(slug: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/secoes/${slug}/cards`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao criar card na seção'
    )
  }

}

export default new sectionService()
