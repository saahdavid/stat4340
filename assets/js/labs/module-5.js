/* Module 5 labs (step labs): from a joint table to covariance; the Central Limit Theorem. */
(function(){const {F,text,line,histogram,rngNormal}=Course.Lab;
 const sum=a=>a.reduce((s,v)=>s+v,0);
 const TABLES={
  notes:{name:'Chapter 5 table',xs:[0,1,2],ys:[0,1,2,3,4],p:[[1/2,1/16,1/32,1/32,1/32],[1/16,1/32,1/32,1/32,1/32],[1/32,1/32,1/32,1/32,1/32]],lab:v=>({0.5:'1/2',0.0625:'1/16',0.03125:'1/32'})[v]||F(v,4)},
  coins:{name:'Two independent coin flips',xs:[0,1],ys:[0,1],p:[[.25,.25],[.25,.25]],lab:v=>F(v,2)},
  shifts:{name:'Defects by inspector A (X) and B (Y)',xs:[0,1,2],ys:[0,1,2],p:[[.30,.08,.02],[.08,.20,.07],[.02,.07,.16]],lab:v=>F(v,2)}};
 const calc=t=>{const px=t.p.map(r=>sum(r)),py=t.ys.map((_,j)=>sum(t.p.map(r=>r[j]))),ex=sum(t.xs.map((x,i)=>x*px[i])),ey=sum(t.ys.map((y,j)=>y*py[j])),exy=sum(t.xs.flatMap((x,i)=>t.ys.map((y,j)=>x*y*t.p[i][j]))),vx=sum(t.xs.map((x,i)=>x*x*px[i]))-ex*ex,vy=sum(t.ys.map((y,j)=>y*y*py[j]))-ey*ey,cv=exy-ex*ey;return {px,py,ex,ey,exy,vx,vy,cv,rho:cv/Math.sqrt(vx*vy)};};
 Course.labs.jointtable={module:5,title:'From a joint table to the correlation',
  description:'Step through the marginals, the expected values, the covariance and correlation, and an independence check for a joint PMF.',
  params:[{key:'t',label:'Joint PMF',value:'notes',options:Object.entries(TABLES).map(([k,v])=>[k,v.name])}],
  steps(l){const t=TABLES[l.params.t],c=calc(t),i0=t.p.findIndex((r,i)=>r.some((v,j)=>Math.abs(v-c.px[i]*c.py[j])>1e-9)),j0=i0<0?0:t.p[i0].findIndex((v,j)=>Math.abs(v-c.px[i0]*c.py[j])>1e-9),ii=Math.max(i0,0);return [
   {title:'1. The joint PMF',text:`Each cell is p(x, y) = P(X = x, Y = y). The cells add to 1.`},
   {title:'2. Marginal of X: row sums',text:`<span class="math">p_X</span> = (${c.px.map(v=>F(v,4)).join(', ')}).`},
   {title:'3. Marginal of Y: column sums',text:`<span class="math">p_Y</span> = (${c.py.map(v=>F(v,4)).join(', ')}).`},
   {title:'4. Expected values',text:`E(X) = ${F(c.ex,4)}, E(Y) = ${F(c.ey,4)}, and E(XY) = ΣΣ xy p(x, y) = ${F(c.exy,4)}.`},
   {title:'5. Covariance and correlation',text:`Cov(X, Y) = ${F(c.exy,4)} − ${F(c.ex,4)}(${F(c.ey,4)}) = ${F(c.cv,4)}; ρ = Cov/(σ_X σ_Y) = ${F(c.rho,4)}.`},
   {title:'6. Independent?',text:i0<0?'Every cell equals <span class="math">p_X(x)\\,p_Y(y)</span>, so X and Y are independent (and Cov = 0).':`Cell (${t.xs[ii]}, ${t.ys[j0]}): p = ${F(t.p[ii][j0],4)} but <span class="math">p_X(${t.xs[ii]})\\,p_Y(${t.ys[j0]})</span> = ${F(c.px[ii]*c.py[j0],4)}. They differ, so X and Y are dependent.`}];},
  draw(l){const t=TABLES[l.params.t],c=calc(t),st=l.step,nc=t.ys.length,nr=t.xs.length,cw=Math.min(100,480/(nc+1)),ch=42,x0=40,y0=40;let s='';
   const cell=(r,k,txt,hi,bold)=>`<rect x="${x0+k*cw}" y="${y0+r*ch}" width="${cw}" height="${ch}" fill="${hi?'var(--yellow)':'var(--sheet)'}" stroke="var(--line)"/>`+text(x0+k*cw+cw/2,y0+r*ch+ch/2+5,txt,`text-anchor="middle" font-size="14"${bold?' font-weight="700"':''}`);
   s+=cell(0,0,'x \\ y',false,true);t.ys.forEach((y,j)=>s+=cell(0,j+1,y,false,true));if(st>=1)s+=cell(0,nc+1,'p_X',st===1,true);
   const i0=t.p.findIndex((r,i)=>r.some((v,j)=>Math.abs(v-c.px[i]*c.py[j])>1e-9)),j0=i0<0?-1:t.p[i0].findIndex((v,j)=>Math.abs(v-c.px[i0]*c.py[j])>1e-9);
   t.xs.forEach((x,i)=>{s+=cell(i+1,0,x,false,true);t.p[i].forEach((v,j)=>s+=cell(i+1,j+1,t.lab(v),st===5&&i===i0&&j===j0,false));if(st>=1)s+=cell(i+1,nc+1,F(c.px[i],4),st===1,true);});
   if(st>=2){s+=cell(nr+1,0,'p_Y',st===2,true);c.py.forEach((v,j)=>s+=cell(nr+1,j+1,F(v,4),st===2,true));}
   const ty=y0+(nr+2)*ch+28;if(st>=3)s+=text(x0,ty,`E(X) = ${F(c.ex,4)}    E(Y) = ${F(c.ey,4)}    E(XY) = ${F(c.exy,4)}`,'font-size="14"');
   if(st>=4)s+=text(x0,ty+24,`Cov(X, Y) = ${F(c.cv,4)}    ρ = ${F(c.rho,4)}`,'font-size="14" font-weight="700"');
   return s;},
  metrics(l){const c=calc(TABLES[l.params.t]),st=l.step,m=[];if(st>=4)m.push(['Cov(X, Y)',F(c.cv,4)],['ρ',F(c.rho,4)]);if(st>=3)m.push(['Var(X + Y)',F(c.vx+c.vy+2*c.cv,4)]);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>By hand:</strong> ${M('p_X(x)=\\sum_y p(x,y)')}, ${M('\\text{Cov}=E(XY)-\\mu_X\\mu_Y')}, ${M('\\rho=\\frac{\\text{Cov}}{\\sigma_X\\sigma_Y}')}. Independent means ${M('p(x,y)=p_X(x)p_Y(y)')} in every cell.`;}};

 // populations with mean 1 and known SD
 const POP={
  exp:{name:'Exponential (right-skewed)',draw:()=>-Math.log(1-Math.random()),f:x=>x>=0?Math.exp(-x):0,sd:1,lo:-0.5,hi:5},
  unif:{name:'Uniform (flat)',draw:()=>1+Math.sqrt(3)*(2*Math.random()-1),f:x=>Math.abs(x-1)<=Math.sqrt(3)?1/(2*Math.sqrt(3)):0,sd:1,lo:-1.5,hi:3.5},
  bimodal:{name:'Two bumps (bimodal)',draw:()=>(Math.random()<.5?.2:1.8)+.25*rngNormal(),f:x=>.5*(Math.exp(-(((x-.2)/.25)**2)/2)+Math.exp(-(((x-1.8)/.25)**2)/2))/(.25*Math.sqrt(2*Math.PI)),sd:Math.sqrt(.0625+.64),lo:-1,hi:3}};
 const npdf=(x,m,s)=>Math.exp(-(((x-m)/s)**2)/2)/(s*Math.sqrt(2*Math.PI));
 Course.labs.clt={module:5,title:'The Central Limit Theorem',
  description:'Pick a population and a sample size n. Step from one sample to 1,000 sample means and compare them with N(μ, σ²/n). Start over draws new samples.',
  params:[{key:'pop',label:'Population',value:'exp',options:Object.entries(POP).map(([k,v])=>[k,v.name])},{key:'n',label:'Sample size n',value:'5',options:['2','5','10','41','100']}],
  setup(l){const P=POP[l.params.pop],n=+l.params.n;l.data.sample=Array.from({length:n},P.draw);l.data.means=Array.from({length:1000},()=>{let s=0;for(let i=0;i<n;i++)s+=P.draw();return s/n;});},
  steps(l){const P=POP[l.params.pop],n=+l.params.n,se=P.sd/Math.sqrt(n),m=l.data.means,mm=sum(m)/m.length,sd=Math.sqrt(sum(m.map(v=>(v-mm)**2))/(m.length-1)),xbar=sum(l.data.sample)/n;return [
   {title:'1. The population',text:`${P.name}, with mean μ = 1 and standard deviation σ = ${F(P.sd,3)}.`},
   {title:`2. One sample of n = ${n}`,text:`The dots are ${n} draws; their mean is x̄ = ${F(xbar,3)}. Another sample would give a different x̄.`},
   {title:'3. 1,000 sample means',text:`The histogram shows x̄ from 1,000 samples of size ${n}: the sampling distribution of x̄. Its mean is ${F(mm,3)}.`},
   {title:'4. Compare with the normal curve',text:`The red curve is N(1, σ²/n) with σ/√n = ${F(se,3)}. ${n>40?`n = ${n} > 40: the course rule says the CLT applies.`:`n = ${n} ≤ 40: for a non-normal population the normal curve may not fit yet.`}`},
   {title:'5. The spread shrinks like 1/√n',text:`SD of the 1,000 means: ${F(sd,3)}; theory σ/√n = ${F(se,3)}. Try n = 100 and n = 2 with the exponential population.`}];},
  draw(l){const P=POP[l.params.pop],n=+l.params.n,st=l.step;
   if(st<=1){const N=240,xs=Array.from({length:N+1},(_,i)=>P.lo+(P.hi-P.lo)*i/N),M=Math.max(...xs.map(P.f))*1.1,px=x=>50+(x-P.lo)/(P.hi-P.lo)*600,py=y=>300-y/M*200;let s=`<path d="${xs.map((x,i)=>`${i?'L':'M'}${px(x)},${py(P.f(x))}`).join(' ')}" fill="var(--blue-light)" stroke="var(--navy)" stroke-width="2"/>`+line(50,300,650,300);
    for(let i=0;i<=5;i++){const v=P.lo+(P.hi-P.lo)*i/5;s+=text(px(v),320,F(v,1),'text-anchor="middle" font-size="12"');}
    s+=line(px(1),70,px(1),300,'miss','stroke-dasharray="4 4"')+text(px(1),62,'μ = 1','text-anchor="middle" font-size="12"');
    if(st===1){const xb=sum(l.data.sample)/n;l.data.sample.slice(0,100).forEach((v,i)=>{s+=`<circle cx="${px(Math.max(P.lo,Math.min(P.hi,v)))}" cy="${290-(i%5)*8}" r="4" class="red"/>`;});s+=line(px(xb),40,px(xb),300,'capture')+text(px(xb),34,`x̄ = ${F(xb,2)}`,'text-anchor="middle" font-size="12" fill="var(--blue)"');}
    return s+text(50,24,P.name,'font-size="13"');}
   const se=P.sd/Math.sqrt(n),lo=Math.min(P.lo,1-4.2*se),hi=Math.max(1+4.2*se,n<=5?P.hi:1+4.2*se);
   return histogram(l.data.means,lo,hi,{bins:40,label:'sample mean x̄',density:st>=3?x=>npdf(x,1,se):null})+text(50,24,`1,000 sample means, n = ${n}`,'font-size="13"');},
  metrics(l){const P=POP[l.params.pop],n=+l.params.n,st=l.step,m=l.data.means,mm=sum(m)/m.length,sd=Math.sqrt(sum(m.map(v=>(v-mm)**2))/(m.length-1)),out=[];if(st>=2)out.push(['Mean of x̄ values',F(mm,3)]);if(st>=4)out.push(['SD of x̄ values',F(sd,3)],['σ/√n',F(P.sd/Math.sqrt(n),3)]);return out;},
  warning(l){return l.step>=3&&+l.params.n<=40&&l.params.pop!=='unif'?'n ≤ 40 with a non-normal population: the course rule does not allow the CLT yet.':'';},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>CLT:</strong> ${M('\\bar X\\approx N\\big(\\mu,\\tfrac{\\sigma^2}{n}\\big)')} for large n (course rule n &gt; 40), whatever the population shape. If the population is normal, ${M('\\bar X')} is exactly normal for every n.`;}};
})();
