import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import authService from '@/services/auth/auth-service';

const ConfirmarEmail = () => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // O token_hash pode vir como query param ou no hash da URL
    const params = new URLSearchParams(location.search);
    const tokenHash = params.get('token_hash') || params.get('token');

    if (!tokenHash) {
      setStatus('error');
      setErrorMsg('Token de confirmação não encontrado na URL.');
      return;
    }

    authService.postConfirmarEmail({ token_hash: tokenHash })
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err?.response?.data?.message || err.message || 'Erro ao confirmar e-mail.');
      });
  }, []);

  return (
    <>
      <Helmet><title>Confirmação de E-mail - JL RENT A CAR</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-[#0E3A2F] via-[#165945] to-[#0E3A2F] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          {status === 'loading' && (
            <>
              <Loader2 size={52} className="animate-spin text-[#00D166] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#0E3A2F]">Confirmando seu e-mail...</h2>
              <p className="text-gray-500 mt-2 text-sm">Aguarde um momento.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={52} className="text-[#00D166] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#0E3A2F] mb-2">E-mail confirmado!</h2>
              <p className="text-gray-600 text-sm">
                Sua conta foi ativada com sucesso. Você será redirecionado para o login em instantes.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={52} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Falha na confirmação</h2>
              <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-[#0E3A2F] text-white rounded-xl font-bold hover:bg-[#165945] transition-colors"
              >
                Ir para o Login
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ConfirmarEmail;
