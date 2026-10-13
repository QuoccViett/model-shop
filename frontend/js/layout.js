(function () {
    'use strict';

    const root = document.body.dataset.root || ''
    const file = location.pathname.split('/').pop();
    const category = new URLSearchParams(location.search).get('category');

    let active = '';
    if (file === '' | file === 'index.html') active = 'home';
    else if (file === 'products.html') active = category ? 'cat-' + category : 'all';

    function menuLink(href, label, key) {
        return '<a href="' + root + href + '"' + (key === active ? ' class="active"' : '') + '>' + label + '</a>';
    }

    function headerHTML() {
        const cats = Shop.getCategories().map(function (c) {
            return menuLink('pages/products.html?category=' + c.id, Shop.escapeHtml(c.name), 'cat-' + c.id);
        }).join('');

        return '' +
            '<div class="topbar"><div class="container">' +
            '<span>Hotline: 0900 000 000</span>' +
            '<div class="user-box" id="user-box"></div>' +
            '</div></div>' +
            '<header class="header"><div class="container">' +
            '<a class="logo" href="' + root + 'index.html">ModelShop</a>' +
            '<form class="search-form" action="' + root + 'pages/search.html" method="get">' +
            '<input type="text" name="keyword" placeholder="Tìm mô hình theo tên...">' +
            '<button type="submit">Tìm</button>' +
            '</form>' +
            '<a class="cart-link" href="' + root + 'pages/cart.html">Giỏ hàng<span class="cart-count" id="cart-count">0</span></a>' +
            '</div></header>' +
            '<nav class="main-nav"><div class="container">' +
            menuLink('index.html', 'Trang chủ', 'home') +
            menuLink('pages/products.html', 'Tất cả sản phẩm', 'all') +
            cats +
            '</div></nav>';
    }

    function renderUserBox() {
        const box = document.getElementById('user-box');
        const user = Shop.getCurrentUser();

        if (!user) {
            box.innerHTML =
                '<a href="' + root + 'pages/login.html">Đăng nhập</a>' +
                '<a href="' + root + 'pages/register.html">Đăng ký</a>';
            return;
        }

        box.innerHTML =
            '<span>Xin chào, <a href="' + root + 'pages/profile.html"><strong>' + Shop.escapeHtml(user.full_name) + '</strong></a></span>' +
            '<a href="#" id="logout-link">Đăng xuất</a>';

        document.getElementById('logout-link').addEventListener('click', function (e) {
            e.preventDefault();
            Shop.logoutCustomer();
            location.href = root + 'index.html';
        });
    }

    function footerHTML() {
        const cats = Shop.getCategories().map(function (c) {
            return '<li><a href="' + root + 'pages/products.html?category=' + c.id + '">' + Shop.escapeHtml(c.name) + '</a></li>';
        }).join('');

        return '' +
            '<footer class="footer"><div class="container">' +
            '<div><h4>ModelShop</h4><p>Cửa hàng mô hình Gundam, Figure, xe mô hình, mô hình quân sự và phụ kiện.</p></div>' +
            '<div><h4>Danh mục</h4><ul>' + cats + '</ul></div>' +
            '<div><h4>Liên hệ</h4><ul><li>Hotline: 0900 000 000</li><li>Email: shop@example.com</li></ul></div>' +
            '<div class="copyright">© 2026 ModelShop. Đồ án môn học.</div>' +
            '</div></footer>';
    }

    const headerBox = document.getElementById('site-header');
    const footerBox = document.getElementById('site-footer');
    if (headerBox) { headerBox.innerHTML = headerHTML(); renderUserBox(); }
    if (footerBox) footerBox.innerHTML = footerHTML();
})();