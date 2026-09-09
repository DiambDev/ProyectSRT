import { SCREENS, AUDIO_SFX } from '../../core/constants.js';
import { Router } from '../../core/router.js';
import { AudioManager } from '../../audio/audioManager.js';

const TOP_CHIPS = [
  'KERNEL 6.4-REL', 'SHELL: SECURE-TTY', 'FIREWALL: UP', 'IDS: ARMED',
  'AV: LIVE', 'TLS 1.3', 'AD: SYNCED', 'DNS: RESOLVED',
  'SYSLOG: STREAM', 'AUDIT: ON', 'VPN: ESTABLISHED', 'PROXY: PASS',
  'CERT: VALID', 'HONEYPOT: ARMED', 'BACNET: OFFLINE', 'BACKUP: QUEUED',
];

const BOOT_LINES = [
  'initializing security_protocol...',
  'checking authentication_layer [OK]',
  'validating credentials against active_directory...',
  'scanning network segments 10.0.0.0/24 ... done',
  'firewall status: up, policy policy_prod_v3 applied',
  'checking access tokens and session_store integrity...',
  'monitoring system events and audit_log stream...',
  'loading intrusion detection ruleset (74 rules)...',
  'synchronizing secure time source...',
  'purging stale ephemeral sessions... done',
  'cipher suite negotiation: ECDHE-ECDSA-AES256-GCM-OK',
  'validating certificate chain (3 root anchors)... done',
  'mounting integrity ledger partition...',
  'seeding entropy pool (1280 bits) [OK]',
  'enabling hardware security module bridge',
  'registering operator workspace WEB-001-R01',
  'binding security event handler pipeline',
  'warming key-derivation caches... done',
  'refreshing dynamic access control lists',
  'handshaking peer gateways EU / US / APAC ... done',
  'auditing export compliance ruleset',
  'compacting ring buffer for telemetry bus',
  'applying quarantine policy to flagged nodes',
  'draining quarantine staging area... done',
  'recomputing posture score: 94/100... done',
  'finalizing pre-flight checks...',
];

const STATUS_NOTES = [
  '> kernel.scheduler: online',
  '> memory guard: active',
  '> io throttling: nominal',
  '> pub/sub bus: idle',
  '> watcher threads: 128',
  '> ambient telemetry: streaming',
];

const COUNTERS = [
  ['PKT/SEC', '248'], ['CPU', '31%'], ['MEM', '58%'], ['IO/Q', '12'],
];

const SEC_ROWS = [
  'auth attempts (last 60s): 0', 'failed handshakes: 0', 'tamper alerts: 0',
  'config drift: 0', 'cert revocations: 0', 'privilege prompts: 0',
  'sandbox escape attempts: 0', 'firmware verify: PASS',
];

const PROCESS_ROWS = [
  'secd', 'authd', 'fwcore', 'ids-sensor', 'avscanner', 'auditd',
  'keyringd', 'tlsproxy', 'sysmon', 'logrotate', 'sieved', 'sessiond',
  'hsmd', 'quarantine', 'telemetry', 'backlogd', 'namer', 'procwatch',
  'firewall', 'vpnknit', 'policyd', 'certwatch', 'dnscache', 'aaa-broker',
  'ephemerald', 'trustd', 'ledgerd', 'metricd', 'sanic', 'watchdogd',
];

const THREADS = [
  'tail -f auth.log', 'digest request', 'probe egress', 'retry queue',
  'ack n+1', 'wait lock', 'batch flush', 'hmac verify', 'rotate key',
];

