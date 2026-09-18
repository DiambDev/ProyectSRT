import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { AudioManager } from '../../../audio/audioManager.js';

export const phase3DefeatLoadingScreen = {
  id: SCREENS.PHASE_3_DEFEAT_LOADING,
  _timer: null,

  render(container) {
    container.classList.add('screen--defeat-loading');
    container.innerHTML = `
      <div class="screen-label text-red">[FALLO FASE 3]</div>
      <div class="loading-indicator">PROCESANDO FALLO</div>
      <div class="loading-bar"></div>
      <div class="loading-text">ACELERACION DE PROTOCOLO</div>
    `;
  },

  async enter() {
    AudioManager.playSFX(AUDIO_SFX.ERROR);
    this._timer = setTimeout(() => Router.show(SCREENS.PHASE_3_DEFEAT), 2200);
  },

  async exit() {
    clearTimeout(this._timer);
  },
};