import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getConteudo } from '@/services/conteudoService';
import { Loader2 } from 'lucide-react';

const NormaLGPD = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getConteudo('norma-lgpd').then(res => {
            setData(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00D166]"/></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <Helmet title={data?.titulo || "Norma LGPD"} />
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-bold text-[#0E3A2F] mb-8 pb-4 border-b">{data?.titulo || "Norma LGPD"}</h1>
                <div 
                    className="prose max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: data?.conteudo || "<p>Carregando...</p>" }}
                />
            </div>
        </div>
    );
};

export default NormaLGPD;