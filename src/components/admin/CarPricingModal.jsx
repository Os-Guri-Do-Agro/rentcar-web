import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Car, User, Users, Building2, Plus, Trash2, Pencil, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import carPlanosService from '@/services/cars/carPlanosService';
import { CATEGORIAS, CATEGORIAS_POR_TIPO, KM_OPCOES } from '@/constants/carPlanos';
import { parseCarPlanosResponse } from '@/utils/carPlanosHelpers';

const TIPO_TABS = [
    { type: 'particular',  icon: User,      label: 'Particular',    colorClass: 'bg-blue-50 text-blue-700 border-blue-600' },
    { type: 'motorista',   icon: Users,     label: 'Motorista App', colorClass: 'bg-green-50 text-green-700 border-green-600' },
    { type: 'corporativo', icon: Building2, label: 'Corporativo',   colorClass: 'bg-purple-50 text-purple-700 border-purple-600' },
];

const PlanoForm = ({ initial, activeCategoria, onSave, onCancel, saving }) => {
    const defaultForm = { categoria: activeCategoria, km_franquia: 0, km_custom: '', preco: '', ativo: true };
    const [form, setForm] = useState(initial ?? defaultForm);
    const isCustomKm = !KM_OPCOES.some(o => o.value === Number(form.km_franquia)) || form._useCustom;
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const effectiveKm = isCustomKm ? Number(form.km_custom || 0) : Number(form.km_franquia);

    const handleSubmit = () => {
        if (!form.preco || Number(form.preco) <= 0) return;
        onSave({ categoria: form.categoria, km_franquia: effectiveKm, preco: Number(form.preco), ativo: form.ativo });
    };

    return (
        <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Categoria</Label>
                    <select
                        value={form.categoria}
                        onChange={e => set('categoria', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#00D166] outline-none"
                    >
                        {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Franquia KM</Label>
                    <select
                        value={isCustomKm ? 'custom' : form.km_franquia}
                        onChange={e => {
                            if (e.target.value === 'custom') { set('_useCustom', true); }
                            else { set('km_franquia', Number(e.target.value)); set('_useCustom', false); }
                        }}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#00D166] outline-none"
                    >
                        {KM_OPCOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        <option value="custom">Personalizado</option>
                    </select>
                    {isCustomKm && (
                        <Input type="number" placeholder="KM" value={form.km_custom}
                            onChange={e => set('km_custom', e.target.value)} className="mt-2 h-9" />
                    )}
                </div>
                <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Preço (R$)</Label>
                    <Input type="number" placeholder="0,00" value={form.preco}
                        onChange={e => set('preco', e.target.value)} className="h-9" />
                </div>
            </div>
            <div className="flex items-center justify-between pt-1">
                <button
                    type="button"
                    onClick={() => set('ativo', !form.ativo)}
                    className={cn('flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors',
                        form.ativo ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-400')}
                >
                    {form.ativo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {form.ativo ? 'Ativo' : 'Inativo'}
                </button>
                <div className="flex gap-2">
                    <button onClick={onCancel} disabled={saving}
                        className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} disabled={saving || !form.preco || Number(form.preco) <= 0}
                        className="px-4 py-1.5 bg-[#0E3A2F] text-white rounded-lg text-sm font-bold hover:bg-[#0a2a22] disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

const PlanoRow = ({ plano, onToggle, onEdit, onDelete, isProcessing }) => {
    const kmLabel = plano.km_franquia === 0 ? 'KM Livre' : `${Number(plano.km_franquia).toLocaleString('pt-BR')} KM`;
    return (
        <div className={cn('flex items-center justify-between p-3 rounded-lg border bg-white transition-opacity',
            !plano.ativo && 'opacity-55', isProcessing && 'pointer-events-none')}>
            <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-gray-500">{kmLabel}</span>
                <span className="font-bold text-[#0E3A2F] text-base">
                    R$ {Number(plano.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {!plano.ativo && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                        Inativo
                    </span>
                )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => onToggle(plano)} title={plano.ativo ? 'Desativar' : 'Ativar'}
                    className={cn('p-1.5 rounded-lg transition-colors',
                        plano.ativo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100')}>
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : plano.ativo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                <button onClick={() => onEdit(plano)} title="Editar"
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                    <Pencil size={14} />
                </button>
                <button onClick={() => onDelete(plano.id)} title="Remover"
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

const CarPricingModal = ({ car, isOpen, onClose, onUpdate, initialRentalType = 'particular' }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [planos, setPlanos] = useState({ particular: [], motorista: [], corporativo: [] });
    const [activeTipo, setActiveTipo] = useState(initialRentalType);
    const [activeCategoria, setActiveCategoria] = useState('diario');
    const [addingPlan, setAddingPlan] = useState(false);
    const [editingPlano, setEditingPlano] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        if (isOpen && car) {
            setActiveTipo(initialRentalType);
            setActiveCategoria('diario');
            setAddingPlan(false);
            setEditingPlano(null);
            loadPlanos();
        }
    }, [isOpen, car]);

    const loadPlanos = async () => {
        setLoading(true);
        try {
            const res = await carPlanosService.getPlanosByCarroId(car.id);
            const grouped = parseCarPlanosResponse(res);
            const ordem = { diario: 0, semanal: 1, trimestral: 2, semestral: 3, anual: 4 };
            Object.keys(grouped).forEach(tipo => {
                grouped[tipo].sort((a, b) =>
                    (ordem[a.categoria] ?? 99) - (ordem[b.categoria] ?? 99) || a.km_franquia - b.km_franquia
                );
            });
            setPlanos(grouped);
        } catch {
            toast({ title: 'Erro', description: 'Falha ao carregar planos.', variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleAdd = async (formData) => {
        setProcessingId('new');
        try {
            await carPlanosService.createPlano({ carro_id: car.id, tipo: activeTipo, ...formData });
            toast({ title: 'Plano criado!', className: 'bg-green-600 text-white' });
            setAddingPlan(false);
            setActiveCategoria(formData.categoria);
            loadPlanos();
            if (onUpdate) onUpdate();
        } catch (err) {
            toast({ title: 'Erro ao criar', description: err.message, variant: 'destructive' });
        }
        setProcessingId(null);
    };

    const handleEditSave = async (formData) => {
        setProcessingId(editingPlano.id);
        try {
            await carPlanosService.updatePlano(editingPlano.id, formData);
            toast({ title: 'Plano atualizado!', className: 'bg-green-600 text-white' });
            setEditingPlano(null);
            loadPlanos();
            if (onUpdate) onUpdate();
        } catch (err) {
            toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
        }
        setProcessingId(null);
    };

    const handleToggle = async (plano) => {
        setProcessingId(plano.id);
        try {
            await carPlanosService.togglePlano(plano.id, plano.ativo);
            loadPlanos();
        } catch (err) {
            toast({ title: 'Erro ao alternar status', description: err.message, variant: 'destructive' });
        }
        setProcessingId(null);
    };

    const handleDelete = async (id) => {
        setProcessingId(id);
        try {
            await carPlanosService.deletePlano(id);
            toast({ title: 'Plano removido', className: 'bg-green-600 text-white' });
            loadPlanos();
            if (onUpdate) onUpdate();
        } catch (err) {
            toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' });
        }
        setProcessingId(null);
    };

    if (!car) return null;

    const planosDoTipo = planos[activeTipo] ?? [];
    const planosVisiveis = planosDoTipo.filter(p => p.categoria === activeCategoria);

    // conta planos por categoria com uma única passagem
    const countByCategoria = planosDoTipo.reduce((acc, p) => {
        acc[p.categoria] = (acc[p.categoria] || 0) + 1;
        return acc;
    }, {});

    return (
        <Dialog open={isOpen} onOpenChange={onClose} maxWidth="max-w-5xl">
            <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border overflow-hidden flex-shrink-0">
                            {car.imagem_url
                                ? <img src={car.imagem_url} className="w-full h-full object-cover" alt={car.nome} />
                                : <Car className="m-auto mt-4 text-gray-400" />}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-[#0E3A2F]">{car.marca} {car.nome}</DialogTitle>
                            <p className="text-gray-500 text-sm">{car.placa} • {car.categoria}</p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs de tipo (Particular / Motorista / Corporativo) */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                    {TIPO_TABS.map(({ type, icon: Icon, label, colorClass }) => (
                        <button
                            key={type}
                            onClick={() => {
                                setActiveTipo(type);
                                setAddingPlan(false);
                                setEditingPlano(null);
                                const permitidas = CATEGORIAS_POR_TIPO[type];
                                if (!permitidas.includes(activeCategoria)) setActiveCategoria(permitidas[0]);
                            }}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all font-bold text-sm justify-center',
                                activeTipo === type
                                    ? `${colorClass} border-current ring-1 ring-offset-2 ring-current`
                                    : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                            )}
                        >
                            <Icon size={16} />
                            {label}
                            {planos[type]?.length > 0 && (
                                <span className={cn('ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full',
                                    activeTipo === type ? 'bg-white/60' : 'bg-gray-100 text-gray-500')}>
                                    {planos[type].length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-[#00D166]" size={40} />
                    </div>
                ) : (
                    <>
                        {/* Sub-tabs de categoria (Diário / Semanal / ...) */}
                        <div className="flex gap-1 border-b border-gray-100 mb-4 overflow-x-auto pb-px">
                            {CATEGORIAS.filter(c => CATEGORIAS_POR_TIPO[activeTipo].includes(c.value)).map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => { setActiveCategoria(value); setAddingPlan(false); setEditingPlano(null); }}
                                    className={cn(
                                        'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px',
                                        activeCategoria === value
                                            ? 'border-[#0E3A2F] text-[#0E3A2F]'
                                            : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                                    )}
                                >
                                    {label}
                                    {countByCategoria[value] > 0 && (
                                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                                            activeCategoria === value ? 'bg-[#0E3A2F]/10 text-[#0E3A2F]' : 'bg-gray-100 text-gray-400')}>
                                            {countByCategoria[value]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Lista de planos filtrados */}
                        <div className="space-y-2 min-h-[80px]">
                            {planosVisiveis.length === 0 && !addingPlan && (
                                <div className="text-center py-8 text-gray-400 border rounded-xl border-dashed">
                                    <p className="text-sm">Nenhum plano <strong>{CATEGORIAS.find(c => c.value === activeCategoria)?.label}</strong> para {TIPO_TABS.find(t => t.type === activeTipo)?.label}.</p>
                                    <p className="text-xs mt-1">Clique em "+ Adicionar Plano" para criar.</p>
                                </div>
                            )}

                            {planosVisiveis.map(plano => (
                                editingPlano?.id === plano.id ? (
                                    <PlanoForm
                                        key={plano.id}
                                        activeCategoria={activeCategoria}
                                        initial={{
                                            categoria: plano.categoria,
                                            km_franquia: plano.km_franquia,
                                            km_custom: KM_OPCOES.some(o => o.value === plano.km_franquia) ? '' : String(plano.km_franquia),
                                            _useCustom: !KM_OPCOES.some(o => o.value === plano.km_franquia),
                                            preco: String(plano.preco),
                                            ativo: plano.ativo,
                                        }}
                                        onSave={handleEditSave}
                                        onCancel={() => setEditingPlano(null)}
                                        saving={processingId === plano.id}
                                    />
                                ) : (
                                    <PlanoRow
                                        key={plano.id}
                                        plano={plano}
                                        onToggle={handleToggle}
                                        onEdit={(p) => { setEditingPlano(p); setAddingPlan(false); }}
                                        onDelete={handleDelete}
                                        isProcessing={processingId === plano.id}
                                    />
                                )
                            ))}

                            {addingPlan && (
                                <PlanoForm
                                    activeCategoria={activeCategoria}
                                    onSave={handleAdd}
                                    onCancel={() => setAddingPlan(false)}
                                    saving={processingId === 'new'}
                                />
                            )}
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center mt-5 pt-4 border-t">
                    <button
                        onClick={() => { setAddingPlan(true); setEditingPlano(null); }}
                        disabled={loading || addingPlan}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg text-sm hover:bg-[#00F178] disabled:opacity-50 transition-colors"
                    >
                        <Plus size={16} />
                        Adicionar Plano
                    </button>
                    <button onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 text-sm">
                        Fechar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CarPricingModal;
