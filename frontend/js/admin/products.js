(function () {
    'use strict';

    const mainContent = document.querySelector('.admin-main');
    if (!mainContent) return;

    // Lấy danh sách categories để đổ vào thẻ <select> phân loại trong form
    function getCategoryOptions() {
        const categories = Shop.getAllCategories();
        return categories.map(c => `<option value="${c.id}">${Shop.escapeHtml(c.name)}</option>`).join('');
    }

    const productHTML = `
        <div class="dashboard-content">
            <div class="page-title">
                <h1>Quản lý sản phẩm</h1>
                <p>Trang chủ / Quản lý sản phẩm</p>
            </div>

            <div class="data-table-section">
                <div class="table-actions-bar">
                    <div class="search-filter-group">
                        <input type="text" id="search-input" placeholder="Tìm theo mã, tên, thương hiệu, mô tả...">
                        <select id="filter-category">
                            <option value="all">Lọc theo danh mục</option>
                            ${getCategoryOptions()}
                        </select>
                        <select id="filter-status">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hiển thị</option>
                            <option value="hidden">Đang ẩn</option>
                        </select>
                    </div>
                    <button class="btn-add" id="btn-open-add-modal">
                        <i class="fa-solid fa-box-archive"></i> Thêm sản phẩm mới
                    </button>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Mã code</th>
                                <th>Tên sản phẩm</th>
                                <th>Thương hiệu</th>
                                <th>Giá vốn</th>
                                <th>Tồn kho</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="product-table-body">
                            <!-- Dữ liệu render bằng JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- MODAL THÊM / SỬA SẢN PHẨM -->
        <div class="admin-modal" id="product-modal">
            <div class="modal-content" style="max-width: 650px;">
                <div class="modal-header">
                    <h3 id="modal-title">Thêm sản phẩm mới</h3>
                    <button class="modal-close" id="btn-close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="product-form">
                        <input type="hidden" id="product-id">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label>Mã sản phẩm (Code/SKU) *</label>
                                <input type="text" id="product-code" required placeholder="Ví dụ: GD007">
                            </div>
                            <div class="form-group">
                                <label>Loại sản phẩm *</label>
                                <select id="product-category" required>
                                    <option value="">-- Chọn danh mục --</option>
                                    ${getCategoryOptions()}
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Tên sản phẩm *</label>
                            <input type="text" id="product-name" required placeholder="Nhập tên sản phẩm...">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label>Thương hiệu (Brand)</label>
                                <input type="text" id="product-brand" placeholder="Ví dụ: Bandai, Tamiya...">
                            </div>
                            <div class="form-group">
                                <label>Link hình ảnh (Image URL)</label>
                                <input type="text" id="product-image" placeholder="https://...">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <div class="form-group">
                                <label>Tỉ lệ (Scale)</label>
                                <input type="text" id="product-scale" placeholder="Ví dụ 1/144">
                            </div>
                            <div class="form-group">
                                <label>Chất liệu</label>
                                <input type="text" id="product-material" placeholder="Nhựa PS...">
                            </div>
                            <div class="form-group">
                                <label>Kích thước</label>
                                <input type="text" id="product-size" placeholder="13 cm">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                            <div class="form-group">
                                <label>Giá vốn</label>
                                <input type="number" id="product-cost" placeholder="0" readonly>
                            </div>
                            <div class="form-group">
                                <label>% Lợi nhuận</label>
                                <input type="number" id="product-profit" placeholder="" readonly>
                            </div>
                            <div class="form-group">
                                <label>Tồn kho</label>
                                <input type="number" id="product-stock" placeholder="0" readonly>
                            </div>
                            <div class="form-group">
                                <label>Cảnh báo tồn</label>
                                <input type="number" id="product-threshold" placeholder="5">
                            </div>
                            <div class="form-group">
                                <label>% Giảm giá</label>
                                <input type="number" id="product-sale" placeholder="0">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Mô tả chi tiết</label>
                            <input type="text" id="product-description" placeholder="Nhập mô tả sản phẩm...">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="btn-cancel-modal">Hủy</button>
                    <button class="btn-primary" id="btn-save-product">Lưu thông tin</button>
                </div>
            </div>
        </div>
    `;

    mainContent.insertAdjacentHTML('beforeend', productHTML);

    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const tableBody = document.getElementById('product-table-body');
    
    const modal = document.getElementById('product-modal');
    const btnOpenAdd = document.getElementById('btn-open-add-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const btnSaveProduct = document.getElementById('btn-save-product');
    
    const modalTitle = document.getElementById('modal-title');
    const inputId = document.getElementById('product-id');
    const inputCode = document.getElementById('product-code');
    const inputCategory = document.getElementById('product-category');
    const inputName = document.getElementById('product-name');
    const inputBrand = document.getElementById('product-brand');
    const inputImage = document.getElementById('product-image');
    const inputScale = document.getElementById('product-scale');
    const inputMaterial = document.getElementById('product-material');
    const inputSize = document.getElementById('product-size');
    const inputCost = document.getElementById('product-cost');
    const inputProfit = document.getElementById('product-profit');
    const inputStock = document.getElementById('product-stock');
    const inputThreshold = document.getElementById('product-threshold');
    const inputSale = document.getElementById('product-sale');
    const inputDescription = document.getElementById('product-description');

    function renderTable() {
        const keyword = searchInput.value;
        const category_id = filterCategory.value;
        const status = filterStatus.value;
        const products = Shop.filterProducts({ keyword, status, category_id });

        if (products.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #777; padding: 20px;">Không tìm thấy sản phẩm nào.</td></tr>`;
            return;
        }

        tableBody.innerHTML = products.map(p => {
            const isHidden = p.is_hidden;
            const statusClass = isHidden ? 'locked' : 'active';
            const statusText = isHidden ? 'Đang ẩn' : 'Hiển thị';
            const eyeIcon = isHidden ? 'fa-eye-slash' : 'fa-eye';
            const eyeTitle = isHidden ? 'Hiển thị sản phẩm' : 'Ẩn sản phẩm';
            const formattedPrice = Number(p.cost_price || 0).toLocaleString('vi-VN') + ' đ';
            const imgSrc = p.image || 'https://placehold.co/600x600/e8590c/ffffff?text=No+Img';

            return `
                <tr>
                    <td><img src="${imgSrc}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                    <td><code>${Shop.escapeHtml(p.code || 'N/A')}</code></td>
                    <td><strong>${Shop.escapeHtml(p.name)}</strong></td>
                    <td>${Shop.escapeHtml(p.brand || 'N/A')}</td>
                    <td>${formattedPrice}</td>
                    <td>${p.stock_qty ?? 0}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-action edit" onclick="window.editProduct(${p.id})" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action lock" onclick="window.toggleHideProduct(${p.id})" title="${eyeTitle}"><i class="fa-solid ${eyeIcon}"></i></button>
                        <button class="btn-action delete" onclick="window.removeProduct(${p.id})" title="Xóa sản phẩm"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    searchInput.addEventListener('input', renderTable);
    filterCategory.addEventListener('change', renderTable);
    filterStatus.addEventListener('change', renderTable);

    btnOpenAdd.addEventListener('click', function () {
        modalTitle.innerText = 'Thêm sản phẩm mới';
        inputId.value = '';
        inputCode.value = '';
        inputCategory.value = '';
        inputName.value = '';
        inputBrand.value = '';
        inputImage.value = '';
        inputScale.value = '';
        inputMaterial.value = '';
        inputSize.value = '';
        inputCost.value = '';
        inputProfit.value = '';
        inputStock.value = '';
        inputThreshold.value = '5';
        inputSale.value = '';
        inputDescription.value = '';
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

    btnSaveProduct.addEventListener('click', function () {
        const id = inputId.value;
        const productData = {
            code: inputCode.value.trim(),
            category_id: inputCategory.value,
            name: inputName.value.trim(),
            brand: inputBrand.value.trim(),
            image: inputImage.value.trim(),
            scale: inputScale.value.trim(),
            material: inputMaterial.value.trim(),
            size: inputSize.value.trim(),
            cost_price: inputCost.value,
            profit_percent: inputProfit.value,
            stock_qty: inputStock.value,
            low_stock_threshold: inputThreshold.value,
            sale_percent: inputSale.value,
            description: inputDescription.value.trim()
        };

        if (!productData.code || !productData.name || !productData.category_id) {
            alert('Vui lòng điền đầy đủ Mã, Tên và chọn Loại sản phẩm!');
            return;
        }

        if (id) {
            const res = Shop.updateProduct(id, productData);
            alert(res.message);
            if (res.success) {
                closeModal();
                renderTable();
            }
        } else {
            const res = Shop.addProduct(productData);
            alert(res.message);
            if (res.success) {
                closeModal();
                renderTable();
            }
        }
    });

    window.editProduct = function (id) {
        const product = Shop.getProductByIdIgnoreHidden(id);
        if (!product) return;

        modalTitle.innerText = 'Chỉnh sửa thông tin sản phẩm';
        inputId.value = product.id;
        inputCode.value = product.code || '';
        inputCategory.value = product.category_id || '';
        inputName.value = product.name || '';
        inputBrand.value = product.brand || '';
        inputImage.value = product.image || '';
        inputScale.value = product.scale || 'Chưa thiết lập';
        inputMaterial.value = product.material || '';
        inputSize.value = product.size || '';
        inputCost.value = product.cost_price ?? '';
        inputProfit.value = product.profit_percent ?? '';
        inputStock.value = product.stock_qty ?? '';
        inputThreshold.value = product.low_stock_threshold ?? 5;
        inputSale.value = product.sale_percent ?? '';
        inputDescription.value = product.description || '';

        modal.classList.add('show');
    };

    window.toggleHideProduct = function (id) {
        const res = Shop.toggleHideProduct(id);
        if (res.success) {
            renderTable();
        } else {
            alert(res.message);
        }
    };

    window.removeProduct = function (id) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            const res = Shop.deleteProduct(id);
            alert(res.message);
            renderTable();
        }
    };

    renderTable();
})();