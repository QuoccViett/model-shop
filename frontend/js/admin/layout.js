(function () {
    'use strict';

    const root = document.body.dataset.root || '';
    const file = location.pathname.split('/').pop();
    function guard() {
        const admin = Shop.getCurrentAdmin();
        window.AdminAuthenticated = Boolean(admin && !admin.is_locked && !admin.is_deleted && !admin.is_hidden);
        if (!window.AdminAuthenticated) {
            document.documentElement.style.visibility = 'hidden';
            if (!window.AdminRedirecting) {
                window.AdminRedirecting = true;
                location.replace(root + 'login.html?redirect=' + encodeURIComponent((file || 'index.html') + location.search + location.hash));
            }
        }
        return window.AdminAuthenticated;
    }
    if (!guard()) return;

    // Danh sách menu quản trị
    const MENU = [
        { key: 'overview', label: 'Tổng quan', href: 'index.html', icon: 'fa-solid fa-house' },
        { key: 'users', label: 'Quản lý người dùng', href: 'users.html', icon: 'fa-solid fa-users' },
        { key: 'categories', label: 'Quản lý loại sản phẩm', href: 'categories.html', icon: 'fa-solid fa-tags' },
        { key: 'products', label: 'Quản lý sản phẩm', href: 'products.html', icon: 'fa-solid fa-box-open' },
        { key: 'imports', label: 'Quản lý nhập hàng', href: 'imports.html', icon: 'fa-solid fa-box' },
        { key: 'prices', label: 'Quản lý giá bán', href: 'prices.html', icon: 'fa-solid fa-dollar-sign' },
        { key: 'orders', label: 'Quản lý đơn hàng', href: 'orders.html', icon: 'fa-solid fa-cart-shopping' },
        { key: 'inventory', label: 'Quản lý tồn kho', href: 'inventory.html', icon: 'fa-solid fa-boxes-stacked' }
    ];

    // Ánh xạ file hiện tại với key menu để active đúng dòng
    const ACTIVE_OF = {
        '': 'overview',
        'index.html': 'overview',
        'users.html': 'users',
        'categories.html': 'categories',
        'products.html': 'products',
        'imports.html': 'imports',
        'prices.html': 'prices',
        'orders.html': 'orders',
        'inventory.html': 'inventory'
    };

    const active = ACTIVE_OF[file] || 'overview';

    // === PHÂN TRANG DÙNG CHUNG CHO CÁC TRANG QUẢN TRỊ ===
    function buildPageNumbers(current, totalPages) {
        if (totalPages <= 7) {
            const allPages = [];
            for (let i = 1; i <= totalPages; i++) allPages.push(i);
            return allPages;
        }

        let start = Math.max(2, current - 1);
        let end = Math.min(totalPages - 1, current + 1);

        if (current <= 4) {
            start = 2;
            end = 5;
        }
        if (current >= totalPages - 3) {
            start = totalPages - 4;
            end = totalPages - 1;
        }

        const pages = [1, '...'];
        for (let i = start; i <= end; i++) pages.push(i);
        pages.push('...', totalPages);
        return pages;
    }

    function createPagination(options) {
        options = options || {};
        const container = typeof options.container === 'string'
            ? document.getElementById(options.container)
            : options.container;
        const label = options.label || 'mục';
        const pageSizes = options.pageSizes || [10, 20, 50];
        const onChange = options.onChange || function () { };

        let page = 1;
        let pageSize = Number(options.pageSize) || 10;

        function totalPagesOf(total) {
            return Math.max(1, Math.ceil((Number(total) || 0) / pageSize));
        }

        function clampPage(total) {
            const totalPages = totalPagesOf(total);
            page = Math.min(Math.max(1, Number(page) || 1), totalPages);
            return page;
        }

        function slice(list) {
            list = Array.isArray(list) ? list : [];
            clampPage(list.length);
            const startIndex = (page - 1) * pageSize;

            return {
                items: list.slice(startIndex, startIndex + pageSize),
                page: page,
                total: list.length,
                totalPages: totalPagesOf(list.length)
            };
        }

        function render(total) {
            if (!container) return;

            total = Number(total) || 0;
            clampPage(total);
            container.dataset.total = String(total);
            container.hidden = total <= pageSize;
            if (container.hidden) {
                container.innerHTML = '';
                return;
            }

            const totalPages = totalPagesOf(total);
            const start = (page - 1) * pageSize + 1;
            const end = Math.min(total, page * pageSize);

            const sizes = pageSizes.slice();
            if (sizes.indexOf(pageSize) === -1) sizes.push(pageSize);
            sizes.sort(function (a, b) { return a - b; });

            const sizeOptions = sizes.map(function (size) {
                return '<option value="' + size + '"' + (size === pageSize ? ' selected' : '') + '>' + size + '</option>';
            }).join('');

            const pageNumbers = buildPageNumbers(page, totalPages).map(function (item) {
                if (item === '...') {
                    return '<span class="admin-pagination-ellipsis">…</span>';
                }
                const isCurrent = item === page;
                return '<button type="button" class="admin-pagination-btn' + (isCurrent ? ' active' : '') + '" data-page="' + item + '"' +
                    (isCurrent ? ' aria-current="page"' : '') + ' aria-label="Trang ' + item + '">' + item + '</button>';
            }).join('');

            container.dataset.total = String(total);
            container.innerHTML =
                '<span class="admin-pagination-info">Hiển thị <strong>' + start + '–' + end + '</strong> trong <strong>' + total + '</strong> ' + label + '</span>' +
                '<div class="admin-pagination-controls">' +
                    '<label class="admin-pagination-size">Số dòng ' +
                        '<select class="admin-page-size" aria-label="Số dòng mỗi trang">' + sizeOptions + '</select>' +
                    '</label>' +
                    '<button type="button" class="admin-pagination-btn" data-page="1" title="Trang đầu" aria-label="Trang đầu"' + (page === 1 ? ' disabled' : '') + '><i class="fa-solid fa-angles-left"></i></button>' +
                    '<button type="button" class="admin-pagination-btn" data-page="' + (page - 1) + '" title="Trang trước" aria-label="Trang trước"' + (page === 1 ? ' disabled' : '') + '><i class="fa-solid fa-angle-left"></i></button>' +
                    pageNumbers +
                    '<button type="button" class="admin-pagination-btn" data-page="' + (page + 1) + '" title="Trang sau" aria-label="Trang sau"' + (page === totalPages ? ' disabled' : '') + '><i class="fa-solid fa-angle-right"></i></button>' +
                    '<button type="button" class="admin-pagination-btn" data-page="' + totalPages + '" title="Trang cuối" aria-label="Trang cuối"' + (page === totalPages ? ' disabled' : '') + '><i class="fa-solid fa-angles-right"></i></button>' +
                '</div>';
        }

        if (container) {
            container.addEventListener('click', function (e) {
                const button = e.target.closest('.admin-pagination-btn');
                if (!button || button.disabled) return;

                const totalPages = totalPagesOf(container.dataset.total);
                const nextPage = Math.min(Math.max(1, Number(button.dataset.page) || 1), totalPages);
                if (nextPage === page) return;

                page = nextPage;
                onChange({ page: page, pageSize: pageSize });
            });

            container.addEventListener('change', function (e) {
                if (!e.target.classList.contains('admin-page-size')) return;

                const nextSize = Number(e.target.value);
                if (!Number.isFinite(nextSize) || nextSize <= 0) return;

                pageSize = nextSize;
                page = 1;
                onChange({ page: page, pageSize: pageSize });
            });
        }

        return {
            slice: slice,
            render: render,
            reset: function () { page = 1; },
            goTo: function (value) { page = Math.max(1, Number(value) || 1); },
            getPage: function () { return page; },
            getPageSize: function () { return pageSize; }
        };
    }

    window.AdminPagination = { create: createPagination };

    // Tạo HTML cho từng mục trong Sidebar
    function menuLink(item) {
        const isActive = item.key === active ? ' class="active"' : '';
        return '<li><a href="' + root + item.href + '"' + isActive + '><i class="' + item.icon + '"></i> ' + item.label + '</a></li>';
    }

    // Render Sidebar
    function sidebarHTML() {
        const menuItems = MENU.map(menuLink).join('');

        return '' +
            '<div class="sidebar-brand">' +
                '<h2>Model<span>Shop</span></h2>' +
                '<p>Admin Panel</p>' +
            '</div>' +
            '<ul class="sidebar-menu">' +
                menuItems +
            '</ul>' +
            '<div class="sidebar-footer">' +
                '<a href="#" id="admin-logout"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a>' +
            '</div>';
    }

    // Render Header
    function headerHTML() {
        return '<div class="header-search">' +
            '<i class="fa-solid fa-magnifying-glass"></i><input id="admin-quick-search" aria-label="Tìm nhanh" autocomplete="off" placeholder="Tìm mã đơn, sản phẩm, khách hàng...">' +
            '<div id="admin-search-results" class="admin-live-panel" hidden></div></div>' +
            '<div class="header-user"><div class="admin-bell-wrap">' +
            '<button type="button" id="admin-bell" class="notification" aria-label="Thông báo" aria-expanded="false"><i class="fa-regular fa-bell"></i><span class="badge" hidden></span></button>' +
            '<div id="admin-notices" class="admin-live-panel" hidden></div></div>' +
            '<div class="user-info"><span id="admin-name"></span></div></div>';
    }

    // Xử lý thông tin Admin và sự kiện Đăng xuất
    function initAdminAccount() {
        const admin = Shop.getCurrentAdmin();
        if (!admin) {
            location.href = root + 'login.html';
            return;
        }
        const nameSpan = document.getElementById('admin-name');
        if (admin && nameSpan) {
            nameSpan.innerHTML = 'Xin chào, <strong>' + Shop.escapeHtml(admin.full_name) + '</strong>';
        }

        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                Shop.logoutAdmin();
                location.href = root + 'login.html';
            });
        }
    }

    // Gắn HTML vào các container tương ứng trên DOM
    const sidebarBox = document.getElementById('admin-sidebar');
    const headerBox = document.getElementById('admin-header');

    if (sidebarBox) sidebarBox.innerHTML = sidebarHTML();
    if (headerBox) headerBox.innerHTML = headerHTML();

    const esc = value => Shop.escapeHtml(String(value ?? ''));
    const list = (db, key) => Array.isArray(db[key]) ? db[key] : [];
    const currentAdmin = Shop.getCurrentAdmin();
    const readKey = 'model_shop_admin_notice_reads_v1:' + currentAdmin.id;
    const seedNotifications = new Map(((window.DB_SEED && window.DB_SEED.notifications) || []).map(row => [Number(row[0]), row]));
    const seedOrderStatuses = new Map(((window.DB_SEED && window.DB_SEED.orders) || []).map(row => [Number(row[0]), Shop.normalizeStatus(row[3])]));
    let reads = {};
    function loadReads() {
        try { const value = JSON.parse(localStorage.getItem(readKey) || '{}'); reads = value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
        catch (_) { reads = {}; }
    }
    loadReads();
    function markRead(ids) {
        ids.forEach(id => { reads[id] = true; });
        try { localStorage.setItem(readKey, JSON.stringify(reads)); } catch (_) { /* Keep state for this visit if storage is full. */ }
        renderNotices();
    }
    function link(page, query) { return root + page + '?admin_q=' + encodeURIComponent(query); }
    function orderCode(order) { return Shop.getOrderCode ? Shop.getOrderCode(order.id) : (order.code || 'DH' + order.id); }
    function statusLabel(status) {
        if (window.ORDER_STATUS) return window.ORDER_STATUS.get(status).label;
        const labels = {
            order_created: 'Đặt hàng thành công',
            payment_success: 'Thanh toán thành công',
            order_confirmed: 'Đã xác nhận',
            shipping: 'Đang giao',
            delivered: 'Giao hàng thành công',
            cancelled: 'Đã hủy'
        };
        return labels[status] || 'Chưa xác định';
    }
    function formatDate(value) {
        const date = new Date(String(value || '').replace(' ', 'T'));
        return Number.isNaN(date.getTime()) ? String(value || '') : date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    function relativeTime(value) {
        const date = new Date(String(value || '').replace(' ', 'T'));
        if (Number.isNaN(date.getTime())) return '';
        const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return minutes + ' phút trước';
        if (minutes < 1440) return Math.floor(minutes / 60) + ' giờ trước';
        return Math.floor(minutes / 1440) + ' ngày trước';
    }
    function notices() {
        const db = Shop.loadDB();
        const result = [];
        const recent = value => {
            const time = new Date(String(value || '').replace(' ', 'T')).getTime();
            return Number.isFinite(time) && Date.now() - time <= 30 * 86400000;
        };
        function add(id, type, title, detail, date, href, meta, icon, isRead) { result.push({ id, type, title, detail, date: String(date || ''), href, meta, icon, isRead: Boolean(isRead || reads[id]) }); }
        const orders = list(db, 'orders').filter(o => !o.is_deleted);
        const ordersById = new Map(orders.map(o => [Number(o.id), o]));
        const recordedStatuses = new Set();
        list(db, 'notifications').filter(n => n.order_id != null).forEach(n => {
            const order = ordersById.get(Number(n.order_id));
            if (!order) return;
            const status = Shop.normalizeStatus(n.type);
            const seed = seedNotifications.get(Number(n.id));
            const isSeedEvent = Boolean(seed && Number(seed[3]) === Number(n.order_id) &&
                Shop.normalizeStatus(seed[2]) === status && String(seed[6]) === String(n.created_at));
            recordedStatuses.add(order.id + ':' + status);
            add('order-event:' + n.id, 'orders', 'Đơn hàng ' + orderCode(order), 'Trạng thái: ' + statusLabel(status), n.created_at, root + 'orders.html?order=' + order.id, statusLabel(status), 'fa-cart-shopping', isSeedEvent);
        });
        orders.forEach(o => {
            const status = Shop.normalizeStatus(o.status);
            if (recordedStatuses.has(o.id + ':' + status)) return;
            add('order:' + o.id + ':' + status, 'orders', 'Đơn hàng ' + orderCode(o), 'Trạng thái: ' + statusLabel(status), o.updated_at || o.created_at || o.order_date, root + 'orders.html?order=' + o.id, statusLabel(status), 'fa-cart-shopping', seedOrderStatuses.get(Number(o.id)) === status);
        });
        list(db, 'products').filter(p => !p.is_deleted && !p.is_hidden).forEach(p => {
            const stock = Number(p.stock_qty ?? p.stock_quantity ?? p.quantity ?? 0);
            const raw = Number(p.low_stock_threshold ?? p.min_stock ?? 5);
            const threshold = Number.isFinite(raw) && raw >= 0 ? raw : 5;
            if (!Number.isFinite(stock) || stock > threshold) return;
            add('stock:' + p.id + ':' + stock + ':' + threshold, 'stock', p.name, 'Tồn: ' + stock + ' / Ngưỡng: ' + threshold, p.updated_at || p.created_at, link('inventory.html', p.code || p.sku || p.name), stock <= 0 ? 'Hết hàng' : 'Sắp hết', 'fa-boxes-stacked');
        });
        list(db, 'customers').filter(c => !c.is_deleted).forEach(c => {
            if (!recent(c.created_at)) return;
            add('customer:' + c.id, 'customers', c.full_name || c.username || 'Khách hàng mới', c.email || c.phone || '', c.created_at, link('users.html', c.username || c.email || c.full_name), 'Khách hàng mới', 'fa-user-plus');
        });
        list(db, 'contact_messages').filter(m => !m.is_deleted && !m.is_hidden).forEach(m => {
            if (m.is_read && !recent(m.created_at)) return;
            const detail = [m.message || m.content, m.email].filter(Boolean).join(' · ');
            add('contact:' + m.id, 'contact', m.subject || m.full_name || m.name || m.email || 'Liên hệ #' + m.id, detail, m.created_at, root + 'index.html#contact-' + encodeURIComponent(m.id), 'Liên hệ', 'fa-envelope', m.is_read);
        });
        return result.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
    }
    window.AdminNotices = { list: notices, markRead: markRead, formatDate: formatDate, relativeTime: relativeTime };
    let noticeFilter = 'all';
    const noticeTabs = [['all', 'Tất cả'], ['orders', 'Đơn hàng'], ['stock', 'Tồn kho'], ['customers', 'Khách hàng'], ['contact', 'Liên hệ']];
    function noticeRow(item) {
        return '<a class="admin-notice-row' + (item.isRead ? '' : ' is-unread') + '" href="' + esc(item.href) + '" data-notice-id="' + esc(item.id) + '">' +
            '<span class="admin-notice-icon"><i class="fa-solid ' + item.icon + '"></i></span><span class="admin-notice-content"><strong>' + esc(item.title) + '</strong><span class="admin-notice-detail">' + esc(item.detail) + '</span>' +
            '<span class="admin-notice-meta"><span class="admin-type-pill">' + esc(item.meta) + '</span><time datetime="' + esc(item.date) + '" title="' + esc(formatDate(item.date)) + '">' + esc(relativeTime(item.date)) + ' · ' + esc(formatDate(item.date)) + '</time></span></span>' +
            (item.isRead ? '' : '<span class="admin-unread-dot" aria-label="Chưa đọc"></span>') + '</a>';
    }
    let renderingNotices = false;
    function renderNotices() {
        if (renderingNotices) return;
        renderingNotices = true;
        try { renderNoticesContent(); }
        finally { renderingNotices = false; }
    }
    function renderNoticesContent() {
        if (!guard()) return;
        const panel = document.getElementById('admin-notices');
        if (!panel) return;
        const items = notices();
        const unread = items.filter(item => !item.isRead).length;
        const badge = document.querySelector('#admin-bell .badge');
        badge.textContent = unread > 99 ? '99+' : String(unread);
        badge.hidden = !unread;
        document.getElementById('admin-bell').setAttribute('aria-label', 'Thông báo: ' + unread + ' chưa đọc');
        const visible = noticeFilter === 'all' ? items : items.filter(item => item.type === noticeFilter);
        panel.innerHTML = '<div class="admin-notice-head"><div><strong>Thông báo</strong><span>' + unread + ' mục chưa đọc</span></div></div>' +
            '<div class="admin-notice-tabs" role="tablist" aria-label="Lọc thông báo">' + noticeTabs.map(([key, label]) => '<button type="button" role="tab" aria-selected="' + (noticeFilter === key) + '" class="' + (noticeFilter === key ? 'is-active' : '') + '" data-notice-filter="' + key + '">' + label + '</button>').join('') + '</div>' +
            '<div class="admin-notice-list">' + (visible.length ? visible.map(noticeRow).join('') : '<p class="admin-panel-empty">Không có thông báo trong mục này.</p>') + '</div>';
        window.dispatchEvent(new CustomEvent('admin:notices-updated', { detail: items }));
    }
    function search() {
        if (!guard()) return;
        const input = document.getElementById('admin-quick-search');
        const panel = document.getElementById('admin-search-results');
        const query = Shop.normalize(input.value.trim());
        panel.hidden = !query;
        if (!query) return;
        const db = Shop.loadDB();
        const results = [];
        function collect(key, page, type, icon, title, description, fields, term) {
            list(db, key).filter(item => !item.is_deleted && !item.is_hidden && Shop.normalize(fields(item)).includes(query)).slice(0, 5).forEach(item => {
                results.push('<a class="admin-search-card" href="' + esc(link(page, term(item))) + '"><span class="admin-search-icon"><i class="fa-solid ' + icon + '"></i></span><span><span class="admin-search-type">' + esc(type) + '</span><strong>' + esc(title(item)) + '</strong><small>' + esc(description(item)) + '</small></span><i class="fa-solid fa-arrow-up-right-from-square"></i></a>');
            });
        }
        collect('orders', 'orders.html', 'Đơn hàng', 'fa-cart-shopping', o => orderCode(o), o => [o.receiver_name, o.receiver_phone, statusLabel(Shop.normalizeStatus(o.status))].filter(Boolean).join(' · '), o => [orderCode(o), o.receiver_name, o.receiver_phone].join(' '), orderCode);
        collect('products', 'products.html', 'Sản phẩm', 'fa-box-open', p => p.name, p => [p.code || p.sku, 'Tồn ' + p.stock_qty].filter(Boolean).join(' · '), p => [p.code, p.sku, p.name].join(' '), p => p.code || p.sku || p.name);
        collect('customers', 'users.html', 'Khách hàng', 'fa-user', c => c.full_name || c.username, c => [c.username, c.email, c.phone].filter(Boolean).join(' · '), c => [c.full_name, c.username, c.email, c.phone].join(' '), c => c.username || c.email || c.full_name);
        panel.innerHTML = '<div class="admin-search-heading">Kết quả phù hợp <span>' + results.length + '</span></div><div class="admin-search-list">' + (results.join('') || '<p class="admin-panel-empty">Không có kết quả phù hợp.</p>') + '</div>';
    }
    if (headerBox) {
        document.getElementById('admin-quick-search').addEventListener('input', search);
        document.getElementById('admin-quick-search').addEventListener('focus', function () {
            document.getElementById('admin-notices').hidden = true;
            document.getElementById('admin-bell').setAttribute('aria-expanded', 'false');
            search();
        });
        document.getElementById('admin-bell').addEventListener('click', function () {
            renderNotices();
            const panel = document.getElementById('admin-notices');
            panel.hidden = !panel.hidden;
            document.getElementById('admin-search-results').hidden = true;
            this.setAttribute('aria-expanded', String(!panel.hidden));
        });
        document.getElementById('admin-notices').addEventListener('click', function (event) {
            event.stopPropagation();
            if (!guard()) { event.preventDefault(); return; }
            const tab = event.target.closest('[data-notice-filter]');
            if (tab) { noticeFilter = tab.dataset.noticeFilter; renderNotices(); return; }
            const row = event.target.closest('[data-notice-id]');
            if (row) {
                event.preventDefault();
                window.open(row.href, '_blank', 'noopener');
                markRead([row.dataset.noticeId]);
            }
        });
        document.addEventListener('click', function (event) {
            if (!headerBox.contains(event.target) || event.key === 'Escape') closePanels();
        });
        document.addEventListener('keydown', event => { if (event.key === 'Escape') closePanels(); });
        renderNotices();
    }
    function closePanels() {
        ['admin-search-results', 'admin-notices'].forEach(id => { const panel = document.getElementById(id); if (panel) panel.hidden = true; });
        const bell = document.getElementById('admin-bell');
        if (bell) bell.setAttribute('aria-expanded', 'false');
    }
    function applyQuickFilter() {
        const query = new URLSearchParams(location.search).get('admin_q');
        if (!query || !guard()) return;
        const input = document.getElementById(active === 'orders' ? 'order-search' : active === 'inventory' ? 'inventory-search' : 'search-input');
        if (input) { input.value = query; input.dispatchEvent(new Event('input', { bubbles: true })); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyQuickFilter);
    else setTimeout(applyQuickFilter, 0);
    window.addEventListener('focus', () => { if (guard()) renderNotices(); });
    window.addEventListener('pageshow', () => { if (guard()) renderNotices(); });
    window.addEventListener('storage', function (event) {
        if (guard()) { loadReads(); renderNotices(); }
    });
    window.addEventListener('modelshop:db-updated', renderNotices);
    window.addEventListener('modelshop:orders-updated', renderNotices);
    let refreshingHeader = false;
    window.addEventListener('modelshop:db-saved', function () {
        // loadDB may save during cleanup; ignore events raised by this refresh.
        if (refreshingHeader || renderingNotices) return;
        refreshingHeader = true;
        try {
            renderNotices();
            const results = document.getElementById('admin-search-results');
            if (results && !results.hidden) search();
        } finally { refreshingHeader = false; }
    });
    window.setInterval(() => { if (guard()) renderNotices(); }, 15000);
    initAdminAccount();
})();
