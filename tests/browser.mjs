/* Browser checks for the STAT 4340 site. Runs against a local server:
     python3 -m http.server 4340 --bind 127.0.0.1
     STAT4340_BROWSER=chromium node tests/browser.mjs      (default: installed Google Chrome)
   The checks adapt to the modules listed in Course.built (assets/js/questions/shared.js).
   Module 7–8 checks (t and χ² tables, rejection-region graphs, p-value method) are added when those modules are built. */
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const playwright=require(process.env.STAT4340_PLAYWRIGHT||'playwright');
const base=process.env.STAT4340_URL||'http://127.0.0.1:4340';
const browser=await playwright.chromium.launch({...(process.env.STAT4340_BROWSER==='chromium'?{}:{channel:'chrome'}),headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
// Offline runs: STAT4340_KATEX=/path/to/node_modules/katex/dist serves KaTeX locally and skips web fonts.
if(process.env.STAT4340_KATEX){await context.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\//,r=>{const f=r.request().url().split('/dist/')[1].split('?')[0];r.fulfill({path:`${process.env.STAT4340_KATEX}/${f}`});});await context.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());}
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|net::/.test(m.text()))errors.push(m.text());});
await mkdir('test-results',{recursive:true});
const rawTeX=()=>page.evaluate(()=>/\\\(|\\\[/.test(document.body.innerText));
const fill=async(page,correct)=>{const q=await page.evaluate(()=>Course.practiceInstances[0].q);
 if(q.multi){for(const [i,p] of q.parts.entries()){if(p.method&&p.method!==q.method)continue;const part=page.locator(`.part[data-i="${i}"]`);if(p.type==='pint'){const ins=part.locator('input');if(correct){await ins.nth(0).fill(String(p.lo));await ins.nth(1).fill(String(p.hi));}else{await ins.nth(0).fill('0.9');await ins.nth(1).fill('0.95');}continue;}if(p.type==='choice')await part.locator(`input[value="${correct?p.answer:(p.answer+1)%p.options.length}"]`).check();else await part.locator('input').fill(correct?String(p.answer):String(p.answer+1000));}return q;}
 if(q.choices)await page.locator(`input[name=answer][value="${correct?q.choices.indexOf(q.answer):q.choices.findIndex(a=>a!==q.answer)}"]`).check();else await page.locator('input[name=answer]').fill(correct?String(q.answer):'999999999');return q;};
const force=(page,id,k)=>page.evaluate(([id,k])=>{const s=Course.practiceInstances[0].skills.find(s=>s.id===id);s.generate=k<0?s.sources.original:s.sources.steps[k];},[id,k]);
const useOriginal=id=>page.evaluate(id=>{const P=Course.practiceInstances[0];const s=P.skills.find(s=>s.id===id);s.generate=s.sources?s.sources.original:s.generate;P.skill=s;P.render();},id);

try{
 await page.goto(`${base}/index.html`,{waitUntil:'networkidle'});
 const BUILT=await page.evaluate(()=>Course.built),TOTAL=await page.evaluate(()=>Course.skillTotal());
 assert.ok(BUILT.length>=1&&TOTAL===8*BUILT.length,'eight skills per built module');
 const M=BUILT[0];

 // Every page loads, typesets its math, leaves no raw TeX, and fits the screen.
 const routes=['index.html',...Array.from({length:8},(_,i)=>`module-${i+1}.html`),'practice.html','exams.html','review.html','search.html','glossary.html','notebook.html','labs.html','tables.html'];
 for(const route of routes){await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.Course);await page.waitForFunction(()=>window.katex!==undefined);await page.evaluate(()=>Course.renderMath());assert.equal(await page.locator('.math-error').count(),0,route);assert.equal(await rawTeX(),false,route+' raw TeX');assert.equal(await page.locator('.math:not([data-rendered])').count(),0,route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow');}
 for(let m=1;m<=8;m++){await page.goto(`${base}/module-${m}.html`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.lab').count(),await page.locator('[data-lab]').count(),`module ${m}: every lab mounts`);
  if(BUILT.includes(m))assert.equal(await page.locator('[data-practice]').count(),1,`module ${m} practice`);else{assert.match(await page.locator('.page-intro .eyebrow').innerText(),/Coming soon/i);assert.equal(await page.locator('[data-practice]').count(),0);}}
 assert.equal(await page.locator('.site-feedback').count(),1,'feedback box shown now that the form link is set');
 console.log(`PASS: ${routes.length} pages load with typeset math; modules ${BUILT.join(', ')} built, the rest show "coming soon".`);

 // Stress every generator inside the real browser too.
 await page.goto(`${base}/practice.html`,{waitUntil:'networkidle'});
 const count=await page.evaluate(()=>{let count=0;for(const skills of Object.values(Course.questions))for(const s of skills)for(let i=0;i<300;i++){const q=s.generate();if(/undefined|NaN|Infinity/.test(JSON.stringify(q)))throw Error(s.id);if(q.multi){for(const p of q.parts)if(p.type==='pint'?![p.lo,p.hi,p.exact].every(Number.isFinite):p.type==='choice'?!(p.answer>=0&&p.answer<p.options.length):!Number.isFinite(p.answer))throw Error(s.id);}else if(q.choices?!q.choices.includes(q.answer):!Number.isFinite(q.answer))throw Error(s.id);count++;}return count;});
 assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('#practice-module option')].map(o=>Number(o.value))),BUILT,'practice menu lists built modules only');

 // Each skill, in each of its question styles, is answered correctly and incorrectly through its visible controls.
 let flows=0;
 for(const m of BUILT){
  await page.goto(`${base}/practice.html?module=${m}`,{waitUntil:'networkidle'});
  const skills=await page.evaluate(()=>Course.practiceInstances[0].skills.map(s=>({id:s.id,styles:s.sources?s.sources.steps.length:0})));
  for(const {id,styles} of skills)for(let k=styles?-1:-2;k<(styles||-1);k++){
   if(k>-2)await force(page,id,k);
   await page.locator('.skill-select').selectOption(id);await page.evaluate(()=>Course.practiceInstances[0].render());
   await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();assert.equal(await page.locator('.feedback.correct').count(),1,`${id}/${k} correct`);
   await page.locator('[data-action=next]').click();const q=await fill(page,false);
   await page.getByRole('button',{name:'Check my answer',exact:true}).click();assert.equal(await page.locator('.feedback:not(.correct)').count(),1,`${id}/${k} wrong`);assert.ok((await page.locator('.feedback').innerText()).includes('By hand'));
   assert.equal(await page.locator('.math-error').count(),0,`${id}/${k} math`);assert.equal(await rawTeX(),false,`${id}/${k} raw TeX`);
   if(q.multi)assert.ok(await page.locator('.part.wrong').count()>=1,`${id}/${k} marks the wrong step`);else{assert.equal(await page.locator('.feedback .check').count(),2);assert.deepEqual(await page.locator('.feedback .check strong').allTextContents(),['R','Python']);}
   flows++;}
 }
 console.log(`PASS: ${count.toLocaleString()} browser-generated questions; all ${TOTAL} skills answered correctly and incorrectly (${flows} question styles), with R and Python checks.`);

 // Mastery persists; mixed sets requeue misses.
 {await page.goto(`${base}/practice.html?module=${M}`,{waitUntil:'networkidle'});const id=await page.evaluate(()=>Course.practiceInstances[0].skills.find(s=>{const q=(s.sources?s.sources.original:s.generate)();return !q.choices;}).id);
  await useOriginal(id);await page.locator('.skill-select').selectOption(id);
  for(let i=0;i<3;i++){await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();await page.locator('[data-action=next]').click();}
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.evaluate(id=>Course.progress()[id].mastered,id),true);
  await page.getByRole('button',{name:'Start mixed set · 6 questions',exact:true}).click();
  await page.getByRole('button',{name:'Show the worked solution',exact:true}).click();assert.equal(await page.evaluate(()=>Course.practiceInstances[0].queue.length),6);await page.locator('[data-action=next]').click();
  for(let i=0;i<6;i++){await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();await page.locator('[data-action=next]').click();}assert.ok((await page.locator('.feedback').innerText()).includes('Mixed set complete'));}
 console.log('PASS: mastery persistence and mixed-set miss requeue.');

 // Practice exams: every built quiz and the cumulative exam, answered fully right and fully wrong through the page.
 const fillExam=async correct=>{await page.evaluate(ok=>{const st=Course.exams.state;st.items.forEach((it,i)=>{const li=document.querySelector(`#exam-q-${i}`);
   if(it.kind==='mc'){const k=it.q.shown.findIndex(o=>ok?o.tier===4:o.tier===0);const k2=k<0?it.q.shown.findIndex(o=>o.tier!==4):k;li.querySelectorAll('input')[k2].click();return;}
   it.q.parts.forEach((p,k)=>{const el=li.querySelector(`.part[data-k="${k}"]`);if(p.type==='choice')el.querySelectorAll('input')[ok?p.answer:(p.answer+1)%p.options.length].click();else{const inp=el.querySelector('input');inp.value=String(ok?p.answer:p.answer+1000);inp.dispatchEvent(new Event('input',{bubbles:true}));}});
   const ta=li.querySelector('textarea');ta.value='My written answer.';ta.dispatchEvent(new Event('input',{bubbles:true}));});},correct);};
 await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});
 assert.equal(await page.locator('[data-start]').count(),BUILT.length+1,'one quiz per built module plus the cumulative exam');
 let examRuns=0;
 for(const id of ['final',...BUILT.map(m=>'m'+m)])for(let rep=0;rep<(id==='final'?4:3);rep++){
  await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});
  await page.locator(`[data-start="${id}"]`).click();
  assert.equal(await page.locator('.math-error').count(),0,`${id} exam math`);assert.equal(await rawTeX(),false,`${id} raw TeX`);
  const mc=id==='final'?3*BUILT.length:8,fr=await page.locator('.exam-item').count()-mc;
  assert.ok(fr>=2&&fr<=5,`${id} free-response count ${fr}`);
  await fillExam(rep===0);
  const n=mc+fr;assert.match(await page.locator('.exam-progress').innerText(),new RegExp(`${n} of ${n} answered`));
  await page.locator('.exam-bar [data-action=submit]').click();
  const max=4*mc+8*fr,head=await page.locator('.exam-total').innerText();
  if(rep===0){assert.equal(head,`${max-4*fr} / ${max} points (${Math.round(100*(max-4*fr)/max)}%)`,`${id} correct auto score`);
   for(const b of await page.locator('.exam-self button[data-v="4"]').all())await b.click();
   assert.equal(await page.locator('.exam-total').innerText(),`${max} / ${max} points (100%)`);}
  else{const pts=Number(head.split(' / ')[0]);assert.ok(pts<=max/4,`${id} wrong answers score low (${head})`);}
  assert.equal(await page.locator('.math-error').count(),0,`${id} review math`);assert.equal(await rawTeX(),false,`${id} results raw TeX`);
  assert.deepEqual([...new Set(await page.locator('.exam-item .check strong').allTextContents())].sort(),['Python','R'],`${id} R and Python checks`);examRuns++;}
 // Unanswered questions trigger the in-page confirmation; a timed exam submits itself at zero; results end with a study plan.
 await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});await page.locator(`[data-start="m${M}"]`).click();
 await page.locator('.exam-bar [data-action=submit]').click();assert.ok(await page.locator('.exam-confirm').isVisible());
 await page.locator('[data-action=confirm]').click();assert.match(await page.locator('.exam-total').innerText(),/^0 \/ 48/);
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('stat4340-exams-v1')).attempts.length)>=examRuns+1);
 await page.locator('[data-action=menu]').click();await page.locator('#exam-timed').check();await page.locator(`[data-start="m${M}"]`).click();
 assert.ok(await page.locator('.exam-timer').isVisible());await page.evaluate(()=>{Course.exams.state.deadline=Date.now()-1;});
 await page.waitForSelector('.exam-timeup',{timeout:5000});
 await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});await page.evaluate(()=>{Course.exams.start('final',false);Course.exams.submit(false);});
 assert.equal(await page.locator('.exam-plan h2').innerText(),'What to study next');assert.ok(await page.locator('.study-list > li').count()>=1);
 assert.equal(await page.locator('[data-action=print]').count(),1);assert.equal(await page.locator('[data-print]').count(),0);
 console.log(`PASS: ${examRuns} practice exams taken right and wrong; 4/2/1/0 scoring, self-grading, confirmation, timer, study plan, history.`);

 // Math written as plain text in the notes is typeset (no stray x̄, √, ≤, subscripts left in prose).
 for(const m of BUILT){await page.goto(`${base}/module-${m}.html`,{waitUntil:'networkidle'});
  const left=await page.evaluate(()=>{const RX=/p̂|x̄|ŷ|[μσ√≤≥₀₁ₐ²]/;const out=[];const w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const el=n.parentElement;if(el.closest('.katex,svg,code,kbd,.screen,.xl,.check,[data-lab],button,select,.rr-anim,.eyebrow'))continue;if(RX.test(n.nodeValue))out.push(n.nodeValue.trim().slice(0,60));}return out;});
  assert.deepEqual(left,[],`module ${m} has untypeset math`);assert.equal(await page.locator('.math-error').count(),0);}
 console.log('PASS: inline math typeset in the built module notes.');
 // Code checks: one statement per line (no "a; b" on a single line), and code boxes never break inside a word.
 for(const m of BUILT){await page.goto(`${base}/module-${m}.html`,{waitUntil:'networkidle'});
  const bad=await page.evaluate(()=>[...document.querySelectorAll('.check code')].filter(c=>/; +\S/.test(c.textContent.replace(/(["'])(?:(?!\1).)*\1/g,''))).map(c=>c.textContent.slice(0,60)));
  assert.deepEqual(bad,[],`module ${m}: statements share a line`);
  const wrap=await page.evaluate(()=>{const c=document.querySelector('.check code');return c?getComputedStyle(c).overflowWrap+'|'+getComputedStyle(c).wordBreak:'none';});
  assert.ok(/^(break-word|normal)\|normal$/.test(wrap)||wrap==='none',`module ${m}: code wraps mid-word (${wrap})`);}
 console.log('PASS: R and Python checks show one statement per line and wrap between words.');
 // Feedback box points at the STAT 4340 form (never the STAT 2331 one) on every built page.
 for(const m of BUILT){await page.goto(`${base}/module-${m}.html`,{waitUntil:'networkidle'});
  const href=await page.locator('.site-feedback .fb-link').getAttribute('href');
  assert.ok(href.startsWith('https://docs.google.com/forms/d/e/1FAIpQLSd_ZYwEzUMwEjJjCpiOjE7O5eQox48jDyIkxuw5eliYZnlHaQ/viewform'),`module ${m}: wrong feedback form ${href}`);}
 assert.equal(await page.evaluate(()=>/1FAIpQLSeSijk/.test(document.documentElement.outerHTML)),false);
 console.log('PASS: feedback box links to the STAT 4340 form.');



 // Progress ring and progress links between browsers.
 {const ctxA=await browser.newContext({permissions:['clipboard-read','clipboard-write']}),pA=await ctxA.newPage();await pA.goto(`${base}/index.html`,{waitUntil:'load'});
  assert.equal((await pA.$eval('#mastery-percent',e=>getComputedStyle(e).getPropertyValue('--p'))).trim(),'0');
  await pA.evaluate(()=>{const ids=Object.values(Course.questions).flat().map(s=>s.id);const p={};ids.slice(0,4).forEach(id=>p[id]={streak:3,mastered:true,attempts:3});localStorage.setItem('stat4340-progress-v1',JSON.stringify(p));Course.refreshProgress();});
  assert.equal(await pA.textContent('#mastery-percent'),`${Math.round(400/TOTAL)}%`);
  await pA.locator('#copy-progress-link').click();await pA.waitForFunction(()=>document.querySelector('#progress-link').value);const link=await pA.inputValue('#progress-link');assert.equal(await pA.evaluate(()=>navigator.clipboard.readText()),link);assert.match(link,/\?progress=v1\.7{4}/);
  const ctxB=await browser.newContext(),pB=await ctxB.newPage();await pB.goto(link,{waitUntil:'load'});assert.equal(await pB.textContent('#mastery-total'),`0 of ${TOTAL} skills mastered`);
  await pB.getByRole('button',{name:'Restore my progress'}).click();assert.equal(await pB.textContent('#mastery-total'),`4 of ${TOTAL} skills mastered`);assert.ok(!pB.url().includes('progress='));
  await pB.locator('#reset-progress').click();await pB.locator('#reset-yes').click();assert.equal(await pB.textContent('#mastery-total'),`0 of ${TOTAL} skills mastered`);
  {const ctxC=await browser.newContext({permissions:['clipboard-read','clipboard-write']}),pC=await ctxC.newPage();await pC.goto(`${base}/index.html`,{waitUntil:'load'});await pC.evaluate(l=>navigator.clipboard.writeText(l),link);
   await pC.locator('#paste-progress').click();await pC.waitForFunction(()=>/4 of/.test(document.querySelector('#mastery-total').textContent));await ctxC.close();}
  await ctxA.close();await ctxB.close();}
 console.log('PASS: progress ring and progress links between browsers (copy, paste button, restore).');

 // Hints, spaced review, and the mistakes notebook, using a numeric single-answer skill.
 {await page.goto(`${base}/practice.html?module=${M}`,{waitUntil:'networkidle'});await page.evaluate(()=>localStorage.removeItem('stat4340-progress-v1'));await page.reload({waitUntil:'networkidle'});
  const id=await page.evaluate(()=>Course.practiceInstances[0].skills.find(s=>{const q=(s.sources?s.sources.original:s.generate)();return !q.choices&&q.mistakes.some(m=>Number.isFinite(m.value));}).id);
  await useOriginal(id);
  await page.getByRole('button',{name:'Show a hint'}).click();assert.equal(await page.locator('.hint-box li').count(),1);
  await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();
  assert.match(await page.locator('.feedback p').first().innerText(),/with a hint/);assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('stat4340-progress-v1'))[id].streak,id),0);
  await page.goto(`${base}/index.html`,{waitUntil:'networkidle'});await page.evaluate(id=>{localStorage.setItem('stat4340-progress-v1',JSON.stringify({[id]:{streak:3,mastered:true,attempts:3,interval:3,due:Date.now()-1000}}));},id);await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#review-panel').isHidden(),false);await page.goto(`${base}/practice.html?module=${M}&review=1`,{waitUntil:'networkidle'});
  assert.match(await page.locator('.question .eyebrow').first().innerText(),/Review set/i);
  await useOriginal(id);await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();
  assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('stat4340-progress-v1'))[id].interval,id),6);
  await page.goto(`${base}/practice.html?module=${M}&skill=${id}`,{waitUntil:'networkidle'});await page.evaluate(()=>localStorage.removeItem('stat4340-mistakes-v1'));
  assert.equal(await page.locator('.skill-select').inputValue(),id);
  const v=await page.evaluate(()=>{const P=Course.practiceInstances[0];const s=P.skill;s.generate=s.sources.original;for(let i=0;i<50;i++){P.render();const m=P.q.mistakes.find(m=>Number.isFinite(m.value));if(m)return m.value;}throw Error('no diagnosable mistake');});
  await page.locator('.question input[name=answer]').fill(String(v));await page.getByRole('button',{name:'Check my answer',exact:true}).click();
  const log=await page.evaluate(()=>Course.mistakes.read());assert.equal(log.length,1);assert.equal(log[0].skill,id);
  await page.goto(`${base}/notebook.html#mistakes`,{waitUntil:'networkidle'});assert.equal(await page.locator('.mistake-skill').count(),1);assert.equal(await rawTeX(),false,'raw TeX on mistakes page');
  assert.match(await page.locator('.mistake-actions a').first().getAttribute('href'),new RegExp(`skill=${id}`));
  await page.locator('#mistakes-clear').click();await page.locator('#mc-yes').click();assert.match(await page.locator('#mistakes-root').innerText(),/Nothing here yet/);}
 console.log('PASS: hints, spaced review, and the mistakes notebook.');

 // Review sheets, search, and the glossary (every glossary anchor exists in its module page).
 {await page.goto(`${base}/review.html#m${M}`,{waitUntil:'networkidle'});assert.equal(await page.locator('.sheet:visible').count(),1);
  const secs=await page.evaluate(m=>fetch(`module-${m}.html`).then(r=>r.text()).then(h=>(h.match(/<article class="notes">[\s\S]*?<\/article>/)[0].match(/<h2 id=/g)||[]).length),M);
  assert.equal(await page.locator(`#m${M} .sheet-sec`).count(),secs);assert.ok(await page.locator(`#m${M} .formula`).count()>=3);
  await page.locator('#sheet-all').click();assert.equal(await page.locator('.sheet:visible').count(),BUILT.length);
  await page.goto(`${base}/search.html?q=interquartile`,{waitUntil:'networkidle'});assert.ok(await page.locator('.search-hit').count()>=2);
  await page.locator('#search-q').fill('variance');await page.waitForTimeout(300);assert.ok(await page.locator('.search-hit').count()>=2);
  await page.goto(`${base}/glossary.html`,{waitUntil:'networkidle'});const n=await page.locator('.gloss-entry').count();assert.ok(n>=20);await page.locator('#gloss-filter').fill('sampling');assert.ok(await page.locator('.gloss-entry').count()<n);
  for(const [term,m,id] of await page.evaluate(()=>GLOSSARY))assert.ok(await page.evaluate(([m,id])=>fetch(`module-${m}.html`).then(r=>r.text()).then(h=>h.includes(`id="${id}"`)),[m,id]),`${term} anchor`);}
 console.log('PASS: review sheets, search, and glossary anchors.');

 // Sidebar toggle and My notebook (bookmarks, saved questions, exam history).
 {await page.goto(`${base}/module-${M}.html`,{waitUntil:'networkidle'});await page.evaluate(()=>{['stat4340-saved-v1','stat4340-bookmarks-v1','stat4340-sidebar-hidden'].forEach(k=>localStorage.removeItem(k));});await page.reload({waitUntil:'networkidle'});
  await page.locator('#menu-toggle').click();assert.ok(await page.locator('#sidebar').isHidden());await page.reload({waitUntil:'networkidle'});assert.ok(await page.locator('#sidebar').isHidden());await page.locator('#menu-toggle').click();assert.ok(await page.locator('#sidebar').isVisible());
  await page.locator('.notes h2[id] .bm-heading').first().click();assert.equal(await page.evaluate(()=>Course.notebook.bookmarks.list().length),1);
  await page.goto(`${base}/practice.html?module=${M}`,{waitUntil:'networkidle'});await page.locator('[data-action=solution]').click();await page.locator('[data-nb-save]').click();
  await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});await page.evaluate(m=>{Course.exams.start('m'+m,false);Course.exams.submit(false);},M);await page.locator('.exam-item [data-nb-save]').last().click();
  await page.goto(`${base}/notebook.html#saved`,{waitUntil:'networkidle'});assert.equal(await page.locator('.nb-card').count(),2);
  for(const s of await page.locator('.nb-q summary').all())await s.click();await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>/\\\(|\\\[/.test(document.querySelector('[data-panel=saved]').innerText)),false);assert.equal(await page.locator('.math-error').count(),0);
  await page.locator('[data-tab=bookmarks]').click();assert.equal(await page.locator('.nb-bm').count(),1);
  await page.locator('[data-tab=exams]').click();const open=page.locator('.nb-table a').first();assert.ok(await open.count());await open.click();await page.waitForLoadState('networkidle');assert.match(await page.locator('.exam-past').innerText(),/reviewing an attempt/);}
 console.log('PASS: sidebar toggle and My notebook (bookmarks, saved questions, exam history).');

 // Labs wait for the student: nothing moves until Next step or Play all; Back and Start over work; points respond to keys.
 {await page.goto(`${base}/labs.html`,{waitUntil:'networkidle'});const labs=await page.locator('.lab').count();assert.equal(labs,await page.locator('[data-lab]').count(),'every lab on the labs page mounts');assert.ok(labs>=BUILT.length);
  for(let i=0;i<labs;i++){const lab=page.locator('.lab').nth(i),L=`Course.labInstances[${i}]`;
   assert.equal(await lab.locator('[data-do=next]').count(),1,'step lab');assert.equal(await lab.locator('[data-do=one],[data-do=play],[data-do=thousand]').count(),0,'no self-running controls');
   const n=await page.evaluate(i=>Course.labInstances[i].steps().length,i);assert.ok(n>=3);
   assert.equal(await page.evaluate(i=>Course.labInstances[i].step,i),0);await page.waitForTimeout(2500);assert.equal(await page.evaluate(i=>Course.labInstances[i].step,i),0,'lab does not advance on its own');
   assert.ok(await lab.locator('[data-do=back]').isDisabled());
   await lab.locator('[data-do=next]').click();assert.equal(await page.evaluate(i=>Course.labInstances[i].step,i),1);assert.match(await lab.locator('.step-count').textContent(),new RegExp(`Step 2 of ${n}`));
   await lab.locator('[data-do=back]').click();assert.equal(await page.evaluate(i=>Course.labInstances[i].step,i),0);
   await lab.locator('[data-do=all]').click();assert.equal(await lab.locator('[data-do=all]').innerText(),'Pause');
   await page.waitForFunction(([i,n])=>Course.labInstances[i].step===n-1&&!Course.labInstances[i].busy,[i,n],{timeout:20000});
   assert.ok(await lab.locator('[data-do=next]').isDisabled());assert.ok(!/NaN|undefined|Infinity/.test(await lab.innerText()));assert.equal(await lab.locator('.math-error').count(),0);
   await lab.locator('[data-do=all]').click();await page.waitForTimeout(300);await lab.locator('[data-do=all]').click();assert.equal(await page.evaluate(i=>Course.labInstances[i].busy,i),false,'Pause stops Play all');
   await lab.locator('[data-do=reset]').click();assert.equal(await page.evaluate(i=>Course.labInstances[i].step,i),0);
   console.log('Lab:',await lab.locator('h3').innerText(),`(${n} steps)`);}
  if(BUILT.includes(1)){const lab=page.locator('[data-lab=resistance]');await lab.locator('[data-do=next]').click();
   await lab.locator('[data-point="6"]').focus();const old=await page.evaluate(()=>Course.labInstances[0].data.values[6]);await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>Course.labInstances[0].data.values[6]),Math.round((old+.1)*10)/10);}}
 await page.goto(`${base}/tables.html`,{waitUntil:'networkidle'});await page.locator('#normal-mode').selectOption('area');assert.ok((await page.locator('#normal-result').innerText()).includes('1.645'));assert.equal(await page.locator('#normal-table .highlight').count(),2);
 if(BUILT.includes(7)){await page.locator('#t-df').fill('9');await page.locator('#t-mode').selectOption('confidence');await page.locator('#t-value').fill('95');await page.locator('#t-lookup').click();assert.match(await page.locator('#t-result').innerText(),/Row df = 9\..*2\.262/,'t row df = 9 gives 2.262');
  assert.equal(await page.locator('#t-table-grid tbody tr').count(),41,'t table rows 1–40 and the z row');
  await page.locator('#t-mode').selectOption('test');await page.locator('#t-df').fill('7');await page.locator('#t-tail').selectOption('left');await page.locator('#t-value').fill('0.05');await page.locator('#t-lookup').click();assert.match(await page.locator('#t-result').innerText(),/1\.895\. Reject H₀ if TS ≤ −1\.895/);
  await page.locator('#chi-df').fill('39');await page.locator('#chi-conf').fill('95');await page.locator('#chi-lookup').click();const chi=await page.locator('#chi-result').innerText();assert.ok(chi.includes('58.120')&&chi.includes('23.654'),'chi-squared df 39');assert.equal(await page.locator('#chi-table-grid .highlight').count(),2);}
 console.log('PASS: step labs (Next step, Back, Play all, Pause, Start over; nothing advances alone), keyboard points, normal-table lookup.');

 // Formulas never hide behind a horizontal scroll: every piece fits its box on a phone and when printed.
 {const wide=async label=>page.evaluate(l=>[...document.querySelectorAll('.formula .math')].filter(m=>{if(!m.offsetParent)return false;const f=m.closest('.formula').getBoundingClientRect(),k=m.querySelector('.katex-html');if(!k)return false;const els=[...k.querySelectorAll('*')].filter(e=>!e.closest('.hide-tail,svg'));const r=els.reduce((a,e)=>Math.max(a,e.getBoundingClientRect().right),0),l=els.reduce((a,e)=>Math.min(a,e.getBoundingClientRect().left),1e9);return r>f.right+1||l<f.left-1;}).map(m=>l+': '+m.textContent.slice(0,50)),label);
  const pages=[...BUILT.map(m=>`module-${m}.html`),'review.html','tables.html'],bad=[];
  await page.setViewportSize({width:390,height:900});for(const r of pages){await page.goto(`${base}/${r}`,{waitUntil:'networkidle'});if(r==='review.html')await page.locator('#sheet-all').click();bad.push(...await wide(r+' phone'));}
  await page.setViewportSize({width:816,height:1056});await page.emulateMedia({media:'print'});for(const r of pages){await page.goto(`${base}/${r}`,{waitUntil:'networkidle'});if(r==='review.html')await page.evaluate(()=>document.querySelectorAll('.sheet').forEach(s=>s.hidden=false));await page.evaluate(()=>Course.fitFormulas());bad.push(...await wide(r+' print'));}
  await page.emulateMedia({media:'screen'});await page.setViewportSize({width:1440,height:1000});assert.deepEqual(bad,[],'formula pieces wider than their box');}
 console.log('PASS: every formula fits its box on a phone and in print (no hidden overflow).');
 // Visual captures at both widths and themes.
 for(const width of [1440,390])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.evaluate(t=>localStorage.setItem('stat4340-theme',JSON.stringify(t)),theme);
  for(const route of ['index.html',`module-${M}.html`,'module-2.html','exams.html','labs.html','tables.html']){
   await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${width} ${theme}`);
   await page.screenshot({path:`test-results/${route.replace('.html','')}-${width}-${theme}.png`,fullPage:route==='index.html'});
  }
 }
 assert.deepEqual(errors,[],'No browser console or JavaScript errors');
 console.log('PASS: desktop and mobile; light and dark; no JavaScript or console errors.');
 await writeFile('test-results/browser-summary.json',JSON.stringify({built:BUILT,pages:routes.length,skills:TOTAL,questions:count,themes:2,widths:[1440,390],errors},null,2));
}finally{await browser.close();}
