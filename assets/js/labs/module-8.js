/* Module 8 labs (step labs): the rejection region and the p-value; Type I error, Type II error and the α–β trade-off. */
(function(){const {F,text,line}=Course.Lab,S=Stats;
 const X0=60,X1=660,Y0=280,H=210;
 const zpdf=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
 const tpdf=(x,v)=>Math.exp(S.logGamma((v+1)/2)-S.logGamma(v/2))/Math.sqrt(v*Math.PI)*Math.pow(1+x*x/v,-(v+1)/2);
 function curve(f,lo,hi,M,{shade=[],stroke='var(--navy)',dash=''}={}){const N=240,xs=Array.from({length:N+1},(_,i)=>lo+(hi-lo)*i/N),px=x=>X0+(x-lo)/(hi-lo)*(X1-X0),py=y=>Y0-y/M*H;let s='';
  for(const [a,b,fill,op] of shade){const pts=xs.filter(x=>x>=a&&x<=b);if(pts.length<2)continue;s+=`<path d="M${px(pts[0])},${Y0} ${pts.map(x=>`L${px(x).toFixed(1)},${py(f(x)).toFixed(1)}`).join(' ')} L${px(pts[pts.length-1])},${Y0} Z" fill="${fill}" stroke="none" opacity="${op||0.55}"/>`;}
  s+=`<path d="${xs.map((x,i)=>`${i?'L':'M'}${px(x).toFixed(1)},${py(f(x)).toFixed(1)}`).join(' ')}" fill="none" stroke="${stroke}" stroke-width="2.5"${dash?` stroke-dasharray="${dash}"`:''}/>`;
  return {s,px,py};}
 const axis=(lo,hi,px,dec=1)=>{let s=line(X0,Y0,X1,Y0);const k=Math.round(hi-lo)>8?2:1;for(let v=Math.ceil(lo);v<=hi;v+=k)s+=line(px(v),Y0,px(v),Y0+5)+text(px(v),Y0+20,F(v,dec),'text-anchor="middle" font-size="12"');return s;};
 const ZA={0.1:1.282,0.05:1.645,0.025:1.96,0.01:2.326,0.005:2.576};

 /* ---- Lab 1: rejection region and p-value, step by step ---- */
 Course.labs.rrsteps={module:8,title:'Rejection region and p-value',
  description:'Choose the test, the direction of Hₐ, α, and the observed test statistic. Step through both methods and see that they always reach the same decision.',
  params:[{key:'dist',label:'Test statistic',value:'z',options:[['z','Z (σ known, or n > 40)'],['t19','T, df = 19'],['t8','T, df = 8']]},{key:'dir',label:'Hₐ',value:'ne',options:[['gt','> (upper-tailed)'],['lt','< (lower-tailed)'],['ne','≠ (two-tailed)']]},{key:'a',label:'α',value:'0.05',options:['0.01','0.05','0.1']},{key:'ts',label:'Observed TS',value:'2.16',options:['-2.6','-1.8','-0.9','0.7','1.5','2.16','2.36','3.1']}],
  setup(l){const p=l.params,df=p.dist==='z'?null:+p.dist.slice(1),a=+p.a,tail=p.dir==='ne'?a/2:a,ts=+p.ts;
   const c=df?S.round(S.tInv(1-tail,df),3):ZA[tail],up=x=>df?1-S.tCDF(x,df):1-S.normalCDF(x);
   const zr=S.round(ts,2),Lz=S.tableNormal(zr),pv=df?(p.dir==='gt'?up(ts):p.dir==='lt'?1-up(ts):2*up(Math.abs(ts))):(p.dir==='gt'?S.round(1-Lz,4):p.dir==='lt'?Lz:S.round(2*Math.min(Lz,1-Lz),4));
   const inRR=p.dir==='gt'?ts>=c:p.dir==='lt'?ts<=-c:Math.abs(ts)>=c;Object.assign(l.data,{df,a,c,ts,pv,inRR,f:df?x=>tpdf(x,df):zpdf});},
  steps(l){const d=l.data,p=l.params,dir=p.dir,V=d.df?'T':'Z',sym=d.df?`t<sub>${dir==='ne'?'α/2':'α'},${d.df}</sub>`:`z<sub>${dir==='ne'?'α/2':'α'}</sub>`,rule=dir==='gt'?`TS ≥ ${F(d.c,3)}`:dir==='lt'?`TS ≤ −${F(d.c,3)}`:`|TS| ≥ ${F(d.c,3)}`,pvs=d.pv<0.0001?'less than 0.0001':F(d.pv,4),form=dir==='gt'?`P(${V} > ${d.ts})`:dir==='lt'?`P(${V} < ${d.ts})`:`2P(${V} > ${Math.abs(d.ts)})`;return [
   {title:'1. Assume H₀ is true',text:`Under H₀ the test statistic follows ${d.df?`the t distribution with df = ${d.df}`:'the standard normal distribution'}. This curve is the reference for “how unusual is our sample?”`},
   {title:'2. Shade α in the direction of Hₐ',text:dir==='ne'?`Hₐ is ≠, so α = ${d.a} is split: α/2 = ${d.a/2} in each tail.`:`Hₐ is ${dir==='gt'?'>':'<'}, so all of α = ${d.a} goes in the ${dir==='gt'?'upper':'lower'} tail.`},
   {title:'3. Critical value from the table',text:`${d.df?`t table, row df = ${d.df}`:'z table'}, column ${dir==='ne'?`α/2 = ${d.a/2}`:`α = ${d.a}`}: ${sym} = ${F(d.c,3)}. Rejection region: ${rule}.`},
   {title:'4. Place the observed statistic',text:`TS = ${d.ts} is ${d.inRR?'inside':'outside'} the rejection region, so the critical-value method says: ${d.inRR?'reject H₀':'fail to reject H₀'}.`},
   {title:'5. The p-value is the tail area beyond TS',text:`p-value = ${form} = ${pvs}${d.df?' (exact; the t table only brackets it)':` (z rounded to ${F(S.round(d.ts,2),2)}, normal table)`}. Smaller p-value = stronger evidence against H₀.`},
   {title:'6. Same decision either way',text:`p-value ${d.pv<d.a?'<':'>'} α = ${d.a}, so ${d.pv<d.a?'reject':'fail to reject'} H₀, matching step 4. When TS is in the rejection region, its tail area is smaller than α.`}];},
  draw(l){const d=l.data,dir=l.params.dir,st=l.step,lo=-4.2,hi=4.2,M=0.45,shade=[];
   if(st>=1){if(dir!=='lt')shade.push([d.c,hi,'var(--amber)']);if(dir!=='gt')shade.push([lo,-d.c,'var(--amber)']);}
   if(st>=4){const t=Math.max(lo,Math.min(hi,d.ts)),a=Math.abs(t);if(dir==='gt')shade.push([t,hi,'var(--blue)',0.8]);else if(dir==='lt')shade.push([lo,t,'var(--blue)',0.8]);else shade.push([a,hi,'var(--blue)',0.8],[lo,-a,'var(--blue)',0.8]);}
   const {s,px,py}=curve(d.f,lo,hi,M,{shade});let o=s+axis(lo,hi,px,0);
   if(st>=2)for(const c of dir==='gt'?[d.c]:dir==='lt'?[-d.c]:[-d.c,d.c])o+=line(px(c),50,px(c),Y0,'','stroke="var(--navy)" stroke-dasharray="5 4"')+text(px(c),44,F(c,3),'text-anchor="middle" font-size="12"');
   if(st>=3){const t=Math.max(lo,Math.min(hi,d.ts));o+=`<line x1="${px(t)}" y1="${Y0}" x2="${px(t)}" y2="${py(d.f(t))-18}" stroke="var(--red)" stroke-width="3"/>`+text(px(t),py(d.f(t))-24,`TS = ${d.ts}`,'text-anchor="middle" font-size="13" fill="var(--red)"');}
   if(st>=1)o+=text(X1,24,`amber: rejection region (area α = ${d.a})`,'text-anchor="end" font-size="12"');
   if(st>=4)o+=text(X1,42,`blue: p-value = ${d.pv<0.0001?'< 0.0001':F(d.pv,4)}`,'text-anchor="end" font-size="12"');
   return o+text(X0,24,d.df?`t distribution, df = ${d.df}`:'Standard normal Z','font-size="13"');},
  metrics(l){const d=l.data,st=l.step,m=[];if(st>=2)m.push(['Critical value',F(d.c,3)]);if(st>=3)m.push(['In rejection region?',d.inRR?'yes':'no']);if(st>=4)m.push(['p-value',d.pv<0.0001?'< 0.0001':F(d.pv,4)]);if(st>=5)m.push(['Decision',d.pv<d.a?'reject H₀':'fail to reject H₀']);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>Decision rule:</strong> reject ${M('H_0')} if the p-value is less than α, equivalently if TS is in the rejection region. For ≠, the rejection region is ${M('|TS|\\ge z_{\\alpha/2}')} (or ${M('t_{\\alpha/2,n-1}')}) and the p-value is ${M('2P(Z>|z|)')}.`;}};

 /* ---- Lab 2: Type I and Type II errors (sprinkler example: σ = 1.5, n = 9, H0: μ = 130 vs Ha: μ > 130) ---- */
 Course.labs.errorsbeta={module:8,title:'Type I and Type II errors',
  description:'Sprinkler activation temperatures: σ = 1.5 °F, n = 9, H₀: μ = 130 versus Hₐ: μ > 130. See α as an area under the H₀ curve and β as an area under the curve for a true alternative, then watch β grow when α shrinks.',
  params:[{key:'a',label:'α',value:'0.05',options:['0.01','0.05','0.1']},{key:'mu',label:'True μ (alternative)',value:'131',options:['130.5','131','131.5','132']},{key:'n',label:'n',value:'9',options:['4','9','16','36']}],
  setup(l){const a=+l.params.a,mu=+l.params.mu,nn=+l.params.n,se=1.5/Math.sqrt(nn),za=ZA[a],cut=130+za*se,beta=S.normalCDF((cut-mu)/se);
   const others=[0.1,0.05,0.01].map(x=>[x,S.normalCDF((130+ZA[x]*se-mu)/se)]);Object.assign(l.data,{a,mu,nn,se,za,cut,beta,others});},
  steps(l){const d=l.data;return [
   {title:'1. The null sampling distribution',text:`If H₀ is true, X̄ is normal with mean 130 and SE = 1.5/√${d.nn} = ${F(d.se,4)} °F.`},
   {title:'2. Rejection region and α',text:`Reject H₀ when z ≥ ${d.za}, that is X̄ ≥ 130 + ${d.za}(${F(d.se,4)}) = ${F(d.cut,3)} °F. The amber area is α = ${d.a} = P(Type I error): rejecting when H₀ is true.`},
   {title:'3. Suppose H₀ is false',text:`Say the true mean is μ = ${d.mu} °F. Then X̄ follows the dashed curve, centered at ${d.mu}.`},
   {title:'4. β: failing to reject a false H₀',text:`β = P(X̄ < ${F(d.cut,3)} when μ = ${d.mu}) = Φ((${F(d.cut,3)} − ${d.mu})/${F(d.se,4)}) = ${F(d.beta,4)}. That is the gray area, P(Type II error).`},
   {title:'5. Power',text:`Power = 1 − β = ${F(1-d.beta,4)}: the chance the test detects that μ = ${d.mu}. A larger n or a true μ farther from 130 raises the power.`},
   {title:'6. The α–β trade-off',text:`With n = ${d.nn} fixed: ${d.others.map(([a,b])=>`α = ${a} gives β = ${F(b,4)}`).join('; ')}. Decreasing α increases β. Only a larger n lowers both.`}];},
  draw(l){const d=l.data,st=l.step,lo=130-4*d.se,hi=Math.max(+d.mu+3.5*d.se,130+4.5*d.se),M=1.08*zpdf(0)/d.se,f0=x=>zpdf((x-130)/d.se)/d.se,fa=x=>zpdf((x-d.mu)/d.se)/d.se;
   let o='';const base=curve(f0,lo,hi,M,{shade:st>=1?[[d.cut,hi,'var(--amber)']]:[]});o+=base.s;const px=base.px;
   if(st>=2){const alt=curve(fa,lo,hi,M,{stroke:'var(--blue)',dash:'7 5',shade:st>=3?[[lo,d.cut,'var(--muted, #888)',0.35]]:[]});o+=alt.s+text(px(d.mu)+10,alt.py(fa(d.mu))-8,`true μ = ${d.mu}`,'text-anchor="start" font-size="12" fill="var(--blue)"');}
   if(st>=1)o+=line(px(d.cut),40,px(d.cut),Y0,'','stroke="var(--red)" stroke-width="2"')+text(px(d.cut),34,`cutoff x̄ = ${F(d.cut,3)}`,'text-anchor="middle" font-size="12" fill="var(--red)"');
   o+=text(px(130)-10,base.py(f0(130))-8,'H₀: μ = 130','text-anchor="end" font-size="12"');
   let ax=line(X0,Y0,X1,Y0);const stp=[0.25,0.5,1,2].find(k=>(hi-lo)/k<=10);for(let v=Math.ceil(lo/stp)*stp;v<=hi;v+=stp)ax+=line(px(v),Y0,px(v),Y0+5)+text(px(v),Y0+20,F(v,2),'text-anchor="middle" font-size="12"');
   return o+ax+text(X0,24,'Sampling distribution of X̄ (°F)','font-size="13"');},
  metrics(l){const d=l.data,st=l.step,m=[];if(st>=1)m.push(['α = P(Type I)',String(d.a)]);if(st>=3)m.push(['β = P(Type II)',F(d.beta,4)]);if(st>=4)m.push(['Power = 1 − β',F(1-d.beta,4)]);return m;},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>By hand:</strong> for ${M('H_a:\\mu&gt;\\mu_0')} with σ known, ${M('\\beta(\\mu\')=\\Phi\\left(z_\\alpha-\\frac{\\mu\'-\\mu_0}{\\sigma/\\sqrt n}\\right)')}. With n fixed, decreasing α increases β.`;}};
})();
