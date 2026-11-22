/* Module 7 lab (step lab): what the confidence level means, and Wald versus Wilson coverage. */
(function(){const {F,text,line,rngNormal}=Course.Lab,S=Stats;
 const ZC={90:1.645,95:1.96,99:2.576};
 const METHODS={
  z:{name:'z interval for μ (σ = 2 known, n = 25)',truth:28,lo:26,hi:30,label:'μ',make(conf){const n=25,x=Array.from({length:n},()=>28+2*rngNormal()),m=x.reduce((a,b)=>a+b,0)/n,me=ZC[conf]*2/Math.sqrt(n);return [m-me,m+me,m];}},
  t:{name:'t interval for μ (n = 8, σ unknown)',truth:28,lo:24,hi:32,label:'μ',make(conf){const n=8,x=Array.from({length:n},()=>28+2*rngNormal()),m=x.reduce((a,b)=>a+b,0)/n,s=Math.sqrt(x.reduce((a,v)=>a+(v-m)**2,0)/(n-1)),me=S.tCritical(n-1,conf/100)*s/Math.sqrt(n);return [m-me,m+me,m];}},
  wald:{name:'Wald interval for p (p = 0.1, n = 30)',truth:.1,lo:-.1,hi:.4,label:'p',make(conf){const n=30;let x=0;for(let i=0;i<n;i++)if(Math.random()<.1)x++;const p=x/n,me=ZC[conf]*Math.sqrt(p*(1-p)/n);return [p-me,p+me,p];}},
  wilson:{name:'Score (Wilson) interval for p (p = 0.1, n = 30)',truth:.1,lo:-.1,hi:.4,label:'p',make(conf){const n=30;let x=0;for(let i=0;i<n;i++)if(Math.random()<.1)x++;const p=x/n,z=ZC[conf],d=1+z*z/n,c=(p+z*z/(2*n))/d,me=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [c-me,c+me,p];}}};
 const hits=(l,k)=>l.data.iv.slice(0,k).filter(v=>v[0]<=l.data.truth&&l.data.truth<=v[1]).length;
 Course.labs.repeatci={module:7,title:'What “95% confident” means',
  description:'Draw many samples, build an interval from each, and count how many capture the true value. Step from one interval to 100. Start over draws new samples.',
  params:[{key:'m',label:'Interval',value:'z',options:Object.entries(METHODS).map(([k,v])=>[k,v.name])},{key:'conf',label:'Confidence',value:'95',options:['90','95','99']}],
  setup(l){const M=METHODS[l.params.m];l.data.truth=M.truth;l.data.iv=Array.from({length:100},()=>M.make(+l.params.conf));},
  steps(l){const M=METHODS[l.params.m],c=+l.params.conf,h20=hits(l,20),h100=hits(l,100),wald=l.params.m==='wald',wil=l.params.m==='wilson';return [
   {title:'1. The truth',text:`The red line is the true ${M.label} = ${M.truth}. In practice it is unknown.`},
   {title:'2. One sample, one interval',text:`Sample 1 gives (${F(l.data.iv[0][0],3)}, ${F(l.data.iv[0][1],3)}). It ${hits(l,1)?'captures':'misses'} ${M.label}. From one interval we cannot tell which.`},
   {title:'3. Twenty samples',text:`${h20} of 20 intervals capture ${M.label} (blue); misses are red. Each interval has a different center.`},
   {title:'4. One hundred samples',text:`${h100} of 100 capture ${M.label}: ${h100}%. The confidence level is ${c}%.`},
   {title:'5. What the level promises',text:wald?`For a small n and p near 0, the Wald interval often captures less than ${c}% of the time (its true coverage is lower), and it can dip below 0. Switch to the score (Wilson) interval to compare.`:wil?`The score interval keeps its coverage close to ${c}% even for this small n and stays within [0, 1].`:`About ${c}% of intervals built this way capture ${M.label}. Change the confidence level: higher confidence gives wider intervals.`}];},
  draw(l){const M=METHODS[l.params.m],st=l.step,k=st===0?0:st===1?1:st===2?20:100,X=v=>50+(v-M.lo)/(M.hi-M.lo)*600,rowH=Math.min(10,250/Math.max(k,1));let s=line(50,300,650,300);
   for(let i=0;i<=5;i++){const v=M.lo+(M.hi-M.lo)*i/5;s+=text(X(v),320,F(v,2),'text-anchor="middle" font-size="12"');}
   s+=line(X(M.truth),30,X(M.truth),300,'miss','stroke-width="2"')+text(X(M.truth),24,`${M.label} = ${M.truth}`,'text-anchor="middle" font-size="12" fill="var(--red)"');
   l.data.iv.slice(0,k).forEach((v,i)=>{const ok=v[0]<=M.truth&&M.truth<=v[1],y=290-(i+.5)*rowH*(k>20?1:Math.min(1,10/rowH));const yy=k===1?170:k===20?290-(i+.5)*12:y;s+=`<line x1="${X(Math.max(M.lo,v[0]))}" y1="${yy}" x2="${X(Math.min(M.hi,v[1]))}" y2="${yy}" stroke="${ok?'var(--blue)':'var(--red)'}" stroke-width="${k===1?4:k===20?3:1.6}"/>`+(k<=20?`<circle cx="${X(v[2])}" cy="${yy}" r="${k===1?4:2.5}" fill="${ok?'var(--blue)':'var(--red)'}"/>`:'');});
   return s;},
  metrics(l){const st=l.step,m=[];if(st>=2)m.push(['Captured of 20',`${hits(l,20)}`]);if(st>=3)m.push(['Captured of 100',`${hits(l,100)}`],['Confidence level',`${l.params.conf}%`]);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>Meaning:</strong> the interval ${M('\\bar X\\pm z_{\\alpha/2}\\sigma/\\sqrt n')} is random because ${M('\\bar X')} is; μ is fixed. Over many samples about 100(1 − α)% of the intervals contain μ.`;}};
})();
