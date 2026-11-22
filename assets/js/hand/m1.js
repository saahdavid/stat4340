/* Module 1 practice (multi-step): Descriptive Statistics.
   Each generator returns {prompt, parts, hand, ti, excel}; for STAT 4340 the ti slot holds the R check
   and the excel slot holds the Python check (labelled R and Python on screen). */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const n = (x, d = 4) => S.num(x, d).replace("−", "-");   // number for TeX
  const list = a => a.map(v => n(v)).join(", ");
  const code = s => `<code>${s.replace(/</g, "&lt;")}</code>`;
  const ord = k => k + (k % 100 >= 11 && k % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][k % 10] || "th");
  const rvec = a => `c(${a.join(", ")})`, pvec = a => `[${a.join(", ")}]`;

  // ---- population, sample, variable ----
  const TYPES = ["Categorical, nominal", "Categorical, ordinal", "Quantitative, discrete", "Quantitative, continuous"];
  const WHY = [
    "The values are names of groups with no natural order, so the variable is categorical and nominal.",
    "The values are groups with a natural order, so the variable is categorical and ordinal.",
    "The values are counts: only certain fixed values with nothing in between. That makes it quantitative and discrete.",
    "The values are measurements that can fall anywhere in an interval, so the variable is quantitative and continuous."
  ];
  const STUDIES = [
    { s: k => `In a survey of ${k} students from college campuses across the US, the average student loan debt was $${R.int(35, 48)},${R.int(100, 999)}.`, pop: "All US college students", samp: k => `The ${k} students surveyed`, v: "Student loan debt (dollars)", t: 3, k: [1200, 2500] },
    { s: k => `A poll of ${k} adult US internet users asks whether they believe robots will perform most human activities within 30 years.`, pop: "All adult US internet users", samp: k => `The ${k} adults polled`, v: "Believes robots will perform most human activities (yes/no)", t: 0, k: [800, 1600] },
    { s: k => `An opinion poll of ${k} adult NBA fans asks which non-playoff team has the best future.`, pop: "All adult NBA fans", samp: k => `The ${k} fans polled`, v: "Team named as having the best future", t: 0, k: [600, 1500] },
    { s: k => `An engineer measures the tensile strength (MPa) of ${k} steel bars taken from this week's production.`, pop: "All steel bars produced this week", samp: k => `The ${k} bars measured`, v: "Tensile strength (MPa)", t: 3, k: [20, 60] },
    { s: k => `A plant manager inspects ${k} shipments and records the number of defective items in each.`, pop: "All shipments from the plant", samp: k => `The ${k} shipments inspected`, v: "Number of defective items in a shipment", t: 2, k: [25, 80] },
    { s: k => `A hospital records the blood type of ${k} randomly chosen patients.`, pop: "All patients of the hospital", samp: k => `The ${k} patients chosen`, v: "Blood type (A, B, AB, O)", t: 0, k: [100, 400] },
    { s: k => `Researchers ask ${k} randomly selected households to rate their satisfaction with the city's water service (low, medium, high).`, pop: "All households served by the city", samp: k => `The ${k} households selected`, v: "Satisfaction rating (low, medium, high)", t: 1, k: [150, 600] },
    { s: k => `Biologists time ${k} three-toed sloths and record each sloth's speed in meters per minute.`, pop: "All three-toed sloths", samp: k => `The ${k} sloths timed`, v: "Speed (meters per minute)", t: 3, k: [12, 40] },
    { s: k => `A survey of ${k} households records the number of computers each household owns.`, pop: "All households in the survey area", samp: k => `The ${k} households surveyed`, v: "Number of computers owned", t: 2, k: [200, 900] },
    { s: k => `A university surveys ${k} recent alumni and records each one's highest education level (bachelor's, master's, doctorate).`, pop: "All recent alumni of the university", samp: k => `The ${k} alumni surveyed`, v: "Highest education level", t: 1, k: [300, 1200] }
  ];
  function popSample() {
    const st = R.pick(STUDIES), k = R.int(...st.k);
    const others = STUDIES.filter(x => x !== st);
    const popOpts = R.shuffle([st.pop, `${st.samp(k)}`, R.pick(others).pop]);
    const varOpts = R.shuffle([st.v, R.pick(others.filter(x => x.v !== st.v)).v, st.pop]);
    return {
      prompt: `<p>${st.s(k)}</p><p>Identify the population, the variable, and the type of variable.</p>`,
      parts: [
        { type: "choice", label: "Population", options: popOpts, answer: popOpts.indexOf(st.pop),
          why: Object.fromEntries(popOpts.map((o, i) => [i, o === st.samp(k) ? "That is the sample: the part of the population actually observed. The population is the whole group we want to learn about." : "That group belongs to a different study. Ask: whom do we want conclusions about?"])) },
        { type: "choice", label: "Variable", options: varOpts, answer: varOpts.indexOf(st.v),
          why: Object.fromEntries(varOpts.map((o, i) => [i, o === st.pop ? "That is the population, not a characteristic recorded for each individual." : "That characteristic is not what this study records."])) },
        { type: "choice", label: "Type of variable", options: TYPES, answer: st.t, fixed: true,
          why: Object.fromEntries(TYPES.map((_, i) => [i, WHY[st.t]])) }
      ],
      hand: [
        `Population: the whole group we want to learn about: ${st.pop.toLowerCase()}.`,
        `Sample: the part actually observed: ${st.samp(k).toLowerCase()}.`,
        `Variable: the characteristic recorded for each individual: ${st.v.toLowerCase()}.`,
        WHY[st.t]
      ]
    };
  }

  const VARS = [
    ["Blood type of a patient (A, B, AB, O)", 0], ["Eye color (brown, blue, green, hazel)", 0],
    ["Zip code of a customer's address", 0, "Zip codes are numbers, but they are labels. Averaging them makes no sense, so the variable is categorical and nominal."],
    ["Programming language a developer uses most", 0], ["Whether a weld passes inspection (pass or fail)", 0],
    ["Socioeconomic status (low, medium, high)", 1], ["Education level (high school, bachelor's, master's, doctorate)", 1],
    ["Severity of a software bug (minor, major, critical)", 1], ["T-shirt size (S, M, L, XL)", 1],
    ["Number of computers owned by a household", 2], ["Number of pets in a household", 2], ["Number of defective chips on a wafer", 2],
    ["Number of server requests per second", 2], ["Age in whole years", 2, "Age recorded in whole years takes only certain fixed values, so in our notes it is quantitative and discrete."],
    ["Height of a student", 3], ["Weight of a newborn calf", 3], ["Annual income", 3], ["Time for a circuit to fail, in hours", 3],
    ["Tensile strength of a steel bar", 3], ["Speed of a three-toed sloth (meters per minute)", 3]
  ];
  function varType() {
    const [name, t, special] = R.pick(VARS);
    const why = {};
    TYPES.forEach((_, i) => { if (i !== t) why[i] = special || WHY[t]; });
    return {
      prompt: `<p>Classify this variable:</p><p><strong>${name}</strong></p>`,
      parts: [{ type: "choice", label: "Variable type", options: TYPES, answer: t, fixed: true, why }],
      hand: [
        "Ask whether arithmetic on the values makes sense. If not, the variable is categorical; if so, it is quantitative.",
        "Categorical: are the groups in a natural order? Yes means ordinal, no means nominal. Quantitative: only certain fixed values (discrete) or any value in an interval (continuous)?",
        special || WHY[t]
      ]
    };
  }

  // ---- sampling methods ----
  const METHODS = ["Simple random sampling", "Systematic sampling", "Stratified sampling", "Cluster sampling"];
  const MWHY = [
    "Every possible group of that size was equally likely to be chosen: simple random sampling.",
    "A random start followed by every kth unit is systematic sampling.",
    "The population was split into similar groups (strata) and a random sample was taken within each one: stratified sampling.",
    "Whole groups (clusters) were chosen at random and everyone in them was included: cluster sampling."
  ];
  const SCEN = [
    [k => `A quality engineer numbers the ${k * 20} parts made today, picks a random starting part between 1 and ${k}, and then inspects every ${ord(k)} part.`, 1],
    [k => `A city puts the names of all ${k * 100} registered voters into software that selects ${k * 2} names so that every possible group of ${k * 2} is equally likely.`, 0],
    [k => `A university splits its students by class year (first-year, sophomore, junior, senior) and randomly selects ${k * 5} students from each class year.`, 2],
    [k => `A school district randomly selects ${Math.max(2, Math.round(k / 3))} of its ${k * 2} schools and surveys every teacher in the chosen schools.`, 3],
    [k => `An airline randomly chooses ${Math.max(2, Math.round(k / 4))} of today's flights and asks every passenger on those flights to complete a survey.`, 3],
    [k => `A manufacturer divides its batteries by production line (A, B, C), because the lines differ, and tests a random sample of ${k} batteries from each line.`, 2],
    [k => `A website picks a random visitor among the first ${k} each hour, then surveys every ${ord(k)} visitor after that.`, 1],
    [k => `A researcher assigns a number to each of the ${k * 40} sensors in a network and uses a random number generator to choose ${k} of them, each set of ${k} equally likely.`, 0]
  ];
  function sampMethod() {
    const [f, t] = R.pick(SCEN), k = R.int(8, 25);
    const sys = t === 1, start = R.int(1, k), j = R.int(4, 12);
    const parts = [{ type: "choice", label: "Sampling method", options: METHODS, answer: t, fixed: true, why: Object.fromEntries(METHODS.map((_, i) => [i, MWHY[t]])) }];
    const hand = ["Ask how the units were chosen: one at a time at random, every kth, within groups, or whole groups.", MWHY[t]];
    let prompt = `<p>${f(k)}</p><p>Which sampling method is this?</p>`;
    if (sys) {
      const pos = start + (j - 1) * k;
      prompt += `<p>If the random start is <strong>${start}</strong>, in what position is the <strong>${ord(j)}</strong> unit selected?</p>`;
      parts.push({ type: "num", label: `Position of the ${ord(j)} unit selected`, answer: pos, tol: 0.01, show: String(pos),
        mistakes: [{ value: start + j * k, msg: `The first unit is the start itself. The ${ord(j)} unit is \\(j-1 = ${j - 1}\\) steps of ${k} after it.` },
                   { value: j * k, msg: "Start from the random starting point, not from 0." }] });
      hand.push(T`Position of the jth unit: start \(+ (j-1)k = ${start} + (${j}-1)(${k}) = ${pos}\).`);
    }
    return { prompt, parts, hand };
  }

  // ---- mean and median ----
  const CENTER_CTX = [["sloth speeds (meters per minute)", 2.0, 6.0, 1], ["download times (seconds)", 12, 58, 0], ["daily defect counts", 0, 30, 0], ["battery lifetimes (hours)", 40, 95, 0]];
  function center() {
    const [ctx, lo, hi, dec] = R.pick(CENTER_CTX);
    const size = R.int(7, 10);
    const draw = () => dec ? Math.round((lo + Math.random() * (hi - lo)) * 10) / 10 : R.int(lo, hi);
    const data = Array.from({ length: size }, draw);
    if (R.coin(0.4)) data[R.int(0, size - 1)] = dec ? Math.round(hi * 2.1 * 10) / 10 : Math.round(hi * R.int(18, 25) / 10);
    const srt = S.sorted(data), m = S.mean(data), med = S.median(data);
    const mistakes = [];
    const mid = size % 2 ? data[(size - 1) / 2] : (data[size / 2 - 1] + data[size / 2]) / 2;
    if (Math.abs(mid - med) > 1e-9) mistakes.push({ value: mid, msg: "You took the middle of the list as given. Sort the data from smallest to largest first." });
    if (size % 2 === 0) [srt[size / 2 - 1], srt[size / 2]].forEach(v => { if (Math.abs(v - med) > 1e-9) mistakes.push({ value: v, msg: "With an even number of values there are two middle values. Average them." }); });
    if (size % 2 && (size + 1) / 2 !== med) mistakes.push({ value: (size + 1) / 2, msg: "\\((n+1)/2\\) is the <em>position</em> of the median. Report the value in that position." });
    const pos = size % 2 ? T`the value in position \(\frac{${size}+1}{2} = ${(size + 1) / 2}\)` : T`the average of the values in positions \(\frac{${size}}{2} = ${size / 2}\) and ${size / 2 + 1}`;
    return {
      prompt: `<p>Find the sample mean and the sample median of these ${size} ${ctx}:</p><p><strong>${list(data)}</strong></p>`,
      parts: [
        { type: "num", label: T`Mean \(\bar x\) (2 decimals)`, answer: m, tol: 0.006, show: S.fmt(m, 2),
          mistakes: [{ value: S.sum(data) / (size - 1), msg: "You divided by \\(n-1\\). The mean divides the sum by \\(n\\)." }] },
        { type: "num", label: T`Median \(\tilde x\)`, answer: med, tol: 0.01, show: S.num(med, 2), mistakes }
      ],
      hand: [
        T`Sum: \(${data.map(v => n(v)).join(" + ")} = ${n(S.sum(data))}\). Divide by \(n = ${size}\): \(\bar x = \frac{${n(S.sum(data))}}{${size}} = ${S.fmt(m, 2)}\).`,
        T`Sort: ${list(srt)}.`,
        T`Since \(n = ${size}\) is ${size % 2 ? "odd" : "even"}, the median is ${pos}: \(\tilde x = ${n(med, 2)}\).`,
        Math.abs(m - med) > (hi - lo) / 8 ? `The mean (${S.fmt(m, 2)}) and median (${n(med, 2)}) differ noticeably: the extreme value pulls the mean toward it, while the median resists.` : "The mean and median are close, which fits a roughly symmetric set of values."
      ],
      ti: code(`x <- ${rvec(data)}; mean(x); median(x)`),
      excel: code(`import numpy as np; x = np.array(${pvec(data)}); x.mean(), np.median(x)`)
    };
  }

  // ---- sample variance and SD (definitional formula) ----
  function stdev() {
    const size = R.pick([5, 5, 6]);
    let data;
    do { data = Array.from({ length: size }, () => R.int(1, 20)); } while (S.sum(data) % size !== 0 || S.sd(data) === 0);
    const m = S.mean(data), dev = data.map(x => x - m), sq = dev.map(d => d * d), ss = S.sum(sq);
    const v = ss / (size - 1), s = Math.sqrt(v);
    return {
      prompt: `<p>Find the sample variance and sample standard deviation of</p><p><strong>${list(data)}</strong></p>`,
      parts: [
        { type: "num", label: T`\(S_{xx} = \sum (x_i-\bar x)^2\)`, answer: ss, tol: 0.01, show: n(ss),
          mistakes: [{ value: 0, msg: "The plain deviations always add to 0. Square each deviation before adding." }] },
        { type: "num", label: T`Variance \(s^2\) (2 decimals)`, answer: v, tol: 0.006, show: S.fmt(v, 2),
          mistakes: [
            { value: ss / size, msg: "You divided by \\(n\\). For a sample, divide \\(S_{xx}\\) by \\(n-1\\)." },
            { value: s, msg: "That is the standard deviation. The variance is before taking the square root." },
            { value: ss, msg: "That is \\(S_{xx}\\). Divide it by \\(n-1\\) to get the variance." }
          ] },
        { type: "num", label: T`Standard deviation \(s\) (2 decimals)`, answer: s, tol: 0.006, show: S.fmt(s, 2),
          mistakes: [
            { value: Math.sqrt(ss / size), msg: "You divided by \\(n\\) before taking the square root. Use \\(n-1\\) for a sample." },
            { value: v, msg: "That is the variance. Take its square root to get \\(s\\)." }
          ] }
      ],
      hand: [
        T`Mean: \(\bar x = \frac{${S.sum(data)}}{${size}} = ${n(m)}\).`,
        `Deviations \\(x_i - \\bar x\\): ${dev.map(d => T`\(${n(d)}\)`).join(", ")}. They add to 0, which checks the mean.`,
        `Squared deviations: ${sq.map(d => n(d)).join(", ")}. Their sum is \\(S_{xx} = ${n(ss)}\\).`,
        T`Variance: \(s^2 = \frac{${n(ss)}}{${size}-1} = ${S.fmt(v, 4)}\).`,
        T`Standard deviation: \(s = \sqrt{${S.fmt(v, 4)}} = ${S.fmt(s, 4)}\).`
      ],
      ti: code(`x <- ${rvec(data)}; var(x); sd(x)`),
      excel: code(`import numpy as np; x = np.array(${pvec(data)}); x.var(ddof=1), x.std(ddof=1)`)
    };
  }

  // ---- sample variance with the S_xx shortcut, from summary sums ----
  function shortcut() {
    const size = R.int(8, 25);
    let data; do { data = Array.from({ length: size }, () => R.int(10, 60)); } while (S.sd(data) === 0);
    const sx = S.sum(data), sxx2 = S.sum(data.map(x => x * x)), Sxx = sxx2 - sx * sx / size, v = Sxx / (size - 1), s = Math.sqrt(v);
    const ctx = R.pick(["chip temperatures (°C)", "pipe diameters (mm)", "commute times (minutes)", "response times (ms)"]);
    return {
      prompt: T`<p>For a sample of \(n = ${size}\) ${ctx}, \(\sum x_i = ${sx}\) and \(\sum x_i^2 = ${sxx2}\).</p><p>Use the shortcut formula to find \(S_{xx}\), the sample variance, and the sample standard deviation.</p>`,
      parts: [
        { type: "num", label: T`\(S_{xx}\) (2 decimals)`, answer: Sxx, tol: 0.006, show: S.fmt(Sxx, 2),
          mistakes: [
            { value: sxx2 - sx * sx, msg: "Divide \\((\\sum x_i)^2\\) by \\(n\\) before subtracting." },
            { value: sxx2 - sx / size, msg: "Square the sum first: the formula uses \\((\\sum x_i)^2/n\\), not \\(\\sum x_i/n\\)." },
            { value: sxx2 - sx * sx / (size - 1), msg: "Divide \\((\\sum x_i)^2\\) by \\(n\\), not \\(n-1\\). The \\(n-1\\) comes later, in \\(s^2\\)." }
          ] },
        { type: "num", label: T`Variance \(s^2\) (2 decimals)`, answer: v, tol: 0.006, show: S.fmt(v, 2),
          mistakes: [{ value: Sxx / size, msg: "You divided by \\(n\\). For a sample, divide \\(S_{xx}\\) by \\(n-1\\)." }] },
        { type: "num", label: T`Standard deviation \(s\) (2 decimals)`, answer: s, tol: 0.006, show: S.fmt(s, 2),
          mistakes: [{ value: v, msg: "That is the variance. Take its square root." }, { value: Math.sqrt(Sxx / size), msg: "Use \\(n-1\\), not \\(n\\), before taking the square root." }] }
      ],
      hand: [
        T`\(S_{xx} = \sum x_i^2 - \frac{(\sum x_i)^2}{n} = ${sxx2} - \frac{${sx}^2}{${size}} = ${sxx2} - ${S.fmt(sx * sx / size, 4)} = ${S.fmt(Sxx, 4)}\).`,
        T`\(s^2 = \frac{S_{xx}}{n-1} = \frac{${S.fmt(Sxx, 4)}}{${size - 1}} = ${S.fmt(v, 4)}\).`,
        T`\(s = \sqrt{${S.fmt(v, 4)}} = ${S.fmt(s, 4)}\).`
      ],
      ti: code(`n <- ${size}; sum_x <- ${sx}; sum_x2 <- ${sxx2}; Sxx <- sum_x2 - sum_x^2/n; Sxx/(n-1); sqrt(Sxx/(n-1))`),
      excel: code(`n, sum_x, sum_x2 = ${size}, ${sx}, ${sxx2}; Sxx = sum_x2 - sum_x**2/n; Sxx/(n-1), (Sxx/(n-1))**0.5`)
    };
  }

  // ---- five-number summary ----
  function fiveNum() {
    const size = R.int(9, 12);
    let data;
    do { data = Array.from({ length: size }, () => R.int(2, 75)); } while (new Set(data).size < size - 1);
    const q = S.quartiles(data), iqr = q.q3 - q.q1;
    const mistakes1 = [], mistakes3 = [];
    if (size % 2) {
      const h = (size - 1) / 2, s = q.sorted;
      const q1in = S.median(s.slice(0, h + 1)), q3in = S.median(s.slice(h));
      if (q1in !== q.q1) mistakes1.push({ value: q1in, msg: "With an odd \\(n\\), leave the median out of both halves before finding \\(Q_1\\)." });
      if (q3in !== q.q3) mistakes3.push({ value: q3in, msg: "With an odd \\(n\\), leave the median out of both halves before finding \\(Q_3\\)." });
    }
    const hu = Math.floor(size / 2);
    const rawLow = S.median(data.slice(0, hu));
    if (rawLow !== q.q1) mistakes1.push({ value: rawLow, msg: "It looks like you used the data in the given order. Sort it first." });
    return {
      prompt: `<p>Find the quartiles, the median, and the IQR for these ${size} values (our convention: halves exclude the median when n is odd):</p><p><strong>${list(data)}</strong></p>`,
      parts: [
        { type: "num", label: T`\(Q_1\)`, answer: q.q1, tol: 0.01, show: S.num(q.q1), mistakes: mistakes1 },
        { type: "num", label: T`Median \(\tilde x\)`, answer: q.med, tol: 0.01, show: S.num(q.med) },
        { type: "num", label: T`\(Q_3\)`, answer: q.q3, tol: 0.01, show: S.num(q.q3), mistakes: mistakes3 },
        { type: "num", label: "IQR", answer: iqr, tol: 0.01, show: S.num(iqr),
          mistakes: [{ value: q.max - q.min, msg: "That is the range (max − min). The IQR is \\(Q_3 - Q_1\\)." }] }
      ],
      hand: [
        T`Sort: ${list(q.sorted)}. Min \(= ${q.min}\), max \(= ${q.max}\).`,
        size % 2 ? T`\(n = ${size}\) is odd, so the median is the middle value: ${n(q.med)}. Leave it out of both halves.` : T`\(n = ${size}\) is even, so the median is the average of the two middle values: ${n(q.med)}.`,
        T`Lower half: ${list(q.lower)}. Its median is \(Q_1 = ${n(q.q1)}\).`,
        T`Upper half: ${list(q.upper)}. Its median is \(Q_3 = ${n(q.q3)}\).`,
        T`\(IQR = Q_3 - Q_1 = ${n(q.q3)} - ${n(q.q1)} = ${n(iqr)}\).`
      ],
      ti: code(`x <- sort(${rvec(data)}); median(x); median(x[1:${q.lower.length}]); median(x[${size - q.upper.length + 1}:${size}])`) + "<p>R's <code>quantile()</code> and <code>summary()</code> interpolate, so they may not match the hand convention.</p>",
      excel: code(`import numpy as np; x = np.sort(${pvec(data)}); np.median(x), np.median(x[:${q.lower.length}]), np.median(x[${size - q.upper.length}:])`) + "<p><code>np.percentile</code> interpolates, so it may not match the hand convention.</p>"
    };
  }

  // ---- outliers ----
  function outliers() {
    const q1 = R.int(10, 40), iqr = R.int(4, 16), q3 = q1 + iqr;
    const high = R.coin(0.6);
    const mildLo = q1 - 1.5 * iqr, mildHi = q3 + 1.5 * iqr, extLo = q1 - 3 * iqr, extHi = q3 + 3 * iqr;
    const kind = R.int(0, 2);   // 0 none, 1 mild, 2 extreme
    let x;
    if (high) x = kind === 0 ? R.step(q3, mildHi - 0.5, 0.5) : kind === 1 ? R.step(mildHi + 0.5, extHi - 0.5, 0.5) : R.step(extHi + 0.5, extHi + 2 * iqr, 0.5);
    else x = kind === 0 ? R.step(mildLo + 0.5, q1, 0.5) : kind === 1 ? R.step(extLo + 0.5, mildLo - 0.5, 0.5) : R.step(extLo - 2 * iqr, extLo - 0.5, 0.5);
    const fence = high ? mildHi : mildLo, ext = high ? extHi : extLo;
    const cls = ["Not an outlier", "Mild outlier (beyond 1.5 IQR)", "Extreme outlier (beyond 3 IQR)"];
    const sideWord = high ? "upper" : "lower";
    return {
      prompt: T`<p>A data set has \(Q_1 = ${q1}\) and \(Q_3 = ${q3}\). Is the observation <strong>${n(x)}</strong> an outlier?</p>`,
      parts: [
        { type: "num", label: "IQR", answer: iqr, tol: 0.01, show: String(iqr),
          mistakes: [{ value: q1 + q3, msg: "The IQR is the difference \\(Q_3 - Q_1\\), not the sum." }] },
        { type: "num", label: `${high ? "Upper" : "Lower"} fence, \\(${high ? "Q_3 + 1.5\\times IQR" : "Q_1 - 1.5\\times IQR"}\\)`, answer: fence, tol: 0.01, show: n(fence),
          mistakes: [{ value: high ? q1 + 1.5 * iqr : q3 - 1.5 * iqr, msg: high ? "The upper fence starts from \\(Q_3\\), not \\(Q_1\\)." : "The lower fence starts from \\(Q_1\\), not \\(Q_3\\)." },
                     { value: high ? q3 + iqr : q1 - iqr, msg: "Multiply the IQR by 1.5 before adding or subtracting." }] },
        { type: "choice", label: `Classify ${n(x)}`, options: cls, answer: kind, fixed: true,
          why: Object.fromEntries([0, 1, 2].filter(i => i !== kind).map(i => [i, `Compare ${n(x)} with both ${sideWord} fences: ${n(fence)} (1.5 IQR) and ${n(ext)} (3 IQR).`])) }
      ],
      hand: [
        T`\(IQR = ${q3} - ${q1} = ${iqr}\).`,
        high ? T`Fence: \(Q_3 + 1.5(${iqr}) = ${q3} + ${n(1.5 * iqr)} = ${n(mildHi)}\). Extreme fence: \(Q_3 + 3(${iqr}) = ${n(extHi)}\).`
             : T`Fence: \(Q_1 - 1.5(${iqr}) = ${q1} - ${n(1.5 * iqr)} = ${n(mildLo)}\). Extreme fence: \(Q_1 - 3(${iqr}) = ${n(extLo)}\).`,
        kind === 0 ? `${n(x)} is inside the 1.5 IQR fence, so it is not an outlier.`
          : kind === 1 ? `${n(x)} is beyond the 1.5 IQR fence but not beyond 3 IQR, so it is a mild outlier.`
          : `${n(x)} is beyond the 3 IQR fence, so it is an extreme outlier.`
      ],
      ti: code(`q1 <- ${q1}; q3 <- ${q3}; iqr <- q3 - q1; c(q1 - 1.5*iqr, q3 + 1.5*iqr)`),
      excel: code(`q1, q3 = ${q1}, ${q3}; iqr = q3 - q1; q1 - 1.5*iqr, q3 + 1.5*iqr`)
    };
  }

  // ---- reading a boxplot / five-number summary ----
  function boxShape() {
    const kind = R.int(0, 2); // 0 right, 1 left, 2 symmetric
    const med = R.int(40, 80), a = R.int(5, 10), b = R.int(5, 10);
    const lowBox = kind === 1 ? a * 2 : a, highBox = kind === 0 ? b * 2 : kind === 2 ? a : b;
    const q1 = med - lowBox, q3 = med + highBox;
    const lw = kind === 1 ? R.int(25, 40) : R.int(6, 12), hw = kind === 0 ? R.int(25, 40) : kind === 2 ? lw + R.int(-1, 1) : R.int(6, 12);
    const mn = q1 - lw, mx = q3 + hw, iqr = q3 - q1;
    const opts = ["Skewed right", "Skewed left", "Roughly symmetric"];
    const why = "Compare the distances from the median: the side with the longer whisker and longer half of the box is the side of the skew.";
    const W = 420, X = v => 20 + (v - (mn - 5)) / (mx + 5 - (mn - 5)) * (W - 40);
    const fig = `<svg viewBox="0 0 ${W} 70" width="100%" style="max-width:${W}px" role="img" aria-label="Boxplot"><line x1="${X(mn)}" y1="35" x2="${X(q1)}" y2="35" stroke="currentColor"/><line x1="${X(q3)}" y1="35" x2="${X(mx)}" y2="35" stroke="currentColor"/><line x1="${X(mn)}" y1="27" x2="${X(mn)}" y2="43" stroke="currentColor"/><line x1="${X(mx)}" y1="27" x2="${X(mx)}" y2="43" stroke="currentColor"/><rect x="${X(q1)}" y="20" width="${X(q3) - X(q1)}" height="30" fill="var(--blue-light)" stroke="var(--blue)"/><line x1="${X(med)}" y1="20" x2="${X(med)}" y2="50" stroke="var(--blue)" stroke-width="2"/>${[mn, q1, med, q3, mx].map(v => `<text x="${X(v)}" y="66" font-size="11" text-anchor="middle" fill="currentColor">${v}</text>`).join("")}</svg>`;
    return {
      prompt: `<p>A boxplot of a sample has five-number summary (${mn}, ${q1}, ${med}, ${q3}, ${mx}).</p>${fig}<p>Find the IQR and describe the shape.</p>`,
      parts: [
        { type: "num", label: "IQR", answer: iqr, tol: 0.01, show: String(iqr), mistakes: [{ value: mx - mn, msg: "That is the range. The IQR is \\(Q_3 - Q_1\\), the width of the box." }] },
        { type: "choice", label: "Shape", options: opts, answer: kind, fixed: true, why: { 0: why, 1: why, 2: why } }
      ],
      hand: [
        T`\(IQR = Q_3 - Q_1 = ${q3} - ${q1} = ${iqr}\).`,
        `Lower side: whisker ${lw}, box half ${lowBox}. Upper side: whisker ${hw}, box half ${highBox}.`,
        kind === 0 ? "The upper side is longer, so the distribution has a longer right tail: skewed right." : kind === 1 ? "The lower side is longer, so the distribution has a longer left tail: skewed left." : "The two sides are about equal, so the distribution is roughly symmetric."
      ],
      ti: code(`boxplot(x, horizontal = TRUE)   # with your data in x`),
      excel: code(`import matplotlib.pyplot as plt; plt.boxplot(x, vert=False); plt.show()`)
    };
  }

  // ---- choosing measures (shape from mean and median) ----
  const SHAPE_CTX = ["annual incomes in a city (thousands of dollars)", "lifetimes of light bulbs (hours)", "scores on an easy quiz (out of 100)",
    "time between server failures (hours)", "home prices in Dallas (thousands of dollars)", "salaries of recent engineering graduates (thousands of dollars)"];
  function shape() {
    const ctx = R.pick(SHAPE_CTX);
    const kind = R.int(0, 2); // 0 right, 1 left, 2 symmetric
    const med = R.int(40, 200);
    const gap = Math.max(3, Math.round(med * R.int(10, 30) / 100));
    const mean = kind === 0 ? med + gap : kind === 1 ? med - gap : med + R.pick([-1, 0, 1]);
    const opts = ["Skewed right", "Skewed left", "Roughly symmetric"];
    const mopts = ["Mean and standard deviation", "Median and IQR"];
    const why = "Compare the mean with the median. The mean is pulled toward the long tail.";
    return {
      prompt: `<p>For a sample of ${ctx}, the mean is <strong>${mean}</strong> and the median is <strong>${med}</strong>, and there are no outliers on the boxplot unless the shape suggests a long tail.</p><p>What is the most likely shape, and which summaries describe these data best?</p>`,
      parts: [
        { type: "choice", label: "Shape", options: opts, answer: kind, fixed: true, why: { 0: why, 1: why, 2: why } },
        { type: "choice", label: "Best summaries", options: mopts, answer: kind === 2 ? 0 : 1, fixed: true,
          why: kind === 2 ? { 1: "For symmetric data without outliers, x̄ and s use all the data and describe it well." } : { 0: "x̄ and s are pulled by the long tail. For skewed data use the resistant median and IQR." } }
      ],
      hand: [
        "The median sits at the center of the ordered data; the mean is pulled toward a long tail.",
        kind === 0 ? `The mean (${mean}) is well above the median (${med}), so a long right tail pulls it up: skewed right.`
          : kind === 1 ? `The mean (${mean}) is well below the median (${med}), so a long left tail pulls it down: skewed left.`
          : `The mean (${mean}) and median (${med}) are nearly equal, which fits a roughly symmetric distribution.`,
        kind === 2 ? "For symmetric data without outliers, report the mean and standard deviation." : "For skewed data, report the median and IQR."
      ]
    };
  }

  HandKit.mount("#practice-app", {
    module: 1,
    skills: [
      { id: "m1-popsamp", title: "Population, sample, and variable", gen: popSample },
      { id: "m1-vartype", title: "Classify a variable", gen: varType },
      { id: "m1-sampmethod", title: "Sampling methods", gen: sampMethod },
      { id: "m1-center", title: "Mean and median", gen: center },
      { id: "m1-sd", title: "Sample variance and SD", gen: stdev },
      { id: "m1-shortcut", title: "Variance with the shortcut formula", gen: shortcut },
      { id: "m1-fivenum", title: "Quartiles and IQR", gen: fiveNum },
      { id: "m1-outliers", title: "Outlier fences", gen: outliers },
      { id: "m1-boxshape", title: "Reading a boxplot", gen: boxShape },
      { id: "m1-shape", title: "Choosing measures", gen: shape }
    ]
  });
})();
