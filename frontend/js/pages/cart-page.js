(function () {
    'use strict';
    const app = document.getElementById('app');
    const esc = Shop.escapeHtml;
    const money = Shop.formatPrice;
    let renderedSnapshot;
    const shownWarnings = [];

    function draw() {
        const lines = Cart.getCartDetailed();
        renderedSnapshot = Cart.getCartSnapshot();
        Cart.takeCartWarnings().forEach(function (item) {
            shownWarnings.push(item);
        });
        const notice = shownWarnings.length ? '<div class="shop-error" role="alert">' + shownWarnings.map(function (item) {
            return '<div>' + esc(item.name) + ': Sản phẩm đã ngừng kinh doanh và tự động xóa khỏi giỏ hàng.</div>';
        }).join('') + '</div>' : '';
        if (!lines.length) {
            app.innerHTML = '<div class="breadcrumb"><a href="../index.html">Trang chủ</a> / Giỏ hàng</div>' +
                '<div class="shop-empty"><h1>Giỏ hàng đang trống</h1><p>Hãy chọn sản phẩm mô hình bạn yêu thích.</p>' +
                '<a class="btn" href="products.html">Tiếp tục mua sắm</a></div>';
            app.insertAdjacentHTML('afterbegin', notice);
            return;
        }
        app.innerHTML = '<div class="breadcrumb"><a href="../index.html">Trang chủ</a> / Giỏ hàng</div>' +
            notice + '<h1>Giỏ hàng của bạn (' + Cart.getCartCount() + ' sản phẩm)</h1>' +
            '<div class="shop-order-grid"><section class="shop-panel"><h2>Sản phẩm đã chọn</h2>' +
            lines.map(function (line) {
                const p = line.product;
                return '<div class="shop-cart-item">' +
                    '<a href="product.html?id=' + p.id + '"><img class="shop-cart-thumb" ' + UI.imageAttrs(p.image) + ' alt="' + esc(p.name) + '"></a>' +
                    '<div><a class="shop-cart-title" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a>' +
                    '<div class="shop-muted">Đơn giá: ' + money(line.unit_price) + '</div>' +
                    '<div class="shop-muted">Tồn kho: ' + line.stock + '</div>' +
                    (line.quantity > line.stock ? '<div class="shop-error">Số lượng vượt tồn kho.</div>' : '') + '</div>' +
                    '<div class="shop-cart-actions"><div class="shop-quantity-group"><span class="shop-muted">Số lượng</span>' +
                    '<div class="shop-quantity-control"><button type="button" aria-label="Giảm số lượng" data-qty-minus="' + p.id + '">&minus;</button>' +
                    '<input id="cart-qty-' + p.id + '" type="number" min="1" max="' + line.stock + '" step="1" value="' + line.quantity + '" data-cart-qty="' + p.id + '">' +
                    '<button type="button" aria-label="Tăng số lượng" data-qty-plus="' + p.id + '">+</button></div></div>' +
                    '<strong class="shop-cart-subtotal">' + money(line.subtotal) + '</strong>' +
                    '<button class="shop-remove-button" type="button" data-remove="' + p.id + '"> Xóa </button></div></div>';
            }).join('') + '</section>' +
            '<aside class="shop-panel"><h2>Tóm tắt giỏ hàng</h2>' +
            '<div class="shop-summary-line"><span>Số lượng</span><strong>' + Cart.getCartCount() + '</strong></div>' +
            '<div class="shop-summary-line shop-summary-total"><span>Tổng cộng</span><strong>' + money(Cart.getCartTotal()) + '</strong></div>' +
            '<a href="checkout.html" class="btn shop-block-button">Tiến hành thanh toán</a>' +
            '<a class="shop-outline-link" href="products.html">Tiếp tục mua sắm</a></aside></div>' +
            '<p class="shop-muted">Giá được tính lại theo giá bán hiện tại khi đặt hàng.</p>' +
            '<div class="shop-error" id="cart-error" hidden></div>';
    }
    app.addEventListener('click', function (e) {
        if (e.target.closest('a[href="checkout.html"]') && Cart.getCartSnapshot() !== renderedSnapshot) {
            e.preventDefault();
            draw();
            alert('Giỏ hàng đã thay đổi. Vui lòng xem lại trước khi thanh toán.');
            return;
        }
        const step = e.target.closest('[data-qty-minus], [data-qty-plus]');
        if (step) {
            const productId = step.dataset.qtyMinus || step.dataset.qtyPlus;
            const input = document.getElementById('cart-qty-' + productId);
            const next = Number(input.value) + (step.hasAttribute('data-qty-plus') ? 1 : -1);
            const result = Cart.updateQuantity(productId, next);
            if (!result.ok) alert(result.error);
            draw();
            const badge = document.getElementById('cart-count');
            if (badge) badge.textContent = Cart.getCartCount();
            return;
        }
        const remove = e.target.closest('[data-remove]');
        if (!remove) return;
        Cart.removeFromCart(remove.dataset.remove);
        draw();
        const badge = document.getElementById('cart-count');
        if (badge) badge.textContent = Cart.getCartCount();
    });
    app.addEventListener('change', function (e) {
        const qty = e.target.closest('[data-cart-qty]');
        if (!qty) return;
        const result = Cart.updateQuantity(qty.dataset.cartQty, qty.value);
        if (!result.ok) alert(result.error);
        draw();
        const badge = document.getElementById('cart-count');
        if (badge) badge.textContent = Cart.getCartCount();
    });
    window.addEventListener('storage', draw);
    window.addEventListener('modelshop:db-updated', draw);
    window.addEventListener('modelshop:cart-updated', draw);
    window.addEventListener('focus', draw);
    draw();
})();
