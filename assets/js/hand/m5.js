/* Module 5 practice (multi-step): Joint Distributions, Sampling Distributions, and the CLT. ti = R, excel = Python. */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const f4 = x => S.fmt(x, 4), n = (x, d = 4) => S.num(x, d).replace("−", "-");
  const code = s => `<code>${s.replace(/</g, "&lt;")}</code>`;
  const P = (label, answer, mistakes = [], tol = 0.0006) => ({ type: "num", label, answer, tol, show: f4(answer), mistakes });
  const Num = (label, answer, mistakes = [], d = 4) => ({ type: "num", label, answer, tol: Math.max(0.0006, Math.abs(answer) * 0.0005), show: S.num(answer, d), mistakes });
  const sum = a => a.reduce((s, v) => s + v, 0);

  // joint table: rows x in xs, cols y in ys, probabilities in hundredths (or products for independent tables)
  function jointTable(indep) {
    const xs = R.pick([[0, 1], [0, 1, 2], [1, 2, 3]]), ys = R.pick([[0, 1, 2], [0, 1], [1, 2, 3]]);
    let p;
    if (indep) {
      const split = k => R.pick({ 2: [[0.4, 0.6], [0.3, 0.7], [0.5, 0.5], [0.2, 0.8]], 3: [[0.2, 0.3, 0.5], [0.1, 0.4, 0.5], [0.3, 0.3, 0.4], [0.2, 0.5, 0.3]] }[k]);
      const px = split(xs.length), py = split(ys.length);
      p = xs.map((_, i) => ys.map((_, j) => Math.round(px[i] * py[j] * 1e4) / 1e4));
    } else {
      const k = xs.length * ys.length; let w;
      do { w = Array.from({ length: k }, () => R.int(2, 25)); } while (sum(w) > 100);
      w[R.int(0, k - 1)] += 100 - sum(w);
      p = xs.map((_, i) => ys.map((_, j) => w[i * ys.length + j] / 100));
    }
    const px = p.map(r => sum(r)), py = ys.map((_, j) => sum(p.map(r => r[j])));
    const html = `<div class="table-scroll"><table class="data"><thead><tr><th>\\(x\\) \\ \\(y\\)</th>${ys.map(y => `<th>${y}</th>`).join("")}</tr></thead><tbody>${xs.map((x, i) => `<tr><td>${x}</td>${p[i].map(v => `<td>${n(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const rmat = `matrix(c(${p.flat().map(v => n(v)).join(", ")}), nrow = ${xs.length}, byrow = TRUE)`, pmat = `np.array([${p.map(r => `[${r.map(v => n(v)).join(", ")}]`).join(", ")}])`;
    return { xs, ys, p, px, py, html, rmat, pmat };
  }
  const CTX = ["X = number of defects found by inspector A and Y = by inspector B on a panel", "X = number of cars and Y = number of bikes at a household", "X = number of failed disks and Y = number of failed fans in a server rack", "X = hoses and Y = pumps out of service at a fire station"];

  function jointprob() {
    const t = jointTable(false), xa = t.xs[R.int(0, t.xs.length - 2)], yb = t.ys[R.int(1, t.ys.length - 1)];
    const pA = sum(t.xs.flatMap((x, i) => t.ys.map((y, j) => x > xa && y <= yb ? t.p[i][j] : 0)));
    const pEq = sum(t.xs.flatMap((x, i) => t.ys.map((y, j) => x === y ? t.p[i][j] : 0)));
    const k = R.int(Math.min(...t.xs) + Math.min(...t.ys) + 1, Math.max(...t.xs) + Math.max(...t.ys) - 1), pS = sum(t.xs.flatMap((x, i) => t.ys.map((y, j) => x + y <= k ? t.p[i][j] : 0)));
    return {
      prompt: `<p>${R.pick(CTX)}. Their joint PMF \\(p(x,y)\\) is</p>${t.html}`,
      parts: [
        P(T`\(P(X > ${xa},\ Y \le ${yb})\)`, pA, [{ value: sum(t.xs.flatMap((x, i) => t.ys.map((y, j) => x >= xa && y <= yb ? t.p[i][j] : 0))), msg: `“Greater than ${xa}” excludes x = ${xa}.` }]),
        P(T`\(P(X = Y)\)`, pEq, [{ value: 0, msg: "Add the cells where x and y are equal (the matching row and column labels)." }]),
        P(T`\(P(X + Y \le ${k})\)`, pS, [])
      ],
      hand: [
        T`Add the cells in each event. \(P(X>${xa}, Y\le ${yb})\): rows with \(x>${xa}\), columns with \(y\le ${yb}\): ${f4(pA)}.`,
        T`\(P(X=Y)\): cells where \(x=y\): ${f4(pEq)}.`,
        T`\(P(X+Y\le ${k})\): cells whose labels add to at most ${k}: ${f4(pS)}.`
      ],
      ti: code(`p <- ${t.rmat}; x <- c(${t.xs.join(", ")}); y <- c(${t.ys.join(", ")}); sum(p[x > ${xa}, y <= ${yb}]); sum(p[outer(x, y, "+") <= ${k}])`),
      excel: code(`import numpy as np; p = ${t.pmat}; x = np.array([${t.xs.join(", ")}]); y = np.array([${t.ys.join(", ")}]); p[np.ix_(x > ${xa}, y <= ${yb})].sum(), p[np.add.outer(x, y) <= ${k}].sum()`)
    };
  }

  function marginal() {
    const t = jointTable(R.coin(0.3)), i = R.int(0, t.xs.length - 1), j = R.int(0, t.ys.length - 1), yb = t.ys[R.int(0, t.ys.length - 2)], pyle = sum(t.ys.map((y, jj) => y <= yb ? t.py[jj] : 0));
    return {
      prompt: `<p>${R.pick(CTX)}. Their joint PMF is</p>${t.html}<p>Find marginal probabilities.</p>`,
      parts: [
        P(T`\(p_X(${t.xs[i]}) = P(X = ${t.xs[i]})\)`, t.px[i], [{ value: t.p[i][0], msg: "That is one cell. The marginal adds the whole row." }, { value: t.py[Math.min(i, t.ys.length - 1)], msg: "Rows are values of X: add across the row, not down a column." }]),
        P(T`\(p_Y(${t.ys[j]})\)`, t.py[j], [{ value: t.px[Math.min(j, t.xs.length - 1)], msg: "Columns are values of Y: add down the column." }]),
        P(T`\(P(Y \le ${yb})\)`, pyle, [{ value: t.py[t.ys.indexOf(yb)], msg: "Include every column up to and including y = " + yb + "." }])
      ],
      hand: [
        T`\(p_X(${t.xs[i]}) = ${t.p[i].map(v => n(v)).join(" + ")} = ${f4(t.px[i])}\) (row sum).`,
        T`\(p_Y(${t.ys[j]}) = ${t.p.map(r => n(r[j])).join(" + ")} = ${f4(t.py[j])}\) (column sum).`,
        T`\(P(Y\le ${yb}) = ${t.ys.map((y, jj) => y <= yb ? f4(t.py[jj]) : null).filter(Boolean).join(" + ")} = ${f4(pyle)}\).`
      ],
      ti: code(`p <- ${t.rmat}; rowSums(p); colSums(p)`),
      excel: code(`import numpy as np; p = ${t.pmat}; p.sum(axis=1), p.sum(axis=0)`)
    };
  }

  function independence() {
    if (R.coin(0.3)) {
      const prod = R.coin(), a = R.pick([2, 3]), b = R.pick([1, 2]);
      const fTex = prod ? T`c\,x^{${a - 1}}y^{${b}}` : T`x + y`;
      return {
        prompt: T`<p>X and Y have joint density \(f(x,y) = ${prod ? T`${a * (b + 1)}\,x^{${a - 1}}y^{${b}}` : "x + y"}\) for \(0<x<1,\ 0<y<1\). Are X and Y independent?</p>`,
        parts: [{ type: "choice", label: "Independent?", options: ["Yes: the joint density factors into the marginals", "No: the joint density does not factor"], answer: prod ? 0 : 1, fixed: true,
          why: prod ? { 1: `The marginals are \\(f_X(x) = ${a}x^{${a - 1}}\\) and \\(f_Y(y) = ${b + 1}y^{${b}}\\), whose product is the joint density on the whole rectangle.` } : { 0: "The marginals are \\(f_X(x) = x + 1/2\\) and \\(f_Y(y) = y + 1/2\\); their product is not \\(x+y\\)." } }],
        hand: prod ? [T`\(f_X(x) = \int_0^1 ${a * (b + 1)}x^{${a - 1}}y^{${b}}dy = ${a}x^{${a - 1}}\).`, T`\(f_Y(y) = \int_0^1 ${a * (b + 1)}x^{${a - 1}}y^{${b}}dx = ${b + 1}y^{${b}}\).`, "The product equals f(x, y) everywhere on the rectangle: independent."] : [T`\(f_X(x) = \int_0^1 (x+y)\,dy = x + \tfrac12\); likewise \(f_Y(y) = y + \tfrac12\).`, T`\((x+\tfrac12)(y+\tfrac12) = xy + \tfrac{x+y}{2} + \tfrac14 \ne x+y\) (try x = y = 0: product 1/4, joint 0). Dependent.`]
      };
    }
    const indep = R.coin(), t = jointTable(indep), i = R.int(0, t.xs.length - 1), j = R.int(0, t.ys.length - 1);
    let bad = [i, j]; if (!indep) { outer: for (let a = 0; a < t.xs.length; a++) for (let b = 0; b < t.ys.length; b++) if (Math.abs(t.p[a][b] - t.px[a] * t.py[b]) > 5e-5) { bad = [a, b]; break outer; } }
    const [a, b] = indep ? [i, j] : bad, yes = indep || t.xs.every((_, aa) => t.ys.every((__, bb) => Math.abs(t.p[aa][bb] - t.px[aa] * t.py[bb]) < 5e-5));
    return {
      prompt: `<p>X and Y have the joint PMF below. Are they independent?</p>${t.html}`,
      parts: [
        P(T`\(p_X(${t.xs[a]})\,p_Y(${t.ys[b]})\)`, t.px[a] * t.py[b], [{ value: t.p[a][b], msg: "That is the joint cell. Multiply the two marginals (row total times column total)." }]),
        { type: "choice", label: "Independent?", options: ["Yes: every cell equals the product of its marginals", "No: some cell differs from the product"], answer: yes ? 0 : 1, fixed: true,
          why: { 0: `Cell (${t.xs[a]}, ${t.ys[b]}) is ${n(t.p[a][b])}, but the product is ${f4(t.px[a] * t.py[b])}. One failing cell means dependent.`, 1: "Every cell equals its row total times its column total, so X and Y are independent." } }
      ],
      hand: [T`Marginals: \(p_X = (${t.px.map(v => f4(v)).join(", ")})\), \(p_Y = (${t.py.map(v => f4(v)).join(", ")})\).`, T`Cell \((${t.xs[a]}, ${t.ys[b]})\): \(p = ${n(t.p[a][b])}\) vs. \(p_X p_Y = ${f4(t.px[a])}(${f4(t.py[b])}) = ${f4(t.px[a] * t.py[b])}\).`, yes ? "Every cell matches its product (check them all): independent." : "This cell differs, so X and Y are dependent."],
      ti: code(`p <- ${t.rmat}; all(abs(p - outer(rowSums(p), colSums(p))) < 1e-9)`),
      excel: code(`import numpy as np; p = ${t.pmat}; np.allclose(p, np.outer(p.sum(1), p.sum(0)))`)
    };
  }

  function expect() {
    const t = jointTable(false), ex = sum(t.xs.map((x, i) => x * t.px[i])), ey = sum(t.ys.map((y, j) => y * t.py[j])), exy = sum(t.xs.flatMap((x, i) => t.ys.map((y, j) => x * y * t.p[i][j])));
    const c = R.pick([2, 3]), d = R.int(1, 10), eh = sum(t.xs.flatMap((x, i) => t.ys.map((y, j) => (c * x * x + d) * t.p[i][j])));
    return {
      prompt: `<p>${R.pick(CTX)}. Their joint PMF is</p>${t.html}`,
      parts: [
        Num(T`\(E(X+Y)\)`, ex + ey, [{ value: ex * ey, msg: "Expectation of a sum is the sum of expectations, not the product." }]),
        Num(T`\(E(XY)\)`, exy, [{ value: ex * ey, msg: "\\(E(XY) = E(X)E(Y)\\) only for independent variables. Weight each product xy by its cell." }]),
        Num(T`\(E(${c}X^2 + ${d})\)`, eh, [{ value: c * ex * ex + d, msg: "Use \\(E(X^2) = \\sum x^2 p_X(x)\\), not \\([E(X)]^2\\)." }])
      ],
      hand: [T`\(E(X) = ${n(ex)}\) and \(E(Y) = ${n(ey)}\) from the marginals, so \(E(X+Y) = ${n(ex + ey)}\).`, T`\(E(XY) = \sum\sum xy\,p(x,y) = ${n(exy)}\).`, T`\(E(${c}X^2+${d}) = ${c}E(X^2) + ${d} = ${c}(${n(sum(t.xs.map((x, i) => x * x * t.px[i])))}) + ${d} = ${n(eh)}\).`],
      ti: code(`p <- ${t.rmat}; x <- c(${t.xs.join(", ")}); y <- c(${t.ys.join(", ")}); sum(outer(x, y, "+")*p); sum(outer(x, y)*p)`),
      excel: code(`import numpy as np; p = ${t.pmat}; x = np.array([${t.xs.join(", ")}]); y = np.array([${t.ys.join(", ")}]); (np.add.outer(x, y)*p).sum(), (np.outer(x, y)*p).sum()`)
    };
  }

  function cov() {
    const t = jointTable(false), ex = sum(t.xs.map((x, i) => x * t.px[i])), ey = sum(t.ys.map((y, j) => y * t.py[j])), exy = sum(t.xs.flatMap((x, i) => t.ys.map((y, j) => x * y * t.p[i][j])));
    const vx = sum(t.xs.map((x, i) => x * x * t.px[i])) - ex * ex, vy = sum(t.ys.map((y, j) => y * y * t.py[j])) - ey * ey, cv = exy - ex * ey, rho = cv / Math.sqrt(vx * vy);
    return {
      prompt: `<p>X and Y have the joint PMF below. Find the covariance, the correlation, and \\(\\text{Var}(X+Y)\\).</p>${t.html}`,
      parts: [
        Num(T`\(\text{Cov}(X,Y)\)`, cv, [{ value: exy, msg: "Subtract \\(\\mu_X\\mu_Y\\): \\(\\text{Cov} = E(XY) - \\mu_X\\mu_Y\\)." }]),
        Num(T`\(\rho_{X,Y}\)`, rho, [{ value: cv / (vx * vy), msg: "Divide by the product of the standard deviations, not the variances." }]),
        Num(T`\(\text{Var}(X+Y)\)`, vx + vy + 2 * cv, [{ value: vx + vy, msg: "Add \\(2\\,\\text{Cov}(X,Y)\\); X and Y are not independent." }])
      ],
      hand: [
        T`\(\mu_X = ${n(ex)}\), \(\mu_Y = ${n(ey)}\), \(E(XY) = ${n(exy)}\).`,
        T`\(\text{Cov}(X,Y) = ${n(exy)} - ${n(ex)}(${n(ey)}) = ${n(cv)}\).`,
        T`\(\sigma_X^2 = ${n(vx)}\), \(\sigma_Y^2 = ${n(vy)}\); \(\rho = ${n(cv)}/\sqrt{${n(vx)}(${n(vy)})} = ${n(rho)}\).`,
        T`\(\text{Var}(X+Y) = ${n(vx)} + ${n(vy)} + 2(${n(cv)}) = ${n(vx + vy + 2 * cv)}\).`
      ],
      ti: code(`p <- ${t.rmat}; x <- c(${t.xs.join(", ")}); y <- c(${t.ys.join(", ")}); mx <- sum(x*rowSums(p)); my <- sum(y*colSums(p)); cv <- sum(outer(x, y)*p) - mx*my; cv; cv/sqrt((sum(x^2*rowSums(p)) - mx^2)*(sum(y^2*colSums(p)) - my^2))`),
      excel: code(`import numpy as np; p = ${t.pmat}; x = np.array([${t.xs.join(", ")}]); y = np.array([${t.ys.join(", ")}]); px, py = p.sum(1), p.sum(0); mx, my = x@px, y@py; cv = (np.outer(x, y)*p).sum() - mx*my; cv, cv/np.sqrt((x**2@px - mx**2)*(y**2@py - my**2))`)
    };
  }

  const POPS = [["Arctic polar bear weights", "kg", [400, 500], [20, 40]], ["cruising speeds of commercial airplanes", "km/h", [820, 900], [25, 60]], ["lifetimes of LED bulbs", "hours", [9000, 12000], [600, 1500]], ["response times of a web service", "ms", [180, 260], [30, 70]]];
  function xbar() {
    const [what, u, mr, sr] = R.pick(POPS), mu = R.int(...mr), sd = R.int(...sr), nn = R.pick([9, 16, 25, 36, 49, 64, 100]), giveVar = R.coin(0.4), k = R.pick([4, 9]);
    return {
      prompt: `<p>The ${what} have mean ${mu} ${u} and ${giveVar ? `variance ${sd * sd} ${u}²` : `standard deviation ${sd} ${u}`}. A random sample of ${nn} is taken.</p>`,
      parts: [
        Num(T`\(E(\bar X)\)`, mu, [], 2),
        Num(T`\(\sigma_{\bar X}\)`, sd / Math.sqrt(nn), [{ value: sd * sd / Math.sqrt(nn), msg: "Use σ, the square root of the variance, in σ/√n." }, { value: sd / nn, msg: "Divide by √n, not n." }, { value: sd, msg: "That is the SD of one value. Sample means vary less: σ/√n." }]),
        Num(`By what factor does \\(\\sigma_{\\bar X}\\) shrink if n is multiplied by ${k}?`, Math.sqrt(k), [{ value: k, msg: "The SD of x̄ depends on √n, so multiplying n by " + k + " divides it by √" + k + "." }], 2)
      ],
      hand: [T`\(E(\bar X) = \mu = ${mu}\) ${u}.`, giveVar ? T`\(\sigma = \sqrt{${sd * sd}} = ${sd}\), so \(\sigma_{\bar X} = ${sd}/\sqrt{${nn}} = ${n(sd / Math.sqrt(nn))}\).` : T`\(\sigma_{\bar X} = \sigma/\sqrt n = ${sd}/\sqrt{${nn}} = ${n(sd / Math.sqrt(nn))}\) ${u}.`, T`\(\sigma/\sqrt{${k}n} = (\sigma/\sqrt n)/\sqrt{${k}}\): it shrinks by a factor of ${n(Math.sqrt(k))}.`],
      ti: code(`${sd}/sqrt(${nn})`), excel: code(`${sd}/${nn}**0.5`)
    };
  }

  function clt() {
    const [what, u, mr, sr] = R.pick(POPS), mu = R.int(...mr), sd = R.int(...sr), big = R.coin(0.75), nn = big ? R.pick([45, 49, 50, 64, 81, 100]) : R.pick([10, 16, 25, 36, 40]);
    const se = sd / Math.sqrt(nn), x = Math.round(mu + R.pick([-1, 1]) * R.int(5, 22) / 10 * se), right = x > mu ? R.coin(0.7) : R.coin(0.3);
    const parts = [{ type: "choice", label: "Can the CLT be used for x̄ here (course rule n > 40)?", options: ["Yes", "No"], answer: big ? 0 : 1, fixed: true, why: { 0: `n = ${nn} is not more than 40 and the population shape is unknown, so the CLT should not be used.`, 1: `n = ${nn} > 40, so x̄ is approximately normal whatever the population shape.` } }];
    const hand = [big ? `n = ${nn} > 40, so by the CLT x̄ is approximately normal.` : `n = ${nn} ≤ 40 and the shape of the population is unknown, so we cannot use the CLT. (If the population were normal, x̄ would be exactly normal.)`];
    if (big) {
      const o = HandKit.normalProb({ mu, sd: se, type: right ? "gt" : "lt", a: x, v: "\\bar X", sdTex: "\\sigma_{\\bar X}" });
      parts.push(Num(T`\(\sigma_{\bar X}\)`, se, [{ value: sd, msg: "Use σ/√n for the sample mean." }]), { type: "num", label: T`\(${o.sym}\)`, answer: o.tab, tol: 0.0006, alts: [o.exact], show: f4(o.tab), mistakes: [...o.mistakes, { value: right ? 1 - S.tableArea((x - mu) / sd) : S.tableArea((x - mu) / sd), msg: "Standardize with σ/√n, not σ: this is about the mean of " + nn + " values." }] });
      hand.push(T`\(\bar X\approx N\big(${mu},\ (${sd}/\sqrt{${nn}})^2\big)\), \(\sigma_{\bar X} = ${n(se)}\).`, ...o.steps);
      return { prompt: `<p>The ${what} have mean ${mu} ${u} and standard deviation ${sd} ${u}; the population shape is unknown. A random sample of n = ${nn} is taken.</p><p>Find \\(P(\\bar X ${right ? ">" : "<"} ${x})\\).</p>`, parts, hand, figure: o.figure, after: o.after, ti: o.ti, excel: o.excel };
    }
    return { prompt: `<p>The ${what} have mean ${mu} ${u} and standard deviation ${sd} ${u}; the population shape is unknown. A random sample of n = ${nn} is taken. Can we find \\(P(\\bar X ${right ? ">" : "<"} ${x})\\) with a normal model?</p>`, parts, hand };
  }

  const STMT = [
    ["The mean income of all airplane pilots in the United States", 0], ["The mean income of a random sample of 50 pilots", 1],
    ["The percentage of all Texas college students with triple-digit student debt", 0], ["The percentage with triple-digit debt in a random sample of 100 Texas students", 1],
    ["The average distance walked daily by all people in the US", 0], ["The sample standard deviation of 30 measured bolt lengths", 1],
    ["The true proportion of defective chips produced by a plant", 0], ["The proportion defective among 200 chips inspected today", 1]
  ];
  function paramstat() {
    const [txt, a] = R.pick(STMT), q = R.pick([0, 1, 2]);
    const parts = [{ type: "choice", label: "This number is a", options: ["Parameter", "Statistic"], answer: a, fixed: true, why: { 0: "It is computed from a sample, so it is a statistic and varies from sample to sample.", 1: "It describes the whole population: a fixed but unknown parameter." } }];
    const qs = [
      ["As n increases, the sample mean x̄", ["gets closer to μ (Law of Large Numbers)", "gets farther from μ", "stays equally variable"], 0, "By the Law of Large Numbers x̄ → μ, and its SD σ/√n shrinks."],
      ["The distribution of x̄ over all possible samples of size n is the", ["sampling distribution of x̄", "population distribution", "distribution of the data in one sample"], 0, "The sampling distribution describes how a statistic varies from sample to sample."],
      ["In a random sample X₁, …, Xₙ, the observations are", ["independent and identically distributed", "always normally distributed", "the same value"], 0, "A random sample is i.i.d.: independent, with a common distribution."]
    ][q];
    parts.push({ type: "choice", label: qs[0], options: qs[1], answer: qs[2], fixed: true, why: Object.fromEntries(qs[1].map((_, i) => [i, qs[3]])) });
    return { prompt: `<p>${txt}.</p>`, parts, hand: [a ? "Computed from a sample: a statistic, which is a random variable." : "A characteristic of the whole population: a parameter, fixed but usually unknown.", qs[3]] };
  }

  HandKit.mount("#practice-app", {
    module: 5,
    skills: [
      { id: "m5-jointp", title: "Joint PMF probabilities", gen: jointprob },
      { id: "m5-marg", title: "Marginal distributions", gen: marginal },
      { id: "m5-ind", title: "Independence", gen: independence },
      { id: "m5-exy", title: "Expected values of h(X, Y)", gen: expect },
      { id: "m5-covcorr", title: "Covariance and correlation", gen: cov },
      { id: "m5-se", title: "Mean and SD of x̄", gen: xbar },
      { id: "m5-cltprob", title: "CLT probabilities", gen: clt },
      { id: "m5-ps", title: "Parameters, statistics, and the LLN", gen: paramstat }
    ]
  });
})();
