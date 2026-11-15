/* N?i dung c?c m?n h?nh, ???c App hi?n th? b?ng innerHTML. */
window.ShopViews = {
  "index.html": {
    "title": "ModelShop",
    "attributes": " data-root=\"\"",
    "html": "\n    <div id=\"site-header\"></div>\n    <!-- Container lớn của trang chủ -->\n    <main class=\"container\">\n        <div class=\"slider\" id=\"slider\"></div>\n\n        <section class=\"home-section\">\n            <div class=\"section-head\">\n                <h2>Danh mục sản phẩm</h2>\n            </div>\n\n            <div class=\"category-grid\" id=\"category-grid\"></div>\n        </section>\n\n        <section class=\"home-section\">\n            <div class=\"section-head\">\n                <h2>Thương hiệu</h2>\n            </div>\n\n            <div class=\"brand-list\" id=\"brand-list\"></div>\n        </section>\n\n        <!-- Container chứa các nhóm sản phẩm -->\n        <div id=\"product-sections\"></div>\n    </main>\n\n    <div id=\"site-footer\"></div>\n\n    \n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/member5.css",
      "css/header.css",
      "css/home.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/order-status.js",
      "js/ui.js",
      "js/notifications.js",
      "js/layout.js",
      "js/pages/home.js"
    ]
  },
  "admin/categories.html": {
    "title": "Quản Lý Loại Sản Phẩm - ModelShop Admin",
    "attributes": " data-root=\"\"",
    "html": "\n    <div class=\"admin-container\">\n        <aside class=\"admin-sidebar\" id=\"admin-sidebar\"></aside>\n        <main class=\"admin-main\">\n            <header class=\"admin-header\" id=\"admin-header\"></header>\n        </main>\n    </div>\n    \n    \n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/admin/index.css",
      "css/admin/categories.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/auth-guard.js",
      "js/admin/layout.js",
      "js/admin/categories.js"
    ]
  },
  "admin/imports.html": {
    "title": "Quản Lý Nhập Hàng - ModelShop Admin",
    "attributes": " data-root=\"\"",
    "html": "\n    <div class=\"admin-container\">\n        <!-- SIDEBAR (Được render tự động từ layout.js) -->\n        <aside class=\"admin-sidebar\" id=\"admin-sidebar\"></aside>\n\n        <main class=\"admin-main\">\n            <!-- HEADER (Được render tự động từ layout.js) -->\n            <header class=\"admin-header\" id=\"admin-header\"></header>\n\n            <div class=\"dashboard-content\">\n                <div class=\"page-title\">\n                    <h1>Quản lý nhập hàng</h1>\n                    <p>Trang chủ / Quản lý nhập hàng</p>\n                </div>\n\n                <div class=\"data-table-section\">\n                    <div class=\"table-actions-bar\">\n                        <div class=\"search-filter-group import-filters\">\n                            <input type=\"text\" id=\"imp-search\" placeholder=\"Tìm theo mã phiếu, ghi chú, mã / tên sản phẩm...\">\n                            <label class=\"date-field\">Từ ngày <input type=\"date\" id=\"imp-from\"></label>\n                            <label class=\"date-field\">Đến ngày <input type=\"date\" id=\"imp-to\"></label>\n                            <select id=\"imp-status\">\n                                <option value=\"all\">Tất cả tình trạng</option>\n                                <option value=\"draft\">Nháp - chưa hoàn thành</option>\n                                <option value=\"completed\">Đã hoàn thành</option>\n                                <option value=\"hidden\">Đã ẩn</option>\n                            </select>\n                        </div>\n                        <button class=\"btn-add\" id=\"btn-add-receipt\">\n                            Thêm phiếu nhập\n                        </button>\n                    </div>\n\n                    <div class=\"table-responsive\">\n                        <table>\n                            <thead>\n                                <tr>\n                                    <th>Mã phiếu</th>\n                                    <th>Ngày nhập</th>\n                                    <th>Ghi chú</th>\n                                    <th>Số dòng</th>\n                                    <th class=\"text-right\">Tổng tiền nhập</th>\n                                    <th>Tình trạng</th>\n                                    <th>Hành động</th>\n                                </tr>\n                            </thead>\n                            <!-- Các dòng do imports.js đổ vào -->\n                            <tbody id=\"receipt-table-body\"></tbody>\n                        </table>\n                    </div>\n\n                    <div class=\"admin-pagination\" id=\"receipt-pagination\"></div>\n                </div>\n            </div>\n\n            <!-- MODAL THÊM / SỬA PHIẾU NHẬP -->\n            <div class=\"admin-modal\" id=\"receipt-modal\">\n                <div class=\"modal-content modal-wide\">\n                    <div class=\"modal-header\">\n                        <h3 id=\"receipt-modal-title\">Thêm phiếu nhập</h3>\n                        <button class=\"modal-close\" id=\"btn-close-receipt\">&times;</button>\n                    </div>\n                    <div class=\"modal-body\">\n                        <input type=\"hidden\" id=\"receipt-id\">\n                        <div class=\"receipt-head\">\n                            <div class=\"form-group\">\n                                <label>Ngày nhập *</label>\n                                <input type=\"date\" id=\"receipt-date\">\n                            </div>\n                            <div class=\"form-group\">\n                                <label>Ghi chú</label>\n                                <input type=\"text\" id=\"receipt-note\" placeholder=\"Ví dụ: Nhập Gundam đợt 2\">\n                            </div>\n                        </div>\n\n                        <table class=\"receipt-items\">\n                            <thead>\n                                <tr>\n                                    <th>Sản phẩm *</th>\n                                    <th class=\"col-price\">Giá nhập (đ) *</th>\n                                    <th class=\"col-qty\">Số lượng *</th>\n                                    <th class=\"col-sum\">Thành tiền</th>\n                                    <th class=\"col-del\"></th>\n                                </tr>\n                            </thead>\n                            <!-- Các dòng sản phẩm do imports.js thêm vào -->\n                            <tbody id=\"receipt-lines\"></tbody>\n                        </table>\n                        <button type=\"button\" class=\"btn-line-add\" id=\"btn-add-line\">\n                            Thêm dòng sản phẩm\n                        </button>\n                        <div class=\"receipt-total\">Tổng tiền phiếu: <strong id=\"receipt-total\">0 đ</strong></div>\n                    </div>\n                    <div class=\"modal-footer\">\n                        <button class=\"btn-secondary\" id=\"btn-cancel-receipt\">Hủy</button>\n                        <button class=\"btn-primary\" id=\"btn-save-receipt\">Lưu phiếu</button>\n                    </div>\n                </div>\n            </div>\n\n            <!-- MODAL XEM CHI TIẾT PHIẾU -->\n            <div class=\"admin-modal\" id=\"view-modal\">\n                <div class=\"modal-content modal-wide\">\n                    <div class=\"modal-header\">\n                        <h3 id=\"view-modal-title\">Chi tiết phiếu nhập</h3>\n                        <button class=\"modal-close\" id=\"btn-close-view\">&times;</button>\n                    </div>\n                    <!-- Nội dung chi tiết do imports.js đổ vào -->\n                    <div class=\"modal-body\" id=\"view-modal-body\"></div>\n                    <div class=\"modal-footer\">\n                        <button class=\"btn-secondary\" id=\"btn-ok-view\">Đóng</button>\n                    </div>\n                </div>\n            </div>\n        </main>\n    </div>\n\n    \n    \n    \n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/admin/index.css",
      "css/admin/products.css",
      "css/admin/imports.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/auth-guard.js",
      "js/admin/shop-imports.js",
      "js/admin/layout.js",
      "js/admin/imports.js"
    ]
  },
  "admin/index.html": {
    "title": "Trang Quản Trị - ModelShop Admin",
    "attributes": " data-root=\"\"",
    "html": "\n\n    <div class=\"admin-container\">\n        <!-- SIDEBAR (Được render tự động từ layout.js) -->\n        <aside class=\"admin-sidebar\" id=\"admin-sidebar\"></aside>\n\n        <!-- MAIN CONTENT -->\n        <main class=\"admin-main\">\n            <!-- HEADER (Được render tự động từ layout.js) -->\n            <header class=\"admin-header\" id=\"admin-header\"></header>\n\n            <!-- DASHBOARD CONTENT -->\n            <div class=\"dashboard-content\">\n                <div class=\"page-title\">\n                    <h1>Tổng quan hệ thống</h1>\n                    <p>Trang chủ / Bảng điều khiển</p>\n                </div>\n\n                <!-- CARDS THỐNG KÊ (Tạm thời là dữ liệu ảo, sau này làm tới tách sau) -->\n                <div id=\"overview-stats\"></div>\n                <section class=\"overview-notices\" aria-labelledby=\"overview-notices-title\">\n                    <div class=\"overview-notices-heading\">\n                        <div>\n                            <p class=\"overview-notices-eyebrow\">Cần theo dõi</p>\n                            <h2 id=\"overview-notices-title\">Thông báo &amp; cảnh báo</h2>\n                            <p id=\"overview-notices-summary\" aria-live=\"polite\"></p>\n                        </div>\n                        <span class=\"overview-notices-total\" id=\"overview-notices-total\" aria-label=\"Tổng số thông báo\">0</span>\n                    </div>\n                    <nav id=\"overview-notices-counts\" class=\"overview-notices-counts\" aria-label=\"Nhóm thông báo\"></nav>\n                    <div id=\"overview-notices-list\" class=\"overview-notices-list\"></div>\n                    <div id=\"overview-notices-pagination\" class=\"admin-pagination\" hidden></div>\n                </section>\n                <section class=\"overview-contacts\" aria-labelledby=\"overview-contacts-title\">\n                    <h2 id=\"overview-contacts-title\">Liên hệ khách hàng</h2>\n                    <div id=\"contact-messages\"></div>\n                    <div id=\"contact-messages-pagination\" class=\"admin-pagination\" hidden></div>\n                </section>\n\n            </div>\n        </main>\n    </div>\n\n    \n    \n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/admin/index.css",
      "css/admin/overview-notices.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/auth-guard.js",
      "js/admin/layout.js",
      "js/admin/overview.js"
    ]
  },
  "admin/inventory.html": {
    "title": "Quản lý tồn kho - ModelShop Admin",
    "attributes": " data-root=\"\"",
    "html": "\n\n    <div class=\"admin-container\">\n\n        <aside class=\"admin-sidebar\" id=\"admin-sidebar\"></aside>\n\n        <main class=\"admin-main\">\n\n            <header class=\"admin-header\" id=\"admin-header\"></header>\n\n            <div class=\"dashboard-content inventory-page\">\n\n                <!-- TIÊU ĐỀ -->\n                <div class=\"page-title\">\n                    <h1>Quản lý tồn kho</h1>\n                    <p>Trang chủ / Quản lý tồn kho</p>\n                </div>\n\n                <!-- THỐNG KÊ -->\n                <div class=\"inventory-stats\">\n\n                    <div class=\"inventory-stat-card\">\n                        <div class=\"stat-icon blue\">\n                            <i class=\"fa-solid fa-boxes-stacked\"></i>\n                        </div>\n\n                        <div>\n                            <span>Tổng sản phẩm</span>\n                            <strong id=\"stat-total\">0</strong>\n                        </div>\n                    </div>\n\n                    <div class=\"inventory-stat-card\">\n                        <div class=\"stat-icon green\">\n                            <i class=\"fa-solid fa-box-open\"></i>\n                        </div>\n\n                        <div>\n                            <span>Còn hàng</span>\n                            <strong id=\"stat-in-stock\">0</strong>\n                        </div>\n                    </div>\n\n                    <div class=\"inventory-stat-card\">\n                        <div class=\"stat-icon orange\">\n                            <i class=\"fa-solid fa-triangle-exclamation\"></i>\n                        </div>\n\n                        <div>\n                            <span>Sắp hết hàng</span>\n                            <strong id=\"stat-low-stock\">0</strong>\n                        </div>\n                    </div>\n\n                    <div class=\"inventory-stat-card\">\n                        <div class=\"stat-icon red\">\n                            <i class=\"fa-solid fa-circle-xmark\"></i>\n                        </div>\n\n                        <div>\n                            <span>Hết hàng</span>\n                            <strong id=\"stat-out-stock\">0</strong>\n                        </div>\n                    </div>\n\n                </div>\n\n                <!-- CẢNH BÁO CÓ THỂ THU GỌN -->\n                <section class=\"inventory-panel inventory-warning-panel\">\n\n                    <button\n                        type=\"button\"\n                        class=\"inventory-warning-toggle\"\n                        id=\"inventory-warning-toggle\"\n                        aria-expanded=\"false\"\n                        aria-controls=\"inventory-warning-content\"\n                    >\n\n                        <span class=\"inventory-warning-heading\">\n\n                            <i class=\"fa-solid fa-triangle-exclamation\"></i>\n\n                            <span>Cảnh báo tồn kho</span>\n\n                            <span\n                                class=\"inventory-warning-count\"\n                                id=\"inventory-warning-count\"\n                            >0</span>\n\n                        </span>\n\n                        <i\n                            class=\"fa-solid fa-chevron-down inventory-warning-arrow\"\n                        ></i>\n\n                    </button>\n\n                    <div\n                        class=\"inventory-warning-content\"\n                        id=\"inventory-warning-content\"\n                        hidden\n                    >\n\n                        <div\n                            id=\"inventory-warning-list\"\n                            class=\"inventory-warning-list\"\n                        ></div>\n\n                    </div>\n\n                </section>\n\n                <!-- BỘ LỌC -->\n                <section class=\"inventory-panel\">\n\n                    <div class=\"inventory-panel-title\">\n                        <h2>Bộ lọc tra cứu tồn kho</h2>\n                    </div>\n\n                    <div class=\"inventory-filters\">\n\n                        <label class=\"filter-field\">\n                            <span>Tìm kiếm sản phẩm</span>\n\n                            <input\n                                type=\"text\"\n                                id=\"inventory-search\"\n                                placeholder=\"Nhập mã hoặc tên sản phẩm...\"\n                            >\n                        </label>\n\n                        <label class=\"filter-field\">\n                            <span>Tình trạng kinh doanh</span>\n                            <select id=\"inventory-status\">\n                                <option value=\"all\">Tất cả sản phẩm</option>\n                                <option value=\"active\">Đang kinh doanh</option>\n                                <option value=\"discontinued\">Ngừng kinh doanh</option>\n                            </select>\n                        </label>\n\n                        <label class=\"filter-field\">\n                            <span>Loại sản phẩm</span>\n\n                            <select id=\"inventory-category\">\n                                <option value=\"all\">\n                                    Tất cả loại sản phẩm\n                                </option>\n                            </select>\n                        </label>\n\n                        <label class=\"filter-field\">\n                            <span>Ngày bắt đầu</span>\n\n                            <input\n                                type=\"date\"\n                                id=\"inventory-from\"\n                            >\n                        </label>\n\n                        <label class=\"filter-field\">\n                            <span>Ngày kết thúc</span>\n\n                            <input\n                                type=\"date\"\n                                id=\"inventory-to\"\n                            >\n                        </label>\n\n                    </div>\n\n                    <div class=\"inventory-filter-actions\">\n\n                        <button\n                            type=\"button\"\n                            id=\"inventory-reset\"\n                            class=\"btn-reset\"\n                        >\n                            <i class=\"fa-solid fa-rotate-left\"></i>\n                            Đặt lại bộ lọc\n                        </button>\n\n                    </div>\n\n                    <p\n                        class=\"inventory-filter-note\"\n                        id=\"inventory-period-note\"\n                    ></p>\n\n                </section>\n\n                <!-- BẢNG NHẬP - XUẤT - TỒN -->\n                <section class=\"inventory-panel\">\n\n                    <div class=\"inventory-panel-title\">\n                        <h2>Báo cáo Nhập – Xuất – Tồn</h2>\n                    </div>\n\n                    <div class=\"inventory-table-wrap\">\n\n                        <table class=\"inventory-table\">\n\n                            <thead>\n                                <tr>\n                                    <th>Mã SP</th>\n                                    <th>Tên sản phẩm</th>\n                                    <th>Loại sản phẩm</th>\n                                    <th class=\"number\">Tồn đầu kỳ</th>\n                                    <th class=\"number\">Tổng nhập</th>\n                                    <th class=\"number\">Tổng xuất</th>\n                                    <th class=\"number\">Tồn cuối kỳ</th>\n                                    <th>Trạng thái hiện tại</th>\n                                </tr>\n                            </thead>\n\n                            <tbody id=\"inventory-table-body\"></tbody>\n\n                            <tfoot id=\"inventory-table-footer\"></tfoot>\n\n                        </table>\n\n                    </div>\n\n                    <div class=\"admin-pagination\" id=\"inventory-pagination\"></div>\n\n                    <p\n                        id=\"inventory-data-note\"\n                        class=\"inventory-data-note\"\n                    ></p>\n\n                </section>\n\n            </div>\n\n        </main>\n\n    </div>\n\n    \n    \n\n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/admin/index.css",
      "css/admin/inventory.css?v=4"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/auth-guard.js",
      "js/admin/layout.js",
      "js/admin/inventory.js?v=4"
    ]
  },
  "admin/login.html": {
    "title": "Đăng nhập Quản Trị - ModelShop Admin",
    "attributes": "",
    "html": "\n\n    <div class=\"login-wrapper\">\n        <div class=\"login-card\">\n            <!-- Header của form -->\n            <div class=\"login-header\">\n                <h2>Model<span>Shop</span></h2>\n                <p>Hệ thống Quản Trị Viên (Admin)</p>\n            </div>\n            <div id=\"form-error\" class=\"alert alert-error\" hidden></div>\n\n            <!-- Form đăng nhập -->\n            <form action=\"\" id=\"admin-login-form\">\n                <div class=\"form-group\">\n                    <label for=\"username\">Tên đăng nhập hoặc Email</label>\n                    <div class=\"input-with-icon\">\n                        <i class=\"fa-solid fa-user\"></i>\n                        <input type=\"text\" id=\"username\" placeholder=\"Nhập tên đăng nhập...\" required>\n                    </div>\n                </div>\n\n                <div class=\"form-group\">\n                    <label for=\"password\">Mật khẩu</label>\n                    <div class=\"input-with-icon\">\n                        <i class=\"fa-solid fa-lock\"></i>\n                        <input type=\"password\" id=\"password\" placeholder=\"Nhập mật khẩu...\" required>\n                    </div>\n                </div>\n\n                <div class=\"form-options\">\n                    <label class=\"remember-me\">\n                        <input type=\"checkbox\"> Nhớ tài khoản này\n                    </label>\n                    <a data-route=\"#\" class=\"forgot-password\">Quên mật khẩu?</a>\n                </div>\n\n                <button type=\"submit\" class=\"btn-login\">Đăng nhập</button>\n            </form>\n\n            <!-- Footer nhỏ dưới form -->\n            <div class=\"login-footer\">\n                <p>&copy; 2026 ModelShop Admin Panel. Bảo mật hệ thống.</p>\n            </div>\n        </div>\n    </div>\n\n    \n    \n    \n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/admin/login.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/login.js"
    ]
  },
  "admin/orders.html": {
    "title": "Quản Lý Đơn Hàng - ModelShop Admin",
    "attributes": " data-root=\"\"",
    "html": "\n\n    <div class=\"admin-container\">\n\n        <aside class=\"admin-sidebar\" id=\"admin-sidebar\"></aside>\n\n        <main class=\"admin-main\">\n            <header class=\"admin-header\" id=\"admin-header\"></header>\n        </main>\n\n    </div>\n\n    \n    \n    \n\n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/style.css",
      "css/admin/index.css",
      "css/admin/products.css",
      "css/admin/orders.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/auth-guard.js",
      "js/order-status.js",
      "js/admin/layout.js",
      "js/admin/orders.js"
    ]
  },
  "admin/prices.html": {
    "title": "Quản Lý Giá Bán - ModelShop Admin",
    "attributes": " data-root=\"\"",
    "html": "\n    <div class=\"admin-container\">\n        <!-- SIDEBAR (Được render tự động từ layout.js) -->\n        <aside class=\"admin-sidebar\" id=\"admin-sidebar\"></aside>\n\n        <main class=\"admin-main\">\n            <!-- HEADER (Được render tự động từ layout.js) -->\n            <header class=\"admin-header\" id=\"admin-header\"></header>\n\n            <div class=\"dashboard-content\">\n                <div class=\"page-title\">\n                    <h1>Quản lý giá bán</h1>\n                    <p>Trang chủ / Quản lý giá bán</p>\n                </div>\n\n                <!-- <div class=\"price-hint\">\n                    <strong>Cách tính:</strong> giá bán = giá vốn x (1 + % lợi nhuận ÷ 100), làm tròn đến nghìn đồng.<br>\n                    <strong>Ưu tiên:</strong> % lợi nhuận riêng của sản phẩm được dùng trước. Sản phẩm để trống ô % riêng sẽ dùng % của loại.<br>\n                    Giá vốn do phiếu nhập hàng quyết định, sản phẩm chưa nhập hàng thì chưa có giá bán.\n                </div> -->\n\n                <!-- THANH TAB -->\n                <div class=\"price-tabs\" role=\"tablist\">\n                    <button type=\"button\" class=\"price-tab active\" role=\"tab\" aria-selected=\"true\" data-tab=\"profit\">\n                        <i class=\"fa-solid fa-percent\"></i> Lợi nhuận\n                    </button>\n                    <button type=\"button\" class=\"price-tab\" role=\"tab\" aria-selected=\"false\" data-tab=\"cost\">\n                        <i class=\"fa-solid fa-coins\"></i> Giá vốn\n                    </button>\n                </div>\n\n                <!-- TAB 1. % LỢI NHUẬN THEO LOẠI -->\n                <div class=\"data-table-section price-section price-panel\" id=\"tab-profit\" role=\"tabpanel\">\n                    <h3>% lợi nhuận theo loại sản phẩm</h3>\n                    <p class=\"section-note\">Áp dụng cho mọi sản phẩm trong loại chưa có % riêng.</p>\n                    <div class=\"table-responsive\">\n                        <table>\n                            <thead>\n                                <tr>\n                                    <th>Loại sản phẩm</th>\n                                    <th>Số sản phẩm</th>\n                                    <th>Số sản phẩm có % riêng</th>\n                                    <th>% lợi nhuận của loại</th>\n                                    <th>Trạng thái</th>\n                                    <th></th>\n                                </tr>\n                            </thead>\n                            <!-- Các dòng do prices.js đổ vào -->\n                            <tbody id=\"category-price-body\"></tbody>\n                        </table>\n                    </div>\n\n                    <div class=\"admin-pagination\" id=\"category-price-pagination\"></div>\n                </div>\n\n                <!-- TAB 2. GIÁ VỐN, % LỢI NHUẬN, GIÁ BÁN THEO SẢN PHẨM -->\n                <div class=\"data-table-section price-section price-panel\" id=\"tab-cost\" role=\"tabpanel\" hidden>\n                    <h3>Giá vốn, % lợi nhuận và giá bán theo sản phẩm</h3>\n                    <p class=\"section-note\">Gõ % riêng rồi bấm Lưu (hoặc Enter). Giá bán xem trước ngay khi gõ.</p>\n                    <div class=\"table-actions-bar\">\n                        <div class=\"search-filter-group import-filters-inline\">\n                            <input type=\"text\" id=\"price-search\" placeholder=\"Tìm theo mã hoặc tên sản phẩm...\">\n                            <select id=\"price-category\">\n                                <option value=\"all\">Tất cả loại</option>\n                                <!-- Các loại sản phẩm do prices.js thêm vào -->\n                            </select>\n                        </div>\n                        <span class=\"muted\" id=\"price-count\"></span>\n                    </div>\n                    <div class=\"table-responsive\">\n                        <table>\n                            <thead>\n                                <tr>\n                                    <th>Mã</th>\n                                    <th>Tên sản phẩm</th>\n                                    <th>Loại</th>\n                                    <th class=\"text-right\">Giá vốn</th>\n                                    <th>% lợi nhuận riêng</th>\n                                    <th>% đang áp dụng</th>\n                                    <th class=\"text-right\">Giá bán</th>\n                                    <th></th>\n                                </tr>\n                            </thead>\n                            <!-- Các dòng do prices.js đổ vào -->\n                            <tbody id=\"product-price-body\"></tbody>\n                        </table>\n                    </div>\n\n                    <div class=\"admin-pagination\" id=\"product-price-pagination\"></div>\n                </div>\n            </div>\n\n            <!-- Thông báo nổi -->\n            <div class=\"price-toast\" id=\"price-toast\"></div>\n        </main>\n    </div>\n\n    \n    \n    \n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/admin/index.css",
      "css/admin/products.css",
      "css/admin/prices.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/auth-guard.js",
      "js/admin/shop-prices.js",
      "js/admin/layout.js",
      "js/admin/prices.js"
    ]
  },
  "admin/products.html": {
    "title": "Quản Lý Sản Phẩm - ModelShop Admin",
    "attributes": " data-root=\"\"",
    "html": "\n    <div class=\"admin-container\">\n        <aside class=\"admin-sidebar\" id=\"admin-sidebar\"></aside>\n        <main class=\"admin-main\">\n            <header class=\"admin-header\" id=\"admin-header\"></header>\n        </main>\n    </div>\n    \n    \n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/admin/index.css",
      "css/admin/products.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/auth-guard.js",
      "js/admin/layout.js",
      "js/admin/products.js"
    ]
  },
  "admin/users.html": {
    "title": "Quản Lý Người Dùng - ModelShop Admin",
    "attributes": " data-root=\"\"",
    "html": "\n    <div class=\"admin-container\">\n        <aside class=\"admin-sidebar\" id=\"admin-sidebar\"></aside>\n        <main class=\"admin-main\">\n            <header class=\"admin-header\" id=\"admin-header\"></header>\n        </main>\n    </div>\n    \n    \n",
    "css": [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "css/admin/index.css",
      "css/admin/users.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/admin/auth-guard.js",
      "js/admin/layout.js",
      "js/admin/users.js"
    ]
  },
  "pages/about.html": {
    "title": "Giới thiệu - ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n\n    <!-- TODO: tạo thư mục images/about/, tải ảnh về và nén mỗi ảnh dưới 200KB:\n         hero.jpg (1200x900), story.jpg (1200x900), cat-gundam.jpg, cat-figure.jpg,\n         cat-car.jpg, cat-military.jpg (mỗi ảnh 800x600). -->\n    <main class=\"container about-page\">\n        <div class=\"about-breadcrumb\">\n            <a data-route=\"../index.html\" title=\"Trang chủ\">Trang chủ</a> / Giới thiệu\n        </div>\n\n        <section class=\"about-section about-hero\" aria-labelledby=\"aboutHeroTitle\">\n            <div class=\"about-hero__content\">\n                <p class=\"about-eyebrow\">VỀ CHÚNG TÔI</p>\n                <h1 id=\"aboutHeroTitle\">ModelShop – Thỏa trí đam mê, nâng tầm bộ sưu tập</h1>\n                <p class=\"about-hero__lead\">ModelShop là nơi hội tụ những sản phẩm mô hình dành cho người mới bắt đầu và người chơi lâu năm. Chúng tôi chọn lọc sản phẩm rõ nguồn gốc, đa dạng phân khúc và luôn sẵn sàng đồng hành cùng niềm đam mê của bạn.</p>\n                <div class=\"about-button-row\">\n                    <a class=\"about-button about-button--primary\" data-route=\"products.html\">Xem sản phẩm</a>\n                    <a class=\"about-button about-button--secondary\" data-route=\"contact.html\">Liên hệ</a>\n                </div>\n            </div>\n            <figure class=\"about-hero__figure\">\n                <!-- TODO: tải ảnh về images/about/hero.jpg -->\n                <img src=\"../images/about/hero.jpg\" width=\"1200\" height=\"900\" alt=\"Không gian trưng bày mô hình tại ModelShop\" loading=\"lazy\">\n            </figure>\n        </section>\n\n        <section class=\"about-section about-highlights\" aria-label=\"Điểm nổi bật\">\n            <div class=\"about-highlight\">\n                <strong>01</strong>\n                <span>Hàng chính hãng</span>\n                <!-- TODO: thay bằng số liệu thật -->\n            </div>\n            <div class=\"about-highlight\">\n                <strong>02</strong>\n                <span>Nhiều dòng sản phẩm</span>\n                <!-- TODO: thay bằng số liệu thật -->\n            </div>\n            <div class=\"about-highlight\">\n                <strong>03</strong>\n                <span>Tư vấn tận tình</span>\n                <!-- TODO: thay bằng số liệu thật -->\n            </div>\n            <div class=\"about-highlight\">\n                <strong>04</strong>\n                <span>Giao hàng toàn quốc</span>\n                <!-- TODO: thay bằng số liệu thật -->\n            </div>\n        </section>\n\n        <section class=\"about-section about-story\" aria-labelledby=\"aboutStoryTitle\">\n            <figure class=\"about-story__figure\">\n                <!-- TODO: tải ảnh về images/about/story.jpg -->\n                <img src=\"../images/about/story.jpg\" width=\"1200\" height=\"900\" alt=\"Khu vực trưng bày sản phẩm của ModelShop\" loading=\"lazy\">\n            </figure>\n            <div class=\"about-story__content\">\n                <p class=\"about-eyebrow\">CÂU CHUYỆN CỦA SHOP</p>\n                <h2 id=\"aboutStoryTitle\">Bắt đầu từ niềm yêu thích mô hình</h2>\n                <p>ModelShop được xây dựng tại 273 An Dương Vương, Phường Chợ Quán với mong muốn tạo ra một nơi người chơi có thể tìm thấy sản phẩm phù hợp và nhận được tư vấn dễ hiểu, thực tế.</p>\n                <p>Từ Gundam, Figure, xe mô hình đến mô hình quân sự và phụ kiện, cửa hàng luôn cố gắng mang đến lựa chọn đa dạng cho nhiều sở thích và ngân sách khác nhau.</p>\n                <blockquote>“Mỗi mô hình hoàn thiện là một câu chuyện được kể bằng sự kiên nhẫn và đam mê.”</blockquote>\n            </div>\n        </section>\n\n        <section class=\"about-section about-categories\" aria-labelledby=\"aboutCategoriesTitle\">\n            <div class=\"about-section-heading\">\n                <h2 id=\"aboutCategoriesTitle\">Danh mục sản phẩm</h2>\n                <p>Khám phá những dòng sản phẩm được người chơi mô hình yêu thích.</p>\n            </div>\n            <div class=\"about-card-grid\">\n                <a class=\"about-card\" data-route=\"products.html?category=1\">\n                    <!-- TODO: tải ảnh về images/about/cat-gundam.jpg -->\n                    <img src=\"../images/about/cat-gundam.jpg\" width=\"800\" height=\"600\" alt=\"Danh mục mô hình Gundam\" loading=\"lazy\">\n                    <div class=\"about-card__body\">\n                        <h3>Gundam</h3>\n                        <p>Mô hình lắp ráp nhiều cấp độ dành cho người mới và người chơi chuyên sâu.</p>\n                        <span class=\"about-card__link\">Xem thêm</span>\n                    </div>\n                </a>\n                <a class=\"about-card\" data-route=\"products.html?category=2\">\n                    <!-- TODO: tải ảnh về images/about/cat-figure.jpg -->\n                    <img src=\"../images/about/cat-figure.jpg\" width=\"800\" height=\"600\" alt=\"Danh mục Figure Anime\" loading=\"lazy\">\n                    <div class=\"about-card__body\">\n                        <h3>Figure Anime</h3>\n                        <p>Những nhân vật anime nổi bật với tạo hình sống động và nhiều phong cách.</p>\n                        <span class=\"about-card__link\">Xem thêm</span>\n                    </div>\n                </a>\n                <a class=\"about-card\" data-route=\"products.html?category=3\">\n                    <!-- TODO: tải ảnh về images/about/cat-car.jpg -->\n                    <img src=\"../images/about/cat-car.jpg\" width=\"800\" height=\"600\" alt=\"Danh mục mô hình xe\" loading=\"lazy\">\n                    <div class=\"about-card__body\">\n                        <h3>Mô hình xe</h3>\n                        <p>Các mẫu xe mô hình phù hợp để sưu tầm, trưng bày và làm quà tặng.</p>\n                        <span class=\"about-card__link\">Xem thêm</span>\n                    </div>\n                </a>\n                <a class=\"about-card\" data-route=\"products.html?category=4\">\n                    <!-- TODO: tải ảnh về images/about/cat-military.jpg -->\n                    <img src=\"../images/about/cat-military.jpg\" width=\"800\" height=\"600\" alt=\"Danh mục mô hình quân sự và phụ kiện\" loading=\"lazy\">\n                    <div class=\"about-card__body\">\n                        <h3>Mô hình quân sự và phụ kiện</h3>\n                        <p>Bổ sung không gian trưng bày với mô hình quân sự và phụ kiện cần thiết.</p>\n                        <span class=\"about-card__link\">Xem thêm</span>\n                    </div>\n                </a>\n            </div>\n        </section>\n\n        <section class=\"about-section about-reasons\" aria-labelledby=\"aboutReasonsTitle\">\n            <div class=\"about-section-heading\">\n                <h2 id=\"aboutReasonsTitle\">Vì sao chọn chúng tôi</h2>\n                <p>Những điều ModelShop tập trung để mỗi lần mua sắm trở nên yên tâm hơn.</p>\n            </div>\n            <div class=\"about-reason-grid\">\n                <article class=\"about-reason\"><strong>01</strong><h3>Hàng chính hãng rõ nguồn gốc</h3><p>Thông tin sản phẩm rõ ràng, giúp bạn an tâm khi lựa chọn.</p></article>\n                <article class=\"about-reason\"><strong>02</strong><h3>Đa dạng mẫu mã và phân khúc giá</h3><p>Nhiều lựa chọn để bắt đầu chơi hoặc mở rộng bộ sưu tập.</p></article>\n                <article class=\"about-reason\"><strong>03</strong><h3>Tư vấn đúng nhu cầu người chơi</h3><p>Gợi ý theo kinh nghiệm, sở thích và ngân sách của bạn.</p></article>\n                <article class=\"about-reason\"><strong>04</strong><h3>Đóng gói cẩn thận</h3><p>Sản phẩm được chuẩn bị kỹ trước khi gửi đến khách hàng.</p></article>\n                <article class=\"about-reason\"><strong>05</strong><h3>Giao hàng nhanh</h3><p>Hỗ trợ xử lý đơn hàng thuận tiện và chủ động.</p></article>\n                <article class=\"about-reason\"><strong>06</strong><h3>Hỗ trợ sau bán hàng</h3><p>Luôn tiếp nhận câu hỏi để hành trình chơi mô hình trọn vẹn hơn.</p></article>\n            </div>\n        </section>\n\n        <section class=\"about-section about-process\" aria-labelledby=\"aboutProcessTitle\">\n            <div class=\"about-section-heading\">\n                <h2 id=\"aboutProcessTitle\">Quy trình mua hàng</h2>\n                <p>Bốn bước đơn giản để bạn sở hữu sản phẩm yêu thích.</p>\n            </div>\n            <ol class=\"about-process-list\">\n                <li><span>1</span><h3>Chọn sản phẩm</h3><p>Tìm mẫu phù hợp với nhu cầu của bạn.</p></li>\n                <li><span>2</span><h3>Liên hệ hoặc đặt hàng</h3><p>Gửi yêu cầu qua kênh liên hệ của ModelShop.</p></li>\n                <li><span>3</span><h3>Xác nhận và đóng gói</h3><p>Shop kiểm tra thông tin và chuẩn bị đơn hàng.</p></li>\n                <li><span>4</span><h3>Nhận hàng</h3><p>Nhận sản phẩm và bắt đầu trải nghiệm.</p></li>\n            </ol>\n        </section>\n\n        <section class=\"about-section about-cta\" aria-labelledby=\"aboutCtaTitle\">\n            <h2 id=\"aboutCtaTitle\">Bạn cần tư vấn chọn mô hình?</h2>\n            <p>Đội ngũ ModelShop sẵn sàng lắng nghe và hỗ trợ bạn chọn sản phẩm phù hợp.</p>\n            <a class=\"about-button about-button--light\" data-route=\"contact.html\">Liên hệ ngay</a>\n        </section>\n\n        <section class=\"about-store-info\" aria-label=\"Thông tin cửa hàng\">\n            <div><span>ĐỊA CHỈ</span><strong>273 An Dương Vương, Phường Chợ Quán</strong></div>\n            <div><span>EMAIL</span><strong><a data-route=\"mailto:admin@example.com\">admin@example.com</a></strong></div>\n            <div><span>HOTLINE</span><strong><a data-route=\"tel:0900000001\">0900 00 00 01</a> - <a data-route=\"tel:09000000012\">0900 00 00 02</a></strong></div>\n        </section>\n    </main>\n\n    <div id=\"site-footer\"></div>\n\n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/header.css",
      "css/about.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/order-status.js",
      "js/ui.js",
      "js/notifications.js",
      "js/layout.js"
    ]
  },
  "pages/cart.html": {
    "title": "Giỏ hàng - ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n    <main class=\"container shop-order-page\" id=\"app\"></main>\n    <div id=\"site-footer\"></div>\n    \n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/header.css",
      "css/member5.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/order-status.js",
      "js/notifications.js",
      "js/ui.js",
      "js/layout.js",
      "js/pages/cart-page.js"
    ]
  },
  "pages/checkout.html": {
    "title": "Thanh toán - ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n    <main class=\"container shop-order-page\" id=\"app\"></main>\n    <div id=\"site-footer\"></div>\n    \n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/header.css",
      "css/member5.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/order-status.js",
      "js/notifications.js",
      "js/ui.js",
      "js/layout.js",
      "js/pages/checkout.js"
    ]
  },
  "pages/contact.html": {
    "title": "Liên hệ - ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n\n    <main class=\"container contact-page\">\n        <div class=\"contact-breadcrumb\">\n            <a data-route=\"../index.html\" title=\"Trang chủ\">Trang chủ</a> / Liên hệ\n        </div>\n\n        <section class=\"contact-card\">\n            <h1>Liên hệ</h1>\n            <div class=\"contact-grid\">\n                <div class=\"contact-left\">\n                    <p><strong>Trụ sở chính:</strong> 273 An Dương Vương, Phường Chợ Quán</p>\n                    <p><strong>Email:</strong> <a data-route=\"mailto:admin@example.com\">admin@example.com</a></p>\n                    <p><strong>Hotline:</strong> <a data-route=\"tel:0900000001\">0900 00 00 01</a> - <a data-route=\"tel:09000000012\">0900 00 00 02</a></p>\n\n                    <form class=\"contact-form\" id=\"contactForm\" action=\"#\" method=\"post\" novalidate>\n                        <div class=\"contact-field\">\n                            <label class=\"contact-sr-only\" for=\"fullname\">Họ tên</label>\n                            <input type=\"text\" id=\"fullname\" name=\"fullname\" autocomplete=\"name\" placeholder=\"Họ tên *\">\n                            <span class=\"contact-error\" data-error-for=\"fullname\" aria-live=\"polite\"></span>\n                        </div>\n                        <div class=\"contact-field\">\n                            <label class=\"contact-sr-only\" for=\"email\">Email</label>\n                            <input type=\"email\" id=\"email\" name=\"email\" autocomplete=\"email\" placeholder=\"Email *\">\n                            <span class=\"contact-error\" data-error-for=\"email\" aria-live=\"polite\"></span>\n                        </div>\n                        <div class=\"contact-field\">\n                            <label class=\"contact-sr-only\" for=\"phone\">Số điện thoại</label>\n                            <input type=\"tel\" id=\"phone\" name=\"phone\" autocomplete=\"tel\" placeholder=\"Số điện thoại *\">\n                            <span class=\"contact-error\" data-error-for=\"phone\" aria-live=\"polite\"></span>\n                        </div>\n                        <div class=\"contact-field\">\n                            <label class=\"contact-sr-only\" for=\"message\">Lời nhắn</label>\n                            <textarea id=\"message\" name=\"message\" rows=\"3\" placeholder=\"Lời nhắn *\"></textarea>\n                            <span class=\"contact-error\" data-error-for=\"message\" aria-live=\"polite\"></span>\n                        </div>\n                        <p class=\"contact-required\">*Thông tin bắt buộc</p>\n                        <p id=\"contactSaveError\" class=\"contact-error\" role=\"alert\" hidden></p>\n                        <button type=\"submit\" id=\"contactSubmit\">Gửi liên hệ</button>\n                    </form>\n\n                    <div class=\"contact-success\" id=\"contactSuccess\" role=\"status\" hidden>\n                        <p>Gửi liên hệ thành công. Cảm ơn bạn, shop sẽ phản hồi sớm nhất.</p>\n                        <button type=\"button\" id=\"contactReset\">Gửi liên hệ khác</button>\n                    </div>\n                </div>\n\n                <div class=\"contact-right\">\n                    <div class=\"contact-map\">\n                        <iframe src=\"https://www.google.com/maps?q=273+An+D%C6%B0%C6%A1ng+V%C6%B0%C6%A1ng,+Ph%C6%B0%E1%BB%9Dng+Ch%E1%BB%A3+Qu%C3%A1n,+H%E1%BB%93+Ch%C3%AD+Minh&output=embed\" loading=\"lazy\" allowfullscreen referrerpolicy=\"no-referrer-when-downgrade\" title=\"Bản đồ 273 An Dương Vương, Phường Chợ Quán\"></iframe>\n                    </div>\n                </div>\n            </div>\n        </section>\n    </main>\n\n    <div id=\"site-footer\"></div>\n\n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/header.css",
      "css/contact.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/order-status.js",
      "js/ui.js",
      "js/notifications.js",
      "js/layout.js",
      "js/pages/contact.js"
    ]
  },
  "pages/login.html": {
    "title": "Login-ModelShop",
    "attributes": " class=\"auth-page\"",
    "html": "\n    <main class=\"auth-box\">\n        <a data-route=\"../index.html\" class=\"auth-logo\">ModelShop</a>\n\n        <div class=\"form-card\">\n            <h1>Đăng nhâp</h1>\n            <div id=\"form-success\" class=\"alert alert-success\" hidden>\n            </div>\n            <div id=\"form-error\" class=\"alert alert-error\" hidden></div>\n\n            <form action=\"\" id=\"login-form\" novalidate>\n                <div class=\"form-group\">\n                    <label for=\"username\">Tên đăng nhập</label>\n                    <input type=\"text\" name=\"username\" id=\"username\" autocomplete=\"username\">\n                </div>\n\n                <div class=\"form-group\">\n                    <label for=\"password\">Mật khẩu</label>\n                    <input type=\"password\" name=\"password\" id=\"password\" autocomplete=\"current-password\">\n                </div>\n\n                <button type=\"submit\" class=\"btn\">Đăng nhập</button>\n            </form>\n\n            <p class=\"form-foot\">Chưa có tài khoản? <a id=\"register-link\" data-route=\"register.html\">Đăng ký</a></p>\n            <p class=\"form-foot\"><a data-route=\"../index.html\">&larr; Về trang chủ</a></p>\n        </div>\n    </main>\n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/auth.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/pages/login.js"
    ]
  },
  "pages/news.html": {
    "title": "Tin tức - ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n\n    <main class=\"container news-page\">\n        <div class=\"breadcrumb news-breadcrumb\">\n            <a data-route=\"../index.html\" title=\"Trang chủ\">Trang chủ</a> / Tin tức\n        </div>\n\n        <h1 class=\"news-page__title\">Tin tức</h1>\n\n        <section id=\"news-content\" class=\"news-list\" aria-label=\"Danh sách tin tức\"></section>\n        <nav id=\"news-pagination\" class=\"news-pagination\" aria-label=\"Phân trang tin tức\"></nav>\n    </main>\n\n    <div id=\"site-footer\"></div>\n\n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/header.css",
      "css/news.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/order-status.js",
      "js/ui.js",
      "js/notifications.js",
      "js/layout.js",
      "js/pages/news.js"
    ]
  },
  "pages/order.html": {
    "title": "Chi tiết đơn hàng - ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n    <main class=\"container shop-order-page\" id=\"app\"></main>\n    <div id=\"site-footer\"></div>\n    \n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/header.css",
      "css/member5.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/order-status.js",
      "js/notifications.js",
      "js/ui.js",
      "js/layout.js",
      "js/pages/order.js"
    ]
  },
  "pages/orders.html": {
    "title": "Đơn hàng của tôi - ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n    <main class=\"container shop-order-page\" id=\"app\"></main>\n    <div id=\"site-footer\"></div>\n    \n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/header.css",
      "css/member5.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/order-status.js",
      "js/notifications.js",
      "js/ui.js",
      "js/layout.js",
      "js/pages/orders.js"
    ]
  },
  "pages/product.html": {
    "title": "Product Detail - ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n    <main class=\"container\" id=\"app\"></main>\n    <div id=\"site-footer\"></div>\n    \n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/member5.css",
      "css/header.css",
      "css/product.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/order-status.js",
      "js/ui.js",
      "js/notifications.js",
      "js/layout.js",
      "js/pages/product.js"
    ]
  },
  "pages/products.html": {
    "title": "Products-ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n\n    <!-- Container lớn của trang danh sách sản phẩm -->\n    <main class=\"container\">\n        <div class=\"breadcrumb\" id=\"breadcrumb\"></div>\n\n        <section class=\"brand-filter\" aria-label=\"Lọc theo hãng\">\n            <h2 class=\"brand-filter-title\">Thương Hiệu</h2>\n            <div class=\"brand-filter-list\" id=\"brand-filter-list\"></div>\n        </section>\n\n        <form action=\"\" id=\"filter-form\" class=\"shop-layout\">\n            <aside class=\"filter-box\">\n                <!-- <div class=\"filter-group\">\n                    <h3>Tìm theo tên sản phẩm</h3>\n                    <input class=\"filter-keyword\" type=\"search\" id=\"filter-keyword\" name=\"keyword\"\n                        placeholder=\"Ví dụ: Gundam, Figure...\">\n                    <button class=\"btn filter-search-button\" type=\"submit\">Tìm sản phẩm</button>\n                </div> -->\n                <div class=\"filter-group\">\n                    <h3>Loại sản phẩm</h3>\n                    <div id=\"filter-categories\"></div>\n                </div>\n                <div class=\"filter-group\">\n                    <h3>Khoảng giá</h3>\n                    <div id=\"filter-prices\"></div>\n                    <div class=\"custom-price-range\">\n                        <div class=\"custom-price-field\">\n                            <label for=\"filter-min-price\">Từ</label>\n                            <input type=\"number\" id=\"filter-min-price\" name=\"min\" min=\"0\" step=\"1000\" placeholder=\"Giá thấp nhất\">\n                            <span>đ</span>\n                        </div>\n                        <div class=\"custom-price-field\">\n                            <label for=\"filter-max-price\">Đến</label>\n                            <input type=\"number\" id=\"filter-max-price\" name=\"max\" min=\"0\" step=\"1000\" placeholder=\"Giá cao nhất\">\n                            <span>đ</span>\n                        </div>\n                        <button type=\"button\" class=\"btn custom-price-apply\" id=\"apply-price-filter\">Áp dụng giá</button>\n                        <small id=\"price-filter-error\" class=\"price-filter-error\" role=\"alert\" hidden></small>\n                    </div>\n                </div>\n                <div class=\"filter-group\">\n                    <label><input type=\"checkbox\" name=\"sale\" value=\"1\" id=\"filter-sale\"> Chỉ sản phẩm đang giảm giá</label>\n                </div>\n                <a data-route=\"products.html\" class=\"filter-clear\">Xóa toàn bộ bộ lọc</a>\n            </aside>\n\n            <section>\n                <div class=\"list-head\">\n                    <div>\n                        <h1 id=\"list-title\"></h1>\n                        <div class=\"count\" id=\"list-count\"></div>\n                    </div>\n                    <select name=\"sort\" id=\"sort-select\" class=\"sort-select\"></select>\n                </div>\n                <!-- Container chứa danh sách sản phẩm -->\n                <div class=\"product-grid\" id=\"product-grid\"></div>\n                <div id=\"pagination\"></div>\n            </section>\n        </form>\n    </main>\n\n    <div id=\"site-footer\"></div>\n\n    \n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/member5.css",
      "css/header.css",
      "css/products.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/order-status.js",
      "js/ui.js",
      "js/notifications.js",
      "js/layout.js",
      "js/pages/products.js"
    ]
  },
  "pages/profile.html": {
    "title": "Profile-ModelShop",
    "attributes": " data-root=\"../\"",
    "html": "\n    <div id=\"site-header\"></div>\n\n    <main class=\"container\">\n        <h1 class=\"page-title\">Tài khoản của tôi</h1>\n        <div class=\"prof-layout\">\n            <aside class=\"prof-sidebar\">\n                <button type=\"button\" class=\"prof-nav is-active\" data-prof-tab=\"account\">Thông tin tài khoản</button>\n                <button type=\"button\" class=\"prof-nav\" data-prof-tab=\"orders\">Đơn hàng của tôi</button>\n                <button type=\"button\" class=\"prof-nav\" id=\"profile-logout\">Đăng xuất</button>\n            </aside>\n            <div class=\"prof-content\">\n            <section class=\"prof-panel is-active\" data-prof-panel=\"account\">\n            <div class=\"profile-grid\">\n            <div class=\"form-card\">\n                <h2>Thông tin của tôi</h2>\n                <div id=\"info-msg\" class=\"alert\" hidden></div>\n\n                <form action=\"\" id=\"info-form\" novalidate>\n                    <div class=\"form-group\">\n                        <label for=\"username\">Tên đăng nhập</label>\n                        <input type=\"text\" name=\"username\" id=\"username\" readonly>\n                        <div class=\"hint\">Tên đăng nhập không thể thay đổi</div>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"full_name\">Họ và tên</label>\n                        <input type=\"text\" name=\"full_name\" id=\"full_name\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"email\">Email</label>\n                        <input type=\"email\" name=\"email\" id=\"email\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"phone\">Số điện thoại</label>\n                        <input type=\"tel\" name=\"phone\" id=\"phone\">\n                    </div>\n                    <h3>Địa chỉ giao hàng mặc định</h3>\n                    <div class=\"form-group\">\n                        <label for=\"address_detail\">Số nhà - đường</label>\n                        <input type=\"text\" name=\"address_detail\" id=\"address_detail\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"ward\">Phường / Xã</label>\n                        <input type=\"text\" name=\"ward\" id=\"ward\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"district\">Quận / Huyện</label>\n                        <input type=\"text\" name=\"district\" id=\"district\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"city\">Tỉnh / Thành Phố</label>\n                        <input type=\"text\" name=\"city\" id=\"city\">\n                    </div>\n\n                    <button type=\"submit\" class=\"btn\">Lưu thay đổi</button>\n                </form>\n            </div>\n            <div class=\"form-card\">\n                <h2>Đổi mật khẩu</h2>\n                <div id=\"pw-msg\" class=\"alert\" hidden></div>\n\n                <form action=\"\" id=\"pw-form\" novalidate>\n                    <div class=\"form-group\">\n                        <label for=\"current\">Mật khẩu hiện tại</label>\n                        <input type=\"password\" name=\"current\" id=\"current\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"new_password\">Mật khẩu mới</label>\n                        <input type=\"password\" name=\"new_password\" id=\"new_password\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"confirm\">Nhập lại mật khẩu mới</label>\n                        <input type=\"password\" name=\"confirm\" id=\"confirm\">\n                    </div>\n                    <button type=\"submit\" class=\"btn\">Đổi mật khẩu</button>\n                </form>\n            </div>\n            </div>\n            </section>\n            <section class=\"prof-panel\" data-prof-panel=\"orders\" id=\"orders-section\">\n                <div class=\"form-card prof-orders-card\">\n                    <div class=\"prof-orders-head\"><h2>Đơn hàng của tôi</h2><div class=\"prof-order-tabs\"><button type=\"button\" class=\"is-active\" data-order-group=\"all\">Tất cả</button><button type=\"button\" data-order-group=\"processing\">Đang xử lý</button><button type=\"button\" data-order-group=\"shipping\">Đang giao</button><button type=\"button\" data-order-group=\"completed\">Hoàn tất</button><button type=\"button\" data-order-group=\"cancelled\">Đã hủy</button></div></div>\n                    <div id=\"orders-list\"></div>\n                    <div id=\"order-detail\"></div>\n                </div>\n            </section>\n            </div>\n        </div>\n    </main>\n\n    <div id=\"site-footer\"></div>\n\n    \n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/member5.css",
      "css/header.css",
      "css/profile.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/cart.js",
      "js/order-status.js",
      "js/notifications.js",
      "js/layout.js",
      "js/pages/profile.js"
    ]
  },
  "pages/register.html": {
    "title": "Register - ModelShop",
    "attributes": " class=\"auth-page\"",
    "html": "\n    <main class=\"auth-box\">\n        <a class=\"auth-logo\" data-route=\"../index.html\">ModelShop</a>\n        <div class=\"form-card\">\n            <h1>Đăng ký tài khoản</h1>\n            <div id=\"form-error\" class=\"alert alert-error\" hidden></div>\n\n            <form action=\"\" id=\"register-form\" novalidate>\n\n                <div class=\"form-group\">\n                    <label for=\"full_name\">Họ và tên</label>\n                    <input type=\"text\" name=\"full_name\" id=\"full_name\" autocomplete=\"name\">\n                </div>\n\n                <div class=\"form-group\">\n                    <label for=\"phone\">Số điện thoại</label>\n                    <input type=\"tel\" name=\"phone\" id=\"phone\" autocomplete=\"tel\">\n                </div>\n\n                <div class=\"form-group\">\n                    <label for=\"email\">Email</label>\n                    <input type=\"email\" name=\"email\" id=\"email\" autocomplete=\"email\">\n                </div>\n\n                <div class=\"form-group\">\n                    <label for=\"username\">Tên đăng nhập</label>\n                    <input type=\"text\" name=\"username\" id=\"username\" autocomplete=\"username\">\n                    <div class=\"hint\">4-20 ký tự: chữ không dấu, số, dấu gạch ngang</div>\n                </div>\n\n                <div class=\"form-group\">\n                    <label for=\"password\">Mật khẩu</label>\n                    <input type=\"password\" name=\"password\" id=\"password\" autocomplete=\"new-password\">\n                    <div class=\"hint\">Tối thiểu 6 ký tự</div>\n                </div>\n\n                <div class=\"form-group\">\n                    <label for=\"confirm\">Nhập lại mật khẩu</label>\n                    <input type=\"password\" name=\"confirm\" id=\"confirm\" autocomplete=\"new-password\">\n                </div>\n\n                <button type=\"submit\" class=\"btn\">Đăng ký</button>\n            </form>\n\n            <p class=\"form-foot\">Đã có tài khoản ?<a data-route=\"login.html\"> Đăng nhập</a></p>\n            <p class=\"form-foot\"><a data-route=\"../index.html\">&larr; Về trang chủ</a></p>\n        </div>\n    </main>\n\n    \n    \n    \n    \n    \n    \n",
    "css": [
      "css/style.css",
      "css/auth.css"
    ],
    "scripts": [
      "js/data.js",
      "js/common.js",
      "js/order-status.js",
      "js/notifications.js",
      "js/layout.js",
      "js/pages/register.js"
    ]
  }
};
