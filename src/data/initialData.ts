import { MasterDocument, Project, AttachedDocument } from '../types';
import { MASTER_EXTRACTED_CONCEPTS } from '../utils/conceptExtractor';

export const initialAttachedDocuments: AttachedDocument[] = [
  {
    id: 'doc-maestro-1',
    name: 'Documento_Maestro_Conceptual_comprimido (1).pdf',
    size: '388.5 KB',
    rawBytes: 397824,
    uploadDate: '03 Aug 2026',
    fileType: 'application/pdf',
    extension: 'PDF',
    status: 'Completado',
    progress: 100,
    concepts: MASTER_EXTRACTED_CONCEPTS,
    chapters: [
      {
        id: 'ch-1',
        title: 'Capítulo 1: Contexto del Proyecto e Identificación (1.1 - 1.3)',
        summary: 'Definición del nombre de trabajo, nombre provisional, etapa de desarrollo y alcance operativo.',
        content: '1.1 IDENTIFICACIÓN\n- Nombre del proyecto: Identificador interno ("Proyecto TEA", "Iniciativa Vacío", "Grand Slam App").\n- Nombre provisional del producto: ("GuíaTEA", "Decodifica", "Rodilla Libre", "TEA Secrets").\n- Etapa del proyecto: Idea, Validación, Construcción, Lanzamiento o Escalado (Todd Brown / Hormozi / Brunson).'
      },
      {
        id: 'ch-2',
        title: 'Capítulo 2: Mercado y Oportunidad Estratégica (2.1 - 2.4)',
        summary: 'Nivel de sofisticación de mercado, estado de conciencia y mapa competitivo.',
        content: '2. MERCADO Y CONTEXTO COMPETITIVO\n- Sofisticación de mercado (Nivel 1 al 5 de Schwartz / Todd Brown).\n- Estado de conciencia (Inconsciente -> Consciente de problema -> Solución -> Producto -> Muy consciente).\n- Mapa de competidores directos e indirectos.'
      },
      {
        id: 'ch-3',
        title: 'Capítulo 3: Audiencia y Segmentación de Precisión (3.1 - 3.3)',
        summary: 'Segmentos prioritarios, criterios de inclusión y perfil psicográfico.',
        content: '3. AUDIENCIA Y SEGMENTOS\n- Segmento primario: Perfil del cliente ideal con mayor urgencia.\n- Criterios de inclusión y exclusión.\n- Datos demográficos y psicográficos.'
      },
      {
        id: 'ch-4',
        title: 'Capítulo 4: Avatar y Dolores Profundos (4.1 - 4.4)',
        summary: 'Dolor primario, frustraciones diarias, miedos ocultos y deseos no confesados.',
        content: '4. AVATAR Y DOLORES PROFUNDOS\n- Dolor primario: Síntoma agudo principal.\n- Frustraciones cotidianas y micro-obstáculos.\n- Miedos y objeciones ocultas.\n- Deseos no confesados y estatus anhelado.'
      },
      {
        id: 'ch-5',
        title: 'Capítulo 5: Causa Raíz y Enemigo Común (5.1 - 5.3)',
        summary: 'El verdadero origen del problema, desculpabilización del avatar y enemigo común.',
        content: '5. CAUSA RAÍZ Y ENEMIGO COMÚN\n- La causa real del fracaso de soluciones previas.\n- El enemigo común (Mito / Sistema / Industria).\n- Justificación lógica para adoptar el nuevo mecanismo.'
      },
      {
        id: 'ch-6',
        title: 'Capítulo 6: El Mecanismo Único (6.1 - 6.3)',
        summary: 'Mecanismo del problema vs. Mecanismo de la solución y analogía diferenciadora.',
        content: '6. EL MECANISMO ÚNICO (E.C.P. / TODD BROWN)\n- Mecanismo del problema: Razón técnica de permanencia del dolor.\n- Mecanismo de la solución: Método que asegura el resultado.\n- Nombre y analogía memorable del mecanismo.'
      },
      {
        id: 'ch-7',
        title: 'Capítulo 7: La Transformación y Gran Promesa (7.1 - 7.3)',
        summary: 'Estado actual vs. Estado deseado, la Big Promise y resultados verificables.',
        content: '7. LA TRANSFORMACIÓN\n- Estado anterior vs. Estado posterior.\n- The Big Promise: Declaración audaz de resultado definitivo.\n- Plazos y métricas de logro.'
      },
      {
        id: 'ch-8',
        title: 'Capítulo 8: Posicionamiento y Categoría Propia (8.1 - 8.3)',
        summary: 'Creación de nueva categoría, propuesta de valor única y contra-posicionamiento.',
        content: '8. POSICIONAMIENTO Y CATEGORÍA\n- Creación de nueva categoría.\n- Propuesta Única de Valor (UVP).\n- Ángulos de contra-posicionamiento.'
      },
      {
        id: 'ch-9',
        title: 'Capítulo 9: Arquitectura de Producto y Pantallas (9.1 - 9.3)',
        summary: 'Módulos centrales, experiencia de usuario y flujos clave de interacción.',
        content: '9. PRODUCTO Y ARQUITECTURA FUNCIONAL\n- Módulos del sistema y entregables de valor.\n- Mapa de pantallas y flujos principales.\n- Reducción de fricción cognitiva.'
      },
      {
        id: 'ch-10',
        title: 'Capítulo 10: La Oferta Irresistible / Grand Slam Offer (10.1 - 10.4)',
        summary: 'Stack de valor, bonos estratégicos, inversión, urgencia y garantías incondicionales.',
        content: '10. OFERTA IRRESISTIBLE ($100M OFFERS - ALEX HORMOZI)\n- Value Equation: Maximizar Dream Outcome / minimizar Time & Effort.\n- Stack de valor y bonos.\n- Garantía incondicional/condicional y urgencia.'
      },
      {
        id: 'ch-11',
        title: 'Capítulo 11: Evidencia y Proof Stack (11.1 - 11.3)',
        summary: 'Demostración lógica, casos de éxito, datos duros y validación empírica.',
        content: '11. EVIDENCIA Y PRUEBA LÓGICA (PROOF STACK)\n- Casos de estudio y testimonios.\n- Demostración paso a paso del mecanismo.\n- Respaldo empírico y estadísticas.'
      },
      {
        id: 'ch-12',
        title: 'Capítulo 12: Comunicación, Big Idea y Reglas por Canal (12.1 - 12.6)',
        summary: 'The Big Idea, tono de marca, titulares, Friction Ladder y reglas por canal (Instagram, Email, Landing, Ads).',
        content: '12. COMUNICACIÓN Y MENSAJES DE VENTA\n- The Big Idea (Todd Brown).\n- Friction Ladder: Mínima -> Media -> Alta.\n- 12.6 REGLAS POR CANAL (Instagram, Email, Landing, LinkedIn, Ads).'
      },
      {
        id: 'ch-13',
        title: 'Capítulo 13: Glosario Maestro y Nomenclatura del Negocio (12.7)',
        summary: 'Diccionario de términos propietarios, mecanismos y conceptos clave del proyecto.',
        content: '12.7 GLOSARIO MAESTRO\nDefinición de toda la terminología propietaria, acrónimos y nombres de mecanismos del negocio.'
      }
    ],
    glossary: [
      { term: 'Documento Maestro Conceptual', definition: 'Fuente única de verdad de 121 páginas que define identidad, mecanismo, avatar, oferta, arquitectura y reglas.' },
      { term: 'Mecanismo Único', definition: 'La causa técnica o metodológica que produce la transformación prometida de forma predecible.' },
      { term: 'Big Idea (Todd Brown)', definition: 'Concepto unificador provocador que reposiciona el mecanismo como la única solución lógica.' },
      { term: 'Grand Slam Offer (Hormozi)', definition: 'Oferta irresistible donde el valor percibido supera con creces el precio y elimina el riesgo.' },
      { term: 'Friction Ladder (12.5)', definition: 'Escalera de fricción progresiva para captura de leads y conversión: Mínima, Media y Alta.' },
      { term: 'Reglas por Canal (12.6)', definition: 'Normas de formato, tono, longitud y claims permitidos para Instagram, Email, Landing y Ads.' }
    ],
    content: `# DOCUMENTO MAESTRO CONCEPTUAL (121 PÁGINAS)\n\nDefinición y justificación estratégica de cada concepto del Documento Maestro — la fuente única de verdad para construir cualquier producto digital.\n\n1. CONTEXTO DEL PROYECTO\n1.1 IDENTIFICACIÓN\n1.2 PROBLEMA GENERAL\n1.3 ALCANCE\n...\n12.6 REGLAS POR CANAL\n12.7 GLOSARIO`
  }
];

