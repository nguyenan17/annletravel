/* ANNLETRAVEL - TIME-LIMITED TOUR CAMPAIGNS */
(function () {
  "use strict";
  const CAMPAIGNS = [{id:"september-booking",type:"promotion",title:"Ưu đãi đặt tour tháng 9",label:"ƯU ĐÃI CÓ HẠN",description:"Đăng ký sớm để nhận chính sách ưu đãi cho một số hành trình đang mở bán.",startAt:"2026-09-19T00:00:00+07:00",endAt:"2026-09-30T23:59:59+07:00",tourIds:["phuket-4n3d","sapa-3n2d"]}];
  const SEASONAL = {
    spring:{title:"Du xuân",label:"MÙA XUÂN",description:"Hành trình đầu năm, lễ hội, văn hóa và những chuyến đi khởi đầu một năm mới.",months:[1,2,3],icon:"🌸"},
    summer:{title:"Mùa biển & nghỉ dưỡng",label:"MÙA HÈ",description:"Biển xanh, nghỉ dưỡng và những chuyến đi dành cho gia đình, bạn bè.",months:[4,5,6,7,8],icon:"☀️"},
    autumn:{title:"Mùa thu & trải nghiệm",label:"MÙA THU",description:"Không khí se lạnh, mùa lúa chín, lá vàng và những cung đường đầy cảm hứng.",months:[9,10,11],icon:"🍁"},
    winter:{title:"Mùa hoa & tuyết",label:"MÙA ĐÔNG",description:"Săn tuyết, ngắm hoa và chuẩn bị cho những hành trình cuối năm – đầu năm.",months:[12],icon:"❄️"}
  };
  const EXPERIENCES=[
    {title:"Khám phá bản địa",description:"Đi sâu hơn vào văn hóa, ẩm thực và đời sống địa phương.",icon:"🌿",href:"tours.html"},
    {title:"Biển & nghỉ dưỡng",description:"Tạm rời nhịp sống bận rộn và tận hưởng những ngày thật chậm.",icon:"🏝️",href:"tours.html?destination=Thái%20Lan"},
    {title:"Núi rừng & khám phá",description:"Những cung đường dành cho người thích thiên nhiên và trải nghiệm.",icon:"🥾",href:"tours.html?destination=Sapa"}
  ];
  function esc(v){return String(v==null?"":v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c];});}
  function date(v){var d=new Date(v);return isNaN(d.getTime())?null:d;}
  function active(){var now=new Date();return CAMPAIGNS.filter(function(c){var s=date(c.startAt),e=date(c.endAt);return s&&e&&now>=s&&now<=e;});}
  function price(v){return Number(v||0).toLocaleString('vi-VN')+'đ';}
  function renderPromotions(data){
    var host=document.getElementById('limitedPromotionTours'); if(!host)return;
    var items=active().flatMap(function(c){return c.tourIds.map(function(id){return {campaign:c,tour:data.find(function(t){return String(t.id)===String(id);})};}).filter(function(x){return x.tour;});});
    if(!items.length){var section=host.closest('.campaign-section');if(section)section.remove();return;}
    host.innerHTML=items.slice(0,3).map(function(x){return '<article class="campaign-tour-card"><a class="campaign-tour-image" href="tour-detail.html?id='+encodeURIComponent(x.tour.id)+'" style="background-image:url(\''+esc(x.tour.image||'')+'\')"><span class="campaign-badge">🔥 '+esc(x.campaign.label)+'</span></a><div class="campaign-tour-body"><p class="campaign-tour-destination">'+esc(x.tour.destination)+'</p><h3>'+esc(x.tour.name)+'</h3><p>'+esc(x.tour.short)+'</p><div class="campaign-tour-bottom"><strong>'+price(x.tour.price)+'</strong><a href="tour-detail.html?id='+encodeURIComponent(x.tour.id)+'">Xem tour →</a></div></div></article>';}).join('');
    var c=items[0].campaign, t=document.getElementById('promotionCampaignTitle'), d=document.getElementById('promotionCampaignDescription');
    if(t)t.textContent=c.title;if(d)d.textContent=c.description;
    document.querySelectorAll('[data-countdown-end]').forEach(function(n){n.dataset.countdownEnd=c.endAt;});
  }
  function updateCountdowns(){document.querySelectorAll('[data-countdown-end]').forEach(function(n){var end=date(n.dataset.countdownEnd);if(!end)return;var diff=Math.max(0,end.getTime()-Date.now()),s=Math.floor(diff/1000),days=Math.floor(s/86400),hours=Math.floor(s%86400/3600),mins=Math.floor(s%3600/60),secs=s%60;if(!diff){n.textContent='Ưu đãi đã kết thúc';return;}n.innerHTML='<span><b>'+String(days).padStart(2,'0')+'</b><small>Ngày</small></span><i>:</i><span><b>'+String(hours).padStart(2,'0')+'</b><small>Giờ</small></span><i>:</i><span><b>'+String(mins).padStart(2,'0')+'</b><small>Phút</small></span><i>:</i><span><b>'+String(secs).padStart(2,'0')+'</b><small>Giây</small></span>';});}
  function season(){var m=new Date().getMonth()+1;return Object.keys(SEASONAL).find(function(k){return SEASONAL[k].months.includes(m);})||'spring';}
  function renderSeasonal(){var host=document.getElementById('seasonalCampaigns');if(!host)return;var keys=Object.keys(SEASONAL),cur=season(),start=keys.indexOf(cur),sel=[0,1,2].map(function(i){return keys[(start+i)%keys.length];});host.innerHTML=sel.map(function(k,i){var s=SEASONAL[k];return '<a class="season-campaign-card '+(i===0?'current':'')+'" href="tours.html?season='+k+'"><span class="season-campaign-icon">'+s.icon+'</span><span class="season-campaign-label">'+s.label+'</span><h3>'+s.title+'</h3><p>'+s.description+'</p><span class="season-campaign-link">Khám phá hành trình →</span></a>';}).join('');}
  function renderExperiences(){var host=document.getElementById('experienceTours');if(!host)return;host.innerHTML=EXPERIENCES.map(function(x){return '<a class="experience-card" href="'+x.href+'"><span class="experience-icon">'+x.icon+'</span><div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p><span>Xem hành trình →</span></div></a>';}).join('');}
  async function init(){if(typeof window.loadTours!=='function')return;var data=await window.loadTours();renderPromotions(data);renderSeasonal();renderExperiences();updateCountdowns();if(window.__annleCampaignTimer)clearInterval(window.__annleCampaignTimer);window.__annleCampaignTimer=setInterval(updateCountdowns,1000);}
  window.AnnLeCampaigns={campaigns:CAMPAIGNS,seasonal:SEASONAL};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();