import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE3 } from './phase3Data.js';

export function renderReport(screen) {
  screen._setP3({ currentActivity: 'report' });
  screen.rootEl.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'p3-activity p3-report';

  const windowEl = document.createElement('div');
  windowEl.className = 'p3-report-window';

  const titlebar = document.createElement('div');
  titlebar.className = 'p3-titlebar';
  titlebar.innerHTML = '<span>REPORTE DE RECUPERACIÓN</span><div class="p3-dots"><span></span><span></span><span></span></div>';

  const heading = document.createElement('h2');
  heading.className = 'p3-report-heading';
  heading.textContent = 'RECUPERACIÓN COMPLETADA';
  heading.style.animation = 'fadeIn 0.5s ease forwards';
  windowEl.appendChild(titlebar);
  windowEl.appendChild(heading);

  const stats = document.createElement('div');
  stats.className = 'p3-stats';

  const makeStat = (label, value, tone = '') => {
    const s = document.createElement('div');
    s.className = 'p3-stat' + (tone ? ' ' + tone : '');
    const l = document.createElement('span');
    l.className = 'p3-stat-label';
    l.textContent = label;
    const v = document.createElement('span');
    v.className = 'p3-stat-value';
    v.textContent = value;
    s.appendChild(l);
    s.appendChild(v);
    return s;
  };

  stats.appendChild(makeStat('ARCHIVOS RECUPERADOS', PHASE3.recovered, 'ok'));
  stats.appendChild(makeStat('ARCHIVOS MODIFICADOS', PHASE3.modified, 'warn'));
  stats.appendChild(makeStat('ARCHIVOS ELIMINADOS', PHASE3.deleted, 'danger'));
  windowEl.appendChild(stats);

  const note = document.createElement('p');
  note.className = 'p3-report-note';
  note.textContent = 'Durante la recuperación se detectaron archivos con alteraciones. Analiza la información antes de continuar.';
  windowEl.appendChild(note);

  const chip = document.createElement('div');
  chip.className = 'p3-stage-chip';
  chip.textContent = 'ACTIVIDAD 1 DE 3';
  windowEl.appendChild(chip);

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn--primary';
  startBtn.textContent = 'INICIAR ACTIVIDAD 1';
  startBtn.dataset.action = 'start-a1';
  startBtn.addEventListener('click', () => {
    AudioManager.playSFX(AUDIO_SFX.CLICK);
    screen._buildActivity1();
  });
  windowEl.appendChild(startBtn);

  wrap.appendChild(windowEl);
  screen.rootEl.appendChild(wrap);
}