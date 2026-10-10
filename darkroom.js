// LAAS · Ring-Lock
// One fixed canvas holds the real Ring-Lock (images/3d, Marcus's v8 model
// with its Lock animation). The page opens inside the logo that is laser-
// marked on the lock, and the first scroll steps back until the whole ring
// is in view. Every section carries a pose in data-key and the scroll
// blends from one to the next; the drawings in the stage (orbit, radar,
// seal, the tyre) are centred on the lock and fade in with their pose.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { MeshoptDecoder } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/meshopt_decoder.module.js/+esm';

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
  'Skip to content': 'Spring til indhold', 'Scroll down': 'Rul ned', 'Scroll': 'Rul', 'Menu': 'Menu', 'Close': 'Luk',
  'Keyless': 'Nøglefri', 'Find My': 'Find My', 'Varefakta': 'Varefakta', 'Will it fit?': 'Passer den?', 'Fit': 'Pasform', 'Buy': 'Køb', 'FAQ': 'FAQ',
  'Ring-Lock': 'Ring-Lock', 'Shipping': 'Fragt', 'Support': 'Support', 'Yours': 'Din', 'Returns': 'Returnering', 'Cart': 'Kurv',
  // the orbit and the seal
  'KEYLESS · INSURANCE-APPROVED IN DENMARK · FITS MOST BIKES · €129 ·': 'NØGLEFRI · FORSIKRINGSGODKENDT I DANMARK · PASSER TIL DE FLESTE CYKLER · 999 KR ·',
  'VAREFAKTA · VK 37868 · VF 5029:4 · INSURANCE-APPROVED IN DENMARK ·': 'VAREFAKTA · VK 37868 · VF 5029:4 · FORSIKRINGSGODKENDT I DANMARK ·',
  '63 mm clearance': '63 mm frigang', 'Ring-Lock · Steel · €129': 'Ring-Lock · Steel · 999 kr',
  // the poster
  'No key.': 'Ingen nøgle.', 'No cable.': 'Intet kabel.', 'No key. No cable. One ring of stainless steel that stays on your bike.': 'Ingen nøgle. Intet kabel. Én ring af rustfrit stål, der bliver på din cykel.',
  'One ring of stainless steel that stays on your bike. Nothing to carry, nothing to forget.': 'Én ring af rustfrit stål, der bliver på din cykel. Intet at bære på, intet at glemme.',
  'Opens with your phone': 'Åbner med din telefon', 'Insurance-approved in Denmark': 'Forsikringsgodkendt i Danmark', 'Fits most bikes': 'Passer til de fleste cykler', '57 days to return it': '57 dage til at returnere den',
  // 01 keyless
  'Your phone is the key.': 'Din telefon er nøglen.',
  'One tap in the LAAS app and the 9 mm hardened-steel bolt slides open. Push it home and it clicks locked.': 'Ét tryk i LAAS-appen, og den 9 mm hærdede stålbolt glider op. Skub den i, og den klikker låst.',
  'Near': 'Tæt på', 'Locked': 'Låst', 'Unlocked': 'Låst op', 'Tap to unlock': 'Tryk for at låse op', 'Tap to lock': 'Tryk for at låse', 'One-time key · Bluetooth': 'Engangsnøgle · Bluetooth',
  // 02 find my (Apple's approved wording only)
  'Apple Find My': 'Apple Find My', 'Works with Apple Find My.': 'Virker med Apple Find My.', 'Works with': 'Virker med',
  'Nørrebro · Now': 'Nørrebro · Nu', 'Nørrebro · Now ·': 'Nørrebro · Nu ·', 'Directions': 'Rutevejledning', 'Play Sound': 'Afspil lyd', 'Off': 'Fra',
  // 03 varefakta
  'Insurance‑approved in Denmark.': 'Forsikrings­godkendt i Danmark.',
  'The only electronic app-controlled ring lock on': 'Den eneste elektroniske app-styrede ringlås på', 'Varefakta’s public list': 'Varefaktas offentlige liste', '(VK 37868). The certificate is in the box.': '(VK 37868). Certifikatet ligger i æsken.',
  'Listing': 'Liste', 'Certificate': 'Certifikat',
  'Lock certificate': 'Låsecertifikat', 'Lock': 'Lås', 'Key no.': 'Nøgle nr.', 'Frame no.': 'Stel nr.', 'In the box, and in the app': 'I æsken og i appen',
  // 04 fit
  'Will it fit my bike?': 'Passer den til min cykel?', 'Road': 'Racer', 'City': 'Bycykel', 'E-bike': 'Elcykel', 'Cargo': 'Ladcykel', 'Fat bike': 'Fatbike',
  'It fits.': 'Den passer.', 'Not this one.': 'Ikke denne.', 'Tyres up to 60 mm. The mounting screws are in the box.': 'Dæk op til 60 mm. Monteringsskruerne ligger i æsken.',
  'Fat-bike tyres are too wide for the ring.': 'Fatbike-dæk er for brede til ringen.', 'mm tyre': 'mm dæk',
  'No frame holes? The Flex Mount, €9.99. And 57 days to send it back.': 'Ingen huller i stellet? Flex Mount, 75 kr. Og 57 dage til at sende den retur.',
  // 05 buy (the finish names stay Steel, Copper and Black, as in the Drive copy)
  'Steel. Copper. Black.': 'Steel. Copper. Black.', 'Same lock, same price, three finishes. Pick the one that suits your bike.': 'Samme lås, samme pris, tre finish. Vælg den, der passer til din cykel.',
  'Drag to turn': 'Træk for at dreje', 'Regular price': 'Normalpris', 'Intro price until 31 Dec 2026': 'Introduktionspris til 31. dec. 2026',
  '57-day returns': '57 dages returret', 'Prepaid return label in the box': 'Forudbetalt returlabel i æsken', 'Two-year right to complain': '2 års reklamationsret',
  // 06 faq
  'Questions, answered.': 'Spørgsmål og svar.', 'Not here? Call us on': 'Ikke her? Ring til os på', '. We pick up.': '. Vi tager den.',
  'Will my insurance accept it?': 'Godkender mit forsikringsselskab den?',
  'In Denmark, the Ring-Lock is insurance-approved: Varefakta VK 37868. Most Danish insurers ask for a Varefakta-approved lock and a lock certificate, and the certificate is in the box. Check your own policy. Outside Denmark, check what your policy asks for first.': 'I Danmark er Ring-Lock forsikringsgodkendt: Varefakta VK 37868. De fleste danske forsikringsselskaber kræver en Varefakta-godkendt lås og et låsecertifikat, og certifikatet ligger i æsken. Tjek din egen police. Uden for Danmark: tjek først, hvad din police kræver.',
  'Most bikes, cargo bikes and e-bikes too: tyres up to 60 mm, mount spacing 75 to 100 mm. Not fat bikes. Frame holes? The mounting screws are in the box. No holes? The Flex Mount, €9.99.': 'De fleste cykler, også ladcykler og elcykler: dæk op til 60 mm, monteringsafstand 75 til 100 mm. Ikke fatbikes. Huller i stellet? Monteringsskruerne ligger i æsken. Ingen huller? Flex Mount, 75 kr.',
  'What if my phone or the battery dies?': 'Hvad hvis min telefon eller batteriet dør?',
  'About six months per charge. A full charge over USB-C takes 90 minutes. Phone gone? Anyone you shared a key with can still open it.': 'Cirka seks måneder pr. opladning. En fuld opladning via USB-C tager 90 minutter. Telefonen væk? Alle, du har delt en nøgle med, kan stadig åbne den.',
  'Does it work with Android?': 'Virker den med Android?', 'Yes. The LAAS app works on Android and on iPhone.': 'Ja. LAAS-appen virker på Android og på iPhone.',
  'How secure is it?': 'Hvor sikker er den?',
  '9 mm of hardened steel. Every unlock uses a one-time key over Bluetooth, so a recorded signal cannot be replayed.': '9 mm hærdet stål. Hver oplåsning bruger en engangsnøgle via Bluetooth, så et optaget signal ikke kan afspilles igen.',
  'How fast does it ship, and what does it cost?': 'Hvor hurtigt sendes den, og hvad koster det?',
  'It ships in 1–2 working days. Shipping is €9, and free on orders over €250. Questions about an order? Write to': 'Den sendes inden for 1–2 hverdage. Fragten koster 75 kr. Spørgsmål om en ordre? Skriv til',
  'How do returns and the right to complain work?': 'Hvordan fungerer returnering og reklamationsret?',
  'Hand it to the carrier with the prepaid return label by day 57, and your money is back within 14 days. You also have the two-year right to complain (reklamationsret) under Danish law, counted from delivery.': 'Aflever den til fragtfirmaet med den forudbetalte returlabel senest dag 57, og du har pengene igen inden for 14 dage. Du har også to års reklamationsret efter dansk lov, regnet fra levering.',
  // the footer
  '© 2026 LAAS ApS, all rights reserved': '© 2026 LAAS ApS, alle rettigheder forbeholdes',
  '· Apple, the Apple logo, and Find My are trademarks of Apple Inc.': '· Apple, Apple-logoet og Find My er varemærker tilhørende Apple Inc.',
  'LAAS ApS · Sankt Hans Gade 24, st., 2200 København N · CVR 40942491 · © 2026': 'LAAS ApS · Sankt Hans Gade 24, st., 2200 København N · CVR 40942491 · © 2026',
  'Apple, the Apple logo, and Find My are trademarks of Apple Inc.': 'Apple, Apple-logoet og Find My er varemærker tilhørende Apple Inc.',
};
const lang = (() => { const q = new URLSearchParams(location.search).get('lang'); try { if (q) localStorage.setItem('laas-lang', q); return q || localStorage.getItem('laas-lang') || 'en'; } catch { return q || 'en'; } })();
const t = en => (lang === 'da' && DA[en]) || en;
if (lang === 'da') {
  document.documentElement.lang = 'da'; document.title = 'LAAS Ring-Lock · Locks worth stealing.';
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; let n; while ((n = w.nextNode())) if (!n.parentElement.closest('script,style')) nodes.push(n);
  nodes.forEach(n => { const key = n.nodeValue.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); if (DA[key]) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), DA[key]); });
  // prices in kroner: the buy pill in the nav and the one in the footer
  $$('.nav__price, .price-line strong').forEach(el => { el.textContent = '999 kr'; });
  // the struck regular price has no kroner amount yet: it is left out on the Danish page
  $$('.price-line s').forEach(el => el.remove());
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
  const sec = id === 'top' ? null : (el.closest('main > section, main > footer') || el);
  const to = sec ? Math.round(sec.getBoundingClientRect().top + scrollY) : 0;
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
// arriving from another page with #faq or #shipping: go straight there (a question opens). Runs from reveal(), and
// from the 9 s safety net when the loader never finished
function goToHash() {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.closest('main')) {
    if (target.matches('details')) target.open = true;
    const sec = target.closest('section, footer') || target;
    requestAnimationFrame(() => scrollTo(0, Math.round(sec.getBoundingClientRect().top + scrollY)));
  }
}
// never hold anyone back: show the page after 7 s whatever has arrived
setTimeout(() => { progress.img = 1; progress.glb = 1; }, 7000);

