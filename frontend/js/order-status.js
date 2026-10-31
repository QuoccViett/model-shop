(function (global) {
    'use strict';

    const STATUS = {
        order_created: { label: 'Đặt hàng thành công', color: 'var(--status-order-created)', icon: '▣', group: 'processing' },
        payment_success: { label: 'Thanh toán thành công', color: 'var(--status-payment-success)', icon: '▤', group: 'processing' },
        order_confirmed: { label: 'Đã xác nhận', color: 'var(--status-order-confirmed)', icon: '✓', group: 'processing' },
        shipping: { label: 'Đang giao', color: 'var(--status-shipping)', icon: '▱', group: 'shipping' },
        delivered: { label: 'Giao hàng thành công', color: 'var(--status-delivered)', icon: '□', group: 'completed' },
        cancelled: { label: 'Đã hủy', color: 'var(--status-cancelled)', icon: '×', group: 'cancelled' }
    };
    const FLOW = ['order_created', 'payment_success', 'order_confirmed', 'shipping', 'delivered'];
    const OLD = { new: 'order_created', processed: 'order_confirmed', delivered: 'delivered', cancelled: 'cancelled' };

    global.ORDER_STATUS = {
        all: STATUS,
        flow: FLOW,
        notifications: {
            account_created: { label: 'Tài khoản', color: 'var(--c-primary)', icon: '♙' },
            profile_updated: { label: 'Thông tin tài khoản', color: 'var(--c-primary)', icon: '✎' },
            password_changed: { label: 'Bảo mật', color: 'var(--c-primary)', icon: '⚿' }
        },
        normalize: function (status) { return STATUS[status] ? status : (OLD[status] || 'order_created'); },
        get: function (status) { return STATUS[this.normalize(status)]; },
        canCancel: function (status) { return ['order_created', 'payment_success', 'order_confirmed'].indexOf(this.normalize(status)) !== -1; },
        next: function (status, paymentMethod) {
            const current = this.normalize(status);
            if (current === 'order_created' && paymentMethod === 'cod') return 'order_confirmed';
            const index = FLOW.indexOf(current);
            return index >= 0 && index < FLOW.length - 1 ? FLOW[index + 1] : null;
        }
    };
})(window);
