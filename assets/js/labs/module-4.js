/* Module 4 labs (step labs): probability as area under a density; the memoryless exponential. */
(function(){const {F,text,line}=Course.Lab;
 const X0=60,X1=660,Y0=290,H=220;
 function plot(f,lo,hi,{shade=[],ymax,stroke='var(--navy)'}={}){const N=240,xs=Array.from({length:N+1},(_,i)=>lo+(hi-lo)*i/N),ys=xs.map(f),M=ymax||Math.max(...ys)*1.08,px=x=>X0+(x-lo)/(hi-lo)*(X1-X0),py=y=>Y0-y/M*H;let s='';
  for(const [a,b,fill] of shade){const pts=xs.filter(x=>x>=a&&x<=b);if(pts.length<2)continue;s+=`<path d="M${px(pts[0])},${Y0} ${pts.map(x=>`L${px(x)},${py(f(x))}`).join(' ')} L${px(pts[pts.length-1])},${Y0} Z" fill="${fill||'var(--yellow)'}" stroke="none" opacity=".9"/>`;}
  s+=`<path d="${xs.map((x,i)=>`${i?'L':'M'}${px(x)},${py(ys[i])}`).join(' ')}" fill="none" stroke="${stroke}" stroke-width="2.5"/>`+line(X0,Y0,X1,Y0);
  for(let i=0;i<=5;i++){const v=lo+(hi-lo)*i/5;s+=line(px(v),Y0,px(v),Y0+5)+text(px(v),Y0+20,F(v,2),'text-anchor="middle" font-size="12"');}
  return {s,px,py};}
 const DENS={
  '3x2':{name:'f(x) = 3x² on [0, 1]',f:x=>x>=0&&x<=1?3*x*x:0,F:x=>x<=0?0:x>=1?1:x**3,lo:0,hi:1},
  '2x':{name:'f(x) = 2x on [0, 1]',f:x=>x>=0&&x<=1?2*x:0,F:x=>x<=0?0:x>=1?1:x*x,lo:0,hi:1},
  'tri':{name:'f(x) = 2(1 − x) on [0, 1]',f:x=>x>=0&&x<=1?2*(1-x):0,F:x=>x<=0?0:x>=1?1:1-(1-x)**2,lo:0,hi:1},
  'unif':{name:'Uniform on [0, 1]',f:x=>x>=0&&x<=1?1:0,F:x=>Math.min(1,Math.max(0,x)),lo:0,hi:1}};
 Course.labs.pdfarea={module:4,title:'Probability is area',
  description:'Pick a density and an interval. Step through F(a), F(b), and their difference, and see why a single point has probability 0.',
  params:[{key:'d',label:'Density',value:'3x2',options:Object.entries(DENS).map(([k,v])=>[k,v.name])},{key:'a',label:'a',value:'0.4',options:['0.1','0.2','0.3','0.4','0.5']},{key:'b',label:'b',value:'0.8',options:['0.6','0.7','0.8','0.9']}],
  steps(l){const d=DENS[l.params.d],a=+l.params.a,b=+l.params.b;return [
   {title:'1. The density',text:`${d.name}. The total area under the curve is 1. The height is a density, not a probability.`},
   {title:`2. F(${a}): area to the left of ${a}`,text:`F(${a}) = P(X ≤ ${a}) = ${F(d.F(a),4)}.`},
   {title:`3. F(${b}): area to the left of ${b}`,text:`F(${b}) = P(X ≤ ${b}) = ${F(d.F(b),4)}.`},
   {title:'4. Subtract',text:`P(${a} < X ≤ ${b}) = F(${b}) − F(${a}) = ${F(d.F(b),4)} − ${F(d.F(a),4)} = ${F(d.F(b)-d.F(a),4)}.`},
   {title:'5. A single point',text:`P(X = ${a}) = F(${a}) − F(${a}) = 0: a vertical line has no area. So P(${a} ≤ X ≤ ${b}) = P(${a} < X < ${b}).`}];},
  draw(l){const d=DENS[l.params.d],a=+l.params.a,b=+l.params.b,st=l.step,shade=st===1?[[d.lo,a]]:st===2?[[d.lo,b]]:st===3?[[a,b]]:[];const {s,px,py}=plot(d.f,-0.1,1.1,{shade,ymax:3.2});let o=s;
   if(st>=1)o+=line(px(a),40,px(a),Y0,'miss','stroke-dasharray="4 4"')+text(px(a),34,`a = ${a}`,'text-anchor="middle" font-size="12"');
   if(st>=2)o+=line(px(b),40,px(b),Y0,'miss','stroke-dasharray="4 4"')+text(px(b),34,`b = ${b}`,'text-anchor="middle" font-size="12"');
   if(st===4)o+=`<line x1="${px(a)}" y1="${Y0}" x2="${px(a)}" y2="${py(d.f(a))}" stroke="var(--red)" stroke-width="3"/>`;
   return o+text(X0,24,d.name,'font-size="13"');},
  metrics(l){const d=DENS[l.params.d],a=+l.params.a,b=+l.params.b,st=l.step,m=[];if(st>=1)m.push([`F(${a})`,F(d.F(a),4)]);if(st>=2)m.push([`F(${b})`,F(d.F(b),4)]);if(st>=3)m.push(['P(a < X ≤ b)',F(d.F(b)-d.F(a),4)]);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>By hand:</strong> ${M('F(x)=\\int_{-\\infty}^x f(y)\\,dy')}, ${M('P(a\\le X\\le b)=F(b)-F(a)')}, and ${M('P(X=a)=0')} for a continuous X.`;}};

 Course.labs.memoryless={module:4,title:'The memoryless exponential',
  description:'X ~ Exp(λ) is a waiting time. Step through P(X > s), then P(X > s + t | X > s), and compare it with P(X > t).',
  params:[{key:'lam',label:'λ (rate)',value:'0.5',options:['0.2','0.5','1']},{key:'s',label:'s (already waited)',value:'2',options:['1','2','4']},{key:'t',label:'t (more)',value:'1',options:['1','2','3']}],
  steps(l){const lam=+l.params.lam,s=+l.params.s,t=+l.params.t,ps=Math.exp(-lam*s),pst=Math.exp(-lam*(s+t)),pt=Math.exp(-lam*t);return [
   {title:'1. The exponential density',text:`f(x) = ${lam}e^(−${lam}x) for x ≥ 0. The mean waiting time is 1/λ = ${F(1/lam,3)}.`},
   {title:`2. Survive past s = ${s}`,text:`P(X > ${s}) = e^(−${lam}·${s}) = ${F(ps,4)} (the shaded tail).`},
   {title:`3. Survive past s + t = ${s+t}`,text:`P(X > ${s+t}) = ${F(pst,4)}, the darker part of that tail.`},
   {title:'4. Condition on X > s',text:`P(X > ${s+t} | X > ${s}) = ${F(pst,4)}/${F(ps,4)} = ${F(pst/ps,4)}.`},
   {title:`5. Compare with P(X > t)`,text:`P(X > ${t}) = e^(−${lam}·${t}) = ${F(pt,4)}: the same. Having already waited ${s} does not change the chance of waiting ${t} more.`}];},
  draw(l){const lam=+l.params.lam,s=+l.params.s,t=+l.params.t,st=l.step,hi=Math.ceil(Math.max(8/lam,s+t+2)/5)*5,f=x=>x>=0?lam*Math.exp(-lam*x):0;
   const shade=st===1?[[s,hi]]:st===2||st===3?[[s,hi,'var(--blue-light)'],[s+t,hi,'var(--yellow)']]:st===4?[[t,hi]]:[];const {s:svg,px}=plot(f,0,hi,{shade,ymax:lam*1.1});let o=svg;
   const mark=(x,lab,y=34)=>line(px(x),y+6,px(x),Y0,'miss','stroke-dasharray="4 4"')+text(px(x),y,lab,'text-anchor="middle" font-size="12"');
   if(st>=1&&st<4)o+=mark(s,`s = ${s}`);if(st>=2&&st<4)o+=mark(s+t,`s + t = ${s+t}`,58);if(st===4)o+=mark(t,`t = ${t}`);return o;},
  metrics(l){const lam=+l.params.lam,s=+l.params.s,t=+l.params.t,st=l.step,m=[];if(st>=1)m.push(['P(X > s)',F(Math.exp(-lam*s),4)]);if(st>=2)m.push(['P(X > s + t)',F(Math.exp(-lam*(s+t)),4)]);if(st>=3)m.push(['Conditional',F(Math.exp(-lam*t),4)]);if(st>=4)m.push(['P(X > t)',F(Math.exp(-lam*t),4)]);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>Why:</strong> ${M('P(X>s+t\\mid X>s)=\\frac{e^{-\\lambda(s+t)}}{e^{-\\lambda s}}=e^{-\\lambda t}=P(X>t)')}.`;}};
})();
