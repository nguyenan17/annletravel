/* ANNLETRAVEL - TIME-LIMITED TOUR CAMPAIGNS */
(function () {
  "use strict";
  const CAMPAIGNS = [];
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
  function active(){var now=new Date();return arguments.length?[]:[];}
    function campaignItems(data){return data.filter(function(t){var s=date(t.campaign_start_at),e=date(t.campaign_end_at);return t.campaign_enabled && t.campaign_type==='promotion' && s && e && nowInRange(nowDate(),s,e);});}
    function nowDate(){return new Date();}
    function nowInRange(n,s,e){return n>=s&&n<=e;}
    function renderPromotions(data){
        var host=document.getElementById('limitedPromotionTours'); if(!host)return;
        var items=data.filter(function(t){var s=date(t.campaign_start_at),e=date(t.campaign_end_at);return t.campaign_enabled&&t.campaign_type==='promotion'&&s&&e&&new Date()>=s&&new Date()<=e;});
        if(!items.length){var section=host.closest('.campaign-section');if(section)section.remove();return;}
        host.innerHTML=items.slice(0,3).map(function(t){return '<article class="campaign-tour-card"><a class="campaign-tour-image" href="tour-detail.html?id='+encodeURIComponent(t.id)+'" style="background-image:url(\\''+esc(t.image||'')+'\\')"><span class="campaign-badge">🔥 ƯU ĐÃI CÓ HẠN</span></a><div class="campaign-tour-body"><p class="campaign-tour-destination">'+esc(t.destination)+'</p><h3>'+esc(t.name)+'</h3><p>'+esc(t.short)+'</p><div class="campaign-tour-bottom"><strong>'+(t.sale_price?price(t.sale_price):price(t.price))+'</strong><a href="tour-detail.html?id='+encodeURIComponent(t.id)+'">Xem tour →</a></div></div></article>';}).join('');
        var t=items[0],title=document.getElementById('promotionCampaignTitle'),desc=document.getElementById('promotionCampaignDescription');
        if(title)title.textContent='Ưu đãi đang diễn ra';if(desc)desc.textContent='Ưu đãi có thời hạn cho những hành trình đang mở bán.';
        document.querySelectorAll('[data-countdown-end]').forEach(function(n){n.dataset.countdownEnd=t.campaign_end_at;});
    }

    function updateCountdowns(){document.querySelectorAll('[data-countdown-end]').forEach(function(n){var end=date(n.dataset.countdownEnd);if(!end)return;var diff=Math.max(0,end.getTime()-Date.now()),s=Math.floor(diff/1000),days=Math.floor(s/86400),hours=Math.floor(s%86400/3600),mins=Math.floor(s%3600/60),secs=s%60;if(!diff){n.textContent='Ưu đãi đã kết thúc';return;}n.innerHTML='<span><b>'+String(days).padStart(2,'0')+'</b><small>Ngày</small></span><i>:</i><span><b>'+String(hours).padStart(2,'0')+'</b><small>Giờ</small></span><i>:</i><span><b>'+String(mins).padStart(2,'0')+'</b><small>Phút</small></span><i>:</i><span><b>'+String(secs).padStart(2,'0')+'</b><small>Giây</small></span>';});}
  function season(){var m=new Date().getMonth()+1;return Object.keys(SEASONAL).find(function(k){return SEASONAL[k].months.includes(m);})||'spring';}
  function renderSeasonal(){var host=document.getElementById('seasonalCampaigns');if(!host)return;var keys=Object.keys(SEASONAL),cur=season(),start=keys.indexOf(cur),sel=[0,1,2].map(function(i){return keys[(start+i)%keys.length];});host.innerHTML=sel.map(function(k,i){var s=SEASONAL[k];return '<a class="season-campaign-card '+(i===0?'current':'')+'" href="tours.html?season='+k+'"><span class="season-campaign-icon">'+s.icon+'</span><span class="season-campaign-label">'+s.label+'</span><h3>'+s.title+'</h3><p>'+s.description+'</p><span class="season-campaign-link">Khám phá hành trình →</span></a>';}).join('');}
  function renderExperiences(){var host=document.getElementById('experienceTours');if(!host)return;var items=window.__annleCampaignTours||[];host.innerHTML=items.filter(function(t){return t.experience_enabled;}).slice(0,3).map(function(t){return '<a class="experience-card" href="tour-detail.html?id='+encodeURIComponent(t.id)+'"><span class="experience-icon">🌿</span><div><h3>'+esc(t.name)+'</h3><p>'+esc(t.short)+'</p><span>Xem hành trình →</span></div></a>';}).join('');}(function(x){return '<a class="experience-card" href="'+x.href+'"><span class="experience-icon">'+x.icon+'</span><div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p><span>Xem hành trình →</span></div></a>';}).join('');}
  async function init(){if(typeof window.loadTours!=='function')return;var data=await window.loadTours();window.__annleCampaignTours=data;renderPromotions(data);renderSeasonal();renderExperiences();updateCountdowns();if(window.__annleCampaignTimer)clearInterval(window.__annleCampaignTimer);window.__annleCampaignTimer=setInterval(updateCountdowns,1000);}
  window.AnnLeCampaigns={campaigns:CAMPAIGNS,seasonal:SEASONAL};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();