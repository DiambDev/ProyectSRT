import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';

const DETAILS = [
  'ESTABLECIENDO CANAL SEGURO...',
  'VERIFICANDO CERTIFICADO TLS...',
  'COMPARANDO HUELLAS DIGITALES...',
  'VALIDANDO FIRMA DEL SERVIDOR...',
];

const LOG_NOTE = ['canal cifrado AES-256', 'handshake validado', 'firma verificada', 'huella coincidente', 'sesión autorizada'];

export const phase1LoadingScreen = {
  id: SCREENS.PHASE_1_LOADING,
  _alive: false,
  _timers: new Set(),

  render(container) {
    container.classList.add('screen--phase-loading', 'screen--phase1');
    container.innerHTML = `
      <div class="screen-label">[FASE 1]</div>
      <div class="p1l-box">
        <div class="p1l-status" data-status>VERIFICANDO IDENTIDAD DEL OPERADOR</div>
        <div class="p1l-sub">ENLACE CIFRADO // CANAL SEGURO</div>
        <div class="p1l-progress" data-bar>
          <div class="p1l-progress-fill"></div>
        </div>
        <div class="p1l-percent" data-percent>0%</div>
        <div class="p1l-blocks">
          <div class="p1l-block"><span class="p1l-block-label">BLOQUE 01</span><div class="p1l-block-bar" data-block-bar="0"><i></i></div></div>
          <div class="p1l-block"><span class="p1l-block-label">BLOQUE 02</span><div class="p1l-block-bar" data-block-bar="1"><i></i></div></div>
          <div class="p1l-block"><span class="p1l-block-label">BLOQUE 03</span><div class="p1l-block-bar" data-block-bar="2"><i></i></div></div>
        </div>
        <div class="p1l-log" data-log></div>
        <div class="p1l-detail" data-detail>${DETAILS[0]}</div>
      </div>
    `;
  },

  async enter() {
    this._alive = true;
    this._timers.clear();

    this.statusEl = this.container.querySelector('[data-status]');
    this.barEl = this.container.querySelector('[data-bar]');
    this.fillEl = this.barEl.querySelector('.p1l-progress-fill');
    this.percentEl = this.container.querySelector('[data-percent]');
    this.detailEl = this.container.querySelector('[data-detail]');
    this.logEl = this.container.querySelector('[data-log]');
    this.blockFills = [];
    this.blockBars = [];
    for (let i = 0; i < 3; i++) {
      const bar = this.container.querySelector('[data-block-bar="' + i + '"]');
      this.blockFills.push(bar ? bar.querySelector('i') : null);
      this.blockBars.push(bar);
    }

    this.fillEl.style.width = '0%';
    this.percentEl.textContent = '0%';
    this.detailEl.textContent = DETAILS[0];

    AudioManager.playSFX(AUDIO_SFX.LOADING);

    let progress = 0;
    let detailIdx = 0;
    let logIdx = 0;
    let ticks = 0;
    let block3Failed = false;
    let block3FailProgress = 0;
    this._progressInterval = setInterval(() => {
      if (!this._alive) {
        clearInterval(this._progressInterval);
        return;
      }
      ticks++;
      progress = Math.min(100, progress + 1 + Math.floor(Math.random() * 3));
      this.fillEl.style.width = progress + '%';
      this.percentEl.textContent = progress + '%';

      this.blockFills.forEach((f, idx) => {
        if (!f) return;
        if (idx === 2) {
          if (!block3Failed) {
            if (progress <= 60) {
              f.style.width = progress + '%';
              block3FailProgress = progress;
            } else if (!block3Failed) {
              block3Failed = true;
              f.style.width = block3FailProgress + '%';
              f.style.background = 'var(--alert-red)';
              f.style.boxShadow = '0 0 10px rgba(255, 32, 32, 0.6)';
              const bar = this.blockBars[2];
              if (bar) {
                bar.style.borderColor = 'rgba(255, 32, 32, 0.6)';
                bar.style.background = 'rgba(255, 32, 32, 0.08)';
              }
              const label = this.container.querySelectorAll('.p1l-block-label');
              if (label[2]) {
                label[2].style.color = 'var(--alert-red)';
                label[2].textContent = 'BLOQUE 03 \u2014 FALLO';
              }
              AudioManager.playSFX(AUDIO_SFX.ERROR);
              this._pushLog('BLOQUE 03: error de integridad \u2014 FALLO CR\u00cdTICO');
              this.detailEl.textContent = 'FALLO DETECTADO EN BLOQUE 03 \u2014 COMPONENTE CR\u00cdTICO';
              this.detailEl.style.color = 'var(--alert-red)';
            }
          }
        } else {
          f.style.width = progress + '%';
        }
      });

      if (ticks % 5 === 0) AudioManager.playSFX(AUDIO_SFX.INTERACTION);

      if (progress >= 25 && detailIdx < 1 && !block3Failed) {
        detailIdx = 1;
        this.detailEl.textContent = DETAILS[detailIdx];
        this._pushLog(LOG_NOTE[0]);
        AudioManager.playSFX(AUDIO_SFX.TICK);
      }
      if (progress >= 50 && detailIdx < 2 && !block3Failed) {
        detailIdx = 2;
        this.detailEl.textContent = DETAILS[detailIdx];
        this._pushLog(LOG_NOTE[1]);
        AudioManager.playSFX(AUDIO_SFX.TICK);
      }

      if (ticks % 12 === 0 && logIdx < LOG_NOTE.length) {
        this._pushLog(LOG_NOTE[Math.min(logIdx, LOG_NOTE.length - 1)]);
        logIdx++;
      }

      if (progress >= 100) {
        clearInterval(this._progressInterval);
        this._complete();
      }
    }, 70);
    this._timers.add(this._progressInterval);
  },

  _pushLog(note) {
    if (!this._alive || !this.logEl) return;
    const line = document.createElement('div');
    line.className = 'p1l-log-line';
    line.textContent = '> ' + note + ' ... OK';
    this.logEl.appendChild(line);
  },

  async _complete() {
    if (!this._alive) return;
    this.statusEl.textContent = 'IDENTIDAD VERIFICADA // ACCESO CONCEDIDO';
    this.statusEl.classList.add('ok');
    this.detailEl.textContent = 'BIENVENIDO, OPERADOR';
    AudioManager.playSFX(AUDIO_SFX.SUCCESS);
    this._pushLog('acceso concedido');
    await this._sleep(700);
    if (!this._alive) return;
    AudioManager.playSFX(AUDIO_SFX.TRANSITION);
    Router.show(SCREENS.PHASE_1);
  },

  async exit() {
    this._alive = false;
    if (this._progressInterval) clearInterval(this._progressInterval);
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
};