const NET_ROWS = [
  ['10.0.0.11', 'ESTABLISHED'], ['10.0.0.24', 'ESTABLISHED'], ['10.0.1.07', 'SYN_SENT'],
  ['10.0.1.31', 'ESTABLISHED'], ['10.0.2.04', 'TIME_WAIT'], ['10.0.2.19', 'LISTEN'],
  ['10.0.3.02', 'ESTABLISHED'], ['10.0.3.40', 'ESTABLISHED'], ['10.0.4.12', 'CLOSE_WAIT'],
  ['10.0.4.27', 'ESTABLISHED'], ['10.0.5.05', 'ESTABLISHED'], ['10.0.5.33', 'LISTEN'],
  ['10.0.6.09', 'ESTABLISHED'], ['10.0.6.44', 'SYN_RECV'], ['10.0.7.16', 'ESTABLISHED'],
  ['10.0.7.38', 'TIME_WAIT'], ['10.0.8.01', 'ESTABLISHED'], ['10.0.8.29', 'LISTEN'],
];

const TAGS = [
  'CRYPTO', 'TLS', 'HOTFIX', 'HASH-SHA256', 'JWT-AUD', 'X509', 'OKTA-SYNC',
  'GRPC-5090', 'WATCH', 'TUN', 'NETNS', 'EBPF', 'SELINUX', 'KEYRING',
  'XATTR', 'IOMMU', 'SECCOMP', 'FPRINT', 'CVE-DB', 'SIG-VERIFY',
];

