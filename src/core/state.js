import { EVENTS } from './constants.js';

const initialState = {
  currentScreen: null,
  currentPhase: 0,
  volume: 0.7,
  muted: false,
  gameProgress: {
    phase1: 'pending',
    phase2: 'locked',
    phase3: 'locked',
    achievement: false,
  },
  phase1State: {},
  phase2State: {
    currentContact: null,
    currentTurn: null,
    contactsCompleted: 0,
    decisions: [],
    verifiedContacts: [],
    phase2Completed: false,
  },
  phase3State: {
    currentActivity: 'report',
    activity1Score: 0,
    activity2Raw: 0,
    activity2Score: 0,
    activity3Score: 0,
    finalScore: 0,
    recoveredFiles: 50,
    modifiedFiles: 20,
    deletedFiles: 5,
    files: [],
    deletedByUser: [],
    correctDeletions: 0,
    incorrectDeletions: 0,
    activity3Decision: null,
    activity3TimeLeft: 180,
    completed: false,
  },
  achievementState: {},
};

let state = { ...initialState };

const listeners = new Map();

function emit(event, data) {
  window.dispatchEvent(new CustomEvent(event, { detail: data }));
}

export const State = {
  get(key) {
    return key ? state[key] : { ...state };
  },

  set(key, value) {
    const prev = state[key];
    state[key] = value;
    emit(EVENTS.STATE_CHANGE, { key, prev, value });
  },

  update(partial) {
    const prev = { ...state };
    Object.assign(state, partial);
    emit(EVENTS.STATE_CHANGE, { key: null, prev, value: { ...state } });
  },

  reset() {
    const prev = { ...state };
    state = { ...initialState };
    emit(EVENTS.STATE_CHANGE, { key: null, prev, value: { ...state } });
  },

  resetGame() {
    const prev = { ...state };
    state = { ...initialState, volume: state.volume, muted: state.muted };
    emit(EVENTS.STATE_CHANGE, { key: null, prev, value: { ...state } });
  },

  subscribe(key, callback) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(callback);
    return () => listeners.get(key).delete(callback);
  },
};

window.addEventListener(EVENTS.STATE_CHANGE, (e) => {
  const { key, value } = e.detail;
  const cbs = listeners.get(key);
  if (cbs) cbs.forEach((cb) => cb(value));
  const allCbs = listeners.get('*');
  if (allCbs) allCbs.forEach((cb) => cb(value));
});
