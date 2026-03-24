import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
  Loader2, Send, Search, RefreshCw, MessageCircle,
  Wifi, WifiOff, Phone, X, CheckCircle, AlertCircle,
  Clock, Image, MapPin
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

// Normalisa a response do service (handleRequest já deswrappa axios.data,
// mas a API retorna { success, data: { ... } })
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
      // response: { success, data: { existe, jid } }
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

  // Texto
  const [text, setText] = useState('');
  // Localização (coordenadas fixas da loja)
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

        {/* Número */}
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

        {/* Type tabs */}
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

        {/* Fields */}
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

          {tab === 'imagem' && (
            <>
              <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL pública da imagem (JPEG, PNG, WEBP)" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              <input type="text" value={imgCaption} onChange={e => setImgCaption(e.target.value)} placeholder="Legenda (opcional)" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </>
          )}

          {tab === 'documento' && (
            <>
              <input type="text" value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="URL pública do PDF/documento" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="Nome do arquivo (ex: Contrato.pdf)" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              <input type="text" value={docCaption} onChange={e => setDocCaption(e.target.value)} placeholder="Mensagem junto ao documento (opcional)" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </>
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

  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);
  const [sseConnected, setSseConnected] = useState(false);

  // Mantém refs atualizados a cada render — usados no handler SSE para evitar stale closure
  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);


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

        // Normaliza o jid para comparação (remove sufixo @...)
        const jidRecebido = (dados.remoteJid ?? '').replace(/@.*$/, '');
        const jidSelecionado = (selectedChatRef.current?.remoteJid ?? '').replace(/@.*$/, '');
        const isChatAtual = jidSelecionado && jidSelecionado === jidRecebido;

        if (tipo === 'mensagem_recebida') {
          if (isChatAtual) {
            // SSE traz tudo — apenas adiciona na lista, sem request
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
          // Sobe chat na lista + marca não lido se não estiver aberto
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
      // API: { success, data: { conectado, estado } }
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
  // response: { success, data: { messages: { total, pages, currentPage, records: [...] } } }
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
    // Limpa badge de não lido
    setChats(prev => prev.map(c => c.remoteJid === chat.remoteJid ? { ...c, _unread: false } : c));
  };

  const handleSend = () => {
    if (!sendText.trim() || !selectedChat) return;
    const number = fmtJid(selectedChat.remoteJid);
    const text = sendText.trim();

    // Otimista: exibe a mensagem imediatamente
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

    // Envia em background — SSE cuida da atualização; só marca falha se erro
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

  const handleRefresh = () => {
    fetchStatus();
    fetchChats();
    if (selectedChat) fetchMessages(selectedChat.remoteJid);
  };

  // estado da conexão: data.estado
  const connectionState = status?.estado ?? (status?.conectado ? 'open' : 'close');

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

  // Pega o status mais recente do MessageUpdate
  const getMsgStatus = (msg) => {
    const updates = msg.MessageUpdate ?? [];
    if (!updates.length) return null;
    const last = updates[updates.length - 1]?.status ?? '';
    if (last === 'READ') return '✓✓'; // lido (azul idealmente, mas sem cor extra)
    if (last === 'DELIVERY_ACK') return '✓✓'; // entregue
    if (last === 'SERVER_ACK') return '✓';    // enviado ao servidor
    return '✓';
  };

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
            <button
              onClick={() => setShowVerificar(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Phone size={16} /> Verificar Número
            </button>
            <button
              onClick={() => openNovaMensagem()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#0E3A2F] bg-[#00D166] hover:bg-[#00F178] rounded-xl transition-colors"
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

        {/* ── Split Panel ── */}
        <div className="flex flex-1 min-h-0">

          {/* ── Chat List ── */}
          <aside className="w-80 shrink-0 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${isSelected ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                    >
                      {/* Avatar com foto de perfil */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-[#0E3A2F] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                          {chat.profilePicUrl
                            ? <img src={chat.profilePicUrl} alt={name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                            : name[0]?.toUpperCase() ?? '#'
                          }
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-sm truncate ${chat._unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>{name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-gray-400">{fmtTime(chat.updatedAt)}</span>
                            {chat._unread && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{fmtPhone(jid)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── Messages Panel ── */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5]">
            {!selectedChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <MessageCircle size={48} className="text-gray-300" />
                <p className="font-medium">Selecione uma conversa</p>
                <p className="text-sm">ou use "Nova Mensagem" para enviar texto, imagem, documento ou localização</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="bg-white px-6 py-4 border-b flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0E3A2F] text-white flex items-center justify-center font-bold overflow-hidden">
                      {selectedChat.profilePicUrl
                        ? <img src={selectedChat.profilePicUrl} alt={selectedChat.pushName} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                        : (selectedChat.pushName || '#')[0]?.toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedChat.pushName || fmtPhone(selectedChat.remoteJid ?? selectedChat.id)}</p>
                      <p className="text-xs text-gray-500">{fmtPhone(selectedChat.remoteJid ?? selectedChat.id)}</p>
                    </div>
                  </div>
                  {/* Quick actions for this chat */}
                  <button
                    onClick={() => openNovaMensagem(fmtJid(selectedChat.remoteJid))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0E3A2F] bg-[#00D166] hover:bg-[#00F178] rounded-lg transition-colors"
                  >
                    <Image size={14} /> Enviar mídia
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {msgLoading ? (
                    <div className="flex justify-center pt-8"><Loader2 className="animate-spin text-green-500" size={24} /></div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 pt-8">Nenhuma mensagem encontrada.</div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isFromMe = msg.key?.fromMe ?? false;
                      const text = getMsgText(msg);
                      return (
                        <div key={msg.key?.id ?? idx} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm transition-opacity ${
                            msg._failed  ? 'bg-red-100 text-red-700 rounded-br-sm opacity-80' :
                            msg._pending ? 'bg-[#00D166]/70 text-[#0E3A2F] rounded-br-sm opacity-70' :
                            isFromMe     ? 'bg-[#00D166] text-[#0E3A2F] rounded-br-sm' :
                                           'bg-white text-gray-900 rounded-bl-sm'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
                            <p className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isFromMe ? 'text-[#0E3A2F]/60' : 'text-gray-400'}`}>
                              {msg._failed  ? 'Falha no envio' :
                               msg._pending ? 'Enviando…' :
                               fmtTime(msg.messageTimestamp)}
                              {isFromMe && !msg._pending && !msg._failed && getMsgStatus(msg) && <span>{getMsgStatus(msg)}</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send bar (texto only — para outros tipos usar "Nova Mensagem") */}
                <div className="bg-white px-4 py-3 border-t flex items-end gap-3 shrink-0">
                  <textarea
                    value={sendText}
                    onChange={e => setSendText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Digite uma mensagem de texto… (Enter para enviar, Shift+Enter para quebrar linha)"
                    rows={1}
                    className="flex-1 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none max-h-32 leading-relaxed"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!sendText.trim()}
                    className="p-3 bg-[#00D166] hover:bg-[#00F178] text-[#0E3A2F] rounded-xl transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminWhatsApp;
