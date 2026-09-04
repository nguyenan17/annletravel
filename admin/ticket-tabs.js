document.addEventListener('DOMContentLoaded',()=>{
 const tabs=[...document.querySelectorAll('.ticket-tab')];
 const panels=[...document.querySelectorAll('.ticket-panel')];
 const activate=name=>{
  tabs.forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
  panels.forEach(p=>p.classList.toggle('active',p.dataset.panel===name));
 };
 tabs.forEach(t=>t.addEventListener('click',()=>activate(t.dataset.tab)));
 activate((location.hash||'#brands').slice(1)||'brands');
});
