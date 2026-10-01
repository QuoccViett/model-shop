/* =====================================================================
   data.js - CẤU TRÚC CƠ SỞ DỮ LIỆU + DỮ LIỆU MẪU (CHỈ DỮ LIỆU, KHÔNG CÓ LOGIC)

   - DB_ENUMS : các giá trị trạng thái hợp lệ.
   - DB_SCHEMA: mô tả từng bảng. Thứ tự khai báo cột = thứ tự giá trị trong DB_SEED.
   - DB_SEED  : dữ liệu mẫu, mỗi dòng là một mảng theo đúng thứ tự cột của DB_SCHEMA.

   Dùng ở 2 nơi (một nguồn dữ liệu duy nhất):
     1) frontend/common.js (chế độ Local) -> đổi mảng thành đối tượng, lưu localStorage.
     2) backend/prisma/seed.ts            -> đọc file này để nạp PostgreSQL.

   Nạp bằng <script src="data.js"></script> thường (KHÔNG dùng type="module",
   KHÔNG dùng fetch) để mở bằng file:// vẫn chạy.
   Mật khẩu để chữ thường chỉ vì là dữ liệu mẫu; backend sẽ băm (bcrypt) khi seed.
   Số tiền: VND (số nguyên). Ngày: 'YYYY-MM-DD'; thời điểm: 'YYYY-MM-DD HH:MM'.
   ===================================================================== */
