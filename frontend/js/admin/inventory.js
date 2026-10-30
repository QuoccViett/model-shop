/* MODEL SHOP - QUẢN LÝ TỒN KHO */

(function () {
    'use strict';

    // KIỂM TRA HỆ THỐNG
    if (
        !window.Shop ||
        typeof Shop.loadDB !== 'function'
    ) {
        console.error(
            'Không tìm thấy Shop.loadDB(). ' +
            'Kiểm tra data.js và common.js.'
        );

        return;
    }

    const page = document.querySelector('.inventory-page');

    if (!page) {
        console.error('Không tìm thấy .inventory-page');
        return;
    }

    // LẤY PHẦN TỬ HTML
    const searchInput =
        document.getElementById('inventory-search');

    const categorySelect =
        document.getElementById('inventory-category');

    const fromInput =
        document.getElementById('inventory-from');

    const toInput =
        document.getElementById('inventory-to');

    const resetButton =
        document.getElementById('inventory-reset');

    const tableBody =
        document.getElementById('inventory-table-body');

    const tableFooter =
        document.getElementById('inventory-table-footer');

    const warningList =
        document.getElementById('inventory-warning-list');

    const warningToggle =
        document.getElementById('inventory-warning-toggle');

    const warningContent =
        document.getElementById('inventory-warning-content');

    const warningCount =
        document.getElementById('inventory-warning-count');

    const periodNote =
        document.getElementById('inventory-period-note');

    const dataNote =
        document.getElementById('inventory-data-note');

    const statTotal =
        document.getElementById('stat-total');

    const statInStock =
        document.getElementById('stat-in-stock');

    const statLowStock =
        document.getElementById('stat-low-stock');

    const statOutStock =
        document.getElementById('stat-out-stock');


    // CẤU HÌNH
    const DEFAULT_LOW_STOCK = 5;

    const numberFormatter =
        new Intl.NumberFormat('vi-VN');


    // HÀM HỖ TRỢ
    function escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalize(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();
    }

    function formatNumber(value) {
        return numberFormatter.format(
            Number(value) || 0
        );
    }

    function getToday() {
        const date = new Date();

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            date.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function formatDate(value) {
        if (!value) return '—';

        const parts = String(value)
            .slice(0, 10)
            .split('-');

        if (parts.length !== 3) {
            return String(value);
        }

        return (
            parts[2] + '/' +
            parts[1] + '/' +
            parts[0]
        );
    }

    function getDB() {
        const db = Shop.loadDB() || {};

        return {
            products: Array.isArray(db.products)
                ? db.products
                : [],

            categories: Array.isArray(db.categories)
                ? db.categories
                : [],

            stock_movements: Array.isArray(db.stock_movements)
                ? db.stock_movements
                : []
        };
    }

    function getProductId(product) {
        return String(product.id ?? '');
    }

    function getProductName(product) {
        return (
            product.name ||
            product.product_name ||
            'Chưa có tên'
        );
    }

    function getProductCode(product) {
        return (
            product.sku ||
            product.code ||
            `SP${product.id}`
        );
    }

    function getCurrentStock(product) {
        const value = Number(
            product.stock_qty ??
            product.stock_quantity ??
            product.quantity ??
            0
        );

        return Number.isFinite(value)
            ? value
            : 0;
    }

    function getLowStockThreshold(product) {
        const value = Number(
            product.low_stock_threshold ??
            product.min_stock ??
            DEFAULT_LOW_STOCK
        );

        return (
            Number.isFinite(value) &&
            value >= 0
        )
            ? value
            : DEFAULT_LOW_STOCK;
    }

    function getCategoryId(product) {
        return String(
            product.category_id ??
            product.categoryId ??
            ''
        );
    }

    function getCategoryName(product, db) {
        const categoryId = getCategoryId(product);

        const category = db.categories.find(
            function (item) {
                return String(item.id) === categoryId;
            }
        );

        if (category) {
            return (
                category.name ||
                category.category_name ||
                'Khác'
            );
        }

        return (
            product.category_name ||
            'Chưa phân loại'
        );
    }

    // RẠNG THÁI TỒN KHO
    function getStockStatus(product) {
        const quantity = getCurrentStock(product);

        const threshold =
            getLowStockThreshold(product);

        if (quantity <= 0) {
            return {
                code: 'out-stock',
                text: 'Hết hàng'
            };
        }

        if (quantity <= threshold) {
            return {
                code: 'low-stock',
                text: 'Sắp hết hàng'
            };
        }

        return {
            code: 'in-stock',
            text: 'Còn hàng'
        };
    }

    function stockBadge(product) {
        const status = getStockStatus(product);

        return `
            <span class="stock-badge ${status.code}">
                ${status.text}
            </span>
        `;
    }

    // XỬ LÝ LỊCH SỬ NHẬP XUẤT
    function getMovementDelta(movement) {
        const quantity = Number(
            movement.quantity ?? 0
        );

        if (!Number.isFinite(quantity)) {
            return 0;
        }

        const type = normalize(
            movement.movement_type || ''
        );

        const exportTypes = [
            'export',
            'out',
            'sale',
            'xuat'
        ];

        const importTypes = [
            'import',
            'in',
            'purchase',
            'nhap',
            'cancel_return',
            'return'
        ];

        if (exportTypes.includes(type)) {
            return -Math.abs(quantity);
        }

        if (importTypes.includes(type)) {
            return Math.abs(quantity);
        }

        // Với giao dịch điều chỉnh:
        // số dương là tăng, số âm là giảm.
        return quantity;
    }

    function getMovementDate(movement) {
        return String(
            movement.movement_date ||
            movement.created_at ||
            movement.date ||
            ''
        ).slice(0, 10);
    }

    function getProductMovements(product, db) {
        const productId = getProductId(product);

        return db.stock_movements
            .filter(function (movement) {
                return (
                    String(movement.product_id) ===
                    productId
                );
            })
            .map(function (movement) {
                return {
                    date: getMovementDate(movement),
                    delta: getMovementDelta(movement)
                };
            })
            .filter(function (movement) {
                return /^\d{4}-\d{2}-\d{2}$/.test(
                    movement.date
                );
            })
            .sort(function (a, b) {
                return a.date.localeCompare(b.date);
            });
    }

    // TÍNH NHẬP - XUẤT - TỒN
    function calculateInventory(
        product,
        db,
        fromDate,
        toDate
    ) {
        const currentStock =
            getCurrentStock(product);

        const movements =
            getProductMovements(product, db);

        const today = getToday();

        const effectiveEnd = toDate || today;

        // Tổng biến động từ đầu lịch sử
        // đến thời điểm hiện tại.

        const totalMovement = movements.reduce(
            function (sum, movement) {
                if (movement.date <= today) {
                    return sum + movement.delta;
                }

                return sum;
            },
            0
        );

        // Suy ra tồn trước giao dịch đầu tiên.
        // Cần lịch sử đầy đủ để có kết quả chính xác.

        const initialStock =
            currentStock - totalMovement;

        let openingStock = initialStock;

        // Nếu chọn ngày bắt đầu:
        // tồn đầu kỳ là tồn trước ngày đó.

        if (fromDate) {
            for (const movement of movements) {
                if (movement.date < fromDate) {
                    openingStock += movement.delta;
                }
            }
        }

        let totalImport = 0;
        let totalExport = 0;

        // Tính tổng nhập xuất trong kỳ.

        for (const movement of movements) {
            if (movement.date > effectiveEnd) {
                continue;
            }

            if (
                fromDate &&
                movement.date < fromDate
            ) {
                continue;
            }

            if (movement.delta > 0) {
                totalImport += movement.delta;
            }

            if (movement.delta < 0) {
                totalExport += Math.abs(
                    movement.delta
                );
            }
        }

        const endingStock =
            openingStock +
            totalImport -
            totalExport;

        return {
            opening: openingStock,
            imported: totalImport,
            exported: totalExport,
            ending: endingStock,
            current: currentStock
        };
    }

    //  HIỂN THỊ DANH MỤC
    function renderCategories() {
        const db = getDB();

        const categories = new Map();

        for (const category of db.categories) {
            categories.set(
                String(category.id),

                category.name ||
                category.category_name ||
                'Khác'
            );
        }

        for (const product of db.products) {
            const id = getCategoryId(product);

            if (id && !categories.has(id)) {
                categories.set(
                    id,
                    getCategoryName(product, db)
                );
            }
        }

        const options = Array.from(
            categories.entries()
        )
            .sort(function (a, b) {
                return a[1].localeCompare(
                    b[1],
                    'vi'
                );
            })
            .map(function ([id, name]) {
                return `
                    <option value="${escapeHTML(id)}">
                        ${escapeHTML(name)}
                    </option>
                `;
            })
            .join('');

        categorySelect.innerHTML = `
            <option value="all">
                Tất cả loại sản phẩm
            </option>

            ${options}
        `;
    }

    // ======================================
    // 9. LỌC SẢN PHẨM
    // ======================================

    function getFilteredProducts(db) {
        const keyword = normalize(
            searchInput.value
        );

        const categoryId =
            categorySelect.value;

        return db.products.filter(
            function (product) {

                // Lọc danh mục
                if (
                    categoryId !== 'all' &&
                    getCategoryId(product) !== categoryId
                ) {
                    return false;
                }

                // Tìm kiếm mã và tên
                if (keyword) {
                    const searchText = normalize(
                        getProductCode(product) + ' ' +
                        getProductName(product)
                    );

                    if (!searchText.includes(keyword)) {
                        return false;
                    }
                }

                return true;
            }
        );
    }

    // THỐNG KÊ TỒN KHO
    function renderStatistics(products) {
        let inStock = 0;
        let lowStock = 0;
        let outStock = 0;

        for (const product of products) {
            const status = getStockStatus(product);

            if (status.code === 'in-stock') {
                inStock++;
            } else if (
                status.code === 'low-stock'
            ) {
                lowStock++;
            } else {
                outStock++;
            }
        }

        statTotal.textContent =
            formatNumber(products.length);

        statInStock.textContent =
            formatNumber(inStock);

        statLowStock.textContent =
            formatNumber(lowStock);

        statOutStock.textContent =
            formatNumber(outStock);
    }

    // HIỂN THỊ CẢNH BÁO TỒN KHO
    function renderWarnings(products) {
        const warningProducts = products
            .filter(function (product) {
                const status = getStockStatus(product);

                return status.code !== 'in-stock';
            })
            .sort(function (a, b) {
                return (
                    getCurrentStock(a) -
                    getCurrentStock(b)
                );
            });

        // Cập nhật số lượng cảnh báo.
        warningCount.textContent =
            formatNumber(warningProducts.length);

        warningCount.classList.toggle(
            'is-empty',
            warningProducts.length === 0
        );

        // Không có sản phẩm cần cảnh báo.
        if (warningProducts.length === 0) {
            warningList.innerHTML = `
                <div class="inventory-no-warning">

                    <i class="fa-solid fa-circle-check"></i>

                    Không có sản phẩm sắp hết
                    hoặc hết hàng.

                </div>
            `;

            return;
        }

        // Hiển thị danh sách cảnh báo.
        warningList.innerHTML = warningProducts
            .map(function (product) {

                const status =
                    getStockStatus(product);

                const quantity =
                    getCurrentStock(product);

                const threshold =
                    getLowStockThreshold(product);

                const isOut =
                    status.code === 'out-stock';

                return `
                    <div class="inventory-warning-item ${
                        isOut ? 'out' : ''
                    }">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    getProductName(product)
                                )}
                            </strong>

                            <p>
                                Mã SP:
                                ${escapeHTML(
                                    getProductCode(product)
                                )}

                                |

                                Ngưỡng cảnh báo:
                                ${formatNumber(threshold)}
                            </p>

                        </div>

                        <div class="inventory-warning-quantity">

                            ${status.text}

                            <br>

                            Còn ${formatNumber(quantity)}

                        </div>

                    </div>
                `;
            })
            .join('');
    }

    // THU GỌN / MỞ RỘNG CẢNH BÁO
    function setWarningExpanded(expanded) {
        warningToggle.setAttribute(
            'aria-expanded',
            String(expanded)
        );

        warningContent.hidden = !expanded;
    }

    // Mặc định thu gọn.
    setWarningExpanded(false);

    warningToggle.addEventListener(
        'click',
        function () {

            const isExpanded =
                warningToggle.getAttribute(
                    'aria-expanded'
                ) === 'true';

            setWarningExpanded(!isExpanded);
        }
    );

    // HIỂN THỊ BẢNG NHẬP XUẤT TỒN
    function renderInventoryTable(
        products,
        db,
        fromDate,
        toDate
    ) {
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-row">
                        Không tìm thấy sản phẩm phù hợp.
                    </td>
                </tr>
            `;

            tableFooter.innerHTML = '';

            return;
        }

        let sumOpening = 0;
        let sumImport = 0;
        let sumExport = 0;
        let sumEnding = 0;

        tableBody.innerHTML = products
            .map(function (product) {

                const result = calculateInventory(
                    product,
                    db,
                    fromDate,
                    toDate
                );

                sumOpening += result.opening;
                sumImport += result.imported;
                sumExport += result.exported;
                sumEnding += result.ending;

                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                getProductCode(product)
                            )}
                        </td>

                        <td class="product-name">
                            ${escapeHTML(
                                getProductName(product)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                getCategoryName(product, db)
                            )}
                        </td>

                        <td class="number">
                            ${formatNumber(result.opening)}
                        </td>

                        <td class="number stock-in">
                            ${formatNumber(result.imported)}
                        </td>

                        <td class="number stock-out">
                            ${formatNumber(result.exported)}
                        </td>

                        <td class="number stock-ending">
                            ${formatNumber(result.ending)}
                        </td>

                        <td>
                            ${stockBadge(product)}
                        </td>

                    </tr>
                `;
            })
            .join('');

        // Tổng cộng.
        tableFooter.innerHTML = `
            <tr>

                <td colspan="3">
                    TỔNG CỘNG
                </td>

                <td class="number">
                    ${formatNumber(sumOpening)}
                </td>

                <td class="number stock-in">
                    ${formatNumber(sumImport)}
                </td>

                <td class="number stock-out">
                    ${formatNumber(sumExport)}
                </td>

                <td class="number stock-ending">
                    ${formatNumber(sumEnding)}
                </td>

                <td>—</td>

            </tr>
        `;
    }

    // THÔNG BÁO KHOẢNG THỜI GIAN
    function renderPeriodNote(fromDate, toDate) {
        periodNote.classList.remove('error');

        if (!fromDate && !toDate) {
            periodNote.textContent =
                'Đang hiển thị toàn bộ lịch sử ' +
                'nhập – xuất – tồn đến hiện tại.';

            return;
        }

        if (fromDate && !toDate) {
            periodNote.textContent =
                'Đang hiển thị từ ' +
                formatDate(fromDate) +
                ' đến hiện tại.';

            return;
        }

        if (!fromDate && toDate) {
            periodNote.textContent =
                'Đang hiển thị từ đầu lịch sử đến ' +
                formatDate(toDate) +
                '.';

            return;
        }

        periodNote.textContent =
            'Đang hiển thị từ ' +
            formatDate(fromDate) +
            ' đến ' +
            formatDate(toDate) +
            '.';
    }

    // KIỂM TRA NGÀY
    function validateDates(fromDate, toDate) {
        const today = getToday();

        if (
            fromDate &&
            toDate &&
            fromDate > toDate
        ) {
            return (
                'Ngày bắt đầu phải trước hoặc ' +
                'bằng ngày kết thúc.'
            );
        }

        if (fromDate && fromDate > today) {
            return (
                'Ngày bắt đầu không được ' +
                'lớn hơn ngày hiện tại.'
            );
        }

        if (toDate && toDate > today) {
            return (
                'Ngày kết thúc không được ' +
                'lớn hơn ngày hiện tại.'
            );
        }

        return '';
    }


    // 16. HIỂN THỊ TOÀN BỘ GIAO DIỆN
    function render() {
        const db = getDB();

        const fromDate = fromInput.value;
        const toDate = toInput.value;

        const products =
            getFilteredProducts(db);

        // Thống kê và cảnh báo dựa trên
        // tồn kho hiện tại.
        renderStatistics(products);

        renderWarnings(products);

        // Kiểm tra ngày.
        const error = validateDates(
            fromDate,
            toDate
        );

        if (error) {
            periodNote.classList.add('error');

            periodNote.textContent = error;

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-row">
                        ${escapeHTML(error)}
                    </td>
                </tr>
            `;

            tableFooter.innerHTML = '';

            dataNote.textContent = '';

            return;
        }

        renderPeriodNote(fromDate, toDate);

        renderInventoryTable(
            products,
            db,
            fromDate,
            toDate
        );

        dataNote.textContent =
            'Lưu ý: Báo cáo tồn kho trong quá khứ ' +
            'chỉ chính xác khi lịch sử nhập, xuất ' +
            'và điều chỉnh tồn kho được ghi nhận ' +
            'đầy đủ. Trạng thái cảnh báo luôn ' +
            'phản ánh số lượng tồn hiện tại.';
    }

    // SỰ KIỆN TÌM KIẾM VÀ LỌC
    searchInput.addEventListener(
        'input',
        render
    );

    categorySelect.addEventListener(
        'change',
        render
    );

    fromInput.addEventListener(
        'change',
        render
    );

    toInput.addEventListener(
        'change',
        render
    );

    // ĐẶT LẠI BỘ LỌC
    resetButton.addEventListener(
        'click',
        function () {

            searchInput.value = '';

            categorySelect.value = 'all';

            fromInput.value = '';

            toInput.value = '';

            render();
        }
    );

    renderCategories();

    render();

})();