const overlayEl = () => document.getElementById('vfx-overlay');

export const ScreenEffects = {
  redFlash(duration = 300) {
    const overlay = overlayEl();
    if (!overlay) return;
    overlay.classList.add('vfx-red-flash');
    overlay.style.background = 'rgba(255, 32, 32, 0.15)';
    setTimeout(() => {
      overlay.style.background = '';
      overlay.classList.remove('vfx-red-flash');
    }, duration);
  },

  scanlines() {
    const overlay = overlayEl();
    if (!overlay) return;
    overlay.classList.add('vfx-scanlines');
  },

  clear() {
    const overlay = overlayEl();
    if (!overlay) return;
    overlay.className = '';
    overlay.style.background = '';
  },

  errorShake(el, duration = 400) {
    if (!el) return;
    el.classList.add('vfx-error-shake');
    setTimeout(() => {
      el.classList.remove('vfx-error-shake');
    }, duration);
  },

  pixelCorruption(target, options = {}) {
    return new Promise((resolve) => {
      if (!target || typeof target.getContext !== 'function') {
        resolve();
        return;
      }
      const ctx = target.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor((target.clientWidth || 800) * dpr);
      const h = Math.floor((target.clientHeight || 600) * dpr);
      target.width = w;
      target.height = h;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      const cell = options.cell || 10;
      const cols = Math.max(1, Math.ceil(w / cell));
      const rows = Math.max(1, Math.ceil(h / cell));
      const total = cols * rows;
      const filled = new Set();
      const t0 = performance.now();
      const dur = options.duration || 2000;
      const margin = Math.max(2, Math.min(cols, rows) * 0.08);
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      const loop = () => {
        const t = Math.min(1, (performance.now() - t0) / dur);
        const edgePhase = Math.max(0, 1 - t * 2.5);
        const count = Math.floor(total * (0.015 + t * t * 0.9));
        let n = 0;
        let guard = 0;
        while (n < count && filled.size < total && guard < 10000) {
          guard++;
          let c = Math.floor(Math.random() * cols);
          let r = Math.floor(Math.random() * rows);
          if (edgePhase > 0 && Math.random() < edgePhase) {
            if (Math.random() < 0.5) {
              c = Math.random() < 0.5 ? 0 : cols - 1;
              r = clamp(r + Math.floor((Math.random() - 0.5) * margin), 0, rows - 1);
            } else {
              r = Math.random() < 0.5 ? 0 : rows - 1;
              c = clamp(c + Math.floor((Math.random() - 0.5) * margin), 0, cols - 1);
            }
          }
          const key = c + r * cols;
          if (filled.has(key)) continue;
          filled.add(key);
          ctx.fillStyle = `rgba(255,32,32,${0.55 + Math.random() * 0.45})`;
          ctx.fillRect(c * cell, r * cell, cell, cell);
          n++;
        }
        if (t >= 1 || filled.size >= total) {
          if (filled.size < total) {
            ctx.fillStyle = 'rgba(255,32,32,0.85)';
            ctx.fillRect(0, 0, w, h);
          }
          resolve();
          return;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
  },
};