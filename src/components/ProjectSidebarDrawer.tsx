import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Home, 
  Layers, 
  Wand2, 
  MessageSquare, 
  Zap, 
  Folder, 
  Monitor, 
  FileText, 
  BookOpen, 
  Activity, 
  Bot, 
  ChevronDown, 
  Plus, 
  Trash2, 
  FolderPlus,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Rocket
} from 'lucide-react';
import { Project } from '../types';

interface Props {
  isOpen: boolean;
  project: Project;
  activeModule: string;
  onClose: () => void;
  onSelectModule: (moduleId: string) => void;
  onNavigateHome: () => void;
}

export const ProjectSidebarDrawer: React.FC<Props> = ({
  isOpen,
  project,
  activeModule,
  onClose,
  onSelectModule,
  onNavigateHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [flows, setFlows] = useState<string[]>(['Splash']);
  const [isFlowsOpen, setIsFlowsOpen] = useState(true);

  if (!isOpen) return null;

  const navItems = [
    { id: 'resumen', label: 'Resumen del Proyecto', icon: <Layers className="w-4 h-4 text-[#818cf8]" /> },
    { id: 'prompts', label: 'Prompts a Utilizar', icon: <Wand2 className="w-4 h-4 text-[#f472b6]" /> },
    { id: 'comentarios', label: 'Comentarios de Redes Sociales', icon: <MessageSquare className="w-4 h-4 text-[#2dd4bf]" /> },
    { id: 'maestro', label: 'Documento Maestro', icon: <Zap className="w-4 h-4 text-[#fbbf24]" /> },
    { id: 'arquitectura', label: 'Arquitectura del Producto', icon: <Folder className="w-4 h-4 text-[#38bdf8]" /> },
    { id: 'pantallas', label: 'Pantallas y Flujos', icon: <Monitor className="w-4 h-4 text-[#34d399]" /> },
    { id: 'activos', label: 'Activos del Proyecto', icon: <FileText className="w-4 h-4 text-[#fb7185]" /> },
    { id: 'compendio', label: 'Compendio de la App', icon: <BookOpen className="w-4 h-4 text-[#c084fc]" /> },
    { id: 'legal', label: 'Legal & Compliance', icon: <ShieldCheck className="w-4 h-4 text-[#38bdf8]" /> },
    { id: 'qa', label: 'QA & Testing', icon: <CheckCircle2 className="w-4 h-4 text-[#4ade80]" /> },
    { id: 'analitica', label: 'Analítica & Instrumentación', icon: <BarChart3 className="w-4 h-4 text-[#f59e0b]" /> },
    { id: 'gtm', label: 'Go-to-Market', icon: <Rocket className="w-4 h-4 text-[#ec4899]" /> },
    { id: 'salud', label: 'Centro de Salud', icon: <Activity className="w-4 h-4 text-[#4ade80]" /> },
    { id: 'agentes', label: 'Agentes', icon: <Bot className="w-4 h-4 text-[#a78bfa]" /> },
  ];

  const globalDocs = [
    'Landing',
    'Oferta',
    'PRD',
    'Roadmap',
    'Investigación',
    'Comentarios de usuarios',
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newScreenName = prompt('Nombre de la nueva pantalla:')?.trim();
    if (newScreenName) {
      setFlows((prev) => [...prev, newScreenName]);
    }
  };

  const handleAddFlow = () => {
    const newFlowName = prompt('Nombre del nuevo flujo:')?.trim();
    if (newFlowName) {
      setFlows((prev) => [...prev, `${newFlowName} (Inicio)`]);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      id="sidebar-drawer-overlay"
      onClick={onClose}
    >
      <aside 
        className="w-[300px] sm:w-[320px] max-w-[85vw] h-full bg-[#0b0e19] border-r border-[#1d243e] flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto"
        id="sidebar-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-[#181f36] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              id="btn-drawer-back"
              className="text-xs font-semibold text-[#8e9bb0] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>← Volver</span>
            </button>
          </div>
          <button
            onClick={onClose}
            id="btn-drawer-close"
            className="w-7 h-7 rounded-lg bg-[#141a2e] hover:bg-[#1c2440] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Name Header */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#182038] border border-[#273258] flex items-center justify-center text-[#818cf8]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-[15px] font-bold text-white truncate">
            {project.name}
          </h2>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-drawer-search"
              placeholder="Buscar pantalla..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111628] border border-[#1e2746] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6366f1] transition-all"
            />
          </div>
        </div>

        {/* Main Nav Items */}
        <div className="flex-1 px-3 py-2 space-y-0.5">
          {/* Home Link */}
          <button
            onClick={() => {
              onClose();
              onNavigateHome();
            }}
            id="btn-nav-home"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#141b30] transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#818cf8]" />
            <span>Home</span>
          </button>

          {filteredNavItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1a213c] text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#13192c]'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* FLUX / FLUJO PRINCIPAL Section */}
          <div className="pt-4 pb-1">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <button
                onClick={() => setIsFlowsOpen(!isFlowsOpen)}
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#6c7893] uppercase hover:text-slate-300 transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${isFlowsOpen ? '' : '-rotate-90'}`} />
                <span>FLUJO PRINCIPAL</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddScreen}
                  title="Añadir pantalla al flujo"
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isFlowsOpen && (
              <div className="space-y-0.5 pl-2">
                {flows.map((screen, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectModule('pantallas');
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#13192c] transition-colors cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 shrink-0" />
                    <span className="truncate">{screen}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NUEVO FLUJO BUTTON */}
          <div className="pt-1 px-1">
            <button
              onClick={handleAddFlow}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#222c4d] hover:border-[#3d4d82] text-[#818cf8] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>NUEVO FLUJO</span>
            </button>
          </div>

          {/* DOCUMENTOS GLOBALES Section */}
          <div className="pt-5 pb-2">
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#6c7893] uppercase">
              DOCUMENTOS GLOBALES
            </div>
            <div className="space-y-0.5">
              {globalDocs.map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectModule('activos');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#8e9bb0] hover:text-white hover:bg-[#13192c] transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{doc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </aside>
    </div>
  );
};
