// LAAS · the FAQ: topics on the left (a tab list), their questions on the right (one open at a time), a search
// over every question, popular shortcuts, and a "Did this help?" that answers in place. #fit, #app … open a topic.
(() => {
  document.querySelectorAll('[data-fq]').forEach(fq => {
    const block = fq.closest('[data-lang-block]') || document;
    const tabs = [...fq.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const search = block.querySelector('[data-fq-search]'), none = block.querySelector('[data-fq-none]');
    let current = tabs[0];
    const pick = (tab, focus) => {
      current = tab;
      tabs.forEach((t, i) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[i].hidden = !on; });
      if (focus) tab.focus();
      const panel = panels[tabs.indexOf(tab)];
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { if (search) { search.value = ''; filter(); } pick(t); history.replaceState(null, '', '#' + t.dataset.key); });
      t.addEventListener('keydown', e => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
    // search: every question in every topic; the matches show, the rest step aside
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    function filter() {
      const q = norm(search.value.trim());
      fq.classList.toggle('is-search', !!q);
      if (!q) { panels.forEach(p => p.querySelectorAll('details').forEach(d => (d.hidden = false))); pick(current); none.hidden = true; return; }
      let hits = 0;
      panels.forEach(p => {
        let n = 0;
        p.querySelectorAll('details').forEach(d => { const on = norm(d.textContent).includes(q); d.hidden = !on; if (on) n++; });
        p.hidden = !n; hits += n;
      });
      none.hidden = !!hits;
    }
    search?.addEventListener('input', filter);
    // popular: straight to that question, open
    block.querySelectorAll('[data-fq-go]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const tab = tabs.find(t => t.dataset.key === a.dataset.fqGo);
      if (search) { search.value = ''; filter(); }
      pick(tab);
      const d = panels[tabs.indexOf(tab)].querySelectorAll('details')[+a.dataset.fqQ];
      d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); d.querySelector('summary').focus({ preventScroll: true });
    }));
    // a link to #insurance (or #insurance-da) opens that topic
    const key = decodeURIComponent(location.hash.slice(1)).replace(/-da$/, '');
    const start = tabs.find(t => t.dataset.key === key);
    if (start) pick(start);
    // Did this help? a thank-you, or the way to a person
    fq.addEventListener('click', e => {
      const b = e.target.closest('[data-rate]');
      if (!b) return;
      const a = b.closest('.fq__a');
      a.querySelector('.fq__rate').hidden = true;
      a.querySelector(b.dataset.rate === '1' ? '[data-yes]' : '[data-no]').hidden = false;
    });
  });
})();
