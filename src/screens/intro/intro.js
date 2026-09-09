import { SCREENS, AUDIO_SFX } from '../../core/constants.js';
import { Router } from '../../core/router.js';
import { AudioManager } from '../../audio/audioManager.js';
import { UIManager } from '../../ui/uiManager.js';
import { typewriter } from '../../ui/typewriter.js';

const ALERT_MSG =
  'Se ha detectado una intrusión de un hacker. El sistema de seguridad necesita tu ayuda para ejecutarse correctamente.';

const DIAG_LINES = [
  ['auth.d', 'pattern: unauthorized_shell'],
  ['fw-core', 'anon egress blocked'],
  ['ids-1', 'sig 1042 matched'],
  ['auth.d', 'replay attempt logged'],
  ['fw-core', 'rate limit engaged'],
  ['ids-2', 'beacon to 203.0.113.9'],
  ['auth.d', 'ticket valid, rbac:restrict'],
  ['procwatch', 'spawn chain flagged'],
  ['fw-core', 'tunnel teardown'],
  ['ids-1', 'escalation queued'],
];

export const introScreen = {
  id: SCREENS.INTRO,
  _alive: false,
  _timers: new Set(),

  render(container) {
    container.classList.add('screen--intro');
    container.innerHTML = `
      <div class="intro-bg">
        <div class="intro-diag intro-diag--left"></div>
        <div class="intro-diag intro-diag--right"></div>
      </div>
      <div class="intro-topbar">
        <span class="intro-topbar-id">T-SECURE CONSOLE // SESIÓN 0x2F</span>
        <span class="intro-topbar-clock" data-clock>--:--:--</span>
      </div>
      <div class="intro-alert">
        <div class="intro-alert-head">
          <span class="intro-alert-tag">INCIDENTE DETECTADO</span>
          <span class="intro-alert-code">REF:INT-2290-1902</span>
        </div>
        <h2 class="intro-alert-title">ALERTA DE INTRUSIÓN</h2>
        <p class="intro-alert-msg"></p>
        <div class="intro-alert-meta">
          <span>NIVEL DE AMENAZA: <b>CRÍTICO</b></span>
          <span>ORIGEN: WEB-001</span>
          <span>VENTANA: 04:32</span>
        </div>
        <button class="btn btn--primary btn--start" data-action="start">INICIAR</button>
      </div>
      <div class="intro-footer">TECSUP ha desarrollado este programa. El equipo no se encuentra bajo ninguna amenaza ni riesgo.</div>
    `;
    container.appendChild(UIManager.createVolumeControl());

    const start = container.querySelector('[data-action="start"]');
    start.addEventListener('click', () => {
      if (!this._alive) return;
      AudioManager.playSFX(AUDIO_SFX.CLICK);
      AudioManager.playSFX(AUDIO_SFX.TRANSITION);
      Router.show(SCREENS.PHASE_1_LOADING);
    });
    UIManager.bindButtonSFX(start);
  },

  async enter() {
    this._alive = true;
    this._timers.clear();

    AudioManager.playSFX(AUDIO_SFX.ALERT);

    const title = this.container.querySelector('.intro-alert-title');
    if (title) {
      title.classList.remove('reveal-in');
      title.classList.add('reveal-in');
    }

    const msg = this.container.querySelector('.intro-alert-msg');
    if (msg) {
      await typewriter(msg, ALERT_MSG, {
        speed: 16,
        sound: AUDIO_SFX.TYPING,
        audio: AudioManager,
        alive: () => this._alive,
      });
    }

    this._spawnDiag();
    const clockEl = this.container.querySelector('[data-clock]');
    this._clockInterval = setInterval(() => {
      if (!this._alive) {
        clearInterval(this._clockInterval);
        return;
      }
      if (clockEl) {
        const d = new Date();
        clockEl.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      }
    }, 1000);
  },

  async exit() {
    this._alive = false;
    if (this._clockInterval) clearInterval(this._clockInterval);
    this._timers.forEach((id) => clearTimeout(id));
    this._timers.clear();
  },

  _schedule(fn, ms) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      if (this._alive) fn();
    }, ms);
    this._timers.add(id);
  },

  _spawnDiag() {
    const left = this.container.querySelector('.intro-diag--left');
    const right = this.container.querySelector('.intro-diag--right');
    if (!left || !right) return;
    DIAG_LINES.forEach((line, i) => {
      const el = document.createElement('div');
      el.className = 'intro-diag-line';
      el.textContent = `[${String(i + 8).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}] ${line[0]} :: ${line[1]}`;
      const target = i % 2 === 0 ? left : right;
      this._schedule(() => {
        target.appendChild(el);
        el.classList.add('on');
      }, 400 + i * 260);
    });
  },
};