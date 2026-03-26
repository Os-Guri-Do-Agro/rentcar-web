/*
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Helmet } from 'react-helmet';
import {
  Loader2, Send, Search, RefreshCw, MessageCircle,
  Wifi, WifiOff, Phone, X, CheckCircle, AlertCircle,
  Clock, Image, MapPin, QrCode, LogOut
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import whatsappService from '@/services/whatsapp/whatsapp-service';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtJid = (jid = '') => jid.replace(/@.*$/, '');

const fmtPhone = (jid = '') => {
  const num = fmtJid(jid);
  if (num.length === 13) return `+${num.slice(0, 2)} (${num.slice(2, 4)}) ${num.slice(4, 9)}-${num.slice(9)}`;
  if (num.length === 12) return `+${num.slice(0, 2)} (${num.slice(2, 4)}) ${num.slice(4, 8)}-${num.slice(8)}`;
  return num;
};

const fmtTime = (ts) => {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const fmtDateLabel = (ts) => {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const unwrap = (res) => res?.data ?? res;

// ─── Status Badge ────────────────────────────────────────────────────────────

const StatusBadge = ({ state }) => {
  const map = {
    open:       { label: 'Conectado',    color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500',  Icon: Wifi },
    connecting: { label: 'Conectando…',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', Icon: Clock },
    close:      { label: 'Desconectado', color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',    Icon: WifiOff },
  };
  const cfg = map[state] ?? map.close;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot} ${state === 'open' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
};

// ─── Verificar Número Modal ──────────────────────────────────────────────────

const VerificarNumeroModal = ({ onClose }) => {
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    const clean = number.replace(/\D/g, '');
    if (clean.length < 10) {
      toast({ title: 'Número inválido', description: 'Informe um número com DDI+DDD.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await whatsappService.postVerificarNumero({ number: clean });
      setResult(unwrap(res));
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível verificar o número.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Verificar Número</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Confira se um número possui WhatsApp antes de enviar mensagem.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={number}
            onChange={e => setNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            placeholder="5511999990000"
            className="flex-1 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className="px-4 py-2 bg-[#0E3A2F] text-white rounded-xl font-bold hover:bg-[#165945] disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </button>
        </div>

        {result !== null && (
          <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${result?.existe ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {result?.existe
              ? <><CheckCircle size={16} /> Número possui WhatsApp {result.jid && <span className="text-xs opacity-70 ml-1">({result.jid})</span>}</>
              : <><AlertCircle size={16} /> Número não encontrado no WhatsApp</>
            }
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Nova Mensagem Modal (multi-tipo) ────────────────────────────────────────

const SEND_TABS = [
  { id: 'texto',       label: 'Texto',       Icon: MessageCircle },
  { id: 'localizacao', label: 'Localização', Icon: MapPin },
];

const NovaMensagemModal = ({ onClose, onSent, defaultNumber = '' }) => {
  const [tab, setTab] = useState('texto');
  const [number, setNumber] = useState(defaultNumber);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [text, setText] = useState('');
  const [locName, setLocName] = useState('JL Rent Car — Matriz');
  const [address, setAddress] = useState('Rua Fernando Falcão, 54 - Mooca, São Paulo - SP');

  const clean = number.replace(/\D/g, '');

  const handleSend = async () => {
    if (clean.length < 10) {
      toast({ title: 'Número inválido', description: 'Informe o número com DDI+DDD.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      if (tab === 'texto') {
        if (!text.trim()) throw new Error('Informe a mensagem.');
        await whatsappService.postEnviar({ number: clean, text: text.trim() });
      } else if (tab === 'localizacao') {
        if (!locName.trim() || !address.trim()) throw new Error('Preencha o nome e endereço.');
        await whatsappService.postEnviarLocalizacao({ number: clean, latitude: -23.5543629, longitude: -46.5840944, name: locName.trim(), address: address.trim() });
      }
      toast({ title: 'Mensagem enviada!', className: 'bg-green-600 text-white' });
      onSent?.();
      onClose();
    } catch (err) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Nova Mensagem</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número (DDI+DDD)</label>
          <input
            type="text"
            value={number}
            onChange={e => setNumber(e.target.value)}
            placeholder="5511999990000"
            className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-xl">
          {SEND_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === id ? 'bg-white text-[#0E3A2F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {tab === 'texto' && (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Digite a mensagem… (suporta *negrito*, _itálico_)"
              rows={4}
              className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
            />
          )}

          {tab === 'localizacao' && (
            <>
              <input type="text" value={locName} onChange={e => setLocName(e.target.value)} placeholder="Nome do local" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço legível" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full mt-5 py-3 bg-[#00D166] text-[#0E3A2F] font-bold rounded-xl hover:bg-[#00F178] flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {loading ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};

// ─── QR Code Modal ───────────────────────────────────────────────────────────

const QrCodeModal = ({ qrData, qrLoading, refreshLoading, onClose, onRefresh }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Conectar WhatsApp</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Abra o WhatsApp no celular, vá em <strong>Aparelhos conectados</strong> e escaneie o código abaixo.
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

      {qrData?.estado && (
        <p className="text-center text-xs text-gray-400 mt-2 capitalize">{qrData.estado}</p>
      )}

      <button
        onClick={onRefresh}
        disabled={refreshLoading || qrLoading}
        className="w-full mt-4 py-2.5 border-2 border-[#0E3A2F] text-[#0E3A2F] font-bold rounded-xl hover:bg-[#0E3A2F]/5 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
      >
        {refreshLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
        Atualizar QR Code
      </button>
    </div>
  </div>
);

// ─── Date Separator ──────────────────────────────────────────────────────────

const DateSeparator = ({ ts }) => (
  <div className="flex items-center justify-center my-3">
    <span className="bg-white/80 text-gray-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm border border-gray-100">
      {fmtDateLabel(ts)}
    </span>
  </div>
);

// ─── Avatar ──────────────────────────────────────────────────────────────────

const Avatar = ({ chat, size = 'md' }) => {
  const name = chat?.pushName || chat?.name || fmtPhone(chat?.remoteJid ?? '') || '#';
  const cls = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-11 h-11 text-sm';
  const [imgFailed, setImgFailed] = React.useState(false);
  const letter = name[0]?.toUpperCase() ?? '#';
  return (
    <div className={`${cls} rounded-full bg-[#0E3A2F] text-white flex items-center justify-center font-bold shrink-0 overflow-hidden`}>
      {chat?.profilePicUrl && !imgFailed
        ? <img src={chat.profilePicUrl} alt={name} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
        : letter
      }
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const AdminWhatsApp = () => {
  const { toast } = useToast();

  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatSearch, setChatSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sendText, setSendText] = useState('');

  const [showVerificar, setShowVerificar] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [novaMsgNumber, setNovaMsgNumber] = useState('');

  const [showQrCode, setShowQrCode] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [conectarLoading, setConectarLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);
  const textAreaRef = useRef(null);
  const [sseConnected, setSseConnected] = useState(false);

  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  // ── Auto-resize textarea ──
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [sendText]);

  // ── SSE — tempo real ──
  useEffect(() => {
    const base = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const url = `${base}/whatsapp/eventos`;
    const es = new EventSource(url);

    es.onopen = () => setSseConnected(true);

    const handleEvent = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const tipo  = payload.tipo;
        const dados = payload.dados;

        if (!tipo || !dados) return;

        const jidRecebido   = (dados.remoteJid ?? '').replace(/@.*$/, '');
        const jidSelecionado = (selectedChatRef.current?.remoteJid ?? '').replace(/@.*$/, '');
        const isChatAtual   = jidSelecionado && jidSelecionado === jidRecebido;

        if (tipo === 'mensagem_recebida') {
          if (isChatAtual) {
            const newMsg = {
              key: { id: `sse-${Date.now()}`, fromMe: false, remoteJid: dados.remoteJid },
              message: { conversation: dados.texto ?? '' },
              messageTimestamp: dados.timestamp
                ? Math.floor(new Date(dados.timestamp).getTime() / 1000)
                : Math.floor(Date.now() / 1000),
              MessageUpdate: [],
            };
            setMessages(prev => [...prev, newMsg]);
          }
          setChats(prev => {
            const idx = prev.findIndex(c => (c.remoteJid ?? '').replace(/@.*$/, '') === jidRecebido);
            if (idx === -1) return prev;
            const updated = { ...prev[idx], updatedAt: dados.timestamp ?? new Date().toISOString(), _unread: !isChatAtual };
            return [updated, ...prev.filter((_, i) => i !== idx)];
          });
        }

        if (tipo === 'mensagem_enviada') {
          setChats(prev => {
            const idx = prev.findIndex(c => (c.remoteJid ?? '').replace(/@.*$/, '') === jidRecebido);
            if (idx === -1) return prev;
            const updated = { ...prev[idx], updatedAt: dados.timestamp ?? new Date().toISOString(), _unread: false };
            return [updated, ...prev.filter((_, i) => i !== idx)];
          });
        }

        if (tipo === 'conexao') {
          setStatus(dados);
          setSseConnected(true);
        }
      } catch (e) {
        console.error('[SSE] parse error', e);
      }
    };

    es.onmessage = handleEvent;
    es.onerror = () => setSseConnected(false);

    return () => { es.close(); setSseConnected(false); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Status ──
  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await whatsappService.getStatus();
      setStatus(unwrap(res));
    } catch {
      setStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Chats ──
  const fetchChats = async () => {
    setChatsLoading(true);
    try {
      const res = await whatsappService.getChats();
      const list = unwrap(res);
      setChats(Array.isArray(list) ? list : []);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar chats.', variant: 'destructive' });
    } finally {
      setChatsLoading(false);
    }
  };

  // ── Messages ──
  const fetchMessages = async (jid) => {
    setMsgLoading(true);
    setMessages([]);
    try {
      const res = await whatsappService.getMensagens(jid);
      const records = res?.data?.messages?.records ?? res?.messages?.records ?? unwrap(res) ?? [];
      const list = Array.isArray(records) ? records : [];
      setMessages([...list].reverse());
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar mensagens.', variant: 'destructive' });
    } finally {
      setMsgLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchChats();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.remoteJid);
    setChats(prev => prev.map(c => c.remoteJid === chat.remoteJid ? { ...c, _unread: false } : c));
  };

  const handleSend = () => {
    if (!sendText.trim() || !selectedChat) return;
    const number = fmtJid(selectedChat.remoteJid);
    const text = sendText.trim();

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      key: { id: tempId, fromMe: true, remoteJid: selectedChat.remoteJid },
      message: { conversation: text },
      messageTimestamp: Math.floor(Date.now() / 1000),
      MessageUpdate: [],
      _pending: true,
    }]);
    setSendText('');

    whatsappService.postEnviar({ number, text }).then(() => {
      setMessages(prev => prev.map(m =>
        m.id === tempId ? { ...m, _pending: false } : m
      ));
    }).catch(err => {
      setMessages(prev => prev.map(m =>
        m.id === tempId ? { ...m, _pending: false, _failed: true } : m
      ));
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    });
  };

  const openNovaMensagem = (num = '') => {
    setNovaMsgNumber(num);
    setShowNova(true);
  };

  const fetchQrCode = async () => {
    setQrLoading(true);
    try {
      const res = await whatsappService.getWhatsappQrCode();
      setQrData(unwrap(res));
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível gerar o QR Code.', variant: 'destructive' });
    } finally {
      setQrLoading(false);
    }
  };

  const handleRefreshQr = async () => {
    setRefreshLoading(true);
    try {
      const res = await whatsappService.getWhatsappQrCode();
      setQrData(unwrap(res));
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o QR Code.', variant: 'destructive' });
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleConectar = async () => {
    setConectarLoading(true);
    setShowQrCode(true);
    setQrData(null);
    await fetchQrCode();
    setConectarLoading(false);
  };

  const handleDesconectar = async () => {
    setDisconnecting(true);
    try {
      await whatsappService.deleteWhatsappDesconectar();
      window.location.reload();
    } catch {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' });
      setDisconnecting(false);
    }
  };

  const connectionState = status?.estado ?? (status?.conectado ? 'open' : 'close');

  // Poll status while QR modal is open — reload when connected
  useEffect(() => {
    if (!showQrCode) return;
    const interval = setInterval(async () => {
      try {
        const res = await whatsappService.getStatus();
        const data = unwrap(res);
        if (data?.estado === 'open' || data?.conectado === true) {
          window.location.reload();
        }
      } catch {
        // silently ignore poll errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showQrCode]);

  const handleRefresh = () => {
    fetchStatus();
    fetchChats();
    if (selectedChat) fetchMessages(selectedChat.remoteJid);
  };

  const filteredChats = chats.filter(c => {
    if (!chatSearch) return true;
    const jid = fmtJid(c.id ?? c.remoteJid ?? '');
    const name = c.pushName ?? c.name ?? '';
    return jid.includes(chatSearch) || name.toLowerCase().includes(chatSearch.toLowerCase());
  });

  const getMsgText = (msg) =>
    msg.message?.conversation
    ?? msg.message?.extendedTextMessage?.text
    ?? msg.message?.imageMessage?.caption
    ?? msg.message?.documentMessage?.caption
    ?? (msg.message?.imageMessage ? '[Imagem]' : null)
    ?? (msg.message?.documentMessage ? `[Documento] ${msg.message.documentMessage.fileName ?? ''}` : null)
    ?? (msg.message?.locationMessage ? '[Localização]' : null)
    ?? '[mídia]';

  // Checkmarks coloridos: azul = lido, cinza = enviado/entregue
  const getMsgStatus = (msg) => {
    const updates = msg.MessageUpdate ?? [];
    if (!updates.length) return { symbol: '✓', blue: false };
    const last = updates[updates.length - 1]?.status ?? '';
    if (last === 'READ')         return { symbol: '✓✓', blue: true };
    if (last === 'DELIVERY_ACK') return { symbol: '✓✓', blue: false };
    return { symbol: '✓', blue: false };
  };

  // Agrupa mensagens consecutivas do mesmo remetente
  const processedMessages = messages.map((msg, idx) => {
    const isFromMe    = msg.key?.fromMe ?? false;
    const prev        = messages[idx - 1];
    const next        = messages[idx + 1];
    const prevFromMe  = prev?.key?.fromMe ?? null;
    const nextFromMe  = next?.key?.fromMe ?? null;

    const getDate = (t) => t ? new Date(typeof t === 'number' ? t * 1000 : t) : null;
    const msgDate  = getDate(msg.messageTimestamp);
    const prevDate = getDate(prev?.messageTimestamp);

    const showDateSep    = !prev || (msgDate && prevDate && msgDate.toDateString() !== prevDate.toDateString());
    const isFirstInGroup = !prev || prevFromMe !== isFromMe || showDateSep;
    const isLastInGroup  = !next || nextFromMe !== isFromMe;

    return { ...msg, _showDateSep: showDateSep, _isFirstInGroup: isFirstInGroup, _isLastInGroup: isLastInGroup };
  });

  return (
    <>
      <Helmet><title>WhatsApp - Admin JL Rent a Car</title></Helmet>

      {showVerificar && <VerificarNumeroModal onClose={() => setShowVerificar(false)} />}
      {showNova && (
        <NovaMensagemModal
          defaultNumber={novaMsgNumber}
          onClose={() => setShowNova(false)}
          onSent={fetchChats}
        />
      )}
      {showQrCode && (
        <QrCodeModal
          qrData={qrData}
          qrLoading={qrLoading}
          refreshLoading={refreshLoading}
          onClose={() => setShowQrCode(false)}
          onRefresh={handleRefreshQr}
        />
      )}

      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">

        {/* ── Top Bar ── */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <MessageCircle size={22} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WhatsApp</h1>
              <p className="text-xs text-gray-500">Gerencie conversas e envie mensagens</p>
            </div>
            <div className="ml-2 flex items-center gap-2">
              {statusLoading
                ? <span className="text-xs text-gray-400 animate-pulse">verificando…</span>
                : <StatusBadge state={connectionState} />
              }
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sseConnected ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {sseConnected ? 'ao vivo' : 'offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connectionState === 'open' ? (
              <button
                onClick={handleDesconectar}
                disabled={disconnecting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
              >
                {disconnecting ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
                Desconectar
              </button>
            ) : (
              <button
                onClick={handleConectar}
                disabled={conectarLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#0E3A2F] bg-[#00D166] hover:bg-[#00F178] rounded-xl transition-colors disabled:opacity-50"
              >
                {conectarLoading ? <Loader2 className="animate-spin" size={16} /> : <QrCode size={16} />}
                Conectar
              </button>
            )}
            <button
              onClick={() => setShowVerificar(true)}
              disabled={connectionState !== 'open'}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Phone size={16} /> Verificar Número
            </button>
            <button
              onClick={() => openNovaMensagem()}
              disabled={connectionState !== 'open'}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#0E3A2F] bg-[#00D166] hover:bg-[#00F178] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} /> Nova Mensagem
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 bg-white border rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* ── Disconnected Screen ── */}
        {connectionState !== 'open' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-50">
            <div className="w-20 h-20 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
              <WifiOff size={36} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700 text-lg">WhatsApp desconectado</p>
              <p className="text-sm text-gray-400 mt-1">Conecte para acessar conversas e enviar mensagens.</p>
            </div>
            <button
              onClick={handleConectar}
              disabled={conectarLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#0E3A2F] bg-[#00D166] hover:bg-[#00F178] rounded-xl transition-colors disabled:opacity-50"
            >
              {conectarLoading ? <Loader2 className="animate-spin" size={16} /> : <QrCode size={16} />}
              Conectar via QR Code
            </button>
          </div>
        )}

        {/* ── Split Panel ── */}
        {connectionState === 'open' && <div className="flex flex-1 min-h-0">

          {/* ── Chat List ── */}
          <aside className="w-80 shrink-0 bg-white border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Buscar conversa…"
                  value={chatSearch}
                  onChange={e => setChatSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chatsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-500" size={24} /></div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  {chatSearch ? 'Nenhuma conversa encontrada.' : 'Nenhuma conversa ainda.'}
                </div>
              ) : (
                filteredChats.map(chat => {
                  const jid = chat.remoteJid ?? chat.id ?? '';
                  const name = chat.pushName || fmtPhone(jid);
                  const isSelected = selectedChat && (selectedChat.remoteJid ?? selectedChat.id) === jid;
                  return (
                    <button
                      key={chat.id ?? jid}
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50
                        ${isSelected ? 'bg-[#f0faf4] border-l-[3px] border-l-[#00D166]' : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'}`}
                    >
                      <div className="relative shrink-0">
                        <Avatar chat={chat} />
                        {chat._unread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00D166] border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-sm truncate ${chat._unread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                            {name}
                          </span>
                          <span className={`text-[11px] shrink-0 ${chat._unread ? 'text-[#00a854] font-semibold' : 'text-gray-400'}`}>
                            {fmtTime(chat.updatedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{fmtPhone(jid)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── Messages Panel ── */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#efeae2]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c8bfb0\' fill-opacity=\'0.18\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
          >
            {!selectedChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                  <MessageCircle size={36} className="text-gray-300" />
                </div>
                <p className="font-semibold text-gray-600">Selecione uma conversa</p>
                <p className="text-sm text-gray-400 text-center max-w-xs">
                  ou use "Nova Mensagem" para enviar texto ou localização
                </p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="bg-[#f0f2f5] px-4 py-3 border-b border-black/5 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar chat={selectedChat} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {selectedChat.pushName || fmtPhone(selectedChat.remoteJid ?? selectedChat.id)}
                      </p>
                      <p className="text-xs text-gray-500">{fmtPhone(selectedChat.remoteJid ?? selectedChat.id)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openNovaMensagem(fmtJid(selectedChat.remoteJid))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0E3A2F] bg-[#00D166] hover:bg-[#00F178] rounded-lg transition-colors"
                  >
                    <Image size={14} /> Enviar mídia
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  {msgLoading ? (
                    <div className="flex justify-center pt-8"><Loader2 className="animate-spin text-green-600" size={24} /></div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 pt-8">Nenhuma mensagem encontrada.</div>
                  ) : (
                    processedMessages.map((msg, idx) => {
                      const isFromMe = msg.key?.fromMe ?? false;
                      const text = getMsgText(msg);
                      const status = getMsgStatus(msg);

                      // Arredondamento baseado na posição no grupo
                      const sentRadius = isFromMe
                        ? msg._isLastInGroup ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm' : 'rounded-2xl'
                        : msg._isLastInGroup ? 'rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm' : 'rounded-2xl';

                      return (
                        <React.Fragment key={msg.key?.id ?? idx}>
                          {msg._showDateSep && <DateSeparator ts={msg.messageTimestamp} />}

                          <div
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} ${msg._isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}
                          >
                            <div className={`max-w-[65%] px-3 py-2 shadow-sm text-sm ${sentRadius} ${
                              msg._failed  ? 'bg-red-100 text-red-700' :
                              msg._pending ? 'bg-[#dcf8c6] text-[#0E3A2F] opacity-75' :
                              isFromMe     ? 'bg-[#dcf8c6] text-gray-900' :
                                             'bg-white text-gray-900'
                            }`}>
                              <p className="leading-relaxed whitespace-pre-wrap break-words">{text}</p>
                              <p className={`text-[10px] mt-0.5 text-right flex items-center justify-end gap-1 select-none ${isFromMe ? 'text-gray-500' : 'text-gray-400'}`}>
                                {msg._failed  ? <span className="text-red-500">Falha no envio</span> :
                                 msg._pending ? <span className="opacity-60">Enviando…</span> :
                                 fmtTime(msg.messageTimestamp)}
                                {isFromMe && !msg._pending && !msg._failed && (
                                  <span className={status.blue ? 'text-blue-500' : 'text-gray-400'}>
                                    {status.symbol}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send bar */}
                <div className="bg-[#f0f2f5] px-3 py-2 border-t border-black/5 flex items-end gap-2 shrink-0">
                  <textarea
                    ref={textAreaRef}
                    value={sendText}
                    onChange={e => setSendText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Digite uma mensagem…"
                    rows={1}
                    className="flex-1 px-4 py-2.5 bg-white border-0 rounded-2xl text-sm focus:ring-2 focus:ring-green-400 outline-none resize-none leading-relaxed shadow-sm"
                    style={{ maxHeight: 128 }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!sendText.trim()}
                    className="p-2.5 bg-[#00D166] hover:bg-[#00F178] text-[#0E3A2F] rounded-full transition-all disabled:opacity-40 disabled:scale-90 shrink-0 shadow-sm"
                  >
                    <Send size={19} />
                  </button>
                </div>
              </>
            )}
          </main>
        </div>}
      </div>
    </>
  );
};

export default AdminWhatsApp;
*/
