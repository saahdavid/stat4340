# STAT 4340 · The course notebook

A hand-first learning site for Dr. David Saah's **STAT 4340 / CS 4340 / OREM 3340: Statistics for Engineers** at SMU. The site is plain HTML, CSS, and JavaScript served straight from this repository. There is **no server, account system, database, or required build step for students**.

Student URL after GitHub Pages is enabled: **https://saahdavid.github.io/stat4340/**

It reuses the engine of the STAT 2331 site (`saahdavid/stat2331`): dynamic practice, practice exams, My notebook, progress links, search and glossary, review sheets, tables, labs, and the test suites. The course content is new.

## Build status

**All eight modules are built.** (The build still supports an unbuilt module: it shows the outline and "Coming soon" with no practice, quiz, or lab.)

| Module | Status | Eight practice skills | Labs |
| --- | --- | --- | --- |
| 1. Descriptive Statistics | **Built** | Population, sample, and variable; sampling methods; mean and median; sample variance and SD (definition and S_xx shortcut); quartiles and IQR; outlier fences; reading displays; choosing measures | Resistant or not? |
| 2. Probability | **Built** | Set operations and Venn diagrams; axioms, complements, unions; equally likely outcomes; conditional probability from a two-way table; independence; multiplication rule; total probability; Bayes' theorem | Bayes with a tree of 10,000 |
| 3. Discrete Random Variables | **Built** | Valid PMF and CDF; E(X); E[h(X)]; variance and Var(aX+b); binomial; hypergeometric; negative binomial; Poisson and the Poisson approximation | Building a binomial distribution; Binomial or Poisson? |
| 4. Continuous Random Variables | **Built** | Valid PDF and a constant; probabilities from a PDF or CDF; percentiles and median; E(X) and Var(X) from a PDF; uniform; normal areas with z; inverse normal; exponential and memorylessness; gamma and Γ(α) | Probability is area; The memoryless exponential |
| 5. Joint Distributions & the CLT | **Built** | Joint PMF probabilities; marginals; independence; E[h(X,Y)]; covariance and correlation; mean and SE of x̄; CLT probabilities; parameter vs statistic and the LLN | From a joint table to the correlation; The Central Limit Theorem |
| 6. Point Estimation | **Built** | Parameter, estimator, estimate; bias; comparing estimators (variance, MVUE); standard error; method of moments; maximum likelihood; invariance of the MLE | Bias versus variance; Finding the MLE on the likelihood curve |
| 7. Confidence Intervals | **Built** | z interval (σ known); large-sample interval; Wald interval for p; score (Wilson) interval for p; one-sided bounds; t interval; χ² interval for σ² and σ; interpreting confidence | What “95% confident” means (z, t, Wald, Wilson) |
| 8. Hypothesis Testing | **Built** | Writing H₀ and Hₐ; z test for μ; large-sample z test; t test for μ; z test for p; critical value or p-value decision; Type I and II errors; conclusion in context | Rejection region and p-value; Type I and Type II errors (β and power) |

Each built module has notes (objectives, explanations, highlighted formulas, worked examples, common-mistake boxes, a summary), **R and Python checks** as an addendum to the hand work, eight practice skills, a quiz (8 multiple choice and 2 free response), review sheet, glossary terms, and labs.

## Course conventions

