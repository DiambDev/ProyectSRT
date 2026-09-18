import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE3, formatScore } from './phase3Data.js';

const INCIDENT_TIME = '02:40 a. m.';

const FILE_SOURCES = [
  [
    { label: 'Carpeta de respaldo local', time: '01:50 a. m.', note: 'Copia automática guardada en el propio equipo afectado (EQUIPO-TSC-02).', correct: false },
    { label: 'Disco externo', time: '01:15 a. m.', note: 'Disco externo desconectado del equipo durante toda la madrugada; respaldo realizado el día anterior.', correct: true },
    { label: 'Almacenamiento en la nube', time: '02:55 a. m.', note: 'Sincronizado desde EQUIPO-TSC-02 antes de la suspensión de la nube.', correct: false },
  ],
  [
    { label: 'Servidor institucional', time: '02:20 a. m.', note: 'Copia en el servidor externo, fuera del equipo afectado y sin compromiso.', correct: true },
    { label: 'USB', time: '03:40 a. m.', note: 'USB conectado al equipo afectado durante la revisión posterior al incidente.', correct: false },
    { label: 'Almacenamiento en la nube', time: '01:55 a. m.', note: 'Copia en la cuenta en la nube asociada al equipo afectado.', correct: false },
  ],
  [
    { label: 'Historial del sistema', time: '02:15 a. m.', note: 'El historial local se restableció a las 03:00 a. m.; corresponde al equipo afectado.', correct: false },
    { label: 'Disco externo', time: '03:25 a. m.', note: 'Disco externo conectado al equipo durante la revisión posterior.', correct: false },
    { label: 'Copia de red del servidor', time: '01:05 a. m.', note: 'Copia previa al incidente almacenada en el servidor institucional, fuera del equipo afectado.', correct: true },
  ],
  [
    { label: 'Carpeta de respaldo local', time: '02:05 a. m.', note: 'Respaldo guardado en el propio equipo afectado antes de la declaración.', correct: false },
    { label: 'USB', time: '00:20 a. m.', note: 'USB que permaneció conectado al equipo durante la actividad no autorizada.', correct: false },
    { label: 'Disco externo', time: '01:45 a. m.', note: 'Disco externo desconectado durante la madrugada; respaldo realizado antes del incidente.', correct: true },
  ],
  [
    { label: 'Servidor institucional', time: '02:30 a. m.', note: 'Copia institucional sin conexión con el equipo afectado; respaldo previo al incidente.', correct: true },
    { label: 'Disco externo', time: '03:35 a. m.', note: 'Disco externo conectado al equipo durante la revisión posterior.', correct: false },
    { label: 'Almacenamiento en la nube', time: '00:05 a. m.', note: 'Copia en la nube asociada a la cuenta del equipo afectado.', correct: false },
  ],
];

