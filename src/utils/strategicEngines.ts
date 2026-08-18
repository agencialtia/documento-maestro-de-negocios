import { Project, AttachedDocument, FieldGroundingMeta } from '../types';
import { MASTER_DOC_SECTIONS } from '../data/masterDocDefaults';

export type StrategicEngineType = 'todd_brown' | 'alex_hormozi' | 'russell_brunson';

export interface StrategicEngineInfo {
  id: StrategicEngineType;
  name: string;
  author: string;
  tagline: string;
  badgeColor: string;
  badgeBg: string;
  borderColor: string;
  focusPrinciples: string[];
  description: string;
}

export const STRATEGIC_ENGINES: Record<StrategicEngineType, StrategicEngineInfo> = {
  todd_brown: {
    id: 'todd_brown',
    name: 'IA Todd Brown',
    author: 'Todd Brown (Mecanismo & Causalidad)',
    tagline: 'Mecanismo Único, Sofisticación de Mercado y Causalidad Irrefutable',
    badgeColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/80',
    borderColor: 'border-indigo-600/50',
    focusPrinciples: [
      'Diagnóstico causal de raíz frente a síntomas superficiales',
      'Mecanismo único propietario y demostrable',
      'Sofisticación de mercado y diferenciación estructural',
      'Cadena lógica de causa-efecto que elimina objeciones',
    ],
    description: 'Enfocado en la ingeniería de la creencia causal, diferenciación estructural, por qué fallan los competidores y cómo opera el mecanismo único para producir el resultado prometido sin promesas vacías.',
  },
  alex_hormozi: {
    id: 'alex_hormozi',
    name: 'IA Alex Hormozi',
    author: 'Alex Hormozi (Claridad & Ecuación de Valor)',
    tagline: 'Claridad Radical, Oferta Grand Slam y Reducción Máxima de Esfuerzo',
    badgeColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80',
    borderColor: 'border-emerald-600/50',
    focusPrinciples: [
      'Ecuación de valor: Máximo resultado, máxima certeza, mínimo tiempo y esfuerzo',
      'Especificidad numérica, unit economics y reducción de riesgo',
      'Ofertas Grand Slam con anclaje de precios y garantías audaces',
      'Soluciones directas, sin rodeos y listas para ejecutar',
    ],
    description: 'Enfocado en maximizar el valor percibido, eliminar toda fricción cognitiva, entregar pasos medibles con tiempos concretos y estructurar ofertas comerciales donde decir que no sea irracional.',
  },
  russell_brunson: {
    id: 'russell_brunson',
    name: 'IA Russell Brunson',
    author: 'Russell Brunson (Deseo, Creencia & Transformación)',
    tagline: 'Epiphany Bridge, One Belief y Movimiento de Transformación',
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-amber-950/80',
    borderColor: 'border-amber-600/50',
    focusPrinciples: [
      'El puente de la epifanía: De Punto A (dolor/identidad anterior) a Punto B (nueva identidad)',
      'The One Belief: La única creencia que hace obligatoria y lógica la compra',
      'Quiebre de las 3 falsas creencias: Vehículo, Habilidad Interna, Factores Externos',
      'Narrativa de movimiento, comunidad y pertenencia',
    ],
    description: 'Enfocado en conectar con el deseo más profundo del avatar, transformar su identidad, derribar barreras emocionales y crear una creencia inquebrantable en la nueva oportunidad.',
  },
};

/**
 * Contextual representation extracted from all 12 modules of the project.
 */
export interface ProjectSemanticContext {
  projectName: string;
  projectIdea: string;
  projectCategory: string;
  isTEA: boolean;
  
  // Section 1 - Context
  objetivoNegocio: string;
  objetivoUsuario: string;
  alcanceIncluido: string;
  alcanceExcluido: string;
  vehiculo: string;
  tipoMonetizacion: string;
  precioSuscripcion: string;
  cacEstimado: string;
  ltvEstimado: string;

  // Section 2 - Market
  nicho: string;
  subnicho: string;
  categoriaActual: string;
  sofisticacion: string;
  competidores: string;

  // Section 3 - Audiences
  avatarNombre: string;
  avatarRol: string;
  avatarDolor: string;
  avatarFrustracion: string;
  avatarSituacionConcreta: string;
  avatarCosteNoResolver: string;
  avatarMiedos: string;
  avatarCreenciasLimitantes: string;

  // Section 4 - Causal
  sintomaPrincipal: string;
  diagnosticoFalso: string;
  causaRaiz: string;
  enemigoUnico: string;
  nuevaOportunidad: string;

  // Section 5 - Mechanism
  tipoMecanismo: string;
  nombreMecanismo: string;
  definicionFuncional: string;
  componentesMecanismo: string;
  analogia: string;
  oneBelief: string;

  // Section 6 - Transformation
  puntoA: string;
  puntoB: string;
  declaracionTransformacion: string;
  indicadorExito: string;

  // Section 7 - Positioning
  categoriaMentalDeseada: string;
  resultadoPrometido: string;
  elevatorPitch: string;
  resumenUnParrafo: string;

  // Section 8 - Product
  nombreProducto: string;
  descripcionProducto: string;
  quickWin: string;
  tiempoAlValor: string;

  // Section 9 - Commercial
  ofertaPrincipal: string;
  precio: string;
  precioAncla: string;
  garantia: string;
  cta: string;

  // Section 10 - Evidence
  claimsPruebas: string;
  casosExito: string;

  // Section 11 - Brand
  propositoMarca: string;
  personalidadMarca: string;
  vozTono: string;

  // Section 12 - Communication
  mensajePrimario: string;
  beneficiosPriorizados: string;
}

/**
 * Builds the bidirectional context snapshot from the project and current form data.
 */
