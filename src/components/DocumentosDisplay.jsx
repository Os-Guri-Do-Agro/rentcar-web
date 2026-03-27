import React, { useState } from 'react';
import { FileText, Download, Eye, AlertCircle, Home, Wallet, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { formatarTamanhoArquivo } from '@/lib/validationUtils';
import { cn } from '@/lib/utils';
import documentosService from '@/services/reservas/documentos/documentos-service';

const getDocumentConfig = (type) => {
    switch (type) {
        case 'cnh':
            return { label: 'CNH', color: 'blue', icon: Wallet, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        case 'cnh_responsavel':
            return { label: 'CNH do Responsável', color: 'blue', icon: Wallet, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        case 'cpf':
            return { label: 'CPF', color: 'green', icon: CreditCard, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
        case 'rg':
            return { label: 'RG', color: 'purple', icon: FileText, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
        case 'comprovante_residencia':
            return { label: 'Comprovante Residência', color: 'orange', icon: Home, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
        case 'historico_criminal':
            return { label: 'Histórico Criminal', color: 'red', icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
        case 'comprovante_trabalho_plataforma':
            return { label: 'Comprovante de Trabalho', color: 'orange', icon: FileText, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
        case 'cnpj':
            return { label: 'CNPJ', color: 'purple', icon: CreditCard, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
        case 'documento_admin':
            return { label: 'Documento Admin', color: 'green', icon: FileText, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
        default:
            return { label: type, color: 'gray', icon: FileText, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
};

const DocumentosDisplay = ({ documentos = [], reservaId, className }) => {
    const [downloading, setDownloading] = useState(null);

    const handleDownload = async (doc) => {
        if (!reservaId || !doc.id) return;
        setDownloading(doc.id);
        try {
            const blob = await documentosService.getDocumentosDownload(reservaId, doc.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.nome;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao baixar documento:', err);
        } finally {
            setDownloading(null);
        }
    };

    if (!documentos || documentos.length === 0) {
        return (
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-center text-gray-500 flex flex-col items-center">
                <AlertCircle className="mb-2 text-gray-400" size={24} />
                <span className="text-sm font-medium">Nenhum documento anexado.</span>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
            {documentos.map((doc, index) => {
                const config = getDocumentConfig(doc.tipo);
                const Icon = config.icon;

                return (
                    <div key={index} className={cn("rounded-xl border p-3 flex flex-col gap-3 shadow-sm transition-all hover:shadow-md min-w-0", config.bg, config.border)}>
                        <div className="flex items-center gap-2 min-w-0">
                            <div className={cn("p-2 rounded-lg bg-white shadow-sm shrink-0", config.text)}>
                                <Icon size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className={cn("font-bold text-sm truncate", config.text)}>{config.label}</h4>
                                <span className="text-xs text-gray-500">{new Date(doc.data_upload).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="bg-white/60 rounded-lg px-2.5 py-2 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate leading-snug" title={doc.nome}>{doc.nome}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatarTamanhoArquivo(doc.tamanho)}</p>
                        </div>

                        <div className="flex gap-2 mt-auto">
                             <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors truncate"
                             >
                                <Eye size={13} className="shrink-0" /> <span className="truncate">Visualizar</span>
                             </a>
                             <button
                                onClick={() => handleDownload(doc)}
                                disabled={downloading === doc.id}
                                className={cn("flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-white transition-colors opacity-90 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed", `bg-${config.color}-600`)}
                                style={{ backgroundColor: config.color === 'purple' ? '#9333ea' : config.color === 'orange' ? '#ea580c' : undefined }}
                             >
                                {downloading === doc.id ? <Loader2 size={13} className="animate-spin shrink-0" /> : <Download size={13} className="shrink-0" />} <span className="truncate">Baixar</span>
                             </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DocumentosDisplay;