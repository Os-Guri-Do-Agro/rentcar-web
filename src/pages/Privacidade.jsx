import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { getConteudo } from '@/services/conteudoService';

const Privacidade = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            console.log("[Privacidade] Fetching content...");
            try {
                const data = await getConteudo('politica-privacidade');
                if (data && data.conteudo) {
                    setContent(data);
                } else {
                    // Fallback content
                    setContent({
                        titulo: 'Política de Privacidade',
                        conteudo: `
                            <h2>1. Introdução</h2>
                            <p>A JL RENT A CAR valoriza a privacidade de seus usuários e está comprometida em proteger seus dados pessoais. Esta política descreve como coletamos, usamos e protegemos suas informações.</p>
                            
                            <h2>2. Coleta de Dados</h2>
                            <p>Coletamos informações pessoais necessárias para a prestação de nossos serviços de locação, incluindo nome, endereço, CNH, CPF e dados de contato.</p>
                            
                            <h2>3. Uso de Dados</h2>
                            <p>Seus dados são utilizados exclusivamente para fins de cadastro, análise de crédito (quando aplicável), formalização de contratos e comunicação sobre sua reserva.</p>
                            
                            <h2>4. Proteção de Dados</h2>
                            <p>Adotamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração ou destruição.</p>
                            
                            <h2>5. Direitos do Usuário</h2>
                            <p>Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais, conforme previsto na LGPD (Lei Geral de Proteção de Dados).</p>
                            
                            <h2>6. Contato</h2>
                            <p>Para questões relacionadas à privacidade, entre em contato através de nosso e-mail ou telefone disponíveis na página de contato.</p>
                        `
                    });
                }
            } catch (error) {
                console.error("[Privacidade] Error:", error);
                setContent({ 
                    titulo: 'Erro', 
                    conteudo: '<p>Não foi possível carregar o conteúdo. Tente novamente mais tarde.</p>' 
                });
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#0E3A2F]" size={40}/></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <Helmet title={`${content?.titulo || 'Política de Privacidade'} - JL RENT A CAR`} />
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-[#0E3A2F] mb-8 pb-4 border-b border-gray-100">{content?.titulo}</h1>
                <div 
                    className="prose prose-lg max-w-none text-gray-600 prose-headings:text-[#0E3A2F] prose-a:text-[#00D166]"
                    dangerouslySetInnerHTML={{ __html: content?.conteudo }}
                />
            </div>
        </div>
    );
};

export default Privacidade;