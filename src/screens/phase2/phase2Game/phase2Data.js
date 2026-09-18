export const PHASE2_VERIFICATION_CODE = '847291';

export const PHASE2_CASE_INTRO =
  'El canal de comunicación del sistema quedó expuesto al restaurarlo. Debes interactuar con los contactos y decidir qué información compartes.';

export const PHASE2_LOADING_TITLE = 'RESTAURANDO CANAL DE COMUNICACIÓN';

export const PHASE2_LOADING_LINES = [
  '> INICIANDO RESTAURACIÓN DEL CANAL...',
  '> COMPROBANDO PROTOCOLOS DE COMUNICACIÓN...',
  '> CERRANDO SESIONES INTERFERIDAS...',
  '> ESTABLECIENDO CANAL SEGURO...',
  '> REACTIVANDO REGLAS DE SEGURIDAD...',
  '> VERIFICANDO CONTACTOS ASOCIADOS...',
  '> SINCRONIZANDO PARÁMETROS DE SESIÓN...',
  '> VALIDANDO FIRMA DEL CÓDIGO DE CANAL...',
  '> LISTO PARA INTERACTUAR',
];

export const PHASE2_LOADING_HEADING = 'CONECTANDO AL CANAL DE COMUNICACIÓN';
export const PHASE2_LOADING_HEADING_DONE = 'CANAL RESTAURADO · COMUNICACIÓN ESTABLECIDA';

export const PHASE2_LOADING_NODES = [
  'NODO: ROUTER-01',
  'NODO: CORE-04',
  'NODO: VPN-T01',
  'NODO: GW-EDU-03',
  'NODO: SRV-AUTH-02',
  'NODO: LAN-EST-07',
];

export const PHASE2_LOADING_NET_STATUS = [
  'enlace: activo',
  'enlace: renegociando',
  'enlace: estable',
  'enlace: encolando',
  'enlace: activo',
];

export const PHASE2_LOADING_METRICS = [
  ['LATENCIA', '23ms'],
  ['PAQUETES', '0.4k/s'],
  ['CRC', 'OK'],
  ['RUTA', 'unicast'],
  ['MTU', '1480'],
  ['RETRANSMISIÓN', '0.2%'],
];

