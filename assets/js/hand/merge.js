/* Merge the multi-step questions into the course skills.

   Every skill keeps its id and title (so saved mastery carries over). Where a multi-step
   version exists, a fresh question is drawn from it about two times in three, and from the
   original single-answer generator otherwise, so students see more variety. */
(function (root) {
  'use strict';
  const C = root.Course, H = root.HandSets || {};
  if (!C || !C.questions) return;
  const SHARE = 0.65;

  // course skill id → multi-step generator id(s)
  const MAP = {
    1: { 'm1-identify': ['m1-popsamp', 'm1-vartype'], 'm1-sampling': ['m1-sampmethod'], 'm1-center': ['m1-center'], 'm1-sd': ['m1-sd', 'm1-shortcut'], 'm1-quartiles': ['m1-fivenum'], 'm1-fences': ['m1-outliers'], 'm1-displays': ['m1-boxshape'], 'm1-choose': ['m1-shape'] },
    2: { 'm2-sets': ['m2-setops'], 'm2-union': ['m2-addition', 'm2-incl3'], 'm2-equally': ['m2-equally'], 'm2-conditional': ['m2-cond'], 'm2-independent': ['m2-indep'], 'm2-multiply': ['m2-mult'], 'm2-total': ['m2-totalp'], 'm2-bayes': ['m2-bayesrule'] },
    3: { 'm3-pmf': ['m3-pmfcdf'], 'm3-mean': ['m3-ex'], 'm3-function': ['m3-eh'], 'm3-variance': ['m3-var'], 'm3-binomial': ['m3-bin'], 'm3-hyper': ['m3-hyp'], 'm3-negbin': ['m3-nb'], 'm3-poisson': ['m3-pois'] }
  };

  // \( … \) and \[ … \] → the .math spans that Course.renderMath typesets
  const tex = s => s == null ? s : String(s)
    .replace(/\\\[([\s\S]*?)\\\]/g, (m, t) => `<span class="math display">${t}</span>`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (m, t) => `<span class="math">${t}</span>`);

  function solution(q) {
    let h = '';
    if (q.figure) h += `<figure class="hand-figure">${q.figure}</figure>`;
    const steps = Array.isArray(q.hand) ? q.hand : [q.hand];
    h += `<ol>${steps.map(s => `<li>${tex(s)}</li>`).join('')}</ol>`;
    if (q.after) h += `<div class="tip">${tex(q.after)}</div>`;
    return h;
  }

  function adapt(q) {
    return {
      multi: true,
      prompt: tex(q.prompt),
      parts: q.parts.map(p => Object.assign({}, p, {
        label: tex(p.label),
        options: p.options && p.options.map(tex),
        why: p.why && Object.fromEntries(Object.entries(p.why).map(([k, v]) => [k, tex(v)])),
        whyRight: tex(p.whyRight),
        mistakes: (p.mistakes || []).map(m => Object.assign({}, m, { msg: tex(m.msg) }))
      })),
      solution: solution(q),
      ti: q.ti ? tex(q.ti) : '',
      excel: q.excel ? tex(q.excel) : ''
    };
  }

  for (const [m, skills] of Object.entries(C.questions)) {
    const sets = H[m] || [], map = MAP[m] || {};
    for (const skill of skills) {
      const ids = map[skill.id];
      if (!ids) continue;
      const gens = ids.map(id => (sets.find(s => s.id === id) || {}).gen).filter(Boolean);
      if (!gens.length) continue;
      const original = skill.generate;
      skill.sources = { original, steps: gens.map(g => () => adapt(g())) };
      skill.generate = () => Math.random() < SHARE
        ? skill.sources.steps[Math.floor(Math.random() * gens.length)]()
        : original();
    }
  }
  C.tex = tex;
})(globalThis);
