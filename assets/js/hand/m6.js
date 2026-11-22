/* Module 6 practice (multi-step): Point Estimation. ti = R, excel = Python. */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const f4 = x => S.fmt(x, 4), n = (x, d = 4) => S.num(x, d).replace("−", "-");
  const code = s => `<code>${s.replace(/</g, "&lt;")}</code>`;
  const Num = (label, answer, mistakes = [], d = 4) => ({ type: "num", label, answer, tol: Math.max(0.0006, Math.abs(answer) * 0.0005), show: S.num(answer, d), mistakes });
  const sum = a => a.reduce((s, v) => s + v, 0), mean = a => sum(a) / a.length, med = a => { const s = [...a].sort((x, y) => x - y), k = s.length; return k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2; };
  const rv = a => `c(${a.join(", ")})`, pv = a => `[${a.join(", ")}]`;

  const STUDIES = [
    { text: k => `A study wants the center of the MPG distribution of a new compact car. A random sample of ${k} cars has mean MPG`, unit: "MPG", par: "The mean MPG of all cars of this model (μ)", est: "The sample mean MPG, X̄", wrong: ["The ${k} cars in the sample", "The sample standard deviation of MPG"], val: () => R.int(280, 340) / 10 },
    { text: k => `An engineer wants the proportion of all welds from a robot that are defective. In a random sample of ${k} welds, the proportion defective is`, unit: "", par: "The proportion of all welds that are defective (p)", est: "The sample proportion defective, p̂", wrong: ["The ${k} welds inspected", "The number of defective welds in the sample"], val: () => R.int(3, 15) / 100 },
    { text: k => `A lab wants the variability of breakdown voltage for an epoxy resin. A random sample of ${k} pieces has sample variance`, unit: "kV<sup>2</sup>", par: "The variance of breakdown voltage for all pieces (σ²)", est: "The sample variance, S²", wrong: ["The ${k} pieces tested", "The sample mean voltage"], val: () => R.int(150, 300) / 100 }
  ];
  function identify() {
    const st = R.pick(STUDIES), k = R.pick([20, 50, 100]), v = st.val(), opts1 = R.shuffle([st.par, st.wrong[0].replace("${k}", k), st.est]), opts2 = R.shuffle([st.est, st.par, st.wrong[1]]);
    return {
      prompt: `<p>${st.text(k)} ${n(v)}${st.unit ? " " + st.unit : ""}.</p><p>Identify the parameter θ, the estimator \\(\\hat\\theta\\), and the estimate.</p>`,
      parts: [
        { type: "choice", label: "Parameter θ", options: opts1, answer: opts1.indexOf(st.par), why: Object.fromEntries(opts1.map((o, i) => [i, o === st.est ? "That is the estimator: a statistic computed from the sample. The parameter describes the whole population." : "That is the sample, not a number describing the population."])) },
        { type: "choice", label: "Estimator \\(\\hat\\theta\\)", options: opts2, answer: opts2.indexOf(st.est), why: Object.fromEntries(opts2.map((o, i) => [i, o === st.par ? "That is the parameter, which is unknown. The estimator is the statistic used to guess it." : "That statistic does not estimate this parameter."])) },
        Num("The estimate (a number)", v, [], 4)
      ],
      hand: [`Parameter: ${st.par.toLowerCase()}; fixed and unknown.`, `Estimator: ${st.est}, a random variable that changes from sample to sample.`, `Estimate: the value from this sample, ${n(v)}.`]
    };
  }

  function estimates() {
    const k = 10, base = R.int(20, 60), x = Array.from({ length: k }, () => base + R.int(-40, 40) / 10).map(v => Math.round(v * 10) / 10);
    if (R.coin(0.5)) x[R.int(0, k - 1)] = Math.round((base + R.pick([-1, 1]) * R.int(60, 90) / 10) * 10) / 10;
    const s = [...x].sort((a, b) => a - b), m = mean(x), md = med(x), mid = (s[0] + s[k - 1]) / 2, tr = mean(s.slice(1, k - 1));
    return {
      prompt: `<p>Ten measurements are assumed to come from a symmetric distribution with center μ:</p><p><strong>${x.join(", ")}</strong></p><p>Compute four estimates of μ. The 10% trimmed mean drops the smallest and largest value (10% of 10 each).</p>`,
      parts: [
        Num(T`\(\bar x\)`, m, [{ value: sum(x) / (k - 1), msg: "Divide by n, not n − 1." }]),
        Num(T`Median \(\tilde x\)`, md, [{ value: (x[4] + x[5]) / 2, msg: "Sort first, then average the 5th and 6th values." }]),
        Num("Average of the extremes", mid, [{ value: (x[0] + x[k - 1]) / 2, msg: "Use the smallest and largest values, not the first and last listed." }]),
        Num("10% trimmed mean", tr, [{ value: mean(s.slice(2, k - 2)), msg: "10% of 10 is 1: drop one value from each end, not two." }])
      ],
      hand: [T`Sorted: ${s.join(", ")}.`, T`\(\bar x = ${n(sum(x))}/10 = ${n(m)}\); median \(= (${s[4]} + ${s[5]})/2 = ${n(md)}\).`, T`Extremes: \((${s[0]} + ${s[k - 1]})/2 = ${n(mid)}\).`, T`Trimmed: drop ${s[0]} and ${s[k - 1]}; mean of the middle 8 \(= ${n(sum(s.slice(1, k - 1)))}/8 = ${n(tr)}\).`, "An outlier moves the mean and the extremes average most; the median and trimmed mean resist it."],
      ti: code(`x <- ${rv(x)}; c(mean(x), median(x), mean(range(x)), mean(x, trim = 0.1))`),
      excel: code(`import numpy as np; from scipy.stats import trim_mean; x = np.array(${pv(x)}); x.mean(), np.median(x), (x.min() + x.max())/2, trim_mean(x, 0.1)`)
    };
  }

  function bias() {
    if (R.coin()) {
      const nn = R.pick([5, 8, 10, 20]), s2 = R.pick([4, 9, 16, 25, 36]);
      return {
        prompt: T`<p>For a random sample of size \(n = ${nn}\) from a population with variance \(\sigma^2 = ${s2}\), consider \(\hat\sigma^2 = \frac1n\sum(X_i-\bar X)^2\). Recall \(E(S^2) = \sigma^2\) and \(\hat\sigma^2 = \frac{n-1}{n}S^2\).</p>`,
        parts: [
          Num(T`\(E(\hat\sigma^2)\)`, (nn - 1) / nn * s2, [{ value: s2, msg: "That would make it unbiased. Multiply by \\((n-1)/n\\)." }]),
          Num(T`\(\text{Bias}(\hat\sigma^2)\)`, -s2 / nn, [{ value: s2 / nn, msg: "Bias = E(estimator) − θ, which is negative here: it underestimates." }]),
          { type: "choice", label: "Is S² unbiased for σ²?", options: ["Yes", "No"], answer: 0, fixed: true, why: { 1: "\\(E(S^2) = \\sigma^2\\) exactly; that is why S² divides by n − 1." } }
        ],
        hand: [T`\(E(\hat\sigma^2) = \frac{${nn}-1}{${nn}}(${s2}) = ${n((nn - 1) / nn * s2)}\).`, T`\(\text{Bias} = ${n((nn - 1) / nn * s2)} - ${s2} = ${n(-s2 / nn)} = -\sigma^2/n\).`, "S² is unbiased; dividing by n makes the estimator biased low."]
      };
    }
    const mu = R.int(10, 60), a = R.pick([0.5, 0.8, 1.2, 1]), b = a === 1 ? R.pick([2, -3, 5]) : 0, nn = R.pick([10, 25]);
    const E = a * mu + b, unb = a === 1 && b === 0;
    return {
      prompt: T`<p>A random sample of size ${nn} comes from a population with mean \(\mu = ${mu}\). Consider the estimator \(\hat\mu = ${a === 1 ? "" : a}\bar X${b ? (b > 0 ? " + " + b : " - " + -b) : ""}\).</p>`,
      parts: [
        Num(T`\(E(\hat\mu)\)`, E, [{ value: mu, msg: "Apply \\(E(a\\bar X + b) = a\\mu + b\\)." }], 4),
        Num(T`\(\text{Bias}(\hat\mu)\)`, E - mu, [{ value: mu - E, msg: "Bias = E(estimator) − parameter." }], 4),
        { type: "choice", label: "Unbiased?", options: ["Yes", "No"], answer: unb ? 0 : 1, fixed: true, why: { 0: `\\(E(\\hat\\mu) = ${n(E)} \\ne ${mu}\\), so it is biased.`, 1: "Its expected value equals μ." } }
      ],
      hand: [T`\(E(\hat\mu) = ${a === 1 ? "" : a}E(\bar X)${b ? (b > 0 ? " + " + b : " - " + -b) : ""} = ${a === 1 ? "" : a + "(" }${mu}${a === 1 ? "" : ")"}${b ? (b > 0 ? " + " + b : " - " + -b) : ""} = ${n(E)}\).`, T`\(\text{Bias} = ${n(E)} - ${mu} = ${n(E - mu)}\).`]
    };
  }

  function compare() {
    const s2 = R.pick([4, 9, 16, 25]), nn = R.int(4, 12), w = R.pick([0.25, 0.3, 0.4]);
    const v1 = s2 / nn, v2 = (w * w + (1 - w) * (1 - w)) * s2;
    return {
      prompt: T`<p>\(X_1,\ldots,X_{${nn}}\) is a random sample with mean μ and variance \(\sigma^2 = ${s2}\). Compare \(\hat\mu_1 = \bar X\) and \(\hat\mu_2 = ${w}X_1 + ${n(1 - w)}X_2\).</p>`,
      parts: [
        { type: "choice", label: T`Is \(\hat\mu_2\) unbiased?`, options: ["Yes", "No"], answer: 0, fixed: true, why: { 1: T`\(E(\hat\mu_2) = ${w}\mu + ${n(1 - w)}\mu = \mu\): the weights add to 1.` } },
        Num(T`\(\text{Var}(\hat\mu_1)\)`, v1, [{ value: s2, msg: "Var(x̄) = σ²/n." }]),
        Num(T`\(\text{Var}(\hat\mu_2)\)`, v2, [{ value: (w + (1 - w)) * s2, msg: "Square the weights: \\(a^2\\sigma^2 + b^2\\sigma^2\\) for independent X₁, X₂." }]),
        { type: "choice", label: "Which estimator is better?", options: [T`\(\hat\mu_1 = \bar X\)`, T`\(\hat\mu_2\)`], answer: v1 <= v2 ? 0 : 1, fixed: true, why: { 0: "Both are unbiased; choose the smaller variance.", 1: "Both are unbiased; choose the smaller variance." } }
      ],
      hand: [T`Both unbiased: \(E(\hat\mu_2) = (${w} + ${n(1 - w)})\mu = \mu\).`, T`\(\text{Var}(\bar X) = ${s2}/${nn} = ${n(v1)}\).`, T`\(\text{Var}(\hat\mu_2) = (${w}^2 + ${n(1 - w)}^2)(${s2}) = ${n(v2)}\).`, `Among unbiased estimators, prefer the smaller variance: ${v1 <= v2 ? "x̄, which uses all the data" : "μ̂₂"}.`]
    };
  }

  function se() {
    if (R.coin()) {
      const nn = R.pick([16, 20, 25, 36, 50]), s = R.int(8, 60) / 10, xb = R.int(200, 400) / 10;
      return {
        prompt: T`<p>A random sample of ${nn} parts has mean length \(\bar x = ${xb}\) mm and standard deviation \(s = ${s}\) mm. Estimate the standard error of \(\bar X\).</p>`,
        parts: [Num(T`Estimated \(\sigma_{\bar X} = s/\sqrt n\)`, s / Math.sqrt(nn), [{ value: s / nn, msg: "Divide by √n, not n." }, { value: s, msg: "That is the SD of one part. The standard error is s/√n." }])],
        hand: [T`\(\hat\sigma_{\bar X} = s/\sqrt n = ${s}/\sqrt{${nn}} = ${n(s / Math.sqrt(nn))}\) mm.`, "It measures how much x̄ would vary from sample to sample."],
        ti: code(`${s}/sqrt(${nn})`), excel: code(`${s}/${nn}**0.5`)
      };
    }
    const nn = R.pick([50, 80, 100, 200, 400]), x = R.int(Math.round(nn * 0.1), Math.round(nn * 0.8)), p = x / nn;
    return {
      prompt: `<p>In a poll of ${nn} engineers, ${x} say they use R at work. Estimate p and the standard error of \\(\\hat p\\).</p>`,
      parts: [Num(T`\(\hat p\)`, p), Num(T`Estimated \(\sigma_{\hat p}\)`, Math.sqrt(p * (1 - p) / nn), [{ value: p * (1 - p) / nn, msg: "Take the square root." }, { value: Math.sqrt(p * (1 - p)) / nn, msg: "Divide by n inside the square root." }])],
      hand: [T`\(\hat p = ${x}/${nn} = ${n(p)}\).`, T`\(\hat\sigma_{\hat p} = \sqrt{\hat p(1-\hat p)/n} = \sqrt{${n(p)}(${n(1 - p)})/${nn}} = ${n(Math.sqrt(p * (1 - p) / nn))}\).`],
      ti: code(`p <- ${x}/${nn}; sqrt(p*(1 - p)/${nn})`), excel: code(`p = ${x}/${nn}; (p*(1 - p)/${nn})**0.5`)
    };
  }

  function mom() {
    const kind = R.pick(["exp", "gamma", "unif", "normal"]), nn = R.pick([6, 8]);
    if (kind === "exp" || kind === "unif") {
      const x = Array.from({ length: nn }, () => R.int(5, 120) / 10), xb = mean(x);
      const ans = kind === "exp" ? 1 / xb : 2 * xb;
      return {
        prompt: kind === "exp" ? `<p>Lifetimes (hours) of ${nn} fuses are modeled as Exponential(λ): <strong>${x.join(", ")}</strong>. Find the method of moments estimate of λ.</p>` : `<p>Delays (s) are modeled as Uniform(0, θ), so \\(E(X) = \\theta/2\\). Data: <strong>${x.join(", ")}</strong>. Find the method of moments estimate of θ.</p>`,
        parts: [Num(T`\(\bar x\)`, xb), Num(kind === "exp" ? T`\(\hat\lambda\)` : T`\(\hat\theta\)`, ans, kind === "exp" ? [{ value: xb, msg: "Set \\(E(X) = 1/\\lambda = \\bar x\\) and solve for λ." }] : [{ value: xb, msg: "Set \\(\\theta/2 = \\bar x\\), so \\(\\hat\\theta = 2\\bar x\\)." }])],
        hand: [T`\(\bar x = ${n(sum(x))}/${nn} = ${n(xb)}\).`, kind === "exp" ? T`Match: \(1/\lambda = \bar x\), so \(\hat\lambda = 1/${n(xb)} = ${n(ans)}\).` : T`Match: \(\theta/2 = \bar x\), so \(\hat\theta = 2(${n(xb)}) = ${n(ans)}\).`],
        ti: code(`x <- ${rv(x)}; ${kind === "exp" ? "1/mean(x)" : "2*mean(x)"}`), excel: code(`x = ${pv(x)}; ${kind === "exp" ? "1/(sum(x)/len(x))" : "2*sum(x)/len(x)"}`)
      };
    }
    const nn2 = R.pick([20, 30, 50]), xb = R.int(30, 90) / 10, v = R.int(10, 60) / 10, sx = Math.round(nn2 * xb * 100) / 100, sx2 = Math.round(nn2 * (v + xb * xb) * 100) / 100;
    const xbar = sx / nn2, sig2 = sx2 / nn2 - xbar * xbar;
    if (kind === "normal") return {
      prompt: T`<p>A sample of \(n = ${nn2}\) from \(N(\mu,\sigma^2)\) has \(\sum x_i = ${sx}\) and \(\sum x_i^2 = ${sx2}\). Find the method of moments estimates of μ and σ².</p>`,
      parts: [Num(T`\(\hat\mu\)`, xbar), Num(T`\(\hat\sigma^2\)`, sig2, [{ value: (sx2 - sx * sx / nn2) / (nn2 - 1), msg: "MoM divides by n: \\(\\frac1n\\sum x_i^2 - \\bar x^2\\). That is S²." }, { value: sx2 / nn2, msg: "Subtract \\(\\bar x^2\\): \\(E(X^2) = \\sigma^2 + \\mu^2\\)." }])],
      hand: [T`First moment: \(\hat\mu = \bar x = ${sx}/${nn2} = ${n(xbar)}\).`, T`Second moment: \(\frac1n\sum x_i^2 = ${n(sx2 / nn2)} = \hat\sigma^2 + \hat\mu^2\), so \(\hat\sigma^2 = ${n(sx2 / nn2)} - ${n(xbar)}^2 = ${n(sig2)}\).`],
      ti: code(`n <- ${nn2}; m <- ${sx}/n; c(m, ${sx2}/n - m^2)`), excel: code(`n = ${nn2}; m = ${sx}/n; m, ${sx2}/n - m**2`)
    };
    return {
      prompt: T`<p>Repair times are modeled as Gamma(α, β). A sample of \(n = ${nn2}\) has \(\sum x_i = ${sx}\) and \(\sum x_i^2 = ${sx2}\). Find the method of moments estimates.</p>`,
      parts: [Num(T`\(\hat\sigma^2 = \frac1n\sum x_i^2 - \bar x^2\)`, sig2, [{ value: (sx2 - sx * sx / nn2) / (nn2 - 1), msg: "MoM uses the divisor n." }]), Num(T`\(\hat\beta = \hat\sigma^2/\bar x\)`, sig2 / xbar, [{ value: xbar / sig2, msg: "\\(\\alpha\\beta^2/(\\alpha\\beta) = \\beta\\): divide the variance by the mean." }]), Num(T`\(\hat\alpha = \bar x^2/\hat\sigma^2\)`, xbar * xbar / sig2, [{ value: xbar / sig2, msg: "\\(\\alpha = (\\alpha\\beta)^2/(\\alpha\\beta^2)\\): square the mean." }])],
      hand: [T`\(\bar x = ${n(xbar)}\), \(\hat\sigma^2 = ${n(sx2 / nn2)} - ${n(xbar)}^2 = ${n(sig2)}\).`, T`Match \(\alpha\beta = \bar x\) and \(\alpha\beta^2 = \hat\sigma^2\): \(\hat\beta = ${n(sig2)}/${n(xbar)} = ${n(sig2 / xbar)}\).`, T`\(\hat\alpha = \bar x/\hat\beta = ${n(xbar)}^2/${n(sig2)} = ${n(xbar * xbar / sig2)}\).`],
      ti: code(`n <- ${nn2}; m <- ${sx}/n; v <- ${sx2}/n - m^2; c(alpha = m^2/v, beta = v/m)`), excel: code(`n = ${nn2}; m = ${sx}/n; v = ${sx2}/n - m**2; m**2/v, v/m`)
    };
  }

  function mle() {
    const kind = R.pick(["exp", "normal", "bern"]);
    if (kind === "exp") {
      const x = Array.from({ length: R.int(5, 7) }, () => R.int(5, 90) / 10), nn = x.length, sx = sum(x);
      return {
        prompt: T`<p>Times between failures (hours) are Exponential(λ): <strong>${x.join(", ")}</strong>. The log-likelihood is \(\ell(\lambda) = n\ln\lambda - \lambda\sum x_i\).</p>`,
        parts: [Num(T`\(\sum x_i\)`, sx), Num(T`\(\hat\lambda\) (MLE)`, nn / sx, [{ value: sx / nn, msg: "That is x̄. Setting \\(\\ell'(\\lambda) = n/\\lambda - \\sum x_i = 0\\) gives \\(\\hat\\lambda = n/\\sum x_i = 1/\\bar x\\)." }])],
        hand: [T`\(\sum x_i = ${n(sx)}\), \(n = ${nn}\).`, T`\(\ell'(\lambda) = \frac{${nn}}{\lambda} - ${n(sx)} = 0\) gives \(\hat\lambda = ${nn}/${n(sx)} = ${n(nn / sx)}\).`],
        ti: code(`x <- ${rv(x)}; 1/mean(x)`), excel: code(`x = ${pv(x)}; len(x)/sum(x)`)
      };
    }
    if (kind === "bern") {
      const nn = R.pick([20, 40, 50, 80]), y = R.int(3, nn - 3);
      return {
        prompt: T`<p>Each of ${nn} independent chips is defective (1) or not (0) with probability p. ${y} are defective. The log-likelihood is \(\ell(p) = y\ln p + (n-y)\ln(1-p)\).</p>`,
        parts: [Num(T`\(\hat p\) (MLE)`, y / nn, [{ value: (nn - y) / nn, msg: "Solve \\(y/p - (n-y)/(1-p) = 0\\): \\(\\hat p = y/n\\), the proportion defective." }])],
        hand: [T`\(\ell'(p) = \frac{${y}}{p} - \frac{${nn - y}}{1-p} = 0\).`, T`\(${y}(1-p) = ${nn - y}p\), so \(\hat p = ${y}/${nn} = ${n(y / nn)}\).`],
        ti: code(`${y}/${nn}`), excel: code(`${y}/${nn}`)
      };
    }
    const x = Array.from({ length: R.int(5, 6) }, () => R.int(90, 130) / 10), nn = x.length, m = mean(x), s2 = sum(x.map(v => (v - m) ** 2)) / nn;
    return {
      prompt: `<p>Measurements from \\(N(\\mu, \\sigma^2)\\): <strong>${x.join(", ")}</strong>. Find the maximum likelihood estimates of μ and σ².</p>`,
      parts: [Num(T`\(\hat\mu\)`, m), Num(T`\(\hat\sigma^2\)`, s2, [{ value: s2 * nn / (nn - 1), msg: "The MLE divides by n, not n − 1 (that would be S²)." }])],
      hand: [T`\(\hat\mu = \bar x = ${n(sum(x))}/${nn} = ${n(m)}\).`, T`\(\hat\sigma^2 = \frac1n\sum(x_i-\bar x)^2 = ${n(s2 * nn)}/${nn} = ${n(s2)}\).`],
      ti: code(`x <- ${rv(x)}; c(mean(x), mean((x - mean(x))^2))`), excel: code(`import numpy as np; x = np.array(${pv(x)}); x.mean(), x.var()   # np.var divides by n`)
    };
  }

  function invariance() {
    const kind = R.pick(["exp", "normal", "bern"]);
    if (kind === "exp") {
      const xb = R.int(20, 80) / 10, t = R.int(2, 10), lam = 1 / xb;
      return {
        prompt: T`<p>For exponential lifetimes the MLE is \(\hat\lambda = 1/\bar x\). A sample has \(\bar x = ${xb}\) years. Find the MLE of λ and of the reliability \(R(${t}) = P(X > ${t}) = e^{-${t}\lambda}\).</p>`,
        parts: [Num(T`\(\hat\lambda\)`, lam), Num(T`MLE of \(R(${t})\)`, Math.exp(-t * lam), [{ value: 1 - Math.exp(-t * lam), msg: "R(t) = P(X > t) = e^{−λt}, not 1 − e^{−λt}." }, { value: Math.exp(-t * xb), msg: "Plug in λ̂ = 1/x̄, not x̄." }])],
        hand: [T`\(\hat\lambda = 1/${xb} = ${n(lam)}\).`, T`Invariance: \(\widehat{R(${t})} = e^{-${t}\hat\lambda} = e^{-${n(t * lam)}} = ${n(Math.exp(-t * lam))}\).`],
        ti: code(`exp(-${t}/${xb})`), excel: code(`import math; math.exp(-${t}/${xb})`)
      };
    }
    if (kind === "bern") {
      const p = R.int(10, 60) / 100;
      return {
        prompt: T`<p>The MLE of a defect probability is \(\hat p = ${p}\). Find the MLE of the odds \(p/(1-p)\) and of \(P(\text{two independent parts both good}) = (1-p)^2\).</p>`,
        parts: [Num("MLE of the odds", p / (1 - p), [{ value: (1 - p) / p, msg: "Odds of a defect: p/(1 − p)." }]), Num(T`MLE of \((1-p)^2\)`, (1 - p) ** 2, [{ value: 1 - p * p, msg: "Square (1 − p̂), not p̂." }])],
        hand: [T`Invariance: plug \(\hat p\) into each function.`, T`Odds: \(${p}/${n(1 - p)} = ${n(p / (1 - p))}\); \((1-${p})^2 = ${n((1 - p) ** 2)}\).`],
        ti: code(`p <- ${p}; c(p/(1 - p), (1 - p)^2)`), excel: code(`p = ${p}; p/(1 - p), (1 - p)**2`)
      };
    }
    const s2 = R.int(20, 160) / 10;
    return {
      prompt: T`<p>For a normal sample the MLE of the variance is \(\hat\sigma^2 = ${s2}\). Find the MLE of σ.</p>`,
      parts: [Num(T`\(\hat\sigma\)`, Math.sqrt(s2), [{ value: s2 / 2, msg: "Take the square root of σ̂² (invariance)." }])],
      hand: [T`Invariance: \(\hat\sigma = \sqrt{\hat\sigma^2} = \sqrt{${s2}} = ${n(Math.sqrt(s2))}\).`],
      ti: code(`sqrt(${s2})`), excel: code(`${s2}**0.5`)
    };
  }

  HandKit.mount("#practice-app", {
    module: 6,
    skills: [
      { id: "m6-ident", title: "Parameter, estimator, estimate", gen: identify },
      { id: "m6-four", title: "Four estimates of the center", gen: estimates },
      { id: "m6-bias", title: "Bias", gen: bias },
      { id: "m6-cmp", title: "Comparing unbiased estimators", gen: compare },
      { id: "m6-stderr", title: "Standard error", gen: se },
      { id: "m6-mom", title: "Method of moments", gen: mom },
      { id: "m6-mle", title: "Maximum likelihood", gen: mle },
      { id: "m6-inv", title: "Invariance of the MLE", gen: invariance }
    ]
  });
})();
