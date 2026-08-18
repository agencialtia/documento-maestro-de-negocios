import React, { useState } from 'react';
import { 
  Menu, 
  ArrowLeft, 
  Home as HomeIcon,
  ChevronDown,
  Pencil,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
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
  X,
  Download,
  ShieldCheck,
  Plus,
  CheckCircle2,
  BarChart3,
  Rocket
} from 'lucide-react';
import { Project } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { NewProjectModal } from './NewProjectModal';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectDetailScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(
    project.description ||
      'Padre, madre o cuidador de un niño con diagnóstico de TEA que necesita entender mejor qué puede estar comunicando su conducta y saber cómo responder de forma práctica y personalizada en situaciones cotidianas difíciles'
  );
  const [openedModule, setOpenedModule] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    if (
      cardId === 'resumen' ||
      cardId === 'prompts' ||
      cardId === 'comentarios' ||
      cardId === 'maestro' ||
      cardId === 'arquitectura' ||
      cardId === 'pantallas' ||
      cardId === 'activos' ||
      cardId === 'salud' ||
      cardId === 'agentes' ||
      cardId === 'legal' ||
      cardId === 'qa' ||
      cardId === 'analitica' ||
      cardId === 'gtm'
    ) {
      if (onNavigateModule) {
        onNavigateModule(cardId);
        return;
      }
    }
    setOpenedModule(cardId);
  };

  const displayDescription =
    project.description ||
    'Padre, madre o cuidador de un niño con diagnóstico de TEA que necesita entender mejor qué puede estar comunicando su conducta y saber cómo responder de forma práctica y personalizada en situaciones cotidianas difíciles';

  const handleCopyAll = () => {
    const textToCopy = `Proyecto: ${project.name}\nCategoría: ${project.category}\nDescripción: ${displayDescription}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        name: editName,
        description: editDescription,
      });
    }
    setIsEditModalOpen(false);
  };

  const navCards = [
    {
      id: 'resumen',
      title: 'Resumen del Proyecto',
      subtitle: 'Estado, progreso, salud estratégica y próxima acción.',
      icon: <Layers className="w-5 h-5 text-[#818cf8]" />,
      iconBg: 'bg-[#18203d]',
      arrowColor: 'text-[#818cf8]',
    },
    {
      id: 'prompts',
      title: 'Prompts a Utilizar',
      subtitle: 'Repositorio oficial de prompts para generar tus activos.',
      icon: <Wand2 className="w-5 h-5 text-[#f472b6]" />,
      iconBg: 'bg-[#291629]',
      arrowColor: 'text-[#f472b6]',
    },
    {
      id: 'comentarios',
      title: 'Comentarios de Redes Sociales',
      subtitle: 'Repositorio de investigación cualitativa: YouTube, Facebook, Instagram y TikTok.',
      icon: <MessageSquare className="w-5 h-5 text-[#2dd4bf]" />,
      iconBg: 'bg-[#13282c]',
      arrowColor: 'text-[#2dd4bf]',
    },
    {
      id: 'maestro',
      title: 'Documento Maestro',
      subtitle: 'Fuente única de verdad estratégica del proyecto.',
      icon: <Zap className="w-5 h-5 text-[#fbbf24]" />,
      iconBg: 'bg-[#2b2413]',
      arrowColor: 'text-[#fbbf24]',
    },
    {
      id: 'arquitectura',
      title: 'Arquitectura del Producto',
      subtitle: 'Capacidades, módulos, funcionalidades y requisitos.',
      icon: <Folder className="w-5 h-5 text-[#38bdf8]" />,
      iconBg: 'bg-[#13243a]',
      arrowColor: 'text-[#38bdf8]',
    },
    {
      id: 'pantallas',
      title: 'Pantallas y Flujos',
      subtitle: 'Journeys, navegación, flujos y pantallas del producto.',
      icon: <Monitor className="w-5 h-5 text-[#34d399]" />,
      iconBg: 'bg-[#122822]',
      arrowColor: 'text-[#34d399]',
    },
    {
      id: 'activos',
      title: 'Activos del Proyecto',
      subtitle: 'PRD, landing pages, emails, anuncios y entregables.',
      icon: <FileText className="w-5 h-5 text-[#fb7185]" />,
      iconBg: 'bg-[#2c1722]',
      arrowColor: 'text-[#fb7185]',
    },
    {
      id: 'compendio',
      title: 'Compendio de la App',
      subtitle: 'Compila y exporta toda la documentación vigente.',
      icon: <BookOpen className="w-5 h-5 text-[#c084fc]" />,
      iconBg: 'bg-[#25173a]',
      arrowColor: 'text-[#c084fc]',
    },
    {
      id: 'legal',
      title: 'Legal & Compliance',
      subtitle: 'Términos, privacidad, datos sensibles, RGPD y licencias.',
      icon: <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />,
      iconBg: 'bg-[#0e273c]',
      arrowColor: 'text-[#38bdf8]',
    },
    {
      id: 'qa',
      title: 'QA & Testing',
      subtitle: 'Casos de prueba (happy/error/edge), control de bugs y cobertura.',
      icon: <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />,
      iconBg: 'bg-[#102b1f]',
      arrowColor: 'text-[#4ade80]',
    },
    {
      id: 'analitica',
      title: 'Analítica & Instrumentación',
      subtitle: 'Plan de tracking de eventos, funnels de conversión y North Star.',
      icon: <BarChart3 className="w-5 h-5 text-[#f59e0b]" />,
      iconBg: 'bg-[#2d2212]',
      arrowColor: 'text-[#f59e0b]',
    },
    {
      id: 'gtm',
      title: 'Go-to-Market',
      subtitle: 'Estrategia de lanzamiento, canales de distribución y checklist.',
      icon: <Rocket className="w-5 h-5 text-[#ec4899]" />,
      iconBg: 'bg-[#331427]',
      arrowColor: 'text-[#ec4899]',
    },
    {
      id: 'salud',
      title: 'Centro de Salud',
      subtitle: 'Estado real del proyecto, inconsistencias y próxima mejor acción.',
      icon: <Activity className="w-5 h-5 text-[#4ade80]" />,
      iconBg: 'bg-[#122b20]',
      arrowColor: 'text-[#4ade80]',
    },
    {
      id: 'agentes',
      title: 'Agentes',
      subtitle: 'Copilotos especializados que combinan tus prompts y el Documento Maestro.',
      icon: <Bot className="w-5 h-5 text-[#a78bfa]" />,
      iconBg: 'bg-[#22183d]',
      arrowColor: 'text-[#a78bfa]',
    },
  ];

  return (
    <div 
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-detail-root"
    >
      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule={openedModule || 'resumen'}
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          handleCardClick(mod);
        }}
        onNavigateHome={onNavigateHome}
      />

      {/* Top App Header Navigation Bar matching Screenshot 1 */}
      <header className="sticky top-0 z-30 bg-[#090c15]/95 backdrop-blur-md border-b border-[#151b2e] px-4 py-3">
        <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              id="btn-project-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Volver button */}
            <button
              onClick={onBack}
              id="btn-project-top-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            {/* Home Icon */}
            <button
              onClick={onNavigateHome}
              id="btn-project-top-home"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Ir al inicio"
            >
              <HomeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl px-4 sm:px-5 pt-6 pb-16 mx-auto space-y-5">
        
        {/* Breadcrumb Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#6366f1] uppercase">
            <span>SCREENOS</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">HOME</span>
          </div>

          {/* Project Title & Edit Button */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.name}
            </h1>
            <button
              onClick={() => setIsEditModalOpen(true)}
              id="btn-edit-project-header"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#111628] hover:bg-[#18213b] border border-[#222c4a] text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-[#8e9cb5] text-xs sm:text-[13px] leading-relaxed font-normal pt-1">
            {displayDescription}
          </p>

          {/* Copiar todo Button */}
          <div className="pt-2">
            <button
              onClick={handleCopyAll}
              id="btn-copy-all-project"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111628] hover:bg-[#18213b] border border-[#1f2845] text-slate-200 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar todo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid Rows matching Screenshot 1 & 2 */}
        <div className="space-y-2.5 pt-1">
          {/* Row 1: 3 columns */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3 sm:p-4 flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-black text-white leading-none">1</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1">Pantallas</span>
            </div>
            <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3 sm:p-4 flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-black text-[#10b981] leading-none">0</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1">Terminadas</span>
            </div>
            <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3 sm:p-4 flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-black text-[#818cf8] leading-none">0</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1">En desarrollo</span>
            </div>
          </div>

          {/* Row 2: 1 column (Flujos) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3 sm:p-4 flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-black text-white leading-none">1</span>
              <span className="text-[11px] font-medium text-slate-400 mt-1">Flujos</span>
            </div>
          </div>

          {/* Banner: Próxima Mejor Acción matching Screenshot 1 */}
          <div className="bg-[#0e1322] border border-[#202a4b] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-start gap-3">
              {/* Star / Sparkle Icon */}
              <div className="w-9 h-9 rounded-xl bg-[#1c1d3b] border border-[#2f315f] flex items-center justify-center text-[#a78bfa] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#818cf8] block">
                  PRÓXIMA MEJOR ACCIÓN
                </span>
                <h3 className="text-sm font-bold text-white leading-snug">
                  Completar el bloque "Mercado" del Documento Maestro.
                </h3>

                <div className="pt-1">
                  <button
                    onClick={() => setOpenedModule('salud')}
                    id="btn-ver-centro-salud"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131b34] hover:bg-[#1a2548] border border-[#2b3765] text-[#a5b4fc] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Ver Centro de Salud</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: 2 columns (Documento Maestro %, Pantallas ratio) matching Screenshot 2 */}
          <div className="grid grid-cols-2 gap-2.5">
            <div 
              onClick={() => handleCardClick('maestro')}
              className="bg-[#0e1322] hover:bg-[#12182c] border border-[#1b233d] hover:border-[#384878] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-center cursor-pointer transition-all group"
            >
              <span className="text-xl sm:text-2xl font-black text-[#f87171] leading-none">2%</span>
              <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 mt-1">Documento Maestro</span>
            </div>
            <div 
              onClick={() => handleCardClick('pantallas')}
              className="bg-[#0e1322] hover:bg-[#12182c] border border-[#1b233d] hover:border-[#384878] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-center cursor-pointer transition-all group"
            >
              <span className="text-xl sm:text-2xl font-black text-[#34d399] leading-none">0/1</span>
              <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 mt-1">Pantallas</span>
            </div>
          </div>

          {/* Row 4: Full width (Pendiente / Investigación) matching Screenshot 2 */}
          <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-center">
            <span className="text-base sm:text-lg font-bold text-slate-200 leading-none">Pendiente</span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">Investigación</span>
          </div>
        </div>

        {/* Navigation Section Title matching Screenshot 2 & 3 */}
        <div className="pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#6c7893] mb-3">
            NAVEGACIÓN PRINCIPAL
          </h2>

          {/* List of 10 Navigation Cards */}
          <div className="space-y-3">
            {navCards.map((card) => (
              <div
                key={card.id}
                id={`card-nav-${card.id}`}
                onClick={() => handleCardClick(card.id)}
                className="bg-[#0e1322] hover:bg-[#12182c] border border-[#1b233d] hover:border-[#2f3d6b] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md shadow-black/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg} border border-white/5`}>
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-white group-hover:text-[#a5b4fc] transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[12px] text-[#7d8ca6] font-normal leading-relaxed truncate sm:whitespace-normal">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <div className={`${card.arrowColor} shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sm font-bold`}>
                  →
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Module Detail Modal View */}
      {openedModule && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setOpenedModule(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#0e1322] border border-[#212b4b] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a233e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#161e38] border border-[#28355c]">
                  {navCards.find(c => c.id === openedModule)?.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {navCards.find(c => c.id === openedModule)?.title}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {project.name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setOpenedModule(null)}
                className="w-8 h-8 rounded-lg bg-[#141b30] hover:bg-[#1f2845] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Module Content */}
            {openedModule === 'prompts' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Prompts recomendados para {project.name}:</p>
                <div className="space-y-2">
                  <div className="bg-[#07090e] p-3 rounded-xl border border-[#1b233d]">
                    <span className="font-bold text-pink-400">Prompt de Arquitectura:</span>
                    <p className="text-slate-300 mt-1 font-mono text-[11px]">
                      Diseña la solución técnica y el mapa de componentes para {project.name} optimizado para móvil.
                    </p>
                  </div>
                  <div className="bg-[#07090e] p-3 rounded-xl border border-[#1b233d]">
                    <span className="font-bold text-pink-400">Prompt de UI/UX:</span>
                    <p className="text-slate-300 mt-1 font-mono text-[11px]">
                      Crea la interfaz de usuario con tema oscuro, accesibilidad WCAG y retroalimentación táctil inmediata.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {openedModule === 'maestro' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Documento Maestro sincronizado:</p>
                <div className="bg-[#07090e] p-3.5 rounded-xl border border-[#1b233d] space-y-2">
                  <div className="font-bold text-amber-400">Estructura del Proyecto</div>
                  <div className="text-slate-300 leading-relaxed">
                    <strong>Objetivo:</strong> {displayDescription}
                  </div>
                  <div className="text-slate-300">
                    <strong>Categoría:</strong> {project.category}
                  </div>
                </div>
              </div>
            )}

            {openedModule === 'salud' && (
              <div className="space-y-3 text-xs">
                <div className="bg-[#07090e] p-3 rounded-xl border border-[#1b233d] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">Estado de Salud</span>
                    <span className="text-emerald-400 font-bold">92% Óptimo</span>
                  </div>
                  <p className="text-slate-300">
                    Próxima acción recomendada: Completar el bloque "Mercado" del Documento Maestro.
                  </p>
                </div>
              </div>
            )}

            {openedModule !== 'prompts' && openedModule !== 'maestro' && openedModule !== 'salud' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="bg-[#07090e] p-4 rounded-xl border border-[#1b233d] space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Módulo Activo y Conectado</span>
                  </div>
                  <p className="leading-relaxed">
                    Este módulo está sincronizado con el espacio de trabajo de <strong>{project.name}</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setOpenedModule(null)}
                className="px-4 py-2 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal with AI Description Generator */}
      <NewProjectModal
        isOpen={isEditModalOpen}
        category={project.category}
        projectToEdit={project}
        onClose={() => setIsEditModalOpen(false)}
        onSaveProject={(updated) => {
          if (onUpdateProject) {
            onUpdateProject(updated);
          }
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
};
