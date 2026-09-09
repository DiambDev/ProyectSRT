import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';

export const achievementLoadingScreen = {
  id: SCREENS.ACHIEVEMENT_LOADING,
  _alive: false,
  _timers: [],

  render(container) {
    container.classList.add('screen--achievement', 'screen--result-loading');
    container.innerHTML = `
      <div class="result-loading">
        <div class="result-logo" data-logo></div>
        <div class="result-loading-title">DESAFÍO COMPLETADO</div>
        <div class="result-loading-lines">
          <p data-line="1" class="off">GENERANDO REPORTE DE SEGURIDAD...</p>
          <p data-line="2" class="off">CALCULANDO RESULTADOS...</p>
          <p data-line="3" class="off">PREPARANDO ANÁLISIS FINAL...</p>
        </div>
        <div class="loading-bar"></div>
      </div>
    `;
  },

  async enter() {
    this._alive = true;
    this._timers = [];
    AudioManager.playSFX(AUDIO_SFX.LOADING);

    const logo = this.container.querySelector('[data-logo]');
    const lines = {
      1: this.container.querySelector('[data-line="1"]'),
      2: this.container.querySelector('[data-line="2"]'),
      3: this.container.querySelector('[data-line="3"]'),
    };

    this._mountLogo(logo);
    if (!this._alive) return;

    this._reveal(lines[1], AUDIO_SFX.LOADING);
    this._reveal(lines[2], AUDIO_SFX.SUCCESS, 900);
    this._reveal(lines[3], AUDIO_SFX.SUCCESS, 1700);

    await this._sleep(3000);
    if (!this._alive) return;
    Router.show(SCREENS.ACHIEVEMENT);
  },

  async exit() {
    this._alive = false;
    this._timers.forEach((id) => clearTimeout(id));
    this._timers = [];
  },

  _mountLogo(logoEl) {
    logoEl.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'result-logo-img';
    img.alt = 'TECSUP';
    img.src = 'src/images/tecsuplogo1.png';
    img.style.maxHeight = '80px';
    img.style.maxWidth = '280px';
    logoEl.appendChild(img);
  },

  _reveal(el, sfx, delay = 0) {
    const id = setTimeout(() => {
      if (!this._alive) return;
      el.classList.remove('off');
      el.classList.add('on');
      AudioManager.playSFX(sfx);
    }, delay);
    this._timers.push(id);
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
