import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  ArrowLeft,
  Home as HomeIcon,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Plus,
  Monitor,
  Layers,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Edit3,
  Mic,
  X,
  Play,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderPlus,
  GitBranch,
  Tag,
  Eye,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Project, ProjectScreensData, ScreenNode, FlowItem, ScreenNavigationAction } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { initialScreensFlowsData } from '../data/screensFlowsData';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectScreensFlowsScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Active View Tab: 'flows' | 'catalog' | 'flowchart' | 'simulator'
  const [activeTab, setActiveTab] = useState<'flows' | 'catalog' | 'flowchart' | 'simulator'>('flows');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFlow, setFilterFlow] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Collapsed state for flow sections
  const [collapsedFlows, setCollapsedFlows] = useState<Record<string, boolean>>({});

  // Screens and Flows State
  const [screensData, setScreensData] = useState<ProjectScreensData>(() => {
    if (project.screensData && project.screensData.flows && project.screensData.screens) {
      return project.screensData;
    }
    return initialScreensFlowsData;
  });

  // Modal States
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<ScreenNode | null>(null);
  const [editingFlow, setEditingFlow] = useState<FlowItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ type: 'screen' | 'flow'; id: string; name: string } | null>(null);

  // Voice recording state
  const [activeRecordingField, setActiveRecordingField] = useState<string | null>(null);

  // Interactive Simulator State
  const [simulatorScreenId, setSimulatorScreenId] = useState<string>('');
  const [simulatorHistory, setSimulatorHistory] = useState<string[]>([]);

  // Temporary Screen Form State
  const [screenForm, setScreenForm] = useState<Partial<ScreenNode>>({
    name: '',
    flowId: 'flow-principal',
    type: 'Dashboard',
    status: 'Pendiente',
    route: '',
    purpose: '',
    keyElements: [],
    navigationActions: [],
    dataConsumed: [],
    dataProduced: [],
    notes: '',
  });
  const [tempElementInput, setTempElementInput] = useState('');
  const [tempNavTrigger, setTempNavTrigger] = useState('');
  const [tempNavTarget, setTempNavTarget] = useState('');
  const [tempNavCondition, setTempNavCondition] = useState('');

  // Temporary Flow Form State
  const [flowForm, setFlowForm] = useState<Partial<FlowItem>>({
    name: '',
    description: '',
    color: '#34d399',
    screenIds: [],
  });

  // Auto-save logic
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      if (onUpdateProject) {
        onUpdateProject({
          ...project,
          screensData,
        });
      }
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [screensData]);

  // Set default simulator screen
  useEffect(() => {
    if (screensData.screens.length > 0 && !simulatorScreenId) {
      setSimulatorScreenId(screensData.screens[0].id);
      setSimulatorHistory([screensData.screens[0].id]);
    }
  }, [screensData.screens, simulatorScreenId]);

  // KPI Calculations
  const totalScreens = screensData.screens.length;
  const finishedScreens = screensData.screens.filter((s) => s.status === 'Terminada').length;
  const inDevScreens = screensData.screens.filter((s) => s.status === 'En desarrollo').length;
  const pendingScreens = screensData.screens.filter((s) => s.status === 'Pendiente').length;
  const totalFlows = screensData.flows.length;

  const toggleFlowCollapse = (flowId: string) => {
    setCollapsedFlows((prev) => ({
      ...prev,
      [flowId]: !prev[flowId],
    }));
  };

  // Voice recognition handler
  const handleDictate = (fieldKey: string, currentVal: string, onUpdate: (val: string) => void) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Por favor usa Google Chrome o Microsoft Edge.');
      return;
    }

    if (activeRecordingField === fieldKey) {
      setActiveRecordingField(null);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      setActiveRecordingField(fieldKey);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const newVal = currentVal ? `${currentVal} ${transcript}` : transcript;
        onUpdate(newVal);
        setActiveRecordingField(null);
      };

      recognition.onerror = () => {
        setActiveRecordingField(null);
      };

      recognition.onend = () => {
        setActiveRecordingField(null);
      };

      recognition.start();
    } catch {
      setActiveRecordingField(null);
    }
  };

  // Open Create Screen Modal
  const handleOpenCreateScreen = (flowId?: string) => {
    setEditingScreen(null);
    setScreenForm({
      name: '',
      flowId: flowId || screensData.flows[0]?.id || 'flow-principal',
      type: 'Dashboard',
      status: 'Pendiente',
      route: '',
      purpose: '',
      keyElements: [],
      navigationActions: [],
      dataConsumed: [],
      dataProduced: [],
      notes: '',
    });
    setTempElementInput('');
    setTempNavTrigger('');
    setTempNavTarget('');
    setTempNavCondition('');
    setIsScreenModalOpen(true);
  };

  // Open Edit Screen Modal
  const handleOpenEditScreen = (screen: ScreenNode) => {
    setEditingScreen(screen);
    setScreenForm({ ...screen });
    setTempElementInput('');
    setTempNavTrigger('');
    setTempNavTarget('');
    setTempNavCondition('');
    setIsScreenModalOpen(true);
  };

  // Save Screen
  const handleSaveScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenForm.name?.trim()) return;

    if (editingScreen) {
      // Update existing
      const updatedScreen: ScreenNode = {
        ...editingScreen,
        ...screenForm,
        name: screenForm.name.trim(),
        flowId: screenForm.flowId || 'flow-principal',
        type: screenForm.type || 'Dashboard',
        status: screenForm.status || 'Pendiente',
        route: screenForm.route || `/${screenForm.name.toLowerCase().replace(/\s+/g, '-')}`,
        purpose: screenForm.purpose || '',
        keyElements: screenForm.keyElements || [],
        navigationActions: screenForm.navigationActions || [],
        dataConsumed: screenForm.dataConsumed || [],
        dataProduced: screenForm.dataProduced || [],
        notes: screenForm.notes || '',
      };

      setScreensData((prev) => {
        const screens = prev.screens.map((s) => (s.id === editingScreen.id ? updatedScreen : s));
        // Update flow screenIds
        const flows = prev.flows.map((f) => {
          const hasInOld = f.screenIds.includes(editingScreen.id);
          const isTargetFlow = f.id === updatedScreen.flowId;
          if (isTargetFlow && !hasInOld) {
            return { ...f, screenIds: [...f.screenIds, editingScreen.id] };
          }
          if (!isTargetFlow && hasInOld) {
            return { ...f, screenIds: f.screenIds.filter((id) => id !== editingScreen.id) };
          }
          return f;
        });
        return { ...prev, screens, flows };
      });
    } else {
      // Create new
      const newId = `scr-${Date.now()}`;
      const newScreen: ScreenNode = {
        id: newId,
        name: screenForm.name.trim(),
        flowId: screenForm.flowId || screensData.flows[0]?.id || 'flow-principal',
        type: screenForm.type || 'Dashboard',
        status: screenForm.status || 'Pendiente',
        route: screenForm.route || `/${screenForm.name.toLowerCase().replace(/\s+/g, '-')}`,
        purpose: screenForm.purpose || '',
        keyElements: screenForm.keyElements || [],
        navigationActions: screenForm.navigationActions || [],
        dataConsumed: screenForm.dataConsumed || [],
        dataProduced: screenForm.dataProduced || [],
        notes: screenForm.notes || '',
      };

      setScreensData((prev) => {
        const screens = [...prev.screens, newScreen];
        const flows = prev.flows.map((f) => {
          if (f.id === newScreen.flowId) {
            return { ...f, screenIds: [...f.screenIds, newId] };
          }
          return f;
        });
        return { ...prev, screens, flows };
      });
    }

    setIsScreenModalOpen(false);
  };

  // Delete Screen
  const handleDeleteScreen = (screenId: string) => {
    setScreensData((prev) => ({
      ...prev,
      screens: prev.screens.filter((s) => s.id !== screenId),
      flows: prev.flows.map((f) => ({
        ...f,
        screenIds: f.screenIds.filter((id) => id !== screenId),
      })),
    }));
    setDeleteConfirmId(null);
  };

  // Open Create Flow Modal
  const handleOpenCreateFlow = () => {
    setEditingFlow(null);
    setFlowForm({
      name: '',
      description: '',
      color: '#34d399',
      screenIds: [],
    });
    setIsFlowModalOpen(true);
  };

  // Open Edit Flow Modal
  const handleOpenEditFlow = (flow: FlowItem) => {
    setEditingFlow(flow);
    setFlowForm({ ...flow });
    setIsFlowModalOpen(true);
  };

  // Save Flow
  const handleSaveFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowForm.name?.trim()) return;

    if (editingFlow) {
      const updatedFlow: FlowItem = {
        ...editingFlow,
        ...flowForm,
        name: flowForm.name.trim(),
        description: flowForm.description || '',
        color: flowForm.color || '#34d399',
      };
      setScreensData((prev) => ({
        ...prev,
        flows: prev.flows.map((f) => (f.id === editingFlow.id ? updatedFlow : f)),
      }));
    } else {
      const newFlow: FlowItem = {
        id: `flow-${Date.now()}`,
        name: flowForm.name.trim(),
        description: flowForm.description || '',
        color: flowForm.color || '#38bdf8',
        screenIds: [],
      };
      setScreensData((prev) => ({
        ...prev,
        flows: [...prev.flows, newFlow],
      }));
    }
    setIsFlowModalOpen(false);
  };

  // Delete Flow
  const handleDeleteFlow = (flowId: string) => {
    setScreensData((prev) => {
      // Reassign or keep screens
      return {
        ...prev,
        flows: prev.flows.filter((f) => f.id !== flowId),
        screens: prev.screens.map((s) => (s.flowId === flowId ? { ...s, flowId: 'unassigned' } : s)),
      };
    });
    setDeleteConfirmId(null);
  };

  // Copy All Markdown Summary
  const handleCopyAll = () => {
    let text = `# PANTALLAS Y FLUJOS: ${project.name}\n\n`;
    text += `## RESUMEN EJECUTIVO\n`;
    text += `- Total Pantallas: ${totalScreens}\n`;
    text += `- Terminadas: ${finishedScreens}\n`;
    text += `- En desarrollo: ${inDevScreens}\n`;
    text += `- Pendientes: ${pendingScreens}\n`;
    text += `- Total Flujos: ${totalFlows}\n\n`;

    screensData.flows.forEach((flow, idx) => {
      text += `### Flujo ${idx + 1}: ${flow.name}\n`;
      text += `*Descripción:* ${flow.description}\n\n`;

      const flowScreens = screensData.screens.filter((s) => s.flowId === flow.id);
      if (flowScreens.length === 0) {
        text += `_Sin pantallas asignadas aún._\n\n`;
      } else {
        flowScreens.forEach((scr, sIdx) => {
          text += `#### ${sIdx + 1}. [${scr.status.toUpperCase()}] ${scr.name} (${scr.type})\n`;
          text += `- **Ruta:** \`${scr.route}\`\n`;
          text += `- **Objetivo:** ${scr.purpose}\n`;
          if (scr.keyElements && scr.keyElements.length > 0) {
            text += `- **Elementos Clave:**\n`;
            scr.keyElements.forEach((el) => (text += `  - ${el}\n`));
          }
          if (scr.navigationActions && scr.navigationActions.length > 0) {
            text += `- **Navegación / Disparadores:**\n`;
            scr.navigationActions.forEach((act) => {
              const target = screensData.screens.find((s) => s.id === act.targetScreenId)?.name || act.targetScreenId;
              text += `  - [Evento]: ${act.trigger} ➔ **${target}** ${act.condition ? `(Si: ${act.condition})` : ''}\n`;
            });
          }
          if (scr.notes) {
            text += `- **Notas:** ${scr.notes}\n`;
          }
          text += `\n`;
        });
      }
    });

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Filtered Screens for Catalog
  const filteredScreens = screensData.screens.filter((screen) => {
    const matchesSearch =
      screen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screen.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screen.route.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFlow = filterFlow === 'all' || screen.flowId === filterFlow;
    const matchesStatus = filterStatus === 'all' || screen.status === filterStatus;
    const matchesType = filterType === 'all' || screen.type === filterType;
    return matchesSearch && matchesFlow && matchesStatus && matchesType;
  });

  // Simulator navigation helper
  const currentSimulatorScreen = screensData.screens.find((s) => s.id === simulatorScreenId) || screensData.screens[0];
  const handleSimulatorNavigate = (targetId: string) => {
    setSimulatorScreenId(targetId);
    setSimulatorHistory((prev) => [...prev, targetId]);
  };
  const handleSimulatorBack = () => {
    if (simulatorHistory.length > 1) {
      const newHistory = [...simulatorHistory];
      newHistory.pop();
      const prevId = newHistory[newHistory.length - 1];
      setSimulatorHistory(newHistory);
      setSimulatorScreenId(prevId);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200"
      id="screens-flows-screen-root"
    >
      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="pantallas"
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          if (onNavigateModule) onNavigateModule(mod);
        }}
        onNavigateHome={onNavigateHome}
      />

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-[#182035] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-screens-hamburger"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#151c30] transition-colors focus:outline-none"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            id="btn-screens-back"
            onClick={onBack}
            className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Volver</span>
          </button>
          <button
            id="btn-screens-home"
            onClick={onNavigateHome}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#151c30] transition-colors cursor-pointer"
            title="Ir al inicio"
          >
            <HomeIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24">
        {/* Title Header */}
        <div className="space-y-1.5" id="screens-header-section">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#34d399] uppercase">
            <span>SCREENOS</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">PANTALLAS Y FLUJOS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Pantallas y Flujos</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#132d24] text-[#34d399] border border-[#1f5e4b]">
              {totalScreens} Pantallas • {totalFlows} Flujos
            </span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Journeys, arquitectura de navegación, flujos de usuario, diseño y estados de pantalla de{' '}
            <strong className="text-slate-200">{project.name}</strong>.
          </p>
        </div>

        {/* Action Buttons & Save Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-copy-all-screens"
              onClick={handleCopyAll}
              className="flex items-center space-x-2 px-3.5 py-2 bg-[#12182a] hover:bg-[#1b233d] border border-[#242f50] rounded-xl text-xs font-semibold text-slate-200 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copiar todo</span>
                </>
              )}
            </button>

            <button
              id="btn-add-screen-header"
              onClick={() => handleOpenCreateScreen()}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Pantalla</span>
            </button>

            <button
              id="btn-add-flow-header"
              onClick={handleOpenCreateFlow}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#17203b] hover:bg-[#202c52] border border-[#2d3d6e] text-[#a5b4fc] hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Nuevo Flujo</span>
            </button>
          </div>

          {/* Autoguardado indicator */}
          <div className="text-[11px] font-medium text-slate-500 flex items-center space-x-1.5">
            {saveStatus === 'saving' ? (
              <span className="text-amber-400 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Guardando cambios...
              </span>
            ) : (
              <span className="text-emerald-500/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Autoguardado
              </span>
            )}
          </div>
        </div>

        {/* Summary KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="screens-kpi-grid">
          <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3.5 flex flex-col justify-center">
            <span className="text-2xl font-black text-white leading-none">{totalScreens}</span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">Total Pantallas</span>
          </div>
          <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3.5 flex flex-col justify-center">
            <span className="text-2xl font-black text-[#10b981] leading-none">{finishedScreens}</span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">Terminadas</span>
          </div>
          <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3.5 flex flex-col justify-center">
            <span className="text-2xl font-black text-[#818cf8] leading-none">{inDevScreens}</span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">En desarrollo</span>
          </div>
          <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3.5 flex flex-col justify-center">
            <span className="text-2xl font-black text-[#f59e0b] leading-none">{pendingScreens}</span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">Pendientes</span>
          </div>
        </div>

        {/* Relational Quick Bridge */}
        <div className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#152822] border border-[#225042] flex items-center justify-center text-[#34d399] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#34d399] block">
                PRÓXIMO OBJETIVO EN PANTALLAS
              </span>
              <p className="text-xs font-semibold text-white">
                Definir estados interactivos de la pantalla de "Asistencia Rápida en Crisis".
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateModule && onNavigateModule('arquitectura')}
            className="text-xs font-semibold text-[#818cf8] hover:text-[#a5b4fc] flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Ver Arquitectura</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-b border-[#1b233d] gap-1 pt-1 overflow-x-auto no-scrollbar">
          <button
            id="tab-view-flows"
            onClick={() => setActiveTab('flows')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'flows'
                ? 'border-[#34d399] text-[#34d399] bg-[#122820]/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-[#12182b]/40'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Flujos y Secuencias ({totalFlows})</span>
          </button>

          <button
            id="tab-view-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-[#34d399] text-[#34d399] bg-[#122820]/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-[#12182b]/40'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Catálogo de Pantallas ({totalScreens})</span>
          </button>

          <button
            id="tab-view-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-[#34d399] text-[#34d399] bg-[#122820]/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-[#12182b]/40'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Simulador Interactivo</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: FLUJOS Y SECUENCIAS */}
        {/* ========================================================================= */}
        {activeTab === 'flows' && (
          <div className="space-y-5" id="view-flows-section">
            {screensData.flows.map((flow, flowIdx) => {
              const flowScreens = screensData.screens.filter((s) => s.flowId === flow.id);
              const isCollapsed = collapsedFlows[flow.id];

              return (
                <section
                  key={flow.id}
                  id={`card-flow-${flow.id}`}
                  className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl overflow-hidden shadow-xl"
                >
                  {/* Flow Header */}
                  <div className="p-4 sm:p-5 flex items-center justify-between bg-[#0e1424] border-b border-[#182037]">
                    <div
                      onClick={() => toggleFlowCollapse(flow.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
                        style={{ backgroundColor: flow.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            FLUJO {flowIdx + 1}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#18223c] text-slate-300">
                            {flowScreens.length} pantallas
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white truncate">{flow.name}</h3>
                        {flow.description && (
                          <p className="text-xs text-slate-400 font-normal mt-0.5 line-clamp-1">{flow.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        onClick={() => handleOpenCreateScreen(flow.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141d33] hover:bg-[#1f2c4c] text-slate-200 hover:text-white text-xs font-semibold border border-[#233157] transition-colors cursor-pointer"
                        title="Añadir pantalla a este flujo"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#34d399]" />
                        <span className="hidden sm:inline">Pantalla</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditFlow(flow)}
                        className="p-1.5 rounded-lg bg-[#141d33] hover:bg-[#1f2c4c] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Editar flujo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          setDeleteConfirmId({
                            type: 'flow',
                            id: flow.id,
                            name: flow.name,
                          })
                        }
                        className="p-1.5 rounded-lg bg-[#141d33] hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Eliminar flujo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleFlowCollapse(flow.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Flow Screens List */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 space-y-3.5">
                      {flowScreens.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-[#1f2a48] rounded-xl text-slate-400 space-y-2">
                          <p className="text-xs">Este flujo aún no tiene pantallas asociadas.</p>
                          <button
                            onClick={() => handleOpenCreateScreen(flow.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 text-[#34d399] text-xs font-bold hover:bg-[#10b981]/30 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Crear Primera Pantalla</span>
                          </button>
                        </div>
                      ) : (
                        <div className="relative space-y-3 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#1a233d]">
                          {flowScreens.map((screen, sIdx) => {
                            const statusColor =
                              screen.status === 'Terminada'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : screen.status === 'En desarrollo'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                            return (
                              <div
                                key={screen.id}
                                id={`screen-card-${screen.id}`}
                                className="relative z-10 bg-[#0e1424] hover:bg-[#131a30] border border-[#1e2746] rounded-xl p-4 space-y-3 transition-all hover:border-[#384878] group shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-[#18223d] border border-[#27355e] flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 mt-0.5">
                                      {sIdx + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-white group-hover:text-[#a5b4fc] transition-colors">
                                          {screen.name}
                                        </h4>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17203b] text-slate-400 border border-[#243156]">
                                          {screen.route}
                                        </span>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#18263a] text-[#38bdf8] border border-[#234267]">
                                          {screen.type}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                          {screen.status}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{screen.purpose}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleOpenEditScreen(screen)}
                                      className="p-1.5 rounded-lg bg-[#141b30] hover:bg-[#1e2745] text-slate-400 hover:text-white transition-colors cursor-pointer"
                                      title="Editar pantalla"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setDeleteConfirmId({
                                          type: 'screen',
                                          id: screen.id,
                                          name: screen.name,
                                        })
                                      }
                                      className="p-1.5 rounded-lg bg-[#141b30] hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                      title="Eliminar pantalla"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Key Elements Badges */}
                                {screen.keyElements && screen.keyElements.length > 0 && (
                                  <div className="pt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                      ELEMENTOS DE UI & COMPONENTES:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {screen.keyElements.map((el, elIdx) => (
                                        <span
                                          key={elIdx}
                                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#12192e] border border-[#202c4e] text-slate-300"
                                        >
                                          {el}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Navigation & Triggers */}
                                {screen.navigationActions && screen.navigationActions.length > 0 && (
                                  <div className="pt-1 border-t border-[#161f36]">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                      ACCIONES DE SALIDA & TRANSICIONES:
                                    </span>
                                    <div className="space-y-1.5">
                                      {screen.navigationActions.map((act, actIdx) => {
                                        const targetScr = screensData.screens.find((s) => s.id === act.targetScreenId);
                                        return (
                                          <div
                                            key={actIdx}
                                            className="flex items-center gap-2 text-xs bg-[#0b101c] p-2 rounded-lg border border-[#1a233b]"
                                          >
                                            <span className="text-amber-400 font-semibold">{act.trigger}</span>
                                            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                                            <span className="text-emerald-400 font-bold">
                                              {targetScr ? targetScr.name : act.targetScreenName || act.targetScreenId}
                                            </span>
                                            {act.condition && (
                                              <span className="text-[10px] text-slate-400 italic">
                                                ({act.condition})
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CATÁLOGO DE PANTALLAS */}
        {/* ========================================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-4" id="view-catalog-section">
            {/* Search and Filters Bar */}
            <div className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ruta o propósito..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0e1424] border border-[#1e2746] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#34d399] transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filtros:</span>
                </div>

                {/* Flow Filter */}
                <select
                  value={filterFlow}
                  onChange={(e) => setFilterFlow(e.target.value)}
                  className="bg-[#0e1424] border border-[#1e2746] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#34d399]"
                >
                  <option value="all">Todos los Flujos</option>
                  {screensData.flows.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#0e1424] border border-[#1e2746] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#34d399]"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="Terminada">Terminada</option>
                  <option value="En desarrollo">En desarrollo</option>
                  <option value="Pendiente">Pendiente</option>
                </select>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#0e1424] border border-[#1e2746] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#34d399]"
                >
                  <option value="all">Todos los Tipos</option>
                  {['Splash', 'Onboarding', 'Auth', 'Dashboard', 'Formulario', 'Detalle', 'Modal', 'Checkout', 'Configuración', 'Otro'].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>

                {(searchQuery || filterFlow !== 'all' || filterStatus !== 'all' || filterType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterFlow('all');
                      setFilterStatus('all');
                      setFilterType('all');
                    }}
                    className="text-xs text-rose-400 hover:underline ml-auto cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Grid of screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScreens.map((screen) => {
                const parentFlow = screensData.flows.find((f) => f.id === screen.flowId);
                const statusBadge =
                  screen.status === 'Terminada'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : screen.status === 'En desarrollo'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                return (
                  <div
                    key={screen.id}
                    className="bg-[#0b0f1d] border border-[#1b233d] hover:border-[#344673] rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-md group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white border"
                          style={{
                            backgroundColor: parentFlow ? `${parentFlow.color}25` : '#18223c',
                            borderColor: parentFlow ? `${parentFlow.color}50` : '#2b3b68',
                          }}
                        >
                          {parentFlow?.name || 'Sin flujo'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                          {screen.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-[#a5b4fc] transition-colors">
                          {screen.name}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">{screen.route}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{screen.purpose}</p>

                      {screen.keyElements && screen.keyElements.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {screen.keyElements.map((el, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#12192e] text-slate-300 border border-[#1e2845]"
                            >
                              {el}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#161d33] flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        {screen.navigationActions?.length || 0} Conexiones
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSimulatorScreenId(screen.id);
                            setActiveTab('simulator');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#141f38] hover:bg-[#1d2d52] text-[#818cf8] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Simular</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditScreen(screen)}
                          className="p-1 rounded-lg bg-[#141b30] hover:bg-[#1e2745] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmId({
                              type: 'screen',
                              id: screen.id,
                              name: screen.name,
                            })
                          }
                          className="p-1 rounded-lg bg-[#141b30] hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SIMULADOR INTERACTIVO */}
        {/* ========================================================================= */}
        {activeTab === 'simulator' && (
          <div className="space-y-4" id="view-simulator-section">
            <div className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#18213b] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#34d399]">
                    SIMULADOR DE NAVEGACIÓN Y EXPERIENCIA DE USUARIO
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    Probando: {currentSimulatorScreen?.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Ruta activa: {currentSimulatorScreen?.route}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulatorBack}
                    disabled={simulatorHistory.length <= 1}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      simulatorHistory.length > 1
                        ? 'bg-[#141c33] hover:bg-[#1d2746] text-white border-[#27355c]'
                        : 'bg-[#0f1322] text-slate-600 border-[#1a2033] cursor-not-allowed'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Paso Anterior</span>
                  </button>

                  <select
                    value={simulatorScreenId}
                    onChange={(e) => handleSimulatorNavigate(e.target.value)}
                    className="bg-[#12182a] border border-[#232f52] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#34d399]"
                  >
                    {screensData.screens.map((s) => (
                      <option key={s.id} value={s.id}>
                        Saltar a: {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Wireframe Mock Canvas */}
              <div className="max-w-md mx-auto bg-[#07090e] border-2 border-[#202b4d] rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
                {/* Mobile Device Top Status Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-b border-[#141b30] pb-2">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Screen Header inside Mock */}
                <div className="space-y-1 text-center py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#34d399] px-2 py-0.5 rounded-full bg-[#122b22] border border-[#1f5945]">
                    {currentSimulatorScreen?.type}
                  </span>
                  <h4 className="text-lg font-bold text-white">{currentSimulatorScreen?.name}</h4>
                  <p className="text-xs text-slate-400">{currentSimulatorScreen?.purpose}</p>
                </div>

                {/* Key Components Preview Inside Mock */}
                <div className="space-y-2 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    COMPONENTES EN PANTALLA:
                  </span>
                  <div className="space-y-1.5">
                    {currentSimulatorScreen?.keyElements?.map((elem, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#0f1526] border border-[#1e2846] text-xs text-slate-200 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                        <span>{elem}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Action Triggers in Mock */}
                <div className="pt-2 border-t border-[#141b30] space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    TOCA UN EVENTO PARA NAVEGAR:
                  </span>
                  {currentSimulatorScreen?.navigationActions && currentSimulatorScreen.navigationActions.length > 0 ? (
                    <div className="space-y-2">
                      {currentSimulatorScreen.navigationActions.map((act, idx) => {
                        const targetScr = screensData.screens.find((s) => s.id === act.targetScreenId);
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSimulatorNavigate(act.targetScreenId)}
                            className="w-full text-left p-3 rounded-xl bg-[#131c34] hover:bg-[#1a2648] border border-[#27365f] text-xs font-semibold text-white flex items-center justify-between group transition-all shadow-md active:scale-98 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Play className="w-3.5 h-3.5 text-[#34d399] group-hover:translate-x-0.5 transition-transform" />
                              <span>{act.trigger}</span>
                            </div>
                            <span className="text-[11px] text-[#a5b4fc] font-bold flex items-center gap-1">
                              <span>➔ {targetScr?.name || act.targetScreenName}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 text-center bg-[#0e1322] border border-[#1b233d] rounded-xl text-xs text-slate-400">
                      Esta pantalla es un punto final o no tiene acciones de salida configuradas.
                    </div>
                  )}
                </div>

                {/* Screen Notes */}
                {currentSimulatorScreen?.notes && (
                  <div className="p-3 rounded-xl bg-[#12192e] border border-[#1e294a] text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300 block mb-0.5">Notas Técnicas:</strong>
                    {currentSimulatorScreen.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR PANTALLA */}
      {/* ========================================================================= */}
      {isScreenModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsScreenModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#0e1322] border border-[#212b4b] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a233e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#142620] border border-[#225042] text-[#34d399]">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingScreen ? 'Editar Pantalla' : 'Nueva Pantalla'}
                  </h3>
                  <span className="text-[11px] text-slate-400">{project.name}</span>
                </div>
              </div>

              <button
                onClick={() => setIsScreenModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#141b30] hover:bg-[#1f2845] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScreen} className="space-y-4 text-xs">
              {/* Name & Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Nombre de la Pantalla *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Asistencia Rápida en Crisis"
                    value={screenForm.name || ''}
                    onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                    className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#34d399]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Ruta / Path
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. /asistencia-crisis"
                    value={screenForm.route || ''}
                    onChange={(e) => setScreenForm({ ...screenForm, route: e.target.value })}
                    className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#34d399]"
                  />
                </div>
              </div>

              {/* Flow, Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Flujo Perteneciente
                  </label>
                  <select
                    value={screenForm.flowId || ''}
                    onChange={(e) => setScreenForm({ ...screenForm, flowId: e.target.value })}
                    className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#34d399]"
                  >
                    {screensData.flows.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Tipo de Pantalla
                  </label>
                  <select
                    value={screenForm.type || 'Dashboard'}
                    onChange={(e) => setScreenForm({ ...screenForm, type: e.target.value as any })}
                    className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#34d399]"
                  >
                    {['Splash', 'Onboarding', 'Auth', 'Dashboard', 'Formulario', 'Detalle', 'Modal', 'Checkout', 'Configuración', 'Otro'].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Estado
                  </label>
                  <select
                    value={screenForm.status || 'Pendiente'}
                    onChange={(e) => setScreenForm({ ...screenForm, status: e.target.value as any })}
                    className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#34d399]"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En desarrollo">En desarrollo</option>
                    <option value="Terminada">Terminada</option>
                  </select>
                </div>
              </div>

              {/* Purpose with Voice Recognition */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Propósito y Objetivo de la Pantalla
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleDictate('screen_purpose', screenForm.purpose || '', (val) =>
                        setScreenForm({ ...screenForm, purpose: val })
                      )
                    }
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                      activeRecordingField === 'screen_purpose'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#141b30] text-slate-300 border-[#222c4a] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3 h-3 text-[#34d399]" />
                    <span>{activeRecordingField === 'screen_purpose' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="¿Qué problema resuelve o qué acción principal realiza el usuario aquí?"
                  value={screenForm.purpose || ''}
                  onChange={(e) => setScreenForm({ ...screenForm, purpose: e.target.value })}
                  className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#34d399] leading-relaxed resize-y"
                />
              </div>

              {/* Key Elements List */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Elementos Clave / Componentes de UI
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Botón de ayuda táctil, Carrusel de pasos..."
                    value={tempElementInput}
                    onChange={(e) => setTempElementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tempElementInput.trim()) {
                          setScreenForm({
                            ...screenForm,
                            keyElements: [...(screenForm.keyElements || []), tempElementInput.trim()],
                          });
                          setTempElementInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-[#07090e] border border-[#1b233d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#34d399]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempElementInput.trim()) {
                        setScreenForm({
                          ...screenForm,
                          keyElements: [...(screenForm.keyElements || []), tempElementInput.trim()],
                        });
                        setTempElementInput('');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-[#16203a] hover:bg-[#202e52] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {screenForm.keyElements?.map((elem, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#12192e] border border-[#202c4e] text-slate-200"
                    >
                      <span>{elem}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setScreenForm({
                            ...screenForm,
                            keyElements: screenForm.keyElements?.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Navigation Actions / Triggers */}
              <div className="space-y-2 pt-2 border-t border-[#182038]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Acciones de Salida & Conexiones de Flujo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Disparador (ej. Clic en 'Continuar')"
                    value={tempNavTrigger}
                    onChange={(e) => setTempNavTrigger(e.target.value)}
                    className="bg-[#07090e] border border-[#1b233d] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#34d399]"
                  />
                  <select
                    value={tempNavTarget}
                    onChange={(e) => setTempNavTarget(e.target.value)}
                    className="bg-[#07090e] border border-[#1b233d] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#34d399]"
                  >
                    <option value="">-- Pantalla Destino --</option>
                    {screensData.screens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (tempNavTrigger.trim() && tempNavTarget) {
                        const targetScreen = screensData.screens.find((s) => s.id === tempNavTarget);
                        const newAction: ScreenNavigationAction = {
                          trigger: tempNavTrigger.trim(),
                          targetScreenId: tempNavTarget,
                          targetScreenName: targetScreen?.name || '',
                          condition: tempNavCondition.trim() || undefined,
                        };
                        setScreenForm({
                          ...screenForm,
                          navigationActions: [...(screenForm.navigationActions || []), newAction],
                        });
                        setTempNavTrigger('');
                        setTempNavTarget('');
                        setTempNavCondition('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#10b981]/40 text-[#34d399] font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Conectar
                  </button>
                </div>

                {screenForm.navigationActions && screenForm.navigationActions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {screenForm.navigationActions.map((act, aIdx) => {
                      const targetScr = screensData.screens.find((s) => s.id === act.targetScreenId);
                      return (
                        <div
                          key={aIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#0b101c] border border-[#19223a] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-semibold">{act.trigger}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-emerald-400 font-bold">{targetScr?.name || act.targetScreenName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setScreenForm({
                                ...screenForm,
                                navigationActions: screenForm.navigationActions?.filter((_, i) => i !== aIdx),
                              })
                            }
                            className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5 pt-2 border-t border-[#182038]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Notas Técnicas y UX
                </label>
                <textarea
                  rows={2}
                  placeholder="Consideraciones de performance, accesibilidad o requerimientos específicos..."
                  value={screenForm.notes || ''}
                  onChange={(e) => setScreenForm({ ...screenForm, notes: e.target.value })}
                  className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#34d399] resize-y"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a233e]">
                <button
                  type="button"
                  onClick={() => setIsScreenModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white shadow-lg cursor-pointer"
                >
                  {editingScreen ? 'Guardar Cambios' : 'Crear Pantalla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR FLUJO */}
      {/* ========================================================================= */}
      {isFlowModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setIsFlowModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0e1322] border border-[#212b4b] rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a233e] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingFlow ? 'Editar Flujo' : 'Nuevo Flujo de Usuario'}
              </h3>
              <button
                onClick={() => setIsFlowModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFlow} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nombre del Flujo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Flujo de Checkout y Suscripción"
                  value={flowForm.name || ''}
                  onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                  className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#34d399]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="¿Cuál es el recorrido o journey que abarca este flujo?"
                  value={flowForm.description || ''}
                  onChange={(e) => setFlowForm({ ...flowForm, description: e.target.value })}
                  className="w-full bg-[#07090e] border border-[#1b233d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#34d399] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Color Identificador
                </label>
                <div className="flex items-center gap-2">
                  {['#34d399', '#38bdf8', '#818cf8', '#f472b6', '#fbbf24', '#f87171'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFlowForm({ ...flowForm, color })}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        flowForm.color === color ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a233e]">
                <button
                  type="button"
                  onClick={() => setIsFlowModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white shadow-md cursor-pointer"
                >
                  {editingFlow ? 'Guardar Cambios' : 'Crear Flujo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-sm bg-[#0e1322] border border-[#212b4b] rounded-2xl shadow-2xl p-5 space-y-4 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/50 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">¿Eliminar {deleteConfirmId.type === 'screen' ? 'pantalla' : 'flujo'}?</h4>
              <p className="text-xs text-slate-400">
                Estás a punto de eliminar <strong>"{deleteConfirmId.name}"</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId.type === 'screen') {
                    handleDeleteScreen(deleteConfirmId.id);
                  } else {
                    handleDeleteFlow(deleteConfirmId.id);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