export function buildProjectSemanticContext(
  project: Project,
  formData: Record<string, any> = {}
): ProjectSemanticContext {
  const pName = project.name || 'Proyecto Estratégico';
  const pIdea = project.idea || project.description || '';
  const isTEA = 
    pName.toLowerCase().includes('tea') || 
    pIdea.toLowerCase().includes('tea') || 
    pIdea.toLowerCase().includes('autismo') || 
    pIdea.toLowerCase().includes('desregulaci') || 
    pIdea.toLowerCase().includes('crisis conductual') ||
    pIdea.toLowerCase().includes('sensorial');

  const pCat = isTEA 
    ? 'Intervención Situacional y Apoyo a Familias TEA' 
    : (project.category || 'Solución SaaS & Plataforma Digital');

  const s1 = formData.contexto || {};
  const s2 = formData.mercado || {};
  const s3 = formData.audiencias || {};
  const s4 = formData.causal || {};
  const s5 = formData.mecanismo || {};
  const s6 = formData.transformacion || {};
  const s7 = formData.posicionamiento || {};
  const s8 = formData.producto || {};
  const s9 = formData.comercial || {};
  const s10 = formData.evidencia || {};
  const s11 = formData.marca || {};
  const s12 = formData.comunicacion || {};

  return {
    projectName: pName,
    projectIdea: pIdea,
    projectCategory: pCat,
    isTEA,

    // S1
    objetivoNegocio: s1.objetivo_negocio || `Alcanzar tracción y rentabilidad sostenible en ${pCat} con retención mensual sólida.`,
    objetivoUsuario: s1.objetivo_usuario || (isTEA ? 'Desescalar crisis y desregulaciones sensoriales de sus hijos en < 60s sin gritos ni castigos.' : 'Resolver tareas complejas de forma rápida, guiada y sin fricción.'),
    alcanceIncluido: s1.incluido || (isTEA ? 'Modo SOS situacional en 1 toque, tarjetas visuales de desescalada y registro rápido de detonantes.' : 'Módulo central operativo, flujos de trabajo guiados y métricas clave.'),
    alcanceExcluido: s1.excluido || (isTEA ? 'Hospitalización psiquiátrica de urgencia, consultas médicas presenciales y fármacos.' : 'Desarrollo a medida para grandes corporaciones o consultoría manual indefinida.'),
    vehiculo: s1.vehiculo_principal || 'App Móvil Nativa (iOS / Android) + Web App',
    tipoMonetizacion: s1.tipo_monetizacion || 'Suscripción Freemium (Mensual / Anual)',
    precioSuscripcion: s1.tiers_precios || '$19 USD / mes o $149 USD / año',
    cacEstimado: s1.cac_estimado || '$22 USD',
    ltvEstimado: s1.ltvEstimado || '$165 USD (retención media de 9 meses)',

    // S2
    nicho: s2.nicho || (isTEA ? 'Familias de niños diagnosticados con TEA (Nivel 1 y 2)' : 'Profesionales y pequeñas empresas'),
    subnicho: s2.subnicho || (isTEA ? 'Madres y padres cuidadores de niños de 3 a 10 años con hipersensibilidad sensorial' : 'Equipos operativos que buscan sistematización'),
    categoriaActual: s2.categoria_actual || (isTEA ? 'Guías teóricas de crianza y apps educativas estáticas' : 'Software genérico de productividad'),
    sofisticacion: s2.sofisticacion_mercado || 'Nivel 4 (Mercado escéptico que ya ha probado múltiples cursos y libros teóricos sin resultados en crisis reales)',
    competidores: s2.competidores_directos || (isTEA ? 'Manuales de pedagogía, apps de pictogramas tradicionales (PECS) y grupos de Facebook' : 'Herramientas generalistas de mercado'),

    // S3
    avatarNombre: s3.nombre_referencial || (isTEA ? 'Carolina, 36 años, madre cuidadora principal' : 'Elena, 35 años, líder operativa'),
    avatarRol: s3.rol_contexto || (isTEA ? 'Cuidadora que balancea trabajo y hogar bajo estrés constante por crisis conductuales' : 'Responsable de entrega y resultados'),
    avatarDolor: s3.dolor || (isTEA ? 'La angustia e impotencia de ver a su hijo desbordado en llanto sin saber qué detonó la crisis ni cómo calmarlo.' : 'Pérdida continua de tiempo y errores repetitivos en la ejecución diaria.'),
    avatarFrustracion: s3.frustracion || (isTEA ? 'Haber leído docenas de libros que no sirven de nada cuando el niño entra en crisis en un supermercado.' : 'Sistemas complejos que nadie del equipo adopta con consistencia.'),
    avatarSituacionConcreta: s3.situacion_concreta || (isTEA ? 'En la fila de un supermercado, el niño entra en pánico por sobrecarga auditiva y las miradas ajenas juzgan a la madre.' : 'Frente a una fecha límite con procesos desordenados y sin visibilidad.'),
    avatarCosteNoResolver: s3.coste_no_resolverlo || (isTEA ? 'Aislamiento social progresivo, culpa parental crónica y deterioro del vínculo familiar.' : 'Pérdida de clientes, estancamiento operativo y agotamiento del equipo.'),
    avatarMiedos: s3.consecuencia_temida || (isTEA ? 'Que el niño sufra retrasos en su integración social y que el estrés termine fracturando a la familia.' : 'Quedar obsoleto y perder competitividad.'),
    avatarCreenciasLimitantes: s3.creencias_limitantes || (isTEA ? '"Si tuviera más paciencia mi hijo no se desregularía" o "Nada de lo digital funciona en una crisis real".' : '"Esto es demasiado difícil para nosotros".'),

    // S4
    sintomaPrincipal: s4.sintoma_principal || (isTEA ? 'Desregulaciones sensoriales explosivas (gritos, bloqueos, llanto incontrolable).' : 'Fricción recurrente y entregas fuera de plazo.'),
    diagnosticoFalso: s4.que_cree_mercado_causa_problema || (isTEA ? 'Que el problema es la falta de disciplina, mala crianza o capricho voluntario.' : 'Que falta motivación personal o más horas de trabajo.'),
    causaRaiz: s4.causa_principal || (isTEA ? 'Falta de un protocolo visual de primera respuesta en los primeros 60 segundos antes del punto de no retorno neurosensorial.' : 'Ausencia de una estructura sistemática probada que elimine la improvisación.'),
    enemigoUnico: s4.nombre_enemigo || (isTEA ? 'El Mito de la Disciplina Punitiva y la Sobrecarga Teórica Inaplicable' : 'La Trampa de la Improvisación Manual'),
    nuevaOportunidad: s4.insight_central || (isTEA ? 'La co-regulación visual inmediata calma el sistema nervioso del niño sin requerir procesamiento auditivo en crisis.' : 'Sustituir el esfuerzo manual por un mecanismo guiado estandarizado.'),

    // S5
    tipoMecanismo: s5.tipo_mecanismo || 'Protocolo Predictivo Visual de 3 Pasos',
    nombreMecanismo: s5.nombre_definitivo || (isTEA ? 'Protocolo Calma Situacional 60s™' : `${pName} Fast-Track Engine™`),
    definicionFuncional: s5.definicion_funcional || (isTEA ? 'Secuencia interactiva en 3 toques: 1) Filtro rápido de detonante, 2) Tarjeta visual de desescalada, 3) Guía de co-regulación y respiración.' : 'Secuencia estandarizada de 3 fases que automatiza la resolución y asegura precisión.'),
    componentesMecanismo: s5.componentes || (isTEA ? '1. Selector SOS de Detonante, 2. Tarjetas Hápticas de Apoyo Visual, 3. Animador de Co-Regulación.' : '1. Diagnóstico rápido, 2. Generador de flujo guiado, 3. Verificador de entrega.'),
    analogia: s5.analogia || (isTEA ? 'Es como un extintor visual y un desfibrilador de calma en el bolsillo: no te enseña teoría del fuego en medio del incendio, apaga la llama de inmediato.' : 'Es como el GPS de aviación: te guía paso a paso sin margen de error.'),
    oneBelief: s5.unica_creencia_hace_compra_logica || (isTEA ? 'Las desregulaciones no son caprichos sino sobrecargas sensoriales que se desactivan en < 60s con apoyo visual situacional inmediato.' : 'La sistematización guiada es la única vía para lograr predictibilidad y escala sin agotamiento.'),

    // S6
    puntoA: s6.situacion_inicial || (isTEA ? 'Punto A: Angustia, sensación de aislamiento, miedo a salir a la calle y frustración por improvisar en cada crisis.' : 'Punto A: Caos operativo y frustración diaria.'),
    puntoB: s6.situacion_final || (isTEA ? 'Punto B: Calma, certeza absoluta y dominio de un protocolo probado que devuelve la armonía al hogar en 60 segundos.' : 'Punto B: Control total, rapidez y resultados consistentes.'),
    declaracionTransformacion: s6.declaracion_de_transformacion || (isTEA ? 'De la angustia e improvisación en cada crisis, a la serenidad y conexión familiar en menos de 60 segundos.' : 'De la parálisis operativa al control verificable.'),
    indicadorExito: s6.indicador_principal || (isTEA ? 'Reducción del tiempo de desescalada de 25 minutos a menos de 2 minutos.' : 'Disminución del 70% en tiempo de ejecución.'),

    // S7
    categoriaMentalDeseada: s7.categoria_mental_deseada || (isTEA ? 'Asistente Situacional de Primera Respuesta y Desescalada en Tiempo Real' : 'Plataforma Especializada de Alta Eficiencia'),
    resultadoPrometido: s7.resultado_prometido || (isTEA ? 'Desescalar crisis y desregulaciones en menos de 60 segundos sin gritos ni castigos.' : 'Garantizar ejecución impecable y ahorro de 10 horas semanales.'),
    elevatorPitch: s7.elevator_pitch || (isTEA ? `Para familias de niños con TEA que sufren por crisis imprevistas, ${pName} es el asistente móvil que guía la desescalada en 3 toques, a diferencia de los libros teóricos tradicionales.` : `${pName} permite a profesionales optimizar sus resultados mediante un flujo estandarizado.`),
    resumenUnParrafo: s7.resumen_de_un_parrafo || (isTEA ? `${pName} transforma el momento más crítico de la crianza TEA en una oportunidad de conexión mediante un protocolo visual que actúa en < 60s sin requerir preparación previa.` : `${pName} es la solución integral diseñada para acelerar y asegurar resultados con máxima precisión.`),

    // S8
    nombreProducto: s8.nombre_del_producto || (isTEA ? 'TEA Calm & Guide Mobile App' : `${pName} App`),
    descripcionProducto: s8.descripcion_funcional || (isTEA ? 'App móvil con modo SOS de 1 toque, biblioteca de 50+ apoyos visuales de desescalada y registro automático de detonantes.' : 'Plataforma web y móvil con suite de herramientas integradas.'),
    quickWin: s8.quick_win || (isTEA ? 'Completar una simulación de desescalada en 45 segundos durante el primer onboarding.' : 'Completar la primera configuración en menos de 3 minutos.'),
    tiempoAlValor: s8.tiempo_hasta_el_valor || 'Menos de 3 minutos tras el primer acceso.',

    // S9
    ofertaPrincipal: s9.oferta_principal || (isTEA ? 'Membresía Familiar Calma Total: Acceso ilimitado a la app + Actualización mensual de protocolos + Comunidad privada de acompañamiento + Garantía de 30 días.' : `Plan Anual ${pName} con soporte prioritario y garantía de satisfacción.`),
    precio: s9.precio || '$19 USD / mes o $149 USD / año',
    precioAncla: s9.precio_ancla || '$350 USD (Equivalente a 3 sesiones de terapia privada)',
    garantia: s9.garantia_y_condiciones || 'Garantía Incondicional de 30 Días: Si la app no reduce el tiempo de las crisis en tu primer mes, te devolvemos el 100% de tu dinero.',
    cta: s9.cta_estrategico || 'Comenzar Prueba Gratuita de 7 Días',

    // S10
    claimsPruebas: s10.claims_pruebas_beneficios || (isTEA ? '1. Desescalada en <60s respaldada por principios de co-regulación sensorial.\n2. Cero fricción bajo estrés: Interfaz ejecutable con 1 mano y modo offline.' : '1. Ahorro verificado del 65% de tiempo operativo.'),
    casosExito: s10.casos_de_exito || (isTEA ? 'Familia R.: Pasaron de crisis de 40 min en supermercados a desescaladas de 90 segundos con el apoyo visual.' : 'Casos documentados con incrementos del 3x en productividad.'),

    // S11
    propositoMarca: s11.proposito || (isTEA ? 'Empoderar a las familias con herramientas inmediatas para que ningún cuidador vuelva a sentirse solo o impotente ante una desregulación.' : 'Democratizar el acceso a herramientas de alta eficiencia.'),
    personalidadMarca: s11.personalidad || 'Empática, rigurosa, serena, clara y orientada a la acción inmediata.',
    vozTono: s11.voz_y_tono || 'Cálido, respetuoso y profesional; libre de tecnicismos intimidantes y centrado en la utilidad real.',

    // S12
    mensajePrimario: s12.mensaje_primario || (isTEA ? 'De la crisis al abrazo en 60 segundos: El protocolo visual que calma las desregulaciones sin gritos ni manuales eternos.' : `Domina ${pCat} con la certeza de un sistema paso a paso.`),
    beneficiosPriorizados: s12.beneficios_priorizados || '1. Certeza inmediata en momentos críticos.\n2. Reducción drástica del estrés y la culpa.\n3. Libertad y autonomía para salir sin miedo.',
  };
}

/**
 * Anti-Slop & Metatext Filter:
 * Rejects explanations like "Definición de...", "Propuesta para...", "Este campo describe...", etc.
 */
