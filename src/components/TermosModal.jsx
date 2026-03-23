import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';

const TermosModal = ({ open, onAccept, onCancel }) => {
    const [aceito, setAceito] = useState(false);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Termos e Condições</DialogTitle>
                </DialogHeader>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors my-2 ${aceito ? 'border-[#00D166] bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                    <input
                        type="checkbox"
                        checked={aceito}
                        onChange={() => setAceito(p => !p)}
                        className="w-4 h-4 mt-0.5 accent-[#00D166] cursor-pointer shrink-0"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                        Li e concordo com os{' '}
                        <Link to="/termos-de-uso" target="_blank" onClick={(e) => e.stopPropagation()} className="text-[#00D166] underline font-medium hover:text-[#00b356]">Termos de Uso</Link>
                        {', '}
                        <Link to="/politica-privacidade" target="_blank" onClick={(e) => e.stopPropagation()} className="text-[#00D166] underline font-medium hover:text-[#00b356]">Política de Privacidade</Link>
                        {' e '}
                        <Link to="/norma-lgpd" target="_blank" onClick={(e) => e.stopPropagation()} className="text-[#00D166] underline font-medium hover:text-[#00b356]">Norma LGPD</Link>
                        .
                    </span>
                </label>

                <DialogFooter className="sm:justify-between gap-2">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-500 text-sm hover:bg-gray-100 rounded transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={onAccept}
                        disabled={!aceito}
                        className="px-6 py-2 bg-[#0E3A2F] text-white rounded font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#165945] transition-colors"
                    >
                        Aceitar e Continuar
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TermosModal;