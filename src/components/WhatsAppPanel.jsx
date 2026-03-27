import React, { useState } from 'react';
import {
  MessageCircle, Send, MapPin, Phone, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import whatsappService from '@/services/whatsapp/whatsapp-service';

// Coordenadas fixas da loja
const LOJA = {
  latitude: -23.5543629,
  longitude: -46.5840944,
  name: 'JL Rent Car — Matriz',
  address: 'Rua Fernando Falcão, 54 - Mooca, São Paulo - SP',
};

// ─── Templates ──────────────────────────────────────────────────────────────

const buildTemplates = (reserva) => {
  const nome = reserva?.users?.nome?.split(' ')[0] ?? 'Cliente';
  const veiculo = reserva?.cars?.nome ?? 'veículo';

  return [
    {
      id: 'lembrete_retirada',
      label: 'Lembrete de Retirada',
      icon: MessageCircle,
      color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
      text:
`JL RENT CAR — Lembrete de Retirada

Olá, ${nome}!

Amanhã é o dia da retirada do seu ${veiculo}.

Não esqueça de levar seus documentos (CNH, CPF e comprovante de residência).`,
    },
    {
      id: 'lembrete_devolucao',
      label: 'Lembrete de Devolução',
      icon: MessageCircle,
      color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100',
      text:
`JL RENT CAR — Lembrete de Devolução

Olá, ${nome}!

Amanhã é o dia da devolução do ${veiculo}.

Lembre-se de devolver com tanque cheio e nas mesmas condições da retirada.

Horário de funcionamento: 08h às 18h.`,
    },
  ];
};

// ─── WhatsAppPanel ───────────────────────────────────────────────────────────

const WhatsAppPanel = ({ telefone, reserva }) => {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState(null);
  const [freeText, setFreeText] = useState('');
  const [showFree, setShowFree] = useState(false);

  const number = (telefone ?? '').replace(/\D/g, '');
  const hasPhone = number.length >= 10;
  const templates = buildTemplates(reserva);

  const sendText = async (text, templateId) => {
    if (!hasPhone) {
      toast({ title: 'Sem telefone', description: 'Cliente não possui telefone cadastrado.', variant: 'destructive' });
      return;
    }
    setLoadingId(templateId);
    try {
      await whatsappService.postEnviar({
        number,
        text,
        reservaId: reserva?.id,
      });
      toast({ title: 'WhatsApp enviado!', className: 'bg-green-600 text-white' });
    } catch (err) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  const sendLocation = async () => {
    if (!hasPhone) {
      toast({ title: 'Sem telefone', description: 'Cliente não possui telefone cadastrado.', variant: 'destructive' });
      return;
    }
    setLoadingId('localizacao');
    try {
      await whatsappService.postEnviarLocalizacao({
        number,
        ...LOJA,
        reservaId: reserva?.id,
      });
      toast({ title: 'Localização enviada!', className: 'bg-green-600 text-white' });
    } catch (err) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  const sendFree = () => {
    if (!freeText.trim()) return;
    sendText(freeText.trim(), 'livre');
    setFreeText('');
    setShowFree(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <div className="p-2 bg-green-100 rounded-lg">
          <MessageCircle size={18} className="text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">WhatsApp</h3>
          <p className="text-xs text-gray-500">Envie mensagens direto pelo painel</p>
        </div>
      </div>

      {/* Phone */}
      <div className={`flex items-center gap-2 text-sm mb-5 px-3 py-2 rounded-lg ${hasPhone ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
        <Phone size={14} />
        {hasPhone ? (
          <span className="font-mono font-medium">{telefone || number}</span>
        ) : (
          <span>Telefone não cadastrado</span>
        )}
      </div>

      {/* Templates */}
      <div className="space-y-2 mb-4">
        {templates.map(({ id, label, icon: Icon, color, text }) => (
          <button
            key={id}
            onClick={() => sendText(text, id)}
            disabled={!hasPhone || loadingId !== null}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
          >
            {loadingId === id
              ? <Loader2 size={15} className="animate-spin shrink-0" />
              : <Icon size={15} className="shrink-0" />
            }
            {label}
          </button>
        ))}

        {/* Localização */}
        <button
          onClick={sendLocation}
          disabled={!hasPhone || loadingId !== null}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100"
        >
          {loadingId === 'localizacao'
            ? <Loader2 size={15} className="animate-spin shrink-0" />
            : <MapPin size={15} className="shrink-0" />
          }
          Enviar Localização da Loja
        </button>
      </div>

      {/* Mensagem Livre */}
      <button
        onClick={() => setShowFree(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        <span className="flex items-center gap-2"><Send size={14} /> Mensagem personalizada</span>
        {showFree ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showFree && (
        <div className="mt-2 space-y-2">
          <textarea
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder="Digite sua mensagem…"
            rows={3}
            className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
          />
          <button
            onClick={sendFree}
            disabled={!freeText.trim() || !hasPhone || loadingId !== null}
            className="w-full py-2 bg-[#00D166] text-[#0E3A2F] font-bold rounded-xl hover:bg-[#00F178] flex items-center justify-center gap-2 disabled:opacity-50 text-sm transition-colors"
          >
            {loadingId === 'livre' ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            Enviar
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsAppPanel;
