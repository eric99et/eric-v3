// LAAS · the bag in the nav: one icon with the number of things in the cart, on every page.
// The landing page shows it once something is in the cart; the shop pages show it always (they have no Buy pill).
(() => {
  const KEY = 'laas.cart.v1.en';
  const end = document.querySelector('.nav__end'); if (!end) return;
  const always = document.body.hasAttribute('data-shop');
  const a = document.createElement('a');
  a.className = 'nav__bag'; a.href = 'cart-v2.html';
  a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg><b></b>';
  end.insertBefore(a, end.querySelector('.nav__menu'));
  const count = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v.reduce((n, i) => n + ((i && i.qty) || 1), 0) : 0; } catch { return 0; } };
  const paint = () => {
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
})();
