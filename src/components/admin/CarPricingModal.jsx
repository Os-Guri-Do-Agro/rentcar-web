import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, TrendingUp, Clock, Car, User, Users, Building2 } from 'lucide-react';
import { getCarPricing, updateCarPricing } from '@/services/carPricingService';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const CarPricingModal = ({ car, isOpen, onClose, onUpdate, initialRentalType = 'particular' }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [allPricing, setAllPricing] = useState({ particular: null, motorista: null, corporativo: null });
    const [activeRentalType, setActiveRentalType] = useState(initialRentalType);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && car) {
            setActiveRentalType(initialRentalType);
            loadPricing();
        }
    }, [isOpen, car]);

    const loadPricing = async () => {
        setLoading(true);
        const res = await getCarPricing(car.id);
        if (res.success) {
            setAllPricing(res.data);
        } else {
            toast({ title: "Erro", description: "Falha ao carregar preços.", variant: "destructive" });
        }
        setLoading(false);
    };

    const currentPricing = allPricing[activeRentalType] || { 
        diario: [], trimestral: [], semestral: [], anual: [], franquia: [], semanal: []
    };

    const handleUpdatePrice = async (price, type, km = 0) => {
        setSaving(true);
        const safePrice = price === '' ? 0 : parseFloat(price);
        const res = await updateCarPricing(car.id, activeRentalType, type, { 
            price: safePrice, 
            km: km 
        });
        
        if (res.success) {
            toast({ title: "Salvo!", className: "bg-green-600 text-white" });
            await loadPricing();
            if(onUpdate) onUpdate();
        } else {
            toast({ title: "Erro", description: res.error, variant: "destructive" });
        }
        setSaving(false);
    };

    if (!car) return null;

    const RentalTypeButton = ({ type, icon: Icon, label, colorClass }) => (
        <button
            onClick={() => setActiveRentalType(type)}
            className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-bold text-sm w-full justify-center",
                activeRentalType === type 
                    ? `${colorClass} border-current ring-1 ring-offset-2 ring-current` 
                    : "border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50"
            )}
        >
            <Icon size={18} />
            {label}
        </button>
    );
    
    // Determine which tabs to show based on type
    const showMotoristaTabs = activeRentalType === 'motorista';
    const showParticularTabs = activeRentalType === 'particular';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                         <div className="w-16 h-16 rounded-lg bg-gray-100 border overflow-hidden">
                             {car.imagem_url ? <img src={car.imagem_url} className="w-full h-full object-cover"/> : <Car className="m-auto mt-4 text-gray-400"/>}
                         </div>
                         <div>
                            <DialogTitle className="text-xl font-bold text-[#0E3A2F]">{car.marca} {car.nome}</DialogTitle>
                            <p className="text-gray-500 text-sm">{car.placa} • {car.categoria}</p>
                         </div>
                    </div>
                </DialogHeader>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <RentalTypeButton 
                        type="particular" 
                        icon={User} 
                        label="Particular" 
                        colorClass="bg-blue-50 text-blue-700 border-blue-600"
                    />
                    <RentalTypeButton 
                        type="motorista" 
                        icon={Users} 
                        label="Motorista App" 
                        colorClass="bg-green-50 text-green-700 border-green-600"
                    />
                    <RentalTypeButton 
                        type="corporativo" 
                        icon={Building2} 
                        label="Corporativo" 
                        colorClass="bg-purple-50 text-purple-700 border-purple-600"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40}/></div>
                ) : (
                    <Tabs defaultValue={showParticularTabs ? "diario" : "trimestral"} className="w-full">
                        <TabsList className="flex flex-wrap h-auto bg-gray-100 p-1 gap-1">
                            {showParticularTabs && (
                                <TabsTrigger value="diario" className="flex gap-2">Diário</TabsTrigger>
                            )}
                            <TabsTrigger value="semanal" className="flex gap-2">Semanal</TabsTrigger>
                            <TabsTrigger value="franquia" className="flex gap-2">Mensal</TabsTrigger>
                            <TabsTrigger value="trimestral" className="flex gap-2">Trimestral</TabsTrigger>
                            <TabsTrigger value="semestral" className="flex gap-2">Semestral</TabsTrigger>
                            {showMotoristaTabs && (
                                <TabsTrigger value="anual" className="flex gap-2">Anual</TabsTrigger>
                            )}
                        </TabsList>

                        {/* Diário Content */}
                        <TabsContent value="diario" className="space-y-4 py-4">
                            <PricingTable 
                                items={currentPricing.diario} 
                                onUpdate={handleUpdatePrice} 
                                type="diario"
                                labelKey="label"
                                subLabel="Uso diário"
                            />
                        </TabsContent>

                        {/* Semanal Content */}
                        <TabsContent value="semanal" className="space-y-4 py-4">
                            <PricingTable 
                                items={currentPricing.semanal} 
                                onUpdate={handleUpdatePrice} 
                                type="semanal"
                                labelKey="plano_km"
                                suffix="km"
                                subLabel="Pacote Semanal"
                            />
                        </TabsContent>

                        {/* Mensal / Franquia Content */}
                        <TabsContent value="franquia" className="space-y-4 py-4">
                             <PricingTable 
                                items={currentPricing.franquia} 
                                onUpdate={handleUpdatePrice} 
                                type="franquia"
                                labelKey="plano_km"
                                suffix="km"
                                subLabel="Pacote Mensal"
                            />
                        </TabsContent>

                        {/* Trimestral Content */}
                        <TabsContent value="trimestral" className="space-y-4 py-4">
                            {Array.isArray(currentPricing.trimestral) ? (
                                <PricingTable 
                                    items={currentPricing.trimestral} 
                                    onUpdate={handleUpdatePrice} 
                                    type="trimestral"
                                    labelKey="plano_km"
                                    suffix="km"
                                    subLabel="Pacote Trimestral"
                                />
                            ) : (
                                <SinglePriceInput 
                                    value={currentPricing.trimestral?.preco_total}
                                    onChange={(v) => handleUpdatePrice(v, 'trimestral')}
                                    label="Valor Trimestral (90 Dias)"
                                />
                            )}
                        </TabsContent>

                        {/* Semestral Content */}
                        <TabsContent value="semestral" className="space-y-4 py-4">
                            {Array.isArray(currentPricing.semestral) ? (
                                <PricingTable 
                                    items={currentPricing.semestral} 
                                    onUpdate={handleUpdatePrice} 
                                    type="semestral"
                                    labelKey="plano_km"
                                    suffix="km"
                                    subLabel="Pacote Semestral"
                                />
                            ) : (
                                <SinglePriceInput 
                                    value={currentPricing.semestral?.preco_total}
                                    onChange={(v) => handleUpdatePrice(v, 'semestral')}
                                    label="Valor Semestral (180 Dias)"
                                />
                            )}
                        </TabsContent>
                        
                         {/* Anual Content */}
                         <TabsContent value="anual" className="space-y-4 py-4">
                            {Array.isArray(currentPricing.anual) ? (
                                <PricingTable 
                                    items={currentPricing.anual} 
                                    onUpdate={handleUpdatePrice} 
                                    type="anual"
                                    labelKey="plano_km"
                                    suffix="km"
                                    subLabel="Pacote Anual"
                                />
                            ) : (
                                <div className="text-gray-500 text-center py-4">Não disponível para este tipo.</div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
};

// Helper Components
const PricingTable = ({ items, onUpdate, type, labelKey = 'label', suffix = '', subLabel }) => {
    if (!items || items.length === 0) return <div className="text-center text-gray-400 py-4">Nenhum plano configurado.</div>;
    return (
        <div className="grid grid-cols-1 gap-3">
            {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-full text-gray-700 font-bold text-xs w-24 text-center">
                            {item[labelKey]} {suffix}
                        </div>
                        <span className="text-gray-600 text-sm">{subLabel}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">R$</span>
                        <Input 
                            type="number" 
                            className="w-28 h-9" 
                            defaultValue={item.preco_diaria || item.preco_total || ''}
                            onBlur={(e) => onUpdate(e.target.value, type, item.uso_km || item.plano_km)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const SinglePriceInput = ({ value, onChange, label }) => (
    <div className="flex flex-col gap-2 p-6 border rounded-xl bg-white items-center text-center">
        <Label>{label}</Label>
        <div className="flex items-center gap-2 w-full max-w-xs">
            <span className="text-2xl font-bold text-gray-400">R$</span>
            <Input 
                type="number" 
                className="text-2xl h-14 font-bold text-center"
                placeholder="0.00"
                defaultValue={value || ''}
                onBlur={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

export default CarPricingModal;