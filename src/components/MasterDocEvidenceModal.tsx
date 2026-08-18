import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  BookOpen, 
  Layers,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { FieldGroundingMeta, GroundingStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fieldKey: string;
  fieldLabel: string;
  sectionTitle: string;
  currentValue: string;
  proposedValue: string;
  groundingMeta?: FieldGroundingMeta;
  onAcceptProposal: (val: string, meta: FieldGroundingMeta) => void;
  onKeepManual: () => void;
}

export const MasterDocEvidenceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fieldKey,
  fieldLabel,
  sectionTitle,
  currentValue,
  proposedValue,
  groundingMeta,
  onAcceptProposal,
  onKeepManual,
}) => {
  const [editableProposedValue, setEditableProposedValue] = useState(proposedValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditableProposedValue(proposedValue);
    setIsEditing(false);
  }, [proposedValue, isOpen]);

  if (!isOpen) return null;

  const isGrounded = groundingMeta?.status === 'grounded';
  const isMisaligned = groundingMeta?.status === 'misaligned';
  const confidence = groundingMeta?.confidenceScore || 90;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0c101d] border border-[#1f2a4a] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl shadow-black/90 animate-in zoom-in-95 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#1b2542] pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Evidencia & Autocompletado
              </span>
              {groundingMeta?.citationChapter && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {groundingMeta.citationChapter}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {fieldLabel}
            </h3>
            <span className="text-xs text-slate-400 block">
              {sectionTitle}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#161f36] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Document Badge & Confidence Score */}
        <div className="bg-[#11172a] border border-[#1c2747] rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                MARCO METODOLÓGICO Y EVIDENCIA
              </span>
              <p className="text-xs font-semibold text-slate-200 truncate">
                {groundingMeta?.sourceDocName || 'Documento Maestro Conceptual'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              CONFIANZA
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{confidence}%</span>
            </div>
          </div>
        </div>

        {/* Evidence / Methodology Snippet Box */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-indigo-400" />
            <span>Fundamento Metodológico</span>
          </span>
          <div className="bg-[#080c16] border border-[#192440] rounded-xl p-3 text-[11px] text-slate-300 font-normal leading-relaxed italic border-l-4 border-l-indigo-500 max-h-24 overflow-y-auto">
            {groundingMeta?.evidenceSnippet || 'Criterio de formulación aplicado desde la Base de Conocimiento.'}
          </div>
        </div>

        {/* Misalignment reason if any */}
        {isMisaligned && groundingMeta?.misalignmentReason && (
          <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-3 space-y-1 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300">Desalineación detectada:</span>
              <p className="text-amber-200/90 leading-relaxed text-[11px]">
                {groundingMeta.misalignmentReason}
              </p>
            </div>
          </div>
        )}

        {/* Comparison: Current vs Proposed */}
        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Propuesta Fundamentada (Estrategia Aplicada al Negocio)
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] text-indigo-400 hover:text-indigo-200 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Edit3 className="w-3 h-3" />
                {isEditing ? 'Vista previa' : 'Ajustar texto'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                rows={3}
                value={editableProposedValue}
                onChange={(e) => setEditableProposedValue(e.target.value)}
                className="w-full bg-[#080c16] border border-indigo-500 rounded-xl p-3 text-xs text-white focus:outline-none leading-relaxed"
              />
            ) : (
              <div className="bg-[#12192e] border border-[#233157] rounded-xl p-3 text-xs text-slate-100 font-medium leading-relaxed max-h-32 overflow-y-auto">
                {editableProposedValue || '(Sin propuesta disponible)'}
              </div>
            )}
          </div>

          {currentValue && currentValue !== editableProposedValue && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Valor Actual en Documento Maestro
              </span>
              <div className="bg-[#090d18] border border-[#19223a] rounded-xl p-2.5 text-xs text-slate-400 leading-relaxed max-h-20 overflow-y-auto">
                {currentValue}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1b2542]">
          <button
            onClick={onKeepManual}
            className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Mantener valor actual
          </button>

          <button
            onClick={() => {
              onAcceptProposal(editableProposedValue, {
                ...groundingMeta,
                status: 'grounded',
                lastVerifiedAt: new Date().toISOString(),
              } as FieldGroundingMeta);
              onClose();
            }}
            disabled={!editableProposedValue}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/50 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aplicar propuesta al campo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
