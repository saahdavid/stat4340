/* Practice-exam bank, Module 1: Descriptive Statistics. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, { o, n, tx, nums, table } = B;
  const data = (k, lo, hi) => Array.from({ length: k }, () => R.int(lo, hi));

  /* ================= Module 1 ================= */
  B.MC(1, 'm1-vartype', () => {
    const sets = [
      ['the number of defective items in a shipment', 'the shipment’s tracking number', 'the carrier that delivered it', 'whether the shipment arrived late'],
      ['the weight of a newborn calf, in pounds', 'the calf’s ear-tag number', 'the calf’s breed', 'whether the calf was born in spring'],
      ['a steel bar’s tensile strength, in MPa', 'the bar’s serial number', 'the mill that produced it', 'whether the bar passed inspection'],
      ['the time a server takes to respond, in milliseconds', 'the server’s rack number', 'the server’s operating system', 'whether the request succeeded'],
      ['a three-toed sloth’s speed, in meters per minute', 'the sloth’s tracking-collar ID', 'the forest where it was found', 'whether the sloth is female']
    ];
    const [q, code, cat, bin] = R.pick(sets);
    return { stem: 'Which of these variables is quantitative?', options: [
      o(q, 4, 'Correct. It is a measured amount, so arithmetic such as an average makes sense.'),
      o(code, 1, 'It is written with digits, but the digits are labels. Averaging them means nothing, so it is categorical.'),
      o(cat, 0, 'This places each individual in a group. It is categorical.'),
      o(bin, 0, 'A yes/no variable places each individual in one of two groups. It is categorical.')] };
  });
  B.MC(1, 'm1-sampling', () => {
    const k = R.int(10, 30), g = R.int(4, 8);
    const sc = R.pick([
      [`A quality engineer picks a random starting part between 1 and ${k}, then inspects every ${k % 10 === 1 && k !== 11 ? k + 'st' : k % 10 === 2 && k !== 12 ? k + 'nd' : k % 10 === 3 && k !== 13 ? k + 'rd' : k + 'th'} part made that day.`, 1],
      [`A company divides its employees by department, because departments differ in salary, and takes a simple random sample of ${k} employees from each department.`, 2],
      [`An airline randomly selects ${g} of today’s flights and surveys every passenger on those flights.`, 3],
      [`A researcher numbers all ${k * 50} sensors in a network and uses software that makes every set of ${k} sensors equally likely to be chosen.`, 0]]);
    const names = ['simple random sampling', 'systematic sampling', 'stratified sampling', 'cluster sampling'];
    const why = [
      'An SRS makes every possible sample of the given size equally likely.',
      'Systematic sampling uses a random start and then every kth unit.',
      'Stratified sampling takes an SRS within every group, and the groups (strata) are internally similar.',
      'Cluster sampling chooses whole groups at random and includes everyone in them.'];
    const near = { 0: 1, 1: 0, 2: 3, 3: 2 };
    return { stem: `${sc[0]} Which sampling method is this?`, options: names.map((t, i) => i === sc[1]
      ? o(t, 4, 'Correct. ' + why[i])
      : o(t, i === near[sc[1]] ? 2 : 0, i === near[sc[1]] ? `Close, but not this one. ${why[i]} ${why[sc[1]]}` : why[i] + ' That is not what happened here.')) };
  });
  B.MC(1, 'm1-mean', () => {
    const k = R.pick([5, 6, 7]), x = data(k, 2, 30), sum = S.sum(x), mean = sum / k;
    return { stem: `Find the mean of these ${k} values: ${x.join(', ')}.`, numeric: true, options: nums([
      [mean, 4, `Correct: \\(\\bar x = ${sum}/${k}\\).`],
      [S.median(x), 1, 'That is the median, the middle of the sorted list. The question asks for the mean.'],
      [sum / (k - 1), 2, `The sum is right, but divide by n = ${k}, not n − 1. The n − 1 belongs in the standard deviation.`],
      [sum, 0, 'That is the sum. Divide it by the number of values.']], 2) };
  });
  B.MC(1, 'm1-median', () => {
    let x; do { x = data(R.pick([6, 8]), 1, 40); } while (new Set(x).size < x.length || S.median(x) === (x[x.length / 2 - 1] + x[x.length / 2]) / 2);
    const k = x.length, med = S.median(x), unsorted = (x[k / 2 - 1] + x[k / 2]) / 2;
    return { stem: `Find the median of these ${k} values: ${x.join(', ')}.`, numeric: true, options: nums([
      [med, 4, 'Correct: sort the values, then average the two middle ones.'],
      [unsorted, 2, 'You averaged the two middle values of the list as written. Sort the list first.'],
      [S.mean(x), 1, 'That is the mean. The median is the middle of the sorted list.'],
      [(k + 1) / 2, 0, 'That is the position of the median in the sorted list, not its value.']], 2) };
  });
  B.MC(1, 'm1-sd', () => {
    let x; do { x = data(5, 2, 20); } while (!Number.isInteger(S.mean(x)) || S.sd(x) === 0);
    const m = S.mean(x), ss = S.sum(x.map(v => (v - m) ** 2)), s = Math.sqrt(ss / 4);
    return { stem: `The values ${x.join(', ')} have mean \\(\\bar x = ${m}\\). Find the sample standard deviation \\(s\\).`, numeric: true, options: nums([
      [s, 4, `Correct: \\(\\sum(x-\\bar x)^2 = ${ss}\\), divide by \\(n-1=4\\), then take the square root.`],
      [Math.sqrt(ss / 5), 2, 'One slip: you divided by n = 5. The sample standard deviation divides by n − 1 = 4.'],
      [ss / 4, 1, 'That is the variance \\(s^2\\). Take its square root.'],
      [ss, 0, 'That is only the sum of squared deviations.']], 3) };
  });
  B.MC(1, 'm1-fence', () => {
    const q1 = R.int(20, 40), iqr = R.pick([8, 10, 12, 14, 16, 18]), q3 = q1 + iqr, med = q1 + R.int(3, iqr - 3);
    return { stem: `A data set has \\(Q_1 = ${q1}\\), median \\(= ${med}\\), and \\(Q_3 = ${q3}\\). Using the 1.5 × IQR rule, what is the upper fence?`, numeric: true, options: nums([
      [q3 + 1.5 * iqr, 4, `Correct: IQR = ${iqr}, and \\(Q_3 + 1.5(${iqr}) = ${q3 + 1.5 * iqr}\\).`],
      [q3 + iqr, 2, 'Right idea, one missing piece: add 1.5 × IQR to Q3, not 1 × IQR.'],
      [med + 1.5 * iqr, 1, 'Fences start from the quartiles, not the median.'],
      [q1 - 1.5 * iqr, 0, 'That is the lower fence.']], 1) };
  });
  B.MC(1, 'm1-transform', () => {
    const t = R.pick([
      { what: 'temperatures in °C', a: 1.8, b: 32, to: 'degrees Fahrenheit (F = 1.8C + 32)', u: '°F', m: R.int(18, 30), sd: R.pick([1.5, 2, 2.5, 3, 4]) },
      { what: 'lengths in meters', a: 100, b: 0, to: 'centimeters', u: 'cm', m: R.int(3, 9), sd: R.pick([0.4, 0.6, 0.8, 1.2]) },
      { what: 'sensor readings', a: 1, b: R.pick([5, 10, 15]), to: 'readings from a sensor that adds a constant offset', u: 'units', m: R.int(40, 80), sd: R.pick([3, 4, 6, 7.5]) }]);
    const ask = R.pick(['sd', 'mean']), { a, b, m, sd } = t, L = [];
    if (ask === 'sd') {
      L.push([a * sd, 4, 'Correct: a scale factor multiplies s (\\(s_y = C s_x\\)), and adding a constant does not change the spread.']);
      if (b) L.push([a * sd + b, 2, 'Close: the scale factor is handled correctly, but adding a constant shifts every value equally and leaves s unchanged.']);
      if (a !== 1) { L.push([a * a * sd, 1, 'Squaring the factor applies to the variance, not the standard deviation.']); L.push([sd, 1, 'Multiplying every value by a constant multiplies the spread too.']); }
      return { stem: `A sample of ${t.what} has mean ${m} and standard deviation ${sd}. Every value is converted to ${t.to}. What is the new standard deviation?`, numeric: true, options: nums(L, 2) };
    }
    L.push([a * m + b, 4, 'Correct: the mean follows the same rule as each value, \\(\\bar y = C\\bar x + b\\).']);
    if (b) L.push([a * m, 2, 'You applied the scale factor but forgot to add the constant.']);
    if (a !== 1) L.push([m + b, 2, 'You added the constant but forgot to multiply by the scale factor.']);
    if (a !== 1 && b) L.push([a * (m + b), 1, 'Multiply first, then add the constant: \\(C\\bar x + b\\), not \\(C(\\bar x + b)\\).']);
    L.push([m, 1, 'Converting units changes the mean in the same way it changes each value.']);
    return { stem: `A sample of ${t.what} has mean ${m} and standard deviation ${sd}. Every value is converted to ${t.to}. What is the new mean?`, numeric: true, options: nums(L, 2) };
  });
  B.MC(1, 'm1-shape', () => {
    const med = R.int(40, 80), right = R.coin(), mean = med + (right ? 1 : -1) * R.int(6, 15);
    const what = R.pick(['home prices (in thousands of dollars)', 'times between server failures (in hours)', 'scores on an easy quiz', 'lifetimes of light bulbs (in hours)', 'salaries of recent graduates (in thousands of dollars)']);
    return { stem: `For a large set of ${what}, the mean is ${mean} and the median is ${med}. The most likely shape of the distribution is`, options: [
      o(right ? 'skewed to the right' : 'skewed to the left', 4, `Correct. The mean is pulled toward the long tail, so the tail is on the ${right ? 'right' : 'left'}.`),
      o(right ? 'skewed to the left' : 'skewed to the right', 2, 'Right concept, wrong direction. The mean sits on the same side as the long tail.'),
      o('symmetric', 1, 'In a symmetric distribution the mean and median are close. These differ noticeably.'),
      o('Not enough information', 0, 'Comparing the mean and median is exactly the information that suggests the shape.', { last: true })] };
  });

  B.FR(1, 'm1-fivenum', () => {
    let x; do { x = data(R.pick([9, 11]), 10, 60); x.push(R.int(95, 130)); } while (new Set(x).size < 8);
    const q = S.quartiles(x), iqr = q.q3 - q.q1, uf = q.q3 + 1.5 * iqr, out = q.max > uf;
    const ctx = R.pick(['download times (in seconds) for a sample of files', 'nitrogen loads (kg) measured at a sample of streams', 'repair times (in minutes) for a sample of machines']);
    return {
      stem: `These are the ${ctx}:<br>${R.shuffle(x.slice()).join(', ')}`,
      parts: [
        { type: 'num', label: 'Median', answer: q.med, mistakes: [{ value: S.mean(x), msg: 'That is the mean.' }] },
        { type: 'num', label: '\\(Q_1\\)', answer: q.q1, mistakes: [] },
        { type: 'num', label: '\\(Q_3\\)', answer: q.q3, mistakes: [] },
        { type: 'num', label: 'IQR', answer: iqr, mistakes: [{ value: q.max - q.min, msg: 'That is the range. IQR = Q3 − Q1.' }] },
        { type: 'num', label: 'Upper fence', answer: uf, mistakes: [{ value: q.q3 + iqr, msg: 'Add 1.5 × IQR, not 1 × IQR.' }] }],
      written: { prompt: `Is the largest value, ${q.max}, an outlier? Explain using your numbers.`,
        keys: [`Compares ${q.max} with the upper fence ${n(uf)}.`, `Concludes correctly: it ${out ? 'is' : 'is not'} an outlier because it is ${out ? 'above' : 'below'} the fence.`],
        model: `The upper fence is ${n(q.q3)} + 1.5(${n(iqr)}) = ${n(uf)}. Since ${q.max} ${out ? '>' : '<'} ${n(uf)}, it ${out ? 'is' : 'is not'} an outlier by the 1.5 × IQR rule.` },
      solution: [`Sort the ${x.length} values: ${q.sorted.join(', ')}.`, `Median = ${n(q.med)}. Lower half: ${q.lower.join(', ')}, so \\(Q_1 = ${tx(q.q1)}\\). Upper half: ${q.upper.join(', ')}, so \\(Q_3 = ${tx(q.q3)}\\).`, `IQR = ${n(q.q3)} − ${n(q.q1)} = ${n(iqr)}.`, `Upper fence = ${n(q.q3)} + 1.5(${n(iqr)}) = ${n(uf)}.`],
      ti: `x <- sort(c(${x.join(', ')})); median(x); median(x[1:${q.lower.length}]); median(x[${x.length - q.upper.length + 1}:${x.length}])   # quantile() interpolates`,
      excel: `import numpy as np; x = np.sort([${x.join(', ')}]); np.median(x), np.median(x[:${q.lower.length}]), np.median(x[${x.length - q.upper.length}:])   # np.percentile interpolates`
    };
  });
  B.FR(1, 'm1-meansd', () => {
    let x; do { x = data(R.pick([5, 6]), 4, 24); } while (!Number.isInteger(S.mean(x)) || S.sd(x) === 0);
    const m = S.mean(x), dev = x.map(v => v - m), ss = S.sum(dev.map(d => d * d)), k = x.length, s = Math.sqrt(ss / (k - 1));
    const ctx = R.pick([['hours of battery life for', 'test laptops', 'hours'], ['defects per batch for', 'production batches', 'defects'], ['charging times in minutes for', 'electric scooters', 'minutes']]);
    return {
      stem: `These are the ${ctx[0]} ${k} ${ctx[1]}: ${x.join(', ')}.`,
      parts: [
        { type: 'num', label: 'Mean \\(\\bar x\\)', answer: m, mistakes: [{ value: S.median(x), msg: 'That is the median.' }] },
        { type: 'num', label: 'Sum of squared deviations \\(\\sum (x-\\bar x)^2\\)', answer: ss, mistakes: [{ value: 0, msg: 'The deviations themselves add to 0. Square each one first.' }] },
        { type: 'num', label: 'Sample standard deviation \\(s\\)', answer: s, mistakes: [{ value: Math.sqrt(ss / k), msg: `Divide by n − 1 = ${k - 1}, not n.` }, { value: ss / (k - 1), msg: 'That is the variance. Take the square root.' }] }],
      written: { prompt: 'Interpret the standard deviation in context.',
        keys: ['Describes s as a typical distance of the values from the mean.', `Uses the context and units (${ctx[2]}).`],
        model: `The ${ctx[1]} values typically differ from the mean of ${n(m)} ${ctx[2]} by about ${n(s, 2)} ${ctx[2]}.` },
      solution: [`\\(\\bar x = ${S.sum(x)}/${k} = ${m}\\).`, `Deviations: ${dev.join(', ')} (they add to 0).`, `Squares: ${dev.map(d => d * d).join(', ')}; sum = ${ss}.`, `\\(s^2 = ${ss}/${k - 1} = ${tx(ss / (k - 1))}\\), so \\(s = ${tx(s)}\\).`],
      ti: `x <- c(${x.join(', ')}); mean(x); sd(x)`, excel: `import numpy as np; x = np.array([${x.join(', ')}]); x.mean(), x.std(ddof=1)   # ddof=1 divides by n - 1`
    };
  });
})(globalThis);
