export interface ProductArchitectureData {
  // 1. Solución y Producto
  solucion_producto: {
    nombre_del_producto: string;
    descripcion_funcional: string;
    mecanismo_entregado: string;
  };
  // 2. Framework / Método
  framework_metodo: {
    nombre_del_metodo: string;
    etapas_y_secuencia: string;
    resultado_de_cada_etapa: string;
    relacion_con_el_mecanismo_unico: string;
  };
  // 3. Funcionalidades
  funcionalidades: {
    funcionalidades_job_resultado_prioridad: string;
  };
  // 4. Roadmap
  roadmap: {
    roadmap_etapa_objetivo_accion_barrera: string;
  };
  // 5. Journeys y Activación
  journeys_activacion: {
    journeys_clave: string;
    accion_inicial: string;
    quick_win: string;
    tiempo_hasta_el_valor: string;
  };
  // 6. Requisitos Técnicos
  requisitos_tecnicos: {
    requisitos_tecnicos: string;
  };
}

export const initialProductArchitectureData: ProductArchitectureData = {
  solucion_producto: {
    nombre_del_producto: '',
    descripcion_funcional: '',
    mecanismo_entregado: '',
  },
  framework_metodo: {
    nombre_del_metodo: '',
    etapas_y_secuencia: '',
    resultado_de_cada_etapa: '',
    relacion_con_el_mecanismo_unico: '',
  },
  funcionalidades: {
    funcionalidades_job_resultado_prioridad: '',
  },
  roadmap: {
    roadmap_etapa_objetivo_accion_barrera: '',
  },
  journeys_activacion: {
    journeys_clave: '',
    accion_inicial: '',
    quick_win: '',
    tiempo_hasta_el_valor: '',
  },
  requisitos_tecnicos: {
    requisitos_tecnicos: '',
  },
};
