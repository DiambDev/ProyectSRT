import { createButton, createPopup, createLoadingIndicator, createVolumeControl } from './components/index.js';
import { AudioManager } from '../audio/audioManager.js';
import { AUDIO_SFX } from '../core/constants.js';

export const UIManager = {
  init() {
    this._bindGlobalEvents();
  },

  _bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (btn && !btn.disabled && !btn.hasAttribute('data-vol')) {
        AudioManager.playSFX(AUDIO_SFX.CLICK);
      }
    });
  },

  createButton(options) {
    return createButton(options);
  },

  createPopup(options) {
    return createPopup(options);
  },

  createLoadingIndicator(options) {
    return createLoadingIndicator(options);
  },

  createVolumeControl() {
    return createVolumeControl();
  },

  bindButtonSFX(btn) {
    btn.addEventListener('mouseenter', () => AudioManager.playSFX(AUDIO_SFX.HOVER));
  },
};