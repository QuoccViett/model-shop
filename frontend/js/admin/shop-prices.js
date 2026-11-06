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
        return Shop.getProfitPercent(p);
    }

    // Tính giá bán từ giá vốn và %LN; chưa có giá vốn thì trả về 0
    function priceFromCost(cost, profit) {
        return Shop.getPrice({ cost_price: cost, profit_percent: profit });
    }

    function calcSellPrice(p) {
        return Shop.getPrice(p);
    }

    // Kiểm tra và chuẩn hóa ô nhập %LN
    // allowBlank = true: để trống nghĩa là "theo loại" (chỉ dùng cho sản phẩm)
    function parsePercent(value, allowBlank) {
        return Shop.parseProfitPercent(value, allowBlank);
    }

    // Đặt %LN cho một loại
    function setCategoryProfit(id, value) {
        const parsed = parsePercent(value, false);
        if (!parsed.ok) return { success: false, message: parsed.message };

        const db = getDB();
        const cat = Shop.findById(db.categories, id);
        if (!cat) return { success: false, message: 'Không tìm thấy loại sản phẩm!' };
        if (cat.is_deleted) return { success: false, message: 'Hãy khôi phục loại sản phẩm trước khi sửa giá.' };

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
        if (p.is_deleted) return { success: false, message: 'Hãy khôi phục sản phẩm trước khi sửa giá.' };
        const category = Shop.findById(db.categories, p.category_id);
        if (!category || category.is_deleted) return { success: false, message: 'Hãy khôi phục loại sản phẩm trước khi sửa giá.' };

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
        const db = getDB();
        return db.products.filter(function (p) {
            const category = Shop.findById(db.categories, p.category_id);
            if (p.is_deleted || !category || category.is_deleted) return false;
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
