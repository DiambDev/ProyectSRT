import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { State } from '../../../core/state.js';
import { AudioManager } from '../../../audio/audioManager.js';
import {
  PHASE2_DEFEAT_TITLE,
  PHASE2_DEFEAT_MESSAGE,
  PHASE2_WINDOW_TITLES,
  PHASE2_ALERT_POOL,
  PHASE2_SYS_LOG_POOL,
} from '../phase2Game/phase2Data.js';

export const phase2DefeatScreen = {
  id: SCREENS.PHASE_2_DEFEAT,
  _alive: false,
  _timers: [],
  _logTimer: null,

  render(container) {
    container.classList.add('screen--defeat', 'screen--defeat-p2');
    container.innerHTML = `
      <div class="p2d-stage" data-stage>
        <div class="p2d-bg" data-bg></div>
        <div class="p2d-noise" data-noise></div>
        <div class="p2d-bars" data-bars></div>
        <div class="p2d-windows" data-windows></div>
        <div class="p2d-logs" data-logs></div>
        <div class="p2d-center">
          <h2 class="p2d-title" data-title></h2>
          <p class="p2d-message" data-message></p>
          <button class="btn btn--alert" data-action="retry">REINTENTAR</button>
        </div>
      </div>
    `;
    container.querySelector('[data-title]').textContent = PHASE2_DEFEAT_TITLE;
    container.querySelector('[data-message]').textContent = PHASE2_DEFEAT_MESSAGE;
    container.querySelector('[data-action="retry"]')
      .addEventListener('click', () => {
        State.resetGame();
        AudioManager.playSFX(AUDIO_SFX.TRANSITION);
        Router.show(SCREENS.INITIAL_LOADING);
      });
  },

  async enter() {
    this._alive = true;
    this._timers = [];
    AudioManager.playSFX(AUDIO_SFX.ALERT);
    AudioManager.playSFX(AUDIO_SFX.ERROR);

    const stage = this.container.querySelector('[data-stage]');
    const bg = this.container.querySelector('[data-bg]');
    const windows = this.container.querySelector('[data-windows]');
    const logs = this.container.querySelector('[data-logs]');

    const done = () => this._alive === false;

    stage.classList.add('is-secure');
    const bgTimer = setTimeout(() => {
      if (done()) return;
      stage.classList.remove('is-secure');
      stage.classList.add('is-warn');
      bg.classList.add('is-warn');
    }, 1500);
    this._timers.push(bgTimer);
    const critTimer = setTimeout(() => {
      if (done()) return;
      stage.classList.remove('is-warn');
      stage.classList.add('is-crit');
      bg.classList.add('is-crit');
    }, 3000);
    this._timers.push(critTimer);

    for (let i = 0; i < 18 && !done(); i++) {
      this._spawnWindow(windows, i);
      if (i % 3 === 2) AudioManager.playSFX(AUDIO_SFX.ERROR);
      await this._sleep(i % 4 === 3 ? 120 : 55);
    }
    if (done()) return;

    let logIdx = 0;
    this._logTimer = setInterval(() => {
      if (done()) return;
      const el = document.createElement('div');
      el.className = 'p2d-log';
      el.textContent = PHASE2_SYS_LOG_POOL[logIdx % PHASE2_SYS_LOG_POOL.length];
      logs.appendChild(el);
      while (logs.children.length > 150) logs.children[0].remove();
      logIdx++;
    }, 120);
    this._streamTimers = [this._logTimer];

    let shuffleIdx = 0;
    this._shuffleTimer = setInterval(() => {
      if (done()) return;
      if (windows.children.length) windows.children[shuffleIdx % windows.children.length].classList.add('is-flicker');
      shuffleIdx++;
    }, 900);
    this._streamTimers.push(this._shuffleTimer);
  },

  _spawnWindow(windows, i) {
    const win = document.createElement('div');
    win.className = 'p2d-win';
    win.style.left = `${(i * 43) % 86}%`;
    win.style.top = `${(i * 29) % 78}%`;
    win.style.width = `${118 + (i % 4) * 22}px`;
    const title = PHASE2_WINDOW_TITLES.length
      ? PHASE2_WINDOW_TITLES[i % PHASE2_WINDOW_TITLES.length]
      : PHASE2_ALERT_POOL[i % PHASE2_ALERT_POOL.length];
    win.textContent = title;
    win.style.animationDelay = `${(i % 5) * 0.14}s`;
    windows.appendChild(win);
  },

  async exit() {
    this._alive = false;
    this._timers.forEach((t) => clearTimeout(t));
    this._timers = [];
    if (this._streamTimers) this._streamTimers.forEach((t) => clearInterval(t));
    this._streamTimers = [];
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