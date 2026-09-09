import { SCREENS } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';

export const phase3DefeatScreen = {
  id: SCREENS.PHASE_3_DEFEAT,

  render(container) {
    container.classList.add('screen--defeat');
    container.innerHTML = `
      <div class="defeat-icon">!</div>
      <h2 class="defeat-title">[DERROTA FASE 3]</h2>
      <p class="defeat-message">FALLO DE SEGURIDAD - REINICIAR PROTOCOLO</p>
      <button class="btn btn--alert" data-action="retry">REINICIAR</button>
    `;

    container.querySelector('[data-action="retry"]')
      .addEventListener('click', () => Router.show(SCREENS.INITIAL_LOADING));
  },

  async enter() {},

  async exit() {},
};