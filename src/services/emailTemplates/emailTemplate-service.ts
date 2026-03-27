import { handleError } from '@/utils/error.utils'
import api from '../api'

class emailTemplateService {
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

  getEmailTemplates(): Promise<any> {
    return this.handleRequest(
      api.get('/email-templates', { headers: this.authHeader() }),
      'Erro ao buscar templates de e-mail'
    )
  }

  getEmailTemplateByTipo(tipo: string): Promise<any> {
    return this.handleRequest(
      api.get(`/email-templates/${tipo}`, { headers: this.authHeader() }),
      'Erro ao buscar template de e-mail'
    )
  }

  putEmailTemplate(tipo: string, data: { assunto: string; corpo: string }): Promise<any> {
    return this.handleRequest(
      api.put(`/email-templates/${tipo}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar template de e-mail'
    )
  }
}

export default new emailTemplateService()
