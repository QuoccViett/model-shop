(function () {
    'use strict'

    // Đọc ID từ URL nội bộ và chỉ cập nhật vùng nội dung chi tiết, giữ nguyên khung trang
    const app = document.getElementById('app');
    const esc = Shop.escapeHtml;
    const productId = new URLSearchParams(App.location.search).get('id');
    const p = Shop.getProductById(productId);

    // ID không hợp lệ hiển thị thông báo cùng đường dẫn quay lại danh sách
    if (!p) {
        document.title = 'Không tìm thấy sản phẩm';
        app.innerHTML = '<div class="empty-box">Không tìm thấy sản phẩm này. ' +
            '<a data-route="products.html"><strong>Xem tất cả sản phẩm</strong></a></div>';
        return;
    }

    const category = Shop.getCategoryById(p.category_id);
    const price = Shop.getPrice(p);
    const salePrice = Shop.getSalePrice(p);
    const hasSale = Number(p.sale_percent) > 0;
    const soldOut = p.stock_qty <= 0;

    // Đồng bộ nhãn tồn kho và trạng thái nút mua theo lượng hàng hiện tại
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
    const images = (Array.isArray(p.images) && p.images.length ? p.images : [p.image]).filter(Boolean).slice(0, 2);

    // Dựng thông tin và thư viện ảnh cùng lượt khởi tạo của router trước khi gắn listener
    app.innerHTML = '' +
        '<div class="breadcrumb">' +
        '<a data-route="../index.html">Trang chủ</a> / ' +
        '<a data-route="products.html">Sản phẩm</a> / ' +
        '<a data-route="products.html?category=' + category.id + '">' + esc(category.name) + '</a> / ' + esc(p.name) +
        '</div>' +

        '<div class="detail">' +
        '<div class="detail-gallery">' +
        '<div class="detail-img"><img id="detail-main-image" ' + UI.imageAttrs(images[0] || '') + ' alt="' + esc(p.name) + '"></div>' +
        '<div class="detail-thumbnails" aria-label="Ảnh sản phẩm">' +
        images.map(function (image, index) {
            return '<button type="button" class="detail-thumbnail' + (index === 0 ? ' active' : '') + '" data-image-index="' + index + '" aria-label="Xem ảnh ' + (index + 1) + '" aria-pressed="' + (index === 0) + '">' +
                '<img ' + UI.imageAttrs(image) + ' alt=""></button>';
        }).join('') +
        '</div></div>' +
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

    // Listener thuộc scope trang, chỉ áp dụng ảnh bất đồng bộ nếu lựa chọn chưa thay đổi
    const mainImage = document.getElementById('detail-main-image');
    let selectedImageIndex = 0;
    document.querySelectorAll('.detail-thumbnail').forEach(function (button) {
        button.addEventListener('click', function () {
            const index = Number(button.dataset.imageIndex);
            selectedImageIndex = index;
            delete mainImage.dataset.imageRef;
            const image = images[index];
            // Ảnh IndexedDB cần Promise để lấy URL, ảnh thông thường dùng đường dẫn từ UI
            const source = image.startsWith('idb:') ? ShopImages.url(image) : Promise.resolve(UI.imageSrc(image));
            source.then(function (url) {
                if (selectedImageIndex === index) mainImage.src = url;
            });
            document.querySelectorAll('.detail-thumbnail').forEach(function (item) {
                const active = item === button;
                item.classList.toggle('active', active);
                item.setAttribute('aria-pressed', String(active));
            });
        });
    });

    const qty = document.getElementById('qty');
    if (qty) {
        // Nhận số lượng n và giới hạn từ một đến tồn kho cho nút cộng, trừ và ô nhập
        function setQty(n) {
            qty.value = Math.min(Math.max(1, n), p.stock_qty);
        }
        document.getElementById('qty-minus').addEventListener('click', function () { setQty(Number(qty.value) - 1); });
        document.getElementById('qty-plus').addEventListener('click', function () { setQty(Number(qty.value) + 1); });
        qty.addEventListener('change', function () { setQty(parseInt(qty.value, 10) || 1); });
    }

    // Lấy tối đa bốn sản phẩm cùng danh mục, bỏ sản phẩm đang xem
    const related = Shop.getVisibleProducts().filter(function (x) {
        return x.category_id === p.category_id && x.id !== p.id;
    }).slice(0, 4);

    if (related.length) {
        // Render card có sẵn ngay, không dùng skeleton hoặc timer tạo thêm lần thay DOM
        const cards = related.map(function (product) {
            return UI.productCard(product, { hideQuantity: true });
        }).join('');
        app.insertAdjacentHTML('beforeend',
            '<section class="related"><h2>Sản phẩm cùng loại</h2>' +
            '<div class="product-grid" id="related-product-grid">' + cards + '</div></section>');
    }
})();
