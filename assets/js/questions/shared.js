(function(root){
 'use strict';
 const S=root.Stats;
 const C=root.Course={titles:['Descriptive Statistics','Probability','Discrete Random Variables','Continuous Random Variables','Joint Distributions & the CLT','Point Estimation','Confidence Intervals','Hypothesis Testing'],
  // modules whose content is finished; keep in step with BUILT in scripts/build.mjs
  built:[1,2,3,4,5],questions:{},labs:{}};
 const int=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
 const pick=a=>a[int(0,a.length-1)];
 const f=(v,d=4)=>Number(v.toFixed(d)).toString();
 const math=s=>`<span class="math">${s}</span>`;
 const steps=a=>`<ol>${a.map(s=>`<li>${s}</li>`).join('')}</ol>`;
 function num(prompt,answer,solution,ti,excel,mistakes=[],opts={}){const tolerance=opts.tolerance??Math.max(0.00006,Math.abs(answer)*.0005);
  // a diagnosed mistake that equals the right answer (e.g. mean = median) would mark a correct answer wrong: drop it
  mistakes=mistakes.filter(m=>!(Math.abs(m.value-answer)<=tolerance||(opts.alternates||[]).some(a=>Math.abs(m.value-a)<=tolerance)));return {prompt,answer,solution:steps(solution),ti,excel,mistakes,tolerance,...opts};}
 function choice(prompt,answer,others,solution,ti='No code is needed for this conceptual question.',excel='No code is needed for this conceptual question.'){
  const choices=[answer,...others.filter(v=>v!==answer)].sort(()=>Math.random()-.5);
  return {prompt,answer,choices,solution:steps(solution),ti,excel,mistakes:[],tolerance:0};
 }
 function skill(id,title,generate){return {id,title,generate};}
 const wrong=(value,message)=>({value,message});
 function normalQuestion(prompt,z,right=false,extra=[]){const exact=right?1-S.normalCDF(z):S.normalCDF(z),table=right?1-S.tableNormal(z):S.tableNormal(z);return num(prompt,table,[...extra,`Standardize: z = ${f(z,6)} ≈ ${f(S.round(z,2),2)}.`,`Use the left-area table: Φ(z) = ${S.tableNormal(z).toFixed(4)}.`,`${right?'Subtract from 1 for a right tail: ':''}Table answer = ${f(table)}; software = ${f(exact)}. The difference comes from rounding z and the table entry.`],`${right?'1 - ':''}pnorm(${f(z,6)})`,`from scipy.stats import norm; ${right?'norm.sf':'norm.cdf'}(${f(z,6)})`,[wrong(right?S.tableNormal(z):1-S.tableNormal(z),'The normal table gives left areas. Draw the requested tail before choosing a complement.')],{alternates:[exact],picture:{type:'normal',z,right}});}
 C.Q={int,pick,f,math,steps,num,choice,skill,wrong,normalQuestion};
})(globalThis);
