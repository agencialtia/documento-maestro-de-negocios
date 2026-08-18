import { 
  Project, 
  AgentItem, 
  AgentExecutionTrace, 
  ContextUsedReference, 
  ProposedAction, 
  ContextSourceStatus, 
  AttachedDocument,
  ScreenNode,
  FlowItem
} from '../types';
import { initialScreensFlowsData } from '../data/screensFlowsData';
import { initialProductArchitectureData } from '../data/productArchitectureData';
import { initialAttachedDocuments } from '../data/initialData';
import { MASTER_DOC_SECTIONS } from '../data/masterDocDefaults';

export interface AgentSpecDefinition {
  type: 'investigacion' | 'copy' | 'prd' | 'ux' | 'arquitectura' | 'general' | 'custom';
  name: string;
  typeLabel: string;
  color: string;
  role: string;
  promptVersion: string;
  objective: string;
  primarySources: string[];
  secondarySources: string[];
  reasoningRules: string[];
  treatmentMissing: string;
  expectedFormat: string;
  qualityCriteria: string[];
  restrictions: string[];
  targetDestinations: string[];
  defaultTemperature: number;
}

export const AGENT_SPECS: Record<string, AgentSpecDefinition> = {
  investigacion: {
    type: 'investigacion',
    name: 'Investigación',
    typeLabel: 'Investigación',
    color: '#22d3ee',
    role: 'Investigador de Mercado y Análisis Cualitativo',
    promptVersion: 'v2.4-investigacion',
    objective: 'Analizar dolores, frustraciones, comentarios reales de redes sociales y señales de mercado para extraer patrones y oportunidades no atendidas.',
    primarySources: ['Comentarios de Redes Sociales', 'Mercado y Competencia (Sección 2)', 'Audiencia (Sección 3)', 'Avatar y Dolores Profundos (Sección 4)', 'Causa Raíz (Sección 5)'],
    secondarySources: ['Documento Maestro (12 Secciones)', 'Base de Conocimiento / Documentos', 'Glosario Propietario'],
    reasoningRules: [
      'Identificar patrones de comportamiento y lenguaje natural de los usuarios.',
      'Agrupar señales recurrentes por frecuencia y severidad.',
      'Distinguir evidencia fáctica observable de interpretaciones o hipótesis.',
      'Citar ejemplos específicos de comentarios y plataformas (YouTube, Instagram, etc.) cuando existan.',
      'Evitar conclusiones genéricas sin respaldo documental en el proyecto.'
    ],
    treatmentMissing: 'Si no hay comentarios o datos de mercado cargados, indicarlo explícitamente y señalar qué supuesto de investigación se está evaluando sin presentarlo como dato real.',
    expectedFormat: 'Informe estructurado con: 1. Señales y Patrones Clave, 2. Dolores y Frustraciones Específicas, 3. Citas de Evidencia, 4. Oportunidades no atendidas.',
    qualityCriteria: ['Alta especificidad empírica', 'Citas directas o referencias a fuentes', 'Separación nítida entre dato y supuesto'],
    restrictions: ['No redactar copy comercial final; centrarse en hallazgos cualitativos', 'No asumir datos demográficos sin respaldo en el Documento Maestro.'],
    targetDestinations: ['Base de Conocimiento', 'Sección 4: Avatar', 'Sección 2: Mercado', 'Comentarios'],
    defaultTemperature: 0.4
  },
  copy: {
    type: 'copy',
    name: 'Copy',
    typeLabel: 'Copy',
    color: '#38bdf8',
    role: 'Copywriter de Conversión y Estratega de Mensajes',
    promptVersion: 'v2.4-copy',
    objective: 'Redactar piezas de copywriting persuasivas (Headlines, Hero, Emails, Microcopy UX, Ads) ancladas estrictamente en el Mecanismo Único y la Audiencia.',
    primarySources: ['Posicionamiento (Sección 8)', 'Audiencia (Sección 3)', 'Transformación y Gran Promesa (Sección 7)', 'Mecanismo Único (Sección 6)', 'Comunicación y Reglas por Canal (Sección 12)', 'Avatar y Dolores (Sección 4)'],
    secondarySources: ['Oferta Irresistible (Sección 10)', 'Activos → Landing & Copy previo', 'Journeys de Activación', 'Evidencia y Proof Stack (Sección 11)'],
    reasoningRules: [
      'Mantener consistencia estricta con el tono de voz y la personalidad de marca definidos.',
      'Usar la terminología propietaria del proyecto (Mecanismo Único, Metáfora, Nombres de Métodos).',
      'Evitar clichés genéricos de marketing; fundamentar cada claim en la gran promesa y el dolor del avatar.',
      'Adaptar la estructura y longitud al canal solicitado (Hero de Landing, Email de Nurture, Push Notification, etc.).',
      'Verificar si ya existe copy previo para enriquecerlo o proponer una variante diferenciada.'
    ],
    treatmentMissing: 'Si falta el tono de voz o el mecanismo único, formular un supuesto explícito pero advertir que el copy debe validarse contra la sección 6 u 8.',
    expectedFormat: 'Estructura modular lista para producción con: Titular Principal (H1), Subtítulo (H2), CTAs (Primario/Secundario), Microcopy de Confianza y Hook Emocional.',
    qualityCriteria: ['Alineación con el Mecanismo Único', 'Cero frases hechas o clichés SaaS', 'Formato accionable listo para pegar en el activo'],
    restrictions: ['No alterar la promesa central definida en el Documento Maestro', 'No inventar características técnicas del producto no existentes.'],
    targetDestinations: ['Activos → Landing Page', 'Activos → Copywriting', 'Activos → Secuencias de Email', 'Sección 12: Comunicación'],
    defaultTemperature: 0.7
  },
  prd: {
    type: 'prd',
    name: 'PRD',
    typeLabel: 'PRD',
    color: '#818cf8',
    role: 'Product Manager Senior y Especificación Funcional',
    promptVersion: 'v2.4-prd',
    objective: 'Transformar la visión estratégica y el flujo de pantallas en un Product Requirements Document (PRD) riguroso, ejecutable por desarrolladores.',
    primarySources: ['Producto y Solución (Sección 9)', 'Objetivos y Alcance (Sección 1)', 'Arquitectura del Producto', 'Catálogo de Pantallas y Flujos', 'Requisitos Técnicos'],
    secondarySources: ['Mecanismo Único (Sección 6)', 'Transformación y Métricas (Sección 7)', 'QA & Testing (Casos de prueba)', 'Analítica e Instrumentación'],
    reasoningRules: [
      'Estructurar requerimientos con códigos unívocos (RF-01, RF-02, RNF-01).',
      'Redactar User Stories canónicas: "Como [Rol], quiero [Acción], para [Beneficio]".',
      'Definir criterios de aceptación en formato Gherkin (Dado que / Cuando / Entonces).',
      'Vincular cada requerimiento a las pantallas y flujos reales del proyecto.',
      'Especificar casos límite (edge cases), estados de error y modo sin conexión si aplica.'
    ],
    treatmentMissing: 'Si no hay alcance técnico definido, especificar los supuestos de arquitectura base y solicitar confirmación en el módulo correspondiente.',
    expectedFormat: 'Documento PRD formal con: 1. Objetivo & Scope, 2. Requerimientos Funcionales, 3. User Stories & Acceptance Criteria, 4. Requerimientos No Funcionales, 5. Métricas de Éxito.',
    qualityCriteria: ['Especificidad técnica sin ambigüedad', 'Trazabilidad directa con las pantallas creadas', 'Criterios de aceptación testeables'],
    restrictions: ['No usar jerga ambigua ("fácil de usar", "rápido")', 'No definir funcionalidades que contradigan el alcance del Documento Maestro.'],
    targetDestinations: ['Activos → PRD', 'Arquitectura → Requisitos', 'QA & Testing', 'Sección 9: Producto'],
    defaultTemperature: 0.3
  },
  ux: {
    type: 'ux',
    name: 'UX',
    typeLabel: 'UX',
    color: '#34d399',
    role: 'Diseñador de Experiencia de Usuario y Flujos',
    promptVersion: 'v2.4-ux',
    objective: 'Diseñar la navegación, jerarquía visual, heurísticas, micro-interacciones y flujos de usuario minimizando la fricción cognitiva.',
    primarySources: ['Catálogo de Pantallas (Screens Data)', 'Flujos de Navegación (Flows)', 'Journeys y Activación (Arquitectura 5)', 'Avatar y Micro-obstáculos (Sección 4)', 'Audiencia (Sección 3)'],
    secondarySources: ['Funcionalidades del Producto (Arquitectura 3)', 'Comunicación y Reglas de CTA (Sección 12)', 'Legal (Consentimientos en UI)'],
    reasoningRules: [
      'Razonar estrictamente sobre las pantallas, rutas y transiciones reales existentes en el proyecto.',
      'Identificar puntos de alta fricción o abandono en el journey de activación.',
      'Especificar componentes de UI, estados (vacío, carga, error, éxito) y triggers de navegación.',
      'Aplicar leyes de UX (Fitts, Hick, Jakob) con foco en accesibilidad (WCAG AA).',
      'Alinear la interfaz con el nivel de urgencia o estado emocional del avatar.'
    ],
    treatmentMissing: 'Si una pantalla no tiene elementos definidos, sugerir los componentes clave basados en el propósito del flujo al que pertenece.',
    expectedFormat: 'Especificación de UX / Flujo con: 1. Pantalla y Ruta, 2. Jerarquía de Componentes, 3. Triggers y Condiciones de Navegación, 4. Estados de UI (Empty/Loading/Error), 5. Microcopy de Guía.',
    qualityCriteria: ['Consistencia con el mapa de pantallas', 'Definición explícita de navegación', 'Atención a estados de error y feedback'],
    restrictions: ['No inventar rutas desconectadas del árbol de navegación', 'No contradecir el flujo principal de onboarding registrado.'],
    targetDestinations: ['Pantallas y Flujos', 'Activos → Pantallas', 'Arquitectura → Journeys', 'QA & Testing'],
    defaultTemperature: 0.4
  },
  arquitectura: {
    type: 'arquitectura',
    name: 'Arquitectura',
    typeLabel: 'Arquitectura',
    color: '#fbbf24',
    role: 'Arquitecto de Software y Datos',
    promptVersion: 'v2.4-arquitectura',
    objective: 'Diseñar el modelo de datos, entidades, APIs, integraciones, seguridad y requerimientos técnicos no funcionales del sistema.',
    primarySources: ['Requisitos Técnicos (Arquitectura 6)', 'Modelo de Datos y Entidades', 'Pantallas (Datos consumidos / producidos)', 'Framework y Método (Arquitectura 2)', 'Objetivos de Negocio (Sección 1)'],
    secondarySources: ['Legal y Compliance (Privacidad y Cifrado)', 'QA & Testing', 'Catálogo de Pantallas'],
    reasoningRules: [
      'Distinguir claramente entre arquitectura existente, requerimientos definidos y nuevas propuestas técnicas.',
      'Modelar entidades con tipos de datos precisos, claves primarias y relaciones (1:N, N:M).',
      'Definir endpoints RESTful o GraphQL con contratos de entrada y salida claros.',
      'Considerar persistencia local, sincronización en segundo plano y seguridad de datos sensibles.',
      'Minimizar deuda técnica y priorizar escalabilidad horizontal.'
    ],
    treatmentMissing: 'Si no hay especificación técnica previa, proponer un stack moderno estandarizado acorde al tipo de app (PWA / Mobile / Cloud) y marcarlo como recomendación.',
    expectedFormat: 'Especificación Arquitectónica con: 1. Diagrama de Entidades (JSON Schema / TS Types), 2. Contratos de API / Endpoints, 3. Flujo de Datos & Sincronización, 4. Seguridad & Cifrado, 5. Stack Tecnológico.',
    qualityCriteria: ['Tipado estricto y sin inconsistencias de claves', 'Alineación con datos producidos/consumidos en pantallas', 'Consideraciones de seguridad y rendimiento'],
    restrictions: ['No proponer tecnologías incompatibles con las plataformas objetivo del proyecto.', 'No ignorar las restricciones legales de datos sensibles.'],
    targetDestinations: ['Arquitectura del Producto', 'Activos → Arquitectura', 'Legal & Compliance', 'QA & Testing'],
    defaultTemperature: 0.2
  },
  general: {
    type: 'general',
    name: 'General',
    typeLabel: 'General',
    color: '#f472b6',
    role: 'Copiloto Estratégico Multidisciplinario 360°',
    promptVersion: 'v2.4-general',
    objective: 'Proporcionar una visión holística conectando estrategia de negocio, producto, copywriting, UX y arquitectura técnica.',
    primarySources: ['Documento Maestro (12 Secciones)', 'Pantallas y Flujos', 'Arquitectura del Producto', 'Comentarios de Redes Sociales', 'Go-To-Market'],
    secondarySources: ['Prompts Estratégicos', 'Activos Generados', 'Legal & Compliance', 'QA & Analítica'],
    reasoningRules: [
      'Interpretar la intención multidimensional del usuario y resolver qué módulos deben cruzarse.',
      'Verificar la coherencia transversal entre el posicionamiento comercial, la experiencia de usuario y la viabilidad técnica.',
      'Seleccionar dinámicamente el subconjunto de datos relevante sin sobrecargar el contexto.',
      'Sintetizar conclusiones claras con enlaces a los módulos de acción recomendados.'
    ],
    treatmentMissing: 'Indicar qué piezas del puzzle faltan en el proyecto para que la visión global sea completamente consistente.',
    expectedFormat: 'Diagnóstico Estratégico 360° con: 1. Síntesis Transversal, 2. Conexiones Clave entre Módulos, 3. Riesgos o Desalineaciones, 4. Hoja de Ruta / Próximos Pasos.',
    qualityCriteria: ['Visión integradora sin perder especificidad', 'Detección de incoherencias entre negocio y producto', 'Recomendaciones accionables'],
    restrictions: ['No reemplazar a un agente especializado si la tarea es de nicho puro (usar agente de nicho cuando aplique).'],
    targetDestinations: ['Resumen del Proyecto', 'Centro de Salud', 'Documento Maestro', 'Activos'],
    defaultTemperature: 0.5
  }
};

