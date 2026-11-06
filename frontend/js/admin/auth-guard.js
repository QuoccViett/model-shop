(function () {
    'use strict';

    window.AdminAuthenticated = Boolean(Shop.getCurrentAdmin());
    if (window.AdminAuthenticated) return;

    // Chạy trong <head> để trang quản trị chưa được hiển thị trước khi chuyển hướng.
    document.documentElement.style.visibility = 'hidden';
    window.AdminRedirecting = true;
    const file = location.pathname.split('/').pop() || 'index.html';
    location.replace('login.html?redirect=' + encodeURIComponent(file + location.search + location.hash));
})();
