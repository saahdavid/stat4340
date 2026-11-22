/* Practice-exam bank, Module 5: Joint Distributions and the CLT. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, { o, n, tx, nums, table } = B;
  const sum = a => a.reduce((s, v) => s + v, 0), tab = z => S.tableArea(z);
  const joint = () => { let w; do { w = Array.from({ length: 6 }, () => R.int(3, 30)); } while (sum(w) > 100); w[5] += 100 - sum(w); return [w.slice(0, 3).map(v => v / 100), w.slice(3).map(v => v / 100)]; };
  const jt = p => table(['\\(x\\) \\ \\(y\\)', '0', '1', '2'], [['0', ...p[0].map(v => n(v))], ['1', ...p[1].map(v => n(v))]]);

  B.MC(5, 'm5-marg', () => { const p = joint(), j = R.int(0, 2);
    return { stem: `X and Y have the joint PMF below. What is \\(P(Y = ${j})\\)?${jt(p)}`, numeric: true, options: nums([
      [p[0][j] + p[1][j], 4, 'Correct: add the column.'], [p[0][j], 2, 'That is one cell. The marginal adds the whole column.'], [sum(p[j % 2]), 1, 'That is a row sum, a marginal of X.'], [p[0][j] * p[1][j], 0, 'Add, do not multiply, the cells.']], 4) }; });
  B.MC(5, 'm5-jointevent', () => { const p = joint();
    return { stem: `X and Y have the joint PMF below. What is \\(P(X < Y)\\)?${jt(p)}`, numeric: true, options: nums([
      [p[0][1] + p[0][2] + p[1][2], 4, 'Correct: the cells (0,1), (0,2), (1,2).'], [p[0][1] + p[0][2], 2, 'Include (1, 2): 1 < 2.'], [p[0][0] + p[1][1], 1, 'Those are the cells where X = Y.'], [p[1][0], 0, 'That is the cell where X > Y.']], 4) }; });
  B.MC(5, 'm5-indep', () => ({ stem: 'X and Y have Cov(X, Y) = 0. Which statement must be true?', options: [
    o('X and Y are uncorrelated, but they may still be dependent.', 4, 'Correct. Independence implies zero covariance, but not the other way around.'),
    o('X and Y are independent.', 2, 'Zero covariance does not imply independence (for example, Y = X² with X symmetric about 0).'),
    o('Var(X + Y) = Var(X) + Var(Y) + 2.', 0, 'With zero covariance, Var(X + Y) = Var(X) + Var(Y).'),
    o('E(XY) = 0.', 1, 'Cov = 0 means E(XY) = E(X)E(Y), which need not be 0.')] }));
  B.MC(5, 'm5-covcalc', () => { const ex = R.int(2, 6), ey = R.int(3, 8), d = R.pick([-3, -2, 2, 3, 5]), exy = ex * ey + d;
    return { stem: `\\(E(X) = ${ex}\\), \\(E(Y) = ${ey}\\), and \\(E(XY) = ${exy}\\). What is \\(\\text{Cov}(3X, 2Y)\\)?`, numeric: true, options: nums([
      [6 * d, 4, 'Correct: \\(\\text{Cov}(aX, bY) = ab\\,\\text{Cov}(X, Y) = 6(' + d + ')\\).'], [d, 2, 'That is Cov(X, Y). Multiply by ab = 6.'], [36 * d, 1, 'Covariance scales by ab, not by (ab)².'], [exy, 0, 'Subtract E(X)E(Y) to get the covariance.']], 0) }; });
  B.MC(5, 'm5-vardiff', () => { const vx = R.int(4, 12), vy = R.int(3, 10), c = R.int(1, 3);
    return { stem: `\\(\\text{Var}(X) = ${vx}\\), \\(\\text{Var}(Y) = ${vy}\\), and \\(\\text{Cov}(X, Y) = ${c}\\). What is \\(\\text{Var}(X - Y)\\)?`, numeric: true, options: nums([
      [vx + vy - 2 * c, 4, 'Correct: \\(\\text{Var}(X)+\\text{Var}(Y)-2\\text{Cov}\\).'], [vx - vy - 2 * c, 2, 'Variances always add, even for a difference.'], [vx + vy + 2 * c, 2, 'For X − Y the covariance term is subtracted.'], [vx + vy, 1, 'Include the covariance term.']], 0) }; });
  B.MC(5, 'm5-se', () => { const v = R.pick([9, 16, 25, 36]), nn = R.pick([10, 16, 25]);
    return { stem: `A population has variance ${v}. What is the standard deviation of \\(\\bar X\\) for samples of size ${nn}?`, numeric: true, options: nums([
      [Math.sqrt(v / nn), 4, 'Correct: \\(\\sigma/\\sqrt n\\) with \\(\\sigma = \\sqrt{' + v + '}\\).'], [v / Math.sqrt(nn), 2, 'Use σ (the square root of the variance), not σ².'], [v / nn, 1, 'That is Var(x̄). Take its square root.'], [Math.sqrt(v), 0, 'That is σ for one observation.']], 4) }; });
  B.MC(5, 'm5-clt', () => { const mu = R.pick([450, 500]), sd = R.pick([21, 28, 35]), nn = 49, se = sd / 7, x = mu + R.pick([4, 5, 6]), z = (x - mu) / se;
    return { stem: `A population (shape unknown) has mean ${mu} and SD ${sd}. For a random sample of 49, what is \\(P(\\bar X > ${x})\\)? Round z to two decimals.`, numeric: true, options: nums([
      [1 - tab(z), 4, 'Correct: n = 49 > 40, so x̄ ≈ N(μ, σ²/n) with σ_x̄ = ' + n(se) + '.'], [1 - tab((x - mu) / sd), 2, 'Standardize with σ/√n, not σ: this is about a sample mean.'], [tab(z), 1, 'That is the left area. “Greater than” needs the right tail.'], [0.5, 0, 'Use the normal model for x̄.']], 4) }; });
  B.MC(5, 'm5-cltcond', () => ({ stem: R.pick(['A population of repair times is strongly right-skewed. For which sample size does our course allow the CLT for x̄?', 'Lifetimes of a component are not normal. For which sample size can x̄ be treated as approximately normal under our course rule?']), options: [
    o('n = 45', 4, 'Correct: our rule is n > 40.'), o('n = 35', 2, 'Close, but our course rule requires n > 40.'), o('n = 15', 1, 'Too small for a skewed population.'), o('Any n, because the CLT always applies', 0, 'The CLT needs a large n unless the population itself is normal.')] }));

  B.FR(5, 'm5-table', () => {
    const p = joint(), px = p.map(r => sum(r)), py = [0, 1, 2].map(j => p[0][j] + p[1][j]), ex = px[1], ey = py[1] + 2 * py[2], exy = p[1][1] + 2 * p[1][2], cv = exy - ex * ey;
    const vx = ex - ex * ex, vy = py[1] + 4 * py[2] - ey * ey, rho = cv / Math.sqrt(vx * vy);
    return {
      stem: `X (0 or 1) and Y (0, 1, or 2) have the joint PMF below.${jt(p)}`,
      parts: [
        { type: 'num', label: '\\(E(X)\\)', answer: ex, mistakes: [] },
        { type: 'num', label: '\\(E(Y)\\)', answer: ey, mistakes: [] },
        { type: 'num', label: '\\(\\text{Cov}(X,Y)\\)', answer: cv, mistakes: [{ value: exy, msg: 'Subtract E(X)E(Y).' }] },
        { type: 'num', label: '\\(\\rho_{X,Y}\\)', answer: rho, mistakes: [{ value: cv / (vx * vy), msg: 'Divide by the SDs, not the variances.' }] }],
      written: { prompt: 'Are X and Y independent? Justify with one cell of the table.',
        keys: [`Compares p(0,0) = ${n(p[0][0])} with \\(p_X(0)p_Y(0) = ${n(px[0] * py[0])}\\) (or another cell, or notes Cov ≠ 0).`, `Concludes ${Math.abs(cv) > 1e-9 ? 'dependent, since they differ (Cov ≠ 0 also shows dependence)' : 'based on whether every cell factors'}.`],
        model: `p(0,0) = ${n(p[0][0])}, but \\(p_X(0)p_Y(0) = ${n(px[0])}(${n(py[0])}) = ${n(px[0] * py[0])}\\). These differ, so X and Y are dependent.` },
      solution: [`Marginals: \\(p_X = (${px.map(v => tx(v)).join(', ')})\\), \\(p_Y = (${py.map(v => tx(v)).join(', ')})\\).`, `\\(E(X) = ${tx(ex)}\\), \\(E(Y) = ${tx(ey)}\\), \\(E(XY) = ${tx(exy)}\\).`, `\\(\\text{Cov} = ${tx(exy)} - ${tx(ex)}(${tx(ey)}) = ${tx(cv)}\\).`, `\\(\\rho = ${tx(cv)}/\\sqrt{${tx(vx)}(${tx(vy)})} = ${tx(rho)}\\).`],
      ti: `p <- matrix(c(${p.flat().join(', ')}), 2, byrow = TRUE); x <- 0:1; y <- 0:2; mx <- sum(x*rowSums(p)); my <- sum(y*colSums(p)); sum(outer(x, y)*p) - mx*my`,
      excel: `import numpy as np; p = np.array([[${p[0].join(', ')}], [${p[1].join(', ')}]]); x, y = np.arange(2), np.arange(3); (np.outer(x, y)*p).sum() - (x@p.sum(1))*(y@p.sum(0))`
    };
  });
  B.FR(5, 'm5-clt', () => {
    const mu = R.pick([450, 830, 220]), sd = R.pick([20, 28, 35]), nn = R.pick([49, 64]), se = sd / Math.sqrt(nn), a = Math.round(mu - R.int(5, 12) / 10 * se), b = Math.round(mu + R.int(5, 12) / 10 * se);
    const za = (a - mu) / se, zb = (b - mu) / se;
    return {
      stem: `A population has mean ${mu} and standard deviation ${sd}; its shape is unknown. A random sample of n = ${nn} is taken. Round z to two decimals.`,
      parts: [
        { type: 'num', label: '\\(\\sigma_{\\bar X}\\)', answer: se, mistakes: [{ value: sd / nn, msg: 'Divide by √n.' }] },
        { type: 'num', label: `\\(P(${a} < \\bar X < ${b})\\)`, answer: tab(zb) - tab(za), alts: [S.pnorm(zb) - S.pnorm(za)], mistakes: [{ value: tab((b - mu) / sd) - tab((a - mu) / sd), msg: 'Use σ/√n for the sample mean.' }] }],
      written: { prompt: 'Why can we use a normal model for x̄ even though the population shape is unknown?',
        keys: [`States n = ${nn} > 40 (the course rule).`, 'Invokes the Central Limit Theorem: x̄ is approximately normal for large n regardless of the population shape.'],
        model: `Because n = ${nn} > 40, the Central Limit Theorem says the sampling distribution of x̄ is approximately N(${mu}, ${sd}²/${nn}), whatever the shape of the population.` },
      solution: [`\\(\\sigma_{\\bar X} = ${sd}/\\sqrt{${nn}} = ${tx(se)}\\).`, `\\(z_1 = (${a}-${mu})/${tx(se)} = ${S.zRound(za).toFixed(2)}\\), \\(z_2 = ${S.zRound(zb).toFixed(2)}\\).`, `\\(P = ${tx(tab(zb))} - ${tx(tab(za))} = ${tx(tab(zb) - tab(za))}\\).`],
      ti: `se <- ${sd}/sqrt(${nn}); pnorm(${b}, ${mu}, se) - pnorm(${a}, ${mu}, se)`,
      excel: `from scipy.stats import norm; se = ${sd}/${nn}**0.5; norm.cdf(${b}, ${mu}, se) - norm.cdf(${a}, ${mu}, se)`
    };
  });
})(globalThis);
