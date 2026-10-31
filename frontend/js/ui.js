(function (global) {
    'use strict'

    const root = document.body.dataset.root || '';

    function imageSrc(src) {
        if (!src) {
            return '';
        }
        return /^(https?:)?\/\//i.test(src) ? src : root + src;
    }

    // Render thẻ sản phẩm dùng chung trong danh sách
    function productCard(p, options) {
        options = options || {};
        const price = Shop.getPrice(p);
        const salePrice = Shop.getSalePrice(p);
        const hasSale = Number(p.sale_percent) > 0;
        const soldOut = p.stock_qty <= 0;
        const url = root + 'pages/product.html?id=' + encodeURIComponent(p.id);

        return '' +
            '<article class="product-card">' +
                '<a class="pc-img" href="' + url + '">' +
                    '<img src="' + Shop.escapeHtml(imageSrc(p.image)) + '" alt="' + Shop.escapeHtml(p.name) + '" loading="lazy">' +
                        (hasSale ? '<span class="pc-badge">-' + p.sale_percent + '%</span>' : '') +
                '</a>' +
                '<div class="pc-body">' +
                    '<div class="pc-brand">' + Shop.escapeHtml(p.brand || '') + '</div>' +
                    '<a class="pc-name" href="' + url + '">' + Shop.escapeHtml(p.name) + '</a>' +
                    '<div class="pc-price">' +
                        '<span class="pc-now">' + Shop.formatPrice(salePrice) + '</span>' +
                            (hasSale ? '<del class="pc-old">' + Shop.formatPrice(price) + '</del>' : '') +
                    '</div>' +
                    (options.hideQuantity ? '' : '<div class="pc-quantity"><label for="product-qty-' + p.id + '">Số lượng</label><input id="product-qty-' + p.id + '" type="number" min="1" max="' + p.stock_qty + '" step="1" value="1" data-product-qty="' + p.id + '"' + (soldOut ? ' disabled' : '') + '></div>') +
                    '<button type="button" class="btn pc-buy" data-add-to-cart="' + p.id + '"' + (soldOut ? ' disabled' : '') + '>' +
                        (soldOut ? 'Hết hàng' : 'Thêm vào giỏ') +
                    '</button>' +
                '</div>' +
            '</article>';
    }

    // Tạo component card skeleton cho trạng thái đang tải
    function productCardSkeleton() {
        return '' +
            '<article class="product-card-skeleton" aria-hidden="true">' +
                '<div class="product-card-skeleton-img"></div>' +
                '<div class="product-card-skeleton-body">' +
                    '<span class="product-card-skeleton-line product-card-skeleton-brand"></span>' +
                    '<span class="product-card-skeleton-line product-card-skeleton-name"></span>' +
                    '<span class="product-card-skeleton-line product-card-skeleton-name short"></span>' +
                    '<span class="product-card-skeleton-line product-card-skeleton-price"></span>' +
                    '<span class="product-card-skeleton-button"></span>' +
                '</div>' +
            '</article>';
    }

    // Tạo nhiều card skeleton theo số lượng cần hiển thị
    function productSkeletons(count) {
        return Array.from({ length: count }, productCardSkeleton).join('');
    }

    function pagination(page, totalPages, hrefOf){
        if (totalPages <= 1) return '';
        function link(n, label) {
            return '<a href="' + Shop.escapeHtml(hrefOf(n)) + '">' + label + '</a>';
        }

        const items = [];
        items.push(page > 1 ? link(page - 1, '&laquo;') : '<span class="disabled">&laquo;</span>');


        let last = 0;
        for (let n = 1; n <= totalPages; n++) {
            if (n === 1 || n === totalPages || Math.abs(n-page) < 1) {
                if (n - last > 1) items.push('<span class="disabled">&hellip;</span>');
                items.push(n === page ? '<span class="current">' + n + '</span>' : link(n, n));
                last = n;
            }
        }
        items.push(page < totalPages ? link(page + 1, '&raquo;') : '<span class="disabled">&raquo;</span>');
        return '<nav class="pagination">' + items.join('') + '</nav>';
    }
    
      global.UI = {
          productCard: productCard,
          productCardSkeleton: productCardSkeleton,
          productSkeletons: productSkeletons,
          pagination: pagination,
          imageSrc: imageSrc
      };
})(window);
