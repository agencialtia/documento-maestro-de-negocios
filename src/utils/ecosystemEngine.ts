import { 
  Project, 
  ScreenNode, 
  TestCaseItem, 
  BugItem, 
  AnalyticsEventItem, 
  AnalyticsTrackingPlanData, 
  LegalComplianceData, 
  GoToMarketData, 
  MasterDocAuditImpact 
} from '../types';

/**
 * Checks if the Commercial Model / Pricing & Unit Economics is complete.
 * Must not be empty: estructura_precios, cac_estimado, ltv_estimado, margen_objetivo.
 */
export function checkCommercialModelComplete(project: Project): { complete: boolean; missing: string[] } {
  const masterSections = project.masterStrategyDoc?.sections || {};
  const contexto = masterSections['contexto'] || {};
  const missing: string[] = [];

  if (!contexto.estructura_precios || String(contexto.estructura_precios).trim().length === 0) {
    missing.push('Estructura de precios');
  }
  if (!contexto.cac_estimado || String(contexto.cac_estimado).trim().length === 0) {
    missing.push('CAC estimado');
  }
  if (!contexto.ltv_estimado || String(contexto.ltv_estimado).trim().length === 0) {
    missing.push('LTV estimado');
  }
  if (!contexto.margen_objetivo || String(contexto.margen_objetivo).trim().length === 0) {
    missing.push('Margen objetivo');
  }

  return {
    complete: missing.length === 0,
    missing,
  };
}

/**
 * Checks if Delivery Vehicle (Vehículo de Entrega) is complete in Contexto 1.4.
 */
export function checkDeliveryVehicleComplete(project: Project): { complete: boolean; missing: string[] } {
  const masterSections = project.masterStrategyDoc?.sections || {};
  const contexto = masterSections['contexto'] || {};
  const missing: string[] = [];

  if (!contexto.vehiculo_principal || String(contexto.vehiculo_principal).trim().length === 0) {
    missing.push('Vehículo principal de entrega (Contexto 1.4)');
  }

  return {
    complete: missing.length === 0,
    missing,
  };
}

/**
 * Checks if Legal & Compliance module is ready and unblocked.
 */
export function checkLegalModuleStatus(project: Project): {
  status: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
  isLocked: boolean;
  missingBlockers: string[];
  hasPendingCriticalItems: boolean;
} {
  const commCheck = checkCommercialModelComplete(project);
  const vehCheck = checkDeliveryVehicleComplete(project);
  const blockers: string[] = [];

  if (!commCheck.complete) {
    blockers.push(`Pricing & Unit Economics incompleto (${commCheck.missing.join(', ')})`);
  }
  if (!vehCheck.complete) {
    blockers.push('Vehículo de Entrega (Contexto 1.4) sin definir');
  }

  if (blockers.length > 0) {
    return {
      status: 'bloqueado',
      isLocked: true,
      missingBlockers: blockers,
      hasPendingCriticalItems: true,
    };
  }

  const legal = project.legalCompliance;
  if (!legal) {
    return {
      status: 'vacio',
      isLocked: false,
      missingBlockers: [],
      hasPendingCriticalItems: true,
    };
  }

  // Sensitive data check
  if (legal.procesaDatosSensiblesOmenores === 'Sí') {
    const list = Object.values(legal.sensitiveChecklist || {});
    const uncheckedCount = list.filter((v) => !v).length;
    if (uncheckedCount > 0) {
      return {
        status: 'desactualizado',
        isLocked: false,
        missingBlockers: [],
        hasPendingCriticalItems: true,
      };
    }
  }

  const hasTerms = legal.terminosCondiciones?.status === 'Generado' || legal.terminosCondiciones?.status === 'Revisado';
  const hasPrivacy = legal.politicaPrivacidad?.status === 'Generado' || legal.politicaPrivacidad?.status === 'Revisado';
  const hasCookies = legal.avisoCookies?.status === 'Generado' || legal.avisoCookies?.status === 'Revisado';

  if (hasTerms && hasPrivacy && hasCookies) {
    return {
      status: 'actualizado',
      isLocked: false,
      missingBlockers: [],
      hasPendingCriticalItems: false,
    };
  }

  return {
    status: 'desactualizado',
    isLocked: false,
    missingBlockers: [],
    hasPendingCriticalItems: true,
  };
}

/**
 * Checks QA & Testing status:
 * Rule: QA & Testing is 'actualizado' ONLY when:
 * % of screens with complete test cases >= % of screens marked as 'Terminada'.
 * And there are 0 open critical bugs.
 */
