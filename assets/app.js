/* Portfolio v2. Plain JavaScript, no dependencies, no network requests.
   Everything comes from data.js (window.PROFILE). Text is always inserted with textContent
   (never innerHTML), and every URL / file path is validated before use. */
(() => {
  'use strict';

  let P = window.PROFILE || {};
  const ICONS = window.TECH_ICONS || {};
  const PARAMS = new URLSearchParams(location.search);
  const PREVIEW = PARAMS.has('preview');          // used by editor.html (live preview)

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const safeUrl = (u) => (/^(https?:|mailto:)/i.test(u || '') ? u : null);
  const safeFile = (u) => ((/^(?:\.?\/)?assets\/[^\s"'<>\\]+$/i.test(u || '') || /^https:\/\/[^\s"'<>]+$/i.test(u || '') ||
    (PREVIEW && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+\/=]+$/.test(u || ''))) ? u : null);
  const ext = (u) => ((u || '').split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
  const baseName = (u) => decodeURIComponent((u || '').split('?')[0].split('/').pop() || 'file');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = {
    get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) { /* private mode */ } }
  };

  /* ------------------------------------------------------------------ derived values */
  let NAME, HANDLE, HOST, INITIAL, LOGO, links, linkEntries, email;
  const THEMES = ['green', 'blue', 'amber', 'purple'];
  function derive() {
    NAME = P.name || 'Your Name';
    HANDLE = P.handle || 'you';
    HOST = P.host || 'devops';
    INITIAL = (NAME.trim()[0] || 'Z').toUpperCase();
    LOGO = [' .-----. ', '|   ' + INITIAL + '   |', " '-----' "];
    links = P.links || {};
    linkEntries = Object.keys(links).filter((k) => safeUrl(links[k])).map((k) => [k, links[k]]);
    email = P.email || '';
  }

  /* ------------------------------------------------------------------ theme */
  let accentRGB = [63, 185, 80];
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const hexToRgb = (hex) => {
    hex = (hex || '').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const n = parseInt(hex, 16);
    return Number.isNaN(n) ? [63, 185, 80] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  function applyTheme(name) {
    if (THEMES.indexOf(name) < 0) name = 'green';
    document.documentElement.setAttribute('data-theme', name);
    $('#themeName').textContent = name;
    store.set('theme', name);
    accentRGB = hexToRgb(cssVar('--accent'));
    return name;
  }
  const currentTheme = () => document.documentElement.getAttribute('data-theme') || 'green';

  /* ------------------------------------------------------------------ technology icons */
  const NS = 'http://www.w3.org/2000/svg';
  const ALIAS = window.TECH_ALIAS || {};
  function iconKey(name) {
    const raw = String(name || '').toLowerCase().trim();
    if (ICONS[raw]) return raw;
    const k = raw.replace(/[\s\-_.]/g, '');
    if (ICONS[k]) return k;
    if (ALIAS[k] && ICONS[ALIAS[k]]) return ALIAS[k];
    if (ALIAS[raw] && ICONS[ALIAS[raw]]) return ALIAS[raw];
    return null;
  }
  const lum = (hex) => { const [r, g, b] = hexToRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  function iconSvg(key) {
    const i = ICONS[key];
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', i.p);
    p.setAttribute('fill', lum(i.h) < 0.24 ? '#e6edf3' : '#' + i.h);   // very dark logos stay visible on dark background
    svg.appendChild(p);
    return svg;
  }
  function techChip(name) {
    const key = iconKey(name);
    const s = el('span', 'tech');
    if (key) { s.appendChild(iconSvg(key)); s.appendChild(document.createTextNode(ICONS[key].t)); s.title = ICONS[key].t; }
    else { s.appendChild(document.createTextNode(String(name))); }
    return s;
  }
  const iconFor = (key) => { const k = iconKey(key); return k ? iconSvg(k) : null; };

  /* ------------------------------------------------------------------ helpers: visibility, filters */
  function setVisible(id, on) {
    const s = document.getElementById(id);
    if (s) s.hidden = !on;
    const a = $('#navLinks a[data-sec="' + id + '"]');
    if (a) a.hidden = !on;
  }
  function buildFilters(box, options, onPick) {
    box.textContent = '';
    if (options.length < 2) return;                    // nothing to filter
    options.forEach(([id, label], i) => {
      const b = el('button', 'chip' + (i === 0 ? ' on' : ''), label);
      b.type = 'button'; b.dataset.f = id;
      b.addEventListener('click', () => {
        $$('.chip', box).forEach((c) => c.classList.toggle('on', c === b));
        onPick(id);
      });
      box.appendChild(b);
    });
  }
  const CAT_COLORS = ['#58a6ff', '#3fb950', '#bc8cff', '#f0883e', '#d29922', '#ff7b72', '#39c5cf', '#e3b341'];

  /* ------------------------------------------------------------------ lightbox (zoom any image / PDF) */
  const lb = { list: [], i: 0, opener: null, open: false };
  function lbRender() {
    const it = lb.list[lb.i];
    const img = $('#lbImg'), pdf = $('#lbPdf'), stage = $('#lbStage');
    stage.classList.remove('zoomed');
    if (it.pdf) { img.hidden = true; pdf.hidden = false; pdf.src = it.src; }
    else { pdf.hidden = true; pdf.removeAttribute('src'); img.hidden = false; img.src = it.src; img.alt = it.caption || ''; }
    $('#lbCap').textContent = it.caption || '';
    $('#lbCount').textContent = lb.list.length > 1 ? (lb.i + 1) + ' / ' + lb.list.length : '';
    $('#lbPrev').hidden = $('#lbNext').hidden = lb.list.length < 2;
  }
  function openLightbox(list, i, opener) {
    if (!list.length) return;
    lb.list = list; lb.i = i; lb.opener = opener || null; lb.open = true;
    $('#lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
    lbRender();
    $('#lbClose').focus();
  }
  function closeLightbox() {
    if (!lb.open) return;
    lb.open = false;
    $('#lightbox').hidden = true;
    $('#lbImg').removeAttribute('src'); $('#lbPdf').removeAttribute('src');
    document.body.style.overflow = '';
    if (lb.opener && lb.opener.focus) lb.opener.focus();
  }
  const lbStep = (d) => { lb.i = (lb.i + d + lb.list.length) % lb.list.length; lbRender(); };
  function bindLightbox() {
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', () => lbStep(-1));
    $('#lbNext').addEventListener('click', () => lbStep(1));
    $('#lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox' || e.target.id === 'lbFig') closeLightbox(); });
    $('#lbImg').addEventListener('click', () => $('#lbStage').classList.toggle('zoomed'));
    document.addEventListener('keydown', (e) => {
      if (!lb.open) return;
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
      else if (e.key === 'ArrowRight' && lb.list.length > 1) lbStep(1);
      else if (e.key === 'ArrowLeft' && lb.list.length > 1) lbStep(-1);
      else if (e.key === 'Tab') {   // keep focus inside the dialog
        const f = $$('#lightbox button').filter((b) => !b.hidden);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  /* make any element open the lightbox when clicked / activated with the keyboard */
  function zoomable(node, list, index) {
    node.classList.add('zoomable');
    if (!/^(button|a)$/i.test(node.tagName)) { node.tabIndex = 0; node.setAttribute('role', 'button'); }
    node.setAttribute('aria-label', 'View larger: ' + (list[index].caption || 'image'));
    node.appendChild(el('span', 'zoom-hint', '⤢'));
    const go = (e) => { if (node.dataset.broken) return; e.preventDefault(); openLightbox(list, index, node); };
    node.addEventListener('click', go);
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') go(e); });
  }
  const mediaItem = (src, caption) => ({ src, caption, pdf: ext(src) === 'pdf' });

  /* ------------------------------------------------------------------ boot sequence */
  function boot() {
    const root = $('#boot');
    const finish = () => {
      document.body.classList.remove('booting');
      if (root) { root.classList.add('gone'); setTimeout(() => root.remove(), 700); }
    };
    if (!root || reduce || PREVIEW || store.get('booted', true)) {
      if (root) root.remove();
      document.body.classList.remove('booting');
      return Promise.resolve();
    }
    store.set('booted', '1', true);
    const log = $('#bootlog');
    const ok = (t) => ['[  ', ['OK', 'ok'], '  ] ' + t];
    const units = arr(P.skills).reduce((n, g) => n + arr(g.items).length, 0);
    const lines = [
      ['Booting ', [HOST + '.os', 'info'], ' (portfolio kernel 2.0)'],
      ok('Started Network Time Synchronization.'),
      ok('Mounted /home/' + HANDLE + '/projects.'),
      ok('Reached target Containers (docker, kubernetes).'),
      ok('Started CI/CD Pipeline Runner.'),
      ok('Loaded skills.service (' + units + ' units).'),
      ['[ ', ['INFO', 'info'], ' ] Starting portfolio.service for ' + NAME + '...'],
      ok('Reached target Graphical Interface.')
    ];
    let skipped = false;
    const skip = () => { skipped = true; };
    window.addEventListener('keydown', skip, { once: true });
    root.addEventListener('click', skip, { once: true });
    root.addEventListener('touchstart', skip, { once: true, passive: true });
    return (async () => {
      for (const parts of lines) {
        if (skipped) break;
        const line = document.createElement('div');
        parts.forEach((p) => {
          if (Array.isArray(p)) line.appendChild(el('span', p[1], p[0])); else line.appendChild(document.createTextNode(p));
        });
        log.appendChild(line);
        await sleep(110 + Math.random() * 90);
      }
      if (!skipped) await sleep(420);
      finish();
    })();
  }

  /* ------------------------------------------------------------------ background network */
  function network() {
    const c = $('#net');
    const ctx = c.getContext('2d');
    let w = 0, h = 0, nodes = [], packets = [], raf = 0, frame = 0;
    const mouse = { x: -999, y: -999 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + 'px'; c.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(80, Math.max(26, (w * h) / 22000)));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3
      }));
      packets = [];
      if (reduce) draw(false);
    }

    function draw(animate) {
      frame++;
      if (frame % 40 === 0) accentRGB = hexToRgb(cssVar('--accent'));
      const [r, g, b] = accentRGB;
      ctx.clearRect(0, 0, w, h);
      const R = 150;
      if (animate) {
        nodes.forEach((n) => {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        });
      }
      const edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.hypot(dx, dy);
          if (d < R) {
            edges.push([i, j]);
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / R) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
        const md = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
        if (md < 170) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - md / 170) * 0.55})`;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      nodes.forEach((n) => {
        ctx.fillStyle = `rgba(${r},${g},${b},.55)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, 6.2832); ctx.fill();
      });
      if (animate) {
        if (edges.length && packets.length < 14 && Math.random() < 0.08) {
          const e = edges[(Math.random() * edges.length) | 0];
          packets.push({ a: nodes[e[0]], b: nodes[e[1]], t: 0, s: 0.012 + Math.random() * 0.012 });
        }
        packets = packets.filter((p) => (p.t += p.s) < 1);
      }
      packets.forEach((p) => {
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.fillStyle = `rgba(${r},${g},${b},.95)`;
        ctx.shadowColor = `rgb(${r},${g},${b})`; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.2832); ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    function loop() { draw(true); raf = requestAnimationFrame(loop); }
    window.addEventListener('resize', (() => { let t; return () => { clearTimeout(t); t = setTimeout(resize, 150); }; })());
    window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    document.addEventListener('visibilitychange', () => {
      if (reduce) return;
      if (document.hidden) cancelAnimationFrame(raf); else loop();
    });
    resize();
    if (!reduce) loop();
  }

  /* ------------------------------------------------------------------ hero + photo */
  const T0 = Date.now();
  let loadMs = 0, roleTimer = 0;
  window.addEventListener('load', () => {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    setTimeout(() => { loadMs = Math.round(nav && nav.loadEventEnd ? nav.loadEventEnd : performance.now()); }, 0);
  });

  function hero() {
    const h1 = $('#name');
    h1.textContent = NAME; h1.setAttribute('data-text', NAME);
    $('#tagline').textContent = P.tagline || '';
    $('#brandPs').textContent = HANDLE + '@' + HOST;
    $('#ps1').textContent = 'guest@portfolio:~$';
    if (P.availability) { $('#availText').textContent = P.availability; $('#availability').hidden = false; } else { $('#availability').hidden = true; }
    $('#mailBtn').href = email ? 'mailto:' + email : '#contact';
    $('#cvBtn').hidden = !arr(P.cvs).some((c) => safeFile(c.file));

    const roles = arr(P.roles).length ? P.roles : ['Engineer'];
    const node = $('#role');
    clearTimeout(roleTimer);
    if (reduce) { node.textContent = roles[0]; } else {
      let r = 0, i = 0, del = false;
      const tick = () => {
        const word = roles[r % roles.length];
        if (!del) {
          i++; node.textContent = word.slice(0, i);
          if (i === word.length) { del = true; roleTimer = setTimeout(tick, 1500); return; }
          roleTimer = setTimeout(tick, 70); return;
        }
        i--; node.textContent = word.slice(0, i);
        if (i === 0) { del = false; r = (r + 1) % roles.length; roleTimer = setTimeout(tick, 320); return; }
        roleTimer = setTimeout(tick, 32);
      };
      tick();
    }

    // live system panel: every value is real (browser + session), nothing invented
    const rows = [
      ['host', () => location.hostname || 'localhost'],
      ['uptime', () => { const s = Math.floor((Date.now() - T0) / 1000); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':'); }],
      ['loaded', () => (loadMs ? loadMs + ' ms' : 'n/a')],
      ['viewport', () => innerWidth + ' x ' + innerHeight],
      ['network', () => (navigator.connection && navigator.connection.effectiveType) || 'n/a'],
      ['theme', () => currentTheme()],
      ['time', () => new Date().toLocaleTimeString()]
    ];
    const dl = $('#statusList');
    if (!dl.children.length) {
      const dds = rows.map(([k]) => { dl.appendChild(el('dt', null, k)); const dd = el('dd'); dl.appendChild(dd); return dd; });
      const update = () => rows.forEach((r, i) => { dds[i].textContent = r[1](); });
      update();
      setInterval(update, 1000);
    }
  }

  function photo() {
    const img = $('#photoImg'), av = $('#avatar');
    av.textContent = INITIAL; av.hidden = false; img.hidden = true;
    const src = safeFile(P.photo);
    if (!src) return;
    img.alt = P.photoAlt || NAME;
    img.onload = () => { img.hidden = false; av.hidden = true; };
    img.onerror = () => { img.hidden = true; av.hidden = false; };
    img.src = src;
    if (!img.dataset.zoom) {
      img.dataset.zoom = '1';
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => { if (!img.hidden) openLightbox([mediaItem(img.getAttribute('src'), NAME)], 0, img); });
    }
  }

  /* ------------------------------------------------------------------ sections */
  function about() {
    const box = $('#aboutText'); box.textContent = '';
    arr(P.about).forEach((t) => box.appendChild(el('p', null, t)));
    $('.neo-logo').textContent = LOGO.join('\n');
    const dl = $('#facts'); dl.textContent = '';
    arr(P.facts).forEach(([k, v]) => { dl.appendChild(el('dt', null, k)); dl.appendChild(el('dd', null, v)); });
  }

  function experience() {
    const list = arr(P.experience), ol = $('#expList');
    ol.textContent = '';
    setVisible('experience', list.length > 0);
    list.forEach((j, idx) => {
      const li = el('li', 'job'); li.style.setProperty('--i', idx);
      const meta = el('div', 'job-meta');
      meta.appendChild(el('span', 'period', j.period || ''));
      if (j.location) meta.appendChild(el('span', null, j.location));
      const card = el('div', 'job-card');
      const head = el('div', 'job-head');
      const logo = safeFile(j.logo);
      if (logo) { const im = el('img', 'job-logo'); im.alt = ''; im.loading = 'lazy'; im.onerror = () => im.remove(); im.src = logo; head.appendChild(im); }
      const ht = el('div'); ht.appendChild(el('h3', null, j.role || '')); ht.appendChild(el('div', 'co', j.company || ''));
      head.appendChild(ht);
      if (/present|now|current/i.test(j.period || '')) head.appendChild(el('span', 'now', 'current'));
      card.appendChild(head);
      const ul = el('ul'); arr(j.points).forEach((p) => ul.appendChild(el('li', null, p)));
      if (ul.children.length) card.appendChild(ul);
      const techs = el('div', 'techs'); arr(j.tags).forEach((t) => techs.appendChild(techChip(t)));
      if (techs.children.length) card.appendChild(techs);
      li.appendChild(meta); li.appendChild(card); ol.appendChild(li);
    });
  }

  function skills() {
    const grid = $('#skillGrid'); grid.textContent = '';
    setVisible('skills', arr(P.skills).length > 0);
    arr(P.skills).forEach((g) => {
      const card = el('div', 'skill-card');
      card.appendChild(el('h3', null, g.group));
      arr(g.items).forEach((s) => {
        const lvl = s.level === 'learning' ? 'learning' : 'running';
        const row = el('div', 'skill ' + lvl);
        row.tabIndex = 0; row.dataset.level = lvl;
        row.appendChild(el('span', 'd'));
        const ic = iconFor(s.name);
        if (ic) { ic.style.cssText = 'width:15px;height:15px;flex:none'; row.appendChild(ic); }
        row.appendChild(el('span', null, s.name));
        row.appendChild(el('span', 'st', lvl === 'learning' ? 'Learning' : 'Running'));
        if (s.note) row.appendChild(el('span', 'tip', s.note));
        card.appendChild(row);
      });
      grid.appendChild(card);
    });
    buildFilters($('#skillFilters'), [['all', 'all'], ['running', 'running'], ['learning', 'learning']],
      (f) => $$('.skill', grid).forEach((s) => s.classList.toggle('hide', f !== 'all' && s.dataset.level !== f)));
  }

  /* image slot on top of a card: zoomable image, or a clean placeholder when missing */
  function makeShot(srcRaw, label, list, index) {
    const shot = el('div', 'shot');
    const src = safeFile(srcRaw);
    const placeholder = () => {
      shot.classList.add('ph'); shot.dataset.broken = '1';
      const z = $('.zoom-hint', shot); if (z) z.remove();
      shot.classList.remove('zoomable');
      shot.appendChild(el('span', 'mono', (label || '?').trim().slice(0, 2).toUpperCase()));
    };
    if (src) {
      const img = el('img'); img.alt = (label || 'Preview') + ' preview'; img.loading = 'lazy'; img.decoding = 'async';
      img.addEventListener('error', () => { img.remove(); placeholder(); });
      img.src = src; shot.appendChild(img);
      zoomable(shot, list, index);
    } else { placeholder(); }
    return shot;
  }

  function projects() {
    const grid = $('#projectGrid'); grid.textContent = '';
    const items = arr(P.projects);
    setVisible('projects', items.length > 0);
    const cats = arr(P.categories);
    const labelOf = (id) => (cats.find((c) => c.id === id) || {}).label || (id.charAt(0).toUpperCase() + id.slice(1));
    const colorOf = (id) => CAT_COLORS[Math.max(0, cats.findIndex((c) => c.id === id)) % CAT_COLORS.length];
    const used = [];
    items.forEach((p) => arr(p.category).forEach((c) => { if (used.indexOf(c) < 0) used.push(c); }));
    const ordered = cats.map((c) => c.id).filter((id) => used.indexOf(id) >= 0).concat(used.filter((id) => !cats.some((c) => c.id === id)));
    buildFilters($('#projectFilters'), [['all', 'All']].concat(ordered.map((id) => [id, labelOf(id)])),
      (f) => $$('.project', grid).forEach((card) => card.classList.toggle('hide', f !== 'all' && card.dataset.cats.split(' ').indexOf(f) < 0)));

    const shots = [], shotIndex = new Map();
    items.forEach((p, i) => { const s = safeFile(p.image); if (s) { shotIndex.set(i, shots.length); shots.push(mediaItem(s, p.name)); } });

    items.forEach((p, idx) => {
      const card = el('article', 'project' + (p.sample ? ' sample' : ''));
      card.dataset.cats = arr(p.category).join(' ');
      const shot = makeShot(p.image, p.name, shots, shotIndex.get(idx));
      if (p.status) shot.appendChild(el('span', 'status-badge', p.status));
      card.appendChild(shot);

      const h = el('h3'); h.appendChild(el('span', null, p.name)); card.appendChild(h);
      if (arr(p.category).length) {
        const cs = el('div', 'cats');
        arr(p.category).forEach((id) => { const c = el('span', 'cat', labelOf(id)); c.style.color = colorOf(id); cs.appendChild(c); });
        card.appendChild(cs);
      }
      card.appendChild(el('p', null, p.description));
      if (arr(p.tech).length) { const t = el('div', 'techs'); arr(p.tech).forEach((x) => t.appendChild(techChip(x))); card.appendChild(t); }
      if (arr(p.tags).length) { const t = el('div', 'tags'); arr(p.tags).forEach((x) => t.appendChild(el('span', null, x))); card.appendChild(t); }
      const acts = el('div', 'p-actions');
      const demo = safeUrl(p.demo), repo = safeUrl(p.url);
      if (demo) { const a = el('a', 'btn small primary', 'Live demo ↗'); a.href = demo; a.target = '_blank'; a.rel = 'noopener noreferrer'; acts.appendChild(a); }
      if (repo) { const a = el('a', 'btn small', 'Source code'); a.href = repo; a.target = '_blank'; a.rel = 'noopener noreferrer'; acts.appendChild(a); }
      if (acts.children.length) card.appendChild(acts);

      if (!reduce) {
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.style.transform = `perspective(800px) rotateX(${((0.5 - y) * 5).toFixed(2)}deg) rotateY(${((x - 0.5) * 7).toFixed(2)}deg)`;
          card.style.setProperty('--mx', (x * 100) + '%'); card.style.setProperty('--my', (y * 100) + '%');
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
      }
      grid.appendChild(card);
    });
  }

  function volunteering() {
    const list = arr(P.volunteering), grid = $('#volGrid');
    grid.textContent = '';
    setVisible('volunteering', list.length > 0);
    const imgs = [], idx = new Map();
    list.forEach((v, i) => { if (safeFile(v.image)) { idx.set(i, imgs.length); imgs.push(mediaItem(v.image, [v.role, v.organization].filter(Boolean).join(' - '))); } });
    list.forEach((v, i) => {
      const card = el('article', 'project vol' + (v.sample ? ' sample' : ''));
      card.appendChild(makeShot(v.image, v.role || v.organization, imgs, idx.get(i)));
      card.appendChild(el('h3', null, v.role || ''));
      card.appendChild(el('div', 'by', [v.organization, v.period].filter(Boolean).join('  ·  ')));
      if (v.description) card.appendChild(el('p', null, v.description));
      if (arr(v.tags).length) { const t = el('div', 'tags'); arr(v.tags).forEach((x) => t.appendChild(el('span', null, x))); card.appendChild(t); }
      const l = safeUrl(v.link);
      if (l) { const acts = el('div', 'p-actions'); const a = el('a', 'btn small', 'Learn more ↗'); a.href = l; a.target = '_blank'; a.rel = 'noopener noreferrer'; acts.appendChild(a); card.appendChild(acts); }
      grid.appendChild(card);
    });
  }

  function certThumb(src, caption, list, index) {
    if (!safeFile(src)) return null;
    const pdf = ext(src) === 'pdf';
    const b = el('div', 'cert-thumb' + (pdf ? ' pdf' : ''));
    if (pdf) { b.appendChild(el('span', null, 'PDF certificate')); } else {
      const img = el('img'); img.alt = caption; img.loading = 'lazy'; img.decoding = 'async';
      img.addEventListener('error', () => { img.remove(); b.classList.add('pdf'); b.dataset.broken = '1'; b.appendChild(el('span', null, 'image not found')); });
      img.src = src; b.appendChild(img);
    }
    zoomable(b, list, index);
    return b;
  }

  function courses() {
    const list = arr(P.courses), box = $('#courseList');
    box.textContent = '';
    const tracks = arr(P.library && P.library.tracks);
    setVisible('learning', list.length > 0 || tracks.length > 0);
    const kinds = [];
    list.forEach((c) => { if (kinds.indexOf(c.kind || 'course') < 0) kinds.push(c.kind || 'course'); });
    const kindLabel = (k) => (k === 'training' ? 'Training' : 'Courses');
    buildFilters($('#courseFilters'), kinds.length > 1 ? [['all', 'All']].concat(kinds.map((k) => [k, kindLabel(k)])) : [['all', 'All']],
      (f) => $$('.course', box).forEach((c) => c.classList.toggle('hide', f !== 'all' && c.dataset.kind !== f)));
    const certs = [], certIndex = new Map();
    list.forEach((c, i) => { if (safeFile(c.certificate)) { certIndex.set(i, certs.length); certs.push(mediaItem(c.certificate, c.title + ' - certificate')); } });
    list.forEach((c, i) => {
      const card = el('article', 'course' + (c.sample ? ' sample' : ''));
      card.dataset.kind = c.kind || 'course';
      const info = el('div');
      info.appendChild(el('div', 'kind', c.kind === 'training' ? 'Training' : 'Course'));
      info.appendChild(el('h3', null, c.title));
      info.appendChild(el('div', 'by', [c.provider, c.date, c.duration].filter(Boolean).join('  ·  ')));
      const tags = el('div', 'techs'); arr(c.topics).forEach((t) => tags.appendChild(techChip(t)));
      if (tags.children.length) { tags.style.marginBottom = '14px'; info.appendChild(tags); }
      const v = safeUrl(c.verifyUrl);
      if (v) { const a = el('a', 'btn small', 'Validate certificate ↗'); a.href = v; a.target = '_blank'; a.rel = 'noopener noreferrer'; info.appendChild(a); }
      card.appendChild(info);
      const side = el('div');
      const th = certIndex.has(i) ? certThumb(c.certificate, c.title + ' certificate', certs, certIndex.get(i)) : null;
      if (th) { side.appendChild(th); side.appendChild(el('span', 'cert-label', 'Certificate - click to enlarge')); }
      else { side.appendChild(el('div', 'no-cert', 'No certificate added yet')); }
      card.appendChild(side);
      box.appendChild(card);
    });
    library();
  }

  function library() {
    const lib = P.library || {}, tracks = arr(lib.tracks), box = $('#library');
    box.textContent = '';
    box.hidden = tracks.length === 0;
    if (!tracks.length) return;
    box.appendChild(el('h3', null, lib.title || 'Course library'));
    if (lib.note) box.appendChild(el('p', null, lib.note));
    const row = el('div', 'tracks');
    tracks.forEach((t) => {
      const url = safeUrl(t.url);
      const a = el(url ? 'a' : 'span', 'track');
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; } else { a.setAttribute('aria-disabled', 'true'); }
      const ic = iconFor(t.tech || t.label); if (ic) a.appendChild(ic);
      a.appendChild(el('span', null, t.label));
      a.appendChild(el('small', null, url ? '↗' : 'soon'));
      row.appendChild(a);
    });
    box.appendChild(row);
  }

  function certificates() {
    const list = arr(P.certificates), grid = $('#certGrid'), cbox = $('#credly');
    grid.textContent = ''; cbox.textContent = '';
    const credlyUrl = safeUrl(links.credly);
    setVisible('certificates', list.length > 0 || !!credlyUrl);
    const imgs = [], idxMap = new Map();
    list.forEach((c, i) => { if (safeFile(c.image)) { idxMap.set(i, imgs.length); imgs.push(mediaItem(c.image, c.title + ' - ' + (c.issuer || ''))); } });
    list.forEach((c, i) => {
      const card = el('article', 'cert' + (c.sample ? ' sample' : ''));
      const th = idxMap.has(i) ? certThumb(c.image, c.title, imgs, idxMap.get(i)) : null;
      if (th) card.appendChild(th);
      const body = el('div', 'cert-body');
      body.appendChild(el('h3', null, c.title));
      body.appendChild(el('div', 'issuer', c.issuer || ''));
      body.appendChild(el('div', 'meta', [c.date, c.credentialId ? 'ID: ' + c.credentialId : ''].filter(Boolean).join('  ·  ')));
      const v = safeUrl(c.verifyUrl);
      if (v) { const a = el('a', 'btn small primary validate', 'Validate ↗'); a.href = v; a.target = '_blank'; a.rel = 'noopener noreferrer'; body.appendChild(a); }
      else { const s = el('span', 'btn small validate', 'Validation link soon'); s.setAttribute('aria-disabled', 'true'); body.appendChild(s); }
      card.appendChild(body);
      grid.appendChild(card);
    });
    if (credlyUrl) {
      const ic = iconFor('credly'); if (ic) cbox.appendChild(ic);
      const p = el('p'); p.appendChild(el('strong', null, 'Digital badges on Credly'));
      p.appendChild(document.createTextNode('Every badge is verifiable on my public Credly profile.'));
      cbox.appendChild(p);
      const a = el('a', 'btn primary', 'View on Credly ↗'); a.href = credlyUrl; a.target = '_blank'; a.rel = 'noopener noreferrer'; cbox.appendChild(a);
    }
  }

  function cvs() {
    const list = arr(P.cvs).filter((c) => safeFile(c.file));
    const tabs = $('#cvTabs'), view = $('#cvView');
    tabs.textContent = ''; view.textContent = '';
    setVisible('cv', list.length > 0);
    if (!list.length) return;
    function show(i) {
      const c = list[i], file = c.file, pdf = ext(file) === 'pdf';
      $$('.cv-tab', tabs).forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      view.textContent = '';
      view.classList.toggle('sample', !!c.sample);
      const bar = el('div', 'cv-bar');
      bar.appendChild(el('span', 'name', c.label));
      if (c.updated) bar.appendChild(el('span', 'upd', 'updated ' + c.updated));
      const dl = el('a', 'btn small primary', '⬇ Download'); dl.href = file; dl.setAttribute('download', baseName(file)); dl.id = 'cvDownload';
      const op = el('a', 'btn small', 'Open ↗'); op.href = file; op.target = '_blank'; op.rel = 'noopener noreferrer';
      const fs = el('button', 'btn small', '⤢ Full screen'); fs.type = 'button'; fs.id = 'cvFull';
      fs.addEventListener('click', () => openLightbox([mediaItem(file, c.label)], 0, fs));
      bar.appendChild(dl); bar.appendChild(op); bar.appendChild(fs);
      view.appendChild(bar);
      const frame = el('div', 'cv-frame');
      if (pdf) {
        const f = el('iframe'); f.title = c.label; f.loading = 'lazy'; f.src = file + '#view=FitH'; frame.appendChild(f);
      } else {
        const im = el('img'); im.alt = c.label; im.src = file; frame.appendChild(im);
        frame.style.cursor = 'zoom-in'; im.addEventListener('click', () => openLightbox([mediaItem(file, c.label)], 0, im));
      }
      view.appendChild(frame);
      view.appendChild(el('div', 'cv-note', 'If the preview does not appear on your device, use Open or Download.'));
    }
    list.forEach((c, i) => {
      const b = el('button', 'cv-tab', c.label); b.type = 'button'; b.setAttribute('role', 'tab');
      b.addEventListener('click', () => show(i)); tabs.appendChild(b);
    });
    show(0);
  }

  let galleryTag = 'all';
  function gallery() {
    const items = arr(P.gallery).filter((g) => safeFile(g.src)), grid = $('#galleryGrid');
    grid.textContent = '';
    setVisible('gallery', items.length > 0);
    const tagList = []; items.forEach((g) => { if (g.tag && tagList.indexOf(g.tag) < 0) tagList.push(g.tag); });
    galleryTag = 'all';
    buildFilters($('#galleryFilters'), tagList.length ? [['all', 'All']].concat(tagList.map((t) => [t, t])) : [['all', 'All']], (f) => {
      galleryTag = f;
      $$('.g-item', grid).forEach((n) => n.classList.toggle('hide', f !== 'all' && n.dataset.tag !== f));
    });
    items.forEach((g) => {
      const b = el('button', 'g-item' + (g.sample ? ' sample' : '')); b.type = 'button'; b.dataset.tag = g.tag || '';
      const im = el('img'); im.alt = g.caption || 'Gallery photo'; im.loading = 'lazy'; im.decoding = 'async'; im.src = g.src;
      im.addEventListener('error', () => b.remove());
      b.appendChild(im);
      if (g.caption) b.appendChild(el('figcaption', null, g.caption));
      b.addEventListener('click', () => {
        const vis = items.filter((x) => galleryTag === 'all' || x.tag === galleryTag);
        openLightbox(vis.map((x) => mediaItem(x.src, x.caption)), Math.max(0, vis.indexOf(g)), b);
      });
      grid.appendChild(b);
    });
  }

  function gitlog() {
    const ol = $('#gitlog'); ol.textContent = '';
    setVisible('log', arr(P.timeline).length > 0);
    arr(P.timeline).forEach((c, i) => {
      const li = el('li', 'commit');
      const meta = el('div', 'meta');
      meta.appendChild(el('span', 'hash', c.hash || '0000000'));
      if (i === 0) meta.appendChild(el('span', 'head', ' (HEAD -> main)'));
      if (c.date) meta.appendChild(el('span', null, '  ' + c.date));
      li.appendChild(meta);
      li.appendChild(el('h3', null, c.title));
      if (c.detail) li.appendChild(el('p', null, c.detail));
      ol.appendChild(li);
    });
  }

  const LINK_ICON = { github: 'github', linkedin: 'linkedin', twitter: 'x', x: 'x', youtube: 'youtube', credly: 'credly', facebook: 'facebook', telegram: 'telegram', whatsapp: 'whatsapp' };
  function contact() {
    const box = $('#contactActions'); box.textContent = '';
    if (email) {
      const a = el('a', 'btn primary', 'Email me'); a.href = 'mailto:' + email; box.appendChild(a);
      const cp = el('button', 'btn', 'Copy email'); cp.type = 'button';
      cp.addEventListener('click', async () => {
        const msg = $('#copied');
        try { await navigator.clipboard.writeText(email); msg.textContent = 'copied: ' + email; } catch (e) { msg.textContent = email; }
      });
      box.appendChild(cp);
    }
    linkEntries.forEach(([k, u]) => {
      const a = el('a', 'btn'); a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const ic = LINK_ICON[k] && iconFor(LINK_ICON[k]); if (ic) { ic.style.cssText = 'width:18px;height:18px'; a.appendChild(ic); }
      a.appendChild(document.createTextNode(k)); box.appendChild(a);
    });
  }

  /* ------------------------------------------------------------------ reveal + nav highlight */
  function observers() {
    const sections = $$('.reveal');
    if (PREVIEW || !('IntersectionObserver' in window)) { sections.forEach((s) => s.classList.add('in')); }
    else {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.06 });
      sections.forEach((s) => io.observe(s));
    }
    if (!('IntersectionObserver' in window)) return;
    const navLinks = $$('#navLinks a');
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* ------------------------------------------------------------------ matrix easter egg */
  const matrix = (() => {
    let timer = 0, stopAt = 0;
    const c = () => $('#matrix');
    function stop() {
      clearInterval(timer); timer = 0;
      c().style.display = 'none';
      window.removeEventListener('keydown', stop); c().removeEventListener('click', stop);
    }
    function start() {
      if (timer) return;
      const cv = c(), ctx = cv.getContext('2d');
      cv.style.display = 'block'; cv.width = innerWidth; cv.height = innerHeight;
      const size = 16, cols = Math.ceil(cv.width / size), drops = Array(cols).fill(0).map(() => Math.random() * -40);
      const chars = '01アイウエオカキクケコサシスセソ<>{}$#/\\';
      timer = setInterval(() => {
        ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.fillStyle = 'rgb(' + accentRGB.join(',') + ')'; ctx.font = size + 'px monospace';
        drops.forEach((y, i) => {
          ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, y * size);
          drops[i] = y * size > cv.height && Math.random() > 0.975 ? 0 : y + 1;
        });
        if (Date.now() > stopAt) stop();
      }, 50);
      stopAt = Date.now() + 12000;
      setTimeout(() => { window.addEventListener('keydown', stop); cv.addEventListener('click', stop); }, 300);
    }
    return { start, stop };
  })();

  /* ------------------------------------------------------------------ terminal + code viewer */
  function terminal() {
    const out = $('#termOut'), input = $('#termIn'), body = $('#termBody');
    const codeBody = $('#codeBody'), codeTitle = $('#codeTitle'), codeLive = $('#codeLive'), guideBox = $('#guideBtns');
    const history = []; let hIdx = 0;
    const PS1 = 'guest@portfolio:~$';
    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const pad = (s, n) => (String(s) + ' '.repeat(n)).slice(0, n);

    /* ---- output helpers: a line is an array of parts, a part is [text, cssClass?, url?] ---- */
    const part = (p) => {
      if (typeof p === 'string') p = [p];
      const url = p[2] && (safeUrl(p[2]) || safeFile(p[2]));
      const n = el(url ? 'a' : 'span', p[1] || '', p[0]);
      if (url) { n.href = url; n.target = '_blank'; n.rel = 'noopener noreferrer'; }
      return n;
    };
    const print = (lines) => {
      lines.forEach((l, i) => {
        const d = el('div', 'line');
        l.forEach((p) => d.appendChild(part(p)));
        d.style.animationDelay = Math.min(i, 40) * 18 + 'ms';
        out.appendChild(d);
      });
      body.scrollTop = body.scrollHeight;
    };
    const text = (s, cls) => [[s, cls]];

    /* ---- plain-text renderings (terminal commands) ---- */
    const skillsLines = () => {
      const l = [[['NAMESPACE      NAME                 STATUS', 't-dim']]];
      arr(P.skills).forEach((g) => arr(g.items).forEach((s) => {
        const run = s.level !== 'learning';
        l.push([[pad(g.group, 15), 't-key'], [pad(slug(s.name), 21)], [run ? 'Running' : 'Learning', run ? 't-ok' : 't-warn']]);
      }));
      return l;
    };
    const projectLines = () => {
      const l = [];
      arr(P.projects).forEach((p, i) => {
        l.push([[(i + 1) + '. ', 't-dim'], [p.name, 't-hl'], ['  [' + (p.status || 'project') + ']', 't-ok'], [arr(p.category).length ? '  ' + arr(p.category).join(', ') : '', 't-dim']]);
        l.push([['   ' + (p.description || ''), 't-dim']]);
        if (arr(p.tech).length) l.push([['   stack: ', 't-dim'], [arr(p.tech).join(', '), 't-key']]);
        if (p.demo) l.push([['   demo:   ', 't-dim'], [p.demo, '', p.demo]]);
        if (p.url) l.push([['   source: ', 't-dim'], [p.url, '', p.url]]);
        l.push(text(''));
      });
      l.push([['tip: ', 't-dim'], ['open <number>', 't-key'], [' opens a project', 't-dim']]);
      return l;
    };
    const logLines = () => {
      const l = [];
      arr(P.timeline).forEach((c, i) => {
        l.push([['* ', 't-ok'], [c.hash + ' ', 't-warn'], [i === 0 ? '(HEAD -> main) ' : '', 't-ok'], [c.title, 't-hl']]);
        l.push([['|  ' + (c.date ? c.date + ' - ' : '') + (c.detail || ''), 't-dim']]);
      });
      return l;
    };
    const expLines = () => {
      const l = [];
      arr(P.experience).forEach((j) => {
        l.push([[j.role || '', 't-hl'], [' @ ', 't-dim'], [j.company || '', 't-key']]);
        l.push([['  ' + (j.period || '') + (j.location ? ' - ' + j.location : ''), 't-dim']]);
        arr(j.points).forEach((pt) => l.push([['  * ', 't-ok'], [pt]]));
        l.push(text(''));
      });
      if (!l.length) l.push(text('no experience added yet', 't-dim'));
      return l;
    };
    const courseLines = () => {
      const l = [];
      arr(P.courses).forEach((c) => {
        l.push([[c.title, 't-hl'], ['  [' + (c.kind || 'course') + ']', 't-ok']]);
        l.push([['  ' + [c.provider, c.date, c.duration].filter(Boolean).join(' - '), 't-dim']]);
        if (c.certificate) l.push([['  certificate: ', 't-dim'], [baseName(c.certificate), '', c.certificate]]);
      });
      if (!l.length) l.push(text('no courses added yet', 't-dim'));
      return l;
    };
    const certLines = () => {
      const l = [];
      arr(P.certificates).forEach((c) => {
        l.push([[c.title, 't-hl'], [' - ' + (c.issuer || ''), 't-key']]);
        l.push([['  ' + [c.date, c.credentialId ? 'ID ' + c.credentialId : ''].filter(Boolean).join(' - '), 't-dim']]);
        if (c.verifyUrl) l.push([['  validate: ', 't-dim'], [c.verifyUrl, '', c.verifyUrl]]);
      });
      if (!l.length) l.push(text('no certificates added yet', 't-dim'));
      return l;
    };
    const cvLines = () => {
      const l = arr(P.cvs).filter((c) => safeFile(c.file)).map((c) => [[pad(c.label, 20), 't-key'], [baseName(c.file), '', c.file]]);
      if (!l.length) l.push(text('no CV added yet', 't-dim'));
      return l;
    };
    const volLines = () => {
      const l = [];
      arr(P.volunteering).forEach((v) => {
        l.push([[v.role || '', 't-hl'], [' @ ', 't-dim'], [v.organization || '', 't-key']]);
        l.push([['  ' + (v.period || ''), 't-dim']]);
        if (v.description) l.push([['  ' + v.description]]);
        if (v.link) l.push([['  link: ', 't-dim'], [v.link, '', v.link]]);
        l.push(text(''));
      });
      if (!l.length) l.push(text('no volunteering added yet', 't-dim'));
      return l;
    };
    const contactLines = () => {
      const l = [];
      if (email) l.push([['email    ', 't-key'], [email, '', 'mailto:' + email]]);
      linkEntries.forEach(([k, u]) => l.push([[pad(k, 9), 't-key'], [u, '', u]]));
      if (!l.length) l.push(text('no contact details configured yet', 't-dim'));
      return l;
    };
    const neofetch = () => {
      const logo = LOGO.concat(['         ', '         ', '         ']);
      const info = [[[HANDLE, 't-ok'], ['@', 't-dim'], [HOST, 't-key']], [['-'.repeat(HANDLE.length + HOST.length + 1), 't-dim']]]
        .concat(arr(P.facts).map(([k, v]) => [[k, 't-key'], [': ', 't-dim'], [v]]));
      return info.map((row, i) => [[logo[i] || '         ', 't-ok'], ['  ']].concat(row));
    };

    const files = {
      'about.md': () => arr(P.about).concat(['']).map((t) => text(t)),
      'skills.txt': skillsLines, 'projects.txt': projectLines, 'timeline.txt': logLines, 'experience.txt': expLines,
      'courses.txt': courseLines, 'certificates.txt': certLines, 'cv.txt': cvLines, 'volunteering.txt': volLines, 'contact.txt': contactLines
    };

    /* ---- code-style viewer (the "fake terminal") ---- */
    const tk = {
      k: (t) => [t, 'c-k'], s: (t) => [t, 'c-s'], n: (t) => [t, 'c-n'], c: (t) => [t, 'c-c'], p: (t) => [t, 'c-p'], b: (t) => [t, 'c-b'], x: (t) => [t, '']
    };
    const q = (s) => tk.s('"' + String(s == null ? '' : s).replace(/"/g, '\\"') + '"');
    const sp = (n) => tk.x(' '.repeat(n));
    const wrapWords = (t, w) => {
      const outL = []; let cur = '';
      String(t || '').split(/\s+/).forEach((word) => { if ((cur + ' ' + word).trim().length > w) { outL.push(cur); cur = word; } else cur = (cur + ' ' + word).trim(); });
      if (cur) outL.push(cur);
      return outL;
    };
    const flow = (a) => { const t = [tk.p('[')]; a.forEach((x, i) => { if (i) t.push(tk.p(', ')); t.push(tk.s(String(x))); }); t.push(tk.p(']')); return t; };
    const kv = (lines, indent, key, val, lead) => {
      const row = [sp(indent)]; if (lead) row.push(tk.p(lead));
      row.push(tk.k(key), tk.p(': '));
      (Array.isArray(val[0]) ? val : [val]).forEach((v) => row.push(v));
      lines.push(row);
    };
    const folded = (lines, indent, key, t, lead) => {
      const row = [sp(indent)]; if (lead) row.push(tk.p(lead));
      row.push(tk.k(key), tk.p(': '), tk.b('>-')); lines.push(row);
      wrapWords(t, 50).forEach((l) => lines.push([sp(indent + 2 + (lead ? lead.length : 0)), tk.s(l)]));
    };
    const empty = (file) => [[tk.c('# ' + file)], [tk.c('# nothing here yet - add it in the editor')]];

    const CODE = {
      about: { file: 'about.yaml', lines() {
        const l = [[tk.c('# about.yaml')]];
        kv(l, 0, 'name', q(NAME)); kv(l, 0, 'handle', q(HANDLE));
        l.push([tk.k('roles'), tk.p(':')]); arr(P.roles).forEach((r) => l.push([sp(2), tk.p('- '), q(r)]));
        folded(l, 0, 'summary', arr(P.about).join(' '));
        l.push([tk.k('facts'), tk.p(':')]); arr(P.facts).forEach(([k, v]) => kv(l, 2, k, q(v)));
        return l;
      } },
      experience: { file: 'experience.yaml', lines() {
        if (!arr(P.experience).length) return empty('experience.yaml');
        const l = [[tk.c('# experience.yaml')]];
        arr(P.experience).forEach((j) => {
          kv(l, 0, 'role', q(j.role), '- '); kv(l, 2, 'company', q(j.company));
          kv(l, 2, 'period', q(j.period)); if (j.location) kv(l, 2, 'location', q(j.location));
          l.push([sp(2), tk.k('highlights'), tk.p(':')]);
          arr(j.points).forEach((pt) => { l.push([sp(4), tk.p('- '), tk.b('>-')]); wrapWords(pt, 48).forEach((w) => l.push([sp(6), tk.s(w)])); });
          if (arr(j.tags).length) kv(l, 2, 'stack', flow(j.tags));
        });
        return l;
      } },
      skills: { file: 'skills.yaml', lines() {
        if (!arr(P.skills).length) return empty('skills.yaml');
        const l = [[tk.c('# skills.yaml  (running = confident, learning = in progress)')]];
        arr(P.skills).forEach((g) => {
          l.push([tk.k(g.group), tk.p(':')]);
          arr(g.items).forEach((s) => kv(l, 2, slug(s.name), [s.level === 'learning' ? tk.n('learning') : tk.b('running')]));
        });
        return l;
      } },
      projects: { file: 'projects.yaml', lines() {
        if (!arr(P.projects).length) return empty('projects.yaml');
        const l = [[tk.c('# projects.yaml')]];
        arr(P.projects).forEach((p) => {
          kv(l, 0, 'name', q(p.name), '- '); kv(l, 2, 'status', [tk.b(p.status || 'project')]);
          if (arr(p.category).length) kv(l, 2, 'category', flow(p.category));
          if (arr(p.tech).length) kv(l, 2, 'tech', flow(p.tech));
          folded(l, 2, 'summary', p.description);
          if (p.demo) kv(l, 2, 'demo', q(p.demo));
          if (p.url) kv(l, 2, 'source', q(p.url));
        });
        return l;
      } },
      courses: { file: 'courses.yaml', lines() {
        if (!arr(P.courses).length) return empty('courses.yaml');
        const l = [[tk.c('# courses.yaml  (courses and trainings)')]];
        arr(P.courses).forEach((c) => {
          kv(l, 0, 'title', q(c.title), '- '); kv(l, 2, 'type', [tk.b(c.kind || 'course')]);
          if (c.provider) kv(l, 2, 'provider', q(c.provider));
          if (c.date) kv(l, 2, 'year', q(c.date));
          if (c.duration) kv(l, 2, 'duration', q(c.duration));
          if (arr(c.topics).length) kv(l, 2, 'topics', flow(c.topics));
          kv(l, 2, 'certificate', [c.certificate ? tk.b('true') : tk.n('false')]);
        });
        return l;
      } },
      certs: { file: 'certificates.yaml', lines() {
        if (!arr(P.certificates).length) return empty('certificates.yaml');
        const l = [[tk.c('# certificates.yaml  (official, verifiable)')]];
        arr(P.certificates).forEach((c) => {
          kv(l, 0, 'title', q(c.title), '- '); kv(l, 2, 'issuer', q(c.issuer));
          if (c.date) kv(l, 2, 'date', q(c.date));
          if (c.credentialId) kv(l, 2, 'credential_id', q(c.credentialId));
          if (c.verifyUrl) kv(l, 2, 'validate', q(c.verifyUrl));
        });
        return l;
      } },
      cv: { file: 'cv.yaml', lines() {
        const list = arr(P.cvs).filter((c) => safeFile(c.file));
        if (!list.length) return empty('cv.yaml');
        const l = [[tk.c('# cv.yaml  (download any version in the CV section)')]];
        list.forEach((c) => { kv(l, 0, 'label', q(c.label), '- '); kv(l, 2, 'file', q(baseName(c.file))); if (c.updated) kv(l, 2, 'updated', q(c.updated)); });
        return l;
      } },
      volunteer: { file: 'volunteering.yaml', lines() {
        if (!arr(P.volunteering).length) return empty('volunteering.yaml');
        const l = [[tk.c('# volunteering.yaml  (volunteering, talks, community)')]];
        arr(P.volunteering).forEach((v) => {
          kv(l, 0, 'role', q(v.role), '- '); kv(l, 2, 'organization', q(v.organization));
          if (v.period) kv(l, 2, 'period', q(v.period));
          if (v.description) folded(l, 2, 'summary', v.description);
          if (arr(v.tags).length) kv(l, 2, 'tags', flow(v.tags));
          if (v.link) kv(l, 2, 'link', q(v.link));
        });
        return l;
      } },
      timeline: { file: 'git-log.txt', lines() {
        if (!arr(P.timeline).length) return empty('git-log.txt');
        const l = [[tk.c('$ git log --oneline --graph')]];
        arr(P.timeline).forEach((c, i) => {
          l.push([tk.p('* '), tk.n((c.hash || '0000000') + ' '), i === 0 ? tk.b('(HEAD -> main) ') : tk.x(''), tk.x(c.title)]);
          l.push([tk.p('|  '), tk.c((c.date ? c.date + ' - ' : '') + (c.detail || ''))]);
        });
        return l;
      } },
      contact: { file: 'contact.yaml', lines() {
        const l = [[tk.c('# contact.yaml')]];
        if (email) kv(l, 0, 'email', q(email)); else l.push([tk.c('# email: add it in the editor to show it here')]);
        l.push([tk.k('links'), tk.p(':')]); linkEntries.forEach(([k, u]) => kv(l, 2, k, q(u)));
        return l;
      } }
    };
    const CODE_ALIAS = { exp: 'experience', work: 'experience', certificates: 'certs', links: 'contact', log: 'timeline', vol: 'volunteer', volunteering: 'volunteer' };

    let codeId = 0, current = '';
    function setActive(name) {
      current = name;
      $$('.gbtn[data-cmd]', guideBox).forEach((b) => b.classList.toggle('on', b.dataset.cmd === name));
    }
    async function showCode(name) {
      const spec = CODE[name];
      if (!spec) return false;
      const id = ++codeId;
      codeTitle.textContent = spec.file;
      setActive(name);
      codeBody.textContent = '';
      const spans = [];
      spec.lines().forEach((tokens) => {
        const row = el('div', 'cl');
        tokens.forEach(([t, c]) => { const s = el('span', c || ''); row.appendChild(s); spans.push({ s, t: String(t) }); });
        codeBody.appendChild(row);
      });
      if (reduce) { spans.forEach((x) => { x.s.textContent = x.t; }); return true; }
      const total = spans.reduce((n, x) => n + x.t.length, 0);
      const perTick = Math.max(2, Math.ceil(total / (3000 / 16)));
      const caret = el('span', 'cc');
      let si = 0, ci = 0;
      while (si < spans.length) {
        if (id !== codeId) return false;
        let budget = perTick, row = null;
        while (budget > 0 && si < spans.length) {
          const { s, t } = spans[si];
          const take = Math.min(budget, t.length - ci);
          ci += take; budget -= take; s.textContent = t.slice(0, ci); row = s.parentNode;
          if (ci >= t.length) { si++; ci = 0; }
        }
        if (row) row.appendChild(caret);
        codeBody.scrollTop = codeBody.scrollHeight;
        await sleep(16);
      }
      return id === codeId;
    }

    /* ---- commands ---- */
    const CMDS = {
      help: { d: 'list commands', run() {
        const l = [text('Available commands:', 't-hl')];
        Object.keys(CMDS).filter((k) => !CMDS[k].hide).forEach((k) => l.push([[pad(k, 12), 't-key'], [CMDS[k].d, 't-dim']]));
        l.push(text('')); l.push(text('Tab completes, up/down browse history, Ctrl+L clears.', 't-dim'));
        return l;
      } },
      about: { d: 'who I am', run: () => arr(P.about).map((t) => text(t)) },
      whoami: { d: 'who are you?', run: () => [text('guest', 't-hl'), text('You are a visitor. The owner of this machine is ' + NAME + '.', 't-dim')] },
      neofetch: { d: 'system info', run: neofetch },
      experience: { d: 'where I worked / what I did', run: expLines },
      skills: { d: 'what I work with', run: skillsLines },
      projects: { d: 'things I built', run: projectLines },
      courses: { d: 'courses and trainings', run: courseLines },
      certs: { d: 'official certificates', run: certLines },
      cv: { d: 'my CV files', run: cvLines },
      volunteer: { d: 'volunteering, talks and community', run: volLines },
      timeline: { d: 'my journey (git log)', run: logLines },
      contact: { d: 'how to reach me', run: contactLines },
      ls: { d: 'list files', run(a) {
        const names = Object.keys(files).concat(a.indexOf('-a') >= 0 || a.indexOf('-la') >= 0 ? ['.secrets'] : []);
        return [names.map((n) => [n + '  ', n.indexOf('.') === 0 ? 't-dim' : 't-key'])];
      } },
      cat: { d: 'read a file: cat about.md', run(a) {
        if (!a[0]) return [text('usage: cat <file>   (try: ls)', 't-dim')];
        if (a[0] === '.secrets') return [text('cat: .secrets: Permission denied', 't-err')];
        return files[a[0]] ? files[a[0]]() : [text('cat: ' + a[0] + ': No such file or directory', 't-err')];
      } },
      pwd: { d: 'where am I', run: () => [text('/home/guest')] },
      date: { d: 'current date', run: () => [text(new Date().toString())] },
      echo: { d: 'print text', run: (a) => [text(a.join(' '))] },
      history: { d: 'command history', run: () => history.map((h, i) => [[pad(String(i + 1), 5), 't-dim'], [h]]) },
      theme: { d: 'change colors: theme blue', run(a) {
        if (!a[0]) return [[['themes: ', 't-dim'], [THEMES.join('  '), 't-key']], [['current: ', 't-dim'], [currentTheme(), 't-ok']]];
        if (THEMES.indexOf(a[0]) < 0) return [text('theme: unknown theme "' + a[0] + '"', 't-err')];
        applyTheme(a[0]); return [text('theme set to ' + a[0], 't-ok')];
      } },
      open: { d: 'open a project or link: open 1', run(a) {
        const qy = (a[0] || '').toLowerCase();
        if (!qy) return [text('usage: open <project number | name | github | linkedin | cv>', 't-dim')];
        const ps = arr(P.projects);
        let url = null;
        if (qy === 'cv') {
          const c = arr(P.cvs).find((x) => safeFile(x.file));
          if (c) { window.open(c.file, '_blank', 'noopener,noreferrer'); return [text('opening ' + c.file, 't-ok')]; }
        }
        if (/^\d+$/.test(qy) && ps[+qy - 1]) url = ps[+qy - 1].demo || ps[+qy - 1].url;
        if (!url) { const m = ps.find((p) => slug(p.name).indexOf(qy) >= 0); if (m) url = m.demo || m.url; }
        if (!url && links[qy]) url = links[qy];
        url = safeUrl(url);
        if (!url) return [text('open: nothing called "' + a[0] + '"', 't-err')];
        window.open(url, '_blank', 'noopener,noreferrer');
        return [text('opening ' + url, 't-ok')];
      } },
      email: { d: 'write me an email', run() {
        if (!email) return [text('no email configured yet', 't-dim')];
        window.location.href = 'mailto:' + email; return [text('opening mail client...', 't-ok')];
      } },
      docker: { d: 'docker ps (projects as containers)', run(a) {
        if (a[0] !== 'ps') return [text('try: docker ps', 't-dim')];
        const l = [[['CONTAINER ID   IMAGE                          STATUS        NAMES', 't-dim']]];
        arr(P.projects).forEach((p, i) => l.push([[pad(('a1b2c3d4e5f6'.slice(i % 6) + 'f0e1d2').slice(0, 12), 15), 't-warn'], [pad(slug(p.name).slice(0, 28) + ':latest', 31)], [pad('Up (healthy)', 14), 't-ok'], [slug(p.name).slice(0, 22)]]));
        return l;
      } },
      kubectl: { d: 'kubectl get pods (skills as pods)', run(a) {
        if (a[0] !== 'get') return [text('try: kubectl get pods', 't-dim')];
        return skillsLines();
      } },
      matrix: { d: 'wake up, Neo...', run() { matrix.start(); return [text('Follow the white rabbit. (press any key to exit)', 't-ok')]; } },
      clear: { d: 'clear the screen', run() { out.textContent = ''; return []; } },
      vol: { hide: true, d: '', run: volLines }, exp: { hide: true, d: '', run: expLines }, work: { hide: true, d: '', run: expLines },
      certificates: { hide: true, d: '', run: certLines }, links: { hide: true, d: '', run: contactLines }, log: { hide: true, d: '', run: logLines },
      sudo: { hide: true, d: '', run: () => [text(HANDLE + ' is not in the sudoers file. This incident will be reported.', 't-err')] },
      rm: { hide: true, d: '', run: () => [text('nice try. this portfolio is immutable infrastructure.', 't-warn')] },
      exit: { hide: true, d: '', run: () => [text('logout is not supported here. Closing the tab works though.', 't-dim')] },
      hire: { hide: true, d: '', run: () => [text('Excellent decision.', 't-ok')].concat(contactLines()) },
      uname: { hide: true, d: '', run: () => [text('Linux portfolio 6.8.0-' + HANDLE + ' #1 SMP x86_64 GNU/Linux')] }
    };

    function run(raw, opts) {
      const line = raw.trim();
      print([[[PS1 + ' ', 't-ok'], [line]]]);
      if (!line) return;
      if (history[history.length - 1] !== line) history.push(line);
      hIdx = history.length;
      const argv = line.split(/\s+/), cmd = argv[0].toLowerCase(), args = argv.slice(1);
      if (CMDS[cmd]) {
        print(CMDS[cmd].run(args));
        const sec = CODE[cmd] ? cmd : CODE_ALIAS[cmd];
        if (sec && !(opts && opts.code === false)) showCode(sec);
      } else {
        const near = Object.keys(CMDS).filter((k) => !CMDS[k].hide && k.indexOf(cmd.slice(0, 2)) === 0);
        print([text('bash: ' + cmd + ': command not found', 't-err'), text(near.length ? 'did you mean: ' + near.slice(0, 3).join(', ') + ' ?' : 'type help to see what is available', 't-dim')]);
      }
    }

    function complete() {
      const v = input.value, parts = v.split(/\s+/);
      if (parts.length === 1) {
        const m = Object.keys(CMDS).filter((k) => !CMDS[k].hide && k.indexOf(v.toLowerCase()) === 0);
        if (m.length === 1) input.value = m[0] + ' ';
        else if (m.length > 1) { print([[[PS1 + ' ', 't-ok'], [v]]]); print([text(m.join('   '), 't-dim')]); }
        return;
      }
      const pool = parts[0] === 'cat' ? Object.keys(files) : parts[0] === 'theme' ? THEMES : [];
      const m = pool.filter((k) => k.indexOf(parts[1]) === 0);
      if (m.length === 1) input.value = parts[0] + ' ' + m[0];
    }

    /* ---- guide buttons, demo typing and the auto tour ---- */
    const GUIDE_ALL = [['About', 'about'], ['Experience', 'experience'], ['Skills', 'skills'], ['Projects', 'projects'],
      ['Courses', 'courses'], ['Certificates', 'certs'], ['CV', 'cv'], ['Volunteering', 'volunteer'], ['Timeline', 'timeline'], ['Contact', 'contact']];
    const available = (cmd) => ({ experience: arr(P.experience).length, projects: arr(P.projects).length, courses: arr(P.courses).length,
      certs: arr(P.certificates).length, cv: arr(P.cvs).length, volunteer: arr(P.volunteering).length, timeline: arr(P.timeline).length, skills: arr(P.skills).length }[cmd] !== 0);

    let demoId = 0, tourId = 0, demoTyping = false, inView = false, touring = false;
    function setTour(on) {
      touring = on;
      codeLive.hidden = !on;
      const tb = $('.gbtn.tour', guideBox);
      if (tb) tb.textContent = on ? '■ Stop tour' : '▶ Play auto tour';
    }
    function stopTour() { tourId++; if (touring) setTour(false); }
    async function demo(cmd, byTour) {
      if (!byTour) { stopTour(); }
      const id = ++demoId;
      const codePromise = showCode(CODE_ALIAS[cmd] || cmd);
      input.value = ''; demoTyping = true;
      if (!reduce) {
        for (const ch of cmd) {
          if (id !== demoId) { demoTyping = false; return false; }
          input.value += ch; await sleep(55);
        }
        await sleep(160);
      }
      if (id !== demoId) { demoTyping = false; return false; }
      demoTyping = false;
      const v = input.value; input.value = '';
      run(v, { code: false });
      return codePromise;
    }
    async function tour() {
      const id = ++tourId;
      setTour(true);
      const steps = GUIDE_ALL.filter((g) => available(g[1])).map((g) => g[1]);
      for (const s of steps) {
        while (!inView && id === tourId) await sleep(400);
        if (id !== tourId) return;
        const done = await demo(s, true);
        if (id !== tourId || done === false) return;
        await sleep(2200);
      }
      if (id === tourId) setTour(false);
    }
    function buildGuide() {
      guideBox.textContent = '';
      GUIDE_ALL.filter((g) => available(g[1])).forEach(([label, cmd]) => {
        const b = el('button', 'gbtn'); b.type = 'button'; b.dataset.cmd = cmd;
        b.appendChild(el('span', null, label)); b.appendChild(el('code', null, '$ ' + cmd));
        b.addEventListener('click', () => demo(cmd));
        guideBox.appendChild(b);
      });
      const tb = el('button', 'gbtn tour', touring ? '■ Stop tour' : '▶ Play auto tour'); tb.type = 'button';
      tb.addEventListener('click', () => { if (touring) stopTour(); else tour(); });
      guideBox.appendChild(tb);
      setActive(current);
    }

    input.addEventListener('keydown', (e) => {
      stopTour();
      if (demoTyping) { demoId++; demoTyping = false; input.value = ''; }
      if (e.key === 'Enter') { const v = input.value; input.value = ''; run(v); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) input.value = history[--hIdx]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.min(hIdx + 1, history.length); input.value = history[hIdx] || ''; }
      else if (e.key === 'Tab') { e.preventDefault(); complete(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); out.textContent = ''; }
      else if (e.ctrlKey && e.key.toLowerCase() === 'c') { e.preventDefault(); print([[[PS1 + ' ', 't-ok'], [input.value + '^C']]]); input.value = ''; }
    });
    body.addEventListener('click', () => { if (!window.getSelection().toString()) input.focus(); });
    $('#codeView').addEventListener('pointerdown', stopTour);

    print([text('Welcome to ' + NAME + "'s portfolio terminal.", 't-hl'),
      [['Not sure what to type? Click a button above, or type ', 't-dim'], ['help', 't-key'], ['.', 't-dim']], text('')]);

    if ('IntersectionObserver' in window) {
      const vis = new IntersectionObserver((en) => { inView = en[0].isIntersecting; }, { threshold: 0.2 });
      vis.observe($('#terminal'));
      if (!reduce && !PREVIEW) {
        const first = new IntersectionObserver((en) => {
          if (!en[0].isIntersecting) return;
          first.disconnect();
          setTimeout(() => { if (!touring && !demoTyping && !history.length && !codeBody.children.length) tour(); }, 700);
        }, { threshold: 0.45 });
        first.observe($('#terminal'));
      }
    }
    if (reduce || PREVIEW) showCode('about');

    document.addEventListener('keydown', (e) => {
      const t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey || lb.open) return;
      if (e.key === '`' || e.key === '/') {
        e.preventDefault();
        $('#terminal').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        input.focus({ preventScroll: true });
      }
    });

    buildGuide();
    return { refresh: buildGuide };
  }

  /* ------------------------------------------------------------------ start */
  let term = null;
  function renderAll() {
    derive();
    document.title = NAME + ' | ' + (arr(P.roles).slice(0, 3).join(' · ') || 'Portfolio');
    hero(); photo(); about(); experience(); skills(); projects(); courses(); certificates(); cvs(); volunteering(); gallery(); gitlog(); contact();
    if (term) term.refresh();
    if (PREVIEW) { try { window.parent.postMessage({ type: 'zm-rendered', name: NAME, projects: arr(P.projects).length }, '*'); } catch (e) { /* standalone */ } }
  }
  function start() {
    applyTheme(store.get('theme') || 'green');
    $('#themeBtn').addEventListener('click', () => applyTheme(THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length]));
    $('#year').textContent = new Date().getFullYear();
    derive();
    bindLightbox();
    term = terminal();
    renderAll();
    network();
    boot().then(observers);
    if (PREVIEW) {
      window.addEventListener('message', (e) => {
        if (e.source !== window.parent || !e.data || e.data.type !== 'zm-profile' || typeof e.data.data !== 'object') return;
        P = e.data.data; renderAll();
      });
      try { window.parent.postMessage({ type: 'zm-ready' }, '*'); } catch (err) { /* standalone */ }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
