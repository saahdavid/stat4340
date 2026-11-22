/* Module 2 practice (multi-step): Probability. ti slot = R check, excel slot = Python check. */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const f4 = x => S.fmt(x, 4), n = (x, d = 4) => S.num(x, d).replace("−", "-");
  const code = s => `<code>${s.replace(/</g, "&lt;")}</code>`;
  const P = (label, answer, mistakes = [], tol = 0.0006) => ({ type: "num", label, answer, tol, show: f4(answer), mistakes });
  const setStr = a => `\\{${a.join(", ")}\\}`;

  // ---- set operations on an equally likely sample space ----
  const SPACES = [
    { name: "one roll of a fair die", S: [1, 2, 3, 4, 5, 6], events: [["even", x => x % 2 === 0], ["greater than 3", x => x > 3], ["at most 2", x => x <= 2], ["a multiple of 3", x => x % 3 === 0], ["odd", x => x % 2 === 1]] },
    { name: "a fair ten-sided die numbered 1 to 10", S: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], events: [["even", x => x % 2 === 0], ["greater than 6", x => x > 6], ["at most 4", x => x <= 4], ["a multiple of 3", x => x % 3 === 0], ["prime", x => [2, 3, 5, 7].includes(x)]] },
    { name: "picking one of 12 equally likely ID numbers 1 to 12", S: Array.from({ length: 12 }, (_, i) => i + 1), events: [["even", x => x % 2 === 0], ["greater than 8", x => x > 8], ["a multiple of 4", x => x % 4 === 0], ["a multiple of 3", x => x % 3 === 0], ["at most 5", x => x <= 5]] }
  ];
  function sets() {
    const sp = R.pick(SPACES), [ea, eb] = R.sample(sp.events, 2), N = sp.S.length;
    const A = sp.S.filter(ea[1]), B = sp.S.filter(eb[1]), I = A.filter(x => B.includes(x)), U = sp.S.filter(x => A.includes(x) || B.includes(x)), Ac = sp.S.filter(x => !A.includes(x));
    const AnotB = A.filter(x => !B.includes(x));
    const ask = R.pick(["notB", "comp"]);
    return {
      prompt: `<p>Consider ${sp.name}, with sample space \\(S = ${setStr(sp.S)}\\), all outcomes equally likely. Let \\(A\\) = the outcome is ${ea[0]} and \\(B\\) = the outcome is ${eb[0]}.</p><p>Find the probabilities below.</p>`,
      parts: [
        P(T`\(P(A\cap B)\)`, I.length / N, [{ value: A.length * B.length / (N * N), msg: "\\(P(A)P(B)\\) equals \\(P(A\\cap B)\\) only for independent events. Count the outcomes in both sets." }, { value: U.length / N, msg: "That is the union (A or B). The intersection keeps only outcomes in both." }]),
        P(T`\(P(A\cup B)\)`, U.length / N, [{ value: (A.length + B.length) / N, msg: "You counted the overlap twice. Subtract \\(P(A\\cap B)\\), or count each outcome once." }, { value: I.length / N, msg: "That is the intersection. The union keeps outcomes in A, in B, or in both." }]),
        ask === "notB" ? P(T`\(P(A\cap B')\) (A but not B)`, AnotB.length / N, [{ value: A.length / N, msg: "Remove the outcomes of A that are also in B." }])
          : P(T`\(P(A')\)`, Ac.length / N, [{ value: A.length / N, msg: "That is \\(P(A)\\). The complement is everything in S that is not in A." }])
      ],
      hand: [
        T`\(A = ${setStr(A)}\) and \(B = ${setStr(B)}\); \(N = ${N}\).`,
        T`\(A\cap B = ${I.length ? setStr(I) : "\\varnothing"}\), so \(P(A\cap B) = ${I.length}/${N} = ${f4(I.length / N)}\).`,
        T`\(A\cup B = ${setStr(U)}\), so \(P(A\cup B) = ${U.length}/${N} = ${f4(U.length / N)}\). Check: \(\frac{${A.length}+${B.length}-${I.length}}{${N}}\).`,
        ask === "notB" ? T`\(A\cap B' = ${AnotB.length ? setStr(AnotB) : "\\varnothing"}\): \(P = ${AnotB.length}/${N} = ${f4(AnotB.length / N)}\).` : T`\(A' = ${setStr(Ac)}\): \(P(A') = 1 - ${f4(A.length / N)} = ${f4(Ac.length / N)}\).`
      ],
      ti: code(`S <- 1:${N}; A <- S[${rCond(ea[0])}]; B <- S[${rCond(eb[0])}]; length(intersect(A, B))/${N}; length(union(A, B))/${N}`),
      excel: code(`S = range(1, ${N + 1}); A = {x for x in S if ${pyCond(ea[0])}}; B = {x for x in S if ${pyCond(eb[0])}}; len(A & B)/${N}, len(A | B)/${N}`)
    };
  }
  function rCond(e) { return ({ even: "S %% 2 == 0", odd: "S %% 2 == 1", "greater than 3": "S > 3", "greater than 6": "S > 6", "greater than 8": "S > 8", "at most 2": "S <= 2", "at most 4": "S <= 4", "at most 5": "S <= 5", "a multiple of 3": "S %% 3 == 0", "a multiple of 4": "S %% 4 == 0", prime: "S %in% c(2, 3, 5, 7)" })[e]; }
  function pyCond(e) { return ({ even: "x % 2 == 0", odd: "x % 2 == 1", "greater than 3": "x > 3", "greater than 6": "x > 6", "greater than 8": "x > 8", "at most 2": "x <= 2", "at most 4": "x <= 4", "at most 5": "x <= 5", "a multiple of 3": "x % 3 == 0", "a multiple of 4": "x % 4 == 0", prime: "x in (2, 3, 5, 7)" })[e]; }

  // ---- axioms: complement and addition rule ----
  const UNION_CTX = [
    ["a part has a surface flaw", "a part has a dimension flaw", "parts"],
    ["a student owns a laptop", "a student owns a tablet", "students"],
    ["a server has a memory fault", "a server has a disk fault", "servers"],
    ["a household has solar panels", "a household has an electric car", "households"]
  ];
  function union() {
    const c = R.pick(UNION_CTX), pA = R.int(15, 55) / 100, pB = R.int(10, 45) / 100;
    const pAB = R.int(2, Math.floor(Math.min(pA, pB) * 100) - 1) / 100, pU = pA + pB - pAB;
    const ask = R.pick(["neither", "only"]);
    return {
      prompt: `<p>Among ${c[2]}, let \\(A\\) = ${c[0]} and \\(B\\) = ${c[1]}. Suppose \\(P(A) = ${pA}\\), \\(P(B) = ${pB}\\), and \\(P(A\\cap B) = ${pAB}\\).</p>`,
      parts: [
        P(T`\(P(A\cup B)\)`, pU, [{ value: pA + pB, msg: "The addition rule subtracts the overlap: \\(P(A)+P(B)-P(A\\cap B)\\)." }, { value: pA * pB, msg: "That multiplies, which is for intersections of independent events. The union uses the addition rule." }]),
        ask === "neither" ? P(T`\(P(\text{neither})= P((A\cup B)')\)`, 1 - pU, [{ value: 1 - pA - pB, msg: "Use the complement of the union: \\(1 - P(A\\cup B)\\), with the overlap subtracted once." }, { value: pU, msg: "That is the probability of at least one. Neither is its complement." }])
          : P(T`\(P(A\cap B')\) (A only)`, pA - pAB, [{ value: pA, msg: "Remove the part of A that is also in B: \\(P(A) - P(A\\cap B)\\)." }, { value: pA - pB, msg: "Subtract the overlap \\(P(A\\cap B)\\), not all of \\(P(B)\\)." }])
      ],
      hand: [
        T`Addition rule: \(P(A\cup B) = ${pA} + ${pB} - ${pAB} = ${n(pU)}\).`,
        ask === "neither" ? T`Complement rule: \(P(\text{neither}) = 1 - ${n(pU)} = ${n(1 - pU)}\).` : T`\(P(A\cap B') = P(A) - P(A\cap B) = ${pA} - ${pAB} = ${n(pA - pAB)}\).`
      ],
      ti: code(`pA <- ${pA}; pB <- ${pB}; pAB <- ${pAB}; pA + pB - pAB; 1 - (pA + pB - pAB)`),
      excel: code(`pA, pB, pAB = ${pA}, ${pB}, ${pAB}; pA + pB - pAB, 1 - (pA + pB - pAB)`)
    };
  }
  function union3() {
    const a = R.int(30, 50) / 100, b = R.int(25, 45) / 100, c = R.int(20, 40) / 100, ab = R.int(8, 14) / 100, bc = R.int(6, 12) / 100, ac = R.int(5, 11) / 100, abc = R.int(1, 4) / 100;
    const u = a + b + c - ab - bc - ac + abc;
    return {
      prompt: T`<p>A component is inspected for three defects A, B, and C with \(P(A)=${a}\), \(P(B)=${b}\), \(P(C)=${c}\), \(P(A\cap B)=${ab}\), \(P(B\cap C)=${bc}\), \(P(A\cap C)=${ac}\), and \(P(A\cap B\cap C)=${abc}\).</p><p>Use inclusion–exclusion.</p>`,
      parts: [
        P(T`\(P(A\cup B\cup C)\)`, u, [{ value: a + b + c, msg: "Subtract the three pairwise overlaps, then add the triple overlap back." }, { value: a + b + c - ab - bc - ac, msg: "Almost: after subtracting the pairs, add \\(P(A\\cap B\\cap C)\\) back once." }]),
        P("P(no defect)", 1 - u, [{ value: u, msg: "That is at least one defect. Take the complement." }])
      ],
      hand: [T`\(P(A\cup B\cup C) = ${a}+${b}+${c}-${ab}-${bc}-${ac}+${abc} = ${n(u)}\).`, T`\(P(\text{none}) = 1 - ${n(u)} = ${n(1 - u)}\).`],
      ti: code(`${a} + ${b} + ${c} - ${ab} - ${bc} - ${ac} + ${abc}`), excel: code(`${a} + ${b} + ${c} - ${ab} - ${bc} - ${ac} + ${abc}`)
    };
  }

  // ---- equally likely outcomes: two dice and coins ----
  function equally() {
    const kind = R.pick(["sum", "sumGE", "coins"]);
    if (kind === "coins") {
      const k = R.pick([3, 4]), want = R.int(1, k - 1), N = 2 ** k;
      const choose = (a, b) => { let r = 1; for (let i = 1; i <= b; i++) r = r * (a - b + i) / i; return r; };
      const c = choose(k, want), atLeast = 1 - 1 / N;
      return {
        prompt: `<p>Toss a fair coin ${k} times. All ${N} sequences of H and T are equally likely.</p>`,
        parts: [
          { type: "num", label: "Number of outcomes \\(N\\)", answer: N, tol: 0.01, show: String(N), mistakes: [{ value: 2 * k, msg: `Each toss doubles the count: \\(2^{${k}}\\), not \\(2\\times ${k}\\).` }] },
          P(`P(exactly ${want} head${want > 1 ? "s" : ""})`, c / N, [{ value: 1 / N, msg: `More than one sequence has exactly ${want} head${want > 1 ? "s" : ""}. Count them all.` }, { value: want / k, msg: "Count the equally likely sequences instead of dividing heads by tosses." }]),
          P("P(at least one head)", atLeast, [{ value: 1 / N, msg: "That is the probability of no heads (all tails). Take the complement." }, { value: 0.5, msg: "Use the complement: \\(1 - P(\\text{all tails})\\)." }])
        ],
        hand: [T`Each toss has 2 outcomes, so \(N = 2^{${k}} = ${N}\).`, T`Sequences with exactly ${want} heads: \(\binom{${k}}{${want}} = ${c}\), so \(P = ${c}/${N} = ${f4(c / N)}\).`, T`At least one head is the complement of all tails: \(1 - 1/${N} = ${f4(atLeast)}\).`],
        ti: code(`N <- 2^${k}; choose(${k}, ${want})/N; 1 - 1/N`), excel: code(`from math import comb; N = 2**${k}; comb(${k}, ${want})/N, 1 - 1/N`)
      };
    }
    const k = kind === "sum" ? R.int(3, 11) : R.int(7, 11);
    const ways = kind === "sum" ? 6 - Math.abs(7 - k) : Array.from({ length: 13 - k }, (_, i) => 6 - Math.abs(7 - (k + i))).reduce((a, b) => a + b, 0);
    const lst = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (kind === "sum" ? a + b === k : a + b >= k) lst.push(`(${a},${b})`);
    return {
      prompt: `<p>Roll two fair dice (one red, one blue). All 36 ordered pairs are equally likely.</p><p>Find the probability that the sum is ${kind === "sum" ? `exactly ${k}` : `at least ${k}`}.</p>`,
      parts: [
        { type: "num", label: "\\(N(A)\\): outcomes in the event", answer: ways, tol: 0.01, show: String(ways), mistakes: [{ value: Math.ceil(ways / 2), msg: "The dice are different colors, so (1,2) and (2,1) are different outcomes. Count both orders." }] },
        P(T`\(P(A) = N(A)/N\)`, ways / 36, [{ value: ways / 11, msg: "There are 11 possible sums, but they are not equally likely. Use the 36 equally likely pairs." }, { value: ways / 21, msg: "Use all 36 ordered pairs, not 21 unordered ones." }])
      ],
      hand: [`The event contains ${lst.join(", ")}: \\(N(A) = ${ways}\\).`, T`\(P(A) = ${ways}/36 = ${f4(ways / 36)}\).`],
      ti: code(`d <- expand.grid(a = 1:6, b = 1:6); mean(d$a + d$b ${kind === "sum" ? "==" : ">="} ${k})`),
      excel: code(`from itertools import product; sum(a + b ${kind === "sum" ? "==" : ">="} ${k} for a, b in product(range(1, 7), repeat=2))/36`)
    };
  }

  // ---- conditional probability from a two-way table ----
  const TABLES = [
    { row: "Gender", rows: ["Male", "Female"], cols: ["Yes", "No", "Undecided"], what: "whether emerging infectious diseases abroad are a serious threat" },
    { row: "Shift", rows: ["Day", "Night"], cols: ["Pass", "Rework", "Scrap"], what: "the inspection result of a part" },
    { row: "Major", rows: ["Engineering", "Computer science"], cols: ["Internship", "Research", "Neither"], what: "summer activity" },
    { row: "Supplier", rows: ["Supplier A", "Supplier B"], cols: ["On time", "Late", "Damaged"], what: "the status of a delivery" }
  ];
  function tbl(t, m) {
    const rt = m.map(r => S.sum(r)), ct = t.cols.map((_, j) => m[0][j] + m[1][j]), N = S.sum(rt);
    return { rt, ct, N, html: `<div class="table-scroll"><table class="data"><thead><tr><th>${t.row}</th>${t.cols.map(c => `<th>${c}</th>`).join("")}<th>Total</th></tr></thead><tbody>${m.map((r, i) => `<tr><td>${t.rows[i]}</td>${r.map(v => `<td>${v}</td>`).join("")}<td>${rt[i]}</td></tr>`).join("")}<tr><td><strong>Total</strong></td>${ct.map(v => `<td>${v}</td>`).join("")}<td>${N}</td></tr></tbody></table></div>` };
  }
  function conditional() {
    const t = R.pick(TABLES), m = [t.cols.map(() => R.int(12, 160)), t.cols.map(() => R.int(12, 160))], g = tbl(t, m);
    const i = R.int(0, 1), j = R.int(0, 2);
    const pCgR = m[i][j] / g.rt[i], pRgC = m[i][j] / g.ct[j], pCol = g.ct[j] / g.N;
    return {
      prompt: `<p>The table classifies subjects by ${t.row.toLowerCase()} and ${t.what}. One subject is chosen at random.</p>${g.html}`,
      parts: [
        P(`P(${t.cols[j]} | ${t.rows[i]})`, pCgR, [{ value: pRgC, msg: `That is P(${t.rows[i]} | ${t.cols[j]}). Given ${t.rows[i]}, divide by the ${t.rows[i]} row total.` }, { value: m[i][j] / g.N, msg: "That is the joint probability. For a conditional probability divide by the total of the given group." }]),
        P(`P(${t.rows[i]} | ${t.cols[j]})`, pRgC, [{ value: pCgR, msg: `That is P(${t.cols[j]} | ${t.rows[i]}). Given ${t.cols[j]}, divide by the ${t.cols[j]} column total.` }]),
        P(`P(${t.cols[j]})`, pCol, [{ value: pCgR, msg: "That conditions on a row. The overall probability uses the column total over the grand total." }])
      ],
      hand: [
        T`Given ${t.rows[i]}: restrict to the ${g.rt[i]} subjects in that row. \(P = ${m[i][j]}/${g.rt[i]} = ${f4(pCgR)}\).`,
        T`Given ${t.cols[j]}: restrict to the ${g.ct[j]} subjects in that column. \(P = ${m[i][j]}/${g.ct[j]} = ${f4(pRgC)}\).`,
        T`Overall: \(P(\text{${t.cols[j]}}) = ${g.ct[j]}/${g.N} = ${f4(pCol)}\).`
      ],
      ti: code(`m <- matrix(c(${m[0].join(", ")}, ${m[1].join(", ")}), nrow = 2, byrow = TRUE); m[${i + 1}, ${j + 1}]/sum(m[${i + 1}, ]); m[${i + 1}, ${j + 1}]/sum(m[, ${j + 1}])`),
      excel: code(`import numpy as np; m = np.array([[${m[0].join(", ")}], [${m[1].join(", ")}]]); m[${i}, ${j}]/m[${i}].sum(), m[${i}, ${j}]/m[:, ${j}].sum()`)
    };
  }

  // ---- independence from a 2x2 table ----
  const IND = [
    { A: "the test is positive", B: "the condition is present", r: ["Condition present", "Condition absent"], c: ["Positive", "Negative"] },
    { A: "the part is defective", B: "it was made on the night shift", r: ["Night shift", "Day shift"], c: ["Defective", "Good"] },
    { A: "the user clicked the ad", B: "the user is on mobile", r: ["Mobile", "Desktop"], c: ["Clicked", "Did not click"] }
  ];
  function independence() {
    const t = R.pick(IND), indep = R.coin(0.45);
    let a, b, c, d;
    if (indep) { const pR = R.pick([0.2, 0.25, 0.4, 0.5]), pC = R.pick([0.2, 0.3, 0.4, 0.6]), N = R.pick([500, 1000, 2000]); a = Math.round(N * pR * pC); b = Math.round(N * pR) - a; c = Math.round(N * pC) - a; d = N - a - b - c; }
    else { a = R.int(20, 90); b = R.int(30, 200); c = R.int(30, 200); d = R.int(200, 900); if (Math.abs(a / (a + b) - (a + c) / (a + b + c + d)) < 0.02) a += 25; }
    const N = a + b + c + d, pC = (a + c) / N, pCgR = a / (a + b), yes = Math.abs(pCgR - pC) < 1e-9;
    return {
      prompt: `<p>Use the table to decide whether "${t.c[0]}" and "${t.r[0]}" are independent.</p><div class="table-scroll"><table class="data"><thead><tr><th></th><th>${t.c[0]}</th><th>${t.c[1]}</th><th>Total</th></tr></thead><tbody><tr><td>${t.r[0]}</td><td>${a}</td><td>${b}</td><td>${a + b}</td></tr><tr><td>${t.r[1]}</td><td>${c}</td><td>${d}</td><td>${c + d}</td></tr><tr><td><strong>Total</strong></td><td>${a + c}</td><td>${b + d}</td><td>${N}</td></tr></tbody></table></div>`,
      parts: [
        P(`P(${t.c[0]})`, pC, [{ value: pCgR, msg: "That conditions on a row. Use the column total over the grand total." }]),
        P(`P(${t.c[0]} | ${t.r[0]})`, pCgR, [{ value: a / (a + c), msg: `Given ${t.r[0]}, divide by the ${t.r[0]} row total.` }]),
        { type: "choice", label: "Are the events independent?", options: ["Yes, the two probabilities are equal", "No, the two probabilities differ"], answer: yes ? 0 : 1, fixed: true, why: { 0: "They are not equal, so knowing the row changes the probability: not independent.", 1: "They are equal (up to rounding of the table), so the row gives no information: independent." } }
      ],
      hand: [T`\(P(\text{${t.c[0]}}) = ${a + c}/${N} = ${f4(pC)}\).`, T`\(P(\text{${t.c[0]}} \mid \text{${t.r[0]}}) = ${a}/${a + b} = ${f4(pCgR)}\).`, yes ? "The two are equal, so the events are independent." : "The two differ, so the events are not independent."],
      ti: code(`a <- ${a}; b <- ${b}; c <- ${c}; d <- ${d}; (a + c)/(a + b + c + d); a/(a + b)`), excel: code(`a, b, c, d = ${a}, ${b}, ${c}, ${d}; (a + c)/(a + b + c + d), a/(a + b)`)
    };
  }

  // ---- multiplication rule: sequential trials and draws without replacement ----
  function multiply() {
    if (R.coin()) {
      const p1 = R.int(70, 92) / 100, p2 = R.int(85, 99) / 100, ctx = R.pick([["an operation", "operation"], ["a weld", "weld"], ["a boot attempt", "attempt"]]);
      const both = (1 - p1) * (1 - p2);
      return {
        prompt: `<p>${ctx[0][0].toUpperCase() + ctx[0].slice(1)} succeeds on the first try with probability ${p1}. If it fails, a second ${ctx[1]} is made, which succeeds with probability ${p2}.</p>`,
        parts: [
          P("P(both attempts fail)", both, [{ value: (1 - p1) + (1 - p2), msg: "Both must fail, so multiply: \\(P(F_1)P(F_2\\mid F_1)\\)." }, { value: p1 * p2, msg: "That multiplies the success probabilities. Use the failure probabilities." }]),
          P("P(success within two attempts)", 1 - both, [{ value: p1 + p2, msg: "Use the complement: \\(1 - P(\\text{both fail})\\)." }, { value: p1 * p2, msg: "Success on the second try only happens after a first failure. Use \\(1 - P(\\text{both fail})\\)." }])
        ],
        hand: [T`\(P(F_1) = 1 - ${p1} = ${n(1 - p1)}\) and \(P(F_2\mid F_1) = 1 - ${p2} = ${n(1 - p2)}\).`, T`\(P(F_1\cap F_2) = P(F_2\mid F_1)P(F_1) = ${n(1 - p2)}(${n(1 - p1)}) = ${f4(both)}\).`, T`\(P(\text{success}) = 1 - ${f4(both)} = ${f4(1 - both)}\).`],
        ti: code(`(1 - ${p1}) * (1 - ${p2})`), excel: code(`(1 - ${p1}) * (1 - ${p2})`)
      };
    }
    const N = R.int(15, 30), D = R.int(2, 6), G = N - D, pBoth = D / N * (D - 1) / (N - 1), pGD = G / N * D / (N - 1);
    return {
      prompt: `<p>A box holds ${N} fuses, of which ${D} are defective. Two fuses are drawn one at a time <strong>without replacement</strong>.</p>`,
      parts: [
        P("P(both defective)", pBoth, [{ value: (D / N) ** 2, msg: "Without replacement, the second draw has one fewer defective and one fewer fuse." }]),
        P("P(first good, second defective)", pGD, [{ value: G / N * D / N, msg: "After a good fuse is removed there are \\(N-1\\) fuses left." }, { value: 2 * pGD, msg: "That is P(exactly one defective) in either order. The question fixes the order." }])
      ],
      hand: [T`\(P(D_1\cap D_2) = P(D_1)P(D_2\mid D_1) = \frac{${D}}{${N}}\cdot\frac{${D - 1}}{${N - 1}} = ${f4(pBoth)}\).`, T`\(P(G_1\cap D_2) = \frac{${G}}{${N}}\cdot\frac{${D}}{${N - 1}} = ${f4(pGD)}\).`],
      ti: code(`(${D}/${N}) * (${D - 1}/${N - 1}); (${G}/${N}) * (${D}/${N - 1})`), excel: code(`(${D}/${N}) * (${D - 1}/${N - 1}), (${G}/${N}) * (${D}/${N - 1})`)
    };
  }

  // ---- total probability and Bayes with 2 or 3 branches ----
  function scenario() {
    if (R.coin()) {
      const k = 3, shares = R.pick([[40, 35, 25], [50, 30, 20], [45, 35, 20], [30, 45, 25]]).map(x => x / 100), rates = [R.int(1, 3), R.int(2, 4), R.int(4, 7)].map(x => x / 100);
      return { k, names: ["M1", "M2", "M3"], prior: shares, like: rates, ev: "defective", intro: `A factory has three machines M1, M2, and M3. They make ${shares.map(x => x * 100 + "%").join(", ")} of the parts, and ${rates.map(x => S.num(x * 100, 1) + "%").join(", ")} of their parts are defective (D).` };
    }
    const prev = R.pick([0.05, 0.1, 0.2, 0.3, 0.55]), sens = R.int(90, 99) / 100, spec = R.pick([0.9, 0.95, 0.97, 0.99, 0.992]);
    return { k: 2, names: ["C", "C′"], prior: [prev, 1 - prev], like: [sens, 1 - spec], ev: "positive", intro: `A condition C is present in ${S.num(prev * 100, 1)}% of the people tested. The test is positive for ${S.num(sens * 100, 1)}% of people with C and negative for ${S.num(spec * 100, 1)}% of people without C.` };
  }
  function total() {
    const sc = scenario(), joint = sc.prior.map((p, i) => p * sc.like[i]), pB = S.sum(joint);
    return {
      prompt: `<p>${sc.intro}</p><p>Find the probability that a randomly chosen ${sc.k === 3 ? "part is defective" : "person tests positive"}.</p>`,
      parts: [
        ...joint.map((j, i) => P(T`\(P(${sc.k === 3 ? "D" : "+"}\cap ${sc.names[i].replace("′", "'")})\)`, j, [{ value: sc.like[i], msg: "That is the conditional probability. Multiply it by the branch probability \\(P(A_i)\\)." }])),
        P(T`\(P(${sc.k === 3 ? "D" : "+"})\)`, pB, [{ value: S.sum(sc.like) / sc.k, msg: "Do not average the conditional rates. Weight each by its branch probability and add." }, { value: joint[0], msg: "Add every branch that ends in the event, not just the first." }])
      ],
      hand: [
        ...joint.map((j, i) => T`\(P(\text{${sc.ev}}\mid ${sc.names[i].replace("′", "'")})P(${sc.names[i].replace("′", "'")}) = ${n(sc.like[i])}(${n(sc.prior[i])}) = ${f4(j)}\).`),
        T`Total probability: \(P = ${joint.map(f4).join(" + ")} = ${f4(pB)}\).`
      ],
      ti: code(`prior <- c(${sc.prior.map(x => n(x)).join(", ")}); like <- c(${sc.like.map(x => n(x)).join(", ")}); sum(prior * like)`),
      excel: code(`prior = [${sc.prior.map(x => n(x)).join(", ")}]; like = [${sc.like.map(x => n(x)).join(", ")}]; sum(p*l for p, l in zip(prior, like))`)
    };
  }
  function bayes() {
    const sc = scenario(), joint = sc.prior.map((p, i) => p * sc.like[i]), pB = S.sum(joint), j = sc.k === 3 ? R.int(0, 2) : 0, post = joint[j] / pB, nm = sc.names[j].replace("′", "'"), E = sc.k === 3 ? "D" : "+";
    return {
      prompt: `<p>${sc.intro}</p><p>Given that a ${sc.k === 3 ? "part is defective" : "person tests positive"}, find the probability that ${sc.k === 3 ? `it came from ${sc.names[j]}` : "the person has C"}.</p>`,
      parts: [
        P(T`\(P(${E})\)`, pB, [{ value: joint[j], msg: "That is one branch. P of the event adds every branch that ends in it." }]),
        P(T`\(P(${nm}\mid ${E})\)`, post, [{ value: sc.like[j], msg: T`That is \(P(${E}\mid ${nm})\), the reverse condition. Bayes divides the joint probability by \(P(${E})\).` }, { value: joint[j], msg: T`That is the joint \(P(${E}\cap ${nm})\). Divide it by \(P(${E})\).` }, { value: sc.prior[j], msg: "That is the prior. Update it with the evidence." }])
      ],
      hand: [T`Joint: \(P(${E}\cap ${nm}) = ${n(sc.like[j])}(${n(sc.prior[j])}) = ${f4(joint[j])}\).`, T`Total: \(P(${E}) = ${joint.map(f4).join(" + ")} = ${f4(pB)}\).`, T`Bayes: \(P(${nm}\mid ${E}) = ${f4(joint[j])}/${f4(pB)} = ${f4(post)}\).`],
      ti: code(`prior <- c(${sc.prior.map(x => n(x)).join(", ")}); like <- c(${sc.like.map(x => n(x)).join(", ")}); joint <- prior * like; joint[${j + 1}]/sum(joint)`),
      excel: code(`prior = [${sc.prior.map(x => n(x)).join(", ")}]; like = [${sc.like.map(x => n(x)).join(", ")}]; joint = [p*l for p, l in zip(prior, like)]; joint[${j}]/sum(joint)`)
    };
  }

  HandKit.mount("#practice-app", {
    module: 2,
    skills: [
      { id: "m2-setops", title: "Set operations", gen: sets },
      { id: "m2-addition", title: "Complement and addition rules", gen: union },
      { id: "m2-incl3", title: "Inclusion–exclusion for three events", gen: union3 },
      { id: "m2-equally", title: "Equally likely outcomes", gen: equally },
      { id: "m2-cond", title: "Conditional probability from a table", gen: conditional },
      { id: "m2-indep", title: "Checking independence", gen: independence },
      { id: "m2-mult", title: "Multiplication rule", gen: multiply },
      { id: "m2-totalp", title: "Total probability", gen: total },
      { id: "m2-bayesrule", title: "Bayes’ theorem", gen: bayes }
    ]
  });
})();
