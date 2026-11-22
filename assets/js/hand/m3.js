/* Module 3 practice (multi-step): Discrete Random Variables. ti slot = R check, excel slot = Python check. */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const f4 = x => S.fmt(x, 4), n = (x, d = 4) => S.num(x, d).replace("−", "-");
  const code = s => `<code>${s.replace(/</g, "&lt;")}</code>`;
  const P = (label, answer, mistakes = [], tol = 0.0006) => ({ type: "num", label, answer, tol, show: f4(answer), mistakes });
  const Num = (label, answer, mistakes = [], d = 4) => ({ type: "num", label, answer, tol: Math.max(0.0006, Math.abs(answer) * 0.0005), show: S.num(answer, d), mistakes });
  const C = (a, b) => { if (b < 0 || b > a) return 0; let r = 1; for (let i = 1; i <= b; i++) r = r * (a - b + i) / i; return Math.round(r); };
  const fact = k => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };
  const binom = (x, nn, p) => C(nn, x) * p ** x * (1 - p) ** (nn - x);
  const pois = (x, mu) => Math.exp(-mu) * mu ** x / fact(x);
  const sumP = a => a.reduce((s, v) => s + v, 0);

  // a random PMF on consecutive integers with probabilities in hundredths
  function randomPMF() {
    const start = R.pick([0, 0, 1]), k = R.int(4, 6), xs = Array.from({ length: k }, (_, i) => start + i);
    let w; do { w = xs.map(() => R.int(3, 30)); } while (sumP(w) > 100);
    const left = 100 - sumP(w); w[R.int(0, k - 1)] += left;
    return { xs, ps: w.map(v => v / 100) };
  }
  const tableHtml = (xs, ps, mark) => `<div class="table-scroll"><table class="data"><thead><tr><th>\\(x\\)</th>${xs.map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody><tr><td>\\(p(x)\\)</td>${ps.map((p, i) => `<td>${i === mark ? "\\(k\\)" : n(p)}</td>`).join("")}</tr></tbody></table></div>`;
  const CTXS = ["X = number of defective parts in a box", "X = number of service calls in an hour", "X = number of AC units ordered in a week", "X = number of failed login attempts in a session", "X = number of cars waiting at a light"];

  function pmfcdf() {
    const { xs, ps } = randomPMF(), miss = R.int(0, xs.length - 1), kval = ps[miss];
    const a = xs[R.int(1, xs.length - 2)], Fa = sumP(ps.filter((_, i) => xs[i] <= a));
    const lo = xs[R.int(0, xs.length - 3)], hi = xs[R.int(xs.indexOf(lo) + 1, xs.length - 1)], pr = sumP(ps.filter((_, i) => xs[i] >= lo && xs[i] <= hi));
    return {
      prompt: `<p>${R.pick(CTXS)}. Its PMF is</p>${tableHtml(xs, ps, miss)}<p>Find \\(k\\), the CDF value \\(F(${a})\\), and \\(P(${lo} \\le X \\le ${hi})\\).</p>`,
      parts: [
        P(T`\(k\)`, kval, [{ value: 1 - kval, msg: "The probabilities must add to 1, so \\(k = 1 -\\) (sum of the others)." }]),
        P(T`\(F(${a}) = P(X\le ${a})\)`, Fa, [{ value: ps[xs.indexOf(a)], msg: "That is \\(P(X = " + a + ")\\) only. The CDF adds every value up to and including " + a + "." }, { value: Fa - ps[xs.indexOf(a)], msg: "Include \\(x = " + a + "\\) itself: the CDF uses \\(\\le\\)." }]),
        P(T`\(P(${lo}\le X\le ${hi})\)`, pr, [{ value: pr - ps[xs.indexOf(lo)], msg: `Both endpoints are included. \\(F(${hi}) - F(${lo}^-)\\) keeps \\(x = ${lo}\\).` }, { value: pr - ps[xs.indexOf(hi)], msg: `Include \\(x = ${hi}\\) as well.` }])
      ],
      hand: [
        T`\(k = 1 - (${ps.filter((_, i) => i !== miss).map(x => n(x)).join(" + ")}) = ${n(kval)}\).`,
        T`\(F(${a}) = ${ps.filter((_, i) => xs[i] <= a).map(x => n(x)).join(" + ")} = ${n(Fa)}\).`,
        T`\(P(${lo}\le X\le ${hi}) = F(${hi}) - F(${lo}^-) = ${ps.filter((_, i) => xs[i] >= lo && xs[i] <= hi).map(x => n(x)).join(" + ")} = ${n(pr)}\).`
      ],
      ti: code(`x <- ${xs[0]}:${xs[xs.length - 1]}; p <- c(${ps.map(v => n(v)).join(", ")}); sum(p[x <= ${a}]); sum(p[x >= ${lo} & x <= ${hi}])`),
      excel: code(`x = list(range(${xs[0]}, ${xs[xs.length - 1] + 1})); p = [${ps.map(v => n(v)).join(", ")}]; sum(q for v, q in zip(x, p) if v <= ${a})`)
    };
  }

  function mean() {
    const { xs, ps } = randomPMF(), mu = sumP(xs.map((x, i) => x * ps[i]));
    return {
      prompt: `<p>${R.pick(CTXS)}, with PMF</p>${tableHtml(xs, ps, -1)}<p>Find the expected value.</p>`,
      parts: [
        Num(T`\(E(X)\)`, mu, [{ value: S.mean(xs), msg: "That averages the values equally. Weight each value by its probability." }, { value: sumP(ps) / xs.length, msg: "Multiply each value by its probability, then add." }])
      ],
      hand: [T`\(E(X) = \sum x\,p(x) = ${xs.map((x, i) => `${x}(${n(ps[i])})`).join(" + ")}\).`, T`\(= ${xs.map((x, i) => n(x * ps[i])).join(" + ")} = ${n(mu)}\).`, "Interpretation: the long-run average value of X over many repetitions."],
      ti: code(`x <- ${xs[0]}:${xs[xs.length - 1]}; p <- c(${ps.map(v => n(v)).join(", ")}); sum(x * p)`),
      excel: code(`x = range(${xs[0]}, ${xs[xs.length - 1] + 1}); p = [${ps.map(v => n(v)).join(", ")}]; sum(a*b for a, b in zip(x, p))`)
    };
  }

  function func() {
    const k = R.int(3, 5), cost = R.pick([200, 300, 400, 500]), price = cost * R.pick([2, 2.5, 3]), back = R.pick([50, 80, 100]);
    let w; do { w = Array.from({ length: k + 1 }, () => R.int(5, 40)); } while (sumP(w) > 100);
    w[k] += 100 - sumP(w); const ps = w.map(v => v / 100), xs = Array.from({ length: k + 1 }, (_, i) => i);
    const a = price - back, b = back * k - cost * k, mu = sumP(xs.map((x, i) => x * ps[i])), eh = a * mu + b;
    return {
      prompt: `<p>A shop buys ${k} drones at $${cost} each and sells them at $${price} each. The supplier buys back any unsold drone for $${back}. X = number sold has PMF</p>${tableHtml(xs, ps, -1)}<p>The profit is \\(h(X) = ${price}X + ${back}(${k} - X) - ${cost * k}\\).</p>`,
      parts: [
        Num(T`Slope \(a\) in \(h(X) = aX + b\)`, a, [{ value: price, msg: `Collect the X terms: \\(${price}X - ${back}X\\).` }], 2),
        Num(T`Intercept \(b\)`, b, [{ value: -cost * k, msg: `Include the buy-back term: \\(${back}(${k}) = ${back * k}\\).` }], 2),
        Num(T`\(E(X)\)`, mu, [], 4),
        Num(T`Expected profit \(E[h(X)]\)`, eh, [{ value: price * mu - cost * k, msg: "You left out the buy-back income on unsold drones." }, { value: a * mu, msg: "Add the intercept b: \\(E(aX+b) = aE(X)+b\\)." }], 2)
      ],
      hand: [T`\(h(X) = ${price}X + ${back * k} - ${back}X - ${cost * k} = ${a}X ${b < 0 ? "-" : "+"} ${Math.abs(b)}\).`, T`\(E(X) = ${xs.map((x, i) => `${x}(${n(ps[i])})`).join(" + ")} = ${n(mu)}\).`, T`\(E[h(X)] = ${a}(${n(mu)}) ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${S.num(eh, 2)}\) dollars.`],
      ti: code(`x <- 0:${k}; p <- c(${ps.map(v => n(v)).join(", ")}); sum((${price}*x + ${back}*(${k} - x) - ${cost * k}) * p)`),
      excel: code(`p = [${ps.map(v => n(v)).join(", ")}]; sum((${price}*x + ${back}*(${k} - x) - ${cost * k})*q for x, q in enumerate(p))`)
    };
  }

  function variance() {
    const { xs, ps } = randomPMF(), mu = sumP(xs.map((x, i) => x * ps[i])), ex2 = sumP(xs.map((x, i) => x * x * ps[i])), v = ex2 - mu * mu, sd = Math.sqrt(v);
    const a = R.pick([2, 3, 5, 10, -2, -4]), b = R.int(-20, 40);
    return {
      prompt: `<p>${R.pick(CTXS)}, with PMF</p>${tableHtml(xs, ps, -1)}<p>Find \\(E(X^2)\\), \\(\\text{Var}(X)\\), \\(\\sigma_X\\), and the standard deviation of \\(Y = ${a}X ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\).</p>`,
      parts: [
        Num(T`\(E(X^2)\)`, ex2, [{ value: mu * mu, msg: "That is \\([E(X)]^2\\). \\(E(X^2)\\) squares each value first: \\(\\sum x^2p(x)\\)." }]),
        Num(T`\(\text{Var}(X)\)`, v, [{ value: ex2, msg: "Subtract \\(\\mu^2\\): \\(\\text{Var}(X) = E(X^2) - \\mu^2\\)." }, { value: ex2 - mu, msg: "Subtract \\(\\mu^2\\), not \\(\\mu\\)." }]),
        Num(T`\(\sigma_X\)`, sd, [{ value: v, msg: "That is the variance. Take its square root." }]),
        Num(T`\(\sigma_Y\)`, Math.abs(a) * sd, [{ value: a * a * sd, msg: "Use \\(|a|\\) for the standard deviation; \\(a^2\\) is for the variance." }, { value: Math.abs(a) * sd + b, msg: "Adding a constant does not change spread." }, { value: a * a * v, msg: "That is \\(\\text{Var}(Y)\\). Take the square root." }])
      ],
      hand: [
        T`\(\mu = \sum x\,p(x) = ${n(mu)}\).`,
        T`\(E(X^2) = ${xs.map((x, i) => `${x * x}(${n(ps[i])})`).join(" + ")} = ${n(ex2)}\).`,
        T`\(\text{Var}(X) = ${n(ex2)} - ${n(mu)}^2 = ${n(v)}\), so \(\sigma_X = ${n(sd)}\).`,
        T`\(\sigma_Y = |${a}|\,\sigma_X = ${Math.abs(a)}(${n(sd)}) = ${n(Math.abs(a) * sd)}\). The ${b < 0 ? "−" : "+"}${Math.abs(b)} shifts every value and does not change spread.`
      ],
      ti: code(`x <- ${xs[0]}:${xs[xs.length - 1]}; p <- c(${ps.map(v => n(v)).join(", ")}); mu <- sum(x*p); v <- sum(x^2*p) - mu^2; c(v, sqrt(v), abs(${a})*sqrt(v))`),
      excel: code(`x = range(${xs[0]}, ${xs[xs.length - 1] + 1}); p = [${ps.map(v => n(v)).join(", ")}]; mu = sum(a*b for a, b in zip(x, p)); v = sum(a*a*b for a, b in zip(x, p)) - mu**2; v, v**0.5`)
    };
  }

  const BCTX = [["a weld passes inspection", "welds"], ["a transaction is fraudulent", "transactions"], ["a chip is defective", "chips"], ["a customer redeems a coupon", "customers"], ["a sensor reading is out of range", "readings"]];
  function binomial() {
    const [ev, unit] = R.pick(BCTX), nn = R.int(6, 12), p = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]), k = R.int(1, Math.min(nn - 2, 5));
    const pk = binom(k, nn, p), cdf = sumP(Array.from({ length: k + 1 }, (_, i) => binom(i, nn, p))), strict = R.coin();
    const lt = strict ? cdf - pk : cdf;
    return {
      prompt: `<p>Each of ${nn} independent ${unit} has probability ${p} that ${ev}. Let X be the number for which ${ev}.</p>`,
      parts: [
        P(T`\(P(X = ${k})\)`, pk, [{ value: p ** k * (1 - p) ** (nn - k), msg: "Multiply by \\(\\binom{n}{x}\\): there are that many orders for the successes." }, { value: C(nn, k) * p ** k, msg: "Include the failures: \\((1-p)^{n-x}\\)." }]),
        P(strict ? T`\(P(X < ${k + 1})\)` : T`\(P(X \le ${k})\)`, cdf, [{ value: pk, msg: "That is a single term. Add every value from 0 up." }, { value: cdf - pk, msg: strict ? `"Less than ${k + 1}" includes ${k}.` : `"At most ${k}" includes ${k}.` }]),
        Num(T`\(E(X)\)`, nn * p, [], 4),
        Num(T`\(\text{Var}(X)\)`, nn * p * (1 - p), [{ value: Math.sqrt(nn * p * (1 - p)), msg: "That is the SD. The variance is \\(np(1-p)\\)." }, { value: nn * p, msg: "That is the mean. Multiply by \\(1-p\\)." }], 4)
      ],
      hand: [
        T`Fixed n = ${nn}, two outcomes, independent, constant p: \(X\sim\text{Bin}(${nn}, ${p})\).`,
        T`\(P(X=${k}) = \binom{${nn}}{${k}}(${p})^{${k}}(${n(1 - p)})^{${nn - k}} = ${C(nn, k)}(${n(p ** k, 6)})(${n((1 - p) ** (nn - k), 6)}) = ${f4(pk)}\).`,
        T`\(P(X\le ${k}) = ${Array.from({ length: k + 1 }, (_, i) => f4(binom(i, nn, p))).join(" + ")} = ${f4(cdf)}\).`,
        T`\(E(X) = np = ${n(nn * p)}\); \(\text{Var}(X) = np(1-p) = ${n(nn * p * (1 - p))}\).`
      ],
      ti: code(`dbinom(${k}, ${nn}, ${p}); pbinom(${k}, ${nn}, ${p})`),
      excel: code(`from scipy.stats import binom; binom.pmf(${k}, ${nn}, ${p}), binom.cdf(${k}, ${nn}, ${p})`)
    };
  }

  function hyper() {
    const N = R.int(15, 40), M = R.int(4, Math.floor(N / 2)), nn = R.int(3, 6), k = R.int(0, Math.min(2, nn, M));
    const h = x => C(M, x) * C(N - M, nn - x) / C(N, nn), pk = h(k), mu = nn * M / N, v = (N - nn) / (N - 1) * nn * M / N * (1 - M / N);
    const ctx = R.pick([[`${M} of ${N} tigers carry GPS collars`, "tigers are captured", "collared"], [`${M} of ${N} laptops in a lab are infected`, "laptops are checked", "infected"], [`a lot of ${N} bearings contains ${M} out-of-spec bearings`, "bearings are sampled without replacement", "out of spec"]]);
    return {
      prompt: `<p>Suppose ${ctx[0]}. ${nn} ${ctx[1]} at random. Let X be the number ${ctx[2]} in the sample.</p>`,
      parts: [
        P(T`\(P(X=${k})\)`, pk, [{ value: binom(k, nn, M / N), msg: "That treats the draws as independent (binomial). Without replacement use the hypergeometric PMF." }]),
        Num(T`\(E(X)\)`, mu),
        Num(T`\(\text{Var}(X)\)`, v, [{ value: nn * M / N * (1 - M / N), msg: "Multiply by the finite population correction \\((N-n)/(N-1)\\)." }])
      ],
      hand: [
        T`Sampling without replacement: \(X\sim\text{Hypergeo}(n=${nn}, M=${M}, N=${N})\).`,
        T`\(P(X=${k}) = \frac{\binom{${M}}{${k}}\binom{${N - M}}{${nn - k}}}{\binom{${N}}{${nn}}} = \frac{${C(M, k)}\cdot ${C(N - M, nn - k)}}{${C(N, nn)}} = ${f4(pk)}\).`,
        T`\(E(X) = ${nn}\cdot\frac{${M}}{${N}} = ${n(mu)}\).`,
        T`\(\text{Var}(X) = \frac{${N}-${nn}}{${N}-1}\cdot ${nn}\cdot\frac{${M}}{${N}}\left(1-\frac{${M}}{${N}}\right) = ${n(v)}\).`
      ],
      ti: code(`dhyper(${k}, m = ${M}, n = ${N - M}, k = ${nn})`),
      excel: code(`from scipy.stats import hypergeom; hypergeom.pmf(${k}, ${N}, ${M}, ${nn})`)
    };
  }

  function negbin() {
    const r = R.int(2, 6), p = R.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), x = R.int(1, 5), pr = C(x + r - 1, r - 1) * p ** r * (1 - p) ** x, mu = r * (1 - p) / p;
    const ctx = R.pick([["an engineering firm interviews candidates", "accepts an offer", "acceptances", "rejections"], ["a tester runs independent trials", "passes", "passes", "failures"], ["a recruiter calls players", "agrees to join", "agreements", "refusals"]]);
    return {
      prompt: `<p>${ctx[0][0].toUpperCase() + ctx[0].slice(1)}; each one independently ${ctx[1]} with probability ${p}. They stop after ${r} ${ctx[2]}. Let X be the number of ${ctx[3]} before the ${r}th success.</p><p>Find the probability that exactly ${x + r} are needed, and the expected number of ${ctx[3]}.</p>`,
      parts: [
        Num(T`Value of X when ${x + r} are needed`, x, [{ value: x + r, msg: "X counts failures only: total trials minus r." }], 0),
        P(T`\(P(X=${x})\)`, pr, [{ value: C(x + r, r) * p ** r * (1 - p) ** x, msg: "The last trial must be a success, so choose positions among the first \\(x+r-1\\): \\(\\binom{x+r-1}{r-1}\\)." }, { value: binom(r, x + r, p), msg: "Binomial allows the last trial to be a failure. Here the last trial is the rth success." }]),
        Num(T`\(E(X)\)`, mu, [{ value: r / p, msg: "That is the expected number of trials. Failures: \\(r(1-p)/p\\)." }])
      ],
      hand: [
        T`\(X\sim\text{NB}(r=${r}, p=${p})\). ${x + r} trials means ${r} successes and ${x} failures, so \(X = ${x}\).`,
        T`\(P(X=${x}) = \binom{${x}+${r}-1}{${r}-1}(${p})^{${r}}(${n(1 - p)})^{${x}} = ${C(x + r - 1, r - 1)}(${n(p ** r, 6)})(${n((1 - p) ** x, 6)}) = ${f4(pr)}\).`,
        T`\(E(X) = \frac{r(1-p)}{p} = \frac{${r}(${n(1 - p)})}{${p}} = ${n(mu)}\).`
      ],
      ti: code(`dnbinom(${x}, size = ${r}, prob = ${p}); ${r}*(1 - ${p})/${p}`),
      excel: code(`from scipy.stats import nbinom; nbinom.pmf(${x}, ${r}, ${p}), ${r}*(1 - ${p})/${p}`)
    };
  }

  function poisson() {
    if (R.coin()) {
      const mu = R.pick([0.8, 1.5, 2, 2.5, 3, 4]), k = R.int(1, 4), pk = pois(k, mu), cdf = sumP(Array.from({ length: k + 1 }, (_, i) => pois(i, mu)));
      const ctx = R.pick(["calls arrive at a help desk", "flaws appear per meter of cable", "requests hit a server per second", "misprints appear per page"]);
      return {
        prompt: `<p>The number of ${ctx.split(" ")[0]} ${ctx.split(" ").slice(1).join(" ")} follows a Poisson distribution with mean \\(\\mu = ${mu}\\).</p>`,
        parts: [
          P(T`\(P(X=${k})\)`, pk, [{ value: mu ** k / fact(k), msg: "Multiply by \\(e^{-\\mu}\\)." }, { value: Math.exp(-mu) * mu ** k, msg: `Divide by \\(${k}! = ${fact(k)}\\).` }]),
          P(T`\(P(X\le ${k})\)`, cdf, [{ value: pk, msg: "Add the terms from 0 to " + k + "." }]),
          P(T`\(P(X\ge 1)\)`, 1 - pois(0, mu), [{ value: pois(0, mu), msg: "That is P(X = 0). At least one is its complement." }])
        ],
        hand: [T`\(P(X=${k}) = \frac{e^{-${mu}}${mu}^{${k}}}{${k}!} = \frac{${n(Math.exp(-mu), 6)}\cdot ${n(mu ** k, 4)}}{${fact(k)}} = ${f4(pk)}\).`, T`\(P(X\le ${k}) = ${Array.from({ length: k + 1 }, (_, i) => f4(pois(i, mu))).join(" + ")} = ${f4(cdf)}\).`, T`\(P(X\ge 1) = 1 - e^{-${mu}} = ${f4(1 - pois(0, mu))}\).`],
        ti: code(`dpois(${k}, ${mu}); ppois(${k}, ${mu}); 1 - dpois(0, ${mu})`), excel: code(`from scipy.stats import poisson; poisson.pmf(${k}, ${mu}), poisson.cdf(${k}, ${mu}), 1 - poisson.pmf(0, ${mu})`)
      };
    }
    const ok = R.coin(0.6), nn = ok ? R.pick([100, 150, 200, 250, 400, 500]) : R.pick([30, 40, 100, 200]), p = ok ? R.pick([0.005, 0.01, 0.015, 0.02].filter(q => nn * q < 5)) || 0.005 : (nn <= 50 ? R.pick([0.02, 0.05]) : R.pick([0.04, 0.05, 0.08]));
    const mu = nn * p, good = nn > 50 && mu < 5, k = R.int(0, 3), approx = sumP(Array.from({ length: k + 1 }, (_, i) => pois(i, mu))), exact = sumP(Array.from({ length: k + 1 }, (_, i) => binom(i, nn, p)));
    return {
      prompt: `<p>Each of ${nn} components fails independently with probability ${p}. Let X be the number that fail.</p><p>Is the Poisson approximation reasonable? Find \\(\\mu = np\\) and the Poisson value of \\(P(X\\le ${k})\\).</p>`,
      parts: [
        { type: "choice", label: "Poisson approximation reasonable (n > 50 and np < 5)?", options: ["Yes", "No"], answer: good ? 0 : 1, fixed: true, why: { 0: `Check both: n = ${nn} ${nn > 50 ? ">" : "≤"} 50 and np = ${n(mu)} ${mu < 5 ? "<" : "≥"} 5.`, 1: `Check both: n = ${nn} ${nn > 50 ? ">" : "≤"} 50 and np = ${n(mu)} ${mu < 5 ? "<" : "≥"} 5.` } },
        Num(T`\(\mu = np\)`, mu),
        P(T`Poisson \(P(X\le ${k})\)`, approx, [{ value: exact, tol: 0.00005, msg: "That is the exact binomial value. The question asks for the Poisson approximation." }, { value: pois(k, mu), msg: "Add the terms from 0 to " + k + "." }])
      ],
      hand: [T`n = ${nn} ${nn > 50 ? ">" : "≤"} 50 and \(np = ${n(mu)}\) ${mu < 5 ? "<" : "≥"} 5, so the approximation is ${good ? "reasonable" : "not recommended"}.`, T`Poisson(\(\mu = ${n(mu)}\)): \(P(X\le ${k}) = ${Array.from({ length: k + 1 }, (_, i) => f4(pois(i, mu))).join(" + ")} = ${f4(approx)}\).`, T`Exact binomial for comparison: ${f4(exact)}.`],
      ti: code(`ppois(${k}, ${n(mu)}); pbinom(${k}, ${nn}, ${p})`), excel: code(`from scipy.stats import poisson, binom; poisson.cdf(${k}, ${n(mu)}), binom.cdf(${k}, ${nn}, ${p})`)
    };
  }

  HandKit.mount("#practice-app", {
    module: 3,
    skills: [
      { id: "m3-pmfcdf", title: "PMF and CDF", gen: pmfcdf },
      { id: "m3-ex", title: "Expected value", gen: mean },
      { id: "m3-eh", title: "Expected value of h(X)", gen: func },
      { id: "m3-var", title: "Variance and Var(aX+b)", gen: variance },
      { id: "m3-bin", title: "Binomial", gen: binomial },
      { id: "m3-hyp", title: "Hypergeometric", gen: hyper },
      { id: "m3-nb", title: "Negative binomial", gen: negbin },
      { id: "m3-pois", title: "Poisson and the approximation", gen: poisson }
    ]
  });
})();
