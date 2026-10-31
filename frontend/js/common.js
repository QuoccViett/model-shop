(function (global) {
    'use strict';

    const DB_KEY = 'model_shop_db_v1';
    const PAGE_SIZE = 8;
    const NOTIFICATION_TTL_MS = 12 * 60 * 60 * 1000;
    let cache = null;

    function parseDateValue(value) {
        const text = String(value || '');
        const parsed = new Date(text.indexOf('T') >= 0 ? text : text.replace(' ', 'T'));
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    function cleanupNotifications(db) {
        if (!db || !Array.isArray(db.notifications)) return false;
        const cutoff = Date.now() - NOTIFICATION_TTL_MS;
        const before = db.notifications.length;
        db.notifications = db.notifications.filter(function (notification) {
            const createdAt = parseDateValue(notification.created_at);
            return !createdAt || createdAt.getTime() > cutoff;
        });
        if (db.notifications.length !== before) {
            saveDB(db);
            return true;
        }
        return false;
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
        cache = db;
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    function loadDB() {
        if (cache) {
            cleanupNotifications(cache);
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

    // Tìm kiếm và lọc loại sản phẩm
    function filterCategories({keyword = '', status = 'all'} = {}){
        let categories = getAllCategories();

        // lọc theo trạng thái ẩn/ không bị ẩn
        if (status === 'active') {
            categories = categories.filter(c => !c.is_hidden);
        } else if (status === 'hidden') {
            categories = categories.filter(c => c.is_hidden);
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

        // lọc theo danh mục
        if (category_id !== 'all' && category_id !== '' && category_id !== null && category_id !== undefined) {
            products = products.filter(p => Number(p.category_id) === Number(category_id));
        }

        // lọc theo trạng thái ẩn/ không bị ẩn
        if (status === 'active') {
            products = products.filter(c => !c.is_hidden);
        } else if (status === 'hidden') {
            products = products.filter(c => c.is_hidden);
        }

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
            profit_percent: d.profit_percent || '',
            is_hidden: false
        };

        db.categories.push(newCategory);
        saveDB(db); // Lưu vào cache và localStorage tự động

        return { success: true, message: 'Thêm danh mục mới thành công!', data: newCategory };
    }

    // Thêm sản phẩm mới
    function addProduct(newProductData) {
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
            low_stock_threshold: String(newProductData.low_stock_threshold || '').trim(),
            sale_percent: String(newProductData.sale_percent || '').trim(),
        };

        const db = loadDB();
        if (!db.products) db.products = [];

        // Tự sinh ID kế tiếp tăng dần
        const nextId = db.products.reduce(function (max, c) { return Math.max(max, c.id); }, 0) + 1;

        const newProduct = {
            id: nextId,
            category_id: d.category_id,
            code: d.code,
            name: d.name,
            image: d.image,
            description: d.description || '',
            brand: d.brand,
            scale: d.scale,
            material: d.material,
            size: d.size,
            profit_percent: d.profit_percent,
            cost_price: d.cost_price,
            stock_qty: d.stock_qty,
            low_stock_threshold: d.low_stock_threshold,
            is_hidden: false,
            sale_percent: d.sale_percent
        };

        db.products.push(newProduct);
        saveDB(db); // Lưu vào cache và localStorage tự động

        return { success: true, message: 'Thêm sản phẩm mới thành công!', data: newProduct };
    }

    // Cập nhật loại sản phẩm
    function updateCategory(id, categoryData) {
        const db = loadDB();
        if (!db.categories) return { success: false, message: 'Không tìm thấy dữ liệu loại sản phẩm!' };

        const index = db.categories.findIndex(c => c.id == id);
        if (index === -1) return { success: false, message: 'Không tìm thấy loại sản phẩm cần sửa!' };

        db.categories[index] = {
            ...db.categories[index],
            name: String(categoryData.name || '').trim(),
            description: String(categoryData.description || '').trim(),
            profit_percent: categoryData.profit_percent !== '' ? Number(categoryData.profit_percent) : null
        };

        saveDB(db);
        return { success: true, message: 'Cập nhật loại sản phẩm thành công!', data: db.categories[index] };
    }

    // Toggle ẩn/hiện loại sản phẩm
    function toggleHideCategory(id) {
        const db = loadDB();
        if (!db.categories) return { success: false };

        const cat = db.categories.find(c => c.id == id);
        if (cat) {
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

        // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
        const hasProducts = db.products && db.products.some(p => p.category_id == id);
        if (hasProducts) {
            return { success: false, message: 'Không thể xóa danh mục đang chứa sản phẩm bên trong!' };
        }

        const initialLength = db.categories.length;
        db.categories = db.categories.filter(c => c.id != id);

        if (db.categories.length < initialLength) {
            saveDB(db);
            return { success: true, message: 'Xóa danh mục thành công!' };
        }
        return { success: false, message: 'Không tìm thấy danh mục để xóa!' };
    }

    // Cập nhật sản phẩm
    function updateProduct(id, productData) {
        const db = loadDB();
        if (!db.products) return { success: false, message: 'Không tìm thấy dữ liệu sản phẩm!' };

        const index = db.products.findIndex(p => p.id == id);
        if (index === -1) return { success: false, message: 'Không tìm thấy sản phẩm cần sửa!' };

        db.products[index] = {
            ...db.products[index],
            category_id: Number(productData.category_id),
            code: String(productData.code || '').trim(),
            name: String(productData.name || '').trim(),
            image: String(productData.image || '').trim(),
            description: String(productData.description || '').trim(),
            brand: String(productData.brand || '').trim(),
            scale: String(productData.scale || '').trim(),
            material: String(productData.material || '').trim(),
            size: String(productData.size || '').trim(),
            profit_percent: productData.profit_percent !== '' ? Number(productData.profit_percent) : null,
            cost_price: Number(productData.cost_price || 0),
            stock_qty: Number(productData.stock_qty || 0),
            low_stock_threshold: Number(productData.low_stock_threshold || 5),
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
        if (prod) {
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

        const initialLength = db.products.length;
        db.products = db.products.filter(p => p.id != id);

        if (db.products.length < initialLength) {
            saveDB(db);
            return { success: true, message: 'Xóa sản phẩm thành công!' };
        }
        return { success: false, message: 'Không tìm thấy sản phẩm để xóa!' };
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
        if (!user || user.is_locked) {
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
            customers = customers.filter(c => !c.is_locked);
        } else if (status === 'locked') {
            customers = customers.filter(c => c.is_locked);
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
            address_detail: null,
            ward: null,
            district: null,
            city: null,
            is_locked: false,
            created_at: nowString()
        };

        db.customers.push(newCustomer);
        saveDB(db); // Lưu vào cache và localStorage tự động

        return { success: true, message: 'Thêm khách hàng thành công!', data: newCustomer };
    }

    function resetCustomerPassword(id, newPassword) {
        if (!newPassword || newPassword.trim() === '') {
            return { success: false, message: 'Mật khẩu mới không được để trống!' };
        }

        const db = loadDB();
        if (!db.customers) db.customers = [];
        const customer = db.customers.find(c => String(c.id) === String(id));

        if (!customer) {
            return { success: false, message: 'Không tìm thấy người dùng!' };
        }

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
        if (!db.customers) db.customers = [];
        const index = db.customers.findIndex(c => String(c.id) === String(id));

        if (index === -1) {
            return { success: false, message: 'Không tìm thấy người dùng!' };
        }

        const deletedUser = db.customers.splice(index, 1)[0];
        saveDB(db);

        return { success: true, message: `Đã xóa người dùng "${deletedUser.username}" thành công!` };
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
        createNotification(user.id, 'profile_updated');
        return { ok: true };
    }

    function changePassword(userId, current, next, confirm) {
        const db = loadDB();
        const user = findById(db.customers, userId);
        if (!user) return { ok: false, error: 'Không tìm thấy tài khoản.' };
        current = String(current || '');
        next = String(next || '');
        confirm = String(confirm || '');
        if (user.password !== current) return { ok: false, error: 'Mật khẩu hiện tại không đúng.' };
        if (next.length < 6) return { ok: false, error: 'Mật khẩu mới tối thiểu 6 ký tự.' };
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

    function createNotification(customerId, type, orderId) {
        const db = loadDB();
        if (!db.notifications) db.notifications = [];
        const item = {
            id: db.notifications.reduce(function (max, n) { return Math.max(max, Number(n.id) || 0); }, 0) + 1,
            customer_id: Number(customerId),
            type: global.ORDER_STATUS && global.ORDER_STATUS.notifications && global.ORDER_STATUS.notifications[type] ? type : normalizeStatus(type),
            order_id: orderId ? Number(orderId) : null,
            message: notificationMessage(normalizeStatus(type), orderId),
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

    function getMyOrders(statusGroup) {
        const user = getCurrentUser();
        if (!user) return [];
        const db = loadDB();
        return (db.orders || []).filter(function (o) {
            if (Number(o.customer_id) !== Number(user.id)) return false;
            if (!statusGroup || statusGroup === 'all') return true;
            const status = normalizeStatus(o.status);
            return statusGroup === 'processing' ? ['order_created', 'payment_success', 'order_confirmed'].indexOf(status) !== -1 :
                statusGroup === 'shipping' ? status === 'shipping' :
                statusGroup === 'completed' ? status === 'delivered' : statusGroup === 'cancelled' && status === 'cancelled';
        }).sort(function (a, b) { return String(b.order_date).localeCompare(String(a.order_date)); });
    }

    function getOrderById(id) {
        const user = getCurrentUser();
        if (!user) return null;
        const order = findById(loadDB().orders, id);
        return order && Number(order.customer_id) === Number(user.id) ? order : null;
    }

    function cancelOrder(id) {
        const order = getOrderById(id);
        if (!order || !global.ORDER_STATUS || !global.ORDER_STATUS.canCancel(order.status)) {
            return { ok: false, error: 'Đơn hàng này không thể hủy.' };
        }
        const db = loadDB();
        order.status = 'cancelled';
        order.updated_at = nowString();
        saveDB(db);
        createNotification(order.customer_id, 'cancelled', order.id);
        return { ok: true };
    }

    function updateOrderStatus(id, nextStatus) {
        const order = getOrderById(id);
        const next = normalizeStatus(nextStatus);
        if (!order || !global.ORDER_STATUS || global.ORDER_STATUS.flow.indexOf(next) === -1) return { ok: false, error: 'Đơn hàng không hợp lệ.' };
        const expected = global.ORDER_STATUS.next(order.status, order.payment_method);
        if (expected !== next) return { ok: false, error: 'Trạng thái tiếp theo không hợp lệ.' };
        order.status = next;
        order.updated_at = nowString();
        saveDB(loadDB());
        createNotification(order.customer_id, next, order.id);
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
        updateOrderStatus: updateOrderStatus,
        getOrderCode: getOrderCode,
        getAllUsers: getAllUsers,
        getUserById: getUserById,
        filterUsers: filterUsers,
        addCustomer: addCustomer,
        resetCustomerPassword: resetCustomerPassword,
        toggleLockCustomer: toggleLockCustomer,
        deleteCustomer: deleteCustomer,
        getAllCategories: getAllCategories,
        getAllProducts: getAllProducts,
        getAllCategoryIgnoreHidden: getAllCategoryIgnoreHidden,
        getProductByIdIgnoreHidden: getProductByIdIgnoreHidden,
        filterCategories: filterCategories,
        filterProducts: filterProducts,
        addCategory: addCategory,
        addProduct: addProduct,
        updateCategory: updateCategory,
        updateProduct: updateProduct,
        toggleHideCategory: toggleHideCategory,
        toggleHideProduct: toggleHideProduct,
        deleteCategory: deleteCategory,
        deleteProduct: deleteProduct
    };
})(window);
