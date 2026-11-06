(function (global) {
    'use strict';

    const PAYMENTS = {
        cod: 'Thanh toán khi nhận hàng (COD)',
        online: 'Thanh toán trực tuyến'
    };
    const PAYMENT_CHANNELS = {
        visa: 'Thẻ VISA',
        vnpay: 'VNPAY'
    };
    const STATUS_NEW = 'order_created';

    // ---------- Quản lý giỏ hàng theo từng tài khoản ----------
    // Tạo khóa lưu giỏ hàng cho người dùng hiện tại
    function cartKey() {
        const u = Shop.getCurrentUser();
        return u ? 'modelshop_cart_' + u.id : null;
    }

    // Đọc giỏ hàng từ localStorage và trả về mảng an toàn
    function readCart() {
        if (!cartKey()) return [];
        try { return JSON.parse(localStorage.getItem(cartKey())) || []; }
        catch (e) { return []; }
    }

    // Lưu lại giỏ hàng sau mỗi thay đổi
    function writeCart(cart) {
        if (!cartKey()) return;
        localStorage.setItem(cartKey(), JSON.stringify(cart));
    }

    // Thêm sản phẩm vào giỏ và kiểm tra tồn kho
    function addToCart(productId, qty) {
        if (!Shop.getCurrentUser()) return { ok: false, authRequired: true, error: 'Vui lòng đăng nhập để sử dụng giỏ hàng.' };
        qty = Number(qty);
        if (!Number.isSafeInteger(qty) || qty < 1) return { ok: false, error: 'Số lượng phải là số nguyên dương.' };
        const p = Shop.getProductById(productId);
        if (!p) return { ok: false, error: 'Sản phẩm không tồn tại hoặc đã bị ẩn.' };

        const stock = Number(p.stock_qty || 0);
        const cart = readCart();
        const item = cart.find(function (i) { return i.product_id === p.id; });
        const newQty = (item ? item.quantity : 0) + qty;
        if (!Number.isSafeInteger(newQty) || newQty > stock) return { ok: false, error: 'Số lượng không hợp lệ hoặc vượt tồn kho.' };

        if (item) item.quantity = newQty;
        else cart.push({ product_id: p.id, quantity: qty });
        writeCart(cart);
        return { ok: true };
    }

    // Cập nhật số lượng một sản phẩm trong giỏ
    function updateQuantity(productId, qty) {
        if (!Shop.getCurrentUser()) return { ok: false, authRequired: true, error: 'Vui lòng đăng nhập để sử dụng giỏ hàng.' };
        qty = Number(qty);
        const cart = readCart();
        const item = cart.find(function (i) { return i.product_id === Number(productId); });
        if (!item) return { ok: false, error: 'Không có trong giỏ.' };
        if (qty === 0) return removeFromCart(productId);
        if (!Number.isSafeInteger(qty) || qty < 1) return { ok: false, error: 'Số lượng phải là số nguyên dương.' };

        const p = Shop.getProductById(productId);
        const stock = p ? Number(p.stock_qty || 0) : 0;
        if (qty > stock) return { ok: false, error: 'Chỉ còn ' + stock + ' sản phẩm trong kho.' };

        item.quantity = qty;
        writeCart(cart);
        return { ok: true };
    }

    // Xóa một sản phẩm khỏi giỏ hàng
    function removeFromCart(productId) {
        if (!Shop.getCurrentUser()) return { ok: false, authRequired: true, error: 'Vui lòng đăng nhập để sử dụng giỏ hàng.' };
        writeCart(readCart().filter(function (i) { return i.product_id !== Number(productId); }));
        return { ok: true };
    }

    // Xóa toàn bộ giỏ hàng hiện tại
    function clearCart() {
        const key = cartKey();
        if (key) localStorage.removeItem(key);
    }

    // Tính tổng số sản phẩm đang có trong giỏ
    function getCartCount() {
        return readCart().reduce(function (s, i) { return s + i.quantity; }, 0);
    }

    // Lấy giỏ hàng kèm sản phẩm, giá hiện tại và tồn kho
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

    // Tính tổng tiền sản phẩm trong giỏ
    function getCartTotal() {
        return getCartDetailed().reduce(function (s, l) { return s + l.subtotal; }, 0);
    }

    // ---------- Tạo đơn hàng ----------
    // Kiểm tra dữ liệu địa chỉ trước khi tạo đơn
    function validateAddress(a) {
        if (!a.receiver) return 'Vui lòng nhập tên người nhận.';
        if (!/^0\d{9}$/.test(a.phone)) return 'Số điện thoại gồm 10 số và bắt đầu bằng 0.';
        if (!a.address_detail || !a.ward || !a.district || !a.city) {
            return 'Vui lòng nhập đủ địa chỉ (số nhà - đường, phường, quận, tỉnh / thành).';
        }
        return '';
    }

    // Tạo đơn từ giỏ hàng và lưu thông tin thanh toán
    function placeOrder(address, payment, options) {
        const user = Shop.getCurrentUser();
        if (!user) return { ok: false, error: 'Vui lòng đăng nhập để đặt hàng.' };

        payment = PAYMENTS[payment] ? payment : 'cod';
        options = options || {};
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
        if (lines.length !== readCart().length) return { ok: false, error: 'Giỏ hàng có sản phẩm đã ngừng bán. Vui lòng xóa sản phẩm đó trước khi đặt.' };
        if (!lines.length) return { ok: false, error: 'Giỏ hàng đang trống.' };
        for (let i = 0; i < lines.length; i++) {
            if (!Number.isSafeInteger(lines[i].quantity) || lines[i].quantity < 1) return { ok: false, error: 'Số lượng sản phẩm trong giỏ không hợp lệ.' };
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

        const subtotal = lines.reduce(function (s, l) { return s + l.subtotal; }, 0);
        const shippingFee = Math.max(0, Number(options.shipping_fee) || 0);
        const discount = Math.min(subtotal, Math.max(0, Number(options.discount) || 0));
        const order = {
            id: orderId,
            customer_id: user.id,
            order_date: Shop.nowString(),
            status: payment === 'online' ? 'payment_success' : STATUS_NEW,
            // TODO: đối chiếu tên cột với DB_SCHEMA.orders (database/) và Thành viên 3
            receiver_name: a.receiver,
            receiver_phone: a.phone,
            ship_address_detail: a.address_detail,
            ship_ward: a.ward,
            ship_district: a.district,
            ship_city: a.city,
            payment_method: payment,
            payment_channel: payment === 'online' && PAYMENT_CHANNELS[options.payment_channel] ? options.payment_channel : null,
            subtotal: subtotal,
            shipping_fee: shippingFee,
            discount_amount: discount,
            promo_code: String(options.promo_code || ''),
            order_note: String(options.order_note || ''),
            total_amount: subtotal + shippingFee - discount
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
        if (typeof Shop.createNotification === 'function') {
            Shop.createNotification(user.id, order.status, orderId);
        }
        clearCart();
        return { ok: true, order_id: orderId };
    }

    // ---------- Lịch sử và đặt lại đơn ----------
    // Lấy chi tiết đơn cùng danh sách sản phẩm đã mua
    function getOrderDetail(orderId) {
        const user = Shop.getCurrentUser();
        if (!user) return null;
        const db = Shop.loadDB();
        const order = Shop.findById(db.orders, orderId);
        if (!order || Number(order.customer_id) !== Number(user.id)) return null;
        const items = (db.order_items || [])
            .filter(function (it) { return Number(it.order_id) === Number(order.id); })
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

    // Đưa sản phẩm của đơn đã hủy hoặc đã giao lại vào giỏ
    function reorderOrder(orderId) {
        const detail = getOrderDetail(orderId);
        if (!detail) return { ok: false, error: 'Không tìm thấy đơn hàng.' };
        if (['cancelled', 'delivered'].indexOf(Shop.normalizeStatus(detail.order.status)) === -1) {
            return { ok: false, error: 'Chỉ có thể đặt lại đơn hàng đã hủy hoặc đã giao.' };
        }

        const currentCart = readCart();
        const requested = {};
        for (let i = 0; i < detail.items.length; i++) {
            const item = detail.items[i];
            const product = item.product;
            if (!product || !Shop.getProductById(product.id)) return { ok: false, error: 'Một sản phẩm trong đơn không còn kinh doanh.' };
            const productId = Number(product.id);
            if (!Number.isSafeInteger(Number(item.quantity)) || Number(item.quantity) < 1) return { ok: false, error: 'Số lượng trong đơn không hợp lệ.' };
            requested[productId] = (requested[productId] || 0) + Number(item.quantity);
            const current = currentCart.find(function (cartItem) { return Number(cartItem.product_id) === productId; });
            const stock = Number(product.stock_qty || 0);
            if (!Number.isSafeInteger((current ? Number(current.quantity) : 0) + requested[productId]) || (current ? Number(current.quantity) : 0) + requested[productId] > stock) {
                return { ok: false, error: '"' + product.name + '" không đủ số lượng tồn kho.' };
            }
        }

        Object.keys(requested).forEach(function (productId) {
            const current = currentCart.find(function (cartItem) { return Number(cartItem.product_id) === Number(productId); });
            if (current) current.quantity = Number(current.quantity) + requested[productId];
            else currentCart.push({ product_id: Number(productId), quantity: requested[productId] });
        });
        writeCart(currentCart);
        return { ok: true };
    }

    // Lấy toàn bộ đơn hàng của tài khoản hiện tại
    function getMyOrders() {
        const user = Shop.getCurrentUser();
        if (!user) return [];
        return (Shop.loadDB().orders || [])
            .filter(function (o) { return Number(o.customer_id) === Number(user.id); })
            .map(function (o) { return getOrderDetail(o.id); })
            .filter(Boolean)
            .sort(function (a, b) {
                return String(b.order.order_date).localeCompare(String(a.order.order_date)) || b.order.id - a.order.id;
            });
    }

    global.Cart = {
        PAYMENTS: PAYMENTS,
        PAYMENT_CHANNELS: PAYMENT_CHANNELS,
        addToCart: addToCart,
        updateQuantity: updateQuantity,
        removeFromCart: removeFromCart,
        clearCart: clearCart,
        getCartCount: getCartCount,
        getCartDetailed: getCartDetailed,
        getCartTotal: getCartTotal,
        placeOrder: placeOrder,
        getOrderDetail: getOrderDetail,
        reorderOrder: reorderOrder,
        getMyOrders: getMyOrders
    };
})(window);
