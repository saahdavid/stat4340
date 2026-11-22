/* Ported from stat4340-learn: multi-step, hand-first questions with mistake diagnosis. */
/* STAT 4340 — numerical core.
   Normal, t, and binomial distributions plus small helpers.
   No dependencies; works in the browser (window.Stats) and in Node (module.exports). */
(function (root) {
  "use strict";

  // ---------- Normal ----------
  // Marsaglia (2004) series: accurate to ~1e-15 for |x| < 8.
  function pnorm(x) {
    if (x < -8) return 0;
    if (x > 8) return 1;
    let s = x, t = 0, b = x, q = x * x, i = 1;
    while (s !== t) { t = s; i += 2; b *= q / i; s = t + b; }
    return 0.5 + s * Math.exp(-0.5 * q - 0.91893853320467274178);
  }
  function dnorm(x, mu = 0, sigma = 1) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  }
  // Acklam's algorithm with one Halley refinement step.
  function qnorm(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
    const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
    const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425;
    let x;
    if (p < pl) {
      const q = Math.sqrt(-2 * Math.log(p));
      x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= 1 - pl) {
      const q = p - 0.5, r = q * q;
      x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    const e = pnorm(x) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }
  const normalcdf = (lo, hi, mu = 0, sigma = 1) =>
    pnorm((hi - mu) / sigma) - pnorm((lo - mu) / sigma);
  const invNorm = (p, mu = 0, sigma = 1) => mu + sigma * qnorm(p);

  // Standard Normal Table lookup, the way students do it on paper:
  // round z to two decimals, read the 4-decimal area to the left.
  function zRound(z) { return Math.round(z * 100 + 1e-9 * Math.sign(z)) / 100; }
  function tableArea(z) {
    const zr = zRound(z);
    if (zr < -3.49) return 0.0000;
    if (zr > 3.49) return 1.0000;
    return Math.round(pnorm(zr) * 10000) / 10000;
  }
  // Inverse lookup: closest area inside the table → z (two decimals).
  function tableZ(area) {
    // When the area sits exactly halfway between two entries (e.g. 0.95), use the midpoint (1.645).
    let best = [], bestDiff = Infinity;
    for (let k = -349; k <= 349; k++) {
      const z = k / 100, a = Math.round(pnorm(z) * 10000) / 10000;
      const diff = Math.abs(a - area);
      if (diff < bestDiff - 1e-12) { bestDiff = diff; best = [z]; }
      else if (Math.abs(diff - bestDiff) <= 1e-12) best.push(z);
    }
    return Math.round(best.reduce((s, v) => s + v, 0) / best.length * 1000) / 1000;
  }

  // ---------- Gamma / Beta ----------
  function lgamma(x) {
    const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += g[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function betacf(a, b, x) {
    const MAXIT = 300, EPS = 3e-16, FPMIN = 1e-300;
    let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  function ibeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }

  // ---------- Student t ----------
  function pt(t, df) {
    // Upper tail P(T > |t|). For small |t| use the complementary form to keep precision near 0.
    const t2 = t * t;
    const tail = t2 < df
      ? 0.5 * (1 - ibeta(t2 / (df + t2), 0.5, df / 2))
      : 0.5 * ibeta(df / (df + t2), df / 2, 0.5);
    return t >= 0 ? 1 - tail : tail;
  }
  function dt(t, df) {
    return Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log(1 + t * t / df));
  }
  function qt(p, df) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    let lo = -1e4, hi = 1e4;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (pt(mid, df) < p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  const tcdf = (lo, hi, df) => pt(hi, df) - pt(lo, df);

  // STAT 4340 t table: upper-tail areas; exact df = n - 1 for rows 1-40 (t is used only when n <= 40).
  const T_TAIL = [0.10, 0.05, 0.025, 0.01, 0.005, 0.001, 0.0005];
  const T_DF = Array.from({ length: 40 }, (_, i) => i + 1);
  const tTableValue = (df, tail) => Math.round(qt(1 - tail, df) * 1000) / 1000;
  // Row of the table for a given df: the exact df (the course uses df = n - 1 with n <= 40).
  function tTableRow(df) { return Math.max(1, Math.min(40, Math.floor(df))); }

  // ---------- Binomial ----------
  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r) === r || r > 1e15 ? r : Math.round(r);
  }
  const fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  const binompdf = (n, p, k) => choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  function binomcdf(n, p, k) {
    let s = 0;
    for (let i = 0; i <= Math.min(k, n); i++) s += binompdf(n, p, i);
    return Math.min(1, s);
  }

  // ---------- Descriptive statistics (course conventions) ----------
  const sum = a => a.reduce((s, v) => s + v, 0);
  const mean = a => sum(a) / a.length;
  const sorted = a => a.slice().sort((x, y) => x - y);
  function median(a) {
    const s = sorted(a), n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  const variance = a => { const m = mean(a); return sum(a.map(v => (v - m) ** 2)) / (a.length - 1); };
  const sd = a => Math.sqrt(variance(a));
  // Quartiles by the "median of each half" method (median excluded when n is odd) — same as the TI-84.
  function quartiles(a) {
    const s = sorted(a), n = s.length, h = Math.floor(n / 2);
    const lower = s.slice(0, h), upper = s.slice(n % 2 ? h + 1 : h);
    return { min: s[0], q1: median(lower), med: median(s), q3: median(upper), max: s[n - 1], lower, upper, sorted: s };
  }
  function correlation(x, y) {
    const mx = mean(x), my = mean(y), sx = sd(x), sy = sd(y);
    let s = 0;
    for (let i = 0; i < x.length; i++) s += ((x[i] - mx) / sx) * ((y[i] - my) / sy);
    return s / (x.length - 1);
  }

  // ---------- Formatting ----------
  function round(x, d = 4) { const f = Math.pow(10, d); return Math.round((x + Math.sign(x) * 1e-12) * f) / f; }
  function fmt(x, d = 4) {
    if (!isFinite(x)) return x > 0 ? "∞" : "−∞";
    const r = round(x, d);
    const s = r.toFixed(d);
    return (r < 0 ? "−" + s.slice(1) : s);
  }
  // Trim trailing zeros (for data values and "nice" numbers).
  function num(x, d = 4) {
    const r = round(x, d);
    let s = String(r);
    if (s.includes("e")) s = r.toFixed(d);
    return r < 0 ? "−" + s.slice(1) : s;
  }

  const api = {
    pnorm, dnorm, qnorm, normalcdf, invNorm, zRound, tableArea, tableZ,
    lgamma, ibeta, pt, dt, qt, tcdf, T_TAIL, T_DF, tTableValue, tTableRow,
    choose, fact, binompdf, binomcdf,
    sum, mean, sorted, median, variance, sd, quartiles, correlation,
    round, fmt, num
  };
  root.HandStats = api;
})(typeof window !== "undefined" ? window : globalThis);