/* --------------------------------------------------------------- the scene */
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone() ? 1.75 : 2));
// Khronos PBR Neutral: true product colour, no orange shift in the copper
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0, 0);
stage.prepend(renderer.domElement);
const canvas = renderer.domElement;

// a bright studio (dome + softboxes) for a light page, with one cool rim
function studio(rim = true, low = false) {
  const scene = new THREE.Scene();
  const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const dome = new THREE.SphereGeometry(10, 96, 48), pos = dome.attributes.position, cols = [];
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    let v = 0.3 + 0.78 * ss(0, 0.9, y);
    v *= 1 - 0.7 * (ss(-0.26, -0.08, y) * (1 - ss(-0.04, 0.06, y)));
    if (y < -0.26) v = 0.2 - 0.12 * ss(-0.4, -1, y);
    cols.push(v, v, v);
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  scene.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const panel = (w, h, c, at) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...at); m.lookAt(0, 0, 0); scene.add(m);
  };
  const grey = v => new THREE.Color(v === 0 ? 0.08 : v * 1.3, v === 0 ? 0.08 : v * 1.3, v === 0 ? 0.08 : v * 1.3);
  panel(7, 4.5, grey(2.2), [-1, 7.2, 1.5]); panel(4.5, 4.5, grey(3.2), [-5.5, 4, 5]); panel(1.2, 7.5, grey(5), [-7.4, 1, 1]); panel(0.6, 7, grey(3), [3.2, 2, 7.6]);
  panel(6, 9, grey(0), [8, 0, 1.5]); panel(3, 9, grey(0), [4.5, -1, 7]); panel(2.2, 8.5, grey(0), [-7.8, 0.5, -4.5]); panel(3, 2, grey(1.2), [0, 2.5, -8.5]);
  if (rim) panel(1.3, 8, new THREE.Color(0.72 * 3, 0.87 * 3, 0.82 * 3), [6.6, 4.4, -4]);
  panel(0.28, 10, grey(9), [-4.2, 6.5, 5.2]);
  if (low) { panel(1.6, 6, new THREE.Color(0.72 * 2.2, 0.87 * 2.2, 0.82 * 2.2), [-6.4, -2.4, -4.5]); panel(0.5, 7, new THREE.Color(2.4, 2.6, 2.5), [5.8, -1.5, -5]); }
  return scene;
}
const scene = new THREE.Scene();
let envTint, envNeutral, envBlack;
{
  const pm = new THREE.PMREMGenerator(renderer);
  envTint = pm.fromScene(studio(true), 0).texture; envNeutral = pm.fromScene(studio(false), 0).texture; envBlack = pm.fromScene(studio(true, true), 0).texture;
  scene.environment = envTint;
  scene.environmentIntensity = 0.9;
  pm.dispose();
}
const camera = new THREE.PerspectiveCamera(22, 1, 0.01, 50);

