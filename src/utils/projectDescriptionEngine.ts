import { BusinessCategory } from '../types';

export interface ProjectDescriptionProposal {
  id: string;
  angle: 'clarity' | 'transformation' | 'mechanism';
  angleLabel: string;
  angleTag: string;
  angleColor: string;
  text: string;
}

interface ParsedIdeaComponents {
  rawIdea: string;
  targetAudience: string;
  coreActions: string[];
  painPoints: string[];
  results: string[];
  mechanisms: string[];
  cleanProductType: string;
}

/**
 * Normalizes text and extracts key semantic components from an informal idea.
 */
function parseIdeaSemantics(name: string, idea: string, category?: BusinessCategory): ParsedIdeaComponents {
  const trimmed = idea.trim();
  const lower = trimmed.toLowerCase();

  // 1. Identify Target Audience
  let targetAudience = '';
  const audienceMatches = [
    /para\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:que|con|sin|para|y|en|donde|a\s+fin)|\.|$)/i,
    /ayudar\s+a\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:a|que|con|sin|y|en)|\.|$)/i,
    /dirigid[oa]\s+a\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:que|con|sin)|\.|$)/i,
    /enfocad[oa]\s+en\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:que|con|sin)|\.|$)/i,
    /orientad[oa]\s+a\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:que|con|sin)|\.|$)/i,
  ];

  for (const pattern of audienceMatches) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[1].trim().length > 2 && match[1].trim().length < 80) {
      targetAudience = match[1].trim();
      break;
    }
  }

  // Fallback defaults by category if no explicit audience is mentioned
  if (!targetAudience) {
    if (lower.includes('freelancer') || lower.includes('autónomo') || lower.includes('independiente')) {
      targetAudience = 'freelancers y profesionales independientes';
    } else if (lower.includes('tea') || lower.includes('autismo') || lower.includes('neurodiverg')) {
      targetAudience = 'padres, cuidadores y terapeutas de niños con TEA';
    } else if (lower.includes('empresa') || lower.includes('b2b') || lower.includes('equipo')) {
      targetAudience = 'equipos de trabajo y empresas';
    } else if (lower.includes('estudiante') || lower.includes('alumno')) {
      targetAudience = 'estudiantes y profesionales en formación';
    } else if (lower.includes('creador') || lower.includes('influencer')) {
      targetAudience = 'creadores de contenido y marcas personales';
    } else if (category === 'Cursos Digitales') {
      targetAudience = 'profesionales y estudiantes que buscan dominar esta disciplina';
    } else if (category === 'Servicios') {
      targetAudience = 'clientes y empresas que necesitan resultados especializados';
    } else if (category === 'Productos Físicos') {
      targetAudience = 'consumidores que buscan una solución práctica y de alta calidad';
    } else {
      targetAudience = 'usuarios y profesionales';
    }
  }

  // Clean audience text from trailing prepositions
  targetAudience = targetAudience
    .replace(/^(los|las|el|la|un|una|unos|unas)\s+/i, '')
    .replace(/\s+(que|con|para|sin)$/i, '')
    .trim();

  // 2. Identify Product Category / Type
  let cleanProductType = '';
  if (lower.includes('app') || lower.includes('aplicación') || lower.includes('software') || lower.includes('plataforma') || category === 'Apps') {
    cleanProductType = 'aplicación';
  } else if (lower.includes('curso') || lower.includes('programa') || lower.includes('formación') || category === 'Cursos Digitales') {
    cleanProductType = 'programa';
  } else if (lower.includes('servicio') || lower.includes('agencia') || category === 'Servicios') {
    cleanProductType = 'servicio';
  } else if (lower.includes('producto') || category === 'Productos Físicos') {
    cleanProductType = 'producto';
  } else {
    cleanProductType = 'herramienta';
  }

  // 3. Extract Pain Points / Frictions
  const painPoints: string[] = [];
  const painMatches = [
    /sin\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:y|para|de|\.|$))/i,
    /en\s+vez\s+de\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:y|para|\.|$))/i,
    /evitar\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:y|para|\.|$))/i,
    /reemplazar\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:y|para|por|\.|$))/i,
    /para\s+no\s+tener\s+que\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:y|para|\.|$))/i,
    /sin\s+tener\s+que\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:y|para|\.|$))/i,
    /el\s+caos\s+de\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s,\/]+?)(?:\s+(?:y|para|\.|$))/i,
  ];

  for (const pm of painMatches) {
    const match = trimmed.match(pm);
    if (match && match[1] && match[1].trim().length > 3) {
      const cleanPain = match[1].trim().replace(/\.$/, '');
      if (!painPoints.includes(cleanPain)) {
        painPoints.push(cleanPain);
      }
    }
  }

  if (painPoints.length === 0) {
    if (lower.includes('herramientas') || lower.includes('apps separadas') || lower.includes('cinco herramientas') || lower.includes('varias herramientas')) {
      painPoints.push('saltar entre múltiples herramientas dispersas');
    } else if (lower.includes('tiempo') || lower.includes('lento') || lower.includes('horas')) {
      painPoints.push('procesos manuales y pérdida de tiempo');
    } else if (lower.includes('desorgani') || lower.includes('caos') || lower.includes('desorden')) {
      painPoints.push('la desorganización y la falta de visibilidad');
    } else if (lower.includes('cobro') || lower.includes('factur')) {
      painPoints.push('retrasos en cobros y tareas administrativas');
    }
  }

  // 4. Extract Core Actions & Capabilities
  const coreActions: string[] = [];
  const actionVerbs = [
    /(?:para|que)\s+(?:ayudar\s+a\s+)?(organizar[a-záéíóúñ\s,]+?)(?:\s+(?:sin|para|y\s+así|\.|$))/i,
    /(?:para|que)\s+(centraliza[a-záéíóúñ\s,]+?)(?:\s+(?:sin|para|\.|$))/i,
    /(?:para|que)\s+(gestiona[a-záéíóúñ\s,]+?)(?:\s+(?:sin|para|\.|$))/i,
    /(?:para|que)\s+(conecta[a-záéíóúñ\s,]+?)(?:\s+(?:sin|para|\.|$))/i,
    /(?:para|que)\s+(automatiza[a-záéíóúñ\s,]+?)(?:\s+(?:sin|para|\.|$))/i,
    /(?:para|que)\s+(simplifica[a-záéíóúñ\s,]+?)(?:\s+(?:sin|para|\.|$))/i,
    /(?:para|que)\s+(facilita[a-záéíóúñ\s,]+?)(?:\s+(?:sin|para|\.|$))/i,
    /(?:para|que)\s+(permite[a-záéíóúñ\s,]+?)(?:\s+(?:sin|para|\.|$))/i,
  ];

  for (const av of actionVerbs) {
    const match = trimmed.match(av);
    if (match && match[1] && match[1].trim().length > 4) {
      const act = match[1].trim().replace(/\.$/, '');
      if (!coreActions.includes(act)) {
        coreActions.push(act);
      }
    }
  }

  // Fallback core capabilities extraction from text
  const cleanIdeaNoApp = trimmed
    .replace(/^una\s+(app|aplicación|plataforma|herramienta|software|curso|servicio|producto)\s+(para|que)\s+/i, '')
    .replace(/^ayuda\s+a\s+/i, '')
    .trim();

  // 5. Clean & Extract mechanisms and results
  const results: string[] = [];
  if (lower.includes('cobros') || lower.includes('cobrar') || lower.includes('facturas')) {
    results.push('mantener los cobros al día y la facturación ordenada');
  }
  if (lower.includes('orden') || lower.includes('organizar') || lower.includes('control')) {
    results.push('mantener cada proyecto y cliente bajo control');
  }
  if (lower.includes('tiempo') || lower.includes('rápido') || lower.includes('ahorrar')) {
    results.push('reducir horas de trabajo administrativo');
  }
  if (lower.includes('tea') || lower.includes('conducta')) {
    results.push('responder con pautas prácticas a situaciones cotidianas');
  }

  return {
    rawIdea: trimmed,
    targetAudience,
    coreActions: coreActions.length > 0 ? coreActions : [cleanIdeaNoApp],
    painPoints,
    results,
    mechanisms: ['un único flujo integrado', 'un espacio de trabajo centralizado', 'un sistema visual estructurado'],
    cleanProductType,
  };
}

