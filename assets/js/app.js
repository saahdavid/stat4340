(function(){
 'use strict';
 const $=s=>document.querySelector(s);
 const storage={read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},write(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true;}catch{return false;}}};
 Course.storage=storage;
 Course.progress=()=>storage.read('stat4340-progress-v1',{});
 Course.tex=Course.tex||(s=>s==null?s:String(s).replace(/\\\[([\s\S]*?)\\\]/g,(m,x)=>`<span class="math display">${x}</span>`).replace(/\\\(([\s\S]*?)\\\)/g,(m,x)=>`<span class="math">${x}</span>`));
 Course.skillTotal=()=>Object.values(Course.questions||{}).reduce((a,l)=>a+l.length,0)||65;
 Course.testMethod={get(){return storage.read('stat4340-test-method','cv')==='pv'?'pv':'cv';},set(m){storage.write('stat4340-test-method',m==='pv'?'pv':'cv');}};
 Course.pInterval={
  show(p){const f=x=>Number(Number(x).toFixed(4)).toString(),b=p.lo<=0?`p-value < ${f(p.hi)}`:p.hi>=1?`p-value > ${f(p.lo)}`:`${f(p.lo)} < p-value < ${f(p.hi)}`;return `${b} (exactly ${p.exact<0.0001?'less than 0.0001':f(p.exact)})`;},
  check(p,vals){const v=vals.filter(Number.isFinite),near=x=>Math.abs(x-p.exact)<=Math.max(0.00006,0.03*p.exact),eq=(x,y)=>Math.abs(x-y)<=1e-6;
   if(!v.length)return {ok:false};
   if(v.length===1){if(near(v[0]))return {ok:true};const m=(p.mistakes||[]).find(m=>m.value!=null&&Math.abs(v[0]-m.value)<=Math.max(0.00006,0.03*Math.abs(m.value)));return {ok:false,mis:m||(eq(v[0],p.lo)||eq(v[0],p.hi)?{msg:'Give both ends of the interval from the table (or the exact p-value).'}:null)};}
   const lo=Math.min(v[0],v[1]),hi=Math.max(v[0],v[1]);
   if(eq(lo,p.lo)&&eq(hi,p.hi))return {ok:true};if(near(lo)&&near(hi))return {ok:true};
   const m=(p.mistakes||[]).find(m=>m.lo!=null&&eq(lo,m.lo)&&eq(hi,m.hi));return {ok:false,mis:m||null};}};
 Course.mistakes={key:'stat4340-mistakes-v1',read(){return storage.read(this.key,[]);},log(e){const all=this.read();all.push(Object.assign({at:Date.now()},e));storage.write(this.key,all.slice(-300));},clear(){storage.write(this.key,[]);}};
 Course.review={DAY:864e5,isDue:v=>!!(v&&v.mastered&&v.due&&v.due<=Date.now())};
 {const p=storage.read('stat4340-progress-v1',{});let ch=false;for(const v of Object.values(p))if(v&&v.mastered&&!v.due){v.interval=3;v.due=Date.now()+3*864e5;ch=true;}if(ch)storage.write('stat4340-progress-v1',p);}
 Course.escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 Course.renderMath=(el=document.body)=>{if(window.Mathify&&window.katex)Mathify.scan(el);el.querySelectorAll('.math:not([data-rendered])').forEach(node=>{if(window.katex){try{katex.render(node.textContent,node,{throwOnError:true,displayMode:node.classList.contains('display')||node.parentElement.classList.contains('formula')});node.dataset.rendered='true';}catch(e){node.classList.add('math-error');console.error(e);}}});Course.fitFormulas(el);};
 // A formula piece wider than its box is scaled down (to no less than 75%) instead of hiding behind a scroll.
 Course.fitFormulas=(el=document.body)=>{el.querySelectorAll('.formula .math[data-rendered]').forEach(m=>{const k=m.querySelector('.katex');if(!k||!m.offsetParent)return;m.style.fontSize='';const box=m.closest('.formula'),cs=getComputedStyle(box),room=box.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-4,w=k.scrollWidth;if(w>room&&room>0)m.style.fontSize=Math.max(.75,room/w)*100+'%';});};
 addEventListener('resize',()=>{clearTimeout(Course._fit);Course._fit=setTimeout(()=>Course.fitFormulas(),150);});addEventListener('beforeprint',()=>Course.fitFormulas());addEventListener('afterprint',()=>Course.fitFormulas());
 const savedTheme=storage.read('stat4340-theme',null),theme=savedTheme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;
 $('#theme-toggle')?.addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;storage.write('stat4340-theme',t);$('#theme-toggle').setAttribute('aria-pressed',String(t==='dark'));$('#theme-toggle').textContent=t==='dark'?'☀ Light':'◐ Dark';});
 if($('#theme-toggle')){$('#theme-toggle').setAttribute('aria-pressed',String(theme==='dark'));$('#theme-toggle').textContent=theme==='dark'?'☀ Light':'◐ Dark';}
 {const btn=$('#menu-toggle'),side=$('#sidebar'),narrow=()=>matchMedia('(max-width:720px)').matches;
 const sync=()=>{const shown=narrow()?side.classList.contains('open'):!document.body.classList.contains('sidebar-hidden');btn&&btn.setAttribute('aria-expanded',String(shown));};
 if(storage.read('stat4340-sidebar-hidden',false))document.body.classList.add('sidebar-hidden');
 btn?.addEventListener('click',()=>{if(narrow())side.classList.toggle('open');else{const h=document.body.classList.toggle('sidebar-hidden');storage.write('stat4340-sidebar-hidden',h);}sync();});
 matchMedia('(max-width:720px)').addEventListener?.('change',sync);sync();}
 function progress(){const p=Course.progress();let total=0;for(let m=1;m<=8;m++){const skills=Course.questions[m]||[],done=skills.filter(s=>p[s.id]?.mastered).length;total+=done;document.querySelectorAll(`[data-progress="${m}"]`).forEach(el=>{el.textContent=`${done} / ${skills.length} skills`;});document.querySelectorAll(`[data-bar="${m}"]`).forEach(el=>el.style.width=`${done/skills.length*100}%`);}
  if($('#mastery-total'))$('#mastery-total').textContent=`${total} of ${Course.skillTotal()} skills mastered`;
  if($('#mastery-percent')){const pct=Math.round(total/Course.skillTotal()*100);$('#mastery-percent').textContent=`${pct}%`;$('#mastery-percent').style.setProperty('--p',total/Course.skillTotal()*100);$('#mastery-percent').setAttribute('aria-label',`${pct}% of skills mastered`);}
  if($('#review-panel')){const due=[];for(let m=1;m<=8;m++){const list=(Course.questions[m]||[]).filter(sk=>Course.review.isDue(p[sk.id]));if(list.length)due.push([m,list]);}const n=due.reduce((a,[,l])=>a+l.length,0),rp=$('#review-panel');rp.hidden=!n;if(n)rp.innerHTML=`<div><strong>↻ ${n} mastered skill${n===1?' is':'s are'} due for a quick review</strong><p class="small muted">A short check now keeps them sharp for the exam. Each review you pass pushes the next one further out.</p></div><div class="review-links">${due.map(([m,l])=>`<a class="button" href="practice.html?module=${m}&review=1">Module ${m} · ${l.length}</a>`).join('')}</div>`;}
  const last=storage.read('stat4340-last-module',1);if($('#resume')){$('#resume').href=`module-${last}.html#practice`;$('#resume').textContent=`${total?'Continue':'Start'} module ${last} →`;}
 }
 Course.refreshProgress=progress;progress();
 document.querySelectorAll('[data-module]').forEach(el=>{if(el.tagName==='MAIN')storage.write('stat4340-last-module',Number(el.dataset.module));});
 // Moving progress between devices: a short code (one digit per skill: 2·streak + mastered) inside a link.
 const SKILLS=()=>Object.keys(Course.questions).sort((a,b)=>a-b).flatMap(m=>Course.questions[m].map(s=>s.id));
 const encode=()=>{const p=Course.progress();return 'v1.'+SKILLS().map(id=>{const v=p[id]||{};return String(Math.min(3,Math.max(0,v.streak|0))*2+(v.mastered?1:0));}).join('').replace(/0+$/,'');};
 const decode=raw=>{const m=/(?:progress=)?(v1\.[0-7]*)/.exec(String(raw||'').trim());if(!m)return null;const digits=m[1].slice(3),ids=SKILLS(),out={};ids.forEach((id,i)=>{const d=Number(digits[i]||0);if(d)out[id]={streak:d>>1,mastered:!!(d&1),attempts:0};});return out;};
 // The notebook (mistakes, saved questions, bookmarks, exam scores) travels compressed in a second parameter, nb=.
 const b64u={to:b=>{let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');},from:s=>{const b=atob(s.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0));}};
 const pipe=async(bytes,stream)=>new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
 const notesData=()=>{const r=k=>storage.read(k,[]);const d={b:r('stat4340-bookmarks-v1'),s:r('stat4340-saved-v1'),m:r('stat4340-mistakes-v1'),h:(storage.read('stat4340-exams-v1',{attempts:[]}).attempts||[]).map(a=>{const c=Object.assign({},a);delete c.detail;return c;})};return d.b.length||d.s.length||d.m.length||d.h.length?d:null;};
 const packNotes=async()=>{const d=notesData();if(!d)return '';const bytes=new TextEncoder().encode(JSON.stringify(d));if('CompressionStream' in window){try{return 'z'+b64u.to(await pipe(bytes,new CompressionStream('deflate-raw')));}catch(e){}}return 'j'+b64u.to(bytes);};
 const unpackNotes=async s=>{try{if(!s)return null;const raw=b64u.from(s.slice(1));const bytes=s[0]==='z'?await pipe(raw,new DecompressionStream('deflate-raw')):raw;const d=JSON.parse(new TextDecoder().decode(bytes));return d&&typeof d==='object'?d:null;}catch(e){return null;}};
 const notesCount=d=>d?(d.b||[]).length+(d.s||[]).length+(d.m||[]).length+(d.h||[]).length:0;
 const mergeNotes=d=>{if(!d)return;const un=(k,list,key)=>{if(!Array.isArray(list))return;const cur=storage.read(k,[]),seen=new Set(cur.map(key));list.forEach(x=>{if(x&&!seen.has(key(x))){cur.push(x);seen.add(key(x));}});cur.sort((a,b)=>(a.at||0)-(b.at||0));storage.write(k,cur);};
  un('stat4340-bookmarks-v1',d.b,x=>x.id);un('stat4340-saved-v1',d.s,x=>x.id);un('stat4340-mistakes-v1',d.m,x=>x.at+'|'+x.skill+'|'+x.title);
  if(Array.isArray(d.h)){const h=storage.read('stat4340-exams-v1',{attempts:[]}),seen=new Set(h.attempts.map(a=>a.id||a.date));d.h.forEach(a=>{if(!seen.has(a.id||a.date))h.attempts.push(a);});h.attempts.sort((a,b)=>String(a.date).localeCompare(String(b.date)));storage.write('stat4340-exams-v1',h);}};
 const linkFor=async()=>{const u=new URL('index.html',location.href);u.search='';u.hash='';u.searchParams.set('progress',encode());const nb=await packNotes();if(nb)u.searchParams.set('nb',nb);return u.href;};
 const countM=p=>Object.values(p).filter(v=>v&&v.mastered).length;
 const merge=incoming=>{const p=Course.progress();for(const [id,v] of Object.entries(incoming)){const o=p[id]||{streak:0,mastered:false,attempts:0};p[id]={streak:Math.max(o.streak||0,v.streak),mastered:!!(o.mastered||v.mastered),attempts:o.attempts||0,interval:o.interval||(v.mastered?3:undefined),due:o.due||(v.mastered?Date.now()+3*864e5:undefined)};}storage.write('stat4340-progress-v1',p);progress();};
 const msg=t=>{if($('#progress-message'))$('#progress-message').textContent=t;};
 // The link is built ahead of time, so a click copies it at once (browsers refuse a copy that waits on other work).
 let ready=null,readySig='';const sig=()=>encode()+'|'+JSON.stringify(notesData()||0).length;const prep=async()=>{const s=sig();try{ready=await linkFor();readySig=s;}catch(e){ready=null;}return ready;};
 if($('#copy-progress-link')){prep();addEventListener('focus',prep);addEventListener('storage',prep);document.addEventListener('visibilitychange',()=>{if(!document.hidden)prep();});}
 const linkMsg=link=>{const nN=notesCount(notesData()),m=countM(Course.progress());return `Link copied. It holds ${m} mastered skill${m===1?'':'s'}${nN?` and ${nN} notebook item${nN===1?'':'s'} (mistakes, saved questions, bookmarks, exam scores)`:''}. Email it to yourself, then open it on your other device.${link.length>8000?' The link is long, so email works better than a text message.':''}`;};
 const flash=(btn,text)=>{const s=btn&&btn.querySelector('span');if(!s)return;const old=s.dataset.label||s.textContent;s.dataset.label=old;s.textContent=text;btn.classList.add('copied');clearTimeout(btn._t);btn._t=setTimeout(()=>{s.textContent=old;btn.classList.remove('copied');},2500);};
 const copyLink=(btn)=>{const box=$('#progress-link-box'),inp=$('#progress-link');
  const fallback=link=>{inp.value=link;box.hidden=false;inp.focus();inp.select();msg('Your link is selected in the box below. Press Ctrl+C (⌘C on a Mac) to copy it.');};
  const ok=link=>{inp.value=link;box.hidden=false;msg(linkMsg(link));flash(btn,'✓ Copied');};
  const link=btn.id==='copy-link-again'&&inp.value?inp.value:ready&&readySig===sig()?ready:null;
  if(link){try{navigator.clipboard.writeText(link).then(()=>ok(link),()=>fallback(link));}catch(e){fallback(link);}prep();return;}
  // not built yet: hand the browser a promise of the text, which keeps the click's permission
  const p=linkFor();
  try{if(window.ClipboardItem&&navigator.clipboard.write){navigator.clipboard.write([new ClipboardItem({'text/plain':p.then(l=>new Blob([l],{type:'text/plain'}))})]).then(()=>p.then(ok),()=>p.then(fallback));return;}}catch(e){}
  p.then(l=>{try{navigator.clipboard.writeText(l).then(()=>ok(l),()=>fallback(l));}catch(e){fallback(l);}});};
 $('#copy-progress-link')?.addEventListener('click',e=>copyLink(e.currentTarget));
 $('#copy-link-again')?.addEventListener('click',e=>copyLink(e.currentTarget));
 for(const ev of ['focus','click'])$('#progress-link')?.addEventListener(ev,e=>e.target.select());
 const restore=async raw=>{raw=(raw||'').trim();const data=decode(raw);if(!data){msg('That does not look like a progress link. Paste the whole link you copied, starting with https://.');return false;}let nb=null;try{nb=await unpackNotes(new URL(raw).searchParams.get('nb'));}catch(err){}merge(data);mergeNotes(nb);msg(`Progress restored: ${countM(Course.progress())} of ${Course.skillTotal()} skills mastered${nb?`, plus ${notesCount(nb)} notebook item${notesCount(nb)===1?'':'s'}`:''}.`);$('#restore-input').value='';prep();return true;};
 $('#restore-form')?.addEventListener('submit',e=>{e.preventDefault();restore($('#restore-input').value);});
 $('#restore-input')?.addEventListener('paste',e=>{const text=e.clipboardData&&e.clipboardData.getData('text');if(text&&decode(text.trim())){e.preventDefault();$('#restore-input').value=text.trim();restore(text);}});
 $('#paste-progress')?.addEventListener('click',async e=>{const btn=e.currentTarget;try{const text=await navigator.clipboard.readText();if(!text||!text.trim()){msg('Your clipboard is empty. Copy the link first, then press Paste.');return;}$('#restore-input').value=text.trim();if(await restore(text))flash(btn,'✓ Restored');}catch(err){$('#restore-input').focus();msg('This browser did not allow reading the clipboard. Click in the box and press Ctrl+V (⌘V on a Mac), or right-click and choose Paste.');}});
 // Opening a progress link: ask before changing anything.
 {const q=new URLSearchParams(location.search).get('progress');if(q){(async()=>{const data=decode(q),nb=await unpackNotes(new URLSearchParams(location.search).get('nb'));const clean=()=>{const u=new URL(location.href);u.searchParams.delete('progress');u.searchParams.delete('nb');history.replaceState(null,'',u.pathname+u.search+u.hash);};
  if(data){const n=countM(data),bar=document.createElement('div');bar.className='restore-banner';bar.setAttribute('role','alertdialog');bar.setAttribute('aria-labelledby','restore-banner-msg');bar.innerHTML=`<p id="restore-banner-msg"><strong>Restore your progress?</strong> This link holds ${n} mastered skill${n===1?'':'s'}${nb?` and ${notesCount(nb)} notebook item${notesCount(nb)===1?'':'s'}`:''}. It will be added to anything already saved in this browser.</p><div class="answer-row"><button class="primary" data-r="yes">Restore my progress</button><button data-r="no">Not now</button></div>`;
   const main=document.querySelector('main')||document.body;main.prepend(bar);bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.r==='yes'){merge(data);mergeNotes(nb);bar.innerHTML=`<p><strong>Progress restored.</strong> ${countM(Course.progress())} of ${Course.skillTotal()} skills mastered in this browser.</p>`;}else bar.remove();clean();});}
  else clean();})();}}
 $('#reset-progress')?.addEventListener('click',()=>{const c=$('#reset-confirm');c.hidden=false;$('#reset-cancel').focus();});
 $('#reset-cancel')?.addEventListener('click',()=>{$('#reset-confirm').hidden=true;$('#reset-progress').focus();});
 $('#reset-yes')?.addEventListener('click',()=>{setTimeout(prep,0);storage.write('stat4340-progress-v1',{});progress();$('#reset-confirm').hidden=true;msg('Saved mastery reset.');});
 if(!storage.write('stat4340-storage-check',true)){document.querySelectorAll('.save-note').forEach(el=>el.textContent='Browser storage is unavailable. This session works, but mastery will not persist.');}
 Course.renderMath();window.addEventListener('load',()=>Course.renderMath());
})();

