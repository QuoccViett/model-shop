/*
   imports.js - TRANG QUẢN LÝ NHẬP HÀNG (giao diện)
   Nghiệp vụ nằm ở js/admin/shop-imports.js (Shop.addReceipt, Shop.completeReceipt...)
    */
(function () {
    'use strict';
    const mainContent = document.querySelector('.admin-main');
    if (!mainContent) return;

    const esc = Shop.escapeHtml;
    const money = Shop.formatPrice;

    function todayString() {
        const d = new Date();
        const p = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }

    // 2026-09-25 -> 25/09/2026
    function showDate(s) {
        if (!s) return '';
        const parts = String(s).slice(0, 10).split('-');
        return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : s;
    }

    function statusBadge(status) {
        return status === 'completed'
            ? '<span class="status-badge active">Đã hoàn thành</span>'
            : '<span class="status-badge draft">Nháp - chưa hoàn thành</span>';
    }

    const pageHTML = `
        <div class="dashboard-content">
            <div class="page-title">
                <h1>Quản lý nhập hàng</h1>
                <p>Trang chủ / Quản lý nhập hàng</p>
            </div>

            <div class="data-table-section">
                <div class="table-actions-bar">
                    <div class="search-filter-group import-filters">
                        <input type="text" id="imp-search" placeholder="Tìm theo mã phiếu, ghi chú, mã / tên sản phẩm...">
                        <label class="date-field">Từ ngày <input type="date" id="imp-from"></label>
                        <label class="date-field">Đến ngày <input type="date" id="imp-to"></label>
                        <select id="imp-status">
                            <option value="all">Tất cả tình trạng</option>
                            <option value="draft">Nháp - chưa hoàn thành</option>
                            <option value="completed">Đã hoàn thành</option>
                        </select>
                    </div>
                    <button class="btn-add" id="btn-add-receipt">
                    Thêm phiếu nhập
                    </button>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã phiếu</th>
                                <th>Ngày nhập</th>
                                <th>Ghi chú</th>
                                <th>Số dòng</th>
                                <th class="text-right">Tổng tiền nhập</th>
                                <th>Tình trạng</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="receipt-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- MODAL THÊM / SỬA PHIẾU NHẬP -->
        <div class="admin-modal" id="receipt-modal">
            <div class="modal-content modal-wide">
                <div class="modal-header">
                    <h3 id="receipt-modal-title">Thêm phiếu nhập</h3>
                    <button class="modal-close" id="btn-close-receipt">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="receipt-id">
                    <div class="receipt-head">
                        <div class="form-group">
                            <label>Ngày nhập *</label>
                            <input type="date" id="receipt-date">
                        </div>
                        <div class="form-group">
                            <label>Ghi chú</label>
                            <input type="text" id="receipt-note" placeholder="Ví dụ: Nhập Gundam đợt 2">
                        </div>
                    </div>

                    <table class="receipt-items">
                        <thead>
                            <tr>
                                <th>Sản phẩm *</th>
                                <th class="col-price">Giá nhập (đ) *</th>
                                <th class="col-qty">Số lượng *</th>
                                <th class="col-sum">Thành tiền</th>
                                <th class="col-del"></th>
                            </tr>
                        </thead>
                        <tbody id="receipt-lines"></tbody>
                    </table>
                    <button type="button" class="btn-line-add" id="btn-add-line">
                    Thêm dòng sản phẩm
                    </button>
                    <div class="receipt-total">Tổng tiền phiếu: <strong id="receipt-total">0 đ</strong></div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="btn-cancel-receipt">Hủy</button>
                    <button class="btn-primary" id="btn-save-receipt">Lưu phiếu</button>
                </div>
            </div>
        </div>

        <!-- MODAL XEM CHI TIẾT PHIẾU -->
        <div class="admin-modal" id="view-modal">
            <div class="modal-content modal-wide">
                <div class="modal-header">
                    <h3 id="view-modal-title">Chi tiết phiếu nhập</h3>
                    <button class="modal-close" id="btn-close-view">&times;</button>
                </div>
                <div class="modal-body" id="view-modal-body"></div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="btn-ok-view">Đóng</button>
                </div>
            </div>
        </div>
    `;

    mainContent.insertAdjacentHTML('beforeend', pageHTML);

    const searchInput = document.getElementById('imp-search');
    const fromInput = document.getElementById('imp-from');
    const toInput = document.getElementById('imp-to');
    const statusSelect = document.getElementById('imp-status');
    const tableBody = document.getElementById('receipt-table-body');

    const receiptModal = document.getElementById('receipt-modal');
    const viewModal = document.getElementById('view-modal');
    const receiptTitle = document.getElementById('receipt-modal-title');
    const receiptIdInput = document.getElementById('receipt-id');
    const dateInput = document.getElementById('receipt-date');
    const noteInput = document.getElementById('receipt-note');
    const linesBody = document.getElementById('receipt-lines');
    const totalBox = document.getElementById('receipt-total');

    /* DANH SÁCH PHIẾU */
    function renderTable() {
        if (fromInput.value && toInput.value && fromInput.value > toInput.value) {
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-row">Khoảng ngày không hợp lệ: "Từ ngày" phải trước hoặc bằng "Đến ngày".</td></tr>';
            return;
        }

        const receipts = Shop.filterReceipts({
            keyword: searchInput.value,
            status: statusSelect.value,
            from: fromInput.value,
            to: toInput.value
        });

        if (receipts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-row">Không tìm thấy phiếu nhập nào.</td></tr>';
            return;
        }

        tableBody.innerHTML = receipts.map(function (r) {
            const isDraft = r.status === 'draft';
            const lineCount = Shop.getReceiptItems(r.id).length;
            const draftButtons = isDraft ? `
                <button class="btn-action edit" data-action="edit" data-id="${r.id}" title="Sửa phiếu"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action complete" data-action="complete" data-id="${r.id}" title="Hoàn thành phiếu"><i class="fa-solid fa-check"></i></button>
                <button class="btn-action delete" data-action="delete" data-id="${r.id}" title="Xóa phiếu"><i class="fa-solid fa-trash"></i></button>` : '';
            return `
                <tr>
                    <td><code>${Shop.getReceiptCode(r.id)}</code></td>
                    <td>${showDate(r.import_date)}</td>
                    <td>${esc(r.note || '')}</td>
                    <td>${lineCount}</td>
                    <td class="text-right">${money(Shop.getReceiptTotal(r.id))}</td>
                    <td>${statusBadge(r.status)}</td>
                    <td class="action-cell">
                        <button class="btn-action view" data-action="view" data-id="${r.id}" title="Xem chi tiết"><i class="fa-solid fa-eye"></i></button>
                        ${draftButtons}
                    </td>
                </tr>`;
        }).join('');
    }

    searchInput.addEventListener('input', renderTable);
    fromInput.addEventListener('change', renderTable);
    toInput.addEventListener('change', renderTable);
    statusSelect.addEventListener('change', renderTable);

    tableBody.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;

        if (action === 'view') openView(id);
        else if (action === 'edit') openForm(id);
        else if (action === 'complete') completeReceipt(id);
        else if (action === 'delete') removeReceipt(id);
    });

    function completeReceipt(id) {
        const code = Shop.getReceiptCode(id);
        if (!confirm('Hoàn thành phiếu ' + code + '?\nSau khi hoàn thành sẽ cộng tồn kho, cập nhật giá vốn và KHÔNG thể sửa phiếu nữa.')) return;
        const res = Shop.completeReceipt(id);
        alert(res.message);
        renderTable();
    }

    function removeReceipt(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa phiếu ' + Shop.getReceiptCode(id) + '?')) return;
        const res = Shop.deleteReceipt(id);
        alert(res.message);
        renderTable();
    }

    /* ---------------- XEM CHI TIẾT ---------------- */
    function openView(id) {
        const r = Shop.getReceiptById(id);
        if (!r) return;
        const items = Shop.getReceiptItems(id);

        const rows = items.map(function (i) {
            const p = Shop.getProductByIdIgnoreHidden(i.product_id);
            const name = p ? esc(p.code) + ' - ' + esc(p.name) : '(sản phẩm đã bị xóa)';
            return `
                <tr>
                    <td>${name}</td>
                    <td class="text-right">${money(i.import_price)}</td>
                    <td class="text-right">${i.quantity}</td>
                    <td class="text-right">${money(i.import_price * i.quantity)}</td>
                </tr>`;
        }).join('');

        document.getElementById('view-modal-title').textContent = 'Phiếu nhập ' + Shop.getReceiptCode(id);
        document.getElementById('view-modal-body').innerHTML = `
            <div class="receipt-info">
                <div><span>Ngày nhập:</span> <strong>${showDate(r.import_date)}</strong></div>
                <div><span>Tình trạng:</span> ${statusBadge(r.status)}</div>
                <div><span>Ngày tạo:</span> ${esc(r.created_at || '')}</div>
                <div><span>Ngày hoàn thành:</span> ${r.completed_at ? esc(r.completed_at) : '—'}</div>
                <div style="grid-column: 1 / -1;"><span>Ghi chú:</span> ${esc(r.note || '—')}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th class="text-right">Giá nhập</th>
                        <th class="text-right">Số lượng</th>
                        <th class="text-right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <div class="receipt-total">Tổng tiền phiếu: <strong>${money(Shop.getReceiptTotal(id))}</strong></div>`;
        viewModal.classList.add('show');
    }

    /* FORM THÊM / SỬA */
    function productOptions(selectedId) {
    const products = Shop.getAllProducts().slice().sort(function (a, b) {
        return String(a.code).localeCompare(String(b.code));
    });

    return '<option value="">-- Chọn sản phẩm --</option>' + products.map(function (p) {
        const sel = String(p.id) === String(selectedId) ? ' selected' : '';

        return '<option value="' + p.id + '"' + sel + '>'
            + esc(p.code) + ' - ' + esc(p.name)
            + '</option>';
    }).join('');
}

    function stockHint(productId) {
        const p = productId ? Shop.getProductByIdIgnoreHidden(productId) : null;
        if (!p) return '';
        return 'Tồn hiện tại: ' + (p.stock_qty || 0) + ' · Giá vốn: ' + money(p.cost_price || 0);
    }

    function lineHTML(item) {
        item = item || {};
        return `
            <tr class="receipt-line">
                <td>
                    <select class="line-product">${productOptions(item.product_id)}</select>
                    <div class="muted line-hint">${stockHint(item.product_id)}</div>
                </td>
                <td class="col-price"><input type="number" class="line-price" min="1" step="1" value="${item.import_price || ''}" placeholder="0"></td>
                <td class="col-qty"><input type="number" class="line-qty" min="1" step="1" value="${item.quantity || ''}" placeholder="0"></td>
                <td class="col-sum line-sum">0 đ</td>
                <td class="col-del"><button type="button" class="btn-action delete line-remove" title="Xóa dòng"><i class="fa-solid fa-xmark"></i></button></td>
            </tr>`;
    }

    function updateTotals() {
        let total = 0;
        linesBody.querySelectorAll('.receipt-line').forEach(function (row) {
            const price = Number(row.querySelector('.line-price').value) || 0;
            const qty = Number(row.querySelector('.line-qty').value) || 0;
            const sum = price * qty;
            row.querySelector('.line-sum').textContent = money(sum);
            total += sum;
        });
        totalBox.textContent = money(total);
    }

    function addLine(item) {
        linesBody.insertAdjacentHTML('beforeend', lineHTML(item));
        updateTotals();
    }

    linesBody.addEventListener('input', updateTotals);

    linesBody.addEventListener('change', function (e) {
        if (!e.target.classList.contains('line-product')) return;
        const row = e.target.closest('.receipt-line');
        row.querySelector('.line-hint').textContent = stockHint(e.target.value);
    });

    linesBody.addEventListener('click', function (e) {
        const btn = e.target.closest('.line-remove');
        if (!btn) return;
        btn.closest('.receipt-line').remove();
        updateTotals();
    });

    document.getElementById('btn-add-line').addEventListener('click', function () { addLine(); });

    // id = null: thêm mới; có id: sửa phiếu nháp
    function openForm(id) {
        linesBody.innerHTML = '';
        if (id) {
            const r = Shop.getReceiptById(id);
            if (!r) return;
            if (r.status !== 'draft') {
                alert('Phiếu đã hoàn thành, không thể sửa!');
                return;
            }
            receiptTitle.textContent = 'Sửa phiếu nhập ' + Shop.getReceiptCode(id);
            receiptIdInput.value = r.id;
            dateInput.value = r.import_date;
            noteInput.value = r.note || '';
            Shop.getReceiptItems(id).forEach(function (it) { addLine(it); });
        } else {
            receiptTitle.textContent = 'Thêm phiếu nhập';
            receiptIdInput.value = '';
            dateInput.value = todayString();
            noteInput.value = '';
            addLine();
        }
        updateTotals();
        receiptModal.classList.add('show');
    }

    document.getElementById('btn-add-receipt').addEventListener('click', function () { openForm(null); });

    function collectItems() {
        return Array.from(linesBody.querySelectorAll('.receipt-line')).map(function (row) {
            return {
                product_id: row.querySelector('.line-product').value,
                import_price: row.querySelector('.line-price').value,
                quantity: row.querySelector('.line-qty').value
            };
        });
    }

    document.getElementById('btn-save-receipt').addEventListener('click', function () {
        const id = receiptIdInput.value;
        const data = {
            import_date: dateInput.value,
            note: noteInput.value,
            items: collectItems()
        };
        const res = id ? Shop.updateReceipt(id, data) : Shop.addReceipt(data);
        alert(res.message);
        if (res.success) {
            closeReceiptModal();
            renderTable();
        }
    });

    /*ĐÓNG MODAL*/
    function closeReceiptModal() { receiptModal.classList.remove('show'); }
    function closeViewModal() { viewModal.classList.remove('show'); }

    document.getElementById('btn-close-receipt').addEventListener('click', closeReceiptModal);
    document.getElementById('btn-cancel-receipt').addEventListener('click', closeReceiptModal);
    document.getElementById('btn-close-view').addEventListener('click', closeViewModal);
    document.getElementById('btn-ok-view').addEventListener('click', closeViewModal);
    window.addEventListener('click', function (e) {
        if (e.target === receiptModal) closeReceiptModal();
        if (e.target === viewModal) closeViewModal();
    });

    renderTable();
})();
