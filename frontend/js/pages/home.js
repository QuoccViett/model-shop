(function () {
    'use strict'

    const esc = Shop.escapeHtml;

    const SLIDES = [
        {
            cls: 'slide-1',
            title: 'Gundam mới về',
            text: 'HG, RG, MG chính hãng Bandai',
            button: 'Xem Gundam',
            link: 'pages/products.html?category=1'
        }
    ];

    const maxSale = Math.max.apply(null, Shop.getOnSale(100).map(function (p) { return p.sale_percent; }).concat(0));
    if (maxSale > 0) {
        SLIDES.push(
            {
                cls: 'slide-2',
                title: 'Săn sale mô hình',
                text: 'Giảm đến ' + maxSale + '% cho nhiều sản phẩm',
                button: 'Xem khuyến mãi',
                link: 'pages/products.html?sale=1'
            }
        )
    }
    SLIDES.push(
        {
            cls: 'slide-3',
            title: 'Phụ kiện & dụng cụ',
            text: 'Kìm cắt, sơn, keo cho người lắp ráp',
            button: 'Xem phụ kiện',
            link: 'pages/products.html?category=5'
        }
    );

    const slider = document.getElementById('slider');
    slider.innerHTML =
        SLIDES.map(function (s, i) {
            return '<div class="slide ' + s.cls + (i === 0 ? ' active' : '') + '">' +
                '<h2>' + s.title + '</h2><p>' + s.text + '</p>' +
                '<a class="btn" href="' + s.link + '">' + s.button + '</a></div>';
        }).join('') +
        '<button type="button" class="slider-arrow slider-prev">&lsaquo;</button>' +
        '<button type="button" class="slider-arrow slider-next">&rsaquo;</button>' +
        '<div class="slider-dots">' +
        SLIDES.map(function (s, i) { return '<button type="button" data-i="' + i + '"' + (i === 0 ? ' class="active"' : '') + '></button>'; }).join('') +
        '</div>';

    const slideEls = slider.querySelectorAll('.slide');
    const dotEls = slider.querySelectorAll('.slider-dots button');
    let current = 0;
    let timer = null;

    function show(n) {
        current = (n + slideEls.length) % slideEls.length;
        slideEls.forEach(function (el, i) { el.classList.toggle('active', i === current); });
        dotEls.forEach(function (el, i) { el.classList.toggle('active', i === current); });
    }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(function () { show(current + 1); }, 5000);
    }

    slider.querySelector('.slider-prev').addEventListener('click', function () { show(current - 1); });
    slider.querySelector('.slider-next').addEventListener('click', function () { show(current + 1); });
    dotEls.forEach(function (el) {
        el.addEventListener('click', function () { show(Number(el.dataset.i)); });
    });
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', startAuto);
    startAuto();

    document.getElementById('category-grid').innerHTML = Shop.getCategories().map(function (c) {
        const count = Shop.queryProducts({ categoryId: c.id }).length;
        return '<a class="category-tile" href="pages/products.html?category=' + c.id + '">' +
            '<strong>' + esc(c.name) + '</strong><span>' + count + ' sản phẩm</span></a>';
    }).join('');

    document.getElementById('brand-list').innerHTML = Shop.getBrands().map(function (b) {
        return '<a class="brand-chip" href="pages/products.html?brand=' + encodeURIComponent(b) + '">' + esc(b) + '</a>';
    }).join('');

    function productSection(title, list, moreHref) {
        if (!list.length) return '';
        const gridId = 'home-products-' + title.replace(/\s+/g, '-').toLocaleLowerCase();
        setTimeout(function () {
            const grid = document.getElementById(gridId);
            if (grid) grid.innerHTML = list.map(UI.productCard).join('');
        }, 400);
        return '<section class="home-section">' +
            '<div class="section-head"><h2>' + title + '</h2><a href="' + moreHref + '">Xem tất cả &rsaquo;</a></div>' +
            '<div class="product-grid cols-4" id="' + gridId + '">' + UI.productSkeletons(list.length) + '</div>' +
            '</section>';
    }

    document.getElementById('product-sections').innerHTML =
        productSection('Sản phẩm bán chạy', Shop.getBestSellers(4), 'pages/products.html?sort=bestseller') +
        productSection('Mới nhập kho', Shop.getNewest(4), 'pages/products.html?sort=newest') +
        productSection('Đang giảm giá', Shop.getOnSale(4), 'pages/products.html?sale=1');

})();``