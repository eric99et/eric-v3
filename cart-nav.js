// LAAS · the bag in the nav: one icon with the number of things in the cart, on every page.
// The landing page shows it once something is in the cart; the shop pages show it always (they have no Buy pill).
// It also owns "add to cart": LAAS_CART.add(finish, qty) puts the locks in the cart where you are (no new page),
// counts the bag up and shows a small card with Check out and View cart. At most 15 locks in one order, all
// finishes together: add() puts in what still fits and returns how many (0 when the cart is full, false when
// the browser blocks storage).
(() => {
  const KEY = 'laas.cart.v1.en';
  const PRICE = 129, MAX_LOCKS = 15;
  const NAME = { steel: 'Steel', copper: 'Copper', black: 'Black' };
  // the language and the prices (i18n.js); the plain English fallback when it is missing
  const L = () => window.LAAS_I18N || { lang: 'en', P: { lock: PRICE }, money: n => '€' + n, t: s => s };
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; } };
  const count = () => read().reduce((n, i) => n + ((i && +i.qty) || 1), 0);

  const end = document.querySelector('.nav__end');
  const always = document.body.hasAttribute('data-shop');
  let a = null;
  if (end) {
    a = document.createElement('a');
    a.className = 'nav__bag'; a.href = 'cart-v2.html';
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg><b></b>';
    end.insertBefore(a, end.querySelector('.nav__menu'));
  }
  const paint = () => {
    if (!a) return;
    const n = count();
    a.hidden = !always && n === 0;
    a.querySelector('b').textContent = n;
    a.querySelector('b').hidden = n === 0;
    const tr = L().t; a.setAttribute('aria-label', n ? `${tr('Cart')}, ${n} ${tr(n === 1 ? 'item' : 'items')}` : tr('Cart, empty'));
  };
  paint();
  addEventListener('storage', e => { if (e.key === KEY) paint(); });
  addEventListener('laas-cart', paint);
  addEventListener('pageshow', paint);

  /* ---------------------------------------------------------- add to cart */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the card speaks the page's language (read when it is shown: the landing page turns Danish after this runs)
  const TT = da => da ? { added: 'Lagt i kurven', full: 'Din kurv er fuld', go: 'Gå til kassen', cart: 'Se kurven', close: 'Luk',
    most: ' låse er det højeste antal i én ordre.', have: n => 'Der er ' + n + ' låse i kurven, det højeste antal i én ordre.' }
    : { added: 'Added to your cart', full: 'Your cart is full', go: 'Check out', cart: 'View cart', close: 'Close',
    most: ' locks is the most in one order.', have: n => 'You have ' + n + ' locks in it, the most in one order.' };
  const T = new Proxy({}, { get: (_, k) => TT(L().lang === 'da')[k] });
  let card = null, timer = 0;
  const show = (finish, qty, note) => {
    // the cart preview is open: it already shows what was added, so no second card on top of it
    if (document.querySelector('.minicart.is-on')) return;
    if (!card) {
      card = document.createElement('div');
      card.className = 'added'; card.setAttribute('role', 'status'); card.setAttribute('aria-live', 'polite');
      card.innerHTML = `<img class="added__pic" alt="" width="64" height="64">
        <div class="added__what"><p class="added__h"></p><p class="added__p"></p></div>
        <button class="added__x" type="button" aria-label="${T.close}"></button>
        <div class="added__btns"><a class="buy-btn added__go" href="checkout-v2.html">${T.go}</a><a class="added__cart" href="cart-v2.html">${T.cart}</a></div>`;
      document.body.append(card);
      card.querySelector('.added__x').addEventListener('click', hide);
      card.addEventListener('pointerenter', () => clearTimeout(timer));
      card.addEventListener('pointerleave', () => { if (!card.contains(document.activeElement)) timer = setTimeout(hide, 4000); });
      // while the keyboard is in the card it stays; leaving it, the card goes a little later
      card.addEventListener('focusin', () => clearTimeout(timer));
      card.addEventListener('focusout', e => { if (!card.contains(e.relatedTarget)) timer = setTimeout(hide, 4000); });
      addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    }
    const flex = finish === 'flex';
    card.querySelector('.added__pic').src = flex ? 'images/flexmount-thumb.webp' : 'images/scenes/thumb-' + finish + '.webp';
    card.querySelector('.added__h').textContent = qty ? T.added : T.full;
    card.querySelector('.added__p').textContent = flex ? `Flex-Mount${qty > 1 ? ' × ' + qty : ''} · ${L().money((L().P.flex || 9.99) * qty)}`
      : (qty ? `Ring-Lock, ${NAME[finish]}${qty > 1 ? ' × ' + qty : ''} · ${L().money(L().lockSum ? L().lockSum(qty) : L().P.lock * qty)}` : '') + (note ? (qty ? '. ' : '') + note : '');
    card.hidden = false;
    requestAnimationFrame(() => card.classList.add('is-on'));
    clearTimeout(timer); timer = setTimeout(hide, 7000);
    // the bag answers with a small bump
    if (a && !reduce) { a.classList.remove('is-bump'); void a.offsetWidth; a.classList.add('is-bump'); }
  };
  function hide() {
    if (!card) return;
    clearTimeout(timer);
    card.classList.remove('is-on');
    setTimeout(() => { if (!card.classList.contains('is-on')) card.hidden = true; }, reduce ? 0 : 400);
  }

  // the same line items the cart reads: {id, name, finish, unit, qty, img}. The stored unit is the euro list price for
