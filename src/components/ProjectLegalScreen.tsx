import React, { useState, useEffect } from 'react';
import {
  Menu,
  ArrowLeft,
  Home as HomeIcon,
  ChevronDown,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Lock,
  Sparkles,
  Download,
  CheckCircle2,
  RefreshCw,
  Eye,
  ExternalLink,
  BookOpen,
  Scale,
  FileCode,
  FileType
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Project, LegalComplianceData, SensitiveDataChecklist } from '../types';
import { ProjectSidebarDrawer } from './ProjectSidebarDrawer';
import { checkLegalModuleStatus, checkCommercialModelComplete, checkDeliveryVehicleComplete } from '../utils/ecosystemEngine';

interface Props {
  project: Project;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateModule?: (module: string) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const ProjectLegalScreen: React.FC<Props> = ({
  project,
  onBack,
  onNavigateHome,
  onNavigateModule,
  onUpdateProject,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'terms' | 'privacy' | 'cookies' | 'sensitive'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Derive status from ecosystem engine
  const legalStatus = checkLegalModuleStatus(project);
  const commCheck = checkCommercialModelComplete(project);
  const vehCheck = checkDeliveryVehicleComplete(project);

  // Initialize or read Legal Data
  const [legalData, setLegalData] = useState<LegalComplianceData>(() => {
    if (project.legalCompliance) {
      return project.legalCompliance;
    }
    return {
      procesaDatosSensiblesOmenores: 'Sí', // default to Yes for high responsibility (e.g. TEA/health/family)
      jurisdiccion: 'Internacional / España & Latam (RGPD, LOPDGDD, CCPA)',
      sensitiveChecklist: {
        consentimientoParental: true,
        minimizacionDatos: true,
        finalidadTratamiento: true,
        retencionInformacion: true,
        eliminacionDatos: true,
        accesoRectificacion: true,
        restriccionesTerceros: true,
        seguridadCifrado: true,
        consentimientosExplicitos: true,
      },
      terminosCondiciones: {
        status: 'Pendiente',
        content: '',
      },
      politicaPrivacidad: {
        status: 'Pendiente',
        content: '',
      },
      avisoCookies: {
        status: 'Pendiente',
        content: '',
      },
      licenciasTerceros: {
        items: ['MIT License (Librerías React / Tailwind)', 'Google Fonts (OFL)', 'Lucide Icons (ISC)'],
        status: 'Completo',
      },
    };
  });

  // Auto-save
  const handleUpdateLegal = (updated: LegalComplianceData) => {
    setLegalData(updated);
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        legalCompliance: updated,
      });
    }
  };

  const handleToggleSensitiveItem = (key: keyof SensitiveDataChecklist) => {
    const updated = {
      ...legalData,
      sensitiveChecklist: {
        ...legalData.sensitiveChecklist,
        [key]: !legalData.sensitiveChecklist[key],
      },
      isCustomized: true,
    };
    handleUpdateLegal(updated);
  };

  const handleGenerateDocuments = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const masterSections = project.masterStrategyDoc?.sections || {};
      const contexto = masterSections['contexto'] || {};
      const mercado = masterSections['mercado'] || {};
      const nicho = mercado.subnicho || mercado.nicho || 'Familias y cuidadores';
      const vehiculo = contexto.vehiculo_principal || project.category || 'App SaaS';
      const pricing = contexto.estructura_precios || contexto.tiers_precios || 'Suscripción freemium / planes mensuales';

      const isSens = legalData.procesaDatosSensiblesOmenores === 'Sí';

      const termsContent = `# TÉRMINOS Y CONDICIONES DEL SERVICIO: ${project.name.toUpperCase()}

**Fecha de entrada en vigor:** ${new Date().toLocaleDateString()}
**Vehículo de Entrega:** ${vehiculo}
**Jurisdicción aplicable:** ${legalData.jurisdiccion}

---

### 1. Objeto y Aceptación
El presente documento regula el acceso, uso y suscripción a la plataforma **${project.name}**, diseñada para ${project.description || 'proporcionar guías prácticas y acompañamiento especializado'}. Al registrarse o acceder a la aplicación, el usuario acepta estos Términos de forma expresa e informada.

### 2. Destinatarios del Servicio y Capacidad Legal
El servicio está dirigido a **${nicho}**. ${
        isSens
          ? 'Dado que el servicio puede involucrar datos relativos al desarrollo de menores o salud familiar, el registro debe ser efectuado exclusivamente por personas mayores de edad con patria potestad, tutela legal o facultades debidamente acreditadas.'
          : 'El usuario declara ser mayor de edad en su jurisdicción para suscribir contratos vinculantes.'
      }

### 3. Modelo Comercial, Pagos y Facturación
- **Estructura y Tiers:** ${pricing}
- **Periodicidad:** ${contexto.periodicidad_cobro || 'Mensual / Anual'}
- **Política de Reembolsos:** El usuario cuenta con un período de prueba o garantía legal según la normativa de consumo aplicable. La cancelación de suscripciones periódicas surtirá efecto al final del ciclo de facturación en curso.

### 4. Limitación de Responsabilidad y Naturaleza Informativa
**IMPORTANTE:** ${project.name} es una herramienta digital de organización, registro y guía práctica basada en evidencia. **No constituye, sustituye ni reemplaza un diagnóstico médico formal, tratamiento psiquiátrico, prescripción farmacológica ni terapia clínica de urgencia.** Ante cualquier situación de riesgo vital o crisis médica severa, el usuario debe contactar de inmediato a los servicios de emergencia de su localidad.

### 5. Propiedad Intelectual
Todos los derechos sobre la marca, logotipos, flujos, algoritmos, metodologías y microcopys de ${project.name} son propiedad exclusiva de la empresa o de sus respectivos licenciantes.`;

      const privacyContent = `# POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS: ${project.name.toUpperCase()}

**Marco Regulatorio:** RGPD (UE), LOPDGDD (España), CCPA (California) y estándares internacionales.
**Última actualización:** ${new Date().toLocaleDateString()}

---

### 1. Responsable del Tratamiento
**Entidad Responsable:** ${project.name}
**Canal de Contacto y Delegado de Protección de Datos (DPO):** legal@${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.app

### 2. Datos Recopilados y Categorización
- **Datos de Cuenta:** Nombre, correo electrónico, credenciales seguras, país de residencia.
- **Datos de Facturación:** Procesados de forma segura mediante pasarelas certificadas PCI-DSS (Stripe), sin que almacenemos números completos de tarjetas.
${
  isSens
    ? `- **Datos de Especial Protección / Sensibles:** Registros de conducta, eventos cotidianos, observaciones terapéuticas y preferencias del menor, tratados con **Cifrado de Extremo a Extremo en Tránsito (TLS 1.3) y en Reposo (AES-256)**.`
    : `- **Datos de Uso:** Métricas agregadas de sesión, navegación y eventos de interacción para mejora del producto.`
}

### 3. Base Jurídica y Finalidad del Tratamiento
- **Ejecución del Contrato:** Proveer las funcionalidades solicitadas y generar recomendaciones adaptadas.
- **Consentimiento Explícito:** Tratamiento de datos específicos bajo el consentimiento previo e informado del titular o tutor legal.
- **Interés Legítimo:** Seguridad, prevención del fraude y garantía de disponibilidad de la plataforma.

### 4. Retención y Eliminación de Datos
Los datos se conservarán mientras la cuenta permanezca activa. El usuario puede solicitar en cualquier momento la **eliminación total y definitiva** de sus datos desde los ajustes de la aplicación o mediante correo a soporte, procesándose en un plazo máximo de 72 horas hábiles.

### 5. Derechos ARCO / GDPR
El usuario tiene derecho de Acceso, Rectificación, Cancelación, Oposición, Limitación del Tratamiento y Portabilidad de sus datos.`;

      const cookiesContent = `# POLÍTICA DE COOKIES Y TECNOLOGÍAS DE TRACKING: ${project.name.toUpperCase()}

---

### 1. ¿Qué tecnologías utilizamos?
${project.name} emplea cookies técnicas esenciales, almacenamiento local (localStorage/sessionStorage) y herramientas de analítica agregada (PostHog / GA4).

### 2. Tipos de Cookies
- **Cookies Técnicas (Estrictamente Necesarias):** Permiten mantener la sesión autenticada, gestionar preferencias de idioma y garantizar la seguridad contra ataques CSRF.
- **Cookies de Rendimiento y Analítica:** Miden de forma anonimizada los eventos de uso (flujo de pantallas, clicks y tiempos de carga) para optimizar la experiencia de usuario.
- **Cookies de Publicidad:** No vendemos datos a terceros ni instalamos píxeles de venta indiscriminados de brokers de datos.

### 3. Gestión y Revocación del Consentimiento
El usuario puede configurar, aceptar o rechazar las cookies no esenciales mediante el panel de configuración de privacidad de la app o a través de los ajustes de su navegador.`;

      const updatedLegal: LegalComplianceData = {
        ...legalData,
        terminosCondiciones: {
          status: 'Generado',
          content: termsContent,
          lastUpdated: new Date().toLocaleDateString(),
        },
        politicaPrivacidad: {
          status: 'Generado',
          content: privacyContent,
          lastUpdated: new Date().toLocaleDateString(),
        },
        avisoCookies: {
          status: 'Generado',
          content: cookiesContent,
          lastUpdated: new Date().toLocaleDateString(),
        },
        lastGeneratedAt: new Date().toISOString(),
        isCustomized: true,
      };

      handleUpdateLegal(updatedLegal);
      setIsGenerating(false);
    }, 800);
  };

  const handleExportMarkdown = (type: 'terms' | 'privacy' | 'cookies' | 'all') => {
    let content = '';
    let filename = '';

    if (type === 'terms') {
      content = legalData.terminosCondiciones.content || 'Sin contenido';
      filename = `${project.name}_terminos_y_condiciones.md`;
    } else if (type === 'privacy') {
      content = legalData.politicaPrivacidad.content || 'Sin contenido';
      filename = `${project.name}_politica_de_privacidad.md`;
    } else if (type === 'cookies') {
      content = legalData.avisoCookies.content || 'Sin contenido';
      filename = `${project.name}_aviso_cookies.md`;
    } else {
      content = `# PAQUETE LEGAL & COMPLIANCE: ${project.name}\n\n` +
        `---\n\n${legalData.terminosCondiciones.content}\n\n` +
        `---\n\n${legalData.politicaPrivacidad.content}\n\n` +
        `---\n\n${legalData.avisoCookies.content}`;
      filename = `${project.name}_legal_compliance_completo.md`;
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice('Exportado a Markdown correctamente');
    setTimeout(() => setExportNotice(null), 2500);
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
      doc.text(`PAQUETE LEGAL & COMPLIANCE — ${project.name.toUpperCase()}`, margin, 12);
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Jurisdicción: ${legalData.jurisdiccion} | Fecha: ${new Date().toLocaleDateString()}`, margin, 19);

      y = 32;

      const printSection = (title: string, text: string) => {
        if (y > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(title, margin, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const lines = doc.splitTextToSize(text || 'Documento no generado aún.', maxWidth);
        lines.forEach((l: string) => {
          if (y > doc.internal.pageSize.getHeight() - 15) {
            doc.addPage();
            y = 18;
          }
          doc.text(l, margin, y);
          y += 4;
        });
        y += 4;
      };

      printSection('1. TÉRMINOS Y CONDICIONES', legalData.terminosCondiciones.content);
      printSection('2. POLÍTICA DE PRIVACIDAD', legalData.politicaPrivacidad.content);
      printSection('3. AVISO DE COOKIES', legalData.avisoCookies.content);

      doc.save(`${project.name}_legal_compliance.pdf`);
      setExportNotice('Documento PDF generado exitosamente');
      setTimeout(() => setExportNotice(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const isLocked = legalStatus.isLocked;

  return (
    <div
      className="w-full min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white"
      id="project-legal-root"
    >
      <ProjectSidebarDrawer
        isOpen={isDrawerOpen}
        project={project}
        activeModule="legal"
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
              id="btn-legal-hamburger"
              className="p-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              id="btn-legal-back"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              id="btn-legal-home"
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
              <div className="w-12 h-12 rounded-2xl bg-[#1a2342] border border-[#2b396a] flex items-center justify-center text-[#818cf8] shrink-0 shadow-lg">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white tracking-tight">Legal & Compliance</h1>
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                      🔴 Bloqueado
                    </span>
                  ) : legalStatus.status === 'actualizado' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                      🟢 Actualizado
                    </span>
                  ) : legalStatus.status === 'desactualizado' ? (
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
                  Marco jurídico, términos del servicio, política de privacidad y protección de datos sensibles.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleGenerateDocuments}
                disabled={isLocked || isGenerating}
                id="btn-generate-legal"
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isLocked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generando...' : 'Generar Documentos'}</span>
              </button>

              <button
                onClick={() => handleExportMarkdown('all')}
                disabled={isLocked || !legalData.lastGeneratedAt}
                id="btn-export-legal"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#161c33] hover:bg-[#20294b] border border-[#27335e] text-[#a5b4fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exportar Markdown"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar .MD</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isLocked || !legalData.lastGeneratedAt}
                id="btn-export-legal-pdf"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#161c33] hover:bg-[#20294b] border border-[#27335e] text-[#a5b4fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Términos y Condiciones</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Política de Privacidad</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Tratamiento de Datos</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Consentimiento de Menores</span>
              <span className="px-2 py-0.5 rounded-md bg-[#141a2e] border border-[#222c4d] text-slate-300">Cookies / Tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Dependencias: <strong className="text-white">Modelo Comercial + Vehículo</strong></span>
              <span>Versión: <strong className="text-white">v1.2</strong></span>
            </div>
          </div>
        </div>

        {/* Feedback Alert if blocked */}
        {isLocked && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-rose-200">Módulo Bloqueado por Dependencias Faltantes</h4>
              <p className="text-rose-300/80 leading-relaxed">
                Legal & Compliance no puede generarse de forma segura sin antes definir el Modelo Comercial (Pricing & Unit Economics en Contexto 1.5) y el Vehículo de Entrega (Contexto 1.4).
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-rose-300 font-medium">
                {legalStatus.missingBlockers.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
              <button
                onClick={() => onNavigateModule && onNavigateModule('maestro')}
                className="mt-2 text-xs font-bold text-rose-300 underline hover:text-white cursor-pointer"
              >
                Ir al Documento Maestro para completar los campos requeridos →
              </button>
            </div>
          </div>
        )}

        {exportNotice && (
          <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* CRITICAL FIELD: ¿El producto procesa datos de menores o datos sensibles? */}
        <div className="bg-[#0d1120] border border-[#1b2340] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#818cf8] uppercase block">
                Campo Crítico de Cumplimiento
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                ¿El producto procesa datos de menores o datos sensibles?
              </h3>
              <p className="text-xs text-[#8e9bb0] mt-0.5">
                Ejemplos: salud, diagnósticos, ubicación, biométricos, información médica, datos financieros o de menores.
              </p>
            </div>

            {/* Radio Selectors: Sí / No / Por definir */}
            <div className="flex items-center gap-2 bg-[#121629] p-1 rounded-xl border border-[#222a4c] shrink-0">
              {(['Sí', 'No', 'Por definir'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    handleUpdateLegal({
                      ...legalData,
                      procesaDatosSensiblesOmenores: opt,
                      isCustomized: true,
                    });
                  }}
                  id={`btn-sensitive-opt-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    legalData.procesaDatosSensiblesOmenores === opt
                      ? opt === 'Sí'
                        ? 'bg-rose-600 text-white shadow-md'
                        : opt === 'No'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#1a213c]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* AUTOMATIC CHECKLIST IF YES */}
          {legalData.procesaDatosSensiblesOmenores === 'Sí' && (
            <div className="mt-4 pt-4 border-t border-[#182038] bg-[#12162a] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Checklist Obligatorio de Protección y Datos Sensibles (9 Puntos)
                </span>
                <span className="text-[11px] text-[#8e9bb0]">
                  {Object.values(legalData.sensitiveChecklist).filter(Boolean).length}/9 completados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {[
                  { key: 'consentimientoParental', label: '1. Consentimiento parental verificable (tutores legales)' },
                  { key: 'minimizacionDatos', label: '2. Principio de minimización estricta de datos' },
                  { key: 'finalidadTratamiento', label: '3. Finalidad explícita, legítima y sin fines secundarios' },
                  { key: 'retencionInformacion', label: '4. Política clara de retención temporal de información' },
                  { key: 'eliminacionDatos', label: '5. Mecanismo simple de eliminación total de datos a petición' },
                  { key: 'accesoRectificacion', label: '6. Derechos de acceso, rectificación y exportación (ARCO)' },
                  { key: 'restriccionesTerceros', label: '7. Prohibición estricta de venta o cesión a brokers de datos' },
                  { key: 'seguridadCifrado', label: '8. Cifrado obligatorio en reposo (AES-256) y tránsito (TLS 1.3)' },
                  { key: 'consentimientosExplicitos', label: '9. Checkbox explícito no premarcado antes del registro' },
                ].map((item) => {
                  const isChecked = legalData.sensitiveChecklist[item.key as keyof SensitiveDataChecklist];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#151c35] border-[#293663] text-slate-200'
                          : 'bg-[#101424] border-[#1e243a] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSensitiveItem(item.key as keyof SensitiveDataChecklist)}
                        className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-xs leading-snug font-medium">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation for Generated Documents */}
        <div className="flex items-center gap-2 border-b border-[#1b2340] pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Resumen Legal' },
            { id: 'terms', label: 'Términos y Condiciones' },
            { id: 'privacy', label: 'Política de Privacidad' },
            { id: 'cookies', label: 'Cookies y Tracking' },
            { id: 'sensitive', label: 'Licencias & Terceros' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1e2547] text-white border border-[#313c6e]'
                  : 'text-slate-400 hover:text-white hover:bg-[#121629]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="bg-[#0d101e] border border-[#1b2340] rounded-2xl p-5 shadow-xl space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Estado de Documentación Jurídica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#121629] p-3.5 rounded-xl border border-[#202747] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Términos</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${legalData.terminosCondiciones.status === 'Generado' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                      {legalData.terminosCondiciones.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Contrato de servicio, exclusión de garantías médicas y suscripciones.</p>
                </div>

                <div className="bg-[#121629] p-3.5 rounded-xl border border-[#202747] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Privacidad</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${legalData.politicaPrivacidad.status === 'Generado' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                      {legalData.politicaPrivacidad.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">RGPD, derechos ARCO, bases jurídicas y retención de información.</p>
                </div>

                <div className="bg-[#121629] p-3.5 rounded-xl border border-[#202747] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Cookies</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${legalData.avisoCookies.status === 'Generado' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                      {legalData.avisoCookies.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Aviso técnico de almacenamiento local y cookies analíticas.</p>
                </div>
              </div>

              {!legalData.lastGeneratedAt && (
                <div className="p-4 bg-[#141829] border border-[#212742] rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    Haz clic en &quot;Generar Documentos&quot; para crear los borradores basados en la información real del Documento Maestro.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Términos y Condiciones Generados</h4>
                <button
                  onClick={() => handleExportMarkdown('terms')}
                  className="text-xs text-[#818cf8] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar .MD
                </button>
              </div>
              <textarea
                value={legalData.terminosCondiciones.content}
                onChange={(e) => {
                  handleUpdateLegal({
                    ...legalData,
                    terminosCondiciones: {
                      ...legalData.terminosCondiciones,
                      content: e.target.value,
                    },
                    isCustomized: true,
                  });
                }}
                placeholder="Presiona 'Generar Documentos' para autocompletar este texto legal con los datos del proyecto..."
                rows={14}
                className="w-full bg-[#111526] border border-[#1e2540] rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-[#818cf8]"
              />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Política de Privacidad</h4>
                <button
                  onClick={() => handleExportMarkdown('privacy')}
                  className="text-xs text-[#818cf8] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar .MD
                </button>
              </div>
              <textarea
                value={legalData.politicaPrivacidad.content}
                onChange={(e) => {
                  handleUpdateLegal({
                    ...legalData,
                    politicaPrivacidad: {
                      ...legalData.politicaPrivacidad,
                      content: e.target.value,
                    },
                    isCustomized: true,
                  });
                }}
                placeholder="Presiona 'Generar Documentos' para autocompletar la política de privacidad..."
                rows={14}
                className="w-full bg-[#111526] border border-[#1e2540] rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-[#818cf8]"
              />
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Aviso de Cookies y Tracking</h4>
                <button
                  onClick={() => handleExportMarkdown('cookies')}
                  className="text-xs text-[#818cf8] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar .MD
                </button>
              </div>
              <textarea
                value={legalData.avisoCookies.content}
                onChange={(e) => {
                  handleUpdateLegal({
                    ...legalData,
                    avisoCookies: {
                      ...legalData.avisoCookies,
                      content: e.target.value,
                    },
                    isCustomized: true,
                  });
                }}
                placeholder="Presiona 'Generar Documentos' para autocompletar el aviso de cookies..."
                rows={10}
                className="w-full bg-[#111526] border border-[#1e2540] rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-[#818cf8]"
              />
            </div>
          )}

          {activeTab === 'sensitive' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Licencias de Terceros y Código Abierto</h4>
              <div className="bg-[#121629] p-4 rounded-xl border border-[#202747] space-y-2">
                <p className="text-xs text-slate-300">
                  Dependencias utilizadas en el producto y compatibilidad de licencias comerciales:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {legalData.licenciasTerceros.items.map((lic, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
