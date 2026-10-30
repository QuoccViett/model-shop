(function () {
    'use strict';

    const root = document.body.dataset.root || ''
    const file = location.pathname.split('/').pop();


    const MENU = [
        { key: 'home', label: 'Trang chủ', href: 'index.html' },
        { key: 'products', label: 'Sản phẩm', href: 'pages/products.html' },
        { key: 'about', label: 'Giới thiệu', href: 'pages/about.html' },
        { key: 'contact', label: 'Liên hệ', href: 'pages/contact.html' },
        { key: 'news', label: 'Tin tức', href: 'pages/news.html' }
    ];

    const ACTIVE_OF = {
        '': 'home', 'index.html': 'home',
        'products.html': 'products', 'product.html': 'products',
        'about.html': 'about', 'contact.html': 'contact',
        'news.html': 'news', 'news-detail.html': 'news'
    };

    const active = ACTIVE_OF[file] || '';

    function menuLink(href, label, key) {
        return '<a href="' + root + href + '"' + (key === active ? ' class="active"' : '') + '>' + label + '</a>';
    }

    function headerHTML() {
        const menu = MENU.map(function (m) { return menuLink(m.href, m.label, m.key); }).join('');

        return '' +
            '<div class="topbar"><div class="container">' +
            '<span>Hotline: 0900 000 000</span>' +
            '<div class="user-box" id="user-box"></div>' +
            '</div></div>' +
            '<header class="header"><div class="container">' +
            '<a class="logo" href="' + root + 'index.html">ModelShop</a>' +
            '<form class="search-form" action="' + root + 'pages/products.html" method="get">' +
            '<input type="text" name="keyword" placeholder="Tìm mô hình theo tên...">' +
            '<button type="submit">Tìm</button>' +
            '</form>' +
            '<a class="cart-link" href="' + root + 'pages/cart.html">Giỏ hàng<span class="cart-count" id="cart-count">0</span></a>' +
            '</div></header>' +
            '<nav class="main-nav"><div class="container">' +
            menu +
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
            '<span>Xin chào, <a href="' + root + 'pages/profile.html"><strong>' + Shop.escapeHtml(user.full_name) + '</strong></a></span>' + '<a href="' + root + 'pages/orders.html">Đơn hàng của tôi</a>' +
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
    
        function refreshCartCount() {
        const badge = document.getElementById('cart-count');
        if (badge && window.Cart) badge.textContent = String(Cart.getCartCount());
    }

    function notifyCart(message, ok) {
        let notice = document.getElementById('cart-toast');
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'cart-toast';
            notice.setAttribute('role', 'status');
            document.body.appendChild(notice);
        }
        notice.textContent = message;
        notice.className = 'cart-toast show ' + (ok ? 'success' : 'error');
        clearTimeout(notifyCart.timer);
        notifyCart.timer = setTimeout(function () { notice.classList.remove('show'); }, 2800);
    }

    document.addEventListener('click', function (event) { //Them san pham vao gio hang
        const button = event.target.closest('[data-add-to-cart]');
        if (!button || !window.Cart || button.disabled) return;
        const productId = Number(button.dataset.addToCart);
        const qtyInput = document.getElementById('qty');
        const qty = qtyInput && qtyInput.closest('.buy-row') && button.closest('.buy-row')
            ? Number(qtyInput.value) : 1;
        const result = Cart.addToCart(productId, qty);
        refreshCartCount();
        notifyCart(result.ok ? 'Đã thêm sản phẩm vào giỏ hàng!' : result.error, result.ok);
    });
refreshCartCount();
})();