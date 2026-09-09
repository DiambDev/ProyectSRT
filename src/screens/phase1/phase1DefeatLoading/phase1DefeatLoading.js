import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { buildFragments } from '../fragmentPools.js';

const THREAT_STEPS = [
  ['#00ff41', 0], ['#9bd63f', 0], ['#f0c040', 1], ['#f09a30', 1],
  ['#ff8230', 2], ['#ff5a2a', 2], ['#ff3830', 3], ['#ff2020', 3],
];

const IMPACTS = [
  [38, 32], [66, 55],
];

export const phase1DefeatLoadingScreen = {
  id: SCREENS.PHASE_1_DEFEAT_LOADING,
  _alive: false,
  _timers: new Set(),

  render(container) {
    container.classList.add('screen--defeat-loading', 'screen--defeat-p1-loading');
    container.innerHTML = `
      <div class="p1dl">
        <div class="p1dl-stage" data-danger>
          <div class="p1dl-core">CONTROL PERDIDO</div>
        </div>
        <div class="p1dl-frag"></div>
        <div class="p1dl-words"></div>
      </div>
    `;
  },

  async enter() {
    this._alive = true;
    this._timers.clear();

    this.stage = this.container.querySelector('[data-danger]');
    this.fragEl = this.container.querySelector('.p1dl-frag');
    this.wordsEl = this.container.querySelector('.p1dl-words');

    AudioManager.playSFX(AUDIO_SFX.GLITCH);
    AudioManager.playSFX(AUDIO_SFX.ALERT);

    this._startDegrade();
    this._spawnFragments();
    this._spawnCracks();
    this._spawnWords();

    await this._sleep(4200);
    if (!this._alive) return;
    AudioManager.playSFX(AUDIO_SFX.ERROR);
    await this._sleep(500);
    if (!this._alive) return;
    Router.show(SCREENS.PHASE_1_DEFEAT);
  },

  async exit() {
    this._alive = false;
    if (this._degradeInterval) clearInterval(this._degradeInterval);
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

  _schedule(fn, ms) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      if (this._alive) fn();
    }, ms);
    this._timers.add(id);
  },

  _setVar(el, name, value) {
    if (!el || !el.style) return;
    if (typeof el.style.setProperty === 'function') el.style.setProperty(name, value);
    else el.style[name] = value;
  },

  _startDegrade() {
    let step = 0;
    this._degradeInterval = setInterval(() => {
      if (!this._alive) {
        clearInterval(this._degradeInterval);
        return;
      }
      if (step >= THREAT_STEPS.length) {
        clearInterval(this._degradeInterval);
        return;
      }
      const [color, lvl] = THREAT_STEPS[step];
      if (this.stage) {
        this._setVar(this.stage, '--threat', color);
        this.stage.classList.remove('lvl-0', 'lvl-1', 'lvl-2', 'lvl-3');
        this.stage.classList.add('lvl-' + lvl);
      }
      if (step === 4) AudioManager.playSFX(AUDIO_SFX.WARNING);
      if (step === 6) AudioManager.playSFX(AUDIO_SFX.ALERT);
      step++;
    }, 460);
  },

  _spawnWords() {
    const words = buildFragments(96);
    words.forEach((w, i) => {
      const el = document.createElement('span');
      el.className = 'p1dl-word';
      el.textContent = w;
      el.style.left = ((i * 43) % 100) + '%';
      el.style.top = ((i * 61) % 100) + '%';
      el.style.fontSize = (11 + (i % 4) * 3) + 'px';
      if (i % 3 === 0) el.style.transform = `rotate(${(i % 2 ? 1 : -1) * (i % 5)}deg)`;
      if (i % 7 === 0) el.classList.add('typed');
      else el.classList.add('flicker');
      this.wordsEl.appendChild(el);
      this._schedule(() => el.classList.add('on'), 200 + (i % 30) * 42);
    });
  },

  _spawnFragments() {
    const lines = buildFragments(64);
    lines.forEach((line, i) => {
      const el = document.createElement('div');
      el.className = 'p1dl-frag-line' + (i % 2 ? ' dim' : '');
      el.textContent = line;
      this.fragEl.appendChild(el);
    });
  },

  _spawnCracks() {
    const holder = document.createElement('div');
    holder.className = 'p1dl-crack';
    IMPACTS.forEach(([x, y]) => {
      const rays = 6 + (Math.random() * 3 | 0);
      for (let i = 0; i < rays; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'p1dl-ray-wrap';
        wrap.style.left = x + '%';
        wrap.style.top = y + '%';
        wrap.style.transform = `rotate(${i * (360 / rays) + (Math.random() * 8 - 4)}deg)`;
        const ray = document.createElement('div');
        ray.className = 'p1dl-ray';
        ray.style.height = 60 + Math.random() * 140 + 'px';
        this._setVar(ray, '--ray-delay', (i * 90) + 'ms');
        wrap.appendChild(ray);
        holder.appendChild(wrap);
      }
      const shards = 4 + (Math.random() * 4 | 0);
      for (let i = 0; i < shards; i++) {
        const shard = document.createElement('div');
        shard.className = 'p1dl-shard';
        shard.style.left = ((x + i * 37) % 90) + '%';
        shard.style.top = ((y - 4 + i * 53) % 90) + '%';
        shard.style.transform = `rotate(${i * 47 + 8}deg)`;
        this._setVar(shard, '--shard-delay', (i * 120) + 'ms');
        holder.appendChild(shard);
      }
    });
    this.fragEl.appendChild(holder);
  },
};