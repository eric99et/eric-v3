// LAAS · Ring-Lock
// The lock on this page is the studio render of the real Ring-Lock (Drive · Website material, v8, 4500 px):
// six angles in each of the three finishes (images/lock). One lock, fixed behind everything that scrolls,
// moves from chapter to chapter: every section carries its place, size, tilt and angle in data-key, and the
// scroll blends from one to the next. The drawings in the stage (the seal, the tyre, the map) are centred on it.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const phone = () => innerWidth <= 760;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

/* ------------------------------------------------------------- language */
// English is written in the page; Danish replaces each text node (and a few labels) before anything else runs.
const DA = {
  'The keyless ring lock for your bike.': 'Den nøglefri ringlås til din cykel.', 'Skip to content': 'Spring til indhold', 'Scroll down': 'Rul ned', 'Scroll': 'Rul', 'Menu': 'Menu', 'Close': 'Luk',
  'Keyless': 'Nøglefri', 'Find My': 'Find My', 'Varefakta': 'Varefakta', 'Will it fit?': 'Passer den?', 'Fit': 'Pasform', 'Buy': 'Køb', 'FAQ': 'FAQ',
  'Ring-Lock': 'Ring-Lock', 'Shipping': 'Fragt', 'Support': 'Support', 'Yours': 'Din lås', 'Returns': 'Returnering', 'Cart': 'Kurv',
  // the orbit and the seal
  'KEYLESS · INSURANCE-APPROVED IN DENMARK · FITS MOST BIKES · €129 ·': 'NØGLEFRI · FORSIKRINGSGODKENDT I DANMARK · PASSER TIL DE FLESTE CYKLER · 999 KR ·',
  'VAREFAKTA · VK 37868 · VF 5029:4 · INSURANCE-APPROVED IN DENMARK ·': 'VAREFAKTA · VK 37868 · VF 5029:4 · FORSIKRINGSGODKENDT I DANMARK ·',
  '63 mm clearance': '63 mm frigang',
  // the poster
  'No key.': 'Ingen nøgle.', 'No cable.': 'Intet kabel.', 'No key. No cable. One ring of stainless steel that stays on your bike.': 'Ingen nøgle. Intet kabel. Én ring af rustfrit stål, der bliver på din cykel.',
  'One ring of stainless steel that stays on your bike. Nothing to carry, nothing to forget.': 'Én ring af rustfrit stål, der bliver på din cykel. Intet at bære på, intet at glemme.',
  'Opens with your phone': 'Åbner med din telefon', 'Insurance-approved in Denmark': 'Forsikringsgodkendt i Danmark', 'Fits most bikes': 'Passer til de fleste cykler', '57 days to return it': '57 dage til at returnere den',
  // 01 keyless
  'Your phone is the key.': 'Din telefon er nøglen.',
  'One tap in the LAAS app and the 9 mm hardened-steel bolt slides open. Push the bolt in and it locks with a click.': 'Ét tryk i LAAS-appen, og den 9 mm hærdede stålbolt glider op. Skub bolten i, så låser den med et klik.',
  'Remove from cart': 'Fjern fra kurven', 'Check out': 'Gå til kassen', 'Decrease quantity': 'Færre', 'Near': 'Tæt på', 'Locked': 'Låst', 'Unlocked': 'Låst op', 'Unlock': 'Lås op', 'Lock': 'Lås', 'My bikes': 'Mine cykler', 'Steel lock': 'Stållås', 'Copper lock': 'Kobberlås', 'Searching': 'Søger', 'One-time key · Bluetooth': 'Engangsnøgle · Bluetooth',
  // 02 find my: Apple's trademarks are never translated (Apple Find My guidelines p.13)
  'After setup, you can locate your Ring-Lock in the Apple Find My app on your iPhone, iPad or Mac.': 'Når den er sat op, kan du finde din Ring-Lock i Apple Find My-appen på din iPhone, iPad eller Mac.',
  'To use the Apple Find My app to locate this item, the latest version of iOS, iPadOS, or macOS is recommended.': 'For at bruge Apple Find My-appen til at finde denne genstand anbefales den nyeste version af iOS, iPadOS eller macOS.',
  'Nørrebro · Now': 'Nørrebro · Nu', 'Nørrebro · Now ·': 'Nørrebro · Nu ·',
  // 03 varefakta
  'Insurance‑approved in Denmark.': 'Forsikrings­godkendt i Danmark.',
  'The only electronic app-controlled ring lock on': 'Den eneste elektroniske app-styrede ringlås på', 'Varefakta’s public list': 'Varefaktas offentlige liste', '(VK 37868). The certificate is in the box.': '(VK 37868). Certifikatet ligger i æsken.',
  'Listing': 'Liste', 'Certificate': 'Certifikat',
  'Lock certificate': 'Låsecertifikat', 'Låseattest · Example': 'Låseattest · Eksempel', 'Lock': 'Lås', 'Lock ID': 'Låse-ID', 'Frame no.': 'Stel nr.', 'In the box': 'I æsken',
  // 04 fit
  'Will it fit my bike?': 'Passer den til min cykel?', 'Road': 'Racer', 'City': 'Bycykel', 'E-bike': 'Elcykel', 'Cargo': 'Ladcykel', 'Fat bike': 'Fatbike',
  'Two things decide it: your tyre, and whether your frame has holes for a frame lock.': 'To ting afgør det: dit dæk, og om dit stel har huller til en ringlås.', 'Your bike': 'Din cykel',
  'Tyres up to 60 mm fit.': 'Dæk op til 60 mm passer.', 'The width is on the side of the tyre: in 42-622, the 42.': 'Bredden står på siden af dækket: i 42-622 er det 42.',
  'Tyre width': 'Dækbredde', 'Up to 35 mm': 'Op til 35 mm', 'Over 60 mm': 'Over 60 mm', 'tyre': 'dæk', 'Holes for a frame lock?': 'Huller til en ringlås?', 'Yes': 'Ja', 'No': 'Nej',
  'It is printed on the side of the tyre: in 42-622, the 42 is the width in mm.': 'Det står på siden af dækket: i 42-622 er 42 bredden i mm.',
  'Two small threaded holes on the frame, either side of the rear wheel, just below the saddle.': 'To små gevindhuller i stellet, på hver side af baghjulet, lige under sadlen.',
  'It fits.': 'Den passer.', 'Too wide.': 'For bredt.', 'It fits, with the Flex Mount.': 'Den passer, med Flex Mount.',
  'The screws are in the box.': 'Skruerne ligger i æsken.',
  'The ring takes tyres up to 60 mm.': 'Ringen tager dæk op til 60 mm.',
  'Add the Flex Mount (€9.99) in the basket. It holds the lock on a frame without holes.': 'Tilføj Flex Mount (75 kr.) i kurven. Den holder låsen på et stel uden huller.',
  // 05 buy (the finish names stay Steel, Copper and Black, as in the Drive copy)
  'Steel. Copper. Black.': 'Steel. Copper. Black.', 'Same lock, same price, three finishes. Pick the one that suits your bike.': 'Samme lås, samme pris, tre udgaver. Vælg den, der passer til din cykel.',
  'Drag to turn': 'Træk for at dreje', 'Intro price until 31 Dec 2026': 'Introduktionspris til 31. dec. 2026',
  '57-day returns': '57 dages returret', 'Day trial': 'dages prøvetid', 'Promise': 'Løfte', 'Read our reviews': 'Læs vores anmeldelser', 'Prepaid return label in the box': 'Forudbetalt returlabel i æsken', 'Free shipping over €250': 'Gratis fragt over 1.900 kr', '6 reviews': '6 anmeldelser', 'LAAS on Trustpilot: 3.8 out of 5 from 6 reviews': 'LAAS på Trustpilot: 3,8 ud af 5 fra 6 anmeldelser', 'Ringo W., Germany': 'Ringo W., Tyskland', 'D. A., Switzerland': 'D. A., Schweiz', 'R. I., United Kingdom': 'R. I., Storbritannien', 'Two-year right to complain': '2 års reklamationsret',
  // 06 faq
  'Questions, answered.': 'Spørgsmål og svar.', 'Question not here? Call us on': 'Finder du ikke dit spørgsmål? Ring til os på',
  'Will my insurance accept it?': 'Godkender mit forsikringsselskab den?',
  'In Denmark, the Ring-Lock is insurance-approved: Varefakta VK 37868. Most Danish insurers ask for a Varefakta-approved lock and a lock certificate, and the certificate is in the box. Check your own policy. Outside Denmark, check what your policy asks for first.': 'I Danmark er Ring-Lock forsikringsgodkendt: Varefakta VK 37868. De fleste danske forsikringsselskaber kræver en Varefakta-godkendt lås og et låsecertifikat, og certifikatet ligger i æsken. Tjek din egen police. Uden for Danmark: tjek først, hvad din police kræver.',
  'Most bikes, cargo bikes and e-bikes too: tyres up to 60 mm, mount spacing 75 to 100 mm. Not fat bikes. Frame holes? The mounting screws are in the box. No holes? The Flex Mount, €9.99.': 'De fleste cykler, også ladcykler og elcykler: dæk op til 60 mm, monteringsafstand 75 til 100 mm. Ikke fatbikes. Huller i stellet? Monteringsskruerne ligger i æsken. Ingen huller? Flex Mount, 75 kr.',
  'What if the battery runs low?': 'Hvad hvis batteriet er ved at løbe tør?',
  'About six months per charge. A full charge over USB-C takes 90 minutes, and any USB-C cable works.': 'Cirka seks måneder pr. opladning. En fuld opladning via USB-C tager 90 minutter, og alle USB-C-kabler virker.',
  'Does it work with Android?': 'Virker den med Android?', 'Yes. The LAAS app is on the App Store and Google Play.': 'Ja. LAAS-appen findes i App Store og Google Play.',
  'How secure is it?': 'Hvor sikker er den?',
  '9 mm of hardened steel. Every unlock uses a one-time key over Bluetooth, so a recorded signal cannot be replayed.': '9 mm hærdet stål. Hver oplåsning bruger en engangsnøgle via Bluetooth, så et optaget signal ikke kan afspilles igen.',
  'How fast does it ship, and what does it cost?': 'Hvor hurtigt sendes den, og hvad koster det?',
  'It ships in 1–2 working days. Shipping is €9, and free on orders over €250. Questions about an order? Write to': 'Den sendes inden for 1–2 hverdage. Fragten koster 75 kr. og er gratis ved køb over 1.900 kr. Spørgsmål om en ordre? Skriv til',
  'How do returns and the right to complain work?': 'Hvordan fungerer returnering og reklamationsret?',
  'Changed your mind? Tell us at': 'Fortryder du? Giv os besked på',
  'within 57 days of delivery, then hand the lock to the carrier with the prepaid return label. You get your money back, shipping included, within 14 days of telling us, once the lock is back with us. You also have the two-year right to complain (reklamationsret) under Danish law, counted from delivery.': 'senest 57 dage efter levering, og aflever låsen til fragtfirmaet med den forudbetalte returlabel. Du får pengene tilbage, inklusive fragt, inden for 14 dage efter din besked, når låsen er tilbage hos os. Du har også to års reklamationsret efter dansk lov, regnet fra levering.',
  'Terms of sale': 'Handelsbetingelser', 'Privacy': 'Privatliv',
  // the footer
  '© 2026 LAAS ApS · Designed in Copenhagen': '© 2026 LAAS ApS · Designet i København',
  'Apple, Find My, iPhone, iPad, iPadOS, Mac and macOS are trademarks of Apple Inc., registered in the U.S. and other countries and regions. IOS is a trademark or registered trademark of Cisco in the U.S. and other countries and is used under license.': 'Apple, Find My, iPhone, iPad, iPadOS, Mac og macOS er varemærker tilhørende Apple Inc., registreret i USA og andre lande og områder. IOS er et varemærke eller registreret varemærke tilhørende Cisco i USA og andre lande og bruges under licens.',
  // labels a screen reader reads out
  'Turn left': 'Drej til venstre', 'Turn right': 'Drej til højre', 'Decrease quantity': 'Færre', 'Increase quantity': 'Flere', 'Accepted payment methods': 'Betalingsmetoder',
  'What you are covered by': 'Det er du dækket af', 'Your bike': 'Din cykel', 'Chapters': 'Kapitler', 'Sections': 'Sektioner', 'Language': 'Sprog', 'LAAS, back to the top': 'LAAS, til toppen',
  'LAAS on Instagram': 'LAAS på Instagram', 'LAAS on Facebook': 'LAAS på Facebook', 'Turn the lock: drag, or use the arrow keys': 'Drej låsen: træk, eller brug piletasterne', 'Footer': 'Sidefod',
};
const lang = (() => { const q = new URLSearchParams(location.search).get('lang'); try { if (q) localStorage.setItem('laas-lang', q); return q || localStorage.getItem('laas-lang') || 'en'; } catch { return q || 'en'; } })();
const t = en => (lang === 'da' && DA[en]) || en;
if (lang === 'da') {
  document.documentElement.lang = 'da'; document.title = 'LAAS Ring-Lock · Nøglefri cykellås';
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; let n; while ((n = w.nextNode())) if (!n.parentElement.closest('script,style')) nodes.push(n);
  nodes.forEach(n => { const key = n.nodeValue.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); if (DA[key]) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), DA[key]); });
  // prices in kroner, as the Danish cart and checkout show them (i18n.js)
  $$('.nav__price, .price-line strong').forEach(el => { el.textContent = '999 kr'; });
  $$('[aria-label]').forEach(el => { const v = DA[el.getAttribute('aria-label')]; if (v) el.setAttribute('aria-label', v); });
}
$$('.lang a').forEach(a => a.setAttribute('aria-current', String(a.dataset.lang === lang)));

