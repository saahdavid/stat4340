/* Module 4 practice (multi-step): Continuous Random Variables. ti slot = R check, excel slot = Python check. */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const f4 = x => S.fmt(x, 4), n = (x, d = 4) => S.num(x, d).replace("−", "-");
  const code = s => `<code>${s.replace(/</g, "&lt;")}</code>`;
  const P = (label, answer, mistakes = [], tol = 0.0006) => ({ type: "num", label, answer, tol, show: f4(answer), mistakes });
  const Num = (label, answer, mistakes = [], d = 4) => ({ type: "num", label, answer, tol: Math.max(0.0006, Math.abs(answer) * 0.0005), show: S.num(answer, d), mistakes });
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const frac = (p, q) => { const g = gcd(p, q); return q / g === 1 ? `${p / g}` : `\\frac{${p / g}}{${q / g}}`; };

  // power density f(x) = c x^k on [0, b]
  function power() {
    const k = R.int(1, 3), b = R.pick([1, 2, 2, 3]), c = (k + 1) / b ** (k + 1);
    return { k, b, c, cR: `${k + 1}/${b ** (k + 1)}`, cTex: frac(k + 1, b ** (k + 1)), F: x => (x / b) ** (k + 1), fTex: `c\\,x${k > 1 ? `^${k}` : ""}` };
  }
  const CTX1 = ["X = the proportion of a shift a machine is busy", "X = the fraction of a chip covered by a coating", "X = the proportion of a tank that is full"], CTXB = ["X = the time (hours) to finish a repair", "X = the depth (cm) of a defect in a beam", "X = the delay (seconds) of a network packet"];
  const ctxFor = b => R.pick(b === 1 ? CTX1 : CTXB);

  function pdfprob() {
    const d = power(), a1 = R.step(0.1 * d.b, 0.5 * d.b, 0.1 * d.b), a2 = R.step(a1 + 0.1 * d.b, 0.9 * d.b, 0.1 * d.b), g = R.step(0.2 * d.b, 0.8 * d.b, 0.1 * d.b);
    const pr = d.F(a2) - d.F(a1), gt = 1 - d.F(g);
    return {
      prompt: T`<p>${ctxFor(d.b)}. Its density is \(f(x) = ${d.fTex}\) for \(0 \le x \le ${d.b}\) and 0 otherwise.</p><p>Find \(c\), \(P(${n(a1)} \le X \le ${n(a2)})\), and \(P(X > ${n(g)})\).</p>`,
      parts: [
        Num(T`\(c\)`, d.c, [{ value: d.b ** (d.k + 1) / (d.k + 1), msg: "Set the total area equal to 1 and solve for c: \\(c = 1/\\int_0^b x^k\\,dx\\)." }, { value: 1 / d.b, msg: "That is the constant for a flat (uniform) density. Integrate \\(x^k\\)." }]),
        P(T`\(P(${n(a1)}\le X\le ${n(a2)})\)`, pr, [{ value: d.c * a2 ** d.k - d.c * a1 ** d.k, msg: "That subtracts density heights. Probability is area: subtract CDF values \\(F(b) - F(a)\\)." }, { value: d.F(a2), msg: "Subtract \\(F(" + n(a1) + ")\\), the area to the left of the lower end." }]),
        P(T`\(P(X > ${n(g)})\)`, gt, [{ value: d.F(g), msg: "That is \\(P(X\\le " + n(g) + ")\\). Take the complement." }])
      ],
      hand: [
        T`\(\int_0^{${d.b}} c\,x^{${d.k}}\,dx = c\,\frac{${d.b}^{${d.k + 1}}}{${d.k + 1}} = 1\), so \(c = ${d.cTex} = ${n(d.c)}\).`,
        T`CDF on \([0, ${d.b}]\): \(F(x) = \left(\frac{x}{${d.b}}\right)^{${d.k + 1}}\).`,
        T`\(P = F(${n(a2)}) - F(${n(a1)}) = ${f4(d.F(a2))} - ${f4(d.F(a1))} = ${f4(pr)}\).`,
        T`\(P(X > ${n(g)}) = 1 - F(${n(g)}) = 1 - ${f4(d.F(g))} = ${f4(gt)}\).`
      ],
      ti: code(`f <- function(x) ${d.cR}*x^${d.k}; integrate(f, ${n(a1)}, ${n(a2)})$value; integrate(f, ${n(g)}, ${d.b})$value`),
      excel: code(`from scipy.integrate import quad; f = lambda x: ${d.cR}*x**${d.k}; quad(f, ${n(a1)}, ${n(a2)})[0], quad(f, ${n(g)}, ${d.b})[0]`)
    };
  }

  function percentile() {
    const d = power(), p = R.pick([0.1, 0.2, 0.25, 0.75, 0.8, 0.9, 0.95]), eta = d.b * p ** (1 / (d.k + 1)), med = d.b * 0.5 ** (1 / (d.k + 1));
    return {
      prompt: T`<p>X has density \(f(x) = ${d.cTex}\,x${d.k > 1 ? `^${d.k}` : ""}\) for \(0 \le x \le ${d.b}\). Find the median and the ${Math.round(p * 100)}th percentile.</p>`,
      parts: [
        Num(T`Median \(\tilde\mu\)`, med, [{ value: d.b / 2, msg: "The midpoint of the support is the median only for a symmetric density. Solve \\(F(\\tilde\\mu) = 0.5\\)." }]),
        Num(T`\(\eta(${p})\)`, eta, [{ value: p * d.b, msg: "Solve \\(F(\\eta) = p\\); the CDF is not linear here." }, { value: d.b * (1 - p) ** (1 / (d.k + 1)), msg: "Percentiles use the area to the <em>left</em>: \\(F(\\eta) = p\\), not \\(1-p\\)." }])
      ],
      hand: [
        T`CDF: \(F(x) = (x/${d.b})^{${d.k + 1}}\) for \(0\le x\le ${d.b}\).`,
        T`Median: \((\tilde\mu/${d.b})^{${d.k + 1}} = 0.5\), so \(\tilde\mu = ${d.b}(0.5)^{1/${d.k + 1}} = ${n(med)}\).`,
        T`\(${Math.round(p * 100)}\)th percentile: \((\eta/${d.b})^{${d.k + 1}} = ${p}\), so \(\eta = ${d.b}(${p})^{1/${d.k + 1}} = ${n(eta)}\).`
      ],
      ti: code(`F <- function(x) (x/${d.b})^${d.k + 1}; uniroot(function(x) F(x) - ${p}, c(0, ${d.b}))$root`),
      excel: code(`from scipy.optimize import brentq; brentq(lambda x: (x/${d.b})**${d.k + 1} - ${p}, 0, ${d.b})`)
    };
  }

  function moments() {
    const d = power(), mu = (d.k + 1) * d.b / (d.k + 2), ex2 = (d.k + 1) * d.b * d.b / (d.k + 3), v = ex2 - mu * mu;
    return {
      prompt: T`<p>X has density \(f(x) = ${d.cTex}\,x${d.k > 1 ? `^${d.k}` : ""}\) for \(0 \le x \le ${d.b}\). Find the mean, \(E(X^2)\), the variance, and the standard deviation.</p>`,
      parts: [
        Num(T`\(E(X)\)`, mu, [{ value: d.b / 2, msg: "Integrate \\(x f(x)\\); the density is not flat." }]),
        Num(T`\(E(X^2)\)`, ex2, [{ value: mu * mu, msg: "That is \\([E(X)]^2\\). Integrate \\(x^2 f(x)\\)." }]),
        Num(T`\(\text{Var}(X)\)`, v, [{ value: ex2, msg: "Subtract \\(\\mu^2\\)." }]),
        Num(T`\(\sigma_X\)`, Math.sqrt(v), [{ value: v, msg: "Take the square root of the variance." }])
      ],
      hand: [
        T`\(E(X) = \int_0^{${d.b}} x\cdot ${d.cTex}x^{${d.k}}\,dx = ${d.cTex}\cdot\frac{${d.b}^{${d.k + 2}}}{${d.k + 2}} = ${n(mu)}\).`,
        T`\(E(X^2) = \int_0^{${d.b}} x^2\cdot ${d.cTex}x^{${d.k}}\,dx = ${d.cTex}\cdot\frac{${d.b}^{${d.k + 3}}}{${d.k + 3}} = ${n(ex2)}\).`,
        T`\(\text{Var}(X) = ${n(ex2)} - ${n(mu)}^2 = ${n(v)}\), so \(\sigma_X = ${n(Math.sqrt(v))}\).`
      ],
      ti: code(`f <- function(x) ${d.cR}*x^${d.k}; m <- integrate(function(x) x*f(x), 0, ${d.b})$value; v <- integrate(function(x) x^2*f(x), 0, ${d.b})$value - m^2; c(m, v, sqrt(v))`),
      excel: code(`from scipy.integrate import quad; f = lambda x: ${d.cR}*x**${d.k}; m = quad(lambda x: x*f(x), 0, ${d.b})[0]; v = quad(lambda x: x*x*f(x), 0, ${d.b})[0] - m**2; m, v, v**0.5`)
    };
  }

  function uniform() {
    const A = R.int(0, 40), B = A + R.pick([10, 20, 25, 40, 50, 100]), a = R.int(A + 1, A + Math.floor((B - A) / 2)), b = R.int(a + 1, B - 1);
    const ctx = R.pick([["pipeline break location", "miles from the origin"], ["arrival time of a shuttle", "minutes after 8:00"], ["position of a flaw on a rod", "cm from one end"]]);
    const h = 1 / (B - A), pr = (b - a) / (B - A), mu = (A + B) / 2, v = (B - A) ** 2 / 12;
    return {
      prompt: T`<p>The ${ctx[0]}, X (${ctx[1]}), is uniform on \([${A}, ${B}]\).</p>`,
      parts: [
        Num(T`Height of the density \(f(x)\)`, h, [{ value: B - A, msg: "The height is 1 over the width, so the area is 1." }]),
        P(T`\(P(${a} < X < ${b})\)`, pr, [{ value: (b - a) / B, msg: "Divide by the width B − A, not by B." }]),
        Num(T`\(E(X)\)`, mu, [{ value: (B - A) / 2, msg: "The mean is the midpoint \\((A+B)/2\\)." }]),
        Num(T`\(\text{Var}(X)\)`, v, [{ value: (B - A) ** 2 / 2, msg: "Divide \\((B-A)^2\\) by 12." }, { value: (B - A) / Math.sqrt(12), msg: "That is the SD. The variance is \\((B-A)^2/12\\)." }])
      ],
      hand: [T`\(f(x) = \frac{1}{${B}-${A}} = ${n(h, 5)}\) on \([${A}, ${B}]\).`, T`\(P(${a}<X<${b}) = \frac{${b}-${a}}{${B - A}} = ${f4(pr)}\) (width times height).`, T`\(E(X) = \frac{${A}+${B}}{2} = ${n(mu)}\); \(\text{Var}(X) = \frac{(${B - A})^2}{12} = ${n(v)}\).`],
      ti: code(`punif(${b}, ${A}, ${B}) - punif(${a}, ${A}, ${B}); (${A} + ${B})/2; (${B} - ${A})^2/12`),
      excel: code(`from scipy.stats import uniform; U = uniform(${A}, ${B - A}); U.cdf(${b}) - U.cdf(${a}), U.mean(), U.var()`)
    };
  }

  const NCTX = [
    { what: "three-toed sloth weights", unit: "kg", mu: () => 4, sd: () => R.pick([0.5, 0.6, 0.7]), d: 1 },
    { what: "tensile strengths of a steel alloy", unit: "MPa", mu: () => R.int(480, 520), sd: () => R.int(10, 25), d: 0 },
    { what: "battery lifetimes", unit: "hours", mu: () => R.int(40, 60), sd: () => R.int(3, 8), d: 0 },
    { what: "resistor values", unit: "ohms", mu: () => 100, sd: () => R.pick([1.5, 2, 2.5]), d: 1 }
  ];
  function normal() {
    const c = R.pick(NCTX), mu = c.mu(), sd = c.sd(), type = R.pick(["lt", "gt", "bt", "bt"]);
    const r = v => Math.round(v * 10 ** c.d) / 10 ** c.d;
    let a = r(mu + R.pick([-1, 1]) * R.int(3, 18) / 10 * sd), b = null;
    if (type === "bt") { a = r(mu - R.int(2, 15) / 10 * sd); b = r(mu + R.int(2, 15) / 10 * sd); }
    const o = HandKit.normalProb({ mu, sd, type, a, b });
    const zParts = [Num(T`\(z${b != null ? "_1" : ""}\) (2 decimals)`, o.zA, [{ value: Math.round((a - mu) / (sd * sd) * 100) / 100, msg: "Divide by σ, not σ²." }], 2)];
    if (b != null) zParts.push(Num(T`\(z_2\) (2 decimals)`, o.zB, [], 2));
    return {
      prompt: T`<p>The ${c.what} are normal with \(\mu = ${mu}\) ${c.unit} and \(\sigma = ${sd}\) ${c.unit}. Find \(${o.sym}\). Round z to two decimals and use the table.</p>`,
      parts: [...zParts, { type: "num", label: T`\(${o.sym}\)`, answer: o.tab, tol: 0.0006, alts: [o.exact], show: f4(o.tab), mistakes: o.mistakes }],
      hand: o.steps, figure: o.figure, after: o.after, ti: o.ti, excel: o.excel
    };
  }

  function inverse() {
    const c = R.pick(NCTX), mu = c.mu(), sd = c.sd(), pct = R.pick([5, 10, 20, 25, 75, 80, 90, 95, 99]), upper = R.coin(0.35) && pct > 50;
    const left = upper ? pct / 100 : pct / 100, o = HandKit.inverseNormal({ mu, sd, left });
    const ask = upper ? `the value that the top ${100 - pct}% exceed` : `the ${pct}th percentile`;
    return {
      prompt: T`<p>The ${c.what} are normal with \(\mu = ${mu}\) ${c.unit} and \(\sigma = ${sd}\) ${c.unit}. Find ${ask}.</p>`,
      parts: [
        Num(T`\(z\) from the table`, o.zT, [{ value: -o.zT, msg: "Check the side: a left area above 0.5 needs a positive z." }], 3),
        { type: "num", label: "Value \\(x\\)", answer: o.xT, tol: Math.max(0.01, Math.abs(o.xT) * 0.0005), alts: [o.xE], show: S.num(o.xT, 3), mistakes: [{ value: mu - o.zT * sd, msg: "Use \\(x = \\mu + z\\sigma\\) with the sign of z." }] }
      ],
      hand: [upper ? `The top ${100 - pct}% lie above the value, so the left area is ${pct / 100}.` : `The ${pct}th percentile has left area ${pct / 100}.`, ...o.steps],
      ti: o.ti, excel: o.excel
    };
  }

  function exponential() {
    const lam = R.pick([0.1, 0.2, 0.25, 0.5, 0.05]), mean = 1 / lam, a = R.int(1, Math.round(1.5 * mean)), b = a + R.int(1, Math.round(mean)), s = R.int(2, Math.round(mean)), t = R.int(1, Math.round(mean));
    const ctx = R.pick(["time (hours) until a machine fails", "lifetime (years) of a component", "time (minutes) between server requests"]);
    return {
      prompt: T`<p>The ${ctx} is \(X\sim\text{Exp}(\lambda = ${lam})\).</p>`,
      parts: [
        P(T`\(P(X > ${a})\)`, Math.exp(-lam * a), [{ value: 1 - Math.exp(-lam * a), msg: "That is \\(P(X\\le " + a + ")\\). For more than, use \\(e^{-\\lambda x}\\)." }, { value: Math.exp(-a / lam), msg: "Multiply λ by x: \\(e^{-\\lambda x}\\), not \\(e^{-x/\\lambda}\\)." }]),
        P(T`\(P(${a} < X < ${b})\)`, Math.exp(-lam * a) - Math.exp(-lam * b), [{ value: Math.exp(-lam * (b - a)), msg: "Use \\(F(b) - F(a) = e^{-\\lambda a} - e^{-\\lambda b}\\)." }]),
        P(T`\(P(X > ${s + t} \mid X > ${s})\)`, Math.exp(-lam * t), [{ value: Math.exp(-lam * (s + t)), msg: "Condition on surviving to " + s + ": by memorylessness this equals \\(P(X > " + t + ")\\)." }]),
        Num(T`\(E(X)\)`, mean, [{ value: lam, msg: "The mean is \\(1/\\lambda\\)." }])
      ],
      hand: [
        T`\(P(X > ${a}) = e^{-${lam}(${a})} = ${f4(Math.exp(-lam * a))}\).`,
        T`\(P(${a}<X<${b}) = e^{-${lam}(${a})} - e^{-${lam}(${b})} = ${f4(Math.exp(-lam * a))} - ${f4(Math.exp(-lam * b))} = ${f4(Math.exp(-lam * a) - Math.exp(-lam * b))}\).`,
        T`Memoryless: \(P(X>${s + t}\mid X>${s}) = P(X > ${t}) = e^{-${lam}(${t})} = ${f4(Math.exp(-lam * t))}\).`,
        T`\(E(X) = 1/${lam} = ${n(mean)}\).`
      ],
      ti: code(`1 - pexp(${a}, ${lam}); pexp(${b}, ${lam}) - pexp(${a}, ${lam}); 1 - pexp(${t}, ${lam})`),
      excel: code(`from scipy.stats import expon; X = expon(scale=1/${lam}); X.sf(${a}), X.cdf(${b}) - X.cdf(${a}), X.sf(${t})`)
    };
  }

  function gamma() {
    const k = R.int(3, 7), half = R.pick([3, 5, 7]), al = R.pick([2, 3, 4, 1.5, 2.5]), be = R.pick([2, 3, 0.5, 4]);
    const gh = { 3: 0.5 * Math.sqrt(Math.PI), 5: 0.75 * Math.sqrt(Math.PI), 7: 1.875 * Math.sqrt(Math.PI) }[half];
    const fact = m => { let r = 1; for (let i = 2; i <= m; i++) r *= i; return r; };
    const chain = { 3: T`\tfrac12\sqrt\pi`, 5: T`\tfrac32\cdot\tfrac12\sqrt\pi`, 7: T`\tfrac52\cdot\tfrac32\cdot\tfrac12\sqrt\pi` }[half];
    return {
      prompt: T`<p>Use the properties of the gamma function, and let \(X\sim G(\alpha = ${al}, \beta = ${be})\).</p>`,
      parts: [
        Num(T`\(\Gamma(${k})\)`, fact(k - 1), [{ value: fact(k), msg: `\\(\\Gamma(n) = (n-1)!\\), so \\(\\Gamma(${k}) = ${k - 1}!\\).` }], 0),
        Num(T`\(\Gamma(${half}/2)\)`, gh, [{ value: Math.sqrt(Math.PI), msg: "Apply \\(\\Gamma(\\alpha) = (\\alpha-1)\\Gamma(\\alpha-1)\\) down to \\(\\Gamma(1/2) = \\sqrt\\pi\\)." }]),
        Num(T`\(E(X)\)`, al * be, [{ value: al / be, msg: "With scale β, \\(E(X) = \\alpha\\beta\\)." }]),
        Num(T`\(\text{Var}(X)\)`, al * be * be, [{ value: al * be, msg: "That is the mean. The variance is \\(\\alpha\\beta^2\\)." }, { value: al * al * be, msg: "Square β, not α: \\(\\alpha\\beta^2\\)." }])
      ],
      hand: [T`\(\Gamma(${k}) = (${k}-1)! = ${fact(k - 1)}\).`, T`\(\Gamma(\tfrac{${half}}{2}) = ${chain} = ${n(gh)}\).`, T`\(E(X) = \alpha\beta = ${al}(${be}) = ${n(al * be)}\); \(\text{Var}(X) = \alpha\beta^2 = ${al}(${be})^2 = ${n(al * be * be)}\).`],
      ti: code(`gamma(${k}); gamma(${half}/2); ${al}*${be}; ${al}*${be}^2`),
      excel: code(`from math import gamma; gamma(${k}), gamma(${half}/2), ${al}*${be}, ${al}*${be}**2`)
    };
  }

  HandKit.mount("#practice-app", {
    module: 4,
    skills: [
      { id: "m4-pdfprob", title: "PDFs, constants, and probabilities", gen: pdfprob },
      { id: "m4-pct", title: "Percentiles and the median", gen: percentile },
      { id: "m4-mom", title: "Mean and variance from a PDF", gen: moments },
      { id: "m4-unif", title: "Uniform distribution", gen: uniform },
      { id: "m4-norm", title: "Normal probabilities", gen: normal },
      { id: "m4-inv", title: "Inverse normal", gen: inverse },
      { id: "m4-exp", title: "Exponential and memorylessness", gen: exponential },
      { id: "m4-gam", title: "Gamma function and distribution", gen: gamma }
    ]
  });
})();
