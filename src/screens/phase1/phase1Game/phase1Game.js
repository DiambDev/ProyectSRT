import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { State } from '../../../core/state.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { UIManager } from '../../../ui/uiManager.js';
import { typewriter } from '../../../ui/typewriter.js';
import {
  PHASE1_PROTOCOL_TITLE,
  PHASE1_MISSION,
  PHASE1_MISSION_AFTER,
  PHASE1_QUESTION_INTRO,
  PHASE1_QUESTION,
  PHASE1_QUESTION_OPTIONS,
  PHASE1_CORRECT_OPTION_ID,
  PHASE1_SEQUENCE_ORDER,
  PHASE1_ACTIONS,
  PHASE1_REFLECTION,
} from './phase1Data.js';
import { isCorrectSequence } from './phase1Validator.js';

const PANEL_LOG_LEFT = [
  'ticket INT-2290 asignado', 'segmento WEB-001 aislado', 'forense: volcado iniciado',
  'evidencia: bitácora retenida', 'alcance: 3 hosts confirmados',
];

const PANEL_LOG_RIGHT = [
  'sesión confiable mantenida', 'telemetría activa', 'escalamiento a SOC en espera',
  'recurso: análisis en curso', 'panorama: parcial',
];

export const phase1GameScreen = {
  id: SCREENS.PHASE_1,
  implemented: true,
  _alive: false,
  _timers: new Set(),

  render(container) {
    container.classList.add('screen--phase1');
    container.innerHTML = `
      <div class="phase1-root">
        <aside class="p1-panel p1-panel--left"></aside>
        <main class="p1-main">
          <header class="p1-head">
            <span class="p1-head-tag">[FASE 1 :: RESPUESTA A INCIDENTE]</span>
            <h1 class="p1-title">${PHASE1_PROTOCOL_TITLE}</h1>
          </header>
          <div class="p1-stage" data-stage></div>
        </main>
        <aside class="p1-panel p1-panel--right"></aside>
        <footer class="p1-statusbar">
          <span>USR: OPERADOR-01</span>
          <span class="p1-statusbar-mid" data-clock>--:--:--</span>
          <span>NIVEL: CRÍTICO</span>
        </footer>
      </div>
    `;
  },

  async enter() {
    this._alive = true;
    this._timers.clear();
    this._selected = [];
    this._selectedOption = null;
    this._stage = 'intro';

    State.set('currentPhase', 1);
    State.set('phase1State', {
      stage: 'intro',
      answer: '',
      answerCorrect: false,
      selectedActionIds: [],
      poolActionIds: this._shuffle(PHASE1_ACTIONS.map((a) => a.id)),
      sequenceValidated: false,
    });

    this.stageEl = this.container.querySelector('[data-stage]');
    this._startPanels();
    this._startClock();

    const title = this.container.querySelector('.p1-title');
    if (title) {
      title.classList.remove('is-in');
      void title.offsetWidth;
      title.classList.add('is-in');
    }

    AudioManager.playSFX(AUDIO_SFX.ALERT);
    await this._runIntro();
  },

  async exit() {
    this._alive = false;
    if (this._panelInterval) clearInterval(this._panelInterval);
    if (this._clockInterval) clearInterval(this._clockInterval);
    this._timers.forEach((id) => clearTimeout(id));
    this._timers.clear();
  },

  _sleep(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        this._timers.delete(id);
        resolve();
      }, ms);
      this._timers.add(id);
    });
  },

  _schedule(fn, ms) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      if (this._alive) fn();
    }, ms);
    this._timers.add(id);
  },

  _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  _setStage(stage) {
    this._stage = stage;
    State.set('phase1State', { ...State.get('phase1State'), stage });
  },

  _startClock() {
    const el = this.container.querySelector('[data-clock]');
    this._clockInterval = setInterval(() => {
      if (!this._alive) {
        clearInterval(this._clockInterval);
        return;
      }
      if (el) {
        const d = new Date();
        el.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      }
    }, 1000);
  },

  _startPanels() {
    const left = this.container.querySelector('.p1-panel--left');
    const right = this.container.querySelector('.p1-panel--right');
    if (!left || !right) return;
    let li = 0;
    let ri = 0;
    this._panelInterval = setInterval(() => {
      if (!this._alive) {
        clearInterval(this._panelInterval);
        return;
      }
      const line = document.createElement('div');
      line.className = 'p1-panel-line';
      if (li < PANEL_LOG_LEFT.length) {
        line.textContent = PANEL_LOG_LEFT[li];
        left.appendChild(line);
        li++;
      }
      const lineR = document.createElement('div');
      lineR.className = 'p1-panel-line';
      if (ri < PANEL_LOG_RIGHT.length) {
        lineR.textContent = PANEL_LOG_RIGHT[ri];
        right.appendChild(lineR);
        ri++;
      }
    }, 2200);
  },

  async _runIntro() {
    this._setStage('intro');
    this.stageEl.innerHTML = `
      <div class="p1-mission">
        <div class="p1-label">CONTEXTO DE LA INTRUSION</div>
        <p class="p1-desc" data-desc></p>
      </div>
    `;
    const desc = this.stageEl.querySelector('.p1-desc');
    await typewriter(desc, PHASE1_MISSION, {
      speed: 16,
      sound: AUDIO_SFX.TYPING,
      audio: AudioManager,
      alive: () => this._alive && this._stage === 'intro',
    });
    if (!this._alive) return;
    await this._sleep(380);
    if (!this._alive) return;
    this._buildQuestion();
  },

  _buildQuestion() {
    if (!this._alive) return;
    this._setStage('question');
    this._selectedOption = null;
    this.stageEl.innerHTML = `
      <div class="p1-q">
        <div class="p1-label">EVALUACION DE ANALISTA</div>
        <p class="p1-q-intro">${PHASE1_QUESTION_INTRO}</p>
        <p class="p1-q-question">${PHASE1_QUESTION}</p>
        <div class="p1-q-options"></div>
        <div class="p1-answer-actions"></div>
        <div class="p1-feedback"></div>
      </div>
    `;
    this.optionsEl = this.stageEl.querySelector('.p1-q-options');
    this.feedbackEl = this.stageEl.querySelector('.p1-feedback');

    PHASE1_QUESTION_OPTIONS.forEach((opt) => {
      const btn = document.createElement('button');
      btn.classList.add('p1q-opt', 'btn');
      btn.dataset.qopt = opt.id;
      btn.innerHTML = `<span class="p1q-opt-letter">${opt.id}</span><span class="p1q-opt-label">${opt.label}</span>`;
      btn.addEventListener('click', () => this._selectOption(opt.id));
      this.optionsEl.appendChild(btn);
    });

    const actions = this.stageEl.querySelector('.p1-answer-actions');
    this.confirmButton = UIManager.createButton({
      text: 'CONFIRMAR',
      classes: ['btn--primary'],
      disabled: true,
      onClick: () => this._confirmAnswer(),
    });
    actions.appendChild(this.confirmButton);
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
  },

  _selectOption(id) {
    if (!this._alive || this._stage !== 'question') return;
    this._selectedOption = id;
    AudioManager.playSFX(AUDIO_SFX.CLICK);
    this._refreshOptions();
  },

  _refreshOptions() {
    if (!this.optionsEl) return;
    Array.from(this.optionsEl.children).forEach((btn) => {
      const id = btn.dataset.qopt;
      btn.classList.toggle('selected', id === this._selectedOption);
      btn.classList.remove('correct', 'wrong');
    });
    this._setConfirmEnabled(!!this._selectedOption);
  },

  _setConfirmEnabled(enabled) {
    if (this.confirmButton) this.confirmButton.disabled = !enabled;
  },

  _confirmAnswer() {
    if (!this._alive || this._stage !== 'question' || !this._selectedOption) {
      AudioManager.playSFX(AUDIO_SFX.INTERACTION);
      return;
    }
    const opt = PHASE1_QUESTION_OPTIONS.find((o) => o.id === this._selectedOption);
    if (!opt) return;
    this._setStage('answered');
    const correct = !!opt.correct;

    State.set('phase1State', {
      ...State.get('phase1State'),
      answer: opt.id,
      answerCorrect: correct,
    });

    Array.from(this.optionsEl.children).forEach((btn) => {
      if (btn.dataset.qopt === opt.id) {
        btn.classList.add(correct ? 'correct' : 'wrong');
        btn.classList.remove('selected');
      } else {
        btn.style.opacity = '0.35';
        btn.classList.add('disabled');
      }
    });
    if (this.confirmButton) this.confirmButton.disabled = true;

    if (correct) {
      AudioManager.playSFX(AUDIO_SFX.SUCCESS);
      this.feedbackEl.textContent = 'RESPUESTA CORRECTA // ANÁLISIS VALIDADO';
      this.feedbackEl.className = 'p1-feedback ok';
      this._sleep(950).then(() => {
        if (this._alive) this._afterQuestion();
      });
    } else {
      AudioManager.playSFX(AUDIO_SFX.ERROR);
      this.feedbackEl.textContent = 'RESPUESTA INCORRECTA. PROTOCOLO FALLIDO';
      this.feedbackEl.className = 'p1-feedback bad';
      this._shakeStage();
      State.set('gameProgress', { ...State.get('gameProgress'), phase1: 'failed' });
      this._sleep(950).then(() => {
        if (this._alive) Router.show(SCREENS.PHASE_1_DEFEAT_LOADING);
      });
    }
  },

  _shakeStage() {
    if (this.stageEl) this.stageEl.classList.remove('shake');
    void (this.stageEl && this.stageEl.offsetWidth);
    if (this.stageEl) this.stageEl.classList.add('shake');
  },

  async _afterQuestion() {
    if (!this._alive) return;
    this._setStage('narrative');
    this.stageEl.innerHTML = `
      <div class="p1-mission">
        <div class="p1-label">SECUENCIA DE RESPUESTA</div>
        <p class="p1-desc" data-desc></p>
      </div>
    `;
    const desc = this.stageEl.querySelector('.p1-desc');
    await typewriter(desc, PHASE1_MISSION_AFTER, {
      speed: 16,
      sound: AUDIO_SFX.TYPING,
      audio: AudioManager,
      alive: () => this._alive && this._stage === 'narrative',
    });
    if (!this._alive) return;
    await this._sleep(380);
    if (!this._alive) return;
    this._buildSequence();
  },

  _buildSequence() {
    if (!this._alive) return;
    this._setStage('sequence');
    this._selected = [];
    this.stageEl.innerHTML = `
      <div class="p1-s2">
        <div class="p1-label">ORDEN DE RESPUESTA</div>
        <p class="p1-s2-hint">Completa los 3 bloques con las medidas correctas y en el orden establecido por el protocolo. Pulsa un bloque para quitar su medida.</p>
        <div class="s2-slots"></div>
        <div class="s2-pool"></div>
        <div class="p1-answer-actions"></div>
        <div class="p1-feedback"></div>
      </div>
    `;
    this.slotsEl = this.stageEl.querySelector('.s2-slots');
    this.poolEl = this.stageEl.querySelector('.s2-pool');
    this.feedbackEl = this.stageEl.querySelector('.p1-feedback');

    const actions = this.stageEl.querySelector('.p1-answer-actions');
    this.confirmButton = UIManager.createButton({
      text: 'VALIDAR',
      classes: ['btn--primary'],
      disabled: true,
      onClick: () => this._validateSequence(),
    });
    actions.appendChild(this.confirmButton);

    this.poolOrder = this._shuffle(PHASE1_ACTIONS.slice());
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
    this._renderSequence();
  },

  _renderSequence() {
    if (!this.poolEl || !this.slotsEl) return;
    this.poolEl.innerHTML = '';
    this.slotsEl.innerHTML = '';

    this.slotEls = [];
    PHASE1_SEQUENCE_ORDER.forEach((_, i) => {
      const slot = document.createElement('div');
      slot.classList.add('s2-slot');
      if (this._selected[i]) slot.classList.add('filled');
      slot.dataset.slot = String(i);
      const action = this._selected[i] ? PHASE1_ACTIONS.find((a) => a.id === this._selected[i]) : null;
      if (action) {
        const letter = document.createElement('span');
        letter.className = 's2-slot-step';
        letter.textContent = String(i + 1);
        const label = document.createElement('span');
        label.className = 's2-slot-label';
        label.textContent = action.label;
        slot.appendChild(letter);
        slot.appendChild(label);
      } else {
        slot.textContent = ['PRIMER PASO', 'SEGUNDO PASO', 'TERCER PASO'][i] || `PASO ${i + 1}`;
        slot.classList.add('empty');
      }
      slot.addEventListener('click', () => this._removeAction(i));
      this.slotsEl.appendChild(slot);
      this.slotEls.push(slot);
    });

    this.poolOrder.forEach((action) => {
      if (this._selected.includes(action.id)) return;
      const chip = document.createElement('div');
      chip.classList.add('s2-chip');
      chip.dataset.chip = action.id;
      chip.textContent = action.label;
      chip.addEventListener('click', () => this._addAction(action.id));
      this.poolEl.appendChild(chip);
    });

    if (this.confirmButton) {
      this.confirmButton.disabled = this._selected.length !== PHASE1_SEQUENCE_ORDER.length;
    }
  },

  _addAction(id) {
    if (!this._alive || this._stage !== 'sequence') return;
    if (this._selected.includes(id) || this._selected.length >= PHASE1_SEQUENCE_ORDER.length) return;
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
    this._selected.push(id);
    State.set('phase1State', { ...State.get('phase1State'), selectedActionIds: [...this._selected] });
    this._renderSequence();
  },

  _removeAction(index) {
    if (!this._alive || this._stage !== 'sequence') return;
    if (index < 0 || index >= this._selected.length) return;
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
    this._selected.splice(index, 1);
    State.set('phase1State', { ...State.get('phase1State'), selectedActionIds: [...this._selected] });
    this._renderSequence();
  },

  _validateSequence() {
    if (!this._alive || this._stage !== 'sequence') return;
    if (this._selected.length !== PHASE1_SEQUENCE_ORDER.length) return;
    this._setStage('validated');
    const correct = isCorrectSequence(this._selected);
    State.set('phase1State', { ...State.get('phase1State'), sequenceValidated: correct });

    if (this.slotEls) {
      this.slotEls.forEach((s) => s.classList.add(correct ? 'success' : 'wrong'));
    }
    if (this.confirmButton) this.confirmButton.disabled = true;

    if (correct) {
      AudioManager.playSFX(AUDIO_SFX.SUCCESS);
      this.feedbackEl.textContent = 'SECUENCIA CORRECTA. PROTOCOLO EJECUTADO.';
      this.feedbackEl.className = 'p1-feedback ok';
      this._sleep(950).then(() => {
        if (this._alive) this._showSuccessPopup();
      });
    } else {
      AudioManager.playSFX(AUDIO_SFX.ERROR);
      this.feedbackEl.textContent = 'SECUENCIA INCORRECTA. PROTOCOLO FALLIDO';
      this.feedbackEl.className = 'p1-feedback bad';
      this._shakeStage();
      State.set('gameProgress', { ...State.get('gameProgress'), phase1: 'failed' });
      this._sleep(950).then(() => {
        if (this._alive) Router.show(SCREENS.PHASE_1_DEFEAT_LOADING);
      });
    }
  },

  _showSuccessPopup() {
    if (!this._alive) return;
    this._setStage('success');
    State.set('gameProgress', { ...State.get('gameProgress'), phase1: 'completed' });
    AudioManager.playSFX(AUDIO_SFX.POPUP);
    UIManager.createPopup({
      title: '¡Bien!',
      message: PHASE1_REFLECTION,
      buttonText: 'CONTINUAR',
      onClose: () => Router.show(SCREENS.PHASE_2_LOADING),
    });
  },
};