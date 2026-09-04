/* Unified ticket management for admin/index.html */
(function () {
  if (!document.getElementById('dashboardPage')) return;

  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebar) {
    const old = sidebar.querySelector('a[href="tickets.html"]');
    if (old) {
      old.href = '#tickets';
      old.dataset.section = 'tickets';
      old.classList.remove('active');
    }
  }

  const container = document.querySelector('.dashboard-container');
  if (!container || document.getElementById('adminSectionTickets')) return;

  container.insertAdjacentHTML('beforeend', `
    <section id="adminSectionTickets" class="admin-content-section hidden">
      <div class="ticket-admin-shell">
        <div class="ticket-admin-hero">
          <div><div class="ticket-admin-kicker">Ticket Management</div><h1>Quản lý vé</h1><p>Thương hiệu → Địa điểm → Sản phẩm vé</p></div>
        </div>
        <div class="ticket-tabs" role="tablist">
          <button class="ticket-tab active" data-tab="brands" type="button">🏷️ Thương hiệu</button>
          <button class="ticket-tab" data-tab="locations" type="button">📍 Địa điểm</button>
          <button class="ticket-tab" data-tab="products" type="button">🎟️ Sản phẩm vé</button>
        </div>
        <section class="ticket-panel active" data-panel="brands"><div class="tour-section">
          <div class="section-header"><div><h2>Thương hiệu</h2><p class="section-description">Sun World, VinWonders và các thương hiệu khác.</p></div><button id="addBrand" class="primary-button" type="button">+ Thêm thương hiệu</button></div>
          <div class="table-wrapper"><table><thead><tr><th>Tên</th><th>Slug</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="brandBody"></tbody></table></div>
        </div></section>
        <section class="ticket-panel" data-panel="locations"><div class="tour-section">
          <div class="section-header"><div><h2>Địa điểm</h2><p class="section-description">Mỗi thương hiệu có thể có nhiều công viên / điểm vui chơi.</p></div><button id="addLocation" class="primary-button" type="button">+ Thêm địa điểm</button></div>
          <div class="table-wrapper"><table><thead><tr><th>Địa điểm</th><th>Thương hiệu</th><th>Thành phố / tỉnh</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="locationBody"></tbody></table></div>
        </div></section>
        <section class="ticket-panel" data-panel="products"><div class="tour-section">
          <div class="section-header"><div><h2>Sản phẩm vé</h2><p class="section-description">Ví dụ: Sun World → Ba Na Hills → Vé cáp treo.</p></div><button id="addTicketButton" class="primary-button" type="button">+ Thêm sản phẩm vé</button></div>
          <div class="table-wrapper"><table><thead><tr><th>Sản phẩm</th><th>Thương hiệu</th><th>Địa điểm</th><th>Loại vé</th><th>Giá từ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="ticketAdminTableBody"></tbody></table></div>
        </div></section>
      </div>
    </section>

    <div id="structureModal" class="modal hidden"><div class="modal-box">
      <div class="modal-header"><h2 id="structureTitle">Thêm</h2><button id="closeStructure" class="close-button" type="button">×</button></div>
      <form id="structureForm"><input id="structureId" type="hidden"><input id="structureKind" type="hidden">
        <div class="form-group"><label>Tên</label><input id="structureName" required></div>
        <div class="form-group" id="brandSelectGroup"><label>Thương hiệu</label><select id="structureBrand"></select></div>
        <div class="form-group" id="destinationGroup"><label>Thành phố / tỉnh</label><input id="structureDestination" placeholder="Đà Nẵng"></div>
        <div class="form-group"><label>Slug</label><input id="structureSlug" required></div>
        <div class="form-group"><label>Mô tả</label><textarea id="structureDescription" rows="4"></textarea></div>
        <div class="form-group"><label>Ảnh / Logo URL</label><input id="structureImage" type="url"></div>
        <div class="form-row"><div class="form-group"><label>Thứ tự</label><input id="structureSort" type="number" min="0" value="100"></div><label class="checkbox-label"><input id="structureActive" type="checkbox" checked> Đang hiển thị</label></div>
        <div class="modal-actions"><button type="button" id="cancelStructure" class="cancel-button">Hủy</button><button class="primary-button" type="submit">Lưu</button></div>
      </form>
    </div></div>

    <div id="ticketModal" class="modal hidden"><div class="modal-box">
      <div class="modal-header"><h2 id="ticketModalTitle">Thêm sản phẩm vé</h2><button id="closeTicketModalButton" class="close-button" type="button">×</button></div>
      <form id="ticketAdminForm"><input id="ticketId" type="hidden">
        <div class="form-group"><label>Thương hiệu</label><select id="ticketAdminBrand" required></select></div>
        <div class="form-group"><label>Địa điểm cụ thể</label><select id="ticketAdminLocation" required></select></div>
        <div class="form-group"><label>Tên sản phẩm vé</label><input id="ticketName" required placeholder="Ví dụ: Vé cáp treo Ba Na Hills"></div>
        <div class="form-group"><label>Slug</label><input id="ticketSlug" required></div>
        <div class="form-group"><label>Loại vé</label><select id="ticketType"><option value="ENTRY">Vé vào cổng</option><option value="CABLE_CAR">Vé cáp treo</option><option value="COMBO">Vé combo</option><option value="SHOW">Show & biểu diễn</option><option value="EXPERIENCE">Trải nghiệm</option></select></div>
        <div class="form-group"><label>Mô tả ngắn</label><input id="ticketShort"></div>
        <div class="form-group"><label>Mô tả chi tiết</label><textarea id="ticketDescription" rows="4"></textarea></div>
        <div class="form-group"><label>Ảnh URL</label><input id="ticketImage" type="url"></div>
        <div class="form-row"><div class="form-group"><label>Giá từ</label><input id="ticketPrice" type="number" min="0" step="1000" value="0"></div><div class="form-group"><label>Thứ tự</label><input id="ticketSort" type="number" min="0" value="100"></div></div>
        <div class="form-row"><label class="checkbox-label"><input id="ticketFeatured" type="checkbox"> Nổi bật</label><label class="checkbox-label"><input id="ticketActive" type="checkbox" checked> Đang hiển thị</label></div>
        <div class="modal-actions"><button type="button" id="cancelTicketButton" class="cancel-button">Hủy</button><button type="submit" class="primary-button">Lưu sản phẩm</button></div>
      </form>
    </div></div>
  `);

  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });

  const activate = (name) => {
    const target = document.getElementById('adminSectionTickets');
    if (!target) return;
    document.querySelectorAll('.admin-content-section').forEach(s => s.classList.toggle('hidden', s !== target));
    document.querySelectorAll('.admin-nav-link').forEach(a => a.classList.toggle('active', a.dataset.section === 'tickets'));
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = () => {
    if ((location.hash || '').replace('#','') === 'tickets') activate('tickets');
  };

  sidebar?.querySelector('a[data-section="tickets"]')?.addEventListener('click', e => {
    e.preventDefault();
    history.replaceState(null, '', '#tickets');
    activate('tickets');
  });
  window.addEventListener('hashchange', navigate);

  Promise.all([loadScript('ticket-structure.js'), loadScript('ticket-management.js')])
    .then(() => {
      if (typeof loadTicketStructure === 'function') loadTicketStructure();
      document.querySelectorAll('.ticket-tab').forEach(tab => tab.addEventListener('click', () => {
        document.querySelectorAll('.ticket-tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.ticket-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
      }));
      if (typeof loadAdminTickets === 'function') loadAdminTickets();
      navigate();
    })
    .catch(err => console.error('Ticket module load error:', err));
})();
