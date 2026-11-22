/* Practice-exam question bank: shared helpers.

   Multiple choice: gen() returns { stem, options:[{t, tier, why, v?, last?}], numeric? }.
     Exactly one option has tier 4; the others are 2, 1, or 0 (the course's 4/2/1/0 scale).
     Numeric options are shown in ascending order; other options are shuffled except `last` ones.
   Free response: gen() returns { stem, parts:[…], solution:[steps], ti?, excel?, written? }.
     parts use the practice format ({type:'num', label, answer, tol?, alts?, show?, mistakes?}
     or {type:'choice', label, options, answer, why?}); written = { prompt, keys:[k1,k2], model }.
   Math goes in \( … \); the exam page typesets it. */
(function (root) {
  'use strict';
  const S = root.HandStats, R = root.HandKit.R;
  const B = root.ExamBank = { mc: {}, fr: {}, S, R };
  B.MC = (m, id, gen) => (B.mc[m] = B.mc[m] || []).push({ m, id, gen });
  B.FR = (m, id, gen) => (B.fr[m] = B.fr[m] || []).push({ m, id, gen });
  B.n = (x, d = 4) => S.num(x, d);                       // display number (trimmed)
  B.tx = (x, d = 4) => S.num(x, d).replace('−', '-');      // number inside TeX
  B.o = (t, tier, why, extra) => Object.assign({ t, tier, why }, extra || {});
  // Numeric options from [[value, tier, why], …] with the correct value first. Duplicates (after
  // rounding) are dropped and replaced by a filler distractor so there are always four choices.
  B.nums = (list, d = 4, show) => {
    const F = show || (v => S.num(v, d)), out = [], seen = new Set();
    for (const [v, tier, why] of list) {
      if (!Number.isFinite(v)) continue;
      const t = F(v); if (seen.has(t)) continue;
      seen.add(t); out.push({ t, v, tier, why });
    }
    const base = out[0].v; let k = 1;
    while (out.length < 4 && k < 50) {
      const v = base === 0 ? k : base * (k % 2 ? 1 + 0.25 * Math.ceil(k / 2) : 1 - 0.2 * Math.ceil(k / 2)); k++;
      const t = F(v); if (seen.has(t) || v < 0 && base >= 0) continue;
      seen.add(t); out.push({ t, v, tier: 0, why: 'This value does not come from any of the steps. Rework the arithmetic one step at a time.' });
    }
    return out.slice(0, 4).sort((a, b) => a.v - b.v);
  };
  B.pct = v => S.num(v * 100, 2) + '%';
  B.list = a => a.join(', ');
  B.table = (head, rows) => `<div class="table-scroll"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  // Normal table probability for P(X < a), P(X > a), or P(a < X < b) with mean mu and sd s.
  B.normal = (mu, s, type, a, b) => {
    const za = S.zRound((a - mu) / s), zb = b != null ? S.zRound((b - mu) / s) : null;
    const ta = S.tableArea(za), tb = zb != null ? S.tableArea(zb) : null;
    const ea = S.pnorm((a - mu) / s), eb = b != null ? S.pnorm((b - mu) / s) : null;
    if (type === 'lt') return { za, ta, p: ta, exact: ea, flip: 1 - ta };
    if (type === 'gt') return { za, ta, p: S.round(1 - ta, 4), exact: 1 - ea, flip: ta };
    return { za, zb, ta, tb, p: S.round(tb - ta, 4), exact: eb - ea, flip: S.round(1 - (tb - ta), 4) };
  };
  B.ceil = x => Math.ceil(x - 1e-9);
})(globalThis);
