(function () {
    'use strict';

    function renderOverviewStats() {
        const statsBox = document.getElementById('overview-stats');
        if (!statsBox) return;

        // Tạm thời render dữ liệu mẫu HTML ảo, từ từ xử sau
        statsBox.innerHTML = '' +
            '<div class="stats-grid">' +
                '<div class="stat-card">' +
                    '<div class="stat-icon" style="background-color: #fff3ed; color: #ff6600;">' +
                        '<i class="fa-solid fa-wallet"></i>' +
                    '</div>' +
                    '<div class="stat-info">' +
                        '<h3>Tổng doanh thu</h3>' +
                        '<p>128.500.000 đ</p>' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-icon" style="background-color: #e6f4ea; color: #34a853;">' +
                        '<i class="fa-solid fa-cart-shopping"></i>' +
                    '</div>' +
                    '<div class="stat-info">' +
                        '<h3>Tổng đơn hàng</h3>' +
                        '<p>1,245</p>' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-icon" style="background-color: #e8f0fe; color: #1a73e8;">' +
                        '<i class="fa-solid fa-box"></i>' +
                    '</div>' +
                    '<div class="stat-info">' +
                        '<h3>Sản phẩm mô hình</h3>' +
                        '<p>30</p>' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-icon" style="background-color: #fef7e0; color: #fbbc04;">' +
                        '<i class="fa-solid fa-users"></i>' +
                    '</div>' +
                    '<div class="stat-info">' +
                        '<h3>Khách hàng</h3>' +
                        '<p>850</p>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    // Khởi tạo trang tổng quan
    renderOverviewStats();
})();