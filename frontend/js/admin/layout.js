(function () {
    'use strict';

    const root = document.body.dataset.root || '';
    const file = location.pathname.split('/').pop();

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