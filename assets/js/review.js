(function(){
  const sheets=[...document.querySelectorAll('.sheet')];if(!sheets.length)return;
  const tabs=[...document.querySelectorAll('[data-sheet]')];let all=false;
  function show(){const m=(location.hash.match(/^#m([1-8])$/)||[])[1]||'1';
    sheets.forEach(s=>s.hidden=!all&&s.dataset.m!==m);
    tabs.forEach(t=>{const on=t.dataset.sheet===m&&!all;t.setAttribute('aria-selected',String(on));t.classList.toggle('active',on);});
    document.getElementById('sheet-all').textContent=all?'Show one module':'Show all eight';
    document.getElementById('sheet-print').textContent=all?'Print all eight':'Print this sheet';}
  window.addEventListener('hashchange',()=>{all=false;show();});
  document.getElementById('sheet-all').onclick=()=>{all=!all;show();};
  document.getElementById('sheet-print').onclick=()=>window.print();
  show();
})();
