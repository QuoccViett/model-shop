(function (global) {
    'use strict';
    const labels = {
        order_created: 'Đơn mới',
        payment_success: 'Thanh toán',
        order_confirmed: 'Đã xác nhận',
        shipping: 'Đang giao',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy'
    };
    function relativeTime(value) {
        const diff = Math.max(0, Date.now() - new Date(String(value).replace(' ', 'T')).getTime());
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return minutes + ' phút trước';
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + ' giờ trước';
        return Math.floor(hours / 24) + ' ngày trước';
    }
    function notificationDate(value) {
        const date = new Date(String(value).replace(' ', 'T'));
        if (Number.isNaN(date.getTime())) return String(value || '');
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    function init(root) {
        const button = document.getElementById('account-button');
        const popup = document.getElementById('notification-popup');
        const badge = document.getElementById('notification-badge');
        if (!button || !popup) return;
        let filter = 'all';
        function refreshBadge() {
            const count = Shop.getUnreadCount();
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.hidden = count === 0;
        }
        global.refreshNotificationBadge = refreshBadge;
        function render() {
            const list = Shop.getMyNotifications(filter === 'orders' ? 'orders' : '');
            popup.innerHTML = '<a class="notif-profile-link" href="' + root + 'pages/profile.html">Truy cập trang cá nhân</a>' +
                '<div class="notif-head"><strong>Thông báo</strong><button type="button" id="notif-mark-all">Đánh dấu đã đọc tất cả</button></div>' +
                '<div class="notif-tabs"><button type="button" class="notif-tab ' + (filter === 'all' ? 'is-active' : '') + '" data-notif-filter="all">Tất cả</button><button type="button" class="notif-tab ' + (filter === 'orders' ? 'is-active' : '') + '" data-notif-filter="orders">Đơn hàng</button></div>' +
                '<div class="notif-list">' + (list.length ? list.map(function (item) {
                    const type = ORDER_STATUS.notifications[item.type] ? item.type : Shop.normalizeStatus(item.type);
                    const meta = ORDER_STATUS.notifications[item.type] || ORDER_STATUS.get(type);
                    const detail = item.order_id ? '<a class="notif-detail" href="' + root + 'pages/profile.html#orders/' + item.order_id + '" data-notif-id="' + item.id + '" data-order-id="' + item.order_id + '">Xem chi tiết</a>' : '<span class="notif-detail">Đã cập nhật</span>';
                    return '<div class="notif-item ' + (!item.is_read ? 'is-unread' : '') + '" data-notif-id="' + item.id + '"' + (item.order_id ? ' data-order-id="' + item.order_id + '"' : '') + ' tabindex="0"><div><div class="notif-message">' + Shop.escapeHtml(item.message) + '</div><div class="notif-meta"><span>' + (labels[type] || (meta && meta.label) || 'Thông báo') + '</span><time datetime="' + Shop.escapeHtml(item.created_at) + '" title="' + Shop.escapeHtml(notificationDate(item.created_at)) + '">' + relativeTime(item.created_at) + ' - ' + notificationDate(item.created_at) + '</time>' + detail + '</div></div></div>';
                }).join('') : '<div class="notif-empty">Bạn chưa có thông báo nào</div>') + '</div><button type="button" class="notif-close" id="notif-close">Đóng</button>';
            popup.querySelectorAll('[data-notif-filter]').forEach(function (tab) { tab.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); filter = tab.dataset.notifFilter; render(); popup.hidden = false; }); });
            popup.querySelector('#notif-mark-all').addEventListener('click', function () { Shop.markAllRead(); render(); refreshBadge(); });
            popup.querySelectorAll('.notif-item[data-notif-id]').forEach(function (item) {
                item.addEventListener('click', function (event) {
                    event.preventDefault();
                    Shop.markRead(item.dataset.notifId);
                    refreshBadge();
                    if (item.dataset.orderId) location.href = root + 'pages/profile.html#orders/' + item.dataset.orderId;
                });
                item.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter' || event.key === ' ') item.click();
                });
            });
            popup.querySelector('#notif-close').addEventListener('click', close);
        }
        function close() { popup.hidden = true; button.setAttribute('aria-expanded', 'false'); }
        button.addEventListener('click', function () {
            const open = popup.hidden;
            if (open) render();
            popup.hidden = !open;
            button.setAttribute('aria-expanded', String(open));
            refreshBadge();
        });
        document.addEventListener('click', function (event) { if (!popup.contains(event.target) && !button.contains(event.target)) close(); });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
        global.addEventListener('storage', refreshBadge);
        global.addEventListener('modelshop:notifications', function () { refreshBadge(); if (!popup.hidden) render(); });
        refreshBadge();
        global.setInterval(function () { refreshBadge(); if (!popup.hidden) render(); }, 7000);
    }
    global.Notifications = { init: init };
})(window);
