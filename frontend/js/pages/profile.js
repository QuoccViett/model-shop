(function () {
    'use strict';
    const user = Shop.getCurrentUser();
    if (!user) { location.replace('login.html?redirect=profile.html'); return; }
    const infoForm = document.getElementById('info-form');
    const pwForm = document.getElementById('pw-form');
    const infoMsg = document.getElementById('info-msg');
    const pwMsg = document.getElementById('pw-msg');
    let orderGroup = 'all';
    let selectedOrderId = null;

    // Hiển thị thông báo thành công hoặc lỗi trong hồ sơ
    function showMessage(box, ok, text) {
        box.textContent = text; box.className = 'alert ' + (ok ? 'alert-success' : 'alert-error'); box.hidden = false;
    }
    ['username', 'full_name', 'email', 'phone', 'address_detail', 'ward', 'district', 'city'].forEach(function (name) { infoForm.elements[name].value = user[name] || ''; });
    document.querySelectorAll('[data-prof-tab]').forEach(function (button) {
        button.addEventListener('click', function () {
            document.querySelectorAll('[data-prof-tab]').forEach(function (item) { item.classList.toggle('is-active', item === button); });
            document.querySelectorAll('[data-prof-panel]').forEach(function (panel) { panel.classList.toggle('is-active', panel.dataset.profPanel === button.dataset.profTab); });
            if (button.dataset.profTab === 'orders') renderOrders();
        });
    });
    document.getElementById('profile-logout').addEventListener('click', function () { Shop.logoutCustomer(); location.href = '../index.html'; });
    infoForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const result = Shop.updateProfile(user.id, Object.fromEntries(new FormData(infoForm)));
        if (!result.ok) { showMessage(infoMsg, false, result.error); return; }
        showMessage(infoMsg, true, 'Đã lưu thông tin.');
    });
    pwForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const f = pwForm.elements;
        const result = Shop.changePassword(user.id, f.current.value, f.new_password.value, f.confirm.value);
        if (!result.ok) { showMessage(pwMsg, false, result.error); return; }
        pwForm.reset(); showMessage(pwMsg, true, 'Đổi mật khẩu thành công.');
    });
    // Chuyển mã thanh toán thành nội dung hiển thị cho người dùng
    function paymentText(method, channel) {
        const label = ({ cod: 'Thanh toán khi nhận hàng', online: 'Thanh toán trực tuyến' }[method] || method || '—');
        return channel && Cart.PAYMENT_CHANNELS && Cart.PAYMENT_CHANNELS[channel] ? label + ' — ' + Cart.PAYMENT_CHANNELS[channel] : label;
    }
    // Lấy các sản phẩm thuộc một đơn hàng
    function orderItems(order) {
        return (Shop.loadDB().order_items || []).filter(function (item) { return Number(item.order_id) === Number(order.id); });
    }
    // Render danh sách đơn theo tab trạng thái đang chọn
    function renderOrders() {
        const orders = Shop.getMyOrders(orderGroup);
        const list = document.getElementById('orders-list');
        list.innerHTML = orders.length ? orders.map(function (order) {
            const status = Shop.normalizeStatus(order.status), meta = ORDER_STATUS.get(status);
            const names = orderItems(order).map(function (item) { const product = Shop.findById(Shop.loadDB().products, item.product_id); return (product ? product.name : 'Sản phẩm') + ' × ' + item.quantity; }).join(', ');
            const isOpen = selectedOrderId === Number(order.id);
            const statusClass = status.replace(/_/g, '-');
            return '<article class="prof-order ' + (isOpen ? 'is-highlighted' : '') + '" data-order-card="' + order.id + '"><div class="prof-order-head"><strong>#' + Shop.getOrderCode(order.id) + '</strong><span class="status-' + statusClass + '">' + meta.label + '</span></div><div class="prof-order-products">' + Shop.escapeHtml(names) + '</div><div class="prof-order-summary"><span>' + Shop.escapeHtml(String(order.order_date || '').split(' ')[0]) + '</span><strong>' + Shop.formatPrice(order.total_amount) + '</strong><button type="button" class="btn btn-outline" data-open-order="' + order.id + '">' + (isOpen ? 'Đóng chi tiết' : 'Xem chi tiết') + '</button></div>' + (isOpen ? renderDetail(order) : '') + '</article>';
        }).join('') : '<p class="notif-empty">Bạn chưa có đơn hàng nào.</p>';
        list.querySelectorAll('[data-open-order]').forEach(function (button) { button.addEventListener('click', function () {
            const orderId = Number(button.dataset.openOrder);
            if (selectedOrderId === orderId) {
                selectedOrderId = null;
                renderOrders();
                return;
            }
            openOrder(orderId);
        }); });
        if (selectedOrderId) { const card = list.querySelector('[data-order-card="' + selectedOrderId + '"]'); if (card) card.scrollIntoView({ block: 'center' }); }
    }
    // Render thông tin chi tiết, timeline và thao tác của đơn hàng
    function renderDetail(order) {
        const status = Shop.normalizeStatus(order.status), items = orderItems(order), db = Shop.loadDB();
        let timeline = ORDER_STATUS.flow.map(function (item) { const past = ORDER_STATUS.flow.indexOf(item) <= ORDER_STATUS.flow.indexOf(status) && status !== 'cancelled'; return '<div class="prof-timeline-item ' + (past ? 'is-past ' : '') + (item === status ? 'is-current' : '') + '"><span class="prof-timeline-dot" style="background-color:' + ORDER_STATUS.get(item).color + '"></span>' + ORDER_STATUS.get(item).label + '</div>'; }).join('');
        if (status === 'cancelled') timeline += '<div class="prof-timeline-item is-current"><span class="prof-timeline-dot" style="background-color:' + ORDER_STATUS.get(status).color + '"></span>' + ORDER_STATUS.get(status).label + '</div>';
        const actions = ['cancelled', 'delivered'].indexOf(status) !== -1
            ? '<div class="prof-order-actions"><button type="button" class="btn" data-reorder-order="' + order.id + '">Đặt lại đơn</button></div>'
            : (ORDER_STATUS.canCancel(status) ? '<div class="prof-order-actions"><button type="button" class="btn btn-outline" data-cancel-order="' + order.id + '">Hủy đơn</button></div>' : '');
        return '<div class="prof-order-detail"><div class="prof-detail-grid"><div><strong>Địa chỉ:</strong> ' + Shop.escapeHtml([order.ship_address_detail, order.ship_ward, order.ship_district, order.ship_city].filter(Boolean).join(', ') || '—') + '</div><div><strong>Thanh toán:</strong> ' + Shop.escapeHtml(paymentText(order.payment_method, order.payment_channel)) + '</div></div><div class="prof-detail-items">' + items.map(function (item) { const p = Shop.findById(db.products, item.product_id); return '<div class="prof-detail-item"><span>' + Shop.escapeHtml(p ? p.name : 'Sản phẩm') + ' × ' + item.quantity + '</span><strong>' + Shop.formatPrice(item.unit_price * item.quantity) + '</strong></div>'; }).join('') + '</div><div class="prof-timeline">' + timeline + '</div>' + actions + '</div>';
    }
    // Mở một đơn hàng và đồng bộ đường dẫn hiện tại
    function openOrder(id) {
        const order = Shop.getOrderById(id); if (!order) return;
        selectedOrderId = id;
        document.querySelector('[data-prof-tab="orders"]').click();
        history.replaceState(null, '', '#orders/' + id);
        renderOrders();
    }
    document.getElementById('orders-list').addEventListener('click', function (event) {
        const cancel = event.target.closest('[data-cancel-order]');
        if (cancel) {
            const orderId = Number(cancel.dataset.cancelOrder);
            if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
            const result = Shop.cancelOrder(orderId);
            if (!result.ok) { alert(result.error); return; }
            selectedOrderId = orderId;
            renderOrders();
            return;
        }
        const reorder = event.target.closest('[data-reorder-order]');
        if (reorder) {
            const result = Cart.reorderOrder(Number(reorder.dataset.reorderOrder));
            if (!result.ok) { alert(result.error); return; }
            location.href = 'cart.html';
        }
    });
    document.querySelectorAll('[data-order-group]').forEach(function (tab) { tab.addEventListener('click', function () { orderGroup = tab.dataset.orderGroup; document.querySelectorAll('[data-order-group]').forEach(function (item) { item.classList.toggle('is-active', item === tab); }); renderOrders(); }); });
    function readHash() { const match = location.hash.match(/^#orders\/(\d+)/); if (match) openOrder(Number(match[1])); }
    globalThis.addEventListener('hashchange', readHash);
    renderOrders();
    readHash();
})();
