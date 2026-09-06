let currentType = '';
let records = { awards: [], reviews: [], gallery: [] };
const $ = id => document.getElementById(id);

async function isAdmin() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { location.href = 'index.html'; return false; }
    const { data } = await supabaseClient.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle();
    if (!data) { await supabaseClient.auth.signOut(); location.href = 'index.html'; return false; }
    return true;
}

async function uploadImage(file, folder = 'about') {
    if (!file) return '';
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseClient.storage.from('tour-images').upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw new Error('Upload ảnh thất bại: ' + error.message + '. Nếu bucket ảnh tour của bạn có tên khác, hãy dùng URL ảnh.');
    const { data } = supabaseClient.storage.from('tour-images').getPublicUrl(path);
    return data.publicUrl;
}

async function loadCompany() {
    const { data, error } = await supabaseClient.from('about_company').select('*').eq('id', 1).maybeSingle();
    if (error) throw error;
    const c = data || {};
    $('heroTitle').value = c.hero_title || '';
    $('heroSubtitle').value = c.hero_subtitle || '';
    $('heroImage').value = c.hero_image || '';
    $('introduction').value = c.introduction || '';
    $('vision').value = c.vision || '';
    $('mission').value = c.mission || '';
    $('values').value = c.values || '';
    const s = c.stats || {};
    $('statYears').value = s.years || 0; $('statCustomers').value = s.customers || 0; $('statTours').value = s.tours || 0; $('statDestinations').value = s.destinations || 0;
}

async function loadAll() {
    const [a, r, g] = await Promise.all([
        supabaseClient.from('about_awards').select('*').order('sort_order', { ascending: true }),
        supabaseClient.from('about_reviews').select('*').order('sort_order', { ascending: true }),
        supabaseClient.from('about_gallery').select('*').order('sort_order', { ascending: true })
    ]);
    if (a.error || r.error || g.error) throw (a.error || r.error || g.error);
    records = { awards: a.data || [], reviews: r.data || [], gallery: g.data || [] };
    renderAwards(); renderReviews(); renderGallery();
}

function renderAwards() { $('awardsTable').innerHTML = records.awards.map(x => `<tr><td>${x.image ? `<img class="thumb" src="${esc(x.image)}">` : '-'}</td><td><strong>${esc(x.title)}</strong><br>${esc(x.organization)}<br><small>${esc(x.description)}</small></td><td>${esc(x.year)}</td><td>${x.visible ? 'Có' : 'Ẩn'}</td><td><div class="actions"><button class="edit-button" onclick="editItem('awards','${x.id}')">Sửa</button><button class="delete-button" onclick="deleteItem('awards','${x.id}')">Xóa</button></div></td></tr>`).join('') || '<tr><td colspan="5">Chưa có dữ liệu.</td></tr>'; }
function renderReviews() { $('reviewsTable').innerHTML = records.reviews.map(x => `<tr><td><strong>${esc(x.customer_name)}</strong><br>${esc(x.customer_title)}</td><td>${esc(x.content)}</td><td>${'★'.repeat(x.rating)}${'☆'.repeat(5-x.rating)}</td><td>${x.visible ? 'Có' : 'Ẩn'}</td><td><div class="actions"><button class="edit-button" onclick="editItem('reviews','${x.id}')">Sửa</button><button class="delete-button" onclick="deleteItem('reviews','${x.id}')">Xóa</button></div></td></tr>`).join('') || '<tr><td colspan="5">Chưa có dữ liệu.</td></tr>'; }
function renderGallery() { $('galleryTable').innerHTML = records.gallery.map(x => `<tr><td><img class="thumb" src="${esc(x.image)}"></td><td>${esc(x.title)}</td><td>${x.sort_order}</td><td>${x.visible ? 'Có' : 'Ẩn'}</td><td><div class="actions"><button class="edit-button" onclick="editItem('gallery','${x.id}')">Sửa</button><button class="delete-button" onclick="deleteItem('gallery','${x.id}')">Xóa</button></div></td></tr>`).join('') || '<tr><td colspan="5">Chưa có dữ liệu.</td></tr>'; }

