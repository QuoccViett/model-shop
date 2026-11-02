(function () {
    'use strict'

    const app = document.getElementById('app');
    const esc = Shop.escapeHtml;
    const productId = new URLSearchParams(location.search).get('id');
    const p = Shop.getProductById(productId);

    if (!p) {
        document.title = 'Không tìm thấy sản phẩm';
        app.innerHTML = '<div class="empty-box">Không tìm thấy sản phẩm này. ' +
            '<a href="products.html"><strong>Xem tất cả sản phẩm</strong></a></div>';
        return;
    }

    const category = Shop.getCategoryById(p.category_id);
    const price = Shop.getPrice(p);
    const salePrice = Shop.getSalePrice(p);
    const hasSale = Number(p.sale_percent) > 0;
    const soldOut = p.stock_qty <= 0;

    let stockClass = 'in';
    let stockText = 'Còn hàng';
    if (soldOut) {
        stockClass = 'out';
        stockText = 'Hết hàng';
    } else if (p.stock_qty <= p.low_stock_threshold) {
        stockClass = 'low';
        stockText = 'Chỉ còn ' + p.stock_qty + ' sản phẩm';
    }

    const specs = [
        ['Mã sản phẩm', p.code],
        ['Loại', category.name],
        ['Hãng', p.brand],
        ['Tỉ lệ', p.scale],
        ['Chất liệu', p.material],
        ['Kích thước', p.size]
    ].filter(function (row) { return row[1]; });

    document.title = p.name + ' - ModelShop';

    app.innerHTML = '' +
        '<div class="breadcrumb">' +
        '<a href="../index.html">Trang chủ</a> / ' +
        '<a href="products.html">Sản phẩm</a> / ' +
        '<a href="products.html?category=' + category.id + '">' + esc(category.name) + '</a> / ' + esc(p.name) +
        '</div>' +

        '<div class="detail">' +
        '<div class="detail-img"><img src="' + esc(UI.imageSrc(p.image)) + '" alt="' + esc(p.name) + '"></div>' +
        '<div class="detail-info">' +
        '<div class="detail-brand">' + esc(p.brand || '') + '</div>' +
        '<h1>' + esc(p.name) + '</h1>' +
        '<div class="stock ' + stockClass + '">' + stockText + '</div>' +
        '<div class="detail-price">' +
        '<span class="now">' + Shop.formatPrice(salePrice) + '</span>' +
        (hasSale ? '<del class="old">' + Shop.formatPrice(price) + '</del><span class="off">-' + p.sale_percent + '%</span>' : '') +
        '</div>' +
        '<div class="buy-row">' +
        (soldOut ? '' :
            '<div class="qty">' +
            '<button type="button" id="qty-minus">&minus;</button>' +
            '<input type="number" id="qty" value="1" min="1" max="' + p.stock_qty + '">' +
            '<button type="button" id="qty-plus">+</button>' +
            '</div>') +
        '<button type="button" class="btn" data-add-to-cart="' + p.id + '"' + (soldOut ? ' disabled' : '') + '>' +
        (soldOut ? 'Hết hàng' : 'Thêm vào giỏ hàng') +
        '</button>' +
        '</div>' +
        '<table class="spec-table">' +
        specs.map(function (row) { return '<tr><th>' + row[0] + '</th><td>' + esc(row[1]) + '</td></tr>'; }).join('') +
        '</table>' +
        '</div>' +
        '</div>' +

        '<div class="section-box"><h2>Mô tả sản phẩm</h2><p>' + esc(p.description || 'Chưa có mô tả.') + '</p></div>';

    const qty = document.getElementById('qty');
    if (qty) {
        function setQty(n) {
            qty.value = Math.min(Math.max(1, n), p.stock_qty);
        }
        document.getElementById('qty-minus').addEventListener('click', function () { setQty(Number(qty.value) - 1); });
        document.getElementById('qty-plus').addEventListener('click', function () { setQty(Number(qty.value) + 1); });
        qty.addEventListener('change', function () { setQty(parseInt(qty.value, 10) || 1); });
    }

    const related = Shop.getVisibleProducts().filter(function (x) {
        return x.category_id === p.category_id && x.id !== p.id;
    }).slice(0, 4);

    if (related.length) {
        app.insertAdjacentHTML('beforeend',
            '<section class="related"><h2>Sản phẩm cùng loại</h2>' +
            '<div class="product-grid" id="related-product-grid">' + UI.productSkeletons(related.length) + '</div></section>');
        // Render card sản phẩm liên quan sau khi skeleton hoàn tất
        setTimeout(function () {
            const relatedGrid = document.getElementById('related-product-grid');
            if (relatedGrid) relatedGrid.innerHTML = related.map(function (product) {
                return UI.productCard(product, { hideQuantity: true });
            }).join('');
        }, 400);
    }
})();
