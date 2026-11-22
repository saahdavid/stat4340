(function(){
  const root=document.getElementById('mistakes-root');if(!root||!window.Course||!Course.mistakes)return;
  const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const T=s=>Course.tex?Course.tex(String(s)):String(s);
  const titles=['Data Distributions','Data Relationships','Producing Data','Probability Basics','Normal & Binomial Distributions','Sampling Distributions','Confidence Intervals','Hypothesis Testing + Uses & Abuses'];
  const ago=t=>{const d=Math.floor((Date.now()-t)/864e5);return d<=0?'today':d===1?'yesterday':`${d} days ago`;};
  function draw(){
    const all=Course.mistakes.read();
    if(!all.length){root.innerHTML='<div class="tip"><strong>Nothing here yet.</strong> When you miss a question in <a href="practice.html">practice</a> or a <a href="exams.html">practice exam</a>, the explanation of what went wrong is saved here so you can come back to it.</div>';return;}
    const byM={};
    for(const e of all){const m=byM[e.module]=byM[e.module]||{};const k=e.skill==='exam'?'exam':e.skill;const g=m[k]=m[k]||{title:e.skill==='exam'?'Practice exam questions':e.title,skill:e.skill,n:0,last:0,msgs:new Map()};g.n++;g.last=Math.max(g.last,e.at);
      for(const msg of e.msgs||[]){const key=e.skill==='exam'?`${msg}`:msg;const r=g.msgs.get(key)||{n:0,last:0,src:e.skill==='exam'?e.title:''};r.n++;r.last=Math.max(r.last,e.at);g.msgs.set(key,r);}}
    const mods=Object.keys(byM).map(Number).sort((a,b)=>a-b);
    root.innerHTML=`<div class="mistakes-toolbar"><span>${all.length} missed question${all.length===1?'':'s'} saved in this browser.</span><button id="mistakes-clear">Clear my list</button></div><div class="reset-confirm" id="mistakes-confirm" hidden role="alertdialog" aria-labelledby="mc-q"><p id="mc-q"><strong>Clear every saved mistake?</strong> Your mastery is not affected.</p><div class="answer-row"><button id="mc-no">Keep the list</button><button class="primary danger" id="mc-yes">Clear the list</button></div></div>`+
    mods.map(m=>{const groups=Object.values(byM[m]).sort((a,b)=>b.n-a.n);
      return `<section class="mistake-module"><h2>Module ${m}. ${E(titles[m-1])}</h2>${groups.map(g=>{const msgs=[...g.msgs.entries()].sort((a,b)=>b[1].n-a[1].n||b[1].last-a[1].last).slice(0,6);
        return `<article class="mistake-skill"><h3><span>${E(g.title)}</span><span class="mistake-count">missed ${g.n} time${g.n===1?'':'s'} · last ${ago(g.last)}</span></h3>${msgs.length?`<ul class="mistake-msgs">${msgs.map(([t,r])=>`<li>${T(t)}${r.n>1?` <span class="times">(${r.n} times)</span>`:''}</li>`).join('')}</ul>`:'<p class="small muted">No specific error was recognized, so study the worked solution next time.</p>'}<div class="mistake-actions">${g.skill!=='exam'?`<a href="practice.html?module=${m}&amp;skill=${encodeURIComponent(g.skill)}">Practice this skill</a>`:`<a href="practice.html?module=${m}">Practice Module ${m}</a>`}<a href="module-${m}.html">Read the Module ${m} notes</a></div></article>`;}).join('')}</section>`;}).join('');
    Course.renderMath(root);
  }
  root.addEventListener('click',e=>{const id=e.target.id,c=document.getElementById('mistakes-confirm');
    if(id==='mistakes-clear'){c.hidden=false;document.getElementById('mc-no').focus();}
    if(id==='mc-no')c.hidden=true;
    if(id==='mc-yes'){Course.mistakes.clear();draw();}});
  draw();
})();
