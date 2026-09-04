// ANNLETRAVEL - DESTINATION ADMIN CRUD
let adminDestinations = [];
let editingDestinationId = null;

(function injectDestinationAdminStyles() {
    const style = document.createElement("style");
    style.textContent = `.destination-admin-section{margin-top:30px}.destination-admin-section small{color:#66727d}.checkbox-label{display:flex;align-items:center;gap:8px;min-height:44px}.checkbox-label input{width:18px;height:18px}#destinationModal .modal-box{max-width:720px}#destinationModal textarea{width:100%;box-sizing:border-box;resize:vertical}`;
    document.head.appendChild(style);
})();

function destinationAdminEscape(value){return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}

async function loadAdminDestinations(){
    const {data,error}=await supabaseClient.from("destinations").select("*").order("sort_order",{ascending:true}).order("name",{ascending:true});
    if(error){console.error("Load destinations error:",error);alert("Không thể tải danh sách điểm đến.\n\n"+error.message);return;}
    adminDestinations=data||[];renderAdminDestinations();
}

function renderAdminDestinations(){
    const body=document.getElementById("destinationTableBody");if(!body)return;
    if(!adminDestinations.length){body.innerHTML=`<tr><td colspan="6">Chưa có điểm đến nào.</td></tr>`;return;}
    body.innerHTML=adminDestinations.map(item=>`<tr><td><strong>${destinationAdminEscape(item.name)}</strong><br><small>${destinationAdminEscape(item.slug)}</small></td><td>${destinationAdminEscape(item.country)}</td><td>${item.region==="international"?"🌏 Nước ngoài":"🇻🇳 Trong nước"}</td><td>${item.featured?"✓":"-"}</td><td>${Number(item.sort_order||0)}</td><td><div class="action-buttons"><button type="button" class="refresh-button" onclick="editDestination('${destinationAdminEscape(item.id)}')">Sửa</button><button type="button" class="booking-delete-button" onclick="removeDestination('${destinationAdminEscape(item.id)}')">Xóa</button></div></td></tr>`).join("");
}

function openDestinationModal(destination=null){
    const modal=document.getElementById("destinationModal");if(!modal)return;
    editingDestinationId=destination?.id||null;
    document.getElementById("destinationModalTitle").textContent=destination?"Sửa điểm đến":"Thêm điểm đến";
    document.getElementById("destinationId").value=destination?.id||"";
    document.getElementById("destinationName").value=destination?.name||"";
    document.getElementById("destinationSlug").value=destination?.slug||"";
    document.getElementById("destinationCountry").value=destination?.country||"Việt Nam";
    document.getElementById("destinationRegion").value=destination?.region||"domestic";
    document.getElementById("destinationImage").value=destination?.image||"";
    document.getElementById("destinationDescription").value=destination?.description||"";
    document.getElementById("destinationSortOrder").value=destination?.sort_order??100;
    document.getElementById("destinationFeatured").checked=!!destination?.featured;
    modal.classList.remove("hidden");
}
function closeDestinationModal(){document.getElementById("destinationModal")?.classList.add("hidden");editingDestinationId=null;}
window.editDestination=function(id){const destination=adminDestinations.find(item=>String(item.id)===String(id));if(destination)openDestinationModal(destination);};
window.removeDestination=async function(id){const destination=adminDestinations.find(item=>String(item.id)===String(id));if(!destination||!confirm(`Bạn có chắc muốn xóa điểm đến "${destination.name}"?`))return;const {error}=await supabaseClient.from("destinations").delete().eq("id",id);if(error){console.error("Delete destination error:",error);alert("Không thể xóa điểm đến.\n\n"+error.message);return;}alert("Xóa điểm đến thành công!");await loadAdminDestinations();};
function createDestinationId(slug){return slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"")||`destination-${Date.now()}`;}
function autoSlug(value){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}
async function saveDestination(event){
    event.preventDefault();
    const name=document.getElementById("destinationName").value.trim();
    const slug=document.getElementById("destinationSlug").value.trim()||autoSlug(name);
    const country=document.getElementById("destinationCountry").value.trim();
    const region=document.getElementById("destinationRegion").value;
    const image=document.getElementById("destinationImage").value.trim();
    const description=document.getElementById("destinationDescription").value.trim();
    const sortOrder=Number(document.getElementById("destinationSortOrder").value||100);
    const featured=document.getElementById("destinationFeatured").checked;
    if(!name||!slug||!country){alert("Vui lòng nhập tên, slug và quốc gia.");return;}
    const wasEditing=!!editingDestinationId;
    const payload={name,slug,country,region,image,description,sort_order:sortOrder,featured,updated_at:new Date().toISOString()};
    let query;
    if(wasEditing)query=supabaseClient.from("destinations").update(payload).eq("id",editingDestinationId);
    else{payload.id=createDestinationId(slug);query=supabaseClient.from("destinations").insert(payload);}
    const {error}=await query;
    if(error){console.error("Save destination error:",error);alert("Không thể lưu điểm đến.\n\n"+error.message);return;}
    closeDestinationModal();alert(wasEditing?"Cập nhật điểm đến thành công!":"Thêm điểm đến thành công!");await loadAdminDestinations();
}

(function initDestinationAdmin(){
    const form=document.getElementById("destinationForm"),addButton=document.getElementById("addDestinationButton"),closeButton=document.getElementById("closeDestinationModalButton"),cancelButton=document.getElementById("cancelDestinationButton"),nameInput=document.getElementById("destinationName"),slugInput=document.getElementById("destinationSlug");
    form?.addEventListener("submit",saveDestination);addButton?.addEventListener("click",()=>openDestinationModal());closeButton?.addEventListener("click",closeDestinationModal);cancelButton?.addEventListener("click",closeDestinationModal);nameInput?.addEventListener("blur",()=>{if(!slugInput.value.trim())slugInput.value=autoSlug(nameInput.value);});
    if(document.getElementById("destinationAdminSection"))loadAdminDestinations();
})();
