import React, { useState } from 'react';
import {
  ArrowLeft,
  Home as HomeIcon,
  Menu,
  ChevronDown,
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  ExternalLink,
  ChevronRight,
  Check,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { Project, AttachedDocument } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { calculateGroundingMetrics, detectMasterDocContradictions } from '../utils/groundingService';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (moduleKey: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

interface ModuleHealthItem {
  id: string;
  name: string;
  progress: number;
  groundedPercentage: number;
  targetModule: string;
  sectionKey?: string;
}

interface GeneratedAssetStatus {
  id: string;
  name: string;
  status: 'Desactualizado' | 'No generado' | 'Actualizado';
  targetModule?: string;
}

export const ProjectHealthScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load real state from localStorage or project
  const masterDocData = (() => {
    const saved = localStorage.getItem(`screenos_master_doc_${project.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return project.masterStrategyDoc?.sections || {};
  })();

  const groundingMetadata = (() => {
    const saved = localStorage.getItem(`screenos_master_doc_meta_${project.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return project.masterStrategyDoc?.groundingMetadata || {};
  })();

  const attachedDocs: AttachedDocument[] = (() => {
    const saved = localStorage.getItem('screenos_attached_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  })();

  // Compute live metrics and contradictions
  const metrics = calculateGroundingMetrics(masterDocData, groundingMetadata);
  const contradictions = detectMasterDocContradictions(masterDocData, project, attachedDocs);

  // Dynamic Module health breakdown
  const moduleHealthList: ModuleHealthItem[] = metrics.sectionBreakdown.map((sec) => ({
    id: sec.sectionKey,
    name: sec.sectionTitle,
    progress: sec.completionPercentage,
    groundedPercentage: sec.groundedPercentage,
    targetModule: 'maestro',
    sectionKey: sec.sectionKey,
  }));

  // Add Pantallas row
  const screensProgress = project.screensCount && project.screensCount > 0 ? 100 : 0;
  moduleHealthList.push({
    id: 'pantallas',
    name: 'Pantallas y Flujos',
    progress: screensProgress,
    groundedPercentage: screensProgress,
    targetModule: 'pantallas',
  });

  // Generated assets status
  const generatedAssets: GeneratedAssetStatus[] = [
    { id: 'prd', name: 'PRD', status: metrics.completionPercentage > 60 ? 'Actualizado' : 'Desactualizado', targetModule: 'activos' },
    { id: 'landing', name: 'Landing Copy', status: metrics.completionPercentage > 40 ? 'Actualizado' : 'Desactualizado', targetModule: 'activos' },
    { id: 'copy', name: 'Copywriting & Mensajes', status: metrics.groundedPercentage > 50 ? 'Actualizado' : 'Desactualizado', targetModule: 'activos' },
    { id: 'emails', name: 'Emails de Bienvenida', status: 'No generado', targetModule: 'activos' },
    { id: 'pantallas', name: 'Wireframes y Pantallas', status: screensProgress > 0 ? 'Actualizado' : 'No generado', targetModule: 'pantallas' },
    { id: 'prompts', name: 'Prompts Especializados', status: 'Actualizado', targetModule: 'prompts' },
    { id: 'compendio', name: 'Compendio Estratégico', status: metrics.completionPercentage > 80 ? 'Actualizado' : 'Desactualizado', targetModule: 'activos' },
  ];

  // Next Best Action Calculation
  const nextBestAction = (() => {
    if (contradictions.length > 0) {
      return {
        title: `Resolver ${contradictions.length} inconsistencias detectadas en el Documento Maestro.`,
        module: 'maestro',
      };
    }
    const lowestSec = metrics.sectionBreakdown.find((s) => s.completionPercentage < 50);
    if (lowestSec) {
      return {
        title: `Completar y fundamentar el bloque "${lowestSec.sectionTitle}" del Documento Maestro.`,
        module: 'maestro',
      };
    }
    if (screensProgress === 0) {
      return {
        title: 'Diseñar la estructura inicial de Pantallas y Flujos del producto.',
        module: 'pantallas',
      };
    }
    return {
      title: 'Exportar activos y compendio estratégico final para producción.',
      module: 'activos',
    };
  })();

  const handleNextActionClick = () => {
    if (onNavigateModule) {
      onNavigateModule(nextBestAction.module);
    }
  };

  const handleModuleClick = (item: ModuleHealthItem) => {
    if (onNavigateModule) {
      onNavigateModule(item.targetModule);
    }
  };

  const handleAssetClick = (asset: GeneratedAssetStatus) => {
    if (asset.targetModule && onNavigateModule) {
      onNavigateModule(asset.targetModule);
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-health-root"
    >
      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="salud"
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
        <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              id="btn-health-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Volver button */}
            <button
              onClick={onBack}
              id="btn-health-top-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            {/* Home Icon */}
            <button
              onClick={onNavigateHome}
              id="btn-health-top-home"
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
        
        {/* Header Title Section */}
        <section className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#22c55e]" />
            <span className="text-[11px] font-bold tracking-wider text-[#22c55e] uppercase">
              CENTRO DE SALUD DEL PROYECTO
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Estado real del proyecto
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Visión consolidada del progreso, la fundamentación documental y la próxima mejor acción.
          </p>
        </section>

        {/* PRÓXIMA MEJOR ACCIÓN */}
        <section
          onClick={handleNextActionClick}
          id="card-next-best-action"
          className="bg-[#0b1020] hover:bg-[#0e152c] border border-[#1d2747] hover:border-[#324379] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-lg group"
        >
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#161d3b] border border-[#27356b] flex items-center justify-center text-[#818cf8] shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#818cf8]" />
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#818cf8] uppercase tracking-wider block">
                PRÓXIMA MEJOR ACCIÓN
              </span>
              <p className="text-sm sm:text-[15px] font-bold text-white leading-snug group-hover:text-slate-100 transition-colors">
                {nextBestAction.title}
              </p>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-[#818cf8] shrink-0 group-hover:translate-x-1 transition-transform" />
        </section>

        {/* 6 KPI Metric Cards Grid */}
        <section className="space-y-2.5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Metric 1: Doc Maestro */}
            <div className="bg-[#0b0f1d] border border-[#182038] rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#818cf8]" />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  DOC MAESTRO
                </span>
              </div>
              <span className="text-2xl font-black text-[#818cf8]">{metrics.completionPercentage}%</span>
            </div>

            {/* Metric 2: % Fundamentado */}
            <div className="bg-[#0b0f1d] border border-[#182038] rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  % FUNDAMENTADO
                </span>
              </div>
              <span className="text-2xl font-black text-emerald-400">{metrics.groundedPercentage}%</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Metric 3: Inconsistencias */}
            <div className="bg-[#0b0f1d] border border-[#182038] rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <AlertTriangle className={`w-3.5 h-3.5 ${contradictions.length > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  INCONSISTENCIAS
                </span>
              </div>
              <span className={`text-2xl font-black ${contradictions.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {contradictions.length}
              </span>
            </div>

            {/* Metric 4: Campos vacíos / sin validar */}
            <div className="bg-[#0b0f1d] border border-[#182038] rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f87171]" />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  CAMPOS PENDIENTES
                </span>
              </div>
              <span className="text-2xl font-black text-[#f87171]">{metrics.emptyFieldsCount}</span>
            </div>
          </div>

          {/* Row 3: Cobertura de Evidencia Documental */}
          <div className="bg-[#0b0f1d] border border-[#182038] rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  COBERTURA DE LA BASE DE CONOCIMIENTO
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {metrics.groundedFieldsCount} / {metrics.totalFieldsCount} campos
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#141b2e] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${metrics.groundedPercentage}%` }}
              />
            </div>
          </div>
        </section>

        {/* SALUD POR MÓDULO */}
        <section className="bg-[#090d18] border border-[#182038] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SALUD Y FUNDAMENTACIÓN POR MÓDULO
            </span>
            <span className="text-[10px] text-slate-500">Progreso / Evidencia</span>
          </div>

          <div className="space-y-4">
            {moduleHealthList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleModuleClick(item)}
                id={`module-health-${item.id}`}
                className="space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="text-slate-200 group-hover:text-white font-medium transition-colors">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={item.progress >= 70 ? 'text-emerald-400' : 'text-slate-300'}>
                      {item.progress}%
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 text-[11px]">
                      {item.groundedPercentage}% ev.
                    </span>
                  </div>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-1.5 bg-[#141b2e] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${item.groundedPercentage}%` }}
                  />
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, item.progress - item.groundedPercentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ESTADO DE ACTIVOS GENERADOS */}
        <section className="bg-[#090d18] border border-[#182038] rounded-2xl p-4 sm:p-5 space-y-3.5 pb-10">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#818cf8]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ESTADO DE ACTIVOS GENERADOS
            </span>
          </div>

          <div className="space-y-2">
            {generatedAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                id={`asset-status-${asset.id}`}
                className="bg-[#0d1222] hover:bg-[#11172c] border border-[#182038] hover:border-[#263359] rounded-xl px-4 py-3 flex items-center justify-between transition-all cursor-pointer group"
              >
                <span className="text-xs sm:text-[13px] font-bold text-white group-hover:text-slate-100 transition-colors">
                  {asset.name}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      asset.status === 'Desactualizado'
                        ? 'text-[#f87171]'
                        : asset.status === 'No generado'
                        ? 'text-slate-500'
                        : 'text-emerald-400'
                    }`}
                  >
                    {asset.status}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
