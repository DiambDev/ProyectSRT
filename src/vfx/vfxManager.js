import { EVENTS } from '../core/constants.js';
import { Glitch } from './glitch.js';
import { ScreenEffects } from './screenEffects.js';

export const VFXManager = {
  init() {
    window.addEventListener(EVENTS.VFX_TRIGGER, (e) => {
      const { effect, target, options } = e.detail;
      this.trigger(effect, target, options);
    });
  },

  trigger(effect, target, options = {}) {
    const el = target || document.getElementById('screen-container');
    switch (effect) {
      case 'glitch':
        Glitch.run(el, options.duration);
        break;
      case 'red-flash':
        ScreenEffects.redFlash(options.duration);
        break;
      case 'scanlines':
        ScreenEffects.scanlines();
        break;
      case 'error-shake':
        ScreenEffects.errorShake(el, options.duration);
        break;
      case 'pixel-corruption':
        return ScreenEffects.pixelCorruption(target, options);
      default:
        break;
    }
  },

  glitch(el, duration = 500) {
    Glitch.run(el, duration);
  },

  redFlash(duration = 300) {
    ScreenEffects.redFlash(duration);
  },

  scanlines() {
    ScreenEffects.scanlines();
  },

  pixelCorruption(target, options = {}) {
    return ScreenEffects.pixelCorruption(target, options);
  },
};