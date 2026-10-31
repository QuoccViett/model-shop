(function () {
    'use strict';
    if (!Shop.getCurrentUser()) {
        location.replace('login.html?redirect=orders.html');
        return;
    }
    const app = document.getElementById('app');
    const esc = Shop.escapeHtml;
    const orders = Cart.getMyOrders();
    app.innerHTML = '<div class="breadcrumb"><a href="../index.html">Trang chủ</a> / ' +
        '<a href="profile.html">Tài khoản</a> / Đơn hàng của tôi</div><h1>Lịch sử mua hàng</h1>' +
        (orders.length ? orders.map(function (details) {
            const order = details.order;
            const status = Cart.STATUS_TEXT[order.status] || order.status;
            return '<article class="shop-panel shop-order-card"><div class="shop-order-head"><div><strong>Đơn hàng #' + order.id + '</strong>' +
                '<div class="shop-muted">Ngày đặt: ' + esc(order.order_date) + '</div></div>' +
                '<span class="shop-status ' + esc(order.status) + '">' + esc(status) + '</span></div>' +
                '<div class="shop-muted">' + details.items.length + ' loại sản phẩm · ' +
                esc(Cart.PAYMENTS[order.payment_method] || order.payment_method) + '</div>' +
                '<div class="shop-order-footer"><span>Tổng tiền: <strong>' + Shop.formatPrice(order.total_amount) + '</strong></span>' +
                '<a class="btn" href="order.html?id=' + order.id + '">Xem chi tiết</a></div></article>';
        }).join('') : '<div class="shop-empty"><h2>Bạn chưa có đơn hàng nào</h2><p>Hãy khám phá sản phẩm của ModelShop.</p>' +
            '<a class="btn" href="products.html">Xem sản phẩm</a></div>');
})();
