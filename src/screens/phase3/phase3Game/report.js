import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE3, formatScore } from './phase3Data.js';

export function renderReport(screen) {
  screen._setP3({ currentActivity: 'report' });
  screen.rootEl.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'p3-activity p3-report';
  wrap.style.animation = 'fadeIn 0.5s ease forwards';

  const windowEl = document.createElement('div');
  windowEl.className = 'p3-report-window';

  const titlebar = document.createElement('div');
  titlebar.className = 'p3-titlebar';
  titlebar.innerHTML = '<span>REPORTE DE RECUPERACI\u00d3N</span><div class="p3-dots"><span></span><span></span><span></span></div>';
  windowEl.appendChild(titlebar);

  const heading = document.createElement('h2');
  heading.className = 'p3-report-heading';
  heading.textContent = 'RECUPERACI\u00d3N COMPLETADA';
  heading.style.animation = 'fadeIn 0.5s ease forwards';
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
  note.textContent = 'Durante la recuperaci\u00f3n se detectaron archivos con alteraciones. Analiza la informaci\u00f3n antes de continuar.';
  windowEl.appendChild(note);

  const chip = document.createElement('div');
  chip.className = 'p3-stage-chip';
  chip.textContent = 'ACTIVIDAD 1 DE 3';
  windowEl.appendChild(chip);

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn--primary p3-next';
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
