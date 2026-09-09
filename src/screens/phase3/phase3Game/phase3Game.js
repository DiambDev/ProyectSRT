import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { State } from '../../../core/state.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE3, computeFinalScore } from './phase3Data.js';
import { generateFiles } from './phase3Files.js';
import { renderReport } from './report.js';
import { renderActivity1 } from './activity1.js';
import { renderActivity2 } from './activity2.js';
import { renderActivity3 } from './activity3.js';

export const phase3GameScreen = {
  id: SCREENS.PHASE_3,
  implemented: true,
  _alive: false,
  _timers: new Set(),
  _intervalId: null,

  render(container) {
    container.classList.add('screen--phase3');
    container.innerHTML = '<div class="phase3-root"></div>';
    this.rootEl = container.querySelector('.phase3-root');
  },

  async enter() {
    this._alive = true;
    this._timers.clear();
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    State.set('currentPhase', 3);
    this._setP3({
      currentActivity: 'report',
      activity1Score: 0,
      activity2Raw: 0,
      activity2Score: 0,
      activity3Score: 0,
      finalScore: 0,
      recoveredFiles: PHASE3.recovered,
      modifiedFiles: PHASE3.modified,
      deletedFiles: PHASE3.deleted,
      files: generateFiles(),
      deletedByUser: [],
      correctDeletions: 0,
      incorrectDeletions: 0,
      activity3Decision: null,
      activity3TimeLeft: PHASE3.activity3.timerSeconds,
      completed: false,
    });
    AudioManager.playMusic('phase3');
    this._buildReport();
  },

  async exit() {
    this._alive = false;
    this._timers.forEach((id) => clearTimeout(id));
    this._timers.clear();
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    AudioManager.stopMusic();
  },

  _setP3(patch) {
    State.set('phase3State', { ...State.get('phase3State'), ...patch });
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

  _buildReport() {
    renderReport(this);
  },

  _buildActivity1() {
    renderActivity1(this);
  },

  _buildActivity2() {
    renderActivity2(this);
  },

  _buildActivity3() {
    renderActivity3(this);
  },

  _finishPhase3() {
    const s = State.get('phase3State');
    const final = computeFinalScore(s.activity1Score, s.activity2Score, s.activity3Score);
    this._setP3({ finalScore: final, completed: true, currentActivity: 'final' });
    State.set('gameProgress', { ...State.get('gameProgress'), phase3: 'completed', achievement: true });
    AudioManager.playSFX(AUDIO_SFX.SUCCESS);
    Router.show(SCREENS.ACHIEVEMENT_LOADING);
  },
};