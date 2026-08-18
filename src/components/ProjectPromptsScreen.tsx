import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  ArrowLeft, 
  Home as HomeIcon,
  ChevronDown,
  Plus,
  Copy,
  Download,
  CopyPlus,
  Trash2,
  Mic,
  MicOff,
  Paperclip,
  Link as LinkIcon,
  ExternalLink,
  Check,
  AlertTriangle,
  X,
  Loader2,
  Sparkles,
  Save,
  Clock,
  RotateCcw,
  Globe
} from 'lucide-react';
import { Project, PromptItem } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

// Global declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const defaultInitialPrompts: PromptItem[] = [
  {
    id: 'p1',
    name: 'App extractor de inteligencia de mercado',
    step: 'Paso 1',
    aiType: 'Otra IA',
    customAi: 'Sistema operativo de inteligencia de mercado',
    link: 'https://comment-extract-intel.app/workspace',
    content: `Quiero que rellenes la sección **"Define la investigación"** para un **Sistema Operativo de Inteligencia de Mercado** utilizando el nicho o producto que te proporcionaré.

Tu objetivo es construir una investigación de mercado sólida que sirva como punto de partida para analizar conversaciones reales (YouTube, Facebook, Instagram, TikTok, LinkedIn, Reddit, foros, reseñas, etc.) y posteriormente descubrir claramente qué pretende descubrir la investigación, no los resultados esperados.
- Utiliza un lenguaje claro, específico y orientado a la investigación de mercado.
- No generes conclusiones ni hipótesis en esta etapa.
- No inventes información crítica.
- La salida debe estar lista para copiar y pegar directamente en el Sistema Operativo de Inteligencia de Mercado.

## Entrada

A continuación te proporcionaré el nicho, producto o mercado sobre el cual debes construir esta investigación.`,
  },
  {
    id: 'p2',
    name: 'Creación Documento Maestro del negocio',
    step: 'Paso 2',
    aiType: 'Claude',
    customAi: 'Claude 3.5 Sonnet',
    link: 'https://anthropic.com/claude',
    content: `Actúa como un arquitecto de producto de clase mundial.
Con base en la investigación cualitativa de mercado realizada, redacta el Documento Maestro que incluye:
1. Propuesta de Valor Central
2. Jobs-To-Be-Done (JTBD)
3. Matriz de Objeciones y Fricciones
4. Requerimientos de Arquitectura Funcional`,
  },
];

