/* Site search, the glossary page, and the "/" shortcut. */
(function(){
  const C=window.Course||{},E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const titles=C.titles||[];
  const fold=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[−–—]/g,'-').replace(/\s+/g,' ');
  const SYN={se:'standard error',sd:'standard deviation',ci:'confidence interval',moe:'margin of error',iqr:'interquartile',clt:'central limit',srs:'simple random',df:'degrees of freedom',h0:'null hypothesis',ha:'alternative hypothesis',ts:'test statistic',pvalue:'p-value',phat:'sample proportion',xbar:'sample mean',sigma:'standard deviation',mu:'mean',alpha:'significance level',beta:'type ii'};

  // "/" focuses search from anywhere (except while typing).
  document.addEventListener('keydown',e=>{
    if(e.key!=='/'||e.metaKey||e.ctrlKey||e.altKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
    const q=document.getElementById('search-q');e.preventDefault();if(q)q.focus();else location.href='search.html';
  });

  function docs(){
    const out=[];
    for(const d of window.SEARCH_INDEX||[])out.push({kind:'notes',title:d.t,url:d.u,group:d.g,text:d.x});
    for(const [term,m,id,def] of window.GLOSSARY||[])out.push({kind:'term',title:term,url:`glossary.html#${slug(term)}`,group:`Glossary · Module ${m}`,text:def});
    const Q=C.questions||{};for(const m of Object.keys(Q))for(const s of Q[m]||[])out.push({kind:'skill',title:s.title,url:`practice.html?module=${m}&skill=${encodeURIComponent(s.id)}`,group:`Practice · Module ${m}`,text:`Practice skill: ${s.title}`});
    return out.map(d=>Object.assign(d,{ft:fold(d.title),fx:fold(d.text)}));
  }
  function slug(s){return 'g-'+fold(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  function terms(q){let f=fold(q).trim();if(!f)return [];const words=f.split(/[^a-z0-9.*²₀ₐ-]+/).filter(Boolean);return words.map(w=>{const k=w.replace(/[^a-z0-9]/g,''),alt=[w];if(SYN[k])alt.push(SYN[k]);return alt.map(a=>a.length<=3?{w:a,re:new RegExp('(^|[^a-z0-9])'+a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![a-z0-9])','g')}:{w:a});});}
  const count=(s,a)=>a.re?(s.match(a.re)||[]).length:s.split(a.w).length-1;
  function score(d,ws,phrase){let s=0;
    if(phrase.length>2&&d.ft.includes(phrase))s+=30;if(phrase.length>2&&d.fx.includes(phrase))s+=8;
    for(const alts of ws){let best=0;for(const a of alts){const nT=count(d.ft,a),nX=count(d.fx,a);if(nT||nX)best=Math.max(best,(nT?10:0)+Math.min(nX,6));}if(!best)return 0;s+=best;}
    return s+(d.kind==='term'?4:d.kind==='notes'?2:0);}
  function snippet(d,ws){const x=d.text,fx=d.fx;let at=-1;ws=ws.flat().map(a=>a.w);for(const w of ws){const i=fx.indexOf(w);if(i>=0&&(at<0||i<at))at=i;}
    let start=Math.max(0,at-70);if(start){const sp=x.indexOf(' ',start);if(sp>=0&&sp<at)start=sp+1;}const seg=(start?'… ':'')+x.slice(start,start+220)+(x.length>start+220?' …':'');
    let h=E(seg);for(const w of [...ws].sort((a,b)=>b.length-a.length)){if(w.length<3)continue;const re=new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');h=h.replace(re,'<mark>$1</mark>');}return h;}

  const qEl=document.getElementById('search-q');
  if(qEl){const all=docs(),list=document.getElementById('search-results'),count=document.getElementById('search-count');
    const run=()=>{const q=qEl.value,ws=terms(q),phrase=fold(q).trim();
      try{history.replaceState(null,'',q?`?q=${encodeURIComponent(q)}`:location.pathname);}catch(e){}
      if(!ws.length){list.innerHTML='';count.textContent='';return;}
      const hits=all.map(d=>({d,s:score(d,ws,phrase)})).filter(h=>h.s>0).sort((a,b)=>b.s-a.s).slice(0,25);
      count.textContent=hits.length?`${hits.length===25?'Top 25':hits.length} result${hits.length===1?'':'s'}`:'No results. Try a shorter word, or check the glossary.';
      list.innerHTML=hits.map(({d})=>`<li class="search-hit"><a href="${d.url}">${E(d.title)}</a><span class="search-where">${E(d.group)}</span><p>${snippet(d,ws)}</p></li>`).join('');};
    let tm;qEl.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(run,120);});
    const q0=new URLSearchParams(location.search).get('q');if(q0){qEl.value=q0;run();}
    qEl.focus();
  }

  const gl=document.getElementById('glossary');
  if(gl&&window.GLOSSARY){
    const items=window.GLOSSARY.slice().sort((a,b)=>fold(a[0]).localeCompare(fold(b[0])));
    const filter=document.getElementById('gloss-filter'),mods=document.getElementById('gloss-mods');let mod=0;
    mods.innerHTML=`<a href="#" data-gm="0" class="active">All modules</a>`+titles.map((t,i)=>`<a href="#" data-gm="${i+1}" title="${E(t)}">Module ${i+1}</a>`).join('');
    const draw=()=>{const f=fold(filter.value).trim();
      const shown=items.filter(([t,m,,d])=>(!mod||m===mod)&&(!f||fold(t).includes(f)||fold(d).includes(f)));
      gl.innerHTML=shown.length?shown.map(([t,m,id,d])=>`<div class="gloss-entry" id="${slug(t)}"><dt>${E(t)}</dt><dd>${E(d)} <a class="small" href="module-${m}.html#${id}">Module ${m} notes</a></dd></div>`).join(''):'<p class="muted">No terms match. Try the <a href="search.html">full search</a>.</p>';
      if(C.renderMath)C.renderMath(gl);};
    filter.addEventListener('input',draw);
    mods.addEventListener('click',e=>{const a=e.target.closest('[data-gm]');if(!a)return;e.preventDefault();mod=Number(a.dataset.gm);mods.querySelectorAll('a').forEach(x=>x.classList.toggle('active',x===a));draw();});
    draw();
    if(location.hash){const t=document.getElementById(location.hash.slice(1));if(t){t.classList.add('gloss-target');t.scrollIntoView();}}
  }
})();
