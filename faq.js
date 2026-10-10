// LAAS · the FAQ: topics on the left (a tab list), their questions on the right (one open at a time).
// The title follows the topic; #fit, #app … open a topic straight away; Helpful / Not helpful answers in place.
(() => {
  document.querySelectorAll('[data-fq]').forEach(fq => {
    const block = fq.closest('[data-lang-block]') || document;
    const title = block.querySelector('[data-fq-title]');
    const tabs = [...fq.querySelectorAll('[role="tab"]')];
    const pick = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (title) title.textContent = tab.querySelector('span').textContent;
      if (focus) tab.focus();
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (!panel.querySelector('details[open]')) panel.querySelector('details')?.setAttribute('open', '');
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { pick(t); history.replaceState(null, '', '#' + t.dataset.key); });
      t.addEventListener('keydown', e => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
    // a link to #insurance (or #insurance-da) opens that topic
    const key = decodeURIComponent(location.hash.slice(1)).replace(/-da$/, '');
    const start = tabs.find(t => t.dataset.key === key);
    if (start) pick(start);
    // Helpful / Not helpful: a thank-you, or the way to a person
    fq.addEventListener('click', e => {
      const b = e.target.closest('[data-rate]');
      if (!b) return;
      const a = b.closest('.fq__a');
      a.querySelector('.fq__rate').hidden = true;
      a.querySelector(b.dataset.rate === '1' ? '[data-yes]' : '[data-no]').hidden = false;
    });
  });
})();