/* Code checks (R and Python): one statement per line. "a; b; c" becomes three lines, each keeping its semicolon,
   so students can read and copy them. Splits only at a ';' outside quotes and brackets. */
(function(){
 function split(s){const out=[];let cur='',q=null,d=0;
  for(let i=0;i<s.length;i++){const c=s[i];cur+=c;
   if(q){if(c===q)q=null;continue;}
   if(c==='"'||c==="'"){q=c;continue;}
   if('([{'.includes(c))d++;else if(')]}'.includes(c))d=Math.max(0,d-1);
   else if(c===';'&&d===0){out.push(cur);cur='';while(/\s/.test(s[i+1]||''))i++;}}
  if(cur.trim())out.push(cur);return out;}
 function fmt(root){(root.querySelectorAll?root.querySelectorAll('.check code,.methods code'):[]).forEach(el=>{if(el.dataset.lines)return;el.dataset.lines='1';
   const t=el.textContent,py=(el.closest('.check')?.querySelector('strong')?.textContent==='Python')||!!el.closest('details')?.querySelector('.tag-xl');let lines=split(t);if(py)lines=lines.map(l=>l.replace(/;\s*$/,''));if(lines.length>1)el.textContent=lines.join('\n');});}
 Course.formatCode=fmt;
 const run=()=>fmt(document.body);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
 new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)fmt(n);}).observe(document.documentElement,{childList:true,subtree:true});
})();
