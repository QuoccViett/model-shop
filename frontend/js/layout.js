(function () {
    'use strict';

    const root = document.body.dataset.root || '';
    const file = location.pathname.split('/').pop();
    const MENU = [
        { key: 'home', label: 'Trang chủ', href: 'index.html' },
        { key: 'products', label: 'Sản phẩm', href: 'pages/products.html' },
        { key: 'about', label: 'Giới thiệu', href: 'pages/about.html' },
        { key: 'contact', label: 'Liên hệ', href: 'pages/contact.html' },
        { key: 'news', label: 'Tin tức', href: 'pages/news.html' }
    ];
    const ACTIVE_OF = { '': 'home', 'index.html': 'home', 'products.html': 'products', 'product.html': 'products', 'about.html': 'about', 'contact.html': 'contact', 'news.html': 'news', 'news-detail.html': 'news' };
    const active = ACTIVE_OF[file] || '';

    // Tạo đường dẫn trang danh sách sản phẩm.
    function productsUrl(query) {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        const suffix = params.toString();
        return root + 'pages/products.html' + (suffix ? '?' + suffix : '');
    }

    // Tạo đường dẫn trang chi tiết sản phẩm.
    function productUrl(product) {
        return root + 'pages/product.html?id=' + encodeURIComponent(product.id);
    }

    // Tạo một liên kết trong menu chính.
    function menuLink(href, label, key) {
        return '<a href="' + root + href + '"' + (key === active ? ' class="active"' : '') + '>' + label + '</a>';
    }

    // Render header dùng chung cho phía khách hàng
    function headerHTML() {
        const menu = MENU.map(function (m) { return menuLink(m.href, m.label, m.key); }).join('');
        return '<header class="header"><div class="container"><a class="logo" href="' + root + 'index.html">ModelShop</a>' +
            '<form class="search-form" id="header-search-form" role="search" action="' + productsUrl('') + '" method="get" autocomplete="off">' +
            '<div class="search-control"><input id="header-search-input" type="search" name="q" placeholder="Tìm mô hình theo tên..." aria-label="Tìm sản phẩm" aria-autocomplete="list" aria-controls="search-suggestions" aria-expanded="false">' +
            '<div class="search-suggestions" id="search-suggestions" role="listbox" hidden></div></div><button type="submit">Tìm</button></form>' +
            '<div class="header-actions"><a class="cart-link hdr-action" href="' + root + 'pages/cart.html"><span class="hdr-icon">🛒</span><span>Giỏ hàng</span><span class="cart-count" id="cart-count">0</span></a><div class="account-wrap" id="account-wrap"></div></div></div></header>' +
            '<nav class="main-nav"><div class="container"><button class="hdr-menu-toggle" type="button" aria-expanded="false">☰ Menu</button><div class="hdr-menu-list">' + menu + '</div></div></nav>';
    }

    // Hiển thị trạng thái tài khoản và popup thông báo
    function renderUserBox() {
        const box = document.getElementById('account-wrap');
        const user = Shop.getCurrentUser();
        if (!user) {
            box.innerHTML = '<a class="hdr-action hdr-account" href="' + root + 'pages/login.html"><span class="hdr-icon">♙</span><span>Đăng nhập</span></a>';
            return;
        }
        box.innerHTML = '<button type="button" class="hdr-action hdr-account" id="account-button" aria-expanded="false"><span class="hdr-account-icon"><span class="hdr-icon">♙</span><span class="notif-badge" id="notification-badge" hidden></span></span><span class="hdr-account-name">' + Shop.escapeHtml(user.full_name || user.username) + '</span></button>' +
            '<div class="notif-popup" id="notification-popup" hidden></div>';
    }

    // Render footer cùng danh sách danh mục.
    function footerHTML() {
        const cats = Shop.getCategories().map(function (c) {
            return '<li><a href="' + root + 'pages/products.html?category=' + encodeURIComponent(c.id) + '">' + Shop.escapeHtml(c.name) + '</a></li>';
        }).join('');
        return '<footer class="footer"><div class="container"><div><h4>ModelShop</h4><p>Cửa hàng mô hình Gundam, Figure, xe mô hình, mô hình quân sự và phụ kiện.</p></div>' +
            '<div><h4>Danh mục</h4><ul>' + cats + '</ul></div><div><h4>Liên hệ</h4><ul><li><strong>Địa chỉ:</strong> 273 An Dương Vương, Phường Chợ Quán</li><li><strong>Email:</strong> admin@example.com</li><li><strong>Hotline:</strong> 0900 00 00 01 -0900 00 00 02</li></ul></div>';
    }

    // Render sản phẩm hoặc từ khóa xu hướng trong dropdown.
    function renderSuggestions(panel, query, activeIndex) {
        const esc = Shop.escapeHtml;
        if (query.length < 2) {
            const trends = ['Gundam', 'Figure', 'Xe mô hình', 'Mô hình quân sự'];
            panel.innerHTML = '<div class="suggestion-heading">Từ khóa xu hướng</div>' + trends.map(function (term) {
                return '<a class="suggestion-item trend-item" role="option" aria-selected="false" data-suggestion href="' + productsUrl(term) + '"><span class="suggestion-copy"><strong>' + esc(term) + '</strong><small>Tìm sản phẩm</small></span></a>';
            }).join('');
            panel.hidden = false;
            return;
        }
        const suggestions = query.length >= 2
            ? Shop.queryProducts({ keyword: query }).slice(0, 5).map(function (product) {
                return '<a class="suggestion-item" role="option" aria-selected="false" data-suggestion href="' + productUrl(product) + '"><img src="' + esc(UI.imageSrc(product.image)) + '" alt=""><span class="suggestion-copy"><strong>' + esc(product.name) + '</strong><small>' + esc(Shop.formatPrice(Shop.getSalePrice(product))) + '</small></span></a>';
            })
            : Shop.getBestSellers(5).concat(Shop.getNewest(5)).filter(function (p, i, list) { return list.findIndex(function (item) { return item.id === p.id; }) === i; }).slice(0, 5).map(function (product) {
                return '<a class="suggestion-item" role="option" aria-selected="false" data-suggestion href="' + productUrl(product) + '"><img src="' + esc(UI.imageSrc(product.image)) + '" alt=""><span class="suggestion-copy"><strong>' + esc(product.name) + '</strong><small>' + esc(Shop.formatPrice(Shop.getSalePrice(product))) + '</small></span></a>';
            });
        const heading = 'Gợi ý sản phẩm';
        const content = suggestions.length
            ? '<div class="suggestion-heading">' + heading + '</div>' + suggestions.map(function (html, index) {
                return activeIndex === index ? html.replace('class="suggestion-item"', 'class="suggestion-item is-active"').replace('aria-selected="false"', 'aria-selected="true"') : html;
            }).join('')
            : '<div class="suggestion-empty">Không tìm thấy sản phẩm phù hợp.</div>';
        const all = query ? '<a class="suggestion-all" data-suggestion href="' + productsUrl(query) + '">Xem tất cả kết quả cho “' + esc(query) + '”</a>' : '';
        panel.innerHTML = content + all;
        panel.hidden = false;
    }

    // Kết nối debounce, phím điều hướng và hành vi đóng dropdown.
    function bindHeaderSearch() {
        const form = document.getElementById('header-search-form');
        const input = document.getElementById('header-search-input');
        const panel = document.getElementById('search-suggestions');
        let timer;
        let activeIndex = -1;
        const close = function () { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); activeIndex = -1; };
        const open = function (query) {
            try {
                renderSuggestions(panel, query, activeIndex);
                input.setAttribute('aria-expanded', 'true');
            } catch (error) {
                panel.innerHTML = '<div class="suggestion-empty">Không thể tải gợi ý lúc này.</div>';
                panel.hidden = false;
                input.setAttribute('aria-expanded', 'true');
            }
        };
        input.addEventListener('focus', function () { open(input.value.trim()); });
        input.addEventListener('input', function () {
            window.clearTimeout(timer);
            const query = input.value.trim();
            activeIndex = -1;
            timer = window.setTimeout(function () { open(query); }, 300);
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            location.href = productsUrl(input.value.trim());
        });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') { close(); return; }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                if (panel.hidden) open(input.value.trim());
                const items = Array.from(panel.querySelectorAll('[data-suggestion]'));
                if (!items.length) return;
                activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
                open(input.value.trim());
            } else if (event.key === 'Enter' && activeIndex >= 0 && panel.querySelectorAll('[data-suggestion]')[activeIndex]) {
                event.preventDefault();
                location.href = panel.querySelectorAll('[data-suggestion]')[activeIndex].href;
            }
        });
        document.addEventListener('click', function (event) { if (!form.contains(event.target)) close(); });
        panel.addEventListener('mouseover', function (event) {
            const item = event.target.closest('[data-suggestion]');
            if (item) Array.from(panel.querySelectorAll('[data-suggestion]')).forEach(function (node) { node.classList.toggle('is-active', node === item); });
        });
    }

    const headerBox = document.getElementById('site-header');
    const footerBox = document.getElementById('site-footer');
    if (headerBox) {
        headerBox.innerHTML = headerHTML();
        renderUserBox();
        bindHeaderSearch();
        const menuToggle = document.querySelector('.hdr-menu-toggle');
        if (menuToggle) menuToggle.addEventListener('click', function () {
            const list = document.querySelector('.hdr-menu-list');
            const open = list.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(open));
        });
        if (globalThis.Notifications && typeof globalThis.Notifications.init === 'function') globalThis.Notifications.init(root);
    }
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
        const qtyInput = button.closest('.product-card')
            ? button.closest('.product-card').querySelector('[data-product-qty]')
            : document.getElementById('qty');
        const qty = qtyInput ? Number(qtyInput.value) : 1;
        const result = Cart.addToCart(productId, qty);
        refreshCartCount();
        notifyCart(result.ok ? 'Đã thêm sản phẩm vào giỏ hàng!' : result.error, result.ok);
    });
refreshCartCount();
})();
