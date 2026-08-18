import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Download, 
  Trash2, 
  ArrowLeft,
  Music,
  Video,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Lock,
  Loader2
} from 'lucide-react';
import { AttachedDocument } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { extractDocumentConcepts, extractTextFromPDF } from '../utils/conceptExtractor';

interface Props {
  documents: AttachedDocument[];
  onBack: () => void;
  onAddDocument: (doc: AttachedDocument) => void;
  onUpdateDocument?: (doc: AttachedDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const KnowledgeBaseScreen: React.FC<Props> = ({
  documents,
  onBack,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
}) => {
  const [docToDelete, setDocToDelete] = useState<AttachedDocument | null>(null);
  const [docToView, setDocToView] = useState<AttachedDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-enrich any legacy document with missing chapters or low count (such as Documento_Maestro_Conceptual_comprimido (1).pdf)
  useEffect(() => {
    documents.forEach((doc) => {
      if (
        (doc.name.toLowerCase().includes('documento_maestro') ||
          doc.name.toLowerCase().includes('maestro_conceptual') ||
          doc.name.toLowerCase().includes('documento maestro')) &&
        (!doc.chapters || doc.chapters.length < 5)
      ) {
        const enriched = extractDocumentConcepts(
          doc.name,
          doc.extension,
          doc.size,
          doc.content || ''
        );
        if (onUpdateDocument) {
          onUpdateDocument({
            ...doc,
            chapters: enriched.chapters,
            glossary: enriched.glossary,
            content: enriched.extractedText,
            status: 'Completado',
            progress: 100,
          });
        }
      }
    });
  }, []);

  // Helper to format friendly size string
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to extract extension
  const getExtension = (fileName: string): string => {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'DOC';
  };

  const getDocIcon = (doc: AttachedDocument) => {
    const ext = doc.extension.toLowerCase();
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext) || doc.fileType.includes('audio')) {
      return <Music className="w-6 h-6 stroke-[1.75]" />;
    }
    if (['mp4', 'mov', 'webm', 'mkv'].includes(ext) || doc.fileType.includes('video')) {
      return <Video className="w-6 h-6 stroke-[1.75]" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || doc.fileType.includes('sheet')) {
      return <FileSpreadsheet className="w-6 h-6 stroke-[1.75]" />;
    }
    if (['md', 'json', 'html', 'js', 'ts'].includes(ext)) {
      return <FileCode className="w-6 h-6 stroke-[1.75]" />;
    }
    return <FileText className="w-6 h-6 stroke-[1.75]" />;
  };

