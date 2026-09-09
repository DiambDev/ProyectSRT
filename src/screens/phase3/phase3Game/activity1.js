import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE3, scoreActivity1, formatScore } from './phase3Data.js';

export function renderActivity1(screen) {
  if (!screen._alive) return;
  screen._setP3({ currentActivity: 'activity1' });
  screen._a1Answered = false;
  screen.rootEl.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'p3-activity p3-activity-1';
  wrap.style.animation = 'fadeIn 0.4s ease forwards';

  const tag = document.createElement('div');
  tag.className = 'p3-stage-chip';
  tag.textContent = 'ACTIVIDAD 1 DE 3';
  wrap.appendChild(tag);

  const title = document.createElement('h2');
  title.className = 'p3-activity-title';
  title.textContent = PHASE3.activity1.title;
  wrap.appendChild(title);

  const question = document.createElement('p');
  question.className = 'p3-question';
  question.textContent = PHASE3.activity1.question;
  wrap.appendChild(question);

  const optionsEl = document.createElement('div');
  optionsEl.className = 'p3-options';

  const indices = PHASE3.activity1.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const optionEls = [];
  indices.forEach((originalIndex) => {
    const opt = document.createElement('button');
    opt.className = 'btn p3-option';
    opt.textContent = PHASE3.activity1.options[originalIndex];
    opt.dataset.choice = String(originalIndex);
    opt.addEventListener('click', () => {
      if (screen._a1Answered) return;
      screen._a1Answered = true;
      handleA1Pick(screen, optionEls, originalIndex);
    });
    optionEls.push(opt);
    optionsEl.appendChild(opt);
  });
  wrap.appendChild(optionsEl);

  const feedback = document.createElement('p');
  feedback.className = 'p3-feedback';
  feedback.dataset.feedback = 'a1';
  wrap.appendChild(feedback);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--primary p3-next';
  nextBtn.textContent = 'CONTINUAR A ACTIVIDAD 2';
  nextBtn.dataset.action = 'next-a1';
  nextBtn.style.display = 'none';
  nextBtn.addEventListener('click', () => {
    AudioManager.playSFX(AUDIO_SFX.CLICK);
    screen._buildActivity2();
  });
  wrap.appendChild(nextBtn);

  screen.rootEl.appendChild(wrap);
  screen._a1FeedbackEl = feedback;
  screen._a1NextEl = nextBtn;
}

function handleA1Pick(screen, optionEls, index) {
  const correct = index === PHASE3.activity1.correctIndex;
  const score = scoreActivity1(index);
  screen._setP3({ activity1Score: score });
  AudioManager.playSFX(correct ? AUDIO_SFX.SUCCESS : AUDIO_SFX.ERROR);

  optionEls.forEach((o, i) => {
    o.disabled = true;
    if (i === index) o.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
    if (i === PHASE3.activity1.correctIndex) o.classList.add('reveal-correct');
  });

  screen._a1FeedbackEl.textContent =
    correct ? PHASE3.activity1.feedback.correct : PHASE3.activity1.feedback.incorrect;
  screen._a1FeedbackEl.className = 'p3-feedback';
  screen._a1FeedbackEl.style.color = correct ? 'var(--p3-blue)' : 'var(--alert-red)';
  screen._a1FeedbackEl.dataset.summary = 'a1:' + formatScore(score);
  screen._a1NextEl.style.display = 'inline-block';
}
