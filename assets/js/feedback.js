/* "Send feedback" box at the bottom of every page. It shows (and can copy) a short reference
   to where the student is: the page, plus the practice skill or the exam question when relevant.
   The form address and the optional entry number are set once, in scripts/build.mjs (FEEDBACK, FEEDBACK_ENTRY);
   they reach this script as data-form / data-entry on the box. */
(function () {
  'use strict';
  const box = document.querySelector('.site-feedback');
  if (!box) return;   // no form set in scripts/build.mjs: no box, and no "Ask Dr. Saah" links
  const FORM = box.dataset.form || '', ENTRY = box.dataset.entry || '';
  const prefill = text => ENTRY ? `${FORM}?usp=pp_url&entry.${ENTRY}=${encodeURIComponent(text)}` : FORM;
  if (FORM && window.Course) window.Course.askLink = prefill;
  const refEl = box.querySelector('.fb-ref'), link = box.querySelector('.fb-link'), copy = box.querySelector('.fb-copy');
  function where() {
    const C = window.Course || {};
    let ref = document.title.replace(/\s*·\s*STAT 4340\s*$/, '');
    const P = (C.practiceInstances || [])[0];
    if (P && P.skill) ref = `${ref}: Module ${P.module}, ${P.skill.title}`;
    const ex = C.exams && C.exams.state;
    if (ex) ref = `${ex.ex.title}${ex.done ? ' (results)' : ''}`;
    return ref;
  }
  function update() {
    const ref = where();
    refEl.textContent = ref;
    link.href = prefill(ref);
  }
  update();
  ['pointerenter', 'focusin'].forEach(ev => box.addEventListener(ev, update));
  link.addEventListener('click', update);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) update(); }).observe(box);
  if (copy) copy.addEventListener('click', () => {
    update();
    const done = () => { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy'; }, 1600); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(refEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = 'Selected: press Ctrl+C'; };
    try { navigator.clipboard.writeText(refEl.textContent).then(done, fallback); } catch (e) { fallback(); }
  });
})();
