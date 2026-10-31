(function () {
    'use strict';
    const user = Shop.getCurrentUser();
    if (!user) {
        location.replace('login.html?redirect=checkout.html');
        return;
    }
    const lines = Cart.getCartDetailed();
    const app = document.getElementById('app');
    const esc = Shop.escapeHtml;
    const money = Shop.formatPrice;
    if (!lines.length) {
        app.innerHTML = '<div class="shop-empty"><h1>Giỏ hàng đang trống</h1><p>Không có sản phẩm để thanh toán.</p>' +
            '<a class="btn" href="products.html">Chọn sản phẩm</a></div>';
        return;
    }

    const hasSaved = Boolean(user.address_detail && user.ward && user.district && user.city);
    const savedAddr = [user.address_detail, user.ward, user.district, user.city].filter(Boolean).join(', ');
    function field(name, label, value, placeholder, wide) {
        return '<div class="form-group' + (wide ? ' wide' : '') + '"><label for="addr-' + name + '">' + label + ' *</label>' +
            '<input id="addr-' + name + '" name="' + name + '" type="text" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '') + '" required></div>';
    }
    const addressForm = field('receiver', 'Họ tên người nhận', user.full_name, 'Người nhận') +
        field('phone', 'Số điện thoại', user.phone, '09xxxxxxxx') +
        field('address_detail', 'Số nhà - tên đường', '', 'Ví dụ: 12 Nguyễn Huệ', true) +
        field('ward', 'Phường / Xã', '', 'Tên phường hoặc xã') +
        field('district', 'Quận / Huyện', '', 'Tên quận hoặc huyện') +
        field('city', 'Tỉnh / Thành phố', '', 'Ví dụ: TP. Hồ Chí Minh', true);

    app.innerHTML = '<div class="breadcrumb"><a href="../index.html">Trang chủ</a> / <a href="cart.html">Giỏ hàng</a> / Thanh toán</div>' +
        '<h1>Thông tin thanh toán</h1><div class="shop-order-grid"><div>' +
        '<section class="shop-panel"><h2>Địa chỉ giao hàng</h2>' +
        (hasSaved ? '<label class="shop-choice"><input type="radio" name="address-source" value="saved" checked>' +
            '<span><strong>Dùng địa chỉ đã lưu</strong><br>' + esc(user.full_name) + ' — ' + esc(user.phone) +
            '<br><span class="shop-muted">' + esc(savedAddr) + '</span></span></label>' : '') +
        '<label class="shop-choice"><input type="radio" name="address-source" value="new"' + (hasSaved ? '' : ' checked') + '>' +
            '<span><strong>Nhập địa chỉ giao hàng mới</strong><br><span class="shop-muted">Có thể sử dụng địa chỉ khác với tài khoản.</span></span></label>' +
        '<div id="new-address"' + (hasSaved ? ' hidden' : '') + '><div class="shop-address-grid">' + addressForm + '</div></div>' +
        '</section><section class="shop-panel"><h2>Phương thức thanh toán</h2>' +
        Object.keys(Cart.PAYMENTS).map(function (key) {
            return '<label class="shop-choice"><input type="radio" name="payment" value="' + key + '"' +
                (key === 'cod' ? ' checked' : '') + '><span>' + esc(Cart.PAYMENTS[key]) + '</span></label>';
        }).join('') +
        '<p class="shop-payment-note">Chuyển khoản và thanh toán trực tuyến chỉ mô phỏng lựa chọn phương thức trong đồ án; không thu tiền thật.</p>' +
        '</section></div><aside class="shop-panel"><h2>Đơn hàng của bạn</h2>' +
        lines.map(function (l) {
            return '<div class="shop-invoice-item"><span>' + esc(l.product.name) + ' <b>× ' + l.quantity + '</b></span><strong>' + money(l.subtotal) + '</strong></div>';
        }).join('') +
        '<div class="shop-summary-line shop-summary-total"><span>Tổng cộng</span><strong>' + money(Cart.getCartTotal()) + '</strong></div>' +
        '<div id="checkout-error" class="shop-error" hidden></div>' +
        '<button id="place-order" class="btn shop-block-button" type="button">Xác nhận đặt hàng</button>' +
        '<a href="cart.html" class="shop-outline-link">Quay lại giỏ hàng</a></aside></div>';

    const newAddress = document.getElementById('new-address');
    document.querySelectorAll('input[name="address-source"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            newAddress.hidden = document.querySelector('input[name="address-source"]:checked').value !== 'new';
        });
    });
    document.getElementById('place-order').addEventListener('click', function () {
        const btn = this;
        const source = document.querySelector('input[name="address-source"]:checked').value;
        const errorBox = document.getElementById('checkout-error');
        const address = source === 'saved'
            ? {
                receiver: user.full_name, phone: user.phone, address_detail: user.address_detail,
                ward: user.ward, district: user.district, city: user.city
            }
            : {
                receiver: document.getElementById('addr-receiver').value,
                phone: document.getElementById('addr-phone').value,
                address_detail: document.getElementById('addr-address_detail').value,
                ward: document.getElementById('addr-ward').value,
                district: document.getElementById('addr-district').value,
                city: document.getElementById('addr-city').value
            };
        const payment = document.querySelector('input[name="payment"]:checked').value;
        btn.disabled = true;
        const result = Cart.placeOrder(address, payment);
        if (!result.ok) {
            errorBox.textContent = result.error;
            errorBox.hidden = false;
            errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            btn.disabled = false;
            return;
        }
        location.href = 'order.html?id=' + result.order_id + '&success=1';
    });
})();
