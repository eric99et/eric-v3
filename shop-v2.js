// LAAS · the cart and the checkout, in the new design (cart-v2.html, checkout-v2.html)
// The data is exactly the old cart's (laas.js): localStorage 'laas.cart.v1.en', an
// array of {name, finish, unit, qty, img}. €129 a lock, €9.99 a Flex Mount, €9 flat
// shipping, free over €250. Old carts are normalised on every read the way laas.js
// does it, so both designs can read and write the same cart.
// The checkout's steps and its demo order are in checkout.js. Nothing is sent anywhere.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- store */
  const KEY = 'laas.cart.v1.en';
  // at most 15 locks in one order (all finishes together), and so at most 15 Flex Mounts.
  // The prices come from i18n.js: euro in English, kroner in Danish. A line is priced by what it is, never by
  // the number stored with it, so the same cart reads right in either language.
  const I = window.LAAS_I18N || { lang: 'en', P: { lock: 129, flex: 9.99, ship: 9, free: 250 }, t: s => s, money: n => '€' + n };
  const { t: tr, money } = I;
  const LOCK = I.P.lock, FLEX = I.P.flex, FLAT_SHIP = I.P.ship, FREE_SHIP = I.P.free, MAX = 15;
  const FIN = { Steel: 'steel', Copper: 'copper', Black: 'black' };
  const unitOf = i => /^Ring-Lock/.test(i.name) ? LOCK : /Flex/.test(i.name) ? FLEX : (i.unit || 0);
  // laas.js migrate(): drop retired models, strip old trial names, reset prices, merge duplicates
  const migrate = items => {
    const out = [];
    (Array.isArray(items) ? items : []).forEach(raw => {
      if (!raw || /without Apple|uden Apple|Special Edition|Forest/i.test(raw.name || '')) return;
      const i = Object.assign({}, raw);
      i.name = String(i.name || '')
        .replace(/ · (57-day trial|57 dages prøve|with your trial|med din prøve)$/, '')
        .replace(/ (trial|prøve)$/, '')
        .replace(/^O-Lock/, 'Ring-Lock');
      delete i.trial; delete i.trialFlex;
      // the stored unit stays in euro (what the shop is priced in); the page prices from unitOf()
      if (/^Ring-Lock/.test(i.name)) { i.unit = 129; i.id = 'ring-lock'; }
      if (/Flex/.test(i.name)) { i.unit = 9.99; i.id = 'flex-mount'; }
      // the finish is Steel (as in the Drive copy); carts from before say Silver
      if (/^(Silver|Sølv|Stål)$/.test(i.finish || '')) i.finish = 'Steel';
      i.qty = Math.min(MAX, Math.max(1, parseInt(i.qty, 10) || 1));
      const same = out.find(o => o.name === i.name && o.finish === i.finish);
      if (same) same.qty = Math.min(MAX, same.qty + i.qty); else out.push(i);
    });
    return out;
  };
  const read = () => { try { return migrate(JSON.parse(localStorage.getItem(KEY))); } catch { return []; } };
  // laas-cart tells the bag in the nav (cart-nav.js) to recount
  const write = items => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode */ } paint(); dispatchEvent(new Event('laas-cart')); };
  const totals = items => {
    const sub = items.reduce((n, i) => n + unitOf(i) * (i.qty || 1), 0);
    const ship = sub > FREE_SHIP || !sub ? 0 : FLAT_SHIP;
    return { sub, ship, total: sub + ship, count: items.reduce((n, i) => n + (i.qty || 1), 0) };
  };
  const isLock = i => /^Ring-Lock/.test(i.name), isFlex = i => /Flex/.test(i.name);
  // the second-lock offer: three finish dots, the picture follows the pick
  let secondFin = null;
  const paintSecond = () => {
    const box = $('#offer-second'); if (!box || !secondFin) return;
    const im = $('img', box), src = 'images/scenes/thumb-' + secondFin + '.webp';
    if (im.getAttribute('src') !== src) im.src = src;
    $$('[data-pick]', box).forEach(b => { const on = b.dataset.pick === secondFin; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    setText('#offer-second-fin', Object.keys(FIN).find(k => FIN[k] === secondFin));
  };
  document.addEventListener('click', e => { const p = e.target.closest('[data-pick]'); if (p) { secondFin = p.dataset.pick; paintSecond(); } });
  document.addEventListener('keydown', e => {
    const p = e.target.closest('[data-pick]'); if (!p) return;
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
    e.preventDefault();
    const all = $$('[data-pick]'), n = all[(all.indexOf(p) + d + all.length) % all.length];
    secondFin = n.dataset.pick; paintSecond(); n.focus();
  });
  const lockCount = items => items.reduce((n, i) => n + (isLock(i) ? i.qty || 1 : 0), 0);
  const full = (i, items) => isLock(i) ? lockCount(items) >= MAX : i.qty >= MAX;
  const thumb = i => isFlex(i) ? 'images/flexmount-thumb.webp'
    : FIN[i.finish] ? 'images/scenes/thumb-' + FIN[i.finish] + '.webp' : (i.img || 'images/scenes/thumb-steel.webp');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------------------------------------------------------- paint */
  const setText = (sel, v) => $$(sel).forEach(el => { el.textContent = v; });
  // a sum that changes gives a small tick, so the eye sees what moved
  const setSum = (sel, v) => $$(sel).forEach(el => {
    const was = el.textContent; el.textContent = v;
    if (was && was !== v && painted && !reduce) el.animate([{ opacity: .2, transform: 'translateY(-5px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
  let painted = false;
  function paint() {
    const items = read(), t = totals(items), empty = !items.length;
    root.classList.toggle('is-empty', empty);

    // the lines (editable on the cart, read-only on the checkout)
    $$('[data-lines]').forEach(list => {
      const edit = list.dataset.lines === 'edit';
      // where each line was, and its number, before the redraw: the lines then glide to their new place (FLIP,
      // transform only), a new line fades in and a changed number gives a small bump
      const before = new Map();
      if (edit && !reduce) $$('li[data-key]', list).forEach(li => before.set(li.dataset.key, { top: li.getBoundingClientRect().top, q: $('.item__qty span', li)?.textContent }));
      const had = before.size > 0;
      const label = i => esc(i.name) + (i.finish ? ', ' + esc(i.finish) : '');
      list.innerHTML = edit ? items.map((i, idx) => `
        <li class="item" data-key="${esc(i.name + '|' + (i.finish || ''))}">
          <span class="item__pic"><img src="${thumb(i)}" alt="" width="96" height="96" decoding="async"></span>
          <div class="item__what">
            <p class="item__name">${esc(i.name)}</p>
            ${i.finish ? `<p class="item__meta">${esc(i.finish)}</p>` : ''}
            <p class="item__meta">${money(unitOf(i) * i.qty)}</p>
            <span class="item__tag">${tr(isLock(i) ? 'Intro price' : 'No drilling')}</span>
          </div>
          <div class="item__qty" role="group" aria-label="${tr('Quantity')}, ${label(i)}">
            <button type="button" data-step="${idx}" data-d="-1" aria-label="${i.qty <= 1 ? tr('Remove') + ' ' + label(i) : tr('One less')}">${i.qty <= 1 ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>' : '−'}</button>
            <span>${i.qty}</span>
            <button type="button" data-step="${idx}" data-d="1" aria-label="${full(i, items) ? MAX + ' ' + tr('is the most in one order') : tr('One more')}"${full(i, items) ? ' disabled' : ''}>+</button>
          </div>
        </li>`).join('') : items.map(i => `
        <li class="line">
          <span class="line__pic"><img src="${thumb(i)}" alt="" width="96" height="96" decoding="async"></span>
          <div class="line__what">
            <p class="line__name">${esc(i.name)}</p>
            <p class="line__meta">${i.finish ? esc(i.finish) + ' · ' : ''}${money(unitOf(i))} × ${i.qty}</p>
          </div>
          <p class="line__sum">${money(unitOf(i) * i.qty)}</p>
        </li>`).join('');
      if (had) $$('li[data-key]', list).forEach(li => {
        const b = before.get(li.dataset.key);
        if (!b) { li.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' }); return; }
        const dy = b.top - li.getBoundingClientRect().top;
        if (Math.abs(dy) > 1) li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2,.7,.2,1)' });
        const q = $('.item__qty span', li);
        if (q && q.textContent !== b.q) q.animate([{ transform: 'scale(1.35)', opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' });
      });
    });

    setSum('[data-subtotal]', money(t.sub));
    setSum('[data-shipping]', !t.sub ? money(0) : t.ship ? money(t.ship) : tr('Free'));
    setSum('[data-total]', money(t.total));
    setText('[data-count]', t.count ? t.count + ' ' + tr(t.count === 1 ? 'item' : 'items') : '');
    $$('[data-empty]').forEach(el => { el.hidden = !empty; });
    $$('[data-full]').forEach(el => { el.hidden = empty; });

    // the free-shipping meter: live math from the real subtotal
    const meter = $('#meter');
    if (meter) {
      const capped = Math.min(t.sub, FREE_SHIP);
      meter.setAttribute('aria-valuenow', String(Math.round(capped)));
      meter.style.setProperty('--fill', (capped / FREE_SHIP * 100).toFixed(1) + '%');
      setText('#meter-label', t.sub > FREE_SHIP ? 'Free shipping on this order' : money(Math.max(0.01, FREE_SHIP - t.sub)) + ' more for free shipping');
    }

    // the two offers: a Flex Mount until one is in the cart; a second lock while it would make shipping free
    const flex = $('#offer-flex'), second = $('#offer-second'), first = items.find(isLock);
    let saidNo = false; try { saidNo = sessionStorage.getItem('laas-flex') === 'no'; } catch {}
    if (flex) flex.hidden = !first || items.some(isFlex) || saidNo;
    if (second) {
      second.hidden = !first || t.sub > FREE_SHIP;
      // the second lock's finish: the first lock's until someone picks another
      if (first && !secondFin) secondFin = FIN[first.finish] || 'steel';
      if (first) paintSecond();
    }

    // the nav pill
    $$('[data-cart-n]').forEach(el => { el.textContent = t.count; });
    $$('.nav__cart').forEach(a => { a.hidden = empty; a.setAttribute('aria-label', 'Cart, ' + t.count + (t.count === 1 ? ' item' : ' items')); });

    // checkout: the pay buttons carry the total
    $$('[data-pay-btn]').forEach(b => { if (b.classList.contains('is-busy')) return; b.disabled = empty; b.textContent = empty ? tr('Your cart is empty') : tr('Pay') + ' ' + money(t.total) + ' ' + tr('and place order'); });
    $$('[data-checkout]').forEach(a => { a.setAttribute('aria-disabled', String(empty)); });
    painted = true;
    // checkout.js follows the totals (the bar at the bottom)
    document.dispatchEvent(new Event('laas-painted'));
  }

  /* ------------------------------------------------------- cart actions */
  const say = text => { const s = $('#status'); if (s) { s.textContent = ''; setTimeout(() => { s.textContent = text; }, 30); } };
  document.addEventListener('click', e => {
    const step = e.target.closest('[data-step]');
    if (step) {
      const items = read(), i = items[+step.dataset.step]; if (!i) return;
      // − at 1 takes the line out
      if (i.qty + +step.dataset.d < 1) {
        const out = () => {
          // the last lock takes the Flex Mount with it (no mount without a lock), as everywhere else
          const rest = read(); const k = rest.findIndex(x => x.name === i.name && x.finish === i.finish);
          if (k > -1) rest.splice(k, 1);
          if (!rest.some(isLock)) { const f = rest.findIndex(isFlex); if (f > -1) rest.splice(f, 1); }
          write(rest); say(i.name + ' ' + tr('removed from your cart.'));
          ($('[data-step]') || $('#cart-h'))?.focus();
        };
        const li = step.closest('li');
        // the line slides out first (a timer, not onfinish: that waits for a frame in a background tab)
        if (li && !reduce) { li.style.pointerEvents = 'none'; li.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-16px)' }], { duration: 220, easing: 'ease-in', fill: 'forwards' }); setTimeout(out, 230); }
        else out();
        return;
      }
      if (+step.dataset.d > 0 && full(i, items)) return;
      i.qty = i.qty + +step.dataset.d;
      write(items); say(i.name + (i.finish ? ', ' + i.finish : '') + ': ' + i.qty);
      // keep the focus on the same button after the list is redrawn (on its neighbour once it is disabled at 1 or 9)
      const same = $(`[data-step="${step.dataset.step}"][data-d="${step.dataset.d}"]`);
      (same && !same.disabled ? same : $(`[data-step="${step.dataset.step}"][data-d="${-step.dataset.d}"]`))?.focus();
      return;
    }
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      const items = read(), [gone] = items.splice(+rm.dataset.rm, 1);
      write(items); if (gone) say(gone.name + ' ' + tr('removed from your cart.'));
      ($('[data-rm]') || $('#cart-h'))?.focus();
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      const items = read();
      if (add.dataset.add === 'flex') {
        // one Flex Mount per lock, as the old question on the way to checkout added
        const locks = items.filter(isLock).reduce((n, i) => n + i.qty, 0);
        const fm = items.find(isFlex);
        if (fm) fm.qty = Math.min(MAX, fm.qty + 1);
        else items.push({ id: 'flex-mount', name: 'Flex Mount', finish: '', unit: 9.99, qty: Math.min(MAX, Math.max(1, locks)), img: 'images/flexmount.jpg' });
        write(items); say(tr('Flex Mount added.'));
      } else {
        const fin = secondFin || 'steel', name = Object.keys(FIN).find(k => FIN[k] === fin);
        if (lockCount(items) < MAX) {
          const same = items.find(i => isLock(i) && i.finish === name);
          if (same) same.qty += 1;
          else items.push({ id: 'ring-lock', name: 'Ring-Lock', finish: name, unit: 129, qty: 1, img: 'images/lock-' + fin + '-render.jpg' });
          write(items); say(tr('A second Ring-Lock added.') + ' ' + name);
        }
      }
      $('#cart-h')?.focus();
      return;
    }
    const co = e.target.closest('[data-checkout][aria-disabled="true"]');
    if (co) e.preventDefault();
  });
  addEventListener('storage', e => { if (e.key === KEY) paint(); });
  addEventListener('pageshow', paint);

  // the checkout's steps, checks and the (demo) order live in checkout.js

  /* ------------------------------------------------------- nav and menu */
  const onScroll = () => root.classList.toggle('nav-float', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $('.nav__links');
  if (links) {
    $$('a', links).forEach(a => a.addEventListener('pointerenter', () => {
      links.style.setProperty('--hx', a.offsetLeft + 'px'); links.style.setProperty('--hw', a.offsetWidth + 'px'); links.style.setProperty('--ho', '1');
    }));
    links.addEventListener('pointerleave', () => links.style.setProperty('--ho', '0'));
  }
  const menu = $('#menu'), menuBtn = $('#menu-open');
  const openMenu = () => {
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = tr('Close');
    requestAnimationFrame(() => menu.classList.add('is-open'));
    $('main').inert = true; $$('.paybar').forEach(p => { p.inert = true; });
    setTimeout(() => menu.querySelector('a')?.focus(), 50);
  };
  const closeMenu = (refocus = true) => {
    if (menu.hidden) return;
    menu.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = tr('Menu');
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 700);
    $('main').inert = false; $$('.paybar').forEach(p => { p.inert = false; });
    if (refocus) menuBtn.focus();
  };
  menuBtn?.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $$('.menu a').forEach(a => a.addEventListener('click', () => closeMenu(false)));

  paint();
})();
