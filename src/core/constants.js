export const SCREENS = {
  INITIAL_LOADING: 'initial-loading',
  INTRO: 'intro',
  PHASE_1_LOADING: 'phase1-loading',
  PHASE_1: 'phase1',
  PHASE_1_DEFEAT_LOADING: 'phase1-defeat-loading',
  PHASE_1_DEFEAT: 'phase1-defeat',
  PHASE_2_LOADING: 'phase2-loading',
  PHASE_2: 'phase2',
  PHASE_2_DEFEAT_LOADING: 'phase2-defeat-loading',
  PHASE_2_DEFEAT: 'phase2-defeat',
  PHASE_3_LOADING: 'phase3-loading',
  PHASE_3: 'phase3',
  PHASE_3_DEFEAT_LOADING: 'phase3-defeat-loading',
  PHASE_3_DEFEAT: 'phase3-defeat',
  ACHIEVEMENT_LOADING: 'achievement-loading',
  ACHIEVEMENT: 'achievement',
};

export const EVENTS = {
  SCREEN_CHANGE: 'screen:change',
  SCREEN_ENTERED: 'screen:entered',
  SCREEN_EXITED: 'screen:exited',
  STATE_CHANGE: 'state:change',
  AUDIO_PLAY_SFX: 'audio:play-sfx',
  AUDIO_PLAY_MUSIC: 'audio:play-music',
  AUDIO_STOP_MUSIC: 'audio:stop-music',
  VFX_TRIGGER: 'vfx:trigger',
  PHASE_COMPLETE: 'phase:complete',
  PHASE_FAIL: 'phase:fail',
  RESTART: 'restart',
};

export const AUDIO_SFX = {
  CLICK: 'click',
  HOVER: 'hover',
  TRANSITION: 'transition',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  GLITCH: 'glitch',
  ALERT: 'alert',
  INTERACTION: 'interaction',
  TYPING: 'typing',
  POPUP: 'popup',
  WARNING: 'warning',
  DELETE: 'delete',
  TICK: 'tick',
};

export const DEFAULT_TRANSITION = {
  duration: 400,
  type: 'fade',
};
