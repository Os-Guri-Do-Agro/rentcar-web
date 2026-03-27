export interface PlanosAgrupados {
    particular: any[]
    motorista: any[]
    corporativo: any[]
}

const EMPTY: PlanosAgrupados = { particular: [], motorista: [], corporativo: [] };

/**
 * Normaliza a resposta de getPlanosByCarroId para um objeto agrupado por tipo,
 * suportando os formatos: { agrupado_por_tipo }, { planos: [] } e array direto.
 */
export function parseCarPlanosResponse(res: any): PlanosAgrupados {
    const data = res?.data ?? res ?? {};

    if (data.agrupado_por_tipo) {
        return {
            particular:  data.agrupado_por_tipo.particular  ?? [],
            motorista:   data.agrupado_por_tipo.motorista   ?? [],
            corporativo: data.agrupado_por_tipo.corporativo ?? [],
        };
    }

    const list: any[] = Array.isArray(data.planos) ? data.planos
        : Array.isArray(data) ? data
        : null;

    if (!list) return EMPTY;

    const grouped: PlanosAgrupados = { particular: [], motorista: [], corporativo: [] };
    list.forEach(p => { if (grouped[p.tipo as keyof PlanosAgrupados]) grouped[p.tipo as keyof PlanosAgrupados].push(p); });
    return grouped;
}
