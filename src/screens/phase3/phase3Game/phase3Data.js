export const PHASE3 = {
  totalFiles: 75,
  recovered: 50,
  modified: 20,
  deleted: 5,

  activity1: {
    title: 'REGISTROS DE EVENTOS',
    points: 4,
    question: 'De estos eventos que tenemos, ¿cuáles requieren mayor atención?',
    options: [
      'Varios intentos de acceso fallidos',
      'Error de accesos a programas',
      'Cargas interrumpidas de Chrome',
      'Tiempos de inicio y actualización del sistema',
      'Problemas de logs de actualización de tiempo',
    ],
    correctIndex: 0,
    feedback: {
      correct:
        'Los múltiples intentos de acceso fallidos requieren mayor atención porque representan un patrón relacionado con autenticación. Sin embargo, un registro de este tipo es una señal que debe investigarse y no una prueba definitiva de que el equipo o la cuenta hayan sido comprometidos.',
      incorrect:
        'Observa el patrón completo de los registros. Los intentos de acceso fallidos que se repiten suelen ser la señal que requiere mayor atención.',
    },
  },

  activity1Events: [
    { eventid: 4624, user: 'Admin_Sistema', time: '2026-09-15 07:59:12', type: 'Inicio de sesión', source: '192.168.1.10', sourceType: 'SEGURIDAD', status: 'INFO' },
    { eventid: 4624, user: 'Admin_Sistema', time: '2026-09-15 09:22:07', type: 'Inicio de sesión', source: '192.168.1.10', sourceType: 'SEGURIDAD', status: 'INFO' },
    { eventid: 4624, user: 'Admin_Sistema', time: '2026-09-15 11:05:00', type: 'Inicio de sesión', source: '192.168.1.10', sourceType: 'SEGURIDAD', status: 'INFO' },
    { eventid: 4624, user: 'Admin_Sistema', time: '2026-09-15 12:00:00', type: 'Inicio de sesión', source: '192.168.1.10', sourceType: 'SEGURIDAD', status: 'INFO' },
    { eventid: 4624, user: 'Admin_Sistema', time: '2026-09-15 14:30:00', type: 'Inicio de sesión', source: '192.168.1.10', sourceType: 'SEGURIDAD', status: 'INFO' },
    { eventid: 4625, user: 'Invitado_Guest', time: '2026-09-15 00:12:21', type: 'Intento de acceso fallido', source: '10.0.0.55', sourceType: 'SEGURIDAD', status: 'ERROR' },
    { eventid: 4625, user: 'Invitado_Guest', time: '2026-09-15 00:33:40', type: 'Intento de acceso fallido', source: '10.0.0.55', sourceType: 'SEGURIDAD', status: 'ERROR' },
    { eventid: 4625, user: 'Invitado_Guest', time: '2026-09-15 01:05:12', type: 'Intento de acceso fallido', source: '10.0.0.55', sourceType: 'SEGURIDAD', status: 'ERROR' },
    { eventid: 4625, user: 'Usuario_Temporal', time: '2026-09-15 01:58:47', type: 'Intento de acceso fallido', source: '10.0.0.61', sourceType: 'SEGURIDAD', status: 'ERROR' },
    { eventid: 4625, user: 'Usuario_Temporal', time: '2026-09-15 02:20:05', type: 'Intento de acceso fallido', source: '10.0.0.61', sourceType: 'SEGURIDAD', status: 'ERROR' },
    { eventid: 4625, user: 'Invitado_Guest', time: '2026-09-15 02:41:33', type: 'Intento de acceso fallido', source: '10.0.0.55', sourceType: 'SEGURIDAD', status: 'ERROR' },
    { eventid: 4625, user: 'Usuario_Temporal', time: '2026-09-15 02:52:18', type: 'Intento de acceso fallido', source: '10.0.0.61', sourceType: 'SEGURIDAD', status: 'ERROR' },
    { eventid: 1000, user: 'Admin_Sistema', time: '2026-09-15 09:47:15', type: 'Error al abrir documento', source: 'Winword.exe', sourceType: 'APLICACIONES', status: 'ERROR' },
    { eventid: 1000, user: 'Admin_Sistema', time: '2026-09-15 10:13:44', type: 'Error de acceso a programa', source: 'Excel.exe', sourceType: 'APLICACIONES', status: 'ERROR' },
    { eventid: 1002, user: 'Admin_Sistema', time: '2026-09-15 13:26:58', type: 'Error al abrir documento', source: 'Powerpnt.exe', sourceType: 'APLICACIONES', status: 'ERROR' },
    { eventid: 1000, user: 'Servicio_Avanzado', time: '2026-09-15 15:02:33', type: 'Error de acceso a programa', source: 'Winword.exe', sourceType: 'APLICACIONES', status: 'ERROR' },
    { eventid: 27, user: 'Admin_Sistema', time: '2026-09-15 10:41:20', type: 'Carga interrumpida', source: 'chrome.exe', sourceType: 'APLICACIONES', status: 'ADVERTENCIA' },
    { eventid: 27, user: 'Admin_Sistema', time: '2026-09-15 11:52:03', type: 'Carga interrumpida', source: 'chrome.exe', sourceType: 'APLICACIONES', status: 'ADVERTENCIA' },
    { eventid: 27, user: 'Servicio_Avanzado', time: '2026-09-15 14:05:49', type: 'Conexión perdida durante carga', source: 'chrome.exe', sourceType: 'APLICACIONES', status: 'ADVERTENCIA' },
    { eventid: 27, user: 'Admin_Sistema', time: '2026-09-15 15:22:11', type: 'Carga interrumpida', source: 'chrome.exe', sourceType: 'APLICACIONES', status: 'ADVERTENCIA' },
    { eventid: 6005, user: 'Sistema', time: '2026-09-15 07:58:40', type: 'Inicio del sistema', source: 'Kernel-General', sourceType: 'SISTEMA', status: 'INFO' },
    { eventid: 19, user: 'Sistema', time: '2026-09-15 12:18:30', type: 'Actualización del sistema', source: 'Windows Update', sourceType: 'SISTEMA', status: 'INFO' },
    { eventid: 1074, user: 'Sistema', time: '2026-09-15 13:40:05', type: 'Apagado programado', source: 'User32', sourceType: 'SISTEMA', status: 'INFO' },
    { eventid: 19, user: 'Sistema', time: '2026-09-15 15:01:22', type: 'Actualización del sistema', source: 'Windows Update', sourceType: 'SISTEMA', status: 'INFO' },
    { eventid: 37, user: 'Sistema', time: '2026-09-15 08:05:12', type: 'Sincronización de hora', source: 'W32Time', sourceType: 'SISTEMA', status: 'INFO' },
    { eventid: 34, user: 'Sistema', time: '2026-09-15 11:30:00', type: 'Solicitud de actualización de hora', source: 'W32Time', sourceType: 'SISTEMA', status: 'INFO' },
    { eventid: 37, user: 'Sistema', time: '2026-09-15 13:58:26', type: 'Sincronización de hora', source: 'W32Time', sourceType: 'SISTEMA', status: 'INFO' },
    { eventid: 34, user: 'Sistema', time: '2026-09-15 15:10:44', type: 'Solicitud de actualización de hora', source: 'W32Time', sourceType: 'SISTEMA', status: 'INFO' },
  ],

  activity2: {
    title: 'VERIFICACIÓN DE INTEGRIDAD',
    total: 25,
    targetFiles: 10,
    corrupted: 10,
    normal: 15,
    maxScore: 10,
    perCorrect: 1,
    perWrong: 0.5,
    mission:
      'Se recuperaron 25 archivos, pero es necesario revisarlos para determinar cuáles conservan su integridad. Compara sus valores SHA-256 antes de decidir qué hacer con cada archivo.',
    missionNote:
      'Algunos archivos pueden tener nombres o contenidos sospechosos, pero su apariencia no demuestra que hayan sido modificados. Para determinar su integridad debes comparar su hash SHA-256.',
  },

  activity3: {
    title: 'RECUPERACIÓN DE ARCHIVOS ELIMINADOS',
    points: 6,
    files: [
      'ProyectoFinalSeguridad.docx',
      'EvidenciasSeguridad.pdf',
      'InformeIncidente.docx',
      'TareasSemana3.pdf',
      'ConfiguracionPC.txt',
    ],
    situationHeader: 'ARCHIVOS ELIMINADOS DURANTE EL INCIDENTE',
    situationText:
      'Se eliminaron 5 archivos del sistema durante un incidente de seguridad. Dispones de copias de seguridad en múltiples orígenes con diferentes marcas de tiempo. Analiza los registros del incidente antes de elegir.',
    options: [
      'Recuperar desde Drive (copia más reciente: 14:30)',
      'Recuperar desde USB (copia: 10:15)',
      'Utilizar la copia de seguridad de las 12:00 a. m. de anoche',
      'Restaurar desde el punto de restauración del sistema (copia: 06:00)',
      'Dejar los archivos como están y darlos por perdidos',
    ],
    correctIndex: 2,
    explanation:
      'La copia de seguridad de las 12:00 a. m. de anoche es la más reciente disponible antes del incidente. Las copias más recientes (14:30, 10:15) fueron creadas durante el incidente y podrían estar comprometidas. La copia de las 06:00 es válida pero anterior al trabajo del día.',
  },
};