/* ------------------------------------------------ headlines, word by word */
$$('.split').forEach(el => {
  // split on ordinary spaces only: a no-break space keeps 'Find My' together; <br> survives
  const tmp = document.createElement('div');
  const lines = el.innerHTML.split(/<br\s*\/?>/i).map(h => { tmp.innerHTML = h; return tmp.textContent.trim().replace(/[ \t\n\r]+/g, ' '); });
  let i = 0;
  const html = lines.map(line => line.split(' ').map(w => `<span class="w" aria-hidden="true"><span style="--i:${i++}">${w}</span></span>`).join(' ')).join('<br>');
  el.innerHTML = `<span class="visually-hidden">${lines.join(' ')}</span>${html}`;
  el.style.setProperty('--n', i - 1);
});

/* ------------------------------------------------------- in-page links */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = id === 'top' ? document.body : document.getElementById(id);
  if (!el) return;
  e.preventDefault(); closeMenu();
  // a question linked by name (#shipping) opens, and the page glides to its chapter (the same glide as a scroll push)
  if (el.matches('details')) el.open = true;
  const to = id === 'top' ? 0 : landing(el);
  // the keyboard and a screen reader follow the link too (the skip link, Shipping, Returns)
  const f = el.matches('details') ? el.querySelector('summary') : (el.closest('main > section, main > footer') || el);
  if (f && f !== document.body) { if (!f.matches('summary, a, button')) f.tabIndex = -1; f.focus({ preventScroll: true }); }
  if (reduce) { scrollTo(0, to); return; }
  Object.assign(glider, { on: true, from: scrollY, to, t0: performance.now(), dur: Math.min(1600, 700 + Math.abs(to - scrollY) * 0.12) });
});

