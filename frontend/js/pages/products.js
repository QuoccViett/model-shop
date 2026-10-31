(function () {
    'use strict';

    // Đọc từ khóa và bộ lọc từ URL
    const params = new URLSearchParams(location.search);
    const keyword = (params.get('q') || '').trim();
    const categoryId = params.get('category') || '';
    const brandParam = params.get('brand') || '';
    const priceKey = params.get('price') || '';
    const minParam = params.get('min');
    const maxParam = params.get('max');
    const sort = params.get('sort') || '';
    const onSale = params.get('sale') === '1';
    const form = document.getElementById('filter-form');
    const minInput = document.getElementById('filter-min-price');
    const maxInput = document.getElementById('filter-max-price');
    const priceError = document.getElementById('price-filter-error');
    const esc = Shop.escapeHtml;
    const PRICE_RANGES = [
        { key: '1', label: 'Dưới 200.000 đ', max: 199999 },
        { key: '2', label: '200.000 đ - 500.000 đ', min: 200000, max: 499999 },
        { key: '3', label: '500.000 đ - 1.000.000 đ', min: 500000, max: 999999 },
        { key: '4', label: '1.000.000 đ - 2.000.000 đ', min: 1000000, max: 1999999 },
        { key: '5', label: 'Trên 2.000.000 đ', min: 2000000 }
    ];
    const SORTS = [
        { value: '', label: 'Mặc định' }, { value: 'newest', label: 'Mới nhập nhất' },
        { value: 'bestseller', label: 'Bán chạy nhất' }, { value: 'price-asc', label: 'Giá tăng dần' },
        { value: 'price-desc', label: 'Giá giảm dần' }, { value: 'name-asc', label: 'Tên A đến Z' },
        { value: 'name-desc', label: 'Tên Z đến A' }
    ];

    // Tạo nút radio an toàn cho các bộ lọc
    function radio(name, value, label, checked) {
        return '<label><input type="radio" name="' + esc(name) + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + '> ' + esc(label) + '</label>';
    }

    // Tạo URL danh sách và giữ các điều kiện hiện tại
    function productsUrl(nextParams) {
        const query = nextParams.toString();
        return 'products.html' + (query ? '?' + query : '');
    }

    // Tìm tên hãng chính tắc từ giá trị trên URL
    function getSelectedBrand(brands) {
        return brands.find(function (item) { return item.toLocaleLowerCase() === brandParam.toLocaleLowerCase(); }) || brandParam;
    }

    // Đọc giá nhập tay và ép số âm về 0
    function readCustomPrice(input) {
        if (input.value.trim() === '') return null;
        const value = Number(input.value);
        if (!Number.isFinite(value)) return null;
        if (value < 0) {
            input.value = '0';
            return 0;
        }
        return value;
    }

    // Lấy khoảng giá tùy chỉnh hoặc khoảng giá radio
    function getPriceFilter() {
        const min = readCustomPrice(minInput);
        const max = readCustomPrice(maxInput);
        if (min !== null || max !== null) return { min: min, max: max, invalid: min !== null && max !== null && min > max };
        const selectedRadio = form.querySelector('input[name="price"]:checked');
        const selected = PRICE_RANGES.find(function (range) { return selectedRadio && range.key === selectedRadio.value; });
        return { min: selected ? selected.min : null, max: selected ? selected.max : null, invalid: false };
    }

    // Lọc sản phẩm đồng thời theo từ khóa, giá, danh mục, hãng và khuyến mãi
    function filterProducts(filters) {
        return Shop.queryProducts({
            keyword: filters.keyword,
            categoryId: filters.categoryId,
            brand: filters.brand,
            minPrice: filters.invalid ? 0 : filters.min,
            maxPrice: filters.invalid ? 0 : filters.max,
            onSale: filters.onSale,
            sort: filters.sort
        });
    }

    // Hiển thị hoặc xóa thông báo khoảng giá không hợp lệ
    function showPriceError(message) {
        priceError.textContent = message || '';
        priceError.hidden = !message;
    }

    // Đồng bộ giá trị từ URL vào các trường lọc
    function restorePriceInputs() {
        minInput.value = minParam === null ? '' : minParam;
        maxInput.value = maxParam === null ? '' : maxParam;
        const hasCustomPrice = minParam !== null || maxParam !== null;
        if (hasCustomPrice) {
            const min = readCustomPrice(minInput);
            const max = readCustomPrice(maxInput);
            if (min !== null || max !== null) {
                const minValue = min === null ? -Infinity : min;
                const maxValue = max === null ? Infinity : max;
                if (minValue > maxValue) showPriceError('Giá tối thiểu không được lớn hơn giá tối đa');
            }
        }
    }

    const categories = Shop.getCategories();
    // Lấy hãng từ kết quả tìm kiếm hoặc toàn bộ dữ liệu
    function getBrandsForSearch() {
        if (!keyword) return Shop.getBrands();
        const matchingProducts = Shop.queryProducts({ keyword: keyword });
        return Array.from(new Set(matchingProducts.map(function (product) { return product.brand; }).filter(Boolean)))
            .sort(function (a, b) { return a.localeCompare(b, 'vi'); });
    }

    const brands = getBrandsForSearch();
    const selectedBrand = getSelectedBrand(brands);
    // Render các lựa chọn danh mục, giá và sắp xếp
    document.getElementById('filter-categories').innerHTML = radio('category', '', 'Tất cả', categoryId === '') +
        categories.map(function (category) { return radio('category', String(category.id), category.name, String(category.id) === categoryId); }).join('');
    document.getElementById('filter-prices').innerHTML = radio('price', '', 'Tất cả', !priceKey && minParam === null && maxParam === null) +
        PRICE_RANGES.map(function (range) { return radio('price', range.key, range.label, range.key === priceKey && minParam === null && maxParam === null); }).join('');
    document.getElementById('sort-select').innerHTML = SORTS.map(function (item) {
        return '<option value="' + esc(item.value) + '"' + (item.value === sort ? ' selected' : '') + '>' + esc(item.label) + '</option>';
    }).join('');
    document.getElementById('filter-sale').checked = onSale;
    restorePriceInputs();

    // Render tag hãng và làm nổi bật hãng đang chọn
    function renderBrandFilters() {
        const options = [{ name: 'Tất cả', value: '' }].concat(brands.map(function (item) { return { name: item, value: item }; }));
        document.getElementById('brand-filter-list').innerHTML = options.map(function (item) {
            const active = item.value
                ? item.value.toLocaleLowerCase() === brandParam.toLocaleLowerCase()
                : !brandParam;
            return '<button type="button" class="brand-filter-button' + (active ? ' is-active' : '') + '" data-brand="' + esc(item.value) + '" aria-pressed="' + active + '">' + esc(item.name) + '</button>';
        }).join('');
    }
    renderBrandFilters();

    // Lưu hãng đã chọn mà vẫn giữ các điều kiện lọc khác
    function selectBrand(value) {
        const next = new URLSearchParams(location.search);
        if (value) next.set('brand', value); else next.delete('brand');
        next.delete('page');
        location.href = productsUrl(next);
    }

    // Bắt sự kiện chọn hãng từ danh sách tag
    document.getElementById('brand-filter-list').addEventListener('click', function (event) {
        const button = event.target.closest('[data-brand]');
        if (button) selectBrand(button.dataset.brand);
    });

    // Cập nhật URL từ các điều kiện chọn hiện tại
    function applyFilters() {
        const priceFilter = getPriceFilter();
        if (priceFilter.invalid) {
            showPriceError('Giá tối thiểu không được lớn hơn giá tối đa');
            return;
        }
        showPriceError('');
        const next = new URLSearchParams();
        if (keyword) next.set('q', keyword);
        if (brandParam) next.set('brand', brandParam);
        new FormData(form).forEach(function (value, key) {
            if (value && key !== 'min' && key !== 'max' && key !== 'price') next.set(key, value);
        });
        if (priceFilter.min !== null || priceFilter.max !== null) {
            if (minInput.value !== '' || maxInput.value !== '') {
                if (priceFilter.min !== null) next.set('min', priceFilter.min);
                if (priceFilter.max !== null) next.set('max', priceFilter.max);
            } else {
                const selectedRadio = form.querySelector('input[name="price"]:checked');
                if (selectedRadio && selectedRadio.value) next.set('price', selectedRadio.value);
            }
        }
        location.href = productsUrl(next);
    }

    // Lưu bộ lọc khi người dùng đổi lựa chọn sidebar
    form.addEventListener('change', function (event) {
        if (event.target === minInput || event.target === maxInput) return;
        if (event.target.name === 'price') {
            minInput.value = '';
            maxInput.value = '';
        }
        applyFilters();
    });

    // Bỏ radio khoảng giá khi người dùng nhập giá tùy chỉnh
    [minInput, maxInput].forEach(function (input) {
        input.addEventListener('input', function () {
            form.querySelectorAll('input[name="price"]').forEach(function (radioInput) { radioInput.checked = false; });
            showPriceError('');
        });
    });
    document.getElementById('apply-price-filter').addEventListener('click', applyFilters);
    form.addEventListener('submit', function (event) { event.preventDefault(); applyFilters(); });

    const priceFilter = getPriceFilter();
    const filteredProducts = filterProducts({
        keyword: keyword,
        categoryId: categoryId,
        brand: selectedBrand,
        min: priceFilter.min,
        max: priceFilter.max,
        invalid: priceFilter.invalid,
        onSale: onSale,
        sort: sort
    });
    const page = Shop.paginate(filteredProducts, params.get('page'));
    const category = categories.find(function (item) { return String(item.id) === categoryId; });
    let title = keyword ? 'Kết quả tìm kiếm: ' + keyword : 'Tất cả sản phẩm';
    if (!keyword && categoryId) title = category ? category.name : 'Không tìm thấy loại sản phẩm';
    else if (!keyword && onSale) title = 'Sản phẩm đang giảm giá';
    // Render tiêu đề trang và số lượng kết quả
    document.title = title + ' - ModelShop';
    document.getElementById('list-title').textContent = title;
    document.getElementById('list-count').textContent = 'Tìm thấy ' + page.total + ' sản phẩm';

    // Render breadcrumb theo danh mục đang chọn
    document.getElementById('breadcrumb').innerHTML = '<a href="../index.html">Trang chủ</a> / ' +
        (category ? '<a href="products.html">Sản phẩm</a> / ' + esc(category.name) : 'Sản phẩm');

    // Render sản phẩm hoặc thông báo khi không có kết quả
    document.getElementById('product-grid').innerHTML = page.items.length
        ? page.items.map(UI.productCard).join('')
        : '<div class="empty-box">Không có sản phẩm nào phù hợp.</div>';

    // Tạo URL phân trang và giữ lại toàn bộ bộ lọc
    function pageUrl(number) {
        const next = new URLSearchParams(location.search);
        if (number > 1) next.set('page', number); else next.delete('page');
        return productsUrl(next);
    }

    // Render các liên kết phân trang
    document.getElementById('pagination').innerHTML = UI.pagination(page.page, page.totalPages, pageUrl);
})();
