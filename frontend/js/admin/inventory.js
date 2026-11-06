/* MODEL SHOP - QUẢN LÝ TỒN KHO */
(function () {
    'use strict';
    if (!window.AdminAuthenticated) return;

    if (!window.Shop || typeof Shop.loadDB !== 'function') {
        console.error('Không tìm thấy Shop.loadDB(). Kiểm tra data.js và common.js.');
        return;
    }

    const page = document.querySelector('.inventory-page');
    if (!page) return;

    const $ = function (id) { return document.getElementById(id); };

    const searchInput = $('inventory-search');
    const categorySelect = $('inventory-category');
    const fromInput = $('inventory-from');
    const toInput = $('inventory-to');
    const resetButton = $('inventory-reset');
    const tableBody = $('inventory-table-body');
    const tableFooter = $('inventory-table-footer');
    const warningList = $('inventory-warning-list');
    const warningToggle = $('inventory-warning-toggle');
    const warningContent = $('inventory-warning-content');
    const warningCount = $('inventory-warning-count');
    const periodNote = $('inventory-period-note');
    const dataNote = $('inventory-data-note');
    const statTotal = $('stat-total');
    const statInStock = $('stat-in-stock');
    const statLowStock = $('stat-low-stock');
    const statOutStock = $('stat-out-stock');

    const inventoryPager = window.AdminPagination.create({
        container: 'inventory-pagination',
        pageSize: 10,
        label: 'sản phẩm',
        onChange: function () { render(); }
    });

    const DEFAULT_LOW_STOCK = 5;
    const numberFormatter = new Intl.NumberFormat('vi-VN');

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

    function number(value) {
        const result = Number(value);
        return Number.isFinite(result) ? result : 0;
    }

    function formatNumber(value) {
        return numberFormatter.format(number(value));
    }

    function getToday() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function toDateKey(value) {
        const key = String(value ?? '').trim().slice(0, 10);
        return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : '';
    }

    function formatDate(value) {
        const key = toDateKey(value);
        if (!key) return '—';
        const [year, month, day] = key.split('-');
        return `${day}/${month}/${year}`;
    }

    function getDB() {
        const source = Shop.loadDB() || {};
        return {
            products: Array.isArray(source.products) ? source.products : [],
            categories: Array.isArray(source.categories) ? source.categories : [],
            stock_movements: Array.isArray(source.stock_movements) ? source.stock_movements : [],
            import_receipts: Array.isArray(source.import_receipts) ? source.import_receipts : [],
            import_receipt_items: Array.isArray(source.import_receipt_items) ? source.import_receipt_items : []
        };
    }

    function getProductId(product) {
        return String(product.id ?? '');
    }

    function getProductName(product) {
        return product.name || product.product_name || 'Chưa có tên';
    }

    function getProductCode(product) {
        return product.code || product.sku || `SP${product.id}`;
    }

    function getCurrentStock(product) {
        return number(product.stock_qty ?? product.stock_quantity ?? product.quantity ?? 0);
    }

    function getLowStockThreshold(product) {
        const value = Number(product.low_stock_threshold ?? product.min_stock ?? DEFAULT_LOW_STOCK);
        return Number.isFinite(value) && value >= 0 ? value : DEFAULT_LOW_STOCK;
    }

    function getCategoryId(product) {
        return String(product.category_id ?? product.categoryId ?? '');
    }

    function getCategoryName(product, db) {
        const categoryId = getCategoryId(product);
        const category = db.categories.find(item => String(item.id) === categoryId);
        return category
            ? (category.name || category.category_name || 'Khác')
            : (product.category_name || 'Chưa phân loại');
    }

    function getStockStatus(product) {
        const quantity = getCurrentStock(product);
        if (quantity <= 0) return { code: 'out-stock', text: 'Hết hàng' };
        if (quantity <= getLowStockThreshold(product)) return { code: 'low-stock', text: 'Sắp hết hàng' };
        return { code: 'in-stock', text: 'Còn hàng' };
    }

    function stockBadge(product) {
        const status = getStockStatus(product);
        return `<span class="stock-badge ${status.code}">${status.text}</span>`;
    }

    function getAllMovements(db) {
        const movements = [];
        const completedReceipts = db.import_receipts.filter(
            receipt => receipt.status === 'completed'
        );

        const completedReceiptIds = new Set(
            completedReceipts.map(receipt => String(receipt.id))
        );

        completedReceipts.forEach(receipt => {
            const receiptDate = toDateKey(receipt.import_date);
            if (!receiptDate) return;

            db.import_receipt_items
                .filter(item => String(item.receipt_id) === String(receipt.id))
                .forEach(item => {
                    const quantity = Math.abs(number(item.quantity));
                    if (!quantity) return;

                    movements.push({
                        productId: String(item.product_id),
                        date: receiptDate,
                        delta: quantity,
                        type: 'import',
                        source: 'import_receipt',
                        refId: String(receipt.id)
                    });
                });
        });

        db.stock_movements.forEach(movement => {
            const refType = normalize(movement.ref_type || '');
            const refId = String(movement.ref_id ?? '');

            // Phiếu nhập đã được lấy từ import_receipts/items ở trên.
            if (
                refType === 'import_receipt' ||
                refType === 'import-receipt' ||
                (completedReceiptIds.has(refId) && refType.includes('receipt'))
            ) {
                return;
            }

            const date = toDateKey(movement.movement_date);
            if (!date) return;

            const quantity = number(movement.quantity);
            const type = normalize(movement.movement_type || '');
            let delta = quantity;

            if (['export', 'out', 'sale', 'xuat'].includes(type)) {
                delta = -Math.abs(quantity);
            } else if (['import', 'in', 'purchase', 'nhap', 'cancel_return', 'return'].includes(type)) {
                delta = Math.abs(quantity);
            }

            if (!delta) return;

            movements.push({
                productId: String(movement.product_id),
                date: date,
                delta: delta,
                type: type || 'adjustment',
                source: 'stock_movement',
                refId: refId
            });
        });

        return movements.sort((a, b) => {
            const byDate = a.date.localeCompare(b.date);
            return byDate || a.productId.localeCompare(b.productId);
        });
    }

    function getProductMovements(product, allMovements) {
        const id = getProductId(product);
        return allMovements.filter(movement => movement.productId === id);
    }

    function calculateInventory(product, allMovements, fromDate, toDate) {
        const today = getToday();
        const endDate = toDate || today;
        const movements = getProductMovements(product, allMovements)
            .filter(movement => movement.date <= today);

        const currentStock = getCurrentStock(product);
        const totalMovementToDate = movements.reduce(
            (sum, movement) => sum + movement.delta, 0
        );

        const initialStock = currentStock - totalMovementToDate;

        let opening = initialStock;
        if (fromDate) {
            movements.forEach(movement => {
                if (movement.date < fromDate) opening += movement.delta;
            });
        }

        let imported = 0;
        let exported = 0;

        movements.forEach(movement => {
            if (movement.date > endDate) return;
            if (fromDate && movement.date < fromDate) return;

            if (movement.delta > 0) imported += movement.delta;
            if (movement.delta < 0) exported += Math.abs(movement.delta);
        });

        return {
            opening: opening,
            imported: imported,
            exported: exported,
            ending: opening + imported - exported,
            current: currentStock
        };
    }

    function renderCategories(db) {
        const categories = new Map();

        db.categories.forEach(category => {
            categories.set(
                String(category.id),
                category.name || category.category_name || 'Khác'
            );
        });

        db.products.forEach(product => {
            const id = getCategoryId(product);
            if (id && !categories.has(id)) {
                categories.set(id, getCategoryName(product, db));
            }
        });

        const previousValue = categorySelect.value || 'all';
        const options = Array.from(categories.entries())
            .sort((a, b) => a[1].localeCompare(b[1], 'vi'))
            .map(([id, name]) => (
                `<option value="${escapeHTML(id)}">${escapeHTML(name)}</option>`
            ))
            .join('');

        categorySelect.innerHTML =
            `<option value="all">Tất cả loại sản phẩm</option>${options}`;

        categorySelect.value = categories.has(previousValue) ? previousValue : 'all';
    }

    function getFilteredProducts(db) {
        const keyword = normalize(searchInput.value);
        const categoryId = categorySelect.value || 'all';

        return db.products.filter(product => {
            if (categoryId !== 'all' && getCategoryId(product) !== categoryId) {
                return false;
            }

            if (keyword) {
                const text = normalize(`${getProductCode(product)} ${getProductName(product)}`);
                if (!text.includes(keyword)) return false;
            }

            return true;
        });
    }

    function renderStatistics(products) {
        let inStock = 0;
        let lowStock = 0;
        let outStock = 0;

        products.forEach(product => {
            const status = getStockStatus(product);
            if (status.code === 'in-stock') inStock++;
            else if (status.code === 'low-stock') lowStock++;
            else outStock++;
        });

        statTotal.textContent = formatNumber(products.length);
        statInStock.textContent = formatNumber(inStock);
        statLowStock.textContent = formatNumber(lowStock);
        statOutStock.textContent = formatNumber(outStock);
    }

    function renderWarnings(products) {
        const warnings = products
            .filter(product => getStockStatus(product).code !== 'in-stock')
            .sort((a, b) => getCurrentStock(a) - getCurrentStock(b));

        warningCount.textContent = formatNumber(warnings.length);
        warningCount.classList.toggle('is-empty', warnings.length === 0);

        if (!warnings.length) {
            warningList.innerHTML = `
                <div class="inventory-no-warning">
                    <i class="fa-solid fa-circle-check"></i>
                    Không có sản phẩm sắp hết hoặc hết hàng.
                </div>`;
            return;
        }

        warningList.innerHTML = warnings.map(product => {
            const status = getStockStatus(product);
            const isOut = status.code === 'out-stock';

            return `
                <div class="inventory-warning-item ${isOut ? 'out' : ''}">
                    <div>
                        <strong>${escapeHTML(getProductName(product))}</strong>
                        <p>
                            Mã SP: ${escapeHTML(getProductCode(product))}
                            | Ngưỡng cảnh báo: ${formatNumber(getLowStockThreshold(product))}
                        </p>
                    </div>
                    <div class="inventory-warning-quantity">
                        ${status.text}<br>Còn ${formatNumber(getCurrentStock(product))}
                    </div>
                </div>`;
        }).join('');
    }

    function setWarningExpanded(expanded) {
        warningToggle.setAttribute('aria-expanded', String(expanded));
        warningContent.hidden = !expanded;
    }

    function renderInventoryTable(products, db, allMovements, fromDate, toDate) {
        if (!products.length) {
            inventoryPager.render(0);
            tableBody.innerHTML = `
                <tr><td colspan="8" class="empty-row">Không tìm thấy sản phẩm phù hợp.</td></tr>`;
            tableFooter.innerHTML = '';
            return;
        }

        // Tính tổng cho toàn bộ danh sách đã lọc (không chỉ trang đang xem)
        const totals = { opening: 0, imported: 0, exported: 0, ending: 0 };
        products.forEach(product => {
            const result = calculateInventory(product, allMovements, fromDate, toDate);
            totals.opening += result.opening;
            totals.imported += result.imported;
            totals.exported += result.exported;
            totals.ending += result.ending;
        });

        const paged = inventoryPager.slice(products);
        inventoryPager.render(paged.total);

        tableBody.innerHTML = paged.items.map(product => {
            const result = calculateInventory(product, allMovements, fromDate, toDate);

            return `
                <tr>
                    <td>${escapeHTML(getProductCode(product))}</td>
                    <td class="product-name">${escapeHTML(getProductName(product))}</td>
                    <td>${escapeHTML(getCategoryName(product, db))}</td>
                    <td class="number">${formatNumber(result.opening)}</td>
                    <td class="number stock-in">${formatNumber(result.imported)}</td>
                    <td class="number stock-out">${formatNumber(result.exported)}</td>
                    <td class="number stock-ending">${formatNumber(result.ending)}</td>
                    <td>${stockBadge(product)}</td>
                </tr>`;
        }).join('');

        tableFooter.innerHTML = `
            <tr>
                <td colspan="3">TỔNG CỘNG</td>
                <td class="number">${formatNumber(totals.opening)}</td>
                <td class="number stock-in">${formatNumber(totals.imported)}</td>
                <td class="number stock-out">${formatNumber(totals.exported)}</td>
                <td class="number stock-ending">${formatNumber(totals.ending)}</td>
                <td>—</td>
            </tr>`;
    }

    function renderPeriodNote(fromDate, toDate) {
        periodNote.classList.remove('error');

        if (!fromDate && !toDate) {
            periodNote.textContent = 'Đang hiển thị toàn bộ lịch sử nhập – xuất – tồn đến hiện tại.';
        } else if (fromDate && !toDate) {
            periodNote.textContent = `Đang hiển thị từ ${formatDate(fromDate)} đến hiện tại.`;
        } else if (!fromDate && toDate) {
            periodNote.textContent = `Đang hiển thị từ đầu lịch sử đến ${formatDate(toDate)}.`;
        } else {
            periodNote.textContent = `Đang hiển thị từ ${formatDate(fromDate)} đến ${formatDate(toDate)}.`;
        }
    }

    function validateDates(fromDate, toDate) {
        const today = getToday();

        if (fromDate && toDate && fromDate > toDate) {
            return 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.';
        }
        if (fromDate && fromDate > today) {
            return 'Ngày bắt đầu không được lớn hơn ngày hiện tại.';
        }
        if (toDate && toDate > today) {
            return 'Ngày kết thúc không được lớn hơn ngày hiện tại.';
        }
        return '';
    }

    function render() {
        const db = getDB();
        const fromDate = toDateKey(fromInput.value);
        const toDate = toDateKey(toInput.value);
        const products = getFilteredProducts(db);

        renderStatistics(products);
        renderWarnings(products);

        const error = validateDates(fromDate, toDate);
        if (error) {
            inventoryPager.render(0);
            periodNote.classList.add('error');
            periodNote.textContent = error;
            tableBody.innerHTML = `<tr><td colspan="8" class="empty-row">${escapeHTML(error)}</td></tr>`;
            tableFooter.innerHTML = '';
            dataNote.textContent = '';
            return;
        }

        const allMovements = getAllMovements(db);

        renderPeriodNote(fromDate, toDate);
        renderInventoryTable(products, db, allMovements, fromDate, toDate);

        dataNote.textContent =
            'Ngày nhập trong báo cáo được lấy từ ngày nhập trên phiếu (import_date); ' +
            'chỉ phiếu đã hoàn thành mới được tính, phiếu nháp không được tính. ' +
            'Các biến động hoàn kho do hủy đơn được tính là tăng tồn. ' +
            'Tồn đầu kỳ phụ thuộc vào việc lịch sử biến động kho được ghi nhận đầy đủ.';
    }

    searchInput.addEventListener('input', function () {
        inventoryPager.reset();
        render();
    });
    categorySelect.addEventListener('change', function () {
        inventoryPager.reset();
        render();
    });
    fromInput.addEventListener('change', function () {
        inventoryPager.reset();
        render();
    });
    toInput.addEventListener('change', function () {
        inventoryPager.reset();
        render();
    });

    resetButton.addEventListener('click', function () {
        searchInput.value = '';
        categorySelect.value = 'all';
        fromInput.value = '';
        toInput.value = '';
        inventoryPager.reset();
        render();
    });

    warningToggle.addEventListener('click', function () {
        const expanded = warningToggle.getAttribute('aria-expanded') === 'true';
        setWarningExpanded(!expanded);
    });

    setWarningExpanded(false);
    renderCategories(getDB());
    render();
})();
