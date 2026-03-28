import React, { useState } from 'react';
import authService from '@/services/auth/auth-service';
import { Helmet } from 'react-helmet';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const RecuperarSenha = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Enviando link de recuperação...");
        
        try {
            await authService.postEsqueceuSenha({ email });
            toast({ title: "E-mail enviado!", description: "Verifique sua caixa de entrada.", className: "bg-green-600 text-white" });
        } catch (error) {
            toast({ title: "Erro", description: error?.message || 'Falha ao enviar e-mail.', variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Helmet title="Recuperar Senha" />
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <Link to="/login" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-[#0E3A2F]"><ArrowLeft size={16}/> Voltar</Link>
                <h1 className="text-2xl font-bold text-[#0E3A2F] mb-2">Recuperar Senha</h1>
                <p className="text-gray-500 mb-6 text-sm">Digite seu e-mail para receber o link de redefinição.</p>
                
                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"
                            />
                        </div>
                    </div>
                    <button disabled={loading} className="w-full py-3 bg-[#0E3A2F] text-white font-bold rounded-lg hover:bg-[#165945] flex justify-center items-center gap-2">
                        {loading && <Loader2 className="animate-spin" size={18}/>} Enviar Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RecuperarSenha;