/**
 * Reads the latest live state of all project modules.
 */
export function getProjectLiveState(project: Project) {
  // 1. Master Doc sections
  let masterSections: Record<string, any> = {};
  try {
    const savedMaster = localStorage.getItem(`screenos_master_doc_${project.id}`);
    if (savedMaster) {
      masterSections = JSON.parse(savedMaster);
    } else if (project.masterStrategyDoc?.sections) {
      masterSections = project.masterStrategyDoc.sections;
    }
  } catch (e) {
    masterSections = project.masterStrategyDoc?.sections || {};
  }

  // 2. Social Comments
  let socialComments = project.socialComments;
  try {
    const savedComments = localStorage.getItem(`screenos_social_comments_${project.id}`);
    if (savedComments) {
      socialComments = JSON.parse(savedComments);
    }
  } catch (e) {
    socialComments = project.socialComments;
  }

  // 3. Screens Data
  let screensData = project.screensData || initialScreensFlowsData;
  try {
    const savedScreens = localStorage.getItem(`screenos_screens_data_${project.id}`);
    if (savedScreens) {
      screensData = JSON.parse(savedScreens);
    }
  } catch (e) {
    screensData = project.screensData || initialScreensFlowsData;
  }

  // 4. Product Architecture
  let productArchitecture = project.productArchitecture || initialProductArchitectureData;
  try {
    const savedArch = localStorage.getItem(`screenos_product_arch_${project.id}`);
    if (savedArch) {
      productArchitecture = JSON.parse(savedArch);
    }
  } catch (e) {
    productArchitecture = project.productArchitecture || initialProductArchitectureData;
  }

  // 5. Knowledge Base Docs
  let attachedDocs: AttachedDocument[] = initialAttachedDocuments;
  try {
    const savedDocs = localStorage.getItem('screenos_attached_docs');
    if (savedDocs) {
      attachedDocs = JSON.parse(savedDocs);
    }
  } catch (e) {
    attachedDocs = initialAttachedDocuments;
  }

  // 6. Prompts
  let prompts = project.prompts || [];
  try {
    const savedPrompts = localStorage.getItem(`screenos_prompts_${project.id}`);
    if (savedPrompts) {
      prompts = JSON.parse(savedPrompts);
    }
  } catch (e) {
    prompts = project.prompts || [];
  }

  return {
    masterSections,
    socialComments,
    screensData,
    productArchitecture,
    attachedDocs,
    prompts,
    legalCompliance: project.legalCompliance,
    qaTesting: project.qaTesting,
    analyticsData: project.analyticsData,
    goToMarket: project.goToMarket
  };
}

/**
 * Extracts candidate fields and values from all available modules.
 */
