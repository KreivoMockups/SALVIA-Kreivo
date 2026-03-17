// salvia_esquema.js

const dicPreguntas = {
    // --- SECCIÓN 1: DATOS PERSONALES Y SOCIODEMOGRÁFICOS (Basado en PDF Oficial) ---
    "S_004": { label: "Datos Personales", type: "section", icon: "fa-users", colSpan: 4 },
    "G1_001": { label: "Nombres", type: "text", colSpan: 1 },
    "G1_002": { label: "Apellidos", type: "text", colSpan: 1 },
    "G1_003": { label: "Nombre identitario", type: "text", colSpan: 1 },
    "G1_004": { label: "Fecha de nacimiento", type: "date", colSpan: 1 },
    "G1_005": { label: "Tipo de documento", type: "select", options: ["Seleccione...", 'Cédula De Extranjería','Cédula De Ciudadanía','Pasaporte','Nit','Tarjeta Identidad','Tarjeta Extranjería','Dni - Documento Identidad Extranjero','Nit De Otro País','Registro Civil','Salvoconducto Refugiados Svc','Permiso Especial De Permanencia - Pep','Permiso De Protección Temporal','Sin Información'], colSpan: 2 },
    "G1_006": { label: "Número de documento", type: "number", colSpan: 2 },
    "G1_007": { label: "Dirección de residencia", type: "text", colSpan: 4 },
    "G1_008": { label: "Número de teléfono", type: "number", colSpan: 4 },
    "G1_009": { label: "Identidad de género", type: "select", options: ["Seleccione...", 'No Binaria - Asignado Femenino Al Nacer','No Binaria - Asignado Masculino Al Nacer','Hombre','Mujer','Mujer Transgénero','Hombre Transgénero', 'Otra'], colSpan: 2 },
    "G2_009_A": { label: "¿Cuál otro género?", type: "text", colSpan: 2 },
    "G1_010": { label: "Orientación sexual", type: "select", options: ["Seleccione...", "Heterosexual", "Lesbiana", "Gay", "Bisexual", "Otra"], colSpan: 2 },
    "G1_011": { label: "Ocupación", type: "select", options: ["Seleccione...", 'Estudiante', 'Trabajadora sector salud', 'Trabajadora sector educación', 'Trabajadora sector público / funcionaria pública', 'Lideresa social', 'Periodista', 'Trabajo doméstico remunerado', 'Trabajo doméstico no remunerado', 'Trabajadora sexual', 'Desempleada', 'Jubilada', 'Campesino', 'Otra ¿Cuál?'], colSpan: 2 },
    "G2_011_A": { label: "¿Cuál otra ocupación?", type: "text", colSpan: 2 },
    "G1_012": { label: "Grupo Étnico", type: "select", options: ["Seleccione...", "Ninguno", "Afrocolombiano", "Indígena", "Raizal", "Palenquero", "Otro"], colSpan: 2 },
    "G2_012_A": { label: "¿Cuál otro grupo étnico?", type: "text", colSpan: 2 },

    // Nuevos campos del Formulario PDF
    "G1_013": { label: "¿Requiere de algún ajuste razonable para la atención?", type: "select", options: ["Seleccione...", "Ninguno / No informa", "Adecuaciones de accesibilidad física", "Dispositivos o ayudas técnicas", "Presencia de persona de confianza", "Transporte seguro o acompañamiento", "Intérprete de lengua de señas", "Guía-intérprete"], colSpan: 2 },
    "G1_014": { label: "Estado civil", type: "select", options: ["Seleccione...", "Soltera", "Casada", "Unión libre", "Separada", "Divorciada", "Viuda"], colSpan: 2 },
    "G1_015": { label: "Último nivel de escolaridad", type: "select", options: ["Seleccione...", "Ninguno", "Primaria", "Bachillerato", "Técnico/Tecnólogo", "Profesional", "Postgrado"], colSpan: 2 },
    "G1_016": { label: "Forma de generación de ingresos", type: "select", options: ["Seleccione...", "Empleo formal", "Empleo informal", "Independiente", "Rentas/Pensiones", "Depende de terceros", "Sin ingresos"], colSpan: 2 },
    "G1_017": { label: "Forma de tenencia de la vivienda", type: "select", options: ["Seleccione...", "Propia", "Arrendada", "Familiar", "Invasión / Ocupación de hecho", "Otra"], colSpan: 2 },
    "G1_018": { label: "Estrato de la vivienda", type: "select", options: ["Seleccione...", "1", "2", "3", "4", "5", "6", "Sin estrato / Finca"], colSpan: 2 },
    "G1_019": { label: "¿Tiene personas o animales a cargo?", type: "boolean", colSpan: 2 },
    
    // Condicional Fuerte: Gestación
    "G1_020": { label: "¿Actualmente se encuentra en estado de gestación?", type: "boolean", colSpan: 2 },
    "G2_020_A": { label: "⚠️ ALERTA DE VULNERABILIDAD: Indique meses de gestación", type: "number", colSpan: 2 },

    // --- SECCIÓN 2: DATOS DEL AGRESOR ---
    "S_005": { label: "Datos del Presunto Agresor", type: "section", icon: "fa-user-ninja", colSpan: 4 },
    "A1_001": { label: "Nombres y apellidos", type: "text", colSpan: 2 },
    "A1_002": { label: "Número de teléfono", type: "number", colSpan: 2 },
    "V1_013": { label: "Relación con el agresor", type: "select", options: ["Seleccione...", "Ninguno", "Familiar diferente a la pareja", "Novio", "Jefe", "Familiar", "Expareja", "Amigo", "Familiar no conviviente", "Familiar conviviente", "Pareja permanente/temporal", "Pareja temporal", "Compañero de trabajo", "Vecino", "Compañero de estudios", "Amigo de la pareja", "Otro"], colSpan: 4 },
    "V2_013_A": { label: "¿Cuál otra relación?", type: "text", colSpan: 4 },
    
    // --- SECCIÓN 3: DESCRIPCIÓN DE LOS HECHOS ---
    "S_006": { label: "Descripción de los Hechos", type: "section", icon: "fa-file-lines", colSpan: 4 },
    "V1_014": { label: "Alcance interno", type: "select", options: ["Seleccione...", "Familiar conviviente", "Familiar no conviviente", "Pareja", "Empareja", "Amistad"], colSpan: 2 },
    "V1_015": { label: "Alcance externo", type: "select", options: ["Seleccione...", "Salud", "Institucional", "Laboral", "Reclusión Intramural","Instituciones de protección", "Transporte Público", "Educativo", "Espacio público", "Digital", "Establecimientos de comercio", "Bares", "Restaurantes", "Cibernético", "Político", "Sin relación"], colSpan: 2 },
    "H1_001": { label: "Detalle de lo ocurrido", type: "textarea", colSpan: 4 },
    "H1_002": { label: "¿Ha reportado esta situación previamente?", type: "boolean", colSpan: 2 },
    "H2_002_A": { label: "¿A qué entidad?", type: "select", options: ["Seleccione...", "Comisaría de Familia", "Fiscalía", "Inspección de Policía", "IPS", "Medicina Legal", "No recuerdo", "Otro"], colSpan: 2 },
    "H1_003": { label: "¿El agresor tiene armas?", type: "boolean", colSpan: 2 },
    "H1_004": { label: "¿Existen amenazas de muerte explícitas?", type: "boolean", colSpan: 2 },

    // --- SECCIÓN 4: PLAN DE ACCIÓN Y UBICACIÓN (DIVIPOLA) ---
    "S_007": { label: "Atención y Enrutamiento", type: "section", icon: "fa-sitemap", colSpan: 4 },
    "P1_001": { label: "Plan de acción", type: "select", options: ["Seleccione...", "Enrutamiento interinstitucional", "Activación de la ruta (oficio)", "Acompañamiento psicosocial", "Plan de estabilización", "Medidas de emergencia", "Esquema de autocuidado"], colSpan: 4 },
    
    // Condicional: Si elige "Medidas de emergencia", se activa esto:
    "P2_001_A": { label: "Especifique la medida de emergencia a activar", type: "textarea", colSpan: 4 },

    "P1_002": { label: "Explicación relacionada con la gestión de SALVIA (remisión, uso de datos)", type: "textarea", colSpan: 4 },
    
    // DIVIPOLA: Departamentos de Colombia
    "P1_003": { label: "Departamento (DIVIPOLA)", type: "select", options: ["Seleccione...", "ANTIOQUIA", "ATLÁNTICO", "BOGOTÁ, D.C.", "BOLÍVAR", "BOYACÁ", "CALDAS", "CAQUETÁ", "CAUCA", "CESAR", "CÓRDOBA", "CUNDINAMARCA", "CHOCÓ", "HUILA", "LA GUAJIRA", "MAGDALENA", "META", "NARIÑO", "NORTE DE SANTANDER", "QUINDÍO", "RISARALDA", "SANTANDER", "SUCRE", "TOLIMA", "VALLE DEL CAUCA", "ARAUCA", "CASANARE", "PUTUMAYO", "ARCHIPIÉLAGO DE SAN ANDRÉS", "AMAZONAS", "GUAINÍA", "GUAVIARE", "VAUPÉS", "VICHADA"], colSpan: 2 },
    "P1_004": { label: "Municipio (Código o Nombre)", type: "text", placeholder: "Ej: 05001 MEDELLÍN", colSpan: 2 },

    // --- SECCIÓN 5: TAMIZAJE DE RIESGO LÍNEA 155 (Extraído de Vue.js) ---
    "S_008": { label: "Tamizaje Rápido de Riesgo (Exclusivo Funcionario)", type: "section", icon: "fa-clipboard-list", colSpan: 4 },
    "TR_001": { label: "¿El agresor tiene armas o fácil acceso a ellas?", type: "boolean", colSpan: 2 },
    "TR_002": { label: "¿La víctima ha manifestado pensamientos de autolesión?", type: "boolean", colSpan: 2 },
    "TR_003": { label: "¿Ha sufrido violencia física o sexual anteriormente?", type: "boolean", colSpan: 2 },
    "TR_004": { label: "¿El agresor ha amenazado con atentar contra su vida?", type: "boolean", colSpan: 2 },
    
    // ==========================================
    // --- NUEVO MÓDULO KOBO: SEGUIMIENTO DE CASOS ---
    // ==========================================

    // --- SECCIÓN 6: ATENCIÓN SALVIA ---
    "S_009": { label: "Atención SALVIA", type: "section", icon: "fa-clipboard-user", colSpan: 4 },
    "K1_001": { label: "Formulario a diligenciar (Principal)", type: "multiselect", options: ["Rutas diferenciales", "Barreras", "Seguimiento a Barreras", "Seguimiento de Caso", "Cierre"], colSpan: 4 },
    "K1_002": { label: "Fecha y hora del seguimiento", type: "datetime-local", colSpan: 2 },
    // ... inicio de tu sección Kobo ...
    "K1_003": { label: "ID de la Víctima (Documento)", type: "number", colSpan: 2 },
    "K1_003_A": { label: "Tipo de documento", type: "select", options: ["Seleccione...", "Cédula De Extranjería", "Cédula De Ciudadanía", "Pasaporte", "Nit", "Tarjeta Identidad", "Tarjeta Extranjería", "Dni - Documento Identidad Extranjero", "Nit De Otro País", "Registro Civil", "Salvoconducto Refugiados Svc", "Permiso Especial De Permanencia - Pep", "Permiso De Protección Temporal", "Sin Información"], colSpan: 2 },
    "K1_003_B": { label: "Sexo Asignado al Nacer / Identidad de Género", type: "select", options: ["Seleccione...", "Mujer", "Hombre", "Intersexual", "No Responde"], colSpan: 2 },
    "K1_004": { label: "¿Cuál fue el nivel de riesgo identificado en el Registro?", type: "select", options: ["Seleccione...", "Extremo", "Alto", "Moderado", "Bajo", "Sin Riesgo"], colSpan: 2 },
    "K1_005": { label: "Equipo que realiza la atención", type: "select", options: ["Seleccione...", "Agente Integral", "Riesgo de Feminicidio", "Seguimiento General", "Notificación SALVIA", "Psicosocial", "Masculinidades"], colSpan: 2 },
    "K1_006": { label: "Nombre del Profesional que realiza la atención", type: "text", colSpan: 2 },
    "K1_007": { label: "Efectividad de la llamada", type: "select", options: ["Seleccione...", "Llamada Efectiva - Se logra comunicación", "Llamada No Efectiva - No hay comunicación"], colSpan: 2 },
    "K1_008": { label: "¿Qué número de seguimiento está registrando?", type: "select", options: ["Seleccione...", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], colSpan: 2 },

    // --- SECCIÓN 7: VALORACIÓN DEL RIESGO ---
    "S_010": { label: "Valoración del Riesgo", type: "section", icon: "fa-triangle-exclamation", colSpan: 4 },
    "K1_009": { label: "Respondiente del seguimiento", type: "select", options: ["Seleccione...", "Contacto con la víctima", "Contacto indirecto - Familiar o persona conocida", "Contacto con Institución"], colSpan: 2 },
    "K1_010": { label: "¿Se han presentado nuevos hechos de violencia desde el último seguimiento?", type: "boolean", colSpan: 2 },
    "K2_010_A": { label: "Descripción de nuevos hechos de violencia (Tiempo/Modo/Lugar)", type: "textarea", colSpan: 4 },

    // --- SECCIÓN 8: Rutas diferenciales ---
    "S_011": { label: "Rutas diferenciales", type: "section", icon: "fa-triangle-exclamation", colSpan: 4 },
    "K1_011": { label: "¿En el relato identificó que el enrutamiento o activación se hizo con enfoque diferencial?", type: "boolean", colSpan: 4 },
    "K2_011": { label: "¿Cúal enrutamiento?", type: "multiselect", options: ["Ruta con enfoque LGBTIQ+","Ruta en el Ámbito laboral","Ruta mujeres ASP","Ruta Mujeres Indigenas","Ruta mujeres trans","Ruta para mujer campesina","Ruta para mujeres NARP (Negras,  Afro,  Raizales y Palenqueras)","Ruta personas con discapacidad","Ruta Personas Migrantes","Ninguna","Otra: Cual"], colSpan: 4 },
    "K1_012": { label: "¿Acudió al Sector salud?", type: "boolean", colSpan: 4 },
    "K2_012A": { label: "¿A que institución acudió?", type: "multiselect", options: ["Consultorio médico","EPS","Hospital Privado","Hospital Público","IPS","Puesto de Salud","No sabe / No Responde"], colSpan: 4 },
    "K2_012B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_013": { label: "¿Acudió al Sector justicia?", type: "boolean", colSpan: 4 },
    "K2_013A": { label: "¿A que institución acudió?", type: "multiselect", options: ["CAI-Policía (Comando de Atención Inmediata)", "CAIVAS (Centro de Atención Integral a Víctimas de Violencia Sexual)","Casas de Justicia","CAVIV (Centro de Atención Integral contra la Violencia Intrafamiliar)","Comisaría de Familia", "Estación de Policía", "Fiscalía General de la Nación", "Inspección de Policía", "Instituto Nacional de Medicina Legal", "Jueces Civiles o Promiscuos Municipales", "Jueces de Control de Garantías o Jueces Penales", "Policía Judicial", "Unidad de reacción inmediata", "No sabe / No Responde"], colSpan: 4 },
    "K2_013B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_014": { label: "¿Acudió al Sector protección?", type: "boolean", colSpan: 4 },
    "K2_014A": { label: "¿A que institución acudió?", type: "multiselect", options: ["Comisarías de familia","Defensoría de Familia","Fiscalía General de la Nación","ICBF (Instituto Nacional de Bienestar Familiar)","Inspección de Policía","Jueces Civiles o Promiscuos Municipales","Unidad Nacional de Protección","No sabe / No Responde",], colSpan: 4 },
    "K2_014B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_015": { label: "¿Acudió al Sector defensa?", type: "boolean", colSpan: 4 },
    "K2_015A": { label: "¿A que institución acudió?", type: "multiselect", options: ["Armada Colombiana","Ejercito Nacional","Policia Nacional","No sabe / No Responde",], colSpan: 4 },
    "K2_015B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_016": { label: "¿Acudió al Sector educación?", type: "boolean", colSpan: 4 },
    "K2_016A": { label: "¿A que institución acudió?", type: "multiselect", options: ["Colegio / Escuela","Comité de Convivencia Escolar","Institución de Educación Preescolar","Institución Educativa de Educación Superior","Institución técnica y/o tecnológica","Ministerio de Educación","Secretaría de Educación Departamental / Municipal","SENA","No sabe / No Responde",], colSpan: 4 },
    "K2_016B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_017": { label: "¿Acudió al Sector de Ministerio Público?", type: "boolean", colSpan: 4 },
    "K2_017A": { label: "¿A que institución acudió?", type: "multiselect", options: ["Defensoría del Pueblo","Personería Municipal","Procuraduría General de la Nación (PGN)","No sabe / No Responde",], colSpan: 4 },
    "K2_017B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_018": { label: "¿Acudió al Sector de institución/entidad territorial?", type: "boolean", colSpan: 4 },
    "K2_018A": { label: "¿A que institución acudió?", type: "multiselect", options: ["Alcaldía","Género u Oficina de asuntos relacionados","Gobernación","Línea Púrpura u otras líneas de género territoriales","Secretaría de Gobierno","Secretaría de Integración Social","Secretaría de la Mujer","Secretaría de Salud","No sabe / No Responde",], colSpan: 4 },
    "K2_018B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_019": { label: "¿Acudió al Sector de Orgnización de la sociedad Civil, Comunitaria, internacional de Naciones Unidas?", type: "boolean", colSpan: 4 },
    "K2_019A": { label: "¿A que institución acudió?", type: "multiselect", options: ["Organismo, agencia Internacional de Cooperación y/o agencias ONU","Organización de Base comunitaria (OBC)","Organización de Sociedad Civil (OSC)","No sabe / No Responde",], colSpan: 4 },
    "K2_019B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_020": { label: "¿Acudió a entidades clave y con acciones completarias y/o especializadas frente a la Respuesta en casos de VBG/VPP?", type: "boolean", colSpan: 4 },
    "K2_020A": { label: "¿A que institución acudió?", type: "multiselect", options: ["Casa LGBTIQ+","Centro Intégrate","Entidad/institución Pública","Manzana de Cuidado","Migración Colombia","Ministerio de Trabajo","Ministerio del Interior","Unidad para las Víctimas (UARIV)","No sabe / No Responde",], colSpan: 4 },
    "K2_020B": { label: "Estado del proceso de activación", type: "select", options: ["Seleccione...", "Iniciado", "En Proceso", "Finalizado", "Denegado"], colSpan: 4 },
    "K1_020C": { label: "¿Presenta barreras institucionales en cualquiera de los sectores de la ruta?", type: "boolean", colSpan: 4 },
    

    // --- SECCIÓN 9: BARRERAS ---
    "S_012": { label: "Registro, Categorización e Identificación de Barreras", type: "section", icon: "fa-ban", colSpan: 4 },
    "K1_021": { label: "Barreras en sector salud", type: "multiselect", options: ["No aplica", "Dificultadas de aseguramiento afiliación en salud", "Falta de activación de protocolos para ataque con agentes químicos", "Negación o imposición de procedimiento a personas con diversidad sexual", "Atención en salud no centrada en cosmovisiones y prácticas culturales propias", "Exigencia indebida para realizar procedimientos a persona con discapacidad", "Falta de activación de protocolos para violencia sexual", "Negativa en el acceso a la IVE", "Demoras en asignación de citas y continuidad de tratamientos", "Falla en la calidad del servicio de urgencias", "Negación en los servicios de urgencias", "Otras barreras en salud"], colSpan: 4 },
    "K1_022": { label: "Barreras en sector justicia", type: "multiselect", options: ["No Aplica", "Demoras y dificultades en la valoración medicolegal", "Falta de entrega de información y documentación", "Incumplimiento de órdenes judiciales", "Otras barreras en justicia", "Traslado inadecuado del caso", "Ausencia de representación judicial", "Dilación en la recepción", "Falta de protección en la divulgación de información confidencial", "Medidas preventivas de libertad que ponen en riesgo la vida", "Riesgo de vencimiento de términos", "Cargas probatorias injustificadas o excesivas", "Falta de celeridad en la investigación", "Formalismo excesivo", "Negativa para recibir la denuncia", "Tipificación errónea del delito", "Vacíos legales y definiciones restrictivas"], colSpan: 4 },
    "K1_023": { label: "Barreras en sector protección", type: "multiselect", options: ["No Aplica", "Dilación para obtener la medida de protección definitiva", "Fallas en la valoración del riesgo", "Medidas de protección ineficaces", "Demora o ausencia en la activación de medidas", "Divulgación de información confidencial", "Falta de seguimiento institucional a las órdenes", "Problemas en la notificación y recolección de datos", "Demoras en la emisión de medidas urgentes", "Exigencia de confrontación directa con el agresor", "Incumplimiento de medidas de protección sin consecuencias", "Otras barreras en protección"], colSpan: 4 },
    "K1_024": { label: "Barreras institucionales y del talento humano", type: "multiselect", options: ["No Aplica", "Falta de enfoque de discapacidad y ajustes razonables", "Capacidad institucional limitada", "Desarticulación institucional", "Revictimización", "Inexistencia o desactualización en protocolos", "Falta de modelo de gestión de casos", "Insuficiencia en la orientación en derechos", "Falta de formación y perspectiva de género", "Verificación insuficiente de protocolos y seguimientos", "Falta de interoperabilidad", "Otras barreras Institucionales"], colSpan: 4 },
    "K1_025": { label: "Barreras socioeconómicas", type: "multiselect", options: ["No Aplica", "Costos indirectos", "Falta de autonomía económica", "Pobreza y desigualdad estructural"], colSpan: 4 },
    "K1_026": { label: "Barreras culturales y sociopolíticas", type: "multiselect", options: ["No Aplica", "Estereotipos y tolerancia social a la violencia", "Contextos de violencia armada y control territorial"], colSpan: 4 },
    "K1_027": { label: "Barreras territoriales y geográficas", type: "multiselect", options: ["No Aplica", "Lejanía física de las instituciones", "Infraestructura y conectividad insuficiente", "Ausencia institucional en territorios apartados"], colSpan: 4 },
    "K1_028": { label: "La barrera identificada esta relacionada con", type: "multiselect", options: ["No Aplica", "Ciclo de vida", "Discapacidad física y cognitiva", "Diversidad sexual y de género (OSIGD)", "Lideresas y defensoras", "Personas con diagnósticos de salud mental", "Personas en Actividades sexuales pagas", "Personas en situación de calle", "Personas migrantes y refugiadas", "Personas privadas de la libertad", "Personas víctimas de trata de personas", "Población con origen étnico", "Víctimas del conflicto armado"], colSpan: 4 },
    "K1_029": { label: "Fecha aproximada de la barrera", type: "date", colSpan: 2 },
    "K1_030": { label: "Institución de la barrera", type: "multiselect", options: ["Alcaldia Local", "Alcaldia Municipal", "Colegios", "Comisaría de Familia", "Conjuntos Residenciales", "Consejo Nacional Electoral", "Consejo Superior de la Judicatura", "Defensoria del Pueblo", "Embajada", "Empresa", "Entidad Pública", "EPS", "Fiscalía General de la Nación", "ICBF", "INPEC", "Inspección de Policia", "Instituto Nacional de Medicina Legal", "Ministerio de Defensa", "Ministerio de Educación", "Ministerio de Justicia", "Ministerio de Relaciones Exteriores", "Ministerio de Trabajo", "Ministerio del Interior", "Personeria", "Policía Nacional", "Procuraduría General de la Nación", "Secretaría de Salud", "Secretaria de Seguridad", "Unidad Nacional de Protección", "Unidad para las Víctimas", "Universidad", "Otra (indicar cual en descripción)"], colSpan: 4 },
    "K1_031": { label: "Funcionario/a o dependencia específica", type: "text", colSpan: 2 },
    "K1_032": { label: "Descripción detallada de la barrera", type: "textarea", colSpan: 4 },
    "K1_033": { label: "Gestión de la barrera (Acción realizada)", type: "multiselect", options: ["Orientación y enrutamiento - Llamada", "Gestión administrativa - Llamada", "Activación de ruta interinstitucional", "Notificación institucional", "Escalamiento a organismo de control", "Articulación con enlace territorial"], colSpan: 4 },
    "K1_034": { label: "Describa la gestión de la barrera", type: "textarea", colSpan: 4 },

    // --- SECCIÓN 10: SEGUIMIENTO DE CASO ---
    "S_013": { label: "Seguimiento de Caso", type: "section", icon: "fa-magnifying-glass-chart", colSpan: 4 },
    "K1_035": { label: "Información psicosocial de contexto", type: "textarea", colSpan: 4 },
    "K1_036": { label: "Gestión realizada en el seguimiento", type: "textarea", colSpan: 4 },
    "K1_037": { label: "¿Hubo variación en el nivel de riesgo desde el último seguimiento?", type: "boolean", colSpan: 2 },
    "K2_037_A": { label: "Describa la variación del riesgo (aumento, disminución, señales de alerta)", type: "textarea", colSpan: 4 },
    "K1_038": { label: "¿Durante la atención se han generado necesidades inmediatas que requieran derivación a los equipos SALVIA?", type: "boolean", colSpan: 2 },
    "K2_038_A": { label: "¿Cuáles equipos?", type: "select", options: ["Seleccione...", "Medidas de Emergencia", "Atención Psicosocial", "Estabilización"], colSpan: 2 },
    "K2_038_B": { label: "Si ajustó el Plan de Acción, descríbalo (o escriba N/A)", type: "textarea", colSpan: 4 },

    // --- SECCIÓN 11: EMPALME ---
    "S_014": { label: "Empalme de Seguimiento", type: "section", icon: "fa-handshake", colSpan: 4 },
    "K1_039": { label: "¿Se realiza empalme del seguimiento?", type: "boolean", colSpan: 2 },
    "K2_039_A": { label: "¿Este seguimiento es de riesgo inminente?", type: "select", options: ["Seleccione...", "No", "Sí. Pero NO tiene registro y requiere seguimiento en 4 horas", "Sí. Pero NO tiene registro y requiere seguimiento en 8 horas", "Sí. Se hizo registro y requiere seguimiento en 4 horas", "Sí. Se hizo registro y requiere seguimiento en 8 horas"], colSpan: 2 },
    "K2_039_B": { label: "Fecha y Hora de la Acción a Realizar", type: "datetime-local", colSpan: 2 },
    "K2_039_C": { label: "Equipo que realiza la atención (Empalme)", type: "select", options: ["Seleccione...", "Registro de Feminicidio", "Seguimiento general", "Agente integral"], colSpan: 2 },
    "K2_039_D": { label: "Nombre del Profesional para EMPALME", type: "text", colSpan: 2 },

    // NODO HIJO: Solo aparece si hay amenaza de muerte (Riesgo Alto)
    "TR_005": { label: "⚠️ ALERTA: ¿El agresor ha amenazado a familiares o cercanos?", type: "boolean", colSpan: 2 },
    
    "TR_006": { label: "¿Comparten espacios comunes (vivienda, trabajo, estudio)?", type: "boolean", colSpan: 2 },
    "TR_007": { label: "¿Existe una relación de jerarquía o subordinación?", type: "boolean", colSpan: 2 },
    
    // NODO HIJO: Solo aparece si hay jerarquía (Riesgo Medio/Alto)
    "TR_008": { label: "⚠️ ALERTA: ¿El agresor usó su posición de autoridad para agredirla?", type: "boolean", colSpan: 2 }
};