/**
 * Filter and purify output text ensuring zero generic slop.
 */
function purifyDescription(text: string): string {
  let cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/una plataforma innovadora que /gi, '')
    .replace(/una solución integral diseñada para /gi, '')
    .replace(/una aplicación intuitiva que /gi, '')
    .replace(/un software de vanguardia que /gi, '')
    .replace(/supercharge/gi, 'optimiza')
    .replace(/empower/gi, 'permite')
    .trim();

  // Ensure first character is uppercase
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Ensure it ends with a period
  if (cleaned.length > 0 && !cleaned.endsWith('.')) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Generates 3 strategically distinct product descriptions based on Name + Idea:
 *
 * OPTION A: Claridad + Resultado (Immediate comprehension, who it is for + what concrete outcome it produces).
 * OPTION B: Problema + Transformación (Points to the current friction and bridges to the desired transformation).
 * OPTION C: Diferenciación + Mecanismo (Highlights what makes it operationally singular and its unique advantage).
 */
export function generateProjectDescriptions(
  name: string,
  idea: string,
  category: BusinessCategory = 'Apps',
  seedIndex: number = 0
): ProjectDescriptionProposal[] {
  const trimmedName = name.trim() || 'El producto';
  const trimmedIdea = idea.trim();

  if (!trimmedIdea || trimmedIdea.length < 5) {
    return [];
  }

  const parsed = parseIdeaSemantics(trimmedName, trimmedIdea, category);
  const audience = parsed.targetAudience;
  const primaryAction = parsed.coreActions[0] || parsed.rawIdea;
  const primaryPain = parsed.painPoints[0] || 'la dispersión de tareas y herramientas desconectadas';
  
  // Format primary action into clean verb clauses
  let actionClause = primaryAction
    .replace(/^(para|que|ayudar a|ayuda a|permitir a|permite a)\s+/i, '')
    .replace(/^organizar\s+/i, 'organiza ')
    .replace(/^centralizar\s+/i, 'centraliza ')
    .replace(/^gestionar\s+/i, 'gestiona ')
    .replace(/^automatizar\s+/i, 'automatiza ')
    .replace(/^simplificar\s+/i, 'simplifica ')
    .replace(/^conectar\s+/i, 'conecta ')
    .trim();

  // Seed variations for "Generar otras 3"
  const variation = seedIndex % 3;

  // -------------------------------------------------------------
  // ÁNGULO A: Claridad + Resultado
  // -------------------------------------------------------------
  let textA = '';
  if (variation === 0) {
    if (parsed.painPoints.length > 0) {
      textA = `${trimmedName} centraliza ${actionClause} en un solo espacio para que ${audience} puedan operar de forma clara sin ${primaryPain}.`;
    } else {
      textA = `${trimmedName} permite a ${audience} ${actionClause} de manera directa para obtener resultados consistentes desde el primer día.`;
    }
  } else if (variation === 1) {
    textA = `${trimmedName} es la herramienta que ayuda a ${audience} a ${actionClause}, consolidando toda su operativa en un flujo claro y sin fricciones.`;
  } else {
    textA = `${trimmedName} reúne ${actionClause} para que ${audience} alcancen su objetivo con máxima rapidez y sin complicaciones técnicas.`;
  }

  // -------------------------------------------------------------
  // ÁNGULO B: Problema + Transformación
  // -------------------------------------------------------------
  let textB = '';
  if (variation === 0) {
    if (parsed.painPoints.length > 0) {
      textB = `${trimmedName} ayuda a ${audience} a reemplazar ${primaryPain} por un sistema estructurado para ${actionClause} de principio a fin.`;
    } else {
      textB = `${trimmedName} elimina la fricción y el desorden habitual en ${audience}, convirtiendo ${actionClause} en un proceso predecible y bajo control.`;
    }
  } else if (variation === 1) {
    textB = `${trimmedName} resuelve la frustración de ${primaryPain} ofreciendo a ${audience} un camino guiado para ${actionClause} y asegurar resultados.`;
  } else {
    textB = `${trimmedName} transforma el proceso diario de ${audience}: sustituye métodos improvisados por un entorno claro para ${actionClause}.`;
  }

  // -------------------------------------------------------------
  // ÁNGULO C: Diferenciación + Mecanismo
  // -------------------------------------------------------------
  let textC = '';
  if (variation === 0) {
    textC = `${trimmedName} es el centro operativo para ${audience}: conecta ${actionClause} en una sola secuencia de trabajo para reducir tareas manuales y mantener cada avance sincronizado.`;
  } else if (variation === 1) {
    textC = `${trimmedName} utiliza un enfoque unificado para ${audience}, integrando ${actionClause} en un mismo pipeline para eliminar tareas duplicadas y maximizar la productividad.`;
  } else {
    textC = `${trimmedName} se diferencia al estructurar ${actionClause} a través de un mecanismo directo para ${audience}, garantizando visibilidad total y ejecución sin errores.`;
  }

  // Purify outputs against anti-slop rules
  const cleanA = purifyDescription(textA);
  const cleanB = purifyDescription(textB);
  const cleanC = purifyDescription(textC);

  return [
    {
      id: `prop-clarity-${seedIndex}`,
      angle: 'clarity',
      angleLabel: 'Claridad + Resultado',
      angleTag: 'Directo y concreto',
      angleColor: 'text-[#38bdf8] bg-[#0e2238] border-[#1d446f]',
      text: cleanA,
    },
    {
      id: `prop-transformation-${seedIndex}`,
      angle: 'transformation',
      angleLabel: 'Problema + Transformación',
      angleTag: 'Relevancia y deseo',
      angleColor: 'text-[#f59e0b] bg-[#291e0a] border-[#543b12]',
      text: cleanB,
    },
    {
      id: `prop-mechanism-${seedIndex}`,
      angle: 'mechanism',
      angleLabel: 'Diferenciación + Mecanismo',
      angleTag: 'Ventaja singular',
      angleColor: 'text-[#a855f7] bg-[#24133b] border-[#4c247d]',
      text: cleanC,
    },
  ];
}
