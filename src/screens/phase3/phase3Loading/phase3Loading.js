import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { VFXManager } from '../../../vfx/vfxManager.js';
import { PHASE3 } from '../phase3Game/phase3Data.js';

const SIDEBAR_TREE = [
  { label: 'Este equipo', indent: 0, icon: '\uD83D\uDCBB' },
  { label: 'Disco Local (C:)', indent: 1, icon: '\uD83D\uDDA5' },
  { label: 'Sistema operativo', indent: 2, icon: '\uD83D\uDCC1' },
  { label: 'Documentos', indent: 2, icon: '\uD83D\uDCC1', active: true },
  { label: 'Descargas', indent: 2, icon: '\uD83D\uDCC1' },
  { label: 'Im\u00e1genes', indent: 2, icon: '\uD83D\uDCC1' },
  { label: 'Videos', indent: 2, icon: '\uD83D\uDCC1' },
  { label: 'Respaldo', indent: 2, icon: '\uD83D\uDCC1' },
  { label: 'Usuarios', indent: 2, icon: '\uD83D\uDCC1' },
  { label: 'Escritorio', indent: 2, icon: '\uD83D\uDCC1' },
  { label: 'Programas', indent: 2, icon: '\uD83D\uDCC1' },
  { label: 'Proyectos', indent: 2, icon: '\uD83D\uDCC1' },
];

const DIAG_POOL = [
  'Verificando integridad del sistema de archivos...',
  'Escaneando metadatos de recuperaci\u00f3n...',
  'Analizando estructura de directorios...',
  'Reconstruyendo \u00e1rbol de archivos...',
  'Validando checksums de seguridad...',
  'Recuperando bloques de datos...',
  'Comprobando permisos de acceso...',
  'Restaurando registros de auditor\u00eda...',
  'Sincronizando estado del sistema...',
  'Verificando consistencia de datos...',
];

const LOG_POOL = [
  '[SYS] Inicio de recuperaci\u00f3n de archivos',
  '[IO] Lectura de disco local (C:)',
  '[SEC] Verificando integridad de archivos',
  '[NET] Conexi\u00f3n con servidor de respaldo establecida',
  '[FS] Montando sistema de archivos',
  '[AUTH] Credenciales de recuperaci\u00f3n validadas',
  '[PROC] An\u00e1lisis forense en curso',
  '[SYS] Archivos recuperados correctamente',
  '[WARN] Archivos modificados detectados',
  '[ERR] Archivos eliminados durante el incidente',
];