const arbolRelaciones = {
    // 1. RAÍCES PARA LA VÍCTIMA (Secciones 1, 2 y 3 básicas)
    "raices_victima": [
        "S_004", "G1_001", "G1_002", "G1_003", "G1_004", "G1_005", "G1_006", "G1_007", "G1_008", "G1_009", "G1_010", "G1_011", "G1_012",
        "S_005", "A1_001", "A1_002", "V1_013",
        "S_006", "V1_014", "V1_015", "H1_001", "H1_002", "H1_003", "H1_004"
    ],

    // 2. RAÍCES PARA EL TERCERO / FAMILIAR (Solo Sección 1 y Descripción general)
    "raices_tercero": [
        "S_004", "G1_001", "G1_002", "G1_003", "G1_004", "G1_005", "G1_006", "G1_007", "G1_008", "G1_009", "G1_010", "G1_011", "G1_012",
        "S_006", "H1_001" 
    ],

    // 3. RAÍCES PARA EL FUNCIONARIO (Todo el formulario completo)
    "raices_funcionario": [
        "S_004", "G1_001", "G1_002", "G1_003", "G1_004", "G1_005", "G1_006", "G1_007", "G1_008", "G1_009", "G1_010", "G1_011", "G1_012", "G1_013", "G1_014", "G1_015", "G1_016", "G1_017", "G1_018", "G1_019", "G1_020",
        "S_005", "A1_001", "A1_002", "V1_013",
        "S_006", "V1_014", "V1_015", "H1_001", "H1_002", "H1_003", "H1_004",
        "S_007", "P1_001", "P1_002", "P1_003", "P1_004",
        "S_008", "TR_001", "TR_002", "TR_003", "TR_004", "TR_006", "TR_007"
    ],

    // 4. RAÍCES PARA EL FORMULARIO KOBO (El menú principal del formulario)
    "raices_kobo": [
        "S_009", "K1_001", "K1_002", "K1_003", "K1_003_A", "K1_003_B", "K1_004", "K1_005", "K1_006", "K1_007", "K1_008",
        "S_010", "K1_009", "K1_010", 
        "S_011", "K1_011", "K1_012", "K1_013", "K1_014", "K1_015", "K1_016", "K1_017", "K1_018", "K1_019", "K1_020","K1_020C",
        "S_012", "K1_021", "K1_022", "K1_023", "K1_024", "K1_025", "K1_026", "K1_027", "K1_028", "K1_029", "K1_030", "K1_031", "K1_032", "K1_033", "K1_034",
        "S_013", "K1_035", "K1_036", "K1_037", "K1_038",
        "S_014", "K1_039"
    ],
    
    // REGLAS CONDICIONALES EN CASCADA (Se mantienen igual)
    "G1_009": { "Otra": ["G2_009_A"] },
    "G1_011": { "Otra ¿Cuál?": ["G2_011_A"] },
    "G1_012": { "Otro": ["G2_012_A"] },
    "V1_013": { "Otro": ["V2_013_A"] },
    "H1_002": { "true": ["H2_002_A"] },
    "G1_020": { "true": ["G2_020_A"] },
    "P1_001": { "Medidas de emergencia": ["P2_001_A"] },
    "TR_004": { "true": ["TR_005"] },
    "TR_007": { "true": ["TR_008"] },
    
    // NUEVAS REGLAS CONDICIONALES PARA KOBO (La Magia del DAG)
    // Si hay nuevos hechos de violencia -> Abre descripción
    "K1_010": { "true": ["K2_010_A"] },
    "K1_011": { "true": ["K2_011"] },
    "K1_012": { "true": ["K2_012A", "K2_012B"] },
    "K1_013": { "true": ["K2_013A", "K2_013B"] },
    "K1_014": { "true": ["K2_014A", "K2_014B"] },
    "K1_015": { "true": ["K2_015A", "K2_015B"] },
    "K1_016": { "true": ["K2_016A", "K2_016B"] },
    "K1_017": { "true": ["K2_017A", "K2_017B"] },
    "K1_018": { "true": ["K2_018A", "K2_018B"] },
    "K1_019": { "true": ["K2_019A", "K2_019B"] },
    "K1_020": { "true": ["K2_020A", "K2_020B"] },

    // Si hubo variación de riesgo -> Abre descripción
    "K1_037": { "true": ["K2_037_A"] },
    
    // Si hay necesidades de derivación -> Abre selección de equipo y campo de texto
    "K1_038": { "true": ["K2_038_A", "K2_038_B"] },
    
    // Si hay empalme -> Abre el bloque completo de empalme
    "K1_039": { "true": ["K2_039_A", "K2_039_B", "K2_039_C", "K2_039_D"] }
};