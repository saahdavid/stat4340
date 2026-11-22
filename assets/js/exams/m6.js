/* Practice-exam bank, Module 6: Point Estimation. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, { o, n, tx, nums } = B;
  const sum = a => a.reduce((s, v) => s + v, 0);

  B.MC(6, 'm6-ident', () => { const k = R.pick([50, 100, 200]), v = R.int(280, 330) / 10;
    return { stem: `In a random sample of ${k} new cars, the mean fuel economy is ${v} MPG. The number ${v} is`, options: [
      o('a point estimate of the population mean μ', 4, 'Correct: the value of the estimator X̄ for this sample.'), o('the parameter μ', 2, 'The parameter is the unknown mean of all cars; this number comes from the sample.'),
      o('the estimator X̄', 1, 'The estimator is the rule (a random variable); ' + v + ' is its value for one sample.'), o('the standard error', 0, 'The standard error measures the variability of the estimator.')] }; });
  B.MC(6, 'm6-unbiased', () => ({ stem: 'Which estimator is unbiased for the population variance σ² of a random sample?', options: [
    o('S² = Σ(Xᵢ − X̄)²/(n − 1)', 4, 'Correct: E(S²) = σ².'), o('σ̂² = Σ(Xᵢ − X̄)²/n', 2, 'Close: it is the MLE and the MoM estimator, but E = (n − 1)σ²/n, so it is biased low.'),
    o('S = √S²', 1, 'S estimates σ, not σ² (and it is slightly biased for σ).'), o('X̄²', 0, 'That estimates μ², not σ².')] }));
  B.MC(6, 'm6-bias', () => { const mu = R.int(20, 60), a = R.pick([0.9, 1.1, 1.2]);
    return { stem: `If \\(E(X) = \\mu = ${mu}\\), what is the bias of the estimator \\(\\hat\\mu = ${a}\\bar X\\)?`, numeric: true, options: nums([
      [(a - 1) * mu, 4, 'Correct: \\(E(\\hat\\mu) - \\mu = ' + a + '\\mu - \\mu\\).'], [(1 - a) * mu, 2, 'Bias is E(estimator) − parameter; check the sign.'], [a * mu, 1, 'That is E(μ̂). Subtract μ.'], [0, 0, 'Multiplying X̄ by a constant other than 1 creates bias.']], 2) }; });
  B.MC(6, 'm6-var', () => { const s2 = R.pick([9, 16, 25]), nn = R.int(5, 10);
    return { stem: `X₁, …, Xₙ is a random sample of size n = ${nn} with variance ${s2}. Both \\(\\bar X\\) and \\((X_1+X_2)/2\\) are unbiased for μ. What is the variance of the better one?`, numeric: true, options: nums([
      [s2 / nn, 4, 'Correct: X̄ has variance σ²/n, smaller than σ²/2.'], [s2 / 2, 2, 'That is the variance of (X₁ + X₂)/2, the worse estimator.'], [s2, 1, 'That is the variance of one observation.'], [s2 / (nn * nn), 0, 'Var(X̄) = σ²/n.']], 3) }; });
  B.MC(6, 'm6-se', () => { const nn = R.pick([50, 100, 200]), x = R.int(Math.round(nn * .2), Math.round(nn * .7)), p = x / nn;
    return { stem: `${x} of ${nn} sampled sensors fail a stress test. What is the estimated standard error of \\(\\hat p\\)?`, numeric: true, options: nums([
      [Math.sqrt(p * (1 - p) / nn), 4, 'Correct: \\(\\sqrt{\\hat p(1-\\hat p)/n}\\).'], [p * (1 - p) / nn, 2, 'That is the variance. Take the square root.'], [Math.sqrt(p * (1 - p)), 1, 'Divide by n inside the square root.'], [p / Math.sqrt(nn), 0, 'Use p̂(1 − p̂) inside the root.']], 4) }; });
  B.MC(6, 'm6-mom', () => { const al = R.int(2, 5), be = R.pick([2, 3, 4]), xb = al * be, v = al * be * be;
    return { stem: `Repair times are Gamma(α, β), with \\(E(X) = \\alpha\\beta\\) and \\(\\text{Var}(X) = \\alpha\\beta^2\\). A sample gives \\(\\bar x = ${xb}\\) and \\(\\hat\\sigma^2 = ${v}\\). What is the method of moments estimate of β?`, numeric: true, options: nums([
      [be, 4, 'Correct: \\(\\hat\\beta = \\hat\\sigma^2/\\bar x\\).'], [al, 2, 'That is α̂ = x̄²/σ̂².'], [xb / v, 1, 'Invert: β̂ = σ̂²/x̄.'], [Math.sqrt(v), 0, 'Match both moments and solve for β.']], 3) }; });
  B.MC(6, 'm6-mle', () => { const x = Array.from({ length: 5 }, () => R.int(10, 60) / 10), xb = sum(x) / 5;
    return { stem: `Lifetimes ${x.join(', ')} come from an Exponential(λ) distribution. What is the maximum likelihood estimate of λ?`, numeric: true, options: nums([
      [1 / xb, 4, 'Correct: \\(\\hat\\lambda = n/\\sum x_i = 1/\\bar x\\).'], [xb, 2, 'That is x̄, which estimates the mean 1/λ.'], [sum(x), 0, 'Use n/Σxᵢ.'], [1 / sum(x), 1, 'Multiply by n: n/Σxᵢ.']], 4) }; });
  B.MC(6, 'm6-invar', () => { const s2 = R.pick([2.25, 4, 6.25, 9]);
    return { stem: `For a normal sample the MLE of σ² is ${s2}. By the invariance property, the MLE of σ is`, numeric: true, options: nums([
      [Math.sqrt(s2), 4, 'Correct: \\(\\hat\\sigma = \\sqrt{\\hat\\sigma^2}\\).'], [s2 / 2, 1, 'Invariance plugs the MLE into the function: take the square root.'], [s2, 0, 'That is σ̂², not σ̂.'], [s2 * s2, 0, 'Take the square root, not the square.']], 3) }; });

  B.FR(6, 'm6-estimates', () => {
    const x = Array.from({ length: 10 }, () => R.int(240, 310) / 10), s = [...x].sort((a, b) => a - b), m = sum(x) / 10, md = (s[4] + s[5]) / 2, mid = (s[0] + s[9]) / 2, tr = sum(s.slice(1, 9)) / 8;
    return {
      stem: `Ten breakdown voltages (kV) come from a symmetric distribution with center μ:<br>${x.join(', ')}`,
      parts: [
        { type: 'num', label: '\\(\\bar x\\)', answer: m, mistakes: [] }, { type: 'num', label: 'Median', answer: md, mistakes: [{ value: (x[4] + x[5]) / 2, msg: 'Sort first.' }] },
        { type: 'num', label: 'Average of the extremes', answer: mid, mistakes: [] }, { type: 'num', label: '10% trimmed mean', answer: tr, mistakes: [{ value: sum(s.slice(2, 8)) / 6, msg: 'Drop one value from each end.' }] }],
      written: { prompt: 'All four estimate μ. Which would you report if the data might contain an outlier, and why?',
        keys: ['Chooses the median or the trimmed mean.', 'Explains that they are resistant to extreme values, while x̄ and the extremes average are pulled by an outlier.'],
        model: 'The median (or the trimmed mean), because it is resistant: one extreme value barely changes it, while x̄ and especially the average of the extremes are pulled toward an outlier.' },
      solution: [`Sorted: ${s.join(', ')}.`, `\\(\\bar x = ${tx(sum(x))}/10 = ${tx(m)}\\); median \\(= ${tx(md)}\\).`, `Extremes: \\((${s[0]} + ${s[9]})/2 = ${tx(mid)}\\); trimmed mean \\(= ${tx(sum(s.slice(1, 9)))}/8 = ${tx(tr)}\\).`],
      ti: `x <- c(${x.join(', ')}); c(mean(x), median(x), mean(range(x)), mean(x, trim = 0.1))`,
      excel: `import numpy as np; from scipy.stats import trim_mean; x = np.array([${x.join(', ')}]); x.mean(), np.median(x), (x.min() + x.max())/2, trim_mean(x, 0.1)`
    };
  });
  B.FR(6, 'm6-mle', () => {
    const x = Array.from({ length: 6 }, () => R.int(5, 80) / 10), nn = 6, sx = sum(x), lam = nn / sx, t = R.int(2, 6);
    return {
      stem: `Times (hours) between failures of a pump are modeled as Exponential(λ): ${x.join(', ')}.`,
      parts: [
        { type: 'num', label: 'MLE \\(\\hat\\lambda\\)', answer: lam, mistakes: [{ value: sx / nn, msg: 'That is x̄; λ̂ = 1/x̄.' }] },
        { type: 'num', label: 'MoM estimate of λ', answer: lam, mistakes: [] },
        { type: 'num', label: `MLE of \\(P(X > ${t}) = e^{-${t}\\lambda}\\)`, answer: Math.exp(-t * lam), mistakes: [{ value: 1 - Math.exp(-t * lam), msg: 'P(X > t) = e^{−λt}.' }] }],
      written: { prompt: 'Show how the MLE of λ is derived from the log-likelihood.',
        keys: ['Writes ℓ(λ) = n ln λ − λΣxᵢ (or L = λⁿe^{−λΣxᵢ}).', 'Sets ℓ′(λ) = n/λ − Σxᵢ = 0 and solves λ̂ = n/Σxᵢ = 1/x̄.'],
        model: `L(λ) = λⁿe^{−λΣxᵢ}, so ℓ(λ) = n ln λ − λΣxᵢ. ℓ′(λ) = n/λ − Σxᵢ = 0 gives λ̂ = n/Σxᵢ = ${nn}/${n(sx)} = ${n(lam)}.` },
      solution: [`\\(\\sum x_i = ${tx(sx)}\\), \\(\\hat\\lambda = ${nn}/${tx(sx)} = ${tx(lam)}\\).`, 'MoM: \\(1/\\lambda = \\bar x\\) gives the same value.', `Invariance: \\(e^{-${t}(${tx(lam)})} = ${tx(Math.exp(-t * lam))}\\).`],
      ti: `x <- c(${x.join(', ')}); l <- 1/mean(x); c(l, exp(-${t}*l))`,
      excel: `import math; x = [${x.join(', ')}]; l = len(x)/sum(x); l, math.exp(-${t}*l)`
    };
  });
})(globalThis);
