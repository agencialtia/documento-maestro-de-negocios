import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Download, 
  Edit3, 
  Save, 
  Layers, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { MasterDocument } from '../types';

interface Props {
  document: MasterDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: MasterDocument) => void;
}

export const KnowledgeDocumentModal: React.FC<Props> = ({
  document,
  isOpen,
  onClose,
  onSaveDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'upload'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(document?.content || '');
  const [docName, setDocName] = useState(document?.name || 'Documento_Maestro_Negocio.pdf');
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string || '';
      const newDoc: MasterDocument = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        fileType: file.type || 'text/plain',
        content: text.length > 50 ? text : `# ${file.name}\n\nDocumento procesado exitosamente con ${file.size} bytes.\n\n## Secciones Detectadas\n1. Modelo operativo y reglas de negocio.\n2. Estructura de valor y monetización.\n3. Parámetros de escalabilidad.`,
        status: 'active',
        sectionsCount: Math.max(4, Math.floor(file.size / 2000)),
        wordCount: Math.max(120, Math.floor(file.size / 10)),
      };
      setEditedContent(newDoc.content);
      setDocName(newDoc.name);
      onSaveDocument(newDoc);
      setActiveTab('overview');
      showToast('¡Documento maestro cargado y sincronizado!');
    };
    reader.readAsText(file);
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
      processFile(file);
    }
  };

  const handleSaveContent = () => {
    if (document) {
      const wordCount = editedContent.trim().split(/\s+/).length;
      const sectionsCount = (editedContent.match(/^##?\s+/gm) || []).length || 1;
      const updated: MasterDocument = {
        ...document,
        name: docName,
        content: editedContent,
        wordCount,
        sectionsCount,
        uploadDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      onSaveDocument(updated);
      setIsEditing(false);
      showToast('Definiciones maestras guardadas correctamente.');
    }
  };

  const handleDownload = () => {
    if (!document) return;
    const blob = new Blob([document.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.name.endsWith('.md') || document.name.endsWith('.txt') ? document.name : `${document.name}.md`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Descarga iniciada.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div 
        className="w-full max-w-lg bg-[#0f1220] border border-[#1e243f] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="knowledge-document-modal"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1b2138] flex items-center justify-between bg-[#131728]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1c223d] border border-[#272e50] flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base leading-tight">
                Documento Maestro
              </h3>
              <p className="text-xs text-slate-400">
                Base central de conocimiento y reglas de negocio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-modal"
            className="w-8 h-8 rounded-lg bg-[#1a1f35] hover:bg-[#222845] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 pt-3 border-b border-[#1b2138] bg-[#111424] gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            id="tab-overview"
            className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Detalles y Estado
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            id="tab-editor"
            className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Contenido y Reglas
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            id="tab-upload"
            className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Subir / Reemplazar
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {toastMessage && (
            <div className="p-3 bg-purple-950/70 border border-purple-600/40 text-purple-300 text-xs rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {document ? (
                <>
                  <div className="bg-[#14182a] border border-[#202742] rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{document.name}</p>
                          <p className="text-xs text-slate-400">{document.size} • Actualizado el {document.uploadDate}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Activo
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1e253e] text-xs">
                      <div className="bg-[#0f1220] p-2.5 rounded-lg border border-[#1b2036]">
                        <span className="text-slate-400 block text-[11px] mb-0.5">Secciones Clave</span>
                        <span className="text-white font-semibold text-sm">{document.sectionsCount} módulos</span>
                      </div>
                      <div className="bg-[#0f1220] p-2.5 rounded-lg border border-[#1b2036]">
                        <span className="text-slate-400 block text-[11px] mb-0.5">Volumen Total</span>
                        <span className="text-white font-semibold text-sm">{document.wordCount.toLocaleString()} palabras</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#14182a] border border-[#202742] rounded-xl p-4 space-y-2.5">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Alcance Operativo del Documento
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>Define la arquitectura estándar para todos los proyectos activos.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>Sincroniza supuestos financieros, costes y modelos de negocio.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>Garantiza coherencia operativa antes del despliegue.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      id="btn-download-doc"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#1a1f36] hover:bg-[#222846] border border-[#262e4f] text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-purple-400" />
                      Descargar documento
                    </button>
                    <button
                      onClick={() => setActiveTab('editor')}
                      id="btn-view-doc-content"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/30 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      Ver / Editar contenido
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-950/40 border border-purple-800/30 text-purple-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-white text-sm font-medium">Aún no hay un documento maestro adjunto</p>
                  <p className="text-slate-400 text-xs max-w-xs mx-auto">
                    Sube un archivo PDF, Markdown o texto con las definiciones de tu negocio.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium cursor-pointer"
                  >
                    Adjuntar archivo ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDITOR */}
          {activeTab === 'editor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="bg-[#141829] border border-[#202742] rounded-lg px-2.5 py-1 text-xs text-white w-2/3 focus:outline-none focus:border-purple-500"
                  placeholder="Nombre del documento"
                />
                <button
                  onClick={handleSaveContent}
                  id="btn-save-doc"
                  className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar
                </button>
              </div>

              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={12}
                className="w-full bg-[#0d101c] border border-[#1e243f] rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Escribe aquí las definiciones maestras de negocio, visión, modelo financiero..."
              />
              <p className="text-[11px] text-slate-500">
                Tip: Puedes usar formato Markdown (## Títulos, - Listas, **Negrita**).
              </p>
            </div>
          )}

          {/* TAB 3: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-purple-400 bg-purple-950/20'
                    : 'border-[#262c4c] bg-[#121627] hover:border-purple-500/50 hover:bg-[#151a2e]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.md,.doc,.docx,.json"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-[#1b2138] border border-[#293154] text-purple-400 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-white text-sm font-medium mb-1">
                  Haz clic o arrastra tu archivo aquí
                </h4>
                <p className="text-slate-400 text-xs max-w-xs mx-auto mb-2">
                  Formatos soportados: PDF, Markdown (.md), TXT, Word (.docx)
                </p>
                <span className="inline-block text-[11px] text-purple-400 font-medium bg-purple-950/50 px-3 py-1 rounded-full border border-purple-800/40">
                  Límite recomendado: 25 MB
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141829] border border-[#1e253e] text-xs text-slate-400 space-y-1">
                <p className="font-medium text-slate-300">¿Qué debe contener el Documento Maestro?</p>
                <p className="text-[11px] leading-relaxed">
                  Cualquier especificación con la visión del negocio, propuesta de valor, público objetivo, reglas de pricing y lineamientos que sirvan de base para tus proyectos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#1b2138] bg-[#0d101d] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[#1c223d] hover:bg-[#252c4e] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
