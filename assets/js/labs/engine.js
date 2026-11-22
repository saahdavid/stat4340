(function(){
 'use strict';const S=Stats,E=Course.escape;
 const setMath=(el,html)=>{if(!el||el.__h===html)return;el.__h=html;el.innerHTML=html;if(window.katex&&window.Course&&Course.renderMath)Course.renderMath(el);};
 const F=(v,d=3)=>Number.isFinite(v)?Number(v.toFixed(d)).toString():'—';
 const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${E(s)}</text>`;
 const line=(x1,y1,x2,y2,cls='axis',extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" ${extra}/>`;
 const circle=(x,y,r=4,cls='blue',extra='')=>{const c=extra.match(/class="([^"]*)"/);return `<circle cx="${x}" cy="${y}" r="${r}" class="${c?c[1]:cls}" ${extra.replace(/class="[^"]*"/,'')}/>`;};
 const scale=(v,lo,hi,left=50,right=650)=>left+(v-lo)/(hi-lo)*(right-left);
 function axis(lo,hi,y=300,label='Statistic'){let out=line(50,y,650,y);for(let i=0;i<=6;i++){const x=50+i*100,v=lo+(hi-lo)*i/6;out+=line(x,y,x,y+5)+text(x,y+22,F(v,2),'text-anchor="middle"');}return out+text(350,y+43,label,'text-anchor="middle"');}
 function histogram(values,lo,hi,options={}){
  const bins=options.bins||30,y=options.y||300,height=options.height||125,counts=Array(bins).fill(0),width=600/bins;for(const v of values){const i=Math.floor((v-lo)/(hi-lo)*bins);if(i>=0&&i<bins)counts[i]++;else if(v===hi)counts[bins-1]++;}
  const peak=Math.max(1,...counts),total=values.length;let out='';counts.forEach((n,i)=>{const h=n/peak*height;out+=`<rect x="${50+i*width+1}" y="${y-h}" width="${Math.max(1,width-2)}" height="${h}" fill="var(--blue)" opacity=".7"/>`;});
  if(options.density&&total){let path='';for(let i=0;i<=200;i++){const v=lo+(hi-lo)*i/200,expected=options.density(v)*(hi-lo)/bins*total,yy=y-expected/peak*height;path+=`${i?'L':'M'}${50+i*3},${Math.max(y-height-20,yy)}`;}out+=`<path d="${path}" fill="none" stroke="var(--red)" stroke-width="2"/>`;}
  return out+axis(lo,hi,y,options.label||'Statistic');
 }
 function tokens(values,shown=Infinity,options={}){const max=options.max||100,cols=options.cols||25,size=options.size||8,startY=options.y||37;let out='';values.slice(0,max).forEach((v,i)=>{const x=56+(i%cols)*24,y=startY+Math.floor(i/cols)*16,active=i<shown;out+=circle(x,y,size/2,active?(options.isSuccess?options.isSuccess(v)?'blue':'red':'blue'):'',`fill="${active?'var(--blue)':'var(--line)'}" opacity="${active?1:.25}"`);});return out;}
 function rngNormal(){return Math.sqrt(-2*Math.log(Math.max(1e-15,Math.random())))*Math.cos(2*Math.PI*Math.random());}
 function binomial(n,p){const vals=Array.from({length:n},()=>Math.random()<p?1:0);return {trials:vals,value:vals.reduce((a,b)=>a+b,0)};}
 class Lab{
  constructor(el,c){this.el=el;this.c=c;this.params=Object.fromEntries((c.params||[]).map(p=>[p.key,p.value]));this.records=[];this.last=null;this.phase='idle';this.shown=0;this.playing=false;this.busy=false;this.run=0;this.speed=3;this.data={};c.setup?.(this);this.mount();this.render();}
  mount(){const c=this.c;this.el.classList.add('lab');this.el.innerHTML=`<div class="eyebrow">Animated lab · Module ${c.module}</div><h3>${E(c.title)}</h3><p>${E(c.description)}</p><div class="lab-params" ${!(c.params||[]).length?'hidden':''}>${(c.params||[]).map(p=>`<label>${E(p.label)}${p.options?`<select data-param="${p.key}" aria-label="${E(c.title+' '+p.label)}">${p.options.map(o=>`<option value="${E(Array.isArray(o)?o[0]:o)}">${E(Array.isArray(o)?o[1]:o)}</option>`).join('')}</select>`:`<input data-param="${p.key}" type="number" min="${p.min}" max="${p.max}" step="${p.step||1}" value="${p.value}" aria-label="${E(c.title+' '+p.label)}">`}</label>`).join('')}</div><div class="lab-stage"><svg viewBox="0 0 700 360" role="img" aria-label="${E(c.title)} interactive simulation"></svg></div><div class="lab-status" role="status" aria-live="polite"></div><div class="lab-readout"></div><div class="lab-controls"><button data-do="one">Take 1</button><button data-do="ten">Take 10</button><button data-do="play">Play</button><button data-do="thousand">Add 1000 instantly</button><label>Speed <input type="range" min="1" max="10" value="3" data-speed aria-label="${E(c.title)} animation speed"></label><button data-do="reset">Start over</button>${(c.actions||[]).map(a=>`<button data-do="custom-${a.id}">${E(a.label)}</button>`).join('')}</div><div class="lab-warning" role="status"></div><div class="lab-theory"></div><div class="lab-detail" aria-live="polite"></div><p class="motion-note">${matchMedia('(prefers-reduced-motion: reduce)').matches?'Reduced motion: sampling steps update without gliding.':'Take 1 shows the draw, calculation, and result. Blue = simulated; red line = theory (unless the legend says otherwise).'}</p>`;
   (c.params||[]).filter(p=>p.options).forEach(p=>this.el.querySelector(`[data-param="${p.key}"]`).value=p.value);
   this.el.addEventListener('change',e=>{const key=e.target.dataset.param;if(!key)return;const spec=c.params.find(p=>p.key===key);let v=spec.options?e.target.value:Number(e.target.value);if(!spec.options){if(!Number.isFinite(v)||e.target.value===''){e.target.value=this.params[key];return;}v=S.clamp(v,spec.min,spec.max);if((spec.step||1)===1)v=Math.round(v);e.target.value=v;}this.params[key]=v;this.reset();});
   this.el.addEventListener('input',e=>{if(e.target.matches('[data-speed]'))this.speed=Number(e.target.value);});
   this.el.addEventListener('click',e=>{const b=e.target.closest('[data-do]');if(b){const a=b.dataset.do;if(a==='reset')this.reset();else if(a==='play'){if(this.busy)this.stop();else{this.playing=true;this.runSamples(Infinity);}}else if(!this.busy){if(a==='thousand'){for(let i=0;i<1000;i++)this.commit(c.sample(this));this.phase='drop';this.render();}if(a==='one')this.runSamples(1);if(a==='ten')this.runSamples(10);if(a.startsWith('custom-')){c.action?.(this,a.slice(7));this.render();}}}const ci=e.target.closest('[data-interval]');if(ci)c.inspect?.(this,Number(ci.dataset.interval));});
   this.el.addEventListener('keydown',e=>{if(e.target.hasAttribute('data-point')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const index=Number(e.target.dataset.point);c.key?.(this,index,e.key);this.render();this.el.querySelector(`[data-point="${index}"]`)?.focus();}if(e.target.hasAttribute('data-interval')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();c.inspect?.(this,Number(e.target.dataset.interval));}});
   this.el.addEventListener('pointerdown',e=>{const p=e.target.closest('[data-point]');if(p&&!this.busy){this.drag=Number(p.dataset.point);this.el.setPointerCapture(e.pointerId);e.preventDefault();}else if(c.addPoint&&e.target.closest('.lab-stage')&&!this.busy){const pos=this.pointer(e);c.addPoint(this,pos.x,pos.y);this.render();}});
   this.el.addEventListener('pointermove',e=>{if(this.drag===undefined)return;const pos=this.pointer(e);c.drag?.(this,this.drag,pos.x,pos.y);this.render();});this.el.addEventListener('pointerup',()=>this.drag=undefined);this.el.addEventListener('pointercancel',()=>this.drag=undefined);
  }
  pointer(e){const r=this.el.querySelector('svg').getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*700,y:(e.clientY-r.top)/r.height*360};}
  commit(s){this.last=s;this.c.onCommit?.(this,s);this.records.push(this.c.compact?this.c.compact(s):s);}
  stop(){this.run++;this.playing=false;this.busy=false;this.phase='idle';this.render();}
  reset(){this.stop();this.records=[];this.last=null;this.shown=0;this.data={};this.c.setup?.(this);this.el.querySelector('.lab-detail').innerHTML='';this.render();}
  async runSamples(count){if(this.busy)return;this.busy=true;const run=++this.run;for(let j=0;j<count&&run===this.run;j++){
    const s=this.c.sample(this);this.last=s;this.phase='draw';this.shown=0;this.render();const size=s.trials?.length||0,frames=Math.min(size,16)||1;
    for(let k=1;k<=frames;k++){await this.wait(950/frames);if(run!==this.run)return;this.shown=Math.ceil(k/frames*size);this.render();}
    this.phase='compute';this.render();await this.wait(850);if(run!==this.run)return;
    this.commit(s);this.phase='drop';this.render();await this.wait(650);if(run!==this.run)return;
   }if(run===this.run){this.playing=false;this.busy=false;this.phase='idle';this.render();}}
  wait(ms){return new Promise(resolve=>setTimeout(resolve,Math.max(12,ms/(this.speed*.5+.5))));}
  render(){const c=this.c,result=c.draw(this);this.el.querySelector('svg').innerHTML=result;this.el.querySelector('.lab-status').textContent=c.status?.(this)||`${this.records.length} repetitions. ${this.phase==='draw'?'1. Draw the sample.':this.phase==='compute'?'2. Calculate the statistic.':this.phase==='drop'?'3. Place the result on the plot.':'Ready to draw the next sample.'}`;
   setMath(this.el.querySelector('.lab-readout'),(c.metrics?.(this)||[]).map(([label,value])=>`<div class="metric">${E(label)}<b>${E(value)}</b></div>`).join(''));
   this.el.querySelector('.lab-warning').textContent=c.warning?.(this)||'';setMath(this.el.querySelector('.lab-theory'),c.theory(this));this.el.querySelector('[data-do=play]').textContent=this.busy?'Pause':'Play';this.el.querySelector('[data-do=play]').setAttribute('aria-pressed',String(this.busy));this.el.querySelectorAll('[data-do]').forEach(b=>{b.disabled=this.busy&&!['play','reset'].includes(b.dataset.do);});this.el.querySelectorAll('[data-param]').forEach(el=>el.disabled=this.busy);Course.renderMath(this.el);}
 }
 /* Step labs: nothing moves until the student asks. Back / Next step / Play all / Start over.
    A config with steps(l) → [{title, text}] draws step l.step (0-based) in draw(l). Optional:
    params, setup(l) (fresh data), drag/key for movable points, metrics, theory, actions. */
 class StepLab extends Lab{
  mount(){const c=this.c;this.step=0;this.el.classList.add('lab','step-lab');this.el.innerHTML=`<div class="eyebrow">Step-by-step lab · Module ${c.module}</div><h3>${E(c.title)}</h3><p>${E(c.description)}</p><div class="lab-params" ${!(c.params||[]).length?'hidden':''}>${(c.params||[]).map(p=>`<label>${E(p.label)}${p.options?`<select data-param="${p.key}" aria-label="${E(c.title+' '+p.label)}">${p.options.map(o=>`<option value="${E(Array.isArray(o)?o[0]:o)}">${E(Array.isArray(o)?o[1]:o)}</option>`).join('')}</select>`:`<input data-param="${p.key}" type="number" min="${p.min}" max="${p.max}" step="${p.step||1}" value="${p.value}" aria-label="${E(c.title+' '+p.label)}">`}</label>`).join('')}</div><div class="lab-steptext" aria-live="polite"></div><div class="lab-stage"><svg viewBox="0 0 700 360" role="img" aria-label="${E(c.title)} step-by-step figure"></svg></div><div class="lab-status" role="status" aria-live="polite"></div><div class="lab-readout"></div><div class="lab-controls"><button data-do="back">← Back</button><button data-do="next" class="primary">Next step →</button><button data-do="all">Play all</button><button data-do="reset">Start over</button>${(c.actions||[]).map(a=>`<button data-do="custom-${a.id}">${E(a.label)}</button>`).join('')}</div><div class="lab-warning" role="status"></div><div class="lab-theory"></div>`;
   (c.params||[]).filter(p=>p.options).forEach(p=>this.el.querySelector(`[data-param="${p.key}"]`).value=p.value);
   this.el.addEventListener('change',e=>{const key=e.target.dataset.param;if(!key)return;const spec=c.params.find(p=>p.key===key);let v=spec.options?e.target.value:Number(e.target.value);if(!spec.options){if(!Number.isFinite(v)||e.target.value===''){e.target.value=this.params[key];return;}v=S.clamp(v,spec.min,spec.max);if((spec.step||1)===1)v=Math.round(v);e.target.value=v;}this.params[key]=v;this.reset();});
   this.el.addEventListener('click',e=>{const b=e.target.closest('[data-do]');if(!b)return;const a=b.dataset.do,n=this.steps().length;
    if(a==='all'){if(this.busy)this.stop();else this.playAll();return;}
    if(this.busy)this.stop();
    if(a==='next'&&this.step<n-1)this.step++;else if(a==='back'&&this.step>0)this.step--;else if(a==='reset')return this.reset();else if(a.startsWith('custom-'))c.action?.(this,a.slice(7));
    this.render();});
   this.el.addEventListener('keydown',e=>{if(e.target.hasAttribute('data-point')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const index=Number(e.target.dataset.point);c.key?.(this,index,e.key);this.render();this.el.querySelector(`[data-point="${index}"]`)?.focus();}});
   this.el.addEventListener('pointerdown',e=>{const p=e.target.closest('[data-point]');if(p){this.drag=Number(p.dataset.point);this.el.setPointerCapture(e.pointerId);e.preventDefault();}});
   this.el.addEventListener('pointermove',e=>{if(this.drag===undefined)return;const pos=this.pointer(e);c.drag?.(this,this.drag,pos.x,pos.y);this.render();});this.el.addEventListener('pointerup',()=>this.drag=undefined);this.el.addEventListener('pointercancel',()=>this.drag=undefined);
  }
  steps(){return this.c.steps(this);}
  stop(){this.run++;this.busy=false;this.render?.();}
  reset(){this.run++;this.busy=false;this.step=0;this.data={};this.c.setup?.(this);this.render();}
  async playAll(){this.busy=true;const run=++this.run;if(this.step>=this.steps().length-1)this.step=0;this.render();
   while(run===this.run&&this.step<this.steps().length-1){await new Promise(r=>setTimeout(r,matchMedia('(prefers-reduced-motion: reduce)').matches?900:1600));if(run!==this.run)return;this.step++;this.render();}
   if(run===this.run){this.busy=false;this.render();}}
  render(){if(this.step===undefined)return;const c=this.c,st=this.steps(),n=st.length;this.step=Math.min(this.step,n-1);const cur=st[this.step];
   this.el.querySelector('svg').innerHTML=c.draw(this);
   setMath(this.el.querySelector('.lab-steptext'),`<div class="step-count">Step ${this.step+1} of ${n}</div><strong>${cur.title}</strong><p>${cur.text}</p>`);
   this.el.querySelector('.lab-status').textContent=c.status?.(this)||'';
   setMath(this.el.querySelector('.lab-readout'),(c.metrics?.(this)||[]).map(([label,value])=>`<div class="metric">${E(label)}<b>${E(value)}</b></div>`).join(''));
   this.el.querySelector('.lab-warning').textContent=c.warning?.(this)||'';setMath(this.el.querySelector('.lab-theory'),c.theory(this));
   const q=x=>this.el.querySelector(`[data-do=${x}]`);q('back').disabled=this.step===0;q('next').disabled=this.step===n-1;q('all').textContent=this.busy?'Pause':'Play all';q('all').setAttribute('aria-pressed',String(this.busy));
   Course.renderMath(this.el);}
 }
 Course.Lab={F,text,line,circle,scale,axis,histogram,tokens,rngNormal,binomial,Lab,StepLab};
 Course.labInstances=[];document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-lab]').forEach(el=>{const config=Course.labs[el.dataset.lab];if(config)Course.labInstances.push(config.steps?new StepLab(el,config):new Lab(el,config));});});
})();