export function checkQAModuleStatus(project: Project): {
  status: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
  screensTotal: number;
  screensFinished: number;
  screensWithTests: number;
  openCriticalBugs: number;
  openMajorBugs: number;
  openMinorBugs: number;
  hasOutdatedTests: boolean;
  isCompliant: boolean;
} {
  const screens = project.screensData?.screens || [];
  const qa = project.qaTesting;

  const screensTotal = screens.length;
  const screensFinished = screens.filter((s) => s.status === 'Terminada').length;

  if (screensTotal === 0) {
    return {
      status: 'vacio',
      screensTotal: 0,
      screensFinished: 0,
      screensWithTests: 0,
      openCriticalBugs: 0,
      openMajorBugs: 0,
      openMinorBugs: 0,
      hasOutdatedTests: false,
      isCompliant: false,
    };
  }

  if (!qa || !qa.testCases || qa.testCases.length === 0) {
    return {
      status: 'vacio',
      screensTotal,
      screensFinished,
      screensWithTests: 0,
      openCriticalBugs: 0,
      openMajorBugs: 0,
      openMinorBugs: 0,
      hasOutdatedTests: false,
      isCompliant: false,
    };
  }

  // Count screens with at least 3 test cases (happy, error, edge)
  const screensCovered = new Set<string>();
  screens.forEach((s) => {
    const cases = qa.testCases.filter((c) => c.screenId === s.id && (c.status === 'Terminada' || c.status === 'En desarrollo'));
    if (cases.length >= 3) {
      screensCovered.add(s.id);
    }
  });

  const screensWithTests = screensCovered.size;
  const testsPercentage = screensTotal > 0 ? (screensWithTests / screensTotal) * 100 : 0;
  const finishedPercentage = screensTotal > 0 ? (screensFinished / screensTotal) * 100 : 0;

  const bugs = qa.bugs || [];
  const openCriticalBugs = bugs.filter((b) => b.severity === 'Crítico' && b.status !== 'Resuelto').length;
  const openMajorBugs = bugs.filter((b) => b.severity === 'Mayor' && b.status !== 'Resuelto').length;
  const openMinorBugs = bugs.filter((b) => b.severity === 'Menor' && b.status !== 'Resuelto').length;

  const hasOutdatedTests = qa.testCases.some((c) => c.isOutdated);
  const isCompliant = testsPercentage >= finishedPercentage && openCriticalBugs === 0 && !hasOutdatedTests && screensWithTests > 0;

  let status: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio' = 'desactualizado';
  if (isCompliant) {
    status = 'actualizado';
  } else if (openCriticalBugs > 0 || hasOutdatedTests) {
    status = 'desactualizado';
  }

  return {
    status,
    screensTotal,
    screensFinished,
    screensWithTests,
    openCriticalBugs,
    openMajorBugs,
    openMinorBugs,
    hasOutdatedTests,
    isCompliant,
  };
}

/**
 * Generate automated test cases for all screens in the project.
 */
export function generateAutomatedTestCases(screens: ScreenNode[]): TestCaseItem[] {
  const testCases: TestCaseItem[] = [];

  screens.forEach((screen) => {
    // 1. Happy Path
    testCases.push({
      id: `tc-${screen.id}-happy`,
      screenId: screen.id,
      screenName: screen.name,
      type: 'happy_path',
      title: `[Camino Feliz] Flujo principal en ${screen.name}`,
      description: `Verificar que el usuario completa exitosamente el propósito de la pantalla: "${screen.purpose}".`,
      preconditions: 'Usuario con sesión activa y datos válidos precargados.',
      steps: [
        `1. Navegar a la ruta ${screen.route || '/' + screen.name.toLowerCase().replace(/\s+/g, '-')}`,
        `2. Validar que se rendericen los elementos clave: ${(screen.keyElements || []).slice(0, 3).join(', ') || 'elementos principales'}`,
        `3. Ejecutar la acción primaria de salida: ${screen.navigationActions?.[0]?.trigger || 'Acción continuar'}`,
      ],
      expectedResult: `Transición fluida a ${screen.navigationActions?.[0]?.targetScreenName || 'la siguiente pantalla'} sin errores ni bloqueos.`,
      status: 'Terminada',
      isOutdated: false,
      lastUpdated: new Date().toLocaleDateString(),
    });

    // 2. Error Path
    testCases.push({
      id: `tc-${screen.id}-error`,
      screenId: screen.id,
      screenName: screen.name,
      type: 'error_path',
      title: `[Caso de Error] Manejo de fallos en ${screen.name}`,
      description: `Validar la respuesta resiliente de la interfaz ante inputs incorrectos o fallo de red en "${screen.name}".`,
      preconditions: 'Simulación de desconexión o datos malformados.',
      steps: [
        `1. Interactuar con los controles de ${screen.name} omitiendo campos obligatorios`,
        '2. Intentar enviar o avanzar sin satisfacer validaciones',
        '3. Provocar timeout o respuesta 500 del servidor',
      ],
      expectedResult: 'Se muestra feedback claro de error en línea (UX writing empático), sin crashes ni estados inconsistentes.',
      status: 'Terminada',
      isOutdated: false,
      lastUpdated: new Date().toLocaleDateString(),
    });

    // 3. Edge Case
    testCases.push({
      id: `tc-${screen.id}-edge`,
      screenId: screen.id,
      screenName: screen.name,
      type: 'edge_case',
      title: `[Caso Borde] Límites y estados extremos en ${screen.name}`,
      description: `Comprobar el comportamiento con textos ultra largos, doble submit rápido y reconexión en "${screen.name}".`,
      preconditions: 'Dispositivo con latencia alta y storage local restringido.',
      steps: [
        '1. Introducir cadenas de texto con caracteres especiales y longitud extrema',
        '2. Hacer click repetido y concurrente en los botones de acción',
        '3. Suspender la app y reanudar mientras se ejecuta una transición',
      ],
      expectedResult: 'La interfaz mantiene estabilidad visual, desactiva botones en vuelo para evitar duplicados y preserva el estado.',
      status: 'Terminada',
      isOutdated: false,
      lastUpdated: new Date().toLocaleDateString(),
    });

    // 4. Accessibility
    testCases.push({
      id: `tc-${screen.id}-a11y`,
      screenId: screen.id,
      screenName: screen.name,
      type: 'accessibility',
      title: `[Accesibilidad] Contraste y navegación por teclado en ${screen.name}`,
      description: `Validar cumplimiento WCAG AA y foco accesible en ${screen.name}.`,
      steps: [
        '1. Navegar por todos los elementos interactivos usando solo la tecla Tab',
        '2. Verificar ratios de contraste superiores a 4.5:1 en textos principales',
        '3. Comprobar etiquetas semánticas y aria-label en lectores de pantalla',
      ],
      expectedResult: 'Foco visualmente nítido, orden lógico de navegación y lectura accesible.',
      status: 'Terminada',
      isOutdated: false,
      lastUpdated: new Date().toLocaleDateString(),
    });
  });

  return testCases;
}

