(function () {
    'use strict';
    const user = Shop.getCurrentUser();
    if (!user) {
        App.location.replace('login.html?redirect=checkout.html');
        return;
    }
    const lines = Cart.getCartDetailed();
    const cartSnapshot = Cart.getCartSnapshot();
    const app = document.getElementById('app');
    const esc = Shop.escapeHtml;
    const money = Shop.formatPrice;
    const subtotal = Cart.getCartTotal();
    const shippingFee = subtotal >= 1000000 ? 0 : 30000;
    if (!lines.length) {
        app.innerHTML = '<div class="shop-empty"><h1>Giỏ hàng đang trống</h1><p>Không có sản phẩm để thanh toán.</p>' +
            '<a class="btn" data-route="products.html">Chọn sản phẩm</a></div>';
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

    app.innerHTML = '<div class="breadcrumb"><a data-route="../index.html">Trang chủ</a> / <a data-route="cart.html">Giỏ hàng</a> / Thanh toán</div>' +
        '<h1>Thông tin thanh toán</h1><div class="shop-order-grid"><div>' +
        '<section class="shop-panel"><h2>Địa chỉ giao hàng</h2>' +
        (hasSaved ? '<label class="shop-choice"><input type="radio" name="address-source" value="saved" checked>' +
            '<span><strong>Dùng địa chỉ đã lưu</strong><br>' + esc(user.full_name) + ' — ' + esc(user.phone) +
            '<br><span class="shop-muted">' + esc(savedAddr) + '</span></span></label>' : '') +
        '<label class="shop-choice"><input type="radio" name="address-source" value="new"' + (hasSaved ? '' : ' checked') + '>' +
            '<span><strong>Nhập địa chỉ giao hàng mới</strong><br><span class="shop-muted">Có thể sử dụng địa chỉ khác với tài khoản.</span></span></label>' +
        '<div id="new-address"' + (hasSaved ? ' hidden' : '') + '><div class="shop-address-grid">' + addressForm + '</div></div>' +
        '<div class="checkout-notes"><label for="order-note">Ghi chú đơn hàng</label><textarea id="order-note" rows="3" placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."></textarea></div>' +
        '</section><section class="shop-panel"><h2>Phương thức thanh toán</h2>' +
        Object.keys(Cart.PAYMENTS).map(function (key) {
            return '<label class="shop-choice"><input type="radio" name="payment" value="' + key + '"' +
                (key === 'cod' ? ' checked' : '') + '><span>' + esc(Cart.PAYMENTS[key]) + '</span></label>';
        }).join('') +
        '<div id="online-payment-info" class="online-payment-info" hidden><strong>Chọn hình thức thanh toán trực tuyến</strong><div class="payment-channel-list">' +
        Object.keys(Cart.PAYMENT_CHANNELS).map(function (key) {
            return '<label class="payment-channel"><input type="radio" name="payment-channel" value="' + key + '"' + (key === 'vnpay' ? ' checked' : '') + '><span>' + esc(Cart.PAYMENT_CHANNELS[key]) + '</span></label>';
        }).join('') + '</div><p>Đây là thanh toán mô phỏng, không thu tiền thật. Bạn sẽ xác nhận kết quả ở bước tiếp theo.</p></div>' +
        '</section></div><aside class="shop-panel"><h2>Đơn hàng của bạn</h2>' +
        '<div class="checkout-items">' + lines.map(function (line) {
            return '<div class="shop-invoice-item"><img ' + UI.imageAttrs(line.product.image) + ' alt="' + esc(line.product.name) + '"><span>' +
                esc(line.product.name) + ' <b>× ' + line.quantity + '</b></span><strong>' + money(line.subtotal) + '</strong></div>';
        }).join('') + '</div>' +
        '<div class="checkout-breakdown"><div class="shop-summary-line"><span>Tạm tính</span><strong>' + money(subtotal) + '</strong></div>' +
        '<div class="shop-summary-line"><span>Phí vận chuyển</span><strong>' + (shippingFee ? money(shippingFee) : 'Miễn phí') + '</strong></div></div>' +
        (shippingFee ? '<p class="shipping-note">Mua thêm ' + money(1000000 - subtotal) + ' để được miễn phí vận chuyển.</p>' :
            '<p class="shipping-note is-free">Đơn hàng được miễn phí vận chuyển.</p>') +
        '<div class="shop-summary-line shop-summary-total"><span>Tổng cộng</span><strong id="checkout-total">' + money(subtotal + shippingFee) + '</strong></div>' +
        '<div id="checkout-error" class="shop-error" role="alert" hidden></div>' +
        '<button id="place-order" class="btn shop-block-button" type="button">Xác nhận đặt hàng</button>' +
        '<div id="checkout-result" class="checkout-result" hidden><strong>Xác nhận kết quả thanh toán mô phỏng</strong>' +
        '<p>Không thu tiền thật. Chọn kết quả để tiếp tục:</p>' +
        '<div class="checkout-result-actions"><button type="button" data-payment-result="success">Thanh toán thành công</button>' +
        '<button type="button" data-payment-result="failed">Thanh toán thất bại</button>' +
        '<button type="button" data-payment-result="cancelled">Hủy thanh toán</button></div></div>' +
        '<p class="checkout-terms">Bằng việc đặt hàng, bạn đồng ý với <a data-route="#">Điều khoản dịch vụ của ModelShop</a>.</p>' +
        '<a data-route="cart.html" class="shop-outline-link">Quay lại giỏ hàng</a></aside></div>';

    const newAddress = document.getElementById('new-address');
    const onlineInfo = document.getElementById('online-payment-info');
    const errorBox = document.getElementById('checkout-error');
    const placeButton = document.getElementById('place-order');
    const resultPanel = document.getElementById('checkout-result');
    let pending = null;
    let submitting = false;

    function showError(message) {
        errorBox.textContent = message;
        errorBox.hidden = false;
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function addressNow() {
        if (document.querySelector('input[name="address-source"]:checked').value === 'saved') {
            return {
                receiver: user.full_name, phone: user.phone, address_detail: user.address_detail,
                ward: user.ward, district: user.district, city: user.city
            };
        }
        return {
            receiver: document.getElementById('addr-receiver').value,
            phone: document.getElementById('addr-phone').value,
            address_detail: document.getElementById('addr-address_detail').value,
            ward: document.getElementById('addr-ward').value,
            district: document.getElementById('addr-district').value,
            city: document.getElementById('addr-city').value
        };
    }
    function addressError(address) {
        if (!String(address.receiver || '').trim()) return 'Vui lòng nhập tên người nhận.';
        if (!/^0\d{9}$/.test(String(address.phone || '').trim())) return 'Số điện thoại gồm 10 số và bắt đầu bằng 0.';
        if (['address_detail', 'ward', 'district', 'city'].some(function (key) {
            return !String(address[key] || '').trim();
        })) return 'Vui lòng nhập đủ địa chỉ (số nhà - đường, phường, quận, tỉnh / thành).';
        return '';
    }
    function resetPending() {
        pending = null;
        resultPanel.hidden = true;
        placeButton.hidden = false;
    }
    document.querySelectorAll('input[name="address-source"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            newAddress.hidden = radio.value !== 'new';
            resetPending();
        });
    });
    document.querySelectorAll('input[name="payment"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            onlineInfo.hidden = radio.value !== 'online';
            resetPending();
        });
    });
    app.addEventListener('input', function () { if (pending) resetPending(); });
    app.addEventListener('change', function (event) {
        if (pending && event.target.matches('input[name="payment-channel"]')) resetPending();
    });
    window.addEventListener('pageshow', function (event) { if (event.persisted) App.location.reload(); });

    function completeOrder(selection) {
        if (submitting) return;
        if (Cart.getCartSnapshot() !== cartSnapshot) {
            resetPending();
            showError('Giỏ hàng đã thay đổi. Vui lòng quay lại giỏ hàng để xem lại.');
            return;
        }
        submitting = true;
        placeButton.disabled = true;
        resultPanel.querySelectorAll('button').forEach(function (button) { button.disabled = true; });
        try {
            const result = Cart.placeOrder(selection.address, selection.payment, {
                cart_snapshot: cartSnapshot,
                payment_result: selection.payment === 'online' ? 'success' : null,
                shipping_fee: shippingFee,
                payment_channel: selection.channel,
                order_note: selection.note
            });
            if (!result.ok) {
                resetPending();
                showError(result.error);
                return;
            }
            App.location.href = 'profile.html#orders/' + result.order_id;
        } catch (error) {
            console.error('Checkout failed:', error);
            resetPending();
            showError('Không thể hoàn tất đặt hàng. Vui lòng kiểm tra giỏ hàng và lịch sử đơn hàng trước khi thử lại.');
        } finally {
            submitting = false;
            placeButton.disabled = false;
            resultPanel.querySelectorAll('button').forEach(function (button) { button.disabled = false; });
        }
    }
    placeButton.addEventListener('click', function () {
        if (Cart.getCartSnapshot() !== cartSnapshot) {
            showError('Giỏ hàng đã thay đổi. Vui lòng quay lại giỏ hàng để xem lại.');
            return;
        }
        const address = addressNow();
        const error = addressError(address);
        if (error) { showError(error); return; }
        const payment = document.querySelector('input[name="payment"]:checked').value;
        const selection = {
            address: address,
            payment: payment,
            channel: payment === 'online' ? document.querySelector('input[name="payment-channel"]:checked').value : null,
            note: document.getElementById('order-note').value.trim()
        };
        errorBox.hidden = true;
        if (payment === 'online') {
            pending = selection;
            placeButton.hidden = true;
            resultPanel.hidden = false;
            resultPanel.querySelector('button').focus();
            return;
        }
        completeOrder(selection);
    });
    resultPanel.addEventListener('click', function (event) {
        const button = event.target.closest('[data-payment-result]');
        if (!button || !pending || submitting) return;
        const result = button.dataset.paymentResult;
        if (result === 'success') {
            completeOrder(pending);
            return;
        }
        resetPending();
        showError(result === 'failed'
            ? 'Thanh toán mô phỏng thất bại. Chưa tạo đơn; giỏ hàng được giữ nguyên.'
            : 'Đã hủy thanh toán mô phỏng. Chưa tạo đơn; giỏ hàng được giữ nguyên.');
    });
})();