/* ------------------------------------------------------------------ loader */
const loaderEl = $('#loader'), pctEl = $('#loader-pct'), ringFill = $('#loader-fill');
const progress = { img: 0, glb: 0, shown: 0, done: false };
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { progress.img = 1; });
let loadedAt = 0;
function tickLoader(dt) {
  if (progress.done) return;
  const target = progress.img * 0.25 + progress.glb * 0.75;
  progress.shown = Math.min(target, progress.shown + dt * (target >= 1 ? 2.6 : 1.4));
  ringFill.style.transform = `scaleX(${progress.shown.toFixed(4)})`;
  pctEl.textContent = String(Math.round(progress.shown * 100)).padStart(3, '0');
  if (progress.shown >= 0.999 && !loadedAt) { loadedAt = performance.now(); setTimeout(reveal, 220); }
}
function reveal() {
  if (progress.done) return;
  progress.done = true;
  root.classList.remove('is-loading'); root.classList.add('is-loaded');
  scrollTo(0, 0);
  intro.t = performance.now() + 200;
  goToHash();
}
// where a link lands: the top of the chapter, or, for a question in a chapter taller than the screen, low enough
// that the question and its answer are in view
function landing(el) {
  const sec = el.closest('main > section, main > footer') || el;
  const top = Math.round(sec.getBoundingClientRect().top + scrollY);
  if (!el.matches('details')) return top;
  const maxY = document.documentElement.scrollHeight - innerHeight;
  const q = Math.round(el.getBoundingClientRect().top + scrollY) - 110;
  return clamp(Math.max(top, q), 0, Math.min(maxY, top + Math.max(0, sec.offsetHeight - innerHeight)));
}
// arriving from another page with #faq or #shipping: go straight there (a question opens). Runs from reveal(), and
// from the 9 s safety net when the loader never finished; once now and once after the answer has opened
function goToHash() {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.closest('main')) {
    if (target.matches('details')) target.open = true;
    const go = () => scrollTo(0, landing(target));
    go(); requestAnimationFrame(go); setTimeout(go, 520);
  }
}
// never hold anyone back: show the page after 7 s whatever has arrived
setTimeout(() => { progress.img = 1; progress.glb = 1; }, 7000);

/* --------------------------------------------------------------- the lock */
const stage = $('#stage'), sheetEl = $('#sheet');
// the render's own geometry (measured on the front view): the ring's centre and outer radius as shares of the frame
const RING = { cx: 0.4997, cy: 0.5093, r: 0.4314 };
// every other view: the centre and half the largest extent of the lock in its frame, so each angle stands as big
const GEO = { '00': { cx: 0.5128, cy: 0.4881, r: 0.3787 }, '01': RING, '02': { cx: 0.4844, cy: 0.4878, r: 0.3803 },
  '03': { cx: 0.5228, cy: 0.4872, r: 0.3972 }, '04': { cx: 0.5109, cy: 0.4866, r: 0.3884 }, '05': { cx: 0.4862, cy: 0.48, r: 0.3912 } };
// in turning order (front, a little turned, hero, side, from behind, from above), starting on the hero view
const ANGLES = ['00', '03', '04', '05', '01', '02'];
const lockEl = document.createElement('div');
lockEl.className = 'lockimg';
lockEl.innerHTML = '<img alt="" decoding="async" draggable="false"><img alt="" decoding="async" draggable="false">';
stage.prepend(lockEl);
const layers = $$('img', lockEl).map(img => ({ img, src: '' }));
let res = Math.min(innerWidth, innerHeight) * Math.min(devicePixelRatio || 1, 2) > 900 ? 1600 : 800;
const srcOf = (f, a) => `images/lock/${f}-${a}-${res}.webp`;
const cache = new Map();
const fetchImg = src => cache.get(src) || (cache.set(src, new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(src); i.onerror = no; i.src = src; })), cache.get(src));
let finish = 'steel', lockReady = false;
const intro = { t: -1 };
const swap = { sweep: 0 };
function show(f) {
  finish = f;
  stage.dataset.metal = f; $('#buy').dataset.metal = f;
  // the angles in view first, then the rest of the turn
  return Promise.all(['00', '01'].map(a => fetchImg(srcOf(f, a)))).then(() => { ANGLES.forEach(a => fetchImg(srcOf(f, a)).catch(() => {})); });
}
// steel first: it is the bestseller and the one the page opens on
{
  let n = 0;
  const first = ['00', '01'].map(a => fetchImg(srcOf('steel', a)).then(() => { progress.glb = ++n / 2; }));
  Promise.all(first).then(() => { lockReady = true; progress.glb = 1; show('steel'); }, () => { progress.glb = 1; lockEl.remove(); });
}
const loadOthers = () => ['copper', 'black'].forEach(f => fetchImg(srcOf(f, '00')).catch(() => {}));
$$('[data-finish]').forEach(b => ['pointerenter', 'focus', 'touchstart'].forEach(ev => b.addEventListener(ev, loadOthers, { passive: true })));

/* ---------------------------------------------------------------- the poses */
const DEF = { hide: 0, bike: 0, mpx: 0, yaw: 0, pitch: 0, roll: 0, size: 0.42, x: 0, y: 0, fade: 0, drag: 0, free: 0, logo: 0, orbit: 0, radar: 0, seal: 0, fit: 0 };
const KEYS = Object.keys(DEF);
const sections = $$('main > section, main > footer');
const poses = sections.map(s => ({ ...DEF, ...JSON.parse(s.dataset.key || '{}') }));
const anchors = sections;
const slots = sections.map(s => $('.slot', s) || s);
const keylessIdx = sections.findIndex(s => s.hasAttribute('data-keyless'));
const productIdx = sections.findIndex(s => s.id === 'buy');
const findIdx = sections.findIndex(s => s.id === 'findmy');
const cur = { ...poses[0] };
function flash() {
  const el = $('#click'); if (!el) return;
  el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on');
}
const user = { angle: 0, taught: false, spin: 0, goal: 0, vel: 0, dragging: false, lockWant: 1, lock: 1, roll: 0, px: 0, py: 0, mx: 0, my: 0 };

