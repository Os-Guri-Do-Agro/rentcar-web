import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Car, User, Users, Building2 } from 'lucide-react';
import carService from '@/services/cars/carService';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const DEFAULTS = {
    particular: {
        preco_diaria_particular: '', preco_km_extra_particular: '', km_inclusos_particular: '',
        particular_diario_livre: '', particular_diario_60km: '', particular_diario_100km: '', particular_diario_120km: '',
        particular_semanal_1500: '', particular_semanal_2000: '', particular_semanal_3000: '',
        particular_trimestral: '', particular_semestral: '',
        particular_franquia_1000km: '', particular_franquia_1500km: '', particular_franquia_2000km: '',
        particular_franquia_2500km: '', particular_franquia_3000km: '', particular_franquia_5000km: '',
    },
    motorista: {
        preco_diaria_motorista: '', preco_km_extra_motorista: '', km_inclusos_motorista: '',
        motorista_diario_livre: '', motorista_diario_60km: '', motorista_diario_100km: '', motorista_diario_120km: '',
        motorista_semanal: '', motorista_semanal_1250km: '', motorista_semanal_1500km: '',
        motorista_trimestral: '', motorista_trimestral_2500: '', motorista_trimestral_5000: '', motorista_trimestral_6000: '',
        motorista_semestral: '', motorista_semestral_2500: '', motorista_semestral_5000: '', motorista_semestral_6000: '',
        motorista_anual_2500: '', motorista_anual_5000: '', motorista_anual_6000: '',
        motorista_franquia_2500km: '', motorista_franquia_5000km: '', motorista_franquia_6000km: '',
    },
    corporativo: {
        corporativo_diario_livre: '', corporativo_diario_60km: '', corporativo_diario_100km: '', corporativo_diario_120km: '',
        corporativo_trimestral: '', corporativo_semestral: '',
        corporativo_franquia_1000km: '', corporativo_franquia_2500km: '', corporativo_franquia_5000km: '',
    },
};

const buildApiPayload = (pricing) => {
    const n = (v) => Number(v || 0);
    const mapSection = (section) => Object.fromEntries(Object.entries(section).map(([k, v]) => [k, n(v)]));
    return {
        particular: mapSection(pricing.particular),
        motorista: mapSection(pricing.motorista),
        corporativo: mapSection(pricing.corporativo),
    };
};

