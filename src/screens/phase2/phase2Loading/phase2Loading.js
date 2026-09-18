import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { VFXManager } from '../../../vfx/vfxManager.js';
import {
  PHASE2_LOADING_TITLE,
  PHASE2_LOADING_HEADING,
  PHASE2_LOADING_HEADING_DONE,
  PHASE2_LOADING_LINES,
  PHASE2_LOADING_NODES,
  PHASE2_LOADING_NET_STATUS,
  PHASE2_LOADING_METRICS,
  PHASE2_LOADING_DIAG,
} from '../phase2Game/phase2Data.js';

export const phase2LoadingScreen = {
  id: SCREENS.PHASE_2_LOADING,
  _alive: false,
  _timer: null,
  _streamTimers: [],

  render(container) {
    container.classList.add('screen--phase-loading', 'screen--phase2', 'screen--p2-restore');
    container.innerHTML = `
      <div class="p2restore-stage" data-stage>
        <aside class="p2rst-side p2rst-side--nodes" data-net></aside>
        <div class="p2restore-window">
          <div class="p2restore-titlebar">
            <span data-title>${PHASE2_LOADING_TITLE}</span>
            <div class="p2restore-dots"><span></span><span></span><span></span></div>
          </div>
          <div class="p2restore-body">
            <div class="p2restore-heading">
              <span data-heading>${PHASE2_LOADING_HEADING}</span>
            </div>
            <div class="p2restore-lines" data-lines></div>
            <div class="p2restore-metrics" data-metrics></div>
            <div class="p2restore-progress">
              <div class="p2restore-progress-track">
                <div class="p2restore-progress-fill" data-fill></div>
              </div>
              <div class="p2restore-percent" data-percent>0%</div>
            </div>
          </div>
        </div>
        <aside class="p2rst-side p2rst-side--diag" data-diag></aside>
        <footer class="p2rst-rail" data-ticker></footer>
      </div>
    `;
    this._els = {
      stage: container.querySelector('[data-stage]'),
      net: container.querySelector('[data-net]'),
      diag: container.querySelector('[data-diag]'),
      ticker: container.querySelector('[data-ticker]'),
      metrics: container.querySelector('[data-metrics]'),
      title: container.querySelector('[data-title]'),
      heading: container.querySelector('[data-heading]'),
      lines: container.querySelector('[data-lines]'),
      fill: container.querySelector('[data-fill]'),
      percent: container.querySelector('[data-percent]'),
    };
    this._els.title.textContent = PHASE2_LOADING_TITLE;
    this._els.heading.textContent = PHASE2_LOADING_HEADING;
  },

  async enter() {
    this._alive = true;
    this._streamTimers = [];
    AudioManager.playSFX(AUDIO_SFX.LOADING);

    this._buildNodes();
    this._streamDiag();
    this._packetLoop();
    this._tickerLoop();

    const fill = this._els.fill;
    const percent = this._els.percent;
    const linesEl = this._els.lines;
    const heading = this._els.heading;
    const stage = this._els.stage;
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
      stage.setAttribute('data-pct', String(progress));
      if (!stage.classList.contains('is-restoring') && progress >= 22) stage.classList.add('is-restoring');
      if (!stage.classList.contains('is-bridging') && progress >= 58) stage.classList.add('is-bridging');
      if (!stage.classList.contains('is-live') && progress >= 90) stage.classList.add('is-live');

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

    heading.textContent = PHASE2_LOADING_HEADING_DONE;
    AudioManager.playSFX(AUDIO_SFX.SUCCESS);
    await this._sleep(600);
    if (done()) return;

    AudioManager.playSFX(AUDIO_SFX.TRANSITION);
    Router.show(SCREENS.PHASE_2);
  },

  async exit() {
    this._alive = false;
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
    this._streamTimers.forEach((t) => clearInterval(t));
    this._streamTimers = [];
  },

  _buildNodes() {
    if (!this._alive) return;
    this._els.net.innerHTML = '';
    PHASE2_LOADING_NODES.forEach((label, i) => {
      const node = document.createElement('div');
      node.className = 'p2r-node';
      node.dataset.node = String(i);
      node.textContent = label;
      const wiring = document.createElement('span');
      wiring.className = 'p2r-node-wire';
      node.appendChild(wiring);
      this._els.net.appendChild(node);
    });
  },

  _streamDiag() {
    let idx = 0;
    const t = setInterval(() => {
      if (!this._alive) return;
      const line = document.createElement('div');
      line.className = 'p2r-diag';
      line.textContent = PHASE2_LOADING_DIAG[idx % PHASE2_LOADING_DIAG.length];
      this._els.diag.appendChild(line);
      if (this._els.diag.children.length > 20) this._els.diag.children[0].remove();
      idx++;
    }, 420);
    this._streamTimers.push(t);
  },

  _packetLoop() {
    let idx = 0;
    const t = setInterval(() => {
      if (!this._alive) return;
      const p = document.createElement('div');
      p.className = 'p2r-packet';
      p.style.top = `${(idx * 13) % 78}%`;
      p.style.animationDelay = `${(idx % 7) * 0.09}s`;
      const status = PHASE2_LOADING_NET_STATUS[idx % PHASE2_LOADING_NET_STATUS.length];
      p.dataset.pkt = status === 'activo' ? 'ok' : status === 'estable' ? 'ok' : 'busy';
      this._els.net.appendChild(p);
      if (this._els.net.children.length > 40) this._els.net.children[1].remove();
      if (idx % 9 === 2) AudioManager.playSFX(AUDIO_SFX.TICK);
      idx++;
    }, 130);
    this._streamTimers.push(t);
  },

  _tickerLoop() {
    let metricIdx = 0;
    const t = setInterval(() => {
      if (!this._alive) return;
      const seg = document.createElement('div');
      seg.className = 'p2r-ticker';
      seg.textContent = `[${PHASE2_LOADING_METRICS[metricIdx % PHASE2_LOADING_METRICS.length][0]} ${PHASE2_LOADING_METRICS[metricIdx % PHASE2_LOADING_METRICS.length][1]}] · enlace:${PHASE2_LOADING_NET_STATUS[metricIdx % PHASE2_LOADING_NET_STATUS.length]}`;
      this._els.ticker.appendChild(seg);
      while (this._els.ticker.children.length > 16) this._els.ticker.children[0].remove();
      metricIdx++;
    }, 480);
    this._streamTimers.push(t);
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