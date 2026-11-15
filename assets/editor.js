/* Portfolio editor. Runs entirely in your browser (no server, no upload).
   It edits a copy of window.PROFILE, shows a live preview, and exports a new data.js
   (plus a ZIP containing the images/PDFs you picked, already in the right folders). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const arr = (v) => (Array.isArray(v) ? v : []);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const ICONS = window.TECH_ICONS || {}, ALIAS = window.TECH_ALIAS || {};
  const DRAFT_KEY = 'zm-editor-draft-v1';

  const ORIGINAL = clone(window.PROFILE || {});
  let data = clone(ORIGINAL);
  const picked = {};   // path -> { file, dataUrl }

  /* ------------------------------------------------------------------ schema */
  const LEVELS = [['running', 'Running (I use it confidently)'], ['learning', 'Learning (in progress)']];
  const STATUSES = [['released', 'released'], ['in progress', 'in progress'], ['archived', 'archived'], ['idea', 'idea']];
  const KINDS = [['course', 'Course'], ['training', 'Training']];
  const F = {
    sample: { k: 'sample', t: 'bool', l: 'This is a SAMPLE item (shows a red SAMPLE ribbon). Untick it for real content.' }
  };
  const SECTIONS = [
    { id: 'profile', title: 'Profile', kind: 'root', lead: 'Your name, roles, contact email and photo (shown in the first screen).', fields: [
      { k: 'name', t: 'text', l: 'Full name' }, { k: 'handle', t: 'text', l: 'Handle (used in the terminal prompt)', h: 'e.g. zeyad  ->  zeyad@devops:~$' },
      { k: 'host', t: 'text', l: 'Host name', h: 'e.g. devops' }, { k: 'roles', t: 'list', l: 'Roles (one per line, they type themselves)' },
      { k: 'tagline', t: 'area', l: 'Tagline (one sentence)' }, { k: 'email', t: 'text', l: 'Email (shows Email me + Copy buttons)' },
      { k: 'availability', t: 'text', l: 'Availability badge', h: 'Leave empty to hide the pulsing badge.' },
      { k: 'photo', t: 'image', l: 'Your photo', dir: 'photo', h: 'Square, about 600x600. Empty = your initial letter is shown.' },
      { k: 'photoAlt', t: 'text', l: 'Photo description (accessibility)' }] },
    { id: 'about', title: 'About', kind: 'root', lead: 'The About section and the key facts card.', fields: [
      { k: 'about', t: 'list', l: 'About paragraphs (one paragraph per line)' }, { k: 'facts', t: 'pairs', l: 'Facts', a: 'label', b: 'value' }] },
    { id: 'experience', title: 'Experience', kind: 'array', key: 'experience', itemTitle: 'role', noun: 'job', lead: 'Newest first. A period containing "Present" gets a green "current" badge.', fields: [
      { k: 'role', t: 'text', l: 'Role' }, { k: 'company', t: 'text', l: 'Company / organisation' }, { k: 'location', t: 'text', l: 'Location' },
      { k: 'period', t: 'text', l: 'Period', h: 'e.g. 2024 - Present' }, { k: 'logo', t: 'image', l: 'Company logo (optional)', dir: 'companies' },
      { k: 'points', t: 'list', l: 'What you did (one achievement per line)' }, { k: 'tags', t: 'tags', l: 'Technologies (icons appear automatically)', tech: true }] },
    { id: 'skills', title: 'Skills', kind: 'array', key: 'skills', itemTitle: 'group', noun: 'skill group', lead: 'Groups of skills. Be honest: "learning" looks better than overclaiming.', fields: [
      { k: 'group', t: 'text', l: 'Group name', h: 'e.g. devops, cloud, backend, os' },
      { k: 'items', t: 'array', l: 'Skills in this group', itemTitle: 'name', noun: 'skill', fields: [
        { k: 'name', t: 'text', l: 'Skill', h: 'Known names get a real logo (Docker, Terraform...).' }, { k: 'level', t: 'select', l: 'Level', o: LEVELS }, { k: 'note', t: 'text', l: 'Short note (tooltip)' }] }] },
    { id: 'projects', title: 'Projects', kind: 'array', key: 'projects', itemTitle: 'name', noun: 'project', lead: 'Each project has an image on top, category tags, technology logos, a source link and an optional live demo.', fields: [
      { k: 'name', t: 'text', l: 'Project name' }, { k: 'status', t: 'select', l: 'Status', o: STATUSES },
      { k: 'category', t: 'multi', l: 'Categories (used by the filter buttons)' },
      { k: 'image', t: 'image', l: 'Image on top (screenshot, 16:9 looks best)', dir: 'projects' },
      { k: 'description', t: 'area', l: 'Description' },
      { k: 'tech', t: 'tags', l: 'Technologies used (logos)', tech: true, h: 'Examples: terraform, aws, jenkins, docker, kubernetes, python, nginx, react...' },
      { k: 'tags', t: 'tags', l: 'Extra text tags (optional)' },
      { k: 'url', t: 'text', l: 'Source code link', h: 'https://github.com/you/project' }, { k: 'demo', t: 'text', l: 'Live demo / website link (optional)', h: 'Shows a "Live demo" button.' }, F.sample] },
    { id: 'categories', title: 'Project categories', kind: 'array', key: 'categories', itemTitle: 'label', noun: 'category', lead: 'These become the filter buttons above the projects. Only categories used by at least one project are shown.', fields: [
      { k: 'id', t: 'text', l: 'ID (short, no spaces)', h: 'e.g. devops, backend, frontend, linux, program' }, { k: 'label', t: 'text', l: 'Button label' }] },
    { id: 'courses', title: 'Courses & Training', kind: 'array', key: 'courses', itemTitle: 'title', noun: 'course / training', lead: 'Each item shows its certificate next to it. Click on any certificate on the site to enlarge it.', fields: [
      { k: 'title', t: 'text', l: 'Title' }, { k: 'kind', t: 'select', l: 'Type', o: KINDS }, { k: 'provider', t: 'text', l: 'Provider / institute' },
      { k: 'date', t: 'text', l: 'Date / year' }, { k: 'duration', t: 'text', l: 'Duration', h: 'e.g. 40 hours' }, { k: 'topics', t: 'tags', l: 'Topics (logos for known tools)', tech: true },
      { k: 'certificate', t: 'image', l: 'Certificate (image or PDF)', dir: 'certs' }, { k: 'verifyUrl', t: 'text', l: 'Validation link (optional)' }, F.sample] },
    { id: 'certificates', title: 'Official certificates', kind: 'array', key: 'certificates', itemTitle: 'title', noun: 'certificate', lead: 'Each card has a Validate button that opens the verification page.', fields: [
      { k: 'title', t: 'text', l: 'Certificate title' }, { k: 'issuer', t: 'text', l: 'Issuer' }, { k: 'date', t: 'text', l: 'Date' }, { k: 'credentialId', t: 'text', l: 'Credential ID' },
      { k: 'image', t: 'image', l: 'Certificate image / PDF', dir: 'certs' }, { k: 'verifyUrl', t: 'text', l: 'Validate link (Credly / vendor verification page)' }, F.sample] },
    { id: 'library', title: 'Course library', kind: 'object', key: 'library', lead: 'Buttons that open your registered courses (for example Google Drive folders). Leave the link empty until you have it: the button shows "soon".', fields: [
      { k: 'title', t: 'text', l: 'Section title' }, { k: 'note', t: 'area', l: 'Note' },
      { k: 'tracks', t: 'array', l: 'Track buttons', itemTitle: 'label', noun: 'track', fields: [
        { k: 'label', t: 'text', l: 'Button text', h: 'e.g. DevOps, Backend, System Admin' }, { k: 'url', t: 'text', l: 'Drive / course link' }, { k: 'tech', t: 'text', l: 'Logo name (optional)', h: 'e.g. docker, python, linux, aws' }] }] },
    { id: 'cvs', title: 'CVs', kind: 'array', key: 'cvs', itemTitle: 'label', noun: 'CV', lead: 'Add as many versions as you like (DevOps CV, Backend CV, System Admin CV, IT Specialist CV...). Visitors switch between them and download.', fields: [
      { k: 'label', t: 'text', l: 'Name of this CV', h: 'e.g. DevOps CV' }, { k: 'file', t: 'image', l: 'CV file (PDF recommended)', dir: 'cv', file: true }, { k: 'updated', t: 'text', l: 'Last updated' }, F.sample] },
    { id: 'volunteering', title: 'Volunteering & Talks', kind: 'array', key: 'volunteering', itemTitle: 'role', noun: 'activity', lead: 'Volunteering, talks, events you organised or spoke at. Each card can have a photo on top.', fields: [
      { k: 'role', t: 'text', l: 'Role', h: 'e.g. Volunteer organizer, Speaker' }, { k: 'organization', t: 'text', l: 'Organisation / event' },
      { k: 'period', t: 'text', l: 'Period / date' }, { k: 'description', t: 'area', l: 'What you did' }, { k: 'tags', t: 'tags', l: 'Tags (optional)' },
      { k: 'image', t: 'image', l: 'Photo (optional)', dir: 'gallery' }, { k: 'link', t: 'text', l: 'Link (event page, slides, video...)' }, F.sample] },
    { id: 'gallery', title: 'Gallery', kind: 'array', key: 'gallery', itemTitle: 'caption', noun: 'photo', lead: 'Photos from events, talks, hackathons... "Group" creates filter buttons.', fields: [
      { k: 'src', t: 'image', l: 'Photo', dir: 'gallery' }, { k: 'caption', t: 'text', l: 'Caption' }, { k: 'tag', t: 'text', l: 'Group', h: 'e.g. Events, Speaker, Hackathon' }, F.sample] },
    { id: 'timeline', title: 'Timeline', kind: 'array', key: 'timeline', itemTitle: 'title', noun: 'milestone', lead: 'Shown like "git log": newest first.', fields: [
      { k: 'hash', t: 'text', l: 'Fake commit id (any 7 characters)' }, { k: 'date', t: 'text', l: 'Date' }, { k: 'title', t: 'text', l: 'Title' }, { k: 'detail', t: 'area', l: 'Details' }] },
    { id: 'links', title: 'Links', kind: 'object', key: 'links', lead: 'Account links (empty ones are hidden). Credly shows a badge card in the certificates section.', fields:
      ['github', 'linkedin', 'credly', 'twitter', 'youtube', 'website', 'facebook', 'telegram', 'whatsapp'].map((k) => ({ k, t: 'text', l: k, h: k === 'credly' ? 'https://www.credly.com/users/your-name' : '' })) }
  ];

  /* ------------------------------------------------------------------ helpers */
  function iconKey(name) {
    const raw = String(name || '').toLowerCase().trim();
    if (ICONS[raw]) return raw;
    const k = raw.replace(/[\s\-_.]/g, '');
    if (ICONS[k]) return k;
    if (ALIAS[k] && ICONS[ALIAS[k]]) return ALIAS[k];
    if (ALIAS[raw] && ICONS[ALIAS[raw]]) return ALIAS[raw];
    return null;
  }
  const lum = (hex) => { const n = parseInt(hex, 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
  function iconSvg(key) {
    const NS = 'http://www.w3.org/2000/svg', i = ICONS[key];
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24');
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', i.p); p.setAttribute('fill', lum(i.h) < 0.24 ? '#e6edf3' : '#' + i.h);
    s.appendChild(p); return s;
  }
  function blank(fields) {
    const o = {};
    fields.forEach((f) => { o[f.k] = f.t === 'select' ? f.o[0][0] : (['list', 'tags', 'array', 'pairs', 'multi'].indexOf(f.t) >= 0 ? [] : (f.t === 'bool' ? false : '')); });
    return o;
  }
  const safeName = (n) => n.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';

  /* ------------------------------------------------------------------ change pipeline: autosave + live preview */
  let saveTimer = 0, pvTimer = 0, pvReady = false;
  const pv = $('#pv');
  function previewData() {
    const d = clone(data);
    const swap = (o) => {
      if (Array.isArray(o)) { o.forEach((v, i) => { if (typeof v === 'string' && picked[v] && picked[v].dataUrl) o[i] = picked[v].dataUrl; else swap(v); }); }
      else if (o && typeof o === 'object') { Object.keys(o).forEach((k) => { const v = o[k]; if (typeof v === 'string' && picked[v] && picked[v].dataUrl) o[k] = picked[v].dataUrl; else swap(v); }); }
    };
    swap(d); return d;
  }
  function sendPreview() { if (pvReady && pv.contentWindow) pv.contentWindow.postMessage({ type: 'zm-profile', data: previewData() }, '*'); }
  function changed() {
    clearTimeout(saveTimer); clearTimeout(pvTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); $('#saved').textContent = 'Draft saved ' + new Date().toLocaleTimeString(); } catch (e) { $('#saved').textContent = 'Could not save the draft in this browser'; } }, 400);
    pvTimer = setTimeout(sendPreview, 350);
    updateCounts();
  }
  window.addEventListener('message', (e) => {
    if (e.source !== pv.contentWindow || !e.data) return;
    if (e.data.type === 'zm-ready') { pvReady = true; sendPreview(); }
    if (e.data.type === 'zm-rendered') { window.__zmPreview = e.data; $('#pvStatus').textContent = 'synced: ' + e.data.name + ' · ' + e.data.projects + ' projects'; }
  });

  /* ------------------------------------------------------------------ field renderers */
  function row(label, hint) {
    const r = el('div', 'row');
    if (label) r.appendChild(el('label', null, label));
    const h = hint ? el('small', null, hint) : null;
    return { r, hint: h, done() { if (h) r.appendChild(h); return r; } };
  }

  function techHints(box, list) {
    box.textContent = '';
    list.forEach((t) => {
      const k = iconKey(t);
      const c = el('span', 'chip' + (k ? '' : ' no'));
      if (k) { c.appendChild(iconSvg(k)); c.appendChild(document.createTextNode(ICONS[k].t)); } else c.appendChild(document.createTextNode(t + ' (no logo)'));
      box.appendChild(c);
    });
  }
  function techPicker(input, apply) {
    const wrap = el('div');
    const btn = el('button', 'mini', 'Pick logos'); btn.type = 'button'; btn.style.marginTop = '6px';
    const panel = el('div', 'picker'); panel.hidden = true;
    const search = el('input'); search.type = 'text'; search.placeholder = 'Search ' + Object.keys(ICONS).length + ' technologies...';
    const chips = el('div', 'chips');
    function render() {
      chips.textContent = '';
      const q = search.value.toLowerCase();
      Object.keys(ICONS).filter((k) => !q || k.indexOf(q) >= 0 || ICONS[k].t.toLowerCase().indexOf(q) >= 0).forEach((k) => {
        const c = el('button', 'chip'); c.type = 'button'; c.appendChild(iconSvg(k)); c.appendChild(document.createTextNode(ICONS[k].t));
        c.addEventListener('click', () => {
          const cur = input.value.split(',').map((s) => s.trim()).filter(Boolean);
          if (cur.map((x) => iconKey(x)).indexOf(k) < 0) cur.push(k);
          input.value = cur.join(', '); apply();
        });
        chips.appendChild(c);
      });
    }
    search.addEventListener('input', render);
    btn.addEventListener('click', () => { panel.hidden = !panel.hidden; if (!panel.hidden) { render(); search.focus(); } });
    panel.append(search, chips); wrap.append(btn, panel);
    return wrap;
  }

  function imageField(f, obj, onChange) {
    const R = row(f.l, f.h);
    const line = el('div', 'imgrow');
    const th = el('img', 'thumb'); th.hidden = true; th.alt = '';
    const inp = el('input'); inp.type = 'text'; inp.value = obj[f.k] || ''; inp.placeholder = 'assets/' + f.dir + '/name' + (f.file ? '.pdf' : '.png');
    const file = el('input'); file.type = 'file'; file.hidden = true; file.accept = f.file ? '.pdf,image/*' : 'image/*,.pdf';
    const pick = el('button', 'mini', 'Choose file...'); pick.type = 'button';
    const note = el('small', 'picked');
    function thumb() {
      const v = inp.value.trim(), p = picked[v];
      if (!v || /\.pdf$/i.test(v)) { th.hidden = true; return; }
      th.onload = () => { th.hidden = false; }; th.onerror = () => { th.hidden = true; };
      th.src = p && p.dataUrl ? p.dataUrl : v;
    }
    inp.addEventListener('input', () => { obj[f.k] = inp.value.trim(); thumb(); onChange(); });
    pick.addEventListener('click', () => file.click());
    file.addEventListener('change', () => {
      const fl = file.files && file.files[0]; if (!fl) return;
      const path = 'assets/' + f.dir + '/' + safeName(fl.name);
      picked[path] = { file: fl, dataUrl: null };
      inp.value = path; obj[f.k] = path;
      note.textContent = 'Picked "' + fl.name + '". It will be inside the ZIP at ' + path + ' (or copy it there yourself).';
      if (/^image\//.test(fl.type)) { const rd = new FileReader(); rd.onload = () => { picked[path].dataUrl = rd.result; thumb(); sendPreview(); }; rd.readAsDataURL(fl); }
      thumb(); onChange();
    });
    line.append(th, inp, pick, file);
    R.r.appendChild(line); R.r.appendChild(note);
    thumb();
    return R.done();
  }

  function field(f, obj, onChange) {
    if (f.t === 'bool') {
      const r = el('div', 'row check'); const c = el('input'); c.type = 'checkbox'; c.checked = !!obj[f.k];
      c.addEventListener('change', () => { if (c.checked) obj[f.k] = true; else delete obj[f.k]; onChange(); });
      const lab = el('label', null, f.l); lab.style.margin = '0'; lab.style.color = '#c9d1d9'; lab.style.font = '13px var(--sans)';
      r.append(c, lab); return r;
    }
    if (f.t === 'image') return imageField(f, obj, onChange);
    if (f.t === 'array') { const R = row(f.l, f.h); const box = el('div'); R.r.appendChild(box); renderArray(box, obj[f.k] = arr(obj[f.k]), f.fields, f.itemTitle, f.noun, onChange); return R.done(); }
    if (f.t === 'pairs') {
      const R = row(f.l); const box = el('div'); obj[f.k] = arr(obj[f.k]);
      const draw = () => {
        box.textContent = '';
        obj[f.k].forEach((p, i) => {
          const d = el('div', 'pair'); const a = el('input'), b = el('input'); a.type = b.type = 'text'; a.value = p[0] || ''; b.value = p[1] || '';
          a.placeholder = f.a; b.placeholder = f.b;
          a.addEventListener('input', () => { p[0] = a.value; onChange(); }); b.addEventListener('input', () => { p[1] = b.value; onChange(); });
          const x = el('button', 'mini danger', '✕'); x.type = 'button'; x.addEventListener('click', () => { obj[f.k].splice(i, 1); draw(); onChange(); });
          d.append(a, b, x); box.appendChild(d);
        });
        const add = el('button', 'mini', '+ Add'); add.type = 'button'; add.addEventListener('click', () => { obj[f.k].push(['', '']); draw(); onChange(); });
        box.appendChild(add);
      };
      draw(); R.r.appendChild(box); return R.done();
    }
    if (f.t === 'multi') {
      const R = row(f.l, 'Tick every category this project belongs to. Add more categories in the "Project categories" section.');
      const box = el('div', 'multi'); const cur = obj[f.k] = arr(obj[f.k]);
      arr(data.categories).forEach((c) => {
        const l = el('label', 'check'); l.style.font = '13px var(--sans)'; const cb = el('input'); cb.type = 'checkbox'; cb.checked = cur.indexOf(c.id) >= 0;
        cb.addEventListener('change', () => { const i = cur.indexOf(c.id); if (cb.checked && i < 0) cur.push(c.id); if (!cb.checked && i >= 0) cur.splice(i, 1); onChange(); });
        l.append(cb, document.createTextNode(c.label || c.id)); box.appendChild(l);
      });
      R.r.appendChild(box); return R.done();
    }
    const R = row(f.l, f.h);
    if (f.t === 'select') {
      const s = el('select'); f.o.forEach(([v, t]) => { const o = el('option', null, t); o.value = v; s.appendChild(o); });
      s.value = obj[f.k] || f.o[0][0]; s.addEventListener('change', () => { obj[f.k] = s.value; onChange(); }); R.r.appendChild(s); return R.done();
    }
    if (f.t === 'area' || f.t === 'list') {
      const t = el('textarea'); t.value = f.t === 'list' ? arr(obj[f.k]).join('\n') : (obj[f.k] || ''); t.rows = f.t === 'list' ? Math.max(3, arr(obj[f.k]).length + 1) : 3;
      t.addEventListener('input', () => { obj[f.k] = f.t === 'list' ? t.value.split('\n').map((x) => x.trim()).filter(Boolean) : t.value; onChange(); });
      R.r.appendChild(t); return R.done();
    }
    const i = el('input'); i.type = 'text';
    if (f.t === 'tags') {
      i.value = arr(obj[f.k]).join(', ');
      const hints = el('div', 'chips');
      const apply = () => { obj[f.k] = i.value.split(',').map((x) => x.trim()).filter(Boolean); if (f.tech) techHints(hints, obj[f.k]); onChange(); };
      i.addEventListener('input', apply); R.r.appendChild(i);
      if (f.tech) { techHints(hints, arr(obj[f.k])); R.r.appendChild(hints); R.r.appendChild(techPicker(i, apply)); }
      return R.done();
    }
    i.value = obj[f.k] == null ? '' : obj[f.k];
    i.addEventListener('input', () => { obj[f.k] = i.value; onChange(); });
    R.r.appendChild(i); return R.done();
  }

  function renderArray(box, list, fields, titleKey, noun, onChange) {
    box.textContent = '';
    const titleOf = (it) => String(it[titleKey] || '').trim();
    list.forEach((item, idx) => {
      const d = el('details', 'item');
      const s = el('summary'); const t = el('span', 't'); const setT = () => { const v = titleOf(item); t.textContent = v || '(untitled ' + noun + ')'; t.classList.toggle('empty', !v); }; setT();
      const acts = el('div', 'actions');
      const mk = (txt, title, fn, cls) => { const b = el('button', 'mini ' + (cls || ''), txt); b.type = 'button'; b.title = title; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); return b; };
      const redraw = () => { renderArray(box, list, fields, titleKey, noun, onChange); onChange(); };
      acts.append(
        mk('↑', 'Move up', () => { if (idx > 0) { [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]]; redraw(); } }),
        mk('↓', 'Move down', () => { if (idx < list.length - 1) { [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]]; redraw(); } }),
        mk('⧉', 'Duplicate', () => { list.splice(idx + 1, 0, clone(item)); redraw(); }),
        mk('✕', 'Delete', () => { if (window.confirm('Delete this ' + noun + '?')) { list.splice(idx, 1); redraw(); } }, 'danger'));
      s.append(t, acts); d.appendChild(s);
      const body = el('div', 'item-body');
      fields.forEach((f) => body.appendChild(field(f, item, () => { setT(); onChange(); })));
      d.appendChild(body); box.appendChild(d);
    });
    const add = el('button', null, '+ Add ' + noun); add.type = 'button'; add.id = 'add-' + noun.replace(/\W+/g, '-');
    add.addEventListener('click', () => { const it = blank(fields); if (fields.some((f) => f.k === 'sample')) { /* real items are not samples */ } list.unshift(it); renderArray(box, list, fields, titleKey, noun, onChange); box.querySelector('details').open = true; onChange(); });
    box.insertBefore(add, box.firstChild); add.style.marginBottom = '12px';
  }

  /* ------------------------------------------------------------------ navigation + sections */
  let current = 'profile';
  const sideBtns = {};
  const countOf = (s) => (s.kind === 'array' ? arr(data[s.key]).length : s.kind === 'object' && s.id === 'library' ? arr((data.library || {}).tracks).length : '');
  function updateCounts() { SECTIONS.forEach((s) => { const n = sideBtns[s.id] && $('.n', sideBtns[s.id]); if (n) n.textContent = countOf(s); }); }
  function buildSide() {
    const side = $('#side'); side.textContent = '';
    SECTIONS.forEach((s) => {
      const b = el('button'); b.type = 'button'; b.dataset.sec = s.id; b.append(el('span', null, s.title), el('span', 'n', countOf(s)));
      b.addEventListener('click', () => show(s.id)); side.appendChild(b); sideBtns[s.id] = b;
    });
  }
  function show(id) {
    current = id;
    Object.keys(sideBtns).forEach((k) => sideBtns[k].classList.toggle('on', k === id));
    const s = SECTIONS.find((x) => x.id === id), form = $('#form'); form.textContent = '';
    form.appendChild(el('h2', null, s.title)); form.appendChild(el('p', 'lead', s.lead || ''));
    if (id === 'profile') {
      const hp = el('details', 'help'); hp.open = true;
      hp.appendChild(el('summary', null, 'How this editor works'));
      const ol = el('ol');
      ['Edit anything on the left. The preview on the right updates instantly. Your draft is saved automatically in this browser.',
       'Pick images / PDFs with "Choose file...". Then press "Update pack (ZIP)": it contains data.js and your files in the right folders.',
       'Unzip the pack over your website folder (replace files) and upload/push it. That is all.'].forEach((t) => ol.appendChild(el('li', null, t)));
      hp.appendChild(ol); form.appendChild(hp);
    }
    if (s.kind === 'root') s.fields.forEach((f) => form.appendChild(field(f, data, changed)));
    else if (s.kind === 'object') { data[s.key] = data[s.key] || {}; s.fields.forEach((f) => form.appendChild(field(f, data[s.key], changed))); }
    else {
      data[s.key] = arr(data[s.key]);
      const box = el('div'); form.appendChild(box); renderArray(box, data[s.key], s.fields, s.itemTitle, s.noun, changed);
      if (s.id === 'projects') {
        const known = arr(data.categories).map((c) => c.id), bad = [];
        data.projects.forEach((p) => arr(p.category).forEach((c) => { if (known.indexOf(c) < 0 && bad.indexOf(c) < 0) bad.push(c); }));
        if (bad.length) form.insertBefore(el('p', 'warn', 'Categories used by projects but not defined (they still work): ' + bad.join(', ')), box);
      }
    }
  }

  /* ------------------------------------------------------------------ export: data.js and ZIP */
  function clean(o) {
    if (Array.isArray(o)) return o.map(clean);
    if (o && typeof o === 'object') { const r = {}; Object.keys(o).forEach((k) => { if (k === 'sample' && !o[k]) return; r[k] = clean(o[k]); }); return r; }
    return o;
  }
  function serialize() {
    return '// ============================================================================\n// Generated by editor.html on ' + new Date().toISOString().slice(0, 10) +
      '.  Replace the data.js file of your website with this file.\n// Items with  sample: true  show a SAMPLE ribbon on the site.\n// ============================================================================\n' +
      'window.PROFILE = ' + JSON.stringify(clean(data), null, 2) + ';\n';
  }
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zipStore(files) {   // files: [{name, data:Uint8Array}] -> Uint8Array (no compression)
    const enc = new TextEncoder(), parts = [], central = []; let offset = 0;
    const d = new Date(), dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
    files.forEach((f) => {
      const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, dt, true); lh.setUint16(12, dd, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, f.data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, dt, true); ch.setUint16(14, dd, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + size;
    });
    const cdSize = central.reduce((n, p) => n + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    const all = parts.concat(central, [new Uint8Array(end.buffer)]), out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
    let o = 0; all.forEach((p) => { out.set(p, o); o += p.length; });
    return out;
  }
  async function buildZip() {
    const files = [{ name: 'data.js', data: new TextEncoder().encode(serialize()) }];
    const used = JSON.stringify(data);
    for (const path of Object.keys(picked)) {
      if (used.indexOf('"' + path + '"') < 0) continue;   // picked earlier but no longer used
      files.push({ name: path, data: new Uint8Array(await picked[path].file.arrayBuffer()) });
    }
    return zipStore(files);
  }
  function download(name, blob) {
    const a = el('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  $('#btnJs').addEventListener('click', () => download('data.js', new Blob([serialize()], { type: 'text/javascript' })));
  $('#btnZip').addEventListener('click', async () => download('portfolio-update.zip', new Blob([await buildZip()], { type: 'application/zip' })));
  $('#btnCopy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(serialize()); $('#saved').textContent = 'data.js copied to the clipboard'; } catch (e) { $('#saved').textContent = 'Copy failed: use the Download button'; } });
  $('#btnSamples').addEventListener('click', () => {
    let n = 0;
    SECTIONS.filter((s) => s.kind === 'array').forEach((s) => { const before = arr(data[s.key]).length; data[s.key] = arr(data[s.key]).filter((x) => !x.sample); n += before - data[s.key].length; });
    if (!n) { $('#saved').textContent = 'No sample items found'; return; }
    show(current); changed(); $('#saved').textContent = 'Removed ' + n + ' sample items';
  });

  /* ------------------------------------------------------------------ draft restore */
  try {
    const d = localStorage.getItem(DRAFT_KEY);
    if (d && d !== JSON.stringify(ORIGINAL)) {
      $('#banner').hidden = false;
      $('#btnRestore').addEventListener('click', () => { try { data = JSON.parse(d); } catch (e) { return; } $('#banner').hidden = true; buildSide(); show(current); sendPreview(); });
      $('#btnDiscard').addEventListener('click', () => { localStorage.removeItem(DRAFT_KEY); $('#banner').hidden = true; });
    }
  } catch (e) { /* storage blocked */ }

  buildSide(); show('profile');
  window.__zm = { get data() { return data; }, serialize, buildZip, picked };   // used by the automated tests
})();
