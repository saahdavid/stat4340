/* Practice-exam bank, Module 7: Confidence Intervals. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, St = root.Stats, { o, n, tx, nums } = B;
  const Z = { 90: 1.645, 95: 1.96, 99: 2.576 }, Z1 = { 90: 1.282, 95: 1.645, 99: 2.326 };

  B.MC(7, 'm7-zint', () => { const sd = R.pick([2, 4, 5]), nn = R.pick([25, 64, 100]), xb = R.int(250, 320) / 10, c = R.pick([90, 95, 99]), me = Z[c] * sd / Math.sqrt(nn);
    return { stem: `MPG is normal with σ = ${sd}. A sample of ${nn} cars has \\(\\bar x = ${xb}\\). What is the upper endpoint of a ${c}% confidence interval for μ?`, numeric: true, options: nums([
      [xb + me, 4, 'Correct: \\(\\bar x + z_{\\alpha/2}\\sigma/\\sqrt n\\).'], [xb + Z[c] * sd, 2, 'Divide σ by √n.'], [xb + Z1[c] * sd / Math.sqrt(nn), 2, 'A two-sided interval uses \\(z_{\\alpha/2}\\), not \\(z_\\alpha\\).'], [xb + sd / Math.sqrt(nn), 0, 'Multiply the SE by the critical value.']], 3) }; });
  B.MC(7, 'm7-which', () => { const sc = R.pick([
      ['A random sample of 12 weld strengths from a normal population, σ unknown.', 1], ['A random sample of 80 battery lives, σ unknown, shape unknown.', 0], ['A random sample of 15 voltages from a normal population with known σ = 0.5.', 0], ['A random sample of 30 resistances from a normal population; the goal is to estimate their variability σ.', 2]]);
    const opts = ['z interval', 't interval with df = n − 1', 'chi-squared interval', 'Wald interval for p'], why = ['used when σ is known, or for n > 40', 'used for μ when n ≤ 40, σ unknown, and the population is normal', 'used for σ² or σ', 'used for a population proportion'];
    return { stem: `${sc[0]} Which interval should be used?`, options: opts.map((t, i) => i === sc[1] ? o(t, 4, `Correct: ${why[i]}.`) : o(t, i < 2 && sc[1] < 2 ? 2 : 0, `The ${t} is ${why[i]}.`)) }; });
  B.MC(7, 'm7-tcrit', () => { const nn = R.int(6, 25), c = R.pick([90, 95, 99]), tc = St.tCritical(nn - 1, c / 100);
    return { stem: `What critical value is used for a ${c}% t interval with n = ${nn}?`, numeric: true, options: nums([
      [tc, 4, `Correct: row df = ${nn - 1}, column α/2 = ${n((100 - c) / 200)}.`], [St.tCritical(nn, c / 100), 2, 'Use df = n − 1, not n.'], [Z[c], 1, 'That is the z value; with n ≤ 40 and σ unknown use t.'], [St.round(St.tInv(1 - (100 - c) / 100, nn - 1), 3), 1, 'Use the column α/2, not α.']], 3) }; });
  B.MC(7, 'm7-wald', () => { const nn = R.pick([200, 400]), x = R.int(Math.round(nn * .3), Math.round(nn * .7)), p = x / nn, se = Math.sqrt(p * (1 - p) / nn);
    return { stem: `${x} of ${nn} surveyed customers are satisfied. What is the lower endpoint of the 95% Wald interval for p?`, numeric: true, options: nums([
      [p - 1.96 * se, 4, 'Correct: \\(\\hat p - 1.96\\sqrt{\\hat p(1-\\hat p)/n}\\).'], [p - 1.645 * se, 2, 'For 95% use 1.96.'], [p - 1.96 * p * (1 - p) / nn, 1, 'Take the square root for the SE.'], [p - se, 0, 'Multiply the SE by the critical value.']], 4) }; });
  B.MC(7, 'm7-width', () => {
    if (R.coin()) return { stem: 'With the same data, how does a 99% confidence interval compare with a 90% interval?', options: [
      o('It is wider, because its critical value is larger.', 4, 'Correct: more confidence costs width.'), o('It is narrower, because it is more confident.', 2, 'Reversed: higher confidence needs a larger critical value.'),
      o('Same width; only the center moves.', 1, 'Both intervals share the center x̄; the width changes.'), o('Not enough information', 0, 'The critical values alone decide this.', { last: true })] };
    return { stem: 'Holding the confidence level fixed, what happens to the margin of error when n is multiplied by 4?', options: [
      o('It is cut in half.', 4, 'Correct: ME ∝ 1/√n, and √4 = 2.'), o('It is divided by 4.', 2, 'ME depends on √n, not n.'), o('It doubles.', 0, 'A larger sample gives a smaller ME.'), o('It does not change.', 1, 'The SE shrinks as n grows.')] };
  });
  B.MC(7, 'm7-bound', () => { const nn = R.pick([64, 100]), s = R.int(20, 60) / 10, xb = R.int(400, 600) / 10;
    return { stem: `A sample of ${nn} parts has \\(\\bar x = ${xb}\\) and s = ${s}. What is the 95% lower confidence bound for μ?`, numeric: true, options: nums([
      [xb - 1.645 * s / Math.sqrt(nn), 4, 'Correct: \\(\\bar x - z_{0.05}s/\\sqrt n\\).'], [xb - 1.96 * s / Math.sqrt(nn), 2, 'A one-sided bound uses \\(z_\\alpha = 1.645\\).'], [xb + 1.645 * s / Math.sqrt(nn), 1, 'That is the upper bound.'], [xb - 1.645 * s, 0, 'Divide s by √n.']], 3) }; });
  B.MC(7, 'm7-chi', () => { const nn = R.pick([10, 16, 21, 25]), s = R.int(15, 40) / 10, v = (nn - 1) * s * s, hi = St.chiCritical(.025, nn - 1), lo = St.chiCritical(.975, nn - 1);
    return { stem: `A normal sample of n = ${nn} has s = ${s}. What is the upper endpoint of the 95% confidence interval for σ²?`, numeric: true, options: nums([
      [v / lo, 4, `Correct: \\((n-1)s^2/\\chi^2_{0.975,${nn - 1}} = ${n(v)}/${lo}\\).`], [v / hi, 2, 'That is the lower endpoint (divide by the larger χ² value).'], [nn * s * s / lo, 1, 'Multiply s² by n − 1.'], [Math.sqrt(v / lo), 1, 'That is the endpoint for σ.']], 3) }; });
  B.MC(7, 'm7-interp', () => ({ stem: 'A 95% confidence interval for the mean MPG is (27.6, 28.4). Which statement is correct?', options: [
    o('About 95% of intervals built this way would contain the true mean.', 4, 'Correct: the 95% describes the method.'), o('There is a 95% probability the true mean is in (27.6, 28.4).', 2, 'Close, but μ is fixed; this interval either contains it or not.'),
    o('95% of cars get between 27.6 and 28.4 MPG.', 1, 'The interval estimates the mean, not individual cars.'), o('The sample mean is in the interval with probability 0.95.', 0, 'The sample mean is always the center of the interval.')] }));

  B.FR(7, 'm7-tint', () => {
    const nn = R.int(8, 20), c = R.pick([90, 95, 99]), df = nn - 1, tc = St.tCritical(df, c / 100), s2 = R.int(10, 40) / 10, s = Math.sqrt(s2), xb = R.int(35, 60) / 10, se = s / Math.sqrt(nn), me = tc * se;
    return {
      stem: `Three-toed sloth speeds (meters per minute) are normal with unknown μ and σ. A random sample of n = ${nn} sloths has \\(\\bar x = ${xb}\\) and \\(s^2 = ${s2}\\).`,
      parts: [
        { type: 'num', label: 'Critical value', answer: tc, tol: 0.0015, mistakes: [{ value: Z[c], msg: 'Use t with df = n − 1.' }] },
        { type: 'num', label: 'Margin of error', answer: me, mistakes: [{ value: tc * s2 / Math.sqrt(nn), msg: 'Use s = √s².' }] },
        { type: 'num', label: `Lower endpoint (${c}%)`, answer: xb - me, mistakes: [] }, { type: 'num', label: `Upper endpoint (${c}%)`, answer: xb + me, mistakes: [] }],
      written: { prompt: 'Interpret the interval, and say why t (not z) is used.',
        keys: [`States: ${c}% confident the mean speed of all three-toed sloths is between the endpoints (in context, with units).`, `Explains t: n = ${nn} ≤ 40, σ unknown, normal population.`],
        model: `We are ${c}% confident that the mean speed of all three-toed sloths is between ${n(xb - me, 3)} and ${n(xb + me, 3)} meters per minute. We use t with df = ${df} because n ≤ 40, σ is unknown, and the population is normal.` },
      solution: [`df = ${df}; \\(t_{${n((100 - c) / 200)},${df}} = ${tc}\\).`, `\\(s = \\sqrt{${s2}} = ${tx(s)}\\), SE = ${tx(se)}.`, `ME = ${tx(me)}; interval \\((${tx(xb - me)},\\ ${tx(xb + me)})\\).`],
      ti: `${xb} + c(-1, 1) * qt(${(1 + c / 100) / 2}, ${df}) * sqrt(${s2})/sqrt(${nn})`,
      excel: `from scipy.stats import t; t.interval(${c / 100}, ${df}, loc=${xb}, scale=${s2}**0.5/${nn}**0.5)`
    };
  });
  B.FR(7, 'm7-prop', () => {
    const nn = R.pick([200, 300, 400, 500]), x = R.int(Math.round(nn * .25), Math.round(nn * .75)), p = x / nn, c = R.pick([90, 95, 99]), se = Math.sqrt(p * (1 - p) / nn), me = Z[c] * se;
    return {
      stem: `A company surveys ${nn} customers; ${x} are satisfied with a new product.`,
      parts: [
        { type: 'num', label: '\\(\\hat p\\)', answer: p, mistakes: [] }, { type: 'num', label: 'Standard error', answer: se, mistakes: [{ value: p * (1 - p) / nn, msg: 'Take the square root.' }] },
        { type: 'num', label: `Lower endpoint (${c}% Wald)`, answer: p - me, mistakes: [] }, { type: 'num', label: `Upper endpoint (${c}% Wald)`, answer: p + me, mistakes: [] }],
      written: { prompt: 'Check the conditions for the Wald interval and interpret it.',
        keys: [`Checks \\(n\\hat p = ${x} \\ge 10\\) and \\(n(1-\\hat p) = ${nn - x} \\ge 10\\) (and a random sample).`, `Interprets: ${c}% confident the proportion of all customers who are satisfied is between the endpoints.`],
        model: `There are ${x} satisfied and ${nn - x} not satisfied, both at least 10, and the sample is random. We are ${c}% confident that between ${S.num((p - me) * 100, 1)}% and ${S.num((p + me) * 100, 1)}% of all customers are satisfied.` },
      solution: [`\\(\\hat p = ${x}/${nn} = ${tx(p)}\\).`, `SE \\(= \\sqrt{${tx(p)}(${tx(1 - p)})/${nn}} = ${tx(se)}\\); \\(z = ${Z[c]}\\).`, `ME = ${tx(me)}; interval \\((${tx(p - me)},\\ ${tx(p + me)})\\).`],
      ti: `p <- ${x}/${nn}; p + c(-1, 1) * qnorm(${(1 + c / 100) / 2}) * sqrt(p*(1 - p)/${nn})`,
      excel: `from statsmodels.stats.proportion import proportion_confint; proportion_confint(${x}, ${nn}, alpha=${n(1 - c / 100, 2)}, method="normal")`
    };
  });
})(globalThis);
