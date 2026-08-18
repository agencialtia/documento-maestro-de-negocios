import React, { useState } from 'react';
import {
  ArrowLeft,
  Home as HomeIcon,
  Menu,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Copy,
  Check,
  Zap,
  BookOpen,
  FileText,
  Monitor,
  Globe,
  Mail,
  Code,
  Layers,
  Box,
  Download,
  Cpu,
  Sparkles,
  ShieldAlert,
  ExternalLink,
  Save,
  CheckCircle2,
  X,
  RefreshCw,
  Send,
  Sliders,
  FileCode,
  Eye,
  FileDown
} from 'lucide-react';
import { Project } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (moduleKey: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

interface AssetCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  status: 'actualizado' | 'bloqueado' | 'desactualizado' | 'vacio';
  statusText: string;
  advanceText?: string;
  bannerType: 'sync' | 'alert' | 'update' | 'empty';
  bannerText: string;
  tags: string[];
  dependencies: string;
  requirements?: string;
  completitud?: string;
  version?: string;
  lastUpdated?: string;
  hasGenerateBtn?: boolean;
  hasOpenBtn?: boolean;
  hasExportBtn?: boolean;
  moduleTarget?: string;
}

export const ProjectAssetsScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Accordion state - default first few or clicked card expanded
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'doc-maestro': true,
  });

  // Modal states for assets that aren't dedicated whole screens
  const [activeModalAsset, setActiveModalAsset] = useState<AssetCardData | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'generate' | 'export'>('view');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copiedModalContent, setCopiedModalContent] = useState(false);

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyAll = () => {
    const assetSummary = `=== ACTIVOS DEL PROYECTO: ${project.name} ===
Categoría: ${project.category}
Doc Maestro: 2% avance (Sincronizado)
Pantallas: ${project.screensData?.screens?.length || 2} pantallas creadas
PRD: Especificación Funcional
Copy: Microcopy, Emails, Ads y Onboarding
Landing Page: Hero, Beneficios, CTA
Secuencias: Funnel de Emails (Bienvenida, Onboarding, Venta)
Prompts: Repositorio para Cursor, Claude, GPT
Arquitectura: Módulos, Entidades y Modelo de Datos
Biblioteca: Branding, Colores, Iconos
Exportaciones: Markdown, PDF, DOCX, JSON
Centro de IA: Motor generativo`;

    navigator.clipboard.writeText(assetSummary);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSave = () => {
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
      });
    }
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Asset list specification exactly matching screenshots 1-13
  const assets: AssetCardData[] = [
    {
      id: 'doc-maestro',
      title: 'Documento Maestro',
      description: 'Fuente única de verdad. Toda la estrategia del proyecto en un solo lugar.',
      icon: <BookOpen className="w-5 h-5 text-[#c084fc]" />,
      iconBg: 'bg-[#25173a]',
      status: 'actualizado',
      statusText: 'Actualizado',
      advanceText: '2% avance',
      bannerType: 'sync',
      bannerText: 'Sincronizado con el Documento Maestro.',
      tags: ['Contexto', 'Mercado', 'Audiencia', 'Mecanismo', 'Transformación', 'Posicionamiento'],
      dependencies: 'Ninguna (fuente única de verdad)',
      completitud: '2%',
      version: 'v1',
      hasOpenBtn: true,
      hasExportBtn: true,
      hasGenerateBtn: false,
      moduleTarget: 'maestro',
    },
    {
      id: 'prd',
      title: 'PRD',
      description: 'Convierte el Documento Maestro en la especificación funcional del producto.',
      icon: <FileText className="w-5 h-5 text-[#60a5fa]" />,
      iconBg: 'bg-[#16233d]',
      status: 'bloqueado',
      statusText: 'Bloqueado',
      bannerType: 'alert',
      bannerText: 'Requiere Documento Maestro completado al 40%.',
      tags: ['Objetivo', 'Alcance', 'Funcionalidades', 'Requisitos', 'User Stories', 'Criterios de aceptación', 'Roadmap'],
      dependencies: 'Documento Maestro',
      requirements: 'Requiere Documento Maestro completado al 40%.',
      version: 'v1',
      hasOpenBtn: true,
      hasGenerateBtn: true,
      hasExportBtn: true,
    },
    {
      id: 'pantallas',
      title: 'Pantallas',
      description: 'Documentación funcional de todas las pantallas del producto.',
      icon: <Monitor className="w-5 h-5 text-[#34d399]" />,
      iconBg: 'bg-[#122822]',
      status: 'actualizado',
      statusText: 'Actualizado',
      advanceText: '0% avance',
      bannerType: 'sync',
      bannerText: 'Sincronizado con el Documento Maestro.',
      tags: ['Objetivo', 'Pregunta clave', 'Flujo', 'UX Writing', 'Estados', 'Acciones', 'Validaciones'],
      dependencies: 'Documento Maestro',
      requirements: 'Requiere al menos un flujo y pantallas creadas.',
      completitud: '0%',
      version: 'v1',
      hasOpenBtn: true,
      hasGenerateBtn: true,
      hasExportBtn: true,
      moduleTarget: 'pantallas',
    },
    {
      id: 'copy',
      title: 'Copy',
      description: 'Generador de mensajes: app, landing, marketing y ventas.',
      icon: <FileText className="w-5 h-5 text-[#60a5fa]" />,
      iconBg: 'bg-[#16233d]',
      status: 'bloqueado',
      statusText: 'Bloqueado',
      advanceText: '0% avance',
      bannerType: 'alert',
      bannerText: 'Requiere Posicionamiento y Comunicación en el Documento Maestro.',
      tags: ['Microcopy', 'Mensajes de error', 'Onboarding', 'Ads', 'Emails', 'Scripts de venta'],
      dependencies: 'Documento Maestro',
      requirements: 'Requiere Posicionamiento y Comunicación en el Documento Maestro.',
      completitud: '0%',
      version: 'v1',
      hasOpenBtn: true,
      hasGenerateBtn: true,
      hasExportBtn: true,
    },
    {
      id: 'landing',
      title: 'Landing Page',
      description: 'Constructor de landing pages desde el Documento Maestro.',
      icon: <Globe className="w-5 h-5 text-[#fb7185]" />,
      iconBg: 'bg-[#2b141d]',
      status: 'bloqueado',
      statusText: 'Bloqueado',
      bannerType: 'alert',
      bannerText: 'Requiere Posicionamiento y Modelo Comercial completos.',
      tags: ['Hero', 'Problema', 'Mecanismo', 'Beneficios', 'Prueba social', 'Oferta', 'FAQ', 'CTA'],
      dependencies: 'Documento Maestro',
      requirements: 'Requiere Posicionamiento y Modelo Comercial completos.',
      lastUpdated: '2/8/2026',
      version: 'v1',
      hasOpenBtn: true,
      hasGenerateBtn: true,
      hasExportBtn: true,
    },
    {
      id: 'secuencias',
      title: 'Secuencias',
      description: 'Generador de secuencias de email completas para cada etapa del funnel.',
      icon: <Mail className="w-5 h-5 text-[#c084fc]" />,
      iconBg: 'bg-[#241638]',
      status: 'bloqueado',
      statusText: 'Bloqueado',
      bannerType: 'alert',
      bannerText: 'Requiere Comunicación y Modelo Comercial en el Documento Maestro.',
      tags: ['Bienvenida', 'Onboarding', 'Venta', 'Nurturing', 'Reactivación', 'Upsell'],
      dependencies: 'Documento Maestro',
      requirements: 'Requiere Comunicación y Modelo Comercial en el Documento Maestro.',
      version: '—',
      hasOpenBtn: true,
      hasGenerateBtn: true,
      hasExportBtn: true,
    },
    {
      id: 'prompts',
      title: 'Prompts',
      description: 'Generador de prompts para desarrollo, marketing, diseño y producto.',
      icon: <Code className="w-5 h-5 text-[#2dd4bf]" />,
      iconBg: 'bg-[#14292e]',
      status: 'desactualizado',
      statusText: 'Desactualizado',
      advanceText: '0% avance',
      bannerType: 'update',
      bannerText: 'El Documento Maestro fue actualizado.',
      tags: ['Cursor / Claude / GPT', 'Prompts de UI/UX', 'Prompts de marketing', 'PRD y arquitectura'],
      dependencies: 'Documento Maestro',
      requirements: 'Se enriquece con toda la información del Documento Maestro.',
      completitud: '0%',
      version: 'v1',
      hasOpenBtn: true,
      hasGenerateBtn: true,
      hasExportBtn: true,
      moduleTarget: 'prompts',
    },
    {
      id: 'arquitectura',
      title: 'Arquitectura',
      description: 'Genera la arquitectura funcional: módulos, entidades y modelo de datos.',
      icon: <Layers className="w-5 h-5 text-[#fbbf24]" />,
      iconBg: 'bg-[#2c2314]',
      status: 'bloqueado',
      statusText: 'Bloqueado',
      bannerType: 'alert',
      bannerText: 'Requiere Documento Maestro y PRD para máxima precisión.',
      tags: ['Módulos', 'Entidades', 'Modelo de datos', 'Permisos', 'Integraciones', 'Roadmap técnico'],
      dependencies: 'Documento Maestro',
      requirements: 'Requiere Documento Maestro y PRD para máxima precisión.',
      version: '—',
      hasOpenBtn: true,
      hasGenerateBtn: true,
      hasExportBtn: true,
      moduleTarget: 'arquitectura',
    },
    {
      id: 'biblioteca',
      title: 'Biblioteca',
      description: 'Logo, colores, iconos, referencias, competidores e inspiración.',
      icon: <Box className="w-5 h-5 text-[#4ade80]" />,
      iconBg: 'bg-[#12281d]',
      status: 'vacio',
      statusText: 'Vacío',
      bannerType: 'empty',
      bannerText: 'Aún no se ha generado.',
      tags: ['Branding', 'Colores', 'Iconos', 'Investigación', 'Referencias', 'Plantillas'],
      dependencies: 'Documento Maestro',
      version: '—',
      hasOpenBtn: true,
      hasExportBtn: true,
      hasGenerateBtn: false,
    },
    {
      id: 'exportaciones',
      title: 'Exportaciones',
      description: 'Exporta el proyecto completo en múltiples formatos.',
      icon: <Download className="w-5 h-5 text-[#818cf8]" />,
      iconBg: 'bg-[#1a1e3b]',
      status: 'desactualizado',
      statusText: 'Desactualizado',
      bannerType: 'update',
      bannerText: 'El Documento Maestro fue actualizado.',
      tags: ['Markdown', 'PDF', 'DOCX', 'JSON', 'HTML', 'ZIP completo'],
      dependencies: 'Documento Maestro',
      version: 'v1',
      hasExportBtn: true,
      hasOpenBtn: false,
      hasGenerateBtn: false,
    },
    {
      id: 'centro-ia',
      title: 'Centro de IA',
      description: 'Genera cualquier activo desde aquí con IA: landing, emails, pitch, roadmap...',
      icon: <Cpu className="w-5 h-5 text-[#f472b6]" />,
      iconBg: 'bg-[#2f142b]',
      status: 'vacio',
      statusText: 'Vacío',
      bannerType: 'empty',
      bannerText: 'Aún no se ha generado.',
      tags: ['Landing', 'Onboarding', 'Emails', 'Campaña', 'Pitch', 'Roadmap'],
      dependencies: 'Documento Maestro',
      requirements: 'Usa el Documento Maestro como contexto principal.',
      version: '—',
      hasOpenBtn: true,
      hasExportBtn: false,
      hasGenerateBtn: false,
    },
  ];

  const handleOpenAction = (asset: AssetCardData) => {
    if (asset.moduleTarget && onNavigateModule) {
      onNavigateModule(asset.moduleTarget);
      return;
    }
    setActiveModalAsset(asset);
    setModalMode('view');
    setGeneratedContent(getDefaultContent(asset));
  };

  const handleGenerateAction = (asset: AssetCardData) => {
    setActiveModalAsset(asset);
    setModalMode('generate');
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      setGeneratedContent(getDefaultContent(asset, true));
    }, 1200);
  };

  const handleExportAction = (asset: AssetCardData) => {
    setActiveModalAsset(asset);
    setModalMode('export');
    setGeneratedContent(getDefaultContent(asset));
  };

  const getDefaultContent = (asset: AssetCardData, isNew = false): string => {
    if (asset.id === 'prd') {
      return `# PRD: ${project.name}
## 1. Visión y Propósito
${project.description || 'Plataforma para acompañamiento terapéutico y guía práctica para familias.'}

## 2. Alcance del MVP
- Registro y Onboarding personalizado
- Evaluación diagnóstica inicial
- Módulo de recomendaciones prácticas
- Canal de soporte y registro de incidencias

## 3. Historias de Usuario
- Como cuidador, quiero registrar eventos de crisis para recibir estrategias de desescalada.
- Como terapeuta, quiero visualizar el historial de eventos para ajustar el plan de intervención.`;
    }
    if (asset.id === 'copy') {
      return `# Estrategia de Copywriting: ${project.name}
## Titular Principal (Hero)
"Transforma los momentos difíciles en comprensión y conexión."

## Propuesta de Valor
Respuestas prácticas, claras y basadas en evidencia para acompañar a tu hijo con TEA cada día.

## Microcopy de Botones
- [Comenzar ahora gratis]
- [Ver mi plan personalizado]
- [Consultar con especialista]`;
    }
    if (asset.id === 'landing') {
      return `<!-- Landing Page Structure: ${project.name} -->
<HeroSection>
  <Headline>Acompañamiento diario para familias TEA</Headline>
  <Subheadline>Guías prácticas validadas por profesionales de la salud.</Subheadline>
  <CTAButton>Comenzar Gratis</CTAButton>
</HeroSection>

<BenefitsGrid>
  <Benefit title="Estrategias Inmediatas">Respuestas paso a paso para situaciones cotidianas.</Benefit>
  <Benefit title="Registro Intuitivo">Monitorea avances y conductas clave con un toque.</Benefit>
</BenefitsGrid>`;
    }
    if (asset.id === 'secuencias') {
      return `# Secuencia de Email Funnel: ${project.name}
## Email 1 (Bienvenida - Minuto 0)
Asunto: Bienvenido a ${project.name}: Tu guía comienza hoy.
Cuerpo: Hola, sabemos que cada día presenta nuevos desafíos...

## Email 2 (Onboarding - Día 2)
Asunto: Cómo personalizar tu primer plan de acción.

## Email 3 (Testimonios y Valor - Día 4)
Asunto: Historias reales de familias como la tuya.`;
    }
    return `# Documento Generado: ${asset.title}
Proyecto: ${project.name}
Fecha: ${new Date().toLocaleDateString()}
Estado: Listo para revisión

${asset.description}

### Configuración
- Dependencia: ${asset.dependencies}
- Etiquetas: ${asset.tags.join(', ')}
`;
  };

  return (
    <div
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-assets-root"
    >
      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="activos"
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          if (onNavigateModule) {
            onNavigateModule(mod);
          }
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
              id="btn-assets-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Volver button */}
            <button
              onClick={onBack}
              id="btn-assets-top-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            {/* Home Icon */}
            <button
              onClick={onNavigateHome}
              id="btn-assets-top-home"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Ir al inicio"
            >
              <HomeIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Right side: Guardar */}
          <div className="flex items-center gap-2">
            {/* Guardar Button */}
            <button
              onClick={handleSave}
              id="btn-assets-save"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedFeedback ? 'Guardado' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Title & Header Section */}
        <section className="space-y-2">
          <span className="text-[11px] font-bold tracking-widest text-[#4f6bff] uppercase">
            CENTRO DE GENERACIÓN
          </span>

          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Activos del Proyecto
            </h1>

            <button
              onClick={handleCopyAll}
              id="btn-copy-all-assets"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111728] hover:bg-[#182138] border border-[#202947] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
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

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Cada activo es un motor generador impulsado por el Documento Maestro. Toca una tarjeta para ver su detalle; cada botón ejecuta una sola acción.
          </p>
        </section>

        {/* Top 4 Metrics Grid matching Screenshot 1 */}
        <section className="space-y-3">
          <div className="grid grid-cols-3 gap-2.5">
            {/* Metric 1 */}
            <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-2xl font-black text-[#f59e0b]">2%</span>
              <span className="text-[11px] text-slate-400 font-medium">Doc Maestro</span>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-2xl font-black text-[#22c55e]">
                {project.screensData?.screens?.length || 2}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Pantallas</span>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-2xl font-black text-[#38bdf8]">0</span>
              <span className="text-[11px] text-slate-400 font-medium">Con copy</span>
            </div>
          </div>

          {/* Metric 4 (Full Width Card) */}
          <div className="bg-[#0e1322] border border-[#1b233d] rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-2xl font-black text-[#2dd4bf]">0</span>
            <span className="text-[11px] text-slate-400 font-medium">Con prompts</span>
          </div>
        </section>

        {/* 11 Expandable Asset Cards matching screenshots 1 through 13 */}
        <section className="space-y-3.5 pb-12">
          {assets.map((asset) => {
            const isExpanded = !!expandedCards[asset.id];

            return (
              <div
                key={asset.id}
                id={`card-asset-${asset.id}`}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'bg-[#0b0f1d] border-[#222c4a] shadow-xl ring-1 ring-white/5'
                    : 'bg-[#0a0e1a] border-[#161d31] hover:border-[#222c4a]'
                }`}
              >
                {/* Card Header (Click to Expand / Collapse) */}
                <div
                  onClick={() => toggleCard(asset.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${asset.iconBg} border border-white/5 flex items-center justify-center shrink-0`}>
                      {asset.icon}
                    </div>

                    {/* Title & Status Badge */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[15px] font-bold text-white group-hover:text-slate-100 transition-colors">
                          {asset.title}
                        </h2>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5">
                          {asset.status === 'actualizado' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0d281e] text-[#4ade80] border border-[#164e39]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></span>
                              Actualizado
                            </span>
                          )}

                          {asset.status === 'bloqueado' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2a121c] text-[#f87171] border border-[#501b2c]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]"></span>
                              Bloqueado
                            </span>
                          )}

                          {asset.status === 'desactualizado' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2b2212] text-[#fbbf24] border border-[#4d3d19]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]"></span>
                              Desactualizado
                            </span>
                          )}

                          {asset.status === 'vacio' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#181d2a] text-slate-400 border border-[#273147]">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Vacío
                            </span>
                          )}

                          {asset.advanceText && (
                            <span className="text-[11px] text-slate-400 font-medium ml-0.5">
                              {asset.advanceText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expand / Collapse Chevron */}
                  <div className="text-slate-500 group-hover:text-slate-300 transition-colors p-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Card Expanded Content matching exact screenshots */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-4 border-t border-[#161d31]/80 animate-in fade-in duration-200">
                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                      {asset.description}
                    </p>

                    {/* Status Banners */}
                    {asset.bannerType === 'sync' && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0e261f] border border-[#15523d] text-[#34d399] text-xs">
                        <Sparkles className="w-4 h-4 shrink-0 text-[#34d399]" />
                        <span>{asset.bannerText}</span>
                      </div>
                    )}

                    {asset.bannerType === 'alert' && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#231219] border border-[#481b2a] text-[#f87171] text-xs">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-[#f87171]" />
                        <span>{asset.bannerText}</span>
                      </div>
                    )}

                    {asset.bannerType === 'update' && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#2a2213] border border-[#523e1b] text-[#fbbf24] text-xs">
                        <Sparkles className="w-4 h-4 shrink-0 text-[#fbbf24]" />
                        <span>{asset.bannerText}</span>
                      </div>
                    )}

                    {asset.bannerType === 'empty' && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#141a2a] border border-[#222c44] text-slate-400 text-xs">
                        <Sparkles className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>{asset.bannerText}</span>
                      </div>
                    )}

                    {/* Etiquetas / Tags */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        ETIQUETAS
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {asset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg bg-[#111728] border border-[#1f2945] text-slate-300 text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dependencias */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        DEPENDENCIAS
                      </span>
                      <p className="text-xs text-slate-300 font-medium">
                        {asset.dependencies}
                      </p>
                    </div>

                    {/* Requisitos if present */}
                    {asset.requirements && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          REQUISITOS
                        </span>
                        <p className={`text-xs font-medium ${
                          asset.status === 'bloqueado' ? 'text-[#f87171]' : 'text-slate-300'
                        }`}>
                          {asset.requirements}
                        </p>
                      </div>
                    )}

                    {/* Completitud / Version / Last Updated row */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-[#161d31]">
                      {asset.completitud && (
                        <div>
                          <span>Completitud: </span>
                          <span className={`font-semibold ${
                            asset.completitud === '0%' ? 'text-slate-400' : 'text-[#f59e0b]'
                          }`}>
                            {asset.completitud}
                          </span>
                        </div>
                      )}

                      {asset.lastUpdated && (
                        <div>
                          <span>Última act.: </span>
                          <span className="text-slate-300 font-medium">{asset.lastUpdated}</span>
                        </div>
                      )}

                      {asset.version && (
                        <div>
                          <span>Versión: </span>
                          <span className="text-slate-300 font-medium">{asset.version}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Abrir, Generar, Exportar */}
                    <div className="flex items-center gap-2 pt-2">
                      {asset.hasOpenBtn && (
                        <button
                          onClick={() => handleOpenAction(asset)}
                          id={`btn-open-${asset.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#111728] hover:bg-[#182138] border border-[#202947] text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir</span>
                        </button>
                      )}

                      {asset.hasGenerateBtn && (
                        <button
                          onClick={() => handleGenerateAction(asset)}
                          id={`btn-generate-${asset.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#111728] hover:bg-[#182138] border border-[#202947] text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Generar</span>
                        </button>
                      )}

                      {asset.hasExportBtn && (
                        <button
                          onClick={() => handleExportAction(asset)}
                          id={`btn-export-${asset.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#111728] hover:bg-[#182138] border border-[#202947] text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Exportar</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>

      {/* Interactive Asset Viewer / Generator / Exporter Modal */}
      {activeModalAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          id="modal-asset-container"
          onClick={() => setActiveModalAsset(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0c101c] border border-[#212b48] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#182138] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${activeModalAsset.iconBg} flex items-center justify-center`}>
                  {activeModalAsset.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {activeModalAsset.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {modalMode === 'generate' ? 'Generador Inteligente' : modalMode === 'export' ? 'Exportar Entregable' : 'Visor de Activo'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalAsset(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182138] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {isGeneratingAI ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="relative">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-white">Sincronizando con Documento Maestro...</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">Estructurando {activeModalAsset.title} con las directrices estratégicas vigentes.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Contenido ({activeModalAsset.version || 'v1'})
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        setCopiedModalContent(true);
                        setTimeout(() => setCopiedModalContent(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      {copiedModalContent ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={12}
                    className="w-full bg-[#080b14] border border-[#1c2642] rounded-xl p-3 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-[#4f6bff] resize-none"
                  />

                  {modalMode === 'export' && (
                    <div className="space-y-2 pt-2 border-t border-[#182138]">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Formatos Disponibles
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {['Markdown (.md)', 'JSON (.json)', 'PDF (.pdf)'].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => {
                              const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `${activeModalAsset.id}-${project.name.toLowerCase().replace(/\s+/g, '-')}.${fmt.includes('json') ? 'json' : 'md'}`;
                              link.click();
                            }}
                            className="p-2.5 rounded-xl bg-[#111728] border border-[#1f2945] hover:border-indigo-500 text-[11px] font-medium text-slate-200 text-center transition-all cursor-pointer"
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#182138] flex items-center justify-end gap-2 bg-[#090d17]">
              <button
                onClick={() => setActiveModalAsset(null)}
                className="px-4 py-2 rounded-xl bg-[#141b2e] hover:bg-[#1a233b] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              {activeModalAsset.moduleTarget && onNavigateModule && (
                <button
                  onClick={() => {
                    const target = activeModalAsset.moduleTarget!;
                    setActiveModalAsset(null);
                    onNavigateModule(target);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ir al Módulo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
