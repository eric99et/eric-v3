// LAAS · what visitors do on laaslocks.com, as Google Analytics 4 events. Only the live pages load it: tools/to-live.py
// puts it right after consent.js, and nothing is sent unless the visitor said yes to statistics (window.laasConsent). One listener catches every click and names it after what
// the visitor read on it ("click: Pre-order", with where on the page in "area"). On top of that: the cart's ins and
// outs, the step to Shopify's checkout, how far down each page people scroll, the films that play, turns of the 3D
// lock, searches and missing pages. Never what anyone types into a form, other than a search.
// GA4 names: letters, digits and _, at most 40 characters; values at most 100.
(() => {
  const send = (name, data) => {
    try {
      if (!(window.laasConsent && window.laasConsent.statistics) || !window.gtag) return;
      const d = {};
      Object.keys(data || {}).forEach(k => { d[k] = typeof data[k] === 'string' ? data[k].slice(0, 100) : data[k]; });
      window.gtag('event', name, d);
    } catch { /* blocked */ }
  };

  // what the visitor read on it: its aria-label, else the visible text, title or picture alt. Prices, counts and
  // trailing arrows go (a part that is only a number: the menu's "02", the FAQ tab's question count; the bag's
  // "Cart, 2 items"), so "No, add Flex-Mount. · €9.99" and the same button in kroner are one name, and "02 Shop" is "Shop"
  const say = s => (s || '').replace(/\s+/g, ' ')
    .replace(/€\s?\d[\d.,]*|\d[\d.,]*\s?(kr\.?|€)/gi, '')
    .replace(/\(\s*\d+\s*\)/g, '').replace(/,\s*\d+\s+\p{L}+\s*$/u, '').replace(/\s*[→↗›»]+\s*$/, '')
    .replace(/(\s*[·,:])+\s*$/, '').replace(/^\s*([·,:]\s*)+/, '').trim();
  const shown = n => n.nodeType === 3 ? n.textContent
    : n.nodeType === 1 && n.getClientRects().length && !/^\s*\d+\s*$/.test(n.textContent) ? [...n.childNodes].map(shown).join(' ') : '';
  const label = el => {
    if (el.matches('input[type="checkbox"], input[type="radio"]')) return say(el.labels && el.labels[0] ? shown(el.labels[0]) : el.value || el.name);
    const img = el.querySelector('img[alt]');
    return say(el.getAttribute('aria-label')) || say(shown(el)) || say(el.getAttribute('title')) || say(img && img.alt) || say(el.value)
      || el.getAttribute('href') || el.tagName.toLowerCase();
  };
  // where on the page: a dialog, the header, footer or menu, a section with an id ("buy", "help"), else the nearest
  // part with an id (the side rail, the buy bar); <main> is the page itself
  const area = el => {
    const p = el.parentElement;
    const z = p && (p.closest('dialog, header, footer, #menu, aside[id], nav[id], section[id]') || p.closest('[id]:not(body):not(main)'));
    if (!z) return 'page';
    if (z.matches('dialog')) return z.className.split(' ')[0] || 'dialog';
    return z.matches('header, footer') && !z.id ? z.tagName.toLowerCase() : z.id;
  };

  // the cart, counted by what is in it: "Ring-Lock Copper" 2, "Flex-Mount" 1
  const KEY = 'laas.cart.v1.en';
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v.filter(Boolean) : []; } catch { return []; } };
  const what = i => /Flex/.test(i.name) ? 'Flex-Mount' : 'Ring-Lock ' + (!i.finish || i.finish === 'Silver' ? 'Steel' : i.finish);
  const tally = () => read().reduce((m, i) => { m[what(i)] = (m[what(i)] || 0) + (+i.qty || 1); return m; }, {});
  // GA4 e-commerce: the cart's prices are in euro (buy.js PRICE; the checkout may charge in kroner)
  const CUR = 'EUR';
  const price = k => { const i = read().find(x => what(x) === k); return i ? +i.unit || 0 : k === 'Flex-Mount' ? 9.99 : 129; };
  const item = (k, q, p = price(k)) => ({ item_id: k === 'Flex-Mount' ? 'flex-mount' : 'ring-lock', item_name: k,
    item_variant: k === 'Flex-Mount' ? undefined : k.replace('Ring-Lock ', ''), price: p, quantity: q });
  const money = list => Math.round(list.reduce((v, i) => v + i.price * i.quantity, 0) * 100) / 100;
  const cartItems = () => { const t = tally(); return Object.keys(t).map(k => item(k, t[k])); };
  const locks = t => Object.keys(t).reduce((n, k) => n + (k === 'Flex-Mount' ? 0 : t[k]), 0);
  const handoff = () => { try { return !!localStorage.getItem('laas.handoff'); } catch { return false; } };

  const CLICK = 'a[href], button, summary, label, [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="link"], '
    + 'input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], [data-finish], [data-qty], [data-pick], [data-turn]';
  let last = '', lastAt = 0;
  // capture: read before the click changes the button ("Pre-order" turns into "Added")
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest(CLICK);
    // a label's own click: its checkbox or radio gets a click of its own right after, which is the one counted
    if (!el || el.closest('[data-ga-skip]') || (el.matches('label') && el.control)) return;
    const name = label(el), where = area(el);
    if (name + where === last && e.timeStamp - lastAt < 500) return; // a double click is one
    last = name + where; lastAt = e.timeStamp;
    if (/checkout-v2\.html/.test(el.getAttribute('href') || '') || /^(check out|gå til kassen)$/i.test(name)) {
      const list = cartItems();
      send('begin_checkout', { area: where, locks: locks(tally()), currency: CUR, value: money(list), items: list });
      return;
    }
    const data = { area: where };
    if (el.matches('a[href]') && /^https?:$/.test(el.protocol) && el.host !== location.host) data.to = el.host.replace(/^www\./, '');
    data.label = name;
    send('ui_click', data);
  }, true);

  // in and out of the cart, from the buy page, the bag, the cart page or anywhere else (cart-nav.js says "laas-cart")
  let had = tally(), away = handoff(), prices = {};
  const remember = () => { read().forEach(i => { prices[what(i)] = +i.unit || prices[what(i)]; }); };
  remember();
  // another tab changed it: that tab reports it, this one only catches up (capture: before buy.js repaints)
  addEventListener('storage', e => { if (e.key === KEY || e.key === null) { had = tally(); away = handoff(); remember(); } }, true);
  addEventListener('laas-cart', () => {
    const now = tally();
    // the cart that went to Shopify, emptied by cart-nav.js once the order is placed, is not a change of mind. (Orders
    // themselves are not counted here: on a fresh page cart-nav.js empties the cart before this script runs.)
    if (!(away && !handoff() && !Object.keys(now).length)) new Set([...Object.keys(had), ...Object.keys(now)]).forEach(k => {
      const d = (now[k] || 0) - (had[k] || 0);
      if (!d) return;
      const it = item(k, Math.abs(d), prices[k] || price(k));
      send(d > 0 ? 'add_to_cart' : 'remove_from_cart', { currency: CUR, value: money([it]), items: [it] });
    });
    had = now; away = handoff(); remember();
  });

  // how far down the page: 25, 50, 75 and 100 per cent, each once per page view
  const MARKS = [25, 50, 75, 100];
  let mark = 0, wait = 0;
  const depth = () => {
    wait = 0;
    const room = document.documentElement.scrollHeight - innerHeight;
    if (room < 200) return; // a page that hardly scrolls says nothing
    const at = (scrollY + 2) / room * 100;
    while (mark < MARKS.length && at >= MARKS[mark]) send('scroll_depth', { percent: MARKS[mark++] });
    if (mark === MARKS.length) removeEventListener('scroll', onScroll);
  };
  const onScroll = () => { if (!wait) wait = setTimeout(depth, 250); };
  addEventListener('scroll', onScroll, { passive: true });

  // the films (they start as they scroll into view): the first time each one plays on this page view, named by folder
  // and file, the phone and wide cuts as one ("story/unlock", "how/unlock")
  const played = new Set();
  document.addEventListener('play', e => {
    const v = e.target;
    if (!(v instanceof HTMLVideoElement)) return;
    const name = (v.currentSrc || v.src || '').split('?')[0].split('/').slice(-2).join('/').replace(/(-wide|-m)?\.\w+$/, '');
    if (name && !played.has(name)) { played.add(name); send('film_play', { film: name }); }
  }, true);

  // a turn of the 3D lock (home page, buy page): a drag of 30 px or more, once per page view and place
  const turned = new Set();
  let from = null;
  document.addEventListener('pointerdown', e => {
    const s = e.target.closest && e.target.closest('#stage, #lock3d');
    from = s ? { s, x: e.clientX, y: e.clientY } : null;
  }, true);
  document.addEventListener('pointerup', e => {
    if (!from) return;
    const { s, x, y } = from;
    from = null;
    if (Math.hypot(e.clientX - x, e.clientY - y) < 30 || turned.has(s.id)) return;
    turned.add(s.id);
    send('turn_3d_lock', { area: s.id });
  }, true);

  // searches (the FAQ and the help centre), once the visitor stops typing; never one that looks like an email or a phone number
  let typing = 0, said = '';
  document.addEventListener('input', e => {
    const f = e.target;
    if (!f.matches || !f.matches('input[type="search"], input[role="searchbox"], input[name="q"]')) return;
    clearTimeout(typing);
    typing = setTimeout(() => {
      const q = f.value.trim().toLowerCase().replace(/\s+/g, ' ');
      if (q.length < 3 || q === said || /@|\d{5,}/.test(q.replace(/[\s+()-]/g, ''))) return;
      said = q;
      send('search', { search_term: q.slice(0, 60), area: area(f) });
    }, 1500);
  }, true);

  // the buy page seen: GA4's view_item, the first step of the shop funnel (once per page view; also when the visitor says
  // yes to statistics only after the page opened)
  if (/\/buy(\.html)?$/.test(location.pathname)) {
    let seen = false;
    const view = () => {
      if (seen || !(window.laasConsent && window.laasConsent.statistics)) return;
      seen = true;
      const it = item('Ring-Lock Steel', 1, 129);
      send('view_item', { currency: CUR, value: 129, items: [it] });
    };
    view();
    addEventListener('laas-consent', view);
  }

  // a missing page (404.html answers for any address that does not exist; i18n.js may have put its title in Danish)
  if (/^(Page not found|Siden findes ikke)/.test(document.title)) {
    send('page_not_found', { path: location.pathname.slice(0, 100) });
  }
})();