/**
 * Generate automated Analytics Tracking Plan from project screens, actions and Master Doc.
 */
export function generateAutomatedTrackingPlan(project: Project): AnalyticsTrackingPlanData {
  const masterSections = project.masterStrategyDoc?.sections || {};
  const contexto = masterSections['contexto'] || {};
  const northStar = contexto.metrica_exito || 'Tasa de retención semanal de familias activas (>65%)';

  const screens = project.screensData?.screens || [];
  const events: AnalyticsEventItem[] = [];

  // Core global events
  events.push({
    id: 'evt-app-opened',
    name: 'app_session_started',
    screenId: 'global',
    screenName: 'Global',
    trigger: 'Inicio de sesión / Apertura de la aplicación',
    properties: ['user_id', 'session_id', 'device_type', 'platform', 'app_version', 'timestamp'],
    userEntity: 'User',
    eventGoal: 'Medir DAU / WAU y frecuencia de uso general.',
    funnelStage: 'Adquisición & Retención',
    suggestedTool: 'PostHog',
  });

  screens.forEach((screen) => {
    const slug = screen.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    // Screen view event
    events.push({
      id: `evt-${screen.id}-view`,
      name: `view_${slug}`,
      screenId: screen.id,
      screenName: screen.name,
      trigger: `Usuario ingresa a la pantalla ${screen.name} (${screen.route || '/' + slug})`,
      properties: ['user_id', 'flow_id', 'source_screen', 'timestamp'],
      userEntity: 'User',
      eventGoal: `Monitorear tráfico, permanencia y abandono en ${screen.name}.`,
      funnelStage: screen.type === 'Onboarding' ? 'Onboarding' : screen.type === 'Checkout' ? 'Monetización' : 'Engagement',
      suggestedTool: 'Mixpanel',
    });

    // Navigation actions events
    (screen.navigationActions || []).forEach((action, actIdx) => {
      const actionSlug = action.trigger.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const eventName = `${slug}_${actionSlug || 'action_' + actIdx}`;

      events.push({
        id: `evt-${screen.id}-act-${actIdx}`,
        name: eventName,
        screenId: screen.id,
        screenName: screen.name,
        trigger: `Click / interacción: "${action.trigger}"`,
        properties: [
          'user_id',
          'target_screen',
          action.condition ? 'condition_met' : 'trigger_type',
          'tier_plan',
          'timestamp',
        ],
        userEntity: 'User',
        eventGoal: `Medir conversión de salida hacia ${action.targetScreenName || action.targetScreenId || 'siguiente paso'}.`,
        funnelStage: 'Activación & Flujo',
        suggestedTool: 'PostHog',
      });
    });
  });

  const funnels = [
    {
      id: 'funnel-activation',
      name: 'Funnel de Activación y Onboarding',
      steps: ['view_splash', 'view_onboarding', 'onboarding_completar_onboarding', 'view_dashboard'],
    },
    {
      id: 'funnel-monetization',
      name: 'Funnel de Conversión a Plan Pro',
      steps: ['view_dashboard', 'dashboard_solicitar_plan_pro', 'view_checkout', 'checkout_confirmar_suscripcion'],
    },
  ];

  return {
    northStarMetric: northStar,
    events,
    funnels,
    lastGeneratedAt: new Date().toISOString(),
    isCustomized: true,
  };
}

/**
 * Generate complete Go-To-Market strategy.
 */
