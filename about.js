// About LAAS: the mission reads itself in, word by word, as it scrolls up the screen (after Eric's references, 31 Oct).
// Without this script, or with reduced motion, the words simply stand in full Ink.
(() => {
  const blocks = [...document.querySelectorAll('.abx__read')];
  if (!blocks.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // each word in its own span; the paragraphs hold plain text only
  const words = blocks.map(p => {
    const parts = p.textContent.trim().split(/(\s+)/);
    p.textContent = '';
    return parts.map(part => {
      if (/^\s+$/.test(part)) { p.append(part); return null; }
      const w = document.createElement('span');
      w.className = 'w'; w.textContent = part; p.append(w);
      return w;
    }).filter(Boolean);
  });

  let queued = false;
  const paint = () => {
    queued = false;
    const vh = innerHeight;
    blocks.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      // lit from when the paragraph's top passes 88 % of the screen until its bottom reaches 60 %
      const t = Math.min(1, Math.max(0, (vh * .88 - r.top) / (r.height + vh * .28)));
      const lit = Math.round(t * words[i].length);
      words[i].forEach((w, k) => w.classList.toggle('on', k < lit));
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  paint();
})();
