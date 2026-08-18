import React, { useState } from 'react';
import { 
  Menu, 
  ArrowLeft, 
  Home as HomeIcon,
  ChevronDown,
  Layers,
  CheckCircle2,
  Folder,
  FileText,
  Tag,
  Share2
} from 'lucide-react';
import { Project } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
}

export const ProjectSummaryScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const displayDescription =
    project.description ||
    'Padre, madre o cuidador de un niño con diagnóstico de TEA que necesita entender mejor qué puede estar comunicando su conducta y saber cómo responder de forma práctica y personalizada en situaciones cotidianas difíciles';

  return (
    <div 
      className="w-full min-h-screen bg-[#090b11] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-summary-screen-root"
    >
      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="resumen"
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          if (onNavigateModule) onNavigateModule(mod);
        }}
        onNavigateHome={onNavigateHome}
      />

      {/* Top App Header Navigation Bar matching Screenshot 1 */}
      <header className="sticky top-0 z-30 bg-[#090c15]/95 backdrop-blur-md border-b border-[#141824] px-4 py-3">
        <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              id="btn-summary-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Volver button */}
            <button
              onClick={onBack}
              id="btn-summary-top-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            {/* Home Icon */}
            <button
              onClick={onNavigateHome}
              id="btn-summary-top-home"
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
        
        {/* Title Header */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-wider text-[#6366f1] uppercase">
            RESUMEN
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {project.name}
          </h1>
          <p className="text-[#8e9cb5] text-xs sm:text-[13px] leading-relaxed font-normal pt-1">
            {displayDescription}
          </p>
        </div>

        {/* 2x2 Stat Cards Grid matching Image 1 */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Card 1: PANTALLAS */}
          <div className="bg-[#101423] border border-[#1b2238] rounded-2xl p-4 flex flex-col justify-between h-[105px] shadow-md shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold tracking-wider text-[#7988a3] uppercase">
                PANTALLAS
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#18203c] flex items-center justify-center text-[#818cf8]">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-black text-white leading-none">
              1
            </span>
          </div>

          {/* Card 2: TERMINADAS */}
          <div className="bg-[#101423] border border-[#1b2238] rounded-2xl p-4 flex flex-col justify-between h-[105px] shadow-md shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold tracking-wider text-[#7988a3] uppercase">
                TERMINADAS
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#122822] flex items-center justify-center text-[#34d399]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-black text-white leading-none">
              0 (0%)
            </span>
          </div>

          {/* Card 3: FLUJOS */}
          <div className="bg-[#101423] border border-[#1b2338] rounded-2xl p-4 flex flex-col justify-between h-[105px] shadow-md shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold tracking-wider text-[#7988a3] uppercase">
                FLUJOS
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#13243a] flex items-center justify-center text-[#38bdf8]">
                <Folder className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-black text-white leading-none">
              1
            </span>
          </div>

          {/* Card 4: DOCS GLOBALES */}
          <div className="bg-[#101423] border border-[#1b2238] rounded-2xl p-4 flex flex-col justify-between h-[105px] shadow-md shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold tracking-wider text-[#7988a3] uppercase">
                DOCS GLOBALES
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#25173a] flex items-center justify-center text-[#c084fc]">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-black text-white leading-none">
              0 / 6
            </span>
          </div>
        </div>

        {/* Copy listo Pill Tag matching Image 1 */}
        <div className="pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241a0e] border border-[#4a3512] text-[#f59e0b] text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span>Copy listo · 1</span>
          </div>
        </div>

        {/* TODAS LAS PANTALLAS Section matching Image 1 */}
        <div className="pt-2 space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#637189]">
            TODAS LAS PANTALLAS
          </h2>

          <div 
            onClick={() => onNavigateModule && onNavigateModule('pantallas')}
            className="bg-[#101423] hover:bg-[#14192d] border border-[#1b2238] hover:border-[#2f3b60] rounded-2xl p-4 sm:p-5 space-y-3 transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f87171]">
                PRIORIDAD ALTA
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              Splash
            </h3>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241a0e] border border-[#4a3512] text-[#f59e0b] text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                <span>Copy listo</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
