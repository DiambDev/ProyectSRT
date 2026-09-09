import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { State } from '../../../core/state.js';
import { PHASE3, scoreActivity3, formatScore } from './phase3Data.js';

export function renderActivity3(screen) {
  if (!screen._alive) return;
  screen._setP3({ currentActivity: 'activity3', activity3Decision: null });
  screen._a3Answered = false;
  screen.rootEl.innerHTML = '';

  if (screen._intervalId) {
    clearInterval(screen._intervalId);
    screen._intervalId = null;
  }

  const wrap = document.createElement('div');
  wrap.className = 'p3-activity p3-activity-3';

  const windowEl = document.createElement('div');
  windowEl.className = 'p3-a3-window';

  const titlebar = document.createElement('div');
  titlebar.className = 'p3-titlebar';
  titlebar.innerHTML = '<span>ACTIVIDAD 3 DE 3 · ARCHIVOS ELIMINADOS</span>';
  windowEl.appendChild(titlebar);

  const timerEl = document.createElement('div');
  timerEl.className = 'p3-a3-timer';
  timerEl.dataset.timer = 'a3';
  timerEl.textContent = '03:00';
  windowEl.appendChild(timerEl);

  const situation = document.createElement('div');
  situation.className = 'p3-a3-situation';
  const h = document.createElement('h3');
  h.textContent = PHASE3.activity3.situationHeader;
  const p = document.createElement('p');
  p.textContent = PHASE3.activity3.situationText;
  situation.appendChild(h);
  situation.appendChild(p);
  windowEl.appendChild(situation);

  const grid = document.createElement('div');
  grid.className = 'p3-a3-files';
  PHASE3.activity3.files.forEach((name) => {
    const chip = document.createElement('div');
    chip.className = 'p3-a3-filechip';
    const icon = document.createElement('span');
    icon.className = 'p3-file-icon';
    const ext = (name.split('.').pop() || 'file').toUpperCase().slice(0, 3);
    icon.textContent = ext;
    const n = document.createElement('span');
    n.textContent = name;
    chip.appendChild(icon);
    chip.appendChild(n);
    grid.appendChild(chip);
  });
  windowEl.appendChild(grid);

  const optionsEl = document.createElement('div');
  optionsEl.className = 'p3-a3-options';
  const optionEls = [];
  PHASE3.activity3.options.forEach((text, i) => {
    const opt = document.createElement('button');
    opt.className = 'btn p3-a3-option';
    opt.textContent = text;
    opt.dataset.choice = String(i);
    opt.addEventListener('click', () => {
      if (screen._a3Answered) return;
      screen._a3Answered = true;
      handleA3Pick(screen, optionEls, i);
    });
    optionEls.push(opt);
    optionsEl.appendChild(opt);
  });
  windowEl.appendChild(optionsEl);

  const feedback = document.createElement('p');
  feedback.className = 'p3-feedback';
  feedback.dataset.feedback = 'a3';
  windowEl.appendChild(feedback);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--primary p3-next';
  nextBtn.textContent = 'VER RESULTADO FINAL';
  nextBtn.dataset.action = 'next-a3';
  nextBtn.style.display = 'none';
  nextBtn.addEventListener('click', () => {
    AudioManager.playSFX(AUDIO_SFX.CLICK);
    screen._finishPhase3();
  });
  windowEl.appendChild(nextBtn);

  wrap.appendChild(windowEl);
  screen.rootEl.appendChild(wrap);

  screen._a3TimerEl = timerEl;
  screen._a3OptionEls = optionEls;
  screen._a3FeedbackEl = feedback;
  screen._a3NextEl = nextBtn;

  screen._a3SecondsLeft = PHASE3.activity3.timerSeconds;
  updateTimerDisplay(screen);

  screen._intervalId = setInterval(() => tickTimer(screen), 1000);
}

function tickTimer(screen) {
  if (!screen._alive) {
    if (screen._intervalId) clearInterval(screen._intervalId);
    screen._intervalId = null;
    return;
  }
  screen._a3SecondsLeft -= 1;
  screen._setP3({ activity3TimeLeft: Math.max(0, screen._a3SecondsLeft) });
  updateTimerDisplay(screen);

  if (screen._a3Answered) {
    if (screen._a3SecondsLeft <= 0) {
      if (screen._intervalId) clearInterval(screen._intervalId);
      screen._intervalId = null;
    }
    return;
  }

  if (screen._a3SecondsLeft <= 10) {
    AudioManager.playSFX(AUDIO_SFX.TICK);
    screen._a3TimerEl.classList.add('critical');
  } else if (screen._a3SecondsLeft <= 30) {
    screen._a3TimerEl.classList.add('low');
  }

  if (screen._a3SecondsLeft <= 0) {
    if (screen._intervalId) clearInterval(screen._intervalId);
    screen._intervalId = null;
    handleTimeout(screen);
  }
}

function updateTimerDisplay(screen) {
  const s = Math.max(0, screen._a3SecondsLeft);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  screen._a3TimerEl.textContent = `${mm}:${ss}`;
}

function handleA3Pick(screen, optionEls, index) {
  const correct = index === PHASE3.activity3.correctIndex;
  const score = scoreActivity3(index);
  const decision = PHASE3.activity3.options[index];

  screen._setP3({
    activity3Score: score,
    activity3Decision: decision,
    activity3Correct: correct,
  });

  AudioManager.playSFX(correct ? AUDIO_SFX.SUCCESS : AUDIO_SFX.ERROR);

  optionEls.forEach((o, i) => {
    o.disabled = true;
    if (i === index) o.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
    if (i === PHASE3.activity3.correctIndex) o.classList.add('reveal-correct');
  });

  if (correct) {
    screen._a3FeedbackEl.textContent = PHASE3.activity3.explanation;
    screen._a3FeedbackEl.className = 'p3-feedback text-green';
  } else {
    screen._a3FeedbackEl.textContent =
      'Opción registrada. Recuerda: la copia más reciente minimiza la pérdida de trabajo.';
    screen._a3FeedbackEl.className = 'p3-feedback text-yellow';
  }
  screen._a3NextEl.style.display = 'inline-block';
}

function handleTimeout(screen) {
  const decision = PHASE3.activity3.options[PHASE3.activity3.options.length - 1];
  screen._setP3({ activity3Decision: decision, activity3Score: 0 });
  screen._a3OptionEls.forEach((o) => { o.disabled = true; });
  screen._a3TimerEl.classList.add('critical');
  AudioManager.playSFX(AUDIO_SFX.ALERT);
  screen._a3FeedbackEl.textContent =
    'TIEMPO AGOTADO. Se registró: ' + decision + '.';
  screen._a3FeedbackEl.className = 'p3-feedback text-red';
  screen._setP3({ activity3TimeLeft: 0 });
  screen._a3NextEl.style.display = 'inline-block';
}