let W = innerWidth, H = innerHeight;
function resize() {
  W = innerWidth; H = innerHeight;
  // 1600 px renders once the lock can be drawn larger than about 800 device pixels
  res = Math.min(W, H) * Math.min(devicePixelRatio || 1, 2) > 900 ? 1600 : 800;
}
addEventListener('resize', resize); resize();
// where the route ends inside the drawn phone (the lock is placed there)
const fpin = { x: 0, y: 0 };
function measurePin() {
  const f = $('.fmp'); if (!f) return;
  const Wp = f.offsetWidth, Hp = f.offsetHeight, pad = Hp * 0.012, ws = Wp - 2 * pad, hs = Hp - 2 * pad;
  const k = Math.max(ws / 520, hs / 1130), ox = (ws - 520 * k) / 2;
  fpin.x = pad + ox + (837.4 - 590) * k; fpin.y = pad + (598 - 300) * k;
  f.style.setProperty('--fpx', fpin.x.toFixed(1) + 'px'); f.style.setProperty('--fpy', fpin.y.toFixed(1) + 'px');
}
addEventListener('resize', measurePin); measurePin();
// the map is drawn wide; a phone gets its own crop, with the bike in it
/* -------------------------------------------------------- chrome per frame */
const navLinks = $$('[data-nav]'), railLinks = $$('[data-rail]'), menuLinks = $$('.menu nav a');
const heroSec = $('.hero'), heroFront = $('.hero__pin'), heroCopy = $('.hero__pin'), heroTitle = $('.hero__pin'), rail = $('#rail');
const hero = { p: 0, e: 0, lock: 1, on: false, fadeIn: 0 };
// the opening glide (see the end of the file): stepped from the render loop, before anything is measured
const glider = { on: false, from: 0, to: 0, t0: 0, dur: 2600, coolUntil: 0 };
// sine in-out: no lurch at the start, no rush in the middle
const glideEase = x => -(Math.cos(Math.PI * x) - 1) / 2;
function glideTick(now) {
  if (!glider.on) return;
  const x = clamp((now - glider.t0) / glider.dur);
  scrollTo({ top: glider.from + (glider.to - glider.from) * glideEase(x), behavior: 'instant' });
  if (x >= 1) { glider.on = false; glider.coolUntil = Math.max(glider.coolUntil, now + 380); }
}

/* ------------------------------------------------- the pixel wordmark
   The supplied LAAS artwork, sampled onto a grid of square pixels (a deliberate, owner-approved exception to the
   logo rules, 9 Oct). Scrolling, every pixel is pulled into the same letter of the laser-marked logo on the lock. */
const pxCanvas = $('#px'), pctx = pxCanvas.getContext('2d');
const logoRect = { cx: 0, cy: 0, w: 0, h: 0, ang: 0, ok: false };
const MARK_PATHS = [...document.querySelectorAll('#laas-mark path')].map(p => new Path2D(p.getAttribute('d')));
const MARK_W = 343.43, MARK_H = 88.44, MARK_X = 966, MARK_Y = 758.556;
const px = { cells: [], cell: 10, w: 0, h: 0, x: 0, y: 0, dpr: 1, built: '' };
const PX_TINT = '#9BCDD0', PX_CHALK = '#ECECEA';
function buildPixels() {
  const key = W + 'x' + H;
  if (px.built === key) return;
  px.built = key;
  px.dpr = Math.min(devicePixelRatio || 1, 2);
  pxCanvas.width = Math.round(W * px.dpr); pxCanvas.height = Math.round(H * px.dpr);
  // the wordmark as wide as the screen allows, above the copy
  px.w = phone() ? W * 0.9 : Math.min(W * 0.84, H * 2.6);
  px.h = px.w * MARK_H / MARK_W;
  px.x = (W - px.w) / 2; px.y = H * 0.47 - px.h / 2;
  px.cell = Math.max(5, Math.round(px.w / (phone() ? 58 : 92)));
  // rasterise the artwork once, then read how much of each cell it covers
  const cols = Math.ceil(px.w / px.cell), rows = Math.ceil(px.h / px.cell), ss = 4;
  const off = document.createElement('canvas'); off.width = cols * ss; off.height = rows * ss;
  const o = off.getContext('2d');
  // one supersampled block per cell: mark units → cells → samples
  o.setTransform(ss / px.cell * px.w / MARK_W, 0, 0, ss / px.cell * px.h / MARK_H, 0, 0);
  o.translate(-MARK_X, -MARK_Y);
  o.fillStyle = '#000'; MARK_PATHS.forEach(p => o.fill(p));
  const data = o.getImageData(0, 0, off.width, off.height).data;
  px.cells = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let a = 0;
    for (let y = 0; y < ss; y++) for (let x = 0; x < ss; x++) a += data[((r * ss + y) * off.width + c * ss + x) * 4 + 3];
    const cov = a / (ss * ss * 255);
    if (cov < 0.12) continue;
    const hx = px.x + (c + 0.5) * px.cell, hy = px.y + (r + 0.5) * px.cell;
    px.cells.push({ hx, hy, u: (hx - px.x) / px.w, v: (hy - px.y) / px.h, cov: Math.min(1, cov * 1.15), ph: rnd() * 6.28, sw: rnd() < 0.5 ? -1 : 1, tint: rnd() < 0.07, d: rnd() });
  }
}
addEventListener('resize', () => { px.built = ''; });
// decode the rider frames up front, so no frame of the glide waits on an image
$$('.hero__shot img').forEach(img => img.decode?.().catch(() => {}));
const pxPointer = { x: -1e4, y: -1e4 };
addEventListener('pointermove', e => { pxPointer.x = e.clientX; pxPointer.y = e.clientY; }, { passive: true });
function drawPixels(now) {
  const t = reduce ? 1 : clamp((hero.p - 0.04) / 0.78);
  const show = hero.on && root.classList.contains('is-loaded');
  setVar(root, '--pxo', show ? '1' : '0');
  if (!show) return;
  buildPixels();
  const ctx = pctx, k = px.dpr, time = now / 1000;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.clearRect(0, 0, W, H);
  // where the logo on the lock is (until the lock has drawn once, its resting place in the macro)
  const R = logoRect.ok ? logoRect : { cx: W / 2, cy: H / 2, w: phone() ? W * 0.8 : W * 0.46, h: (phone() ? W * 0.8 : W * 0.46) * MARK_H / MARK_W, ang: 0.07 };
  const ca = Math.cos(R.ang), sa = Math.sin(R.ang), tcell = px.cell * R.w / px.w;
  for (const p of px.cells) {
    // each pixel leaves a little after its neighbours nearer the middle, and accelerates in, like being pulled
    const start = 0.28 * Math.hypot(p.u - 0.5, (p.v - 0.5) * 0.4) + 0.12 * p.d;
    const q = clamp((t - start) / 0.62), e = q * q * q * (q * (6 * q - 15) + 10);
    const lu = (p.u - 0.5) * R.w, lv = (p.v - 0.5) * R.h;
    const tx = R.cx + lu * ca - lv * sa, ty = R.cy + lu * sa + lv * ca;
    // a slight swirl on the way in
    const dxv = tx - p.hx, dyv = ty - p.hy, sw = Math.sin(Math.PI * e) * 0.12 * p.sw;
    let x = p.hx + dxv * e - dyv * sw, y = p.hy + dyv * e + dxv * sw;
    // at rest the pixels breathe, and step aside for the pointer
    let size = px.cell * (0.42 + 0.5 * p.cov);
    if (t <= 0.001 && !reduce) {
      size *= 0.9 + 0.1 * Math.sin(time * 1.6 + p.ph);
      const ddx = x - pxPointer.x, ddy = y - pxPointer.y, dd = Math.hypot(ddx, ddy), rad = px.cell * 7;
      if (dd < rad) { const f = (1 - dd / rad) ** 2 * px.cell * 1.6; x += ddx / (dd || 1) * f; y += ddy / (dd || 1) * f; }
    }
    size = size + (tcell * 0.9 - size) * e;
    const a = 1 - smooth(clamp((e - 0.72) / 0.28));
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.tint ? PX_TINT : PX_CHALK;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}
// the closed window: a card in the right column, clear of the title (on a phone, above it)
const card0 = { x: 0, y: 0, w: 300, h: 380 };
function placeCard(m) {
  const t = m.titleR, gut = m.copyR.left;
  if (phone()) {
    const top = 84, bot = m.copyR.top - 18;
    card0.h = Math.max(200, Math.min(bot - top, (W - 2 * gut) * 1.15));
    card0.w = Math.min(W - 2 * gut, card0.h * 0.82);
    card0.x = W / 2; card0.y = top + (bot - top) / 2;
  } else {
    const right = W - gut - W * 0.04, left = t.right + 56;
    card0.h = Math.min(H * 0.66, 560);
    card0.w = Math.max(220, Math.min(card0.h * 0.8, right - left, W * 0.3));
    card0.h = Math.min(card0.h, card0.w * 1.25);
    card0.x = right - card0.w / 2; card0.y = H / 2 + 12;
  }
}
const radar = $('#radar'), chipText = $('#chip-text'), fmp = $('.fmp'), fmGhost = $('.fm-ghost');
const route = $('#map-route');
let lastNav = '', lastChip = '';
const mixHex = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(lerp(parseInt(a.substr(i, 2), 16), parseInt(b.substr(i, 2), 16), t)).toString(16).padStart(2, '0')).join('');
const setVar = (el, k, v) => { if (el['_' + k] !== v) { el['_' + k] = v; el.style.setProperty(k, v); } };

