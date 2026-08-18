import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { BusinessCategory, Project } from '../types';
import { 
  generateProjectDescriptions, 
  ProjectDescriptionProposal 
} from '../utils/projectDescriptionEngine';

interface Props {
  isOpen: boolean;
  category: BusinessCategory;
  projectToEdit?: Project | null;
  onClose: () => void;
  onSaveProject: (project: Project) => void;
}

const AVAILABLE_PLATFORMS = [
  'Base44',
  'Trae.ai',
  'Claude',
  'Google AI Studio',
  'ChatGPT',
  'Lovable',
  'Bolt',
  'FlutterFlow',
  'Otra'
];

export const NewProjectModal: React.FC<Props> = ({
  isOpen,
  category,
  projectToEdit,
  onClose,
  onSaveProject,
}) => {
  const [name, setName] = useState('');
  const [idea, setIdea] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Base44']);

  // Proposals and debounce state
  const [proposals, setProposals] = useState<ProjectDescriptionProposal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [seedIndex, setSeedIndex] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset form on open / edit
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name || '');
      setIdea(projectToEdit.idea || '');
      setDescription(projectToEdit.description || '');
      setSelectedPlatforms(projectToEdit.targetPlatforms || ['Base44']);
      setSelectedProposalId(null);

      if (projectToEdit.name && (projectToEdit.idea || projectToEdit.description)) {
        const initialProps = generateProjectDescriptions(
          projectToEdit.name,
          projectToEdit.idea || projectToEdit.description,
          category,
          0
        );
        setProposals(initialProps);
      } else {
        setProposals([]);
      }
    } else {
      setName('');
      setIdea('');
      setDescription('');
      setSelectedPlatforms(['Base44']);
      setProposals([]);
      setSelectedProposalId(null);
      setSeedIndex(0);
    }
  }, [projectToEdit, isOpen, category]);

  // Real-time automatic generation with debounce
  useEffect(() => {
    if (!isOpen) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedName = name.trim();
    const trimmedIdea = idea.trim();

    // Context minimum: at least 2 chars in name and 6 chars in idea
    if (trimmedName.length >= 2 && trimmedIdea.length >= 6) {
      setIsGenerating(true);
      debounceTimerRef.current = setTimeout(() => {
        const newProposals = generateProjectDescriptions(trimmedName, trimmedIdea, category, seedIndex);
        setProposals(newProposals);
        setIsGenerating(false);
      }, 400);
    } else {
      setIsGenerating(false);
      if (!projectToEdit) {
        setProposals([]);
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [name, idea, category, seedIndex, isOpen, projectToEdit]);

  if (!isOpen) return null;

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const getCategoryIconEmoji = (cat: BusinessCategory) => {
    switch (cat) {
      case 'Apps':
        return '📱';
      case 'Cursos Digitales':
        return '📖';
      case 'Servicios':
        return '💼';
      case 'Productos Físicos':
        return '📦';
      default:
        return '🚀';
    }
  };

  const handleSelectProposal = (proposal: ProjectDescriptionProposal) => {
    setDescription(proposal.text);
    setSelectedProposalId(proposal.id);
  };

  const handleRegenerate = () => {
    const nextSeed = seedIndex + 1;
    setSeedIndex(nextSeed);
    if (name.trim().length >= 2 && idea.trim().length >= 5) {
      setIsGenerating(true);
      setTimeout(() => {
        const newProps = generateProjectDescriptions(name.trim(), idea.trim(), category, nextSeed);
        setProposals(newProps);
        setIsGenerating(false);
      }, 200);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const project: Project = {
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      name: name.trim(),
      category: category,
      idea: idea.trim(),
      description: description.trim() || idea.trim() || 'Proyecto sin descripción definida.',
      targetPlatforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['Base44'],
      createdAt: projectToEdit?.createdAt || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      // Preserve existing sub-modules if editing
      prompts: projectToEdit?.prompts,
      socialComments: projectToEdit?.socialComments,
      masterStrategyDoc: projectToEdit?.masterStrategyDoc,
      productArchitecture: projectToEdit?.productArchitecture,
      screensData: projectToEdit?.screensData,
      agentsData: projectToEdit?.agentsData,
      legalCompliance: projectToEdit?.legalCompliance,
      qaTesting: projectToEdit?.qaTesting,
      analyticsData: projectToEdit?.analyticsData,
      goToMarket: projectToEdit?.goToMarket,
      impactAudit: projectToEdit?.impactAudit,
    };

    onSaveProject(project);
    onClose();
  };

  const canShowProposals = proposals.length > 0 || isGenerating;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
      id="new-project-modal-overlay"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[560px] bg-[#0e1222] border border-[#212a4a] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto"
        id="new-project-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1b223c] pb-3.5">
          <div>
            <h3 className="text-[18px] font-bold text-white leading-tight flex items-center gap-2">
              <span>{projectToEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1b2342] text-[#818cf8] border border-[#2b3767] font-medium">
                {getCategoryIconEmoji(category)} {category}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Introduce el nombre y la idea. La IA generará 3 ángulos de descripción para elegir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            id="btn-close-project-modal"
            className="w-8 h-8 rounded-xl bg-[#151b30] hover:bg-[#1f2847] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Field 1: Nombre */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#7e8ba3] uppercase mb-1.5">
              1. NOMBRE DEL PROYECTO *
            </label>
            <input
              type="text"
              required
              id="input-project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Nexo, Flowdesk, TeaCare, LogiTrack..."
              className="w-full bg-[#090c17] border border-[#202947] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Field 2: Idea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold tracking-wider text-[#7e8ba3] uppercase">
                2. IDEA (CONTEXTO E INTENCIÓN) *
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                Describe qué es, para quién y qué resuelve
              </span>
            </div>
            <textarea
              id="input-project-idea"
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="«Una app para ayudar a freelancers a organizar clientes, tareas y cobros sin usar cinco herramientas distintas.»"
              className="w-full bg-[#090c17] border border-[#202947] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed transition-all"
            />
          </div>

          {/* Real-time AI Proposals Box */}
          {canShowProposals && (
            <div className="space-y-2.5 bg-[#0a0e1c] border border-[#1d2645] rounded-xl p-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
                  <span className="text-xs font-bold text-slate-200">
                    3 Ángulos de Posicionamiento Generados
                  </span>
                  {isGenerating && (
                    <span className="text-[10px] text-indigo-400 animate-pulse font-medium">
                      (analizando idea...)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isGenerating || !idea.trim()}
                  id="btn-regenerate-descriptions"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#818cf8] hover:text-[#a5b4fc] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Generar otras 3</span>
                </button>
              </div>

              {/* 3 Proposal Cards */}
              <div className="space-y-2 pt-1">
                {proposals.map((p) => {
                  const isSelected = selectedProposalId === p.id || description.trim() === p.text.trim();
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProposal(p)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative group ${
                        isSelected
                          ? 'bg-[#141b34] border-[#6366f1] ring-1 ring-[#6366f1]/50 shadow-md shadow-indigo-950/40'
                          : 'bg-[#0e1324] hover:bg-[#12182e] border-[#1c243f] hover:border-[#2f3b66]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${p.angleColor}`}>
                            {p.angleLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {p.angleTag}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProposal(p);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-[#182038] hover:bg-[#222c4d] text-slate-300 hover:text-white border border-[#2b365c]'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3 text-white" />
                              <span>Seleccionada</span>
                            </>
                          ) : (
                            <span>Usar esta</span>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        «{p.text}»
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hint when idea is too short */}
          {!canShowProposals && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#090d1a] border border-dashed border-[#1c2440] text-slate-400 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-400/80 shrink-0" />
              <span>
                Escribe arriba el Nombre y la Idea para que la IA genere automáticamente 3 opciones de descripción en tiempo real.
              </span>
            </div>
          )}

          {/* Field 3: Descripción (Final editable output) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold tracking-wider text-[#7e8ba3] uppercase">
                3. DESCRIPCIÓN FINAL DEL PRODUCTO *
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                100% editable por ti
              </span>
            </div>
            <textarea
              id="input-project-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSelectedProposalId(null);
              }}
              placeholder="Elige una opción arriba o escribe/edita la descripción final aquí..."
              className="w-full bg-[#090c17] border border-[#202947] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed transition-all"
            />
          </div>

          {/* Field 4: Plataformas Objetivo */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#7e8ba3] uppercase mb-2">
              PLATAFORMA(S) OBJETIVO
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PLATFORMS.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform);
                return (
                  <button
                    type="button"
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#22234e] text-[#a5b4fc] border-[#4c51bf] shadow-sm'
                        : 'bg-[#101423] text-[#717d98] border-[#1d233c] hover:border-[#2f395e] hover:text-slate-300'
                    }`}
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b223c]">
            <button
              type="button"
              onClick={onClose}
              id="btn-cancel-project"
              className="px-4 py-2 text-xs font-semibold text-[#8e9bb0] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-project"
              className="px-5 py-2.5 rounded-xl bg-[#5965f3] hover:bg-[#6873ff] active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-indigo-950/50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{projectToEdit ? 'Guardar cambios' : 'Crear proyecto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
