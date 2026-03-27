import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loader2, UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, FileWarning, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePDFFile, validateImageFile } from '@/lib/validationUtils';

export const DocumentDropzone = ({ onUpload, loading, error, success, label, documentType, acceptImage = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!success && !loading) {
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!success && !loading && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file) => {
    const validation = acceptImage ? validateImageFile(file) : validatePDFFile(file);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
    onUpload(file, documentType);
  };

  // Reset file if success is cleared (e.g. new upload needed)
  useEffect(() => {
      if (!success && !loading && !error) {
          // Keep selectedFile for preview until success
      }
      if (success) {
          // Maybe keep it for "Uploaded" state visualization
      }
  }, [success, loading, error]);

  const fileSize = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0;

  return (
    <div className="w-full mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2 md:flex items-center justify-between">
            <span>{label} <span className="text-red-500">*</span></span>
            {success && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> Enviado</span>}
        </label>
        
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !loading && !success && inputRef.current?.click()}
            className={cn(
                "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-200 group h-40",
                loading && "bg-gray-50 border-gray-300 cursor-wait",
                success && "bg-green-50 border-[#00D166] cursor-default opacity-80",
                (error || validationError) && "bg-red-50 border-red-300 cursor-pointer",
                !loading && !success && !error && !validationError && (isDragging ? "border-[#00D166] bg-green-50 scale-[1.01]" : "border-gray-200 hover:border-[#00D166] hover:bg-gray-50 bg-white cursor-pointer")
            )}
        >
            <input 
                ref={inputRef}
                type="file" 
                className="hidden" 
                accept={acceptImage ? "image/jpeg,image/jpg,image/png,image/webp" : "application/pdf"}
                onChange={handleChange}
                disabled={loading || success}
            />
        
            {loading ? (
                <div className="flex flex-col items-center animate-in fade-in">
                    <Loader2 className="animate-spin text-[#00D166] mb-2" size={32} />
                    <p className="text-xs text-gray-600 font-bold">Enviando...</p>
                </div>
            ) : success ? (
                <div className="flex flex-col items-center animate-in zoom-in text-center">
                    <div className="p-2 bg-[#00D166] rounded-full mb-2 text-white shadow-sm">
                        <CheckCircle2 size={24} />
                    </div>
                    <p className="font-bold text-[#0E3A2F] text-sm">{selectedFile?.name || "Arquivo Enviado"}</p>
                    <p className="text-xs text-gray-500">{fileSize > 0 ? `${fileSize} MB` : ''}</p>
                </div>
            ) : validationError ? (
                <div className="flex flex-col items-center text-center animate-in shake">
                    <AlertCircle className="text-red-500 mb-2" size={32} />
                    <p className="font-bold text-red-600 text-sm">Arquivo inválido</p>
                    <p className="text-xs text-red-500 mt-1 max-w-[200px]">{validationError}</p>
                    <button onClick={() => setValidationError(null)} className="mt-2 text-xs font-bold underline text-red-400">Tentar novamente</button>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center text-center animate-in shake">
                    <AlertCircle className="text-red-500 mb-2" size={32} />
                    <p className="font-bold text-red-600 text-sm">Falha no envio</p>
                    <p className="text-xs text-red-500 mt-1 max-w-[200px]">{typeof error === 'string' ? error : 'Erro desconhecido'}</p>
                    <button className="mt-2 text-xs font-bold underline text-red-400">Tentar novamente</button>
                </div>
            ) : selectedFile ? (
                <div className="flex flex-col items-center animate-in fade-in text-center">
                     <FileText size={32} className="text-[#00D166] mb-2" />
                     <p className="font-bold text-gray-800 text-sm max-w-[200px] truncate">{selectedFile.name}</p>
                     <p className="text-xs text-gray-500">{fileSize} MB</p>
                     <p className="text-xs text-blue-500 mt-1 font-bold">Arquivo selecionado</p>
                </div>
            ) : (
                <>
                    <UploadCloud className="text-gray-400 group-hover:text-[#00D166] mb-2 transition-colors" size={32} />
                    <p className="font-bold text-gray-700 text-sm text-center">{acceptImage ? 'Clique ou arraste a imagem' : 'Clique ou arraste o PDF'}</p>
                    <p className="text-xs text-gray-400 mt-1">Máx. 10MB</p>
                </>
            )}
        </div>
        {!success && !loading && !error && !selectedFile && (
             <div className="flex items-center gap-1.5 text-xs text-amber-700 mt-1 px-1">
                <AlertTriangle size={12} />
                <span>{acceptImage ? 'JPG, PNG ou WEBP' : 'Somente arquivos PDF'}</span>
             </div>
        )}
    </div>
  );
};

DocumentDropzone.propTypes = {
  onUpload: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.bool,
  label: PropTypes.string.isRequired,
  documentType: PropTypes.string.isRequired
};

export const UploadedDocumentCard = ({ name, size, date, typeLabel, onView, onDownload }) => {
  const formattedSize = size ? (size / 1024 / 1024).toFixed(2) : '0';
  const formattedDate = date ? new Date(date).toLocaleDateString() : '';
  
  return (
    <div className="border border-green-200 bg-green-50/50 rounded-xl p-3 flex items-center justify-between group hover:shadow-md transition-all mb-3">
       <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-[#00D166] rounded-lg text-white shrink-0 shadow-sm">
             <FileText size={20} />
          </div>
          <div className="min-w-0">
             <p className="font-bold text-[#0E3A2F] text-sm truncate">{name || typeLabel}</p>
             <div className="flex gap-2 text-xs text-green-700 mt-0.5">
                 <span className="font-semibold">{typeLabel}</span>
                 <span>•</span>
                 <span>{formattedSize} MB</span>
                 {formattedDate && <><span>•</span><span>{formattedDate}</span></>}
             </div>
          </div>
       </div>
       <div className="flex items-center gap-2">
           {onView && (
               <a href={onView} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Visualizar">
                   <FileText size={18} />
               </a>
           )}
           {onDownload && (
               <a href={onDownload} download={name} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Download">
                   <UploadCloud size={18} className="rotate-180" />
               </a>
           )}
       </div>
    </div>
  );
};