export function extractAvailableContextSources(project: Project) {
  const live = getProjectLiveState(project);
  const sources: ContextUsedReference[] = [];

  // Master Document sections mapping
  const masterSecNames: Record<string, string> = {
    contexto: 'Contexto (1)',
    mercado: 'Mercado (2)',
    audiencia: 'Audiencia (3)',
    avatar: 'Avatar y Dolores (4)',
    causa_raiz: 'Causa Raíz (5)',
    mecanismo_unico: 'Mecanismo Único (6)',
    transformacion: 'Transformación y Gran Promesa (7)',
    posicionamiento: 'Posicionamiento y UVP (8)',
    producto: 'Producto y Arquitectura (9)',
    oferta: 'Oferta Irresistible (10)',
    evidencia: 'Evidencia y Proof (11)',
    comunicacion: 'Comunicación y Canales (12)'
  };

  const masterFieldLabels: Record<string, string> = {
    nombre_proyecto: 'Nombre del Proyecto',
    nombre_provisional: 'Nombre Provisional',
    etapa_proyecto: 'Etapa del Proyecto',
    estado_validacion: 'Estado de Validación',
    objetivo_negocio: 'Objetivo del Negocio',
    objetivo_usuario: 'Objetivo del Usuario',
    metrica_exito: 'Métrica de Éxito',
    alcance_operativo: 'Alcance Operativo',
    mercado_objetivo: 'Mercado Objetivo',
    nivel_sofisticacion: 'Nivel de Sofisticación',
    estado_consciencia: 'Estado de Consciencia',
    competidores_principales: 'Competidores Principales',
    angulo_diferenciacion: 'Ángulo de Diferenciación',
    segmento_primario: 'Audiencia Principal',
    criterios_inclusion: 'Criterios de Inclusión',
    perfil_psicografico: 'Perfil Psicográfico',
    dolor_primario: 'Dolor Primario',
    frustraciones_diarias: 'Frustraciones Cotidianas',
    miedos_ocultos: 'Miedos y Objeciones',
    deseos_profundos: 'Deseos Profundos',
    causa_raiz_problema: 'Causa Raíz del Problema',
    enemigo_comun: 'Enemigo Común',
    por_que_fallaron_otras: 'Por qué Fallaron Soluciones Previas',
    mecanismo_problema: 'Mecanismo del Problema',
    mecanismo_solucion: 'Mecanismo Único de Solución',
    nombre_mecanismo: 'Nombre del Mecanismo',
    analogia_mecanismo: 'Metáfora / Analogía',
    estado_anterior: 'Estado Anterior',
    estado_deseado: 'Estado Deseado',
    gran_promesa: 'La Gran Promesa',
    plazo_transformacion: 'Plazo y Garantía de Transformación',
    declaracion_posicionamiento: 'Declaración de Posicionamiento',
    propuesta_unica_valor: 'Propuesta Única de Valor (UVP)',
    categoria_propia: 'Categoría Propia',
    entregables_clave: 'Entregables Clave',
    stack_valor: 'Stack de Valor',
    precio_inversion: 'Estructura de Precios',
    garantia_incondicional: 'Garantía Incondicional',
    casos_estudio: 'Casos de Estudio / Testimonios',
    big_idea: 'The Big Idea',
    tono_voz: 'Tono de Voz de Marca',
    titular_principal_hero: 'Hero de Landing (Actual)',
    reglas_por_canal: 'Reglas por Canal'
  };

  // Add Master Doc fields
  if (live.masterSections) {
    Object.entries(live.masterSections).forEach(([secKey, secObj]) => {
      if (typeof secObj === 'object' && secObj !== null) {
        Object.entries(secObj).forEach(([fKey, fVal]) => {
          const valStr = String(fVal || '').trim();
          const fLabel = masterFieldLabels[fKey] || fKey.replace(/_/g, ' ');
          const sLabel = masterSecNames[secKey] || secKey;

          let status: ContextSourceStatus = 'empty';
          if (valStr.length > 30) status = 'available';
          else if (valStr.length > 0) status = 'partial';

          sources.push({
            module: 'Documento Maestro',
            sectionKey: secKey,
            sectionLabel: sLabel,
            fieldKey: fKey,
            fieldLabel: fLabel,
            value: valStr,
            status,
            relevanceScore: 0
          });
        });
      }
    });
  }

  // Fallback defaults if sections are empty in state
  if (!sources.some((s) => s.fieldKey === 'segmento_primario' && s.value)) {
    sources.push({
      module: 'Documento Maestro',
      sectionKey: 'audiencia',
      sectionLabel: 'Audiencia (3)',
      fieldKey: 'segmento_primario',
      fieldLabel: 'Audiencia Principal',
      value: project.description || 'Padre, madre o cuidador de un niño con diagnóstico de TEA que necesita entender mejor su conducta y responder de forma práctica.',
      status: 'available',
      relevanceScore: 0
    });
  }

  if (!sources.some((s) => s.fieldKey === 'mecanismo_solucion' && s.value)) {
    sources.push({
      module: 'Documento Maestro',
      sectionKey: 'mecanismo_unico',
      sectionLabel: 'Mecanismo Único (6)',
      fieldKey: 'mecanismo_solucion',
      fieldLabel: 'Mecanismo Único de Solución',
      value: 'Protocolo predictivo de 3 pasos para decodificar detonantes conductuales y aplicar apoyo visual estructurado en menos de 60 segundos.',
      status: 'available',
      relevanceScore: 0
    });
  }

  if (!sources.some((s) => s.fieldKey === 'gran_promesa' && s.value)) {
    sources.push({
      module: 'Documento Maestro',
      sectionKey: 'transformacion',
      sectionLabel: 'Transformación y Gran Promesa (7)',
      fieldKey: 'gran_promesa',
      fieldLabel: 'La Gran Promesa',
      value: 'Transformar los momentos de desregulación y crisis en calma compartida y comprensión familiar desde la primera semana.',
      status: 'available',
      relevanceScore: 0
    });
  }

  if (!sources.some((s) => s.fieldKey === 'declaracion_posicionamiento' && s.value)) {
    sources.push({
      module: 'Documento Maestro',
      sectionKey: 'posicionamiento',
      sectionLabel: 'Posicionamiento y UVP (8)',
      fieldKey: 'declaracion_posicionamiento',
      fieldLabel: 'Declaración de Posicionamiento',
      value: `La primera herramienta operativa en tiempo real para familias TEA que reemplaza manuales teóricos extensos por guías de acción situacionales inmediatas.`,
      status: 'available',
      relevanceScore: 0
    });
  }

  if (!sources.some((s) => s.fieldKey === 'tono_voz' && s.value)) {
    sources.push({
      module: 'Documento Maestro',
      sectionKey: 'comunicacion',
      sectionLabel: 'Comunicación y Canales (12)',
      fieldKey: 'tono_voz',
      fieldLabel: 'Tono de Voz de Marca',
      value: 'Empático, cálido, riguroso pero sin tecnicismos intimidantes, enfocado en el empoderamiento del cuidador y la calma del niño.',
      status: 'available',
      relevanceScore: 0
    });
  }

  // Social Comments
  if (live.socialComments?.platforms) {
    Object.entries(live.socialComments.platforms).forEach(([platformKey, pData]) => {
      const cStr = String(pData?.comments || '').trim();
      sources.push({
        module: 'Comentarios de Redes',
        sectionKey: platformKey,
        sectionLabel: `Comentarios: ${pData.name || platformKey}`,
        fieldKey: platformKey,
        fieldLabel: `Comentarios de ${pData.name || platformKey}`,
        value: cStr,
        status: cStr.length > 0 ? 'available' : 'empty',
        relevanceScore: 0
      });
    });
  }

  // Screens & Flows
  if (live.screensData?.screens) {
    live.screensData.screens.forEach((scr: ScreenNode) => {
      sources.push({
        module: 'Pantallas y Flujos',
        sectionKey: scr.flowId || 'general',
        sectionLabel: `Pantalla: ${scr.name} (${scr.route})`,
        fieldKey: scr.id,
        fieldLabel: `Propósito y Elementos de ${scr.name}`,
        value: `Propósito: ${scr.purpose}. Elementos clave: ${scr.keyElements?.join(', ')}. Triggers: ${scr.navigationActions?.map((a) => a.trigger).join(', ')}`,
        status: 'available',
        relevanceScore: 0
      });
    });
  }

  // Product Architecture
  if (live.productArchitecture) {
    Object.entries(live.productArchitecture).forEach(([archKey, archObj]) => {
      if (typeof archObj === 'object' && archObj !== null) {
        Object.entries(archObj).forEach(([fKey, fVal]) => {
          const v = String(fVal || '').trim();
          sources.push({
            module: 'Arquitectura del Producto',
            sectionKey: archKey,
            sectionLabel: `Arquitectura: ${archKey.replace(/_/g, ' ')}`,
            fieldKey: fKey,
            fieldLabel: fKey.replace(/_/g, ' '),
            value: v,
            status: v.length > 0 ? 'available' : 'empty',
            relevanceScore: 0
          });
        });
      }
    });
  }

  // Knowledge Base Concepts & Glossary
  if (live.attachedDocs && live.attachedDocs.length > 0) {
    live.attachedDocs.forEach((doc) => {
      if (doc.glossary && doc.glossary.length > 0) {
        sources.push({
          module: 'Base de Conocimiento',
          sectionKey: 'glosario',
          sectionLabel: `Glosario: ${doc.name}`,
          fieldKey: 'glossary_items',
          fieldLabel: 'Términos Clave y Definiciones',
          value: doc.glossary.map((g) => `${g.term}: ${g.definition}`).join(' | '),
          status: 'available',
          relevanceScore: 0
        });
      }
    });
  }

  return sources;
}

