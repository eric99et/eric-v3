// LAAS · Ring-Lock · the buy page
// António's buy block (finish dots, quantity, Buy) beside the real lock in 3D.
// Buy writes, right here, the same line items the old product page writes (via cart-nav.js): localStorage 'laas.cart.v1.en', an array of
// {name, finish, unit, qty, img}, merged by name + finish. No new page.
// ?finish=steel|copper|black (silver also works) and ?qty=1..15 preselect.
// The lock turns all the way round: 72 studio frames per finish rendered from the v8 model (images/spin).
// A sideways drag turns it, the arrows and the arrow keys turn it 45°; an up-and-down swipe still scrolls the page.
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
    // the bar's button just says Buy, so the price sits beside the finish
    $('#buybar-finish').textContent = name + ' · ' + (qty > 1 ? qty + ' × ' : '') + I.money(I.P.lock);
    // once this finish is in the cart, the stepper shows and sets the cart, and the button goes to the checkout
    const n = inCart();
    $('#qty-value').textContent = n || qty;
    const minus = $('[data-qty="-1"]'), plus = $('[data-qty="1"]');
    minus.disabled = !n && qty <= 1; plus.disabled = (n || qty) >= 15;
    minus.classList.toggle('is-trash', n === 1);
    minus.setAttribute('aria-label', tr(n === 1 ? 'Remove from cart' : 'Decrease quantity'));
    $('.qty-row').classList.toggle('is-cart', !!n);
    const label = tr(n ? 'Check out' : 'Buy now');
    $('#buy-btn').textContent = label;
    $('#buybar-btn').textContent = label;
    $('#buy').dataset.metal = finish;
    stage.setAttribute('aria-label', tr('The LAAS Ring-Lock in') + ' ' + name + '. ' + tr('Drag, or use the arrow keys, to turn it.'));
    syncTabs();
    if (first) {
      if (photo) { photo.src = (window.LAAS_ROOT || '') + 'images/lock/' + finish + '-05-800.webp'; photo.alt = tr('The LAAS Ring-Lock in') + ' ' + name; }
    } else {
      swapImg(photo, (window.LAAS_ROOT || '') + 'images/lock/' + finish + '-05-800.webp', tr('The LAAS Ring-Lock in') + ' ' + name);
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

  /* --------------------------------------------- the lock: a 360° turn */
  // The real Ring-Lock all the way round: 72 studio frames per finish (every 5°), rendered from the v8 model in
  // Marcus's studio light (images/spin/<finish>/1200 and /2400). The lock follows a sideways drag and coasts on;
  // the arrows and the arrow keys turn it 45°; an up-and-down swipe still scrolls the page. Frames load coarse to
  // fine (every 30°, 15°, 10°, 5°) once the page has settled, so the turn works early and fills in; the sharp
  // 2400 px frame comes in when the lock rests on a large screen.
  const lock3d = (() => {
    // STEP: 1 = all 72 frames (every 5°); 2 would load every 10° only
    // FRONT: the front view (as Marcus's 01-front); the lock starts there and goes back there 3 s after a turn
    const N = 72, STEP = 1, FRONT = 6, HOME_MS = 3000, base = (window.LAAS_ROOT || '') + 'images/spin/';
    const ORDER = [6, 3, 2, 1].flatMap((d, k, all) => [...Array(N).keys()].filter(i => i % d === 0 && all.slice(0, k).every(e => i % e))).filter(i => i % STEP === 0);
    const pad = i => String(i).padStart(2, '0');
    const url = (f, i, big) => `${base}${f}/${big ? 2400 : 1200}/${pad(i)}.webp`;
    const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    cv.className = 'lock3d__spin'; cv.setAttribute('aria-hidden', 'true'); stage.appendChild(cv);
    const pending = new Map(), got = {};                  // got: finished images, drawn straight away
    const fetchFrame = (f, i, big) => {
      const k = f + i + (big ? 'b' : '');
      if (got[k]) return Promise.resolve(got[k]);
      if (!pending.has(k)) pending.set(k, new Promise(r => {
        const im = new Image(); im.decoding = 'async';
        im.onload = () => { got[k] = im; r(im); };
        im.onerror = () => { pending.set(k, null); r(null); };
        im.src = url(f, i, big);
      }));
      return pending.get(k) || Promise.resolve(null);
    };
    let pos = FRONT, vel = 0, raf = 0, shown = '', bigT = 0, down = null, homeT = 0;
    const wrap = i => ((i % N) + N) % N;
    const nearest = i => { for (let d = 0; d <= N / 2; d++) for (const j of [i + d, i - d]) if (got[finish + wrap(j)]) return wrap(j); return -1; };
    const size = () => {                                  // the canvas sits exactly over the still
      const s = still.getBoundingClientRect(), r = stage.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      Object.assign(cv.style, { left: (s.left - r.left) + 'px', top: (s.top - r.top) + 'px', width: s.width + 'px', height: s.height + 'px' });
      cv.width = Math.round(s.width * d); cv.height = Math.round(s.height * d); shown = ''; draw();
    };
    function draw() {
      const i = wrap(Math.round(pos)), j = nearest(i);
      if (j < 0 || !cv.width) return;
      const big = got[finish + j + 'b'], im = big || got[finish + j], id = finish + j + (big ? 'b' : '') + cv.width;
      if (id !== shown) {
        // the renders frame the lock 5% larger and a little lower than the cut-outs: draw them to the cut-out's size
        const W = cv.width * 0.95, x = (cv.width - W) / 2, y = (cv.height - W) / 2 - cv.height * 0.035;
        ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(im, x, y, W, W); shown = id;
        stage.classList.add('is-3d');
      }
      clearTimeout(bigT);
      if (!big && i === j && cv.width > 1250) bigT = setTimeout(() => fetchFrame(finish, j, true).then(draw), vel || down ? 300 : 120);
    }
    // coarse to fine. Until someone touches the lock only every 30° loads (12 frames, ~0.7 MB); the rest comes on
    // the first drag, arrow or hover, so a phone that never turns it does not pay for the whole turn
    const started = {}, COARSE = ORDER.filter(i => i % 6 === 0).length;
    let engaged = false;
    const fill = (f, all = engaged) => {
      const upto = all ? N : COARSE;
      if ((started[f] || 0) >= upto) return;
      let k = started[f] || 0; started[f] = upto;
      const next = () => { if (k >= upto) return; const b = ORDER.slice(k, Math.min(k + 6, upto)); k += b.length; Promise.all(b.map(i => fetchFrame(f, i))).then(() => { if (f === finish) draw(); next(); }); };
      next();
    };
    const engage = () => { if (engaged) return; engaged = true; fill(finish, true); };
    // back to the front view, the short way round, HOME_MS after the last touch
    const home = () => { clearTimeout(homeT); homeT = setTimeout(() => {
      if (down) return;
      let d = wrap(FRONT - Math.round(pos)); if (d > N / 2) d -= N;
      if (d) turnTo(Math.round(pos) + d, Math.min(1400, 450 + Math.abs(d) * 25), true);
    }, HOME_MS); };
    const coast = () => {
      vel *= 0.93; pos += vel; draw();
      if (Math.abs(vel) > 0.03) raf = requestAnimationFrame(coast); else { vel = 0; pos = Math.round(pos); draw(); home(); }
    };
    const hint = $('#lock-hint');
    function turnTo(to, ms, inOut) {                      // eased turn to a frame (ease-out for the arrows, in-out for going home)
      cancelAnimationFrame(raf); vel = 0;
      const from = pos, t0 = performance.now(); ms = reduce ? 0 : ms;
      const ease = t => inOut ? (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) : 1 - Math.pow(1 - t, 3);
      const tick = now => { const t = ms ? Math.min(1, (now - t0) / ms) : 1; pos = from + (to - from) * ease(t); draw(); if (t < 1) raf = requestAnimationFrame(tick); else if (!inOut) home(); };
      raf = requestAnimationFrame(tick);
    }
    const glide = d => { hint?.classList.add('is-used'); engage(); clearTimeout(homeT); turnTo(Math.round(pos) + d * 9, 420); };   // the arrows: 45°
    let lastX = 0, lastT = 0;
    stage.addEventListener('pointerdown', e => { if (e.button > 0) return; down = { x: e.clientX, y: e.clientY }; lastX = e.clientX; lastT = performance.now(); cancelAnimationFrame(raf); clearTimeout(homeT); vel = 0; engage(); });
    stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') engage(); });
    stage.addEventListener('pointermove', e => {
      if (!down) return;
      if (down !== true) {
        const dx = Math.abs(e.clientX - down.x), dy = Math.abs(e.clientY - down.y);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { down = null; return; }
        down = true; stage.classList.add('is-drag'); hint?.classList.add('is-used'); try { stage.setPointerCapture(e.pointerId); } catch {}
      }
      const now = performance.now(), step = (e.clientX - lastX) * N / Math.max(240, stage.clientWidth * 1.3);
      pos += step; vel = step / Math.max(1, now - lastT) * 16; lastX = e.clientX; lastT = now; draw();
    });
    const end = () => { const was = down === true; down = null; stage.classList.remove('is-drag'); if (was && !reduce) coast(); else { vel = 0; draw(); if (was) home(); } };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end); stage.addEventListener('lostpointercapture', end);
    stage.addEventListener('keydown', e => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); glide(e.key === 'ArrowRight' ? 1 : -1); });
    $$('[data-turn]').forEach(btn => btn.addEventListener('click', () => glide(+btn.dataset.turn)));
    addEventListener('resize', size);
    // the still (the front view) carries the first paint; the turn loads once the page has settled
    still.src = url(finish, FRONT); still.style.setProperty('--lx', '0%'); still.style.setProperty('--ly', '0%');
    const start = () => { size(); fill(finish); };
    if (document.readyState === 'complete') setTimeout(start, 300); else addEventListener('load', () => setTimeout(start, 300));
    $$('.finishes [data-finish]').forEach(d => ['pointerenter', 'touchstart', 'focus'].forEach(ev => d.addEventListener(ev, () => fill(d.dataset.finish), { passive: true })));
    return { show: () => { shown = ''; still.src = url(finish, FRONT); fill(finish); draw(); } };
  })();

  // Buy: the locks go in the cart, then the cart page
  // Buy puts the locks in the cart right here, no new page and no question on the way (the cart offers the
  // Flex-Mount); cart-nav.js shows what was added, with Check out one tap away
  // first one question, the Flex-Mount (cart-nav.js asks it, on every page that sells)
  const buy = () => {
    if (inCart()) { location.href = 'checkout-v2.html'; return; }
    if (C() && C().ask) C().ask(put); else put(false);
  };
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

  /* --------------------------------------- the EU legal-guarantee notice */
  // it folds under its blue band; a link to #legal-guarantee opens it
  const openNotice = () => { if (location.hash === '#legal-guarantee') $$('#legal-guarantee .lgn__dd').forEach(d => (d.open = true)); };
  openNotice(); addEventListener('hashchange', openNotice);

  /* ------------------------------------------------------- the cart link */
  // the bag in the nav (cart-nav.js) listens for this
  function paintCart() { dispatchEvent(new Event('laas-cart')); }
  addEventListener('storage', e => { if (e.key === CART_KEY) { paintCart(); render(true); } });
  addEventListener('laas-cart', () => render(true));

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
      // the computer's version of the bar: the nav's Pre-order pill, back up to the buy card
      // (it stays over the footer too: it sits in the nav, not on top of the page)
      root.classList.toggle('pdp-box-gone', boxGone);
      const pill = $('.nav__buy--pdp'); if (pill) pill.tabIndex = boxGone ? 0 : -1;
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

  /* ------------------------------------------- the Flex-Mount on its own */
  const flexBtn = $('#flex-add');
  flexBtn?.addEventListener('click', () => {
    const n = window.LAAS_CART && window.LAAS_CART.addFlexOnly ? window.LAAS_CART.addFlexOnly(1) : 0;
    $('#buy-status').textContent = n ? 'Flex-Mount, ' + tr('added to your cart.') : n === 0 ? '15 ' + tr('is the most in one order') : tr('Your browser blocked the cart. Allow site data for this page and try again.');
    if (!n) return;
    flexBtn.classList.add('is-added'); flexBtn.textContent = tr('Added');
    setTimeout(() => { flexBtn.classList.remove('is-added'); flexBtn.textContent = tr('Add to cart'); }, 1600);
  });
})();
