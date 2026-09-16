import { AUDIO_SFX } from '../../../core/constants.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE3, scoreActivity3, formatScore } from './phase3Data.js';

const INCIDENT_TIME = '02:40 a. m.';

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

export function renderActivity3(screen) {
  if (!screen._alive) return;
  screen._setP3({ currentActivity: 'activity3' });
  screen._a3Answered = false;
  screen.rootEl.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'p3-activity p3-activity-3';

  // ========== INCIDENT CONTEXT ==========
  const context = document.createElement('div');
  context.className = 'p3-a3-context';

  const contextH = document.createElement('h3');
  contextH.textContent = 'INFORME DEL INCIDENTE';
  context.appendChild(contextH);

  const contextText = document.createElement('pre');
  contextText.className = 'p3-a3-context-text';
  contextText.textContent =
    `El incidente comenzó aproximadamente a las ${INCIDENT_TIME}.\n` +
    'Se eliminaron 5 archivos del sistema.\n' +
    'Se dispone de copias de seguridad en múltiples orígenes con diferentes marcas de tiempo.\n' +
    'Selecciona la fuente de recuperación para cada archivo.';
  context.appendChild(contextText);
  wrap.appendChild(context);

  // ========== RECOVERY FILES LIST ==========
  const filesList = document.createElement('div');
  filesList.className = 'p3-a3-fileslist';

  const filesLabel = document.createElement('div');
  filesLabel.className = 'p3-a3-fileslist-label';
  filesLabel.textContent = 'ARCHIVOS PARA RECUPERAR';
  filesList.appendChild(filesLabel);

  const fileItems = [];
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

    // Backup sources
    const sources = document.createElement('div');
    sources.className = 'p3-a3-sources';

    ['drive', 'usb', 'd'].forEach((sourceKey) => {
      const backupTime = BACKUP_TIMES[sourceKey][i];
      const btn = document.createElement('button');
      btn.className = 'btn btn--small p3-a3-source-btn';
      btn.textContent = `${BACKUP_LABELS[sourceKey]} — ${backupTime}`;
      btn.disabled = backupTime === 'No disponible';
      btn.dataset.fileindex = String(i);
      btn.dataset.source = sourceKey;
      btn.addEventListener('click', () => selectSource(screen, i, sourceKey, btn));
      sources.appendChild(btn);
    });

    item.appendChild(sources);

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn--primary p3-a3-confirm';
    confirmBtn.textContent = 'CONFIRMAR SELECCIÓN';
    confirmBtn.dataset.fileindex = String(i);
    confirmBtn.style.display = 'none';
    confirmBtn.addEventListener('click', () => confirmSelection(screen, i));
    item.appendChild(confirmBtn);

    filesList.appendChild(item);
    fileItems.push({ item, status, sources, confirmBtn, selectedSource: null });
  });
  wrap.appendChild(filesList);

  // ========== QUESTION SECTION ==========
  const questionSection = document.createElement('div');
  questionSection.className = 'p3-a3-question-section';
  questionSection.style.display = 'none';

  const question = document.createElement('p');
  question.className = 'p3-question';
  question.textContent = '¿Qué fuente de recuperación utilzas para recuperar los 5 archivos eliminados durante el incidente?';
  questionSection.appendChild(question);

  const optionsEl = document.createElement('div');
  optionsEl.className = 'p3-options';

  const indices = PHASE3.activity3.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const optionEls = [];
  indices.forEach((originalIndex) => {
    const opt = document.createElement('button');
    opt.className = 'btn p3-option';
    opt.textContent = PHASE3.activity3.options[originalIndex];
    opt.dataset.choice = String(originalIndex);
    opt.addEventListener('click', () => {
      if (screen._a3Answered) return;
      screen._a3Answered = true;
      handleA3Pick(screen, optionEls, originalIndex);
    });
    optionEls.push(opt);
    optionsEl.appendChild(opt);
  });
  questionSection.appendChild(optionsEl);

  const feedback = document.createElement('p');
  feedback.className = 'p3-feedback';
  feedback.dataset.feedback = 'a3';
  questionSection.appendChild(feedback);

  wrap.appendChild(questionSection);

  // ========== NEXT BUTTON ==========
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--primary p3-next';
  nextBtn.textContent = 'VER RESULTADO FINAL';
  nextBtn.style.display = 'none';
  nextBtn.addEventListener('click', () => {
    AudioManager.playSFX(AUDIO_SFX.CLICK);
    screen._finishPhase3();
  });
  wrap.appendChild(nextBtn);

  screen.rootEl.appendChild(wrap);

  screen._a3FileItems = fileItems;
  screen._a3FeedbackEl = feedback;
  screen._a3NextEl = nextBtn;
  screen._a3Selected = {};
  screen._a3QuestionSection = questionSection;
  screen._a3OptionEls = optionEls;
}

function fileIconForExt(ext) {
  const icons = { DOC: 'W', DOCX: 'W', PDF: 'P', TXT: 'T', XLS: 'S', XLSX: 'S', PNG: 'I', JPG: 'I', PPT: 'F', PPTX: 'F', MP4: 'V', WAV: 'A', RTF: 'R' };
  return icons[ext.toUpperCase()] || 'F';
}

function selectSource(screen, fileIndex, sourceKey, btn) {
  const item = screen._a3FileItems[fileIndex];
  const time = BACKUP_TIMES[sourceKey][fileIndex];

  // Store selection
  screen._a3Selected[fileIndex] = { source: sourceKey, time };
  item.selectedSource = sourceKey;
  item.status.textContent = 'Seleccionado';
  item.status.className = 'p3-a3-filestatus p3-a3-selected';

  // Disable other source buttons for this file
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

function confirmSelection(screen, fileIndex) {
  const item = screen._a3FileItems[fileIndex];
  item.item.querySelector('button.p3-a3-confirm').style.display = 'none';
  item.status.textContent = 'Seleccionado';
  AudioManager.playSFX(AUDIO_SFX.CLICK);
}

function handleA3Pick(screen, optionEls, index) {
  const correct = index === PHASE3.activity3.correctIndex;
  const score = scoreActivity3(index);
  screen._setP3({ activity3Score: score });
  AudioManager.playSFX(correct ? AUDIO_SFX.SUCCESS : AUDIO_SFX.ERROR);

  optionEls.forEach((o, i) => {
    o.disabled = true;
    if (i === index) o.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
    if (i === PHASE3.activity3.correctIndex) o.classList.add('reveal-correct');
  });

  screen._a3FeedbackEl.textContent =
    correct ? PHASE3.activity3.explanation : PHASE3.activity3.explanation;
  screen._a3FeedbackEl.className = 'p3-feedback';
  screen._a3FeedbackEl.style.color = correct ? 'var(--p3-blue)' : 'var(--alert-red)';
  screen._a3NextEl.style.display = 'inline-block';
}
