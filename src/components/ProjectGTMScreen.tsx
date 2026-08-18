import React, { useState } from 'react';
import {
  Menu,
  ArrowLeft,
  Home as HomeIcon,
  Rocket,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  FileCode,
  FileType,
  Smartphone,
  Globe,
  Share2,
  Users,
  Target,
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Project, GoToMarketData } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import {
  checkCommercialModelComplete,
  checkLegalModuleStatus,
  checkQAModuleStatus,
  generateAutomatedGTMPlan
} from '../utils/ecosystemEngine';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectGTMScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'timeline' | 'channels' | 'store'>('checklist');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const masterSections = project.masterStrategyDoc?.sections || {};
  const contexto = masterSections['contexto'] || {};
  const vehiculo = contexto.vehiculo_principal || project.category || 'App';
  const isApp = String(vehiculo).toLowerCase().includes('app') || project.category === 'Apps';

  const commStatus = checkCommercialModelComplete(project);
  const legalStatus = checkLegalModuleStatus(project);
  const qaStatus = checkQAModuleStatus(project);

  const isLocked = !commStatus.complete;

  // Initialize or read GTM Data
  const [gtmData, setGtmData] = useState<GoToMarketData>(() => {
    if (project.goToMarket && project.goToMarket.timeline) {
      return project.goToMarket;
    }
    return generateAutomatedGTMPlan(project);
  });

  const handleUpdateGTM = (updated: GoToMarketData) => {
    setGtmData(updated);
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        goToMarket: updated,
      });
    }
  };

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const plan = generateAutomatedGTMPlan(project);
      handleUpdateGTM(plan);
      setIsGenerating(false);
      setNotice('Estrategia de Go-to-Market, cronograma y canales regenerados exitosamente.');
      setTimeout(() => setNotice(null), 3000);
    }, 600);
  };

  const handleToggleChecklistItem = (key: keyof GoToMarketData['launchChecklist']) => {
    const updated = {
      ...gtmData,
      launchChecklist: {
        ...gtmData.launchChecklist,
        [key]: !gtmData.launchChecklist[key],
      },
    };
    handleUpdateGTM(updated);
  };

  const handleExportMarkdown = () => {
    let md = `# ESTRATEGIA DE GO-TO-MARKET — ${project.name.toUpperCase()}\n\n`;
    md += `**Vehículo de Entrega:** ${vehiculo}\n`;
    md += `**Fecha:** ${new Date().toLocaleDateString()}\n\n`;

    md += `---\n\n## 1. Cronograma y Fases de Lanzamiento\n\n`;
    gtmData.timeline.forEach((t) => {
      md += `### ${t.phase}: ${t.title} (${t.duration})\n`;
      md += `- **Responsable:** ${t.responsible}\n`;
      md += `- **Riesgos y mitigación:** ${t.risks}\n`;
      md += `- **Hitos clave:**\n`;
      t.milestones.forEach((m) => {
        md += `  - ${m}\n`;
      });
      md += `\n`;
    });

    md += `---\n\n## 2. Canales de Adquisición Prioritarios\n\n`;
    gtmData.acquisitionChannels.forEach((ch) => {
      md += `### [Prioridad ${ch.priority}] ${ch.channel}\n`;
      md += `- **Estrategia:** ${ch.strategy}\n`;
      md += `- **Métrica objetivo:** ${ch.targetMetric}\n\n`;
    });

    if (isApp && gtmData.storeListingCopy) {
      md += `---\n\n## 3. Store Listing Copy (ASO & Tiendas)\n\n`;
      md += `- **Nombre en Tienda:** ${gtmData.storeListingCopy.appName}\n`;
      md += `- **Subtítulo:** ${gtmData.storeListingCopy.subtitle}\n`;
      md += `- **Descripción corta:** ${gtmData.storeListingCopy.shortDescription}\n`;
      md += `- **Keywords:** ${gtmData.storeListingCopy.keywords.join(', ')}\n\n`;
      md += `**Descripción completa:**\n${gtmData.storeListingCopy.fullDescription}\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}_go_to_market_plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotice('Plan de Go-to-Market exportado a Markdown.');
    setTimeout(() => setNotice(null), 2500);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margin = 14;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;
      let y = 18;

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(`PLAN GO-TO-MARKET — ${project.name.toUpperCase()}`, margin, 12);
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Vehículo: ${vehiculo} | Fecha: ${new Date().toLocaleDateString()}`, margin, 19);

      y = 34;

      gtmData.timeline.forEach((t) => {
        if (y > doc.internal.pageSize.getHeight() - 35) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${t.phase}: ${t.title} (${t.duration})`, margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        t.milestones.forEach((m) => {
          doc.text(`• ${m}`, margin + 3, y);
          y += 4;
        });
        y += 4;
      });

      doc.save(`${project.name}_go_to_market.pdf`);
      setNotice('Documento PDF generado exitosamente.');
      setTimeout(() => setNotice(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-gtm-root"
    >
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="gtm"
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          if (onNavigateModule) onNavigateModule(mod);
        }}
        onNavigateHome={onNavigateHome}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#090c15]/95 backdrop-blur-md border-b border-[#151b2e] px-4 py-3">
        <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              id="btn-gtm-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              id="btn-gtm-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              id="btn-gtm-home"
              className="p-1.5 rounded-lg bg-[#141a2e] hover:bg-[#1f2845] text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Ir a Inicio"
            >
              <HomeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[420px] sm:max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Module Header Card (SCREENOS Standard) */}
        <div className="bg-[#0e1222] border border-[#1b223d] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#1a2342] border border-[#2b396a] flex items-center justify-center text-[#f43f5e] shrink-0 shadow-lg">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white tracking-tight">Go-to-Market (GTM)</h1>
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                      🔴 Bloqueado
                    </span>
                  ) : gtmData.lastGeneratedAt ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                      🟢 Actualizado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      ⚪ Vacío
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8e9bb0] mt-1">
                  Estrategia de lanzamiento, canales de adquisición, cronograma de salida y checklist de lanzamiento.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleGeneratePlan}
                disabled={isLocked || isGenerating}
                id="btn-generate-gtm"
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isLocked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-900/30'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generando...' : 'Generar Plan GTM'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                disabled={isLocked}
                id="btn-export-gtm-md"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#161c33] hover:bg-[#20294b] border border-[#27335e] text-[#a5b4fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Exportar Markdown"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">.MD</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isLocked}
                id="btn-export-gtm-pdf"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#161c33] hover:bg-[#20294b] border border-[#27335e] text-[#a5b4fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Exportar PDF"
              >
                <FileType className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

          {/* Tags & Metadata */}
          <div className="mt-4 pt-3 border-t border-[#182038] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8e9bb0]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Calendario de Lanzamiento</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Canales de Adquisición</span>
              {isApp && (
                <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Store Listing (ASO)</span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Checklist de Salida</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Dependencias: <strong className="text-white">Copy + Legal + QA + Analytics</strong></span>
              <span>Canales: <strong className="text-white">{gtmData.acquisitionChannels.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Feedback Alert if blocked */}
        {isLocked && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-rose-200">Go-to-Market Bloqueado por Pricing Incompleto</h4>
              <p className="text-rose-300/80 leading-relaxed">
                El plan de adquisición requiere tener definidos la estructura de precios, CAC estimado, LTV estimado y margen objetivo en el Documento Maestro (Contexto 1.5).
              </p>
              <button
                onClick={() => onNavigateModule && onNavigateModule('maestro')}
                className="mt-1 text-xs font-bold text-rose-300 underline hover:text-white cursor-pointer"
              >
                Ir a Pricing & Unit Economics →
              </button>
            </div>
          </div>
        )}

        {notice && (
          <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#1b2340] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                : 'text-slate-400 hover:text-white hover:bg-[#121629]'
            }`}
          >
            Checklist de Lanzamiento
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                : 'text-slate-400 hover:text-white hover:bg-[#121629]'
            }`}
          >
            Cronograma ({gtmData.timeline.length} Fases)
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                : 'text-slate-400 hover:text-white hover:bg-[#121629]'
            }`}
          >
            Canales de Adquisición ({gtmData.acquisitionChannels.length})
          </button>
          {isApp && (
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'store'
                  ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                  : 'text-slate-400 hover:text-white hover:bg-[#121629]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#34d399]" />
              <span>Store Listing & ASO</span>
            </button>
          )}
        </div>

        {/* Tab 1: Interactive Launch Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="bg-[#0d1120] border border-[#1b2340] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Requisitos Críticos para Salida a Producción</h3>
                <span className="text-xs text-slate-400">
                  {Object.values(gtmData.launchChecklist).filter(Boolean).length}/8 satisfechos
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                {[
                  {
                    key: 'legalListo',
                    label: '1. Legal & Compliance al día (sin bloqueos ni pendientes)',
                    statusText: legalStatus.status === 'actualizado' ? '🟢 Listo' : '🔴 Pendiente',
                  },
                  {
                    key: 'qaListo',
                    label: '2. QA & Testing sin bugs críticos y 100% caminos felices probados',
                    statusText: qaStatus.isCompliant ? '🟢 Listo' : '🟡 Revisar',
                  },
                  {
                    key: 'analiticaInstrumentada',
                    label: '3. Tracking Plan instrumentado y North Star validada',
                    statusText: project.analyticsData?.lastGeneratedAt ? '🟢 Listo' : '⚪ Pendiente',
                  },
                  {
                    key: 'pricingValidado',
                    label: '4. Pricing & Unit Economics completo (CAC, LTV, Margen)',
                    statusText: commStatus.complete ? '🟢 Listo' : '🔴 Incompleto',
                  },
                  {
                    key: 'landingPublicada',
                    label: '5. Landing Page optimizada con captura de leads',
                    statusText: '🟢 Listo',
                  },
                  {
                    key: 'secuenciasActivas',
                    label: '6. Secuencias de email de bienvenida y activación configuradas',
                    statusText: '🟢 Listo',
                  },
                  {
                    key: 'canalesDefinidos',
                    label: '7. Canales de adquisición con métricas y presupuesto definidos',
                    statusText: '🟢 Listo',
                  },
                  {
                    key: 'activosCriticosActualizados',
                    label: '8. Todos los activos downstream sincronizados con el Maestro',
                    statusText: '🟢 Listo',
                  },
                ].map((item) => {
                  const isChecked = gtmData.launchChecklist[item.key as keyof GoToMarketData['launchChecklist']];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start justify-between gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#141a2e] border-[#25325c] text-slate-200'
                          : 'bg-[#101424] border-[#1e243a] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleChecklistItem(item.key as keyof GoToMarketData['launchChecklist'])}
                          className="mt-0.5 rounded border-slate-700 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium leading-snug">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-bold shrink-0">{item.statusText}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Timeline & Milestones */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {gtmData.timeline.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#0d1120] border border-[#1b2340] rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-md border border-rose-800/60">
                      {item.phase}
                    </span>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {item.duration}
                  </span>
                </div>

                <div className="space-y-1 pl-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Hitos Principales:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {item.milestones.map((m, mIdx) => (
                      <li key={mIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#182038] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>Responsable: <strong className="text-white">{item.responsible}</strong></span>
                  <span>Riesgo / Mitigación: <strong className="text-slate-300">{item.risks}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Acquisition Channels */}
        {activeTab === 'channels' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {gtmData.acquisitionChannels.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-[#0d1120] border border-[#1b2340] rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ch.channel}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ch.priority === 'Alta'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        Prioridad {ch.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ch.strategy}</p>
                  </div>

                  <div className="pt-2 border-t border-[#182038] text-[11px] text-emerald-300">
                    <strong>Objetivo:</strong> {ch.targetMetric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Store Listing (ASO) for Apps */}
        {isApp && activeTab === 'store' && gtmData.storeListingCopy && (
          <div className="bg-[#0d1120] border border-[#1b2340] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Optimización para App Store & Google Play (ASO)
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre en Tienda (Title)</label>
                <input
                  type="text"
                  value={gtmData.storeListingCopy.appName}
                  onChange={(e) => {
                    if (gtmData.storeListingCopy) {
                      handleUpdateGTM({
                        ...gtmData,
                        storeListingCopy: { ...gtmData.storeListingCopy, appName: e.target.value },
                      });
                    }
                  }}
                  className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subtítulo (Subtitle / Tagline)</label>
                <input
                  type="text"
                  value={gtmData.storeListingCopy.subtitle}
                  onChange={(e) => {
                    if (gtmData.storeListingCopy) {
                      handleUpdateGTM({
                        ...gtmData,
                        storeListingCopy: { ...gtmData.storeListingCopy, subtitle: e.target.value },
                      });
                    }
                  }}
                  className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción Corta (80 caracteres)</label>
                <input
                  type="text"
                  value={gtmData.storeListingCopy.shortDescription}
                  onChange={(e) => {
                    if (gtmData.storeListingCopy) {
                      handleUpdateGTM({
                        ...gtmData,
                        storeListingCopy: { ...gtmData.storeListingCopy, shortDescription: e.target.value },
                      });
                    }
                  }}
                  className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción Completa (Markdown)</label>
                <textarea
                  rows={6}
                  value={gtmData.storeListingCopy.fullDescription}
                  onChange={(e) => {
                    if (gtmData.storeListingCopy) {
                      handleUpdateGTM({
                        ...gtmData,
                        storeListingCopy: { ...gtmData.storeListingCopy, fullDescription: e.target.value },
                      });
                    }
                  }}
                  className="w-full bg-[#111628] border border-[#1e2746] rounded-xl p-3 text-xs text-white font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plan de Screenshots (Visual Storytelling)</label>
                <ul className="space-y-1 text-xs text-slate-300 bg-[#12162a] p-3 rounded-xl">
                  {gtmData.storeListingCopy.screenshotPlan.map((s, idx) => (
                    <li key={idx}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
