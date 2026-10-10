// LAAS · Ring-Lock · the buy page
// António's buy block (finish dots, quantity, Buy) beside the real lock in 3D.
// Buy writes, right here, the same line items the old product page writes (via cart-nav.js): localStorage 'laas.cart.v1.en', an array of
// {name, finish, unit, qty, img}, merged by name + finish. No new page.
// ?finish=steel|copper|black (silver also works) and ?qty=1..15 preselect.
// The lock is the studio render of the real Ring-Lock (v8, images/lock), the same files as the landing page:
// six angles per finish. A sideways drag, the arrows or the arrow keys step through them; an up-and-down swipe
// still scrolls the page.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------------------------------------------------------- cart */
  const CART_KEY = 'laas.cart.v1.en';  // laas.js: 'laas.cart.v1.' + (DA ? 'da' : 'en')
  const PRICE = 129;                    // what the cart stores (euro); the page shows i18n.js's price
  const I = window.LAAS_I18N || { P: { lock: 129 }, t: s => s, money: n => '€' + n }, tr = I.t;
  const NAME = { steel: 'Steel', copper: 'Copper', black: 'Black' };
  const readCart = () => {
    try { const v = JSON.parse(localStorage.getItem(CART_KEY)); return Array.isArray(v) ? v : []; } catch { return []; }
  };
  const writeCart = items => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); return true; } catch { return false; }
  };
  const addLocks = (finish, qty) => {
    const items = readCart(), name = 'Ring-Lock', fin = NAME[finish];
    const same = items.find(i => i && i.name === name && i.finish === fin);
    // never more than 9 of one finish, as the cart's own + stops at 9
    if (same) same.qty = Math.min(15, (same.qty || 1) + qty);
    else items.push({ name, finish: fin, unit: PRICE, qty, img: 'images/lock-' + finish + '-render.jpg' });
    return writeCart(items);
  };

  /* --------------------------------------------------------------- state */
  const q = new URLSearchParams(location.search);
  const wanted = (q.get('finish') || '').toLowerCase().replace('silver', 'steel');
  let finish = NAME[wanted] ? wanted : 'steel';
  let qty = clamp(parseInt(q.get('qty'), 10) || 1, 1, 15);

  const still = $('#lock-still'), photo = $('#photo'), stage = $('#lock3d');
  const swapImg = (img, src, alt) => {
    if (!img || img.getAttribute('src') === src) { if (img) img.alt = alt; return; }
    const pre = new Image(); pre.src = src;
    const go = () => { img.src = src; img.alt = alt; requestAnimationFrame(() => img.classList.remove('is-out')); };
    if (reduce) { go(); return; }
    img.classList.add('is-out');
    Promise.all([pre.decode().catch(() => {}), new Promise(r => setTimeout(r, 200))]).then(go);
  };

  function render(first) {
    const name = NAME[finish];
    $$('[data-finish]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.finish === finish)));
    $('#finish-name').textContent = name;
    $('#buybar-finish').textContent = name + (qty > 1 ? ' · ' + qty : '');
    // once this finish is in the cart, the stepper shows and sets the cart, and the button goes to the checkout
    const n = inCart();
    $('#qty-value').textContent = n || qty;
    const minus = $('[data-qty="-1"]'), plus = $('[data-qty="1"]');
    minus.disabled = !n && qty <= 1; plus.disabled = (n || qty) >= 15;
    minus.classList.toggle('is-trash', n === 1);
    minus.setAttribute('aria-label', tr(n === 1 ? 'Remove from cart' : 'Decrease quantity'));
    $('.qty-row').classList.toggle('is-cart', !!n);
    const label = n ? tr('Check out') + ' · ' + I.money(I.P.lock * n) : tr('Buy') + ' · ' + I.money(I.P.lock * qty);
    $('#buy-btn').textContent = label;
    $('#buybar-btn').textContent = label;
    $('#buy').dataset.metal = finish;
    stage.setAttribute('aria-label', tr('The LAAS Ring-Lock in') + ' ' + name + '. ' + tr('Drag, or use the arrow keys, to turn it.'));
    syncTabs();
    if (first) {
      if (photo) { photo.src = 'images/lock/' + finish + '-05-800.webp'; photo.alt = tr('The LAAS Ring-Lock in') + ' ' + name; }
    } else {
      swapImg(photo, 'images/lock/' + finish + '-05-800.webp', tr('The LAAS Ring-Lock in') + ' ' + name);
      // keep the choice in the address, so a reload or a shared link opens on it
      const u = new URL(location.href);
      u.searchParams.set('finish', finish);
      if (qty > 1) u.searchParams.set('qty', qty); else u.searchParams.delete('qty');
      history.replaceState(null, '', u);
    }
  }

  // the finish dots: a click, or the arrow keys inside the group (radio pattern)
  const dots = $$('.finishes [data-finish]');
  const pick = f => { if (f === finish) return; finish = f; render(false); lock3d.show(f); };
  dots.forEach((b, i) => {
    b.addEventListener('click', () => pick(b.dataset.finish));
    b.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const n = dots[(i + d + dots.length) % dots.length];
      n.focus(); pick(n.dataset.finish);
    });
  });
  function syncTabs() { dots.forEach(b => (b.tabIndex = b.dataset.finish === finish ? 0 : -1)); }
  const C = () => window.LAAS_CART;
  const inCart = () => (C() && C().qtyOf ? C().qtyOf(finish) : 0);
  $$('[data-qty]').forEach(b => b.addEventListener('click', () => {
    const d = +b.dataset.qty, n = inCart();
    if (n) {
      const left = C().setQty(finish, n + d);
      $('#buy-status').textContent = left ? left + ' × Ring-Lock, ' + NAME[finish] + ' ' + tr('in your cart.') : 'Ring-Lock, ' + NAME[finish] + ' ' + tr('removed from your cart.');
      render(true); return;
    }
    qty = clamp(qty + d, 1, 15); render(false);
  }));

  /* --------------------------------------------- the lock: the studio renders */
  // The real Ring-Lock as on the landing page: the v8 studio renders (images/lock), six angles per finish.
  // A sideways drag steps through the angles (one per 50 px), as do the arrows and the arrow keys.
  const lock3d = (() => {
    const ANGLES = ['00', '01', '02', '03', '04', '05'];
    const res = () => stage.clientWidth * Math.min(devicePixelRatio || 1, 2) > 900 ? 1600 : 800;
    const src = (f, a) => `images/lock/${f}-${a}-${res()}.webp`;
    const cache = new Map();
    const get = u => cache.get(u) || (cache.set(u, new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(u); im.onerror = no; im.src = u; })), cache.get(u));
    let angle = 0, want = '';
    const hint = $('#lock-hint');
    const paint = () => {
      const u = src(finish, ANGLES[((angle % 6) + 6) % 6]); want = u;
      get(u).then(() => { if (want === u) still.src = u; }, () => {});
    };
    const warm = () => ANGLES.forEach(a => get(src(finish, a)).catch(() => {}));
    const step = d => { angle += d; hint?.classList.add('is-used'); paint(); warm(); };
    let down = null, lastX = 0, acc = 0;
    stage.addEventListener('pointerdown', e => { if (e.button > 0) return; down = { x: e.clientX, y: e.clientY }; lastX = e.clientX; acc = 0; });
    stage.addEventListener('pointermove', e => {
      if (!down) return;
      if (down !== true) {
        const dx = Math.abs(e.clientX - down.x), dy = Math.abs(e.clientY - down.y);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { down = null; return; }
        down = true; stage.classList.add('is-drag'); try { stage.setPointerCapture(e.pointerId); } catch {}
      }
      acc += e.clientX - lastX; lastX = e.clientX;
      while (Math.abs(acc) >= 50) { step(acc > 0 ? -1 : 1); acc -= Math.sign(acc) * 50; }
    });
    const end = () => { down = null; stage.classList.remove('is-drag'); };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end); stage.addEventListener('lostpointercapture', end);
    stage.addEventListener('keydown', e => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); });
    $$('[data-turn]').forEach(btn => btn.addEventListener('click', () => step(+btn.dataset.turn)));
    paint();
    // the rest of the turn once the first view is in; the other finishes when a finish dot is reached for
    get(src(finish, '00')).then(warm, () => {});
    $$('.finishes [data-finish]').forEach(d => ['pointerenter', 'touchstart', 'focus'].forEach(ev => d.addEventListener(ev, () => get(src(d.dataset.finish, ANGLES[((angle % 6) + 6) % 6])).catch(() => {}), { passive: true })));
    return { show: () => { paint(); warm(); } };
  })();

  // Buy: the locks go in the cart, then the cart page
  // Buy puts the locks in the cart right here, no new page and no question on the way (the cart offers the
  // Flex Mount); cart-nav.js shows what was added, with Check out one tap away
  // first one question: the Flex Mount, for frames without holes (asked once; not when it is in the cart already)
  const ask = $('#flex-ask');
  const buy = () => {
    if (inCart()) { location.href = 'checkout-v2.html'; return; }
    if (ask && ask.showModal && C() && C().hasFlex && !C().hasFlex()) { ask.returnValue = ''; ask.showModal(); return; }
    put(false);
  };
  ask?.addEventListener('close', () => { const v = ask.returnValue; if (v === 'flex' || v === 'no') put(v === 'flex'); });
  const put = flex => {
    const ok = window.LAAS_CART ? window.LAAS_CART.add(finish, qty) : addLocks(finish, qty);
    if (flex && ok) C().addFlex(ok === true ? qty : ok);
    if (ok === 0) { $('#buy-status').textContent = tr('Your cart already has 15 locks, the most in one order.'); return; }
    if (ok === false) { $('#buy-status').textContent = tr('Your browser blocked the cart. Allow site data for this page and try again.'); return; }
    $('#buy-status').textContent = (n => n + ' × Ring-Lock, ' + NAME[finish] + ', ' + tr('added to your cart.'))(ok === true ? qty : ok);
    qty = 1;
    ['#buy-btn', '#buybar-btn'].forEach(sel => {
      const btn = $(sel); btn.classList.add('is-added'); btn.textContent = tr('Added');
      setTimeout(() => { btn.classList.remove('is-added'); render(true); }, 1600);
    });
    render(true);
    ['#buy-btn', '#buybar-btn'].forEach(sel => { $(sel).textContent = tr('Added'); });
  };
  $('#buy-btn').addEventListener('click', buy);
  $('#buybar-btn').addEventListener('click', buy);
  // coming back with the browser's back button: the button is a button again
  addEventListener('pageshow', () => {
    const btn = $('#buy-btn'); btn.disabled = false; btn.classList.remove('is-added'); render(true); paintCart();
  });

  /* ------------------------------------------------------- the cart link */
  // the bag in the nav (cart-nav.js) listens for this
  function paintCart() { dispatchEvent(new Event('laas-cart')); }
  addEventListener('storage', e => { if (e.key === CART_KEY) { paintCart(); render(true); } });

  /* ------------------------------------------------- the nav capsule */
  {
    const links = $('.nav__links'), hover = $('.nav__hover');
    const onScroll = () => root.classList.toggle('nav-float', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (links && hover) {
      $$('a', links).forEach(a => a.addEventListener('pointerenter', () => {
        links.style.setProperty('--hx', a.offsetLeft + 'px'); links.style.setProperty('--hw', a.offsetWidth + 'px'); links.style.setProperty('--ho', '1');
      }));
      links.addEventListener('pointerleave', () => links.style.setProperty('--ho', '0'));
    }
  }

  /* ------------------------------------------------- the mobile buy bar */
  {
    const bar = $('#buybar'), box = $('.buybox'), foot = $('.foot');
    let boxGone = false, footIn = false;
    const set = () => {
      const on = boxGone && !footIn;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', String(!on));
      $('#buybar-btn').tabIndex = on ? 0 : -1;
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { boxGone = !e.isIntersecting && e.boundingClientRect.top < 0; set(); }).observe(box);
      new IntersectionObserver(([e]) => { footIn = e.isIntersecting; set(); }).observe(foot);
    }
  }

  /* ------------------------------------------------------------------ menu */
  const menu = $('#menu'), menuBtn = $('#menu-open');
  function openMenu() {
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = tr('Close');
    requestAnimationFrame(() => menu.classList.add('is-open'));
    $('main').inert = true;
    setTimeout(() => menu.querySelector('a')?.focus(), 50);
  }
  function closeMenu(refocus = true) {
    if (menu.hidden) return;
    menu.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = tr('Menu');
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 700);
    $('main').inert = false;
    if (refocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $$('.menu a').forEach(a => a.addEventListener('click', () => closeMenu(false)));

  /* ------------------------------------------------------------- start */
  render(true);
  paintCart();
})();
