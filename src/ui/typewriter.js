export function typewriter(el, text, options = {}) {
  const {
    speed = 14,
    sound = null,
    audio = null,
    alive = null,
    soundEvery = 6,
  } = options;

  return new Promise((resolve) => {
    if (!el) {
      resolve();
      return;
    }
    el.textContent = '';
    el.classList.add('typewriter');
    let i = 0;
    const step = () => {
      if (alive && !alive()) {
        resolve();
        return;
      }
      if (i < text.length) {
        i++;
        el.textContent = text.slice(0, i);
        el.classList.add('typing');
        if (sound && audio && i % soundEvery === 0) audio.playSFX(sound);
        setTimeout(step, speed);
      } else {
        el.classList.remove('typing');
        resolve();
      }
    };
    step();
  });
}