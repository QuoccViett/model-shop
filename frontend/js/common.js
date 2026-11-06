(function (global) {
    'use strict';

    const DB_KEY = 'model_shop_db_v1';
    const PAGE_SIZE = 8;
    let cache = null;
    let cacheRaw = null;
    const snapshots = new WeakMap();

    function sameValue(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

    // Merge only fields changed by this tab; unrelated updates from other tabs survive.
    function mergeChanges(base, edited, latest) {
        if (sameValue(base, edited)) return latest;
        if (sameValue(base, latest) || sameValue(edited, latest)) return edited;
        if (Array.isArray(base) && Array.isArray(edited) && Array.isArray(latest) &&
            base.concat(edited, latest).every(function (row) { return row && row.id !== undefined; })) {
            const before = new Map(base.map(function (row) { return [String(row.id), row]; }));
            const local = new Map(edited.map(function (row) { return [String(row.id), row]; }));
            const remote = new Map(latest.map(function (row) { return [String(row.id), row]; }));
            const result = [];
            new Set(Array.from(remote.keys()).concat(Array.from(local.keys()))).forEach(function (id) {
                const row = mergeChanges(before.get(id), local.get(id), remote.get(id));
                if (row !== undefined) result.push(row);
            });
            return result;
        }
        if (base && edited && latest && !Array.isArray(base) && typeof base === 'object' && typeof edited === 'object' && typeof latest === 'object') {
            const result = {};
            new Set(Object.keys(base).concat(Object.keys(edited), Object.keys(latest))).forEach(function (key) {
                if (key === '_revision') return;
                const value = mergeChanges(base[key], edited[key], latest[key]);
                if (value !== undefined) result[key] = value;
            });
            return result;
        }
        throw new Error('Dữ liệu vừa được thay đổi ở tab khác. Vui lòng tải lại và thực hiện lại thao tác.');
    }

    function cleanupNotifications(db) {
        // Kept for older callers. Notifications remain available for customers to review.
        return false;
    }

    function normalizePaymentMethods(db) {
        if (!db || !Array.isArray(db.orders)) return false;
        let changed = false;
        db.orders.forEach(function (order) {
            if (order.payment_method === 'transfer') {
                order.payment_method = 'online';
                changed = true;
            }
        });
        if (changed) saveDB(db);
        return changed;
    }

    function normalizeProfitOverrides(db) {
        let changed = false;
        (db.products || []).forEach(function (product) {
            if (product.profit_percent === '') {
                product.profit_percent = null;
                changed = true;
            }
        });
        if (changed) saveDB(db);
    }

    function normalizeCustomerDeletion(db) {
        let changed = false;
        (db.customers || []).forEach(function (customer) {
            if (Object.prototype.hasOwnProperty.call(customer, 'is_hidden')) {
                if (customer.is_hidden) customer.is_deleted = true;
                delete customer.is_hidden;
                changed = true;
            }
        });
        if (changed) saveDB(db);
    }

    function removeLegacyDiscontinuedCategory(db) {
        const categories = db.categories || [];
        const legacy = categories.find(function (category) {
            return category.name === 'Hàng ngừng kinh doanh' &&
                category.description === 'Loại đã ẩn (demo chức năng ẩn loại)';
        });
        if (!legacy) return;
        const hasProducts = (db.products || []).some(function (product) {
            return Number(product.category_id || product.categories_id) === Number(legacy.id);
        });
        if (hasProducts) return;
        db.categories = categories.filter(function (category) { return category !== legacy; });
        saveDB(db);
    }

    function normalizeAccountNotifications(db) {
        let changed = false;
        (db.notifications || []).forEach(function (item) {
            if (['account_created', 'profile_updated', 'password_changed'].indexOf(item.type) === -1) return;
            const message = notificationMessage(item.type);
            if (item.message === message && !item.order_id) return;
            item.message = message;
            item.order_id = null;
            changed = true;
        });
        if (changed) saveDB(db);
    }

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
        const raw = localStorage.getItem(DB_KEY);
        const latest = raw ? JSON.parse(raw) : null;
        const base = snapshots.get(db) || (cache && db._revision === cache._revision ? snapshots.get(cache) : null);
        if (!base && latest && db._revision !== latest._revision) {
            throw new Error('Dữ liệu vừa được thay đổi ở tab khác. Vui lòng tải lại và thực hiện lại thao tác.');
        }
        const merged = base && latest ? mergeChanges(base, db, latest) : db;
        merged._revision = Math.max(Number(latest && latest._revision) || 0, Number(db._revision) || 0) + 1;
        if (merged !== db) {
            Object.keys(db).forEach(function (key) { delete db[key]; });
            Object.assign(db, merged);
        }
        const serialized = JSON.stringify(db);
        localStorage.setItem(DB_KEY, serialized);
        cache = db;
        cacheRaw = serialized;
        snapshots.set(db, JSON.parse(serialized));
        global.dispatchEvent(new CustomEvent('modelshop:db-saved'));
    }

    function loadDB() {
        const stored = localStorage.getItem(DB_KEY);
        if (cache && stored !== cacheRaw) cache = null;
        if (cache) {
            cleanupNotifications(cache);
            normalizePaymentMethods(cache);
            normalizeProfitOverrides(cache);
            normalizeCustomerDeletion(cache);
            removeLegacyDiscontinuedCategory(cache);
            normalizeAccountNotifications(cache);
            return cache;
        }
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
        if (!cache.notifications) cache.notifications = [];
        cacheRaw = localStorage.getItem(DB_KEY);
        snapshots.set(cache, JSON.parse(JSON.stringify(cache)));
        normalizePaymentMethods(cache);
        normalizeProfitOverrides(cache);
        normalizeCustomerDeletion(cache);
        removeLegacyDiscontinuedCategory(cache);
        normalizeAccountNotifications(cache);
        if (typeof DB_SEED !== 'undefined' && DB_SEED.notifications) {
            const notificationColumns = Object.keys(DB_SCHEMA.notifications.columns);
            let changed = false;
            DB_SEED.notifications.forEach(function (row) {
                const seedNotification = {};
                notificationColumns.forEach(function (column, index) { seedNotification[column] = row[index]; });
                if (!cache.notifications.some(function (item) { return Number(item.id) === Number(seedNotification.id); })) {
                    cache.notifications.push(seedNotification);
                    changed = true;
                }
            });
            if (changed) saveDB(cache);
        }
        cleanupNotifications(cache);
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

    function isBlank(value) { return value === null || value === undefined || String(value).trim() === ''; }

    function parseProfitPercent(value, allowBlank) {
        if (isBlank(value)) return allowBlank ? { ok: true, value: null } : { ok: false, message: 'Vui lòng nhập % lợi nhuận!' };
        const number = Number(String(value).trim().replace(',', '.'));
        if (!Number.isFinite(number) || number < 0 || number > 1000) {
            return { ok: false, message: '% lợi nhuận phải từ 0 đến 1000!' };
        }
        return { ok: true, value: Math.round(number * 100) / 100 };
    }

    function getProfitPercent(p) {
        if (!isBlank(p.profit_percent)) return Number(p.profit_percent);
        const categoryId = p.category_id || p.categories_id;
        const cat = findById(loadDB().categories, categoryId);
        return cat && !isBlank(cat.profit_percent) ? Number(cat.profit_percent) : 0;
    }

    function getPrice(p) {
        const cost = Number(p.cost_price || 0);
        const profit = getProfitPercent(p);
        if (!(cost > 0)) return 0;
        return Math.round((cost * (1 + profit / 100)) / 1000) * 1000;
    }

    function getSalePrice(p) {
        const basePrice = getPrice(p);
        if (!p.sale_percent) return basePrice;
        const discount = Math.min(100, Math.max(0, Number(p.sale_percent) || 0));
        return Math.round((basePrice * (1 - discount / 100)) / 1000) * 1000;
    }

    function getCategories() {
        return (loadDB().categories || []).filter(function (c) { return !c.is_hidden && !c.is_deleted; });
    }

    function getVisibleProducts() {
        const db = loadDB();
        const categories = db.categories || [];
        return (db.products || []).filter(function (p) {
            const categoryId = p.category_id || p.categories_id;
            const c = findById(categories, categoryId);
            return !p.is_hidden && !p.is_deleted && c && !c.is_hidden && !c.is_deleted;
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
        const hasMin = !isBlank(opts.minPrice), hasMax = !isBlank(opts.maxPrice);
        if ((hasMin && (!Number.isFinite(Number(opts.minPrice)) || Number(opts.minPrice) < 0)) ||
            (hasMax && (!Number.isFinite(Number(opts.maxPrice)) || Number(opts.maxPrice) < 0)) ||
            (hasMin && hasMax && Number(opts.minPrice) > Number(opts.maxPrice))) {
            return opts.page ? paginate([], opts.page, opts.pageSize) : [];
        }
        if (hasMin) {
            list = list.filter(function (p) { return getSalePrice(p) >= Number(opts.minPrice); });
        }
        if (hasMax) {
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
                sortedList = sortBestSeller(sortedList);
                break;
        }

        // Nếu có truyền page thì phân trang luôn
        if (opts.page) {
            return paginate(sortedList, opts.page, opts.pageSize);
        }

        return sortedList;
    }

    //ADMIN MANAGE CATEGORIES & PRODUCTS
    // Lấy danh sách loại sản phẩm
    function getAllCategories(){
        const db = loadDB();
        if(!db.categories) db.categories = [];
        return db.categories;
    }

    // Lấy 1 loại sản phẩm (kể cả đã ẩn)
    function getAllCategoryIgnoreHidden(id){
        return findById(loadDB().categories, id);
    }

    // Lấy danh sách sản phẩm
    function getAllProducts(){
        const db = loadDB();
        if(!db.products) db.products = [];
        return db.products;
    }

    // Lấy 1 sản phẩm (kể cả đã ẩn) 
    function getProductByIdIgnoreHidden(id){
        return findById(loadDB().products, id);
    }    

    function getProductDisplayStatus(product, category) {
        if (category === undefined) category = findById(loadDB().categories, product.category_id || product.categories_id);
        if (!category || category.is_deleted) return 'deleted';
        if (category.is_hidden) return 'hidden';
        if (product.is_deleted) return 'deleted';
        if (product.is_hidden) return 'hidden';
        return 'active';
    }

    // Tìm kiếm và lọc loại sản phẩm
    function filterCategories({keyword = '', status = 'all'} = {}){
        let categories = getAllCategories();

        // lọc theo trạng thái ẩn/ không bị ẩn
        if (status === 'active') {
            categories = categories.filter(c => !c.is_hidden && !c.is_deleted);
        } else if (status === 'hidden') {
            categories = categories.filter(c => c.is_hidden && !c.is_deleted);
        } else if (status === 'deleted') {
            categories = categories.filter(c => c.is_deleted);
        }

        //lọc theo từ khoá
        if (keyword.trim() !== '') {
            const key = keyword.toLowerCase().trim();
            categories = categories.filter(c => 
                (c.name && c.name.toLowerCase().includes(key)) ||
                (c.description && c.description.toLowerCase().includes(key))
            );
        }

        return categories;
    }

    // Tìm kiếm và lọc sản phẩm
    function filterProducts({keyword = '', status = 'all', category_id = 'all'} = {}){
        let products = getAllProducts();
        const categories = loadDB().categories || [];

        // lọc theo danh mục
        if (category_id !== 'all' && category_id !== '' && category_id !== null && category_id !== undefined) {
            products = products.filter(p => Number(p.category_id) === Number(category_id));
        }

        if (status !== 'all') products = products.filter(function (product) {
            return getProductDisplayStatus(product, findById(categories, product.category_id || product.categories_id)) === status;
        });

        //lọc theo từ khoá
        if (keyword.trim() !== '') {
            const key = keyword.toLowerCase().trim();
            products = products.filter(c => 
                (c.code && c.code.toLowerCase().includes(key)) ||
                (c.name && c.name.toLowerCase().includes(key)) ||
                (c.description && c.description.toLowerCase().includes(key)) ||
                (c.brand && c.brand.toLowerCase().includes(key)) ||
                (c.description && c.description.toLowerCase().includes(key))
            );
        }

        return products;
    }

    // Thêm loại sản phẩm mới
    function addCategory(newCategoryData) {
        const profit = parseProfitPercent(newCategoryData.profit_percent, true);
        if (!profit.ok) return { success: false, message: profit.message };
        const d = {
            name: String(newCategoryData.name || '').trim(),
            description: String(newCategoryData.description || '').trim(),
            profit_percent: String(newCategoryData.profit_percent || '').trim()
        };

        const db = loadDB();
        if (!db.categories) db.categories = [];

        // Tự sinh ID kế tiếp tăng dần
        const nextId = db.categories.reduce(function (max, c) { return Math.max(max, c.id); }, 0) + 1;

        const newCategory = {
            id: nextId,
            name: d.name,
            description: d.description || '',
            profit_percent: profit.value,
            is_hidden: false,
            is_deleted: false
        };

        db.categories.push(newCategory);
        saveDB(db); // Lưu vào cache và localStorage tự động

        return { success: true, message: 'Thêm danh mục mới thành công!', data: newCategory };
    }

    function validateProductData(data, db, editingId) {
        const code = String(data.code || '').trim();
        if (!code || !String(data.name || '').trim() || !Number(data.category_id)) return 'Vui lòng nhập mã, tên và loại sản phẩm!';
        const category = findById(db.categories, data.category_id);
        if (!category || category.is_deleted) return 'Loại sản phẩm không tồn tại!';
        if ((db.products || []).some(function (p) { return Number(p.id) !== Number(editingId) && String(p.code || '').toLowerCase() === code.toLowerCase(); })) return 'Mã sản phẩm đã tồn tại!';
        if (!String(data.image || '').trim() || !String(data.description || '').trim()) return 'Vui lòng nhập hình ảnh và mô tả sản phẩm!';
        const profit = parseProfitPercent(data.profit_percent, true);
        if (!profit.ok) return profit.message;
        const sale = isBlank(data.sale_percent) ? 0 : Number(data.sale_percent);
        if (!Number.isFinite(sale) || sale < 0 || sale > 100) return '% giảm giá phải từ 0 đến 100!';
        const threshold = isBlank(data.low_stock_threshold) ? 5 : Number(data.low_stock_threshold);
        if (!Number.isInteger(threshold) || threshold < 0) return 'Ngưỡng cảnh báo phải là số nguyên không âm!';
        return '';
    }

    // Thêm sản phẩm mới
    function addProduct(newProductData) {
        const db = loadDB();
        const error = validateProductData(newProductData, db);
        if (error) return { success: false, message: error };
        const profit = parseProfitPercent(newProductData.profit_percent, true);
        const d = {
            category_id: Number(newProductData.category_id || 0),
            code: String(newProductData.code || '').trim(),
            name: String(newProductData.name || '').trim(),
            image: String(newProductData.image || '').trim(),
            description: String(newProductData.description || '').trim(),
            brand: String(newProductData.brand || '').trim(),
            scale: String(newProductData.scale || '').trim(),
            material: String(newProductData.material || '').trim(),
            size: String(newProductData.size || '').trim(),
            profit_percent: String(newProductData.profit_percent || '').trim(),
            cost_price: String(newProductData.cost_price || '').trim(),
            stock_qty: String(newProductData.stock_qty || '').trim(),
            low_stock_threshold: String(newProductData.low_stock_threshold ?? '').trim(),
            sale_percent: String(newProductData.sale_percent || '').trim(),
        };

        if (!db.products) db.products = [];

        // Tự sinh ID kế tiếp tăng dần
        const nextId = db.products.reduce(function (max, c) { return Math.max(max, c.id); }, 0) + 1;

        const newProduct = {
            id: nextId,
            category_id: d.category_id,
            code: d.code,
            name: d.name,
            image: d.image,
            images: Array.isArray(newProductData.images) ? newProductData.images.slice(0, 2) : [d.image],
            description: d.description || '',
            brand: d.brand,
            scale: d.scale,
            material: d.material,
            size: d.size,
            profit_percent: profit.value,
            cost_price: Number(d.cost_price || 0),
            stock_qty: Number(d.stock_qty || 0),
            low_stock_threshold: Number(d.low_stock_threshold === '' ? 5 : d.low_stock_threshold),
            is_hidden: false,
            is_deleted: false,
            sale_percent: Number(d.sale_percent || 0)
        };

        db.products.push(newProduct);
        saveDB(db); // Lưu vào cache và localStorage tự động

        return { success: true, message: 'Thêm sản phẩm mới thành công!', data: newProduct };
    }

    // Cập nhật loại sản phẩm
    function updateCategory(id, categoryData) {
        const profit = parseProfitPercent(categoryData.profit_percent, true);
        if (!profit.ok) return { success: false, message: profit.message };
        const db = loadDB();
        if (!db.categories) return { success: false, message: 'Không tìm thấy dữ liệu loại sản phẩm!' };

        const index = db.categories.findIndex(c => c.id == id);
        if (index === -1) return { success: false, message: 'Không tìm thấy loại sản phẩm cần sửa!' };
        if (db.categories[index].is_deleted) return { success: false, message: 'Hãy khôi phục loại sản phẩm trước khi sửa.' };

        db.categories[index] = {
            ...db.categories[index],
            name: String(categoryData.name || '').trim(),
            description: String(categoryData.description || '').trim(),
            profit_percent: profit.value
        };

        saveDB(db);
        return { success: true, message: 'Cập nhật loại sản phẩm thành công!', data: db.categories[index] };
    }

    // Toggle ẩn/hiện loại sản phẩm
    function toggleHideCategory(id) {
        const db = loadDB();
        if (!db.categories) return { success: false };

        const cat = db.categories.find(c => c.id == id);
        if (cat && !cat.is_deleted) {
            cat.is_hidden = !cat.is_hidden;
            saveDB(db);
            return { success: true, message: 'Thay đổi trạng thái thành công!' };
        }
        return { success: false, message: 'Không tìm thấy danh mục!' };
    }

    // Xóa loại sản phẩm
    function deleteCategory(id) {
        const db = loadDB();
        if (!db.categories) return { success: false };
        const category = findById(db.categories, id);
        if (!category) return { success: false, message: 'Không tìm thấy danh mục!' };
        if (category.is_deleted) return { success: false, message: 'Danh mục đã được xóa trước đó.' };
        category.is_deleted = true;
        (db.products || []).forEach(function (product) {
            if (Number(product.category_id || product.categories_id) === Number(category.id) && !product.is_deleted) {
                product.is_deleted = true;
                product.discontinued_by_category_id = category.id;
            }
        });
        saveDB(db);
        return { success: true, message: 'Đã ngừng kinh doanh loại sản phẩm và toàn bộ sản phẩm thuộc loại này.' };
    }

    function restoreCategory(id) {
        const db = loadDB();
        const category = findById(db.categories, id);
        if (!category || !category.is_deleted) return { success: false, message: 'Không tìm thấy danh mục đã xóa!' };
        category.is_deleted = false;
        (db.products || []).forEach(function (product) {
            if (Number(product.discontinued_by_category_id) === Number(category.id)) {
                product.is_deleted = false;
                delete product.discontinued_by_category_id;
            }
        });
        saveDB(db);
        return { success: true, message: 'Đã khôi phục danh mục.' };
    }

    // Cập nhật sản phẩm
    function updateProduct(id, productData) {
        const db = loadDB();
        if (!db.products) return { success: false, message: 'Không tìm thấy dữ liệu sản phẩm!' };

        const index = db.products.findIndex(p => p.id == id);
        if (index === -1) return { success: false, message: 'Không tìm thấy sản phẩm cần sửa!' };
        const currentCategory = findById(db.categories, db.products[index].category_id);
        if (!currentCategory || currentCategory.is_deleted) {
            return { success: false, message: 'Hãy khôi phục loại sản phẩm trước khi sửa.' };
        }
        if (db.products[index].is_deleted) {
            if (!currentCategory.is_hidden) {
                return { success: false, message: 'Hãy khôi phục sản phẩm trước khi sửa.' };
            }
        }
        const error = validateProductData(productData, db, id);
        if (error) return { success: false, message: error };
        const profit = parseProfitPercent(productData.profit_percent, true);

        db.products[index] = {
            ...db.products[index],
            category_id: Number(productData.category_id),
            code: String(productData.code || '').trim(),
            name: String(productData.name || '').trim(),
            image: String(productData.image || '').trim(),
            images: Array.isArray(productData.images) ? productData.images.slice(0, 2) : [String(productData.image || '').trim()],
            description: String(productData.description || '').trim(),
            brand: String(productData.brand || '').trim(),
            scale: String(productData.scale || '').trim(),
            material: String(productData.material || '').trim(),
            size: String(productData.size || '').trim(),
            profit_percent: profit.value,
            cost_price: Number(productData.cost_price || 0),
            stock_qty: Number(productData.stock_qty || 0),
            low_stock_threshold: Number(isBlank(productData.low_stock_threshold) ? 5 : productData.low_stock_threshold),
            sale_percent: Number(productData.sale_percent || 0)
        };

        saveDB(db);
        return { success: true, message: 'Cập nhật sản phẩm thành công!', data: db.products[index] };
    }

    // Toggle ẩn/hiện sản phẩm
    function toggleHideProduct(id) {
        const db = loadDB();
        if (!db.products) return { success: false };

        const prod = db.products.find(p => p.id == id);
        if (prod && !prod.is_deleted) {
            const category = findById(db.categories, prod.category_id);
            if (!category || category.is_hidden || category.is_deleted) return { success: false, message: 'Hãy hiện hoặc khôi phục loại sản phẩm trước.' };
            prod.is_hidden = !prod.is_hidden;
            saveDB(db);
            return { success: true, message: 'Thay đổi trạng thái sản phẩm thành công!' };
        }
        return { success: false, message: 'Không tìm thấy sản phẩm!' };
    }

    // Xóa sản phẩm
    function deleteProduct(id) {
        const db = loadDB();
        if (!db.products) return { success: false };
        const product = findById(db.products, id);
        if (!product) return { success: false, message: 'Không tìm thấy sản phẩm để xóa!' };
        if (product.is_deleted) return { success: false, message: 'Sản phẩm đã ngừng kinh doanh trước đó.' };
        const category = findById(db.categories, product.category_id);
        if (!category || category.is_hidden || category.is_deleted) return { success: false, message: 'Hãy hiện hoặc khôi phục loại sản phẩm trước.' };
        product.is_deleted = true;
        delete product.discontinued_by_category_id;
        saveDB(db);
        return { success: true, message: 'Đã chuyển sản phẩm sang trạng thái ngừng kinh doanh.' };
    }

    function restoreProduct(id) {
        const db = loadDB();
        const product = findById(db.products, id);
        if (!product || !product.is_deleted) return { success: false, message: 'Không tìm thấy sản phẩm đã xóa!' };
        product.is_deleted = false;
        delete product.discontinued_by_category_id;
        saveDB(db);
        return { success: true, message: 'Đã khôi phục sản phẩm.' };
    }

    // REGISTER
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^0\d{9}$/;
    function validatePassword(password) { return String(password || '').length >= 6; }

    function nowString() {
        const d = new Date();
        const p = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    function validateRegister(d) {
        const customers = loadDB().customers;
        if (!/^[A-Za-z0-9_]{4,20}$/.test(d.username)) return 'Tên đăng nhập gồm 4-20 ký tự: chữ không dấu, số hoặc dấu gạch dưới.';
        if (customers.some(function (c) { return c.username.toLowerCase() === d.username.toLowerCase(); })) return 'Tên đăng nhập đã tồn tại.';
        if (!validatePassword(d.password)) return 'Mật khẩu tối thiểu 6 ký tự.';
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
            is_deleted: false,
            created_at: nowString()
        });
        saveDB(db);
        localStorage.setItem(SESSION_KEY, String(nextId));
        createNotification(nextId, 'account_created');
        return { ok: true };
    }

    // LOGIN / LOGOUT

    const SESSION_KEY = 'modelshop_user'; // cho user
    const SESSION_KEY_AD = 'modelshop_admin'; // cho admin

    function loginAdmin(username, password){
        const name = String(username).trim().toLowerCase();
        const admin = loadDB().admins.find(function (c){
            return c.username.toLowerCase() === name && c.password === password;
        });

        if(!admin) return { ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu' };
        localStorage.setItem(SESSION_KEY_AD, String(admin.id));
        return { ok: true, admin: admin };
    }

    function loginCustomer(username, password) {
        const name = String(username).trim().toLowerCase();
        const user = loadDB().customers.find(function (c) {
            return c.username.toLowerCase() === name && c.password === password;
        });

        if (!user) return { ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu' };
        if (user.is_deleted) return { ok: false, error: 'Tài khoản của bạn đã bị xóa. Vui lòng liên hệ cửa hàng!' };
        if (user.is_locked) return { ok: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng!' };
        localStorage.setItem(SESSION_KEY, String(user.id));
        return { ok: true, user: user };
    }

    function logoutCustomer() {
        localStorage.removeItem(SESSION_KEY);
    }

    function logoutAdmin(){
        localStorage.removeItem(SESSION_KEY_AD);
    }

    function getCurrentUser() {
        const id = localStorage.getItem(SESSION_KEY);
        if (!id) return null;
        const user = findById(loadDB().customers, id);
        if (!user || user.is_locked || user.is_deleted) {
            logoutCustomer();
            return null;
        }
        return user;
    }

    function getCurrentAdmin(){
        const id = localStorage.getItem(SESSION_KEY_AD);
        if (!id) return null;
        const admin = findById(loadDB().admins, id);
        if (!admin) {
            logoutAdmin();
            return null;
        }
        return admin;
    }

    // MANAGE USERS
    function getAllUsers(){
        const db= loadDB();
        if(!db.customers) db.customers= [];
        return db.customers;
    }

    function getUserById(id){
        const customers = getAllUsers();
        return customers.find(c => String(c.id) === String(id)) || null;
    }

    function filterUsers({keyword = '', status = 'all'} = {}){
        let customers = getAllUsers();

        // lọc theo trạng thái khoá/ mở tài khoản
        if (status === 'active') {
            customers = customers.filter(c => !c.is_locked && !c.is_deleted);
        } else if (status === 'locked') {
            customers = customers.filter(c => c.is_locked && !c.is_deleted);
        } else if (status === 'deleted') {
            customers = customers.filter(c => c.is_deleted);
        }

        //lọc theo từ khoá
        if (keyword.trim() !== '') {
            const key = keyword.toLowerCase().trim();
            customers = customers.filter(c => 
                (c.username && c.username.toLowerCase().includes(key)) ||
                (c.full_name && c.full_name.toLowerCase().includes(key)) ||
                (c.email && c.email.toLowerCase().includes(key)) ||
                (c.phone && c.phone.includes(key))
            );
        }

        return customers;
    }

    function addCustomer(newCustomerData) {
        const d = {
            username: String(newCustomerData.username || '').trim(),
            password: String(newCustomerData.password || '').trim(),
            confirm: String(newCustomerData.password || '').trim(), // Gán confirm bằng password luôn
            full_name: String(newCustomerData.full_name || '').trim(),
            email: String(newCustomerData.email || '').trim(),
            phone: String(newCustomerData.phone || '').trim(),
        };

        const error = validateRegister(d);
        if (error) {
            return { success: false, message: error }; 
        }
        const address = ['address_detail', 'ward', 'district', 'city'].map(function (key) { return String(newCustomerData[key] || '').trim(); });
        const filledAddress = address.filter(Boolean).length;
        if (filledAddress !== 0 && filledAddress !== 4) return { success: false, message: 'Vui lòng nhập địa chỉ đầy đủ hoặc để trống cả bốn.' };

        const db = loadDB();
        if (!db.customers) db.customers = [];

        // Kiểm tra trùng username 
        const existsUsername = db.customers.some(c => c.username && c.username.toLowerCase() === d.username.toLowerCase());
        if (existsUsername) {
            return { success: false, message: 'Tên đăng nhập đã tồn tại!' };
        }

        // Kiểm tra trùng email 
        const existsEmail = db.customers.some(c => c.email && c.email.toLowerCase() === d.email.toLowerCase());
        if (existsEmail) {
            return { success: false, message: 'Email đã được sử dụng!' };
        }

        // Tự sinh ID kế tiếp tăng dần
        const nextId = db.customers.reduce(function (max, c) { return Math.max(max, c.id); }, 0) + 1;

        const newCustomer = {
            id: nextId,
            username: d.username,
            password: d.password || '123456',
            full_name: d.full_name || '',
            email: d.email || '',
            phone: d.phone || '',
            address_detail: address[0] || null,
            ward: address[1] || null,
            district: address[2] || null,
            city: address[3] || null,
            is_locked: false,
            is_deleted: false,
            created_at: nowString()
        };

        db.customers.push(newCustomer);
        saveDB(db); // Lưu vào cache và localStorage tự động

        return { success: true, message: 'Thêm khách hàng thành công!', data: newCustomer };
    }

    function resetCustomerPassword(id, newPassword) {
        if (!validatePassword(String(newPassword || '').trim())) return { success: false, message: 'Mật khẩu mới tối thiểu 6 ký tự.' };

        const db = loadDB();
        if (!db.customers) db.customers = [];
        const customer = db.customers.find(c => String(c.id) === String(id));

        if (!customer) {
            return { success: false, message: 'Không tìm thấy người dùng!' };
        }
        if (customer.is_deleted) return { success: false, message: 'Hãy khôi phục khách hàng trước khi đặt lại mật khẩu.' };

        customer.password = newPassword.trim();
        saveDB(db);

        return { success: true, message: `Đặt lại mật khẩu cho tài khoản "${customer.username}" thành công!` };
    }

    function toggleLockCustomer(id) {
        const db = loadDB();
        if (!db.customers) db.customers = [];
        const customer = db.customers.find(c => String(c.id) === String(id));

        if (!customer) {
            return { success: false, message: 'Không tìm thấy người dùng!' };
        }
        if (customer.is_deleted) return { success: false, message: 'Hãy khôi phục khách hàng trước khi đổi trạng thái khóa.' };
        customer.is_locked = !customer.is_locked;
        saveDB(db);

        const statusText = customer.is_locked ? 'Khóa' : 'Mở khóa';
        return { 
            success: true, 
            message: `Đã ${statusText.toLowerCase()} tài khoản "${customer.username}" thành công!`, 
            is_locked: customer.is_locked 
        };
    }

    function deleteCustomer(id) {
        const db = loadDB();
        const customer = findById(db.customers, id);
        if (!customer) return { success: false, message: 'Không tìm thấy khách hàng!' };
        if (customer.is_deleted) return { success: false, message: 'Khách hàng đã được xóa trước đó.' };
        customer.is_deleted = true;
        saveDB(db);
        return { success: true, message: 'Đã xóa mềm khách hàng; hồ sơ và lịch sử đơn hàng được giữ lại.' };
    }

    function restoreCustomer(id) {
        const db = loadDB();
        const customer = findById(db.customers, id);
        if (!customer || !customer.is_deleted) return { success: false, message: 'Không tìm thấy khách hàng đã xóa!' };
        customer.is_deleted = false;
        saveDB(db);
        return { success: true, message: 'Đã khôi phục khách hàng.' };
    }

    // PROFILE
    function updateProfile(userId, input) {
        const db = loadDB();
        const user = findById(db.customers, userId);
        if (!user || user.is_deleted) return { ok: false, error: 'Không tìm thấy tài khoản.' };

        const d = {
            full_name: String(input.full_name || '').trim(),
            email: String(input.email || '').trim(),
            phone: String(input.phone || '').trim(),
            address_detail: String(input.address_detail === undefined ? (user.address_detail || '') : input.address_detail || '').trim(),
            ward: String(input.ward === undefined ? (user.ward || '') : input.ward || '').trim(),
            district: String(input.district === undefined ? (user.district || '') : input.district || '').trim(),
            city: String(input.city === undefined ? (user.city || '') : input.city || '').trim(),
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
        createNotification(user.id, 'profile_updated');
        return { ok: true };
    }

    function changePassword(userId, current, next, confirm) {
        const db = loadDB();
        const user = findById(db.customers, userId);
        if (!user || user.is_deleted) return { ok: false, error: 'Không tìm thấy tài khoản.' };
        current = String(current || '');
        next = String(next || '');
        confirm = String(confirm || '');
        if (user.password !== current) return { ok: false, error: 'Mật khẩu hiện tại không đúng.' };
        if (!validatePassword(next)) return { ok: false, error: 'Mật khẩu mới tối thiểu 6 ký tự.' };
        if (next !== confirm) return { ok: false, error: 'Mật khẩu nhập lại không khớp.' };
        if (next === current) return { ok: false, error: 'Mật khẩu mới phải khác mật khẩu hiện tại' };
        user.password = next;
        saveDB(db);
        createNotification(user.id, 'password_changed');
        return { ok: true };
    }

    // Chuẩn hóa trạng thái cũ để giao diện user luôn dùng một bộ mã
    function normalizeStatus(status) {
        if (global.ORDER_STATUS) return global.ORDER_STATUS.normalize(status);
        return ({ new: 'order_created', processed: 'order_confirmed', delivered: 'delivered', cancelled: 'cancelled' }[status] || status);
    }

    function getOrderCode(id) {
        return 'MS' + String(id).padStart(4, '0');
    }

    function notificationMessage(type, orderId) {
        const accountMessages = {
            account_created: 'Tài khoản ModelShop của bạn đã được tạo thành công.',
            profile_updated: 'Thông tin tài khoản của bạn đã được cập nhật thành công.',
            password_changed: 'Mật khẩu tài khoản của bạn đã được đổi thành công.'
        };
        if (accountMessages[type]) return accountMessages[type];
        const labels = {
            order_created: 'đã được đặt thành công',
            payment_success: 'đã thanh toán thành công',
            order_confirmed: 'đã được xác nhận',
            shipping: 'đang được giao đến bạn',
            delivered: 'vừa được giao thành công',
            cancelled: 'đã được hủy'
        };
        return 'Đơn hàng #' + getOrderCode(orderId) + ' ' + (labels[type] || 'đã được cập nhật') + '. Cảm ơn bạn đã đặt hàng tại ModelShop.';
    }

    function createNotification(customerId, type, orderId, message) {
        const db = loadDB();
        if (!db.notifications) db.notifications = [];
        const item = {
            id: db.notifications.reduce(function (max, n) { return Math.max(max, Number(n.id) || 0); }, 0) + 1,
            customer_id: Number(customerId),
            type: orderId ? normalizeStatus(type) : type,
            order_id: orderId ? Number(orderId) : null,
            message: message || notificationMessage(orderId ? normalizeStatus(type) : type, orderId),
            is_read: false,
            created_at: nowString()
        };
        db.notifications.push(item);
        saveDB(db);
        global.dispatchEvent(new CustomEvent('modelshop:notifications'));
        return item;
    }

    function getMyNotifications(filter) {
        const user = getCurrentUser();
        if (!user) return [];
        const db = loadDB();
        cleanupNotifications(db);
        let list = (db.notifications || []).filter(function (n) { return Number(n.customer_id) === Number(user.id); });
        if (filter === 'orders') list = list.filter(function (n) { return n.order_id; });
        return list.sort(function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });
    }

    function getUnreadCount() {
        return getMyNotifications().filter(function (n) { return !n.is_read; }).length;
    }

    function markRead(id) {
        const user = getCurrentUser();
        const db = loadDB();
        const item = (db.notifications || []).find(function (n) {
            return Number(n.id) === Number(id) && user && Number(n.customer_id) === Number(user.id);
        });
        if (!item) return false;
        item.is_read = true;
        saveDB(db);
        global.dispatchEvent(new CustomEvent('modelshop:notifications'));
        return true;
    }

    function markAllRead() {
        const user = getCurrentUser();
        if (!user) return;
        const db = loadDB();
        (db.notifications || []).forEach(function (n) {
            if (Number(n.customer_id) === Number(user.id)) n.is_read = true;
        });
        saveDB(db);
        global.dispatchEvent(new CustomEvent('modelshop:notifications'));
    }

    // Lấy danh sách đơn của người dùng theo nhóm trạng thái
    function getMyOrders(statusGroup) {
        const user = getCurrentUser();
        if (!user) return [];
        const db = loadDB();
        return (db.orders || []).filter(function (o) {
            if (Number(o.customer_id) !== Number(user.id)) return false;
            if (!statusGroup || statusGroup === 'all') return true;
            return Boolean(global.ORDER_STATUS && global.ORDER_STATUS.get(o.status).group === statusGroup);
        }).sort(function (a, b) { return String(b.order_date).localeCompare(String(a.order_date)); });
    }

    // Lấy một đơn hàng thuộc tài khoản hiện tại
    function getOrderById(id) {
        const user = getCurrentUser();
        if (!user) return null;
        const order = findById(loadDB().orders, id);
        return order && Number(order.customer_id) === Number(user.id) ? order : null;
    }

    // Một đường cập nhật trạng thái cho cả quản trị và khách hàng; tồn kho đổi cùng lần lưu đơn.
    function changeOrderStatus(id, nextStatus) {
        const db = loadDB();
        const order = findById(db.orders, id);
        if (!order || !global.ORDER_STATUS || !global.ORDER_STATUS.all[nextStatus]) {
            return { ok: false, error: 'Đơn hàng hoặc trạng thái không hợp lệ.' };
        }
        if (!global.ORDER_STATUS.canTransition(order.status, nextStatus, order.payment_method)) {
            return { ok: false, error: 'Không thể chuyển trạng thái theo luồng đơn hàng đã quy định.' };
        }

        const movements = db.stock_movements || (db.stock_movements = []);
        const products = db.products || [];
        const orderMovements = movements.filter(function (movement) {
            return movement.ref_type === 'order' && Number(movement.ref_id) === Number(id);
        });
        const quantities = new Map();
        (db.order_items || []).filter(function (item) { return Number(item.order_id) === Number(id); })
            .forEach(function (item) {
                const productId = Number(item.product_id), quantity = Number(item.quantity);
                quantities.set(productId, (quantities.get(productId) || 0) + quantity);
            });
        const stockChanges = [];
        if (nextStatus === 'order_confirmed') {
            for (const [productId, quantity] of quantities) {
                if (!Number.isSafeInteger(quantity) || quantity <= 0) return { ok: false, error: 'Số lượng sản phẩm không hợp lệ.' };
                const product = findById(products, productId);
                if (!product) return { ok: false, error: 'Có sản phẩm trong đơn hàng không còn tồn tại.' };
                if (!orderMovements.some(function (movement) { return movement.movement_type === 'export' && Number(movement.product_id) === productId; })) {
                    if (Number(product.stock_qty || 0) < quantity) return { ok: false, error: 'Sản phẩm ' + product.name + ' không đủ tồn kho.' };
                    stockChanges.push({ product: product, quantity: -quantity, type: 'export' });
                }
            }
        } else if (nextStatus === 'cancelled') {
            const outstanding = new Map();
            orderMovements.forEach(function (movement) {
                if (movement.movement_type !== 'export' && movement.movement_type !== 'cancel_return') return;
                const productId = Number(movement.product_id);
                outstanding.set(productId, (outstanding.get(productId) || 0) - Number(movement.quantity));
            });
            for (const [productId, quantity] of outstanding) {
                if (!Number.isSafeInteger(quantity) || quantity < 0) return { ok: false, error: 'Số lượng hoàn kho không hợp lệ.' };
                const product = findById(products, productId);
                if (quantity > 0 && !product) return { ok: false, error: 'Có sản phẩm trong đơn hàng không còn tồn tại.' };
                if (quantity > 0) stockChanges.push({ product: product, quantity: quantity, type: 'cancel_return' });
            }
        }
        stockChanges.forEach(function (change) {
            change.product.stock_qty = Number(change.product.stock_qty || 0) + change.quantity;
            movements.push({
                id: movements.reduce(function (max, movement) { return Math.max(max, Number(movement.id) || 0); }, 0) + 1,
                product_id: change.product.id, movement_date: new Date().toLocaleDateString('en-CA'),
                movement_type: change.type, quantity: change.quantity, ref_type: 'order', ref_id: order.id
            });
        });
        order.status = nextStatus;
        order.updated_at = nowString();
        saveDB(db);
        createNotification(order.customer_id, nextStatus, order.id);
        global.dispatchEvent(new CustomEvent('modelshop:orders-updated'));
        return { ok: true };
    }

    function cancelOrder(id) {
        if (!getOrderById(id)) return { ok: false, error: 'Đơn hàng này không thể hủy.' };
        return changeOrderStatus(id, 'cancelled');
    }

    function updateOrderStatus(id, nextStatus) {
        if (!getOrderById(id)) return { ok: false, error: 'Đơn hàng không hợp lệ.' };
        return changeOrderStatus(id, nextStatus);
    }

    global.addEventListener('storage', function (event) {
        if (event.key !== DB_KEY && event.key !== null) return;
        cache = null;
        cacheRaw = null;
        loadDB();
        global.dispatchEvent(new CustomEvent('modelshop:db-updated'));
        global.dispatchEvent(new CustomEvent('modelshop:notifications'));
        global.dispatchEvent(new CustomEvent('modelshop:orders-updated'));
    });

    // Công khai API dùng chung cho giao diện
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
        getProfitPercent: getProfitPercent,
        parseProfitPercent: parseProfitPercent,
        validatePassword: validatePassword,
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
        loginAdmin: loginAdmin,
        logoutCustomer: logoutCustomer,
        logoutAdmin: logoutAdmin,
        getCurrentUser: getCurrentUser,
        getCurrentAdmin: getCurrentAdmin,
        updateProfile: updateProfile,
        changePassword: changePassword,
        normalizeStatus: normalizeStatus,
        createNotification: createNotification,
        getMyNotifications: getMyNotifications,
        getUnreadCount: getUnreadCount,
        cleanupNotifications: cleanupNotifications,
        markRead: markRead,
        markAllRead: markAllRead,
        getMyOrders: getMyOrders,
        getOrderById: getOrderById,
        cancelOrder: cancelOrder,
        changeOrderStatus: changeOrderStatus,
        updateOrderStatus: updateOrderStatus,
        getOrderCode: getOrderCode,
        getAllUsers: getAllUsers,
        getUserById: getUserById,
        filterUsers: filterUsers,
        addCustomer: addCustomer,
        resetCustomerPassword: resetCustomerPassword,
        toggleLockCustomer: toggleLockCustomer,
        deleteCustomer: deleteCustomer,
        restoreCustomer: restoreCustomer,
        getAllCategories: getAllCategories,
        getAllProducts: getAllProducts,
        getAllCategoryIgnoreHidden: getAllCategoryIgnoreHidden,
        getProductByIdIgnoreHidden: getProductByIdIgnoreHidden,
        getProductDisplayStatus: getProductDisplayStatus,
        filterCategories: filterCategories,
        filterProducts: filterProducts,
        addCategory: addCategory,
        addProduct: addProduct,
        updateCategory: updateCategory,
        updateProduct: updateProduct,
        toggleHideCategory: toggleHideCategory,
        toggleHideProduct: toggleHideProduct,
        deleteCategory: deleteCategory,
        restoreCategory: restoreCategory,
        deleteProduct: deleteProduct,
        restoreProduct: restoreProduct
    };

    // Ảnh tải lên được lưu riêng để dữ liệu sản phẩm trong localStorage luôn gọn.
    if (typeof indexedDB !== 'undefined' && typeof document !== 'undefined') {
        const imageUrls = new Map();
        let imageDatabase;
        function openImageDatabase() {
            if (!imageDatabase) imageDatabase = new Promise(function (resolve, reject) {
                const request = indexedDB.open('model_shop_images_v1', 1);
                request.onupgradeneeded = function () { request.result.createObjectStore('images'); };
                request.onsuccess = function () { resolve(request.result); };
                request.onerror = function () { reject(request.error); };
            });
            return imageDatabase;
        }
        async function imageTransaction(mode, action) {
            const db = await openImageDatabase();
            return new Promise(function (resolve, reject) {
                const transaction = db.transaction('images', mode);
                const request = action(transaction.objectStore('images'));
                transaction.oncomplete = function () { resolve(request.result); };
                transaction.onerror = function () { reject(transaction.error); };
                transaction.onabort = function () { reject(transaction.error); };
            });
        }
        async function putImage(blob) {
            const ref = 'idb:' + crypto.randomUUID();
            await imageTransaction('readwrite', function (store) { return store.put(blob, ref); });
            return ref;
        }
        async function getImageUrl(ref) {
            if (!ref || !ref.startsWith('idb:')) return ref || '';
            if (imageUrls.has(ref)) return imageUrls.get(ref);
            const pending = imageTransaction('readonly', function (store) { return store.get(ref); }).then(function (blob) {
                return blob ? URL.createObjectURL(blob) : '';
            }).catch(function (error) {
                imageUrls.delete(ref);
                throw error;
            });
            imageUrls.set(ref, pending);
            return pending;
        }
        async function removeImage(ref) {
            if (!ref || !ref.startsWith('idb:')) return;
            await imageTransaction('readwrite', function (store) { return store.delete(ref); });
            if (imageUrls.has(ref)) URL.revokeObjectURL(await imageUrls.get(ref));
            imageUrls.delete(ref);
        }
        function resolveImage(element) {
            const ref = element.dataset.imageRef || element.getAttribute('src');
            if (!ref || !ref.startsWith('idb:')) return;
            getImageUrl(ref).then(function (url) {
                if ((element.dataset.imageRef || element.getAttribute('src')) === ref && element.getAttribute('src') !== url) element.src = url || '';
            }).catch(function () {
                if ((element.dataset.imageRef || element.getAttribute('src')) === ref) {
                    delete element.dataset.imageRef;
                    element.removeAttribute('src');
                }
            });
        }
        function scanImages(node) {
            if (node.nodeType !== 1) return;
            if (node.matches('img')) resolveImage(node);
            node.querySelectorAll('img[data-image-ref], img[src^="idb:"]').forEach(resolveImage);
        }
        function startImageObserver() {
            scanImages(document.body);
            new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === 'attributes') resolveImage(mutation.target);
                    mutation.addedNodes.forEach(scanImages);
                });
            }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'data-image-ref'] });
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startImageObserver);
        else startImageObserver();
        global.ShopImages = {
            put: putImage, url: getImageUrl, remove: removeImage,
            attrs: function (src) {
                return src && src.startsWith('idb:')
                    ? 'data-image-ref="' + escapeHtml(src) + '"'
                    : 'src="' + escapeHtml(src || '') + '"';
            }
        };
    }
})(window);
