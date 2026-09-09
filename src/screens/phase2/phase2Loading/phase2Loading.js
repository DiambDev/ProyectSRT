import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { VFXManager } from '../../../vfx/vfxManager.js';
import { PHASE2_LOADING_TITLE, PHASE2_LOADING_LINES } from '../phase2Game/phase2Data.js';

export const phase2LoadingScreen = {
  id: SCREENS.PHASE_2_LOADING,
  _alive: false,
  _timer: null,

  render(container) {
    container.classList.add('screen--phase-loading', 'screen--phase2', 'screen--p2-restore');
    container.innerHTML = `
      <div class="p2restore">
        <div class="p2restore-window">
          <div class="p2restore-titlebar">
            <span data-title>${PHASE2_LOADING_TITLE}</span>
            <div class="p2restore-dots"><span></span><span></span><span></span></div>
          </div>
          <div class="p2restore-body">
            <div class="p2restore-heading" data-heading>CONECTANDO AL CANAL DE COMUNICACIÓN</div>
            <div class="p2restore-lines" data-lines></div>
            <div class="p2restore-progress">
              <div class="p2restore-progress-track">
                <div class="p2restore-progress-fill" data-fill></div>
              </div>
              <div class="p2restore-percent" data-percent>0%</div>
            </div>
          </div>
        </div>
      </div>
    `;
    container.querySelector('[data-title]').textContent = PHASE2_LOADING_TITLE;
    container.querySelector('[data-heading]').textContent = 'CONECTANDO AL CANAL DE COMUNICACIÓN';
  },

  async enter() {
    this._alive = true;
    AudioManager.playSFX(AUDIO_SFX.LOADING);

    const fill = this.container.querySelector('[data-fill]');
    const percent = this.container.querySelector('[data-percent]');
    const linesEl = this.container.querySelector('[data-lines]');
    const done = () => this._alive === false;

    const revealAt = PHASE2_LOADING_LINES.map((_, i) =>
      Math.round(((i + 1) / PHASE2_LOADING_LINES.length) * 100) - 4
    );
    const revealed = new Set();

    let progress = 0;
    while (progress < 100 && !done()) {
      progress = Math.min(100, progress + 2);
      fill.style.width = `${progress}%`;
      percent.textContent = `${progress}%`;

      let stalled = false;
      PHASE2_LOADING_LINES.forEach((line, i) => {
        if (!revealed.has(i) && progress >= revealAt[i]) {
          revealed.add(i);
          const el = document.createElement('div');
          el.className = 'p2restore-line';
          el.textContent = line;
          linesEl.appendChild(el);
          if (i === PHASE2_LOADING_LINES.length - 1) AudioManager.playSFX(AUDIO_SFX.SUCCESS);
        }
      });

      if (progress >= 52 && progress <= 56) {
        AudioManager.playSFX(AUDIO_SFX.GLITCH);
        VFXManager.glitch(this.container, 500);
        fill.style.width = '54%';
        percent.textContent = '54%';
        await this._sleep(600);
        stalled = true;
      }

      if (!stalled) await this._sleep(90);
    }
    if (done()) return;

    await this._sleep(400);
    if (done()) return;

    AudioManager.playSFX(AUDIO_SFX.TRANSITION);
    Router.show(SCREENS.PHASE_2);
  },

  async exit() {
    this._alive = false;
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
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