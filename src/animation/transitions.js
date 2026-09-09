export const transitions = {
  fade: {
    enter(el, duration = 400) {
      el.style.opacity = '0';
      el.style.transition = `opacity ${duration}ms ease`;
      requestAnimationFrame(() => { el.style.opacity = '1'; });
    },
    exit(el, duration = 400) {
      el.style.transition = `opacity ${duration}ms ease`;
      el.style.opacity = '0';
    },
  },

  slideUp: {
    enter(el, duration = 400) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `all ${duration}ms ease`;
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    },
    exit(el, duration = 400) {
      el.style.transition = `all ${duration}ms ease`;
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
    },
  },

  scale: {
    enter(el, duration = 400) {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.9)';
      el.style.transition = `all ${duration}ms ease`;
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      });
    },
    exit(el, duration = 400) {
      el.style.transition = `all ${duration}ms ease`;
      el.style.opacity = '0';
      el.style.transform = 'scale(1.05)';
    },
  },
};