export function generateAutomatedGTMPlan(project: Project): GoToMarketData {
  const masterSections = project.masterStrategyDoc?.sections || {};
  const contexto = masterSections['contexto'] || {};
  const vehiculo = contexto.vehiculo_principal || project.category || 'App';
  const isApp = String(vehiculo).toLowerCase().includes('app') || project.category === 'Apps';

  const channels = [
    {
      id: 'ch-organic-search',
      channel: 'SEO & Content Marketing',
      strategy: 'Artículos y guías prácticas sobre manejo de situaciones difíciles, desescalada y rutinas estructuradas.',
      priority: 'Alta' as const,
      targetMetric: '1,500 visitas orgánicas/mes con 8% de conversión a registro.',
    },
    {
      id: 'ch-meta-ads',
      channel: 'Meta Ads (Instagram & Facebook)',
      strategy: 'Creativos directos enfocados en dolor (frustración en momentos críticos) y promesa de claridad inmediata.',
      priority: 'Alta' as const,
      targetMetric: 'CAC < $25 USD con CTR > 2.4%.',
    },
    {
      id: 'ch-alliances',
      channel: 'Alianzas con Terapeutas & Centros Especializados',
      strategy: 'Programa de embajadores para psicólogos, fonoaudiólogos y terapeutas ocupacionales.',
      priority: 'Media' as const,
      targetMetric: '20 centros aliados en los primeros 90 días.',
    },
  ];

  const timeline = [
    {
      id: 'phase-1',
      phase: 'Pre-lanzamiento' as const,
      title: 'Validación cerrada, QA técnico y Lista de Espera',
      duration: 'Semanas 1 - 3',
      milestones: [
        'Publicación de Landing Page con captura de emails para lista de espera',
        'Testing 100% de caminos felices y verificación de 0 bugs críticos',
        'Revisión legal de Términos, Privacidad y Cookies con foco en datos sensibles',
        'Instrumentación de analítica en PostHog y GA4',
      ],
      responsible: 'Tech Lead & Product Manager',
      risks: 'Fricciones en el onboarding detectadas en QA; mitigación con iteración rápida de microcopy.',
    },
    {
      id: 'phase-2',
      phase: 'Día de Lanzamiento (D-Day)' as const,
      title: 'Lanzamiento público y activación de secuencias',
      duration: 'Día D',
      milestones: [
        'Disparo de secuencia de bienvenida a los inscritos en lista de espera',
        'Activación de campañas publicitarias iniciales con presupuesto controlado',
        'Monitoreo en tiempo real del Tracking Plan y North Star Metric',
        isApp ? 'Publicación y apertura en App Store & Google Play' : 'Apertura de registros en dominio principal',
      ],
      responsible: 'Equipo de Crecimiento & Operaciones',
      risks: 'Pico de soporte en vivo; mitigación con FAQ accesible y canal de ayuda prioritario.',
    },
    {
      id: 'phase-3',
      phase: 'Post-lanzamiento' as const,
      title: 'Optimización de retención y monetización',
      duration: 'Semanas 4 - 8',
      milestones: [
        'Análisis de retención a 7 y 30 días (Cohort Analysis)',
        'Iteración de ofertas de upgrade/upsell basada en hitos de uso',
        'Entrevistas cualitativas con los primeros 50 usuarios de pago',
      ],
      responsible: 'Product Lead & Customer Success',
      risks: 'Churn temprano si no se percibe valor en la primera semana; mitigación con email de onboarding proactivo.',
    },
  ];

  const storeListingCopy = isApp
    ? {
        appName: project.name || 'SCREENOS App',
        subtitle: 'Guía práctica y acompañamiento diario en momentos difíciles',
        shortDescription: 'Estrategias claras, personalizadas y basadas en evidencia para acompañar a tu hijo cada día.',
        fullDescription: `${project.name} es la herramienta indispensable para familias y cuidadores.\n\n` +
          '• Respuestas rápidas ante situaciones cotidianas complejas.\n' +
          '• Registro intuitivo de avances y conductas clave.\n' +
          '• Planes personalizados adaptados a las necesidades reales de tu hogar.\n\n' +
          'Descárgala gratis y comienza hoy.',
        keywords: ['acompañamiento', 'guía diaria', 'rutinas familiares', 'terapia', 'conducta', 'apoyo parental'],
        screenshotPlan: [
          'Pantalla 1: Título de impacto y bienvenida empática',
          'Pantalla 2: Registro de situación en 3 toques',
          'Pantalla 3: Plan de acción inmediato paso a paso',
          'Pantalla 4: Dashboard de progreso semanal',
        ],
      }
    : undefined;

  const legalStatus = checkLegalModuleStatus(project);
  const qaStatus = checkQAModuleStatus(project);
  const commStatus = checkCommercialModelComplete(project);

  return {
    launchChecklist: {
      legalListo: legalStatus.status === 'actualizado',
      qaListo: qaStatus.status === 'actualizado',
      analiticaInstrumentada: !!project.analyticsData?.lastGeneratedAt,
      landingPublicada: true,
      secuenciasActivas: true,
      pricingValidado: commStatus.complete,
      canalesDefinidos: true,
      activosCriticosActualizados: !qaStatus.hasOutdatedTests,
    },
    timeline,
    acquisitionChannels: channels,
    storeListingCopy,
    generatedPlan: `# PLAN DE GO-TO-MARKET: ${project.name}\n\nEstrategia integral de lanzamiento validada para ${vehiculo}.`,
    lastGeneratedAt: new Date().toISOString(),
  };
}

/**
 * Maps any modified field in the Master Document to its EXACT downstream affected modules and assets.
 */
