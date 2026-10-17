// LAAS · the checkout steps (checkout-v2.html) and the order confirmation (order-confirmed.html).
// DEMO: there is no payment provider. The checkout checks the form, then "places" a test order in this browser:
// the order is kept in sessionStorage for the confirmation page, the cart is emptied, and nothing is sent anywhere.
// No card details are asked for. What you type is kept in sessionStorage (this tab only) so a reload keeps it,
// and it is cleared once the order is placed.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const I = window.LAAS_I18N || { lang: 'en', P: { lock: 129, flex: 9.99, ship: 9, free: 250 }, t: s => s, money: n => '€' + n };
  const tr = I.t, money = I.money;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'laas.cart.v1.en', FORM_KEY = 'laas.checkout.v1', ORDER_KEY = 'laas.order.last';
  const ss = {
    get: k => { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
    del: k => { try { sessionStorage.removeItem(k); } catch { /* private mode */ } },
  };
  const readCart = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v.filter(Boolean) : []; } catch { return []; } };
  const isLock = i => /^Ring-Lock/.test(i.name), isFlex = i => /Flex/.test(i.name);
  const unitOf = i => isLock(i) ? I.P.lock : isFlex(i) ? I.P.flex : (+i.unit || 0);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FIN = { Steel: 'steel', Copper: 'copper', Black: 'black' };
  const thumb = i => isFlex(i) ? 'images/flexmount-thumb.webp' : 'images/scenes/thumb-' + (FIN[i.finish] || 'steel') + '.webp';

  /* ================================================================ checkout */
  const form = $('#checkout-form');
  if (form) {
    const STEPS = ['contact', 'delivery', 'payment'];
    const sec = id => $(`[data-step="${id}"]`, form);
    const saved = ss.get(FORM_KEY) || {};
    let done = new Set((saved.done || []).filter(s => STEPS.includes(s) && s !== 'payment'));
    let current = STEPS.includes(saved.step) ? saved.step : 'contact';

    // postal codes, by country: letters allowed where the country uses them (NL), a country prefix (DK-2200) is fine
    const POST = {
      DK: [/^\d{4}$/, '2200'], SE: [/^\d{3} ?\d{2}$/, '113 51'], DE: [/^\d{5}$/, '10115'], NL: [/^\d{4} ?[A-Z]{2}$/, '1012 AB'],
      BE: [/^\d{4}$/, '1000'], AT: [/^\d{4}$/, '1010'], FI: [/^\d{5}$/, '00100'], FR: [/^\d{5}$/, '75001'],
    };
    const country = () => $('#co-country').value;
    const RULES = {
      email: v => !v ? tr('Enter your email, so we can send the order confirmation.')
        : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? tr('That email looks incomplete, e.g. name@example.com.') : '',
      first: v => v ? '' : tr('Enter your first name.'),
      last: v => v ? '' : tr('Enter your last name.'),
      address: v => !v ? tr('Enter your street and number.') : v.length < 3 ? tr('Enter your street and number.') : '',
      postal: v => {
        if (!v) return tr('Enter your postal code.');
        const [re, ex] = POST[country()] || [/^[A-Z0-9 -]{3,10}$/, ''];
        const clean = v.toUpperCase().replace(/^[A-Z]{1,2}-/, '').trim();
        return re.test(clean) ? '' : tr('Check the postal code. It looks like this:') + ' ' + ex + '.';
      },
      city: v => v ? '' : tr('Enter your city.'),
      phone: v => !v || /^\+?[\d\s()-]{6,20}$/.test(v) ? '' : tr('Use digits, spaces and + only.'),
    };
    const FIELDS = { contact: ['email'], delivery: ['first', 'last', 'address', 'postal', 'city', 'phone'], payment: [] };
    const input = name => form.elements[name];
    const errOf = el => el && document.getElementById(el.id + '-err');
    const check = (name, show = true) => {
      const el = input(name); if (!el || !RULES[name]) return true;
      const msg = RULES[name](el.value.trim());
      if (show) {
        el.dataset.touched = '1';
        if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
        const e = errOf(el); if (e) e.textContent = msg;
        el.closest('.field')?.classList.toggle('is-bad', !!msg);
        el.closest('.field')?.classList.toggle('is-ok', !msg && !!el.value.trim());
      }
      return !msg;
    };
    const stepOk = (id, show) => FIELDS[id].map(n => check(n, show)).every(Boolean);

    // what was typed: kept for this tab, so a reload or Back keeps it (the newsletter box is not kept: it starts unticked)
    const keep = () => {
      const values = {};
      ['email', 'first', 'last', 'address', 'address2', 'postal', 'city', 'country', 'phone'].forEach(n => { if (input(n)) values[n] = input(n).value; });
      values.method = (form.querySelector('input[name="method"]:checked') || {}).value;
      ss.set(FORM_KEY, { values, done: [...done], step: current });
    };
    const v = saved.values || {};
    Object.keys(v).forEach(n => {
      if (n === 'method') { const r = form.querySelector(`input[name="method"][value="${v.method}"]`); if (r) r.checked = true; return; }
      if (input(n) && typeof v[n] === 'string') input(n).value = v[n];
    });
    // a step marked done whose fields no longer pass (another tab, an old save) opens again
    STEPS.forEach(s => { if (done.has(s) && !stepOk(s, false)) done.delete(s); });
    const firstOpen = STEPS.find(s => !done.has(s));
    if (STEPS.indexOf(current) > STEPS.indexOf(firstOpen)) current = firstOpen;

    const summary = id => {
      const g = n => (input(n)?.value || '').trim();
      if (id === 'contact') return esc(g('email'));
      if (id === 'delivery') {
        const c = input('country'); const cn = c.options[c.selectedIndex].textContent;
        return esc(g('first') + ' ' + g('last')) + '<br>' + esc(g('address')) + (g('address2') ? ', ' + esc(g('address2')) : '') + '<br>' + esc(g('postal').toUpperCase() + ' ' + g('city')) + ', ' + esc(cn);
      }
      return '';
    };
    const render = (focus) => {
      STEPS.forEach(id => {
        const s = sec(id), on = id === current, isDone = done.has(id) && !on;
        s.classList.toggle('is-current', on);
        s.classList.toggle('is-done', isDone);
        s.classList.toggle('is-later', !on && !isDone);
        $('.co-step__body', s).hidden = !on;
        const d = $('[data-done]', s); if (d) { d.hidden = !isDone; d.innerHTML = isDone ? summary(id) : ''; }
        const ed = $('[data-edit]', s); if (ed) { ed.hidden = !isDone; ed.setAttribute('aria-label', tr('Edit') + ' ' + tr(id === 'contact' ? 'Contact' : 'Delivery')); }
        const tab = $(`[data-tab="${id}"]`);
        if (tab) {
          tab.classList.toggle('is-current', on); tab.classList.toggle('is-done', done.has(id) && !on);
          tab.classList.toggle('is-link', done.has(id) && !on);
          if (on) tab.setAttribute('aria-current', 'step'); else tab.removeAttribute('aria-current');
        }
      });
      bar();
      if (focus) {
        const s = sec(current);
        if (!reduce) { s.classList.remove('is-enter'); void s.offsetWidth; s.classList.add('is-enter'); }
        const h = $('.co-step__h [tabindex]', s);
        h?.focus({ preventScroll: true });
        // keep the step's top in view, under the floating nav
        // only when the step's top is out of comfortable view (under the nav, or low on the screen)
        const y = s.getBoundingClientRect().top;
        if (y < 90 || y > innerHeight * 0.6) scrollTo({ top: y + scrollY - 140, behavior: reduce ? 'auto' : 'smooth' });
      }
      keep();
    };
    const go = (id, focus = true) => { current = id; render(focus); };
    const next = () => {
      if (!stepOk(current, true)) { form.querySelector('.co-step.is-current [aria-invalid="true"]')?.focus(); return; }
      done.add(current);
      go(STEPS.find(s => !done.has(s)) || 'payment');
    };

    // live checking: after a field is left once, it is checked as you type; the country re-checks the postal code
    form.addEventListener('focusout', e => { const n = e.target.name; if (RULES[n] && (e.target.value.trim() || e.target.dataset.touched)) { e.target.dataset.touched = '1'; check(n); } });
    form.addEventListener('input', e => { const n = e.target.name; if (RULES[n] && e.target.dataset.touched) check(n); keep(); });
    form.addEventListener('change', e => {
      if (e.target.name === 'country' && input('postal').value.trim()) check('postal');
      if (e.target.name === 'method') { $('#method-note').textContent = tr(NOTES[e.target.value]); }
      keep();
    });
    // Enter in a field moves on, as the step's own button would
    form.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || e.target.type === 'checkbox' || e.target.type === 'radio') return;
      if (current !== 'payment') { e.preventDefault(); next(); }
    });
    $$('[data-next]', form).forEach(b => b.addEventListener('click', next));
    $$('[data-edit]', form).forEach(b => b.addEventListener('click', () => go(b.dataset.edit)));
    $$('[data-tab]').forEach(t => t.addEventListener('click', () => { const id = t.dataset.tab; if (done.has(id) || id === current) go(id); }));

    const NOTES = {
      card: 'You enter your card on the secure payment page after you press Pay. Nothing is stored here.',
      applepay: 'Apple Pay opens after you press Pay. No card number to type.',
      mobilepay: 'You approve the amount in the MobilePay app after you press Pay.',
      klarna: 'Klarna opens after you press Pay, then brings you straight back here.',
      googlepay: 'Google Pay opens after you press Pay. No card number to type.',
    };
    const m0 = form.querySelector('input[name="method"]:checked'); if (m0) $('#method-note').textContent = tr(NOTES[m0.value]);

    /* -------------------------------------------------- place the (test) order */
    const msg = $('#co-msg');
    let placing = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (placing) return;
      msg.hidden = true;
      // every step again: one that no longer passes opens, with its fields marked
      const bad = STEPS.find(s => !stepOk(s, true));
      if (bad) { done.delete(bad); go(bad); setTimeout(() => form.querySelector('.co-step.is-current [aria-invalid="true"]')?.focus(), 60); return; }
      const items = readCart();
      if (!items.length) return;
      placing = true;
      const btns = $$('[data-pay-btn], [data-bar-btn]');
      btns.forEach(b => { b.disabled = true; b.classList.add('is-busy'); b.dataset.label = b.textContent; b.textContent = tr('Placing your order…'); });
      const sub = items.reduce((n, i) => n + unitOf(i) * (+i.qty || 1), 0);
      // every second lock at the second-lock price, and two locks ship free (as the cart counts it, shop-v2.js)
      const locks = items.reduce((n, i) => n + (isLock(i) ? (+i.qty || 1) : 0), 0);
      const disc = I.lockSum ? locks * I.P.lock - I.lockSum(locks) : 0;
      const ship = I.shipFor ? I.shipFor(locks) : sub > I.P.free ? 0 : I.P.ship;
      const g = n => (input(n)?.value || '').trim();
      const c = input('country');
      const d = new Date(), pad = n => String(n).padStart(2, '0');
      const no = 'LA-' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + Math.floor(1000 + Math.random() * 9000);
      const order = {
        no, at: d.toISOString(), lang: I.lang, demo: true,
        // the amounts as they were shown when the order was placed (euro, or kroner on the Danish page)
        lines: items.map(i => ({ name: isFlex(i) ? 'Flex-Mount' : 'Ring-Lock', finish: i.finish || '', qty: +i.qty || 1, img: thumb(i), unit: money(unitOf(i)), sum: money(unitOf(i) * (+i.qty || 1)) })),
        sub: money(sub), pair: disc ? '−' + money(disc) : null, ship: ship ? money(ship) : null, total: money(sub - disc + ship),
        count: items.reduce((n, i) => n + (+i.qty || 1), 0),
        to: { first: g('first'), last: g('last'), email: g('email'), address: g('address'), address2: g('address2'), postal: g('postal').toUpperCase(), city: g('city'), country: c.options[c.selectedIndex].textContent },
        method: (form.querySelector('input[name="method"]:checked') || {}).value || 'card',
      };
      // a short pause, as a real payment takes one; then the confirmation
      setTimeout(() => {
        ss.set(ORDER_KEY, order);
        try { localStorage.setItem(KEY, '[]'); } catch { /* private mode */ }
        dispatchEvent(new Event('laas-cart'));
        ss.del(FORM_KEY);
        try { sessionStorage.removeItem('laas-flex'); } catch { /* private mode */ }
        location.replace('order-confirmed.html' + (I.lang === 'da' ? '?lang=da' : ''));
      }, reduce ? 300 : 1100);
    });
    // Back from the confirmation, out of the browser's cache: the buttons are buttons again
    addEventListener('pageshow', e => {
      if (!e.persisted) return;
      placing = false;
      $$('[data-pay-btn], [data-bar-btn]').forEach(b => { b.classList.remove('is-busy'); });
      bar();
    });

    $('[data-promo]')?.addEventListener('click', () => {
      const m = $('#promo-msg'), val = $('.co-promo input').value.trim();
      m.hidden = false;
      m.textContent = val ? tr('Discount codes cannot be used in this demo checkout.') : tr('Type a code first.');
    });

    /* ---------------------------------------------- the bar at the bottom (phone) */
    const barEl = $('#co-bar'), barBtn = $('[data-bar-btn]');
    let inlineSeen = true;
    const phone = matchMedia('(max-width: 760px)');
    function bar() {
      if (!barEl) return;
      const empty = document.documentElement.classList.contains('is-empty');
      const pay = current === 'payment';
      if (!barBtn.classList.contains('is-busy')) {
        barBtn.textContent = pay ? ($('[data-pay-btn]')?.textContent || tr('Pay')) : tr(current === 'contact' ? 'Continue to delivery' : 'Continue to payment');
        barBtn.disabled = empty;
      }
      const show = phone.matches && !empty && !inlineSeen;
      if (show && barEl.hidden) { barEl.hidden = false; void barEl.offsetWidth; barEl.classList.add('is-on'); }
      else if (!show && !barEl.hidden) { barEl.classList.remove('is-on'); setTimeout(() => { if (!barEl.classList.contains('is-on')) barEl.hidden = true; }, reduce ? 0 : 250); }
    }
    barBtn?.addEventListener('click', () => { if (current === 'payment') form.requestSubmit(); else next(); });
    // the bar shows only while the current step's own button is out of view
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { es.forEach(e => { if (e.target.closest('.co-step.is-current')) inlineSeen = e.isIntersecting; }); bar(); });
      $$('.co-next, .co-pay-btn', form).forEach(b => io.observe(b));
      // when the step changes, look again at the new step's button
      const reobserve = () => { $$('.co-next, .co-pay-btn', form).forEach(b => { io.unobserve(b); io.observe(b); }); };
      form.addEventListener('click', e => { if (e.target.closest('[data-next], [data-edit]')) setTimeout(reobserve, 30); });
      $$('[data-tab]').forEach(t => t.addEventListener('click', () => setTimeout(reobserve, 30)));
    }
    phone.addEventListener?.('change', bar);
    // the totals change (another tab, the cart emptied): the bar's label follows
    document.addEventListener('laas-painted', bar);

    render(false);
  }

  /* ========================================================== confirmation */
  const oc = $('#oc');
  if (oc) {
    const o = ss.get(ORDER_KEY);
    const has = o && o.no && Array.isArray(o.lines);
    $('[data-oc-none]').hidden = !!has;
    oc.hidden = !has;
    if (has) {
      const set = (sel, html) => $$(sel).forEach(el => { el.innerHTML = html; });
      set('[data-oc-first]', esc(o.to.first || ''));
      set('[data-oc-no]', esc(o.no));
      set('[data-oc-email]', esc(o.to.email));
      set('[data-oc-sub]', esc(o.sub));
      $$('[data-oc-pair-row]').forEach(el => { el.hidden = !o.pair; });
      set('[data-oc-pair]', esc(o.pair || ''));
      set('[data-oc-ship]', o.ship ? esc(o.ship) : tr('Free'));
      set('[data-oc-total]', esc(o.total));
      set('[data-oc-count]', o.count + ' ' + tr(o.count === 1 ? 'item' : 'items'));
      set('[data-oc-to]', esc(o.to.first + ' ' + o.to.last) + '<br>' + esc(o.to.address) + (o.to.address2 ? ', ' + esc(o.to.address2) : '') + '<br>' + esc(o.to.postal + ' ' + o.to.city) + ', ' + esc(tr(o.to.country)));
      set('[data-oc-lines]', o.lines.map(l => `
        <li class="line">
          <span class="line__pic"><img src="${esc(l.img)}" alt="" width="96" height="96" decoding="async"></span>
          <div class="line__what"><p class="line__name">${esc(l.name)}</p><p class="line__meta">${l.finish ? esc(tr(l.finish)) + ' · ' : ''}${esc(l.unit)} × ${l.qty}</p></div>
          <p class="line__sum">${esc(l.sum)}</p>
        </li>`).join(''));
      // the page title says it too, for the tab and for a screen reader landing here
      const h = $('#oc-h'); setTimeout(() => h && h.focus({ preventScroll: true }), 80);
      oc.classList.add('is-in');
    }
  }
})();
