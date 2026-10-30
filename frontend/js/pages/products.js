(function () {
    'use strict'

    const PRICE_RANGES = [
        { key: '1', label: 'Dưới 200.000 đ', max: 199999 },
        { key: '2', label: '200.000 đ - 500.000 đ', min: 200000, max: 499999 },
        { key: '3', label: '500.000 đ - 1.000.000 đ', min: 500000, max: 999999 },
        { key: '4', label: '1.000.000 đ - 2.000.000 đ', min: 1000000, max: 1999999 },
        { key: '5', label: 'Trên 2.000.000 đ', min: 2000000 }
    ];

    const SORTS = [
        { value: '', label: 'Mặc định' },
        { value: 'newest', label: 'Mới nhập nhất' },
        { value: 'bestseller', label: 'Bán chạy nhất' },
        { value: 'price-asc', label: 'Giá tăng dần' },
        { value: 'price-desc', label: 'Giá giảm dần' },
        { value: 'name-asc', label: 'Tên A đến Z' },
        { value: 'name-desc', label: 'Tên Z đến A' },
    ];

    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const categoryId = params.get('category') || '';
    const brand = params.get('brand') || '';
    const priceKey = params.get('price') || '';
    const sort = params.get('sort') || '';
    const onSale = params.get('sale') === '1';
    const form = document.getElementById('filter-form');
    document.getElementById('filter-keyword').value = keyword;
    const esc = Shop.escapeHtml;

    function radio(name, value, label, checked) {
        return '<label><input type="radio" name="' + name + '" value="' + esc(value) + '"' +
            (checked ? ' checked' : '') + '> ' + esc(label) + '</label>';
    }

    const categories = Shop.getCategories();
    document.getElementById('filter-categories').innerHTML =
        radio('category', '', 'Tất cả', categoryId === '') +
        categories.map(function (c) { return radio('category', String(c.id), c.name, String(c.id) === categoryId); }).join('');

    document.getElementById('filter-brand').innerHTML =
        '<option value="">Tất cả hãng</option>' +
        Shop.getBrands().map(function (b) {
            return '<option value="' + esc(b) + '"' + (b === brand ? ' selected' : '') + '>' + esc(b) + '</option>';
        }).join('');

    document.getElementById('filter-prices').innerHTML =
        radio('price', '', 'Tất cả', priceKey === '') +
        PRICE_RANGES.map(function (r) { return radio('price', r.key, r.label, r.key === priceKey); }).join('');

    document.getElementById('sort-select').innerHTML = SORTS.map(function (s) {
        return '<option value="' + s.value + '"' + (s.value === sort ? ' selected' : '') + '>' + s.label + '</option>';
    }).join('');

    document.getElementById('filter-sale').checked = onSale;

    function submitFilters() {
    const q = new URLSearchParams();
    new FormData(form).forEach(function (value, key) { if (value) q.set(key, value); });
    const s = q.toString();
    location.href = 'products.html' + (s ? '?' + s : '');}
    form.addEventListener('change', function (e) {
    if (e.target.id !== 'filter-keyword') submitFilters();});
    form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitFilters();});

    const range = PRICE_RANGES.find(function (r) { return r.key === priceKey; });
    const list = Shop.queryProducts({
        keyword: keyword,
        categoryId: categoryId,
        brand: brand,
        onSale: onSale,
        minPrice: range ? range.min : 0,
        maxPrice: range ? range.max : 0,
        sort: sort
    });
    const pg = Shop.paginate(list, params.get('page'));

    const category = categories.find(function (c) { return String(c.id) === categoryId; });
    let title = 'Tất cả sản phẩm';
    if (keyword) title = 'Kết quả tìm kiếm: ' + keyword;
    else if (categoryId) title = category ? category.name : 'Không tìm thấy loại sản phẩm';
    else if (onSale) title = 'Sản phẩm đang giảm giá';
    
    document.title = title + ' - ModelShop';
    document.getElementById('list-title').textContent = title;
    document.getElementById('list-count').textContent = 'Tìm thấy ' + pg.total + ' sản phẩm';
    document.getElementById('breadcrumb').innerHTML =
        '<a href="../index.html">Trang chủ</a> / ' +
        (category ? '<a href="products.html">Sản phẩm</a> / ' + esc(category.name) : esc(title));

    document.getElementById('product-grid').innerHTML = pg.items.length
        ? pg.items.map(UI.productCard).join('')
        : '<div class="empty-box">Không có sản phẩm nào phù hợp.</div>';

    function pageUrl(n) {
        const q = new URLSearchParams(location.search);
        if (n > 1) q.set('page', n); else q.delete('page');
        const s = q.toString();
        return 'products.html' + (s ? '?' + s : '');
    }
    document.getElementById('pagination').innerHTML = UI.pagination(pg.page, pg.totalPages, pageUrl);
})();