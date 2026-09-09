import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { State } from '../../../core/state.js';
import { UIManager } from '../../../ui/uiManager.js';
import { PHASE3, clampActivity2, formatScore } from './phase3Data.js';

export function renderActivity2(screen) {
  if (!screen._alive) return;
  screen._setP3({ currentActivity: 'activity2' });

  const windowEl = document.createElement('div');
  windowEl.className = 'p3-explorer';

  const titlebar = document.createElement('div');
  titlebar.className = 'p3-titlebar';
  titlebar.innerHTML =
    '<span>ACTIVIDAD 2 DE 3 \u00b7 ARCHIVOS MODIFICADOS</span>' +
    '<div class="p3-dots"><span></span><span></span><span></span></div>';
  windowEl.appendChild(titlebar);

  const toolbar = document.createElement('div');
  toolbar.className = 'p3-exp-toolbar';
  const tag = document.createElement('span');
  tag.className = 'p3-exp-tag';
  tag.textContent = '\u00c1bre los archivos y verifica su contenido antes de eliminar los que parezcan alterados.';
  const counts = document.createElement('span');
  counts.className = 'p3-exp-counts';
  counts.dataset.counts = 'a2';
  toolbar.appendChild(tag);
  toolbar.appendChild(counts);
  windowEl.appendChild(toolbar);

  const body = document.createElement('div');
  body.className = 'p3-exp-body';

  const nav = document.createElement('nav');
  nav.className = 'p3-exp-nav';
  const grp = (label, count) => {
    const n = document.createElement('div');
    n.className = 'p3-nav-item';
    n.innerHTML = `<span class="p3-nav-arrow">\u25B8</span><span>${label}</span><span class="p3-nav-count">${count}</span>`;
    return n;
  };
  nav.appendChild(grp('Documentos recuperados', PHASE3.activity2.total));
  nav.appendChild(grp('Archivos eliminados', PHASE3.deleted));
  body.appendChild(nav);

  const main = document.createElement('div');
  main.className = 'p3-exp-main';
  const listEl = document.createElement('div');
  listEl.className = 'p3-file-list';
  listEl.dataset.filelist = 'a2';
  main.appendChild(listEl);
  body.appendChild(main);

  const aside = document.createElement('aside');
  aside.className = 'p3-exp-check';
  aside.dataset.checklist = 'a2';
  body.appendChild(aside);

  windowEl.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'p3-exp-footer';
  const feedback = document.createElement('span');
  feedback.className = 'p3-exp-feedback';
  feedback.dataset.feedback = 'a2';
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn--alert';
  deleteBtn.textContent = 'BORRAR';
  deleteBtn.dataset.action = 'delete';
  const finishBtn = document.createElement('button');
  finishBtn.className = 'btn btn--primary';
  finishBtn.textContent = 'COMPLETAMENTE VERIFICADO';
  finishBtn.dataset.action = 'finish-a2';

  footer.appendChild(feedback);
  footer.appendChild(deleteBtn);
  footer.appendChild(finishBtn);
  windowEl.appendChild(footer);

  screen.rootEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'p3-activity p3-activity-2';
  wrap.appendChild(windowEl);
  screen.rootEl.appendChild(wrap);

  screen._a2ListEl = listEl;
  screen._a2CountsEl = counts;
  screen._a2AsideEl = aside;
  screen._a2FeedbackEl = feedback;
  screen._a2ExitRefs = {};

  deleteBtn.addEventListener('click', () => handleDelete(screen));
  finishBtn.addEventListener('click', () => handleFinish(screen));

  renderFileList(screen);
  updateA2Summary(screen);
}

