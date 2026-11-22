/* Practice-exam bank, Module 8: Hypothesis Testing. By hand with the z and t tables; z rounded to 2 decimals. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, St = root.Stats, { o, n, tx, nums } = B;
  const ZA = { 0.1: 1.282, 0.05: 1.645, 0.025: 1.96, 0.01: 2.326, 0.005: 2.576 };
  const SY = { gt: '>', lt: '<', ne: '\\ne' }, W = { gt: 'greater than', lt: 'less than', ne: 'different from' };
  const left = z => St.tableNormal(z), pz = (z, d) => d === 'gt' ? S.round(1 - left(z), 4) : d === 'lt' ? left(z) : S.round(2 * Math.min(left(z), 1 - left(z)), 4);
  const crit = (a, d) => ZA[d === 'ne' ? a / 2 : a];
  const tcrit = (df, a, d) => St.round(St.tInv(1 - (d === 'ne' ? a / 2 : a), df), 3);

  B.MC(8, 'm8-hyp', () => { const c = R.pick([['the mean tensile strength of bolts is below the 800 MPa spec', '\\mu', 800, 'lt'], ['more than 10% of parts are defective', 'p', 0.1, 'gt'], ['the mean activation temperature differs from 130 °F', '\\mu', 130, 'ne'], ['kingfishers fly faster than 26 mph on average', '\\mu', 26, 'gt'], ['the failure rate is below 0.05', 'p', 0.05, 'lt']]);
    const h = d => `\\(H_0: ${c[1]} = ${c[2]}\\) vs \\(H_a: ${c[1]} ${SY[d]} ${c[2]}\\)`, others = ['gt', 'lt', 'ne'].filter(d => d !== c[3]);
    return { stem: `An engineer wants evidence that ${c[0]}. Which hypotheses should be tested?`, options: [o(h(c[3]), 4, 'Correct: the claim goes in \\(H_a\\); \\(H_0\\) has the equality.'), o(h(others[0]), 1, 'The direction of \\(H_a\\) must match the claim.'), o(h(others[1]), 1, 'The direction of \\(H_a\\) must match the claim.'), o(`\\(H_0: ${c[1]} ${SY[c[3]]} ${c[2]}\\) vs \\(H_a: ${c[1]} = ${c[2]}\\)`, 0, '\\(H_0\\) always contains the equality.')] }; });

  B.MC(8, 'm8-zstat', () => { const mu = R.pick([130, 100, 50]), sd = R.pick([1.5, 2, 4]), nn = R.pick([9, 16, 25, 36]), d = R.pick(['gt', 'lt', 'ne']), z0 = (d === 'lt' ? -1 : 1) * R.int(80, 280) / 100, xb = S.round(mu + z0 * sd / Math.sqrt(nn), 2), z = (xb - mu) / (sd / Math.sqrt(nn));
    return { stem: `A normal population has known σ = ${sd}. To test \\(H_0: \\mu = ${mu}\\) vs \\(H_a: \\mu ${SY[d]} ${mu}\\), a sample of n = ${nn} gives \\(\\bar x = ${xb}\\). What is the test statistic?`, numeric: true, options: nums([
      [z, 4, 'Correct: \\(z = (\\bar x - \\mu_0)/(\\sigma/\\sqrt n)\\).'], [(xb - mu) / sd, 1, 'Divide by \\(\\sigma/\\sqrt n\\), not σ.'], [(xb - mu) / (sd / nn), 1, 'Divide σ by \\(\\sqrt n\\), not n.'], [(xb - mu) / (sd * sd / Math.sqrt(nn)), 0, 'Use σ, not σ².']], 2) }; });

  B.MC(8, 'm8-crit', () => { const a = R.pick([0.01, 0.05, 0.1]), d = R.pick(['gt', 'lt', 'ne']), c = crit(a, d), other = ZA[d === 'ne' ? a : a / 2];
    return { stem: `For a large-sample z test of \\(H_a: \\mu ${SY[d]} \\mu_0\\) at α = ${a}, what is the rejection region?`, options: [
      o(d === 'gt' ? `\\(z \\ge ${c}\\)` : d === 'lt' ? `\\(z \\le -${c}\\)` : `\\(|z| \\ge ${c}\\)`, 4, `Correct: ${d === 'ne' ? '\\(z_{\\alpha/2}\\), both tails' : '\\(z_\\alpha\\), in the direction of \\(H_a\\)'}.`),
      o(d === 'gt' ? `\\(z \\ge ${other}\\)` : d === 'lt' ? `\\(z \\le -${other}\\)` : `\\(|z| \\ge ${other}\\)`, 2, d === 'ne' ? 'Two-sided: split α, using \\(z_{\\alpha/2}\\).' : 'One-sided: all of α goes in one tail, \\(z_\\alpha\\).'),
      o(d === 'gt' ? `\\(z \\le -${c}\\)` : d === 'lt' ? `\\(z \\ge ${c}\\)` : `\\(|z| \\le ${c}\\)`, 1, 'The rejection region lies in the direction of \\(H_a\\), away from \\(H_0\\).'),
      o(`\\(z \\ge ${a}\\)`, 0, 'α is an area, not a critical value.')] }; });

  B.MC(8, 'm8-pv', () => { const d = R.pick(['gt', 'lt', 'ne']), z = S.round((d === 'lt' ? -1 : d === 'gt' ? 1 : R.pick([-1, 1])) * R.int(50, 290) / 100, 2), p = pz(z, d);
    return { stem: `A z test of \\(H_a: \\mu ${SY[d]} \\mu_0\\) gives z = ${n(z, 2)}. What is the p-value (normal table)?`, numeric: true, options: nums([
      [p, 4, 'Correct.'], [d === 'ne' ? p / 2 : Math.min(1, 2 * p), 2, d === 'ne' ? 'Two-sided: double the tail area.' : 'One-sided: do not double.'], [S.round(1 - (d === 'ne' ? p / 2 : p), 4), 1, 'That is the area on the wrong side.'], [Math.abs(z) / 10, 0, 'The p-value is a tail area from the table.']], 4) }; });

  B.MC(8, 'm8-tcrit', () => { const nn = R.int(6, 30), a = R.pick([0.01, 0.05, 0.1]), d = R.pick(['gt', 'lt', 'ne']), c = tcrit(nn - 1, a, d);
    return { stem: `A t test of \\(H_a: \\mu ${SY[d]} \\mu_0\\) uses n = ${nn} from a normal population at α = ${a}. What is the critical value (positive)?`, numeric: true, options: nums([
      [c, 4, `Correct: row df = ${nn - 1}, column ${d === 'ne' ? 'α/2' : 'α'}.`], [tcrit(nn, a, d), 2, 'Use df = n − 1, not n.'], [tcrit(nn - 1, a, d === 'ne' ? 'gt' : 'ne'), 2, d === 'ne' ? 'Two-sided: use α/2.' : 'One-sided: use α.'], [crit(a, d), 1, 'With n ≤ 40 and σ unknown, use t, not z.']], 3) }; });

  B.MC(8, 'm8-ptest', () => { const p0 = R.pick([0.1, 0.2, 0.05]), nn = R.pick([200, 400, 500]), x = Math.round(nn * p0 + R.pick([-1, 1]) * R.int(4, 15)), ph = x / nn, se = Math.sqrt(p0 * (1 - p0) / nn), z = (ph - p0) / se;
    return { stem: `${x} of ${nn} sampled parts are defective. For \\(H_0: p = ${p0}\\), what is the test statistic?`, numeric: true, options: nums([
      [z, 4, 'Correct: the SE uses \\(p_0\\).'], [(ph - p0) / Math.sqrt(ph * (1 - ph) / nn), 2, 'The test SE uses \\(p_0\\), not \\(\\hat p\\).'], [(ph - p0) / (p0 * (1 - p0) / nn), 0, 'Take the square root for the SE.'], [(ph - p0) / Math.sqrt(p0 * (1 - p0)), 1, 'Divide by n inside the square root.']], 2) }; });

  B.MC(8, 'm8-errors', () => { const k = R.int(0, 2);
    if (k === 0) return { stem: 'A Type II error occurs when we', options: [o('fail to reject \\(H_0\\) when \\(H_0\\) is false', 4, 'Correct: probability β.'), o('reject \\(H_0\\) when \\(H_0\\) is true', 1, 'That is a Type I error.'), o('reject \\(H_0\\) when \\(H_0\\) is false', 0, 'That is a correct decision.'), o('fail to reject \\(H_0\\) when \\(H_0\\) is true', 0, 'That is a correct decision.')] };
    if (k === 1) return { stem: 'With the sample size fixed, an engineer lowers α from 0.05 to 0.01. What happens to β?', options: [o('β increases', 4, 'Correct: a smaller rejection region makes failing to reject a false \\(H_0\\) more likely.'), o('β decreases', 1, 'α and β trade off when n is fixed.'), o('β stays the same', 1, 'β depends on the rejection region, which changes.'), o('β becomes 0.99', 0, 'β is not 1 − α.')] };
    return { stem: 'A test rejects \\(H_0\\). Which error could have been made?', options: [o('Type I only', 4, 'Correct: only rejecting a true \\(H_0\\) is possible.'), o('Type II only', 1, 'A Type II error needs a failure to reject.'), o('Either type', 1, 'Each decision allows only one error type.'), o('Neither: the test proved \\(H_a\\)', 0, 'A test never proves a hypothesis.')] }; });

  B.MC(8, 'm8-concl', () => { const a = R.pick([0.01, 0.05, 0.1]), p = S.round(R.pick([a / 4, a / 2, a * 2, a * 4]), 4), rej = p < a, ctx = R.pick(['the mean zinc intake is below 15 mg/day', 'the defect rate differs from 0.10', 'the mean activation temperature differs from 130 °F']);
    return { stem: `A test gives p-value = ${p} at α = ${a}. \\(H_a\\) says ${ctx}. Which conclusion is correct?`, options: [
      o(rej ? `Reject \\(H_0\\): there is sufficient evidence that ${ctx}.` : `Fail to reject \\(H_0\\): there is not sufficient evidence that ${ctx}.`, 4, `Correct: the p-value is ${rej ? 'less' : 'greater'} than α.`),
      o(rej ? `Fail to reject \\(H_0\\): there is not sufficient evidence that ${ctx}.` : `Reject \\(H_0\\): there is sufficient evidence that ${ctx}.`, 0, 'Reject only when the p-value is less than α.'),
      o(rej ? `Reject \\(H_0\\): the data prove that ${ctx}.` : `Accept \\(H_0\\): the data prove \\(H_0\\) is true.`, 2, 'Right decision, but a test never proves anything.'),
      o(`The p-value is the probability that \\(H_0\\) is true, so ${rej ? 'reject' : 'keep'} \\(H_0\\).`, 0, 'The p-value assumes \\(H_0\\) is true; it is not P(\\(H_0\\) true).')] }; });

  B.FR(8, 'm8-fr-z', () => {
    const p0 = R.pick([0.1, 0.05, 0.2]), nn = R.pick([200, 300, 400]), a = R.pick([0.05, 0.01]), x = Math.round(nn * p0 + R.int(6, 18)), ph = x / nn, se = Math.sqrt(p0 * (1 - p0) / nn), z = (ph - p0) / se, zr = S.round(z, 2), p = pz(zr, 'ne'), c = crit(a, 'ne'), rej = p < a;
    return {
      stem: `A manufacturer claims ${n(p0 * 100)}% of its parts are defective. An inspector samples ${nn} parts and finds ${x} defective. Test the claim at α = ${a} (two-sided).`,
      parts: [
        { type: 'num', label: '\\(\\hat p\\)', answer: ph, mistakes: [] },
        { type: 'num', label: 'Test statistic z (2 decimals)', answer: z, tol: 0.011, mistakes: [{ value: (ph - p0) / Math.sqrt(ph * (1 - ph) / nn), msg: 'The test SE uses \\(p_0\\).' }] },
        { type: 'num', label: `Critical value \\(z_{\\alpha/2}\\)`, answer: c, tol: 0.0015, mistakes: [{ value: ZA[a], msg: 'Two-sided: use α/2.' }] },
        { type: 'num', label: 'p-value (normal table)', answer: p, tol: 0.00051, mistakes: [{ value: p / 2, msg: 'Two-sided: double the tail area.' }] }],
      written: { prompt: 'Check the conditions, state the decision, and give the conclusion in context.',
        keys: [`Checks \\(np_0 = ${n(nn * p0)} \\ge 10\\) and \\(n(1-p_0) = ${n(nn * (1 - p0))} \\ge 10\\) (random sample).`, `${rej ? 'Rejects' : 'Fails to reject'} \\(H_0\\) (|z| = ${n(Math.abs(zr), 2)} ${rej ? '≥' : '<'} ${c}, p-value ${rej ? '<' : '>'} ${a}) and states it in context.`],
        model: `Conditions: \\(np_0 = ${n(nn * p0)}\\) and \\(n(1-p_0) = ${n(nn * (1 - p0))}\\) are both at least 10. Since ${rej ? `|z| = ${n(Math.abs(zr), 2)} ≥ ${c} (p-value = ${p} < ${a})` : `|z| = ${n(Math.abs(zr), 2)} < ${c} (p-value = ${p} > ${a})`}, we ${rej ? 'reject' : 'fail to reject'} \\(H_0\\). There ${rej ? 'is' : 'is not'} sufficient evidence at the ${a} level that the defect rate differs from ${n(p0)}.` },
      solution: [`\\(H_0: p = ${n(p0)}\\) vs \\(H_a: p \\ne ${n(p0)}\\).`, `\\(\\hat p = ${x}/${nn} = ${tx(ph)}\\); SE \\(= \\sqrt{${n(p0)}(${n(1 - p0)})/${nn}} = ${tx(se)}\\); \\(z = ${tx(z)} \\approx ${n(zr, 2)}\\).`, `Critical value ${c}; p-value \\(= 2P(Z > ${n(Math.abs(zr), 2)}) = ${p}\\). ${rej ? 'Reject' : 'Fail to reject'} \\(H_0\\).`],
      ti: `prop.test(${x}, ${nn}, p = ${n(p0)}, correct = FALSE)`,
      excel: `from statsmodels.stats.proportion import proportions_ztest; proportions_ztest(${x}, ${nn}, ${n(p0)}, prop_var=${n(p0)})`
    };
  });
  B.FR(8, 'm8-fr-t', function make() {
    const mu0 = R.pick([45, 480, 30, 120]), nn = R.int(8, 25), df = nn - 1, s = S.round(R.int(40, 120) / 10, 1), a = R.pick([0.05, 0.01]), d = R.pick(['gt', 'ne']), t0 = R.int(120, 420) / 100, xb = S.round(mu0 + t0 * s / Math.sqrt(nn), 2);
    const se = s / Math.sqrt(nn), t = (xb - mu0) / se, c = tcrit(df, a, d), rej = t >= c, exact = d === 'gt' ? 1 - St.tCDF(t, df) : 2 * (1 - St.tCDF(Math.abs(t), df));
    if (Math.abs(t - c) < 0.02) return make();
    return {
      stem: `A random sample of n = ${nn} from a normal population (σ unknown) gives \\(\\bar x = ${xb}\\) and s = ${s}. Test \\(H_0: \\mu = ${mu0}\\) vs \\(H_a: \\mu ${SY[d]} ${mu0}\\) at α = ${a}.`,
      parts: [
        { type: 'num', label: 'Standard error', answer: se, mistakes: [{ value: s / nn, msg: 'Divide s by \\(\\sqrt n\\).' }] },
        { type: 'num', label: 'Test statistic t', answer: t, tol: 0.006, mistakes: [{ value: (xb - mu0) / s, msg: 'Divide by the SE, not s.' }] },
        { type: 'num', label: 'Degrees of freedom', answer: df, tol: 0.01, mistakes: [{ value: nn, msg: 'df = n − 1.' }] },
        { type: 'num', label: `Critical value from the t table`, answer: c, tol: 0.0015, mistakes: [{ value: tcrit(nn, a, d), msg: 'Use df = n − 1.' }, { value: tcrit(df, a, d === 'ne' ? 'gt' : 'ne'), msg: d === 'ne' ? 'Two-sided: use α/2.' : 'One-sided: use α.' }] }],
      written: { prompt: 'State the decision with the rejection region and give the conclusion in context. Why is t used?',
        keys: [`${rej ? 'Rejects' : 'Fails to reject'} \\(H_0\\): t = ${tx(t)} is ${rej ? '' : 'not '}in the rejection region ${d === 'gt' ? `t ≥ ${c}` : `|t| ≥ ${c}`}; conclusion about \\(H_a\\) in context.`, 'Explains t: normal population, σ unknown, n ≤ 40, df = n − 1.'],
        model: `t = ${tx(t)} with df = ${df}. The rejection region is ${d === 'gt' ? `t ≥ ${c}` : `|t| ≥ ${c}`}, so we ${rej ? 'reject' : 'fail to reject'} \\(H_0\\): there ${rej ? 'is' : 'is not'} sufficient evidence at the ${a} level that the mean is ${W[d]} ${mu0}. (p-value ≈ ${S.num(exact, 4)}.) We use t because the population is normal, σ is unknown, and n = ${nn} ≤ 40.` },
      solution: [`SE \\(= ${s}/\\sqrt{${nn}} = ${tx(se)}\\); \\(t = (${xb} - ${mu0})/${tx(se)} = ${tx(t)}\\).`, `df = ${df}; critical value ${c} (column ${d === 'ne' ? 'α/2' : 'α'}).`, `${rej ? 'Reject' : 'Fail to reject'} \\(H_0\\).`],
      ti: `t <- (${xb} - ${mu0})/(${s}/sqrt(${nn})); qt(${n(1 - (d === 'ne' ? a / 2 : a))}, ${df}); ${d === 'gt' ? `1 - pt(t, ${df})` : `2*(1 - pt(abs(t), ${df}))`}`,
      excel: `from scipy.stats import t; ts = (${xb} - ${mu0})/(${s}/${nn}**0.5); t.ppf(${n(1 - (d === 'ne' ? a / 2 : a))}, ${df}), ${d === 'gt' ? `t.sf(ts, ${df})` : `2*t.sf(abs(ts), ${df})`}`
    };
  });
})(globalThis);