// reference only: every page prices a line from its kind and LAAS_I18N.P, so a cart filled in English reads in
// kroner on the Danish pages and the other way round, merged by name + finish, at most 15 locks
  const add = (finish, qty) => {
    if (!NAME[finish]) finish = 'steel';
    const items = read(), name = 'Ring-Lock', fin = NAME[finish];
    const want = Math.max(1, qty | 0 || 1);
    const locks = items.reduce((n, i) => n + (i && /^Ring-Lock/.test(i.name) ? (+i.qty || 1) : 0), 0);
    qty = Math.max(0, Math.min(want, MAX_LOCKS - locks));
    const note = qty < want ? MAX_LOCKS + T.most : '';
    if (!qty) { show(finish, 0, T.have(MAX_LOCKS)); return 0; }
    const same = items.find(i => i && i.name === name && (i.finish === fin || (fin === 'Steel' && i.finish === 'Silver')));
    if (same) { same.finish = fin; same.qty = (+same.qty || 1) + qty; }
    else items.push({ id: 'ring-lock', name, finish: fin, unit: PRICE, qty, img: 'images/lock-' + finish + '-render.jpg' });
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { return false; }
    dispatchEvent(new Event('laas-cart'));
    show(finish, qty, note);
    return qty;
  };
  // what is in the cart for one finish, and setting it straight from the buy page's stepper (0 takes it out)
  const lineOf = (items, finish) => items.find(i => i && i.name === 'Ring-Lock' && (i.finish === NAME[finish] || (finish === 'steel' && i.finish === 'Silver')));
  const qtyOf = finish => { const l = lineOf(read(), finish); return l ? (+l.qty || 1) : 0; };
  const setQty = (finish, n) => {
    const items = read(), line = lineOf(items, finish);
    if (!line) return false;
    const others = items.reduce((m, i) => m + (i && i !== line && /^Ring-Lock/.test(i.name) ? (+i.qty || 1) : 0), 0);
    n = Math.max(0, Math.min(n | 0, MAX_LOCKS - others));
    if (n) line.qty = n; else items.splice(items.indexOf(line), 1);
    // the Flex-Mount is its own line: it stays when the last lock goes (owner, 10 Oct)
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { return false; }
    dispatchEvent(new Event('laas-cart'));
    return n;
  };
  const hasFlex = () => read().some(i => i && /Flex/.test(i.name));
  const addFlex = n => {
    const items = read(), f = items.find(i => i && /Flex/.test(i.name));
    if (f) f.qty = Math.max(+f.qty || 1, n); else items.push({ id: 'flex-mount', name: 'Flex-Mount', finish: '', unit: 9.99, qty: Math.max(1, n | 0), img: 'images/flexmount.jpg' });
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { return false; }
    dispatchEvent(new Event('laas-cart'));
    return true;
  };
  // before locks go in the cart: one question, so nobody gets a lock they cannot mount. done(true) adds the Flex
  // Mount too, done(false) not. The mounting choice is required (Marcus, 16 Oct): closing it (X, Esc, backdrop) adds nothing.
  // Not asked when a Flex-Mount is in the cart already, or once the visitor has said the frame has holes.
  let dlg = null, onPick = null;
  const remember = v => { try { sessionStorage.setItem('laas-flex', v); } catch { /* private mode */ } };
  const saidHoles = () => { try { return sessionStorage.getItem('laas-flex') === 'no'; } catch { return false; } };
  const ask = done => {
    if (hasFlex() || saidHoles() || !window.HTMLDialogElement) { done(false); return; }
    const da = L().lang === 'da', flex = L().money(L().P.flex || 9.99);
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'flex-ask'; dlg.setAttribute('aria-labelledby', 'flex-ask-h');
      document.body.append(dlg);
      // the answer is taken from the click itself (the close event can lag); a tap on the backdrop closes it
      // closed without an answer (X, Esc, backdrop): nothing goes in the cart
      const finish = v => {
        const cb = onPick; onPick = null;
        if (dlg.open) dlg.close();
        if (v === 'no') remember('no');
        if (cb && v !== 'cancel') cb(v === 'flex');
      };
      dlg.addEventListener('click', e => {
        const b = e.target.closest('button[value]');
        if (!b) { if (e.target === dlg) finish('cancel'); return; }
        e.preventDefault(); finish(b.value);
      });
      dlg.addEventListener('cancel', e => { e.preventDefault(); finish('cancel'); });
      dlg.addEventListener('close', () => finish('cancel'));
    }
    // two photos answer the question before any words do: the frame-lock hole (ringed), and the Flex-Mount on a frame without
    dlg.innerHTML = `<form method="dialog"><div class="flex-ask__pics">
      <figure><img src="images/ask-holes.webp" alt="" width="480" height="480"><svg class="flex-ask__ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" pathLength="1"/></svg><figcaption>${da ? 'Huller' : 'Holes'}</figcaption></figure>
      <figure><img src="images/ask-flex.webp" alt="" width="480" height="480"><figcaption>${da ? 'Ingen huller: Flex-Mount' : 'No holes: Flex-Mount'}</figcaption></figure></div>
      <button class="flex-ask__x" value="cancel" aria-label="${da ? 'Luk' : 'Close'}"></button>
      <div class="flex-ask__body"><p class="flex-ask__kicker label">${da ? 'Før den kommer i kurven' : 'Before it goes in the cart'}</p>
      <h2 id="flex-ask-h">${da ? 'Har dit stel monteringshuller?' : 'Does your frame have mounting holes?'}</h2>
      <p class="flex-ask__hint">${da ? 'Kig ved baghjulet.' : 'Look near the rear wheel.'}</p>
      <button class="flex-ask__no" value="no">${da ? 'Ja, der er monteringshuller.' : 'Yes, it has mounting holes.'}</button>
      <button class="flex-ask__no" value="flex">${da ? 'Nej, tilføj Flex-Mount.' : 'No, add Flex-Mount.'} · ${flex}</button></div></form>`;
    onPick = done; dlg.returnValue = ''; dlg.showModal();
  };
  // the whole Buy: ask, then put the locks (and the Flex-Mount) in the cart; then(n) after
  const buy = (finish, qty, then) => ask(flex => { const n = add(finish, qty); if (flex && n) addFlex(n === true ? qty : n); then && then(n); });
  // the Flex-Mount on its own (the accessory on the buy page): n more, at most 15, no question first; the card says so
  const addFlexOnly = n => {
    const items = read(), f = items.find(i => i && /Flex/.test(i.name)), have = f ? (+f.qty || 1) : 0;
    const q = Math.max(0, Math.min(Math.max(1, n | 0), MAX_LOCKS - have));
    if (!q) return 0;
    if (f) f.qty = have + q; else items.push({ id: 'flex-mount', name: 'Flex-Mount', finish: '', unit: 9.99, qty: q, img: 'images/flexmount.jpg' });
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { return false; }
    dispatchEvent(new Event('laas-cart'));
    show('flex', q);
    return q;
  };
  window.LAAS_CART = { add, qtyOf, setQty, hasFlex, addFlex, addFlexOnly, ask, buy };
})();