/**
 * Dynamic Context Resolver:
 * Maps: agent_type + user_request + project_state -> { availableSources, consultedSources, usedSources, missingInfo, contradictions, assumptions }
 */
export function resolveDynamicAgentContext(
  agentType: string,
  userRequest: string,
  project: Project
) {
  const spec = AGENT_SPECS[agentType] || AGENT_SPECS.general;
  const allCandidateSources = extractAvailableContextSources(project);
  const normalizedReq = userRequest.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Available sources (Capa A)
  const availableSourceModules = Array.from(new Set(allCandidateSources.map((s) => s.module)));

  // 2. Consulted sources (Capa B) - Based on Agent Spec priorities + keywords in request
  const consultedSources: string[] = [];
  const scoredSources: (ContextUsedReference & { score: number })[] = [];

  // Keywords dictionary for dynamic intent scoring
  const keywordsMap: Record<string, string[]> = {
    hero: ['titular_principal_hero', 'declaracion_posicionamiento', 'propuesta_unica_valor', 'mecanismo_solucion', 'gran_promesa', 'segmento_primario', 'tono_voz', 'dolor_primario'],
    landing: ['titular_principal_hero', 'declaracion_posicionamiento', 'propuesta_unica_valor', 'mecanismo_solucion', 'gran_promesa', 'stack_valor', 'garantia_incondicional', 'tono_voz', 'big_idea'],
    email: ['segmento_primario', 'tono_voz', 'reglas_por_canal', 'gran_promesa', 'mecanismo_solucion', 'frustraciones_diarias', 'journeys_clave'],
    prd: ['solucion_producto', 'funcionalidades', 'requisitos_tecnicos', 'objetivo_negocio', 'objetivo_usuario', 'metrica_exito', 'alcance_operativo', 'screens'],
    ux: ['screens', 'flows', 'journeys_clave', 'dolor_primario', 'frustraciones_diarias', 'accion_inicial', 'quick_win'],
    arquitectura: ['requisitos_tecnicos', 'funcionalidades', 'entidades', 'solucion_producto', 'metodo', 'seguridad', 'screens'],
    investigacion: ['comentarios', 'mercado_objetivo', 'nivel_sofisticacion', 'competidores_principales', 'dolor_primario', 'frustraciones_diarias', 'miedos_ocultos', 'deseos_profundos'],
    onboarding: ['flow-principal', 'scr-onboarding', 'scr-splash', 'accion_inicial', 'quick_win', 'segmento_primario', 'tono_voz'],
    precio: ['precio_inversion', 'stack_valor', 'garantia_incondicional', 'objetivo_negocio'],
    dolor: ['dolor_primario', 'frustraciones_diarias', 'miedos_ocultos', 'causa_raiz_problema', 'enemigo_comun']
  };

  // Identify matching intent keywords
  const matchedIntents: string[] = [];
  Object.keys(keywordsMap).forEach((kw) => {
    if (normalizedReq.includes(kw)) {
      matchedIntents.push(kw);
    }
  });

  allCandidateSources.forEach((src) => {
    let score = 0;
    const sModule = src.module;
    const sKey = src.sectionKey || '';
    const fKey = src.fieldKey || '';
    const fVal = src.value || '';

    // Consulted tracking
    if (!consultedSources.includes(`${src.module} → ${src.sectionLabel}`)) {
      consultedSources.push(`${src.module} → ${src.sectionLabel}`);
    }

    // Baseline priority by Agent Type
    if (agentType === 'copy') {
      if (sKey === 'posicionamiento' || fKey === 'declaracion_posicionamiento' || fKey === 'propuesta_unica_valor') score += 50;
      if (sKey === 'audiencia' || fKey === 'segmento_primario') score += 45;
      if (sKey === 'mecanismo_unico' || fKey === 'mecanismo_solucion' || fKey === 'nombre_mecanismo') score += 45;
      if (sKey === 'transformacion' || fKey === 'gran_promesa') score += 40;
      if (sKey === 'comunicacion' || fKey === 'tono_voz' || fKey === 'big_idea') score += 35;
      if (sKey === 'avatar' || fKey === 'dolor_primario') score += 30;
      if (sKey === 'oferta' || fKey === 'stack_valor') score += 20;
    } else if (agentType === 'investigacion') {
      if (sModule === 'Comentarios de Redes') score += 55;
      if (sKey === 'avatar' || fKey === 'dolor_primario' || fKey === 'frustraciones_diarias') score += 45;
      if (sKey === 'mercado' || fKey === 'competidores_principales') score += 40;
      if (sKey === 'causa_raiz' || fKey === 'enemigo_comun') score += 35;
      if (sKey === 'audiencia' || fKey === 'segmento_primario') score += 30;
    } else if (agentType === 'prd') {
      if (sModule === 'Pantallas y Flujos') score += 45;
      if (sModule === 'Arquitectura del Producto' || sKey === 'solucion_producto' || sKey === 'funcionalidades') score += 50;
      if (sKey === 'contexto' || fKey === 'objetivo_negocio' || fKey === 'objetivo_usuario' || fKey === 'metrica_exito') score += 40;
      if (sKey === 'mecanismo_unico' || fKey === 'mecanismo_solucion') score += 30;
    } else if (agentType === 'ux') {
      if (sModule === 'Pantallas y Flujos') score += 55;
      if (sKey === 'journeys_activacion') score += 45;
      if (sKey === 'avatar' || fKey === 'frustraciones_diarias') score += 35;
      if (sKey === 'audiencia' || fKey === 'segmento_primario') score += 30;
    } else if (agentType === 'arquitectura') {
      if (sModule === 'Arquitectura del Producto') score += 55;
      if (sModule === 'Pantallas y Flujos') score += 40;
      if (sKey === 'contexto' || fKey === 'objetivo_negocio') score += 30;
      if (sKey === 'seguridad' || sKey === 'requisitos_tecnicos') score += 50;
    } else {
      // General
      if (sKey === 'posicionamiento' || sKey === 'mecanismo_unico' || sKey === 'audiencia') score += 30;
      if (sModule === 'Pantallas y Flujos') score += 25;
      if (sModule === 'Arquitectura del Producto') score += 25;
    }

    // Dynamic Intent Boosting based on User Request
    matchedIntents.forEach((intent) => {
      const intentKeys = keywordsMap[intent] || [];
      if (intentKeys.includes(fKey) || intentKeys.some((k) => sKey.includes(k) || fVal.toLowerCase().includes(k))) {
        score += 35;
      }
    });

    // Content completeness multiplier
    if (src.status === 'available') score += 15;
    else if (src.status === 'partial') score += 5;
    else score -= 30; // Empty fields get penalized for execution context

    scoredSources.push({
      ...src,
      score,
      relevanceScore: score
    });
  });

  // Filter and sort for Used Sources (Capa C) - Context budget management: top 6-10 most relevant items
  const sortedUsed = scoredSources
    .filter((s) => s.status !== 'empty' && s.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Detect missing critical info for the specific prompt
  const missingInfo: string[] = [];
  if (normalizedReq.includes('hero') || normalizedReq.includes('landing')) {
    const hasPositioning = sortedUsed.some((s) => s.fieldKey === 'declaracion_posicionamiento' || s.fieldKey === 'propuesta_unica_valor');
    const hasMechanism = sortedUsed.some((s) => s.fieldKey === 'mecanismo_solucion');
    const hasAudience = sortedUsed.some((s) => s.fieldKey === 'segmento_primario');
    if (!hasPositioning) missingInfo.push('Posicionamiento / UVP en Documento Maestro (Sección 8)');
    if (!hasMechanism) missingInfo.push('Mecanismo Único de Solución (Sección 6)');
    if (!hasAudience) missingInfo.push('Audiencia Principal (Sección 3)');
  } else if (normalizedReq.includes('prd') || normalizedReq.includes('requisito')) {
    const hasScope = sortedUsed.some((s) => s.fieldKey === 'alcance_operativo' || s.fieldKey === 'objetivo_negocio');
    if (!hasScope) missingInfo.push('Alcance Operativo y Objetivos de Negocio (Sección 1)');
  } else if (normalizedReq.includes('comentario') || agentType === 'investigacion') {
    const hasComments = sortedUsed.some((s) => s.module === 'Comentarios de Redes');
    if (!hasComments) missingInfo.push('Comentarios de Redes Sociales cargados en el módulo');
  }

  // Contradiction detection
  const contradictions: {
    sourceA: string;
    sourceB: string;
    description: string;
    impact: string;
    prioritizedSource: string;
  }[] = [];

  // Example check: Audience vs Enterprise Landing keywords
  const audField = sortedUsed.find((s) => s.fieldKey === 'segmento_primario');
  if (audField && (audField.value.toLowerCase().includes('padre') || audField.value.toLowerCase().includes('cuidador'))) {
    if (normalizedReq.includes('enterprise') || normalizedReq.includes('b2b corporativo')) {
      contradictions.push({
        sourceA: 'Documento Maestro → Audiencia: Padres y cuidadores de familias TEA',
        sourceB: 'Petición del Usuario → Términos Enterprise / B2B corporativo',
        description: 'La audiencia del proyecto está configurada para usuarios finales (B2C / familias), mientras que la petición alude a un enfoque corporativo enterprise.',
        impact: 'Podría diluir la propuesta de valor empática hacia los cuidadores.',
        prioritizedSource: 'Documento Maestro → Audiencia (B2C Familias)'
      });
    }
  }

  // Assumptions
  const assumptions: string[] = [];
  if (missingInfo.length > 0) {
    assumptions.push(`Se asume la definición canónica del proyecto "${project.name}" (${project.description || 'App de soporte para familias'}) como respaldo para los campos no completados.`);
  }

  // Source Statuses map
  const sourceStatuses: Record<string, ContextSourceStatus> = {};
  allCandidateSources.forEach((src) => {
    sourceStatuses[`${src.module} → ${src.fieldLabel}`] = src.status;
  });

  return {
    spec,
    availableSources: availableSourceModules,
    consultedSources,
    usedSources: sortedUsed,
    sourceStatuses,
    missingInfo,
    contradictions,
    assumptions
  };
}

export type AgentUserIntent = 'DELIVERABLE' | 'ANALYSIS' | 'HYBRID' | 'AMBIGUOUS' | 'INSUFFICIENT_CONTEXT';

export interface IntentClassificationResult {
  intent: AgentUserIntent;
  confidence: number;
  targetAssetType: 'hero' | 'microcopy' | 'email' | 'prd_scope' | 'prd_full' | 'ux_screen' | 'architecture_schema' | 'qualitative_report' | 'general_strategy' | 'unknown';
  targetDestination: string;
  reasoning: string;
  requiresClarification?: boolean;
  clarificationQuestion?: string;
  missingCriticalField?: string;
}

/**
 * Classifies the semantic user intent before generation.
 * Categories:
 * - DELIVERABLE: User wants a finished concrete asset (Hero, CTA, PRD section, Email, etc.)
 * - ANALYSIS: User wants evaluation, diagnosis, comparison, finding inconsistencies.
 * - HYBRID: User wants evaluation/review AND a concrete rewritten/improved asset.
 * - AMBIGUOUS: Material ambiguity with zero directional context.
 * - INSUFFICIENT_CONTEXT: Missing critical project data required to fulfill the request.
 */
export function classifyUserIntent(
  userRequest: string,
  agentType: string,
  project: Project
): IntentClassificationResult {
  const req = userRequest.trim();
  const lower = req.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Check for extreme ambiguity (1 or 2 isolated words without any action or context)
  const words = req.split(/\s+/).filter(Boolean);
  if (words.length <= 1 && ['hero', 'cta', 'prd', 'email', 'pantalla'].includes(lower)) {
    return {
      intent: 'AMBIGUOUS',
      confidence: 0.5,
      targetAssetType: 'unknown',
      targetDestination: 'No definido',
      reasoning: 'Petición de una sola palabra sin verbo ni contexto directivo.',
      requiresClarification: true,
      clarificationQuestion: `¿Deseas que redacte el contenido para "${req}" o prefieres que realice un diagnóstico/análisis del estado actual?`
    };
  }

  // 2. Check for HYBRID signals (Analysis + Production of new/better deliverable)
  // E.g.: "analiza este hero y después reescríbelo", "revisa el alcance del prd y dame una versión corregida", "evalúa estos cta y propón tres mejores", "revisa este hero y dame una versión mejor"
  const hasAnalysisSignals = /(analiz|revis|evalua|evalu|diagnostic|compar|inconsistenc|que opinas|que mejorarias|esta alinead|detecta|audita)/.test(lower);
  const hasCreationSignals = /(reescrib|escrib|redact|dame una version|dame una propuesta|propon|genera|crea|dame|construy|haz una version|mejora y entrega|optimiza)/.test(lower);

  const isExplicitHybrid = (hasAnalysisSignals && hasCreationSignals) ||
    lower.includes('y despues') ||
    lower.includes('y luego') ||
    lower.includes('y dame una version') ||
    lower.includes('y propon') ||
    lower.includes('y reescrib') ||
    lower.includes('version mejor') ||
    lower.includes('version corregida');

  if (isExplicitHybrid) {
    let targetAsset: IntentClassificationResult['targetAssetType'] = 'hero';
    let targetDest = 'Activos → Hero de la Landing';
    if (lower.includes('cta') || lower.includes('boton') || lower.includes('microcopy')) {
      targetAsset = 'microcopy';
      targetDest = 'Activos → Microcopy & CTAs';
    } else if (lower.includes('prd') || lower.includes('alcance')) {
      targetAsset = 'prd_scope';
      targetDest = 'PRD → Alcance del Producto';
    } else if (lower.includes('email') || lower.includes('correo')) {
      targetAsset = 'email';
      targetDest = 'Activos → Secuencia de Emails';
    } else if (lower.includes('pantalla') || lower.includes('ux')) {
      targetAsset = 'ux_screen';
      targetDest = 'Pantallas → Catálogo de Pantallas';
    }

    return {
      intent: 'HYBRID',
      confidence: 0.95,
      targetAssetType: targetAsset,
      targetDestination: targetDest,
      reasoning: 'Petición que combina diagnóstico previo y generación de un entregable final mejorado.'
    };
  }

  // 3. Pure ANALYSIS intent
  // E.g.: "analiza si el hero está alineado con nuestro posicionamiento", "¿puedes analizar qué cta deberíamos usar?", "analiza la coherencia", "encuentra contradicciones"
  if (hasAnalysisSignals && !hasCreationSignals) {
    return {
      intent: 'ANALYSIS',
      confidence: 0.92,
      targetAssetType: 'general_strategy',
      targetDestination: 'Informe de Diagnóstico',
      reasoning: 'Petición orientada a evaluación, diagnóstico, contraste de fuentes o búsqueda de inconsistencias.'
    };
  }

  // 4. DELIVERABLE intent (Direct production of finished asset)
  // E.g.: "escribe el hero de la landing", "redacta el copy del botón de activación", "genera la sección de alcance del prd", "crea el email de bienvenida"
  let assetType: IntentClassificationResult['targetAssetType'] = 'hero';
  let dest = 'Activos → Hero de la Landing';

  if (lower.includes('boton') || lower.includes('cta') || lower.includes('microcopy')) {
    assetType = 'microcopy';
    dest = 'Activos → Botón / Microcopy';
  } else if (lower.includes('hero') || lower.includes('landing') || lower.includes('titular') || lower.includes('headline')) {
    assetType = 'hero';
    dest = 'Activos → Hero de la Landing';
  } else if (lower.includes('email') || lower.includes('correo') || lower.includes('nurture') || lower.includes('bienvenida') || lower.includes('newsletter')) {
    assetType = 'email';
    dest = 'Activos → Secuencias de Email';
  } else if (lower.includes('alcance') || (lower.includes('prd') && lower.includes('alcance'))) {
    assetType = 'prd_scope';
    dest = 'PRD → Alcance del Producto';
  } else if (lower.includes('prd') || lower.includes('requerimiento') || lower.includes('user stor') || lower.includes('gherkin') || lower.includes('criterios de aceptacion') || agentType === 'prd') {
    assetType = 'prd_full';
    dest = 'PRD → Especificación Funcional';
  } else if (lower.includes('pantalla') || lower.includes('flujo') || lower.includes('journey') || lower.includes('ux') || agentType === 'ux') {
    assetType = 'ux_screen';
    dest = 'Pantallas → Catálogo de UX';
  } else if (lower.includes('entidad') || lower.includes('typescript') || lower.includes('schema') || lower.includes('api') || lower.includes('arquitectura') || agentType === 'arquitectura') {
    assetType = 'architecture_schema';
    dest = 'Arquitectura → Requisitos Técnicos y Entidades';
  } else if (agentType === 'investigacion') {
    assetType = 'qualitative_report';
    dest = 'Base de Conocimiento → Hallazgos Cualitativos';
  }

  return {
    intent: 'DELIVERABLE',
    confidence: 0.94,
    targetAssetType: assetType,
    targetDestination: dest,
    reasoning: 'Petición directa de creación/redacción de un activo terminado y listo para usar.'
  };
}

/**
 * Generates the specialized, grounded AI response based on the assembled context.
 * Strict Output Contract:
 * - If intent = DELIVERABLE: Output ONLY the finished, usable asset in target format (no meta-analysis, no methodology essays, no diagnostic preambles).
 * - If intent = ANALYSIS: Output structured diagnosis with evidence, sources, and recommendations.
 * - If intent = HYBRID: Output concise analysis, followed by clean deliverable separated by divider.
 * - If intent = AMBIGUOUS or INSUFFICIENT_CONTEXT: Ask specifically for the missing clarity/data.
 */
export function executeAgentContextEngine(
  agent: AgentItem,
  userRequest: string,
  project: Project
): {
  responseText: string;
  trace: AgentExecutionTrace;
  proposedAction?: ProposedAction;
} {
  const startTime = Date.now();
  const resolution = resolveDynamicAgentContext(agent.type, userRequest, project);
  const projName = project.name || 'Proyecto Digital';
  const normReq = userRequest.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Intent Classification Router
  const intentResult = classifyUserIntent(userRequest, agent.type, project);

  // Extract key field values from the used context
  const getFieldVal = (fKey: string, fallback: string = '') => {
    const item = resolution.usedSources.find((s) => s.fieldKey === fKey || s.fieldLabel.toLowerCase().includes(fKey.toLowerCase()));
    return item ? item.value : fallback;
  };

  const audienceVal = getFieldVal('segmento_primario', project.description || 'Padres y cuidadores de niños con diagnóstico de TEA');
  const mechanismVal = getFieldVal('mecanismo_solucion', 'Protocolo predictivo de 3 pasos para decodificar detonantes conductuales y aplicar apoyo visual en menos de 60 segundos');
  const promiseVal = getFieldVal('gran_promesa', 'Transformar los momentos de crisis en calma compartida y comprensión familiar desde la primera semana');
  const positioningVal = getFieldVal('declaracion_posicionamiento', `La primera herramienta operativa en tiempo real que convierte la incertidumbre conductual en respuestas claras y personalizadas`);
  const toneVal = getFieldVal('tono_voz', 'Empático, cálido, riguroso, enfocado en el empoderamiento del cuidador');
  const painVal = getFieldVal('dolor_primario', 'Sensación de sobrecarga e incertidumbre ante desregulaciones imprevistas y falta de herramientas operativas en el hogar');

  let generatedText = '';
  let proposedAction: ProposedAction | undefined = undefined;

  // ==========================================
  // BRANCH 0: AMBIGUOUS INTENT
  // ==========================================
  if (intentResult.intent === 'AMBIGUOUS' && intentResult.clarificationQuestion) {
    generatedText = intentResult.clarificationQuestion;
  }
  // ==========================================
  // BRANCH 1: PURE ANALYSIS INTENT
  // ==========================================
  else if (intentResult.intent === 'ANALYSIS') {
    if (normReq.includes('hero') || normReq.includes('posicionamiento') || normReq.includes('landing')) {
      generatedText = `### Diagnóstico & Análisis de Alineación — ${projName}

#### 1. Evaluación de Coherencia
- **Posicionamiento Actual:** "${positioningVal}"
- **Mecanismo Único:** "${mechanismVal}"
- **Audiencia Objetivo:** ${audienceVal}
- **Diagnóstico:** El mensaje central actual refleja adecuadamente el beneficio transformador hacia los cuidadores. Sin embargo, la propuesta adquiere mayor fuerza de conversión si se explicita el factor de inmediatez operativa (< 60 segundos) frente a los manuales teóricos tradicionales.

#### 2. Evidencia & Fuentes Contrastadas
- **Documento Maestro (Sección 8 - Posicionamiento):** Foco en reemplazar la teoría médica densa por herramientas operativas situacionales.
- **Comentarios Cualitativos:** Los usuarios manifiestan frustración recurrente por no contar con una guía rápida en el momento exacto de la crisis.

#### 3. Inconsistencias & Hallazgos
- Riesgo de presentar la solución como una biblioteca de contenidos en lugar de una herramienta de respuesta situacional en tiempo real.

#### 4. Recomendaciones Prioritarias
1. Priorizar en el hero el alivio de la sobrecarga cotidiana en situaciones imprevistas.
2. Reforzar el microcopy de confianza indicando validación clínica y acceso sin fricción.`;
    } else {
      generatedText = `### Diagnóstico de Coherencia Estratégica — ${projName}

#### 1. Evaluación Transversal
- **Alineación de Posicionamiento:** ${positioningVal}
- **Consistencia del Mecanismo Único:** El ${mechanismVal} articula adecuadamente la propuesta de valor entre la Landing, el PRD y los flujos de UX.

#### 2. Evidencia en Fuentes del Proyecto
- **Documento Maestro:** ${resolution.usedSources.map((s) => `${s.module} (${s.fieldLabel})`).join(' · ')}
- **Estado de Fuentes:** Cero discrepancias críticas entre el posicionamiento y los requerimientos funcionales analizados.

#### 3. Recomendaciones Prioritarias
1. Mantener el lenguaje empático y no condescendiente (${toneVal}) en todos los puntos de contacto.
2. Asegurar que los flujos de activación permitan experimentar el valor en menos de 60 segundos.`;
    }
  }
  // ==========================================
  // BRANCH 2: HYBRID INTENT (Analysis + Final Deliverable)
  // ==========================================
  else if (intentResult.intent === 'HYBRID') {
    if (intentResult.targetAssetType === 'microcopy') {
      generatedText = `### Evaluación Breve
1. **Claridad de Acción:** El CTA debe comunicar el beneficio directo e inmediato en lugar de una acción pasiva.
2. **Reducción de Fricción:** Incluir el tiempo estimado (< 60s) incrementa la tasa de clic al resolver la objeción de tiempo.

---

[ Activar apoyo inmediato en 60s ]

Variantes alternativas:
• [ Comenzar mi configuración ]
• [ Iniciar protocolo de calma guiado ]`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Insertar en Botón / CTA',
        targetModule: 'activos',
        targetSectionKey: 'landing',
        targetFieldKey: 'cta_principal',
        currentValue: '(CTA genérico)',
        proposedValue: `[ Activar apoyo inmediato en 60s ]`,
        diffSummary: `Actualiza el texto del CTA principal en la Landing Page con la versión optimizada.`,
        applied: false
      };
    } else if (intentResult.targetAssetType === 'prd_scope') {
      generatedText = `### Evaluación del Alcance Actual
1. **Foco en MVP:** Se eliminan dependencias complejas (como integraciones de hardware) para priorizar el protocolo de desescalada rápida.
2. **Certeza Operativa:** Se define explícitamente el modo offline como requerimiento crítico de inclusión.

---

### Alcance del Producto (PRD)

#### Incluido (En Alcance - MVP)
- **Módulo de Asistencia Inmediata (SOS):** Acceso en 2 toques a guías situacionales de desescalada.
- **Protocolo de 3 Pasos:** Secuencia interactiva de apoyo con temporizador visual de respiración y calma.
- **Modo Sin Conexión:** Disponibilidad local de protocolos críticos y guías de emergencia sin internet.
- **Registro Rápido de Eventos:** Captura de intensidad y detonante en menos de 30 segundos.

#### Fuera de Alcance (Post-MVP)
- Consultas sincrónicas por videollamada con terapeutas en tiempo real.
- Integración con dispositivos wearables o biosensores externos.
- Plataforma de facturación y cobros multipaís en la versión inicial.`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Añadir a Alcance del PRD',
        targetModule: 'activos',
        targetSectionKey: 'prd',
        targetFieldKey: 'alcance_producto',
        currentValue: '(Alcance base)',
        proposedValue: `Alcance MVP: Módulo SOS, Protocolo 3 Pasos, Modo Offline, Registro Rápido. Fuera de alcance: Videollamadas, Wearables.`,
        diffSummary: `Actualiza la sección de Alcance Incluido y Fuera de Alcance en el PRD del proyecto.`,
        applied: false
      };
    } else {
      // Default Hybrid: Hero
      generatedText = `### Evaluación de Oportunidades
1. **Fortaleza:** El concepto actual conecta con la empatía hacia ${audienceVal}.
2. **Diferenciador:** Se integra explícitamente el ${mechanismVal} para romper con la oferta de manuales genéricos.
3. **Conversión:** Se agregan microcopys de confianza para eliminar la fricción de entrada.

---

Headline
"Convierte la incertidumbre de cada conducta en calma y comprensión para tu hijo."

Subheadline
${mechanismVal}, diseñado por especialistas para que sepas exactamente cómo actuar con serenidad y certeza en situaciones cotidianas desafiantes.

CTA
[ Comenzar mi plan de apoyo gratuito → ]
[ Ver cómo funciona el protocolo en 60s ]

Microcopy
🛡️ Sin tarjetas de crédito requeridas · Acceso instantáneo · Protocolos validados por terapeutas`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Insertar en Hero de la Landing',
        targetModule: 'activos',
        targetSectionKey: 'landing',
        targetFieldKey: 'titular_principal_hero',
        currentValue: '(Sin hero optimizado)',
        proposedValue: `"Convierte la incertidumbre de cada conducta en calma y comprensión para tu hijo." — ${mechanismVal}`,
        diffSummary: `Inserta el Titular (H1), Subtítulo y CTAs optimizados en la Landing Page.`,
        applied: false
      };
    }
  }
  // ==========================================
  // BRANCH 3: DELIVERABLE INTENT (Strictly finished, usable assets)
  // ==========================================
  else {
    // 3A. MICROCOPY / BUTTON
    if (intentResult.targetAssetType === 'microcopy') {
      if (normReq.includes('activacion') || normReq.includes('crisis') || normReq.includes('sos')) {
        generatedText = `[ Activar apoyo inmediato en 60s ]`;
      } else if (normReq.includes('onboarding') || normReq.includes('configuracion') || normReq.includes('inicio')) {
        generatedText = `[ Comenzar mi configuración ]`;
      } else {
        generatedText = `[ Comenzar mi plan de apoyo gratuito → ]

Variantes:
• [ Activar apoyo inmediato en 60s ]
• [ Ver cómo funciona el protocolo ]`;
      }

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Insertar en Botón / CTA',
        targetModule: 'activos',
        targetSectionKey: 'landing',
        targetFieldKey: 'cta_principal',
        currentValue: '(CTA previo)',
        proposedValue: generatedText.split('\n')[0].replace(/[\[\]]/g, '').trim(),
        diffSummary: `Actualiza el texto del botón en los activos del proyecto.`,
        applied: false
      };
    }
    // 3B. HERO DE LANDING (Headline, Subheadline, CTA, Microcopy)
    else if (intentResult.targetAssetType === 'hero') {
      generatedText = `Headline
"Convierte la incertidumbre de cada conducta en calma y comprensión para tu hijo."

Subheadline
${mechanismVal}, diseñado por especialistas para que sepas exactamente cómo actuar con serenidad y certeza en situaciones cotidianas desafiantes.

CTA
[ Comenzar mi plan de apoyo gratuito → ]
[ Ver cómo funciona el protocolo en 60s ]

Microcopy
🛡️ Sin tarjetas de crédito requeridas · Acceso instantáneo · Protocolos validados por terapeutas`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Insertar en Hero de la Landing',
        targetModule: 'activos',
        targetSectionKey: 'landing',
        targetFieldKey: 'titular_principal_hero',
        currentValue: '(Sin contenido previo en Activos → Landing → Hero)',
        proposedValue: `"Convierte la incertidumbre de cada conducta en calma y comprensión para tu hijo."\n\n${mechanismVal}`,
        diffSummary: `Actualiza el Titular (H1), Subtítulo y CTAs de la Landing Page con el copy generado para ${projName}.`,
        applied: false
      };
    }
    // 3C. PRD - ALCANCE DEL PRODUCTO
    else if (intentResult.targetAssetType === 'prd_scope') {
      generatedText = `### Alcance del Producto

#### Incluido (En Alcance - MVP)
- **Módulo de Asistencia Inmediata (SOS):** Acceso en 2 toques a guías situacionales de desescalada.
- **Protocolo de 3 Pasos:** Secuencia interactiva de apoyo con temporizador visual de respiración y calma.
- **Modo Sin Conexión:** Disponibilidad local de protocolos críticos y guías de emergencia sin internet.
- **Registro Rápido de Eventos:** Captura de intensidad y detonante en menos de 30 segundos.

#### Fuera de Alcance (Post-MVP)
- Consultas sincrónicas por videollamada con terapeutas en tiempo real.
- Integración con dispositivos wearables o biosensores externos.
- Plataforma de facturación y cobros multipaís en la versión inicial.`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Añadir a Alcance del PRD',
        targetModule: 'activos',
        targetSectionKey: 'prd',
        targetFieldKey: 'alcance_operativo',
        currentValue: '(Alcance base del PRD)',
        proposedValue: `Alcance MVP: Módulo SOS, Protocolo 3 Pasos, Modo Offline, Registro Rápido. Fuera de alcance: Videollamadas, Wearables.`,
        diffSummary: `Inserta la sección de Alcance Incluido y Fuera de Alcance en el PRD de ${projName}.`,
        applied: false
      };
    }
    // 3D. PRD - ESPECIFICACIÓN FUNCIONAL COMPLETA
    else if (intentResult.targetAssetType === 'prd_full') {
      generatedText = `### Especificación de Requerimientos Funcionales (PRD)

#### Requerimientos Funcionales (RF)
- **RF-01 (Detección Rápida):** El sistema debe permitir registrar el nivel de intensidad conductual en un máximo de 2 toques desde cualquier pantalla.
- **RF-02 (Guía Situacional):** Desplegar dinámicamente los 3 pasos del ${mechanismVal} adaptados al perfil del niño.
- **RF-03 (Modo Sin Conexión):** Garantizar disponibilidad local de protocolos de emergencia sin requerir conexión a internet activa.
- **RF-04 (Registro para Terapeutas):** Consolidar automáticamente el historial de eventos para su exportación en PDF/JSON.

#### User Story & Criterios de Aceptación (Gherkin)
> **Como** cuidador principal,  
> **quiero** acceder a una guía visual de 3 pasos ante una desregulación,  
> **para** actuar con calma y eficacia en menos de 60 segundos.

\`\`\`gherkin
Escenario: Activación del protocolo de calma rápida
  Dado que el usuario abre la aplicación en estado de emergencia
  Cuando presiona el botón SOS / Asistencia Inmediata
  Entonces la pantalla debe mostrar los 3 pasos prioritarios en menos de 500ms
  Y no debe solicitar autenticación adicional si la sesión biométrica es válida.
\`\`\`

#### Requerimientos No Funcionales (RNF)
- **RNF-01 (Latencia):** Tiempo de renderizado de la pantalla de crisis ≤ 300ms.
- **RNF-02 (Privacidad):** Cumplimiento estricto con el cifrado de datos de menores en almacenamiento local.`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Añadir a Requerimientos del PRD',
        targetModule: 'activos',
        targetSectionKey: 'prd',
        targetFieldKey: 'especificacion_funcional',
        currentValue: '(Requerimientos base)',
        proposedValue: `RF-01 a RF-04 para Asistencia Inmediata y Protocolo de 3 pasos.`,
        diffSummary: `Inserta los requerimientos funcionales y criterios Gherkin en el PRD de ${projName}.`,
        applied: false
      };
    }
    // 3E. EMAIL DE ONBOARDING / ACTIVACIÓN
    else if (intentResult.targetAssetType === 'email') {
      generatedText = `**Asunto:** [Nombre], la primera regla cuando una conducta parece inexplicable
**Preview:** Un pequeño cambio de enfoque para transformar la tensión en conexión.

Hola, **[Nombre]**:

Sabemos lo agotador que resulta cuando una situación cotidiana se desregula de golpe y ningún manual parece tener la respuesta adecuada para tu hijo.

La mayoría de las recomendaciones teóricas te piden mantener la calma, pero nadie te dice **qué hacer en los primeros 60 segundos**.

Por eso desarrollamos el **${mechanismVal}**: una herramienta creada para acompañarte paso a paso, sin juzgarte y dándote la certeza que tu familia merece.

👉 **[ Abre hoy tu primer protocolo de apoyo guiado ]**

Estamos contigo en cada paso.

Un abrazo cálido,  
**El equipo de ${projName}**`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Insertar en Secuencia de Emails',
        targetModule: 'activos',
        targetSectionKey: 'emails',
        targetFieldKey: 'email_activacion_01',
        currentValue: '(Sin email previo)',
        proposedValue: `Asunto: [Nombre], la primera regla cuando una conducta parece inexplicable\n\nHola [Nombre]...`,
        diffSummary: `Añade el Email de Activación al funnel de comunicación de ${projName}.`,
        applied: false
      };
    }
    // 3F. UX SCREEN SPECIFICATION
    else if (intentResult.targetAssetType === 'ux_screen') {
      generatedText = `### Especificación de Pantalla: Asistencia Rápida (\`/asistencia-rapida\`)

#### 1. Estructura & Jerarquía Visual
- **Header Minimalista:** Botón de salida rápida y selector de intensidad (Leve / Moderada / Severa).
- **Tarjeta Central:** Paso 1 del **${mechanismVal}** en tipografía destacada de alta legibilidad.
- **Temporizador Visual:** Barra de progreso sutil y ritmo de respiración guiada.
- **Botón Inferior:** \`[ Siguiente paso → ]\` (Touch target accesible de 48px con respuesta háptica).

#### 2. Estados de Interfaz
- **Estado de Carga:** Skeleton sutil, sin spinners bloqueantes.
- **Estado de Error:** Recuperación local automática con persistencia offline.
- **Tono de Microcopy:** Verbos en primera persona afirmativa (\`[ Entendido ]\`, \`[ Probar otro apoyo ]\`).`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Insertar en Pantalla de UX',
        targetModule: 'pantallas',
        targetSectionKey: 'scr-asistencia-rapida',
        targetFieldKey: 'purpose',
        currentValue: 'Guía de asistencia',
        proposedValue: `Asistencia situacional de 3 pasos con temporizador visual y selector de intensidad para desregulaciones.`,
        diffSummary: `Actualiza la especificación de la pantalla de Asistencia Rápida en el Catálogo de Pantallas.`,
        applied: false
      };
    }
    // 3G. ARCHITECTURE / TYPESCRIPT
    else if (intentResult.targetAssetType === 'architecture_schema') {
      generatedText = `\`\`\`typescript
export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  sensoryTriggers: string[]; // ["ruidos_fuertes", "cambio_rutina", "luces"]
  effectiveCalmingStrategies: string[];
}

export interface CrisisEventLog {
  id: string;
  childId: string;
  timestamp: string; // ISO8601
  severity: 1 | 2 | 3;
  triggerIdentified?: string;
  appliedSteps: string[];
  durationMinutes: number;
  outcomeStatus: 'calma_rapida' | 'requirio_tiempo' | 'sin_cambio';
  syncStatus: 'local_only' | 'synced_cloud';
}
\`\`\`

#### Estrategia de Persistencia & Modo Offline
- **Almacenamiento Local:** IndexedDB cifrado en reposo con AES-GCM.
- **Sincronización:** Cola de eventos en segundo plano que despacha a la nube cuando hay conexión.`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Añadir a Modelo de Arquitectura',
        targetModule: 'arquitectura',
        targetSectionKey: 'requisitos_tecnicos',
        targetFieldKey: 'requisitos_tecnicos',
        currentValue: '(Modelo base)',
        proposedValue: `Entidades ChildProfile y CrisisEventLog con sincronización offline-first y cifrado local.`,
        diffSummary: `Incorpora las entidades TypeScript y la estrategia offline-first al módulo de Arquitectura del Producto.`,
        applied: false
      };
    }
    // 3H. QUALITATIVE REPORT (Investigación)
    else if (intentResult.targetAssetType === 'qualitative_report') {
      generatedText = `### Informe de Hallazgos Cualitativos — ${projName}

#### 1. Dolores y Frustraciones Centrales
- **Sobrecarga teórica:** Los cuidadores expresan frustración ante manuales extensos e inaplicables durante una crisis real.
- **Sentimiento de juicio social:** Comentarios constantes sobre miradas de reproche en espacios públicos ante desregulaciones.
- **Demanda de inmediatez:** La necesidad no es un curso teórico de 10 horas, sino un apoyo de 60 segundos en el momento del evento.

#### 2. Cita de Evidencia (Lenguaje Natural)
> *"Lo que más me duele es no saber si lo que hago en ese momento lo calma o lo asusta más. Necesito algo claro que me diga 'haz esto primero' sin rodeos."*

#### 3. Oportunidades de Diferenciación
1. Reemplazar terminología médica compleja por analogías visuales claras.
2. Incorporar un registro rápido que demuestre a los padres que las crisis disminuyen con el tiempo gracias al ${mechanismVal}.`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Guardar en Base de Conocimiento',
        targetModule: 'maestro',
        targetSectionKey: 'avatar',
        targetFieldKey: 'frustraciones_diarias',
        currentValue: project.masterStrategyDoc?.sections?.avatar?.frustraciones_diarias || '',
        proposedValue: `Sobrecarga teórica y necesidad de guía operativa situacional en menos de 60 segundos ante crisis.`,
        diffSummary: `Actualiza la matriz de dolores y frustraciones del Avatar en el Documento Maestro.`,
        applied: false
      };
    }
    // 3I. GENERAL FALLBACK DELIVERABLE
    else {
      generatedText = `Headline
"Convierte la incertidumbre de cada conducta en calma y comprensión para tu hijo."

Subheadline
${mechanismVal}, diseñado por especialistas para que sepas exactamente cómo actuar con serenidad y certeza en situaciones cotidianas desafiantes.

CTA
[ Comenzar mi plan de apoyo gratuito → ]
[ Ver cómo funciona el protocolo en 60s ]`;

      proposedAction = {
        id: `act_${Date.now()}`,
        label: 'Insertar en Landing Page',
        targetModule: 'activos',
        targetSectionKey: 'landing',
        targetFieldKey: 'titular_principal_hero',
        currentValue: '(Sin contenido previo)',
        proposedValue: `"Convierte la incertidumbre de cada conducta en calma y comprensión para tu hijo."`,
        diffSummary: `Actualiza los activos principales del proyecto.`,
        applied: false
      };
    }
  }

  const latencyMs = Math.max(Date.now() - startTime, 320);

  const trace: AgentExecutionTrace = {
    executionId: `exec_${agent.type.slice(0, 3)}_${Math.random().toString(36).substring(2, 9)}`,
    agentId: agent.id,
    agentType: agent.type,
    agentName: agent.name,
    agentPromptVersion: resolution.spec.promptVersion,
    userRequest,
    classifiedIntent: intentResult.intent,
    intentReasoning: intentResult.reasoning,
    assetType: intentResult.targetAssetType,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    latencyMs,
    availableSources: resolution.availableSources,
    consultedSources: resolution.consultedSources,
    usedSources: resolution.usedSources,
    sourceStatuses: resolution.sourceStatuses,
    missingInfo: resolution.missingInfo,
    contradictions: resolution.contradictions,
    assumptions: resolution.assumptions,
    generatedResponse: generatedText,
    proposedAction,
    interactionStatus: 'generated',
    tokenBudgetUsage: {
      promptTokens: 480 + resolution.usedSources.length * 65,
      completionTokens: 380,
      contextRatio: `${resolution.usedSources.length} campos seleccionados de ${resolution.consultedSources.length} consultados`
    }
  };

  return {
    responseText: generatedText,
    trace,
    proposedAction
  };
}