/* ---------------------------------------------------------------- the bike */
// A city bike, built here in metres, so the real lock can sit on it in the
// opening frame and then leave it. x runs forward, y up, z to the right.
const bike = (() => {
  const g = new THREE.Group(), V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
  const mats = [];
  const M = (o) => { const m = new THREE.MeshPhysicalMaterial({ transparent: true, ...o }); mats.push(m); return m; };
  const paint = M({ color: '#1D5F63', metalness: 0.15, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 });
  const chrome = M({ color: '#d9dcdc', metalness: 1, roughness: 0.18 });
  const alloy = M({ color: '#b9bdbd', metalness: 1, roughness: 0.32 });
  const rubber = M({ color: '#1b1f1f', metalness: 0, roughness: 0.82 });
  const tan = M({ color: '#b98d62', metalness: 0, roughness: 0.7 });
  const leather = M({ color: '#7a4b31', metalness: 0, roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.4 });
  const dark = M({ color: '#2a3132', metalness: 0.3, roughness: 0.5 });
  // the frame (everything but the rear wheel and its stays) lives in its own group, so it can fade in after the close-up
  const frame = new THREE.Group(), fmats = new Map(); let P = g;
  const fm = m => P === g ? m : (fmats.get(m) || (fmats.set(m, m.clone()), fmats.get(m)));
  const tube = (a, b, r, mat, cap = true) => {
    mat = fm(mat);
    const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 20), mat);
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V(0, 1), d.clone().normalize()); P.add(m);
    if (cap) [a, b].forEach(p => { const k = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat); k.position.copy(p); P.add(k); });
  };
  const curve = (pts, r, mat) => P.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, r, 14), fm(mat)));
  const wheel = (c, fender = true) => {
    const w = new THREE.Group(); w.position.copy(c); g.add(w);
    const add = (geo, mat, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.z = z; w.add(m); return m; };
    add(new THREE.TorusGeometry(0.331, 0.021, 20, 96), rubber);
    add(new THREE.TorusGeometry(0.321, 0.0075, 10, 96), tan, 0.014); add(new THREE.TorusGeometry(0.321, 0.0075, 10, 96), tan, -0.014);
    add(new THREE.TorusGeometry(0.305, 0.011, 12, 96), chrome);
    add(new THREE.TorusGeometry(0.296, 0.006, 8, 96), alloy);
    [0.03, -0.03].forEach(z => add(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 24), alloy, z).rotation.x = Math.PI / 2);
    const valve = add(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 8), chrome); valve.position.set(0, -0.29, 0);
    add(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 20), alloy).rotation.x = Math.PI / 2;
    for (let k = 0; k < 32; k++) {
      const a = k / 32 * Math.PI * 2, side = k % 2 ? 1 : -1, hub = V(Math.cos(a + 0.2 * side) * 0.02, Math.sin(a + 0.2 * side) * 0.02, side * 0.035), rim = V(Math.cos(a) * 0.298, Math.sin(a) * 0.298, 0);
      const d = new THREE.Vector3().subVectors(rim, hub), m = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, d.length(), 5), chrome);
      m.position.copy(hub).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V(0, 1), d.normalize()); w.add(m);
    }
    // a fender over the top of the wheel
    if (fender) { const f = add(new THREE.CylinderGeometry(0.362, 0.362, 0.052, 64, 1, true, 0, Math.PI * 1.05), paint); f.rotation.x = Math.PI / 2; f.rotation.y = -0.1; f.material.side = THREE.DoubleSide; }
    return w;
  };
  const R = V(0, 0.35), F = V(1.09, 0.35), rearNoFender = true, BB = V(0.44, 0.29), ST = V(0.3, 0.84), STj = V(0.316, 0.77), HTt = V(0.99, 0.87), HTb = V(1.03, 0.72);
  wheel(R, !rearNoFender);
  // the stays carry the lock, so they stay in the close-up
  [1, -1].forEach(s => { tube(V(0, 0.35, s * 0.068), V(0.44, 0.29, s * 0.025), 0.0095, paint); tube(V(0, 0.35, s * 0.07), V(0.31, 0.775, s * 0.03), 0.0085, paint); });
  // dropouts where the stays meet the axle
  [1, -1].forEach(s => { const d = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.006), paint); d.position.set(0.012, 0.36, s * 0.069); d.rotation.z = 0.5; g.add(d); });
  g.add(frame); P = frame;
  wheel(F);
  // frame
  tube(BB, ST, 0.016, paint); tube(STj, HTt, 0.016, paint); tube(BB, HTb, 0.019, paint); tube(HTt.clone().add(V(0, 0.03)), HTb.clone().add(V(0.012, -0.05)), 0.022, paint);
  [1, -1].forEach(s => {
    curve([HTb.clone().add(V(0.01, -0.04, s * 0.03)), V(1.06, 0.55, s * 0.05), V(1.095, 0.4, s * 0.052), V(1.09, 0.35, s * 0.052)], 0.011, paint);
  });
  // seatpost and saddle
  tube(ST, V(0.285, 0.93), 0.0125, chrome);
  const saddle = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), fm(leather)); saddle.scale.set(0.135, 0.032, 0.085); saddle.position.set(0.27, 0.955, 0); P.add(saddle);
  // stem and swept-back city bars
  tube(HTt.clone().add(V(0, 0.03)), V(0.975, 0.99), 0.013, chrome);
  curve([V(0.86, 1.01, -0.27), V(0.93, 1.0, -0.22), V(0.99, 0.99, -0.08), V(1.0, 0.99, 0), V(0.99, 0.99, 0.08), V(0.93, 1.0, 0.22), V(0.86, 1.01, 0.27)], 0.011, chrome);
  [1, -1].forEach(s => tube(V(0.86, 1.01, s * 0.27), V(0.77, 1.02, s * 0.29), 0.017, leather));
  // a lamp on the head tube
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.05, 20), fm(dark)); lamp.rotation.z = Math.PI / 2; lamp.position.set(1.07, 0.8, 0); P.add(lamp);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.021, 20), new THREE.MeshBasicMaterial({ color: '#fbf6e8', transparent: true })); lens.rotation.y = Math.PI / 2; lens.position.set(1.096, 0.8, 0); P.add(lens); mats.push(lens.material);
  // drivetrain
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.005, 10, 64), fm(alloy)); ring.position.set(0.44, 0.29, 0.065); P.add(ring);
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.004), fm(alloy)); arm.position.set(0.44 + Math.cos(a) * 0.045, 0.29 + Math.sin(a) * 0.045, 0.065); arm.rotation.z = a; P.add(arm); }
  tube(V(0.44, 0.29, 0.075), V(0.5, 0.13, 0.085), 0.011, alloy); tube(V(0.44, 0.29, -0.075), V(0.38, 0.45, -0.085), 0.011, alloy);
  [[V(0.5, 0.13, 0.12), 1], [V(0.38, 0.45, -0.12), -1]].forEach(([p]) => { const pd = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.06, 4, 10), fm(dark)); pd.rotation.x = Math.PI / 2; pd.position.copy(p); P.add(pd); });
  curve([V(0.44, 0.385, 0.065), V(0.2, 0.37, 0.065), V(0.02, 0.37, 0.065), V(0.0, 0.33, 0.065), V(0.2, 0.2, 0.065), V(0.44, 0.195, 0.065)], 0.0035, dark);
  // a soft contact shadow under the wheels
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const cx = cv.getContext('2d'), gr = cx.createRadialGradient(128, 32, 4, 128, 32, 128);
  gr.addColorStop(0, 'rgba(20,30,30,.22)'); gr.addColorStop(1, 'rgba(20,30,30,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 256, 64);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.set(0.55, 0.0, 0); g.add(sh); mats.push(sh.material);
  g.visible = false; scene.add(g);
  // where the Ring-Lock sits (as on the product photos): around the tyre, just behind the seat stays, its band
  // close over the tread and the laser-marked logo on top of the arc, facing out; the stays never pass through it
  const Q = new URLSearchParams(location.search), qn = (k, d) => (Q.has(k) ? +Q.get(k) : d);
  const dir = V(0.31, 0.775).sub(R).normalize();
  const mx = V(0, 0, 1), my = dir.clone(), mz = new THREE.Vector3().crossVectors(mx, my);
  const at = R.clone().addScaledVector(dir, qn('mrad', 0.312)).addScaledVector(mz, qn('moff', 0.026));
  const mount = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(mx, my, mz))
    .multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1), qn('mflip', 1) * Math.PI))
    .multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), THREE.MathUtils.degToRad(qn('mrot', 100))));
  // the frame centres between the bike and its lock, so the lock is the hero and the front wheel can run off the edge
  // looking down the tyre: the ring face-on, the wheel running through it (the close-up the card opens on)
  const face = mount.clone().invert();
  return { g, mats, frameMats: [...fmats.values()], at, mount, face, body: V(0.56, 0.6), length: 1.9 };
})();
const QS = new URLSearchParams(location.search);
const BIKE_YAW = +(QS.get('yaw') || 0.72), CARD_YAW = +(QS.get('cyaw') ?? -0.45), CARD_PITCH = +(QS.get('cpitch') ?? 0.08);
const qCard = new THREE.Quaternion();
const _qy = new THREE.Quaternion(), _q34 = new THREE.Quaternion(), _ax = new THREE.Vector3(), bikeC = new THREE.Vector3(), qBike = new THREE.Quaternion(), qMountW = new THREE.Quaternion(), _b = new THREE.Vector3();
const _v = new THREE.Vector3();

