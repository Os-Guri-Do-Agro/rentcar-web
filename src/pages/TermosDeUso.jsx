import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { getConteudo } from '@/services/conteudoService';

const TermosDeUso = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            console.log("[TermosDeUso] Fetching content...");
            try {
                const data = await getConteudo('termos-uso');
                if (data && data.conteudo) {
                    setContent(data);
                } else {
                    // Fallback content
                    setContent({
                        titulo: 'Termos de Uso',
                        conteudo: `
                            <h2>1. Aceitação dos Termos</h2>
                            <p>Ao utilizar os serviços da JL RENT A CAR, você concorda com estes termos de uso. Se não concordar, por favor, não utilize nossos serviços.</p>
                            
                            <h2>2. Descrição do Serviço</h2>
                            <p>Fornecemos serviços de locação de veículos para motoristas de aplicativo e particulares, sujeitos à disponibilidade e aprovação cadastral.</p>
                            
                            <h2>3. Responsabilidades do Usuário</h2>
                            <p>O usuário é responsável por fornecer informações verdadeiras, manter a segurança de sua conta e utilizar os veículos conforme as leis de trânsito e contrato de locação.</p>
                            
                            <h2>4. Limitações de Responsabilidade</h2>
                            <p>A JL RENT A CAR não se responsabiliza por danos indiretos decorrentes do uso do serviço ou da indisponibilidade de veículos.</p>
                            
                            <h2>5. Modificações dos Termos</h2>
                            <p>Reservamo-nos o direito de alterar estes termos a qualquer momento. O uso continuado do serviço implica na aceitação das alterações.</p>
                            
                            <h2>6. Encerramento</h2>
                            <p>Podemos encerrar ou suspender seu acesso ao serviço em caso de violação destes termos.</p>
                            
                            <h2>7. Contato</h2>
                            <p>Dúvidas sobre os termos podem ser encaminhadas aos nossos canais de atendimento.</p>
                        `
                    });
                }
            } catch (error) {
                console.error("[TermosDeUso] Error:", error);
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
            <Helmet title={`${content?.titulo || 'Termos de Uso'} - JL RENT A CAR`} />
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

export default TermosDeUso;