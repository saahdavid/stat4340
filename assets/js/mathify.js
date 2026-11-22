/* Typesets math written as plain text.
   Notes, practice and exam questions often write formulas with plain characters
   ("x̄ = 15/5 = 3", "σp̂=√[.57(.43)/20]", "H₀: p = 0.5", "TS ≥ 2.326"). Before KaTeX runs,
   Mathify.scan(el) finds those runs inside text and wraps them as <span class="math">TeX</span>,
   so they render like the rest of the math. Calculator keystrokes, Excel formulas, code and
   students' own written answers are left untouched.
   Mathify.convert(text) → [{text} | {tex}] is the pure part (also usable in Node). */
(function (root) {
  'use strict';
  const HAT = '̂', BAR = '̄';
  const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ₐ': 'a', 'ₓ': 'x' };
  const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  const GREEK = { 'μ': '\\mu', 'µ': '\\mu', 'σ': '\\sigma', 'α': '\\alpha', 'β': '\\beta', 'λ': '\\lambda', 'π': '\\pi', 'ρ': '\\rho', 'Φ': '\\Phi', 'φ': '\\phi', 'θ': '\\theta', 'χ': '\\chi', 'Σ': '\\Sigma', 'Δ': '\\Delta', 'ε': '\\varepsilon' };
  const PRE = { 'ŷ': ['y', 'hat'], 'ȳ': ['y', 'bar'], 'x̄': ['x', 'bar'], 'p̂': ['p', 'hat'] };
  const IDENT = { SE: '\\text{SE}', SD: '\\text{SD}', IQR: '\\text{IQR}', df: '\\text{df}', TS: '\\text{TS}', sx: 's_x', sy: 's_y', Sx: 'S_x', np: 'np', Q1: 'Q_1', Q3: 'Q_3', ME: '\\text{ME}' };
  const FUNC = { Binomial: '\\text{Binomial}', Bin: '\\text{Bin}', Var: '\\text{Var}', SD: '\\text{SD}', SE: '\\text{SE}', N: 'N', P: 'P', C: 'C', E: 'E', B: 'B' };
  // single letters that read as variables on their own in prose
  const LONE = new Set(['n', 'p', 'q', 'x', 'y', 's', 'r', 'z', 't', 'k', 'm', 'b', 'X', 'Y', 'Z', 'R', 'T']);
  const OPS = { '=': '=', '≈': '\\approx', '≠': '\\ne', '<': '<', '>': '>', '≤': '\\le', '≥': '\\ge', '+': '+', '−': '-', '-': '-', '×': '\\times', '·': '\\cdot', '⋅': '\\cdot', '/': '/', '^': '^', '√': '\\sqrt', '(': '(', ')': ')', '[': '[', ']': ']', '|': '|', '∼': '\\sim', '~': '\\sim', '±': '\\pm', '*': '^{*}', "'": "'", ':': ':', ',': ',', '%': '\\%', '!': '!', '…': '\\ldots' };
  const STRONG_OPS = new Set(['≈', '≠', '≤', '≥', '×', '√', '^', '∼', '±']);
  const REL = new Set(['=', '≈', '≠', '<', '>', '≤', '≥']);

  /* ---------- tokenizer ---------- */
  function tokenize(s) {
    const out = []; let i = 0;
    const isL = ch => /[A-Za-z]/.test(ch || '');
    while (i < s.length) {
      const ch = s[i], rest = s.slice(i);
      let m;
      if ((m = /^\s+/.exec(rest))) { out.push({ k: 'sp', v: m[0] }); i += m[0].length; continue; }
      if ((m = /^(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?|\.\d+)/.exec(rest))) {
        const after = s.slice(i + m[0].length);
        if (/^[A-Za-z]{2,}/.test(after) && !/^(?:sx|sy)\b/.test(after)) { const w = /^[A-Za-z]+/.exec(after)[0]; out.push({ k: 'word', v: m[0] + w }); i += m[0].length + w.length; continue; }
        out.push({ k: 'num', v: m[0], tex: m[0].replace(/,/g, '{,}') }); i += m[0].length; continue;
      }
      if (GREEK[ch]) {
        let tex = GREEK[ch], j = i + 1, strong = true, sub = '', sup = '';
        // Greek followed directly by a variable is a subscript: μX, σp̂, μx̄
        const nxt = /^([A-Za-z])([̂̄]?)(?![A-Za-z])/.exec(s.slice(j)) || (PRE[s.slice(j, j + 2)] ? null : null);
        const pre = Object.keys(PRE).find(p => s.startsWith(p, j) && !isL(s[j + p.length]));
        if (pre) { const [b, a] = PRE[pre]; sub = `\\${a}{${b}}`; j += pre.length; }
        else if (nxt && !isL(s[j + nxt[0].length])) { sub = nxt[2] === HAT ? `\\hat{${nxt[1]}}` : nxt[2] === BAR ? `\\bar{${nxt[1]}}` : nxt[1]; j += nxt[0].length; }
        while (SUB[s[j]]) { sub += SUB[s[j]]; j++; }
        while (SUP[s[j]]) { sup += SUP[s[j]]; j++; }
        if (sub) tex += `_{${sub}}`; if (sup) tex += `^{${sup}}`;
        out.push({ k: 'var', v: s.slice(i, j), tex, strong }); i = j; continue;
      }
      if ((m = /^p-value(s?)\b/.exec(rest)) && !/[A-Za-z]/.test(s[i - 1] || '')) { out.push({ k: 'ident', v: m[0], tex: `p\\text{-value${m[1]}}`, strong: true }); i += m[0].length; continue; }
      if ((m = /^Q([13])(?![\d.A-Za-z])/.exec(rest))) { out.push({ k: 'var', v: m[0], tex: `Q_${m[1]}`, strong: true, letter: 'Q' }); i += 2; continue; }
      const pre = Object.keys(PRE).find(p => rest.startsWith(p));
      if (pre || (isL(ch) && !isL(s[i + 1]) && (s[i + 1] === HAT || s[i + 1] === BAR || !/[̀-ͯ]/.test(s[i + 1] || '')))) {
        let base, acc = '', j;
        if (pre) { [base, acc] = PRE[pre]; j = i + pre.length; }
        else { base = ch; j = i + 1; if (s[j] === HAT) { acc = 'hat'; j++; } else if (s[j] === BAR) { acc = 'bar'; j++; } }
        if (!pre && isL(s[j])) { /* part of a word */ }
        else {
          let sub = '', sup = '';
          while (SUB[s[j]]) { sub += SUB[s[j]]; j++; }
          while (SUP[s[j]]) { sup += SUP[s[j]]; j++; }
          let tex = acc ? `\\${acc}{${base}}` : base;
          if (sub) tex += `_{${sub}}`; if (sup) tex += `^{${sup}}`;
          const prevCh = s[i - 1] || '';
          const fn = s[j] === '(' && FUNC[base];
          out.push({ k: fn ? 'func' : 'var', v: s.slice(i, j), tex, letter: base, strong: !!(acc || sub || sup), apos: /[’'`]/.test(prevCh) });
          i = j; continue;
        }
      }
      if ((m = /^[A-Za-z]+(?:[₀-₉]+)?/.exec(rest))) {
        const w = m[0], sub = /[₀-₉]/.test(w) ? w.replace(/[A-Za-z]+/, '') : '', word = w.replace(/[₀-₉]+/, '');
        const j = i + w.length;
        if (sub && word.length <= 2) { out.push({ k: 'var', v: w, tex: `${/^(np|nq)$/.test(word) || word.length === 1 ? word : `\\text{${word}}`}_{${sub.split('').map(c => SUB[c]).join('')}}`, strong: true }); i = j; continue; }
        if (/^Q[13]$/.test(w + (s[j] || '')) && /[13]/.test(s[j] || '') && !/\d/.test(s[j + 1] || '')) { out.push({ k: 'var', v: w + s[j], tex: IDENT['Q' + s[j]], strong: true }); i = j + 1; continue; }
        if (s[j] === '(' && FUNC[w]) { out.push({ k: 'func', v: w, tex: FUNC[w], strong: w.length > 1 }); i = j; continue; }
        if (IDENT[w]) { out.push({ k: 'ident', v: w, tex: IDENT[w], strong: true, attached: REL.has(s[j]) || REL.has(s[i - 1]) }); i = j; continue; }
        out.push({ k: 'word', v: w }); i = j; continue;
      }
      if (ch === '·' && /\s/.test(s[i - 1] || '') && /\s/.test(s[i + 1] || '')) { out.push({ k: 'brk', v: ch }); i++; continue; }
      if (SUP[ch]) { let sup = ''; let j = i; while (SUP[s[j]]) { sup += SUP[s[j]]; j++; } out.push({ k: 'op', v: s.slice(i, j), tex: `^{${sup}}`, strong: true, sup: true }); i = j; continue; }
      if (OPS[ch] !== undefined) { out.push({ k: 'op', v: ch, tex: OPS[ch], strong: STRONG_OPS.has(ch) || (ch === '*' && /[A-Za-z]/.test(s[i - 1] || '')) }); i++; continue; }
      out.push({ k: 'brk', v: ch }); i++;
    }
    return out;
  }

  /* ---------- group tokens into candidate runs ---------- */
  function convert(text) {
    const toks = tokenize(text), parts = [];
    let run = [], depth = 0;
    const flush = () => { if (run.length) parts.push(...finish(run)); run = []; depth = 0; };
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], prev = run.filter(x => x.k !== 'sp').slice(-1)[0];
      if (t.k === 'word' || t.k === 'brk') { flush(); parts.push({ text: t.v }); continue; }
      if (t.k === 'op') {
        if (t.v === ',' && depth === 0) { flush(); parts.push({ text: t.v }); continue; }
        if (t.v === ':' && !(prev && prev.k === 'var' && /^H/.test(prev.v))) { flush(); parts.push({ text: t.v }); continue; }
        if (t.v === "'" && !(prev && prev.k === 'var' && !/\s/.test(text[0]))) { /* apostrophe: break */ if (!(prev && prev.k === 'var' && toks[i - 1] === prev)) { flush(); parts.push({ text: t.v }); continue; } }
        if (t.v === '*' && !(prev && toks[i - 1] === prev && (prev.k === 'var' || prev.k === 'ident'))) { flush(); parts.push({ text: t.v }); continue; }
        if (t.v === '!' && !(prev && prev.k === 'num' && toks[i - 1] === prev)) { flush(); parts.push({ text: t.v }); continue; }
        if (t.v === '%' && !(prev && prev.k === 'num' && toks[i - 1] === prev)) { flush(); parts.push({ text: t.v }); continue; }
        if (t.v === '-' && toks[i - 1] && toks[i - 1].k === 'word') { flush(); parts.push({ text: t.v }); continue; }
        if ('([' .includes(t.v)) depth++;
        if (')]'.includes(t.v)) depth = Math.max(0, depth - 1);
      }
      if (t.k === 'var' && t.apos) { flush(); parts.push({ text: t.v }); continue; }
      run.push(t);
    }
    flush();
    // merge adjacent text parts
    const merged = [];
    for (const p of parts) { const last = merged[merged.length - 1]; if (p.text != null && last && last.text != null) last.text += p.text; else merged.push(p); }
    return merged;
  }

  // Decide whether a run is math; trim it; return text/tex parts.
  function finish(run) {
    // trim spaces and stray operators at the ends
    let a = 0, b = run.length;
    const keepLead = (t, i) => t.k !== 'sp' && !(t.k === 'op' && !['(', '[', '|', '√', '−', '-', '±'].includes(t.v) && !(['≥', '≤', '≠', '≈', '<', '>'].includes(t.v) && run.slice(i + 1).some(x => x.k === 'num' || x.k === 'var')));
    const keepTrail = t => t.k !== 'sp' && !(t.k === 'op' && ![')', ']', '|', '*', "'", '%', '!', '…'].includes(t.v) && !t.sup);
    while (a < b && !keepLead(run[a], a)) a++;
    while (b > a && !keepTrail(run[b - 1])) b--;
    // a leading minus must be followed by a number or variable
    if (a < b && (run[a].v === '−' || run[a].v === '-') && !(run[a + 1] && (run[a + 1].k === 'num' || run[a + 1].k === 'var'))) a++;
    // drop unmatched brackets at the ends
    const bal = (x, y) => { let d = 0; for (let i = x; i < y; i++) { if ('(['.includes(run[i].v) && run[i].k === 'op') d++; if (')]'.includes(run[i].v) && run[i].k === 'op') d--; } return d; };
    for (let guard = 0; guard < 4; guard++) {
      const d = bal(a, b);
      if (d > 0 && run[a] && '(['.includes(run[a].v) && run[a].k === 'op') a++;
      else if (d < 0 && run[b - 1] && ')]'.includes(run[b - 1].v) && run[b - 1].k === 'op') b--;
      else break;
      while (a < b && run[a].k === 'sp') a++; while (b > a && run[b - 1].k === 'sp') b--;
    }
    if (bal(a, b) !== 0 && b - a > 1) {
      // split at the first unmatched bracket and treat each side on its own
      let d = 0, cut = -1; const opens = [];
      for (let i = a; i < b; i++) { const v = run[i].k === 'op' ? run[i].v : ''; if ('(['.includes(v) && v) opens.push(i); else if (')]'.includes(v) && v) { if (opens.length) opens.pop(); else { cut = i; break; } } }
      if (cut < 0 && opens.length) cut = opens[0];
      if (cut >= 0) return [...(cut > 0 ? finish(run.slice(0, cut)) : []), { text: run[cut].v }, ...(cut + 1 < run.length ? finish(run.slice(cut + 1)) : [])];
    }
    const before = run.slice(0, a).map(t => t.v).join(''), after = run.slice(b).map(t => t.v).join('');
    const core = run.slice(a, b), sig = core.filter(t => t.k !== 'sp');
    const out = [];
    const isMath = (() => {
      if (!sig.length) return false;
      if (bal(a, b) !== 0) return false;
      const strong = sig.some(t => t.strong);
      const rel = sig.some(t => t.k === 'op' && REL.has(t.v));
      const arith = sig.some(t => t.k === 'op' && ['+', '−', '-', '/', '×', '·'].includes(t.v));
      const vars = sig.filter(t => t.k === 'var' || t.k === 'func' || t.k === 'ident');
      const nums = sig.filter(t => t.k === 'num');
      if (strong) return true;
      if (sig.length === 1 && sig[0].k === 'var') return LONE.has(sig[0].letter) && sig[0].v.length === 1;
      if (sig.some(t => t.k === 'func') && sig.some(t => t.v === '(')) return true;
      if (!rel && !arith && sig.length === 2 && sig[0].k === 'num' && sig[1].k === 'var') return false;
      if (vars.length && (rel || arith || nums.length)) return vars.every(v => v.k !== 'var' || LONE.has(v.letter) || v.strong || rel || arith);
      if (!vars.length && rel && nums.length >= 2) return true;
      return false;
    })();
    if (before) out.push({ text: before });
    if (isMath) out.push({ tex: toTex(core) }); else out.push({ text: core.map(t => t.v).join('') });
    if (after) out.push({ text: after });
    return out;
  }

  // Tokens → TeX; √ and ^ take the next group as their argument.
  function toTex(toks) {
    const t = toks.filter(x => x.k !== 'sp' || true);
    let i = 0;
    const group = () => { // returns tex of next group
      while (i < t.length && t[i].k === 'sp') i++;
      if (i >= t.length) return '';
      const x = t[i];
      if (x.k === 'op' && (x.v === '(' || x.v === '[')) {
        const close = x.v === '(' ? ')' : ']'; let d = 0, j = i;
        for (; j < t.length; j++) { if (t[j].v === x.v) d++; if (t[j].v === close) { d--; if (!d) break; } }
        const inner = t.slice(i + 1, j); i = j + 1;
        return { inner: toTex(inner), paren: x.v === '(' };
      }
      i++;
      if (x.k === 'op' && x.v === '√') { const g = group(); return `\\sqrt{${typeof g === 'string' ? g : g.inner}}`; }
      return x.tex != null ? x.tex : x.v;
    };
    let out = '';
    while (i < t.length) {
      const x = t[i];
      if (x.k === 'sp') { out += ' '; i++; continue; }
      if (x.k === 'op' && x.v === '√') { i++; const g = group(); out += `\\sqrt{${typeof g === 'string' ? g : g.inner}}`; continue; }
      if (x.k === 'op' && x.v === '^') { i++; const g = group(); out += `^{${typeof g === 'string' ? g : g.inner}}`; continue; }
      if (x.k === 'op' && x.v === '[') { out += '\\lbrack '; i++; continue; }
      if (x.k === 'op' && x.v === ']') { out += '\\rbrack '; i++; continue; }
      out += (x.tex != null ? x.tex : x.v) + (/^\\[a-zA-Z]+$/.test(x.tex || '') ? ' ' : ''); i++;
    }
    return out.replace(/\s+/g, ' ').trim();
  }

  /* ---------- DOM ---------- */
  const SKIP = '.katex,.math,code,pre,kbd,.screen,.xl,.check,script,style,svg,textarea,input,select,option,button,.exam-yours,.lab-stage,.lab-detail,.eyebrow,.skill-list,.no-mathify,noscript';
  const QUICK = /[̂̄ŷȳμσαβΦΣ√≤≥≠≈×²³₀₁₂ₐ]|[=<>+−\/^]|\bQ[13]\b|\bp-value|\b[A-Za-z]\b/;
  function scan(el) {
    if (!el || !root.document) return;
    const w = root.document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !n.parentElement.closest(SKIP) && QUICK.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const nodes = []; let n; while ((n = w.nextNode())) nodes.push(n);
    for (const node of nodes) {
      const parts = convert(node.nodeValue);
      if (!parts.some(p => p.tex != null)) continue;
      const frag = root.document.createDocumentFragment();
      for (const p of parts) {
        if (p.tex != null) { const sp = root.document.createElement('span'); sp.className = 'math'; sp.dataset.auto = '1'; sp.textContent = p.tex; frag.appendChild(sp); }
        else frag.appendChild(root.document.createTextNode(p.text));
      }
      node.parentNode.replaceChild(frag, node);
    }
  }
  root.Mathify = { convert, tokenize, scan };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Mathify;
})(typeof globalThis !== 'undefined' ? globalThis : this);