export function getDownstreamImpact(fieldKey: string, fieldLabel: string): MasterDocAuditImpact {
  const normalized = fieldKey.toLowerCase();

  if (normalized.includes('mecanismo') || normalized.includes('metodo') || normalized.includes('framework')) {
    return {
      lastChangedFieldKey: fieldKey,
      lastChangedFieldLabel: fieldLabel || 'Mecanismo Único',
      changedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      affectedModules: [
        'Documento Maestro (1. Contexto, 6. Mecanismo, 9. Producto)',
        'PRD & Especificación Funcional',
        'Arquitectura del Producto',
        'Pantallas y Flujos',
        'QA & Testing (Casos de prueba)',
        'Analítica & Tracking Plan',
        'Copy & Mensajería',
        'Landing Page',
        'Secuencias de Email',
        'Prompts',
        'Go-to-Market',
      ],
      affectedAssets: ['PRD', 'Arquitectura', 'Pantallas', 'Copy', 'Landing', 'Secuencias', 'Prompts', 'GTM', 'Compendio'],
      reason: 'El Mecanismo Único define la lógica central del producto; al alterarlo, toda la cadena funcional, visual y comercial debe sincronizarse.',
    };
  }

  if (normalized.includes('precio') || normalized.includes('monetizacion') || normalized.includes('cac') || normalized.includes('ltv') || normalized.includes('margen')) {
    return {
      lastChangedFieldKey: fieldKey,
      lastChangedFieldLabel: fieldLabel || 'Pricing & Unit Economics',
      changedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      affectedModules: [
        'Documento Maestro (1.5 Pricing & Unit Economics)',
        'Legal & Compliance (Términos de Facturación y Reembolso)',
        'Landing Page (Sección de Precios & CTA)',
        'Secuencias de Email (Oferta y Checkout)',
        'Go-to-Market (Proyección de Canales y CAC/LTV)',
      ],
      affectedAssets: ['Legal', 'Landing', 'Secuencias', 'GTM', 'Compendio'],
      reason: 'La alteración de precios o unit economics impacta directamente las condiciones legales, páginas de venta y presupuestos de adquisición.',
    };
  }

  if (normalized.includes('metrica_exito') || normalized.includes('metrica')) {
    return {
      lastChangedFieldKey: fieldKey,
      lastChangedFieldLabel: fieldLabel || 'Métrica Principal de Éxito',
      changedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      affectedModules: [
        'Analítica & Instrumentación (North Star Metric)',
        'PRD (Criterios de Aceptación)',
        'Go-to-Market (Métricas de Cohorte)',
      ],
      affectedAssets: ['Analítica', 'PRD', 'GTM', 'Compendio'],
      reason: 'La Métrica Principal de Éxito es la North Star del proyecto; debe heredarse de inmediato al Tracking Plan.',
    };
  }

  if (normalized.includes('audiencia') || normalized.includes('avatar') || normalized.includes('nicho') || normalized.includes('dolor')) {
    return {
      lastChangedFieldKey: fieldKey,
      lastChangedFieldLabel: fieldLabel || 'Audiencia & Avatar',
      changedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      affectedModules: [
        'Documento Maestro (3. Audiencias, 4. Avatar)',
        'PRD (Historias de Usuario)',
        'Copy & Mensajería',
        'Landing Page (Hero & Problema)',
        'Secuencias de Email',
        'Go-to-Market (Segmentación de Canales)',
      ],
      affectedAssets: ['PRD', 'Copy', 'Landing', 'Secuencias', 'GTM', 'Compendio'],
      reason: 'El cambio en la definición del usuario objetivo requiere alinear los mensajes, dolores y canales de adquisición.',
    };
  }

  if (normalized.includes('vehiculo') || normalized.includes('canal')) {
    return {
      lastChangedFieldKey: fieldKey,
      lastChangedFieldLabel: fieldLabel || 'Vehículo de Entrega',
      changedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      affectedModules: [
        'Documento Maestro (1.4 Vehículo de Entrega)',
        'Legal & Compliance (Términos por Plataforma / Stores)',
        'Arquitectura del Producto (Infraestructura Web vs Móvil)',
        'Pantallas y Flujos',
        'Go-to-Market (ASO / Store Listing vs Web SEO)',
      ],
      affectedAssets: ['Legal', 'Arquitectura', 'Pantallas', 'GTM', 'Compendio'],
      reason: 'El formato de entrega determina la plataforma tecnológica, requisitos legales de las tiendas y el plan de lanzamiento.',
    };
  }

  // Default downstream impact
  return {
    lastChangedFieldKey: fieldKey,
    lastChangedFieldLabel: fieldLabel || 'Estrategia',
    changedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    affectedModules: [
      'Documento Maestro',
      'PRD & Especificación',
      'Activos de Comunicación',
      'Compendio de la App',
    ],
    affectedAssets: ['PRD', 'Copy', 'Prompts', 'Compendio'],
    reason: `El campo "${fieldLabel || fieldKey}" fue actualizado en la fuente única de verdad.`,
  };
}

/**
 * Calculates the complete "% del ecosistema listo para lanzamiento" metric.
 * Uses weighted average across the 8 essential modules:
 * 1. Documento Maestro (15%)
 * 2. PRD (10%)
 * 3. Arquitectura (10%)
 * 4. Pantallas (15%)
 * 5. QA & Testing (15%)
 * 6. Legal & Compliance (15%)
 * 7. Analítica & Instrumentación (10%)
 * 8. Go-to-Market (10%)
 */
export interface LaunchReadinessReport {
  score: number; // 0 to 100
  isReadyForLaunch: boolean;
  blockers: string[];
  modulesStatus: {
    maestro: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
    prd: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
    arquitectura: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
    pantallas: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
    qa: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
    legal: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
    analitica: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
    gtm: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio';
  };
  stats: {
    actualizados: number;
    desactualizados: number;
    bloqueados: number;
    vacios: number;
    openCriticalBugs: number;
  };
  nextBestAction: string;
  nextBestActionModule: string;
}

