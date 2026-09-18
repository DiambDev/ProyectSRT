import { audioConfig } from './audioConfig.js';
import { EVENTS, AUDIO_SFX } from '../core/constants.js';
import { State } from '../core/state.js';

const audioElements = new Map();
const assetAvailable = new Map();
let currentMusic = null;
let synthCtx = null;

function ensureCtx() {
  const AC = window.AudioContext || (typeof window.webkitAudioContext === 'function' ? window.webkitAudioContext : null);
  if (!AC) return null;
  if (!synthCtx) synthCtx = new AC();
  if (synthCtx.state === 'suspended') synthCtx.resume();
  return synthCtx;
}

function tone({ freq = 440, endFreq = null, duration = 0.15, type = 'square', gain = 0.05, when = 0 }) {
  const ctx = ensureCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + duration);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst({ duration = 0.2, gain = 0.06, when = 0 } = {}) {
  const ctx = ensureCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = gain;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 900;
  src.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  src.start(t0);
}

const synthPatches = {
  click: (s) => tone({ freq: 640, endFreq: 420, duration: 0.08, type: 'square', gain: 0.045 * s }),
  hover: (s) => tone({ freq: 900, duration: 0.04, type: 'sine', gain: 0.025 * s }),
  transition: (s) => tone({ freq: 220, endFreq: 880, duration: 0.28, type: 'sine', gain: 0.04 * s }),
  loading: (s) => tone({ freq: 300, duration: 0.1, type: 'triangle', gain: 0.045 * s }),
  typing: (s) => noiseBurst({ duration: 0.03, gain: 0.03 * s }),
  error: (s) => {
    tone({ freq: 170, endFreq: 70, duration: 0.4, type: 'sawtooth', gain: 0.06 * s });
    noiseBurst({ duration: 0.35, gain: 0.05 * s });
  },
  success: (s) => {
    [523, 659, 784].forEach((f, i) => tone({ freq: f, duration: 0.16, type: 'triangle', gain: 0.055 * s, when: i * 0.09 }));
  },
  glitch: (s) => {
    noiseBurst({ duration: 0.3, gain: 0.09 * s });
    [150, 95, 220].forEach((f) => tone({ freq: f, duration: 0.06, type: 'square', gain: 0.05 * s }));
  },
  alert: (s) => {
    tone({ freq: 880, duration: 0.16, type: 'square', gain: 0.05 * s });
    tone({ freq: 660, duration: 0.16, type: 'square', gain: 0.05 * s, when: 0.18 });
    tone({ freq: 880, duration: 0.16, type: 'square', gain: 0.05 * s, when: 0.36 });
  },
  popup: (s) => tone({ freq: 500, endFreq: 720, duration: 0.22, type: 'sine', gain: 0.055 * s }),
  interaction: (s) => tone({ freq: 480, duration: 0.07, type: 'triangle', gain: 0.05 * s }),
  warning: (s) => {
    tone({ freq: 660, duration: 0.14, type: 'square', gain: 0.05 * s });
    tone({ freq: 520, duration: 0.14, type: 'square', gain: 0.05 * s, when: 0.16 });
  },
  delete: (s) => {
    tone({ freq: 140, endFreq: 60, duration: 0.22, type: 'sawtooth', gain: 0.06 * s });
    noiseBurst({ duration: 0.18, gain: 0.04 * s });
  },
  tick: (s) => tone({ freq: 880, duration: 0.03, type: 'sine', gain: 0.03 * s }),
};

function playSynth(name, scale) {
  const patch = synthPatches[name];
  if (!patch) return;
  const vol = State.get('muted') ? 0 : State.get('volume');
  if (vol <= 0) return;
  patch(scale);
}

async function probeAssets() {
  const probe = async (key, src) => {
    if (!src) {
      assetAvailable.set(key, false);
      return;
    }
    try {
      const res = await fetch(src, { method: 'HEAD' });
      assetAvailable.set(key, res.ok);
    } catch {
      assetAvailable.set(key, false);
    }
  };
  for (const [name, cfg] of Object.entries(audioConfig.sfx)) await probe(`sfx-${name}`, cfg.src);
  for (const [name, cfg] of Object.entries(audioConfig.music)) await probe(`music-${name}`, cfg.src);
}

export const AudioManager = {
  async init() {
    this._probeDone = false;
    window.addEventListener(EVENTS.AUDIO_PLAY_SFX, (e) => {
      this.playSFX(e.detail.sfx);
    });
    window.addEventListener(EVENTS.AUDIO_PLAY_MUSIC, (e) => {
      this.playMusic(e.detail.track);
    });
    window.addEventListener(EVENTS.AUDIO_STOP_MUSIC, () => {
      this.stopMusic();
    });
    window.addEventListener(EVENTS.SCREEN_CHANGE, () => {
      this.playSFX(AUDIO_SFX.TRANSITION);
    });
    window.addEventListener('pointerdown', () => {
      const c = ensureCtx();
      if (c && c.state === 'suspended') c.resume();
    });
    await probeAssets().finally(() => {
      this._probeDone = true;
    });
  },

  async playSFX(sfxName) {
    const cfg = audioConfig.sfx[sfxName];
    if (!cfg) return;
    const scale = cfg.volume * Math.max(0, Math.min(1, State.get('volume'))) * (State.get('muted') ? 0 : 1);
    if (scale <= 0) return;
    const key = `sfx-${sfxName}`;
    const avail = assetAvailable.get(key);
    if (avail === false || (!this._probeDone && avail === undefined)) {
      playSynth(sfxName, scale);
      return;
    }
    if (avail === true) {
      let el = audioElements.get(key);
      if (!el) {
        el = new Audio(cfg.src);
        el.preload = 'auto';
        audioElements.set(key, el);
      }
      const clone = el.cloneNode();
      clone.volume = scale;
      try {
        await clone.play();
      } catch {
        playSynth(sfxName, scale);
      }
    } else {
      playSynth(sfxName, scale);
    }
  },

  async playMusic(trackName) {
    const cfg = audioConfig.music[trackName];
    if (!cfg) return;
    this.stopMusic();
    const key = `music-${trackName}`;
    if (assetAvailable.get(key) === false) return;
    let audio = audioElements.get(key);
    if (!audio) {
      audio = new Audio(cfg.src);
      audio.loop = cfg.loop || false;
      audioElements.set(key, audio);
    }
    audio.volume = cfg.volume * State.get('volume') * (State.get('muted') ? 0 : 1);
    try {
      await audio.play();
      currentMusic = audio;
    } catch {
      // asset ausente: fallar silenciosamente
    }
  },

  stopMusic() {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
      currentMusic = null;
    }
  },

  setVolume(val) {
    State.set('volume', Math.max(0, Math.min(1, val)));
    if (currentMusic) {
      const trackName = [...audioElements.entries()]
        .find(([, a]) => a === currentMusic)?.[0]?.replace('music-', '');
      if (trackName) {
        const config = audioConfig.music[trackName];
        if (config) currentMusic.volume = config.volume * State.get('volume');
      }
    }
  },

  mute() {
    State.set('muted', true);
    if (currentMusic) currentMusic.volume = 0;
  },

  unmute() {
    State.set('muted', false);
    if (currentMusic) {
      const trackName = [...audioElements.entries()]
        .find(([, a]) => a === currentMusic)?.[0]?.replace('music-', '');
      if (trackName) {
        const config = audioConfig.music[trackName];
        if (config) currentMusic.volume = config.volume * State.get('volume');
      }
    }
  },

  playButtonSFX() {
    this.playSFX(AUDIO_SFX.CLICK);
  },
};