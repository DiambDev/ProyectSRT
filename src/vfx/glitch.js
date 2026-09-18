export const Glitch = {
  run(el, duration = 500) {
    if (!el) return;
    el.classList.add('vfx-glitch');
    setTimeout(() => {
      el.classList.remove('vfx-glitch');
    }, duration);
  },
};