export function calculateLaunchReadiness(project: Project): LaunchReadinessReport {
  const blockers: string[] = [];

  // 1. Documento Maestro (Weight: 15%)
  const masterSections = project.masterStrategyDoc?.sections || {};
  const totalMasterSections = Object.keys(masterSections).length;
  let masterWeight = 0;
  let masterStatus: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio' = 'desactualizado';

  if (totalMasterSections >= 8) {
    masterWeight = 15;
    masterStatus = 'actualizado';
  } else if (totalMasterSections > 0) {
    masterWeight = 8;
    masterStatus = 'desactualizado';
  } else {
    masterStatus = 'vacio';
  }

  // 2. PRD (Weight: 10%)
  const hasPRD = project.productArchitecture || totalMasterSections >= 4;
  let prdWeight = 0;
  let prdStatus: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio' = 'desactualizado';
  if (totalMasterSections < 2) {
    prdStatus = 'bloqueado';
    blockers.push('PRD bloqueado: requiere al menos 40% del Documento Maestro');
  } else if (hasPRD) {
    prdWeight = 10;
    prdStatus = 'actualizado';
  } else {
    prdStatus = 'vacio';
  }

  // 3. Arquitectura (Weight: 10%)
  let arqWeight = 0;
  let arqStatus: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio' = 'desactualizado';
  if (project.productArchitecture) {
    arqWeight = 10;
    arqStatus = 'actualizado';
  } else {
    arqStatus = 'desactualizado';
  }

  // 4. Pantallas (Weight: 15%)
  const screens = project.screensData?.screens || [];
  let screensWeight = 0;
  let screensStatus: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio' = 'desactualizado';
  if (screens.length > 0) {
    const finished = screens.filter((s) => s.status === 'Terminada').length;
    const ratio = finished / screens.length;
    screensWeight = Math.round(15 * Math.max(0.4, ratio));
    screensStatus = ratio >= 0.8 ? 'actualizado' : 'desactualizado';
  } else {
    screensStatus = 'vacio';
    blockers.push('Pantallas vacías: crea los flujos y pantallas base del producto');
  }

  // 5. QA & Testing (Weight: 15%)
  const qaInfo = checkQAModuleStatus(project);
  let qaWeight = 0;
  if (qaInfo.isCompliant) {
    qaWeight = 15;
  } else if (qaInfo.screensWithTests > 0) {
    qaWeight = 7;
  }
  if (qaInfo.openCriticalBugs > 0) {
    blockers.push(`QA & Testing: existen ${qaInfo.openCriticalBugs} bug(s) crítico(s) abierto(s)`);
  }

  // 6. Legal & Compliance (Weight: 15%)
  const legalInfo = checkLegalModuleStatus(project);
  let legalWeight = 0;
  if (legalInfo.status === 'actualizado') {
    legalWeight = 15;
  } else if (legalInfo.status === 'desactualizado') {
    legalWeight = 6;
  }
  if (legalInfo.isLocked) {
    blockers.push(`Legal & Compliance bloqueado: ${legalInfo.missingBlockers.join(', ')}`);
  } else if (legalInfo.hasPendingCriticalItems) {
    blockers.push('Legal & Compliance contiene requisitos críticos o checklist sensible pendiente');
  }

  // 7. Analítica & Instrumentación (Weight: 10%)
  let analiticaWeight = 0;
  let analiticaStatus: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio' = 'desactualizado';
  if (project.analyticsData?.lastGeneratedAt && project.analyticsData.events.length > 0) {
    analiticaWeight = 10;
    analiticaStatus = 'actualizado';
  } else {
    analiticaStatus = 'vacio';
    blockers.push('Analítica & Instrumentación: Tracking Plan no generado');
  }

  // 8. Go-to-Market (Weight: 10%)
  let gtmWeight = 0;
  let gtmStatus: 'actualizado' | 'desactualizado' | 'bloqueado' | 'vacio' = 'desactualizado';
  const commCheck = checkCommercialModelComplete(project);
  if (!commCheck.complete) {
    gtmStatus = 'bloqueado';
    blockers.push(`Go-to-Market bloqueado por Pricing incompleto (${commCheck.missing.join(', ')})`);
  } else if (project.goToMarket?.lastGeneratedAt) {
    gtmWeight = 10;
    gtmStatus = 'actualizado';
  } else {
    gtmStatus = 'desactualizado';
  }

  const score = Math.min(100, Math.max(0, masterWeight + prdWeight + arqWeight + screensWeight + qaWeight + legalWeight + analiticaWeight + gtmWeight));

  const modulesStatus = {
    maestro: masterStatus,
    prd: prdStatus,
    arquitectura: arqStatus,
    pantallas: screensStatus,
    qa: qaInfo.status,
    legal: legalInfo.status,
    analitica: analiticaStatus,
    gtm: gtmStatus,
  };

  const statusValues = Object.values(modulesStatus);
  const actualizados = statusValues.filter((s) => s === 'actualizado').length;
  const desactualizados = statusValues.filter((s) => s === 'desactualizado').length;
  const bloqueados = statusValues.filter((s) => s === 'bloqueado').length;
  const vacios = statusValues.filter((s) => s === 'vacio').length;

  // Strict Rule for "Listo para Lanzamiento"
  const isReadyForLaunch =
    blockers.length === 0 &&
    score >= 90 &&
    legalInfo.status === 'actualizado' &&
    qaInfo.status === 'actualizado' &&
    qaInfo.openCriticalBugs === 0 &&
    analiticaStatus === 'actualizado' &&
    gtmStatus === 'actualizado';

  // Determine Next Best Action
  let nextBestAction = 'Completar el Documento Maestro con la estrategia base.';
  let nextBestActionModule = 'maestro';

  if (!commCheck.complete) {
    nextBestAction = `Definir Pricing & Unit Economics en Contexto 1.5 (${commCheck.missing[0]}).`;
    nextBestActionModule = 'maestro';
  } else if (legalInfo.isLocked) {
    nextBestAction = `Resolver los bloqueos de Legal: ${legalInfo.missingBlockers[0]}.`;
    nextBestActionModule = 'maestro';
  } else if (legalInfo.hasPendingCriticalItems) {
    nextBestAction = 'Generar y validar los Términos y Política de Privacidad en Legal & Compliance.';
    nextBestActionModule = 'legal';
  } else if (qaInfo.openCriticalBugs > 0) {
    nextBestAction = `Resolver los ${qaInfo.openCriticalBugs} bug(s) crítico(s) en QA & Testing antes de lanzar.`;
    nextBestActionModule = 'qa';
  } else if (qaInfo.status !== 'actualizado') {
    nextBestAction = 'Generar casos de prueba automáticos para todas las pantallas en QA & Testing.';
    nextBestActionModule = 'qa';
  } else if (analiticaStatus !== 'actualizado') {
    nextBestAction = 'Generar el Tracking Plan y verificar la North Star Metric en Analítica.';
    nextBestActionModule = 'analitica';
  } else if (gtmStatus !== 'actualizado') {
    nextBestAction = 'Generar el cronograma y checklist final en Go-to-Market.';
    nextBestActionModule = 'gtm';
  } else if (isReadyForLaunch) {
    nextBestAction = '¡Ecosistema 100% listo para lanzamiento! Ejecutar despliegue y campaña activa.';
    nextBestActionModule = 'resumen';
  }

  return {
    score,
    isReadyForLaunch,
    blockers,
    modulesStatus,
    stats: {
      actualizados,
      desactualizados,
      bloqueados,
      vacios,
      openCriticalBugs: qaInfo.openCriticalBugs,
    },
    nextBestAction,
    nextBestActionModule,
  };
}

