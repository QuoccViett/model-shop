(function (global) {
    'use strict';

    const STATUS = {
        order_created: { label: 'Đặt hàng thành công', color: 'var(--status-order-created)', icon: 'Đặt hàng', group: 'processing', cancellable: true },
        payment_success: { label: 'Thanh toán thành công', color: 'var(--status-payment-success)', icon: 'Thanh toán', group: 'processing', cancellable: true },
        order_confirmed: { label: 'Đã xác nhận', color: 'var(--status-order-confirmed)', icon: 'Đã xác nhận', group: 'processing', cancellable: true },
        shipping: { label: 'Đang giao', color: 'var(--status-shipping)', icon: 'Đang giao', group: 'shipping' },
        delivered: { label: 'Giao hàng thành công', color: 'var(--status-delivered)', icon: 'Đã giao', group: 'completed' },
        cancelled: { label: 'Đã hủy', color: 'var(--status-cancelled)', icon: 'Đã hủy', group: 'cancelled' }
    };
    const FLOW = Object.keys(STATUS).filter(function (status) { return status !== 'cancelled'; });
    const OLD = { new: 'order_created', processed: 'order_confirmed', delivered: 'delivered', cancelled: 'cancelled' };

    global.ORDER_STATUS = {
        all: STATUS,
        flow: FLOW,
        notifications: {
            account_created: { label: 'Tài khoản', color: 'var(--c-primary)', icon: 'Tài khoản' },
            profile_updated: { label: 'Thông tin tài khoản', color: 'var(--c-primary)', icon: '✎' },
            password_changed: { label: 'Bảo mật', color: 'var(--c-primary)', icon: '⚿' }
        },
        normalize: function (status) { return STATUS[status] ? status : (OLD[status] || 'order_created'); },
        get: function (status) { return STATUS[this.normalize(status)]; },
        className: function (status) { return 'status-' + this.normalize(status).replace(/_/g, '-'); },
        flowFor: function (paymentMethod) {
            return FLOW.filter(function (status) {
                return status !== 'payment_success' || paymentMethod === 'online' || paymentMethod === 'transfer';
            });
        },
        allowedTransitions: function (status, paymentMethod) {
            const current = this.normalize(status);
            const flow = this.flowFor(paymentMethod);
            const index = flow.indexOf(current);
            const allowed = index >= 0 && index < flow.length - 1 ? [flow[index + 1]] : [];
            if (this.canCancel(current)) allowed.push('cancelled');
            return allowed;
        },
        canTransition: function (status, nextStatus, paymentMethod) {
            return this.allowedTransitions(status, paymentMethod).indexOf(nextStatus) !== -1;
        },
        canCancel: function (status) { return Boolean(this.get(status).cancellable); },
        paymentStatus: function (order) {
            const status = this.normalize(order.status);
            if (status === 'cancelled') return 'unpaid';
            if (order.payment_method === 'online' || order.payment_method === 'transfer') {
                return status === 'order_created' ? 'unpaid' : 'paid';
            }
            return status === 'delivered' ? 'paid' : 'unpaid';
        }
    };
})(window);