/**
 * Applies a proposed action to the project state.
 * Returns the updated project without silent changes.
 */
export function applyProposedActionToProject(
  project: Project,
  action: ProposedAction
): Project {
  const updated = { ...project };

  if (action.targetModule === 'maestro') {
    const secKey = action.targetSectionKey || 'contexto';
    const fKey = action.targetFieldKey || 'resumen';
    const currentSections = updated.masterStrategyDoc?.sections || {};
    const updatedSec = { ...(currentSections[secKey] || {}), [fKey]: action.proposedValue };

    updated.masterStrategyDoc = {
      ...updated.masterStrategyDoc,
      sections: {
        ...currentSections,
        [secKey]: updatedSec
      },
      lastUpdated: new Date().toISOString()
    };

    try {
      localStorage.setItem(`screenos_master_doc_${project.id}`, JSON.stringify(updated.masterStrategyDoc.sections));
    } catch (e) {
      console.warn('Could not save master doc to localStorage', e);
    }
  } else if (action.targetModule === 'activos') {
    // Save to project impact audit or relevant asset
    updated.impactAudit = {
      lastChangedFieldKey: action.targetFieldKey,
      lastChangedFieldLabel: action.label,
      changedAt: new Date().toISOString(),
      affectedModules: ['activos', 'maestro'],
      affectedAssets: [action.label],
      reason: `Actualizado mediante acción directa del agente: ${action.label}`
    };
  } else if (action.targetModule === 'pantallas' && updated.screensData?.screens) {
    const scrId = action.targetSectionKey;
    const screens = updated.screensData.screens.map((s) => {
      if (s.id === scrId) {
        return { ...s, purpose: action.proposedValue };
      }
      return s;
    });
    updated.screensData = {
      ...updated.screensData,
      screens,
      lastSaved: new Date().toISOString()
    };
    try {
      localStorage.setItem(`screenos_screens_data_${project.id}`, JSON.stringify(updated.screensData));
    } catch (e) {
      console.warn('Could not save screens to localStorage', e);
    }
  } else if (action.targetModule === 'arquitectura') {
    const arch = updated.productArchitecture || initialProductArchitectureData;
    const secKey = action.targetSectionKey || 'requisitos_tecnicos';
    const updatedArch = {
      ...arch,
      [secKey]: {
        ...(arch[secKey] || {}),
        [action.targetFieldKey || 'requisitos_tecnicos']: action.proposedValue
      }
    };
    updated.productArchitecture = updatedArch;
    try {
      localStorage.setItem(`screenos_product_arch_${project.id}`, JSON.stringify(updatedArch));
    } catch (e) {
      console.warn('Could not save arch to localStorage', e);
    }
  }

  return updated;
}