// the footer's entrance (after 21st.dev "Footer section 1"): once, when it comes into view
(() => {
  const f = document.querySelector('.foot2');
  if (!f || !('IntersectionObserver' in window)) return;
  f.classList.add('is-ready');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { f.classList.add('is-in'); io.disconnect(); } }, { rootMargin: '0px 0px -60px 0px' });
  io.observe(f);
})();

// the menu on its own: on the terms and privacy pages, and on the landing page when darkroom.js never ran (the
// three.js CDN failed), the Menu button still opens it
(() => {
  const btn = document.getElementById('menu-open'), menu = document.getElementById('menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    // buy, cart and checkout open it from their own scripts; the landing page from darkroom.js when it ran
    if (window.LAAS_UI || document.querySelector('script[src="buy.js"], script[src="shop-v2.js"]')) return;
    const open = menu.hidden;
    menu.hidden = !open; menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open)); btn.textContent = (window.LAAS_I18N ? window.LAAS_I18N.t : x => x)(open ? 'Close' : 'Menu');
  });
})();

// the nav capsule floats (with its glass) once the page scrolls, on pages that have no script of their own for it
(() => {
  if (document.getElementById('stage') || document.querySelector('script[src="buy.js"], script[src="shop-v2.js"]')) return;
  const root = document.documentElement, on = () => root.classList.toggle('nav-float', scrollY > 8);
  addEventListener('scroll', on, { passive: true }); on();
})();

