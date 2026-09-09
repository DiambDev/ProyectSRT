export const AnimationManager = {
  init() {},

  fadeIn(el, duration = 400) {
    el.style.opacity = '0';
    el.style.transition = `opacity ${duration}ms ease`;
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        setTimeout(resolve, duration);
      });
    });
  },

  fadeOut(el, duration = 400) {
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = '0';
    return new Promise((resolve) => setTimeout(resolve, duration));
  },

  slideUp(el, duration = 400) {
    el.style.transform = 'translateY(20px)';
    el.style.opacity = '0';
    el.style.transition = `all ${duration}ms ease`;
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
        setTimeout(resolve, duration);
      });
    });
  },

  slideDown(el, duration = 400) {
    el.style.transform = 'translateY(-20px)';
    el.style.opacity = '0';
    el.style.transition = `all ${duration}ms ease`;
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
        setTimeout(resolve, duration);
      });
    });
  },

  scaleIn(el, duration = 400) {
    el.style.transform = 'scale(0.9)';
    el.style.opacity = '0';
    el.style.transition = `all ${duration}ms ease`;
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        el.style.transform = 'scale(1)';
        el.style.opacity = '1';
        setTimeout(resolve, duration);
      });
    });
  },

  async staggerElements(els, fn, delay = 100) {
    for (const el of els) {
      await fn(el);
      await new Promise((r) => setTimeout(r, delay));
    }
  },

  resetStyles(el) {
    el.style.transition = '';
    el.style.opacity = '';
    el.style.transform = '';
  },
};
