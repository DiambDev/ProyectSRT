export const PHASE2_VERIFICATION_CODE = '847291';

export const PHASE2_CASE_INTRO =
  'El canal de comunicación del sistema quedó expuesto al restaurarlo. Debes interactuar con los contactos y decidir qué información compartes.';

export const PHASE2_LOADING_TITLE = 'RESTAURANDO CANAL DE COMUNICACIÓN';

export const PHASE2_LOADING_LINES = [
  '> INICIANDO RESTAURACIÓN DEL CANAL...',
  '> COMPROBANDO PROTOCOLOS DE COMUNICACIÓN...',
  '> ESTABLECIENDO CANAL SEGURO...',
  '> VERIFICANDO CONTACTOS ASOCIADOS...',
  '> LISTO PARA INTERACTUAR',
];

export const PHASE2_TERMINAL_INITIAL = [
  { text: '> INICIALIZANDO SISTEMA DE VERIFICACIÓN...', cls: '' },
  { text: '> ESTADO: PARCIALMENTE RESTAURADO', cls: 'warn' },
  { text: '> Se detectó interferencia en el canal.', cls: 'warn' },
  { text: '> Se generó un código de verificación para esta sesión.', cls: '' },
  { text: PHASE2_VERIFICATION_CODE, cls: 'code' },
  { text: '! NO COMPARTA ESTE CÓDIGO', cls: 'danger' },
  { text: '> Comparta el código solo después de verificar la identidad del personal.', cls: '' },
];

export const PHASE2_TERMINAL_PROGRESS = {
  tecnico: '[ OK ] CONTACTO 1 · ANÁLISIS COMPLETADO',
  asistencia: '[ OK ] CONTACTO 2 · ANÁLISIS COMPLETADO',
  oficial: '[ OK ] CONTACTO 3 · IDENTIDAD VERIFICADA',
};

export const PHASE2_TERMINAL_FINAL = [
  '> ANÁLISIS COMPLETADO',
  '> CANAL SEGURO',
  '> RESTAURACIÓN FINALIZADA',
];

export const PHASE2_REMEMBER_TITLE = 'RECUERDA';

export const PHASE2_REMEMBER_LINES = [
  'Un atacante puede hacerse pasar por el soporte técnico y usar la urgencia o el miedo para obtener información sensible.',
  'Nunca comparta códigos, contraseñas ni datos personales por un canal no verificado.',
  'Siempre confirme la identidad del solicitante por el canal oficial antes de compartir cualquier información.',
];

export const PHASE2_REMEMBER_BUTTON = 'CONTINUAR';

export const PHASE2_DEFEAT_TITLE = 'FASE 2 FALLIDA';

export const PHASE2_DEFEAT_MESSAGE =
  'Compartiste información sensible sin verificar la identidad del solicitante. Recuerda: el personal legítimo nunca te pedirá códigos ni contraseñas por un canal no oficial. Verifica siempre la identidad antes de compartir datos.';

export const PHASE2_DEFEAT_FINAL_LINES = [
  'EL SISTEMA HA SIDO COMPROMETIDO',
  'PERDISTE EL CONTROL DEL SISTEMA',
];

export const PHASE2_FLOOD_POOL = [
  'CÓDIGO 847291 EXPUESTO',
  'https://soporte-falso.invalid/descargar',
  'PIN: 5937',
  'clave_estudiante_2026',
  'ACCESO NO AUTORIZADO',
  'BACKUP_ELIMINADO.zip',
  'usuario@correo',
  'TOKEN: a41f9c...',
  'SESIÓN COMPROMETIDA',
  'REGISTRO: access granted',
  'sesion.pid',
  'CONTRASEÑA REUTILIZADA',
];

export const PHASE2_ALERT_POOL = [
  '¡ALERTA!',
  'EL SISTEMA HA SIDO COMPROMETIDO',
  'PERDISTE EL CONTROL DEL SISTEMA',
  'ACCESO DENEGADO',
  'CONTRASEÑA EXPUESTA',
  'SECRETOS REVELADOS',
  'COMUNICACIÓN INTERCEPTADA',
  'CÓDIGO FILTRADO',
  'SESIÓN ABIERTA',
  'ARCHIVOS EXPUESTOS',
];

