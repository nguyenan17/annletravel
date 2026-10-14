const el=id=>document.getElementById(id);
let hotels=[],tourRows=[],options=[];
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const slugify=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const money=v=>new Intl.NumberFormat('vi-VN').format(Number(v)||0)+'đ';
function msg(s,bad){el('notice').textContent=s;el('notice').style.color=bad?'#b42318':'#087a50';window.scrollTo({top:0,behavior:'smooth'});}
el('name').addEventListener('input',()=>{if(!el('hotelId').value)el('slug').value=slugify(el('name').value);});
el('resetHotelButton').addEventListener('click',resetHotel);el('optionReset').addEventListener('click',resetOption);el('refreshHotelsButton')?.addEventListener('click',loadAll);
function resetHotel(){el('hotelForm').reset();el('hotelId').value='';el('sort').value='0';el('active').checked=true;el('formTitle').textContent='Thêm khách sạn';}
function resetOption(){el('optionForm').reset();el('optionId').value='';el('packagePrice').value='';el('nights').value='1';el('optionActive').checked=true;}
async function loadAll(){try{const r=await Promise.all([supabaseClient.from('hotels').select('*').order('sort_order').order('name'),supabaseClient.from('tours').select('id,name,destination,price').order('name'),supabaseClient.from('tour_hotel_options').select('*').order('sort_order')]);const bad=r.find(x=>x.error);if(bad)throw bad.error;hotels=r[0].data||[];tourRows=r[1].data||[];options=r[2].data||[];renderHotels();fillOptions();renderOptionList();}catch(e){msg('Không tải được dữ liệu. Hãy chạy migration Supabase trước: '+e.message,true);}}
function renderHotels(){el('hotelList').innerHTML=hotels.length?hotels.map(h=>'<article class="hotel-card-admin">'+(h.cover_image?'<img src="'+esc(h.cover_image)+'" alt="">':'')+'<h3>'+esc(h.name)+'</h3><p>'+esc(h.destination||'')+' · '+(h.star_rating?'★'.repeat(h.star_rating):'Chưa xếp hạng')+'</p><p>'+(h.active?'Đang hiển thị':'Đang ẩn')+' · '+(h.breakfast_included?'Có buffet sáng':'Không có buffet sáng')+'</p><p>'+esc(h.short_description||'')+'</p><button type="button" onclick="editHotel(\''+h.id+'\')">Sửa</button><button type="button" onclick="toggleHotel(\''+h.id+'\')">'+(h.active?'Ẩn':'Hiện')+'</button></article>').join(''):'<p>Chưa có khách sạn nào.</p>';}
window.editHotel=id=>{const h=hotels.find(x=>x.id===id);if(!h)return;el('hotelId').value=h.id;el('name').value=h.name||'';el('slug').value=h.slug||'';el('destination').value=h.destination||'';el('address').value=h.address||'';el('stars').value=String(h.star_rating||0);el('phone').value=h.phone||'';el('image').value=h.cover_image||'';el('gallery').value=(h.gallery_images||[]).join('\n');el('short').value=h.short_description||'';el('description').value=h.description||'';el('amenities').value=(h.amenities||[]).join('\n');el('breakfast').checked=!!h.breakfast_included;el('breakfastDesc').value=h.breakfast_description||'';el('website').value=h.website||'';el('sort').value=h.sort_order||0;el('active').checked=!!h.active;el('featured').checked=!!h.featured;el('formTitle').textContent='Sửa khách sạn';el('hotelForm').scrollIntoView({behavior:'smooth'});};
window.toggleHotel=async id=>{const h=hotels.find(x=>x.id===id);if(!h)return;const {error}=await supabaseClient.from('hotels').update({active:!h.active,updated_at:new Date().toISOString()}).eq('id',id);if(error){msg(error.message,true);return;}msg(h.active?'Đã ẩn khách sạn.':'Đã hiển thị khách sạn.');await loadAll();};
el('hotelForm').addEventListener('submit',async e=>{e.preventDefault();const payload={name:el('name').value.trim(),slug:slugify(el('slug').value||el('name').value),destination:el('destination').value.trim(),address:el('address').value.trim(),star_rating:Number(el('stars').value),phone:el('phone').value.trim(),cover_image:el('image').value.trim(),gallery_images:el('gallery').value.split(/\r?\n/).map(x=>x.trim()).filter(x=>/^https:\/\//i.test(x)),short_description:el('short').value.trim(),description:el('description').value.trim(),amenities:el('amenities').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),breakfast_included:el('breakfast').checked,breakfast_description:el('breakfastDesc').value.trim(),website:el('website').value.trim(),sort_order:Number(el('sort').value)||0,active:el('active').checked,featured:el('featured').checked,updated_at:new Date().toISOString()};try{const id=el('hotelId').value;const r=id?await supabaseClient.from('hotels').update(payload).eq('id',id):await supabaseClient.from('hotels').insert(payload);if(r.error)throw r.error;msg(id?'Đã cập nhật khách sạn.':'Đã thêm khách sạn.');resetHotel();await loadAll();}catch(e){msg('Không lưu được: '+e.message,true);}});
function fillOptions(){const oldT=el('hotelTourId').value,oldH=el('hotelRef').value;el('hotelTourId').innerHTML='<option value="">Chọn tour</option>'+tourRows.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+' — '+esc(t.destination||'')+'</option>').join('');el('hotelRef').innerHTML='<option value="">Chọn khách sạn</option>'+hotels.map(h=>'<option value="'+h.id+'">'+esc(h.name)+'</option>').join('');el('hotelTourId').value=oldT;el('hotelRef').value=oldH;}
function renderOptionList(){
  const priceFor = o => {
    const tour = tourRows.find(x => String(x.id) === String(o.tour_id));
    return money(o.package_price_per_person ?? tour?.price ?? 0);
  };
  el('optionList').innerHTML = options.length ? options.map(o => {
    const tour = tourRows.find(x => String(x.id) === String(o.tour_id));
    const hotel = hotels.find(x => String(x.id) === String(o.hotel_id));
    const id = esc(o.id);
    return `<article class="option-card-admin">
      <h3>${esc(tour?.name || 'Tour')} · ${esc(hotel?.name || 'Khách sạn')}</h3>
      <p>${esc(o.label || 'Gói lưu trú')} · Đã gồm khách sạn</p>
      <p>Giá trọn gói: ${priceFor(o)}/người · đã gồm khách sạn · ${Number(o.nights) || 1} đêm</p>
      <p>${o.active ? 'Đang bán' : 'Đang ẩn'} · ${esc(o.note || '')}</p>
      <button type="button" data-edit-option="${id}">Sửa</button>
      <button type="button" data-delete-option="${id}">Xóa</button>
    </article>`;
  }).join('') : '<p>Chưa có lựa chọn khách sạn nào được gán vào tour.</p>';
  el('optionList').querySelectorAll('[data-edit-option]').forEach(button => {
    button.addEventListener('click', () => window.editOption(button.dataset.editOption));
  });
  el('optionList').querySelectorAll('[data-delete-option]').forEach(button => {
    button.addEventListener('click', () => window.deleteOption(button.dataset.deleteOption));
  });
}
window.editOption=id=>{const o=options.find(x=>x.id===id);if(!o)return;el('optionId').value=o.id;el('hotelTourId').value=o.tour_id;el('hotelRef').value=o.hotel_id;el('optionLabel').value=o.label||'';el('packagePrice').value=o.package_price_per_person??'';el('nights').value=o.nights||1;el('optionNote').value=o.note||'';el('optionActive').checked=!!o.active;el('optionForm').scrollIntoView({behavior:'smooth'});};
window.deleteOption=async id=>{if(!confirm('Xóa lựa chọn khách sạn khỏi tour?'))return;const {error}=await supabaseClient.from('tour_hotel_options').delete().eq('id',id);if(error){msg(error.message,true);return;}msg('Đã xóa lựa chọn giá.');await loadAll();};
el('optionForm').addEventListener('submit',async e=>{e.preventDefault();const payload={tour_id:el('hotelTourId').value,hotel_id:el('hotelRef').value,label:el('optionLabel').value.trim()||'Gói lưu trú',pricing_mode:'INCLUDED',package_price_per_person:Number(el('packagePrice').value),price_per_person:0,room_price_per_night:0,max_guests_per_room:2,nights:Number(el('nights').value)||1,note:el('optionNote').value.trim(),active:el('optionActive').checked,updated_at:new Date().toISOString()};try{const id=el('optionId').value;const r=id?await supabaseClient.from('tour_hotel_options').update(payload).eq('id',id):await supabaseClient.from('tour_hotel_options').insert(payload);if(r.error)throw r.error;msg(id?'Đã cập nhật lựa chọn.':'Đã gán khách sạn vào tour.');resetOption();await loadAll();}catch(e){msg('Không lưu được lựa chọn: '+e.message,true);}});
let hotelsLoaded = false;
window.initHotelManagement = async function(){
  if (hotelsLoaded) return;
  hotelsLoaded = true;
  await loadAll();
};