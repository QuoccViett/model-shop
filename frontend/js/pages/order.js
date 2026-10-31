(function () {
    'use strict';
    if (!Shop.getCurrentUser()) {
        location.replace('login.html?redirect=orders.html');
        return;
    }
    const app = document.getElementById('app');
    const esc = Shop.escapeHtml;
    const params = new URLSearchParams(location.search);
    const detail = Cart.getOrderDetail(params.get('id'));
    if (!detail) {
        app.innerHTML = '<div class="shop-empty"><h1>Không tìm thấy đơn hàng</h1><p>Đơn này không tồn tại hoặc không thuộc tài khoản của bạn.</p>' +
            '<a class="btn" href="orders.html">Về lịch sử đơn hàng</a></div>';
        return;
    }
    const order = detail.order;
    const success = params.get('success') === '1';
    const address = [order.ship_address_detail, order.ship_ward, order.ship_district, order.ship_city].filter(Boolean).join(', ');
    app.innerHTML = '<div class="breadcrumb"><a href="../index.html">Trang chủ</a> / ' +
        '<a href="orders.html">Đơn hàng của tôi</a> / Đơn #' + order.id + '</div>' +
        (success ? '<section class="shop-panel shop-confirmation"><span class="check">✓</span><h1>Đặt hàng thành công!</h1>' +
            '<p>Đơn hàng #' + order.id + ' đã được ghi nhận. Cửa hàng sẽ tiếp nhận và xử lý đơn.</p></section>' : '') +
        '<h1>Chi tiết đơn hàng #' + order.id + '</h1><section class="shop-panel">' +
        '<div class="shop-order-meta">' +
        '<div><strong>Ngày đặt hàng</strong>' + esc(order.order_date) + '</div>' +
        '<div><strong>Trạng thái</strong><span class="shop-status ' + esc(order.status) + '">' + esc(Cart.STATUS_TEXT[order.status] || order.status) + '</span></div>' +
        '<div><strong>Người nhận</strong>' + esc(order.receiver_name) + '<br>' + esc(order.receiver_phone) + '</div>' +
        '<div><strong>Địa chỉ giao hàng</strong>' + esc(address) + '</div>' +
        '<div><strong>Phương thức thanh toán</strong>' + esc(Cart.PAYMENTS[order.payment_method] || order.payment_method) + '</div>' +
        '</div></section><section class="shop-panel"><h2>Sản phẩm trong đơn</h2>' +
        '<div style="overflow-x:auto"><table class="shop-table"><thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr></thead><tbody>' +
        detail.items.map(function (item) {
            const p = item.product;
            return '<tr><td>' + (p ? '<a class="shop-text-link" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a>' :
                'Sản phẩm #' + item.product_id + ' (đã xóa)') + '</td><td>' + Shop.formatPrice(item.unit_price) + '</td>' +
                '<td>' + item.quantity + '</td><td>' + Shop.formatPrice(item.subtotal) + '</td></tr>';
        }).join('') + '</tbody></table></div><div class="shop-summary-line shop-summary-total"><span>Tổng tiền đơn hàng</span><strong>' +
        Shop.formatPrice(order.total_amount) + '</strong></div></section>' +
        '<a href="orders.html" class="btn">Xem tất cả đơn hàng</a> ' +
        '<a href="products.html" class="shop-text-link" style="margin-left:15px">Tiếp tục mua sắm</a>';
})();
