/* Zeyad Monitor-style portfolio. Plain JavaScript, no dependencies, no network requests.
   All content comes from data.js (window.PROFILE). User input is only ever written with textContent. */
(() => {
  'use strict';

  const P = window.PROFILE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const safeUrl = (u) => (/^(https?:|mailto:)/i.test(u || '') ? u : null);
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = {
    get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) { /* private mode */ } }
  };

  const NAME = P.name || 'Your Name';
  const HANDLE = P.handle || 'you';
  const HOST = P.host || 'devops';
  const THEMES = ['green', 'blue', 'amber', 'purple'];
  const INITIAL = (NAME.trim()[0] || 'Z').toUpperCase();
  const LOGO = [' .-----. ', '|   ' + INITIAL + '   |', " '-----' "];
  const links = P.links || {};
  const linkEntries = Object.keys(links).filter((k) => safeUrl(links[k])).map((k) => [k, links[k]]);
  const email = P.email || '';

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

  /* ------------------------------------------------------------------ boot */
  function boot() {
    const root = $('#boot');
    const finish = () => {
      document.body.classList.remove('booting');
      if (root) { root.classList.add('gone'); setTimeout(() => root.remove(), 700); }
    };
    if (!root || reduce || store.get('booted', true)) {
      if (root) root.remove();
      document.body.classList.remove('booting');
      return Promise.resolve();
    }
    store.set('booted', '1', true);
    const log = $('#bootlog');
    const ok = (t) => ['[  ', ['OK', 'ok'], '  ] ' + t];
    const lines = [
      ['Booting ', [HOST + '.os', 'info'], ' (portfolio kernel 1.0)'],
      ok('Started Network Time Synchronization.'),
      ok('Mounted /home/' + HANDLE + '/projects.'),
      ok('Reached target Containers (docker, kubernetes).'),
      ok('Started CI/CD Pipeline Runner.'),
      ok('Loaded skills.service (' + (P.skills || []).reduce((n, g) => n + g.items.length, 0) + ' units).'),
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
          if (Array.isArray(p)) { const s = el('span', p[1], p[0]); line.appendChild(s); } else { line.appendChild(document.createTextNode(p)); }
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

  /* ------------------------------------------------------------------ hero */
  function hero() {
    const h1 = $('#name');
    h1.textContent = NAME; h1.setAttribute('data-text', NAME);
    $('#tagline').textContent = P.tagline || '';
    $('#brandPs').textContent = HANDLE + '@' + HOST;
    $('#ps1').textContent = 'guest@portfolio:~$';
    if (P.availability) $('#availText').textContent = P.availability; else $('#availability').hidden = true;
    const mail = $('#mailBtn');
    if (safeUrl('mailto:' + email) && email) mail.href = 'mailto:' + email;

    const roles = P.roles && P.roles.length ? P.roles : ['Engineer'];
    const node = $('#role');
    if (reduce) { node.textContent = roles[0]; } else {
      let r = 0, i = 0, del = false;
      const tick = () => {
        const word = roles[r];
        if (!del) {
          i++; node.textContent = word.slice(0, i);
          if (i === word.length) { del = true; return setTimeout(tick, 1500); }
          return setTimeout(tick, 70);
        }
        i--; node.textContent = word.slice(0, i);
        if (i === 0) { del = false; r = (r + 1) % roles.length; return setTimeout(tick, 320); }
        return setTimeout(tick, 32);
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
    const dds = rows.map(([k]) => { dl.appendChild(el('dt', null, k)); const dd = el('dd'); dl.appendChild(dd); return dd; });
    const update = () => rows.forEach((r, i) => { dds[i].textContent = r[1](); });
    update();
    setInterval(update, 1000);
  }
  const T0 = Date.now();
  let loadMs = 0;
  window.addEventListener('load', () => {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    setTimeout(() => { loadMs = Math.round(nav && nav.loadEventEnd ? nav.loadEventEnd : performance.now()); }, 0);
  });

  /* ------------------------------------------------------------------ sections */
  function about() {
    const box = $('#aboutText');
    (P.about || []).forEach((t) => box.appendChild(el('p', null, t)));
    $('.neo-logo').textContent = LOGO.join('\n');
    const dl = $('#facts');
    (P.facts || []).forEach(([k, v]) => { dl.appendChild(el('dt', null, k)); dl.appendChild(el('dd', null, v)); });
  }

  function skills() {
    const grid = $('#skillGrid');
    (P.skills || []).forEach((g) => {
      const card = el('div', 'skill-card');
      card.appendChild(el('h3', null, g.group));
      g.items.forEach((s) => {
        const row = el('div', 'skill ' + (s.level === 'learning' ? 'learning' : 'running'));
        row.tabIndex = 0;
        row.dataset.level = s.level === 'learning' ? 'learning' : 'running';
        row.appendChild(el('span', 'd'));
        row.appendChild(el('span', null, s.name));
        row.appendChild(el('span', 'st', s.level === 'learning' ? 'Learning' : 'Running'));
        if (s.note) row.appendChild(el('span', 'tip', s.note));
        card.appendChild(row);
      });
      grid.appendChild(card);
    });
    $$('.filters .chip').forEach((chip) => chip.addEventListener('click', () => {
      $$('.filters .chip').forEach((c) => c.classList.toggle('on', c === chip));
      const f = chip.dataset.f;
      $$('.skill').forEach((s) => s.classList.toggle('hide', f !== 'all' && s.dataset.level !== f));
    }));
  }

  function projects() {
    const grid = $('#projectGrid');
    (P.projects || []).forEach((p) => {
      const card = el('article', 'project');
      const h = el('h3'); h.appendChild(el('span', null, p.name));
      if (p.status) h.appendChild(el('span', 'badge', p.status));
      card.appendChild(h);
      card.appendChild(el('p', null, p.description));
      const tags = el('div', 'tags'); (p.tags || []).forEach((t) => tags.appendChild(el('span', null, t)));
      card.appendChild(tags);
      const url = safeUrl(p.url);
      if (url) {
        const a = el('a', 'go', 'view on GitHub →'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        card.appendChild(a);
      }
      if (!reduce) {
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.style.transform = `perspective(800px) rotateX(${((0.5 - y) * 6).toFixed(2)}deg) rotateY(${((x - 0.5) * 8).toFixed(2)}deg)`;
          card.style.setProperty('--mx', (x * 100) + '%'); card.style.setProperty('--my', (y * 100) + '%');
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
      }
      grid.appendChild(card);
    });
  }

  function gitlog() {
    const ol = $('#gitlog');
    (P.timeline || []).forEach((c, i) => {
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

  function contact() {
    const box = $('#contactActions');
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
      const a = el('a', 'btn', k); a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer'; box.appendChild(a);
    });
  }

  /* ------------------------------------------------------------------ reveal + nav highlight */
  function observers() {
    const sections = $$('.reveal');
    if (!('IntersectionObserver' in window)) { sections.forEach((s) => s.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08 });
    sections.forEach((s) => io.observe(s));
    const navLinks = $$('.nav nav a');
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

  /* ------------------------------------------------------------------ terminal */
  function terminal() {
    const out = $('#termOut'), input = $('#termIn'), body = $('#termBody');
    const history = []; let hIdx = 0, interacted = false;
    const PS1 = 'guest@portfolio:~$';

    const part = (p) => {
      if (typeof p === 'string') p = [p];
      const url = p[2] && safeUrl(p[2]);
      const n = el(url ? 'a' : 'span', p[1] || '', p[0]);
      if (url) { n.href = url; if (/^https?:/i.test(url)) { n.target = '_blank'; n.rel = 'noopener noreferrer'; } }
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
    const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);

    const files = {
      'about.md': () => (P.about || []).concat(['']).map((t) => text(t)),
      'skills.txt': () => skillsLines(),
      'projects.txt': () => projectLines(),
      'timeline.txt': () => logLines(),
      'contact.txt': () => contactLines()
    };

    function skillsLines() {
      const l = [[['NAMESPACE      NAME                 STATUS', 't-dim']]];
      (P.skills || []).forEach((g) => g.items.forEach((s) => {
        const run = s.level !== 'learning';
        l.push([[pad(g.group, 15), 't-key'], [pad(s.name.toLowerCase().replace(/\s+/g, '-'), 21)], [run ? 'Running' : 'Learning', run ? 't-ok' : 't-warn']]);
      }));
      return l;
    }
    function projectLines() {
      const l = [];
      (P.projects || []).forEach((p, i) => {
        l.push([[(i + 1) + '. ', 't-dim'], [p.name, 't-hl'], ['  [' + (p.status || 'project') + ']', 't-ok']]);
        l.push([['   ' + p.description, 't-dim']]);
        if (p.url) l.push([['   ', ''], [p.url, '', p.url]]);
        l.push(text(''));
      });
      l.push([['tip: ', 't-dim'], ['open <number>', 't-key'], [' opens a project', 't-dim']]);
      return l;
    }
    function logLines() {
      const l = [];
      (P.timeline || []).forEach((c, i) => {
        l.push([['* ', 't-ok'], [c.hash + ' ', 't-warn'], [i === 0 ? '(HEAD -> main) ' : '', 't-ok'], [c.title, 't-hl']]);
        l.push([['|  ' + (c.date ? c.date + ' - ' : '') + (c.detail || ''), 't-dim']]);
      });
      return l;
    }
    function contactLines() {
      const l = [];
      if (email) l.push([['email    ', 't-key'], [email, '', 'mailto:' + email]]);
      linkEntries.forEach(([k, u]) => l.push([[pad(k, 9), 't-key'], [u, '', u]]));
      if (!l.length) l.push(text('no contact details configured yet (edit data.js)', 't-dim'));
      return l;
    }
    function neofetch() {
      const logo = LOGO.concat(['         ', '         ', '         ']);
      const info = [[[HANDLE, 't-ok'], ['@', 't-dim'], [HOST, 't-key']], [['-'.repeat(HANDLE.length + HOST.length + 1), 't-dim']]]
        .concat((P.facts || []).map(([k, v]) => [[k, 't-key'], [': ', 't-dim'], [v]]));
      return info.map((row, i) => [[logo[i] || '         ', 't-ok'], ['  ']].concat(row));
    }
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const CMDS = {
      help: { d: 'list commands', run() {
        const l = [text('Available commands:', 't-hl')];
        Object.keys(CMDS).filter((k) => !CMDS[k].hide).forEach((k) => l.push([[pad(k, 12), 't-key'], [CMDS[k].d, 't-dim']]));
        l.push(text('')); l.push(text('Tab completes, ↑/↓ browse history, Ctrl+L clears.', 't-dim'));
        return l;
      } },
      about: { d: 'who I am', run: () => (P.about || []).map((t) => text(t)) },
      whoami: { d: 'who are you?', run: () => [text('guest', 't-hl'), text('You are a visitor. The owner of this machine is ' + NAME + '.', 't-dim')] },
      neofetch: { d: 'system info', run: neofetch },
      skills: { d: 'what I work with', run: skillsLines },
      projects: { d: 'things I built', run: projectLines },
      timeline: { d: 'my journey (git log)', run: logLines },
      contact: { d: 'how to reach me', run: contactLines },
      links: { d: 'all links', run: contactLines },
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
        const q = (a[0] || '').toLowerCase();
        if (!q) return [text('usage: open <project number | name | github | linkedin>', 't-dim')];
        const ps = P.projects || [];
        let url = null;
        if (/^\d+$/.test(q) && ps[+q - 1]) url = ps[+q - 1].url;
        if (!url) { const m = ps.find((p) => slug(p.name).indexOf(q) >= 0); if (m) url = m.url; }
        if (!url && links[q]) url = links[q];
        url = safeUrl(url);
        if (!url) return [text('open: nothing called "' + a[0] + '"', 't-err')];
        window.open(url, '_blank', 'noopener,noreferrer');
        return [text('opening ' + url, 't-ok')];
      } },
      email: { d: 'write me an email', run() {
        if (!email) return [text('no email configured yet (edit data.js)', 't-dim')];
        window.location.href = 'mailto:' + email; return [text('opening mail client...', 't-ok')];
      } },
      docker: { d: 'docker ps (projects as containers)', run(a) {
        if (a[0] !== 'ps') return [text('try: docker ps', 't-dim')];
        const l = [[['CONTAINER ID   IMAGE                          STATUS        NAMES', 't-dim']]];
        (P.projects || []).forEach((p, i) => l.push([[pad(('a1b2c3d4e5f6'.slice(i) + 'f0e1d2').slice(0, 12), 15), 't-warn'], [pad(slug(p.name) + ':latest', 31)], [pad('Up (healthy)', 14), 't-ok'], [slug(p.name).slice(0, 22)]]));
        return l;
      } },
      kubectl: { d: 'kubectl get pods (skills as pods)', run(a) {
        if (a[0] !== 'get') return [text('try: kubectl get pods', 't-dim')];
        return skillsLines();
      } },
      matrix: { d: 'wake up, Neo...', run() { matrix.start(); return [text('Follow the white rabbit. (press any key to exit)', 't-ok')]; } },
      clear: { d: 'clear the screen', run() { out.textContent = ''; return []; } },
      sudo: { hide: true, d: '', run: () => [text(HANDLE + ' is not in the sudoers file. This incident will be reported.', 't-err')] },
      rm: { hide: true, d: '', run: () => [text('nice try. this portfolio is immutable infrastructure.', 't-warn')] },
      exit: { hide: true, d: '', run: () => [text('logout is not supported here. Closing the tab works though.', 't-dim')] },
      hire: { hide: true, d: '', run: () => [text('Excellent decision.', 't-ok')].concat(contactLines()) },
      uname: { hide: true, d: '', run: () => [text('Linux portfolio 6.8.0-' + HANDLE + ' #1 SMP x86_64 GNU/Linux')] }
    };

    function run(raw) {
      const line = raw.trim();
      print([[[PS1 + ' ', 't-ok'], [line]]]);
      if (!line) return;
      if (history[history.length - 1] !== line) history.push(line);
      hIdx = history.length;
      const argv = line.split(/\s+/), cmd = argv[0].toLowerCase(), args = argv.slice(1);
      if (CMDS[cmd]) {
        print(CMDS[cmd].run(args));
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

    input.addEventListener('keydown', (e) => {
      interacted = true;
      if (e.key === 'Enter') { const v = input.value; input.value = ''; run(v); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) input.value = history[--hIdx]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.min(hIdx + 1, history.length); input.value = history[hIdx] || ''; }
      else if (e.key === 'Tab') { e.preventDefault(); complete(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); out.textContent = ''; }
      else if (e.ctrlKey && e.key.toLowerCase() === 'c') { e.preventDefault(); print([[[PS1 + ' ', 't-ok'], [input.value + '^C']]]); input.value = ''; }
    });
    body.addEventListener('click', () => { if (!window.getSelection().toString()) input.focus(); });

    // quick-command chips (handy on phones)
    ['help', 'about', 'skills', 'projects', 'timeline', 'neofetch', 'contact', 'theme', 'matrix'].forEach((c) => {
      const b = el('button', 'chip', c); b.type = 'button';
      b.addEventListener('click', () => { interacted = true; run(c); });
      $('#quick').appendChild(b);
    });

    print([text('Welcome to ' + NAME + "'s portfolio terminal.", 't-hl'), [['Type ', 't-dim'], ['help', 't-key'], [' to see what you can do.', 't-dim']], text('')]);

    // type a demo command the first time the terminal scrolls into view
    if (!reduce && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(async (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        await sleep(500);
        for (const ch of 'neofetch') {
          if (interacted) return;
          input.value += ch; await sleep(85);
        }
        if (!interacted) { await sleep(250); const v = input.value; input.value = ''; run(v); }
      }, { threshold: 0.6 });
      io.observe($('#term'));
    }

    // "`" or "/" jumps to the terminal from anywhere
    document.addEventListener('keydown', (e) => {
      const t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === '`' || e.key === '/') {
        e.preventDefault();
        $('#terminal').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        input.focus({ preventScroll: true });
      }
    });
  }

  /* ------------------------------------------------------------------ start */
  function start() {
    applyTheme(store.get('theme') || 'green');
    $('#themeBtn').addEventListener('click', () => applyTheme(THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length]));
    $('#year').textContent = new Date().getFullYear();
    document.title = NAME + ' | ' + ((P.roles || []).slice(0, 3).join(' · ') || 'Portfolio');
    hero(); about(); skills(); projects(); gitlog(); contact(); terminal(); network();
    boot().then(observers);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
