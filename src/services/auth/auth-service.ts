import { handleError } from '@/utils/error.utils'
import api from '../api'

class authService {
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

  postLogin(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/auth/login', data),
      'Erro ao fazer login'
    )
  }

  postRegister(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/auth/register', data),
      'Erro ao fazer registro'
    )
  }

  postConfirmarEmail(data: { token_hash: string }): Promise<any> {
    return this.handleRequest(
      api.post('/auth/confirmar-email', data),
      'Erro ao confirmar e-mail'
    )
  }

  postReenviarConfirmacao(data: { email: string }): Promise<any> {
    return this.handleRequest(
      api.post('/auth/reenviar-confirmacao', data),
      'Erro ao reenviar confirmação'
    )
  }

  postEsqueceuSenha(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/auth/esqueceu-senha', data),
      'Erro ao solicitar redefinição de senha'
    )
  }

  postVerificarCodigo(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/auth/verificar-codigo', data),
      'Erro ao verificar código'
    )
  }

  postRedefinirSenha(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/auth/redefinir-senha', data),
      'Erro ao redefinir senha'
    )
  }

}

export default new authService()
