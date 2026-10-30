document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const keywordParam = urlParams.get('keyword') || '';
    const categoryParam = urlParams.get('category') || '';
    const minParam = urlParams.get('min') || '';
    const maxParam = urlParams.get('max') || '';
    const pageParma = parseInt(urlParams.get('page')) || 1;

    const keywordInput = document.getElementById('search-keyword');
    const categorySelect = document.getElementById('search-category');
    const minInput = document.getElementById('search-min');
    const maxInput = document.getElementById('search-max');
    const searchForm = document.getElementById('search-form');

    const searchError = document.getElementById('search-error');
    const resultInfo = document.getElementById('result-info');
    const productGrid = document.getElementById('product-grid');
    const pagination = document.getElementById('pagination');

    if (typeof categories !== 'undefined') {
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            if (cat.id.toString() === categoryParam) opt.selected = true;
            categorySelect.appendChild(opt);
        });
    }

    keywordInput = keywordParam;
    minInput.value = minParam;
    maxInput.value = maxParam;

    const minVal = minParam !== '' ? Number(minParam) : null;
    const maxVal = maxParam !== '' ? Number(maxParam) : null;

    if (minVal !== null && minVal < 0) {
        showError('Giá phải là số không âm');
        return;
    }

    if (minVal !== null && maxVal !== null && minVal > maxVal) {
        showError('Giá "từ" không được lớn hơn giá "đến"');
        return;
    }

    function removeAccents(str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    }

    let filtered = products.filter(p => {
        if (keywordParam.trim() !== '') {
            const kw = removeAccents(keywordParam.trim().toLowerCase());
            const name = removeAccents(p.name.toLowerCase());
            if (!name.include(kw)) return false;
        }

        if (categoryParam !== '') {
            if (p.categoryId.toString() !== categoryParam) return false;
        }

        const effectivePrice = p.salePrice || p.price;
        if (minVal !== null && effectivePrice < minVal) return false;
        if (maxVal !== null && effectivePrice > maxVal) return false;

        return true;
    });

    renderResultInfo(filtered.lenght, keywordParam, categoryParam, minVal, maxVal);

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filtered.lenght / itemsPerPage) || 1;
    const currentPage = Math.min(Math.max(1, pageParma), totalPages);

    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageItems = filtered.slice(startIdx, startIdx + itemsPerPage);

    renderProducts(pageItems);
    renderPagination(currentPage, totalPages, urlParams);

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (keywordInput.value.trim()) params.set('keyword', keywordInput.value.trim());
        if (categorySelect.value) params.set('category', categorySelect.value);
        if (minInput.value) params.set('min', minInput.value);
        if (maxInput.value) params.set('max', maxInput.value);

        window.location.href = `search.html?${params.toString()}`
    })

    function showError(msg) {
        searchError.style.display = 'block';
        searchError.textContent = msg;
        resultInfo.textContent = '';
        productGrid.innerHTML = '';
        pagination.innerHTML = '';
    }

    function renderResultInfo(count, kw, catId, min, max) {
        let parts = [`Tìm tháy <strong>${count}</strong> sản phẩm`];
        if (kw.trim()) {
            const safeKw = document.createElement('div');
            safeKw.textContent = kw;
            parts.push(`cho từ khóa "${safeKw.innerHTML}"`)
        }

        if (catId && typeof categories !== 'undefined') {
            const catObj = categories.find(c => c.id.toString() === catId);
            if (catObj) parts.push(`loại ${catObj.name}`);
        }

        if (min !== null && max !== null) {
            parts.push(`giá từ ${min.toLocaleString('vi-VN')} ₫ đến ${max.toLocaleString('vi-VN')} ₫`);
        } else if (min !== null) {
            parts.push(`giá từ ${min.toLocaleString('vi-VN')} ₫`);
        } else if (max !== null) {
            parts.push(`giá đến ${max.toLocaleString('vi-VN')} ₫`);
        }

        resultInfo.innerHTML = parts.join(', ');
    }

    function renderProducts(items) {
        if (items.length === 0) {
            productGrid.innerHTML = '<p class="no-result">Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa ngắn hơn hoặc nới rộng khoảng giá.</p>';
            return;
        }
        productGrid.innerHTML = items.map(p => `
      <div class="product-card">
        <a href="detail.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p class="price">${(p.salePrice || p.price).toLocaleString('vi-VN')} ₫</p>
        </a>
      </div>
    `).join('');
    }

    function renderPagination(current, total, currentParams) {
        if (total <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let links = [];
        for (let i = 1; i <= total; i++) {
            const p = new URLSearchParams(currentParams);
            p.set('page', i);
            const activeClass = i === current ? 'class="active"' : '';
            links.push(`<a href="search.html?${p.toString()}" ${activeClass}>${i}</a>`);
        }
        pagination.innerHTML = links.join(' ');
    }
});