// every read of layout happens here, once per frame, before anything is written
function measure() {
  const m = {
    rects: sections.map(s => s.getBoundingClientRect()),
    // a chapter holds the middle while its top sits at the top of the screen (phones make some taller than one screen)
    // the hero is taller than the screen (its window opens first): it holds the middle until its last screen
    centers: anchors.map(a => { const r = a.getBoundingClientRect(); return a === heroSec ? r.bottom - H / 2 : r.top + Math.min(r.height, H) / 2; }),
    slotR: slots.map(a => a.getBoundingClientRect()),
    // the room between the nav and the cover type, where the macro lives
    fmpW: fmp ? fmp.offsetWidth : 0,
    ghostR: fmGhost ? fmGhost.getBoundingClientRect() : null,
    heroCopyTop: heroCopy.getBoundingClientRect().top - heroFront.getBoundingClientRect().top,
    copyR: heroCopy.getBoundingClientRect(),
    titleR: heroTitle.getBoundingClientRect(),
    widths: slots.map(a => a.offsetWidth),
    maxY: document.documentElement.scrollHeight - H,
    sy: scrollY,
  };
  // find my: the lock lies where the route on the map ends
  if (findIdx >= 0 && route) {
    const L = route.getTotalLength(), p = route.getPointAtLength(L), ctm = route.getScreenCTM();
    if (ctm) m.pin = { x: p.x * ctm.a + p.y * ctm.c + ctm.e, y: p.x * ctm.b + p.y * ctm.d + ctm.f };
  }
  return m;
}

function frameChrome(m) {
  const { rects } = m;
  const mid = H / 2;
  // which section owns the middle of the screen
  let ci = 0;
  rects.forEach((r, i) => { if (r.top <= mid) ci = i; });
  const s = sections[ci];
  const nav = s.dataset.navSection;
  if (nav !== lastNav) {
    lastNav = nav;
    // in the buy chapter the Buy pill in the nav would only repeat the button on the page
    root.classList.toggle('in-buy', nav === 'buy');
    navLinks.forEach(a => a.setAttribute('aria-current', String(a.dataset.nav === nav)));
    railLinks.forEach(a => a.setAttribute('aria-current', String(a.dataset.rail === nav)));
    menuLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + nav)));
  }
  // phones: the lock sits in its chapter's own window, sized to it
  if (phone()) rects.forEach((r, i) => {
    const P = poses[i], sr = m.slotR[i];
    if (sections[i] === heroSec) {
      P.mx = 0; P.my = 0; P.mpx = W * 0.84;
    } else if (sections[i].matches('.void') && slots[i] !== sections[i] && i !== findIdx) {
      P.mx = (sr.left + sr.width / 2 - W / 2) / H;
      // once the chapter scrolls past its stop, the lock goes up with its window instead of hanging over the type
      P.my = (sr.top - r.top + sr.height / 2 - H / 2 + Math.min(0, r.top)) / H;
      const sec = sections[i], k = sec.matches('.void--macro') ? [0.8, 0.78] : sec.matches('.void--seal') ? [0.6, 0.56] : sec.matches('.void--fit') ? [0.56, 0.5] : sec.matches('.void--intro') ? [0.92, 0.72] : [0.92, 0.86];
      P.mpx = Math.min(sr.height * k[0], W * k[1]);
    } else P.mpx = Math.min(W * 0.84, H * 0.47) * ((P.msize ?? P.size) / 0.44);
  });
  rects.forEach((r, i) => {
    const sec = sections[i];
    if (sec === heroSec) return;
    const rv = reduce ? 1 : clamp((H * 0.9 - r.top) / (H * 0.62));
    const c = r.top + r.height / 2;
    const xv = reduce ? 0 : clamp((H * 0.18 - c) / (H * 0.25));
    setVar(sec, '--r', rv.toFixed(3));
    setVar(sec, '--x', xv.toFixed(3));
  });
  // buy, desktop: the lock sits in the middle of its own column, a size that leaves room round it
  if (!phone() && productIdx >= 0) {
    const sr = m.slotR[productIdx], r = rects[productIdx];
    poses[productIdx].x = (sr.left + sr.width / 2 - W / 2) / H;
    poses[productIdx].y = (sr.top - r.top + sr.height * 0.46 - H / 2) / H;
    poses[productIdx].size = Math.min(0.56, sr.width * 0.96 / (Math.min(W * 0.95, H * 1.32) * 0.88));
  }
  const hr = rects[0], extra = Math.max(1, hr.height - H);
  // the window opens over the first part of the hero (--hp), then the hero leaves (--hd)
  hero.p = reduce ? 1 : clamp(-hr.top / extra); hero.e = hero.p < 0.5 ? 4 * hero.p ** 3 : 1 - (-2 * hero.p + 2) ** 3 / 2;
  const hd = clamp((-hr.top - extra) / (H * 0.9));
  setVar(heroSec, '--hp', hero.p.toFixed(4)); setVar(root, '--hp', hero.p.toFixed(4)); setVar(heroSec, '--hq', smooth(clamp((hero.p - 0.82) / 0.18)).toFixed(3));
  setVar(heroSec, '--hd', hd.toFixed(3));
  // the lock fades in, 0 → 100 %, as the hero leaves and the light page rises (it is not shown over the hero)
  hero.fadeIn = reduce ? 1 : hr.bottom > 0 ? smooth(clamp(hd / 0.85)) : 1;
  setVar(stage, '--clip', 'none');
  // the lock appears as the pixels arrive on it
  hero.lock = reduce ? 1 : smooth(clamp((hero.p - 0.28) / 0.5));
  hero.on = hr.bottom > 0 && hero.p < 1;
  setVar(stage, '--hg', clamp(1 - hd * 1.4).toFixed(3));
  if (hd > 0 && hd < 1) {
    // the page stays Ink; the next chapter's colour rises with its top edge, as a sheet behind the lock
    root.classList.add('bg-live');
    setVar(root, '--bg', heroSec.dataset.bg);
    sheetEl.style.background = sections[1].dataset.bg;
    setVar(sheetEl, '--st', Math.max(0, rects[1].top).toFixed(1) + 'px');
    sheetEl.classList.add('is-on');
  } else {
    sheetEl.classList.remove('is-on');
    root.classList.remove('bg-live');
    setVar(root, '--bg', hd >= 1 ? s.dataset.bg || '#ECECEA' : heroSec.dataset.bg);
  }
  // the footer has its own logo, links and buy button: the nav and the rail step aside for it
  const fr = rects[rects.length - 1];
  root.classList.toggle('in-foot', fr.top < H * 0.96);
  root.classList.toggle('in-hero', rects[1].top > H * 0.9);
  setVar(rail, '--ro', hd > 0.9 && nav !== 'buy' && fr.top > H * 0.9 ? '1' : '0');
  // the nav changes colour on the green chapters
  const tone = s.dataset.tone || 'light';
  if (root.dataset.tone !== tone) { root.dataset.tone = tone; stage.dataset.tone = tone; }
  // find my counts the distance down as you arrive
  if (findIdx >= 0) {
    const r = rects[findIdx], p = clamp((H - r.top) / H);
    // the distance on the phone counts down as you arrive
    const n = Math.round(450 + 1950 * (1 - p));
    const txt = n >= 1000 ? (n / 1000).toFixed(1) + '\u00a0km' : n + '\u00a0m';
    if (txt !== lastChip) { lastChip = txt; chipText.textContent = txt; }
    // the phone is drawn round the lock: the lock sits where its placeholder's pin would be, about a third of the screen wide
    if (m.ghostR) {
      const g = m.ghostR;
      poses[findIdx].x = poses[findIdx].mx = (g.left + fpin.x - W / 2) / H;
      poses[findIdx].y = poses[findIdx].my = (g.top - r.top + fpin.y - H / 2) / H;
      const px = m.fmpW * 0.34;
      poses[findIdx].size = px / (Math.min(W * 0.95, H * 1.32) * 0.88);
      poses[findIdx].mpx = px;
    }
  }
  // the footer only lifts the buy chapter a little: the lock rides up with it
  const fi = sections.length - 1, foot = sections[fi];
  if (foot.matches('footer') && productIdx >= 0) {
    const lift = rects[fi].height / H;
    Object.assign(poses[fi], poses[productIdx], { y: poses[productIdx].y - lift, my: (poses[productIdx].my ?? poses[productIdx].y) - lift, fade: 1 });
  }
}

