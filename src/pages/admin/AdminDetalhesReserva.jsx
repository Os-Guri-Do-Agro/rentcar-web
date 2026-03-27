import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { formatarData } from '@/lib/dateUtils';
import {
  Loader2, ArrowLeft, User, Mail, Phone, FileText, Car,
  CheckCircle, XCircle, Clock, Calendar, AlertTriangle, Ban,
  ChevronDown, ChevronUp, Image, Paperclip, Send,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import DocumentosDisplay from '@/components/DocumentosDisplay';
import WhatsAppPanel from '@/components/WhatsAppPanel';
import reservasServices from '@/services/reservas/reservas-services';
import documentosService from '@/services/reservas/documentos/documentos-service';

const STATUS_CONFIG = {
  pendente:   { label: 'Pendente',   color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  aceita:     { label: 'Aprovada',   color: 'bg-blue-100 text-blue-800 border-blue-200' },
  confirmada: { label: 'Confirmada', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelada:  { label: 'Cancelada',  color: 'bg-red-100 text-red-800 border-red-200' },
};

const MAX_DOC = 3;
const MAX_FILE_MB = 10;

const isImageUrl = (url = '', nome = '') => {
  const s = (url + nome).toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp)/.test(s);
};

const AdminDetalhesReserva = () => {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reserva, setReserva] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [uploadingFotos, setUploadingFotos] = useState({ retirada: false, devolucao: false });
  const [motivo, setMotivo] = useState('');
  const [horaRetirada, setHoraRetirada] = useState('');
  const [horaDevolucao, setHoraDevolucao] = useState('');
  const [modals, setModals] = useState({ aprovar: false, confirmar: false, rejeitar: false, cancelar: false });
  const [expanded, setExpanded] = useState({ documentos: true, retirada: false, devolucao: false });

  // File input refs
  const imgRetiradaRef = useRef(null);
  const docRetiradaRef = useRef(null);
  const imgDevolucaoRef = useRef(null);
  const docDevolucaoRef = useRef(null);

  useEffect(() => { fetchData(); }, [reservaId]);

  const fetchData = async () => {
    try {
      const [resData, histData, docsData, fotosData] = await Promise.all([
        reservasServices.getReservasById(reservaId),
        reservasServices.getHostoryReserva(reservaId),
        documentosService.getDocumentosByReservaId(reservaId),
        reservasServices.getReservaFotos(reservaId),
      ]);
      const r = resData?.reserva ?? resData?.data ?? resData;
      setReserva(r);
      setHoraRetirada(r?.hora_retirada_solicitada || '');
      setHoraDevolucao(r?.hora_devolucao || '');
      setHistorico(histData?.data ?? []);
      setDocumentos(docsData?.data?.documentos ?? []);
      setFotos(fotosData?.data ?? []);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar detalhes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const reloadFotos = async () => {
    const fotosData = await reservasServices.getReservaFotos(reservaId);
    setFotos(fotosData?.data ?? []);
  };

  const closeModal = () => setModals({ aprovar: false, confirmar: false, rejeitar: false, cancelar: false });

  // --- Status actions ---
  const handleAprovar = async () => {
    setProcessing(true);
    try {
      await reservasServices.patchStatusReserva(reservaId, { status: 'aceita' });
      toast({ title: 'Reserva aprovada!', className: 'bg-green-600 text-white' });
      closeModal(); fetchData();
    } catch (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  const handleConfirmar = async () => {
    setProcessing(true);
    try {
      const body = {};
      if (horaRetirada) body.hora_retirada = horaRetirada;
      if (horaDevolucao) body.hora_devolucao = horaDevolucao;
      await reservasServices.postConfirmReserva(reservaId, body);
      toast({ title: 'Reserva confirmada!', className: 'bg-green-600 text-white' });
      closeModal(); fetchData();
    } catch (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  const handleRejeitar = async () => {
    setProcessing(true);
    try {
      await reservasServices.postRejectReserva(reservaId, { motivo });
      toast({ title: 'Reserva rejeitada.', className: 'bg-red-600 text-white' });
      closeModal(); setMotivo(''); fetchData();
    } catch (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  const handleCancelar = async () => {
    setProcessing(true);
    try {
      await reservasServices.patchCancelReserva(reservaId);
      toast({ title: 'Reserva cancelada.', className: 'bg-red-600 text-white' });
      closeModal(); fetchData();
    } catch (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  // --- Email ---
  const handleEnviarEmail = async () => {
    setSendingEmail(true);
    try {
      await reservasServices.postReservaEnviarEmail(reservaId);
      toast({ title: 'E-mail enviado!', description: 'Cópia dos documentos enviada ao cliente.', className: 'bg-green-600 text-white' });
    } catch (error) {
      toast({ title: 'Erro ao enviar e-mail', description: error.message, variant: 'destructive' });
    } finally { setSendingEmail(false); }
  };

  // --- Fotos upload ---
  const handleUploadFotos = async (tipo, files) => {
    const valid = Array.from(files).filter(f => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast({ title: `"${f.name}" excede ${MAX_FILE_MB}MB e foi ignorado.`, variant: 'destructive' });
        return false;
      }
      return true;
    });
    if (!valid.length) return;

    setUploadingFotos(prev => ({ ...prev, [tipo]: true }));
    try {
      const formData = new FormData();
      valid.forEach(f => formData.append('files', f));
      await reservasServices.postReservaFotos(reservaId, tipo, formData);
      toast({ title: 'Arquivos enviados!', className: 'bg-green-600 text-white' });
      await reloadFotos();
    } catch (error) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingFotos(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const handleDocUpload = (tipo, files, currentDocs) => {
    const newFiles = Array.from(files);
    if (currentDocs.length + newFiles.length > MAX_DOC) {
      toast({ title: `Limite de ${MAX_DOC} documentos por seção atingido.`, variant: 'destructive' });
      return;
    }
    handleUploadFotos(tipo, newFiles);
  };

  const handleDocUploadRetirada = async (files, currentDocs) => {
    const newFiles = Array.from(files).filter(f => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast({ title: `"${f.name}" excede ${MAX_FILE_MB}MB e foi ignorado.`, variant: 'destructive' });
        return false;
      }
      return true;
    });
    if (!newFiles.length) return;
    if (currentDocs.length + newFiles.length > MAX_DOC) {
      toast({ title: `Limite de ${MAX_DOC} documentos atingido.`, variant: 'destructive' });
      return;
    }
    setUploadingFotos(prev => ({ ...prev, retirada: true }));
    try {
      for (const file of newFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tipo', 'documento_retirada');
        await documentosService.postDocumentsUpload(reservaId, formData);
      }
      toast({ title: 'Documento(s) enviado(s)!', className: 'bg-green-600 text-white' });
      await reloadFotos();
    } catch (error) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingFotos(prev => ({ ...prev, retirada: false }));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-[#0E3A2F]" size={48} />
    </div>
  );
  if (!reserva) return <div className="p-10 text-center">Reserva não encontrada.</div>;

  const status = reserva.status;
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  const horasDiferem =
    reserva.hora_retirada_solicitada &&
    reserva.hora_retirada &&
    reserva.hora_retirada !== reserva.hora_retirada_solicitada;

  const fotosRetirada = fotos.filter(f => f.tipo === 'retirada' || f.tipo === 'documento_retirada');
  const fotosDevolucao = fotos.filter(f => f.tipo === 'devolucao');
  const docsRetirada = fotos.filter(f => f.tipo === 'documento_retirada');
  const docsDevolucao = fotosDevolucao.filter(f => !isImageUrl(f.url, f.nome_arquivo));

  const renderFotoGrid = (items) => (
    items.length === 0
      ? <p className="text-sm text-gray-400 py-2">Nenhum arquivo enviado ainda.</p>
      : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {items.map(foto => {
            const isImg = isImageUrl(foto.url, foto.nome_arquivo);
            return (
              <a
                key={foto.id}
                href={foto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {isImg ? (
                  <img src={foto.url} alt={foto.nome_arquivo || ''} className="w-full h-24 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-gray-50 flex flex-col items-center justify-center gap-1 px-2">
                    <FileText size={24} className="text-gray-400" />
                    <p className="text-xs text-gray-500 truncate w-full text-center">{foto.nome_arquivo || 'Documento'}</p>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )
  );

  const renderAnexosSection = (tipo, fotosList, docsList, imgRef, docRef, isUploading, expandKey, allowDocs = true, onDocUpload = null) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <button
        onClick={() => setExpanded(p => ({ ...p, [expandKey]: !p[expandKey] }))}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h2 className="text-base font-bold text-[#0E3A2F] flex items-center gap-2">
          <Image size={18} className="text-[#00D166]" />
          Anexos de {tipo === 'retirada' ? 'Retirada' : 'Devolução'}
          <span className="text-xs font-normal text-gray-400 ml-1">
            ({fotosList.length} {fotosList.length === 1 ? 'arquivo' : 'arquivos'})
          </span>
        </h2>
        {expanded[expandKey] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {expanded[expandKey] && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Image upload */}
            <input
              ref={imgRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={e => { handleUploadFotos(tipo, e.target.files); e.target.value = ''; }}
            />
            <button
              onClick={() => imgRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="animate-spin" size={15} /> : <Image size={15} />}
              Adicionar Fotos
            </button>

            {/* Enviar email — retirada only, quando há arquivos */}
            {allowDocs && fotosList.length > 0 && (
              <button
                onClick={handleEnviarEmail}
                disabled={sendingEmail}
                className="flex items-center gap-2 px-3 py-2 bg-[#0E3A2F] hover:bg-[#165945] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sendingEmail ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
                Enviar Contrato por E-mail
              </button>
            )}

            {/* Document upload (max 3) — retirada only */}
            {allowDocs && (
              <>
                <input
                  ref={docRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={e => { (onDocUpload ?? ((f, d) => handleDocUpload(tipo, f, d)))(e.target.files, docsList); e.target.value = ''; }}
                />
                <button
                  onClick={() => docRef.current?.click()}
                  disabled={isUploading || docsList.length >= MAX_DOC}
                  title={docsList.length >= MAX_DOC ? `Limite de ${MAX_DOC} documentos atingido` : undefined}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Paperclip size={15} />
                  Documentos ({docsList.length}/{MAX_DOC})
                </button>
              </>
            )}
          </div>

          {renderFotoGrid(fotosList)}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet title={`Admin | Reserva #${reserva.id?.slice(0, 8)}`} />

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/reservas')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Reserva #{reserva.id?.slice(0, 8)}
            <span className={`text-xs px-2 py-0.5 rounded border uppercase font-bold ${cfg.color}`}>{cfg.label}</span>
          </h1>
        </div>

        <div className="flex gap-2">
          {status === 'pendente' && (
            <>
              <button
                onClick={() => setModals(p => ({ ...p, rejeitar: true }))}
                className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-100 text-sm"
              >
                <XCircle size={16} /> Rejeitar
              </button>
              <button
                onClick={() => setModals(p => ({ ...p, aprovar: true }))}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 text-sm"
              >
                <CheckCircle size={16} /> Aprovar
              </button>
            </>
          )}
          {status === 'aceita' && (
            <>
              <button
                onClick={() => setModals(p => ({ ...p, cancelar: true }))}
                className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-100 text-sm"
              >
                <Ban size={16} /> Cancelar
              </button>
              <button
                onClick={() => setModals(p => ({ ...p, confirmar: true }))}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 text-sm"
              >
                <CheckCircle size={16} /> Confirmar
              </button>
            </>
          )}
          {status === 'confirmada' && (
            <button
              onClick={() => setModals(p => ({ ...p, cancelar: true }))}
              className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-100 text-sm"
            >
              <Ban size={16} /> Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#0E3A2F] mb-4 flex items-center gap-2">
                <User size={20} className="text-[#00D166]" /> Dados do Cliente
              </h2>
              <div className="space-y-3">
                <p className="font-bold text-gray-900">{reserva.users?.nome || reserva.cliente_nome || '—'}</p>
                <div className="text-sm text-gray-600"><Mail size={14} className="inline mr-2" />{reserva.users?.email || reserva.cliente_email || '—'}</div>
                <div className="text-sm text-gray-600"><Phone size={14} className="inline mr-2" />{reserva.users?.telefone || reserva.cliente_telefone || 'Não informado'}</div>
                <div className="text-sm text-gray-600"><FileText size={14} className="inline mr-2" />CPF: {reserva.users?.cpf || 'Não informado'}</div>
              </div>
            </div>

            {/* Veículo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#0E3A2F] mb-4 flex items-center gap-2">
                <Car size={20} className="text-[#00D166]" /> Veículo
              </h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {reserva.cars?.imagem_url
                    ? <img src={reserva.cars.imagem_url} alt="Car" className="w-full h-full object-cover" />
                    : <Car size={32} className="text-gray-300" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{reserva.cars?.nome}</h3>
                  <p className="text-gray-500 text-sm">{reserva.cars?.placa || 'Sem Placa'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Período e Horários */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#0E3A2F] mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-[#00D166]" /> Período e Horários
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Retirada</p>
                <p className="font-bold text-gray-800">
                  {reserva.data_retirada ? new Date(reserva.data_retirada).toLocaleDateString('pt-BR') : '—'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  às {reserva.hora_retirada || <span className="italic text-gray-400">a definir</span>}
                </p>
                {reserva.hora_retirada_solicitada && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Solicitado: {reserva.hora_retirada_solicitada}
                    {horasDiferem && <span className="ml-1 text-amber-600 font-bold">(alterado)</span>}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Devolução</p>
                <p className="font-bold text-gray-800">
                  {reserva.data_devolucao ? new Date(reserva.data_devolucao).toLocaleDateString('pt-BR') : '—'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  às {reserva.hora_devolucao || <span className="italic text-gray-400">a definir</span>}
                </p>
              </div>
            </div>

            {horasDiferem && (
              <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-amber-700 text-sm">
                <AlertTriangle size={16} className="shrink-0" />
                Horário de retirada alterado: cliente solicitou <strong className="mx-1">{reserva.hora_retirada_solicitada}</strong>, confirmado <strong className="mx-1">{reserva.hora_retirada}</strong>
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">Valor Total</span>
              <span className="text-lg font-bold text-[#00D166]">
                R$ {parseFloat(reserva.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Documentos — collapsible */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <button
                onClick={() => setExpanded(p => ({ ...p, documentos: !p.documentos }))}
                className="flex items-center gap-2 text-left flex-1"
              >
                <h2 className="text-base font-bold text-[#0E3A2F] flex items-center gap-2">
                  <FileText size={18} className="text-[#00D166]" />
                  Documentos da Reserva
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    ({documentos.length} {documentos.length === 1 ? 'documento' : 'documentos'})
                  </span>
                </h2>
                {expanded.documentos ? <ChevronUp size={18} className="text-gray-400 ml-2" /> : <ChevronDown size={18} className="text-gray-400 ml-2" />}
              </button>

            </div>

            {expanded.documentos && (
              <div className="p-5">
                <DocumentosDisplay documentos={documentos} />
              </div>
            )}
          </div>

          {/* Anexos de Retirada */}
          {renderAnexosSection(
            'retirada',
            fotosRetirada,
            docsRetirada,
            imgRetiradaRef,
            docRetiradaRef,
            uploadingFotos.retirada,
            'retirada',
            true,
            (files) => handleDocUploadRetirada(files, docsRetirada)
          )}

          {/* Anexos de Devolução */}
          {renderAnexosSection(
            'devolucao',
            fotosDevolucao,
            docsDevolucao,
            imgDevolucaoRef,
            docDevolucaoRef,
            uploadingFotos.devolucao,
            'devolucao',
            false
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {!['confirmada', 'cancelada'].includes(status) && (
            <WhatsAppPanel
              telefone={'55'+reserva.users?.telefone || '55'+reserva.cliente_telefone}
              reserva={reserva}
            />
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-[#0E3A2F] mb-6 flex items-center gap-2">
              <Clock size={20} className="text-[#00D166]" /> Histórico
            </h2>
            <div className="space-y-6 border-l border-gray-200 pl-6">
              {historico.length === 0 && (
                <p className="text-sm text-gray-400">Nenhum histórico encontrado.</p>
              )}
              {historico.map((item) => {
                const anteriorCfg = STATUS_CONFIG[item.status_anterior];
                const novoCfg = STATUS_CONFIG[item.status_novo];
                return (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[29px] w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
                    <p className="text-sm font-bold text-gray-800">
                      {anteriorCfg?.label || item.status_anterior} → {novoCfg?.label || item.status_novo}
                    </p>
                    {item.motivo && <p className="text-xs text-gray-600 italic">{item.motivo}</p>}
                    <p className="text-xs text-gray-400">{formatarData(item.criado_em)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Aprovar */}
      <Dialog open={modals.aprovar} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Reserva</DialogTitle>
            <DialogDescription>
              Confirma a aprovação da reserva de <strong>{reserva.users?.nome || reserva.cliente_nome}</strong>?
              O cliente será notificado e a reserva ficará aguardando confirmação final.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleAprovar} disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-40">
              {processing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} Aprovar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar */}
      <Dialog open={modals.confirmar} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>Defina os horários aprovados. O cliente será notificado via WhatsApp e email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {reserva.hora_retirada_solicitada && (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                Hora solicitada pelo cliente: <strong>{reserva.hora_retirada_solicitada}</strong>
              </p>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Hora de Retirada <span className="text-gray-400 font-normal">(HH:mm)</span>
              </label>
              <input
                type="text"
                placeholder="10:00"
                value={horaRetirada}
                onChange={e => setHoraRetirada(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#00D166] focus:outline-none"
              />
              {horaRetirada && reserva.hora_retirada_solicitada && horaRetirada !== reserva.hora_retirada_solicitada && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> Diferente do solicitado ({reserva.hora_retirada_solicitada})
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Hora de Devolução <span className="text-gray-400 font-normal">(HH:mm)</span>
              </label>
              <input
                type="text"
                placeholder="18:00"
                value={horaDevolucao}
                onChange={e => setHoraDevolucao(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#00D166] focus:outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleConfirmar} disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-40">
              {processing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} Confirmar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Rejeitar */}
      <Dialog open={modals.rejeitar} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Reserva</DialogTitle>
            <DialogDescription>Informe o motivo da rejeição. O cliente será notificado.</DialogDescription>
          </DialogHeader>
          <textarea
            className="w-full border-2 border-gray-200 rounded-lg p-3 h-24 mt-2 focus:border-red-400 focus:outline-none resize-none"
            placeholder="Ex: Documentação incompleta"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
          />
          <DialogFooter>
            <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleRejeitar} disabled={processing || !motivo.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-40">
              {processing ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />} Rejeitar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cancelar */}
      <Dialog open={modals.cancelar} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Voltar</button>
            <button onClick={handleCancelar} disabled={processing} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-40">
              {processing ? <Loader2 className="animate-spin" size={16} /> : <Ban size={16} />} Cancelar Reserva
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDetalhesReserva;
