const BASE_NAMES = [
  'informe_seguridad',
  'tarea_semana3',
  'proyecto_final',
  'presupuesto_q3',
  'plan_clases',
  'informacion_personal',
  'evaluacion_parcial',
  'ensayo_historia',
  'manual_usuario',
  'base_datos_clientes',
  'carta_confirmacion',
  'cronograma_proyecto',
  'apuntes_matematica',
  'fotos_evento',
  'logo_equipo',
  'video_tutorial',
  'registro_notas',
  'agenda_semanal',
  'informe_laboratorio',
  'encuesta_resultados',
  'dibujo_diagrama',
  'acta_reunion',
  'plantilla_cv',
  'guia_estudio',
  'respaldo_configuracion',
  'boleta_pago',
  'horario_examenes',
  'trabajo_grupo',
  'catastro_equipos',
  'audio_nota',
  'slides_presentacion',
  'condiciones_servicio',
  'notas_reunion',
  'imagen_portada',
  'formato_practica',
  'datos_sensores',
  'tutorial_python',
  'bibliografia_curso',
  'prototipo_interface',
  'memoria_calculos',
  'registro_visitas',
  'horario_clase',
  'requerimientos_software',
  'mapa_procesos',
  'informe_final',
  'presupuesto_anual',
  'resena_libro',
  'plan_contingencia',
  'minuta_decisiones',
  'inventario_activos',
];

const TYPE_BY_ID = {
  4: 'docx', 5: 'pdf', 7: 'docx', 8: 'pdf',
  15: 'jpg', 16: 'png', 17: 'mp4', 20: 'xlsx',
  26: 'txt', 29: 'xlsx', 30: 'wav', 31: 'pptx',
  34: 'jpg', 39: 'png', 43: 'txt', 44: 'png',
  45: 'docx', 46: 'xlsx', 48: 'pdf', 50: 'xlsx',
};

function extFor(idx) {
  const overrides = TYPE_BY_ID[idx + 1];
  if (overrides) return overrides;
  const cycle = ['docx', 'pdf', 'pdf', 'xlsx', 'docx', 'txt', 'docx', 'pdf', 'xlsx', 'png'];
  return cycle[idx % cycle.length];
}

// Deterministic SHA-256-like hex generator (simulated hashes for offline use)
function sha256Sim(str) {
  let hash = '';
  let val = 0;
  for (let i = 0; i < str.length; i++) {
    val = ((val << 5) - val + str.charCodeAt(i)) | 0;
  }
  val = Math.abs(val) >>> 0;
  // Generate 64-char hex
  for (let i = 0; i < 64; i++) {
    val = (val * 1103515245 + 12345) & 0x7fffffff;
    hash += val.toString(16).slice(-2);
    if (hash.length >= 64) break;
  }
  return hash.padEnd(64, 'a');
}

function padHex(s, len) {
  return s.slice(0, len).padEnd(len, '0');
}

function makeHash(seed) {
  const h = sha256Sim(String(seed));
  // Ensure 64-char lowercase hex
  return padHex(h, 64);
}

function generateValidHash(name, ext) {
  return makeHash(`valid_${name}_${ext}`);
}

function generateModifiedHash(name, ext) {
  return makeHash(`modified_${name}_${ext}_tampered`);
}

