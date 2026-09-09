import { State } from '../../core/state.js';
import { AudioManager } from '../../audio/audioManager.js';
import { AUDIO_SFX } from '../../core/constants.js';

export function createButton({ text = '', classes = [], onClick = null, disabled = false } = {}) {
  const btn = document.createElement('button');
  btn.className = ['btn', ...classes].join(' ');
  btn.textContent = text;
  btn.dataset.btn = text;
  btn.disabled = disabled;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

export function createPopup({ title = '', message = '', content = null, buttonText = 'OK', onClose = null } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';

  const popup = document.createElement('div');
  popup.className = 'popup';

  const titleEl = document.createElement('h3');
  titleEl.className = 'popup-title';
  titleEl.textContent = title;

  const closeBtn = createButton({
    text: buttonText,
    onClick: () => {
      overlay.remove();
      if (onClose) onClose();
    },
  });

  popup.appendChild(titleEl);
  if (content) {
    popup.appendChild(content);
  } else if (message) {
    const messageEl = document.createElement('p');
    messageEl.className = 'popup-message';
    messageEl.textContent = message;
    popup.appendChild(messageEl);
  }
  popup.appendChild(closeBtn);
  overlay.appendChild(popup);

  document.getElementById('screen-container').appendChild(overlay);
  return overlay;
}

export function createLoadingIndicator({ text = 'Cargando' } = {}) {
  const el = document.createElement('div');
  el.className = 'loading-indicator';
  el.textContent = text;
  return el;
}

export function createVolumeControl() {
  const wrap = document.createElement('div');
  wrap.className = 'volume-control';

  const render = () => {
    const muted = State.get('muted');
    const pct = muted ? 0 : Math.max(0, Math.round(State.get('volume') * 100));
    wrap.innerHTML = `
      <button class="btn volume-btn" data-vol="down" aria-label="Bajar volumen">−</button>
      <div class="volume-bar" aria-hidden="true">
        <div class="volume-fill" style="width:${pct}%"></div>
      </div>
      <span class="volume-pct">${muted ? 'MUT' : pct + '%'}</span>
      <button class="btn volume-btn" data-vol="up" aria-label="Subir volumen">+</button>
      <button class="btn volume-btn ${muted ? 'active' : ''}" data-vol="mute">${muted ? 'UNMUT' : 'MUTE'}</button>
    `;
  };

  render();

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-vol]');
    if (!btn) return;
    const action = btn.dataset.vol;
    AudioManager.playSFX(AUDIO_SFX.CLICK);
    if (action === 'up') {
      AudioManager.setVolume(Math.min(1, State.get('volume') + 0.1));
    } else if (action === 'down') {
      AudioManager.setVolume(Math.max(0, State.get('volume') - 0.1));
    } else if (action === 'mute') {
      if (State.get('muted')) AudioManager.unmute();
      else AudioManager.mute();
    }
    render();
  });

  State.subscribe('volume', render);
  State.subscribe('muted', render);

  return wrap;
}