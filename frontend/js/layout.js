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

    // Render phần header và ô tìm kiếm có vùng gợi ý.
    function headerHTML() {
        const menu = MENU.map(function (m) { return menuLink(m.href, m.label, m.key); }).join('');
        return '<div class="topbar"><div class="container"><span>Hotline: 0900 000 000</span><div class="user-box" id="user-box"></div></div></div>' +
            '<header class="header"><div class="container"><a class="logo" href="' + root + 'index.html">ModelShop</a>' +
            '<form class="search-form" id="header-search-form" role="search" action="' + productsUrl('') + '" method="get" autocomplete="off">' +
            '<div class="search-control"><input id="header-search-input" type="search" name="q" placeholder="Tìm mô hình theo tên..." aria-label="Tìm sản phẩm" aria-autocomplete="list" aria-controls="search-suggestions" aria-expanded="false">' +
            '<div class="search-suggestions" id="search-suggestions" role="listbox" hidden></div></div><button type="submit">Tìm</button></form>' +
            '<a class="cart-link" href="' + root + 'pages/cart.html">Giỏ hàng<span class="cart-count" id="cart-count">0</span></a></div></header>' +
            '<nav class="main-nav"><div class="container">' + menu + '</div></nav>';
    }

    // Hiển thị thông tin đăng nhập của khách hàng.
    function renderUserBox() {
        const box = document.getElementById('user-box');
        const user = Shop.getCurrentUser();
        if (!user) {
            box.innerHTML = '<a href="' + root + 'pages/login.html">Đăng nhập</a><a href="' + root + 'pages/register.html">Đăng ký</a>';
            return;
        }
        box.innerHTML = '<span>Xin chào, <a href="' + root + 'pages/profile.html"><strong>' + Shop.escapeHtml(user.full_name) + '</strong></a></span><a href="#" id="logout-link">Đăng xuất</a>';
        document.getElementById('logout-link').addEventListener('click', function (e) {
            e.preventDefault();
            Shop.logoutCustomer();
            location.href = root + 'index.html';
        });
    }

    // Render footer cùng danh sách danh mục.
    function footerHTML() {
        const cats = Shop.getCategories().map(function (c) {
            return '<li><a href="' + root + 'pages/products.html?category=' + encodeURIComponent(c.id) + '">' + Shop.escapeHtml(c.name) + '</a></li>';
        }).join('');
        return '<footer class="footer"><div class="container"><div><h4>ModelShop</h4><p>Cửa hàng mô hình Gundam, Figure, xe mô hình, mô hình quân sự và phụ kiện.</p></div>' +
            '<div><h4>Danh mục</h4><ul>' + cats + '</ul></div><div><h4>Liên hệ</h4><ul><li>Hotline: 0900 000 000</li><li>Email: shop@example.com</li></ul></div>' +
            '<div class="copyright">© 2026 ModelShop. Đồ án môn học.</div></div></footer>';
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
    if (headerBox) { headerBox.innerHTML = headerHTML(); renderUserBox(); bindHeaderSearch(); }
    if (footerBox) footerBox.innerHTML = footerHTML();
})();
