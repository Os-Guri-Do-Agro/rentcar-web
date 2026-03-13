import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet';
import { Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const RedefinirSenha = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password !== confirm) return toast({ title: "Senhas não conferem", variant: "destructive" });
        if (password.length < 6) return toast({ title: "Senha muito curta", variant: "destructive" });

        setLoading(true);
        console.log("Atualizando senha...");
        
        const { error } = await supabase.auth.updateUser({ password });

        setLoading(false);
        if (error) {
            console.error(error);
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Senha atualizada!", className: "bg-green-600 text-white" });
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Helmet title="Redefinir Senha" />
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-[#0E3A2F] mb-6">Nova Senha</h1>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"/>
                        </div>
                    </div>
                    <button disabled={loading} className="w-full py-3 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg hover:bg-[#00F178] flex justify-center items-center gap-2">
                        {loading && <Loader2 className="animate-spin" size={18}/>} Redefinir Senha
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RedefinirSenha;