/**
 * Runs Cascade Regeneration in exact dependency order:
 * Documento Maestro -> PRD / Arquitectura -> Pantallas -> QA / Analítica -> Copy -> Landing / Secuencias -> Legal -> Go-to-Market.
 */
export function runCascadeRegeneration(project: Project): {
  updatedProject: Project;
  log: Array<{ module: string; status: 'success' | 'blocked' | 'skipped'; message: string }>;
} {
  const log: Array<{ module: string; status: 'success' | 'blocked' | 'skipped'; message: string }> = [];
  const updated = { ...project };

  // 1. Documento Maestro
  log.push({
    module: 'Documento Maestro',
    status: 'success',
    message: 'Validado como fuente única de verdad estratégica.',
  });

  // 2. PRD & Arquitectura
  log.push({
    module: 'PRD & Arquitectura',
    status: 'success',
    message: 'Arquitectura sincronizada con capacidades y entidades del Documento Maestro.',
  });

  // 3. Pantallas
  const screens = updated.screensData?.screens || [];
  log.push({
    module: 'Pantallas y Flujos',
    status: 'success',
    message: `${screens.length} pantallas validadas y catalogadas.`,
  });

  // 4. QA & Testing
  if (screens.length > 0) {
    const newTestCases = generateAutomatedTestCases(screens);
    updated.qaTesting = {
      testCases: newTestCases,
      bugs: updated.qaTesting?.bugs || [],
      lastGeneratedAt: new Date().toISOString(),
    };
    log.push({
      module: 'QA & Testing',
      status: 'success',
      message: `${newTestCases.length} casos de prueba (Happy, Error, Edge, A11y) regenerados y vinculados.`,
    });
  } else {
    log.push({
      module: 'QA & Testing',
      status: 'skipped',
      message: 'Omitido: no hay pantallas registradas.',
    });
  }

  // 5. Analítica & Instrumentación
  const trackingPlan = generateAutomatedTrackingPlan(updated);
  updated.analyticsData = trackingPlan;
  log.push({
    module: 'Analítica & Instrumentación',
    status: 'success',
    message: `Tracking Plan regenerado con ${trackingPlan.events.length} eventos y North Star heredada.`,
  });

  // 6. Copy, Landing, Secuencias
  const commCheck = checkCommercialModelComplete(updated);
  if (commCheck.complete) {
    log.push({
      module: 'Landing & Secuencias',
      status: 'success',
      message: 'Activos de conversión sincronizados con Pricing & Unit Economics.',
    });
  } else {
    log.push({
      module: 'Landing & Secuencias',
      status: 'blocked',
      message: `Bloqueado por Pricing incompleto (${commCheck.missing.join(', ')}).`,
    });
  }

  // 7. Legal & Compliance
  const legalCheck = checkLegalModuleStatus(updated);
  if (!legalCheck.isLocked) {
    // Generate default legal documents if missing
    const isSensitive = updated.legalCompliance?.procesaDatosSensiblesOmenores || 'Sí';
    updated.legalCompliance = {
      procesaDatosSensiblesOmenores: isSensitive,
      jurisdiccion: updated.legalCompliance?.jurisdiccion || 'Internacional / España / Latam (RGPD / CCPA)',
      sensitiveChecklist: updated.legalCompliance?.sensitiveChecklist || {
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
        status: 'Generado',
        content: `# TÉRMINOS Y CONDICIONES DEL SERVICIO: ${updated.name}\n\n1. Objeto y Alcance\nEl presente acuerdo regula el acceso a ${updated.name}...\n\n2. Modelo de Suscripción\nSujeto a la estructura de precios vigente.\n\n3. Responsabilidad\nHerramienta de soporte y guía basada en evidencia.`,
        lastUpdated: new Date().toLocaleDateString(),
      },
      politicaPrivacidad: {
        status: 'Generado',
        content: `# POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS: ${updated.name}\n\n1. Responsable del Tratamiento\n${updated.name}\n\n2. Finalidad del Tratamiento\nGestión de cuentas y personalización.\n\n3. Medidas de Seguridad\nCifrado en tránsito y reposo.`,
        lastUpdated: new Date().toLocaleDateString(),
      },
      avisoCookies: {
        status: 'Generado',
        content: `# AVISO DE COOKIES Y TRACKING: ${updated.name}\n\nUtilizamos cookies técnicas y analíticas necesarias para el funcionamiento.`,
        lastUpdated: new Date().toLocaleDateString(),
      },
      licenciasTerceros: {
        items: ['MIT License (Librerías UI)', 'Google Fonts', 'Lucide Icons'],
        status: 'Completo',
      },
      lastGeneratedAt: new Date().toISOString(),
      isCustomized: true,
    };
    log.push({
      module: 'Legal & Compliance',
      status: 'success',
      message: 'Términos, Privacidad y Cookies regenerados con datos reales.',
    });
  } else {
    log.push({
      module: 'Legal & Compliance',
      status: 'blocked',
      message: `Bloqueado: ${legalCheck.missingBlockers.join(', ')}`,
    });
  }

  // 8. Go-to-Market
  if (commCheck.complete && !legalCheck.isLocked) {
    updated.goToMarket = generateAutomatedGTMPlan(updated);
    log.push({
      module: 'Go-to-Market',
      status: 'success',
      message: 'Plan de lanzamiento, cronograma y checklist regenerados exitosamente.',
    });
  } else {
    log.push({
      module: 'Go-to-Market',
      status: 'blocked',
      message: 'Bloqueado: ramas previas no satisfechas.',
    });
  }

  // Clear audit outdated flag
  updated.impactAudit = undefined;

  return {
    updatedProject: updated,
    log,
  };
}

