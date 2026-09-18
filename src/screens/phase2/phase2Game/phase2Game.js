import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { State } from '../../../core/state.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { AnimationManager } from '../../../animation/animationManager.js';
import { VFXManager } from '../../../vfx/vfxManager.js';
import { UIManager } from '../../../ui/uiManager.js';
import { createButton } from '../../../ui/components/index.js';
import { findContact, matchResponse } from './phase2Validator.js';
import {
  PHASE2_CONTACTS,
  PHASE2_TERMINAL_INITIAL,
  PHASE2_TERMINAL_PROGRESS,
  PHASE2_TERMINAL_FINAL,
  PHASE2_REMEMBER_TITLE,
  PHASE2_REMEMBER_LINES,
  PHASE2_REMEMBER_BUTTON,
} from './phase2Data.js';

export const phase2GameScreen = {
  id: SCREENS.PHASE_2,
  implemented: true,
  _alive: false,
  _timers: [],

  render(container) {
    container.classList.add('screen--phase2', 'degraded');
    container.innerHTML = `
      <div class="p2-layout">
        <aside class="p2-panel p2-contacts">
          <div class="p2-panel-head">CONTACTOS <span class="p2-head-stat" data-csum></span></div>
          <div class="p2-contacts-list" data-contacts></div>
          <div class="p2-net-foot" data-netfoot></div>
        </aside>
        <main class="p2-panel p2-chat">
          <div class="p2-chat-head">
            <span class="p2-chat-contact" data-cname>—</span>
            <span class="p2-chat-status" data-cstatus>EN LÍNEA</span>
          </div>
          <div class="p2-chat-meta" data-cmeta></div>
          <div class="p2-chat-messages" data-messages></div>
          <div class="p2-input-bar">
            <input class="p2-input" data-input type="text" placeholder="Escribe tu respuesta..." autocomplete="off" />
          </div>
        </main>
        <aside class="p2-panel p2-terminal">
          <div class="p2-panel-head">SISTEMA DE VERIFICACIÓN</div>
          <div class="p2-term-body" data-term></div>
          <div class="p2-refopts" data-refopts></div>
        </aside>
      </div>
    `;
    this._els = {
      contacts: container.querySelector('[data-contacts]'),
      cname: container.querySelector('[data-cname]'),
      cstatus: container.querySelector('[data-cstatus]'),
      cmeta: container.querySelector('[data-cmeta]'),
      messages: container.querySelector('[data-messages]'),
      input: container.querySelector('[data-input]'),
      inputBar: container.querySelector('.p2-input-bar'),
      terminal: container.querySelector('[data-term]'),
      refopts: container.querySelector('[data-refopts]'),
      csum: container.querySelector('[data-csum]'),
      netfoot: container.querySelector('[data-netfoot]'),
    };
    this._els.send = createButton({
      text: 'ENVIAR',
      classes: ['p2-send'],
      onClick: () => this._sendMessage(),
    });
    this._els.inputBar.appendChild(this._els.send);
  },

  async enter() {
    this._alive = true;
    this._timers = [];
    this._decisions = [];
    this._verified = [];
    this._convo = {};
    this._contactEls = {};
    this._activeContactId = null;
    this._busy = false;
    this._phase2Done = false;

    this._els.messages.innerHTML = '';
    this._els.refopts.innerHTML = '';
    this._els.contacts.innerHTML = '';
    this._els.cmeta.textContent = '';
    if (this.container.classList.contains('restored')) this.container.classList.remove('restored');
    if (this.container.classList.contains('stable')) this.container.classList.remove('stable');

    this._renderTerminal();

    AudioManager.playSFX(AUDIO_SFX.ALERT);
    VFXManager.glitch(this.container, 500);

    this._appendSystem('ANÁLISIS DE CANAL INICIADO · REVISE SUS CONTACTOS Y EL SISTEMA DE VERIFICACIÓN');
    this._buildContactsList();
    this._buildNetFoot();
    this._selectContact(PHASE2_CONTACTS[0].id, { fresh: true });
    this._saveState();
  },

  async exit() {
    this._alive = false;
    this._busy = false;
    this._timers.forEach((t) => clearTimeout(t));
    this._timers = [];
  },

  _buildContactsList() {
    this._revealed = [0];
    this._buildContactItem(PHASE2_CONTACTS[0]);
    this._els.csum.textContent = `${PHASE2_CONTACTS.length} ESCENARIOS`;
  },

  _buildContactItem(contact) {
    const item = document.createElement('div');
    item.className = 'p2-contact';
    item.dataset.contact = contact.id;

    const avatar = document.createElement('span');
    avatar.className = 'p2-contact-avatar';
    avatar.textContent = contact.initials;

    const meta = document.createElement('span');
    meta.className = 'p2-contact-meta';

    const name = document.createElement('span');
    name.className = 'p2-contact-name';
    name.textContent = contact.name;

    const sub = document.createElement('span');
    sub.className = 'p2-contact-sub';
    sub.textContent = contact.tag;

    const micro = document.createElement('span');
    micro.className = 'p2-contact-micro';
    micro.innerHTML = `<i class="p2-dot"></i> CANAL ${contact.channelId} · ACTIVIDAD RECIENTE`;

    const badge = document.createElement('span');
    badge.className = 'p2-badge';
    badge.textContent = String(contact.unread);

    meta.appendChild(name);
    meta.appendChild(sub);
    meta.appendChild(micro);
    item.appendChild(avatar);
    item.appendChild(meta);
    item.appendChild(badge);

    item.addEventListener('click', () => this._selectContact(contact.id, { fresh: false }));
    this._els.contacts.appendChild(item);
    this._contactEls[contact.id] = { item, badge };
  },

  _buildNetFoot() {
    const lines = [
      'SESION: TSC-2026-0x41',
      'CANAL: RESTAURADO · PUERTO 443',
      'LATENCIA MEDIA: 23ms',
      'CRIPTO: AES-256 · TLS 1.3',
      'HOST REMOTO: id.tecsup.edu.pe',
      'ADVERTENCIAS: 0 · ERRORES: 0',
    ];
    lines.forEach((t) => {
      const line = document.createElement('div');
      line.className = 'p2-net-line';
      line.textContent = t;
      this._els.netfoot.appendChild(line);
    });
  },

  _selectContact(id, opts = {}) {
    if (this._busy) return;
    const contact = findContact(id);
    if (!contact) return;

    this._activeContactId = id;
    Object.values(this._contactEls).forEach(({ item }) => item.classList.remove('active'));
    const rec = this._contactEls[id];
    if (rec) {
      rec.item.classList.add('active');
      rec.badge.style.display = 'none';
    }

    this._els.cname.textContent = contact.name;
    this._els.cstatus.textContent = 'EN LÍNEA';
    this._els.cmeta.textContent = contact.tag + ' · ' + contact.channelId;
    this._els.messages.innerHTML = '';

    const convo = this._convo[id] || (this._convo[id] = { started: false, msgs: [], done: false });
    convo.msgs.forEach((m) => this._appendMessage(m.text, m.from, { instant: true }));

    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
    this._refopts(contact);
    this._setInputEnabled(true);

    if (opts.fresh && !convo.done && !convo.started) {
      convo.started = true;
      this._appendSystem(`◉ CONTACTO NUEVO · MENSAJE DE ${contact.name}`);
      this._playTurn(contact);
    }

    this._saveState();
  },

  async _playTurn(contact) {
    if (!this._alive) return;
    this._busy = true;
    this._setInputEnabled(false);
    const convo = this._convo[contact.id];
    if (!convo) return;

    for (const text of contact.messages) {
      if (!this._alive) return;
      await this._showTyping(650);
      if (!this._alive) return;
      this._addMessage(text, 'them');
      await this._sleep(260);
    }

    if (!this._alive) return;
    this._busy = false;
    this._setInputEnabled(true);
    this._saveState();
  },

  async _playPressure(contact) {
    if (!this._alive) return;
    const pressure = contact.pressure;
    if (!pressure || !pressure.messages || !pressure.messages.length) {
      this._refopts(contact);
      this._setInputEnabled(true);
      return;
    }
    for (const text of pressure.messages) {
      if (!this._alive) return;
      await this._showTyping(520);
      if (!this._alive) return;
      this._addMessage(text, 'them');
      await this._sleep(240);
    }
    if (!this._alive) return;
    this._refopts(contact);
    this._setInputEnabled(true);
    this._saveState();
  },

  _refopts(contact) {
    if (!contact || !contact.options) return;
    this._els.refopts.innerHTML = `
      <div class="p2-refopts-head">RESPUESTAS VÁLIDAS · ${contact.tag}</div>
    `;
    const shuffled = contact.options.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const letters = ['A', 'B', 'C', 'D'];
    shuffled.forEach((opt, idx) => {
      const card = document.createElement('div');
      card.className = 'p2-refopt';
      const letter = document.createElement('span');
      letter.className = 'p2-refopt-letter';
      letter.textContent = letters[idx];
      const text = document.createElement('span');
      text.className = 'p2-refopt-text';
      text.textContent = opt.label;
      card.appendChild(letter);
      card.appendChild(text);
      this._els.refopts.appendChild(card);
    });
  },

  _sendMessage() {
    if (this._busy || !this._alive) return;
    const text = (this._els.input.value || '').trim();
    if (!text) return;
    this._addMessage(text, 'user');
    this._els.input.value = '';
    AudioManager.playSFX(AUDIO_SFX.INTERACTION);
    this._handleResponse(text);
  },

  async _handleResponse(text) {
    if (this._busy || !this._alive) return;
    const contact = findContact(this._activeContactId);
    if (!contact) return;
    const opt = matchResponse(contact, text);
    if (!opt) return;

    this._busy = true;
    this._setInputEnabled(false);
    this._decisions.push({
      contactId: contact.id,
      optionId: opt.id,
      letter: opt.letter,
      safe: !!opt.safe,
      risk: !!opt.risk,
      critical: !!opt.critical,
    });
    this._termAppend(`> RESPONDE: ${opt.letter}`, '');

    if (opt.critical) {
      AudioManager.playSFX(AUDIO_SFX.ERROR);
      VFXManager.redFlash(350);
      this._termAppend('× DECISIÓN CRÍTICA · CANAL EXPUESTO', 'danger');
      this._appendSystem('× DECISIÓN CRÍTICA · EL CANAL HA SIDO EXPUESTO');
      this._saveState();
      await this._sleep(650);
      if (this._alive) this._goDefeat();
      return;
    }

    if (opt.safe) {
      AudioManager.playSFX(AUDIO_SFX.SUCCESS);
      this._termAppend('> DECISIÓN SEGURA REGISTRADA', 'ok');
      this._appendSystem('✓ DECISIÓN SEGURA · ESCENARIO SUPERADO');
      this._saveState();
      await this._sleep(550);
      this._busy = false;
      if (this._alive) this._completeContact(contact);
      return;
    }

    AudioManager.playSFX(AUDIO_SFX.WARNING);
    VFXManager.glitch(this.container, 300);
    this._termAppend('! DECISIÓN DE RIESGO · SE GENERÓ PRESIÓN', 'warn');
    this._appendSystem('! DECISIÓN DE RIESGO · EL SOLICITANTE AUMENTA LA PRESIÓN');
    this._saveState();
    await this._sleep(520);
    if (this._alive) await this._playPressure(contact);
    this._busy = false;
  },

  async _completeContact(contact) {
    const convo = this._convo[contact.id];
    if (!convo || convo.done) return;
    convo.done = true;

    const order = PHASE2_CONTACTS.findIndex((c) => c.id === contact.id) + 1;
    this._appendSystem(`◉ ESCENARIO ${order} SUPERADO · ANÁLISIS COMPLETADO`);
    this._termAppend(PHASE2_TERMINAL_PROGRESS[contact.id] || `[ OK ] ESCENARIO ${order} SUPERADO`, 'ok');
    AudioManager.playSFX(AUDIO_SFX.SUCCESS);

    this._saveState();

    const completedCount = PHASE2_CONTACTS.filter((c) => {
      const cv = this._convo[c.id];
      return cv && cv.done;
    }).length;

    if (completedCount >= PHASE2_CONTACTS.length) {
      this._finishPhase2();
      return;
    }

    await this._sleep(1000);
    if (!this._alive) return;

    const nextIndex = this._revealed.length;
    if (nextIndex < PHASE2_CONTACTS.length) {
      this._revealed.push(nextIndex);
      this._buildContactItem(PHASE2_CONTACTS[nextIndex]);
      if (completedCount === 2 && this.container.classList.contains('degraded')) {
        this.container.classList.remove('degraded');
        this.container.classList.add('stable');
      }
      this._selectContact(PHASE2_CONTACTS[nextIndex].id, { fresh: true });
    }
  },

  _finishPhase2() {
    this._phase2Done = true;
    PHASE2_TERMINAL_FINAL.forEach((line) => this._termAppend(line, 'ok'));
    if (this.container.classList.contains('stable')) this.container.classList.remove('stable');
    this.container.classList.add('restored');
    AudioManager.playSFX(AUDIO_SFX.TRANSITION);
    VFXManager.glitch(this.container, 350);

    State.set('gameProgress', { ...State.get('gameProgress'), phase2: 'completed' });
    this._saveState();

    AudioManager.playSFX(AUDIO_SFX.POPUP);

    const content = document.createElement('div');
    content.className = 'p2-remember';
    PHASE2_REMEMBER_LINES.forEach((line) => {
      const p = document.createElement('p');
      p.className = 'p2-remember-line';
      p.textContent = line;
      content.appendChild(p);
    });

    UIManager.createPopup({
      title: PHASE2_REMEMBER_TITLE,
      content,
      buttonText: PHASE2_REMEMBER_BUTTON,
      onClose: () => {
        AudioManager.playSFX(AUDIO_SFX.TRANSITION);
        Router.show(SCREENS.PHASE_3_LOADING);
      },
    });
  },

  _goDefeat() {
    AudioManager.playSFX(AUDIO_SFX.ERROR);
    VFXManager.redFlash(450);
    State.set('gameProgress', { ...State.get('gameProgress'), phase2: 'failed' });
    this._sleep(800).then(() => {
      if (this._alive) Router.show(SCREENS.PHASE_2_DEFEAT_LOADING);
    });
  },

  _renderTerminal() {
    this._els.terminal.innerHTML = '';
    PHASE2_TERMINAL_INITIAL.forEach((line) => this._termAppend(line.text, line.cls));
  },

  _termAppend(text, cls) {
    const line = document.createElement('div');
    line.className = cls ? `p2-term-line ${cls}` : 'p2-term-line';
    line.textContent = text;
    this._els.terminal.appendChild(line);
  },

  _setInputEnabled(enabled) {
    this._els.input.disabled = !enabled && this._alive;
    this._els.send.disabled = !enabled && this._alive;
  },

  _showTyping(ms) {
    const convo = this._convo[this._activeContactId];
    const box = document.createElement('div');
    box.className = 'p2-typing';
    box.innerHTML = '<span></span><span></span><span></span>';
    if (convo) convo.msgs.push({ text: 'typing', from: 'typing' });
    this._els.messages.appendChild(box);
    AudioManager.playSFX(AUDIO_SFX.TYPING);
    this._scroll();
    return this._sleep(ms).then(() => {
      box.remove();
      if (convo) convo.msgs.splice(convo.msgs.length - 1, 1);
    });
  },

  _addMessage(text, from) {
    this._appendMessage(text, from, { instant: false });
  },

  _appendMessage(text, from, opts = {}) {
    const convo = this._convo[this._activeContactId];
    if (convo) convo.msgs.push({ text, from });
    if (from === 'typing') return;

    const el = document.createElement('div');
    el.className = `p2-msg p2-msg-${from}`;
    el.textContent = text;
    this._els.messages.appendChild(el);
    if (opts.instant) {
      this._scroll();
    } else {
      AnimationManager.slideUp(el, 220);
      AudioManager.playSFX(from === 'user' ? AUDIO_SFX.INTERACTION : AUDIO_SFX.TICK);
      this._scroll();
    }
  },

  _appendSystem(text) {
    this._appendMessage(text, 'sys');
  },

  _scroll() {
    this._els.messages.scrollTop = this._els.messages.scrollHeight;
  },

  _saveState() {
    const completed = PHASE2_CONTACTS.filter((c) => {
      const cv = this._convo[c.id];
      return cv && cv.done;
    }).length;
    const active = this._convo[this._activeContactId] || {};
    State.set('phase2State', {
      currentContact: this._activeContactId,
      currentTurn: active.done ? 'ok' : active.started ? 'awaiting' : null,
      contactsCompleted: completed,
      decisions: this._decisions,
      verifiedContacts: this._verified,
      phase2Completed: !!this._phase2Done,
    });
  },

  _sleep(ms) {
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        this._timers = this._timers.filter((x) => x !== t);
        resolve();
      }, ms);
      this._timers.push(t);
    });
  },
};