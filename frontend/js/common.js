(function (global) {
    'use strict';

    const DB_KEY = 'model_shop_db_v1';
    const PAGE_SIZE = 8;
    let cache = null;

    function seedToObjects() {
        const db = {};
        if (typeof DB_SCHEMA === 'undefined' || typeof DB_SEED === 'undefined') {
            return { categories: [], products: [], stock_movements: [], orders: [], order_items: [] };
        }
        Object.keys(DB_SCHEMA).forEach(function (table) {
            const cols = Object.keys(DB_SCHEMA[table].columns);
            db[table] = DB_SEED[table].map(function (row) {
                const obj = {};
                cols.forEach(function (col, i) { obj[col] = row[i]; });
                return obj;
            });
        });
        return db;
    }

    function saveDB(db) {
        cache = db;
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    function loadDB() {
        if (cache) return cache;
        const raw = localStorage.getItem(DB_KEY);
        if (raw) {
            try {
                cache = JSON.parse(raw);
            } catch (e) {
                cache = seedToObjects();
                saveDB(cache);
            }
        } else {
            cache = seedToObjects();
            saveDB(cache);
        }
        return cache;
    }

    function findById(list, id) {
        if (!Array.isArray(list)) return null;
        return list.find(function (x) { return x.id === Number(id); });
    }

    function formatPrice(n) {
        return Number(n || 0).toLocaleString('vi-VN') + ' đ';
    }

    function normalize(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd');
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (ch) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
        });
    }

    function paginate(list, page, size) {
        size = size || PAGE_SIZE;
        const totalPages = Math.max(1, Math.ceil(list.length / size));
        page = Math.min(Math.max(1, Number(page) || 1), totalPages);
        return {
            items: list.slice((page - 1) * size, page * size),
            page: page,
            totalPages: totalPages,
            total: list.length,
        };
    }

    function getProfitPercent(p) {
        if (p.profit_percent !== null && p.profit_percent !== undefined) {
            return p.profit_percent;
        }
        const categoryId = p.category_id || p.categories_id;
        const cat = findById(loadDB().categories, categoryId);
        return cat ? (cat.profit_percent || 0) : 0;
    }

    function getPrice(p) {
        const cost = Number(p.cost_price || 0);
        const profit = getProfitPercent(p);
        return Math.round((cost * (1 + profit / 100)) / 1000) * 1000;
    }

    function getSalePrice(p) {
        const basePrice = getPrice(p);
        if (!p.sale_percent) return basePrice;
        return Math.round((basePrice * (1 - p.sale_percent / 100)) / 1000) * 1000;
    }

    function getCategories() {
        return (loadDB().categories || []).filter(function (c) { return !c.is_hidden; });
    }

    function getVisibleProducts() {
        const db = loadDB();
        const categories = db.categories || [];
        return (db.products || []).filter(function (p) {
            const categoryId = p.category_id || p.categories_id;
            const c = findById(categories, categoryId);
            return !p.is_hidden && c && !c.is_hidden;
        });
    }

    function getProductById(id) {
        return getVisibleProducts().find(function (p) { return p.id === Number(id); });
    }

    function getCategoryById(id) {
        return findById(loadDB().categories, id);
    }

    function getLastImportDates() {
        const dates = {};
        (loadDB().stock_movements || []).forEach(function (m) {
            if (m.movement_type === 'import' && (!dates[m.product_id] || m.movement_date > dates[m.product_id])) {
                dates[m.product_id] = m.movement_date;
            }
        });
        return dates;
    }

    function sortNewest(list) {
        const d = getLastImportDates();
        return list.slice().sort(function (a, b) {
            return (d[b.id] || '').localeCompare(d[a.id] || '') || (b.id - a.id);
        });
    }

    function getNewest(limit) {
        return sortNewest(getVisibleProducts()).slice(0, limit);
    }

    function getOnSale(limit) {
        return getVisibleProducts().filter(function (p) { return p.sale_percent > 0; }).slice(0, limit);
    }

    function getSoldMap() {
        const db = loadDB();
        const sold = {};
        db.order_items.forEach(function (it) {
            const order = findById(db.orders, it.order_id);
            if (order && order.status !== 'cancelled') {
                sold[it.product_id] = (sold[it.product_id] || 0) + it.quantity;
            }
        });
        return sold;
    }

    function sortBestSeller(list) {
        const sold = getSoldMap();
        return list.slice().sort(function (a, b) {
            return (sold[b.id] || 0) - (sold[a.id] || 0) || a.id - b.id;
        });
    }

    function getBestSellers(limit) {
        const sold = getSoldMap();
        const sellers = getVisibleProducts().filter(function (p) { return sold[p.id]; });
        return sortBestSeller(sellers).slice(0, limit);
    }

    function getBrands() {
        const set = {};
        getVisibleProducts().forEach(function (p) { if (p.brand) set[p.brand] = true; });
        return Object.keys(set).sort();
    }

    function queryProducts(opts) {
        opts = opts || {};
        let list = getVisibleProducts();

        if (opts.categoryId) {
            list = list.filter(function (p) {
                const cId = p.category_id || p.categories_id;
                return cId === Number(opts.categoryId);
            });
        }
        if (opts.brand) {
            list = list.filter(function (p) { return p.brand === opts.brand; });
        }

        if (opts.onSale) {
            list = list.filter(function (p) { return p.sale_percent > 0; })
        }

        if (opts.keyword) {
            const k = normalize(opts.keyword);
            list = list.filter(function (p) { return normalize(p.name).indexOf(k) !== -1; });
        }
        if (opts.minPrice) {
            list = list.filter(function (p) { return getSalePrice(p) >= Number(opts.minPrice); });
        }
        if (opts.maxPrice) {
            list = list.filter(function (p) { return getSalePrice(p) <= Number(opts.maxPrice); });
        }

        // Sắp xếp
        let sortedList = list.slice();
        switch (opts.sort) {
            case 'newest':
                sortedList = sortNewest(sortedList);
                break;
            case 'name-asc':
                sortedList.sort(function (a, b) { return a.name.localeCompare(b.name, 'vi'); });
                break;
            case 'name-desc':
                sortedList.sort(function (a, b) { return b.name.localeCompare(a.name, 'vi'); });
                break;
            case 'price-asc':
                sortedList.sort(function (a, b) { return getSalePrice(a) - getSalePrice(b); });
                break;
            case 'price-desc':
                sortedList.sort(function (a, b) { return getSalePrice(b) - getSalePrice(a); });
                break;
            case 'bestseller': 
                return sortBestSeller(list);
                break;
        }

        // Nếu có truyền page thì phân trang luôn
        if (opts.page) {
            return paginate(sortedList, opts.page, opts.pageSize);
        }

        return sortedList;
    }

    // REGISTER
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^0\d{9}$/;

    function nowString() {
        const d = new Date();
        const p = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    function validateRegister(d) {
        const customers = loadDB().customers;
        if (!/^[A-Za-z0-9_]{4,20}$/.test(d.username)) return 'Tên đăng nhập gồm 4-20 ký tự: chữ không dấu, số hoặc dấu gạch dưới.';
        if (customers.some(function (c) { return c.username.toLowerCase() === d.username.toLowerCase(); })) return 'Tên đăng nhập đã tồn tại.';
        if (d.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
        if (d.password !== d.confirm) return 'Mật khẩu nhập lại không khớp.';
        if (!d.full_name) return 'Vui lòng nhập họ tên.';
        if (!EMAIL_RE.test(d.email)) return 'Email không hợp lệ.';
        if (customers.some(function (c) { return c.email.toLowerCase() === d.email.toLowerCase(); })) return 'Email này đã được sử dụng.';
        if (!PHONE_RE.test(d.phone)) return 'Số điện thoại gồm 10 số và bắt đầu bằng 0.';
        return '';
    }

    function registerCustomer(input) {
        const d = {
            username: String(input.username || '').trim(),
            password: String(input.password || '').trim(),
            confirm: String(input.confirm || '').trim(),
            full_name: String(input.full_name || '').trim(),
            email: String(input.email || '').trim(),
            phone: String(input.phone || '').trim(),
        };
        const error = validateRegister(d);
        if (error) return { ok: false, error: error };

        const db = loadDB();
        const nextId = db.customers.reduce(function (max, c) { return Math.max(max, c.id); }, 0) + 1;
        db.customers.push({
            id: nextId,
            username: d.username,
            password: d.password,
            full_name: d.full_name,
            email: d.email,
            phone: d.phone,
            address_detail: null,
            ward: null,
            district: null,
            city: null,
            is_locked: false,
            created_at: nowString()
        });
        saveDB(db);
        return { ok: true };
    }

    // LOGIN / LOGOUT

    const SESSION_KEY = 'modelshop_user';

    function loginCustomer(username, password) {
        const name = String(username).trim().toLowerCase();
        const user = loadDB().customers.find(function (c) {
            return c.username.toLowerCase() === name && c.password === password;
        });

        if (!user) return { ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu' };
        if (user.is_locked) return { ok: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng!' };
        localStorage.setItem(SESSION_KEY, String(user.id));
        return { ok: true, user: user };
    }

    function logoutCustomer() {
        localStorage.removeItem(SESSION_KEY);
    }

    function getCurrentUser() {
        const id = localStorage.getItem(SESSION_KEY);
        if (!id) return null;
        const user = findById(loadDB().customers, id);
        if (!user || user.is_locked) {
            logoutCustomer();
            return null;
        }
        return user;
    }

    // PROFILE
    function updateProfile(userId, input) {
        const db = loadDB();
        const user = findById(db.customers, userId);
        if (!user) return { ok: false, error: 'Không tìm thấy tài khoản.' };

        const d = {
            full_name: String(input.full_name || '').trim(),
            email: String(input.email || '').trim(),
            phone: String(input.phone || '').trim(),
            address_detail: String(input.address_detail || '').trim(),
            ward: String(input.ward || '').trim(),
            district: String(input.district || '').trim(),
            city: String(input.city || '').trim(),
        };

        if (!d.full_name) return { ok: false, error: 'Vui lòng nhập họ tên.' };
        if (!EMAIL_RE.test(d.email)) return { ok: false, error: 'Email không hợp lệ.' };
        if (db.customers.some(function (c) { return c.id !== user.id && c.email.toLowerCase() === d.email.toLowerCase(); })) {
            return { ok: false, error: 'Email này đã được sử dụng.' };
        }
        if (!PHONE_RE.test(d.phone)) return { ok: false, error: 'Số điện thoại gồm 10 số và bắt đầu bằng 0.' };

        const filled = [d.address_detail, d.ward, d.district, d.city].filter(Boolean).length;
        if (filled !== 0 && filled !== 4) {
            return { ok: false, error: 'Địa chỉ cần nhập đủ 4 mục (số nhà - đường, phường, quận, tỉnh / thành) hoặc để trống cả bốn.' };
        }

        user.full_name = d.full_name;
        user.email = d.email;
        user.phone = d.phone;
        user.address_detail = d.address_detail || null;
        user.ward = d.ward || null;
        user.district = d.district || null;
        user.city = d.city || null;
        saveDB(db);
        return { ok: true };
    }

    function changePassword(userId, current, next, confirm) {
        const db = loadDB();
        const user = findById(db.customers.userId);
        if (!user) return { ok: false, error: 'Không tìm thấy tài khoản.' };
        if (user.password !== current) return { ok: false, error: 'Mật khẩu hiện tại không đúng.' };
        if (next.length < 6) return { ok: false, error: 'Mật khẩu mới tối thiểu 6 ký tự.' };
        if (next !== confirm) return { ok: false, error: 'Mật khẩu nhập lại không khớp.' };
        if (next === current) return { ok: false, error: 'Mật khẩu mới phải khác mật khẩu hiện tại' };
        user.password = next;
        saveDB();
        return { ok: true };
    }

    // Expose API ra môi trường toàn cục
    global.Shop = {
        PAGE_SIZE: PAGE_SIZE,
        loadDB: loadDB,
        saveDB: saveDB,
        findById: findById,
        formatPrice: formatPrice,
        normalize: normalize,
        escapeHtml: escapeHtml,
        paginate: paginate,
        getPrice: getPrice,
        getSalePrice: getSalePrice,
        getCategories: getCategories,
        getCategoryById: getCategoryById,
        getVisibleProducts: getVisibleProducts,
        getProductById: getProductById,
        getNewest: getNewest,
        getOnSale: getOnSale,
        getBestSellers: getBestSellers,
        getBrands: getBrands,
        queryProducts: queryProducts,
        nowString: nowString,
        registerCustomer: registerCustomer,
        loginCustomer: loginCustomer,
        logoutCustomer: logoutCustomer,
        getCurrentUser: getCurrentUser,
        updateProfile: updateProfile,
        changePassword: changePassword,
    };
})(window);