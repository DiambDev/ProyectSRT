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
    '<span>ACTIVIDAD 2 DE 3 \u00b7 ARCHIVOS RECUPERADOS</span>' +
    '<div class="p3-dots"><span></span><span></span><span></span></div>';
  windowEl.appendChild(titlebar);

  const toolbar = document.createElement('div');
  toolbar.className = 'p3-exp-toolbar';
  const counts = document.createElement('span');
  counts.className = 'p3-exp-counts';
  counts.dataset.counts = 'a2';
  toolbar.appendChild(counts);
  windowEl.appendChild(toolbar);

  const body = document.createElement('div');
  body.className = 'p3-exp-body';

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
  deleteBtn.textContent = 'ELIMINAR SELECCIONADOS';
  deleteBtn.dataset.action = 'delete';
  const finishBtn = document.createElement('button');
  finishBtn.className = 'btn btn--primary';
  finishBtn.textContent = 'FINALIZAR VERIFICACIÓN';
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

  deleteBtn.addEventListener('click', () => handleDelete(screen));
  finishBtn.addEventListener('click', () => handleFinish(screen));

  renderFileList(screen);
  updateA2Summary(screen);
}

function formatTime(totalSeconds) {
  return '';
}

function fileIconForExt(ext) {
  const icons = {
    DOCX: 'W',
    PDF: 'P',
    TXT: 'T',
    XLSX: 'S',
    PNG: 'I',
    JPG: 'I',
    PPTX: 'F',
    MP4: 'V',
    WAV: 'A',
  };
  return icons[ext] || 'F';
}

function extLabelForExt(ext) {
  const labels = {
    DOCX: 'Documento de Microsoft Word',
    PDF: 'Documento PDF',
    TXT: 'Archivo de texto',
    XLSX: 'Hoja de cálculo',
    PNG: 'Imagen PNG',
    JPG: 'Imagen JPG',
    PPTX: 'Presentación',
    MP4: 'Video MP4',
    WAV: 'Audio WAV',
  };
  return labels[ext] || `Archivo ${ext}`;
}

function fileRow(screen, f) {
  const row = document.createElement('div');
  row.className = 'p3-file-row' + (f.isDeleted ? ' deleted' : '') + (f.isSelected ? ' selected' : '');
  row.dataset.rowid = String(f.id);

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'p3-file-check';
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
  icon.className = 'p3-file-icon';
  if (f.isDeleted) icon.classList.add('dim');
  const ext = f.name.split('.').pop().toUpperCase().slice(0, 4);
  icon.textContent = fileIconForExt(ext);
  row.appendChild(icon);

  const name = document.createElement('span');
  name.className = 'p3-file-name';
  name.textContent = f.name;
  row.appendChild(name);

  const type = document.createElement('span');
  type.className = 'p3-file-type';
  type.textContent = extLabelForExt(ext);
  row.appendChild(type);

  const openBtn = document.createElement('button');
  openBtn.className = 'btn btn--small';
  openBtn.textContent = 'INSPECCIONAR';
  openBtn.dataset.open = String(f.id);
  openBtn.disabled = !!f.isDeleted;
  openBtn.addEventListener('click', () => inspectFile(screen, f));
  row.appendChild(openBtn);

  return row;
}

function renderFileList(screen) {
  const st = State.get('phase3State');
  screen._a2ListEl.innerHTML = '';
  st.files.forEach((f) => screen._a2ListEl.appendChild(fileRow(screen, f)));
}