function fileRow(screen, f) {
  const row = document.createElement('div');
  row.className = 'p3-file-row' + (f.isDeleted ? ' deleted' : '') + (f.isSelected ? ' selected' : '');
  row.dataset.rowid = String(f.id);

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'p3-file-check';
  check.dataset.file = String(f.id);
  check.checked = !!f.isSelected;
  check.disabled = !!f.isDeleted;
  check.setAttribute('aria-label', 'Marcar ' + f.name);
  check.addEventListener('change', (e) => {
    if (f.isDeleted) return;
    f.isSelected = e.target.checked;
    row.classList.toggle('selected', f.isSelected);
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
    screen._setP3({ files: State.get('phase3State').files });
  });
  row.appendChild(check);

  const icon = document.createElement('span');
  icon.className = 'p3-file-icon' + (f.isDeleted ? ' dim' : '');
  icon.textContent = f.type.slice(0, 3);
  row.appendChild(icon);

  const name = document.createElement('span');
  name.className = 'p3-file-name' + (f.isVerified ? ' verified' : '');
  name.textContent = f.name;
  if (f.isVerified) name.setAttribute('data-verified', '\u2713');
  row.appendChild(name);

  const type = document.createElement('span');
  type.className = 'p3-file-type';
  type.textContent = f.type;
  row.appendChild(type);

  const status = document.createElement('span');
  status.className = 'p3-file-status';
  if (f.isDeleted) {
    status.textContent = '\u00D7 ELIMINADO';
    status.classList.add('is-danger');
  } else {
    status.textContent = '\u2713 RECUPERADO';
    status.classList.add('is-ok');
  }
  row.appendChild(status);

  const openBtn = document.createElement('button');
  openBtn.className = 'btn btn--small';
  openBtn.textContent = 'ABRIR';
  openBtn.dataset.open = String(f.id);
  openBtn.disabled = !!f.isDeleted;
  openBtn.addEventListener('click', () => openFile(screen, f));
  row.appendChild(openBtn);

  return row;
}

function renderFileList(screen) {
  const st = State.get('phase3State');
  screen._a2ListEl.innerHTML = '';
  st.files.forEach((f) => screen._a2ListEl.appendChild(fileRow(screen, f)));
}

function openFile(screen, f) {
  if (f.isDeleted) return;
  AudioManager.playSFX(AUDIO_SFX.POPUP);
  if (!f.isVerified) {
    f.isVerified = true;
    screen._setP3({ files: State.get('phase3State').files });
    updateA2Summary(screen);
    renderFileList(screen);
  }

  const content = document.createElement('div');
  content.className = 'p3-file-popup';
  const meta = document.createElement('div');
  meta.className = 'p3-file-popup-meta';
  meta.innerHTML = `<span>Nombre: ${f.name}</span><span>Tipo: ${f.type}</span><span>Estado: recuperado</span>`;
  const pre = document.createElement('pre');
  pre.className = 'file-content';
  pre.textContent = f.content;
  const hint = document.createElement('p');
  hint.className = 'p3-file-popup-hint';
  hint.textContent = 'Verifica el contenido antes de tomar una decisi\u00f3n.';
  content.appendChild(meta);
  content.appendChild(pre);
  content.appendChild(hint);

  UIManager.createPopup({
    title: 'ABRIR: ' + f.name,
    content,
    buttonText: 'CERRAR',
    onClose: () => AudioManager.playSFX(AUDIO_SFX.CLICK),
  });
}

function handleDelete(screen) {
  const st = State.get('phase3State');
  const selected = st.files.filter((f) => f.isSelected && !f.isDeleted);
  if (!selected.length) {
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
    screen._a2FeedbackEl.textContent = 'SELECCIONA ARCHIVOS PARA BORRAR';
    screen._a2FeedbackEl.className = 'p3-exp-feedback';
    screen._a2FeedbackEl.style.color = 'var(--alert-yellow)';
    return;
  }

  let raw = st.activity2Raw;
  let correct = st.correctDeletions;
  let incorrect = st.incorrectDeletions;
  let anyWrong = false;

  selected.forEach((f) => {
    f.isDeleted = true;
    f.isSelected = false;
    if (f.isCorrupted) {
      correct += 1;
      raw += PHASE3.activity2.perCorrect;
    } else {
      incorrect += 1;
      raw -= PHASE3.activity2.perWrong;
      anyWrong = true;
    }
  });

  const score = clampActivity2(raw);
  screen._setP3({
    activity2Raw: raw,
    activity2Score: score,
    correctDeletions: correct,
    incorrectDeletions: incorrect,
    deletedByUser: st.files.filter((f) => f.isDeleted).map((f) => f.id),
    files: st.files,
  });

  AudioManager.playSFX(AUDIO_SFX.DELETE);
  if (anyWrong) AudioManager.playSFX(AUDIO_SFX.ERROR);

  screen._a2FeedbackEl.textContent =
    `ARCHIVOS ENCONTRADOS: ${correct} / ${PHASE3.activity2.targetFiles} \u00b7 PUNTAJE: ${formatScore(score)} / ${PHASE3.activity2.maxScore}`;
  screen._a2FeedbackEl.className = 'p3-exp-feedback';
  screen._a2FeedbackEl.style.color = anyWrong ? 'var(--alert-red)' : 'var(--p3-blue)';

  renderFileList(screen);
  updateA2Summary(screen);
}

