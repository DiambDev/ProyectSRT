export const FRAGMENT_POOL = [
  'acceso denegado', 'protocolo interrumpido', 'sesión bloqueada',
  'intrusión en curso', 'fallo de verificación', 'sistema comprometido',
  'nivel de amenaza crítico', 'control del incidente perdido',
  'bloqueo de seguridad emitido', 'reinicio del escenario requerido',
  'credenciales no protegidas', 'intentos excedidos',
  'access denied', 'protocol interrupted', 'session locked',
  'intrusion in progress', 'verification failure', 'system breached',
  'critical threat level', 'incident control lost',
  'security lockdown issued', 'scenario restart required',
  'доступ заблокирован', 'обнаружено вторжение', 'система повреждена',
  'ошибка протокола', 'сессия прервана', 'проверка не пройдена',
  'критический уровень угрозы', 'требуется перезапуск',
  '访问被拒绝', '系统故障', '入侵警报', '安全警报',
  '协议错误', '会话中断', '威胁等级升高', '需要重新开始',
];

const TIMESTAMPS = ['00:04', '00:11', '00:17', '00:23', '00:29', '00:36', '00:41', '00:48', '00:52', '00:59'];

const TAGS = ['ALERT', 'SYS::LOCK', '4080', 'WARN', 'CRIT', 'EVT-7', 'NODE-2', 'SAM-1', 'HOST-9', 'PORT-443'];

export function buildFragments(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const base = FRAGMENT_POOL[i % FRAGMENT_POOL.length];
    const ts = TIMESTAMPS[(i * 7) % TIMESTAMPS.length];
    const tag = TAGS[(i * 3) % TAGS.length];
    const style = i % 6;
    if (style === 0) {
      out.push(`[${ts}] ${base} :: ${tag} :: nodo ${(i % 12) + 1} :: relaunch`);
    } else if (style === 1) {
      out.push(`${base.toUpperCase()} // ${ts} // retry {n=${(i % 9) + 1}}`);
    } else if (style === 2) {
      out.push(`${base} -> ${FRAGMENT_POOL[(i + 5) % FRAGMENT_POOL.length]} :: ${tag} ${(i % 90) + 10}`);
    } else if (style === 3) {
      out.push(`${base} [${ts}] (véase manual) / ${base.toUpperCase()}`);
    } else if (style === 4) {
      out.push(`evt ${ts} :: ${base} :: recomputo de postura ... FAIL`);
    } else {
      out.push(`${base}, ${base}, ${base} :: ${tag}`);
    }
  }
  return out;
}