const FILES = { steel: 'ring-lock-silver.glb', copper: 'ring-lock-copper.glb', black: 'ring-lock-black.glb' };
const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const models = {};
function load(f, onProgress) {
  return models[f] || (models[f] = new Promise((res, rej) => gltfLoader.load('images/3d/' + FILES[f] + '?v=7f891b83', res, e => onProgress?.(e.total ? e.loaded / e.total : clamp(e.loaded / 1.67e6)), rej)).then(gltf => {
    const group = new THREE.Group(), model = gltf.scene;
    group.add(model);
    const box = new THREE.Box3().setFromObject(model);
    model.position.sub(box.getCenter(new THREE.Vector3()));
    const size = box.getSize(new THREE.Vector3());
    model.traverse(o => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      if (f === 'black') {
        // the steel rivets stay steel (they are on the product), but satin, so they do not glint like dead pixels
        const mats = [].concat(o.material).map(m => {
          if (!/satin steel/i.test(m.name)) return m;
          const c = m.clone(); c.roughness = 0.58; c.envMapIntensity = 0.45; c.color.multiplyScalar(0.7); return c;
        });
        o.material = mats.length === 1 ? mats[0] : mats;
      }
      if (f !== 'steel') [].concat(o.material).forEach(m => { if (m.metalness > 0.6 && !/shackle/i.test(m.name)) m.roughness = Math.min(m.roughness, 0.28); });
      if (f === 'steel') [].concat(o.material).forEach(m => { if (/shackle/i.test(m.name)) m.roughness = 0.05; else if (/brushed|satin steel/i.test(m.name)) { m.roughness = 0.24; } });
    });
    const clip = gltf.animations.find(a => a.name === 'Lock');
    let mixer = null, dur = 0;
    if (clip) { mixer = new THREE.AnimationMixer(model); mixer.clipAction(clip).play(); dur = clip.duration - 1e-4; mixer.setTime(dur); }
    group.updateMatrixWorld(true);
    // a few hundred real surface points, so the floor shadow can find the ring's true lowest point
    let pts = [];
    model.traverse(o => { if (!o.isMesh) return; const pa = o.geometry.attributes.position; for (let i = 0; i < pa.count; i++) pts.push([o, i]); });
    const stp = Math.max(1, Math.floor(pts.length / 600));
    pts = pts.filter((_, i) => i % stp === 0).map(([o, i]) => [o, new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.position, i)]);
    const logo = logoFrame(model, size);
    group.visible = false; scene.add(group);
    // compile now so the first frame on screen does not stutter
    renderer.compile(scene, camera);
    return { group, mixer, dur, pts, logo, radius: Math.max(size.x, size.y, size.z) * 0.5 };
  }));
}
// where the laser-marked logo sits, which way it reads, and how wide it is
function logoFrame(model, size) {
  let node = null;
  model.traverse(o => { if (!node && /laas.2026.logo/i.test(o.name || '')) node = o; });
  if (!node) return null;
  const P = [], N = new THREE.Vector3(), nm = new THREE.Matrix3();
  node.traverse(o => {
    if (!o.isMesh) return;
    const pa = o.geometry.attributes.position, na = o.geometry.attributes.normal;
    nm.getNormalMatrix(o.matrixWorld);
    for (let i = 0; i < pa.count; i++) {
      P.push(new THREE.Vector3().fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld));
      if (na) N.add(new THREE.Vector3().fromBufferAttribute(na, i).applyMatrix3(nm).normalize());
    }
  });
  if (!P.length) return null;
  const c = P.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / P.length);
  // the ring's axis is its thinnest dimension
  const ax = size.x <= size.y && size.x <= size.z ? 'x' : size.y <= size.z ? 'y' : 'z';
  const axis = new THREE.Vector3(); axis[ax] = 1;
  const radial = c.clone(); radial[ax] = 0; radial.normalize();
  // the mark faces the way its surface does (the tube is round, so not just along the axis)
  let n = N.lengthSq() > 1e-6 ? N.normalize() : axis.clone().multiplyScalar(Math.sign(c[ax]) || 1);
  if (n.dot(c.clone().sub(radial.clone().multiplyScalar(c.dot(radial)))) < 0 && N.lengthSq() < 1e-6) n.negate();
  // the text runs round the ring; its letters stand toward the outer edge
  const tang = new THREE.Vector3().crossVectors(axis, radial);
  const u = tang.sub(n.clone().multiplyScalar(tang.dot(n))).normalize();
  let v = new THREE.Vector3().crossVectors(n, u);
  if (v.dot(radial) * LOGO_UP < 0) { u.negate(); v.negate(); }
  // centre on the mark's bounding box, not its vertices (the S has far more of them than the L)
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  P.forEach(p => { const d = p.clone().sub(c), a = d.dot(u), b = d.dot(v); u0 = Math.min(u0, a); u1 = Math.max(u1, a); v0 = Math.min(v0, b); v1 = Math.max(v1, b); });
  c.addScaledVector(u, (u0 + u1) / 2).addScaledVector(v, (v0 + v1) / 2);
  const w = (u1 - u0) / 2, h = (v1 - v0) / 2;
  const basis = new THREE.Matrix4().makeBasis(u, v, n);
  const q = new THREE.Quaternion().setFromRotationMatrix(basis).invert();
  return { c, q, w: w * 2, h: h * 2, u, v };
}
const LOGO_UP = +(new URLSearchParams(location.search).get('up') || -1);

