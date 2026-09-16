import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
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
  windowEl.style.animation = 'fadeIn 0.4s ease forwards';

  const titlebar = document.createElement('div');
  titlebar.className = 'p3-titlebar';
  titlebar.innerHTML = '<span>ACTIVIDAD 3 DE 3 \u00b7 RECUPERACIÓN DE ARCHIVOS</span>';
  windowEl.appendChild(titlebar);

  const situation = document.createElement('div');
  situation.className = 'p3-a3-situation';
  const h = document.createElement('h3');
  h.textContent = PHASE3.activity3.situationHeader;
  const p = document.createElement('p');
  p.textContent = PHASE3.activity3.situationText;
  situation.appendChild(h);
  situation.appendChild(p);
  windowEl.appendChild(situation);

  const filesInfo = document.createElement('div');
  filesInfo.className = 'p3-a3-files';
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
    filesInfo.appendChild(chip);
  });
  windowEl.appendChild(filesInfo);

  const hint = document.createElement('div');
  hint.className = 'p3-a3-hint';
  hint.innerHTML = '<strong>Pista:</strong> Revisa los registros de eventos. Las copias creadas DURANTE el incidente podrían estar comprometidas. La copia más reciente no siempre es la mejor opción.';
  windowEl.appendChild(hint);

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

  screen._a3OptionEls = optionEls;
  screen._a3FeedbackEl = feedback;
  screen._a3NextEl = nextBtn;
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
    screen._a3FeedbackEl.className = 'p3-feedback';
    screen._a3FeedbackEl.style.color = 'var(--p3-blue)';
  } else {
    screen._a3FeedbackEl.textContent =
      'Opci\u00f3n registrada. Recuerda: la copia m\u00e1s reciente minimiza la p\u00e9rdida de trabajo.';
    screen._a3FeedbackEl.className = 'p3-feedback';
    screen._a3FeedbackEl.style.color = 'var(--alert-yellow)';
  }
  screen._a3NextEl.style.display = 'inline-block';
}
