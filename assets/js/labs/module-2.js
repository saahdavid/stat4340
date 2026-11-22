/* Module 2 lab: Bayes with a tree and natural frequencies. A step lab: nothing moves until Next step. */
(function(){const {F,text,line}=Course.Lab;
 const box=(x,y,w,h,label,count,hi)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${hi?'var(--yellow)':'var(--sheet)'}" stroke="${hi?'var(--navy)':'var(--line)'}" stroke-width="${hi?3:1.5}"/>`+text(x+w/2,y+h/2-3,label,'text-anchor="middle" font-size="13"')+text(x+w/2,y+h/2+15,count,'text-anchor="middle" font-size="15" font-weight="700"');
 const SC={
  test:l=>{const prev=Number(l.params.prev),sens=Number(l.params.sens),spec=Number(l.params.spec);return {names:['Has the condition','No condition'],prior:[prev,1-prev],like:[sens,1-spec],ev:'Positive',evNot:'Negative',target:0,q:'P(condition | positive)'};},
  machines:()=>({names:['M1','M2','M3'],prior:[.40,.35,.25],like:[.02,.03,.05],ev:'Defective',evNot:'Good',target:2,q:'P(M3 | defective)'})};
 const model=l=>{const m=SC[l.params.scenario](l),N=10000;m.n=m.prior.map(p=>Math.round(N*p));m.e=m.n.map((k,i)=>Math.round(k*m.like[i]));m.tot=m.e.reduce((a,b)=>a+b,0);m.N=N;return m;};
 Course.labs.bayes={module:2,title:'Bayes with a tree of 10,000',
  description:'Picture 10,000 units passing through the tree. Step through the split by the prior, then by the evidence, then reverse the condition. Change the scenario or the rates and start again.',
  params:[{key:'scenario',label:'Scenario',value:'test',options:[['test','A diagnostic test'],['machines','Three machines (Chapter 2 example)']]},{key:'prev',label:'Prevalence',value:'0.05',options:['0.01','0.05','0.2','0.55']},{key:'sens',label:'P(+ | condition)',value:'0.99',options:['0.9','0.95','0.99']},{key:'spec',label:'P(− | no condition)',value:'0.95',options:['0.9','0.95','0.992']}],
  steps(l){const m=model(l),t=m.target;return [
   {title:'1. Start with 10,000 units',text:'Natural frequencies turn probabilities into counts, so every step is a division you can see.'},
   {title:'2. Split by the prior',text:m.names.map((nm,i)=>`${nm}: 10,000 × ${F(m.prior[i],4)} = ${m.n[i].toLocaleString()}`).join('; ')+'.'},
   {title:`3. Split each branch by the evidence`,text:m.names.map((nm,i)=>`${nm}: ${m.n[i].toLocaleString()} × ${F(m.like[i],4)} = ${m.e[i].toLocaleString()} ${m.ev.toLowerCase()}`).join('; ')+'.'},
   {title:`4. Total probability: all ${m.ev.toLowerCase()} units`,text:`${m.e.map(x=>x.toLocaleString()).join(' + ')} = ${m.tot.toLocaleString()}, so P(${m.ev.toLowerCase()}) ≈ ${m.tot.toLocaleString()}/10,000 = ${F(m.tot/m.N,4)}.`},
   {title:'5. Reverse the condition (Bayes)',text:`${m.q} = ${m.e[t].toLocaleString()}/${m.tot.toLocaleString()} = ${F(m.e[t]/m.tot,4)}. The prior was ${F(m.prior[t],4)}.`}];},
  draw(l){const m=model(l),st=l.step,k=m.names.length,H=300,rowH=H/k;let out=box(10,150,120,60,'All units','10,000',st===0);
   m.names.forEach((nm,i)=>{const y=30+i*rowH+rowH/2-25;if(st>=1){out+=line(130,180,240,y+25,'axis')+text(185,(180+y+25)/2-6,F(m.prior[i],3),'text-anchor="middle" font-size="12" fill="var(--muted)"')+box(240,y,140,50,nm,m.n[i].toLocaleString(),st===1);}
    if(st>=2){const ye=y-20,yn=y+30;out+=line(380,y+25,470,ye+20,'axis')+line(380,y+25,470,yn+20,'axis')+text(425,ye+14,F(m.like[i],3),'text-anchor="middle" font-size="11" fill="var(--muted)"')+box(470,ye,108,40,m.ev,m.e[i].toLocaleString(),st>=3&&(st===3||i===m.target))+box(470,yn,108,40,m.evNot,(m.n[i]-m.e[i]).toLocaleString(),false);}});
   if(st>=3)out+=text(640,170,`${m.ev}:`,'text-anchor="middle" font-size="13"')+text(640,192,m.tot.toLocaleString(),'text-anchor="middle" font-size="18" font-weight="700"');
   if(st>=4)out+=text(640,230,'Bayes:','text-anchor="middle" font-size="13"')+text(640,252,F(m.e[m.target]/m.tot,4),'text-anchor="middle" font-size="18" font-weight="700" fill="var(--navy)"');
   return out;},
  metrics(l){const m=model(l),st=l.step,out=[];if(st>=3)out.push([`P(${m.ev.toLowerCase()})`,F(m.tot/m.N,4)]);if(st>=4)out.push(['Prior',F(m.prior[m.target],4)],['Posterior',F(m.e[m.target]/m.tot,4)]);return out;},
  warning(l){return l.params.scenario==='machines'?'The three-machine scenario uses the Chapter 2 example; the rate menus apply to the diagnostic test.':'';},
  theory(){const M=t=>`<span class="math">${t}</span>`;return `<strong>By hand:</strong> ${M('P(B)=\\sum_i P(B\\mid A_i)P(A_i)')} and ${M('P(A_j\\mid B)=\\frac{P(B\\mid A_j)P(A_j)}{P(B)}')}. With a rare condition, even an accurate test produces many false positives, so the posterior can be far below the test’s accuracy.`;}
 };
})();
