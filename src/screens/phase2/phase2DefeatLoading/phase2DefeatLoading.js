import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { VFXManager } from '../../../vfx/vfxManager.js';
import {
  PHASE2_FLOOD_POOL,
  PHASE2_ALERT_POOL,
  PHASE2_DEFEAT_FINAL_LINES,
} from '../phase2Game/phase2Data.js';

export const phase2DefeatLoadingScreen = {
  id: SCREENS.PHASE_2_DEFEAT_LOADING,
  _alive: false,
  _timers: [],

  render(container) {
    container.classList.add('screen--defeat-loading');
    container.innerHTML = `
      <div class="p2dl-stage">
        <div class="p2dl-flood" data-flood></div>
        <div class="p2dl-windows" data-windows></div>
        <div class="p2dl-dark" data-dark></div>
        <div class="p2dl-msg" data-msg></div>
        <div class="p2dl-sub" data-sub></div>
      </div>
    `;
    this._els = {
      flood: container.querySelector('[data-flood]'),
      windows: container.querySelector('[data-windows]'),
      dark: container.querySelector('[data-dark]'),
      msg: container.querySelector('[data-msg]'),
      sub: container.querySelector('[data-sub]'),
    };
  },

  async enter() {
    this._alive = true;
    AudioManager.playSFX(AUDIO_SFX.ALERT);
    AudioManager.playSFX(AUDIO_SFX.GLITCH);

    const done = () => this._alive === false;

    for (let i = 0; i < 30 && !done(); i++) {
      const item = document.createElement('div');
      item.className = 'p2dl-flood-item';
      item.textContent = PHASE2_FLOOD_POOL[i % PHASE2_FLOOD_POOL.length];
      this._els.flood.appendChild(item);
      if (i % 4 === 0) AudioManager.playSFX(AUDIO_SFX.TYPING);
      await this._sleep(70);
    }
    if (done()) return;

    VFXManager.glitch(this.container, 500);
    for (let i = 0; i < 50 && !done(); i++) {
      const win = document.createElement('div');
      win.className = 'p2-window-alert';
      win.style.left = `${(i * 37) % 88}%`;
      win.style.top = `${(i * 23) % 82}%`;
      win.textContent = PHASE2_ALERT_POOL[i % PHASE2_ALERT_POOL.length];
      this._els.windows.appendChild(win);
      if (i % 7 === 0) AudioManager.playSFX(AUDIO_SFX.ALERT);
      if (i % 5 === 0) await this._sleep(30);
    }
    if (done()) return;

    VFXManager.glitch(this.container, 600);
    for (let o = 0; o <= 9 && !done(); o++) {
      this._els.dark.style.opacity = String(o / 10);
      await this._sleep(70);
    }
    if (done()) return;

    this._els.msg.textContent = PHASE2_DEFEAT_FINAL_LINES[0];
    this._els.msg.classList.add('on');
    AudioManager.playSFX(AUDIO_SFX.ERROR);
    await this._sleep(900);
    if (done()) return;

    this._els.sub.textContent = PHASE2_DEFEAT_FINAL_LINES[1];
    this._els.sub.classList.add('on');
    AudioManager.playSFX(AUDIO_SFX.ERROR);
    await this._sleep(1200);
    if (done()) return;

    Router.show(SCREENS.PHASE_2_DEFEAT);
  },

  async exit() {
    this._alive = false;
    this._timers.forEach((t) => clearTimeout(t));
    this._timers = [];
  },

  _sleep(ms) {
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        this._timers = this._timers.filter((x) => x !== t);
        resolve();
      }, ms);
      this._timers.push(t);
    });
  },
};