// bilingual pages: a link to #trial lands on #trial-da when the Danish text is the one shown
(() => {
  const h = decodeURIComponent(location.hash.slice(1)), el = h && document.getElementById(h);
  if (el && el.closest('[hidden]')) { const da = document.getElementById(h + '-da'); if (da) da.scrollIntoView(); }
})();

// [data-reveal]: things that rise into place as they come into view (once); nothing moves with reduced motion
(() => {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
  root.classList.add('reveal-on');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
})();

// hovering the bag (or focusing it) shows a small preview of the cart: the lines, the subtotal, how far it is to free
// shipping, Check out and View cart. Only where there is a mouse; on a phone the bag simply opens the cart.
(() => {
  const bag = document.querySelector('.nav__bag');
  // not on the cart or the checkout themselves: the whole cart is already on the page
  if (!bag || /(cart|checkout)-v2\.html$/.test(location.pathname) || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const KEY = 'laas.cart.v1.en';
  const I = () => window.LAAS_I18N || { lang: 'en', P: { lock: 129, flex: 9.99, ship: 9, free: 250 }, money: n => '€' + n };
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v.filter(Boolean) : []; } catch { return []; } };
  const W = da => da ? { cart: 'Din kurv', empty: 'Din kurv er tom.', shop: 'Se Ring-Lock', sub: 'Subtotal', left: () => 'Tilføj en Ring-Lock mere, og få gratis fragt', free: 'Gratis fragt', go: 'Gå til kassen', view: 'Se kurven', items: n => n === 1 ? '1 vare' : n + ' varer', rm: 'Fjern', less: 'Færre', more: 'Flere' }
    : { cart: 'Your cart', empty: 'Your cart is empty.', shop: 'See the Ring-Lock', sub: 'Subtotal', left: () => 'Add a second Ring-Lock and get free shipping', free: 'Free shipping', go: 'Check out', view: 'View cart', items: n => n === 1 ? '1 item' : n + ' items', rm: 'Remove', less: 'Fewer', more: 'More' };
  const pop = document.createElement('div');
  pop.className = 'minicart'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Cart');
  document.body.append(pop);
  const render = () => {
    const { lang, P, money } = I(), w = W(lang === 'da'), items = read();
    const isFlex = i => /Flex/.test(i.name);
    const unit = i => isFlex(i) ? (P.flex ?? 9.99) : P.lock;
    const n = items.reduce((s, i) => s + (+i.qty || 1), 0);
    // every second lock at the second-lock price, and two locks ship free (as the cart counts it)
    const locks = items.reduce((s, i) => s + (isFlex(i) ? 0 : (+i.qty || 1)), 0);
    const sub = items.reduce((s, i) => s + unit(i) * (+i.qty || 1), 0) - (window.LAAS_I18N && window.LAAS_I18N.lockSum ? locks * P.lock - window.LAAS_I18N.lockSum(locks) : 0);
    if (!items.length) { pop.innerHTML = `<p class="minicart__h">${w.cart}</p><p class="minicart__empty">${w.empty}</p><a class="buy-btn minicart__go" href="buy.html">${w.shop}</a>`; return; }
    const pct = Math.min(1, locks / 2);
    pop.innerHTML = `<p class="minicart__h">${w.cart} <span>${w.items(n)}</span></p><ul class="minicart__lines">` + items.map((i, k) => {
      const fin = (i.finish || '').toLowerCase().replace('silver', 'steel');
      const img = isFlex(i) ? 'images/flexmount-thumb.webp' : `images/scenes/thumb-${fin || 'steel'}.webp`;
      const q = +i.qty || 1, name = isFlex(i) ? 'Flex-Mount' : 'Ring-Lock';
      return `<li data-line="${k}"><img src="${img}" alt="" width="48" height="48"><span><b>${name}</b>${isFlex(i) ? '' : `<small>${i.finish}</small>`}<em>${money(Math.round(unit(i) * q * 100) / 100)}</em></span>`
        + `<span class="minicart__qty"><button type="button" data-d="-1" class="${q === 1 ? 'is-bin' : ''}" aria-label="${q === 1 ? w.rm : w.less} ${name}">${q === 1 ? '' : '−'}</button><b aria-live="polite">${q}</b><button type="button" data-d="1" aria-label="${w.more} ${name}">+</button></span></li>`;
    }).join('') + `</ul><p class="minicart__sub"><span>${w.sub}</span><b>${money(sub)}</b></p>`
      + `<p class="minicart__ship"><span>${pct >= 1 ? w.free : w.left()}</span><i style="--p:${pct}"></i></p>`
      + `<div class="minicart__btns"><a class="buy-btn minicart__go" href="checkout-v2.html">${w.go}</a><a class="minicart__view" href="cart-v2.html">${w.view}</a></div>`;
  };
  let t = 0;
  const place = () => { const r = bag.getBoundingClientRect(); pop.style.top = (r.bottom + 10) + 'px'; pop.style.right = Math.max(12, innerWidth - r.right - 8) + 'px'; };
  const open = () => { clearTimeout(t); if (!pop.hidden) { pop.classList.add('is-on'); return; }
    // one card at a time: the 'Added to your cart' card steps aside for the preview
    const added = document.querySelector('.added.is-on'); if (added) { added.classList.remove('is-on'); setTimeout(() => { if (!added.classList.contains('is-on')) added.hidden = true; }, 300); }
    render(); place(); pop.hidden = false; requestAnimationFrame(() => pop.classList.add('is-on')); };
  const close = () => { clearTimeout(t); t = setTimeout(() => { if (pop.matches(':hover') || bag.matches(':hover')) return; pop.classList.remove('is-on'); setTimeout(() => { if (!pop.classList.contains('is-on')) pop.hidden = true; }, 250); }, 300); };
  bag.addEventListener('pointerenter', open); bag.addEventListener('pointerleave', close);
  pop.addEventListener('pointerenter', () => clearTimeout(t)); pop.addEventListener('pointerleave', close);
  bag.addEventListener('focus', open); bag.addEventListener('blur', e => { if (!pop.contains(e.relatedTarget)) close(); });
  // a click on − or + redraws the line and drops focus for a moment: that is not leaving, so it stays open
  pop.addEventListener('focusout', e => { if (!e.relatedTarget || pop.contains(e.relatedTarget) || e.relatedTarget === bag || pop.matches(':hover')) return; close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { pop.classList.remove('is-on'); pop.hidden = true; } });
  addEventListener('laas-cart', () => { if (!pop.hidden) render(); });
  // − and + on each line change the cart right here; − at 1 (a bin) takes the line out (the Flex-Mount is its own line)
  pop.addEventListener('click', e => {
    const b = e.target.closest('[data-d]');
    if (!b) return;
    const items = read(), k = +b.closest('[data-line]').dataset.line, it = items[k];
    if (!it) return;
    const isLock = i => /^Ring-Lock/.test(i.name);
    const locks = items.reduce((n, i) => n + (isLock(i) ? (+i.qty || 1) : 0), 0);
    const q = (+it.qty || 1) + +b.dataset.d;
    if (+b.dataset.d > 0 && isLock(it) && locks >= 15) return;
    if (q < 1) items.splice(k, 1); else it.qty = Math.min(15, q);
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { return; }
    render();
    const again = pop.querySelector(`[data-line="${k}"] [data-d="${b.dataset.d}"]`); if (again) again.focus();
    dispatchEvent(new Event('laas-cart'));
  });
  addEventListener('scroll', () => { if (!pop.hidden) place(); }, { passive: true });
})();

