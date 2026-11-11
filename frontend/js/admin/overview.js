(function () {
    'use strict';
    if (!window.AdminAuthenticated) return;
    let rendering = false;
    function render() {
        if (rendering) return;
        rendering = true;
        try { renderStats(); renderOverviewNotices(); }
        finally { rendering = false; }
    }
    function renderStats() {
        const admin = Shop.getCurrentAdmin();
        if (!admin || admin.is_locked || admin.is_deleted || admin.is_hidden) return;
        const box = document.getElementById('overview-stats');
        if (!box) return;
        const db = Shop.loadDB();
        const rows = key => (Array.isArray(db[key]) ? db[key] : []).filter(item => !item.is_deleted);
        const orders = rows('orders');
        const revenue = orders.filter(o => Shop.normalizeStatus(o.status) === 'delivered').reduce((sum, o) => {
            const amount = Number(o.total_amount);
            return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
        }, 0);
        const stats = [
            ['Doanh thu đơn đã giao', Shop.formatPrice(revenue), 'wallet', '#fff3ed', '#ff6600'],
            ['Tổng đơn hàng', orders.length.toLocaleString('vi-VN'), 'cart-shopping', '#e6f4ea', '#34a853'],
            ['Sản phẩm', rows('products').length.toLocaleString('vi-VN'), 'box', '#e8f0fe', '#1a73e8'],
            ['Khách hàng', rows('customers').length.toLocaleString('vi-VN'), 'users', '#fef7e0', '#b08000']
        ];
        box.innerHTML = '<div class="stats-grid">' + stats.map(s => '<div class="stat-card"><div class="stat-icon" style="background-color:' + s[3] + ';color:' + s[4] + '"><i class="fa-solid fa-' + s[2] + '"></i></div><div class="stat-info"><h3>' + s[0] + '</h3><p>' + Shop.escapeHtml(s[1]) + '</p></div></div>').join('') + '</div>';
    }
    const noticeGroups = [
        { type: 'orders', label: 'Đơn hàng', icon: 'fa-cart-shopping' },
        { type: 'stock', label: 'Tồn kho', icon: 'fa-boxes-stacked' },
        { type: 'customers', label: 'Khách hàng mới', icon: 'fa-user-plus' },
        { type: 'contact', label: 'Liên hệ', icon: 'fa-envelope' }
    ];
    let activeNoticeGroup = 'orders';
    const noticePager = window.AdminPagination.create({
        container: 'overview-notices-pagination',
        pageSize: 10,
        label: 'thông báo',
        onChange: renderOverviewNotices
    });
    const contactPager = window.AdminPagination.create({
        container: 'contact-messages-pagination',
        pageSize: 10,
        label: 'liên hệ',
        onChange: function () { renderContactMessages(); }
    });
    function renderOverviewNotices() {
        const list = document.getElementById('overview-notices-list');
        if (!list || !window.AdminNotices) return;
        const admin = Shop.getCurrentAdmin();
        if (!admin || admin.is_locked || admin.is_deleted || admin.is_hidden) {
            list.replaceChildren();
            noticePager.render(0);
            return;
        }
        const notices = AdminNotices.list();
        const unread = notices.filter(item => !item.isRead).length;
        const esc = value => Shop.escapeHtml(String(value ?? ''));
        document.getElementById('overview-notices-total').textContent = notices.length.toLocaleString('vi-VN');
        document.getElementById('overview-notices-summary').textContent = notices.length
            ? unread.toLocaleString('vi-VN') + ' chưa đọc · Chọn một mục để xem và xử lý.'
            : 'Không có thông báo cần theo dõi.';
        document.getElementById('overview-notices-counts').innerHTML = noticeGroups.map(group => {
            const count = notices.filter(item => item.type === group.type).length;
            const content = '<i class="fa-solid ' + group.icon + '" aria-hidden="true"></i><span>' + group.label +
                '</span><strong>' + count.toLocaleString('vi-VN') + '</strong>';
            return '<button type="button" role="tab" aria-selected="' + (activeNoticeGroup === group.type) +
                '" class="' + (activeNoticeGroup === group.type ? 'is-active' : '') +
                '" data-notice-group="' + group.type + '">' + content + '</button>';
        }).join('');
        list.innerHTML = noticeGroups.filter(group => group.type === activeNoticeGroup).map(group => {
            const items = notices.filter(item => item.type === group.type);
            const paged = noticePager.slice(items);
            noticePager.render(paged.total);
            if (!items.length) return '<p class="overview-notices-empty">Chưa có thông báo ' + group.label.toLowerCase() + '.</p>';
            return '<section class="overview-notices-group" id="overview-notices-' + group.type + '" aria-label="' + group.label + '">' +
                '<h3><i class="fa-solid ' + group.icon + '" aria-hidden="true"></i>' + group.label +
                '<span>' + items.length.toLocaleString('vi-VN') + '</span></h3><div class="overview-notices-items">' +
                paged.items.map(item => {
                    const severity = group.type === 'stock' ? (item.meta === 'Hết hàng' ? ' is-out' : ' is-low') : '';
                    const date = AdminNotices.formatDate(item.date);
                    return '<a class="overview-notice-item overview-notice-' + group.type + severity + (item.isRead ? '' : ' is-unread') +
                        '" href="' + esc(item.href) + '" data-notice-id="' + esc(item.id) + '">' +
                        '<span class="overview-notice-icon"><i class="fa-solid ' + group.icon + '" aria-hidden="true"></i></span>' +
                        '<span class="overview-notice-body"><strong>' + esc(item.title) + '</strong><span class="overview-notice-detail">' + esc(item.detail) +
                        '</span><span class="overview-notice-meta"><span class="overview-notice-pill">' + esc(item.meta) + '</span>' +
                        (item.date ? '<time datetime="' + esc(item.date) + '">' + esc(date) + '</time>' : '') +
                        '</span></span><i class="fa-solid fa-arrow-up-right-from-square overview-notice-arrow" aria-hidden="true"></i></a>';
                }).join('') + '</div></section>';
        }).join('');
    }
    document.getElementById('overview-notices-counts')?.addEventListener('click', function (event) {
        const tab = event.target.closest('[data-notice-group]');
        if (!tab) return;
        if (activeNoticeGroup !== tab.dataset.noticeGroup) noticePager.reset();
        activeNoticeGroup = tab.dataset.noticeGroup;
        renderOverviewNotices();
    });
    function renderContactMessages(revealFromHash) {
        const box = document.getElementById('contact-messages');
        if (!box) return;
        const admin = Shop.getCurrentAdmin();
        if (!admin || admin.is_locked || admin.is_deleted || admin.is_hidden) {
            box.replaceChildren();
            contactPager.render(0);
            return;
        }
        const messages = (Shop.loadDB().contact_messages || []).filter(item => !item.is_deleted && !item.is_hidden).slice().sort(function (a, b) {
            return String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id;
        });
        const esc = Shop.escapeHtml;
        let targetId = '';
        if (revealFromHash === true) {
            try { targetId = decodeURIComponent(location.hash.slice(1)); }
            catch (_) { /* Ignore malformed fragments. */ }
            const index = messages.findIndex(item => 'contact-' + String(item.id) === targetId);
            if (index !== -1) contactPager.goTo(Math.floor(index / contactPager.getPageSize()) + 1);
        }
        const paged = contactPager.slice(messages);
        contactPager.render(paged.total);
        const openIds = new Set(Array.from(box.querySelectorAll('details[open]'), detail => detail.id));
        box.innerHTML = messages.length ? paged.items.map(function (item) {
            const id = 'contact-' + String(item.id);
            return '<details id="' + esc(id) + '" data-contact-id="' + esc(String(item.id)) + '"' + (openIds.has(id) ? ' open' : '') + '><summary>' +
                (item.is_read ? '' : '[Chưa đọc] ') + esc(item.full_name) + ' — ' + esc(item.created_at) + '</summary>' +
                '<p>Email: ' + esc(item.email) + '</p><p>Điện thoại: ' + esc(item.phone) + '</p>' +
                '<p style="white-space:pre-wrap;overflow-wrap:anywhere">' + esc(item.message) + '</p></details>';
        }).join('') : '<p>Chưa có liên hệ.</p>';
        box.querySelectorAll('details').forEach(function (detail) {
            detail.addEventListener('toggle', function () {
                if (!detail.open) return;
                const db = Shop.loadDB();
                const item = (db.contact_messages || []).find(function (entry) { return String(entry.id) === detail.dataset.contactId; });
                if (!item || item.is_read) return;
                try {
                    item.is_read = true;
                    Shop.saveDB(db);
                    detail.querySelector('summary').textContent = item.full_name + ' — ' + item.created_at;
                } catch (error) {
                    item.is_read = false;
                }
            });
        });
        if (targetId) {
            const detail = document.getElementById(targetId);
            if (detail && detail.closest('#contact-messages')) {
                detail.open = true;
                detail.scrollIntoView({ block: 'start' });
            }
        }
    }
    function revealContact() {
        renderContactMessages(true);
    }
    document.getElementById('overview-notices-list')?.addEventListener('click', function (event) {
        const row = event.target.closest('[data-notice-id]');
        if (!row) return;
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const href = row.href;
        AdminNotices.markRead([row.dataset.noticeId]);
        location.href = href;
        if (href.includes('#contact-')) setTimeout(revealContact, 0);
    });
    renderContactMessages(true);
    window.addEventListener('hashchange', revealContact);
    window.addEventListener('admin:notices-updated', renderOverviewNotices);
    window.addEventListener('focus', renderContactMessages);
    window.addEventListener('storage', renderContactMessages);
    render();
    window.addEventListener('focus', render);
    window.addEventListener('pageshow', render);
    window.addEventListener('storage', render);
    window.addEventListener('modelshop:orders-updated', render);
    window.addEventListener('modelshop:db-saved', render);
    window.setInterval(render, 15000);
})();
