import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Wifi, WifiOff, Clock, Loader2, X, RefreshCw, QrCode, CheckCircle } from 'lucide-react';
import whatsappService from '@/services/whatsapp/whatsapp-service';

const unwrap = (res) => res?.data ?? res;

const STATE_CONFIG = {
  open:       { label: 'WA Conectado',    color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500',  Icon: Wifi },
  connecting: { label: 'Conectando…',     color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', Icon: Clock },
  close:      { label: 'WA Desconectado', color: 'bg-red-100 text-red-700 border-red-200',           dot: 'bg-red-500',    Icon: WifiOff },
};

const WhatsAppStatusWidget = () => {
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const pollRef = useRef(null);

  const fetchStatus = async (silent = false) => {
    if (!silent) setStatusLoading(true);
    try {
      const res = await whatsappService.getStatus();
      setStatus(unwrap(res));
    } catch {
      setStatus(null);
    } finally {
      if (!silent) setStatusLoading(false);
    }
  };

  // Initial status + SSE listener + 5s polling fallback
  useEffect(() => {
    fetchStatus();

    const base = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const es = new EventSource(`${base}/whatsapp/eventos`);

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.tipo === 'conexao') {
          setStatus(payload.dados);
          const state = payload.dados?.estado ?? (payload.dados?.conectado ? 'open' : 'close');
          if (state === 'open') setJustConnected(true);
        }
      } catch {}
    };

    const interval = setInterval(() => fetchStatus(true), 5000);

    return () => {
      es.close();
      clearInterval(interval);
    };
  }, []);

  const connectionState = status?.estado ?? (status?.conectado ? 'open' : 'close');
  const isConnected = connectionState === 'open';

  const fetchQrCode = async () => {
    setQrLoading(true);
    try {
      const res = await whatsappService.getWhatsappQrCode();
      setQrData(unwrap(res));
    } catch {
      setQrData(null);
    } finally {
      setQrLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setJustConnected(false);
    if (!isConnected) fetchQrCode();
  };

  const closeModal = () => {
    setShowModal(false);
    setQrData(null);
    setJustConnected(false);
    clearInterval(pollRef.current);
  };

  // Poll /status every 3s while modal is open and not yet connected
  useEffect(() => {
    if (!showModal || isConnected || justConnected) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await whatsappService.getStatus();
        const data = unwrap(res);
        setStatus(data);
        const state = data?.estado ?? (data?.conectado ? 'open' : 'close');
        if (state === 'open') {
          setJustConnected(true);
          clearInterval(pollRef.current);
        }
      } catch {}
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [showModal, isConnected, justConnected]);

  const cfg = STATE_CONFIG[connectionState] ?? STATE_CONFIG.close;
  const showSuccess = justConnected || (showModal && isConnected);

  return (
    <>
      <button
        onClick={openModal}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color} hover:opacity-80 transition-opacity`}
        title="Status WhatsApp"
      >
        {statusLoading
          ? <Loader2 className="animate-spin" size={12} />
          : <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} ${isConnected ? 'animate-pulse' : ''}`} />
        }
        <span className="hidden md:inline">{cfg.label}</span>
        <cfg.Icon size={13} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">WhatsApp</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {showSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle className="text-green-500" size={48} />
                <p className="font-bold text-green-700 text-lg">Conectado com sucesso!</p>
                <p className="text-sm text-gray-500 text-center">
                  O WhatsApp está conectado e pronto para uso.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-2 px-6 py-2 bg-[#0E3A2F] text-white rounded-xl font-bold"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Abra o WhatsApp no celular, vá em{' '}
                  <strong>Aparelhos conectados</strong> e escaneie o código abaixo.
                </p>

                <div className="flex items-center justify-center min-h-[220px]">
                  {qrLoading ? (
                    <Loader2 className="animate-spin text-green-500" size={40} />
                  ) : qrData?.qrcode ? (
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <QRCodeSVG
                        value={qrData.qrcode}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#0E3A2F"
                        level="M"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-sm">
                      <QrCode size={48} className="mx-auto mb-2 opacity-30" />
                      Não foi possível gerar o QR Code.
                    </div>
                  )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-2">
                  <Loader2 className="animate-spin inline-block mr-1" size={12} />
                  Aguardando leitura do QR Code…
                </p>

                <button
                  onClick={fetchQrCode}
                  disabled={qrLoading}
                  className="w-full mt-4 py-2.5 border-2 border-[#0E3A2F] text-[#0E3A2F] font-bold rounded-xl hover:bg-[#0E3A2F]/5 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {qrLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  Atualizar QR Code
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppStatusWidget;