export function renderActivity3(screen) {
  if (!screen._alive) return;
  screen._setP3({ currentActivity: 'activity3' });
  screen.rootEl.innerHTML = '';

  screen._a3SelectedCount = 0;
  screen._a3TotalFiles = PHASE3.activity3.files.length;
  screen._a3Selections = {};
  screen._a3Locked = false;
  screen._a3FileItems = [];

  const wrap = document.createElement('div');
  wrap.className = 'p3-activity p3-activity-3';

  const titlebar = document.createElement('div');
  titlebar.className = 'p3-titlebar';
  titlebar.innerHTML =
    'ACTIVIDAD 3 DE 3 \u00b7 RECOVERY CENTER' +
    '<div class="p3-dots"><span></span><span></span><span></span></div>';
  wrap.appendChild(titlebar);

  const context = document.createElement('div');
  context.className = 'p3-a3-context';

  const contextH = document.createElement('h3');
  contextH.textContent = 'INFORME DEL INCIDENTE';
  context.appendChild(contextH);

  const contextText = document.createElement('pre');
  contextText.className = 'p3-a3-context-text';
  contextText.textContent =
    `El incidente comenz\u00f3 aproximadamente a las ${INCIDENT_TIME}.\n` +
    'La telemetr\u00eda registra actividad no autorizada en EQUIPO-TSC-02 desde al menos las 00:30 a. m.\n' +
    'No se puede descartar que los archivos del equipo y de los dispositivos conectados a \u00e9l hayan sido alterados.\n\n' +
    'Datos de la investigaci\u00f3n:\n' +
    '- La cuenta en la nube asociada al equipo fue accedida por el atacante; la sincronizaci\u00f3n se suspendi\u00f3 a las 03:15 a. m.\n' +
    '- El servidor institucional es externo al equipo y NO estuvo comprometido.\n' +
    '- El historial de archivos del sistema se restableci\u00f3 a las 03:00 a. m.\n' +
    '- Un disco externo que no estuvo conectado al equipo durante la madrugada es una fuente independiente confiable.\n\n' +
    'Selecciona la fuente de recuperaci\u00f3n para cada archivo y, cuando los 5 est\u00e9n seleccionados, confirma.';
  context.appendChild(contextText);
  wrap.appendChild(context);

  const counter = document.createElement('div');
  counter.className = 'p3-a3-counter';
  const counterLabel = document.createElement('span');
  counterLabel.className = 'p3-a3-counter-label';
  counterLabel.textContent = 'ARCHIVOS SELECCIONADOS';
  const counterValue = document.createElement('span');
  counterValue.className = 'p3-a3-counter-value';
  counterValue.textContent = '0 / ' + screen._a3TotalFiles;
  counter.appendChild(counterLabel);
  counter.appendChild(counterValue);
  wrap.appendChild(counter);
  screen._a3CounterEl = counterValue;

  const filesList = document.createElement('div');
  filesList.className = 'p3-a3-fileslist';

  const filesLabel = document.createElement('div');
  filesLabel.className = 'p3-a3-fileslist-label';
  filesLabel.textContent = 'ARCHIVOS PARA RECUPERAR';
  filesList.appendChild(filesLabel);

  PHASE3.activity3.files.forEach((name, i) => {
    const item = document.createElement('div');
    item.className = 'p3-a3-fileitem';
    item.dataset.fileindex = String(i);

    const icon = document.createElement('span');
    icon.className = 'p3-file-icon';
    const ext = (name.split('.').pop() || 'file').toUpperCase().slice(0, 3);
    icon.textContent = fileIconForExt(ext);
    item.appendChild(icon);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'p3-a3-filename';
    nameSpan.textContent = name;
    item.appendChild(nameSpan);

    const status = document.createElement('span');
    status.className = 'p3-a3-filestatus';
    status.textContent = 'Sin recuperar';
    item.appendChild(status);

    const sources = document.createElement('div');
    sources.className = 'p3-a3-sources';

    FILE_SOURCES[i].forEach((src, si) => {
      const block = document.createElement('div');
      block.className = 'p3-a3-source';

      const btn = document.createElement('button');
      btn.className = 'btn btn--small p3-a3-source-btn';
      btn.textContent = `${src.label} \u2014 ${src.time}`;
      btn.dataset.fileindex = String(i);
      btn.dataset.source = String(si);
      btn.addEventListener('click', () => selectSource(screen, i, si));
      block.appendChild(btn);

      const note = document.createElement('div');
      note.className = 'p3-a3-source-note';
      note.textContent = src.note;
      block.appendChild(note);

      sources.appendChild(block);
    });

    item.appendChild(sources);

    filesList.appendChild(item);

    screen._a3FileItems.push({
      item,
      status,
      sources,
      selectedSource: null,
    });
  });
  wrap.appendChild(filesList);

  const confirmRow = document.createElement('div');
  confirmRow.className = 'p3-a3-confirmrow';
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn--primary p3-a3-confirm-final';
  confirmBtn.textContent = 'CONFIRMAR RECUPERACI\u00d3N';
  confirmBtn.style.display = 'none';
  confirmBtn.addEventListener('click', () => confirmRecovery(screen));
  confirmRow.appendChild(confirmBtn);
  wrap.appendChild(confirmRow);
  screen._a3ConfirmFinalEl = confirmBtn;

  const resultSection = document.createElement('div');
  resultSection.className = 'p3-a3-result';
  resultSection.style.display = 'none';
  screen._a3ResultSection = resultSection;
  wrap.appendChild(resultSection);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--primary p3-next';
  nextBtn.textContent = 'VER RESULTADO FINAL';
  nextBtn.style.display = 'none';
  nextBtn.addEventListener('click', () => {
    AudioManager.playSFX(AUDIO_SFX.CLICK);
    screen._finishPhase3();
  });
  wrap.appendChild(nextBtn);
  screen._a3NextEl = nextBtn;

  screen.rootEl.appendChild(wrap);
}

function fileIconForExt(ext) {
  const icons = { DOC: 'W', DOCX: 'W', PDF: 'P', TXT: 'T', XLS: 'S', XLSX: 'S', PNG: 'I', JPG: 'I', PPT: 'F', PPTX: 'F', MP4: 'V', WAV: 'A', RTF: 'R' };
  return icons[ext.toUpperCase()] || 'F';
}

