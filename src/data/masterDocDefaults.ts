import { Project } from '../types';

export interface MasterDocSectionDef {
  id: number;
  key: string;
  title: string;
  shortTitle: string;
  iconName: 'file-text' | 'bar-chart' | 'users' | 'zap' | 'layers' | 'sparkles' | 'target' | 'box' | 'shopping-cart' | 'star' | 'palette' | 'message-circle';
  subsections: {
    number: string;
    title: string;
    fields: {
      key: string;
      label: string;
      placeholder?: string;
      type: 'input' | 'textarea' | 'inherited' | 'color';
      defaultValue?: string;
      inheritedFrom?: string;
      inheritedTag?: string;
      targetSectionId?: number;
    }[];
  }[];
}

export const MASTER_DOC_SECTIONS: MasterDocSectionDef[] = [
  {
    id: 1,
    key: 'contexto',
    title: '1. Contexto',
    shortTitle: 'Contexto',
    iconName: 'file-text',
    subsections: [
      {
        number: '1.1',
        title: 'IDENTIFICACIÓN',
        fields: [
          {
            key: 'nombre_proyecto',
            label: 'NOMBRE DEL PROYECTO',
            placeholder: '¿Cuál es el nombre oficial del proyecto?',
            type: 'input',
          },
          {
            key: 'nombre_provisional',
            label: 'NOMBRE PROVISIONAL DEL PRODUCTO',
            placeholder: '¿Qué nombre de trabajo usarás?',
            type: 'input',
          },
          {
            key: 'etapa_proyecto',
            label: 'ETAPA DEL PROYECTO',
            placeholder: 'Idea / validación / construcción / lanzado',
            type: 'input',
          },
          {
            key: 'estado_validacion',
            label: 'ESTADO DE VALIDACIÓN',
            placeholder: '¿Qué evidencia real tienes hoy?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '1.2',
        title: 'OBJETIVOS',
        fields: [
          {
            key: 'objetivo_negocio',
            label: 'OBJETIVO PRINCIPAL DEL NEGOCIO',
            placeholder: '¿Qué resultado de negocio buscas?',
            type: 'textarea',
          },
          {
            key: 'objetivo_usuario',
            label: 'OBJETIVO PRINCIPAL DEL USUARIO',
            placeholder: '¿Qué quiere lograr el usuario?',
            type: 'textarea',
          },
          {
            key: 'resultado_principal',
            label: 'RESULTADO PRINCIPAL QUE DEBE PRODUCIR EL PRODUCTO',
            type: 'inherited',
            inheritedFrom: 'Posicionamiento',
          },
          {
            key: 'metrica_exito',
            label: 'MÉTRICA PRINCIPAL DE ÉXITO',
            placeholder: '¿Qué número te dirá que esto está funcionando?',
            type: 'input',
          },
        ],
      },
      {
        number: '1.3',
        title: 'ALCANCE',
        fields: [
          {
            key: 'incluido',
            label: 'INCLUIDO',
            placeholder: '¿Qué sí construye/resuelve esta versión?',
            type: 'textarea',
          },
          {
            key: 'excluido',
            label: 'EXCLUIDO',
            placeholder: '¿Qué queda explícitamente fuera?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '1.4',
        title: 'VEHÍCULO DE ENTREGA',
        fields: [
          {
            key: 'vehiculo_principal',
            label: 'VEHÍCULO PRINCIPAL',
            placeholder: 'App, SaaS, curso, membresía, ebook, consult',
            type: 'input',
            defaultValue: 'App, SaaS, curso, membresía, ebook, consult',
          },
          {
            key: 'vehiculos_complementarios',
            label: 'VEHÍCULOS COMPLEMENTARIOS',
            placeholder: '¿Hay otro formato que acompañe al principal?',
            type: 'input',
          },
          {
            key: 'canal_acceso',
            label: 'CANAL DE ACCESO',
            placeholder: 'Store, web, email, WhatsApp...',
            type: 'input',
          },
        ],
      },
      {
        number: '1.5',
        title: 'PRICING & UNIT ECONOMICS',
        fields: [
          {
            key: 'tipo_monetizacion',
            label: 'TIPO DE MONETIZACIÓN',
            placeholder: 'Pago único, suscripción recurrente, freemium, pago por uso...',
            type: 'input',
            defaultValue: 'Suscripción SaaS freemium con planes mensuales y anuales',
          },
          {
            key: 'estructura_precios',
            label: 'ESTRUCTURA DE PRECIOS',
            placeholder: '¿Cómo se estructura el cobro? (Planes, add-ons, comisiones...)',
            type: 'textarea',
            defaultValue: 'Plan Gratuito (básico) + Plan Pro mensual/anual + Plan Familiar Premium',
          },
          {
            key: 'tiers_precios',
            label: 'TIERS Y PRECIO POR TIER',
            placeholder: 'Free: $0 | Pro: $19/mes ($190/año) | Premium: $39/mes',
            type: 'textarea',
            defaultValue: 'Free: $0/mes | Pro: $19/mes ($190/año) | Familiar: $39/mes',
          },
          {
            key: 'periodicidad_cobro',
            label: 'PERIODICIDAD DE COBRO',
            placeholder: 'Mensual / Anual / Pago único / Por consumo',
            type: 'input',
            defaultValue: 'Mensual y Anual con 2 meses de descuento',
          },
          {
            key: 'cac_estimado',
            label: 'CAC ESTIMADO (COSTO DE ADQUISICIÓN)',
            placeholder: '¿Cuánto cuesta adquirir un cliente de pago? (ej. $25 USD)',
            type: 'input',
            defaultValue: '$25 USD',
          },
          {
            key: 'ltv_estimado',
            label: 'LTV ESTIMADO (LIFETIME VALUE)',
            placeholder: '¿Cuánto valor genera un cliente en su ciclo de vida? (ej. $180 USD)',
            type: 'input',
            defaultValue: '$180 USD (retención media 9.5 meses)',
          },
          {
            key: 'margen_objetivo',
            label: 'MARGEN BRUTO OBJETIVO (%)',
            placeholder: '¿Qué margen porcentual buscas? (ej. 75% - 85%)',
            type: 'input',
            defaultValue: '80%',
          },
          {
            key: 'costes_variables',
            label: 'COSTES VARIABLES RELEVANTES',
            placeholder: 'Servidores cloud, tokens de IA/LLM, pasarela de pago (Stripe 2.9%+$0.30), soporte',
            type: 'textarea',
            defaultValue: 'Pasarela Stripe (2.9% + $0.30), infraestructura backend cloud ($0.50/usuario activo/mes), consumo de tokens IA',
          },
          {
            key: 'hipotesis_monetizacion',
            label: 'HIPÓTESIS DE MONETIZACIÓN',
            placeholder: '¿Qué supuesto clave valida la disposición a pagar?',
            type: 'textarea',
            defaultValue: 'Las familias y cuidadores pagarán $19/mes por reducir la incertidumbre en momentos críticos con planes de acción inmediatos.',
          },
          {
            key: 'criterios_upsell',
            label: 'CRITERIOS PARA UPSELL / CROSS-SELL',
            placeholder: '¿En qué momento o evento se ofrece el upgrade?',
            type: 'textarea',
            defaultValue: 'Disparo al superar 3 reportes personalizados en el mes o al requerir sincronización multi-cuidador.',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    key: 'mercado',
    title: '2. Mercado',
    shortTitle: 'Mercado',
    iconName: 'bar-chart',
    subsections: [
      {
        number: '2.1',
        title: 'CATEGORÍA',
        fields: [
          {
            key: 'mercado_industria',
            label: 'MERCADO',
            placeholder: '¿En qué industria compites?',
            type: 'input',
          },
          {
            key: 'nicho',
            label: 'NICHO',
            placeholder: '¿Qué segmento específico atacas?',
            type: 'input',
          },
          {
            key: 'subnicho',
            label: 'SUBNICHO',
            placeholder: 'Padre, madre o cuidador de un niño con diagnóstico...',
            defaultValue: 'Padre, madre o cuidador de un niño con diagr',
            type: 'input',
          },
          {
            key: 'categoria_actual',
            label: 'CATEGORÍA ACTUAL',
            placeholder: '¿Cómo te ubicarían hoy?',
            type: 'input',
          },
          {
            key: 'categoria_deseada',
            label: 'CATEGORÍA DESEADA',
            placeholder: '¿Cómo quieres que te ubiquen?',
            type: 'input',
          },
        ],
      },
      {
        number: '2.2',
        title: 'MADUREZ DEL MERCADO',
        fields: [
          {
            key: 'nivel_consciencia',
            label: 'NIVEL DE CONSCIENCIA',
            placeholder: '¿Qué tan consciente está el prospecto?',
            type: 'textarea',
          },
          {
            key: 'nivel_sofisticacion',
            label: 'NIVEL DE SOFISTICACIÓN',
            placeholder: '¿Cuántas promesas similares ya vio?',
            type: 'textarea',
          },
          {
            key: 'promesas_dominantes',
            label: 'PROMESAS DOMINANTES',
            placeholder: '¿Qué prometen TODOS los competidores?',
            type: 'textarea',
          },
          {
            key: 'nivel_escepticismo',
            label: 'NIVEL DE ESCEPTICISMO',
            placeholder: '¿Qué tan dispuesto está a creer?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '2.3',
        title: 'ALTERNATIVAS',
        fields: [
          {
            key: 'soluciones_directas',
            label: 'SOLUCIONES DIRECTAS',
            placeholder: '¿Quién resuelve exactamente lo mismo?',
            type: 'textarea',
          },
          {
            key: 'soluciones_indirectas',
            label: 'SOLUCIONES INDIRECTAS',
            placeholder: '¿Qué resuelve el mismo problema de otra forma?',
            type: 'textarea',
          },
          {
            key: 'solucion_manual_inaccion',
            label: 'SOLUCIÓN MANUAL / NO HACER NADA',
            placeholder: '¿Qué hace hoy si no compra nada?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '2.4',
        title: 'COMPETIDORES',
        fields: [
          {
            key: 'analisis_competidores',
            label: 'ANÁLISIS DE COMPETIDORES',
            placeholder: 'Nombre, promesa, precio, mecanismo, fortaleza/debilidad, brecha.\n\nEj:\n1. Competidor A → Promete X → $Y → Mecanismo Z → Brecha: C',
            type: 'textarea',
          },
        ],
      },
      {
        number: '2.5',
        title: 'MECANISMOS EXISTENTES',
        fields: [
          {
            key: 'mecanismos_mercado',
            label: 'MECANISMOS DEL MERCADO',
            placeholder: 'Nombre, cómo funciona, nivel de comoditización...',
            type: 'textarea',
          },
        ],
      },
      {
        number: '2.6',
        title: 'OPORTUNIDADES DE MERCADO',
        fields: [
          {
            key: 'problemas_no_resueltos',
            label: 'PROBLEMAS NO RESUELTOS',
            placeholder: '¿Qué sigue sin solución satisfactoria?',
            type: 'textarea',
          },
          {
            key: 'segmentos_desatendidos',
            label: 'SEGMENTOS DESATENDIDOS',
            placeholder: '¿A quién nadie le habla directamente?',
            type: 'textarea',
          },
          {
            key: 'brechas_confianza_experiencia',
            label: 'BRECHAS DE CONFIANZA / EXPERIENCIA / ENTREGA',
            placeholder: '¿Dónde decepciona la competencia?',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    key: 'audiencias',
    title: '3. Audiencias',
    shortTitle: 'Audiencias',
    iconName: 'users',
    subsections: [
      {
        number: '3.1',
        title: 'AVATAR',
        fields: [
          {
            key: 'resumen_avatar',
            label: 'RESUMEN DEL AVATAR',
            placeholder: 'Describe en un párrafo a la persona ideal a la que sirve este producto. Es el punto de partida de toda la estrategia.',
            type: 'textarea',
          },
          {
            key: 'nombre_referencial',
            label: 'NOMBRE REFERENCIAL',
            placeholder: 'Ej. Ana, 38, diseñadora freelance',
            type: 'input',
          },
          {
            key: 'rol_contexto',
            label: 'ROL Y CONTEXTO',
            placeholder: '¿Qué hace y en qué contextos se mueve?',
            type: 'textarea',
          },
          {
            key: 'demografia_relevante',
            label: 'DEMOGRAFÍA RELEVANTE',
            placeholder: 'Edad, ubicación, situación personal...',
            type: 'input',
          },
          {
            key: 'situacion_actual_avatar',
            label: 'SITUACIÓN ACTUAL',
            placeholder: '¿Dónde está hoy respecto al problema?',
            type: 'textarea',
          },
          {
            key: 'metas_aspiraciones',
            label: 'METAS Y ASPIRACIONES',
            placeholder: '¿Qué quiere lograr de verdad?',
            type: 'textarea',
          },
          {
            key: 'valores_creencias',
            label: 'VALORES Y CREENCIAS CENTRALES',
            placeholder: '¿En qué cree profundamente?',
            type: 'textarea',
          },
          {
            key: 'comportamientos_habitos',
            label: 'COMPORTAMIENTOS Y HÁBITOS',
            placeholder: '¿Qué hace de forma recurrente?',
            type: 'textarea',
          },
          {
            key: 'fuentes_informacion',
            label: 'FUENTES DE INFORMACIÓN',
            placeholder: '¿Dónde se informa, consume y decide?',
            type: 'textarea',
          },
          {
            key: 'frustraciones_profundas',
            label: 'FRUSTRACIONES PROFUNDAS',
            placeholder: '¿Qué le frustra de verdad, más allá del problema visible?',
            type: 'textarea',
          },
          {
            key: 'por_que_no_resuelto',
            label: 'POR QUÉ NO LO HA RESUELTO',
            placeholder: '¿Qué le ha impedido resolverlo antes?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.2',
        title: 'SEGMENTOS',
        fields: [
          {
            key: 'segmento_principal',
            label: 'SEGMENTO PRINCIPAL',
            placeholder: '¿A quién le vendes primero?',
            type: 'textarea',
          },
          {
            key: 'segmentos_secundarios',
            label: 'SEGMENTOS SECUNDARIOS',
            placeholder: '¿A quién más podría servir?',
            type: 'textarea',
          },
          {
            key: 'segmentos_excluidos',
            label: 'SEGMENTOS EXCLUIDOS',
            placeholder: '¿A quién decides NO dirigirte?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.3',
        title: 'ROLES',
        fields: [
          {
            key: 'usuario_rol',
            label: 'USUARIO',
            placeholder: '¿Quién usa el producto?',
            type: 'input',
          },
          {
            key: 'comprador_rol',
            label: 'COMPRADOR',
            placeholder: '¿Quién paga?',
            type: 'input',
          },
          {
            key: 'decisor_rol',
            label: 'DECISOR',
            placeholder: '¿Quién autoriza la compra?',
            type: 'input',
          },
        ],
      },
      {
        number: '3.4',
        title: 'CONTEXTO RELEVANTE',
        fields: [
          {
            key: 'contexto_situacion_actual',
            label: 'SITUACIÓN ACTUAL',
            placeholder: '¿En qué momento de su vida está?',
            type: 'textarea',
          },
          {
            key: 'entorno',
            label: 'ENTORNO',
            placeholder: '¿En qué contexto vive/trabaja?',
            type: 'textarea',
          },
          {
            key: 'nivel_experiencia',
            label: 'NIVEL DE EXPERIENCIA',
            placeholder: '¿Qué tanto sabe del tema?',
            type: 'input',
          },
          {
            key: 'datos_demograficos_relevantes',
            label: 'DATOS DEMOGRÁFICOS RELEVANTES',
            placeholder: '¿Qué edad, rol o características importan?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.5',
        title: 'JOBS TO BE DONE',
        fields: [
          {
            key: 'job_funcional',
            label: 'JOB FUNCIONAL',
            placeholder: '¿Qué tarea necesita resolver?',
            type: 'textarea',
          },
          {
            key: 'job_emocional',
            label: 'JOB EMOCIONAL',
            placeholder: '¿Cómo quiere sentirse?',
            type: 'textarea',
          },
          {
            key: 'job_social',
            label: 'JOB SOCIAL',
            placeholder: '¿Cómo quiere que lo perciban?',
            type: 'textarea',
          },
          {
            key: 'situacion_detonante',
            label: 'SITUACIÓN DETONANTE',
            placeholder: '¿Qué evento lo empuja a buscar solución?',
            type: 'textarea',
          },
          {
            key: 'alternativa_actual',
            label: 'ALTERNATIVA ACTUAL',
            placeholder: '¿Qué usa/hace ahora?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.6',
        title: 'PROBLEMAS EXPERIMENTADOS',
        fields: [
          {
            key: 'dolor',
            label: 'DOLOR',
            placeholder: '¿Qué le duele hoy?',
            type: 'textarea',
          },
          {
            key: 'frustracion',
            label: 'FRUSTRACIÓN',
            placeholder: '¿Qué situación repetida lo desgasta?',
            type: 'textarea',
          },
          {
            key: 'situacion_concreta',
            label: 'SITUACIÓN CONCRETA',
            placeholder: '¿Describe un momento real?',
            type: 'textarea',
          },
          {
            key: 'frecuencia_intensidad',
            label: 'FRECUENCIA / INTENSIDAD',
            placeholder: '¿Con qué seguido y qué tan fuerte?',
            type: 'input',
          },
          {
            key: 'coste_no_resolverlo',
            label: 'COSTE DE NO RESOLVERLO',
            placeholder: '¿Qué pierde si sigue igual?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.7',
        title: 'MIEDOS',
        fields: [
          {
            key: 'consecuencia_temida',
            label: 'CONSECUENCIA TEMIDA',
            placeholder: '¿Qué es lo peor que teme?',
            type: 'textarea',
          },
          {
            key: 'impacto_percibido',
            label: 'IMPACTO PERCIBIDO',
            placeholder: '¿Qué tan grave cree que sería?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.8',
        title: 'CREENCIAS DEL PROSPECTO',
        fields: [
          {
            key: 'creencias_sobre_problema',
            label: 'CREENCIAS SOBRE EL PROBLEMA',
            placeholder: '¿Qué cree que está pasando?',
            type: 'textarea',
          },
          {
            key: 'creencias_limitantes',
            label: 'CREENCIAS LIMITANTES',
            placeholder: '¿Qué le impide actuar?',
            type: 'textarea',
          },
          {
            key: 'creencias_soluciones_existentes',
            label: 'CREENCIAS SOBRE SOLUCIONES EXISTENTES',
            placeholder: '¿Qué piensa de lo que ya probó?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.9',
        title: 'OBJECIONES',
        fields: [
          {
            key: 'objeciones',
            label: 'OBJECIONES',
            placeholder: '¿Qué duda lo frena? Tipo, causa, etapa de decisión.\n\nEj:\n1. Es muy caro → Dinero → Al ver el precio',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.10',
        title: 'EVENTOS DETONANTES',
        fields: [
          {
            key: 'eventos_detonantes',
            label: 'EVENTOS DETONANTES',
            placeholder: 'Evento, urgencia, acción que desencadena.\n\nEj: Perdió un cliente → Ve consecuencias → Busca en Google',
            type: 'textarea',
          },
        ],
      },
      {
        number: '3.11',
        title: 'LENGUAJE DEL MERCADO',
        fields: [
          {
            key: 'lenguaje_mercado',
            label: 'LENGUAJE DEL MERCADO',
            placeholder: 'Expresiones textuales, metáforas, preguntas frecuentes, términos rechazados...',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 4,
    key: 'causal',
    title: '4. Causal',
    shortTitle: 'Causal',
    iconName: 'zap',
    subsections: [
      {
        number: '4.1',
        title: 'PROBLEMA VISIBLE',
        fields: [
          {
            key: 'sintoma_principal',
            label: 'SÍNTOMA PRINCIPAL',
            placeholder: '¿Qué se nota desde afuera?',
            type: 'textarea',
          },
          {
            key: 'manifestaciones',
            label: 'MANIFESTACIONES',
            placeholder: '¿Cómo se ve el síntoma en la práctica?',
            type: 'textarea',
          },
          {
            key: 'consecuencias',
            label: 'CONSECUENCIAS',
            placeholder: '¿Qué provoca si sigue?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '4.2',
        title: 'DIAGNÓSTICO INCORRECTO',
        fields: [
          {
            key: 'que_cree_mercado_causa_problema',
            label: 'QUÉ CREE EL MERCADO QUE CAUSA EL PROBLEMA',
            placeholder: '¿Cuál es la explicación equivocada más común?',
            type: 'textarea',
          },
          {
            key: 'por_que_parece_razonable',
            label: 'POR QUÉ PARECE RAZONABLE',
            placeholder: '¿Por qué es fácil creerlo?',
            type: 'textarea',
          },
          {
            key: 'por_que_esta_equivocado',
            label: 'POR QUÉ ESTÁ EQUIVOCADO',
            placeholder: '¿Dónde falla esa explicación?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '4.3',
        title: 'CAUSA RAÍZ',
        fields: [
          {
            key: 'causa_principal',
            label: 'CAUSA PRINCIPAL',
            placeholder: '¿Cuál es la verdadera razón?',
            type: 'textarea',
          },
          {
            key: 'evidencia_disponible',
            label: 'EVIDENCIA DISPONIBLE',
            placeholder: '¿Qué respalda que es la causa real?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '4.4',
        title: 'MECANISMO DEL PROBLEMA',
        fields: [
          {
            key: 'como_se_origina',
            label: 'CÓMO SE ORIGINA',
            placeholder: '¿Qué lo dispara?',
            type: 'textarea',
          },
          {
            key: 'como_se_mantiene',
            label: 'CÓMO SE MANTIENE',
            placeholder: '¿Qué lo perpetúa?',
            type: 'textarea',
          },
          {
            key: 'por_que_persiste',
            label: 'POR QUÉ PERSISTE',
            placeholder: '¿Por qué no se resuelve solo?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '4.5',
        title: 'ENEMIGO ÚNICO',
        fields: [
          {
            key: 'nombre_enemigo',
            label: 'NOMBRE DEL ENEMIGO',
            placeholder: '¿Cómo le llamas a lo que está en contra del cliente?',
            type: 'input',
          },
          {
            key: 'creencia_enemigo',
            label: 'CREENCIA DEL ENEMIGO',
            placeholder: '¿Qué idea falsa mantiene atrapado al cliente?',
            type: 'textarea',
          },
          {
            key: 'por_que_coherente_causa_raiz',
            label: 'POR QUÉ ES COHERENTE CON LA CAUSA RAÍZ',
            placeholder: '¿Cómo conecta con la causa real?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '4.6',
        title: 'FALLO DE ALTERNATIVAS',
        fields: [
          {
            key: 'alternativas_donde_fallan',
            label: 'ALTERNATIVAS Y DÓNDE FALLAN',
            placeholder: '¿Qué suele probar? ¿En qué falla y por qué?\n\nEj: Cursos → Falla en implementación → Sin acompañamiento',
            type: 'textarea',
          },
        ],
      },
      {
        number: '4.7',
        title: 'NUEVA OPORTUNIDAD',
        fields: [
          {
            key: 'insight_central',
            label: 'INSIGHT CENTRAL',
            placeholder: '¿La idea que cambia cómo se ve el problema?',
            type: 'textarea',
          },
          {
            key: 'creencia_anterior_nueva_creencia',
            label: 'CREENCIA ANTERIOR → NUEVA CREENCIA',
            placeholder: '¿Qué creía antes y qué debería creer ahora?',
            type: 'textarea',
          },
          {
            key: 'implicacion_practica',
            label: 'IMPLICACIÓN PRÁCTICA',
            placeholder: 'Si acepta la nueva idea, ¿qué debería hacer distinto?',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 5,
    key: 'mecanismo',
    title: '5. Mecanismo',
    shortTitle: 'Mecanismo',
    iconName: 'layers',
    subsections: [
      {
        number: '5.1',
        title: 'DEFINICIÓN',
        fields: [
          {
            key: 'tipo_mecanismo',
            label: 'TIPO DE MECANISMO',
            placeholder: 'Método, protocolo, sistema, framework...',
            type: 'input',
          },
          {
            key: 'definicion_funcional',
            label: 'DEFINICIÓN FUNCIONAL',
            placeholder: '¿Qué es, en una frase clara?',
            type: 'textarea',
          },
          {
            key: 'problema_causal_que_resuelve',
            label: 'PROBLEMA CAUSAL QUE RESUELVE',
            placeholder: '¿Sobre cuál causa raíz actúa?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.2',
        title: 'FUNCIONAMIENTO',
        fields: [
          {
            key: 'como_funciona_por_que_funciona',
            label: 'CÓMO FUNCIONA / POR QUÉ FUNCIONA',
            placeholder: '¿Cuál es la lógica interna?',
            type: 'textarea',
          },
          {
            key: 'componentes',
            label: 'COMPONENTES',
            placeholder: '¿De qué partes se compone?',
            type: 'textarea',
          },
          {
            key: 'secuencia_y_razon',
            label: 'SECUENCIA Y RAZÓN',
            placeholder: '¿En qué orden y por qué ese orden?',
            type: 'textarea',
          },
          {
            key: 'condiciones_necesarias',
            label: 'CONDICIONES NECESARIAS',
            placeholder: '¿Qué debe existir para que funcione?',
            type: 'textarea',
          },
          {
            key: 'limitaciones',
            label: 'LIMITACIONES',
            placeholder: '¿Dónde no aplica?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.3',
        title: 'ONE BELIEF',
        fields: [
          {
            key: 'unica_creencia_hace_compra_logica',
            label: 'LA ÚNICA CREENCIA QUE HACE LA COMPRA LÓGICA',
            placeholder: 'Si aceptara UNA idea, ¿cuál haría que comprar tenga sentido?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.4',
        title: 'NUEVAS CREENCIAS',
        fields: [
          {
            key: 'reinterpretar_problema',
            label: 'REINTERPRETAR EL PROBLEMA',
            placeholder: '¿Qué debe entender distinto?',
            type: 'textarea',
          },
          {
            key: 'abandonar_falsas_soluciones',
            label: 'ABANDONAR FALSAS SOLUCIONES',
            placeholder: '¿Qué debe dejar de creer?',
            type: 'textarea',
          },
          {
            key: 'confiar_en_el_mecanismo',
            label: 'CONFIAR EN EL MECANISMO',
            placeholder: '¿Qué debe creer sobre cómo funciona esto?',
            type: 'textarea',
          },
          {
            key: 'creerse_capaz',
            label: 'CREERSE CAPAZ',
            placeholder: '¿Qué debe creer sobre sí mismo?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.5',
        title: 'ELEMENTO PROPIETARIO',
        fields: [
          {
            key: 'que_es_exactamente_tuyo',
            label: 'QUÉ ES EXACTAMENTE TUYO',
            placeholder: '¿Qué parte nadie más tiene?',
            type: 'textarea',
          },
          {
            key: 'por_que_dificil_copiar',
            label: 'POR QUÉ ES DIFÍCIL DE COPIAR',
            placeholder: '¿Qué lo protege de ser replicado?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.6',
        title: 'DIFERENCIACIÓN',
        fields: [
          {
            key: 'enfoque_convencional_debilidad',
            label: 'ENFOQUE CONVENCIONAL Y DEBILIDAD',
            placeholder: '¿Cómo lo hace todo el mundo y por qué falla?',
            type: 'textarea',
          },
          {
            key: 'diferencia_estructural',
            label: 'DIFERENCIA ESTRUCTURAL',
            placeholder: '¿Qué haces fundamentalmente distinto?',
            type: 'textarea',
          },
          {
            key: 'dimension_superioridad',
            label: 'DIMENSIÓN DE SUPERIORIDAD',
            placeholder: '¿En qué eje eres mejor?',
            type: 'textarea',
          },
          {
            key: 'evidencia_beneficio_resultante',
            label: 'EVIDENCIA / BENEFICIO RESULTANTE',
            placeholder: '¿Qué prueba esa superioridad?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.7',
        title: 'EXCLUSIVIDAD',
        fields: [
          {
            key: 'barreras_imitacion',
            label: 'BARRERAS DE IMITACIÓN',
            placeholder: '¿Qué le costaría a un competidor copiarte?',
            type: 'textarea',
          },
          {
            key: 'riesgo_comoditizacion',
            label: 'RIESGO DE COMODITIZACIÓN',
            placeholder: '¿Qué tan rápido podría volverse genérico?',
            type: 'textarea',
          },
          {
            key: 'estrategia_proteccion',
            label: 'ESTRATEGIA DE PROTECCIÓN',
            placeholder: '¿Cómo mantienes la ventaja?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.8',
        title: 'PROOF MECHANISM',
        fields: [
          {
            key: 'como_se_demuestra_mecanismo_real',
            label: 'CÓMO SE DEMUESTRA QUE EL MECANISMO ES REAL',
            placeholder: '¿Qué evidencia prueba que esto no es solo una afirmación?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.9',
        title: 'ANALOGÍA CENTRAL',
        fields: [
          {
            key: 'analogia',
            label: 'ANALOGÍA',
            placeholder: '¿A qué se parece que cualquiera entendería en 5 segundos?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.10',
        title: 'STORY MECHANISM',
        fields: [
          {
            key: 'logica_narrativa',
            label: 'LÓGICA NARRATIVA',
            placeholder: 'Problema → diagnóstico → causa → oportunidad → mecanismo → transformación',
            type: 'textarea',
          },
        ],
      },
      {
        number: '5.11',
        title: 'NAMING',
        fields: [
          {
            key: 'opciones_nombre',
            label: 'OPCIONES DE NOMBRE',
            placeholder: '¿Qué nombres consideraste?',
            type: 'textarea',
          },
          {
            key: 'nombre_definitivo',
            label: 'NOMBRE DEFINITIVO',
            placeholder: '¿Cuál elegiste?',
            type: 'input',
          },
          {
            key: 'justificacion',
            label: 'JUSTIFICACIÓN',
            placeholder: '¿Por qué ese y no otro?',
            type: 'textarea',
          },
          {
            key: 'tests_claridad_credibilidad',
            label: 'TESTS (CLARIDAD / CREDIBILIDAD / COHERENCIA / EXCLUSIVIDAD)',
            placeholder: '¿Se entiende, se cree, encaja y es único?',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 6,
    key: 'transformacion',
    title: '6. Transformación',
    shortTitle: 'Transformación',
    iconName: 'sparkles',
    subsections: [
      {
        number: '6.1',
        title: 'ESTADO ACTUAL',
        fields: [
          {
            key: 'situacion_inicial',
            label: 'SITUACIÓN INICIAL',
            placeholder: '¿Cómo está el usuario antes?',
            type: 'textarea',
          },
          {
            key: 'resultados_actuales',
            label: 'RESULTADOS ACTUALES',
            placeholder: '¿Qué resultados obtiene hoy sin tu producto?',
            type: 'textarea',
          },
          {
            key: 'percepcion_emocional_actual',
            label: 'PERCEPCIÓN EMOCIONAL ACTUAL',
            placeholder: '¿Cómo se siente hoy?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '6.2',
        title: 'ESTADO DESEADO',
        fields: [
          {
            key: 'situacion_final',
            label: 'SITUACIÓN FINAL',
            placeholder: '¿Cómo se ve su vida después?',
            type: 'textarea',
          },
          {
            key: 'resultado_funcional_experiencial_emocional',
            label: 'RESULTADO FUNCIONAL / EXPERIENCIAL / EMOCIONAL',
            placeholder: '¿Qué logra, cómo lo vive, cómo se siente?',
            type: 'textarea',
          },
          {
            key: 'cambio_de_identidad',
            label: 'CAMBIO DE IDENTIDAD',
            placeholder: '¿En qué tipo de persona se convierte?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '6.3',
        title: 'TRANSFORMACIÓN PRINCIPAL',
        fields: [
          {
            key: 'declaracion_de_transformacion',
            label: 'DECLARACIÓN DE TRANSFORMACIÓN',
            placeholder: 'En una frase, ¿de qué a qué lo llevas?',
            type: 'textarea',
          },
          {
            key: 'horizonte_temporal',
            label: 'HORIZONTE TEMPORAL',
            placeholder: '¿En cuánto tiempo, razonablemente?',
            type: 'input',
          },
          {
            key: 'limites_razonables',
            label: 'LÍMITES RAZONABLES',
            placeholder: '¿Qué NO promete esta transformación?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '6.4',
        title: 'MEDICIÓN',
        fields: [
          {
            key: 'indicador_principal',
            label: 'INDICADOR PRINCIPAL',
            placeholder: '¿Con qué número se ve el progreso?',
            type: 'input',
          },
          {
            key: 'evidencia_de_exito',
            label: 'EVIDENCIA DE ÉXITO',
            placeholder: '¿Qué prueba que la transformación ocurrió?',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 7,
    key: 'posicionamiento',
    title: '7. Posicionamiento',
    shortTitle: 'Posicionamiento',
    iconName: 'target',
    subsections: [
      {
        number: '7.1',
        title: 'MARCO DE CATEGORÍA',
        fields: [
          {
            key: 'categoria_en_la_que_compite',
            label: 'CATEGORÍA EN LA QUE COMPITE',
            placeholder: '¿Contra qué se compara hoy?',
            type: 'textarea',
          },
          {
            key: 'categoria_mental_deseada',
            label: 'CATEGORÍA MENTAL DESEADA',
            placeholder: '¿Contra qué quieres que se compare?',
            type: 'textarea',
          },
          {
            key: 'alternativa_que_reemplaza',
            label: 'ALTERNATIVA QUE REEMPLAZA',
            placeholder: '¿Qué reemplaza en la vida del usuario?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '7.2',
        title: 'PROMESA',
        fields: [
          {
            key: 'resultado_prometido',
            label: 'RESULTADO PROMETIDO',
            placeholder: '¿Qué le prometes exactamente?',
            type: 'textarea',
          },
          {
            key: 'condiciones_y_limites',
            label: 'CONDICIONES Y LÍMITES',
            placeholder: '¿Bajo qué condiciones aplica?',
            type: 'textarea',
          },
          {
            key: 'nivel_de_evidencia',
            label: 'NIVEL DE EVIDENCIA',
            placeholder: '¿Qué tan respaldada está hoy?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '7.3',
        title: 'PROPUESTA DE VALOR',
        fields: [
          {
            key: 'para_quien',
            label: 'PARA QUIÉN',
            placeholder: '¿A quién es para?',
            type: 'textarea',
          },
          {
            key: 'problema_prioritario',
            label: 'PROBLEMA PRIORITARIO',
            placeholder: '¿Qué problema resuelve primero?',
            type: 'textarea',
          },
          {
            key: 'resultado_principal',
            label: 'RESULTADO PRINCIPAL',
            placeholder: '¿Qué logra?',
            type: 'textarea',
          },
          {
            key: 'mecanismo_posicionamiento',
            label: 'MECANISMO (POSICIONAMIENTO)',
            type: 'inherited',
            inheritedFrom: 'Mecanismo Único',
            targetSectionId: 5,
          },
          {
            key: 'razon_para_creer',
            label: 'RAZÓN PARA CREER',
            placeholder: '¿Por qué debería creerte?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '7.4',
        title: 'BIG IDEA',
        fields: [
          {
            key: 'concepto_central',
            label: 'CONCEPTO CENTRAL',
            placeholder: '¿La idea que organiza todo el mensaje?',
            type: 'textarea',
          },
          {
            key: 'insight_tension',
            label: 'INSIGHT / TENSIÓN',
            placeholder: '¿Qué verdad incómoda contiene?',
            type: 'textarea',
          },
          {
            key: 'conexion_con_el_mecanismo',
            label: 'CONEXIÓN CON EL MECANISMO',
            placeholder: '¿Cómo se relaciona con el Mecanismo Único?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '7.5',
        title: 'POSICIONAMIENTO CANÓNICO',
        fields: [
          {
            key: 'resumen_de_una_frase',
            label: 'RESUMEN DE UNA FRASE',
            type: 'inherited',
            inheritedFrom: 'Resumen de un párrafo',
            inheritedTag: '✨ Generado desde Resumen de un párrafo',
            targetSectionId: 7,
          },
          {
            key: 'resumen_de_un_parrafo',
            label: 'RESUMEN DE UN PÁRRAFO',
            placeholder: 'Si tuvieras un párrafo...',
            type: 'textarea',
          },
          {
            key: 'elevator_pitch',
            label: 'ELEVATOR PITCH',
            placeholder: 'Si tuvieras 30 segundos...',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 8,
    key: 'producto',
    title: '8. Producto',
    shortTitle: 'Producto',
    iconName: 'box',
    subsections: [
      {
        number: '8.1',
        title: 'SOLUCIÓN',
        fields: [
          {
            key: 'nombre_del_producto',
            label: 'NOMBRE DEL PRODUCTO',
            placeholder: '¿Cómo se llama?',
            type: 'input',
          },
          {
            key: 'descripcion_funcional',
            label: 'DESCRIPCIÓN FUNCIONAL',
            placeholder: '¿Qué es, en términos prácticos?',
            type: 'textarea',
          },
          {
            key: 'mecanismo_entregado',
            label: 'MECANISMO ENTREGADO',
            type: 'inherited',
            inheritedFrom: 'Mecanismo Único',
            targetSectionId: 5,
          },
        ],
      },
      {
        number: '8.2',
        title: 'FRAMEWORK / MÉTODO CENTRAL',
        fields: [
          {
            key: 'nombre_del_metodo',
            label: 'NOMBRE DEL MÉTODO',
            placeholder: '¿Cómo se llama el método?',
            type: 'input',
          },
          {
            key: 'etapas_y_secuencia',
            label: 'ETAPAS Y SECUENCIA',
            placeholder: '¿Cuáles son los pasos y en qué orden?',
            type: 'textarea',
          },
          {
            key: 'resultado_de_cada_etapa',
            label: 'RESULTADO DE CADA ETAPA',
            placeholder: '¿Qué logra al completar cada paso?',
            type: 'textarea',
          },
          {
            key: 'relacion_con_el_mecanismo_unico',
            label: 'RELACIÓN CON EL MECANISMO ÚNICO',
            placeholder: '¿Cómo aplica el mecanismo en la práctica?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '8.3',
        title: 'FUNCIONALIDADES',
        fields: [
          {
            key: 'funcionalidades_job_resultado_prioridad',
            label: 'FUNCIONALIDADES (JOB, RESULTADO, PRIORIDAD)',
            placeholder: '¿Qué hace cada parte, para qué sirve, qué produce?\n\nEj:\n1. Login con Google → Reduce fricción → Acceso inmediato → Crítica (MVP)',
            type: 'textarea',
          },
        ],
      },
      {
        number: '8.4',
        title: 'ROADMAP',
        fields: [
          {
            key: 'roadmap',
            label: 'ROADMAP',
            placeholder: 'Etapa, objetivo, acción, barrera, criterio de avance.\n\nEj:\nEtapa 1: Activación → Completar perfil → Llenar onboarding → Falta contexto → Al guardar perfil',
            type: 'textarea',
          },
        ],
      },
      {
        number: '8.5',
        title: 'JOURNEYS CLAVE',
        fields: [
          {
            key: 'journeys',
            label: 'JOURNEYS',
            placeholder: 'Nombre → Evento inicial → Objetivo → Pasos y fricciones → Punto de valor → Abandono',
            type: 'textarea',
          },
        ],
      },
      {
        number: '8.6',
        title: 'ACTIVACIÓN Y QUICK WIN',
        fields: [
          {
            key: 'accion_inicial',
            label: 'ACCIÓN INICIAL',
            placeholder: '¿Lo primero que hace en el producto?',
            type: 'input',
          },
          {
            key: 'quick_win',
            label: 'QUICK WIN',
            placeholder: '¿Qué resultado rápido y tangible obtiene primero?',
            type: 'textarea',
          },
          {
            key: 'tiempo_hasta_el_valor',
            label: 'TIEMPO HASTA EL VALOR',
            placeholder: '¿Cuánto tarda en sentir que funciona?',
            type: 'input',
          },
          {
            key: 'evidencia_visible_de_progreso',
            label: 'EVIDENCIA VISIBLE DE PROGRESO',
            placeholder: '¿Cómo ve que está avanzando?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '8.7',
        title: 'PRINCIPIOS DE EXPERIENCIA',
        fields: [
          {
            key: 'nivel_de_guia_autonomia',
            label: 'NIVEL DE GUÍA / AUTONOMÍA',
            placeholder: '¿Cuánto lo guías vs. cuánto decide él?',
            type: 'textarea',
          },
          {
            key: 'forma_de_mostrar_valor',
            label: 'FORMA DE MOSTRAR VALOR',
            placeholder: '¿Cómo se comunica el progreso?',
            type: 'textarea',
          },
          {
            key: 'limites_eticos',
            label: 'LÍMITES ÉTICOS',
            placeholder: '¿Qué NO harías nunca?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '8.8',
        title: 'REQUISITOS TÉCNICOS',
        fields: [
          {
            key: 'requisitos_tecnicos',
            label: 'REQUISITOS TÉCNICOS',
            placeholder: '¿Qué debe hacer el sistema? ¿Plataformas? ¿Seguridad? ¿Accesibilidad?',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 9,
    key: 'comercial',
    title: '9. Comercial',
    shortTitle: 'Comercial',
    iconName: 'shopping-cart',
    subsections: [
      {
        number: '9.1',
        title: 'ARQUITECTURA DE OFERTA',
        fields: [
          {
            key: 'oferta_principal',
            label: 'OFERTA PRINCIPAL',
            placeholder: '¿Qué es lo que realmente estás vendiendo?',
            type: 'textarea',
          },
          {
            key: 'ofertas_complementarias',
            label: 'OFERTAS COMPLEMENTARIAS',
            placeholder: '¿Hay otras ofertas relacionadas?',
            type: 'textarea',
          },
          {
            key: 'planes_niveles',
            label: 'PLANES / NIVELES',
            placeholder: '¿Hay distintos niveles?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '9.2',
        title: 'PRICING',
        fields: [
          {
            key: 'precio',
            label: 'PRECIO',
            placeholder: '¿Cuánto cuesta?',
            type: 'input',
          },
          {
            key: 'precio_ancla',
            label: 'PRECIO ANCLA',
            placeholder: '¿Con qué referencia comparas?',
            type: 'input',
          },
          {
            key: 'moneda',
            label: 'MONEDA',
            placeholder: '¿En qué moneda?',
            type: 'input',
          },
          {
            key: 'periodicidad_unidad_de_cobro',
            label: 'PERIODICIDAD / UNIDAD DE COBRO',
            placeholder: '¿Una vez, mensual, anual, por uso?',
            type: 'input',
          },
          {
            key: 'prueba_gratuita_freemium',
            label: 'PRUEBA GRATUITA / FREEMIUM',
            placeholder: '¿Hay forma de probar antes de pagar?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '9.3',
        title: 'ACCESO Y ENTREGA',
        fields: [
          {
            key: 'forma_de_acceso',
            label: 'FORMA DE ACCESO',
            placeholder: '¿Cómo recibe el producto?',
            type: 'textarea',
          },
          {
            key: 'onboarding',
            label: 'ONBOARDING',
            placeholder: '¿Cómo lo guías en los primeros pasos?',
            type: 'textarea',
          },
          {
            key: 'soporte',
            label: 'SOPORTE',
            placeholder: '¿Qué ayuda tiene disponible?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '9.4',
        title: 'STACK DE VALOR',
        fields: [
          {
            key: 'stack_de_valor',
            label: 'STACK DE VALOR',
            placeholder: 'Componente → Función → Objeción que reduce → Etapa.\n\nEj:\nAcceso vitalicio → No pierde lo pagado → Si dejo de pagar pierdo todo → Retención',
            type: 'textarea',
          },
        ],
      },
      {
        number: '9.5',
        title: 'RIESGO Y REVERSIÓN',
        fields: [
          {
            key: 'riesgo_percibido',
            label: 'RIESGO PERCIBIDO',
            placeholder: '¿Qué teme perder al comprar?',
            type: 'textarea',
          },
          {
            key: 'garantia_y_condiciones',
            label: 'GARANTÍA Y CONDICIONES',
            placeholder: '¿Qué garantía ofreces?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '9.6',
        title: 'ACCIÓN',
        fields: [
          {
            key: 'cta_estrategico',
            label: 'CTA ESTRATÉGICO',
            placeholder: '¿Qué acción exacta le pides?',
            type: 'input',
          },
          {
            key: 'urgencia',
            label: 'URGENCIA',
            placeholder: '¿Por qué actuar ahora?',
            type: 'textarea',
          },
          {
            key: 'escasez',
            label: 'ESCASEZ',
            placeholder: '¿Hay un límite real?',
            type: 'textarea',
          },
          {
            key: 'friccion_de_compra',
            label: 'FRICCIÓN DE COMPRA',
            placeholder: '¿Qué lo haría dudar?',
            type: 'textarea',
          },
          {
            key: 'proximo_paso',
            label: 'PRÓXIMO PASO',
            placeholder: '¿Qué pasa inmediatamente después?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '9.7',
        title: 'EXPANSIÓN',
        fields: [
          {
            key: 'upsell_cross_sell',
            label: 'UPSELL / CROSS-SELL',
            placeholder: '¿Qué le ofreces después?',
            type: 'textarea',
          },
          {
            key: 'ruta_de_madurez_del_cliente',
            label: 'RUTA DE MADUREZ DEL CLIENTE',
            placeholder: '¿Cómo evoluciona la relación?',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 10,
    key: 'evidencia',
    title: '10. Evidencia',
    shortTitle: 'Evidencia',
    iconName: 'star',
    subsections: [
      {
        number: '10.1',
        title: 'CLAIM-PROOF-BENEFIT',
        fields: [
          {
            key: 'claims_pruebas_beneficios',
            label: 'CLAIMS, PRUEBAS Y BENEFICIOS',
            placeholder: 'Claim → Proof → Beneficio.\n\nEj:\nAhorra 3h semanales → 3 casos documentados → Más tiempo + menos estrés',
            type: 'textarea',
          },
        ],
      },
      {
        number: '10.2',
        title: 'CASOS DE ÉXITO',
        fields: [
          {
            key: 'casos_de_exito',
            label: 'CASOS DE ÉXITO',
            placeholder: 'Contexto → Solución → Resultado → Evidencia → Permiso.\n\nEj:\n0 ventas → Sistema 6 semanas → 3 clientes nuevos → Captura → Sí',
            type: 'textarea',
          },
        ],
      },
      {
        number: '10.3',
        title: 'TESTIMONIOS',
        fields: [
          {
            key: 'testimonios',
            label: 'TESTIMONIOS',
            placeholder: 'Autor → Cita literal → Objeción que disuelve → Permiso',
            type: 'textarea',
          },
        ],
      },
      {
        number: '10.4',
        title: 'BRECHAS DE EVIDENCIA',
        fields: [
          {
            key: 'brechas',
            label: 'BRECHAS',
            placeholder: 'Claim sin validar → Necesidad → Prioridad.\n\nEj:\nFunciona para equipos → Necesito un caso → Alta prioridad',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 11,
    key: 'marca',
    title: '11. Marca',
    shortTitle: 'Marca',
    iconName: 'palette',
    subsections: [
      {
        number: '11.1',
        title: 'FUNDAMENTOS',
        fields: [
          {
            key: 'nombre_de_la_marca',
            label: 'NOMBRE DE LA MARCA',
            placeholder: 'Nombre definitivo de la marca',
            type: 'inherited',
            inheritedFrom: 'Nombre del producto',
            inheritedTag: '✨ Generado desde Nombre del producto',
            targetSectionId: 8,
          },
          {
            key: 'descripcion_canonica',
            label: 'DESCRIPCIÓN CANÓNICA',
            placeholder: '¿Cómo la describes siempre igual, en una línea?',
            type: 'textarea',
          },
          {
            key: 'proposito',
            label: 'PROPÓSITO',
            placeholder: '¿Por qué existe?',
            type: 'textarea',
          },
          {
            key: 'personalidad',
            label: 'PERSONALIDAD',
            placeholder: 'Si fuera una persona, ¿cómo sería?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '11.2',
        title: 'IDENTIDAD VERBAL',
        fields: [
          {
            key: 'voz_y_tono',
            label: 'VOZ Y TONO',
            placeholder: '¿Cómo suena al hablar?',
            type: 'textarea',
          },
          {
            key: 'nivel_de_tecnicismo',
            label: 'NIVEL DE TECNICISMO',
            placeholder: '¿Técnico o simple?',
            type: 'input',
          },
          {
            key: 'palabras_preferidas_prohibidas',
            label: 'PALABRAS PREFERIDAS / PROHIBIDAS',
            placeholder: '¿Qué usa siempre y qué nunca?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '11.3',
        title: 'DIRECCIÓN VISUAL',
        fields: [
          {
            key: 'estilo_visual',
            label: 'ESTILO VISUAL',
            placeholder: '¿Cómo se ve, en general?',
            type: 'textarea',
          },
          {
            key: 'referencias',
            label: 'REFERENCIAS',
            placeholder: '¿Qué marcas o estilos son referencia?',
            type: 'textarea',
          },
          {
            key: 'elementos_a_evitar',
            label: 'ELEMENTOS A EVITAR',
            placeholder: '¿Qué NO debería verse nunca?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '11.4',
        title: 'SISTEMA TIPOGRÁFICO',
        fields: [
          {
            key: 'tipografia_principal_secundaria',
            label: 'TIPOGRAFÍA PRINCIPAL / SECUNDARIA',
            placeholder: '¿Qué fuentes usa?',
            type: 'input',
          },
          {
            key: 'jerarquia',
            label: 'JERARQUÍA',
            placeholder: '¿Cómo se diferencian títulos, subtítulos y cuerpo?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '11.5',
        title: 'PALETA',
        fields: [
          {
            key: 'color_primario',
            label: 'COLOR PRIMARIO',
            placeholder: '#000000',
            type: 'color',
          },
          {
            key: 'color_secundario',
            label: 'COLOR SECUNDARIO',
            placeholder: '#000000',
            type: 'color',
          },
          {
            key: 'color_acento',
            label: 'COLOR ACENTO',
            placeholder: '#000000',
            type: 'color',
          },
          {
            key: 'reglas_de_contraste_y_uso',
            label: 'REGLAS DE CONTRASTE Y USO',
            placeholder: '¿Cómo y cuándo se usa cada color?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '11.6',
        title: 'ICONOGRAFÍA E IMÁGENES',
        fields: [
          {
            key: 'estilo_iconografico',
            label: 'ESTILO ICONOGRÁFICO',
            placeholder: 'Outline, filled, custom...',
            type: 'input',
          },
          {
            key: 'estilo_de_ilustracion_fotografia',
            label: 'ESTILO DE ILUSTRACIÓN / FOTOGRAFÍA',
            placeholder: 'Ilustración, foto real, 3D...',
            type: 'input',
          },
          {
            key: 'imagenes_de_referencia',
            label: 'IMÁGENES DE REFERENCIA',
            placeholder: '¿Qué ejemplos visuales representan el estilo?',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 12,
    key: 'comunicacion',
    title: '12. Comunicación',
    shortTitle: 'Comunicación',
    iconName: 'message-circle',
    subsections: [
      {
        number: '12.1',
        title: 'JERARQUÍA DE MENSAJES',
        fields: [
          {
            key: 'mensaje_primario',
            label: 'MENSAJE PRIMARIO',
            placeholder: '¿El mensaje que aparece siempre primero?',
            type: 'textarea',
          },
          {
            key: 'beneficios_priorizados',
            label: 'BENEFICIOS PRIORIZADOS',
            placeholder: '¿Cuáles van primero?',
            type: 'textarea',
          },
        ],
      },
      {
        number: '12.2',
        title: 'NARRATIVA EDUCATIVA',
        fields: [
          {
            key: 'secuencia_narrativa_completa',
            label: 'SECUENCIA NARRATIVA COMPLETA',
            placeholder: 'Problema → diagnóstico incorrecto → causa raíz → enemigo → nueva oportunidad → mecanismo → prueba → oferta',
            type: 'textarea',
          },
        ],
      },
      {
        number: '12.3',
        title: 'MATRIZ DE OBJECIONES',
        fields: [
          {
            key: 'objecion_respuesta_claim_prueba',
            label: 'OBJECIÓN → RESPUESTA → CLAIM / PRUEBA',
            placeholder: 'Objeción → Cómo la resuelves → Con qué la sostienes.\n\nEj:\nEs muy caro → Vale por lo que evitas → Coste de no resolver',
            type: 'textarea',
          },
        ],
      },
      {
        number: '12.4',
        title: 'BENEFICIOS',
        fields: [
          {
            key: 'beneficios_funcionales_experienciales_emocionales',
            label: 'BENEFICIOS FUNCIONALES / EXPERIENCIALES / EMOCIONALES',
            placeholder: 'Funcional → experiencial → emocional → prioridad.\n\nEj:\nAhorra 3h/semana → Controla agenda → Se siente profesional → 1er lugar',
            type: 'textarea',
          },
        ],
      },
      {
        number: '12.5',
        title: 'REGLAS DE CTA',
        fields: [
          {
            key: 'reglas_de_cta_por_etapa_de_consciencia',
            label: 'REGLAS DE CTA POR ETAPA DE CONSCIENCIA',
            placeholder: 'Etapa → Acción esperada → Fricción permitida.\n\nEj:\nInconsciente → Leer artículo → Ninguna',
            type: 'textarea',
          },
        ],
      },
      {
        number: '12.6',
        title: 'REGLAS POR CANAL',
        fields: [
          {
            key: 'reglas_por_canal',
            label: 'REGLAS POR CANAL',
            placeholder: 'Canal → Tono y profundidad → Claims y CTA permitidos.\n\nEj:\nEmail nurture → Informal, extenso → Claims de transformación + CTA blando',
            type: 'textarea',
          },
        ],
      },
      {
        number: '12.7',
        title: 'GLOSARIO',
        fields: [
          {
            key: 'glosario_de_terminos_propios',
            label: 'GLOSARIO DE TÉRMINOS PROPIOS',
            placeholder: 'Término → Definición → Uso correcto / incorrecto.\n\nEj:\nMecanismo → Sistema propio → Correcto: nuestro mecanismo / Incorrecto: nuestro proceso',
            type: 'textarea',
          },
        ],
      },
    ],
  },
];

export function getInitialMasterDocData(project: Project): Record<string, any> {
  const initialData: Record<string, any> = {};

  MASTER_DOC_SECTIONS.forEach((section) => {
    initialData[section.key] = {};
    section.subsections.forEach((sub) => {
      sub.fields.forEach((field) => {
        if (field.key === 'nombre_proyecto') {
          initialData[section.key][field.key] = project.name;
        } else if (field.defaultValue) {
          initialData[section.key][field.key] = field.defaultValue;
        } else {
          initialData[section.key][field.key] = '';
        }
      });
    });
  });

  return initialData;
}
