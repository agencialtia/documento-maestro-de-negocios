import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  ArrowLeft,
  Home as HomeIcon,
  ChevronDown,
  Copy,
  Check,
  Download,
  Sparkles,
  Mic,
  MicOff,
  Paperclip,
  Link as LinkIcon,
  FileText,
  BarChart2,
  Users,
  Zap,
  Layers,
  Target,
  Box,
  ShoppingCart,
  Star,
  Palette,
  MessageCircle,
  Save,
  Trash2,
  AlertTriangle,
  X,
  Plus,
  ShieldCheck,
  BookOpen,
  Info,
  ExternalLink,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Project, AttachedDocument, FieldGroundingMeta, GroundingStatus, ProjectContradictionWarning } from '../types';
import { MASTER_DOC_SECTIONS, getInitialMasterDocData } from '../data/masterDocDefaults';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { initialAttachedDocuments } from '../data/initialData';
import { 
  findDocumentaryEvidence, 
  detectMasterDocContradictions, 
  calculateGroundingMetrics,
  generateGroundedSectionProposals,
  FieldGroundingProposal,
  FIELD_CONCEPT_ANCHORS 
} from '../utils/groundingService';
import { MasterDocEvidenceModal } from './MasterDocEvidenceModal';
import { SectionGroundingModal } from './SectionGroundingModal';

interface Props {
  project: Project;
  attachedDocuments?: AttachedDocument[];
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectMasterDocScreen: React.FC<Props> = ({
  project,
  attachedDocuments,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  // Active Filter / Selected Section ('total', 'misaligned', 'contradictions', or 1..12)
  const [selectedFilter, setSelectedFilter] = useState<'total' | 'misaligned' | 'contradictions' | number>(1);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Documents state
  const [attachedDocs, setAttachedDocs] = useState<AttachedDocument[]>(() => {
    if (attachedDocuments && attachedDocuments.length > 0) return attachedDocuments;
    const saved = localStorage.getItem('screenos_attached_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing attached docs:', e);
      }
    }
    return initialAttachedDocuments;
  });

