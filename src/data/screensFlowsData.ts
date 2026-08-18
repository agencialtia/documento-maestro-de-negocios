import { ProjectScreensData } from '../types';

export const initialScreensFlowsData: ProjectScreensData = {
  flows: [
    {
      id: 'flow-principal',
      name: 'Flujo Principal (Activación y Onboarding)',
      description: 'Desde la apertura de la app hasta el primer registro conductual guiado.',
      color: '#34d399',
      screenIds: ['scr-splash', 'scr-onboarding', 'scr-perfil-nino', 'scr-dashboard'],
    },
    {
      id: 'flow-asistencia-crisis',
      name: 'Flujo de Asistencia en Situaciones Difíciles',
      description: 'Guía rápida de 3 toques cuando el niño experimenta una desregulación o crisis.',
      color: '#f59e0b',
      screenIds: ['scr-asistencia-rapida', 'scr-guia-conducta', 'scr-feedback-calma'],
    },
    {
      id: 'flow-rutinas',
      name: 'Flujo de Rutinas y Apoyo Visual',
      description: 'Estructuración del día a día con pictogramas y secuencias predictivas.',
      color: '#818cf8',
      screenIds: ['scr-lista-rutinas', 'scr-editor-rutina', 'scr-modo-paso-a-paso'],
    },
    {
      id: 'flow-reportes',
      name: 'Flujo de Seguimiento y Reportes',
      description: 'Consolidación semanal de patrones de conducta para compartir con terapeutas.',
      color: '#f472b6',
      screenIds: ['scr-reporte-semanal', 'scr-exportar-terapeuta'],
    },
  ],
  screens: [
    {
      id: 'scr-splash',
      name: 'Splash Screen',
      flowId: 'flow-principal',
      type: 'Splash',
      status: 'Terminada',
      route: '/',
      purpose: 'Presentar la identidad del producto, verificar sesión activa y precargar configuración local.',
      keyElements: [
        'Logotipo animado de ScreenOS / TEA Flow',
        'Indicador sutil de carga',
        'Verificación de token de autenticación biométrica o local'
      ],
      navigationActions: [
        {
          trigger: 'Sesión activa detectada',
          targetScreenId: 'scr-dashboard',
          targetScreenName: 'Dashboard Principal',
          condition: 'auth == true'
        },
        {
          trigger: 'Primera vez o sin sesión',
          targetScreenId: 'scr-onboarding',
          targetScreenName: 'Onboarding y Bienvenida',
          condition: 'auth == false'
        }
      ],
      dataConsumed: ['Estado de sesión local', 'Preferencias de tema'],
      dataProduced: ['Inicialización de caché'],
      notes: 'Tiempo máximo de transición: 1.2 segundos para no generar fricción en momentos de urgencia.'
    },
    {
      id: 'scr-onboarding',
      name: 'Onboarding y Bienvenida',
      flowId: 'flow-principal',
      type: 'Onboarding',
      status: 'Terminada',
      route: '/onboarding',
      purpose: 'Transmitir seguridad y empatía al cuidador, explicando en 3 pantallas clave cómo la app simplifica el día a día.',
      keyElements: [
        'Carrusel de 3 tarjetas de valor',
        'Botón "Comenzar Ahora"',
        'Acceso directo a iniciar sesión si ya tiene cuenta',
        'Selector de rol: Papá, Mamá, Cuidador o Terapeuta'
      ],
      navigationActions: [
        {
          trigger: 'Clic en "Comenzar Ahora"',
          targetScreenId: 'scr-perfil-nino',
          targetScreenName: 'Configuración de Perfil'
        }
      ],
      dataConsumed: [],
      dataProduced: ['Rol de usuario seleccionado'],
      notes: 'Lenguaje cercano, sin tecnicismos clínicos abrumadores.'
    },
    {
      id: 'scr-perfil-nino',
      name: 'Configuración Inicial del Niño',
      flowId: 'flow-principal',
      type: 'Formulario',
      status: 'En desarrollo',
      route: '/config-nino',
      purpose: 'Recopilar 3 datos esenciales: nombre/alias, edad aproximada y principales disparadores de sobrecarga sensorial.',
      keyElements: [
        'Campo de nombre o apodo',
        'Selector de edad / etapa escolar',
        'Chips de sensibilidades (ruidos fuertes, texturas, cambios de rutina)',
        'Botón "Guardar y Continuar"'
      ],
      navigationActions: [
        {
          trigger: 'Clic en "Guardar y Continuar"',
          targetScreenId: 'scr-dashboard',
          targetScreenName: 'Dashboard Principal'
        }
      ],
      dataConsumed: ['Lista de disparadores comunes'],
      dataProduced: ['Perfil del niño guardado localmente']
    },
    {
      id: 'scr-dashboard',
      name: 'Dashboard Principal',
      flowId: 'flow-principal',
      type: 'Dashboard',
      status: 'En desarrollo',
      route: '/home',
      purpose: 'Centro de control diario. Acceso instantáneo en 1 toque al botón de crisis, la rutina activa y las notas rápidas.',
      keyElements: [
        'Botón de emergencia destacado "Necesito Ayuda Ahora"',
        'Tarjeta de Rutina en curso (ej. "Hora de Cenar")',
        'Historial de registros del día',
        'Barra de navegación inferior (Inicio, Rutinas, Registro, Reportes)'
      ],
      navigationActions: [
        {
          trigger: 'Clic en "Necesito Ayuda Ahora"',
          targetScreenId: 'scr-asistencia-rapida',
          targetScreenName: 'Asistencia Rápida de Crisis'
        },
        {
          trigger: 'Clic en pestaña Rutinas',
          targetScreenId: 'scr-lista-rutinas',
          targetScreenName: 'Gestor de Rutinas'
        },
        {
          trigger: 'Clic en pestaña Reportes',
          targetScreenId: 'scr-reporte-semanal',
          targetScreenName: 'Reporte Semanal'
        }
      ],
      dataConsumed: ['Rutina actual', 'Registros recientes', 'Perfil del niño'],
      dataProduced: []
    },
    {
      id: 'scr-asistencia-rapida',
      name: 'Asistencia Rápida en Crisis',
      flowId: 'flow-asistencia-crisis',
      type: 'Detalle',
      status: 'En desarrollo',
      route: '/asistencia-crisis',
      purpose: 'Identificar en 2 toques qué disparó la conducta (sensorial, cambio imprevisto, frustración comunicativa) para dar pautas inmediatas.',
      keyElements: [
        '4 botones grandes con iconos táctiles de alta visibilidad',
        'Selector de intensidad (Baja, Media, Alta)',
        'Temporizador de respiración / calma para el cuidador',
        'Botón "Obtener Guía Inmediata"'
      ],
      navigationActions: [
        {
          trigger: 'Seleccionar causa y presionar "Obtener Guía"',
          targetScreenId: 'scr-guia-conducta',
          targetScreenName: 'Paso a Paso de Regulación'
        }
      ],
      dataConsumed: ['Disparadores del perfil del niño'],
      dataProduced: ['Evento de desregulación iniciado']
    },
    {
      id: 'scr-guia-conducta',
      name: 'Guía de Desescalada Paso a Paso',
      flowId: 'flow-asistencia-crisis',
      type: 'Detalle',
      status: 'Pendiente',
      route: '/guia-desescalada',
      purpose: 'Presentar tarjetas con instrucciones concisas y directas sobre qué hacer y qué evitar en este minuto exacto.',
      keyElements: [
        'Paso 1: Reducir estímulos ambientales (luz, voz baja)',
        'Paso 2: Ofrecer objeto de autorregulación favorito',
        'Paso 3: Validar emoción sin exigir respuesta verbal',
        'Botón "Situación Controlada" / "Registrar Detalle"'
      ],
      navigationActions: [
        {
          trigger: 'Clic en "Situación Controlada"',
          targetScreenId: 'scr-feedback-calma',
          targetScreenName: 'Registro y Cierre'
        }
      ],
      dataConsumed: ['Causa seleccionada'],
      dataProduced: ['Estrategias aplicadas']
    },
    {
      id: 'scr-feedback-calma',
      name: 'Registro y Cierre de Situación',
      flowId: 'flow-asistencia-crisis',
      type: 'Modal',
      status: 'Pendiente',
      route: '/cierre-crisis',
      purpose: 'Registrar la duración estimada y qué técnica funcionó mejor, reforzando la confianza del cuidador con un mensaje de validación.',
      keyElements: [
        'Selector de duración (< 5 min, 5-15 min, > 15 min)',
        'Nota rápida por voz o texto',
        'Mensaje de refuerzo positivo al cuidador',
        'Botón "Volver al Inicio"'
      ],
      navigationActions: [
        {
          trigger: 'Clic en "Volver al Inicio"',
          targetScreenId: 'scr-dashboard',
          targetScreenName: 'Dashboard Principal'
        }
      ],
      dataConsumed: ['Datos temporales de la sesión'],
      dataProduced: ['Registro conductual consolidado']
    },
    {
      id: 'scr-lista-rutinas',
      name: 'Gestor de Rutinas Diarias',
      flowId: 'flow-rutinas',
      type: 'Dashboard',
      status: 'Pendiente',
      route: '/rutinas',
      purpose: 'Mostrar las secuencias activas del día (Mañana, Tarea, Cena, Dormir) con porcentaje de cumplimiento.',
      keyElements: [
        'Lista de rutinas por franja horaria',
        'Interruptor para activar/pausar alertas predictivas',
        'Botón flotante "Nueva Rutina"',
        'Botón "Iniciar Rutina en Modo Enfoque"'
      ],
      navigationActions: [
        {
          trigger: 'Clic en "Nueva Rutina"',
          targetScreenId: 'scr-editor-rutina',
          targetScreenName: 'Editor de Rutina'
        },
        {
          trigger: 'Clic en "Iniciar Rutina"',
          targetScreenId: 'scr-modo-paso-a-paso',
          targetScreenName: 'Modo Visual Paso a Paso'
        }
      ],
      dataConsumed: ['Rutinas guardadas'],
      dataProduced: []
    },
    {
      id: 'scr-editor-rutina',
      name: 'Editor de Rutina y Pictogramas',
      flowId: 'flow-rutinas',
      type: 'Formulario',
      status: 'Pendiente',
      route: '/editor-rutina',
      purpose: 'Permitir armar secuencias visuales arrastrando pasos (ej: 1. Lavarse manos → 2. Sentarse → 3. Comer).',
      keyElements: [
        'Nombre de la rutina',
        'Horario programado y recordatorio sonoro suave',
        'Lista de pasos ordenables con soporte de imágenes y pictogramas',
        'Botón "Guardar Rutina"'
      ],
      navigationActions: [
        {
          trigger: 'Clic en "Guardar Rutina"',
          targetScreenId: 'scr-lista-rutinas',
          targetScreenName: 'Gestor de Rutinas'
        }
      ],
      dataConsumed: ['Biblioteca de pictogramas'],
      dataProduced: ['Nueva rutina estructurada']
    },
    {
      id: 'scr-modo-paso-a-paso',
      name: 'Modo Visual Paso a Paso',
      flowId: 'flow-rutinas',
      type: 'Detalle',
      status: 'Pendiente',
      route: '/modo-paso-a-paso',
      purpose: 'Pantalla limpia a pantalla completa pensada para mostrar al niño el paso que se está realizando con feedback positivo.',
      keyElements: [
        'Imagen grande del paso actual con texto claro',
        'Barra de progreso visual',
        'Botón "¡Listo! Siguiente paso"',
        'Animación de confeti o felicitación suave al terminar'
      ],
      navigationActions: [
        {
          trigger: 'Finalizar todos los pasos',
          targetScreenId: 'scr-lista-rutinas',
          targetScreenName: 'Gestor de Rutinas'
        }
      ],
      dataConsumed: ['Pasos de la rutina activa'],
      dataProduced: ['Puntos de logro / Check de rutina']
    },
    {
      id: 'scr-reporte-semanal',
      name: 'Reporte y Patrones Semanales',
      flowId: 'flow-reportes',
      type: 'Dashboard',
      status: 'Pendiente',
      route: '/reportes',
      purpose: 'Visualizar gráficos claros de horarios y días con más incidentes, identificando patrones y desencadenantes recurrentes.',
      keyElements: [
        'Gráfico de barras de incidentes por día de la semana',
        'Desglose porcentual de detonantes más frecuentes',
        'Índice de efectividad de estrategias de calma',
        'Botón "Exportar PDF / Compartir con Terapeuta"'
      ],
      navigationActions: [
        {
          trigger: 'Clic en "Exportar PDF / Compartir"',
          targetScreenId: 'scr-exportar-terapeuta',
          targetScreenName: 'Exportación a Terapeuta'
        }
      ],
      dataConsumed: ['Historial de crisis y rutinas del mes'],
      dataProduced: ['Cálculo de métricas de progreso']
    },
    {
      id: 'scr-exportar-terapeuta',
      name: 'Compartir con Terapeuta o Escuela',
      flowId: 'flow-reportes',
      type: 'Modal',
      status: 'Pendiente',
      route: '/exportar-terapeuta',
      purpose: 'Generar un resumen profesional listo para imprimir o enviar por correo/WhatsApp al equipo multidisciplinario.',
      keyElements: [
        'Selector de rango de fechas',
        'Casillas de verificación de qué datos incluir',
        'Vista previa del informe ejecutivo',
        'Botón "Copiar Enlace Seguro" y "Descargar PDF"'
      ],
      navigationActions: [
        {
          trigger: 'Finalizar o cerrar',
          targetScreenId: 'scr-dashboard',
          targetScreenName: 'Dashboard Principal'
        }
      ],
      dataConsumed: ['Datos del reporte'],
      dataProduced: ['Enlace de informe temporal']
    }
  ]
};
