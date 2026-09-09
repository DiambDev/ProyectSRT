import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { State } from '../../../core/state.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE2_DEFEAT_TITLE, PHASE2_DEFEAT_MESSAGE } from '../phase2Game/phase2Data.js';

export const phase2DefeatScreen = {
  id: SCREENS.PHASE_2_DEFEAT,

  render(container) {
    container.classList.add('screen--defeat');
    container.innerHTML = `
      <div class="defeat-icon">!</div>
      <h2 class="defeat-title"></h2>
      <p class="defeat-message"></p>
      <button class="btn btn--alert" data-action="retry">REINTENTAR</button>
    `;
    container.querySelector('.defeat-title').textContent = PHASE2_DEFEAT_TITLE;
    container.querySelector('.defeat-message').textContent = PHASE2_DEFEAT_MESSAGE;
    container.querySelector('[data-action="retry"]')
      .addEventListener('click', () => {
        State.resetGame();
        AudioManager.playSFX(AUDIO_SFX.TRANSITION);
        Router.show(SCREENS.INITIAL_LOADING);
      });
  },

  async enter() {
    AudioManager.playSFX(AUDIO_SFX.ALERT);
  },

  async exit() {},
};