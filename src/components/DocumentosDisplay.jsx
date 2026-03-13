import React from 'react';
import { FileText, Download, Eye, AlertCircle, Home, Wallet, CreditCard, AlertTriangle } from 'lucide-react';
import { formatarTamanhoArquivo } from '@/lib/validationUtils';
import { cn } from '@/lib/utils';

const getDocumentConfig = (type) => {
    switch (type) {
        case 'cnh':
            return { label: 'CNH', color: 'blue', icon: Wallet, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        case 'cpf':
            return { label: 'CPF', color: 'green', icon: CreditCard, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
        case 'rg':
            return { label: 'RG', color: 'purple', icon: FileText, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
        case 'comprovante_residencia':
            return { label: 'Comprovante Residência', color: 'orange', icon: Home, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
        case 'historico_criminal':
            return { label: 'Histórico Criminal', color: 'red', icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
        default:
            return { label: type, color: 'gray', icon: FileText, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
};

const DocumentosDisplay = ({ documentos = [], className }) => {
    if (!documentos || documentos.length === 0) {
        return (
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-center text-gray-500 flex flex-col items-center">
                <AlertCircle className="mb-2 text-gray-400" size={24} />
                <span className="text-sm font-medium">Nenhum documento anexado.</span>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {documentos.map((doc, index) => {
                const config = getDocumentConfig(doc.tipo);
                const Icon = config.icon;
                
                return (
                    <div key={index} className={cn("rounded-xl border p-4 flex flex-col shadow-sm transition-all hover:shadow-md", config.bg, config.border)}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={cn("p-2 rounded-lg bg-white shadow-sm", config.text)}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h4 className={cn("font-bold text-sm", config.text)}>{config.label}</h4>
                                    <span className="text-xs text-gray-500 opacity-80">{new Date(doc.data_upload).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-4 flex-grow">
                            <p className="text-xs font-medium text-gray-700 truncate" title={doc.nome}>{doc.nome}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatarTamanhoArquivo(doc.tamanho)}</p>
                        </div>

                        <div className="flex gap-2 mt-auto">
                             <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                             >
                                <Eye size={14} /> Visualizar
                             </a>
                             <a 
                                href={doc.url} 
                                download={doc.nome}
                                className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors opacity-90 hover:opacity-100", `bg-${config.color}-600`)}
                                style={{ backgroundColor: config.color === 'purple' ? '#9333ea' : config.color === 'orange' ? '#ea580c' : undefined }} // Tailwind dynamic class fix
                             >
                                <Download size={14} /> Baixar
                             </a>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DocumentosDisplay;