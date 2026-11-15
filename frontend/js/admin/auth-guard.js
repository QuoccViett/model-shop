(function () {
    'use strict';

    window.AdminAuthenticated = Boolean(Shop.getCurrentAdmin());
    if (window.AdminAuthenticated) return;

    // Chạy trong <head> để trang quản trị chưa được hiển thị trước khi chuyển hướng.
    document.documentElement.style.visibility = 'hidden';
    window.AdminRedirecting = true;
    const file = App.location.pathname.split('/').pop() || 'index.html';
    App.location.replace('login.html?redirect=' + encodeURIComponent(file + App.location.search + App.location.hash));
})();
