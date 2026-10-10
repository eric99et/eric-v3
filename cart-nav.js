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
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; } };
  const count = () => read().reduce((n, i) => n + ((i && i.qty) || 1), 0);

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
    a.setAttribute('aria-label', n ? `Cart, ${n} ${n === 1 ? 'item' : 'items'}` : 'Cart, empty');
  };
  paint();
  addEventListener('storage', e => { if (e.key === KEY) paint(); });
  addEventListener('laas-cart', paint);
  addEventListener('pageshow', paint);

  /* ---------------------------------------------------------- add to cart */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let card = null, timer = 0;
  const show = (finish, qty, note) => {
    if (!card) {
      card = document.createElement('div');
      card.className = 'added'; card.setAttribute('role', 'status'); card.setAttribute('aria-live', 'polite');
      card.innerHTML = `<img class="added__pic" alt="" width="64" height="64">
        <div class="added__what"><p class="added__h"></p><p class="added__p"></p></div>
        <button class="added__x" type="button" aria-label="Close"></button>
        <div class="added__btns"><a class="buy-btn added__go" href="checkout-v2.html">Check out</a><a class="added__cart" href="cart-v2.html">View cart</a></div>`;
      document.body.append(card);
      card.querySelector('.added__x').addEventListener('click', hide);
      card.addEventListener('pointerenter', () => clearTimeout(timer));
      card.addEventListener('pointerleave', () => { timer = setTimeout(hide, 4000); });
      addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    }
    card.querySelector('.added__pic').src = 'images/scenes/finish-' + finish + '.webp';
    card.querySelector('.added__h').textContent = qty ? 'Added to your cart' : 'Your cart is full';
    card.querySelector('.added__p').textContent = (qty ? `Ring-Lock, ${NAME[finish]}${qty > 1 ? ' × ' + qty : ''} · €${PRICE * qty}` : '') + (note ? (qty ? '. ' : '') + note : '');
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

  // the same line items the cart reads: {name, finish, unit, qty, img}, merged by name + finish, at most 9
  const add = (finish, qty) => {
    if (!NAME[finish]) finish = 'steel';
    const items = read(), name = 'Ring-Lock', fin = NAME[finish];
    const want = Math.max(1, qty | 0 || 1);
    const locks = items.reduce((n, i) => n + (i && /^Ring-Lock/.test(i.name) ? (i.qty || 1) : 0), 0);
    qty = Math.max(0, Math.min(want, MAX_LOCKS - locks));
    const note = qty < want ? MAX_LOCKS + ' locks is the most in one order.' : '';
    if (!qty) { show(finish, 0, 'You have ' + MAX_LOCKS + ' locks in it, the most in one order.'); return 0; }
    const same = items.find(i => i && i.name === name && (i.finish === fin || (fin === 'Steel' && i.finish === 'Silver')));
    if (same) { same.finish = fin; same.qty = (same.qty || 1) + qty; }
    else items.push({ name, finish: fin, unit: PRICE, qty, img: 'images/lock-' + finish + '-render.jpg' });
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { return false; }
    dispatchEvent(new Event('laas-cart'));
    show(finish, qty, note);
    return qty;
  };
  window.LAAS_CART = { add };
})();

// the footer's entrance (after 21st.dev "Footer section 1"): once, when it comes into view
(() => {
  const f = document.querySelector('.foot2');
  if (!f || !('IntersectionObserver' in window)) return;
  f.classList.add('is-ready');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { f.classList.add('is-in'); io.disconnect(); } }, { rootMargin: '0px 0px -60px 0px' });
  io.observe(f);
})();