(function (global) {
  'use strict';

  var DB_ENUMS = {
    receipt_status: ['draft', 'completed'],
    order_status: ['new', 'processed', 'delivered', 'cancelled'],
    payment_method: ['cod', 'transfer', 'online'],
    movement_type: ['import', 'export', 'cancel_return']
  };

  var DB_SCHEMA = {
    admins: {
      columns: { id: 'int pk', username: 'string unique', password: 'string', full_name: 'string' }
    },
    customers: {
      columns: {
        id: 'int pk', username: 'string unique', password: 'string', full_name: 'string',
        email: 'string unique', phone: 'string', address_detail: 'string?', ward: 'string?',
        district: 'string?', city: 'string?', is_locked: 'boolean default false', created_at: 'datetime'
      }
    },
    categories: {
      columns: {
        id: 'int pk', name: 'string unique', description: 'text?',
        profit_percent: 'number default 20', is_hidden: 'boolean default false'
      }
    },
    products: {
      columns: {
        id: 'int pk', category_id: 'int fk categories.id', code: 'string unique', name: 'string',
        image: 'string?', description: 'text?', brand: 'string?', scale: 'string?', material: 'string?',
        size: 'string?', profit_percent: 'number? (null = theo loại)', cost_price: 'int default 0',
        stock_qty: 'int default 0', low_stock_threshold: 'int default 5', is_hidden: 'boolean default false'
      }
    },
    import_receipts: {
      columns: {
        id: 'int pk', import_date: 'date', status: 'enum receipt_status default draft',
        note: 'string?', created_at: 'datetime', completed_at: 'datetime?'
      }
    },
    import_receipt_items: {
      columns: {
        id: 'int pk', receipt_id: 'int fk import_receipts.id', product_id: 'int fk products.id',
        quantity: 'int > 0', import_price: 'int >= 0'
      }
    },
    stock_movements: {   // quantity CÓ DẤU: dương = vào kho, âm = ra kho
      columns: {
        id: 'int pk', product_id: 'int fk products.id', movement_date: 'date',
        movement_type: 'enum movement_type', quantity: 'int signed', ref_type: 'string?', ref_id: 'int?'
      }
    },
    orders: {
      columns: {
        id: 'int pk', customer_id: 'int fk customers.id', order_date: 'datetime',
        status: 'enum order_status default new', receiver_name: 'string', receiver_phone: 'string',
        ship_address_detail: 'string', ship_ward: 'string', ship_district: 'string', ship_city: 'string',
        payment_method: 'enum payment_method default cod', total_amount: 'int', updated_at: 'datetime?'
      }
    },
    order_items: {
      columns: {
        id: 'int pk', order_id: 'int fk orders.id', product_id: 'int fk products.id',
        quantity: 'int > 0', unit_price: 'int (giá bán tại thời điểm đặt)'
      }
    }
  };

  var DB_SEED = {
    // [id, username, password, full_name]
    admins: [
      [1, 'admin', 'admin123', 'Quản trị viên']
    ],

    // [id, username, password, full_name, email, phone, address_detail, ward, district, city, is_locked, created_at]
    customers: [
      [1, 'nguyenvana', '123456', 'Nguyễn Văn An', 'an.nguyen@example.com', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', false, '2026-07-20 09:00'],
      [2, 'tranthib', '123456', 'Trần Thị Bích', 'bich.tran@example.com', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', false, '2026-07-25 15:30'],
      [3, 'lehoangc', '123456', 'Lê Hoàng Cường', 'cuong.le@example.com', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', false, '2026-08-02 20:10'],
      [4, 'phamthid', '123456', 'Phạm Thị Dung', 'dung.pham@example.com', '0934567890', '10 Trần Phú', 'Phường 4', 'Quận 5', 'TP. Hồ Chí Minh', true, '2026-08-10 08:45']
    ],

    // [id, name, description, profit_percent, is_hidden]
    categories: [
      [1, 'Gundam', 'Mô hình lắp ráp Gundam các cấp độ HG, RG, MG', 25, false],
      [2, 'Figure Anime', 'Figure, Figma, Nendoroid nhân vật anime', 30, false],
      [3, 'Mô hình xe', 'Xe mô hình đúc hợp kim (diecast)', 20, false],
      [4, 'Mô hình quân sự', 'Tàu, máy bay, xe tăng lắp ráp', 22, false],
      [5, 'Phụ kiện & dụng cụ', 'Kìm cắt, sơn, keo, hộp và đế trưng bày', 35, false],
      [6, 'Hàng ngừng kinh doanh', 'Loại đã ẩn (demo chức năng ẩn loại)', 20, true]
    ],

    // [id, category_id, code, name, image, description, brand, scale, material, size,
    //  profit_percent, cost_price, stock_qty, low_stock_threshold, is_hidden]
    // cost_price và stock_qty khớp với phiếu nhập hoàn thành + đơn đã xử lý/đã giao bên dưới
    products: [
      [1, 1, 'GD001', 'HG RX-78-2 Gundam (Revive)', 'assets/img/products/GD001.jpg', 'Mô hình lắp ráp Gundam đầu tiên, bản Revive với khớp và màu sắc được cải tiến.', 'Bandai', '1/144', 'Nhựa PS', '13 cm', null, 180000, 19, 5, false],
      [2, 1, 'GD002', 'HG Gundam Barbatos', 'assets/img/products/GD002.jpg', 'Gundam Barbatos phong cách chiến đấu hoang dã, nhựa PS không cần keo.', 'Bandai', '1/144', 'Nhựa PS', '13 cm', null, 200000, 15, 5, false],
      [3, 1, 'GD003', 'MG Strike Freedom Gundam', 'assets/img/products/GD003.jpg', 'Strike Freedom Gundam cấp độ MG, bộ giáp chi tiết, cánh Dragoon rời.', 'Bandai', '1/100', 'Nhựa PS', '18 cm', 35, 1100000, 8, 5, false],
      [4, 1, 'GD004', 'RG Nu Gundam', 'assets/img/products/GD004.jpg', 'RG Nu Gundam khung xương Advanced MS Joint, kèm Fin Funnel.', 'Bandai', '1/144', 'Nhựa PS', '13 cm', null, 520000, 9, 5, false],
      [5, 1, 'GD005', 'HG Wing Gundam Zero EW', 'assets/img/products/GD005.jpg', 'Wing Gundam Zero bản Endless Waltz, cánh thiên thần có thể xếp gọn.', 'Bandai', '1/144', 'Nhựa PS', '13 cm', null, 210000, 12, 5, false],
      [6, 1, 'GD006', 'MG Sazabi Ver.Ka', 'assets/img/products/GD006.jpg', 'Sazabi bản Ver.Ka màu đỏ đặc trưng, chi tiết cao cấp.', 'Bandai', '1/100', 'Nhựa PS', '20 cm', null, 1500000, 2, 5, false],
      [7, 2, 'FG001', 'Figure Luffy Gear 5', 'assets/img/products/FG001.jpg', 'Luffy ở trạng thái Gear 5, tư thế chiến đấu sống động.', 'Banpresto', '1/8', 'PVC', '20 cm', null, 650000, 9, 5, false],
      [8, 2, 'FG002', 'Figma Hatsune Miku', 'assets/img/products/FG002.jpg', 'Figma Hatsune Miku có khớp linh hoạt, kèm nhiều phụ kiện và biểu cảm.', 'Max Factory', '1/12', 'PVC', '14 cm', 40, 900000, 8, 5, false],
      [9, 2, 'FG003', 'Nendoroid Rem', 'assets/img/products/FG003.jpg', 'Nendoroid Rem phong cách chibi dễ thương, kèm mặt thay thế.', 'Good Smile Company', 'Chibi', 'PVC/ABS', '10 cm', null, 1100000, 2, 5, false],
      [10, 2, 'FG004', 'Figure Goku Ultra Instinct', 'assets/img/products/FG004.jpg', 'Goku Ultra Instinct tạo dáng chiến đấu, hiệu ứng khí bao quanh.', 'Banpresto', '1/8', 'PVC', '22 cm', null, 480000, 12, 5, false],
      [11, 2, 'FG005', 'Figure Zoro Wano', 'assets/img/products/FG005.jpg', 'Zoro bản Wano với ba thanh kiếm, tạo hình mạnh mẽ.', 'Banpresto', '1/8', 'PVC', '21 cm', null, 520000, 10, 5, false],
      [12, 2, 'FG006', 'Figure Naruto Sage Mode', 'assets/img/products/FG006.jpg', 'Naruto Sage Mode với đôi mắt đặc trưng và tư thế kết ấn.', 'Banpresto', '1/8', 'PVC', '20 cm', null, 500000, 9, 5, false],
      [13, 3, 'XE001', 'Ferrari 488 GTB', 'assets/img/products/XE001.jpg', 'Ferrari 488 GTB đúc hợp kim, cửa và nắp capo mở được.', 'Bburago', '1/24', 'Hợp kim', '19 cm', null, 350000, 9, 5, false],
      [14, 3, 'XE002', 'Lamborghini Aventador', 'assets/img/products/XE002.jpg', 'Lamborghini Aventador màu cam, chi tiết nội thất đầy đủ.', 'Maisto', '1/24', 'Hợp kim', '20 cm', null, 340000, 10, 5, false],
      [15, 3, 'XE003', 'Porsche 911 GT3 RS', 'assets/img/products/XE003.jpg', 'Porsche 911 GT3 RS tỉ lệ lớn, sơn bóng, cửa và cốp mở được.', 'Minichamps', '1/18', 'Hợp kim', '25 cm', 25, 1200000, 4, 5, false],
      [16, 3, 'XE004', 'Toyota Supra MK4', 'assets/img/products/XE004.jpg', 'Toyota Supra MK4 huyền thoại, mô hình nhỏ gọn dễ trưng bày.', 'Jada', '1/32', 'Hợp kim', '14 cm', null, 280000, 12, 5, false],
      [17, 3, 'XE005', 'Nissan GT-R R35', 'assets/img/products/XE005.jpg', 'Nissan GT-R R35 ngoại hình hầm hố, bánh xe quay được.', 'Maisto', '1/24', 'Hợp kim', '19 cm', null, 360000, 8, 5, false],
      [18, 3, 'XE006', 'Ford Mustang GT', 'assets/img/products/XE006.jpg', 'Ford Mustang GT phong cách muscle car Mỹ, sơn bóng.', 'Bburago', '1/24', 'Hợp kim', '20 cm', null, 330000, 9, 5, false],
      [19, 4, 'KT001', 'Thiết giáp hạm Yamato', 'assets/img/products/KT001.jpg', 'Thiết giáp hạm Yamato lắp ráp tỉ lệ 1/700, chi tiết boong tàu.', 'Tamiya', '1/700', 'Nhựa PS', '38 cm', null, 850000, 6, 5, false],
      [20, 4, 'KT002', 'Máy bay Mitsubishi Zero A6M', 'assets/img/products/KT002.jpg', 'Máy bay chiến đấu Zero A6M của Nhật, kèm decal đầy đủ.', 'Tamiya', '1/48', 'Nhựa PS', '24 cm', null, 420000, 10, 5, false],
      [21, 4, 'KT003', 'Xe tăng Tiger I', 'assets/img/products/KT003.jpg', 'Xe tăng Tiger I của Đức, xích lắp ráp chi tiết.', 'Tamiya', '1/35', 'Nhựa PS', '25 cm', null, 450000, 8, 5, false],
      [22, 4, 'KT004', 'Tàu Titanic', 'assets/img/products/KT004.jpg', 'Tàu Titanic lắp ráp tỉ lệ 1/700, dành cho người sưu tầm.', 'Revell', '1/700', 'Nhựa PS', '38 cm', null, 600000, 7, 5, false],
      [23, 4, 'KT005', 'Máy bay F-16C', 'assets/img/products/KT005.jpg', 'Máy bay tiêm kích F-16C, kèm giá đỡ và decal.', 'Hasegawa', '1/72', 'Nhựa PS', '21 cm', null, 300000, 9, 5, false],
      [24, 4, 'KT006', 'Xe tăng M1A2 Abrams', 'assets/img/products/KT006.jpg', 'Xe tăng chủ lực M1A2 Abrams, tháp pháo xoay được.', 'Dragon', '1/35', 'Nhựa PS', '28 cm', null, 900000, 5, 5, false],
      [25, 5, 'PK001', 'Kìm cắt nhựa chuyên dụng', 'assets/img/products/PK001.jpg', 'Kìm cắt nhựa lưỡi mỏng, cắt sát và ít để lại vết.', 'GodHand', null, 'Thép', '14 cm', null, 120000, 29, 5, false],
      [26, 5, 'PK002', 'Bộ bút sơn Gundam Marker', 'assets/img/products/PK002.jpg', 'Bộ bút sơn marker để tô chi tiết và đi line cho mô hình.', 'GSI Creos', null, 'Sơn', '12 bút', null, 150000, 25, 5, false],
      [27, 5, 'PK003', 'Hộp trưng bày acrylic', 'assets/img/products/PK003.jpg', 'Hộp acrylic trong suốt chống bụi cho mô hình.', 'OEM', null, 'Acrylic', '20x20x30 cm', null, 90000, 15, 5, false],
      [28, 5, 'PK004', 'Đế trưng bày Action Base', 'assets/img/products/PK004.jpg', 'Đế trưng bày Action Base giúp tạo dáng mô hình ở nhiều góc.', 'Bandai', null, 'Nhựa', '15 cm', null, 60000, 20, 5, false],
      [29, 5, 'PK005', 'Keo dán nhựa Tamiya', 'assets/img/products/PK005.jpg', 'Keo dán nhựa chuyên dụng cho mô hình lắp ráp.', 'Tamiya', null, 'Dung môi', '40 ml', null, 25000, 40, 5, false],
      [30, 5, 'PK006', 'Bộ dũa và giấy nhám', 'assets/img/products/PK006.jpg', 'Bộ dũa và giấy nhám nhiều độ mịn để xử lý bề mặt.', 'OEM', null, 'Kim loại / giấy', 'Bộ 12 món', null, 45000, 30, 5, false]
    ],

    // [id, import_date, status, note, created_at, completed_at]
    import_receipts: [
      [1, '2026-08-01', 'completed', 'Nhập Gundam đợt 1', '2026-08-01 08:00', '2026-08-01 16:00'],
      [2, '2026-08-10', 'completed', 'Nhập figure và xe mô hình', '2026-08-10 08:00', '2026-08-10 16:00'],
      [3, '2026-09-01', 'completed', 'Nhập mô hình quân sự và phụ kiện', '2026-09-01 08:00', '2026-09-01 16:00'],
      [4, '2026-09-25', 'draft', 'Nhập bổ sung hàng sắp hết (phiếu nháp)', '2026-09-25 08:00', null]
    ],

    // [id, receipt_id, product_id, quantity, import_price]
    import_receipt_items: [
      [1, 1, 1, 20, 180000], [2, 1, 2, 15, 200000], [3, 1, 3, 8, 1100000],
      [4, 1, 4, 10, 520000], [5, 1, 5, 12, 210000], [6, 1, 6, 4, 1500000],
      [7, 2, 7, 10, 650000], [8, 2, 8, 8, 900000], [9, 2, 9, 3, 1100000],
      [10, 2, 10, 12, 480000], [11, 2, 11, 10, 520000], [12, 2, 12, 9, 500000],
      [13, 2, 13, 10, 350000], [14, 2, 14, 10, 340000], [15, 2, 15, 5, 1200000],
      [16, 2, 16, 12, 280000], [17, 2, 17, 8, 360000], [18, 2, 18, 9, 330000],
      [19, 3, 19, 6, 850000], [20, 3, 20, 10, 420000], [21, 3, 21, 8, 450000],
      [22, 3, 22, 7, 600000], [23, 3, 23, 9, 300000], [24, 3, 24, 5, 900000],
      [25, 3, 25, 30, 120000], [26, 3, 26, 25, 150000], [27, 3, 27, 15, 90000],
      [28, 3, 28, 20, 60000], [29, 3, 29, 40, 25000], [30, 3, 30, 30, 45000],
      [31, 4, 6, 10, 1450000], [32, 4, 9, 8, 1050000], [33, 4, 15, 6, 1180000]
    ],

    // [id, product_id, movement_date, movement_type, quantity, ref_type, ref_id]
    // Chỉ gồm phiếu nhập đã hoàn thành (1-3) và đơn đã xử lý / đã giao (1, 2, 3, 6)
    stock_movements: [
      [1, 1, '2026-08-01', 'import', 20, 'import_receipt', 1], [2, 2, '2026-08-01', 'import', 15, 'import_receipt', 1],
      [3, 3, '2026-08-01', 'import', 8, 'import_receipt', 1], [4, 4, '2026-08-01', 'import', 10, 'import_receipt', 1],
      [5, 5, '2026-08-01', 'import', 12, 'import_receipt', 1], [6, 6, '2026-08-01', 'import', 4, 'import_receipt', 1],
      [7, 7, '2026-08-10', 'import', 10, 'import_receipt', 2], [8, 8, '2026-08-10', 'import', 8, 'import_receipt', 2],
      [9, 9, '2026-08-10', 'import', 3, 'import_receipt', 2], [10, 10, '2026-08-10', 'import', 12, 'import_receipt', 2],
      [11, 11, '2026-08-10', 'import', 10, 'import_receipt', 2], [12, 12, '2026-08-10', 'import', 9, 'import_receipt', 2],
      [13, 13, '2026-08-10', 'import', 10, 'import_receipt', 2], [14, 14, '2026-08-10', 'import', 10, 'import_receipt', 2],
      [15, 15, '2026-08-10', 'import', 5, 'import_receipt', 2], [16, 16, '2026-08-10', 'import', 12, 'import_receipt', 2],
      [17, 17, '2026-08-10', 'import', 8, 'import_receipt', 2], [18, 18, '2026-08-10', 'import', 9, 'import_receipt', 2],
      [19, 1, '2026-08-15', 'export', -1, 'order', 1], [20, 4, '2026-08-15', 'export', -1, 'order', 1],
      [21, 7, '2026-08-20', 'export', -1, 'order', 2],
      [22, 19, '2026-09-01', 'import', 6, 'import_receipt', 3], [23, 20, '2026-09-01', 'import', 10, 'import_receipt', 3],
      [24, 21, '2026-09-01', 'import', 8, 'import_receipt', 3], [25, 22, '2026-09-01', 'import', 7, 'import_receipt', 3],
      [26, 23, '2026-09-01', 'import', 9, 'import_receipt', 3], [27, 24, '2026-09-01', 'import', 5, 'import_receipt', 3],
      [28, 25, '2026-09-01', 'import', 30, 'import_receipt', 3], [29, 26, '2026-09-01', 'import', 25, 'import_receipt', 3],
      [30, 27, '2026-09-01', 'import', 15, 'import_receipt', 3], [31, 28, '2026-09-01', 'import', 20, 'import_receipt', 3],
      [32, 29, '2026-09-01', 'import', 40, 'import_receipt', 3], [33, 30, '2026-09-01', 'import', 30, 'import_receipt', 3],
      [34, 13, '2026-09-05', 'export', -1, 'order', 3], [35, 25, '2026-09-05', 'export', -1, 'order', 3],
      [36, 6, '2026-09-22', 'export', -2, 'order', 6], [37, 9, '2026-09-22', 'export', -1, 'order', 6],
      [38, 15, '2026-09-22', 'export', -1, 'order', 6]
    ],

    // [id, customer_id, order_date, status, receiver_name, receiver_phone,
    //  ship_address_detail, ship_ward, ship_district, ship_city, payment_method, total_amount, updated_at]
    orders: [
      [1, 1, '2026-08-15 10:30', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 875000, null],
      [2, 2, '2026-08-20 14:05', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'transfer', 845000, null],
      [3, 1, '2026-09-05 09:15', 'processed', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 582000, null],
      [4, 3, '2026-09-12 16:40', 'new', 'Trần Văn Dũng', '0934567890', '25 Trần Hưng Đạo', 'Phường 7', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 1485000, null],
      [5, 2, '2026-09-18 11:20', 'cancelled', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 1260000, null],
      [6, 3, '2026-09-22 19:00', 'delivered', 'Lê Hoàng Cường', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', 'transfer', 6680000, null]
    ],

    // [id, order_id, product_id, quantity, unit_price]
    order_items: [
      [1, 1, 1, 1, 225000], [2, 1, 4, 1, 650000],
      [3, 2, 7, 1, 845000],
      [4, 3, 13, 1, 420000], [5, 3, 25, 1, 162000],
      [6, 4, 3, 1, 1485000],
      [7, 5, 8, 1, 1260000],
      [8, 6, 6, 2, 1875000], [9, 6, 9, 1, 1430000], [10, 6, 15, 1, 1500000]
    ]
  };

  global.DB_ENUMS = DB_ENUMS;
  global.DB_SCHEMA = DB_SCHEMA;
  global.DB_SEED = DB_SEED;
})(window);
