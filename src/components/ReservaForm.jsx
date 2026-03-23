import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertTriangle, Gauge, Users, Car, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DateRangeSelector from './DateRangeSelector';
import ResumoPrecoSimulacao from './ResumoPrecoSimulacao';
import { calcularDataDevolucao, calcularDuracao } from '@/services/reservaService';
import { CATEGORIAS, KM_OPCOES } from '@/constants/carPlanos';
import carPlanosService from '@/services/cars/carPlanosService';
import { useReserva } from '@/context/ReservaContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const TIPO_CONFIG = {
    particular:  { label: 'Particular',    icon: Users,     activeClass: 'border-blue-500 bg-blue-50 text-blue-800' },
    motorista:   { label: 'Motorista App', icon: Car,       activeClass: 'border-green-500 bg-green-50 text-green-800' },
    corporativo: { label: 'Corporativo',   icon: Building2, activeClass: 'border-purple-500 bg-purple-50 text-purple-800' },
};

// Mapa de km_franquia → label legível (fallback para valores não listados no constants)
const KM_LABEL_MAP = Object.fromEntries(KM_OPCOES.map(o => [o.value, o.label]));
const kmLabel = (km) => KM_LABEL_MAP[km] ?? (km === 0 ? 'KM Livre' : `${km.toLocaleString('pt-BR')} KM`);