/* --------------------------------------------------------------- the loop */
let last = performance.now(), keylessSince = 0, autoOpened = false, userTouchedLock = false, lastSY = scrollY;
const t0 = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  glideTick(now);
  tickLoader(dt);
  // the 9 s safety net opened the page without the loader: start the entrance anyway
  if (intro.t < 0 && root.classList.contains('is-loaded')) { progress.done = true; intro.t = now; goToHash(); }

  const M = measure(), rects = M.rects;
  frameChrome(M);
  if (!lockReady) { drawPixels(now); return; }
  const mid = H / 2;
  const centers = M.centers.slice();
  // the footer can never reach the middle: land its pose as the page ends
  {
    const L = centers.length - 1;
    const endT = clamp(1 - (M.maxY - M.sy) / (H * 0.3));
    centers[L] = lerp(centers[L], Math.min(centers[L], mid - 1), endT);
  }

  // blend the two poses either side of the middle
  let i = 0;
  while (i < centers.length - 1 && centers[i + 1] <= mid) i++;
  const a = poses[i], b = poses[Math.min(i + 1, poses.length - 1)];
  const span = (centers[i + 1] ?? centers[i] + H) - centers[i];
  const t = centers[i] >= mid ? 0 : smooth(clamp((mid - centers[i]) / span));
  const target = {};
  KEYS.forEach(k => { target[k] = lerp(a[k], b[k], t); });
  if (phone()) {
    target.size = lerp(a.msize ?? a.size, b.msize ?? b.size, t);
    target.x = lerp(a.mx ?? a.x, b.mx ?? b.x, t); target.y = lerp(a.my ?? a.y, b.my ?? b.y, t);
    target.roll = lerp(a.mroll ?? a.roll, b.mroll ?? b.roll, t);
  }

  // keyless: open by itself once, a moment after you arrive
  const wk = keylessIdx < 0 ? 0 : clamp(1 - Math.abs(centers[keylessIdx] - mid) / (H * 0.45));
  if (wk > 0.85) {
    if (!keylessSince) keylessSince = now;
    // it opens only when you tap the button: never by itself
  } else keylessSince = 0;
  user.lock = reduce ? user.lockWant : damp(user.lock, user.lockWant, 5.5, dt);
  const lock = lerp(1, user.lock, smooth(wk));

  // buy: your own turn, kept while you are there, given back as you leave
  const wp = productIdx < 0 ? 0 : clamp(1 - Math.abs(centers[productIdx] - mid) / (H * 0.6));
  // leaving the buy chapter, the turn goes back to the first view
  if (wp < 0.2) user.angle = 0;

  // the page's own speed leans the ring a little, like something with weight
  const v = (scrollY - lastSY) / Math.max(dt, 1e-3) / 60; lastSY = scrollY;
  user.roll = damp(user.roll, reduce ? 0 : clamp(v * 0.004, -0.18, 0.18), 4, dt);
  user.mx = damp(user.mx, user.px, 3, dt); user.my = damp(user.my, user.py, 3, dt);
  setVar(heroSec, '--gx', (55 + user.mx * 10).toFixed(1) + '%');

  // follow, with weight (snappier for the macro, so the logo never smears)
  const k = reduce ? 1e3 : 7;
  KEYS.forEach(key => { cur[key] = damp(cur[key], target[key], k, dt); });
  swap.sweep = damp(swap.sweep, 0, 2.2, dt);

  // the entrance: the macro drifts in from a little closer and settles
  const ip = intro.t < 0 ? 0 : clamp((now - intro.t) / 2200), ie = 1 - Math.pow(1 - ip, 4);
  const alpha = clamp(1 - cur.fade) * (intro.t < 0 ? 0 : clamp((now - intro.t) / 400)) * (hero.fadeIn ?? 1);
  // find my shows the bike as a pin on the map instead: the lock steps out of the way, its drawings stay
  const shown = alpha * (1 - smooth(clamp(cur.hide)));
  lockEl.style.opacity = shown.toFixed(3);
  // the drawings wait until the bike has gone (the ring of words never hangs round a bike)
  const nobike = smooth(clamp((0.3 - cur.bike) / 0.3));
  ['orbit', 'radar', 'seal', 'fit'].forEach(kk => setVar(stage, '--' + kk, (cur[kk] * alpha * nobike).toFixed(3)));
  const tilt = findIdx < 0 ? 0 : (1 - smooth(clamp(+(sections[findIdx]['_--r'] || 0)))) * 20;
  setVar(stage, '--ft', tilt.toFixed(2) + 'deg');
  setVar(stage, '--sh', (alpha * (1 - cur.hide) * (1 - cur.radar) * (1 - cur.logo) * (1 - cur.fit) * (1 - cur.seal) * (1 - cur.bike)).toFixed(3));
  if (alpha < 0.005 && !hero.on) { drawPixels(now); return; }

  const time = (now - t0) / 1000;
  // size: the ring's diameter on screen
  let px = phone() ? (cur.mpx || Math.min(W * 0.84, H * 0.47) * (cur.size / 0.44)) : Math.min(W * 0.95, H * 1.32) * cur.size * 0.88;
  if (!phone()) {
    const sw = lerp(M.widths[i] || W, M.widths[Math.min(i + 1, slots.length - 1)] || W, t);
    px = Math.min(px, lerp(sw * 1.02, px, clamp(cur.free + cur.logo)));
  }
  // it breathes a little and leans with the page; the face-on chapters (the seal, the tyre) hold still
  const still = Math.max(cur.seal, cur.fit);
  const bob = reduce ? 0 : Math.sin(time * 0.8) * px * 0.006 * (1 - still);
  const dx = cur.x * H + (reduce ? 0 : user.mx * 6 * (1 - still)), dy = cur.y * H + bob + (reduce ? 0 : user.my * 4 * (1 - still));
  const roll = cur.roll + user.roll * (1 - still);
  setVar(stage, '--lx', dx.toFixed(1) + 'px'); setVar(stage, '--ly', dy.toFixed(1) + 'px'); setVar(stage, '--lr', (px / 2).toFixed(0) + 'px');
  // the angle: each chapter names its view; in the buy chapter your own turn picks it; between two, a cross-fade
  const angOf = (P, idx) => idx === productIdx ? ANGLES[((user.angle % 6) + 6) % 6] : (P.img || '00');
  const aA = angOf(a, i), aB = angOf(b, Math.min(i + 1, poses.length - 1));
  const mixB = aA === aB ? 0 : t;
  const place = { W, H, dx, dy, px, roll };
  paintLayer(layers[0], aA, 1 - mixB, place);
  paintLayer(layers[1], aB, aA === aB ? 0 : mixB, place);
  drawPixels(now);
}
// one image layer: a new picture only once it has arrived, so nothing ever flashes empty
// each view is placed by its own geometry: the ring's centre on the lock's place, its extent px wide
function paintLayer(L, ang, op, p) {
  const src = srcOf(finish, ang), g = GEO[ang] || RING, S = p.px / (2 * g.r);
  const st = L.img.style;
  st.width = st.height = S.toFixed(1) + 'px';
  st.transformOrigin = `${g.cx * 100}% ${g.cy * 100}%`;
  st.transform = `translate3d(${(p.W / 2 + p.dx - g.cx * S).toFixed(1)}px, ${(p.H / 2 + p.dy - g.cy * S).toFixed(1)}px, 0) rotate(${p.roll.toFixed(4)}rad)`;
  if (L.src !== src) {
    L.want = src;
    fetchImg(src).then(() => { if (L.want === src) { L.img.src = src; L.src = src; } }, () => {});
  }
  const o = (L.src ? op : 0).toFixed(3);
  if (L.op !== o) { L.op = o; L.img.style.opacity = o; }
}
requestAnimationFrame(loop);

