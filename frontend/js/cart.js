(function (global) {
    'use strict';

    const PAYMENTS = {
        cod: 'Thanh toán khi nhận hàng (COD)',
        transfer: 'Chuyển khoản',
        online: 'Thanh toán trực tuyến'
    };
    // TODO: kiểm tra trạng thái "mới đặt" mà Thành viên 3 đang dùng (new? pending?)
    const STATUS_NEW = 'new';

    // ---------- GIỎ HÀNG (mỗi khách một giỏ, lưu localStorage) ----------
    function cartKey() {
        const u = Shop.getCurrentUser();
        return 'modelshop_cart_' + (u ? u.id : 'guest');
    }

    function readCart() {
        try { return JSON.parse(localStorage.getItem(cartKey())) || []; }
        catch (e) { return []; }
    }

    function writeCart(cart) {
        localStorage.setItem(cartKey(), JSON.stringify(cart));
    }

    function mergeGuestCart() { //Add gio hang cua acc Guest sang tai khoan dang nhap
    const user = Shop.getCurrentUser();
    if (!user) return;
    let guest = [];
    try {
        guest = JSON.parse(localStorage.getItem('modelshop_cart_guest')) || [];
    } catch (e) { return; }
    if (!Array.isArray(guest)) return;
    const cart = readCart();
    guest.forEach(function (item) {
        if (!item || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) return;
        const productId = Number(item.product_id);
        const product = Shop.getProductById(productId);
        if (!product) return;
        const current = cart.find(function (x) { return Number(x.product_id) === productId; });
        const stock = Math.max(0, Number(product.stock_qty || 0));
        const quantity = Math.min(stock, (current ? Number(current.quantity) : 0) + Number(item.quantity));
        if (current) current.quantity = quantity;
        else if (quantity > 0) cart.push({ product_id: productId, quantity: quantity });
    });
    writeCart(cart.filter(function (item) { return item.quantity > 0; }));
    localStorage.removeItem('modelshop_cart_guest');
}

    function addToCart(productId, qty) {
        qty = Math.max(1, Number(qty) || 1);
        const p = Shop.getProductById(productId);
        if (!p) return { ok: false, error: 'Sản phẩm không tồn tại hoặc đã bị ẩn.' };

        const stock = Number(p.stock_qty || 0);
        const cart = readCart();
        const item = cart.find(function (i) { return i.product_id === p.id; });
        const newQty = (item ? item.quantity : 0) + qty;
        if (newQty > stock) return { ok: false, error: 'Chỉ còn ' + stock + ' sản phẩm trong kho.' };

        if (item) item.quantity = newQty;
        else cart.push({ product_id: p.id, quantity: qty });
        writeCart(cart);
        return { ok: true };
    }

    function updateQuantity(productId, qty) {
        qty = Number(qty);
        const cart = readCart();
        const item = cart.find(function (i) { return i.product_id === Number(productId); });
        if (!item) return { ok: false, error: 'Không có trong giỏ.' };
        if (!qty || qty < 1) return removeFromCart(productId);

        const p = Shop.getProductById(productId);
        const stock = p ? Number(p.stock_qty || 0) : 0;
        if (qty > stock) return { ok: false, error: 'Chỉ còn ' + stock + ' sản phẩm trong kho.' };

        item.quantity = qty;
        writeCart(cart);
        return { ok: true };
    }

    function removeFromCart(productId) {
        writeCart(readCart().filter(function (i) { return i.product_id !== Number(productId); }));
        return { ok: true };
    }

    function clearCart() {
        localStorage.removeItem(cartKey());
    }

    function getCartCount() {
        return readCart().reduce(function (s, i) { return s + i.quantity; }, 0);
    }

    // Giỏ kèm thông tin sản phẩm + giá hiện tại (tự bỏ sản phẩm đã bị ẩn/xóa)
    function getCartDetailed() {
        const lines = [];
        readCart().forEach(function (i) {
            const p = Shop.getProductById(i.product_id);
            if (!p) return;
            const price = Shop.getSalePrice(p);
            lines.push({
                product: p,
                quantity: i.quantity,
                unit_price: price,
                subtotal: price * i.quantity,
                stock: Number(p.stock_qty || 0)
            });
        });
        return lines;
    }

    function getCartTotal() {
        return getCartDetailed().reduce(function (s, l) { return s + l.subtotal; }, 0);
    }

    // ---------- ĐẶT HÀNG ----------
    // address: { receiver, phone, address_detail, ward, district, city }
    function validateAddress(a) {
        if (!a.receiver) return 'Vui lòng nhập tên người nhận.';
        if (!/^0\d{9}$/.test(a.phone)) return 'Số điện thoại gồm 10 số và bắt đầu bằng 0.';
        if (!a.address_detail || !a.ward || !a.district || !a.city) {
            return 'Vui lòng nhập đủ địa chỉ (số nhà - đường, phường, quận, tỉnh / thành).';
        }
        return '';
    }

    function placeOrder(address, payment) {
        const user = Shop.getCurrentUser();
        if (!user) return { ok: false, error: 'Vui lòng đăng nhập để đặt hàng.' };

        payment = PAYMENTS[payment] ? payment : 'cod';
        const a = {
            receiver: String(address.receiver || '').trim(),
            phone: String(address.phone || '').trim(),
            address_detail: String(address.address_detail || '').trim(),
            ward: String(address.ward || '').trim(),
            district: String(address.district || '').trim(),
            city: String(address.city || '').trim()
        };
        const err = validateAddress(a);
        if (err) return { ok: false, error: err };

        const lines = getCartDetailed();
        if (!lines.length) return { ok: false, error: 'Giỏ hàng đang trống.' };
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].quantity > lines[i].stock) {
                return { ok: false, error: '"' + lines[i].product.name + '" chỉ còn ' + lines[i].stock + ' sản phẩm.' };
            }
        }

        const db = Shop.loadDB();
        if (!db.orders) db.orders = [];
        if (!db.order_items) db.order_items = [];

        const maxOf = function (arr) { return arr.reduce(function (m, x) { return Math.max(m, x.id); }, 0); };
        const orderId = maxOf(db.orders) + 1;
        let itemId = maxOf(db.order_items);

        const order = {
            id: orderId,
            customer_id: user.id,
            order_date: Shop.nowString(),
            status: STATUS_NEW,
            // TODO: đối chiếu tên cột với DB_SCHEMA.orders (database/) và Thành viên 3
            receiver_name: a.receiver,
            receiver_phone: a.phone,
            ship_address_detail: a.address_detail,
            ship_ward: a.ward,
            ship_district: a.district,
            ship_city: a.city,
            payment_method: payment,
            total_amount: lines.reduce(function (s, l) { return s + l.subtotal; }, 0)
        };
        db.orders.push(order);

        lines.forEach(function (l) {
            db.order_items.push({
                id: ++itemId,
                order_id: orderId,
                product_id: l.product.id,
                quantity: l.quantity,
                unit_price: l.unit_price // giá chốt tại thời điểm mua
            });
        });

        Shop.saveDB(db);
        clearCart();
        return { ok: true, order_id: orderId };
    }

    // ---------- LỊCH SỬ ĐƠN ----------
    function getOrderDetail(orderId) {
        const user = Shop.getCurrentUser();
        if (!user) return null;
        const db = Shop.loadDB();
        const order = Shop.findById(db.orders, orderId);
        if (!order || Number(order.customer_id) !== Number(user.id)) return null;
        const items = (db.order_items || [])
            .filter(function (it) { return it.order_id === order.id; })
            .map(function (it) {
                return {
                    product: Shop.findById(db.products, it.product_id),
                    quantity: it.quantity,
                    unit_price: it.unit_price,
                    subtotal: it.quantity * it.unit_price
                };
            });
        const total = items.reduce(function (s, i) { return s + i.subtotal; }, 0);
        return { order: order, items: items, total: total };
    }

    function getMyOrders() {
        const user = Shop.getCurrentUser();
        if (!user) return [];
        return (Shop.loadDB().orders || [])
            .filter(function (o) { return o.customer_id === user.id; })
            .sort(function (a, b) { return String(b.order_date).localeCompare(String(a.order_date)) || b.id - a.id; })
            .map(function (o) { return getOrderDetail(o.id); });
    }

    const STATUS_TEXT = {
        new: 'Mới đặt',
        processed: 'Đã xử lý',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy'
    };

    global.Cart = {
        mergeGuestCart: mergeGuestCart,
        PAYMENTS: PAYMENTS,
        STATUS_TEXT: STATUS_TEXT,
        addToCart: addToCart,
        updateQuantity: updateQuantity,
        removeFromCart: removeFromCart,
        clearCart: clearCart,
        getCartCount: getCartCount,
        getCartDetailed: getCartDetailed,
        getCartTotal: getCartTotal,
        placeOrder: placeOrder,
        getOrderDetail: getOrderDetail,
        getMyOrders: getMyOrders
    };
})(window);