  // Form Data State per project
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(`screenos_master_doc_${project.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing master doc:', e);
      }
    }
    if (project.masterStrategyDoc?.sections) {
      return project.masterStrategyDoc.sections;
    }
    return getInitialMasterDocData(project);
  });

  // Grounding Metadata per field
  const [groundingMetadata, setGroundingMetadata] = useState<Record<string, FieldGroundingMeta>>(() => {
    const saved = localStorage.getItem(`screenos_master_doc_meta_${project.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing grounding meta:', e);
      }
    }
    if (project.masterStrategyDoc?.groundingMetadata) {
      return project.masterStrategyDoc.groundingMetadata;
    }
    // Initialize default anchors
    const initialMeta: Record<string, FieldGroundingMeta> = {};
    FIELD_CONCEPT_ANCHORS.forEach((anchor) => {
      initialMeta[`${anchor.sectionKey}_${anchor.fieldKey}`] = {
        status: 'grounded',
        sourceDocName: 'Documento Maestro Conceptual (Base Canónica)',
        citationChapter: anchor.sectionTitle,
        confidenceScore: 88,
        evidenceSnippet: `Fundamentado en la taxonomía canónica de ${anchor.fieldLabel}.`,
        lastEvaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });
    return initialMeta;
  });

  // Baseline saved state
  const [savedData, setSavedData] = useState<Record<string, any>>(() => formData);

  // Auto-hiding save button state (appears on change and disappears after 3 seconds)
  const [showTemporarySaveButton, setShowTemporarySaveButton] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  // Unsaved changes navigation modal
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavAction, setPendingNavAction] = useState<(() => void) | null>(null);
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(savedData);

  // Saving indicator
  const [isSaving, setIsSaving] = useState(false);

  // Copy state
  const [isCopied, setIsCopied] = useState(false);

  // Dictation state: active field key
  const [dictatingField, setDictatingField] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Link Attachment Modal state
  const [linkModalField, setLinkModalField] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState('');

  // AI Proposing indicator
  const [isProposingAi, setIsProposingAi] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Evidence Inspection Modal State
  const [evidenceModalData, setEvidenceModalData] = useState<{
    isOpen: boolean;
    fieldKey: string;
    fieldLabel: string;
    sectionKey: string;
    sectionTitle: string;
    currentValue: string;
    proposedValue: string;
    meta?: FieldGroundingMeta;
  }>({
    isOpen: false,
    fieldKey: '',
    fieldLabel: '',
    sectionKey: '',
    sectionTitle: '',
    currentValue: '',
    proposedValue: '',
  });

  // Section Grounding Modal State
  const [sectionGroundingModal, setSectionGroundingModal] = useState<{
    isOpen: boolean;
    sectionKey: string;
    sectionTitle: string;
    proposals: FieldGroundingProposal[];
  }>({
    isOpen: false,
    sectionKey: '',
    sectionTitle: '',
    proposals: [],
  });

  // Detect contradictions dynamically
  const contradictions = detectMasterDocContradictions(formData, project, attachedDocs);

  // Calculate real-time metrics
  const metrics = calculateGroundingMetrics(formData, groundingMetadata);

  // 3-Second Temporary Save Button Display Logic
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (JSON.stringify(formData) !== JSON.stringify(savedData)) {
      setShowTemporarySaveButton(true);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        setShowTemporarySaveButton(false);
      }, 3000);
    } else {
      setShowTemporarySaveButton(false);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    }
  }, [formData, savedData]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update Field Value
  const handleFieldChange = (sectionKey: string, fieldKey: string, value: string) => {
    const fullKey = `${sectionKey}_${fieldKey}`;
    setFormData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldKey]: value,
      },
    }));

    // Update status to manual if changed by user typing
    setGroundingMetadata((prev) => ({
      ...prev,
      [fullKey]: {
        ...(prev[fullKey] || { status: 'manual' }),
        status: 'manual',
        lastEvaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    }));
  };

  // Save changes
  const handleSaveChanges = () => {
    setIsSaving(true);
    setShowTemporarySaveButton(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    try {
      localStorage.setItem(`screenos_master_doc_${project.id}`, JSON.stringify(formData));
      localStorage.setItem(`screenos_master_doc_meta_${project.id}`, JSON.stringify(groundingMetadata));
      setSavedData(JSON.parse(JSON.stringify(formData)));

      if (onUpdateProject) {
        onUpdateProject({
          ...project,
          masterStrategyDoc: {
            lastUpdated: new Date().toISOString(),
            sections: formData,
            groundingMetadata,
            contradictions,
          },
          updatedAt: new Date().toISOString(),
        });
      }

      showToast('Documento Maestro y metadatos de evidencia guardados');
    } catch (e) {
      console.error('Error saving master doc:', e);
      showToast('Error al guardar documento');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setFormData(JSON.parse(JSON.stringify(savedData)));
    setShowTemporarySaveButton(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    showToast('Cambios descartados');
  };

  // Navigation Guard
  const handleProtectedAction = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavAction(() => action);
      setShowUnsavedModal(true);
    } else {
      action();
    }
  };

  // Speech Recognition (Dictar)
  const toggleDictation = (sectionKey: string, fieldKey: string) => {
    const fullKey = `${sectionKey}_${fieldKey}`;
    if (dictatingField === fullKey) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
      setDictatingField(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz nativo.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setDictatingField(fullKey);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setFormData((prev) => {
            const currentVal = prev[sectionKey]?.[fieldKey] || '';
            const separator = currentVal.trim().length > 0 ? ' ' : '';
            return {
              ...prev,
              [sectionKey]: {
                ...(prev[sectionKey] || {}),
                [fieldKey]: currentVal + separator + transcript,
              },
            };
          });
        }
      };

      recognition.onerror = () => {
        setDictatingField(null);
      };

      recognition.onend = () => {
        setDictatingField(null);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setDictatingField(null);
    }
  };

  // File Upload (Adjuntar archivo al campo)
  const handleFileUploadForField = (sectionKey: string, fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const snippet = content.slice(0, 500);
        setFormData((prev) => {
          const currentVal = prev[sectionKey]?.[fieldKey] || '';
          const separator = currentVal.trim().length > 0 ? '\n\n' : '';
          return {
            ...prev,
            [sectionKey]: {
              ...(prev[sectionKey] || {}),
              [fieldKey]: `${currentVal}${separator}[Adjunto: ${file.name}]\n${snippet}`,
            },
          };
        });
        showToast(`Archivo "${file.name}" adjuntado al campo`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Link Attachment Modal
  const handleSaveLink = () => {
    if (!linkModalField || !linkInput.trim()) return;
    const [sectionKey, fieldKey] = linkModalField.split(':');

    setFormData((prev) => {
      const currentVal = prev[sectionKey]?.[fieldKey] || '';
      const separator = currentVal.trim().length > 0 ? '\n' : '';
      return {
        ...prev,
        [sectionKey]: {
          ...(prev[sectionKey] || {}),
          [fieldKey]: `${currentVal}${separator}[Enlace: ${linkInput.trim()}]`,
        },
      };
    });
    setLinkModalField(null);
    setLinkInput('');
    showToast('Enlace agregado al campo');
  };

  // Open Evidence Inspector for a single field
  const handleInspectOrProposeField = (
    sectionKey: string,
    fieldKey: string,
    fieldLabel: string,
    sectionTitle: string
  ) => {
    const fullKey = `${sectionKey}_${fieldKey}`;
    const currentValue = formData[sectionKey]?.[fieldKey] || '';
    const currentMeta = groundingMetadata[fullKey];

    // Find documentary evidence
    const result = findDocumentaryEvidence(sectionKey, fieldKey, project, attachedDocs);

    setEvidenceModalData({
      isOpen: true,
      fieldKey,
      fieldLabel,
      sectionKey,
      sectionTitle,
      currentValue,
      proposedValue: result.found ? result.proposedText : currentValue,
      meta: {
        status: result.found ? 'grounded' : (currentMeta?.status || 'manual'),
        sourceDocName: result.sourceDocName,
        citationChapter: result.citationChapter,
        evidenceSnippet: result.evidenceSnippet,
        confidenceScore: result.confidenceScore,
        conceptIds: result.conceptIds,
        lastEvaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });
  };

  // Grounded AI Proposal for Whole Section (opens interactive review modal)
  const handleProposeSectionWithEvidence = (section: typeof MASTER_DOC_SECTIONS[0]) => {
    setIsProposingAi(true);

    setTimeout(() => {
      const result = generateGroundedSectionProposals(section.key, project, formData, attachedDocs);
      setSectionGroundingModal({
        isOpen: true,
        sectionKey: section.key,
        sectionTitle: section.title,
        proposals: result.proposals,
      });
      setIsProposingAi(false);
    }, 250);
  };

  // Handler to apply reviewed section proposals
  const handleApplySectionProposals = (
    proposalsToApply: { fieldKey: string; value: string; meta: FieldGroundingMeta }[]
  ) => {
    if (proposalsToApply.length === 0) return;

    const currentSectionKey = sectionGroundingModal.sectionKey;
    const updatedSection = { ...(formData[currentSectionKey] || {}) };
    const updatedMeta = { ...groundingMetadata };

    proposalsToApply.forEach((item) => {
      updatedSection[item.fieldKey] = item.value;
      const fullKey = `${currentSectionKey}_${item.fieldKey}`;
      updatedMeta[fullKey] = item.meta;
    });

    setFormData((prev) => ({
      ...prev,
      [currentSectionKey]: updatedSection,
    }));
    setGroundingMetadata(updatedMeta);
    showToast(`${proposalsToApply.length} propuesta(s) fundamentada(s) aplicadas a ${sectionGroundingModal.sectionTitle}`);
  };

  // Generate Full Document Markdown for Export
  const generateMarkdownDocument = () => {
    let md = `# DOCUMENTO MAESTRO — VERSIÓN FINAL\n`;
    md += `## Estrategia del Proyecto: ${project.name}\n`;
    md += `*Fuente única de verdad. La estrategia precede y dicta el diseño.*\n\n`;

    MASTER_DOC_SECTIONS.forEach((sec) => {
      md += `### ${sec.title}\n\n`;
      sec.subsections.forEach((sub) => {
        md += `#### ${sub.number} ${sub.title}\n\n`;
        sub.fields.forEach((field) => {
          const fullKey = `${sec.key}_${field.key}`;
          const val = formData[sec.key]?.[field.key] || '(No completado)';
          const meta = groundingMetadata[fullKey];
          const statusTag = meta?.status === 'grounded' ? ' [🟢 Fundamentado]' : ' [🔵 Manual]';
          md += `**${field.label}${statusTag}:**\n${val}\n`;
          if (meta?.citationChapter) {
            md += `*Fuente: ${meta.sourceDocName || 'KB'} (${meta.citationChapter})*\n`;
          }
          md += `\n`;
        });
      });
      md += `---\n\n`;
    });

    return md;
  };

  // Copy Document
  const handleCopyDocument = () => {
    const md = generateMarkdownDocument();
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    showToast('Documento Maestro copiado al portapapeles');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download Document
  const handleDownloadDocument = () => {
    const md = generateMarkdownDocument();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Documento_Maestro_${project.name.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Descargando Documento Maestro (.md)');
  };

  // Active section for detailed view
  const activeSection = typeof selectedFilter === 'number'
    ? MASTER_DOC_SECTIONS.find((s) => s.id === selectedFilter)
    : null;

  // Render Icon helper
  const renderSectionIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'FileText': return <FileText className={className} />;
      case 'BarChart2': return <BarChart2 className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Target': return <Target className={className} />;
      case 'Box': return <Box className={className} />;
      case 'ShoppingCart': return <ShoppingCart className={className} />;
      case 'Star': return <Star className={className} />;
      case 'Palette': return <Palette className={className} />;
      case 'MessageCircle': return <MessageCircle className={className} />;
      default: return <FileText className={className} />;
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-master-doc-root"
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#161d36] border border-indigo-500/50 text-slate-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Evidence Inspector Modal */}
      <MasterDocEvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() => setEvidenceModalData((prev) => ({ ...prev, isOpen: false }))}
        fieldKey={evidenceModalData.fieldKey}
        fieldLabel={evidenceModalData.fieldLabel}
        sectionTitle={evidenceModalData.sectionTitle}
        currentValue={evidenceModalData.currentValue}
        proposedValue={evidenceModalData.proposedValue}
        groundingMeta={evidenceModalData.meta}
        onAcceptProposal={(val, meta) => {
          handleFieldChange(evidenceModalData.sectionKey, evidenceModalData.fieldKey, val);
          const fullKey = `${evidenceModalData.sectionKey}_${evidenceModalData.fieldKey}`;
          setGroundingMetadata((prev) => ({
            ...prev,
            [fullKey]: meta,
          }));
          showToast('Propuesta fundamentada aplicada con éxito');
        }}
        onKeepManual={() => {
          const fullKey = `${evidenceModalData.sectionKey}_${evidenceModalData.fieldKey}`;
          setGroundingMetadata((prev) => ({
            ...prev,
            [fullKey]: {
              ...(prev[fullKey] || { status: 'manual' }),
              status: 'manual',
              lastEvaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          }));
          setEvidenceModalData((prev) => ({ ...prev, isOpen: false }));
          showToast('Conservado como valor manual');
        }}
      />

      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="maestro"
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          handleProtectedAction(() => {
            if (onNavigateModule) onNavigateModule(mod);
          });
        }}
        onNavigateHome={() => handleProtectedAction(onNavigateHome)}
      />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#090c15]/95 backdrop-blur-md border-b border-[#151b2e] px-4 py-3">
        <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              id="btn-master-doc-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Volver button */}
            <button
              onClick={() => handleProtectedAction(onBack)}
              id="btn-master-doc-top-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            {/* Home Icon */}
            <button
              onClick={() => handleProtectedAction(onNavigateHome)}
              id="btn-master-doc-top-home"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Ir al inicio"
            >
              <HomeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Title Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-between">
            <span>Estrategia del Proyecto</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300">
              {metrics.completionPercentage}% completado
            </span>
          </h1>
          <p className="text-[#8e9cb5] text-xs sm:text-[13px] leading-relaxed font-normal">
            Fuente única de verdad. La estrategia precede y dicta el diseño.
          </p>
        </div>

        {/* Real-time Evidence & Grounding Coverage Card */}
        <div className="bg-[#0b1020] border border-[#1d2747] rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                COBERTURA DE EVIDENCIA DOCUMENTAL
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">
              {metrics.groundedPercentage}% Fundamentado
            </span>
          </div>

          {/* Dual Progress Bar */}
          <div className="w-full h-2 bg-[#151d36] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${metrics.groundedPercentage}%` }}
              title={`Fundamentado: ${metrics.groundedPercentage}%`}
            />
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${Math.max(0, metrics.completionPercentage - metrics.groundedPercentage)}%` }}
              title={`Manual: ${Math.max(0, metrics.completionPercentage - metrics.groundedPercentage)}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {metrics.groundedFieldsCount} Fundamentados
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {metrics.manualFieldsCount} Manuales
            </span>
            {contradictions.length > 0 ? (
              <button
                onClick={() => setSelectedFilter('contradictions')}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3" />
                {contradictions.length} Inconsistencias
              </button>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                0 Inconsistencias
              </span>
            )}
          </div>
        </div>

        {/* Numbered Pills Selector Card */}
        <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3.5 shadow-md space-y-2.5">
          {/* Row 1: Total, 1..7 */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <button
              onClick={() => setSelectedFilter('total')}
              id="filter-btn-total"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'total'
                  ? 'bg-[#1c2642] border border-[#3b4b80] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Total
            </button>

            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedFilter(num)}
                id={`filter-btn-${num}`}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === num
                    ? 'bg-[#1c2642] border border-[#3b4b80] text-white shadow-inner'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Row 2: 8..12 + Inconsistencias filter */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {[8, 9, 10, 11, 12].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedFilter(num)}
                  id={`filter-btn-${num}`}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedFilter === num
                      ? 'bg-[#1c2642] border border-[#3b4b80] text-white shadow-inner'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Inconsistencias Tab Button */}
            {contradictions.length > 0 && (
              <button
                onClick={() => setSelectedFilter('contradictions')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  selectedFilter === 'contradictions'
                    ? 'bg-amber-950/80 border border-amber-500 text-amber-200'
                    : 'bg-[#1a1715] border border-amber-800/40 text-amber-400 hover:bg-amber-950/50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Inconsistencias ({contradictions.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Copiar & Descargar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyDocument}
            id="btn-master-doc-copy"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111628] hover:bg-[#18213b] border border-[#1f2845] text-slate-200 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadDocument}
            id="btn-master-doc-download"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111628] hover:bg-[#18213b] border border-[#1f2845] text-slate-200 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Descargar</span>
          </button>
        </div>

        {/* VIEW MODE A: "Total" Overview List */}
        {selectedFilter === 'total' && (
          <div className="space-y-2 pt-2 animate-in fade-in duration-150">
            {MASTER_DOC_SECTIONS.map((sec) => {
              const secMetrics = metrics.sectionBreakdown.find((b) => b.sectionId === sec.id);
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedFilter(sec.id)}
                  id={`block-overview-${sec.id}`}
                  className="bg-[#0e1322] hover:bg-[#12182c] border border-[#171f38] hover:border-[#273560] rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer group transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0">
                      {renderSectionIcon(sec.iconName, 'w-4 h-4')}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors block truncate">
                        {sec.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{secMetrics?.completedFields || 0}/{secMetrics?.totalFields || 0} campos</span>
                        <span>•</span>
                        <span className="text-emerald-400">{secMetrics?.groundedPercentage || 0}% fundamentado</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-[#818cf8] group-hover:text-[#a5b4fc] transition-colors shrink-0">
                    <span>Editar</span>
                    <span className="text-xs">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE B: Contradictions Overview Filter */}
        {selectedFilter === 'contradictions' && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="bg-[#181310] border border-amber-600/40 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Inconsistencias y Contradicciones Detectadas ({contradictions.length})</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                El motor de trazabilidad ha identificado desacoples semánticos entre campos del Documento Maestro o con la Base de Conocimiento.
              </p>
            </div>

            {contradictions.map((c) => (
              <div
                key={c.id}
                className="bg-[#0e1322] border border-[#232c4d] rounded-2xl p-4 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {c.sectionTitle} • {c.fieldLabel}
                    </span>
                    <h4 className="text-xs font-bold text-white">
                      Conflicto con: {c.conflictingSectionTitle} ({c.conflictingFieldLabel})
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 font-mono">
                    {c.severity.toUpperCase()}
                  </span>
                </div>

                <div className="bg-[#090d18] border border-[#19223a] rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                  <p className="font-medium text-amber-200/90">{c.reason}</p>
                </div>

                <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-xl p-3 text-xs text-indigo-200 space-y-1">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-300 block">
                    Sugerencia de resolución:
                  </span>
                  <p className="leading-relaxed">{c.suggestion}</p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      const secObj = MASTER_DOC_SECTIONS.find((s) => s.key === c.sectionKey);
                      if (secObj) setSelectedFilter(secObj.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Ir al campo en {c.sectionTitle} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW MODE C: Detailed Section View (1..12) */}
        {activeSection && (
          <div className="space-y-6 pt-1 animate-in fade-in duration-150">
            {/* Section Header Card with Proponer con Evidencia button */}
            <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="text-indigo-400 shrink-0">
                  {renderSectionIcon(activeSection.iconName, 'w-5 h-5')}
                </div>
                <h2 className="text-base font-bold text-white truncate">
                  {activeSection.title}
                </h2>
              </div>

              {/* Proponer con Evidencia button */}
              <button
                onClick={() => handleProposeSectionWithEvidence(activeSection)}
                disabled={isProposingAi}
                id="btn-propose-ai"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#221c3b] hover:bg-[#2c234e] border border-[#493b79] text-[#c084fc] hover:text-[#d8b4fe] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shrink-0"
                title="Fundamentar campos con fragmentos de la Base de Conocimiento"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProposingAi ? 'Fundamentando...' : 'Proponer con Evidencia'}</span>
              </button>
            </div>

            {/* Subsections List */}
            {activeSection.subsections.map((subsection) => (
              <div key={subsection.number} className="space-y-4">
                {/* Subsection Header */}
                <div className="flex items-center gap-2 border-b border-[#1b233d] pb-1.5">
                  <span className="text-[11px] font-bold tracking-wider text-[#6366f1] uppercase">
                    {subsection.number} {subsection.title}
                  </span>
                </div>

                {/* Subsection Fields */}
                <div className="space-y-4">
                  {subsection.fields.map((field) => {
                    const fullFieldKey = `${activeSection.key}_${field.key}`;
                    const isDictating = dictatingField === fullFieldKey;
                    let fieldValue = formData[activeSection.key]?.[field.key] ?? '';
                    const fieldMeta = groundingMetadata[fullFieldKey];
                    const isGrounded = fieldMeta?.status === 'grounded';
                    const isManual = fieldMeta?.status === 'manual';
                    const isMisaligned = fieldMeta?.status === 'misaligned';

                    // Check if this field has a contradiction warning
                    const fieldContradiction = contradictions.find(
                      (c) => c.sectionKey === activeSection.key && c.fieldKey === field.key
                    );

                    // Resolve canonical fallback for inherited fields if empty
                    if (field.type === 'inherited' && (!fieldValue || fieldValue.trim() === '')) {
                      if (field.key === 'nombre_de_la_marca') {
                        fieldValue = formData.producto?.nombre_del_producto || formData.mecanismo?.nombre_definitivo || '';
                      } else if (field.key === 'mecanismo_posicionamiento') {
                        fieldValue = formData.mecanismo?.nombre_definitivo || formData.mecanismo?.definicion_funcional || '';
                      } else if (field.key === 'resumen_de_una_frase') {
                        fieldValue = formData.posicionamiento?.resumen_de_un_parrafo || '';
                      } else if (field.inheritedFrom === 'Nombre del producto') {
                        fieldValue = formData.producto?.nombre_del_producto || '';
                      } else if (field.inheritedFrom === 'Mecanismo Único') {
                        fieldValue = formData.mecanismo?.nombre_definitivo || formData.mecanismo?.definicion_funcional || '';
                      } else if (field.inheritedFrom === 'Posicionamiento') {
                        fieldValue = formData.posicionamiento?.resultado_prometido || formData.posicionamiento?.resumen_de_una_frase || '';
                      }
                    }

                    return (
                      <div key={field.key} className="space-y-2">
                        {/* Field Label & Grounding Status Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#73829c] truncate">
                            {field.label}
                          </label>

                          {/* Grounding Status Pill */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isGrounded ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleInspectOrProposeField(
                                    activeSection.key,
                                    field.key,
                                    field.label,
                                    activeSection.title
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/70 border border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/80 transition-colors cursor-pointer"
                                title="Ver fragmento de evidencia y capítulo de la KB"
                              >
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>Fundamentado</span>
                              </button>
                            ) : isMisaligned ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleInspectOrProposeField(
                                    activeSection.key,
                                    field.key,
                                    field.label,
                                    activeSection.title
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/70 border border-amber-600/50 text-amber-300 hover:bg-amber-900/80 transition-colors cursor-pointer animate-pulse"
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Desalineado</span>
                              </button>
                            ) : fieldValue ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#161d36] border border-[#273460] text-slate-400">
                                <span>Manual</span>
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Inline Contradiction Warning Alert */}
                        {fieldContradiction && (
                          <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-3 space-y-1.5 text-xs text-amber-200 animate-in fade-in">
                            <div className="flex items-center gap-1.5 font-bold text-amber-300">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>Inconsistencia detectada con {fieldContradiction.conflictingFieldLabel}</span>
                            </div>
                            <p className="text-amber-200/90 leading-relaxed font-normal">
                              {fieldContradiction.reason}
                            </p>
                          </div>
                        )}

                        {/* Field Type 1: Inherited Box */}
                        {field.type === 'inherited' ? (
                          <div className="space-y-2">
                            <div>
                              {field.inheritedTag ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#221c3b] text-[#c084fc] border border-[#493b79]">
                                  {field.inheritedTag}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                                  Heredado de {field.inheritedFrom || 'Posicionamiento'}
                                </span>
                              )}
                            </div>

                            <div className="border border-dashed border-amber-600/40 bg-[#16130d]/50 rounded-xl p-4 flex items-center justify-between gap-3">
                              <p className="text-xs text-amber-200/80 italic font-normal leading-relaxed">
                                {fieldValue ? (
                                  <span className="not-italic text-slate-200 font-medium">{fieldValue}</span>
                                ) : (
                                  `El campo canónico (${field.inheritedFrom || 'Posicionamiento'}) está vacío. Completa primero ese campo.`
                                )}
                              </p>

                              <button
                                type="button"
                                onClick={() => {
                                  if (field.targetSectionId) {
                                    setSelectedFilter(field.targetSectionId);
                                  } else {
                                    setSelectedFilter(7);
                                  }
                                }}
                                className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1c1a35] hover:bg-[#27244a] text-[#818cf8] hover:text-white border border-[#3b366c] text-xs font-semibold transition-all cursor-pointer"
                              >
                                <span>Personalizar</span>
                                <span>→</span>
                              </button>
                            </div>
                          </div>
                        ) : field.type === 'color' ? (
                          /* Field Type: Color Input with Swatch & Hex */
                          <div className="flex items-center gap-3">
                            <label
                              htmlFor={`input-color-native-${field.key}`}
                              className="w-10 h-10 rounded-xl border border-[#273258] flex-shrink-0 cursor-pointer shadow-inner relative overflow-hidden transition-transform hover:scale-105"
                              style={{ backgroundColor: /^#([0-9A-F]{3}){1,2}$/i.test(fieldValue) ? fieldValue : '#6366f1' }}
                            >
                              <input
                                type="color"
                                id={`input-color-native-${field.key}`}
                                value={fieldValue.startsWith('#') && fieldValue.length === 7 ? fieldValue : '#6366f1'}
                                onChange={(e) => handleFieldChange(activeSection.key, field.key, e.target.value.toUpperCase())}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                              />
                            </label>
                            <input
                              type="text"
                              id={`input-${field.key}`}
                              value={fieldValue}
                              onChange={(e) => handleFieldChange(activeSection.key, field.key, e.target.value)}
                              placeholder={field.placeholder || '#000000'}
                              className="w-full max-w-[200px] bg-[#0d111d] border border-[#1b233d] focus:border-[#6366f1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-mono uppercase"
                            />
                          </div>
                        ) : field.type === 'textarea' ? (
                          /* Field Type 2: Textarea */
                          <textarea
                            id={`input-${field.key}`}
                            rows={3}
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(activeSection.key, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-[#0d111d] border border-[#1b233d] focus:border-[#6366f1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all resize-y font-normal leading-relaxed"
                          />
                        ) : (
                          /* Field Type 3: Standard Single-line Input */
                          <input
                            type="text"
                            id={`input-${field.key}`}
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(activeSection.key, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-[#0d111d] border border-[#1b233d] focus:border-[#6366f1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-normal"
                          />
                        )}

                        {/* Action Buttons: [ 💡 Proponer ] [ 🎙 Dictar ] [ 📎 Archivo ] [ 🔗 Enlace ] */}
                        {field.type !== 'inherited' && (
                          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                            {/* Proponer con Evidencia Quick Action */}
                            <button
                              type="button"
                              onClick={() =>
                                handleInspectOrProposeField(
                                  activeSection.key,
                                  field.key,
                                  field.label,
                                  activeSection.title
                                )
                              }
                              id={`btn-propose-${field.key}`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1c1833] hover:bg-[#28214a] border border-[#433671] text-[#c084fc] hover:text-[#d8b4fe] text-[11px] font-semibold transition-all cursor-pointer"
                              title="Buscar evidencia documental y proponer valor fundamentado"
                            >
                              <Sparkles className="w-3 h-3 text-[#c084fc]" />
                              <span>{isGrounded ? 'Ver Evidencia' : 'Proponer'}</span>
                            </button>

                            {/* Dictar button */}
                            <button
                              type="button"
                              onClick={() => toggleDictation(activeSection.key, field.key)}
                              id={`btn-dictar-${field.key}`}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                                isDictating
                                  ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                                  : 'bg-[#121728] hover:bg-[#182038] border-[#202947] text-slate-300 hover:text-white'
                              }`}
                            >
                              {isDictating ? (
                                <>
                                  <MicOff className="w-3 h-3 text-rose-400" />
                                  <span className="text-rose-300">Detener</span>
                                </>
                              ) : (
                                <>
                                  <Mic className="w-3 h-3 text-indigo-400" />
                                  <span>Dictar</span>
                                </>
                              )}
                            </button>

                            {/* Archivo button with hidden file input */}
                            <label
                              htmlFor={`file-input-${activeSection.key}-${field.key}`}
                              id={`label-file-${field.key}`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121728] hover:bg-[#182038] border border-[#202947] text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
                            >
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              <span>Archivo</span>
                              <input
                                id={`file-input-${activeSection.key}-${field.key}`}
                                type="file"
                                accept=".txt,.md,.json,.csv,.doc,.pdf,image/*"
                                onChange={(e) => handleFileUploadForField(activeSection.key, field.key, e)}
                                className="hidden"
                              />
                            </label>

                            {/* Enlace button */}
                            <button
                              type="button"
                              onClick={() => {
                                setLinkModalField(`${activeSection.key}:${field.key}`);
                                setLinkInput('');
                              }}
                              id={`btn-enlace-${field.key}`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121728] hover:bg-[#182038] border border-[#202947] text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
                            >
                              <LinkIcon className="w-3 h-3 text-slate-400" />
                              <span>Enlace</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Temporary Floating Bottom Save Bar */}
      {hasUnsavedChanges && showTemporarySaveButton && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[440px] sm:max-w-md bg-[#0f1424]/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-2 animate-in slide-in-from-bottom-4 transition-all duration-300">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-xs font-bold text-white truncate">
              Documento modificado
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDiscardChanges}
              className="px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar ahora'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Link Attachment Modal */}
      {linkModalField && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setLinkModalField(null)}
        >
          <div
            className="w-full max-w-sm bg-[#0e1322] border border-[#212b4b] rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                <span>Adjuntar Enlace</span>
              </h3>
              <button
                onClick={() => setLinkModalField(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300">URL del enlace o recurso:</label>
              <input
                type="url"
                autoFocus
                placeholder="https://ejemplo.com/recurso"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLink();
                }}
                className="w-full bg-[#111628] border border-[#202a4a] focus:border-[#6366f1] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLinkModalField(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLink}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Agregar Enlace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowUnsavedModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[#0e1322] border border-[#212b4b] rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">¿Descartar cambios?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tienes modificaciones sin guardar en el Documento Maestro. Si sales ahora, se perderán los cambios recientes.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  if (pendingNavAction) pendingNavAction();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Salir sin guardar
              </button>
              <button
                onClick={() => {
                  handleSaveChanges();
                  setShowUnsavedModal(false);
                  if (pendingNavAction) pendingNavAction();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Guardar y salir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Evidence Modal for Individual Field */}
      <MasterDocEvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() => setEvidenceModalData((prev) => ({ ...prev, isOpen: false }))}
        fieldKey={evidenceModalData.fieldKey}
        fieldLabel={evidenceModalData.fieldLabel}
        sectionTitle={evidenceModalData.sectionTitle}
        currentValue={evidenceModalData.currentValue}
        proposedValue={evidenceModalData.proposedValue}
        groundingMeta={evidenceModalData.meta}
        onAcceptProposal={(newVal, meta) => {
          handleFieldChange(evidenceModalData.sectionKey, evidenceModalData.fieldKey, newVal);
          const fullKey = `${evidenceModalData.sectionKey}_${evidenceModalData.fieldKey}`;
          setGroundingMetadata((prev) => ({
            ...prev,
            [fullKey]: meta,
          }));
          showToast(`Propuesta aplicada con evidencia a ${evidenceModalData.fieldLabel}`);
        }}
        onKeepManual={() => {
          setEvidenceModalData((prev) => ({ ...prev, isOpen: false }));
        }}
      />

      {/* Section Grounding Modal for Full Section Review */}
      <SectionGroundingModal
        isOpen={sectionGroundingModal.isOpen}
        onClose={() => setSectionGroundingModal((prev) => ({ ...prev, isOpen: false }))}
        sectionTitle={sectionGroundingModal.sectionTitle}
        sectionKey={sectionGroundingModal.sectionKey}
        proposals={sectionGroundingModal.proposals}
        onApplyProposals={handleApplySectionProposals}
      />
    </div>
  );
};
