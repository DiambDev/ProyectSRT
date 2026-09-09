export const PHASE3 = {
  totalFiles: 75,
  recovered: 50,
  modified: 20,
  deleted: 5,

  activity1: {
    title: 'ARCHIVOS RECUPERADOS',
    points: 4,
    question:
      'Después de recuperar correctamente los archivos, ¿qué acción es más importante antes de considerar que el sistema está completamente seguro?',
    options: [
      'Verificar la integridad y el estado de los archivos recuperados antes de utilizarlos nuevamente.',
      'Abrir inmediatamente todos los archivos recuperados para comprobar que funcionan.',
      'Eliminar cualquier archivo que haya sido recuperado recientemente.',
      'Desactivar las medidas de seguridad para evitar que la recuperación vuelva a modificarlos.',
    ],
    correctIndex: 0,
    feedback: {
      correct:
        'Correcto. Recuperar información no garantiza que esté íntegra; es indispensable verificar la integridad y el estado antes de volver a usarla.',
      incorrect:
        'Recuerda: recuperar información no confirma que sea correcta. Antes de reutilizarla debes verificar su integridad y su estado.',
    },
  },

  activity2: {
    title: 'ARCHIVOS MODIFICADOS',
    total: 50,
    targetFiles: 20,
    corrupted: 20,
    normal: 30,
    maxScore: 14,
    perCorrect: 1,
    perWrong: 0.5,
  },

  activity3: {
    title: 'ARCHIVOS ELIMINADOS',
    points: 2,
    timerSeconds: 180,
    files: [
      'ProyectoFinalSeguridad.docx',
      'EvidenciasSeguridad.pdf',
      'InformeIncidente.docx',
      'TareasSemana3.pdf',
      'ConfiguracionPC.txt',
    ],
    mandatoryFile: 'ProyectoFinalSeguridad',
    situationHeader: 'ARCHIVOS ELIMINADOS DURANTE EL INCIDENTE',
    situationText:
      'El ataque comenzó hace aproximadamente 6 minutos. Se perdieron 5 archivos del sistema. Debes decidir qué método de recuperación utilizar para restaurarlos de forma segura.',
    options: [
      'Recuperar desde Drive',
      'Recuperar desde USB',
      'Utilizar la copia de seguridad de las 12:00 a. m. de anoche',
      'Restaurar desde el punto de restauración del sistema',
      'Dejar los archivos como están y darlos por perdidos',
    ],
    correctIndex: 2,
    explanation:
      'La copia de seguridad de las 12:00 a. m. de anoche es la más reciente disponible antes del incidente y permite recuperar la mayor cantidad de información con mínima pérdida de trabajo.',
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
