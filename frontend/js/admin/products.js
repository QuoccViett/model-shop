(function () {
    'use strict';
    if (!window.AdminAuthenticated) return;

    const mainContent = document.querySelector('.admin-main');
    if (!mainContent) return;

    // Lấy danh sách categories để đổ vào thẻ <select> phân loại trong form
    function getCategoryOptions(includeDeletedId) {
        const categories = Shop.getAllCategories().filter(c => !c.is_deleted || Number(c.id) === Number(includeDeletedId));
        return categories.map(c => `<option value="${c.id}">${Shop.escapeHtml(c.name)}</option>`).join('');
    }

    function getCategoryFilterOptions() {
        return Shop.getAllCategories().filter(c => !c.is_deleted).map(c => `<option value="${c.id}">${Shop.escapeHtml(c.name)}${c.is_hidden ? ' (đang ẩn)' : ''}</option>`).join('');
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
                            ${getCategoryFilterOptions()}
                        </select>
                        <select id="filter-status">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hiển thị</option>
                            <option value="hidden">Đang ẩn</option>
                            <option value="deleted">Ngừng kinh doanh</option>
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
                                <th id="product-actions-header">Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="product-table-body">
                            <!-- Dữ liệu render bằng JS -->
                        </tbody>
                    </table>
                </div>

                <div class="admin-pagination" id="product-pagination"></div>
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

                        <div class="form-group">
                            <label>Thương hiệu (Brand)</label>
                            <input type="text" id="product-brand" placeholder="Ví dụ: Bandai, Tamiya...">
                        </div>
                        <div class="product-image-fields">
                            <div class="form-group">
                                <label for="product-image-1">Ảnh đại diện *</label>
                                <input type="file" id="product-image-1" accept="image/jpeg,image/png,image/webp">
                                <div class="product-image-preview" id="product-preview-1">Chưa chọn ảnh</div>
                                <button type="button" class="product-image-clear" data-image-slot="0">Xóa ảnh</button>
                            </div>
                            <div class="form-group">
                                <label for="product-image-2">Ảnh bổ sung</label>
                                <input type="file" id="product-image-2" accept="image/jpeg,image/png,image/webp">
                                <div class="product-image-preview" id="product-preview-2">Chưa chọn ảnh</div>
                                <button type="button" class="product-image-clear" data-image-slot="1">Xóa ảnh</button>
                            </div>
                        </div>
                        <p class="product-image-help">JPEG, PNG hoặc WebP; tối đa 5 MB mỗi ảnh.</p>

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
    const actionsHeader = document.getElementById('product-actions-header');
    const productPager = window.AdminPagination.create({
        container: 'product-pagination',
        pageSize: 10,
        label: 'sản phẩm',
        onChange: function () { renderTable(); }
    });
    
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
    const imageInputs = [document.getElementById('product-image-1'), document.getElementById('product-image-2')];
    const imagePreviews = [document.getElementById('product-preview-1'), document.getElementById('product-preview-2')];
    const imageRefs = ['', ''];
    const imageFiles = [null, null];
    const previewUrls = ['', ''];
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
        const paged = productPager.slice(products);
        productPager.render(paged.total);
        const showActions = paged.items.some(p => {
            const category = Shop.getAllCategoryIgnoreHidden(p.category_id);
            return category && !category.is_deleted;
        });
        actionsHeader.hidden = !showActions;

        if (products.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${showActions ? 8 : 7}" style="text-align: center; color: #777; padding: 20px;">Không tìm thấy sản phẩm nào.</td></tr>`;
            return;
        }

        tableBody.innerHTML = paged.items.map(p => {
            const isHidden = p.is_hidden;
            const category = Shop.getAllCategoryIgnoreHidden(p.category_id);
            const categoryDeleted = !category || category.is_deleted;
            const categoryHidden = category && category.is_hidden;
            const effectiveStatus = Shop.getProductDisplayStatus(p, category);
            const statusClass = effectiveStatus === 'active' ? 'active' : 'locked';
            const statusText = category && category.is_deleted ? 'Ngừng kinh doanh' :
                category && category.is_hidden ? 'Đang ẩn' :
                effectiveStatus === 'deleted' ? 'Ngừng kinh doanh' : effectiveStatus === 'hidden' ? 'Đang ẩn' : 'Hiển thị';
            const eyeIcon = isHidden ? 'fa-eye-slash' : 'fa-eye';
            const eyeTitle = isHidden ? 'Hiển thị sản phẩm' : 'Ẩn sản phẩm';
            const formattedPrice = Number(p.cost_price || 0).toLocaleString('vi-VN') + ' đ';
            const imgSrc = p.image || 'https://placehold.co/600x600/e8590c/ffffff?text=No+Img';

            return `
                <tr>
                    <td><img ${window.ShopImages ? ShopImages.attrs(imgSrc) : `src="${Shop.escapeHtml(imgSrc)}"`} alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                    <td><code>${Shop.escapeHtml(p.code || 'N/A')}</code></td>
                    <td><strong>${Shop.escapeHtml(p.name)}</strong></td>
                    <td>${Shop.escapeHtml(p.brand || 'N/A')}</td>
                    <td>${formattedPrice}</td>
                    <td>${p.stock_qty ?? 0}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    ${showActions ? `<td><div class="table-action-group">
                        ${categoryDeleted ? '' : categoryHidden
                            ? `<button class="btn-action edit" onclick="window.editProduct(${p.id})" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>`
                            : p.is_deleted
                            ? `<button class="btn-action lock" onclick="window.restoreProduct(${p.id})" title="Khôi phục sản phẩm"><i class="fa-solid fa-rotate-left"></i></button>`
                            : `<button class="btn-action edit" onclick="window.editProduct(${p.id})" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>
                               <button class="btn-action lock" onclick="window.toggleHideProduct(${p.id})" title="${eyeTitle}"><i class="fa-solid ${eyeIcon}"></i></button>
                               <button class="btn-action delete" onclick="window.removeProduct(${p.id})" title="Xóa sản phẩm"><i class="fa-solid fa-trash"></i></button>`}
                    </div></td>` : ''}
                </tr>
            `;
        }).join('');
    }

    searchInput.addEventListener('input', function () {
        productPager.reset();
        renderTable();
    });
    filterCategory.addEventListener('change', function () {
        productPager.reset();
        renderTable();
    });
    filterStatus.addEventListener('change', function () {
        productPager.reset();
        renderTable();
    });

    function clearPreviewUrl(slot) {
        if (previewUrls[slot]) URL.revokeObjectURL(previewUrls[slot]);
        previewUrls[slot] = '';
    }

    function renderImagePreview(slot) {
        const preview = imagePreviews[slot];
        preview.replaceChildren();
        if (imageFiles[slot]) {
            previewUrls[slot] = URL.createObjectURL(imageFiles[slot]);
            const img = document.createElement('img');
            img.src = previewUrls[slot];
            img.alt = 'Xem trước ảnh ' + (slot + 1);
            preview.appendChild(img);
        } else if (imageRefs[slot]) {
            const ref = imageRefs[slot];
            const img = document.createElement('img');
            img.alt = 'Ảnh sản phẩm ' + (slot + 1);
            preview.appendChild(img);
            const source = ref.startsWith('idb:') ? ShopImages.url(ref) : Promise.resolve(ref);
            source.then(function (url) {
                if (imageRefs[slot] === ref && !imageFiles[slot]) img.src = url;
            }).catch(function () { preview.textContent = 'Không đọc được ảnh'; });
        } else {
            preview.textContent = 'Chưa chọn ảnh';
        }
    }

    function resetImages(refs) {
        imageInputs.forEach(function (input, slot) {
            clearPreviewUrl(slot);
            input.value = '';
            imageFiles[slot] = null;
            imageRefs[slot] = refs[slot] || '';
            renderImagePreview(slot);
        });
    }

    imageInputs.forEach(function (input, slot) {
        input.addEventListener('change', function () {
            const file = input.files[0];
            if (!file) return;
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                alert('Chỉ chọn ảnh JPEG, PNG hoặc WebP, tối đa 5 MB.');
                clearPreviewUrl(slot);
                input.value = '';
                imageFiles[slot] = null;
                renderImagePreview(slot);
                return;
            }
            clearPreviewUrl(slot);
            imageFiles[slot] = file;
            renderImagePreview(slot);
        });
    });

    document.querySelectorAll('.product-image-clear').forEach(function (button) {
        button.addEventListener('click', function () {
            const slot = Number(button.dataset.imageSlot);
            clearPreviewUrl(slot);
            imageInputs[slot].value = '';
            imageFiles[slot] = null;
            imageRefs[slot] = '';
            renderImagePreview(slot);
        });
    });

    async function resizeImage(file) {
        const bitmap = await createImageBitmap(file);
        try {
            const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(bitmap.width * scale));
            canvas.height = Math.max(1, Math.round(bitmap.height * scale));
            canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            const compressed = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/webp', 0.82); });
            return compressed && compressed.type === 'image/webp' && compressed.size < file.size ? compressed : file;
        } finally {
            bitmap.close();
        }
    }

    btnOpenAdd.addEventListener('click', function () {
        modalTitle.innerText = 'Thêm sản phẩm mới';
        inputId.value = '';
        inputCode.value = '';
        inputCategory.innerHTML = '<option value="">-- Chọn danh mục --</option>' + getCategoryOptions();
        inputCategory.value = '';
        inputName.value = '';
        inputBrand.value = '';
        resetImages(['', '']);
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
        resetImages(['', '']);
    }
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    window.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    btnSaveProduct.addEventListener('click', async function () {
        if (btnSaveProduct.disabled) return;
        const id = inputId.value;
        if (!imageFiles[0] && !imageRefs[0]) {
            alert('Vui lòng chọn ảnh đại diện cho sản phẩm!');
            return;
        }
        const productData = {
            code: inputCode.value.trim(),
            category_id: inputCategory.value,
            name: inputName.value.trim(),
            brand: inputBrand.value.trim(),
            image: imageRefs[0],
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
        if (imageFiles.some(Boolean) && !window.ShopImages) {
            alert('Trình duyệt không hỗ trợ lưu ảnh trên thiết bị này.');
            return;
        }
        const oldRefs = imageRefs.slice();
        const newRefs = [];
        let saved = false;
        btnSaveProduct.disabled = true;
        try {
            const refs = imageRefs.slice();
            for (let slot = 0; slot < imageFiles.length; slot++) {
                if (!imageFiles[slot]) continue;
                const blob = await resizeImage(imageFiles[slot]);
                refs[slot] = await ShopImages.put(blob);
                newRefs.push(refs[slot]);
            }
            productData.image = refs[0];
            productData.images = refs.filter(Boolean);
            const res = id ? Shop.updateProduct(id, productData) : Shop.addProduct(productData);
            if (!res.success) {
                await Promise.all(newRefs.map(function (ref) { return ShopImages.remove(ref); }));
                alert(res.message);
                return;
            }
            saved = true;
            closeModal();
            renderTable();
            oldRefs.filter(function (ref) { return ref && !refs.includes(ref); }).forEach(function (ref) {
                ShopImages.remove(ref).catch(function () {});
            });
            alert(res.message);
        } catch (error) {
            if (!saved) await Promise.all(newRefs.map(function (ref) { return ShopImages.remove(ref).catch(function () {}); }));
            console.error('Không lưu được sản phẩm hoặc ảnh:', error);
            alert('Không lưu được sản phẩm hoặc ảnh: ' + error.message);
        } finally {
            btnSaveProduct.disabled = false;
        }
    });

    window.editProduct = function (id) {
        const product = Shop.getProductByIdIgnoreHidden(id);
        if (!product) return;

        modalTitle.innerText = 'Chỉnh sửa thông tin sản phẩm';
        inputId.value = product.id;
        inputCode.value = product.code || '';
        inputCategory.innerHTML = '<option value="">-- Chọn danh mục --</option>' + getCategoryOptions(product.category_id);
        inputCategory.value = product.category_id || '';
        inputName.value = product.name || '';
        inputBrand.value = product.brand || '';
        resetImages(Array.isArray(product.images) && product.images.length ? product.images : [product.image || '']);
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
        if (!confirm('Chuyển sản phẩm sang trạng thái ngừng kinh doanh? Dữ liệu và lịch sử vẫn được giữ lại.')) return;
        const res = Shop.deleteProduct(id);
        alert(res.message);
        renderTable();
    };

    window.restoreProduct = function (id) {
        const res = Shop.restoreProduct(id);
        alert(res.message);
        renderTable();
    };

    renderTable();
})();
