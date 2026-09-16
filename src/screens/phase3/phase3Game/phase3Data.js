export const PHASE3 = {
  totalFiles: 75,
  recovered: 50,
  modified: 20,
  deleted: 5,

  activity1: {
    title: 'REGISTROS DE EVENTOS',
    points: 4,
    question:
      'Al analizar los registros del Visor de Eventos, encuentras un "Inicio de sesión" de tipo ÉXITO con una IP de origen externa no reconocida. ¿Qué interpretación es la más adecuada?',
    options: [
      'Se trata de un inicio de sesión legítimo de un usuario externo autorizado; no se requiere acción adicional.',
      'Es una evidencia que sugiere posible acceso no autorizado y debe investigarse para confirmar si se trata de un compromiso de credenciales.',
      'El registro no es relevante porque indica "ÉXITO", por lo que el acceso fue autorizado.',
      'El sistema generó un registro incorrecto y debe eliminarse para evitar confusiones en el análisis.',
    ],
    correctIndex: 1,
    feedback: {
      correct:
        'Correcto. Un inicio de sesión con IP externa no reconocida es una pista que requiere investigación para determinar si se trata de un acceso legítimo o un compromiso de credenciales.',
      incorrect:
        'Recuerda: un registro de "ÉXITO" con IP desconocida es una pista que debe investigarse, no un dato que confirme autorización ni un error del sistema.',
    },
  },

  activity1Events: [
    { id: 1, user: 'Admin_Sistema', time: '2026-09-15 08:01:12', type: 'Inicio de sesión', source: '192.168.1.10', result: 'ÉXITO', eventid: 4624 },
    { id: 2, user: 'Admin_Sistema', time: '2026-09-15 08:15:33', type: 'Acceso a archivo', source: '192.168.1.10', result: 'ÉXITO', eventid: 4656 },
    { id: 3, user: 'Admin_Sistema', time: '2026-09-15 09:22:07', type: 'Inicio de sesión', source: '192.168.1.10', result: 'ÉXITO', eventid: 4624 },
    { id: 4, user: 'Servicio_Avanzado', time: '2026-09-15 10:47:55', type: 'Inicio de sesión', source: '203.0.113.42', result: 'ÉXITO', eventid: 4624 },
    { id: 5, user: 'Servicio_Avanzado', time: '2026-09-15 10:48:21', type: 'Acceso a archivo', source: '203.0.113.42', result: 'ÉXITO', eventid: 4656 },
    { id: 6, user: 'Servicio_Avanzado', time: '2026-09-15 10:52:14', type: 'Modificación de registro', source: '203.0.113.42', result: 'ÉXITO', eventid: 4657 },
    { id: 7, user: 'Admin_Sistema', time: '2026-09-15 11:05:00', type: 'Inicio de sesión', source: '192.168.1.10', result: 'ÉXITO', eventid: 4624 },
    { id: 8, user: 'Invitado_Guest', time: '2026-09-15 11:30:45', type: 'Inicio de sesión', source: '10.0.0.55', result: 'FALLO', eventid: 4625 },
    { id: 9, user: 'Admin_Sistema', time: '2026-09-15 12:00:00', type: 'Inicio de sesión', source: '192.168.1.10', result: 'ÉXITO', eventid: 4624 },
    { id: 10, user: 'Invitado_Guest', time: '2026-09-15 12:01:10', type: 'Inicio de sesión', source: '10.0.0.55', result: 'FALLO', eventid: 4625 },
    { id: 11, user: 'Servicio_Avanzado', time: '2026-09-15 12:15:33', type: 'Creación de archivo', source: '203.0.113.42', result: 'ÉXITO', eventid: 4656 },
    { id: 12, user: 'Admin_Sistema', time: '2026-09-15 12:30:00', type: 'Inicio de sesión', source: '192.168.1.10', result: 'ÉXITO', eventid: 4624 },
    { id: 13, user: 'Servicio_Avanzado', time: '2026-09-15 13:02:48', type: 'Modificación de registro', source: '203.0.113.42', result: 'ÉXITO', eventid: 4657 },
    { id: 14, user: 'Admin_Sistema', time: '2026-09-15 13:15:22', type: 'Acceso a archivo', source: '192.168.1.10', result: 'ÉXITO', eventid: 4656 },
    { id: 15, user: 'Invitado_Guest', time: '2026-09-15 13:45:09', type: 'Inicio de sesión', source: '10.0.0.55', result: 'FALLO', eventid: 4625 },
    { id: 16, user: 'Admin_Sistema', time: '2026-09-15 14:00:00', type: 'Inicio de sesión', source: '192.168.1.10', result: 'ÉXITO', eventid: 4624 },
    { id: 17, user: 'Servicio_Avanzado', time: '2026-09-15 14:22:17', type: 'Acceso a archivo', source: '203.0.113.42', result: 'ÉXITO', eventid: 4656 },
    { id: 18, user: 'Admin_Sistema', time: '2026-09-15 14:30:00', type: 'Inicio de sesión', source: '192.168.1.10', result: 'ÉXITO', eventid: 4624 },
    { id: 19, user: 'Invitado_Guest', time: '2026-09-15 15:10:33', type: 'Inicio de sesión', source: '10.0.0.55', result: 'FALLO', eventid: 4625 },
    { id: 20, user: 'Admin_Sistema', time: '2026-09-15 15:30:00', type: 'Inicio de sesión', source: '192.168.1.10', result: 'ÉXITO', eventid: 4624 },
  ],

  activity2: {
    title: 'VERIFICACIÓN DE INTEGRIDAD',
    total: 25,
    targetFiles: 10,
    corrupted: 10,
    normal: 15,
    maxScore: 14,
    perCorrect: 1,
    perWrong: 0.5,
  },

  activity3: {
    title: 'RECUPERACIÓN DE ARCHIVOS ELIMINADOS',
    points: 2,
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