export const phase3LoadingScreen = {
  id: SCREENS.PHASE_3_LOADING,
  _alive: false,
  _timers: [],

  render(container) {
    container.classList.add('screen--phase-loading', 'screen--phase3', 'screen--p3-recovery');
    container.innerHTML = `
      <div class="p3rec-root">
        <div class="p3rec-window">
          <div class="p3rec-titlebar">
            <span>RECUPERACI\u00d3N DE ARCHIVOS \u00b7 SISTEMA FORENSE</span>
            <div class="p3rec-dots"><span></span><span></span><span></span></div>
          </div>
          <div class="p3rec-body">
            <aside class="p3rec-nav" data-nav></aside>
            <div class="p3rec-main">
              <div class="p3rec-heading">RECUPERANDO ARCHIVOS DEL SISTEMA</div>
              <div class="p3rec-status" data-status>Iniciando an\u00e1lisis...</div>
              <div class="p3rec-diagnostics" data-diag></div>
              <div class="p3rec-files-counter" data-counter>
                <span class="p3rec-counter-label">ARCHIVOS PROCESADOS</span>
                <span class="p3rec-counter-value" data-count>0 / ${PHASE3.totalFiles}</span>
              </div>
              <div class="p3rec-folders" data-folders></div>
              <div class="p3rec-progress">
                <div class="p3rec-progress-track">
                  <div class="p3rec-progress-fill" data-fill></div>
                </div>
                <div class="p3rec-percent" data-percent>0%</div>
              </div>
              <div class="p3rec-log" data-log></div>
            </div>
          </div>
        </div>
      </div>
    `;
    this._buildSidebar(container);
    this._buildFolders(container);
  },

  async enter() {
    this._alive = true;
    this._timers = [];
    AudioManager.playSFX(AUDIO_SFX.LOADING);

    const fill = this.container.querySelector('[data-fill]');
    const percent = this.container.querySelector('[data-percent]');
    const status = this.container.querySelector('[data-status]');
    const countEl = this.container.querySelector('[data-count]');
    const diagEl = this.container.querySelector('[data-diag]');
    const logEl = this.container.querySelector('[data-log]');
    const done = () => this._alive === false;

    let progress = 0;
    let fileCount = 0;
    let diagIdx = 0;
    let logIdx = 0;

    while (progress < 100 && !done()) {
      progress = Math.min(100, progress + 1);
      fill.style.width = `${progress}%`;
      percent.textContent = `${progress}%`;

      if (progress <= 33) status.textContent = 'Analizando unidades...';
      else if (progress <= 66) status.textContent = 'Reconstruyendo estructura...';
      else status.textContent = 'Verificando integridad...';

      if (progress % 5 === 0 && fileCount < PHASE3.totalFiles) {
        fileCount = Math.min(PHASE3.totalFiles, fileCount + Math.ceil(Math.random() * 3));
        countEl.textContent = `${fileCount} / ${PHASE3.totalFiles}`;
      }

      if (progress % 8 === 0) {
        const line = document.createElement('div');
        line.className = 'p3rec-diag-line';
        line.textContent = DIAG_POOL[diagIdx % DIAG_POOL.length];
        diagEl.appendChild(line);
        if (diagEl.children.length > 6) diagEl.children[0].remove();
        diagIdx++;
      }

      if (progress % 10 === 0) {
        const log = document.createElement('div');
        log.className = 'p3rec-log-line';
        log.textContent = LOG_POOL[logIdx % LOG_POOL.length];
        logEl.appendChild(log);
        if (logEl.children.length > 8) logEl.children[0].remove();
        logIdx++;
      }

      this._folders.forEach((f) => {
        if (!this._revealed[f.name] && progress >= f.revealAt) {
          this._revealed[f.name] = true;
          this._applyFolderStatus(f);
        }
      });

      if (progress >= 92 && progress <= 94) {
        percent.textContent = '93%';
        fill.style.width = '93%';
        await this._sleep(900);
        continue;
      }

      await this._sleep(80);
    }
    if (done()) return;

    await this._sleep(500);
    if (done()) return;

    AudioManager.playSFX(AUDIO_SFX.GLITCH);
    VFXManager.glitch(this.container, 600);
    await this._sleep(600);
    if (done()) return;

    Router.show(SCREENS.PHASE_3);
  },

  async exit() {
    this._alive = false;
    this._timers.forEach((id) => clearTimeout(id));
    this._timers = [];
  },

  _buildSidebar(container) {
    const nav = container.querySelector('[data-nav]');
    nav.innerHTML = '';
    SIDEBAR_TREE.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'p3rec-nav-item' + (item.indent > 0 ? ' dim' : '') + (item.active ? ' active' : '');
      el.style.paddingLeft = `${8 + item.indent * 16}px`;
      const arrow = document.createElement('span');
      arrow.className = 'p3-nav-arrow';
      arrow.textContent = item.indent < 2 ? '\u25B8' : '\u203A';
      const icon = document.createElement('span');
      icon.className = 'p3rec-nav-icon';
      icon.textContent = item.icon;
      const label = document.createElement('span');
      label.textContent = item.label;
      el.appendChild(arrow);
      el.appendChild(icon);
      el.appendChild(label);
      nav.appendChild(el);
    });
  },

  _buildFolders(container) {
    const stage = container.querySelector('[data-folders]');
    stage.innerHTML = '';
    this._folderEls = {};
    this._revealed = {};

    const folders = [
      { name: 'Documentos', revealAt: 12, status: 'ok' },
      { name: 'Tareas', revealAt: 22, status: 'warn' },
      { name: 'Proyectos', revealAt: 32, status: 'ok' },
      { name: 'Clases', revealAt: 42, status: 'ok' },
      { name: 'Seguridad', revealAt: 52, status: 'warn' },
      { name: 'Multimedia', revealAt: 62, status: 'danger' },
    ];

    this._folders = folders;

    folders.forEach((f) => {
      const el = document.createElement('div');
      el.className = 'p3rec-folder';
      el.dataset.folder = f.name;
      const icon = document.createElement('span');
      icon.className = 'p3rec-folder-icon';
      icon.textContent = '\u25A4';
      const label = document.createElement('span');
      label.className = 'p3rec-folder-label';
      label.textContent = f.name;
      el.appendChild(icon);
      el.appendChild(label);
      stage.appendChild(el);
      this._folderEls[f.name] = el;
    });
  },

  _applyFolderStatus(folder) {
    const el = this._folderEls[folder.name];
    if (!el) return;
    const cfg = {
      ok: ['RECUPERADO', '\u2713'],
      warn: ['REVISAR', '!'],
      danger: ['ELIMINADO', '\u00D7'],
    }[folder.status];
    el.classList.add('state-' + folder.status);
    el.classList.remove('recovering');
    const badge = document.createElement('span');
    badge.className = 'p3rec-folder-badge';
    badge.textContent = `${cfg[1]} ${cfg[0]}`;
    el.appendChild(badge);
    if (folder.status === 'ok') AudioManager.playSFX(AUDIO_SFX.SUCCESS);
    else if (folder.status === 'warn') AudioManager.playSFX(AUDIO_SFX.WARNING);
    else AudioManager.playSFX(AUDIO_SFX.ALERT);
  },

  _sleep(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        this._timers = this._timers.filter((t) => t !== id);
        resolve();
      }, ms);
      this._timers.push(id);
    });
  },
};