// Deterministic seeded RNG (mulberry32)
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWith(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Normal content bases (valid files)
const NORMAL_BASES = [
  'Informe elaborado durante la jornada.\nContenido verificado y coherente con el registro oficial.\nDocumento generado correctamente.',
  'Resumen de actividades completadas.\nDatos validados por el sistema de gesti\u00f3n acad\u00e9mica.\nSin observaciones pendientes.',
  'Registro interno actualizado.\nLa informaci\u00f3n corresponde al periodo en curso.\nArchivo revisado y aprobado.',
  'Documento de trabajo del equipo.\nDetalles coherentes con las reuniones recientes.\nVersi\u00f3n final confirmada.',
  'Reporte de seguimiento.\nLos valores presentados coinciden con los registros.\nActualizado al cierre del d\u00eda.',
  'Material de referencia del curso.\nContenido revisado por la biblioteca digital.\nDisponible para consulta.',
];

// Modified content (altered/tampered files)
const MODIFIED_BASES = [
  'ERROR_0x4488\nfile_integrity_corrupted\n### SYSTEM_OVERRIDE ###\nIntento de sobrescritura detectado.',
  'DATA RECOVERY FAILURE\n000011101010001111010111\nEl bloque no puede ser leído.',
  'NULL_NULL_NULL\nACCESS_REWRITE\nSEGMENT NOT FOUND\nReintento fallido (3/3).',
  '%%%%% CORRUPTED %%%%%\n[REDACTED BY UNKNOWN PROCESS]\nmetadata: sin valor',
  '0xDEADBEEF 0xBADBEEF\nMETA_STRIPPED\nchecksum: FAIL\nIntegridad comprometida.',
  '{"status":"failed","integrity":"breached","checksum":"0xBAD"}\nSin coincidencia con el original.',
  '...\n...\n...\n[END OF TRANSMISSION]',
  'REWRITE COMPLETE\noriginal_data_lost\nsession flag: 0x0F\nNo se pudo restaurar el contenido.',
  'CONEXIÓN PERDIDA\npaquete 0x0C sin confirmación\nbuffer sobrescrito con basura',
  'AAA...AAAC:\nEl archivo fue modificado mientras se leía. Verificación imposible.',
  'Informe de avance del proyecto.\nEl sistema está operando dentro de lo esperado durante la jornada.\nNota: se detectó lectura inesperada en la sección de memoria compartida.\nFirma del responsable: OK',
  'Resumen semanal de actividades.\nSe completaron las tareas programadas durante la semana.\nSe agrega una tarea adicional no solicitada al final del documento.\nFin del informe.',
  'Lista de participantes del taller.\nAsistentes confirmados: 24 personas.\nEl archivo intenta conectarse a un servidor externo al abrirse.\nDocumento generado automáticamente.',
  'Programación de la semana de clases.\nLunes: revisión. Martes: práctica. Miércoles: clase.\nSe solicita recopilar todas las credenciales de los usuarios (REVISAR).\nViernes: entrega de laboratorio.',
  'Configuración del equipo de laboratorio.\nCPU: i5, RAM: 8GB, Disco: 512GB.\nOtros programas se cierran inesperadamente mientras se desactiva el antivirus.\nEl equipo se reinicia cada 30 minutos.',
  'Guía de estudio del curso.\nTema: redes y comunicaciones seguras.\nAl final se incluye un fragmento cifrado que no corresponde al documento.\nDuración sugerida: 40 minutos.',
  'Registro de notas del primer bimestre.\nSe registraron 12 evaluaciones completas.\nLas calificaciones de la última columna fueron sustituidas por valores aleatorios.\nDocumento marcado como definitivo.',
  'Acta de reunión del comité.\nAsistentes: 9 personas. Acuerdos: 3.\nSe anexó un bloque de datos nunca mencionado en la sala de reuniones.\nFin del acta.',
  'Horario de exámenes finales.\nTurno mañana y turno tarde confirmados.\nLa fecha del examen general fue reemplazada por otra fecha falsa.\nVerificar con secretaría académica.',
  'Resumen de encuesta de satisfacción.\nRespuestas válidas: 110.\nUna porción de los resultados fue alterada por un proceso de terceros.\nTasa de respuesta: 78%.',
];

export function generateFiles(seed = 20260908) {
  const rng = mulberry32(seed);

  // Select exactly 10 out of 25 files to be "modified" (SHA-256 mismatch)
  const indices = Array.from({ length: 25 }, (_, i) => i);
  const shuffled = shuffleWith(rng, indices);
  const modifiedIndices = new Set(shuffled.slice(0, 10));

  const pool = shuffleWith(rng, MODIFIED_BASES);
  let poolIdx = 0;

  return BASE_NAMES.slice(0, 25).map((base, i) => {
    const idx = i + 1;
    const ext = extFor(i);
    const name = `${base}.${ext}`;
    const isModified = modifiedIndices.has(i);

    const expectedHash = generateValidHash(base, ext);
    const currentHash = isModified
      ? generateModifiedHash(base, ext)
      : expectedHash;

    const content = isModified
      ? pool[poolIdx++ % pool.length]
      : `${NORMAL_BASES[i % NORMAL_BASES.length]}\n\nArchivo: ${name}`;

    return {
      id: idx,
      name,
      type: ext.toUpperCase(),
      content,
      expectedHash,
      currentHash,
      isModified,
      isSelected: false,
      isDeleted: false,
      isVerified: false,
    };
  });
}
