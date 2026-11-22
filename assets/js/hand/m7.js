/* Module 7 practice (multi-step): Confidence Intervals. ti = R, excel = Python. Course rules: z for σ known or n > 40;
   t with df = n − 1 exactly for n ≤ 40 (normal population); Wald for p (score/Wilson also taught); chi-squared for σ². */
(function () {
  "use strict";
  const S = HandStats, St = (typeof Stats !== "undefined" ? Stats : globalThis.Stats), R = HandKit.R, T = String.raw;
  const n = (x, d = 4) => S.num(x, d).replace("−", "-");
  const code = s => `<code>${s.replace(/</g, "&lt;")}</code>`;
  const Num = (label, answer, mistakes = [], d = 4, tol) => ({ type: "num", label, answer, tol: tol != null ? tol : Math.max(0.0006, Math.abs(answer) * 0.0006), show: S.num(answer, d), mistakes });
  const Z = { 80: 1.282, 90: 1.645, 95: 1.96, 99: 2.576 }, ZONE = { 90: 1.282, 95: 1.645, 99: 2.326 };
  const CONF = () => R.pick([90, 95, 95, 99]);
  const sigmaParts = (xb, se, crit, conf, label = "z") => {
    const me = crit * se;
    return [Num("Standard error", se, [], 4), Num(`Critical value \\(${label}\\) for ${conf}%`, crit, [{ value: Z[conf === 95 ? 90 : 95], msg: `For ${conf}% confidence use \\(z_{\\alpha/2}\\) with α/2 = ${n((100 - conf) / 200)} in each tail.` }], 3, 0.0015),
      Num("Margin of error", me, [{ value: crit * se * se, msg: "ME = critical value × SE." }]), Num("Lower endpoint", xb - me), Num("Upper endpoint", xb + me)];
  };
  const CTX = [["sedan highway mileage", "MPG"], ["bearing diameters", "mm"], ["battery lifetimes", "hours"], ["sensor readings", "mV"], ["concrete compressive strengths", "MPa"]];

  function zci() {
    const [what, u] = R.pick(CTX), sd = R.int(2, 12), nn = R.pick([9, 16, 25, 36, 64, 100]), xb = R.int(200, 600) / 10, conf = CONF(), se = sd / Math.sqrt(nn), c = Z[conf];
    return {
      prompt: `<p>The ${what} are normal with known σ = ${sd} ${u}. A random sample of n = ${nn} has \\(\\bar x = ${xb}\\) ${u}. Build a ${conf}% confidence interval for μ.</p>`,
      parts: sigmaParts(xb, se, c, conf, T`z_{\alpha/2}`).map((p, i) => i === 0 ? Object.assign(p, { label: T`\(\sigma/\sqrt n\)`, mistakes: [{ value: sd / nn, msg: "Divide σ by √n." }, { value: sd, msg: "That is σ itself; the SE of x̄ is σ/√n." }] }) : p),
      hand: [T`σ is known and the population is normal, so use z.`, T`SE \(= ${sd}/\sqrt{${nn}} = ${n(se)}\).`, T`\(z_{\alpha/2} = ${c}\) for ${conf}%.`, T`ME \(= ${c}(${n(se)}) = ${n(c * se)}\); interval \(${xb}\pm ${n(c * se)} = (${n(xb - c * se)},\ ${n(xb + c * se)})\).`, `We are ${conf}% confident that the mean ${what.replace(/s$/, "")} is between ${n(xb - c * se)} and ${n(xb + c * se)} ${u}.`],
      ti: code(`${xb} + c(-1, 1) * qnorm(${(1 + conf / 100) / 2}) * ${sd}/sqrt(${nn})`),
      excel: code(`from scipy.stats import norm; m = norm.ppf(${(1 + conf / 100) / 2}) * ${sd}/${nn}**0.5; ${xb} - m, ${xb} + m`)
    };
  }

  function largeci() {
    const [what, u] = R.pick(CTX), nn = R.pick([45, 50, 64, 81, 100, 144]), s = R.int(15, 90) / 10, xb = R.int(200, 600) / 10, conf = CONF(), se = s / Math.sqrt(nn), c = Z[conf];
    return {
      prompt: `<p>A random sample of n = ${nn} ${what} has \\(\\bar x = ${xb}\\) ${u} and s = ${s} ${u}; σ is unknown and the population shape is unknown. Build a ${conf}% confidence interval for μ.</p>`,
      parts: [{ type: "choice", label: "Which method applies?", options: ["Large-sample z interval (n > 40)", "t interval with df = n − 1", "No interval is possible"], answer: 0, fixed: true, why: { 1: "With n > 40 the course uses the large-sample z interval with s.", 2: "The CLT makes x̄ approximately normal for n > 40." } }, ...sigmaParts(xb, se, c, conf, T`z_{\alpha/2}`)],
      hand: [`n = ${nn} > 40: by the CLT use \\(\\bar x\\pm z_{\\alpha/2}s/\\sqrt n\\).`, T`SE \(= ${s}/\sqrt{${nn}} = ${n(se)}\); \(z = ${c}\).`, T`ME \(= ${n(c * se)}\); interval \((${n(xb - c * se)},\ ${n(xb + c * se)})\).`],
      ti: code(`${xb} + c(-1, 1) * qnorm(${(1 + conf / 100) / 2}) * ${s}/sqrt(${nn})`),
      excel: code(`from scipy.stats import norm; m = norm.ppf(${(1 + conf / 100) / 2}) * ${s}/${nn}**0.5; ${xb} - m, ${xb} + m`)
    };
  }

  const PCTX = [["customers", "are satisfied with a new product"], ["engineering graduates", "received a job offer before graduation"], ["chips", "pass a burn-in test"], ["drivers", "use a lane-keeping feature"]];
  function wald() {
    const [who, what] = R.pick(PCTX), nn = R.pick([100, 150, 200, 250, 400, 500]), x = R.int(Math.round(nn * 0.15), Math.round(nn * 0.85)), p = x / nn, conf = CONF(), c = Z[conf], se = Math.sqrt(p * (1 - p) / nn), me = c * se;
    return {
      prompt: `<p>In a random sample of ${nn} ${who}, ${x} ${what}. Build a ${conf}% Wald confidence interval for the population proportion p.</p>`,
      parts: [
        Num(T`\(\hat p\)`, p), { type: "choice", label: T`Are \(n\hat p\ge10\) and \(n(1-\hat p)\ge10\)?`, options: ["Yes", "No"], answer: 0, fixed: true, why: { 1: `${x} successes and ${nn - x} failures are both at least 10.` } },
        Num("Standard error", se, [{ value: p * (1 - p) / nn, msg: "Take the square root." }, { value: Math.sqrt(p * (1 - p)), msg: "Divide by n inside the root." }]),
        Num("Lower endpoint", p - me, [{ value: p - se, msg: "Multiply the SE by the critical value " + c + "." }]), Num("Upper endpoint", p + me)
      ],
      hand: [T`\(\hat p = ${x}/${nn} = ${n(p)}\); ${x} and ${nn - x} are both ≥ 10.`, T`SE \(= \sqrt{${n(p)}(${n(1 - p)})/${nn}} = ${n(se)}\).`, T`ME \(= ${c}(${n(se)}) = ${n(me)}\); interval \((${n(p - me)},\ ${n(p + me)})\).`, `We are ${conf}% confident that between ${S.num((p - me) * 100, 1)}% and ${S.num((p + me) * 100, 1)}% of all ${who} ${what}.`],
      ti: code(`p <- ${x}/${nn}; p + c(-1, 1) * qnorm(${(1 + conf / 100) / 2}) * sqrt(p*(1 - p)/${nn})`),
      excel: code(`from statsmodels.stats.proportion import proportion_confint; proportion_confint(${x}, ${nn}, alpha=${n(1 - conf / 100, 2)}, method="normal")`)
    };
  }

  function wilson() {
    const nn = R.pick([20, 25, 30, 40, 50]), x = R.int(2, 8), p = x / nn, conf = R.pick([90, 95]), z = Z[conf], d = 1 + z * z / nn, pt = (p + z * z / (2 * nn)) / d, me = z * Math.sqrt(p * (1 - p) / nn + z * z / (4 * nn * nn)) / d;
    return {
      prompt: `<p>${x} of ${nn} randomly selected customers would pay extra for an extended warranty. Build a ${conf}% score (Wilson) interval for p.</p>`,
      parts: [
        { type: "choice", label: "Is the Wald interval appropriate here?", options: ["Yes", "No"], answer: x >= 10 && nn - x >= 10 ? 0 : 1, fixed: true, why: { 0: `n p̂ = ${x} < 10, so the Wald condition fails.`, 1: "Both counts are at least 10." } },
        Num(T`\(\tilde p\)`, pt, [{ value: p, msg: "The score interval is centered at \\(\\tilde p\\), which shifts p̂ toward 1/2." }]),
        Num("Margin of error", me, [{ value: z * Math.sqrt(p * (1 - p) / nn), msg: "That is the Wald margin. Add z²/(4n²) inside the root and divide by 1 + z²/n." }]),
        Num("Lower endpoint", pt - me), Num("Upper endpoint", pt + me)
      ],
      hand: [T`\(\hat p = ${x}/${nn} = ${n(p)}\), \(z = ${z}\), \(z^2 = ${n(z * z)}\).`, T`\(\tilde p = \frac{${n(p)} + ${n(z * z)}/${2 * nn}}{1 + ${n(z * z)}/${nn}} = ${n(pt)}\).`, T`ME \(= \frac{${z}\sqrt{${n(p)}(${n(1 - p)})/${nn} + ${n(z * z)}/${4 * nn * nn}}}{${n(d)}} = ${n(me)}\).`, T`Interval: \((${n(pt - me)},\ ${n(pt + me)})\).`],
      ti: code(`prop.test(${x}, ${nn}, conf.level = ${conf / 100}, correct = FALSE)$conf.int`),
      excel: code(`from statsmodels.stats.proportion import proportion_confint; proportion_confint(${x}, ${nn}, alpha=${n(1 - conf / 100, 2)}, method="wilson")`)
    };
  }

  function bounds() {
    const [what, u] = R.pick(CTX), nn = R.pick([50, 64, 100, 121]), s = R.int(15, 60) / 10, xb = R.int(200, 600) / 10, conf = R.pick([90, 95, 99]), upper = R.coin(), c = ZONE[conf], se = s / Math.sqrt(nn), b = upper ? xb + c * se : xb - c * se;
    return {
      prompt: `<p>A random sample of ${nn} ${what} has \\(\\bar x = ${xb}\\) ${u} and s = ${s} ${u}. Find a ${conf}% <strong>${upper ? "upper" : "lower"}</strong> confidence bound for μ.</p>`,
      parts: [Num(T`\(z_\alpha\)`, c, [{ value: Z[conf], msg: "A one-sided bound puts all of α in one tail: use \\(z_\\alpha\\), not \\(z_{\\alpha/2}\\)." }], 3, 0.0015), Num(`${upper ? "Upper" : "Lower"} bound`, b, [{ value: upper ? xb + Z[conf] * se : xb - Z[conf] * se, msg: "Use \\(z_\\alpha\\) for a one-sided bound." }, { value: upper ? xb - c * se : xb + c * se, msg: upper ? "An upper bound adds the margin." : "A lower bound subtracts the margin." }])],
      hand: [T`One-sided ${conf}%: \(z_\alpha = ${c}\) (area ${n(1 - conf / 100, 2)} in one tail).`, T`\(\mu ${upper ? "<" : ">"} ${xb} ${upper ? "+" : "-"} ${c}(${s}/\sqrt{${nn}}) = ${n(b)}\) ${u}.`, `We are ${conf}% confident that μ is ${upper ? "less" : "greater"} than ${n(b)} ${u}.`],
      ti: code(`${xb} ${upper ? "+" : "-"} qnorm(${conf / 100}) * ${s}/sqrt(${nn})`), excel: code(`from scipy.stats import norm; ${xb} ${upper ? "+" : "-"} norm.ppf(${conf / 100}) * ${s}/${nn}**0.5`)
    };
  }

  function tci() {
    const nn = R.int(5, 25), conf = CONF(), df = nn - 1, a = (100 - conf) / 200, tc = St.tCritical(df, conf / 100), giveVar = R.coin(0.4), s = R.int(8, 40) / 10, xb = R.int(30, 90) / 10 * R.pick([1, 10]), se = s / Math.sqrt(nn), me = tc * se;
    const ctx = R.pick(["three-toed sloth speeds (meters per minute)", "tensile strengths of a new alloy (MPa)", "cure times of an epoxy (hours)", "response times of a controller (ms)"]);
    return {
      prompt: `<p>The ${ctx} are normal with unknown μ and σ. A random sample of n = ${nn} has \\(\\bar x = ${xb}\\) and ${giveVar ? `\\(s^2 = ${n(s * s)}\\)` : `s = ${s}`}. Build a ${conf}% confidence interval for μ.</p>`,
      parts: [
        Num("Degrees of freedom", df, [{ value: nn, msg: "df = n − 1." }], 0, 0.01),
        Num(T`\(t_{\alpha/2,\,n-1}\)`, tc, [{ value: St.tCritical(df + 1, conf / 100), msg: "Use the row df = n − 1, not n." }, { value: Z[conf], msg: "That is the z value. With n ≤ 40 and σ unknown, use t." }, { value: Math.round(St.tInv(1 - (100 - conf) / 100, df) * 1000) / 1000, msg: "Use the column α/2 = " + n(a) + ", not α." }], 3, 0.0015),
        Num("Margin of error", me, [{ value: tc * s * s / Math.sqrt(nn), msg: "Use s, the square root of s², in the SE." }, { value: Z[conf] * se, msg: "Use the t critical value, not z." }]),
        Num("Lower endpoint", xb - me), Num("Upper endpoint", xb + me)
      ],
      hand: [`n = ${nn} ≤ 40, normal population, σ unknown: t interval with df = ${df}.`, giveVar ? T`\(s = \sqrt{${n(s * s)}} = ${s}\); SE \(= ${s}/\sqrt{${nn}} = ${n(se)}\).` : T`SE \(= ${s}/\sqrt{${nn}} = ${n(se)}\).`, T`Table row df = ${df}, column ${n(a)}: \(t = ${tc}\).`, T`ME \(= ${tc}(${n(se)}) = ${n(me)}\); interval \((${n(xb - me)},\ ${n(xb + me)})\).`],
      ti: code(`${xb} + c(-1, 1) * qt(${1 - a}, ${df}) * ${s}/sqrt(${nn})`),
      excel: code(`from scipy.stats import t; t.interval(${conf / 100}, ${df}, loc=${xb}, scale=${s}/${nn}**0.5)`)
    };
  }

  function chici() {
    const nn = R.int(8, 41), df = nn - 1, conf = R.pick([90, 95, 99]), a = (100 - conf) / 200, s = R.int(10, 60) / 10, v = s * s, hi = St.chiCritical(a, df), lo = St.chiCritical(1 - a, df), L = df * v / hi, U = df * v / lo, sig = R.coin(0.4);
    return {
      prompt: `<p>Assume a normal population. A random sample of n = ${nn} has s = ${s}. Build a ${conf}% confidence interval for ${sig ? "σ" : "σ²"}.</p>`,
      parts: [
        Num(T`\((n-1)s^2\)`, df * v, [{ value: nn * v, msg: "Multiply by n − 1." }, { value: df * s, msg: "Square s first." }]),
        Num(T`\(\chi^2_{\alpha/2,\,${df}}\) (larger)`, hi, [{ value: lo, msg: "That is the smaller value \\(\\chi^2_{1-\\alpha/2}\\)." }], 3, 0.0015),
        Num(T`\(\chi^2_{1-\alpha/2,\,${df}}\) (smaller)`, lo, [{ value: hi, msg: "That is the larger value." }], 3, 0.0015),
        Num(sig ? "Lower endpoint for σ" : "Lower endpoint for σ²", sig ? Math.sqrt(L) : L, [{ value: sig ? Math.sqrt(U) : U, msg: "The lower endpoint divides by the larger χ² value." }]),
        Num(sig ? "Upper endpoint for σ" : "Upper endpoint for σ²", sig ? Math.sqrt(U) : U, [{ value: sig ? Math.sqrt(L) : L, msg: "The upper endpoint divides by the smaller χ² value." }])
      ],
      hand: [T`df = ${df}; \((n-1)s^2 = ${df}(${n(v)}) = ${n(df * v)}\).`, T`Table: \(\chi^2_{${n(a)},${df}} = ${hi}\) and \(\chi^2_{${n(1 - a)},${df}} = ${lo}\).`, T`σ²: \((${n(df * v)}/${hi},\ ${n(df * v)}/${lo}) = (${n(L)},\ ${n(U)})\).`, sig ? T`σ: \((\sqrt{${n(L)}},\ \sqrt{${n(U)}}) = (${n(Math.sqrt(L))},\ ${n(Math.sqrt(U))})\).` : "Take square roots of the endpoints for an interval for σ."],
      ti: code(`v <- ${df} * ${s}^2; ${sig ? "sqrt(" : ""}v / qchisq(c(${1 - a}, ${a}), ${df})${sig ? ")" : ""}`),
      excel: code(`from scipy.stats import chi2; v = ${df} * ${s}**2; [${sig ? "(" : ""}v/chi2.ppf(q, ${df})${sig ? ")**0.5" : ""} for q in (${1 - a}, ${a})]`)
    };
  }

  function interp() {
    const conf = R.pick([90, 95, 99]), lo = R.int(200, 300) / 10, hi = lo + R.int(10, 30) / 10, k = R.pick([4, 9]), what = R.pick([["mean MPG of all sedans of this model", "MPG"], ["mean breakdown voltage of the resin", "kV"]]);
    const opts = [`We are ${conf}% confident that the ${what[0]} is between ${lo} and ${hi} ${what[1]}.`, `There is a ${conf}% probability that the ${what[0]} is between ${lo} and ${hi}.`, `${conf}% of individual values lie between ${lo} and ${hi} ${what[1]}.`, `${conf}% of sample means equal a value between ${lo} and ${hi}.`];
    return {
      prompt: `<p>A ${conf}% confidence interval for the ${what[0]} is (${lo}, ${hi}) ${what[1]}.</p>`,
      parts: [
        { type: "choice", label: "Best interpretation", options: opts, answer: 0, fixed: true, why: { 1: "μ is fixed, not random. The confidence describes how often the method captures μ.", 2: "A confidence interval is about the mean, not individual values.", 3: "The interval estimates μ; it is not a statement about other sample means." } },
        { type: "choice", label: `If n were multiplied by ${k} (same confidence), the margin of error would`, options: [`be divided by ${Math.sqrt(k)}`, `be divided by ${k}`, "stay the same", `be multiplied by ${Math.sqrt(k)}`], answer: 0, fixed: true, why: { 1: "ME depends on 1/√n.", 2: "A larger sample gives a smaller SE.", 3: "A larger n makes the interval narrower." } },
        { type: "choice", label: "With the same data, a higher confidence level gives an interval that is", options: ["wider", "narrower", "the same width"], answer: 0, fixed: true, why: { 1: "A higher confidence level needs a larger critical value.", 2: "The critical value changes with the confidence level." } }
      ],
      hand: [`If we took many random samples and built a ${conf}% interval from each, about ${conf}% of them would contain the true μ; this one is one of those intervals.`, `ME = (critical value)(σ/√n): multiplying n by ${k} divides it by √${k} = ${Math.sqrt(k)}.`, "Higher confidence means a larger critical value, so a wider interval."]
    };
  }

  HandKit.mount("#practice-app", {
    module: 7,
    skills: [
      { id: "m7-zsig", title: "z interval (σ known)", gen: zci },
      { id: "m7-large", title: "Large-sample interval", gen: largeci },
      { id: "m7-waldp", title: "Wald interval for p", gen: wald },
      { id: "m7-wilsonp", title: "Score (Wilson) interval", gen: wilson },
      { id: "m7-bound", title: "Confidence bounds", gen: bounds },
      { id: "m7-tint", title: "t interval", gen: tci },
      { id: "m7-chi", title: "Interval for σ² or σ", gen: chici },
      { id: "m7-meaning", title: "Interpreting confidence", gen: interp }
    ]
  });
})();
