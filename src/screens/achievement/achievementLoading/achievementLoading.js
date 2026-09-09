import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';

const LOGO_CANDIDATES = [
  'assets/images/tecsup-logo.png',
  'assets/images/tecsup-logo.svg',
  'assets/images/tecsup-logo.jpg',
  'assets/images/logo-tecsup.png',
];

export const achievementLoadingScreen = {
  id: SCREENS.ACHIEVEMENT_LOADING,
  _alive: false,
  _timers: new Set(),

  render(container) {
    container.classList.add('screen--achievement', 'screen--result-loading');
    container.innerHTML = `
      <div class="result-loading">
        <div class="result-logo" data-logo></div>
        <div class="result-loading-title">ANÁLISIS FINALIZADO</div>
        <div class="result-loading-lines">
          <p data-line="1" class="off">GENERANDO REPORTE DE SEGURIDAD...</p>
          <p data-line="2" class="off">CALCULANDO RESULTADOS...</p>
        </div>
        <div class="loading-bar"></div>
      </div>
    `;
  },

  async enter() {
    this._alive = true;
    this._timers.clear();
    AudioManager.playSFX(AUDIO_SFX.LOADING);

    const logo = this.container.querySelector('[data-logo]');
    const lines = {
      1: this.container.querySelector('[data-line="1"]'),
      2: this.container.querySelector('[data-line="2"]'),
    };

    await this._mountLogo(logo);
    this._reveal(lines[1], AUDIO_SFX.LOADING);
    this._reveal(lines[2], AUDIO_SFX.SUCCESS, 800);

    await this._sleep(2300);
    if (!this._alive) return;
    Router.show(SCREENS.ACHIEVEMENT);
  },

  async exit() {
    this._alive = false;
    this._timers.forEach((id) => clearTimeout(id));
    this._timers.clear();
  },

  async _mountLogo(logoEl) {
    logoEl.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'result-logo-img';
    img.alt = 'TECSUP';

    let mounted = false;
    for (const src of LOGO_CANDIDATES) {
      let ok = false;
      try {
        const res = await fetch(src, { method: 'HEAD' });
        ok = res.ok;
      } catch {
        ok = false;
      }
      if (ok) {
        img.src = src;
        logoEl.appendChild(img);
        mounted = true;
        break;
      }
      if (!this._alive) break;
    }

    if (!mounted) {
      const ph = document.createElement('div');
      ph.className = 'result-logo-placeholder';
      ph.textContent = 'TECSUP';
      logoEl.appendChild(ph);
    }
  },

  _reveal(el, sfx, delay = 0) {
    const id = setTimeout(() => {
      if (!this._alive) return;
      el.classList.remove('off');
      el.classList.add('on');
      AudioManager.playSFX(sfx);
    }, delay);
    this._timers.add(id);
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