function selectSource(screen, fileIndex, sourceIndex) {
  if (screen._a3Locked) return;

  const item = screen._a3FileItems[fileIndex];
  const allBtns = item.sources.querySelectorAll('.p3-a3-source-btn');
  allBtns.forEach((b) => b.classList.remove('source-selected'));

  if (item.selectedSource === sourceIndex) {
    item.selectedSource = null;
    delete screen._a3Selections[fileIndex];
    item.status.textContent = 'Sin recuperar';
    item.status.className = 'p3-a3-filestatus';
  } else {
    const src = FILE_SOURCES[fileIndex][sourceIndex];
    screen._a3Selections[fileIndex] = { source: sourceIndex, label: src.label, time: src.time };
    item.selectedSource = sourceIndex;
    allBtns[sourceIndex].classList.add('source-selected');
    item.status.textContent = 'Seleccionado';
    item.status.className = 'p3-a3-filestatus p3-a3-selected';
  }

  AudioManager.playSFX(AUDIO_SFX.INTERACTION);
  updateProgress(screen);
}

function updateProgress(screen) {
  const count = Object.keys(screen._a3Selections).length;
  screen._a3CounterEl.textContent = count + ' / ' + screen._a3TotalFiles;
  screen._a3CounterEl.classList.toggle('complete', count === screen._a3TotalFiles);
  screen._a3ConfirmFinalEl.style.display =
    count === screen._a3TotalFiles ? 'inline-block' : 'none';
}

function confirmRecovery(screen) {
  if (screen._a3Locked) return;
  if (Object.keys(screen._a3Selections).length !== screen._a3TotalFiles) return;

  screen._a3Locked = true;
  screen._a3FileItems.forEach((fi) => {
    fi.sources.querySelectorAll('.p3-a3-source-btn').forEach((b) => {
      b.disabled = true;
    });
  });

  evaluateAllFiles(screen);
}

function evaluateAllFiles(screen) {
  let correctCount = 0;
  const fileResults = [];

  PHASE3.activity3.files.forEach((name, i) => {
    const selection = screen._a3Selections[i];
    const src = FILE_SOURCES[i][selection.source];
    const isCorrect = !!src.correct;
    if (isCorrect) correctCount++;
    fileResults.push({ name, source: src.label, time: src.time, isCorrect });
  });

  const score = scoreFromCorrectCount(correctCount);
  screen._setP3({ activity3Score: score });

  const resultSection = screen._a3ResultSection;
  resultSection.style.display = '';
  resultSection.innerHTML = '';

  const heading = document.createElement('div');
  heading.className = 'p3-a3-result-heading';
  heading.textContent = 'RECUPERACI\u00d3N COMPLETADA';
  resultSection.appendChild(heading);

  const items = document.createElement('div');
  items.className = 'p3-a3-result-items';

  fileResults.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'p3-a3-result-item';

    const fname = document.createElement('span');
    fname.className = 'filename';
    fname.textContent = r.name;

    const verdict = document.createElement('span');
    verdict.className = 'verdict ' + (r.isCorrect ? 'correct' : 'incorrect');
    verdict.textContent = r.isCorrect ? 'Correcta' : 'Incorrecta';

    row.appendChild(fname);
    row.appendChild(verdict);
    items.appendChild(row);
  });

  resultSection.appendChild(items);

  const summary = document.createElement('div');
  summary.style.textAlign = 'center';
  summary.style.fontSize = '13px';
  summary.style.color = '#d6e8f5';
  summary.style.marginTop = '8px';
  summary.textContent =
    `${correctCount} de ${screen._a3TotalFiles} recuperaciones correctas \u00b7 Puntaje: ${formatScore(score)} / ${PHASE3.activity3.points}`;
  resultSection.appendChild(summary);

  screen._a3NextEl.style.display = 'inline-block';

  if (correctCount === screen._a3TotalFiles) {
    AudioManager.playSFX(AUDIO_SFX.SUCCESS);
  } else {
    AudioManager.playSFX(AUDIO_SFX.ERROR);
  }
}

function scoreFromCorrectCount(correctCount) {
  if (correctCount <= 1) return 0;
  if (correctCount === 2) return 2;
  if (correctCount === 3) return 3;
  if (correctCount === 4) return 4;
  return PHASE3.activity3.points;
}