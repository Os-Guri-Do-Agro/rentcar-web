import { handleError } from '@/utils/error.utils'
import api from '../api'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZDQ1ZWJkZS05OGQ5LTRlNmQtOTRhYy00ODk3YzhlZDE2NzciLCJ1c2VySWQiOiI2ZDQ1ZWJkZS05OGQ5LTRlNmQtOTRhYy00ODk3YzhlZDE2NzciLCJyb2xlIjoiYWRtaW4iLCJ1c2VyIjp7ImlkIjoiNmQ0NWViZGUtOThkOS00ZTZkLTk0YWMtNDg5N2M4ZWQxNjc3IiwiZW1haWwiOiJuaWNrY2FzdGVsYUBob3RtYWlsLmNvbSIsIm5vbWUiOiJuaWNvbGFzIiwiY3BmIjoiMDU3LjIwMS42NjEtMTQiLCJ0ZWxlZm9uZSI6Iig2NykgOTkxMzMtNjg2OCIsInJvbGUiOiJhZG1pbiJ9LCJpYXQiOjE3NzM3NjA3Mzh9.pr3__9WaiMUxluTaVNLBiaKFqP9R8Jv2r0__pxlQw_4'
class userService {
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
      api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }), 
      'Erro ao buscar usuário'
    )
  }

  getClientPagined(search: string, todos: boolean, page: string, limit: string): Promise<any> {
    return this.handleRequest(
      api.get(`/users/pagination?search=${search}&todos=${todos}&page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao buscar usuários'
    )
  }

  getUserById(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao buscar usuário'
    )
  }

  patchUserById(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/users/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao atualizar usuário'
    )
  }

  postUserAvatar(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/users/me/avatar', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }),
      'Erro ao atualizar avatar do usuário'
    )
  }

}

export default new userService()
