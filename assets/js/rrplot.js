/* Animated rejection region for a z or t test (Module 8).
   RRPlot.svg(opts) returns a <div class="rr-anim" data-rr='…'> with the finished picture inside;
   in the browser every such div is upgraded automatically into a step-by-step animation:
     1 curve under H₀ → 2 rejection region (area α) → 3 critical value → 4 test statistic slides in → 5 verdict.
   opts: { dist: 'z' | 't', df, dir: 'gt' | 'lt' | 'ne', crit, ts (optional), alpha, mode: 'cv' | 'pv' (optional) }
   With a test statistic, the animation has a switch between the critical-value method and the p-value method:
     p-value: 1 curve → 2 test statistic → 3 shade the p-value beyond TS → 4 outline the α region → 5 compare p-value with α.
   Works in Node too (the build expands placeholders in the notes into the finished picture). */
(function (root) {
  'use strict';
  const lgamma = x => {
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1; let a = c[0]; const t = x + g + 0.5; for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };
  const dnorm = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  const dt = (x, v) => Math.exp(lgamma((v + 1) / 2) - lgamma(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log(1 + x * x / v));
  // upper-tail area beyond v (Simpson's rule on the density; exact enough for 4 decimals)
  function upper(v, dist, df) {
    const St = root.Stats;  // exact CDFs from stats.js when loaded; Simpson's rule otherwise (the build)
    if (St && St.tCDF && St.normalCDF) return dist === 't' && df && df < 1000 ? 1 - St.tCDF(v, df) : 1 - St.normalCDF(v);
    const f = dist === 't' && df && df < 1000 ? x => dt(x, df) : dnorm;
    if (v < 0) return 1 - upper(-v, dist, df);
    const hi = Math.max(v + 60, 80), k = 6000, h = (hi - v) / k; let s = f(v) + f(hi);
    // dense near v, where nearly all the area is
    const sub = (a, b, m) => { const hh = (b - a) / m; let ss = f(a) + f(b); for (let i = 1; i < m; i++) ss += f(a + i * hh) * (i % 2 ? 4 : 2); return ss * hh / 3; };
    return Math.max(0, sub(v, v + 12, 4800) + sub(v + 12, hi, 1200));
  }
  // z: the course reads the normal table (z rounded to 2 decimals, 4-decimal left areas); t: the exact area
  function pValue(o) {
    if (o.dist !== 't') { const zr = Math.round(o.ts * 100) / 100, left = Math.round((1 - upper(zr, 'z')) * 1e4) / 1e4; return Number((o.dir === 'gt' ? 1 - left : o.dir === 'lt' ? left : 2 * Math.min(left, 1 - left)).toFixed(4)); }
    const u = upper(o.ts, o.dist, o.df); return o.dir === 'gt' ? u : o.dir === 'lt' ? 1 - u : Math.min(1, 2 * Math.min(u, 1 - u)); }
  const TAILS = [0.10, 0.05, 0.025, 0.01, 0.005, 0.001, 0.0005];  // STAT 4340 t table (upper-tail areas)
  const TT = {};
  function tTableValue(df, a) { const k = df + '|' + a; if (TT[k] != null) return TT[k]; if (root.Stats && root.Stats.tInv) return (TT[k] = Math.round(root.Stats.tInv(1 - a, df) * 1000) / 1000); let lo = 0, hi = 700; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (upper(m, 't', df) > a) lo = m; else hi = m; } return (TT[k] = Math.round((lo + hi) / 2 * 1000) / 1000); }
  function bracket(o) {  // table bracket for a t p-value: lower < p < upper (row = df, exact; df = n − 1 ≤ 40)
    const row = tableRow(o.df), two = o.dir === 'ne', v = o.dir === 'ne' ? Math.abs(o.ts) : o.dir === 'gt' ? o.ts : -o.ts, f = two ? 2 : 1;
    if (v <= 0) return { lo: 0.5 * f, hi: 1, row };
    let lo = 0, hi = 0.5;
    for (const a of TAILS) { const c = tTableValue(row, a); if (v >= c) hi = a; else { lo = a; break; } }
    return { lo: Math.min(1, lo * f), hi: Math.min(1, hi * f), row };
  }
  const minus = s => String(s).replace('-', '−');
  const fix3 = v => minus(v.toFixed(3));
  const tsText = v => minus(Number(v.toFixed(Math.abs(v) >= 10 ? 3 : 4)).toString());
  const sub = n => String(n).split('').map(ch => '₀₁₂₃₄₅₆₇₈₉'[ch] || ch).join('');
  const ROWS = Array.from({ length: 40 }, (_, i) => i + 1);  // exact df rows 1–40 (STAT 4340)
  const tableRow = df => ROWS.filter(r => r <= df).pop();
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function norm(o) {
    const dist = o.dist === 't' ? 't' : 'z', df = o.df != null ? Number(o.df) : null, dir = o.dir || 'gt';
    const crit = Math.abs(Number(o.crit)), ts = o.ts == null || o.ts === '' ? null : Number(o.ts), alpha = o.alpha != null ? String(o.alpha) : null;
    const inRR = ts == null ? null : dir === 'gt' ? ts >= crit : dir === 'lt' ? ts <= -crit : Math.abs(ts) >= crit;
    const mode = o.mode === 'pv' && ts != null ? 'pv' : 'cv';
    const out = { dist, df, dir, crit, ts, alpha, inRR, mode };
    if (ts != null) out.p = o.p != null ? Number(o.p) : Number(pValue(out).toFixed(4));
    return out;
  }

  /* ---------- geometry: a broken axis keeps the region readable when |TS| is far out ---------- */
  const H = 250, BASE = 182, TOP = 66, LIM = 4.2;
  function layout(o) {
    const far = o.ts != null && Math.abs(o.ts) > LIM;
    const side = far ? Math.sign(o.ts) : 0;
    const W = o.W || 640, inset = W < 500 ? 70 : 92, L = side < 0 ? 36 + inset : 36, R = side > 0 ? W - 36 - inset : W - 36;
    const X = v => {
      if (Math.abs(v) <= LIM || !far) return L + (Math.max(-LIM, Math.min(LIM, v)) + LIM) / (2 * LIM) * (R - L);
      const tsX = side > 0 ? W - 36 : 36, brk = side > 0 ? R + 24 : L - 24;
      const f = (Math.abs(v) - LIM) / (Math.abs(o.ts) - LIM);
      return side > 0 ? Math.min(tsX, brk + f * (tsX - brk)) : Math.max(tsX, brk - f * (brk - tsX));
    };
    return { far, side, L, R, X, W };
  }

  /* ---------- one frame; s = {curve, shade, crit, ts, verdict} each 0..1 ---------- */
  function frame(o, s) {
    if (o.mode === 'pv' && o.ts != null) return framePV(o, s);
    const { far, side, L, R, X, W } = layout(o), small = W < 500;
    const pdf = o.dist === 't' && o.df && o.df < 1000 ? x => dt(x, o.df) : dnorm;
    const peak = pdf(0), Y = v => BASE - pdf(v) / peak * (BASE - TOP);
    const path = (a, b, k) => { let d = ''; for (let i = 0; i <= k; i++) { const v = a + (b - a) * i / k; d += `${i ? 'L' : 'M'}${X(v).toFixed(1)},${Y(v).toFixed(1)}`; } return d; };
    let out = '';
    // region (sweeps outward from the critical value)
    const regions = o.dir === 'gt' ? [[o.crit, LIM]] : o.dir === 'lt' ? [[-o.crit, -LIM]] : [[-o.crit, -LIM], [o.crit, LIM]];
    if (s.shade > 0) for (const [a, b] of regions) {
      const e = a + (b - a) * s.shade, lo = Math.min(a, e), hi = Math.max(a, e);
      out += `<path class="rrp-shade${s.verdict > 0 && o.inRR ? ' rrp-hit' : ''}" d="${path(lo, hi, 40)}L${X(hi).toFixed(1)},${BASE}L${X(lo).toFixed(1)},${BASE}Z"/>`;
    }
    // curve (drawn left to right)
    if (s.curve > 0) out += `<path class="rrp-curve" d="${path(-LIM, -LIM + 2 * LIM * s.curve, Math.max(2, Math.round(180 * s.curve)))}"/>`;
    // axis, ticks, break
    out += `<line class="rrp-axis" x1="${L - 6}" y1="${BASE}" x2="${R + 6}" y2="${BASE}"/>`;
    for (let v = -4; v <= 4; v++) out += `<line class="rrp-tick" x1="${X(v).toFixed(1)}" y1="${BASE}" x2="${X(v).toFixed(1)}" y2="${BASE + 5}"/><text class="rrp-ticklabel" x="${X(v).toFixed(1)}" y="${BASE + 20}" text-anchor="middle">${minus(v)}</text>`;
    if (far) {
      const bx = side > 0 ? R + 12 : L - 12, tx = side > 0 ? W - 36 : 36;
      out += `<path class="rrp-break" d="M${bx - 6},${BASE + 7}L${bx},${BASE - 7}M${bx + 2},${BASE + 7}L${bx + 8},${BASE - 7}"/>`;
      out += `<line class="rrp-axis" x1="${side > 0 ? bx + 10 : tx - 4}" y1="${BASE}" x2="${side > 0 ? tx + 4 : bx - 10}" y2="${BASE}"/>`;
      out += `<text class="rrp-ticklabel rrp-far" x="${tx}" y="${BASE + 20}" text-anchor="middle">${tsText(o.ts)}</text>`;
    } else out += `<path class="rrp-arrow" d="M${R + 6},${BASE - 4}L${R + 14},${BASE}L${R + 6},${BASE + 4}Z"/>`;
    // labels for the two decisions
    if (s.shade > 0.6) {
      const op = Math.min(1, (s.shade - 0.6) / 0.4).toFixed(2);
      const rx = o.dir === 'lt' ? X(-(o.crit + LIM) / 2) : X((o.crit + LIM) / 2);
      out += `<g opacity="${op}"><text class="rrp-region" x="${rx.toFixed(1)}" y="${(BASE - 62).toFixed(1)}" text-anchor="middle">Reject H₀</text>`;
      if (o.dir === 'ne') out += `<text class="rrp-region" x="${X(-(o.crit + LIM) / 2).toFixed(1)}" y="${(BASE - 62).toFixed(1)}" text-anchor="middle">Reject H₀</text>`;
      const fx = o.dir === 'gt' ? X((-LIM + o.crit) / 2 - 0.4) : o.dir === 'lt' ? X((LIM - o.crit) / 2 + 0.4) : X(0);
      out += `<text class="rrp-keep" x="${fx.toFixed(1)}" y="${(TOP - 26).toFixed(1)}" text-anchor="middle">Fail to reject H₀</text>`;
      const ax = o.dir === 'lt' ? X(-o.crit - 0.25) : X(o.crit + 0.25);
      out += `<text class="rrp-area" x="${ax.toFixed(1)}" y="${(BASE - 40).toFixed(1)}" text-anchor="${o.dir === 'lt' ? 'end' : 'start'}">${o.dir === 'ne' ? 'α/2 each' : 'area α'}${o.alpha && o.dir !== 'ne' ? ' = ' + o.alpha : ''}</text></g>`;
    }
    // critical value(s): line drops from the top
    if (s.crit > 0) {
      const cs = o.dir === 'gt' ? [o.crit] : o.dir === 'lt' ? [-o.crit] : [-o.crit, o.crit];
      for (const c of cs) {
        const y0 = TOP - 18, y1 = y0 + (BASE - y0) * s.crit, near = o.ts != null && s.ts > 0 && Math.abs(X(o.ts) - X(c)) < 64, right = near ? X(o.ts) < X(c) : c > 0;
        out += `<line class="rrp-crit" x1="${X(c).toFixed(1)}" y1="${y0}" x2="${X(c).toFixed(1)}" y2="${y1.toFixed(1)}"/>`;
        if (s.crit > 0.7) out += `<text class="rrp-critlabel" x="${(X(c) + (right ? 6 : -6)).toFixed(1)}" y="${y0 + 12}" text-anchor="${right ? 'start' : 'end'}">${c < 0 ? '−' : ''}critical ${o.dist === 't' ? 't' : 'z'} = ${fix3(c)}</text>`;
      }
    }
    // test statistic slides from 0
    if (o.ts != null && s.ts > 0) {
      const e = s.ts < 1 ? 1 - Math.pow(1 - s.ts, 3) : 1, v = o.ts * e, x = X(v);
      const cls = s.verdict > 0 ? (o.inRR ? 'rrp-ts rrp-ts-reject' : 'rrp-ts rrp-ts-keep') : 'rrp-ts';
      const anchor = x > W - 80 ? 'end' : x < 80 ? 'start' : 'middle';
      out += `<line class="${cls}" x1="${x.toFixed(1)}" y1="${TOP - 34}" x2="${x.toFixed(1)}" y2="${BASE}"/><circle class="${cls}" cx="${x.toFixed(1)}" cy="${BASE}" r="5"/>`;
      out += `<text class="rrp-tslabel" x="${x.toFixed(1)}" y="${TOP - 40}" text-anchor="${anchor}">TS = ${s.ts >= 1 ? tsText(o.ts) : minus(v.toFixed(2))}</text>`;
    }
    // distribution name
    out += `<text class="rrp-dist" x="${L}" y="${small ? TOP + 34 : TOP - 2}">${o.dist === 't' && o.df && o.df < 1000 ? 't' + sub(o.df) : 'Z'}</text>`;
    // verdict badge
    if (o.ts != null && s.verdict > 0) {
      const msg = o.inRR ? (small ? 'In the rejection region → reject H₀' : 'TS is in the rejection region → reject H₀') : (small ? 'Not in the region → fail to reject H₀' : 'TS is not in the rejection region → fail to reject H₀'), bw = Math.min(410, W - 16);
      out += `<g opacity="${Math.min(1, s.verdict * 2).toFixed(2)}"><rect class="rrp-badge ${o.inRR ? 'rrp-badge-reject' : 'rrp-badge-keep'}" x="${W / 2 - bw / 2}" y="${BASE + 30}" width="${bw}" height="28" rx="14"/><text class="rrp-badgetext" x="${W / 2}" y="${BASE + 49}" text-anchor="middle">${msg}</text></g>`;
    }
    return out;
  }

  /* p-value method; s = {curve, ts, shade (p-value area), crit (α outline), verdict} */
  function framePV(o, s) {
    const { far, side, L, R, X, W } = layout(o), small = W < 500;
    const pdf = o.dist === 't' && o.df && o.df < 1000 ? x => dt(x, o.df) : dnorm;
    const peak = pdf(0), Y = v => BASE - pdf(v) / peak * (BASE - TOP);
    const path = (a, b, k) => { let d = ''; for (let i = 0; i <= k; i++) { const v = a + (b - a) * i / k; d += `${i ? 'L' : 'M'}${X(v).toFixed(1)},${Y(v).toFixed(1)}`; } return d; };
    const reject = o.p <= Number(o.alpha); let out = '';
    const ts = o.ts, a = Math.abs(ts), clip = v => Math.max(-LIM, Math.min(LIM, v));
    const tails = o.dir === 'gt' ? [[clip(ts), LIM]] : o.dir === 'lt' ? [[clip(ts), -LIM]] : [[clip(a), LIM], [clip(-a), -LIM]];
    if (s.shade > 0) for (const [p0, p1] of tails) {
      const e = p0 + (p1 - p0) * s.shade, lo = Math.min(p0, e), hi = Math.max(p0, e);
      if (hi - lo > 1e-3) out += `<path class="rrp-pshade${s.verdict > 0 ? (reject ? ' rrp-pshade-reject' : ' rrp-pshade-keep') : ''}" d="${path(lo, hi, 50)}L${X(hi).toFixed(1)},${BASE}L${X(lo).toFixed(1)},${BASE}Z"/>`;
    }
    if (s.crit > 0) {  // the α region, outlined for comparison
      const regions = o.dir === 'gt' ? [[o.crit, LIM]] : o.dir === 'lt' ? [[-o.crit, -LIM]] : [[-o.crit, -LIM], [o.crit, LIM]];
      for (const [p0, p1] of regions) { const lo = Math.min(p0, p1), hi = Math.max(p0, p1); out += `<path class="rrp-alpha" opacity="${s.crit.toFixed(2)}" d="${path(lo, hi, 40)}L${X(hi).toFixed(1)},${BASE}L${X(lo).toFixed(1)},${BASE}Z"/>`; }
      const ax = o.dir === 'lt' ? X(-o.crit - 0.2) : X(o.crit + 0.2);
      if (s.crit > 0.6) out += `<text class="rrp-alphalabel" x="${ax.toFixed(1)}" y="${(BASE - 46).toFixed(1)}" text-anchor="${o.dir === 'lt' ? 'end' : 'start'}">α${o.dir === 'ne' ? ' (both tails)' : ''}${o.alpha ? ' = ' + o.alpha : ''}</text>`;
    }
    if (s.curve > 0) out += `<path class="rrp-curve" d="${path(-LIM, -LIM + 2 * LIM * s.curve, Math.max(2, Math.round(180 * s.curve)))}"/>`;
    out += `<line class="rrp-axis" x1="${L - 6}" y1="${BASE}" x2="${R + 6}" y2="${BASE}"/>`;
    for (let v = -4; v <= 4; v++) out += `<line class="rrp-tick" x1="${X(v).toFixed(1)}" y1="${BASE}" x2="${X(v).toFixed(1)}" y2="${BASE + 5}"/><text class="rrp-ticklabel" x="${X(v).toFixed(1)}" y="${BASE + 20}" text-anchor="middle">${minus(v)}</text>`;
    if (far) {
      const bx = side > 0 ? R + 12 : L - 12, tx = side > 0 ? W - 36 : 36;
      out += `<path class="rrp-break" d="M${bx - 6},${BASE + 7}L${bx},${BASE - 7}M${bx + 2},${BASE + 7}L${bx + 8},${BASE - 7}"/>`;
      out += `<line class="rrp-axis" x1="${side > 0 ? bx + 10 : tx - 4}" y1="${BASE}" x2="${side > 0 ? tx + 4 : bx - 10}" y2="${BASE}"/>`;
      out += `<text class="rrp-ticklabel rrp-far" x="${tx}" y="${BASE + 20}" text-anchor="middle">${tsText(o.ts)}</text>`;
    } else out += `<path class="rrp-arrow" d="M${R + 6},${BASE - 4}L${R + 14},${BASE}L${R + 6},${BASE + 4}Z"/>`;
    if (s.ts > 0) {
      const marks = o.dir === 'ne' && !far ? [ts, -ts] : [ts];
      marks.forEach((m, k) => {
        const e = s.ts < 1 ? 1 - Math.pow(1 - s.ts, 3) : 1, v = m * e, x = X(v), anchor = x > W - 80 ? 'end' : x < 80 ? 'start' : 'middle';
        out += `<line class="rrp-ts${k ? ' rrp-ts-mirror' : ''}" x1="${x.toFixed(1)}" y1="${TOP - 34}" x2="${x.toFixed(1)}" y2="${BASE}"/><circle class="rrp-ts" cx="${x.toFixed(1)}" cy="${BASE}" r="${k ? 4 : 5}"/>`;
        out += `<text class="rrp-tslabel" x="${x.toFixed(1)}" y="${TOP - 40}" text-anchor="${anchor}">${k ? '−|TS|' : 'TS = ' + (s.ts >= 1 ? tsText(m) : minus(v.toFixed(2)))}</text>`;
      });
    }
    if (s.shade > 0.7) {
      const px = o.dir === 'lt' ? X(clip(ts) - 0.35) : o.dir === 'gt' ? X(clip(ts) + 0.35) : X(clip(a) + 0.35);
      const anc = far ? (side > 0 ? 'end' : 'start') : o.dir === 'lt' ? 'end' : px > W - 170 ? 'end' : 'start', pxx = far ? X(o.ts) + (side > 0 ? -10 : 10) : px;
      out += `<text class="rrp-plabel" opacity="${Math.min(1, (s.shade - 0.7) / 0.3).toFixed(2)}" x="${pxx.toFixed(1)}" y="${(BASE - 70).toFixed(1)}" text-anchor="${anc}">${o.p < 0.0001 ? 'p-value < 0.0001' : 'p-value = ' + o.p.toFixed(4)}${o.dir === 'ne' ? ' (both tails)' : ''}</text>`;
    }
    out += `<text class="rrp-dist" x="${small ? R : L}" y="${small ? TOP + 4 : TOP - 2}"${small ? ' text-anchor="end"' : ''}>${o.dist === 't' && o.df && o.df < 1000 ? 't' + sub(o.df) : 'Z'}</text>`;
    if (s.verdict > 0) {
      const pv = o.p < 0.0001 ? 'p-value < 0.0001' : 'p-value = ' + o.p.toFixed(4), msg = reject ? `${pv} ${o.p < 0.0001 ? '<' : '≤'} α = ${o.alpha} → reject H₀` : `${pv} > α = ${o.alpha} → fail to reject H₀`, bw = Math.min(410, W - 16);
      out += `<g opacity="${Math.min(1, s.verdict * 2).toFixed(2)}"><rect class="rrp-badge ${reject ? 'rrp-badge-reject' : 'rrp-badge-keep'}" x="${W / 2 - bw / 2}" y="${BASE + 30}" width="${bw}" height="28" rx="14"/><text class="rrp-badgetext" x="${W / 2}" y="${BASE + 49}" text-anchor="middle">${msg}</text></g>`;
    }
    return out;
  }

  function aria(o) {
    if (o.mode === 'pv' && o.ts != null) return `${o.dist === 't' && o.df ? 't distribution with ' + o.df + ' degrees of freedom' : 'Standard normal curve'}. The test statistic is ${tsText(o.ts)}; the p-value, the shaded area ${o.dir === 'ne' ? 'beyond ±' + tsText(Math.abs(o.ts)) : o.dir === 'gt' ? 'to the right of it' : 'to the left of it'}, is ${o.p.toFixed(4)}, which is ${o.p <= Number(o.alpha) ? 'at most' : 'greater than'} α = ${o.alpha}, so ${o.p <= Number(o.alpha) ? 'reject' : 'fail to reject'} H₀.`;
    return `${o.dist === 't' && o.df ? 't distribution with ' + o.df + ' degrees of freedom' : 'Standard normal curve'}. Rejection region ${o.dir === 'gt' ? 'to the right of ' + fix3(o.crit) : o.dir === 'lt' ? 'to the left of ' + fix3(-o.crit) : 'beyond ' + fix3(-o.crit) + ' and ' + fix3(o.crit)} is shaded${o.ts == null ? '' : `; the test statistic ${tsText(o.ts)} is ${o.inRR ? 'in' : 'not in'} the rejection region, so ${o.inRR ? 'reject' : 'fail to reject'} H₀`}.`;
  }
  const FULL = { curve: 1, shade: 1, crit: 1, ts: 1, verdict: 1 };
  function picture(o, s) { return `<svg class="rrp" viewBox="0 0 ${o.W || 640} ${H}" role="img" aria-label="${esc(aria(o))}">${frame(o, s || FULL)}</svg>`; }
  function svg(raw) {
    const o = norm(raw);
    return `<div class="rr-anim" data-rr='${esc(JSON.stringify(o))}'>${picture(o)}</div>`;
  }

  /* ---------- the five steps, in words ---------- */
  function steps(o) {
    if (o.mode === 'pv' && o.ts != null) return stepsPV(o);
    const tableCol = o.dir === 'ne' ? `column α/2${o.alpha ? ' = ' + Number((Number(o.alpha) / 2).toFixed(4)) : ''}` : `column α${o.alpha ? ' = ' + o.alpha : ''}`;
    const row = o.dist === 't' ? `row df = ${tableRow(o.df)}` : 'z row (∞)';
    const sym = o.dist === 't' ? 'critical t' : 'critical z';
    const rule = o.dir === 'gt' ? `TS ≥ ${fix3(o.crit)}` : o.dir === 'lt' ? `TS ≤ ${fix3(-o.crit)}` : `|TS| ≥ ${fix3(o.crit)}`;
    const list = [
      `Assume H₀ is true. Then the test statistic follows ${o.dist === 't' ? 'the t distribution with df = ' + o.df : 'the standard normal Z'}.`,
      `Shade the rejection region: the most extreme ${o.dir === 'ne' ? 'α, split α/2 into each tail' : 'α in the ' + (o.dir === 'gt' ? 'upper' : 'lower') + ' tail'} (the direction of Hₐ).`,
      `Critical value from the t-table: ${row}, ${tableCol}, so ${sym} = ${fix3(o.crit)}. Reject H₀ if ${rule}.`
    ];
    if (o.ts != null) {
      list.push(`Compute the test statistic: TS = ${tsText(o.ts)}.`);
      list.push(o.inRR ? `TS = ${tsText(o.ts)} is in the rejection region, so reject H₀.` : `TS = ${tsText(o.ts)} is not in the rejection region, so fail to reject H₀.`);
    }
    return list;
  }

  function stepsPV(o) {
    const T = o.dist === 't' ? 'T' : 'Z', ts = tsText(o.ts), a = tsText(Math.abs(o.ts)), pv = o.p < 0.0001 ? 'p-value < 0.0001' : 'p-value = ' + o.p.toFixed(4), reject = o.p <= Number(o.alpha);
    const formula = o.dir === 'gt' ? `P(${T} ≥ ${ts})` : o.dir === 'lt' ? `P(${T} ≤ ${ts})` : `2P(${T} ≥ ${a})`;
    let how;
    if (o.dist === 'z') { const r2 = minus((Math.round(o.ts * 100) / 100).toFixed(2)), a2 = (Math.round(Math.abs(o.ts) * 100) / 100).toFixed(2); how = Math.abs(o.ts) > 3.49 ? `|TS| is beyond the normal table (±3.49), so the tail area is essentially 0.` : `From the normal table (z rounded to ${o.dir === 'ne' ? a2 : r2}): ${o.dir === 'gt' ? `1 − (left area at ${r2})` : o.dir === 'lt' ? `the left area at ${r2}` : `2 × (1 − left area at ${a2})`}.`; }
    else { const b = bracket(o); how = `The t-table (row df = ${b.row}) only brackets it: ${b.lo === 0 ? `p-value < ${b.hi}` : b.hi >= 1 && b.lo >= 0.5 ? `p-value > ${b.lo}` : `${b.lo} < p-value < ${b.hi}`}. pt in R or scipy.stats.t.cdf in Python gives the exact value.`; }
    return [
      `Assume H₀ is true. Then the test statistic follows ${o.dist === 't' ? 'the t distribution with df = ' + o.df : 'the standard normal Z'}.`,
      `Compute the test statistic: TS = ${ts}.`,
      `p-value = ${formula}, the area ${o.dir === 'ne' ? 'beyond ±' + a + ' (both tails, since Hₐ is ≠)' : o.dir === 'gt' ? 'to the right of TS' : 'to the left of TS'}. ${how} ${pv}.`,
      `Compare with α = ${o.alpha}: the outlined region has area α.`,
      reject ? `${pv} ${o.p < 0.0001 ? '<' : '≤'} α = ${o.alpha}, so reject H₀. (TS is in the rejection region too: both methods always agree.)` : `${pv} > α = ${o.alpha}, so fail to reject H₀. (TS is not in the rejection region either: both methods always agree.)`
    ];
  }

  /* ---------- browser animation ---------- */
  const PHASES_CV = ['curve', 'shade', 'crit', 'ts', 'verdict'], PHASES_PV = ['curve', 'ts', 'shade', 'crit', 'verdict'];
  const DUR = { curve: 900, shade: 1200, crit: 700, ts: 1500, verdict: 600 }, PAUSE = 350;
  function mount(el) {
    if (el.dataset.mounted) return; el.dataset.mounted = '1';
    let o; try { o = JSON.parse(el.dataset.rr); } catch (e) { return; }
    if (el.clientWidth && el.clientWidth < 480) o.W = 400;
    const W = o.W || 640, reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches, both = o.ts != null && o.alpha != null && o.p != null;
    el.innerHTML = `${both ? `<div class="rr-mode" role="group" aria-label="Method"><span class="small muted">Decide with</span><button type="button" data-mode="cv">Critical value</button><button type="button" data-mode="pv">p-value</button></div>` : ''}<div class="rr-stage"><svg class="rrp" viewBox="0 0 ${W} ${H}" role="img"></svg></div>
      <div class="rr-controls"><button type="button" class="rr-back" aria-label="Previous step">‹ Back</button><button type="button" class="rr-step primary">Next step ›</button><button type="button" class="rr-play">▶ Play all</button><span class="rr-count small muted" aria-live="polite"></span></div>
      <ol class="rr-steps"></ol>`;
    const svgEl = el.querySelector('svg'), play = el.querySelector('.rr-play'), stepBtn = el.querySelector('.rr-step'), back = el.querySelector('.rr-back'), count = el.querySelector('.rr-count'), list = el.querySelector('.rr-steps');
    let state, done = 0, raf = null, n, items, PH;
    const draw = () => { svgEl.innerHTML = frame(o, state); items.forEach((li, i) => { li.classList.toggle('on', i < done); li.classList.toggle('now', i === done - 1); }); count.textContent = done ? `Step ${done} of ${n}` : `Press Next step to build the graph one step at a time.`; };
    const finishTo = k => { PH.forEach((ph, i) => { state[ph] = i < k ? 1 : 0; }); done = k; draw(); };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; };
    function animate(from, to, cb) {
      stop(); if (reduce) { finishTo(to); cb && cb(); return; }
      let i = from; const runPhase = () => {
        if (i >= to) { cb && cb(); return; }
        const ph = PH[i], t0 = performance.now(); done = i + 1;
        const tick = now => { state[ph] = Math.min(1, (now - t0) / DUR[ph]); draw(); if (state[ph] < 1) raf = requestAnimationFrame(tick); else { i++; raf = null; setTimeout(runPhase, i < to ? PAUSE : 0); } };
        raf = requestAnimationFrame(tick);
      };
      runPhase();
    }
    const label = () => { play.textContent = done >= n ? '↻ Replay' : done ? '▶ Play the rest' : '▶ Play all'; stepBtn.disabled = done >= n; back.disabled = done === 0; };
    function setMode(mode) {
      stop(); o.mode = mode === 'pv' && both ? 'pv' : 'cv';
      PH = o.mode === 'pv' ? PHASES_PV : PHASES_CV; n = o.ts != null ? 5 : 3;
      state = { curve: 0, shade: 0, crit: 0, ts: 0, verdict: 0 };
      list.innerHTML = steps(o).map(w => `<li>${esc(w)}</li>`).join(''); items = [...list.querySelectorAll('li')];
      svgEl.setAttribute('aria-label', aria(o));
      el.querySelectorAll('[data-mode]').forEach(b => { const on = b.dataset.mode === o.mode; b.setAttribute('aria-pressed', String(on)); b.classList.toggle('primary', on); });
      finishTo(0); play.disabled = false; label();
      if (root.Course && root.Course.renderMath) root.Course.renderMath(list);
    }
    el.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { if (b.dataset.mode !== o.mode) setMode(b.dataset.mode); }));
    play.addEventListener('click', () => { const from = done >= n ? 0 : done; if (from === 0) finishTo(0); play.disabled = true; animate(from, n, () => { play.disabled = false; label(); }); });
    stepBtn.addEventListener('click', () => { if (done >= n) return; play.disabled = true; stepBtn.disabled = true; back.disabled = true; animate(done, done + 1, () => { play.disabled = false; label(); }); });
    back.addEventListener('click', () => { stop(); if (done > 0) finishTo(done - 1); play.disabled = false; label(); });
    setMode(o.mode);
    el.rrFinish = () => { stop(); finishTo(n); play.disabled = false; label(); };
    el.rrStep = () => stepBtn.click();
    el.rrMode = setMode;
  }
  function mountAll(scope) { (scope || root.document).querySelectorAll('.rr-anim:not([data-mounted])').forEach(mount); }

  const api = { svg, picture, steps, mount, mountAll, dnorm, dt, norm, pValue, bracket, upper };
  root.RRPlot = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) {
    const start = () => { mountAll(); new MutationObserver(() => mountAll()).observe(root.document.body, { childList: true, subtree: true }); };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start); else start();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
