/* "Send feedback" box at the bottom of every page. It shows (and can copy) a short reference
   to where the student is: the page, plus the practice skill or the exam question when relevant.
   To have the form fill this in automatically, set ENTRY to the number from the form's
   pre-filled link (…&entry.123456789=…) — e.g. ENTRY = '123456789'. */
(function () {
  'use strict';
  const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSeSijkXuPol5U9dj9uTeYE-F4o7LXZ5-W-gqro3rDJ1IYRf9g/viewform';
  const ENTRY = '1531774866';
  if (window.Course) window.Course.askLink = text => `${FORM}?usp=pp_url&entry.${ENTRY}=${encodeURIComponent(text)}`;
  const box = document.querySelector('.site-feedback');
  if (!box) return;
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
    link.href = ENTRY ? `${FORM}?usp=pp_url&entry.${ENTRY}=${encodeURIComponent(ref)}` : 'https://forms.gle/xXUwjtoXM23b3AfY7';
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
