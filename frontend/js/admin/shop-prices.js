/*
   shop-prices.js - NGHIỆP VỤ GIÁ BÁN / % LỢI NHUẬN
   -Phải nạp SAU js/common.js.
   -Viết ở file riêng để không phải sửa common.js dùng chung cả nhóm.
   Quy tắc (theo README):
     giá bán = giá vốn x (1 + %LN / 100), làm tròn đến nghìn
     %LN đặt theo loại (mặc định cho mọi sản phẩm trong loại)
     và có thể đặt riêng theo sản phẩm.
     Ưu tiên: %LN của sản phẩm > %LN của loại.
     Sản phẩm chưa có giá vốn (chưa nhập hàng) thì chưa có giá bán.
 */
(function (global) {
    'use strict';

    const Shop = global.Shop;
    if (!Shop) {
        console.error('shop-prices.js phải được nạp sau common.js');
        return;
    }

    const MAX_PERCENT = 1000;

    function getDB() {
        const db = Shop.loadDB();
        if (!db.categories) db.categories = [];
        if (!db.products) db.products = [];
        return db;
    }

    function isBlank(v) {
        return v === null || v === undefined || String(v).trim() === '';
    }

    // %LN của loại (chưa đặt thì coi là 0)
    function getCategoryProfit(cat) {
        return cat && !isBlank(cat.profit_percent) ? Number(cat.profit_percent) : 0;
    }

    // %LN riêng của sản phẩm: số, hoặc null nếu chưa đặt (theo loại)
    function getProductOwnProfit(p) {
        return isBlank(p.profit_percent) ? null : Number(p.profit_percent);
    }

    // %LN đang áp dụng: ưu tiên của sản phẩm, không có thì lấy của loại
    function getAppliedProfit(p) {
        const own = getProductOwnProfit(p);
        if (own !== null) return own;
        return getCategoryProfit(Shop.findById(getDB().categories, p.category_id));
    }

    // Tính giá bán từ giá vốn và %LN; chưa có giá vốn thì trả về 0
    function priceFromCost(cost, profit) {
        cost = Number(cost || 0);
        if (!(cost > 0)) return 0;
        return Math.round((cost * (1 + Number(profit || 0) / 100)) / 1000) * 1000;
    }

    function calcSellPrice(p) {
        return priceFromCost(p.cost_price, getAppliedProfit(p));
    }

    // Kiểm tra và chuẩn hóa ô nhập %LN
    // allowBlank = true: để trống nghĩa là "theo loại" (chỉ dùng cho sản phẩm)
    function parsePercent(value, allowBlank) {
        if (isBlank(value)) {
            return allowBlank
                ? { ok: true, value: null }
                : { ok: false, message: 'Vui lòng nhập % lợi nhuận!' };
        }
        const n = Number(String(value).trim().replace(',', '.'));
        if (!Number.isFinite(n)) return { ok: false, message: '% lợi nhuận phải là số!' };
        if (n < 0) return { ok: false, message: '% lợi nhuận không được âm!' };
        if (n > MAX_PERCENT) return { ok: false, message: '% lợi nhuận không được vượt quá ' + MAX_PERCENT + '%!' };
        return { ok: true, value: Math.round(n * 100) / 100 };
    }

    // Đặt %LN cho một loại
    function setCategoryProfit(id, value) {
        const parsed = parsePercent(value, false);
        if (!parsed.ok) return { success: false, message: parsed.message };

        const db = getDB();
        const cat = Shop.findById(db.categories, id);
        if (!cat) return { success: false, message: 'Không tìm thấy loại sản phẩm!' };

        cat.profit_percent = parsed.value;
        Shop.saveDB(db);
        return { success: true, message: 'Đã lưu % lợi nhuận của loại "' + cat.name + '": ' + parsed.value + '%', data: cat };
    }

    // Đặt %LN riêng cho một sản phẩm (để trống = bỏ %LN riêng, dùng % của loại)
    function setProductProfit(id, value) {
        const parsed = parsePercent(value, true);
        if (!parsed.ok) return { success: false, message: parsed.message };

        const db = getDB();
        const p = Shop.findById(db.products, id);
        if (!p) return { success: false, message: 'Không tìm thấy sản phẩm!' };

        p.profit_percent = parsed.value;
        Shop.saveDB(db);
        const msg = parsed.value === null
            ? 'Đã bỏ % riêng của "' + p.code + '", dùng % của loại.'
            : 'Đã lưu % lợi nhuận của "' + p.code + '": ' + parsed.value + '%';
        return { success: true, message: msg, data: p };
    }

    // Tra cứu sản phẩm để xem giá: theo từ khóa (mã, tên, không phân biệt dấu) và loại
    function searchPriceProducts(opts) {
        opts = opts || {};
        const keyword = Shop.normalize(String(opts.keyword || '').trim());
        const cat = opts.category_id;
        return getDB().products.filter(function (p) {
            if (!isBlank(cat) && cat !== 'all' && Number(p.category_id) !== Number(cat)) return false;
            if (keyword && Shop.normalize((p.code || '') + ' ' + (p.name || '')).indexOf(keyword) === -1) return false;
            return true;
        }).sort(function (a, b) {
            return String(a.code).localeCompare(String(b.code));
        });
    }

    Object.assign(Shop, {
        getCategoryProfit: getCategoryProfit,
        getProductOwnProfit: getProductOwnProfit,
        getAppliedProfit: getAppliedProfit,
        priceFromCost: priceFromCost,
        calcSellPrice: calcSellPrice,
        parsePercent: parsePercent,
        setCategoryProfit: setCategoryProfit,
        setProductProfit: setProductProfit,
        searchPriceProducts: searchPriceProducts
    });
})(window);
