import { handleError } from '@/utils/error.utils'
import api from '../api'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZDQ1ZWJkZS05OGQ5LTRlNmQtOTRhYy00ODk3YzhlZDE2NzciLCJ1c2VySWQiOiI2ZDQ1ZWJkZS05OGQ5LTRlNmQtOTRhYy00ODk3YzhlZDE2NzciLCJyb2xlIjoiYWRtaW4iLCJ1c2VyIjp7ImlkIjoiNmQ0NWViZGUtOThkOS00ZTZkLTk0YWMtNDg5N2M4ZWQxNjc3IiwiZW1haWwiOiJuaWNrY2FzdGVsYUBob3RtYWlsLmNvbSIsIm5vbWUiOiJuaWNvbGFzIiwiY3BmIjoiMDU3LjIwMS42NjEtMTQiLCJ0ZWxlZm9uZSI6Iig2NykgOTkxMzMtNjg2OCIsInJvbGUiOiJhZG1pbiJ9LCJpYXQiOjE3NzM3NjA3Mzh9.pr3__9WaiMUxluTaVNLBiaKFqP9R8Jv2r0__pxlQw_4'
class carService {
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

  getCars(only_available: string, fields: string): Promise<any> {
    return this.handleRequest(
      api.get(`/cars?only_available=${only_available}&fields=${fields}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao buscar carros'
    )
  }

  getCarById(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/cars/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao buscar carro'
    )
  }

  getCarsSearch(segmento: string, plano: string, franquia: string): Promise<any> {
    return this.handleRequest(
      api.get(`/cars/search?segmento=${segmento}&plano=${plano}&franquia=${franquia}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao buscar carros'
    )
  }

  patchCarById(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/cars/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao atualizar carro'
    )
  }

  patchCarPhoto(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/cars/${id}/photos`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }),
      'Erro ao atualizar foto do carro'
    )
  }

  patchCarsPricingById(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/cars/${id}/Km-pricing`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao atualizar preço do carro'
    )
  }

  getCarsKmPricing(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/cars/${id}/Km-pricing`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao buscar preço do carro'
    )
  }

  postCarPhoto(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/cars/upload-frota', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }),
      'Erro ao criar foto do carro'
    )
  }

  postCars(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/cars', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao criar carro'
    )
  }

  deleteCarById(id: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/cars/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      'Erro ao deletar carro'
    )
  }

}

export default new carService()
