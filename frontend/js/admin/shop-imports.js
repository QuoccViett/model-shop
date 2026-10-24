/* =====================================================================
   shop-imports.js - NGHIỆP VỤ PHIẾU NHẬP HÀNG (mở rộng đối tượng Shop)

   - Phải nạp SAU js/common.js (vì dùng Shop.loadDB / Shop.saveDB ...).
   - Viết ở file riêng để không phải sửa common.js dùng chung cả nhóm.

   Quy tắc (theo README):
     * Phiếu có 2 trạng thái: draft (nháp) và completed (đã hoàn thành).
     * Chỉ sửa / xóa được phiếu nháp.
     * Hoàn thành phiếu: cộng tồn kho, tính lại giá vốn bình quân gia quyền,
       ghi thêm dòng vào sổ kho (stock_movements).
         giá vốn mới = (tồn cũ x giá vốn cũ + SL nhập x giá nhập) / (tồn cũ + SL nhập)
   ===================================================================== */
(function (global) {
    'use strict';

    const Shop = global.Shop;
    if (!Shop) {
        console.error('shop-imports.js phải được nạp sau common.js');
        return;
    }

    // Lấy DB và đảm bảo 3 bảng liên quan luôn tồn tại
    function getDB() {
        const db = Shop.loadDB();
        if (!db.import_receipts) db.import_receipts = [];
        if (!db.import_receipt_items) db.import_receipt_items = [];
        if (!db.stock_movements) db.stock_movements = [];
        return db;
    }

    function nextId(list) {
        return list.reduce(function (max, x) { return Math.max(max, x.id); }, 0) + 1;
    }

    // Mã phiếu hiển thị: PN0001, PN0002...
    function getReceiptCode(id) {
        return 'PN' + String(id).padStart(4, '0');
    }

    function getAllReceipts() {
        return getDB().import_receipts;
    }

    function getReceiptById(id) {
        return getDB().import_receipts.find(function (r) { return r.id == id; });
    }

    function getReceiptItems(receiptId) {
        return getDB().import_receipt_items.filter(function (i) { return i.receipt_id == receiptId; });
    }

    function getReceiptTotal(receiptId) {
        return getReceiptItems(receiptId).reduce(function (sum, i) {
            return sum + Number(i.quantity) * Number(i.import_price);
        }, 0);
    }

    // Hiển thị và tìm phiếu: theo từ khóa (mã phiếu, ghi chú, mã / tên sản phẩm),
    // khoảng ngày nhập và tình trạng. Phiếu mới nhất xếp trước.
    function filterReceipts(opts) {
        opts = opts || {};
        const db = getDB();
        const keyword = Shop.normalize(String(opts.keyword || '').trim());
        const status = opts.status || 'all';
        const from = opts.from || '';
        const to = opts.to || '';

        return db.import_receipts.filter(function (r) {
            if (status !== 'all' && r.status !== status) return false;
            if (from && r.import_date < from) return false;
            if (to && r.import_date > to) return false;
            if (keyword) {
                let text = getReceiptCode(r.id) + ' ' + (r.note || '');
                db.import_receipt_items.forEach(function (i) {
                    if (i.receipt_id !== r.id) return;
                    const p = Shop.findById(db.products, i.product_id);
                    if (p) text += ' ' + p.code + ' ' + p.name;
                });
                if (Shop.normalize(text).indexOf(keyword) === -1) return false;
            }
            return true;
        }).sort(function (a, b) { return b.id - a.id; });
    }

    // Kiểm tra dữ liệu phiếu; trả về chuỗi lỗi hoặc null nếu hợp lệ
    function validateReceipt(data) {
        if (!data || !data.import_date) return 'Vui lòng chọn ngày nhập!';
        if (!Array.isArray(data.items) || data.items.length === 0) {
            return 'Phiếu nhập phải có ít nhất 1 sản phẩm!';
        }
        const seen = {};
        for (let k = 0; k < data.items.length; k++) {
            const it = data.items[k];
            const line = 'Dòng ' + (k + 1) + ': ';
            if (!it.product_id) return line + 'vui lòng chọn sản phẩm!';
            if (!Shop.getProductByIdIgnoreHidden(it.product_id)) return line + 'sản phẩm không tồn tại!';
            if (seen[it.product_id]) return line + 'sản phẩm bị trùng, hãy gộp vào một dòng!';
            seen[it.product_id] = true;

            const qty = Number(it.quantity);
            const price = Number(it.import_price);
            if (!Number.isInteger(qty) || qty <= 0) return line + 'số lượng phải là số nguyên lớn hơn 0!';
            if (!Number.isFinite(price) || price <= 0) return line + 'giá nhập phải lớn hơn 0!';
        }
        return null;
    }

    function writeItems(db, receiptId, items) {
        let id = nextId(db.import_receipt_items);
        items.forEach(function (it) {
            db.import_receipt_items.push({
                id: id++,
                receipt_id: receiptId,
                product_id: Number(it.product_id),
                quantity: Number(it.quantity),
                import_price: Number(it.import_price)
            });
        });
    }

    // Thêm phiếu nhập mới (luôn ở trạng thái nháp)
    function addReceipt(data) {
        const err = validateReceipt(data);
        if (err) return { success: false, message: err };

        const db = getDB();
        const receipt = {
            id: nextId(db.import_receipts),
            import_date: data.import_date,
            status: 'draft',
            note: String(data.note || '').trim(),
            created_at: Shop.nowString(),
            completed_at: null
        };
        db.import_receipts.push(receipt);
        writeItems(db, receipt.id, data.items);
        Shop.saveDB(db);
        return { success: true, message: 'Đã thêm phiếu ' + getReceiptCode(receipt.id) + '!', data: receipt };
    }

    // Sửa phiếu: chỉ khi còn là nháp
    function updateReceipt(id, data) {
        const db = getDB();
        const receipt = db.import_receipts.find(function (r) { return r.id == id; });
        if (!receipt) return { success: false, message: 'Không tìm thấy phiếu nhập!' };
        if (receipt.status !== 'draft') {
            return { success: false, message: 'Phiếu đã hoàn thành, không thể sửa!' };
        }
        const err = validateReceipt(data);
        if (err) return { success: false, message: err };

        receipt.import_date = data.import_date;
        receipt.note = String(data.note || '').trim();
        db.import_receipt_items = db.import_receipt_items.filter(function (i) { return i.receipt_id !== receipt.id; });
        writeItems(db, receipt.id, data.items);
        Shop.saveDB(db);
        return { success: true, message: 'Đã cập nhật phiếu ' + getReceiptCode(receipt.id) + '!', data: receipt };
    }

    // Xóa phiếu: chỉ khi còn là nháp
    function deleteReceipt(id) {
        const db = getDB();
        const receipt = db.import_receipts.find(function (r) { return r.id == id; });
        if (!receipt) return { success: false, message: 'Không tìm thấy phiếu nhập!' };
        if (receipt.status !== 'draft') {
            return { success: false, message: 'Phiếu đã hoàn thành, không thể xóa!' };
        }
        db.import_receipts = db.import_receipts.filter(function (r) { return r.id !== receipt.id; });
        db.import_receipt_items = db.import_receipt_items.filter(function (i) { return i.receipt_id !== receipt.id; });
        Shop.saveDB(db);
        return { success: true, message: 'Đã xóa phiếu ' + getReceiptCode(receipt.id) + '!' };
    }

    // Hoàn thành phiếu: cộng tồn, tính giá vốn bình quân, ghi sổ kho
    function completeReceipt(id) {
        const db = getDB();
        const receipt = db.import_receipts.find(function (r) { return r.id == id; });
        if (!receipt) return { success: false, message: 'Không tìm thấy phiếu nhập!' };
        if (receipt.status !== 'draft') {
            return { success: false, message: 'Phiếu này đã hoàn thành trước đó!' };
        }

        const items = db.import_receipt_items.filter(function (i) { return i.receipt_id === receipt.id; });
        if (items.length === 0) return { success: false, message: 'Phiếu chưa có sản phẩm nào!' };

        // Kiểm tra hết trước khi thay đổi bất cứ thứ gì
        for (let k = 0; k < items.length; k++) {
            if (!Shop.findById(db.products, items[k].product_id)) {
                return { success: false, message: 'Có sản phẩm trong phiếu không còn tồn tại!' };
            }
        }

        let moveId = nextId(db.stock_movements);
        items.forEach(function (it) {
            const p = Shop.findById(db.products, it.product_id);
            const oldStock = Number(p.stock_qty || 0);
            const oldCost = Number(p.cost_price || 0);
            const newStock = oldStock + it.quantity;

            p.cost_price = Math.round((oldStock * oldCost + it.quantity * it.import_price) / newStock);
            p.stock_qty = newStock;

            db.stock_movements.push({
                id: moveId++,
                product_id: p.id,
                movement_date: receipt.import_date,
                movement_type: 'import',
                quantity: it.quantity,
                ref_type: 'import_receipt',
                ref_id: receipt.id
            });
        });

        receipt.status = 'completed';
        receipt.completed_at = Shop.nowString();
        Shop.saveDB(db);
        return { success: true, message: 'Đã hoàn thành phiếu ' + getReceiptCode(receipt.id) + ', tồn kho và giá vốn đã được cập nhật!' };
    }

    Object.assign(Shop, {
        getReceiptCode: getReceiptCode,
        getAllReceipts: getAllReceipts,
        getReceiptById: getReceiptById,
        getReceiptItems: getReceiptItems,
        getReceiptTotal: getReceiptTotal,
        filterReceipts: filterReceipts,
        addReceipt: addReceipt,
        updateReceipt: updateReceipt,
        deleteReceipt: deleteReceipt,
        completeReceipt: completeReceipt
    });
})(window);
