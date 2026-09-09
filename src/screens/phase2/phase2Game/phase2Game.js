import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { State } from '../../../core/state.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { AnimationManager } from '../../../animation/animationManager.js';
import { VFXManager } from '../../../vfx/vfxManager.js';
import { UIManager } from '../../../ui/uiManager.js';
import { createButton } from '../../../ui/components/index.js';
import { resolveChoice } from './phase2Validator.js';
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
          <div class="p2-panel-head">CONTACTOS</div>
          <div class="p2-contacts-list" data-contacts></div>
        </aside>
        <main class="p2-panel p2-chat">
          <div class="p2-chat-head">
            <span class="p2-chat-contact" data-cname>—</span>
            <span class="p2-chat-status" data-cstatus>EN LÍNEA</span>
          </div>
          <div class="p2-chat-messages" data-messages></div>
          <div class="p2-options" data-options></div>
        </main>
        <aside class="p2-panel p2-terminal">
          <div class="p2-panel-head">SISTEMA DE VERIFICACIÓN</div>
          <div class="p2-term-body" data-term></div>
        </aside>
      </div>
    `;
    this._els = {
      contacts: container.querySelector('[data-contacts]'),
      cname: container.querySelector('[data-cname]'),
      cstatus: container.querySelector('[data-cstatus]'),
      messages: container.querySelector('[data-messages]'),
      options: container.querySelector('[data-options]'),
      terminal: container.querySelector('[data-term]'),
    };
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
    this._els.options.innerHTML = '';
    this._els.contacts.innerHTML = '';
    if (this.container.classList.contains('restored')) this.container.classList.remove('restored');
    if (this.container.classList.contains('stable')) this.container.classList.remove('stable');

    this._renderTerminal();

    AudioManager.playSFX(AUDIO_SFX.ALERT);
    VFXManager.glitch(this.container, 500);

    this._appendSystem('ANÁLISIS DE CANAL INICIADO · REVISE SUS CONTACTOS Y EL SISTEMA DE VERIFICACIÓN');
    this._buildContactsList();
    this._selectContact(PHASE2_CONTACTS[0].id, { fresh: true });
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
    sub.textContent = contact.type === 'attacker' ? 'NO VERIFICADO' : 'CANAL VERIFICABLE';

    const badge = document.createElement('span');
    badge.className = 'p2-badge';
    badge.textContent = String(contact.unread);

    meta.appendChild(name);
    meta.appendChild(sub);
    item.appendChild(avatar);
    item.appendChild(meta);
    item.appendChild(badge);

    item.addEventListener('click', () => this._selectContact(contact.id, { fresh: false }));
    this._els.contacts.appendChild(item);
    this._contactEls[contact.id] = { item, badge };
  },

  _selectContact(id, opts = {}) {
    if (this._busy) return;
    const contact = PHASE2_CONTACTS.find((c) => c.id === id) || null;
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
    this._els.messages.innerHTML = '';
    this._els.options.innerHTML = '';

    const convo = this._convo[id] || (this._convo[id] = { turnId: null, msgs: [], done: false });
    convo.msgs.forEach((m) => this._appendMessage(m.text, m.from, { instant: true }));

    AudioManager.playSFX(AUDIO_SFX.INTERACTION);

    if (opts.fresh && !convo.done) {
      if (convo.msgs.length <= 1) {
        this._appendSystem(`◉ CONTACTO NUEVO · MENSAJE DE ${contact.name}`);
      }
      if (!convo.turnId) {
        convo.turnId = Object.keys(contact.turns)[0];
        this._playTurn(contact, convo.turnId);
      }
    } else if (!convo.done) {
      const turn = contact.turns[convo.turnId];
      if (turn && turn.options) this._renderOptions(contact, convo.turnId);
    }

    this._saveState();
  },

  async _playTurn(contact, turnId) {
    if (!this._alive) return;
    this._busy = true;
    const convo = this._convo[contact.id];
    if (!convo) return;
    convo.turnId = turnId;
    const turn = contact.turns[turnId];
    if (!turn) {
      this._busy = false;
      return;
    }

    for (const text of turn.messages) {
      if (!this._alive) return;
      await this._showTyping(650);
      if (!this._alive) return;
      this._addMessage(text, 'them');
      await this._sleep(260);
    }

    if (!this._alive) return;
    if (turn.options) {
      this._renderOptions(contact, turnId);
    } else {
      this._completeContact(contact);
    }
    this._busy = false;
    this._saveState();
  },

  _renderOptions(contact, turnId) {
    const turn = contact.turns[turnId];
    if (!turn || !turn.options) return;
    this._els.options.innerHTML = '';
    this._optionBtns = [];
    turn.options.forEach((opt) => {
      const btn = createButton({ text: opt.label, classes: ['p2-option'] });
      btn.dataset.choice = `${contact.id}:${turnId}:${opt.id}`;
      btn.addEventListener('click', () => this._handleChoice(contact, turnId, opt));
      this._els.options.appendChild(btn);
      this._optionBtns.push(btn);
    });
  },

  async _handleChoice(contact, turnId, opt) {
    if (this._busy || !this._alive) return;
    const result = resolveChoice(contact, turnId, opt.id);
    if (!result) return;

    this._busy = true;
    this._decisions.push({
      contactId: contact.id,
      turnId,
      choiceId: opt.id,
      safe: !!opt.safe,
      critical: !!opt.critical,
    });

    this._optionBtns.forEach((b) => { b.disabled = true; });
    const clicked = this._optionBtns.find((b) => b.dataset.choice === `${contact.id}:${turnId}:${opt.id}`);
    if (clicked) clicked.classList.add('chosen');

    this._addMessage(opt.label, 'user');

    if (opt.critical) {
      AudioManager.playSFX(AUDIO_SFX.ERROR);
      VFXManager.redFlash(350);
      this._termAppend('× DECISIÓN CRÍTICA · CANAL EXPUESTO', 'danger');
    } else if (opt.safe) {
      AudioManager.playSFX(AUDIO_SFX.SUCCESS);
      this._termAppend('> DECISIÓN SEGURA REGISTRADA', 'ok');
    } else {
      AudioManager.playSFX(AUDIO_SFX.WARNING);
      VFXManager.glitch(this.container, 300);
      this._termAppend('! DECISIÓN DE RIESGO · SE GENERÓ PRESIÓN', 'warn');
    }

    await this._sleep(650);
    if (!this._alive) return;

    if (result.next === 'defeat') {
      this._goDefeat();
      return;
    }
    if (result.next === 'complete') {
      this._completeContact(contact);
      this._busy = false;
      return;
    }
    this._busy = false;
    this._playTurn(contact, result.next);
  },

  async _completeContact(contact) {
    const convo = this._convo[contact.id];
    if (!convo || convo.done) return;
    convo.done = true;
    convo.turnId = Object.keys(contact.turns)[Object.keys(contact.turns).length - 1];

    const order = PHASE2_CONTACTS.findIndex((c) => c.id === contact.id) + 1;
    this._appendSystem(`◉ CONTACTO ${order} SUPERADO · ANÁLISIS COMPLETADO`);
    this._termAppend(PHASE2_TERMINAL_PROGRESS[contact.id] || `[ OK ] CONTACTO ${order} SUPERADO`, 'ok');
    AudioManager.playSFX(AUDIO_SFX.SUCCESS);

    if (contact.type === 'legit' && !this._verified.includes(contact.id)) {
      this._verified.push(contact.id);
    }

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
      currentTurn: active.turnId || null,
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