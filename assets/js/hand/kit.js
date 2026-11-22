/* Ported from stat4340-learn: multi-step, hand-first questions with mistake diagnosis. */
(function (root) {
  "use strict";
  const S = root.HandStats;
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // ---------- calculator & spreadsheet snippets ----------
  // keys("[2nd] [VARS] {2:normalcdf(}") → keycaps for [keys], dashed boxes for {menu items}.
  function keys(str) {
    return str
      .replace(/\[([^\]]+)\]/g, (m, k) => {
        const cls = /^2nd$/i.test(k) ? "k2nd" : /^alpha$/i.test(k) ? "kalpha" : "";
        return `<kbd${cls ? ` class="${cls}"` : ""}>${k}</kbd>`;
      })
      .replace(/\{([^}]+)\}/g, (m, k) => `<kbd class="kmenu">${k}</kbd>`);
  }
  const screen = s => `<span class="screen">${s}</span>`;
  const xl = (formula, out) => `<div class="xl"><span class="fx">fx</span><code>${formula}</code>${out !== undefined ? `<span class="out">${out}</span>` : ""}</div>`;
  function methods(ti, excel) {
    let h = '<div class="methods">';
    if (ti) h += `<details><summary><span class="tag tag-ti">R</span> Check it in R</summary><div>${ti}</div></details>`;
    if (excel) h += `<details><summary><span class="tag tag-xl">Python</span> Check it in Python</summary><div>${excel}</div></details>`;
    return h + "</div>";
  }

  // ---------- density curve figure ----------
  // opts: {pdf, from, to, shade:[[lo,hi],...], shade2:[[lo,hi]], marks:[{x,label}], ticks:[{x,label}], w, h, label}
  function curve(opts) {
    const w = opts.w || 520, h = opts.h || 170, padL = 10, padR = 10, padT = 12, padB = 30;
    const from = opts.from, to = opts.to, pdf = opts.pdf;
    const N = 220;
    let ymax = 0;
    const pts = [];
    for (let i = 0; i <= N; i++) { const x = from + (to - from) * i / N, y = pdf(x); pts.push([x, y]); if (y > ymax) ymax = y; }
    const X = x => padL + (x - from) / (to - from) * (w - padL - padR);
    const Y = y => h - padB - y / ymax * (h - padT - padB);
    const path = pts.map((p, i) => (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1)).join(" ");
    function area(lo, hi, cls) {
      lo = Math.max(lo, from); hi = Math.min(hi, to);
      if (!(hi > lo)) return "";
      let d = `M${X(lo).toFixed(1)} ${Y(0).toFixed(1)}`;
      const steps = 120;
      for (let i = 0; i <= steps; i++) { const x = lo + (hi - lo) * i / steps; d += ` L${X(x).toFixed(1)} ${Y(pdf(x)).toFixed(1)}`; }
      d += ` L${X(hi).toFixed(1)} ${Y(0).toFixed(1)} Z`;
      return `<path class="${cls}" d="${d}"/>`;
    }
    let svg = `<svg class="curve" viewBox="0 0 ${w} ${h}" role="img" aria-label="${opts.label || "Density curve with shaded area"}">`;
    (opts.shade || []).forEach(s => { svg += area(s[0], s[1], "shade"); });
    (opts.shade2 || []).forEach(s => { svg += area(s[0], s[1], "shade2"); });
    svg += `<line class="axis" x1="${padL}" y1="${Y(0)}" x2="${w - padR}" y2="${Y(0)}"/>`;
    svg += `<path class="line" d="${path}"/>`;
    (opts.marks || []).forEach(m => {
      if (m.x < from || m.x > to) return;
      svg += `<line class="mark" x1="${X(m.x)}" y1="${Y(0)}" x2="${X(m.x)}" y2="${padT}"/>`;
      if (m.top) svg += `<text x="${X(m.x)}" y="${padT + 2}" text-anchor="middle">${m.top}</text>`;
    });
    (opts.ticks || []).forEach(t => {
      if (t.x < from - 1e-9 || t.x > to + 1e-9) return;
      svg += `<line class="axis" x1="${X(t.x)}" y1="${Y(0)}" x2="${X(t.x)}" y2="${Y(0) + 4}"/>`;
      svg += `<text x="${X(t.x)}" y="${Y(0) + 17}" text-anchor="middle">${t.label}</text>`;
    });
    return svg + "</svg>";
  }
  // Normal picture with μ ± kσ ticks.
  function normalFig(mu, sigma, shade, extra = {}) {
    const ticks = [];
    for (let k = -3; k <= 3; k++) ticks.push({ x: mu + k * sigma, label: S.num(mu + k * sigma, 4) });
    return curve(Object.assign({ pdf: x => S.dnorm(x, mu, sigma), from: mu - 3.6 * sigma, to: mu + 3.6 * sigma, shade, ticks }, extra));
  }
  function zFig(shade, extra = {}) {
    const ticks = [-3, -2, -1, 0, 1, 2, 3].map(x => ({ x, label: String(x).replace("-", "−") }));
    return curve(Object.assign({ pdf: x => S.dnorm(x), from: -3.8, to: 3.8, shade, ticks }, extra));
  }
  function tFig(df, shade, extra = {}) {
    const ticks = [-3, -2, -1, 0, 1, 2, 3].map(x => ({ x, label: String(x).replace("-", "−") }));
    return curve(Object.assign({ pdf: x => S.dt(x, df), from: -4, to: 4, shade, ticks }, extra));
  }

  // ---------- generator helpers shared by every module ----------
  const R = {
    int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    shuffle,
    step: (a, b, st) => { const n = Math.round((b - a) / st); return S.round(a + st * Math.floor(Math.random() * (n + 1)), 6); },
    sample: (arr, k) => shuffle(arr.slice()).slice(0, k),
    coin: (p = 0.5) => Math.random() < p
  };

  // ---------- normal probability helper (Modules 5, 6, 8) ----------
  // Builds the by-hand table steps, the exact value, a picture, and TI/Excel lines.
  // o = { mu, sd, type: "lt"|"gt"|"bt"|"out", a, b, v: "X" (TeX name), sdTex: "\\sigma" }
  const tx = (x, d = 4) => S.num(x, d).replace("−", "-");
  function normalProb(o) {
    const { mu, sd, type, a } = o, b = o.b, v = o.v || "X", sdTex = o.sdTex || "\\sigma";
    const zA = (a - mu) / sd, zB = b != null ? (b - mu) / sd : null;
    const rA = S.zRound(zA), rB = zB != null ? S.zRound(zB) : null;
    const tA = S.tableArea(zA), tB = zB != null ? S.tableArea(zB) : null;
    const eA = S.pnorm(zA), eB = zB != null ? S.pnorm(zB) : null;
    const zLine = (x, z, r, name) => {
      const raw = S.fmt(z, 4).replace("−", "-"), rr = r.toFixed(2);
      return `${name} = \\dfrac{${tx(x)} - ${tx(mu)}}{${tx(sd)}} = ${Math.abs(z - r) > 5e-5 ? raw + "\\approx " + rr : rr}`;
    };
    let tab, exact, sym, steps = [], shade, mistakes = [], lo, hi, xlF;
    const f = x => S.fmt(x, 4);
    if (type === "lt") {
      tab = tA; exact = eA; sym = `P(${v} < ${tx(a)})`; shade = [[-1e9, a]]; lo = "-E99"; hi = tx(a);
      steps.push(`Standardize: \\(${zLine(a, zA, rA, "z")}\\).`);
      steps.push(`Table, row ${rA.toFixed(2).slice(0, -1)}, column .0${rA.toFixed(2).slice(-1)}: \\(P(Z < ${rA.toFixed(2)}) = ${f(tA)}\\). That is the answer.`);
      mistakes = [{ value: 1 - tA, msg: "That is the area to the right. For 'less than,' the table value itself is the answer." }];
      xlF = `=NORM.DIST(${tx(a)},${tx(mu)},${tx(sd)},TRUE)`;
    } else if (type === "gt") {
      tab = 1 - tA; exact = 1 - eA; sym = `P(${v} > ${tx(a)})`; shade = [[a, 1e9]]; lo = tx(a); hi = "E99";
      steps.push(`Standardize: \\(${zLine(a, zA, rA, "z")}\\).`);
      steps.push(`Table: \\(P(Z < ${rA.toFixed(2)}) = ${f(tA)}\\).`);
      steps.push(`The table gives the left area; you want the right: \\(${sym} = 1 - ${f(tA)} = ${f(tab)}\\).`);
      mistakes = [{ value: tA, msg: "That is the area to the left. For 'greater than,' subtract the table value from 1." }];
      xlF = `=1-NORM.DIST(${tx(a)},${tx(mu)},${tx(sd)},TRUE)`;
    } else if (type === "bt") {
      tab = tB - tA; exact = eB - eA; sym = `P(${tx(a)} < ${v} < ${tx(b)})`; shade = [[a, b]]; lo = tx(a); hi = tx(b);
      steps.push(`Standardize both ends: \\(${zLine(a, zA, rA, "z_1")}\\) and \\(${zLine(b, zB, rB, "z_2")}\\).`);
      steps.push(`Table: \\(P(Z < ${rB.toFixed(2)}) = ${f(tB)}\\) and \\(P(Z < ${rA.toFixed(2)}) = ${f(tA)}\\).`);
      steps.push(`Between = bigger left area minus smaller left area: \\(${f(tB)} - ${f(tA)} = ${f(tab)}\\).`);
      mistakes = [{ value: 1 - tab, msg: "That is the area outside the interval. 'Between' is \\(P(Z<z_2) - P(Z<z_1)\\)." },
                  { value: tA + tB, msg: "Subtract the two left areas instead of adding them." }];
      xlF = `=NORM.DIST(${tx(b)},${tx(mu)},${tx(sd)},TRUE)-NORM.DIST(${tx(a)},${tx(mu)},${tx(sd)},TRUE)`;
    } else {
      tab = tA + (1 - tB); exact = eA + (1 - eB); sym = `P(${v} < ${tx(a)} \\text{ or } ${v} > ${tx(b)})`; shade = [[-1e9, a], [b, 1e9]]; lo = null; hi = null;
      steps.push(`Standardize both ends: \\(${zLine(a, zA, rA, "z_1")}\\) and \\(${zLine(b, zB, rB, "z_2")}\\).`);
      steps.push(`Left tail: \\(P(Z < ${rA.toFixed(2)}) = ${f(tA)}\\). Right tail: \\(1 - P(Z < ${rB.toFixed(2)}) = 1 - ${f(tB)} = ${f(1 - tB)}\\).`);
      steps.push(`Add the two tails: \\(${f(tA)} + ${f(1 - tB)} = ${f(tab)}\\).`);
      mistakes = [{ value: tB - tA, msg: "That is the area between. 'Outside' adds the two tails, which is 1 minus the area between." }];
      xlF = `=NORM.DIST(${tx(a)},${tx(mu)},${tx(sd)},TRUE)+1-NORM.DIST(${tx(b)},${tx(mu)},${tx(sd)},TRUE)`;
    }
    const tiLine = type === "out"
      ? HandUI.screen(`normalcdf(-E99,${tx(a)},${tx(mu)},${tx(sd)})+normalcdf(${tx(b)},E99,${tx(mu)},${tx(sd)})`)
      : HandUI.screen(`normalcdf(${lo},${hi},${tx(mu)},${tx(sd)})`);
    const ti = `${HandUI.keys("[2nd] [VARS] {2:normalcdf(}")}<br>${tiLine} = ${f(exact)}`;
    const excel = HandUI.xl(xlF, f(exact));
    const showSoft = Math.abs(tab - exact) >= 0.00005;
    const after = showSoft ? `Software gives ${f(exact)}. The small difference comes from rounding \\(z\\) to two decimals; both answers are accepted.` : "";
    const figure = HandUI.normalFig(mu, sd, shade.map(s => [Math.max(s[0], mu - 4 * sd), Math.min(s[1], mu + 4 * sd)]));
    return { tab, exact, sym, steps, mistakes, ti, excel, after, figure, zA: rA, zB: rB };
  }

  // Inverse normal by hand: left area → z from the table → value.
  function inverseNormal(o) {
    const { mu, sd, left } = o;
    const zT = S.tableZ(left), zE = S.qnorm(left);
    const xT = mu + zT * sd, xE = mu + zE * sd;
    const closest = Math.round(S.pnorm(zT) * 10000) / 10000;
    const tie = Math.abs(zT * 100 - Math.round(zT * 100)) > 1e-6;
    return {
      zT, zE, xT, xE,
      steps: [
        `Search the inside of the table for the area closest to ${S.fmt(left, 4)}: ${tie ? `it sits halfway between two entries, so use \\(z = ${zT.toFixed(3)}\\)` : `${S.fmt(closest, 4)} gives \\(z = ${zT.toFixed(2)}\\)`}.`,
        `Unstandardize: \\(x = \\mu + z\\sigma = ${tx(mu)} + (${tx(zT, 3)})(${tx(sd)}) = ${S.fmt(xT, 4).replace("−", "-")}\\).`
      ],
      ti: `${HandUI.keys("[2nd] [VARS] {3:invNorm(}")}<br>${HandUI.screen(`invNorm(${tx(left, 4)},${tx(mu)},${tx(sd)})`)} = ${S.fmt(xE, 4)}`,
      excel: HandUI.xl(`=NORM.INV(${tx(left, 4)},${tx(mu)},${tx(sd)})`, S.fmt(xE, 4))
    };
  }

  root.HandUI = { keys, screen, xl, methods, curve, normalFig, zFig, tFig, renderMath() {} };
  root.HandSets = root.HandSets || {};
  root.HandKit = { R, normalProb, inverseNormal, tx,
    mount(sel, cfg) { root.HandSets[cfg.module] = cfg.skills; } };
})(globalThis);