let model = null, finish = 'steel';
const intro = { t: -1 };
// light per metal: how strong the studio reflects
const METAL = { steel: { env: 1.15, exp: 0.98, rot: 0.9 }, copper: { env: 1.1, exp: 1.0, rot: 0 }, black: { env: 1.4, exp: 1.3, rot: 2.4 } };
let envRot = 0;
const swap = { pending: null, from: 0, sweep: 0 };
function setModel(m, f) {
  if (model) model.group.visible = false;
  m.group.visible = true; model = m;
  scene.environmentIntensity = METAL[f].env;
  renderer.toneMappingExposure = METAL[f].exp;
  envRot = METAL[f].rot;
  stage.dataset.metal = f;
  scene.environment = f === 'steel' ? envNeutral : f === 'black' ? envBlack : envTint;
  $('#buy').dataset.metal = f;
}
function show(f) {
  finish = f;
  return load(f).then(m => {
    if (finish !== f) return;
    if (!model || reduce) setModel(m, f);
    else swap.pending = { m, f };      // the loop changes it when the ring is edge-on
  });
}
// silver first: it is the bestseller and the one the page opens on
load('steel', p => { progress.glb = p; }).then(() => { progress.glb = 1; return show('steel'); }).catch(() => { progress.glb = 1; canvas.remove(); });
models.steel.then(() => { load('copper'); load('black'); }, () => {});

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
const user = { taught: false, spin: 0, goal: 0, vel: 0, dragging: false, lockWant: 1, lock: 1, roll: 0, px: 0, py: 0, mx: 0, my: 0 };

