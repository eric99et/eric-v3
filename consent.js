// LAAS · cookie consent and Google Analytics 4 on laaslocks.com. Only the live pages load it: tools/to-live.py puts
// a short inline tag last in <head> that sets Google Consent Mode v2 to "denied" for everything, then this file.
// Basic consent mode: Google's script (gtag.js) is not even fetched until the visitor says yes to statistics, so
// nothing is sent to Google and no cookie is set before that. "Decline" is as easy as "Accept" (same button, first
// layer), the choice can be changed any time from "Cookies" in the footer, and it is asked again after 12 months.
// Statistics grants analytics_storage; marketing grants ad_storage, ad_user_data and ad_personalization.
// The choice lives in localStorage "laas-consent" ({v, s, m, t}): strictly necessary, so it needs no consent itself.
(() => {
  const GA = 'G-15GKG1M14Z';
  const KEY = 'laas-consent', VERSION = 1, YEAR = 365 * 864e5;
  const ok = (() => { try { return /(^|\.)laaslocks\.com$/.test(location.hostname) || localStorage.getItem('laas-ga-test') === '1'; } catch { return false; } })();
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };

  const da = /^da/i.test(document.documentElement.lang);
  const T = da ? {
    title: 'Cookies',
    text: 'Vi vil gerne bruge cookies fra Google Analytics til at se, hvordan siden bruges, og cookies til markedsføring til at måle vores annoncer. Kun hvis du siger ja.',
    more: 'Læs mere', privacy: '/da/privacy.html#cookies',
    yes: 'Accepter alle', no: 'Afvis', pick: 'Vælg selv', save: 'Gem valg',
    need: 'Nødvendige', needT: 'Kurv og sprog. Altid til.',
    stat: 'Statistik', statT: 'Google Analytics viser os, hvordan siden bruges.',
    mark: 'Markedsføring', markT: 'Lader Google Analytics dele data med Googles annoncetjenester, så vi kan måle vores annoncer.',
    link: 'Cookies'
  } : {
    title: 'Cookies',
    text: 'We would like to use Google Analytics cookies to see how the site is used, and marketing cookies to measure our ads. Only if you say yes.',
    more: 'Read more', privacy: '/privacy.html#cookies',
    yes: 'Accept all', no: 'Decline', pick: 'Choose', save: 'Save choices',
    need: 'Necessary', needT: 'Your cart and language. Always on.',
    stat: 'Statistics', statT: 'Google Analytics shows us how the site is used.',
    mark: 'Marketing', markT: 'Lets Google Analytics share data with Google’s advertising services, so we can measure our ads.',
    link: 'Cookies'
  };

  const read = () => {
    try {
      const c = JSON.parse(localStorage.getItem(KEY));
      return c && c.v === VERSION && Date.now() - c.t < YEAR ? c : null;
    } catch { return null; }
  };
  const write = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* private mode: asked again next page */ } };

  let loaded = false;
  // the visitor's choice into Consent Mode, and Google's script on the first yes to statistics
  const apply = c => {
    const g = v => v ? 'granted' : 'denied';
    window['ga-disable-' + GA] = !c.s;
    gtag('consent', 'update', { analytics_storage: g(c.s), ad_storage: g(c.m), ad_user_data: g(c.m), ad_personalization: g(c.m) });
    window.laasConsent.statistics = !!c.s;
    window.laasConsent.marketing = !!c.m;
    if (c.s && ok && !loaded) {
      loaded = true;
      gtag('js', new Date());
      gtag('config', GA);
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
      document.head.appendChild(s);
    }
    // a no after a yes: Google's cookies go (on this host and on .laaslocks.com, where gtag puts them)
    if (!c.s) document.cookie.split(';').map(x => x.split('=')[0].trim()).filter(n => /^_ga(_|$)|^_gid$|^_gat/.test(n)).forEach(n => {
      [location.hostname, '.laaslocks.com', ''].forEach(d => { document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : ''); });
    });
  };
  const choose = (s, m) => { const c = { v: VERSION, s: !!s, m: !!m, t: Date.now() }; write(c); apply(c); close(); };

  // the banner: its own styles, so it looks the same on the help centre's pages
  const CSS = `
#laas-consent{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:420px;margin:0;box-sizing:border-box;
  background:#fff;color:#202F30;border:1px solid rgba(32,47,48,.14);border-radius:20px;padding:20px 20px 16px;
  box-shadow:0 12px 40px rgba(32,47,48,.16);font:400 14px/1.5 Inter,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
#laas-consent *{box-sizing:border-box}
#laas-consent h2{margin:0 0 6px;font:600 16px/1.3 Poppins,system-ui,sans-serif;color:#202F30;letter-spacing:0}
#laas-consent p{margin:0 0 14px}
#laas-consent a{color:#1D5F63;text-decoration:underline;text-underline-offset:2px}
#laas-consent .lc-row{display:flex;gap:8px;flex-wrap:wrap}
#laas-consent button{font:500 14px/1 Poppins,system-ui,sans-serif;min-height:44px;padding:0 20px;border-radius:999px;cursor:pointer;
  border:1.5px solid #1D5F63;background:#1D5F63;color:#fff;flex:1 1 0;white-space:nowrap}
#laas-consent button:focus-visible{outline:2px solid #458A8E;outline-offset:2px}
#laas-consent .lc-pick{flex:0 0 auto;background:none;border-color:transparent;color:#1D5F63;padding:0 8px;text-decoration:underline;text-underline-offset:3px}
#laas-consent .lc-opts{display:none;margin:4px 0 14px;padding:0;list-style:none;border-top:1px solid rgba(32,47,48,.1)}
#laas-consent.is-open .lc-opts{display:block}
#laas-consent.is-open .lc-pick{display:none}
#laas-consent .lc-opts li{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(32,47,48,.1)}
#laas-consent .lc-opts b{display:block;font:500 14px/1.4 Poppins,system-ui,sans-serif}
#laas-consent .lc-opts span{display:block;color:#606A74;font-size:13px}
#laas-consent .lc-opts input{flex:0 0 auto;width:20px;height:20px;margin:2px 0 0;accent-color:#1D5F63}
#laas-consent .lc-save{display:none}
#laas-consent.is-open .lc-save{display:block}
#laas-consent.is-open .lc-main{display:none}
@media (min-width:600px){#laas-consent{left:24px;bottom:24px;right:auto;width:420px}}
@media print{#laas-consent{display:none}}`;

  let box = null, back = null;
  const close = () => {
    if (!box) return;
    box.remove(); box = null;
    if (back && document.contains(back)) back.focus({ preventScroll: true });
  };
  const open = (detail) => {
    if (box) return;
    back = document.activeElement;
    if (!document.getElementById('laas-consent-css')) {
      const st = document.createElement('style');
      st.id = 'laas-consent-css'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    const c = read() || { s: false, m: false };
    box = document.createElement('section');
    box.id = 'laas-consent';
    box.setAttribute('data-ga-skip', '');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-labelledby', 'laas-consent-h');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = `<h2 id="laas-consent-h">${T.title}</h2>
<p>${T.text} <a href="${T.privacy}">${T.more}</a></p>
<ul class="lc-opts">
  <li><input type="checkbox" checked disabled id="lc-n"><label for="lc-n"><b>${T.need}</b><span>${T.needT}</span></label></li>
  <li><input type="checkbox" id="lc-s"${c.s ? ' checked' : ''}><label for="lc-s"><b>${T.stat}</b><span>${T.statT}</span></label></li>
  <li><input type="checkbox" id="lc-m"${c.m ? ' checked' : ''}><label for="lc-m"><b>${T.mark}</b><span>${T.markT}</span></label></li>
</ul>
<div class="lc-row lc-main"><button type="button" data-lc="no">${T.no}</button><button type="button" data-lc="yes">${T.yes}</button><button type="button" class="lc-pick" data-lc="pick">${T.pick}</button></div>
<div class="lc-row lc-save"><button type="button" data-lc="save">${T.save}</button></div>`;
    if (detail) box.classList.add('is-open');
    box.addEventListener('click', e => {
      const b = e.target.closest('button[data-lc]');
      if (!b) return;
      const a = b.dataset.lc;
      if (a === 'yes') choose(true, true);
      else if (a === 'no') choose(false, false);
      else if (a === 'pick') { box.classList.add('is-open'); box.querySelector('#lc-s').focus(); }
      else if (a === 'save') choose(box.querySelector('#lc-s').checked, box.querySelector('#lc-m').checked);
    });
    document.body.appendChild(box);
    if (detail) box.querySelector('#lc-s').focus({ preventScroll: true });
  };

  window.laasConsent = { open: () => open(true), statistics: false, marketing: false };

  // "Cookies" in the footer, right after "Privacy"; any [data-consent-open] or a link to #cookie-settings opens it too
  const footerLink = () => {
    const p = [...document.querySelectorAll('footer a[href*="privacy"]')].pop();
    if (!p || document.querySelector('[data-consent-open]')) return;
    const a = document.createElement('a');
    a.href = '#cookie-settings'; a.setAttribute('data-consent-open', ''); a.textContent = T.link;
    const sep = p.previousSibling && / · $/.test(p.previousSibling.textContent || '') ? ' · ' : ' ';
    p.after(document.createTextNode(sep), a);
  };
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-consent-open], a[href$="#cookie-settings"]');
    if (!a) return;
    e.preventDefault();
    close(); open(true);
  });

  const start = () => {
    footerLink();
    const c = read();
    if (c) apply(c); else open(false);
    if (location.hash === '#cookie-settings') { close(); open(true); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
