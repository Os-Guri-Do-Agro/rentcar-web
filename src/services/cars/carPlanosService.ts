import { handleError } from '@/utils/error.utils'
import api from '../api'

export type TipoLocacao = 'particular' | 'motorista' | 'corporativo'
export type CategoriaPlano = 'diario' | 'semanal' | 'trimestral' | 'semestral' | 'anual'

export interface CarPlano {
  id: string
  carro_id: string
  tipo: TipoLocacao
  categoria: CategoriaPlano
  km_franquia: number
  preco: number
  ativo: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface CarPlanosPorTipo {
  particular: CarPlano[]
  motorista: CarPlano[]
  corporativo: CarPlano[]
}

export interface CreateCarPlanoDto {
  carro_id: string
  tipo: TipoLocacao
  categoria: CategoriaPlano
  km_franquia: number
  preco: number
  ativo?: boolean
}

export interface UpdateCarPlanoDto {
  tipo?: TipoLocacao
  categoria?: CategoriaPlano
  km_franquia?: number
  preco?: number
  ativo?: boolean
}

export interface CarPlanosListResponse {
  data: CarPlano[]
  total: number
}

export interface CarPlanosEstatisticas {
  total: number
  ativos: number
  inativos: number
  por_tipo: Record<TipoLocacao, number>
  por_categoria: Record<CategoriaPlano, number>
  faixa_preco: {
    minimo: number
    maximo: number
    media: number
  }
}

class CarPlanosService {
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

  /** GET /car-planos - lista com filtros opcionais */
  getPlanos(params?: {
    tipo?: TipoLocacao
    categoria?: CategoriaPlano
    carro_id?: string
    km_franquia?: number
    precoMin?: number
    precoMax?: number
    ativo?: boolean
  }): Promise<CarPlanosListResponse> {
    const query = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : ''
    return this.handleRequest(
      api.get(`/car-planos${query}`, { headers: this.authHeader() }),
      'Erro ao buscar planos'
    )
  }

  /** GET /car-planos/carro/:carroId - planos de um carro, agrupados por tipo */
  getPlanosByCarroId(carroId: string): Promise<any> {
    return this.handleRequest(
      api.get(`/car-planos/carro/${carroId}`, { headers: this.authHeader() }),
      'Erro ao buscar planos do carro'
    )
  }

  /** GET /car-planos/estatisticas */
  getEstatisticas(): Promise<{ data: CarPlanosEstatisticas }> {
    return this.handleRequest(
      api.get('/car-planos/estatisticas', { headers: this.authHeader() }),
      'Erro ao buscar estatísticas'
    )
  }

  /** GET /car-planos/filter?tipo=...&categoria=...&carro_id=... */
  getPlanosFiltro(tipo: TipoLocacao, categoria?: CategoriaPlano, carroId?: string): Promise<CarPlanosListResponse> {
    const params = new URLSearchParams({ tipo })
    if (categoria) params.set('categoria', categoria)
    if (carroId)   params.set('carro_id', carroId)
    return this.handleRequest(
      api.get(`/car-planos/filter?${params.toString()}`, { headers: this.authHeader() }),
      'Erro ao filtrar planos'
    )
  }

  /** GET /car-planos/preco/:min/:max */
  getPlanosByFaixaPreco(min: number, max: number): Promise<CarPlanosListResponse> {
    return this.handleRequest(
      api.get(`/car-planos/preco/${min}/${max}`, { headers: this.authHeader() }),
      'Erro ao buscar planos por preço'
    )
  }

  /** GET /car-planos/:id */
  getPlanoById(id: string): Promise<{ data: CarPlano }> {
    return this.handleRequest(
      api.get(`/car-planos/${id}`, { headers: this.authHeader() }),
      'Erro ao buscar plano'
    )
  }

  /** POST /car-planos */
  createPlano(data: CreateCarPlanoDto): Promise<{ data: CarPlano }> {
    return this.handleRequest(
      api.post('/car-planos', data, { headers: this.authHeader() }),
      'Erro ao criar plano'
    )
  }

  /** PATCH /car-planos/:id */
  updatePlano(id: string, data: UpdateCarPlanoDto): Promise<{ data: CarPlano }> {
    return this.handleRequest(
      api.patch(`/car-planos/${id}`, data, { headers: this.authHeader() }),
      'Erro ao atualizar plano'
    )
  }

  /** PATCH /car-planos/:id/toggle */
  togglePlano(id: string, currentStatus: boolean): Promise<{ data: CarPlano }> {
    return this.handleRequest(
      api.patch(`/car-planos/${id}/toggle`, { currentStatus }, { headers: this.authHeader() }),
      'Erro ao alternar status do plano'
    )
  }

  /** DELETE /car-planos/:id */
  deletePlano(id: string): Promise<void> {
    return this.handleRequest(
      api.delete(`/car-planos/${id}`, { headers: this.authHeader() }),
      'Erro ao remover plano'
    )
  }
}

export default new CarPlanosService()
