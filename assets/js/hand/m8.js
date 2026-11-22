/* Module 8 practice (multi-step): Hypothesis Testing. ti = R, excel = Python. Course rules: z test for μ with σ known
   (normal population); large-sample z test for n > 40; t test with df = n − 1 exactly (normal population, n ≤ 40);
   z test for p with np0 ≥ 10 and n(1 − p0) ≥ 10; z rounded to 2 decimals before the normal table; no continuity correction.
   Both the critical-value method and the p-value method are taught (the switch above the steps picks one). */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw, n = HandKit.tx;
  const f4 = x => S.fmt(x, 4).replace("−", "-");
  const code = s => `<code>${String(s).replace(/</g, "&lt;")}</code>`;
  const SYM = { gt: ">", lt: "<", ne: "\\ne" }, WORD = { gt: "greater than", lt: "less than", ne: "different from" };
  const ALT = { gt: '"greater"', lt: '"less"', ne: '"two.sided"' }, PYALT = { gt: '"greater"', lt: '"less"', ne: '"two-sided"' };

  // ---- writing hypotheses ----
  const CLAIMS = [
    ["Scientists claim kingfishers fly <strong>faster than</strong> 26 mph on average.", "\\mu", 26, "gt"],
    ["A manufacturer claims the mean sprinkler activation temperature is 130 °F; an engineer wants to check whether it is <strong>different</strong>.", "\\mu", 130, "ne"],
    ["The recommended zinc intake is 15 mg/day; a nutritionist suspects men aged 65–74 take in <strong>less</strong> on average.", "\\mu", 15, "lt"],
    ["A supplier claims <strong>no more than</strong> 10% of its parts are defective; the buyer suspects the rate is higher.", "p", 0.1, "gt"],
    ["A bolt specification calls for a mean tensile strength of 800 MPa; QA wants evidence that the mean is <strong>below</strong> spec.", "\\mu", 800, "lt"],
    ["A new solder alloy is claimed to cut the joint failure rate <strong>below</strong> 0.05.", "p", 0.05, "lt"],
    ["A server team wants to know whether the mean response time has <strong>changed</strong> from 120 ms after an update.", "\\mu", 120, "ne"],
    ["A battery maker claims its cells last <strong>more than</strong> 500 charge cycles on average.", "\\mu", 500, "gt"],
    ["A quality engineer asks whether the proportion of wafers passing inspection <strong>differs from</strong> 0.90.", "p", 0.9, "ne"],
    ["A pump is rated to deliver <strong>at least</strong> 40 L/min on average; operators suspect it delivers less.", "\\mu", 40, "lt"]
  ];
  function hypotheses() {
    const [txt, par, v, dir] = R.pick(CLAIMS);
    const opts = ["gt", "lt", "ne"].map(d => T`\(H_0: ${par} = ${n(v)}\) versus \(H_a: ${par} ${SYM[d]} ${n(v)}\)`);
    opts.push(T`\(H_0: ${par} ${SYM[dir]} ${n(v)}\) versus \(H_a: ${par} = ${n(v)}\)`);
    const ans = ["gt", "lt", "ne"].indexOf(dir);
    const why = `The claim to find evidence for is that the parameter is ${WORD[dir]} ${n(v)}, so that goes in \\(H_a\\). \\(H_0\\) is the "=" statement.`;
    const kind = par === "p" ? "a proportion" : "a mean";
    return {
      prompt: `<p>${txt}</p><p>Identify the parameter and choose the hypotheses.</p>`,
      parts: [
        { type: "choice", label: "The parameter is", options: ["a population mean μ", "a population proportion p", "a sample mean x̄", "a sample proportion p̂"], answer: par === "p" ? 1 : 0, fixed: true,
          why: { [par === "p" ? 0 : 1]: `The claim is about ${kind}.`, 2: "Hypotheses are about parameters, never statistics.", 3: "Hypotheses are about parameters, never statistics." } },
        { type: "choice", label: "Hypotheses", options: opts, answer: ans, fixed: true, why: Object.fromEntries([0, 1, 2, 3].filter(i => i !== ans).map(i => [i, i === 3 ? "\\(H_0\\) always contains the equality." : why])) }
      ],
      hand: [`Step 0: the parameter is \\(${par}\\), ${kind}, with null value ${n(v)}.`, why, "Statements like 'at least' or 'no more than' are the status quo; the suspicion that contradicts them is the alternative."]
    };
  }

  // ---- critical values from the z and t tables (course notation z_α, t_{α,ν}) ----
  const ZSTAR = a => S.round(S.qnorm(1 - a), 3);
  const zCrit = (alpha, dir) => ZSTAR(dir === "ne" ? alpha / 2 : alpha);
  const tCrit = (df, alpha, dir) => S.tTableValue(S.tTableRow(df), dir === "ne" ? alpha / 2 : alpha);
  const ZL = dir => dir === "ne" ? "z_{\\alpha/2}" : "z_{\\alpha}", TL = (dir, df) => dir === "ne" ? `t_{\\alpha/2,${df}}` : `t_{\\alpha,${df}}`;
  const RULE = (dir, c) => dir === "gt" ? `\\(\\text{TS} \\ge ${c}\\)` : dir === "lt" ? `\\(\\text{TS} \\le -${c}\\)` : `\\(|\\text{TS}| \\ge ${c}\\)`;
  const IN_RR = (ts, dir, c) => dir === "gt" ? ts >= c : dir === "lt" ? ts <= -c : Math.abs(ts) >= c;
  const COL = (alpha, dir) => dir === "ne" ? `column \\(\\alpha/2 = ${n(alpha / 2)}\\)` : `column \\(\\alpha = ${alpha}\\)`;

  // ---- p-values (normal table for z; t-table bracket plus the exact value for t) ----
  const PV = (dist, ts, dir, df) => { const o = RRPlot.norm({ dist, df, dir, ts, crit: 1 }); return dist === "z" ? o.p : RRPlot.pValue(o); };
  const TB = (ts, dir, df) => RRPlot.bracket(RRPlot.norm({ dist: "t", df, dir, ts, crit: 1 }));
  const P4 = v => v < 0.0001 ? "less than 0.0001" : v.toFixed(4);
  const PFORM = (dir, V, ts) => dir === "gt" ? `\\(P(${V} > ${ts})\\)` : dir === "lt" ? `\\(P(${V} < ${ts})\\)` : `\\(2P(${V} > ${String(ts).replace("-", "")})\\)`;
  const BR = b => b.lo <= 0 ? `p-value < ${n(b.hi)}` : b.hi >= 1 ? `p-value > ${n(b.lo)}` : `${n(b.lo)} < p-value < ${n(b.hi)}`;
  function zPvPart(z, dir) {
    const zr = S.round(z, 2), p = PV("z", zr, dir), left = S.round(1 - RRPlot.upper(zr, "z"), 4), tail = Math.min(left, 1 - left), mis = [];
    if (dir === "ne") mis.push({ value: tail, tol: 0.00051, msg: "Two-sided: double the tail area." }); else if (2 * p <= 1) mis.push({ value: 2 * p, tol: 0.00051, msg: "One-sided: do not double the tail area." });
    if (dir === "gt" && Math.abs(left - p) > 0.001) mis.push({ value: left, tol: 0.00051, msg: "That is the left area. For \\(H_a\\) with >, the p-value is the area to the right: 1 − left area." });
    if (dir === "lt" && Math.abs(1 - left - p) > 0.001) mis.push({ value: 1 - left, tol: 0.00051, msg: "For \\(H_a\\) with <, the p-value is the area to the left of z: the table value itself." });
    return { p, zr, left, part: { type: "num", method: "pv", label: "p-value (normal table, 4 decimals)", answer: p, tol: 0.00051, show: P4(p), mistakes: mis } };
  }
  function tPvPart(t, dir, df) {
    const b = TB(t, dir, df), exact = PV("t", t, dir, df), mis = [];
    if (dir === "ne") mis.push({ lo: b.lo / 2, hi: b.hi / 2, msg: "Two-sided: double both tail areas." }, { value: exact / 2, msg: "Two-sided: double the one-tail area." });
    else if (b.hi * 2 <= 1) mis.push({ lo: b.lo * 2, hi: b.hi * 2, msg: "One-sided: do not double the tail areas." });
    return { b, exact, part: { type: "pint", method: "pv", label: "p-value: between which two t-table areas? (or the exact value)", lo: b.lo, hi: b.hi, exact, mistakes: mis } };
  }
  const DEC = (method, reject, alpha, detail) => ({ type: "choice", method, label: `Decision at \\(\\alpha = ${alpha}\\)`, options: ["Reject \\(H_0\\)", "Fail to reject \\(H_0\\)"], answer: reject ? 0 : 1, fixed: true, why: { [reject ? 1 : 0]: detail } });
  const zSteps = (z, dir, alpha, zs, reject, pz) => [
    `<strong>Critical-value method:</strong> z table, ${COL(alpha, dir)}: \\(${ZL(dir)} = ${zs.toFixed(3)}\\). Reject \\(H_0\\) if ${RULE(dir, zs.toFixed(3))}. \\(z = ${S.fmt(z, 2).replace("−", "-")}\\) is ${reject ? "" : "not "}in the rejection region.`,
    `<strong>p-value method:</strong> p-value = ${PFORM(dir, "Z", pz.zr.toFixed(2))}. ${Math.abs(pz.zr) > 3.49 ? "|z| is beyond the normal table (±3.49), so the tail area is essentially 0" : `The normal table gives a left area of ${pz.left.toFixed(4)} at \\(z = ${pz.zr.toFixed(2)}\\), so p-value = ${dir === "gt" ? `1 − ${pz.left.toFixed(4)} = ` : dir === "ne" ? `2 × ${Math.min(pz.left, 1 - pz.left).toFixed(4)} = ` : ""}${P4(pz.p)}`}, which is ${reject ? "less than" : "greater than"} \\(\\alpha = ${alpha}\\).`,
    `Either way, ${reject ? "reject" : "fail to reject"} \\(H_0\\).`
  ];
  const zCode = (z, dir) => ({
    ti: code(`z <- ${S.fmt(z, 4).replace("−", "-")}; ${dir === "gt" ? "1 - pnorm(z)" : dir === "lt" ? "pnorm(z)" : "2 * (1 - pnorm(abs(z)))"}`),
    excel: code(`from scipy.stats import norm; z = ${S.fmt(z, 4).replace("−", "-")}; ${dir === "gt" ? "norm.sf(z)" : dir === "lt" ? "norm.cdf(z)" : "2 * norm.sf(abs(z))"}`)
  });

  // ---- z test for μ, σ known (normal population) ----
  const ZSIG = [
    { what: "sprinkler activation temperature", unit: "°F", mu0: 130, sd: [1, 2.5], dec: 2 },
    { what: "diameter of machined shafts", unit: "mm", mu0: 25, sd: [0.02, 0.08], dec: 3 },
    { what: "fill volume of coolant bottles", unit: "mL", mu0: 500, sd: [2, 6], dec: 1 },
    { what: "resistance of film resistors", unit: "Ω", mu0: 100, sd: [0.5, 2], dec: 2 },
    { what: "breaking strength of a fiber", unit: "N", mu0: 75, sd: [2, 5], dec: 2 },
    { what: "thickness of a coating", unit: "μm", mu0: 40, sd: [1, 3], dec: 2 }
  ];
  function meanZ(large) {
    const c = R.pick(ZSIG), dir = R.pick(["gt", "lt", "ne"]), alpha = R.pick([0.01, 0.05, 0.1]);
    const nn = large ? R.pick([45, 50, 60, 64, 75, 80, 100, 115, 120, 150, 200]) : R.pick([4, 6, 9, 10, 12, 16, 20, 25, 36]);
    const sd = S.round(c.sd[0] + Math.random() * (c.sd[1] - c.sd[0]), c.dec), se = sd / Math.sqrt(nn);
    const target = (dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1])) * R.int(20, 380) / 100;
    const xbar = S.round(c.mu0 + target * se, c.dec + 1), z = (xbar - c.mu0) / se;
    const zs = zCrit(alpha, dir), reject = IN_RR(S.round(z, 2), dir, zs), pz = zPvPart(z, dir);
    if ((pz.p < alpha) !== reject || Math.abs(Math.abs(S.round(z, 2)) - zs) < 0.006) return meanZ(large);
    const sName = large ? "s" : "\\sigma", zsOther = zCrit(alpha, dir === "ne" ? "gt" : "ne");
    const parts = [
      { type: "num", label: T`Standard error \(${sName}/\sqrt n\)`, answer: se, tol: Math.max(0.00006, se * 0.002), show: S.num(se, 4), mistakes: [{ value: sd / nn, msg: `Divide ${large ? "s" : "σ"} by \\(\\sqrt n\\), not by n.` }, { value: sd, msg: "That is the standard deviation of one observation; divide by \\(\\sqrt n\\)." }] },
      { type: "num", label: "Test statistic \\(z\\) (2 decimals)", answer: z, tol: 0.011, show: S.fmt(z, 2),
        mistakes: [{ value: (xbar - c.mu0) / sd, tol: 0.011, msg: "Divide by the standard error, not by the standard deviation." }, { value: -z, tol: 0.011, msg: "Sign reversed: compute \\(\\bar x - \\mu_0\\)." }] },
      { type: "num", method: "cv", label: `Critical value \\(${ZL(dir)}\\) (z table)`, answer: zs, tol: 0.0015, show: zs.toFixed(3),
        mistakes: [{ value: zsOther, tol: 0.0015, msg: dir === "ne" ? "Two-sided: use \\(z_{\\alpha/2}\\), not \\(z_\\alpha\\)." : "One-sided: use \\(z_\\alpha\\), not \\(z_{\\alpha/2}\\)." }, { value: -zs, tol: 0.0015, msg: "Enter the critical value as a positive number; the minus sign goes in the rejection rule." }] },
      DEC("cv", reject, alpha, `Rejection region: ${RULE(dir, zs.toFixed(3))}. \\(z = ${S.fmt(z, 2).replace("−", "-")}\\) is ${reject ? "in" : "not in"} it.`),
      pz.part,
      DEC("pv", reject, alpha, `p-value = ${P4(pz.p)} is ${reject ? "less than" : "greater than"} \\(\\alpha = ${alpha}\\).`)
    ];
    return {
      prompt: large
        ? `<p>Test whether the mean ${c.what} is <strong>${WORD[dir]} ${c.mu0}</strong> ${c.unit}. A random sample of n = ${nn} gives \\(\\bar x = ${n(xbar, c.dec + 1)}\\) and s = ${n(sd)} ${c.unit}; σ is unknown and the population shape is unknown. Use \\(\\alpha = ${alpha}\\).</p>`
        : `<p>The ${c.what} is normal with known σ = ${n(sd)} ${c.unit}. Test whether the mean is <strong>${WORD[dir]} ${c.mu0}</strong> ${c.unit}, using a random sample of n = ${nn} with \\(\\bar x = ${n(xbar, c.dec + 1)}\\). Use \\(\\alpha = ${alpha}\\).</p>`,
      parts,
      hand: [
        T`\(H_0: \mu = ${c.mu0}\) versus \(H_a: \mu ${SYM[dir]} ${c.mu0}\).`,
        large ? `σ is unknown but n = ${nn} > 40, so use the large-sample z test with s in place of σ (any population shape).` : "The population is normal and σ is known, so use the z test (any n).",
        T`SE \(= ${n(sd)}/\sqrt{${nn}} = ${f4(se)}\); \(z = \dfrac{${n(xbar, c.dec + 1)} - ${c.mu0}}{${f4(se)}} = ${S.fmt(z, 4).replace("−", "-")} \approx ${S.fmt(z, 2).replace("−", "-")}\).`,
        ...zSteps(z, dir, alpha, zs, reject, pz),
        `There ${reject ? "is" : "is not"} sufficient evidence at the \\(\\alpha = ${alpha}\\) level that the mean ${c.what} is ${WORD[dir]} ${c.mu0} ${c.unit}.`
      ],
      figure: RRPlot.svg({ dist: "z", dir, crit: zs, ts: S.round(z, 2), alpha }),
      after: "Both methods always give the same decision. Use the switch above the steps to answer with either one.",
      ...zCode(z, dir)
    };
  }

  // ---- one-sample t test (df = n − 1 exactly) ----
  const TCTX = [["weld strength", "MPa", 480, [8, 25], 1], ["battery capacity", "mAh", 3000, [20, 60], 0], ["concrete compressive strength", "MPa", 30, [1.5, 4], 2],
    ["perceived time of a 45-second interval", "seconds", 45, [6, 12], 1], ["pump flow rate", "L/min", 40, [1, 3], 2], ["server response time", "ms", 120, [6, 18], 1], ["shaft diameter", "mm", 25, [0.02, 0.07], 3]];
  function tTest() {
    const [what, unit, mu0, sr, dec] = R.pick(TCTX), dir = R.pick(["gt", "lt", "ne"]), alpha = R.pick([0.01, 0.05, 0.1]);
    const raw = R.coin() && dec <= 1;
    const nn = raw ? R.int(6, 10) : R.int(5, 40), df = nn - 1;
    let xs, xbar, s;
    if (raw) {
      const tt = (dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1])) * R.int(40, 450) / 100, sd0 = sr[0] + Math.random() * (sr[1] - sr[0]);
      xs = Array.from({ length: nn }, () => S.round(mu0 + tt * sd0 / Math.sqrt(nn) + sd0 * S.qnorm(0.02 + 0.96 * Math.random()), dec));
      xbar = S.mean(xs); s = S.sd(xs);
    } else {
      s = S.round(sr[0] + Math.random() * (sr[1] - sr[0]), dec + 1);
      const tt = (dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1])) * R.int(30, 450) / 100;
      xbar = S.round(mu0 + tt * s / Math.sqrt(nn), dec + 2);
    }
    const se = s / Math.sqrt(nn), t = (xbar - mu0) / se, ts = tCrit(df, alpha, dir), reject = IN_RR(t, dir, ts), pt = tPvPart(t, dir, df);
    if (!(s > 0) || (pt.exact < alpha) !== reject || (pt.b.lo < alpha && alpha < pt.b.hi) || Math.abs(Math.abs(t) - ts) < 0.01) return tTest();
    const tsOther = tCrit(df, alpha, dir === "ne" ? "gt" : "ne"), tsN = S.tTableValue(S.tTableRow(Math.min(40, nn)), dir === "ne" ? alpha / 2 : alpha), zs = zCrit(alpha, dir);
    const tMis = [{ value: tsOther, tol: 0.0015, msg: dir === "ne" ? "Two-sided: use the column α/2, not α." : "One-sided: use the column α, not α/2." }, { value: zs, tol: 0.0015, msg: "That is the z value. For a mean with s and n ≤ 40, use the t row df = n − 1." }];
    if (Math.abs(tsN - ts) > 0.0005) tMis.push({ value: tsN, tol: 0.0015, msg: "That row is df = n. Use df = n − 1." });
    const parts = [];
    if (raw) parts.push({ type: "num", label: "Sample mean \\(\\bar x\\)", answer: xbar, tol: Math.max(0.0006, Math.abs(xbar) * 0.0002), show: S.num(xbar, 4), mistakes: [] },
      { type: "num", label: "Sample standard deviation \\(s\\)", answer: s, tol: Math.max(0.0006, s * 0.002), show: S.num(s, 4), mistakes: [{ value: s * Math.sqrt((nn - 1) / nn), msg: "Divide by n − 1, not n, inside the square root." }] });
    parts.push(
      { type: "num", label: "Test statistic \\(t\\) (3 decimals)", answer: t, tol: 0.006, show: S.fmt(t, 3),
        mistakes: [{ value: (xbar - mu0) / s, tol: 0.006, msg: "Divide by the standard error \\(s/\\sqrt n\\), not by \\(s\\)." }, { value: -t, tol: 0.006, msg: "Sign reversed: compute \\(\\bar x - \\mu_0\\)." }] },
      { type: "num", label: "Degrees of freedom", answer: df, tol: 0.01, show: String(df), mistakes: [{ value: nn, msg: "df = n − 1." }] },
      { type: "num", method: "cv", label: `Critical value \\(${TL(dir, df)}\\) from the t table`, answer: ts, tol: 0.0015, show: ts.toFixed(3), mistakes: tMis },
      DEC("cv", reject, alpha, `Rejection region: ${RULE(dir, ts.toFixed(3))}. \\(t = ${S.fmt(t, 3).replace("−", "-")}\\) is ${reject ? "in" : "not in"} it.`),
      pt.part,
      DEC("pv", reject, alpha, `${BR(pt.b)} (exactly ${P4(pt.exact)}), which is ${reject ? "less than" : "greater than"} \\(\\alpha = ${alpha}\\).`));
    const dataTxt = raw ? `A random sample of ${nn} gives: ${xs.map(v => n(v, dec)).join(", ")} ${unit}.` : `A random sample of ${nn} gives \\(\\bar x = ${n(xbar, dec + 2)}\\) and \\(s = ${n(s)}\\) ${unit}.`;
    const xS = n(xbar, 4), sS = n(s, 4);
    return {
      prompt: `<p>Test whether the mean ${what} is <strong>${WORD[dir]} ${mu0}</strong> ${unit}. ${dataTxt} Assume the population is normal; σ is unknown. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts,
      hand: [
        T`\(H_0: \mu = ${mu0}\) versus \(H_a: \mu ${SYM[dir]} ${mu0}\). Normal population, σ unknown, n = ${nn} ≤ 40: use the t test.`,
        ...(raw ? [T`\(\bar x = ${n(S.sum(xs), dec + 2)}/${nn} = ${xS}\); \(s = \sqrt{\sum (x_i - \bar x)^2/(n-1)} = ${sS}\).`] : []),
        T`\(t = \dfrac{${xS} - ${mu0}}{${sS}/\sqrt{${nn}}} = \dfrac{${f4(xbar - mu0)}}{${f4(se)}} = ${S.fmt(t, 3).replace("−", "-")}\), with df = ${nn} − 1 = ${df}.`,
        `<strong>Critical-value method:</strong> row df = ${df}, ${COL(alpha, dir)}: \\(${TL(dir, df)} = ${ts.toFixed(3)}\\). Reject \\(H_0\\) if ${RULE(dir, ts.toFixed(3))}. \\(t = ${S.fmt(t, 3).replace("−", "-")}\\) is ${reject ? "" : "not "}in the rejection region.`,
        `<strong>p-value method:</strong> p-value = ${PFORM(dir, "T", S.fmt(t, 3).replace("−", "-"))}. In row df = ${df}, find where ${S.fmt(Math.abs(t), 3)} falls among the table values${dir === "ne" ? " and double the column areas" : ""}: ${BR(pt.b)}. Exactly, p-value = ${P4(pt.exact)}, ${reject ? "less than" : "greater than"} \\(\\alpha = ${alpha}\\).`,
        `Either way, ${reject ? "reject" : "fail to reject"} \\(H_0\\). There ${reject ? "is" : "is not"} sufficient evidence at the ${alpha} level that the mean ${what} is ${WORD[dir]} ${mu0} ${unit}.`
      ],
      figure: RRPlot.svg({ dist: "t", df, dir, crit: ts, ts: S.round(t, 3), alpha }),
      after: "Both methods always give the same decision. Use the switch above the steps to answer with either one.",
      ti: raw ? code(`t.test(c(${xs.map(v => n(v, dec)).join(", ")}), mu = ${mu0}, alternative = ${ALT[dir]})`) : code(`t <- (${xS} - ${mu0})/(${sS}/sqrt(${nn})); ${dir === "gt" ? `1 - pt(t, ${df})` : dir === "lt" ? `pt(t, ${df})` : `2 * (1 - pt(abs(t), ${df}))`}; qt(${n(1 - (dir === "ne" ? alpha / 2 : alpha))}, ${df})`),
      excel: raw ? code(`from scipy.stats import ttest_1samp; ttest_1samp([${xs.map(v => n(v, dec)).join(", ")}], ${mu0}, alternative=${PYALT[dir]})`) : code(`from scipy.stats import t; ts = (${xS} - ${mu0})/(${sS}/${nn}**0.5); ${dir === "gt" ? `t.sf(ts, ${df})` : dir === "lt" ? `t.cdf(ts, ${df})` : `2 * t.sf(abs(ts), ${df})`}`)
    };
  }

  // ---- one-proportion z test ----
  const ZCTX = [
    { what: "parts that are defective", p0: 0.1 }, { what: "wafers that pass final inspection", p0: 0.9 }, { what: "solder joints that fail a thermal-cycling test", p0: 0.05 },
    { what: "orders shipped late", p0: 0.08 }, { what: "sensors that need recalibration within a year", p0: 0.2 }, { what: "users who adopt the new software release", p0: 0.4 },
    { what: "castings with porosity", p0: 0.15 }
  ];
  function pTest() {
    const c = R.pick(ZCTX), dir = R.pick(["gt", "lt", "ne"]), alpha = R.pick([0.01, 0.05, 0.1]);
    let nn; do { nn = R.pick([100, 150, 200, 250, 300, 400, 500, 800, 1000]); } while (nn * c.p0 < 10 || nn * (1 - c.p0) < 10);
    const se = Math.sqrt(c.p0 * (1 - c.p0) / nn);
    const shift = (dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1])) * R.int(10, 320) / 100;
    const X = Math.max(1, Math.min(nn - 1, Math.round(nn * (c.p0 + shift * se))));
    const ph = X / nn, z = (ph - c.p0) / se, zs = zCrit(alpha, dir), reject = IN_RR(S.round(z, 2), dir, zs), pz = zPvPart(z, dir);
    if ((pz.p < alpha) !== reject || Math.abs(Math.abs(S.round(z, 2)) - zs) < 0.006) return pTest();
    const zWrong = (ph - c.p0) / Math.sqrt(ph * (1 - ph) / nn), zsOther = zCrit(alpha, dir === "ne" ? "gt" : "ne");
    return {
      prompt: `<p>Test whether the proportion of all ${c.what} is <strong>${WORD[dir]} ${n(c.p0)}</strong>. In a random sample of ${nn}, ${X} are ${c.what}. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "num", label: "\\(\\hat p\\)", answer: ph, tol: 0.00051, show: f4(ph), mistakes: [] },
        { type: "num", label: "Test statistic \\(z\\) (2 decimals)", answer: z, tol: 0.011, show: S.fmt(z, 2),
          mistakes: [{ value: zWrong, tol: 0.011, msg: "You used \\(\\hat p\\) in the standard error. The test assumes \\(H_0\\), so use \\(\\sqrt{p_0(1-p_0)/n}\\)." }, { value: -z, tol: 0.011, msg: "Sign reversed: compute \\(\\hat p - p_0\\)." }] },
        { type: "num", method: "cv", label: `Critical value \\(${ZL(dir)}\\) (z table)`, answer: zs, tol: 0.0015, show: zs.toFixed(3),
          mistakes: [{ value: zsOther, tol: 0.0015, msg: dir === "ne" ? "Two-sided: use \\(z_{\\alpha/2}\\), not \\(z_\\alpha\\)." : "One-sided: use \\(z_\\alpha\\), not \\(z_{\\alpha/2}\\)." }, { value: -zs, tol: 0.0015, msg: "Enter the critical value as a positive number; the minus sign goes in the rejection rule." }] },
        DEC("cv", reject, alpha, `Rejection region: ${RULE(dir, zs.toFixed(3))}. \\(z = ${S.fmt(z, 2).replace("−", "-")}\\) is ${reject ? "in" : "not in"} it.`),
        pz.part,
        DEC("pv", reject, alpha, `p-value = ${P4(pz.p)} is ${reject ? "less than" : "greater than"} \\(\\alpha = ${alpha}\\).`)
      ],
      hand: [
        T`\(H_0: p = ${n(c.p0)}\) versus \(H_a: p ${SYM[dir]} ${n(c.p0)}\).`,
        T`Conditions: random sample; \(np_0 = ${n(nn * c.p0)}\) and \(n(1-p_0) = ${n(nn * (1 - c.p0))}\), both at least 10.`,
        T`\(\hat p = ${X}/${nn} = ${f4(ph)}\). \(z = \dfrac{${f4(ph)} - ${n(c.p0)}}{\sqrt{${n(c.p0)}(${n(1 - c.p0)})/${nn}}} = \dfrac{${f4(ph - c.p0)}}{${f4(se)}} = ${S.fmt(z, 4).replace("−", "-")} \approx ${S.fmt(z, 2).replace("−", "-")}\).`,
        ...zSteps(z, dir, alpha, zs, reject, pz),
        `There ${reject ? "is" : "is not"} sufficient evidence at the \\(\\alpha = ${alpha}\\) level that the proportion of ${c.what} is ${WORD[dir]} ${n(c.p0)}.`
      ],
      figure: RRPlot.svg({ dist: "z", dir, crit: zs, ts: S.round(z, 2), alpha }),
      after: "Both methods always give the same decision. Use the switch above the steps to answer with either one.",
      ti: code(`prop.test(${X}, ${nn}, p = ${n(c.p0)}, alternative = ${ALT[dir]}, correct = FALSE)  # X-squared = z^2`),
      excel: code(`from statsmodels.stats.proportion import proportions_ztest; proportions_ztest(${X}, ${nn}, ${n(c.p0)}, alternative=${dir === "gt" ? '"larger"' : dir === "lt" ? '"smaller"' : '"two-sided"'}, prop_var=${n(c.p0)})`)
    };
  }

  // ---- p-value from a test statistic ----
  function pvalue() {
    const isZ = R.coin(), dir = R.pick(["gt", "lt", "ne"]), alpha = R.pick([0.01, 0.05, 0.1]);
    const nn = isZ ? R.pick([45, 60, 100, 200, 500]) : R.int(5, 40), df = nn - 1;
    const sign = dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1]), ts = S.round(sign * R.int(isZ ? 30 : 40, isZ ? 330 : 420) / 100, isZ ? 2 : 3);
    const V = isZ ? "Z" : "T", c = isZ ? zCrit(alpha, dir) : tCrit(df, alpha, dir), reject = IN_RR(ts, dir, c);
    const pp = isZ ? zPvPart(ts, dir) : tPvPart(ts, dir, df), pval = isZ ? pp.p : pp.exact;
    if ((pval < alpha) !== reject || (!isZ && pp.b.lo < alpha && alpha < pp.b.hi)) return pvalue();
    const tsS = String(ts).replace("-", "−");
    const areas = [`${PFORM("gt", V, ts)}, the area to the right of TS`, `${PFORM("lt", V, ts)}, the area to the left of TS`, `${PFORM("ne", V, ts)}, both tails`];
    const ans = ["gt", "lt", "ne"].indexOf(dir);
    pp.part.method = undefined;
    return {
      prompt: `<p>A test of \\(H_0: \\mu = \\mu_0\\) versus \\(H_a: \\mu ${SYM[dir]} \\mu_0\\) uses ${isZ ? `a large random sample (n = ${nn} > 40)` : `a random sample of ${nn} from a normal population (df = ${df})`} and gives the test statistic ${isZ ? "z" : "t"} = ${tsS}. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "choice", label: "Which area is the p-value?", options: areas, answer: ans, fixed: true,
          why: Object.fromEntries([0, 1, 2].filter(i => i !== ans).map(i => [i, i === 2 ? "Only a two-sided \\(H_a\\) (≠) uses both tails." : dir === "ne" ? "\\(H_a\\) is ≠, so the p-value counts both tails: double one tail." : `The p-value follows the direction of \\(H_a\\): ${dir === "gt" ? "> means the area to the right" : "< means the area to the left"}.`])) },
        pp.part,
        DEC(undefined, reject, alpha, `p-value ${isZ ? "= " + P4(pp.p) : ": " + BR(pp.b)} is ${reject ? "less than" : "greater than"} \\(\\alpha = ${alpha}\\).`)
      ],
      hand: [
        `\\(H_a\\) has ${dir === "gt" ? ">" : dir === "lt" ? "<" : "≠"}, so p-value = ${PFORM(dir, V, ts)}${dir === "ne" ? ": double the tail beyond |TS|" : ""}.`,
        isZ ? `Normal table: the left area at \\(z = ${pp.zr.toFixed(2)}\\) is ${pp.left.toFixed(4)}, so p-value = ${dir === "gt" ? `1 − ${pp.left.toFixed(4)} = ` : dir === "ne" ? `2 × ${Math.min(pp.left, 1 - pp.left).toFixed(4)} = ` : ""}${P4(pp.p)}.`
          : `t table, row df = ${df}: ${S.fmt(Math.abs(ts), 3)} falls between the table values whose column areas give ${BR(pp.b)}${dir === "ne" ? " after doubling" : ""}. Exactly (software), p-value = ${P4(pp.exact)}.`,
        `p-value ${reject ? "<" : ">"} \\(\\alpha = ${alpha}\\), so ${reject ? "reject" : "fail to reject"} \\(H_0\\). The critical-value method agrees: the critical value is ${c.toFixed(3)}, and TS is ${reject ? "" : "not "}in the rejection region.`
      ],
      figure: RRPlot.svg({ dist: isZ ? "z" : "t", df: isZ ? null : df, dir, crit: c, ts, alpha, mode: "pv" }),
      ti: isZ ? code(dir === "gt" ? `1 - pnorm(${pp.zr.toFixed(2)})` : dir === "lt" ? `pnorm(${pp.zr.toFixed(2)})` : `2 * (1 - pnorm(${Math.abs(pp.zr).toFixed(2)}))`)
        : code(dir === "gt" ? `1 - pt(${ts}, ${df})` : dir === "lt" ? `pt(${ts}, ${df})` : `2 * (1 - pt(${Math.abs(ts)}, ${df}))`),
      excel: isZ ? code(dir === "gt" ? `from scipy.stats import norm; norm.sf(${pp.zr.toFixed(2)})` : dir === "lt" ? `from scipy.stats import norm; norm.cdf(${pp.zr.toFixed(2)})` : `from scipy.stats import norm; 2 * norm.sf(${Math.abs(pp.zr).toFixed(2)})`)
        : code(dir === "gt" ? `from scipy.stats import t; t.sf(${ts}, ${df})` : dir === "lt" ? `from scipy.stats import t; t.cdf(${ts}, ${df})` : `from scipy.stats import t; 2 * t.sf(${Math.abs(ts)}, ${df})`)
    };
  }

  // ---- Type I and Type II errors; the α–β trade-off ----
  const ECTX = [["the mean activation temperature is 130 °F", "\\mu = 130"], ["the defect rate is 0.10", "p = 0.10"], ["the mean zinc intake is 15 mg/day", "\\mu = 15"],
    ["the mean weld strength is 480 MPa", "\\mu = 480"], ["the solder failure rate is 0.05", "p = 0.05"]];
  function errors() {
    const kind = R.int(0, 2), ctx = R.pick(ECTX);
    if (kind === 0) {
      const rejected = R.coin(), truthNull = R.coin();
      const fixAns = rejected ? (truthNull ? 0 : 2) : (truthNull ? 2 : 1);
      const opts = ["Type I error", "Type II error", "Correct decision"];
      const why = `Decision: ${rejected ? "reject" : "fail to reject"} \\(H_0\\). Truth: \\(H_0\\) is ${truthNull ? "true" : "false"}. ${fixAns === 0 ? "Rejecting a true null is a Type I error." : fixAns === 1 ? "Failing to reject a false null is a Type II error." : "The decision matches the truth."}`;
      return {
        prompt: `<p>An engineer tests \\(H_0: ${ctx[1]}\\) (${ctx[0]}) and <strong>${rejected ? "rejects" : "fails to reject"}</strong> \\(H_0\\). Later, a full audit shows that \\(H_0\\) is actually <strong>${truthNull ? "true" : "false"}</strong>.</p>`,
        parts: [
          { type: "choice", label: "The decision was", options: opts, answer: fixAns, fixed: true, why: Object.fromEntries([0, 1, 2].filter(i => i !== fixAns).map(i => [i, why])) },
          { type: "choice", label: "The probability of a Type I error is", options: ["α", "β", "1 − β", "the p-value"], answer: 0, fixed: true, why: { 1: "β is P(Type II error).", 2: "1 − β is the power.", 3: "The p-value depends on the data; α is fixed before the test." } }
        ],
        hand: ["Type I: reject a true \\(H_0\\), probability α. Type II: fail to reject a false \\(H_0\\), probability β.", why]
      };
    }
    if (kind === 1) {
      const rejected = R.coin();
      return {
        prompt: `<p>A test of \\(H_0: ${ctx[1]}\\) ${rejected ? "rejects" : "fails to reject"} \\(H_0\\). The truth is unknown. Which error could have been made?</p>`,
        parts: [{ type: "choice", label: "Possible error", options: ["Type I error only", "Type II error only", "Either type"], answer: rejected ? 0 : 1, fixed: true,
          why: { [rejected ? 1 : 0]: rejected ? "A Type II error requires failing to reject. Having rejected, only a Type I error is possible." : "A Type I error requires rejecting. Having failed to reject, only a Type II error is possible.", 2: "Each decision allows only one kind of error." } }],
        hand: [rejected ? "Rejecting \\(H_0\\) is wrong only if \\(H_0\\) is true: a Type I error." : "Failing to reject is wrong only if \\(H_0\\) is false: a Type II error."]
      };
    }
    const [a1, a2] = R.pick([[0.05, 0.01], [0.10, 0.05], [0.10, 0.01], [0.01, 0.05], [0.05, 0.10]]), down = a2 < a1;
    return {
      prompt: `<p>A test of \\(H_0: ${ctx[1]}\\) keeps the same sample size n and the same test statistic, but the significance level is changed from α = ${a1} to α = ${a2}.</p>`,
      parts: [
        { type: "choice", label: "The rejection region becomes", options: ["smaller", "larger", "unchanged"], answer: down ? 0 : 1, fixed: true, why: { [down ? 1 : 0]: `A ${down ? "smaller" : "larger"} α puts ${down ? "less" : "more"} area in the tail(s), so the critical value moves ${down ? "out" : "in"}.`, 2: "The rejection region is set by α." } },
        { type: "choice", label: "β, the probability of a Type II error,", options: ["increases", "decreases", "is unchanged"], answer: down ? 0 : 1, fixed: true, why: { [down ? 1 : 0]: `With n fixed, ${down ? "decreasing" : "increasing"} α ${down ? "increases" : "decreases"} β: the two error probabilities trade off.`, 2: "β depends on the rejection region, which changes with α." } }
      ],
      hand: [`${down ? "Decreasing" : "Increasing"} α ${down ? "shrinks" : "enlarges"} the rejection region.`, `Proposition: with n and the test statistic fixed, decreasing α increases β (and increasing α decreases β). Only a larger n lowers both.`]
    };
  }

  // ---- decision and conclusion from a test statistic ----
  const DCTX = [["p", "proportion of defective parts", "0.10", "gt"], ["\\mu", "mean zinc intake", "15 mg/day", "lt"], ["\\mu", "mean activation temperature", "130 °F", "ne"],
    ["p", "proportion of wafers passing inspection", "0.90", "ne"], ["\\mu", "mean battery life", "500 cycles", "gt"], ["\\mu", "mean weld strength", "480 MPa", "lt"]];
  function decide() {
    const alpha = R.pick([0.01, 0.05, 0.1]), [par, ctx, v, dir] = R.pick(DCTX);
    const isP = par === "p", useT = !isP && R.coin(), nn = isP ? R.pick([200, 400, 500, 800]) : useT ? R.int(8, 40) : R.pick([50, 64, 100, 120]), df = nn - 1;
    const c = useT ? tCrit(df, alpha, dir) : zCrit(alpha, dir);
    const mag = S.round(c + R.pick([-1, 1]) * R.pick([0.12, 0.35, 0.7, 1.1]), 2), sign = dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1]);
    const ts = S.round(sign * Math.max(0.05, mag), 2), reject = IN_RR(ts, dir, c), pp = useT ? tPvPart(ts, dir, df) : zPvPart(ts, dir), pval = useT ? pp.exact : pp.p;
    if ((pval < alpha) !== reject || (useT && pp.b.lo < alpha && alpha < pp.b.hi)) return decide();
    const opts = [
      `Reject H₀. There is sufficient evidence at the ${alpha} level that the ${ctx} is ${WORD[dir]} ${v}.`,
      `Fail to reject H₀. There is not sufficient evidence at the ${alpha} level that the ${ctx} is ${WORD[dir]} ${v}.`,
      `Reject H₀. This proves the ${ctx} is ${WORD[dir]} ${v}.`,
      `Accept H₀. The ${ctx} equals ${v}.`
    ];
    const ans = reject ? 0 : 1, crL = useT ? TL(dir, df) : ZL(dir);
    const whyBase = { 2: "A test never proves anything; it measures the strength of evidence.", 3: "We never 'accept' H₀. Not finding evidence against it is not proof that it is true." };
    return {
      prompt: `<p>A test of \\(H_0: ${par} = \\) ${v} versus \\(H_a: ${par} ${SYM[dir]}\\) ${v} uses ${useT ? `a random sample of ${nn} from a normal population (df = ${df}) and gives \\(t = ${ts}\\)` : `a random sample of ${nn} and gives \\(z = ${ts}\\)`}. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "num", method: "cv", label: `Critical value \\(${crL}\\)`, answer: c, tol: 0.0015, show: c.toFixed(3),
          mistakes: [{ value: useT ? tCrit(df, alpha, dir === "ne" ? "gt" : "ne") : zCrit(alpha, dir === "ne" ? "gt" : "ne"), tol: 0.0015, msg: dir === "ne" ? "Two-sided: use the column α/2." : "One-sided: use the column α." }] },
        { type: "choice", method: "cv", label: "Decision and conclusion", options: opts, answer: ans, why: Object.assign({ [1 - ans]: `Rejection region: ${RULE(dir, c.toFixed(3))}. The test statistic ${ts} is ${reject ? "in" : "not in"} it.` }, whyBase) },
        pp.part,
        { type: "choice", method: "pv", label: "Decision and conclusion", options: opts, answer: ans, why: Object.assign({ [1 - ans]: `p-value ${useT ? ": " + BR(pp.b) : "= " + P4(pp.p)} is ${reject ? "less than" : "greater than"} \\(\\alpha = ${alpha}\\).` }, whyBase) }
      ],
      hand: [`Critical value: ${useT ? `t table, row df = ${df}` : "z table"}, ${COL(alpha, dir)}, so \\(${crL} = ${c.toFixed(3)}\\). Reject \\(H_0\\) if ${RULE(dir, c.toFixed(3))}.`,
        `The test statistic ${ts} is ${reject ? "" : "not "}in the rejection region, so ${reject ? "reject" : "fail to reject"} \\(H_0\\).`,
        `<strong>p-value method:</strong> p-value = ${PFORM(dir, useT ? "T" : "Z", ts)}${useT ? `: in row df = ${df}, ${BR(pp.b)}; exactly ${P4(pp.exact)}` : ` = ${P4(pp.p)} (normal table, left area ${pp.left.toFixed(4)})`}. It is ${reject ? "less than" : "greater than"} \\(\\alpha = ${alpha}\\): the same decision.`,
        "Step 5: state the conclusion about \\(H_a\\), in context, without claiming proof."],
      figure: RRPlot.svg({ dist: useT ? "t" : "z", df, dir, crit: c, ts, alpha })
    };
  }

  HandKit.mount("#practice-app", {
    module: 8,
    skills: [
      { id: "m8-hypotheses", title: "Writing hypotheses", gen: hypotheses },
      { id: "m8-zsigma", title: "z test for μ (σ known)", gen: () => meanZ(false) },
      { id: "m8-largez", title: "Large-sample z test (n > 40)", gen: () => meanZ(true) },
      { id: "m8-ttest", title: "t test for μ", gen: tTest },
      { id: "m8-ptest", title: "z test for a proportion", gen: pTest },
      { id: "m8-pvalue", title: "p-value and decision", gen: pvalue },
      { id: "m8-errors", title: "Type I and Type II errors", gen: errors },
      { id: "m8-decide", title: "Decision and conclusion", gen: decide }
    ]
  });
})();