/* ------------------------------------------------------------ keyless UI */
const unlockBtn = $('#unlock'), unlockState = $('#unlock-state'), unlockCta = $('#unlock-cta');
function setLock(v, byUser) {
  user.lockWant = v;
  const open = v === 0;
  unlockBtn.classList.toggle('is-open', open);
  unlockBtn.classList.remove('is-nudge');
  unlockBtn.setAttribute('aria-pressed', String(open));
  unlockState.textContent = t(open ? 'Unlocked' : 'Locked');
  unlockCta.textContent = t(open ? 'Lock' : 'Unlock');
  if (byUser) navigator.vibrate?.(open ? [10, 40, 10] : 14);
  if (!open && !reduce) setTimeout(flash, 380);
}
unlockBtn.addEventListener('click', () => { userTouchedLock = true; setLock(user.lockWant === 0 ? 1 : 0, true); });
unlockBtn.classList.add('is-nudge');

/* -------------------------------------------------------- will it fit */
const fitg = $('#fitg'), verdict = $('#verdict'), vHead = $('#verdict-head'), vBody = $('#verdict-body'), fitDim = $('#fit-dim');
const fitState = { mm: 42, holes: true };
function renderFit() {
  const { mm, holes } = fitState;
  // the box: tyres up to 60 mm go through the ring's 63 mm clearance; without frame holes, the Flex Mount holds it
  const no = mm > 60;
  verdict.dataset.state = no ? 'no' : 'yes'; fitg.dataset.state = no ? 'no' : 'yes';
  vHead.textContent = t(no ? 'Too wide.' : holes ? 'It fits.' : 'It fits, with the Flex Mount.');
  vBody.textContent = no ? t('The ring takes tyres up to 60 mm.')
    : holes ? t('The screws are in the box.')
    : t('Add the Flex Mount (€9.99) in the basket. It holds the lock on a frame without holes.');
  verdict.classList.remove('is-swap'); void verdict.offsetWidth; verdict.classList.add('is-swap');
  // the tyre, to scale: the drawn hole is the ring's 105 mm inside (v8 model); the 63 mm clearance sits between the mounts
  fitg.style.setProperty('--tw', Math.min(1, mm / 105).toFixed(3));
  fitDim.textContent = (no ? '100+' : '~' + mm) + ' ' + t('mm tyre');
}
function radio(group, pick) {
  $$('#' + group + ' .chip').forEach(b => b.addEventListener('click', () => {
    $$('#' + group + ' .chip').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    pick(b); renderFit();
  }));
}
radio('tyre', b => { fitState.mm = +b.dataset.mm; });
radio('holes', b => { fitState.holes = b.dataset.holes === '1'; });
renderFit();

/* ------------------------------------------- finishes: one sliding outline */
// António's buy block: the dots name the finish, the quantity sets the price on the button
const FIN_NAME = { steel: 'Steel', copper: 'Copper', black: 'Black' };
let qty = 1;
const priceText = () => t('Buy') + ' · ' + (lang === 'da' ? (999 * qty).toLocaleString('da-DK') + ' kr' : '€' + 129 * qty);
// once this finish is in the cart (cart-nav.js), the stepper shows and sets the cart: the minus at 1 is a bin
// and takes it out, and Buy becomes Check out
const C = () => window.LAAS_CART;
const inCart = () => (C() && C().qtyOf ? C().qtyOf(finish) : 0);
const money = n => (lang === 'da' ? (999 * n).toLocaleString('da-DK') + ' kr' : '€' + 129 * n);
function renderBuy() {
  const n = inCart();
  $('#qty-value').textContent = n || qty;
  const minus = $('[data-qty="-1"]'), plus = $('[data-qty="1"]');
  minus.disabled = !n && qty <= 1; plus.disabled = (n || qty) >= 15;
  minus.classList.toggle('is-trash', n === 1);
  minus.setAttribute('aria-label', t(n === 1 ? 'Remove from cart' : 'Decrease quantity'));
  $('.qty-row').classList.toggle('is-cart', !!n);
  $('#buy-label').textContent = n ? t('Check out') + ' · ' + money(n) : t('Buy') + ' · ' + money(qty);
  // the link is the fallback when the cart script is missing: the buy page, with the choice
  $('#buy-label').href = n ? 'checkout-v2.html' : `buy.html?finish=${finish}&qty=${qty}`;
  $('#finish-name').textContent = FIN_NAME[finish];
}
$$('[data-qty]').forEach(b => b.addEventListener('click', () => {
  const d = +b.dataset.qty, n = inCart();
  if (n) C().setQty(finish, n + d); else qty = clamp(qty + d, 1, 15);
  renderBuy();
}));
renderBuy();
addEventListener('laas-cart', renderBuy);
addEventListener('storage', renderBuy);
// Buy: one question (the Flex Mount), then the locks go in the cart right here; in the cart already, Check out
$('#buy-label').addEventListener('click', e => {
  if (inCart() || !C() || !C().buy) return;
  e.preventDefault();
  C().buy(finish, qty, () => { qty = 1; renderBuy(); });
});
// the finish dots are one radio group (as on buy.html): one tab stop, the arrow keys move and pick
const dots = $$('[data-finish]');
const syncDots = () => dots.forEach(b => { b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1; });
dots.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.finish;
    if (f === finish) return;
    dots.forEach(b => b.setAttribute('aria-checked', String(b === btn)));
    syncDots();
    show(f).catch(() => {}); renderBuy();
  });
  btn.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const n = dots[(i + d + dots.length) % dots.length];
    n.focus(); n.click();
  });
});
syncDots();