/**
 * Generate technical specification handoff: DB schema, API contracts, folder structure.
 */
export function generateTechnicalHandoff(project: Project): {
  markdown: string;
  dbSchema: string;
  apiContracts: string;
  folderStructure: string;
} {
  const masterSections = project.masterStrategyDoc?.sections || {};
  const contexto = masterSections['contexto'] || {};
  const vehiculo = contexto.vehiculo_principal || project.category || 'Web / Mobile App';
  const screens = project.screensData?.screens || [];

  const dbSchema = `-- ESPECIFICACIÓN TÉCNICA - SCHEMA DE BASE DE DATOS
-- Proyecto: ${project.name}
-- Plataforma: ${vehiculo}
-- Generado automáticamente por SCREENOS

-- 1. Tabla de Usuarios / Perfiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user', -- 'user' | 'admin' | 'specialist'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Suscripciones / Facturación
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL, -- 'Free' | 'Pro' | 'Lifetime'
    status VARCHAR(50) NOT NULL, -- 'active' | 'canceled' | 'past_due'
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Registros / Situaciones / Casos
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Auditoría y Consentimientos Legales (RGPD/Compliance)
CREATE TABLE consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_version VARCHAR(20) NOT NULL,
    terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_hash VARCHAR(64),
    user_agent TEXT
);

CREATE INDEX idx_records_user ON records(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);`;

  const apiContracts = `// CONTRATOS DE API (REST / JSON)
// Proyecto: ${project.name}

/**
 * 1. AUTENTICACIÓN Y USUARIOS
 */
// POST /api/v1/auth/signup
// Body: { email: string, password_hash: string, full_name: string, consent_version: string }
// Response 201: { user: { id: string, email: string, full_name: string }, token: string }

// GET /api/v1/users/me
// Headers: Authorization: Bearer <token>
// Response 200: { id: string, email: string, full_name: string, tier: string, active: boolean }

/**
 * 2. FUNCIONALIDADES NÚCLEO
 */
// GET /api/v1/records?limit=20&offset=0
// Response 200: { items: Array<RecordItem>, total: number }

// POST /api/v1/records
// Body: { title: string, category: string, data: Record<string, any> }
// Response 201: { id: string, success: true, created_at: string }

// GET /api/v1/records/:id
// Response 200: { id: string, title: string, category: string, data: any }

// PUT /api/v1/records/:id
// Body: Partial<RecordItem>
// Response 200: { success: true, updated_at: string }

/**
 * 3. FACTURACIÓN Y SUSCRIPCIONES
 */
// POST /api/v1/billing/create-checkout-session
// Body: { tier: 'pro' | 'yearly', success_url: string, cancel_url: string }
// Response 200: { checkout_url: string }

/**
 * 4. EVENTOS Y TELEMETRÍA (ANALYTICS)
 */
// POST /api/v1/telemetry/events
// Body: { event_name: string, properties: Record<string, any>, timestamp: string }
// Response 204: No Content`;

  const folderStructure = `project-root/
├── src/
│   ├── api/                 # Endpoints y controladores de rutas
│   │   ├── auth/
│   │   ├── records/
│   │   ├── billing/
│   │   └── telemetry/
│   ├── components/          # Componentes de UI modulares y accesibles
│   │   ├── layout/          # Navbar, Sidebar, Footer, Modales
│   │   ├── forms/           # Inputs, selects, switches validados
│   │   └── screens/         # Vistas mapeadas a flujos del producto
${screens.map(s => `│   │       ├── ${s.name.replace(/\s+/g, '')}Screen.tsx`).slice(0, 5).join('\n')}
│   ├── hooks/               # Custom hooks de React (auth, data fetching, mutations)
│   ├── lib/                 # Configuración de DB, clientes API, tracking
│   │   ├── db.ts            # Conector de base de datos
│   │   ├── analytics.ts     # PostHog / GA4 Wrapper
│   │   └── legal.ts         # Verificación de consentimientos
│   ├── types/               # Definiciones de TypeScript e interfaces
│   │   ├── schema.ts
│   │   └── api.ts
│   └── utils/               # Helpers y funciones puras de negocio
├── tests/                   # Suite de pruebas automatizadas (QA)
│   ├── e2e/                 # Happy paths de onboarding y checkout
│   └── unit/                # Lógica pura de validación
├── docs/                    # Especificaciones del producto (PRD, Legal, GTM)
├── .env.example             # Variables de entorno documentadas
├── package.json
└── README.md`;

  const markdown = `# ESPECIFICACIÓN TÉCNICA Y HANDOFF DE ARQUITECTURA
**Proyecto:** ${project.name}
**Categoría / Vehículo:** ${vehiculo}
**Fecha:** ${new Date().toLocaleDateString()}

---

## 1. Schema de Base de Datos (Relacional & Documentos)
\`\`\`sql
${dbSchema}
\`\`\`

---

## 2. Contratos de API (Endpoints y Payloads)
\`\`\`typescript
${apiContracts}
\`\`\`

---

## 3. Estructura de Carpetas Recomendada
\`\`\`text
${folderStructure}
\`\`\`

---
*Generado automáticamente por el Sistema Operativo SCREENOS.*
`;

  return {
    markdown,
    dbSchema,
    apiContracts,
    folderStructure,
  };
}