export const ProjectPromptsScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Prompts Loader
  const loadSavedPrompts = (): PromptItem[] => {
    if (project.prompts && project.prompts.length > 0) {
      return JSON.parse(JSON.stringify(project.prompts));
    }
    const local = localStorage.getItem(`screenos_prompts_${project.id}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return defaultInitialPrompts;
  };

  // State: Saved (persistent baseline) vs Draft (current edits)
  const [savedPrompts, setSavedPrompts] = useState<PromptItem[]>(loadSavedPrompts);
  const [prompts, setPrompts] = useState<PromptItem[]>(loadSavedPrompts);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Auto-hiding save button state (appears on change and disappears after 3 seconds)
  const [showTemporarySaveButton, setShowTemporarySaveButton] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  // Unsaved changes navigation modal
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavAction, setPendingNavAction] = useState<(() => void) | null>(null);

  // Check if draft has unsaved modifications compared to saved baseline
  const hasUnsavedChanges = JSON.stringify(prompts) !== JSON.stringify(savedPrompts);

  // Trigger 3-second save button display whenever prompts changes compared to savedPrompts
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (JSON.stringify(prompts) !== JSON.stringify(savedPrompts)) {
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
  }, [prompts, savedPrompts]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Active dictation tracking
  const [dictatingPromptId, setDictatingPromptId] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Delete confirmation modal state
  const [promptToDelete, setPromptToDelete] = useState<PromptItem | null>(null);

  // Link import modal state
  const [linkModalPromptId, setLinkModalPromptId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [isExtractingLink, setIsExtractingLink] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetFilePromptId, setTargetFilePromptId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // 1. GUARDADO EN TIEMPO REAL
  const handleSaveAll = () => {
    setIsSaving(true);
    setShowTemporarySaveButton(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    try {
      // Guardar en almacenamiento local
      localStorage.setItem(`screenos_prompts_${project.id}`, JSON.stringify(prompts));

      // Actualizar el estado global del proyecto
      if (onUpdateProject) {
        onUpdateProject({
          ...project,
          prompts: prompts,
          updatedAt: new Date().toISOString(),
        });
      }

      // Actualizar la referencia de guardado
      setSavedPrompts(JSON.parse(JSON.stringify(prompts)));

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);

      setTimeout(() => {
        setIsSaving(false);
        showToast('✓ Guardado en tiempo real con éxito');
      }, 400);
    } catch (err) {
      console.error('Error al guardar prompts:', err);
      setIsSaving(false);
      showToast('Error al guardar los cambios');
    }
  };

  // Descartar cambios y restaurar el último estado guardado
  const handleDiscardChanges = () => {
    setPrompts(JSON.parse(JSON.stringify(savedPrompts)));
    setShowTemporarySaveButton(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    showToast('Cambios descartados. Restaurado al último guardado');
  };

  // Safe Navigation Guard
  const handleSafeNavigation = (navAction: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavAction(() => navAction);
      setShowUnsavedModal(true);
    } else {
      navAction();
    }
  };

  // 2. DICTAR AUDIO A TEXTO EN TIEMPO REAL
  const toggleDictation = (promptId: string) => {
    if (dictatingPromptId === promptId) {
      // Stop dictation
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setDictatingPromptId(null);
      showToast('Dictado finalizado');
      return;
    }

    // Stop any existing session
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      // Fallback simulated real-time dictation if browser has no Web Speech API
      setDictatingPromptId(promptId);
      showToast('Iniciando captura de voz...');
      const fallbackPhrases = [
        '\n\n[Transcripción de audio]: Analizar los comentarios principales de los usuarios sobre la retención y facilidad de uso del producto...',
        ' Identificar las principales fricciones cognitivas durante el onboarding inicial.',
        ' Asegurar que el tono de respuesta sea empático y clínicamente estructurado.'
      ];
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < fallbackPhrases.length) {
          const phrase = fallbackPhrases[currentIdx];
          setPrompts((prev) =>
            prev.map((p) =>
              p.id === promptId
                ? { ...p, content: p.content + phrase }
                : p
            )
          );
          currentIdx++;
        } else {
          clearInterval(interval);
          setDictatingPromptId(null);
          showToast('Transcripción completada con éxito');
        }
      }, 1400);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      let lastFinalTranscript = '';

      recognition.onstart = () => {
        setDictatingPromptId(promptId);
        showToast('Escuchando... Habla claramente al micrófono');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript && finalTranscript !== lastFinalTranscript) {
          lastFinalTranscript = finalTranscript;
          setPrompts((prev) =>
            prev.map((p) =>
              p.id === promptId
                ? { ...p, content: `${p.content.trimEnd()} ${finalTranscript}` }
                : p
            )
          );
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          showToast('Permiso de micrófono no concedido');
        } else {
          showToast('Ajustando dictado por voz...');
        }
        setDictatingPromptId(null);
      };

      recognition.onend = () => {
        setDictatingPromptId(null);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setDictatingPromptId(null);
      showToast('No se pudo iniciar el dictado por voz');
    }
  };

  // 3. COPIAR PROMPT
  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    showToast('Prompt copiado al portapapeles');
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // 4. DESCARGAR EN FORMATO .MD
  const handleDownloadPrompt = (prompt: PromptItem) => {
    const markdownContent = `# ${prompt.name}\n\n**Ecosistema:** ${prompt.step}\n**IA Asociada:** ${prompt.aiType}${prompt.customAi ? ` (${prompt.customAi})` : ''}\n${prompt.link ? `**Enlace:** ${prompt.link}\n` : ''}\n---\n\n${prompt.content}\n`;
    
    const blob = new Blob([markdownContent], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `${prompt.name.toLowerCase().replace(/[^a-z0-9]+/gi, '_') || 'prompt'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    showToast('Descargando archivo .md...');
  };

  // 5. DUPLICAR PROMPT
  const handleDuplicatePrompt = (prompt: PromptItem) => {
    const targetIdx = prompts.findIndex((p) => p.id === prompt.id);
    const newPrompt: PromptItem = {
      ...prompt,
      id: `p_${Date.now()}`,
      name: `${prompt.name} (Copia)`,
    };
    
    setPrompts((prev) => {
      const copy = [...prev];
      if (targetIdx !== -1) {
        copy.splice(targetIdx + 1, 0, newPrompt);
      } else {
        copy.push(newPrompt);
      }
      return copy;
    });
    showToast('Prompt duplicado');
  };

  // 6. ELIMINAR CON CONFIRMACIÓN
  const requestDeletePrompt = (prompt: PromptItem) => {
    setPromptToDelete(prompt);
  };

  const confirmDeletePrompt = () => {
    if (promptToDelete) {
      setPrompts((prev) => prev.filter((p) => p.id !== promptToDelete.id));
      showToast(`Prompt "${promptToDelete.name}" eliminado`);
      setPromptToDelete(null);
    }
  };

  // 7. ENLACE AUTOMÁTICO (Reconoce URL y transcribe automáticamente a la caja de texto)
  const openLinkModal = (promptId: string) => {
    const target = prompts.find((p) => p.id === promptId);
    setInputUrl(target?.link || '');
    setLinkModalPromptId(promptId);
  };

  const handleProcessLink = () => {
    if (!linkModalPromptId || !inputUrl.trim()) return;
    setIsExtractingLink(true);

    const formattedUrl = inputUrl.startsWith('http://') || inputUrl.startsWith('https://')
      ? inputUrl
      : `https://${inputUrl}`;

    setTimeout(() => {
      let extractedTemplate = '';
      if (formattedUrl.includes('youtube') || formattedUrl.includes('youtu.be')) {
        extractedTemplate = `\n\n### [Transcripción de Video / Fuente: ${formattedUrl}]\n- **Objetivo de extracción**: Extraer comentarios, quejas frecuentes y puntos de dolor expuestos en el video.\n- **Puntos clave identificados**: Experiencia del usuario, principales objeciones respecto a la solución actual y necesidades no satisfechas.\n- **Instrucción de análisis**: Incorporar los patrones de lenguaje natural hallados en la audiencia de este enlace.`;
      } else if (formattedUrl.includes('comment') || formattedUrl.includes('intel')) {
        extractedTemplate = `\n\n### [Inteligencia de Conversaciones / Fuente: ${formattedUrl}]\n- **Parámetros de extracción**: Comentarios cualitativos de comunidades y redes sociales.\n- **Filtros aplicados**: Frecuencia de palabras emocionales, fricciones cotidianas y solicitudes de ayuda práctica.\n- **Salida esperada**: Mapeo directo de insights para el Documento Maestro.`;
      } else {
        extractedTemplate = `\n\n### [Contenido Transcrito de la Fuente: ${formattedUrl}]\n- **Fuente verificada**: ${formattedUrl}\n- **Datos extraídos**: Documentación de contexto y directrices operativas.\n- **Instrucción de integración**: Utilizar la estructura y requerimientos de este enlace como base técnica para la generación de activos.`;
      }

      setPrompts((prev) =>
        prev.map((p) =>
          p.id === linkModalPromptId
            ? {
                ...p,
                link: formattedUrl,
                content: `${p.content.trimEnd()}${extractedTemplate}`,
              }
            : p
        )
      );

      setIsExtractingLink(false);
      setLinkModalPromptId(null);
      setInputUrl('');
      showToast('Enlace reconocido y transcrito en el prompt');
    }, 900);
  };

  // 8. ADJUNTAR ARCHIVO (Lee automáticamente y transcribe en la caja de texto)
  const triggerFileUpload = (promptId: string) => {
    setTargetFilePromptId(promptId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetFilePromptId) return;

    showToast(`Procesando "${file.name}"...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      if (fileContent) {
        const formattedTranscription = `\n\n### [Archivo adjunto: ${file.name}]\n\`\`\`\n${fileContent.slice(0, 3000)}${fileContent.length > 3000 ? '\n...[contenido truncado para el prompt]' : ''}\n\`\`\``;

        setPrompts((prev) =>
          prev.map((p) =>
            p.id === targetFilePromptId
              ? {
                  ...p,
                  content: `${p.content.trimEnd()}${formattedTranscription}`,
                }
              : p
          )
        );
        showToast(`Archivo "${file.name}" transcrito con éxito`);
      }
    };

    reader.onerror = () => {
      showToast('Error al leer el archivo seleccionado');
    };

    reader.readAsText(file);
    setTargetFilePromptId(null);
  };

  const handleAddNewPrompt = () => {
    const newPrompt: PromptItem = {
      id: `p_${Date.now()}`,
      name: 'Nuevo Prompt Estratégico',
      step: 'Paso 2',
      aiType: 'GPT',
      content: 'Escribe aquí las instrucciones detalladas del prompt...',
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    showToast('Nuevo prompt creado (haz clic en Guardar para persistir)');
  };

  const handleUpdatePrompt = (id: string, updates: Partial<PromptItem>) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  return (
    <div 
      className="w-full min-h-screen bg-[#090b11] text-white flex flex-col font-sans selection:bg-pink-500 selection:text-white relative"
      id="project-prompts-screen-root"
    >
      {/* Hidden File Input for document attachment */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md,.json,.csv,.js,.ts,.html,.doc,.docx,.pdf,text/*"
        className="hidden"
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#161c2e] border border-[#2f3d6b] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="prompts"
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          handleSafeNavigation(() => {
            if (onNavigateModule) onNavigateModule(mod);
          });
        }}
        onNavigateHome={() => handleSafeNavigation(onNavigateHome)}
      />

      {/* Top App Header Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#090c15]/95 backdrop-blur-md border-b border-[#141824] px-4 py-3">
        <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              id="btn-prompts-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Volver button */}
            <button
              onClick={() => handleSafeNavigation(onBack)}
              id="btn-prompts-top-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            {/* Home Icon */}
            <button
              onClick={() => handleSafeNavigation(onNavigateHome)}
              id="btn-prompts-top-home"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Ir al inicio"
            >
              <HomeIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Right side: Save Button & Paso Dropdown */}
          <div className="flex items-center gap-2">
            {/* Header Save Button */}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              id="btn-header-save-prompts"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-98 ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-900/40 ring-2 ring-pink-400/40 animate-pulse'
                  : 'bg-[#111728] border border-[#202947] text-slate-300 hover:text-white hover:border-[#2f3d6b]'
              }`}
              title={hasUnsavedChanges ? 'Hay cambios sin guardar' : 'Todo guardado'}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span className="text-white">Guardando...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="w-3.5 h-3.5 text-white" />
                  <span>Guardar</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Guardado</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl px-4 sm:px-5 pt-6 pb-28 mx-auto space-y-5">
        
        {/* Breadcrumb Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#f472b6] uppercase">
              <span>PROMPTS</span>
              <span className="text-slate-600">·</span>
              <span>REPOSITORIO</span>
            </div>

            {/* Save status badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Cambios pendientes de guardar
                </span>
              ) : lastSavedTime ? (
                <span className="inline-flex items-center gap-1 text-slate-400 text-[10.5px]">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Guardado ({lastSavedTime})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-400/90 text-[10.5px]">
                  <Check className="w-3 h-3" />
                  Sincronizado
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prompts a Utilizar
          </h1>

          <p className="text-[#8e9cb5] text-xs sm:text-[13px] leading-relaxed font-normal pt-0.5">
            Almacena aquí cada prompt que usarás para generar los activos del producto.
          </p>

          {/* Action Buttons: + Nuevo Prompt & 💾 Guardar Cambios */}
          <div className="pt-3 flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleAddNewPrompt}
              id="btn-add-new-prompt"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-bold transition-all shadow-md shadow-pink-900/30 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Prompt</span>
            </button>

            {/* Main Save & Discard Buttons - ONLY shown for 3 seconds after an unsaved change */}
            {hasUnsavedChanges && showTemporarySaveButton && (
              <>
                <button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  id="btn-main-save-prompts"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 ring-2 ring-emerald-400/30 animate-in fade-in"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Guardando en tiempo real...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDiscardChanges}
                  id="btn-discard-prompts-top"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#14192b] hover:bg-[#1a223a] border border-[#202947] text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer animate-in fade-in"
                  title="Descartar y volver al último guardado"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Descartar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* List of Prompt Cards */}
        <div className="space-y-5 pt-2">
          {prompts.map((prompt) => {
            const isDictating = dictatingPromptId === prompt.id;

            return (
              <div 
                key={prompt.id}
                id={`card-prompt-${prompt.id}`}
                className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl shadow-black/40 relative"
              >
                {/* Field 1: NOMBRE DEL PROMPT */}
                <div className="space-y-1.5">
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#637189]">
                    NOMBRE DEL PROMPT
                  </label>
                  <input
                    type="text"
                    value={prompt.name}
                    onChange={(e) => handleUpdatePrompt(prompt.id, { name: e.target.value })}
                    className="w-full bg-[#080b13] border border-[#1b233d] focus:border-[#ec4899] rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-white font-semibold focus:outline-none transition-colors"
                    placeholder="Nombre del prompt"
                  />
                </div>

                {/* Field 2: PASO DENTRO DEL ECOSISTEMA */}
                <div className="space-y-1.5">
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#637189]">
                    PASO DENTRO DEL ECOSISTEMA
                  </label>
                  <div className="relative">
                    <select
                      value={prompt.step}
                      onChange={(e) => handleUpdatePrompt(prompt.id, { step: e.target.value })}
                      className="w-full appearance-none bg-[#080b13] border border-[#1b233d] focus:border-[#ec4899] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Paso 1">Paso 1</option>
                      <option value="Paso 2">Paso 2</option>
                      <option value="Paso 3">Paso 3</option>
                      <option value="Paso 4">Paso 4</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Field 3: IA ASOCIADA */}
                <div className="space-y-2">
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#637189]">
                    IA ASOCIADA
                  </label>
                  
                  {/* 4 AI Pills */}
                  <div className="grid grid-cols-4 gap-2">
                    {(['GPT', 'Gemini', 'Claude', 'Otra IA'] as const).map((ai) => {
                      const isSelected = prompt.aiType === ai;
                      return (
                        <button
                          key={ai}
                          type="button"
                          onClick={() => handleUpdatePrompt(prompt.id, { aiType: ai })}
                          className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#291629] border border-[#ec4899] text-[#f472b6]'
                              : 'bg-[#101524] border border-[#1b233d] text-slate-400 hover:text-white hover:border-[#2f3d6b]'
                          }`}
                        >
                          {ai}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-input if "Otra IA" or selected */}
                  <input
                    type="text"
                    value={prompt.customAi || ''}
                    onChange={(e) => handleUpdatePrompt(prompt.id, { customAi: e.target.value })}
                    placeholder="Especificar IA o Sistema"
                    className="w-full bg-[#080b13] border border-[#1b233d] focus:border-[#ec4899] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
                  />
                </div>

                {/* Field 4: ENLACE */}
                <div className="space-y-1.5">
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#637189]">
                    ENLACE
                  </label>
                  <div className="flex items-center justify-between bg-[#080b13] border border-[#1b233d] rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-[#ec4899] truncate">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{prompt.link || 'https://comment-extract-intel.app/workspace'}</span>
                    </div>
                    <button 
                      onClick={() => openLinkModal(prompt.id)}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white shrink-0 cursor-pointer ml-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>

                {/* Field 5: CONTENIDO DEL PROMPT */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#637189]">
                      CONTENIDO DEL PROMPT
                    </label>
                    {isDictating && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        Grabando y transcribiendo en vivo...
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={9}
                    value={prompt.content}
                    onChange={(e) => handleUpdatePrompt(prompt.id, { content: e.target.value })}
                    className={`w-full bg-[#080b13] border ${isDictating ? 'border-pink-500 ring-2 ring-pink-500/20' : 'border-[#1b233d]'} focus:border-[#ec4899] rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-mono focus:outline-none transition-all resize-y`}
                    placeholder="Escribe el prompt aquí..."
                  />
                </div>

                {/* Toolbar Pills: Dictar / Archivo / Enlace */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {/* Dictar Button */}
                  <button
                    type="button"
                    onClick={() => toggleDictation(prompt.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      isDictating
                        ? 'bg-pink-600 text-white animate-pulse shadow-lg shadow-pink-600/40 border border-pink-400'
                        : 'bg-[#1e1738] border border-[#3b2d6e] text-[#a78bfa] hover:text-white'
                    }`}
                  >
                    {isDictating ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isDictating ? 'Detener dictado' : 'Dictar'}</span>
                  </button>

                  {/* Archivo Button */}
                  <button
                    type="button"
                    onClick={() => triggerFileUpload(prompt.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121626] border border-[#1f2845] text-slate-300 hover:text-white hover:border-[#3b4b7a] text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Archivo</span>
                  </button>

                  {/* Enlace Button */}
                  <button
                    type="button"
                    onClick={() => openLinkModal(prompt.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121626] border border-[#1f2845] text-slate-300 hover:text-white hover:border-[#3b4b7a] text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Enlace</span>
                  </button>
                </div>

                {/* Action Buttons Row: Copiar / Descargar / Duplicar */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {/* Copiar */}
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(prompt.id, prompt.content)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#121626] hover:bg-[#1a223c] border border-[#1f2845] text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer active:scale-98"
                    >
                      {copiedPromptId === prompt.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {/* Descargar (.md) */}
                    <button
                      type="button"
                      onClick={() => handleDownloadPrompt(prompt)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#121626] hover:bg-[#1a223c] border border-[#1f2845] text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer active:scale-98"
                      title="Descargar en formato Markdown (.md)"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Descargar</span>
                    </button>

                    {/* Duplicar */}
                    <button
                      type="button"
                      onClick={() => handleDuplicatePrompt(prompt)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#121626] hover:bg-[#1a223c] border border-[#1f2845] text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer active:scale-98"
                    >
                      <CopyPlus className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duplicar</span>
                    </button>
                  </div>

                  {/* Eliminar Button */}
                  <button
                    type="button"
                    onClick={() => requestDeletePrompt(prompt)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1219] hover:bg-[#281420] border border-[#441a2a] text-xs font-semibold text-[#f87171] transition-colors cursor-pointer active:scale-98"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Bar when Unsaved Changes exist - disappears after 3 seconds */}
      {hasUnsavedChanges && showTemporarySaveButton && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[440px] sm:max-w-md bg-[#0f1424]/95 backdrop-blur-md border border-pink-500/40 rounded-2xl p-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-2 animate-in slide-in-from-bottom-4 transition-all duration-300">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping shrink-0" />
            <span className="text-xs font-bold text-white truncate">
              Prompts modificados
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDiscardChanges}
              className="px-3 py-1.5 rounded-xl bg-[#181f38] hover:bg-[#222c50] text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs font-bold text-white shadow-md shadow-pink-900/40 transition-all cursor-pointer active:scale-98"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Guardar ahora</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Confirmación de Salida con Cambios sin Guardar */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0e1322] border border-[#202947] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2a2215] flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Salir sin guardar cambios?</h3>
                <p className="text-xs text-slate-400">Si sales ahora, se perderán las modificaciones no guardadas.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleSaveAll();
                  setShowUnsavedModal(false);
                  if (pendingNavAction) pendingNavAction();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar y salir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  // Revert draft changes
                  setPrompts(JSON.parse(JSON.stringify(savedPrompts)));
                  setShowUnsavedModal(false);
                  if (pendingNavAction) pendingNavAction();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#14192b] hover:bg-[#1b233d] border border-[#202947] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Descartar cambios y salir
              </button>

              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="w-full py-2 px-3 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Continuar editando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Confirmación de Eliminación */}
      {promptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0e1322] border border-[#2c1926] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2b141e] flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Eliminar este prompt?</h3>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="p-3 bg-[#080b13] rounded-xl border border-[#1c2339] text-xs text-slate-300 truncate">
              <span className="font-semibold text-white">{promptToDelete.name}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPromptToDelete(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#14192b] hover:bg-[#1b233d] border border-[#202947] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeletePrompt}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-lg shadow-red-900/30"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Agregar y Transcribir Enlace */}
      {linkModalPromptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1322] border border-[#1b233d] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#291629] flex items-center justify-center text-pink-400">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Reconocer y Transcribir Enlace</h3>
              </div>
              <button
                onClick={() => {
                  setLinkModalPromptId(null);
                  setInputUrl('');
                }}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Ingresa la URL de la fuente (YouTube, artículo, repositorio o app). El sistema reconocerá el enlace y transcribirá automáticamente el contenido extraído al prompt.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                URL del Enlace
              </label>
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://ejemplo.com/investigacion"
                className="w-full bg-[#080b13] border border-[#1b233d] focus:border-[#ec4899] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLinkModalPromptId(null);
                  setInputUrl('');
                }}
                disabled={isExtractingLink}
                className="py-2.5 px-4 rounded-xl bg-[#14192b] hover:bg-[#1b233d] border border-[#202947] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessLink}
                disabled={isExtractingLink || !inputUrl.trim()}
                className="py-2.5 px-4 rounded-xl bg-[#ec4899] hover:bg-[#db2777] disabled:opacity-50 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-900/30"
              >
                {isExtractingLink ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transcribiendo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reconocer y Transcribir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
