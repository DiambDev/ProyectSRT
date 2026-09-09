import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { State } from '../../../core/state.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { typewriter } from '../../../ui/typewriter.js';
import { buildFragments } from '../fragmentPools.js';

const DEFEAT_MSG =
  'La intrusión continúa y el sistema sigue expuesto. El protocolo exige comprender el concepto y aplicar las medidas en el orden correcto. Debes reiniciar el escenario y responder de nuevo. Cada intento acerca al control.';

const IMPACTS = [
  [44, 38], [70, 60],
];

export const phase1DefeatScreen = {
  id: SCREENS.PHASE_1_DEFEAT,
  _alive: false,
  _timers: new Set(),

  render(container) {
    container.classList.add('screen--defeat', 'screen--defeat-p1');
    container.innerHTML = `
      <div class="p1d">
        <div class="p1d-logs"></div>
        <div class="p1d-crack"></div>
        <div class="p1d-body">
          <div class="defeat-icon">!</div>
          <h2 class="defeat-title">FASE 1 FALLIDA</h2>
          <p class="defeat-message" data-msg></p>
          <button class="btn btn--alert" data-action="retry">REINICIAR</button>
        </div>
      </div>
    `;
    container.querySelector('[data-action="retry"]')
      .addEventListener('click', () => {
        if (!this._alive) return;
        AudioManager.playSFX(AUDIO_SFX.CLICK);
        AudioManager.playSFX(AUDIO_SFX.TRANSITION);
        State.resetGame();
        Router.show(SCREENS.INITIAL_LOADING);
      });
  },

  async enter() {
    this._alive = true;
    this._timers.clear();

    const p1d = this.container.querySelector('.p1d');
    this._setVar(p1d, '--threat', '#ff2020');

    AudioManager.playSFX(AUDIO_SFX.ALERT);
    AudioManager.playSFX(AUDIO_SFX.ERROR);

    this._degradeIn(p1d);
    this._spawnWords();
    this._spawnCracks();

    const msg = this.container.querySelector('[data-msg]');
    if (msg) {
      await typewriter(msg, DEFEAT_MSG, {
        speed: 8,
        sound: AUDIO_SFX.TYPING,
        audio: AudioManager,
        alive: () => this._alive,
      });
    }
  },

  async exit() {
    this._alive = false;
    this._timers.forEach((id) => clearTimeout(id));
    this._timers.clear();
  },

  _setVar(el, name, value) {
    if (!el || !el.style) return;
    if (typeof el.style.setProperty === 'function') el.style.setProperty(name, value);
    else el.style[name] = value;
  },

  _schedule(fn, ms) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      if (this._alive) fn();
    }, ms);
    this._timers.add(id);
  },

  _degradeIn(el) {
    const stops = ['#ff9a30', '#ff5a2a', '#ff3830', '#ff2020'];
    stops.forEach((color, i) => {
      this._schedule(() => {
        if (!this._alive) return;
        this._setVar(el, '--threat', color);
        el.classList.remove('deg-1', 'deg-2', 'deg-3');
        el.classList.add('deg-' + (i + 1));
      }, i * 320);
    });
  },

  _spawnWords() {
    const words = buildFragments(96);
    const logs = this.container.querySelector('.p1d-logs');
    if (!logs) return;
    words.forEach((w, i) => {
      const el = document.createElement('span');
      el.classList.add('p1dl-word', 'p1d-word');
      el.textContent = w;
      el.style.left = ((i * 47) % 100) + '%';
      el.style.top = ((i * 29) % 100) + '%';
      el.style.fontSize = (10 + (i % 5) * 3) + 'px';
      if (i % 4 === 0) el.style.transform = `rotate(${(i % 2 ? 1 : -1) * (i % 6)}deg)`;
      el.classList.add(i % 5 === 0 ? 'typed' : 'flicker');
      logs.appendChild(el);
      this._schedule(() => el.classList.add('on'), 120 + (i % 34) * 36);
    });
  },

  _spawnCracks() {
    const holder = this.container.querySelector('.p1d-crack');
    if (!holder) return;
    IMPACTS.forEach(([x, y]) => {
      const rays = 7 + (Math.random() * 4 | 0);
      for (let i = 0; i < rays; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'p1d-ray-wrap';
        wrap.style.left = x + '%';
        wrap.style.top = y + '%';
        wrap.style.transform = `rotate(${i * (360 / rays) + (Math.random() * 10 - 5)}deg)`;
        const ray = document.createElement('div');
        ray.className = 'p1d-ray';
        ray.style.height = 50 + Math.random() * 150 + 'px';
        this._setVar(ray, '--ray-delay', (i * 110) + 'ms');
        wrap.appendChild(ray);
        holder.appendChild(wrap);
      }
      const shards = 5 + (Math.random() * 4 | 0);
      for (let i = 0; i < shards; i++) {
        const shard = document.createElement('div');
        shard.className = 'p1d-shard';
        shard.style.left = ((x + i * 41) % 90) + '%';
        shard.style.top = ((y - 6 + i * 37) % 90) + '%';
        shard.style.transform = `rotate(${i * 53 + 12}deg)`;
        this._setVar(shard, '--shard-delay', (i * 130) + 'ms');
        holder.appendChild(shard);
      }
    });
  },
};