/* Module 3 labs (step labs): building a binomial distribution; the binomial-to-Poisson approximation. */
(function(){const {F,text,line}=Course.Lab;
 const C=(a,b)=>{if(b<0||b>a)return 0;let r=1;for(let i=1;i<=b;i++)r=r*(a-b+i)/i;return Math.round(r);};
 const fact=k=>{let r=1;for(let i=2;i<=k;i++)r*=i;return r;};
 const bin=(x,n,p)=>C(n,x)*p**x*(1-p)**(n-x),pois=(x,m)=>Math.exp(-m)*m**x/fact(x);
 // bar chart helper: values over 0..K, returns svg pieces
 function bars(vals,{x0=60,x1=660,y0=290,h=210,max,fill='var(--blue-light)',stroke='var(--navy)',hi=()=>false,outline=false,offset=0,w=.7}={}){const K=vals.length,step=(x1-x0)/K,M=max||Math.max(...vals,1e-9);let s='';
  vals.forEach((v,i)=>{const bh=v/M*h,x=x0+i*step+step*(1-w)/2+offset*step;s+=outline?`<rect x="${x}" y="${y0-bh}" width="${step*w}" height="${bh}" fill="none" stroke="var(--red)" stroke-width="2"/>`:`<rect x="${x}" y="${y0-bh}" width="${step*w}" height="${bh}" fill="${hi(i)?'var(--yellow)':fill}" stroke="${stroke}" stroke-width="${hi(i)?2.5:1}"/>`;});return s;}
 function axisX(K,{x0=60,x1=660,y0=290,label='x'}={}){const step=(x1-x0)/K;let s=line(x0,y0,x1,y0);const every=K>16?Math.ceil(K/16):1;for(let i=0;i<K;i+=every)s+=text(x0+i*step+step/2,y0+18,i,'text-anchor="middle" font-size="12"');return s+text((x0+x1)/2,y0+40,label,'text-anchor="middle" font-size="13"');}

 Course.labs.binombuild={module:3,title:'Building a binomial distribution',
  description:'Choose n, p, and a value k. Step through one probability, then the whole PMF, the CDF, and the mean and standard deviation.',
  params:[{key:'n',label:'n (trials)',value:'10',options:['5','8','10','12','15','20']},{key:'p',label:'p (success)',value:'0.3',options:['0.1','0.2','0.3','0.5','0.7']},{key:'k',label:'k',value:'3',options:['0','1','2','3','4','5','6']}],
  steps(l){const n=+l.params.n,p=+l.params.p,k=Math.min(+l.params.k,n),q=1-p,pk=bin(k,n,p),cdf=Array.from({length:k+1},(_,i)=>bin(i,n,p)).reduce((a,b)=>a+b,0),mu=n*p,sd=Math.sqrt(n*p*q);return [
   {title:'1. The setting',text:`n = ${n} independent trials, each a success with probability p = ${p}. X counts the successes, so X ~ Bin(${n}, ${p}) and X can be 0, 1, …, ${n}.`},
   {title:`2. One value: P(X = ${k})`,text:`Choose which ${k} trials succeed: C(${n}, ${k}) = ${C(n,k)} ways. Each such sequence has probability ${p}^${k} × ${F(q,2)}^${n-k} = ${F(p**k*q**(n-k),6)}. So P(X = ${k}) = ${C(n,k)} × ${F(p**k*q**(n-k),6)} = ${F(pk,4)}.`},
   {title:'3. Every value: the PMF',text:`Repeat for x = 0, …, ${n}. The bars add to 1. The tallest bar is near np = ${F(mu,2)}.`},
   {title:`4. The CDF: P(X ≤ ${k})`,text:`Add the shaded bars x = 0, …, ${k}: B(${k}; ${n}, ${p}) = ${F(cdf,4)}. P(X > ${k}) = 1 − ${F(cdf,4)} = ${F(1-cdf,4)}.`},
   {title:'5. Center and spread',text:`E(X) = np = ${F(mu,3)} and σ = √(npq) = ${F(sd,3)}. Try p = 0.5 for a symmetric shape, and a small p for a right skew.`}];},
  draw(l){const n=+l.params.n,p=+l.params.p,k=Math.min(+l.params.k,n),st=l.step,vals=Array.from({length:n+1},(_,i)=>bin(i,n,p)),max=Math.max(...vals);let s=axisX(n+1,{label:'x = number of successes'});
   if(st===1)s+=bars(vals.map((v,i)=>i===k?v:0),{max,hi:i=>i===k});
   if(st>=2)s+=bars(vals,{max,hi:i=>st===3?i<=k:i===k&&st===2});
   if(st>=2&&st!==3)s+=text(60+(k+.5)*600/(n+1),290-vals[k]/max*210-8,F(vals[k],4),'text-anchor="middle" font-size="12"');
   if(st>=4){const mu=n*p,sd=Math.sqrt(n*p*(1-p)),X=v=>60+(v+.5)*600/(n+1);s+=line(X(mu),46,X(mu),290,'miss','stroke-dasharray="5 4"')+text(X(mu),24,`np = ${F(mu,2)}`,'text-anchor="middle" font-size="12" fill="var(--red)"')+`<line x1="${X(mu-sd)}" y1="40" x2="${X(mu+sd)}" y2="40" stroke="var(--navy)" stroke-width="3"/>`+text(X(mu+sd)+6,44,'±σ','font-size="12"');}
   return s;},
  metrics(l){const n=+l.params.n,p=+l.params.p,k=Math.min(+l.params.k,n),st=l.step,m=[];if(st>=1)m.push([`P(X = ${k})`,F(bin(k,n,p),4)]);if(st>=3)m.push([`P(X ≤ ${k})`,F(Array.from({length:k+1},(_,i)=>bin(i,n,p)).reduce((a,b)=>a+b,0),4)]);if(st>=4)m.push(['E(X) = np',F(n*p,3)],['σ = √(npq)',F(Math.sqrt(n*p*(1-p)),3)]);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>By hand:</strong> ${M('b(x;n,p)=\\binom{n}{x}p^x(1-p)^{n-x}')}, ${M('B(x;n,p)=\\sum_{y\\le x}b(y;n,p)')}, ${M('E(X)=np')}, ${M('\\text{Var}(X)=np(1-p)')}.`;}};

 Course.labs.poissonapprox={module:3,title:'Binomial or Poisson?',
  description:'Compare Bin(n, p) with Poisson(μ = np). Step through both distributions and the rule of thumb, then change n and p to see when the approximation works.',
  params:[{key:'n',label:'n',value:'100',options:['20','40','100','200','500']},{key:'p',label:'p',value:'0.02',options:['0.01','0.02','0.05','0.1','0.2']}],
  steps(l){const n=+l.params.n,p=+l.params.p,mu=n*p,ok=n>50&&mu<5,K=Math.max(8,Math.min(n,Math.ceil(mu+4*Math.sqrt(mu)+2))),b=Array.from({length:K+1},(_,i)=>bin(i,n,p)),q=Array.from({length:K+1},(_,i)=>pois(i,mu)),gap=Math.max(...b.map((v,i)=>Math.abs(v-q[i]))),c2b=b.slice(0,3).reduce((a,c)=>a+c,0),c2q=q.slice(0,3).reduce((a,c)=>a+c,0);return [
   {title:'1. The binomial',text:`X ~ Bin(${n}, ${p}): the blue bars are the exact probabilities.`},
   {title:'2. The Poisson with μ = np',text:`μ = ${n} × ${p} = ${F(mu,3)}. The red outlines are Poisson(${F(mu,3)}) probabilities, e^(−μ)μ^x/x!.`},
   {title:'3. The rule of thumb',text:`n = ${n} ${n>50?'>':'≤'} 50 and np = ${F(mu,3)} ${mu<5?'<':'≥'} 5, so the approximation is ${ok?'reasonable':'not recommended'}. Largest gap between the two PMFs: ${F(gap,4)}.`},
   {title:'4. Compare a probability',text:`P(X ≤ 2): binomial ${F(c2b,4)}, Poisson ${F(c2q,4)}. Try n = 500, p = 0.01, then n = 20, p = 0.2.`}];},
  draw(l){const n=+l.params.n,p=+l.params.p,mu=n*p,K=Math.max(8,Math.min(n,Math.ceil(mu+4*Math.sqrt(mu)+2))),b=Array.from({length:K+1},(_,i)=>bin(i,n,p)),q=Array.from({length:K+1},(_,i)=>pois(i,mu)),max=Math.max(...b,...q),st=l.step;
   let s=axisX(K+1,{label:'x'})+bars(b,{max,hi:i=>st===3&&i<=2});if(st>=1)s+=bars(q,{max,outline:true,w:.5});
   if(st>=1)s+=`<rect x="470" y="30" width="14" height="12" fill="var(--blue-light)" stroke="var(--navy)"/>`+text(490,40,'Binomial','font-size="12"')+`<rect x="570" y="30" width="14" height="12" fill="none" stroke="var(--red)" stroke-width="2"/>`+text(590,40,'Poisson','font-size="12"');return s;},
  warning(l){const n=+l.params.n,p=+l.params.p;return l.step>=2&&!(n>50&&n*p<5)?'The rule of thumb fails here: n must exceed 50 and np must be below 5.':'';},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>Rule of thumb:</strong> if ${M('X\\sim\\text{Bin}(n,p)')} with ${M('n>50')} and ${M('np<5')}, use ${M('\\text{Poisson}(\\mu=np)')}: ${M('p(x;\\mu)=e^{-\\mu}\\mu^x/x!')}.`;}};
})();