function inspectFile(screen, f) {
  if (f.isDeleted) return;
  AudioManager.playSFX(AUDIO_SFX.POPUP);

  const ext = f.name.split('.').pop().toUpperCase().slice(0, 4);

  const content = document.createElement('div');
  content.className = 'p3-file-detail';

  // File identity section
  const identity = document.createElement('div');
  identity.className = 'p3-file-identity';

  const title = document.createElement('div');
  title.className = 'p3-file-detail-title';
  title.textContent = 'INFORMACIÓN DEL ARCHIVO';
  identity.appendChild(title);

  const infoTable = document.createElement('div');
  infoTable.className = 'p3-file-info';

  // General file info
  const fields = [
    ['Nombre', f.name],
    ['Tipo', extLabelForExt(ext)],
    ['Estado', 'Recuperado'],
  ];

  fields.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'p3-info-row';
    const lbl = document.createElement('span');
    lbl.className = 'p3-info-label';
    lbl.textContent = label;
    const val = document.createElement('span');
    val.className = 'p3-info-value';
    val.textContent = value;
    row.appendChild(lbl);
    row.appendChild(val);
    infoTable.appendChild(row);
  });

  identity.appendChild(infoTable);

  // Hash data shown in two neutral blocks
  const hashBlock1 = document.createElement('div');
  hashBlock1.className = 'p3-file-info';
  hashBlock1.style.marginTop = '12px';
  hashBlock1.style.paddingTop = '12px';
  hashBlock1.style.borderTop = '1px solid var(--p3-border)';

  const hLbl1 = document.createElement('span');
  hLbl1.className = 'p3-info-label';
  hLbl1.textContent = 'Reg. interno \u2014 SHA-256';
  const hVal1 = document.createElement('span');
  hVal1.className = 'p3-info-value';
  hVal1.textContent = truncateHash(f.expectedHash);

  hashBlock1.appendChild(hLbl1);
  hashBlock1.appendChild(hVal1);

  const hashBlock2 = document.createElement('div');
  hashBlock2.className = 'p3-file-info';
  hashBlock2.style.marginTop = '8px';

  const hLbl2 = document.createElement('span');
  hLbl2.className = 'p3-info-label';
  hLbl2.textContent = 'Verificaci\u00f3n \u2014 SHA-256';
  const hVal2 = document.createElement('span');
  hVal2.className = 'p3-info-value';
  hVal2.textContent = truncateHash(f.currentHash);

  hashBlock2.appendChild(hLbl2);
  hashBlock2.appendChild(hVal2);

  identity.appendChild(hashBlock1);
  identity.appendChild(hashBlock2);

  content.appendChild(identity);

  // Document content preview
  const contentSection = document.createElement('div');
  contentSection.className = 'p3-file-content-preview';

  const contentTitle = document.createElement('div');
  contentTitle.className = 'p3-file-content-title';
  contentTitle.textContent = 'CONTENIDO';
  contentSection.appendChild(contentTitle);

  const contentText = document.createElement('pre');
  contentText.className = 'p3-file-content-text';
  contentText.textContent = f.content;
  contentSection.appendChild(contentText);

  content.appendChild(contentSection);

  UIManager.createPopup({
    title: f.name,
    content,
    buttonText: 'CERRAR',
    onClose: () => AudioManager.playSFX(AUDIO_SFX.CLICK),
  });
}

function truncateHash(hash) {
  if (!hash) return '—';
  return hash.slice(0, 8) + '...' + hash.slice(-4);
}

function handleDelete(screen) {
  const st = State.get('phase3State');
  const selected = st.files.filter((f) => f.isSelected && !f.isDeleted);
  if (!selected.length) {
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
    screen._a2FeedbackEl.textContent = 'SELECCIONA ARCHIVOS PARA ELIMINAR';
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
    if (f.isModified) {
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
    `ARCHIVOS PROCESADOS: ${correct} correctos / ${incorrect} incorrectos \u00b7 PUNTAJE: ${formatScore(score)} / ${PHASE3.activity2.maxScore}`;
  screen._a2FeedbackEl.className = 'p3-exp-feedback';
  screen._a2FeedbackEl.style.color = anyWrong ? 'var(--alert-red)' : 'var(--p3-blue)';

  renderFileList(screen);
  updateA2Summary(screen);
}

function updateA2Summary(screen) {
  const st = State.get('phase3State');
  const deleted = st.files.filter((f) => f.isDeleted).length;

  screen._a2CountsEl.textContent =
    `${st.files.length} archivos \u00b7 Eliminados: ${deleted}`;

  const aside = screen._a2AsideEl;
  aside.innerHTML = '';
  const h = document.createElement('h4');
  h.className = 'p3-check-title';
  h.textContent = 'INFORMACIÓN';
  aside.appendChild(h);

  const rows = [
    { label: 'Total de archivos', value: String(st.files.length) },
    { label: 'Eliminados', value: String(deleted) },
  ];
  rows.forEach((r) => {
    const li = document.createElement('div');
    li.className = 'p3-check-item';
    const mark = document.createElement('span');
    mark.className = 'p3-check-mark';
    mark.textContent = '—';
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
    ['VERIFICACIÓN FINALIZADA', 'heading'],
    ['Archivos procesados', String(st.files.filter((f) => f.isDeleted).length)],
    ['Archivos correctamente identificados', String(st.correctDeletions)],
    ['Archivos eliminados incorrectamente', String(st.incorrectDeletions)],
    ['Puntaje de la actividad', `${formatScore(st.activity2Score)} / ${PHASE3.activity2.maxScore}`],
  ];
  lines.forEach(([label, value]) => {
    if (label === 'VERIFICACIÓN FINALIZADA') {
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

function handleTimeout(screen) {
}