let W = innerWidth, H = innerHeight;
function resize() {
  W = innerWidth; H = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone() ? 1.75 : 2));
  renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
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
const hero = { p: 0, e: 0, lock: 1, on: false };
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
    poses[productIdx].size = Math.min(0.4, sr.width * 0.78 / (Math.min(W * 0.95, H * 1.32) * 0.88));
  }
  const hr = rects[0], extra = Math.max(1, hr.height - H);
  // the window opens over the first part of the hero (--hp), then the hero leaves (--hd)
  hero.p = reduce ? 1 : clamp(-hr.top / extra); hero.e = hero.p < 0.5 ? 4 * hero.p ** 3 : 1 - (-2 * hero.p + 2) ** 3 / 2;
  const hd = clamp((-hr.top - extra) / (H * 0.9));
  setVar(heroSec, '--hp', hero.p.toFixed(4)); setVar(root, '--hp', hero.p.toFixed(4)); setVar(heroSec, '--hq', smooth(clamp((hero.p - 0.82) / 0.18)).toFixed(3));
  setVar(heroSec, '--hd', hd.toFixed(3));
  setVar(stage, '--clip', 'none');
  // the lock appears as the pixels arrive on it
  hero.lock = reduce ? 1 : smooth(clamp((hero.p - 0.28) / 0.5));
  hero.on = hr.bottom > 0 && hero.p < 1;
  setVar(stage, '--hg', clamp(1 - hd * 1.4).toFixed(3));
  if (hd > 0 && hd < 1) {
    root.classList.add('bg-live');
    setVar(root, '--bg', mixHex(heroSec.dataset.bg, sections[1].dataset.bg, smooth(hd)));
  } else {
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
const qPose = new THREE.Quaternion(), qLogo = new THREE.Quaternion(), qTmp = new THREE.Quaternion(), eTmp = new THREE.Euler();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  glideTick(now);
  tickLoader(dt);
  // the 9 s safety net opened the page without the loader: start the entrance anyway
  if (intro.t < 0 && root.classList.contains('is-loaded')) { progress.done = true; intro.t = now; goToHash(); }

  const M = measure(), rects = M.rects;
  frameChrome(M);
  if (!model) { drawPixels(now); return; }
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
  if (wp > 0.8 && !user.taught && !reduce) { user.taught = true; user.vel = 0.05; }
  if (!user.dragging) {
    user.goal += user.vel; user.vel *= 0.92;
    if (wp < 0.2) user.goal = Math.round(user.goal / (Math.PI * 2)) * Math.PI * 2;
  }
  user.spin = user.dragging || reduce ? user.goal : damp(user.spin, user.goal, 3.2, dt);

  // the page's own speed leans the ring a little, like something with weight
  const v = (scrollY - lastSY) / Math.max(dt, 1e-3) / 60; lastSY = scrollY;
  user.roll = damp(user.roll, reduce ? 0 : clamp(v * 0.004, -0.18, 0.18), 4, dt);
  user.mx = damp(user.mx, user.px, 3, dt); user.my = damp(user.my, user.py, 3, dt);
  setVar(heroSec, '--gx', (55 + user.mx * 10).toFixed(1) + '%');

  // follow, with weight (snappier for the macro, so the logo never smears)
  const k = reduce ? 1e3 : 7;
  KEYS.forEach(key => { cur[key] = damp(cur[key], target[key], k, dt); });
  if (swap.pending && Math.abs(user.spin - swap.from) > Math.PI * 0.5) { setModel(swap.pending.m, swap.pending.f); swap.pending = null; }
  swap.sweep = damp(swap.sweep, 0, 2.2, dt);

  // the entrance: the macro drifts in from a little closer and settles
  const ip = intro.t < 0 ? 0 : clamp((now - intro.t) / 2200), ie = 1 - Math.pow(1 - ip, 4);
  const alpha = clamp(1 - cur.fade) * (intro.t < 0 ? 0 : clamp((now - intro.t) / 400)) * (hero.on ? hero.lock : 1);
  // find my shows the bike as a pin on the map instead: the lock steps out of the way, its drawings stay
  canvas.style.opacity = (alpha * (1 - smooth(clamp(cur.hide)))).toFixed(3);
  // the drawings wait until the bike has gone (the ring of words never hangs round a bike)
  const nobike = smooth(clamp((0.3 - cur.bike) / 0.3));
  ['orbit', 'radar', 'seal', 'fit'].forEach(kk => setVar(stage, '--' + kk, (cur[kk] * alpha * nobike).toFixed(3)));
  const tilt = findIdx < 0 ? 0 : (1 - smooth(clamp(+(sections[findIdx]['_--r'] || 0)))) * 20;
  setVar(stage, '--ft', tilt.toFixed(2) + 'deg');
  setVar(stage, '--sh', (alpha * (1 - cur.hide) * (1 - cur.radar) * (1 - cur.logo) * (1 - cur.fit) * (1 - cur.seal) * (1 - cur.bike)).toFixed(3));
  if (alpha < 0.005 && !hero.on) { drawPixels(now); return; }

  const time = (now - t0) / 1000;
  const sway = reduce ? 0 : Math.sin(time * 0.42) * 0.09;
  const bob = reduce ? 0 : Math.sin(time * 0.31) * 0.03;
  // flat-on chapters hold still: the seal and the tyre are drawn round a face-on ring
  const still = Math.max(cur.seal, cur.fit);
  eTmp.set(cur.pitch + (bob + user.my * 0.06) * (1 - still), cur.yaw + (sway + user.mx * 0.1) * (1 - still) + user.spin, cur.roll + user.roll * (1 - still), 'XYZ');
  qPose.setFromEuler(eTmp);
  if (tilt > 0.01 && cur.radar > 0.01) qPose.premultiply(qTmp.setFromAxisAngle(_ax.set(1, 0, 0), -THREE.MathUtils.degToRad(tilt) * cur.radar));

  // the macro: the logo faces you and fills the frame
  const L = model.logo, wl = L ? smooth(clamp(cur.logo)) : 0;
  const wRot = smooth(clamp((wl - 0.12) / 0.88));
  if (L && wl > 0) {
    // the band rises a few degrees to the right, a diagonal between the two lines of type
    eTmp.set(user.my * 0.03 + (1 - ie) * -0.05, user.mx * 0.05 + (1 - ie) * 0.12, -0.07, 'XYZ');
    qLogo.setFromEuler(eTmp).multiply(L.q);
    qTmp.copy(qPose).slerp(qLogo, wRot);
    model.group.quaternion.copy(qTmp);
  } else model.group.quaternion.copy(qPose);
  model.group.scale.setScalar(1);
  // the logo's centre is brought to the middle of the frame
  if (L && wl > 0) model.group.position.copy(L.c).applyQuaternion(model.group.quaternion).multiplyScalar(-wl);
  else model.group.position.set(0, 0, 0);

  // the opening frame: the lock sits on a bike; scrolling, it leaves the bike and comes with you
  const wb = smooth(clamp(cur.bike)), wbr = smooth(clamp((cur.bike - 0.15) / 0.85));
  bike.g.visible = wb > 0.002;
  if (bike.g.visible) {
    // three-quarters from behind, so the lock on the rear wheel faces you
    eTmp.set(0.16 + user.my * 0.02, BIKE_YAW + (reduce ? 0 : Math.sin(time * 0.25) * 0.04) + user.mx * 0.06, 0, 'XYZ');
    qBike.setFromEuler(eTmp);
    // as a card, the close-up of the product photo: from beside the seat tube, the stay crossing in front of the ring
    eTmp.set(CARD_PITCH + user.my * 0.02, CARD_YAW + user.mx * 0.05, 0, 'XYZ');
    qCard.setFromEuler(eTmp);
    qBike.slerp(qCard, (1 - hero.e) * wb);
    // as a card, the window looks straight down the tyre at the ring; opening, it turns to the three-quarter view
    qMountW.copy(qBike).multiply(bike.mount);
    // the bike's centre sits at the middle of the frame; the lock is where it is mounted
    // while the window is a card it is centred on the lock; opened, on the bike
    bikeC.copy(bike.body).lerp(bike.at, lerp(1, 0.42, hero.e));
    _b.copy(bike.at).sub(bikeC).applyQuaternion(qBike);
    model.group.quaternion.slerp(qMountW, wbr);
    model.group.position.copy(_b).multiplyScalar(wb);
    bike.g.quaternion.copy(qBike);
    bike.g.position.copy(bikeC).applyQuaternion(qBike).negate().add(new THREE.Vector3(0, (1 - wb) * 0.5, 0));
    const bo = smooth(clamp((wb - 0.62) / 0.3));
    bike.mats.forEach(m => { m.opacity = bo; });
    // the frame comes in as the card opens, so the close-up is just the ring, the tyre and the stays
    const fo = bo;
    bike.frameMats.forEach(m => { m.opacity = fo; m.depthWrite = fo > 0.98; });
  }

  // the reflections travel through the metal as the page moves
  scene.environmentRotation.y = envRot + (scrollY / H) * 0.35 + user.mx * 0.15 + (1 - ie) * 1.2 + swap.sweep * 2.2 + (reduce ? 0 : Math.sin(time * 0.35) * 0.15 * wl);
  if (model.mixer) model.mixer.setTime(model.dur * lock);
  setVar(stage, '--sw', Math.max(0.35, Math.cos(cur.pitch)).toFixed(3));

  // size: the ring's diameter as a share of the screen
  let px = phone() ? (cur.mpx || Math.min(W * 0.84, H * 0.47) * (cur.size / 0.44)) : Math.min(W * 0.95, H * 1.32) * cur.size * 0.88;
  if (!phone()) {
    const sw = lerp(M.widths[i] || W, M.widths[Math.min(i + 1, slots.length - 1)] || W, t);
    px = Math.min(px, lerp(sw * 1.02, px, clamp(cur.free + cur.logo)));
  }
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let dist = model.radius * H / (tan * px), logoPx = 0;
  if (L && wl > 0) {
    // the logo spans most of the width (a phone sees a little more of the ring around it)
    const want = phone() ? W * 0.8 : W * 0.46;
    logoPx = want;
    const dl = L.w * H / (2 * tan * want) * (1 + (1 - ie) * 0.08);
    dist = Math.exp(lerp(Math.log(dist), Math.log(dl), wl));
  }
  if (wb > 0.001) {
    // the whole bike in frame, as wide as the screen allows (the room is measured with the hero in place)
    const room = Math.max(160, M.heroCopyTop - 76);
    const open = phone() ? Math.min(W * 1.2, room * 1.45) : Math.min(W * 0.94, H * 1.86);
    // as a card, the window shows the rear wheel and the lock close up
    const want = Math.exp(lerp(Math.log(card0.w * 0.95 * bike.length / 0.157), Math.log(open), hero.e));
    dist = Math.exp(lerp(Math.log(dist), Math.log(bike.length * H / (2 * tan * want)), wb));
  }
  camera.position.set(0, 0, dist);
  camera.near = dist / 30; camera.far = dist * 6;
  // the band sits on the cover type; any spare room goes above it, under the nav
  const bandY = H / 2;
  // the mark sits left of centre, so the tube's end cap runs off the right edge
  // the card is centred; the offsets of the opened hero come in as it opens
  const ho = lerp(1, hero.e, wb);
  // while it is a card the lock sits in the middle of it, a little above the caption
  const cw = (1 - hero.e) * wb, cardDX = cw * (card0.x - W / 2), cardDY = cw * (card0.y - H / 2 - card0.h * 0.05);
  const dx = (cur.x * H * (1 - wl) - wl * W * 0) * ho + cardDX, dy = (cur.y * H * (1 - wl) + wl * (bandY - H / 2)) * ho + cardDY;
  camera.setViewOffset(W, H, -dx, -dy, W, H);
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);
  setVar(stage, '--lx', dx.toFixed(1) + 'px'); setVar(stage, '--ly', dy.toFixed(1) + 'px'); setVar(stage, '--lr', (px / 2).toFixed(0) + 'px');
  // the floor shadow sits under the ring's lowest point, wherever the pose puts it
  if (+stage['_--sh'] > 0.01) {
    model.group.updateMatrixWorld(true);
    let lo = -Infinity;
    for (const [o, vv] of model.pts) { _v.copy(vv).applyMatrix4(o.matrixWorld).project(camera); if (-_v.y > lo) lo = -_v.y; }
    setVar(stage, '--fy', ((lo * 0.5 + 0.5) * H - H / 2 - px * 0.035 + 4).toFixed(1) + 'px');
  }
  if (wb > 0.01) {
    _b.copy(model.group.position).project(camera);
    setVar(stage, '--kx', ((_b.x * 0.5 + 0.5) * W).toFixed(1) + 'px'); setVar(stage, '--ky', ((-_b.y * 0.5 + 0.5) * H).toFixed(1) + 'px');
  }
  setVar(stage, '--kb', (smooth(clamp((cur.bike - 0.7) / 0.3)) * smooth(clamp((hero.p - 0.85) / 0.15))).toFixed(3));
  // where the laser-marked logo is on screen, for the pixels to land on
  if (L && wl > 0.5) {
    model.group.updateMatrixWorld(true);
    const pr = (vec) => { _v.copy(vec).applyMatrix4(model.group.matrixWorld).project(camera); return [(_v.x * 0.5 + 0.5) * W, (-_v.y * 0.5 + 0.5) * H]; };
    const c0 = pr(L.c), u0 = pr(L.c.clone().addScaledVector(L.u, -L.w / 2)), u1 = pr(L.c.clone().addScaledVector(L.u, L.w / 2));
    const v0 = pr(L.c.clone().addScaledVector(L.v, -L.h / 2)), v1 = pr(L.c.clone().addScaledVector(L.v, L.h / 2));
    logoRect.cx = c0[0]; logoRect.cy = c0[1];
    logoRect.w = Math.hypot(u1[0] - u0[0], u1[1] - u0[1]); logoRect.h = Math.hypot(v1[0] - v0[0], v1[1] - v0[1]);
    logoRect.ang = Math.atan2(u1[1] - u0[1], u1[0] - u0[0]);
    logoRect.ok = true;
  }
  renderer.render(scene, camera);
  drawPixels(now);
}
requestAnimationFrame(loop);

