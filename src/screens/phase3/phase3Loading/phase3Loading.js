import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { VFXManager } from '../../../vfx/vfxManager.js';

const FOLDERS = [
  { name: 'Documentos', revealAt: 14, status: 'ok' },
  { name: 'Tareas', revealAt: 26, status: 'warn' },
  { name: 'Proyectos', revealAt: 38, status: 'ok' },
  { name: 'Clases', revealAt: 50, status: 'ok' },
  { name: 'Seguridad', revealAt: 62, status: 'warn' },
  { name: 'Multimedia', revealAt: 70, status: 'danger' },
];

const STATUS_LABELS = {
  ok: ['RECUPERADO', '✓'],
  warn: ['REVISAR', '!'],
  danger: ['ELIMINADO', '×'],
};

const STATUS_TEXTS = [
  'Analizando unidades...',
  'Reconstruyendo estructura...',
  'Verificando integridad...',
];

export const phase3LoadingScreen = {
  id: SCREENS.PHASE_3_LOADING,
  _alive: false,
  _timer: null,

  render(container) {
    container.classList.add('screen--phase-loading', 'screen--phase3', 'screen--p3-recovery');
    container.innerHTML = `
      <div class="p3rec-root">
        <div class="p3rec-window">
          <div class="p3rec-titlebar">
            <span>RECUPERACIÓN DE ARCHIVOS</span>
            <div class="p3rec-dots"><span></span><span></span><span></span></div>
          </div>
          <div class="p3rec-body">
            <aside class="p3rec-nav">
              <div class="p3rec-nav-item"><span class="p3-nav-arrow">▸</span>Este equipo</div>
              <div class="p3rec-nav-item"><span class="p3-nav-arrow">▸</span>Documentos</div>
              <div class="p3rec-nav-item dim"><span class="p3-nav-arrow">›</span>Descargas</div>
              <div class="p3rec-nav-item dim"><span class="p3-nav-arrow">›</span>Imágenes</div>
            </aside>
            <div class="p3rec-main">
              <div class="p3rec-heading">RECUPERANDO ARCHIVOS DEL SISTEMA</div>
              <div class="p3rec-status" data-status>Analizando unidades...</div>
              <div class="p3rec-folders" data-folders></div>
              <div class="p3rec-progress">
                <div class="p3rec-progress-track">
                  <div class="p3rec-progress-fill" data-fill></div>
                </div>
                <div class="p3rec-percent" data-percent>0%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    this._buildFolders(container);
  },

  async enter() {
    this._alive = true;
    AudioManager.playSFX(AUDIO_SFX.LOADING);

    const fill = this.container.querySelector('[data-fill]');
    const percent = this.container.querySelector('[data-percent]');
    const status = this.container.querySelector('[data-status]');
    const done = () => this._alive === false;

    let progress = 0;
    while (progress < 100 && !done()) {
      progress = Math.min(100, progress + 2);
      fill.style.width = `${progress}%`;
      percent.textContent = `${progress}%`;

      if (progress <= 33) status.textContent = STATUS_TEXTS[0];
      else if (progress <= 66) status.textContent = STATUS_TEXTS[1];
      else status.textContent = STATUS_TEXTS[2];

      FOLDERS.forEach((f) => {
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

      await this._sleep(110);
    }
    if (done()) return;

    await this._sleep(600);
    if (done()) return;

    AudioManager.playSFX(AUDIO_SFX.GLITCH);
    VFXManager.glitch(this.container, 600);
    await this._sleep(700);
    if (done()) return;

    Router.show(SCREENS.PHASE_3);
  },

  async exit() {
    this._alive = false;
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
  },

  _buildFolders(container) {
    const stage = container.querySelector('[data-folders]');
    stage.innerHTML = '';
    this._folderEls = {};
    this._revealed = {};
    FOLDERS.forEach((f) => {
      const el = document.createElement('div');
      el.className = 'p3rec-folder';
      el.dataset.folder = f.name;
      const icon = document.createElement('span');
      icon.className = 'p3rec-folder-icon';
      icon.textContent = '▤';
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
    const cfg = STATUS_LABELS[folder.status];
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
      this._timer = setTimeout(() => {
        this._timer = null;
        resolve();
      }, ms);
    });
  },
};