/* Practice-exam bank, Module 3: Discrete Random Variables. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, { o, n, tx, nums, table } = B;
  const C = (a, b) => { if (b < 0 || b > a) return 0; let r = 1; for (let i = 1; i <= b; i++) r = r * (a - b + i) / i; return Math.round(r); };
  const fact = k => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };
  const bin = (x, nn, p) => C(nn, x) * p ** x * (1 - p) ** (nn - x), pois = (x, m) => Math.exp(-m) * m ** x / fact(x), sum = a => a.reduce((s, v) => s + v, 0);
  const pmf = () => { const k = R.int(4, 5), xs = Array.from({ length: k }, (_, i) => i); let w; do { w = xs.map(() => R.int(5, 35)); } while (sum(w) > 100); w[k - 1] += 100 - sum(w); return { xs, ps: w.map(v => v / 100) }; };
  const ptable = (xs, ps, miss = -1) => table(['\\(x\\)', ...xs.map(String)], [['\\(p(x)\\)', ...ps.map((p, i) => i === miss ? '\\(k\\)' : n(p))]]);

  B.MC(3, 'm3-k', () => { const { xs, ps } = pmf(), m = R.int(0, xs.length - 1);
    return { stem: `For the PMF below to be valid, what must \\(k\\) be?${ptable(xs, ps, m)}`, numeric: true, options: nums([
      [ps[m], 4, 'Correct: the probabilities of a PMF add to 1.'],
      [1 - ps[m], 1, 'That is the sum of the other probabilities. k is what is left over from 1.'],
      [1 / xs.length, 0, 'The values need not be equally likely.'],
      [ps[m] + 0.1, 0, 'Recheck the sum: all probabilities must total exactly 1.']], 2) }; });
  B.MC(3, 'm3-mean', () => { const { xs, ps } = pmf(), mu = sum(xs.map((x, i) => x * ps[i]));
    return { stem: `Find \\(E(X)\\) for the PMF below.${ptable(xs, ps)}`, numeric: true, options: nums([
      [mu, 4, 'Correct: \\(\\sum x\\,p(x)\\).'],
      [S.mean(xs), 1, 'That averages the values equally. Weight each value by its probability.'],
      [sum(xs.map((x, i) => x * x * ps[i])), 2, 'That is \\(E(X^2)\\). The mean uses x, not \\(x^2\\).'],
      [sum(ps) * xs.length / 2, 0, 'Multiply each value by its probability and add.']], 4) }; });
  B.MC(3, 'm3-linear', () => { const mu = R.int(2, 8) / 2, sd = R.int(2, 6) / 2, a = R.pick([3, 4, 5, -2]), b = R.int(5, 40), ask = R.pick(['mean', 'sd']);
    if (ask === 'mean') return { stem: `\\(E(X) = ${mu}\\) and \\(\\sigma_X = ${sd}\\). What is \\(E(${a}X + ${b})\\)?`, numeric: true, options: nums([
      [a * mu + b, 4, 'Correct: \\(E(aX+b) = aE(X)+b\\).'], [a * mu, 2, 'Add the constant b.'], [mu + b, 1, 'Multiply E(X) by a first.'], [a * (mu + b), 1, 'Multiply first, then add b.']], 2) };
    return { stem: `\\(E(X) = ${mu}\\) and \\(\\sigma_X = ${sd}\\). What is the standard deviation of \\(${a}X + ${b}\\)?`, numeric: true, options: nums([
      [Math.abs(a) * sd, 4, 'Correct: \\(\\sigma_{aX+b} = |a|\\sigma_X\\); b does not change spread.'], [a * a * sd, 2, 'Squaring a belongs to the variance, not the SD.'], [Math.abs(a) * sd + b, 2, 'Adding a constant does not change spread.'], [sd, 0, 'Multiplying by a scales the spread.']], 2) }; });
  B.MC(3, 'm3-binom', () => { const nn = R.int(6, 10), p = R.pick([0.2, 0.3, 0.4]), k = R.int(1, 3);
    return { stem: `A process makes a defective part with probability ${p}, independently. In a run of ${nn} parts, what is the probability of exactly ${k} defective?`, numeric: true, options: nums([
      [bin(k, nn, p), 4, 'Correct: \\(\\binom{n}{x}p^x(1-p)^{n-x}\\).'], [p ** k * (1 - p) ** (nn - k), 2, 'Multiply by \\(\\binom{n}{x}\\), the number of orders.'],
      [sum(Array.from({ length: k + 1 }, (_, i) => bin(i, nn, p))), 1, 'That is P(X ≤ ' + k + ').'], [C(nn, k) * p ** k, 0, 'Include the failure factor \\((1-p)^{n-x}\\).']], 4) }; });
  B.MC(3, 'm3-model', () => { const sc = R.pick([
      ['A lot of 40 relays contains 6 bad ones. Eight relays are tested, chosen without replacement. X = number of bad relays tested.', 1],
      ['A website receives on average 3.2 sign-ups per minute. X = number of sign-ups in a given minute.', 3],
      ['A free-throw shooter makes 80% of shots, independently. X = number of misses before the 5th make.', 2],
      ['Each of 20 independent sensors fails with probability 0.05 during a test. X = number that fail.', 0]]);
    const names = ['Binomial', 'Hypergeometric', 'Negative binomial', 'Poisson'], why = ['fixed n independent trials with constant p', 'sampling without replacement from a finite population', 'counting failures before the rth success', 'counts of events in a fixed interval at a constant rate'];
    const near = { 0: 1, 1: 0, 2: 0, 3: 0 };
    return { stem: `${sc[0]} Which model fits X best?`, options: names.map((t, i) => i === sc[1] ? o(t, 4, `Correct: ${why[i]}.`) : o(t, i === near[sc[1]] ? 2 : 0, `${t} is for ${why[i]}.${i === near[sc[1]] ? ' Close, but check how the units are chosen.' : ''}`)) }; });
  B.MC(3, 'm3-hyper', () => { const N = R.int(20, 40), M = R.int(4, 10), nn = R.int(4, 8);
    return { stem: `${M} of ${N} batteries in a crate are faulty. ${nn} are chosen without replacement. What is the expected number of faulty batteries chosen?`, numeric: true, options: nums([
      [nn * M / N, 4, 'Correct: \\(E(X) = nM/N\\).'], [M / N, 1, 'That is the proportion faulty. Multiply by n.'], [nn * M / N * (N - nn) / (N - 1), 2, 'The finite population correction affects the variance, not the mean.'], [nn / 2, 0, 'Use the proportion faulty, M/N.']], 3) }; });
  B.MC(3, 'm3-pois', () => { const mu = R.pick([1.5, 2, 2.5, 3]);
    return { stem: `Flaws in a cable occur as a Poisson process with an average of ${mu} per 100 m. What is the probability that a 100 m length has at least one flaw?`, numeric: true, options: nums([
      [1 - Math.exp(-mu), 4, 'Correct: \\(1 - P(X=0) = 1 - e^{-\\mu}\\).'], [Math.exp(-mu), 1, 'That is P(X = 0). At least one is its complement.'], [mu * Math.exp(-mu), 2, 'That is P(X = 1). At least one includes 1, 2, 3, ….'], [1 / mu, 0, 'Use the Poisson PMF.']], 4) }; });
  B.MC(3, 'm3-approx', () => { const sc = R.pick([[200, 0.01, true], [500, 0.008, true], [40, 0.05, false], [100, 0.1, false]]);
    const ok = sc[2];
    return { stem: `X ~ Bin(${sc[0]}, ${sc[1]}). Is the Poisson approximation reasonable by our rule of thumb?`, options: [
      o(ok ? `Yes: n > 50 and np = ${n(sc[0] * sc[1])} < 5` : `No: ${sc[0] <= 50 ? 'n ≤ 50' : `np = ${n(sc[0] * sc[1])} ≥ 5`}`, 4, 'Correct: the rule needs n > 50 and np < 5.'),
      o(ok ? 'No, because p is not exactly 0' : 'Yes, because p is small', 2, 'Check both parts of the rule: n > 50 and np < 5.'),
      o('Yes, the Poisson approximation always works for a binomial', 0, 'It works only for large n and small np.'),
      o('Not enough information', 0, 'n and p are enough to apply the rule.', { last: true })] }; });

  B.FR(3, 'm3-profit', () => {
    const k = 3, cost = R.pick([400, 500]), price = cost * 2, back = R.pick([50, 100]);
    let w; do { w = [R.int(10, 40), R.int(5, 30), R.int(10, 30)]; } while (sum(w) > 90); w.push(100 - sum(w)); const ps = w.map(v => v / 100), xs = [0, 1, 2, 3];
    const a = price - back, b = back * k - cost * k, mu = sum(xs.map((x, i) => x * ps[i])), ex2 = sum(xs.map((x, i) => x * x * ps[i])), v = ex2 - mu * mu;
    return {
      stem: `A shop buys 3 laptops at $${cost} each and sells them at $${price}. Unsold laptops are bought back at $${back} each. X = number sold has the PMF below; profit is \\(h(X) = ${price}X + ${back}(3-X) - ${3 * cost}\\).${ptable(xs, ps)}`,
      parts: [
        { type: 'num', label: '\\(E(X)\\)', answer: mu, mistakes: [{ value: 1.5, msg: 'Weight each value by its probability.' }] },
        { type: 'num', label: 'Expected profit \\(E[h(X)]\\)', answer: a * mu + b, mistakes: [{ value: price * mu - 3 * cost, msg: 'You left out the buy-back income.' }] },
        { type: 'num', label: '\\(\\text{Var}(X)\\)', answer: v, mistakes: [{ value: ex2, msg: 'Subtract \\(\\mu^2\\).' }] },
        { type: 'num', label: 'SD of the profit', answer: a * Math.sqrt(v), mistakes: [{ value: a * a * v, msg: 'That is the variance of the profit.' }, { value: Math.sqrt(v), msg: 'Multiply by the slope ' + a + '.' }] }],
      written: { prompt: 'Interpret the expected profit in context.',
        keys: ['Describes it as a long-run average profit per cycle of buying 3 laptops (not a guaranteed amount).', `Uses the value and units: about $${S.num(a * mu + b, 2)}.`],
        model: `Over many cycles of buying 3 laptops, the shop’s profit averages about $${S.num(a * mu + b, 2)} per cycle, although any single cycle can be quite different.` },
      solution: [`\\(h(X) = ${a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)}\\).`, `\\(E(X) = ${xs.map((x, i) => `${x}(${n(ps[i])})`).join(' + ')} = ${tx(mu)}\\).`, `\\(E[h(X)] = ${a}(${tx(mu)}) ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${tx(a * mu + b, 2)}\\).`, `\\(E(X^2) = ${tx(ex2)}\\), \\(\\text{Var}(X) = ${tx(ex2)} - ${tx(mu)}^2 = ${tx(v)}\\).`, `SD of profit \\(= ${a}\\sqrt{${tx(v)}} = ${tx(a * Math.sqrt(v), 2)}\\).`],
      ti: `x <- 0:3; p <- c(${ps.join(', ')}); h <- ${price}*x + ${back}*(3 - x) - ${3 * cost}; sum(h*p); sqrt(sum(h^2*p) - sum(h*p)^2)`,
      excel: `p = [${ps.join(', ')}]; h = [${price}*x + ${back}*(3 - x) - ${3 * cost} for x in range(4)]; m = sum(a*b for a, b in zip(h, p)); m, (sum(a*a*b for a, b in zip(h, p)) - m**2)**0.5`
    };
  });
  B.FR(3, 'm3-fraud', () => {
    const nn = R.pick([20, 25, 30]), p = R.pick([0.1, 0.12, 0.15, 0.18]), lo = R.int(1, 2), hi = lo + R.int(3, 4);
    const pr = sum(Array.from({ length: hi - lo - 1 }, (_, i) => bin(lo + 1 + i, nn, p))), mu = nn * p, v = nn * p * (1 - p);
    return {
      stem: `${S.num(p * 100, 0)}% of a company’s online transactions are fraudulent. A random sample of ${nn} transactions is checked. Let X be the number of fraudulent transactions.`,
      parts: [
        { type: 'num', label: '\\(E(X)\\)', answer: mu, mistakes: [] },
        { type: 'num', label: '\\(\\text{Var}(X)\\)', answer: v, mistakes: [{ value: Math.sqrt(v), msg: 'That is the SD.' }] },
        { type: 'num', label: `\\(P(${lo} < X < ${hi})\\)`, answer: pr, mistakes: [{ value: sum(Array.from({ length: hi - lo + 1 }, (_, i) => bin(lo + i, nn, p))), msg: 'Strict inequalities exclude the endpoints.' }] }],
      written: { prompt: 'Explain why X is binomial: name the four conditions in this context.',
        keys: [`Fixed number of trials (n = ${nn}) with two outcomes (fraudulent or not).`, `Independent transactions with the same probability p = ${p}.`],
        model: `There are n = ${nn} transactions, each fraudulent or not; a random sample makes them independent, and each has the same chance p = ${p}. So X ~ Bin(${nn}, ${p}).` },
      solution: [`\\(X\\sim\\text{Bin}(${nn}, ${p})\\): \\(E(X) = ${tx(mu)}\\), \\(\\text{Var}(X) = ${tx(v)}\\).`, `\\(P(${lo}<X<${hi}) = \\sum_{x=${lo + 1}}^{${hi - 1}}\\binom{${nn}}{x}(${p})^x(${tx(1 - p)})^{${nn}-x}\\).`, `Terms: ${Array.from({ length: hi - lo - 1 }, (_, i) => tx(bin(lo + 1 + i, nn, p))).join(' + ')} = \\(${tx(pr)}\\).`],
      ti: `sum(dbinom(${lo + 1}:${hi - 1}, ${nn}, ${p}))`,
      excel: `from scipy.stats import binom; binom.cdf(${hi - 1}, ${nn}, ${p}) - binom.cdf(${lo}, ${nn}, ${p})`
    };
  });
})(globalThis);
