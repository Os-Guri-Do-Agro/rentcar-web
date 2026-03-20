import { handleError } from '@/utils/error.utils'
import api from '../api'

class carService {
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

  getCars(only_available: string, fields: string): Promise<any> {
    return this.handleRequest(
      api.get(`/cars?only_available=${only_available}&fields=${fields}`, { headers: this.authHeader() }),
      'Erro ao buscar carros'
    )
  }

  getCarById(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/cars/${id}`, { headers: this.authHeader() }),
      'Erro ao buscar carro'
    )
  }

  getCarsSearch(segmento: string, plano: string, franquia: string): Promise<any> {
    const params = new URLSearchParams({ only_available: 'false' })
    if (segmento) params.set('segmento', segmento)
    if (plano)    params.set('plano', plano)
    if (franquia) params.set('franquia', franquia)
    return this.handleRequest(
      api.get(`/cars/search?${params.toString()}`, { headers: this.authHeader() }),
      'Erro ao buscar carros'
    )
  }

  patchCarById(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/cars/${id}`, data, { headers: this.authHeader(), maxRedirects: 0 }),
      'Erro ao atualizar carro'
    )
  }

  patchCarPhoto(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.post(`/cars/${id}/photos`, data, {
        headers: { ...this.authHeader(), 'Content-Type': 'multipart/form-data' },
      }),
      'Erro ao atualizar foto do carro'
    )
  }

  patchCarsPricingById(id: string, data: any): Promise<any> {
    return this.handleRequest(
      api.patch(`/cars/${id}/Km-pricing`, data, { headers: this.authHeader() }),
      'Erro ao atualizar preço do carro'
    )
  }

  getCarsKmPricing(id: string): Promise<any> {
    return this.handleRequest(
      api.get(`/cars/${id}/Km-pricing`, { headers: this.authHeader() }),
      'Erro ao buscar preço do carro'
    )
  }

  postCarPhoto(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/cars/upload-frota', data, {
        headers: { ...this.authHeader(), 'Content-Type': 'multipart/form-data' },
      }),
      'Erro ao criar foto do carro'
    )
  }

  postCars(data: any): Promise<any> {
    return this.handleRequest(
      api.post('/cars', data, { headers: this.authHeader() }),
      'Erro ao criar carro'
    )
  }

  deleteCarById(id: string): Promise<any> {
    return this.handleRequest(
      api.delete(`/cars/${id}`, { headers: this.authHeader() }),
      'Erro ao deletar carro'
    )
  }

  getCarsPagination(search: string, page: string, limit: string): Promise<any> {
    return this.handleRequest(
      api.get(`/cars/pagination?search=${search}&page=${page}&limit=${limit}`, { headers: this.authHeader() }),
      'Erro ao buscar carros'
    )
  }

}

export default new carService()
