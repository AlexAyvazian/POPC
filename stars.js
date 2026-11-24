(() => {
  const galaxy = document.querySelector('.galaxy');
  if (!galaxy) return;
  const fragment = document.createDocumentFragment();
  const count = Math.min(92, Math.max(48, Math.round(window.innerWidth / 18)));
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    star.className = 'twinkle-star';
    const size = (Math.random() * 2.8 + 1).toFixed(2);
    star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
    star.style.top = `${(Math.random() * 100).toFixed(2)}%`;
    star.style.setProperty('--size', `${size}px`);
    star.style.setProperty('--duration', `${(Math.random() * 3.8 + 2.4).toFixed(2)}s`);
    star.style.setProperty('--delay', `${(-Math.random() * 6).toFixed(2)}s`);
    fragment.appendChild(star);
  }
  galaxy.appendChild(fragment);
})();