import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE3, formatScore } from './phase3Data.js';

const INCIDENT_TIME = '02:40 a. m.';
const INCIDENT_MINUTES = 2 * 60 + 40;

const BACKUP_TIMES = {
  drive: [
    '02:50 a. m.',
    '02:45 a. m.',
    '02:55 a. m.',
    '02:48 a. m.',
    '02:42 a. m.',
  ],
  usb: [
    '12:00 a. m.',
    '12:00 a. m.',
    '12:00 a. m.',
    '12:00 a. m.',
    '12:00 a. m.',
  ],
  d: [
    'No disponible',
    '01:30 a. m.',
    'No disponible',
    '01:45 a. m.',
    'No disponible',
  ],
};

const BACKUP_LABELS = {
  drive: 'DRIVE',
  usb: 'USB',
  d: 'D:',
};

function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === 'No disponible') return -1;
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return -1;
  let mins = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  if (timeStr.includes('a. m.') && match[1] === '12') mins = 0;
  if (timeStr.includes('p. m.') && match[1] !== '12') mins += 12 * 60;
  return mins;
}

export function renderActivity3(screen) {
  if (!screen._alive) return;
  screen._setP3({ currentActivity: 'activity3' });
  screen.rootEl.innerHTML = '';

  screen._a3ConfirmedCount = 0;
  screen._a3TotalFiles = PHASE3.activity3.files.length;
  screen._a3Selections = {};
  screen._a3Confirmed = {};
  screen._a3FileItems = [];

  const wrap = document.createElement('div');
  wrap.className = 'p3-activity p3-activity-3';

  const titlebar = document.createElement('div');
  titlebar.className = 'p3-titlebar';
  titlebar.innerHTML =
    '<span>ACTIVIDAD 3 DE 3 \u00b7 RECOVERY CENTER</span>' +
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
    'Se eliminaron 5 archivos del sistema.\n' +
    'Se dispone de copias de seguridad en m\u00faltiples or\u00edgenes con diferentes marcas de tiempo.\n' +
    'Selecciona la fuente de recuperaci\u00f3n para cada archivo y confirma.';
  context.appendChild(contextText);
  wrap.appendChild(context);

  const counter = document.createElement('div');
  counter.className = 'p3-a3-counter';
  const counterLabel = document.createElement('span');
  counterLabel.className = 'p3-a3-counter-label';
  counterLabel.textContent = 'DECISIONES CONFIRMADAS';
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

    const sourceBtns = {};
    ['drive', 'usb', 'd'].forEach((sourceKey) => {
      const backupTime = BACKUP_TIMES[sourceKey][i];
      const btn = document.createElement('button');
      btn.className = 'btn btn--small p3-a3-source-btn';
      btn.textContent = `${BACKUP_LABELS[sourceKey]} \u2014 ${backupTime}`;
      btn.disabled = backupTime === 'No disponible';
      btn.dataset.fileindex = String(i);
      btn.dataset.source = sourceKey;
      btn.addEventListener('click', () => selectSource(screen, i, sourceKey, btn));
      sources.appendChild(btn);
      sourceBtns[sourceKey] = btn;
    });

    item.appendChild(sources);

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn--primary p3-a3-confirm';
    confirmBtn.textContent = 'CONFIRMAR';
    confirmBtn.dataset.fileindex = String(i);
    confirmBtn.style.display = 'none';
    confirmBtn.addEventListener('click', () => confirmFile(screen, i));
    item.appendChild(confirmBtn);

    filesList.appendChild(item);

    screen._a3FileItems.push({
      item,
      status,
      sources,
      confirmBtn,
      sourceBtns,
      selectedSource: null,
    });
  });
  wrap.appendChild(filesList);

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

function selectSource(screen, fileIndex, sourceKey, btn) {
  if (screen._a3Confirmed[fileIndex]) return;

  const item = screen._a3FileItems[fileIndex];
  const time = BACKUP_TIMES[sourceKey][fileIndex];

  screen._a3Selections[fileIndex] = { source: sourceKey, time };
  item.selectedSource = sourceKey;
  item.status.textContent = 'Seleccionado';
  item.status.className = 'p3-a3-filestatus p3-a3-selected';

  const allBtns = item.sources.querySelectorAll('.p3-a3-source-btn');
  allBtns.forEach((b) => {
    b.disabled = true;
    if (b.dataset.source === sourceKey) {
      b.classList.add('source-selected');
    }
  });

  item.confirmBtn.style.display = 'inline-block';
  AudioManager.playSFX(AUDIO_SFX.INTERACTION);
}

function confirmFile(screen, fileIndex) {
  if (screen._a3Confirmed[fileIndex]) return;
  if (!screen._a3Selections[fileIndex]) return;

  screen._a3Confirmed[fileIndex] = true;
  screen._a3ConfirmedCount++;

  const item = screen._a3FileItems[fileIndex];
  const selection = screen._a3Selections[fileIndex];

  item.confirmBtn.style.display = 'none';
  item.status.textContent = 'CONFIRMADA';
  item.status.className = 'p3-a3-filestatus p3-a3-confirmed';
  item.item.classList.add('confirmed');

  const badge = document.createElement('span');
  badge.className = 'p3-a3-confirmed-badge';
  badge.textContent = `${BACKUP_LABELS[selection.source]} \u2014 ${selection.time}`;
  item.item.appendChild(badge);

  const allBtns = item.sources.querySelectorAll('.p3-a3-source-btn');
  allBtns.forEach((b) => { b.disabled = true; });

  AudioManager.playSFX(AUDIO_SFX.CLICK);

  screen._a3CounterEl.textContent =
    screen._a3ConfirmedCount + ' / ' + screen._a3TotalFiles;

  if (screen._a3ConfirmedCount >= screen._a3TotalFiles) {
    evaluateAllFiles(screen);
  }
}

function evaluateAllFiles(screen) {
  let correctCount = 0;
  const fileResults = [];

  PHASE3.activity3.files.forEach((name, i) => {
    const selection = screen._a3Selections[i];
    const selectedMinutes = timeToMinutes(selection.time);
    const isCorrect = selectedMinutes >= 0 && selectedMinutes < INCIDENT_MINUTES;
    if (isCorrect) correctCount++;
    fileResults.push({ name, source: selection.source, time: selection.time, isCorrect });
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
  if (correctCount === 0) return 0;
  if (correctCount === 1) return 0;
  if (correctCount === 2) return 1;
  if (correctCount === 3) return 1;
  if (correctCount === 4) return 2;
  return PHASE3.activity3.points;
}