function updateA2Summary(screen) {
  const st = State.get('phase3State');
  const reviewed = st.files.filter((f) => f.isVerified).length;
  const deleted = st.files.filter((f) => f.isDeleted).length;
  const correctFound = st.files.filter((f) => f.isDeleted && f.isCorrupted).length;

  screen._a2CountsEl.textContent =
    `Mostrando ${st.files.length} archivos \u00b7 Revisados: ${reviewed} \u00b7 Eliminados: ${deleted}`;

  const aside = screen._a2AsideEl;
  aside.innerHTML = '';
  const h = document.createElement('h4');
  h.className = 'p3-check-title';
  h.textContent = 'CHECKLIST DE VERIFICACI\u00d3N';
  aside.appendChild(h);

  const rows = [
    { label: 'Archivos revisados', value: `${reviewed} / ${st.files.length}` },
    { label: 'Archivos corruptos encontrados', value: `${correctFound} / ${PHASE3.activity2.targetFiles}` },
    { label: 'Comprobar coherencia del contenido', value: 'criterio' },
    { label: 'Reportar solo archivos con anomal\u00edas', value: 'criterio' },
  ];
  rows.forEach((r) => {
    const li = document.createElement('div');
    li.className = 'p3-check-item';
    const mark = document.createElement('span');
    mark.className = 'p3-check-mark';
    mark.textContent = '\u2713';
    const lab = document.createElement('span');
    lab.className = 'p3-check-label';
    lab.textContent = r.label;
    const val = document.createElement('span');
    val.className = 'p3-check-value';
    val.textContent = r.value;
    li.appendChild(mark);
    li.appendChild(lab);
    li.appendChild(val);
    aside.appendChild(li);
  });
}

function handleFinish(screen) {
  const st = State.get('phase3State');
  AudioManager.playSFX(AUDIO_SFX.SUCCESS);

  const content = document.createElement('div');
  content.className = 'p3-summary-popup';
  const lines = [
    ['VERIFICACI\u00d3N FINALIZADA', 'heading'],
    ['Archivos eliminados', String(st.files.filter((f) => f.isDeleted).length)],
    ['Archivos correctamente identificados', String(st.correctDeletions)],
    ['Archivos eliminados incorrectamente', String(st.incorrectDeletions)],
    ['Puntaje de la actividad', `${formatScore(st.activity2Score)} / ${PHASE3.activity2.maxScore}`],
  ];
  lines.forEach(([label, value]) => {
    if (label === 'VERIFICACI\u00d3N FINALIZADA') {
      const h = document.createElement('h3');
      h.className = 'p3-summary-heading';
      h.textContent = label;
      content.appendChild(h);
      return;
    }
    const row = document.createElement('div');
    row.className = 'p3-summary-row';
    const l = document.createElement('span');
    l.textContent = label;
    const v = document.createElement('strong');
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    content.appendChild(row);
  });

  UIManager.createPopup({
    title: 'RESUMEN DE ACTIVIDAD 2',
    content,
    buttonText: 'CONTINUAR',
    onClose: () => screen._buildActivity3(),
  });
}
