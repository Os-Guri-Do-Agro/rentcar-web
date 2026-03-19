import { handleError } from '@/utils/error.utils'
import api from '../api'

class userService {
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

  getUsersMe(): Promise<any> {
    return this.handleRequest(
      api.get('/users/me', { headers: this.authHeader() }),
      'Erro ao buscar usuário'
    )
  }

  getClientPagined(search: string, todos: boolean, page: string, limit: string): Promise<any> {
    return this.handleRequest(
      api.get(`/users/pagination?search=${search}&todos=${todos}&page=${page}&limit=${limit}`, { headers: this.authHeader() }),
      'Erro ao buscar usuários'
    )
  }

  getUserById(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/users/${id}`, { headers: this.authHeader() }),
      'Erro ao buscar usuário'
    )
  }

  patchUserById(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/users/${id}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar usuário'
    )
  }

  postUserAvatar(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/users/me/avatar', data, {
        headers: { ...this.authHeader(), 'Content-Type': 'multipart/form-data' },
      }),
      'Erro ao atualizar avatar do usuário'
    )
  }

}

export default new userService()
