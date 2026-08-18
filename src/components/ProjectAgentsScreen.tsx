import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Home as HomeIcon,
  Menu,
  ChevronDown,
  Bot,
  Play,
  Settings,
  Trash2,
  Sparkles,
  Copy,
  Check,
  Send,
  Plus,
  RefreshCw,
  X,
  Layers,
  FileText,
  MessageSquare,
  Zap,
  Sliders,
  CheckCircle2,
  Terminal,
  HelpCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Eye,
  GitPullRequest,
  CheckCircle,
  Clock,
  Database
} from 'lucide-react';
import { 
  Project, 
  AgentItem, 
  AgentMessage, 
  AgentExecutionTrace, 
  ProposedAction,
  ContextUsedReference 
} from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { 
  AGENT_SPECS, 
  executeAgentContextEngine, 
  applyProposedActionToProject,
  resolveDynamicAgentContext 
} from '../utils/agentContextEngine';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (moduleKey: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

const defaultAgents: AgentItem[] = [
  {
    id: 'agent-prd',
    name: 'PRD',
    type: 'prd',
    typeLabel: 'PRD',
    color: '#818cf8',
    role: AGENT_SPECS.prd.role,
    promptVersion: AGENT_SPECS.prd.promptVersion,
    systemPrompt: 'Eres un Product Manager senior experto en transformar la estrategia del Documento Maestro en especificaciones funcionales (RFs), user stories, criterios de aceptación Gherkin y métricas rigurosas.',
    connectedDocs: ['Documento Maestro', 'Arquitectura', 'Pantallas'],
    temperature: 0.3,
    history: []
  },
  {
    id: 'agent-copy',
    name: 'Copy',
    type: 'copy',
    typeLabel: 'Copy',
    color: '#38bdf8',
    role: AGENT_SPECS.copy.role,
    promptVersion: AGENT_SPECS.copy.promptVersion,
    systemPrompt: 'Eres un copywriter de conversión y estratega de mensajes. Redactas headlines, hero sections, secuencias de email y microcopy anclados estrictamente en el Mecanismo Único y la Audiencia.',
    connectedDocs: ['Documento Maestro', 'Comentarios', 'Activos'],
    temperature: 0.7,
    history: []
  },
  {
    id: 'agent-investigacion',
    name: 'Investigación',
    type: 'investigacion',
    typeLabel: 'Investigación',
    color: '#22d3ee',
    role: AGENT_SPECS.investigacion.role,
    promptVersion: AGENT_SPECS.investigacion.promptVersion,
    systemPrompt: 'Eres un investigador de mercado y analista cualitativo. Analizas dolores, frustraciones, comentarios reales de redes y señales de mercado para extraer patrones y oportunidades.',
    connectedDocs: ['Comentarios', 'Documento Maestro', 'Base de Conocimiento'],
    temperature: 0.4,
    history: []
  },
  {
    id: 'agent-ux',
    name: 'UX',
    type: 'ux',
    typeLabel: 'UX',
    color: '#34d399',
    role: AGENT_SPECS.ux.role,
    promptVersion: AGENT_SPECS.ux.promptVersion,
    systemPrompt: 'Eres un diseñador de experiencia de usuario y flujos. Diseñas heurísticas, navegación, jerarquía visual y micro-interacciones sobre las pantallas y rutas reales del proyecto.',
    connectedDocs: ['Pantallas', 'Documento Maestro', 'Arquitectura'],
    temperature: 0.4,
    history: []
  },
  {
    id: 'agent-arquitectura',
    name: 'Arquitectura',
    type: 'arquitectura',
    typeLabel: 'Arquitectura',
    color: '#fbbf24',
    role: AGENT_SPECS.arquitectura.role,
    promptVersion: AGENT_SPECS.arquitectura.promptVersion,
    systemPrompt: 'Eres un arquitecto técnico senior encargado de definir modelos de entidades TypeScript, APIs, flujo de datos, persistencia offline-first y seguridad de datos sensibles.',
    connectedDocs: ['Documento Maestro', 'Arquitectura', 'Pantallas'],
    temperature: 0.2,
    history: []
  },
  {
    id: 'agent-general',
    name: 'General',
    type: 'general',
    typeLabel: 'General',
    color: '#f472b6',
    role: AGENT_SPECS.general.role,
    promptVersion: AGENT_SPECS.general.promptVersion,
    systemPrompt: 'Eres un copiloto estratégico multidisciplinario 360° capaz de conectar transversalmente estrategia, producto, tecnología y go-to-market con visión integradora.',
    connectedDocs: ['Documento Maestro', 'Pantallas', 'Arquitectura', 'Comentarios'],
    temperature: 0.5,
    history: []
  }
];

export const ProjectAgentsScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Agents state
  const [agents, setAgents] = useState<AgentItem[]>(() => {
    if (project.agentsData?.agents && project.agentsData.agents.length > 0) {
      return project.agentsData.agents;
    }
    return defaultAgents;
  });

  // Selected agent (only one displayed on the screen at a time)
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => {
    if (project.agentsData?.selectedAgentId) {
      return project.agentsData.selectedAgentId;
    }
    return 'agent-copy';
  });

  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [copiedResponseId, setCopiedResponseId] = useState<string | null>(null);

  // Traceability Modal State
  const [selectedTrace, setSelectedTrace] = useState<AgentExecutionTrace | null>(null);
  const [expandedSourcesMap, setExpandedSourcesMap] = useState<Record<string, boolean>>({});
  
  const toggleSources = (msgId: string) => {
    setExpandedSourcesMap((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };
  
  // Proposed Action Diff & Confirm Modal State
  const [activeActionModal, setActiveActionModal] = useState<{
    action: ProposedAction;
    msgId: string;
    editedValue: string;
  } | null>(null);

  // System Matrix Modal
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);

  // Success Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Agent
  const activeAgent = agents.find((a) => a.id === selectedAgentId) || agents[0] || defaultAgents[0];

  // Live Context Preview for active agent & current input
  const previewResolution = resolveDynamicAgentContext(
    activeAgent.type, 
    promptText.trim() || 'consulta general del proyecto', 
    project
  );

  // Config modal temporary edit state
  const [configName, setConfigName] = useState(activeAgent.name);
  const [configRole, setConfigRole] = useState(activeAgent.role);
  const [configSystemPrompt, setConfigSystemPrompt] = useState(activeAgent.systemPrompt);
  const [configTemp, setConfigTemp] = useState(activeAgent.temperature);
  const [configDocs, setConfigDocs] = useState<string[]>(activeAgent.connectedDocs || []);

  useEffect(() => {
    if (activeAgent) {
      setConfigName(activeAgent.name);
      setConfigRole(activeAgent.role);
      setConfigSystemPrompt(activeAgent.systemPrompt);
      setConfigTemp(activeAgent.temperature);
      setConfigDocs(activeAgent.connectedDocs || []);
    }
  }, [activeAgent]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveAgentsState = (newAgents: AgentItem[], newSelectedId: string, newExecution?: AgentExecutionTrace) => {
    setAgents(newAgents);
    setSelectedAgentId(newSelectedId);
    if (onUpdateProject) {
      const existingExecutions = project.agentsData?.executions || [];
      const updatedExecutions = newExecution 
        ? [newExecution, ...existingExecutions.slice(0, 49)] 
        : existingExecutions;

      onUpdateProject({
        ...project,
        agentsData: {
          agents: newAgents,
          selectedAgentId: newSelectedId,
          executions: updatedExecutions,
          lastSaved: new Date().toISOString(),
        },
      });
    }
  };

  const handleSelectOrAddChip = (type: 'investigacion' | 'copy' | 'prd' | 'ux' | 'arquitectura' | 'general') => {
    const existing = agents.find((a) => a.type === type);
    if (existing) {
      setSelectedAgentId(existing.id);
      saveAgentsState(agents, existing.id);
    } else {
      const template = defaultAgents.find((a) => a.type === type) || defaultAgents[0];
      const newAgent: AgentItem = {
        ...template,
        id: `agent-${type}-${Date.now()}`,
        name: template.name,
        history: [],
      };
      const updatedList = [...agents, newAgent];
      saveAgentsState(updatedList, newAgent.id);
    }
  };

  const handleDeleteActiveAgent = () => {
    if (agents.length <= 1) {
      alert('Debe haber al menos un agente en el proyecto.');
      return;
    }
    if (confirm(`¿Eliminar al agente "${activeAgent.name}"?`)) {
      const filtered = agents.filter((a) => a.id !== activeAgent.id);
      const nextSelected = filtered[0]?.id || '';
      saveAgentsState(filtered, nextSelected);
    }
  };

  const handleSaveConfig = () => {
    const updatedAgents = agents.map((a) => {
      if (a.id === activeAgent.id) {
        return {
          ...a,
          name: configName,
          role: configRole,
          systemPrompt: configSystemPrompt,
          temperature: configTemp,
          connectedDocs: configDocs,
        };
      }
      return a;
    });
    saveAgentsState(updatedAgents, activeAgent.id);
    setIsConfigModalOpen(false);
    showToast('Configuración del agente guardada correctamente.');
  };

  const handleExecutePrompt = () => {
    if (!promptText.trim()) return;

    const userPromptContent = promptText.trim();
    const userMsg: AgentMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userPromptContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setPromptText('');
    setIsExecuting(true);

    // Update history with user message
    const withUserMsg = agents.map((a) => {
      if (a.id === activeAgent.id) {
        return {
          ...a,
          history: [...(a.history || []), userMsg],
        };
      }
      return a;
    });
    setAgents(withUserMsg);

    // Run specialized dynamic context engine
    setTimeout(() => {
      const executionResult = executeAgentContextEngine(
        activeAgent,
        userPromptContent,
        project
      );

      const agentMsg: AgentMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        text: executionResult.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        trace: executionResult.trace,
        proposedAction: executionResult.proposedAction,
      };

      const finalAgents = agents.map((a) => {
        if (a.id === activeAgent.id) {
          return {
            ...a,
            history: [...(a.history || []), agentMsg],
          };
        }
        return a;
      });

      saveAgentsState(finalAgents, activeAgent.id, executionResult.trace);
      setIsExecuting(false);
    }, 450);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponseId(msgId);
    setTimeout(() => setCopiedResponseId(null), 2000);
  };

  const handleOpenActionModal = (msgId: string, action: ProposedAction) => {
    setActiveActionModal({
      action,
      msgId,
      editedValue: action.proposedValue,
    });
  };

  const handleConfirmApplyAction = () => {
    if (!activeActionModal) return;
    const { action, msgId, editedValue } = activeActionModal;

    const modifiedAction: ProposedAction = {
      ...action,
      proposedValue: editedValue,
      applied: true,
      appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update project state with the new value
    if (onUpdateProject) {
      const updatedProject = applyProposedActionToProject(project, modifiedAction);

      // Update message in agent history
      const updatedAgents = agents.map((a) => {
        if (a.id === activeAgent.id) {
          const updatedHistory = (a.history || []).map((m) => {
            if (m.id === msgId) {
              return {
                ...m,
                proposedAction: modifiedAction,
                trace: m.trace ? {
                  ...m.trace,
                  interactionStatus: editedValue === action.proposedValue ? 'accepted' : 'edited_then_accepted',
                  proposedAction: modifiedAction
                } : undefined
              };
            }
            return m;
          });
          return { ...a, history: updatedHistory };
        }
        return a;
      });

      setAgents(updatedAgents);
      onUpdateProject({
        ...updatedProject,
        agentsData: {
          agents: updatedAgents,
          selectedAgentId: activeAgent.id,
          executions: updatedProject.agentsData?.executions || [],
          lastSaved: new Date().toISOString()
        }
      });
    }

    setActiveActionModal(null);
    showToast(`✓ Acción ejecutada: Se actualizó ${action.label}`);
  };

  const handleDiscardAction = (msgId: string) => {
    const updatedAgents = agents.map((a) => {
      if (a.id === activeAgent.id) {
        const updatedHistory = (a.history || []).map((m) => {
          if (m.id === msgId) {
            return {
              ...m,
              proposedAction: undefined,
              trace: m.trace ? { ...m.trace, interactionStatus: 'discarded' } : undefined
            };
          }
          return m;
        });
        return { ...a, history: updatedHistory };
      }
      return a;
    });
    saveAgentsState(updatedAgents, activeAgent.id);
    showToast('Acción descartada.');
  };

  return (
    <div
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-agents-root"
    >
      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="agentes"
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          if (onNavigateModule) {
            onNavigateModule(mod);
          }
        }}
        onNavigateHome={onNavigateHome}
      />

      {/* Top App Header Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#090c15]/95 backdrop-blur-md border-b border-[#151b2e] px-4 py-3">
        <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              id="btn-agents-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Volver button */}
            <button
              onClick={onBack}
              id="btn-agents-top-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            {/* Home Icon */}
            <button
              onClick={onNavigateHome}
              id="btn-agents-top-home"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Ir al inicio"
            >
              <HomeIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Matrix & System Traceability Inspector button */}
          <button
            onClick={() => setIsMatrixModalOpen(true)}
            id="btn-open-agents-matrix"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111728] hover:bg-[#19223c] border border-[#202c4f] text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Matriz del Sistema</span>
          </button>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-3xl mx-auto px-4 py-6 space-y-5">
        
        {/* Title Header Section */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#a855f7] uppercase block">
              AGENTES · COPILOTOS DEL PROYECTO
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-[#0e1322] px-2 py-0.5 rounded-md border border-[#1b233a]">
              Context Engine v2.4 Activo
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agentes especializados
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Sistema de agentes con resolución dinámica de contexto real. Cada ejecución extrae los datos actuales del Documento Maestro, Pantallas y Comentarios del proyecto.
          </p>
        </section>

        {/* 6 Agent Creation & Switcher Chips */}
        <section className="flex flex-wrap gap-2">
          {/* + Investigación */}
          <button
            onClick={() => handleSelectOrAddChip('investigacion')}
            id="chip-agent-investigacion"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeAgent.type === 'investigacion'
                ? 'bg-[#082f38] border-[#22d3ee] text-[#22d3ee] shadow-md shadow-[#22d3ee]/20 ring-1 ring-[#22d3ee]/50'
                : 'bg-[#081a24] hover:bg-[#0c2433] border-[#0e7490] text-[#22d3ee]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#22d3ee]" />
            <span>+ Investigación</span>
          </button>

          {/* + Copy */}
          <button
            onClick={() => handleSelectOrAddChip('copy')}
            id="chip-agent-copy"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeAgent.type === 'copy'
                ? 'bg-[#0b2942] border-[#38bdf8] text-[#38bdf8] shadow-md shadow-[#38bdf8]/20 ring-1 ring-[#38bdf8]/50'
                : 'bg-[#081726] hover:bg-[#0c2238] border-[#0284c7] text-[#38bdf8]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>+ Copy</span>
          </button>

          {/* + PRD */}
          <button
            onClick={() => handleSelectOrAddChip('prd')}
            id="chip-agent-prd"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeAgent.type === 'prd'
                ? 'bg-[#1e1b4b] border-[#818cf8] text-[#818cf8] shadow-md shadow-[#818cf8]/20 ring-1 ring-[#818cf8]/50'
                : 'bg-[#11132b] hover:bg-[#181c3d] border-[#4f46e5] text-[#818cf8]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>+ PRD</span>
          </button>

          {/* + UX */}
          <button
            onClick={() => handleSelectOrAddChip('ux')}
            id="chip-agent-ux"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeAgent.type === 'ux'
                ? 'bg-[#062c22] border-[#34d399] text-[#34d399] shadow-md shadow-[#34d399]/20 ring-1 ring-[#34d399]/50'
                : 'bg-[#071c17] hover:bg-[#0c2921] border-[#059669] text-[#34d399]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#34d399]" />
            <span>+ UX</span>
          </button>

          {/* + Arquitectura */}
          <button
            onClick={() => handleSelectOrAddChip('arquitectura')}
            id="chip-agent-arquitectura"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeAgent.type === 'arquitectura'
                ? 'bg-[#382607] border-[#fbbf24] text-[#fbbf24] shadow-md shadow-[#fbbf24]/20 ring-1 ring-[#fbbf24]/50'
                : 'bg-[#1f1607] hover:bg-[#2b1f0c] border-[#b45309] text-[#fbbf24]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>+ Arquitectura</span>
          </button>

          {/* + General */}
          <button
            onClick={() => handleSelectOrAddChip('general')}
            id="chip-agent-general"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeAgent.type === 'general'
                ? 'bg-[#3b0d2d] border-[#f472b6] text-[#f472b6] shadow-md shadow-[#f472b6]/20 ring-1 ring-[#f472b6]/50'
                : 'bg-[#21091a] hover:bg-[#2e0e25] border-[#be185d] text-[#f472b6]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#f472b6]" />
            <span>+ General</span>
          </button>
        </section>

        {/* SINGLE SELECTED AGENT WORKSPACE BOX */}
        <section
          id={`agent-box-${activeAgent.id}`}
          className="bg-[#0b0e1a] border border-[#1d2542] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl ring-1 ring-white/5"
        >
          {/* Agent Box Top Action Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Bot Icon Badge */}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${activeAgent.color}15`,
                  borderColor: `${activeAgent.color}40`,
                  color: activeAgent.color
                }}
              >
                <Bot className="w-5 h-5" />
              </div>

              {/* Visual Rounded Pill indicator */}
              <div 
                className="w-2.5 h-9 rounded-full" 
                style={{ backgroundColor: activeAgent.color }}
              />

              {/* Agent Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                  id="btn-agent-selector"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0e1324] hover:bg-[#171e36] border border-[#212b48] text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <span>{activeAgent.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({activeAgent.promptVersion || 'v2.4'})</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isAgentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAgentDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-[#111728] border border-[#202947] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setIsAgentDropdownOpen(false);
                          saveAgentsState(agents, agent.id);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          agent.id === activeAgent.id
                            ? 'bg-[#1c2642] text-white font-bold'
                            : 'text-slate-300 hover:bg-[#161f36] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: agent.color || '#818cf8' }}
                          />
                          <span>{agent.name}</span>
                        </div>
                        {agent.id === activeAgent.id && (
                          <Check className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Buttons: Configurar & Trash */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfigModalOpen(true)}
                id="btn-agent-configure"
                className="px-3 py-2 rounded-xl bg-[#141a2e] hover:bg-[#1c2440] border border-[#242e4e] text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Configurar</span>
              </button>

              <button
                onClick={handleDeleteActiveAgent}
                id="btn-agent-delete"
                className="p-2 rounded-xl bg-[#1c121e] hover:bg-[#2a1626] border border-[#3b1c2b] text-[#f87171] hover:text-red-300 transition-colors cursor-pointer"
                title="Eliminar agente"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#0d1222] p-2.5 rounded-xl border border-[#1b233a]">
            <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-200 block text-xs truncate">
                {activeAgent.role}
              </span>
            </div>
          </div>

          {/* PETICIÓN AL AGENTE Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PETICIÓN AL AGENTE
              </span>
              <span className="text-[10px] text-slate-500">
                Presiona ⌘ + Enter para ejecutar
              </span>
            </div>

            {/* Multi-line input & Execute Button side-by-side */}
            <div className="flex gap-2.5 items-start">
              <div className="flex-1 min-w-0">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleExecutePrompt();
                    }
                  }}
                  rows={4}
                  id="input-agent-prompt"
                  placeholder={
                    activeAgent.type === 'copy'
                      ? 'Ej. Escribe el hero de la landing o el email de activación...'
                      : activeAgent.type === 'prd'
                      ? 'Ej. Especifica los requerimientos funcionales del módulo SOS...'
                      : activeAgent.type === 'investigacion'
                      ? 'Ej. Analiza los dolores principales en los comentarios de YouTube e Instagram...'
                      : activeAgent.type === 'ux'
                      ? 'Ej. Diseña la pantalla de asistencia rápida y define sus triggers...'
                      : activeAgent.type === 'arquitectura'
                      ? 'Ej. Modela las entidades TypeScript y la estrategia offline...'
                      : 'Ej. Diagnóstico estratégico 360° del proyecto...'
                  }
                  className="w-full bg-[#080b14] border border-[#1c2542] rounded-xl p-3 text-xs sm:text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6366f1] transition-all resize-none leading-relaxed min-h-[110px]"
                />
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleExecutePrompt}
                  disabled={isExecuting || !promptText.trim()}
                  id="btn-agent-execute"
                  className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                    isExecuting || !promptText.trim()
                      ? 'bg-[#101426] border-[#1c2642] text-slate-500 cursor-not-allowed'
                      : 'bg-[#12152e] hover:bg-[#1a1e42] border-[#7c3aed] text-[#c084fc] hover:text-purple-200 shadow-md shadow-purple-500/10'
                  }`}
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c084fc]" />
                      <span>Ensamblando...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-[#c084fc] text-[#c084fc]" />
                      <span>Ejecutar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Context Engine Status Bar */}
          <div className="bg-[#080b14] border border-[#182138] rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-slate-300">Resolución de Contexto Dinámico:</span>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono">
                {previewResolution.usedSources.length} campos seleccionados ({previewResolution.consultedSources.length} consultados)
              </span>
            </div>

            {/* Context Layers: Capa A, B, C */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
              {/* Capa A: Disponible */}
              <div className="bg-[#0d1222] p-1.5 rounded-lg border border-[#1b233a]">
                <span className="text-slate-400 font-bold block mb-0.5">Capa A (Disponible)</span>
                <span className="text-slate-300 truncate block">
                  {previewResolution.availableSources.join(', ')}
                </span>
              </div>

              {/* Capa B: Consultado */}
              <div className="bg-[#0d1222] p-1.5 rounded-lg border border-[#1b233a]">
                <span className="text-indigo-300 font-bold block mb-0.5">Capa B (Consultado)</span>
                <span className="text-slate-300 truncate block">
                  {previewResolution.consultedSources.length} secciones evaluadas
                </span>
              </div>

              {/* Capa C: Utilizado */}
              <div className="bg-[#0d1222] p-1.5 rounded-lg border border-[#1b233a]">
                <span className="text-emerald-400 font-bold block mb-0.5">Capa C (Utilizado)</span>
                <span className="text-emerald-300 truncate block font-medium">
                  {previewResolution.usedSources.slice(0, 2).map((s) => s.fieldLabel).join(', ')}...
                </span>
              </div>
            </div>
          </div>

          {/* Real AI Execution Stream & Interaction History */}
          {activeAgent.history && activeAgent.history.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-[#18213a] animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  HISTORIAL DE EJECUCIONES ({activeAgent.history.length})
                </span>
                <button
                  onClick={() => {
                    const cleared = agents.map((a) => (a.id === activeAgent.id ? { ...a, history: [] } : a));
                    saveAgentsState(cleared, activeAgent.id);
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Limpiar historial
                </button>
              </div>

              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                {activeAgent.history.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-2xl p-4 space-y-3 text-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#0f1424] border border-[#1e2746] text-slate-200 ml-6'
                        : 'bg-[#090d1a] border border-[#212b4b] text-slate-100 mr-2 shadow-xl ring-1 ring-white/5'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        {msg.sender === 'user' ? (
                          <span className="font-bold text-slate-200 bg-[#161f38] px-2 py-0.5 rounded-md">Tú</span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span 
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: activeAgent.color }}
                            />
                            <span className="font-bold text-white">{activeAgent.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({msg.trace?.agentPromptVersion || activeAgent.promptVersion || 'v2.4'})
                            </span>
                            {/* Classified Intent Badge */}
                            {msg.trace?.classifiedIntent && (
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                msg.trace.classifiedIntent === 'DELIVERABLE'
                                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                                  : msg.trace.classifiedIntent === 'ANALYSIS'
                                  ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                                  : msg.trace.classifiedIntent === 'HYBRID'
                                  ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40'
                                  : 'bg-slate-900 text-slate-300 border-slate-700'
                              }`}>
                                {msg.trace.classifiedIntent === 'DELIVERABLE' && '🎯 Entregable Directo'}
                                {msg.trace.classifiedIntent === 'ANALYSIS' && '🔍 Análisis & Diagnóstico'}
                                {msg.trace.classifiedIntent === 'HYBRID' && '⚡ Híbrido (Diagnóstico + Activo)'}
                                {msg.trace.classifiedIntent === 'AMBIGUOUS' && '❓ Petición Ambigua'}
                              </span>
                            )}
                          </div>
                        )}
                        <span>· {msg.timestamp}</span>
                      </div>

                      {msg.sender === 'agent' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => msg.trace && setSelectedTrace(msg.trace)}
                            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-[#12182c] px-2 py-1 rounded-md border border-[#1e294b]"
                            title="Ver trazabilidad completa de la ejecución"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="text-[10px] font-semibold">Trazabilidad</span>
                          </button>

                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer bg-[#101424] px-2 py-1 rounded-md border border-[#1b233a]"
                            title="Copiar texto de la respuesta"
                          >
                            {copiedResponseId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[10px]">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Contradictions & Warnings Banner */}
                    {msg.sender === 'agent' && msg.trace?.contradictions && msg.trace.contradictions.length > 0 && (
                      <div className="bg-[#24130b] border border-[#b45309]/50 rounded-xl p-2.5 text-[11px] space-y-1 text-amber-200">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Inconsistencia o Contradicción Detectada:</span>
                        </div>
                        {msg.trace.contradictions.map((c, cIdx) => (
                          <div key={cIdx} className="space-y-0.5 text-[10px] text-amber-100 pl-5">
                            <p><strong>Conflicto:</strong> {c.description}</p>
                            <p><strong>Criterio de Priorización:</strong> {c.prioritizedSource}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formatted Output Content */}
                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-slate-200 space-y-2">
                      {msg.text}
                    </div>

                    {/* Secondary Collapsible Traceability (Grounding on demand) */}
                    {msg.sender === 'agent' && msg.trace?.usedSources && msg.trace.usedSources.length > 0 && (
                      <div className="pt-1 border-t border-white/5">
                        <button
                          onClick={() => toggleSources(msg.id)}
                          className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-indigo-300 transition-colors py-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-semibold text-slate-300">Fuentes consultadas ({msg.trace.usedSources.length})</span>
                          <span className="text-[9px] text-indigo-400 font-mono">
                            {expandedSourcesMap[msg.id] ? '▲ Ocultar fuentes' : '▼ Ver fuentes usadas'}
                          </span>
                        </button>

                        {expandedSourcesMap[msg.id] && (
                          <div className="mt-1.5 bg-[#05070e] p-2.5 rounded-xl border border-[#161d33] space-y-1.5">
                            <div className="text-[10px] text-slate-400">
                              Campos reales del proyecto integrados en esta respuesta:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.trace.usedSources.map((source, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="px-2 py-1 rounded-lg bg-[#0c1224] border border-[#1e2b4f] text-[10px] text-indigo-300 flex items-center gap-1.5"
                                  title={`Valor: "${source.value.slice(0, 100)}..."`}
                                >
                                  <span className="text-[9px] text-slate-400 font-medium">{source.module} →</span>
                                  <span className="font-semibold text-slate-200">{source.fieldLabel}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actionable Proposal Bar */}
                    {msg.sender === 'agent' && msg.proposedAction && (
                      <div className="mt-3 pt-3 border-t border-[#18213a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#060a14] -mx-4 -mb-4 p-3 rounded-b-2xl border-x-0 border-b-0">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Zap className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-slate-300">
                            <strong>Acción Propuesta:</strong> {msg.proposedAction.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {msg.proposedAction.applied ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aplicado ({msg.proposedAction.appliedAt || 'Reciente'})</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleDiscardAction(msg.id)}
                                className="px-2.5 py-1 rounded-xl text-[10px] font-medium text-slate-400 hover:text-white bg-[#101424] hover:bg-[#161d33] border border-[#1b233a] transition-colors cursor-pointer"
                              >
                                Descartar
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(msg.id, msg.proposedAction!)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 shadow-md shadow-indigo-500/20 transition-colors cursor-pointer"
                              >
                                <GitPullRequest className="w-3.5 h-3.5" />
                                <span>{msg.proposedAction.label}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Prompts Suggestions */}
          {(!activeAgent.history || activeAgent.history.length === 0) && (
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Sugerencias contextuales para {activeAgent.name}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeAgent.type === 'copy'
                  ? [
                      'Escribe el hero de la landing',
                      'Redacta el email de activación en momentos de crisis',
                      'Genera 3 variantes de microcopy para el botón principal',
                      'Escribe la matriz de objeciones y respuestas'
                    ]
                  : activeAgent.type === 'prd'
                  ? [
                      'Estructura los requerimientos funcionales del módulo SOS',
                      'Redacta las User Stories del flujo de onboarding',
                      'Define los criterios de aceptación Gherkin para el modo offline',
                      'Especifica las métricas de éxito del producto'
                    ]
                  : activeAgent.type === 'investigacion'
                  ? [
                      'Analiza los comentarios de YouTube e Instagram',
                      'Extrae los dolores no resueltos por manuales teóricos',
                      'Identifica el lenguaje natural de los cuidadores',
                      'Mapea las oportunidades de diferenciación frente a competidores'
                    ]
                  : activeAgent.type === 'ux'
                  ? [
                      'Diseña la pantalla de asistencia rápida en situaciones difíciles',
                      'Optimiza el journey de activación en menos de 60 segundos',
                      'Define los estados vacío, carga y error del dashboard',
                      'Reduce la fricción en el registro inicial'
                    ]
                  : activeAgent.type === 'arquitectura'
                  ? [
                      'Modela las entidades TypeScript ChildProfile y CrisisEventLog',
                      'Define los contratos de API para la sincronización',
                      'Especifica la arquitectura de almacenamiento local cifrado',
                      'Evalúa la estrategia de persistencia offline-first'
                    ]
                  : [
                      'Diagnóstico estratégico 360° del proyecto',
                      'Verifica la coherencia entre el posicionamiento y los flujos',
                      'Plan de acción prioritario para el MVP',
                      'Identifica riesgos y desalineaciones entre módulos'
                    ]
                ).map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setPromptText(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0e1324] hover:bg-[#151c33] border border-[#1b233a] text-slate-300 text-left transition-colors cursor-pointer"
                  >
                    💡 {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Interactive Action Diff & Confirmation Modal */}
      {activeActionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          id="modal-action-confirm"
          onClick={() => setActiveActionModal(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0c101c] border border-[#212b48] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#182138] flex items-center justify-between bg-[#0e1424]">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Confirmar Inserción Directa
                </h3>
              </div>
              <button
                onClick={() => setActiveActionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#182138] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="bg-[#080b14] p-3 rounded-xl border border-[#182138] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Destino de inserción:</span>
                  <span className="font-mono text-indigo-300 font-bold uppercase">
                    Módulo: {activeActionModal.action.targetModule}
                  </span>
                </div>
                <p className="text-slate-200 font-semibold">{activeActionModal.action.diffSummary}</p>
              </div>

              {/* Current Value vs Proposed Value */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Valor Actual en el Proyecto:
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#080b14] border border-[#1b233a] text-slate-400 italic font-mono text-[11px]">
                    {activeActionModal.action.currentValue || '(Sin contenido previo)'}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                    Nuevo Valor Propuesto (Puedes editarlo antes de aplicar):
                  </label>
                  <textarea
                    value={activeActionModal.editedValue}
                    onChange={(e) =>
                      setActiveActionModal({
                        ...activeActionModal,
                        editedValue: e.target.value,
                      })
                    }
                    rows={6}
                    className="w-full bg-[#080b14] border border-indigo-500/60 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-400 font-sans leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#182138] flex items-center justify-end gap-2 bg-[#090d17]">
              <button
                onClick={() => setActiveActionModal(null)}
                className="px-4 py-2 rounded-xl bg-[#141b2e] hover:bg-[#1a233b] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmApplyAction}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar e Insertar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traceability & Audit Inspector Modal */}
      {selectedTrace && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          id="modal-trace-inspector"
          onClick={() => setSelectedTrace(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#0c101c] border border-[#212b48] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#182138] flex items-center justify-between bg-[#0e1424]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Auditoría y Trazabilidad de Ejecución
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {selectedTrace.executionId} · Agente: {selectedTrace.agentName} ({selectedTrace.agentPromptVersion})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#182138] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#080b14] p-2.5 rounded-xl border border-[#1a233c]">
                  <span className="text-[10px] text-slate-400 font-bold block">Hora</span>
                  <span className="text-slate-200 font-medium">{selectedTrace.timestamp}</span>
                </div>
                <div className="bg-[#080b14] p-2.5 rounded-xl border border-[#1a233c]">
                  <span className="text-[10px] text-slate-400 font-bold block">Latencia</span>
                  <span className="text-slate-200 font-medium">{selectedTrace.latencyMs} ms</span>
                </div>
                <div className="bg-[#080b14] p-2.5 rounded-xl border border-[#1a233c]">
                  <span className="text-[10px] text-slate-400 font-bold block">Tokens Aprox.</span>
                  <span className="text-slate-200 font-medium">~{selectedTrace.tokenBudgetUsage?.promptTokens || 720}</span>
                </div>
                <div className="bg-[#080b14] p-2.5 rounded-xl border border-[#1a233c]">
                  <span className="text-[10px] text-slate-400 font-bold block">Estado Acción</span>
                  <span className="text-indigo-300 font-bold uppercase">{selectedTrace.interactionStatus}</span>
                </div>
              </div>

              {/* User Prompt */}
              <div className="bg-[#080b14] p-3 rounded-xl border border-[#1a233c] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Petición del Usuario
                </span>
                <p className="text-slate-200 italic font-medium">"{selectedTrace.userRequest}"</p>
              </div>

              {/* 3-Tier Context Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Desglose del Pipeline de Contexto
                </h4>

                {/* 1. Disponible */}
                <div className="p-3 rounded-xl bg-[#080b14] border border-[#1b233a] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300">1. Contexto Disponible (Capa A)</span>
                    <span className="text-slate-500 font-mono text-[10px]">{selectedTrace.availableSources.length} módulos accesibles</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTrace.availableSources.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-[#0f1526] border border-[#1c2747] text-[10px] text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Consultado */}
                <div className="p-3 rounded-xl bg-[#080b14] border border-[#1b233a] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-300">2. Contexto Consultado (Capa B)</span>
                    <span className="text-slate-500 font-mono text-[10px]">{selectedTrace.consultedSources.length} secciones examinadas</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {selectedTrace.consultedSources.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-[#10172e] border border-[#202e5c] text-[10px] text-indigo-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Utilizado */}
                <div className="p-3 rounded-xl bg-[#080b14] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-300">3. Contexto Realmente Utilizado (Capa C)</span>
                    <span className="text-emerald-400 font-mono text-[10px] font-bold">{selectedTrace.usedSources.length} campos inyectados</span>
                  </div>
                  
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedTrace.usedSources.map((src, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#05070e] border border-[#182138] flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-indigo-300">
                            {src.module} → {src.sectionLabel} → {src.fieldLabel}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                            {src.status}
                          </span>
                        </div>
                        <p className="text-slate-300 font-mono text-[10px] line-clamp-2">
                          "{src.value}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contradictions, Missing Info & Assumptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#080b14] border border-[#1b233a] space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Información Faltante
                  </span>
                  {selectedTrace.missingInfo.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[10px]">
                      {selectedTrace.missingInfo.map((m, mIdx) => (
                        <li key={mIdx}>{m}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-emerald-400 text-[10px]">Ninguna información crítica faltante</span>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[#080b14] border border-[#1b233a] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Supuestos Introducidos
                  </span>
                  {selectedTrace.assumptions.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[10px]">
                      {selectedTrace.assumptions.map((a, aIdx) => (
                        <li key={aIdx}>{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500 text-[10px]">Cero supuestos extra-canónicos</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#182138] flex items-center justify-end bg-[#090d17]">
              <button
                onClick={() => setSelectedTrace(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Cerrar Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Matrix Modal */}
      {isMatrixModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          id="modal-system-matrix"
          onClick={() => setIsMatrixModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#0c101c] border border-[#212b48] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#182138] flex items-center justify-between bg-[#0e1424]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Matriz del Sistema de Agentes Especializados
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Arquitectura de Contexto, Especialización, Prompts y Destinos por Agente
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMatrixModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#182138] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1f2947] text-[10px] uppercase text-slate-400 bg-[#080b14]">
                      <th className="p-3">Agente</th>
                      <th className="p-3">Rol & Especialidad</th>
                      <th className="p-3">Contexto Disponible / Prioridades</th>
                      <th className="p-3">System Prompt Propio</th>
                      <th className="p-3">Destinos de Inserción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#151c33]">
                    {Object.values(AGENT_SPECS).map((spec) => (
                      <tr key={spec.type} className="hover:bg-[#0f1424] transition-colors">
                        <td className="p-3 font-bold flex items-center gap-2" style={{ color: spec.color }}>
                          <Bot className="w-4 h-4 shrink-0" />
                          <span>{spec.name}</span>
                        </td>
                        <td className="p-3 text-slate-200">
                          <span className="font-semibold block">{spec.role}</span>
                          <span className="text-[10px] text-slate-400">{spec.objective}</span>
                        </td>
                        <td className="p-3 text-slate-300">
                          <div className="space-y-1">
                            <span className="font-bold text-[10px] text-indigo-300 block">Fuentes Primarias:</span>
                            <div className="flex flex-wrap gap-1">
                              {spec.primarySources.map((s, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-[#131a30] border border-[#202d52] text-[9px]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                            Sí ({spec.promptVersion})
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[10px]">
                          {spec.targetDestinations.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#182138] flex items-center justify-end bg-[#090d17]">
              <button
                onClick={() => setIsMatrixModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Cerrar Matriz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {isConfigModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          id="modal-agent-config"
          onClick={() => setIsConfigModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0c101c] border border-[#212b48] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#182138] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Configurar Agente: {activeAgent.name}
                </h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#182138] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nombre del Agente
                </label>
                <input
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="w-full bg-[#080b14] border border-[#1c2642] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Rol / Especialidad
                </label>
                <input
                  type="text"
                  value={configRole}
                  onChange={(e) => setConfigRole(e.target.value)}
                  className="w-full bg-[#080b14] border border-[#1c2642] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Prompt de Sistema (Instrucciones base)
                </label>
                <textarea
                  value={configSystemPrompt}
                  onChange={(e) => setConfigSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-[#080b14] border border-[#1c2642] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed font-mono"
                />
              </div>

              {/* Connected Docs */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fuentes de Contexto Conectadas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Documento Maestro', 'Arquitectura', 'Pantallas', 'Comentarios'].map((doc) => {
                    const isChecked = configDocs.includes(doc);
                    return (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setConfigDocs(configDocs.filter((d) => d !== doc));
                          } else {
                            setConfigDocs([...configDocs, doc]);
                          }
                        }}
                        className={`p-2 rounded-xl text-xs font-medium border text-left transition-colors flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-[#151c33] border-indigo-500 text-white'
                            : 'bg-[#080b14] border-[#1c2642] text-slate-400'
                        }`}
                      >
                        <span>{doc}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Temperatura / Creatividad: {configTemp}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {configTemp < 0.4 ? 'Preciso' : configTemp > 0.7 ? 'Muy Creativo' : 'Balanceado'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={configTemp}
                  onChange={(e) => setConfigTemp(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#182138] flex items-center justify-end gap-2 bg-[#090d17]">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#141b2e] hover:bg-[#1a233b] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

