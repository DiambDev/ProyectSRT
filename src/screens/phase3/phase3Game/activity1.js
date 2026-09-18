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

  // === EVENT VIEWER WINDOW CONTAINER ===
  const eventWindow = document.createElement('div');
  eventWindow.className = 'p3-eventviewer';

  // Title bar
  const titlebar = document.createElement('div');
  titlebar.className = 'p3-ev-titlebar';
  titlebar.innerHTML = '<span class="p3-ev-title">VISOR DE EVENTOS — SISTEMA</span><span class="p3-ev-dots"><span></span><span></span><span></span></span>';
  eventWindow.appendChild(titlebar);

  // Filter toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'p3-ev-toolbar';

  const filterLabel = document.createElement('span');
  filterLabel.className = 'p3-ev-filter-label';
  filterLabel.textContent = 'Origen:';

  const filterSelect = document.createElement('select');
  filterSelect.className = 'p3-ev-filter';

  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'Todos';
  filterSelect.appendChild(allOpt);

  const sources = ['SEGURIDAD', 'SISTEMA', 'APLICACIONES'];
  sources.forEach((src) => {
    const o = document.createElement('option');
    o.value = src;
    o.textContent = src;
    filterSelect.appendChild(o);
  });

  filterSelect.addEventListener('change', () => filterTableRows());
  toolbar.appendChild(filterLabel);
  toolbar.appendChild(filterSelect);

  const statusEl = document.createElement('span');
  statusEl.className = 'p3-ev-status';
  statusEl.textContent = 'MONITOREO ACTIVO';
  toolbar.appendChild(statusEl);

  eventWindow.appendChild(toolbar);

  // Event table with internal scroll
  const tableWrap = document.createElement('div');
  tableWrap.className = 'p3-ev-tablewrap';
  const table = document.createElement('table');
  table.className = 'p3-ev-table';

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>#</th><th>Event ID</th><th>Fecha/Hora</th><th>Usuario</th><th>Tipo</th><th>Origen</th><th>Estado</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  PHASE3.activity1Events.forEach((ev, i) => {
    const tr = document.createElement('tr');
    tr.dataset.source = ev.sourceType;
    tr.dataset.idx = String(i);
    const cells = [
      String(i + 1),
      String(ev.eventid),
      ev.time,
      ev.user,
      ev.type,
      ev.source,
      ev.status,
    ];
    cells.forEach((c) => {
      const td = document.createElement('td');
      td.textContent = c;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  eventWindow.appendChild(tableWrap);
  wrap.appendChild(eventWindow);

  // === QUESTION ===
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
  nextBtn.style.display = 'none';
  nextBtn.addEventListener('click', () => {
    AudioManager.playSFX(AUDIO_SFX.CLICK);
    screen._buildActivity2();
  });
  wrap.appendChild(nextBtn);

  screen.rootEl.appendChild(wrap);
  screen._a1FeedbackEl = feedback;
  screen._a1NextEl = nextBtn;
  screen._a1OptionEls = optionEls;

  function filterTableRows() {
    const filterVal = filterSelect.value;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row) => {
      if (filterVal === 'all') {
        row.style.display = '';
        return;
      }
      row.style.display = row.dataset.source === filterVal ? '' : 'none';
    });
  }
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
  screen._a1NextEl.style.display = 'inline-block';
}
