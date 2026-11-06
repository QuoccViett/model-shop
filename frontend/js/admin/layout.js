(function () {
    'use strict';

    const root = document.body.dataset.root || '';
    const file = location.pathname.split('/').pop();
    window.AdminAuthenticated = Boolean(Shop.getCurrentAdmin());
    if (!window.AdminAuthenticated) {
        if (!window.AdminRedirecting) {
            location.replace(root + 'login.html?redirect=' + encodeURIComponent(file + location.search + location.hash));
        }
        return;
    }

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
            if (total === 0) {
                container.innerHTML = '';
                container.dataset.total = '0';
                return;
            }

            clampPage(total);
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
        return '' +
            '<div class="header-search">' +
                '<i class="fa-solid fa-magnifying-glass"></i>' +
                '<input type="text" placeholder="Tìm kiếm nhanh mã đơn, sản phẩm...">' +
            '</div>' +
            '<div class="header-user">' +
                '<div class="notification">' +
                    '<i class="fa-regular fa-bell"></i>' +
                    '<span class="badge">3</span>' +
                '</div>' +
                '<div class="user-info">' +
                    '<img src="https://via.placeholder.com/40" alt="Avatar Admin">' +
                    '<span id="admin-name">Xin chào, <strong>Đang tải...</strong></span>' +
                '</div>' +
            '</div>';
    }

    // Xử lý thông tin Admin và sự kiện Đăng xuất
    function initAdminAccount() {
        const admin = Shop.getCurrentAdmin();
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

    initAdminAccount();
})();
