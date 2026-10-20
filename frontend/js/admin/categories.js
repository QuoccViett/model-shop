(function () {
    'use strict';

    const mainContent = document.querySelector('.admin-main');
    if (!mainContent) return;

    const categoryHTML = `
        <div class="dashboard-content">
            <div class="page-title">
                <h1>Quản lý loại sản phẩm</h1>
                <p>Trang chủ / Quản lý loại sản phẩm</p>
            </div>

            <div class="data-table-section">
                <div class="table-actions-bar">
                    <div class="search-filter-group">
                        <input type="text" id="search-input" placeholder="Tìm kiếm theo tên danh mục, mô tả...">
                        <select id="filter-status">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hiển thị</option>
                            <option value="hidden">Đang ẩn</option>
                        </select>
                    </div>
                    <button class="btn-add" id="btn-open-add-modal">
                        <i class="fa-solid fa-folder-plus"></i> Thêm loại sản phẩm
                    </button>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên loại sản phẩm</th>
                                <th>Mô tả</th>
                                <th>Lợi nhuận mặc định (%)</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="category-table-body">
                            <!-- Dữ liệu render bằng JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- MODAL THÊM / SỬA LOẠI SẢN PHẨM -->
        <div class="admin-modal" id="category-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">Thêm loại sản phẩm mới</h3>
                    <button class="modal-close" id="btn-close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="category-form">
                        <input type="hidden" id="category-id">
                        <div class="form-group">
                            <label>Tên loại sản phẩm *</label>
                            <input type="text" id="category-name" required placeholder="Nhập tên loại sản phẩm...">
                        </div>
                        <div class="form-group">
                            <label>Mô tả</label>
                            <input type="text" id="category-description" placeholder="Nhập mô tả ngắn...">
                        </div>
                        <div class="form-group">
                            <label>Lợi nhuận mặc định (%)</label>
                            <input type="number" id="category-profit" placeholder="Ví dụ: 25">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="btn-cancel-modal">Hủy</button>
                    <button class="btn-primary" id="btn-save-category">Lưu thông tin</button>
                </div>
            </div>
        </div>
    `;

    mainContent.insertAdjacentHTML('beforeend', categoryHTML);

    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const tableBody = document.getElementById('category-table-body');
    
    const modal = document.getElementById('category-modal');
    const btnOpenAdd = document.getElementById('btn-open-add-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const btnSaveCategory = document.getElementById('btn-save-category');
    
    const modalTitle = document.getElementById('modal-title');
    const inputId = document.getElementById('category-id');
    const inputName = document.getElementById('category-name');
    const inputDescription = document.getElementById('category-description');
    const inputProfit = document.getElementById('category-profit');

    function renderTable() {
        const keyword = searchInput.value;
        const status = filterStatus.value;
        const categories = Shop.filterCategories({ keyword, status });

        if (categories.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #777; padding: 20px;">Không tìm thấy loại sản phẩm nào.</td></tr>`;
            return;
        }

        tableBody.innerHTML = categories.map(c => {
            const isHidden = c.is_hidden;
            const statusClass = isHidden ? 'locked' : 'active';
            const statusText = isHidden ? 'Đang ẩn' : 'Hiển thị';
            const eyeIcon = isHidden ? 'fa-eye-slash' : 'fa-eye';
            const eyeTitle = isHidden ? 'Hiển thị danh mục' : 'Ẩn danh mục';

            return `
                <tr>
                    <td>#${c.id}</td>
                    <td><strong>${Shop.escapeHtml(c.name)}</strong></td>
                    <td>${Shop.escapeHtml(c.description || 'Không có mô tả')}</td>
                    <td>${c.profit_percent !== null && c.profit_percent !== undefined ? c.profit_percent + '%' : 'Mặc định'}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-action edit" onclick="window.editCategory(${c.id})" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action lock" onclick="window.toggleHideCategory(${c.id})" title="${eyeTitle}"><i class="fa-solid ${eyeIcon}"></i></button>
                        <button class="btn-action delete" onclick="window.removeCategory(${c.id})" title="Xóa danh mục"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    searchInput.addEventListener('input', renderTable);
    filterStatus.addEventListener('change', renderTable);

    btnOpenAdd.addEventListener('click', function () {
        modalTitle.innerText = 'Thêm loại sản phẩm mới';
        inputId.value = '';
        inputName.value = '';
        inputDescription.value = '';
        inputProfit.value = '';
        modal.classList.add('show');
    });

    function closeModal() {
        modal.classList.remove('show');
    }
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    window.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    btnSaveCategory.addEventListener('click', function () {
        const id = inputId.value;
        const name = inputName.value.trim();
        const description = inputDescription.value.trim();
        const profit_percent = inputProfit.value;

        if (!name) {
            alert('Vui lòng nhập tên loại sản phẩm!');
            return;
        }

        if (id) {
            const res = Shop.updateCategory(id, { name, description, profit_percent });
            alert(res.message);
            if (res.success) {
                closeModal();
                renderTable();
            }
        } else {
            const res = Shop.addCategory({ name, description, profit_percent });
            alert(res.message);
            if (res.success) {
                closeModal();
                renderTable();
            }
        }
    });

    window.editCategory = function (id) {
        const category = Shop.getAllCategoryIgnoreHidden(id);
        if (!category) return;

        modalTitle.innerText = 'Chỉnh sửa loại sản phẩm';
        inputId.value = category.id;
        inputName.value = category.name;
        inputDescription.value = category.description || '';
        inputProfit.value = category.profit_percent ?? '';

        modal.classList.add('show');
    };

    window.toggleHideCategory = function (id) {
        const res = Shop.toggleHideCategory(id);
        if (res.success) {
            renderTable();
        } else {
            alert(res.message);
        }
    };

    window.removeCategory = function (id) {
        if (confirm('Bạn có chắc chắn muốn xóa loại sản phẩm này?')) {
            const res = Shop.deleteCategory(id);
            alert(res.message);
            renderTable();
        }
    };

    renderTable();
})();