export interface DocumentChapter {
  id: string;
  title: string;
  summary: string;
  content: string;
}

export interface ExampleAuthorGroup {
  author: string; // e.g. "Todd Brown", "Alex Hormozi", "Russell Brunson", "Ejemplos generales"
  items: string[];
}

export interface ExtractedConceptItem {
  id: string;
  title: string;
  question?: string; // e.g. "¿Cómo le llamo a esto mientras lo construyo?"
  sectionTag?: string; // e.g. "1.1 IDENTIFICACIÓN", "12.6 REGLAS POR CANAL"
  definition: string;
  typicalOptions?: string; // e.g. "idea → validación → construcción → lanzado → escalando"
  examplesByAuthor?: ExampleAuthorGroup[];
  generalExamples?: string[];
  rawBlockText?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface AttachedDocument {
  id: string;
  name: string;
  size: string;
  rawBytes: number;
  uploadDate: string;
  fileType: string;
  extension: string;
  status: 'Completado' | 'Procesando' | 'Error';
  progress?: number; // 0 to 100 percentage
  content?: string;
  dataUrl?: string;
  chapters: DocumentChapter[];
  glossary: GlossaryTerm[];
  concepts?: ExtractedConceptItem[];
}

export interface MasterDocument {
  name: string;
  size: string;
  uploadDate: string;
  fileType: string;
  content: string;
  status: 'active' | 'draft' | 'processing';
  sectionsCount: number;
  wordCount: number;
}

export type BusinessCategory =
  | 'Apps'
  | 'Cursos Digitales'
  | 'Servicios'
  | 'Productos Físicos';

export interface PromptItem {
  id: string;
  name: string;
  step: string;
  aiType: 'GPT' | 'Gemini' | 'Claude' | 'Otra IA';
  customAi?: string;
  link?: string;
  content: string;
}

export interface SocialPlatformComment {
  id: string;
  name: string;
  comments: string;
  links: string[];
}

export interface SocialCommentsData {
  platforms: {
    youtube: SocialPlatformComment;
    facebook: SocialPlatformComment;
    instagram: SocialPlatformComment;
    tiktok: SocialPlatformComment;
    linkedin: SocialPlatformComment;
    other: SocialPlatformComment;
    web: SocialPlatformComment;
  };
  lastSaved?: string;
}

export type GroundingStatus = 'manual' | 'grounded' | 'misaligned' | 'empty';

export interface FieldGroundingMeta {
  status: GroundingStatus;
  sourceConceptIds?: string[];
  sourceDocId?: string;
  sourceDocName?: string;
  evidenceSnippet?: string;
  citationChapter?: string;
  confidenceScore?: number; // 0 to 100
  lastEvaluatedAt?: string;
  misalignmentReason?: string;
  suggestedFix?: string;
  isUserVerified?: boolean;
}

export interface MasterDocSectionField {
  label: string;
  value: string;
  placeholder?: string;
  type?: 'input' | 'textarea' | 'inherited' | 'color';
  inheritedFrom?: string;
  isCustomized?: boolean;
  grounding?: FieldGroundingMeta;
}

export interface MasterDocSection {
  id: number;
  key: string;
  title: string;
  shortTitle: string;
  iconName: string;
  subsections: {
    number: string;
    title: string;
    fields: {
      key: string;
      label: string;
      value: string;
      placeholder?: string;
      type?: 'input' | 'textarea' | 'inherited' | 'color';
      inheritedFrom?: string;
      inheritedTag?: string;
      targetSectionId?: number;
      isCustomized?: boolean;
      grounding?: FieldGroundingMeta;
    }[];
  }[];
}

export interface ProjectContradictionWarning {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  fieldKey: string;
  sectionKey: string;
  fieldLabel: string;
  sectionTitle: string;
  conflictingFieldKey?: string;
  conflictingFieldLabel?: string;
  conflictingSectionTitle?: string;
  reason: string;
  suggestion: string;
  detectedAt: string;
}

export interface ProjectMasterDocData {
  lastUpdated?: string;
  sections: Record<string, any>;
  groundingMetadata?: Record<string, FieldGroundingMeta>;
  contradictions?: ProjectContradictionWarning[];
}

export interface ScreenNavigationAction {
  trigger: string;
  targetScreenId: string;
  targetScreenName?: string;
  condition?: string;
}

export interface ScreenNode {
  id: string;
  name: string;
  flowId: string;
  type: 'Splash' | 'Onboarding' | 'Auth' | 'Dashboard' | 'Formulario' | 'Detalle' | 'Modal' | 'Checkout' | 'Configuración' | 'Otro';
  status: 'Terminada' | 'En desarrollo' | 'Pendiente';
  route: string;
  purpose: string;
  keyElements: string[];
  navigationActions: ScreenNavigationAction[];
  dataConsumed?: string[];
  dataProduced?: string[];
  notes?: string;
}

export interface FlowItem {
  id: string;
  name: string;
  description: string;
  color: string;
  screenIds: string[];
}

export interface ProjectScreensData {
  flows: FlowItem[];
  screens: ScreenNode[];
  selectedFlowId?: string;
  lastSaved?: string;
}

export type ContextSourceStatus = 'available' | 'partial' | 'empty' | 'unavailable' | 'outdated';

export type AgentUserIntent = 'DELIVERABLE' | 'ANALYSIS' | 'HYBRID' | 'AMBIGUOUS' | 'INSUFFICIENT_CONTEXT';

export interface ContextUsedReference {
  module: string; // e.g. "Documento Maestro", "Marca", "Landing", "Pantallas", "Comentarios"
  sectionKey?: string;
  sectionLabel: string;
  fieldKey?: string;
  fieldLabel: string;
  value: string;
  status: ContextSourceStatus;
  relevanceScore?: number;
}

export interface ProposedAction {
  id: string;
  label: string; // e.g. "Insertar en Hero de la Landing"
  targetModule: 'maestro' | 'activos' | 'pantallas' | 'arquitectura' | 'comentarios' | 'resumen' | 'prompts';
  targetSectionKey?: string;
  targetFieldKey?: string;
  currentValue?: string;
  proposedValue: string;
  diffSummary?: string;
  applied: boolean;
  appliedAt?: string;
}

export interface AgentExecutionTrace {
  executionId: string;
  agentId: string;
  agentType: 'investigacion' | 'copy' | 'prd' | 'ux' | 'arquitectura' | 'general' | 'custom';
  agentName: string;
  agentPromptVersion: string;
  userRequest: string;
  classifiedIntent?: AgentUserIntent;
  intentReasoning?: string;
  assetType?: string;
  timestamp: string;
  latencyMs: number;
  availableSources: string[];
  consultedSources: string[];
  usedSources: ContextUsedReference[];
  sourceStatuses: Record<string, ContextSourceStatus>;
  missingInfo: string[];
  contradictions: {
    sourceA: string;
    sourceB: string;
    description: string;
    impact: string;
    prioritizedSource: string;
  }[];
  assumptions: string[];
  generatedResponse: string;
  proposedAction?: ProposedAction;
  interactionStatus: 'generated' | 'accepted' | 'edited_then_accepted' | 'discarded';
  tokenBudgetUsage?: {
    promptTokens: number;
    completionTokens: number;
    contextRatio: string;
  };
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  intent?: AgentUserIntent;
  trace?: AgentExecutionTrace;
  proposedAction?: ProposedAction;
}

export interface AgentItem {
  id: string;
  name: string;
  type: 'investigacion' | 'copy' | 'prd' | 'ux' | 'arquitectura' | 'general' | 'custom';
  typeLabel: string;
  color: string;
  role: string;
  systemPrompt: string;
  connectedDocs: string[];
  temperature: number;
  promptVersion?: string;
  history?: AgentMessage[];
}

export interface ProjectAgentsData {
  agents: AgentItem[];
  selectedAgentId?: string;
  executions?: AgentExecutionTrace[];
  lastSaved?: string;
}

// 1. Legal & Compliance
export interface SensitiveDataChecklist {
  consentimientoParental: boolean;
  minimizacionDatos: boolean;
  finalidadTratamiento: boolean;
  retencionInformacion: boolean;
  eliminacionDatos: boolean;
  accesoRectificacion: boolean;
  restriccionesTerceros: boolean;
  seguridadCifrado: boolean;
  consentimientosExplicitos: boolean;
}

export interface LegalComplianceData {
  procesaDatosSensiblesOmenores: 'Sí' | 'No' | 'Por definir';
  jurisdiccion: string;
  sensitiveChecklist: SensitiveDataChecklist;
  terminosCondiciones: {
    status: 'Pendiente' | 'Generado' | 'Revisado';
    content: string;
    lastUpdated?: string;
  };
  politicaPrivacidad: {
    status: 'Pendiente' | 'Generado' | 'Revisado';
    content: string;
    lastUpdated?: string;
  };
  avisoCookies: {
    status: 'Pendiente' | 'Generado' | 'Revisado';
    content: string;
    lastUpdated?: string;
  };
  licenciasTerceros: {
    items: string[];
    status: 'Pendiente' | 'Completo';
  };
  lastGeneratedAt?: string;
  isCustomized?: boolean;
}

// 2. QA & Testing
export interface TestCaseItem {
  id: string;
  screenId: string;
  screenName: string;
  type: 'happy_path' | 'error_path' | 'edge_case' | 'accessibility';
  title: string;
  description: string;
  preconditions?: string;
  steps: string[];
  expectedResult: string;
  status: 'Pendiente' | 'En desarrollo' | 'Terminada';
  isOutdated?: boolean;
  lastUpdated?: string;
}

export interface BugItem {
  id: string;
  title: string;
  description: string;
  screenId: string;
  screenName: string;
  severity: 'Crítico' | 'Mayor' | 'Menor';
  status: 'Abierto' | 'En revisión' | 'Resuelto';
  date: string;
  assignee: string;
  evidence?: string;
  affectedVersion: string;
}

export interface QATestingData {
  testCases: TestCaseItem[];
  bugs: BugItem[];
  lastGeneratedAt?: string;
}

// 3. Analytics & Instrumentation
export interface AnalyticsEventItem {
  id: string;
  name: string; // e.g. "onboarding_completed"
  screenId: string;
  screenName: string;
  trigger: string;
  properties: string[]; // ["user_id", "plan", "source", "timestamp"]
  userEntity: string;
  eventGoal: string;
  funnelStage?: string;
  suggestedTool?: 'PostHog' | 'Mixpanel' | 'GA4' | 'Amplitude';
}

export interface AnalyticsFunnelItem {
  id: string;
  name: string;
  steps: string[];
}

export interface AnalyticsTrackingPlanData {
  northStarMetric: string; // Inherited from Contexto 1.2 "metrica_exito"
  events: AnalyticsEventItem[];
  funnels: AnalyticsFunnelItem[];
  lastGeneratedAt?: string;
  isCustomized?: boolean;
}

// 4. Go-To-Market
export interface GTMMilestoneItem {
  id: string;
  phase: 'Pre-lanzamiento' | 'Día de Lanzamiento (D-Day)' | 'Post-lanzamiento';
  title: string;
  duration: string;
  milestones: string[];
  responsible: string;
  risks: string;
}

export interface GTMChannelItem {
  id: string;
  channel: string;
  strategy: string;
  priority: 'Alta' | 'Media' | 'Baja';
  targetMetric: string;
}

export interface GTMStoreListing {
  appName: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  keywords: string[];
  screenshotPlan: string[];
}

export interface GTMLaunchChecklist {
  legalListo: boolean;
  qaListo: boolean;
  analiticaInstrumentada: boolean;
  landingPublicada: boolean;
  secuenciasActivas: boolean;
  pricingValidado: boolean;
  canalesDefinidos: boolean;
  activosCriticosActualizados: boolean;
}

export interface GoToMarketData {
  launchChecklist: GTMLaunchChecklist;
  timeline: GTMMilestoneItem[];
  acquisitionChannels: GTMChannelItem[];
  storeListingCopy?: GTMStoreListing;
  generatedPlan?: string;
  lastGeneratedAt?: string;
}

// Audit & Downstream Impact
export interface MasterDocAuditImpact {
  lastChangedFieldKey?: string;
  lastChangedFieldLabel?: string;
  changedAt?: string;
  affectedModules: string[];
  affectedAssets: string[];
  reason: string;
}

export interface Project {
  id: string;
  name: string;
  category: BusinessCategory;
  idea?: string;
  description: string;
  targetPlatforms: string[];
  prompts?: PromptItem[];
  socialComments?: SocialCommentsData;
  masterStrategyDoc?: ProjectMasterDocData;
  productArchitecture?: any;
  screensData?: ProjectScreensData;
  agentsData?: ProjectAgentsData;
  legalCompliance?: LegalComplianceData;
  qaTesting?: QATestingData;
  analyticsData?: AnalyticsTrackingPlanData;
  goToMarket?: GoToMarketData;
  impactAudit?: MasterDocAuditImpact;
  screensOutputType?: 'functional_doc_only' | 'doc_design_export' | 'doc_code_export' | 'future_planned';
  createdAt?: string;
  updatedAt?: string;
}