export const initialMasterDocument: MasterDocument = {
  name: 'Definicion_Estrategica_Maestra_v2.pdf',
  size: '2.4 MB',
  uploadDate: '15 Ago 2026',
  fileType: 'application/pdf',
  status: 'active',
  sectionsCount: 14,
  wordCount: 12450,
  content: `# DOCUMENTO MAESTRO DE CONOCIMIENTO (MASTER SPEC)

## 1. Visión y Propósito
El documento maestro compila todas las directrices, arquitecturas comerciales, modelo de negocio Canvas, matrices de costes y flujos de valor requeridos para orquestar y desplegar unidades de negocio de alto impacto.

## 2. Definiciones Clave
- **Propuesta de Valor**: Creación de sistemas escalables y optimizados.
- **Segmentos de Cliente**: B2B corporativo, scale-ups y consumidores finales según el tipo de proyecto.
- **Canales de Distribución**: Omnicanalidad, APIs directas y puntos de contacto automatizados.
- **Estructura de Costes**: Costes fijos operativos, infraestructura cloud y CAC optimizado.

## 3. Reglas de Validación
1. Todo nuevo proyecto debe sincronizarse con los parámetros definidos en este Documento Maestro.
2. Los modelos de precios y proyecciones deben adherirse a las tablas de conversión vigentes.
3. Se auditarán las metas operativas trimestralmente.`,
};

export const initialProjects: Project[] = [
  {
    id: 'proj-tea-1',
    name: 'App TEA',
    category: 'Apps',
    description: 'Padre, madre o cuidador de un niño con diagnóstico de TEA que necesita entender mejor qué puede estar comunicando su conducta y saber cómo responder de forma práctica y personalizada en situaciones cotidianas difíciles',
    targetPlatforms: ['Base44'],
    createdAt: '15 Ago 2026',
    updatedAt: '15 Ago 2026',
  }
];