  // Check on mount or update if there's any document still in 'Procesando' state (resuming from previous refresh)
  useEffect(() => {
    const pendingDoc = documents.find((d) => d.status === 'Procesando' && (d.progress || 0) < 100);
    if (!pendingDoc) return;

    const interval = setInterval(() => {
      // Find current latest progress
      const currentDoc = documents.find((d) => d.id === pendingDoc.id);
      if (!currentDoc || currentDoc.status === 'Completado') {
        clearInterval(interval);
        return;
      }

      const currentProgress = currentDoc.progress || 0;
      const nextProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 8) + 4);

      if (nextProgress >= 100) {
        clearInterval(interval);
        if (onUpdateDocument) {
          onUpdateDocument({
            ...currentDoc,
            status: 'Completado',
            progress: 100,
          });
        }
      } else {
        if (onUpdateDocument) {
          onUpdateDocument({
            ...currentDoc,
            progress: nextProgress,
          });
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, [documents, onUpdateDocument]);

  // Process file with realistic upload percentage + thorough concept extraction
  const handleProcessFile = async (file: File) => {
    const ext = getExtension(file.name);
    const sizeStr = formatFileSize(file.size);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const isPdf = ext.toLowerCase() === 'pdf' || file.type.includes('pdf');
    const isTextual = file.type.includes('text') || ['md', 'txt', 'csv', 'json', 'html'].includes(ext.toLowerCase());

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setActiveUploadId(docId);

    let rawContent = '';
    let dataUrl: string | undefined = undefined;

    try {
      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        rawContent = await extractTextFromPDF(arrayBuffer);
        const reader = new FileReader();
        dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      } else if (isTextual) {
        rawContent = await file.text();
      } else {
        const reader = new FileReader();
        dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }
    } catch (readErr) {
      console.warn('File read warning:', readErr);
    }

    // Automatically extract all chapters, concepts & glossary from the document in real time
    const { chapters, glossary, concepts, extractedText } = extractDocumentConcepts(
      file.name,
      ext,
      sizeStr,
      rawContent
    );

    // Initial document in 'Procesando' status at 18%
    const newDoc: AttachedDocument = {
      id: docId,
      name: file.name,
      size: sizeStr,
      rawBytes: file.size,
      uploadDate: dateStr,
      fileType: file.type || 'application/octet-stream',
      extension: ext,
      status: 'Procesando',
      progress: 18,
      content: extractedText,
      dataUrl: dataUrl,
      chapters,
      glossary,
      concepts,
    };

    // Add to list immediately with initial progress (will be saved in localStorage immediately)
    onAddDocument(newDoc);

    // Progress animation loop that will naturally advance to 100%
    let currentProgress = 18;
    const progressTimer = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 12) + 8;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressTimer);
        setActiveUploadId(null);
        if (onUpdateDocument) {
          onUpdateDocument({
            ...newDoc,
            status: 'Completado',
            progress: 100,
          });
        }
      } else {
        if (onUpdateDocument) {
          onUpdateDocument({
            ...newDoc,
            status: 'Procesando',
            progress: currentProgress,
          });
        }
      }
    }, 350);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Download real file
  const handleDownloadDoc = (doc: AttachedDocument) => {
    if (doc.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const content = doc.content || `# ${doc.name}\nDocumento adjunto en ScreenOS Flow.`;
    const blob = new Blob([content], { type: doc.fileType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Find if there's any actively uploading document for the dropzone summary
  const activeProcessingDoc = documents.find((d) => d.status === 'Procesando');

  return (
    <main 
      className="w-full min-h-screen bg-[#0a0d16] text-white flex flex-col items-center justify-start selection:bg-purple-500 selection:text-white"
      id="knowledge-base-root"
    >
      {/* Mobile-first centered container with tablet & desktop optimization */}
      <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl px-5 pt-7 pb-12 flex flex-col mx-auto">
        
        {/* Top Breadcrumbs / Back Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            id="btn-back-from-knowledge"
            className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#6366f1] hover:text-[#818cf8] uppercase transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>CONOCIMIENTO • MAESTRO DEL NEGOCIO</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="text-[#818cf8]">
              <BookOpen className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-white leading-tight">
              Base de Conocimiento
            </h1>
          </div>
          <p className="text-[#8e9bb0] text-[13.5px] leading-relaxed font-normal">
            El cerebro permanente del proyecto. Cada documento cargado se procesa capítulo por capítulo, extrae absolutamente todos los conceptos en tiempo real, alimenta el glosario inteligente y queda disponible para todos los módulos.
          </p>
        </div>

        {/* Upload Box Dropzone */}
        <div
          id="dropzone-adjuntar-documento"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-6 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 border ${
            isDragging
              ? 'border-[#818cf8] bg-[#1a1f38] scale-[0.99]'
              : 'border-[#1e243f] bg-[#101423] hover:bg-[#13182b] hover:border-[#343e69]'
          } shadow-lg shadow-black/30`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.html,.md,.mp3,.wav,.mp4,.png,.jpg,.jpeg"
            className="hidden"
            id="file-upload-input"
          />

          <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center mx-auto mb-2 text-[#818cf8]">
            <Upload className="w-7 h-7 stroke-[1.8]" />
          </div>

          <h3 className="text-white font-bold text-[15px] leading-snug mb-1.5">
            Adjuntar documento a la base de conocimiento
          </h3>

          <p className="text-[#78859e] text-[12px] leading-relaxed max-w-[320px] mx-auto font-normal">
            PDF, DOCX, TXT, CSV, XLSX, HTML o imagen • extracción de conceptos y % de carga en tiempo real
          </p>

          {activeProcessingDoc && (
            <div className="mt-4 p-3 bg-[#171b30] border border-[#273258] rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                <span className="flex items-center gap-2 truncate max-w-[200px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400 shrink-0" />
                  Cargando {activeProcessingDoc.name}...
                </span>
                <span className="font-bold text-white text-xs bg-purple-900/60 border border-purple-700/50 px-2 py-0.5 rounded-full">
                  {activeProcessingDoc.progress || 0}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-[#0c101d] rounded-full overflow-hidden border border-[#1f2746]">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${activeProcessingDoc.progress || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section Header: DOCUMENTOS PERMANENTES */}
        <div className="flex items-center gap-2 mb-3.5 text-[#8e9bb0]">
          <Layers className="w-4 h-4 text-[#8e9bb0] stroke-[1.75]" />
          <span className="text-[11px] font-bold tracking-wider uppercase">
            DOCUMENTOS PERMANENTES • {documents.length}
          </span>
        </div>

        {/* Documents List */}
        <div className="space-y-3.5">
          {documents.length === 0 ? (
            <div className="bg-[#121626] border border-[#1e243d] rounded-2xl p-6 text-center text-slate-400">
              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">No hay documentos adjuntos todavía</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Haz clic en el recuadro superior para adjuntar tu primer archivo.
              </p>
            </div>
          ) : (
            documents.map((doc) => {
              const displayName = doc.name.length > 22 ? `${doc.name.slice(0, 19)}...` : doc.name;
              const isDocProcessing = doc.status === 'Procesando' && (doc.progress || 0) < 100;
              const currentPercent = doc.progress !== undefined ? doc.progress : 100;

              return (
                <div
                  key={doc.id}
                  id={`doc-card-${doc.id}`}
                  className="bg-[#121626] border border-[#1e243d] rounded-2xl p-4 shadow-lg shadow-black/30 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left Column: Icon + File Details */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Icon Box */}
                      <div className="w-11 h-11 rounded-xl bg-[#1d2238] border border-[#292f4e] flex items-center justify-center shrink-0 text-[#9d7bf6] mt-0.5">
                        {getDocIcon(doc)}
                      </div>

                      {/* Metadata text */}
                      <div className="min-w-0 flex-1">
                        <h4 
                          className="text-white font-bold text-[15px] leading-snug truncate"
                          title={doc.name}
                        >
                          {displayName}
                        </h4>

                        {/* Format & Size */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8e9bb0] mt-0.5">
                          <span className="font-medium">{doc.extension.toUpperCase()}</span>
                          <Lock className="w-3 h-3 text-[#707f9d] stroke-[2]" />
                          <span>{doc.size}</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1 text-[11px] text-[#8e9bb0] mt-0.5">
                          <Clock className="w-3 h-3 text-[#707f9d]" />
                          <span>{doc.uploadDate}</span>
                        </div>

                        {/* Status with % */}
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold mt-1">
                          {isDocProcessing ? (
                            <span className="text-purple-400 flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                              Cargando ({currentPercent}%)
                            </span>
                          ) : (
                            <span className="text-[#22c55e] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] stroke-[2.2]" />
                              Completado (100%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: 3 Stacked Buttons */}
                    <div className="flex flex-col gap-1.5 shrink-0 w-[100px]">
                      
                      {/* 1. Abrir Button */}
                      <button
                        type="button"
                        id={`btn-open-${doc.id}`}
                        onClick={() => setDocToView(doc)}
                        className="w-full py-1.5 px-3 rounded-xl bg-[#5965f3] hover:bg-[#6873ff] active:scale-[0.98] text-white font-bold text-[12px] flex items-center justify-center transition-all shadow-sm cursor-pointer"
                      >
                        Abrir
                      </button>

                      {/* 2. Descargar Button */}
                      <button
                        type="button"
                        id={`btn-download-${doc.id}`}
                        onClick={() => handleDownloadDoc(doc)}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-[#181d30] hover:bg-[#202742] border border-[#272e4c] active:scale-[0.98] text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-300 stroke-[2]" />
                        <span>Descargar</span>
                      </button>

                      {/* 3. Eliminar Button */}
                      <button
                        type="button"
                        id={`btn-delete-${doc.id}`}
                        onClick={() => setDocToDelete(doc)}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-[#181d30] hover:bg-[#2a1b24] border border-[#38202d] active:scale-[0.98] text-[#f87171] hover:text-[#ff8585] font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#f87171] stroke-[2]" />
                        <span>Eliminar</span>
                      </button>

                    </div>
                  </div>

                  {/* If loading/processing, render inline progress bar inside card */}
                  {isDocProcessing && (
                    <div className="w-full pt-1">
                      <div className="w-full h-1.5 bg-[#0e1222] rounded-full overflow-hidden border border-[#212946]">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${currentPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal with OK validation */}
      <DeleteConfirmModal
        isOpen={!!docToDelete}
        document={docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirmDelete={() => {
          if (docToDelete) {
            onDeleteDocument(docToDelete.id);
            setDocToDelete(null);
          }
        }}
      />

      {/* Document Content / Chapter & Concept Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!docToView}
        document={docToView}
        onClose={() => setDocToView(null)}
        onDownload={handleDownloadDoc}
      />
    </main>
  );
};
