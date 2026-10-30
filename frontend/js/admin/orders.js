/*QUẢN LÝ ĐƠN HÀNG - MODEL SHOP*/

(function () {
    'use strict';
    // KHỞI TẠO
    if (!window.Shop) {
        console.error('Cần tải common.js trước orders.js');
        return;
    }

    const mainContent = document.querySelector('.admin-main');

    if (!mainContent) return;

    const esc = Shop.escapeHtml;
    const money = Shop.formatPrice;

    let currentOrderId = null;
    // CÁC HÀM HỖ TRỢ
    function getDB() {
        const db = Shop.loadDB();

        if (!db.orders) db.orders = [];
        if (!db.order_items) db.order_items = [];
        if (!db.customers) db.customers = [];
        if (!db.products) db.products = [];
        if (!db.stock_movements) db.stock_movements = [];

        return db;
    }

    function findById(list, id) {
        return (list || []).find(function (item) {
            return Number(item.id) === Number(id);
        });
    }

    function orderCode(id) {
        return 'DH' + String(id).padStart(4, '0');
    }

    function showDateTime(value) {
        if (!value) return '—';

        const parts = String(value).split(' ');
        const dateParts = parts[0].split('-');

        if (dateParts.length !== 3) {
            return esc(String(value));
        }

        return (
            dateParts[2] + '/' +
            dateParts[1] + '/' +
            dateParts[0] +
            (parts[1] ? ' ' + esc(parts[1]) : '')
        );
    }

    function getStatusText(status) {
        const labels = {
            new: 'Mới đặt',
            processed: 'Đã xử lý',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy'
        };

        return labels[status] || status;
    }
    // HIỂN THỊ MÀU TRẠNG THÁI
    function statusBadge(status) {
        return `
            <span class="status-badge status-${esc(status)}">
                ${esc(getStatusText(status))}
            </span>
        `;
    }

    function getPaymentText(method) {
        const labels = {
            cod: 'Thanh toán khi nhận hàng',
            transfer: 'Chuyển khoản',
            online: 'Thanh toán online'
        };

        return labels[method] || method || '—';
    }

    function getOrderItems(orderId, db = getDB()) {
        return db.order_items.filter(function (item) {
            return Number(item.order_id) === Number(orderId);
        });
    }

    function getCustomer(order, db = getDB()) {
        return findById(db.customers, order.customer_id);
    }

    function getProduct(productId, db = getDB()) {
        return findById(db.products, productId);
    }

    function getNextId(list) {
        return list.reduce(function (max, item) {
            return Math.max(max, Number(item.id) || 0);
        }, 0) + 1;
    }

    function getAddress(order) {
        return [
            order.ship_address_detail,
            order.ship_ward,
            order.ship_district,
            order.ship_city
        ].filter(Boolean).join(', ') || '—';
    }

    function todayString() {
        return new Date().toLocaleDateString('en-CA');
    }
    // TẠO GIAO DIỆN QUẢN LÝ ĐƠN HÀNG
    const pageHTML = `
        <div class="dashboard-content orders-page">

            <div class="page-title">
                <h1>Quản lý đơn hàng</h1>
                <p>Trang chủ / Quản lý đơn hàng</p>
            </div>

            <div class="data-table-section">

                <div class="table-actions-bar">

                    <div class="search-filter-group">

                        <label class="filter-field">
                            <span>Tìm kiếm</span>

                            <input
                                type="text"
                                id="order-search"
                                placeholder="Tìm đơn hàng..."
                            >
                        </label>

                        <label class="filter-field">
                            <span>Ngày bắt đầu</span>

                            <input
                                type="date"
                                id="order-from"
                            >
                        </label>

                        <label class="filter-field">
                            <span>Ngày kết thúc</span>

                            <input
                                type="date"
                                id="order-to"
                            >
                        </label>

                        <label class="filter-field">
                            <span>Trạng thái</span>

                            <select id="order-status">

                                <option value="all">
                                    Tất cả trạng thái
                                </option>

                                <option value="new">
                                    Mới đặt
                                </option>

                                <option value="processed">
                                    Đã xử lý
                                </option>

                                <option value="delivered">
                                    Đã giao
                                </option>

                                <option value="cancelled">
                                    Đã hủy
                                </option>

                            </select>
                        </label>

                    </div>

                </div>

                <div class="table-responsive">

                    <table>

                        <thead>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Số điện thoại</th>
                                <th class="text-right">Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>

                        <tbody id="order-table-body"></tbody>

                    </table>

                </div>

            </div>

        </div>
    `;

    mainContent.insertAdjacentHTML('beforeend', pageHTML);

    // LẤY CÁC PHẦN TỬ HTML
    const searchInput = document.getElementById('order-search');

    const fromInput = document.getElementById('order-from');

    const toInput = document.getElementById('order-to');

    const statusSelect = document.getElementById('order-status');

    const tableBody = document.getElementById('order-table-body');

    // HIỂN THỊ DANH SÁCH ĐƠN HÀNG
    function renderTable() {

        const db = getDB();

        const keyword = Shop.normalize(
            searchInput.value.trim()
        );

        const from = fromInput.value;
        const to = toInput.value;
        const status = statusSelect.value;

        // Kiểm tra khoảng ngày
        if (from && to && from > to) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-row">
                        Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.
                    </td>
                </tr>
            `;

            return;
        }

        // Lọc đơn hàng
        let orders = db.orders.filter(function (order) {

            const orderDate = String(
                order.order_date || ''
            ).slice(0, 10);

            // Lọc trạng thái
            if (
                status !== 'all' &&
                order.status !== status
            ) {
                return false;
            }

            // Lọc ngày bắt đầu
            if (from && orderDate < from) {
                return false;
            }

            // Lọc ngày kết thúc
            if (to && orderDate > to) {
                return false;
            }

            // Tìm kiếm
            if (keyword) {

                const customer = getCustomer(order, db);

                const customerName = customer
                    ? customer.full_name
                    : '';

                const searchableText = [
                    orderCode(order.id),
                    order.id,
                    order.receiver_name,
                    order.receiver_phone,
                    customerName
                ].join(' ');

                if (
                    Shop.normalize(searchableText)
                        .indexOf(keyword) === -1
                ) {
                    return false;
                }
            }

            return true;
        });

        // Sắp xếp mới nhất lên đầu
        orders.sort(function (a, b) {
            return Number(b.id) - Number(a.id);
        });

        // Không có đơn hàng
        if (orders.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-row">
                        Không tìm thấy đơn hàng nào.
                    </td>
                </tr>
            `;

            return;
        }

        // Hiển thị bảng
        tableBody.innerHTML = orders.map(function (order) {

            const customer = getCustomer(order, db);

            const customerName =
                order.receiver_name ||
                (customer ? customer.full_name : 'Khách hàng');

            return `
                <tr>

                    <td>
                        <strong>
                            ${orderCode(order.id)}
                        </strong>
                    </td>

                    <td>
                        ${esc(customerName)}
                    </td>

                    <td>
                        ${showDateTime(order.order_date)}
                    </td>

                    <td>
                        ${esc(order.receiver_phone || '')}
                    </td>

                    <td class="text-right">
                        ${money(order.total_amount)}
                    </td>

                    <td>
                        ${statusBadge(order.status)}
                    </td>

                    <td>
                        <button
                            type="button"
                            class="btn-action view"
                            data-action="view"
                            data-id="${order.id}"
                            title="Xem chi tiết đơn hàng"
                            aria-label="Xem chi tiết đơn hàng"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </td>

                </tr>
            `;
        }).join('');
    }

    // TÌM KIẾM VÀ LỌC

    searchInput.addEventListener('input', renderTable);

    fromInput.addEventListener('change', renderTable);

    toInput.addEventListener('change', renderTable);

    statusSelect.addEventListener('change', renderTable);

    // ĐÓNG POPUP CHI TIẾT

    function closeOrderDetail() {

        const modal = document.querySelector(
            '.order-modal-overlay'
        );

        if (modal) {
            modal.remove();
        }

        document.body.style.overflow = '';

        currentOrderId = null;
    }


    // MỞ POPUP CHI TIẾT ĐƠN HÀNG
    function openOrderDetail(orderId) {

        const db = getDB();

        const order = findById(db.orders, orderId);

        if (!order) {
            alert('Không tìm thấy đơn hàng!');
            return;
        }

        // Đóng popup trước đó
        closeOrderDetail();

        currentOrderId = orderId;

        // Lấy thông tin khách hàng
        const customer = getCustomer(order, db);

        // Lấy danh sách sản phẩm
        const items = getOrderItems(orderId, db);

        const customerName =
            order.receiver_name ||
            (customer ? customer.full_name : '—');

        // TẠO DANH SÁCH SẢN PHẨM

        const rows = items.map(function (item) {

            const product = getProduct(item.product_id, db);

            const productName = product
                ? product.name
                : 'Sản phẩm không tồn tại';

            const quantity = Number(item.quantity || 0);

            const unitPrice = Number(item.unit_price || 0);

            return `
                <tr>

                    <td>
                        ${esc(productName)}
                    </td>

                    <td class="text-right">
                        ${money(unitPrice)}
                    </td>

                    <td class="text-right">
                        ${quantity}
                    </td>

                    <td class="text-right">
                        ${money(unitPrice * quantity)}
                    </td>

                </tr>
            `;
        }).join('');

        // TẠO POPUP

        const modal = document.createElement('div');

        modal.className = 'order-modal-overlay';

        modal.innerHTML = `

            <div
                class="order-modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-detail-title"
            >

                <!-- HEADER -->

                <div class="order-modal-header">

                    <h3 id="order-detail-title">
                        Chi tiết đơn hàng ${orderCode(order.id)}
                    </h3>

                    <button
                        type="button"
                        class="order-modal-close"
                        data-close-order
                        aria-label="Đóng"
                    >
                        &times;
                    </button>

                </div>

                <!-- BODY -->

                <div class="order-modal-body">

                    <div class="detail-grid">

                        <!-- THÔNG TIN KHÁCH HÀNG -->

                        <div class="detail-card">

                            <h4>Thông tin khách hàng</h4>

                            <div class="detail-item">
                                <strong>Người nhận:</strong>
                                ${esc(customerName)}
                            </div>

                            <div class="detail-item">
                                <strong>Số điện thoại:</strong>
                                ${esc(order.receiver_phone || '—')}
                            </div>

                            <div class="detail-item">
                                <strong>Email:</strong>
                                ${esc(customer ? customer.email : '—')}
                            </div>

                        </div>

                        <!-- THÔNG TIN ĐƠN HÀNG -->

                        <div class="detail-card">

                            <h4>Thông tin đơn hàng</h4>

                            <div class="detail-item">
                                <strong>Mã đơn:</strong>
                                ${orderCode(order.id)}
                            </div>

                            <div class="detail-item">
                                <strong>Ngày đặt:</strong>
                                ${showDateTime(order.order_date)}
                            </div>

                            <div class="detail-item">
                                <strong>Trạng thái:</strong>
                                ${statusBadge(order.status)}
                            </div>

                            <div class="detail-item">
                                <strong>Thanh toán:</strong>
                                ${esc(getPaymentText(order.payment_method))}
                            </div>

                        </div>

                    </div>

                    <!-- ĐỊA CHỈ GIAO HÀNG -->

                    <div class="detail-card">

                        <h4>Địa chỉ giao hàng</h4>

                        <div class="detail-item">
                            ${esc(getAddress(order))}
                        </div>

                    </div>

                    <!-- DANH SÁCH SẢN PHẨM -->

                    <div class="detail-card">

                        <h4>Danh sách sản phẩm</h4>

                        <div class="table-responsive">

                            <table class="detail-products">

                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>

                                        <th class="text-right">
                                            Đơn giá
                                        </th>

                                        <th class="text-right">
                                            Số lượng
                                        </th>

                                        <th class="text-right">
                                            Thành tiền
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    ${rows || `
                                        <tr>
                                            <td
                                                colspan="4"
                                                style="text-align:center"
                                            >
                                                Không có sản phẩm.
                                            </td>
                                        </tr>
                                    `}

                                </tbody>

                            </table>

                        </div>

                        <div class="detail-total">
                            Tổng tiền: ${money(order.total_amount)}
                        </div>

                    </div>

                    <!-- CẬP NHẬT TRẠNG THÁI -->

                    <div class="detail-card">

                        <h4>Cập nhật trạng thái</h4>

                        <div class="detail-actions">

                            <label for="order-next-status">
                                Trạng thái:
                            </label>

                            <select id="order-next-status">
                                ${getStatusOptions(order.status)}
                            </select>

                            <button
                                type="button"
                                class="btn-primary"
                                id="btn-update-order"
                                ${isFinalStatus(order.status) ? 'disabled' : ''}
                            >
                                Cập nhật
                            </button>

                        </div>

                        <div
                            id="order-message"
                            class="message"
                        ></div>

                    </div>

                </div>

                <!-- FOOTER -->

                <div class="order-modal-footer">

                    <button
                        type="button"
                        class="btn-secondary"
                        data-close-order
                    >
                        Đóng
                    </button>

                </div>

            </div>
        `;

        // Hiển thị popup
        document.body.appendChild(modal);

        // Khóa cuộn trang phía sau
        document.body.style.overflow = 'hidden';

        // XỬ LÝ ĐÓNG POPUP

        modal.querySelectorAll('[data-close-order]')
            .forEach(function (button) {

                button.addEventListener(
                    'click',
                    closeOrderDetail
                );

            });

        // Nhấn ra ngoài popup để đóng
        modal.addEventListener('click', function (event) {

            if (event.target === modal) {
                closeOrderDetail();
            }

        });

        // XỬ LÝ CẬP NHẬT TRẠNG THÁI

        const updateButton = modal.querySelector(
            '#btn-update-order'
        );

        updateButton.addEventListener('click', function () {

            updateOrderStatus(orderId);

        });
    }

    // XỬ LÝ NÚT CON MẮT

    tableBody.addEventListener('click', function (event) {

        const button = event.target.closest(
            '[data-action="view"]'
        );

        if (!button) return;

        const orderId = Number(button.dataset.id);

        openOrderDetail(orderId);
    });

    // Nhấn ESC để đóng popup
    document.addEventListener('keydown', function (event) {

        if (event.key === 'Escape') {
            closeOrderDetail();
        }

    });

    // KIỂM TRA TRẠNG THÁI CUỐI

    function isFinalStatus(status) {

        return (
            status === 'delivered' ||
            status === 'cancelled'
        );
    }

    // TẠO DANH SÁCH TRẠNG THÁI
    function getStatusOptions(currentStatus) {

        if (currentStatus === 'new') {

            return `
                <option value="new" selected>
                    Mới đặt
                </option>

                <option value="processed">
                    Đã xử lý
                </option>

                <option value="cancelled">
                    Đã hủy
                </option>
            `;
        }

        if (currentStatus === 'processed') {

            return `
                <option value="processed" selected>
                    Đã xử lý
                </option>

                <option value="delivered">
                    Đã giao
                </option>

                <option value="cancelled">
                    Đã hủy
                </option>
            `;
        }

        return `
            <option value="${esc(currentStatus)}" selected>
                ${esc(getStatusText(currentStatus))}
            </option>
        `;
    }

    // 13. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
    function updateOrderStatus(orderId) {

        const db = getDB();

        const order = findById(db.orders, orderId);

        const modal = document.querySelector(
            '.order-modal-overlay'
        );

        if (!modal || !order) return;

        const select = modal.querySelector(
            '#order-next-status'
        );

        const messageBox = modal.querySelector(
            '#order-message'
        );

        if (!select || !messageBox) return;

        const oldStatus = order.status;
        const newStatus = select.value;

        // HIỂN THỊ THÔNG BÁO

        function showMessage(message, isError = false) {

            messageBox.className =
                'message ' + (isError ? 'error' : 'success');

            messageBox.textContent = message;
        }

        // Không thay đổi
        if (oldStatus === newStatus) {

            showMessage(
                'Trạng thái đơn hàng không thay đổi.',
                true
            );

            return;
        }

        // Đơn hàng đã kết thúc
        if (isFinalStatus(oldStatus)) {

            showMessage(
                'Đơn hàng đã kết thúc, không thể cập nhật.',
                true
            );

            return;
        }

        // KIỂM TRA CHUYỂN TRẠNG THÁI
        const validTransition =
            (
                oldStatus === 'new' &&
                (
                    newStatus === 'processed' ||
                    newStatus === 'cancelled'
                )
            ) ||
            (
                oldStatus === 'processed' &&
                (
                    newStatus === 'delivered' ||
                    newStatus === 'cancelled'
                )
            );

        if (!validTransition) {

            showMessage(
                'Không thể chuyển sang trạng thái này.',
                true
            );

            return;
        }

        // Lấy sản phẩm của đơn hàng
        const items = getOrderItems(orderId, db);

        // ỚI ĐẶT -> ĐÃ XỬ LÝ
        // KIỂM TRA VÀ TRỪ TỒN KHO

        if (
            oldStatus === 'new' &&
            newStatus === 'processed'
        ) {

            const requiredQuantities = new Map();

            // Tổng hợp số lượng từng sản phẩm
            for (const item of items) {

                const productId = Number(item.product_id);
                const quantity = Number(item.quantity);

                if (
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {

                    showMessage(
                        'Số lượng sản phẩm không hợp lệ.',
                        true
                    );

                    return;
                }

                requiredQuantities.set(
                    productId,
                    (requiredQuantities.get(productId) || 0) + quantity
                );
            }

            // Kiểm tra đủ tồn kho
            for (const [productId, quantity] of requiredQuantities) {

                const product = getProduct(productId, db);

                if (!product) {

                    showMessage(
                        'Có sản phẩm trong đơn hàng không còn tồn tại.',
                        true
                    );

                    return;
                }

                if (
                    Number(product.stock_qty || 0) < quantity
                ) {

                    showMessage(
                        'Sản phẩm ' + product.name +
                        ' không đủ tồn kho.',
                        true
                    );

                    return;
                }
            }

            // Trừ tồn kho
            for (const [productId, quantity] of requiredQuantities) {

                const product = getProduct(productId, db);

                product.stock_qty =
                    Number(product.stock_qty || 0) - quantity;

                db.stock_movements.push({

                    id: getNextId(db.stock_movements),

                    product_id: product.id,

                    movement_date: todayString(),

                    movement_type: 'export',

                    quantity: -quantity,

                    ref_type: 'order',

                    ref_id: order.id

                });
            }
        }

        // ĐÃ XỬ LÝ -> ĐÃ HỦY
        // HOÀN LẠI TỒN KHO

        if (
            oldStatus === 'processed' &&
            newStatus === 'cancelled'
        ) {

            const returnQuantities = new Map();

            for (const item of items) {

                const productId = Number(item.product_id);
                const quantity = Number(item.quantity);

                if (
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {

                    showMessage(
                        'Số lượng sản phẩm không hợp lệ.',
                        true
                    );

                    return;
                }

                returnQuantities.set(
                    productId,
                    (returnQuantities.get(productId) || 0) + quantity
                );
            }

            // Hoàn lại số lượng sản phẩm
            for (const [productId, quantity] of returnQuantities) {

                const product = getProduct(productId, db);

                if (product) {

                    product.stock_qty =
                        Number(product.stock_qty || 0) + quantity;

                    db.stock_movements.push({

                        id: getNextId(db.stock_movements),

                        product_id: product.id,

                        movement_date: todayString(),

                        movement_type: 'cancel_return',

                        quantity: quantity,

                        ref_type: 'order',

                        ref_id: order.id

                    });
                }
            }
        }

        // 16. LƯU TRẠNG THÁI MỚI
        order.status = newStatus;

        order.updated_at = Shop.nowString();

        Shop.saveDB(db);

        // Cập nhật bảng đơn hàng
        renderTable();

        // Mở lại popup với trạng thái mới
        openOrderDetail(orderId);

        // Thông báo thành công
        const updatedModal = document.querySelector(
            '.order-modal-overlay'
        );

        if (updatedModal) {

            const updatedMessage = updatedModal.querySelector(
                '#order-message'
            );

            if (updatedMessage) {

                updatedMessage.className = 'message success';

                updatedMessage.textContent =
                    'Cập nhật trạng thái đơn hàng thành công!';
            }
        }
    }

    renderTable();

})();