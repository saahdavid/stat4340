"""Compare the shipped JavaScript core and every displayed table cell with SciPy."""
import json, subprocess, os
from pathlib import Path
from scipy.stats import norm, t, binom

root=Path(__file__).resolve().parent.parent
node=os.environ.get('STAT4340_NODE','node')
script=r'''
const s=require('./assets/js/stats.js');
const z=Array.from({length:699},(_,i)=>(i-349)/100);
const tc=s.dfs.flatMap(df=>s.tails.map(a=>[df,a,s.tInv(1-a,df)]));
const td=s.dfs.flatMap(df=>[-10,-3.204,-1,0,1,2.7,10].map(x=>[df,x,s.tCDF(x,df)]));
const bn=[1,4,10,30,100,300].flatMap(n=>[.01,.11,.5,.75,.99].flatMap(p=>Array.from({length:n+1},(_,k)=>[n,p,k,s.binomPMF(k,n,p),s.binomCDF(k,n,p)])));
console.log(JSON.stringify({normal:z.map(x=>[x,s.normalCDF(x),s.tableNormal(x)]),inverse:[.0001,.01,.05,.2,.5,.9,.95,.975,.9999,...s.tails.map(a=>1-a)].map(p=>[p,s.normalInv(p)]),tc,td,bn}));
'''
data=json.loads(subprocess.check_output([node,'-e',script],cwd=root,text=True))
errors={name:0 for name in ['normal','normal inverse','t inverse','t CDF','binomial PMF','binomial CDF']}
for z,value,entry in data['normal']:
    expected=float(norm.cdf(z));errors['normal']=max(errors['normal'],abs(value-expected))
    assert entry==round(expected,4),(z,entry,expected)
for p,value in data['inverse']:errors['normal inverse']=max(errors['normal inverse'],abs(value-float(norm.ppf(p))))
for df,a,value in data['tc']:
    expected=float(t.ppf(1-a,df));errors['t inverse']=max(errors['t inverse'],abs(value-expected))
    assert round(value,3)==round(expected,3),(df,a,value,expected)
for df,x,value in data['td']:errors['t CDF']=max(errors['t CDF'],abs(value-float(t.cdf(x,df))))
for n,p,k,pmf,cdf in data['bn']:
    errors['binomial PMF']=max(errors['binomial PMF'],abs(pmf-float(binom.pmf(k,n,p))))
    errors['binomial CDF']=max(errors['binomial CDF'],abs(cdf-float(binom.cdf(k,n,p))))
for name,error in errors.items():assert error<2e-7,(name,error)
print('PASS: all 699 distinct normal table entries, all 432 t-table cells, and',len(data['bn']),'binomial cases match SciPy.')
for name,error in errors.items():print(f'  {name}: max absolute error {error:.3g}')