/* ---------------------------------------------------------- buy: turn */
// the six studio angles: a sideways drag steps through them (one step per 60 px), so do the arrows and the keys
const zone = $('#dragzone');
let lastX = 0, acc = 0;
const step = d => { user.angle += d; ANGLES.forEach(a2 => fetchImg(srcOf(finish, a2)).catch(() => {})); };
zone.addEventListener('pointerdown', e => { user.dragging = true; lastX = e.clientX; acc = 0; zone.setPointerCapture(e.pointerId); });
zone.addEventListener('pointermove', e => {
  if (!user.dragging) return;
  acc += e.clientX - lastX; lastX = e.clientX;
  while (Math.abs(acc) >= 60) { step(acc > 0 ? -1 : 1); acc -= Math.sign(acc) * 60; }
});
const endDrag = () => { user.dragging = false; };
zone.addEventListener('pointerup', endDrag); zone.addEventListener('pointercancel', endDrag);
$$('[data-turn]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); step(+b.dataset.turn); }));
$$('[data-turn]').forEach(b => b.addEventListener('pointerdown', e => e.stopPropagation()));
zone.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
});

/* ------------------------------------------------------------- pointer */
if (fine && !reduce) addEventListener('pointermove', e => { user.px = e.clientX / W * 2 - 1; user.py = e.clientY / H * 2 - 1; }, { passive: true });

/* -------------------------------------------------------- the nav capsule */
{
  const navEl = $('#nav'), links = $('.nav__links'), hover = $('.nav__hover'), lamp = $('.nav__lamp');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, d = y - lastY; lastY = y;
    root.classList.toggle('nav-float', y > 8);
    if (d > 4 && y > innerHeight * 0.6) root.classList.add('nav-compact');
    else if (d < -4 || y < 8) root.classList.remove('nav-compact');
    navEl.style.setProperty('--sp', (y / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // the pill under the pointer
  $$('a', links).forEach(a => a.addEventListener('pointerenter', () => {
    links.style.setProperty('--hx', a.offsetLeft + 'px'); links.style.setProperty('--hw', a.offsetWidth + 'px'); links.style.setProperty('--ho', '1');
  }));
  links.addEventListener('pointerleave', () => links.style.setProperty('--ho', '0'));
  // the lamp follows the chapter you are in
  const placeLamp = () => {
    const a = $('a[aria-current="true"]', links);
    links.style.setProperty('--lmo', a ? '1' : '0');
    if (a) links.style.setProperty('--lmx', (a.offsetLeft + a.offsetWidth / 2) + 'px');
  };
  new MutationObserver(placeLamp).observe(links, { attributes: true, subtree: true, attributeFilter: ['aria-current'] });
  addEventListener('resize', placeLamp);
}

/* ------------------------------------------------------------------ menu */
const menu = $('#menu'), menuBtn = $('#menu-open');
function openMenu() {
  menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = t('Close');
  requestAnimationFrame(() => menu.classList.add('is-open'));
  $('main').inert = true;
  setTimeout(() => menu.querySelector('a')?.focus(), 50);
}
function closeMenu() {
  if (menu.hidden) return;
  menu.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = t('Menu');
  setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 700);
  $('main').inert = false;
  menuBtn.focus();
}
menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ------------------------------------------------- one chapter per push
   Every push of the wheel, the trackpad, a swipe or a key glides to the next stop (or the one before) and lands on
   it: you never hang between two chapters, and you never fly past one. The opening is one long stop of its own: one
   push carries you from the pixel wordmark, through the lock, out to the first chapter. A chapter taller than the
   screen (a phone) gets a second stop at its bottom, so nothing in it is skipped. */
{
  const introEl = $('#intro');
  // the stops, measured fresh each time (fonts, a resize, an opened FAQ answer all move them)
  const stops = () => {
    const maxY = document.documentElement.scrollHeight - innerHeight, out = [0];
    sections.forEach(sec => {
      if (sec === heroSec) return;
      const top = Math.round(sec.getBoundingClientRect().top + scrollY), h = Math.max(sec.offsetHeight, sec.scrollHeight);
      if (sec.matches('footer')) { out.push(maxY); return; }
      out.push(Math.min(top, maxY));
      if (h > innerHeight * 1.15) out.push(Math.min(top + h - innerHeight, maxY));
    });
    return [...new Set(out)].sort((a, b) => a - b);
  };
  function glide(to, dur) {
    if (Math.abs(to - scrollY) < 2) return;
    if (reduce) { scrollTo(0, to); return; }
    root.style.scrollSnapType = 'none';
    Object.assign(glider, { on: true, from: scrollY, to, t0: performance.now(), dur });
  }
  // a trackpad keeps coasting after a push: swallow it until it has gone quiet, so one push is one chapter
  const busy = () => glider.on || performance.now() < glider.coolUntil;
  const intent = dir => {
    const S = stops(), y = scrollY;
    const to = dir > 0 ? S.find(v => v > y + 4) : [...S].reverse().find(v => v < y - 4);
    if (to == null) return false;
    // the opening is the long, slow one; every other step is a quick, soft one
    const opening = Math.min(to, y) < (introEl.getBoundingClientRect().top + scrollY) - 4;
    glide(to, opening ? 2600 : Math.min(1100, 650 + Math.abs(to - y) * 0.35));
    return true;
  };
  const insideScroller = el => el && el.closest && el.closest('.menu');
  addEventListener('wheel', e => {
    if (e.ctrlKey || insideScroller(e.target) || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (busy()) { if (!glider.on) glider.coolUntil = performance.now() + 180; return; }
    if (Math.abs(e.deltaY) < 3) return;
    intent(Math.sign(e.deltaY));
    glider.coolUntil = performance.now() + 180;
  }, { passive: false });
  let ty = null, tx = null, used = false;
  addEventListener('touchstart', e => { ty = e.touches[0].clientY; tx = e.touches[0].clientX; used = false; }, { passive: true });
  addEventListener('touchmove', e => {
    // a sideways drag on the lock turns it (the line below leaves it alone); an up-and-down swipe there moves a chapter too
    if (ty == null || insideScroller(e.target)) return;
    const d = ty - e.touches[0].clientY;
    // a sideways drag on the lock is the lock's; anywhere else the page never drifts between two stops
    if (Math.abs(e.touches[0].clientX - tx) > Math.abs(d) && e.target.closest('#dragzone')) return;
    e.preventDefault();
    if (used || busy() || Math.abs(d) < 12) return;
    used = true; intent(Math.sign(d));
  }, { passive: false });
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    const k = e.key, down = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey), up = k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey);
    if (!down && !up) return;
    // the space bar presses a focused button, opens a question, follows a link; the arrows move inside a radio group
    if (k === ' ' && e.target.closest('button, summary, [role="radio"], [role="button"], #dragzone')) return;
    if ((k === 'ArrowUp' || k === 'ArrowDown') && e.target.closest('[role="radiogroup"]')) return;
    e.preventDefault();
    if (!busy()) intent(down ? 1 : -1);
  });
}
window.LAAS_UI = true;
