(function () {
    'use strict';
    const app = document.getElementById('app');
    const esc = Shop.escapeHtml;
    const money = Shop.formatPrice;

    function draw() {
        const lines = Cart.getCartDetailed();
        if (!lines.length) {
            app.innerHTML = '<div class="breadcrumb"><a href="../index.html">Trang chủ</a> / Giỏ hàng</div>' +
                '<div class="shop-empty"><h1>Giỏ hàng đang trống</h1><p>Hãy chọn sản phẩm mô hình bạn yêu thích.</p>' +
                '<a class="btn" href="products.html">Tiếp tục mua sắm</a></div>';
            return;
        }
        app.innerHTML = '<div class="breadcrumb"><a href="../index.html">Trang chủ</a> / Giỏ hàng</div>' +
            '<h1>Giỏ hàng của bạn (' + Cart.getCartCount() + ' sản phẩm)</h1>' +
            '<div class="shop-order-grid"><section class="shop-panel"><h2>Sản phẩm đã chọn</h2>' +
            lines.map(function (line) {
                const p = line.product;
                return '<div class="shop-cart-item">' +
                    '<a href="product.html?id=' + p.id + '"><img class="shop-cart-thumb" src="' + esc(UI.imageSrc(p.image)) + '" alt="' + esc(p.name) + '"></a>' +
                    '<div><a class="shop-cart-title" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a>' +
                    '<div class="shop-muted">Đơn giá: ' + money(line.unit_price) + '</div>' +
                    '<div class="shop-muted">Tồn kho: ' + line.stock + '</div>' +
                    (line.quantity > line.stock ? '<div class="shop-error">Số lượng vượt tồn kho.</div>' : '') + '</div>' +
                    '<div class="shop-cart-actions"><div><label for="cart-qty-' + p.id + '" class="shop-muted">Số lượng</label> ' +
                    '<input id="cart-qty-' + p.id + '" type="number" min="1" max="' + line.stock + '" step="1" value="' + line.quantity + '" data-cart-qty="' + p.id + '"></div>' +
                    '<strong>' + money(line.subtotal) + '</strong>' +
                    '<button class="shop-link-danger" type="button" data-remove="' + p.id + '">Xóa</button></div></div>';
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
    draw();
})();