export const SCORE_MESSAGES = [
  {
    min: 14,
    title: '¡Excelente trabajo!',
    message:
      'Demostraste un buen criterio para analizar y recuperar información después de un incidente de seguridad.',
  },
  {
    min: 11,
    title: '¡Muy buen trabajo!',
    message:
      'Comprendiste la mayoría de las decisiones importantes. Un poco más de atención en la verificación te permitirá mejorar.',
  },
  {
    min: 8,
    title: '¡Buen trabajo!',
    message:
      'Lograste resolver gran parte del incidente. Revisa tus decisiones para fortalecer tus conocimientos de seguridad digital.',
  },
  {
    min: 5,
    title: '¡Aprobaste!',
    message:
      'Conseguiste completar la simulación, pero todavía hay decisiones de seguridad que puedes mejorar.',
  },
  {
    min: 0,
    title: 'Simulación completada',
    message:
      'Esta vez el incidente fue difícil de controlar. Revisa las decisiones tomadas y vuelve a intentarlo para fortalecer tu criterio de seguridad.',
  },
];

export function scoreMessageFor(score) {
  return SCORE_MESSAGES.find((m) => score >= m.min) || SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
}

export function scoreActivity1(index) {
  return Number(index) === PHASE3.activity1.correctIndex ? PHASE3.activity1.points : 0;
}

export function scoreActivity3(index) {
  return Number(index) === PHASE3.activity3.correctIndex ? PHASE3.activity3.points : 0;
}

export function clampActivity2(raw) {
  return Math.max(0, Math.min(PHASE3.activity2.maxScore, raw));
}

export function computeFinalScore(a1, a2, a3) {
  return Math.max(
    0,
    Math.min(20, Number(a1 || 0) + Number(a2 || 0) + Number(a3 || 0))
  );
}

export function formatScore(score) {
  const n = Number(score || 0);
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}
