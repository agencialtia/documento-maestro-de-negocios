import React, { useState } from 'react';
import {
  Menu,
  ArrowLeft,
  Home as HomeIcon,
  CheckCircle2,
  AlertCircle,
  Bug,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Sparkles,
  Download,
  Check,
  Clock,
  ShieldAlert,
  FileCode,
  FileType,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Project, TestCaseItem, BugItem, QATestingData } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { checkQAModuleStatus, generateAutomatedTestCases } from '../utils/ecosystemEngine';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectQAScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'bugs' | 'stats'>('tests');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterScreen, setFilterScreen] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<BugItem | null>(null);

  const screens = project.screensData?.screens || [];
  const qaStatus = checkQAModuleStatus(project);

  // Initialize or read QA Data
  const [qaData, setQaData] = useState<QATestingData>(() => {
    if (project.qaTesting && project.qaTesting.testCases) {
      return project.qaTesting;
    }
    return {
      testCases: generateAutomatedTestCases(screens),
      bugs: [
        {
          id: 'bug-1',
          title: 'Latencia al cargar el plan de desescalada sin conexión',
          description: 'Si el dispositivo pierde cobertura, el fallback local demora 4 segundos en responder en lugar de ser instantáneo.',
          screenId: screens[0]?.id || 'screen-1',
          screenName: screens[0]?.name || 'Dashboard',
          severity: 'Menor',
          status: 'En revisión',
          date: new Date().toLocaleDateString(),
          assignee: 'Frontend Engineer',
          affectedVersion: 'v1.0.0-beta',
        },
      ],
      lastGeneratedAt: new Date().toISOString(),
    };
  });

  // Bug Form state
  const [bugForm, setBugForm] = useState<Partial<BugItem>>({
    title: '',
    description: '',
    screenId: screens[0]?.id || '',
    severity: 'Mayor',
    status: 'Abierto',
    assignee: 'QA Lead',
    affectedVersion: 'v1.0.0',
  });

  const handleUpdateQA = (updated: QATestingData) => {
    setQaData(updated);
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        qaTesting: updated,
      });
    }
  };

  const handleGenerateAutomatedTests = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateAutomatedTestCases(screens);
      const updated: QATestingData = {
        ...qaData,
        testCases: generated,
        lastGeneratedAt: new Date().toISOString(),
      };
      handleUpdateQA(updated);
      setIsGenerating(false);
      setNotice(`Se han generado y vinculado ${generated.length} casos de prueba para ${screens.length} pantallas.`);
      setTimeout(() => setNotice(null), 3000);
    }, 600);
  };

  const handleToggleTestCaseStatus = (caseId: string) => {
    const updatedCases = qaData.testCases.map((c) => {
      if (c.id === caseId) {
        const nextStatus: TestCaseItem['status'] =
          c.status === 'Terminada' ? 'En desarrollo' : c.status === 'En desarrollo' ? 'Pendiente' : 'Terminada';
        return { ...c, status: nextStatus, isOutdated: false };
      }
      return c;
    });

    handleUpdateQA({
      ...qaData,
      testCases: updatedCases,
    });
  };

  const handleSaveBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugForm.title?.trim()) return;

    const matchedScreen = screens.find((s) => s.id === bugForm.screenId);
    const screenName = matchedScreen ? matchedScreen.name : 'Pantalla General';

    if (editingBug) {
      const updatedBugs = qaData.bugs.map((b) =>
        b.id === editingBug.id
          ? ({
              ...b,
              ...bugForm,
              screenName,
            } as BugItem)
          : b
      );
      handleUpdateQA({ ...qaData, bugs: updatedBugs });
    } else {
      const newBug: BugItem = {
        id: `bug-${Date.now()}`,
        title: bugForm.title || '',
        description: bugForm.description || '',
        screenId: bugForm.screenId || screens[0]?.id || 'general',
        screenName,
        severity: bugForm.severity || 'Mayor',
        status: bugForm.status || 'Abierto',
        date: new Date().toLocaleDateString(),
        assignee: bugForm.assignee || 'Equipo Dev',
        affectedVersion: bugForm.affectedVersion || 'v1.0.0',
      };
      handleUpdateQA({ ...qaData, bugs: [newBug, ...qaData.bugs] });
    }

    setIsBugModalOpen(false);
    setEditingBug(null);
    setBugForm({
      title: '',
      description: '',
      screenId: screens[0]?.id || '',
      severity: 'Mayor',
      status: 'Abierto',
      assignee: 'QA Lead',
      affectedVersion: 'v1.0.0',
    });
  };

  const handleDeleteBug = (bugId: string) => {
    const updated = qaData.bugs.filter((b) => b.id !== bugId);
    handleUpdateQA({ ...qaData, bugs: updated });
  };

  const handleExportMarkdown = () => {
    let md = `# SUITE DE QA & TESTING — ${project.name.toUpperCase()}\n\n`;
    md += `**Fecha de generación:** ${new Date().toLocaleDateString()}\n`;
    md += `**Total pantallas:** ${screens.length} | **Casos de prueba:** ${qaData.testCases.length}\n`;
    md += `**Bugs críticos abiertos:** ${qaStatus.openCriticalBugs}\n\n`;
    md += `---\n\n## 1. Casos de Prueba por Pantalla\n\n`;

    qaData.testCases.forEach((tc) => {
      md += `### [${tc.type.toUpperCase()}] ${tc.title}\n`;
      md += `- **Pantalla:** ${tc.screenName} (${tc.screenId})\n`;
      md += `- **Estado:** ${tc.status}\n`;
      md += `- **Propósito:** ${tc.description}\n`;
      if (tc.preconditions) md += `- **Precondiciones:** ${tc.preconditions}\n`;
      md += `- **Pasos:**\n`;
      tc.steps.forEach((s) => {
        md += `  ${s}\n`;
      });
      md += `- **Resultado esperado:** ${tc.expectedResult}\n\n`;
    });

    md += `---\n\n## 2. Registro de Bugs e Incidencias\n\n`;
    qaData.bugs.forEach((b) => {
      md += `### [${b.severity}] ${b.title} (${b.status})\n`;
      md += `- **Pantalla:** ${b.screenName}\n`;
      md += `- **Responsable:** ${b.assignee} | **Fecha:** ${b.date}\n`;
      md += `- **Descripción:** ${b.description}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}_qa_testing_report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotice('Informe de QA exportado a Markdown.');
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
      doc.text(`INFORME DE QA & TESTING — ${project.name.toUpperCase()}`, margin, 12);
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Pantallas: ${screens.length} | Casos: ${qaData.testCases.length} | Bugs Críticos: ${qaStatus.openCriticalBugs}`, margin, 19);

      y = 32;

      qaData.testCases.slice(0, 15).forEach((tc) => {
        if (y > doc.internal.pageSize.getHeight() - 25) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`${tc.title} (${tc.screenName})`, margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`Resultado: ${tc.expectedResult}`, margin, y);
        y += 6;
      });

      doc.save(`${project.name}_qa_testing.pdf`);
      setNotice('Documento PDF generado exitosamente.');
      setTimeout(() => setNotice(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter test cases
  const filteredCases = qaData.testCases.filter((tc) => {
    const matchType = filterType === 'all' || tc.type === filterType;
    const matchScreen = filterScreen === 'all' || tc.screenId === filterScreen;
    const matchQuery =
      searchQuery === '' ||
      tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.screenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchScreen && matchQuery;
  });

  return (
    <div
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-qa-root"
    >
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="qa"
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
              id="btn-qa-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              id="btn-qa-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              id="btn-qa-home"
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
              <div className="w-12 h-12 rounded-2xl bg-[#1a2342] border border-[#2b396a] flex items-center justify-center text-[#34d399] shrink-0 shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white tracking-tight">QA & Testing</h1>
                  {qaStatus.status === 'actualizado' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                      🟢 Actualizado
                    </span>
                  ) : qaStatus.status === 'desactualizado' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                      🟡 Desactualizado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      ⚪ Vacío
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8e9bb0] mt-1">
                  Casos de prueba automáticos por pantalla, caminos felices, validaciones de error y tracker de bugs.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleGenerateAutomatedTests}
                disabled={isGenerating || screens.length === 0}
                id="btn-generate-qa-tests"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/40 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generando...' : 'Generar Pruebas'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                id="btn-export-qa-md"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#161c33] hover:bg-[#20294b] border border-[#27335e] text-[#a5b4fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Exportar Markdown"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar .MD</span>
              </button>

              <button
                onClick={handleExportPDF}
                id="btn-export-qa-pdf"
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
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Casos de Prueba</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Criterios de Aceptación</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Bugs & Regresión</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Accesibilidad WCAG</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Dependencias: <strong className="text-white">Pantallas + Arquitectura</strong></span>
              <span>Cobertura: <strong className="text-white">{qaStatus.screensWithTests}/{screens.length} Pantallas</strong></span>
            </div>
          </div>
        </div>

        {/* State Banner with Critical Bug Warning */}
        {qaStatus.openCriticalBugs > 0 && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-rose-200">
                Bloqueo Crítico para Lanzamiento: {qaStatus.openCriticalBugs} Bug(s) Crítico(s) Abierto(s)
              </h4>
              <p className="text-rose-300/80 leading-relaxed">
                Ningún proyecto puede considerarse Listo para Lanzamiento mientras existan fallos con severidad crítica sin resolver.
              </p>
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
        <div className="flex items-center justify-between border-b border-[#1b2340] pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                  : 'text-slate-400 hover:text-white hover:bg-[#121629]'
              }`}
            >
              Casos de Prueba ({qaData.testCases.length})
            </button>
            <button
              onClick={() => setActiveTab('bugs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bugs'
                  ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                  : 'text-slate-400 hover:text-white hover:bg-[#121629]'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span>Bugs Tracker ({qaData.bugs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                  : 'text-slate-400 hover:text-white hover:bg-[#121629]'
              }`}
            >
              Métricas & Cobertura
            </button>
          </div>

          {activeTab === 'bugs' && (
            <button
              onClick={() => {
                setEditingBug(null);
                setBugForm({
                  title: '',
                  description: '',
                  screenId: screens[0]?.id || '',
                  severity: 'Mayor',
                  status: 'Abierto',
                  assignee: 'QA Lead',
                  affectedVersion: 'v1.0.0',
                });
                setIsBugModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1a2342] hover:bg-[#25325c] border border-[#2c3a6b] text-[#818cf8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Reportar Bug</span>
            </button>
          )}
        </div>

        {/* Tab 1: Test Cases */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar caso de prueba o pantalla..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111628] border border-[#1e2746] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los Tipos</option>
                <option value="happy_path">Camino Feliz</option>
                <option value="error_path">Caso de Error</option>
                <option value="edge_case">Caso Borde</option>
                <option value="accessibility">Accesibilidad</option>
              </select>

              <select
                value={filterScreen}
                onChange={(e) => setFilterScreen(e.target.value)}
                className="bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las Pantallas</option>
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Case Cards List */}
            <div className="space-y-3">
              {filteredCases.map((tc) => (
                <div
                  key={tc.id}
                  className={`bg-[#0d1120] border rounded-2xl p-4 transition-all space-y-3 ${
                    tc.isOutdated
                      ? 'border-amber-700/60 bg-amber-950/10'
                      : tc.status === 'Terminada'
                      ? 'border-[#1b2340] hover:border-[#2b396a]'
                      : 'border-[#1e2746]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          tc.type === 'happy_path'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : tc.type === 'error_path'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : tc.type === 'edge_case'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {tc.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-white">{tc.title}</span>
                      {tc.isOutdated && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-700">
                          Desactualizado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Pantalla: <strong className="text-white">{tc.screenName}</strong></span>
                      <button
                        onClick={() => handleToggleTestCaseStatus(tc.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          tc.status === 'Terminada'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : tc.status === 'En desarrollo'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {tc.status}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{tc.description}</p>

                  {/* Steps */}
                  <div className="bg-[#12162a] rounded-xl p-3 text-xs space-y-1">
                    <span className="text-[11px] font-bold text-[#818cf8] uppercase tracking-wider block">
                      Pasos de Ejecución:
                    </span>
                    <ul className="space-y-1 text-slate-300 pl-2">
                      {tc.steps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-[#1b2344] mt-2 flex items-start gap-1.5 text-slate-200">
                      <strong className="text-emerald-400 shrink-0">Resultado Esperado:</strong>
                      <span>{tc.expectedResult}</span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCases.length === 0 && (
                <div className="p-8 text-center bg-[#0e1222] border border-[#1b223d] rounded-2xl text-slate-400 text-xs">
                  No se encontraron casos de prueba con los filtros aplicados.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Bug Tracker */}
        {activeTab === 'bugs' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {qaData.bugs.map((bug) => (
                <div
                  key={bug.id}
                  className="bg-[#0d1120] border border-[#1b2340] hover:border-[#2b396a] rounded-2xl p-4 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          bug.severity === 'Crítico'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : bug.severity === 'Mayor'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Severidad: {bug.severity}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{bug.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                          bug.status === 'Resuelto'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : bug.status === 'En revisión'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {bug.status}
                      </span>
                      <button
                        onClick={() => {
                          setEditingBug(bug);
                          setBugForm(bug);
                          setIsBugModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#141a2e] hover:bg-[#1f2845] text-slate-400 hover:text-white cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBug(bug.id)}
                        className="p-1.5 rounded-lg bg-[#141a2e] hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{bug.description}</p>

                  <div className="pt-2 border-t border-[#182038] flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center gap-3">
                      <span>Pantalla: <strong className="text-white">{bug.screenName}</strong></span>
                      <span>Asignado: <strong className="text-white">{bug.assignee}</strong></span>
                    </div>
                    <div>
                      <span>Versión: {bug.affectedVersion} | {bug.date}</span>
                    </div>
                  </div>
                </div>
              ))}

              {qaData.bugs.length === 0 && (
                <div className="p-8 text-center bg-[#0e1222] border border-[#1b223d] rounded-2xl text-slate-400 text-xs">
                  🎉 ¡No hay bugs reportados en este momento!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Metrics */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0e1222] border border-[#1b2340] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Cobertura de Casos de Prueba</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Pantallas con pruebas completas</span>
                  <strong>{qaStatus.screensWithTests} de {screens.length}</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-[#141a2e] overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${screens.length > 0 ? (qaStatus.screensWithTests / screens.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-2 border-t border-[#182038]">
                Regla SCREENOS: Para considerarse 🟢 Actualizado, el % de cobertura debe igualar o superar al % de pantallas marcadas como Terminadas.
              </p>
            </div>

            <div className="bg-[#0e1222] border border-[#1b2340] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Estado de Bugs</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#141a2e] p-2.5 rounded-xl border border-[#222c4d]">
                  <span className="text-xs text-rose-400 font-bold block">Críticos</span>
                  <strong className="text-lg text-white">{qaStatus.openCriticalBugs}</strong>
                </div>
                <div className="bg-[#141a2e] p-2.5 rounded-xl border border-[#222c4d]">
                  <span className="text-xs text-amber-400 font-bold block">Mayores</span>
                  <strong className="text-lg text-white">{qaStatus.openMajorBugs}</strong>
                </div>
                <div className="bg-[#141a2e] p-2.5 rounded-xl border border-[#222c4d]">
                  <span className="text-xs text-emerald-400 font-bold block">Menores</span>
                  <strong className="text-lg text-white">{qaStatus.openMinorBugs}</strong>
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-2 border-t border-[#182038]">
                Cero bugs críticos abiertos es un prerrequisito no negociable para habilitar la insignia de Listo para Lanzamiento.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Modal for Bug Reporting / Editing */}
      {isBugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0e1222] border border-[#1d2645] rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">
              {editingBug ? 'Editar Bug' : 'Reportar Nueva Incidencia / Bug'}
            </h3>

            <form onSubmit={handleSaveBug} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título del Bug</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Error 500 al enviar formulario de pago"
                  value={bugForm.title}
                  onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                  className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pantalla Asociada</label>
                  <select
                    value={bugForm.screenId}
                    onChange={(e) => setBugForm({ ...bugForm, screenId: e.target.value })}
                    className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {screens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Severidad</label>
                  <select
                    value={bugForm.severity}
                    onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value as any })}
                    className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Crítico">🔴 Crítico (Bloquea Lanzamiento)</option>
                    <option value="Mayor">🟡 Mayor</option>
                    <option value="Menor">🟢 Menor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estado</label>
                  <select
                    value={bugForm.status}
                    onChange={(e) => setBugForm({ ...bugForm, status: e.target.value as any })}
                    className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Abierto">Abierto</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={bugForm.assignee}
                    onChange={(e) => setBugForm({ ...bugForm, assignee: e.target.value })}
                    className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción y Pasos para Reproducir</label>
                <textarea
                  rows={3}
                  value={bugForm.description}
                  onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                  placeholder="Describe qué ocurre, qué debería ocurrir y cómo reproducirlo..."
                  className="w-full bg-[#111628] border border-[#1e2746] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBugModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white cursor-pointer shadow-md shadow-indigo-950"
                >
                  {editingBug ? 'Guardar Cambios' : 'Registrar Bug'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