const CarPricingModal = ({ car, isOpen, onClose, onUpdate, initialRentalType = 'particular' }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [allPricing, setAllPricing] = useState(DEFAULTS);
    const [activeRentalType, setActiveRentalType] = useState(initialRentalType);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && car) {
            setActiveRentalType(initialRentalType);
            initPricing();
        }
    }, [isOpen, car]);

    const addPrefix = (obj, prefix) =>
        Object.fromEntries(Object.entries(obj).map(([k, v]) =>
            k.startsWith(prefix) || ['preco_diaria_', 'preco_km_extra_', 'km_inclusos_'].some(p => k.startsWith(p))
                ? [k, v]
                : [`${prefix}_${k}`, v]
        ));

    const initPricing = async () => {
        setLoading(true);
        try {
            const res = await carService.getCarsKmPricing(car.id);
            setAllPricing({
                particular: { ...DEFAULTS.particular, ...addPrefix(res.data.particular, 'particular') },
                motorista: { ...DEFAULTS.motorista, ...addPrefix(res.data.motorista, 'motorista') },
                corporativo: { ...DEFAULTS.corporativo, ...addPrefix(res.data.corporativo, 'corporativo') },
            });
        } catch (err) {
            toast({ title: 'Erro', description: 'Falha ao carregar preços.', variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleFieldChange = (field, value) => {
        setAllPricing(prev => ({
            ...prev,
            [activeRentalType]: { ...prev[activeRentalType], [field]: value }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await carService.patchCarsPricingById(car.id, buildApiPayload(allPricing));
            toast({ title: 'Salvo!', className: 'bg-green-600 text-white' });
            if (onUpdate) onUpdate();
        } catch (err) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        }
        setSaving(false);
    };

    if (!car) return null;

    const f = allPricing[activeRentalType] || {};

    const RentalTypeButton = ({ type, icon: Icon, label, colorClass }) => (
        <button
            onClick={() => setActiveRentalType(type)}
            className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-bold text-sm w-full justify-center',
                activeRentalType === type
                    ? `${colorClass} border-current ring-1 ring-offset-2 ring-current`
                    : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
            )}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose} maxWidth="max-w-6xl">
            <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border overflow-hidden">
                            {car.imagem_url ? <img src={car.imagem_url} className="w-full h-full object-cover" alt={car.nome} /> : <Car className="m-auto mt-4 text-gray-400" />}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-[#0E3A2F]">{car.marca} {car.nome}</DialogTitle>
                            <p className="text-gray-500 text-sm">{car.placa} • {car.categoria}</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    <RentalTypeButton type="particular" icon={User} label="Particular" colorClass="bg-blue-50 text-blue-700 border-blue-600" />
                    <RentalTypeButton type="motorista" icon={Users} label="Motorista App" colorClass="bg-green-50 text-green-700 border-green-600" />
                    <RentalTypeButton type="corporativo" icon={Building2} label="Corporativo" colorClass="bg-purple-50 text-purple-700 border-purple-600" />
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>
                ) : (
                    <Tabs defaultValue="diario" key={activeRentalType}>
                        <TabsList className="flex flex-wrap h-auto bg-gray-100 p-1 gap-1 mb-2">
                            <TabsTrigger value="diario" className="data-[state=active]:bg-[#0E3A2F] data-[state=active]:text-white data-[state=active]:shadow-md">Diário</TabsTrigger>
                            {activeRentalType !== 'corporativo' && <TabsTrigger value="semanal" className="data-[state=active]:bg-[#0E3A2F] data-[state=active]:text-white data-[state=active]:shadow-md">Semanal</TabsTrigger>}
                            <TabsTrigger value="trimestral" className="data-[state=active]:bg-[#0E3A2F] data-[state=active]:text-white data-[state=active]:shadow-md">Trimestral / Semestral</TabsTrigger>
                            {activeRentalType !== 'motorista' && <TabsTrigger value="franquia" className="data-[state=active]:bg-[#0E3A2F] data-[state=active]:text-white data-[state=active]:shadow-md">Franquia</TabsTrigger>}
                            {activeRentalType === 'motorista' && <TabsTrigger value="anual" className="data-[state=active]:bg-[#0E3A2F] data-[state=active]:text-white data-[state=active]:shadow-md">Anual / Franquia</TabsTrigger>}
                        </TabsList>

                        {/* DIÁRIO */}
                        <TabsContent value="diario" className="space-y-2 pt-2">
                            {activeRentalType === 'particular' && (
                                <>
                                    <PriceField label="Diária Particular" field="preco_diaria_particular" value={f.preco_diaria_particular} onChange={handleFieldChange} />
                                    <PriceField label="Preço KM Extra" field="preco_km_extra_particular" value={f.preco_km_extra_particular} onChange={handleFieldChange} />
                                    <PriceField label="KM Inclusos" field="km_inclusos_particular" value={f.km_inclusos_particular} onChange={handleFieldChange} isNumber />
                                </>
                            )}
                            {activeRentalType === 'motorista' && (
                                <>
                                    <PriceField label="Diária Motorista" field="preco_diaria_motorista" value={f.preco_diaria_motorista} onChange={handleFieldChange} />
                                    <PriceField label="Preço KM Extra" field="preco_km_extra_motorista" value={f.preco_km_extra_motorista} onChange={handleFieldChange} />
                                    <PriceField label="KM Inclusos" field="km_inclusos_motorista" value={f.km_inclusos_motorista} onChange={handleFieldChange} isNumber />
                                </>
                            )}
                            <PriceField label="Diário Livre" field={`${activeRentalType}_diario_livre`} value={f[`${activeRentalType}_diario_livre`]} onChange={handleFieldChange} />
                            <PriceField label="Diário 60km" field={`${activeRentalType}_diario_60km`} value={f[`${activeRentalType}_diario_60km`]} onChange={handleFieldChange} />
                            <PriceField label="Diário 100km" field={`${activeRentalType}_diario_100km`} value={f[`${activeRentalType}_diario_100km`]} onChange={handleFieldChange} />
                            <PriceField label="Diário 120km" field={`${activeRentalType}_diario_120km`} value={f[`${activeRentalType}_diario_120km`]} onChange={handleFieldChange} />
                        </TabsContent>

                        {/* SEMANAL */}
                        {activeRentalType === 'particular' && (
                            <TabsContent value="semanal" className="space-y-2 pt-2">
                                <PriceField label="Semanal 1500km" field="particular_semanal_1500" value={f.particular_semanal_1500} onChange={handleFieldChange} />
                                <PriceField label="Semanal 2000km" field="particular_semanal_2000" value={f.particular_semanal_2000} onChange={handleFieldChange} />
                                <PriceField label="Semanal 3000km" field="particular_semanal_3000" value={f.particular_semanal_3000} onChange={handleFieldChange} />
                            </TabsContent>
                        )}
                        {activeRentalType === 'motorista' && (
                            <TabsContent value="semanal" className="space-y-2 pt-2">
                                <PriceField label="Semanal (livre)" field="motorista_semanal" value={f.motorista_semanal} onChange={handleFieldChange} />
                                <PriceField label="Semanal 1250km" field="motorista_semanal_1250km" value={f.motorista_semanal_1250km} onChange={handleFieldChange} />
                                <PriceField label="Semanal 1500km" field="motorista_semanal_1500km" value={f.motorista_semanal_1500km} onChange={handleFieldChange} />
                            </TabsContent>
                        )}

                        {/* TRIMESTRAL / SEMESTRAL */}
                        <TabsContent value="trimestral" className="space-y-2 pt-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Trimestral</p>
                            <PriceField label="Trimestral" field={`${activeRentalType}_trimestral`} value={f[`${activeRentalType}_trimestral`]} onChange={handleFieldChange} />
                            {activeRentalType === 'motorista' && (
                                <>
                                    <PriceField label="Trimestral 2500km" field="motorista_trimestral_2500" value={f.motorista_trimestral_2500} onChange={handleFieldChange} />
                                    <PriceField label="Trimestral 5000km" field="motorista_trimestral_5000" value={f.motorista_trimestral_5000} onChange={handleFieldChange} />
                                    <PriceField label="Trimestral 6000km" field="motorista_trimestral_6000" value={f.motorista_trimestral_6000} onChange={handleFieldChange} />
                                </>
                            )}
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Semestral</p>
                            <PriceField label="Semestral" field={`${activeRentalType}_semestral`} value={f[`${activeRentalType}_semestral`]} onChange={handleFieldChange} />
                            {activeRentalType === 'motorista' && (
                                <>
                                    <PriceField label="Semestral 2500km" field="motorista_semestral_2500" value={f.motorista_semestral_2500} onChange={handleFieldChange} />
                                    <PriceField label="Semestral 5000km" field="motorista_semestral_5000" value={f.motorista_semestral_5000} onChange={handleFieldChange} />
                                    <PriceField label="Semestral 6000km" field="motorista_semestral_6000" value={f.motorista_semestral_6000} onChange={handleFieldChange} />
                                </>
                            )}
                        </TabsContent>

                        {/* FRANQUIA (particular / corporativo) */}
                        {activeRentalType !== 'motorista' && (
                            <TabsContent value="franquia" className="space-y-2 pt-2">
                                {activeRentalType === 'particular' && (
                                    <>
                                        <PriceField label="Franquia 1000km" field="particular_franquia_1000km" value={f.particular_franquia_1000km} onChange={handleFieldChange} />
                                        <PriceField label="Franquia 1500km" field="particular_franquia_1500km" value={f.particular_franquia_1500km} onChange={handleFieldChange} />
                                        <PriceField label="Franquia 2000km" field="particular_franquia_2000km" value={f.particular_franquia_2000km} onChange={handleFieldChange} />
                                        <PriceField label="Franquia 2500km" field="particular_franquia_2500km" value={f.particular_franquia_2500km} onChange={handleFieldChange} />
                                        <PriceField label="Franquia 3000km" field="particular_franquia_3000km" value={f.particular_franquia_3000km} onChange={handleFieldChange} />
                                        <PriceField label="Franquia 5000km" field="particular_franquia_5000km" value={f.particular_franquia_5000km} onChange={handleFieldChange} />
                                    </>
                                )}
                                {activeRentalType === 'corporativo' && (
                                    <>
                                        <PriceField label="Franquia 1000km" field="corporativo_franquia_1000km" value={f.corporativo_franquia_1000km} onChange={handleFieldChange} />
                                        <PriceField label="Franquia 2500km" field="corporativo_franquia_2500km" value={f.corporativo_franquia_2500km} onChange={handleFieldChange} />
                                        <PriceField label="Franquia 5000km" field="corporativo_franquia_5000km" value={f.corporativo_franquia_5000km} onChange={handleFieldChange} />
                                    </>
                                )}
                            </TabsContent>
                        )}

                        {/* ANUAL / FRANQUIA (motorista) */}
                        {activeRentalType === 'motorista' && (
                            <TabsContent value="anual" className="space-y-2 pt-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Anual</p>
                                <PriceField label="Anual 2500km" field="motorista_anual_2500" value={f.motorista_anual_2500} onChange={handleFieldChange} />
                                <PriceField label="Anual 5000km" field="motorista_anual_5000" value={f.motorista_anual_5000} onChange={handleFieldChange} />
                                <PriceField label="Anual 6000km" field="motorista_anual_6000" value={f.motorista_anual_6000} onChange={handleFieldChange} />
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Franquia</p>
                                <PriceField label="Franquia 2500km" field="motorista_franquia_2500km" value={f.motorista_franquia_2500km} onChange={handleFieldChange} />
                                <PriceField label="Franquia 5000km" field="motorista_franquia_5000km" value={f.motorista_franquia_5000km} onChange={handleFieldChange} />
                                <PriceField label="Franquia 6000km" field="motorista_franquia_6000km" value={f.motorista_franquia_6000km} onChange={handleFieldChange} />
                            </TabsContent>
                        )}
                    </Tabs>
                )}

                <div className="flex justify-end mt-4 border-t pt-4 gap-3">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold hover:bg-[#0a2a22] transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                        Salvar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const PriceField = ({ label, field, value, onChange, isNumber = false }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex items-center gap-2">
            {!isNumber && <span className="text-gray-500 text-sm">R$</span>}
            <Input
                type="number"
                className="w-32 h-9"
                placeholder="0"
                value={value ?? ''}
                onChange={(e) => onChange(field, e.target.value)}
            />
        </div>
    </div>
);

export default CarPricingModal;
