let leads = [], services = [], selectedLeadId = null;
const $ = id => document.getElementById(id);
const tableName = 'business_leads';
const statusText = {new:'Mới', contacted:'Đã liên hệ', quoted:'Đã báo giá', won:'Đã chốt', lost:'Không chốt'};

async function checkAdmin(){
 const {data:{session}}=await supabaseClient.auth.getSession();
 if(!session){location.href='index.html';return false;}
 const {data}=await supabaseClient.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
 if(!data){await supabaseClient.auth.signOut();location.href='index.html';return false;} return true;
}
async function loadData(){
 const [l,s]=await Promise.all([
  supabaseClient.from(tableName).select('*').order('created_at',{ascending:false}),
  supabaseClient.from('business_services').select('*').order('sort_order',{ascending:true})
 ]);
 if(l.error) throw l.error; if(s.error) throw s.error; leads=l.data||[]; services=s.data||[]; renderLeads(); renderStats(); renderServices();
}
function renderStats(){ $('countAll').textContent=leads.length; ['new','contacted','quoted','won'].forEach(x=>{ $('count'+x.charAt(0).toUpperCase()+x.slice(1)).textContent=leads.filter(l=>l.status===x).length; }); }
function renderLeads(){
 const q=($('leadSearch').value||'').toLowerCase().trim(), st=$('statusFilter').value;
 const list=leads.filter(x=>(!st||x.status===st)&&(!q||`${x.company_name} ${x.contact_name} ${x.phone} ${x.email||''}`.toLowerCase().includes(q)));
 $('leadsTable').innerHTML=list.map(x=>`<tr><td><strong>${esc(x.company_name)}</strong><div class="biz-detail">${esc(x.contact_name)} · ${x.employee_count||'—'} người</div></td><td>${esc(x.service_interest||'—')}</td><td>${esc(x.departure||'—')} → ${esc(x.destination||'—')}<div class="biz-detail">${fmtDate(x.departure_date)}${x.return_date?' → '+fmtDate(x.return_date):''}</div></td><td><a href="tel:${esc(x.phone)}">${esc(x.phone)}</a><div class="biz-detail">${esc(x.email||'')}</div></td><td><span class="biz-status status-${x.status}">${statusText[x.status]||x.status}</span></td><td><div class="biz-actions"><button class="edit-button" onclick="openLead('${x.id}')">Chi tiết</button></div></td></tr>`).join('')||'<tr><td colspan="6" class="biz-empty">Không có yêu cầu phù hợp.</td></tr>';
}
function renderServices(){
 $('servicesGrid').innerHTML=services.map(x=>`<article class="biz-service"><div style="font-size:27px">${esc(x.icon||'✦')}</div><h3>${esc(x.title)}</h3><p>${esc(x.short_description||x.description||'')}</p><div class="biz-detail">${x.visible?'Đang hiển thị':'Đang ẩn'} · Thứ tự ${x.sort_order}</div><div class="biz-service-actions"><button class="edit-button" onclick="editService('${x.id}')">Sửa</button><button class="delete-button" onclick="deleteService('${x.id}')">Xóa</button></div></article>`).join('')||'<div class="biz-empty">Chưa có dịch vụ.</div>';
}
window.openLead=id=>{const x=leads.find(v=>v.id===id);if(!x)return;selectedLeadId=id;$('leadStatus').value=x.status;$('leadDetail').innerHTML=`<p><strong>${esc(x.company_name)}</strong> — ${esc(x.contact_name)}</p><p>📞 ${esc(x.phone)}${x.email?' · ✉️ '+esc(x.email):''}</p><p>👥 ${x.employee_count||'Chưa rõ'} người · ${esc(x.service_interest||'Chưa chọn dịch vụ')}</p><p>📍 ${esc(x.departure||'Chưa rõ')} → ${esc(x.destination||'Chưa rõ')}</p><p>📅 ${fmtDate(x.departure_date)}${x.return_date?' → '+fmtDate(x.return_date):''}</p><p>💰 ${esc(x.budget||'Chưa xác định')}</p><p style="margin-top:12px"><strong>Yêu cầu:</strong><br>${esc(x.message||'Không có')}</p>`;$('leadModal').classList.remove('hidden');};
$('saveLead').onclick=async()=>{if(!selectedLeadId)return;const {error}=await supabaseClient.from(tableName).update({status:$('leadStatus').value,updated_at:new Date().toISOString()}).eq('id',selectedLeadId);if(error)return alert(error.message);$('leadModal').classList.add('hidden');await loadData();};
window.editService=id=>{const x=services.find(v=>v.id===id);if(!x)return;$('serviceId').value=x.id;$('serviceTitle').value=x.title||'';$('serviceIcon').value=x.icon||'';$('serviceShort').value=x.short_description||'';$('serviceDescription').value=x.description||'';$('serviceOrder').value=x.sort_order||0;$('serviceVisible').checked=x.visible;$('serviceModalTitle').textContent='Chỉnh sửa dịch vụ';$('serviceModal').classList.remove('hidden');};
window.deleteService=async id=>{if(!confirm('Xóa dịch vụ này?'))return;const {error}=await supabaseClient.from('business_services').delete().eq('id',id);if(error)return alert(error.message);await loadData();};
$('serviceForm').onsubmit=async e=>{e.preventDefault();const payload={title:$('serviceTitle').value.trim(),icon:$('serviceIcon').value.trim(),short_description:$('serviceShort').value.trim(),description:$('serviceDescription').value.trim(),sort_order:+$('serviceOrder').value||0,visible:$('serviceVisible').checked,updated_at:new Date().toISOString()};const id=$('serviceId').value;const q=id?supabaseClient.from('business_services').update(payload).eq('id',id):supabaseClient.from('business_services').insert(payload);const {error}=await q;if(error)return alert(error.message);$('serviceModal').classList.add('hidden');await loadData();};
$('addService').onclick=()=>{$('serviceForm').reset();$('serviceId').value='';$('serviceOrder').value=0;$('serviceVisible').checked=true;$('serviceModalTitle').textContent='Thêm dịch vụ';$('serviceModal').classList.remove('hidden');};
$('closeLead').onclick=()=>$('leadModal').classList.add('hidden');$('closeService').onclick=()=>$('serviceModal').classList.add('hidden');$('leadSearch').oninput=renderLeads;$('statusFilter').onchange=renderLeads;$('logoutButton').onclick=async()=>{await supabaseClient.auth.signOut();location.href='index.html';};
function fmtDate(v){if(!v)return '—';const d=new Date(v+'T00:00:00');return d.toLocaleDateString('vi-VN');} function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
(async()=>{try{if(await checkAdmin())await loadData();}catch(e){console.error(e);alert('Không thể tải dữ liệu: '+e.message);}})();
