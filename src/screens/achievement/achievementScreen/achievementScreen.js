import { SCREENS, AUDIO_SFX } from '../../../core/constants.js';
import { Router } from '../../../core/router.js';
import { State } from '../../../core/state.js';
import { AudioManager } from '../../../audio/audioManager.js';
import { PHASE3, scoreMessageFor, formatScore } from '../../phase3/phase3Game/phase3Data.js';

export const achievementScreen = {
  id: SCREENS.ACHIEVEMENT,

  render(container) {
    container.classList.add('screen--achievement');
    container.innerHTML = '<div class="result-root"></div>';
    this.rootEl = container.querySelector('.result-root');
  },

  async enter() {
    this._build();
  },

  async exit() {},

  _build() {
    const s = State.get('phase3State');
    const score = Number(s.finalScore || 0);
    const msg = scoreMessageFor(score);

    AudioManager.playSFX(AUDIO_SFX.SUCCESS);
    AudioManager.playMusic('achievement');

    this.rootEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'result-card';
    wrap.style.animation = 'scaleIn 0.5s ease forwards';

    const kicker = document.createElement('div');
    kicker.className = 'result-kicker';
    kicker.textContent = 'SIMULACIÓN COMPLETADA';
    wrap.appendChild(kicker);

    const title = document.createElement('h2');
    title.className = 'result-title';
    title.textContent = 'REPORTE FINAL';
    wrap.appendChild(title);

    const scoreEl = document.createElement('div');
    scoreEl.className = 'result-score';
    const scoreNum = document.createElement('div');
    scoreNum.className = 'result-score-number';
    scoreNum.textContent = formatScore(score);
    const scoreTotal = document.createElement('div');
    scoreTotal.className = 'result-score-total';
    scoreTotal.textContent = '/ 20';
    scoreEl.appendChild(scoreNum);
    scoreEl.appendChild(scoreTotal);
    wrap.appendChild(scoreEl);

    const summary = document.createElement('div');
    summary.className = 'result-summary';

    const rows = [
      ['ACTIVIDAD 1', 'Verificación de archivos recuperados', formatScore(s.activity1Score), '/ 4'],
      ['ACTIVIDAD 2', 'Identificación de archivos modificados', formatScore(s.activity2Score), '/ 10'],
      ['ACTIVIDAD 3', 'Recuperación de archivos eliminados', formatScore(s.activity3Score), '/ 6'],
    ];
    rows.forEach(([label, sub, val, total]) => {
      const row = document.createElement('div');
      row.className = 'result-row';
      const l = document.createElement('div');
      l.className = 'result-row-label';
      const l1 = document.createElement('strong');
      l1.textContent = label;
      const l2 = document.createElement('span');
      l2.textContent = sub;
      l.appendChild(l1);
      l.appendChild(l2);
      const v = document.createElement('div');
      v.className = 'result-row-value';
      v.textContent = `${val} ${total}`;
      row.appendChild(l);
      row.appendChild(v);
      summary.appendChild(row);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'result-row result-total';
    const l = document.createElement('div');
    l.className = 'result-row-label';
    l.innerHTML = '<strong>TOTAL</strong>';
    const v = document.createElement('div');
    v.className = 'result-row-value';
    v.textContent = `${formatScore(score)} / 20`;
    totalRow.appendChild(l);
    totalRow.appendChild(v);
    summary.appendChild(totalRow);
    wrap.appendChild(summary);

    const message = document.createElement('div');
    message.className = 'result-message';
    const mTitle = document.createElement('h3');
    mTitle.textContent = msg.title;
    const mText = document.createElement('p');
    mText.textContent = msg.message;
    message.appendChild(mTitle);
    message.appendChild(mText);
    wrap.appendChild(message);

    if (s.activity3Decision) {
      const rec = document.createElement('div');
      rec.className = 'result-recommendation';
      const recTitle = document.createElement('strong');
      recTitle.textContent = 'RECOMENDACIÓN DE LA ACTIVIDAD 3';
      const recText = document.createElement('p');
      recText.textContent = s.activity3Decision === PHASE3.activity3.options[PHASE3.activity3.correctIndex]
        ? 'Acertaste al elegir la copia de seguridad más reciente. ' + PHASE3.activity3.explanation
        : 'Tu decisión fue: "' + s.activity3Decision + '". ' + PHASE3.activity3.explanation;
      rec.appendChild(recTitle);
      rec.appendChild(recText);
      wrap.appendChild(rec);
    }

    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn btn--primary result-restart';
    restartBtn.textContent = 'REINICIAR SIMULACIÓN';
    restartBtn.dataset.action = 'restart';
    restartBtn.addEventListener('click', () => {
      AudioManager.playSFX(AUDIO_SFX.CLICK);
      State.resetGame();
      Router.show(SCREENS.INITIAL_LOADING);
    });
    wrap.appendChild(restartBtn);

    this.rootEl.appendChild(wrap);
  },
};