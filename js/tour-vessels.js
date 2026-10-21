(function(){
"use strict";
let loadingFor="",loadingNow=false;
window.selectedTourVesselPackage=null;
const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const money=v=>new Intl.NumberFormat("vi-VN").format(Number(v)||0)+" đ";
function renderOptions(){
 const container=document.getElementById("tourDetail");
 if(!container)return;
 const id=new URLSearchParams(location.search).get("id");
 if(!id||loadingNow||container.dataset.vesselOptionsTour===id||!container.querySelector(".detail-grid"))return;
 loadingNow=true;loadingFor=id;
 (async()=>{
  try{
   const {data,error}=await supabaseClient.from("tour_vessel_options").select("*, vessel_packages(*, vessels(*))").eq("tour_id",String(id)).eq("active",true).order("sort_order");
   if(error)throw error;
   const tour=(Array.isArray(tours)?tours:[]).find(t=>String(t.id)===String(id));
   if(!tour)return;
   const options=(data||[]).filter(o=>o.vessel_packages?.active&&o.vessel_packages?.vessels?.active);
   if(!options.length)return;
   const section=document.createElement("section");section.className="vessel-tour-options";section.id="tourVesselOptions";
   section.innerHTML='<div class="container"><div class="vessel-tour-heading"><div><p class="section-label">TÀU THUYỀN & COMBO</p><h2>Chọn tàu và gói dịch vụ</h2><p>Thông tin lấy từ danh mục tàu dùng chung. Giá cuối cùng sẽ được xác nhận theo ngày khởi hành và số khách.</p></div><a class="vessel-back" href="vessels.html">Xem danh mục tàu</a></div><div class="vessel-tour-grid">'+options.map(o=>{
    const p=o.vessel_packages,v=p.vessels,price=o.price_per_person==null?Number(p.price_from||0):Number(o.price_per_person),image=v.cover_image||(v.gallery_images||[])[0]||"";
    return '<button type="button" class="vessel-tour-card" data-vessel-option="'+esc(o.id)+'">'+(image?'<img loading="lazy" src="'+esc(image)+'" alt="'+esc(v.name)+'">':'<div class="vessel-tour-placeholder">🚢</div>')+'<span class="vessel-tour-card-body"><span class="vessel-tag">'+esc(({ticket:"Vé tàu",meal_combo:"Tàu + bữa ăn",overnight:"Ngủ đêm trên tàu",private_charter:"Thuê riêng",tour_combo:"Combo tour",other:"Gói dịch vụ"})[p.package_type]||"Gói tàu")+'</span><strong>'+esc(v.name)+'</strong><span class="vessel-tour-subtitle">'+esc(p.name)+'</span><span class="vessel-public-meta">'+esc(v.destination||"")+(p.duration?" · "+esc(p.duration):"")+(p.meal_plan?" · "+esc(p.meal_plan):"")+'</span><span class="vessel-tour-price">'+(price>0?money(price)+" / người":"Liên hệ báo giá")+'</span><span class="vessel-tour-note">'+esc(p.note||o.note||"")+'</span><span class="vessel-tour-choose">Chọn gói này</span></span></button>';
   }).join("")+'</div><div id="tourVesselSelectionSummary" class="vessel-tour-summary" aria-live="polite">Bạn chưa chọn gói tàu. Lựa chọn sẽ được ghi vào yêu cầu đăng ký để nhân viên xác nhận.</div></div>';
   container.appendChild(section);container.dataset.vesselOptionsTour=id;
   section.querySelectorAll("[data-vessel-option]").forEach(card=>card.addEventListener("click",()=>{
    const option=options.find(o=>String(o.id)===card.dataset.vesselOption);if(!option)return;
    const p=option.vessel_packages,v=p.vessels,price=option.price_per_person==null?Number(p.price_from||0):Number(option.price_per_person);
    window.selectedTourVesselPackage={id:option.id,packageId:p.id,vesselName:v.name,packageName:p.name,packageType:p.package_type,mealPlan:p.meal_plan||"",pricePerPerson:price,note:p.note||option.note||"",pricingMode:option.pricing_mode||"INCLUDED"};
    section.querySelectorAll(".vessel-tour-card").forEach(c=>{const chosen=c===card;c.classList.toggle("selected",chosen);c.setAttribute("aria-pressed",String(chosen));});
    const summary=section.querySelector("#tourVesselSelectionSummary");
    summary.innerHTML='<strong>Đã chọn: '+esc(v.name)+' — '+esc(p.name)+'</strong><span>'+esc(p.meal_plan||p.duration||"")+' · '+(price>0?money(price)+" / người":"Giá sẽ được tư vấn")+'</span><span>Thông tin gói sẽ được gửi cùng yêu cầu đăng ký tour.</span>';
   }));
  }catch(e){console.error("Load tour vessel options failed:",e);}
  finally{loadingNow=false;loadingFor="";}
 })();
}
const target=document.getElementById("tourDetail");if(target)new MutationObserver(renderOptions).observe(target,{childList:true,subtree:false});
document.addEventListener("DOMContentLoaded",renderOptions);setTimeout(renderOptions,900);
})();