function openModal(type, item = null) {
    currentType = type; $('itemId').value = item?.id || ''; $('itemForm').reset(); $('awardFields').classList.toggle('hidden', type !== 'awards'); $('reviewFields').classList.toggle('hidden', type !== 'reviews'); $('galleryFields').classList.toggle('hidden', type !== 'gallery'); $('modalTitle').textContent = item ? 'Chỉnh sửa' : 'Thêm mới';
    if (item) {
        if (type === 'awards') { $('awardTitle').value=item.title; $('awardOrg').value=item.organization; $('awardYear').value=item.year; $('awardDescription').value=item.description; $('awardImage').value=item.image; $('awardOrder').value=item.sort_order; $('awardVisible').checked=item.visible; }
        if (type === 'reviews') { $('reviewName').value=item.customer_name; $('reviewTitle').value=item.customer_title; $('reviewContent').value=item.content; $('reviewRating').value=item.rating; $('reviewAvatar').value=item.avatar; $('reviewOrder').value=item.sort_order; $('reviewVisible').checked=item.visible; }
        if (type === 'gallery') { $('galleryTitle').value=item.title; $('galleryImage').value=item.image; $('galleryOrder').value=item.sort_order; $('galleryVisible').checked=item.visible; }
    }
    $('itemModal').classList.remove('hidden');
}
window.editItem = (type,id) => openModal(type, records[type].find(x=>x.id===id));
window.deleteItem = async (type,id) => { if (!confirm('Bạn chắc chắn muốn xóa?')) return; const {error}=await supabaseClient.from(type==='awards'?'about_awards':type==='reviews'?'about_reviews':'about_gallery').delete().eq('id',id); if(error) return alert(error.message); await loadAll(); };

$('companyForm').addEventListener('submit', async e => { e.preventDefault(); try { let hero = $('heroImage').value.trim(); if ($('heroFile').files[0]) hero = await uploadImage($('heroFile').files[0], 'about/hero'); const payload={id:1,hero_title:$('heroTitle').value.trim(),hero_subtitle:$('heroSubtitle').value.trim(),hero_image:hero,introduction:$('introduction').value.trim(),vision:$('vision').value.trim(),mission:$('mission').value.trim(),values:$('values').value.trim(),stats:{years:+$('statYears').value||0,customers:+$('statCustomers').value||0,tours:+$('statTours').value||0,destinations:+$('statDestinations').value||0},updated_at:new Date().toISOString()}; const {error}=await supabaseClient.from('about_company').upsert(payload); if(error) throw error; alert('Đã lưu thông tin công ty.'); } catch(e){alert(e.message);} });

$('itemForm').addEventListener('submit', async e => { e.preventDefault(); try { let table = currentType==='awards'?'about_awards':currentType==='reviews'?'about_reviews':'about_gallery'; let payload={}; if(currentType==='awards'){let image=$('awardImage').value.trim(); if($('awardFile').files[0]) image=await uploadImage($('awardFile').files[0],'about/awards'); payload={title:$('awardTitle').value.trim(),organization:$('awardOrg').value.trim(),year:$('awardYear').value.trim(),description:$('awardDescription').value.trim(),image,sort_order:+$('awardOrder').value||0,visible:$('awardVisible').checked};} if(currentType==='reviews') payload={customer_name:$('reviewName').value.trim(),customer_title:$('reviewTitle').value.trim(),content:$('reviewContent').value.trim(),rating:+$('reviewRating').value,avatar:$('reviewAvatar').value.trim(),sort_order:+$('reviewOrder').value||0,visible:$('reviewVisible').checked}; if(currentType==='gallery'){let image=$('galleryImage').value.trim(); if($('galleryFile').files[0]) image=await uploadImage($('galleryFile').files[0],'about/gallery'); if(!image) throw new Error('Vui lòng chọn ảnh hoặc nhập URL ảnh.'); payload={title:$('galleryTitle').value.trim(),image,sort_order:+$('galleryOrder').value||0,visible:$('galleryVisible').checked};} const id=$('itemId').value; const q=id?supabaseClient.from(table).update(payload).eq('id',id):supabaseClient.from(table).insert(payload); const {error}=await q; if(error) throw error; $('itemModal').classList.add('hidden'); await loadAll(); } catch(e){alert(e.message);} });

document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');['company','awards','reviews','gallery'].forEach(x=>$('tab-'+x).classList.toggle('hidden',btn.dataset.tab!==x));}));
$('addAward').onclick=()=>openModal('awards'); $('addReview').onclick=()=>openModal('reviews'); $('addGallery').onclick=()=>openModal('gallery'); $('closeModal').onclick=()=> $('itemModal').classList.add('hidden'); $('cancelModal').onclick=()=> $('itemModal').classList.add('hidden'); $('logoutButton').onclick=async()=>{await supabaseClient.auth.signOut();location.href='index.html';};
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
(async()=>{try{if(await isAdmin()){await loadCompany();await loadAll();}}catch(e){console.error(e);alert('Không thể tải dữ liệu: '+e.message);}})();