const ReservaForm = ({ car }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { setDadosReserva, setTipoReserva, dadosReserva } = useReserva();

    // planos do tipo selecionado, flat list vindos de /car-planos/filter
    const [planos, setPlanos] = useState([]);
    const [loadingPlanos, setLoadingPlanos] = useState(true);
    // quais tipos têm planos disponíveis (carregado uma vez na montagem)
    const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
    const [loadingTipos, setLoadingTipos] = useState(true);

    const [tipoLocacao, setTipoLocacao] = useState(dadosReserva?.tipo_locacao || 'particular');
    const [categoria, setCategoria] = useState(dadosReserva?.plano || '');
    const [kmFranquia, setKmFranquia] = useState(
        dadosReserva?.km_franquia != null ? Number(dadosReserva.km_franquia) : null
    );

    const [dataRetirada, setDataRetirada] = useState('');
    const [dataDevolucao, setDataDevolucao] = useState('');
    const [duracaoDias, setDuracaoDias] = useState(0);

    // Descobre quais tipos têm planos para este carro (3 requests paralelos na montagem)
    useEffect(() => {
        if (!car?.id) return;
        setLoadingTipos(true);
        Promise.all(
            Object.keys(TIPO_CONFIG).map(tipo =>
                carPlanosService.getPlanosFiltro(tipo, undefined, car.id)
                    .then(res => ({ tipo, hasPlanos: (res?.data ?? []).some(p => p.ativo) }))
                    .catch(() => ({ tipo, hasPlanos: false }))
            )
        ).then(results => {
            const disponiveis = results.filter(r => r.hasPlanos).map(r => r.tipo);
            setTiposDisponiveis(disponiveis);
            // Ajusta tipoLocacao inicial se necessário
            setTipoLocacao(prev =>
                disponiveis.includes(prev) ? prev : (disponiveis[0] ?? 'particular')
            );
        }).finally(() => setLoadingTipos(false));
    }, [car?.id]);

    // Busca os planos do tipo selecionado via /car-planos/filter?tipo=X&carro_id=Y
    useEffect(() => {
        if (!car?.id || loadingTipos) return;
        setLoadingPlanos(true);
        setCategoria('');
        setKmFranquia(null);
        carPlanosService.getPlanosFiltro(tipoLocacao, undefined, car.id)
            .then(res => setPlanos((res?.data ?? []).filter(p => p.ativo)))
            .catch(() => {
                setPlanos([]);
                toast({ title: 'Erro', description: 'Não foi possível carregar os planos.', variant: 'destructive' });
            })
            .finally(() => setLoadingPlanos(false));
    }, [tipoLocacao, car?.id, loadingTipos]);

    // Categorias disponíveis para os planos carregados (na ordem de CATEGORIAS)
    const categoriasDisponiveis = useMemo(() => {
        const cats = new Set(planos.map(p => p.categoria));
        return CATEGORIAS.filter(c => cats.has(c.value));
    }, [planos]);

    // Ajusta categoria quando os planos carregam
    useEffect(() => {
        if (!categoriasDisponiveis.length) return;
        setCategoria(prev =>
            categoriasDisponiveis.find(c => c.value === prev)
                ? prev
                : (dadosReserva?.plano && categoriasDisponiveis.find(c => c.value === dadosReserva.plano)
                    ? dadosReserva.plano
                    : categoriasDisponiveis[0].value)
        );
    }, [categoriasDisponiveis]);

    // Opções de KM para o tipo + categoria selecionados, com preço
    const kmOpcoes = useMemo(() => {
        if (!categoria) return [];
        return planos
            .filter(p => p.categoria === categoria)
            .sort((a, b) => a.km_franquia - b.km_franquia)
            .map(p => ({ km: p.km_franquia, label: kmLabel(p.km_franquia), preco: Number(p.preco) }));
    }, [planos, categoria]);

    // Ajusta kmFranquia quando as opções mudam
    useEffect(() => {
        if (!kmOpcoes.length) return;
        setKmFranquia(prev =>
            kmOpcoes.find(o => o.km === prev) ? prev : kmOpcoes[0].km
        );
    }, [kmOpcoes]);

    // Plano correspondente à seleção atual
    const selectedPlano = useMemo(
        () => planos.find(p => p.categoria === categoria && p.km_franquia === kmFranquia) ?? null,
        [planos, categoria, kmFranquia]
    );

    // Cálculo de preços
    const { preco, precoTotal, precoSemanal, precoMensal } = useMemo(() => {
        const base = selectedPlano ? Number(selectedPlano.preco) : 0;
        if (!base) return { preco: 0, precoTotal: 0, precoSemanal: 0, precoMensal: 0 };

        if (categoria === 'diario') {
            return { preco: base, precoTotal: base * (duracaoDias || 1), precoSemanal: 0, precoMensal: 0 };
        }

        const DIAS = { trimestral: 90, semestral: 180, anual: 365 };
        const dias = DIAS[categoria];
        const semanal = categoria === 'semanal'    ? base
                      : dias                       ? (base * 7) / dias : 0;
        const mensal  = categoria === 'trimestral' ? base / 3
                      : categoria === 'semestral'  ? base / 6
                      : categoria === 'anual'      ? base / 12 : 0;

        return { preco: base, precoTotal: base, precoSemanal: semanal, precoMensal: mensal };
    }, [selectedPlano, categoria, duracaoDias]);

    // ---- Handlers ----

    const handleTipoChange = (newTipo) => {
        setTipoLocacao(newTipo);
        setDataRetirada('');
        setDataDevolucao('');
        setDuracaoDias(0);
    };

    const handleCategoriaChange = (newCat) => {
        setCategoria(newCat);
        setDataRetirada('');
        setDataDevolucao('');
        setDuracaoDias(0);
    };

    const handleDataRetiradaChange = (e) => {
        const val = e.target.value;
        setDataRetirada(val);
        if (!val) return;

        if (categoria !== 'diario') {
            const devolucao = calcularDataDevolucao(val, categoria);
            setDataDevolucao(devolucao);
            setDuracaoDias(calcularDuracao(val, devolucao, categoria));
        } else {
            if (dataDevolucao && new Date(val) >= new Date(dataDevolucao)) {
                setDataDevolucao('');
                setDuracaoDias(0);
            } else if (dataDevolucao) {
                setDuracaoDias(calcularDuracao(val, dataDevolucao, categoria));
            }
        }
    };

    const handleDataDevolucaoChange = (e) => {
        const val = e.target.value;
        setDataDevolucao(val);
        if (dataRetirada && val) setDuracaoDias(calcularDuracao(dataRetirada, val, categoria));
    };

    const handleContinuar = () => {
        const errors = [];
        if (!dataRetirada) errors.push('Data de retirada é obrigatória');
        if (!dataDevolucao) errors.push('Data de devolução é obrigatória');
        if (!selectedPlano) errors.push('Selecione um plano disponível');
        if (precoTotal <= 0) errors.push('Erro no cálculo do preço');

        if (errors.length) {
            toast({ title: 'Atenção', description: errors.join('. '), variant: 'destructive' });
            return;
        }

        const reservaData = {
            carroId: car.id,
            tipo_locacao: tipoLocacao,
            plano: categoria,
            franquia_km: kmFranquia,
            dataRetirada,
            dataDevolucao,
            valorTotal: precoTotal,
            valorDiario: preco,
            km_contratado: kmFranquia,
            duracaoDias,
            dataInicio: dataRetirada,
            dataFim: dataDevolucao,
            carro: car,
            plano_id: selectedPlano?.id,
        };

        setTipoReserva(tipoLocacao);
        setDadosReserva(reservaData);
        navigate(`/documentos/${car.id}`, { state: { reserva: reservaData, carro: car } });
    };

    if (!car) return null;

    const isLoading = loadingTipos || loadingPlanos;
    const showResumo = selectedPlano && preco > 0 && dataRetirada && dataDevolucao;

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-[#0E3A2F]" size={32} />
                </div>
            ) : tiposDisponiveis.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-500">
                    <AlertTriangle className="text-amber-400" size={32} />
                    <p className="font-medium">Nenhum plano disponível para este veículo.</p>
                </div>
            ) : (
                <>
                    {/* 1. Segmento */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">1. Segmento</h3>
                        <div className="flex gap-2">
                            {Object.entries(TIPO_CONFIG).map(([tipo, cfg]) => {
                                const Icon = cfg.icon;
                                const disponivel = tiposDisponiveis.includes(tipo);
                                return (
                                    <button
                                        key={tipo}
                                        onClick={() => disponivel && handleTipoChange(tipo)}
                                        disabled={!disponivel}
                                        title={!disponivel ? 'Sem planos disponíveis para este segmento' : undefined}
                                        className={cn(
                                            'flex-1 p-3 rounded-lg border-2 font-bold text-sm transition-all flex items-center justify-center gap-1',
                                            tipoLocacao === tipo && disponivel
                                                ? cfg.activeClass
                                                : disponivel
                                                    ? 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                    : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                                        )}
                                    >
                                        <Icon size={14} /> {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Plano (categoria) */}
                    {categoriasDisponiveis.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">2. Plano</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {categoriasDisponiveis.map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => handleCategoriaChange(cat.value)}
                                        className={cn(
                                            'p-3 rounded-lg border font-medium text-sm transition-all',
                                            categoria === cat.value
                                                ? 'bg-[#0E3A2F] text-white border-[#0E3A2F] shadow-md'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        )}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Franquia KM */}
                    {kmOpcoes.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                <Gauge size={14} /> 3. Franquia KM
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {kmOpcoes.map(opt => (
                                    <button
                                        key={opt.km}
                                        onClick={() => setKmFranquia(opt.km)}
                                        className={cn(
                                            'flex flex-col items-center p-3 rounded-xl border-2 font-bold text-sm transition-all',
                                            kmFranquia === opt.km
                                                ? 'border-[#00D166] bg-green-50 text-[#0E3A2F]'
                                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                                        )}
                                    >
                                        <span>{opt.label}</span>
                                        <span className="text-xs font-normal text-gray-400 mt-0.5">
                                            R$ {opt.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. Período */}
                    {selectedPlano && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">4. Período</h3>
                            <DateRangeSelector
                                startDate={dataRetirada}
                                endDate={dataDevolucao}
                                onStartDateChange={handleDataRetiradaChange}
                                onEndDateChange={handleDataDevolucaoChange}
                                days={duracaoDias}
                                plan={categoria}
                            />
                        </div>
                    )}

                    {/* Resumo */}
                    {showResumo && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <ResumoPrecoSimulacao
                                car={car}
                                tipoLocacao={tipoLocacao}
                                tipoPlano={categoria}
                                usoKm={kmFranquia}
                                dataRetirada={dataRetirada}
                                dataDevolucao={dataDevolucao}
                                preco={preco}
                                precoTotal={precoTotal}
                                precoSemanal={precoSemanal}
                                precoMensal={precoMensal}
                                duracaoDias={duracaoDias}
                                onContinuar={handleContinuar}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReservaForm;
