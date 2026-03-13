import React, { useMemo } from 'react';

const EmailPreview = ({ content, variables }) => {
    const renderedContent = useMemo(() => {
        if (!content) return '';
        let rendered = content;
        
        // Simple replacements
        const exampleData = {
            'user.nome': 'João Silva',
            'user.email': 'joao@email.com',
            'user.telefone': '(11) 99999-9999',
            'car.marca': 'Toyota',
            'car.modelo': 'Corolla',
            'car.placa': 'ABC-1234',
            'reserva.id': 'RES-123456',
            'reserva.data_retirada': '01/01/2026',
            'reserva.data_devolucao': '05/01/2026',
            'reserva.valor_total': 'R$ 1.200,00',
            'reserva.status': 'Confirmada',
            'reserva.plano': 'Livre',
            'reserva.franquia_km': 'Ilimitado'
        };

        // If variables array provided, ensure keys exist in example data
        if (Array.isArray(variables)) {
            variables.forEach(v => {
                 if (!exampleData[v]) exampleData[v] = `[${v}]`;
            });
        }

        Object.keys(exampleData).forEach(key => {
            // Replace {{key}}
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, `<span class="bg-yellow-100 text-yellow-800 px-1 rounded">${exampleData[key]}</span>`);
        });

        return rendered;
    }, [content, variables]);

    return (
        <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
            <div className="mb-2 text-xs font-bold text-gray-400 uppercase">Preview (Dados de Exemplo)</div>
            <div 
                className="prose max-w-none bg-white p-6 rounded shadow-sm min-h-[250px]"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
        </div>
    );
};

export default EmailPreview;