/* the smart header: clear while nothing sits under it, the glass capsule as soon as content scrolls beneath.
   It samples the page right under the bar every 10 px: text, a picture, a control, a filled card or the lock means
   "something is under the bar"; an empty background or a section's own colour does not. A contrast guard keeps the
   capsule whenever the colour under the logo does not suit the logo's tone (a light logo on chalk, an ink logo on ink). */
(() => {
  const root = document.documentElement, nav = document.querySelector('.nav');
  if (!nav) return;
  const shell = nav.querySelector('.nav__shell') || nav;
  const clear = c => !c || c === 'transparent' || /rgba\(0, 0, 0, 0\)|\/ 0\)$/.test(c);
  const isContent = el => {
    if (!el || nav.contains(el)) return false;
    if (el.closest('.px, .hero') || (el.closest('.tale') && root.classList.contains('in-tale'))) return false;
    if (/^(IMG|PICTURE|VIDEO|CANVAS|SVG|BUTTON|INPUT|SELECT|TEXTAREA|A|LABEL|SUMMARY)$/i.test(el.tagName) || el.closest('svg')) {
      // a full-screen canvas or stage layer is a background; a full-bleed photo is content
      const b = el.getBoundingClientRect();
      return !(el.tagName === 'CANVAS' && b.width >= innerWidth * 0.9 && b.height >= innerHeight * 0.9);
    }
    const b = el.getBoundingClientRect();
    if (b.width >= innerWidth * 0.9 && b.height >= innerHeight * 0.9) return false;
    for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    const cs = getComputedStyle(el);
    const filled = cs.backgroundImage !== 'none' || !clear(cs.backgroundColor);
    return filled && !/^(HTML|BODY|MAIN|SECTION|FOOTER|HEADER)$/.test(el.tagName) && el.offsetHeight < innerHeight * 0.9;
  };
  // things that do not take the pointer still count when they are visible under the bar
  const QUIET = '.map, .void__right, .lockimg, .slot';
  const quietContent = stack => stack.some(e => e.matches && e.matches(QUIET) && !e.closest('[data-key*="\\"hide\\":1"]') && getComputedStyle(e).opacity > 0.05);
  let raf = 0;
  const check = () => {
    raf = 0;
    if (root.classList.contains('in-foot') || root.classList.contains('in-hero')) return;
    if (root.classList.contains('in-tale')) { root.classList.add('nav-clear'); return; }
    // layout offsets, not the transformed box (the bar slides in and out)
    const r = { top: nav.offsetTop + shell.offsetTop, left: nav.offsetLeft + shell.offsetLeft, width: shell.offsetWidth, height: shell.offsetHeight };
    r.bottom = r.top + r.height; r.right = r.left + r.width;
    let under = false;
    outer: for (let y = r.top + 4; y <= r.bottom + 4; y += 10) for (let x = r.left + 12; x < r.right - 12; x += Math.max(40, r.width / 16)) {
      const stack = document.elementsFromPoint(x, y).filter(el => !nav.contains(el));
      if (isContent(stack[0]) || quietContent(stack)) { under = true; break outer; }
    }
    // contrast guard
    if (!under) {
      const bgEl = document.elementsFromPoint(r.left + 40, r.top + r.height / 2).find(el => !nav.contains(el) && !clear(getComputedStyle(el).backgroundColor)) || root;
      let c = getComputedStyle(bgEl).backgroundColor;
      if (clear(c)) c = getComputedStyle(root).backgroundColor;
      const [R, G, B] = (c.match(/[\d.]+/g) || [236, 236, 234]).map(Number);
      const darkBg = (0.2126 * R + 0.7152 * G + 0.0722 * B) < 128;
      if (darkBg !== (root.dataset.tone === 'dark')) under = true;
    }
    root.classList.toggle('nav-clear', !under);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(check); };
  let lastY = -1;
  addEventListener('scroll', () => { if (Math.abs(scrollY - lastY) > 6) { lastY = scrollY; schedule(); } }, { passive: true });
  addEventListener('scrollend', schedule);
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  // the landing page glides between chapters and fades its colour: look again while the page settles
  setInterval(() => { if (!document.hidden) schedule(); }, 700);
  schedule();
})();
