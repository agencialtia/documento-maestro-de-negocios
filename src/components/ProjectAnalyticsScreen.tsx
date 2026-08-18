import React, { useState } from 'react';
import {
  Menu,
  ArrowLeft,
  Home as HomeIcon,
  BarChart3,
  Activity,
  Sparkles,
  Download,
  CheckCircle2,
  Layers,
  Compass,
  Search,
  Filter,
  FileCode,
  FileType,
  Copy,
  Check,
  Zap,
  Target
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Project, AnalyticsTrackingPlanData, AnalyticsEventItem } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { generateAutomatedTrackingPlan } from '../utils/ecosystemEngine';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectAnalyticsScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'funnels' | 'northstar'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTool, setFilterTool] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Inherit North Star directly from Contexto 1.2 "metrica_exito"
  const masterSections = project.masterStrategyDoc?.sections || {};
  const contexto = masterSections['contexto'] || {};
  const inheritedNorthStar = contexto.metrica_exito || 'Tasa de retención semanal de familias activas (>65%)';

  // Initialize or read Tracking Plan
  const [trackingData, setTrackingData] = useState<AnalyticsTrackingPlanData>(() => {
    if (project.analyticsData && project.analyticsData.events) {
      return {
        ...project.analyticsData,
        northStarMetric: inheritedNorthStar,
      };
    }
    return generateAutomatedTrackingPlan(project);
  });

  const handleUpdateTracking = (updated: AnalyticsTrackingPlanData) => {
    setTrackingData(updated);
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        analyticsData: updated,
      });
    }
  };

  const handleGenerateTrackingPlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateAutomatedTrackingPlan(project);
      handleUpdateTracking(generated);
      setIsGenerating(false);
      setNotice(`Tracking Plan generado con ${generated.events.length} eventos y funnels sincronizados.`);
      setTimeout(() => setNotice(null), 3000);
    }, 600);
  };

  const handleExportMarkdown = () => {
    let md = `# TRACKING PLAN & INSTRUMENTACIÓN — ${project.name.toUpperCase()}\n\n`;
    md += `**North Star Metric:** ${trackingData.northStarMetric}\n`;
    md += `**Total Eventos Instrumentados:** ${trackingData.events.length}\n`;
    md += `**Fecha de última sincronización:** ${new Date().toLocaleDateString()}\n\n`;
    md += `---\n\n## 1. Catálogo de Eventos (Event Taxonomy)\n\n`;
    md += `| Evento | Pantalla | Trigger | Propiedades | Herramienta | Objetivo |\n`;
    md += `|---|---|---|---|---|---|\n`;

    trackingData.events.forEach((evt) => {
      md += `| \`${evt.name}\` | ${evt.screenName} | ${evt.trigger} | \`${evt.properties.join(', ')}\` | ${evt.suggestedTool || 'PostHog'} | ${evt.eventGoal} |\n`;
    });

    md += `\n---\n\n## 2. Funnels de Conversión Clave\n\n`;
    trackingData.funnels.forEach((f) => {
      md += `### ${f.name}\n`;
      md += `Pasos: ${f.steps.map((s, i) => `${i + 1}. \`${s}\``).join(' → ')}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}_tracking_plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotice('Tracking Plan exportado a Markdown.');
    setTimeout(() => setNotice(null), 2500);
  };

  const handleExportCSV = () => {
    let csv = `Evento,Pantalla,Trigger,Propiedades,Herramienta,Objetivo,FunnelStage\n`;
    trackingData.events.forEach((evt) => {
      const line = [
        `"${evt.name}"`,
        `"${evt.screenName}"`,
        `"${evt.trigger.replace(/"/g, '""')}"`,
        `"${evt.properties.join('; ')}"`,
        `"${evt.suggestedTool || 'PostHog'}"`,
        `"${evt.eventGoal.replace(/"/g, '""')}"`,
        `"${evt.funnelStage || 'General'}"`,
      ].join(',');
      csv += line + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}_tracking_plan.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotice('Tracking Plan exportado a CSV.');
    setTimeout(() => setNotice(null), 2500);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const margin = 14;
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 18;

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(`TRACKING PLAN & ANALÍTICA — ${project.name.toUpperCase()}`, margin, 12);
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`North Star: ${trackingData.northStarMetric} | Total Eventos: ${trackingData.events.length}`, margin, 19);

      y = 34;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Event Taxonomy (Primeros 15 eventos):', margin, y);
      y += 6;

      trackingData.events.slice(0, 15).forEach((evt) => {
        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`[${evt.suggestedTool || 'PostHog'}] ${evt.name} — ${evt.screenName}`, margin, y);
        y += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Trigger: ${evt.trigger} | Props: ${evt.properties.join(', ')}`, margin, y);
        y += 5.5;
      });

      doc.save(`${project.name}_tracking_plan.pdf`);
      setNotice('Documento PDF generado exitosamente.');
      setTimeout(() => setNotice(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredEvents = trackingData.events.filter((evt) => {
    const matchTool = filterTool === 'all' || evt.suggestedTool === filterTool;
    const matchQuery =
      searchQuery === '' ||
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.screenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.trigger.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTool && matchQuery;
  });

  const isReady = trackingData.events.length > 0;

  return (
    <div
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-analytics-root"
    >
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="analitica"
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
              id="btn-analytics-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              id="btn-analytics-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              id="btn-analytics-home"
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
              <div className="w-12 h-12 rounded-2xl bg-[#1a2342] border border-[#2b396a] flex items-center justify-center text-[#38bdf8] shrink-0 shadow-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white tracking-tight">Analítica & Instrumentación</h1>
                  {isReady ? (
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
                  Tracking plan, eventos automáticos por transiciones de pantalla, funnels y North Star Metric.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleGenerateTrackingPlan}
                disabled={isGenerating}
                id="btn-generate-tracking"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-sky-950/40"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Sincronizando...' : 'Generar Tracking Plan'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                id="btn-export-analytics-md"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#161c33] hover:bg-[#20294b] border border-[#27335e] text-[#a5b4fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Exportar Markdown"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">.MD</span>
              </button>

              <button
                onClick={handleExportCSV}
                id="btn-export-analytics-csv"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#161c33] hover:bg-[#20294b] border border-[#27335e] text-[#a5b4fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Exportar CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={handleExportPDF}
                id="btn-export-analytics-pdf"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#161c33] hover:bg-[#20294b] border border-[#27335e] text-[#a5b4fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
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
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Eventos</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Funnels</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">North Star Metric</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Tracking Plan</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Dependencias: <strong className="text-white">Solución + Journeys + Pantallas</strong></span>
              <span>Eventos: <strong className="text-white">{trackingData.events.length}</strong></span>
            </div>
          </div>
        </div>

        {/* NORTH STAR METRIC CARD (HEREDADA DEL DOCUMENTO MAESTRO) */}
        <div className="bg-gradient-to-br from-[#0c142b] to-[#0e101f] border border-[#233159] rounded-2xl p-5 shadow-xl relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
                <Target className="w-4 h-4 text-sky-400" />
                North Star Metric (Heredada de Contexto 1.2)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {inheritedNorthStar}
              </h3>
              <p className="text-xs text-slate-400">
                Esta métrica se sincroniza automáticamente con la &quot;Métrica Principal de Éxito&quot; del Documento Maestro.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule && onNavigateModule('maestro')}
              className="text-xs font-semibold text-sky-300 hover:text-white underline cursor-pointer shrink-0"
            >
              Editar en Maestro →
            </button>
          </div>
        </div>

        {notice && (
          <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#1b2340] pb-2">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                : 'text-slate-400 hover:text-white hover:bg-[#121629]'
            }`}
          >
            Event Taxonomy ({trackingData.events.length})
          </button>
          <button
            onClick={() => setActiveTab('funnels')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'funnels'
                ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                : 'text-slate-400 hover:text-white hover:bg-[#121629]'
            }`}
          >
            Funnels ({trackingData.funnels.length})
          </button>
        </div>

        {/* Tab 1: Event Taxonomy */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Search & Tool Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar evento, pantalla o trigger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111628] border border-[#1e2746] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <select
                value={filterTool}
                onChange={(e) => setFilterTool(e.target.value)}
                className="bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las Herramientas</option>
                <option value="PostHog">PostHog</option>
                <option value="Mixpanel">Mixpanel</option>
                <option value="GA4">GA4</option>
                <option value="Amplitude">Amplitude</option>
              </select>
            </div>

            {/* Events List */}
            <div className="space-y-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-[#0d1120] border border-[#1b2340] hover:border-[#2b396a] rounded-2xl p-4 transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-sky-800/60">
                        {evt.name}
                      </span>
                      <span className="text-[11px] text-slate-400">Pantalla: <strong className="text-white">{evt.screenName}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {evt.suggestedTool || 'PostHog'}
                      </span>
                      {evt.funnelStage && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#161c35] text-slate-300 border border-[#25305c]">
                          {evt.funnelStage}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <p><strong className="text-slate-400">Trigger:</strong> {evt.trigger}</p>
                    <p><strong className="text-slate-400">Objetivo:</strong> {evt.eventGoal}</p>
                  </div>

                  <div className="pt-2 border-t border-[#182038] flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-medium">Propiedades:</span>
                    {evt.properties.map((p, idx) => (
                      <code key={idx} className="bg-[#12162a] text-slate-300 px-1.5 py-0.5 rounded border border-[#21294d] text-[10px]">
                        {p}
                      </code>
                    ))}
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="p-8 text-center bg-[#0e1222] border border-[#1b223d] rounded-2xl text-slate-400 text-xs">
                  No se encontraron eventos con los filtros seleccionados.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Funnels */}
        {activeTab === 'funnels' && (
          <div className="space-y-4">
            {trackingData.funnels.map((funnel) => (
              <div
                key={funnel.id}
                className="bg-[#0d1120] border border-[#1b2340] rounded-2xl p-5 space-y-3"
              >
                <h4 className="text-sm font-bold text-white">{funnel.name}</h4>
                <div className="flex flex-wrap items-center gap-2">
                  {funnel.steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="bg-[#12162a] border border-[#212a4f] rounded-xl px-3 py-1.5 text-xs font-mono text-sky-300">
                        <span className="text-slate-500 mr-1.5 font-sans font-bold">{idx + 1}.</span>
                        {step}
                      </div>
                      {idx < funnel.steps.length - 1 && (
                        <span className="text-slate-600 font-bold">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};
