/* Practice-exam bank, Module 4: Continuous Random Variables. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, { o, n, tx, nums } = B;
  const tab = z => S.tableArea(z), zr = z => S.zRound(z);

  B.MC(4, 'm4-const', () => { const k = R.int(1, 3), b = R.pick([1, 2, 3]), c = (k + 1) / b ** (k + 1);
    return { stem: `For \\(f(x) = c\\,x^{${k}}\\) on \\(0\\le x\\le ${b}\\) (0 elsewhere) to be a valid density, what must c be?`, numeric: true, options: nums([
      [c, 4, 'Correct: the total area \\(c\\,b^{k+1}/(k+1)\\) must equal 1.'], [1 / b, 1, 'That is the height of a uniform density on the same interval.'], [b ** (k + 1) / (k + 1), 2, 'That is the integral of \\(x^k\\); c is its reciprocal.'], [k + 1, 0, 'Include the upper limit b when you integrate.']], 4) }; });
  B.MC(4, 'm4-cdf', () => { const k = R.int(2, 3), a = R.int(2, 5) / 10, b = a + R.int(2, 4) / 10;
    return { stem: `X has CDF \\(F(x) = x^{${k}}\\) for \\(0\\le x\\le 1\\). What is \\(P(${a} < X \\le ${b})\\)?`, numeric: true, options: nums([
      [b ** k - a ** k, 4, 'Correct: \\(F(b) - F(a)\\).'], [b ** k, 2, 'Subtract \\(F(a)\\), the area below the lower end.'], [k * b ** (k - 1) - k * a ** (k - 1), 1, 'Those are density values \\(f = F\'\\); probabilities come from F.'], [(b - a) ** k, 0, '\\(F(b)-F(a)\\) is not \\(F(b-a)\\).']], 4) }; });
  B.MC(4, 'm4-median', () => { const k = R.int(1, 3);
    return { stem: `X has density \\(f(x) = ${k + 1}x^{${k}}\\) on [0, 1]. What is the median of X?`, numeric: true, options: nums([
      [0.5 ** (1 / (k + 1)), 4, 'Correct: solve \\(F(\\tilde\\mu) = \\tilde\\mu^{' + (k + 1) + '} = 0.5\\).'], [0.5, 1, 'The midpoint is the median only for a symmetric density.'], [(k + 1) / (k + 2), 2, 'That is the mean, not the median.'], [0.5 ** (k + 1), 0, 'Take the root, not the power: \\(0.5^{1/' + (k + 1) + '}\\).']], 4) }; });
  B.MC(4, 'm4-uniform', () => { const A = R.int(0, 20), Bv = A + R.pick([20, 40, 50]), a = R.int(A + 2, A + 10), b = a + R.int(5, 15);
    return { stem: `The arrival time of a shuttle is uniform between ${A} and ${Bv} minutes after the hour. What is the probability it arrives between ${a} and ${b} minutes?`, numeric: true, options: nums([
      [(b - a) / (Bv - A), 4, 'Correct: width over total width.'], [(b - a) / Bv, 2, 'Divide by the full width B − A, not by B.'], [1 / (Bv - A), 1, 'That is the density height, not a probability.'], [(b + a) / (2 * Bv), 0, 'Probability is the width of the interval times the height.']], 4) }; });
  B.MC(4, 'm4-normal', () => { const mu = R.pick([480, 500, 520]), sd = R.pick([10, 15, 20]), x = mu + R.int(5, 30), z = (x - mu) / sd, t = tab(z);
    return { stem: `Tensile strength is normal with mean ${mu} MPa and SD ${sd} MPa. What proportion of bars are stronger than ${x} MPa? (Round z to two decimals.)`, numeric: true, options: nums([
      [1 - t, 4, `Correct: z = ${zr(z).toFixed(2)}, and the right tail is \\(1 - ${S.fmt(t, 4)}\\).`], [t, 2, 'That is the left area. “Stronger than” needs the right tail.'],
      [1 - tab((x - mu) / (sd * sd)), 1, 'Divide by σ, not σ², when standardizing.'], [0.5 - t / 2, 0, 'Use the table area directly.']], 4) }; });
  B.MC(4, 'm4-inverse', () => { const mu = R.pick([40, 50, 60]), sd = R.pick([4, 5, 6]), p = R.pick([0.9, 0.95, 0.1, 0.2]), z = S.tableZ(p);
    return { stem: `Battery life is normal with mean ${mu} hours and SD ${sd} hours. What life is exceeded by only ${S.num((1 - p) * 100, 0)}% of batteries?`, numeric: true, options: nums([
      [mu + z * sd, 4, `Correct: left area ${p} gives z = ${z}, and \\(x = \\mu + z\\sigma\\).`], [mu - z * sd, 2, 'Right idea, wrong side: a value exceeded by few batteries is above the mean when the tail is small.'], [mu + z * sd * sd, 1, 'Multiply z by σ, not σ².'], [mu + sd, 0, 'Use the z from the table for this area.']], 2) }; });
  B.MC(4, 'm4-memoryless', () => { const lam = R.pick([0.1, 0.2, 0.5]), s = R.int(2, 6), t = R.int(1, 5);
    return { stem: `A component’s lifetime (years) is Exp(λ = ${lam}). Given it has lasted ${s} years, what is the probability it lasts at least ${t} more?`, numeric: true, options: nums([
      [Math.exp(-lam * t), 4, 'Correct: by memorylessness the answer is \\(P(X > ' + t + ') = e^{-\\lambda t}\\).'], [Math.exp(-lam * (s + t)), 2, 'That is P(X > ' + (s + t) + ') from new. Condition on surviving ' + s + ' years.'],
      [1 - Math.exp(-lam * t), 1, 'That is the probability of failing within ' + t + ' more years.'], [Math.exp(-lam * s), 0, 'The time already survived does not change the remaining life.']], 4) }; });
  B.MC(4, 'm4-gamma', () => { const ask = R.pick(['half', 'mean']);
    if (ask === 'half') return { stem: 'What is \\(\\Gamma(5/2)\\)?', numeric: true, options: nums([
      [0.75 * Math.sqrt(Math.PI), 4, 'Correct: \\(\\tfrac32\\cdot\\tfrac12\\sqrt\\pi\\).'], [Math.sqrt(Math.PI), 1, 'That is \\(\\Gamma(1/2)\\). Apply the recursion twice.'], [1.5 * Math.sqrt(Math.PI), 2, 'One factor is missing: \\(\\tfrac32\\cdot\\tfrac12\\).'], [1.5, 0, '\\(\\Gamma(5/2)\\) involves \\(\\sqrt\\pi\\).']], 4) };
    const al = R.pick([2, 3, 4]), be = R.pick([2, 3, 5]);
    return { stem: `X ~ G(α = ${al}, β = ${be}). What is the standard deviation of X?`, numeric: true, options: nums([
      [Math.sqrt(al) * be, 4, 'Correct: \\(\\sqrt{\\alpha\\beta^2}\\).'], [al * be * be, 2, 'That is the variance. Take the square root.'], [al * be, 1, 'That is the mean.'], [Math.sqrt(al * be), 0, 'The variance is \\(\\alpha\\beta^2\\).']], 4) }; });

  B.FR(4, 'm4-density', () => {
    const k = R.int(1, 3), c = k + 1, a = R.int(3, 7) / 10, mu = c / (k + 2), ex2 = c / (k + 3), v = ex2 - mu * mu, med = 0.5 ** (1 / (k + 1));
    return {
      stem: `The fraction of a shift that a machine is busy, X, has density \\(f(x) = c\\,x^{${k}}\\) for \\(0\\le x\\le 1\\).`,
      parts: [
        { type: 'num', label: 'c', answer: c, mistakes: [{ value: 1, msg: 'Integrate \\(x^k\\) over [0, 1] and set the result times c equal to 1.' }] },
        { type: 'num', label: `\\(P(X > ${a})\\)`, answer: 1 - a ** (k + 1), mistakes: [{ value: a ** (k + 1), msg: 'That is \\(P(X\\le ' + a + ')\\).' }] },
        { type: 'num', label: '\\(E(X)\\)', answer: mu, mistakes: [{ value: 0.5, msg: 'The density is not flat.' }] },
        { type: 'num', label: 'Median', answer: med, mistakes: [{ value: 0.5, msg: 'Solve \\(F(\\tilde\\mu) = 0.5\\).' }] },
        { type: 'num', label: '\\(\\text{Var}(X)\\)', answer: v, mistakes: [{ value: ex2, msg: 'Subtract \\(\\mu^2\\).' }] }],
      written: { prompt: 'Compare the mean and the median. What do they say about the shape of the density?',
        keys: [`States that the mean (${n(mu)}) is less than the median (${n(med)}).`, 'Concludes the density is skewed left: the long tail is toward 0, which pulls the mean down.'],
        model: `The mean ${n(mu)} is below the median ${n(med)}. The density rises toward 1, so its long tail is on the left (toward 0); that tail pulls the mean below the median.` },
      solution: [`\\(\\int_0^1 c\\,x^{${k}}dx = c/${k + 1} = 1\\), so \\(c = ${c}\\). \\(F(x) = x^{${k + 1}}\\).`, `\\(P(X>${a}) = 1 - ${a}^{${k + 1}} = ${tx(1 - a ** (k + 1))}\\).`, `\\(E(X) = \\int_0^1 ${c}x^{${k + 1}}dx = ${c}/${k + 2} = ${tx(mu)}\\); median \\(=0.5^{1/${k + 1}} = ${tx(med)}\\).`, `\\(E(X^2) = ${c}/${k + 3} = ${tx(ex2)}\\), \\(\\text{Var}(X) = ${tx(ex2)} - ${tx(mu)}^2 = ${tx(v)}\\).`],
      ti: `f <- function(x) ${c}*x^${k}; integrate(f, ${a}, 1)$value; integrate(function(x) x*f(x), 0, 1)$value`,
      excel: `from scipy.integrate import quad; f = lambda x: ${c}*x**${k}; quad(f, ${a}, 1)[0], quad(lambda x: x*f(x), 0, 1)[0]`
    };
  });
  B.FR(4, 'm4-sloth', () => {
    const mu = 4, sd = R.pick([0.5, 0.6, 0.8]), hi = R.pick([4.8, 5, 5.2]), a = R.pick([3.5, 3.7]), b = R.pick([4.4, 4.5]), p = R.pick([0.9, 0.95]);
    const z = (hi - mu) / sd, za = (a - mu) / sd, zb = (b - mu) / sd, pz = S.tableZ(p);
    return {
      stem: `Three-toed sloth weights are normal with mean 4 kg and standard deviation ${sd} kg. Round z to two decimals and use the table.`,
      parts: [
        { type: 'num', label: `\\(P(X > ${hi})\\)`, answer: 1 - tab(z), alts: [1 - S.pnorm(z)], mistakes: [{ value: tab(z), msg: 'Take the right tail.' }] },
        { type: 'num', label: `\\(P(${a} < X < ${b})\\)`, answer: tab(zb) - tab(za), alts: [S.pnorm(zb) - S.pnorm(za)], mistakes: [{ value: tab(zb) + tab(za), msg: 'Subtract the left areas.' }] },
        { type: 'num', label: `${Math.round(p * 100)}th percentile (kg)`, answer: mu + pz * sd, alts: [mu + S.qnorm(p) * sd], mistakes: [{ value: mu - pz * sd, msg: 'Check the sign of z.' }] }],
      written: { prompt: `Interpret the ${Math.round(p * 100)}th percentile in context.`,
        keys: [`About ${Math.round(p * 100)}% of sloths weigh less than ${n(mu + pz * sd, 3)} kg.`, `About ${Math.round((1 - p) * 100)}% weigh more.`],
        model: `About ${Math.round(p * 100)}% of three-toed sloths weigh less than ${n(mu + pz * sd, 3)} kg, and about ${Math.round((1 - p) * 100)}% weigh more.` },
      solution: [`\\(z = (${hi} - 4)/${sd} = ${tx(z)} \\approx ${zr(z).toFixed(2)}\\); \\(P = 1 - ${tx(tab(z))} = ${tx(1 - tab(z))}\\).`, `\\(z_1 = ${zr(za).toFixed(2)}\\), \\(z_2 = ${zr(zb).toFixed(2)}\\); \\(P = ${tx(tab(zb))} - ${tx(tab(za))} = ${tx(tab(zb) - tab(za))}\\).`, `Left area ${p} gives \\(z = ${pz}\\); \\(x = 4 + ${pz}(${sd}) = ${tx(mu + pz * sd)}\\).`],
      ti: `1 - pnorm(${hi}, 4, ${sd}); pnorm(${b}, 4, ${sd}) - pnorm(${a}, 4, ${sd}); qnorm(${p}, 4, ${sd})`,
      excel: `from scipy.stats import norm; norm.sf(${hi}, 4, ${sd}), norm.cdf(${b}, 4, ${sd}) - norm.cdf(${a}, 4, ${sd}), norm.ppf(${p}, 4, ${sd})`
    };
  });
})(globalThis);
