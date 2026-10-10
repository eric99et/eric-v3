// LAAS · Ring-Lock · the buy page
// António's buy block (finish dots, quantity, Buy) beside the real lock in 3D.
// Buy writes, right here, the same line items the old product page writes (via cart-nav.js): localStorage 'laas.cart.v1.en', an array of
// {name, finish, unit, qty, img}, merged by name + finish. No new page.
// ?finish=steel|copper|black (silver also works) and ?qty=1..15 preselect.
// The lock is the landing page's model (images/3d, three.js 0.170, the same studio
// light, tone mapping and per-finish material tweaks as darkroom.js) on a transparent
// canvas. It turns gently on its own until touched; a sideways drag turns it, with
// inertia; an up-and-down swipe still scrolls the page. If WebGL or the model fails,
// the transparent packshot stays.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------------------------------------------------------- cart */
  const CART_KEY = 'laas.cart.v1.en';  // laas.js: 'laas.cart.v1.' + (DA ? 'da' : 'en')
  const PRICE = 129;                    // laas.js LOCK / laas-pdp.js P.full, EUR
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
    $('#qty-value').textContent = qty;
    const label = 'Buy · €' + PRICE * qty;
    $('#buy-btn').textContent = label;
    $('#buybar-btn').textContent = label;
    $('#buy').dataset.metal = finish;
    stage.setAttribute('aria-label', 'The Ring-Lock in ' + name + '. Drag, or use the arrow keys, to turn it.');
    syncTabs();
    still.src = 'images/scenes/finish-' + finish + '.webp';
    if (first) {
      photo.src = 'images/lock-' + finish + '.webp'; photo.alt = 'The Ring-Lock in ' + name + ' on the rear wheel of a bike';
    } else {
      swapImg(photo, 'images/lock-' + finish + '.webp', 'The Ring-Lock in ' + name + ' on the rear wheel of a bike');
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
  $$('[data-qty]').forEach(b => b.addEventListener('click', () => { qty = clamp(qty + +b.dataset.qty, 1, 15); render(false); }));

  /* ------------------------------------------------------- the lock, in 3D */
  const lock3d = (() => {
    const api = { show: () => {} };
    const user = { spin: 0, goal: 0, vel: 0, auto: !reduce, dragging: false, touched: false };
    let mode = null, sx = 0, sy = 0, lastX = 0, lastT = 0;
    const hint = $('#lock-hint');
    const touched = () => { if (!user.touched) { user.touched = true; user.auto = false; hint.classList.add('is-used'); } };
    // a sideways drag turns the ring; an up-and-down swipe is left to the page (touch-action: pan-y)
    stage.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      mode = 'maybe'; sx = lastX = e.clientX; sy = e.clientY; lastT = performance.now(); user.vel = 0;
    });
    stage.addEventListener('pointermove', e => {
      if (!mode) return;
      if (mode === 'maybe') {
        const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { mode = null; return; }
        mode = 'drag'; user.dragging = true; touched(); stage.classList.add('is-drag');
        try { stage.setPointerCapture(e.pointerId); } catch {}
      }
      const now = performance.now(), d = (e.clientX - lastX) * 0.012;
      user.goal += d; user.vel = d / Math.max(8, now - lastT) * 16;
      lastX = e.clientX; lastT = now; api.wake?.();
    });
    const end = () => { mode = null; user.dragging = false; stage.classList.remove('is-drag'); };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end); stage.addEventListener('lostpointercapture', end);
    stage.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); touched(); user.goal += (e.key === 'ArrowRight' ? 1 : -1) * 0.5; api.wake?.();
    });

    const T = 'https://cdn.jsdelivr.net/npm/three@0.170.0/';
    Promise.all([import(T + '+esm'), import(T + 'examples/jsm/loaders/GLTFLoader.js/+esm'), import(T + 'examples/jsm/libs/meshopt_decoder.module.js/+esm')]).then(([THREE, { GLTFLoader }, { MeshoptDecoder }]) => {
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return; }
      const phone = () => innerWidth <= 760;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      // Khronos PBR Neutral: true product colour, no orange shift in the copper (as darkroom.js)
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0, 0);
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      stage.prepend(canvas);
      const cl = (x) => Math.min(1, Math.max(0, x));

      // darkroom.js studio(): a bright studio (dome + softboxes) for a light page, with one cool rim
      function studio(rim = true, low = false) {
        const scene = new THREE.Scene();
        const ss = (a, b, x) => { const u = cl((x - a) / (b - a)); return u * u * (3 - 2 * u); };
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
      const pm = new THREE.PMREMGenerator(renderer);
      const envTint = pm.fromScene(studio(true), 0).texture, envNeutral = pm.fromScene(studio(false), 0).texture, envBlack = pm.fromScene(studio(true, true), 0).texture;
      pm.dispose();
      scene.environment = envNeutral;
      const camera = new THREE.PerspectiveCamera(22, 1, 0.01, 50);

      // darkroom.js load(): the same files, the same material tweaks per finish
      const FILES = { steel: 'ring-lock-silver.glb', copper: 'ring-lock-copper.glb', black: 'ring-lock-black.glb' };
      const METAL = { steel: { env: 1.15, exp: 0.98, rot: 0.9 }, copper: { env: 1.1, exp: 1.0, rot: 0 }, black: { env: 1.4, exp: 1.3, rot: 2.4 } };
      const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const models = {};
      const load = f => models[f] || (models[f] = new Promise((res, rej) => gltfLoader.load('images/3d/' + FILES[f] + '?v=7f891b83', res, undefined, rej)).then(gltf => {
        const group = new THREE.Group(), model = gltf.scene;
        group.add(model);
        const box = new THREE.Box3().setFromObject(model);
        model.position.sub(box.getCenter(new THREE.Vector3()));
        const size = box.getSize(new THREE.Vector3());
        model.traverse(o => {
          if (!o.isMesh) return;
          o.frustumCulled = false;
          if (f === 'black') {
            const mats = [].concat(o.material).map(m => {
              if (!/satin steel/i.test(m.name)) return m;
              const c = m.clone(); c.roughness = 0.58; c.envMapIntensity = 0.45; c.color.multiplyScalar(0.7); return c;
            });
            o.material = mats.length === 1 ? mats[0] : mats;
          }
          if (f !== 'steel') [].concat(o.material).forEach(m => { if (m.metalness > 0.6 && !/shackle/i.test(m.name)) m.roughness = Math.min(m.roughness, 0.28); });
          if (f === 'steel') [].concat(o.material).forEach(m => { if (/shackle/i.test(m.name)) m.roughness = 0.05; else if (/brushed|satin steel/i.test(m.name)) { m.roughness = 0.24; } });
        });
        // the Lock animation, held at its end: the bolt closed, as on the landing page's buy chapter
        const clip = gltf.animations.find(a => a.name === 'Lock');
        if (clip) { const mixer = new THREE.AnimationMixer(model); mixer.clipAction(clip).play(); mixer.setTime(clip.duration - 1e-4); }
        group.visible = false; scene.add(group);
        renderer.compile(scene, camera);
        return { group, radius: Math.max(size.x, size.y, size.z) * 0.5 };
      }));

      let model = null, envRot = 0, want = finish, sweep = 0;
      const setModel = (m, f) => {
        if (model) model.group.visible = false;
        m.group.visible = true; model = m;
        scene.environmentIntensity = METAL[f].env;
        renderer.toneMappingExposure = METAL[f].exp;
        envRot = METAL[f].rot;
        scene.environment = f === 'steel' ? envNeutral : f === 'black' ? envBlack : envTint;
      };
      api.show = f => {
        want = f;
        load(f).then(m => {
          if (want !== f) return;
          if (!reduce) { user.goal += Math.PI * 0.5; sweep = 1; }   // a quarter turn as the metal changes
          setModel(m, f); api.wake();
        }, () => {});
      };

      // size and the floor shadow
      let W = 0, H = 0;
      const resize = () => {
        W = stage.clientWidth; H = stage.clientHeight;
        if (!W || !H) return;
        renderer.setSize(W, H, false);
        camera.aspect = W / H; camera.updateProjectionMatrix();
        api.wake();
      };
      new ResizeObserver(resize).observe(stage);

      // the loop: runs while the lock is on screen and moving
      let raf = 0, last = performance.now(), visible = true, shown = false;
      const t0 = last;
      const frame = now => {
        raf = 0;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (!model || !W) return;
        if (!user.dragging) {
          user.goal += user.vel; user.vel *= 0.93;
          if (Math.abs(user.vel) < 1e-4) user.vel = 0;
          // untouched, it sways slowly either side of the three-quarter view (never edge-on)
          if (user.auto) user.goal = Math.sin((now - t0) / 1000 * 0.45) * 0.75;
        }
        user.spin = user.dragging || reduce ? user.goal : user.spin + (user.goal - user.spin) * (1 - Math.exp(-6 * dt));
        sweep *= Math.exp(-2.5 * dt);
        const time = (now - t0) / 1000;
        const bob = reduce ? 0 : Math.sin(time * 0.31) * 0.03;
        // the landing page's buy pose: three-quarter, a little from above
        model.group.rotation.set(-0.16 + bob, -0.62 + user.spin, 0.1, 'XYZ');
        scene.environmentRotation.y = envRot + sweep * 1.2 + (reduce ? 0 : Math.sin(time * 0.35) * 0.08);
        // the ring's diameter: about 62% of the width on a phone, a little less on a desktop
        const px = phone() ? Math.min(W * 0.62, H * 0.74) : Math.min(W * 0.56, H * 0.66);
        const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const dist = model.radius * H / (tan * px);
        camera.position.set(0, 0, dist); camera.near = dist / 30; camera.far = dist * 6;
        camera.lookAt(0, 0, 0);
        stage.style.setProperty('--fy', (H / 2 + px * 0.56) + 'px');
        stage.style.setProperty('--fw', (px * 0.9) + 'px');
        renderer.render(scene, camera);
        if (!shown) { shown = true; stage.classList.add('is-3d'); }
        // the slow bob keeps it alive; with reduced motion it only draws while it moves
        const moving = !reduce || user.dragging || Math.abs(user.goal - user.spin) > 1e-3 || user.vel !== 0;
        if (visible && moving) raf = requestAnimationFrame(frame);
      };
      api.wake = () => { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) api.wake(); }).observe(stage);

      // the chosen finish first, then the other two
      load(finish).then(m => { setModel(m, finish); resize(); api.wake(); ['steel', 'copper', 'black'].forEach(f => f !== finish && load(f).catch(() => {})); })
        .catch(() => { canvas.remove(); });
    }).catch(() => { /* no 3D: the packshot stays */ });
    return api;
  })();

  // Buy: the locks go in the cart, then the cart page
  // Buy puts the locks in the cart right here, no new page and no question on the way (the cart offers the
  // Flex Mount); cart-nav.js shows what was added, with Check out one tap away
  const buy = () => {
    const ok = window.LAAS_CART ? window.LAAS_CART.add(finish, qty) : addLocks(finish, qty);
    if (ok === 0) { $('#buy-status').textContent = 'Your cart already has 15 locks, the most in one order.'; return; }
    if (ok === false) { $('#buy-status').textContent = 'Your browser blocked the cart. Turn off private mode and try again.'; return; }
    $('#buy-status').textContent = (ok === true ? qty : ok) + ' Ring-Lock in ' + NAME[finish] + ' added to your cart.';
    ['#buy-btn', '#buybar-btn'].forEach(sel => {
      const btn = $(sel); btn.classList.add('is-added'); btn.textContent = 'Added';
      setTimeout(() => { btn.classList.remove('is-added'); render(true); }, 1600);
    });
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
  addEventListener('storage', e => { if (e.key === CART_KEY) paintCart(); });

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
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = 'Close';
    requestAnimationFrame(() => menu.classList.add('is-open'));
    $('main').inert = true;
    setTimeout(() => menu.querySelector('a')?.focus(), 50);
  }
  function closeMenu(refocus = true) {
    if (menu.hidden) return;
    menu.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu';
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
