/* Practice-exam bank, Module 2: Probability. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, { o, n, tx, nums, table } = B;
  const r4 = x => Math.round(x * 1e4) / 1e4;

  B.MC(2, 'm2-addition', () => {
    const a = R.int(25, 55) / 100, b = R.int(15, 40) / 100, ab = R.int(4, Math.floor(Math.min(a, b) * 100) - 2) / 100;
    return { stem: `For a randomly chosen laptop, P(battery fault) = ${a}, P(screen fault) = ${b}, and P(both) = ${ab}. What is the probability of at least one of these faults?`, numeric: true, options: nums([
      [a + b - ab, 4, 'Correct: the addition rule subtracts the overlap once.'],
      [a + b, 2, 'Right rule, one slip: subtract P(both), which was counted twice.'],
      [1 - (a + b - ab), 1, 'That is the probability of neither fault, the complement of what was asked.'],
      [a * b, 0, 'Multiplying is for the intersection of independent events.']], 4) };
  });
  B.MC(2, 'm2-atleast', () => {
    const p = R.pick([0.02, 0.05, 0.08, 0.1]), k = R.int(3, 6);
    return { stem: `Each of ${k} independent sensors fails during a test with probability ${p}. What is the probability that at least one sensor fails?`, numeric: true, options: nums([
      [1 - (1 - p) ** k, 4, `Correct: \\(1 - P(\\text{none fail}) = 1 - (1-${p})^{${k}}\\).`],
      [k * p, 2, 'Adding the probabilities double-counts the cases where two or more fail. Use the complement.'],
      [(1 - p) ** k, 1, 'That is the probability that none fail. At least one is its complement.'],
      [p ** k, 0, 'That is the probability that all of them fail.']], 4) };
  });
  B.MC(2, 'm2-dice', () => {
    const k = R.pick([4, 5, 6, 8, 9, 10]), w = 6 - Math.abs(7 - k);
    return { stem: `Two fair dice are rolled. What is the probability that the sum is ${k}?`, numeric: true, options: nums([
      [w / 36, 4, `Correct: ${w} of the 36 equally likely ordered pairs have sum ${k}.`],
      [Math.ceil(w / 2) / 36, 2, 'You counted unordered pairs. (1,3) and (3,1) are different outcomes.'],
      [1 / 11, 1, 'The 11 possible sums are not equally likely.'],
      [w / 6, 0, 'There are 36 ordered pairs, not 6.']], 4) };
  });
  B.MC(2, 'm2-conditional', () => {
    const m = [[R.int(20, 90), R.int(20, 90)], [R.int(20, 90), R.int(20, 90)]], N = m[0][0] + m[0][1] + m[1][0] + m[1][1];
    const tbl = table(['', 'Late', 'On time', 'Total'], [['Supplier A', m[0][0], m[0][1], m[0][0] + m[0][1]], ['Supplier B', m[1][0], m[1][1], m[1][0] + m[1][1]], ['Total', m[0][0] + m[1][0], m[0][1] + m[1][1], N]]);
    return { stem: `Deliveries are classified by supplier and status.${tbl}Find P(Supplier A | Late).`, numeric: true, options: nums([
      [m[0][0] / (m[0][0] + m[1][0]), 4, 'Correct: restrict to the late deliveries and divide by the Late column total.'],
      [m[0][0] / (m[0][0] + m[0][1]), 2, 'That is P(Late | Supplier A), the reverse condition.'],
      [m[0][0] / N, 1, 'That is P(Supplier A and Late). Given Late, divide by the Late total.'],
      [(m[0][0] + m[0][1]) / N, 0, 'That is P(Supplier A), ignoring the condition.']], 4) };
  });
  B.MC(2, 'm2-exclusive', () => ({ stem: R.pick(['Events A and B have P(A) = 0.3 and P(B) = 0.4, and they are mutually exclusive. Which statement is true?', 'Two events with positive probabilities cannot both happen. Which statement is true?']), options: [
    o('They are not independent, because P(A ∩ B) = 0 but P(A)P(B) > 0.', 4, 'Correct. If one happens the other cannot, so knowing one changes the chance of the other.'),
    o('They are independent, because they do not overlap.', 2, 'This confuses the two ideas. Disjoint events with positive probability are always dependent.'),
    o('P(A ∪ B) = P(A) + P(B) − P(A)P(B).', 1, 'For mutually exclusive events P(A ∩ B) = 0, so P(A ∪ B) = P(A) + P(B).'),
    o('Not enough information', 0, 'Mutual exclusivity is enough to decide.', { last: true })] }));
  B.MC(2, 'm2-noreplace', () => {
    const N = R.int(12, 25), D = R.int(3, 6);
    return { stem: `A bin holds ${N} resistors, ${D} of them out of tolerance. Two are drawn without replacement. What is the probability that both are out of tolerance?`, numeric: true, options: nums([
      [D / N * (D - 1) / (N - 1), 4, 'Correct: \\(P(D_1)P(D_2\\mid D_1)\\), with one fewer of each on the second draw.'],
      [(D / N) ** 2, 2, 'That assumes replacement. Without replacement the second draw changes.'],
      [2 * D / N, 0, 'Probabilities of “both” multiply; they do not add.'],
      [D * (D - 1) / (N * N), 1, 'The second denominator should also drop by one.']], 4) };
  });
  B.MC(2, 'm2-total', () => {
    const p = R.pick([0.3, 0.4, 0.6]), a = R.int(1, 4) / 100, b = R.int(5, 9) / 100;
    return { stem: `Line 1 makes ${p * 100}% of the units and line 2 makes the rest. The defect rates are ${a * 100}% on line 1 and ${b * 100}% on line 2. What is the overall defect rate?`, numeric: true, options: nums([
      [p * a + (1 - p) * b, 4, 'Correct: total probability weights each line’s rate by its share.'],
      [(a + b) / 2, 2, 'Averaging ignores that the lines make different shares of the units.'],
      [p * a, 1, 'That is only the line 1 branch. Add line 2.'],
      [a + b, 0, 'The rates must be weighted by the shares, not added.']], 4) };
  });
  B.MC(2, 'm2-bayes', () => {
    const prev = R.pick([0.01, 0.02, 0.05]), sens = R.pick([0.9, 0.95, 0.99]), fp = R.pick([0.02, 0.05, 0.1]), pos = prev * sens + (1 - prev) * fp;
    return { stem: `A fault occurs in ${prev * 100}% of units. A diagnostic flags ${sens * 100}% of faulty units and ${fp * 100}% of good units. Given that a unit is flagged, what is the probability that it is faulty?`, numeric: true, options: nums([
      [prev * sens / pos, 4, 'Correct: Bayes divides the joint probability by the total probability of a flag.'],
      [sens, 1, 'That is P(flag | faulty), the reverse condition.'],
      [prev * sens, 2, 'That is the joint P(faulty and flagged). Divide by P(flag).'],
      [prev, 0, 'That is the prior. The flag is evidence that changes it.']], 4) };
  });

  B.FR(2, 'm2-table', () => {
    const t = R.pick([{ r: ['Male', 'Female'], c: ['Yes', 'No', 'Undecided'], what: 'opinion on a survey question' }, { r: ['Day shift', 'Night shift'], c: ['Pass', 'Rework', 'Scrap'], what: 'inspection result' }]);
    const m = [t.c.map(() => R.int(20, 150)), t.c.map(() => R.int(20, 150))], rt = m.map(r => S.sum(r)), ct = t.c.map((_, j) => m[0][j] + m[1][j]), N = rt[0] + rt[1];
    const j = R.int(0, 2), pcr0 = m[0][j] / rt[0], pcr1 = m[1][j] / rt[1], pc = ct[j] / N, p0gc = m[0][j] / ct[j];
    return {
      stem: `Subjects are classified by group and ${t.what}.${table(['', ...t.c, 'Total'], [[t.r[0], ...m[0], rt[0]], [t.r[1], ...m[1], rt[1]], ['Total', ...ct, N]])}`,
      parts: [
        { type: 'num', label: `P(${t.c[j]} | ${t.r[0]})`, answer: pcr0, mistakes: [{ value: p0gc, msg: 'That reverses the condition.' }, { value: m[0][j] / N, msg: 'That is the joint probability.' }] },
        { type: 'num', label: `P(${t.c[j]} | ${t.r[1]})`, answer: pcr1, mistakes: [{ value: m[1][j] / ct[j], msg: 'That reverses the condition.' }] },
        { type: 'num', label: `P(${t.r[0]} | ${t.c[j]})`, answer: p0gc, mistakes: [{ value: pcr0, msg: 'That reverses the condition.' }] },
        { type: 'num', label: `P(${t.c[j]})`, answer: pc, mistakes: [] }],
      written: { prompt: `Are "${t.c[j]}" and the group independent? Explain using your numbers.`,
        keys: [`Compares P(${t.c[j]} | ${t.r[0]}) = ${n(pcr0)} with P(${t.c[j]}) = ${n(pc)} (or with the other group’s ${n(pcr1)}).`, 'Concludes not independent because the probabilities differ (or independent only if they are equal).'],
        model: `P(${t.c[j]} | ${t.r[0]}) = ${n(pcr0)} but P(${t.c[j]}) = ${n(pc)}. Knowing the group changes the probability, so the events are not independent.` },
      solution: [`Given ${t.r[0]}: \\(${m[0][j]}/${rt[0]} = ${tx(pcr0)}\\). Given ${t.r[1]}: \\(${m[1][j]}/${rt[1]} = ${tx(pcr1)}\\).`, `Given ${t.c[j]}: \\(${m[0][j]}/${ct[j]} = ${tx(p0gc)}\\).`, `Overall: \\(${ct[j]}/${N} = ${tx(pc)}\\).`],
      ti: `m <- rbind(c(${m[0].join(', ')}), c(${m[1].join(', ')})); m[1, ${j + 1}]/sum(m[1, ]); sum(m[, ${j + 1}])/sum(m)`,
      excel: `import numpy as np; m = np.array([[${m[0].join(', ')}], [${m[1].join(', ')}]]); m[0, ${j}]/m[0].sum(), m[:, ${j}].sum()/m.sum()`
    };
  });
  B.FR(2, 'm2-machines', () => {
    const sh = R.pick([[40, 35, 25], [50, 30, 20], [45, 30, 25]]).map(x => x / 100), rt = [R.int(1, 3), R.int(2, 4), R.int(4, 7)].map(x => x / 100);
    const joint = sh.map((s, i) => s * rt[i]), pD = S.sum(joint), post = joint[2] / pD;
    return {
      stem: `Machines M1, M2, and M3 make ${sh.map(x => x * 100 + '%').join(', ')} of a factory’s parts. Their defect rates are ${rt.map(x => S.num(x * 100, 1) + '%').join(', ')}. A part is chosen at random.`,
      parts: [
        { type: 'num', label: 'P(defective)', answer: pD, mistakes: [{ value: S.sum(rt) / 3, msg: 'Weight each rate by the machine’s share.' }] },
        { type: 'num', label: 'P(M3 | defective)', answer: post, mistakes: [{ value: rt[2], msg: 'That is P(defective | M3).' }, { value: joint[2], msg: 'That is the joint probability; divide by P(defective).' }] }],
      written: { prompt: 'M3 makes the fewest parts. Explain why its share of the defective parts is larger than its share of production.',
        keys: ['Notes that M3 has the highest defect rate.', `Uses the numbers: prior ${n(sh[2])} rises to posterior ${n(post)} given a defect.`],
        model: `M3 makes ${S.num(sh[2] * 100, 0)}% of the parts but has the highest defect rate (${S.num(rt[2] * 100, 1)}%), so a defective part is more likely to come from M3: P(M3 | D) = ${n(post)} > ${n(sh[2])}.` },
      solution: [`Joint probabilities: ${joint.map((j, i) => `\\(${tx(rt[i])}(${tx(sh[i])}) = ${tx(j)}\\)`).join(', ')}.`, `\\(P(D) = ${joint.map(j => tx(j)).join(' + ')} = ${tx(pD)}\\).`, `\\(P(M3\\mid D) = ${tx(joint[2])}/${tx(pD)} = ${tx(post)}\\).`],
      ti: `prior <- c(${sh.join(', ')}); rate <- c(${rt.join(', ')}); j <- prior*rate; sum(j); j[3]/sum(j)`,
      excel: `prior = [${sh.join(', ')}]; rate = [${rt.join(', ')}]; j = [p*r for p, r in zip(prior, rate)]; sum(j), j[2]/sum(j)`
    };
  });
})(globalThis);
