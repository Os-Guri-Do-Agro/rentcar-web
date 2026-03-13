import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from 'react-router-dom';

const TermosModal = ({ open, onAccept, onCancel }) => {
    console.log("[TermosModal] Render", open);
    const [checks, setChecks] = useState({ termos: false, privacidade: false, lgpd: false });

    const allChecked = checks.termos && checks.privacidade && checks.lgpd;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Termos e Condições</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Para continuar, você precisa ler e aceitar nossos termos e políticas.</p>
                    
                    <div className="flex items-center space-x-2">
                        <Checkbox id="termos" checked={checks.termos} onCheckedChange={(c) => setChecks(p => ({...p, termos: c}))} />
                        <label htmlFor="termos" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Aceito os <Link to="/termos-de-uso" target="_blank" className="text-[#00D166] underline">Termos de Uso</Link>
                        </label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="privacidade" checked={checks.privacidade} onCheckedChange={(c) => setChecks(p => ({...p, privacidade: c}))} />
                        <label htmlFor="privacidade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Aceito a <Link to="/politica-privacidade" target="_blank" className="text-[#00D166] underline">Política de Privacidade</Link>
                        </label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="lgpd" checked={checks.lgpd} onCheckedChange={(c) => setChecks(p => ({...p, lgpd: c}))} />
                        <label htmlFor="lgpd" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Aceito a <Link to="/norma-lgpd" target="_blank" className="text-[#00D166] underline">Norma LGPD</Link>
                        </label>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between gap-2">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-500 text-sm hover:bg-gray-100 rounded">Cancelar</button>
                    <button 
                        onClick={onAccept} 
                        disabled={!allChecked}
                        className="px-6 py-2 bg-[#0E3A2F] text-white rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Aceitar e Continuar
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TermosModal;