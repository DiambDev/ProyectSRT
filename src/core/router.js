import { EVENTS, DEFAULT_TRANSITION } from './constants.js';
import { State } from './state.js';

const container = () => document.getElementById('screen-container');

const screens = new Map();
let currentScreen = null;
let transitioning = false;
let pendingNavigation = null;

export const Router = {
  register(screenDef) {
    screens.set(screenDef.id, screenDef);
  },

  registerAll(screenDefs) {
    screenDefs.forEach((def) => this.register(def));
  },

  async show(screenId, options = {}) {
    if (transitioning) {
      pendingNavigation = { screenId, options };
      return;
    }
    const nextScreen = screens.get(screenId);
    if (!nextScreen) {
      console.warn(`[Router] Screen not found: ${screenId}`);
      return;
    }

    transitioning = true;
    const transition = { ...DEFAULT_TRANSITION, ...options.transition };

    window.dispatchEvent(new CustomEvent(EVENTS.SCREEN_CHANGE, {
      detail: { from: currentScreen?.id, to: screenId },
    }));

    if (currentScreen) {
      await this._exitScreen(currentScreen, transition);
    }

    State.set('currentScreen', screenId);
    await this._enterScreen(nextScreen, transition);
    currentScreen = nextScreen;
    transitioning = false;

    window.dispatchEvent(new CustomEvent(EVENTS.SCREEN_ENTERED, {
      detail: { screenId },
    }));

    if (pendingNavigation) {
      const pending = pendingNavigation;
      pendingNavigation = null;
      await this.show(pending.screenId, pending.options);
    }
  },

  getCurrentScreenId() {
    return currentScreen?.id || null;
  },

  getScreenDef(id) {
    return screens.get(id);
  },

  async _exitScreen(screen, transition) {
    if (screen.container) {
      screen.container.classList.add('transitioning-out');
      if (transition.type === 'fade') {
        screen.container.style.transition = `opacity ${transition.duration}ms ease`;
        screen.container.style.opacity = '0';
      }
      await this._wait(transition.duration);
      if (screen.exit) await screen.exit();
      screen.container.classList.remove('active', 'transitioning-out');
      screen.container.style.transition = '';
      screen.container.style.opacity = '';
    }
  },

  async _enterScreen(screen, transition) {
    const el = container();
    if (screen.container && screen.container.parentNode) {
      screen.container.parentNode.removeChild(screen.container);
    }
    screen.container = document.createElement('div');
    screen.container.className = 'screen';
    screen.container.id = `screen-${screen.id}`;
    if (screen.render) screen.render(screen.container);
    el.appendChild(screen.container);
    screen.container.classList.add('active');
    screen.container.style.opacity = '0';
    screen.container.style.transition = `opacity ${transition.duration}ms ease`;
    requestAnimationFrame(() => {
      screen.container.style.opacity = '1';
    });
    if (screen.enter) await screen.enter();
  },

  _wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};
