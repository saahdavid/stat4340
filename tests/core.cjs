const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const S=require('../assets/js/stats.js');
const ctx=vm.createContext({Stats:S,Math});
const load=f=>vm.runInContext(fs.readFileSync(`assets/js/${f}.js`,'utf8'),ctx,{filename:f});
// Every script in the site must compile (a syntax error would silently drop a page feature).
{const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${d}/${e.name}`):e.name.endsWith('.js')?[`${d}/${e.name}`]:[]);for(const f of walk('assets/js'))new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});}
// Built modules come from Course.built in questions/shared.js
load('questions/shared');const BUILT=ctx.Course.built;for(const m of BUILT)load(`questions/module-${m}`);
load('rrplot');for(const f of ['stats','kit',...BUILT.map(m=>`m${m}`),'merge'])load(`hand/${f}`);
let steps=0,styles=0;
let generated=0;
for(const [m,skills] of Object.entries(ctx.Course.questions)){
 assert.equal(skills.length,8,`Module ${m}: skill count`);
 for(const skill of skills){
 for(const gen of (skill.sources||{}).steps||[]){styles++;const seen=new Set();for(let i=0;i<500;i++){const q=gen();steps++;
  assert.ok(q.multi&&q.prompt&&q.solution&&q.parts.length>=1,skill.id);assert.ok(!/undefined|NaN|Infinity/.test(JSON.stringify(q)),`${skill.id} step version has invalid output`);
  assert.ok(!/\\[()[\]]/.test(q.prompt+q.solution+JSON.stringify(q.parts)),`${skill.id} has unconverted TeX delimiters`);seen.add(q.prompt);
  for(const p of q.parts){if(p.type==='pint'){assert.ok([p.lo,p.hi,p.exact].every(Number.isFinite)&&p.lo<=p.hi&&p.exact>=p.lo-1e-9-0.02,skill.id+' pint');for(const x of p.mistakes||[])assert.ok(Number.isFinite(x.value)||(Number.isFinite(x.lo)&&Number.isFinite(x.hi)),skill.id);}else if(p.type==='choice'){assert.ok(p.answer>=0&&p.answer<p.options.length,skill.id);}else{assert.ok(Number.isFinite(p.answer),skill.id);for(const a of p.alts||[])assert.ok(Number.isFinite(a));for(const x of p.mistakes||[])assert.ok(Number.isFinite(x.value),skill.id);}}}
  assert.ok(seen.size>=4,`${skill.id} step version must generate fresh variants`);}
 const generate=skill.sources?skill.sources.original:skill.generate;const variants=new Set();for(let i=0;i<500;i++){
  const q=generate();generated++;assert.ok(q.prompt&&q.solution&&q.ti&&q.excel,skill.id);
  assert.ok(!/undefined|NaN|Infinity/.test(JSON.stringify(q)),`${skill.id} has invalid output`);
  variants.add(q.prompt);
  if(q.choices){assert.ok(q.choices.length>=2);assert.equal(new Set(q.choices).size,q.choices.length);assert.equal(q.choices.filter(c=>c===q.answer).length,1);}
  else{assert.ok(Number.isFinite(q.answer),skill.id);assert.ok(q.tolerance>=0);for(const a of q.alternates||[])assert.ok(Number.isFinite(a));for(const x of q.mistakes)assert.ok(Number.isFinite(x.value));}
 }assert.ok(variants.size>=4,`${skill.id} must generate fresh variants`);}
}
assert.equal(S.summary([1,2,7,11,12,18,23,25,98,197]).join(','),'1,7,15,25,197');
assert.equal(S.summary([1,2,3,4,5,6,7,8,9]).join(','),'1,2.5,5,7.5,9');
assert.ok(Math.abs(S.sd([1,2,3,4,5])-Math.sqrt(2.5))<1e-12);
assert.equal(S.tableNormal(.857142),.8051);assert.equal(S.tableInverse(.95),1.645);assert.equal(S.tableInverse(.05),-1.645);
for(const [input,value] of [['11/200',.055],['0.48*0.52',.2496],['sqrt(0.25/100)',.05],['5.5%',.055],['(2+3)^2',25],['-2^2',-4],['2^-2',.25],['1e-3',.001]])assert.ok(Math.abs(S.parse(input)-value)<1e-12,input);
for(const input of ['alert(1)','globalThis','1/0','sqrt(-1)','2;3','2**3','constructor()','1e999'])assert.throws(()=>S.parse(input),undefined,input);
for(let i=0;i<=100;i++){const z=-5+i*.1;assert.ok(Math.abs(S.normalCDF(z)+S.normalCDF(-z)-1)<1e-12);}
console.log(`PASS: ${generated.toLocaleString()} single-answer and ${steps.toLocaleString()} multi-step questions (${styles} multi-step styles) across ${Object.values(ctx.Course.questions).flat().length} skills (modules ${BUILT.join(', ')}); parser, quartiles, conventions, and numerical smoke checks.`);

// Practice-exam bank: every multiple-choice item has four distinct options with exactly one 4-point answer;
// every free-response item has finite answers and a two-key written rubric.
{for(const f of ['exams/bank',...BUILT.map(m=>`exams/m${m}`)])load(f);const c={ExamBank:ctx.ExamBank};const B=c.ExamBank,bad=new Set();let n=0;

for(const m of BUILT){assert.equal(B.mc[m].length,8,`Module ${m}: 8 multiple-choice templates`);assert.equal(B.fr[m].length,2);
 for(const it of B.mc[m])for(let i=0;i<800;i++){let q;try{q=it.gen()}catch(e){bad.add(it.id+' threw '+e.message);break}n++;
  const t=q.options.map(o=>o.t);if(q.options.length!==4)bad.add(it.id+' count '+q.options.length);
  if(new Set(t).size!==4)bad.add(it.id+' dup '+t.join(' | '));
  if(q.options.filter(o=>o.tier===4).length!==1)bad.add(it.id+' tier4');
  if(q.options.some(o=>![0,1,2,4].includes(o.tier)||!o.why))bad.add(it.id+' tier/why');
  if(/undefined|NaN|Infinity/.test(JSON.stringify(q)))bad.add(it.id+' text: '+JSON.stringify(q).match(/.{0,50}(undefined|NaN|Infinity).{0,20}/)[0]);}
 for(const it of B.fr[m])for(let i=0;i<800;i++){let q;try{q=it.gen()}catch(e){bad.add(it.id+' threw '+e.message);break}n++;
  if(/undefined|NaN|Infinity/.test(JSON.stringify(q)))bad.add(it.id+' text: '+JSON.stringify(q).match(/.{0,50}(undefined|NaN|Infinity).{0,20}/)[0]);
  for(const p of q.parts){if(p.type==='pint'){if(![p.lo,p.hi,p.exact].every(Number.isFinite))bad.add(it.id+' pint')}else if(p.type==='choice'){if(!(p.answer>=0&&p.answer<p.options.length))bad.add(it.id+' choice')}else if(!Number.isFinite(p.answer))bad.add(it.id+' num '+p.label);}
  if(!q.written||q.written.keys.length!==2)bad.add(it.id+' written');}}
assert.deepEqual([...bad],[]);console.log(`PASS: ${n.toLocaleString()} practice-exam items (${BUILT.length*8} multiple-choice and ${BUILT.length*2} free-response templates).`);}