export function sanitizeAppliedFieldValue(rawText: string): string {
  if (!rawText) return '';
  let clean = rawText.trim();

  // Strip Markdown bold prefixes if wrapping meta-statements
  clean = clean.replace(/^(\*\*|#+)\s*(Definición|Propuesta|Concepto|Resumen|Descripción|Objetivo|Campo)\s*.*?:?\s*(\*\*|\n)?/i, '');

  // Strip common introductory meta-sentences
  clean = clean.replace(/^(En este campo se describe|Este campo contiene|A continuación se presenta|Definición del Mecanismo Único para|Definición de|Propuesta de)\s*.*?:?\s*/i, '');
  clean = clean.replace(/^"|"$/g, '').trim();

  // Strip bullet headers like "- 1.1 IDENTIFICACIÓN:"
  clean = clean.replace(/^-\s*\d+\.\d+[^:]*:\s*/, '');

  return clean.trim();
}

/**
 * Validates if the text represents real applied value vs theoretical slop.
 */
export function validateSemanticOutput(
  fieldKey: string,
  text: string
): { isValid: boolean; reason?: string } {
  const clean = sanitizeAppliedFieldValue(text);
  if (!clean || clean.length < 5) {
    return { isValid: false, reason: 'El texto generado está vacío o es demasiado corto.' };
  }

  const forbiddenPatterns = [
    /definición del mecanismo único para/i,
    /este campo debe contener/i,
    /en esta sección se define/i,
    /aquí debes ingresar/i,
    /placeholder/i,
    /lorem ipsum/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(clean)) {
      return { isValid: false, reason: 'Contiene metatexto explicativo en vez de contenido aplicado.' };
    }
  }

  return { isValid: true };
}

/**
 * Core Strategic Generation Engine for ALL 12 Sections and ALL fields.
 */
export function generateStrategicFieldValue(
  sectionKey: string,
  fieldKey: string,
  engineType: StrategicEngineType,
  context: ProjectSemanticContext
): {
  proposedValue: string;
  fieldPurpose: string;
  expectedOutputType: string;
  engineUsed: StrategicEngineType;
  confidenceScore: number;
} {
  const { isTEA, projectName: pName, projectCategory: pCat } = context;
  let proposed = '';
  let purpose = '';
  let outputType = 'texto_aplicado';

  // =========================================================================
  // SECCIÓN 1: CONTEXTO
  // =========================================================================
  if (sectionKey === 'contexto') {
    switch (fieldKey) {
      case 'nombre_proyecto':
        purpose = 'Identificador canónico del proyecto.';
        outputType = 'nombre_oficial';
        proposed = pName;
        break;

      case 'nombre_provisional':
        purpose = 'Nombre de trabajo funcional o de desarrollo.';
        outputType = 'nombre_corto';
        proposed = engineType === 'todd_brown' 
          ? (isTEA ? 'TEA NeuroCalm Protocol App' : `${pName} System Engine`)
          : engineType === 'alex_hormozi'
          ? (isTEA ? 'TEA Calm 60s Fast-App' : `${pName} 10x Platform`)
          : (isTEA ? 'TEA SafeHaven Guide' : `${pName} Transformation Hub`);
        break;

      case 'etapa_proyecto':
        purpose = 'Fase de desarrollo y madurez actual del producto.';
        outputType = 'etapa_madurez';
        proposed = 'Validación avanzada y construcción de MVP funcional';
        break;

      case 'estado_validacion':
        purpose = 'Evidencia empírica y tracción observable al día de hoy.';
        outputType = 'evidencia_traccion';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Validado con 35 entrevistas a profundidad a familias TEA y 2 terapeutas ocupacionales; 92% confirmó que las crisis se agravan por la falta de un protocolo de co-regulación visual en los primeros 60 segundos.'
            : `Validado con 28 entrevistas a usuarios del segmento ${pCat}; se identificó una tasa de abandono del 75% en métodos tradicionales por falta de un mecanismo estandarizado.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? '18 padres completaron un prototipo de prueba en papel/móvil; el 88% reportó desescalar episodios en menos de 2 minutos y 14 expresaron disposición inmediata a pagar $19/mes.'
            : `Validación cuantitativa con 40 profesionales: 82% afirma que pagaría una suscripción mensual si el sistema les ahorra más de 5 horas a la semana.`;
        } else {
          proposed = isTEA
            ? 'Prueba piloto en comunidad de 50 madres cuidadoras; las usuarias destacaron el alivio emocional inmediato y la recuperación de la confianza para salir a lugares públicos.'
            : `Fase de adopción inicial con primeros usuarios evangelizadores que reportan una transformación radical en su certeza cotidiana.`;
        }
        break;

      case 'objetivo_negocio':
        purpose = 'Meta cuantitativa y financiera de la empresa.';
        outputType = 'meta_comercial';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Establecer la aplicación como el estándar de primera respuesta no farmacológica en el nicho de familias TEA, alcanzando 1,500 suscriptores activos de pago ($28,500 MRR) con un churn mensual menor al 3.5% en los primeros 12 meses.'
            : `Posicionar ${pName} como la solución de referencia en ${pCat}, logrando 1,000 clientes activos y $20,000 MRR en el primer año.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Generar $30,000 USD de MRR recurrente en 9 meses con una oferta Grand Slam a $19/mes ($149/año), logrando un LTV/CAC superior a 5x y margen bruto del 85%.'
            : `Capturar $25,000 MRR en 12 meses con LTV de $180 USD y CAC menor a $30 USD.`;
        } else {
          proposed = isTEA
            ? 'Crear un movimiento y una comunidad sólida de 2,000 familias transformadas que recomienden orgánicamente la app, logrando sostenibilidad económica y 40% de adquisición por boca a boca.'
            : `Construir una base de usuarios apasionados que transformen su rutina diaria y generen un crecimiento orgánico autosustentable.`;
        }
        break;

      case 'objetivo_usuario':
        purpose = 'Resultado deseado principal que busca la persona al usar la herramienta.';
        outputType = 'objetivo_usuario';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Tener la capacidad técnica de desactivar desregulaciones y sobrecargas sensoriales en menos de 60 segundos mediante una secuencia visual estandarizada, sin improvisar ni empeorar la crisis.'
            : `Ejecutar los procesos críticos de ${pCat} sin errores y con una reducción del 60% en tiempo invertido.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Resolver la crisis conductual en 3 toques de pantalla en menos de 1 minuto, eliminando por completo el llanto, las miradas juzgadoras en público y el agotamiento físico.'
            : `Lograr el resultado prometido en tiempo récord con mínimo esfuerzo cognitivo y máxima certeza.`;
        } else {
          proposed = isTEA
            ? 'Recuperar la paz mental, sentirse una madre/padre capaz y seguro, y poder salir en familia a cualquier lugar sin miedo a desregulaciones imprevistas.'
            : `Sentir control, seguridad y tranquilidad al erradicar la incertidumbre en sus tareas prioritarias.`;
        }
        break;

      case 'metrica_exito':
        purpose = 'KPI numérico inequívoco que verifica el funcionamiento del producto.';
        outputType = 'metrica_kpi';
        proposed = isTEA
          ? 'Tiempo promedio de desescalada de crisis inferior a 90 segundos medido en 8 de cada 10 incidentes registrados en la app.'
          : 'Reducción del 65% en tiempo de ejecución de procesos y NPS de usuario > 65.';
        break;

      case 'incluido':
        purpose = 'Alcance delimitado de lo que sí cubre esta versión.';
        outputType = 'frontera_incluida';
        proposed = isTEA
          ? '1. Modo SOS de 1 toque con selector de 3 detonantes principales.\n2. Biblioteca de 40 tarjetas visuales interactivas de co-regulación.\n3. Cronómetro y animador visual háptico de respiración guiada.\n4. Registro básico de incidentes y detonantes para control parental.'
          : `1. Flujo guiado central de 3 etapas.\n2. Plantillas operativas listas para usar.\n3. Panel de métricas de progreso.\n4. Exportación en PDF y sincronización cloud.`;
        break;

      case 'excluido':
        purpose = 'Límites explícitos de lo que NO resuelve la versión actual.';
        outputType = 'frontera_excluida';
        proposed = isTEA
          ? '1. Intervención médica o farmacológica en emergencias psiquiátricas.\n2. Diagnóstico clínico formal de TEA (no es una herramienta diagnóstica).\n3. Terapia presencial o videollamadas en tiempo real con psicólogos.\n4. Gestión de hardware sensorial externo.'
          : `1. Desarrollos a medida para enterprise.\n2. Soporte telefónico 24/7 presencial.\n3. Integraciones complejas con ERPs legacy en esta fase.`;
        break;

      case 'vehiculo_principal':
        purpose = 'Formato y canal de entrega del producto.';
        outputType = 'vehiculo';
        proposed = 'Aplicación Móvil iOS / Android (Mobile-First) con soporte offline completo.';
        break;

      case 'vehiculos_complementarios':
        purpose = 'Formatos adicionales que acompañan al producto.';
        outputType = 'vehiculo';
        proposed = isTEA
          ? 'Portal web para cuidadores con reportes de evolución para terapeutas + Kit imprimible de pictogramas de respaldo.'
          : 'Dashboard web de administración + Guías rápidas en PDF.';
        break;

      case 'canal_acceso':
        purpose = 'Punto de entrada y distribución.';
        outputType = 'canal';
        proposed = 'App Store (Apple) + Google Play Store + Acceso Web en la nube.';
        break;

      case 'tipo_monetizacion':
        purpose = 'Modelo de ingresos.';
        outputType = 'monetizacion';
        proposed = 'Suscripción SaaS Freemium con prueba gratuita de 7 días y cobro mensual/anual recurrente.';
        break;

      case 'estructura_precios':
        purpose = 'Estructura de cobro de los planes.';
        outputType = 'pricing';
        proposed = isTEA
          ? 'Plan Básico (Freemium: 3 protocolos SOS) + Plan Familia Calma Pro ($19/mes o $149/año) + Plan Terapeutas / Multi-perfil ($39/mes).'
          : 'Plan Free (básico) + Plan Pro ($19/mes) + Plan Equipo ($39/mes).';
        break;

      case 'tiers_precios':
        purpose = 'Niveles de precios y montos.';
        outputType = 'pricing';
        proposed = 'Gratuito: $0 | Pro Mensual: $19 USD/mes | Pro Anual: $149 USD/año (Ahorro del 35%) | Terapeutas: $39 USD/mes.';
        break;

      case 'periodicidad_cobro':
        purpose = 'Frecuencia de renovación.';
        outputType = 'periodicidad';
        proposed = 'Mensual o Anual con renovación automática y cancelación en 1 clic.';
        break;

      case 'cac_estimado':
        purpose = 'Costo estimado de adquisición de cliente.';
        outputType = 'unit_economics';
        proposed = '$22 USD por usuario suscriptor de pago mediante Meta Ads y contenido orgánico.';
        break;

      case 'ltv_estimado':
        purpose = 'Valor del ciclo de vida del cliente.';
        outputType = 'unit_economics';
        proposed = '$165 USD (equivalente a una retención media de 9.2 meses).';
        break;

      case 'margen_objetivo':
        purpose = 'Margen bruto esperado del negocio.';
        outputType = 'unit_economics';
        proposed = '82% - 86% sobre ingresos netos tras comisiones de pasarela y servidores cloud.';
        break;

      case 'costes_variables':
        purpose = 'Costos directos asociados a cada usuario activo.';
        outputType = 'unit_economics';
        proposed = 'Pasarela de pago (Stripe/App Stores: 15-30%), servidores cloud e infraestructura ($0.45/usuario/mes).';
        break;

      case 'hipotesis_monetizacion':
        purpose = 'Supuesto clave que justifica la disposición a pagar.';
        outputType = 'hipotesis';
        proposed = isTEA
          ? 'Los padres cuidadores pagarán con gusto $19/mes porque el valor de evitar 1 sola crisis en público o en el hogar supera por mucho el costo de una consulta privada de $80 USD.'
          : 'Los usuarios pagarán $19/mes al constatar que recuperan al menos 4 horas semanales de trabajo manual.';
        break;

      case 'criterios_upsell':
        purpose = 'Disparadores y momentos de actualización a planes superiores.';
        outputType = 'upsell';
        proposed = isTEA
          ? 'Al intentar desbloquear el protocolo SOS #4 en una crisis o al requerir exportar el informe de detonantes para el neuropediatra.'
          : 'Al alcanzar el límite de 3 proyectos activos o requerir colaboración en equipo.';
        break;

      default:
        proposed = `Definición operativa aplicada para ${fieldKey.replace(/_/g, ' ')} en el proyecto ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 2: MERCADO
  // =========================================================================
  else if (sectionKey === 'mercado') {
    switch (fieldKey) {
      case 'mercado_industria':
        purpose = 'Industria global donde opera el producto.';
        outputType = 'mercado';
        proposed = isTEA
          ? 'Salud Digital (Digital Health) y Tecnología de Asistencia al Neurodesarrollo (FemTech & CareTech).'
          : 'Software as a Service (SaaS) y Productividad Digital.';
        break;

      case 'nicho':
        purpose = 'Segmento específico de mercado.';
        outputType = 'nicho';
        proposed = isTEA
          ? 'Familias y cuidadores principales de niños diagnosticados con Trastorno del Espectro Autista (TEA Nivel 1 y 2).'
          : `Profesionales y equipos independientes en el sector de ${pCat}.`;
        break;

      case 'subnicho':
        purpose = 'Población hiperfocalizada.';
        outputType = 'subnicho';
        proposed = isTEA
          ? 'Madres y padres con hijos de 3 a 10 años que experimentan crisis de desregulación sensorial imprevistas en el hogar y en la vía pública.'
          : `Equipos que requieren flujos operativos guiados sin fricción técnica.`;
        break;

      case 'categoria_actual':
        purpose = 'Cómo clasificaría el mercado hoy a la solución.';
        outputType = 'categoria';
        proposed = isTEA
          ? 'Aplicaciones educativas infantiles y guías de crianza en PDF.'
          : 'Herramientas genéricas de software de productividad.';
        break;

      case 'categoria_deseada':
        purpose = 'Nueva categoría mental que el producto inaugura.';
        outputType = 'categoria';
        proposed = isTEA
          ? 'Asistente Situacional de Primera Respuesta y Desescalada en Tiempo Real (SOS CareTech).'
          : `Plataforma Guiada de Alta Velocidad para ${pCat}.`;
        break;

      case 'sofisticacion_mercado':
        purpose = 'Nivel de sofisticación de la audiencia respecto a promesas del mercado.';
        outputType = 'sofisticacion';
        if (engineType === 'todd_brown') {
          proposed = 'Nivel 4: La audiencia ya ha probado múltiples libros, talleres online y apps de pictogramas estáticos; reconocen los claims habituales pero están decepcionados porque nada funciona en los 60 segundos reales de una crisis.';
        } else if (engineType === 'alex_hormozi') {
          proposed = 'Mercado saturado de teoría inútil con alta demanda de soluciones inmediatas que demuestren resultados en menos de 2 minutos.';
        } else {
          proposed = 'Familias escépticas ante falsas promesas milagrosas, pero con un anhelo profundo de encontrar una herramienta respetuosa que realmente funcione en momentos de alta tensión.';
        }
        break;

      case 'competidores_directos':
        purpose = 'Alternativas directas existentes.';
        outputType = 'competidores';
        proposed = isTEA
          ? 'Apps de pictogramas estáticos (ej. PECS apps, Goally), manuales de disciplina positiva y cursos grabados de estimulación.'
          : 'Aplicaciones generalistas de gestión y hojas de cálculo manuales.';
        break;

      case 'competidores_indirectos':
        purpose = 'Soluciones sustitutas no tecnológicas.';
        outputType = 'competidores';
        proposed = isTEA
          ? 'Cuadernos físicos de tarjetas plastificadas con velcro, consultas esporádicas con terapeutas y consejos en grupos de Facebook/WhatsApp.'
          : 'Procesos manuales en papel, notas adhesivas e improvisación verbal.';
        break;

      case 'sustitutos':
        purpose = 'Comportamientos alternativos del usuario.';
        outputType = 'sustitutos';
        proposed = isTEA
          ? 'Ceder al capricho para frenar el llanto, aislarse y no salir de casa, o recurrir al castigo/gritos por desesperación.'
          : 'Contratar personal adicional o posponer indefinidamente la tarea.';
        break;

      case 'fuerzas_macro':
        purpose = 'Tendencias y catalizadores externos del entorno.';
        outputType = 'tendencias';
        proposed = isTEA
          ? '1. Incremento global en diagnósticos tempranos de neurodiversidad.\n2. Adopción masiva de smartphones en familias jóvenes.\n3. Rechazo cultural creciente a métodos punitivos tradicionales y auge de la crianza respetuosa.'
          : '1. Aceleración digital.\n2. Búsqueda de eficiencia operativa.\n3. Crecimiento del trabajo remoto.';
        break;

      case 'tendencias_relevantes':
        purpose = 'Tendencias del comportamiento del consumidor.';
        outputType = 'tendencias';
        proposed = isTEA
          ? 'Preferencia por micro-intervenciones situacionales en tiempo real frente a cursos largos de 40 horas.'
          : 'Demanda de interfaces zero-learning-curve con resultados instantáneos.';
        break;

      case 'espacio_en_blanco':
        purpose = 'Oportunidad de mercado desatendida.';
        outputType = 'oportunidad';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Ninguna solución en el mercado actúa como protocolo de primera respuesta guiada en los primeros 60 segundos críticos de una sobrecarga sensorial; todos los competidores enseñan teoría antes o analizan datos después, pero dejan solo al cuidador DURANTE la crisis.'
            : 'Falta de herramientas que guíen paso a paso en el momento crítico de la ejecución.';
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Cero herramientas con tiempo de respuesta < 60s sin requerir conexión a internet ni entrenamiento previo.'
            : 'Ausencia de soluciones con garantía de resultado medible en días.';
        } else {
          proposed = isTEA
            ? 'El vacío de un compañero digital empático que brinde seguridad al cuidador sin juzgarlo ni abrumarlo con jerga médica.'
            : 'Espacio desatendido para herramientas que conectan con la necesidad humana de certidumbre.';
        }
        break;

      default:
        proposed = `Análisis de mercado aplicado para ${fieldKey.replace(/_/g, ' ')} en ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 3: AUDIENCIAS
  // =========================================================================
  else if (sectionKey === 'audiencias') {
    switch (fieldKey) {
      case 'resumen_avatar':
        purpose = 'Descripción ejecutiva y sintética del cliente ideal.';
        outputType = 'avatar_perfil';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Madre o padre cuidador principal (30 a 45 años) de un niño con TEA o desafíos de autorregulación. Amoroso y comprometido, pero al borde del agotamiento crónico debido a desregulaciones imprevistas, buscando un mecanismo técnico y rápido que detenga la escalada antes del punto de no retorno.'
            : `Profesional de 28 a 48 años que gestiona operaciones en ${pCat} y sufre fricción continua por falta de un flujo sistemático.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Madre de 32-42 años con niño de 3-8 años con TEA. Dispone de 0 tiempo libre, sufre 3-5 crisis semanales y pagaría de inmediato cualquier solución que le garantice calmar a su hijo en menos de 2 minutos sin juicios externos.'
            : `Líder de equipo con presupuesto asignado que prioriza velocidad de implementación y retorno medible.`;
        } else {
          proposed = isTEA
            ? 'Madre dedicada que ama profundamente a su hijo pero vive con el corazón en un puño por el miedo a las crisis en público; anhela volver a disfrutar de salidas familiares y sentirse una guía segura y comprendida.'
            : `Persona con alta vocación que desea trascender el caos diario y liderar con tranquilidad.`;
        }
        break;

      case 'nombre_referencial':
        purpose = 'Nombre y arquetipo del avatar.';
        outputType = 'avatar_nombre';
        proposed = isTEA ? 'Carolina, 36 años (Mamá de Lucas, 6 años con TEA)' : 'Elena, 35 años (Líder de Operaciones)';
        break;

      case 'rol_contexto':
        purpose = 'Contexto social y laboral cotidiano.';
        outputType = 'avatar_rol';
        proposed = isTEA
          ? 'Cuidadora principal que balancea trabajo remoto o jornada partida con visitas a terapias, viviendo en estado de alerta constante.'
          : 'Responsable de entrega y métricas en su área con recursos limitados.';
        break;

      case 'demografia_relevante':
        purpose = 'Datos demográficos esenciales.';
        outputType = 'demografia';
        proposed = 'Edad: 28-45 años, zonas urbanas/suburbanas, usuaria activa de smartphone (iOS/Android) con suscripciones digitales activas.';
        break;

      case 'situacion_actual_avatar':
        purpose = 'Momento vital y estado actual del usuario.';
        outputType = 'situacion_actual';
        proposed = isTEA
          ? 'Enfrenta entre 2 y 5 desregulaciones semanales en momentos cotidianos (salidas al supermercado, transiciones de tareas, hora de la cena), sintiéndose sola y juzgada.'
          : 'Enfrenta cuellos de botella constantes y sobrecarga de trabajo manual.';
        break;

      case 'metas_aspiraciones':
        purpose = 'Lo que el avatar quiere alcanzar a nivel personal.';
        outputType = 'metas';
        proposed = isTEA
          ? 'Lograr salidas familiares en paz, salir a centros comerciales sin pánico a crisis y fomentar la autorregulación respetuosa de su hijo.'
          : 'Dominar sus procesos, reducir tiempos de entrega y tener tiempo libre.';
        break;

      case 'valores_creencias':
        purpose = 'Principios no negociables del cliente.';
        outputType = 'valores';
        proposed = isTEA
          ? 'Cree en el respeto a la neurodiversidad y el apego seguro; rechaza tajantemente la violencia, los gritos y los castigos físicos.'
          : 'Valora la eficiencia, la transparencia y el rigor profesional.';
        break;

      case 'comportamientos_habitos':
        purpose = 'Hábitos recurrentes y consumo de información.';
        outputType = 'habitos';
        proposed = isTEA
          ? 'Consume reels y podcasts de especialistas en neurodesarrollo por las noches; guarda capturas de pantalla que luego olvida en el momento de la crisis.'
          : 'Busca constantemente optimizaciones y plantillas en internet.';
        break;

      case 'fuentes_informacion':
        purpose = 'Canales y comunidades de consulta.';
        outputType = 'canales_info';
        proposed = isTEA
          ? 'Instagram de terapeutas ocupacionales, grupos de WhatsApp de padres TEA, TikTok educativo y canales de YouTube especializados.'
          : 'LinkedIn, newsletters especializadas y comunidades de profesionales.';
        break;

      case 'frustraciones_profundas':
        purpose = 'Punto de dolor emocional más doloroso.';
        outputType = 'frustracion';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'La inconsistencia de las soluciones existentes: saber mucha teoría sobre el autismo pero quedar completamente bloqueada sin saber qué herramienta aplicar cuando el niño entra en crisis en un lugar público.'
            : 'La falta de un sistema estandarizado que evite repetir los mismos errores una y otra vez.';
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Perder 40 minutos en cada crisis intentando calmar al niño con métodos que no funcionan, terminando físicamente exhausta y con el día arruinado.'
            : 'Desperdiciar cientos de horas al año en procesos ineficientes y costosos.';
        } else {
          proposed = isTEA
            ? 'La culpa lacerante de perder la paciencia, sentirse una mala madre y sentir la mirada juzgadora de extraños en la calle.'
            : 'La sensación de estancamiento e impotencia frente a las expectativas del entorno.';
        }
        break;

      case 'por_que_no_resuelto':
        purpose = 'Causa por la que sigue sin resolverse el problema.';
        outputType = 'barrera';
        proposed = isTEA
          ? 'Porque toda la información disponible está en libros largos o videos teóricos que no se pueden consultar ni aplicar en los 60 segundos de una crisis real.'
          : 'Porque las soluciones existentes son demasiado complejas de implementar en el día a día.';
        break;

      case 'segmento_principal':
        purpose = 'Audiencia primaria que comprará la solución.';
        outputType = 'segmento';
        proposed = isTEA
          ? 'Familias con niños de 3 a 10 años con diagnóstico reciente de TEA (Nivel 1 o 2) o hipersensibilidad sensorial.'
          : `Profesionales y equipos con alta demanda en ${pCat}.`;
        break;

      case 'segmentos_secundarios':
        purpose = 'Audiencias adyacentes de valor.';
        outputType = 'segmento';
        proposed = isTEA
          ? 'Terapeutas ocupacionales, educadores diferenciales, fonoaudiólogos y cuidadores secundarios (abuelos, niñeras).'
          : 'Consultores independientes y formadores del sector.';
        break;

      case 'segmentos_excluidos':
        purpose = 'Público que NO debe usar la herramienta.';
        outputType = 'segmento';
        proposed = isTEA
          ? 'Casos psiquiátricos severos que requieren contención farmacológica hospitalaria de urgencia o perfiles sin diagnóstico sensorial básico.'
          : 'Grandes corporaciones con requerimientos de integración legacy de meses.';
        break;

      case 'usuario_rol':
        purpose = 'Persona que interactúa con la aplicación.';
        outputType = 'rol';
        proposed = isTEA ? 'Padre, madre o cuidador que activa la app en su teléfono móvil durante o antes de la crisis.' : 'Operador o profesional que ejecuta las tareas.';
        break;

      case 'comprador_rol':
        purpose = 'Persona que paga la suscripción.';
        outputType = 'rol';
        proposed = isTEA ? 'El padre o madre que administra el presupuesto del hogar para el cuidado del niño.' : 'El líder de área o dueño de negocio.';
        break;

      case 'decisor_rol':
        purpose = 'Persona que autoriza la compra.';
        outputType = 'rol';
        proposed = isTEA ? 'Ambos progenitores en consenso o con la recomendación del terapeuta ocupacional.' : 'El responsable financiero o directivo.';
        break;

      case 'dolor':
        purpose = 'Manifestación aguda del dolor.';
        outputType = 'dolor';
        proposed = isTEA
          ? 'La angustia desgarradora de ver a su hijo sufriendo una sobrecarga sensorial y sentirse incapaz de brindarle alivio inmediato.'
          : 'La fricción constante y la incertidumbre de no tener control sobre el resultado.';
        break;

      case 'frustracion':
        purpose = 'Desgaste repetitivo.';
        outputType = 'frustracion';
        proposed = isTEA
          ? 'Tener que cancelar planes familiares, evitar reuniones y vivir aislados por el temor constante a que ocurra una crisis.'
          : 'Rehacer el trabajo manual una y otra vez por falta de estandarización.';
        break;

      case 'situacion_concreta':
        purpose = 'Escena de alta tensión en la vida real.';
        outputType = 'escena_real';
        proposed = isTEA
          ? 'Estar en la fila de un supermercado lleno de gente; de pronto las luces o el ruido detonan una crisis en el niño, la gente murmura y la madre no tiene a mano ninguna herramienta rápida para actuar.'
          : 'Llegar a la fecha de entrega con el trabajo a medias y sin visibilidad del estado real.';
        break;

      case 'frecuencia_intensidad':
        purpose = 'Frecuencia y nivel de estrés percibido.';
        outputType = 'frecuencia';
        proposed = 'Frecuencia: 3 a 5 veces por semana. Intensidad: 9/10 en nivel de estrés emocional y fisiológico percibido.';
        break;

      case 'coste_no_resolverlo':
        purpose = 'Consecuencia a largo plazo de no actuar.';
        outputType = 'costo_inaccion';
        proposed = isTEA
          ? 'Deterioro de la salud mental de los padres, trauma por aislamiento social para el niño y tensión severa en la relación de pareja.'
          : 'Pérdida de competitividad, fuga de clientes y sobrecostos operativos permanentes.';
        break;

      default:
        proposed = `Definición de audiencia y avatar aplicada a ${fieldKey.replace(/_/g, ' ')} para ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 4: CAUSAL
  // =========================================================================
  else if (sectionKey === 'causal') {
    switch (fieldKey) {
      case 'sintoma_principal':
        purpose = 'Manifestación externa del problema.';
        outputType = 'sintoma';
        proposed = isTEA
          ? 'Desregulaciones conductuales explosivas (llanto incontrolable, gritos, rechazo al contacto, bloqueo motor) que escalan rápidamente.'
          : 'Fricción recurrente, retrasos en entregas y desorden en la ejecución diaria.';
        break;

      case 'manifestaciones':
        purpose = 'Cómo se observa el síntoma en la práctica.';
        outputType = 'manifestaciones';
        proposed = isTEA
          ? 'Tirarse al suelo, taparse los oídos, negarse a caminar, crisis de angustia prolongada y agotamiento familiar absoluto tras el episodio.'
          : 'Correos urgentes, tareas duplicadas y discusiones continuas sobre prioridades.';
        break;

      case 'consecuencias':
        purpose = 'Impacto inmediato posterior.';
        outputType = 'consecuencias';
        proposed = isTEA
          ? 'Cancelación de salidas, culpa parental, retraso en actividades diarias y miedo anticipatorio a la siguiente crisis.'
          : 'Pérdida de tiempo valioso y estrés en todo el equipo.';
        break;

      case 'que_cree_mercado_causa_problema':
        purpose = 'Explicación equivocada y superficial aceptada por la mayoría.';
        outputType = 'falso_diagnostico';
        proposed = isTEA
          ? 'Que las crisis se deben a mala crianza, falta de límites estrictos, terquedad voluntaria del niño o falta de paciencia de los padres.'
          : 'Que el problema es la falta de disciplina individual o la falta de esfuerzo de las personas.';
        break;

      case 'por_que_parece_razonable':
        purpose = 'Por qué la gente cae en esa trampa.';
        outputType = 'justificacion_falsa';
        proposed = isTEA
          ? 'Porque desde una perspectiva externa la conducta parece un capricho infantil típico y la sociedad premia la imposición y el castigo inmediato.'
          : 'Porque culpar a las personas es más fácil que diagnosticar un sistema defectuoso.';
        break;

      case 'por_que_esta_equivocado':
        purpose = 'El error fundamental de esa creencia.';
        outputType = 'refutacion';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Porque una desregulación sensorial es una respuesta neurológica involuntaria de supervivencia (modo lucha/huida); aplicar castigos o gritos sobrecarga aún más la amígdala cerebral del niño, prolongando la crisis.'
            : 'Porque sin un protocolo estructurado, ni el mayor esfuerzo individual puede evitar los errores de proceso.';
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Porque el castigo tiene 0% de efectividad en una sobrecarga sensorial y aumenta el tiempo de la crisis de 2 a 45 minutos.'
            : 'Porque trabajar más horas en un proceso roto solo multiplica los defectos.';
        } else {
          proposed = isTEA
            ? 'Porque rompe el vínculo de confianza y apego seguro entre la madre y el hijo justo en el instante en que el niño más necesita contención y calma.'
            : 'Porque desmotiva al equipo y destruye la cultura de trabajo.';
        }
        break;

      case 'causa_principal':
        purpose = 'La verdadera causa raíz oculta del problema.';
        outputType = 'causa_raiz';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Falta de un protocolo de primera respuesta situacional en los primeros 60 segundos del pródromo de sobrecarga sensorial: los cuidadores no disponen de una herramienta visual inmediata que co-regule el sistema nervioso antes del punto de no retorno.'
            : `Ausencia de una estructura sistemática que guíe las decisiones críticas en tiempo real en ${pCat}.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'La falta de un sistema de 3 pasos en el móvil listo para ejecutar en 1 mano antes de que la crisis sobrepase el umbral neurológico.'
            : 'La inexistencia de un flujo estandarizado con tiempos definidos y verificación automática.';
        } else {
          proposed = isTEA
            ? 'La ausencia de un puente de comunicación visual que conecte al cuidador y al niño en el momento del desborde emocional.'
            : 'La falta de una guía clara que transforme la incertidumbre en confianza.';
        }
        break;

      case 'evidencia_disponible':
        purpose = 'Respaldo fáctico o empírico de la causa raíz.';
        outputType = 'evidencia';
        proposed = isTEA
          ? 'Estudios de neurociencia aplicada demuestran que en crisis el canal auditivo se bloquea y el canal visual sigue receptivo; intervenir en fase temprana con apoyos visuales reduce la duración de la crisis en un 75%.'
          : 'Métricas de industria confirman que los procesos guiados reducen el error humano en más del 80%.';
        break;

      case 'nombre_enemigo':
        purpose = 'Nombre villano o culpable conceptual.';
        outputType = 'enemigo_nombre';
        proposed = isTEA
          ? 'El Mito de la Disciplina Punitiva y la Sobrecarga Teórica Inaplicable'
          : 'La Trampa de la Improvisación Manual y la Complejidad Inútil';
        break;

      case 'creencia_enemigo':
        purpose = 'Idea falsa que perpetúa el enemigo.';
        outputType = 'enemigo_creencia';
        proposed = isTEA
          ? '"Si supiera castigar mejor o si leyera más libros de 400 páginas, mi hijo no tendría estas crisis."'
          : '"Con más reuniones y más fuerza de voluntad todo se arreglará."';
        break;

      case 'por_que_coherente_causa_raiz':
        purpose = 'Conexión lógica entre el enemigo y la solución.';
        outputType = 'coherencia_causal';
        proposed = isTEA
          ? 'Porque desculpabiliza al padre y al niño, reenfocando la energía en dotar al cuidador de un mecanismo técnico visual inmediato en su teléfono.'
          : 'Porque traslada el foco de la culpa personal a la implementación de una herramienta probada.';
        break;

      default:
        proposed = `Diagnóstico causal aplicado a ${fieldKey.replace(/_/g, ' ')} para ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 5: MECANISMO ÚNICO
  // =========================================================================
  else if (sectionKey === 'mecanismo') {
    switch (fieldKey) {
      case 'tipo_mecanismo':
        purpose = 'Naturaleza del mecanismo.';
        outputType = 'tipo_mecanismo';
        proposed = isTEA
          ? 'Protocolo Predictivo Visual de Desescalada Situacional en 3 Pasos'
          : 'Sistema de Ejecución Guiada Fast-Track en 3 Fases';
        break;

      case 'definicion_funcional':
        purpose = 'Qué hace exactamente el mecanismo en una frase operativa.';
        outputType = 'definicion_mecanismo';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Secuencia interactiva en 3 pasos que permite al cuidador identificar el detonante sensorial en 5 segundos, desplegar el guión visual adaptativo de co-regulación y guiar el retorno a la calma en menos de 60 segundos sin requerir procesamiento auditivo.'
            : `Secuencia estructurada que automatiza la toma de decisiones críticas y asegura la entrega en tiempo récord.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Sistema móvil en 3 toques que frena crisis sensoriales en < 60 segundos con 0 lectura previa y funcionando 100% sin conexión a internet.'
            : `Flujo directo que reduce a la mitad el tiempo de ejecución con cero fricción técnica.`;
        } else {
          proposed = isTEA
            ? 'Un puente visual instantáneo que conecta al padre y al niño durante el momento más difícil, transformando el llanto y la tensión en serenidad y conexión afectiva.'
            : `Una guía paso a paso que devuelve el control y la seguridad en cada acción.`;
        }
        break;

      case 'problema_causal_que_resuelve':
        purpose = 'Causa raíz exacta sobre la que actúa.';
        outputType = 'problema_resuelto';
        proposed = isTEA
          ? 'Elimina la improvisación y la sobrecarga auditiva bajo estrés, actuando directamente sobre el pródromo sensorial con estímulos visuales de co-regulación neurológica.'
          : 'Elimina la dispersión y la falta de estandarización operativa.';
        break;

      case 'como_funciona_por_que_funciona':
        purpose = 'Lógica interna que garantiza el funcionamiento.';
        outputType = 'logica_interna';
        proposed = isTEA
          ? 'Funciona porque durante una sobrecarga el cerebro entra en bloqueo verbal; las tarjetas visuales de alto contraste activan la corteza visual occipital y permiten la co-regulación neurológica sin exigir comprensión del lenguaje hablado.'
          : 'Funciona porque reduce la carga cognitiva y delimita cada paso a una acción atómica verificable.';
        break;

      case 'componentes':
        purpose = 'Módulos o elementos constitutivos.';
        outputType = 'componentes';
        proposed = isTEA
          ? '1. Selector SOS de Detonante Sensorial (Auditivo, Visual, Táctil, Transición).\n2. Tarjetas Hápticas de Co-regulación con Micro-instrucciones.\n3. Animador Visual de Respiración Sincronizada (Retorno a la Calma).'
          : '1. Módulo de Diagnóstico Rápido.\n2. Generador Guiado de Acciones.\n3. Verificador de Resultados en Tiempo Real.';
        break;

      case 'secuencia_y_razon':
        purpose = 'Orden cronológico y justificación lógica de los pasos.';
        outputType = 'secuencia';
        proposed = isTEA
          ? 'Filtro de Intensidad (5s) → Selección de Tarjeta Visual (10s) → Ejecución de Respiración/Co-regulación (45s). Este orden frena la escalada de la amígdala antes del colapso sensorial total.'
          : 'Diagnóstico → Ejecución guiada → Validación. Este orden evita reprocesos y asegura exactitud.';
        break;

      case 'condiciones_necesarias':
        purpose = 'Requisitos mínimos e indispensables para que el mecanismo funcione.';
        outputType = 'condiciones_requeridas';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? '1. Detección temprana en los primeros 60 segundos del inicio del pródromo.\n2. Dispositivo móvil cargado y con acceso directo al modo SOS.\n3. Coherencia en el uso de los mismos apoyos visuales para generar hábito neurológico.'
            : '1. Definición clara del objetivo operativo.\n2. Adopción del flujo guiado por los miembros clave.\n3. Seguimiento de las alertas de verificación.';
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? '1. Tener instalada la app en el smartphone del cuidador.\n2. Haber configurado los 3 detonantes más comunes en 2 minutos.\n3. Seguir los 3 pasos visuales sin improvisar.'
            : '1. Configuración inicial completa en menos de 5 minutos.\n2. Conexión de los datos fuente.';
        } else {
          proposed = isTEA
            ? '1. La disposición del cuidador a mantener su propia serenidad para co-regular al niño.\n2. Practicar el protocolo 1 vez en un momento de calma antes de usarlo en una crisis real.'
            : '1. Confianza en el método y compromiso con la consistencia diaria.';
        }
        break;

      case 'limitaciones':
        purpose = 'Fronteras explícitas y casos donde NO aplica el mecanismo.';
        outputType = 'limitaciones_reales';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? '1. No reemplaza el tratamiento médico o terapéutico en crisis psicóticas o convulsivas.\n2. No es eficaz si se aplica después de 15 minutos de desborde total cuando el agotamiento fisiológico ya es absoluto.\n3. Requiere supervisión de un adulto (el niño no debe usar el teléfono solo durante la crisis).'
            : '1. No aplica para automatización de hardware industrial no digital.\n2. Requiere al menos un operador humano supervisando la salida.';
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? '1. No cubre emergencias farmacológicas de hospitalización.\n2. No incluye terapia presencial personalizada en el plan básico.\n3. Requiere al menos 2 minutos de configuración inicial de detonantes.'
            : '1. No apto para empresas que exigen servidores on-premise en esta versión.';
        } else {
          proposed = isTEA
            ? '1. No es una varita mágica pasiva: requiere que el cuidador esté presente y aplique las tarjetas con empatía.\n2. No sustituye el amor, la paciencia y el acompañamiento profesional continuo.'
            : '1. No reemplaza el criterio humano ni el liderazgo empático.';
        }
        break;

      case 'unica_creencia_hace_compra_logica':
        purpose = 'The One Belief: La única idea que hace que la compra tenga sentido absoluto.';
        outputType = 'one_belief';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'La única creencia que hace indispensable la compra es entender que las crisis sensoriales no se resuelven con más disciplina ni con libros teóricos, sino decodificando el detonante en menos de 60 segundos con un protocolo visual de co-regulación situacional estandarizado.'
            : `La única creencia clave es que la única forma de escalar ${pCat} sin agotamiento es reemplazando la improvisación por un mecanismo guiado comprobado.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Si el cliente cree que tener un asistente visual en su bolsillo le ahorrará 20 minutos de angustia en cada crisis por menos de $0.65 al día y con garantía de 30 días, comprar es la única decisión financiera y familiar inteligente.'
            : `Si el producto ahorra 5 horas semanales garantizadas, no adquirirlo cuesta 10 veces más que la suscripción.`;
        } else {
          proposed = isTEA
            ? 'La nueva oportunidad consiste en dejar de ser un cuidador angustiado e impotente para convertirse en una guía segura y conectada, utilizando el apoyo visual como el puente definitivo hacia la paz en el hogar.'
            : `Creer que existe un camino más humano y ordenado hacia el éxito profesional sin sacrificar la tranquilidad.`;
        }
        break;

      case 'nombre_definitivo':
        purpose = 'Nombre comercial y propietario del mecanismo.';
        outputType = 'naming_mecanismo';
        proposed = isTEA
          ? 'Protocolo Calma Situacional 60s™ (Sistema E.C.P.)'
          : `Sistema ${pName} Fast-Track Engine™`;
        break;

      case 'analogia':
      case 'analogia_central':
        purpose = 'Metáfora intuitiva que explica el mecanismo en 5 segundos.';
        outputType = 'analogia';
        proposed = isTEA
          ? 'Es como un extintor de incendios y un desfibrilador visual en el bolsillo: no te enseña la química del fuego mientras la casa se quema, te da los 3 pasos exactos para apagar la llama de inmediato.'
          : 'Es como el sistema de navegación por instrumentos de un avión: te permite aterrizar en medio de la niebla sin depender de la visibilidad visual.';
        break;

      default:
        proposed = `Especificación del mecanismo aplicada a ${fieldKey.replace(/_/g, ' ')} para ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 6: TRANSFORMACIÓN
  // =========================================================================
  else if (sectionKey === 'transformacion') {
    switch (fieldKey) {
      case 'situacion_inicial':
        purpose = 'Estado Punto A de partida.';
        outputType = 'punto_a';
        proposed = isTEA
          ? 'Punto A: Tensión permanente, aislamiento social, miedo a salir a lugares públicos y frustración por perder la paciencia e improvisar en cada crisis.'
          : 'Punto A: Fricción operativa, retrasos crónicos y sensación constante de sobrecarga.';
        break;

      case 'situacion_final':
        purpose = 'Estado Punto B deseado tras la solución.';
        outputType = 'punto_b';
        proposed = isTEA
          ? 'Punto B: Serenidad y certeza cotidiana, dominio de un método visual que desescala crisis en < 60s y reconexión afectiva con su hijo en cualquier entorno.'
          : 'Punto B: Control absoluto, procesos predecibles y entregas puntuales sin estrés.';
        break;

      case 'declaracion_de_transformacion':
        purpose = 'Frase matriz de la transformación.';
        outputType = 'transformacion_matriz';
        proposed = isTEA
          ? 'De la angustia e improvisación en cada crisis conductual, a la calma, certeza y conexión familiar en menos de 60 segundos.'
          : `De la parálisis y el caos operativo en ${pCat}, al dominio y resultados verificables en tiempo récord.`;
        break;

      case 'horizonte_temporal':
        purpose = 'Plazo de tiempo en que se manifiesta el cambio.';
        outputType = 'tiempo_resultado';
        proposed = 'Resultados tangibles desde el primer uso (primeros 7 días de adopción del protocolo).';
        break;

      case 'indicador_principal':
        purpose = 'Métrica principal de la transformación.';
        outputType = 'indicador_kpi';
        proposed = isTEA
          ? 'Reducción del tiempo promedio de desescalada de crisis de 25 minutos a menos de 2 minutos.'
          : 'Reducción del 65% en tiempo de ciclo operativo.';
        break;

      case 'evidencia_de_exito':
        purpose = 'Prueba observable de que el cambio ocurrió.';
        outputType = 'evidencia_cambio';
        proposed = isTEA
          ? 'Registro histórico en la app que evidencia disminución de más del 60% en la intensidad y frecuencia de desregulaciones tras 3 semanas de uso.'
          : 'Incremento del 40% en capacidad de entrega documentado en el panel de control.';
        break;

      default:
        proposed = `Transformación estratégica para ${fieldKey.replace(/_/g, ' ')} en ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 7: POSICIONAMIENTO
  // =========================================================================
  else if (sectionKey === 'posicionamiento') {
    switch (fieldKey) {
      case 'categoria_en_la_que_compite':
        purpose = 'Categoría tradicional donde el mercado intenta ubicarlo.';
        outputType = 'categoria_compite';
        proposed = isTEA
          ? 'Aplicaciones educativas infantiles de TEA y guías teóricas de crianza en PDF.'
          : 'Software genérico de productividad y gestión de proyectos.';
        break;

      case 'categoria_mental_deseada':
        purpose = 'Nueva subcategoría propietaria en la mente del cliente.';
        outputType = 'categoria_deseada';
        proposed = isTEA
          ? 'Asistente Situacional de Primera Respuesta y Desescalada en Tiempo Real'
          : `Plataforma Guiada Especializada para ${pCat}`;
        break;

      case 'resultado_prometido':
        purpose = 'La gran promesa que resuelve el problema central.';
        outputType = 'promesa';
        proposed = isTEA
          ? 'Desescalar crisis y desregulaciones conductuales en menos de 60 segundos sin gritos, castigos ni frustración, devolviendo la calma y la seguridad al hogar.'
          : `Garantizar resultados consistentes y predecibles en ${pCat} eliminando la improvisación manual.`;
        break;

      case 'resumen_de_un_parrafo':
        purpose = 'Síntesis ejecutiva del posicionamiento.';
        outputType = 'posicionamiento_parrafo';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? `${pName} es el primer Asistente Situacional de Primera Respuesta que permite a familias y cuidadores de niños con TEA desactivar crisis conductuales en menos de 60 segundos, utilizando el Protocolo Calma Situacional 60s™ para co-regular en tiempo real mediante apoyos visuales sin requerir preparación previa.`
            : `${pName} es la solución sistemática que transforma ${pCat} mediante un protocolo guiado de alta velocidad para resultados verificables.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? `${pName} frena las crisis de sobrecarga sensorial en 3 toques en menos de un minuto, ahorrando horas de angustia parental y funcionando 100% offline con garantía de 30 días.`
            : `${pName} reduce un 60% el tiempo de trabajo en ${pCat} con implementación en 3 minutos y garantía total.`;
        } else {
          proposed = isTEA
            ? `${pName} acompaña a los padres en el momento más difícil de la crianza TEA, transformando la desesperación en conexión y devolviendo la libertad de disfrutar la vida en familia.`
            : `${pName} empodera a los profesionales para liderar sus tareas con serenidad, orden y confianza absoluta.`;
        }
        break;

      case 'elevator_pitch':
        purpose = 'Discurso de elevador de 30 segundos.';
        outputType = 'pitch';
        proposed = isTEA
          ? `Para padres de niños con TEA que sufren por crisis imprevistas y no tienen tiempo de leer manuales clínicos, ${pName} es el asistente móvil que guía la desescalada en 3 toques en menos de un minuto, a diferencia de los libros teóricos tradicionales.`
          : `Para profesionales que buscan resultados en ${pCat}, ${pName} es el sistema guiado que garantiza precisión y velocidad sin complejidad innecesaria.`;
        break;

      default:
        proposed = `Posicionamiento aplicado para ${fieldKey.replace(/_/g, ' ')} en ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 8: PRODUCTO
  // =========================================================================
  else if (sectionKey === 'producto') {
    switch (fieldKey) {
      case 'nombre_del_producto':
        purpose = 'Nombre comercial del producto.';
        outputType = 'nombre_producto';
        proposed = isTEA ? 'TEA Calm & Guide Mobile App' : `${pName} Pro`;
        break;

      case 'descripcion_funcional':
        purpose = 'Descripción técnica de módulos y capacidades.';
        outputType = 'descripcion_producto';
        proposed = isTEA
          ? 'Aplicación móvil interactiva con modo SOS de 1 toque, biblioteca adaptativa de 40+ apoyos visuales de desescalada, registro automático de incidentes y panel de progreso para familias y terapeutas.'
          : 'Plataforma interactiva con generador de flujos, plantillas inteligentes y analítica de desempeño en tiempo real.';
        break;

      case 'nombre_del_metodo':
        purpose = 'Nombre del método interno que utiliza el producto.';
        outputType = 'nombre_metodo';
        proposed = isTEA ? 'Protocolo Calma Situacional en 3 Pasos (E.C.P.)' : `Método ${pName} Fast-Track`;
        break;

      case 'etapas_y_secuencia':
        purpose = 'Flujo de interacción de punta a punta.';
        outputType = 'flujo_etapas';
        proposed = isTEA
          ? 'Paso 1: Detonante Rápido (Sensorial/Emocional) → Paso 2: Tarjeta Visual de Co-regulación → Paso 3: Respiración Háptica y Cierre de Reconexión.'
          : 'Paso 1: Entrada de datos → Paso 2: Procesamiento guiado → Paso 3: Validación y entrega.';
        break;

      case 'accion_inicial':
        purpose = 'Primera interacción que realiza el usuario en el onboarding.';
        outputType = 'accion_inicial';
        proposed = isTEA
          ? 'Configurar el perfil sensorial del niño en 2 minutos durante el primer inicio de la app.'
          : 'Definir el objetivo del proyecto en el asistente de inicio rápido.';
        break;

      case 'quick_win':
        purpose = 'Primera victoria rápida que experimenta el usuario.';
        outputType = 'quick_win';
        proposed = isTEA
          ? 'Completar una simulación de desescalada en menos de 45 segundos y guardar el primer protocolo favorito.'
          : 'Generar el primer resultado operativo en menos de 3 minutos.';
        break;

      case 'tiempo_hasta_el_valor':
        purpose = 'Time-to-value en minutos o días.';
        outputType = 'time_to_value';
        proposed = 'Menos de 3 minutos tras abrir la aplicación por primera vez.';
        break;

      default:
        proposed = `Especificación de producto para ${fieldKey.replace(/_/g, ' ')} en ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 9: COMERCIAL & OFERTA
  // =========================================================================
  else if (sectionKey === 'comercial') {
    switch (fieldKey) {
      case 'oferta_principal':
        purpose = 'Propuesta de valor comercial completa (Grand Slam Offer).';
        outputType = 'oferta_comercial';
        if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Membresía Familiar Calma Total: 1) Acceso ilimitado a la App TEA Calm en todos los dispositivos familiares, 2) Biblioteca completa de 50+ protocolos visuales actualizados mensualmente, 3) Generador de reportes en 1 clic para el neuropediatra/terapeuta, 4) Taller mensual en vivo con terapeutas ocupacionales, 5) Garantía incondicional de satisfacción de 30 días al 100%.'
            : `Plan Anual ${pName}: Acceso completo + Plantillas Pro + Soporte prioritario + Garantía incondicional de 30 días.`;
        } else if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'Suscripción al Protocolo Calma Situacional 60s™ con licencia familiar multi-cuidador, sincronización de detonantes y actualizaciones de protocolos de co-regulación sensorial.'
            : `Licencia de acceso a la plataforma ${pName} con todas las funciones de automatización guiada.`;
        } else {
          proposed = isTEA
            ? 'Pase Familiar a la Comunidad Calma TEA: La herramienta móvil definitiva para recuperar la paz familiar con acompañamiento continuo y garantía total.'
            : `Membresía ${pName} para profesionales comprometidos con la excelencia operativa.`;
        }
        break;

      case 'precio':
        purpose = 'Precio oficial y modalidades de pago.';
        outputType = 'precio';
        proposed = '$19 USD / mes (o $149 USD / año con 35% de descuento directo)';
        break;

      case 'precio_ancla':
        purpose = 'Precio de referencia o costo alternativo más caro.';
        outputType = 'precio_ancla';
        proposed = '$350 USD (Costo equivalente a 3 sesiones de terapia ocupacional privada o un curso clínico tradicional)';
        break;

      case 'moneda':
        purpose = 'Moneda de transacción.';
        outputType = 'moneda';
        proposed = 'USD ($) con conversión automática a moneda local en App Stores';
        break;

      case 'periodicidad_cobro':
        purpose = 'Frecuencia de renovación de la suscripción.';
        outputType = 'periodicidad';
        proposed = 'Mensual o Anual con cancelación instantánea en 1 clic desde la app o la tienda.';
        break;

      case 'prueba_gratuita_freemium':
        purpose = 'Mecanismo de prueba o versión gratuita.';
        outputType = 'prueba_gratuita';
        proposed = 'Prueba gratuita de 7 días con acceso total sin cargo inicial, o versión Freemium con 3 protocolos esenciales permanentes.';
        break;

      case 'garantia_y_condiciones':
        purpose = 'Inversión de riesgo y garantía de satisfacción.';
        outputType = 'garantia';
        proposed = 'Garantía Incondicional de Satisfacción de 30 Días: Si la aplicación no ayuda a tu familia a reducir el tiempo y estrés de las desregulaciones en el primer mes, te devolvemos el 100% de tu dinero sin hacer preguntas.';
        break;

      case 'cta_estrategico':
        purpose = 'Llamada a la acción persuasiva.';
        outputType = 'cta';
        proposed = 'Comenzar Prueba Gratuita de 7 Días';
        break;

      case 'urgencia':
        purpose = 'Motivo para actuar hoy y no posponer.';
        outputType = 'urgencia';
        proposed = 'Cada día sin un protocolo estructurado es un día más de desgaste emocional innecesario y crisis que podrían haberse evitado en 60 segundos.';
        break;

      default:
        proposed = `Estructura comercial aplicada para ${fieldKey.replace(/_/g, ' ')} en ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 10: EVIDENCIA
  // =========================================================================
  else if (sectionKey === 'evidencia') {
    switch (fieldKey) {
      case 'claims_pruebas_beneficios':
        purpose = 'Tríada Claim → Prueba → Beneficio tangible.';
        outputType = 'claims_pruebas';
        proposed = isTEA
          ? '1. Claim: Desescala crisis en < 60s → Prueba: Protocolo visual basado en co-regulación neurológica → Beneficio: Menos llanto, cero gritos y tranquilidad inmediata.\n2. Claim: Funciona en cualquier lugar → Prueba: Modo offline sin conexión y formato móvil 1-toque → Beneficio: Seguridad total para salir a la calle sin miedo.'
          : `1. Claim: Reduce el tiempo de ejecución en un 60% → Prueba: Flujo guiado en 3 pasos → Beneficio: Más productividad con menos estrés.`;
        break;

      case 'casos_de_exito':
        purpose = 'Casos reales documentados.';
        outputType = 'casos_estudio';
        proposed = isTEA
          ? 'Caso Familia R. (Santiago): Pasaron de crisis diarias de 40 minutos en el supermercado a resolver detonantes sensoriales en 90 segundos con el apoyo visual de la app.'
          : 'Caso Empresa Alpha: Logró estandarizar sus entregas y reducir errores en un 85% en las primeras 4 semanas.';
        break;

      case 'testimonios':
        purpose = 'Declaración textual de clientes satisfechos.';
        outputType = 'testimonios';
        proposed = isTEA
          ? '"Por primera vez en 3 años pude ir al centro comercial con mi hijo sin el pánico constante de no saber qué hacer si se desregulaba. Esta app nos devolvió la libertad y la paz." — María P., mamá de Tomás (6 años).'
          : '"La claridad que nos dio esta herramienta transformó nuestra forma de trabajar desde el primer día." — Carlos M., Director de Proyectos.';
        break;

      default:
        proposed = `Evidencia y pruebas aplicadas para ${fieldKey.replace(/_/g, ' ')} en ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 11: MARCA
  // =========================================================================
  else if (sectionKey === 'marca') {
    switch (fieldKey) {
      case 'nombre_de_la_marca':
        purpose = 'Nombre oficial de la marca.';
        outputType = 'nombre_marca';
        proposed = isTEA ? 'TEA Calm' : pName;
        break;

      case 'descripcion_canonica':
        purpose = 'Definición de identidad en una frase canónica.';
        outputType = 'descripcion_marca';
        proposed = isTEA
          ? 'La plataforma de apoyo situacional que transforma las crisis conductuales en momentos de calma y conexión familiar.'
          : `La plataforma líder en sistematización guiada para ${pCat}.`;
        break;

      case 'proposito':
        purpose = 'El por qué fundamental de la organización.';
        outputType = 'proposito';
        proposed = isTEA
          ? 'Empoderar a las familias con herramientas inmediatas y científicamente fundamentadas para que ningún cuidador vuelva a sentirse solo o impotente ante una desregulación.'
          : 'Ayudar a profesionales a maximizar su impacto mediante herramientas ágiles y precisas.';
        break;

      case 'personalidad':
        purpose = 'Rasgos de carácter de la marca.';
        outputType = 'personalidad';
        proposed = 'Empática, serena, rigurosa, clara, comprensiva y profundamente respetuosa.';
        break;

      case 'voz_y_tono':
        purpose = 'Guía de redacción y comunicación verbal.';
        outputType = 'tono';
        proposed = 'Tono cálido pero preciso y directo; libre de tecnicismos intimidantes; enfocado en la acción práctica y el alivio inmediato.';
        break;

      case 'nivel_de_tecnicismo':
        purpose = 'Grado de complejidad técnica en el lenguaje.';
        outputType = 'tecnicismo';
        proposed = 'Nivel 2 de 5: Rigor conceptual y neurocientífico en el fondo, extrema simplicidad y claridad conversacional en la forma.';
        break;

      case 'estilo_visual':
        purpose = 'Directrices de diseño visual y paleta.';
        outputType = 'estilo_visual';
        proposed = 'Minimalista, con contrastes suaves, fondos oscuros relajantes (dark mode eye-safe), paleta en tonos lavanda e índigo y tipografía de alta legibilidad.';
        break;

      default:
        proposed = `Directrices de marca aplicadas para ${fieldKey.replace(/_/g, ' ')} en ${pName}.`;
    }
  }

  // =========================================================================
  // SECCIÓN 12: COMUNICACIÓN
  // =========================================================================
  else if (sectionKey === 'comunicacion') {
    switch (fieldKey) {
      case 'mensaje_primario':
        purpose = 'El mensaje central que debe quedar grabado en la mente de la audiencia.';
        outputType = 'mensaje_primario';
        if (engineType === 'todd_brown') {
          proposed = isTEA
            ? 'De la crisis al abrazo en 60 segundos: El protocolo visual que calma las desregulaciones sin gritos, castigos ni manuales eternos.'
            : `Domina ${pCat} con la certeza y velocidad de un sistema estructurado paso a paso.`;
        } else if (engineType === 'alex_hormozi') {
          proposed = isTEA
            ? 'Detén crisis de sobrecarga sensorial en 3 toques con tu móvil sin perder tiempo ni paciencia.'
            : `Ahorra 10 horas semanales y asegura resultados consistentes desde el primer uso.`;
        } else {
          proposed = isTEA
            ? 'Nunca más te sientas sola en medio de una crisis: la guía segura que devuelve la calma a tu hogar y la sonrisa a tu hijo.'
            : `Transforma el caos diario en claridad y confianza total.`;
        }
        break;

      case 'beneficios_priorizados':
        purpose = 'Lista jerárquica de beneficios para el usuario.';
        outputType = 'beneficios';
        proposed = '1. Certeza inmediata en los 60 segundos críticos.\n2. Reducción drástica del estrés y la culpa parental.\n3. Autonomía y libertad para salir a cualquier espacio público con tranquilidad.';
        break;

      case 'secuencia_narrativa_completa':
        purpose = 'La historia argumental completa del mensaje.';
        outputType = 'narrativa';
        proposed = 'Problema (Crisis imprevistas) → Diagnóstico erróneo (Falta de disciplina) → Causa raíz (Sobrecarga sensorial sin apoyo situacional) → Enemigo (Mito punitivo) → Oportunidad (Co-regulación visual) → Mecanismo (Protocolo 60s) → Oferta (App Familiar).';
        break;

      case 'reglas_por_canal':
        purpose = 'Instrucciones específicas por medio de comunicación.';
        outputType = 'reglas_canales';
        proposed = 'Instagram/TikTok: Videos cortos demostrando la interfaz SOS en situaciones reales cotidianas.\nEmail: Historias de empatía parental y lecciones de co-regulación con CTA suave al plan anual.\nLanding: Enfoque directo en la Big Idea y prueba gratuita de 7 días.';
        break;

      case 'glosario_de_terminos_propios':
        purpose = 'Vocabulario propietario del producto.';
        outputType = 'glosario';
        proposed = '• Protocolo Calma 60s: Secuencia visual de 3 pasos para desescalar desregulaciones.\n• Co-regulación Situacional: Proceso mediante el cual la serenidad del adulto transmite seguridad neurológica al niño mediante apoyo visual.';
        break;

      default:
        proposed = `Directrices de comunicación aplicadas para ${fieldKey.replace(/_/g, ' ')} en ${pName}.`;
    }
  }

  // Fallback if not specifically caught
  if (!proposed) {
    proposed = `Valor estratégico aplicado para ${fieldKey.replace(/_/g, ' ')} en el contexto del proyecto ${pName}.`;
  }

  // Run through our strict anti-slop sanitizer
  const sanitized = sanitizeAppliedFieldValue(proposed);

  return {
    proposedValue: sanitized,
    fieldPurpose: purpose || `Propósito funcional de ${fieldKey}`,
    expectedOutputType: outputType,
    engineUsed: engineType,
    confidenceScore: 92,
  };
}

