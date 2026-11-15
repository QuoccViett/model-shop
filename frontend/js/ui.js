(function (global) {
    'use strict'

    const root = document.body.dataset.root || '';

    function imageSrc(src) {
        if (!src) {
            return '';
        }
        return /^(https?:)?\/\//i.test(src) || src.startsWith('idb:') ? src : root + src;
    }

    function imageAttrs(src) {
        const url = imageSrc(src);
        return global.ShopImages ? global.ShopImages.attrs(url) : 'src="' + Shop.escapeHtml(url) + '"';
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
                '<a class="pc-img" data-route="' + url + '">' +
                    '<img ' + imageAttrs(p.image) + ' alt="' + Shop.escapeHtml(p.name) + '" loading="lazy">' +
                        (hasSale ? '<span class="pc-badge">-' + p.sale_percent + '%</span>' : '') +
                '</a>' +
                '<div class="pc-body">' +
                    '<div class="pc-brand">' + Shop.escapeHtml(p.brand || '') + '</div>' +
                    '<a class="pc-name" data-route="' + url + '">' + Shop.escapeHtml(p.name) + '</a>' +
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

    // Render phân trang: nút trang trước/sau và dải số trang quanh trang hiện tại
    function pagination(page, totalPages, hrefOf) {
        totalPages = Math.max(1, Number(totalPages) || 1);
        page = Math.min(Math.max(1, Number(page) || 1), totalPages);
        if (totalPages <= 1) return '';

        const WINDOW = 2; // số trang hiển thị mỗi bên trang hiện tại
        const start = Math.max(1, page - WINDOW);
        const end = Math.min(totalPages, page + WINDOW);
        const pages = [];

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }
        for (let n = start; n <= end; n++) pages.push(n);
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        function link(n, text, ariaLabel, className, rel) {
            return '<a class="pagination-btn ' + className + '" data-route="' + Shop.escapeHtml(hrefOf(n)) + '"' +
                (rel ? ' rel="' + rel + '"' : '') + ' title="' + ariaLabel + '">' + text + '</a>';
        }
        function disabled(text, ariaLabel, className) {
            return '<span class="pagination-btn ' + className + ' is-disabled" title="' + ariaLabel + '" aria-disabled="true">' + text + '</span>';
        }

        const first = page > 1
            ? link(1, '&laquo;', 'Trang đầu', 'pagination-first', 'first')
            : disabled('&laquo;', 'Trang đầu', 'pagination-first');
        const prev = page > 1
            ? link(page - 1, '&lsaquo;', 'Trang trước', 'pagination-prev', 'prev')
            : disabled('&lsaquo;', 'Trang trước', 'pagination-prev');

        const next = page < totalPages
            ? link(page + 1, '&rsaquo;', 'Trang sau', 'pagination-next', 'next')
            : disabled('&rsaquo;', 'Trang sau', 'pagination-next');

        const last = page < totalPages
            ? link(totalPages, '&raquo;', 'Trang cuối', 'pagination-last', 'last')
            : disabled('&raquo;', 'Trang cuối', 'pagination-last');

        const list = pages.map(function (n) {
            if (n === '...') {
                return '<span class="pagination-ellipsis" aria-hidden="true">&hellip;</span>';
            }
            if (n === page) {
                return '<span class="pagination-page is-current" aria-current="page">' + n + '</span>';
            }
            return '<a class="pagination-page" data-route="' + Shop.escapeHtml(hrefOf(n)) + '" aria-label="Trang ' + n + '">' + n + '</a>';
        }).join('');

        return '<nav class="pagination" aria-label="Phân trang sản phẩm">' +
            first +
            prev +
            '<div class="pagination-pages">' + list + '</div>' +
            next +
            last +
            '</nav>';
    }
    
      global.UI = {
          productCard: productCard,
          productCardSkeleton: productCardSkeleton,
          productSkeletons: productSkeletons,
          pagination: pagination,
          imageSrc: imageSrc,
          imageAttrs: imageAttrs
      };
})(window);
