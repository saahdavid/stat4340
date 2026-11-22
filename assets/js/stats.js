/* Numerical core. No dependencies. Browser + Node; tested against SciPy. */
(function(root){
  'use strict';
  const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  function logGamma(z){
    const c=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-0.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];
    if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
    z--;let x=.99999999999980993; c.forEach((v,i)=>x+=v/(z+i+1));const t=z+7.5;
    return .9189385332046727+(z+.5)*Math.log(t)-t+Math.log(x);
  }
  function gammaQ(a,x){
    if(x===0)return 1;
    const scale=Math.exp(a*Math.log(x)-x-logGamma(a));
    if(x<a+1){let sum=1/a,d=sum;for(let k=1;k<500;k++){d*=x/(a+k);sum+=d;if(Math.abs(d)<Math.abs(sum)*1e-15)break;}return clamp(1-sum*scale);}
    let b=x+1-a,c=1e300,d=1/b,h=d;
    for(let i=1;i<500;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const delta=d*c;h*=delta;if(Math.abs(delta-1)<1e-15)break;}return clamp(scale*h);
  }
  function normalCDF(z){if(z===Infinity)return 1;if(z===-Infinity)return 0;if(!Number.isFinite(z))return NaN;const q=.5*gammaQ(.5,z*z/2);return z<0?q:1-q;}
  const normalPDF=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);
  function normalInv(p){if(p===0)return -Infinity;if(p===1)return Infinity;if(!(p>0&&p<1))return NaN;let a=-39,b=39;for(let i=0;i<100;i++){const m=(a+b)/2;if(normalCDF(m)<p)a=m;else b=m;}return(a+b)/2;}
  function betaFraction(a,b,x){let c=1,d=1-(a+b)*x/(a+1);if(Math.abs(d)<1e-300)d=1e-300;d=1/d;let h=d;for(let m=1;m<500;m++){let aa=m*(b-m)*x/((a+2*m-1)*(a+2*m));d=1+aa*d;if(Math.abs(d)<1e-300)d=1e-300;c=1+aa/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;h*=d*c;aa=-(a+m)*(a+b+m)*x/((a+2*m)*(a+2*m+1));d=1+aa*d;if(Math.abs(d)<1e-300)d=1e-300;c=1+aa/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const delta=d*c;h*=delta;if(Math.abs(delta-1)<2e-15)break;}return h;}
  function betaI(x,a,b){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log1p(-x));return x<(a+1)/(a+b+2)?bt*betaFraction(a,b,x)/a:1-bt*betaFraction(b,a,1-x)/b;}
  function tCDF(t,df){if(!(df>0))return NaN;if(!Number.isFinite(t))return t<0?0:t>0?1:NaN;const p=.5*betaI(df/(df+t*t),df/2,.5);return t<0?p:1-p;}
  function tInv(p,df){if(!(df>0)||p<0||p>1)return NaN;if(p===0)return -Infinity;if(p===1)return Infinity;if(p<.5)return -tInv(1-p,df);let a=0,b=1;while(tCDF(b,df)<p&&b<1e15)b*=2;for(let i=0;i<100;i++){const m=(a+b)/2;if(tCDF(m,df)<p)a=m;else b=m;}return(a+b)/2;}
  function choose(n,k){if(k<0||k>n)return 0;k=Math.min(k,n-k);let r=1;for(let i=1;i<=k;i++)r*= (n-k+i)/i;return r;}
  function binomPMF(k,n,p){if(!Number.isInteger(n)||n<0||p<0||p>1)return NaN;if(!Number.isInteger(k)||k<0||k>n)return 0;if(p===0)return k===0?1:0;if(p===1)return k===n?1:0;return Math.exp(logGamma(n+1)-logGamma(k+1)-logGamma(n-k+1)+k*Math.log(p)+(n-k)*Math.log1p(-p));}
  function binomCDF(k,n,p){if(k<0)return 0;if(k>=n)return 1;if(p===0)return 1;if(p===1)return 0;return betaI(1-p,n-Math.floor(k),Math.floor(k)+1);}
  const round=(x,n=4)=>Number(x.toFixed(n));
  const tableNormal=z=>z < -3.49?0:z>3.49?1:round(normalCDF(round(z,2)),4);
  function tableInverse(p){if(!(p>0&&p<1))return NaN;let best=Infinity,zs=[];for(let i=-349;i<=349;i++){const d=Math.abs(tableNormal(i/100)-p);if(d<best-1e-10){best=d;zs=[i/100];}else if(Math.abs(d-best)<1e-10)zs.push(i/100);}return round(zs.reduce((a,b)=>a+b,0)/zs.length,3);}
  // STAT 4340 t table: exact df = n − 1 for every row 1–40 (t procedures are used only when n ≤ 40),
  // plus the z row (∞) for large samples. Upper-tail areas as in engineering texts.
  const dfs=Array.from({length:40},(_,i)=>i+1);
  const tails=[.10,.05,.025,.01,.005,.001,.0005];
  const tableDF=df=>df>=1?(df<=40?Math.floor(df):Infinity):NaN;
  const tq=(p,row)=>row===Infinity?normalInv(p):tInv(p,row);
  const tCritical=(df,confidence=.95)=>round(tq((1+confidence)/2,tableDF(df)),3);
  // Chi-squared: regularized lower incomplete gamma P(a, x), CDF, inverse, and the table.
  function gammaP(a,x){if(x<=0)return 0;const gl=logGamma(a);if(x<a+1){let sum=1/a,del=sum,ap=a;for(let i=0;i<500;i++){ap++;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*1e-15)break;}return sum*Math.exp(-x+a*Math.log(x)-gl);}
   let b=x+1-a,c=1/1e-300,d=1/b,h=d;for(let i=1;i<500;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-15)break;}return 1-Math.exp(-x+a*Math.log(x)-gl)*h;}
  const chiCDF=(x,df)=>gammaP(df/2,x/2);
  function chiInv(p,df){if(!(p>0&&p<1))return NaN;let a=0,b=Math.max(10,df*4);while(chiCDF(b,df)<p)b*=2;for(let i=0;i<200;i++){const m=(a+b)/2;if(chiCDF(m,df)<p)a=m;else b=m;}return (a+b)/2;}
  const chiDfs=[...Array.from({length:40},(_,i)=>i+1),50,60,70,80,90,100];
  const chiTails=[.995,.99,.975,.95,.90,.10,.05,.025,.01,.005];
  // chi-squared critical value with right-tail area alpha (course notation: chi^2_{alpha, df})
  const chiCritical=(alpha,df)=>round(chiInv(1-alpha,df),3);
  function tBracket(t,df,twoSided=false){
    const row=tableDF(df),v=Math.abs(t),factor=twoSided?2:1;
    if(v===0)return {lower:.5*factor,upper:.5*factor,df:row};
    let lower=0,upper=.5;
    for(const a of tails){const critical=round(tq(1-a,row),3);if(Math.abs(v-critical)<1e-10)return {lower:a*factor,upper:a*factor,df:row};if(v>critical){upper=a;}else{lower=a;break;}}
    return {lower:lower*factor,upper:upper*factor,df:row};
  }
  const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
  const sd=(a,sample=true)=>Math.sqrt(a.reduce((s,v)=>s+(v-mean(a))**2,0)/(a.length-(sample?1:0)));
  const median=a=>{const s=[...a].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};
  function summary(a){const s=[...a].sort((a,b)=>a-b),m=Math.floor(s.length/2);return [s[0],median(s.slice(0,m)),median(s),median(s.slice(Math.ceil(s.length/2))),s.at(-1)];}
  function regression(points){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),mx=mean(xs),my=mean(ys),sx=sd(xs),sy=sd(ys);const cross=points.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0),xx=xs.reduce((s,x)=>s+(x-mx)**2,0),slope=xx?cross/xx:0;return {mx,my,sx,sy,slope,intercept:my-slope*mx,r:sx&&sy?cross/((xs.length-1)*sx*sy):0,sse:points.reduce((s,p)=>s+(p[1]-my-slope*(p[0]-mx))**2,0)};}
  // Recursive descent arithmetic parser. Never evaluates JavaScript or accesses globals.
  function parse(input){
    const s=String(input).replace(/\s/g,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');if(!s||s.length>200)throw Error('Enter a number or arithmetic expression.');let i=0,depth=0;
    function atom(){if(++depth>30)throw Error('Expression too deeply nested.');let v;if(s.slice(i,i+5)==='sqrt('){i+=5;v=Math.sqrt(expr());if(s[i++]!==')')throw Error('Close the square root with ).');}else if(s[i]==='('){i++;v=expr();if(s[i++]!==')')throw Error('Close parentheses with ).');}else{const m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);if(!m)throw Error('Use numbers, +, −, *, /, ^, sqrt(), or %.');v=Number(m[0]);i+=m[0].length;}while(s[i]==='%'){v/=100;i++;}depth--;return v;}
    function power(){let v=atom();if(s[i]==='^'){i++;v**=unary();}return v;}
    function unary(){if(s[i]==='+'){i++;return unary();}if(s[i]==='-'){i++;return -unary();}return power();}
    function term(){let v=unary();while(s[i]==='*'||s[i]==='/'){const op=s[i++],w=unary();v=op==='*'?v*w:v/w;}return v;}
    function expr(){let v=term();while(s[i]==='+'||s[i]==='-'){const op=s[i++],w=term();v=op==='+'?v+w:v-w;}return v;}
    const v=expr();if(i!==s.length||!Number.isFinite(v))throw Error('Enter a finite number using valid arithmetic.');return v;
  }
  const api={clamp,logGamma,normalCDF,normalPDF,normalInv,tCDF,tInv,choose,binomPMF,binomCDF,round,tableNormal,tableInverse,dfs,tails,tableDF,tq,tCritical,tBracket,gammaP,chiCDF,chiInv,chiDfs,chiTails,chiCritical,mean,sd,median,summary,regression,parse,zStars:{80:1.282,90:1.645,95:1.960,99:2.576}};
  root.Stats=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
