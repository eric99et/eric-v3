// LAAS · the cart and the checkout, in the new design (cart-v2.html, checkout-v2.html)
// The data is exactly the old cart's (laas.js): localStorage 'laas.cart.v1.en', an
// array of {name, finish, unit, qty, img}. €129 a lock, €9.99 a Flex Mount, €9 flat
// shipping, free from €250. Old carts are normalised on every read the way laas.js
// does it, so both designs can read and write the same cart.
// The checkout is still a shell, as the old one is: it validates the form and then
// says plainly that payment is not connected. Nothing is sent anywhere.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- store */
  const KEY = 'laas.cart.v1.en';
  const LOCK = 129, FLEX = 9.99, FLAT_SHIP = 9, FREE_SHIP = 250, MAX = 9;
  const FIN = { Silver: 'steel', Copper: 'copper', Black: 'black' };
  const money = n => { const r = Math.round(n * 100) / 100; return '€' + (Number.isInteger(r) ? r : r.toFixed(2)); };
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
      if (/^Ring-Lock/.test(i.name)) i.unit = LOCK;
      if (/Flex/.test(i.name)) i.unit = FLEX;
      if (i.finish === 'Steel' || i.finish === 'Stål') i.finish = 'Silver';
      i.qty = Math.max(1, parseInt(i.qty, 10) || 1);
      const same = out.find(o => o.name === i.name && o.finish === i.finish);
      if (same) same.qty += i.qty; else out.push(i);
    });
    return out;
  };
  const read = () => { try { return migrate(JSON.parse(localStorage.getItem(KEY))); } catch { return []; } };
  const write = items => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode */ } paint(); };
  const totals = items => {
    const sub = items.reduce((n, i) => n + (i.unit || 0) * (i.qty || 1), 0);
    const ship = sub >= FREE_SHIP || !sub ? 0 : FLAT_SHIP;
    return { sub, ship, total: sub + ship, count: items.reduce((n, i) => n + (i.qty || 1), 0) };
  };
  const isLock = i => /^Ring-Lock/.test(i.name), isFlex = i => /Flex/.test(i.name);
  const thumb = i => isFlex(i) ? 'images/flexmount.webp'
    : FIN[i.finish] ? 'images/scenes/finish-' + FIN[i.finish] + '.webp' : (i.img || 'images/scenes/finish-steel.webp');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------------------------------------------------------- paint */
  const setText = (sel, v) => $$(sel).forEach(el => { el.textContent = v; });
  function paint() {
    const items = read(), t = totals(items), empty = !items.length;
    root.classList.toggle('is-empty', empty);

    // the lines (editable on the cart, read-only on the checkout)
    $$('[data-lines]').forEach(list => {
      const edit = list.dataset.lines === 'edit';
      list.innerHTML = items.map((i, idx) => `
        <li class="line">
          <span class="line__pic"><img src="${thumb(i)}" alt="" width="96" height="96" loading="lazy" decoding="async"></span>
          <div class="line__what">
            <p class="line__name">${esc(i.name)}</p>
            <p class="line__meta">${i.finish ? esc(i.finish) + ' · ' : ''}${money(i.unit)}${edit ? '' : ' × ' + i.qty}</p>
            ${edit ? `<button type="button" class="line__rm" data-rm="${idx}" aria-label="Remove ${esc(i.name)}${i.finish ? ', ' + esc(i.finish) : ''}">Remove</button>` : ''}
          </div>
          ${edit ? `<div class="qty line__qty" role="group" aria-label="Quantity, ${esc(i.name)}${i.finish ? ' ' + esc(i.finish) : ''}">
            <button type="button" data-step="${idx}" data-d="-1" aria-label="One less"${i.qty <= 1 ? ' disabled' : ''}>−</button>
            <span>${i.qty}</span>
            <button type="button" data-step="${idx}" data-d="1" aria-label="One more"${i.qty >= MAX ? ' disabled' : ''}>+</button>
          </div>` : ''}
          <p class="line__sum">${money(i.unit * i.qty)}</p>
        </li>`).join('');
    });

    setText('[data-subtotal]', money(t.sub));
    setText('[data-shipping]', !t.sub ? '€0' : t.ship ? money(t.ship) : 'Free');
    setText('[data-total]', money(t.total));
    setText('[data-count]', t.count + (t.count === 1 ? ' item' : ' items'));
    $$('[data-empty]').forEach(el => { el.hidden = !empty; });
    $$('[data-full]').forEach(el => { el.hidden = empty; });

    // the free-shipping meter: live math from the real subtotal
    const meter = $('#meter');
    if (meter) {
      const capped = Math.min(t.sub, FREE_SHIP);
      meter.setAttribute('aria-valuenow', String(Math.round(capped)));
      meter.style.setProperty('--fill', (capped / FREE_SHIP * 100).toFixed(1) + '%');
      setText('#meter-label', t.sub >= FREE_SHIP ? 'Free shipping on this order' : money(FREE_SHIP - t.sub) + ' more for free shipping');
    }

    // the two offers: a Flex Mount until one is in the cart; a second lock while it would make shipping free
    const flex = $('#offer-flex'), second = $('#offer-second'), first = items.find(isLock);
    if (flex) flex.hidden = !first || items.some(isFlex);
    if (second) {
      second.hidden = !first || t.sub >= FREE_SHIP;
      if (first) { const im = $('img', second), src = thumb(first); if (im.getAttribute('src') !== src) im.src = src; setText('#offer-second-fin', first.finish ? ' in ' + first.finish : ''); }
    }

    // the nav pill
    $$('[data-cart-n]').forEach(el => { el.textContent = t.count; });
    $$('.nav__cart').forEach(a => { a.hidden = empty; a.setAttribute('aria-label', 'Cart, ' + t.count + (t.count === 1 ? ' item' : ' items')); });

    // checkout: the pay buttons carry the total
    $$('[data-pay-btn]').forEach(b => { b.disabled = empty; b.textContent = empty ? 'Your cart is empty' : 'Pay ' + money(t.total); });
    $$('[data-checkout]').forEach(a => { a.setAttribute('aria-disabled', String(empty)); });
  }

  /* ------------------------------------------------------- cart actions */
  const say = text => { const s = $('#status'); if (s) { s.textContent = ''; setTimeout(() => { s.textContent = text; }, 30); } };
  document.addEventListener('click', e => {
    const step = e.target.closest('[data-step]');
    if (step) {
      const items = read(), i = items[+step.dataset.step]; if (!i) return;
      i.qty = Math.min(MAX, Math.max(1, i.qty + +step.dataset.d));
      write(items); say(i.name + (i.finish ? ', ' + i.finish : '') + ': ' + i.qty);
      // keep the focus on the same button after the list is redrawn
      $(`[data-step="${step.dataset.step}"][data-d="${step.dataset.d}"]`)?.focus();
      return;
    }
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      const items = read(), [gone] = items.splice(+rm.dataset.rm, 1);
      write(items); if (gone) say(gone.name + ' removed from your cart.');
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
        else items.push({ name: 'Flex Mount', finish: '', unit: FLEX, qty: Math.min(MAX, Math.max(1, locks)), img: 'images/flexmount.jpg' });
        write(items); say('Flex Mount added.');
      } else {
        const lock = items.find(isLock);
        if (lock) { lock.qty = Math.min(MAX, lock.qty + 1); write(items); say('A second Ring-Lock added.'); }
      }
      $('#cart-h')?.focus();
      return;
    }
    const co = e.target.closest('[data-checkout][aria-disabled="true"]');
    if (co) e.preventDefault();
  });
  addEventListener('storage', e => { if (e.key === KEY) paint(); });
  addEventListener('pageshow', paint);

  /* ------------------------------------------------------------ checkout */
  const form = $('#checkout-form');
  if (form) {
    const msg = $('#co-msg');
    const notConnected = () => {
      msg.hidden = false;
      msg.textContent = 'Payment is not connected yet. Nothing has been charged, and nothing you typed has been sent.';
      msg.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      form.classList.add('was-checked');
      if (!form.checkValidity()) {
        const bad = form.querySelector(':invalid');
        msg.hidden = false; msg.textContent = 'Check the highlighted fields.';
        bad?.focus(); return;
      }
      notConnected();
    });
    $$('[data-express]').forEach(b => b.addEventListener('click', notConnected));
    const notes = {
      card: 'You enter your card on the secure payment page after you press Pay. Nothing is stored here.',
      mobilepay: 'You approve the amount in the MobilePay app after you press Pay.',
      klarna: 'Klarna opens after you press Pay, then brings you straight back here.',
      googlepay: 'Google Pay opens after you press Pay. No card number to type.',
    };
    $$('input[name="method"]').forEach(r => r.addEventListener('change', () => { $('#method-note').textContent = notes[r.value]; }));
    $('[data-promo]')?.addEventListener('click', () => {
      const m = $('#promo-msg'); m.hidden = false; m.textContent = 'Codes are checked on the payment page, after you press Pay.';
    });
    // the order summary: open on a desktop, folded on a phone
    const sum = $('#co-summary');
    const fold = () => { if (sum) sum.open = innerWidth > 760 || sum.dataset.user === 'open'; };
    sum?.querySelector('summary').addEventListener('click', e => {
      if (innerWidth > 760) { e.preventDefault(); return; }   // always open beside the form
      sum.dataset.user = sum.open ? 'closed' : 'open';
    });
    addEventListener('resize', fold); fold();
  }

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
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = 'Close';
    requestAnimationFrame(() => menu.classList.add('is-open'));
    $('main').inert = true; $$('.paybar').forEach(p => { p.inert = true; });
    setTimeout(() => menu.querySelector('a')?.focus(), 50);
  };
  const closeMenu = (refocus = true) => {
    if (menu.hidden) return;
    menu.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu';
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 700);
    $('main').inert = false; $$('.paybar').forEach(p => { p.inert = false; });
    if (refocus) menuBtn.focus();
  };
  menuBtn?.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $$('.menu a').forEach(a => a.addEventListener('click', () => closeMenu(false)));

  paint();
})();