export const initialLoadingScreen = {
  id: SCREENS.INITIAL_LOADING,
  _alive: false,
  _timers: new Set(),

  render(container) {
    container.classList.add('screen--initial-loading');
    container.innerHTML = `
      <div class="boot-shell">
        <div class="boot-top"></div>
        <div class="boot-grid">
          <div class="boot-log-pane">
            <div class="boot-pane-head">SECURE BOOT SEQUENCE // v6.4</div>
            <div class="boot-log"></div>
          </div>
          <aside class="boot-side">
            <div class="boot-panel" data-panel="resources"></div>
            <div class="boot-panel" data-panel="security"></div>
            <div class="boot-panel" data-panel="network"></div>
          </aside>
          <div class="boot-mid">
            <div class="boot-col" data-col="integrity"></div>
            <div class="boot-col" data-col="processes"></div>
            <div class="boot-col" data-col="threads"></div>
            <div class="boot-col" data-col="dump"></div>
            <div class="boot-col" data-col="verify"></div>
          </div>
          <div class="boot-bottom"></div>
        </div>
        <div class="boot-rail"></div>
        <div class="boot-micro"></div>
      </div>
    `;
  },

  async enter() {
    this._alive = true;
    this._timers.clear();
    this.shell = this.container.querySelector('.boot-shell');
    this.logEl = this.shell.querySelector('.boot-log');
    this.topEl = this.shell.querySelector('.boot-top');
    this.railEl = this.shell.querySelector('.boot-rail');
    this.microEl = this.shell.querySelector('.boot-micro');
    this.done = 0;

    this._fillTop();
    this._fillRail();
    this._spawnMicro();
    this._fillStaticPanels();
    this._spawnTicker();
    this._spawnThreads();
    this._spawnSparkle();

    await this._runBoot();
  },

  async exit() {
    this._alive = false;
    this._timers.forEach((id) => clearTimeout(id));
    this._timers.clear();
  },

  _sleep(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        this._timers.delete(id);
        resolve();
      }, ms);
      this._timers.add(id);
    });
  },

  _schedule(fn, ms) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      if (this._alive) fn();
    }, ms);
    this._timers.add(id);
  },

  _el(cls, text) {
    const el = document.createElement('div');
    el.className = cls;
    if (text) el.textContent = text;
    return el;
  },

  _fillTop() {
    for (const c of TOP_CHIPS) {
      this.topEl.appendChild(this._el('boot-chip dim', c));
    }
    this.identEl = this._el('boot-chip ident', '<< VERIFICACIÓN DE IDENTIDAD: PENDIENTE >>');
    this.identEl.dataset.ident = 'pending';
    this.topEl.appendChild(this.identEl);
  },

  _setIdent(state) {
    if (!this._alive || !this.identEl) return;
    this.identEl.textContent = `<< VERIFICACIÓN DE IDENTIDAD: ${state} >>`;
    this.identEl.classList.add(state === 'OK' ? 'ok' : 'dim');
    AudioManager.playSFX(AUDIO_SFX.TICK);
  },

  _fillRail() {
    for (let i = 0; i < 36; i++) {
      const tag = TAGS[i % TAGS.length] + '-' + String(i + 1).padStart(2, '0');
      this.railEl.appendChild(this._el('boot-rail-tag', tag));
    }
  },

  _spawnMicro() {
    const tokens = ['A1', 'B7', 'C3', 'D9', 'E2', 'F4', 'G8', 'H5', 'I0', 'J6', 'K1', 'L9', 'M3', 'N7', 'O2', 'P8'];
    const hexes = ['0x1F', '0x2A', '0x5E', '0x9C', '0xD3', '0xF7', '0xB0', '0xE8'];
    for (let i = 0; i < 150; i++) {
      const useHex = i % 4 === 0;
      const text = useHex ? hexes[i % hexes.length] : tokens[i % tokens.length] + '-' + (i % 97);
      const el = this._el('boot-micro-lb', text);
      el.style.left = ((i * 37) % 100) + '%';
      el.style.top = (((i * 53) % 100) + i / 200) % 100 + '%';
      el.style.opacity = String(0.18 + (i % 5) * 0.1);
      this.microEl.appendChild(el);
      this._schedule(() => el.classList.add('on'), 120 + (i % 12) * 55);
    }
  },

  _fillStaticPanels() {
    const res = this.shell.querySelector('[data-panel="resources"]');
    res.appendChild(this._el('boot-panel-title', 'RECURSOS'));
    COUNTERS.forEach(([k, v], idx) => {
      const row = this._el('boot-counter', `${k}: 0`);
      row.dataset.counter = k;
      res.appendChild(row);
      this._schedule(() => { row.textContent = `${k}: ${v}`; row.classList.add('on'); }, 500 + idx * 320);
    });
    for (let i = 0; i < 6; i++) {
      const bar = this._el('boot-bar');
      const fill = this._el('boot-bar-fill');
      bar.appendChild(fill);
      res.appendChild(bar);
      this._schedule(() => { fill.style.width = 20 + ((i * 41) % 70) + '%'; }, 600 + i * 180);
    }

    const sec = this.shell.querySelector('[data-panel="security"]');
    sec.appendChild(this._el('boot-panel-title', 'POSTURA DE SEGURIDAD'));
    SEC_ROWS.slice(0, 6).forEach((r) => {
      sec.appendChild(this._el('boot-secrow', r));
    });

    const net = this.shell.querySelector('[data-panel="network"]');
    net.appendChild(this._el('boot-panel-title', 'CONEXIONES'));
    for (const [ip, state] of NET_ROWS) {
      const row = this._el('boot-netrow', `${ip}  :443  ${state}`);
      row.dataset.netrow = ip;
      net.appendChild(row);
    }
  },

  _spawnTicker() {
    const bottom = this.shell.querySelector('.boot-bottom');
    for (let i = 0; i < 16; i++) {
      const chip = this._el('boot-ticker', `SEC-SCAN ${i + 1} :: OK`);
      bottom.appendChild(chip);
    }
  },

  _spawnThreads() {
    const col = this.shell.querySelector('[data-col="threads"]');
    col.appendChild(this._el('boot-panel-title', 'HILOS'));
    for (let t = 0; t < 3; t++) {
      for (let i = 0; i < 20; i++) {
        const line = this._el('boot-threadline dim', THREADS[(t + i) % THREADS.length] + ' :: ok');
        col.appendChild(line);
      }
    }
  },

  _spawnSparkle() {
    const col = this.shell.querySelector('[data-col="integrity"]');
    col.appendChild(this._el('boot-panel-title', 'INTEGRIDAD'));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = this._el('boot-int-cell', 'OK');
        col.appendChild(cell);
      }
    }
    for (let i = 0; i < 20; i++) {
      const bar = this._el('boot-bar slim');
      const fill = this._el('boot-bar-fill');
      bar.appendChild(fill);
      col.appendChild(bar);
      this._schedule(() => { fill.style.width = (15 + ((i * 37) % 75)) + '%'; }, 700 + i * 90);
    }
  },

  _fillMid() {
    const proc = this.shell.querySelector('[data-col="processes"]');
    proc.appendChild(this._el('boot-panel-title', 'PROCESOS'));
    PROCESS_ROWS.forEach((p, i) => {
      const row = this._el('boot-procrow dim', `${p}.pid  running`);
      row.dataset.proc = p;
      proc.appendChild(row);
      this._schedule(() => row.classList.add('on'), 300 + i * 60);
    });

    const dump = this.shell.querySelector('[data-col="dump"]');
    dump.appendChild(this._el('boot-panel-title', 'VOLCADO'));
    for (let i = 0; i < 26; i++) {
      dump.appendChild(this._el('boot-dumpline dim', '0x' + (0x9c40 + i * 3).toString(16).toUpperCase()));
    }

    const verif = this.shell.querySelector('[data-col="verify"]');
    if (verif) {
      verif.appendChild(this._el('boot-panel-title', 'VERIFICACIONES'));
      for (let i = 0; i < 16; i++) {
        verif.appendChild(this._el('boot-checkline', 'CHECK-' + String(i + 1).padStart(2, '0') + ' ... PASS'));
      }
    }
  },

  async _runBoot() {
    this._fillMid();
    AudioManager.playSFX(AUDIO_SFX.LOADING);

    let i = 0;
    for (; i < BOOT_LINES.length; i++) {
      if (!this._alive) return;
      const line = this._el('boot-line');
      this.logEl.appendChild(line);
      await this._typeLine(line, BOOT_LINES[i]);
      if (!this._alive) return;
      if (i === 8) this._setIdent('EN CURSO');
      if (i === 18) this._setIdent('COMPROBANDO');
      if (i === 24) this._setIdent('OK');
      if (i % 4 === 0) this._spikeLog();
      await this._sleep(30);
    }

    for (const note of STATUS_NOTES) {
      if (!this._alive) return;
      this.logEl.appendChild(this._el('boot-line dim', note));
      await this._sleep(70);
    }
    if (!this._alive) return;

    const ready = this._el('boot-ready', '>> TODOS LOS SISTEMAS OPERATIVOS // LISTO <<');
    this.logEl.appendChild(ready);
    AudioManager.playSFX(AUDIO_SFX.SUCCESS);
    await this._sleep(620);
    if (!this._alive) return;
    AudioManager.playSFX(AUDIO_SFX.TRANSITION);
    Router.show(SCREENS.INTRO);
  },

  _spikeLog() {
    if (!this._alive) return;
    const s = ['integrity_chunk aligned', 'telemetry frame acked', 'pool trimmed', 'gc pass complete', 'ring flush ok'];
    const line = this._el('boot-line dim', '> ' + s[Math.floor(Math.random() * s.length)]);
    this.logEl.appendChild(line);
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
  },

  _typeLine(el, text) {
    return new Promise((resolve) => {
      const chars = text.split('');
      let idx = 0;
      const id = setInterval(() => {
        if (!this._alive) {
          clearInterval(id);
          this._timers.delete(id);
          resolve();
          return;
        }
        idx++;
        el.textContent = text.slice(0, idx);
        if (idx % 6 === 0) AudioManager.playSFX(AUDIO_SFX.TYPING);
        if (idx >= chars.length) {
          clearInterval(id);
          this._timers.delete(id);
          resolve();
        }
      }, 4);
      this._timers.add(id);
    });
  },
};