export const PHASE2_LOADING_DIAG = [
  '> comprobando handshake TLS... OK',
  '> estado del canal: INTERFERIDO',
  '> reintentando conexión 02/05',
  '> verificando claves de sesión...',
  '> canal: reenchufado',
  '> estableciendo MTU por ruta...',
  '> firewall: reglas reactivadas',
  '> token de sesión renovado',
  '> latencia dentro de rango',
  '> canal: ESTABLE',
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
  esc1: '[ OK ] ESCENARIO 1 · IDENTIDAD — DECISIÓN SEGURA',
  esc2: '[ OK ] ESCENARIO 2 · CREDENCIALES — DECISIÓN SEGURA',
  esc3: '[ OK ] ESCENARIO 3 · ENLACE — DECISIÓN SEGURA',
  esc4: '[ OK ] ESCENARIO 4 · PRESIÓN — DECISIÓN SEGURA',
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
  'Compartiste información sensible o realizaste una acción de riesgo sin verificar la solicitud. Recuerda: el personal legítimo nunca te pedirá códigos, contraseñas ni acciones urgentes por un canal no oficial. Lee, analiza y decide la acción segura.';

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

export const PHASE2_WINDOW_TITLES = [
  'ERROR DE AUTENTICACIÓN',
  'CONEXIÓN NO CONFIABLE',
  'VALIDACIÓN FALLIDA',
  'CANAL COMPROMETIDO',
  'ACCESO DENEGADO',
  'RESPUESTA NO VERIFICADA',
  'RIESGO DETECTADO',
  'PROTOCOLO INTERRUMPIDO',
  'CREDENCIAL NO CONFIRMADA',
  'SOLICITUD RECHAZADA',
  'ACTIVIDAD SOSPECHOSA',
  'VERIFICACIÓN FALLIDA',
];

export const PHASE2_SYS_LOG_POOL = [
  'SEGURIDAD DEL CANAL COMPROMETIDA',
  'handshake TLS rechazado',
  'ПОТОК ДАННЫХ НЕСТАБИЛЕН',
  '通道已断开',
  'CÓDIGO 847291 EXPUESTO',
  'session 0x41 revocada',
  'СБОЙ ПРОВЕРКИ УДОСТОВЕРЕНИЯ',
  '防火墙规则已禁用',
  'BUFFER OVERFLOW 0x0080',
  'paquete descartado vlan 40',
  'ПЕРЕХВАТ СООБЩЕНИЯ',
  '数据丢失 43%',
  'AUTH FAILED user=campus',
  'файл удален резервной копии',
  '路由黑洞 10.0.4.0/24',
  'открыто 12 каналов',
  '链路不稳定 43.2%',
  'área de memoria comprometida',
  'ruta de red oscura activa',
  'ПРОЦЕСС ОСТАНОВЛЕН SIGKILL',
  '进程已被终止',
];

export const PHASE2_CONTACTS = [
  {
    id: 'esc1',
    name: 'SOPORTE TÉCNICO',
    initials: 'ST',
    tag: 'ESCENARIO 1 · IDENTIDAD',
    channelId: 'CH-0x1A',
    unread: 1,
    messages: [
      'Hola, soy soporte técnico. Necesito confirmar algunos datos de tu cuenta para ayudarte con una incidencia.',
    ],
    options: [
      { letter: 'A', id: 'verify', label: 'Necesito verificar su identidad antes de continuar.', safe: true, next: 'ok' },
      { letter: 'B', id: 'defer', label: 'Envíeme directamente el procedimiento.', risk: true },
      { letter: 'C', id: 'access', label: 'Puede acceder a mi cuenta para comprobarlo.', critical: true },
      { letter: 'D', id: 'limitedAccess', label: 'Le doy acceso temporal limitado para que revise.', risk: true },
    ],
    pressure: {
      messages: [
        'El procedimiento no puede esperar. ¿Lo confirmamos ahora o prefieres que el caso se cierre solo?',
        'Necesito una respuesta para seguir con la atención.',
      ],
    },
  },
  {
    id: 'esc2',
    name: 'SERVICIO DE ASISTENCIA',
    initials: 'SA',
    tag: 'ESCENARIO 2 · CREDENCIALES',
    channelId: 'CH-0x2F',
    unread: 1,
    messages: [
      'Para resolver el problema necesito que me envíes la contraseña actual de tu cuenta.',
      'Necesitamos acceso urgente para aplicar el parche de esta tarde.',
    ],
    options: [
      { letter: 'A', id: 'share', label: 'Puedo compartir la contraseña si es necesario.', critical: true },
      { letter: 'B', id: 'refuse', label: 'No compartiré mi contraseña. Indíqueme otro método de verificación.', safe: true, next: 'ok' },
      { letter: 'C', id: 'other', label: 'Le enviaré la contraseña mediante otro canal.', risk: true },
      { letter: 'D', id: 'photoScreen', label: 'Envío una captura de pantalla con la contraseña visible.', risk: true },
    ],
    pressure: {
      messages: [
        'Si no la envías ahora, el parche no se aplicará y tu cuenta quedará expuesta toda la semana.',
        'Es la única forma de cerrar el proceso hoy.',
      ],
    },
  },
  {
    id: 'esc3',
    name: 'SOPORTE OFICIAL',
    initials: 'SO',
    tag: 'ESCENARIO 3 · ENLACE',
    channelId: 'CH-0x3C',
    unread: 1,
    messages: [
      'Tu cuenta presenta un problema. Abre este enlace para realizar la validación inmediatamente.',
      'El enlace tiene vigencia limitada de 10 minutos.',
    ],
    options: [
      { letter: 'A', id: 'open', label: 'Abriré el enlace para solucionar el problema.', critical: true },
      { letter: 'B', id: 'stall', label: 'Necesito confirmar el enlace antes de continuar.', risk: true },
      { letter: 'C', id: 'verify', label: 'No abriré el enlace hasta verificar que la solicitud sea legítima.', safe: true, next: 'ok' },
      { letter: 'D', id: 'peekLink', label: 'Haré clic en el enlace pero no ingresaré ningún dato.', risk: true },
    ],
    pressure: {
      messages: [
        'El enlace caducará en 08:41. ¿Confirmas tu validación ahora?',
        'No podemos entregar el reporte si el plazo vence.',
      ],
    },
  },
  {
    id: 'esc4',
    name: 'GESTOR DE SEGURIDAD',
    initials: 'GS',
    tag: 'ESCENARIO 4 · PRESIÓN',
    channelId: 'CH-0x4D',
    unread: 1,
    messages: [
      'Este es GESTOR DE SEGURIDAD del campus.',
      'Si no realizas la acción ahora, tu cuenta será bloqueada.',
      'Necesito que confirmes inmediatamente el procedimiento de validación.',
    ],
    options: [
      { letter: 'A', id: 'act', label: 'Realizaré la acción inmediatamente para evitar el bloqueo.', critical: true },
      { letter: 'B', id: 'official', label: 'Confirmaré la solicitud mediante un canal oficial antes de actuar.', safe: true, next: 'ok' },
      { letter: 'C', id: 'ignoreAll', label: 'Ignoraré todas las medidas de seguridad para resolverlo rápidamente.', risk: true },
      { letter: 'D', id: 'rushReply', label: 'Respondo rápidamente sin verificar nada para no perder acceso.', risk: true },
    ],
    pressure: {
      messages: [
        'El bloqueo se aplicará en 05:00 si no respondes.',
        'Es tu última oportunidad de mantener el acceso activo.',
      ],
    },
  },
];