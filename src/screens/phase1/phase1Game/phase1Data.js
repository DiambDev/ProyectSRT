export const PHASE1_PROTOCOL_TITLE = 'PROTOCOLO DE EMERGENCIA';

export const PHASE1_MISSION =
  'Un atacante ha logrado entrar al sistema aprovechando credenciales comprometidas. Cada segundo de duda cuesta datos. Ejecutaremos el protocolo de respuesta ante la intrusión, sin detenernos.';

export const PHASE1_MISSION_AFTER =
  'Correcto. El atacante aún conserva acceso parcial al sistema. Para recuperar el control debemos ejecutar en orden los pasos del protocolo. Selecciona cada medida y colócala en el bloque correcto.';

export const PHASE1_QUESTION_INTRO =
  'Una empresa detecta que un atacante realiza intentos de autenticación contra 20 cuentas distintas, probando únicamente las contraseñas: Summer2026!, Welcome123!, Company2026!. En cada cuenta realiza pocos intentos y después cambia de usuario.';

export const PHASE1_QUESTION =
  '¿Qué característica permite distinguir este comportamiento de un ataque tradicional de fuerza bruta contra una sola cuenta?';

export const PHASE1_QUESTION_OPTIONS = [
  {
    id: 'A',
    label:
      'El atacante prueba múltiples combinaciones de contraseña sobre una misma cuenta hasta encontrar una coincidencia.',
  },
  {
    id: 'B',
    label:
      'El atacante reutiliza credenciales obtenidas previamente para comprobar si funcionan en diferentes servicios.',
  },
  {
    id: 'C',
    correct: true,
    label:
      'El atacante distribuye un conjunto reducido de contraseñas entre numerosas cuentas para evitar concentrar los intentos sobre una sola identidad.',
  },
  {
    id: 'D',
    label:
      'El atacante genera múltiples variantes de una contraseña conocida modificando caracteres, números y símbolos.',
  },
  {
    id: 'E',
    label:
      'El atacante intenta obtener una sesión válida interceptando las credenciales mientras el usuario se autentica.',
  },
];

export const PHASE1_CORRECT_OPTION_ID = 'C';

export const PHASE1_SEQUENCE_ORDER = ['block-account', 'change-passwords', 'enable-extra'];

export const PHASE1_ACTIONS = [
  { id: 'block-account', correct: true, label: 'Bloquear la cuenta' },
  { id: 'change-passwords', correct: true, label: 'Cambiar las contraseñas' },
  { id: 'enable-extra', correct: true, label: 'Activar verificación adicional' },
  { id: 'close-sessions', label: 'Cerrar todas las sesiones activas' },
  { id: 'disable-account', label: 'Desactivar temporalmente la cuenta afectada' },
  { id: 'rename-user', label: 'Cambiar el nombre de usuario' },
];

export const PHASE1_REFLECTION =
  'El protocolo de respuesta se ha ejecutado en el orden correcto: contener el acceso, renovar las credenciales y reforzar la verificación. Procedemos a la siguiente fase del plan de respuesta.';

export const PHASE1_ANSWER_VARIANTS = [
  'solo cambiar la contrasena y esperar',
  'revocar los accesos comprometidos, cambiar las credenciales y activar la autenticación multifactor',
  'bloquear o revocar los accesos comprometidos, cambiar o restablecer las credenciales y activar la autenticación multifactor',
].map((t) => t.toLowerCase());