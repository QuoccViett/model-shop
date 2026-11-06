/*
   prices.js - TRANG QUẢN LÝ GIÁ BÁN (giao diện)
   Khung HTML nằm ở admin/prices.html, file này chỉ đổ dữ liệu và xử lý sự kiện.
   Nghiệp vụ nằm ở js/admin/shop-prices.js
*/
(function () {
    'use strict';
    if (!window.AdminAuthenticated) return;

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

    // Đổ danh sách loại vào ô chọn lọc (khung <select> nằm sẵn trong prices.html)
    function fillCategorySelect() {
        const select = document.getElementById('price-category');
        Shop.getAllCategories().filter(function (c) { return !c.is_deleted; }).forEach(function (c) {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            select.appendChild(opt);
        });
    }
    fillCategorySelect();

    const categoryBody = document.getElementById('category-price-body');
    const productBody = document.getElementById('product-price-body');
    const searchInput = document.getElementById('price-search');
    const categorySelect = document.getElementById('price-category');
    const countBox = document.getElementById('price-count');
    const toastBox = document.getElementById('price-toast');

    const categoryPager = window.AdminPagination.create({
        container: 'category-price-pagination',
        pageSize: 10,
        label: 'loại sản phẩm',
        onChange: function () { renderCategories(); }
    });
    const productPager = window.AdminPagination.create({
        container: 'product-price-pagination',
        pageSize: 10,
        label: 'sản phẩm',
        onChange: function () { renderProducts(); }
    });
    

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
        const categories = Shop.getAllCategories().filter(function (c) { return !c.is_deleted; });
        const products = Shop.getAllProducts().filter(function (p) { return !p.is_deleted; });

        const paged = categoryPager.slice(categories);
        categoryPager.render(paged.total);

        if (categories.length === 0) {
            categoryBody.innerHTML = '<tr><td colspan="6" class="empty-row">Chưa có loại sản phẩm nào.</td></tr>';
            return;
        }

        categoryBody.innerHTML = paged.items.map(function (c) {
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
        const paged = productPager.slice(list);
        countBox.textContent = 'Hiển thị ' + list.length + ' sản phẩm';
        productPager.render(paged.total);

        if (list.length === 0) {
            productBody.innerHTML = '<tr><td colspan="8" class="empty-row">Không tìm thấy sản phẩm nào.</td></tr>';
            return;
        }
        productBody.innerHTML = paged.items.map(productRowHTML).join('');
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

    /* CHUYỂN TAB */
    const tabButtons = document.querySelectorAll('.price-tab');
    const tabPanels = document.querySelectorAll('.price-panel');

    function switchTab(name) {
        tabButtons.forEach(function (btn) {
            const active = btn.dataset.tab === name;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        tabPanels.forEach(function (panel) {
            panel.hidden = panel.id !== 'tab-' + name;
        });
    }

    tabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
    });

    /* SỰ KIỆN */
    searchInput.addEventListener('input', function () {
        productPager.reset();
        renderProducts();
    });
    categorySelect.addEventListener('change', function () {
        productPager.reset();
        renderProducts();
    });

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
