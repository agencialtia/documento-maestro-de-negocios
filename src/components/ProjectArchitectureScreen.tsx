import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  ArrowLeft,
  Home as HomeIcon,
  ChevronDown,
  Copy,
  Check,
  Mic,
  Package,
  Layers,
  Zap,
  Folder,
  Activity,
  Sparkles,
  Save,
  ChevronRight,
  Code2,
  Database,
  FileCode,
  Download,
  X
} from 'lucide-react';
import { Project } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { ProductArchitectureData, initialProductArchitectureData } from '../data/productArchitectureData';
import { generateTechnicalHandoff } from '../utils/ecosystemEngine';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectArchitectureScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Technical Handoff Modal
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [handoffTab, setHandoffTab] = useState<'markdown' | 'db' | 'api' | 'folders'>('markdown');
  const [copiedHandoff, setCopiedHandoff] = useState(false);

  // Voice recording state
  const [activeRecordingField, setActiveRecordingField] = useState<string | null>(null);

  // Accordion collapsed state for cards (default all open)
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({
    solucion_producto: false,
    framework_metodo: false,
    funcionalidades: false,
    roadmap: false,
    journeys_activacion: false,
    requisitos_tecnicos: false,
  });

  // State for form data
  const [formData, setFormData] = useState<ProductArchitectureData>(() => {
    if (project.productArchitecture) {
      return {
        ...initialProductArchitectureData,
        ...project.productArchitecture,
      };
    }
    // Auto-fill from project masterDoc or defaults if available
    const masterSections = project.masterStrategyDoc?.sections || {};
    const solProd = masterSections['solucion_producto'] || {};
    const metodoData = masterSections['mecanismo_unico'] || masterSections['framework'] || {};

    return {
      ...initialProductArchitectureData,
      solucion_producto: {
        nombre_del_producto: solProd.nombre_de_la_solucion || project.name || '',
        descripcion_funcional: solProd.descripcion_canonica || project.description || '',
        mecanismo_entregado: solProd.mecanismo_unico || metodoData.nombre_del_mecanismo || '',
      },
    };
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
          productArchitecture: formData,
        });
      }
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [formData]);

  const toggleCard = (cardKey: string) => {
    setCollapsedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const handleFieldChange = (section: keyof ProductArchitectureData, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleDictate = (fieldKey: string, section: keyof ProductArchitectureData, fieldName: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Por favor usa Chrome o Edge.');
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
        const currentVal = (formData[section] as any)[fieldName] || '';
        const newVal = currentVal ? `${currentVal} ${transcript}` : transcript;
        handleFieldChange(section, fieldName, newVal);
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

  const handleCopyAll = () => {
    let fullText = `=== ARQUITECTURA DEL PRODUCTO: ${project.name} ===\n\n`;
    
    fullText += `--- 1. SOLUCIÓN Y PRODUCTO ---\n`;
    fullText += `Nombre del Producto: ${formData.solucion_producto.nombre_del_producto}\n`;
    fullText += `Descripción Funcional: ${formData.solucion_producto.descripcion_funcional}\n`;
    fullText += `Mecanismo Entregado: ${formData.solucion_producto.mecanismo_entregado}\n\n`;

    fullText += `--- 2. FRAMEWORK / MÉTODO ---\n`;
    fullText += `Nombre del Método: ${formData.framework_metodo.nombre_del_metodo}\n`;
    fullText += `Etapas y Secuencia: ${formData.framework_metodo.etapas_y_secuencia}\n`;
    fullText += `Resultado de cada Etapa: ${formData.framework_metodo.resultado_de_cada_etapa}\n`;
    fullText += `Relación con el Mecanismo Único: ${formData.framework_metodo.relacion_con_el_mecanismo_unico}\n\n`;

    fullText += `--- 3. FUNCIONALIDADES ---\n`;
    fullText += `${formData.funcionalidades.funcionalidades_job_resultado_prioridad}\n\n`;

    fullText += `--- 4. ROADMAP ---\n`;
    fullText += `${formData.roadmap.roadmap_etapa_objetivo_accion_barrera}\n\n`;

    fullText += `--- 5. JOURNEYS Y ACTIVACIÓN ---\n`;
    fullText += `Journeys Clave: ${formData.journeys_activacion.journeys_clave}\n`;
    fullText += `Acción Inicial: ${formData.journeys_activacion.accion_inicial}\n`;
    fullText += `Quick Win: ${formData.journeys_activacion.quick_win}\n`;
    fullText += `Tiempo hasta el Valor: ${formData.journeys_activacion.tiempo_hasta_el_valor}\n\n`;

    fullText += `--- 6. REQUISITOS TÉCNICOS ---\n`;
    fullText += `${formData.requisitos_tecnicos.requisitos_tecnicos}\n`;

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Helper calculation for map percentages
  const masterDocFilledCount = Object.keys(project.masterStrategyDoc?.sections || {}).length;
  const masterDocPercent = Math.min(100, Math.round((masterDocFilledCount / 12) * 100)) || 2;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-[#182035] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-open-sidebar-drawer"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#151c30] transition-colors focus:outline-none"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            id="btn-back-to-project"
            onClick={onBack}
            className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Volver</span>
          </button>
          <button
            id="btn-home"
            onClick={onNavigateHome}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#151c30] transition-colors"
            title="Ir al inicio"
          >
            <HomeIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24">
        {/* Title Header */}
        <div className="space-y-1.5" id="architecture-header-section">
          <p className="text-[11px] font-bold tracking-widest text-[#4f7cf7] uppercase">
            ARQUITECTURA DEL PRODUCTO
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Arquitectura del Producto
          </h1>
          <p className="text-sm text-slate-400">
            Capacidades, módulos, funcionalidades y requisitos del producto.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <button
              id="btn-copy-all-architecture"
              onClick={handleCopyAll}
              className="flex items-center space-x-2 px-3.5 py-2 bg-[#12182a] hover:bg-[#1b233d] border border-[#242f50] rounded-xl text-xs font-semibold text-slate-200 transition-all active:scale-95 shadow-sm"
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
              id="btn-technical-handoff"
              onClick={() => setIsHandoffModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-sky-600/20 to-blue-600/20 hover:from-sky-600/30 hover:to-blue-600/30 border border-sky-500/40 hover:border-sky-400 rounded-xl text-xs font-bold text-sky-300 transition-all active:scale-95 shadow-sm"
            >
              <Code2 className="w-4 h-4 text-sky-400" />
              <span>Exportar Handoff Técnico</span>
            </button>
          </div>

          {/* Autoguardado indicator */}
          <div className="text-[11px] font-medium text-slate-500 flex items-center space-x-1.5">
            {saveStatus === 'saving' ? (
              <span className="text-amber-400">Guardando cambios...</span>
            ) : (
              <span className="text-emerald-500/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Autoguardado
              </span>
            )}
          </div>
        </div>

        {/* MAPA RELACIONAL - CÓMO DEPENDE CADA COMPONENTE */}
        <div 
          className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl"
          id="relational-map-box"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#818cf8]" />
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              MAPA RELACIONAL — CÓMO DEPENDE CADA COMPONENTE
            </span>
          </div>

          {/* Connected Cards Flow */}
          <div className="space-y-3 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-[#1e2746]">
            {/* 1. Documento Maestro */}
            <div
              id="map-item-master-doc"
              onClick={() => onNavigateModule && onNavigateModule('maestro')}
              className="relative z-10 flex items-center justify-between p-3.5 bg-[#10162a] hover:bg-[#17203b] border border-[#202c4f] rounded-xl cursor-pointer transition-all hover:border-[#3b82f6]/50"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#182346] border border-[#2d3d6e] flex items-center justify-center text-xs font-bold text-[#818cf8]">
                  {masterDocPercent}%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Documento Maestro</h4>
                  <p className="text-xs text-slate-400">Fuente única de verdad</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            {/* 2. Arquitectura (Active Step) */}
            <div
              id="map-item-architecture"
              className="relative z-10 flex items-center justify-between p-3.5 bg-[#12192e] border-2 border-[#f59e0b]/50 shadow-[0_0_15px_rgba(245,158,11,0.1)] rounded-xl transition-all"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#2b2112] border border-[#6b4e18] flex items-center justify-center text-xs font-bold text-[#fbbf24]">
                  0%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Arquitectura</h4>
                  <p className="text-xs text-slate-400">Módulos, etapas, requisitos</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f59e0b]/20 text-[#fbbf24] rounded-full border border-[#f59e0b]/30">
                En edición
              </span>
            </div>

            {/* 3. Pantallas */}
            <div
              id="map-item-screens"
              onClick={() => onNavigateModule && onNavigateModule('pantallas')}
              className="relative z-10 flex items-center justify-between p-3.5 bg-[#10162a] hover:bg-[#17203b] border border-[#202c4f] rounded-xl cursor-pointer transition-all hover:border-[#34d399]/50"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#112a22] border border-[#1f5443] flex items-center justify-center text-xs font-bold text-[#34d399]">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Pantallas</h4>
                  <p className="text-xs text-slate-400">0/1 terminadas</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            {/* 4. Funcionalidades */}
            <div
              id="map-item-functionalities"
              className="relative z-10 flex items-center justify-between p-3.5 bg-[#10162a] border border-[#202c4f] rounded-xl transition-all"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#132036] border border-[#23385e] flex items-center justify-center text-xs font-bold text-slate-400">
                  0
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Funcionalidades</h4>
                  <p className="text-xs text-slate-400">Comportamiento y lógica</p>
                </div>
              </div>
            </div>

            {/* 5. Flujo de datos */}
            <div
              id="map-item-dataflow"
              className="relative z-10 flex items-center justify-between p-3.5 bg-[#10162a] border border-[#202c4f] rounded-xl transition-all"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#132036] border border-[#23385e] flex items-center justify-center text-xs font-bold text-slate-400">
                  0
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Flujo de datos</h4>
                  <p className="text-xs text-slate-400">Consume / produce</p>
                </div>
              </div>
            </div>

            {/* 6. Activos generados */}
            <div
              id="map-item-assets"
              onClick={() => onNavigateModule && onNavigateModule('activos')}
              className="relative z-10 flex items-center justify-between p-3.5 bg-[#10162a] hover:bg-[#17203b] border border-[#202c4f] rounded-xl cursor-pointer transition-all hover:border-[#fb7185]/50"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#271424] border border-[#522149] flex items-center justify-center text-xs font-bold text-[#f472b6]">
                  0/7
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Activos generados</h4>
                  <p className="text-xs text-slate-400">PRD, Landing, Copy, Emails...</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. SOLUCIÓN Y PRODUCTO CARD */}
        {/* ========================================================= */}
        <section 
          id="card-solucion-producto"
          className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl overflow-hidden shadow-xl"
        >
          <div 
            onClick={() => toggleCard('solucion_producto')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#10162a] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#182346] flex items-center justify-center text-[#818cf8]">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Solución y Producto</h3>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                collapsedCards['solucion_producto'] ? '-rotate-90' : ''
              }`}
            />
          </div>

          {!collapsedCards['solucion_producto'] && (
            <div className="p-4 sm:p-5 pt-0 space-y-5 border-t border-[#161d33]">
              <div className="pt-4">
                <span className="text-[11px] font-bold tracking-wider text-[#4f7cf7] uppercase block mb-3">
                  DEFINICIÓN
                </span>

                {/* NOMBRE DEL PRODUCTO */}
                <div className="space-y-2 mb-4">
                  <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    NOMBRE DEL PRODUCTO
                  </label>
                  <input
                    type="text"
                    id="input-nombre-producto"
                    value={formData.solucion_producto.nombre_del_producto}
                    onChange={(e) =>
                      handleFieldChange('solucion_producto', 'nombre_del_producto', e.target.value)
                    }
                    placeholder="¿Cómo se llama?"
                    className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#4f7cf7] focus:ring-1 focus:ring-[#4f7cf7] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDictate('nombre_del_producto', 'solucion_producto', 'nombre_del_producto')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        activeRecordingField === 'nombre_del_producto'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                      <span>{activeRecordingField === 'nombre_del_producto' ? 'Escuchando...' : 'Dictar'}</span>
                    </button>
                  </div>
                </div>

                {/* DESCRIPCIÓN FUNCIONAL */}
                <div className="space-y-2 mb-4">
                  <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    DESCRIPCIÓN FUNCIONAL
                  </label>
                  <textarea
                    id="textarea-descripcion-funcional"
                    rows={3}
                    value={formData.solucion_producto.descripcion_funcional}
                    onChange={(e) =>
                      handleFieldChange('solucion_producto', 'descripcion_funcional', e.target.value)
                    }
                    placeholder="¿Qué es, en términos prácticos?"
                    className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#4f7cf7] focus:ring-1 focus:ring-[#4f7cf7] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDictate('descripcion_funcional', 'solucion_producto', 'descripcion_funcional')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        activeRecordingField === 'descripcion_funcional'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                      <span>{activeRecordingField === 'descripcion_funcional' ? 'Escuchando...' : 'Dictar'}</span>
                    </button>
                  </div>
                </div>

                {/* MECANISMO ENTREGADO */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    MECANISMO ENTREGADO
                  </label>
                  <textarea
                    id="textarea-mecanismo-entregado"
                    rows={3}
                    value={formData.solucion_producto.mecanismo_entregado}
                    onChange={(e) =>
                      handleFieldChange('solucion_producto', 'mecanismo_entregado', e.target.value)
                    }
                    placeholder="¿Qué parte del Mecanismo Único entrega?"
                    className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#4f7cf7] focus:ring-1 focus:ring-[#4f7cf7] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDictate('mecanismo_entregado', 'solucion_producto', 'mecanismo_entregado')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        activeRecordingField === 'mecanismo_entregado'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                      <span>{activeRecordingField === 'mecanismo_entregado' ? 'Escuchando...' : 'Dictar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 2. FRAMEWORK / MÉTODO CARD */}
        {/* ========================================================= */}
        <section 
          id="card-framework-metodo"
          className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl overflow-hidden shadow-xl"
        >
          <div 
            onClick={() => toggleCard('framework_metodo')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#10162a] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#271d0e] flex items-center justify-center text-[#f59e0b]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Framework / Método</h3>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                collapsedCards['framework_metodo'] ? '-rotate-90' : ''
              }`}
            />
          </div>

          {!collapsedCards['framework_metodo'] && (
            <div className="p-4 sm:p-5 pt-0 space-y-5 border-t border-[#161d33]">
              {/* NOMBRE DEL MÉTODO */}
              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  NOMBRE DEL MÉTODO
                </label>
                <input
                  type="text"
                  id="input-nombre-metodo"
                  value={formData.framework_metodo.nombre_del_metodo}
                  onChange={(e) =>
                    handleFieldChange('framework_metodo', 'nombre_del_metodo', e.target.value)
                  }
                  placeholder="¿Cómo se llama el método?"
                  className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDictate('nombre_del_metodo', 'framework_metodo', 'nombre_del_metodo')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      activeRecordingField === 'nombre_del_metodo'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span>{activeRecordingField === 'nombre_del_metodo' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
              </div>

              {/* ETAPAS Y SECUENCIA */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  ETAPAS Y SECUENCIA
                </label>
                <textarea
                  id="textarea-etapas-secuencia"
                  rows={3}
                  value={formData.framework_metodo.etapas_y_secuencia}
                  onChange={(e) =>
                    handleFieldChange('framework_metodo', 'etapas_y_secuencia', e.target.value)
                  }
                  placeholder="¿Cuáles son los pasos y en qué orden?"
                  className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDictate('etapas_y_secuencia', 'framework_metodo', 'etapas_y_secuencia')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      activeRecordingField === 'etapas_y_secuencia'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span>{activeRecordingField === 'etapas_y_secuencia' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
              </div>

              {/* RESULTADO DE CADA ETAPA */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  RESULTADO DE CADA ETAPA
                </label>
                <textarea
                  id="textarea-resultado-etapa"
                  rows={3}
                  value={formData.framework_metodo.resultado_de_cada_etapa}
                  onChange={(e) =>
                    handleFieldChange('framework_metodo', 'resultado_de_cada_etapa', e.target.value)
                  }
                  placeholder="¿Qué logra al completar cada paso?"
                  className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDictate('resultado_de_cada_etapa', 'framework_metodo', 'resultado_de_cada_etapa')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      activeRecordingField === 'resultado_de_cada_etapa'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span>{activeRecordingField === 'resultado_de_cada_etapa' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
              </div>

              {/* RELACIÓN CON EL MECANISMO ÚNICO */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  RELACIÓN CON EL MECANISMO ÚNICO
                </label>
                <textarea
                  id="textarea-relacion-mecanismo"
                  rows={3}
                  value={formData.framework_metodo.relacion_con_el_mecanismo_unico}
                  onChange={(e) =>
                    handleFieldChange('framework_metodo', 'relacion_con_el_mecanismo_unico', e.target.value)
                  }
                  placeholder="¿Cómo aplica el mecanismo en la práctica?"
                  className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDictate('relacion_con_el_mecanismo_unico', 'framework_metodo', 'relacion_con_el_mecanismo_unico')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      activeRecordingField === 'relacion_con_el_mecanismo_unico'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span>{activeRecordingField === 'relacion_con_el_mecanismo_unico' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 3. FUNCIONALIDADES CARD */}
        {/* ========================================================= */}
        <section 
          id="card-funcionalidades"
          className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl overflow-hidden shadow-xl"
        >
          <div 
            onClick={() => toggleCard('funcionalidades')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#10162a] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#112b23] flex items-center justify-center text-[#34d399]">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Funcionalidades</h3>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                collapsedCards['funcionalidades'] ? '-rotate-90' : ''
              }`}
            />
          </div>

          {!collapsedCards['funcionalidades'] && (
            <div className="p-4 sm:p-5 pt-0 space-y-5 border-t border-[#161d33]">
              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  FUNCIONALIDADES (JOB, RESULTADO, PRIORIDAD)
                </label>
                <textarea
                  id="textarea-funcionalidades"
                  rows={8}
                  value={formData.funcionalidades.funcionalidades_job_resultado_prioridad}
                  onChange={(e) =>
                    handleFieldChange(
                      'funcionalidades',
                      'funcionalidades_job_resultado_prioridad',
                      e.target.value
                    )
                  }
                  placeholder={`¿Qué hace cada parte, para qué sirve, qué produce?\n\nEj:\n1. Login con Google → Reduce fricción → Acceso inmediato → Crítica (MVP)`}
                  className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed font-mono text-xs sm:text-sm"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDictate('funcionalidades_job_resultado_prioridad', 'funcionalidades', 'funcionalidades_job_resultado_prioridad')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      activeRecordingField === 'funcionalidades_job_resultado_prioridad'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span>{activeRecordingField === 'funcionalidades_job_resultado_prioridad' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 4. ROADMAP CARD */}
        {/* ========================================================= */}
        <section 
          id="card-roadmap"
          className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl overflow-hidden shadow-xl"
        >
          <div 
            onClick={() => toggleCard('roadmap')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#10162a] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#142640] flex items-center justify-center text-[#38bdf8]">
                <Folder className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Roadmap</h3>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                collapsedCards['roadmap'] ? '-rotate-90' : ''
              }`}
            />
          </div>

          {!collapsedCards['roadmap'] && (
            <div className="p-4 sm:p-5 pt-0 space-y-5 border-t border-[#161d33]">
              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  ROADMAP
                </label>
                <textarea
                  id="textarea-roadmap"
                  rows={8}
                  value={formData.roadmap.roadmap_etapa_objetivo_accion_barrera}
                  onChange={(e) =>
                    handleFieldChange(
                      'roadmap',
                      'roadmap_etapa_objetivo_accion_barrera',
                      e.target.value
                    )
                  }
                  placeholder={`Etapa, objetivo, acción, barrera, criterio de avance.\n\nEj:\nEtapa 1: Activación → Completar perfil → Llenar onboarding → Falta contexto → Al guardar perfil`}
                  className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed font-mono text-xs sm:text-sm"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDictate('roadmap_etapa_objetivo_accion_barrera', 'roadmap', 'roadmap_etapa_objetivo_accion_barrera')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      activeRecordingField === 'roadmap_etapa_objetivo_accion_barrera'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span>{activeRecordingField === 'roadmap_etapa_objetivo_accion_barrera' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 5. JOURNEYS Y ACTIVACIÓN CARD */}
        {/* ========================================================= */}
        <section 
          id="card-journeys-activacion"
          className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl overflow-hidden shadow-xl"
        >
          <div 
            onClick={() => toggleCard('journeys_activacion')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#10162a] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#27183e] flex items-center justify-center text-[#c084fc]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Journeys y Activación</h3>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                collapsedCards['journeys_activacion'] ? '-rotate-90' : ''
              }`}
            />
          </div>

          {!collapsedCards['journeys_activacion'] && (
            <div className="p-4 sm:p-5 pt-0 space-y-5 border-t border-[#161d33]">
              {/* JOURNEYS CLAVE */}
              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  JOURNEYS CLAVE
                </label>
                <textarea
                  id="textarea-journeys-clave"
                  rows={5}
                  value={formData.journeys_activacion.journeys_clave}
                  onChange={(e) =>
                    handleFieldChange('journeys_activacion', 'journeys_clave', e.target.value)
                  }
                  placeholder={`Nombre → Evento inicial → Objetivo → Pasos → Fricciones → Punto de valor`}
                  className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed font-mono text-xs sm:text-sm"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDictate('journeys_clave', 'journeys_activacion', 'journeys_clave')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      activeRecordingField === 'journeys_clave'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span>{activeRecordingField === 'journeys_clave' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
              </div>

              {/* QUICK WIN SUBHEADER */}
              <div className="pt-2">
                <span className="text-[11px] font-bold tracking-wider text-[#4f7cf7] uppercase block mb-3">
                  QUICK WIN
                </span>

                {/* ACCIÓN INICIAL */}
                <div className="space-y-2 mb-4">
                  <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    ACCIÓN INICIAL
                  </label>
                  <input
                    type="text"
                    id="input-accion-inicial"
                    value={formData.journeys_activacion.accion_inicial}
                    onChange={(e) =>
                      handleFieldChange('journeys_activacion', 'accion_inicial', e.target.value)
                    }
                    placeholder="¿Lo primero que hace en el producto?"
                    className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDictate('accion_inicial', 'journeys_activacion', 'accion_inicial')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        activeRecordingField === 'accion_inicial'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                      <span>{activeRecordingField === 'accion_inicial' ? 'Escuchando...' : 'Dictar'}</span>
                    </button>
                  </div>
                </div>

                {/* QUICK WIN */}
                <div className="space-y-2 mb-4">
                  <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    QUICK WIN
                  </label>
                  <textarea
                    id="textarea-quick-win"
                    rows={3}
                    value={formData.journeys_activacion.quick_win}
                    onChange={(e) =>
                      handleFieldChange('journeys_activacion', 'quick_win', e.target.value)
                    }
                    placeholder="¿Qué resultado rápido y tangible obtiene primero?"
                    className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDictate('quick_win', 'journeys_activacion', 'quick_win')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        activeRecordingField === 'quick_win'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                      <span>{activeRecordingField === 'quick_win' ? 'Escuchando...' : 'Dictar'}</span>
                    </button>
                  </div>
                </div>

                {/* TIEMPO HASTA EL VALOR */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    TIEMPO HASTA EL VALOR
                  </label>
                  <input
                    type="text"
                    id="input-tiempo-valor"
                    value={formData.journeys_activacion.tiempo_hasta_el_valor}
                    onChange={(e) =>
                      handleFieldChange('journeys_activacion', 'tiempo_hasta_el_valor', e.target.value)
                    }
                    placeholder="¿Cuánto tarda en sentir que funciona?"
                    className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDictate('tiempo_hasta_el_valor', 'journeys_activacion', 'tiempo_hasta_el_valor')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        activeRecordingField === 'tiempo_hasta_el_valor'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                      <span>{activeRecordingField === 'tiempo_hasta_el_valor' ? 'Escuchando...' : 'Dictar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 6. REQUISITOS TÉCNICOS CARD */}
        {/* ========================================================= */}
        <section 
          id="card-requisitos-tecnicos"
          className="bg-[#0b0f1d] border border-[#1b233d] rounded-2xl overflow-hidden shadow-xl"
        >
          <div 
            onClick={() => toggleCard('requisitos_tecnicos')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#10162a] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#271318] flex items-center justify-center text-[#fb7185]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Requisitos Técnicos</h3>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                collapsedCards['requisitos_tecnicos'] ? '-rotate-90' : ''
              }`}
            />
          </div>

          {!collapsedCards['requisitos_tecnicos'] && (
            <div className="p-4 sm:p-5 pt-0 space-y-5 border-t border-[#161d33]">
              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  REQUISITOS TÉCNICOS
                </label>
                <textarea
                  id="textarea-requisitos-tecnicos"
                  rows={6}
                  value={formData.requisitos_tecnicos.requisitos_tecnicos}
                  onChange={(e) =>
                    handleFieldChange('requisitos_tecnicos', 'requisitos_tecnicos', e.target.value)
                  }
                  placeholder={`¿Qué debe hacer el sistema?\n¿Plataformas? ¿Seguridad?\n¿Accesibilidad?`}
                  className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-[#1e2746] focus:border-[#fb7185] focus:ring-1 focus:ring-[#fb7185] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDictate('requisitos_tecnicos', 'requisitos_tecnicos', 'requisitos_tecnicos')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      activeRecordingField === 'requisitos_tecnicos'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-[#12182a] text-slate-300 border-[#222c4a] hover:bg-[#1c2642] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span>{activeRecordingField === 'requisitos_tecnicos' ? 'Escuchando...' : 'Dictar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Technical Handoff Modal */}
      {isHandoffModalOpen && (() => {
        const handoff = generateTechnicalHandoff(project);
        let activeContent = handoff.markdown;
        if (handoffTab === 'db') activeContent = handoff.dbSchema;
        if (handoffTab === 'api') activeContent = handoff.apiContracts;
        if (handoffTab === 'folders') activeContent = handoff.folderStructure;

        const handleCopyTab = () => {
          navigator.clipboard.writeText(activeContent);
          setCopiedHandoff(true);
          setTimeout(() => setCopiedHandoff(false), 2000);
        };

        const handleDownloadMd = () => {
          const blob = new Blob([handoff.markdown], { type: 'text/markdown;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Handoff-Tecnico-${project.name.replace(/\s+/g, '_')}.md`;
          a.click();
          URL.revokeObjectURL(url);
        };

        return (
          <div 
            id="modal-technical-handoff"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          >
            <div className="bg-[#0b0f1d] border border-[#1e294b] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-[#1b233d] flex items-center justify-between bg-[#0e1424]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Handoff Técnico & Especificación
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                        Listo para Devs
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Schema de base de datos, contratos de API REST y estructura de carpetas modular.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsHandoffModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-[#19223c] rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Bar */}
              <div className="flex items-center justify-between px-5 pt-3 border-b border-[#1b233d] bg-[#0c101f]">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setHandoffTab('markdown')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                      handoffTab === 'markdown'
                        ? 'text-sky-400 border-sky-400 bg-[#12182a]'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    Documento Completo (.md)
                  </button>

                  <button
                    onClick={() => setHandoffTab('db')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                      handoffTab === 'db'
                        ? 'text-sky-400 border-sky-400 bg-[#12182a]'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    DB Schema (SQL)
                  </button>

                  <button
                    onClick={() => setHandoffTab('api')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                      handoffTab === 'api'
                        ? 'text-sky-400 border-sky-400 bg-[#12182a]'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Contratos de API
                  </button>

                  <button
                    onClick={() => setHandoffTab('folders')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                      handoffTab === 'folders'
                        ? 'text-sky-400 border-sky-400 bg-[#12182a]'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    Estructura Carpetas
                  </button>
                </div>

                {/* Tab Actions */}
                <div className="flex items-center space-x-2 pb-2">
                  <button
                    onClick={handleCopyTab}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#141b30] hover:bg-[#1d2745] border border-[#253256] rounded-lg text-xs font-medium text-slate-200 transition-colors"
                  >
                    {copiedHandoff ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copiar pestaña</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadMd}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .md</span>
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="p-5 flex-1 overflow-y-auto bg-[#070a14] font-mono text-xs text-slate-200 leading-relaxed select-text">
                <pre className="whitespace-pre-wrap">{activeContent}</pre>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#0a0e1c] border-t border-[#1b233d] flex items-center justify-between text-xs text-slate-400">
                <span>Total de pantallas mapeadas: {project.screensData?.screens.length || 0}</span>
                <button
                  onClick={() => setIsHandoffModalOpen(false)}
                  className="px-4 py-1.5 bg-[#141b30] hover:bg-[#1f2a4a] text-slate-200 rounded-lg font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sidebar Drawer */}
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="arquitectura"
        onClose={() => setIsDrawerOpen(false)}
        onSelectModule={(mod) => {
          setIsDrawerOpen(false);
          if (onNavigateModule) onNavigateModule(mod);
        }}
        onNavigateHome={() => {
          setIsDrawerOpen(false);
          onNavigateHome();
        }}
      />
    </div>
  );
};
