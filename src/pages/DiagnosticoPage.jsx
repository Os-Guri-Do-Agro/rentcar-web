import React, { useEffect, useState } from 'react';
import { generateDiagnosticReport } from '@/lib/diagnosticUtils';
import { Loader2, Database, Code, AlertTriangle, CheckCircle, Clipboard, Terminal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const DiagnosticoPage = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        runDiagnostic();
    }, []);

    const runDiagnostic = async () => {
        setLoading(true);
        try {
            const data = await generateDiagnosticReport();
            setReport(data);
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao gerar diagnóstico.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const copyReport = () => {
        const text = JSON.stringify(report, null, 2);
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado", description: "Relatório copiado para a área de transferência.", className: "bg-blue-600 text-white border-none" });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <Loader2 className="animate-spin text-[#0E3A2F]" size={48} />
        <p className="text-gray-500 font-medium">Executando diagnóstico do sistema...</p>
    </div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <Helmet title="Diagnóstico do Sistema | Admin" />
            
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0E3A2F]">Diagnóstico do Sistema</h1>
                        <p className="text-gray-500">Relatório gerado em: {new Date(report?.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={runDiagnostic} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                            <Terminal size={16}/> Reexecutar
                        </button>
                        <button onClick={copyReport} className="px-4 py-2 bg-[#0E3A2F] text-white rounded-lg hover:bg-[#165945] font-medium flex items-center gap-2">
                            <Clipboard size={16}/> Copiar JSON
                        </button>
                    </div>
                </div>

                {/* Problems Section */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
                    <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-3">
                        <AlertTriangle className="text-orange-600" />
                        <h2 className="font-bold text-orange-900">Problemas Identificados & Recomendações</h2>
                    </div>
                    <div className="p-6">
                        {report?.problems?.length > 0 ? (
                            <ul className="space-y-3">
                                {report.problems.map((prob, idx) => (
                                    <li key={idx} className="flex gap-3 items-start p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                                        <span className="text-gray-800 text-sm">{prob}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <CheckCircle size={20} /> Nenhum problema crítico identificado na análise estática.
                            </div>
                        )}
                    </div>
                </div>

                {/* Database Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                        <Database className="text-[#0E3A2F]" />
                        <h2 className="font-bold text-gray-900">Estrutura do Banco de Dados (Visível)</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(report?.database || {}).map(([table, info]) => (
                            <div key={table} className="border rounded-lg p-4">
                                <h3 className="font-bold text-lg text-[#0E3A2F] mb-2 capitalize">{table}</h3>
                                {info.error ? (
                                    <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{info.error}</p>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Colunas Detectadas ({info.columns?.length || 0})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {info.columns?.map(col => (
                                                <span key={col} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border font-mono">
                                                    {col}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Code Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                        <Code className="text-[#0E3A2F]" />
                        <h2 className="font-bold text-gray-900">Análise de Código de Serviços</h2>
                    </div>
                    <div className="p-0">
                        <pre className="p-6 bg-[#1e1e1e] text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                            {report?.code?.reserva}
                            {'\n--------------------------------\n'}
                            {report?.code?.documentos}
                            {'\n--------------------------------\n'}
                            {report?.code?.usuario}
                        </pre>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DiagnosticoPage;