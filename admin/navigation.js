document.addEventListener('DOMContentLoaded',()=>{
 const links=[...document.querySelectorAll('.admin-nav-link[data-section]')];
 const sections=[...document.querySelectorAll('.admin-content-section')];
 if(!links.length||!sections.length)return;
 const show=name=>{
  const target=document.getElementById('adminSection'+name.charAt(0).toUpperCase()+name.slice(1));
  if(!target)return;
  sections.forEach(s=>s.classList.toggle('hidden',s!==target));
  links.forEach(l=>l.classList.toggle('active',l.dataset.section===name));
  if(location.hash!==`#${name}`)history.replaceState(null,'',`#${name}`);
 };
 links.forEach(link=>link.addEventListener('click',e=>{e.preventDefault();show(link.dataset.section)}));
 const initial=(location.hash||'#dashboard').slice(1);
 show(links.some(l=>l.dataset.section===initial)?initial:'dashboard');
});
