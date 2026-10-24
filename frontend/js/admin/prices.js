/*
   prices.js - TRANG QUẢN LÝ GIÁ BÁN (giao diện)
   Nghiệp vụ nằm ở js/admin/shop-prices.js
*/
(function () {
    'use strict';

    const mainContent = document.querySelector('.admin-main');
    if (!mainContent) return;

    const esc = Shop.escapeHtml;
    const money = Shop.formatPrice;

    function fmtPct(n) {
        return String(+Number(n).toFixed(2));
    }

    function findCategory(id) {
        return Shop.findById(Shop.loadDB().categories || [], id);
    }

    function categoryOptions() {
        return Shop.getAllCategories().map(function (c) {
            return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
        }).join('');
    }

    const pageHTML = `
        <div class="dashboard-content">
            <div class="page-title">
                <h1>Quản lý giá bán</h1>
                <p>Trang chủ / Quản lý giá bán</p>
            </div>

            <div class="price-hint">
                <strong>Cách tính:</strong> giá bán = giá vốn x (1 + % lợi nhuận ÷ 100), làm tròn đến nghìn đồng.<br>
                <strong>Ưu tiên:</strong> % lợi nhuận riêng của sản phẩm được dùng trước. Sản phẩm để trống ô % riêng sẽ dùng % của loại.<br>
                Giá vốn do phiếu nhập hàng quyết định, sản phẩm chưa nhập hàng thì chưa có giá bán.
            </div>

            <div class="data-table-section price-section">
                <h3>1. % lợi nhuận theo loại sản phẩm</h3>
                <p class="section-note">Áp dụng cho mọi sản phẩm trong loại chưa có % riêng.</p>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Loại sản phẩm</th>
                                <th>Số sản phẩm</th>
                                <th>Số sản phẩm có % riêng</th>
                                <th>% lợi nhuận của loại</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="category-price-body"></tbody>
                    </table>
                </div>
            </div>

            <div class="data-table-section price-section">
                <h3>2. Giá vốn, % lợi nhuận và giá bán theo sản phẩm</h3>
                <p class="section-note">Gõ % riêng rồi bấm Lưu (hoặc Enter). Giá bán xem trước ngay khi gõ.</p>
                <div class="table-actions-bar">
                    <div class="search-filter-group import-filters-inline">
                        <input type="text" id="price-search" placeholder="Tìm theo mã hoặc tên sản phẩm...">
                        <select id="price-category">
                            <option value="all">Tất cả loại</option>
                            ${categoryOptions()}
                        </select>
                    </div>
                    <span class="muted" id="price-count"></span>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Tên sản phẩm</th>
                                <th>Loại</th>
                                <th class="text-right">Giá vốn</th>
                                <th>% lợi nhuận riêng</th>
                                <th>% đang áp dụng</th>
                                <th class="text-right">Giá bán</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="product-price-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="price-toast" id="price-toast"></div>
    `;

    mainContent.insertAdjacentHTML('beforeend', pageHTML);

    const categoryBody = document.getElementById('category-price-body');
    const productBody = document.getElementById('product-price-body');
    const searchInput = document.getElementById('price-search');
    const categorySelect = document.getElementById('price-category');
    const countBox = document.getElementById('price-count');
    const toastBox = document.getElementById('price-toast');
    

    /*THÔNG BÁO*/
    let toastTimer = null;
    function toast(message, ok) {
        toastBox.textContent = message;
        toastBox.className = 'price-toast show ' + (ok ? 'ok' : 'error');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastBox.classList.remove('show'); }, 3200);
    }

    /*BẢNG LOẠI*/
    function renderCategories() {
        const categories = Shop.getAllCategories();
        const products = Shop.getAllProducts();

        if (categories.length === 0) {
            categoryBody.innerHTML = '<tr><td colspan="6" class="empty-row">Chưa có loại sản phẩm nào.</td></tr>';
            return;
        }

        categoryBody.innerHTML = categories.map(function (c) {
            const inCat = products.filter(function (p) { return Number(p.category_id) === Number(c.id); });
            const ownCount = inCat.filter(function (p) { return Shop.getProductOwnProfit(p) !== null; }).length;
            const value = (c.profit_percent === null || c.profit_percent === undefined || c.profit_percent === '')
                ? '' : fmtPct(c.profit_percent);
            const status = c.is_hidden
                ? '<span class="status-badge locked">Đang ẩn</span>'
                : '<span class="status-badge active">Hiển thị</span>';
            return `
                <tr data-id="${c.id}">
                    <td><strong>${esc(c.name)}</strong></td>
                    <td>${inCat.length}</td>
                    <td>${ownCount}</td>
                    <td>
                        <span class="pct-field">
                            <input type="number" class="cat-input" min="0" max="1000" step="0.1" value="${value}" placeholder="0">
                            <span class="unit">%</span>
                        </span>
                    </td>
                    <td>${status}</td>
                    <td><button class="btn-save-row" data-action="save-category">Lưu</button></td>
                </tr>`;
        }).join('');
    }

    function saveCategoryRow(tr) {
        const input = tr.querySelector('.cat-input');
        const res = Shop.setCategoryProfit(tr.dataset.id, input.value);
        input.classList.toggle('invalid', !res.success);
        toast(res.message, res.success);
        if (!res.success) return;
        input.value = fmtPct(res.data.profit_percent);
        refreshProductRows();
    }

    /*BẢNG SẢN PHẨM */
    function productRowHTML(p) {
        const cat = findCategory(p.category_id);
        const own = Shop.getProductOwnProfit(p);
        const cost = Number(p.cost_price || 0);
        const hidden = p.is_hidden ? ' <span class="badge-note">đang ẩn</span>' : '';
        return `
            <tr data-id="${p.id}" data-cat="${p.category_id}" data-cost="${cost}" data-saved="${own === null ? '' : own}">
                <td><code>${esc(p.code || '')}</code></td>
                <td><strong>${esc(p.name || '')}</strong>${hidden}</td>
                <td>${cat ? esc(cat.name) : '<span class="muted">(không rõ)</span>'}</td>
                <td class="text-right">${cost > 0 ? money(cost) : '<span class="muted">—</span>'}</td>
                <td>
                    <span class="pct-field">
                        <input type="number" class="own-input" min="0" max="1000" step="0.1" value="${own === null ? '' : fmtPct(own)}">
                        <span class="unit">%</span>
                    </span>
                </td>
                <td class="applied"></td>
                <td class="text-right price-cell"></td>
                <td><button class="btn-save-row" data-action="save-product">Lưu</button></td>
            </tr>`;
    }

    // Cập nhật phần hiển thị của một dòng sản phẩm (% áp dụng, giá bán, dòng chưa lưu)
    function updateRowView(tr) {
        const input = tr.querySelector('.own-input');
        const catProfit = Shop.getCategoryProfit(findCategory(tr.dataset.cat));
        const cost = Number(tr.dataset.cost || 0);
        const parsed = Shop.parsePercent(input.value, true);

        input.placeholder = 'Theo loại (' + fmtPct(catProfit) + '%)';
        input.classList.toggle('invalid', !parsed.ok);

        const applied = parsed.ok ? (parsed.value !== null ? parsed.value : catProfit) : null;
        const appliedCell = tr.querySelector('.applied');
        const priceCell = tr.querySelector('.price-cell');

        if (applied === null) {
            appliedCell.textContent = '—';
            priceCell.innerHTML = '<span class="muted">—</span>';
        } else {
            appliedCell.innerHTML = fmtPct(applied) + '% ' +
                (parsed.value !== null ? '<span class="badge-note own">riêng</span>' : '<span class="badge-note">theo loại</span>');
            priceCell.innerHTML = cost > 0
                ? '<strong>' + money(Shop.priceFromCost(cost, applied)) + '</strong>'
                : '<span class="muted">Chưa có giá vốn</span>';
        }

        const saved = tr.dataset.saved === '' ? null : Number(tr.dataset.saved);
        const current = parsed.ok ? parsed.value : undefined;
        tr.classList.toggle('dirty', current !== saved);
    }

    function refreshProductRows() {
        productBody.querySelectorAll('tr[data-id]').forEach(updateRowView);
    }

    function renderProducts() {
        const list = Shop.searchPriceProducts({
            keyword: searchInput.value,
            category_id: categorySelect.value
        });
        countBox.textContent = 'Hiển thị ' + list.length + ' sản phẩm';

        if (list.length === 0) {
            productBody.innerHTML = '<tr><td colspan="8" class="empty-row">Không tìm thấy sản phẩm nào.</td></tr>';
            return;
        }
        productBody.innerHTML = list.map(productRowHTML).join('');
        refreshProductRows();
    }

    function saveProductRow(tr) {
        const input = tr.querySelector('.own-input');
        const res = Shop.setProductProfit(tr.dataset.id, input.value);
        input.classList.toggle('invalid', !res.success);
        toast(res.message, res.success);
        if (!res.success) return;

        const own = Shop.getProductOwnProfit(res.data);
        tr.dataset.saved = own === null ? '' : own;
        input.value = own === null ? '' : fmtPct(own);
        updateRowView(tr);
        renderCategories();
    }

    /* SỰ KIỆN */
    searchInput.addEventListener('input', renderProducts);
    categorySelect.addEventListener('change', renderProducts);

    productBody.addEventListener('input', function (e) {
        if (e.target.classList.contains('own-input')) updateRowView(e.target.closest('tr'));
    });

    productBody.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-action="save-product"]');
        if (btn) saveProductRow(btn.closest('tr'));
    });

    productBody.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.classList.contains('own-input')) {
            e.preventDefault();
            saveProductRow(e.target.closest('tr'));
        }
    });

    categoryBody.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-action="save-category"]');
        if (btn) saveCategoryRow(btn.closest('tr'));
    });

    categoryBody.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.classList.contains('cat-input')) {
            e.preventDefault();
            saveCategoryRow(e.target.closest('tr'));
        }
    });

    renderCategories();
    renderProducts();
})();
