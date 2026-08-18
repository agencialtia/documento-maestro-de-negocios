import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  BookOpen, 
  Layers,
  ArrowRight,
  Info,
  Check,
  Edit3,
  RotateCcw,
  FileText
} from 'lucide-react';
import { FieldGroundingProposal } from '../utils/groundingService';
import { FieldGroundingMeta } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  sectionKey: string;
  proposals: FieldGroundingProposal[];
  onApplyProposals: (proposalsToApply: { fieldKey: string; value: string; meta: FieldGroundingMeta }[]) => void;
}

export const SectionGroundingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sectionTitle,
  sectionKey,
  proposals,
  onApplyProposals,
}) => {
  // Map of fieldKey -> boolean (selected or not)
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    proposals.forEach((p) => {
      // By default, select empty fields, and don't overwrite manual fields unless user chooses
      initial[p.fieldKey] = !p.hasExistingValue;
    });
    return initial;
  });

  // Map of fieldKey -> edited value
  const [editedValues, setEditedValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    proposals.forEach((p) => {
      initial[p.fieldKey] = p.proposedValue;
    });
    return initial;
  });

  // Expanded editor for inline tweaking
  const [activeEditingField, setActiveEditingField] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSelect = (fieldKey: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const handleSelectAll = (onlyEmpty: boolean) => {
    const updated: Record<string, boolean> = {};
    proposals.forEach((p) => {
      if (onlyEmpty) {
        updated[p.fieldKey] = !p.hasExistingValue;
      } else {
        updated[p.fieldKey] = true;
      }
    });
    setSelectedFields(updated);
  };

  const handleDeselectAll = () => {
    setSelectedFields({});
  };

  const handleApply = () => {
    const itemsToApply = proposals
      .filter((p) => selectedFields[p.fieldKey])
      .map((p) => {
        const finalValue = editedValues[p.fieldKey] || p.proposedValue;
        const meta: FieldGroundingMeta = {
          status: 'grounded',
          sourceDocName: p.sourceDocName,
          citationChapter: p.citationChapter,
          evidenceSnippet: `[Aplicado] Fundamentado en la metodología: ${p.methodologyCriteriaUsed}`,
          confidenceScore: p.confidenceScore,
          lastEvaluatedAt: new Date().toISOString(),
        };
        return {
          fieldKey: p.fieldKey,
          value: finalValue,
          meta,
        };
      });

    onApplyProposals(itemsToApply);
    onClose();
  };

  const selectedCount = Object.values(selectedFields).filter(Boolean).length;
  const existingCount = proposals.filter((p) => p.hasExistingValue).length;
  const emptyCount = proposals.length - existingCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0f19] border border-[#1d2744] rounded-3xl shadow-2xl shadow-black/95 text-white overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#1b2542] flex items-start justify-between gap-4 shrink-0 bg-[#0e1424]/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Autocompletado Fundamentado en Evidencia
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {proposals.length} campos analizados
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Propuestas Aplicadas para {sectionTitle}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              El motor aplicó el marco metodológico del Documento Conceptual a los datos reales de tu proyecto. El contenido generado es 100% aplicado, listo para usar y sin explicaciones teóricas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#161f36] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Selection Filters */}
        <div className="px-5 py-3 bg-[#11172a] border-b border-[#1c2747] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Seleccionar para aplicar:</span>
            <button
              onClick={() => handleSelectAll(true)}
              className="px-2.5 py-1 rounded-lg bg-[#16203a] hover:bg-[#1f2d52] text-indigo-300 font-semibold border border-indigo-800/40 transition-colors cursor-pointer"
            >
              Solo campos vacíos ({emptyCount})
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="px-2.5 py-1 rounded-lg bg-[#16203a] hover:bg-[#1f2d52] text-slate-300 font-semibold border border-slate-700/50 transition-colors cursor-pointer"
            >
              Todos ({proposals.length})
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-2.5 py-1 rounded-lg bg-transparent hover:bg-[#16203a] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Desmarcar
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            {existingCount > 0 && (
              <span className="text-[11px] text-amber-300/90 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                {existingCount} campo(s) ya tienen contenido manual (protegidos por defecto)
              </span>
            )}
            <span className="text-[11px] font-bold text-emerald-400">
              {selectedCount} de {proposals.length} seleccionados
            </span>
          </div>
        </div>

        {/* Proposals List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {proposals.map((prop, idx) => {
            const isSelected = !!selectedFields[prop.fieldKey];
            const isEditing = activeEditingField === prop.fieldKey;
            const currentVal = prop.currentValue;
            const proposedVal = editedValues[prop.fieldKey] || prop.proposedValue;

            return (
              <div
                key={prop.fieldKey}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected 
                    ? 'bg-[#0f172a]/90 border-indigo-500/50 shadow-md shadow-indigo-950/30' 
                    : 'bg-[#0c101d] border-[#1a233a] opacity-80 hover:opacity-100'
                }`}
              >
                {/* Field Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      id={`check-${prop.fieldKey}`}
                      checked={isSelected}
                      onChange={() => toggleSelect(prop.fieldKey)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-[#16203a] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label
                          htmlFor={`check-${prop.fieldKey}`}
                          className="text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-indigo-300 transition-colors"
                        >
                          {prop.fieldLabel}
                        </label>
                        {prop.hasExistingValue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            Tiene valor manual
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {prop.citationChapter}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">
                        {prop.fieldDefinition}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setActiveEditingField(isEditing ? null : prop.fieldKey)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isEditing 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-[#151e36] text-slate-300 hover:text-white hover:bg-[#1d2b4d]'
                      }`}
                      title="Editar propuesta antes de aplicar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isEditing ? 'Guardar edición' : 'Ajustar'}</span>
                    </button>
                  </div>
                </div>

                {/* Values Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3">
                  {/* Current Value (if any) */}
                  {prop.hasExistingValue && (
                    <div className="md:col-span-4 bg-[#080c16] border border-[#192440] rounded-xl p-3 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Valor Actual en Formulario
                      </span>
                      <p className="text-slate-300 line-clamp-4 leading-relaxed">
                        {currentVal}
                      </p>
                    </div>
                  )}

                  {/* Proposed Value */}
                  <div className={`${prop.hasExistingValue ? 'md:col-span-8' : 'md:col-span-12'} bg-[#121a30] border border-[#23335c] rounded-xl p-3 text-xs space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Propuesta Aplicada al Negocio
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {prop.confidenceScore}% Coherencia
                      </span>
                    </div>

                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={proposedVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditedValues((prev) => ({ ...prev, [prop.fieldKey]: val }));
                        }}
                        className="w-full bg-[#080c16] border border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none leading-relaxed"
                      />
                    ) : (
                      <p className="text-slate-100 font-medium leading-relaxed">
                        {proposedVal}
                      </p>
                    )}

                    {/* Criteria tag */}
                    <div className="pt-1 border-t border-[#1e2a4a] text-[10px] text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-500" />
                      <span>Criterio: {prop.methodologyCriteriaUsed}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#0e1424] border-t border-[#1b2542] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            Se aplicarán <strong className="text-white">{selectedCount}</strong> propuesta(s) al Documento Maestro de forma inmediata.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#161f36] hover:bg-[#1e2b4d] text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={selectedCount === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar ({selectedCount}) Propuestas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