export const PHASE2_CONTACTS = [
  {
    id: 'tecnico',
    name: 'SOPORTE TÉCNICO',
    initials: 'ST',
    unread: 3,
    type: 'attacker',
    turns: {
      intro: {
        messages: [
          'Hola. Le habla SOPORTE TÉCNICO del sistema.',
          'Detectamos actividad sospechosa en su cuenta.',
          'Por protocolo interno debo verificar su identidad ahora.',
          'Necesito que me confirme el código de verificación que aparece en su sistema.',
          'Es urgente: si no lo hace, su acceso será suspendido temporalmente.',
        ],
        options: [
          { id: 'verify', label: 'Necesito verificar su identidad en el canal oficial.', next: 'justify', safe: true },
          { id: 'refuse', label: 'No compartiré ningún código.', next: 'stand', safe: true },
          { id: 'trust', label: 'De acuerdo, el código es 847291.', next: 'escalate', safe: false },
        ],
      },
      justify: {
        messages: [
          'Entiendo su precaución, pero es un procedimiento interno.',
          'Si no completamos la verificación rápido, el acceso quedará bloqueado.',
          '¿Confirmamos que podemos continuar?',
        ],
        options: [
          { id: 'verify2', label: 'Primero voy a verificar su identidad por el canal oficial.', next: 'stand', safe: true },
          { id: 'refuse2', label: 'No seguiré compartiendo información por este canal.', next: 'stand', safe: true },
          { id: 'share', label: 'Está bien: el código es 847291.', next: 'escalate', safe: false },
        ],
      },
      escalate: {
        messages: [
          'Perfecto, primera parte validada.',
          'Para terminar la reparación necesito el PIN de confirmación de su correo.',
          'Si no lo envía ahora, se perderán todos los archivos de la sesión.',
          'Tiene 30 segundos.',
        ],
        options: [
          { id: 'hold', label: 'Voy a verificar esto en el canal oficial. No continuaré.', next: 'stand', safe: true },
          { id: 'shareAll', label: 'No quiero perder mis archivos: el PIN es 5937.', next: 'defeat', safe: false, critical: true },
        ],
      },
      stand: {
        messages: [
          'Entendido.',
          'Contacte al soporte oficial para continuar.',
          'Usuario desconectado.',
        ],
      },
    },
  },
  {
    id: 'asistencia',
    name: 'SERVICIO DE ASISTENCIA',
    initials: 'SA',
    unread: 2,
    type: 'attacker',
    turns: {
      intro: {
        messages: [
          'Buen día. Somos SERVICIO DE ASISTENCIA del campus.',
          'Estamos aplicando una actualización de emergencia en los equipos.',
          'Su equipo está en la lista de este turno.',
          'Necesito su correo y el código de verificación para registrar el cambio.',
          'Es solo para cumplir con el registro obligatorio.',
        ],
        options: [
          { id: 'verify', label: 'Voy a confirmar su identidad primero por el canal oficial.', next: 'justify', safe: true },
          { id: 'refuse', label: 'No comparto mis credenciales por chat.', next: 'stand', safe: true },
          { id: 'trust', label: 'Claro: usuario@correo, código 847291.', next: 'escalate', safe: false },
        ],
      },
      justify: {
        messages: [
          'Entiendo, pero el registro debe cerrarse hoy.',
          'Si no aparece en el sistema, su acceso será limitado durante la actualización.',
          '¿Me confirma el código por favor?',
        ],
        options: [
          { id: 'verify2', label: 'Voy a verificar su identidad en el canal oficial antes de continuar.', next: 'stand', safe: true },
          { id: 'refuse2', label: 'No continuaré por este canal.', next: 'stand', safe: true },
          { id: 'share', label: 'Aquí está: 847291.', next: 'escalate', safe: false },
        ],
      },
      escalate: {
        messages: [
          'Registro parcial completado.',
          'Falta la clave de activación de su cuenta institucional.',
          'Es la misma que usa en la mensajería interna.',
          'Envíela para cerrar el proceso. Si no, el cambio no quedará registrado.',
        ],
        options: [
          { id: 'hold', label: 'No continuaré. Verificaré la información en el canal oficial.', next: 'stand', safe: true },
          { id: 'shareAll', label: 'La clave es clave_estudiante_2026.', next: 'defeat', safe: false, critical: true },
        ],
      },
      stand: {
        messages: [
          'No hay problema.',
          'Puede confirmar la actualización por el canal oficial.',
          'Usuario desconectado.',
        ],
      },
    },
  },
  {
    id: 'oficial',
    name: 'SOPORTE OFICIAL',
    initials: 'SO',
    unread: 1,
    type: 'legit',
    turns: {
      intro: {
        messages: [
          'Hola. Soy del equipo de SOPORTE OFICIAL del sistema.',
          'Estamos restaurando el canal de comunicación.',
          'Puede verificar mi identidad en el canal oficial: id.tecsup.edu.pe',
          'No le pediré información hasta que confirme mi identidad.',
        ],
        options: [
          { id: 'verify', label: 'He verificado su identidad en el canal oficial.', next: 'confirm', safe: true },
          { id: 'overCautious', label: 'No compartiré nada y tampoco verificaré nada.', next: 'clarify', safe: true },
          { id: 'unsafe', label: 'Confío en usted. El código es 847291.', next: 'defeat', safe: false, critical: true },
        ],
      },
      clarify: {
        messages: [
          'Está bien ser precavido.',
          'Pero la forma correcta es verificar nuestra identidad, y después sí puedes compartir el código para restaurar el servicio.',
          '¿Confirma mi identidad en el canal oficial?',
        ],
        options: [
          { id: 'verify2', label: 'Sí, identidad verificada en el canal oficial.', next: 'confirm', safe: true },
          { id: 'unsafe2', label: 'No necesito verificar nada. Código 847291.', next: 'defeat', safe: false, critical: true },
        ],
      },
      confirm: {
        messages: [
          'Perfecto. Verificación confirmada.',
          'Procedemos con la restauración del canal.',
          'Confirme usted que su identidad fue verificada y envíe el código de la sesión.',
        ],
        options: [
          { id: 'shareVerified', label: 'Identidad verificada. Código de la sesión: 847291.', next: 'complete', safe: true },
          { id: 'shareUnsafed', label: 'Aquí está, sin verificar: 847291.', next: 'defeat', safe: false, critical: true },
        ],
      },
    },
  },
];