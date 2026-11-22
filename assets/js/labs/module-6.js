/* Module 6 labs (step labs): bias versus variance; the likelihood curve. */
(function(){const {F,text,line,rngNormal}=Course.Lab;
 const sum=a=>a.reduce((s,v)=>s+v,0),mean=a=>sum(a)/a.length,med=a=>{const s=[...a].sort((x,y)=>x-y),k=s.length;return k%2?s[(k-1)/2]:(s[k/2-1]+s[k/2])/2;};
 const sdOf=a=>{const m=mean(a);return Math.sqrt(sum(a.map(v=>(v-m)**2))/(a.length-1));};
 const PAIRS={
  meanmed:{name:'x̄ vs. median (normal population, μ = 10)',target:10,label:'μ',A:['x̄',x=>mean(x)],B:['median',x=>med(x)],draw:()=>10+2*rngNormal(),lo:7,hi:13},
  var:{name:'S² vs. σ̂² (divide by n), σ² = 4',target:4,label:'σ²',A:['S² (n − 1)',x=>{const m=mean(x);return sum(x.map(v=>(v-m)**2))/(x.length-1);}],B:['σ̂² (n)',x=>{const m=mean(x);return sum(x.map(v=>(v-m)**2))/x.length;}],draw:()=>10+2*rngNormal(),lo:0,hi:12},
  ends:{name:'x̄ vs. (X₁ + Xₙ)/2 (both unbiased)',target:10,label:'μ',A:['x̄',x=>mean(x)],B:['(X₁ + Xₙ)/2',x=>(x[0]+x[x.length-1])/2],draw:()=>10+2*rngNormal(),lo:5,hi:15}};
 function dots(vals,lo,hi,y,color){const bins=60,c=Array(bins).fill(0);let s='';vals.forEach(v=>{const i=Math.max(0,Math.min(bins-1,Math.floor((v-lo)/(hi-lo)*bins)));const k=c[i]++;if(k<14)s+=`<circle cx="${50+(i+.5)*600/bins}" cy="${y-k*6}" r="2.6" fill="${color}"/>`;});return s;}
 Course.labs.biasvar={module:6,title:'Bias versus variance',
  description:'Two estimators of the same parameter, each computed on 400 random samples. Step through to see where each one is centered (bias) and how spread out it is (variance).',
  params:[{key:'pair',label:'Estimators',value:'meanmed',options:Object.entries(PAIRS).map(([k,v])=>[k,v.name])},{key:'n',label:'Sample size n',value:'5',options:['3','5','10','30']}],
  setup(l){const P=PAIRS[l.params.pair],n=+l.params.n;l.data.samples=Array.from({length:400},()=>Array.from({length:n},P.draw));l.data.A=l.data.samples.map(P.A[1]);l.data.B=l.data.samples.map(P.B[1]);},
  steps(l){const P=PAIRS[l.params.pair],a=l.data.A,b=l.data.B,s0=l.data.samples[0];return [
   {title:'1. The target',text:`The parameter is ${P.label} = ${P.target} (the red line). A good estimator lands near it on average and varies little.`},
   {title:'2. One sample, two estimates',text:`Sample 1: ${P.A[0]} = ${F(P.A[1](s0),3)} and ${P.B[0]} = ${F(P.B[1](s0),3)}. One sample cannot show bias; we need many.`},
   {title:`3. 400 values of ${P.A[0]}`,text:`Their mean is ${F(mean(a),3)} (bias ≈ ${F(mean(a)-P.target,3)}) and their SD is ${F(sdOf(a),3)}.`},
   {title:`4. 400 values of ${P.B[0]}`,text:`Their mean is ${F(mean(b),3)} (bias ≈ ${F(mean(b)-P.target,3)}) and their SD is ${F(sdOf(b),3)}.`},
   {title:'5. Which is better?',text:Math.abs(mean(b)-P.target)>Math.abs(mean(a)-P.target)+0.15*P.target/10?`${P.B[0]} is centered off the target: it is biased. Prefer ${P.A[0]}.`:`Both are centered near ${P.target}; prefer the smaller spread: ${sdOf(a)<=sdOf(b)?P.A[0]:P.B[0]}. Increase n and both tighten.`}];},
  draw(l){const P=PAIRS[l.params.pair],st=l.step,X=v=>50+(v-P.lo)/(P.hi-P.lo)*600;let s=line(50,300,650,300);for(let i=0;i<=6;i++){const v=P.lo+(P.hi-P.lo)*i/6;s+=text(X(v),320,F(v,1),'text-anchor="middle" font-size="12"');}
   s+=line(X(P.target),30,X(P.target),300,'miss','stroke-width="2"')+text(X(P.target),24,`${P.label} = ${P.target}`,'text-anchor="middle" font-size="12" fill="var(--red)"');
   s+=text(648,160,P.A[0],'text-anchor="end" font-size="13" font-weight="700"')+text(648,300-6,P.B[0],'text-anchor="end" font-size="13" font-weight="700"');
   if(st===1){const s0=l.data.samples[0];s+=`<circle cx="${X(P.A[1](s0))}" cy="140" r="6" fill="var(--navy)"/><circle cx="${X(P.B[1](s0))}" cy="280" r="6" fill="var(--amber)"/>`;}
   if(st>=2){s+=dots(l.data.A,P.lo,P.hi,145,'var(--navy)');s+=line(X(mean(l.data.A)),60,X(mean(l.data.A)),150,'capture');}
   if(st>=3){s+=dots(l.data.B,P.lo,P.hi,285,'var(--amber)');s+=line(X(mean(l.data.B)),200,X(mean(l.data.B)),290,'capture');}
   return s;},
  metrics(l){const P=PAIRS[l.params.pair],st=l.step,m=[];if(st>=2)m.push([`Mean of ${P.A[0]}`,F(mean(l.data.A),3)],[`SD of ${P.A[0]}`,F(sdOf(l.data.A),3)]);if(st>=3)m.push([`Mean of ${P.B[0]}`,F(mean(l.data.B),3)],[`SD of ${P.B[0]}`,F(sdOf(l.data.B),3)]);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>Criteria:</strong> unbiased means ${M('E(\\hat\\theta)=\\theta')}; among unbiased estimators prefer the smallest variance (the MVUE). For a normal sample, ${M('\\bar X')} is the MVUE of μ, and ${M('E(\\hat\\sigma^2)=\\frac{n-1}{n}\\sigma^2')}.`;}};

 const DATA={a:[2.1,0.6,3.8,1.4,0.9,2.7],b:[0.4,0.9,0.3,1.2,0.7,0.5,0.8,0.6],c:[5.2,8.1,3.9,6.6]};
 Course.labs.likelihood={module:6,title:'Finding the MLE on the likelihood curve',
  description:'Exponential data. Step from the likelihood at one value of λ to the whole curve, its logarithm, and its maximum at 1/x̄.',
  params:[{key:'d',label:'Data set',value:'a',options:[['a','Six pump failures (hours)'],['b','Eight short delays (s)'],['c','Four long lifetimes (years)']]},{key:'lam0',label:'Try λ =',value:'1',options:['0.25','0.5','1','2']}],
  steps(l){const x=DATA[l.params.d],n=x.length,sx=sum(x),lh=n/sx,l0=+l.params.lam0,L=lam=>lam**n*Math.exp(-lam*sx);return [
   {title:'1. The data',text:`n = ${n} values: ${x.join(', ')}. <span class="math">\\sum x_i = ${F(sx,3)}</span> and <span class="math">\\bar x = ${F(sx/n,4)}</span>.`},
   {title:`2. The likelihood at λ = ${l0}`,text:`<span class="math">L(\\lambda)=\\lambda^n e^{-\\lambda\\sum x_i} = ${l0}^{${n}} e^{-${l0}(${F(sx,3)})}</span> = ${L(l0).toExponential(3)}.`},
   {title:'3. The whole likelihood curve',text:'Each λ gives a value of L. The data are most plausible where the curve peaks.'},
   {title:'4. The log-likelihood',text:`<span class="math">\\ell(\\lambda) = ${n}\\ln\\lambda - ${F(sx,3)}\\lambda</span> peaks at the same λ, and its derivative <span class="math">${n}/\\lambda - ${F(sx,3)}</span> is easy to set to 0.`},
   {title:'5. The maximum',text:`<span class="math">\\hat\\lambda = n/\\textstyle\\sum x_i = ${n}/${F(sx,3)} = ${F(lh,4)} = 1/\\bar x</span>. Invariance: the MLE of the mean 1/λ is <span class="math">\\bar x = ${F(sx/n,4)}</span>.`}];},
  draw(l){const x=DATA[l.params.d],n=x.length,sx=sum(x),lh=n/sx,l0=+l.params.lam0,st=l.step,hi=Math.max(3*lh,l0*1.2),lo=hi/300,N=300,ls=Array.from({length:N},(_,i)=>lo+(hi-lo)*i/(N-1));
   const logL=lam=>n*Math.log(lam)-lam*sx,L=lam=>Math.exp(logL(lam)-logL(lh)),px=v=>50+(v-0)/hi*600;let s=line(50,300,650,300);for(let i=0;i<=5;i++){const v=hi*i/5;s+=text(px(v),320,F(v,2),'text-anchor="middle" font-size="12"');}s+=text(350,345,'λ','text-anchor="middle" font-size="13"');
   if(st===0){x.forEach((v,i)=>{s+=text(80+i*70,160,F(v,2),'font-size="16"');});return s+text(50,24,'Data','font-size="13"');}
   const useLog=st===3,yv=lam=>useLog?Math.max(-12,logL(lam)-logL(lh)):L(lam),ymin=useLog?-12:0,ymax=useLog?0.5:1.08,py=v=>300-(v-ymin)/(ymax-ymin)*250;
   if(st>=2)s+=`<path d="${ls.map((v,i)=>`${i?'L':'M'}${px(v)},${py(yv(v))}`).join(' ')}" fill="none" stroke="var(--navy)" stroke-width="2.5"/>`;
   if(st>=1){const y0=py(yv(l0));s+=`<circle cx="${px(l0)}" cy="${y0}" r="6" fill="var(--amber)"/>`+text(px(l0)+8,y0-8,`λ = ${l0}`,'font-size="12"');}
   if(st>=4)s+=line(px(lh),52,px(lh),300,'miss','stroke-dasharray="5 4"')+text(px(lh)+6,64,`λ̂ = ${F(lh,3)}`,'font-size="12" fill="var(--red)"');
   return s+text(650,24,useLog?'log-likelihood ℓ(λ) − ℓ(λ̂)':'likelihood L(λ), scaled so the maximum is 1','text-anchor="end" font-size="13"');},
  metrics(l){const x=DATA[l.params.d],n=x.length,sx=sum(x),st=l.step,m=[];if(st>=0)m.push(['Sample mean',F(sx/n,4)]);if(st>=4)m.push(['MLE of λ',F(n/sx,4)]);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>By hand:</strong> ${M('L(\\lambda)=\\lambda^ne^{-\\lambda\\sum x_i}')}, ${M('\\ell(\\lambda)=n\\ln\\lambda-\\lambda\\sum x_i')}, ${M("\\ell'(\\lambda)=\\frac n\\lambda-\\sum x_i=0\\Rightarrow\\hat\\lambda=\\frac1{\\bar x}")}.`;}};
})();