/* ------------------------------------------------------------ keyless UI */
const unlockBtn = $('#unlock'), unlockState = $('#unlock-state'), unlockCta = $('#unlock-cta');
function setLock(v, byUser) {
  user.lockWant = v;
  swap.sweep = Math.max(swap.sweep, 0.55);
  const open = v === 0;
  unlockBtn.classList.toggle('is-open', open);
  unlockBtn.classList.remove('is-nudge');
  unlockBtn.setAttribute('aria-pressed', String(open));
  unlockState.textContent = t(open ? 'Unlocked' : 'Locked');
  unlockCta.textContent = t(open ? 'Tap to lock' : 'Tap to unlock');
  if (byUser) navigator.vibrate?.(open ? [10, 40, 10] : 14);
  if (!open && !reduce) setTimeout(flash, 380);
}
unlockBtn.addEventListener('click', () => { userTouchedLock = true; setLock(user.lockWant === 0 ? 1 : 0, true); });
unlockBtn.classList.add('is-nudge');

/* -------------------------------------------------------- will it fit */
const fitg = $('#fitg'), verdict = $('#verdict'), vHead = $('#verdict-head'), vBody = $('#verdict-body'), fitDim = $('#fit-dim');
const fitState = { bike: 'city', mm: 42 };
function renderFit() {
  const { bike, mm } = fitState;
  // the box: tyres up to 60 mm through the ring's 63 mm clearance; fat bikes do not fit
  const no = mm > 60;
  verdict.dataset.state = no ? 'no' : 'yes'; fitg.dataset.state = no ? 'no' : 'yes';
  vHead.textContent = t(no ? 'Not this one.' : 'It fits.');
  vBody.textContent = t(no ? 'Fat-bike tyres are too wide for the ring.' : 'Tyres up to 60 mm. The mounting screws are in the box.');
  verdict.classList.remove('is-swap'); void verdict.offsetWidth; verdict.classList.add('is-swap');
  // the tyre, to scale: the drawn hole is the ring's 105 mm inside (v8 model); the 63 mm clearance sits between the mounts
  fitg.style.setProperty('--tw', Math.min(1, mm / 105).toFixed(3));
  fitDim.textContent = (no ? '100+' : '~' + mm) + ' ' + t('mm tyre');
}
$$('#bike .chip').forEach(b => b.addEventListener('click', () => {
  $$('#bike .chip').forEach(x => x.setAttribute('aria-checked', String(x === b)));
  fitState.bike = b.dataset.bike; fitState.mm = +b.dataset.mm; renderFit();
}));
renderFit();