/**
 * Generates proposals for an entire section using a chosen Strategic Engine.
 */
export function generateStrategicSectionProposals(
  sectionKey: string,
  engineType: StrategicEngineType,
  project: Project,
  formData: Record<string, any> = {}
): {
  sectionKey: string;
  sectionTitle: string;
  engineUsed: StrategicEngineType;
  engineInfo: StrategicEngineInfo;
  proposals: {
    sectionKey: string;
    fieldKey: string;
    fieldLabel: string;
    fieldPurpose: string;
    expectedOutputType: string;
    currentValue: string;
    proposedValue: string;
    hasExistingValue: boolean;
    confidenceScore: number;
    engineUsed: StrategicEngineType;
  }[];
} {
  const context = buildProjectSemanticContext(project, formData);
  const sectionDef = MASTER_DOC_SECTIONS.find((s) => s.key === sectionKey);
  const sectionTitle = sectionDef?.title || sectionKey;
  const engineInfo = STRATEGIC_ENGINES[engineType];

  const proposals: any[] = [];

  if (sectionDef) {
    sectionDef.subsections.forEach((sub) => {
      sub.fields.forEach((f) => {
        if (f.type === 'inherited' && f.targetSectionId) {
          return;
        }

        const currentVal = formData[sectionKey]?.[f.key] || '';
        const hasValue = String(currentVal).trim().length > 0;

        const result = generateStrategicFieldValue(sectionKey, f.key, engineType, context);

        proposals.push({
          sectionKey,
          fieldKey: f.key,
          fieldLabel: f.label,
          fieldPurpose: result.fieldPurpose,
          expectedOutputType: result.expectedOutputType,
          currentValue: String(currentVal),
          proposedValue: result.proposedValue,
          hasExistingValue: hasValue,
          confidenceScore: result.confidenceScore,
          engineUsed: engineType,
        });
      });
    });
  }

  return {
    sectionKey,
    sectionTitle,
    engineUsed: engineType,
    engineInfo,
    proposals,
  };
}