- **By hand with a table.** Students work every problem by hand. R and Python appear only as a check after the hand work (the practice engine's `ti` slot holds the R code and its `excel` slot holds the Python code; they are labelled R and Python on screen).
- Sample variance divides by **n − 1**: `s² = S_xx/(n − 1)`, `S_xx = Σ(xᵢ − x̄)² = Σxᵢ² − (Σxᵢ)²/n`.
- **Quartiles** are half-medians, leaving the overall median out of both halves when n is odd. R's `quantile()`/`summary()` and NumPy's `percentile` interpolate and may differ.
- **Outliers:** below Q₁ − 1.5 IQR or above Q₃ + 1.5 IQR; beyond 3 IQR is extreme.
- **Tables:** z, t, and χ² only. Normal-table entries are left areas; **round z to two decimals before finding a probability**.
- **t procedures use the exact df = n − 1.** The t table lists every df from 1 to 40 (plus ∞ = z) with upper-tail areas 0.10, 0.05, 0.025, 0.01, 0.005, 0.001, 0.0005; the χ² table lists df 1–40, 50, …, 100. Critical values are written z_α, z_α/2, t_α,ν and χ²_α,ν as in the lecture notes.
- **χ² interval for σ²:** the larger χ² value goes under the lower endpoint, ((n − 1)s²/χ²_α/2,n−1, (n − 1)s²/χ²_1−α/2,n−1). (The Chapter 7 slide has the two bounds reversed; the site uses this corrected order.)
- **CLT and large-sample procedures use n > 40.**
- **Proportion interval:** the **Wald** interval is the default (n p̂ ≥ 10 and n(1 − p̂) ≥ 10). The score (Wilson) interval is also taught. **Proportion test:** n p₀ ≥ 10 and n(1 − p₀) ≥ 10.
- **No continuity correction.**
- Poisson approximation to the binomial: n > 50 and np < 5.
- Hypothesis tests: teach the critical-value (rejection region) **and** the p-value approach; students may decide with either in practice and on exams.

## Design

SMU colors: **Campanile Blue #354CA1**, **Mustang Red #CC0035**, and white. A blue header band with a red stripe; Bitter headings and Source Sans 3 text; JetBrains Mono for code. Formulas sit in a blue box with a red bar on the left. **Correct answers are blue; wrong answers are red.** Dark mode uses lighter tints of the same two colors. The theme is the "SMU theme" block at the end of `assets/css/style.css` (colors are CSS variables at the top of that block).

**Code checks:** each R or Python statement is on its own line (`Course.formatCode` in `assets/js/app.js` splits `a; b; c` at semicolons outside quotes and brackets; Python lines drop the trailing semicolon). Text wraps between words, never in the middle of one.

**Printing:** formulas are built from short math pieces that wrap to the page instead of scrolling sideways, and any piece still too wide is scaled to fit (never below 75%). The browser test fails if any formula is hidden on a phone or in print.

## Practice exams

`exams.html` offers a **quiz for each built module** (8 multiple choice + 2 free response; 48 points; 35 minutes) and a **cumulative exam** (3 multiple choice per module and 5 free response: 24 + 5). Multiple choice is scored **4/2/1/0**: every distractor is assigned 2 (near miss), 1 (partial understanding), or 0 when it is written, with a reason. Free response is worth 8: the computation steps are checked automatically (4) and the written part is self-scored with a two-key rubric (4). Attempts are saved in the browser (`stat4340-exams-v1`).

## Labs

Every lab is a **step lab**: nothing moves until the student presses **Next step**. **Back** goes back a step, **Play all** steps through on its own (and becomes **Pause**), and **Start over** resets. A lab config with `steps(l)` returns `[{title, text}]` and draws step `l.step` in `draw(l)`; points can be dragged or moved with the arrow keys (`assets/js/labs/engine.js`, class `StepLab`).

## Browser storage

All keys start with **`stat4340-`** (progress, mistakes, saved questions, bookmarks, exams, theme, sidebar), so this site never mixes a student's progress with the STAT 2331 site on the same domain. Progress links look like `…/index.html?progress=v1.…` (one digit per skill, in module order). Add new modules' skills after the existing ones, and keep skill ids stable, so old links still restore correctly.

## Add or change a module

1. Write the notes in `src/module-N.html`: sections `<section><h2 id="…">N. Title</h2>…</section>`, formulas in `<div class="formula">`, worked examples in `<div class="example">`, mistakes in `<div class="mistake">`, R and Python checks in `<div class="checks"><div class="check"><strong>R</strong><code>…</code></div>…</div>`. Math goes in `<span class="math">…</span>` (KaTeX).
2. Eight single-answer skills in `assets/js/questions/module-N.js` (`skill(id, title, generator)` using `Course.Q.num` / `Course.Q.choice`; R code in the `ti` argument, Python in `excel`).
3. Multi-step versions in `assets/js/hand/mN.js` and the id mapping in `assets/js/hand/merge.js`.
4. Exam templates in `assets/js/exams/mN.js`: 8 `B.MC` (every option has a tier and a reason) and 2 `B.FR` (two-key rubric).
5. Labs in `assets/js/labs/module-N.js` (step labs) and their entries in the `labs` list in `scripts/build.mjs`.
6. Glossary terms in `assets/js/glossary-data.js` (the anchor must match an `<h2 id>`), and formulas or tables in `src/tables.html`.
7. Add N to **`BUILT`** in `scripts/build.mjs` **and** to **`Course.built`** in `assets/js/questions/shared.js`.
8. `node scripts/build.mjs`, then run the tests below.

## Files

```text
src/module-N.html               Notes for each built module
src/tables.html                 Tables & formulas page content
scripts/build.mjs               Page shell, BUILT list, outlines of unbuilt modules, labs list, FEEDBACK link
assets/css/style.css            Themes, typography, responsive rules
assets/js/stats.js              Numerical core and safe arithmetic parser
assets/js/questions/shared.js   Course titles, Course.built, question helpers
assets/js/questions/module-N.js Eight skills per module (single-answer versions)
assets/js/hand/                 Multi-step questions with step-by-step mistake diagnosis; merge.js maps them to skills
assets/js/exams/                bank.js (helpers) and mN.js (templates per module); exams.js runs the page
assets/js/labs/                 engine.js (Lab and StepLab) and module-N.js
assets/js/glossary-data.js      Glossary terms: [term, module, section id, definition]
assets/js/search-index.js       Generated by the build from the notes (do not edit)
tests/                          core.cjs (generators), browser.mjs (real browser), crosscheck.py (SciPy)
```

## Run the checks (before every push)

```sh
node scripts/build.mjs
node tests/core.cjs
python3 -m http.server 4340 --bind 127.0.0.1 &
npm install && npx playwright install chromium     # first time only
STAT4340_BROWSER=chromium node tests/browser.mjs
```

`core.cjs` generates 500 questions per skill and per multi-step style, and 800 per exam template, checking finite answers, valid choices, the 4/2/1/0 tiers, and the rubric. `browser.mjs` loads every page, checks typeset math and phone overflow, answers every skill in every style right and wrong, takes every quiz and the cumulative exam, exercises the notebook, progress links, review sheets, search, glossary, step labs (and that they never advance alone), and the tables, then saves desktop/mobile light/dark screenshots in `test-results/`. If the KaTeX CDN is blocked, set `STAT4340_KATEX=/path/to/node_modules/katex/dist`.

## Publish with GitHub Pages

In this repository: **Settings → Pages → Deploy from a branch → `main`, folder `/ (root)` → Save**. The site appears at `https://saahdavid.github.io/stat4340/` a minute or two later. Links are relative, so it works under the repository path.

## Feedback form

The form address is `FEEDBACK` in `scripts/build.mjs` (the published `…/forms/d/e/<id>/viewform` address, not the editor's `/prefill` page). Every page then shows a "Help improve this site" box, and the notebook's "Ask Dr. Saah" buttons use the same form. An empty `FEEDBACK` hides both.

**To change the pre-filled question:** in the form editor, open the three-dot menu → Get pre-filled link, type any text into the question that should receive the reference, click Get link, and copy the number after `entry.` in the address. Put it in `FEEDBACK_ENTRY` in `scripts/build.mjs` and rebuild. It is set (entry.1611708265), so the form opens with the page reference filled in. With `FEEDBACK_ENTRY` empty, the box shows the reference with a Copy button instead.

Only KaTeX and Google Fonts load from external CDNs. The site sends no analytics and no student data anywhere.