/* ------------------------------------------- finishes: one sliding outline */
// António's buy block: the dots name the finish, the quantity sets the price on the button
const FIN_NAME = { steel: 'Steel', copper: 'Copper', black: 'Black' };
let qty = 1;
const priceText = () => lang === 'da' ? 'Køb · ' + (999 * qty).toLocaleString('da-DK') + ' kr' : 'Buy · €' + (129 * qty);
function renderBuy() {
  $('#qty-value').textContent = qty;
  $('#buy-label').textContent = priceText();
  // Buy takes the chosen finish and quantity to the buy page
  $('#buy-label').href = `buy.html?finish=${finish}&qty=${qty}`;
  $('#finish-name').textContent = FIN_NAME[finish];
}
$$('[data-qty]').forEach(b => b.addEventListener('click', () => { qty = clamp(qty + +b.dataset.qty, 1, 15); renderBuy(); }));
renderBuy();
// Buy puts the locks in the cart right here (cart-nav.js); the link to buy.html is only the fallback
$('#buy-label').addEventListener('click', e => {
  if (!window.LAAS_CART || window.LAAS_CART.add(finish, qty) === false) return;
  e.preventDefault();
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
    if (!reduce) { swap.from = user.spin; user.goal += Math.PI * 2; swap.sweep = 1; }
    show(f); renderBuy();
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

/* ---------------------------------------------------------- buy: drag */
const zone = $('#dragzone');
let lastX = 0, lastT = 0;
zone.addEventListener('pointerdown', e => { user.dragging = true; user.vel = 0; lastX = e.clientX; lastT = performance.now(); zone.setPointerCapture(e.pointerId); });
zone.addEventListener('pointermove', e => {
  if (!user.dragging) return;
  const now = performance.now(), d = (e.clientX - lastX) * 0.011;
  user.goal += d; user.vel = d / Math.max(8, now - lastT) * 16;
  lastX = e.clientX; lastT = now;
});
const endDrag = () => { user.dragging = false; };
zone.addEventListener('pointerup', endDrag); zone.addEventListener('pointercancel', endDrag);
$$('[data-turn]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); user.goal += +b.dataset.turn * 0.6; }));
$$('[data-turn]').forEach(b => b.addEventListener('pointerdown', e => e.stopPropagation()));
zone.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); user.goal += (e.key === 'ArrowRight' ? 1 : -1) * 0.5; }
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
      const top = Math.round(sec.getBoundingClientRect().top + scrollY), h = sec.offsetHeight;
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
  const insideScroller = el => el && el.closest && el.closest('.menu, .qa p');
  addEventListener('wheel', e => {
    if (e.ctrlKey || insideScroller(e.target)) return;
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
    if (Math.abs(e.touches[0].clientX - tx) > Math.abs(d)) return;
    e.preventDefault();
    if (used || busy() || Math.abs(d) < 12) return;
    used = true; intent(Math.sign(d));
  }, { passive: false });
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    const k = e.key, down = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey), up = k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey);
    if (!down && !up) return;
    // the space bar presses a focused button, opens a question, follows a link; the arrows move inside a radio group
    if (k === ' ' && e.target.closest('button, summary, a, [role="radio"], [role="button"], #dragzone')) return;
    if ((k === 'ArrowUp' || k === 'ArrowDown') && e.target.closest('[role="radiogroup"]')) return;
    e.preventDefault();
    if (!busy()) intent(down ? 1 : -1);
  });
}
