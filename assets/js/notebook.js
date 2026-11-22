/* My notebook: saved questions, bookmarks, and the My notebook page (with the
   Mistakes and Exam history tabs). Everything is stored in this browser. */
(function () {
  'use strict';
  const C = window.Course; if (!C) return;
  const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const titles = C.titles || [];
  const SKEY = 'stat4340-saved-v1', BKEY = 'stat4340-bookmarks-v1';
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const read = k => { const v = C.storage.read(k, []); return Array.isArray(v) ? v : []; };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const when = t => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  /* ---------- snapshot: a question as it looks now, with math kept as TeX ---------- */
  function snapshot(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll('.rr-anim').forEach(a => { try { const o = JSON.parse(a.dataset.rr); const d = document.createElement('div'); d.className = 'rr-static'; d.innerHTML = window.RRPlot ? RRPlot.picture(o) : ''; a.replaceWith(d); } catch (e) { a.remove(); } });
    c.querySelectorAll('.math[data-rendered]').forEach(m => { const ann = m.querySelector('annotation[encoding="application/x-tex"]'); if (ann) { m.textContent = ann.textContent; m.removeAttribute('data-rendered'); m.removeAttribute('data-auto'); } });
    c.querySelectorAll('.katex-display, .katex').forEach(k => { if (!k.isConnected && !c.contains(k)) return; const ann = k.querySelector('annotation[encoding="application/x-tex"]'); const s = document.createElement('span'); s.className = 'math' + (k.classList.contains('katex-display') ? ' display' : ''); s.textContent = ann ? ann.textContent : k.textContent; k.replaceWith(s); });
    el.querySelectorAll('input, textarea, select').forEach((orig, i) => {
      const copy = c.querySelectorAll('input, textarea, select')[0]; if (!copy) return;
      let out;
      if (orig.type === 'radio' || orig.type === 'checkbox') { out = document.createElement('span'); out.className = 'nb-mark'; out.textContent = orig.checked ? '●' : '○'; if (orig.checked) { const l = copy.closest('label'); if (l) l.classList.add('nb-picked'); } }
      else { out = document.createElement('span'); out.className = 'nb-input'; out.textContent = orig.value.trim() || '(blank)'; }
      copy.replaceWith(out);
    });
    c.querySelectorAll('button, .nb-actions, .hint-root, .error, script, noscript, .answer-row:empty, .exam-self, .exam-links, .rr-controls, .rr-steps').forEach(x => x.remove());
    c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
    c.querySelectorAll('[for]').forEach(x => x.removeAttribute('for'));
    c.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
    return c.innerHTML;
  }

  /* ---------- saved questions ---------- */
  const saved = {
    list: () => read(SKEY),
    add(entry) { const all = read(SKEY); all.push(Object.assign({ id: uid('s'), at: Date.now(), note: '' }, entry)); while (all.length > 150) all.shift(); if (write(SKEY, all)) return all[all.length - 1]; all.splice(0, Math.ceil(all.length / 4)); return write(SKEY, all) ? all[all.length - 1] : null; },
    remove(id) { write(SKEY, read(SKEY).filter(s => s.id !== id)); },
    note(id, text) { const all = read(SKEY), s = all.find(x => x.id === id); if (s) { s.note = text; write(SKEY, all); } }
  };
  const bookmarks = {
    list: () => read(BKEY),
    add(b) { const all = read(BKEY); const dup = all.find(x => x.url === b.url && x.text === b.text); if (dup) return dup; all.push(Object.assign({ id: uid('b'), at: Date.now(), note: '' }, b)); while (all.length > 300) all.shift(); write(BKEY, all); return all[all.length - 1]; },
    remove(id) { write(BKEY, read(BKEY).filter(s => s.id !== id)); },
    note(id, text) { const all = read(BKEY), s = all.find(x => x.id === id); if (s) { s.note = text; write(BKEY, all); } }
  };
  C.notebook = { snapshot, saved, bookmarks, SKEY, BKEY };

  /* The buttons shown under feedback (practice) */
  C.notebook.actions = o => `<div class="nb-actions"><button type="button" data-nb-save data-module="${o.module}" data-source="${o.source}" data-title="${E(o.title)}" data-correct="${o.correct == null ? '' : o.correct ? 'true' : 'false'}">☆ Save to my notebook</button>${o.mistake ? '<span class="small">This mistake was added to <a href="notebook.html#mistakes">My mistakes</a>.</span>' : ''}</div>`;

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-nb-save]'); if (!b || b.dataset.saved) return;
    const host = b.closest('.question, .exam-item'); if (!host) return;
    const entry = saved.add({ module: Number(b.dataset.module) || 0, source: b.dataset.source || 'practice', title: b.dataset.title || '', correct: b.dataset.correct === 'true' ? true : b.dataset.correct === 'false' ? false : null, html: snapshot(host) });
    b.dataset.saved = '1';
    if (entry) { b.textContent = '★ Saved'; b.insertAdjacentHTML('afterend', ' <a class="small nb-open" href="notebook.html#saved">Open my notebook</a>'); }
    else b.textContent = 'Could not save: this browser’s storage is full';
  });

  /* ---------- bookmarks and questions on the module notes ---------- */
  const notes = document.querySelector('main[data-module] .notes');
  if (notes) {
    const m = Number(document.querySelector('main').dataset.module);
    const sectionOf = node => { let el = node.nodeType === 1 ? node : node.parentElement; const sec = el && el.closest('section'); const h = sec && sec.querySelector('h2[id]'); return h ? { id: h.id, title: h.textContent.replace(/^\d+\.\s*/, '') } : { id: '', title: '' }; };
    const ICON = '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M4 2h8v12l-4-3-4 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const marked = () => new Set(bookmarks.list().filter(b => !b.text).map(b => b.url));
    notes.querySelectorAll('h2[id]').forEach(h => {
      const url = `module-${m}.html#${h.id}`, btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'bm-heading'; btn.dataset.bmUrl = url;
      const set = on => { btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on)); btn.title = on ? 'Bookmarked. Click to remove.' : 'Bookmark this section'; btn.setAttribute('aria-label', (on ? 'Remove bookmark: ' : 'Bookmark section: ') + h.textContent); };
      btn.innerHTML = ICON; set(marked().has(url)); h.appendChild(btn);
      btn.addEventListener('click', () => {
        const ex = bookmarks.list().find(b => !b.text && b.url === url);
        if (ex) { bookmarks.remove(ex.id); set(false); toast('Bookmark removed.'); }
        else { bookmarks.add({ module: m, url, section: h.textContent.replace(/^\d+\.\s*/, ''), text: '' }); set(true); toast('Section bookmarked. Find it in <a href="notebook.html#bookmarks">My notebook</a>.'); }
      });
    });

    const pop = document.createElement('div'); pop.className = 'sel-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Bookmark or ask about this passage');
    document.body.appendChild(pop);
    let current = null;
    const textOf = r => r.toString().replace(/\s+/g, ' ').trim();
    const fragment = t => { const w = t.split(' '); const enc = s => encodeURIComponent(s).replace(/-/g, '%2D').replace(/,/g, '%2C'); return w.length <= 10 ? enc(t) : `${enc(w.slice(0, 5).join(' '))},${enc(w.slice(-5).join(' '))}`; };
    function hide() { pop.hidden = true; current = null; }
    function showFor(range) {
      const text = textOf(range); if (text.length < 3) return hide();
      const sec = sectionOf(range.commonAncestorContainer), short = text.length > 400 ? text.slice(0, 400) + '…' : text;
      current = { text: short, sec };
      pop.innerHTML = `<button type="button" data-pop="bm">${ICON} Bookmark</button><a class="button" data-pop="ask" target="_blank" rel="noopener">Ask Dr. Saah</a>`;
      pop.querySelector('[data-pop=ask]').href = C.askLink ? C.askLink(`Question about Module ${m}${sec.title ? ', “' + sec.title + '”' : ''}: “${short}”\n\nMy question: `) : 'https://forms.gle/xXUwjtoXM23b3AfY7';
      const r = range.getBoundingClientRect(); pop.hidden = false;
      const w = pop.offsetWidth, x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8), y = r.top > 64 ? r.top - pop.offsetHeight - 8 : r.bottom + 8;
      pop.style.left = (x + scrollX) + 'px'; pop.style.top = (y + scrollY) + 'px';
    }
    const check = () => setTimeout(() => {
      const s = getSelection(); if (!s || s.isCollapsed || !s.rangeCount) { if (!pop.contains(document.activeElement)) hide(); return; }
      const r = s.getRangeAt(0); if (!notes.contains(r.commonAncestorContainer)) return hide();
      showFor(r);
    }, 10);
    notes.addEventListener('mouseup', check); notes.addEventListener('keyup', e => { if (e.shiftKey || e.key === 'Shift') check(); });
    document.addEventListener('selectionchange', () => { if ('ontouchstart' in window) { clearTimeout(check.t); check.t = setTimeout(check, 400); } });
    document.addEventListener('mousedown', e => { if (!pop.contains(e.target)) setTimeout(() => { const s = getSelection(); if (!s || s.isCollapsed) hide(); }, 0); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    pop.addEventListener('click', e => {
      const b = e.target.closest('[data-pop]'); if (!b || !current) return;
      if (b.dataset.pop === 'bm') {
        const bm = bookmarks.add({ module: m, url: `module-${m}.html#${current.sec.id}:~:text=${fragment(current.text)}`, section: current.sec.title, text: current.text });
        pop.innerHTML = `<label class="small">Add a note (optional)<textarea rows="2" data-pop-note placeholder="Why this matters to you"></textarea></label><div class="answer-row"><button type="button" class="primary" data-pop="done">Save</button><a class="small" href="notebook.html#bookmarks">Open my notebook</a></div>`;
        const ta = pop.querySelector('textarea'); ta.focus();
        pop.querySelector('[data-pop=done]').onclick = () => { bookmarks.note(bm.id, ta.value.trim()); hide(); getSelection().removeAllRanges(); toast('Bookmarked. Find it in <a href="notebook.html#bookmarks">My notebook</a>.'); };
      } else if (b.dataset.pop === 'ask') setTimeout(hide, 100);
    });
  }

  function toast(html) {
    let t = document.querySelector('.nb-toast'); if (!t) { t = document.createElement('div'); t.className = 'nb-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 4000);
  }
  C.notebook.toast = toast;

  /* ---------- the My notebook page ---------- */
  const page = document.getElementById('notebook');
  if (!page) return;
  const tabs = [...page.querySelectorAll('[data-tab]')], panels = [...page.querySelectorAll('[data-panel]')];
  function show(name) {
    if (!panels.some(p => p.dataset.panel === name)) name = 'mistakes';
    tabs.forEach(t => { const on = t.dataset.tab === name; t.classList.toggle('active', on); t.setAttribute('aria-selected', String(on)); });
    panels.forEach(p => { p.hidden = p.dataset.panel !== name; });
    if (name === 'saved') drawSaved(); if (name === 'bookmarks') drawBookmarks(); if (name === 'exams') drawExams();
  }
  const counts = () => {
    const n = { mistakes: C.mistakes ? C.mistakes.read().length : 0, saved: saved.list().length, bookmarks: bookmarks.list().length, exams: (C.storage.read('stat4340-exams-v1', { attempts: [] }).attempts || []).length };
    tabs.forEach(t => { const c = t.querySelector('.tab-n'); if (c) c.textContent = n[t.dataset.tab] || ''; });
  };
  const byModule = list => { const g = {}; list.forEach(x => (g[x.module || 0] = g[x.module || 0] || []).push(x)); return Object.keys(g).map(Number).sort((a, b) => a - b).map(m => [m, g[m].sort((a, b) => b.at - a.at)]); };
  const modName = m => m ? `Module ${m}. ${E(titles[m - 1] || '')}` : 'Other';
  const filterSel = (id, list) => { const mods = [...new Set(list.map(x => x.module || 0))].sort((a, b) => a - b); return mods.length > 1 ? `<label class="nb-filter small">Show<select data-filter="${id}"><option value="">All modules</option>${mods.map(m => `<option value="${m}">${m ? 'Module ' + m : 'Other'}</option>`).join('')}</select></label>` : ''; };
  let fSaved = '', fBm = '';

  function drawSaved() {
    const box = page.querySelector('[data-panel=saved] .nb-body'), all = saved.list();
    if (!all.length) { box.innerHTML = '<div class="tip"><strong>No saved questions yet.</strong> After you check an answer in practice, or on an exam’s results, press <strong>☆ Save to my notebook</strong>. The question, your answer, and the worked solution are kept here.</div>'; return; }
    const list = fSaved ? all.filter(s => String(s.module || 0) === fSaved) : all;
    box.innerHTML = filterSel('saved', all) + byModule(list).map(([m, items]) => `<section class="nb-module"><h2>${modName(m)}</h2>${items.map(s => `<article class="nb-card" data-id="${s.id}"><header class="nb-card-head"><div><strong>${E(s.title)}</strong><span class="small muted"> · ${s.source === 'exam' ? 'practice exam' : 'practice'} · saved ${when(s.at)}</span></div>${s.correct === true ? '<span class="nb-tag ok">Answered right</span>' : s.correct === false ? '<span class="nb-tag miss">Missed</span>' : ''}</header>
      <details class="nb-q"><summary>Show the question and solution</summary><div class="nb-snap">${s.html}</div></details>
      <label class="small nb-note-l">My note<textarea rows="2" data-note="${s.id}" placeholder="What to remember about this one">${E(s.note)}</textarea></label>
      <div class="nb-card-actions">${m ? `<a href="practice.html?module=${m}">Practice Module ${m}</a>` : ''}<button type="button" class="linkish danger-link" data-remove="${s.id}">Remove</button></div></article>`).join('')}</section>`).join('');
    box.querySelectorAll('details.nb-q').forEach(d => d.addEventListener('toggle', () => { if (d.open && !d.dataset.r) { d.dataset.r = 1; C.renderMath(d); } }, { once: false }));
  }
  function drawBookmarks() {
    const box = page.querySelector('[data-panel=bookmarks] .nb-body'), all = bookmarks.list();
    if (!all.length) { box.innerHTML = '<div class="tip"><strong>No bookmarks yet.</strong> In any module’s notes, select a sentence and choose <strong>Bookmark</strong>, or press the bookmark icon beside a section heading. You can also choose <strong>Ask Dr. Saah</strong> to send a question about the passage.</div>'; return; }
    const list = fBm ? all.filter(s => String(s.module || 0) === fBm) : all;
    box.innerHTML = filterSel('bookmarks', all) + byModule(list).map(([m, items]) => `<section class="nb-module"><h2>${modName(m)}</h2>${items.map(b => `<article class="nb-card nb-bm" data-id="${b.id}"><header class="nb-card-head"><div><a href="${E(b.url)}"><strong>${E(b.section || 'Section')}</strong></a><span class="small muted"> · ${when(b.at)}</span></div></header>${b.text ? `<blockquote>${E(b.text)}</blockquote>` : '<p class="small muted">Whole section bookmarked.</p>'}
      <label class="small nb-note-l">My note<textarea rows="2" data-bnote="${b.id}" placeholder="Add a note">${E(b.note)}</textarea></label>
      <div class="nb-card-actions"><a href="${E(b.url)}">Go to this passage</a><a href="${E(C.askLink ? C.askLink(`Question about Module ${m}${b.section ? ', “' + b.section + '”' : ''}${b.text ? ': “' + b.text + '”' : ''}\n\nMy question: `) : '#')}" target="_blank" rel="noopener">Ask Dr. Saah</a><button type="button" class="linkish danger-link" data-bremove="${b.id}">Remove</button></div></article>`).join('')}</section>`).join('');
  }
  function drawExams() {
    const box = page.querySelector('[data-panel=exams] .nb-body');
    const h = C.storage.read('stat4340-exams-v1', { attempts: [] }), det = C.storage.read('stat4340-exam-detail-v1', {});
    const att = (h.attempts || []).slice().reverse();
    if (!att.length) { box.innerHTML = '<div class="tip"><strong>No exams yet.</strong> Take a <a href="exams.html">practice exam or quiz</a>. Every attempt is listed here, and you can reopen it to see your answers and all the feedback again.</div>'; return; }
    const name = id => id === 'final' ? 'Final exam' : `Module ${String(id).slice(1)} quiz`;
    const groups = {}; att.forEach(a => (groups[a.exam] = groups[a.exam] || []).push(a));
    const order = Object.keys(groups).sort((a, b) => (a === 'final' ? -1 : b === 'final' ? 1 : a.localeCompare(b)));
    box.innerHTML = order.map(ex => `<section class="nb-module"><h2>${name(ex)}</h2><div class="table-scroll"><table class="nb-table"><thead><tr><th>Date</th><th>Score</th><th>Points</th><th></th></tr></thead><tbody>${groups[ex].map(a => `<tr><td>${new Date(a.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td><td>${a.pct}%${a.pending ? ' <span class="small muted">(written not scored)</span>' : ''}</td><td>${a.points != null ? `${a.points} / ${a.max}` : '—'}</td><td>${a.id && det[a.id] ? `<a href="exams.html?attempt=${a.id}">Open</a>` : '<span class="small muted">Details not saved</span>'}</td></tr>`).join('')}</tbody></table></div></section>`).join('') +
      '<p class="small muted">The 20 most recent attempts of each exam keep every question and answer. Older attempts keep their score.</p>';
  }
  page.addEventListener('click', e => {
    const t = e.target.closest('[data-tab]'); if (t) { e.preventDefault(); history.replaceState(null, '', '#' + t.dataset.tab); show(t.dataset.tab); return; }
    const r = e.target.closest('[data-remove]'); if (r) { saved.remove(r.dataset.remove); drawSaved(); counts(); C.notebook.toast('Removed from your notebook.'); return; }
    const br = e.target.closest('[data-bremove]'); if (br) { bookmarks.remove(br.dataset.bremove); drawBookmarks(); counts(); C.notebook.toast('Bookmark removed.'); }
  });
  page.addEventListener('input', e => {
    const n = e.target.dataset.note, bn = e.target.dataset.bnote;
    if (n) { clearTimeout(e.target._t); e.target._t = setTimeout(() => saved.note(n, e.target.value), 300); }
    if (bn) { clearTimeout(e.target._t); e.target._t = setTimeout(() => bookmarks.note(bn, e.target.value), 300); }
  });
  page.addEventListener('change', e => { const f = e.target.dataset.filter; if (f === 'saved') { fSaved = e.target.value; drawSaved(); } if (f === 'bookmarks') { fBm = e.target.value; drawBookmarks(); } });
  page.addEventListener('click', () => setTimeout(counts, 50));
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  counts(); show(location.hash.slice(1) || 'mistakes');
})();
