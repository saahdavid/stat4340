/* Module 1 lab: Resistant or not? A step-by-step lab (nothing moves until the student presses Next step).
   Seven three-toed sloth speeds (meters per minute). Steps build the mean, median, s, and IQR,
   then replace the largest speed with an outlier and compare which summaries move. */
(function(){const {F,text,line,circle,axis,scale}=Course.Lab,S=Object.assign({sorted:a=>[...a].sort((x,y)=>x-y),sum:a=>a.reduce((x,y)=>x+y,0)},Stats);
 const LO=0,HI=12,X=v=>scale(v,LO,HI),SNAP=v=>Math.round(S.clamp(v,LO,HI)*10)/10;
 const data=l=>l.step>=4?l.data.out:l.data.values;
 const sum=a=>{const q=S.summary(a);return {mean:S.mean(a),med:q[2],q1:q[1],q3:q[3],iqr:q[3]-q[1],s:S.sd(a)};};
 Course.labs.resistance={module:1,title:'Resistant or not?',
  description:'Seven three-toed sloths are timed, and each speed is recorded in meters per minute. Step through the mean, median, standard deviation, and IQR. Then one speed becomes an outlier. You can drag any dot (or focus it and use the arrow keys) at any step.',
  params:[],
  setup(l){l.data.values=[2.8,3.4,3.7,4.0,4.3,4.6,5.1];l.data.out=[2.8,3.4,3.7,4.0,4.3,4.6,10.8];},
  steps(l){const a=sum(l.data.values),b=sum(l.data.out),big=Math.max(...l.data.values),bigOut=Math.max(...l.data.out);return [
   {title:'1. The data',text:`Each dot is one sloth's speed. In order: ${S.sorted(l.data.values).map(v=>F(v,1)).join(', ')} m/min (n = 7).`},
   {title:'2. The mean: the balance point',text:`Add the speeds and divide by n: x̄ = ${F(S.sum(l.data.values),2)}/7 = ${F(a.mean,3)} m/min. The dashed red line is where the dots would balance.`},
   {title:'3. The median: the middle value',text:`n = 7 is odd, so the median is the (7+1)/2 = 4th ordered value: x̃ = ${F(a.med,2)} m/min (solid blue line).`},
   {title:'4. Spread: s and the IQR',text:`s = ${F(a.s,3)} m/min uses every deviation from x̄. The box runs from Q1 = ${F(a.q1,2)} to Q3 = ${F(a.q3,2)}, so IQR = ${F(a.iqr,2)} m/min.`},
   {title:'5. One speed becomes an outlier',text:`The largest speed, ${F(big,1)}, is now recorded as ${F(bigOut,1)} m/min (for example, a typo). Watch the lines and the box. Drag the right-most dot further if you like.`},
   {title:'6. Which summaries moved?',text:`Mean: ${F(a.mean,3)} → ${F(b.mean,3)}. s: ${F(a.s,3)} → ${F(b.s,3)}. Median: ${F(a.med,2)} → ${F(b.med,2)}. IQR: ${F(a.iqr,2)} → ${F(b.iqr,2)}. The median and IQR are <strong>resistant</strong>; the mean and s are not. That is why skewed data or data with outliers are summarized with x̃ and the IQR.`}];},
  drag(l,i,x){const a=data(l);a[i]=SNAP(LO+(x-50)/600*(HI-LO));},
  key(l,i,k){const a=data(l);a[i]=SNAP(a[i]+(['ArrowRight','ArrowUp'].includes(k)?.1:-.1));},
  draw(l){const a=data(l),q=sum(a),st=l.step;let out=text(50,26,st>=4?'Data with one outlier':'The seven sloth speeds');
   out+=a.map((v,i)=>circle(X(v),62+i*18,7,st>=4&&v===Math.max(...a)?'red':'blue',`data-point="${i}" tabindex="0" role="slider" aria-label="Sloth ${i+1} speed" aria-valuemin="${LO}" aria-valuemax="${HI}" aria-valuenow="${v}"`)+text(668,66+i*18,F(v,1))).join('');
   if(st>=1)out+=line(X(q.mean),44,X(q.mean),206,'miss','stroke-dasharray="5 4"')+text(X(q.mean)+4,214,`x̄ = ${F(q.mean,2)}`,'fill="var(--red)"');
   if(st>=2)out+=line(X(q.med),44,X(q.med),206,'capture')+text(X(q.med)-4,48,`x̃ = ${F(q.med,2)}`,'text-anchor="end" fill="var(--blue)"');
   if(st>=3)out+=`<rect x="${X(q.q1)}" y="228" width="${X(q.q3)-X(q.q1)}" height="30" fill="var(--blue-light)" stroke="var(--blue)"/>`+line(X(q.med),228,X(q.med),258,'capture')+text(X(q.q1),222,'Q1','text-anchor="middle"')+text(X(q.q3),222,'Q3','text-anchor="middle"');
   return out+axis(LO,HI,285,'Speed (meters per minute)');},
  metrics(l){const a=sum(data(l)),st=l.step;const m=[];if(st>=1)m.push(['Mean x̄',F(a.mean,3)]);if(st>=2)m.push(['Median x̃',F(a.med,2)]);if(st>=3)m.push(['s',F(a.s,3)],['IQR',F(a.iqr,2)]);return m;},
  theory(){const m=t=>`<span class="math">${t}</span>`;return `<strong>By hand:</strong> ${m('\\bar x=\\frac{1}{n}\\sum x_i')}; ${m('s=\\sqrt{\\frac{1}{n-1}\\sum (x_i-\\bar x)^2}')}. Sort for the median and the quartiles (the halves leave out the median when n is odd). An extreme value pulls ${m('\\bar x')} and ${m('s')} toward it; ${m('\\tilde x')} and the IQR depend only on the middle of the ordered data.`;}
 };
})();
